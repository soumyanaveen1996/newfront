import { Contact } from '../capability';
import ChannelContactDAO from '../persistence/ChannelContactDAO';
import _ from 'lodash';

class ContactsCache {
    init = () => {
        this.loaded = false;
        this.contactsCache = {};
        ChannelContactDAO.selectAllContacts().then((contacts) => {
            _.forEach(contacts, (contact) => {
                this.contactsCache[contact.userId] = contact;
            });
            this.loaded = true;
        });
    };

    fetchContactDetailsForUser = (userId) =>
        new Promise((resolve, reject) => {
            Contact.fetchAndAddContactForUser(userId)
                .then((contact) => {
                    if (contact) {
                        this.contactsCache[contact.userId] = contact;
                    }
                    resolve(contact);
                })
                .catch(reject);
        });

    getUserDetails = async (userId) => {
        let contact;
        if (userId.addedByBot) {
            return;
        }
        try {
            contact = this.contactsCache[userId];
            if (contact) {
                return contact;
            }
            // console.log('we willsee wats the rreo is  ', userId, contact);
            contact = await this.fetchContactDetailsForUser(userId);

            return contact;
        } catch (error) {
            console.log('Error Fetch Contacts from Server', error);
            return contact;
        }
    };
}

export default new ContactsCache();
