// @ts-check
import SavedConnectionManager from "../savedConnections/savedConnectionManager";

/**
 * @typedef TagType
 * @prop {string} displayName The name displayed to the user
 * @prop {string} id Internal name for tracking
 * @prop {string} [iconColor] Valid web color
 * @prop {string} [textColor] Valid web color
 * @prop {boolean} hideWhenChecked If true, tag will not be visible on completed checks
 * @prop {boolean} considerChecked If true, tag will count as collected when added
 * @prop {string} icon Which icon to use for this tag
 * @prop {number} priority When multiple tags are on a location, the one with the highest priority will show
 * @prop {string} [tagCounterId] If it exists, it will add an additional counter that decrements with the tag locations that are marked as collected
 * @prop {boolean} [internalUseOnly] if true, tag may not be modified by user
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
        hideWhenChecked: true,
    },
    ignore: {
        displayName: "Ignore",
        id: "ignore",
        considerChecked: true,
        icon: "check_circle",
        priority: 50,
        hideWhenChecked: true,
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

const TAG_ITEM_NAME = "archipelagoTrackerTagData";

/**
 * @typedef TagManager
 * @prop {(saveId: string, tagId: string) => void} removeTag
 * @prop {(tag: TagData, saveId: string) => void} saveTag
 * @prop {() => void} createTagType
 * @prop {() => void} deleteTagType
 * @prop {(typeID: string) => TagType} getTagType
 * @prop {()=>TagData} createTagData
 * @prop {(tag: Tag)=>TagData} extractTagData
 * @prop {(counterId: string)=>TagCounter} getCounter
 */
/**
 * @param {import("../checks/checkManager").CheckManager} checkManager
 * @returns {TagManager}
 */
const createTagManager = (checkManager) => {
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
     * @param {TagData} tagData
     * @param {string} saveId
     */
    const saveTag = (tagData, saveId) => {
        let tag = buildTag(tagData);
        let saveData = SavedConnectionManager.getConnectionSaveData(
            saveId
        );
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
        SavedConnectionManager.updateConnectionSaveData(
            saveId,
            saveData
        );

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
            checkManager.updateCheckStatus(tagData.checkName, {
                tags: checkTags,
            });
        }
    };

    /**
     * @param {string} saveId
     * @param {string} tagId
     */
    const removeTag = (saveId, tagId) => {
        let saveData = SavedConnectionManager.getConnectionSaveData(saveId);
        if (!saveData) {
            saveData = {};
        }
        if (!saveData.tagData) {
            saveData.tagData = {};
        }
        const tag = saveData.tagData[tagId];
        delete saveData.tagData[tagId];
        SavedConnectionManager.updateConnectionSaveData(saveId, saveData);

        if (tag && tag.checkName) {
            let checkStatus = checkManager.getCheckStatus(tag.checkName);
            let checkTags = checkStatus.tags.slice();
            // check for existing tag with that id
            let found = false;
            for (let i = 0; i < checkTags.length && !found; i++) {
                if (checkTags[i].tagId === tag.tagId) {
                    checkTags = checkTags.splice(i, 1);
                    found = true;
                }
            }

            if (found) {
                checkManager.updateCheckStatus(tag.checkName, {
                    tags: checkTags,
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
        saveTag,
        createTagType,
        deleteTagType,
        getTagType,
        createTagData,
        extractTagData,
        getCounter,
    };
};

export { createTagManager, CounterMode };
