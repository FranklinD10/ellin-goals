import ConfettiGenerator from 'confetti-js';

export const playCompletionSound = () => {
  const audio = new Audio('https://www.soundjay.com/button/sounds/button-3.mp3');
  audio.play().catch(err => console.warn('Audio playback failed:', err));
};

export const triggerConfetti = () => {
  const confettiSettings = { target: 'confetti-canvas', max: 150, size: 1.2, animate: true };
  const confetti = new ConfettiGenerator(confettiSettings);
  confetti.render();
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
