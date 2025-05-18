// @ts-check
import React, {
    useContext,
    useMemo,
    useState,
    useSyncExternalStore,
} from "react";
import LocationView from "./LocationView";
import ServiceContext from "../../contexts/serviceContext";
import Icon from "../icons/icons";
import useOption from "../../hooks/optionHook";
import { naturalSort } from "../../utility/comparisons";

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
        isClosable ? (startOpen ?? false) : true
    );
    const serviceContext = useContext(ServiceContext);
    const sectionManager = serviceContext.sectionManager;
    const locationManager = serviceContext.locationManager;
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

    const clearedLocationCount =
        (section?.checkReport.checked.size ?? 0) +
        (section?.checkReport.ignored.size ?? 0);
    const totalLocationCount = section?.checkReport.existing.size ?? 0;
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
    const checkOrderBehavior = checkOrderBehavior_ ?? "natural";

    const locations = useMemo(() => {
        const checkNames = [...(section?.checks.keys() ?? [])];
        if (checkOrderBehavior === "lexical") {
            checkNames.sort();
        } else if (checkOrderBehavior === "natural") {
            checkNames.sort(naturalSort);
        } else if (checkOrderBehavior === "id") {
            checkNames.sort(
                (a, b) =>
                    locationManager.getLocationStatus(b).id -
                    locationManager.getLocationStatus(a).id
            );
        }
        return checkNames;
    }, [checkOrderBehavior, section?.checks, locationManager]);

    return (
        <>
            {section?.checkReport.existing.size === 0 ? (
                <></> // Hide empty sections
            ) : (
                <div style={style}>
                    <h3
                        style={{ cursor: isClosable ? "pointer" : "default" }}
                        className={`section_title ${
                            section?.checkReport.checked.size ===
                            section?.checkReport.existing.size
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
                            {clearedLocationCount}
                            {"/"}
                            {totalLocationCount}
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
                                            `/${section?.checkReport.tagTotals.get(id)?.size ?? 0}`}{" "}
                                    </i>
                                );
                            }
                        )}
                        {isClosable ? (isOpen ? " ▲ " : " ▼ ") : ""}
                    </h3>
                    {isOpen && (
                        <>
                            <div>
                                {locations.map(
                                    (location) =>
                                        location &&
                                        (!section?.checks.get(location)
                                            ?.checked ||
                                            checkedLocationBehavior ===
                                                "nothing") && (
                                            <LocationView
                                                location={location}
                                                key={location}
                                            />
                                        )
                                )}
                            </div>
                            {checkedLocationBehavior === "separate" && (
                                <div>
                                    {locations.map(
                                        (location) =>
                                            location &&
                                            section?.checks.get(location)
                                                ?.checked && (
                                                <LocationView
                                                    location={location}
                                                    key={location}
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
                                                    child.checkReport.existing
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
                                            child.checkReport.existing.size
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
