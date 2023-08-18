const T23_SM_PROVIDER="T23_SM_PROVIDER";
const T23_SM_KEY="T23_SM_KEY";

function getInstance(smConfig) {
    if (smConfig[T23_SM_PROVIDER]=='vault'){
        var vaultSecretManager = require('./vault-secret-manager');
        return vaultSecretManager.getInstance(smConfig);
    } else if (smConfig[T23_SM_PROVIDER]=='aws'){
        var awsSecretManager = require('./aws-secret-manager');
        return awsSecretManager.getInstance(smConfig);
    } else {
        throw new Error('SecretManagerKey not implemented yet: "'+smConfig.T23_SM_PROVIDER+'"');
    }
};

function ISecretManager(){
}

exports.T23_SM_PROVIDER = T23_SM_PROVIDER;
exports.T23_SM_KEY = T23_SM_KEY;

exports.ISecretManager = ISecretManager;

exports.getInstance = getInstance;
