import { Client, Item, MessageNode, Player, ValidJSONColorType } from "archipelago.js";
import { globalOptionManager } from "./options/optionManager";
import { generateId } from "../utility/randomIdGen";


interface APMessage {
    parts: (MessageNode | EchoMessageNode)[],
    key: string,
}

interface EchoMessageNode {
    type: "echo",
    text: string,
    color: ValidJSONColorType,
}

type SimpleMessageType = ("command" | "chat" | "status" | "login" | "misc" | "item");
type ItemType = ("trap" | "progression" | "useful" | "normal");
type MessageFilter = {
    allowedTypes: SimpleMessageType[],
    itemSendFilter: {
        own: ItemType[],
        others: ItemType[],
    }
}

globalOptionManager.loadScope("textClient");
globalOptionManager.setOptionDefault("messageFilter", "textClient", {
    allowedTypes: ["command", "chat", "status", "login", "misc", "item"],
    itemSendFilter: {
        own: ["trap", "progression", "useful", "normal"],
        others: ["trap", "progression", "useful", "normal"],
    }
} as MessageFilter)

const messageTypeCategoryMap = {
    "adminCommand": "command",
    "userCommand": "command",
    "chat": "chat",
    "serverChat": "chat",
    "collected": "status",
    "released": "status",
    "goaled": "status",
    "tagsUpdated": "status",
    "connected": "login",
    "disconnected": "login",
    "tutorial": "misc",
    "countDown": "misc",
    "itemCheated": "item",
    "itemHinted": "item",
    "itemSent": "item",
}

class TextClientManager {
    #messages: APMessage[] = [];
    #listeners: Set<() => void> = new Set();
    messageBufferSize = 500;

    #callListeners = () => {
        this.#listeners.forEach(listener => listener());
    }

    /** Appends a message of a specific color/style */
    echo = (message: string, color: ValidJSONColorType) => {
        const parts: EchoMessageNode[] = [{
            type: "echo",
            text: message,
            color: color,
        }];
        const apMessage: APMessage = {
            key: generateId(),
            parts,
        }
        const start = Math.max(0, (this.#messages.length + 1) - this.messageBufferSize)
        this.#messages = [...this.#messages.slice(start), apMessage];
        this.#callListeners();
    }

    #isMessageWanted = ({ type, item }: { type: string, player?: Player, item?: Item }, client: Client): boolean => {
        const messageFilter: MessageFilter = globalOptionManager.getOptionValue("messageFilter", "textClient") as MessageFilter;
        const simplifiedType: SimpleMessageType = messageTypeCategoryMap[type];

        if (!messageFilter.allowedTypes.includes(simplifiedType)) {
            return false;
        }

        if (simplifiedType === "item" && item) {
            const self = client.players.self;
            let matches = false;
            if (item.receiver.slot === self.slot && item.receiver.team === self.team || item.sender.slot === self.slot && item.sender.team === self.team) {
                if (item.progression && messageFilter.itemSendFilter.own.includes("progression")) {
                    matches = true;
                } else if (item.useful && messageFilter.itemSendFilter.own.includes("useful")) {
                    matches = true;
                } else if (item.trap && messageFilter.itemSendFilter.own.includes("trap")) {
                    matches = true;
                } else if (item.filler && messageFilter.itemSendFilter.own.includes("normal")) {
                    matches = true;
                }
            } else {
                if (item.progression && messageFilter.itemSendFilter.others.includes("progression")) {
                    matches = true;
                } else if (item.useful && messageFilter.itemSendFilter.others.includes("useful")) {
                    matches = true;
                } else if (item.trap && messageFilter.itemSendFilter.others.includes("trap")) {
                    matches = true;
                } else if (item.filler && messageFilter.itemSendFilter.others.includes("normal")) {
                    matches = true;
                }
            }
            return matches;
        }
        return true;
    }

    #addMessage = (nodes: MessageNode[]) => {
        const parts = nodes;//data.map((part) => this.#parseMessagePart(part, client));
        const apMessage: APMessage = {
            key: generateId(),
            parts,
        }
        const start = Math.max(0, (this.#messages.length + 1) - this.messageBufferSize)
        this.#messages = [...this.#messages.slice(start), apMessage];
        this.#callListeners();
    }

    addMessage = (type: string, nodes: MessageNode[], client: Client) => {
        if (!this.#isMessageWanted({ type }, client)) {
            return;
        }
        this.#addMessage(nodes);
    }

    addPlayerMessage = (type: string, player: Player, nodes: MessageNode[], client: Client) => {
        if (!this.#isMessageWanted({ type, player }, client)) {
            return;
        }
        this.#addMessage(nodes);
    }

    addItemMessage = (type: string, item: Item, nodes: MessageNode[], client: Client) => {
        if (!this.#isMessageWanted({ type, item }, client)) {
            return;
        }
        this.#addMessage(nodes);
    }

    getMessages = () => {
        return this.#messages;
    }

    processCommand = (text: string) => {
        this.echo(text, "underline");
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
// export { HintStatus }
export type { APMessage, MessageNode, EchoMessageNode, MessageFilter, SimpleMessageType, ItemType }