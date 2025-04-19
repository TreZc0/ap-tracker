import React, { useContext, useState } from "react";
import styled from "styled-components";
import { PrimaryButton } from "../buttons";
import { Input } from "../inputs";
import ServiceContext from "../../contexts/serviceContext";
import NotificationManager from "../../services/notifications/notifications";
import { CONNECTION_STATUS } from "../../services/connector/connector";

const Container = styled.div`
    display: grid;
    align-items: end;
    justify-items: center;
    justify-self: center;
    margin: auto 0;
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
    const [connectionInfo, setConnectionInfo] = useState({
        host: "multiworld.gg",
        port: "",
        slot: "",
        password: "",
    });

    const defaultChangeHandler = (event) => {
        setConnectionInfo({
            ...connectionInfo,
            [event.target.name]: event.target.value,
        });
    };
    const serviceContext = useContext(ServiceContext);
    const connector = serviceContext.connector;
    let disabled = false;
    if (!connector || connector.connection.status !== CONNECTION_STATUS.disconnected) {
        disabled = true;
    }

    return (
        <Container {...props}>
            <h2>New Connection</h2>
            <Input
                type="text"
                name="host"
                value={connectionInfo.host}
                onChange={defaultChangeHandler}
                label="Host"
                disabled={disabled}
            />
            <Input
                type="text"
                name="port"
                value={connectionInfo.port}
                onChange={defaultChangeHandler}
                label="Port"
                disabled={disabled}
            />
            <Input
                type="text"
                name="slot"
                value={connectionInfo.slot}
                onChange={defaultChangeHandler}
                label="Slot"
                disabled={disabled}
            />
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
                    connector
                        ?.connectToAP(connectionInfo)
                        .catch((result) => {
                            NotificationManager.createToast({
                                ...result,
                            });
                        });
                }}
                disabled={disabled}
            >
                Connect
            </PrimaryButton>
        </Container>
    );
};

export default NewConnection;
