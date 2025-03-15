// @ts-check
import { CheckManager } from "../../services/checks/checkManager";
import { Tracker, TrackerBuilder } from "../TrackerManager";
import LocationGroupCategoryGenerator from "./categoryGenerators/locationGroup";
import locationNameGroupGenerator from "./categoryGenerators/locationName";

/** Builds a generic tracker for a given game */
const buildGenericGame = (gameName: string, checkManager: CheckManager, locationGroups: { [locationGroupName: string]: string[] }): Tracker => {
    // quick test, do not merge;
    const checks = checkManager.getAllExistingChecks();
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

    const buildTracker: TrackerBuilder = (
        _checkManager,
        _entranceManager,
        groupManager,
        sectionManager,
        _slotData
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
