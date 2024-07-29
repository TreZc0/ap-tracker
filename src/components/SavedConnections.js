import React from "react";
import styled from "styled-components";
import { PrimaryButton, SecondaryButton } from "./buttons";

const Container = styled.div`
    display: grid;
    align-items: end;
    justify-items: center;
    row-gap: 0.25em;
    width: fit-content;
    padding: 1em 2em;
    grid-template-rows: 2.5em 10em 4em;
`;

const SavedConnections = ({ ...props }) => {
    return (
        <Container {...props}>
            <h2>Saved Connections</h2>
            <span>Placeholder</span>
            <span>
                <PrimaryButton>Connect</PrimaryButton>
                <SecondaryButton>Edit</SecondaryButton>
            </span>
        </Container>
    );
};

export default SavedConnections;
