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
}

export interface MoveEvaluation {
  type: 'brilliant' | 'critical' | 'best' | 'excellent' | 'okay' | 'inaccuracy' | 'mistake' | 'blunder' | 'theory';
  score: number;
  description: string;
  color: string;
}

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
      setCurrentAnalysis(prev => prev ? { ...prev, bestMove } : null);
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
    const adjustedBefore = isWhite ? beforeScore : -beforeScore;
    const adjustedAfter = isWhite ? afterScore : -afterScore;
    const adjustedBest = isWhite ? bestMoveScore : -bestMoveScore;
    
    const scoreDiff = adjustedAfter - adjustedBefore;
    const lossFromBest = adjustedBest - adjustedAfter;

    if (lossFromBest <= 10) {
      if (scoreDiff >= 100) {
        return {
          type: 'brilliant',
          score: scoreDiff,
          description: 'Brilliant move! Finds the best continuation.',
          color: '#1e40af'
        };
      }
      return {
        type: 'best',
        score: scoreDiff,
        description: 'Best move in the position.',
        color: '#059669'
      };
    } else if (lossFromBest <= 25) {
      return {
        type: 'excellent',
        score: scoreDiff,
        description: 'Excellent move. Very close to the best.',
        color: '#059669'
      };
    } else if (lossFromBest <= 50) {
      return {
        type: 'okay',
        score: scoreDiff,
        description: 'Good move. Maintains a reasonable position.',
        color: '#65a30d'
      };
    } else if (lossFromBest <= 100) {
      return {
        type: 'inaccuracy',
        score: scoreDiff,
        description: 'Inaccuracy. Not the most precise move.',
        color: '#d97706'
      };
    } else if (lossFromBest <= 250) {
      return {
        type: 'mistake',
        score: scoreDiff,
        description: 'Mistake. Gives opponent a significant advantage.',
        color: '#dc2626'
      };
    } else {
      if (Math.abs(adjustedBefore) > 300 || Math.abs(adjustedAfter) > 300) {
        return {
          type: 'critical',
          score: scoreDiff,
          description: 'Critical position. Precision required.',
          color: '#7c2d12'
        };
      }
      
      return {
        type: 'blunder',
        score: scoreDiff,
        description: 'Blunder! Major mistake that loses material or position.',
        color: '#991b1b'
      };
    }
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