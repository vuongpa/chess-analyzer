import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { Chessground as ChessgroundLib } from 'chessground';
import type { Api } from 'chessground/api';
import type { Config } from 'chessground/config';
import { Key } from 'chessground/types';

interface ChessgroundProps extends Partial<Config> {
  width?: string | number;
  height?: string | number;
  coordinates?: boolean;
  className?: string;
  children?: React.ReactNode;
  onMove?: (orig: Key, dest: Key, capturedPiece?: unknown) => void;
  onSelect?: (square: Key) => void;
}

const Chessground = forwardRef<{ board: Api | undefined }, ChessgroundProps>(
  (props, ref) => {
    const boardRef = useRef<HTMLDivElement>(null);
    const board = useRef<Api | undefined>(undefined);

    useImperativeHandle(ref, () => ({
      board: board.current,
    }));

    useEffect(() => {
      if (boardRef.current) {
        const config: Config = {
          fen: props.fen,
          orientation: props.orientation,
          turnColor: props.turnColor,
          check: props.check,
          lastMove: props.lastMove,
          coordinates: props.coordinates,
          viewOnly: props.viewOnly,
          movable: props.movable,
          drawable: props.drawable,
          events: {
            select: props.onSelect,
          },
        };
        
        board.current = ChessgroundLib(boardRef.current, config);
      }
      
      return () => {
        if (board.current) {
          board.current.destroy();
        }
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (board.current) {
        board.current.set({
          fen: props.fen,
          orientation: props.orientation,
          turnColor: props.turnColor,
          check: props.check,
          lastMove: props.lastMove,
          coordinates: props.coordinates,
          viewOnly: props.viewOnly,
          drawable: props.drawable,
          events: {
            select: props.onSelect,
          },
        });
      }
    }, [
      props.fen,
      props.orientation,
      props.turnColor,
      props.check,
      props.lastMove,
      props.coordinates,
      props.viewOnly,
      props.onSelect,
      props.drawable,
    ]);

    useEffect(() => {
      if (board.current && props.movable) {
        board.current.set({
          movable: {
            ...board.current.state.movable,
            dests: props.movable.dests as Map<Key, Key[]>,
            color: props.movable.color || (props.turnColor === 'white' ? 'white' : 'black'),
            events: {
              after: props.onMove,
            },
          },
        });
      }
     
    }, [props.movable, props.onMove, props.turnColor]);

    const width = props.width || '100%';
    const height = props.height || '100%';

    return (
      <div
        ref={boardRef}
        style={{ width, height }}
        className={props.className}
      />
    );
  }
);

Chessground.displayName = 'Chessground';

export default Chessground;