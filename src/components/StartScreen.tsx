// @ts-check
import React from "react";
import SplitScreen from "./shared/SplitScreen";
import NewConnection from "./connectionComponents/NewConnection";
import SavedConnections from "./connectionComponents/SavedConnections";
import EvenGrid from "./EvenGrid";

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
                    // content: <SavedConnections />,
                    content: <EvenGrid style={{width:"100%"}} rows={6} columns={6} showCells>
                        <div style={{gridArea:"2 / 3 / span 3 / span 4"}}><SavedConnections/></div>
                    </EvenGrid>
                },
            ]}
        />
    );
};

export default StartScreen;
