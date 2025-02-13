// @ts-check
// import './App.css';
import React, { useState, useSyncExternalStore } from "react";
import MainHeader from "./components/MainHeader";
import StartScreen from "./components/StartScreen";
import { TrackerStateContext } from "./contexts/contexts";
import { createConnector } from "./services/connector/connector";
import styled from "styled-components";
import { CONNECTION_STATUS } from "./services/connector/connector";
import OptionsScreen from "./components/OptionsScreen";
import SectionView from "./components/sectionComponents/SectionView";
import { createEntranceManager } from "./services/entrances/entranceManager";
import { createCheckManager } from "./services/checks/checkManager";
import ServiceContext from "./contexts/serviceContext";
import { createGroupManager } from "./services/sections/groupManager";
import { createRegionManager } from "./services/regions/regionManager";
import { createSectionManager } from "./services/sections/sectionManager";
import { createTagManager } from "./services/tags/tagManager";
import { createOptionManager } from "./services/options/optionManager";
import ToastContainer from "./components/notifications/toast/toastContainer";
import { background, textPrimary } from "./constants/colors";
import useOption from "./hooks/optionHook";
import { readThemeValue } from "./services/theme/theme";

const AppScreen = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    display: grid;
    overflow: auto;
    background-color: ${background};
    justify-items: stretch;
    align-items: stretch;
    color: ${textPrimary};
    transition: background-color 0.25s ease-in-out, color 0.25s ease-in-out;
    grid-template-rows: 3em 1fr;
    grid-template-columns: auto;
`;

const checkManager = createCheckManager();
const entranceManager = createEntranceManager();
const regionManager = createRegionManager();
const optionManager = createOptionManager();
optionManager.loadScope("global");
const groupManager = createGroupManager(entranceManager);
const sectionManager = createSectionManager(
    checkManager,
    entranceManager,
    groupManager
);
const tagManager = createTagManager(checkManager);
const connector = createConnector(
    checkManager,
    entranceManager,
    regionManager,
    groupManager,
    sectionManager,
    tagManager
);
const connection = connector.connection;

function App() {
    const trackerConnectionState = useSyncExternalStore(
        connection.subscribe,
        () => connection.status,
        () => connection.status
    );
    const trackerSlotData = useSyncExternalStore(
        connection.subscribe,
        () => connection.slotInfo,
        () => connection.slotInfo
    );
    const [optionWindowOpen, setOptionWindowOpen] = useState(false);
    const themeValue = useOption(optionManager, "theme", "global");
    return (
        <div className="App" data-theme={readThemeValue(themeValue)}>
            <AppScreen data-theme={readThemeValue(themeValue)}>
                <TrackerStateContext.Provider
                    value={{
                        connectionStatus: trackerConnectionState,
                        slotData: trackerSlotData,
                    }}
                >
                    <ServiceContext.Provider
                        value={{
                            checkManager,
                            entranceManager,
                            connector,
                            groupManager,
                            sectionManager,
                            tagManager,
                            optionManager,
                        }}
                    >
                        <ToastContainer />
                        <MainHeader
                            optionsCallback={() => {
                                setOptionWindowOpen(!optionWindowOpen);
                            }}
                        />
                        {optionWindowOpen && <OptionsScreen />}
                        {!optionWindowOpen && (
                            <>
                                {new Set([
                                    CONNECTION_STATUS.disconnected,
                                    CONNECTION_STATUS.connecting,
                                ]).has(trackerConnectionState) && (
                                    <StartScreen />
                                )}
                                {CONNECTION_STATUS.connected ===
                                    trackerConnectionState && (
                                    <>
                                        <SectionView name="root" context={{}} />
                                        <div
                                            style={{
                                                position: "sticky",
                                                bottom: "0px",
                                                height: "25vh",
                                                pointerEvents: "none",
                                            }}
                                        >
                                            {/* Stainless-steel block for taking up space */}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </ServiceContext.Provider>
                </TrackerStateContext.Provider>
            </AppScreen>
        </div>
    );
}

export default App;
