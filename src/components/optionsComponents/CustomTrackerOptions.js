// @ts-check
import React, { useState } from "react";
import { useCustomTrackerDirectory } from "../../hooks/trackerHooks";
import _ from "lodash";
import { tertiary } from "../../constants/colors";
import { DangerButton, GhostButton, PrimaryButton } from "../buttons";
import Icon from "../icons/icons";
import Modal from "../shared/Modal";
import NotificationManager, {
    MessageType,
} from "../../services/notifications/notifications";
import CustomTrackerManager from "../../games/generic/categoryGenerators/customTrackerManager";
import { getGameTracker } from "../../games/TrackerBuilder";
import TrackerDirectory from "../../games/TrackerDirectory";

const CustomTrackerOptions = () => {
    const customTrackersDirectory = useCustomTrackerDirectory();
    const sortedTrackers = _.sortBy(customTrackersDirectory.customLists, [
        "game",
        "name",
    ]);
    const [modalOpen, setModalOpen] = useState(false);
    /**
     *
     * @param {File} file
     */
    let loadCustomTracker = (file) => {
        let statusHandle = NotificationManager.createStatus({
            message: "Loading Custom Tracker",
            type: MessageType.info,
            progress: -1,
        });
        file.text()
            .then((text) => JSON.parse(text))
            .then((data) => {
                CustomTrackerManager.addCustomTracker(data);
                statusHandle.update({
                    message: "Successfully added custom tracker",
                    type: MessageType.success,
                    progress: 1,
                    duration: 4,
                });
                if (getGameTracker(data.game)?.id === data.id) {
                    TrackerDirectory.setTracker(data.game, data.id);
                }
            })
            .catch((e) => {
                statusHandle.update({
                    message: "Failed to load tracker",
                    progress: 0,
                    duration: 4,
                    type: MessageType.error,
                });
                NotificationManager.createToast({
                    message: "Failed to create custom tracker",
                    duration: 10,
                    type: MessageType.error,
                    details: `Error: \n\t${e}`,
                });
            });
        setModalOpen(false);
    };
    return (
        <div>
            <div>
                <p>Manage custom trackers here</p>
                {sortedTrackers.length > 0 ? (
                    sortedTrackers.map((data) => {
                        return (
                            <div key={data.id}>
                                {data.game} - {data.name}
                                {!data.enabled && "(Disabled)"}{" "}
                                <DangerButton
                                    // @ts-ignore
                                    $small
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                `Are you sure you want to delete ${data.name}?`
                                            )
                                        ) {
                                            CustomTrackerManager.removeCustomTracker(
                                                data.id
                                            );
                                        }
                                    }}
                                >
                                    Delete
                                </DangerButton>
                            </div>
                        );
                    })
                ) : (
                    <i style={{ color: tertiary }}>
                        No custom trackers, try adding one below
                    </i>
                )}
            </div>
            <PrimaryButton
                // @ts-ignore
                $small
                onClick={() => {
                    setModalOpen(true);
                }}
            >
                <Icon type="add" />
            </PrimaryButton>
            <Modal open={modalOpen}>
                <div>
                    <h3>Upload a custom tracker (experimental)</h3>
                    <div>
                        <label htmlFor="custom_list_upload">
                            Load custom list:{" "}
                        </label>
                        <input
                            type="file"
                            id="custom_list_upload"
                            accept="application/JSON"
                            onChange={(e) => {
                                if (e.target.files.length > 0) {
                                    loadCustomTracker(e.target.files[0]);
                                }
                            }}
                        ></input>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            width: "100%",
                            marginTop: "1em",
                        }}
                    >
                        <GhostButton onClick={() => setModalOpen(false)}>
                            Close
                        </GhostButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CustomTrackerOptions;
