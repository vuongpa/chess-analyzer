import { useEffect, useRef, useState, useCallback } from 'react';
import { loadStockfish, StockfishEngine } from '@/lib/stockfish/load-engine';

export interface AnalysisResult {
  depth: number;
  score: number;
  scoreType: 'cp' | 'mate';
  bestMove: string;
  pv: string[];
  nodes: number;
  nps: number;
  time: number;
  bestMoveFromSquare?: string;
  bestMoveToSquare?: string;
}

export interface MoveEvaluation {
  type:
    | 'brilliant'
    | 'great'
    | 'best'
    | 'excellent'
    | 'good'
    | 'inaccuracy'
    | 'mistake'
    | 'blunder'
    | 'missed_win'
    | 'theory';
  score: number;
  description: string;
  color: string;
  centipawnLoss: number;
  expectedLoss: number;
  winProbabilityBefore: number;
  winProbabilityAfter: number;
  winProbabilityBest: number;
  winProbabilityChange: number;
}

const WIN_PROB_LOGISTIC_SCALE = 0.00368208;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const cpToWinProbability = (cp: number) => {
  const logistic = 2 / (1 + Math.exp(-WIN_PROB_LOGISTIC_SCALE * cp)) - 1;
  return clamp01(0.5 + 0.5 * logistic);
};

const MOVE_TYPE_COLORS: Record<MoveEvaluation['type'], string> = {
  brilliant: '#1e3a8a',
  great: '#0f766e',
  best: '#059669',
  excellent: '#14b8a6',
  good: '#65a30d',
  inaccuracy: '#d97706',
  mistake: '#dc2626',
  blunder: '#991b1b',
  missed_win: '#7c3aed',
  theory: '#6366f1'
};

export const useStockfish = () => {
  const engineRef = useRef<StockfishEngine | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStockfishMessage = useCallback((message: string) => {
    if (message.includes('uciok')) {
      engineRef.current?.send('isready');
    } else if (message.includes('readyok')) {
      setIsReady(true);
    } else if (message.startsWith('info')) {
      const analysis = parseAnalysisInfo(message);
      if (analysis) {
        setCurrentAnalysis(analysis);
      }
    } else if (message.startsWith('bestmove')) {
      setIsAnalyzing(false);
      const bestMove = message.split(' ')[1];
      const fromSquare = bestMove?.substring(0, 2);
      const toSquare = bestMove?.substring(2, 4);
      setCurrentAnalysis(prev => prev ? { 
        ...prev, 
        bestMove,
        bestMoveFromSquare: fromSquare,
        bestMoveToSquare: toSquare
      } : null);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let cancelled = false;

    try {
      const engine = loadStockfish();
      engineRef.current = engine;

      engine.stream = (line: string) => {
        if (!cancelled) {
          handleStockfishMessage(line);
        }
      };

      engine.onError = (errorEvent) => {
        if (cancelled) return;
        const message =
          errorEvent instanceof ErrorEvent
            ? errorEvent.message
            : (errorEvent as Error)?.message || 'Worker error occurred';
        setError('Worker error: ' + message);
        setIsAnalyzing(false);
      };

      setError(null);
      setIsReady(false);
      engine.send('uci');
    } catch (error) {
      if (!cancelled) {
        setError('Failed to load Stockfish: ' + (error as Error).message);
      }
    }

    return () => {
      cancelled = true;
      if (engineRef.current) {
        engineRef.current.quit();
        engineRef.current = null;
      }
    };
  }, [handleStockfishMessage]);

  const parseAnalysisInfo = (info: string): AnalysisResult | null => {
    const parts = info.split(' ');
    const result: Partial<AnalysisResult> = {};
    
    for (let i = 0; i < parts.length; i++) {
      switch (parts[i]) {
        case 'depth':
          result.depth = parseInt(parts[i + 1]);
          break;
        case 'score':
          if (parts[i + 1] === 'cp') {
            result.scoreType = 'cp';
            result.score = parseInt(parts[i + 2]);
          } else if (parts[i + 1] === 'mate') {
            result.scoreType = 'mate';
            result.score = parseInt(parts[i + 2]);
          }
          break;
        case 'nodes':
          result.nodes = parseInt(parts[i + 1]);
          break;
        case 'nps':
          result.nps = parseInt(parts[i + 1]);
          break;
        case 'time':
          result.time = parseInt(parts[i + 1]);
          break;
        case 'pv':
          result.pv = parts.slice(i + 1);
          break;
      }
    }
    
    if (result.depth !== undefined && result.score !== undefined) {
      return result as AnalysisResult;
    }
    
    return null;
  };

  const analyzePosition = useCallback((fen: string, depth: number = 15) => {
    if (!engineRef.current || !isReady) {
      setError('Stockfish not ready');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    setCurrentAnalysis(null);
    
    engineRef.current.send(`position fen ${fen}`);
    engineRef.current.send(`go depth ${depth}`);
  }, [isReady]);

  const stopAnalysis = useCallback(() => {
    if (engineRef.current && isAnalyzing) {
      engineRef.current.stopMoves();
      engineRef.current.send('stop');
      setIsAnalyzing(false);
    }
  }, [isAnalyzing]);

  const evaluateMove = useCallback((
    beforeScore: number,
    afterScore: number,
    isWhite: boolean,
    bestMoveScore: number
  ): MoveEvaluation => {
    const orient = (score: number) => (isWhite ? score : -score);
    const adjustedBefore = orient(beforeScore);
    const adjustedAfter = orient(afterScore);
    const adjustedBest = orient(Number.isFinite(bestMoveScore) ? bestMoveScore : afterScore);

    const scoreDiff = adjustedAfter - adjustedBefore;
    const centipawnLoss = Math.max(0, adjustedBest - adjustedAfter);

    const winBefore = cpToWinProbability(adjustedBefore);
    const winAfter = cpToWinProbability(adjustedAfter);
    const winBest = cpToWinProbability(adjustedBest);

    const winChange = winAfter - winBefore;
    const bestGain = winBest - winBefore;
    const lossVsBest = Math.max(0, winBest - winAfter);

    const winAfterPct = winAfter * 100;
    const winBestPct = winBest * 100;
    const winChangePct = winChange * 100;
    const lossVsBestPct = lossVsBest * 100;

    const turnedAround = winBefore <= 0.35 && winAfter >= 0.55;
    const comebackSwing = winBefore <= 0.25 && winAfter >= 0.6;
    const longTermLift = winChange >= 0.22 || bestGain >= 0.28;
    const decisiveSwing = winChange >= 0.30 || bestGain >= 0.35 || comebackSwing;
    const isOnlyMove = lossVsBest <= 0.002;
    const quietFinish = Math.abs(scoreDiff) <= 50;
    const sacrificeIndicator = scoreDiff < 0 || quietFinish;
    const brilliantCandidate =
      isOnlyMove &&
      decisiveSwing &&
      (sacrificeIndicator || winChange >= 0.35);
    const greatCandidate =
      (isOnlyMove && (winChange >= 0.15 || bestGain >= 0.2)) ||
      (lossVsBest <= 0.01 && (turnedAround || longTermLift));
    const missedWin = winBest >= 0.9 && winAfter <= 0.7 && lossVsBest >= 0.15;

    let type: MoveEvaluation['type'];

    if (missedWin) {
      type = 'missed_win';
    } else if (brilliantCandidate) {
      type = 'brilliant';
    } else if (lossVsBest <= 0.003) {
      type = isOnlyMove && (winChange >= 0.12 || bestGain >= 0.16) ? 'great' : 'best';
    } else if (greatCandidate) {
      type = 'great';
    } else if (lossVsBest <= 0.01) {
      type = 'excellent';
    } else if (lossVsBest <= 0.03) {
      type = 'good';
    } else if (lossVsBest <= 0.08) {
      type = 'inaccuracy';
    } else if (lossVsBest <= 0.18) {
      type = 'mistake';
    } else {
      type = 'blunder';
    }

    const color = MOVE_TYPE_COLORS[type] ?? '#64748b';
    const formatPct = (value: number) => `${value.toFixed(1)}%`;
    const formatSignedPct = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

    const description = (() => {
      switch (type) {
        case 'brilliant': {
          const swingText = formatPct(Math.abs(winChangePct));
          return `Brilliant! Only move in the position, a quiet/sacrificial idea that lifts win odds by ${swingText}.`;
        }
        case 'great': {
          const liftText = formatSignedPct(winChangePct);
          return `Great move. Keeps near-perfect play with ${formatPct(lossVsBestPct)} loss and shifts your outlook ${liftText}.`;
        }
        case 'best': {
          return `Best move. Expected score remains ${formatPct(winAfterPct)}.`;
        }
        case 'excellent': {
          return `Excellent. Within ${formatPct(lossVsBestPct)} of optimal—precise but not the sole winning route.`;
        }
        case 'good': {
          return `Solid choice. Drops ${formatPct(lossVsBestPct)} of the expected score.`;
        }
        case 'inaccuracy': {
          return `Inaccuracy. Gives back ${formatPct(lossVsBestPct)} of the expected result.`;
        }
        case 'mistake': {
          return `Mistake. Expected score falls by ${formatPct(lossVsBestPct)} compared to best.`;
        }
        case 'blunder': {
          return `Blunder! Expected score collapses by ${formatPct(lossVsBestPct)}.`;
        }
        case 'missed_win': {
          return `Missed win. Best line promised ${formatPct(winBestPct)} but this move leaves only ${formatPct(winAfterPct)}.`;
        }
        default:
          return 'Move evaluation unavailable.';
      }
    })();

    return {
      type,
      score: scoreDiff,
      centipawnLoss,
      expectedLoss: lossVsBest,
      winProbabilityBefore: winBefore,
      winProbabilityAfter: winAfter,
      winProbabilityBest: winBest,
      winProbabilityChange: winChange,
      description,
      color
    };
  }, []);

  return {
    isReady,
    isAnalyzing,
    currentAnalysis,
    error,
    analyzePosition,
    stopAnalysis,
    evaluateMove
  };
};