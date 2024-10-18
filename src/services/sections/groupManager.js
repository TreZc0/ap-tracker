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
 * @prop {String[]} regions
 */

/**
 * @typedef GroupManager
 * @prop { Map<string, Group>} groups
 * @prop {() => Group} createNullGroup
 * @prop {(regionName: any) => string | null} getGroupWithRegion
 * 
 */

/**
 *
 * @param {import("../entrances/entranceManager").EntranceManager} entranceManager
 * @param {import("../regions/regionManager").RegionManager} regionManager
 * @returns {GroupManager}
 */
let createGroupManager = (entranceManager, regionManager) => {
    /** @type {Map<String, Group>} */
    let groups = new Map();

    /** @type {Map<String, String>} */
    let regionToSection = new Map();

    /**
     * @param {String} sectionName
     * @param {GroupData} sectionData
     * @returns {Group}
     */
    let loadGroup = (sectionName, sectionData) => {
        let checks = new Set();
        let exits = new Set();
        let adoptable = false;

        for (let region of sectionData.regions) {
            regionManager
                .getChecksInRegion(region)
                .forEach((check) => checks.add(check));
            entranceManager
                .getEntrancesInRegion(region)
                .forEach((entrance) => exits.add(entrance));
            if (regionToSection.has(region)) {
                console.warn(
                    `${region} is in more than one section: ${regionToSection.get(
                        region
                    )} and ${sectionName}`
                );
            }
            regionToSection.set(region, sectionName);
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
                return sectionName;
            },
        };
    };

    let getGroupWithRegion = (regionName) => {
        return regionToSection.get(regionName) ?? null;
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
                return "<Section Not Found>";
            },
        };
    };

    let loadGroups = (data) => {
        for (let key of Object.getOwnPropertyNames(data)) {
            groups.set(key, loadGroup(key, data[key]));
        }
    };

    loadGroups(require("../../games/OOT/Sections.json"));
    console.log(groups);
    return { groups, createNullGroup, getGroupWithRegion };
};

export { createGroupManager };
