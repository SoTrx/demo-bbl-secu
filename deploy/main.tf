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
  kind                = "Linux"
  reserved            = true
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
  os_type                    = "linux"
  version                    = "~3"
  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    FUNCTIONS_WORKER_RUNTIME = "node"
    SECRET_NAME = "adminOnly"
    VAULT_NAME = "${azurerm_key_vault.kv.name}"
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

data "azuread_client_config" "current" {}

resource "azuread_application" "app-registration" {
  display_name     = "${var.global_prefix}-ar"
  owners           = [data.azuread_client_config.current.object_id]
  sign_in_audience = "AzureADMyOrg"

 api {
    mapped_claims_enabled          = true
    requested_access_token_version = 2

    oauth2_permission_scope {
      admin_consent_description  = "Allow the application to access example on behalf of the signed-in user."
      admin_consent_display_name = "Access example"
      enabled                    = true
      id                         = "96183846-204b-4b43-82e1-5d2222eb4b9b"
      type                       = "User"
      user_consent_description   = "Allow the application to access example on your behalf."
      user_consent_display_name  = "Access example"
      value                      = "user_impersonation"
    }

    oauth2_permission_scope {
      admin_consent_description  = "Administer the example application"
      admin_consent_display_name = "Administer"
      enabled                    = true
      id                         = "be98fa3e-ab5b-4b11-83d9-04ba2b7946bc"
      type                       = "Admin"
      value                      = "administer"
    }
  }
  

  app_role {
    allowed_member_types = ["User", "Application"]
    description          = "Admins can manage roles and perform all task actions"
    display_name         = "Admin"
    enabled              = true
    id                   = "1b19509b-32b1-4e9f-b71d-4992aa991967"
    value                = "admin"
  }

  app_role {
    allowed_member_types = ["User"]
    description          = "ReadOnly roles have limited query access"
    display_name         = "ReadOnly"
    enabled              = true
    id                   = "497406e4-012a-4267-bf18-45a1cb148a01"
    value                = "user"
  }

  feature_tags {
    enterprise = true
    gallery = true
  }

  optional_claims {
    access_token {
      name = "myclaim"
    }

    access_token {
      name = "otherclaim"
    }

    id_token {
      name                  = "userclaim"
      source                = "user"
      essential             = true
      additional_properties = ["emit_as_roles"]
    }

    saml2_token {
      name = "samlexample"
    }
  }

  required_resource_access {
    resource_app_id = "00000003-0000-0000-c000-000000000000" # Microsoft Graph

    resource_access {
      id   = "df021288-bdef-4463-88db-98f22de89214" # User.Read.All
      type = "Role"
    }

    resource_access {
      id   = "b4e74841-8e56-480b-be8b-910348b18b4c" # User.ReadWrite
      type = "Scope"
    }
  }

  web {
    redirect_uris = ["https://${azurerm_static_site.static-webapp-auth.default_host_name}/.auth/login/aad/callback"]

    implicit_grant {
      access_token_issuance_enabled = true
      id_token_issuance_enabled     = true
    }
  }
}

resource "azuread_application_password" "app-password" {
  application_object_id = azuread_application.app-registration.object_id
}

resource "azuread_service_principal" "dra_sp" {
  application_id               = azuread_application.app-registration.application_id
  app_role_assignment_required = false
  owners                       = [data.azuread_client_config.current.object_id, "6e12bbfc-8e89-4ad8-96f9-bf42c4f906e6"]

  feature_tags {
    enterprise = true
    gallery    = true
  }
}

#resource "azuread_service_principal_password" "dra_pw" {
#  service_principal_id = azuread_service_principal.dra_sp.object_id
#}

