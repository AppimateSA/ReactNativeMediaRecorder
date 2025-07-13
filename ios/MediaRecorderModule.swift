import ExpoModulesCore
import AVFoundation

public class MediaRecorderModule: Module {
    private let engine = AVAudioEngine()
    private var isRecording = false

    public func definition() -> ModuleDefinition {
        Name("MediaRecorderModule")
        Events("onAudioBuffer")

        Function("requestPermission") { () -> Promise in
            Promise { resolve, reject in
                AVAudioSession.sharedInstance().requestRecordPermission { granted in
                    granted ? resolve(true) : reject("PermissionDenied", "Microphone permission denied", nil)
                }
            }
        }

        Function("startRecording") { () in
            do {
                try self.configureAudioSession()
                let inputNode = self.engine.inputNode
                inputNode.installTap(onBus: 0, bufferSize: 1024, format: nil) { buffer, _ in
                    let pcmData = buffer.floatChannelData?.pointee ?? []
                    let bufferArray = Array(UnsafeBufferPointer(start: pcmData, count: Int(buffer.frameLength)))
                    self.sendEvent("onAudioBuffer", ["buffer": bufferArray])
                }
                self.engine.prepare()
                try self.engine.start()
                self.isRecording = true
            } catch {
                print("Error starting recording: \(error)")
            }
        }

        Function("stopRecording") { () in
            self.engine.stop()
            self.engine.inputNode.removeTap(onBus: 0)
            self.isRecording = false
        }
    }

    private func configureAudioSession() throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.record, mode: .default)
        try session.setActive(true)
    }
}