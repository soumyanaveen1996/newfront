import _ from 'lodash';
import { CONTACTS_REQUEST_PAGE_SIZE } from './config';
import { Contact } from '../../lib/capability';
import images from '../../config/images'

export default class ContactsPickerDataSource {
    constructor(delegate) {
        if (!delegate.onDataUpdate) {
            throw new ContactsPickerDelegateNotImplemented('onDataUpdate');
        }
        this.delegate = delegate;
        this.pageLoaded = 0;
        this.pageSize = CONTACTS_REQUEST_PAGE_SIZE;
        this.allContactIds = [];
        this.idToContacts = {};

        this.loadData();
    }

    loadData() {
        Contact.getAddedContacts()
            .then((contacts) => {
                if (contacts.length > 0) {
                    this.updateData(contacts)
                }
                this.pageLoaded += 1;
            });
    }

    updateData(contactsData) {
        const contactIds = _.map(contactsData, (data) => {
            return data.userId;
        });
        _.each(contactsData, (data) => {
            this.idToContacts[data.userId] = {
                id: data.userId,
                name: data.userName,
                firstName: data.givenName,
                middleName: data.middleName,
                lastName: data.surname,
                imageAvailable: true,
                emails: [{email: data.emailAddress}], // Format based on phone contact from expo
                phoneNumbers: data.phoneNumbers,
                screenName: data.screenName
            }
        });
        this.allContactIds = _.uniq(this.allContactIds.concat(contactIds));
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
        this.idToContacts[contactId].thumbnail = images.user_image;
    }
}

class ContactsPickerDelegateNotImplemented extends Error {
    constructor(functionName = '', ...args) {
        super(functionName, ...args);
        this.message = 'ContactsPickerDelegate : ' + functionName +  ' function has to be implemented.';
    }
}
