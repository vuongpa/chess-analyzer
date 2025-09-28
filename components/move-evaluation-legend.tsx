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
      description: 'Only winning move with a quiet/sacrificial idea that surges win odds by ~30%+'
    },
    {
      type: 'best',
      color: '#059669',
      icon: <CheckCircle className="w-3 h-3" />,
      label: 'Best Move',
  description: 'Matches the engine recommendation (≤0.3% expected score loss)'
    },
    {
      type: 'great',
      color: '#0f766e',
      icon: <Sparkles className="w-3 h-3" />,
      label: 'Great Move',
  description: 'Powerful alternative (often the only resource, big win-chance lift)'
    },
    {
      type: 'excellent',
      color: '#14b8a6',
      icon: <Target className="w-3 h-3" />,
      label: 'Excellent',
  description: 'Minor slip (0.3–1% expected score loss)'
    },
    {
      type: 'good',
      color: '#65a30d',
      icon: <ThumbsUp className="w-3 h-3" />,
      label: 'Good',
  description: 'Playable choice (1–3% expected loss)'
    },
    {
      type: 'missed_win',
      color: '#7c3aed',
      icon: <AlertTriangle className="w-3 h-3" />,
      label: 'Missed Win',
      description: 'Best move secured a winning advantage; this line drops at least 15%'
    },
    {
      type: 'inaccuracy',
      color: '#d97706',
      icon: <TrendingDown className="w-3 h-3" />,
      label: 'Inaccuracy',
  description: 'Noticeable drop (3–8% expected loss)'
    },
    {
      type: 'mistake',
      color: '#dc2626',
      icon: <XCircle className="w-3 h-3" />,
      label: 'Mistake',
  description: 'Serious error (8–18% expected loss)'
    },
    {
      type: 'blunder',
      color: '#991b1b',
      icon: <XCircle className="w-3 h-3" />,
      label: 'Blunder',
      description: 'Catastrophic mistake (≥35% expected loss)'
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