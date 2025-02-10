// @ts-check
import React, { useContext } from "react";
import SplitScreen from "./SplitScreen";
import ServiceContext from "../contexts/serviceContext";
import SectionView from "./sectionComponents/SectionView";
import useOption from "../hooks/optionHook";
import { createCheckManager } from "../services/checks/checkManager";
import { createEntranceManager } from "../services/entrances/entranceManager";
import { createGroupManager } from "../services/sections/groupManager";
import { createSectionManager } from "../services/sections/sectionManager";
import { createTagManager } from "../services/tags/tagManager";
// import { PrimaryButton } from "./buttons";

const mockCheckManager = createCheckManager();
const mockEntranceManager = createEntranceManager();
const mockGroupManager = createGroupManager(mockEntranceManager);
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

mockGroupManager.loadGroups({
    one: {
        checks: ["Location 1"],
    },
    prime: {
        checks: ["Location 2", "Location 3", "Location 5", "Location 7"],
    },
    composite: {
        checks: ["Location 4", "Location 6", "Location 8", "Location 9"],
    },
});

mockSectionManager.setConfiguration({
    categories: {
        root: {
            title: "Numbers",
            type: null,
            groupKey: null,
            theme: "default",
            children: ["one", "primes", "composites"],
        },
        one: {
            title: "One",
            type: null,
            groupKey: "one",
            theme: "default",
            children: null,
        },
        primes: {
            title: "Primes",
            type: null,
            groupKey: "prime",
            theme: "default",
            children: null,
        },
        composites: {
            title: "Composites",
            type: null,
            groupKey: "composite",
            theme: "default",
            children: null,
        },
    },
    options: {},
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
    const themeValue = useOption(optionManager, "theme", "global");

    return (
        <>
            <SplitScreen
                screens={[
                    {
                        name: "options",
                        content: (
                            <div>
                                <hr />
                                <h3>Theme Settings</h3>
                                <>
                                    <label htmlFor={"global_theme"}>
                                        Theme:{" "}
                                    </label>
                                    <select
                                        id={"global_theme"}
                                        value={themeValue ?? "system"}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            if (value) {
                                                optionManager.setOptionValue(
                                                    "theme",
                                                    "global",
                                                    value
                                                );
                                                optionManager.saveScope(
                                                    "global"
                                                );
                                            }
                                        }}
                                    >
                                        <option value="system">System</option>
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                    </select>
                                </>
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
                                                    <label
                                                        htmlFor={
                                                            "checked_location_behavior"
                                                        }
                                                    >
                                                        Checked Location
                                                        Behavior:{" "}
                                                    </label>
                                                    <select
                                                        id={
                                                            "checked_location_behavior"
                                                        }
                                                        value={
                                                            checkedLocationBehavior ??
                                                            "nothing"
                                                        }
                                                        onChange={(event) => {
                                                            const value =
                                                                event.target
                                                                    .value;
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
                                                        tagManager:
                                                            mockTagManager,
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
        </>
    );
};

export default OptionsScreen;
