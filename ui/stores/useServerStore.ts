import {defineStore} from 'pinia'
import {ref, reactive} from "vue"
import type {ServerAPI, ServerId, ServerInfo} from "../service/ServerAPI";
import {InMemoryServerAPI} from "../service/inmemory/InMemoryServerAPI";
import type {Session, SessionStartRequest} from "../service/Session";
import {computed} from "../.nuxt/imports";
// @ts-ignore
import lodash from "lodash";
import {InMemoryRPCApi} from "../service/inmemory/InMemoryRPCApi";
import {ServerRPCService} from "../service/ServerRPCService";


export const useServerStore = defineStore('serverStore', () => {
    const serverInfoAPI: ServerAPI = new InMemoryServerAPI()
    const rpcApi = new InMemoryRPCApi()

    const serverRPCService = new ServerRPCService(rpcApi)
    const latestVersion = ref('2024.3.1')
    const refreshing = ref(false)

    const servers = ref<ServerInfo[]>([])
    const sessions = reactive(new Map<string, Session[]>())

    async function fetchServers() {
        console.log('fetchServers')
        const data = await serverInfoAPI.list()
        servers.value = data.map(server => reactive(server))
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
        sessions.set(id, await serverRPCService.getSessions(id))
    }

    async function fetchVersion(server: ServerInfo) {
        console.log('fetchVersion', server.id)
        server.version = await serverInfoAPI.getVersion(server.id)
    }

    async function refresh() {
        console.log('refresh')
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
        await serverInfoAPI.add(server)
        await refresh()
    }

    async function deleteServer(id: string) {
        await serverInfoAPI.remove(id)
        sessions.delete(id)
        await refresh()
    }

    async function editServer(id: string, server: ServerInfo) {
        await serverInfoAPI.edit(id, server)
        await refresh()
    }

    function getServer(id: string) {
        return servers.value.filter(server => server.id === id)?.[0]
    }

    async function startSession(id: ServerId, body: SessionStartRequest): Promise<void> {
        await serverRPCService.startSession(id, body)
        await fetchSessions(id)
    }

    async function stopSession(id: ServerId, sessionName: string, logout: boolean): Promise<void> {
        await serverRPCService.stopSession(id, sessionName, logout)
        await fetchSessions(id)
    }

    async function logoutSession(id: ServerId, sessionName: string): Promise<void> {
        await serverRPCService.logoutSession(id, sessionName)
        await fetchSessions(id)
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
