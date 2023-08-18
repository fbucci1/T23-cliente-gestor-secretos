var SecretManager = require('./secret-manager');

const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager"); 

const T23_SM_AWS_REGION="T23_SM_AWS_REGION";
const T23_SM_AWS_ACCESS_KEY_ID="T23_SM_AWS_ACCESS_KEY_ID";
const T23_SM_AWS_SECRET_ACCESS_KEY="T23_SM_AWS_SECRET_ACCESS_KEY";

function AWSSecretManager(){

    this.initialize = function (smConfig) {
        if (!smConfig[SecretManager.T23_SM_PROVIDER]){
            throw new Error("Unable to initialize VaultSecretManager. T23_SM_PROVIDER property is missing.");
        }
        if (!smConfig[SecretManager.T23_SM_KEY] ){
            throw new Error("Unable to initialize VaultSecretManager. T23_SM_KEY property is missing.");
        }
        if (!smConfig[T23_SM_AWS_REGION]){
            throw new Error("Unable to initialize VaultSecretManager. T23_SM_AWS_REGION property is missing.");
        }
        if (!smConfig[T23_SM_AWS_ACCESS_KEY_ID]){
            throw new Error("Unable to initialize VaultSecretManager. T23_SM_AWS_ACCESS_KEY_ID property is missing.");
        }
        if (!smConfig[T23_SM_AWS_SECRET_ACCESS_KEY]){
            throw new Error("Unable to initialize VaultSecretManager. T23_SM_AWS_SECRET_ACCESS_KEY property is missing.");
        }
        this._smConfig=smConfig;
    }

    this.getSecrets = function () {
        try{
            var config = { 
                region: this._smConfig[T23_SM_AWS_REGION], 
                credentials: { 
                    accessKeyId: this._smConfig[T23_SM_AWS_ACCESS_KEY_ID], 
                    secretAccessKey: this._smConfig[T23_SM_AWS_SECRET_ACCESS_KEY] 
                } 
            };
            const client = new SecretsManagerClient(config);
            const input = { SecretId: this._smConfig[SecretManager.T23_SM_KEY] };
            const command = new GetSecretValueCommand(input);
            const response = client.send(command);
            
            function runSynchronized(promise){
                var auxResponse=null;
                const auxSincronizacion = () => promise
                    .then(ok => {auxResponse=ok;})
                    .catch(err => {
                        console.error('Error retrieving promised response', err);
                        throw new Error("Error retrieving promised response");
                    })
                const sp = require('synchronized-promise')
                sp(auxSincronizacion)();
                return auxResponse;
            }
            var auxjson = runSynchronized(response);
            //
            var data=null;
            if (auxjson && auxjson.SecretString) {
                data = auxjson.SecretString;
            } else {
                //console.error("Received response does not contain .SecretString. Received:" + JSON.stringify(auxjson));
                throw new Error("Received response does not contain .SecretString");
            }
            //
            try {
                data=JSON.parse(data);
            } catch (e) {
                //console.error("Received .SecretString is not a valid JSON. Received:" + data);
                throw new Error("Received .SecretString is not a valid JSON");
            }
        } catch (e) {
            console.error(e);
            throw new Error("Unexpected error getting secrets from AWS Secret Manager");
        }
        return data;
    }
    
}

AWSSecretManager.prototype=SecretManager.ISecretManager.prototype;
AWSSecretManager.prototype.constructor=SecretManager.ISecretManager.prototype.constructor;

exports.getInstance = function (smConfig) {
    var instance=new AWSSecretManager();
    instance.initialize(smConfig);
    return instance;
}

exports.T23_SM_AWS_REGION=T23_SM_AWS_REGION;
exports.T23_SM_AWS_ACCESS_KEY_ID=T23_SM_AWS_ACCESS_KEY_ID;
exports.T23_SM_AWS_SECRET_ACCESS_KEY=T23_SM_AWS_SECRET_ACCESS_KEY;
