// @ts-check
import React, { useContext, useSyncExternalStore } from "react";
import CheckView from "./CheckView";
import EntranceView from "./EntranceView";
import SectionManager from "../../services/sections/sectionManager";

/**
 * @typedef Condition
 * @prop {string} [option]
 * @prop {Condition} [not]
 * @prop {string} [state]
 * @prop {*} [is]
 * @prop {Condition} [and]
 * @prop {Condition} [or]
 */


/**
 *
 * @param {{name: String, context: *}} param0
 * @returns
 */
const SectionView = ({ name, context}) => {
    const section = useSyncExternalStore(
        SectionManager.getSubscriberCallback(name),
        () => SectionManager.getSectionStatus(name),
        () => SectionManager.getSectionStatus(name)
    );
    const style = {
        borderLeft: `2px dashed ${section?.theme.color ?? "Black"}`,
        paddingLeft: "1em",
    }

    const clearedCheckCount = (section?.checkReport.checked.size ?? 0) + (section?.checkReport.ignored.size ?? 0);
    const totalCheckCount = (section?.checkReport.exist.size ?? 0);
    
    return (

        <div
            style={style}
        >
            <h3>{section?.title ?? "Null Section"} <i>{clearedCheckCount}{"/"}{totalCheckCount}</i></h3>
            <div>
                {[...section?.checks.keys() ?? []].map(
                    (check) => check && !section?.checks.get(check)?.checked && <CheckView check={check} key={check} />
                )}
            </div>
            <div>
                {[...section?.checks.keys() ?? []].map(
                    (check) => check && section?.checks.get(check)?.checked && <CheckView check={check} key={check} />
                )}
            </div>
            {section?.children &&
                section.children.map(
                    (child) =>
                        child && (
                            <SectionView
                                name={child}
                                context={context}
                                key={child}
                            />
                        )
                )}
        </div>
    );
};

export default SectionView;
