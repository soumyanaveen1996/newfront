(function() {
  var getAuthUser = function getAuthUser(botContext) {
    var Auth = botContext.getCapability('Auth');
    return Auth.getUser();
  };
  var isUserLoggedIn = function isUserLoggedIn(botContext) {
    var Auth = botContext.getCapability('Auth');
    return Auth.isUserLoggedIn();
  };
  var login = function login(botContext, provider) {
    var Auth = botContext.getCapability('Auth');
    var conversationContext = botContext.getConversationContext() || {};
    var botId = botContext.botManifest.id;
    return Auth.login(provider, conversationContext.conversationId, botId);
  };
  var loginWithFrontm = function loginWithFrontm(botContext, user) {
    var Auth = botContext.getCapability('Auth');
    return Auth.loginWithFrontm(user);
  };
  var signupWithFrontm = function signupWithFrontm(botContext, user) {
    var Auth = botContext.getCapability('Auth');
    return Auth.signupWithFrontm(user);
  };
  var resendConfirmationCode = function resendConfirmationCode(
    botContext,
    user
  ) {
    var Auth = botContext.getCapability('Auth');
    return Auth.resendFrontmSignupCode(user);
  };
  var confirmFrontmSignup = function confirmFrontmSignup(botContext, user) {
    var Auth = botContext.getCapability('Auth');
    return Auth.confirmFrontmSignup(user);
  };
  var logout = function logout(botContext) {
    var Auth = botContext.getCapability('Auth');
    return Auth.logout();
  };
  var getAuthProviders = function getAuthProviders(botContext) {
    var Auth = botContext.getCapability('Auth');
    return Auth.authProviders();
  };
  var updateUserDetails = function updateUserDetails(userDetails, botContext) {
    var Auth = botContext.getCapability('Auth');
    return Auth.updateUserDetails(userDetails);
  };
  var setDomains = function setDomains(domains, botContext) {
    var Auth = botContext.getCapability('Auth');
    if (Auth.setDomains) {
      return Auth.setDomains(domains);
    } else {
      return Promise.reject('Older version of the app');
    }
  };
  var updatePassword = function updatePassword(user, botContext) {
    var Auth = botContext.getCapability('Auth');
    return Auth.updatePassword(user);
  };
  var deleteDataAndLogout = function deleteDataAndLogout(botContext) {
    var Auth = botContext.getCapability('Auth');
    return Auth.deleteUser();
  };
  var confirmReset = function confirmReset(botContext, user) {
    var Auth = botContext.getCapability('Auth');
    return Auth.confirmReset(user);
  };
  var resetPassword = function resetPassword(botContext, user) {
    var Auth = botContext.getCapability('Auth');
    return Auth.resetPassword(user);
  };
  var updateSetting = function updateSetting(key, value, botContext) {
    var Auth = botContext.getCapability('Auth');
    return Auth.setUserSetting(key, value);
  };
  var getSetting = function getSetting(key, defaultValue, botContext) {
    var Auth = botContext.getCapability('Auth');
    return Auth.getUserSetting(key, defaultValue);
  };
  return {
    getAuthUser: getAuthUser,
    isUserLoggedIn: isUserLoggedIn,
    logout: logout,
    login: login,
    signupWithFrontm: signupWithFrontm,
    confirmFrontmSignup: confirmFrontmSignup,
    resendConfirmationCode: resendConfirmationCode,
    loginWithFrontm: loginWithFrontm,
    resetPassword: resetPassword,
    confirmReset: confirmReset,
    getAuthProviders: getAuthProviders,
    updateUserDetails: updateUserDetails,
    setDomains: setDomains,
    updatePassword: updatePassword,
    deleteDataAndLogout: deleteDataAndLogout,
    updateSetting: updateSetting,
    getSetting: getSetting,
    version: '1.0.0',
  };
})();
