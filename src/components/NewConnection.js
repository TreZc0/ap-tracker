import React, { useState } from "react";
import styled from "styled-components";
import { PrimaryButton } from "./buttons";
import { Input } from "./inputs";
import { connectToAP } from "../services/connector/connector";

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
        "slot"
        "password"
        "connect";
    grid-template-rows: repeat(5, 2.5em) 4em;
`;

const NewConnection = ({ ...props }) => {
    const [connectionInfo, setconnectionInfo] = useState({
        host: "archipelago.gg",
        port: "",
        slot: "",
        password: "",
        game: "Ocarina of Time",
    });

    const defaultChangeHandler = (event) => {
        setconnectionInfo({
            ...connectionInfo,
            [event.target.name]: event.target.value,
        });
    };

    return (
        <Container {...props}>
            <h2>New Connection</h2>
            <Input
                type="text"
                name="host"
                value={connectionInfo.host}
                onChange={defaultChangeHandler}
                label="Host"
            />
            <Input
                type="text"
                name="port"
                value={connectionInfo.port}
                onChange={defaultChangeHandler}
                label="Port"
            />
            <Input
                type="text"
                name="slot"
                value={connectionInfo.slot}
                onChange={defaultChangeHandler}
                label="Slot"
            />
            <Input
                type="text"
                name="password"
                value={connectionInfo.password}
                onChange={defaultChangeHandler}
                label="Password"
            />
            <PrimaryButton
                onClick={() => {
                    connectToAP(connectionInfo)
                        .then(console.log)
                        .catch(console.error);
                }}
            >
                Connect
            </PrimaryButton>
        </Container>
    );
};

export default NewConnection;
