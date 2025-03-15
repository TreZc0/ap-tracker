import React, { useRef, useEffect, useState, useCallback } from "react";
import { PrimaryButton, GhostButton, SecondaryButton } from "./buttons";
import styled from "styled-components";
import { background, danger, textPrimary } from "../constants/colors";
import { saveNote, loadNote } from "../services/connector/remoteSync";
import NotificationManager, {
    MessageType,
} from "../services/notifications/notifications";
import Spinner from "./icons/spinner";
import Modal from "./shared/Modal";
const NoteGrid = styled.div`
    display: grid;
    width: 80vw;
    height: 80vh;
    grid:
        "title" 8em
        "note" 1fr
        "." 1em
        "buttons" 3em / 100%;
`;

const MAX_NOTE_LENGTH = 1024;

const NotePad = ({
    open,
    onClose,
    disabled,
    ...props
}: {
    open: boolean;
    onClose: () => void;
    disabled: boolean;
}) => {
    let textArea = useRef(null);
    let [noteContent, setNoteContent] = useState("");
    let [loading, setLoading] = useState(false);
    let [unsavedChanges, setUnsavedChanges] = useState(false);
    let [initialLoad, setInitialLoad] = useState(false);

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
                    duration: 4,
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

    const storeNote = useCallback(() => {
        if (!loading && noteContent.length <= MAX_NOTE_LENGTH) {
            let statusHandle = NotificationManager.createStatus({
                message: "Uploading note...",
                type: MessageType.progress,
            });
            setLoading(true);
            saveNote(noteContent)
                .then(() => {
                    setLoading(false);
                    setUnsavedChanges(false);
                    statusHandle.update({
                        message: "Note Saved",
                        type: MessageType.success,
                        duration: 4,
                        progress: 1,
                    });
                })
                .catch((e) => {
                    setLoading(false);
                    statusHandle.update({
                        message: "Failed to save note",
                        type: MessageType.error,
                        duration: 4,
                        progress: 0,
                    });
                    NotificationManager.createToast({
                        message: "Failed to save note",
                        details: `Failed to save note due to an unexpected error.\nError:\n\t${e}`,
                        type: MessageType.error,
                    });
                });
        }
    }, [loading, noteContent]);

    useEffect(() => {
        if (noteContent === "" && !disabled && !loading && !initialLoad) {
            setInitialLoad(true);
            retrieveNote();
        }
    }, [disabled, noteContent, retrieveNote, loading, initialLoad]);
    return (
        <Modal open={open}>
            <NoteGrid>
                <div style={{ gridArea: "title" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "1em",
                        }}
                    >
                        <h3>AP Notepad (experimental)</h3>
                        <span>
                            {loading ? (
                                <Spinner />
                            ) : unsavedChanges ? (
                                " Not saved"
                            ) : (
                                ""
                            )}
                        </span>
                    </div>
                    <span>
                        Save notes in server storage. This note can be seen and
                        modified by anyone with access to the Archipelago
                        server.
                    </span>
                </div>

                <textarea
                    style={{
                        gridArea: "note",
                        backgroundColor: background,
                        color: textPrimary,
                        resize: "none",
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
                                setNoteContent(textArea.current.value);
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
                        display: "grid",
                        gridArea: "buttons",
                        width: "100%",
                        gridTemplateColumns: "1fr 1fr",
                    }}
                >
                    <div
                        style={{
                            gridColumn: "1",
                            gridRow: "1",
                            color:
                                noteContent.length > MAX_NOTE_LENGTH
                                    ? danger
                                    : textPrimary,
                        }}
                    >
                        {noteContent.length} / {MAX_NOTE_LENGTH}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "right",
                            gridColumn: "2",
                            gridRow: "1",
                        }}
                    >
                        <PrimaryButton
                            $small
                            onClick={storeNote}
                            disabled={
                                disabled ||
                                loading ||
                                noteContent.length > MAX_NOTE_LENGTH
                            }
                        >
                            Save to Server
                        </PrimaryButton>
                        <SecondaryButton
                            $small
                            onClick={retrieveNote}
                            disabled={disabled || loading}
                        >
                            Load from Server
                        </SecondaryButton>
                        <GhostButton
                            $small
                            onClick={onClose}
                        >
                            Close
                        </GhostButton>
                    </div>
                </div>
            </NoteGrid>
        </Modal>
    );
};

export default NotePad;
