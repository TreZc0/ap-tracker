// @ts-check
import { createContext } from "react";

interface SlotData {
    host?: string;
    port?: string;
    slotName?: string;
    game?: string;
    password?: string;
    alias?: string;
    seedHash?: string;
    lastPlayed?: number;
    created?: number;
    uuid?: number;
}

interface _TrackerStateContext {
    connectionStatus: string;
    slotData?: SlotData;
}

const TrackerStateContext: React.Context<_TrackerStateContext> = createContext({
    connectionStatus: "Disconnected",
});


export {
    TrackerStateContext,
};
