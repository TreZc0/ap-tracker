// @ts-check
import LocationGroupCategoryGenerator from "./categoryGenerators/locationGroup";

/**
 * @param {string} gameName
 * @param {import("../../services/checks/checkManager").CheckManager} checkManager
 * @param {Object.<string, string[]>} locationGroups
 * @returns {import("../TrackerBuilder").Tracker}
 */
const buildGenericGame = (gameName, checkManager, locationGroups) => {
    const { groupConfig, categoryConfig } =
        LocationGroupCategoryGenerator.generateCategories(
            checkManager,
            locationGroups
        );

    /** @type {import("../TrackerBuilder").TrackerBuilder} */
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
