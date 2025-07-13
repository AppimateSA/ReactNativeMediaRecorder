import { useEffect, useMemo, useRef, useState } from 'react';
import { NativeModules, EventEmitter } from 'react-native';

const { MediaRecorderModule } = NativeModules;
const emitter = new EventEmitter(MediaRecorderModule);

interface MediaRecorderConfig {
    sampleRate: number;
    startActive: boolean;
}
interface MediaRecordStreamer {
    addListener: (event: "onBuffer", callback: (buffer: Float32Array) => void) => void;
    removeListener: (event: "onBuffer", callback: (buffer: Float32Array) => void) => void;
}

const useMicrophoneStream = (config: MediaRecorderConfig): MediaRecordStreamer => {
    const { sampleRate, startActive } = config;
    const [isRecording, setIsRecording] = useState(startActive);

    // Create a ref to store the custom event emitter
    const eventEmitterRef = useRef(new EventEmitter());

    // Set up the listener for native "onBuffer" events
    useEffect(() => {
        const subscription = emitter.addListener('onBuffer', (event: any) => {
            const buffer = new Float32Array(event.buffer);
            eventEmitterRef.current.emit('onBuffer', buffer);
        });

        return () => {
            subscription.remove();
        };
    }, []);
    // Manage recording state based on active and sampleRate
    useEffect(() => {
        if (startActive) {
            MediaRecorderModule.startRecording(sampleRate);
        } else {
            MediaRecorderModule.stopRecording();
        }

        return () => {
            MediaRecorderModule.stopRecording();
        };
    }, [startActive, sampleRate]);

    // Return a memoized streamer object
    const streamer = useMemo(() => ({
        addListener: (event: "onBuffer", callback: (buffer: Float32Array) => void) => {
            eventEmitterRef.current.addListener(event, callback);
        },
        removeListener: (event: "onBuffer", callback: (buffer: Float32Array) => void) => {
            eventEmitterRef.current.removeListener(event, callback);
        },
    }), []);


    // const requestPermission = async () => {
    //     try {
    //         const granted = await MediaRecorderModule.requestPermission();
    //         return granted;
    //     } catch (err) {
    //         console.error('Permission request failed:', err);
    //         return false;
    //     }
    // };
    // const startRecording = async () => {
    //     if (isRecording) return;
    //     const granted = await requestPermission();
    //     if (granted) {
    //         MediaRecorderModule.startRecording();
    //         setIsRecording(true);
    //     }
    // };
    // const stopRecording = () => {
    //     if (!isRecording) return;
    //     MediaRecorderModule.stopRecording();
    //     setIsRecording(false);
    // };

    // return {
    //     startRecording,
    //     stopRecording,
    //     audioBuffer,
    //     isRecording
    // };

    return streamer;
};

export default useMicrophoneStream;