import React, { memo } from "react";
import MessagePart from "./MessagePart";
import { MessagePart as MsgPart } from "../../services/textClientManager";
import NotificationManager from "../../services/notifications/notifications";
import { MessageType } from "../../services/notifications/notifications";

const ClientMessage = ({ message }: { message: MsgPart[] }) => {
    const text = message
        .map((part) => part.text)
        .reduce((a, b) => a + " " + b, "");
    return (
        <div
            onDoubleClick={async () => {
                try {
                    await navigator.clipboard.writeText(text);
                    NotificationManager.createStatus({
                        message: "Copied to clipboard",
                        type: MessageType.info,
                        progress: 1,
                        duration: 2,
                    });
                } catch (e) {
                    console.error("Failed to copy text.", e);
                }
            }}
        >
            {message.map((part) => (
                <MessagePart part={part} key={part.key} />
            ))}
        </div>
    );
};

export default memo(ClientMessage);
