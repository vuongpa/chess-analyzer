export interface OpeningLine {
  eco: string;
  name: string;
  variation?: string;
  moves: string[];
}

export const OPENING_LINES: OpeningLine[] = [
  {
    eco: "C20",
    name: "King's Pawn Opening",
    variation: "King's Pawn Game",
    moves: ["e4", "e5"]
  },
  {
    eco: "C60",
    name: "Ruy Lopez",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"]
  },
  {
    eco: "C84",
    name: "Ruy Lopez",
    variation: "Closed",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7"]
  },
  {
    eco: "C50",
    name: "Italian Game",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"]
  },
  {
    eco: "C52",
    name: "Evans Gambit",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4"]
  },
  {
    eco: "C45",
    name: "Scotch Game",
    moves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4"]
  },
  {
    eco: "C30",
    name: "King's Gambit",
    moves: ["e4", "e5", "f4"]
  },
  {
    eco: "C29",
    name: "Vienna Game",
    moves: ["e4", "e5", "Nc3"]
  },
  {
    eco: "B20",
    name: "Sicilian Defense",
    moves: ["e4", "c5"]
  },
  {
    eco: "B90",
    name: "Sicilian Defense",
    variation: "Najdorf",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"]
  },
  {
    eco: "B70",
    name: "Sicilian Defense",
    variation: "Dragon",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6"]
  },
  {
    eco: "B22",
    name: "Sicilian Defense",
    variation: "Alapin",
    moves: ["e4", "c5", "c3"]
  },
  {
    eco: "B24",
    name: "Sicilian Defense",
    variation: "Closed",
    moves: ["e4", "c5", "Nc3", "Nc6", "g3"]
  },
  {
    eco: "C00",
    name: "French Defense",
    moves: ["e4", "e6", "d4", "d5"]
  },
  {
    eco: "C15",
    name: "French Defense",
    variation: "Winawer",
    moves: ["e4", "e6", "d4", "d5", "Nc3", "Bb4"]
  },
  {
    eco: "B10",
    name: "Caro-Kann Defense",
    moves: ["e4", "c6", "d4", "d5"]
  },
  {
    eco: "B12",
    name: "Caro-Kann Defense",
    variation: "Advance",
    moves: ["e4", "c6", "d4", "d5", "e5", "Bf5"]
  },
  {
    eco: "B07",
    name: "Pirc Defense",
    moves: ["e4", "d6", "d4", "Nf6", "Nc3", "g6"]
  },
  {
    eco: "B06",
    name: "Modern Defense",
    moves: ["e4", "g6", "d4", "Bg7"]
  },
  {
    eco: "B01",
    name: "Scandinavian Defense",
    moves: ["e4", "d5", "exd5", "Qxd5", "Nc3", "Qa5"]
  },
  {
    eco: "B02",
    name: "Alekhine's Defense",
    moves: ["e4", "Nf6", "e5", "Nd5", "d4", "d6"]
  },
  {
    eco: "D06",
    name: "Queen's Gambit",
    moves: ["d4", "d5", "c4"]
  },
  {
    eco: "D30",
    name: "Queen's Gambit Declined",
    moves: ["d4", "d5", "c4", "e6"]
  },
  {
    eco: "D20",
    name: "Queen's Gambit Accepted",
    moves: ["d4", "d5", "c4", "dxc4"]
  },
  {
    eco: "D10",
    name: "Slav Defense",
    moves: ["d4", "d5", "c4", "c6"]
  },
  {
    eco: "D43",
    name: "Semi-Slav Defense",
    moves: ["d4", "d5", "c4", "c6", "Nc3", "Nf6", "Nf3", "e6"]
  },
  {
    eco: "E60",
    name: "King's Indian Defense",
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6"]
  },
  {
    eco: "D85",
    name: "Grünfeld Defense",
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5"]
  },
  {
    eco: "E20",
    name: "Nimzo-Indian Defense",
    moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"]
  },
  {
    eco: "A56",
    name: "Benoni Defense",
    moves: ["d4", "Nf6", "c4", "c5", "d5", "e6"]
  },
  {
    eco: "A10",
    name: "English Opening",
    moves: ["c4"]
  },
  {
    eco: "A30",
    name: "English Opening",
    variation: "Symmetrical",
    moves: ["c4", "c5"]
  },
  {
    eco: "A13",
    name: "English Opening",
    variation: "Agincourt",
    moves: ["c4", "e6", "Nc3", "d5"]
  },
  {
    eco: "A04",
    name: "Reti Opening",
    moves: ["Nf3", "d5", "c4"]
  },
  {
    eco: "A03",
    name: "Bird's Opening",
    moves: ["f4", "d5"]
  },
  {
    eco: "A00",
    name: "Larsen's Opening",
    moves: ["b3", "d5"]
  },
  {
    eco: "A06",
    name: "Reti Opening",
    variation: "King's Indian Attack",
    moves: ["Nf3", "d5", "g3", "c5", "Bg2", "Nc6", "O-O", "e5"]
  },
  {
    eco: "A46",
    name: "Queen's Pawn Game",
    variation: "London System",
    moves: ["d4", "d5", "Nf3", "Nf6", "Bf4"]
  },
  {
    eco: "D05",
    name: "Queen's Pawn Game",
    variation: "Colle System",
    moves: ["d4", "d5", "Nf3", "Nf6", "e3"]
  },
  {
    eco: "E04",
    name: "Catalan Opening",
    moves: ["d4", "Nf6", "c4", "e6", "g3", "d5", "Bg2"]
  },
  {
    eco: "A45",
    name: "Trompowsky Attack",
    moves: ["d4", "Nf6", "Bg5"]
  },
  {
    eco: "D90",
    name: "Benoni Defense",
    variation: "Modern",
    moves: ["d4", "Nf6", "c4", "c5", "d5", "b5"]
  },
  {
    eco: "A57",
    name: "Benko Gambit",
    moves: ["d4", "Nf6", "c4", "c5", "d5", "b5"]
  },
  {
    eco: "A52",
    name: "Budapest Gambit",
    moves: ["d4", "Nf6", "c4", "e5"]
  },
  {
    eco: "C41",
    name: "Philidor Defense",
    moves: ["e4", "e5", "Nf3", "d6"]
  },
  {
    eco: "C42",
    name: "Petrov Defense",
    moves: ["e4", "e5", "Nf3", "Nf6"]
  },
  {
    eco: "C46",
    name: "Three Knights Game",
    moves: ["e4", "e5", "Nf3", "Nc6", "Nc3"]
  },
  {
    eco: "C48",
    name: "Four Knights Game",
    moves: ["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6"]
  },
  {
    eco: "C47",
    name: "Scotch Four Knights",
    moves: ["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6", "d4"]
  },
  {
    eco: "C55",
    name: "Italian Game",
    variation: "Two Knights Defense",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"]
  },
  {
    eco: "C53",
    name: "Giuoco Piano",
    variation: "Giuoco Pianissimo",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d3"]
  },
  {
    eco: "C44",
    name: "Scotch Gambit",
    moves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4"]
  },
  {
    eco: "B23",
    name: "Sicilian Defense",
    variation: "Closed",
    moves: ["e4", "c5", "Nc3"]
  },
  {
    eco: "C43",
    name: "Petrov Defense",
    variation: "Classical",
    moves: ["e4", "e5", "Nf3", "Nf6", "Nxe5", "d6", "Nf3", "Nxe4"]
  },
  {
    eco: "E20",
    name: "Nimzo-Indian Defense",
    variation: "Classical",
    moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4", "Qc2", "O-O"]
  },
  {
    eco: "E80",
    name: "King's Indian Defense",
    variation: "Classical",
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "Nf3", "O-O", "Be2", "e5", "O-O"]
  }
];
