import i18n from '../config/i18n/i18n';
import AlertDialog from '../lib/utils/AlertDialog';

const alertForGoingBackDailog = (callBack, string) => {
    AlertDialog.show(`Save changes?`, `${string}`, [
        {
            text: 'CANCEL',
            onPress: () => {
                callBack?.(false);
            },
            style: 'cancel'
        },
        {
            text: 'SAVE',
            onPress: () => {
                callBack?.(true);
            }
        }
    ]);
};

export default alertForGoingBackDailog;
