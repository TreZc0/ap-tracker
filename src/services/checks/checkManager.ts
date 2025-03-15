// A class that is able to give information about checks.
interface CheckStatus {
    exists: boolean;
    tags: import("../tags/tagManager").Tag[];
    ignored: boolean;
    checked: boolean;
    id: number;
}

interface CheckStatusUpdate {
    exists?: boolean;
    tags?: import("../tags/tagManager").Tag[];
    ignored?: boolean;
    checked?: boolean;
    id?: number;
}

const defaultCheckStatus = {
    exists: false,
    tags: [],
    ignored: false,
    checked: false,
    id: 0,
};

interface CheckManager {
    updateCheckStatus: (checkName: string, status: CheckStatusUpdate) => void;
    deleteAllChecks: () => void;
    deleteCheck: (checkName: string) => void;
    getCheckStatus: (checkName: string) => CheckStatus;
    getSubscriberCallback: (checkName: string) => (listener: () => void) => () => void;
    getAllExistingChecks: () => Set<string>;
}

const createCheckManager = () : CheckManager => {
    const checkData: Map<string, CheckStatus> = new Map();
    const checkSubscribers: Map<string, Set<() => void>> = new Map();

    const updateCheckStatus = (checkName: string, status: CheckStatusUpdate) => {
        checkData.set(checkName, {
            ...(checkData.get(checkName) ?? defaultCheckStatus),
            ...status,
        });
        checkSubscribers.get(checkName)?.forEach((listener) => listener());
    };

    const getCheckStatus = (checkName: string): CheckStatus => {
        return checkData.get(checkName) ?? defaultCheckStatus;
    };

    const deleteCheck = (checkName: string) => {
        checkData.delete(checkName);
        checkSubscribers.get(checkName)?.forEach((listener) => listener());
    };

    const deleteAllChecks = () => {
        let names = [...checkData.keys()];
        names.map((name) => deleteCheck(name));
    };

    /** Gets a list of all checks that exist in the tracker */
    const getAllExistingChecks = () => {
        let checks: Set<string> = new Set();
        checkData.forEach((status, checkName) => {
            if (status.exists) {
                checks.add(checkName);
            }
        });
        return checks;
    };
    /**
     * Returns a function that can be called to subscribe to a specific check, used for syncing state with react.
     * @param checkName
     * @returns
     */
    const getSubscriberCallback = (checkName: string) => {
        return (listener: () => void) => {
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
export type {CheckManager, CheckStatus, CheckStatusUpdate};
