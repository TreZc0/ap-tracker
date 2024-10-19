// @ts-check
import React from "react";
import styled from "styled-components";
import { primary, secondary, textPrimary } from "../../constants/colors";

const SavedConnectionContainer = styled.div`
    box-sizing: border-box;
    width: 25vw;
    color: ${textPrimary};
    cursor: pointer;
    background-color: ${(props) =>
        // @ts-ignore
        props.$selected ? primary : secondary};
    border-radius: 5px;
    margin: 0.25rem 0.75rem;
    box-shadow: 0px 2px 4px black;
    padding: 0.5rem;

    &:hover {
        box-shadow: 0px 1px 4px black;
    }

    &[disabled] {
        opacity: 0.5;
        box-shadow: 0px 0px 0px black;
    }
`;

const SavedConnection = ({
    name,
    connectionId,
    playerAlias,
    slot,
    host,
    port,
    createdTime,
    lastUsedTime,
    selected,
    onClick,
    disabled,
    ...props
}) => {
    return (
        <SavedConnectionContainer
            // @ts-ignore don't know how to jsdoc it properly
            $selected={selected}
            disabled={disabled}
            onClick={() => onClick(connectionId)}
        >
            <div>{name}</div>
            <div>{playerAlias}</div>
            <div>
                {slot}@{host}:{port}
            </div>
            <div>
                <i>
                    Created:{" "}
                    {new Date(createdTime).toLocaleTimeString([], {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </i>
            </div>
            <div>
                <i>
                    Last Used:{" "}
                    {new Date(lastUsedTime).toLocaleTimeString([], {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </i>
            </div>
        </SavedConnectionContainer>
    );
};

export default SavedConnection;
