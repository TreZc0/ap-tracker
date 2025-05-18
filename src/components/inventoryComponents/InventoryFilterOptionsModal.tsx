import React, { useContext } from "react";
import Modal from "../shared/Modal";
import InventorySettings from "../optionsComponents/InventorySettings";
import ServiceContext from "../../contexts/serviceContext";
import ButtonRow from "../LayoutUtilities/ButtonRow";
import { GhostButton } from "../buttons";
const InventoryFilterOptionsModal = ({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) => {
    const services = useContext(ServiceContext);
    const optionManager = services.optionManager;
    return (
        <Modal open={open}>
            <h2>Inventory Filters</h2>
            <div>
                <InventorySettings optionManager={optionManager} />
            </div>
            <ButtonRow>
                <GhostButton onClick={onClose}>Close</GhostButton>
            </ButtonRow>
        </Modal>
    );
};

export default InventoryFilterOptionsModal;
