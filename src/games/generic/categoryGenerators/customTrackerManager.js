// @ts-check
// Loads custom JSON supplied by users
import _ from "lodash";
import { generateId } from "../../../utility/randomIdGen";
import TrackerDirectory from "../../TrackerDirectory";
import NotificationManager, {
    MessageType,
} from "../../../services/notifications/notifications";
const CUSTOM_TRACKER_DIRECTORY_STORAGE_KEY =
    "APChecklist_Custom_Tracker_Directory";
const CUSTOM_TRACKER_STORAGE_KEY = "APChecklist_Custom_Tracker";
const CUSTOM_TRACKER_VERSION = 1;

/**
 * @typedef CustomCategory_V1
 * @prop {Object.<string, import("../../../services/sections/groupManager").GroupData>} groupData
 * @prop {import("../../../services/sections/sectionManager").SectionConfigData} sectionData
 * @prop {string} game
 * @prop {number} customTrackerVersion
 * @prop {string} [id]
 * @prop {string} name
 */

/**
 * @typedef CustomListDirectory
 * @prop {{id: string, game:string, name: string, enabled: boolean}[]} customLists
 * @prop {number} modified
 */

/**
 * @param {string} gameName
 * @param {string} customGameId
 * @returns {import("../../TrackerBuilder").Tracker}
 */
const buildCustomTracker = (gameName, customGameId) => {
    let customGameData = getCustomTracker(customGameId);
    if (!customGameData) {
        throw new Error("Failed to load custom game with id " + customGameId);
    }
    if (customGameData.game !== gameName) {
        throw new Error(
            `Provided game "${gameName}" does not match the custom tracker's with game "${customGameData.game}"`
        );
    }
    const { groupData, sectionData } = customGameData;

    /** @type {import("../../TrackerBuilder").TrackerBuilder} */
    const buildTracker = (
        checkManager,
        entranceManager,
        groupManager,
        sectionManager,
        slotData
    ) => {
        // configure groups and sections
        groupManager.loadGroups(groupData);
        sectionManager.setConfiguration(sectionData);
    };

    return {
        id: customGameId,
        gameName: customGameData.game,
        name: customGameData.name,
        buildTracker,
    };
};

/** @type {Set<()=>void>} */
const directoryListeners = new Set();

/**
 *
 * @returns {(listener: () => void) =>(() => void)}a
 */
const getDirectorySubscriberCallback = () => {
    return (listener) => {
        directoryListeners.add(listener);
        return () => {
            directoryListeners.delete(listener);
        };
    };
};

const callDirectoryListeners = () => {
    directoryListeners.forEach((listener) => listener());
};

const getDirectory = () => {
    return readDirectoryFromStorage();
};

/** @type {CustomListDirectory} */
let cachedDirectory = {
    customLists: [],
    modified: 0,
};

/**
 *
 * @returns {CustomListDirectory}
 */
const readDirectoryFromStorage = () => {
    let directoryDataString = localStorage.getItem(
        CUSTOM_TRACKER_DIRECTORY_STORAGE_KEY
    );
    let directory = directoryDataString
        ? JSON.parse(directoryDataString)
        : {
              customLists: [],
              modified: 0,
          };
    // React requires returning the same object if nothing has changed
    if (directory.modified !== cachedDirectory.modified) {
        cachedDirectory = directory;
    }
    return cachedDirectory;
};

/**
 *
 * @param {CustomListDirectory} directory
 */
const saveDirectory = (directory) => {
    directory.modified = Date.now();
    localStorage.setItem(
        CUSTOM_TRACKER_DIRECTORY_STORAGE_KEY,
        JSON.stringify(directory)
    );
    callDirectoryListeners();
};

/**
 *
 * @param {string} id
 * @returns {CustomCategory_V1 | null}
 */
const getCustomTracker = (id) => {
    let dataString = localStorage.getItem(
        `${CUSTOM_TRACKER_STORAGE_KEY}_${id}`
    );
    if (!dataString) {
        return null;
    }
    return JSON.parse(dataString);
};

/**
 * @param {CustomCategory_V1} data
 */
const addCustomTracker = (data) => {
    let directory = { ...readDirectoryFromStorage() };
    // validate data
    if (data.customTrackerVersion > CUSTOM_TRACKER_VERSION) {
        throw new Error(
            "Failed to add custom tracker, tracker version is newer than the supported version"
        );
    }
    if (!data.game) {
        throw new Error("Failed to add custom tracker, game was not specified");
    }
    if (!data.name) {
        throw new Error(
            "Failed to add custom tracker, a name was not specified"
        );
    }
    if (!data.groupData) {
        throw new Error("Failed to add custom tracker, no group data found");
    }
    if (!data.sectionData) {
        throw new Error("Failed to add custom tracker, no section data found");
    }
    let currentIndex = _.findIndex(directory.customLists, { id: data.id });
    if (currentIndex > -1) {
        // remove existing version from directory
        directory.customLists = directory.customLists.slice(0);
        directory.customLists.splice(currentIndex, 1);
    }
    let id = data.id ?? generateId();
    directory.customLists.push({
        id,
        game: data.game,
        name: data.name,
        enabled: true,
    });

    localStorage.setItem(
        `${CUSTOM_TRACKER_STORAGE_KEY}_${id}`,
        JSON.stringify(data)
    );
    saveDirectory(directory);
    try {
        TrackerDirectory.registerTracker(buildCustomTracker(data.game, id));
    } catch (e) {
        directory.customLists[directory.customLists.length - 1].enabled = false;
        saveDirectory(directory);
        NotificationManager.createToast({
            message:
                "An error occurred registering custom tracker, it has been disabled",
            details: `Error: \n\t${e}`,
            type: MessageType.error,
            duration: 10,
        });
        console.error(e);
    }
};

/**
 * @param {string} id
 */
const removeCustomTracker = (id) => {
    let directory = { ...readDirectoryFromStorage() };
    // validate data
    let currentIndex = _.findIndex(directory.customLists, { id });
    if (currentIndex > -1) {
        TrackerDirectory.removeTracker(id);
        // remove existing version from directory
        directory.customLists = directory.customLists.slice(0);
        directory.customLists.splice(currentIndex, 1);
    }
    localStorage.removeItem(`${CUSTOM_TRACKER_STORAGE_KEY}_${id}`);
    saveDirectory(directory);
};

const loadTrackers = () => {
    let directory = { ...readDirectoryFromStorage() }; // set the cached directory as well
    let encounteredErrors = false;
    cachedDirectory.customLists.forEach((trackerInfo, index) => {
        if (trackerInfo.enabled) {
            try {
                TrackerDirectory.registerTracker(
                    buildCustomTracker(trackerInfo.game, trackerInfo.id)
                );
            } catch (e) {
                encounteredErrors = true;
                directory.customLists[index].enabled = false;
                NotificationManager.createToast({
                    message: `An error occurred loading a custom tracker ${trackerInfo.name}, it has been disabled.`,
                    details: `Tracker info:\n\tName: ${trackerInfo.name} \n\tGame: ${trackerInfo.game}\n\tId:${trackerInfo.id}\nError: \n\t${e}`,
                    type: MessageType.warning,
                    duration: 10,
                });
                console.error(e);
            }
        }
    });
    if (encounteredErrors) {
        saveDirectory(directory);
    }
};

loadTrackers();

const CustomTrackerManager = {
    removeCustomTracker,
    addCustomTracker,
    getCustomTracker,
    getDirectory,
    getDirectorySubscriberCallback,
};

export default CustomTrackerManager;
