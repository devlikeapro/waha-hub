import type {CreateServerInfo, IHubServerAPI, ServerId, ServerInfo} from "../../hub/IHubServerAPI";

/**
 * Save in localstorage all information about servers
 */
export class HubServerLocalAPI implements IHubServerAPI {
    private localStorageKey = 'servers';
    private limit = 1;

    private save(servers: ServerInfo[]) {
        localStorage.setItem(this.localStorageKey, JSON.stringify(servers));
    }

    /**
     * Get the current website address and add it as WAHA server
     */

    private load(): ServerInfo[] {
        const data = localStorage.getItem(this.localStorageKey);
        if (!data) {
            return [{
                id: `waha_000000000000000001`,
                name: 'WAHA',
                connection: {
                    url: window.location.origin,
                }
            }]
        }
        return JSON.parse(data);
    }

    async add(data: CreateServerInfo): Promise<void> {
        const servers = this.load();
        if (servers.length >= this.limit) {
            throw new Error("The WAHA Dashboard is designed to work with only one server. If you require centralized management, please use WAHA Hub instead.");
        }
        servers.push({
            id: `waha_${Math.random().toString().slice(2)}`,
            ...data
        });
        this.save(servers);
        return

    }

    async edit(id: ServerId, data: ServerInfo): Promise<void> {
        const servers = this.load();
        const index = servers.findIndex(server => server.id === id);
        if (index === -1) {
            throw new Error(`Server '${id}' not found`);
        }
        servers[index] = data;
        this.save(servers);
        return
    }

    async get(id: ServerId): Promise<ServerInfo> {
        const servers = this.load();
        const server = servers.find(server => server.id === id);
        if (!server) {
            throw new Error(`Server ${id} not found`);
        }
        return server;
    }

    async list(): Promise<ServerInfo[]> {
        return this.load();
    }

    remove(id: ServerId): Promise<void> {
        const servers = this.load();
        const index = servers.findIndex(server => server.id === id);
        if (index === -1) {
            throw new Error(`Server '${id}' not found`);
        }
        servers.splice(index, 1);
        this.save(servers);
        return
    }
}
