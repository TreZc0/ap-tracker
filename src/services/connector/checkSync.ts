// syncs checks with check manager

import { Client, Hint } from "archipelago.js";
import { TagManager } from "../tags/tagManager";
import { CheckManager } from "../checks/checkManager";

let hintToText = (client: Client, hint: Hint) => {
    let ownerString = `${hint.item.receiver.alias}'s`;
    if (hint.item.receiver.slot === client.players.self.slot) {
        ownerString = "Your";
    }
    let finderString = `${hint.item.sender.alias}'s`;
    if (hint.item.sender.slot === client.players.self.slot) {
        finderString = "your";
    }

    let entranceString =
        hint.entrance !== "Vanilla" ? `(${hint.entrance})` : "";
    return `${ownerString} ${hint.item.name} is at ${hint.item.locationName} in ${finderString} world. ${entranceString}`;
};

let addHint = (client: Client, hint: Hint, tagManager: TagManager, saveId: string) => {
    if (hint.item.sender.slot === client.players.self.slot) {
        // console.log(hintToText(client, hint));
        const tagData = tagManager.createTagData();
        tagData.checkName = hint.item.locationName;
        tagData.typeId = "hint";
        tagData.text = hintToText(client, hint);
        tagData.tagId = `hint-${hint.item.locationName}`;
        tagManager.addTag(tagData, saveId);
    }
};

const setAPLocations = (client: Client, checkManager: CheckManager) => {
    checkManager.deleteAllChecks();
    client.room.allLocations.forEach((locationId) =>
        checkManager.updateCheckStatus(
            client.package.lookupLocationName(client.game, locationId),
            { exists: true }
        )
    );
    client.room.checkedLocations.forEach((locationId) =>
        checkManager.updateCheckStatus(
            client.package.lookupLocationName(client.game, locationId),
            { checked: true }
        )
    );
};

const setupAPCheckSync = (client: Client, checkManager: CheckManager, tagManager: TagManager, connection: { slotInfo: { connectionId: string; }; }) => {
    client.room.on("locationsChecked", (locationIds) => {
        locationIds.forEach((id) =>
            checkManager.updateCheckStatus(
                client.package.lookupLocationName(client.game, id),
                { checked: true, id }
            )
        );
    });

    client.items
        .on("hintsInitialized", (hints) =>
            hints.forEach((hint) =>
                addHint(
                    client,
                    hint,
                    tagManager,
                    connection.slotInfo.connectionId
                )
            )
        )
        .on("hintReceived", (hint) =>
            addHint(client, hint, tagManager, connection.slotInfo.connectionId)
        );
};

export { setAPLocations, setupAPCheckSync };
