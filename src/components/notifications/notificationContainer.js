// @ts-check
import { createPortal } from "react-dom";
import React, {
    useEffect,
    useState,
    useRef,
    useContext,
    useReducer,
} from "react";
import NotificationManager from "../../services/notifications/notifications";
import Toast from "./toastNotification";
import styled from "styled-components";
import { SecondaryButton } from "../buttons";
import Dialog from "../shared/Dialog";
import ServiceContext from "../../contexts/serviceContext";
import useOption from "../../hooks/optionHook";
import { readThemeValue } from "../../services/theme/theme";
import _ from "lodash";
import StatusNotification from "./statusNotification";

const ContentContainer = styled.div`
    width: fit-content;
    max-width: 75vw;
    display: grid;
    align-items: end;
    justify-items: center;
    row-gap: 0.25em;
    grid-template-areas:
        "message"
        "details"
        "close";
`;
/**
 *
 * @param {any[]} notifications
 * @param {{type:string, data:*}} action
 */
let toastNotificationReducer = (notifications, action) => {
    let newNotifications = notifications.slice(0);
    switch (action.type) {
        case "tick": {
            newNotifications = notifications
                .map((x) => ({
                    ...x,
                    new: false,
                    remainingTime: x.remainingTime - action.data.delta,
                }))
                .filter((x) => x.remainingTime > -300);
            // -300 ms left on the timer to make time for the clearing animation that starts at 0

            break;
        }
        case "add": {
            let index = _.findIndex(newNotifications, {
                id: action.data.notification.id,
            });
            if (index < 0) {
                // add completely new notification
                newNotifications.unshift({
                    message: action.data.notification.message,
                    type: action.data.notification.type,
                    id: action.data.notification.id,
                    remainingTime: action.data.notification.duration,
                    duration: action.data.notification.duration,
                    details: action.data.notification.details,
                });
            } else {
                // update an older one
                newNotifications[index] = {
                    ...newNotifications[index],
                    message: action.data.notification.message,
                    type: action.data.notification.type,
                    remainingTime: action.data.notification.duration,
                    duration: action.data.notification.duration,
                    details: action.data.notification.details,
                };
            }

            break;
        }
        default:
            break;
    }

    return newNotifications;
};

/**
 *
 * @param {any[]} notifications
 * @param {{type:string, data:*}} action
 */
let statusNotificationReducer = (notifications, action) => {
    let newNotifications = notifications.slice(0);
    switch (action.type) {
        case "tick": {
            newNotifications = notifications
                .map((x) => ({
                    ...x,
                    new: false,
                    remainingTime: x.timed
                        ? x.remainingTime - action.data.delta
                        : x.remainingTime,
                }))
                .filter((x) => x.remainingTime > -300);

            break;
        }
        case "update": {
            let oldIndex = _.findIndex(newNotifications, {
                id: action.data.notification.id,
            });
            if (oldIndex > -1) {
                let newStatus = {
                    ...notifications[oldIndex],
                    notification: action.data.notification,
                };
                if (action.data.notification.duration !== undefined) {
                    newStatus.remainingTime = action.data.notification.duration;
                    newStatus.timed = true;
                }
                newNotifications[oldIndex] = newStatus;
            } else {
                let newStatus = {
                    id: action.data.notification.id,
                    timed: action.data.notification.duration !== undefined,
                    new: true,
                    remainingTime: action.data.notification.duration ?? 1,
                    notification: action.data.notification,
                };
                newNotifications.push(newStatus);
            }
            break;
        }
        default:
            break;
    }

    return newNotifications;
};

let NotificationContainer = () => {
    let [toastNotifications, updateToastNotifications] = useReducer(
        toastNotificationReducer,
        []
    );
    let [statusNotifications, updateStatusNotifications] = useReducer(
        statusNotificationReducer,
        []
    );
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailIndex, setDetailIndex] = useState(0);
    const dialog = useRef(null);
    const animationFrameRef = useRef(0);
    const timeRef = useRef(0);
    const toastTimerStopped = useRef(false);
    const serviceContext = useContext(ServiceContext);
    const optionManger = serviceContext.optionManager;
    const themeValue = useOption(optionManger, "theme", "global");

    const openDetailModal = (index) => {
        setDetailIndex(index);
        setDetailModalOpen(true);
    };

    const pause = () => {
        toastTimerStopped.current = true;
    };

    const resume = () => {
        toastTimerStopped.current = false;
    };

    // Effect to sync modal opening and closing with state
    useEffect(() => {
        if (detailModalOpen) {
            dialog.current?.showModal();
        } else {
            dialog.current?.close();
        }
    }, [detailModalOpen]);

    // Effect to run timer animations, set listeners on notifications
    useEffect(() => {
        /**
         * @param {import("../../services/notifications/notifications").ToastNotification} toast
         */
        let addToast = (toast) => {
            updateToastNotifications({
                type: "add",
                data: { notification: toast },
            });
        };

        /**
         *
         * @param {import("../../services/notifications/notifications").StatusNotification} statusNotification
         */
        let addStatus = (statusNotification) => {
            updateStatusNotifications({
                type: "update",
                data: { notification: statusNotification },
            });
        };

        let update = (time) => {
            animationFrameRef.current = requestAnimationFrame(update);
            if (!timeRef.current) {
                timeRef.current = time;
                return;
            }
            let delta = time - timeRef.current;
            timeRef.current = time;
            if (!toastTimerStopped.current && !detailModalOpen) {
                updateToastNotifications({ type: "tick", data: { delta } });
            }

            updateStatusNotifications({ type: "tick", data: { delta } });
        };

        animationFrameRef.current = requestAnimationFrame(update);
        NotificationManager.addToastListener(addToast);
        NotificationManager.addStatusListener(addStatus);
        return () => {
            // clean up call
            NotificationManager.removeToastListener(addToast);
            NotificationManager.removeStatusListener(addStatus);
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [detailModalOpen]);

    return (
        <>
            {createPortal(
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        overflow: "hidden",
                        display: "block",
                        margin: 0,
                        padding: 0,
                        pointerEvents: "none",
                        zIndex: 100,
                    }}
                    data-theme={readThemeValue(themeValue)}
                >
                    {detailModalOpen && toastNotifications[detailIndex] && (
                        <Dialog ref={dialog}>
                            <ContentContainer>
                                <h3 style={{ gridArea: "message" }}>
                                    {toastNotifications[detailIndex].message}
                                </h3>
                                <div
                                    style={{
                                        gridArea: "details",
                                        whiteSpace: "pre-wrap",
                                    }}
                                >
                                    {toastNotifications[detailIndex].details}
                                </div>
                                <SecondaryButton
                                    style={{ gridArea: "close" }}
                                    // @ts-ignore
                                    $small
                                    onClick={() => {
                                        setDetailModalOpen(false);
                                    }}
                                >
                                    Close
                                </SecondaryButton>
                            </ContentContainer>
                        </Dialog>
                    )}
                    {toastNotifications.map((toast, index) => (
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            key={toast.id}
                            index={index}
                            remainingTime={toast.remainingTime}
                            duration={toast.duration}
                            details={toast.details}
                            mouseEnter={pause}
                            mouseLeave={resume}
                            click={() => {
                                openDetailModal(index);
                            }}
                        ></Toast>
                    ))}

                    {statusNotifications.map((notification, index) => (
                        <StatusNotification
                            message={notification.notification.message}
                            type={notification.notification.type}
                            key={notification.id}
                            index={index}
                            hide={
                                notification.new ||
                                notification.remainingTime < 0
                            }
                            progress={notification.notification.progress}
                        ></StatusNotification>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
};

export default NotificationContainer;
