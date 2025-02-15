import React, { ReactNode, forwardRef } from 'react';
import { Card, CardProps } from '@mui/material';
import { useSwipeable } from 'react-swipeable';
import { styled } from '@mui/material/styles';
import { motion, MotionProps } from 'framer-motion';

interface StyledCardProps extends CardProps {
  children: ReactNode;
}

interface AnimatedCardProps extends StyledCardProps {
  onSwipe?: () => void;
}

const StyledCard = styled(Card)<StyledCardProps>`
  touch-action: pan-y;
  user-select: none;
  will-change: transform;
  transform: translateZ(0);
  transition: transform 0.2s;
  &:active {
    transform: scale(0.98);
  }
`;

const MotionContainer = styled(motion.div)<MotionProps>`
  width: 100%;
`;

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(({ children, onSwipe, sx, ...props }, ref) => {
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => onSwipe && onSwipe(),
    trackMouse: false,
    preventScrollOnSwipe: true,
    delta: 10,
    touchEventOptions: { passive: true }
  });

  return (
    <MotionContainer
      ref={ref}
      initial={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      layout
      transition={{
        layout: { duration: 0.2 },
        exit: { duration: 0.2 }
      }}
    >
      <StyledCard 
        {...swipeHandlers} 
        {...props}
      >
        {children}
      </StyledCard>
    </MotionContainer>
  );
});
