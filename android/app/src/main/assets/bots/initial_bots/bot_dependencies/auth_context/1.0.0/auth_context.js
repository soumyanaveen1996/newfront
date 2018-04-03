(function() {
  let getAuthUser = function(botContext) {
    let Auth = botContext.getCapability('Auth');

    // Will return a promise
    return Auth.getUser();
  }

  let isUserLoggedIn = function(botContext) {
    let Auth = botContext.getCapability('Auth');

    // Will return a promise
    return Auth.isUserLoggedIn();
  }

  let login = function(botContext, provider) {
    let Auth = botContext.getCapability('Auth');
    let conversationContext = botContext.getConversationContext() || {};
    let botId = botContext.botManifest.id;

    // Will return a promise
    return Auth.login(provider, conversationContext.conversationId, botId);
  }

  let logout = function(botContext) {
    let Auth = botContext.getCapability('Auth');

    // Will return a promise
    return Auth.logout();
  }

  let getAuthProviders = function(botContext) {
    let Auth = botContext.getCapability('Auth');
    return Auth.authProviders();
  }

    let updateUserDetails = function(userDetails, botContext) {
        let Auth = botContext.getCapability('Auth');
        return Auth.updateUserDetails(userDetails);
    };

    let addDomains = function(domains, botContext) {
        let Auth = botContext.getCapability('Auth');
        return Auth.addDomains(domains);
    };

  return {
      getAuthUser: getAuthUser,
      isUserLoggedIn: isUserLoggedIn,
      logout: logout,
      login: login,
      getAuthProviders: getAuthProviders,
      updateUserDetails: updateUserDetails,
      addDomains: addDomains,
      version: '1.0.0'
  };
})();
