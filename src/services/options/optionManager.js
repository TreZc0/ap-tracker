// @ts-check
const OPTION_LOCAL_STORAGE_ITEM_NAME = "archipelagoTrackerOptionData";
const DEBUG = false;

/** 
 * @typedef OptionManager
 * @prop {(scope: string) => void} clearScope
 * @prop {(optionName:string, scope: string) => *} getOptionValue
 * @prop {(optionName:string, scope: string, value: *) => void} setOptionValue
 * @prop {(scope: string, values: any) => void} setScope
 * @prop {(scope: string) => any} exportScope
 * @prop {(scope: string) => void} saveScope
 * @prop {(scope: string) => void} loadScope
 * @prop {(optionName: string, scope: string) => (listener: () => void) => () => void} getSubscriberCallback
 * @prop {()=>OptionManager} clone
 */

/**
 * 
 * @returns {OptionManager}
 */
const createOptionManager = () => {
    /** @type {Map<string, Map<string, Set<()=>void>>>} */
    const optionSubscribers = new Map();

    /** @type {Map<string, Map<string, number|string|boolean|number[]|string[]|boolean[]>>} */
    const options = new Map();

    /**
     * Returns a function that can have a listener passed into it to listen to changes to that option value
     * @param {string} optionName
     * @param {string} scope
     * @returns A callback that accepts a listener and returns a clean up method.
     */
    const getSubscriberCallback = (optionName, scope) => {
        return (/** @type {()=>void} */ listener) => {
            /** @type {Map<string, Set<()=>void>>} */
            const optionListeningScope =
                optionSubscribers.get(scope) ?? new Map();
            optionSubscribers.set(scope, optionListeningScope);

            /** @type {Set<()=>void>} */
            const optionListeners =
                optionListeningScope.get(optionName) ?? new Set();
            optionListeningScope.set(optionName, optionListeners);

            optionListeners.add(listener);

            if (DEBUG && getOptionValue(optionName, scope) === null) {
                console.info(
                    `The option <${scope}.${optionName}> was subscribed to, but does not exist yet. Safe to ignore this message if you plan on adding it later`
                );
            }
            // return a function to clean up the subscription
            return () => {
                optionSubscribers.get(scope)?.get(optionName)?.delete(listener);
            };
        };
    };

    /**
     * Gets a value from the option store, returns null if it does not exist
     * @param {string} optionName
     * @param {string} scope
     * @returns
     */
    const getOptionValue = (optionName, scope) => {
        let value = options.get(scope)?.get(optionName) ?? null
        if(DEBUG){
            console.info(`Retrieved option ${scope}.${optionName} as ${value}`)
        }
        return value;
    };

    /**
     * Sets the value of an option
     * @param {string} optionName 
     * @param {string} scope 
     * @param {*} value 
     */
    const setOptionValue = (optionName, scope, value) => {
        const optionScope = options.get(scope) ?? new Map();
        options.set(scope, optionScope);
        if (value === null) {
            optionScope.delete(optionName);
        } else {
            optionScope.set(optionName, value);
        }

        // call listeners
        optionSubscribers
            .get(scope)
            ?.get(optionName)
            ?.forEach((listener) => {
                listener();
            });
        if(DEBUG){
            console.info(`Set option ${scope}.${optionName} to ${value}`)
        }
        // debugger;
    };

    /**
     * Exports the scope to a JSON object.
     * @param {string} scope 
     * @returns {*} JSON version of data
     */
    const exportScope = (scope) => {
        let result = {};
        for(const option of (options.get(scope) ?? new Map()).keys()){
            result[option] = options.get(scope)?.get(option);
            if(Array.isArray(result[option])){
                result[option] = [...result[option]];
            }
        }
        return result;
    };

    /**
     * Saves the scope to a local store for that scope. Use only for options intended
     * to be global for that scope. (example is user settings)
     * @param {string} scope 
     */
    const saveScope = (scope) => {
        const saveDataString = localStorage.getItem(OPTION_LOCAL_STORAGE_ITEM_NAME);
        const saveData = saveDataString ? JSON.parse(saveDataString) : {};
        saveData[scope] = exportScope(scope);
        localStorage.setItem(OPTION_LOCAL_STORAGE_ITEM_NAME, JSON.stringify(saveData));
        if(DEBUG){
            console.info(`Saved scope ${scope}`);
        }
    };
    /**
     * Loads a saved scope from a local store for that scope. Use only for options intended
     * to be global for that scope. (example is a user setting)
     * @param {string} scope 
     */
    const loadScope = (scope) => {
        const saveDataString = localStorage.getItem(OPTION_LOCAL_STORAGE_ITEM_NAME);
        const saveData = saveDataString ? JSON.parse(saveDataString) : {};
        if(Object.hasOwn(saveData, scope)) {
            const scopeData = saveData[scope];
            setScope(scope, scopeData);
            if(DEBUG){
                console.info(`Loaded scope ${scope}`);
            }
        } else if(DEBUG){
            console.info(`Failed to load scope ${scope}`);
        }
        
    };

    /**
     * Sets the values for a given scope from an external source
     * does not remove existing values in the scope, but will overwrite them
     * if they exist in the scope already.
     * Calls appropriate listeners.
     * @param {string} scope 
     * @param {*} values 
     */
    const setScope = (scope, values) => {
        for(let optionName of Object.getOwnPropertyNames(values)){
            setOptionValue(optionName, scope, values[optionName]);
        }
    };

    /**
     * Deletes all values from the scope
     * @param {string} scope 
     */
    const clearScope = (scope) => {
        options.delete(scope);
        optionSubscribers.get(scope)?.forEach((optionSubscribers) => {
            optionSubscribers.forEach((listener) => {
                listener();
            });
        });
    };

    /**
     * Creates a new options manager with all scope values copied to it.
     * @returns A new options manager, with scope values cloned
     */
    const clone = () => {
        const newManager = createOptionManager();
        options.forEach( (_, scope) => {
            let exportedValues = exportScope(scope);
            newManager.setScope(scope, exportedValues);
        });

        return newManager;
    }

    return {
        clearScope,
        setScope,
        exportScope,
        saveScope,
        loadScope,
        getSubscriberCallback,
        clone,
        getOptionValue,
        setOptionValue,
    }
};
export {createOptionManager};
