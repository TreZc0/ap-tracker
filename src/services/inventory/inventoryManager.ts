
interface InventoryItem {
    name: string,
    id: number,
    progression: boolean,
    useful: boolean,
    trap: boolean,
    index: number,
    location: string,
    sender: string,
    local: boolean,
}

interface InventoryItemCollection {
    name: string,
    id: number,
    progression: boolean,
    useful: boolean,
    trap: boolean,
    index: number,
    count: number,
    items: InventoryItem[],
}

interface InventoryManager {
    /** Clears all items from inventory */
    clear: () => void,
    /** Adds one or more items to the inventory */
    addItem: (item: InventoryItem | InventoryItem[]) => void,
    /** Returns a callback that can have a listener passed in and returns a clean up call to remove the listener*/
    getSubscriberCallback: () => (listener: () => void) => () => void

    getItems: () => InventoryItemCollection[]
}

const createItemCollection = (item: InventoryItem): InventoryItemCollection => {
    return {
        ...item,
        items: [],
        count: 0,
    }
}

const createInventoryManager = (): InventoryManager => {
    const collectedItems: Map<number, InventoryItemCollection> = new Map();
    let cachedItemReturn: InventoryItemCollection[] = [];
    let cachedValueDirty = true;

    const subscribers: Set<() => void> = new Set();
    const callSubscribers = () => {
        subscribers.forEach((listener) => listener());
    }

    const getSubscriberCallback = () => {
        return (listener: () => void) => {
            subscribers.add(listener);
            return () => {
                subscribers.delete(listener);
            }
        }
    }

    const clear = () => {
        cachedValueDirty = true;
        collectedItems.clear();
        callSubscribers();
    }

    const addItemToCollection = (item: InventoryItem) => {
        let itemCollection = collectedItems.get(item.id) ?? createItemCollection(item);
        itemCollection.count++;
        itemCollection.progression ||= item.progression;
        itemCollection.useful ||= item.useful;
        itemCollection.trap ||= item.trap;
        itemCollection.index = Math.max(itemCollection.index, item.index);

        itemCollection.items = itemCollection.items.slice();
        itemCollection.items.push(item);
        collectedItems.set(item.id, itemCollection);
    }

    const addItem = (values: InventoryItem | InventoryItem[]) => {
        if (Array.isArray(values)) {
            values.forEach(addItemToCollection);
        } else {
            addItemToCollection(values);
        }
        cachedValueDirty = true;
        callSubscribers();
    }

    const getItems = (): InventoryItemCollection[] => {
        if (cachedValueDirty) {
            cachedItemReturn = [...collectedItems.values()].map(collection => ({ ...collection }));
            cachedValueDirty = false;
        }
        return cachedItemReturn;
    }

    return {
        clear,
        addItem,
        getItems,
        getSubscriberCallback,
    };
}

export { createInventoryManager }
export type { InventoryManager, InventoryItemCollection, InventoryItem }