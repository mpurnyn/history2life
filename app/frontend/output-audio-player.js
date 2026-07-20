const OUTPUT_SAMPLE_RATE = 24000;

export class OutputAudioPlayer {
    constructor(AudioContextClass, avatar) {
        this.AudioContextClass = AudioContextClass;
        this.avatar = avatar;
        this.context = null;
        this.analyser = null;
        this.nextStartTime = 0;
        this.activeSources = new Set();
    }

    prime() {
        if (!this.context) {
            this.context = new this.AudioContextClass({ sampleRate: OUTPUT_SAMPLE_RATE });
            this.analyser = this.context.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.25;
            this.analyser.connect(this.context.destination);
            this.avatar?.connectAnalyser(this.analyser);
            this.nextStartTime = 0;
        }

        return this.context.resume();
    }

    play(arrayBuffer) {
        if (!this.context || !this.analyser || !(arrayBuffer instanceof ArrayBuffer)) return;

        const pcm = new Int16Array(arrayBuffer);
        if (pcm.length === 0) return;

        const samples = new Float32Array(pcm.length);
        for (let index = 0; index < pcm.length; index += 1) {
            samples[index] = pcm[index] / 32768;
        }

        const audioBuffer = this.context.createBuffer(1, samples.length, OUTPUT_SAMPLE_RATE);
        audioBuffer.copyToChannel(samples, 0);

        const source = this.context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.analyser);
        this.activeSources.add(source);
        source.onended = () => {
            this.activeSources.delete(source);
            source.disconnect();
        };

        const startAt = Math.max(this.nextStartTime, this.context.currentTime + 0.05);
        source.start(startAt);
        this.nextStartTime = startAt + audioBuffer.duration;
    }

    stop() {
        for (const source of this.activeSources) {
            source.onended = null;
            try {
                source.stop();
            } catch {
                // An already-ended source needs no further cleanup.
            }
            source.disconnect();
        }
        this.activeSources.clear();

        this.avatar?.disconnectAnalyser();
        this.analyser?.disconnect();
        this.analyser = null;

        void this.context?.close();
        this.context = null;
        this.nextStartTime = 0;
    }
}
