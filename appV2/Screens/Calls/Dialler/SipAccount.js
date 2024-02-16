import { Endpoint } from 'react-native-pjsip';
import { EventEmitter } from 'events';
import { Platform } from 'react-native';

class SipAccount extends EventEmitter {
    async create(config) {
        if (this.account && this.endpoint) {
            this.emit('account_created', {
                account: this.account,
                endpoint: this.endpoint
            });
            return;
        }
        try {
            this.endpoint = new Endpoint();
            this.endpoint.addListener(
                'registration_changed',
                this.registrationChangedHandler
            );

            const state = await this.endpoint.start();
            console.log('++++++ endpoint start:', state);
            if (Platform.OS === 'android') {
                this.endpoint.createAccount(config);
            } else {
                this.endpoint.createAccount(config).then(async (account) => {
                    this.account = account;
                    this.emit('account_created', {
                        account,
                        endpoint: this.endpoint
                    });
                });
            }
        } catch (err) {
            console.log('Amal : PJSIP Error  : ', err);
        }
    }

    registrationChangedHandler = (account) => {
        console.log('+++++ Registration Changed in SipAccount', {
            account,
            endpoint: this.endpoint
        });
        if (account.getRegistration().isActive()) {
            this.account = account;
            this.emit('account_created', {
                account,
                endpoint: this.endpoint
            });
        } else if (
            account.getRegistration().getStatus() !== 'PJSIP_SC_TRYING'
        ) {
            this.emit('account_creation_error', {
                account,
                endpoint: this.endpoint
            });
        }
    };
}

export default new SipAccount();
