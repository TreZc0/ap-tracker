import { ItemTracker, ItemTrackerManifest } from "./itemTrackers/itemTrackers";
import {
    LocationTracker,
    LocationTrackerManifest,
} from "./locationTrackers/locationTrackers";
import { ResourceLocationType, ResourceType } from "./resourceEnums";

type BaseResourceManifest = {
    uuid: string;
    name: string;
    version: string;
    description?: string;
    resourceLocationType?: ResourceLocationType;
    type: ResourceType;
};

type ResourceManifest = LocationTrackerManifest | ItemTrackerManifest;

type Resource = LocationTracker | ItemTracker;

interface ResourceRepository {
    /** A unique identifier for this repository */
    uuid: string;
    /** A list of resource manifests available from this tracker */
    resources: ResourceManifest[];
    /** Returns a callback that takes a listener as a parameter and returns a clean up call */
    getUpdateSubscriber: (
        types?: ResourceType[]
    ) => (listener: () => void) => () => void;
    /** Retrieves a resource for a given uuid */
    loadResource: (
        uuid: string,
        version: string,
        type: string
    ) => Promise<Resource>;
    /** Does any initialization that may be needed such as fetching from a remote server, returns true on success, else false */
    initialize: () => Promise<boolean>;
}

export type {
    Resource,
    ResourceManifest,
    ResourceRepository,
    BaseResourceManifest,
};
