import { audioManager } from './audio';
import ConfettiGenerator from 'confetti-js';
import { themes } from './theme-constants';

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [255, 75, 75];
};

export const playCompletionSound = async () => {
  await audioManager.playSound('completion');
};

export const triggerConfetti = () => {
  const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  // Get the current theme color from CSS variable and ensure proper hex format
  const style = getComputedStyle(document.documentElement);
  const themeColor = style.getPropertyValue('--theme-color').trim().replace(/\s/g, '');
  const hexColor = themeColor.startsWith('#') ? themeColor : `#${themeColor}`;
  
  const baseColor = hexToRgb(hexColor);
  const lighterColor = baseColor.map(c => Math.min(255, c + 100));
  const lightestColor = baseColor.map(c => Math.min(255, c + 140));

  const confettiSettings = {
    target: 'confetti-canvas',
    max: 80,
    size: 1,
    animate: true,
    props: ['circle', 'square'],
    colors: [
      baseColor,
      lighterColor,
      lightestColor
    ],
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
