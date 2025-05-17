import React, { useContext, useState } from "react";
import ServiceContext from "../../contexts/serviceContext";
import { PrimaryButton } from "../buttons";
import { Input } from "../inputs";

const TextClientTextBox = () => {
    const services = useContext(ServiceContext);
    const textClientManager = services.textClientManager;
    const [inputText, setInputText] = useState("");
    const [cachedInputText, setCachedInputText] = useState("");
    const [inputHistory, setInputHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
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
    return (
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
            />
        </div>
    );
};
export default TextClientTextBox;
