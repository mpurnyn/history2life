export function calculateRms(samples) {
    if (samples.length === 0) return 0;

    let sumSquares = 0;
    for (const sample of samples) {
        sumSquares += sample * sample;
    }
    return Math.sqrt(sumSquares / samples.length);
}

export class LipSyncEnvelope {
    constructor({
        noiseFloor = 0.012,
        speechLevel = 0.18,
        attack = 0.55,
        release = 0.18,
    } = {}) {
        this.noiseFloor = noiseFloor;
        this.speechLevel = speechLevel;
        this.attack = attack;
        this.release = release;
        this.value = 0;
    }

    update(samples) {
        const rms = calculateRms(samples);
        const range = Math.max(this.speechLevel - this.noiseFloor, Number.EPSILON);
        const target = Math.min(1, Math.max(0, (rms - this.noiseFloor) / range));
        const smoothing = target > this.value ? this.attack : this.release;
        this.value += (target - this.value) * smoothing;
        return this.value;
    }

    reset() {
        this.value = 0;
    }
}
