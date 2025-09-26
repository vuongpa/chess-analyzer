export interface StockfishEngine {
  started: number;
  loaded?: boolean;
  ready?: boolean;
  stream?: (line: string) => void;
  onError?: (error: Error | ErrorEvent) => void;
  send: (command: string, cb?: (message?: string) => void, stream?: (line: string) => void) => void;
  stopMoves: () => void;
  getQueueLength: () => number;
  quit: () => void;
  worker: Worker;
}

interface EngineCommand {
  cmd: string;
  cb?: (message?: string) => void;
  stream?: (line: string) => void;
  message?: string;
  discard?: boolean;
  done?: boolean;
}

export interface LoadStockfishOptions {
  /**
   * Path to the Stockfish worker script. Defaults to the bundled lite build.
   */
  path?: string;
  /**
   * Enable verbose logging for debugging.
   */
  debugging?: boolean;
  /**
   * Forwarded to the Worker constructor (e.g. to set the type to "classic").
   */
  workerOptions?: WorkerOptions;
}

const DEFAULT_STOCKFISH_PATH = '/stockfish/stockfish-17.1-lite.js';
const NON_REPLYING_COMMANDS = new Set([
  'ucinewgame',
  'flip',
  'stop',
  'ponderhit'
]);

const evalRegex = /Total Evaluation[\s\S]+\n$/;

const getFirstWord = (line: string) => {
  const spaceIndex = line.indexOf(' ');
  return spaceIndex === -1 ? line : line.substring(0, spaceIndex);
};

const determineQueueIndex = (line: string, queue: EngineCommand[]) => {
  if (!queue.length) return 0;

  const firstWord = getFirstWord(line);
  let commandType: string | undefined;

  if (firstWord === 'uciok' || firstWord === 'option') {
    commandType = 'uci';
  } else if (firstWord === 'readyok') {
    commandType = 'isready';
  } else if (firstWord === 'bestmove' || firstWord === 'info') {
    commandType = 'go';
  } else {
    commandType = 'other';
  }

  for (let i = 0; i < queue.length; i += 1) {
    const queuedCommand = getFirstWord(queue[i].cmd);
    if (
      queuedCommand === commandType ||
      (commandType === 'other' && (queuedCommand === 'd' || queuedCommand === 'eval'))
    ) {
      return i;
    }
  }

  return 0;
};

const shouldIgnoreLine = (line: string) => {
  return (
    !line ||
    line.startsWith('No such option') ||
    line.startsWith('id ') ||
    line.startsWith('Stockfish')
  );
};

export function loadStockfish(options: LoadStockfishOptions = {}): StockfishEngine {
  if (typeof Worker === 'undefined') {
    throw new Error('Web Workers are not supported in this environment.');
  }

  const { path = DEFAULT_STOCKFISH_PATH, debugging = false, workerOptions } = options;
  const worker = new Worker(path, workerOptions);
  const queue: EngineCommand[] = [];

  const engine: StockfishEngine = {
    started: Date.now(),
    send,
    stopMoves,
    getQueueLength,
    quit,
    worker
  };

  const processLine = (line: string) => {
    if (!line) return;

    if (line.includes('\n')) {
      line.split('\n').forEach(processLine);
      return;
    }

    if (debugging) {
      console.log('stockfish:out', line);
    }

    engine.stream?.(line);

    if (!queue.length || shouldIgnoreLine(line)) {
      return;
    }

    const queueIndex = determineQueueIndex(line, queue);
    const current = queue[queueIndex];
    if (!current) return;

    current.stream?.(line);

    if (typeof current.message === 'undefined') {
      current.message = '';
    } else if (current.message) {
      current.message += '\n';
    }
    current.message += line;

    let done = false;

    if (line === 'uciok') {
      done = true;
      engine.loaded = true;
    } else if (line === 'readyok') {
      done = true;
      engine.ready = true;
    } else if (line.startsWith('bestmove') && current.cmd !== 'bench') {
      done = true;
      current.message = line;
    } else if (current.cmd === 'd') {
      if (line.startsWith('Legal uci moves') || line.startsWith('Key is')) {
        current.done = true;
        done = true;
        if (line === 'Key is' && current.message) {
          current.message = current.message.slice(0, -7);
        }
      }
    } else if (current.cmd === 'eval') {
      if (evalRegex.test(current.message)) {
        done = true;
      }
    } else if (
      line.startsWith('pawn key') ||
      line.startsWith('Nodes/second') ||
      line.startsWith('Unknown command')
    ) {
      done = true;
    }

    if (done) {
      queue.splice(queueIndex, 1);
      if (current.cb && !current.discard) {
        current.cb(current.message);
      }
    }
  };

  worker.onmessage = (event: MessageEvent<string>) => {
    const data = event.data;
    if (typeof data === 'string') {
      processLine(data);
    }
  };

  worker.onerror = (event) => {
    engine.onError?.(event);
  };

  function send(command: string, cb?: (message?: string) => void, stream?: (line: string) => void) {
    const trimmed = String(command).trim();
    if (!trimmed) {
      return;
    }

    if (debugging) {
      console.log('stockfish:in', trimmed);
    }

    let noReply = false;
    if (
      NON_REPLYING_COMMANDS.has(trimmed) ||
      trimmed.startsWith('position') ||
      trimmed.startsWith('setoption')
    ) {
      noReply = true;
    } else {
      queue.push({ cmd: trimmed, cb, stream });
    }

    worker.postMessage(trimmed);

    if (noReply && cb) {
      setTimeout(() => cb(''), 0);
    }
  }

  function stopMoves() {
    for (let i = 0; i < queue.length; i += 1) {
      if (getFirstWord(queue[i].cmd) === 'go' && !queue[i].discard) {
        send('stop');
        queue[i].discard = true;
      }
    }
  }

  function getQueueLength() {
    return queue.length;
  }

  function quit() {
    queue.length = 0;
    worker.terminate();
  }

  return engine;
}
