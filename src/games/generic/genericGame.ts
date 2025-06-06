import { LocationManager } from "../../services/locations/locationManager";
import { generateId } from "../../utility/randomIdGen";
import { Tracker, TrackerBuilder } from "../TrackerManager";
import { CustomCategory_V1 } from "./categoryGenerators/customTrackerManager";
import { GenericGameMethod } from "./categoryGenerators/genericGameEnums";
import LocationGroupCategoryGenerator from "./categoryGenerators/locationGroup";
import locationNameGroupGenerator, { NameTokenizationOptions } from "./categoryGenerators/locationName";

/** Builds a generic tracker for a given game */
const buildGenericGame = (gameName: string, locationManager: LocationManager, locationGroups: { [locationGroupName: string]: string[] }, method: GenericGameMethod = GenericGameMethod.locationGroup, parameters: { useAllChecksInDataPackage?: boolean, tokenizationOptions?: NameTokenizationOptions, groupingOptions?: { minGroupSize?: number, maxDepth?: number, minTokenCount?: number } } = {}): Tracker => {
    let locations = locationManager.getMatchingLocations(LocationManager.filters.exist);
    if (parameters.useAllChecksInDataPackage ?? true) {
        locations = new Set(locationGroups["Everywhere"]);
    }
    const { groupConfig, categoryConfig } =
        method === GenericGameMethod.locationGroup ?
            LocationGroupCategoryGenerator.generateCategories(
                locationGroups
            ) :
            locationNameGroupGenerator.generateCategories(locations, { splitCharacters: [" ", ".", "_", "-", ":"], splitOnCase: true, ...parameters.tokenizationOptions }, { maxDepth: 3, minGroupSize: 3, minTokenCount: 1, ...parameters.groupingOptions });

    const discriminator = generateId(8);
    const id = `Auto-generated-${gameName}-tracker-${discriminator}`;
    const exportTracker = (): CustomCategory_V1 => {
        return {
            id,
            name: `${gameName} - ${method === GenericGameMethod.locationGroup ? "Location Grouped" : "Name Grouped"} Tracker (${discriminator})`,
            game: gameName,
            customTrackerVersion: 1,
            groupData: groupConfig,
            sectionData: categoryConfig,
        }
    };

    const buildTracker: TrackerBuilder = (
        _locationManager,
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
        id,
        gameName: gameName,
        buildTracker,
        exportTracker,
    };
};

export { buildGenericGame };