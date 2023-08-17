exports.getInstance = function (smConfig) {
    if (smConfig.T23_SM_PROVIDER=='vault'){
        var vaultSecretManager = require('./vault-secret-manager');
        return vaultSecretManager.getInstance(smConfig);
    } else if (smConfig.T23_SM_PROVIDER=='aws'){
        var awsSecretManager = require('./aws-secret-manager');
        return awsSecretManager.getInstance(smConfig);
    } else {
        throw new Error('SecretManagerKey not implemented yet: "'+smConfig.T23_SM_PROVIDER+'"');
    }
};

