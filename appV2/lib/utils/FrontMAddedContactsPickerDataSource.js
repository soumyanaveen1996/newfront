import _ from 'lodash';
import { Contact } from '../../lib/capability';
import images from '../../config/images';
import { ContactType } from '../../lib/capability/Contact';
import { getRankAndRolesDataFromApi } from '../../Screens/Contacts/config';
const CONTACTS_REQUEST_PAGE_SIZE = 20;
//TODO: optimize this file
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
        this.newAcceptIgnoreData = {};
        this.loadData();
        this.l2Data = null;
        this.rankData2All = null;
    }

    loadData() {
        Contact.getAddedContacts().then(async (contacts) => {
            await getRankAndRolesDataFromApi().then((rank2Lavel) => {
                this.l2Data = rank2Lavel.rankData1Groups;
                this.rankData2All = rank2Lavel.rankData2All;
                this.updateData(contacts);
                this.pageLoaded += 1;
            });
            // let temp = contacts.filter((res) => res.showAcceptIgonreMsg);
        });
    }

    updateData(contactsData) {
        this.allContactIds = [];
        const contactIds = _.map(contactsData, (data) => data.userId);
        _.each(contactsData, (data) => {
            this.idToContacts[data.userId] = {
                id: data.userId,
                name: data.userName,
                emailAddress:
                    data.contactType === ContactType.FRONTM
                        ? data.emailAddress
                        : null,
                emailAddresses:
                    data.contactType === ContactType.LOCAL
                        ? data.emailAddresses
                        : null,
                phoneNumbers: data.phoneNumbers,
                isWaitingForConfirmation: data.waitingForConfirmation || false,
                isFavourite: data.isFavourite || false,
                contactType: data.contactType || ContactType.FRONTM,
                ignored: data.ignored || false,
                type: data.type || 'people',
                rankLevel1: data.rankLevel1 || false,
                rankLevel2: data.rankLevel2 || false,
                rankLevel3: data.rankLevel3 || false,
                sailingStatus: data.sailingStatus || false,
                shipName: data.shipName || false,
                shipIMO: data.shipIMO || false,
                noRanks:
                    data.contactType !== ContactType.LOCAL &&
                    data.rankLevel1 &&
                    data.rankLevel1 !== ''
                        ? false
                        : true,
                userCompanyName: data.userCompanyName || false,
                address: data.address || null,
                nationality: data.nationality || null,
                showAcceptIgonreMsg: data.showAcceptIgnoreMsg || false
            };
        });
        this.allContactIds = _.uniq(this.allContactIds.concat(contactIds));
        this.delegate.onDataUpdate();
    }

    contactsDataBySection(contactsDict) {
        // console.log('caalle--> contactsDataBySection', contactsDict);
        const alphabets = 'abcdefghijklmnopqrstuvwxyz#'.split('');
        return _.map(alphabets, (alphabet) => {
            const sortedContacts = _.sortBy(
                contactsDict[alphabet],
                (contact) => contact.name
            );
            return { data: sortedContacts, title: alphabet.toUpperCase() };
        });
    }
    contactsDataBySectionForRank(contactsDict) {
        const RankGroups = [...this.l2Data];
        return _.map(RankGroups, (group) => {
            const sortedContacts = _.sortBy(
                contactsDict[group],
                (contact) => contact.rankLevel3
            );
            return { data: sortedContacts, title: group, isExpanded: false };
        });
    }
    contactsDataSorted() {
        const data = Object.values(this.idToContacts);
        return _.sortBy(data, (contact) => contact.name);
    }

    contactGroupByRank(contact) {
        if (contact.rankLevel2 && contact.rankLevel2.length > 1) {
            return `${contact.rankLevel2}`;
        }
        if (contact.rankLevel1 && contact.rankLevel1 == 'ship') {
            return 'Ship';
        }
        if (contact.rankLevel1 && contact.rankLevel1 == 'shore') {
            return 'Shore';
        }
        if (contact.contactType && contact.contactType == 'local') {
            return 'Personal';
        }
        return 'Uncategorised';
    }

    createContactsDict(filterFunc) {
        return _.reduce(
            this.allContactIds,
            (result, contactId) => {
                const contact = this.idToContacts[contactId];
                if (filterFunc === undefined || filterFunc(contact.name)) {
                    // firstChar =  section header that is // Captain, ship, shore, officer, engineer
                    const firstChar = this.contactGroupByRank(contact);
                    (result[firstChar] || (result[firstChar] = [])).push(
                        contact
                    );
                }
                return result;
            },
            {}
        );
    }

    getData() {
        if (this.allContactIds.length === 0) {
            return [];
        }
        return this.contactsDataBySectionForRank(this.createContactsDict());
    }

    // getIgnoredAndNewReqData() {
    //     if (this.allContactIds.length === 0) {
    //         return { newContactReq: [], pendingContactReq: [] };
    //     }
    //     let newContactReq = [],
    //         pendingContactReq = [];
    //     const tempData = this.allContactIds.map(
    //         (contactId) => this.idToContacts[contactId]
    //     );
    //     let newData = tempData.map((res) => {
    //         // const checkContact = this.idToContacts[res];
    //         const ignored = res.ignored;
    //         const showAcceptIgnoreMsg = res.showAcceptIgonreMsg;
    //         if (ignored) {
    //             console.log('got that 1', res);
    //             pendingContactReq.push(res);
    //         }
    //         if (showAcceptIgnoreMsg) {
    //             console.log('got that 11----->', res);
    //             newContactReq.push(res);
    //         }
    //     });

    //     return {
    //         newContactReq: newContactReq,
    //         pendingContactReq: pendingContactReq
    //     };
    // }

    getSortedData() {
        if (this.allContactIds.length === 0) {
            return [];
        }
        return this.contactsDataSorted();
    }

    getFilteredData(text) {
        if (this.allContactIds.length === 0) {
            return [];
        }
        text = text.toLowerCase();
        const re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
        const test = re.test(text);
        if (test) {
            const tempData = this.allContactIds.map(
                (contactId) => this.idToContacts[contactId]
            );
            const filteredData = tempData.filter(
                (i) => i.emailAddress === text
            );

            const reduceData = filteredData.reduce((p, c) => {
                let char = this.contactGroupByRank(c);
                p[char] = [].concat(p[char] || [], c);
                return p;
            }, {});
            return this.contactsDataBySectionForRank(reduceData);
        }
        const filterFunc = (contact) => contact.toLowerCase().includes(text);
        return this.contactsDataBySectionForRank(
            this.createContactsDict(filterFunc)
        );
    }

    getSortedFilteredData(text) {
        if (this.allContactIds.length === 0) {
            return [];
        }
        const data = Object.values(this.idToContacts);
        const searchText = text.toLowerCase();
        return data.filter((contact) =>
            contact.name.toLowerCase().includes(searchText)
        );
    }

    loadImage(contactId) {
        this.idToContacts[contactId].thumbnail = images.user_image;
    }
}

class ContactsPickerDelegateNotImplemented extends Error {
    constructor(functionName = '', ...args) {
        super(functionName, ...args);
        this.message = `ContactsPickerDelegate : ${functionName} function has to be implemented.`;
    }
}
