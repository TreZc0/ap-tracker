// Builds a static tree about different areas in the game

import { EntranceManager } from "../entrances/entranceManager";

interface Group {
    checks: Set<string>;
    exits: Set<string>;
    name: string;
    adoptable: boolean;
}

interface GroupData {
    checks: string[];
    portals?: string[];
}

interface GroupManager {
    groups: Map<string, Group>;
    createNullGroup: () => Group;
    loadGroups: (data: { [x: string]: GroupData; }) => void;
}

let createGroupManager = (entranceManager: EntranceManager): GroupManager => {
    let groups: Map<string, Group> = new Map();

    let checkToGroup: Map<string, string> = new Map();

    let loadGroup = (groupName: string, groupData: GroupData): Group => {
        let checks: Set<string> = new Set();
        let exits: Set<string> = new Set();
        let adoptable = false;

        for (let check of groupData.checks) {
            checks.add(check);
            // entranceManager
            //     .getEntrancesInRegion(region)
            //     .forEach((entrance) => exits.add(entrance));
            if (checkToGroup.has(check)) {
                // console.warn(
                //     `${check} is in more than one section: ${checkToGroup.get(
                //         check
                //     )} and ${groupName}`
                // );
            }
            checkToGroup.set(check, groupName);
        }
        return {
            get checks() {
                return checks;
            },
            get exits() {
                return exits;
            },
            get adoptable() {
                return adoptable;
            },
            get name() {
                return groupName;
            },
        };
    };

    /**
     * Used to create a warning and not crash, do not use unless in an error state
     * @returns
     */
    let createNullGroup = (): Group => {
        let checks: Set<string> = new Set();
        let exits: Set<string> = new Set();
        console.warn("Null Group created");
        return {
            get checks() {
                return checks;
            },
            get exits() {
                return exits;
            },
            get adoptable() {
                return false;
            },
            get name() {
                return "<Group Not Found>";
            },
        };
    };


    const loadGroups = (data: { [s: string]: GroupData; }) => {
        for (let key of Object.getOwnPropertyNames(data)) {
            groups.set(key, loadGroup(key, data[key]));
        }
    };
    return { groups, loadGroups, createNullGroup };
};

export { createGroupManager };
export type {GroupManager, GroupData};
