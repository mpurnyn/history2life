import * as THREE from 'three';

import { LipSyncEnvelope } from './lip-sync.js';

const clamp01 = (value) => Math.min(1, Math.max(0, value));

function material(color, options = {}) {
    return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.72,
        metalness: 0.02,
        flatShading: true,
        ...options,
    });
}

export class LowPolyAvatar {
    constructor(container) {
        if (!container) throw new Error('Avatar container is required.');

        this.container = container;
        this.clock = new THREE.Clock();
        this.envelope = new LipSyncEnvelope();
        this.analyser = null;
        this.analysisSamples = null;
        this.mouthTarget = 0;
        this.mouthValue = 0;
        this.animationFrame = null;
        this.lastRenderTime = 0;
        this.motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;
        this.reducedMotion = this.motionPreference?.matches ?? false;
        this.motionPreference?.addEventListener?.('change', this.handleMotionPreferenceChange);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
        this.camera.position.set(0, 1.25, 7.2);
        this.camera.lookAt(0, 1.15, 0);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'low-power',
        });
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.domElement.setAttribute('aria-label', 'Animated historical guide');
        this.renderer.domElement.setAttribute('role', 'img');
        container.replaceChildren(this.renderer.domElement);

        this.avatarRoot = new THREE.Group();
        this.scene.add(this.avatarRoot);
        this.createCharacter();
        this.createLighting();

        this.resizeObserver = typeof ResizeObserver === 'function'
            ? new ResizeObserver(() => this.resize())
            : null;
        this.resizeObserver?.observe(container);
        window.addEventListener('resize', this.resize);
        this.resize();
        this.animate();
    }

    resize = () => {
        const width = Math.max(1, this.container.clientWidth);
        const height = Math.max(1, this.container.clientHeight);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height, false);
    };

    handleMotionPreferenceChange = (event) => {
        this.reducedMotion = event.matches;
    };

    createCharacter() {
        const skin = material(0xc9875c);
        const skinShadow = material(0xa96345);
        const coat = material(0x244c66);
        const coatDark = material(0x132a3b);
        const shirt = material(0xe7d9b9);
        const hair = material(0x32251f);
        const eyeWhite = material(0xf5f0df);
        const iris = material(0x203b45);
        const mouth = material(0x35151a);
        const lip = material(0x8f3f43);
        const gold = material(0xc19b4b, { metalness: 0.25, roughness: 0.45 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 1.08, 1.85, 7), coat);
        torso.position.y = -0.62;
        this.avatarRoot.add(torso);

        const shirtFront = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.15, 4), shirt);
        shirtFront.position.set(0, -0.18, 0.78);
        shirtFront.rotation.z = Math.PI;
        this.avatarRoot.add(shirtFront);

        for (const side of [-1, 1]) {
            const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.05, 0.12), coatDark);
            lapel.position.set(side * 0.31, -0.2, 0.79);
            lapel.rotation.z = side * 0.35;
            this.avatarRoot.add(lapel);

            const button = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), gold);
            button.position.set(side * 0.23, -0.62, 0.91);
            this.avatarRoot.add(button);
        }

        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 0.55, 7), skinShadow);
        neck.position.y = 0.48;
        this.avatarRoot.add(neck);

        this.head = new THREE.Group();
        this.head.position.y = 1.5;
        this.avatarRoot.add(this.head);

        const face = new THREE.Mesh(new THREE.IcosahedronGeometry(0.92, 2), skin);
        face.scale.set(0.92, 1.08, 0.88);
        this.head.add(face);

        const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.89, 9, 5, 0, Math.PI * 2, 0, Math.PI * 0.53), hair);
        hairCap.position.y = 0.2;
        hairCap.scale.set(0.96, 0.92, 0.93);
        this.head.add(hairCap);

        for (const side of [-1, 1]) {
            const ear = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 1), skinShadow);
            ear.position.set(side * 0.88, -0.02, 0);
            ear.scale.y = 1.25;
            this.head.add(ear);

            const eye = new THREE.Group();
            eye.position.set(side * 0.32, 0.17, 0.78);
            this.head.add(eye);

            const white = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 7), eyeWhite);
            white.scale.set(1.1, 0.72, 0.45);
            eye.add(white);

            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.073, 9, 6), iris);
            pupil.position.z = 0.12;
            eye.add(pupil);

            const brow = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.055, 0.065), hair);
            brow.position.set(side * 0.32, 0.38, 0.83);
            brow.rotation.z = side * -0.09;
            this.head.add(brow);

            this[`eye${side < 0 ? 'Left' : 'Right'}`] = eye;
        }

        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.38, 5), skinShadow);
        nose.position.set(0, -0.04, 0.91);
        nose.rotation.x = Math.PI / 2;
        this.head.add(nose);

        this.mouthCavity = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.11, 0.055), mouth);
        this.mouthCavity.position.set(0, -0.39, 0.82);
        this.head.add(this.mouthCavity);

        const upperLip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.055, 0.075), lip);
        upperLip.position.set(0, -0.33, 0.86);
        this.head.add(upperLip);

        this.lowerLip = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.07, 0.08), lip);
        this.lowerLip.position.set(0, -0.45, 0.87);
        this.head.add(this.lowerLip);

        this.lowerFace = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.48, 6), skin);
        this.lowerFace.position.set(0, -0.57, 0.38);
        this.lowerFace.rotation.z = Math.PI;
        this.head.add(this.lowerFace);

        this.avatarRoot.rotation.x = -0.02;
    }

    createLighting() {
        this.scene.add(new THREE.HemisphereLight(0xffe8cf, 0x15263d, 2.4));

        const key = new THREE.DirectionalLight(0xffd3ad, 3.2);
        key.position.set(3, 5, 5);
        this.scene.add(key);

        const rim = new THREE.DirectionalLight(0x6bbcff, 2.1);
        rim.position.set(-4, 2, -2);
        this.scene.add(rim);
    }

    connectAnalyser(analyser) {
        this.analyser = analyser;
        this.analysisSamples = new Float32Array(analyser.fftSize);
        this.envelope.reset();
    }

    disconnectAnalyser() {
        this.analyser = null;
        this.analysisSamples = null;
        this.envelope.reset();
        this.setMouthOpen(0);
    }

    setMouthOpen(value) {
        this.mouthTarget = clamp01(value);
    }

    updateMouth() {
        if (this.analyser && this.analysisSamples) {
            this.analyser.getFloatTimeDomainData(this.analysisSamples);
            this.setMouthOpen(this.envelope.update(this.analysisSamples));
        }

        this.mouthValue += (this.mouthTarget - this.mouthValue) * 0.38;
        const open = this.mouthValue;
        this.mouthCavity.scale.y = 0.55 + open * 3.6;
        this.lowerLip.position.y = -0.45 - open * 0.15;
        this.lowerLip.rotation.x = -open * 0.22;
        this.lowerFace.position.y = -0.57 - open * 0.06;
    }

    updateIdle(elapsed) {
        if (this.reducedMotion) return;

        this.avatarRoot.position.y = Math.sin(elapsed * 1.35) * 0.025;
        this.avatarRoot.rotation.y = Math.sin(elapsed * 0.42) * 0.045;
        this.head.rotation.z = Math.sin(elapsed * 0.6) * 0.018;

        const blinkPhase = elapsed % 4.8;
        const blink = blinkPhase > 4.52 ? Math.max(0.08, Math.abs(blinkPhase - 4.66) / 0.14) : 1;
        this.eyeLeft.scale.y = blink;
        this.eyeRight.scale.y = blink;
    }

    animate = (timestamp = 0) => {
        const frameInterval = this.analyser ? 1000 / 60 : 1000 / 30;
        if (timestamp - this.lastRenderTime < frameInterval) {
            this.animationFrame = window.requestAnimationFrame(this.animate);
            return;
        }
        this.lastRenderTime = timestamp;

        const elapsed = this.clock.getElapsedTime();
        this.updateMouth();
        this.updateIdle(elapsed);
        this.renderer.render(this.scene, this.camera);
        this.animationFrame = window.requestAnimationFrame(this.animate);
    };

    dispose() {
        if (this.animationFrame !== null) window.cancelAnimationFrame(this.animationFrame);
        this.resizeObserver?.disconnect();
        this.motionPreference?.removeEventListener?.('change', this.handleMotionPreferenceChange);
        window.removeEventListener('resize', this.resize);
        this.scene.traverse((object) => {
            object.geometry?.dispose();
            if (Array.isArray(object.material)) object.material.forEach((item) => item.dispose());
            else object.material?.dispose();
        });
        this.renderer.dispose();
    }
}
