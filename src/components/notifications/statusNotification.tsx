import React from "react";
import { MessageType } from "../../services/notifications/notifications";
import { filledTextPrimary, secondary } from "../../constants/colors";
import Spinner from "../icons/spinner";
const STATUS_HEIGHT_EM = 4;
const StatusNotificationView = ({
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
    const top = 4 + STATUS_HEIGHT_EM * index;
    const onScreen = !hide;
    const right = onScreen ? 10 : -600;

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
            <Spinner
                size={50}
                arc={progress < 0 ? 2 : Math.PI * 2 * progress}
                color="black"
                style={{
                    gridColumn: "1 / span 1",
                    gridRow: "1 /span 1",
                    justifySelf: "center",
                    alignSelf: "center",
                    textAlign: "center",
                }}
            />
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

export default StatusNotificationView;
