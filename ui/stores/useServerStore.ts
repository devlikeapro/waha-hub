import {defineStore} from 'pinia'
import {watchEffect} from '@vue/runtime-core';
import {reactive, ref} from "vue"
import type {IHubServerAPI, ServerId, ServerInfo} from "../services/hub/IHubServerAPI";
import type {Session, SessionConfig, SessionStartRequest} from "../services/waha/dtos";
import {computed} from "../.nuxt/imports";
// @ts-ignore
import lodash from "lodash";
import {WahaAPI} from "../services/waha/WahaAPI";
import {WahaGlobalVersionAPI} from "../services/WahaGlobalVersionAPI";
import {HubServerLocalAPI} from "../services/impl/hub/HubServerLocalAPI";
import {WahaAPIDirectClient} from "../services/impl/waha/WahaAPIDirectClient";
import {useToast} from "primevue/usetoast";
import {WebSocketClient} from "../services/WebSocketService";
import {sleep} from "../services/utils";
import {WahaAPIMockClient} from "../services/impl/waha/WahaAPIMockClient";
import {IWahaAPIClient} from "../services/waha/IWahaAPIClient";
import {useRuntimeConfig} from "nuxt/app";
import {HubServerMockAPI} from "../services/impl/hub/HubServerMockAPI";

function filterSessions(sessions) {
    // Group by session name and me.id to identify "theSame" sessions
    const groupedSessions = lodash.groupBy(sessions, session => `${session.name}`);

    // The result array
    const filteredSessions = [];

    // Iterate over each group
    for (const key in groupedSessions) {
        const group = groupedSessions[key];

        // Separate STOPPED and non-STOPPED sessions
        const stoppedSessions = group.filter(session => session.status === "STOPPED");
        const nonStoppedSessions = group.filter(session => session.status !== "STOPPED");

        if (nonStoppedSessions.length > 0) {
            // If there are non-STOPPED sessions, choose all non-STOPPED session
            filteredSessions.push(...nonStoppedSessions);
        } else {
            // If all are STOPPED, include all
            filteredSessions.push(...stoppedSessions);
        }
    }
    return filteredSessions;
}

function loadHideDuplicatedSessions() {
    try {
        return JSON.parse(localStorage.getItem("sessions.hideDuplicated")) || false
    } catch (e) {
        localStorage.removeItem("sessions.hideDuplicated")
        return false
    }
}

export function saveHideDuplicatedSessions(value) {
    localStorage.setItem("sessions.hideDuplicated", JSON.stringify(value))
}


export const useServerStore = defineStore('serverStore', () => {
    const toast = useToast();
    const config = useRuntimeConfig()

    let hubServerAPI: IHubServerAPI
    let wahaAPIClient: IWahaAPIClient

    if (config.public.mockData) {
        // Mock
        hubServerAPI = new HubServerMockAPI()
        wahaAPIClient = new WahaAPIMockClient()
    } else {
        // Local, Dashboard
        hubServerAPI = new HubServerLocalAPI()
        wahaAPIClient = new WahaAPIDirectClient(hubServerAPI)
    }

    const wahaAPI = new WahaAPI(wahaAPIClient)
    const latestVersion = ref(undefined)
    const refreshing = ref(false)
    const wahaGithubAPI = new WahaGlobalVersionAPI()

    const servers = ref<ServerInfo[]>([])
    const sessions = reactive(new Map<string, Session[]>())
    let websocketClients: Map<string, WebSocketClient> = new Map()

    const hideDuplicatedSessions = ref(loadHideDuplicatedSessions())

    async function fetchServers() {
        const data = await hubServerAPI.list()
        servers.value = data.map(server => reactive(server))
    }

    function connectWebSockets() {
        // Disconnect clients
        websocketClients.forEach(client => {
            client.stop()
        })
        websocketClients.clear()

        servers.value.forEach(server => {
            const client = new WebSocketClient(server, ['session.status'])
            websocketClients.set(server.id, client)
            client.connect()
            client.on('event', (data: any) => {
                    if (data.event !== 'session.status') {
                        return
                    }
                    const status = data.payload.status
                    const me = data.me
                    const sessionName = data.session
                    const session = sessions.get(server.id)?.find(session => session.name === sessionName)
                    if (!session) {
                        console.log(`Session not found - '${sessionName}' on '${server.name}'`)
                        refresh()
                        return
                    }
                    session.status = status
                    if (me) {
                        session.me = me
                    }
                }
            )
        })
    }

    async function fetchLatestWAHAVersion() {
        if (latestVersion.value) {
            return
        }
        const version = await wahaGithubAPI.getLatestVersion()
        latestVersion.value = version || latestVersion.value
    }

    async function refreshServer(id: string) {
        const server = servers.value.find(server => server.id === id)
        if (!server) {
            return
        }
        const requests = [
            fetchVersion(server),
            fetchSessions(server.id)
        ]
        fetchStatus(server)
        // Await all, set connected based on the result
        try {
            await Promise.all(requests)
            server.connected = true
        } catch (e) {
            server.connected = false
            toast.add({
                severity: 'error',
                summary: `Server connection failed`,
                detail: `${server.name} (${server.connection.url}) is not connected.\nPlease make sure it's online and set right API key in the configuration.`,
                life: 3000
            });
            console.error(`Failed to refresh server - ${id}`, e)
        }
    }

    async function fetchSessions(id: string) {
        sessions.set(id, await wahaAPI.getSessions(id))
    }

    async function fetchVersion(server: ServerInfo) {
        server.version = await wahaAPI.getServerVersion(server.id)
    }

    async function fetchStatus(server: ServerInfo) {
        server.status = await wahaAPI.getServerStatus(server.id)
    }

    async function _refresh() {
        fetchLatestWAHAVersion()
        refreshing.value = true
        await fetchServers()
        connectWebSockets()
        const requests = []
        for (const server of servers.value) {
            requests.push(refreshServer(server.id))
        }
        try {
            await Promise.all(requests)
        } finally {
            refreshing.value = false
        }
    }

    const refresh = lodash.debounce(_refresh, 1_000)

    async function addServer(server: ServerInfo) {
        await hubServerAPI.add(server)
        await refresh()
    }

    async function stopServer(server: ServerInfo, force: boolean) {
        await wahaAPI.stopServer(server.id, force)
        await sleep(2000)
        refresh()
    }

    async function deleteServer(id: string) {
        await hubServerAPI.remove(id)
        sessions.delete(id)
        await refresh()
    }

    async function editServer(id: string, server: ServerInfo) {
        await hubServerAPI.edit(id, server)
        await refresh()
    }

    function getServer(id: string) {
        return servers.value.filter(server => server.id === id)?.[0]
    }

    async function createSession(id: ServerId, body: SessionStartRequest) {
        const result = await wahaAPI.createSession(id, body)
        refresh()
        return result
    }

    async function updateSession(id: ServerId, name: string, config: SessionConfig) {
        await wahaAPI.updateSession(id, name, config)
        refresh()
    }

    async function deleteSession(id: ServerId, name: string) {
        await wahaAPI.deleteSession(id, name)
        refresh()
    }


    async function startSession(id: ServerId, name: string): Promise<void> {
        await wahaAPI.startSession(id, name)
        refresh()
    }

    async function stopSession(id: ServerId, sessionName: string): Promise<void> {
        await wahaAPI.stopSession(id, sessionName)
        refresh()
    }

    async function restartSession(id: ServerId, sessionName: string): Promise<void> {
        await wahaAPI.restartSession(id, sessionName)
        refresh()
    }

    async function logoutSession(id: ServerId, sessionName: string): Promise<void> {
        await wahaAPI.logoutSession(id, sessionName)
        refresh()
    }

    async function getScreenshot(serverId: ServerId, sessionName: string): Promise<string> {
        return wahaAPI.getScreenshot(serverId, sessionName)
    }

    async function getQR(serverId: ServerId, sessionName: string): Promise<string> {
        return wahaAPI.getQR(serverId, sessionName)
    }

    async function getChatsOverview(serverId: ServerId, sessionName: string,
                                    limit: number,
                                    offset: number,
    ): Promise<string> {
        return wahaAPI.getChatsOverview(serverId, sessionName, limit, offset)
    }

    async function getChatsMessages(
        serverId: ServerId, sessionName: string,
        chatId: string,
        limit: number,
        offset: number,
        media: boolean,
    ): Promise<string> {
        return wahaAPI.getChatsMessages(serverId, sessionName, chatId, limit, offset, media)
    }

    async function sendText(
        serverId: ServerId,
        sessionName: string,
        chatId: string,
        text: string,
    ): Promise<string> {
        return wahaAPI.sendText(serverId, sessionName, chatId, text)
    }

    async function getPairingCode(serverId: ServerId, sessionName: string, phone): Promise<string> {
        return wahaAPI.getPairingCode(serverId, sessionName, phone)
    }

    async function getServerEnvironment(serverId: ServerId, all: boolean): Promise<any> {
        return wahaAPI.getServerEnvironment(serverId, all)
    }

    async function getProfilePicture(serverId: ServerId, sessionName: string, contactId: string): Promise<string> {
        return wahaAPI.getProfilePicture(serverId, sessionName, contactId)
    }

    async function callServerAPI(serverId: ServerId, request: any) {
        return wahaAPI.call(serverId, request)
    }

    const allSessions = computed(() => {
            const result = new Array<Session>()
            sessions.forEach((value, key) => {
                const server = getServer(key)
                const sessions = value.map(session => {
                    const data = lodash.cloneDeep(session)
                    data.server = server
                    return data
                })
                result.push(...sessions)
            })
            return result
        }
    )

    const visibleSessions = computed(() => {
        if (!hideDuplicatedSessions.value) {
            return allSessions.value
        }

        return filterSessions(allSessions.value)
    })

    const visibleSessionsByServer = computed(() => {
        return lodash.groupBy(visibleSessions.value, session => session.server.id)
    })

    return {
        servers,
        sessions,
        allSessions,
        refresh,
        refreshing,
        addServer,
        deleteServer,
        editServer,
        getServer,
        stopServer,
        createSession,
        updateSession,
        deleteSession,
        startSession,
        stopSession,
        restartSession,
        logoutSession,
        getScreenshot,
        getQR,
        getChatsOverview,
        getChatsMessages,
        sendText,
        getPairingCode,
        getProfilePicture,
        getServerEnvironment,
        callServerAPI,
        latestVersion,
        hideDuplicatedSessions,
        visibleSessions,
        visibleSessionsByServer,
    }
})
