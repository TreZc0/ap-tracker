import { InventoryManager } from "../inventory/inventoryManager";
import { LocationManager } from "../locations/locationManager";
import { OptionManager } from "../options/optionManager";
import { DB_STORE_KEYS, SaveData } from "../saveData";
import CustomItemTracker from "./itemTrackers/CustomItemTracker";
import { CustomItemTrackerDef_V1 } from "./itemTrackers/formatDefinitions/CustomItemTrackerFormat_V1";
import CustomLocationTracker from "./locationTrackers/CustomLocationTracker";
import { CustomLocationTrackerDef_V2 } from "./locationTrackers/formatDefinitions/CustomLocationTrackerFormat_V2";
import { convertLocationTrackerV1toV2 } from "./locationTrackers/upgradePathV1V2";
import { Resource, ResourceManifest, ResourceRepository } from "./resource";
import { ResourceType } from "./resourceEnums";
import { TrackerResourceId } from "./TrackerManager";

const customTrackerRepositoryUUID = "c76c2420-d100-4093-8734-c52ddedd8917";
type CustomTrackerDirectory = { [uuid: string]: ResourceManifest[] };

class CustomTrackerRepository implements ResourceRepository {
    readonly uuid = customTrackerRepositoryUUID;
    resources: ResourceManifest[] = [];
    #directory: CustomTrackerDirectory = null;
    #resourceListeners: Set<() => void> = new Set();
    #locationManager: LocationManager;
    #directoryQueueCallbacks: (() => void)[] = [];
    #optionManager: OptionManager;
    // #inventoryManager: InventoryManager;

    constructor(
        optionManager: OptionManager,
        locationManager: LocationManager,
        _inventoryManager: InventoryManager
    ) {
        this.#locationManager = locationManager;
        this.#optionManager = optionManager;
        // this.#inventoryManager = inventoryManager;
        SaveData.getAllItems(DB_STORE_KEYS.customTrackersDirectory)
            .then((manifests: ResourceManifest[]) => {
                if (manifests) {
                    const newDirectory: CustomTrackerDirectory = {};
                    manifests.forEach((manifest) => {
                        const items: ResourceManifest[] =
                            newDirectory[manifest.uuid] ?? [];
                        items.push(manifest);
                        newDirectory[manifest.uuid] = items;
                    });
                    this.#updateDirectory(newDirectory);
                }
            })
            .then(() => {
                this.#directoryQueueCallbacks.forEach((callback) => callback());
            });
    }

    #updateDirectory = (newDirectory: CustomTrackerDirectory) => {
        this.resources = Object.entries(newDirectory)
            .map(([_uuid, manifest]) => manifest)
            .flat();
        this.#directory = newDirectory;
        this.#callListeners();
    };

    #callListeners = () => {
        this.#resourceListeners.forEach((listener) => listener());
    };

    getUpdateSubscriber = (_types?: ResourceType[]) => {
        return (listener: () => void) => {
            this.#resourceListeners.add(listener);
            return () => {
                this.#resourceListeners.delete(listener);
            };
        };
    };

    loadResource: (
        uuid: string,
        version: string,
        type: ResourceType
    ) => Promise<Resource> = async (uuid, version, type) => {
        if (!this.#directory[uuid]) {
            throw new Error(`Failed to locate resource ${uuid}`);
        }
        const resource = (
            await SaveData.getItem(DB_STORE_KEYS.customTrackers, [
                uuid,
                version,
                type,
            ])
        )?.["data"] as CustomLocationTrackerDef_V2 | CustomItemTrackerDef_V1;
        if (resource?.manifest?.type === ResourceType.locationTracker) {
            return new CustomLocationTracker(
                this.#locationManager,
                resource as CustomLocationTrackerDef_V2
            );
        } else if (resource?.manifest?.type === ResourceType.itemTracker) {
            return new CustomItemTracker(
                this.#optionManager,
                resource as CustomItemTrackerDef_V1
            );
        }
    };

    initialize: () => Promise<boolean> = async () => {
        return true;
    };

    removeTracker = (id: TrackerResourceId) => {
        if (this.#directory[id.uuid]) {
            const versions = this.#directory[id.uuid].filter(
                (manifest) =>
                    manifest.version !== id.version || manifest.type !== id.type
            );
            const newDirectory = {
                ...this.#directory,
            };
            if (versions.length > 0) {
                newDirectory[id.uuid] = versions;
            } else {
                delete newDirectory[id.uuid];
            }
            SaveData.deleteItem(DB_STORE_KEYS.customTrackersDirectory, [
                id.uuid,
                id.version,
                id.type,
            ]);
            SaveData.deleteItem(DB_STORE_KEYS.customTrackers, [
                id.uuid,
                id.version,
                id.type,
            ]);
            this.#updateDirectory(newDirectory);
        }
    };

    addTracker = (
        trackerDef:
            | CustomLocationTrackerDef_V2
            | CustomLocationTrackerDef_V1
            | CustomItemTrackerDef_V1
    ) => {
        if (!trackerDef) {
            console.warn("Could not add empty tracker!");
            return;
        }
        if ("customTrackerVersion" in trackerDef) {
            trackerDef = convertLocationTrackerV1toV2(trackerDef);
        }
        const data = trackerDef as
            | CustomLocationTrackerDef_V2
            | CustomItemTrackerDef_V1;

        const addTracker = () => {
            const trackerVersions = this.#directory[data.manifest.uuid] ?? [];
            const updatedDirectory = {
                ...this.#directory,
                [data.manifest.uuid]: trackerVersions,
            };
            const trackerIndex =
                trackerVersions
                    .map((manifest, index) => ({ manifest, index }))
                    .filter(
                        ({ manifest }) =>
                            manifest.version === data.manifest.version
                    )[0]?.index ?? -1;
            if (trackerIndex === -1) {
                trackerVersions.push(data.manifest);
            } else {
                trackerVersions[trackerIndex] = data.manifest;
            }
            SaveData.storeItem(
                DB_STORE_KEYS.customTrackersDirectory,
                data.manifest
            );
            SaveData.storeItem(DB_STORE_KEYS.customTrackers, {
                uuid: data.manifest.uuid,
                version: data.manifest.version,
                type: data.manifest.type,
                data,
            });
            this.#updateDirectory(updatedDirectory);
        };

        if (this.#directory) {
            addTracker();
        } else {
            this.#directoryQueueCallbacks.push(addTracker);
        }
    };
}

export { CustomTrackerRepository, customTrackerRepositoryUUID };
