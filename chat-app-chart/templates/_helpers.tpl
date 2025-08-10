{{/* vim: set filetype=gotexttmpl: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "chat-app-chart.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "chat-app-chart.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}s
{{- end -}}
{{- end -}}

{{/*
Create chart labels.
*/}}
{{- define "chat-app-chart.labels" -}}
helm.sh/chart: {{ include "chat-app-chart.name" . }}
app.kubernetes.io/name: {{ include "chat-app-chart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}