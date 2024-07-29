// @ts-check
import React from "react";
import { sections } from "../../services/sections/section";
import CheckView from "./CheckView";

/**
 *
 * @param {{sectionConfig: import("../../services/sections/sectionConfig").SectionConfig}} param0
 * @returns
 */
const SectionView = ({ sectionConfig }) => {
    /** @type {Set<String>} */
    let checks = new Set();
    if (sectionConfig.type === "section") {
        checks = sections?.get(sectionConfig.name)?.checks ?? new Set();
    }
    return (
        <div
            style={{
                borderLeft: `2px dashed ${sectionConfig.borderColor}`,
                paddingLeft: "1em",
            }}
        >
            <h3>{sectionConfig.display}</h3>
            <div>
                {[...checks.values()].map(
                    (check) => check && <CheckView check={check} key={check} />
                )}
            </div>
            {sectionConfig.children &&
                sectionConfig.children.map(
                    (child) =>
                        child && (
                            <SectionView
                                sectionConfig={child}
                                key={child.name}
                            />
                        )
                )}
        </div>
    );
};

export default SectionView;
