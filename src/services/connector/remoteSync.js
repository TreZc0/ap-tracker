// @ts-check
/** @import {Client} from "archipelago.js" */

/**
 * @typedef NoteData
 * @prop {number[]} [bytes]
 * @prop {string|null} compression
 * @prop {number} timestamp
 */

/** @type {Client} */
let client = null;
// /** @type {import("../tags/tagManager").TagManager} */
// let tagManager = null;

const NOTE_KEY = "_tracker_note";
/**
 *
 * @param {string} note
 */
const saveNote = async (note) => {
    if (!client || !client.authenticated) {
        throw new Error(
            "Failed to save note, no connection to Archipelago Server."
        );
    }
    let key = `${NOTE_KEY}_${client.players.self.team}_${client.players.self.slot}`;
    await client.storage
        .prepare(key, { text: "", timestamp: Date.now() })
        .update({ text: note, timestamp: Date.now() })
        .commit();
};

const loadNote = async () => {
    if (!client || !client.authenticated) {
        throw new Error(
            "Failed to load note, no connection to Archipelago Server."
        );
    }
    let key = `${NOTE_KEY}_${client.players.self.team}_${client.players.self.slot}`;
    let value = await client.storage.fetch([key], true);
    return (value[key] ?? { text: "" })["text"];
};

// const saveTags = async () => {
//     if (!client || !client.authenticated) {
//         throw new Error(
//             "Failed to save tags, no connection to Archipelago Server."
//         );
//     }
// };

/**
 *
 * @param {Client} client_
 * @param {import("../tags/tagManager").TagManager} tagManager_
 */
const enableDataSync = (client_, tagManager_) => {
    client = client_;
    // tagManager = tagManager_;
};

export { saveNote, loadNote, enableDataSync };
