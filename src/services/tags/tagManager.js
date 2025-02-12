// @ts-check
import SavedConnectionManager from "../savedConnections/savedConnectionManager";

/**
 * @typedef TagType
 * @prop {string} displayName The name displayed to the user
 * @prop {string} id Internal name for tracking
 * @prop {string} [iconColor] Valid web color
 * @prop {string} [textColor] Valid web color
 * @prop {boolean} hideWhenChecked If true, tag will not be visible on completed checks, but not deleted
 * @prop {string | null} [convertToWhenChecked] when set, converts tag to a different type when checked
 * @prop {boolean} considerChecked If true, tag will count as collected when added
 * @prop {string} icon Which icon to use for this tag
 * @prop {number} priority When multiple tags are on a location, the one with the highest priority will show
 * @prop {string} [tagCounterId] If it exists, it will add an additional counter that decrements with the tag locations that are marked as collected
 * @prop {boolean} [internalUseOnly] if true, tag may not be modified by user
 * @prop {boolean} [doNotSave] if true, tag will not be saved to local storage when created
 */

/**
 * @typedef Tag
 * @prop {TagType} type
 * @prop {string} [tagId]
 * @prop {string} [text]
 * @prop {string} [checkName]
 * @prop {TagCounter} [counter]
 */

/**
 * @typedef TagData
 * @prop {string} typeId
 * @prop {string} [tagId]
 * @prop {string} [text]
 * @prop {string} [checkName]
 */

/**
 * @type {Object.<string, TagType>}
 */
const builtInTagTypeDefaults = {
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
    ignore: {
        displayName: "Ignore",
        id: "ignore",
        considerChecked: true,
        icon: "check_circle",
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

/** @enum {number} */
const CounterMode = {
    countUnchecked: 0,
    countChecked: 1,
    countAll: 2,
};

/**
 * @typedef TagCounter
 * @prop {string} id
 * @prop {string} displayName
 * @prop {string} color
 * @prop {string} [icon]
 * @prop {CounterMode} countMode
 * @prop {boolean} showTotal
 *
 */

const builtInTagCounterDefaults = {
    hints: {
        id: "hints",
        displayName: "Hints",
        icon: "flag",
        color: "red",
        countMode: CounterMode.countUnchecked,
        showTotal: false, // Shows the count (based on count mode) out of the total number of items in that group with that tag
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

/**
 * @typedef TagManager
 * @prop {(tag: TagData, saveId: string | undefined) => void} removeTag Removes a tag from the manager and from any checks specified in the data
 * @prop {(tag: TagData, saveId: string | undefined) => void} addTag Adds a tag to the manger and to any checks specified in the data
 * @prop {() => void} createTagType Creates a base tag type
 * @prop {() => void} deleteTagType
 * @prop {(typeID: string) => TagType} getTagType
 * @prop {()=>TagData} createTagData Creates the minimum object to be a tag
 * @prop {(tag: Tag)=>TagData} extractTagData Extracts tag data from a full tag
 * @prop {(counterId: string)=>TagCounter} getCounter Gets
 */
/**
 * @param {import("../checks/checkManager").CheckManager} checkManager
 * @returns {TagManager}
 */
const createTagManager = (checkManager) => {
    /** @type {Map<string, Set<()=>void>>} */
    const tagListenerCleanupCalls = new Map();
    const createTagType = () => {};

    const deleteTagType = () => {};

    /**
     *
     * @param {TagData} tagData
     * @returns {Tag}
     */
    const buildTag = (tagData) => {
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
    const handleTagConversion = (tag, saveId) => {
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
    const addTag = (tagData, saveId) => {
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
    const saveTag = (tagData, saveId) => {
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
    const removeTag = (tag, saveId) => {
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
    const createTagData = () => {
        return {
            typeId: "",
        };
    };
    /**
     * @param {Tag} tag
     * @returns {TagData}
     */
    const extractTagData = (tag) => {
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
    const getTagType = (typeID) => {
        // TODO, make this use an internal state of tags, instead of these built in defaults
        return builtInTagTypeDefaults[typeID];
    };

    /**
     *
     * @param {string} counterId
     * @returns {TagCounter}
     */
    const getCounter = (counterId) => {
        // TODO, make this use an internal state of tags, instead of these built in defaults
        return builtInTagCounterDefaults[counterId];
    };

    return {
        removeTag,
        addTag,
        createTagType,
        deleteTagType,
        getTagType,
        createTagData,
        extractTagData,
        getCounter,
    };
};

export { createTagManager, CounterMode };
