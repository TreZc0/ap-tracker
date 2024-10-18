// @ts-check


/**
 * @typedef Game
 * @prop {string} title
 * @prop {string} title
 */
const games = {
    "Ocarina of Time": () => require("./OOT/oot.js")
}


const GameFactory = (gameName) => {
    
}

export { GameFactory };