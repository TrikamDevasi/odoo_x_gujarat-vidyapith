import { useState, useEffect, useRef } from 'react';

export default function useCountUp(target, duration = 1200) {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    const startTimeRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        // Handle edge cases
        if (target === null || target === undefined) {
            setCount(0);
            countRef.current = 0;
            return;
        }

        const startValue = countRef.current;
        const endValue = parseInt(target, 10) || 0;

        // Reset startTime for new target
        startTimeRef.current = null;

        const animate = (timestamp) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const progress = timestamp - startTimeRef.current;
            const percentage = Math.min(progress / duration, 1);

            // Easing function: outQuart
            const ease = 1 - Math.pow(1 - percentage, 4);

            const currentValue = Math.floor(startValue + (endValue - startValue) * ease);

            setCount(currentValue);
            countRef.current = currentValue;

            if (percentage < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setCount(endValue);
                countRef.current = endValue;
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [target, duration]);

    return count;
}
