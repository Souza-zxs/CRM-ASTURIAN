resource "kubernetes_persistent_volume" "server" {
  metadata {
    name = "${var.zyracrm_app_name}-server-pv"
  }
  spec {
    storage_class_name = "default"
    capacity = {
      storage = var.zyracrm_server_pv_capacity
    }
    access_modes = ["ReadWriteOnce"]
    # refer to Terraform Docs for your specific implementation requirements
    # https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs/resources/persistent_volume
    persistent_volume_source {
      local {
        path = var.zyracrm_server_pv_path
      }
    }
  }
}
