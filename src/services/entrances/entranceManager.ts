// In charge of keeping track of entrance information
// Needs to be redone/replaced with version that does not use the OOT way of doing things.
interface EntranceData {
    category?: string;
    name: string;
    reverse?: string;
}

interface EntranceManager {
    getEntranceSubscriber: (entrance: string) => (listener: () => void) => () => void;
    setEntrance: (entrance: string, entranceRole: string, doReverse?: boolean | undefined) => void;
    resetEntrance: (entrance: string, doReverse?: boolean) => void;
    clearEntrance: (entrance: string, doReverse?: boolean) => void;
    resetEntranceTable: (categories?: Set<string | undefined> | undefined) => void;
    clearEntranceTable: (categories?: Set<string | undefined> | undefined) => void;
    setAdoptableEntrances: (data: string[]) => void;
    setReverseCategoryMap: (data: { [x: string]: string; }) => void;
    addEntrance: (entranceData: EntranceData) => void;
    importString: (stringData: string) => boolean;
    exportToString: () => string;
    getEntranceVanillaDestRegion: (name: string) => string | null;
    getEntranceDestRegion: (name: string) => string | null;
    getEntrancesInRegion: (regionName: string) => Set<string>;
    getEntranceCategory: (entrance: string) => string | null;
    getEntrancesInCategory: (category: string) => Set<string>;
    getEntrancesInCategories: (categories: Set<string>) => Set<string>;
    getEntranceAdoptability: (entrance: string) => boolean;
}


const createEntranceManager = (): EntranceManager => {
    const onChangeListeners: Map<string, Set<() => void>> = new Map();

    const getEntranceSubscriber = (entrance: string) => {
        return (listener: () => void) => {
            const listeners = onChangeListeners.get(entrance) ?? new Set();
            listeners.add(listener);
            onChangeListeners.set(entrance, listeners);
            return () => {
                // clean up function
                listeners.delete(listener);
            };
        };
    };

    const onChange = (entrance: string) => {
        onChangeListeners.get(entrance)?.forEach((listener) => listener());
    };

    // These tables take an entrance name (ex: A -> B) as the key,
    // and give a region (C) as the output, connecting Region A a to region C
    const vanillaTable: Map<string, string> = new Map();

    let entranceTable: Map<string, string | null> = new Map();

    // entrance name -> category
    const categoryTable: Map<string, string> = new Map();

    // category -> entrances
    const categoryToEntrances: Map<string, Set<string>> = new Map();

    // Grabs the vanilla reverse entrance for a given entrance
    const vanillaReverseTable: Map<string, string> = new Map();
    let reverseTable: Map<string, string> = new Map();

    // Maps regions to the entrances they contain
    const regionToEntrances: Map<string, Set<string>> = new Map();

    // Sets the category of the reverse of entrances
    const reverseCategoryMap: Map<string, string> = new Map();
    let adoptableEntrances: Set<string> = new Set();

    /**
     * Extracts the regions from an entrance name
     * TODO, Make this Less OOT specific
     * @param name
     */
    const getRegionsFromEntranceName = (name: string) => {
        return name.split(" -> ");
    };

    // TODO, make this less OOT specific
    /**
     * @param {EntranceData} entranceData
     */
    const addEntrance = (entranceData: EntranceData) => {
        const regions = getRegionsFromEntranceName(entranceData.name);
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
            const entrancesInCategory =
                categoryToEntrances.get(entranceData.category) ?? new Set();
            entrancesInCategory.add(entranceData.name);
            categoryToEntrances.set(entranceData.category, entrancesInCategory);
        }
        if (entranceData.reverse) {
            vanillaReverseTable.set(entranceData.name, entranceData.reverse);
            vanillaReverseTable.set(entranceData.reverse, entranceData.name);
            const reverseRegions = getRegionsFromEntranceName(
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
                const reverseCategory =
                    reverseCategoryMap.get(entranceData.category) ??
                    entranceData.category;
                categoryTable.set(entranceData.reverse, reverseCategory);
                const entrancesInCategory =
                    categoryToEntrances.get(reverseCategory) ?? new Set();
                entrancesInCategory.add(entranceData.reverse);
                categoryToEntrances.set(reverseCategory, entrancesInCategory);
            }
        }
    };

    /**
     * Configures the reverse category map
     * @param data 
     */
    const setReverseCategoryMap = (data: { [entranceName: string]: string; }) => {
        for (const category of Object.getOwnPropertyNames(
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
     * @param data 
     */
    const setAdoptableEntrances = (data: string[]) => {
        adoptableEntrances = new Set(data);
    }

    /**
     * Clears entries from table
     * @param {Set<string|undefined>} [categories] If set, only entrances in these categories will be reset
     */
    const clearEntranceTable = (categories: Set<string | undefined>) => {
        if (!categories) {
            for (const key of entranceTable.keys()) {
                entranceTable.set(key, null);
                reverseTable.delete(key);
                onChange(key);
            }
        } else {
            for (const key of entranceTable.keys()) {
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
    const resetEntranceTable = (categories: Set<string | undefined>) => {
        if (!categories) {
            for (const entrance of entranceTable.keys()) {
                entranceTable.set(entrance, vanillaTable.get(entrance) || "");
                const reverseKey = vanillaReverseTable.get(entrance);
                if (reverseKey) {
                    reverseTable.set(entrance, reverseKey);
                }
                onChange(entrance);
            }
        } else {
            for (const entrance of entranceTable.keys()) {
                if (!categories.has(categoryTable.get(entrance))) {
                    continue;
                }
                entranceTable.set(entrance, vanillaTable.get(entrance) || "");
                const reverseKey = vanillaReverseTable.get(entrance);
                if (reverseKey) {
                    reverseTable.set(entrance, reverseKey);
                }
                onChange(entrance);
            }
        }
    };

    /**
     * Sets an entrance to act like another ex A->B set to act like C->D then A will lead to D
     * @param entrance The entrance name having its destination reassigned
     * @param entranceRole The role the entrance will play
     * @param [doReverse] If true, if a reverse exists, it will be set as well
     */
    const setEntrance = (entrance: string, entranceRole: string, doReverse: boolean = true) => {
        const doingReverse = doReverse && vanillaReverseTable.has(entrance);
        entranceTable.set(entrance, vanillaTable.get(entranceRole) ?? null);
        if (doingReverse) {
            // when setting the reverse, the opposite of the entranceRole has it role set to the entrances role
            const reverseRole = vanillaReverseTable.get(entrance);
            const reverseEntrance = vanillaReverseTable.get(entranceRole);
            if (reverseRole && reverseEntrance) {
                reverseTable.set(entrance, reverseEntrance);
                reverseTable.set(reverseEntrance, entrance);
                setEntrance(reverseEntrance, reverseRole, false);
            }
        }
        onChange(entrance);
    };

    const resetEntrance = (entrance: string, doReverse: boolean = true) => {
        entranceTable.set(entrance, vanillaTable.get(entrance) || "");
        const reverseKey = vanillaReverseTable.get(entrance);
        if (reverseKey && doReverse) {
            reverseTable.set(entrance, reverseKey);
            resetEntrance(reverseKey, false);
        }
        onChange(entrance);
    };

    /**
     * Clears an entrance
     * @param entrance The name of the entrance to clear
     * @param doReverse If true, the currently set reverse will be cleared as well.
     */
    const clearEntrance = (entrance: string, doReverse: boolean = true) => {
        entranceTable.set(entrance, null);
        const doingReverse = doReverse && reverseTable.has(entrance);
        const reverse = reverseTable.get(entrance);
        reverseTable.delete(entrance);
        if (doingReverse && reverse) {
            clearEntrance(reverse, false);
        }
        onChange(entrance);
    };

    /**
     * Gets where an entrance actually leads to
     * @param name
     * @returns
     */
    const getEntranceDestRegion = (name: string) => {
        return entranceTable.get(name) ?? null;
    };

    /**
     * Gets where an entrance leads to in vanilla
     * @param name
     * @returns
     */
    const getEntranceVanillaDestRegion = (name: string) => {
        return vanillaTable.get(name) ?? null;
    };

    /**
     * Gets a list of entrances within a region
     * @param regionName
     * @returns
     */
    const getEntrancesInRegion = (regionName: string) => {
        return regionToEntrances.get(regionName) ?? new Set();
    };

    const getEntranceCategory = (entrance: string) => {
        return categoryTable.get(entrance) ?? null;
    };

    const getEntrancesInCategory = (category: string) => {
        return categoryToEntrances.get(category) ?? new Set();
    };

    const getEntrancesInCategories = (categories: Set<string>) => {
        const entrances: Set<string> = new Set();
        categories.forEach((category) =>
            getEntrancesInCategory(category).forEach((entrance) =>
                entrances.add(entrance)
            )
        );
        return entrances;
    };

    const getEntranceAdoptability = (entrance: string) => {
        const category = categoryTable.get(entrance);
        if (category && adoptableEntrances.has(category)) {
            return true;
        }
        return false;
    };

    // https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
    const jsonReplacer = (_key: string, value: unknown) => {
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

    const jsonReviver = (_key: string, value: {dataType:"Map", value: [string, string][]} | {dataType:"Set", value:string[]}) => {
        if (typeof value === "object" && value !== null) {
            if (value.dataType === "Map") {
                return new Map(value.value);
            } else if (value.dataType === "Set") {
                return new Set(value.value);
            }
        }
        return value;
    };

    const exportToString = () => {
        const data = {
            version: 1,
            entranceTable,
            reverseTable,
        };
        return JSON.stringify(data, jsonReplacer);
    };

    const importString = (stringData: string) => {
        const data = JSON.parse(stringData, jsonReviver);
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
export type { EntranceManager };
