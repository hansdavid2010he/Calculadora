// Tactile feedback utility: Click sounds and custom vibration.

let audioCtx: AudioContext | null = null;

export function playSoftClick() {
  try {
    if (!audioCtx) {
      // Lazy initialization on first click to comply with browser autoplay policies
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // High frequency, rapid exponential decay for a crisp, soft tactile click sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime); // High pitch click
    osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  } catch (err) {
    console.debug('Audio click feedback not supported or blocked:', err);
  }
}

export function triggerHapticFeedback() {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      // Brief tactile standard vibration
      navigator.vibrate(12);
    }
  } catch (err) {
    console.debug('Haptic feedback not supported or blocked:', err);
  }
}
