import React, { useContext, useEffect, useRef } from "react";
import { useTextClientMessages } from "../../hooks/textClientHook";
import ServiceContext from "../../contexts/serviceContext";
import ClientMessage from "./ClientMessage";
import StickySpacer from "../shared/StickySpacer";
import useOnScreen from "../../hooks/onScreenHook";
const TextClient = () => {
    const services = useContext(ServiceContext);
    const textClientManager = services.textClientManager;
    const messages = useTextClientMessages(textClientManager);
    const bottomRef = useRef(null);
    const messagesWindowRef = useRef(null);
    const shouldScroll = useOnScreen(bottomRef, messagesWindowRef);
    useEffect(()=>{
        if(shouldScroll){
            bottomRef.current?.scrollIntoView({behavior:"smooth"});
        }
    },
    [messages, shouldScroll, bottomRef]);

   
    return (
        <div style={{
            width: "100%",
            height: "100%",
            display: "grid",
            gridTemplateRows: "auto 1fr"
        }}>
            <h2>Text Client</h2>
            <div style={{ overflowY: "auto", scrollBehavior:
                "smooth"
             }} ref={messagesWindowRef}>
                {!textClientManager && (
                    <h1>Failed to load text client (no manager)</h1>
                )}
                {textClientManager &&
                    messages.map((message, index) => (
                        <ClientMessage key={index} message={message} />
                    ))}
                    <div ref={bottomRef}></div>
                    <StickySpacer/>
            </div>
        </div>
    );
};

export default TextClient;
