export type PreparedVoipCall = {
    pc: RTCPeerConnection
    micStream: MediaStream
    remoteStream: MediaStream
    sdpOffer: string
    close: () => void
}

export type OpenCall = {
    pc: RTCPeerConnection
    micStream: MediaStream
    remoteStream: MediaStream
    close: () => void
}

function waitIceGathering(pc: RTCPeerConnection): Promise<void> {
    if (pc.iceGatheringState === 'complete') {
        return Promise.resolve()
    }
    return new Promise((resolve) => {
        const onChange = () => {
            if (pc.iceGatheringState === 'complete') {
                pc.removeEventListener('icegatheringstatechange', onChange)
                resolve()
            }
        }
        pc.addEventListener('icegatheringstatechange', onChange)
    })
}

export async function acquireCallMedia(video = false): Promise<MediaStream> {
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new DOMException('MediaDevices API not available', 'NotSupportedError')
    }

    const attempts: MediaStreamConstraints[] = []
    if (video) {
        attempts.push({ audio: true, video: { facingMode: 'user' } })
        attempts.push({ audio: true, video: true })
    }
    attempts.push({ audio: true, video: false })
    attempts.push({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false,
    })

    let lastError: DOMException | null = null
    for (const constraints of attempts) {
        try {
            return await navigator.mediaDevices.getUserMedia(constraints)
        } catch (error) {
            lastError = error as DOMException
            if (
                lastError.name === 'NotAllowedError' ||
                lastError.name === 'SecurityError'
            ) {
                throw lastError
            }
        }
    }

    if (lastError) {
        throw lastError
    }
    throw new DOMException('Requested device not found', 'NotFoundError')
}

export function describeMediaError(error: unknown): string {
    const name = (error as DOMException)?.name || ''
    const message = String((error as Error)?.message || error || '')

    if (name === 'NotFoundError' || name === 'OverconstrainedError' || /not found/i.test(message)) {
        return 'micNotFound'
    }
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        return 'micDenied'
    }
    if (name === 'NotSupportedError') {
        return 'micUnsupported'
    }
    if (name === 'NotReadableError' || name === 'AbortError') {
        return 'micBusy'
    }
    return 'unknown'
}

export async function prepareVoipCall(
    video = false,
    localStream?: MediaStream,
): Promise<PreparedVoipCall> {
    const micStream = localStream ?? (await acquireCallMedia(video))
    const hasVideo = micStream.getVideoTracks().length > 0

    const pc = new RTCPeerConnection({ iceServers: [] })
    micStream.getTracks().forEach((track) => pc.addTrack(track, micStream))
    if (!hasVideo) {
        pc.addTransceiver('audio', { direction: 'recvonly' })
    }

    const remoteStream = new MediaStream()
    pc.ontrack = (event) => {
        event.streams[0]?.getTracks().forEach((track) => remoteStream.addTrack(track))
    }

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    await Promise.race([
        waitIceGathering(pc),
        new Promise<void>((resolve) => setTimeout(resolve, 2000)),
    ])

    const close = () => {
        try {
            micStream.getTracks().forEach((track) => track.stop())
        } catch {
            // ignore
        }
        try {
            pc.close()
        } catch {
            // ignore
        }
    }

    return {
        pc,
        micStream,
        remoteStream,
        sdpOffer: pc.localDescription!.sdp,
        close,
    }
}

export async function completeVoipCall(
    prepared: PreparedVoipCall,
    exchangeWebRTC: (sdpOffer: string) => Promise<{ sdp_answer: string }>,
): Promise<OpenCall> {
    const { sdp_answer } = await exchangeWebRTC(prepared.sdpOffer)
    await prepared.pc.setRemoteDescription({ type: 'answer', sdp: sdp_answer })

    return {
        pc: prepared.pc,
        micStream: prepared.micStream,
        remoteStream: prepared.remoteStream,
        close: prepared.close,
    }
}

export async function openVoipCall(
    exchangeWebRTC: (sdpOffer: string) => Promise<{ sdp_answer: string }>,
    video = false,
    localStream?: MediaStream,
): Promise<OpenCall> {
    const prepared = await prepareVoipCall(video, localStream)
    return completeVoipCall(prepared, exchangeWebRTC)
}
