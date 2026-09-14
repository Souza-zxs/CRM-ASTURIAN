resource "kubernetes_service" "zyracrm_server" {
  metadata {
    name      = "${var.zyracrm_app_name}-server"
    namespace = kubernetes_namespace.zyracrm.metadata.0.name
  }
  spec {
    selector = {
      app = "${var.zyracrm_app_name}-server"
    }
    session_affinity = "ClientIP"
    port {
      name        = "http-tcp"
      port        = 3000
      target_port = 3000
    }

    type = "ClusterIP"
  }
}
