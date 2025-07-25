import { DataStore } from "../dataStores";
import NotificationManager, {
    MessageType,
} from "../notifications/notifications";
import GenericLocationTracker from "./generic/GenericLocationTracker";
import GenericItemTracker from "./generic/GenericItemTracker";
import { ItemTracker, ItemTrackerManifest } from "./itemTrackers/itemTrackers";
import CustomLocationTracker from "./locationTrackers/CustomLocationTracker";
import {
    LocationTracker,
    LocationTrackerManifest,
} from "./locationTrackers/locationTrackers";
import { ResourceType } from "./resourceEnums";
import { ResourceManifest, ResourceRepository } from "./resource";
const modified = Symbol("modified");

type TrackerDirectory = {
    games: string[];
    trackers: {
        [type: string]: ResourceManifest[];
    };
    [modified]: number;
};

type TrackerResourceId = {
    uuid: string;
    version: string;
    type: ResourceType;
};

type TrackerResourceIds = {
    [type: string]: TrackerResourceId;
};

type TrackerChoiceOptions = {
    [game: string]: TrackerResourceIds;
};

const getTrackerKey = (tracker: TrackerResourceId) => {
    return tracker
        ? `${tracker.uuid}-${tracker.version}-${tracker.type}`
        : null;
};

class TrackerManager {
    #repositories: Map<
        string,
        { repo: ResourceRepository; listenerCleanUp: () => void }
    > = new Map();
    #trackerRepositoryMap: Map<string, string> = new Map();
    #allTrackers: Map<string, LocationTrackerManifest | ItemTrackerManifest> =
        new Map();
    #directoryListeners: Set<() => void> = new Set();
    #trackerListeners: Set<() => void> = new Set();
    #directoryModified = Date.now();
    #cachedDirectory: TrackerDirectory = {
        games: [],
        trackers: {
            [ResourceType.locationTracker]: [],
            [ResourceType.itemTracker]: [],
        },
        [modified]: 0,
    };

    #trackerChoiceOptions: TrackerChoiceOptions = {};
    #optionsStore: DataStore;
    #trackers: {
        [type: string]: LocationTracker | ItemTracker;
    } = {};
    #game: string = null;
    #defaults: TrackerResourceIds = {
        [ResourceType.locationTracker]: {
            uuid: GenericLocationTracker.uuid,
            version: "0.0.0",
            type: ResourceType.locationTracker,
        },
        [ResourceType.itemTracker]: {
            uuid: GenericItemTracker.uuid,
            version: "0.0.0",
            type: ResourceType.itemTracker,
        },
    };

    constructor(optionStore: DataStore) {
        this.#optionsStore = optionStore;
        this.#trackerChoiceOptions =
            (this.#optionsStore.read() as TrackerChoiceOptions) ?? {};
        const subscribeToStore = this.#optionsStore.getUpdateSubscriber();
        subscribeToStore(() => {
            this.#trackerChoiceOptions =
                this.#optionsStore.read() as TrackerChoiceOptions;
            const newGameInfo = this.#trackerChoiceOptions[this.#game] ?? {};
            const changes = Object.entries(this.#trackers).filter(
                ([type, tracker]) =>
                    tracker?.manifest.uuid !== newGameInfo[type]?.uuid ||
                    tracker?.manifest.version !== newGameInfo[type]?.version
            );
            if (changes.length > 0) {
                this.loadTrackers(this.#game);
            } else {
                this.#callTrackerListeners();
            }
            this.#callDirectoryListeners();
        });
    }

    #getTrackersInRepository = (repo: ResourceRepository) => {
        return [...this.#allTrackers.entries()]
            .filter(
                ([_, manifest]) =>
                    this.#trackerRepositoryMap.get(getTrackerKey(manifest)) ===
                    repo.uuid
            )
            .map(([_, manifest]) => getTrackerKey(manifest));
    };

    #callDirectoryListeners = () => {
        this.#directoryListeners.forEach((listener) => listener());
    };

    #callTrackerListeners = (_type?: ResourceType) => {
        this.#trackerListeners.forEach((listener) => listener());
    };

    removeRepository = (repo: ResourceRepository) => {
        this.#repositories.get(repo.uuid)?.listenerCleanUp();
        const trackersToRemove = this.#getTrackersInRepository(repo);
        trackersToRemove.forEach((trackerKey) =>
            this.#allTrackers.delete(trackerKey)
        );
    };

    addRepository = (repo: ResourceRepository) => {
        this.#repositories.get(repo.uuid)?.listenerCleanUp();

        const updateRepositoryTrackers = () => {
            this.#directoryModified = Date.now();
            const trackersToRemove: Set<string> = new Set(
                this.#getTrackersInRepository(repo)
            );
            const trackerOptions = this.#trackerChoiceOptions;
            const currentTrackers = trackerOptions[this.#game];
            let triggerReload = false;
            repo.resources.forEach((manifest) => {
                if (
                    [
                        ResourceType.itemTracker,
                        ResourceType.locationTracker,
                    ].includes(manifest.type)
                ) {
                    this.#allTrackers.set(getTrackerKey(manifest), manifest);
                    this.#trackerRepositoryMap.set(
                        getTrackerKey(manifest),
                        repo.uuid
                    );
                    // trigger reload if currently loaded tracker was updated
                    if (
                        manifest.game === this.#game &&
                        Object.entries({
                            ...this.#defaults,
                            ...currentTrackers,
                        }).filter(
                            ([type, resource]) =>
                                resource.uuid === manifest.uuid &&
                                manifest.version === resource.version &&
                                manifest.type === type
                        ).length > 1
                    ) {
                        triggerReload = true;
                    }

                    trackersToRemove.delete(getTrackerKey(manifest));
                }
            });
            trackersToRemove.forEach((trackerKey) => {
                const tracker = this.#allTrackers.get(trackerKey);
                const inUseTracker = this.getCurrentGameTracker(
                    tracker.game,
                    tracker.type
                );
                if (
                    inUseTracker.uuid === tracker.uuid &&
                    inUseTracker.version === tracker.version
                ) {
                    this.setGameTracker(tracker.game, { type: tracker.type });
                }
                this.#allTrackers.delete(trackerKey);
            });
            this.#callDirectoryListeners();
            if (triggerReload) {
                this.loadTrackers(this.#game);
            }
        };
        const subCall = repo.getUpdateSubscriber([
            ResourceType.locationTracker,
            ResourceType.itemTracker,
        ]);
        const listenerCleanUp = subCall(updateRepositoryTrackers);
        this.#repositories.set(repo.uuid, { repo, listenerCleanUp });
        updateRepositoryTrackers();
    };

    getTrackerSubscriberCallback: (
        _type?: ResourceType
    ) => (listener: () => void) => () => void = () => {
        return (listener) => {
            this.#trackerListeners.add(listener);
            return () => {
                this.#trackerListeners.delete(listener);
            };
        };
    };

    getDirectorySubscriberCallback: () => (listener: () => void) => () => void =
        () => {
            return (listener) => {
                this.#directoryListeners.add(listener);
                return () => {
                    this.#directoryListeners.delete(listener);
                };
            };
        };

    getDirectory = (): TrackerDirectory => {
        if (this.#directoryModified === this.#cachedDirectory[modified]) {
            return this.#cachedDirectory;
        }
        const games: Set<string> = new Set();
        const trackers: { [type: string]: ResourceManifest[] } = {};
        this.#allTrackers.forEach((manifest) => {
            games.add(manifest.game);
            if (!trackers[manifest.type]) {
                trackers[manifest.type] = [];
            }
            trackers[manifest.type].push(manifest);
        });
        this.#cachedDirectory = {
            games: [...games.values()],
            trackers,
            [modified]: this.#directoryModified,
        };
        return this.#cachedDirectory;
    };

    /** Sets up a particular tracker to be used for a game */
    setGameTracker = (
        game: string,
        tracker: TrackerResourceId | { type: string }
    ) => {
        // console.log(`Updating ${game} to:`, tracker);
        if (game) {
            const currentValue =
                (this.#optionsStore.read(game) as TrackerResourceIds) ?? {};
            const newValue: TrackerResourceIds = {
                ...currentValue,
            };
            if ("uuid" in tracker) {
                newValue[tracker.type] = tracker;
            } else {
                delete newValue[tracker.type];
            }
            // tracker should auto reload with change on settings store, no need to trigger manually
            this.#optionsStore.write(newValue, game);
        } else {
            if ("uuid" in tracker) {
                this.#defaults[tracker.type] = tracker;
                // todo reload tracker when default is changed
            } else {
                throw new Error(
                    "Default tracker must be set, cannot be deleted"
                );
            }
        }
    };

    /** Loads the appropriate trackers for a game */
    loadTrackers = async (game: string): Promise<void> => {
        this.#game = game;
        const locationTrackerInfo = this.getCurrentGameTracker(
            game,
            ResourceType.locationTracker
        );
        const itemTrackerInfo = this.getCurrentGameTracker(
            game,
            ResourceType.itemTracker
        );
        const locationTrackerRepoUuid = this.#trackerRepositoryMap.get(
            getTrackerKey(locationTrackerInfo)
        );
        const itemTrackerRepoUuid = this.#trackerRepositoryMap.get(
            getTrackerKey(itemTrackerInfo)
        );

        const locationTrackerPromise = this.#repositories
            .get(locationTrackerRepoUuid)
            ?.repo.loadResource(
                locationTrackerInfo.uuid,
                locationTrackerInfo.version,
                locationTrackerInfo.type
            )
            .then((tracker) => {
                this.#trackers[ResourceType.locationTracker] =
                    tracker as LocationTracker;
                this.#callTrackerListeners();
                if (tracker instanceof CustomLocationTracker) {
                    tracker.validateLocations();
                    const errors = tracker.getErrors();
                    if (errors.length > 0) {
                        NotificationManager.createToast({
                            message: "Tracker has failed verification",
                            details: `Tracker has failed verification and may not work as expected.\nErrors: \n${errors.join("\n\n")}`,
                            type: MessageType.warning,
                            duration: 10,
                        });
                    }
                }
            });

        const itemTrackerPromise = this.#repositories
            .get(itemTrackerRepoUuid)
            ?.repo.loadResource(
                itemTrackerInfo.uuid,
                itemTrackerInfo.version,
                itemTrackerInfo.type
            )
            .then((tracker) => {
                this.#trackers[ResourceType.itemTracker] = tracker;
                this.#callTrackerListeners();
            });
        const trackerPromises = [locationTrackerPromise, itemTrackerPromise];
        await Promise.all(trackerPromises);
    };

    /** If this game were selected, returns which tracker would be used */
    getCurrentGameTracker = (game: string, type: ResourceType) => {
        const selectedOption =
            this.#trackerChoiceOptions[game] ?? this.#defaults;
        const trackerId = selectedOption[type] ?? this.#defaults[type];
        if (!this.#allTrackers.has(getTrackerKey(trackerId))) {
            return this.#defaults[type];
        }
        return trackerId;
    };

    /** Gest the currently in use tracker */
    getCurrentTracker = (type: ResourceType) => {
        return this.#trackers[type];
    };
}

export { TrackerManager };
export type {
    TrackerChoiceOptions,
    TrackerDirectory,
    TrackerResourceId,
    TrackerResourceIds,
};
