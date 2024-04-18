import {ServerInfo} from "./ServerAPI";

export interface SessionConfig {
}

export type SessionStatus = "STOPPED" | "STARTING" | "SCAN_QR_CODE" | "WORKING" | "FAILED";

export const SessionStatuses = [
    "WORKING",
    "FAILED",
    "STARTING",
    "SCAN_QR_CODE",
    "STOPPED",
];

type SessionName = string;

export interface Session {
    name: SessionName;
    status: SessionStatus;
    config: SessionConfig;
    server?: ServerInfo;
}

export interface SessionStartRequest {
    name: SessionName;
    config: SessionConfig;
}
