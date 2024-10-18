// @ts-check
import React, { useContext, useState, useSyncExternalStore } from "react";
import ServiceContext from "../../contexts/serviceContext";
const CheckView = ({ check }) => {
    const [showDetails, setShowDetails] = useState(false);
    const serviceContext = useContext(ServiceContext);
    const checkManager = serviceContext.checkManager;
    if (!checkManager){
        throw new Error("No check manager provided");
    }
    const status = useSyncExternalStore(
        checkManager.getSubscriberCallback(check),
        () => checkManager.getCheckStatus(check),
        () => checkManager.getCheckStatus(check)
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
