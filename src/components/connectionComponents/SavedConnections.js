import React, { useContext, useState, useSyncExternalStore } from "react";
import styled from "styled-components";
import { PrimaryButton, SecondaryButton } from "../buttons";
import SavedConnectionManager from "../../services/savedConnections/savedConnectionManager";
import SavedConnection from "./SavedConnection";
import ServiceContext from "../../contexts/serviceContext";
import _ from "lodash";
import { TrackerStateContext } from "../../contexts/contexts";
import { CONNECTION_STATUS } from "../../services/connector/connector";
import EditConnectionDialog from "./EditConnection";
import NotificationManager from "../../services/notifications/notifications";

const Container = styled.div`
    display: grid;
    align-items: end;
    justify-items: center;
    row-gap: 0.25em;
    width: 30vw;
    padding: 1em 2em;
    grid-template-rows: 2.5em 30em 4em;
`;

const SavedConnections = ({ ...props }) => {
    const trackerState = useContext(TrackerStateContext);
    const [editorOpen, setEditorOpen] = useState(false);
    const [selectedConnection, setSelectedConnection] = useState(null);
    const connectionData = useSyncExternalStore(
        SavedConnectionManager.getSubscriberCallback(),
        () => SavedConnectionManager.loadSavedConnectionData(),
        () => SavedConnectionManager.loadSavedConnectionData()
    );
    let allConnections = [];
    let connectionIds = Object.getOwnPropertyNames(connectionData.connections);

    const serviceContext = useContext(ServiceContext);
    const connector = serviceContext.connector;
    let disabled = false;
    if (
        !connector ||
        trackerState.connectionStatus !== CONNECTION_STATUS.disconnected
    ) {
        disabled = true;
    }

    for (let key of connectionIds) {
        allConnections.push(connectionData.connections[key]);
    }
    let sortedConnections = _.orderBy(allConnections, ["lastUsedTime"], "desc");

    const selectId = (id) => {
        if (id !== selectedConnection?.connectionId) {
            setSelectedConnection(connectionData.connections[id]);
        } else {
            connect();
        }
    };

    const connect = () => {
        if (selectedConnection) {
            let connectionInfo =
                SavedConnectionManager.getConnectionInfo(selectedConnection);
            connector
                .connectToAP(connectionInfo)
                .then((result) => {
                    NotificationManager.createToast({
                        ...result,
                    });
                })
                .catch((result) => {
                    NotificationManager.createToast({
                        ...result,
                    });
                });
        }
    };

    const openEditor = () => {
        if (selectedConnection) {
            setEditorOpen(true);
        }
    };

    const closeEditor = () => {
        setEditorOpen(false);
        setSelectedConnection(null);
    };

    return (
        <Container {...props}>
            <h2>Saved Connections</h2>
            <div style={{ overflowY: "auto", height: "30em" }}>
                {sortedConnections.length > 0 ? (
                    <>
                        {sortedConnections.map((connection) => (
                            <SavedConnection
                                key={connection.connectionId}
                                {...connection}
                                disabled={disabled}
                                selected={
                                    connection.connectionId ===
                                    selectedConnection?.connectionId
                                }
                                onClick={selectId}
                            />
                        ))}
                    </>
                ) : (
                    <div style={{ padding: "1em", color: "gray" }}>
                        <i>Create a new connection and it will appear here</i>
                    </div>
                )}
            </div>
            <span>
                <PrimaryButton
                    onClick={connect}
                    disabled={!selectedConnection || disabled}
                >
                    Connect
                </PrimaryButton>
                <SecondaryButton
                    onClick={openEditor}
                    disabled={!selectedConnection || disabled}
                >
                    Edit
                </SecondaryButton>
            </span>
            <EditConnectionDialog
                open={editorOpen}
                onClose={closeEditor}
                connection={selectedConnection}
            />
        </Container>
    );
};

export default SavedConnections;
