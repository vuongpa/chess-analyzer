import React, { forwardRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface PromoteProps {
  isOpen: boolean;
  hide: () => void;
  color: string;
  onPromote: (piece: string) => void;
}

const promotionPieces = ['q', 'r', 'n', 'b'];

const Promote = forwardRef<HTMLDivElement, PromoteProps>(({ isOpen, hide, color, onPromote }, ref) => {
  const handlePromotion = (piece: string) => {
    onPromote(piece);
    hide();
  };

  const pieces = promotionPieces.map((piece) => {
    const pieceClass = color === 'white' ? piece.toUpperCase() : piece;
    const pieceChar = color === 'white' 
      ? (piece === 'q' ? '♕' : piece === 'r' ? '♖' : piece === 'n' ? '♘' : '♗') 
      : (piece === 'q' ? '♛' : piece === 'r' ? '♜' : piece === 'n' ? '♞' : '♝');

    return (
      <div
        key={piece}
        className="w-16 h-16 flex items-center justify-center cursor-pointer hover:bg-accent"
        onClick={() => handlePromotion(piece)}
        data-piece={pieceClass}
      >
        <span className="text-4xl">{pieceChar}</span>
      </div>
    );
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && hide()}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-center">Choose a piece for promotion</DialogTitle>
        <div ref={ref} className="flex justify-center mt-4">{pieces}</div>
      </DialogContent>
    </Dialog>
  );
});

Promote.displayName = 'Promote';

export default Promote;