// @ts-check
import React from "react";
import SplitScreen from "./shared/SplitScreen";
import NewConnection from "./connectionComponents/NewConnection";
import SavedConnections from "./connectionComponents/SavedConnections";

const StartScreen = ({ className = "" }: { className?: string }) => {
    return (
        <SplitScreen
            className={className}
            style={{
                width: "100%",
                height: "100%",
                overflow: "auto",
            }}
            screens={[
                {
                    key: "new",
                    content: <NewConnection />,
                },
                {
                    key: "saved",
                    content: <SavedConnections />,
                },
            ]}
        />
    );
};

export default StartScreen;
