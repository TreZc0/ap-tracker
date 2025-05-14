import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useTextClientMessages } from "../../hooks/textClientHook";
import ServiceContext from "../../contexts/serviceContext";
import ClientMessage from "./ClientMessage";
import StickySpacer from "../shared/StickySpacer";
import useOnScreen from "../../hooks/onScreenHook";
import { GhostButton, PrimaryButton } from "../buttons";
import { Input } from "../inputs";
import useOption from "../../hooks/optionHook";
import Modal from "../shared/Modal";
import ButtonRow from "../LayoutUtilities/ButtonRow";
import Icon from "../icons/icons";

const TextClient = () => {
    const services = useContext(ServiceContext);
    const optionManager = services.optionManager;
    const textClientManager = services.textClientManager;
    const [showFilterModal, setShowFilterModal] = useState(false);
    const messages = useTextClientMessages(textClientManager);
    const bottomRef = useRef(null);
    const messagesWindowRef = useRef(null);
    const shouldScroll = useOnScreen(bottomRef, messagesWindowRef);
    const scrollTimeoutRef = useRef(null);
    const [inputText, setInputText] = useState("");
    const [cachedInputText, setCachedInputText] = useState("");
    const [inputHistory, setInputHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const itemSendsFilter_option = useOption(
        optionManager,
        "itemSendsFilter",
        "textClient"
    ) as "all" | "own" | "own+prog+use+trap" | "prog+use+trap";
    const itemSendsFilter = itemSendsFilter_option ?? "all";

    const processInput = () => {
        if (inputText) {
            setInputHistory([inputText, ...inputHistory]);
            textClientManager.processInput(
                inputText,
                services.connector?.connection.client
            );
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

    const scrollToBottom = useCallback(() => {
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            scrollTimeoutRef.current = null;
        }, 10);
    }, [shouldScroll, messages, bottomRef, scrollTimeoutRef]);

    useEffect(() => {
        scrollToBottom();
    }, []);
    useEffect(() => {
        if (shouldScroll) {
            scrollToBottom();
        }
    }, [messages, shouldScroll, bottomRef]);

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
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <PrimaryButton
                        $tiny
                        style={{ height: "20px" }}
                        onClick={() => setShowFilterModal(true)}
                    >
                        <Icon fontSize="12pt" type="filter_alt" />
                    </PrimaryButton>
                </div>
            </div>
            <div
                style={{
                    overflowY: "auto",
                    scrollBehavior: "smooth",
                    padding: "0.25em",
                }}
                ref={messagesWindowRef}
            >
                {!textClientManager && (
                    <h1>Failed to load text client (no manager provided)</h1>
                )}
                {textClientManager &&
                    messages.map((message) => (
                        <ClientMessage key={message.key} message={message} />
                    ))}
                <div ref={bottomRef}></div>
                <StickySpacer />
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
                        <h3>Item filters</h3>
                        <label htmlFor={"send_filter"}>Filter: </label>
                        <select
                            className="interactive"
                            id={"send_filter"}
                            value={itemSendsFilter ?? "all"}
                            onChange={(event) => {
                                const value = event.target.value;
                                if (value) {
                                    optionManager.setOptionValue(
                                        "itemSendsFilter",
                                        "textClient",
                                        value
                                    );
                                    optionManager.saveScope("textClient");
                                }
                            }}
                        >
                            <option value="all">Show all</option>
                            <option value="own">Show own</option>
                            <option value="prog+use+trap">
                                Show all non-normal
                            </option>
                            <option value="own+prog+use+trap">
                                Show own and all non-normal
                            </option>
                        </select>
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
