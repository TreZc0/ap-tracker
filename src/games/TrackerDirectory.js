// @ts-check
import { getGameTracker, setGameTracker } from "./TrackerBuilder";
/** @import {Tracker} from "./TrackerBuilder" */

const modified = Symbol("modified");
const TRACKER_CHOICE_KEY = "Archipelago_Checklist_saved_tracker_choices";

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
            "Failed to register tracker, trackers must have a game name. Generic trackers can be registered with empty strings"
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
        if (getGameTracker(tracker.gameName)?.id === tracker.id && tracker.id) {
            setGameTracker(tracker.gameName, null);
        }
        callTrackerDirectoryListeners();
    }
};
/**
 *
 * @param {string} game
 * @param {string} trackerId
 */
const setTracker = (game, trackerId) => {
    // TODO, make it so setting with game name of "" will set the default tracker for games
    if (!game) {
        throw new Error(
            "Game must be defined when setting tracker, for now..."
        );
    }
    let tracker = allTrackers.get(trackerId);
    if (!tracker && trackerId !== null) {
        throw new Error(`Failed to find tracker with id ${trackerId}`);
    }
    let savedChoicesString = localStorage.getItem(TRACKER_CHOICE_KEY);
    let trackerChoices = savedChoicesString
        ? JSON.parse(savedChoicesString)
        : {};
    trackerChoices[game] = trackerId;
    localStorage.setItem(TRACKER_CHOICE_KEY, JSON.stringify(trackerChoices));
    setGameTracker(game, tracker);
};

const loadSavedTrackerChoices = () => {
    let savedChoicesString = localStorage.getItem(TRACKER_CHOICE_KEY);
    let trackerChoices = savedChoicesString
        ? JSON.parse(savedChoicesString)
        : {};
    Object.getOwnPropertyNames(trackerChoices).forEach((gameName) => {
        let tracker = allTrackers.get(trackerChoices[gameName]);
        if (tracker) {
            setGameTracker(gameName, tracker);
        }
    });
};

const TrackerDirectory = {
    setTracker,
    getDirectory,
    getDirectorySubscriberCallback,
    registerTracker,
    removeTracker,
    loadSavedTrackerChoices,
};

export default TrackerDirectory;
