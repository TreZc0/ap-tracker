import React, { useState, useSyncExternalStore } from "react";
import MainHeader from "./components/MainHeader";
import StartScreen from "./components/StartScreen";
import { TrackerStateContext } from "./contexts/contexts";
import { createConnector } from "./services/connector/connector";
import styled from "styled-components";
import { CONNECTION_STATUS } from "./services/connector/connector";
import OptionsScreen from "./components/optionsComponents/OptionsScreen";
import { createEntranceManager } from "./services/entrances/entranceManager";
import { createCheckManager } from "./services/checks/checkManager";
import ServiceContext from "./contexts/serviceContext";
import { createGroupManager } from "./services/sections/groupManager";
import { createSectionManager } from "./services/sections/sectionManager";
import { createTagManager } from "./services/tags/tagManager";
import { createInventoryManager } from "./services/inventory/inventoryManager";
import { globalOptionManager } from "./services/options/optionManager";
import NotificationContainer from "./components/notifications/notificationContainer";
import { background, textPrimary } from "./constants/colors";
import useOption from "./hooks/optionHook";
import { readThemeValue } from "./services/theme/theme";
import TrackerScreen from "./components/TrackerScreen";
import TrackerManager from "./games/TrackerManager";

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
const inventoryManager = createInventoryManager();
const entranceManager = createEntranceManager();
const optionManager = globalOptionManager;
const groupManager = createGroupManager(entranceManager);
const sectionManager = createSectionManager(
    checkManager,
    entranceManager,
    groupManager
);
const tagManager = createTagManager(checkManager);
const trackerManager = new TrackerManager(checkManager, groupManager, sectionManager);
trackerManager.loadSavedTrackerChoices();
const connector = createConnector(
    checkManager,
    inventoryManager,
    entranceManager,
    tagManager,
    trackerManager
);
const connection = connector.connection;

const App = (): React.ReactNode => {
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
    const themeValue = useOption(optionManager, "theme", "global") as
        | "light"
        | "dark"
        | "system"
        | null;
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
                            inventoryManager,
                            trackerManager,
                        }}
                    >
                        <NotificationContainer />
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
                                    trackerConnectionState && <TrackerScreen />}
                            </>
                        )}
                    </ServiceContext.Provider>
                </TrackerStateContext.Provider>
            </AppScreen>
        </div>
    );
};

export default App;
