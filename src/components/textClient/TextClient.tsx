import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTextClientMessages } from "../../hooks/textClientHook";
import ServiceContext from "../../contexts/serviceContext";
import ClientMessage from "./ClientMessage";
import { GhostButton, PrimaryButton } from "../buttons";
import { Checkbox, Input } from "../inputs";
import useOption from "../../hooks/optionHook";
import Modal from "../shared/Modal";
import ButtonRow from "../LayoutUtilities/ButtonRow";
import Icon from "../icons/icons";
import { ItemType, MessageFilter, SimpleMessageType } from "../../services/textClientManager";
import { AutoSizer } from "react-virtualized";
import { VariableSizeList } from "react-window";

const TextClient = () => {
    const services = useContext(ServiceContext);
    const optionManager = services.optionManager;
    const textClientManager = services.textClientManager;
    const [showFilterModal, setShowFilterModal] = useState(false);
    const messages = useTextClientMessages(textClientManager);
    const [inputText, setInputText] = useState("");
    const [cachedInputText, setCachedInputText] = useState("");
    const [inputHistory, setInputHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const rowHeights: React.Ref<{ [index: number]: number }> = useRef({});
    const listRef: React.ForwardedRef<VariableSizeList> = useRef(null);

    const messageFilter = useOption(optionManager, "messageFilter", "textClient") as MessageFilter;
    const updateAllowedMessages = (checked: boolean, feature: SimpleMessageType) => {
        const newFilter: MessageFilter = {
            ...messageFilter,
        };
        const allowedTypes = new Set(messageFilter.allowedTypes);
        if (checked) {
            allowedTypes.add(feature);
        } else {
            allowedTypes.delete(feature);
        }
        newFilter.allowedTypes = [...allowedTypes];
        optionManager.setOptionValue("messageFilter", "textClient", newFilter);
        optionManager.saveScope("textClient");
    };

    const updateOwnFilter = (checked: boolean, feature: ItemType) => {
        const newFilter: MessageFilter = {
            ...messageFilter,
        };
        const ownTypes = new Set(messageFilter.itemSendFilter.own);
        if (checked) {
            ownTypes.add(feature);
        } else {
            ownTypes.delete(feature);
        }
        newFilter.itemSendFilter.own = [...ownTypes];
        optionManager.setOptionValue("messageFilter", "textClient", newFilter);
        optionManager.saveScope("textClient");
    };

    const updateOthersFilter = (checked: boolean, feature: ItemType) => {
        const newFilter: MessageFilter = {
            ...messageFilter,
        };
        const othersTypes = new Set(messageFilter.itemSendFilter.others);
        if (checked) {
            othersTypes.add(feature);
        } else {
            othersTypes.delete(feature);
        }
        newFilter.itemSendFilter.others = [...othersTypes];
        optionManager.setOptionValue("messageFilter", "textClient", newFilter);
        optionManager.saveScope("textClient");
    };

    const processInput = () => {
        if (inputText) {
            setInputHistory([inputText, ...inputHistory]);
            textClientManager.processInput(inputText, services.connector?.connection.client);
            setInputText("");
            setCachedInputText("");
            setHistoryIndex(-1);
        }
    };

    const navigateHistory = (direction: number) => {
        if (historyIndex === 0 && direction < 0) {
            // back to entry
            setInputText(cachedInputText);
        } else if (historyIndex === -1 && direction > 0) {
            // going from saved index to history
            setCachedInputText(inputText);
            if (inputHistory.length > 0) {
                setInputText(inputHistory[0]);
                setHistoryIndex(0);
            }
        } else if (historyIndex >= 0 && direction > 0) {
            if (inputHistory.length > historyIndex) {
                setInputText(inputHistory[historyIndex + 1]);
                setHistoryIndex(historyIndex + 1);
            }
        } else if (historyIndex >= 0 && direction < 0) {
            if (0 < historyIndex) {
                setInputText(inputHistory[historyIndex - 1]);
                setHistoryIndex(historyIndex - 1);
            }
        }
    };

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const rowRef: React.Ref<HTMLDivElement> = useRef(null);
        useEffect(() => {
            if (rowRef.current) {
                setRowHeight(index, rowRef.current.clientHeight);
            }
        }, [rowRef]);
        return <ClientMessage style={style} ref={rowRef} message={messages[index]} />;
    };

    const setRowHeight = (index: number, size: number) => {
        listRef.current.resetAfterIndex(0);
        rowHeights.current = { ...rowHeights.current, [index]: size };
    };

    const scrollToBottom = useCallback(() => {
        listRef.current?.scrollToItem(messages.length - 1, "smart");
    }, [listRef, messages]);

    useEffect(() => {
        scrollToBottom();
    }, []);

    useEffect(() => {
        if (shouldAutoScroll) {
            scrollToBottom();
        }
    }, [messages]);

    return (
        <div
            style={{
                padding: "1em",
                boxSizing: "border-box",
                width: "100%",
                height: "100%",
                display: "grid",
                gridTemplateRows: "3em 1fr auto",
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    position: "sticky",
                    top: "0px",
                }}
            >
                <h3>Text Client</h3>
                <div style={{ display: "flex", justifyContent: "flex-end", gap:"1em" }}>
                    <Checkbox
                        onChange={(event) => setShouldAutoScroll(event.target.checked)}
                        label="Auto Scroll"
                        checked={shouldAutoScroll}
                    />
                    <PrimaryButton $tiny style={{ height: "20px" }} onClick={() => setShowFilterModal(true)}>
                        <Icon fontSize="12pt" type="filter_alt" />
                    </PrimaryButton>
                </div>
            </div>
            <div
                style={{
                    padding: "0.25em",
                }}
            >
                <AutoSizer>
                    {({ height, width }) => (
                        <VariableSizeList
                            itemCount={messages.length}
                            itemSize={(index) => rowHeights.current[index] ?? 30}
                            height={height}
                            width={width}
                            ref={listRef}
                        >
                            {Row}
                        </VariableSizeList>
                    )}
                </AutoSizer>
            </div>
            <div style={{ display: "flex" }}>
                <PrimaryButton onClick={processInput} $small>
                    Send
                </PrimaryButton>
                <Input
                    label=""
                    value={inputText}
                    type="text"
                    style={{
                        flexGrow: 1,
                    }}
                    onChange={(e) => {
                        setInputText(e.target.value);
                        setHistoryIndex(-1);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            processInput();
                        } else if (e.key === "ArrowUp") {
                            navigateHistory(1);
                        } else if (e.key === "ArrowDown") {
                            navigateHistory(-1);
                        }
                    }}
                ></Input>
            </div>
            <Modal open={showFilterModal}>
                <div>
                    <h2>Text Client Filters</h2>
                    <div>
                        <Checkbox
                            label="Show Item Sends"
                            checked={messageFilter.allowedTypes.includes("item")}
                            onChange={(event) => updateAllowedMessages(event.target.checked, "item")}
                        />
                        <br />
                        <Checkbox
                            label="Show Commands"
                            checked={messageFilter.allowedTypes.includes("command")}
                            onChange={(event) => updateAllowedMessages(event.target.checked, "command")}
                        />
                        <br />
                        <Checkbox
                            label="Show Chat"
                            checked={messageFilter.allowedTypes.includes("chat")}
                            onChange={(event) => updateAllowedMessages(event.target.checked, "chat")}
                        />
                        <br />
                        <Checkbox
                            label="Show Status Updates"
                            checked={messageFilter.allowedTypes.includes("status")}
                            onChange={(event) => updateAllowedMessages(event.target.checked, "status")}
                        />
                        <br />
                        <Checkbox
                            label="Show Log-in/Log-out"
                            checked={messageFilter.allowedTypes.includes("login")}
                            onChange={(event) => updateAllowedMessages(event.target.checked, "login")}
                        />
                        <br />
                        <Checkbox
                            label="Show Miscellaneous"
                            checked={messageFilter.allowedTypes.includes("misc")}
                            onChange={(event) => updateAllowedMessages(event.target.checked, "misc")}
                        />
                    </div>
                    <div>
                        <h4>Advanced Item Send Filters:</h4>
                        <div style={{ display: "flex", gap: "1em" }}>
                            <div style={{ width: "30%", flex: "0 1 50%" }}>
                                <p>Filter items based on what you send or receive</p>
                                <Checkbox
                                    label="Show Own Progression"
                                    disabled={!messageFilter.allowedTypes.includes("item")}
                                    checked={messageFilter.itemSendFilter.own.includes("progression")}
                                    onChange={(event) => updateOwnFilter(event.target.checked, "progression")}
                                />
                                <br />
                                <Checkbox
                                    label="Show Own Traps"
                                    disabled={!messageFilter.allowedTypes.includes("item")}
                                    checked={messageFilter.itemSendFilter.own.includes("trap")}
                                    onChange={(event) => updateOwnFilter(event.target.checked, "trap")}
                                />
                                <br />
                                <Checkbox
                                    label="Show Own Useful"
                                    disabled={!messageFilter.allowedTypes.includes("item")}
                                    checked={messageFilter.itemSendFilter.own.includes("useful")}
                                    onChange={(event) => updateOwnFilter(event.target.checked, "useful")}
                                />
                                <br />
                                <Checkbox
                                    label="Show Own Normal"
                                    disabled={!messageFilter.allowedTypes.includes("item")}
                                    checked={messageFilter.itemSendFilter.own.includes("normal")}
                                    onChange={(event) => updateOwnFilter(event.target.checked, "normal")}
                                />
                            </div>
                            <div style={{ width: "30%", flex: "0 1 50%" }}>
                                <p>Filter items based on what others send or receive</p>
                                <Checkbox
                                    label="Show Other's Progression"
                                    disabled={!messageFilter.allowedTypes.includes("item")}
                                    checked={messageFilter.itemSendFilter.others.includes("progression")}
                                    onChange={(event) => updateOthersFilter(event.target.checked, "progression")}
                                />
                                <br />
                                <Checkbox
                                    label="Show Other's Traps"
                                    disabled={!messageFilter.allowedTypes.includes("item")}
                                    checked={messageFilter.itemSendFilter.others.includes("trap")}
                                    onChange={(event) => updateOthersFilter(event.target.checked, "trap")}
                                />
                                <br />
                                <Checkbox
                                    label="Show Other's Useful"
                                    disabled={!messageFilter.allowedTypes.includes("item")}
                                    checked={messageFilter.itemSendFilter.others.includes("useful")}
                                    onChange={(event) => updateOthersFilter(event.target.checked, "useful")}
                                />
                                <br />
                                <Checkbox
                                    label="Show Other's Normal"
                                    disabled={!messageFilter.allowedTypes.includes("item")}
                                    checked={messageFilter.itemSendFilter.others.includes("normal")}
                                    onChange={(event) => updateOthersFilter(event.target.checked, "normal")}
                                />
                            </div>
                        </div>

                        <br />
                    </div>

                    <ButtonRow>
                        <GhostButton
                            onClick={() => {
                                setShowFilterModal(false);
                            }}
                        >
                            Close
                        </GhostButton>
                    </ButtonRow>
                </div>
            </Modal>
        </div>
    );
};

export default TextClient;
