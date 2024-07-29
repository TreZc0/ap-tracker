// @ts-check
import styled from "styled-components";
import { textPrimary, primary, secondary, danger } from "../constants/colors";

const BaseButton = styled.button`
    border: none;
    border-radius: 2px;
    padding: 0.5rem 1.5rem;
    margin: 0.25rem 0.75rem;
    box-shadow: 0px 2px 4px black;
    cursor: pointer;
    font-size: 1em;
    background-color: transparent;

    &:hover {
        box-shadow: 0px 1px 4px black;
    }

    &:active {
        box-shadow: 0px 0px 4px black;
    }
`;

const PrimaryButton = styled(BaseButton)`
    color: ${textPrimary};
    background-color: ${primary};
`;

const DangerButton = styled(BaseButton)`
    color: ${textPrimary};
    background-color: ${danger};
`;

const SecondaryButton = styled(BaseButton)`
    color: ${textPrimary};
    background-color: ${secondary};
`;

const GhostButton = styled(BaseButton)`
    color: ${primary};
`;

export { PrimaryButton, DangerButton, SecondaryButton, GhostButton };
