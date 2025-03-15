import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { Input } from "../inputs";
import { PrimaryButton, SecondaryButton, DangerButton } from "../buttons";
import SavedConnectionManager from "../../services/savedConnections/savedConnectionManager";
import Dialog from "../shared/Dialog";

const ContentContainer = styled.div`
    width: fit-content;
    display: grid;
    align-items: end;
    justify-items: center;
    row-gap: 0.25em;
    grid-template-areas:
        "title title title"
        "name name name"
        "host host host"
        "port port port"
        "game game game"
        "slot slot slot"
        "password password password"
        "save close delete";
    grid-template-rows: repeat(7, 2.5em) 4em;
    grid-template-columns: repeat(3, 5em);
`;

const EditConnectionDialog = ({ connection, onClose, open, ...props }) => {
    const dialog: React.ForwardedRef<HTMLDialogElement | null> = useRef(null);
    const [data, setData] = useState(connection);
    useEffect(() => {
        if (open) {
            dialog.current?.showModal();
            setData(connection);
        } else {
            dialog.current?.close();
        }
    }, [open, connection]);
    const defaultChangeHandler = (event) => {
        setData({
            ...data,
            [event.target.name]: event.target.value,
        });
    };
    return (
        <Dialog ref={dialog}>
            <ContentContainer>
                <h2 style={{ gridArea: "title" }}>Edit Connection</h2>
                <Input
                    style={{ gridArea: "name" }}
                    type="text"
                    name="name"
                    value={data?.name ?? ""}
                    onChange={defaultChangeHandler}
                    label="Name"
                />
                <Input
                    style={{ gridArea: "host" }}
                    type="text"
                    name="host"
                    value={data?.host ?? ""}
                    onChange={defaultChangeHandler}
                    label="Host"
                />
                <Input
                    style={{ gridArea: "port" }}
                    type="text"
                    name="port"
                    value={data?.port ?? ""}
                    onChange={defaultChangeHandler}
                    label="Port"
                />
                <Input
                    style={{ gridArea: "game" }}
                    type="text"
                    name="game"
                    value={data?.game ?? ""}
                    onChange={defaultChangeHandler}
                    label="Game"
                    disabled
                />
                <Input
                    style={{ gridArea: "slot" }}
                    type="text"
                    name="slot"
                    value={data?.slot ?? ""}
                    onChange={defaultChangeHandler}
                    label="Slot"
                    disabled
                />
                <Input
                    style={{ gridArea: "password" }}
                    type="text"
                    name="password"
                    value={data?.password ?? ""}
                    onChange={defaultChangeHandler}
                    label="Password"
                />
                <PrimaryButton
                    style={{ gridArea: "save" }}
                    $small
                    onClick={() => {
                        SavedConnectionManager.saveConnectionData(data);
                        onClose();
                    }}
                >
                    Save
                </PrimaryButton>
                <SecondaryButton
                    $small
                    style={{ gridArea: "close" }}
                    onClick={onClose}
                >
                    Close
                </SecondaryButton>
                <DangerButton
                    $small
                    style={{ gridArea: "delete" }}
                    onClick={() => {
                        if (
                            window.confirm(
                                `Are you sure you want to delete ${data?.name}`
                            )
                        ) {
                            SavedConnectionManager.deleteConnection(
                                data.connectionId
                            );
                            onClose();
                        }
                    }}
                >
                    Delete
                </DangerButton>
            </ContentContainer>
        </Dialog>
    );
};

export default EditConnectionDialog;
