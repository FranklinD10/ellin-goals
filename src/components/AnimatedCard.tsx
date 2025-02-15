import React, { ReactNode } from 'react';
import { Card, CardProps } from '@mui/material';
import { motion, HTMLMotionProps } from 'framer-motion';
import { styled } from '@mui/material/styles';

const MotionCard = styled(motion.div)`
  will-change: transform;
  user-select: none;
  touch-action: manipulation;
`;

interface AnimatedCardProps extends CardProps {
  onSwipe?: () => void;
}

export function AnimatedCard({ children, onSwipe, ...props }: AnimatedCardProps) {
  const motionProps: HTMLMotionProps<"div"> = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -300 },
    transition: { type: 'spring', stiffness: 500, damping: 30 },
    drag: onSwipe ? 'x' : false,
    dragConstraints: { left: 0, right: 0 },
    dragElastic: 0.9,
    onDragEnd: (event, info) => {
      if (info.offset.x < -100 && onSwipe) {
        onSwipe();
      }
    }
  };

  return (
    <MotionCard {...motionProps}>
      <Card {...props}>
        {children}
      </Card>
    </MotionCard>
  );
}
