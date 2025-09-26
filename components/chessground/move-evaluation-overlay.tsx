import React from 'react';
import { MoveEvaluation } from '@/hooks/use-stockfish';
import Image from 'next/image';

interface MoveEvaluationOverlayProps {
  evaluation?: MoveEvaluation;
  square?: string;
  orientation: 'white' | 'black';
}

const MoveEvaluationOverlay: React.FC<MoveEvaluationOverlayProps> = ({ evaluation, square, orientation }) => {
  if (!evaluation || !square) return null;

  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1]) - 1;  
  const cellPct = 12.5;
  const leftPct = orientation === 'white' ? file * cellPct : (7 - file) * cellPct;
  const topPct  = orientation === 'white' ? (7 - rank) * cellPct : rank * cellPct;

  const iconSizePct = 4.2;
  const paddingPct = 0.6; 

  const iconLeft = `calc(${leftPct + cellPct - iconSizePct - paddingPct}% )`;
  const iconTop  = `calc(${topPct + paddingPct}% )`;

  const iconMap: Record<MoveEvaluation['type'], string> = {
    brilliant: '/assets/icon/brilliant.svg',
    best: '/assets/icon/best.svg',
    excellent: '/assets/icon/excellent.svg',
    okay: '/assets/icon/okay.svg',
    inaccuracy: '/assets/icon/inaccuracy.svg',
    mistake: '/assets/icon/mistake.svg',
    blunder: '/assets/icon/blunder.svg',
    critical: '/assets/icon/critical.svg',
    theory: '/assets/icon/theory.svg'
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-50">
      <div
        style={{
          position: 'absolute',
          left: iconLeft,
          top: iconTop,
          width: iconSizePct + '%',
          aspectRatio: '1/1'
        }}
      >
        <Image
          src={iconMap[evaluation.type]}
          alt={evaluation.type}
          fill
          draggable={false}
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  );
};

export default MoveEvaluationOverlay;