// @ts-check
import React from "react";
import SplitScreen from "./SplitScreen";
import NewConnection from "./NewConnection";
import SavedConnections from "./SavedConnections";

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
