// @ts-check
/**
 * Enum for message Types
 * @readonly
 * @enum {string}
 */
const MessageType = {
    info: "info",
    progress: "progress",
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
 * @typedef StatusNotification A message indicating the current status of something in progress appears to the user
 * @prop {MessageType} type
 * @prop {string} message
 * @prop {number} [duration] in milliseconds, if defined, message will auto clear after this amount of time
 * @prop {number} progress [0-1] 1 being complete. Put -1 to have a spinner instead of progress bar
 * @prop {string} id
 *
 */

/**
 * @typedef StatusNotificationUpdate An update for a notification, specify any values that need to be updated
 * @prop {MessageType} [type]
 * @prop {string} [message]
 * @prop {number} [duration] in milliseconds, if defined, message will auto clear after this amount of time
 * @prop {number} [progress] [0-1] 1 being complete. Put -1 to have a spinner instead of progress bar
 *
 */

/**
 * @typedef StatusNotificationHandel
 * @prop {(newInfo: StatusNotificationUpdate) => void} update
 */

/**
 * @typedef ToastNotification A timed pop up message appears to the user
 * @prop {MessageType} type
 * @prop {string} message
 * @prop {string} [details]
 * @prop {number} duration in Milliseconds
 * @prop {string} id
 *
 */
const NotificationManager = (() => {
    /** @type {Set<(status:StatusNotification) => void>} */
    const statusListeners = new Set();

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

    /**
     *
     * @param {Object} params
     * @param {string} params.message
     * @param {MessageType} params.type
     * @param {string} [params.id]
     * @param {number} [params.duration] Number of seconds message should pop up, defaults to 5
     * @param {number} [params.progress] [0-1] on how much progress has been made, defaults to -1 (spinner)
     * @returns {StatusNotificationHandel}
     */
    const createStatus = ({ message, type, id, duration, progress=-1 }) => {
        /** @type {StatusNotification} */
        let status = {
            type,
            message,
            progress,
            duration: duration === undefined? undefined : duration * 1000,
            id: id ?? randomId(),
        };

        statusListeners.forEach((listener) => {
            listener(status);
        });

        return {
            update: (values) => {
                status = {
                    ...status,
                    ...values,
                    duration: values.duration === undefined ? undefined : values.duration * 1000
                }
                statusListeners.forEach((listener) => {
                    listener(status);
                });
            }
        }


    };

    /**
     *
     * @param {(status:StatusNotification)=>void} listener
     */
    const addStatusListener = (listener) => {
        statusListeners.add(listener);
    };
    /**
     *
     * @param {(status:StatusNotification)=>void} listener
     */
    const removeStatusListener = (listener) => {
        statusListeners.delete(listener);
    };

    return {
        createToast,
        addToastListener,
        removeToastListener,
        createStatus,
        addStatusListener,
        removeStatusListener,
        MessageType,
    };
})();

export default NotificationManager;
export { MessageType };
