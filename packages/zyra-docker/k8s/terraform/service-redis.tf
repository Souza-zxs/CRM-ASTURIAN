resource "kubernetes_service" "zyracrm_redis" {
  metadata {
    name      = "${var.zyracrm_app_name}-redis"
    namespace = kubernetes_namespace.zyracrm.metadata.0.name
  }
  spec {
    selector = {
      app = "${var.zyracrm_app_name}-redis"
    }
    session_affinity = "ClientIP"
    port {
      port        = 6379
      target_port = 6379
    }

    type = "ClusterIP"
  }
}
