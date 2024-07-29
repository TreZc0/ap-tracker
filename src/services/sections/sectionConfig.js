// @ts-check
// will be replaced with uploadable json file
const sectionConfigData = {
    categoryRoot: {
        title: "Total",
        children: [
            {
                title: "Overworld",
                children: [
                    {
                        area: "Hyrule Field",
                        theme: "default",
                    },
                    {
                        area: "Lon Lon Ranch",
                        theme: "default",
                    },
                    {
                        area: "Castle Grounds",
                        theme: "default",
                    },
                    {
                        area: "Market",
                        theme: "default",
                    },
                    {
                        area: "Market Entrance",
                        theme: "default",
                    },
                    {
                        area: "Temple of Time Entrance",
                        theme: "default",
                    },
                    {
                        area: "Kokiri Forest",
                        theme: "forest",
                    },
                    {
                        area: "Lost Woods",
                        theme: "forest",
                    },
                    {
                        area: "Sacred Forest Meadow",
                        theme: "forest",
                    },
                    {
                        area: "Death Mountain",
                        theme: "fire",
                    },
                    {
                        area: "Death Mountain Crater",
                        theme: "fire",
                    },
                    {
                        area: "Goron City",
                        theme: "fire",
                    },
                    {
                        area: "Zora River",
                        theme: "water",
                    },
                    {
                        area: "Zoras Domain",
                        theme: "water",
                    },
                    {
                        area: "Zoras Fountain",
                        theme: "water",
                    },
                    {
                        area: "Lake Hylia",
                        theme: "water",
                    },
                    {
                        area: "Kakariko Village",
                        theme: "shadow",
                    },
                    {
                        area: "Graveyard",
                        theme: "shadow",
                    },
                    {
                        area: "Gerudo Valley",
                        theme: "spirit",
                    },
                    {
                        area: "Gerudo Fortress",
                        theme: "spirit",
                    },
                    {
                        area: "Haunted Wasteland",
                        theme: "spirit",
                    },
                    {
                        area: "Desert Colossus",
                        theme: "spirit",
                    },
                ],
            },
            {
                title: "Dungeons",
                children: [
                    {
                        area: "Deku Tree",
                        theme: "forest",
                    },
                    {
                        area: "Dodongos Cavern",
                        theme: "fire",
                    },
                    {
                        area: "Jabu Jabus Belly",
                        theme: "water",
                    },
                    {
                        area: "Bottom of the Well",
                        theme: "shadow",
                    },
                    {
                        area: "Forest Temple",
                        theme: "forest",
                    },
                    {
                        area: "Fire Temple",
                        theme: "fire",
                    },
                    {
                        area: "Water Temple",
                        theme: "water",
                    },
                    {
                        area: "Shadow Temple",
                        theme: "shadow",
                    },
                    {
                        area: "Spirit Temple",
                        theme: "spirit",
                    },
                    {
                        area: "Gerudo Training Ground",
                        theme: "spirit",
                    },
                    {
                        area: "Theives Hideout",
                        theme: "spirit",
                    },
                    {
                        area: "Ganons Castle",
                        theme: "default",
                    },
                ],
            },
        ],
    },
    themes: [
        {
            name: "forest",
            color: "#009933",
        },
        {
            name: "water",
            color: "#0099ff",
        },
        {
            name: "fire",
            color: "#ff5050",
        },
        {
            name: "spirit",
            color: "#ffcc66",
        },
        {
            name: "shadow",
            color: "#9966ff",
        },
        {
            name: "default",
            color: "#000000",
        },
    ],
};

/**
 * @typedef SectionConfig
 * @prop {string} type
 * @prop {string} name
 * @prop {string} display
 * @prop {string} borderColor
 * @prop {(SectionConfig|null)[]|null} children
 */

const readSectionConfig = (data) => {
    /**
     *
     * @param {*} category
     * @returns {SectionConfig | null}
     */
    const readCategory = (category) => {
        if (category.area) {
            // it is a region
            let value = {
                type: "section",
                display: category.area,
                name: category.area,
                borderColor:
                    themes.get(category.theme).color ??
                    themes.get("default").color ??
                    "#000000",
                children: null,
            };
            return value;
        } else if (category.title) {
            // it is a sub category
            /** @type {SectionConfig} */
            let value = {
                type: "category",
                display: category.title,
                name: category.title,
                borderColor: "#000000",
                children: [],
            };
            if (category.children) {
                for (const child of category.children) {
                    value.children?.push(readCategory(child));
                }
            }
            return value;
        }
        return null;
    };

    const themes = new Map();
    if (data.themes) {
        for (const theme of data.themes) {
            themes.set(theme.name, { ...theme });
        }
    }
    return readCategory(data.categoryRoot);
};

const sectionConfig = readSectionConfig(sectionConfigData);

export { sectionConfig };
