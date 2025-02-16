// @ts-check
import React from "react";
import { MessageType } from "../../services/notifications/notifications";
import { filledTextPrimary, secondary } from "../../constants/colors";
const TOAST_HEIGHT = 85;
const Toast = ({
    message,
    type,
    index,
    remainingTime,
    duration,
    details,
    mouseEnter,
    mouseLeave,
    click,
}) => {
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
    let bottom = 10 + TOAST_HEIGHT * index;
    let onScreen = !(remainingTime === duration || remainingTime < 0);
    let right = onScreen ? 10 : -600;
    let timePercent = remainingTime / duration;
    timePercent = timePercent < 0 ? 0 : timePercent;
    const radius = 40;
    return (
        <div
            style={{
                display: "grid",
                bottom: `${bottom}px`,
                right: `${right}px`,
                position: "absolute",
                columnGap: "5px",
                gridTemplateColumns: "75px auto",
                width: "600px",
                maxWidth: "90%",
                height: "75px",
                backgroundColor: secondary,
                color: filledTextPrimary,
                boxShadow: `3px 5px 0px ${boxColor}`,
                opacity: onScreen ? 1 : 0,
                transition: "all 0.25s ease-in-out",
                pointerEvents: "all",
                cursor: details ? "pointer" : "auto",
            }}
            onMouseLeave={mouseLeave}
            onMouseEnter={mouseEnter}
            onClick={details ? click : () => {}}
        >
            <svg
                viewBox="-50 -50 100 100"
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
                    strokeDasharray={`${radius * timePercent * Math.PI * 2} ${
                        7 * radius
                    }`}
                    strokeOpacity={0.25}
                    strokeWidth={5}
                    r={radius}
                    fill="none"
                    transform="rotate(-90)"
                />
            </svg>
            <div
                style={{
                    gridColumn: "1 / span 1",
                    gridRow: "1 /span 1",
                    justifySelf: "center",
                    alignSelf: "center",
                    textAlign: "center",
                    fontSize: "XX-large",
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
                {details ? (
                    <>
                        <br />
                        <i style={{ textDecoration: "underline" }}>
                            Click for details
                        </i>
                    </>
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
};

export default Toast;
