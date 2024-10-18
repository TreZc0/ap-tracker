// @ts-check
import { useSyncExternalStore } from "react";

/**
 * Gets the destination of an entrance
 * @param {string} entrance 
 * @param {import("../services/entrances/entranceManager").EntranceManager} entranceManager 
 * @returns 
 */
const useEntrance = (entrance, entranceManager) => {
    return useSyncExternalStore(
        entranceManager.getEntranceSubscriber(entrance),
        () => entranceManager.getEntranceDestRegion(entrance),
        () => entranceManager.getEntranceDestRegion(entrance),
    )
}

export default useEntrance;