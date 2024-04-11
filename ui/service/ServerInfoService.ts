class ServerInfo {
    constructor(public id: string, public name: string) {

    }
}

interface IServerInfoService {
    get(id: string): ServerInfo;

    list(): ServerInfo[];

    remove(id: string): void;

    edit(id: string, data: ServerInfo): void;
}

class ServerInfoService implements IServerInfoService {
    private servers: ServerInfo[] = [];

    get(id: string): ServerInfo {
        return this.servers.find(server => server.id === id);
    }

    list(): ServerInfo[] {
        return this.servers;
    }

    remove(id: string): void {
        this.servers = this.servers.filter(server => server.id !== id);
    }

    edit(id: string, data: ServerInfo): void {
        const server = this.servers.find(server => server.id === id);
        if (server) {
            server.name = data.name;
        }
    }
}
