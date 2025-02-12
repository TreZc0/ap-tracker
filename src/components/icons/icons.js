// @ts-check
import React from "react";
const supportedIcons = [
    "home",
    "palette",
    "settings",
    "check_indeterminate_small",
    "star",
    "bolt",
    "label",
    "bookmark",
    "block",
    "add",
    "beenhere",
    "new_label",
    "pentagon",
    "check_small",
    "price_check",
    "flag",
    "flag_check",
    "search_check",
    "add_circle",
    "counter_1",
    "counter_2",
    "counter_3",
    "counter_4",
    "counter_5",
    "counter_6",
    "counter_7",
    "counter_8",
    "counter_9",
    "mystery",
    "location_on",
    "not_listed_location",
    "wrong_location",
    "fmd_bad",
    "add_location_alt",
    "location_off",
    "price_change",
    "attach_money",
    "info",
    "check_circle",
    "checklist",
];

const link = document.createElement("link");
link.rel = "stylesheet";
link.href = `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=${supportedIcons
    .sort()
    .join(",")}&display=block`;
document.head.appendChild(link);

/**
 *
 * @param {*} param0
 * @returns
 */
const Icon = ({ type, fontSize, style }) => {
    return (
        <span
            className={"material-symbols-rounded"}
            style={{ ...style, fontSize: fontSize ?? "24px" }}
        >
            {type}
        </span>
    );
};

export default Icon;
