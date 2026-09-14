resource "kubernetes_namespace" "zyracrm" {
  metadata {
    annotations = {
      name = var.zyracrm_namespace
    }

    name = var.zyracrm_namespace
  }
}
