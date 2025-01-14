// @ts-check

/**
 * @param {string} gameName
 * @param {import("../../services/checks/checkManager").CheckManager} checkManager
 * @param {Object.<string, string[]>} groups
 */
const buildGenericGame = (gameName, checkManager, groups) => {
    let unclassifiedLocations = checkManager.getAllExistingChecks();
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
        },
    };

    for (let groupName of Object.getOwnPropertyNames(groups)) {
        if (groupName === "Everywhere") {
            continue;
        }
        let checks = groups[groupName];
        checks.forEach((check) => {
            unclassifiedLocations.delete(check);
        });
        groupData[groupName] = {
            checks,
        };
        categoryConfig.categories[groupName] = {
            title: groupName,
            groupKey: groupName,
            theme: "default",
            children: null,
        };
        categoryConfig.categories.root.children.push(groupName);
    }

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

    // let allChecks = checkManager.getAllExistingChecks();
    // allChecks.forEach((check) => (groupData.all.checks.push(check)));

    /** @type {import("../TrackerBuilder").GameBuilder} */
    const buildTracker = (
        checkManager,
        entranceManager,
        regionManager,
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
