import React, { useContext } from "react";
import { API } from "archipelago.js";
import * as colors from "../../constants/colors";
import { HintStatus, MessagePart as MsgPart } from "../../services/textClientManager";
import ServiceContext from "../../contexts/serviceContext";

const MessagePart = ({part}:{part: MsgPart}) => {
    const services = useContext(ServiceContext);
    let color = colors.textPrimary;
    if(part.type === "item"){
        if(part.flags & API.itemClassifications.progression){
            color = colors.progressionItem;
        } else if (part.flags & API.itemClassifications.useful) {
            color = colors.usefulItem;
        } else if (part.flags & API.itemClassifications.trap) {
            color = colors.trapItem;
        } else {
            color = colors.normalItem;
        }
    }else if(part.type === "location"){
        color = colors.textClient.green;
    }else if(part.type === "player"){
        if(part.text === services.connector?.connection?.slotInfo.alias){
            color = colors.textClient.magenta;
        }else{
            color = colors.textClient.yellow;
        }
    }else if (part.type === "entrance")  {
        color = colors.textClient.blue;
    }else if (part.type === "hint_status") {
        if(part.hint_status === HintStatus.found){
            color = colors.textClient.green;
        } else if (part.hint_status === HintStatus.avoid) {
            color = colors.trapItem;
        } else if (part.hint_status === HintStatus.priority) {
            color = colors.usefulItem;
        } else {
            color = colors.textClient.blue;
        }
    }

    return <span style={{color}}>{part.text}</span>
}

export default MessagePart;