// A class that is able to give information about checks.
interface LocationStatus {
    exists: boolean;
    tags: import("../tags/tagManager").Tag[];
    ignored: boolean;
    checked: boolean;
    id: number;
}

interface LocationStatusUpdate {
    exists?: boolean;
    tags?: import("../tags/tagManager").Tag[];
    ignored?: boolean;
    checked?: boolean;
    id?: number;
}

const defaultCheckStatus = {
    exists: false,
    tags: [],
    ignored: false,
    checked: false,
    id: 0,
};

class LocationManager {
    #locationStats: Map<string, LocationStatus> = new Map();
    #locationSubscribers: Map<Set<string>, (names: Set<string>) => void> = new Map();
    #updateQueue: Set<string> = new Set();
    #updatesPaused: boolean = false;


    #broadcastUpdate = (locationName: string): void => {
        if (this.#updatesPaused) {
            this.#updateQueue.add(locationName);
        } else {
            this.#locationSubscribers.forEach((listener, triggerLocations) => {
                if (triggerLocations.has(locationName)) {
                    listener(new Set(locationName));
                }
            });
        }
    }

    /**
     * Prevents listeners from being called, instead enqueuing them for later.
     * Call resumeUpdateBroadcast to resume broadcasts and call all queued updates.
     * Use when locations are receiving multiple updates at once
     */
    pauseUpdateBroadcast = () => {
        this.#updatesPaused = true;
    }

    /**
     * Re-enables listeners being called on updates
     * Will broadcast any queued updates.
     */
    resumeUpdateBroadcast = () => {
        if (this.#updatesPaused) {
            this.#locationSubscribers.forEach((listener, triggerLocations) => {
                if (!triggerLocations.isDisjointFrom(this.#updateQueue)) {
                    listener(this.#updateQueue);
                }
            })
        }
        this.#updatesPaused = false;
        this.#updateQueue.clear();
    }

    /**
     * 
     * @param locationName The name of the location being updated
     * @param status The properties of the status to update
     */
    updateLocationStatus = (locationName: string, status: LocationStatusUpdate): void => {
        const newStatus: LocationStatus = {
            ...(this.#locationStats.get(locationName) ?? defaultCheckStatus),
            ...status
        };
        // make the object immutable
        Object.freeze(newStatus);
        this.#locationStats.set(locationName, newStatus);
        this.#broadcastUpdate(locationName);
    }

    getLocationStatus = (locationName: string): LocationStatus => {
        return this.#locationStats.get(locationName) ?? defaultCheckStatus;
    }

    deleteLocation = (locationName: string) => {
        this.#locationStats.delete(locationName);
        this.#broadcastUpdate(locationName);
    }

    deleteAllLocations = () => {
        const names = [...this.#locationStats.keys()];
        names.forEach((name) => this.deleteLocation(name));
    }

    getMatchingLocations = (filter: (status: LocationStatus) => boolean): Set<string> => {
        const locations: Set<string> = new Set();
        this.#locationStats.forEach(
            (status, checkName) => {
                if (filter(status)) {
                    locations.add(checkName);
                }
            }
        )
        return locations;
    }

    /**
     * 
     * @param locationName The check or set of checks to listen to and fire the listener on
     * @returns 
     */
    getSubscriberCallback = (locationName: Set<string> | string) => {
        return (listener: (updatedLocations: Set<string>) => void) => {
            let locationNames: Set<string> = null;
            if(typeof locationName === "string"){
                locationNames = new Set(locationNames);
            } else {
                locationNames = locationName;
            }
            this.#locationSubscribers.set(locationNames, listener);
            // return a function to clean up the subscription
            return () => {
                this.#locationSubscribers.delete(locationNames);
            };
        };
    }

    static filters = {
        exist: (status: LocationStatus) => {
            return status.exists;
        }
    }
}


export { LocationManager };
export type { LocationStatus, LocationStatusUpdate };
