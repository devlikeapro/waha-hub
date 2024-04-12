export interface ServerConnection {
    url: string;
    key?: string;
}

export interface ServerInfo {
    id: string,
    name: string,
    connection: ServerConnection,
}

export interface IServerService {
    get(id: string): Promise<ServerInfo>;

    list(): Promise<ServerInfo[]>;

    remove(id: string): Promise<void>;

    edit(id: string, data: ServerInfo): Promise<void>;
}
