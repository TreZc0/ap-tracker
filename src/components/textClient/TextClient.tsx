import React, { useCallback, useContext, useEffect, useRef, useState, createContext, forwardRef } from "react";
import { useTextClientMessages } from "../../hooks/textClientHook";
import ServiceContext from "../../contexts/serviceContext";
import ClientMessage from "./ClientMessage";
import { GhostButton, PrimaryButton } from "../buttons";
import { Checkbox } from "../inputs";
import useOption from "../../hooks/optionHook";
import Modal from "../shared/Modal";
import ButtonRow from "../LayoutUtilities/ButtonRow";
import Icon from "../icons/icons";
import { APMessage, ItemType, MessageFilter, SimpleMessageType } from "../../services/textClientManager";
import { VariableSizeList } from "react-window";
import TextClientTextBox from "./TextClientTextBox";

const defaultRowSize = 19;

const TextClientContext: React.Context<{
    messages: APMessage[];
    setRowHeight: (index: number, value: number) => void;
    rowHeights: { [index: number]: number };
}> = createContext({ messages: [], setRowHeight: () => {}, rowHeights: {} });

const MessageRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const rowRef: React.Ref<HTMLDivElement> = useRef(null);
    const textClientContext = useContext(TextClientContext);
    // Update row heights with the current height of the row
    useEffect(() => {
        if (rowRef.current) {
            textClientContext.setRowHeight(index, rowRef.current.clientHeight);
        }
        const resizeObserver = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry && rowRef.current) {
                textClientContext.setRowHeight(index, rowRef.current.clientHeight);
            }
        });
        const currentElement = rowRef.current;
        if (currentElement) {
            resizeObserver.observe(currentElement);
        }
        return () => {
            if (currentElement) {
                resizeObserver.unobserve(currentElement);
            }
        };
    }, [rowRef.current]);
    return <ClientMessage style={style} ref={rowRef} message={textClientContext.messages[index]} />;
};

// extracted to prevent re-renders every time the parent component updates
const MessageList = forwardRef(
    (
        {
            height,
            width,
            listRef,
        }: {
            height: number;
            width: number;
            listRef: React.ForwardedRef<VariableSizeList>;
        },
        ref
    ) => {
        const textClientContext = useContext(TextClientContext);
        return (
            <VariableSizeList
                itemCount={textClientContext.messages.length}
                itemSize={(index) => textClientContext.rowHeights[index] || defaultRowSize}
                height={height}
                width={width}
                ref={listRef}
                overscanCount={10}
                outerRef={ref}
            >
                {MessageRow}
            </VariableSizeList>
        );
    }
);
MessageList.displayName = "MessageList";

const TextClient = () => {
    const services = useContext(ServiceContext);
    const optionManager = services.optionManager;
    const textClientManager = services.textClientManager;

    const messages = useTextClientMessages(textClientManager);
    const messageFilter = useOption(optionManager, "messageFilter", "textClient") as MessageFilter;

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [followMessages, setFollowMessages] = useState(true);
    const [rowHeights, setRowHeights] = useState({});
    const [listDim, setListDim] = useState({ width: 0, height: 0 });
    const listUpdateDebounceTimer = useRef(0);
    const scrollDebounceTimer = useRef(0);
    const listContainerRef: React.ForwardedRef<HTMLDivElement> = useRef(null);
    const listRef: React.ForwardedRef<VariableSizeList> = useRef(null);
    const listElementRef: React.ForwardedRef<HTMLElement> = useRef(null);

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

    const updateItemSendFilter = (checked: boolean, feature: ItemType, who: "own" | "others") => {
        const newFilter: MessageFilter = {
            ...messageFilter,
        };
        const allowedItemSendTypes = new Set(messageFilter.itemSendFilter[who]);
        if (checked) {
            allowedItemSendTypes.add(feature);
        } else {
            allowedItemSendTypes.delete(feature);
        }
        newFilter.itemSendFilter[who] = [...allowedItemSendTypes];
        optionManager.setOptionValue("messageFilter", "textClient", newFilter);
        optionManager.saveScope("textClient");
    };

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                setListDim({
                    height: listContainerRef.current.clientHeight,
                    width: listContainerRef.current.clientWidth,
                });
            }
        });
        const currentElement = listContainerRef.current;
        if (currentElement) {
            resizeObserver.observe(currentElement);
        }
        return () => {
            if (currentElement) {
                resizeObserver.unobserve(currentElement);
            }
        };
    }, [listContainerRef]);

    const setRowHeight = useCallback(
        (index: number, size: number) => {
            setRowHeights((r) => ({ ...r, [index]: size }));
        },
        [rowHeights]
    );

    useEffect(() => {
        if (!listUpdateDebounceTimer.current) {
            listUpdateDebounceTimer.current = window.setTimeout(() => {
                listRef.current?.resetAfterIndex(0);
                listUpdateDebounceTimer.current = 0;
            });
        }
    }, [listRef, rowHeights]);

    const scrollToBottom = () => {
        // listRef.current?.scrollToItem(messages.length, "smart");
        scrollDebounceTimer.current = 0;
        listElementRef.current?.scrollTo({
            behavior: "smooth",
            top: messages.map((_, index) => rowHeights[index] || defaultRowSize).reduce((a, b) => a + b, 0),
        })
    };

    useEffect(() => {
        if (followMessages && !scrollDebounceTimer.current) {
            scrollDebounceTimer.current = window.setTimeout(
                scrollToBottom, 100
            )
        }
    }, [messages, rowHeights]);

    return (
        <>
            <div
                style={{
                    padding: "1em",
                    boxSizing: "border-box",
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    gridTemplateRows: "3em 1fr auto",
                    overflow: "hidden",
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
                    <h3>Text Client - {messages.length}</h3>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "1em" }}>
                        <Checkbox
                            onChange={(event) => setFollowMessages(event.target.checked)}
                            label="Follow Messages"
                            checked={followMessages}
                        />
                        <PrimaryButton $tiny style={{ height: "20px" }} onClick={() => setShowFilterModal(true)}>
                            <Icon fontSize="12pt" type="filter_alt" />
                        </PrimaryButton>
                    </div>
                </div>
                <div
                    style={{
                        boxSizing: "border-box",
                        overflow: "hidden",
                    }}
                    ref={listContainerRef}
                >
                    <TextClientContext.Provider value={{ messages, setRowHeight, rowHeights: rowHeights }}>
                        <MessageList listRef={listRef} ref={listElementRef} {...listDim} />
                    </TextClientContext.Provider>
                </div>
                <TextClientTextBox />
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
                                    onChange={(event) =>
                                        updateItemSendFilter(event.target.checked, "progression", "own")
                                    }
                                />
                                <br />
                                <Checkbox
                                    label="Show Own Traps"
                                    disabled={!messageFilter.allowedTypes.includes("item")}
                                    checked={messageFilter.itemSendFilter.own.includes("trap")}
                                    onChange={(event) => updateItemSendFilter(event.target.checked, "trap", "own")}
                                />
                                <br />
                                <Checkbox
                                    label="Show Own Useful"
                                    disabled={!messageFilter.allowedTypes.includes("item")}
                                    checked={messageFilter.itemSendFilter.own.includes("useful")}
                                    onChange={(event) => updateItemSendFilter(event.target.checked, "useful", "own")}
                                />
                                <br />
                                <Checkbox
                                    label="Show Own Normal"
                                    disabled={!messageFilter.allowedTypes.includes("item")}
                                    checked={messageFilter.itemSendFilter.own.includes("normal")}
                                    onChange={(event) => updateItemSendFilter(event.target.checked, "normal", "own")}
                                />
                            </div>
                            <div style={{ width: "30%", flex: "0 1 50%" }}>
                                <p>Filter items based on what others send or receive</p>
                                <Checkbox
                                    label="Show Other's Progression"
                                    disabled={!messageFilter.allowedTypes.includes("item")}
                                    checked={messageFilter.itemSendFilter.others.includes("progression")}
                                    onChange={(event) =>
                                        updateItemSendFilter(event.target.checked, "progression", "others")
                                    }
                                />
                                <br />
                                <Checkbox
                                    label="Show Other's Traps"
                                    disabled={!messageFilter.allowedTypes.includes("item")}
                                    checked={messageFilter.itemSendFilter.others.includes("trap")}
                                    onChange={(event) => updateItemSendFilter(event.target.checked, "trap", "others")}
                                />
                                <br />
                                <Checkbox
                                    label="Show Other's Useful"
                                    disabled={!messageFilter.allowedTypes.includes("item")}
                                    checked={messageFilter.itemSendFilter.others.includes("useful")}
                                    onChange={(event) => updateItemSendFilter(event.target.checked, "useful", "others")}
                                />
                                <br />
                                <Checkbox
                                    label="Show Other's Normal"
                                    disabled={!messageFilter.allowedTypes.includes("item")}
                                    checked={messageFilter.itemSendFilter.others.includes("normal")}
                                    onChange={(event) => updateItemSendFilter(event.target.checked, "normal", "others")}
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
        </>
    );
};

export default TextClient;
