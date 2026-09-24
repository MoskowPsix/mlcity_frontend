export interface MototrackRiderRun {
  id: number
  place_id: number
  place_name: string | null
  device_id: string
  rfid_tag_number: string | null
  started_at: string
  finished_at: string | null
  duration_ms: number | null
  status: 'active' | 'finished'
}

export interface MototrackRiderRunPlaceGroup {
  place_id: number
  place_name: string | null
  runs: MototrackRiderRun[]
}

export interface MototrackSessionLap {
  type: 'start' | 'lap' | 'lap_active'
  label: string
  lap_number: number | null
  time: string
  at: string | null
  duration_ms: number | null
  run_id: number | null
  status: 'active' | 'finished' | null
}

export interface MototrackRiderRunSession {
  key: string
  date: string
  date_label: string
  place_id: number
  place_name: string
  title: string
  started_at: string | null
  laps_count: number
  laps: MototrackSessionLap[]
}

export interface MototrackRiderRunsResponse {
  status: string
  sessions?: MototrackRiderRunSession[]
  places: MototrackRiderRunPlaceGroup[]
  runs: MototrackRiderRun[]
}
