import type {IServerService, ServerInfo} from "./IServerService";
import lodash from 'lodash'
import type {Session} from "./Session";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class InMemoryServerService implements IServerService {
    constructor() {
        this.fakeData();
    }

    private servers: ServerInfo[] = [];

    async add(data: ServerInfo): Promise<void> {
        const server = lodash.cloneDeep(data)
        server.id = `waha_${Math.random().toString().slice(2)}`
        this.servers.push(server)
    }

    async get(id: string): Promise<ServerInfo> {
        const server = this.servers.find(server => server.id === id);
        if (!server) {
            throw new Error(`Server ${id} not found`);
        }
        return server;
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

    async getVersion(id: string): Promise<string> {
        await sleep(1000)
        if (id.endsWith("111")) {
            return "1.1.1";
        }
        return "1.0.0";
    }

    async getSessions(id: string): Promise<Session[]> {
        await sleep(1000)
        const differentStatuses = id.endsWith("111");
        return [
            {
                name: `Session 1 - ${id}`,
                status: 'WORKING',
                config: {},
            },
            {
                name: `Session 2 - ${id}`,
                status: differentStatuses ? 'STOPPED' : "WORKING",
                config: {},
            },
            {
                name: `Session 3 - ${id}`,
                status: differentStatuses ? 'SCAN_QR_CODE' : "WORKING",
                config: {},
            },
            {
                name: `Session 4 - ${id}`,
                status: differentStatuses ? 'FAILED' : "WORKING",
                config: {},
            },
            {
                name: `Session 5 - ${id}`,
                status: differentStatuses ? 'STARTING' : "WORKING",
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
