import { Auth } from '../lib/capability';
import { NativeModules } from 'react-native';

const ContactsServiceClient = NativeModules.ContactsServiceClient;
const R = require('ramda');

/*
Input ---------->

{
    localContacts: [
        {
            userName: "SidHemu",
            emailAddresses: {
                home: xxxx@example.com || "",
                work: xxxx@example.com || ""
            },
            phoneNumbers: {
                land: "xxxxxxxx" || "",
                mobile: "xxxxxxx" || "",
                satellite: "xxxxxxx" || ""
            }
        }
    ]
}
*/

const AddLocalContacts = async contactsInput => {
    try {
        const user = await Auth.getUser();
        if (user) {
            const response = await new Promise((resolve, reject) => {
                ContactsServiceClient.add(
                    user.creds.sessionId,
                    contactsInput,
                    (error, result) => {
                        if (error) {
                            reject({
                                type: 'error',
                                error: error.code
                            });
                        } else {
                            resolve(result);
                        }
                    }
                );
            });

            return response;
        } else {
            throw new Error('No user Found');
        }
    } catch (error) {
        console.log('Error Occured Adding Local Contact', error);
        throw new Error('Cannot Add Local Contacts');
    }
};

const UpdateLocalContacts = async contactsInput => {
    try {
        const user = await Auth.getUser();
        if (user) {
            const response = await new Promise((resolve, reject) => {
                ContactsServiceClient.update(
                    user.creds.sessionId,
                    contactsInput,
                    (error, result) => {
                        if (error) {
                            reject({
                                type: 'error',
                                error: error.code
                            });
                        } else {
                            resolve(result);
                        }
                    }
                );
            });

            return response;
        } else {
            throw new Error('No user Found');
        }
    } catch (error) {
        console.log('Error Occured Adding Local Contact', error);
        throw new Error('Cannot Add Local Contacts');
    }
};

const grpcInvite = (user, emailIds) => {
    return new Promise((resolve, reject) => {
        ContactsServiceClient.invite(
            user.creds.sessionId,
            { emailIds },
            (error, result) => {
                console.log(
                    'GRPC:::ContactsServiceClient::find : ',
                    error,
                    result
                );
                if (error) {
                    reject({
                        type: 'error',
                        error: error.code
                    });
                } else {
                    resolve(result);
                }
            }
        );
    });
};

export { AddLocalContacts, UpdateLocalContacts, grpcInvite };
