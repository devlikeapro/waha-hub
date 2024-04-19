import type {IHubServerAPI, ServerId, ServerInfo, Version} from "../IHubServerAPI";
import type {Session, SessionStatus} from "../Session";
// @ts-ignore
import lodash from 'lodash'
import {sleep} from "./utils";

export class HubServerAPIMock implements IHubServerAPI {
    constructor() {
        this.fakeData();
    }

    private servers: ServerInfo[] = [];

    async add(data: ServerInfo): Promise<void> {
        const server = lodash.cloneDeep(data)
        server.id = `waha_${Math.random().toString().slice(2)}`
        this.servers.push(server)
    }

    async get(id: ServerId): Promise<ServerInfo> {
        const server = this.servers.find(server => server.id === id);
        if (!server) {
            throw new Error(`Server ${id} not found`);
        }
        return server;
    }

    async list(): Promise<ServerInfo[]> {
        return this.servers;
    }

    async remove(id: ServerId): Promise<void> {
        this.servers = this.servers.filter(server => server.id !== id);
    }

    async edit(id: ServerId, data: ServerInfo): Promise<void> {
        if (!data) {
            throw new Error('data is required')
        }
        const server = this.servers.find(server => server.id === id);
        if (!server) {
            throw new Error(`Server '${id}' not found`);
        }
        this.servers[this.servers.indexOf(server)] = data;
    }


    fakeData() {
        this.servers = [
            {
                id: 'waha_111111111111111111111111111',
                name: 'Server 1',
                connection: {
                    url: 'http://localhost:3000',
                },
            },
            {
                id: 'waha_222222222222222222222222222',
                name: 'Server 2',
                connection: {
                    url: 'http://localhost:3001',
                    key: '123',
                },
            },
            {
                id: 'waha_000000000000000000000000000',
                name: 'Server Failed',
                connection: {
                    url: 'http://localhost:3001',
                },
            },
        ];
    }
}
