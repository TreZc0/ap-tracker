import _ from "lodash";

/**
 * @param {string} gameName
 * @param {import("../../services/checks/checkManager").CheckManager} checkManager
 * @param {Object.<string, string[]>} groups
 */
const buildGenericGame = (gameName, checkManager, groups) => {
    let unclassifiedLocations = checkManager.getAllExistingChecks();
    console.log(groups);
    /** @type {Object.<string, import("../../services/sections/groupManager").GroupData>} */
    const groupData = {
        all: {
            checks: [],
        },
        unclassified: {
            checks: [],
        },
    };

    /** @type {import("../../services/sections/sectionManager").SectionConfigData} */
    const categoryConfig = {
        categories: {
            root: {
                title: "Total",
                groupKey: null,
                theme: "default",
                children: [],
            },
        },
        options: {},
        themes: {
            default: { color: "#000000" },
            theme1: { color: "#FF0000" },
            theme2: { color: "#00AA00" },
            theme3: { color: "#0000FF" },
            theme4: { color: "#AAAA00" },
            theme5: { color: "#FF00FF" },
            theme6: { color: "#0000FF" },
        },
    };
    const themeNames = [
        "theme1",
        "theme2",
        "theme3",
        "theme4",
        "theme5",
        "theme6",
    ];

    const DEBUG_GROUP_CLASSIFICATION = false;
    /** @type {Map<string, Set<string>>} */
    let checkMembership = new Map();
    /** @type {Map<string, Set<string>>} */
    let groupSets = new Map();

    for (let groupName of Object.getOwnPropertyNames(groups)) {
        if (groupName === "Everywhere") {
            continue;
        }
        groupSets.set(groupName, new Set(groups[groupName]));
        let checks = groups[groupName];
        checks.forEach((check) => {
            unclassifiedLocations.delete(check);
            let membership = checkMembership.get(check) ?? new Set();
            membership.add(groupName);
            checkMembership.set(check, membership);
        });
    }

    /** @type {Set<string>} */
    const keyLocationGroups = new Set();
    /** @type {Map<string, Set<string>>} */
    const possibleParentGroups = new Map();
    /** @type {Map<string, Set<string>>} */
    const possibleChildGroups = new Map();
    /**
     *  @type {Map<string, Set<string>>}
     * Contains all groups that a group intersects with partially, but is not a subset or superset of
     */
    const groupOverlappingSets = new Map();
    /** @type {Set<string>} */
    const possibleMetaLocationGroups = new Set();

    // Go through all groups and determine how they relate to one another
    for (let [groupName, group] of groupSets.entries()) {
        let parentGroups = new Set();
        let childGroups = new Set();
        let overlappingGroups = new Set();
        for (let [otherGroupName, otherGroup] of groupSets.entries()) {
            if (otherGroupName === groupName) {
                continue;
            }
            if (group.isSubsetOf(otherGroup)) {
                // if both groups are equivalent, pick one to be the parent
                if (group.size === otherGroup.size) {
                    if (
                        groupName.length > otherGroupName.length ||
                        (groupName.length === otherGroupName.length &&
                            groupName > otherGroupName)
                    ) {
                        parentGroups.add(otherGroupName);
                    }
                } else {
                    parentGroups.add(otherGroupName);
                }
            }
            if (group.isSupersetOf(otherGroup)) {
                // if both groups are equivalent, pick one to be the child
                if (group.size === otherGroup.size) {
                    if (
                        groupName.length < otherGroupName.length ||
                        (groupName.length === otherGroupName.length &&
                            groupName < otherGroupName)
                    ) {
                        childGroups.add(otherGroupName);
                    }
                } else {
                    childGroups.add(otherGroupName);
                }
            }
            if (group.intersection(otherGroup).size > 0) {
                overlappingGroups.add(otherGroupName);
            }
        }
        overlappingGroups = overlappingGroups
            .difference(childGroups)
            .difference(parentGroups);
        let isKeyGroup = false;
        for (let check of group) {
            let membership = checkMembership.get(check) ?? new Set();
            if (
                membership.difference(parentGroups).difference(childGroups)
                    .size === 1
            ) {
                // does the check membership only contain this group, then this group must be a key group
                isKeyGroup = true;
                break;
            }
        }

        if (isKeyGroup) {
            if (DEBUG_GROUP_CLASSIFICATION) {
                console.log(`${groupName} may be a key group`);
            }
            keyLocationGroups.add(groupName);
        } else {
            if (DEBUG_GROUP_CLASSIFICATION) {
                console.log(`${groupName} may be a meta group`);
            }
            possibleMetaLocationGroups.add(groupName);
        }

        possibleParentGroups.set(groupName, parentGroups);
        possibleChildGroups.set(groupName, childGroups);
        groupOverlappingSets.set(groupName, overlappingGroups);
    }

    const metaLocationGroups = new Set();
    // Resolve edge cases where a key group may be completely made up of meta groups
    for (let groupName of possibleMetaLocationGroups) {
        // A meta group must also be a part of one key group in which it is not a complete subset of
        let isMeta = false;
        for (let otherGroupName of groupOverlappingSets.get(groupName) ??
            new Set()) {
            if (keyLocationGroups.has(otherGroupName)) {
                isMeta = true;
                break;
            }
        }
        if (isMeta) {
            metaLocationGroups.add(groupName);
            continue;
        }
    }
    possibleMetaLocationGroups
        .difference(metaLocationGroups)
        .forEach((groupName) => {
            keyLocationGroups.add(groupName);
            if (DEBUG_GROUP_CLASSIFICATION) {
                console.log(`${groupName} was converted to a key group`);
            }
        });

    // Resolve edge cases where a meta group may be identified as a key group if it contains a key group that is a complete subset of itself
    // This is done by computing overlaps with other groups and classifying the groups with the most conflicts as meta
    // A conflict between 2 groups cannot be solved easily, so we will not try to resolve those conflicts
    const computeKeyGroupConflicts = () => {
        /** @type {Map<string, Set<string>>} */
        const conflictGroups = new Map();
        for (let groupName of [...keyLocationGroups.values()]) {
            /** @type {Set<string>} */
            let localConflicts = new Set();
            for (let otherGroupName of keyLocationGroups) {
                if (groupOverlappingSets.get(groupName)?.has(otherGroupName)) {
                    localConflicts.add(otherGroupName);
                }
            }
            if (localConflicts.size > 0) {
                conflictGroups.set(groupName, localConflicts);
            }
        }
        if (DEBUG_GROUP_CLASSIFICATION) {
            console.log(conflictGroups);
        }
        return _.sortBy([...conflictGroups.entries()], ([_, y]) => -y.size);
    };

    let orderedConflicts = computeKeyGroupConflicts();
    console.log(orderedConflicts);
    while (orderedConflicts.length > 0) {
        let [groupName, conflicts] = orderedConflicts[0];
        if (conflicts.size <= 1) {
            if (DEBUG_GROUP_CLASSIFICATION) {
                console.log("Skipping remaining conflicts");
            }
            break;
        }

        keyLocationGroups.delete(groupName);
        metaLocationGroups.add(groupName);
        if (DEBUG_GROUP_CLASSIFICATION) {
            console.log(`Determined ${groupName} was not a key group`);
        }
        orderedConflicts = computeKeyGroupConflicts();
    }

    if (DEBUG_GROUP_CLASSIFICATION) {
        console.log("Classification Results:");
        console.log("Key Location Groups:", keyLocationGroups);
        console.log("Meta Location Groups:", metaLocationGroups);
    }

    // resolve parent/child relationships for key groups
    /** @type {Map<string, Set<string>>} */
    const finalGroups = new Map();
    groupSets.forEach((value, key) => finalGroups.set(key, value));
    /** @type {Map<string, Set<string>>} */
    const locationGroupToFinalGroups = new Map();
    groupSets.forEach((value, key) =>
        locationGroupToFinalGroups.set(key, new Set([key]))
    );

    const DEBUG_PARENT_GROUP_ORGANIZATION = false;
    /** @type {Map<string, Set<string>>} */
    const childTable = new Map();
    /** @type {Set<string>} */
    const roots = new Set();
    for (let groupName of keyLocationGroups) {
        let possibleParents = (
            possibleParentGroups.get(groupName) ?? new Set()
        ).difference(metaLocationGroups);
        if (possibleParents.size === 0) {
            roots.add(groupName);
            if (DEBUG_PARENT_GROUP_ORGANIZATION) {
                console.log(`Added ${groupName} to root`);
            }
        } else {
            let parent = _.sortBy(
                [...possibleParents.values()],
                (x) => groupSets.get(x)?.size ?? Infinity
            )[0];
            let siblings = childTable.get(parent) ?? new Set();
            siblings.add(groupName);
            childTable.set(parent, siblings);
            // remove checks from parent
            finalGroups.set(
                parent,
                finalGroups.get(parent).difference(finalGroups.get(groupName))
            );
            if (DEBUG_PARENT_GROUP_ORGANIZATION) {
                console.log(`Added ${groupName} as a child of ${parent}`);
            }
        }
    }

    if (DEBUG_PARENT_GROUP_ORGANIZATION) {
        console.log("Parenting results: ", childTable);
    }

    // same for meta groups for now, will make it better later
    if (metaLocationGroups.size > 0) {
        for (let groupName of metaLocationGroups) {
            let possibleParents = (
                possibleParentGroups.get(groupName) ?? new Set()
            ).difference(keyLocationGroups);
            if (possibleParents.size === 0) {
                roots.add(groupName);
                if (DEBUG_PARENT_GROUP_ORGANIZATION) {
                    console.log(`Added ${groupName} to root`);
                }
            } else {
                let parent = _.sortBy(
                    [...possibleParents.values()],
                    (x) => groupSets.get(x)?.size ?? Infinity
                )[0];
                let siblings = childTable.get(parent) ?? new Set();
                siblings.add(groupName);
                childTable.set(parent, siblings);
                // remove checks from parent
                finalGroups.set(
                    parent,
                    finalGroups
                        .get(parent)
                        .difference(finalGroups.get(groupName))
                );
                if (DEBUG_PARENT_GROUP_ORGANIZATION) {
                    console.log(`Added ${groupName} as a child of ${parent}`);
                }
            }
        }
    }

    // build group tree
    for (let [groupName, checks] of finalGroups.entries()) {
        groupData[groupName] = {
            checks: [...checks.values()],
        };
    }

    // build category tree
    const getChildList = (parentName) => {
        let children = childTable.get(parentName) ?? new Set();
        let childList = [];
        children.forEach((childName) => {
            let allNames = locationGroupToFinalGroups.get(childName);
            allNames.forEach((x) => childList.push(x));
        });
        return childList;
    };

    // place nodes in tree
    let themeCounter = 0;
    for (let groupName of keyLocationGroups.union(metaLocationGroups)) {
        categoryConfig.categories[groupName] = {
            title: groupName,
            theme: keyLocationGroups.has(groupName)
                ? themeNames[themeCounter++ % themeNames.length]
                : "default",
            children: getChildList(groupName),
            groupKey: groupName,
        };
        if (roots.has(groupName)) {
            categoryConfig.categories.root.children.push(groupName);
        }
    }

    // sort the root
    categoryConfig.categories.root.children = _.sortBy(
        categoryConfig.categories.root.children,
        [(x) => !keyLocationGroups.has(x), (x) => x]
    );

    if (unclassifiedLocations.size > 0) {
        groupData["unclassified"] = {
            checks: [...unclassifiedLocations.values()],
        };
        categoryConfig.categories["unclassified"] = {
            title: "Unclassified Checks",
            groupKey: "unclassified",
            theme: "default",
            children: null,
        };
        categoryConfig.categories.root.children.push("unclassified");
    }
    //

    /** @type {import("../TrackerBuilder").GameBuilder} */
    const buildTracker = (
        checkManager,
        entranceManager,
        groupManager,
        sectionManager,
        slotData
    ) => {
        // configure groups and sections
        groupManager.loadGroups(groupData);
        sectionManager.setConfiguration(categoryConfig);
    };

    return {
        title: gameName,
        abbreviation: gameName,
        buildTracker,
    };
};

export { buildGenericGame };
