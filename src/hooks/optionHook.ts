import { useSyncExternalStore } from "react";
import { OptionManager } from "../services/options/optionManager";

/**
 * Gets the value of an option in a scope
 * @param optionManager
 * @param optionName
 * @param scope
 * @returns
 */
const useOption = (
    optionManager: OptionManager,
    optionName: string,
    scope: string
) => {
    return useSyncExternalStore(
        optionManager.getSubscriberCallback(optionName, scope),
        () => optionManager.getOptionValue(optionName, scope),
        () => optionManager.getOptionValue(optionName, scope)
    );
};

export default useOption;
