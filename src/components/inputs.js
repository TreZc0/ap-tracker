// @ts-check
import React, { forwardRef } from "react";
import { background, tertiary, textPrimary } from "../constants/colors";

/** @type {React.ForwardedRef<*>} */
const Input = forwardRef(({ label, style, ...props }, ref) => {
    return (
        <>
            <div
                style={{ ...style, display: "inline-block", textAlign: "left" }}
            >
                {label && (
                    <label
                        style={{
                            fontSize: "0.75em",
                            marginLeft: "0.5em",
                            marginBottom: "0px",
                        }}
                    >
                        {label}
                    </label>
                )}
                <br />
                <input
                    ref={ref}
                    {...props}
                    className="interactive"
                    style={{
                        backgroundColor: background,
                        color: textPrimary,
                        border: `1px solid ${tertiary}`,
                    }}
                />
            </div>
        </>
    );
});

/** @type {React.FC<{label:String}>} */
const Checkbox = forwardRef(({ label, ...props }, ref) => {
    return (
        <>
            <div style={{ display: "inline-block", textAlign: "left" }}>
                <input ref={ref} type="checkbox" {...props} />
                {label && (
                    <label
                        style={{
                            fontSize: "0.75em",
                            marginLeft: "0.5em",
                            marginBottom: "0px",
                        }}
                    >
                        {label}
                    </label>
                )}
            </div>
        </>
    );
});

export { Input, Checkbox };
