import type {ServerId, Version} from "../../hub/IHubServerAPI";
import type {Session, SessionStartRequest, SessionStatus} from "../../waha/dtos";
import {sleep} from "../../utils";
import {random} from "lodash";
import {IWahaAPIClient} from "../../waha/IWahaAPIClient";
import {HTTPRequest} from "../../waha/HTTPRequest";

export class WahaAPIMockClient implements IWahaAPIClient {
    private sessions = new Map<ServerId, Session[]>()

    constructor() {
        this.fakeData()
    }


    async call(serverId: ServerId, request: HTTPRequest): Promise<any> {
        // 0 - 1 sec delay
        const delay = Math.random() * 1000
        // await sleep(delay)

        if (request.uri === '/api/sessions' && request.method === 'GET') {
            return this.getSessions(serverId);
        } else if (request.uri === '/api/sessions/' && request.method === 'POST') {
            return this.startSession(serverId, request.body);
        } else if (request.uri === '/api/sessions/stop' && request.method === 'POST') {
            return this.stopSession(serverId, request.body.session, request.params.logout);
        } else if (request.uri === '/api/sessions/logout' && request.method === 'POST') {
            return this.logoutSession(serverId, request.body.session);
        } else if (request.uri === '/api/version' && request.method === 'GET') {
            return this.getVersion(serverId);
        } else if (request.uri === '/api/server/version' && request.method === 'GET') {
            return this.getVersion(serverId);
        } else if (request.uri === '/api/server/status' && request.method === 'GET') {
            return this.getServerStatus(serverId)
        } else {
            throw new Error(`Unknown request ${request.method} ${request.uri}`)
        }
    }

    async getSessions(id: ServerId): Promise<Session[]> {
        const sessions = this.sessions.get(id)
        if (sessions === undefined || sessions.length === 0) {
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

    async startSession(serverId: ServerId, body: SessionStartRequest): Promise<any> {
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
        return session
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

    async getVersion(id: ServerId): Promise<Version> {
        const failed = id.endsWith("000");
        if (failed) {
            await sleep(3000)
            throw new Error('Getting version failed');
        }
        await sleep(1000)
        if (id.endsWith("111")) {
            return {
                version: "2024.3.1",
                engine: "WEBJS",
            };
        }
        return {
            version: "2024.3.0",
            engine: "NOWEB",
        }
    }

    async getServerStatus(id: ServerId) {
        return {
            "startTimestamp": 1723788847247,
            "uptime": 3600000
        }
    }

    fakeData() {
        // On first sessions
        this.sessions.set("waha_111111111111111111111111111", [
            {
                name: 'Session - Worker 1',
                status: 'WORKING',
                config: null,
                me: {
                    id: '12345@c.us',
                    pushName: "Session 1",
                }
            },
            {
                name: 'Session - Worker 2',
                status: 'STOPPED',
                config: null,
                me: {
                    id: '23456@c.us',
                    pushName: "Session 2",
                }
            },
            // {
            //     name: 'Session - Worker BOTH',
            //     status: 'STOPPED',
            //     config: null,
            //     me: null,
            // },
            {
                name: 'Session - NONE',
                status: 'FAILED',
                config: null,
                me: {
                    id: '0000@c.us',
                    pushName: "Session NONE",
                }
            },
        ])
        this.sessions.set("waha_222222222222222222222222222", [
                // {
                //     name: 'Session - Worker BOTH',
                //     status: 'STOPPED',
                //     config: null,
                //     me: null,
                // },
                {
                    name: 'Session - Worker 2',
                    status: 'WORKING',
                    config: null,
                    me: {
                        id: '23456@c.us',
                        pushName: "Session 2",
                    }
                },
                {
                    name: 'Session - Worker 1',
                    status: 'STOPPED',
                    config: null,
                    me: {
                        id: '12345@c.us',
                        pushName: "Session 1",
                    }
                },
                {
                    name: 'Session - NONE',
                    status: 'FAILED',
                    config: null,
                    me: {
                        id: '0000@c.us',
                        pushName: "Session NONE",
                    }
                },
            ]
        )
        this.sessions.set("waha_333333333333333333333333333", [
            {
                name: 'Session - DEDICATED',
                status: 'WORKING',
                config: null,
                me: {
                    id: '7777@c.us',
                    pushName: "Session DEDICATED",
                }
            },
            // {
            //     name: 'Session - STOPPED',
            //     status: 'STOPPED',
            //     config: null,
            //     me: {
            //         id: '7777@c.us',
            //         pushName: "Session STOPPED",
            //     }
            // },
        ])
    }
}
