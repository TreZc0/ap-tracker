// @ts-check
import { Client, ITEMS_HANDLING_FLAGS } from "archipelago.js";
import CONNECTION_MESSAGES from "./connectionMessages";
import { setAPLocations, setupAPCheckSync } from "./checkSync";
import SavedConnectionManager from "../savedConnections/savedConnectionManager";

const CONNECTION_STATUS = {
    disconnected: "Disconnected",
    connecting: "Connecting",
    connected: "Connected",
    error: "Error", // unrecoverable state
};

/**
 * @typedef Connector
 * @prop {({ host, port, slot, game, password }:{host:string, port: string|number, slot: string, game: string, password: string}) => Promise<{type: string,message: string}>} connectToAP
 * @prop {{status: string;readonly subscribe: (listener: () => void) => () => void;readonly unsubscribe: (listener: () => void) => void;readonly client: Client<import("archipelago.js").SlotData>;}} connection
 * 
 */

/**
 * 
 * @param {import("../checks/checkManager").CheckManager} checkManager 
 */
const createConnector = (checkManager) => {
    const client = new Client();
    window.addEventListener("beforeunload", () => {
        client.disconnect();
    });
    
    setupAPCheckSync(client, checkManager);
    
    const connection = (() => {
        let connectionStatus = CONNECTION_STATUS.disconnected;
        let slotInfo = {slotName: "", alias:""}
        /** @type {Set<()=>void>} */
        let listeners = new Set();
        const subscribe = (/** @type {() => void} */ listener) => {
            listeners.add(listener);
            return () => unsubscribe(listener);
        };
        const unsubscribe = (/** @type {() => void} */ listener) => {
            listeners.delete(listener);
        };
        const callListeners = () => {
            listeners.forEach((listener) => listener());
        };
        return {
            get status() {
                return connectionStatus;
            },
            set status(val) {
                connectionStatus = val;
                callListeners();
            },
            get slotInfo() {
                return slotInfo;
            },
            set slotInfo(val) {
                slotInfo = val;
                callListeners();
            },
            get subscribe() {
                return subscribe;
            },
            get unsubscribe() {
                return unsubscribe;
            },
            get client() {
                return client;
            },
        };
    })();
    
    const connectToAP = async ({ host, port, slot, game, password }) => {
        if (connection.status !== CONNECTION_STATUS.disconnected) {
            if (connection.status === CONNECTION_STATUS.connected) {
                throw CONNECTION_MESSAGES.alreadyConnected();
            } else if (connection.status === CONNECTION_STATUS.connecting) {
                throw CONNECTION_MESSAGES.alreadyConnecting();
            } else {
                throw CONNECTION_MESSAGES.generalError({
                    message:
                        "The tracker is in an error state, please refresh the page.",
                });
            }
        }
    
        // verify
        if (host.trim().length === 0) {
            throw CONNECTION_MESSAGES.generalError({
                message: "Please specify a host address",
            });
        }
    
        if (
            port.trim().length === 0 ||
            !(0 <= parseInt(port) && parseInt(port) <= 65535)
        ) {
            throw CONNECTION_MESSAGES.generalError({
                message: "Invalid port number",
            });
        }
    
        if (slot.trim().length === 0) {
            throw CONNECTION_MESSAGES.generalError({
                message: "Please specify a slot name",
            });
        }
    
        if (game.trim().length === 0) {
            throw CONNECTION_MESSAGES.generalError({
                message: "Please specify a game",
            });
        }
    
        connection.status = CONNECTION_STATUS.connecting;
    
        /** @type {import("archipelago.js").ConnectionInformation} */
        const connectionInfo = {
            hostname: host,
            port: parseInt(port),
            name: slot,
            game,
            items_handling: ITEMS_HANDLING_FLAGS.REMOTE_ALL,
            password,
            tags: ["Tracker"],
        };
    
        return client
            .connect(connectionInfo)
            .then((packet) => {
                connection.status = CONNECTION_STATUS.connected;
                connection.slotInfo = {...connection.slotInfo, slotName:client.players.name(packet.slot) , alias: client.players.alias(packet.slot)}
                setAPLocations(client, checkManager);
                /** @type {import("../savedConnections/savedConnectionManager").SavedConnectionInfo} */
                let savedConnectionInfo = {
                    seed: client.data.seed,
                    host: connectionInfo.hostname,
                    slot: connectionInfo.name,
                    port: connectionInfo.port,
                    game: connectionInfo.game,
                    playerAlias: client.players.alias(packet.slot),
                }
                let possibleMatches = SavedConnectionManager.getExistingConnections(savedConnectionInfo);

                if (possibleMatches.size > 0){
                    // Update exisitng entry
                    let chosenConnection = [...possibleMatches.values()][0];
                    chosenConnection.lastUsedTime = Date.now();
                    chosenConnection.host = savedConnectionInfo.host;
                    chosenConnection.port = savedConnectionInfo.port;
                    chosenConnection.playerAlias = savedConnectionInfo.playerAlias;
                    SavedConnectionManager.saveConnectionData(chosenConnection);
                } else {
                    // Create a new entry
                    let newConnectionData = SavedConnectionManager.createNewSavedConnection(savedConnectionInfo);
                    SavedConnectionManager.saveConnectionData(newConnectionData);
                }

                return CONNECTION_MESSAGES.connectionSuccess({
                    playerAlias: client.players.alias(packet.slot),
                });
            })
            .catch((e) => {
                connection.status = CONNECTION_STATUS.disconnected;
                connection.slotInfo = {...connection.slotInfo, name:"", alias:""}
                return CONNECTION_MESSAGES.connectionFailed({
                    host,
                    port,
                    slot,
                    game,
                    error: e,
                });
            });
    };
    return {connectToAP, connection}
}



export { CONNECTION_STATUS, createConnector };
