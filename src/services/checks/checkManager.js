// @ts-check
// A class that is able to give information about checks.
/**
 * @typedef CheckStatus
 * @prop {boolean} exists
 * @prop {import("../tags/tagManager").Tag[]} tags
 * @prop {boolean} ignored
 * @prop {boolean} checked
 * @prop {number} id
 */

/**
 * @typedef CheckStatusUpdate
 * @prop {boolean} [exists]
 * @prop {import("../tags/tagManager").Tag[]} [tags]
 * @prop {boolean} [ignored]
 * @prop {boolean} [checked]
 * @prop {number} [id]
 */

const defaultCheckStatus = {
    exists: false,
    tags: [],
    ignored: false,
    checked: false,
    id: 0,
};

/**
 * @typedef CheckManager
 * @prop {(checkName: string, status: CheckStatusUpdate) => void} updateCheckStatus
 * @prop {() => void} deleteAllChecks
 * @prop {(checkName: string) => void} deleteCheck
 * @prop {(checkName: string) => CheckStatus} getCheckStatus
 * @prop {(checkName: string) => (listener: () => void) => () => void} getSubscriberCallback
 * @prop {() => Set<String>} getAllExistingChecks
 */
/**
 *
 * @returns {CheckManager}
 */
const createCheckManager = () => {
    /** @type {Map<String, CheckStatus>} */
    const checkData = new Map();
    /** @type {Map<String, Set<()=>void>>} */
    const checkSubscribers = new Map();

    /**
     *
     * @param {string} checkName
     * @param {CheckStatusUpdate} status
     */
    const updateCheckStatus = (checkName, status) => {
        checkData.set(checkName, {
            ...(checkData.get(checkName) ?? defaultCheckStatus),
            ...status,
        });
        checkSubscribers.get(checkName)?.forEach((listener) => listener());
    };

    /**
     *
     * @param {String} checkName
     * @returns {CheckStatus}
     */
    const getCheckStatus = (checkName) => {
        return checkData.get(checkName) ?? defaultCheckStatus;
    };

    /**
     *
     * @param {string} checkName
     */
    const deleteCheck = (checkName) => {
        checkData.delete(checkName);
        checkSubscribers.get(checkName)?.forEach((listener) => listener());
    };

    const deleteAllChecks = () => {
        let names = [...checkData.keys()];
        names.map((name) => deleteCheck(name));
    };

    /** Gets a list of all checks that exist in the tracker */
    const getAllExistingChecks = () => {
        let checks = new Set();
        checkData.forEach((status, checkName) => {
            if (status.exists) {
                checks.add(checkName);
            }
        });
        return checks;
    };
    /**
     * Returns a function that can be called to subscribe to a specific check, used for syncing state with react.
     * @param {string} checkName
     * @returns
     */
    const getSubscriberCallback = (checkName) => {
        return (/** @type {()=>void} */ listener) => {
            if (!checkSubscribers.has(checkName)) {
                checkSubscribers.set(checkName, new Set());
            }
            checkSubscribers.get(checkName)?.add(listener);
            // return a function to clean up the subscription
            return () => {
                checkSubscribers.get(checkName)?.delete(listener);
            };
        };
    };
    const CheckManager = {
        updateCheckStatus,
        deleteAllChecks,
        deleteCheck,
        getCheckStatus,
        getSubscriberCallback,
        getAllExistingChecks,
    };
    return CheckManager;
};

export { createCheckManager, defaultCheckStatus };
