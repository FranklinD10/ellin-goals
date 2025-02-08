import ConfettiGenerator from 'confetti-js';

export const playCompletionSound = () => {
  const audio = new Audio('/sounds/complete.mp3'); // Make sure this file exists in your public folder
  audio.volume = 0.5;
  audio.play().catch(err => console.warn('Audio playback failed:', err));
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
  
  const confetti = new ConfettiGenerator(confettiSettings);
  confetti.render();

  // Clear confetti after animation
  setTimeout(() => {
    confetti.clear();
  }, 2500);
};

export const animateCompletion = (element: HTMLElement) => {
  triggerConfetti();
  element.animate([
    { transform: 'scale(1)', opacity: 1 },
    { transform: 'scale(1.2)', opacity: 0.8 },
    { transform: 'scale(1)', opacity: 1 }
  ], {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  });
};
