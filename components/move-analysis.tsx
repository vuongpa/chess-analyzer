'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MoveEvaluation, AnalysisResult } from "@/hooks/use-stockfish";
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Target,
  Brain,
  BookOpen
} from "lucide-react";

interface MoveAnalysisProps {
  evaluation?: MoveEvaluation;
  analysis?: AnalysisResult;
  isAnalyzing?: boolean;
  moveNumber?: number;
  san?: string;
  isWhite?: boolean;
}

export const MoveAnalysis: React.FC<MoveAnalysisProps> = ({
  evaluation,
  analysis,
  isAnalyzing = false,
  moveNumber,
  san,
  isWhite = true
}) => {
  const getMoveIcon = (type: MoveEvaluation['type']) => {
    switch (type) {
      case 'brilliant':
        return <Zap className="w-4 h-4" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      case 'best':
        return <CheckCircle className="w-4 h-4" />;
      case 'excellent':
        return <Target className="w-4 h-4" />;
      case 'okay':
        return <CheckCircle className="w-4 h-4" />;
      case 'inaccuracy':
        return <TrendingDown className="w-4 h-4" />;
      case 'mistake':
        return <XCircle className="w-4 h-4" />;
      case 'blunder':
        return <XCircle className="w-4 h-4" />;
      case 'theory':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const formatScore = (score: number, scoreType: 'cp' | 'mate') => {
    if (scoreType === 'mate') {
      return score > 0 ? `#+${score}` : `#-${Math.abs(score)}`;
    }
    
    const pawnValue = score / 100;
    if (pawnValue > 0) {
      return `+${pawnValue.toFixed(2)}`;
    } else if (pawnValue < 0) {
      return pawnValue.toFixed(2);
    }
    return '0.00';
  };

  const getEvaluationBar = (score: number, scoreType: 'cp' | 'mate') => {
    if (scoreType === 'mate') {
      return score > 0 ? 100 : 0;
    }
    
    // Convert centipawns to percentage (capped at ±5 pawns = ±500cp)
    const normalized = Math.max(-500, Math.min(500, score));
    return ((normalized + 500) / 1000) * 100;
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 animate-pulse" />
            Analyzing Move...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="animate-pulse">
              <div className="h-2 bg-gray-200 rounded-full"></div>
            </div>
            <div className="text-sm text-muted-foreground">
              Stockfish is evaluating the position...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            {moveNumber && san && (
              <span className="text-muted-foreground">
                {isWhite ? `${moveNumber}.` : `${moveNumber}...`} {san}
              </span>
            )}
          </span>
          {evaluation && (
            <Badge 
              variant="outline"
              style={{ 
                backgroundColor: evaluation.color + '20',
                borderColor: evaluation.color,
                color: evaluation.color
              }}
              className="text-xs flex items-center gap-1"
            >
              {getMoveIcon(evaluation.type)}
              {evaluation.type.charAt(0).toUpperCase() + evaluation.type.slice(1)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Evaluation Description */}
        {evaluation && (
          <div className="text-sm text-muted-foreground">
            {evaluation.description}
          </div>
        )}
        
        {/* Position Analysis */}
        {analysis && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Position Evaluation</span>
                <span className="text-sm font-mono">
                  {formatScore(analysis.score, analysis.scoreType)}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Black</span>
                  <span>White</span>
                </div>
                <Progress 
                  value={getEvaluationBar(analysis.score, analysis.scoreType)}
                  className="h-3"
                />
              </div>
              
              {analysis.bestMove && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Best Move:</span>
                  <span className="font-mono font-medium">{analysis.bestMove}</span>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Depth:</span>
                  <span>{analysis.depth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nodes:</span>
                  <span>{analysis.nodes?.toLocaleString()}</span>
                </div>
              </div>
              
              {analysis.pv && analysis.pv.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Best Line:</div>
                  <div className="text-xs font-mono bg-muted p-2 rounded">
                    {analysis.pv.slice(0, 6).join(' ')}
                    {analysis.pv.length > 6 && '...'}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Score Gain/Loss */}
        {evaluation && Math.abs(evaluation.score) > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Score Change:</span>
              <div className="flex items-center gap-1">
                {evaluation.score > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <span 
                  className={`text-sm font-medium ${
                    evaluation.score > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {evaluation.score > 0 ? '+' : ''}{(evaluation.score / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};