// @ts-check
import React, { useContext } from "react";
import { TrackerStateContext } from "../contexts/contexts";
import { SecondaryButton } from "./buttons";

const MainHeader = ({ optionsCallback, ...props }) => {
    const trackerState = useContext(TrackerStateContext);
    const slot = trackerState.slotData;

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1rem" }}>
            <div
                style={{ width: "100%", display: "flex", columnGap: "1rem" }}
                {...props}
            >
                <div>{trackerState.connectionStatus}</div>
                {slot?.alias && <div>{slot.alias}</div>}
            </div>
            <SecondaryButton
                // @ts-ignore
                $small
                onClick={optionsCallback}
            >
                Options
            </SecondaryButton>
        </div>
    );
};

export default MainHeader;
