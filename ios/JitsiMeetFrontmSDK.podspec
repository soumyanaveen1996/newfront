Pod::Spec.new do |spec|
    spec.name         = 'JitsiMeetFrontmSDK'
    spec.version      = '1.0.5'
    spec.license      = "Apache License, Version 2.0"
    spec.homepage     = 'https://frontm.ai/'
    spec.authors      = { 'Akshaya Rao' => 'akshaya@frontm.com' }
    spec.summary      = 'Jitsis meet custom SDK for frontm'
    spec.source       = { :path => './JitsiMeetSDK.xcframework' }
    spec.vendored_framework    = 'JitsiMeetSDK.xcframework'
  end