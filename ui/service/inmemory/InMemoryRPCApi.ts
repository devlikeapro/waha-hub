import {RPCApiClient, RPCRequest} from "../ServerRPCService";
import {ServerId} from "../ServerAPI";
import type {Session, SessionStartRequest, SessionStatus} from "../Session";
import {sleep} from "./utils";

export class InMemoryRPCApi implements RPCApiClient {
    private sessions = new Map<ServerId, Session[]>()

    async call(serverId: ServerId, request: RPCRequest): Promise<any> {
        const failed = serverId.endsWith("000");
        if (failed) {
            const delay = Math.random() * 3000
            await sleep(delay)
            throw new Error('Getting sessions failed');
        }

        // 0 - 1 sec delay
        const delay = Math.random() * 1000
        await sleep(delay)

        if (request.uri === '/api/sessions' && request.method === 'GET') {
            return this.getSessions(serverId);
        } else if (request.uri === '/api/sessions' && request.method === 'POST') {
            return this.startSession(serverId, request.body);
        } else if (request.uri === '/api/sessions/stop' && request.method === 'POST') {
            return this.stopSession(serverId, request.params.name, request.params.logout);
        } else if (request.uri === '/api/sessions/logout' && request.method === 'POST') {
            return this.logoutSession(serverId, request.params.name);
        }
    }

    async getSessions(id: ServerId): Promise<Session[]> {
        const sessions = this.sessions.get(id)
        if (sessions === undefined) {
            const differentStatuses = id.endsWith("111");
            const statuses: SessionStatus[] = differentStatuses ? ["WORKING", "FAILED", "SCAN_QR_CODE", "STARTING", "STOPPED"] : ["WORKING"]
            const numbersOfSessions = 10
            const newSessions = []
            while (newSessions.length < numbersOfSessions) {
                newSessions.push({
                    name: `Session ${newSessions.length + 1}`,
                    status: statuses[Math.floor(Math.random() * statuses.length)],
                    config: {},
                })
            }
            this.sessions.set(id, newSessions)
        }
        return this.sessions.get(id)
    }

    private getSession(serverId: ServerId, sessionName: string, statuses: SessionStatus[], fail: boolean): Session {
        const sessions = this.sessions.get(serverId)
        if (sessions === undefined) {
            throw new Error(`Server ${serverId} not found`)
        }
        const session = sessions.find(session => session.name === sessionName)
        if (session === undefined) {
            throw new Error(`Session ${sessionName} not found`)
        }
        if (statuses.length > 0 && !statuses.includes(session.status)) {
            throw new Error(`Session ${sessionName} in status '${session.status}'`)
        }
        return session
    }

    async startSession(serverId: ServerId, body: SessionStartRequest): Promise<void> {
        const sessions = this.sessions.get(serverId)
        if (sessions === undefined) {
            throw new Error(`Server ${serverId} not found`)
        }
        const exist = sessions.find(session => session.name === body.name)
        if (exist.status != <SessionStatus>'STOPPED' || exist.status != <SessionStatus>'FAILED') {
            throw new Error(`Session ${body.name} already ${exist.status}`)
        }

        const session = {
            name: body.name,
            status: <SessionStatus>'STARTING',
            config: body.config,
        }
        sessions.push(session)

        // Simulate session starting
        const delay = Math.random() * 2000
        setTimeout(() => {
            session.status = 'WORKING'
        }, delay)
    }

    async stopSession(serverId: ServerId, sessionName: string, logout: boolean): Promise<void> {
        if (logout) {
            return this.logoutSession(serverId, sessionName)
        }
        const session = this.getSession(serverId, sessionName, ['WORKING', "SCAN_QR_CODE", "STARTING"], true)
        session.status = 'STOPPED'
    }

    async logoutSession(serverId: ServerId, sessionName: string): Promise<void> {
        const session = this.getSession(serverId, sessionName, [], true)
        const sessions = this.sessions.get(serverId)
        const index = sessions.indexOf(session)
        sessions.splice(index, 1)
    }
}
