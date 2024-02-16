import GlobalColors from '../../config/styles';
import UserServices from '../../apiV2/UserServices';
import { DeviceStorage } from '../../lib/capability';
import AsyncStorage from '@react-native-community/async-storage';
import images from '../../images';
import Store from '../../redux/store/configureStore';
import { getL2RoleMapDataWithColors } from '../../redux/actions/UserActions';
import AppFonts from '../../config/fontConfig';

export const checkBoxConfig = {
    uncheckedIcon: 'ios-square-outline',
    checkedIcon: 'ios-checkbox-outline',
    checkedColor: GlobalColors.frontmLightBlue,
    iconType: 'ionicon'
};

export const importCheckBoxConfig = {
    uncheckedIcon: 'ios-square-outline',
    checkedIcon: 'checkbox',
    checkedColor: GlobalColors.frontmLightBlue,
    iconType: 'ionicon'
};

export const SelectedCheckBoxConfig = {
    uncheckedIcon: 'ios-square-outline',
    checkedIcon: 'minus-box',
    checkedColor: GlobalColors.frontmLightBlue,
    iconType: 'material-community'
};

export const searchBarConfig = {
    placeholderTextColor: GlobalColors.textDarkGrey
};

export const CameraOptions = {
    allowsEditing: false,
    exif: true,
    base64: true
};

export const ChatImageOptions = {
    width: 220,
    height: 220
};

export const addButtonConfig = {
    type: 'Content',
    name: 'add',
    size: 30,
    underlayColor: 'transparent',
    color: GlobalColors.primaryButtonColor,
    fontWeight: AppFonts.NORMAL
};

export const SECTION_HEADER_HEIGHT = 49;
export const CONTACTS_REQUEST_PAGE_SIZE = 20;

// rank and roles getting from api
var rawRankandRoleData;
var rawRankandRoleDataGroups;

export const getRankAndRolesDataFromApi = (dataCheck = false) =>
    new Promise((resolve, reject) => {
        UserServices.getLevel3Ranks()
            .then((response) => {
                Store.dispatch(getL2RoleMapDataWithColors(response));

                DeviceStorage.save('roleMap', response);
                let objForShipOnly = {},
                    objForShoreOnly = {};
                let level2DataShip = null;
                let level2DataShore = null;
                level2DataShip = response.ship.map((i) => {
                    if (objForShipOnly[i.info] === undefined) {
                        objForShipOnly[i.info] = [];
                        let n = i.level2.filter((res) => {
                            objForShipOnly[i.info].push(res.info);
                            return res.info;
                        });
                        return i.info;
                    }
                });
                level2DataShore = response.shore.map((i) => {
                    if (objForShoreOnly[i.info] === undefined) {
                        objForShoreOnly[i.info] = [];
                        let n = i.level2.filter((res) => {
                            objForShoreOnly[i.info].push(res.info);
                            return res.info;
                        });
                        return i.info;
                    }
                });
                let returnData = level2DataShip.concat(level2DataShore);
                let hardCategory = [
                    'Ship',
                    'Shore',
                    'Uncategorised',
                    'Personal'
                ];
                let newObjForBoth = { ...objForShipOnly, ...objForShoreOnly };
                let rankData1Groups = returnData.concat(hardCategory),
                    rankData2All = newObjForBoth;

                resolve({
                    rankData1Groups: rankData1Groups,
                    rankData2All: rankData2All
                });
            })
            .catch((e) => {
                DeviceStorage.get('roleMap').then((roleMap) => {
                    Store.dispatch(getL2RoleMapDataWithColors(roleMap));
                    let level2DataShip = null;
                    let level2DataShore = null;
                    let objForShipOnly = {},
                        objForShoreOnly = {};
                    level2DataShip = roleMap.ship.map((i) => {
                        if (objForShipOnly[i.info] === undefined) {
                            objForShipOnly[i.info] = [];
                            let n = i.level2.filter((res) => {
                                objForShipOnly[i.info].push(res.info);
                                return res.info;
                            });
                            return i.info;
                        }
                    });
                    level2DataShore = roleMap.shore.map((i) => {
                        if (objForShoreOnly[i.info] === undefined) {
                            objForShoreOnly[i.info] = [];
                            let n = i.level2.filter((res) => {
                                objForShoreOnly[i.info].push(res.info);
                                return res.info;
                            });
                            return i.info;
                        }
                    });
                    let returnData = level2DataShip.concat(level2DataShore);
                    let hardCategory = [
                        'Ship',
                        'Shore',
                        'Uncategorised',
                        'Personal'
                    ];

                    let newObjForBoth = {
                        ...objForShipOnly,
                        ...objForShoreOnly
                    };

                    let rankData1Groups = returnData.concat(hardCategory),
                        rankData2All = newObjForBoth;
                    resolve({
                        rankData1Groups: rankData1Groups,
                        rankData2All: rankData2All
                    });
                });
            });
    });

// mapping for groups and provided icons for contacts hard coded
export const getContactRankImage = (contact) => {
    if (contact.rankLevel3 == 'Captain' || contact.rankLevel3 == 'Master')
        return images.rankCaptain;
    if (contact.rankLevel3 == 'Cadet') return images.rankDeckCadet;
    if (contact.rankLevel3 == 'Engine Cadet') return images.rankEngineCadet;
    if (contact.rankLevel3 == 'Chief Engineer') return images.rankChiefEngineer;
    if (contact.rankLevel3 == '2nd Engineer') return images.rank2Engineer;
    if (contact.rankLevel3 == '3rd Engineer') return images.rank3Engineer;
    if (contact.rankLevel3 == '4th Engineer') return images.rank4Engineer;
    if (contact.rankLevel3 == 'Chief Officer') return images.rankChiefOfficer;
    if (contact.rankLevel3 == '2nd Officer') return images.rank2Officer;
    if (contact.rankLevel3 == '3rd Officer') return images.rank3Officer;
    if (contact.rankLevel1 == 'ship') return images.rankShipUser;
    if (contact.rankLevel1 == 'shore') return images.rankShoreUser;
};

export default {
    checkBoxConfig,
    searchBarConfig,
    CameraOptions,
    ChatImageOptions,
    CONTACTS_REQUEST_PAGE_SIZE,
    SECTION_HEADER_HEIGHT,
    importCheckBoxConfig,
    SelectedCheckBoxConfig,
    getContactRankImage,
    getRankAndRolesDataFromApi
};
