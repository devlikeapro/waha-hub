import {IServerService, ServerInfo} from "./IServerService";

export class InMemoryServerService implements IServerService {
    constructor() {
        this.fakeData();
    }
    private servers: ServerInfo[] = [];

    async get(id: string): Promise<ServerInfo> {
        return this.servers.find(server => server.id === id);
    }

    async list(): Promise<ServerInfo[]> {
        return this.servers;
    }

    async remove(id: string): Promise<void> {
        this.servers = this.servers.filter(server => server.id !== id);
    }

    async edit(id: string, data: ServerInfo): Promise<void> {
        const server = this.servers.find(server => server.id === id);
        if (server) {
            server.name = data.name;
        }
    }

    fakeData() {
        this.servers = [
            {
                id: 'waha_000000000000000000000000000',
                name: 'Server 1',
                connection: {
                    url: 'http://localhost:3000',
                    key: '123',
                },
            },
            {
                id: 'waha_111111111111111111111111111',
                name: 'Server 2',
                connection: {
                    url: 'http://localhost:3001',
                    key: '123',
                },
            },
        ];
    }
}
