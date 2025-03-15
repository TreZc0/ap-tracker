// @ts-check
import React, {
    useContext,
    useMemo,
    useState,
    useSyncExternalStore,
} from "react";
import CheckView from "./CheckView";
import ServiceContext from "../../contexts/serviceContext";
import Icon from "../icons/icons";
import useOption from "../../hooks/optionHook";

/**
 *
 * @param options
 * @param options.name The name of the registered section
 * @param options.context Unused
 * @param options.startOpen Sections will start open instead of closed if true
 * @returns
 */
const SectionView = ({
    name,
    context,
    startOpen,
}: {
    name: string;
    context: unknown;
    startOpen?: boolean;
}) => {
    const isClosable = name !== "root";
    const [isOpen, setIsOpen] = useState(
        isClosable ? startOpen ?? false : true
    );
    const serviceContext = useContext(ServiceContext);
    const sectionManager = serviceContext.sectionManager;
    const checkManager = serviceContext.checkManager;
    const tagManager = serviceContext.tagManager;
    const optionManager = serviceContext.optionManager;
    if (!sectionManager) {
        throw new Error("No group context provided");
    }
    if (!optionManager) {
        throw new Error("No option manager provided");
    }
    const section = useSyncExternalStore(
        sectionManager.getSubscriberCallback(name),
        () => sectionManager.getSectionStatus(name),
        () => sectionManager.getSectionStatus(name)
    );
    const style = {
        borderLeft: `2px dashed ${section?.theme.color ?? "Black"}`,
        paddingLeft: "0.5em",
        marginLeft: "0.5em",
        minWidth: "10em",
    };

    const clearedCheckCount =
        (section?.checkReport.checked.size ?? 0) +
        (section?.checkReport.ignored.size ?? 0);
    const totalCheckCount = section?.checkReport.exist.size ?? 0;
    const checkedLocationBehavior_ = useOption(
        optionManager,
        "checkedLocationBehavior",
        "global"
    );
    const checkedLocationBehavior = checkedLocationBehavior_ ?? "nothing";

    const clearedSectionBehavior_ = useOption(
        optionManager,
        "clearedSectionBehavior",
        "global"
    );
    const clearedSectionBehavior = clearedSectionBehavior_ ?? "nothing";

    const checkOrderBehavior_ = useOption(
        optionManager,
        "checkOrderBehavior",
        "global"
    );
    const checkOrderBehavior = checkOrderBehavior_ ?? "lexical";

    const checks = useMemo(() => {
        const checkNames = [...(section?.checks.keys() ?? [])];
        if (checkOrderBehavior === "lexical") {
            checkNames.sort();
        } else if (checkOrderBehavior === "id") {
            checkNames.sort(
                (a, b) =>
                    checkManager.getCheckStatus(b).id -
                    checkManager.getCheckStatus(a).id
            );
        }
        return checkNames;
    }, [checkOrderBehavior, section?.checks, checkManager]);

    return (
        <>
            {section?.checkReport.exist.size === 0 ? (
                <></> // Hide empty sections
            ) : (
                <div style={style}>
                    <h3
                        style={{ cursor: isClosable ? "pointer" : "default" }}
                        className={`section_title ${
                            section?.checkReport.checked.size ===
                            section?.checkReport.exist.size
                                ? "checked"
                                : ""
                        }`}
                        onClick={() => {
                            if (isClosable) {
                                setIsOpen(!isOpen);
                            }
                        }}
                    >
                        {section?.title ?? "Unloaded Section"}{" "}
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
                                                section?.checkReport.tagTotals.get(
                                                    id
                                                )?.size ?? 0
                                            }`}{" "}
                                    </i>
                                );
                            }
                        )}
                        {isClosable ? (isOpen ? " ▲ " : " ▼ ") : ""}
                    </h3>
                    {isOpen && (
                        <>
                            <div>
                                {checks.map(
                                    (check) =>
                                        check &&
                                        (!section?.checks.get(check)?.checked ||
                                            checkedLocationBehavior ===
                                                "nothing") && (
                                            <CheckView
                                                check={check}
                                                key={check}
                                            />
                                        )
                                )}
                            </div>
                            {checkedLocationBehavior === "separate" && (
                                <div>
                                    {checks.map(
                                        (check) =>
                                            check &&
                                            section?.checks.get(check)
                                                ?.checked && (
                                                <CheckView
                                                    check={check}
                                                    key={check}
                                                />
                                            )
                                    )}
                                </div>
                            )}
                            {section?.children &&
                                section.children.map((childName) => {
                                    const child =
                                        sectionManager.getSectionStatus(
                                            childName
                                        );
                                    if (
                                        child &&
                                        (clearedSectionBehavior === "nothing" ||
                                            ((clearedSectionBehavior ===
                                                "hide" ||
                                                clearedSectionBehavior ===
                                                    "separate") &&
                                                child.checkReport.checked
                                                    .size !==
                                                    child.checkReport.exist
                                                        .size))
                                    ) {
                                        return (
                                            <SectionView
                                                name={childName}
                                                context={context}
                                                key={childName}
                                                startOpen={startOpen}
                                            />
                                        );
                                    }
                                    return <React.Fragment key={childName} />;
                                })}
                            {clearedSectionBehavior === "separate" &&
                                section?.children &&
                                section.children.map((childName) => {
                                    const child =
                                        sectionManager.getSectionStatus(
                                            childName
                                        );
                                    if (
                                        child &&
                                        child.checkReport.checked.size ===
                                            child.checkReport.exist.size
                                    ) {
                                        return (
                                            <SectionView
                                                name={childName}
                                                context={context}
                                                key={childName}
                                                startOpen={startOpen}
                                            />
                                        );
                                    }
                                    return <React.Fragment key={childName} />;
                                })}
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default SectionView;
