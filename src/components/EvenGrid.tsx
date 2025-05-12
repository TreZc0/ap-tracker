import React, { ReactNode } from "react";
import styled from "styled-components";

const CellOutline = styled.div<{ $row: number; $col: number }>`
    border: 1px solid rgba(128, 128, 128, 0.5);
    border-radius: 5px;
    grid-row: ${(props) => props.$row} / span 1;
    grid-column: ${(props) => props.$col} / span 1;
    text-align: center;
`;

const EvenGrid = ({
    children,
    rows,
    columns,
    style,
    showCells,
    ...props
}: {
    children?: ReactNode;
    rows: number;
    columns: number;
    style?: React.CSSProperties;
    showCells?: boolean;
}) => {
    const row: number[] = [];
    const grid: number[][] = [];
    for (let i = 0; i < columns; i++) {
        row.push(i);
    }
    for (let i = 0; i < rows; i++) {
        grid.push(row);
    }

    return (
        <div
            style={{
                display: "grid",
                gridTemplateRows: `auto repeat(${rows-1}, 1fr)`,
                gridTemplateColumns: `auto repeat(${columns-1}, 1fr)`,
                gap:`0.5em 0.5em`,
                ...style,
            }}
            {...props}
        >
            {showCells &&
                grid.map((_row, row) =>
                    _row.map((col) => (
                        <CellOutline
                            $row={row + 1}
                            $col={col + 1}
                            key={`${row + 1},${col + 1}`}
                        >{`${row + 1},${col + 1}`}</CellOutline>
                    ))
                )}
            {children}
        </div>
    );
};

export default EvenGrid;
