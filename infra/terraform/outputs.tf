output "firestore_database_id" {
  value       = google_firestore_database.firestore.id
  description = "FirestoreデータベースのID"
}

output "firestore_database_name" {
  value       = google_firestore_database.firestore.name
  description = "Firestoreデータベースの名前"
}

output "firestore_database_location" {
  value       = google_firestore_database.firestore.location_id
  description = "FirestoreデータベースのロケーションID"
}

output "service_account_email" {
  value       = google_service_account.app.email
  description = "アプリ用サービスアカウントのメールアドレス"
}