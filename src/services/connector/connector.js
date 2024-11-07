// @ts-check
import { API, Client } from "archipelago.js";
import CONNECTION_MESSAGES from "./connectionMessages";
import { setAPLocations, setupAPCheckSync } from "./checkSync";
import SavedConnectionManager from "../savedConnections/savedConnectionManager";
import { TrackerBuilder } from "../../games/TrackerBuilder";

const CONNECTION_STATUS = {
    disconnected: "Disconnected",
    connecting: "Connecting",
    connected: "Connected",
    error: "Error", // unrecoverable state
};

/**
 * @typedef Connector
 * @prop {({ host, port, slot, game, password }:{host:string, port: string|number, slot: string, game: string, password: string}) => Promise<{type: string,message: string}>} connectToAP
 * @prop {{status: string;readonly subscribe: (listener: () => void) => () => void;readonly unsubscribe: (listener: () => void) => void;readonly client: Client;}} connection
 *
 */

/**
 *
 * @param {import("../checks/checkManager").CheckManager} checkManager
 * @param {import("../entrances/entranceManager").EntranceManager} entranceManager
 * @param {import("../regions/regionManager").RegionManager} regionManager
 * @param {import("../sections/groupManager").GroupManager} groupManager
 * @param {import("../sections/sectionManager").SectionManager} sectionManager
 * @param {import("../tags/tagManager").TagManager} tagManager
 */
const createConnector = (
    checkManager,
    entranceManager,
    regionManager,
    groupManager,
    sectionManager,
    tagManager
) => {
    const client = new Client();

    const connection = (() => {
        let connectionStatus = CONNECTION_STATUS.disconnected;
        let slotInfo = { slotName: "", alias: "", connectionId: "" };
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

        return client
            .login(`${host}:${port}`, slot, game, {
                tags: ["Tracker", "Checklist"],
                password,
                items: API.itemsHandlingFlags.all,
            })
            .then((packet) => {
                connection.status = CONNECTION_STATUS.connected;
                connection.slotInfo = {
                    ...connection.slotInfo,
                    slotName: slot,
                    alias: client.players.self.alias,
                };

                /** @type {import("../savedConnections/savedConnectionManager").SavedConnectionInfo} */
                let savedConnectionInfo = {
                    seed: client.room.seedName,
                    host,
                    slot,
                    port,
                    game,
                    playerAlias: client.players.self.alias,
                };
                let possibleMatches =
                    SavedConnectionManager.getExistingConnections(
                        savedConnectionInfo
                    );

                if (possibleMatches.size > 0) {
                    // Update exisitng entry
                    let chosenConnection = [...possibleMatches.values()][0];
                    chosenConnection.lastUsedTime = Date.now();
                    chosenConnection.host = savedConnectionInfo.host;
                    chosenConnection.port = savedConnectionInfo.port;
                    chosenConnection.playerAlias =
                        savedConnectionInfo.playerAlias;
                    SavedConnectionManager.saveConnectionData(chosenConnection);
                    connection.slotInfo = {
                        ...connection.slotInfo,
                        connectionId: chosenConnection.connectionId,
                    };
                } else {
                    // Create a new entry
                    let newConnectionData =
                        SavedConnectionManager.createNewSavedConnection(
                            savedConnectionInfo
                        );
                    SavedConnectionManager.saveConnectionData(
                        newConnectionData
                    );
                    connection.slotInfo = {
                        ...connection.slotInfo,
                        connectionId: newConnectionData.connectionId,
                    };
                }
                setupAPCheckSync(
                    client,
                    checkManager,
                    connection.slotInfo.connectionId,
                    tagManager
                );
                setAPLocations(client, checkManager);

                TrackerBuilder(
                    game,
                    checkManager,
                    entranceManager,
                    regionManager,
                    groupManager,
                    sectionManager,
                    {}
                );

                return CONNECTION_MESSAGES.connectionSuccess({
                    playerAlias: client.players.self.alias,
                });
            })
            .catch((e) => {
                connection.status = CONNECTION_STATUS.disconnected;
                connection.slotInfo = {
                    ...connection.slotInfo,
                    name: "",
                    alias: "",
                };
                throw CONNECTION_MESSAGES.connectionFailed({
                    host,
                    port,
                    slot,
                    game,
                    error: e,
                });
            });
    };
    return { connectToAP, connection };
};

export { CONNECTION_STATUS, createConnector };
