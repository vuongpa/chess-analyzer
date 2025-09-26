"use client";

import { NextChessboard } from "@/components/chessground";
import { DefaultLayout } from "@/components/default-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoveAnalysis } from "@/components/move-analysis";
import { GameEvaluationChart } from "@/components/game-evaluation-chart";
import { useStockfish, MoveEvaluation } from "@/hooks/use-stockfish";
import { Chess } from "chess.js";
import {
  BarChart2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pause,
  Play,
  RefreshCcw,
  Zap,
  AlertCircle,
} from "lucide-react";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";

interface MoveHistory {
  san: string;
  fen: string;
  move: {
    from: string;
    to: string;
    color: string;
    flags: string;
    piece: string;
    san: string;
    lan: string;
  };
  turn: "w" | "b";
  moveNumber: number;
}

export default function AnalysisPage() {
  const [chessInstance] = useState<Chess>(new Chess());
  const [fen, setFen] = useState("start");
  const [pgn, setPgn] = useState("");
  const [history, setHistory] = useState<MoveHistory[]>([]);
  const [currentMove, setCurrentMove] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [orientation, setOrientation] = useState<"white" | "black">("white");

  const {
    isReady,
    isAnalyzing,
    currentAnalysis,
    analyzePosition,
    error: stockfishError,
  } = useStockfish();

  const [moveEvaluations, setMoveEvaluations] = useState<
    (MoveEvaluation | null)[]
  >([]);
  const [isAnalyzingGame, setIsAnalyzingGame] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const loadPgn = useCallback(
    (pgnContent: string) => {
      try {
        chessInstance.loadPgn(pgnContent);
        setPgn(pgnContent);
        const moves = [];
        const tempChess = new Chess();

        for (const move of chessInstance.history({ verbose: true })) {
          tempChess.move(move);
          const fen = tempChess.fen();
          const turn = tempChess.turn();
          const moveNumber = Math.floor(
            (tempChess.moveNumber() + (turn === "b" ? 0 : 1)) / 2
          );

          moves.push({
            san: move.san,
            fen,
            move,
            turn,
            moveNumber,
          });
        }

        setHistory(moves);
        setFen(tempChess.fen());
        setMoveEvaluations(new Array(moves.length).fill(null));
        setOrientation(tempChess.turn() === "w" ? "black" : "white");
      } catch (error) {
        console.error("Error loading PGN:", error);
      }
    },
    [chessInstance]
  );

  const analyzeGame = async () => {
    if (!isReady || history.length === 0) return;

    setIsAnalyzingGame(true);
    setAnalysisProgress(0);

    const evaluations: (MoveEvaluation | null)[] = new Array(
      history.length
    ).fill(null);

    for (let i = 0; i < history.length; i++) {
      setAnalysisProgress(((i + 1) / history.length) * 100);

      const mockEvaluation = createMockEvaluation();
      evaluations[i] = mockEvaluation;

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setMoveEvaluations(evaluations);
    setIsAnalyzingGame(false);
  };

  const createMockEvaluation = (): MoveEvaluation => {
    const rand = Math.random();
    const types: ("best" | "excellent" | "okay" | "inaccuracy" | "mistake")[] =
      ["best", "excellent", "okay", "inaccuracy", "mistake"];

    if (rand < 0.05) {
      return {
        type: "brilliant",
        score: 150,
        description: "Brilliant move! Finds the best continuation.",
        color: "#1e40af",
      };
    } else if (rand < 0.1) {
      return {
        type: "blunder",
        score: -300,
        description: "Blunder! Major mistake that loses material or position.",
        color: "#991b1b",
      };
    }

    const type = types[Math.floor(rand * types.length)];
    const scoreMap: Record<typeof type, number> = {
      best: Math.random() * 50,
      excellent: Math.random() * 100 - 25,
      okay: Math.random() * 100 - 50,
      inaccuracy: Math.random() * -150 - 50,
      mistake: Math.random() * -200 - 100,
    };

    const colorMap: Record<typeof type, string> = {
      best: "#059669",
      excellent: "#059669",
      okay: "#65a30d",
      inaccuracy: "#d97706",
      mistake: "#dc2626",
    };

    const descriptionMap: Record<typeof type, string> = {
      best: "Best move in the position.",
      excellent: "Excellent move. Very close to the best.",
      okay: "Good move. Maintains a reasonable position.",
      inaccuracy: "Inaccuracy. Not the most precise move.",
      mistake: "Mistake. Gives opponent a significant advantage.",
    };

    return {
      type: type,
      score: scoreMap[type],
      description: descriptionMap[type],
      color: colorMap[type],
    };
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      chessInstance.reset();
      const storedPgn = localStorage.getItem("pgnContent");
      if (storedPgn) {
        loadPgn(storedPgn);
      } else {
        const samplePgn = `[Event "Live Chess"]
          [Site "Chess.com"]
          [Date "2023.09.15"]
          [Round "?"]
          [White "Player1"]
          [Black "Player2"]
          [Result "1-0"]
          [ECO "B01"]
          [WhiteElo "1600"]
          [BlackElo "1550"]
          [TimeControl "180"]
          [EndTime "12:20:15"]
          [Termination "Player1 won by checkmate"]

          1. e4 d5 2. exd5 Qxd5 3. Nc3 Qd8 4. d4 Nf6 5. Nf3 Bg4 6. Be2 e6 7. O-O Be7 
          8. h3 Bh5 9. Be3 O-O 10. Qd2 c6 11. Rad1 Nbd7 12. Ne5 Bxe2 13. Qxe2 Nxe5 
          14. dxe5 Nd5 15. Nxd5 Qxd5 16. c4 Qc5 17. Qc2 Rad8 18. b4 Qe7 19. c5 Rd5 
          20. Rd3 Rfd8 21. Rfd1 f6 22. exf6 Qxf6 23. Rxd5 Rxd5 24. Rxd5 exd5 25. Qd3 Qe6 
          26. f4 h6 27. Qxd5 Qxd5 28. Bxh6 Qd1+ 29. Kh2 Qd4 30. Be3 Qe4 31. g3 Qe6 
          32. Kg2 Bf6 33. Kf3 Kf7 34. h4 g5 35. hxg5 Bxg5 36. fxg5 Qc4 37. Bd4 Qc1 
          38. Ke4 Qe1+ 39. Be3 Qc3 40. Kd5 Qb3+ 41. Kd6 Qb8+ 42. Kd7 Qb5+ 43. c6 Qb6 
          44. Kc8 a5 45. Bf4 Qf2 46. Bd6 bxc6 47. bxa5 Qe2 48. a6 Qe8+ 49. Kb7 Qb5+ 
          50. Ka7 Qc5+ 51. Kb7 Qb5+ 52. Kc8 Qe8+ 53. Kb7 Qb5+ 54. Ka8 c5 55. a7 c4 
          56. Bf4 Kg6 57. Bd2 Kh5 58. Kb7 Qd5+ 59. Kc8 Qe6+ 60. Kb8 Qd6+ 61. Kc8 Qe6+ 
          62. Kd8 Qd6+ 63. Ke8 Qc6+ 64. Kf7 Qd7+ 65. Kf6 Qd6+ 66. Kf5 Qd7+ 67. Kf4 Qd6+ 
          68. Kf3 Qd5+ 69. Kg2 Qd6 70. Kh3 Qd3+ 71. Kh2 Qd6 72. Be3 Kg4 73. Kg2 Qc5 
          74. Bb6 Qb5 75. Bc5 Qb2+ 76. Kh1 Kf3 77. g6 Qc1+ 78. Kh2 Qf4+ 79. Kh3 c3 
          80. g7 Qf5+ 81. Kh4 Qf6+ 82. Kh5 Qf3+ 83. g4+ Qxg4# 0-1`;
        loadPgn(samplePgn);
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [chessInstance, loadPgn]);

  useEffect(() => {
    if (currentMove >= 0 && currentMove < history.length) {
      setFen(history[currentMove].fen);
    } else if (currentMove === -1) {
      setFen("start");
    }
  }, [currentMove, history]);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentMove((prev) => {
          if (prev >= history.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, history.length]);

  useEffect(() => {
    if (currentMove >= 0 && history[currentMove] && isReady) {
      analyzePosition(history[currentMove].fen);
    }
  }, [currentMove, history, isReady, analyzePosition]);

  const goToStart = () => setCurrentMove(-1);
  const goToEnd = () => setCurrentMove(history.length - 1);
  const goToPrevMove = () => setCurrentMove((prev) => Math.max(-1, prev - 1));
  const goToNextMove = () =>
    setCurrentMove((prev) => Math.min(history.length - 1, prev + 1));
  const togglePlay = () => setIsPlaying((prev) => !prev);
  const goToMove = (index: number) => setCurrentMove(index);
  const flipBoard = () =>
    setOrientation((prev) => (prev === "white" ? "black" : "white"));

  const getMoveItemClass = (index: number) => {
    const evaluation = moveEvaluations[index];
    let bgColor = "";

    if (evaluation) {
      switch (evaluation.type) {
        case "brilliant":
        case "best":
          bgColor = "bg-green-100 dark:bg-green-900/30";
          break;
        case "excellent":
        case "okay":
          bgColor = "bg-blue-100 dark:bg-blue-900/30";
          break;
        case "inaccuracy":
          bgColor = "bg-yellow-100 dark:bg-yellow-900/30";
          break;
        case "mistake":
        case "blunder":
          bgColor = "bg-red-100 dark:bg-red-900/30";
          break;
      }
    }

    return `px-2 py-1 rounded cursor-pointer ${
      currentMove === index
        ? "bg-primary text-primary-foreground"
        : `hover:bg-accent ${bgColor}`
    }`;
  };

  const currentEvaluation = useMemo(() => {
    if (currentMove >= 0 && currentMove < moveEvaluations.length) {
      return moveEvaluations[currentMove];
    }
    return null;
  }, [currentMove, moveEvaluations]);

  const hasAnyEvaluation = useMemo(
    () => moveEvaluations.some((evaluation) => evaluation !== null),
    [moveEvaluations]
  );

  const shouldShowAnalysis =
    currentMove >= 0 &&
    currentMove < history.length &&
    (currentEvaluation || isAnalyzing || currentAnalysis);

  const bestMoveArrow = useMemo(() => {
    if (
      currentMove >= 0 &&
      currentAnalysis?.bestMoveFromSquare &&
      currentAnalysis?.bestMoveToSquare
    ) {
      return {
        from: currentAnalysis.bestMoveFromSquare,
        to: currentAnalysis.bestMoveToSquare,
      };
    }
    return null;
  }, [currentMove, currentAnalysis]);

  return (
    <DefaultLayout>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          {/* Left column - Chess board */}
          <div className="lg:col-span-2 flex flex-col items-center">
            <div
              className="relative aspect-square w-full"
              style={{
                maxHeight: "min(80vh, 720px)",
                maxWidth: "min(100%, 80vh, 720px)",
              }}
            >
              <div className="h-full w-full z-99 overflow-hidden rounded-md">
                <NextChessboard
                  fen={fen}
                  orientation={orientation}
                  lastMove={
                    currentMove >= 0 && currentMove < history.length
                      ? {
                          from: history[currentMove].move.from,
                          to: history[currentMove].move.to,
                        }
                      : undefined
                  }
                  moveEvaluation={currentEvaluation || undefined}
                  showEvaluationOnSquare={
                    currentMove >= 0 && currentMove < history.length
                      ? history[currentMove].move.to
                      : undefined
                  }
                  bestMoveArrow={bestMoveArrow}
                  onFenChange={(newFen) => {
                    console.log("FEN updated:", newFen);
                  }}
                  readOnly={false}
                  viewOnly={true}
                />
              </div>
            </div>

            <div
              className="mt-4 flex w-full justify-between items-center"
              style={{ maxWidth: "min(100%, 80vh, 720px)" }}
            >
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToStart}
                  title="Go to start"
                >
                  <ChevronsLeft />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPrevMove}
                  title="Previous move"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlay}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause /> : <Play />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextMove}
                  title="Next move"
                >
                  <ChevronRight />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToEnd}
                  title="Go to end"
                >
                  <ChevronsRight />
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={flipBoard}
                title="Flip board"
              >
                <RefreshCcw />
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultValue="moves" className="h-full flex flex-col">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="moves">Moves</TabsTrigger>
                <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
                <TabsTrigger value="info">Game Info</TabsTrigger>
              </TabsList>

              <TabsContent value="moves" className="flex-1">
                <ScrollArea className="h-[70vh]">
                  <div>
                    <div className="grid grid-cols-[auto_1fr_1fr] gap-1">
                      <div className="font-medium">#</div>
                      <div className="font-medium">White</div>
                      <div className="font-medium">Black</div>

                      <Separator className="col-span-3 my-2" />
                      {Array.from({
                        length: Math.ceil(history.length / 2),
                      }).map((_, i) => {
                        const moveNum = i + 1;
                        const whiteIdx = i * 2;
                        const blackIdx = i * 2 + 1;

                        return (
                          <React.Fragment key={moveNum}>
                            <div className="text-muted-foreground">
                              {moveNum}.
                            </div>
                            <div
                              className={
                                whiteIdx < history.length
                                  ? getMoveItemClass(whiteIdx)
                                  : ""
                              }
                              onClick={() =>
                                whiteIdx < history.length && goToMove(whiteIdx)
                              }
                            >
                              {whiteIdx < history.length ? (
                                <div className="flex items-center gap-2">
                                  <span>{history[whiteIdx].san}</span>
                                  {moveEvaluations[whiteIdx] && (
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{
                                        backgroundColor:
                                          moveEvaluations[whiteIdx]?.color,
                                      }}
                                      title={moveEvaluations[whiteIdx]?.type}
                                    />
                                  )}
                                </div>
                              ) : (
                                ""
                              )}
                            </div>
                            <div
                              className={
                                blackIdx < history.length
                                  ? getMoveItemClass(blackIdx)
                                  : ""
                              }
                              onClick={() =>
                                blackIdx < history.length && goToMove(blackIdx)
                              }
                            >
                              {blackIdx < history.length ? (
                                <div className="flex items-center gap-2">
                                  <span>{history[blackIdx].san}</span>
                                  {moveEvaluations[blackIdx] && (
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{
                                        backgroundColor:
                                          moveEvaluations[blackIdx]?.color,
                                      }}
                                      title={moveEvaluations[blackIdx]?.type}
                                    />
                                  )}
                                </div>
                              ) : (
                                ""
                              )}
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="evaluation" className="flex-1">
                <ScrollArea className="h-[70vh] w-full max-w-full">
                  <div className="space-y-4">
                    {/* Analyze Game Button */}
                    <div>
                      <Button
                        onClick={analyzeGame}
                        disabled={
                          !isReady || isAnalyzingGame || history.length === 0
                        }
                        variant="default"
                        size={"lg"}
                      >
                        <Zap className="w-4 h-4" />
                        {isAnalyzingGame
                          ? `Analyzing... ${Math.round(analysisProgress)}%`
                          : "Analyze Game"}
                      </Button>

                      {stockfishError && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 rounded text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          {stockfishError}
                        </div>
                      )}

                      {!isReady && (
                        <div className="mt-2 text-xs text-muted-foreground text-center">
                          Loading Stockfish engine...
                        </div>
                      )}
                    </div>
                    {/* Current Move Analysis */}
                    {shouldShowAnalysis ? (
                      <MoveAnalysis
                        evaluation={currentEvaluation ?? undefined}
                        analysis={currentAnalysis || undefined}
                        isAnalyzing={isAnalyzing}
                        moveNumber={history[currentMove]?.moveNumber}
                        san={history[currentMove]?.san}
                        isWhite={history[currentMove]?.move.color === "w"}
                      />
                    ) : (
                      <Card>
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                          <BarChart2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {hasAnyEvaluation
                              ? "Select a move to see its evaluation"
                              : "Click 'Analyze Game' to evaluate all moves"}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Game Evaluation Chart */}
                    {moveEvaluations.some((e) => e !== null) && (
                      <>
                        <GameEvaluationChart
                          evaluations={moveEvaluations}
                          currentMove={currentMove}
                          onMoveClick={goToMove}
                        />
                      </>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="info" className="flex-1">
                <ScrollArea className="h-[70vh]">
                  <div className="space-y-2">
                    {/* Display file name if available */}
                    {typeof window !== "undefined" &&
                      localStorage.getItem("pgnFileName") && (
                        <div className="grid grid-cols-[100px_1fr]">
                          <div className="text-muted-foreground">File</div>
                          <div>{localStorage.getItem("pgnFileName")}</div>
                        </div>
                      )}
                    <Separator className="my-2" />
                    {pgn
                      .split("\n")
                      .slice(0, 10)
                      .map((line, i) => {
                        if (line.startsWith("[") && line.includes('"')) {
                          const key = line.substring(1, line.indexOf(" "));
                          const value = line.substring(
                            line.indexOf('"') + 1,
                            line.lastIndexOf('"')
                          );

                          return (
                            <div key={i} className="grid grid-cols-[100px_1fr]">
                              <div className="text-muted-foreground">{key}</div>
                              <div>{value}</div>
                            </div>
                          );
                        }
                        return null;
                      })}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
