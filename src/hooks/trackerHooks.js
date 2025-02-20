// @ts-check
import { useSyncExternalStore } from "react";
import TrackerDirectory from "../games/TrackerDirectory";
import CustomTrackerManager from "../games/generic/categoryGenerators/customTrackerManager";
import {
    getGameTracker,
    getTrackerSubscriberCallback,
} from "../games/TrackerBuilder";

const useTrackerDirectory = () => {
    return useSyncExternalStore(
        TrackerDirectory.getDirectorySubscriberCallback(),
        TrackerDirectory.getDirectory,
        TrackerDirectory.getDirectory
    );
};

const useCustomTrackerDirectory = () => {
    return useSyncExternalStore(
        CustomTrackerManager.getDirectorySubscriberCallback(),
        CustomTrackerManager.getDirectory,
        CustomTrackerManager.getDirectory
    );
};

/**
 *
 * @param {string} game
 * @returns
 */
const useCurrentGameTracker = (game) => {
    return useSyncExternalStore(
        getTrackerSubscriberCallback(),
        () => getGameTracker(game),
        () => getGameTracker(game)
    );
};

export {
    useTrackerDirectory,
    useCurrentGameTracker,
    useCustomTrackerDirectory,
};
