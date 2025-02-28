import { createContext } from "react";
import { InventoryManager } from "../services/inventory/inventoryManager";
import { CheckManager } from "../services/checks/checkManager";
import { GroupManager } from "../services/sections/groupManager";
import { EntranceManager } from "../services/entrances/entranceManager";
import { Connector } from "../services/connector/connector";
import { SectionManager } from "../services/sections/sectionManager";
import { TagManager } from "../services/tags/tagManager";
import { OptionManager } from "../services/options/optionManager";

interface _ServiceContext {
    checkManager?: CheckManager;
    inventoryManager?: InventoryManager;
    groupManager?: GroupManager;
    entranceManager?: EntranceManager;
    connector?: Connector;
    sectionManager?: SectionManager;
    tagManager?: TagManager;
    optionManager?: OptionManager;
}
const ServiceContext: React.Context<_ServiceContext> = createContext({})


export default ServiceContext