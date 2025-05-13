import React, { useContext } from "react";
import SectionView from "./sectionComponents/SectionView";
import InventoryView from "./inventoryComponents/InventoryView";
import StickySpacer from "./shared/StickySpacer";
import ServiceContext from "../contexts/serviceContext";
import useOption from "../hooks/optionHook";
import TextClient from "./textClient/TextClient";
import Flex from "./Flex";

const TrackerScreen = () => {
    const services = useContext(ServiceContext);
    const showTextClient = true; //useOption(services.optionManager, "showTextClient", "global") as boolean;
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
    const clientAndList = <Flex direction="column" child1={checklist} child2={<TextClient/>}/>;
    return <Flex direction="row" style={{width: "100%", height:"100%"}} startRatio={0.25} child1={inventory} child2={clientAndList}/>;
};

export default TrackerScreen;
