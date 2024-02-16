import { Platform } from 'react-native';
import configToUse from '../config/config';
import apiClient from './Api';
import { getBaseParams } from './BaseParams';

export default class AuthService {
    // rpc Signup (SignupUser) returns (SignupResponse) {}
    static signup = (userDetails) => {
        return apiClient().post('auth.AuthService/Signup', {
            ...getBaseParams(),
            ...userDetails
        });
    };

    // rpc ConfirmSignup (SignupUser) returns (SignupResponse) {}
    static confirmSignup = (userDetails) => {
        return apiClient().post('auth.AuthService/ConfirmSignup', {
            ...getBaseParams(),
            ...userDetails
        });
    };

    // rpc ResendSignupConfirmCode (SignupUser) returns (SignupResponse) {}
    static resendSignupCode = (userDetails) => {
        return apiClient().post('auth.AuthService/ResendSignupConfirmCode', {
            ...getBaseParams(),
            ...userDetails
        });
    };

    // rpc ResetPassword (SignupUser) returns (SignupResponse) {}
    static resetPassword = (userDetails) => {
        return apiClient().post('auth.AuthService/ResetPassword', {
            ...getBaseParams(),
            ...userDetails
        });
    };

    // rpc ConfirmPasswordReset (SignupUser) returns (SignupResponse) {}
    static confirmPasswordReset = (userDetails) => {
        return apiClient().post('auth.AuthService/ConfirmPasswordReset', {
            ...getBaseParams(),
            ...userDetails
        });
    };

    // rpc ChangePassword (SignupUser) returns (SignupResponse) {}
    static changePassword = (userDetails) => {
        return apiClient().post('auth.AuthService/ChangePassword', {
            ...getBaseParams(),
            ...userDetails
        });
    };

    // rpc DeleteUser (SignupUser) returns (SignupResponse) {}
    static deleteUser = (userDetails) => {
        return apiClient().post('auth.AuthService/DeleteUser', {
            ...getBaseParams(),
            ...userDetails
        });
    };

    // rpc FrontmSignin (FrontmSigninInput) returns (SigninResponse) {}
    static signinWithFrontm = (userDetails) => {
        return apiClient().post('auth.AuthService/FrontmSignin', {
            ...getBaseParams(),
            ...userDetails
        });
    };

    // rpc GoogleSignin (GoogleSigninInput) returns (SigninResponse) {}
    static signinWithGoogle = (userDetails) => {
        return apiClient().post('auth.AuthService/GoogleSignin', {
            ...getBaseParams(),
            ...userDetails
        });
    };

    // rpc AppleSignin (AppleSigninInput) returns (SigninResponse) {}
    static signinWithApple = (userDetails) => {
        return apiClient().post('auth.AuthService/AppleSignin', {
            ...getBaseParams(),
            ...userDetails
        });
    };

    // rpc FacebookSignin (FacebookSigninInput) returns (SigninResponse) {}
    static signinWithFacebook = (userDetails) => {
        return apiClient().post('auth.AuthService/FacebookSignin', {
            ...getBaseParams(),
            ...userDetails
        });
    };

    // rpc ResetUserActivity(UserActivityInput) returns (SignupResponse) {}
    static resetUserActivity = (userDetails) => {
        return apiClient().post('auth.AuthService/ResetUserActivity', {
            ...getBaseParams(),
            ...userDetails
        });
    };

    // rpc InitiateSoftwareMfa(MFAInput) returns (MFAOutput) {}
    static initiateSoftwareMfa = (userDetails) => {
        return apiClient().post('auth.AuthService/InitiateSoftwareMfa', {
            ...getBaseParams(),
            ...userDetails
        });
    };

    // rpc ActivateSoftwareMfa(MFAInput) returns (MFAOutput) {}
    static activateSoftwareMfa = (userDetails) => {
        return apiClient().post('auth.AuthService/ActivateSoftwareMfa', {
            ...getBaseParams(),
            ...userDetails
        });
    };

    // rpc DeactivateSoftwareMfa(MFAInput) returns (MFAOutput) {}
    static deactivateSoftwareMfa = (userDetails) => {
        return apiClient().post('auth.AuthService/DeactivateSoftwareMfa', {
            ...getBaseParams(),
            ...userDetails
        });
    };

    // rpc ChangeSoftwareMfa(MFAInput) returns (MFAOutput) {}
    static changeSoftwareMfa = (userDetails) => {
        return apiClient().post('auth.AuthService/ChangeSoftwareMfa', {
            ...getBaseParams(),
            ...userDetails
        });
    };

    // rpc CreateAnonymousAccess (AnonAccessInput) returns (SigninResponse) {}
    // rpc RefreshAnonymousUserSession (AnonAccessInput) returns (SignupResponse) {}
}
