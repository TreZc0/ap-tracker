import React from "react";
import EvenGrid from "../EvenGrid";

type CustomLayoutParams = {
    splitMode: "both" | "vertical" | "horizontal" | "none";
    children?: React.ReactNode;
}

const WidgetLayout = ( {splitMode, children}: CustomLayoutParams) => {
    const rows = (splitMode === "both" || splitMode === "horizontal") ? 2 : 1;
    const columns = (splitMode === "both" || splitMode === "vertical") ? 2 : 1;
    return <EvenGrid style={{height:"100%", width:"100%", overflow:"auto"}} rows={rows} columns={columns}>{children}</EvenGrid>

}

export default WidgetLayout;