// @ts-check
import React, { forwardRef, ComponentProps } from "react";
import { background, tertiary, textPrimary } from "../constants/colors";

const Input = forwardRef(
    (
        {
            label,
            style,
            ...props
        }: {
            label: string;
            style?: React.CSSProperties;
        } & ComponentProps<"input">,
        ref: React.ForwardedRef<HTMLInputElement>
    ) => {
        return (
            <>
                <div
                    style={{
                        ...style,
                        display: "inline-block",
                        textAlign: "left",
                    }}
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
    }
);
Input.displayName = "Input";

const Checkbox = forwardRef(
    (
        {
            label,
            checked,
            style,
            onChange,
            ...props
        }: {
            label: string;
            checked: boolean;
            style?: React.CSSProperties;
            onChange: React.ChangeEventHandler<HTMLInputElement>;
        },
        ref: React.ForwardedRef<HTMLInputElement>
    ) => {
        return (
            <>
                <div
                    style={{
                        ...style,
                        display: "inline-block",
                        textAlign: "left",
                    }}
                >
                    <input
                        ref={ref}
                        type="checkbox"
                        {...props}
                        checked={checked}
                        onChange={onChange}
                    />
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
    }
);
Checkbox.displayName = "CheckBox";

export { Input, Checkbox };
