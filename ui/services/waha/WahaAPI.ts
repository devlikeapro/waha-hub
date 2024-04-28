import {ServerId} from "../hub/IHubServerAPI";
import {Session, SessionStartRequest} from "./dtos";
import {IWahaAPIClient} from "./IWahaAPIClient";
import {HTTPRequest} from "./HTTPRequest";

export class WahaAPI {
    private api: IWahaAPIClient;

    constructor(api: IWahaAPIClient) {
        this.api = api;
    }

    call(serverId: ServerId, request: HTTPRequest): Promise<any> {
        return this.api.call(serverId, request);
    }

    getSessions(serverId: ServerId): Promise<Session[]> {
        return this.api.call(serverId, {
            method: 'GET',
            uri: '/api/sessions',
            params: {all: true},
        });
    }

    startSession(serverId: ServerId, body: SessionStartRequest): Promise<void> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: '/api/sessions/start',
            params: {},
            body: body,
        });
    }

    stopSession(serverId: ServerId, sessionName: string, logout: boolean): Promise<void> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: `/api/sessions/stop`,
            params: {},
            body: {
                logout: logout,
                session: sessionName,
            },
        });
    }

    logoutSession(serverId: ServerId, sessionName: string): Promise<void> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: `/api/sessions/logout`,
            params: {},
            body: {
                session: sessionName,
            },
        });
    }

    getScreenshot(serverId: ServerId, sessionName: string): Promise<string> {
        return this.api.call(serverId, {
            method: 'GET',
            uri: `/api/screenshot`,
            params: {session: sessionName},
        });
    }

    // @ts-ignore
    getVersion(serverId: ServerId): Promise<any> {
        return this.api.call(serverId, {
            method: 'GET',
            uri: `/api/version`,
            params: {},
        });
    }
}
