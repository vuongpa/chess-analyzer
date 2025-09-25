import { useState } from 'react';

export interface OrientationProps {
  orientation?: "white" | "black";
}

const useOrientation = (props: OrientationProps) => {
  const [orientation, setOrientation] = useState<"white" | "black">(props.orientation || 'white');

  const flip = () => {
    setOrientation(orientation === 'white' ? 'black' : 'white');
  };

  return [orientation, flip] as const;
};

export default useOrientation;