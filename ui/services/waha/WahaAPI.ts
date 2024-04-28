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
        }).then(sessions => sessions.map(this.processSession))
    }

    processSession(session: Session) {
        if (!session.config) {
            session.config = {webhooks: []}
        }
        if (!session.config.webhooks) {
            session.config.webhooks = []
        }
        for (const webhook of session.config.webhooks) {
            if (!webhook.retries) {
                webhook.retries = {attempts: 15, delaySeconds: 2}
            }
            if (webhook.retries.attempts === null || webhook.retries.attempts === undefined) {
                webhook.retries.attempts = 15
            }
            if (webhook.retries.delaySeconds === null || webhook.retries.delaySeconds === undefined) {
                webhook.retries.delaySeconds = 2
            }
            if (!webhook.hmac || !webhook.hmac.key) {
                webhook.hmac = {key: null}
            }
        }
        return session
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
