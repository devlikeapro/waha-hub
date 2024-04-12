export interface SessionConfig {
}

export interface Session {
    name: string;
    status: "STOPPED" | "STARTING" | "SCAN_QR_CODE" | "WORKING" | "FAILED";
    config: SessionConfig;
}
