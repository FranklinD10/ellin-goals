import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled(motion.div)`
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  right: 0;
`;

interface PageTransitionProps {
  children: ReactNode;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

export function PageTransition({ children }: PageTransitionProps) {
  const { pathname } = useLocation();

  return (
    <PageContainer
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }}
      key={pathname}
    >
      {children}
    </PageContainer>
  );
}