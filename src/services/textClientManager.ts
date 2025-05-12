import { Client, JSONMessagePart, Player, PrintJSONPacket } from "archipelago.js";

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
    color: unknown;
}

type MessagePart = (TextMessagePart | 
                    PlayerMessagePart | 
                    ItemMessagePart | 
                    LocationMessagePart | 
                    EntranceMessagePart | 
                    HintStatusMessagePart |
                    ColorMessagePart) & {key: number};


class TextClientManager {
    #messages: MessagePart[][] = [];
    #listeners: Set<() => void> = new Set();

    #callListeners = () => {
        this.#listeners.forEach(listener => listener());
    }

    #parseMessagePart = (part: JSONMessagePart, client: Client): MessagePart => {
        let messagePart: MessagePart = null;
        const key = keyGen();

        if (part.type === "item_id"){
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
                type:"location",
                player,
            }
        } else if (part.type === "location_name") {
            const player = client.players.findPlayer(part.player);
            messagePart = {
                key,
                text: part.text,
                type:"location",
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
                type:"player",
                text: player.alias,
                player,
            }
        } else if (part.type === "player_name"){
            messagePart = {
                key,
                type:"player",
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

    addMessage = ({ data }: PrintJSONPacket, client: Client) => {
        const simplifiedMessageParts = data.map((part) => this.#parseMessagePart(part, client));
        this.#messages = [...this.#messages, simplifiedMessageParts];
        this.#callListeners();
    }

    getMessages = () => {
        return this.#messages;
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
export {HintStatus}
export type {MessagePart}