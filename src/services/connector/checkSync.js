// @ts-check
// syncs checks with check manager
import { SERVER_PACKET_TYPE } from "archipelago.js";
import CheckManager from "../checks/checkManager";

/**
 *
 * @param {import("archipelago.js").Client } client
 * @param {number} id
 * @returns
 */
let getLocationName = (client, id) => {
    return client.locations.name(client.players.game(client.data.slot), id);
};

/**
 * @param {import("archipelago.js").Client } client
 * @param {import("archipelago.js").Hint} hint
 */
let hintToText = (client, hint) => {
    let ownerString = `${client.players.alias(hint.receiving_player)}'s`;
    if (hint.receiving_player === client.data.slot) {
        ownerString = "Your";
    }
    let finderString = `${client.players.alias(hint.finding_player)}'s`;
    if (hint.finding_player === client.data.slot) {
        finderString = "your";
    }

    let itemString = client.items.name(
        client.players.game(hint.receiving_player),
        hint.item
    );

    let locationString = client.locations.name(
        client.players.game(hint.finding_player),
        hint.location
    );

    let entranceString = hint.entrance ? `(${hint.entrance})` : "";
    return `${ownerString} ${itemString} is at ${locationString} in ${finderString} world. ${entranceString}`;
};

let loadHintData = (client) => {
    for (let i = 0; i < client.hints.mine.length; i++) {
        let hint = client.hints.mine[i];
        if (hint.finding_player === client.data.slot) {
            console.log(hintToText(client, hint));
            CheckManager.updateCheckStatus(
                getLocationName(client, hint.location),
                { hint: hintToText(client, hint) }
            );
        }
    }
};

/**
 *
 * @param {import("archipelago.js").Client} client
 */
const setAPLocations = (client) => {
    CheckManager.deleteAllChecks();
    for (let i = 0; i < client.locations.missing.length; i++) {
        CheckManager.updateCheckStatus(
            getLocationName(client, client.locations.missing[i]),
            { exists: true }
        );
    }

    for (let i = 0; i < client.locations.checked.length; i++) {
        CheckManager.updateCheckStatus(
            getLocationName(client, client.locations.checked[i]),
            { exists: true, checked: true }
        );
    }
};
/**
 *
 * @param {import("archipelago.js").Client} client
 */
const setupAPCheckSync = (client) => {
    client.addListener(SERVER_PACKET_TYPE.ROOM_UPDATE, (packet) => {
        console.log("Room update: ", packet);

        if (packet.checked_locations) {
            for (let location of packet.checked_locations) {
                CheckManager.updateCheckStatus(
                    getLocationName(client, location),
                    { checked: true }
                );
            }
        }
    });

    client.addListener(SERVER_PACKET_TYPE.SET_REPLY, (packet) => {
        if (
            packet.key === `_read_hints_${client.data.team}_${client.data.slot}`
        ) {
            loadHintData(client);
        }
    });

    client.addListener(SERVER_PACKET_TYPE.RETRIEVED, (packet) => {
        for (const key in packet.keys) {
            if (key !== `_read_hints_${client.data.team}_${client.data.slot}`) {
                continue;
            }
            loadHintData(client);
        }
    });
};

export { setAPLocations, setupAPCheckSync };
