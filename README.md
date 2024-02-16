# FrontM Mobile App

-   We will use node v8.4.0 (nvm install 8.4.0) and npm 5.3.0

## Installation (one time):

-   Install nvm - https://github.com/creationix/nvm
-   Install nodejs via nvm (>=8) - `nvm install 8.4.0`
-   Use the installed nvm - `nvm use 8.4.0`
-   Install yarn - `npm install -g yarn`
-   ESLint: `npm install -g eslint`
-   Install watchman - `brew install watchman`
-   Install react-native-cli - `npm install -g react-native-cli`
-   Install all packages - `yarn install`
-   Link Native libraries - `RNFB_ANDROID_PERMISSIONS=true react-native link`

## Adding Packages

-   yarn add <package-name>
-   react-native link (Only if the package contains native code)

## Running native

### Development

-   npm start
-   Compile and run the code from Xcode / Android Studio
-   Currently we have to refresh the app manually if we change JS files. use Cmd + R to refresh the app in simulator.

### Just running

-   react-native run-ios

## Running tests

-   Run: `yarn test`

## Publishing to TestFlight for beta testing

-   bundle install (One time. Have ruby / gems installed)
-   exp login ( Login with support@frontm.com account. One time )
-   increase build or version number in Xcode
-   cd ios (Go to ios directory)
-   bundle exec fastlane match (Will download certs and provisioning profile from git@bitbucket.com:frontm/apple-certs.git)
-   bundle exec fastlane beta (Publishes the JS bundle to Expo. Then creates a ipa and uploads to itunesconnect)
-   Go to itunes connect around 15 minutes later. Accept the Export compliance.

The build should be ready for test flight testing.

## Branches

-   merge order : `basecode/Whitelable` -> dev/<app-specific-branch> -> build/app-specific-branch
-   Any whitelable apps should branch out from baseCode/whitelable and should live in `dev/<app_name>`. All work related to specific app should be done in this branch.
-   Builds should be taken from `build/<app_name>-<env>`. merge `dev/<app_name>` to this branch and generate builds.
-   For example, a merge order for a prod build will be-
-   onship, shar and frontm uses same build branch for dev and prod.

## Running different whitelable apps from whitelable branch directly

-   Change import of app speciic config to required app in common.js : `import appSpecificConfig from './AppSpecificConfigs/onship_config';`
-   CHnage Color config if required for UI in appV2/config/styles.js : `import GlobalColors from './styles_onship';`

## Build numbersString

-   Invernal version number is in `.env` file. update this in `basecode/Frontm` every time anything pushed to it it
-   For frontm Builds, android and ios build numbers to be updated in `build/frontm` branch itself.
-   For any whitelabel apps, buld numbers to be updated in `dev/<app_name>` before merging this to build branches.

## bugsnag

    Update versions before uploading

    ios:

        react-native bundle \
        --dev false \
        --entry-file index.js \
        --platform ios \
        --sourcemap-output ios-release.bundle.map \
        --bundle-output ios-release.bundle

        bugsnag-source-maps upload-react-native \
        --api-key 5ad8f6b48b613c7d573dc4069dd16851 \
        --app-bundle-version 136 \
        --platform ios \
        --source-map ios-release.bundle.map \
        --bundle ios-release.bundle

    android:

    react-native bundle \
    --dev false \
    --entry-file index.js \
    --platform android \
    --sourcemap-output android-release.bundle.map \
    --bundle-output android-release.bundle

    bugsnag-source-maps upload-react-native \
    --api-key 5ad8f6b48b613c7d573dc4069dd16851 \
    --app-version-code 136 \
    --platform android \
    --source-map android-release.bundle.map \
    --bundle android-release.bundle
