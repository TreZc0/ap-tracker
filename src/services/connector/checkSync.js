// @ts-check
// syncs checks with check manager

/**
 * @param {import("archipelago.js").Client } client
 * @param {import("archipelago.js").Hint} hint
 */
let hintToText = (client, hint) => {
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

/**
 *
 * @param {import("archipelago.js").Client} client
 * @param {import("archipelago.js").Hint} hint
 * @param {import("../tags/tagManager").TagManager} tagManager
 * @param {string} saveId
 */
let addHint = (client, hint, tagManager, saveId) => {
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

/**
 *
 * @param {import("archipelago.js").Client} client
 * @param {import("../checks/checkManager").CheckManager} checkManager
 */
const setAPLocations = (client, checkManager) => {
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
/**
 *
 * @param {import("archipelago.js").Client} client
 * @param {import("../checks/checkManager").CheckManager} checkManager
 * @param {import("../tags/tagManager").TagManager} tagManager
 * @param {{slotInfo:{connectionId: string}}} connection
 */
const setupAPCheckSync = (client, checkManager, tagManager, connection) => {
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
