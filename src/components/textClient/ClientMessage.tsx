import React, { memo } from "react";
import MessagePart from "./MessagePart";
import { APMessage } from "../../services/textClientManager";
import NotificationManager from "../../services/notifications/notifications";
import { MessageType } from "../../services/notifications/notifications";

const ClientMessage = ({ message }: { message: APMessage }) => {
    const text = message.parts
        .map((part) => part.text)
        .reduce((a, b) => a + " " + b, "");
    return (
        <div
            onDoubleClick={async () => {
                try {
                    if (navigator.clipboard) {
                        await navigator.clipboard.writeText(text);
                        NotificationManager.createStatus({
                            message: "Copied to clipboard",
                            type: MessageType.info,
                            progress: 1,
                            duration: 2,
                        });
                    }
                } catch (e) {
                    console.error("Failed to copy text.", e);
                }
            }}
        >
            {message.parts.map((part) => (
                <MessagePart part={part} key={part.key} />
            ))}
        </div>
    );
};

export default memo(ClientMessage);
