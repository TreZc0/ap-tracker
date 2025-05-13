import React, { useContext } from "react";
import { API } from "archipelago.js";
import * as colors from "../../constants/colors";
import {
    HintStatus,
    MessagePart as MsgPart,
} from "../../services/textClientManager";
import ServiceContext from "../../contexts/serviceContext";

const MessagePart = ({ part }: { part: MsgPart }) => {
    const services = useContext(ServiceContext);
    let textColor = colors.textPrimary;
    let backgroundColor = undefined;
    let underline = false;
    let bold = false;
    if (part.type === "item") {
        if (part.flags & API.itemClassifications.progression) {
            textColor = colors.progressionItem;
        } else if (part.flags & API.itemClassifications.useful) {
            textColor = colors.usefulItem;
        } else if (part.flags & API.itemClassifications.trap) {
            textColor = colors.trapItem;
        } else {
            textColor = colors.normalItem;
        }
    } else if (part.type === "location") {
        textColor = colors.textClient.green;
    } else if (part.type === "player") {
        if (part.text === services.connector?.connection?.slotInfo.alias) {
            textColor = colors.textClient.magenta;
        } else {
            textColor = colors.textClient.yellow;
        }
    } else if (part.type === "entrance") {
        textColor = colors.textClient.blue;
    } else if (part.type === "hint_status") {
        if (part.hint_status === HintStatus.found) {
            textColor = colors.textClient.green;
        } else if (part.hint_status === HintStatus.avoid) {
            textColor = colors.trapItem;
        } else if (part.hint_status === HintStatus.priority) {
            textColor = colors.usefulItem;
        } else {
            textColor = colors.textClient.blue;
        }
    } else if (part.type === "color") {
        if (part.color === "underline") {
            underline = true;
        } else if (part.color === "bold") {
            bold = true;
        } else if (part.color && part.color.endsWith("_bg")) {
            backgroundColor =
                colors.textClient[
                    part.color.substring(0, part.color.length - 3)
                ];
        } else if (part.color) {
            textColor = colors.textClient[part.color];
        }
    }

    return (
        <div
            style={{
                color: textColor,
                backgroundColor,
                textDecoration: underline ? "underline" : undefined,
                fontWeight: bold ? "bold" : "normal",
                whiteSpace: "pre-wrap",
                display: "inline-block",
            }}
        >
            {part.text}
        </div>
    );
};

export default MessagePart;
