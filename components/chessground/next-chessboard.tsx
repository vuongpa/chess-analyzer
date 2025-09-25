import React, { forwardRef } from 'react';
import Chessboard from './chessboard';
import type { ChessboardComponentProps } from './chessboard';

export type NextChessboardProps = ChessboardComponentProps;

const NextChessboard = forwardRef<React.ElementRef<typeof Chessboard>, NextChessboardProps>((props, ref) => {
  return (
    <div className="next-chessboard-container w-full h-full">
      <Chessboard {...props} ref={ref} />
    </div>
  );
});

NextChessboard.displayName = 'NextChessboard';

export default NextChessboard;