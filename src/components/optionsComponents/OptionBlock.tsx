import React from "react";
const OptionBlock = ({ title, children, ...props }) => {
    return (
        <div>
            <h3>{title}</h3>
            {children}
            <hr/>
        </div>
    );
};

export default OptionBlock;
