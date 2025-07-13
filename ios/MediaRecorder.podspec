Pod::Spec.new do |s|
    s.name         = "MediaRecorder"
    s.version      = "1.0.0"
    s.summary      = "A React Native module for streaming microphone and and camera video/audio"
    s.description  = <<-DESC
                     A React Native module that provides a React Hook for streaming microphone and and camera video/audio.
                     DESC
    s.homepage     = "https://github.com/AppimateSA/react-native-media-recorder"  # Update with your repository
    s.license      = "MIT"
    s.author       = { "Luthando Maqondo" => "luthando@appimate.com" }  # Update with your details
    s.platform     = :ios, "10.0"
    s.source       = { :git => "https://github.com/AppimateSA/ReactNativeMediaRecorder.git", :tag => "#{s.version}" }  # Update with your repository
    s.source_files = "ios/MediaRecorderModule.swift"
    s.swift_version = "5.0"
  end