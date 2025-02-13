// @ts-check
import React, { useMemo } from "react";

const MultiScreen = ({ screens, rows = 1, cols = 1, className = "" }) => {
    const gridTemplateRows = useMemo(() => {
        let _rows = [];
        for (let i = 0; i < rows; i++) {
            _rows.push("auto");
        }
        return _rows.join(" ");
    }, [rows]);

    const gridTemplateColumns = useMemo(() => {
        let _cols = [];
        for (let i = 0; i < cols; i++) {
            _cols.push("auto");
        }
        return _cols.join(" ");
    }, [cols]);

    const divConfig = {
        display: "grid",
        gridTemplateRows,
        gridTemplateColumns,
        alignItems: "center",
        justifyItems: "center",
    };

    return (
        <div style={divConfig} className={className}>
            {screens.map(
                (
                    /** @type {{ name: React.Key; content: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }} */ screen
                ) => (
                    <div key={screen.name}>{screen.content}</div>
                )
            )}
        </div>
    );
};

export default MultiScreen;
