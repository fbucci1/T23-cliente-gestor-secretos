function VaultSecretManager(){

    this.initialize = function (smConfig) {
        if (!smConfig.T23_SM_PROVIDER){
            throw new Error("Unable to initialize VaultSecretManager. T23_SM_PROVIDER property is missing.");
        }
        if (!smConfig.T23_SM_KEY ){
            throw new Error("Unable to initialize VaultSecretManager. T23_SM_KEY property is missing.");
        }
        if (!smConfig.T23_SM_VAULT_ADDR){
            throw new Error("Unable to initialize VaultSecretManager. T23_SM_VAULT_ADDR property is missing.");
        }
        if (!smConfig.T23_SM_VAULT_USER){
            throw new Error("Unable to initialize VaultSecretManager. T23_SM_VAULT_USER property is missing.");
        }
        if (!smConfig.T23_SM_VAULT_PASS){
            throw new Error("Unable to initialize VaultSecretManager. T23_SM_VAULT_PASS property is missing.");
        }
        this._smConfig=smConfig;
    }

    this._login = function () {
        var request = require('sync-request');
        // Logs in and retrieves the JWT
        var apiUrl=this._smConfig.T23_SM_VAULT_ADDR+"/v1/auth/userpass/login/"+this._smConfig.T23_SM_VAULT_USER;
        var res1 = request('POST', apiUrl, {
            body: JSON.stringify({
                'password': this._smConfig.T23_SM_VAULT_PASS
            })
        });
        var jwt=null;
        var auxjson=null;
        try {
            auxjson=JSON.parse(res1.body);
        } catch (e) {
            throw new Error("Received response is not a valid JSON object.");
        }
        if (auxjson && auxjson.auth && auxjson.auth.client_token) {
            jwt=auxjson.auth.client_token;
        } else {
            //console.error(("Received response is a valid JSON object but it does not contain .auth.client_token attribute. Received:" + JSON.stringify(auxjson)));
            throw new Error("Received response is a valid JSON object but it does not contain .auth.client_token attribute.");
        }
        //
        this._jwt=jwt;
        //
        return;
    }
    
    this.getSecrets = function () {
        //
        if (!this._jwt) {
            this._login();
        }
        //
        var request = require('sync-request');
        //
        var data=null;
        var apiUrl=this._smConfig.T23_SM_VAULT_ADDR+"/v1/secret/data/"+this._smConfig.T23_SM_KEY;
        try {
            var res1 = request('GET', apiUrl, {
                headers: {
                    'X-Vault-Token': this._jwt
                }
            });
            var auxjson=null;
            try {
                auxjson=JSON.parse(res1.body);
            } catch (e) {
                throw new Error("Received response is not a valid JSON object.");
            }
            if (auxjson && auxjson.data && auxjson.data.data) {
                data=auxjson.data.data;
            } else {
                throw new Error("Received response is a valid JSON object but it does not contain .data.data attribute. Ensure '+secretKey+' is a KV.");
            }
        } catch (e) {
            console.error(e);
            throw new Error("Unexpected error getting secrets from "+apiUrl);
        }
        return data;
    }
    
}

exports.getInstance = function (smConfig) {
    var instance=new VaultSecretManager();
    instance.initialize(smConfig);
    return instance;
}