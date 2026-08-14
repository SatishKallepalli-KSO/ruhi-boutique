import { useDeferredValue, useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  fetchVisitAnalytics,
  fetchCollections,
  createCollectionPiece,
  updateCollectionPiece,
  deleteCollectionPiece,
  type Appointment,
  type CollectionPiece,
  type StitchOrder,
  type VisitAnalytics,
} from '../api'
import type { DictKey } from '../content'
import { matchesQuery, paginateItems } from '../lib/format'

export type AdminTab = 'snapshot' | 'appointments' | 'orders' | 'collections' | 'visits'

type Props = {
  tx: (key: DictKey) => string
  adminToken: string
  adminPin: string
  setAdminPin: (value: string) => void
  busy: boolean
  appointments: Appointment[]
  orders: StitchOrder[]
  adminTab: AdminTab
  setAdminTab: (tab: AdminTab) => void
  onAdminLogin: (event: FormEvent) => void
  onUpdateAppointment: (id: number, body: Record<string, unknown>) => Promise<void>
  onDeleteAppointment: (id: number) => Promise<void>
  onUpdateOrder: (id: number, body: Record<string, unknown>) => Promise<void>
  onDeleteOrder: (id: number) => Promise<void>
  logoutAdmin: () => void
  refreshAdmin: (token: string) => Promise<void>
}

export function AdminPortal({
  tx,
  adminToken,
  adminPin,
  setAdminPin,
  busy,
  appointments,
  orders,
  adminTab,
  setAdminTab,
  onAdminLogin,
  onUpdateAppointment,
  onDeleteAppointment,
  onUpdateOrder,
  onDeleteOrder,
  logoutAdmin,
  refreshAdmin,
}: Props) {
  const [apptSearch, setApptSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [apptPage, setApptPage] = useState(1)
  const [orderPage, setOrderPage] = useState(1)
  const [editingApptId, setEditingApptId] = useState<number | null>(null)
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null)
  const [apptEdit, setApptEdit] = useState<Record<string, string>>({})
  const [orderEdit, setOrderEdit] = useState<Record<string, string>>({})
  const [visitStats, setVisitStats] = useState<VisitAnalytics | null>(null)
  const [visitError, setVisitError] = useState<string | null>(null)
  const [visitLoading, setVisitLoading] = useState(false)
  const [pieces, setPieces] = useState<CollectionPiece[]>([])
  const [pieceError, setPieceError] = useState<string | null>(null)
  const [pieceBusy, setPieceBusy] = useState(false)
  const [pieceForm, setPieceForm] = useState({
    title: '',
    title_te: '',
    body: '',
    body_te: '',
    category: 'saree',
    kind: 'design',
    published: 'yes',
  })
  const [pieceFile, setPieceFile] = useState<File | null>(null)

  const deferredApptSearch = useDeferredValue(apptSearch)
  const deferredOrderSearch = useDeferredValue(orderSearch)

  useEffect(() => {
    if (!adminToken || adminTab !== 'visits') return
    let cancelled = false
    setVisitLoading(true)
    setVisitError(null)
    void fetchVisitAnalytics(adminToken, 14)
      .then((data) => {
        if (!cancelled) setVisitStats(data)
      })
      .catch((err) => {
        if (!cancelled) setVisitError(err instanceof Error ? err.message : 'Could not load visits')
      })
      .finally(() => {
        if (!cancelled) setVisitLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [adminToken, adminTab])

  useEffect(() => {
    if (!adminToken || adminTab !== 'collections') return
    let cancelled = false
    setPieceError(null)
    void fetchCollections(adminToken, 100)
      .then((data) => {
        if (!cancelled) setPieces(data)
      })
      .catch((err) => {
        if (!cancelled) setPieceError(err instanceof Error ? err.message : 'Could not load collections')
      })
    return () => {
      cancelled = true
    }
  }, [adminToken, adminTab])

  const openApptCount = appointments.filter((a) => a.status === 'new' || a.status === 'confirmed').length
  const openOrderCount = orders.filter((o) =>
    ['new', 'measuring', 'stitching'].includes(o.status),
  ).length
  const readyCount = orders.filter((o) => o.status === 'ready').length

  const filteredAppts = useMemo(
    () =>
      appointments.filter((row) =>
        matchesQuery(
          [
            row.id,
            row.customer_name,
            row.customer_phone,
            row.service_type,
            row.preferred_date,
            row.preferred_time,
            row.status,
            row.notes,
          ],
          deferredApptSearch,
        ),
      ),
    [appointments, deferredApptSearch],
  )
  const filteredOrders = useMemo(
    () =>
      orders.filter((row) =>
        matchesQuery(
          [
            row.id,
            row.customer_name,
            row.customer_phone,
            row.garment_type,
            row.fabric_notes,
            row.occasion,
            row.preferred_date,
            row.status,
            row.notes,
          ],
          deferredOrderSearch,
        ),
      ),
    [orders, deferredOrderSearch],
  )

  const pagedAppts = useMemo(() => paginateItems(filteredAppts, apptPage), [filteredAppts, apptPage])
  const pagedOrders = useMemo(
    () => paginateItems(filteredOrders, orderPage),
    [filteredOrders, orderPage],
  )

  useEffect(() => setApptPage(1), [deferredApptSearch])
  useEffect(() => setOrderPage(1), [deferredOrderSearch])

  function listMeta(total: number, page: number, totalPages: number) {
    return tx('listShowing')
      .replace('{total}', String(total))
      .replace('{page}', String(page))
      .replace('{pages}', String(totalPages))
  }

  async function onUploadPiece(event: FormEvent) {
    event.preventDefault()
    if (!pieceFile || !pieceForm.title.trim()) return
    setPieceBusy(true)
    setPieceError(null)
    try {
      const form = new FormData()
      form.append('title', pieceForm.title.trim())
      form.append('title_te', pieceForm.title_te.trim())
      form.append('body', pieceForm.body.trim())
      form.append('body_te', pieceForm.body_te.trim())
      form.append('category', pieceForm.category)
      form.append('kind', pieceForm.kind)
      form.append('published', pieceForm.published)
      form.append('sort_order', '0')
      form.append('image', pieceFile)
      const created = await createCollectionPiece(adminToken, form)
      setPieces((prev) => [created, ...prev])
      setPieceForm({
        title: '',
        title_te: '',
        body: '',
        body_te: '',
        category: 'saree',
        kind: 'design',
        published: 'yes',
      })
      setPieceFile(null)
    } catch (err) {
      setPieceError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setPieceBusy(false)
    }
  }

  async function togglePublished(row: CollectionPiece) {
    const next = row.published === 'yes' ? 'no' : 'yes'
    try {
      const updated = await updateCollectionPiece(adminToken, row.id, { published: next })
      setPieces((prev) => prev.map((p) => (p.id === row.id ? updated : p)))
    } catch (err) {
      setPieceError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function removePiece(id: number) {
    if (!window.confirm(tx('collectionsDeleteConfirm'))) return
    try {
      await deleteCollectionPiece(adminToken, id)
      setPieces((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setPieceError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  function renderListControls(opts: {
    value: string
    onChange: (value: string) => void
    placeholder: string
    page: number
    totalPages: number
    total: number
    onPage: (page: number) => void
  }) {
    return (
      <div className="list-controls">
        <label className="list-search">
          <span className="sr-only">{tx('searchLabel')}</span>
          <input
            type="search"
            value={opts.value}
            placeholder={opts.placeholder}
            onChange={(e) => opts.onChange(e.target.value)}
          />
        </label>
        <div className="list-pager">
          <span>{listMeta(opts.total, opts.page, opts.totalPages)}</span>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={opts.page <= 1}
            onClick={() => opts.onPage(opts.page - 1)}
          >
            {tx('prevPage')}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={opts.page >= opts.totalPages}
            onClick={() => opts.onPage(opts.page + 1)}
          >
            {tx('nextPage')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <section className="portal admin-portal">
      <div className="section-head">
        <h2>{tx('adminTitle')}</h2>
        <p>{tx('adminIntro')}</p>
        <p className="admin-staff-note">{tx('adminStaffNote')}</p>
      </div>

      {!adminToken ? (
        <form className="panel-form admin-login" onSubmit={onAdminLogin}>
          <label className="span-2">
            {tx('adminPin')}
            <input
              required
              type="password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <div className="form-actions span-2">
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? '…' : tx('unlockDesk')}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="admin-toolbar">
            <p>{tx('deskActive')}</p>
            <button type="button" className="btn btn-ghost" onClick={() => void refreshAdmin(adminToken)}>
              {tx('refresh')}
            </button>
            <button type="button" className="btn btn-ghost" onClick={logoutAdmin}>
              {tx('lockDesk')}
            </button>
          </div>

          <div className="admin-tabs" role="tablist" aria-label="Admin desk sections">
            {(
              [
                { id: 'snapshot' as const, label: tx('tabSnapshot'), count: null },
                { id: 'appointments' as const, label: tx('tabAppointments'), count: openApptCount },
                { id: 'orders' as const, label: tx('tabOrders'), count: openOrderCount },
                { id: 'collections' as const, label: tx('tabCollections'), count: pieces.length || null },
                { id: 'visits' as const, label: tx('tabVisits'), count: null },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={adminTab === tab.id}
                className={`admin-tab tab-${tab.id}${adminTab === tab.id ? ' active' : ''}`}
                onClick={() => setAdminTab(tab.id)}
              >
                <span>{tab.label}</span>
                {tab.count != null ? <em>{tab.count}</em> : null}
              </button>
            ))}
          </div>

          <div className={`admin-tab-panel theme-${adminTab}`} role="tabpanel">
            {adminTab === 'snapshot' && (
              <section className="admin-panel panel-snapshot">
                <header className="admin-panel-head">
                  <div>
                    <p className="admin-panel-kicker">{tx('tabSnapshot')}</p>
                    <h3>{tx('snapshotTitle')}</h3>
                  </div>
                </header>
                <div className="visit-summary-grid">
                  <div className="visit-stat">
                    <strong>{openApptCount}</strong>
                    <span>{tx('snapAppointments')}</span>
                  </div>
                  <div className="visit-stat">
                    <strong>{openOrderCount}</strong>
                    <span>{tx('snapOrders')}</span>
                  </div>
                  <div className="visit-stat">
                    <strong>{readyCount}</strong>
                    <span>{tx('snapReady')}</span>
                  </div>
                  <div className="visit-stat">
                    <strong>{appointments.length + orders.length}</strong>
                    <span>Total records</span>
                  </div>
                </div>
              </section>
            )}

            {adminTab === 'appointments' && (
              <section className="admin-panel">
                <header className="admin-panel-head">
                  <div>
                    <p className="admin-panel-kicker">{tx('tabAppointments')}</p>
                    <h3>{tx('liveAppointmentsTitle')}</h3>
                  </div>
                </header>
                {renderListControls({
                  value: apptSearch,
                  onChange: setApptSearch,
                  placeholder: tx('searchAppointments'),
                  page: pagedAppts.page,
                  totalPages: pagedAppts.totalPages,
                  total: pagedAppts.total,
                  onPage: setApptPage,
                })}
                <ul className="admin-list">
                  {pagedAppts.items.map((row) => (
                    <li key={row.id} className="admin-list-item">
                      {editingApptId === row.id ? (
                        <div className="panel-form">
                          <label>
                            Status
                            <select
                              value={apptEdit.status ?? row.status}
                              onChange={(e) => setApptEdit({ ...apptEdit, status: e.target.value })}
                            >
                              <option value="new">{tx('statusNew')}</option>
                              <option value="confirmed">{tx('statusConfirmed')}</option>
                              <option value="completed">{tx('statusCompleted')}</option>
                              <option value="cancelled">{tx('statusCancelled')}</option>
                            </select>
                          </label>
                          <label>
                            {tx('notes')}
                            <input
                              value={apptEdit.notes ?? row.notes}
                              onChange={(e) => setApptEdit({ ...apptEdit, notes: e.target.value })}
                            />
                          </label>
                          <div className="form-actions">
                            <button
                              type="button"
                              className="btn btn-primary"
                              disabled={busy}
                              onClick={() =>
                                void onUpdateAppointment(row.id, apptEdit).then(() => {
                                  setEditingApptId(null)
                                  setApptEdit({})
                                })
                              }
                            >
                              {tx('save')}
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost"
                              onClick={() => {
                                setEditingApptId(null)
                                setApptEdit({})
                              }}
                            >
                              {tx('cancel')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <strong>
                              #{row.id} · {row.customer_name}
                            </strong>
                            <p>
                              {row.customer_phone} · {row.service_type} · {row.status}
                            </p>
                            <p>
                              {row.preferred_date || '—'} {row.preferred_time}
                            </p>
                            {row.notes ? <p>{row.notes}</p> : null}
                          </div>
                          <div className="form-actions">
                            <button
                              type="button"
                              className="btn btn-ghost"
                              onClick={() => {
                                setEditingApptId(row.id)
                                setApptEdit({ status: row.status, notes: row.notes })
                              }}
                            >
                              {tx('edit')}
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost"
                              disabled={busy}
                              onClick={() => {
                                if (window.confirm(`Delete appointment #${row.id}?`)) {
                                  void onDeleteAppointment(row.id)
                                }
                              }}
                            >
                              {tx('delete')}
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                  {pagedAppts.total === 0 && (
                    <li className="empty">
                      {apptSearch.trim() ? tx('noSearchResults') : tx('noAppointments')}
                    </li>
                  )}
                </ul>
              </section>
            )}

            {adminTab === 'orders' && (
              <section className="admin-panel">
                <header className="admin-panel-head">
                  <div>
                    <p className="admin-panel-kicker">{tx('tabOrders')}</p>
                    <h3>{tx('liveOrdersTitle')}</h3>
                  </div>
                </header>
                {renderListControls({
                  value: orderSearch,
                  onChange: setOrderSearch,
                  placeholder: tx('searchOrders'),
                  page: pagedOrders.page,
                  totalPages: pagedOrders.totalPages,
                  total: pagedOrders.total,
                  onPage: setOrderPage,
                })}
                <ul className="admin-list">
                  {pagedOrders.items.map((row) => (
                    <li key={row.id} className="admin-list-item">
                      {editingOrderId === row.id ? (
                        <div className="panel-form">
                          <label>
                            Status
                            <select
                              value={orderEdit.status ?? row.status}
                              onChange={(e) => setOrderEdit({ ...orderEdit, status: e.target.value })}
                            >
                              <option value="new">{tx('statusNew')}</option>
                              <option value="measuring">{tx('statusMeasuring')}</option>
                              <option value="stitching">{tx('statusStitching')}</option>
                              <option value="ready">{tx('statusReady')}</option>
                              <option value="delivered">{tx('statusDelivered')}</option>
                              <option value="cancelled">{tx('statusCancelled')}</option>
                            </select>
                          </label>
                          <label>
                            {tx('notes')}
                            <input
                              value={orderEdit.notes ?? row.notes}
                              onChange={(e) => setOrderEdit({ ...orderEdit, notes: e.target.value })}
                            />
                          </label>
                          <div className="form-actions">
                            <button
                              type="button"
                              className="btn btn-primary"
                              disabled={busy}
                              onClick={() =>
                                void onUpdateOrder(row.id, orderEdit).then(() => {
                                  setEditingOrderId(null)
                                  setOrderEdit({})
                                })
                              }
                            >
                              {tx('save')}
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost"
                              onClick={() => {
                                setEditingOrderId(null)
                                setOrderEdit({})
                              }}
                            >
                              {tx('cancel')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <strong>
                              #{row.id} · {row.customer_name}
                            </strong>
                            <p>
                              {row.customer_phone} · {row.garment_type} · {row.status}
                            </p>
                            <p>
                              {row.occasion || '—'} · {row.preferred_date || '—'}
                            </p>
                            {row.fabric_notes ? <p>{row.fabric_notes}</p> : null}
                            {row.notes ? <p>{row.notes}</p> : null}
                          </div>
                          <div className="form-actions">
                            <button
                              type="button"
                              className="btn btn-ghost"
                              onClick={() => {
                                setEditingOrderId(row.id)
                                setOrderEdit({ status: row.status, notes: row.notes })
                              }}
                            >
                              {tx('edit')}
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost"
                              disabled={busy}
                              onClick={() => {
                                if (window.confirm(`Delete stitch order #${row.id}?`)) {
                                  void onDeleteOrder(row.id)
                                }
                              }}
                            >
                              {tx('delete')}
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                  {pagedOrders.total === 0 && (
                    <li className="empty">
                      {orderSearch.trim() ? tx('noSearchResults') : tx('noOrders')}
                    </li>
                  )}
                </ul>
              </section>
            )}

            {adminTab === 'collections' && (
              <section className="admin-panel">
                <header className="admin-panel-head">
                  <div>
                    <p className="admin-panel-kicker">{tx('tabCollections')}</p>
                    <h3>{tx('collectionsAdminTitle')}</h3>
                    <p className="admin-panel-hint">{tx('collectionsAdminIntro')}</p>
                  </div>
                </header>

                {pieceError && <p className="flash flash-error">{pieceError}</p>}

                <form className="panel-form" onSubmit={onUploadPiece}>
                  <label>
                    {tx('collectionsTitleField')}
                    <input
                      required
                      value={pieceForm.title}
                      onChange={(e) => setPieceForm({ ...pieceForm, title: e.target.value })}
                    />
                  </label>
                  <label>
                    {tx('collectionsTitleTeField')}
                    <input
                      value={pieceForm.title_te}
                      onChange={(e) => setPieceForm({ ...pieceForm, title_te: e.target.value })}
                    />
                  </label>
                  <label className="span-2">
                    {tx('collectionsBodyField')}
                    <textarea
                      rows={2}
                      value={pieceForm.body}
                      onChange={(e) => setPieceForm({ ...pieceForm, body: e.target.value })}
                    />
                  </label>
                  <label className="span-2">
                    {tx('collectionsBodyTeField')}
                    <textarea
                      rows={2}
                      value={pieceForm.body_te}
                      onChange={(e) => setPieceForm({ ...pieceForm, body_te: e.target.value })}
                    />
                  </label>
                  <label>
                    {tx('collectionsCategory')}
                    <select
                      value={pieceForm.category}
                      onChange={(e) => setPieceForm({ ...pieceForm, category: e.target.value })}
                    >
                      <option value="saree">Saree</option>
                      <option value="lehenga">Lehenga</option>
                      <option value="bridal">Bridal</option>
                      <option value="kurti">Kurti</option>
                      <option value="kids">Kids</option>
                      <option value="alteration">Alteration</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <label>
                    {tx('collectionsKind')}
                    <select
                      value={pieceForm.kind}
                      onChange={(e) => setPieceForm({ ...pieceForm, kind: e.target.value })}
                    >
                      <option value="design">{tx('collectionsKindDesign')}</option>
                      <option value="stock">{tx('collectionsKindStock')}</option>
                    </select>
                  </label>
                  <label>
                    {tx('collectionsPublished')}
                    <select
                      value={pieceForm.published}
                      onChange={(e) => setPieceForm({ ...pieceForm, published: e.target.value })}
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </label>
                  <label>
                    {tx('collectionsImage')}
                    <input
                      required
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => setPieceFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  <div className="form-actions span-2">
                    <button className="btn btn-primary" type="submit" disabled={pieceBusy || !pieceFile}>
                      {pieceBusy ? tx('submitting') : tx('collectionsUpload')}
                    </button>
                  </div>
                </form>

                <ul className="admin-card-list">
                  {pieces.map((row) => (
                    <li key={row.id} className="admin-card">
                      <div className="admin-card-media">
                        <img src={row.image_url} alt="" loading="lazy" />
                      </div>
                      <div className="admin-card-body">
                        <strong>{row.title}</strong>
                        <p>
                          {row.kind} · {row.category} · {row.published === 'yes' ? 'published' : 'hidden'}
                        </p>
                        {row.body ? <em>{row.body}</em> : null}
                      </div>
                      <div className="admin-card-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => void togglePublished(row)}>
                          {row.published === 'yes' ? 'Hide' : 'Publish'}
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => void removePiece(row.id)}>
                          {tx('delete')}
                        </button>
                      </div>
                    </li>
                  ))}
                  {pieces.length === 0 && <li className="empty">{tx('collectionsEmpty')}</li>}
                </ul>
              </section>
            )}

            {adminTab === 'visits' && (
              <section className="admin-panel panel-visits">
                <header className="admin-panel-head">
                  <div>
                    <p className="admin-panel-kicker">{tx('tabVisits')}</p>
                    <h3>{tx('visitsTitle')}</h3>
                    <p className="admin-panel-hint">{tx('visitsHint')}</p>
                  </div>
                </header>

                {visitLoading && <p className="admin-panel-hint">{tx('refresh')}…</p>}
                {visitError && <p className="flash flash-error">{visitError}</p>}

                {!visitLoading && !visitError && visitStats && (
                  <>
                    <div className="visit-summary-grid">
                      <div className="visit-stat">
                        <strong>{visitStats.today.hits}</strong>
                        <span>
                          {tx('visitsToday')} · {tx('visitsHits')}
                        </span>
                      </div>
                      <div className="visit-stat">
                        <strong>{visitStats.today.uniques}</strong>
                        <span>
                          {tx('visitsToday')} · {tx('visitsUniques')}
                        </span>
                      </div>
                      <div className="visit-stat">
                        <strong>{visitStats.totals.hits}</strong>
                        <span>
                          {tx('visitsPeriod')} · {tx('visitsHits')}
                        </span>
                      </div>
                      <div className="visit-stat">
                        <strong>{visitStats.totals.uniques}</strong>
                        <span>
                          {tx('visitsPeriod')} · {tx('visitsUniques')}
                        </span>
                      </div>
                    </div>

                    <div className="visit-block">
                      <h4>{tx('visitsDaily')}</h4>
                      {visitStats.totals.hits === 0 ? (
                        <p className="empty">{tx('visitsEmpty')}</p>
                      ) : (
                        <ul className="visit-day-list">
                          {[...visitStats.daily].reverse().map((row) => {
                            const maxHits = Math.max(1, ...visitStats.daily.map((d) => d.hits))
                            const width = Math.round((row.hits / maxHits) * 100)
                            return (
                              <li key={row.day}>
                                <span className="visit-day-label">{row.day}</span>
                                <span className="visit-day-bar" aria-hidden="true">
                                  <i style={{ width: `${width}%` }} />
                                </span>
                                <span className="visit-day-counts">
                                  {row.hits} / {row.uniques}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>

                    <div className="visit-block">
                      <h4>{tx('visitsGeo')}</h4>
                      {visitStats.geo.length === 0 ? (
                        <p className="empty">{tx('visitsEmpty')}</p>
                      ) : (
                        <div className="visit-geo-table" role="table" aria-label={tx('visitsGeo')}>
                          <div className="visit-geo-head" role="row">
                            <span role="columnheader">{tx('visitsCountry')}</span>
                            <span role="columnheader">{tx('visitsCity')}</span>
                            <span role="columnheader">{tx('visitsHits')}</span>
                          </div>
                          {visitStats.geo.map((row) => (
                            <div
                              className="visit-geo-row"
                              role="row"
                              key={`${row.country}-${row.city ?? ''}-${row.hits}`}
                            >
                              <span role="cell">{countryLabel(row.country, tx('visitsUnknown'))}</span>
                              <span role="cell">{row.city || '—'}</span>
                              <span role="cell">{row.hits}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="admin-panel-hint">{tx('visitsPrivacyNote')}</p>
                    </div>
                  </>
                )}
              </section>
            )}
          </div>
        </>
      )}
    </section>
  )
}

function countryLabel(code: string, unknownLabel: string): string {
  if (!code || code === 'ZZ' || code === 'XX') return unknownLabel
  try {
    const name = new Intl.DisplayNames(['en'], { type: 'region' }).of(code)
    return name ? `${name} (${code})` : code
  } catch {
    return code
  }
}
