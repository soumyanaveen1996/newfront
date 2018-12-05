import { GlobalColors } from '../../config/styles';

export const checkBoxConfig = {
    uncheckedIcon: 'ios-radio-button-off-outline',
    checkedIcon: 'ios-checkmark-circle',
    checkedColor: 'rgb(255, 127, 80)',
    iconType: 'ionicon'
};

export const searchBarConfig = {
    placeholderTextColor: GlobalColors.headerTextInputPlaceholder
};

export const addButtonConfig = {
    type: 'Content',
    name: 'add',
    size: 30,
    underlayColor: 'transparent',
    color: GlobalColors.sideButtons,
    fontWeight: '500'
};

export const SECTION_HEADER_HEIGHT = 22;
export const CONTACTS_REQUEST_PAGE_SIZE = 20;

export default {
    checkBoxConfig,
    searchBarConfig,
    CONTACTS_REQUEST_PAGE_SIZE,
    SECTION_HEADER_HEIGHT
};
