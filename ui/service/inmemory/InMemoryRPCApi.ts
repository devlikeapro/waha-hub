import type {RPCApiClient, RPCRequest} from "../ServerRPCService";
import type {ServerId} from "../ServerAPI";
import type {Session, SessionStartRequest, SessionStatus} from "../Session";
import {sleep} from "./utils";
import {random} from "lodash";

export class InMemoryRPCApi implements RPCApiClient {
    private sessions = new Map<ServerId, Session[]>()

    async call(serverId: ServerId, request: RPCRequest): Promise<any> {
        console.log('InMemoryRPCApi.call', {serverId, request})
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
            return this.stopSession(serverId, request.body.session, request.params.logout);
        } else if (request.uri === '/api/sessions/logout' && request.method === 'POST') {
            return this.logoutSession(serverId, request.body.session);
        } else {
            throw new Error(`Unknown request ${request.method} ${request.uri}`)
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
                    me: {
                        id: '7213213213@c.us',
                        pushName: 'John Doe',
                    }
                })
            }
            // this.sessions.set(id, newSessions)
            this.sessions.set(id, [])
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
        let session = sessions.find(session => session.name === body.name);
        let finalStatus;
        if (session) {
            session.status = "STARTING"
            session.config = body.config
            session.me = {
                id: '7213213213@c.us',
                pushName: 'John Doe',
            }
            finalStatus = "WORKING"
        } else {
            session = {
                name: body.name,
                status: <SessionStatus>'STARTING',
                config: body.config,
            }
            finalStatus = random(0, 1) > 0.1 ? 'FAILED' : 'WORKING'
            sessions.push(session)
        }


        // Simulate session starting
        const delay = Math.random() * 2000
        setTimeout(() => {
            session.status = finalStatus
            if (finalStatus === 'WORKING') {
                session.me = {
                    id: '7213213213@c.us',
                    pushName: 'John Doe',
                }
            }
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
        console.log('InMemoryRPCApi.logoutSession', {serverId, sessionName})
        const session = this.getSession(serverId, sessionName, [], true)
        const sessions = this.sessions.get(serverId)
        const index = sessions.indexOf(session)
        sessions.splice(index, 1)
    }
}
