variable "project_id" {
  description = "The ID of the Google Cloud project where Firestore will be created."
  type        = string
}

variable "location_id" {
  description = "The location where Firestore will be created."
  type        = string
  default     = "asia-northeast1"
}

variable "firestore_database_id" {
  description = "The ID of the Firestore database."
  type        = string
}

variable "firestore_mode" {
  description = "The mode of the Firestore database (native or datastore)."
  type        = string
  default     = "native"
}