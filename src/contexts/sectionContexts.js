// @ts-check

import { createContext } from "react";

/**
 * @typedef Theme
 * @prop {String} name
 * @prop {String} color
 * 
 */
/** @type {React.Context<Map<string, Theme>>} */
const SectionThemesContext = createContext(new Map([["default", {name: "default", color:"#000000"}]]));

/** @type {React.Context<*>} */
const SectionConfigurationContext = createContext(null);

export {SectionThemesContext, SectionConfigurationContext}