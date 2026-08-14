const apiBase = import.meta.env.VITE_API_BASE ?? ''

function formatApiDetail(detail: unknown, fallback: string): string {
  if (detail == null || detail === '') return fallback
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const parts = detail.map((item) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object') {
        const row = item as { msg?: string; loc?: unknown[]; message?: string }
        const field = Array.isArray(row.loc)
          ? row.loc.filter((p) => p !== 'body' && p !== 'query').join('.')
          : ''
        const msg = row.msg || row.message || JSON.stringify(item)
        return field ? `${field}: ${msg}` : msg
      }
      return String(item)
    })
    return parts.filter(Boolean).join(' · ') || fallback
  }
  if (typeof detail === 'object') {
    const row = detail as { message?: string; msg?: string }
    if (row.message || row.msg) return String(row.message || row.msg)
    try {
      return JSON.stringify(detail)
    } catch {
      return fallback
    }
  }
  return String(detail)
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const fallback = `Request failed (${res.status})`
    const raw = await res.text()
    let message = raw || fallback
    try {
      const parsed = JSON.parse(raw) as { detail?: unknown }
      message = formatApiDetail(parsed.detail, fallback)
    } catch {
      /* keep text body */
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export type Stats = {
  appointments: number
  open_appointments: number
  stitch_orders: number
  open_orders: number
  ready_orders: number
}

export type Appointment = {
  id: number
  customer_name: string
  customer_phone: string
  service_type: string
  preferred_date: string
  preferred_time: string
  notes: string
  status: string
  created_at: string
  updated_at: string
}

export type StitchOrder = {
  id: number
  customer_name: string
  customer_phone: string
  garment_type: string
  fabric_notes: string
  occasion: string
  preferred_date: string
  notes: string
  status: string
  created_at: string
  updated_at: string
}

export type VisitDay = {
  day: string
  hits: number
  uniques: number
}

export type VisitGeo = {
  country: string
  city: string | null
  hits: number
}

export type VisitAnalytics = {
  timezone: string
  days: number
  today: VisitDay
  totals: { hits: number; uniques: number }
  daily: VisitDay[]
  geo: VisitGeo[]
  privacy: string
}

export const fetchStats = () => api<Stats>('/v1/stats')

export const fetchAppointments = (token?: string, limit = 50) =>
  api<Appointment[]>(`/v1/appointments?limit=${limit}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

export const createAppointment = (body: Record<string, unknown>) =>
  api<Appointment>('/v1/appointments', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const updateAppointment = (token: string, id: number, body: Record<string, unknown>) =>
  api<Appointment>(`/v1/appointments/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })

export const deleteAppointment = (token: string, id: number) =>
  api<{ status: string }>(`/v1/appointments/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

export const fetchStitchOrders = (token?: string, limit = 50) =>
  api<StitchOrder[]>(`/v1/stitch-orders?limit=${limit}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

export const createStitchOrder = (body: Record<string, unknown>) =>
  api<StitchOrder>('/v1/stitch-orders', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const updateStitchOrder = (token: string, id: number, body: Record<string, unknown>) =>
  api<StitchOrder>(`/v1/stitch-orders/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })

export const deleteStitchOrder = (token: string, id: number) =>
  api<{ status: string }>(`/v1/stitch-orders/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

export const adminLogin = (pin: string) =>
  api<{ access_token: string }>('/v1/admin/login', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  })

export const adminLogout = (token: string) =>
  api<{ status: string }>('/v1/admin/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })

export function trackPageView(path: string) {
  const payload = JSON.stringify({ path })
  try {
    void fetch(`${apiBase}/v1/analytics/hit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
      credentials: 'omit',
    }).catch(() => {
      /* ignore */
    })
  } catch {
    /* ignore */
  }
}

export const fetchVisitAnalytics = (token: string, days = 14) =>
  api<VisitAnalytics>(`/v1/admin/analytics?days=${days}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

export type CollectionPiece = {
  id: number
  title: string
  title_te: string
  body: string
  body_te: string
  category: string
  kind: string
  published: string
  sort_order: number
  image_url: string
  created_at: string
  updated_at: string
}

export const fetchCollections = (token?: string, limit = 48) =>
  api<CollectionPiece[]>(`/v1/collections?limit=${limit}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

export async function createCollectionPiece(
  token: string,
  form: FormData,
): Promise<CollectionPiece> {
  const res = await fetch(`${apiBase}/v1/collections`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  if (!res.ok) {
    const fallback = `Request failed (${res.status})`
    const raw = await res.text()
    let message = raw || fallback
    try {
      const parsed = JSON.parse(raw) as { detail?: unknown }
      message = formatApiDetail(parsed.detail, fallback)
    } catch {
      /* keep text */
    }
    throw new Error(message)
  }
  return res.json() as Promise<CollectionPiece>
}

export const updateCollectionPiece = (
  token: string,
  id: number,
  body: Record<string, unknown>,
) =>
  api<CollectionPiece>(`/v1/collections/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })

export const deleteCollectionPiece = (token: string, id: number) =>
  api<{ status: string }>(`/v1/collections/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
