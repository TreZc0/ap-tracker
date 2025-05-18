import React, { useCallback, useContext, useEffect, useRef, useState, createContext, forwardRef } from "react";
import { useTextClientMessages } from "../../hooks/textClientHook";
import ServiceContext from "../../contexts/serviceContext";
import ClientMessage from "./ClientMessage";
import { PrimaryButton } from "../buttons";
import { Checkbox } from "../inputs";
import Icon from "../icons/icons";
import { APMessage } from "../../services/textClientManager";
import { VariableSizeList } from "react-window";
import TextClientTextBox from "./TextClientTextBox";
import TextClientFilterModal from "./TextClientFilterModal";
import PanelHeader from "../shared/PanelHeader";

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
    const textClientManager = services.textClientManager;
    const messages = useTextClientMessages(textClientManager);

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [followMessages, setFollowMessages] = useState(true);
    const [rowHeights, setRowHeights] = useState({});
    const [listDim, setListDim] = useState({ width: 0, height: 0 });
    const listUpdateDebounceTimer = useRef(0);
    const scrollDebounceTimer = useRef(0);
    const listContainerRef: React.ForwardedRef<HTMLDivElement> = useRef(null);
    const listRef: React.ForwardedRef<VariableSizeList> = useRef(null);
    const listElementRef: React.ForwardedRef<HTMLElement> = useRef(null);

    // Monitor the container size of the list to pass the size to the Variable Size list
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
    }, [listContainerRef.current]);

    // used to update the reported height of each row
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
        const totalListHeight = messages
            .map((_, index) => rowHeights[index] || defaultRowSize)
            .reduce((a, b) => a + b, 0);
        scrollDebounceTimer.current = 0;
        listElementRef.current?.scrollTo({
            behavior: "smooth",
            top: totalListHeight,
        });
    };

    // Scroll to bottom when followMessages is enabled, new messages come in, or a row size change happens
    useEffect(() => {
        if (followMessages && !scrollDebounceTimer.current) {
            scrollDebounceTimer.current = window.setTimeout(scrollToBottom, 100);
        }
    }, [messages, rowHeights, followMessages]);

    return (
        <>
            <div
                style={{
                    boxSizing: "border-box",
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    gridTemplateRows: "3em 1fr auto",
                    overflow: "hidden",
                }}
            >
                <PanelHeader title={"Text Client"}>
                    <Checkbox
                        onChange={(event) => setFollowMessages(event.target.checked)}
                        label="Follow Messages"
                        checked={followMessages}
                    />
                    <PrimaryButton $tiny style={{ height: "20px" }} onClick={() => setShowFilterModal(true)}>
                        <Icon fontSize="12pt" type="filter_alt" />
                    </PrimaryButton>
                </PanelHeader>
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
            <TextClientFilterModal open={showFilterModal} onClose={() => setShowFilterModal(false)} />
        </>
    );
};

export default TextClient;
