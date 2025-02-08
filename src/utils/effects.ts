import { audioManager } from './audio';
import ConfettiGenerator from 'confetti-js';

export const playCompletionSound = async () => {
  await audioManager.playSound('completion');
};

export const triggerConfetti = () => {
  const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const confettiSettings = {
    target: 'confetti-canvas',
    max: 80,
    size: 1,
    animate: true,
    props: ['circle', 'square'],
    colors: [[255, 75, 75], [255, 175, 175], [255, 215, 215]],
    clock: 25,
    rotate: true,
    start_from_edge: true,
    respawn: false
  };
  
  const confettiInstance = new ConfettiGenerator(confettiSettings);
  confettiInstance.render();

  // Clear confetti after animation
  setTimeout(() => {
    confettiInstance.clear();
  }, 2500);
};

export const animateCompletion = (element: HTMLElement) => {
  triggerConfetti();
  element.animate([
    { transform: 'scale(1) translateZ(0)', opacity: 1 },
    { transform: 'scale(1.2) translateZ(0)', opacity: 0.8 },
    { transform: 'scale(1) translateZ(0)', opacity: 1 }
  ], {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'forwards',
  });
};
