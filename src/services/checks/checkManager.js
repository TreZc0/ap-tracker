// @ts-check
// A class that is able to give information about checks.
/**
 * @typedef CheckStatus
 * @prop {boolean} exists
 * @prop {String | null} hint
 * @prop {boolean} ignored
 * @prop {boolean} checked
 */

/**
 * @typedef CheckStatusUpdate
 * @prop {boolean} [exists]
 * @prop {String | null} [hint]
 * @prop {boolean} [ignored]
 * @prop {boolean} [checked]
 */

const defaultCheckStatus = {
    exists: false,
    hint: null,
    ignored: false,
    checked: false,
};

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

/**
 * Returns a function that can be called to subscribe to a specific check, used for syncing state with react.
 * @param {string} checkName
 * @returns
 */
const getSubscribeCallback = (checkName) => {
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
    getSubscribeCallback,
    defaultCheckStatus,
};

export default CheckManager;
