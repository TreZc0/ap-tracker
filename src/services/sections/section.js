// @ts-check
import { getEntrancesInRegion } from "../entrances/entranceManager";
import { getChecksInRegion } from "../regions/regionManager";

/**
 * @typedef Section
 * @prop {Set<string>} checks
 * @prop {Set<String>} exits
 * @prop {string} name
 * @prop {boolean} adoptable
 */

/**
 * @typedef SectionData
 * @prop {String[]} regions
 */

/** @type {Map<String, Section>} */
let sections = new Map();

/** @type {Map<String, String>} */
let regionToSection = new Map();

/**
 * @param {String} sectionName
 * @param {SectionData} sectionData
 * @returns {Section}
 */
let loadSection = (sectionName, sectionData) => {
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
 * @returns {Section}
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

let loadSections = (data) => {
    for (let key of Object.getOwnPropertyNames(data)) {
        sections.set(key, loadSection(key, data[key]));
    }
};

loadSections(require("../../data/OOT/Sections.json"));
console.log(sections);

export { sections, createNullSection, getSectionWithRegion };
