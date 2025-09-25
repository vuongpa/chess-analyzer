import { ChessProps } from './use-chess';
import type { Config } from 'chessground/config';

const cgProps = (props: ChessProps): Partial<Config> => {
  const config: Partial<Config> = {};

  if (props.fen) {
    config.fen = props.fen;
  }
  
  if (props.readOnly === true) {
    config.movable = {
      free: false,
      color: undefined,
      dests: undefined,
      showDests: false,
    };
    config.draggable = {
      enabled: false,
    };
    config.premovable = {
      enabled: false,
    };
  } else {
    // Enable showing possible destinations for pieces
    config.movable = {
      ...config.movable,
      showDests: true,
    };
  }

  if (props.viewOnly === true) {
    config.viewOnly = true;
  }

  if (props.animation === false) {
    config.animation = {
      enabled: false,
    };
  }
  
  return config;
};

export default cgProps;