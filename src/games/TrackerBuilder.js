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
const trackers = {};

/** @type {Set<()=>void>} */
const trackerListeners = new Set();

/**
 * Get a callback for changes to tracker settings
 * @returns {(listener: () => void) =>(() => void)}
 */
const getTrackerSubscriberCallback = () => {
    return (listener) => {
        trackerListeners.add(listener);
        return () => {
            trackerListeners.delete(listener);
        };
    };
};

const callTrackerListeners = () => {
    trackerListeners.forEach((listener) => listener());
};

/**
 *
 * @param {string} game
 * @param {Tracker|null} tracker
 */
const setGameTracker = (game, tracker) => {
    if (tracker) {
        trackers[game] = tracker;
    } else {
        delete trackers[game];
    }
    callTrackerListeners();
};

/**
 *
 * @param {string} game
 * @returns {null | Tracker}
 */
const getGameTracker = (game) => {
    if (trackers[game]) {
        return trackers[game];
    }
    return null;
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

export {
    TrackerBuilder,
    getGameTracker,
    setGameTracker,
    getTrackerSubscriberCallback,
};
