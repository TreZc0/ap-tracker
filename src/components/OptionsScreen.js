// @ts-check
import React from "react";
import { Checkbox } from "./inputs";
import SplitScreen from "./SplitScreen";
import { PrimaryButton } from "./buttons";

const OptionsScreen = () => {
    return (
        <SplitScreen
            screens={[
                {
                    name: "options",
                    content: (
                        <div>
                            <Checkbox label="Separate Graves/Grottos" />
                            <br />
                            <Checkbox label="Separate Interiors" />
                            <br />
                            <Checkbox label="Separate Overworld Areas" />
                            <br />
                            <Checkbox label="Separate Dungeons" />
                            <br />
                            <Checkbox label="Separate Dungeon Bosses" />
                            <br />
                            <PrimaryButton>Back</PrimaryButton>
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
