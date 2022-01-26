data "azurerm_client_config" "current" {}

provider "azurerm" {
  features {}
}

# Ressource Group
resource "azurerm_resource_group" "rg" {
  name     = "${var.global_prefix}-rg"
  location = var.location
}

# Frontend : Auth'ed version
resource "azurerm_static_site" "static-webapp-auth" {
  name                = "${var.global_prefix}-auth-swa"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku_tier            = "Standard"
  sku_size            = "Standard"
}

# Functionapp and associated storage account and plan
resource "azurerm_storage_account" "storageacc" {
  name                     = join("", split("-", "${var.global_prefix}-sa"))
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_app_service_plan" "functionappplan" {
  name                = "${var.global_prefix}-functionapp-plan"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  kind                = "FunctionApp"

  sku {
    tier = "Dynamic"
    size = "Y1"
  }
}

resource "azurerm_function_app" "functionapp" {
  name                       = "${var.global_prefix}-functionapp"
  location                   = azurerm_resource_group.rg.location
  resource_group_name        = azurerm_resource_group.rg.name
  app_service_plan_id        = azurerm_app_service_plan.functionappplan.id
  storage_account_name       = azurerm_storage_account.storageacc.name
  storage_account_access_key = azurerm_storage_account.storageacc.primary_access_key
  identity {
    type = "SystemAssigned"
  }
}

# Keyvault 
resource "azurerm_key_vault" "kv" {
  name                        = "${var.global_prefix}-kv"
  location                    = azurerm_resource_group.rg.location
  resource_group_name         = azurerm_resource_group.rg.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false
  sku_name                    = "standard"
}

resource "azurerm_key_vault_access_policy" "accesskvfromfunction" {
  key_vault_id = azurerm_key_vault.kv.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_function_app.functionapp.identity[0].principal_id
  secret_permissions = [
    "Get",
  ]
}

