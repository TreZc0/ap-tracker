// @ts-check
import React from "react";
import styled from "styled-components";
import { primary, secondary, filledTextPrimary } from "../../constants/colors";

const SavedConnectionContainer = styled.div.attrs({ className: "interactive" })`
    box-sizing: border-box;
    width: 25vw;
    color: ${filledTextPrimary};
    background-color: ${(props) =>
        // @ts-ignore
        props.$selected ? primary : secondary};
    margin: 0.5rem 0.75rem;
    padding: 0.5rem;
`;

const SavedConnection = ({
    name,
    connectionId,
    playerAlias,
    slot,
    host,
    port,
    game,
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
            focused={selected.toString()}
            disabled={disabled}
            onClick={() => onClick(connectionId)}
        >
            <div>{name}</div>
            <div>
                {playerAlias} - {game}
            </div>
            <div>
                {slot}@{host}:{port}
            </div>
            <div>
                <i>
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
