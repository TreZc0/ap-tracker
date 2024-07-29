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
};

export { setAPLocations, setupAPCheckSync };
