import { useState, useEffect, useMemo } from "react";

export const useCountdown = (initialSeconds: number, onEnd: () => void) => {
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (!isActive || secondsLeft <= 0) {
            if (isActive && secondsLeft <= 0) onEnd();
            setIsActive(false);
            return;
        }
        const interval = setInterval(() => setSecondsLeft(s => s - 1), 1000);
        return () => clearInterval(interval);
    }, [isActive, secondsLeft, onEnd]);

    const start = () => {
        setSecondsLeft(initialSeconds);
        setIsActive(true);
    };

    const formattedTime = useMemo(() => {
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
    }, [secondsLeft]);

    return { start, isActive, formattedTime };
};
