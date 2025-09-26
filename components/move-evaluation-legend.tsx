'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  TrendingDown,
  XCircle,
  BookOpen,
  Brain
} from "lucide-react";

export const MoveEvaluationLegend: React.FC = () => {
  const evaluationTypes = [
    {
      type: 'brilliant',
      color: '#1e40af',
      icon: <Zap className="w-3 h-3" />,
      description: 'An outstanding move that finds the best continuation with deep calculation'
    },
    {
      type: 'critical',
      color: '#7c2d12',
      icon: <AlertTriangle className="w-3 h-3" />,
      description: 'A critical position where precision is required'
    },
    {
      type: 'best',
      color: '#059669',
      icon: <CheckCircle className="w-3 h-3" />,
      description: 'The best move in the position according to the engine'
    },
    {
      type: 'excellent',
      color: '#059669',
      icon: <Target className="w-3 h-3" />,
      description: 'An excellent move, very close to the best option'
    },
    {
      type: 'okay',
      color: '#65a30d',
      icon: <CheckCircle className="w-3 h-3" />,
      description: 'A good move that maintains a reasonable position'
    },
    {
      type: 'inaccuracy',
      color: '#d97706',
      icon: <TrendingDown className="w-3 h-3" />,
      description: 'Not the most precise move, but still playable'
    },
    {
      type: 'mistake',
      color: '#dc2626',
      icon: <XCircle className="w-3 h-3" />,
      description: 'A significant mistake that gives the opponent an advantage'
    },
    {
      type: 'blunder',
      color: '#991b1b',
      icon: <XCircle className="w-3 h-3" />,
      description: 'A major mistake that loses material or position'
    },
    {
      type: 'theory',
      color: '#6366f1',
      icon: <BookOpen className="w-3 h-3" />,
      description: 'A move that follows known opening or endgame theory'
    }
  ];

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Move Evaluation Guide
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {evaluationTypes.map((evalType) => (
            <div key={evalType.type} className="flex items-center gap-3 text-xs">
              <Badge
                variant="outline"
                style={{ 
                  backgroundColor: evalType.color + '20',
                  borderColor: evalType.color,
                  color: evalType.color
                }}
                className="min-w-[80px] justify-center"
              >
                <span className="flex items-center gap-1">
                  {evalType.icon}
                  {evalType.type.charAt(0).toUpperCase() + evalType.type.slice(1)}
                </span>
              </Badge>
              <span className="text-muted-foreground flex-1">
                {evalType.description}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
          <p><strong>How it works:</strong></p>
          <p className="mt-1">
            Each move is analyzed by Stockfish engine and compared to the best possible move. 
            The evaluation considers the change in position value (measured in centipawns) 
            and the strategic complexity of the position.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};