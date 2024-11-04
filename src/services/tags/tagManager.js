// @ts-check
import SavedConnectionManager from "../savedConnections/savedConnectionManager";
/**
 * @typedef TagType
 * @prop {string} displayName The name displayed to the user
 * @prop {string} typeID Internal name for tracking
 * @prop {string} [iconColor] Valid web color
 * @prop {string} [textColor] Valid web color
 * @prop {boolean} showBadge If true a dot of the tag's color will bubble up
 * @prop {boolean} hideWhenChecked If true, tag will not be visible on completed checks
 * @prop {boolean} markAsChecked If true, tag will count as collected when added
 * @prop {string} icon Which icon to use for this tag
 * @prop {number} priority When multiple tags are on a location, the one with the highest priority will show
 * @prop {string} [customCounterId] If it exists, it will add an aditional counter that incremetns with the tag locations that are marked as collected
 * @prop {string} [saveId] If it exists, this tag only applies to a specific save file - not used
 * @prop {boolean} [internalTag] if true, tag may not be modified by user
 */

/**
 * @typedef Tag
 * @prop {string} typeID
 * @prop {string} [tagID]
 * @prop {string} [text]
 * @prop {string} [checkName]
 * @prop {string} saveId
 */

/**
 * @type {Object.<string, TagType>}
 */
const builtInTagTypeDefaults = {
    hint: {
        displayName: "Hint",
        typeID: "hint",
        textColor: "coral",
        iconColor: "#ff0000",
        showBadge: true,
        markAsChecked: false,
        icon: "flag",
        priority: 50,
        hideWhenChecked: true,
    },
    ignore: {
        displayName: "Ignore",
        typeID: "ignore",
        showBadge: true,
        markAsChecked: true,
        icon: "check_circle",
        priority: 50,
        hideWhenChecked: true,
    },
    deleted: {
        // Fail safe tag for un-recognized or deleted tags
        displayName: "Deleted Tag",
        typeID: "deleted",
        showBadge: false,
        icon: "fmd_bad",
        priority: 0,
        hideWhenChecked: false,
        markAsChecked: false,
        internalTag: true,
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
 * @prop {(saveId: string, tagID: string) => void} removeTag
 * @prop {(tag: Tag) => void} saveTag
 * @prop {() => void} createTagType
 * @prop {() => void} deleteTagType
 * @prop {(typeID: string) => TagType} getTagType
 * @prop {()=>Tag} createTag
 */
/**
 * @param {import("../checks/checkManager").CheckManager} checkManager
 * @returns {TagManager}
 */
const createTagManager = (checkManager) => {
    const createTagType = () => {};

    const deleteTagType = () => {};

    /**
     * @param {Tag} tag
     */
    const saveTag = (tag) => {
        let saveData = SavedConnectionManager.getConnectionSaveData(tag.saveId);
        if (!saveData) {
            saveData = {};
        }
        if (!saveData.tagData) {
            saveData.tagData = {};
        }
        if (!tag.tagID) {
            tag.tagID = generateTagId();
        }
        saveData.tagData[tag.tagID] = tag;
        SavedConnectionManager.updateConnectionSaveData(tag.saveId, saveData);

        if (tag.checkName) {
            let checkStatus = checkManager.getCheckStatus(tag.checkName);
            const checkTags = checkStatus.tags.slice();
            // check for existing tag with that id
            let found = false;
            for (let i = 0; i < checkTags.length && !found; i++) {
                if (checkTags[i].tagID === tag.tagID) {
                    checkTags[i] = tag;
                    found = true;
                }
            }
            if (!found) {
                checkTags.push(tag);
            }
            checkManager.updateCheckStatus(tag.checkName, { tags: checkTags });
        }
    };

    /**
     * @param {string} saveId
     * @param {string} tagID
     */
    const removeTag = (saveId, tagID) => {
        let saveData = SavedConnectionManager.getConnectionSaveData(saveId);
        if (!saveData) {
            saveData = {};
        }
        if (!saveData.tagData) {
            saveData.tagData = {};
        }
        const tag = saveData.tagData[tagID];
        delete saveData.tagData[tagID];
        SavedConnectionManager.updateConnectionSaveData(saveId, saveData);

        if (tag && tag.checkName) {
            let checkStatus = checkManager.getCheckStatus(tag.checkName);
            let checkTags = checkStatus.tags.slice();
            // check for existing tag with that id
            let found = false;
            for (let i = 0; i < checkTags.length && !found; i++) {
                if (checkTags[i].tagID === tag.tagID) {
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
     * @returns {Tag}
     */
    const createTag = () => {
        return {
            typeID: "",
            saveId: "",
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

    return {
        removeTag,
        saveTag,
        createTagType,
        deleteTagType,
        getTagType,
        createTag,
    };
};

export { createTagManager };
