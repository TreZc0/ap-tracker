import React from "react";
import styled from "styled-components";
import { primary, secondary, filledTextPrimary } from "../../constants/colors";

const SavedConnectionContainer = styled.div.attrs({ className: "interactive" })<{
    $selected?: boolean;
}>`
    box-sizing: border-box;
    width: 80%;
    justify-self:center;
    color: ${filledTextPrimary};
    background-color: ${(props) =>
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
            $selected={selected}
            data-focused={selected.toString()}
            data-disabled={disabled.toString()}
            onClick={() => onClick(connectionId)}
        >
            <div>{name}</div>
            <div>
                {game}
            </div>
            <div>
                {slot} {host}:{port}
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
