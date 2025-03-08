class TrieNode {
    children: Map<string, TrieNode>;
    count: number;
    constructor() {
        this.children = new Map();
        this.count = 0;
    }
}

class TrieTree {
    #root: TrieNode;
    #nameOptions: NameTokenizationOptions;
    constructor(nameDecomposeOptions: NameTokenizationOptions) {
        this.#nameOptions = nameDecomposeOptions;
        this.#root = new TrieNode();
    }
    #remove_r = (node: TrieNode, tokens: string[]): number => {
        if (tokens.length === 0) {
            return node.count;
        }
        if (node.children.has(tokens[0])) {
            let removalCount = this.#remove_r(node.children.get(tokens[0]), tokens.slice(1));
            node.count -= removalCount;
            if (tokens.length === 1 || node.children.get(tokens[0]).count === 0) {
                node.children.delete(tokens[0]);
            }
            return removalCount;
        }
        return 0;
    }
    remove = (prefix: string): boolean => {
        let removedCount = this.#remove_r(this.#root, tokenizeName(prefix, this.#nameOptions));
        return removedCount > 0;
    }
    insert = (word: string) => {
        let currentNode = this.#root;
        let prefix = "";
        let wordSegments = tokenizeName(word, this.#nameOptions);
        for (let i = 0; i < wordSegments.length; i++) {
            let segment = wordSegments[i];
            prefix += segment;
            if (!currentNode.children.has(segment)) {
                currentNode.children.set(segment, new TrieNode());
            }
            currentNode = currentNode.children.get(segment);
            currentNode.count += 1;
        }
    }

    mostFrequentPrefix = () => {
        let result: { prefix: string, count: number }[] = [];
        const depthFirstSearch = (node: TrieNode, tokens: string[]) => {
            if (node.count > 1) {
                result.push({
                    prefix: tokens.join(""),
                    count: node.count,
                })
            }
            for (const [token, child] of node.children.entries()) {
                let newPrefix = tokens.slice(0);
                newPrefix.push(token);
                depthFirstSearch(child, newPrefix);
            }

        }

        depthFirstSearch(this.#root, []);
        result.sort((a, b) => { if (b.count !== a.count) { return b.count - a.count } return b.prefix.length - a.prefix.length });
        return result[0];
    }
}

const isUpperCase = (char: string) => {
    if (char.toLowerCase() === char.toUpperCase()) {
        return false;
    }
    return char.toUpperCase() === char;
}

const isLowerToUpper = (a: string, b: string) => {
    return !isUpperCase(a) && isUpperCase(b);
}

type NameTokenizationOptions = {
    /** List of characters to segment/split on */
    splitCharacters?: string[],
    /** If true, names will be split on changes from lower to upper case */
    splitOnCase?: boolean,
    /** If true, names will be split into individual character tokens, ignoring other options */
    characterSplit?: boolean,
}

const tokenizeName = (name: string, tokenizationOptions: NameTokenizationOptions): string[] => {
    let result: string[] = [];
    let currentToken = "";
    if (tokenizationOptions.characterSplit) {
        return name.split("");
    }
    for (let i = 0; i < name.length; i++) {
        if (tokenizationOptions.splitCharacters && tokenizationOptions.splitCharacters.includes(name[i])) {
            result.push(currentToken);
            result.push(name[i]);
            currentToken = "";
            continue;
        }
        if (tokenizationOptions.splitOnCase && i - 1 >= 0 && !tokenizationOptions.splitCharacters.includes(name[i - 1]) && isLowerToUpper(name[i - 1], name[i])) {
            result.push(currentToken);
            currentToken = "";
        }
        currentToken += name[i];
    }
    if (currentToken) {
        result.push(currentToken);
    }
    return result;
}

const generateCategories = (checks: Set<string>, nameTokenizationOptions: NameTokenizationOptions, minGroupSize: number): Map<string, Set<string>> => {
    let tree = new TrieTree(nameTokenizationOptions);
    checks.forEach(check => tree.insert(check));
    let groups: Map<string, Set<string>> = new Map();
    let commonPrefix = tree.mostFrequentPrefix();
    console.log(commonPrefix);
    while (commonPrefix && commonPrefix.count >= minGroupSize) {
        let prefix = commonPrefix.prefix;
        groups.set(prefix, new Set());
        groups.set(prefix, new Set(checks.values().filter(checkName => checkName.indexOf(prefix) === 0)));
        checks = checks.difference(groups.get(prefix));
        tree.remove(prefix);
        commonPrefix = tree.mostFrequentPrefix();
    }
    if (checks.size > 0) {
        groups.set("Unorganized", checks);
    }
    console.log(groups);
    return groups;
}

const LocationNameCategoryGenerator = {
    generateCategories,
}

export default LocationNameCategoryGenerator;
export type { NameTokenizationOptions };