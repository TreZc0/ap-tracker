// @ts-check
import { createContext } from "react";

/**
 * @typedef _SlotContext
 * @prop {string} host
 * @prop {string} port
 * @prop {string} slotName
 * @prop {string} game
 * @prop {string} password
 * @prop {string} [alias]
 * @prop {string} [seedHash]
 * @prop {number} [lastPlayed]
 * @prop {number} [created]
 * @prop {number} [uuid]
 */

/** @type {React.Context<_SlotContext>} */
const SlotContext = createContext({
    host: "archipelago.gg",
    port: "",
    slotName: "",
    password: "",
    game: "",
});

/**
 * @typedef _TrackerStateContext
 * @prop {string} connectionStatus
 */

/** @type {React.Context<_TrackerStateContext>} */
const TrackerStateContext = createContext({
    connectionStatus: "Disconnected",
});
const GameContext = createContext(null);
const InventoryContext = createContext(null);
const SectionContext = createContext(null);

const OptionContext = createContext(new Map());

export {
    SlotContext,
    GameContext,
    TrackerStateContext,
    InventoryContext,
    SectionContext,
    OptionContext,
};
