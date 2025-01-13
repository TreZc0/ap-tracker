// @ts-check
import React, { useContext } from "react";
import SplitScreen from "./SplitScreen";
import ServiceContext from "../contexts/serviceContext";
import SectionView from "./sectionComponents/SectionView";
import useOption from "../hooks/optionHook";
import { createCheckManager } from "../services/checks/checkManager";
import { createEntranceManager } from "../services/entrances/entranceManager";
import { createRegionManager } from "../services/regions/regionManager";
import { createGroupManager } from "../services/sections/groupManager";
import { createSectionManager } from "../services/sections/sectionManager";
import { createTagManager } from "../services/tags/tagManager";
// import { PrimaryButton } from "./buttons";

const mockCheckManager = createCheckManager();
const mockEntranceManager = createEntranceManager();
const mockRegionManager = createRegionManager();
const mockGroupManager = createGroupManager(
    mockEntranceManager,
    mockRegionManager
);
const mockSectionManager = createSectionManager(
    mockCheckManager,
    mockEntranceManager,
    mockGroupManager
);
const mockTagManager = createTagManager(mockCheckManager);

mockCheckManager.updateCheckStatus("Location 1", {
    exists: true,
    checked: true,
});
mockCheckManager.updateCheckStatus("Location 2", { exists: true });
mockCheckManager.updateCheckStatus("Location 3", {
    exists: true,
    checked: true,
});
mockCheckManager.updateCheckStatus("Location 4", { exists: true });
mockCheckManager.updateCheckStatus("Location 5", { exists: true });
mockCheckManager.updateCheckStatus("Location 6", {
    exists: true,
    checked: true,
});
mockCheckManager.updateCheckStatus("Location 7", { exists: true });
mockCheckManager.updateCheckStatus("Location 8", {
    exists: true,
    checked: true,
});
mockCheckManager.updateCheckStatus("Location 9", { exists: true });

mockRegionManager.loadRegions({
    all: [
        {
            region_name: "one",
            locations: {
                "Location 1": "",
            },
        },
        {
            region_name: "prime",
            locations: {
                "Location 2": "",
                "Location 3": "",
                "Location 5": "",
                "Location 7": "",
            },
        },
        {
            region_name: "composite",
            locations: {
                "Location 4": "",
                "Location 6": "",
                "Location 8": "",
                "Location 9": "",
            },
        },
    ],
});

mockGroupManager.loadGroups({
    all: {
        regions: ["one", "prime", "composite"],
    },
    one: {
        regions: ["one"],
    },
    prime: {
        regions: ["prime"],
    },
    composite: {
        regions: ["composite"],
    },
});

mockSectionManager.setConfiguration({
    categories: {
        root: {
            title: "Numbers",
            type: null,
            areaKey: null,
            theme: "default",
            children: ["one", "primes", "composites"],
        },
        one: {
            title: "One",
            type: null,
            areaKey: "one",
            theme: "default",
            children: null,
        },
        primes: {
            title: "Primes",
            type: null,
            areaKey: "prime",
            theme: "default",
            children: null,
        },
        composites: {
            title: "Composites",
            type: null,
            areaKey: "composite",
            theme: "default",
            children: null,
        },
    },
    options: {},
    types: {},
    themes: {
        default: { color: "#000000" },
    },
});

const OptionsScreen = () => {
    const serviceContext = useContext(ServiceContext);
    const optionManager = serviceContext.optionManager;
    if (!optionManager) {
        throw new Error(
            "No option manager provided for option screen, you should be worried"
        );
    }
    const checkedLocationBehavior = useOption(
        optionManager,
        "checkedLocationBehavior",
        "global"
    );

    return (
        <SplitScreen
            screens={[
                {
                    name: "options",
                    content: (
                        <div>
                            {/* <Checkbox label="Separate Graves/Grottos" />
                            <br />
                            <Checkbox label="Separate Interiors" />
                            <br />
                            <Checkbox label="Separate Overworld Areas" />
                            <br />
                            <Checkbox label="Separate Dungeons" />
                            <br />
                            <Checkbox label="Separate Dungeon Bosses" />
                            <br /> */}
                            <hr />
                            <h3>Checklist Settings</h3>
                            <SplitScreen
                                rows={1}
                                cols={2}
                                screens={[
                                    {
                                        name: "options",
                                        content: (
                                            <>
                                            <label htmlFor={"checked_location_behavior"}>Checked Location Behavior: </label>
                                                <select
                                                    id={"checked_location_behavior"}
                                                    value={
                                                        checkedLocationBehavior ??
                                                        "nothing"
                                                    }
                                                    onChange={(event) => {
                                                        const value =
                                                            event.target.value;
                                                        if (value) {
                                                            optionManager.setOptionValue(
                                                                "checkedLocationBehavior",
                                                                "global",
                                                                value
                                                            );
                                                            optionManager.saveScope(
                                                                "global"
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <option value="nothing">
                                                        Nothing
                                                    </option>
                                                    <option value="separate">
                                                        Separate
                                                    </option>
                                                    <option value="hide">
                                                        Hide
                                                    </option>
                                                </select>
                                            </>
                                        ),
                                    },
                                    {
                                        name: "exampleList",
                                        content: (
                                            <ServiceContext.Provider
                                                value={{
                                                    checkManager:
                                                        mockCheckManager,
                                                    entranceManager:
                                                        mockEntranceManager,
                                                    groupManager:
                                                        mockGroupManager,
                                                    sectionManager:
                                                        mockSectionManager,
                                                    tagManager: mockTagManager,
                                                    optionManager,
                                                }}
                                            >
                                                <SectionView
                                                    name="root"
                                                    context={{}}
                                                    startOpen
                                                />
                                            </ServiceContext.Provider>
                                        ),
                                    },
                                ]}
                            ></SplitScreen>

                            {/* <PrimaryButton>Back</PrimaryButton> */}
                        </div>
                    ),
                },
            ]}
            rows={1}
            cols={1}
        />
    );
};

export default OptionsScreen;
