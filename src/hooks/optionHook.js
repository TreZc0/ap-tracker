// @ts-check
import { useSyncExternalStore } from "react";

/**
 * Gets the destination of an entrance
 * @param {import("../services/options/optionManager").OptionManager} optionManager 
 * @param {string} optionName
 * @param {string} scope
 * @returns 
 */
const useOption = (optionManager, optionName, scope) => {
    return useSyncExternalStore(
            optionManager.getSubscriberCallback(optionName, scope),
            () => optionManager.getOptionValue(optionName, scope),
            () => optionManager.getOptionValue(optionName, scope),
        )
}

export default useOption;