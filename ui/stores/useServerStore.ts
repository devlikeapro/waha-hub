import {defineStore} from 'pinia'
import {ref} from "vue"
import type {ServerInfo} from "../service/IServerService";
import {InMemoryServerService} from "../service/InMemoryServerService";
import type {Session} from "../service/Session";
import {computed} from "../.nuxt/imports";

export const useServerStore = defineStore('counter', () => {
    // TODO: implement the store
    const serverInfoService = new InMemoryServerService()

    const servers = ref<ServerInfo[]>([])
    const sessions = reactive(new Map<string, Session[]>())

    async function fetchServers() {
        console.log('fetchServers')
        servers.value = await serverInfoService.list()
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
        }
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
        console.log('refresh')
        await fetchServers()
        const requests = servers.value.map(server => {
            refreshServer(server.id)
        })
        await Promise.all(requests)
    }

    async function addServer(server: ServerInfo) {
        await serverInfoService.add(server)
        await refresh()
    }

    async function deleteServer(id: string) {
        await serverInfoService.remove(id)
        await refresh()
    }

    async function editServer(id: string, server: ServerInfo) {
        await serverInfoService.edit(id, server)
        await refresh()
    }

    const notConnectedServers = computed(() => servers.value.filter(server => server.connected === false))
    const connectedServers = computed(() => servers.value.filter(server => server.connected === true))
    return {
        servers,
        sessions,
        refresh,
        addServer,
        deleteServer,
        editServer,
        notConnectedServers,
        connectedServers,
    }
})
