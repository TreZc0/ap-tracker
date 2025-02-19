// @ts-check
import { buildGenericGame } from "./generic/genericGame.js";

/**
 * @callback TrackerBuilder
 * @param {import("../services/checks/checkManager").CheckManager} checkManager
 * @param {import("../services/entrances/entranceManager").EntranceManager} entranceManager
 * @param {import("../services/sections/groupManager").GroupManager} groupManager
 * @param {import("../services/sections/sectionManager").SectionManager} sectionManager
 * @param {*} slotData
 * @returns {void}
 */

/**
 * @typedef Tracker
 * @prop {string} name The name to display for this tracker
 * @prop {string} gameName The name of the game according to AP
 * @prop {string} id A unique id for the tracker
 * @prop {string} [gameTitle] Use this instead of name if defined - unused
 * @prop {string} [gameAbbreviation] Use title if not defined - unused
 * @prop {TrackerBuilder} buildTracker
 */

/** @type {Object.<string, Tracker>} */
const trackers = {
    // "Ocarina of Time": () => require("./OOT/oot.js").default,
};

/**
 *
 * @param {String} gameName
 * @param {import("../services/checks/checkManager").CheckManager} checkManager
 * @param {import("../services/entrances/entranceManager").EntranceManager} entranceManager
 * @param {import("../services/sections/groupManager").GroupManager} groupManager
 * @param {import("../services/sections/sectionManager").SectionManager} sectionManager
 * @param {*} slotData
 * @param {Object.<string, string[]>} groups
 */
const TrackerBuilder = (
    gameName,
    checkManager,
    entranceManager,
    groupManager,
    sectionManager,
    slotData,
    groups
) => {
    const gameList = new Set(Object.getOwnPropertyNames(trackers));
    let game = null;
    if (gameList.has(gameName)) {
        game = trackers[gameName];
    } else {
        game = buildGenericGame(gameName, checkManager, groups);
    }
    game.buildTracker(
        checkManager,
        entranceManager,
        groupManager,
        sectionManager,
        slotData
    );
};

export { TrackerBuilder, trackers };
