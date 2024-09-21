// @ts-check
// import './App.css';
import React, { useSyncExternalStore } from "react";
import MainHeader from "./components/MainHeader";
import StartScreen from "./components/StartScreen";
import { TrackerStateContext } from "./contexts/contexts";
import { connection } from "./services/connector/connector";
import styled from "styled-components";
import { CONNECTION_STATUS } from "./services/connector/connector";
// import OptionsScreen from "./components/OptionsScreen";
import SectionView from "./components/sectionComponents/SectionView";
import { resetEntranceTable } from "./services/entrances/entranceManager";

const AppScreen = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    display: grid;

    grid-template-rows: auto 1fr;
    grid-template-columns: auto;
`;

resetEntranceTable();

function App() {
    const trackerConnectionState = useSyncExternalStore(
        connection.subscribe,
        () => connection.status,
        () => connection.status
    );

    return (
        <div className="App">
            <AppScreen>
                <TrackerStateContext.Provider
                    value={{
                        connectionStatus: trackerConnectionState,
                    }}
                >

                        <MainHeader />
                        {new Set([
                            CONNECTION_STATUS.disconnected,
                            CONNECTION_STATUS.connecting,
                        ]).has(trackerConnectionState) && <StartScreen />}
                        {CONNECTION_STATUS.connected === trackerConnectionState && (
                            <SectionView name="root" context={{}} />
                        )}
                        {/* {<OptionsScreen />} */}

                </TrackerStateContext.Provider>
            </AppScreen>
        </div>
    );
}

export default App;
