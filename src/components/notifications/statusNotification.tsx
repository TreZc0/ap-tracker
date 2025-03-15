import React, { useRef, useEffect, useState } from "react";
import { MessageType } from "../../services/notifications/notifications";
import { filledTextPrimary, secondary } from "../../constants/colors";
const STATUS_HEIGHT_EM = 4;
const StatusNotification = ({
    message,
    type,
    index,
    progress,
    hide,
}: {
    /** The text to display for the notification */
    message: string;
    /** The type of styling to apply to the message */
    type: MessageType;
    /** Determines the position of the notification on the screen */
    index: number;
    /** A value between 0 and 1 representing how much work has been done. Use -1 to create a spinner instead */
    progress: number;
    /** Makes the notification invisible and off screen, toggle this to animate the notification appearing/leaving */
    hide: boolean;
}) => {
    const animationFrameRef = useRef(0);
    const timeRef = useRef(0);
    const [animationTime, setAnimationTime] = useState(0);

    useEffect(() => {
        let update = (time: number) => {
            animationFrameRef.current = requestAnimationFrame(update);
            if (!timeRef.current) {
                timeRef.current = time;
                return;
            }
            let delta = time - timeRef.current;
            timeRef.current = time;
            setAnimationTime((prev) => prev + delta);
        };

        animationFrameRef.current = requestAnimationFrame(update);
        return () => {
            cancelAnimationFrame(animationFrameRef.current);
        };
    });

    let boxColor = "grey";
    let icon = "ⓘ";
    switch (type) {
        case MessageType.error: {
            boxColor = "red";
            icon = "❌";
            break;
        }
        case MessageType.info: {
            boxColor = "blue";
            icon = "ⓘ";
            break;
        }
        case MessageType.progress: {
            boxColor = "blue";
            icon = "";
            break;
        }
        case MessageType.success: {
            boxColor = "green";
            icon = "✅";
            break;
        }
        case MessageType.warning: {
            boxColor = "orange";
            icon = "⚠️";
            break;
        }

        default: {
            boxColor = "grey";
            icon = "ⓘ";
            break;
        }
    }
    let top = 4 + STATUS_HEIGHT_EM * index;
    let onScreen = !hide;
    let right = onScreen ? 10 : -600;
    let animationValue = (animationTime % 1000) / 1000;
    let arc = 2;
    if (progress >= 0) {
        animationValue = 0;
        arc = Math.PI * 2 * progress;
    }
    const radius = 20;
    return (
        <div
            style={{
                display: "grid",
                top: `${top}em`,
                right: `${right}px`,
                position: "absolute",
                columnGap: "5px",
                gridTemplateColumns: "40px auto",
                width: "400px",
                maxWidth: "70%",
                height: "3em",
                backgroundColor: secondary,
                color: filledTextPrimary,
                boxShadow: `3px 5px 0px ${boxColor}`,
                opacity: onScreen ? 1 : 0,
                transition: "all 0.25s ease-in-out",
                pointerEvents: "all",
            }}
        >
            <svg
                viewBox="-25 -25 50 50"
                style={{
                    gridColumn: "1 / span 1",
                    gridRow: "1 /span 1",
                    justifySelf: "center",
                    alignSelf: "center",
                    textAlign: "center",
                }}
            >
                <circle
                    stroke="black"
                    strokeDasharray={`${radius * arc} ${7 * radius}`}
                    strokeOpacity={0.25}
                    strokeWidth={5}
                    r={radius}
                    fill="none"
                    transform={`rotate(${animationValue * 360})`}
                />
            </svg>
            <div
                style={{
                    gridColumn: "1 / span 1",
                    gridRow: "1 /span 1",
                    justifySelf: "center",
                    alignSelf: "center",
                    textAlign: "center",
                    fontSize: "large",
                }}
            >
                {icon}
            </div>
            <div
                style={{
                    gridColumn: "2 / span 1",
                    justifySelf: "left",
                    alignSelf: "center",
                    gridRow: "1 /span 1",
                    whiteSpace: "pre-wrap",
                }}
            >
                {message}
            </div>
        </div>
    );
};

export default StatusNotification;
