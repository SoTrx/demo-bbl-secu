

function deployTerraform(){
    cd deploy 
    terraform apply -auto-approve
    cd -
}

function getTerraformOutput($key) {
    cd deploy 
    $value = terraform output $key
    cd -
    # Removing first and last "
    return $value.Substring(1, ($value.length - 2))
}

enum ColorMap {
    Debug
    Info
    Success
    Warning
    Error
}
function logToStdout($type, $text) {
    $color = "White"
    switch ($type) {
        [ColorMap]::Debug { $color = "Cyan" }
        [ColorMap]::Info { $color = "Blue" }
        [ColorMap]::Success { $color = "Green" }
        [ColorMap]::Warning { $color = "DarkYellow" }
        [ColorMap]::Error { $color = "Red" }
    }
    # PowerShell enums are treated as plain string when passed as a function argument
    Write-Host "[$( ($type -Split '::')[1] )] $text" -ForegroundColor $color
}

# Infra
logToStdout [ColorMap]::Debug "Creating infrastructure"
#deployTerraform
logToStdout [ColorMap]::Debug "Infrastructure created"

#Variables
$PREFIX = (getTerraformOutput "rg_name") -Replace '-rg',''
$RG_NAME = "$PREFIX-rg"
$SWA_NAME = "$PREFIX-auth-swa"
$KV_NAME = "$PREFIX-kv"
$AR_NAME = "$PREFIX-ar"
$FA_NAME = "$PREFIX-functionapp"
$SUB_ID = az account show --query id -o tsv

# Linking FA to SWA
logToStdout [ColorMap]::Debug "Linking FunctionApp to staticwebapp"
az staticwebapp functions link -n $SWA_NAME -g $RG_NAME --function-resource-id "/subscriptions/$SUB_ID/resourceGroups/$RG_NAME/providers/Microsoft.Web/sites/$FA_NAME" --force 
logToStdout [ColorMap]::Debug "Linking completed"

# Adding app registrations setting to SWA (done during the demo)
# logToStdout [ColorMap]::Debug "Configuring Static Web app to use the auth provider"
# $appId = getTerraformOutput "app_id" 
# $appPass = getTerraformOutput "app_password" 
# az staticwebapp appsettings set --name $SWA_NAME --setting-names AAD_CLIENT_SECRET=$appPass AAD_CLIENT_ID=$appId
# logToStdout [ColorMap]::Debug "Configuring Static Web configured"


#logToStdout [ColorMap]::Debug "Storing admin pseudo-secret in keyvault"
#az keyvault secret set --name "adminOnly" --vault-name $KV_NAME --value "SECRET STRING"
#logToStdout [ColorMap]::Debug "Secret stored"


# Fetching deployment strings
logToStdout [ColorMap]::Debug "Fetching deployments secrets"
$swaApiKey = az staticwebapp secrets list -g $RG_NAME -n $SWA_NAME --query properties.apiKey -o tsv
$functionAppApiKey = az functionapp deployment list-publishing-profiles -g $RG_NAME -n $FA_NAME --xml
logToStdout [ColorMap]::Debug "Deployments secrets retrieved"
logToStdout [ColorMap]::Info "IMPORTANT : Please add the following secrets to your repository. You can then push your fork to github to deploy"
logToStdout [ColorMap]::Info "AZURE_STATIC_WEB_APPS_API_TOKEN : $swaApiKey"
logToStdout [ColorMap]::Info "AZURE_FUNCTIONAPP_PUBLISH_PROFILE : $functionAppApiKey"