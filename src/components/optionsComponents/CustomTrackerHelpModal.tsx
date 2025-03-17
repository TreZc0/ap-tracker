import React from "react";
import Modal from "../shared/Modal";
import { GhostButton } from "../buttons";

const CustomTrackerHelpModal = ({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) => {
    return (
        <Modal open={open}>
            <div
                className="documentation"
                style={{
                    width: "90vw",
                    maxHeight: "80vh",
                    overflow: "auto",
                }}
            >
                <h2>Custom Tracker Information</h2>
                <p>
                    Custom Trackers are a way to customize your checklists to
                    your liking.
                </p>
                <p>
                    As of right now, the only way to create one is to manually
                    create JSON files that describe your checklist following a
                    special format that is documented &nbsp;
                    <a
                        href="https://github.com/DrAwesome4333/ap-tracker/blob/main/docs/customTrackers.md"
                        target="_blank"
                        rel="noreferrer"
                    >
                        on this GitHub page
                    </a>
                    .
                </p>
                <p>
                    To help make the process easier, I have provided a few ways
                    to get a working template to get started:
                </p>
                <h3>Location Group Templates:</h3>
                <p>
                    This is what the tracker uses by default. Location Groups
                    are defined by the Archipelago world developers and can be
                    very useful for grouping locations in a logical manner.
                    However location groups were never meant to be used for
                    organizing checklists, and as a result the quality of the
                    grouping done by the App varies from game to game. Some
                    world developers have not implemented location groups into
                    their world, making this option no better than just listing
                    all the checks.
                </p>
                <h3>Name Analysis Templates:</h3>
                <p>
                    Templates generated using this option take a look at the
                    location names themselves and try to determine appropriate
                    grouping for those.
                </p>
                <p>
                    There are many different ways that Archipelago world
                    developers name their locations, as such the app provides
                    some parameters that can be set to change how the names are
                    analyzed. To understand these parameters, it is best to know
                    a bit about how the analysis takes place.
                </p>
                <h4>How the location names are analyzed</h4>
                <p>
                    When determining the best groupings for a given set of
                    location names, the App builds a{" "}
                    <a
                        href="https://en.wikipedia.org/wiki/Trie"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Trie tree
                    </a>{" "}
                    to identify common prefixes within the names. If this was
                    applied on a character by character basis, you end up with
                    groupings like &quot;W&quot; if a lot of the names start
                    with the letter W. To get around this, the App tries to use
                    the different &quot;words&quot; or tokens in a name instead
                    of looking at each character individually. How words are
                    separated in a location name varies from game to game, so
                    the following parameters can be selected to help the App
                    find tokens in the names:
                </p>
                <ul>
                    <li>
                        <b>Split Characters:</b> Any time the app sees a
                        character in this list, it will consider it the start of
                        a new token.
                    </li>
                    <li>
                        <b>Case Split:</b> Any time the app sees a change from
                        lowercase to uppercase, it will consider this as the
                        start of a new token.
                    </li>
                    <li>
                        <b>Character Split:</b> Selecting this option ignores
                        the other options and considers each character in the
                        name its own token.
                    </li>
                </ul>
                <h4>Additional parameters</h4>
                <ul>
                    <li>
                        <b>Minium location count:</b> The minimum number
                        locations that must share a prefix to create a group for
                        them.
                    </li>
                    <li>
                        <b>Max dropdown depth:</b> How nested the generated
                        groups should be.
                    </li>
                    <li>
                        <b>Use all checks in Data Package:</b> When enabled, all
                        locations defined by the world developer will be used in
                        the analysis instead of just the locations present in
                        the current slot.
                    </li>
                </ul>
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                    marginTop: "1em",
                }}
            >
                <GhostButton onClick={onClose}>Close</GhostButton>
            </div>
        </Modal>
    );
};

export default CustomTrackerHelpModal;
