// @ts-check
import React, { useRef, useReducer, useEffect } from "react";
import { textPrimary } from "../../constants/colors";

/**
 *
 * @param {number} time
 * @param {number} delta
 */
const timerReducer = (time, delta) => {
    return time + delta;
};

const Spinner = ({ size = 28, arc = 2, color = textPrimary, ...props }) => {
    const radius = size / 2 - 5;
    const [timer, updateTimer] = useReducer(timerReducer, 0);
    const frameRef = useRef(null);
    const timeRef = useRef(null);
    const animationValue = ((timer * 2) % 1000) / 1000;
    useEffect(() => {
        /**
         *
         * @param {number} time
         * @returns
         */
        const update = (time) => {
            if (!timeRef.current) {
                timeRef.current = time;
                return;
            }
            let delta = time - timeRef.current;
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
