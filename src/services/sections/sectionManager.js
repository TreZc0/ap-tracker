// @ts-check
import CheckManager from "../checks/checkManager";
import { sections as groups } from "./groups"

/** 
 * @typedef CheckReport
 * @prop {Set<String>} exist
 * @prop {Set<String>} checked
 * @prop {Set<String>} hinted
 * @prop {Set<String>} ignored
 */
/** @returns {CheckReport} */
const createNewCheckReport = () => {
    return {
        exist: new Set(),
        checked: new Set(),
        hinted: new Set(),
        ignored: new Set(),
    }
}

/** @type {Map<String, Section>} */
const sectionData = new Map();
/** @type {Map<String, SectionConfig>} */
const sectionConfigData = new Map();
/** @type {Map<String, Set<()=>void>>} */
const sectionSubscribers = new Map();


 /** @type {SectionType} */
 const defaultType = {
    show_when: true,
    type: "standard",
    flatten_when: false,
    show_entry_when: false,
    portal_categories: null
}

const defaultTheme = {
    color: "black"
}

/** @type {Section} */
const defaultSectionStatus = {
    title: "No Title",
    checks: new Map(),
    checkReport: createNewCheckReport(),
    theme: defaultTheme,
    type: defaultType,
    children: null,
}

/**
 *
 * @param {string} sectionName
 */
const deleteSection = (sectionName) => {
    sectionData.delete(sectionName);
    sectionSubscribers.get(sectionName)?.forEach((listener) => listener());
};

const deleteAllSections = () => {
    let names = [...sectionData.keys()];
    names.map((name) => deleteSection(name));
};

const updateSectionStatus = (sectionName, section) => {
    sectionData.set(sectionName, {
        ...(sectionData.get(sectionName) ?? defaultSectionStatus),
        ...section,
    });
    sectionSubscribers.get(sectionName)?.forEach((listner) => listner());
}

/**
 * 
 * @param {String} sectionName 
 * @returns 
 */
const getSubscriberCallback = (sectionName) => {
    return (/** @type {()=>void} */ listener) => {
        if (!sectionSubscribers.has(sectionName)) {
            sectionSubscribers.set(sectionName, new Set());
        }
        sectionSubscribers.get(sectionName)?.add(listener);
        // return a function to clean up the subscription
        return () => {
            sectionSubscribers.get(sectionName)?.delete(listener);
            if(!sectionSubscribers.get(sectionName)?.size){
                sectionSubscribers.delete(sectionName);
            }
        };
    };
};

/**
 * 
 * @param {String} sectionName 
 * @returns 
 */
const getSectionStatus = (sectionName) => sectionData.get(sectionName) ?? null;

/**
 * @typedef SectionCondition
 * @prop {string} [option]
 * @prop {string} [state]
 * @prop {*} [is]
 * @prop {SectionCondition} [and]
 * @prop {SectionCondition} [or]
 * @prop {SectionCondition} [not]
 */

const testOptions = {
    er:{
        overworld: true,
        grotto: true,
        interior: true,
        dungeon: true,
        boss: true,
    },
    grouping: {
        grottos: true,
        overworld: true,
        interiors: true,
        dungeons: true,
        bosses: true,
        regions: true,
    }
}


const sectionDefaults = {
    title: "Untitled Section",
    checkGroup: null,
    type: null,
    theme: "default",
    children: null,
}

const typeDefaults = {
    show_when: true,
    type: "standard",
    flatten_when: false,
    show_entry_when: false,
    portal_categories: null
}

const themeDefaults = {
    color: "black"
}


/**
 * Enum for how portals are displayed on a seciton
 * @readonly
 * @enum {number}
 */
const PORTAL_MODE = {
    None: 0,
    Editable: 1,
    ReadOnly: 2
}

/**
 * @typedef SectionTypeDef
 * @prop {boolean | SectionCondition} show_when
 * @prop {"entrance_pool" | "portal" | "standard"} type
 * @prop {boolean | SectionCondition} flatten_when
 * @prop {boolean | SectionCondition} show_entry_when
 * @prop {string[] | null} portal_categories
 */

/**
 * @typedef SectionType
 * @prop {boolean | SectionCondition} show_when
 * @prop {"entrance_pool" | "portal" | "standard"} type
 * @prop {boolean | SectionCondition} flatten_when
 * @prop {boolean | SectionCondition} show_entry_when
 * @prop {string[] | null} portal_categories
 */

/**
 * @typedef SectionDef
 * @prop {string} title
 * @prop {string | null} checkGroup
 * @prop {string | null} type
 * @prop {string} theme
 * @prop {string[] | null} children 
 */

/**
 * @typedef SectionConfig
 * @prop {string} title
 * @prop {string | string[] | null} checkGroup
 * @prop {SectionType} type
 * @prop {SectionTheme} theme
 * @prop {String[] | null} children 
 */

/**
 * @typedef Section
 * @prop {string} title
 * @prop {CheckReport} checkReport
 * @prop {Map<string, import("../checks/checkManager").CheckStatus>} checks
 * @prop {SectionType} type
 * @prop {SectionTheme} theme
 * @prop {String[] | null} children 
 */

/**
 * @typedef SectionThemeDef
 * @prop {string} color
 */

/**
 * @typedef SectionTheme
 * @prop {string} color
 */

/**
 * 
 * @param {SectionCondition | Boolean} condition 
 * @param {*} context 
 * @returns {Boolean}
 */
const evaluateCondition = (condition, context) => {
    if(typeof condition === "boolean"){
        return condition;
    }
    if(condition.not){
        return !evaluateCondition(condition.not, context);
    }
    let result = false;
    if(condition.state){
        let path = condition.state.split('.');
        let value = path.reduce((state, part) => state[part] ?? {}, context);
        result = value === condition.is;
    }
    if(condition.or){
        result ||= evaluateCondition(condition.or, context);
    }
    if(condition.and){
        result &&= evaluateCondition(condition.and, context);
    }

    return result;
}

/**
 * 
 * @param {*} configData 
 * @returns 
 */

// Builds a tree from the section config data that can be compiled into hard categories with options and state
/**
 * 
 * @param {*} configData 
 * @returns 
 */
const readSectionConfig = (configData) => {
    /** @type {Map<String, SectionType>} */
    const sectionTypes = new Map();
    /** @type {Map<String, SectionTheme>} */
    const sectionThemes = new Map();
    /**
     * Doesn't do much at the moment, reads types into section types
     * @param {string} name
     * @param {SectionTypeDef} type 
     */
    const readType = (name, type) => {
        const fullType = {
            ...typeDefaults,
            ...type
        }
        sectionTypes.set(name, fullType);
    }

    /**
     * Doesn't do much at the moment, reads types into section types
     * @param {string} name
     * @param {SectionThemeDef} theme 
     */
    const readTheme = (name, theme) => {
        const fullTheme = {
            ...themeDefaults,
            ...theme
        }
        sectionThemes.set(name, fullTheme);
    }

    /**
     * Assemble the categories
     * @param {string} categoryName 
     * @param {Set<string>} parents
     */
    const readCategory = (categoryName, parents=new Set()) => {
        if(parents.has(categoryName)){
            console.warn(`Circular dependency detected, ${categoryName} had a decendent that was itself. Parents: \n${[...parents.values()].join("\n")}`)
            return null;
        }
        if(!configData.categories[categoryName]){
            console.warn(`Failed to find category ${categoryName}`);
            return null;
        }
        /** @type {SectionDef} */
        const category = {
            ...sectionDefaults,
            ...configData.categories[categoryName]
        }
        /** @type {SectionConfig} */
        let result = {
            title: category.title,
            children: [],
            checkGroup: category.checkGroup,
            theme: defaultTheme,
            type: defaultType,
        }

        if(category.type){
            let type = sectionTypes.get(category.type);
            if(!type){
                throw new Error(`Failed to find type ${category.type} for ${category.title}`);
            }
            result.type = type;
        }

        if(category.theme){
            let theme = sectionThemes.get(category.theme);
            if(!theme){
                console.warn(`Failed to find theme ${category.theme} for ${category.title}, using default theme`);
            }else{
                result.theme = theme;
            }
        } 

        if (category.children){
            let parentage = new Set(parents);
            parentage.add(categoryName);
            for(let childName of category.children){
                readCategory(childName, parentage);
                result.children?.push(childName);
            }
        }
        sectionConfigData.set(categoryName, result);
        return result;
    }

    if(configData["types"]){
        for(let typeName of Object.keys(configData.types)){
            readType(typeName, configData.types[typeName]);
        }
    } else {
        console.warn("No 'types' property found in configuration data");
    }

    if(configData["themes"]){
        for(let themeName of Object.keys(configData.themes)){
            readTheme(themeName, configData.themes[themeName]);
        }
    } else {
        console.warn("No 'themes' property found in configuration data");
    }

    readCategory("root");
}


/** 
* @typedef SectionUpdateTreeNode
* @prop {string} sectionName
* @prop {Set<String>} checks
* @prop {CheckReport} checkReport
* @prop {SectionType} type
* @prop {boolean} shouldFlatten
* @prop {Set<SectionUpdateTreeNode>} children 
* @prop {Set<SectionUpdateTreeNode>} parents
* @prop {()=>void} remove
* @prop {()=>void} update
*/
const updateSectionData = (sectionName) => {
    
}



/**
 * Adds reported values from one check report to another
 * @param {CheckReport} sourceReport 
 * @param {CheckReport} destinationReport 
 */
const addCheckReport = (sourceReport, destinationReport) => {
    sourceReport.exist.forEach(check => destinationReport.exist.add(check));
    sourceReport.checked.forEach(check => destinationReport.checked.add(check));
    sourceReport.hinted.forEach(check => destinationReport.hinted.add(check));
    sourceReport.ignored.forEach(check => destinationReport.ignored.add(check));
}


/**
 * Adds reported values from one check report to another
 * @param {CheckReport} report 
 * @param {String} checkName
 * @returns {import("../checks/checkManager").CheckStatus} The status of the related check
 */
const addCheckToReport = (report, checkName) => {
    let status = CheckManager.getCheckStatus(checkName);
    if (status.exists) {
        report.exist.add(checkName);
        if (status.checked) {
            report.checked.add(checkName);
        } else if (status.ignored) {
            report.ignored.add(checkName);
        } else if (status.hint) {
            report.hinted.add(checkName);
        }
    }
    return status;
};
/** @type {SectionUpdateTreeNode | null} */
let updateTreeRoot = null;

const buildSectionUpdateTree = () => {
    /**
     * 
     * @param {String} sectionName 
     * @param {SectionUpdateTreeNode[]} parents 
     * @param {Set<String>} lineage 
     * @returns 
     */
    const buildSectionUpdateTreeNode = (sectionName, parents=[], lineage=new Set()) => {
        if(lineage.has(sectionName)){
            return null;
        }
        let sectionConfig = sectionConfigData.get(sectionName);

        if(!sectionConfig){
            console.warn(`Failed to find a configuration for "${sectionName}. Lineage: \n\t${[...lineage.values()].join("\n\t")}`);
            return null;
        }

        let listenerCleanUpCalls = new Set();

        let cleanUpListeners = () => {
            listenerCleanUpCalls.forEach(cleanUpCall => cleanUpCall())
        }

        /** @returns  */
        let buildCheckReport = () => {
            let checkReport = createNewCheckReport();
            /** @type {Map<string, import("../checks/checkManager").CheckStatus>} */
            let checks = new Map();
            node.checks.forEach(check => checks.set(check, addCheckToReport(checkReport, check)));
            node.children.forEach( child => addCheckReport(child.checkReport, checkReport));
            return {checkReport, checks};
        }

        let update = () => {
            /*\
            * @typedef Section
            * @prop {string} title
            * @prop {CheckReport} checkReport
            * @prop {Map<string, import("../checks/checkManager").CheckStatus>} checks
            * @prop {SectionType} type
            * @prop {SectionTheme} theme
            * @prop {String[] | null} children 
            */
            let checkValues;
            ({checkReport: node.checkReport, checks: checkValues} = buildCheckReport());
            parents.forEach(parent => parent.update());
            updateSectionStatus(sectionName, {checkReport: node.checkReport, checks: checkValues, children: [...node.children].map(child => child.sectionName)});
        }

        let remove = () => {
            cleanUpListeners();
            node.parents.forEach(parent => {parent.children.delete(node); parent.update();});
            let children = [...node.children.values()];
            children.forEach(child => {
                child.parents.delete(node);
                if(child.parents.size === 0){
                    child.remove();
                }
            });
        }   

        /** @type {SectionUpdateTreeNode} */
        let node = {
            sectionName,
            checks: new Set(),
            checkReport: createNewCheckReport(),
            type: sectionConfig.type,
            children: new Set(),
            parents: new Set(parents),
            shouldFlatten: false,
            remove,
            update,
        }
        

        let checkGroups = [];
        if(typeof sectionConfig.checkGroup == "string"){
            checkGroups.push(sectionConfig.checkGroup);
        }else if(sectionConfig.checkGroup){
            checkGroups = sectionConfig.checkGroup;
        }

        // Build a list of checks for the area
        for(const groupName of checkGroups){
            /** @type {String[]} */
            let checks = [...groups.get(groupName)?.checks.values() ?? []] 
            checks.forEach( check => node.checks.add(check));
        }

        // set up listeners on checks
        node.checks.forEach(checkName => {
            let subscribe = CheckManager.getSubscribeCallback(checkName);
            let cleanUpCall = subscribe(update);
            listenerCleanUpCalls.add(cleanUpCall);
        })

        // create children
        let childLineage = new Set([...lineage.values(), sectionName])
        sectionConfig.children?.forEach( childName => {
            let child = buildSectionUpdateTreeNode(childName, [node], childLineage);
            if(child){
                node.children.add(child);
            }
        })
        updateSectionStatus(sectionName, {title: sectionConfig.title, type: sectionConfig.type, theme: sectionConfig.theme, children: [...node.children].map(child => child.sectionName)})
        node.update();
        return node;
    }

    return buildSectionUpdateTreeNode("root");
}

const setConfiguration = () => {
    deleteAllSections();
    updateTreeRoot?.remove();
    const rawSectionConfigData = require("../../data/OOT/CategoryConfig.json");
    readSectionConfig(rawSectionConfigData);
    updateTreeRoot = buildSectionUpdateTree();
}

const SectionManager = {
    updateSectionStatus,
    deleteAllSections,
    deleteSection,
    getSectionStatus,
    getSubscriberCallback,
};

setConfiguration();

export default SectionManager;
