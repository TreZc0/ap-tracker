// @ts-check
import { API, Client } from "archipelago.js";
import CONNECTION_MESSAGES from "./connectionMessages";
import { setAPLocations, setupAPCheckSync } from "./checkSync";
import SavedConnectionManager from "../savedConnections/savedConnectionManager";
import { TrackerBuilder } from "../../games/TrackerBuilder";
import NotificationManager, {
    MessageType,
} from "../notifications/notifications";

const CONNECTION_STATUS = {
    disconnected: "Disconnected",
    connecting: "Connecting",
    connected: "Connected",
    error: "Error", // unrecoverable state
};

/**
 * @typedef Connector
 * @prop {({ host, port, slot, password }:{host:string, port: string, slot: string, password: string}) => Promise<{type: string,message: string}>} connectToAP
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
    // @ts-ignore
    window.APClient = client;
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

    setupAPCheckSync(client, checkManager, tagManager, connection);

    /**
     *
     * @param {Object} info
     * @param {string} info.host The Host to connect to
     * @param {string} info.port The port to connect to
     * @param {string} info.slot The name of the player slot to connect to
     * @param {string|undefined} info.password The password to use to connect
     * @returns
     */
    const connectToAP = async ({ host, port, slot, password }) => {
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

        if (slot.trim().length === 0) {
            throw CONNECTION_MESSAGES.generalError({
                message: "Please specify a slot name",
            });
        }

        if (!port) {
            port = "38281";
        }

        connection.status = CONNECTION_STATUS.connecting;
        NotificationManager.createToast({
            message: `Connecting to ${host}:${port} ...`,
            type: MessageType.info,
            duration: 3,
        });
        return client
            .login(`${host}:${port}`, slot, undefined, {
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

                client.socket.on("disconnected", () => {
                    connection.status = CONNECTION_STATUS.disconnected;
                    NotificationManager.createToast({
                        type: MessageType.warning,
                        message: "Disconnected from Archipelago Server",
                        duration: 10,
                    });
                });

                /** @type {import("../savedConnections/savedConnectionManager").SavedConnectionInfo} */
                let savedConnectionInfo = {
                    seed: client.room.seedName,
                    host,
                    slot,
                    port,
                    game: client.players.self.game,
                    playerAlias: client.players.self.alias,
                };
                let possibleMatches =
                    SavedConnectionManager.getExistingConnections(
                        savedConnectionInfo
                    );

                if (possibleMatches.size > 0) {
                    // Update existing entry
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
                setAPLocations(client, checkManager);
                client.storage
                    .fetchLocationNameGroups(client.game)
                    .then((a) => a[`_read_location_name_groups_${client.game}`])
                    .then((groups) => {
                        TrackerBuilder(
                            savedConnectionInfo.game,
                            checkManager,
                            entranceManager,
                            regionManager,
                            groupManager,
                            sectionManager,
                            {},
                            // @ts-ignore, there is a typing error on Archipelago.js
                            groups
                        );
                    });

                return CONNECTION_MESSAGES.connectionSuccess({
                    playerAlias: client.players.self.alias,
                    game: client.players.self.game,
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
                    game: "",
                    error: e,
                });
            });
    };
    return { connectToAP, connection };
};

export { CONNECTION_STATUS, createConnector };
