import _ from 'lodash/core';
import Contacts from 'react-native-contacts';

export default class ContactsPickerDataSource {
    constructor(delegate) {
        if (!delegate.onDataUpdate) {
            throw new ContactsPickerDelegateNotImplemented('onDataUpdate');
        }
        this.delegate = delegate;
        this.allContactIds = [];
        this.idToContacts = {};
        this.requestPermissions();
    }

    requestPermissions() {
        Contacts.requestPermission((error, permission) => {
            if (permission === 'authorized') {
                this.loadData();
            }
        });
    }

    loadData() {
        // Gets contacts without photos only on iOS
        // On Android, even the photo URIs are returned
        // Sample response:
        /*    {
                recordID: '6b2237ee0df85980',
                company: "",
                emailAddresses: [{
                    label: "work",
                    email: "carl-jung@example.com",
                }],
                familyName: "Jung",
                givenName: "Carl",
                jobTitle: "",
                middleName: "",
                phoneNumbers: [{
                    label: "mobile",
                    number: "(555) 555-5555",
                }],
                hasThumbnail: true,
                thumbnailPath: 'content://com.android.contacts/display_photo/3',
                postalAddresses: [{
                  street: '123 Fake Street',
                  city: 'Sample City',
                  state: 'CA',
                  region: 'CA',
                  postCode: '90210',
                  country: 'USA',
                  label: 'home'
                }]
            }
        */
        Contacts.getAllWithoutPhotos((error, contacts) => {
            if (!error) {
                if (Array.isArray(contacts) && contacts.length > 0) {
                    this.updateData(contacts);
                }
            }
        });
    }

    updateData(contactsData) {
        const contactIds = _.map(contactsData, (data) => {
            return data.recordID;
        })
        // In Android, the entire display name is passed in the givenName field. middleName and familyName will be ""
        _.each(contactsData, (data) => {
            this.idToContacts[data.recordID] = {
                id: data.recordID,
                name: data.givenName,
                firstName: '',
                middleName: data.middleName,
                lastName: data.familyName,
                imageAvailable: data.hasThumbnail,
                thumbnail: data.thumbnailPath,
                emails: data.emailAddresses,
                phoneNumbers: data.phoneNumbers,
            }
        });
        this.allContactIds = this.allContactIds.concat(contactIds);
        this.delegate.onDataUpdate();
    }

    contactsDataBySection(contactsDict) {
        let alphabets = 'abcdefghijklmnopqrstuvwxyz#'.split('');
        return _.map(alphabets, (alphabet) => {
            const sortedContacts = _.sortBy(contactsDict[alphabet], (contact) => {
                return contact.name;
            })
            return { data : sortedContacts, title: alphabet.toUpperCase() }

        });
    }

    createContactsDict(filterFunc) {
        return _.reduce(this.allContactIds, (result, contactId) => {
            const contact = this.idToContacts[contactId];
            if (filterFunc === undefined || filterFunc(contact)) {
                let firstChar = contact.name.length > 0 ? contact.name[0].toLowerCase() : '#';
                (result[firstChar] || (result[firstChar] = [])).push(contact);
            }
            return result;
        }, {});
    }

    getData() {
        if (this.allContactIds.length === 0) {
            return [];
        }
        return this.contactsDataBySection(this.createContactsDict());
    }

    getFilteredData(text) {
        if (this.allContactIds.length === 0) {
            return [];
        }
        text = text.toLowerCase();
        let filterFunc = (contact) => contact.name.toLowerCase().indexOf(text) !== -1;
        return this.contactsDataBySection(this.createContactsDict(filterFunc));
    }

    loadImage(contactId) {
        // In Android, images are loaded by default
        if (Platform.OS === 'ios') {
            Contacts.getPhotoForId(contactId, (error, photoId) => {
                if (!error) {
                    this.idToContacts[contactId].thumbnail = photoId;
                    this.delegate.onDataUpdate();
                }
            });
        }
    }
}

class ContactsPickerDelegateNotImplemented extends Error {
    constructor(functionName = '', ...args) {
        super(functionName, ...args);
        this.message = 'ContactsPickerDelegate : ' + functionName +  ' function has to be implemented.';
    }
}
