import {IWahaAPIClient} from "../../waha/IWahaAPIClient";
import {HTTPRequest} from "../../waha/HTTPRequest";
import {ServerConnection, ServerId, ServerInfo} from "../../hub/IHubServerAPI";
import axios from "axios";


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
        const headers = {
            'Content-Type': 'application/json',
            "Accept": "application/json",
            ...(request.headers || {}),
        }
        if (connection.key) {
            headers['X-Api-Key'] = connection.key
        }

        return axios({
            method: request.method,
            url: url,
            headers: headers,
            data: request.body,
            params: request.params,
        })
            .then(response => response.data)
            .catch((error) => {
                const message =
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    error?.message ||
                    'Request failed'
                const wrapped = new Error(message)
                wrapped.response = error?.response
                throw wrapped
            })
    }
}
