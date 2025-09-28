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
    | 'miss'
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
  miss: '#7c3aed',
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
    const bestGainPct = bestGain * 100;

    const isOnlyMove = lossVsBest <= 0.002;
    const losingToEqual = winBefore <= 0.3 && winAfter >= 0.45;
    const equalToWinning = winBefore >= 0.35 && winBefore <= 0.65 && winAfter >= 0.75;
    const swingSavesGame = bestGain >= 0.18 && winAfter >= 0.6;
    const greatCandidate =
      lossVsBest <= 0.02 &&
      (isOnlyMove || losingToEqual || equalToWinning || swingSavesGame || winChange >= 0.12);

    const sacrificeDrop = scoreDiff <= -150;
    const keepsPositionPlayable = winAfter >= 0.4;
    const notCrushingBefore = winBefore <= 0.85;
    const notLosingAfter = winAfter >= 0.35;
    const brilliantCandidate =
      lossVsBest <= 0.05 &&
      sacrificeDrop &&
      keepsPositionPlayable &&
      notCrushingBefore &&
      notLosingAfter;

    const missCandidate = winBest >= 0.75 && winAfter <= 0.65 && lossVsBest >= 0.1;

    let baseType: MoveEvaluation['type'];
    if (lossVsBest <= 0.0005) {
      baseType = 'best';
    } else if (lossVsBest <= 0.02) {
      baseType = 'excellent';
    } else if (lossVsBest <= 0.05) {
      baseType = 'good';
    } else if (lossVsBest <= 0.1) {
      baseType = 'inaccuracy';
    } else if (lossVsBest <= 0.2) {
      baseType = 'mistake';
    } else {
      baseType = 'blunder';
    }

    let type: MoveEvaluation['type'] = baseType;

    if (missCandidate) {
      type = 'miss';
    } else if (brilliantCandidate) {
      type = 'brilliant';
    } else if (greatCandidate) {
      type = 'great';
    }

    const color = MOVE_TYPE_COLORS[type] ?? '#64748b';
    const formatPct = (value: number) => `${value.toFixed(1)}%`;
    const formatSignedPct = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

    const description = (() => {
      switch (type) {
        case 'brilliant': {
          const swingText = formatSignedPct(winChangePct);
          return `Brilliant sacrifice. Expected points climb to ${formatPct(winAfterPct)} (${swingText}) while the move stays near-engine perfect (${formatPct(lossVsBestPct)} loss).`;
        }
        case 'great': {
          const liftText = formatSignedPct(winChangePct);
          const onlyMoveText = isOnlyMove ? ' Found the only playable option.' : '';
          return `Great move. Critical resource${onlyMoveText}—it costs ${formatPct(lossVsBestPct)} but shifts the game ${liftText}.`;
        }
        case 'best': {
          return `Best move. Expected points hold at ${formatPct(winAfterPct)} with no loss.`;
        }
        case 'excellent': {
          return `Excellent. Loses under 2% expected points (${formatPct(lossVsBestPct)}).`;
        }
        case 'good': {
          return `Good. Drops ${formatPct(lossVsBestPct)} expected points (within the 2–5% window).`;
        }
        case 'inaccuracy': {
          return `Inaccuracy. Gives back ${formatPct(lossVsBestPct)} of the expected result (5–10% range).`;
        }
        case 'mistake': {
          return `Mistake. Loses ${formatPct(lossVsBestPct)} expected points (10–20%).`;
        }
        case 'blunder': {
          return `Blunder! Expected points collapse by ${formatPct(lossVsBestPct)}.`;
        }
        case 'miss': {
          const missedSwing = formatPct(bestGainPct);
          return `Miss. Engine found a path to ${formatPct(winBestPct)} expected points, but this move settles for ${formatPct(winAfterPct)} (${missedSwing} left on the table).`;
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