import {IServerService, ServerInfo} from "./IServerService";
import {Session} from "./Session";

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

    async getVersion(id: string): Promise<String> {
        return "1.0.0";
    }

    async getSessions(id: string): Promise<Session[]> {
        return [
            {
                name: `Session 1 - ${id}`,
                status: 'WORKING',
                config: {},
            },
            {
                name: `Session 2 - ${id}`,
                status: id.endsWith("111") ? 'STOPPED' : "WORKING",
                config: {},
            },
            {
                name: `Session 3 - ${id}`,
                status: id.endsWith("111") ? 'SCAN_QR_CODE' : "WORKING",
                config: {},
            },
            {
                name: `Session 4 - ${id}`,
                status: id.endsWith("111") ? 'FAILED' : "WORKING",
                config: {},
            },
            {
                name: `Session 5 - ${id}`,
                status: id.endsWith("111") ? 'STARTING' : "WORKING",
                config: {},
            }
        ];
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
