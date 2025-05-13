import { useSyncExternalStore } from "react";
import TextClientManager from "../services/textClientManager";

const useTextClientMessages = (textClientManager: TextClientManager) => {
    return useSyncExternalStore(
        textClientManager.getMessageSubscriber(),
        textClientManager.getMessages,
        textClientManager.getMessages
    )
}

export { useTextClientMessages }