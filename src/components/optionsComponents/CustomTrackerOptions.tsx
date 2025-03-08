import React, { useMemo, useState } from "react";
import { useCustomTrackerDirectory } from "../../hooks/trackerHooks";
import { tertiary } from "../../constants/colors";
import { DangerButton, GhostButton, PrimaryButton } from "../buttons";
import Icon from "../icons/icons";
import Modal from "../shared/Modal";
import NotificationManager, {
    MessageType,
} from "../../services/notifications/notifications";
import CustomTrackerManager from "../../games/generic/categoryGenerators/customTrackerManager";
import TrackerManager from "../../games/TrackerManager";

const CustomTrackerOptions = ({trackerManager}:{trackerManager: TrackerManager}) => {
    const customTrackersDirectory = useCustomTrackerDirectory();
    const trackersByGame = useMemo(() => {
        let trackerMap: Map<
            string,
            {
                id: string;
                game: string;
                name: string;
                enabled: boolean;
            }[]
        > = new Map();
        customTrackersDirectory.customLists.forEach((tracker) => {
            let gameList = trackerMap.get(tracker.game) ?? [];
            gameList.push(tracker);
            trackerMap.set(tracker.game, gameList);
        });
        const games = [...trackerMap.keys()];
        games.forEach((game) => {
            let list = trackerMap.get(game);
            list.sort((a, b) => a.name < b.name ? -1 : 1);
            trackerMap.set(game, list);
        });
        return trackerMap;
    }, [customTrackersDirectory]);

    const sortedGames = useMemo(() => {
        let games = [...trackersByGame.keys()];
        games.sort();
        return games;
    }, [trackersByGame]);

    const [modalOpen, setModalOpen] = useState(false);
    /**
     * Passes the contents of a file to the CustomTrackerManager
     */
    let loadCustomTracker = (file: File) => {
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
                if (trackerManager.getGameTracker(data.game)?.id === data.id) {
                    trackerManager.setGameTracker(data.game, data.id);
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
                {sortedGames.length > 0 ? (
                    sortedGames.map((game) => (
                        <div
                            key={game}
                            style={{
                                marginBottom: "2em",
                            }}
                        >
                            <h4>{game}</h4>
                            <div
                                style={{
                                    marginLeft: "1em",
                                }}
                            >
                                {trackersByGame.get(game).map((tracker) => (
                                    <div
                                        key={tracker.id}
                                        style={{
                                            marginBottom: "0.25em",
                                        }}
                                    >
                                        {tracker.name}
                                        {!tracker.enabled && "(Disabled)"}{" "}
                                        <DangerButton
                                            // @ts-ignore
                                            $tiny
                                            onClick={() => {
                                                if (
                                                    window.confirm(
                                                        `Are you sure you want to delete ${tracker.name}?`
                                                    )
                                                ) {
                                                    CustomTrackerManager.removeCustomTracker(
                                                        tracker.id
                                                    );
                                                }
                                            }}
                                        >
                                            <Icon
                                                fontSize={"14px"}
                                                type="delete"
                                            />
                                        </DangerButton>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <i style={{ color: tertiary }}>
                        No custom trackers, try adding one below
                    </i>
                )}
            </div>
            <PrimaryButton
                // @ts-ignore
                $tiny
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
                            Load custom tracker:{" "}
                        </label>
                        <input
                            type="file"
                            id="custom_list_upload"
                            accept="application/JSON"
                            className="interactive"
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
