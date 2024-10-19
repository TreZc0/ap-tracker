// @ts-check
import React from "react";
import SplitScreen from "./SplitScreen";
import NewConnection from "./connectionComponents/NewConnection";
import SavedConnections from "./connectionComponents/SavedConnections";

const StartScreen = ({ className = "" }) => {
    return (
        <SplitScreen
            className={className}
            rows={1}
            cols={2}
            screens={[
                {
                    name: "new",
                    content: <NewConnection />,
                },
                {
                    name: "saved",
                    content: <SavedConnections />,
                },
            ]}
        />
    );
};

export default StartScreen;
