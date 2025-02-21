// @ts-check
// Builds a static tree about different areas in the game
// TODO: Make this less specific to OOT

/**
 * @typedef Group
 * @prop {Set<string>} checks
 * @prop {Set<String>} exits
 * @prop {string} name
 * @prop {boolean} adoptable
 */

/**
 * @typedef GroupData
 * @prop {String[]} checks
 * @prop {String[]} [portals]
 */

/**
 * @typedef GroupManager
 * @prop { Map<string, Group>} groups
 * @prop {() => Group} createNullGroup
 * @prop {(data: {[x: string]: GroupData}) => void} loadGroups
 */

/**
 *
 * @param {import("../entrances/entranceManager").EntranceManager} entranceManager
 * @returns {GroupManager}
 */
let createGroupManager = (entranceManager) => {
    /** @type {Map<String, Group>} */
    let groups = new Map();

    /** @type {Map<String, String>} */
    let checkToGroup = new Map();

    /**
     * @param {String} groupName
     * @param {GroupData} groupData
     * @returns {Group}
     */
    let loadGroup = (groupName, groupData) => {
        let checks = new Set();
        let exits = new Set();
        let adoptable = false;

        for (let check of groupData.checks) {
            checks.add(check);
            // entranceManager
            //     .getEntrancesInRegion(region)
            //     .forEach((entrance) => exits.add(entrance));
            if (checkToGroup.has(check)) {
                // console.warn(
                //     `${check} is in more than one section: ${checkToGroup.get(
                //         check
                //     )} and ${groupName}`
                // );
            }
            checkToGroup.set(check, groupName);
        }
        return {
            get checks() {
                return checks;
            },
            get exits() {
                return exits;
            },
            get adoptable() {
                return adoptable;
            },
            get name() {
                return groupName;
            },
        };
    };

    /**
     * Used to create a warning and not crash, do not use unless in an error state
     * @returns {Group}
     */
    let createNullGroup = () => {
        let checks = new Set();
        let exits = new Set();
        console.warn("Null Group created");
        return {
            get checks() {
                return checks;
            },
            get exits() {
                return exits;
            },
            get adoptable() {
                return false;
            },
            get name() {
                return "<Group Not Found>";
            },
        };
    };

    /**
     *
     * @param {Object.<string, GroupData>} data
     */
    const loadGroups = (data) => {
        for (let key of Object.getOwnPropertyNames(data)) {
            groups.set(key, loadGroup(key, data[key]));
        }
        // console.log("Loaded groups:", groups);
    };
    return { groups, loadGroups, createNullGroup };
};

export { createGroupManager };
