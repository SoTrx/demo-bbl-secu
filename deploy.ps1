
#Variables
$RG_NAME = "demo-bbl-secu-dep-rg"
$SWA_NAME = "demo-bbl-secu-dep-auth-swa"
$KV_NAME = "demo-bbl-secu-dep-kv"
$FA_NAME = "demo-bbl-secu-dep-functionapp"

function deployTerraform(){
    cd deploy 
    terraform apply -auto-approve
    cd -
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

#logToStdout [ColorMap]::Debug "Storing admin pseudo-secret in keyvault"
#az keyvault secret set --name "adminOnly" --vault-name $KV_NAME --value "SECRET STRING"
#logToStdout [ColorMap]::Debug "Secret stored"


# Setting up Istio and cluster DNS link
logToStdout [ColorMap]::Debug "Fetching deployments secrets"
$swaApiKey = az staticwebapp secrets list -g $RG_NAME -n $SWA_NAME --query properties.apiKey
$functionAppApiKey = az functionapp deployment list-publishing-profiles -g $RG_NAME -n $FA_NAME --xml
$sanitizedSwaApiKey = $swaApiKey -Replace '"',''
logToStdout [ColorMap]::Debug "Deployments secrets retrieved"
logToStdout [ColorMap]::Info "IMPORTANT : Please add the following secrets to your repository. You can then push your fork to github to deploy"
logToStdout [ColorMap]::Info "AZURE_STATIC_WEB_APPS_API_TOKEN : $sanitizedSwaApiKey"
logToStdout [ColorMap]::Info "AZURE_FUNCTIONAPP_PUBLISH_PROFILE : $functionAppApiKey"