// @ts-check

/**
 *
 * @param {import("../../services/checks/checkManager").CheckManager} checkManager
 */
const buildGenericGame = (gameName, checkManager) => {
    const regionData = {
        all: [
            {
                region_name: "root",
                locations: {},
            },
        ],
    };
    const locations = regionData.all[0].locations;
    const groupData = {
        all: {
            regions: ["root"],
        },
    };
    const categoryConfig = {
        categories: {
            root: {
                title: "Total",
                type: null,
                areaKey: "all",
                theme: "default",
                children: null,
            },
        },
        options: {},
        types: {},
        themes: {
            default: { color: "#000000" },
        },
    };

    let allChecks = checkManager.getAllExistingChecks();
    allChecks.forEach((check) => (locations[check] = "True"));

    /** @type {import("../TrackerBuilder").GameBuilder} */
    const buildTracker = (
        checkManager,
        entranceManager,
        regionManager,
        groupManager,
        sectionManager,
        slotData
    ) => {
        // configure regions, groups and sections
        regionManager.loadRegions(regionData);
        groupManager.loadGroups(groupData);
        sectionManager.setConfiguration(categoryConfig);
    };

    return {
        title: gameName,
        abbrivation: gameName,
        buildTracker,
    };
};

export { buildGenericGame };
