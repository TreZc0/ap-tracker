import { useSyncExternalStore } from "react";
import { InventoryManager } from "../services/inventory/inventoryManager";

const useInventoryItems = (inventoryManger: InventoryManager) => {
    return useSyncExternalStore(
        inventoryManger.getSubscriberCallback(),
        inventoryManger.getItems,
        inventoryManger.getItems
    )
}

export { useInventoryItems }