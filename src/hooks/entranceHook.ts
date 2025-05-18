import { useSyncExternalStore } from "react";
import { EntranceManager } from "../services/entrances/entranceManager";

/**
 * Gets the destination of an entrance
 * @param entrance
 * @param entranceManager
 * @returns
 */
const useEntrance = (entrance: string, entranceManager: EntranceManager) => {
    return useSyncExternalStore(
        entranceManager.getEntranceSubscriber(entrance),
        () => entranceManager.getEntranceDestRegion(entrance),
        () => entranceManager.getEntranceDestRegion(entrance)
    );
};

export default useEntrance;
