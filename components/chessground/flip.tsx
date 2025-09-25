import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import useOrientation from './use-orientation';

interface FlipProps {
  readOnly?: boolean;
}

const Flip = ({ readOnly }: FlipProps) => {
  const [, flip] = useOrientation({});

  if (readOnly) return null;

  return (
    <Button variant="outline" size="icon" onClick={() => flip()} className="ml-2">
      <RefreshCw className="h-10 w-10" />
    </Button>
  );
};

export default Flip;