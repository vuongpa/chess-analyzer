import React from 'react';
import Flip from './flip';

interface AdvancedProps {
  flip: () => void;
  readOnly?: boolean;
}

const Advanced = ({ readOnly }: AdvancedProps) => {
  return (
    <div className="advanced-tools mt-2 flex items-center justify-between">
      <div></div>
      <div>
        <Flip readOnly={readOnly} />
      </div>
    </div>
  );
};

export default Advanced;