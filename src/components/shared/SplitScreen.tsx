// @ts-check
import React from "react";
import styled from "styled-components";

const SplitContainer = styled.div<{$weights: number[]}>`
    display: grid;
    grid:
        "s1" ${props => props.$weights[0] ?? 1}fr
        "s2" ${props => props.$weights[1] ?? 1}fr
        / 100%;

    @media only screen and (orientation: landscape) {
        & {
            grid:
                "s1 s2" 100%
                / ${props => props.$weights[0] ?? 1}fr ${props => props.$weights[1] ?? 1}fr;
        }
    }
`;
const ScreenContainer = styled.div`
    display: flex;
    overflow: auto;
    justify-content: center;
    align-content: center;
`
/**
 * Divides the screen into 2 halves, horizontally or vertically depending on orientation
 * @returns
 */
const SplitScreen = ({
    screens,
    style = {},
    className = "",
}: {
    screens: { key: string; content: React.ReactNode, weight?: number }[];
    style?: React.CSSProperties;
    className?: string;
}) => {
    return (
        <SplitContainer className={className} style={style} $weights={[
            screens[0].weight ?? 1, screens[1].weight ?? 1
        ]}>
            <ScreenContainer
                style={{
                    gridArea: "s1",
                }}
            >
                {screens[0].content}
            </ScreenContainer>
            <ScreenContainer
                style={{
                    gridArea: "s2",
                }}
            >
                {screens[1].content}
            </ScreenContainer>
        </SplitContainer>
    );
};

export default SplitScreen;
