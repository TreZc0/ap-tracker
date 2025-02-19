// @ts-check
import { trackers as configuredTrackers } from "./TrackerBuilder";
/** @import {Tracker} from "./TrackerBuilder" */

const modified = Symbol("modified");

/** @type {Map<string, Tracker>} */
const allTrackers = new Map();
/** @type {Map<string, Set<string>>} */
const gameTrackers = new Map();

/** @type {Set<()=>void>} */
const directoryListeners = new Set();

let directoryLastModified = Date.now();
/** @type {{games: string[], trackers:Tracker[], [modified]:number}} */
let cachedDirectory = {
    games: [],
    trackers: [],
    [modified]: 0,
};
/**
 *
 * @returns {(listener: () => void) =>(() => void)}
 */
const getDirectorySubscriberCallback = () => {
    return (listener) => {
        directoryListeners.add(listener);
        return () => {
            directoryListeners.delete(listener);
        };
    };
};

const callTrackerDirectoryListeners = () => {
    directoryListeners.forEach((listener) => listener());
};

/**
 *
 * @returns {{games: string[], trackers:Tracker[]}}
 */
const getDirectory = () => {
    if (directoryLastModified > cachedDirectory[modified]) {
        let result = {
            games: [...gameTrackers.keys()],
            trackers: [...allTrackers.values()],
            [modified]: Date.now(),
        };
        cachedDirectory = result;
    }
    return cachedDirectory;
};

/**
 * Adds a tracker to the list of available options
 * @param {Tracker} tracker
 */
const registerTracker = (tracker) => {
    if (tracker.gameName === undefined) {
        throw new Error(
            "Failed to register game, games must have a name. Generic games can be registered with empty strings"
        );
    }
    allTrackers.set(tracker.id, tracker);
    let currentTrackers = gameTrackers.get(tracker.gameName) ?? new Set();
    currentTrackers.add(tracker.id);
    gameTrackers.set(tracker.gameName, currentTrackers);
    directoryLastModified = Date.now();
    callTrackerDirectoryListeners();
};

/**
 * Removes a tracker from the list of available options
 * @param {string} trackerId
 */
const removeTracker = (trackerId) => {
    let tracker = allTrackers.get(trackerId);
    if (tracker) {
        allTrackers.delete(trackerId);
        let currentTrackers = gameTrackers.get(tracker.gameName) ?? new Set();
        currentTrackers.delete(tracker.id);
        if (currentTrackers.size > 0) {
            gameTrackers.set(tracker.gameName, currentTrackers);
        } else {
            gameTrackers.delete(tracker.gameName);
        }
        directoryLastModified = Date.now();
        if (configuredTrackers[tracker.gameName].id === tracker.id) {
            delete configuredTrackers[tracker.gameName];
        }
        callTrackerDirectoryListeners();
    }
};
/**
 *
 * @param {string} game
 * @param {Tracker} tracker
 */
const setTracker = (game, tracker) => {
    // TODO, make it so setting with game name of "" will set the default tracker for games
    if (!game) {
        throw new Error(
            "Game must be defined when setting tracker, for now..."
        );
    }
    configuredTrackers[game] = tracker;
};

const TrackerDirectory = {
    setTracker,
    getDirectory,
    getDirectorySubscriberCallback,
    registerTracker,
    removeTracker,
};

export default TrackerDirectory;
