import { useEffect, useRef, useState, useCallback } from 'react';

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
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStockfishMessage = useCallback((message: string) => {
    if (message.includes('uciok')) {
      // Send isready after uci
      workerRef.current?.postMessage({
        type: 'command',
        command: 'isready'
      });
    } else if (message.includes('readyok')) {
      setIsReady(true);
    } else if (message.startsWith('info')) {
      // Parse analysis info
      const analysis = parseAnalysisInfo(message);
      if (analysis) {
        setCurrentAnalysis(analysis);
      }
    } else if (message.startsWith('bestmove')) {
      // Analysis complete
      setIsAnalyzing(false);
      const bestMove = message.split(' ')[1];
      setCurrentAnalysis(prev => prev ? { ...prev, bestMove } : null);
    }
  }, []);

  useEffect(() => {
    // Initialize worker
    try {
      workerRef.current = new Worker('/stockfish.worker.js');
      
      workerRef.current.onmessage = (e) => {
        const { type, data, error } = e.data;
        
        switch (type) {
          case 'ready':
            setIsReady(true);
            setError(null);
            // Send UCI initialization
            workerRef.current?.postMessage({
              type: 'command',
              command: 'uci'
            });
            break;
            
          case 'message':
            handleStockfishMessage(data);
            break;
            
          case 'error':
            setError(error);
            setIsAnalyzing(false);
            break;
        }
      };
      
      workerRef.current.onerror = (error) => {
        setError('Worker error: ' + error.message);
        setIsAnalyzing(false);
      };
      
      // Initialize Stockfish
      workerRef.current.postMessage({ type: 'init' });
      
    } catch (error) {
      setError('Failed to create worker: ' + (error as Error).message);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
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
    if (!workerRef.current || !isReady) {
      setError('Stockfish not ready');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    setCurrentAnalysis(null);
    
    workerRef.current.postMessage({
      type: 'analyze',
      payload: { fen, depth }
    });
  }, [isReady]);

  const stopAnalysis = useCallback(() => {
    if (workerRef.current && isAnalyzing) {
      workerRef.current.postMessage({ type: 'stop' });
      setIsAnalyzing(false);
    }
  }, [isAnalyzing]);

  const evaluateMove = useCallback((
    beforeScore: number,
    afterScore: number,
    isWhite: boolean,
    bestMoveScore: number
  ): MoveEvaluation => {
    // Adjust scores based on perspective (white = positive, black = negative)
    const adjustedBefore = isWhite ? beforeScore : -beforeScore;
    const adjustedAfter = isWhite ? afterScore : -afterScore;
    const adjustedBest = isWhite ? bestMoveScore : -bestMoveScore;
    
    const scoreDiff = adjustedAfter - adjustedBefore;
    const lossFromBest = adjustedBest - adjustedAfter;

    // Thresholds for move classification (in centipawns)
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
      // Check for critical moves (forced/tactical)
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