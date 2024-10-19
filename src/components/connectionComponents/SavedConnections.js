import React, {useContext, useState, useSyncExternalStore} from "react";
import styled from "styled-components";
import { PrimaryButton, SecondaryButton } from "../buttons";
import SavedConnectionManager from "../../services/savedConnections/savedConnectionManager";
import SavedConnection from "./SavedConnection";
import ServiceContext from "../../contexts/serviceContext";
import _ from 'lodash'
import { TrackerStateContext } from "../../contexts/contexts";
import { CONNECTION_STATUS } from "../../services/connector/connector";
import EditConnectionDiaolog from "./EditConnection";
const Container = styled.div`
    display: grid;
    align-items: end;
    justify-items: center;
    row-gap: 0.25em;
    width: 30vw;
    padding: 1em 2em;
    grid-template-rows: 2.5em 15em 4em;
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
    if (!connector || trackerState.connectionStatus !== CONNECTION_STATUS.disconnected) {
         disabled = true;
    }

    for(let key of connectionIds){
        allConnections.push(connectionData.connections[key]);
    }
    let sortedConnections = _.orderBy(allConnections, ['lastUsedTime'], 'desc');

    const selectId = (id) => {
        if(id !== selectedConnection?.connectionId){
            setSelectedConnection(connectionData.connections[id]);
        }else{
            connect();
        }
    }

    const connect = () => {
        if(selectedConnection){
            let connectionInfo = SavedConnectionManager.getConnectionInfo(selectedConnection);
            connector.connectToAP(connectionInfo).then(console.log).catch(console.error);// TODO, error handeling
        }
    }

    const openEditor = () => {
        if(selectedConnection){
            setEditorOpen(true);
        }
    }

    const closeEditor = () => {
        setEditorOpen(false);
        setSelectedConnection(null);
    }

    return (
        <Container {...props}>
            <h2>Saved Connections</h2>
            <div style={{overflowY:"scroll", height:"15em"}}>
                {sortedConnections.map((connection) => <SavedConnection key={connection.connectionId} {...connection} disabled={disabled} selected={connection.connectionId === selectedConnection?.connectionId} onClick={selectId}/>)}
            </div>
            <span>
                <PrimaryButton onClick={connect} disabled={!selectedConnection && true}>Connect</PrimaryButton>
                <SecondaryButton onClick={openEditor} disabled={!selectedConnection && true} >Edit</SecondaryButton>
            </span>
            <EditConnectionDiaolog open={editorOpen} onClose={closeEditor} connection={selectedConnection}/>
        </Container>
    );
};

export default SavedConnections;
