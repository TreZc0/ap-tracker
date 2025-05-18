import React, { forwardRef } from "react";

const StickySpacer = forwardRef<HTMLDivElement>((_, ref) => (
    <div
        ref={ref}
        style={{
            position: "sticky",
            bottom: "0px",
            height: "5vh",
            pointerEvents: "none",
        }}
    />
));
StickySpacer.displayName = "StickySpacer";

export default StickySpacer;
