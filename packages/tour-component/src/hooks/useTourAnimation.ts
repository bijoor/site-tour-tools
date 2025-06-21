import { useEffect, useRef } from 'react';
import { useTourStore } from '../store/tourStore';

export const useTourAnimation = () => {
  const {
    isPlaying,
    tourData,
    updateSegmentPosition,
    completeCurrentSegment,
    pause,
  } = useTourStore();

  const animationRef = useRef<number>();
  const progressRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    console.log('🎨 ANIMATION: useEffect triggered', {
      isPlaying,
      hasTourData: !!tourData
    });
    
    // Clean up any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    
    if (!isPlaying || !tourData || tourData.paths.length === 0) {
      console.log('📏 ANIMATION: Not starting - conditions not met');
      return;
    }
    
    // Reset progress when starting
    progressRef.current = 0;
    lastTimeRef.current = 0;
    
    console.log('🎨 ANIMATION: Starting animation');

    const animate = (currentTime: number) => {
      // Check if we should still be animating
      const currentState = useTourStore.getState();
      
      if (!currentState.isPlaying) {
        console.log('🛑 ANIMATION: Stopping - not playing (external pause called)');
        return;
      }
      
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      lastTimeRef.current = currentTime;

      // Simple fixed increment: complete in 5 seconds (0.2% per frame at 60fps)
      const progressIncrement = 0.002;
      progressRef.current = Math.min(progressRef.current + progressIncrement, 1);
      
      // Update position
      updateSegmentPosition(progressRef.current);
      
      if (progressRef.current >= 1) {
        console.log('✅ ANIMATION: Segment completed');
        completeCurrentSegment();
        
        // Check current state after segment completion
        const currentState = useTourStore.getState();
        
        if (currentState.isPathSelectionMode) {
          console.log('🔀 ANIMATION: Entering path selection mode - pausing animation');
          pause();
        } else if (currentState.isPlaying) {
          // Check if we actually advanced to a new segment
          const newState = useTourStore.getState();
          if (newState.currentSegmentIndex !== currentState.currentSegmentIndex) {
            console.log('⏭️ ANIMATION: Auto-continuing to next segment');
            // Reset progress for next segment
            progressRef.current = 0;
            // Continue animation on next segment
            animationRef.current = requestAnimationFrame(animate);
          } else {
            console.log('🏁 ANIMATION: Tour completed - no more segments to advance to');
            pause();
          }
        } else {
          console.log('🏁 ANIMATION: Tour completed - animation stopped');
          pause();
        }
        return;
      }

      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    console.log('🎬 ANIMATION: Started with ID:', animationRef.current);

    return () => {
      console.log('🧹 ANIMATION: Cleanup');
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };
  }, [isPlaying]); // Only depend on isPlaying to avoid infinite loops

  return {
    isAnimating: isPlaying,
  };
};