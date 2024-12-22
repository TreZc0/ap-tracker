// @ts-check

import { CounterMode } from "../tags/tagManager";

/**
 * @typedef CheckReport
 * @prop {Set<String>} exist
 * @prop {Set<String>} checked
 * @prop {Set<String>} ignored
 * @prop {Map<String, Set<String>>} tagCounts
 * @prop {Map<String, Set<String>>} tagTotals
 */

/** @returns {CheckReport} */
const createNewCheckReport = () => {
    return {
        exist: new Set(),
        checked: new Set(),
        ignored: new Set(),
        tagCounts: new Map(),
        tagTotals: new Map(),
    };
};

/**
 * Adds reported values from one check report to another
 * @param {CheckReport} sourceReport
 * @param {CheckReport} destinationReport
 */
const addCheckReport = (sourceReport, destinationReport) => {
    sourceReport.exist.forEach((check) => destinationReport.exist.add(check));
    sourceReport.checked.forEach((check) =>
        destinationReport.checked.add(check)
    );
    sourceReport.ignored.forEach((check) =>
        destinationReport.ignored.add(check)
    );
    sourceReport.tagCounts.forEach((sourceCounter, counterName) => {
        let destinationCounter =
            destinationReport.tagCounts.get(counterName) ?? new Set();
        sourceCounter.forEach((check) => destinationCounter.add(check));
        destinationReport.tagCounts.set(counterName, destinationCounter);
    });
    sourceReport.tagTotals.forEach((sourceCounter, counterName) => {
        let destinationCounter =
            destinationReport.tagCounts.get(counterName) ?? new Set();
        sourceCounter.forEach((check) => destinationCounter.add(check));
        destinationReport.tagTotals.set(counterName, destinationCounter);
    });
};

/** @type {SectionType} */
const defaultType = {
    show_when: true,
    type: "standard",
    flatten_when: false,
    show_entry_when: false,
    portal_categories: null,
};

const defaultTheme = {
    color: "black",
};

/** @type {Section} */
const defaultSectionStatus = {
    title: "No Title",
    checks: new Map(),
    checkReport: createNewCheckReport(),
    theme: defaultTheme,
    type: defaultType,
    children: null,
};

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
    er: {
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
    },
};

const sectionDefaults = {
    title: "Untitled Section",
    areaKey: null,
    type: null,
    theme: "default",
    children: null,
};

const typeDefaults = {
    show_when: true,
    type: "standard",
    flatten_when: false,
    show_entry_when: false,
    portal_categories: null,
};

const themeDefaults = {
    color: "black",
};

/**
 * Enum for how portals are displayed on a section
 * @readonly
 * @enum {number}
 */
const PORTAL_MODE = {
    None: 0,
    Editable: 1,
    ReadOnly: 2,
};

/**
 * @typedef SectionTypeDef
 * @prop {boolean | SectionCondition} show_when
 * @prop {"entrance_pool" | "portal" | "standard" | string} type
 * @prop {boolean | SectionCondition} [flatten_when]
 * @prop {boolean | SectionCondition} [show_entry_when]
 * @prop {string[] | null} [portal_categories]
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
 * @prop {string | null} areaKey
 * @prop {string | null} type
 * @prop {string} theme
 * @prop {string[] | null} children
 */

/**
 * @typedef SectionConfig
 * @prop {string} title
 * @prop {string | string[] | null} areaKey
 * @prop {SectionType} type
 * @prop {SectionTheme} theme
 * @prop {String[] | null} children
 */

/**
 * @typedef SectionConfigData
 * @prop {Object.<String, SectionDef>} categories
 * @prop {*} options
 * @prop {Object.<string, SectionTypeDef>} types
 * @prop {Object.<string, SectionThemeDef>} themes
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
    if (typeof condition === "boolean") {
        return condition;
    }
    if (condition.not) {
        return !evaluateCondition(condition.not, context);
    }
    let result = false;
    if (condition.state) {
        let path = condition.state.split(".");
        let value = path.reduce((state, part) => state[part] ?? {}, context);
        result = value === condition.is;
    }
    if (condition.or) {
        result ||= evaluateCondition(condition.or, context);
    }
    if (condition.and) {
        result &&= evaluateCondition(condition.and, context);
    }

    return result;
};

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

/**
 * @typedef SectionManager
 * @prop {(sectionName: string, section: any) => void} updateSectionStatus
 * @prop {(configData: SectionConfigData) => void} setConfiguration
 * @prop {() => void} deleteAllSections
 * @prop {(sectionName: string) => void} deleteSection
 * @prop {(sectionName: string) => Section | null} getSectionStatus
 * @prop {(sectionName: string) => (listener: () => void) => () => void} getSubscriberCallback
 */

/**
 *
 * @param {import("../checks/checkManager").CheckManager} checkManager
 * @param {import("../entrances/entranceManager").EntranceManager} entranceManager
 * @param {import("./groupManager").GroupManager} groupManager
 * @returns {SectionManager}
 */
const createSectionManager = (checkManager, entranceManager, groupManager) => {
    /** @type {Map<String, Section>} */
    const sectionData = new Map();
    /** @type {Map<String, SectionConfig>} */
    const sectionConfigData = new Map();
    /** @type {Map<String, Set<()=>void>>} */
    const sectionSubscribers = new Map();
    /** @type {SectionUpdateTreeNode | null} */
    let updateTreeRoot = null;
    const groups = groupManager.groups;
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

    /**
     *
     * @param {string} sectionName
     * @param {*} section
     */
    const updateSectionStatus = (sectionName, section) => {
        sectionData.set(sectionName, {
            ...(sectionData.get(sectionName) ?? defaultSectionStatus),
            ...section,
        });
        sectionSubscribers.get(sectionName)?.forEach((listener) => listener());
    };

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
                if (!sectionSubscribers.get(sectionName)?.size) {
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
    const getSectionStatus = (sectionName) =>
        sectionData.get(sectionName) ?? null;
    // Builds a tree from the section config data that can be compiled into hard categories with options and state
    /**
     *
     * @param {SectionConfigData} configData
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
                ...type,
            };
            if (
                !new Set(["standard", "entrance_pool", "portal"]).has(
                    fullType.type
                )
            ) {
                throw new Error(`Failed to understand type: ${fullType.type}`);
            }
            // @ts-ignore Due to how JSON is loaded, the union type must allow strings
            // this function doesn't like that idea, hence the above check and the ts-ignore
            sectionTypes.set(name, fullType);
        };

        /**
         * Doesn't do much at the moment, reads types into section types
         * @param {string} name
         * @param {SectionThemeDef} theme
         */
        const readTheme = (name, theme) => {
            const fullTheme = {
                ...themeDefaults,
                ...theme,
            };
            sectionThemes.set(name, fullTheme);
        };

        /**
         * Assemble the categories
         * @param {string} categoryName
         * @param {Set<string>} parents
         */
        const readCategory = (categoryName, parents = new Set()) => {
            if (parents.has(categoryName)) {
                console.warn(
                    `Circular dependency detected, ${categoryName} had a descendant that was itself. Parents: \n${[
                        ...parents.values(),
                    ].join("\n")}`
                );
                return null;
            }
            if (!configData.categories[categoryName]) {
                console.warn(`Failed to find category ${categoryName}`);
                return null;
            }
            /** @type {SectionDef} */
            const category = {
                ...sectionDefaults,
                ...configData.categories[categoryName],
            };
            /** @type {SectionConfig} */
            let result = {
                title: category.title,
                children: [],
                areaKey: category.areaKey,
                theme: defaultTheme,
                type: defaultType,
            };

            if (category.type) {
                let type = sectionTypes.get(category.type);
                if (!type) {
                    throw new Error(
                        `Failed to find type ${category.type} for ${category.title}`
                    );
                }
                result.type = type;
            }

            if (category.theme) {
                let theme = sectionThemes.get(category.theme);
                if (!theme) {
                    console.warn(
                        `Failed to find theme ${category.theme} for ${category.title}, using default theme`
                    );
                } else {
                    result.theme = theme;
                }
            }

            if (category.children) {
                let parentage = new Set(parents);
                parentage.add(categoryName);
                for (let childName of category.children) {
                    readCategory(childName, parentage);
                    result.children?.push(childName);
                }
            }
            sectionConfigData.set(categoryName, result);
            return result;
        };

        if (configData.types) {
            for (let typeName of Object.keys(configData.types)) {
                readType(typeName, configData.types[typeName]);
            }
        } else {
            console.warn("No 'types' property found in configuration data");
        }

        if (configData.themes) {
            for (let themeName of Object.keys(configData.themes)) {
                readTheme(themeName, configData.themes[themeName]);
            }
        } else {
            console.warn("No 'themes' property found in configuration data");
        }

        readCategory("root");
    };

    /**
     * Adds reported values from one check report to another
     * @param {CheckReport} report
     * @param {String} checkName
     * @returns {import("../checks/checkManager").CheckStatus} The status of the related check
     */
    const addCheckToReport = (report, checkName) => {
        let status = checkManager.getCheckStatus(checkName);
        if (status.exists) {
            report.exist.add(checkName);
            if (status.checked) {
                report.checked.add(checkName);
            } else if (status.ignored) {
                report.ignored.add(checkName);
            }

            status.tags.forEach((tag) => {
                const counter = tag.counter;
                if (counter) {
                    let counterTotal =
                        report.tagTotals.get(counter.id) ?? new Set();
                    let counterCount =
                        report.tagCounts.get(counter.id) ?? new Set();
                    counterTotal.add(checkName);

                    switch (counter.countMode) {
                        case CounterMode.countChecked: {
                            if (status.checked) {
                                counterCount.add(checkName);
                            }
                            break;
                        }
                        case CounterMode.countUnchecked: {
                            if (!status.checked) {
                                counterCount.add(checkName);
                            }
                            break;
                        }
                        default: {
                            counterCount.add(checkName);
                            break;
                        }
                    }
                    report.tagTotals.set(counter.id, counterTotal);
                    report.tagCounts.set(counter.id, counterCount);
                }
            });
        }
        return status;
    };

    const buildSectionUpdateTree = () => {
        const buildPortalNode = (
            portalName,
            parents = [],
            lineage = new Set()
        ) => {
            if (lineage.has(portalName)) {
                return null;
            }

            const listenerCleanUpCalls = new Set();

            const cleanUpListeners = () => {
                listenerCleanUpCalls.forEach((cleanUpCall) => cleanUpCall());
            };

            /** @returns  */
            const buildCheckReport = () => {
                let checkReport = createNewCheckReport();
                /** @type {Map<string, import("../checks/checkManager").CheckStatus>} */
                let checks = new Map();
                node.checks.forEach((check) =>
                    checks.set(check, addCheckToReport(checkReport, check))
                );
                node.children.forEach((child) =>
                    addCheckReport(child.checkReport, checkReport)
                );
                return { checkReport, checks };
            };

            const setChecks = () => {
                node.checks.clear();
                let checkGroups = [];
                if (typeof areaKey == "string") {
                    checkGroups.push(areaKey);
                } else if (areaKey) {
                    checkGroups = areaKey;
                }
                // Build a list of checks for the area
                for (const groupName of checkGroups) {
                    /** @type {String[]} */
                    let checks = [
                        ...(groups.get(groupName)?.checks.values() ?? []),
                    ];
                    checks.forEach((check) => node.checks.add(check));
                }
            };

            const setCheckListeners = () => {
                node.checks.forEach((checkName) => {
                    let subscribe =
                        checkManager.getSubscriberCallback(checkName);
                    let cleanUpCall = subscribe(update);
                    listenerCleanUpCalls.add(cleanUpCall);
                });
            };

            const setEntranceListener = () => {
                let subscribe =
                    entranceManager.getEntranceSubscriber(portalName);
                let cleanUpCall = subscribe(update);
                listenerCleanUpCalls.add(cleanUpCall);
            };

            const update = () => {
                /*\
                 * @typedef Section
                 * @prop {string} title
                 * @prop {CheckReport} checkReport
                 * @prop {Map<string, import("../checks/checkManager").CheckStatus>} checks
                 * @prop {SectionType} type
                 * @prop {SectionTheme} theme
                 * @prop {String[] | null} children
                 */
                areaKey =
                    groupManager.getGroupWithRegion(
                        entranceManager.getEntranceDestRegion(portalName)
                    ) ?? null;
                if (areaKey !== processedAreaKey) {
                    processedAreaKey = areaKey;
                    cleanUpListeners();
                    if (entranceManager.getEntranceAdoptability(portalName)) {
                        setChecks();
                        setCheckListeners();
                    }
                    setEntranceListener();
                }
                let checkValues;
                ({ checkReport: node.checkReport, checks: checkValues } =
                    buildCheckReport());
                parents.forEach((parent) => parent.update());
                updateSectionStatus(portalName, {
                    title: `${portalName} => ${areaKey ?? "???"}`,
                    checkReport: node.checkReport,
                    checks: checkValues,
                    children: [...node.children].map(
                        (child) => child.sectionName
                    ),
                });
            };

            let remove = () => {
                cleanUpListeners();
                node.parents.forEach((parent) => {
                    parent.children.delete(node);
                    parent.update();
                });
                let children = [...node.children.values()];
                children.forEach((child) => {
                    child.parents.delete(node);
                    if (child.parents.size === 0) {
                        child.remove();
                    }
                });
            };

            let areaKey =
                groupManager.getGroupWithRegion(
                    entranceManager.getEntranceDestRegion(portalName)
                ) ?? null;
            let processedAreaKey = null;

            /** @type {SectionUpdateTreeNode} */
            const node = {
                sectionName: portalName,
                checks: new Set(),
                checkReport: createNewCheckReport(),
                type: defaultType,
                children: new Set(),
                parents: new Set(parents),
                shouldFlatten: false,
                remove,
                update,
            };

            updateSectionStatus(portalName, {
                title: `${portalName} => ${areaKey ?? "???"}`,
                type: defaultType,
                theme: defaultTheme,
                children: [...node.children].map((child) => child.sectionName),
            });
            setEntranceListener();
            update();
            return node;
        };
        /**
         *
         * @param {String} sectionName
         * @param {SectionUpdateTreeNode[]} parents
         * @param {Set<String>} lineage
         * @returns
         */
        const buildSectionUpdateTreeNode = (
            sectionName,
            parents = [],
            lineage = new Set()
        ) => {
            if (lineage.has(sectionName)) {
                return null;
            }
            let sectionConfig = sectionConfigData.get(sectionName);

            if (!sectionConfig) {
                console.warn(
                    `Failed to find a configuration for "${sectionName}. Lineage: \n\t${[
                        ...lineage.values(),
                    ].join("\n\t")}`
                );
                return null;
            }

            let listenerCleanUpCalls = new Set();

            let cleanUpListeners = () => {
                listenerCleanUpCalls.forEach((cleanUpCall) => cleanUpCall());
            };

            /** @returns  */
            let buildCheckReport = () => {
                let checkReport = createNewCheckReport();
                /** @type {Map<string, import("../checks/checkManager").CheckStatus>} */
                let checks = new Map();
                node.checks.forEach((check) =>
                    checks.set(check, addCheckToReport(checkReport, check))
                );
                node.children.forEach((child) =>
                    addCheckReport(child.checkReport, checkReport)
                );
                return { checkReport, checks };
            };

            let update = () => {
                /**
                 * @typedef Section
                 * @prop {string} title
                 * @prop {CheckReport} checkReport
                 * @prop {Map<string, import("../checks/checkManager").CheckStatus>} checks
                 * @prop {SectionType} type
                 * @prop {SectionTheme} theme
                 * @prop {String[] | null} children
                 */
                let checkValues;
                ({ checkReport: node.checkReport, checks: checkValues } =
                    buildCheckReport());
                parents.forEach((parent) => parent.update());
                updateSectionStatus(sectionName, {
                    checkReport: node.checkReport,
                    checks: checkValues,
                    children: [...node.children].map(
                        (child) => child.sectionName
                    ),
                });
            };

            let remove = () => {
                cleanUpListeners();
                node.parents.forEach((parent) => {
                    parent.children.delete(node);
                    parent.update();
                });
                let children = [...node.children.values()];
                children.forEach((child) => {
                    child.parents.delete(node);
                    if (child.parents.size === 0) {
                        child.remove();
                    }
                });
            };

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
            };

            let checkGroups = [];
            if (typeof sectionConfig.areaKey == "string") {
                checkGroups.push(sectionConfig.areaKey);
            } else if (sectionConfig.areaKey) {
                checkGroups = sectionConfig.areaKey;
            }

            // Build a list of checks for the area
            for (const groupName of checkGroups) {
                /** @type {String[]} */
                let checks = [
                    ...(groups.get(groupName)?.checks.values() ?? []),
                ];
                checks.forEach((check) => node.checks.add(check));
            }

            // set up listeners on checks
            node.checks.forEach((checkName) => {
                let subscribe = checkManager.getSubscriberCallback(checkName);
                let cleanUpCall = subscribe(update);
                listenerCleanUpCalls.add(cleanUpCall);
            });

            // create children
            let childLineage = new Set([...lineage.values(), sectionName]);
            sectionConfig.children?.forEach((childName) => {
                let child = buildSectionUpdateTreeNode(
                    childName,
                    [node],
                    childLineage
                );
                if (child) {
                    node.children.add(child);
                }
            });

            // create entrances
            for (const groupName of checkGroups) {
                const group = groups.get(groupName);
                if (group) {
                    group.exits.forEach((exit) => {
                        let child = buildPortalNode(exit, [node], childLineage);
                        if (child) {
                            node.children.add(child);
                        }
                    });
                }
            }
            updateSectionStatus(sectionName, {
                title: sectionConfig.title,
                type: sectionConfig.type,
                theme: sectionConfig.theme,
                children: [...node.children].map((child) => child.sectionName),
            });
            node.update();
            return node;
        };

        return buildSectionUpdateTreeNode("root");
    };

    /**
     *
     * @param {SectionConfigData} rawSectionConfigData
     */
    const setConfiguration = (rawSectionConfigData) => {
        deleteAllSections();
        updateTreeRoot?.remove();
        readSectionConfig(rawSectionConfigData);
        updateTreeRoot = buildSectionUpdateTree();
    };

    const SectionManager = {
        updateSectionStatus,
        deleteAllSections,
        deleteSection,
        getSectionStatus,
        getSubscriberCallback,
        setConfiguration,
    };

    return SectionManager;
};

export { createSectionManager };
