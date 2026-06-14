import { Component } from './component.types'

export interface ScanResult {
  component_name: string
  confidence: number
  bbox?: number[]
  info?: Component
}

export interface Scan {
  scan_id: string
  image_url: string
  results: ScanResult[]
  created_at: string
}