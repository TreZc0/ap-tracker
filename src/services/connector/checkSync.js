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
 * @param {String} connectionId
 * @param {import("../tags/tagManager").TagManager} tagManager
 */
let addHint = (client, hint, connectionId, tagManager) => {
    if (hint.item.sender.slot === client.players.self.slot) {
        console.log(hintToText(client, hint));
        const tagData = tagManager.createTagData();
        tagData.checkName = hint.item.locationName;
        tagData.typeId = "hint";
        tagData.text = hintToText(client, hint);
        tagData.tagId = `hint-${hint.item.locationName}`;
        tagData.saveId = connectionId;
        tagManager.saveTag(tagData);
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
 * @param {string} connectionId
 * @param {import("../tags/tagManager").TagManager} tagManager
 */
const setupAPCheckSync = (client, checkManager, connectionId, tagManager) => {
    client.room.on("locationsChecked", (locationIds) => {
        locationIds.forEach((id) =>
            checkManager.updateCheckStatus(
                client.package.lookupLocationName(client.game, id),
                { checked: true }
            )
        );
    });

    client.items
        .on("hintsInitialized", (hints) =>
            hints.forEach((hint) =>
                addHint(client, hint, connectionId, tagManager)
            )
        )
        .on("hintReceived", (hint) =>
            addHint(client, hint, connectionId, tagManager)
        );
};

export { setAPLocations, setupAPCheckSync };
