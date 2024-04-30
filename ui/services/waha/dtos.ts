import type {ServerInfo} from "../hub/IHubServerAPI";

export interface Hmac {
    key: string
}

export interface WebhookRetry {
    attempts: number,
    delaySeconds: number,
}

export interface Webhook {
    url: string,
    events: string[],
    hmac?: Hmac,
    retries?: WebhookRetry,
}

export interface SessionConfig {
    webhooks: Webhook[];
    proxy: any;
}

export type SessionStatus = "STOPPED" | "STARTING" | "SCAN_QR_CODE" | "WORKING" | "FAILED";
export type SessionMe = {
    id: string;
    pushName: string
}

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
    me?: SessionMe;
}

export interface SessionStartRequest {
    name: SessionName;
    config: SessionConfig;
}
