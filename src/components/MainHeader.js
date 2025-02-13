// @ts-check
import React, { useContext } from "react";
import { TrackerStateContext } from "../contexts/contexts";
import { SecondaryButton } from "./buttons";
import Icon from "./icons/icons";
import { background } from "../constants/colors";

const MainHeader = ({ optionsCallback, ...props }) => {
    const trackerState = useContext(TrackerStateContext);
    const slot = trackerState.slotData;

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1rem",
                position: "sticky",
                top: "0px",
                boxShadow: "3px 4px 0px rgba(0, 0, 0, 0.5)",
                backgroundColor: background,
            }}
        >
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
                <Icon type="settings" />
            </SecondaryButton>
        </div>
    );
};

export default MainHeader;
