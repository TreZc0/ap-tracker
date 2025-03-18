import React from "react";

const ButtonRow = ({ children }: { children: React.ReactNode }) => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                marginTop: "1em",
            }}
        >
            {children}
        </div>
    );
};

export default ButtonRow;
