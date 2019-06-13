import _ from 'lodash';
import DeviceStorage from './DeviceStorage';
export const CONTACT_STORAGE_KEY_CAPABILITY = 'CONTACT_STORAGE_KEY_CAPABILITY';
import Message from './Message';
import I18n from '../../config/i18n/i18n';
import RNContacts from 'react-native-contacts';
import Utils from '../../lib/utils';
import config from '../../config/config';
import { Auth, Network } from '.';
import SystemBot from '../bot/SystemBot';
import ChannelContactDAO from '../persistence/ChannelContactDAO';
import Store from '../../redux/store/configureStore';
import {
    completeContactsLoad,
    setPhoneContacts
} from '../../redux/actions/UserActions';
import PhoneContacts from 'react-native-contacts';
import { NativeModules, Platform, PermissionsAndroid } from 'react-native';
const ContactsServiceClient = NativeModules.ContactsServiceClient;
const UserServiceClient = NativeModules.UserServiceClient;

const R = require('ramda');

const mergeValues = (k, l, r) => (k === 'some array' ? R.concat(l, r) : r);

/**
 * Expected format per contact:
 * {
 *     "emailAddress": "akshay@frontm.com",
 *     "givenName": "Akshay",
 *     "screenName": "akshr",
 *     "surname": "Sharma",
 *     "name": "Akshay Sharma",
 *     "userId": "11A2A680-7E76-4154-A811-2A6BAB2A3BF9",
 * }
 */

const getPhoneContacts = () => {
    PhoneContacts.getAll((error, contacts) => {
        if (error) {
            console.log(
                'Sourav Logging:::: Cannot Fetch Phone Contacts',
                error
            );
            Store.dispatch(setPhoneContacts([]));
            return;
        }

        const PhoneContacts = contacts.map((contact, index) => {
            return {
                userId: index,
                emails: [...contact.emailAddresses],
                profileImage: contact.thumbnailPath,
                userName: contact.givenName,
                name: contact.familyName
                    ? `${contact.givenName} ${contact.familyName}`
                    : contact.givenName,
                phoneNumbers: [...contact.phoneNumbers],
                selected: false
            };
        });
        Store.dispatch(setPhoneContacts(PhoneContacts));
    });
};
export default class Contact {
    static getAddedContacts = () =>
        new Promise((resolve, reject) => {
            DeviceStorage.get(CONTACT_STORAGE_KEY_CAPABILITY)
                .then(function(contacts) {
                    contacts = contacts || [];
                    return resolve(contacts);
                })
                .catch(err => {
                    reject(err);
                });
        });

    static syncPhoneContacts = () => {
        if (Platform.OS === 'android') {
            PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                {
                    title: 'Contacts',
                    message: 'Grant access for contacts to display in FrontM'
                }
            )
                .then(granted => {
                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                        getPhoneContacts();
                    } else {
                        Store.dispatch(setPhoneContacts([]));
                    }
                })
                .catch(err => {
                    console.log('PermissionsAndroid', err);
                });
        } else {
            getPhoneContacts();
        }
    };

    /**
     * Returns an array of picked field from the contact. If field is empty will return full object
     */
    static getContactFieldForUUIDs = (uuidArr, field) =>
        new Promise((resolve, reject) => {
            Contact.getAddedContacts()
                .then(function(contacts) {
                    // Filter for uuidArr
                    uuidArr = uuidArr || [];
                    let filteredContacts = _.filter(contacts, contact => {
                        return uuidArr.indexOf(contact.userId) > -1;
                    });
                    if (field) {
                        return resolve(_.map(filteredContacts, field));
                    }
                    return resolve(filteredContacts);
                })
                .catch(err => {
                    reject(err);
                });
        });
    // Add one or more
    static addContacts = contacts =>
        new Promise((resolve, reject) => {
            if (!Array.isArray(contacts)) {
                contacts = [contacts];
            }

            Contact.getAddedContacts()
                .then(function(cts) {
                    cts = cts || [];
                    const notPresentContacts = _.differenceBy(
                        contacts,
                        cts,
                        contact => contact.userId
                    );
                    const newContacts = cts.concat(notPresentContacts);
                    const newContacts_Unconfirmed = newContacts.map(
                        contact => ({
                            waitingForConfirmation: true,
                            ...contact
                        })
                    );
                    return Contact.saveContacts(newContacts_Unconfirmed);
                })
                .then(function(cts) {
                    return resolve(cts);
                })
                .catch(err => {
                    reject(err);
                });
        });

    static confirmContact = contact =>
        new Promise((resolve, reject) => {
            Contact.getAddedContacts()
                .then(data => {
                    let contactArray = data.map(elem => {
                        if (elem.userId === contact.userId) {
                            elem.waitingForConfirmation =
                                contact.waitingForConfirmation;
                            elem.userName = contact.userName;
                            elem.emailAddress = contact.emailAddress;
                            elem.phoneNumbers = contact.phoneNumbers;
                        }
                        return elem;
                    });

                    return Contact.saveContacts(contactArray);
                })
                .then(function(cts) {
                    return resolve(cts);
                })
                .catch(err => {
                    reject(err);
                });
        });

    /**
     * Adds the ignore flag for the Contact. If no contact with userId present,
     * it adds a contact with ignore flag true.
     */
    static ignoreContact = contact =>
        new Promise((resolve, reject) => {
            contact.ignored = true;
            Contact.getAddedContacts()
                .then(function(contacts) {
                    contacts = contacts || [];
                    var contactIndex = _.findIndex(contacts, {
                        userId: contact.userId
                    });
                    if (contactIndex === -1) {
                        contacts = contacts.concat(contact);
                    } else {
                        contacts[contactIndex].ignored = true;
                    }
                    return Contact.saveContacts(contacts);
                })
                .then(function(cts) {
                    return resolve(cts);
                })
                .catch(err => {
                    return reject(err);
                });
        });

    /**
     * Removes the ignore flag for the Contact  that is stored. If no contact with userId present,
     * does nothing.
     */
    static unignoreContact = contact =>
        new Promise((resolve, reject) => {
            Contact.getAddedContacts()
                .then(function(contacts) {
                    contacts = contacts || [];
                    var contactIndex = _.findIndex(contacts, {
                        userId: contact.userId
                    });
                    if (contactIndex !== -1) {
                        contacts[contactIndex].ignored = false;
                    }
                    return Contact.saveContacts(contacts);
                })
                .then(function(cts) {
                    return resolve(cts);
                })
                .catch(err => {
                    return reject(err);
                });
        });

    static saveContacts = contacts =>
        new Promise(async (resolve, reject) => {
            const incomingContacts = contacts.map(contact => {
                if (!contact.waitingForConfirmation) {
                    contact.waitingForConfirmation = false;
                }
                return contact;
            });
            const localContacts = await Contact.getAddedContacts();
            const localContactsAccepted = localContacts.filter(contact => {
                if (contact.ignored === undefined) {
                    return true;
                }
                if (contact.ignored === false) {
                    return true;
                }
                return false;
            });
            const remoteContacts = incomingContacts.filter(contact => {
                if (contact.ignored === undefined) {
                    return true;
                }
                if (contact.ignored === false) {
                    return true;
                }
                return false;
            });
            let AllContacts = [];
            for (let contact of remoteContacts) {
                const localContact = R.find(R.propEq('userId', contact.userId))(
                    localContactsAccepted
                );
                const mergedContact = R.mergeDeepWithKey(
                    mergeValues,
                    localContact,
                    contact
                );
                AllContacts.push(mergedContact);
            }

            DeviceStorage.save(CONTACT_STORAGE_KEY_CAPABILITY, AllContacts)
                .then(() => {
                    return resolve(AllContacts);
                })
                .catch(err => {
                    return reject(err);
                });
        });

    /**
     * Returns an array of contacts that were ignored.
     */
    static getIgnoredContacts = () =>
        new Promise((resolve, reject) => {
            Contact.getAddedContacts()
                .then(function(cts) {
                    cts = cts || [];
                    const filtered = _.filter(cts, contact => {
                        return contact.ignored;
                    });
                    return resolve(filtered);
                })
                .catch(err => {
                    return reject(err);
                });
        });

    /**
     * Clears the contacts stored in Device
     */
    static clearContacts = () =>
        new Promise((resolve, reject) => {
            DeviceStorage.delete(CONTACT_STORAGE_KEY_CAPABILITY)
                .then(() => {
                    if (__DEV__) {
                        console.tron('All Contacts Deleted');
                    }

                    return resolve();
                })
                .catch(err => {
                    return reject(err);
                });
        });

    static getAddressBookEmails = () =>
        new Promise((resolve, reject) => {
            Utils.requestReadContactsPermission().then(status => {
                if (status) {
                    RNContacts.getAllWithoutPhotos((error, contacts) => {
                        if (error === 'denied') {
                            reject(new Error('User rejected permissions'));
                        } else {
                            let emails = _.reduce(
                                contacts,
                                (emailsList, contact) => {
                                    let contactEmails = _.map(
                                        contact.emailAddresses,
                                        emailObject => {
                                            if (
                                                !Utils.isEmail(
                                                    emailObject.email
                                                )
                                            ) {
                                                return;
                                            }
                                            let givenName = contact.givenName;
                                            if (
                                                _.isEmpty(contact.givenName) &&
                                                _.isEmpty(contact.familyName)
                                            ) {
                                                givenName = emailObject.email;
                                            }
                                            return {
                                                givenName: givenName,
                                                familyName: contact.familyName,
                                                middleName: contact.middleName,
                                                type: emailObject.label,
                                                emailAddress: emailObject.email
                                            };
                                        }
                                    );
                                    return _.concat(
                                        emailsList,
                                        _.filter(
                                            contactEmails,
                                            o => o !== undefined
                                        )
                                    );
                                },
                                []
                            );
                            resolve(
                                _.sortBy(emails, o =>
                                    _.lowerCase(
                                        o.givenName + ' ' + o.familyName
                                    )
                                )
                            );
                        }
                    });
                }
            });
        });

    static fetchGrpcContacts = user => {
        return new Promise((resolve, reject) => {
            UserServiceClient.getContacts(
                user.creds.sessionId,
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
    };

    static randomString = () => {
        let length = 32;
        let chars =
            '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var result = '';
        for (var i = length; i > 0; --i) {
            result += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        return result;
    };

    static addUniqueUserId(arr) {
        arr.map(elem => {
            // console.log('local contacts ', elem);
            elem.contactType = 'Personal';
        });

        return arr;
    }

    static refreshContacts = () =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    console.log(
                        'Sourav Logging:::: Fetching COntacts Data from DB'
                    );

                    if (user) {
                        Store.dispatch(completeContactsLoad(false));
                        return Contact.fetchGrpcContacts(user);
                    } else {
                        throw new Error('No Logged in user');
                    }
                })
                .then(response => {
                    if (response.data) {
                        //CONTACTS
                        var contacts = _.map(
                            response.data.contacts,
                            contact => {
                                return _.extend({}, contact, {
                                    ignored: false,
                                    type: 'People'
                                });
                            }
                        );
                        // var localContacts = [...response.data.localContacts];
                        //LOCAL CONTACTS
                        var localContacts = Contact.addUniqueUserId(
                            response.data.localContacts
                        );
                        localContacts = localContacts.map(contact => {
                            return {
                                ...contact,
                                type: 'People'
                            };
                        });
                        //IGNORED CONTACTS
                        var ignored = _.map(response.data.contacts, contact => {
                            return _.extend({}, contact, { ignored: true });
                        });
                        //SITES
                        var sites = JSON.parse(response.data.sites);
                        sites = sites.map(site => {
                            return {
                                ...site,
                                userName: site.name + ' (' + site.type + ')',
                                userId: site.siteId,
                                waitingForConfirmation: false
                            };
                        });

                        var allContacts = _.concat(
                            contacts,
                            localContacts,
                            ignored,
                            sites
                        );

                        // console.log(
                        //     'all conatcts ======================= >',
                        //     allContacts
                        // );

                        Contact.saveContacts(allContacts);
                        Store.dispatch(completeContactsLoad(true));
                        return resolve();
                    }
                })
                .catch(error => {
                    console.log('Contacts Load', error);
                    reject(error);
                });
        });

    static getUserDetails = (user, userId) => {
        return new Promise((resolve, reject) => {
            UserServiceClient.getUserDetails(
                user.creds.sessionId,
                { userId: userId },
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
    };

    static fetchAndAddContactForUser = userId =>
        new Promise((resolve, reject) => {
            Auth.getUser()
                .then(user => {
                    if (user) {
                        return Contact.getUserDetails(user, userId);
                    }
                })
                .then(response => {
                    if (response.data) {
                        let contact = response.data;
                        return ChannelContactDAO.insertChannelContact(
                            contact.userId,
                            contact.userName,
                            '',
                            // contact.emailAddress,
                            contact.screenName,
                            contact.givenName,
                            contact.surname
                        );
                    }
                })
                .then(contact => {
                    console.log('Return contact : ', contact);
                    resolve(contact);
                })
                .catch(reject);
        });

    static asSliderMessage = (contacts, opts) => {
        contacts = contacts || [];
        opts = opts || {
            select: true,
            multiSelect: true
        };
        const sliderFormat = contacts.map(person => {
            return {
                title: person.userName,
                data: {
                    contact_info: [
                        {
                            key: I18n.t('Name'),
                            value: person.userName
                        },
                        {
                            key: I18n.t('Email'),
                            value: person.emailAddress
                        },
                        {
                            key: I18n.t('Screen_Name'),
                            value: person.screenName
                        },
                        {
                            key: I18n.t('UUID'),
                            value: person.userId
                        },
                        {
                            key: I18n.t('Given_Name'),
                            value: person.givenName
                        },
                        {
                            key: I18n.t('Sur_Name'),
                            value: person.surname
                        }
                    ]
                }
            };
        });
        let message = new Message();
        message.sliderMessage(sliderFormat, opts);
        return message;
    };
}
