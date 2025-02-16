import React, { useRef, useEffect, useState, useCallback } from "react";
import Dialog from "./shared/Dialog";
import { PrimaryButton, DangerButton, GhostButton } from "./buttons";
import styled from "styled-components";
import { background, textPrimary } from "../constants/colors";
import Icon from "./icons/icons";
import { saveNote, loadNote } from "../services/connector/remoteSync";
import NotificationManager, {
    MessageType,
} from "../services/notifications/notifications";
const NoteGrid = styled.div`
    display: grid;
    width: 80vw;
    height: 80vh;
    grid:
        "title" 3em
        "note" 1fr
        "." 1em
        "buttons" 3em / 100%;
`;

const NotePad = ({ open, onClose, disabled, ...props }) => {
    let dialog = useRef(null);
    let textArea = useRef(null);
    let [noteContent, setNoteContent] = useState("");
    let [loading, setLoading] = useState(false);
    let [unsavedChanges, setUnsavedChanges] = useState(false);
    let [initialLoad, setInitialLoad] = useState(false);
    useEffect(() => {
        if (open) {
            dialog.current?.showModal();
        } else {
            dialog.current?.close();
        }
    }, [open]);

    const retrieveNote = useCallback(() => {
        if (unsavedChanges) {
            let confirmation = window.confirm(
                "You have changes that will be overwritten, are you sure?"
            );
            if (!confirmation) {
                return;
            }
        }
        setLoading(true);
        let noteStatusHandle = NotificationManager.createStatus({
            message: "Syncing Notes",
            type: MessageType.info,
            id: "note-status",
        });
        loadNote()
            .then((value) => {
                setNoteContent(value);
                setLoading(false);
                setUnsavedChanges(false);
                noteStatusHandle.update({
                    message: "Note Loaded",
                    type: MessageType.success,
                    duration: 1,
                    progress: 1,
                });
            })
            .catch((e) => {
                setLoading(false);
                noteStatusHandle.update({
                    message: "Failed to load notes",
                    type: MessageType.error,
                    duration: 4,
                    progress: 0,
                });
                NotificationManager.createToast({
                    message: "Failed to load note",
                    details: `Failed to load note due to an unexpected error.\nError:\n\t${e}`,
                    type: MessageType.error,
                });
            });
    }, [unsavedChanges]);

    useEffect(() => {
        if (noteContent === "" && !disabled && !loading && !initialLoad) {
            setInitialLoad(true);
            retrieveNote();
        }
    }, [disabled, noteContent, retrieveNote, loading, initialLoad]);
    return (
        <Dialog ref={dialog}>
            <NoteGrid>
                <h3 style={{ gridArea: "title" }}>
                    AP Notepad (experimental){" "}
                    {loading
                        ? " Syncing Data..."
                        : unsavedChanges
                        ? " Not saved"
                        : ""}
                </h3>
                <textarea
                    style={{
                        gridArea: "note",
                        backgroundColor: background,
                        color: textPrimary,
                    }}
                    className="interactive"
                    disabled={disabled || loading}
                    value={noteContent}
                    ref={textArea}
                    onKeyDown={(e) => {
                        if (e.key === "Tab" && !e.shiftKey) {
                            e.preventDefault();
                            let start = textArea.current?.selectionStart;
                            let end = textArea.current?.selectionEnd;
                            let value = textArea.current?.value;
                            if (textArea.current) {
                                textArea.current.value =
                                    value.substring(0, start) +
                                    "\t" +
                                    value.substring(end);
                                textArea.current.selectionStart = start + 1;
                                textArea.current.selectionEnd = end + 1;
                            }
                        }
                    }}
                    onChange={(e) => {
                        setUnsavedChanges(true);
                        setNoteContent(e.target.value);
                    }}
                ></textarea>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "right",
                        width: "100%",
                        gridArea: "buttons",
                    }}
                >
                    <PrimaryButton
                        $small
                        onClick={() => {
                            if (!loading) {
                                setLoading(true);
                                saveNote(noteContent)
                                    .then(() => {
                                        setLoading(false);
                                        setUnsavedChanges(false);
                                        NotificationManager.createToast({
                                            message: "Note Saved",
                                            type: MessageType.success,
                                        });
                                    })
                                    .catch((e) => {
                                        setLoading(false);
                                        NotificationManager.createToast({
                                            message: "Failed to save note",
                                            details: `Failed to save note due to an unexpected error.\nError:\n\t${e}`,
                                            type: MessageType.error,
                                        });
                                    });
                            }
                        }}
                        disabled={disabled || loading}
                    >
                        <Icon type="sync_arrow_up" />
                    </PrimaryButton>
                    <DangerButton
                        $small
                        onClick={retrieveNote}
                        disabled={disabled || loading}
                    >
                        <Icon type="sync_arrow_down" />
                    </DangerButton>
                    <GhostButton $small onClick={onClose}>
                        Close
                    </GhostButton>
                </div>
            </NoteGrid>
        </Dialog>
    );
};

export default NotePad;
