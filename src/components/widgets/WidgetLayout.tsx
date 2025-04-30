import React from "react";
import EvenGrid from "../EvenGrid";

type CustomLayoutParams = {
    rows: number;
    columns: number;
    children?: React.ReactNode;
}

const CustomLayout = ( {rows, columns, children}: CustomLayoutParams) => {

    return <EvenGrid rows={rows} columns={columns}>{children}</EvenGrid>
}

export default CustomLayout;