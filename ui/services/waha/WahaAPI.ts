import {ServerId} from "../hub/IHubServerAPI";
import {ApiKeyDTO, ApiKeyRequest, App, Locale, Session, SessionConfig, SessionStartRequest} from "./dtos";
import {IWahaAPIClient} from "./IWahaAPIClient";
import {HTTPRequest} from "./HTTPRequest";

export interface MediaFile {
    data: string;
    mimetype: string;
    filename?: string;
}

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
                ignore: null,
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
        if (!session.config.webjs) {
            session.config.webjs = {
                tagsEventsOn: false,
            }
        }
        if (!session.config.gows) {
            session.config.gows = {
                storage: {
                    messages: true,
                    groups: true,
                    chats: true,
                    labels: true,
                },
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

    getChatsOverview(serverId: ServerId, sessionName: string, limit, offset?: number, merge?: boolean): Promise<any> {
        const params: Record<string, any> = {limit: limit}
        if (offset !== undefined) {
            params.offset = offset
        }
        if (merge !== undefined) {
            params.merge = merge
        }
        return this.api.call(serverId, {
            method: 'GET',
            uri: `/api/${sessionName}/chats/overview`,
            params: params,
        });
    }

    getChatsMessages(serverId: ServerId, sessionName: string, chatId: string, limit: number, offset: number, media: boolean, merge?: boolean): Promise<any> {
        const params: Record<string, any> = {
            limit: limit,
            offset: offset,
            downloadMedia: media,
            sortBy: "messageTimestamp",
            sortOrder: "desc",
        }
        if (merge !== undefined) {
            params.merge = merge
        }
        return this.api.call(serverId, {
            method: 'GET',
            uri: `/api/${sessionName}/chats/${chatId}/messages`,
            params,
        });
    }

    getChatMessage(serverId: ServerId, sessionName: string, messageId: string, chatId: string = 'all'): Promise<any> {
        return this.api.call(serverId, {
            method: 'GET',
            uri: `/api/${sessionName}/chats/${chatId}/messages/${messageId}`,
            params: { downloadMedia: true },
        });
    }

    readChatMessages(serverId: ServerId, sessionName: string, chatId: string, body?: { messages?: number, days?: number }): Promise<any> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: `/api/${sessionName}/chats/${chatId}/messages/read`,
            params: {},
            body: body || {},
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

    sendImage(serverId: ServerId, sessionName: string, chatId: string, file: MediaFile, caption?: string): Promise<any> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: '/api/sendImage',
            params: {},
            body: { session: sessionName, chatId: chatId, file: file, caption: caption },
        })
    }

    sendVideo(serverId: ServerId, sessionName: string, chatId: string, file: MediaFile, caption?: string): Promise<any> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: '/api/sendVideo',
            params: {},
            body: { session: sessionName, chatId: chatId, file: file, caption: caption, convert: true },
        })
    }

    sendVoice(serverId: ServerId, sessionName: string, chatId: string, file: MediaFile): Promise<any> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: '/api/sendVoice',
            params: {},
            body: { session: sessionName, chatId: chatId, file: file, convert: true },
        })
    }

    sendFile(serverId: ServerId, sessionName: string, chatId: string, file: MediaFile, caption?: string): Promise<any> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: '/api/sendFile',
            params: {},
            body: { session: sessionName, chatId: chatId, file: file, caption: caption },
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

    getPasskeyChallenge(serverId: ServerId, sessionName: string): Promise<any> {
        return this.api.call(serverId, {
            method: 'GET',
            uri: `/api/${sessionName}/auth/passkey/challenge`,
            params: {},
        });
    }

    submitPasskey(serverId: ServerId, sessionName: string, assertion: any): Promise<void> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: `/api/${sessionName}/auth/passkey`,
            params: {},
            body: assertion,
        });
    }

    getPasskeyConfirmation(serverId: ServerId, sessionName: string): Promise<any> {
        return this.api.call(serverId, {
            method: 'GET',
            uri: `/api/${sessionName}/auth/passkey/confirmation`,
            params: {},
        });
    }

    confirmPasskey(serverId: ServerId, sessionName: string): Promise<void> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: `/api/${sessionName}/auth/passkey/confirm`,
            params: {},
            body: {},
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

    //
    // Apps API
    //

    /**
     * Create a new app
     */
    createApp(serverId: ServerId, app: App): Promise<App> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: `/api/apps`,
            params: {},
            body: app,
        });
    }

    /**
     * Update an existing app
     */
    updateApp(serverId: ServerId, app: App): Promise<void> {
        return this.api.call(serverId, {
            method: 'PUT',
            uri: `/api/apps/${app.id}`,
            params: {},
            body: app,
        });
    }

    /**
     * Delete an app
     */
    deleteApp(serverId: ServerId, appId: string): Promise<any> {
        return this.api.call(serverId, {
            method: 'DELETE',
            uri: `/api/apps/${appId}`,
            params: {},
        });
    }

    /**
     * Get all apps for a session
     */
    getApps(serverId: ServerId, sessionName: string): Promise<App[]> {
        return this.api.call(serverId, {
            method: 'GET',
            uri: `/api/apps`,
            params: {session: sessionName},
        });
    }

    /**
     * Get list of locales for ChatWoot app
     */
    getAppChatWootLocales(serverId: ServerId): Promise<Locale[]> {
        return this.api.call(serverId, {
            method: 'GET',
            uri: `/api/apps/chatwoot/locales`,
            params: {},
        });
    }

    //
    // API Keys
    //

    getApiKeys(serverId: ServerId): Promise<ApiKeyDTO[]> {
        return this.api.call(serverId, {
            method: 'GET',
            uri: `/api/keys`,
            params: {},
        });
    }

    createApiKey(serverId: ServerId, body: ApiKeyRequest): Promise<ApiKeyDTO> {
        return this.api.call(serverId, {
            method: 'POST',
            uri: `/api/keys`,
            params: {},
            body: body,
        });
    }

    updateApiKey(serverId: ServerId, id: string, body: ApiKeyRequest): Promise<ApiKeyDTO> {
        return this.api.call(serverId, {
            method: 'PUT',
            uri: `/api/keys/${id}`,
            params: {},
            body: body,
        });
    }

    deleteApiKey(serverId: ServerId, id: string): Promise<void> {
        return this.api.call(serverId, {
            method: 'DELETE',
            uri: `/api/keys/${id}`,
            params: {},
        });
    }
}
