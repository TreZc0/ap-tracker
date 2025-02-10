// @ts-check
import styled from "styled-components";
import {
    filledTextPrimary,
    primary,
    secondary,
    danger,
} from "../constants/colors";

const BaseButton = styled.button.attrs({ className: "interactive" })`
    border: none;
    padding: 0.5rem
        ${(props) =>
            // @ts-ignore
            props.$small ? "0.5rem" : "1.5rem"};
    margin: 0.25rem 0.75rem;
    font-size: 1em;
    background-color: transparent;
`;

const PrimaryButton = styled(BaseButton)`
    color: ${filledTextPrimary};
    background-color: ${primary};
`;

const DangerButton = styled(BaseButton)`
    color: ${filledTextPrimary};
    background-color: ${danger};
`;

const SecondaryButton = styled(BaseButton)`
    color: ${filledTextPrimary};
    background-color: ${secondary};
`;

const GhostButton = styled(BaseButton)`
    color: ${primary};
`;

export { PrimaryButton, DangerButton, SecondaryButton, GhostButton };
