// Play audio based on the selected sound theme
const audio = (theme: string) => {
  let soundFile;
  
  // Select the appropriate sound file based on theme
  switch (theme) {
    case 'silent':
      return; // No sound
    case 'robot':
      soundFile = '/assets/sounds/robot.ogg';
      break;
    case 'sfx':
      soundFile = '/assets/sounds/sfx.ogg';
      break;
    case 'lisp':
      soundFile = '/assets/sounds/lisp.ogg';
      break;
    case 'piano':
    default:
      soundFile = '/assets/sounds/piano.ogg';
  }

  // Play the sound
  try {
    const sound = new Audio(soundFile);
    sound.play().catch(error => {
      console.error('Error playing sound:', error);
    });
  } catch (error) {
    console.error('Error creating audio:', error);
  }
};

export default audio;