import { useState } from 'react';

const useDisclosure = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const show = () => {
    setIsOpen(true);
  };

  const hide = () => {
    setIsOpen(false);
  };

  const toggle = () => {
    setIsOpen((state) => !state);
  };

  return { isOpen, show, hide, toggle };
};

export default useDisclosure;