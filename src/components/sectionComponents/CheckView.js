// @ts-check
import React, { useState, useSyncExternalStore } from "react";
import CheckManager from "../../services/checks/checkManager";

const CheckView = ({ check }) => {
    const [showDetails, setShowDetails] = useState(false);
    const status = useSyncExternalStore(
        CheckManager.getSubscribeCallback(check),
        () => CheckManager.getCheckStatus(check),
        () => CheckManager.getCheckStatus(check)
    );
    let classes = new Set(["section_check"]);
    if (status.checked || status.ignored) {
        classes.add("checked");
        if (status.ignored) {
            classes.add("ignored");
        }
    } else if (status.hint) {
        classes.add("hinted");
    }

    return (
        <>
            {status.exists && (
                <div
                    onClick={() => {
                        setShowDetails(!showDetails);
                    }}
                    className={[...classes].join(" ")}
                >
                    {check}
                    {showDetails && status.hint && (
                        <div className="hint">{status.hint}</div>
                    )}
                </div>
            )}
        </>
    );
};

export default CheckView;
