'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MoveEvaluation } from "@/hooks/use-stockfish";
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  TrendingDown,
  XCircle,
  BookOpen,
  Brain,
  Sparkles,
  ThumbsUp
} from "lucide-react";

export const MoveEvaluationLegend: React.FC = () => {
  const evaluationTypes: Array<{
    type: MoveEvaluation['type'];
    color: string;
    icon: React.ReactNode;
    label: string;
    description: string;
  }> = [
    {
      type: 'brilliant',
      color: '#1e3a8a',
      icon: <Zap className="w-3 h-3" />,
      label: 'Brilliant',
      description: 'Sacrificial but sound. Keeps a strong evaluation while giving up material.'
    },
    {
      type: 'great',
      color: '#0f766e',
      icon: <Sparkles className="w-3 h-3" />,
      label: 'Great Move',
      description: 'Only move or tide-turning resource; costs ≤2% expected points.'
    },
    {
      type: 'best',
      color: '#059669',
      icon: <CheckCircle className="w-3 h-3" />,
      label: 'Best Move',
      description: 'Zero expected-point loss—matches the engine exactly.'
    },
    {
      type: 'excellent',
      color: '#14b8a6',
      icon: <Target className="w-3 h-3" />,
      label: 'Excellent',
      description: 'Within 0–2% of optimal expected points.'
    },
    {
      type: 'good',
      color: '#65a30d',
      icon: <ThumbsUp className="w-3 h-3" />,
      label: 'Good',
      description: 'Within 2–5% of optimal expected points.'
    },
    {
      type: 'miss',
      color: '#7c3aed',
      icon: <AlertTriangle className="w-3 h-3" />,
      label: 'Miss',
      description: 'Failed to convert an opponent mistake—leaves large winning chances unused.'
    },
    {
      type: 'inaccuracy',
      color: '#d97706',
      icon: <TrendingDown className="w-3 h-3" />,
      label: 'Inaccuracy',
      description: 'Costs roughly 5–10% expected points.'
    },
    {
      type: 'mistake',
      color: '#dc2626',
      icon: <XCircle className="w-3 h-3" />,
      label: 'Mistake',
      description: 'Drops 10–20% of your expected result.'
    },
    {
      type: 'blunder',
      color: '#991b1b',
      icon: <XCircle className="w-3 h-3" />,
      label: 'Blunder',
      description: 'Catastrophic mistake (20%+ expected-point collapse).'
    },
    {
      type: 'theory',
      color: '#6366f1',
      icon: <BookOpen className="w-3 h-3" />,
      label: 'Theory',
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
                  {evalType.label}
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
            Each move is analyzed by Stockfish and converted into expected score (win probability). 
            Labels reflect how much win chance is lost against the engine recommendation and highlight
            special cases like finding the only move or missing a forced win.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};