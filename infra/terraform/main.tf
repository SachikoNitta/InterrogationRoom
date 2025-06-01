resource "google_firestore_database" "firestore" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.location_id
  type        = "FIRESTORE_NATIVE"
}

# 必要なAPIの有効化
resource "google_project_service" "run" {
  project = var.project_id
  service = "run.googleapis.com"
}
resource "google_project_service" "firestore" {
  project = var.project_id
  service = "firestore.googleapis.com"
}
resource "google_project_service" "vertex" {
  project = var.project_id
  service = "aiplatform.googleapis.com"
}
resource "google_project_service" "iam" {
  project = var.project_id
  service = "iam.googleapis.com"
}
resource "google_project_service" "firebase" {
  project = var.project_id
  service = "firebase.googleapis.com"
}

# サービスアカウント作成
resource "google_service_account" "app" {
  account_id   = "interrogation-app-sa"
  display_name = "Interrogation Room App Service Account"
}

# サービスアカウントに必要なロール付与
resource "google_project_iam_member" "app_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.app.email}"
}
resource "google_project_iam_member" "app_run" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.app.email}"
}
resource "google_project_iam_member" "app_vertex" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.app.email}"
}

# Cloud Run サービス雛形（イメージは後で指定）
resource "google_cloud_run_service" "app" {
  name     = "interrogation-app"
  location = var.location_id
  template {
    spec {
      containers {
        image = var.image_url
      }
      service_account_name = google_service_account.app.email
    }
  }
  traffic {
    percent         = 100
    latest_revision = true
  }
  depends_on = [
    google_project_service.run,
    google_project_service.firestore,
    google_project_service.vertex,
    google_project_service.iam,
    google_project_service.firebase
  ]
}

resource "google_cloud_run_service_iam_member" "public" {
  location = google_cloud_run_service.app.location
  project  = var.project_id
  service  = google_cloud_run_service.app.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}