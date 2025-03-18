import React, { useRef, useReducer, useEffect } from "react";
import { textPrimary } from "../../constants/colors";

const timerReducer = (time: number, delta: number) => {
    return time + delta;
};

const Spinner = ({
    size = 28,
    arc = 2,
    color = textPrimary,
    ...props
}: {
    size?: number;
    arc?: number;
    color?: string;
}) => {
    const radius = size / 2 - 5;
    const [timer, updateTimer] = useReducer(timerReducer, 0);
    const frameRef = useRef(null);
    const timeRef = useRef(null);
    const animationValue = ((timer * 2) % 1000) / 1000;
    useEffect(() => {
        const update = (time: number) => {
            if (!timeRef.current) {
                timeRef.current = time;
                return;
            }
            const delta = time - timeRef.current;
            timeRef.current = time;
            updateTimer(delta);
            frameRef.current = requestAnimationFrame(update);
        };
        frameRef.current = requestAnimationFrame(update);
        return () => {
            cancelAnimationFrame(frameRef.current);
        };
    });

    return (
        <svg viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} {...props}>
            <circle
                stroke={color}
                strokeDasharray={`${radius * arc} ${7 * radius}`}
                strokeOpacity={0.25}
                strokeWidth={5}
                r={radius}
                fill="none"
                transform={`rotate(${animationValue * 360})`}
            />
        </svg>
    );
};

export default Spinner;
