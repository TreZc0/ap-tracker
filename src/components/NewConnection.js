// @ts-check
import React, { useContext, useState } from "react";
import styled from "styled-components";
import { PrimaryButton } from "./buttons";
import { Input } from "./inputs";
import ServiceContext from "../contexts/serviceContext";

const Container = styled.div`
    display: grid;
    align-items: end;
    justify-items: center;
    row-gap: 0.25em;
    width: fit-content;
    padding: 1em 2em;
    grid-template-areas:
        "title"
        "host"
        "port"
        "game"
        "slot"
        "password"
        "connect";
    grid-template-rows: repeat(6, 2.5em) 4em;
`;

const NewConnection = ({ ...props }) => {
    const [connectionInfo, setconnectionInfo] = useState({
        host: "archipelago.gg",
        port: "",
        slot: "",
        password: "",
        // game: "Ocarina of Time",
        game: "CrossCode",
    });

    const defaultChangeHandler = (event) => {
        setconnectionInfo({
            ...connectionInfo,
            [event.target.name]: event.target.value,
        });
    };
    const serviceContext = useContext(ServiceContext);
    const connector = serviceContext.connector;
    let disabled = false;
    if (!connector) {
         disabled = true;
    }

    return (
        <Container {...props}>
            <h2>New Connection</h2>
            {/** The inpt forward ref is poorly typed in my jsdoc, raising errors */}
            {/** @ts-ignore */}
            <Input
                type="text"
                name="host"
                value={connectionInfo.host}
                onChange={defaultChangeHandler}
                label="Host"
                disabled={disabled}
            />
            {/** @ts-ignore */}
            <Input
                type="text"
                name="port"
                value={connectionInfo.port}
                onChange={defaultChangeHandler}
                label="Port"
                disabled={disabled}
            />
            {/** @ts-ignore */}
             <Input
                type="text"
                name="game"
                value={connectionInfo.game}
                onChange={defaultChangeHandler}
                label="Game"
                disabled={disabled}
            />
            {/** @ts-ignore */}
            <Input
                type="text"
                name="slot"
                value={connectionInfo.slot}
                onChange={defaultChangeHandler}
                label="Slot"
                disabled={disabled}
            />
            {/** @ts-ignore */}
            <Input
                type="text"
                name="password"
                value={connectionInfo.password}
                onChange={defaultChangeHandler}
                label="Password"
                disabled={disabled}
            />
            <PrimaryButton
                onClick={() => {
                    connector?.connectToAP(connectionInfo)
                        .then(console.log)
                        .catch(console.error);
                }}
                disabled={disabled}
            >
                Connect
            </PrimaryButton>
        </Container>
    );
};

export default NewConnection;
