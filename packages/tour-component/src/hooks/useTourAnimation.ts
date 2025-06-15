import { useEffect, useRef } from 'react';
import { useTourStore } from '../store/tourStore';

export const useTourAnimation = () => {
  const {
    isPlaying,
    speed,
    segmentProgress,
    currentSegmentIndex,
    tourData,
    updateSegmentPosition,
    completeCurrentSegment,
    pause,
    nextSegment,
  } = useTourStore();

  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying || !tourData) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Only update if enough time has passed to reduce jitter
      if (deltaTime < 16) { // ~60fps max
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Calculate progress increment based on speed and time
      // This assumes a base duration of 10 seconds per segment at speed 1
      const baseDuration = 10000; // 10 seconds in milliseconds
      const progressIncrement = (deltaTime / baseDuration) * speed;
      
      const newSegmentProgress = Math.min(segmentProgress + progressIncrement, 1);
      
      updateSegmentPosition(newSegmentProgress);
      
      if (newSegmentProgress >= 1) {
        // Segment completed
        completeCurrentSegment(); // Mark associated POI as visited
        pause(); // Always stop at end of segment
        
        // Check if there are more segments
        if (currentSegmentIndex < tourData.paths.length - 1) {
          // Auto-advance to next segment after a short delay
          setTimeout(() => {
            nextSegment();
          }, 1000); // 1 second pause between segments
        } else {
          // Tour fully completed
          console.log('Tour completed!');
        }
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastTimeRef.current = 0;
    };
  }, [isPlaying, speed, segmentProgress, currentSegmentIndex, tourData, updateSegmentPosition, completeCurrentSegment, pause, nextSegment]);

  return {
    isAnimating: isPlaying,
  };
};