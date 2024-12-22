// @ts-check
// In charge of keeping track of entrance information
// eventually will help manage logic

/**
 * @typedef EntranceData
 * @prop {String} [category]
 * @prop {String} name
 * @prop {String} [reverse]
 */

/**
 * @typedef EntranceManager
 * @prop {(entrance: string) => (listener: () => void) => () => void} getEntranceSubscriber Returns a function than can have a callback passed in and returns a clean up call.
 * @prop {(entrance: string, entranceRole: string, doReverse?: boolean | undefined) => void} setEntrance Sets the provided entrance to the role of an other entrance
 * @prop {(entrance: string, doReverse?: boolean) => void} resetEntrance Sets a provided entrance to its vanilla state
 * @prop {(entrance: string, doReverse?: boolean) => void} clearEntrance Sets a provided entrance to no longer be set
 * @prop {(categories?: Set<string | undefined> | undefined) => void} resetEntranceTable Sets all entrances to vanilla, if a set of categories is provided, only those will be reset.
 * @prop {(categories?: Set<string | undefined> | undefined) => void} clearEntranceTable Sets all entrances to lead to null, if a set of categories is provided, only those will be un set.
 * @prop {(data: string[]) => void} setAdoptableEntrances Sets the list of categories that can be "adopted" by a section
 * @prop {(data: {[x: string]: string}) => void} setReverseCategoryMap Sets the reverse category map for ease of automatically classifying reverse entrances
 * @prop {(entranceData: EntranceData) => void} addEntrance Adds an entrance to the entrance table
 * @prop {(stringData: any) => boolean} importString Imports and sets the entrance table state
 * @prop {() => string} exportToString Exports the entrance table state
 * @prop {(name: string) => string | null} getEntranceVanillaDestRegion Gets a given entrance's vanilla destination
 * @prop {(name: string) => string | null} getEntranceDestRegion Gets a given entrance's current destination
 * @prop {(regionName: string) => Set<string>} getEntrancesInRegion Gets the entrances contained in a region
 * @prop {(entrance: string) => string | null} getEntranceCategory Gets the category of an entrance
 * @prop {(category: string) => Set<string>} getEntrancesInCategory Gets a list of entrances with a given category
 * @prop {(categories: Set<string>) => Set<any>} getEntrancesInCategories Gets a list of entrances with a given set of categories
 * @prop {(entrance: string) => boolean} getEntranceAdoptability Gets the adoptability of given entrance
 */

/**
 * 
 * @returns {EntranceManager}
 */
const createEntranceManager = () => {
    /** @type {Map<String, Set<() => void>>} */
    let onChangeListeners = new Map();

    /**
     *
     * @param {string} entrance
     */
    const getEntranceSubscriber = (entrance) => {
        return (/** @type {() => void} */ listener) => {
            let listeners = onChangeListeners.get(entrance) ?? new Set();
            listeners.add(listener);
            onChangeListeners.set(entrance, listeners);
            return () => {
                // clean up function
                listeners.delete(listener);
            };
        };
    };

    /**
     *
     * @param {String} entrance
     */
    const onChange = (entrance) => {
        onChangeListeners.get(entrance)?.forEach((listener) => listener());
    };

    // These tables take an entrance name (ex: A -> B) as the key,
    // and give a region (C) as the output, connecting Region A a to region C
    /** @type {Map<String, String>} */
    let vanillaTable = new Map();

    /** @type {Map<String, String|null>} */
    let entranceTable = new Map();

    // entrance name -> category
    /** @type {Map<String, String>} */
    let categoryTable = new Map();

    // category -> entrances
    /** @type {Map<String, Set<String>>} */
    let categoryToEntrances = new Map();

    // Grabs the vanilla reverse entrance for a given entrance
    /** @type {Map<String, String>} */
    let vanillaReverseTable = new Map();

    /** @type {Map<String, String>} */
    let reverseTable = new Map();

    // Maps regions to the entrances they contain
    /** @type {Map<string, Set<String>>} */
    let regionToEntrances = new Map();

    // Sets the category of the reverse of entrances
    /** @type {Map<string, String>} */
    let reverseCategoryMap = new Map();

    /** @type {Set<String>}*/
    let adoptableEntrances = new Set();

    /**
     * Extracts the regions from an entrance name
     * @param {string} name
     */
    let getRegionsFromEntranceName = (name) => {
        return name.split(" -> ");
    };

    // TODO, make this less OOT specific
    /**
     * @param {EntranceData} entranceData
     */
    let addEntrance = (entranceData) => {
        let regions = getRegionsFromEntranceName(entranceData.name);
        console.assert(
            regions.length === 2,
            `Incorrect number of regions in ${entranceData.name}`
        );
        vanillaTable.set(entranceData.name, regions[1]);
        if (!regionToEntrances.has(regions[0])) {
            regionToEntrances.set(regions[0], new Set([entranceData.name]));
        }
        regionToEntrances.get(regions[0])?.add(entranceData.name);
        entranceTable.set(entranceData.name, null);

        if (entranceData.category) {
            categoryTable.set(entranceData.name, entranceData.category);
            let entrancesInCategory =
                categoryToEntrances.get(entranceData.category) ?? new Set();
            entrancesInCategory.add(entranceData.name);
            categoryToEntrances.set(entranceData.category, entrancesInCategory);
        }
        if (entranceData.reverse) {
            vanillaReverseTable.set(entranceData.name, entranceData.reverse);
            vanillaReverseTable.set(entranceData.reverse, entranceData.name);
            let reverseRegions = getRegionsFromEntranceName(
                entranceData.reverse
            );
            entranceTable.set(entranceData.reverse, null);
            vanillaTable.set(entranceData.reverse, reverseRegions[1]);
            if (!regionToEntrances.has(reverseRegions[0])) {
                regionToEntrances.set(
                    reverseRegions[0],
                    new Set([entranceData.reverse])
                );
            }
            regionToEntrances.get(reverseRegions[0])?.add(entranceData.reverse);
            if (entranceData.category) {
                let reverseCategory =
                    reverseCategoryMap.get(entranceData.category) ??
                    entranceData.category;
                categoryTable.set(entranceData.reverse, reverseCategory);
                let entrancesInCategory =
                    categoryToEntrances.get(reverseCategory) ?? new Set();
                entrancesInCategory.add(entranceData.reverse);
                categoryToEntrances.set(reverseCategory, entrancesInCategory);
            }
        }
    };

    /**
     * Configures the reverse category map
     * @param {Object.<string, string>} data 
     */
    const setReverseCategoryMap = (data) => {
        for (let category of Object.getOwnPropertyNames(
            data
        )) {
            reverseCategoryMap.set(
                category,
                data[category]
            );
        }
    }

    /**
     * Sets the categories of entrances considered adoptable
     * @param {string[]} data 
     */
    const setAdoptableEntrances = (data) => {
        adoptableEntrances = new Set(data);
    }

    /**
     * Clears entries from table
     * @param {Set<string|undefined>} [categories] If set, only entrances in these categories will be reset
     */
    let clearEntranceTable = (categories) => {
        if (!categories) {
            for (let key of entranceTable.keys()) {
                entranceTable.set(key, null);
                reverseTable.delete(key);
                onChange(key);
            }
        } else {
            for (let key of entranceTable.keys()) {
                if (categories.has(categoryTable.get(key))) {
                    entranceTable.set(key, null);
                    reverseTable.delete(key);
                    onChange(key);
                }
            }
        }
    };

    /**
     * Sets entries to vanilla
     * @param {Set<string|undefined>} [categories] If set, only entrances in these categories will be reset
     */
    let resetEntranceTable = (categories) => {
        if (!categories) {
            for (let entrance of entranceTable.keys()) {
                entranceTable.set(entrance, vanillaTable.get(entrance) || "");
                let reverseKey = vanillaReverseTable.get(entrance);
                if (reverseKey) {
                    reverseTable.set(entrance, reverseKey);
                }
                onChange(entrance);
            }
        } else {
            for (let entrance of entranceTable.keys()) {
                if (!categories.has(categoryTable.get(entrance))) {
                    continue;
                }
                entranceTable.set(entrance, vanillaTable.get(entrance) || "");
                let reverseKey = vanillaReverseTable.get(entrance);
                if (reverseKey) {
                    reverseTable.set(entrance, reverseKey);
                }
                onChange(entrance);
            }
        }
    };

    /**
     * Sets an entrance to act like another ex A->B set to act like C->D then A will lead to D
     * @param {String} entrance The entrance name having its destination reassigned
     * @param {String} entranceRole The role the entrance will play
     * @param {boolean} [doReverse] If true, if a reverse exists, it will be set as well
     */
    let setEntrance = (entrance, entranceRole, doReverse = true) => {
        let doingReverse = doReverse && vanillaReverseTable.has(entrance);
        entranceTable.set(entrance, vanillaTable.get(entranceRole) ?? null);
        if (doingReverse) {
            // when setting the reverse, the opposite of the entranceRole has it role set to the entrances role
            let reverseRole = vanillaReverseTable.get(entrance);
            let reverseEntrance = vanillaReverseTable.get(entranceRole);
            if (reverseRole && reverseEntrance) {
                reverseTable.set(entrance, reverseEntrance);
                reverseTable.set(reverseEntrance, entrance);
                setEntrance(reverseEntrance, reverseRole, false);
            }
        }
        onChange(entrance);
    };

    /**
     *
     * @param {string} entrance
     * @param {boolean} doReverse
     */
    let resetEntrance = (entrance, doReverse = true) => {
        entranceTable.set(entrance, vanillaTable.get(entrance) || "");
        let reverseKey = vanillaReverseTable.get(entrance);
        if (reverseKey && doReverse) {
            reverseTable.set(entrance, reverseKey);
            resetEntrance(reverseKey, false);
        }
        onChange(entrance);
    };

    /**
     * Clears an entrance
     * @param {String} entrance The name of the entrance to clear
     * @param {boolean} doReverse If true, the currently set reverse will be cleared as well.
     */
    let clearEntrance = (entrance, doReverse = true) => {
        entranceTable.set(entrance, null);
        let doingReverse = doReverse && reverseTable.has(entrance);
        let reverse = reverseTable.get(entrance);
        reverseTable.delete(entrance);
        if (doingReverse && reverse) {
            clearEntrance(reverse, false);
        }
        onChange(entrance);
    };

    /**
     * Gets where an entrance actually leads to
     * @param {string} name
     * @returns
     */
    let getEntranceDestRegion = (name) => {
        return entranceTable.get(name) ?? null;
    };

    /**
     * Gets where an entrance leads to in vanilla
     * @param {string} name
     * @returns
     */
    let getEntranceVanillaDestRegion = (name) => {
        return vanillaTable.get(name) ?? null;
    };

    /**
     * Gets a list of entrances within a region
     * @param {string} regionName
     * @returns
     */
    let getEntrancesInRegion = (regionName) => {
        return regionToEntrances.get(regionName) ?? new Set();
    };

    /**
     *
     * @param {string} entrance
     * @returns
     */
    let getEntranceCategory = (entrance) => {
        return categoryTable.get(entrance) ?? null;
    };

    /**
     *
     * @param {String} category
     * @returns
     */
    let getEntrancesInCategory = (category) => {
        return categoryToEntrances.get(category) ?? new Set();
    };

    /**
     *
     * @param {Set<String>} categories
     * @returns
     */
    let getEntrancesInCategories = (categories) => {
        let entrances = new Set();
        categories.forEach((category) =>
            getEntrancesInCategory(category).forEach((entrance) =>
                entrances.add(entrance)
            )
        );
        return entrances;
    };

    /**
     *
     * @param {String} entrance
     * @returns
     */
    let getEntranceAdoptability = (entrance) => {
        let category = categoryTable.get(entrance);
        if (category && adoptableEntrances.has(category)) {
            return true;
        }
        return false;
    };

    // https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
    let jsonReplacer = (key, value) => {
        if (value instanceof Map) {
            return {
                dataType: "Map",
                value: Array.from(value.entries()), // or with spread: value: [...value]
            };
        } else if (value instanceof Set) {
            return {
                dataType: "Set",
                value: [...value.values()],
            };
        } else {
            return value;
        }
    };

    let jsonReviver = (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (value.dataType === "Map") {
                return new Map(value.value);
            } else if (value.dataType === "Set") {
                return new Set(value.value);
            }
        }
        return value;
    };

    let exportToString = () => {
        let data = {
            version: 1,
            entranceTable,
            reverseTable,
        };
        return JSON.stringify(data, jsonReplacer);
    };

    let importString = (stringData) => {
        let data = JSON.parse(stringData, jsonReviver);
        if (!(data.version === 1)) {
            console.error(
                `Unrecognized entrance data version: ${data.version}`
            );
            return false;
        }
        if (data.entranceTable && data.reverseTable) {
            entranceTable = data.entranceTable;
            reverseTable = data.reverseTable;
            entranceTable.forEach((_, key) => onChange(key));
            reverseTable.forEach((_, key) => onChange(key));
            return true;
        }

        console.error(`Failed to find needed data in entrance table`);
        return false;
    };

    return {
        getEntranceSubscriber,
        setEntrance,
        resetEntrance,
        clearEntrance,
        addEntrance,
        resetEntranceTable,
        clearEntranceTable,
        importString,
        exportToString,
        setAdoptableEntrances,
        setReverseCategoryMap,
        getEntranceVanillaDestRegion,
        getEntranceDestRegion,
        getEntrancesInRegion,
        getEntranceCategory,
        getEntrancesInCategory,
        getEntrancesInCategories,
        getEntranceAdoptability,
    };
};

export { createEntranceManager };
