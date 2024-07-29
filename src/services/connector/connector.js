// @ts-check
import { Client, ITEMS_HANDLING_FLAGS } from "archipelago.js";
import CONNECTION_MESSAGES from "./connectionMessages";
import { setAPLocations, setupAPCheckSync } from "./checkSync";

const CONNECTION_STATUS = {
    disconnected: "Disconnected",
    connecting: "Connecting",
    connected: "Connected",
    error: "Error", // unrecoverable state
};

const client = new Client();
window.addEventListener("beforeunload", () => {
    client.disconnect();
});

setupAPCheckSync(client);

const connection = (() => {
    let connectionStatus = CONNECTION_STATUS.disconnected;
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
            setAPLocations(client);
            return CONNECTION_MESSAGES.connectionSuccess({
                playerAlias: client.players.alias(packet.slot),
            });
        })
        .catch((e) => {
            connection.status = CONNECTION_STATUS.disconnected;
            throw CONNECTION_MESSAGES.connectionFailed({
                host,
                port,
                slot,
                game,
                error: e,
            });
        });
};

export { CONNECTION_STATUS, connectToAP, connection };
