import config from '../../config/config';
import constants from '../../config/constants';
import Store from '../../redux/store/configureStore';
import { Auth } from '../capability';
import { AssetFetcher } from '../dce';
const getImageUrlForBot = (fileName, scope) => {
    return new Promise((resolve, reject) => {
        const {
            proxy: { protocol, resource_host }
        } = config;

        const user = Auth.getUserData();
        if (user) {
            const headers = {
                sessionId: user.creds.sessionId,
                ContentType: 'image/jpeg'
            };

            const url = `${protocol}${resource_host}/downloadwithsignedurl/${scope}/${getScopeId(
                scope
            )}/${fileName}`;
            console.log('MAP: image signedUrl for ' + url);
            fetch(url, {
                method: 'GET',
                headers
            })
                .then((response) => {
                    console.log('MAP: image signedUrl response ', response);
                    response
                        .json()
                        .then((parsedRes) => {
                            const {
                                signedUrl,
                                headers: { ContentType }
                            } = parsedRes;
                            console.log(
                                'MAP: image signedUrl is => ' + signedUrl
                            );
                            resolve(signedUrl);
                        })
                        .catch((error) => {
                            console.log('MAP: image error1', error);
                        });
                })
                .catch((err) => {
                    console.log('MAP: image error', err);
                });
        }
    });
};

const getScopeId = (scope) => {
    switch (scope) {
        case 'bot': {
            return Store.getState()?.bots?.id;
        }

        case 'domain': {
            return Store.getState().bots?.domain;
        }

        case 'conversation':
        default: {
            return Store.getState().user?.currentConversationId;
        }
    }
};

export { getImageUrlForBot };
