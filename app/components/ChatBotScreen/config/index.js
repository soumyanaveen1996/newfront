export const ChatInputBarState = {
    READY_FOR_SPEECH: 'ready_for_speech',
    TYPING: 'typing',
    RECORDING_SPEECH: 'recording_speech'
};

export const CameraOptions = {
    allowsEditing: false,
    exif: true,
    base64: true
};

export const ChatMessageOptions = {
    messageTransitionTime: 5,
    pageSize: 10
};

export const ChatImageOptions = {
    width: 220,
    height: 220
};

export default {
    ChatInputBarState,
    ChatMessageOptions,
    CameraOptions,
    ChatImageOptions
};

export const BOT_LOAD_RETRIES = 2;

export const AudioRecordingConfig = {
    minAudioSeconds: 2
};
