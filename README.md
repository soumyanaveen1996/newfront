
# FrontM Mobile App

* We will use node v8.4.0 (nvm install 8.4.0) and npm 5.3.0

## Installation (one time):

* Install nvm - https://github.com/creationix/nvm
* Install nodejs via nvm (>=8) - `nvm install 8.4.0`
* Install yarn - `npm install -g yarn`
* ESLint: `npm install -g eslint`
* Install watchman - `brew install watchman`
* Install react-native-cli - `npm install -g react-native-cli`
* yarn install


## Adding Packages
* yarn add <package-name>
* react-native link (Only if the package contains native code)

## Running native

# Development

* npm start
* Compile and run the code from Xcode / Android Studio

# Just running

* react-native run-ios

## Running tests

* Run: `yarn test`


## Publishing to TestFlight for beta testing

* bundle install (One time. Have ruby / gems installed)
* exp login ( Login with support@frontm.com account. One time )
* increase build or version number in Xcode
* cd ios (Go to ios directory)
* bundle exec fastlane match (Will download certs and provisioning profile from git@bitbucket.com:frontm/apple-certs.git)
* bundle exec fastlane beta (Publishes the JS bundle to Expo. Then creates a ipa and uploads to itunesconnect)
* Go to itunes connect around 15 minutes later. Accept the Export compliance.

The build should be ready for test flight testing.
