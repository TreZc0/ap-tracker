// @ts-check
import React from "react";
import { useTrackerDirectory } from "../../hooks/trackerHooks";
import TrackerDropdown from "./TrackerDropdown";
import { tertiary } from "../../constants/colors";

const TrackerPicker = () => {
    const trackerDirectory = useTrackerDirectory();

    return (
        <div>
            <div>
                <p>Select which tracker to use for different games</p>
                {trackerDirectory.games.length > 0 ? (
                    trackerDirectory.games.map((game) => {
                        return (
                            <div key={game}>
                                {game}: <TrackerDropdown game={game} />
                            </div>
                        );
                    })
                ) : (
                    <i style={{ color: tertiary }}>
                        No options available, add some custom trackers to have
                        options.
                    </i>
                )}
            </div>
        </div>
    );
};

export default TrackerPicker;
