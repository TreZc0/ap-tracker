// @ts-check
import { useSyncExternalStore } from "react";
import { getEntranceDestRegion, getEntranceSubscriber } from "../services/entrances/entranceManager";

/**
 * Gets the destination of an entrance
 * @param {string} entrance 
 * @returns 
 */
const useEntrance = (entrance) => {
    return useSyncExternalStore(
        getEntranceSubscriber(entrance),
        () => getEntranceDestRegion(entrance),
        () => getEntranceDestRegion(entrance),
    )
}

export default useEntrance;