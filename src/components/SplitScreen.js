// @ts-check
import React from "react";
import styled from "styled-components";

const SplitContainer = styled.div`
    display: grid;
    grid:
        "s1" 50%
        "s2" 50%
        / 100%;

    @media only screen and (orientation: landscape) {
        & {
            grid:
                "s1 s2" auto
                / 1fr 1fr;
        }
    }
`;
/**
 *
 * @param {Object} param0
 * @param {{key:React.Key, content: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined}[]} param0.screens
 * @param {React.CSSProperties} param0.style
 * @param {string} param0.className
 * @returns
 */
const SplitScreen = ({ screens, style, className = "" }) => {
    return (
        <SplitContainer className={className} style={style}>
            <div
                style={{
                    gridArea: "s1",
                    display: "flex",
                    justifyContent: "center",
                    alignContent: "center",
                }}
            >
                {screens[0].content}
            </div>
            <div
                style={{
                    gridArea: "s2",
                    display: "flex",
                    justifyContent: "center",
                    alignContent: "center",
                }}
            >
                {screens[1].content}
            </div>
        </SplitContainer>
    );
};

export default SplitScreen;
