/**
 * Nexus Beam - High-Speed Direct P2P WebRTC Transfer Engine
 * Streams complete world lore and uncompressed HD media between PC and Mobile
 * over local Wi-Fi, global internet, or WireGuard mesh VPNs without cloud storage limits.
 */

import { unpackNexusArchive, createNexusArchive } from './nexusArchive';
import { WorldData, UniverseArchive } from '../types';

export const RTC_ICE_SERVERS: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' }
];

const CHUNK_SIZE = 64 * 1024; // 64 KB chunks for optimal throughput and low memory footprint

export type BeamStage =
    | 'idle'
    | 'generating_handshake'
    | 'awaiting_peer'
    | 'connecting'
    | 'connected'
    | 'streaming'
    | 'unpacking'
    | 'completed'
    | 'failed';

export interface BeamProgress {
    stage: BeamStage;
    bytesTransferred: number;
    totalBytes: number;
    percent: number;
    speedMBs: number;
    message?: string;
}

export type ProgressCallback = (progress: BeamProgress) => void;

/**
 * Encodes SDP and ICE candidates into a compact base64 token.
 */
export const encodeSignalToken = (data: any): string => {
    try {
        const json = JSON.stringify(data);
        return btoa(unescape(encodeURIComponent(json)));
    } catch {
        return '';
    }
};

/**
 * Decodes base64 token back to SDP / ICE payload.
 */
export const decodeSignalToken = (token: string): any => {
    try {
        const json = decodeURIComponent(escape(atob(token.trim())));
        return JSON.parse(json);
    } catch {
        return null;
    }
};

/**
 * SENDER (e.g. PC): Creates an offer to beam world data to Mobile.
 */
export class NexusBeamSender {
    private pc: RTCPeerConnection;
    private dc: RTCDataChannel | null = null;
    private onProgress: ProgressCallback;
    private archiveBlob: Blob | null = null;

    constructor(onProgress: ProgressCallback) {
        this.onProgress = onProgress;
        this.pc = new RTCPeerConnection({ iceServers: RTC_ICE_SERVERS });
    }

    /**
     * Initializes the P2P channel and generates the initial connection token.
     */
    async initialize(target: { world?: WorldData; universe?: UniverseArchive }): Promise<string> {
        this.onProgress({ stage: 'generating_handshake', bytesTransferred: 0, totalBytes: 0, percent: 0, speedMBs: 0 });

        // Package world + all uncompressed assets into unified binary blob
        this.archiveBlob = await createNexusArchive(target);

        // Setup data channel
        this.dc = this.pc.createDataChannel('nexus-beam-stream', {
            ordered: true
        });
        this.dc.binaryType = 'arraybuffer';

        this.dc.onopen = () => {
            this.startStreaming();
        };

        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);

        // Wait for ICE candidate gathering to complete for a single self-contained token
        await new Promise<void>((resolve) => {
            if (this.pc.iceGatheringState === 'complete') {
                resolve();
            } else {
                const check = () => {
                    if (this.pc.iceGatheringState === 'complete') {
                        this.pc.removeEventListener('icegatheringstatechange', check);
                        resolve();
                    }
                };
                this.pc.addEventListener('icegatheringstatechange', check);
                // 3s fallback in case ICE gathering delays
                setTimeout(resolve, 3000);
            }
        });

        this.onProgress({ stage: 'awaiting_peer', bytesTransferred: 0, totalBytes: this.archiveBlob.size, percent: 0, speedMBs: 0 });
        return encodeSignalToken(this.pc.localDescription);
    }

    /**
     * Connects with the answer token from the receiver.
     */
    async connectWithAnswer(answerToken: string): Promise<void> {
        const desc = decodeSignalToken(answerToken);
        if (!desc || desc.type !== 'answer') {
            throw new Error('Invalid peer answer token.');
        }
        this.onProgress({ stage: 'connecting', bytesTransferred: 0, totalBytes: this.archiveBlob?.size || 0, percent: 0, speedMBs: 0 });
        await this.pc.setRemoteDescription(new RTCSessionDescription(desc));
    }

    /**
     * Streams the binary archive in 64KB chunks with backpressure.
     */
    private async startStreaming(): Promise<void> {
        if (!this.dc || !this.archiveBlob) return;

        const totalBytes = this.archiveBlob.size;
        let bytesSent = 0;
        const startTime = Date.now();

        this.onProgress({
            stage: 'streaming',
            bytesTransferred: 0,
            totalBytes,
            percent: 0,
            speedMBs: 0,
            message: `Streaming chronicle and uncompressed media (${(totalBytes / (1024 * 1024)).toFixed(1)} MB)...`
        });

        // 1. Send header packet with total length
        const metaPacket = JSON.stringify({ type: 'NEXUS_STREAM_META', totalBytes });
        this.dc.send(metaPacket);

        const arrayBuffer = await this.archiveBlob.arrayBuffer();

        // 2. Stream chunks
        const sendChunk = () => {
            while (bytesSent < totalBytes) {
                if (this.dc!.bufferedAmount > 8 * 1024 * 1024) {
                    // Buffer is full; pause and wait for buffer to drain
                    setTimeout(sendChunk, 50);
                    return;
                }

                const end = Math.min(bytesSent + CHUNK_SIZE, totalBytes);
                const chunk = arrayBuffer.slice(bytesSent, end);
                this.dc!.send(chunk);
                bytesSent = end;

                const elapsedSeconds = (Date.now() - startTime) / 1000;
                const speedMBs = elapsedSeconds > 0 ? (bytesSent / (1024 * 1024)) / elapsedSeconds : 0;
                const percent = Math.round((bytesSent / totalBytes) * 100);

                this.onProgress({
                    stage: 'streaming',
                    bytesTransferred: bytesSent,
                    totalBytes,
                    percent,
                    speedMBs: Number(speedMBs.toFixed(2)),
                    message: `Beaming: ${(bytesSent / (1024 * 1024)).toFixed(1)} / ${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
                });
            }

            // Finished streaming
            this.dc!.send(JSON.stringify({ type: 'NEXUS_STREAM_END' }));
            this.onProgress({
                stage: 'completed',
                bytesTransferred: totalBytes,
                totalBytes,
                percent: 100,
                speedMBs: 0,
                message: 'Beam transfer complete!'
            });
        };

        sendChunk();
    }

    close() {
        this.dc?.close();
        this.pc.close();
    }
}

/**
 * RECEIVER (e.g. Mobile): Accepts the offer and reconstructs the archive.
 */
export class NexusBeamReceiver {
    private pc: RTCPeerConnection;
    private dc: RTCDataChannel | null = null;
    private onProgress: ProgressCallback;
    private totalBytes = 0;
    private receivedChunks: ArrayBuffer[] = [];
    private receivedBytes = 0;
    private startTime = 0;

    constructor(onProgress: ProgressCallback) {
        this.onProgress = onProgress;
        this.pc = new RTCPeerConnection({ iceServers: RTC_ICE_SERVERS });

        this.pc.ondatachannel = (e) => {
            this.dc = e.channel;
            this.dc.binaryType = 'arraybuffer';
            this.setupDataChannel();
        };
    }

    /**
     * Ingests the offer token and generates the answer token to send back to sender.
     */
    async initializeWithOffer(offerToken: string): Promise<string> {
        this.onProgress({ stage: 'connecting', bytesTransferred: 0, totalBytes: 0, percent: 0, speedMBs: 0 });

        const desc = decodeSignalToken(offerToken);
        if (!desc || desc.type !== 'offer') {
            throw new Error('Invalid peer offer token.');
        }

        await this.pc.setRemoteDescription(new RTCSessionDescription(desc));
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);

        // Gather candidates
        await new Promise<void>((resolve) => {
            if (this.pc.iceGatheringState === 'complete') {
                resolve();
            } else {
                const check = () => {
                    if (this.pc.iceGatheringState === 'complete') {
                        this.pc.removeEventListener('icegatheringstatechange', check);
                        resolve();
                    }
                };
                this.pc.addEventListener('icegatheringstatechange', check);
                setTimeout(resolve, 3000);
            }
        });

        this.onProgress({ stage: 'connected', bytesTransferred: 0, totalBytes: 0, percent: 0, speedMBs: 0, message: 'Peer paired. Awaiting stream...' });
        return encodeSignalToken(this.pc.localDescription);
    }

    private setupDataChannel() {
        if (!this.dc) return;

        this.dc.onmessage = async (e) => {
            if (typeof e.data === 'string') {
                try {
                    const parsed = JSON.parse(e.data);
                    if (parsed.type === 'NEXUS_STREAM_META') {
                        this.totalBytes = parsed.totalBytes;
                        this.receivedBytes = 0;
                        this.receivedChunks = [];
                        this.startTime = Date.now();
                        this.onProgress({
                            stage: 'streaming',
                            bytesTransferred: 0,
                            totalBytes: this.totalBytes,
                            percent: 0,
                            speedMBs: 0,
                            message: `Receiving chronicle stream (${(this.totalBytes / (1024 * 1024)).toFixed(1)} MB)...`
                        });
                    } else if (parsed.type === 'NEXUS_STREAM_END') {
                        this.finalizeStream();
                    }
                } catch (err) {
                    console.error('Error parsing stream control message:', err);
                }
            } else if (e.data instanceof ArrayBuffer) {
                this.receivedChunks.push(e.data);
                this.receivedBytes += e.data.byteLength;

                const elapsedSeconds = (Date.now() - this.startTime) / 1000;
                const speedMBs = elapsedSeconds > 0 ? (this.receivedBytes / (1024 * 1024)) / elapsedSeconds : 0;
                const percent = this.totalBytes > 0 ? Math.round((this.receivedBytes / this.totalBytes) * 100) : 0;

                this.onProgress({
                    stage: 'streaming',
                    bytesTransferred: this.receivedBytes,
                    totalBytes: this.totalBytes,
                    percent,
                    speedMBs: Number(speedMBs.toFixed(2)),
                    message: `Receiving: ${(this.receivedBytes / (1024 * 1024)).toFixed(1)} / ${(this.totalBytes / (1024 * 1024)).toFixed(1)} MB`
                });
            }
        };
    }

    private async finalizeStream() {
        this.onProgress({
            stage: 'unpacking',
            bytesTransferred: this.receivedBytes,
            totalBytes: this.totalBytes,
            percent: 100,
            speedMBs: 0,
            message: 'Inscribing uncompressed HD assets into local IndexedDB...'
        });

        const completeBlob = new Blob(this.receivedChunks, { type: 'application/octet-stream' });
        try {
            const { manifest, assetsImported } = await unpackNexusArchive(completeBlob);

            this.onProgress({
                stage: 'completed',
                bytesTransferred: this.receivedBytes,
                totalBytes: this.totalBytes,
                percent: 100,
                speedMBs: 0,
                message: `Transferred successfully! (${assetsImported} uncompressed assets inscribed).`
            });

            // Dispatch global event so App / Store updates
            window.dispatchEvent(new CustomEvent('nexus-beam-received', { detail: manifest }));
        } catch (err: any) {
            this.onProgress({
                stage: 'failed',
                bytesTransferred: this.receivedBytes,
                totalBytes: this.totalBytes,
                percent: 0,
                speedMBs: 0,
                message: `Failed to unpack chronicle: ${err?.message || 'Corrupted stream'}`
            });
        }
    }

    close() {
        this.dc?.close();
        this.pc.close();
    }
}
