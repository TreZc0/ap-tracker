import React, { useMemo, useState } from "react";
import { useCustomTrackerDirectory } from "../../hooks/trackerHooks";
import { tertiary } from "../../constants/colors";
import { DangerButton, GhostButton, PrimaryButton, SecondaryButton } from "../buttons";
import Icon from "../icons/icons";
import Modal from "../shared/Modal";
import NotificationManager, {
    MessageType,
} from "../../services/notifications/notifications";
import CustomTrackerManager from "../../games/generic/categoryGenerators/customTrackerManager";
import TrackerManager from "../../games/TrackerManager";
import { FileInput } from "../inputs";
import styled from "styled-components";
import CustomTrackerHelpModal from "./CustomTrackerHelpModal";

const ModalGrid = styled.div`
    display: grid;
    column-gap: 2em;
    grid: "upload build" 25vh / 1fr 1fr;
`;

const CustomTrackerOptions = ({
    trackerManager,
}: {
    trackerManager: TrackerManager;
}) => {
    const customTrackersDirectory = useCustomTrackerDirectory();
    const trackersByGame = useMemo(() => {
        const trackerMap: Map<
            string,
            {
                id: string;
                game: string;
                name: string;
                enabled: boolean;
            }[]
        > = new Map();
        customTrackersDirectory.customLists.forEach((tracker) => {
            const gameList = trackerMap.get(tracker.game) ?? [];
            gameList.push(tracker);
            trackerMap.set(tracker.game, gameList);
        });
        const games = [...trackerMap.keys()];
        games.forEach((game) => {
            const list = trackerMap.get(game);
            list.sort((a, b) => (a.name < b.name ? -1 : 1));
            trackerMap.set(game, list);
        });
        return trackerMap;
    }, [customTrackersDirectory]);

    const sortedGames = useMemo(() => {
        const games = [...trackersByGame.keys()];
        games.sort();
        return games;
    }, [trackersByGame]);

    const [modalOpen, setModalOpen] = useState(false);
    const [helpModalOpen, setHelpModalOpen] = useState(false);
    /**
     * Passes the contents of a file to the CustomTrackerManager
     */
    const loadCustomTracker = (file: File) => {
        const statusHandle = NotificationManager.createStatus({
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
                $tiny
                onClick={() => {
                    setModalOpen(true);
                }}
            >
                <Icon type="add" />
            </PrimaryButton>
            <Modal open={modalOpen}>
                <div>
                    <h2>Custom Trackers (experimental)</h2>
                    <ModalGrid>
                        {/* <label htmlFor="custom_list_upload">
                            Load custom tracker:{" "}
                        </label> */}
                        <div
                            style={{
                                gridArea: "upload",
                                alignSelf: "center",
                            }}
                        >
                            <h3>Add Custom Tracker:</h3>
                            <FileInput
                                label="Upload file"
                                id="custom_list_upload"
                                accept="application/JSON"
                                // renderAsDrop
                                onChange={(e) => {
                                    if (e.target.files.length > 0) {
                                        loadCustomTracker(e.target.files[0]);
                                    }
                                }}
                            />
                        </div>
                        <div
                            style={{
                                gridArea: "build",
                                alignSelf: "center",
                            }}
                        >
                            <div> 
                                <h3>Generate a Template:</h3>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                }}>
                                    <PrimaryButton>Location Group</PrimaryButton>
                                    <PrimaryButton>Name Analysis</PrimaryButton>

                                </div>
                            </div>
                        </div>
                    </ModalGrid>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            width: "100%",
                            marginTop: "1em",
                        }}
                    >
                        <SecondaryButton onClick={() => setHelpModalOpen(true)}>
                            Help
                        </SecondaryButton>
                        <GhostButton onClick={() => setModalOpen(false)}>
                            Close
                        </GhostButton>
                    </div>
                </div>
            </Modal>
            <CustomTrackerHelpModal open={helpModalOpen} onClose={()=>setHelpModalOpen(false)}/>
        </div>
    );
};

export default CustomTrackerOptions;
