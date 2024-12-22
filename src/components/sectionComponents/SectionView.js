// @ts-check
import React, { useContext, useState, useSyncExternalStore } from "react";
import CheckView from "./CheckView";
import ServiceContext from "../../contexts/serviceContext";
import Icon from "../icons/icons";

/**
 * @typedef Condition
 * @prop {string} [option]
 * @prop {Condition} [not]
 * @prop {string} [state]
 * @prop {*} [is]
 * @prop {Condition} [and]
 * @prop {Condition} [or]
 */

/**
 *
 * @param {{name: String, context: *}} param0
 * @returns
 */
const SectionView = ({ name, context }) => {
    const isClosable = name !== "root";
    const [isOpen, setIsOpen] = useState(isClosable ? false : true);
    const serviceContext = useContext(ServiceContext);
    const sectionManager = serviceContext.sectionManager;
    const tagManager = serviceContext.tagManager;
    if (!sectionManager) {
        throw new Error("No group context provided");
    }
    const section = useSyncExternalStore(
        sectionManager.getSubscriberCallback(name),
        () => sectionManager.getSectionStatus(name),
        () => sectionManager.getSectionStatus(name)
    );
    const style = {
        borderLeft: `1px dashed ${section?.theme.color ?? "Black"}`,
        paddingLeft: "0.5em",
        marginLeft: "0.5em",
    };

    const clearedCheckCount =
        (section?.checkReport.checked.size ?? 0) +
        (section?.checkReport.ignored.size ?? 0);
    const totalCheckCount = section?.checkReport.exist.size ?? 0;

    return (
        <div style={style}>
            <h3
                style={{ cursor: isClosable ? "pointer" : "default" }}
                className={"section_title"}
                onClick={() => {
                    if (isClosable) {
                        setIsOpen(!isOpen);
                    }
                }}
            >
                {section?.title ?? "Null Section"}{" "}
                <i>
                    {clearedCheckCount}
                    {"/"}
                    {totalCheckCount}
                </i>{" "}
                {[...(section?.checkReport.tagCounts ?? [])].map(
                    ([id, values]) => {
                        const counterType = tagManager?.getCounter(id);
                        return (
                            <i
                                key={id}
                                style={{ color: counterType?.color }}
                                title={counterType?.displayName}
                            >
                                {counterType?.icon && (
                                    <Icon
                                        fontSize="14px"
                                        type={counterType.icon}
                                    />
                                )}
                                {values.size}
                                {counterType?.showTotal &&
                                    `/${
                                        section?.checkReport.tagTotals.get(id)
                                            ?.size ?? 0
                                    }`}
                            </i>
                        );
                    }
                )}
                {isClosable ? (isOpen ? " ▲ " : " ▼ ") : ""}
            </h3>
            {isOpen && (
                <>
                    <div>
                        {[...(section?.checks.keys() ?? [])].map(
                            (check) =>
                                check &&
                                !section?.checks.get(check)?.checked && (
                                    <CheckView check={check} key={check} />
                                )
                        )}
                    </div>
                    <div>
                        {[...(section?.checks.keys() ?? [])].map(
                            (check) =>
                                check &&
                                section?.checks.get(check)?.checked && (
                                    <CheckView check={check} key={check} />
                                )
                        )}
                    </div>
                    {section?.children &&
                        section.children.map(
                            (child) =>
                                child && (
                                    <SectionView
                                        name={child}
                                        context={context}
                                        key={child}
                                    />
                                )
                        )}
                </>
            )}
        </div>
    );
};

export default SectionView;
