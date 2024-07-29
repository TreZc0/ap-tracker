import { useContext } from "react";
import { SlotContext, TrackerStateContext } from "../contexts";

const MainHeader = ({ ...props }) => {
    const slot = useContext(SlotContext);
    const trackerState = useContext(TrackerStateContext);

    return (
        <div style={{ width: "100%", display: "flex" }} {...props}>
            <span>{trackerState.connectionStatus}</span>
            {slot.alias && <span>{slot.alias}</span>}
        </div>
    );
};

export default MainHeader;
