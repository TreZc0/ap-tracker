import { Client } from "archipelago.js";
import TextClientManager from "../textClientManager";

const setupAPTextSync = (client: Client, textClientManager: TextClientManager) => {
    client.socket.on("printJSON", (packet) => {
        textClientManager.addMessage(packet, client);
    });
}

export { setupAPTextSync }