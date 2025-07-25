import React from "react";
import { background } from "../../constants/colors";

const PanelHeader = ({
    title,
    style,
    children,
}: {
    title: string;
    children?: React.ReactNode;
    style?: React.CSSProperties;
}) => {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                position: "sticky",
                top: "0px",
                height: "100%",
                width: "100%",
                padding: "0.25em",
                boxSizing: "border-box",
                boxShadow: "3px 4px 0px rgba(0, 0, 0, 0.5)",
                zIndex: "1",
                backgroundColor: background,
                ...style,
            }}
        >
            <div style={{ display: "flex", alignItems: "center" }}>
                <h3
                    style={{
                        margin: "auto 1em auto 0",
                        textOverflow: "ellipsis",
                    }}
                >
                    {title}
                </h3>
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "1em",
                    alignItems: "center",
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default PanelHeader;
