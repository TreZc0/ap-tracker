import React, { forwardRef, useContext } from "react";
import { InventoryItem } from "../../services/inventory/inventoryManager";
import { GhostButton } from "../buttons";
import Icon from "../icons/icons";
import ServiceContext from "../../contexts/serviceContext";
import {
    progressionItem,
    trapItem,
    normalItem,
    usefulItem,
    textClient,
} from "../../constants/colors";

const InventoryItemView = forwardRef(
    (
        { item }: { item: InventoryItem },
        ref: React.ForwardedRef<HTMLDivElement>
    ) => {
        const services = useContext(ServiceContext);
        const locationManager = services.locationManager;
        const tagManager = services.tagManager;
        const connection = services.connector.connection;
        let color = normalItem;
        if (item.progression) {
            color = progressionItem;
        } else if (item.useful) {
            color = usefulItem;
        } else if (item.trap) {
            color = trapItem;
        } else if (item.sender === "Archipelago") {
            color = textClient.yellow;
        }
        return (
            <div
                style={{
                    color,
                }}
                ref={ref}
            >
                <div
                    style={{
                        marginLeft: "1em",
                    }}
                >
                    {item.location} ({item.sender})
                    {item.local && locationManager && tagManager && (
                        <GhostButton
                            onClick={(event) => {
                                const location = item.location;
                                const status =
                                    locationManager.getLocationStatus(location);
                                event.stopPropagation();
                                let found = false;
                                status.tags?.forEach((tag) => {
                                    if (tag.tagId === `${location}-star`) {
                                        found = true;
                                    }
                                });
                                if (!found) {
                                    const tagData = tagManager.createTagData();
                                    tagData.typeId = "star";
                                    tagData.checkName = location;
                                    tagData.tagId = `${location}-star`;
                                    tagManager.addTag(
                                        tagData,
                                        connection.slotInfo.connectionId
                                    );
                                } else if (found) {
                                    const starTag = tagManager.createTagData();
                                    starTag.typeId = "star";
                                    starTag.checkName = location;
                                    starTag.tagId = `${location}-star`;
                                    tagManager.removeTag(
                                        starTag,
                                        connection.slotInfo.connectionId
                                    );
                                }
                            }}
                            $tiny
                        >
                            <Icon fontSize="12pt" type={"star"} />
                        </GhostButton>
                    )}
                </div>
            </div>
        );
    }
);

InventoryItemView.displayName = "InventoryItemView";

export default InventoryItemView;
