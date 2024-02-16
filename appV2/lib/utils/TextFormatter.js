import Bugsnag from '../../config/ErrorMonitoring';

export function format(string) {
    try {
        if (string.startsWith('#date')) {
            const newString = string.substr(6, 13);
            return new Date(parseInt(newString)).toLocaleString();
        }
        return string;
    } catch (e) {
        return string;
    }
}

export function formatContact(data) {
    try {
        const contactObj = {
            phoneNumbers: {
                mobile: '',
                land: '',
                satellite: ''
            },
            profileImage: data.profileImage,
            userName: data.name,
            emailAddresses: {
                home: '',
                work: ''
            },
            userId: data.userId
        };

        if (data.phoneNumbers && data.phoneNumbers.length > 0) {
            const landNumber = data.phoneNumbers.find(
                (element) =>
                    element.label === 'land' ||
                    element.label === 'home' ||
                    element.label === 'work' ||
                    element.label === 'other'
            );
            if (landNumber) {
                contactObj.phoneNumbers.land = landNumber.number;
            }
            const mobileNumber = data.phoneNumbers.find(
                (element) => element.label === 'mobile'
            );
            if (mobileNumber) {
                contactObj.phoneNumbers.mobile = mobileNumber.number;
            }
            const satelliteNumber = data.phoneNumbers.find(
                (element) => element.label === 'satellite'
            );
            if (satelliteNumber) {
                contactObj.phoneNumbers.satellite = satelliteNumber.number;
            }
        }
        contactObj.phoneNumbers.land = contactObj.phoneNumbers.land.replace(
            /[^+\d]+/g,
            ''
        );
        contactObj.phoneNumbers.mobile = contactObj.phoneNumbers.mobile.replace(
            /[^+\d]+/g,
            ''
        );
        contactObj.phoneNumbers.satellite = contactObj.phoneNumbers.satellite.replace(
            /[^+\d]+/g,
            ''
        );
        if (data.emails && data.emails.length > 0) {
            const home = data.emails.find(
                (element) => element.label === 'home'
            );
            if (home) {
                contactObj.emailAddresses.home = home.email;
            } else if (data.emails[0]) {
                contactObj.emailAddresses.home = data.emails[0].email;
            }
            const work = data.emails.find(
                (element) => element.label === 'work'
            );
            if (work) {
                contactObj.emailAddresses.work = work.email;
            } else if (data.emails[1]) {
                contactObj.emailAddresses.work = data.emails[1].email;
            }
        }
        return contactObj;
    } catch (error) {
        console.log('error while formatting', data);
        Bugsnag.notify(error, (report) => {
            report.context = 'Contact formatting';
        });
    }
}
export function getInitialsForName(name) {
    var initials = name?.replace(/[^a-zA-Z- ]/g, '').match(/\b\w/g);
    if (initials) return initials.join('').substring(0, 2).toUpperCase();
    else return '';
}
export function checkMinifiedNameLength(data) {
    return data && data.length > 0
        ? data.length > 14
            ? `${data.substring(0, 14)}...`
            : `${data}`
        : '';
}
