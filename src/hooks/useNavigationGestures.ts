import { useNavigate, useLocation } from 'react-router-dom';
import { useGestures } from './useGestures';

const ROUTES_ORDER = ['/', '/analytics', '/manage', '/settings'];

export const useNavigationGestures = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSwipeLeft = () => {
    const currentIndex = ROUTES_ORDER.indexOf(location.pathname);
    if (currentIndex < ROUTES_ORDER.length - 1) {
      navigate(ROUTES_ORDER[currentIndex + 1]);
    }
  };

  const handleSwipeRight = () => {
    const currentIndex = ROUTES_ORDER.indexOf(location.pathname);
    if (currentIndex > 0) {
      navigate(ROUTES_ORDER[currentIndex - 1]);
    }
  };

  const gestureHandlers = useGestures({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight
  });

  return gestureHandlers;
};