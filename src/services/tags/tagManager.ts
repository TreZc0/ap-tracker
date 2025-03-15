import { CheckManager } from "../checks/checkManager";
import SavedConnectionManager from "../savedConnections/savedConnectionManager";

interface TagType {
    displayName: string;
    id: string;
    iconColor?: string;
    textColor?: string;
    hideWhenChecked: boolean;
    convertToWhenChecked?: string | null;
    considerChecked: boolean;
    icon: string;
    priority: number;
    tagCounterId?: string;
    internalUseOnly?: boolean;
    doNotSave?: boolean;
}

interface Tag {
    type: TagType;
    tagId?: string;
    text?: string;
    checkName?: string;
    counter?: TagCounter;
}

interface TagData {
    typeId: string;
    tagId?: string;
    text?: string;
    checkName?: string;
}

const builtInTagTypeDefaults: { [s: string]: TagType; } = {
    hint: {
        displayName: "Hint",
        id: "hint",
        textColor: "coral",
        iconColor: "#ff0000",
        considerChecked: false,
        tagCounterId: "hints",
        icon: "flag",
        priority: 50,
        hideWhenChecked: false,
        convertToWhenChecked: "hint_found",
        doNotSave: true,
    },
    hint_found: {
        displayName: "Hint",
        id: "hint_found",
        textColor: "green",
        iconColor: "#00ff00",
        considerChecked: false,
        tagCounterId: null,
        icon: "flag_check",
        priority: 50,
        hideWhenChecked: false,
        doNotSave: true,
    },
    star: {
        displayName: "Starred",
        id: "star",
        textColor: "orange",
        iconColor: "orange",
        considerChecked: false,
        tagCounterId: "stars",
        icon: "star",
        priority: 100,
        hideWhenChecked: false,
    },
    ignore: {
        displayName: "Ignored",
        textColor: "grey",
        iconColor: "grey",
        id: "ignore",
        considerChecked: true,
        icon: "block",
        priority: 50,
        hideWhenChecked: false,
        convertToWhenChecked: null,
    },
    deleted: {
        // Fail safe tag for un-recognized or deleted tags
        displayName: "Deleted Tag",
        id: "deleted",
        icon: "fmd_bad",
        priority: 0,
        hideWhenChecked: false,
        considerChecked: false,
        internalUseOnly: true,
        doNotSave: true,
    },
};

enum CounterMode {
    countUnchecked= 0,
    countChecked= 1,
    countAll= 2,
};

interface TagCounter {
    id: string;
    displayName: string;
    color: string;
    icon?: string;
    countMode: CounterMode;
    showTotal: boolean;
}

const builtInTagCounterDefaults = {
    hints: {
        id: "hints",
        displayName: "Hints",
        icon: "flag",
        color: "red",
        countMode: CounterMode.countUnchecked,
        showTotal: false, // Shows the count (based on count mode) out of the total number of items in that group with that tag
    },
    stars: {
        id: "stars",
        displayName: "Starred Checks",
        icon: "star",
        color: "orange",
        countMode: CounterMode.countChecked,
        showTotal: true,
    },
};

const generateTagId = (n = 16) => {
    let result = "";
    while (n-- > 0) {
        result += Math.floor(Math.random() * 36).toString(36);
    }
    return result;
};

// const TAG_ITEM_NAME = "archipelagoTrackerTagData";

interface TagManager {
    removeTag: (tag: TagData, saveId: string | undefined) => void;
    addTag: (tag: TagData, saveId: string | undefined) => void;
    loadTags: (saveId: string | undefined) => void;
    createTagType: () => void;
    deleteTagType: () => void;
    getTagType: (typeID: string) => TagType;
    createTagData: () => TagData;
    extractTagData: (tag: Tag) => TagData;
    getCounter: (counterId: string) => TagCounter;
}

const createTagManager = (checkManager: CheckManager): TagManager => {
    /** @type {Map<string, Set<()=>void>>} */
    const tagListenerCleanupCalls: Map<string, Set<() => void>> = new Map();
    const createTagType = () => {};

    const deleteTagType = () => {};''
    const buildTag = (tagData: TagData): Tag => {
        const type = getTagType(tagData.typeId);
        let tag = {
            type,
            tagId: tagData.tagId,
            text: tagData.text,
            checkName: tagData.checkName,
            counter: type.tagCounterId
                ? getCounter(type.tagCounterId)
                : undefined,
        };
        return tag;
    };

    /**
     *
     * @param {Tag} tag
     * @param {string | undefined} saveId
     */
    const handleTagConversion = (tag: Tag, saveId: string | undefined) => {
        let tagData = extractTagData(tag);
        if (tag.checkName) {
            let checkStatus = checkManager.getCheckStatus(tag.checkName);
            if (checkStatus.checked) {
                if (tag.type.convertToWhenChecked === null) {
                    removeTag(tagData, saveId);
                } else if (tag.type.convertToWhenChecked) {
                    removeTag(tagData, saveId);
                    let newTagData = createTagData();
                    newTagData.checkName = tagData.checkName;
                    newTagData.tagId = tagData.tagId;
                    newTagData.typeId = tag.type.convertToWhenChecked;
                    newTagData.text = tagData.text;
                    addTag(newTagData, saveId);
                }
            }
        }
    };

    /**
     * @param {TagData} tagData
     * @param {string | undefined} saveId
     */
    const addTag = (tagData: TagData, saveId: string | undefined) => {
        let tag = buildTag(tagData);
        // clear any existing listeners about the tag in case of duplicates.
        removeTag(tagData, saveId);

        if (!tag.type.doNotSave && saveId) {
            saveTag(tagData, saveId);
        }

        // Add the tag to any relevant checks, set up conversion listeners
        if (tagData.checkName) {
            let checkStatus = checkManager.getCheckStatus(tagData.checkName);
            const checkTags = checkStatus.tags.slice();
            // check for existing tag with that id
            let found = false;
            for (let i = 0; i < checkTags.length && !found; i++) {
                if (checkTags[i].tagId === tagData.tagId) {
                    checkTags[i] = tag;
                    found = true;
                }
            }
            if (!found) {
                checkTags.push(tag);
            }

            if (tag.type.convertToWhenChecked !== undefined) {
                let convertTag = () => {
                    handleTagConversion(tag, saveId);
                };

                let checkSubscriber = checkManager.getSubscriberCallback(
                    tag.checkName
                );
                let cleanUpCalls =
                    tagListenerCleanupCalls.get(tag.tagId) ?? new Set();
                cleanUpCalls.add(checkSubscriber(convertTag));
                tagListenerCleanupCalls.set(tag.tagId, cleanUpCalls);
            }
            if (tag.type.considerChecked) {
                checkManager.updateCheckStatus(tagData.checkName, {
                    ignored: true,
                    tags: checkTags,
                });
            } else {
                checkManager.updateCheckStatus(tagData.checkName, {
                    tags: checkTags,
                });
            }
        }
    };

    /**
     * @param {TagData} tagData
     * @param {string} saveId
     */
    const saveTag = (tagData: TagData, saveId: string) => {
        let saveData = SavedConnectionManager.getConnectionSaveData(saveId);
        if (!saveData) {
            saveData = {};
        }
        if (!saveData.tagData) {
            saveData.tagData = {};
        }
        if (!tagData.tagId) {
            tagData.tagId = generateTagId();
        }
        saveData.tagData[tagData.tagId] = tagData;
        SavedConnectionManager.updateConnectionSaveData(saveId, saveData);
    };

    /**
     * @param {TagData} tag
     * @param {string | undefined} saveId
     */
    const removeTag = (tag: TagData, saveId: string | undefined) => {
        // Delete tag from data if it exists there
        if (saveId && tag.tagId) {
            let saveData = SavedConnectionManager.getConnectionSaveData(saveId);
            if (!saveData) {
                saveData = {};
            }
            if (!saveData.tagData) {
                saveData.tagData = {};
            }
            delete saveData.tagData[tag.tagId];
            SavedConnectionManager.updateConnectionSaveData(saveId, saveData);
        }

        // Remove tag from checks
        if (tag.tagId && tag.checkName) {
            let checkStatus = checkManager.getCheckStatus(tag.checkName);
            let checkTags = checkStatus.tags.slice();
            // check for existing tag with that id
            let found = false;
            let keepIgnore = false;
            for (let i = 0; i < checkTags.length; i++) {
                if (checkTags[i].tagId === tag.tagId) {
                    checkTags.splice(i, 1);
                    i--;
                    found = true;
                } else if (checkTags[i].type.considerChecked) {
                    keepIgnore = true;
                }
            }

            let cleanUpCalls = tagListenerCleanupCalls.get(tag.tagId);
            if (cleanUpCalls) {
                cleanUpCalls.forEach((cleanUpCall) => cleanUpCall());
            }

            if (found) {
                checkManager.updateCheckStatus(tag.checkName, {
                    ignored: keepIgnore,
                    tags: checkTags.slice(0),
                });
            }
        }
    };

    /**
     *
     * @returns {TagData}
     */
    const createTagData = (): TagData => {
        return {
            typeId: "",
        };
    };
    /**
     * @param {Tag} tag
     * @returns {TagData}
     */
    const extractTagData = (tag: Tag): TagData => {
        return {
            typeId: tag.type.id,
            tagId: tag.tagId,
            text: tag.text,
            checkName: tag.checkName,
        };
    };

    /**
     *
     * @param {string} typeID
     */
    const getTagType = (typeID: string) => {
        // TODO, make this use an internal state of tags, instead of these built in defaults
        return builtInTagTypeDefaults[typeID];
    };

    /**
     *
     * @param {string} counterId
     * @returns {TagCounter}
     */
    const getCounter = (counterId: string): TagCounter => {
        // TODO, make this use an internal state of tags, instead of these built in defaults
        return builtInTagCounterDefaults[counterId];
    };

    /**
     *
     * @param {string | undefined} saveId
     */
    const loadTags = (saveId: string | undefined) => {
        let saveData = SavedConnectionManager.getConnectionSaveData(saveId);
        if (!saveData) {
            saveData = {};
        }
        if (!saveData.tagData) {
            saveData.tagData = {};
        }
        let tagNames = Object.getOwnPropertyNames(saveData.tagData);
        tagNames.forEach((tagName) => {
            addTag(saveData.tagData[tagName], saveId);
        });
    };

    return {
        removeTag,
        addTag,
        loadTags,
        createTagType,
        deleteTagType,
        getTagType,
        createTagData,
        extractTagData,
        getCounter,
    };
};

export { createTagManager, CounterMode };
export type {Tag, TagData, TagCounter, TagManager, TagType}
