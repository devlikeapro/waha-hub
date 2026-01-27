import type {ServerInfo} from "../hub/IHubServerAPI";

export interface Hmac {
    key: string
}

export interface WebhookRetry {
    attempts: number,
    delaySeconds: number,
    policy?: "linear" | "exponential" | "constant"
}

export interface Webhook {
    url: string,
    events: string[],
    hmac?: Hmac,
    retries?: WebhookRetry,
}

export interface NowebStoreConfig {
    enabled: boolean,
    fullSync: boolean,
}

export interface NowebConfig {
    markOnline: boolean,
    store?: NowebStoreConfig
}

export interface WebjsConfig {
    tagsEventsOn: boolean,
}

export interface GowsStorageConfig {
    messages?: boolean | null,
    groups?: boolean | null,
    chats?: boolean | null,
    labels?: boolean | null,
}

export interface GowsConfig {
    storage?: GowsStorageConfig,
}

export interface ClientSessionConfig {
    deviceName?: string;
    browserName?: string;
}

export interface IgnoreConfig {
    status?: boolean,
    groups?: boolean,
    channels?: boolean,
    broadcast?: boolean,
}

export interface SessionConfig {
    metadata: any,
    webhooks: Webhook[];
    proxy: any;
    noweb?: NowebConfig;
    webjs?: WebjsConfig;
    gows?: GowsConfig;
    client?: ClientSessionConfig | null;
    ignore?: IgnoreConfig;
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
    name?: SessionName;
    config: SessionConfig;
    start: boolean
}

export interface App {
    id: string;
    session: string;
    app: string;
    config: any;
    // If true, the app is enabled. Optional for backward compatibility
    enabled?: boolean;
}

export interface ApiKeyRequest {
    isAdmin: boolean;
    session: string | null;
    isActive: boolean;
}

export interface ApiKeyDTO {
    id: string;
    key: string;
    isActive: boolean;
    isAdmin: boolean;
    session?: string | null;
}

export enum LinkPreview {
    OFF = 'OFF',
    LQ = 'LG',
    HQ = 'HG',
}

export interface ChatWootAppConfig {
    url: string;
    accountId: number;
    accountToken: string;
    inboxId: number;
    inboxIdentifier: string;
    locale: string;
    // Link preview quality for URLs in messages (optional)
    linkPreview?: LinkPreview;
    commands?: ChatWootCommandsConfig;
    // Optional set of message templates
    templates?: Record<string, string>;
    // Optional conversations configuration
    conversations?: ChatWootConversationsConfig;
}

export interface Locale {
    name: string;
    locale: string;
}

// App-level commands configuration
export interface ChatWootCommandsConfig {
    server: boolean;
    queue?: boolean;
}

// Conversations configuration for ChatWoot app
export type ConversationSort =
    | 'activity_newest'
    | 'created_newest'
    | 'created_oldest'
    | 'activity_oldest';

export type ConversationStatus = 'open' | 'pending' | 'snoozed' | 'resolved';

export interface ChatWootConversationsConfig {
    // required
    sort: ConversationSort;
    // optional: null means filter is off
    status?: ConversationStatus[] | null;
    // process message.ack events to mark ChatWoot conversations as read
    markAsRead?: boolean;
}

export interface CallsAppChannelConfig {
    reject: boolean;
    message?: string;
}

export interface CallsAppConfig {
    dm: CallsAppChannelConfig;
    group: CallsAppChannelConfig;
}
