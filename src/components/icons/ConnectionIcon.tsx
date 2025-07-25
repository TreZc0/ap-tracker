"use client";
import React from "react";
import { CONNECTION_STATUS } from "../../services/connector/connector";
import styled from "styled-components";

/**
 * A simple SVG component that displays the letters "MWGG".
 * The fill color adapts based on connection status:
 * - Connecting/Connected: primary color
 * - Disconnected: gray
 * - Error: red
 */
const ConnectionIcon = ({ status }: { status: string }) => {
  let fillColor: string;
  switch (status) {
    case CONNECTION_STATUS.connecting:
    case CONNECTION_STATUS.connected:
      fillColor = "#7579E7"; // primary
      break;
    case CONNECTION_STATUS.disconnected:
      fillColor = "#888888"; // gray
      break;
    case CONNECTION_STATUS.error:
    default:
      fillColor = "#E4572E"; // error red
      break;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      role="img"
      aria-label="MWGG Logo"
      height="48"
    >
      <text
        x="0"
        y="40"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="40"
        fill={fillColor}
        fontWeight="bold"
      >
        MWGG
      </text>
    </svg>
  );
};

export default ConnectionIcon;