import React from "react";
import { MessageType } from "../../../services/notifications/notifications";
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
    const center = { x: 50, y: 50 };
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
                height: "75px",
                backgroundColor: "antiquewhite",
                borderRadius: "5px",
                boxShadow: `0px 5px 0px ${boxColor}`,
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
                viewBox="0 0 100 100"
                style={{
                    gridColumn: "1 / span 1",
                    gridRow: "1 /span 1",
                    justifySelf: "center",
                    alignSelf: "center",
                    textAlign: "center",
                }}
            >
                <path
                    fill="black"
                    fillOpacity={0.25}
                    d={`M ${center.x},${center.y} L ${center.x},${
                        center.y - radius
                    } A ${radius},${radius} 0 ${
                        timePercent < 0.5 ? "0,1" : "1,1"
                    } ${
                        center.x + Math.sin(timePercent * Math.PI * 2) * radius
                    },${
                        center.y - Math.cos(timePercent * Math.PI * 2) * radius
                    } z`}
                ></path>
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
