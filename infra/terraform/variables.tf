variable "project_id" {
  description = "The ID of the Google Cloud project where resources will be created."
  type        = string
}

variable "location_id" {
  description = "The location where resources will be created."
  type        = string
  default     = "asia-northeast1"
}

variable "image_url" {
  description = "Cloud RunにデプロイするDockerイメージのURL"
  type        = string
}

variable "fast_image_url" {
  description = "Fast API用のDockerイメージURL"
  type        = string
}