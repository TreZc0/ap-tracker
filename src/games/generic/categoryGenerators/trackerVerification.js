// @ts-check
/**
 * Performs validation checks on section and group data provided.
 * @param {import("../../../services/sections/sectionManager").SectionConfigData} sectionData
 * @param {Object<string, import("../../../services/sections/groupManager").GroupData>} groupData
 * @param {import("../../../services/checks/checkManager").CheckManager} [checkManager] If not provided, no validation can be done on checks
 */
const verifyTrackerConfig = (sectionData, groupData, checkManager) => {
    const errors = [];
    // Do verification
    let remainingChecks = checkManager?.getAllExistingChecks() ?? new Set();
    let remainingGroups = new Set(Object.getOwnPropertyNames(groupData));
    let allGroups = new Set(Object.getOwnPropertyNames(groupData));
    let remainingSections = new Set(
        Object.getOwnPropertyNames(sectionData.categories)
    );

    // verify all checks are covered, any left are in remaining checks
    remainingGroups.forEach((groupName) => {
        let { checks } = groupData[groupName];
        checks.forEach((check) => remainingChecks.delete(check));
    });

    // verify all groups are in at least one section
    remainingSections.forEach((sectionName) => {
        let { groupKey } = sectionData.categories[sectionName];
        if (groupKey && typeof groupKey === "string") {
            if (!allGroups.has(groupKey)) {
                errors.push(
                    `Group not found error: "${groupKey}" in category "${sectionName}"`
                );
            }
            remainingGroups.delete(groupKey);
        } else if (groupKey && Array.isArray(groupKey)) {
            groupKey.forEach((group) => {
                if (!allGroups.has(group)) {
                    errors.push(
                        `Group not found error: "${group}" in category "${sectionName}"`
                    );
                }
                remainingGroups.delete(group);
            });
        }
    });

    // Verify all sections are reachable
    /**
     *
     * @param {string} name
     * @param {string[]} parents
     */
    const traverseCategoryTree = (name, parents) => {
        if (!name) {
            errors.push(
                `Name error: "${name}" was specified as a child category.\n\tReferenced by ${
                    parents.length > 0
                        ? parents[parents.length - 1]
                        : "<source code>"
                }`
            );
            return;
        }
        if (!sectionData.categories[name]) {
            errors.push(
                `Category not found error: "${name}".\n\tReferenced by ${
                    parents.length > 0
                        ? parents[parents.length - 1]
                        : "<source code>"
                }`
            );
            return;
        }
        if (parents.includes(name)) {
            errors.push(
                `Recursion error: "${name}" is an ancestor of itself.\n\tReferenced by ${
                    parents.length > 0
                        ? parents[parents.length - 1]
                        : "<source code>"
                }\n\tLineage: ${parents.join(" -> ")}`
            );
            return;
        }

        let section = sectionData.categories[name];
        if (section.children) {
            let lineage = [...parents];
            lineage.push(name);
            section.children.forEach((childName) =>
                traverseCategoryTree(childName, lineage)
            );
        }
        remainingSections.delete(name);
    };

    traverseCategoryTree("root", []);

    // Final verification steps
    if (remainingChecks.size > 0) {
        errors.unshift(
            `Not all checks in this game are covered by the tracker. Checks missing: ${[
                ...remainingChecks.values(),
            ].join(", ")}`
        );
    }
    if (remainingGroups.size > 0) {
        errors.unshift(
            `Not all groups in the tracker are used by a category. Groups not used: ${[
                ...remainingGroups.values(),
            ].join(", ")}`
        );
    }
    if (remainingSections.size > 0) {
        errors.unshift(
            `Not all sections are reached in the section tree. Unreachable sections: ${[
                ...remainingSections.values(),
            ].join(", ")}`
        );
    }

    return errors;
};

export { verifyTrackerConfig };
