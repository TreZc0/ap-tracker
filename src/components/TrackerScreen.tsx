import React from "react";
import SplitScreen from "./shared/SplitScreen";
import SectionView from "./sectionComponents/SectionView";
import InventoryView from "./inventoryComponents/InventoryView";
import StickySpacer from "./shared/StickySpacer";

const TrackerScreen = () => {
    return (
        <SplitScreen
            style={{
                height: "100%",
                width: "100%",
                overflow: "auto",
            }}
            screens={[
                {
                    key: "inventory_view",
                    weight: 1,
                    content: (
                        <>
                            <InventoryView />
                            <StickySpacer />
                        </>
                    ),
                },
                {
                    key: "section_view",
                    weight: 3,
                    content: (
                        <div
                            style={{
                                width: "100%",
                                overflow: "auto",
                            }}
                        >
                            <SectionView name="root" context={{}} />
                            <StickySpacer />
                        </div>
                    ),
                },
            ]}
        />
    );
};

export default TrackerScreen;
