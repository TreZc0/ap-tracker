
import { useState, useEffect } from 'react';

const useOrientation = () => {
  const [orientation, setOrientation] = useState(window.screen.orientation.type);

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.screen.orientation.type);
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
}

export {useOrientation};