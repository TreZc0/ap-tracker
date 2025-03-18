import { CheckManager, CheckStatus } from "../checks/checkManager";
import { EntranceManager } from "../entrances/entranceManager";
import { CounterMode } from "../tags/tagManager";
import { GroupManager } from "./groupManager";

interface CheckReport {
    exist: Set<string>;
    checked: Set<string>;
    ignored: Set<string>;
    tagCounts: Map<string, Set<string>>;
    tagTotals: Map<string, Set<string>>;
}

const createNewCheckReport = (): CheckReport => {
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
 * @param sourceReport
 * @param destinationReport
 */
const addCheckReport = (sourceReport: CheckReport, destinationReport: CheckReport) => {
    sourceReport.exist.forEach((check) => destinationReport.exist.add(check));
    sourceReport.checked.forEach((check) =>
        destinationReport.checked.add(check)
    );
    sourceReport.ignored.forEach((check) =>
        destinationReport.ignored.add(check)
    );
    sourceReport.tagCounts.forEach((sourceCounter, counterName) => {
        const destinationCounter =
            destinationReport.tagCounts.get(counterName) ?? new Set();
        sourceCounter.forEach((check) => destinationCounter.add(check));
        destinationReport.tagCounts.set(counterName, destinationCounter);
    });
    sourceReport.tagTotals.forEach((sourceCounter, counterName) => {
        const destinationCounter =
            destinationReport.tagTotals.get(counterName) ?? new Set();
        sourceCounter.forEach((check) => destinationCounter.add(check));
        destinationReport.tagTotals.set(counterName, destinationCounter);
    });
};

const defaultTheme = {
    color: "black",
};

const defaultSectionStatus: Section = {
    title: "No Title",
    checks: new Map(),
    checkReport: createNewCheckReport(),
    theme: defaultTheme,
    children: null,
};

const sectionDefaults = {
    title: "Untitled Section",
    groupKey: null,
    type: null,
    theme: "default",
    children: null,
};

const themeDefaults = {
    color: "black",
};


interface SectionDef {
    title: string;
    type?: null;
    groupKey: string | null;
    theme: string;
    children: string[] | null;
}

interface SectionConfig {
    title: string;
    groupKey: string | string[] | null;
    theme: SectionTheme;
    children: string[] | null;
}

interface SectionConfigData {
    categories: {[categoryKey: string]: SectionDef};
    options: unknown;
    themes: {[themeKey: string]: SectionThemeDef};
}

interface Section {
    title: string;
    checkReport: CheckReport;
    checks: Map<string, CheckStatus>;
    portals?: unknown;
    theme: SectionTheme;
    children: string[] | null;
}

interface SectionUpdate {
    title?: string;
    checkReport?: CheckReport;
    checks?: Map<string, CheckStatus>;
    portals?: unknown;
    theme?: SectionTheme;
    children?: string[] | null;
}

interface SectionThemeDef {
    color: string;
}

interface SectionTheme {
    color: string;
}

interface SectionUpdateTreeNode {
    sectionName: string;
    checks: Set<string>;
    checkReport: CheckReport;
    shouldFlatten: boolean;
    children: Set<SectionUpdateTreeNode>;
    parents: Set<SectionUpdateTreeNode>;
    remove: () => void;
    update: () => void;
}

interface SectionManager {
    updateSectionStatus: (sectionName: string, section: SectionUpdate) => void;
    setConfiguration: (configData: SectionConfigData) => void;
    deleteAllSections: () => void;
    deleteSection: (sectionName: string) => void;
    getSectionStatus: (sectionName: string) => Section | null;
    getSubscriberCallback: (sectionName: string) => (listener: () => void) => () => void;
}


const createSectionManager = (checkManager: CheckManager, entranceManager: EntranceManager, groupManager: GroupManager): SectionManager => {
    const sectionData: Map<string, Section> = new Map();
    const sectionConfigData: Map<string, SectionConfig> = new Map();
    const sectionSubscribers: Map<string, Set<() => void>> = new Map();
    let updateTreeRoot: SectionUpdateTreeNode | null = null;
    const groups = groupManager.groups;

    const deleteSection = (sectionName: string) => {
        sectionData.delete(sectionName);
        sectionSubscribers.get(sectionName)?.forEach((listener) => listener());
    };

    const deleteAllSections = () => {
        const names = [...sectionData.keys()];
        names.map((name) => deleteSection(name));
    };

    const updateSectionStatus = (sectionName: string, section: SectionUpdate) => {
        sectionData.set(sectionName, {
            ...(sectionData.get(sectionName) ?? defaultSectionStatus),
            ...section,
        });
        sectionSubscribers.get(sectionName)?.forEach((listener) => listener());
    };

    const getSubscriberCallback = (sectionName: string) => {
        return (listener: () => void) => {
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

    const getSectionStatus = (sectionName: string) =>
        sectionData.get(sectionName) ?? null;
    // Builds a tree from the section config data that can be compiled into hard categories with options and state
    const readSectionConfig = (configData: SectionConfigData) => {
        const sectionThemes: Map<string, SectionTheme> = new Map();

        /**
         * Doesn't do much at the moment, reads types into section types
         * @param name
         * @param theme
         */
        const readTheme = (name: string, theme: SectionThemeDef) => {
            const fullTheme = {
                ...themeDefaults,
                ...theme,
            };
            sectionThemes.set(name, fullTheme);
        };

        /**
         * Assemble the categories
         * @param categoryName
         * @param parents
         */
        const readCategory = (categoryName: string, parents: Set<string> = new Set()) => {
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
            const category: SectionDef = {
                ...sectionDefaults,
                ...configData.categories[categoryName],
            };
            const result: SectionConfig = {
                title: category.title,
                children: [],
                groupKey: category.groupKey,
                theme: defaultTheme,
            };

            if (category.theme) {
                const theme = sectionThemes.get(category.theme);
                if (!theme) {
                    console.warn(
                        `Failed to find theme ${category.theme} for ${category.title}, using default theme`
                    );
                } else {
                    result.theme = theme;
                }
            }

            if (category.children) {
                const parentage = new Set(parents);
                parentage.add(categoryName);
                for (const childName of category.children) {
                    readCategory(childName, parentage);
                    result.children?.push(childName);
                }
            }
            sectionConfigData.set(categoryName, result);
            return result;
        };

        if (configData.themes) {
            for (const themeName of Object.keys(configData.themes)) {
                readTheme(themeName, configData.themes[themeName]);
            }
        } else {
            console.warn("No 'themes' property found in configuration data");
        }

        readCategory("root");
    };

    /**
     * Adds reported values from one check report to another
     * @param report
     * @param checkName
     * @returns The status of the related check
     */
    const addCheckToReport = (report: CheckReport, checkName: string): CheckStatus => {
        const status = checkManager.getCheckStatus(checkName);
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
                    const counterTotal =
                        report.tagTotals.get(counter.id) ?? new Set();
                    const counterCount =
                        report.tagCounts.get(counter.id) ?? new Set();
                    counterTotal.add(checkName);

                    switch (counter.countMode) {
                        case CounterMode.countChecked: {
                            if (status.checked || status.ignored) {
                                counterCount.add(checkName);
                            }
                            break;
                        }
                        case CounterMode.countUnchecked: {
                            if (!status.checked && !status.ignored) {
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
            portalName: string,
            parents: SectionUpdateTreeNode[] = [],
            lineage: Set<string> = new Set()
        ) => {
            if (lineage.has(portalName)) {
                return null;
            }

            const listenerCleanUpCalls: Set<()=>void> = new Set();

            const cleanUpListeners = () => {
                listenerCleanUpCalls.forEach((cleanUpCall) => cleanUpCall());
            };

            const buildCheckReport = () => {
                const checkReport = createNewCheckReport();
                /** @type {Map<string, import("../checks/checkManager").CheckStatus>} */
                const checks: Map<string, import("../checks/checkManager").CheckStatus> = new Map();
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
                let checkGroups: string[] = [];
                if (typeof groupKey == "string") {
                    checkGroups.push(groupKey);
                } else if (groupKey) {
                    checkGroups = groupKey;
                }
                // Build a list of checks for the area
                for (const groupName of checkGroups) {
                    /** @type {string[]} */
                    const checks: string[] = [
                        ...(groups.get(groupName)?.checks.values() ?? []),
                    ];
                    checks.forEach((check) => node.checks.add(check));
                }
            };

            const setCheckListeners = () => {
                node.checks.forEach((checkName) => {
                    const subscribe =
                        checkManager.getSubscriberCallback(checkName);
                    const cleanUpCall = subscribe(update);
                    listenerCleanUpCalls.add(cleanUpCall);
                });
            };

            const setEntranceListener = () => {
                const subscribe =
                    entranceManager.getEntranceSubscriber(portalName);
                const cleanUpCall = subscribe(update);
                listenerCleanUpCalls.add(cleanUpCall);
            };

            const update = () => {
                groupKey = null;
                // groupManager.getGroupWithRegion(
                //     entranceManager.getEntranceDestRegion(portalName)
                // ) ?? null;
                if (groupKey !== processedAreaKey) {
                    processedAreaKey = groupKey;
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
                    title: `${portalName} => ${groupKey ?? "???"}`,
                    checkReport: node.checkReport,
                    checks: checkValues,
                    children: [...node.children].map(
                        (child) => child.sectionName
                    ),
                });
            };

            const remove = () => {
                cleanUpListeners();
                node.parents.forEach((parent) => {
                    parent.children.delete(node);
                    parent.update();
                });
                const children = [...node.children.values()];
                children.forEach((child) => {
                    child.parents.delete(node);
                    if (child.parents.size === 0) {
                        child.remove();
                    }
                });
            };

            let groupKey = null;
            // groupManager.getGroupWithRegion(
            //     entranceManager.getEntranceDestRegion(portalName)
            // ) ?? null;
            let processedAreaKey = null;

            /** @type {SectionUpdateTreeNode} */
            const node: SectionUpdateTreeNode = {
                sectionName: portalName,
                checks: new Set(),
                checkReport: createNewCheckReport(),
                children: new Set(),
                parents: new Set(parents),
                shouldFlatten: false,
                remove,
                update,
            };

            updateSectionStatus(portalName, {
                title: `${portalName} => ${groupKey ?? "???"}`,
                theme: defaultTheme,
                children: [...node.children].map((child) => child.sectionName),
            });
            setEntranceListener();
            update();
            return node;
        };
        /**
         *
         * @param {string} sectionName
         * @param {SectionUpdateTreeNode[]} parents
         * @param {Set<string>} lineage
         * @returns
         */
        const buildSectionUpdateTreeNode = (
            sectionName: string,
            parents: SectionUpdateTreeNode[] = [],
            lineage: Set<string> = new Set()
        ) => {
            if (lineage.has(sectionName)) {
                return null;
            }
            const sectionConfig = sectionConfigData.get(sectionName);

            if (!sectionConfig) {
                console.warn(
                    `Failed to find a configuration for "${sectionName}. Lineage: \n\t${[
                        ...lineage.values(),
                    ].join("\n\t")}`
                );
                return null;
            }

            const listenerCleanUpCalls: Set<()=>void> = new Set();

            const cleanUpListeners = () => {
                listenerCleanUpCalls.forEach((cleanUpCall) => cleanUpCall());
            };

            const buildCheckReport = () => {
                const checkReport = createNewCheckReport();
                const checks: Map<string, CheckStatus> = new Map();
                node.checks.forEach((check) =>
                    checks.set(check, addCheckToReport(checkReport, check))
                );
                node.children.forEach((child) =>
                    addCheckReport(child.checkReport, checkReport)
                );
                return { checkReport, checks };
            };

            const update = () => {
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

            const remove = () => {
                cleanUpListeners();
                node.parents.forEach((parent) => {
                    parent.children.delete(node);
                    parent.update();
                });
                const children = [...node.children.values()];
                children.forEach((child) => {
                    child.parents.delete(node);
                    if (child.parents.size === 0) {
                        child.remove();
                    }
                });
            };

            const node: SectionUpdateTreeNode = {
                sectionName,
                checks: new Set(),
                checkReport: createNewCheckReport(),
                children: new Set(),
                parents: new Set(parents),
                shouldFlatten: false,
                remove,
                update,
            };

            let checkGroups = [];
            if (typeof sectionConfig.groupKey == "string") {
                checkGroups.push(sectionConfig.groupKey);
            } else if (sectionConfig.groupKey) {
                checkGroups = sectionConfig.groupKey;
            }

            // Build a list of checks for the area
            for (const groupName of checkGroups) {
                const checks: string[] = [
                    ...(groups.get(groupName)?.checks.values() ?? []),
                ];
                checks.forEach((check) => node.checks.add(check));
            }

            // set up listeners on checks
            node.checks.forEach((checkName) => {
                const subscribe = checkManager.getSubscriberCallback(checkName);
                const cleanUpCall = subscribe(update);
                listenerCleanUpCalls.add(cleanUpCall);
            });

            // create children
            const childLineage = new Set([...lineage.values(), sectionName]);
            sectionConfig.children?.forEach((childName) => {
                const child = buildSectionUpdateTreeNode(
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
                        const child = buildPortalNode(exit, [node], childLineage);
                        if (child) {
                            node.children.add(child);
                        }
                    });
                }
            }
            updateSectionStatus(sectionName, {
                title: sectionConfig.title,
                theme: sectionConfig.theme,
                children: [...node.children].map((child) => child.sectionName),
            });
            node.update();
            return node;
        };

        return buildSectionUpdateTreeNode("root");
    };

    const setConfiguration = (rawSectionConfigData: SectionConfigData) => {
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
export type {Section, SectionConfigData, SectionManager, SectionTheme, SectionThemeDef}
