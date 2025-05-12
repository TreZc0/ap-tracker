import React, { useContext } from "react";
import SectionView from "./sectionComponents/SectionView";
import InventoryView from "./inventoryComponents/InventoryView";
import StickySpacer from "./shared/StickySpacer";
import ServiceContext from "../contexts/serviceContext";
import useOption from "../hooks/optionHook";
import WidgetLayout from "./widgets/WidgetLayout";
import WidgetWrapper from "./widgets/WidgetWrapper";
import TextClient from "./textClient/TextClient";

const TrackerScreen = () => {
    const services = useContext(ServiceContext);
    const showTextClient = true; //useOption(services.optionManager, "showTextClient", "global") as boolean;
    return (
        <WidgetLayout splitMode="both">
            <WidgetWrapper row={1} rowSpan={2} column={1} colSpan={1} resizable="horizontal">
                <InventoryView />
                <StickySpacer/>
            </WidgetWrapper>
            <WidgetWrapper row={1} rowSpan={1} column={2} colSpan={showTextClient ? 1 : 2} resizable={showTextClient ? "vertical" : undefined}>
                <SectionView name="root" context={{}} />
                <StickySpacer/>
            </WidgetWrapper>
            {showTextClient && 
                <WidgetWrapper row={2} rowSpan={1} column={2} colSpan={1}>
                    <TextClient/>
                </WidgetWrapper>
            }
        </WidgetLayout>
    );
};

export default TrackerScreen;
