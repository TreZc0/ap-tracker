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
            disabled,
            onChange,
            ...props
        }: {
            label: string;
            checked: boolean;
            disabled?: boolean;
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
                        disabled={disabled}
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
                                opacity: disabled ? "0.7" : "1",
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

const FileInput = forwardRef(
    (
        {
            label,
            style,
            className,
            renderAsDrop,
            ...props
        }: {
            label?: string;
            style?: React.CSSProperties;
            renderAsDrop?: boolean;
            className?: string;
        } & ComponentProps<"input">,
        ref: React.ForwardedRef<HTMLInputElement>
    ) => {
        return <div>
            <label htmlFor={props.id}>{label}</label>
            <br/>
            <input type="file" ref={ref} {...props} style={renderAsDrop ? {display:'none'} : style} className={renderAsDrop ? "" : "interactive " + className}/>
            {renderAsDrop && <div onDrop={(e)=>{
                e.preventDefault();
                if(e.dataTransfer.items){
                    console.log("items");
                }else{
                    console.log("files");
                }
            }}
            onDragOver={(e) => {
                e.preventDefault();
            }}
            >
                Drag and drop file here.
                </div>}
        </div>;
    }
);

FileInput.displayName = "FileInput";

export { Input, Checkbox, FileInput };
