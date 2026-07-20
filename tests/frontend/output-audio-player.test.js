import test from 'node:test';
import assert from 'node:assert/strict';

import { OutputAudioPlayer } from '../../app/frontend/output-audio-player.js';

class FakeAnalyser {
    constructor() {
        this.fftSize = 0;
        this.smoothingTimeConstant = 0;
        this.connections = [];
        this.disconnected = false;
    }

    connect(target) {
        this.connections.push(target);
    }

    disconnect() {
        this.disconnected = true;
    }
}

class FakeSource {
    constructor() {
        this.connections = [];
        this.startedAt = null;
        this.stopped = false;
        this.disconnected = false;
        this.onended = null;
    }

    connect(target) {
        this.connections.push(target);
    }

    disconnect() {
        this.disconnected = true;
    }

    start(time) {
        this.startedAt = time;
    }

    stop() {
        this.stopped = true;
    }
}

class FakeAudioContext {
    static instances = [];

    constructor(options) {
        this.options = options;
        this.currentTime = 1;
        this.destination = { kind: 'destination' };
        this.analyser = new FakeAnalyser();
        this.sources = [];
        this.resumed = false;
        this.closed = false;
        FakeAudioContext.instances.push(this);
    }

    createAnalyser() {
        return this.analyser;
    }

    createBuffer(_channels, length, sampleRate) {
        return {
            duration: length / sampleRate,
            copyToChannel(samples) {
                this.samples = samples;
            },
        };
    }

    createBufferSource() {
        const source = new FakeSource();
        this.sources.push(source);
        return source;
    }

    async resume() {
        this.resumed = true;
    }

    async close() {
        this.closed = true;
    }
}

function pcmBuffer(length, value = 8192) {
    const pcm = new Int16Array(length);
    pcm.fill(value);
    return pcm.buffer;
}

test('OutputAudioPlayer primes playback and connects its analyser during user activation', async () => {
    const avatar = {
        connected: null,
        connectAnalyser(analyser) { this.connected = analyser; },
        disconnectAnalyser() {},
    };
    const player = new OutputAudioPlayer(FakeAudioContext, avatar);

    const resume = player.prime();
    const context = FakeAudioContext.instances.at(-1);
    await resume;

    assert.equal(context.options.sampleRate, 24000);
    assert.equal(context.resumed, true);
    assert.deepEqual(context.analyser.connections, [context.destination]);
    assert.equal(avatar.connected, context.analyser);
});

test('OutputAudioPlayer schedules PCM chunks in order through the analyser', async () => {
    const avatar = { connectAnalyser() {}, disconnectAnalyser() {} };
    const player = new OutputAudioPlayer(FakeAudioContext, avatar);
    await player.prime();
    const context = FakeAudioContext.instances.at(-1);

    player.play(pcmBuffer(2400));
    player.play(pcmBuffer(1200));

    assert.equal(context.sources[0].startedAt, 1.05);
    assert.ok(Math.abs(context.sources[1].startedAt - 1.15) < 1e-12);
    assert.deepEqual(context.sources[0].connections, [context.analyser]);
    assert.equal(context.sources[0].buffer.samples[0], 0.25);
});

test('OutputAudioPlayer stops queued audio and disconnects avatar analysis', async () => {
    const avatar = {
        disconnected: false,
        connectAnalyser() {},
        disconnectAnalyser() { this.disconnected = true; },
    };
    const player = new OutputAudioPlayer(FakeAudioContext, avatar);
    await player.prime();
    const context = FakeAudioContext.instances.at(-1);
    player.play(pcmBuffer(2400));

    player.stop();

    assert.equal(context.sources[0].stopped, true);
    assert.equal(context.sources[0].disconnected, true);
    assert.equal(context.analyser.disconnected, true);
    assert.equal(context.closed, true);
    assert.equal(avatar.disconnected, true);
});
