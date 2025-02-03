import { createPortal } from "react-dom";
import React, { useEffect, useState, useRef } from "react";
import NotificationManager from "../../../services/notifications/notifications";
import Toast from "./toastNotification";
import styled from "styled-components";
import { PrimaryButton } from "../../buttons";

const DialogContainer = styled.dialog`
    position: fixed;
    padding: 2rem;
    background-color: white;
    border: 0px solid black;
    box-shadow: 0px 2px 4px black;
    border-radius: 5px;
    pointer-events: all;
    &::backdrop {
        background: rgba(0, 0, 0, 0.7);
    }
`;

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

let ToastContainer = () => {
    let [notifications, setNotifications] = useState([]);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailIndex, setDetailIndex] = useState(false);
    const dialog = useRef(null);
    const animationFrameRef = useRef();
    const timeRef = useRef();
    const frozenRef = useRef();

    const openDetailModal = (index) => {
        setDetailIndex(index);
        setDetailModalOpen(true);
    };

    const pause = () => {
        frozenRef.current = true;
    };

    const resume = () => {
        frozenRef.current = false;
    };

    useEffect(() => {
        if (detailModalOpen) {
            dialog.current?.showModal();
        } else {
            dialog.current?.close();
        }
    }, [detailModalOpen]);

    useEffect(() => {
        /**
         * @param {import("../../../services/notifications/notifications").ToastNotification} toast
         */
        let addToast = (toast) => {
            let newNotifications = notifications.slice(0);
            newNotifications.unshift({
                message: toast.message,
                type: toast.type,
                id: toast.id,
                remainingTime: toast.duration,
                duration: toast.duration,
                details: toast.details,
            });
            setNotifications(newNotifications);
        };

        let update = (time) => {
            animationFrameRef.current = requestAnimationFrame(update);
            if (!timeRef.current) {
                timeRef.current = time;
                return;
            }
            let delta = time - timeRef.current;
            timeRef.current = time;
            setNotifications((n) =>
                n
                    .map((x) => ({
                        ...x,
                        remainingTime:
                            frozenRef.current || detailModalOpen
                                ? x.remainingTime
                                : x.remainingTime - delta,
                    }))
                    .filter((x) => x.remainingTime > -300)
            );
        };

        animationFrameRef.current = requestAnimationFrame(update);
        NotificationManager.addToastListener(addToast);
        return () => {
            NotificationManager.removeToastListener(addToast);
            cancelAnimationFrame(animationFrameRef.current);
        };
    });

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
                >
                    {detailModalOpen && notifications[detailIndex] && (
                        <DialogContainer ref={dialog}>
                            <ContentContainer>
                                <h3 style={{ gridArea: "message" }}>
                                    {notifications[detailIndex].message}
                                </h3>
                                <div style={{ gridArea: "details" }}>
                                    {notifications[detailIndex].details}
                                </div>
                                <PrimaryButton
                                    style={{ gridArea: "close" }}
                                    $small
                                    onClick={() => {
                                        setDetailModalOpen(false);
                                    }}
                                >
                                    {" "}
                                    Close{" "}
                                </PrimaryButton>
                            </ContentContainer>
                        </DialogContainer>
                    )}
                    {notifications.map((toast, index) => (
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
                </div>,
                document.body
            )}
        </>
    );
};

export default ToastContainer;
