// @ts-check
import React, { useContext, useState, useSyncExternalStore } from "react";
import ServiceContext from "../../contexts/serviceContext";
import Icon from "../icons/icons";
const CheckView = ({ check }) => {
    const [showDetails, setShowDetails] = useState(false);
    const serviceContext = useContext(ServiceContext);
    const checkManager = serviceContext.checkManager;
    if (!checkManager){
        throw new Error("No check manager provided");
    }
    const status = useSyncExternalStore(
        checkManager.getSubscriberCallback(check),
        () => checkManager.getCheckStatus(check),
        () => checkManager.getCheckStatus(check)
    );
    let classes = new Set(["section_check"]);
    if (status.checked || status.ignored) {
        classes.add("checked");
        if (status.ignored) {
            classes.add("ignored");
        }
    }

    let iconType = status.checked ? "check_small" : "check_indeterminate_small";
    let iconColor = "black";
    let tagTextColor = "black";
    if(status.tags.length > 0 && serviceContext.tagManager){
        let selectedTag = status.tags[0]
        let selectedTagType = serviceContext.tagManager.getTagType(selectedTag.typeID);
        for(let i = 1; i < status.tags.length; i++){
            const tag = status.tags[i];
            const tagType = serviceContext.tagManager.getTagType(tag.typeID);
            // TODO add checks for if the tag is still active or not
            if (tagType.priority > selectedTagType.priority){
                selectedTag = tag;
                selectedTagType = tagType;
            }
        }
        iconType = selectedTagType.icon;
        iconColor = selectedTagType.iconColor ?? iconColor;
        tagTextColor = selectedTagType.textColor ?? tagTextColor;
    }
    return (
        <>
            {status.exists && (
                <div
                    onClick={() => {
                        setShowDetails(!showDetails);
                    }}
                    className={[...classes].join(" ")}
                >
                    {<Icon fontSize='14px' type={iconType} style={{color:iconColor}}/>}
                    {check}
                    {showDetails && status.tags.map((tag) => <div key={tag.tagID} style={{marginLeft:"1rem", color:tagTextColor}}><Icon fontSize='14px' type={iconType} style={{color:iconColor}}/>{tag.text}</div>)}
                </div>
            )}
        </>
    );
};

export default CheckView;
