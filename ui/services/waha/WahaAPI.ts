import {ServerId} from "../hub/IHubServerAPI";
import {Session, SessionConfig, SessionStartRequest} from "./dtos";
import {IWahaAPIClient} from "./IWahaAPIClient";
import {HTTPRequest} from "./HTTPRequest";
import lodash from "lodash";

/**
 * Go over metadata fields convert it to big key=value;key=value string
 * @param metadata
 */
function makeFilterCompatible(metadata: any): string {
    if (!metadata) {
        return metadata
    }
    const result = []
    for (const key in metadata) {
        if (metadata.hasOwnProperty(key)) {
            result.push(`${key}=${metadata[key]}`)
        }
    }
    return result.join(';')
}

export class WahaAPI {
    private api: IWahaAPIClient;

    constructor(api: IWahaAPIClient) {
        this.api = api;
    }

    call(serverId: ServerId, request: HTTPRequest): Promise<any> {
        return this.api.call(serverId, request);
    }

    async getSessions(serverId: ServerId): Promise<Session[]> {
        const sessions = await this.api.call(serverId, {
            method: 'GET',
            uri: '/api/sessions',
            params: {all: true},
        });
        return sessions.map(this.processSession);
    }

    processSession(session: Session) {
        if (!session.config) {
            session.config = {
                webhooks: [],
                proxy: {},
                metadata: {},
            }
        }
        if (!session.config.webhooks) {
            session.config.webhooks = []
        }
        session.config.webhooks = [].concat(session.config.webhooks)
        if (!session.config.metadata) {
            session.config.metadata = {}
        }

        // @ts-ignore
        session._metadata = makeFilterCompatible(session.config.metadata)

        if (!session.config.noweb) {
            session.config.noweb = {
                markOnline: true,
                store: {enabled: false, fullSync: false}
            }
        }
        for (const webhook of session.config.webhooks) {
            if (!webhook.retries) {
                webhook.retries = {attempts: 15, delaySeconds: 2, policy: "constant"}
            }
            if (!webhook.retries.policy) {
                webhook.retries.policy = "constant"
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
        if (!session.config.proxy) {
            session.config.proxy = {}
        }
        return session
    }

    createSession(serverId: ServerId, body: SessionStartRequest): Promise<void> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: `/api/sessions/`,
            params: {},
            body: body,
        });
    }

    updateSession(serverId: ServerId, sessionName: string, config: SessionConfig): Promise<void> {
        return this.api.call(serverId, {
            method: 'PUT',
            uri: `/api/sessions/${sessionName}`,
            params: {},
            body: {config: config},
        });
    }

    deleteSession(serverId: ServerId, sessionName: string): Promise<void> {
        return this.api.call(serverId, {
            method: 'DELETE',
            uri: `/api/sessions/${sessionName}`,
            params: {},
        });
    }

    startSession(serverId: ServerId, sessionName: string): Promise<void> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: `/api/sessions/${sessionName}/start`,
            params: {},
        });
    }

    stopSession(serverId: ServerId, sessionName: string): Promise<void> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: `/api/sessions/${sessionName}/stop`,
            params: {},
        });
    }

    restartSession(serverId: ServerId, sessionName: string): Promise<void> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: `/api/sessions/${sessionName}/restart`,
            params: {},
        });
    }

    logoutSession(serverId: ServerId, sessionName: string): Promise<void> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: `/api/sessions/${sessionName}/logout`,
            params: {},
        });
    }

    getScreenshot(serverId: ServerId, sessionName: string): Promise<string> {
        return this.api.call(serverId, {
            method: 'GET',
            uri: `/api/screenshot`,
            params: {session: sessionName},
        });
    }

    getQR(serverId: ServerId, sessionName: string): Promise<string> {
        return this.api.call(serverId, {
            method: 'GET',
            uri: `/api/${sessionName}/auth/qr`,
            params: {},
        });
    }

    getChatsOverview(serverId: ServerId, sessionName: string, limit, offset): Promise<any> {
        return this.api.call(serverId, {
            method: 'GET',
            uri: `/api/${sessionName}/chats/overview`,
            params: {limit: limit, offset: offset},
        });
    }

    getChatsMessages(serverId: ServerId, sessionName: string, chatId: string, limit: number, offset: number, media: boolean): Promise<any> {
        return this.api.call(serverId, {
            method: 'GET',
            uri: `/api/${sessionName}/chats/${chatId}/messages`,
            params: {
                limit: limit,
                offset: offset,
                downloadMedia: media,
                sortBy: "messageTimestamp",
                sortOrder: "desc",
            },
        });
    }

    sendText(serverId: ServerId, sessionName: string, chatId: string, text: string): Promise<any> {
        const body = {
            session: sessionName,
            chatId: chatId,
            text: text,
        }
        return this.api.call(serverId, {
            method: 'POST',
            uri: '/api/sendText',
            params: {},
            body: body,
        })
    }

    getPairingCode(serverId: ServerId, sessionName: string, phone: string): Promise<string> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: `/api/${sessionName}/auth/request-code`,
            params: {},
            body: {phoneNumber: phone},
        });
    }

    getProfilePicture(serverId: ServerId, sessionName: string, contactId: string): Promise<string> {
        return this.api.call(serverId, {
            method: 'GET',
            uri: `/api/contacts/profile-picture?`,
            params: {session: sessionName, contactId},
        });
    }

    getServerVersion(serverId: ServerId): Promise<any> {
        return this.api.call(serverId, {
            method: 'GET',
            // use old API till 2025.6
            uri: `/api/version`,
            // uri: `/api/server/version`,
            params: {},
        });
    }

    getServerStatus(serverId: ServerId): Promise<any> {
        return this.api.call(serverId, {
            method: 'GET',
            uri: `/api/server/status`,
            params: {},
        });
    }

    stopServer(serverId: ServerId, force: boolean): Promise<any> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: `/api/server/stop`,
            params: {},
            body: {
                force: force,
            }
        });
    }

    getServerEnvironment(serverId: ServerId, all: boolean): Promise<any> {
        return this.api.call(serverId, {
            method: 'GET',
            uri: `/api/server/environment`,
            params: {all: all},
        });
    }
}
