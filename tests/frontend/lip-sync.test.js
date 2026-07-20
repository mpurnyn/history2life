import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateRms, LipSyncEnvelope } from '../../app/frontend/lip-sync.js';

test('calculateRms returns the signal root-mean-square level', () => {
    const samples = Float32Array.from([0.5, -0.5, 0.5, -0.5]);

    assert.equal(calculateRms(samples), 0.5);
});

test('LipSyncEnvelope opens on speech and releases smoothly into silence', () => {
    const envelope = new LipSyncEnvelope({
        noiseFloor: 0.01,
        speechLevel: 0.2,
        attack: 0.8,
        release: 0.25,
    });

    assert.equal(envelope.update(Float32Array.from([0, 0, 0, 0])), 0);

    const speaking = envelope.update(Float32Array.from([0.2, -0.2, 0.2, -0.2]));
    assert.ok(speaking > 0.7 && speaking <= 1);

    const released = envelope.update(Float32Array.from([0, 0, 0, 0]));
    assert.ok(released > 0 && released < speaking);

    envelope.reset();
    assert.equal(envelope.value, 0);
});
