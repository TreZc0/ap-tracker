import { Client } from "archipelago.js";
import TextClientManager from "../textClientManager";

const setupAPTextSync = (
    client: Client,
    textClientManager: TextClientManager
) => {
    client.messages
        .on("adminCommand", (_text, nodes) =>
            textClientManager.addMessage("adminCommand", nodes, client)
        )
        .on("chat", (_text, player, nodes) =>
            textClientManager.addPlayerMessage("chat", player, nodes, client)
        )
        .on("collected", (_text, player, nodes) =>
            textClientManager.addPlayerMessage(
                "collected",
                player,
                nodes,
                client
            )
        )
        .on("connected", (_text, player, _tags, nodes) =>
            textClientManager.addPlayerMessage(
                "connected",
                player,
                nodes,
                client
            )
        )
        .on("countdown", (_text, _value, nodes) =>
            textClientManager.addMessage("countdown", nodes, client)
        )
        .on("disconnected", (_text, player, nodes) =>
            textClientManager.addPlayerMessage(
                "disconnected",
                player,
                nodes,
                client
            )
        )
        .on("goaled", (_text, player, nodes) =>
            textClientManager.addPlayerMessage("goaled", player, nodes, client)
        )
        .on("itemCheated", (_text, item, nodes) =>
            textClientManager.addItemMessage("itemCheated", item, nodes, client)
        )
        .on("itemHinted", (_text, item, _found, nodes) =>
            textClientManager.addItemMessage("itemHinted", item, nodes, client)
        )
        .on("itemSent", (_text, item, nodes) =>
            textClientManager.addItemMessage("itemSent", item, nodes, client)
        )
        .on("released", (_text, player, nodes) =>
            textClientManager.addPlayerMessage(
                "released",
                player,
                nodes,
                client
            )
        )
        .on("serverChat", (_text, nodes) =>
            textClientManager.addMessage("serverChat", nodes, client)
        )
        .on("tagsUpdated", (_text, player, _tags, nodes) =>
            textClientManager.addPlayerMessage(
                "tagsUpdated",
                player,
                nodes,
                client
            )
        )
        .on("tutorial", (_text, nodes) =>
            textClientManager.addMessage("tutorial", nodes, client)
        )
        .on("userCommand", (_text, nodes) =>
            textClientManager.addMessage("userCommand", nodes, client)
        );
};

export { setupAPTextSync };
