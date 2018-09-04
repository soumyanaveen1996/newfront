import { Contact } from '../capability';
import ChannelContactDAO from '../persistence/ChannelContactDAO';
import _ from 'lodash';

class ContactsCache {
    init = () => {
        this.loaded = false
        this.contactsCache = {};
        ChannelContactDAO.selectAllContacts()
            .then(contacts => {
                _.forEach(contacts, (contact) => {
                    this.contactsCache[contact.userId] = contact;
                })
                this.loaded = true;
            });
    }

    fetchContactDetailsForUser= (userId) => new Promise((resolve, reject) => {
        Contact.fetchAndAddContactForUser(userId)
            .then(contact => {
                if (contact) {
                    this.contactsCache[contact.userId] = contact;
                }
                resolve(contact);
            })
            .catch(reject);
    });

    getUserDetails = (userId) => {
        return this.contactsCache[userId];
    }
}

export default new ContactsCache();
