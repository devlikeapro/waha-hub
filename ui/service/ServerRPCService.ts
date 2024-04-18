import {ServerId} from "./ServerAPI";
import {Session, SessionStartRequest} from "./Session";

export interface RPCRequest {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    uri: string;
    params: any;
    body?: any;
}

export interface RPCApiClient {
    call(
        serverId: ServerId,
        request: RPCRequest,
    ): Promise<any>;
}

export class ServerRPCService {
    private api: RPCApiClient;

    constructor(api: RPCApiClient) {
        this.api = api;
    }

    async call(serverId: ServerId, request: RPCRequest): Promise<any> {
        return this.api.call(serverId, request);
    }

    async getSessions(serverId: ServerId): Promise<Session[]> {
        return this.api.call(serverId, {
            method: 'GET',
            uri: '/api/sessions',
            params: {all: true},
        });
    }

    async startSession(serverId: ServerId, body: SessionStartRequest): Promise<void> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: '/api/sessions',
            params: {},
            body: body,
        });
    }

    async stopSession(serverId: ServerId, sessionName: string, logout: boolean): Promise<void> {
        return this.api.call(serverId, {
            method: 'DELETE',
            uri: `/api/sessions/${sessionName}`,
            params: {},
            body: {logout: logout},
        });
    }

    async logoutSession(serverId: ServerId, sessionName: string): Promise<void> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: `/api/sessions/${sessionName}/logout`,
            params: {},
        });
    }

    async getScreenshot(serverId: ServerId, sessionName: string): Promise<string> {
        return this.api.call(serverId, {
            method: 'GET',
            uri: `/api/screenshot`,
            params: {session: sessionName},
        });
    }
}
