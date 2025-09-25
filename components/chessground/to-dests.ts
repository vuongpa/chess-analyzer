import { Chess } from 'chess.js';
import type { Key } from 'chessground/types';

const toDests = (chess: Chess): Map<Key, Key[]> => {
  const dests = new Map();
  const moves = chess.moves({ verbose: true });
  for (const move of moves) {
    const from = move.from as Key;
    const to = move.to as Key;
    
    if (dests.has(from)) {
      dests.get(from).push(to);
    } else {
      dests.set(from, [to]);
    }
  }
  
  return dests;
};

export default toDests;