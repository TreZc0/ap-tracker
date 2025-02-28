import React, { useContext, useMemo } from "react";
import { useInventoryItems } from "../../hooks/inventoryHook";
import ServiceContext from "../../contexts/serviceContext";
import InventoryItemCollectionView from "./InventoryItemCollectionView";
import StickySpacer from "../shared/StickySpacer";
import { globalOptionManager } from "../../services/options/optionManager";
import useOption from "../../hooks/optionHook";
import { InventoryItemOrder } from "../optionsComponents/InventorySettings";

const InventoryView = ({}) => {
    const services = useContext(ServiceContext);
    const inventoryManager = services.inventoryManager;
    const optionManager = services.optionManager ?? globalOptionManager;
    if (!inventoryManager) {
        throw new Error(
            "Inventory manager not provided to inventory view service list"
        );
    }

    const showProgression = useOption(
        optionManager,
        "inventory_show_prog_items",
        "global"
    ) as boolean | null;
    const showUseful = useOption(
        optionManager,
        "inventory_show_useful_items",
        "global"
    ) as boolean | null;
    const showNormal = useOption(
        optionManager,
        "inventory_show_normal_items",
        "global"
    ) as boolean | null;
    const showTrap = useOption(
        optionManager,
        "inventory_show_trap_items",
        "global"
    ) as boolean | null;
    const itemOrder = useOption(
        optionManager,
        "inventory_item_order",
        "global"
    ) as InventoryItemOrder | null;
    const itemOrderDirection_desc = useOption(
        optionManager,
        "inventory_item_order_desc",
        "global"
    ) as boolean | null;

    const items = useInventoryItems(inventoryManager);
    const sortedItems = useMemo(() => {
        return items
            .filter(
                (collection) =>
                    (collection.progression && showProgression) ||
                    (collection.useful && showUseful) ||
                    (collection.trap && showTrap) ||
                    (!collection.progression &&
                        !collection.useful &&
                        !collection.trap &&
                        showNormal)
            )
            .sort((a, b) => {
                let orderValue = 1;
                switch (itemOrder) {
                    case "name": {
                        orderValue = a.name < b.name ? -1 : 1;
                        break;
                    }
                    case "count": {
                        orderValue = a.count - b.count;
                        break;
                    }
                    case "index": // fall through
                    default: {
                        orderValue = a.index - b.index;
                        break;
                    }
                }
                if (itemOrderDirection_desc) {
                    orderValue *= -1;
                }
                return orderValue;
            });
    }, [
        showProgression,
        showUseful,
        showTrap,
        showNormal,
        itemOrderDirection_desc,
        itemOrder,
        items,
    ]);
    return (
        <div style={{ width: "100%", margin: "1em" }}>
            <h2>Received Items</h2>
            {sortedItems.map((collection) => (
                <InventoryItemCollectionView
                    key={collection.id}
                    collection={collection}
                />
            ))}
            <StickySpacer />
        </div>
    );
};

export default InventoryView;
