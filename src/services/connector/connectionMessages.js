// @ts-check

/**
 * @typedef ConnectionMessage
 * @prop {'error' | 'info' | 'success' | 'warning'} type
 * @prop {string} message
 * @prop {string} [details]
 *
 */

const CONNECTION_MESSAGES = {
    alreadyConnected: () => ({
        type: "info",
        message: "Tracker is already connected to the archipelago server.",
    }),
    alreadyConnecting: () => ({
        type: "info",
        message:
            "Tracker is already trying to connect to the archipelago server.",
    }),
    connectionSuccess: ({ playerAlias }) => ({
        type: "success",
        message: `Successfully connected as ${playerAlias}`,
    }),
    connectionFailed: ({ host, port, slot, game, error }) => {
        let help = `${
            host === "archipelago.gg"
                ? "You can restart the server on archipelago.gg by reloading the room page."
                : "Check with the server host for server status."
        }`;
        let message = `Failed to connect to server ${host}:${port}. Check connection details and ensure the server is running. ${help}`;

        if (typeof error[0] === "string") {
            let e = error[0];
            switch (e) {
                case "InvalidSlot": {
                    message = `Failed to connect to slot. The slot name "${slot}" was invalid.`;
                    break;
                }
                case "InvalidGame": {
                    message = `Failed to connect to slot. The game "${game}" was invalid.`;
                    break;
                }
                default: {
                    message = `Failed to connect to slot. Reason: ${e}`;
                }
            }
        }
        return {
            type: "error",
            message,
        };
    },
    generalError: ({ message }) => ({
        type: "error",
        message,
    }),
    insecureWebsocketWarning: () => ({
        type: "warning",
        message: "Tracker may not be able to connect to insecure host.",
        details:
            "Due to web standards, a web page served from an secure site (https) cannot connect to an insecure web socket. If you wish to connect to an insecure websocket, consider hosting the tracker locally (instructions in readme.md of project).",
    }),
};

export default CONNECTION_MESSAGES;
