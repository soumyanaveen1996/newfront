import { GlobalColors } from '../../config/styles';

export const checkBoxConfig = {
    uncheckedIcon: 'ios-square-outline',
    checkedIcon: 'ios-checkbox-outline',
    checkedColor: GlobalColors.frontmLightBlue,
    iconType: 'ionicon'
};

export const searchBarConfig = {
    placeholderTextColor: GlobalColors.headerTextInputPlaceholder
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
    color: GlobalColors.sideButtons,
    fontWeight: '500'
};

export const SECTION_HEADER_HEIGHT = 49;
export const CONTACTS_REQUEST_PAGE_SIZE = 20;

export default {
    checkBoxConfig,
    searchBarConfig,
    CameraOptions,
    ChatImageOptions,
    CONTACTS_REQUEST_PAGE_SIZE,
    SECTION_HEADER_HEIGHT
};
