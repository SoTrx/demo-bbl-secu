variable "global_prefix" {
  default     = "demo-bbl-secu-dep2"
  description = "The name of the container group"
}

variable "location" {
  default     = "West Europe"
  description = "Az region to put resources in"
}

variable "user_object_id" {
  default     = "6e12bbfc-8e89-4ad8-96f9-bf42c4f906e6"
  description = "Real user object Id, needed to interact with created resources in the demo"
}
