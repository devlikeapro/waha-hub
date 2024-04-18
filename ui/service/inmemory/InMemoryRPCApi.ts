import {RPCApiClient, RPCRequest} from "../ServerRPCService";
import {ServerId} from "../ServerAPI";
import type {Session, SessionStatus} from "../Session";
import {sleep} from "./utils";

export class InMemoryRPCApi implements RPCApiClient {
    call(serverId: ServerId, request: RPCRequest): Promise<any> {
        if (request.uri === '/api/sessions' && request.method === 'GET') {
            return this.getSessions(serverId);
        }
    }

    async getSessions(id: ServerId): Promise<Session[]> {
        await sleep(1000)
        const failed = id.endsWith("000");
        if (failed) {
            await sleep(3000)
            throw new Error('Getting sessions failed');
        }
        const differentStatuses = id.endsWith("111");
        const sessions: Session[] = []
        const statuses: SessionStatus[] = differentStatuses ? ["WORKING", "FAILED", "SCAN_QR_CODE", "STARTING", "STOPPED"] : ["WORKING"]
        const numbersOfSessions = 10
        while (sessions.length < numbersOfSessions) {
            sessions.push({
                name: `Session ${sessions.length + 1}`,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                config: {},
            })
        }
        return sessions
    }
}
