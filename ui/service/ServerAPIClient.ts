import {ServerId} from "./IHubServerAPI";
import {HTTPRequest} from "./HTTPRequest";

export interface ServerAPIClient {
    call(serverId: ServerId, request: HTTPRequest): Promise<any>;
}
