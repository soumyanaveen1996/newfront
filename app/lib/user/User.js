/**
 * A simple user class that can be persisted in device storage
 * Usage:
 * `let user = new User({userUUID: 'abc', ...});
 *  user.userUUID; // 'abc'
 */
export default class User {
    constructor(options) {
        this.userUUID = options.userUUID;
        this.aws = options.aws || {
            identityId: '',
            accessKeyId: '',
            secretAccessKey: '',
            sessionToken: ''
        }
        this.provider = {
            name: 'dummy',
            refreshToken: '',
            lastRefreshTime: null
        };
        // This is conditioned on whether the auth provider can offer it
        this.info = {
            emailAddress: '',
            givenName: '',
            screenName: '',
            surname: '',
            name: ''
        }
    }
}
