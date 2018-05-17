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
export default class Contact {

    static getAddedContacts = () => new Promise((resolve, reject) => {
        DeviceStorage.get(CONTACT_STORAGE_KEY_CAPABILITY)
            .then(function (contacts) {
                contacts = contacts || [];
                return resolve(contacts);
            })
            .catch((err) => {
                reject(err);
            });
    });

    /**
     * Returns an array of picked field from the contact. If field is empty will return full object
     */
    static getContactFieldForUUIDs = (uuidArr, field) => new Promise((resolve, reject) => {
        Contact.getAddedContacts()
            .then(function (contacts) {
                // Filter for uuidArr
                uuidArr = uuidArr || []
                let filteredContacts = _.filter(contacts, (contact) => {
                    return (uuidArr.indexOf(contact.userId) > -1);

                });
                if (field) {
                    return resolve(_.map(filteredContacts, field));
                }
                return resolve(filteredContacts);
            })
            .catch((err) => {
                reject(err);
            });
    });
    // Add one or more
    static addContacts = (contacts) => new Promise((resolve, reject) => {
        if (!Array.isArray(contacts)) {
            contacts = [contacts];
        }
        console.log('Added Contacts : ', contacts);
        Contact.getAddedContacts()
            .then(function (cts) {
                cts = cts || [];
                const notPresentContacts = _.differenceBy(contacts, cts, (contact) => contact.userId);
                const newContacts = cts.concat(notPresentContacts);
                return Contact.saveContacts(newContacts);
            })
            .then(function (cts) {
                return resolve(cts);
            })
            .catch((err) => {
                reject(err);
            });
    });


    /**
     * Adds the ignore flag for the Contact. If no contact with userId present,
     * it adds a contact with ignore flag true.
     */
    static ignoreContact = (contact) => new Promise((resolve, reject) => {
        contact.ignored = true;
        Contact.getAddedContacts()
            .then(function (contacts) {
                contacts = contacts || [];
                var contactIndex = _.findIndex(contacts, { userId: contact.userId })
                if (contactIndex === -1) {
                    contacts = contacts.concat(contact);
                } else {
                    contacts[contactIndex].ignored = true;
                }
                return Contact.saveContacts(contacts);
            })
            .then(function (cts) {
                return resolve(cts);
            })
            .catch((err) => {
                return reject(err);
            });
    });

    /**
     * Removes the ignore flag for the Contact  that is stored. If no contact with userId present,
     * does nothing.
     */
    static unignoreContact = (contact) => new Promise((resolve, reject) => {
        Contact.getAddedContacts()
            .then(function (contacts) {
                contacts = contacts || [];
                var contactIndex = _.findIndex(contacts, {userId: contact.userId})
                if (contactIndex !== -1) {
                    contacts[contactIndex].ignored = false;
                }
                return Contact.saveContacts(contacts);
            })
            .then(function (cts) {
                return resolve(cts);
            })
            .catch((err) => {
                return reject(err);
            });
    });


    static saveContacts = (contacts) => new Promise((resolve, reject) => {
        DeviceStorage.save(CONTACT_STORAGE_KEY_CAPABILITY, contacts)
            .then(() => {
                return resolve(contacts);
            })
            .catch((err) => {
                return reject(err);
            });
    });

    /**
     * Returns an array of contacts that were ignored.
     */
    static getIgnoredContacts = () => new Promise((resolve, reject) => {
        Contact.getAddedContacts()
            .then(function (cts) {
                cts = cts || [];
                const filtered = _.filter(cts, (contact) => {
                    return contact.ignored
                });
                return resolve(filtered);
            })
            .catch((err) => {
                return reject(err);
            });
    });

    /**
     * Clears the contacts stored in Device
     */
    static clearContacts = () => new Promise((resolve, reject) => {
        DeviceStorage.delete(CONTACT_STORAGE_KEY_CAPABILITY)
            .then(() => {
                return resolve();
            })
            .catch((err) => {
                return reject(err);
            });
    });

    static getAddressBookEmails = () => new Promise((resolve, reject) => {
        Utils.requestReadContactsPermission().then((status) => {
            if (status){
                RNContacts.getAllWithoutPhotos((error, contacts) => {
                    if (error === 'denied') {
                        reject(new Error('User rejected permissions'));
                    } else {
                        let emails = _.reduce(contacts, (emailsList, contact) => {
                            let contactEmails = _.map(contact.emailAddresses, (emailObject) => {
                                if (!Utils.isEmail(emailObject.email)) {
                                    return;
                                }
                                let givenName = contact.givenName;
                                if (_.isEmpty(contact.givenName) && _.isEmpty(contact.familyName)) {
                                    givenName = emailObject.email
                                }
                                return {
                                    givenName: givenName,
                                    familyName: contact.familyName,
                                    middleName: contact.middleName,
                                    type: emailObject.label,
                                    emailAddress: emailObject.email
                                }
                            });
                            return _.concat(emailsList, _.filter(contactEmails, (o) => o !== undefined));
                        }, []);
                        resolve(_.sortBy(emails, (o) => _.lowerCase(o.givenName + ' ' + o.familyName)));
                    }
                })
            }
        });
    });

    static refreshContacts = () => new Promise((resolve, reject) => {
        Auth.getUser()
            .then((user) => {
                if (user) {
                    let options = {
                        'method': 'get',
                        'url': `${config.network.queueProtocol}${config.proxy.host}${config.network.contactsPath}?botId=${SystemBot.contactsBot.botId}`,
                        'headers': {
                            accessKeyId: user.aws.accessKeyId,
                            secretAccessKey: user.aws.secretAccessKey,
                            sessionToken: user.aws.sessionToken
                        }
                    };
                    return Network(options);
                }
            })
            .then((response) => {
                if (response.data) {
                    console.log('Contacts Data : ', response.data.contacts);
                    var contacts = _.map(response.data.contacts, (contact) => {
                        return _.extend({}, contact, {ignored: false});
                    });
                    var ignored = _.map(response.data.contacts, (contact) => {
                        return _.extend({}, contact, {ignored: true});
                    });
                    var allContacts = _.concat(contacts, ignored);
                    Contact.saveContacts(allContacts);
                    resolve();
                }
            })
            .catch(reject);
    });

    static fetchAndAddContactForUser = (userId) => new Promise((resolve, reject) => {
        Auth.getUser()
            .then((user) => {
                if (user) {
                    let options = {
                        'method': 'get',
                        'url': `${config.network.queueProtocol}${config.proxy.host}${config.network.userDetailsPath}?userId=${userId}&botId=${SystemBot.contactsBot.botId}`,
                        'headers': {
                            accessKeyId: user.aws.accessKeyId,
                            secretAccessKey: user.aws.secretAccessKey,
                            sessionToken: user.aws.sessionToken
                        }
                    };
                    return Network(options);
                }
            })
            .then((response) => {
                console.log('Contact response data ', response.data);
                if (response.data) {
                    let contact = response.data;
                    return ChannelContactDAO.insertChannelContact(contact.userId, contact.userName, contact.emailAddress, contact.screenName, contact.givenName, contact.surname)
                }
            })
            .then((contact) => {
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
        const sliderFormat = contacts.map((person) => {
            return {
                title: person.userName,
                data: {
                    contact_info: [{
                        key: I18n.t('Name'),
                        value: person.userName
                    }, {
                        key: I18n.t('Email'),
                        value: person.emailAddress
                    }, {
                        key: I18n.t('Screen_Name'),
                        value: person.screenName
                    }, {
                        key: I18n.t('UUID'),
                        value: person.userId
                    }, {
                        key: I18n.t('Given_Name'),
                        value: person.givenName
                    }, {
                        key: I18n.t('Sur_Name'),
                        value: person.surname
                    }]
                }
            }
        });
        let message = new Message();
        message.sliderMessage(sliderFormat, opts);
        return message;
    };
}
