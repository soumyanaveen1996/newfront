import _, { result } from 'lodash';
import PhoneContacts from 'react-native-contacts';
import RNContacts from 'react-native-contacts';

import { Platform } from 'react-native';
import DeviceStorage from './DeviceStorage';
import Message from './Message';
import I18n from '../../config/i18n/i18n';
import Utils from '../utils';
import { Auth, Network } from '.';
import ChannelContactDAO from '../persistence/ChannelContactDAO';
import Store from '../../redux/store/configureStore';
import {
    completeContactsLoad,
    setPhoneContacts,
    setPhoneContactsStatus,
    getFilteredContactNewReqPending
} from '../../redux/actions/UserActions';
import {
    GoogleAnalytics,
    GoogleAnalyticsEventsCategories,
    GoogleAnalyticsEventsActions
} from '../GoogleAnalytics';
import EventEmitter from '../events';
import ContactsEvents from '../events/Contacts';
import Bugsnag from '../../config/ErrorMonitoring';
import { PhoneContactsDAO } from '../persistence';
import { formatContact } from '../utils/TextFormatter';
import ContactServices from '../../apiV2/ContactServices';
import UserServices from '../../apiV2/UserServices';
import Permissions from 'react-native-permissions';
import AndroidOpenSettings from 'react-native-android-open-settings';
import PermissionList from '../utils/PermissionList';
import AlertDialog from '../../lib/utils/AlertDialog';
export const CONTACT_STORAGE_KEY_CAPABILITY = 'CONTACT_STORAGE_KEY_CAPABILITY';

export const ContactType = {
    FRONTM: 'frontm',
    LOCAL: 'local'
};

const R = require('ramda');

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
    Store.dispatch(setPhoneContactsStatus(false));
    console.log('contact permission aquird refrshing');
    PhoneContacts.getAll()
        .then((contacts) => {
            const allPhoneContacts = contacts.map((contact, index) => {
                contactObj = {
                    userId: contact.recordID,
                    emails: [...contact.emailAddresses],
                    profileImage: contact.thumbnailPath,
                    name: contact.familyName
                        ? `${contact.givenName} ${contact.familyName}`
                        : contact.givenName,
                    phoneNumbers: [...contact.phoneNumbers],
                    selected: false
                };
                return formatContact(contactObj);
            });
            // Store.dispatch(setPhoneContacts(allPhoneContacts));
            PhoneContactsDAO.insertContacts(allPhoneContacts)
                .then((res) => {
                    EventEmitter.emit(ContactsEvents.phoneContactRefresh);
                    Store.dispatch(setPhoneContactsStatus(true));
                })
                .catch((e) => {
                    console.log('||||||||||| cntact sinter error', e);
                });
        })
        .catch((e) => {
            Store.dispatch(setPhoneContacts([]));
            Store.dispatch(setPhoneContactsStatus(true));
            EventEmitter.emit(ContactsEvents.phoneContactRefresh);
        });
};

const createAddressBook = (contacts) => {
    const Alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

    const PhoneContacts = Alphabets.map((letter) => {
        try {
            let contactBook = [];
            if (letter !== '#') {
                contactBook = contacts.filter(
                    (contact) =>
                        contact.userName.charAt(0).toUpperCase() ===
                        letter.toUpperCase()
                );
            } else {
                contactBook = contacts.filter(
                    (contact) => !contact.userName.charAt(0).match(/[a-z]/i)
                );
            }
            return {
                title: letter,
                data: contactBook
            };
        } catch (error) {
            Bugsnag.notify(new Error(JSON.stringify(error)), (report) => {
                report.context = 'Contacts';
            });
        }
    });
    const newAddressBook = PhoneContacts.filter((elem) => elem.data.length > 0);
    return contacts;
};

export default class Contact {
    static getAddedContacts = () =>
        new Promise((resolve, reject) => {
            DeviceStorage.get(CONTACT_STORAGE_KEY_CAPABILITY)
                .then((contacts) => {
                    contacts = contacts || [];
                    return resolve(contacts);
                })
                .catch((err) => {
                    reject(err);
                });
        });

    static syncPhoneContacts = () => {
        Permissions.check(PermissionList.CONTACTS).then((response) => {
            console.log('contact permission response', response);
            if (response === Permissions.RESULTS.GRANTED) {
                getPhoneContacts();
            } else {
                Store.dispatch(setPhoneContacts([]));
                Store.dispatch(setPhoneContactsStatus(true));
            }
        });
    };

    /**
     * Returns an array of picked field from the contact. If field is empty will return full object
     */
    static getContactFieldForUUIDs = (uuidArr = [], field) =>
        new Promise((resolve, reject) => {
            Contact.getAddedContacts()
                .then((contacts) => {
                    // Filter for uuidArr
                    const frontmContacts = contacts.filter(
                        (contact) => contact.contactType !== ContactType.LOCAL
                    );
                    const filteredContacts = _.filter(
                        frontmContacts,
                        (contact) => uuidArr.indexOf(contact.userId) > -1
                    );
                    if (field) {
                        return resolve(_.map(filteredContacts, field));
                    }
                    return resolve(filteredContacts);
                })
                .catch((err) => {
                    reject(err);
                });
        });

    static grpcAddContacts(user, userIds) {
        if (!userIds || userIds.length === 0) {
            return;
        }
        return ContactServices.add(userIds);
    }

    /**
     * Used to add frontm contacts locally when the user send a request to another user.
     * Saves one or more contacts locally with waitingForConfirmation: true
     */
    static addContacts = (contacts) =>
        new Promise((resolve, reject) => {
            if (!Array.isArray(contacts)) {
                contacts = [contacts];
            }
            const newContacts = contacts.map((contact) => {
                contact.waitingForConfirmation = true;
                return contact;
            });
            Contact.getAddedContacts()
                .then((existingContacts) => {
                    existingContacts = existingContacts || [];
                    const allContacts = existingContacts.concat(newContacts); // priority to existing contacts
                    _.uniqBy(allContacts, 'userId');
                    return Contact.saveContacts(allContacts);
                })
                .then((contactList) => resolve(contactList))
                .catch((err) => {
                    reject(err);
                });
        });

    static addIgnoredContacts = (contacts) =>
        new Promise((resolve, reject) => {
            if (!Array.isArray(contacts)) {
                contacts = [contacts];
            }
            const newContacts = contacts.map((contact) => {
                contact.waitingForConfirmation = false;
                return contact;
            });
            Contact.getAddedContacts()
                .then((existingContacts) => {
                    existingContacts = existingContacts || [];
                    const allContacts = existingContacts.concat(newContacts); // priority to existing contacts
                    _.uniqBy(allContacts, 'userId');
                    return Contact.saveContacts(allContacts);
                })
                .then((contactList) => resolve(contactList))
                .catch((err) => {
                    reject(err);
                });
        });

    /**
     * Used to add frontm contacts that the user accepted and now have showAcceptedIgnoreMsg: false.
     * Saves one or more contacts locally with waitingForConfirmation: false
     */
    static addAcceptedContacts = (contacts) =>
        new Promise((resolve, reject) => {
            if (!Array.isArray(contacts)) {
                contacts = [contacts];
            }
            const newContacts = contacts.map((contact) => {
                contact.waitingForConfirmation = false;
                return contact;
            });
            Contact.getAddedContacts()
                .then((existingContacts) => {
                    existingContacts = existingContacts || [];
                    const allContacts = newContacts.concat(existingContacts); // priority to new contacts
                    _.uniqBy(allContacts, 'userId');
                    return Contact.saveContacts(allContacts);
                })
                .then((contactList) => resolve(contactList))
                .catch((err) => {
                    reject(err);
                });
        });

    /**
     * Used to add local contacts created by the user on other devices.
     * Saves one or more contacts locally with contactType = 'local'
     */
    static addLocalContacts = (contacts) =>
        new Promise((resolve, reject) => {
            if (!Array.isArray(contacts)) {
                contacts = [contacts];
            }
            const newContacts = contacts.map((contact) => {
                contact.contactType = ContactType.LOCAL;
                return contact;
            });
            Contact.getAddedContacts()
                .then((existingContacts) => {
                    existingContacts = existingContacts || [];
                    let allContacts = newContacts.concat(existingContacts); // priority to new contacts
                    allContacts = _.uniqBy(allContacts, 'userId');
                    return Contact.saveContacts(allContacts);
                })
                .then((contactList) => resolve(contactList))
                .catch((err) => {
                    reject(err);
                });
        });

    /**
     * Used to update local contacts.
     * Update one or more local contacts locally.
     */
    static updateLocalContacts = (contacts) =>
        new Promise((resolve, reject) => {
            if (!Array.isArray(contacts)) {
                contacts = [contacts];
            }
            const newContacts = contacts.map((contact) => {
                contact.contactType = ContactType.LOCAL;
                return contact;
            });
            Contact.getAddedContacts()
                .then((existingContacts) => {
                    existingContacts = existingContacts || [];
                    let allContacts = newContacts.concat(existingContacts); // priority to new contacts
                    allContacts = _.uniqBy(allContacts, 'userId');
                    return Contact.saveContacts(allContacts);
                })
                .then((contactList) => resolve(contactList))
                .catch((err) => {
                    reject(err);
                });
        });

    /**
     * Used to delete any type of contacts.
     * Delete one or more contacts locally using their userId.
     */
    static deleteContacts = (contacts) =>
        new Promise((resolve, reject) => {
            if (!Array.isArray(contacts)) {
                contacts = [contacts];
            }
            Contact.getAddedContacts()
                .then((existingContacts) => {
                    existingContacts = existingContacts || [];
                    existingContacts = _.differenceBy(
                        existingContacts,
                        contacts,
                        'userId'
                    );
                    return Contact.saveContacts(existingContacts);
                })
                .then((contactList) => resolve(contactList))
                .catch((err) => {
                    reject(err);
                });
        });

    /**
     * Save contact list locally. Old data will be lost.
     */
    static saveContacts = (contacts) =>
        new Promise(async (resolve, reject) => {
            const incomingContacts = contacts.map((contact) => {
                if (contact) {
                    if (!contact.waitingForConfirmation) {
                        contact.waitingForConfirmation = false;
                    }
                    return contact;
                }
            });
            DeviceStorage.save(CONTACT_STORAGE_KEY_CAPABILITY, incomingContacts)
                .then(() => {
                    EventEmitter.emit(ContactsEvents.contactsRefreshed);
                    resolve(incomingContacts);
                })
                .catch((err) => reject(err));
        });

    static confirmContact = (contact) =>
        new Promise((resolve, reject) => {
            Contact.getAddedContacts()
                .then((data) => {
                    const elemIndex = data.findIndex(
                        (elem) => elem.userId === contact.userId
                    );
                    if (elemIndex >= 0) {
                        data[elemIndex].waitingForConfirmation = false;
                        data[elemIndex].userName = contact.userName;
                        data[elemIndex].emailAddress = contact.emailAddress;
                        data[elemIndex].phoneNumbers = contact.phoneNumbers;
                    }
                    return Contact.saveContacts(data);
                })
                .then((cts) => resolve(cts))
                .catch((err) => {
                    reject(err);
                });
        });

    /**
     * Adds the ignore flag for the Contact. If no contact with userId present,
     * it adds a contact with ignore flag true.
     */
    static ignoreContact = (contact) =>
        new Promise((resolve, reject) => {
            contact.ignored = true;
            Contact.getAddedContacts()
                .then((contacts) => {
                    contacts = contacts || [];
                    const contactIndex = _.findIndex(contacts, {
                        userId: contact.userId
                    });
                    if (contactIndex === -1) {
                        contacts = contacts.concat(contact);
                    } else {
                        contacts[contactIndex].ignored = true;
                    }
                    return Contact.saveContacts(contacts);
                })
                .then((cts) => resolve(cts))
                .catch((err) => reject(err));
        });

    /**
     * Removes the ignore flag for the Contact  that is stored. If no contact with userId present,
     * does nothing.
     */
    static unignoreContact = (contact) =>
        new Promise((resolve, reject) => {
            Contact.getAddedContacts()
                .then((contacts) => {
                    contacts = contacts || [];
                    const contactIndex = _.findIndex(contacts, {
                        userId: contact.userId
                    });
                    if (contactIndex !== -1) {
                        contacts[contactIndex].ignored = false;
                    }
                    return Contact.saveContacts(contacts);
                })
                .then((cts) => resolve(cts))
                .catch((err) => reject(err));
        });

    /**
     * Returns an array of contacts that were ignored.
     */
    static getIgnoredContacts = () =>
        new Promise((resolve, reject) => {
            Contact.getAddedContacts()
                .then((cts) => {
                    cts = cts || [];
                    const filtered = _.filter(
                        cts,
                        (contact) => contact.ignored
                    );
                    return resolve(filtered);
                })
                .catch((err) => reject(err));
        });

    /**
     * Clears the contacts stored in Device
     */
    static clearContacts = () =>
        new Promise((resolve, reject) => {
            DeviceStorage.delete(CONTACT_STORAGE_KEY_CAPABILITY)
                .then(() => resolve())
                .catch((err) => reject(err));
        });

    static getAddressBookEmails = () =>
        new Promise((resolve, reject) => {
            Utils.requestReadContactsPermission().then((status) => {
                if (status) {
                    RNContacts.getAllWithoutPhotos((error, contacts) => {
                        if (error === 'denied') {
                            reject(new Error('User rejected permissions'));
                        } else {
                            const emails = _.reduce(
                                contacts,
                                (emailsList, contact) => {
                                    const contactEmails = _.map(
                                        contact.emailAddresses,
                                        (emailObject) => {
                                            if (
                                                !Utils.isEmail(
                                                    emailObject.email
                                                )
                                            ) {
                                                return;
                                            }
                                            let { givenName } = contact;
                                            if (
                                                _.isEmpty(contact.givenName) &&
                                                _.isEmpty(contact.familyName)
                                            ) {
                                                givenName = emailObject.email;
                                            }
                                            return {
                                                givenName,
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
                                            (o) => o !== undefined
                                        )
                                    );
                                },
                                []
                            );
                            resolve(
                                _.sortBy(emails, (o) =>
                                    _.lowerCase(
                                        `${o.givenName} ${o.familyName}`
                                    )
                                )
                            );
                        }
                    });
                }
            });
        });

    static fetchGrpcContacts = (user) =>
        new Promise((resolve, reject) => {
            UserServices.getContacts()
                .then((result) => {
                    console.log('the data of COntacts api ', result);
                    resolve({ data: result });
                })
                .catch((err) => {
                    console.log('COntacts api call error');
                    reject(err);
                });
        });

    static randomString = () => {
        const length = 32;
        const chars =
            '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = length; i > 0; --i) {
            result += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        return result;
    };

    static getFreshContacts = () =>
        new Promise((resolve, reject) => {
            const user = Auth.getUserData();
            if (user) {
                Contact.fetchGrpcContacts(user)
                    .then((response) => {
                        Store.dispatch(
                            getFilteredContactNewReqPending(response)
                        );
                        const contacts = _.map(
                            response.data.contacts,
                            (contact) => {
                                return _.extend({}, contact, {
                                    contactType: ContactType.FRONTM,
                                    ignored: false,
                                    type: 'People'
                                });
                            }
                        );

                        resolve(contacts);
                    })
                    .catch((e) => {
                        reject([]);
                    });
            } else throw new Error('No Logged in user');
        });

    static refreshContacts = (skipPhoneContacts = false) =>
        new Promise((resolve, reject) => {
            console.log('*** refreshing contacts now');
            const user = Auth.getUserData();
            if (user) {
                Store.dispatch(completeContactsLoad(false));
                return Contact.fetchGrpcContacts(user)
                    .then((response) => {
                        if (response.data) {
                            Store.dispatch(
                                getFilteredContactNewReqPending(response)
                            );
                            console.log(
                                'Sourav Logging:::: Contacts Data --------->',
                                response.data
                            );

                            // CONTACTS
                            const contacts = _.map(
                                response.data.contacts,
                                (contact) => {
                                    if (!contact.showAcceptIgnoreMsg) {
                                        return _.extend({}, contact, {
                                            contactType: ContactType.FRONTM,
                                            ignored: false,
                                            type: 'People'
                                        });
                                    }
                                }
                            );

                            // var localContacts = [...response.data.localContacts];
                            // LOCAL CONTACTS

                            const localContacts = response.data.localContacts.map(
                                (contact) => ({
                                    ...contact,
                                    type: 'People',
                                    contactType: ContactType.LOCAL
                                })
                            );
                            // IGNORED CONTACTS
                            const ignored = _.map(
                                response.data.ignored,
                                (contact) =>
                                    _.extend({}, contact, { ignored: true })
                            );
                            // SITES
                            let sites = [];
                            if (
                                response.data.sites &&
                                response.data.sites !== ''
                            ) {
                                sites = JSON.parse(response.data.sites);
                            }
                            sites = sites.map((site) => ({
                                ...site,
                                userName: `${site.name} (${site.type})`,
                                userId: site.siteId,
                                waitingForConfirmation: false,
                                type: site.type
                            }));

                            let allContacts = _.concat(
                                contacts,
                                localContacts,
                                ignored,
                                sites
                            );

                            allContacts = allContacts.filter(
                                (contact) => contact !== undefined
                            );

                            console.log(
                                '*** all conatcts ======================= >',
                                allContacts
                            );

                            return Contact.saveContacts(allContacts);
                        }
                    })
                    .then(() => {
                        console.log('*** emitting contact refresh event');

                        Store.dispatch(completeContactsLoad(true));
                        if (!skipPhoneContacts) {
                            console.log(
                                'readong phone conatcts ======================= >'
                            );

                            Contact.syncPhoneContacts();
                        }
                        return resolve();
                    })
                    .catch((error) => {
                        EventEmitter.emit(ContactsEvents.contactsRefreshed);
                        console.log('Contacts Load', error);
                        // reject(error);
                    });
            } else throw new Error('No Logged in user');
        });

    static getNewRequestAndIgnoredContact = (skipPhoneContacts = false) =>
        new Promise((resolve, reject) => {
            console.log('*** refreshing contacts now');
            const user = Auth.getUserData();
            if (user) {
                // Store.dispatch(completeContactsLoad(false));
                return Contact.fetchGrpcContacts(user)
                    .then((response) => {
                        if (response.data) {
                            console.log(
                                'Sourav Logging:::: Contacts Data --------->',
                                response.data
                            );
                            let newRequests = false,
                                rejected = false;
                            // CONTACTS
                            const newRequestsList = _.filter(
                                response.data.contacts,
                                (contact) => {
                                    if (contact.showAcceptIgnoreMsg) {
                                        return _.extend({}, contact, {
                                            contactType: ContactType.FRONTM,
                                            ignored: false,
                                            type: 'People'
                                        });
                                    }
                                }
                            );
                            console.log(
                                'the length of newrequests',
                                newRequestsList.length
                            );

                            // IGNORED CONTACTS
                            const ignoredList = _.filter(
                                response.data.ignored,
                                (contact) =>
                                    _.extend({}, contact, { ignored: true })
                            );
                            let ignoredAndNewReqDataObj = {
                                newRequests: false,
                                newRequestsList: [],
                                ignored: false,
                                ignoredList: []
                            };
                            if (newRequestsList.length > 0) {
                                ignoredAndNewReqDataObj = {
                                    newRequestsList: newRequestsList,
                                    newRequests: true
                                };
                            }
                            if (ignoredList.length > 0) {
                                ignoredAndNewReqDataObj.ignoredList = ignoredList;
                                ignoredAndNewReqDataObj.ignored = true;
                            }

                            console.log(
                                '*** all conatcts ======================= >',
                                ignoredAndNewReqDataObj
                            );

                            return ignoredAndNewReqDataObj;
                        }
                    })
                    .then((res) => {
                        console.log('*** emitting contact refresh event');

                        return resolve(res);
                    })
                    .catch((error) => {
                        console.log('Contacts Load', error);
                        reject(error);
                    });
            } else throw new Error('No Logged in user');
        });

    static getUserDetails = (user, userId) =>
        new Promise((resolve, reject) => {
            UserServices.getUserDetails({ userId })
                .then((result) => {
                    console.log('getUserDetails axios', result);
                    resolve({ data: result });
                })
                .catch((err) => {
                    reject(err);
                });
        });

    static fetchAndAddContactForUser = (userId) =>
        new Promise((resolve, reject) => {
            const user = Auth.getUserData();
            if (user) {
                Contact.getUserDetails(user, userId)
                    .then((response) => {
                        if (response.data) {
                            const contact = response.data;
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
                    .then((contact) => {
                        console.log('Return contact : NEWLY ADDED', contact);
                        resolve(contact);
                    })
                    .catch(reject);
            } else {
                reject();
            }
        });

    static asSliderMessage = (contacts, opts) => {
        contacts = contacts || [];
        opts = opts || {
            select: true,
            multiSelect: true
        };
        const sliderFormat = contacts.map((person) => ({
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
        }));
        const message = new Message();
        message.sliderMessage(sliderFormat, opts);
        return message;
    };

    static getContactsFromDatabase = (emailsOnly) =>
        new Promise((resolve, reject) => {
            if (emailsOnly) {
                PhoneContactsDAO.selectEmailOnlyContacts()
                    .then((dbContacts) => {
                        resolve(createAddressBook(dbContacts));
                    })
                    .catch((e) => {
                        reject(e);
                    });
            } else {
                PhoneContactsDAO.selectContacts()
                    .then((dbContacts) => {
                        resolve(createAddressBook(dbContacts));
                    })
                    .catch((e) => {
                        reject(e);
                    });
            }
        });

    static alertForContactSPermission(callBack) {
        AlertDialog.show(
            undefined,
            'We need Contact access to read your phone contacts.',
            [
                {
                    text: I18n.t('Cancel'),
                    onPress: () => {
                        callBack?.();
                    },
                    style: 'cancel'
                },
                {
                    text: 'Open Settings',
                    onPress: () => {
                        callBack?.();
                        Platform.OS === 'ios'
                            ? Permissions.openSettings()
                            : AndroidOpenSettings.appDetailsSettings();
                    }
                }
            ]
        );
    }
}
