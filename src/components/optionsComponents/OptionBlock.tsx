import React from "react";
import { textPrimary } from "../../constants/colors";
const OptionBlock = ({ title, children, } : {title: string, children: React.ReactNode}) => {
    return (
        <div
            style={{
                padding: "0em 1em 2em 1em",
                margin: "0em 1em",
                borderBottom: `2px solid ${textPrimary}`,
            }}
        >
            <h2>{title}</h2>
            <div
                style={{
                    marginLeft: "1em",
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default OptionBlock;
