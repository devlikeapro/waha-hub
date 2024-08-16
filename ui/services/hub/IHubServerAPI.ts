export type ServerId = string;

export interface ServerConnection {
    url: string;
    key?: string;
}

export interface ServerInfo {
    id: ServerId,
    name: string,
    connection: ServerConnection,
    version?: Version,
    status?: ServerStatus,
    connected?: boolean,
}

export interface CreateServerInfo {
    name: string,
    connection: ServerConnection,
}

export interface Version {
    version: string;
    engine: string;
}

export interface ServerStatus {
    startTimestamp: number,
    uptime: number,
}

export interface IHubServerAPI {
    add(data: CreateServerInfo): Promise<void>;

    get(id: ServerId): Promise<ServerInfo>;

    list(): Promise<ServerInfo[]>;

    remove(id: ServerId): Promise<void>;

    edit(id: ServerId, data: ServerInfo): Promise<void>;
}
