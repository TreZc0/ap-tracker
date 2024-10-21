// @ts-check
const title = "Ocarina of Time";
const abbreviation = "OOT";

/** @type {import("../TrackerBuilder").GameBuilder} */
const buildTracker = (
    checkManager,
    entranceManager,
    regionManager,
    groupManager,
    sectionManager,
    slotData
) => {
    // Configure the entrance manager
    const entranceMetaData = require("./EntranceMetaData.json");
    const entranceData = require("./Entrances.json");
    entranceManager.setReverseCategoryMap(
        entranceMetaData["ReverseCategoryMap"]
    );
    entranceManager.setAdoptableEntrances(entranceMetaData["AdoptableTypes"]);
    for (let i = 0; i < entranceData["Entrances"].length; i++) {
        let entrance = entranceData["Entrances"][i];
        entranceManager.addEntrance(entrance);
    }

    // configure regions, groups and sections
    regionManager.loadRegions(require("./World.json"));
    groupManager.loadGroups(require("./Groups.json"));
    sectionManager.setConfiguration(require("./CategoryConfig.json"));

    entranceManager.resetEntranceTable();
};

/** @type {import("../TrackerBuilder").Game} */
const OOT = {
    title,
    abbreviation,
    buildTracker,
};

export default OOT;
