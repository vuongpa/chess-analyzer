let stockfish = null;

if (typeof SharedArrayBuffer === 'undefined') {
  self.postMessage({ 
    type: 'error', 
    error: 'SharedArrayBuffer is not available. Please ensure your site is served over HTTPS with the proper headers.' 
  });
} else {
  // Configure Stockfish before loading
  self.Module = {
    locateFile: function(path, prefix) {
      // For WASM files, use absolute path from root
      if (path.endsWith('.wasm')) {
        return '/stockfish/' + path;
      }
      return prefix + path;
    }
  };
  
  importScripts('/stockfish/stockfish-17.1-lite.js');
}

self.onmessage = async function(e) {
  const { type, command, payload } = e.data;

  if (typeof SharedArrayBuffer === 'undefined') {
    self.postMessage({ 
      type: 'error', 
      error: 'SharedArrayBuffer is not supported in this environment' 
    });
    return;
  }

  switch (type) {
    case 'init':
      if (!stockfish) {
        try {
          stockfish = await Stockfish();
          stockfish.addMessageListener((line) => {
            self.postMessage({
              type: 'message',
              data: line
            });
          });
          self.postMessage({ type: 'ready' });
        } catch (error) {
          self.postMessage({ 
            type: 'error', 
            error: error.message || 'Failed to initialize Stockfish' 
          });
        }
      } else {
        self.postMessage({ type: 'ready' });
      }
      break;

    case 'command':
      if (stockfish) {
        try {
          stockfish.postMessage(command);
        } catch (error) {
          self.postMessage({ 
            type: 'error', 
            error: error.message || 'Failed to send command to Stockfish' 
          });
        }
      } else {
        self.postMessage({ 
          type: 'error', 
          error: 'Stockfish not initialized' 
        });
      }
      break;

    case 'analyze':
      if (stockfish && payload) {
        const { fen, depth = 15 } = payload;
        
        try {
          // Set position
          stockfish.postMessage(`position fen ${fen}`);
          
          // Start analysis
          stockfish.postMessage(`go depth ${depth}`);
        } catch (error) {
          self.postMessage({ 
            type: 'error', 
            error: error.message || 'Failed to analyze position' 
          });
        }
      }
      break;

    case 'stop':
      if (stockfish) {
        try {
          stockfish.postMessage('stop');
        } catch (error) {
          self.postMessage({ 
            type: 'error', 
            error: error.message || 'Failed to stop analysis' 
          });
        }
      }
      break;

    default:
      self.postMessage({ 
        type: 'error', 
        error: `Unknown command type: ${type}` 
      });
  }
};

// Handle errors
self.onerror = function(error) {
  self.postMessage({ 
    type: 'error', 
    error: error.message || 'Worker error occurred' 
  });
};