/**
 * A simple user class that can be persisted in device storage
 * Usage:
 * `let user = new User({userId: 'abc', ...});
 *  user.userId; // 'abc'
 */
export default class User {
    constructor(options) {
        this.userId = options.userId;
        this.aws = options.aws || {
            identityId: '',
            accessKeyId: '',
            secretAccessKey: '',
            sessionToken: ''
        };
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
        };
    }
}
