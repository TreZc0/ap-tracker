// @ts-check
// TODO make this less OOT specific
/**
 * @typedef RegionData
 * @prop {String} region_name
 * @prop {String} [hint]
 * @prop {String} [scene]
 * @prop {String} [dungeon]
 * @prop {Object.<String, String>} [locations]
 * @prop {Object.<String, String>} [events]
 * @prop {Object.<String, String>} [exits]
 * @prop {boolean} [timePasses]
 */

/**
 * @typedef RegionManager
 * @prop {(region: string) => Set<string>} getChecksInRegion
 * @prop {(data: {[x: string]: RegionData[]}) => void} loadRegions
 */

/**
 *
 * @returns {RegionManager}
 */
const createRegionManager = () => {
    /** @type {Map<string, Set<String>>} */
    let regionChecks = new Map();

    /**
     *
     * @param {string} region
     * @returns
     */
    let getChecksInRegion = (region) => {
        return regionChecks.get(region) ?? new Set();
    };

    /**
     * 
     * @param {Object.<string, RegionData[]>} data 
     */
    let loadRegions = (data) => {
        for (let key of Object.getOwnPropertyNames(data)) {
            for (let regionData of data[key]) {
                const { region_name, locations } = regionData;
                if (region_name && locations) {
                    let checks = regionChecks.get(region_name) ?? new Set();
                    for (let location in locations) {
                        checks.add(location);
                    }
                    regionChecks.set(region_name, checks);
                }
            }
        }
    };

    return { getChecksInRegion, loadRegions };
};

export { createRegionManager };
