import { ConversationAttemptGuard } from './conversation-attempt-guard.js';
import { LowPolyAvatar } from './low-poly-avatar.js';
import { OutputAudioPlayer } from './output-audio-player.js';

const body = document.body;
const button = document.getElementById('btn');
const personaSelect = document.getElementById('persona-select');
const avatarContainer = document.getElementById('avatar-canvas');
const portraitFallback = document.getElementById('persona-image');
const statusText = document.getElementById('conversation-status');
const personaId = Number(body.dataset.personaId);
const AudioContextClass = window.AudioContext || window.webkitAudioContext;

let avatar = null;
let socket = null;
let inputContext = null;
let outputPlayer = null;
let inputSource = null;
let mediaStream = null;
let scriptProcessor = null;
let isActive = false;
let isConnecting = false;
let messageQueue = Promise.resolve();
const attemptGuard = new ConversationAttemptGuard();

function showPortraitFallback() {
    avatarContainer.hidden = true;
    portraitFallback.hidden = false;
}

function initializeAvatar() {
    if (avatar) return;

    try {
        avatar = new LowPolyAvatar(avatarContainer);
        avatarContainer.hidden = false;
        portraitFallback.hidden = true;
    } catch (error) {
        console.error('Unable to initialize the 3D avatar.', error);
        showPortraitFallback();
    }
}

initializeAvatar();

function setStatus(message) {
    statusText.textContent = message;
}

function setButtonState(active, connecting = false) {
    button.classList.toggle('active', active);
    button.disabled = connecting;
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', active ? 'Stop conversation' : 'Start conversation');
}

function createInputPipeline() {
    inputSource = inputContext.createMediaStreamSource(mediaStream);
    scriptProcessor = inputContext.createScriptProcessor(1024, 1, 1);
    scriptProcessor.onaudioprocess = (event) => {
        if (socket?.readyState !== WebSocket.OPEN) return;

        const input = event.inputBuffer.getChannelData(0);
        const pcm = new Int16Array(input.length);
        for (let index = 0; index < input.length; index += 1) {
            pcm[index] = Math.max(-32768, Math.min(32767, input[index] * 32768));
        }
        socket.send(pcm.buffer);
    };
    inputSource.connect(scriptProcessor);
    scriptProcessor.connect(inputContext.destination);
}

async function normalizeMessageData(data) {
    if (data instanceof ArrayBuffer) return data;
    if (data instanceof Blob) return data.arrayBuffer();
    return null;
}

async function startConversation() {
    if (isActive || isConnecting) return;
    if (!AudioContextClass) {
        setStatus('This browser does not support live audio.');
        return;
    }

    const attempt = attemptGuard.begin();
    isConnecting = true;
    setButtonState(false, true);
    setStatus('Requesting microphone access…');

    let audioReady;
    try {
        // Resume while the click still provides a transient user activation.
        // Delaying this until WebSocket.onopen can leave mobile Safari suspended.
        inputContext = new AudioContextClass({ sampleRate: 16000 });
        outputPlayer = new OutputAudioPlayer(AudioContextClass, avatar);
        audioReady = Promise.all([inputContext.resume(), outputPlayer.prime()]);
    } catch (error) {
        console.error('Unable to initialize browser audio.', error);
        stopConversation('Unable to start audio on this device.');
        return;
    }

    let requestedStream;
    try {
        requestedStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch {
        if (attemptGuard.isCurrent(attempt)) stopConversation('Microphone access is required to start.');
        return;
    }

    if (!attemptGuard.isCurrent(attempt)) {
        requestedStream.getTracks().forEach((track) => track.stop());
        return;
    }
    mediaStream = requestedStream;

    try {
        await audioReady;
    } catch (error) {
        console.error('Unable to resume browser audio.', error);
        if (attemptGuard.isCurrent(attempt)) stopConversation('Unable to start audio on this device.');
        return;
    }

    if (!attemptGuard.isCurrent(attempt)) return;

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    try {
        socket = new WebSocket(`${protocol}//${location.host}/ws/conversation/${personaId}`);
    } catch (error) {
        console.error('Unable to open the conversation connection.', error);
        stopConversation('The conversation connection could not be opened.');
        return;
    }
    socket.binaryType = 'arraybuffer';

    socket.onopen = () => {
        if (!attemptGuard.isCurrent(attempt)) {
            socket?.close();
            return;
        }
        try {
            createInputPipeline();
            isConnecting = false;
            isActive = true;
            setButtonState(true);
            setStatus('Listening — speak naturally.');
        } catch (error) {
            console.error('Unable to start browser audio.', error);
            stopConversation('Unable to start audio on this device.');
        }
    };

    socket.onmessage = (event) => {
        messageQueue = messageQueue.then(async () => {
            const arrayBuffer = await normalizeMessageData(event.data);
            if (attemptGuard.isCurrent(attempt) && arrayBuffer) outputPlayer?.play(arrayBuffer);
        }).catch((error) => {
            console.error('Unable to play a conversation audio chunk.', error);
        });
    };

    socket.onclose = () => {
        if (attemptGuard.isCurrent(attempt) && (isActive || isConnecting)) {
            stopConversation('Conversation ended.');
        }
    };

    socket.onerror = () => {
        if (attemptGuard.isCurrent(attempt) && (isActive || isConnecting)) {
            stopConversation('The conversation connection failed.');
        }
    };
}

function stopConversation(message = 'Tap the microphone to start.') {
    attemptGuard.cancel();
    isActive = false;
    isConnecting = false;
    setButtonState(false);

    if (socket) {
        const openSocket = socket;
        socket = null;
        openSocket.onopen = null;
        openSocket.onmessage = null;
        openSocket.onclose = null;
        openSocket.onerror = null;
        if (openSocket.readyState === WebSocket.OPEN || openSocket.readyState === WebSocket.CONNECTING) {
            openSocket.close();
        }
    }

    if (scriptProcessor) scriptProcessor.onaudioprocess = null;
    scriptProcessor?.disconnect();
    scriptProcessor = null;
    inputSource?.disconnect();
    inputSource = null;

    outputPlayer?.stop();
    outputPlayer = null;

    void inputContext?.close();
    inputContext = null;

    mediaStream?.getTracks().forEach((track) => track.stop());
    mediaStream = null;
    messageQueue = Promise.resolve();
    setStatus(message);
}

button.addEventListener('click', () => {
    if (isActive || isConnecting) stopConversation();
    else void startConversation();
});

personaSelect.addEventListener('change', (event) => {
    stopConversation();
    window.location.href = `/conversation/${event.target.value}`;
});

window.addEventListener('pagehide', (event) => {
    stopConversation();
    if (!event.persisted) {
        avatar?.dispose();
        avatar = null;
    }
});

window.addEventListener('pageshow', () => {
    initializeAvatar();
});
