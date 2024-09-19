// @ts-check
// @ts-check
import React, { useMemo } from "react";
import { getSectionWithRegion, sections } from "../../services/sections/groups";
import CheckView from "./CheckView";
import useEntrance from "../../hooks/entranceHook";
import { getEntranceAdoptablility } from "../../services/entrances/entranceManager";

/**
 *
 * @param {{entrance:string, style:*}} param0
 * @returns
 */
const EntranceView = ({ entrance, style }) => {
    const entranceDest = useEntrance(entrance);
    const checks = useMemo(
        () => {
            const adoptable = getEntranceAdoptablility(entrance);
            if(adoptable){
                return sections.get(getSectionWithRegion(entranceDest) ?? "")?.checks ?? new Set();
            }
            return new Set();
        }, [entranceDest, entrance]
    )
    return (
        <div
            style={style}
        >
            <h3>{`${entrance} => ${entranceDest ?? "???"}`}</h3>
            <div>
                {[...checks.values()].map(
                    (check) => check && <CheckView check={check} key={check} />
                )}
            </div>
        </div>
    );
};

export default EntranceView;
