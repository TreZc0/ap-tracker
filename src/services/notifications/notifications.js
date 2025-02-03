// @ts-check
/**
 * Enum for message Types
 * @readonly
 * @enum {string}
 */
const MessageType = {
    info: "info",
    error: "error",
    warning: "warning",
    success: "success",
};

const randomId = () => {
    let result = "randomID-";
    for (let i = 0; i < 10; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
};
/**
 * @typedef ToastNotification
 * @prop {MessageType} type
 * @prop {string} message
 * @prop {string} [details]
 * @prop {number} duration in Milliseconds
 * @prop {string} id
 *
 */
const NotificationManager = (() => {
    /** @type {Set<(toast:ToastNotification)=>void>} */
    const toastListeners = new Set();
    /**
     *
     * @param {Object} params
     * @param {string} params.message
     * @param {string} [params.details]
     * @param {MessageType} params.type
     * @param {string} [params.id]
     * @param {number} [params.duration] Number of seconds message should pop up, defaults to 5
     */
    const createToast = ({ message, type, details, id, duration = 7 }) => {
        /** @type {ToastNotification} */
        const toast = {
            type,
            message,
            details,
            duration: duration * 1000,
            id: id ?? randomId(),
        };

        toastListeners.forEach((listener) => {
            listener(toast);
        });
    };

    /**
     *
     * @param {(toast:ToastNotification)=>void} listener
     */
    const addToastListener = (listener) => {
        toastListeners.add(listener);
    };
    /**
     *
     * @param {(toast:ToastNotification)=>void} listener
     */
    const removeToastListener = (listener) => {
        toastListeners.delete(listener);
    };

    return {
        createToast,
        addToastListener,
        removeToastListener,
        MessageType,
    };
})();

export default NotificationManager;
export { MessageType };
