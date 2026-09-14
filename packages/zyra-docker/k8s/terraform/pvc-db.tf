resource "kubernetes_persistent_volume_claim" "db" {
  metadata {
    name      = "${var.zyracrm_app_name}-db-pvc"
    namespace = kubernetes_namespace.zyracrm.metadata.0.name
  }
  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = var.zyracrm_db_pvc_requests
      }
    }
    volume_name = kubernetes_persistent_volume.db.metadata.0.name
  }
}
