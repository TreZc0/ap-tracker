import React, { useContext } from "react";
import SplitScreen from "./shared/SplitScreen";
import SectionView from "./sectionComponents/SectionView";
import InventoryView from "./inventoryComponents/InventoryView";
import StickySpacer from "./shared/StickySpacer";
import ServiceContext from "../contexts/serviceContext";
import useOption from "../hooks/optionHook";

const TrackerScreen = () => {
    const services = useContext(ServiceContext);
    const showInventoryProg = useOption(
        services.optionManager,
        "inventory_show_prog_items",
        "global"
    );
    const showInventoryUseful = useOption(
        services.optionManager,
        "inventory_show_useful_items",
        "global"
    );
    const showInventoryNormal = useOption(
        services.optionManager,
        "inventory_show_normal_items",
        "global"
    );
    const showInventoryTrap = useOption(
        services.optionManager,
        "inventory_show_trap_items",
        "global"
    );
    const showInventory =
        (showInventoryProg ?? true) ||
        (showInventoryNormal ?? true) ||
        (showInventoryTrap ?? true) ||
        (showInventoryUseful ?? true);
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
                    weight: showInventory ? 1 : 0,
                    content: showInventory && (
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
