import React from "react";

type WidgetParams = {
    row: number;
    column: number;
    rowSpan: number;
    colSpan: number;
    resizable?: "horizontal" | "vertical" | "both";
    title?: string;
    enableEdit?: boolean;
    children: React.ReactNode;
};

const WidgetWrapper = ({
    row,
    column,
    rowSpan,
    colSpan,
    children,
    resizable,
}: WidgetParams) => {
    return (
        <div
            style={{
                position: "relative",
                gridArea: `${row} / ${column} / span ${rowSpan} / span ${colSpan}`,
                overflow: "auto",
                boxShadow: "3px 4px 0px rgba(0, 0, 0, 0.5)",
                resize: resizable,
                maxWidth: "90vw",
                minWidth: "10vw",
                maxHeight: "95vh",
                minHeight: "5vh",
            }}
        >
            {children}
        </div>
    );
};

export default WidgetWrapper;
