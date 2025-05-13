import { Client, JSONMessagePart, Player, PrintJSONPacket, ValidJSONColorType } from "archipelago.js";

const keyGen = (() => {
    let next = 0;
    return () => next++;
})()

// https://github.com/ArchipelagoMW/Archipelago/blob/main/docs/network%20protocol.md#hintstatus
enum HintStatus {
    unspecified = 0,
    no_priority = 10,
    avoid = 20,
    priority = 30,
    found = 40,
}

interface TextMessagePart {
    type: "text";
    text: string;
}

interface PlayerMessagePart {
    type: "player";
    text: string;
    player?: Player;
}

interface ItemMessagePart {
    type: "item";
    text: string;
    flags: number;
    player: Player;
}

interface LocationMessagePart {
    type: "location";
    text: string;
    player: Player;
}

interface EntranceMessagePart {
    type: "entrance";
    text: string;
}

interface HintStatusMessagePart {
    type: "hint_status";
    text: string;
    hint_status: HintStatus;
}

interface ColorMessagePart {
    type: "color";
    text: string;
    color: ValidJSONColorType;
}

type MessagePart = (TextMessagePart |
    PlayerMessagePart |
    ItemMessagePart |
    LocationMessagePart |
    EntranceMessagePart |
    HintStatusMessagePart |
    ColorMessagePart) & { key: number };


class TextClientManager {
    #messages: MessagePart[][] = [];
    #listeners: Set<() => void> = new Set();
    messageBufferSize = 1000;
    allowedTypes = new Set(["ItemSend", "ItemCheat", "Hint", "Join", "Part", "Chat", "ServerChat", "Tutorial", "TagsChanged", "CommandResult", "AdminCommandResult", "Goal", "Release", "Collect", "Countdown"]);
    filterItemSends = true;
    #callListeners = () => {
        this.#listeners.forEach(listener => listener());
    }

    #parseMessagePart = (part: JSONMessagePart, client: Client): MessagePart => {
        let messagePart: MessagePart = null;
        const key = keyGen();
        if (part.type === "item_id") {
            const player = client.players.findPlayer(part.player);
            messagePart = {
                key,
                text: client.package.lookupItemName(player.game, Number(part.text)),
                type: "item",
                flags: part.flags,
                player
            }
        } else if (part.type === "item_name") {
            const player = client.players.findPlayer(part.player);
            messagePart = {
                key,
                text: part.text,
                type: "item",
                flags: part.flags,
                player
            }
        } else if (part.type === "location_id") {
            const player = client.players.findPlayer(part.player);
            messagePart = {
                key,
                text: client.package.lookupLocationName(player.game, Number(part.text)),
                type: "location",
                player,
            }
        } else if (part.type === "location_name") {
            const player = client.players.findPlayer(part.player);
            messagePart = {
                key,
                text: part.text,
                type: "location",
                player,
            }
        } else if (part.type === "entrance_name") {
            messagePart = {
                key,
                text: part.text,
                type: "entrance",
            }
        } else if (part.type === "player_id") {
            const player = client.players.findPlayer(Number(part.text));
            messagePart = {
                key,
                type: "player",
                text: player.alias,
                player,
            }
        } else if (part.type === "player_name") {
            messagePart = {
                key,
                type: "player",
                text: part.text,
            }
        } else if (part.type === "color") {
            messagePart = {
                key,
                text: part.text,
                type: "color",
                color: part.color,
            }
        } else {
            messagePart = {
                key,
                text: part.text,
                type: "text",
            }
        }

        return messagePart;

    }

    /** Appends a message of a specific color, note color is not really used at the moment */
    echo = (message: string, color: ValidJSONColorType) => {
        const simplifiedMessageParts: MessagePart[] = [{
            key: keyGen(),
            text: message,
            type: "color",
            color,
        }];
        const start = Math.max(0, (this.#messages.length + 1) - this.messageBufferSize)
        this.#messages = [...this.#messages.slice(start), simplifiedMessageParts];
        this.#callListeners();
    }

    /** Processes a PrintJSONPacket into a Simpler message format */
    addMessage = (packet: PrintJSONPacket, client: Client) => {
        const { data, type } = packet;
        if (!this.allowedTypes.has(type)) {
            return;
        }

        if (type === "ItemSend" && this.filterItemSends) {
            const player = client.players.self.slot;
            if (player !== packet.receiving && player !== packet.item.player) {
                return;
            }
        }

        const simplifiedMessageParts = data.map((part) => this.#parseMessagePart(part, client));
        const start = Math.max(0, (this.#messages.length + 1) - this.messageBufferSize)
        this.#messages = [...this.#messages.slice(start), simplifiedMessageParts];
        this.#callListeners();
    }

    getMessages = () => {
        return this.#messages;
    }

    processCommand = (text: string) => {
        this.echo(text, "bold");
        switch (text) {
            case "help": {
                this.echo("Available commands:", null);
                this.echo("/help: Display this helpful message", null);
                break;
            }
            default: {
                this.echo(`Unrecognized command: ${text}, run /help for a list of available commands`, "red");
                break;
            }
        }
    }

    processInput = (text: string, client: Client) => {
        if (text.startsWith("/")) {
            return this.processCommand(text.substring(1));
        }
        client.messages.say(text);
    }


    /**
     * Creates a callback that can be used to subscribe to new messages
     * @returns A callback that accepts a listener callback as a parameter and returns a clean up callback.
     */
    getMessageSubscriber = (): (listener: () => void) => () => void => {
        return (listener) => {
            this.#listeners.add(listener);
            return () => {
                // Clean up callback
                this.#listeners.delete(listener);
            }
        }
    }


}

export default TextClientManager
export { HintStatus }
export type { MessagePart }