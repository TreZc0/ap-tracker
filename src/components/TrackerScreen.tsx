import React, { useContext, useMemo } from "react";
import SectionView from "./sectionComponents/SectionView";
import InventoryView from "./inventoryComponents/InventoryView";
import StickySpacer from "./shared/StickySpacer";
import ServiceContext from "../contexts/serviceContext";
import useOption from "../hooks/optionHook";
import TextClient from "./textClient/TextClient";
import Flex from "./LayoutUtilities/Flex";
import Tabs, { Tab } from "./LayoutUtilities/Tabs";
import { useOrientation } from "../hooks/mediaHook";

const TrackerScreen = () => {
    const services = useContext(ServiceContext);
    const showTextClient =
        useOption(services.optionManager, "showTextClient", "global") ??
        (true as boolean);
    const layoutMode = useOption(
        services.optionManager,
        "trackerLayoutMode",
        "global"
    ) as "auto" | "tab" | "flex" ?? "auto";
    const orientation = useOrientation();
    const useTabLayout =
        layoutMode === "tab" ||
        (layoutMode === "auto" && !orientation.includes("landscape"));
    const inventory = (
        <>
            <InventoryView />
            <StickySpacer />
        </>
    );
    const checklist = (
        <>
            <SectionView name="root" context={{}} />
            <StickySpacer />
        </>
    );

    const textClient = <TextClient />;
    const clientAndList = (
        <Flex direction="column" child1={checklist} child2={textClient} />
    );
    const tabs = useMemo(() => {
        const res = [
            new Tab("Locations", checklist),
            new Tab("Inventory", inventory),
        ];
        if(showTextClient){
            res.push(new Tab("Text Client", textClient));
        }
        return res;
    }, [showTextClient]);

    if (useTabLayout) {
        return <Tabs tabs={tabs} style={{ width: "100%", height: "100%" }} />;
    }
    return showTextClient ? (
        <Flex
            direction="row"
            style={{ width: "100%", height: "100%" }}
            startRatio={0.25}
            child1={inventory}
            child2={clientAndList}
        />
    ) : (
        <Flex
            direction="row"
            style={{ width: "100%", height: "100%" }}
            startRatio={0.25}
            child1={inventory}
            child2={checklist}
        />
    );
};

export default TrackerScreen;
