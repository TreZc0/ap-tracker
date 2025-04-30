import React from "react";
import { primary, secondary } from "../../constants/colors";

type WidgetParams = {
    row: number;
    column: number;
    rowSpan: number;
    colSpan: number;
    title?: string;
    enableEdit: boolean;
    children: React.ReactNode;
};
const radius = 20;
const Circle = ({ position }: { position: "top" | "bottom" | "right" | "left" }) => {
    const style: React.CSSProperties = {
        position: "absolute",
        cursor: "pointer",
    };
    style[position] = `${-radius/2}`;
    return (
        <svg viewBox="-25 -25 50 50" style={style}>
            <circle
                stroke={primary}
                strokeOpacity={0.25}
                strokeWidth={5}
                r={radius}
                fill={secondary}
            />
        </svg>
    );
};

const WidgetWrapper = ({
    row,
    column,
    rowSpan,
    colSpan,
    title,
    enableEdit,
    children,
}: WidgetParams) => {
    return (
        <div
            style={{
                position: "relative",
                gridArea: `${row} / ${column} / span ${rowSpan} / span ${colSpan}`,
            }}
        >
            {children}
        </div>
    );
};

export default WidgetWrapper;
