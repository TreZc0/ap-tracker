import { useSyncExternalStore } from "react";
import TextClientManager from "../services/textClientManager";

const useTextClientMessages = (textClientManager: TextClientManager) => {
    return useSyncExternalStore(
        textClientManager.getMessageSubscriber(),
        textClientManager.getMessages,
        textClientManager.getMessages
    )
}

const useTextClientHistory = (textClientManager: TextClientManager) => {
    return useSyncExternalStore(
        textClientManager.getHistorySubscriber(),
        textClientManager.getHistory,
        textClientManager.getHistory
    )
}

export { useTextClientMessages, useTextClientHistory }