import {defineStore} from 'pinia'
import {ref, reactive} from "vue"
import type {IHubServerAPI, ServerId, ServerInfo} from "../service/IHubServerAPI";
import type {Session, SessionStartRequest} from "../service/Session";
import {computed} from "../.nuxt/imports";
// @ts-ignore
import lodash from "lodash";
import {ServerAPI} from "../service/ServerAPI";
import {HubServerAPIMock} from "../service/mock/HubServerAPIMock";
import {ServerAPIClientMock} from "../service/mock/ServerAPIClientMock";
import {WahaGlobalVersionAPI} from "../service/WahaGlobalVersionAPI";


export const useServerStore = defineStore('serverStore', () => {
    const hubServerAPI: IHubServerAPI = new HubServerAPIMock()
    const serverAPIClient = new ServerAPIClientMock()

    const serverAPI = new ServerAPI(serverAPIClient)
    const latestVersion = ref(undefined)
    const refreshing = ref(false)
    const wahaGithubAPI = new WahaGlobalVersionAPI()

    const servers = ref<ServerInfo[]>([])
    const sessions = reactive(new Map<string, Session[]>())

    async function fetchServers() {
        console.log('fetchServers')
        const data = await hubServerAPI.list()
        servers.value = data.map(server => reactive(server))
    }

    async function fetchLatestWAHAVersion() {
        if (latestVersion.value) {
            return
        }
        const version = await wahaGithubAPI.getLatestVersion()
        latestVersion.value = version || latestVersion.value
    }

    async function refreshServer(id: string) {
        console.log('refreshServer', id)
        const server = servers.value.find(server => server.id === id)
        if (!server) {
            return
        }
        const requests = [
            fetchVersion(server),
            fetchSessions(server.id)
        ]
        // Await all, set connected based on the result
        try {
            await Promise.all(requests)
            server.connected = true
        } catch (e) {
            server.connected = false
            console.error(`Failed to refresh server - ${id}`, e)
        }
    }

    async function fetchSessions(id: string) {
        console.log('fetchSessions', id)
        sessions.set(id, await serverAPI.getSessions(id))
    }

    async function fetchVersion(server: ServerInfo) {
        console.log('fetchVersion', server.id)
        server.version = await serverAPI.getVersion(server.id)
    }

    async function refresh() {
        console.log('refresh')
        fetchLatestWAHAVersion()
        refreshing.value = true
        await fetchServers()
        const requests = []
        for (const server of servers.value) {
            requests.push(refreshServer(server.id))
        }
        try {
            await Promise.all(requests)
        } finally {
            refreshing.value = false
            console.log('refresh - COMPLETED')
        }
    }

    async function addServer(server: ServerInfo) {
        await hubServerAPI.add(server)
        await refresh()
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

    async function startSession(id: ServerId, body: SessionStartRequest): Promise<void> {
        await serverAPI.startSession(id, body)
        refresh()
    }

    async function stopSession(id: ServerId, sessionName: string, logout: boolean): Promise<void> {
        await serverAPI.stopSession(id, sessionName, logout)
        refresh()
    }

    async function logoutSession(id: ServerId, sessionName: string): Promise<void> {
        await serverAPI.logoutSession(id, sessionName)
        refresh()
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
        startSession,
        stopSession,
        logoutSession,
        latestVersion,
    }
})
