// @ts-check
import React from "react";
import {
    useCurrentGameTracker,
    useTrackerDirectory,
} from "../../hooks/trackerHooks";
import TrackerDirectory from "../../games/TrackerDirectory";
import NotificationManager, {
    MessageType,
} from "../../services/notifications/notifications";
/**
 * Displays a drop down with a list of options available for trackers for the provided game name
 * @param param0 
 * @returns 
 */
const TrackerDropdown = ({ game }:{
    game: string
}) => {
    const directory = useTrackerDirectory();
    const currentSelection = useCurrentGameTracker(game);
    return (
        <select
            className="interactive"
            value={currentSelection?.id ?? ""}
            onChange={(e) => {
                try {
                    if (e.target.value) {
                        TrackerDirectory.setTracker(game, e.target.value);
                    } else {
                        TrackerDirectory.setTracker(game, null);
                    }
                } catch (e) {
                    NotificationManager.createToast({
                        message: "An error occurred",
                        type: MessageType.error,
                        details: e.toString(),
                        duration: 10,
                    });
                }
            }}
        >
            <option value="">Default</option>
            {directory.trackers
                .filter((tracker) => tracker.gameName === game)
                .map((tracker) => {
                    return (
                        <option key={tracker.id} value={tracker.id}>
                            {tracker.name}
                        </option>
                    );
                })}
        </select>
    );
};

export default TrackerDropdown;
