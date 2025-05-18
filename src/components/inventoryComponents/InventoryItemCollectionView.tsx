import React, { useContext, useState } from "react";
import { InventoryItemCollection } from "../../services/inventory/inventoryManager";
import {
    normalItem,
    progressionItem,
    tertiary,
    trapItem,
    usefulItem,
} from "../../constants/colors";
import { GhostButton } from "../buttons";
import Icon from "../icons/icons";
import ServiceContext from "../../contexts/serviceContext";
import styled from "styled-components";

const CollectionContainer = styled.div<{
    $collection: InventoryItemCollection;
}>`
    cursor: pointer;
    color: ${(props) =>
        props.$collection.progression
            ? progressionItem
            : props.$collection.useful
              ? usefulItem
              : props.$collection.trap
                ? trapItem
                : normalItem};
    &:hover {
        text-decoration: underline;
    }
`;
const InventoryItemCollectionView = ({
    collection,
}: {
    collection: InventoryItemCollection;
}) => {
    const serviceContext = useContext(ServiceContext);
    const locationManager = serviceContext.locationManager;
    const tagManager = serviceContext.tagManager;
    const connection = serviceContext.connector;
    const [detailsOpen, setDetailsOpen] = useState(false);
    return (
        <div>
            <CollectionContainer
                $collection={collection}
                onClick={() => setDetailsOpen((x) => !x)}
            >
                {collection.count} - {collection.name}{" "}
                {detailsOpen ? " ▲ " : " ▼ "}
            </CollectionContainer>
            {detailsOpen && (
                <div
                    style={{
                        marginLeft: "1em",
                        fontStyle: "italic",
                        textDecoration: "none",
                        color: tertiary,
                    }}
                >
                    {collection.items.map((item) => (
                        <div key={item.index}>
                            {item.location} - {item.sender}{" "}
                            {item.local && locationManager && tagManager && (
                                <GhostButton
                                    onClick={(event) => {
                                        const location = item.location;
                                        const status =
                                            locationManager.getLocationStatus(
                                                location
                                            );
                                        event.stopPropagation();
                                        let found = false;
                                        status.tags?.forEach((tag) => {
                                            if (
                                                tag.tagId === `${location}-star`
                                            ) {
                                                found = true;
                                            }
                                        });
                                        if (!found) {
                                            const tagData =
                                                tagManager.createTagData();
                                            tagData.typeId = "star";
                                            tagData.checkName = location;
                                            tagData.tagId = `${location}-star`;
                                            tagManager.addTag(
                                                tagData,
                                                connection.connection.slotInfo
                                                    .connectionId
                                            );
                                        } else if (found) {
                                            const starTag =
                                                tagManager.createTagData();
                                            starTag.typeId = "star";
                                            starTag.checkName = location;
                                            starTag.tagId = `${location}-star`;
                                            tagManager.removeTag(
                                                starTag,
                                                connection.connection.slotInfo
                                                    .connectionId
                                            );
                                        }
                                    }}
                                    $tiny
                                >
                                    <Icon fontSize="12pt" type={"star"} />
                                </GhostButton>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InventoryItemCollectionView;
