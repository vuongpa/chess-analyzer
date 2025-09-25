import { useEffect, useState } from 'react';
import { Chess, validateFen, Move } from 'chess.js';

export const initialFen =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export interface ChessMoveProps {
  from: string;
  to: string;
  promotion?: string;
}

export interface ChessProps {
  fen?: string;
  orientation?: 'white' | 'black';
  readOnly?: boolean;
  viewOnly?: boolean;
  animation?: boolean;
  reset?: boolean;
  onMove?: (chess: Chess, move: Move) => void;
  onFenChange?: (fen: string) => void;
  setPromoting?: (isPromoting: boolean) => void;
  lastMove?: { from: string; to: string; promotion?: string };
}

const useChess = (props: ChessProps) => {
  const validInitialFen =
    props.fen && validateFen(props.fen).ok ? props.fen : initialFen;

  const [fen, setFen] = useState(validInitialFen);
  const [chess] = useState(() => new Chess(validInitialFen));

  useEffect(() => {
    if (props.fen && validateFen(props.fen).ok) {
      chess.load(props.fen);
      setFen(chess.fen());
    } else if (props.reset) {
      chess.load(initialFen);
      setFen(initialFen);
    }
  }, [props.fen, props.reset]);

  useEffect(() => {
    props.onFenChange?.(fen);
  }, [fen]);

  const turnColor: 'white' | 'black' = chess.turn() === 'w' ? 'white' : 'black';
  const orientation = props.orientation || 'white';

  const history = chess.history({ verbose: true });
  const lastMove =
    history.length > 0
      ? [history[history.length - 1].from, history[history.length - 1].to]
      : [];

  const onMove = (from: string, to: string, promotion?: string) => {
    try {
      const move = chess.move({ from, to, promotion });
      if (move) {
        setFen(chess.fen());
        props.onMove?.(chess, move);
        return move;
      }
      return false;
    } catch {
      return false;
    }
  };

  const onPromote = (promotion: string) => {
    if (lastMove.length === 2) {
      return onMove(lastMove[0], lastMove[1], promotion);
    }
    return false;
  };

  const onUndo = () => {
    const undone = chess.undo();
    if (undone) {
      setFen(chess.fen());
      return undone;
    }
    return null;
  };
  
  const promotion = props.lastMove && props.lastMove.promotion;

  return {
    chess,
    fen,
    turnColor,
    lastMove,
    orientation,
    onMove,
    onPromote,
    onUndo,
    promotion
  };
};

export default useChess;
