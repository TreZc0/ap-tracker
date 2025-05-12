import React from "react";
import MessagePart from "./MessagePart";
import { MessagePart as MsgPart } from "../../services/textClientManager";

const ClientMessage = ({message}:{message: MsgPart[]}) => {
    const text = message.map((part) => part.text).reduce((a, b) => a + " " + b, "");
    return <div onClick={()=>console.log(text)}>
        {message.map((part) => <MessagePart part={part} key={part.key}/>)}
    </div>
};

export default ClientMessage;