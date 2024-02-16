import React from 'react';
import appleAuth, {
    AppleButton,
    AppleAuthRequestOperation,
    AppleAuthRequestScope
} from '@invertase/react-native-apple-authentication';

const AppleLoginButton = (props) => {
    const onAppleButtonPress = async () => {
        // performs login request
        appleAuth
            .performRequest({
                requestedOperation: AppleAuthRequestOperation.LOGIN,
                requestedScopes: [
                    AppleAuthRequestScope.EMAIL,
                    AppleAuthRequestScope.FULL_NAME
                ]
            })
            .then((appleAuthRequestResponse) => {
                props.onSignInComplete(appleAuthRequestResponse);
            })
            .catch((e) => {
                console.log(e);
            });
    };

    return (
        <AppleButton
            buttonStyle={AppleButton.Style.BLACK}
            buttonType={AppleButton.Type.SIGN_IN}
            style={{
                width: '100%',
                height: 40,
                marginBottom: 12,
                borderRadius: 20,
                overflow: 'hidden'
            }}
            cornerRadius={3}
            onPress={onAppleButtonPress}
        />
    );
};
export default AppleLoginButton;
