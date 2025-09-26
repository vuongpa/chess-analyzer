'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoveEvaluation } from "@/hooks/use-stockfish";
import { BarChart2 } from "lucide-react";

interface GameEvaluationChartProps {
  evaluations: (MoveEvaluation | null)[];
  currentMove: number;
  onMoveClick?: (moveIndex: number) => void;
}

export const GameEvaluationChart: React.FC<GameEvaluationChartProps> = ({
  evaluations,
  currentMove,
  onMoveClick
}) => {
  const maxHeight = 100;
  const centerLine = maxHeight / 2;
  
  const getBarHeight = (evaluation: MoveEvaluation | null): number => {
    if (!evaluation) return centerLine;
    
    // Convert score to visual height (scale: ±300 cp = full bar)
    const clampedScore = Math.max(-300, Math.min(300, evaluation.score));
    const normalizedScore = clampedScore / 300; // -1 to 1
    
    return centerLine - (normalizedScore * centerLine);
  };

  const getBarColor = (evaluation: MoveEvaluation | null): string => {
    if (!evaluation) return '#6b7280';
    return evaluation.color;
  };

  const getMoveTypeStats = () => {
    const stats: Record<string, number> = {
      brilliant: 0,
      critical: 0,
      best: 0,
      excellent: 0,
      okay: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
      theory: 0
    };

    evaluations.forEach(evaluation => {
      if (evaluation) {
        stats[evaluation.type]++;
      }
    });

    return stats;
  };

  const stats = getMoveTypeStats();
  const totalMoves = evaluations.filter(evaluation => evaluation !== null).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart2 className="w-4 h-4" />
          Game Evaluation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Evaluation Chart */}
        <div className="relative bg-muted rounded p-2">
          {/* Center line (equal position) */}
          <div 
            className="absolute left-0 right-0 border-t border-dashed border-muted-foreground/30"
            style={{ top: `${centerLine}px` }}
          />
          
          {/* Score labels */}
          <div className="absolute left-0 top-0 text-xs text-muted-foreground">+3</div>
          <div className="absolute left-0 text-xs text-muted-foreground" style={{ top: `${centerLine - 8}px` }}>0</div>
          <div className="absolute left-0 bottom-0 text-xs text-muted-foreground">-3</div>
          
          {/* Evaluation bars */}
          <div className="flex items-end gap-0.5 ml-6" style={{ height: `${maxHeight}px` }}>
            {evaluations.map((evaluation, index) => (
              <div
                key={index}
                className={`relative min-w-[3px] cursor-pointer hover:opacity-70 transition-opacity ${
                  index === currentMove ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  height: `${Math.abs(getBarHeight(evaluation) - centerLine)}px`,
                  backgroundColor: getBarColor(evaluation),
                  marginTop: evaluation && evaluation.score >= 0 
                    ? `${getBarHeight(evaluation)}px` 
                    : `${centerLine}px`
                }}
                onClick={() => onMoveClick?.(index)}
                title={evaluation 
                  ? `Move ${Math.floor(index / 2) + 1}: ${evaluation.type} (${(evaluation.score / 100).toFixed(2)})`
                  : `Move ${Math.floor(index / 2) + 1}`
                }
              />
            ))}
          </div>
        </div>

        {/* Move Statistics */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Move Quality Statistics</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {Object.entries(stats).map(([type, count]) => {
              if (count === 0) return null;
              
              const percentage = totalMoves > 0 ? ((count / totalMoves) * 100).toFixed(1) : '0';
              
              return (
                <div key={type} className="flex justify-between">
                  <span className="capitalize">{type}:</span>
                  <span>{count} ({percentage}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Summary */}
        <div className="pt-2 border-t text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Total Moves:</span>
            <span>{totalMoves}</span>
          </div>
          <div className="flex justify-between">
            <span>Accuracy:</span>
            <span>
              {totalMoves > 0 
                ? (((stats.brilliant + stats.best + stats.excellent + stats.okay) / totalMoves) * 100).toFixed(1)
                : '0'
              }%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};