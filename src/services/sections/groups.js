// @ts-check
// Builds a static tree about different areas in the game
// TODO: Make this less specific to OOT

import { getEntrancesInRegion } from "../entrances/entranceManager";
import { getChecksInRegion } from "../regions/regionManager";

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

/** @type {Map<String, Group>} */
let sections = new Map();

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
        getChecksInRegion(region).forEach((check) => checks.add(check));
        getEntrancesInRegion(region).forEach((entrance) => exits.add(entrance));
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

let getSectionWithRegion = (regionName) => {
    return regionToSection.get(regionName) ?? null;
};

/**
 * Used to create a warning and not crash, do not use unless in an error state
 * @returns {Group}
 */
let createNullSection = () => {
    let checks = new Set();
    let exits = new Set();
    console.warn("Null Section created");
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
        sections.set(key, loadGroup(key, data[key]));
    }
};

loadGroups(require("../../data/OOT/Sections.json"));
console.log(sections);

export { sections, createNullSection, getSectionWithRegion };
