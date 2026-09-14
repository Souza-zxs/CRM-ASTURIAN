resource "kubernetes_service" "zyracrm_db" {
  metadata {
    name      = "${var.zyracrm_app_name}-db"
    namespace = kubernetes_namespace.zyracrm.metadata.0.name
  }
  spec {
    selector = {
      app = "${var.zyracrm_app_name}-db"
    }
    session_affinity = "ClientIP"
    port {
      port        = 5432
      target_port = 5432
    }

    type = "ClusterIP"
  }
}
