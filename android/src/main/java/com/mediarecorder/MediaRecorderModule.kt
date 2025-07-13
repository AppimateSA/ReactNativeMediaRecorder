package com.microphonestream

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.media.AudioRecord
import android.media.AudioFormat
import android.media.MediaRecorder

class MediaRecorderModule : Module() {
    private var audioRecord: AudioRecord? = null
    private var isRecording = false

    override fun definition() = ModuleDefinition {
        Name("MediaRecorderModule")
        Events("onAudioBuffer")

        Function("requestPermission") {
            // Permissions are handled in JavaScript for Android
            true
        }

        Function("startRecording") {
            val sampleRate = 44100
            val channelConfig = AudioFormat.CHANNEL_IN_MONO
            val audioFormat = AudioFormat.ENCODING_PCM_16BIT
            val bufferSize = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat)

            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.MIC,
                sampleRate,
                channelConfig,
                audioFormat,
                bufferSize
            )

            val buffer = ByteArray(bufferSize)
            audioRecord?.startRecording()
            isRecording = true

            Thread {
                while (isRecording) {
                    val read = audioRecord?.read(buffer, 0, bufferSize) ?: 0
                    if (read > 0) {
                        sendEvent("onAudioBuffer", mapOf("buffer" to buffer.copyOf(read)))
                    }
                }
            }.start()
        }

        Function("stopRecording") {
            isRecording = false
            audioRecord?.stop()
            audioRecord?.release()
            audioRecord = null
        }
    }
}