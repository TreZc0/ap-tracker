// @ts-check

import { buildGenericGame } from "./generic/genericGame.js";

/**
 * @callback GameBuilder
 * @param {import("../services/checks/checkManager").CheckManager} checkManager
 * @param {import("../services/entrances/entranceManager").EntranceManager} entranceManager
 * @param {import("../services/regions/regionManager").RegionManager} regionManager
 * @param {import("../services/sections/groupManager").GroupManager} groupManager
 * @param {import("../services/sections/sectionManager").SectionManager} sectionManager
 * @param {*} slotData
 * @returns {void}
 */

/**
 * @typedef Game
 * @prop {string} title
 * @prop {string} abbreviation
 * @prop {GameBuilder} buildTracker
 */

/** @type {Object.<string, () => Game>} */
const games = {
    // "Ocarina of Time": () => require("./OOT/oot.js").default,
};

const gameList = new Set(Object.getOwnPropertyNames(games));

/**
 *
 * @param {String} gameName
 * @param {import("../services/checks/checkManager").CheckManager} checkManager
 * @param {import("../services/entrances/entranceManager").EntranceManager} entranceManager
 * @param {import("../services/regions/regionManager").RegionManager} regionManager
 * @param {import("../services/sections/groupManager").GroupManager} groupManager
 * @param {import("../services/sections/sectionManager").SectionManager} sectionManager
 * @param {*} slotData
 * @param {Object.<string, string[]>} groups
 */
const TrackerBuilder = (
    gameName,
    checkManager,
    entranceManager,
    regionManager,
    groupManager,
    sectionManager,
    slotData,
    groups
) => {
    let game = null;
    if (gameList.has(gameName)) {
        game = games[gameName]();
    } else {
        game = buildGenericGame(gameName, checkManager, groups);
    }
    game.buildTracker(
        checkManager,
        entranceManager,
        regionManager,
        groupManager,
        sectionManager,
        slotData
    );
};

export { TrackerBuilder, gameList };
