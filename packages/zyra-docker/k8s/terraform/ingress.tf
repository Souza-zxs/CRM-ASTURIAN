resource "kubernetes_ingress" "zyracrm" {
  wait_for_load_balancer = true
  metadata {
    name      = "${var.zyracrm_app_name}-ingress"
    namespace = kubernetes_namespace.zyracrm.metadata.0.name
    annotations = {
      "kubernetes.io/ingress.class"                       = "nginx"
      "nginx.ingress.kubernetes.io/configuration-snippet" = <<EOF
      more_set_headers "X-Forwarded-For $http_x_forwarded_for";
      EOF
      "nginx.ingress.kubernetes.io/force-ssl-redirect"    = "false"
      "nginx.ingress.kubernetes.io/backend-protocol"      = "HTTP"
    }
  }
  spec {
    ingress_class_name = "nginx"
    rule {
      host = var.zyracrm_app_hostname
      http {
        path {
          path = "/*"
          backend {
            service_name = kubernetes_service.zyracrm_server.metadata.0.name
            service_port = kubernetes_service.zyracrm_server.spec.0.port.0.port
          }
        }
      }
    }
  }
}
