// @ts-check

import { DataPackage } from "archipelago.js";
import { TagData } from "../tags/tagManager";

/** Data that can be used to create a new Saved Connection */
interface SavedConnectionInfo {
    seed: string;
    host: string;
    port: string;
    slot: string;
    game: string;
    password?: string;
    playerAlias?: string;
}

interface SavedConnection_V2 {
    connectionId: string;
    name: string;
    seed: string;
    host: string;
    port: string;
    slot: string;
    game: string;
    password?: string;
    playerAlias?: string;
    lastUsedTime: number;
    createdTime: number;
    version: 2;
    settings: unknown;
    saveData?: {
        locationGroups?: { [groupName: string]: string[] },
        tagData?: {
            [tagId: string]: TagData
        },
    };
}

interface SavedConnection_V3 {
    connectionId: string;
    name: string;
    seed: string;
    host: string;
    port: string;
    slot: string;
    game: string;
    password?: string;
    playerAlias?: string;
    lastUsedTime: number;
    createdTime: number;
    version: 3;
    settings: unknown;
    saveData?: {
        tagData?: {
            [tagId: string]: TagData
        },
    };
}

const connectionListeners: Set<() => void> = new Set();
/** Returns a function that can be called to subscribe to saved connection updates*/
const getSubscriberCallback = () => {
    return (listener: () => void) => {
        connectionListeners.add(listener);
        // return a function to clean up the subscription
        return () => {
            connectionListeners.delete(listener);
        };
    };
};

const database_request = window.indexedDB.open("checklist_db", 3);

database_request.onerror = () => {
    console.error("Data base error: ")
    console.error(database_request.error);
};

// database_request.onsuccess = () => {
//     // console.log("database success");
// }

database_request.onblocked = () => {
    console.warn("Database operation blocked");
}

const DATA_PACKAGE_DB_KEY = "data_packages";
const LOCATION_GROUP_DB_KEY = "location_groups";

database_request.onupgradeneeded = (_event) => {
    const db = database_request.result;
    if (!db.objectStoreNames.contains(DATA_PACKAGE_DB_KEY)) {
        const dataPackageStore = db.createObjectStore(DATA_PACKAGE_DB_KEY, { keyPath: "seed" });
        dataPackageStore.createIndex("seed", "seed", { unique: true });
    }
    if (!db.objectStoreNames.contains(LOCATION_GROUP_DB_KEY)) {
        const locationGroupStore = db.createObjectStore(LOCATION_GROUP_DB_KEY, { keyPath: "connectionId" });
        locationGroupStore.createIndex("connectionId", "connectionId", { unique: true });
    }
}

const SAVED_CONNECTION_VERSION = 3;
const LEGACY_LS_CONNECTION_ITEM_NAME = "archipelagoTrackerSavedConnections";

let cachedConnectionData: { connections: { [s: string]: SavedConnection_V3; }; version: number; modified: number; } | null = null;

const loadSavedConnectionData = () => {
    const connectionDataString = localStorage.getItem(LEGACY_LS_CONNECTION_ITEM_NAME);

    const connectionData: { connections: { [s: string]: SavedConnection_V2 | SavedConnection_V3; }; version: number; modified: number; } = connectionDataString
        ? JSON.parse(connectionDataString)
        : {
            connections: {},
            version: SAVED_CONNECTION_VERSION,
            modified: Date.now(),
        };

    const connectionIds = Object.getOwnPropertyNames(connectionData.connections);
    for (const id of connectionIds) {
        const connection = connectionData.connections[id];

        if (connection.version === 2 && connection.saveData?.locationGroups) {
            // these take up too much space
            delete connection.saveData.locationGroups;
        }

        // Load and convert from ap-oot tracker
        connectionData.connections[id] = {
            ...connectionData.connections[id],
            connectionId:
                connection.connectionId ??
                connection["id"] ??
                new Date().getTime(),
            createdTime:
                connection.createdTime ??
                connection["lastConnectionTime"] ??
                new Date().getTime(),
            lastUsedTime:
                connection.lastUsedTime ??
                connection["lastConnectionTime"] ??
                new Date().getTime(),
            version: SAVED_CONNECTION_VERSION,
        };


    }
    connectionData.version = 2;
    // React requires the same object to be returned if nothing has changed
    if (
        cachedConnectionData &&
        cachedConnectionData.modified === connectionData.modified
    ) {
        return cachedConnectionData;
    }
    cachedConnectionData = connectionData as { connections: { [s: string]: SavedConnection_V3; }; version: number; modified: number; };
    return connectionData as { connections: { [s: string]: SavedConnection_V3; }; version: number; modified: number; };
};

const save = (saveData: { connections: { [s: string]: SavedConnection_V3; }; version: number; modified: number; }) => {
    saveData.modified = Date.now();
    localStorage.setItem(LEGACY_LS_CONNECTION_ITEM_NAME, JSON.stringify(saveData));
    connectionListeners.forEach((listener) => listener());
};

const saveConnectionData = (data: SavedConnection_V3) => {
    const currentSaveData = loadSavedConnectionData();
    if (!data.connectionId) {
        data.connectionId = `${data.seed}-${data.slot}-${new Date().getTime()}`;
        console.warn(
            `Data with no connection id was trying to be saved, added id of ${data.connectionId}`
        );
    }
    currentSaveData.connections[data.connectionId] = data;
    save(currentSaveData);
};

const createNewSavedConnection = (data: SavedConnectionInfo): SavedConnection_V3 => {
    const connectionId = `${data.seed}-${data.slot}-${new Date().getTime()}`;
    return {
        connectionId,
        seed: data.seed,
        game: data.game,
        name: `${data.playerAlias || data.slot}`,
        host: data.host,
        port: data.port,
        slot: data.slot,
        password: data.password,
        playerAlias: data.playerAlias,
        lastUsedTime: Date.now(),
        createdTime: Date.now(),
        version: SAVED_CONNECTION_VERSION,
        settings: {},
        saveData: {},
    };
};

const getExistingConnections = (data: SavedConnectionInfo) => {
    const currentSaveData = loadSavedConnectionData();
    /** @type {Set<SavedConnection_V3>} */
    const existingConnections: Set<SavedConnection_V3> = new Set();
    const connectionIds = Object.getOwnPropertyNames(currentSaveData.connections);

    for (const id of connectionIds) {
        const connection = currentSaveData.connections[id];
        if (
            connection.seed === data.seed &&
            connection.slot.toString() === data.slot.toString()
        ) {
            existingConnections.add(connection);
        }
    }
    return existingConnections;
};

/**
 * Gets information that can be passed to the connector to connect to archipelago out of a SavedConnection
 * @param data
 * @returns Object with info for connecting to Archipelago
 */
const getConnectionInfo = (data: SavedConnection_V2): { host: string; port: string; slot: string; game: string; password: string; } => {
    return {
        host: data.host,
        port: data.port.toString(),
        slot: data.slot,
        game: data.game,
        password: data.password ?? "",
    };
};

const getCachedDataPackage = (seed: string): Promise<DataPackage> => {
    return new Promise((resolve, _reject) => {
        let hasFailed = false;
        const attemptLoad = () => {
            try {
                const db = database_request.result;
                const transaction = db.transaction([DATA_PACKAGE_DB_KEY], "readonly");
                const objectStore = transaction.objectStore(DATA_PACKAGE_DB_KEY);
                const request = objectStore.get(seed);
                request.onerror = () => {
                    resolve(null);
                }
                request.onsuccess = () => {
                    resolve(request.result ? request.result['package'] : null);
                }
            } catch {
                if (hasFailed) {
                    resolve(null);
                } else {
                    hasFailed = true;
                    setTimeout(attemptLoad, 200);
                }
            }
        }
        if (seed) {
            attemptLoad();
        } else {
            resolve(null);
        }
    });
};

const cacheDataPackage = (seed: string, dataPackage: DataPackage): Promise<boolean> => {

    return new Promise((resolve, _reject) => {
        let hasFailed = false;
        const attemptSave = () => {
            try {
                const db = database_request.result;
                const transaction = db.transaction([DATA_PACKAGE_DB_KEY], "readwrite");
                const objectStore = transaction.objectStore(DATA_PACKAGE_DB_KEY);
                const request = objectStore.put({ seed, package: dataPackage });
                request.onerror = () => {
                    resolve(false);
                }
                request.onsuccess = () => {
                    resolve(true);
                }
            } catch {
                if (hasFailed) {
                    resolve(false);
                } else {
                    hasFailed = true;
                    setTimeout(attemptSave, 200);
                }
            }
        }
        attemptSave();
    })
}

const deleteDataPackage = (seed: string): Promise<boolean> => {
    return new Promise((resolve, _reject) => {
        let hasFailed = false;
        const attemptDelete = () => {
            try {
                const db = database_request.result;
                const transaction = db.transaction([DATA_PACKAGE_DB_KEY], "readwrite");
                const objectStore = transaction.objectStore(DATA_PACKAGE_DB_KEY);
                const request = objectStore.delete(seed);
                request.onerror = () => {
                    resolve(false);
                }
                request.onsuccess = () => {
                    resolve(true);
                }
            } catch {
                if (hasFailed) {
                    resolve(false);
                } else {
                    hasFailed = true;
                    setTimeout(attemptDelete, 200);
                }
            }
        }
        attemptDelete();
    })
}

const getCachedLocationGroups = (connectionId: string): Promise<{ [name: string]: string[] }> => {
    return new Promise((resolve, _reject) => {
        let hasFailed = false;
        const attemptLoad = () => {
            try {
                const db = database_request.result;
                const transaction = db.transaction([LOCATION_GROUP_DB_KEY], "readonly");
                const objectStore = transaction.objectStore(LOCATION_GROUP_DB_KEY);
                const request = objectStore.get(connectionId);
                request.onerror = () => {
                    resolve(null);
                }
                request.onsuccess = () => {
                    resolve(request.result ? request.result['groups'] : null);
                }
            } catch {
                if (hasFailed) {
                    resolve(null);
                } else {
                    hasFailed = true;
                    setTimeout(attemptLoad, 200);
                }
            }
        }
        if (connectionId) {
            attemptLoad();
        } else {
            resolve(null);
        }
    });
};

const cacheLocationGroups = (connectionId: string, groups: { [name: string]: string[] }): Promise<boolean> => {

    return new Promise((resolve, _reject) => {
        let hasFailed = false;
        const attemptSave = () => {
            try {
                const db = database_request.result;
                const transaction = db.transaction([LOCATION_GROUP_DB_KEY], "readwrite");
                const objectStore = transaction.objectStore(LOCATION_GROUP_DB_KEY);
                const request = objectStore.put({ connectionId, groups });
                request.onerror = () => {
                    resolve(false);
                }
                request.onsuccess = () => {
                    resolve(true);
                }
            } catch {
                if (hasFailed) {
                    resolve(false);
                } else {
                    hasFailed = true;
                    setTimeout(attemptSave, 200);
                }
            }
        }
        attemptSave();
    })
}

const deleteLocationGroups = (connectionId: string): Promise<boolean> => {
    return new Promise((resolve, _reject) => {
        let hasFailed = false;
        const attemptDelete = () => {
            try {
                const db = database_request.result;
                const transaction = db.transaction([LOCATION_GROUP_DB_KEY], "readwrite");
                const objectStore = transaction.objectStore(LOCATION_GROUP_DB_KEY);
                const request = objectStore.delete(connectionId);
                request.onerror = () => {
                    resolve(false);
                }
                request.onsuccess = () => {
                    resolve(true);
                }
            } catch {
                if (hasFailed) {
                    resolve(false);
                } else {
                    hasFailed = true;
                    setTimeout(attemptDelete, 200);
                }
            }
        }
        attemptDelete();
    })
}

/**
 *
 * @param {string} id
 */
const deleteConnection = (id: string) => {
    const currentSaveData = loadSavedConnectionData();
    const seed = currentSaveData.connections[id]?.seed ?? "";
    delete currentSaveData.connections[id];
    save(currentSaveData);
    const dataPackageInUse = Object.getOwnPropertyNames(currentSaveData.connections).filter((id) => currentSaveData.connections[id].seed === seed).length > 0;
    if (!dataPackageInUse) {
        deleteDataPackage(seed);
    }
    deleteLocationGroups(id);
};

/**
 *
 * @param {string} id Id of the connection
 * @returns
 */
const getConnectionSaveData = (id: string) => {
    const currentSaveData = loadSavedConnectionData();
    return currentSaveData.connections[id]?.saveData;
};

/**
 *
 * @param {string} id Id of the connection
 * @returns
 */
const updateConnectionSaveData = (id: string, newSaveData: unknown) => {
    const currentSaveData = loadSavedConnectionData();
    currentSaveData.connections[id].saveData = newSaveData;
    save(currentSaveData);
};

const SavedConnectionManager = {
    createNewSavedConnection,
    saveConnectionData,
    getExistingConnections,
    getCachedDataPackage,
    getCachedLocationGroups,
    cacheDataPackage,
    cacheLocationGroups,
    getConnectionInfo,
    loadSavedConnectionData,
    deleteConnection,
    getSubscriberCallback,
    getConnectionSaveData,
    updateConnectionSaveData,
};

export default SavedConnectionManager;
export type { SavedConnection_V3 as SavedConnection, SavedConnectionInfo }
