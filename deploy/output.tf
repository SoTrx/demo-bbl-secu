output "rg_name" {
  value       = azurerm_resource_group.rg.name
  description = "Name of the Resource group the resources were created in"
}

# output "app_id" {
#   value       = azuread_application.app-registration.object_id
#   description = "Auth app id"
# }

# output "app_password" {
#   sensitive   = true
#   value       = azuread_application_password.app-password.value
#   description = "Auth app password"
# }

