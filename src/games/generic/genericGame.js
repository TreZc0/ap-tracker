// @ts-check
import LocationGroupCategoryGenerator from "./categoryGenerators/locationGroup";

/**
 * @param {string} gameName
 * @param {import("../../services/checks/checkManager").CheckManager} checkManager
 * @param {Object.<string, string[]>} groups
 */
const buildGenericGame = (gameName, checkManager, groups) => {
    const { groupConfig, categoryConfig } =
        LocationGroupCategoryGenerator.generateCategories(checkManager, groups);

    /** @type {import("../TrackerBuilder").GameBuilder} */
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
        title: gameName,
        abbreviation: gameName,
        buildTracker,
    };
};

export { buildGenericGame };
