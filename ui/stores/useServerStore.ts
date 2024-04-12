import {defineStore} from 'pinia'
import {ref} from "vue"
import type {ServerInfo} from "../service/IServerService";
import {InMemoryServerService} from "../service/InMemoryServerService";
import type {Session} from "../service/Session";

export const useServerStore = defineStore('counter', () => {
    // TODO: implement the store
    const serverInfoService = new InMemoryServerService()

    const servers = ref<ServerInfo[]>([])
    const sessions = reactive(new Map<string, Session[]>())

    async function fetchServers() {
        console.log('fetchServers')
        servers.value = await serverInfoService.list()
        servers.value.forEach(server => {
            refreshServer(server.id)
        })
    }

    async function refreshServer(id: string) {
        console.log('refreshServer', id)
        const server = servers.value.find(server => server.id === id)
        if (!server) {
            return
        }
        await Promise.all([
            fetchVersion(server),
            fetchSessions(server.id)
        ])
    }

    async function fetchSessions(id: string) {
        console.log('fetchSessions', id)
        sessions.set(id, await serverInfoService.getSessions(id))
    }

    async function fetchVersion(server: ServerInfo) {
        console.log('fetchVersion', server.id)
        server.version = await serverInfoService.getVersion(server.id)
    }

    async function refresh() {
        await fetchServers()
        return true
    }

    return {servers, sessions, refresh}
})
