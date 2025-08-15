import { useState } from 'react';

function usePopover() {
  const [open, setOpen] = useState<HTMLButtonElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  return { open, handleOpenMenu, handleCloseMenu };
}

export default usePopover;
