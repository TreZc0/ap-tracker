import React, { useContext } from "react";
import ServiceContext from "../../contexts/serviceContext";
import useOption from "../../hooks/optionHook";
import TrackerPicker from "./TrackerPicker";
import CustomTrackerOptions from "./CustomTrackerOptions";
import OptionBlock from "./OptionBlock";
import StickySpacer from "../shared/StickySpacer";
import ChecklistSettings from "./ChecklistSettings";
import ThemeOptions from "./ThemeOptions";

const OptionsScreen = () => {
    const serviceContext = useContext(ServiceContext);
    const optionManager = serviceContext.optionManager;
    if (!optionManager) {
        throw new Error(
            "No option manager provided for option screen, you should be worried"
        );
    }

    return (
        <>
            <OptionBlock title="Theme Settings">
                <ThemeOptions optionManager={optionManager} />
            </OptionBlock>
            <OptionBlock title="Checklist Settings">
                <ChecklistSettings optionManager={optionManager} />
            </OptionBlock>
            <OptionBlock title="Tracker Picker">
                <TrackerPicker />
            </OptionBlock>
            <OptionBlock title="Custom Tracker Manager">
                <CustomTrackerOptions />
            </OptionBlock>
            <StickySpacer />
        </>
    );
};

export default OptionsScreen;
