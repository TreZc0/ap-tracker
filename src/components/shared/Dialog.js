// @ts-check
import styled from "styled-components";

const Dialog = styled.dialog`
    position: fixed;
    padding: 2rem;
    background-color: white;
    border: 0px solid black;
    pointer-events: all;
    box-shadow: 4px 8px 0px rgba(128, 128, 128, 0.5);
    &::backdrop {
        background: rgba(0, 0, 0, 0.7);
    }
`;

export default Dialog;