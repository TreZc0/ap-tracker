// @ts-check
import LocationGroupCategoryGenerator from "./categoryGenerators/locationGroup";
import locationNameGroupGenerator from "./categoryGenerators/locationName";

/**
 * @param {string} gameName
 * @param {import("../../services/checks/checkManager").CheckManager} checkManager
 * @param {Object.<string, string[]>} locationGroups
 * @returns {import("../TrackerBuilder").Tracker}
 */
const buildGenericGame = (gameName, checkManager, locationGroups) => {
    // quick test, do not merge;
    let checks = checkManager.getAllExistingChecks();
    locationNameGroupGenerator.generateCategories(checks, { splitCharacters: [" ", ".", "_", "-", ":"], splitOnCase: true }, 3);

    const { groupConfig, categoryConfig } =
        LocationGroupCategoryGenerator.generateCategories(
            checkManager,
            locationGroups
        );

    // so others can use templates
    console.info(
        "Result of tracker generation, copy this object for a template as needed.",
        {
            id: `Auto-generated-${gameName}-tracker-LG`,
            name: `${gameName} - Location Grouped Tracker`,
            game: gameName,
            customTrackerVersion: 1,
            groupData: groupConfig,
            sectionData: categoryConfig,
        }
    );

    /** @type {import("../TrackerBuilder")._TrackerBuilder} */
    const buildTracker = (
        checkManager,
        entranceManager,
        groupManager,
        sectionManager,
        slotData
    ) => {
        // configure groups and sections
        groupManager.loadGroups(groupConfig);
        sectionManager.setConfiguration(categoryConfig);
    };

    return {
        name: `${gameName} - auto grouped by location groups`,
        id: `${gameName}-LocationGroupGenerated`,
        gameName: gameName,
        buildTracker,
    };
};

export { buildGenericGame };
