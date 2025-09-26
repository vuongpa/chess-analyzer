import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';
import Theme from './theme';
import Chessground from './chessground';
import useChessground from './use-chessground';
import toDests from './to-dests';
import useChess from './use-chess';
import Promote from './promote';
import useDisclosure from './use-disclosure';
import cgProps from './cg-props';
import audio from './audio';
import Advanced from './advanced';
import useOrientation from './use-orientation';
import { Chess, Square } from 'chess.js';
import { Key } from 'chessground/types';

export interface ChessboardComponentProps {
  fen?: string;
  orientation?: "white" | "black";
  readOnly?: boolean;
  viewOnly?: boolean;
  reset?: boolean;
  lastMove?: { from: string; to: string; promotion?: string };
  onMove?: (chess: Chess) => void;
  onFenChange?: (fen: string) => void;
  setPromoting?: (isPromoting: boolean) => void;
  className?: string;
}

import type { Api } from 'chessground/api';

interface ChessboardRef {
  board?: Api;
  undo: () => unknown;
  move: (from: string, to: string, promotion?: string) => unknown;
}

const Chessboard = forwardRef<ChessboardRef, ChessboardComponentProps>((props, ref) => {
  const { theme } = useChessground();
  const { isOpen, show, hide } = useDisclosure();
  const [orientation, flip] = useOrientation(props);
  const [selectedSquare, setSelectedSquare] = useState<Key | null>(null);

  const {
    chess,
    fen,
    turnColor,
    lastMove,
    promotion,
    onMove,
    onPromote,
    onUndo,
  } = useChess(props);

  const boardRef = useRef<{ board: Api | undefined }>(null);
  useImperativeHandle(ref, () => ({
    board: boardRef.current?.board,
    undo: onUndo,
    move: onMove,
  }));

  const handleMove = async (from: Key, to: Key) => {
    const move = onMove(from, to, promotion);
    if (!move) {
      show();
      return false;
    }

    if (theme.playSounds) {
      audio(theme.sounds);
    }
    if (typeof props.onMove === 'function') {
      await props.onMove(chess);
    }
    setSelectedSquare(null);
  };

  const handleSquareClick = (square: Key) => {
    console.log('handleSquareClick', square);
    const piece = chess.get(square as Square);
    const dests = toDests(chess);
    if (piece && dests.has(square)) {
      setSelectedSquare(square);
    } else if (selectedSquare && dests.get(selectedSquare)?.includes(square)) {
      if (!props.readOnly && !props.viewOnly) {
        handleMove(selectedSquare, square);
      } else {
        setSelectedSquare(null);
      }
    } else {
      setSelectedSquare(null);
    }
  };

  const getArrows = () => {
    if (!selectedSquare) return [];
    const dests = toDests(chess);
    const possibleMoves = dests.get(selectedSquare) || [];
    return possibleMoves.map(dest => ({
      orig: selectedSquare,
      dest,
      brush: 'blue'
    }));
  };

  const handlePromotion = async (promotion: string) => {
    const move = onPromote(promotion);
    if (!move) {
      return false;
    }

    if (theme.playSounds) {
      audio(theme.sounds);
    }
    if (typeof props.onMove === 'function') {
      await props.onMove(chess);
    }
  };

  useEffect(() => {
    if (typeof props.setPromoting === 'function') {
      props.setPromoting(isOpen);
    }
  }, [isOpen, props]);

  useEffect(() => {
    if (typeof props.onFenChange === 'function') {
      props.onFenChange(fen);
    }
  }, [fen, props]);

  useEffect(() => {
    setSelectedSquare(null);
  }, [fen]);

  return (
    <Theme>
      <div className="next-chessground container mx-auto">
        <div className={cn(
          'chessground',
          theme.highlight && 'highlight',
          props.className,
          theme.pieces,
          theme.board,
          theme.coordinates ? '' : 'coords-no',
        )}>
          <Chessground
            ref={boardRef}
            coordinates={theme.coordinates}
            onMove={handleMove}
            onSelect={handleSquareClick}
            fen={fen}
            turnColor={turnColor}
            lastMove={lastMove}
            orientation={orientation}
            drawable={{
              enabled: true,
              visible: true,
              autoShapes: getArrows(),
            }}
            movable={{ 
              dests: (props.readOnly || props.viewOnly) ? new Map() : toDests(chess),
              showDests: selectedSquare ? false : !props.readOnly && !props.viewOnly,
              color: (props.readOnly || props.viewOnly) ? undefined : turnColor
            }}
            {...cgProps(props)}
          />
          <Promote
            isOpen={isOpen}
            hide={hide}
            color={turnColor}
            onPromote={handlePromotion}
          />
        </div>
      </div>
    </Theme>
  );
});

Chessboard.displayName = 'Chessboard';

export default Chessboard;