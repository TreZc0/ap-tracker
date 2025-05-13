import React, { useContext } from "react";
import useOption from "../../hooks/optionHook";
import ServiceContext from "../../contexts/serviceContext";
import { Checkbox } from "../inputs";

const LayoutSettings = () => {
    const services = useContext(ServiceContext);
    const optionManager = services.optionManager;
    const layoutMode = useOption(
        optionManager,
        "trackerLayoutMode",
        "global"
    ) as "auto" | "tab" | "flex";
    const showTextClient = useOption(
        services.optionManager,
        "showTextClient",
        "global"
    ) as boolean;

    return (
        <div>
            <label htmlFor={"layout_mode"}>Layout: </label>
            <select
                className="interactive"
                id={"layout_mode"}
                value={layoutMode ?? "auto"}
                onChange={(event) => {
                    const value = event.target.value;
                    if (value) {
                        optionManager.setOptionValue(
                            "trackerLayoutMode",
                            "global",
                            value
                        );
                        optionManager.saveScope("global");
                    }
                }}
            >
                <option value="auto">Auto</option>
                <option value="tab">Tabs</option>
                <option value="flex">Grid</option>
            </select>
            <br />
            <Checkbox
                label="Show Text Client"
                checked={showTextClient ?? true}
                onChange={(event) => {
                    optionManager.setOptionValue(
                        "showTextClient",
                        "global",
                        event.target.checked
                    );
                    optionManager.saveScope("global");
                }}
            />
        </div>
    );
};

export default LayoutSettings;
