import {RPCApiClient, RPCRequest} from "../ServerRPCService";
import {ServerId} from "../ServerAPI";
import type {Session, SessionStatus} from "../Session";
import {sleep} from "./utils";

export class InMemoryRPCApi implements RPCApiClient {
    private sessions = new Map<ServerId, Session[]>()

    async call(serverId: ServerId, request: RPCRequest): Promise<any> {
        const failed = serverId.endsWith("000");
        if (failed) {
            await sleep(3000)
            throw new Error('Getting sessions failed');
        }
        // 0 - 1 sec delay
        const timeout = Math.random() * 1000
        await sleep(timeout)
        if (request.uri === '/api/sessions' && request.method === 'GET') {
            return this.getSessions(serverId);
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
}
