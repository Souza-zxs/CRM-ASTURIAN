######################
# Required Variables #
######################
variable "zyracrm_pgdb_admin_password" {
  type        = string
  description = "ZyraCRM password for postgres database."
  sensitive   = true
}

variable "zyracrm_app_hostname" {
  type        = string
  description = "The protocol, DNS fully qualified hostname, and port used to access ZyraCRM in your environment. Ex: https://crm.example.com:443"
}

######################
# Optional Variables #
######################
variable "zyracrm_app_name" {
  type        = string
  default     = "zyracrm"
  description = "A friendly name prefix to use for every component deployed."
}

variable "zyracrm_server_image" {
  type        = string
  default     = "zyracrm/zyra:latest"
  description = "ZyraCRM server image for the server deployment. This defaults to latest. This value is also used for the workers image."
}

variable "zyracrm_db_image" {
  type        = string
  default     = "zyracrm/zyra-postgres-spilo:latest"
  description = "ZyraCRM image for database deployment. This defaults to latest."
}

variable "zyracrm_server_replicas" {
  type        = number
  default     = 1
  description = "Number of replicas for the ZyraCRM server deployment. This defaults to 1."
}

variable "zyracrm_worker_replicas" {
  type        = number
  default     = 1
  description = "Number of replicas for the ZyraCRM worker deployment. This defaults to 1."
}

variable "zyracrm_db_replicas" {
  type        = number
  default     = 1
  description = "Number of replicas for the ZyraCRM database deployment. This defaults to 1."
}

variable "zyracrm_server_data_mount_path" {
  type        = string
  default     = "/app/packages/zyra-server/.local-storage"
  description = "ZyraCRM mount path for servers application data. Defaults to '/app/packages/zyra-server/.local-storage'."
}

variable "zyracrm_db_pv_path" {
  type        = string
  default     = ""
  description = "Local path to use to store the physical volume if using local storage on nodes."
}

variable "zyracrm_server_pv_path" {
  type        = string
  default     = ""
  description = "Local path to use to store the physical volume if using local storage on nodes."
}

variable "zyracrm_db_pv_capacity" {
  type        = string
  default     = "10Gi"
  description = "Storage capacity provisioned for database persistent volume."
}

variable "zyracrm_db_pvc_requests" {
  type        = string
  default     = "10Gi"
  description = "Storage capacity reservation for database persistent volume claim."
}

variable "zyracrm_server_pv_capacity" {
  type        = string
  default     = "10Gi"
  description = "Storage capacity provisioned for server persistent volume."
}

variable "zyracrm_server_pvc_requests" {
  type        = string
  default     = "10Gi"
  description = "Storage capacity reservation for server persistent volume claim."
}

variable "zyracrm_namespace" {
  type        = string
  default     = "zyracrm"
  description = "Namespace for all ZyraCRM resources"
}

variable "zyracrm_redis_replicas" {
  type        = number
  default     = 1
  description = "Number of replicas for the ZyraCRM Redis deployment. This defaults to 1."
}

variable "zyracrm_redis_image" {
  type        = string
  default     = "redis/redis-stack-server:latest"
  description = "ZyraCRM image for Redis deployment. This defaults to latest."
}

variable "zyracrm_docker_data_mount_path" {
  type        = string
  default     = "/app/docker-data"
  description = "ZyraCRM mount path for servers application data. Defaults to '/app/docker-data'."
}

variable "zyracrm_docker_data_pv_path" {
  type        = string
  default     = ""
  description = "Local path to use to store the physical volume if using local storage on nodes."
}

variable "zyracrm_docker_data_pv_capacity" {
  type        = string
  default     = "100Mi"
  description = "Storage capacity provisioned for server persistent volume."
}

variable "zyracrm_docker_data_pvc_requests" {
  type        = string
  default     = "100Mi"
  description = "Storage capacity reservation for server persistent volume claim."
}
