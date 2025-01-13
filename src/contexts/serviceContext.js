// @ts-check
import { createContext } from "react";

/**
 * @typedef _ServiceContext
 * @prop {import("../services/checks/checkManager").CheckManager} [checkManager]
 * @prop {import("../services/sections/groupManager").GroupManager} [groupManager]
 * @prop {import("../services/entrances/entranceManager").EntranceManager} [entranceManager]
 * @prop {import("../services/connector/connector").Connector} [connector]
 * @prop {import("../services/sections/sectionManager").SectionManager} [sectionManager]
 * @prop {import("../services/tags/tagManager").TagManager} [tagManager]
 * @prop {import("../services/options/optionManager").OptionManager} [optionManager]
 */
/** @type {React.Context<_ServiceContext>} */
const ServiceContext = createContext({})


export default ServiceContext