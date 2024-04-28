import {IWahaAPIClient} from "../../waha/IWahaAPIClient";
import {HTTPRequest} from "../../waha/HTTPRequest";
import {IHubServerAPI, ServerConnection, ServerId, ServerInfo} from "../../hub/IHubServerAPI";


interface ServerResolver {
    get(id: ServerId): Promise<ServerInfo>
}

/**
 * Call directly API using axios
 */
export class WahaAPIDirectClient implements IWahaAPIClient {
    constructor(private resolver: ServerResolver) {
    }

    async resolve(id: ServerId): Promise<ServerConnection> {
        return this.resolver.get(id).then(server => server.connection)
    }

    async call(serverId: string, request: HTTPRequest): Promise<any> {
        const connection = await this.resolve(serverId)
        let url = new URL(request.uri, connection.url).toString()
        if (request.params) {
            const params = new URLSearchParams(request.params)
            url = `${url}?${params.toString()}`
        }
        const headers = {
            'Content-Type': 'application/json',
        }
        if (connection.key) {
            headers['Authorization'] = `Bearer ${connection.key}`
        }
        const response = await fetch(url, {
            method: request.method,
            headers: headers,
            body: JSON.stringify(request.body),
        })
        return await response.json()
    }
}
