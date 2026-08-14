import { useEffect, useState, type FormEvent } from 'react'
import {
  adminLogin,
  adminLogout,
  createAppointment,
  createStitchOrder,
  deleteAppointment,
  deleteStitchOrder,
  fetchAppointments,
  fetchStats,
  fetchStitchOrders,
  trackPageView,
  updateAppointment,
  updateStitchOrder,
  type Appointment,
  type Stats,
  type StitchOrder,
} from './api'
import { PhoneLinks } from './components/PhoneLinks'
import { PortalBack } from './components/PortalBack'
import { BrandMark } from './components/BrandMark'
import { LocalNow } from './components/LocalNow'
import { OpenBadge } from './components/OpenBadge'
import { address, business, t, type Lang } from './content'
import { waHref } from './lib/whatsapp'
import { AdminPortal, type AdminTab } from './portals/AdminPortal'
import { AboutPortal } from './portals/AboutPortal'
import { BookPortal, type BookFormState } from './portals/BookPortal'
import { CollectionsPortal } from './portals/CollectionsPortal'
import { ConfirmPortal } from './portals/ConfirmPortal'
import { HomePortal } from './portals/HomePortal'
import { PrivacyPortal } from './portals/PrivacyPortal'
import { StitchPortal, type StitchFormState } from './portals/StitchPortal'

type Portal =
  | 'home'
  | 'book'
  | 'stitch'
  | 'admin'
  | 'about'
  | 'confirm'
  | 'privacy'
  | 'collections'
type ConfirmKind = 'book' | 'stitch'

const PORTALS = new Set<Portal>([
  'home',
  'book',
  'stitch',
  'admin',
  'about',
  'confirm',
  'privacy',
  'collections',
])

function portalFromHash(): Portal {
  const raw = window.location.hash.replace(/^#\/?/, '').split('?')[0] || 'home'
  return PORTALS.has(raw as Portal) ? (raw as Portal) : 'home'
}

function hashForPortal(portal: Portal) {
  return portal === 'home' ? '#/' : `#/${portal}`
}

const ADMIN_TOKEN_KEY = 'ruhi_admin_token'

function readAdminToken(): string {
  const fromSession = sessionStorage.getItem(ADMIN_TOKEN_KEY)
  if (fromSession) return fromSession
  const fromLocal = localStorage.getItem(ADMIN_TOKEN_KEY)
  if (fromLocal) {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, fromLocal)
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    return fromLocal
  }
  return ''
}

function writeAdminToken(token: string) {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY)
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

const emptyBook: BookFormState = {
  customer_name: '',
  customer_phone: '',
  service_type: 'consultation',
  preferred_date: '',
  preferred_time: '',
  notes: '',
}

const emptyStitch: StitchFormState = {
  customer_name: '',
  customer_phone: '',
  garment_type: 'blouse',
  fabric_notes: '',
  occasion: '',
  preferred_date: '',
  notes: '',
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('ruhi_lang')
    return saved === 'te' || saved === 'en' ? saved : 'en'
  })
  const [portal, setPortal] = useState<Portal>(() => portalFromHash())
  const [navOpen, setNavOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [bookForm, setBookForm] = useState<BookFormState>(emptyBook)
  const [stitchForm, setStitchForm] = useState<StitchFormState>(emptyStitch)
  const [confirmKind, setConfirmKind] = useState<ConfirmKind | null>(null)
  const [confirmMessage, setConfirmMessage] = useState('')
  const [adminToken, setAdminToken] = useState(() => readAdminToken())
  const [adminPin, setAdminPin] = useState('')
  const [adminTab, setAdminTab] = useState<AdminTab>('snapshot')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [orders, setOrders] = useState<StitchOrder[]>([])

  const tx = (key: Parameters<typeof t>[1]) => t(lang, key)

  function switchLang(next: Lang) {
    setLang(next)
    localStorage.setItem('ruhi_lang', next)
  }

  useEffect(() => {
    function onHash() {
      setPortal(portalFromHash())
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    trackPageView(portal)
  }, [portal])

  async function refreshPublic() {
    try {
      const next = await fetchStats()
      setStats(next)
    } catch {
      /* ignore transient */
    }
  }

  async function refreshAdmin(token: string) {
    const [appts, stitch] = await Promise.all([
      fetchAppointments(token, 500),
      fetchStitchOrders(token, 500),
    ])
    setAppointments(appts)
    setOrders(stitch)
  }

  useEffect(() => {
    void refreshPublic()
    const id = window.setInterval(() => void refreshPublic(), 15000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!adminToken || portal !== 'admin') return
    void refreshAdmin(adminToken).catch((err) => {
      setError(err instanceof Error ? err.message : 'Admin session expired')
      setAdminToken('')
      clearAdminToken()
    })
  }, [adminToken, portal])

  function clearFlash() {
    setMessage(null)
    setError(null)
  }

  function goPortal(next: Portal, mode: 'push' | 'replace' = 'push') {
    if (next !== 'confirm') {
      setConfirmKind(null)
      setConfirmMessage('')
    }
    if (next !== portal) clearFlash()
    setNavOpen(false)
    setPortal(next)
    const hash = hashForPortal(next)
    if (mode === 'replace') {
      window.history.replaceState(null, '', hash)
    } else if (window.location.hash !== hash) {
      window.location.hash = hash
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goBack() {
    if (window.history.length > 1) {
      window.history.back()
      return
    }
    goPortal('home', 'replace')
  }

  function showConfirm(kind: ConfirmKind, text: string) {
    clearFlash()
    setConfirmKind(kind)
    setConfirmMessage(text)
    goPortal('confirm')
  }

  async function onBook(event: FormEvent) {
    event.preventDefault()
    clearFlash()
    setBusy(true)
    try {
      const created = await createAppointment({ ...bookForm })
      setBookForm(emptyBook)
      void refreshPublic()
      showConfirm(
        'book',
        lang === 'te'
          ? `విజిట్ #${created.id} నమోదు అయింది. బూటిక్ త్వరలో నిర్ధారిస్తుంది.`
          : `Visit #${created.id} received. The boutique will confirm shortly.`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reserve visit')
    } finally {
      setBusy(false)
    }
  }

  async function onStitch(event: FormEvent) {
    event.preventDefault()
    clearFlash()
    setBusy(true)
    try {
      const created = await createStitchOrder({ ...stitchForm })
      setStitchForm(emptyStitch)
      void refreshPublic()
      showConfirm(
        'stitch',
        lang === 'te'
          ? `స్టిచ్ ఆర్డర్ #${created.id} నమోదు అయింది. కొలతల కోసం బూటిక్ సంప్రదిస్తుంది.`
          : `Stitch order #${created.id} received. The boutique will contact you for measurements.`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit stitch request')
    } finally {
      setBusy(false)
    }
  }

  async function onAdminLogin(event: FormEvent) {
    event.preventDefault()
    clearFlash()
    setBusy(true)
    try {
      const { access_token } = await adminLogin(adminPin)
      setAdminToken(access_token)
      writeAdminToken(access_token)
      setAdminPin('')
      setMessage(lang === 'te' ? 'అడ్మిన్ డెస్క్ అన్‌లాక్ అయింది.' : 'Admin desk unlocked.')
      await refreshAdmin(access_token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  async function onUpdateAppointment(id: number, body: Record<string, unknown>) {
    if (!adminToken) return
    clearFlash()
    setBusy(true)
    try {
      await updateAppointment(adminToken, id, body)
      setMessage(tx('updated'))
      await refreshAdmin(adminToken)
      void refreshPublic()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
      throw err
    } finally {
      setBusy(false)
    }
  }

  async function onDeleteAppointment(id: number) {
    if (!adminToken) return
    clearFlash()
    setBusy(true)
    try {
      await deleteAppointment(adminToken, id)
      setMessage(tx('deleted'))
      await refreshAdmin(adminToken)
      void refreshPublic()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  async function onUpdateOrder(id: number, body: Record<string, unknown>) {
    if (!adminToken) return
    clearFlash()
    setBusy(true)
    try {
      await updateStitchOrder(adminToken, id, body)
      setMessage(tx('updated'))
      await refreshAdmin(adminToken)
      void refreshPublic()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
      throw err
    } finally {
      setBusy(false)
    }
  }

  async function onDeleteOrder(id: number) {
    if (!adminToken) return
    clearFlash()
    setBusy(true)
    try {
      await deleteStitchOrder(adminToken, id)
      setMessage(tx('deleted'))
      await refreshAdmin(adminToken)
      void refreshPublic()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  function logoutAdmin() {
    if (adminToken) {
      void adminLogout(adminToken).catch(() => {
        /* fire-and-forget */
      })
    }
    setAdminToken('')
    clearAdminToken()
    setAdminTab('snapshot')
  }

  return (
    <div className={`site lang-${lang}`}>
      <div className="topbar">
        <span className="topbar-banner">
          <OpenBadge tx={tx} className="topbar-open" />
          <span className="topbar-sep" aria-hidden="true">
            ·
          </span>
          <PhoneLinks />
        </span>
        <LocalNow lang={lang} tx={tx} />
      </div>

      <header className={`nav${navOpen ? ' is-menu-open' : ''}`}>
        <a
          className="nav-brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            goPortal('home')
          }}
        >
          <BrandMark className="nav-mark" />
          <span>
            <strong>Ruhi Trends</strong>
            <small>ruhitrends.com</small>
          </span>
        </a>
        <nav className="nav-links" id="primary-nav-links" aria-label="Primary">
          <button type="button" className={portal === 'home' ? 'active' : ''} onClick={() => goPortal('home')}>
            {tx('navHome')}
          </button>
          <button
            type="button"
            className={portal === 'collections' ? 'active' : ''}
            onClick={() => goPortal('collections')}
          >
            {tx('navCollections')}
          </button>
          <button type="button" className={portal === 'about' ? 'active' : ''} onClick={() => goPortal('about')}>
            {tx('navAbout')}
          </button>
          <button type="button" className={portal === 'book' ? 'active' : ''} onClick={() => goPortal('book')}>
            {tx('navBook')}
          </button>
          <button type="button" className={portal === 'stitch' ? 'active' : ''} onClick={() => goPortal('stitch')}>
            {tx('navStitch')}
          </button>
        </nav>
        <div className="nav-end">
          <div className="lang-switch" role="group" aria-label="Language">
            <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => switchLang('en')}>
              {tx('langEn')}
            </button>
            <button type="button" className={lang === 'te' ? 'active' : ''} onClick={() => switchLang('te')}>
              {tx('langTe')}
            </button>
          </div>
          <a className="nav-cta" href={`tel:${business.phone}`}>
            {tx('callNow')}
          </a>
          <button
            type="button"
            className="nav-menu-toggle"
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={navOpen}
            aria-controls="primary-nav-links"
            onClick={() => setNavOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <main id="top">
        {error && (
          <div className="flash flash-error" role="status">
            {error}
            <button type="button" onClick={clearFlash} aria-label="Dismiss">
              ×
            </button>
          </div>
        )}
        {message && portal !== 'confirm' && (
          <div className="flash flash-ok" role="status">
            {message}
            <button type="button" onClick={clearFlash} aria-label="Dismiss">
              ×
            </button>
          </div>
        )}

        {portal === 'confirm' && confirmKind && (
          <>
            <PortalBack tx={tx} onBack={goBack} labelKey="backHome" />
            <ConfirmPortal
              title={tx(confirmKind === 'book' ? 'confirmBookTitle' : 'confirmStitchTitle')}
              message={confirmMessage}
              primaryLabel={tx('confirmBackHome')}
              secondaryLabel={tx(
                confirmKind === 'book' ? 'confirmAnotherBook' : 'confirmAnotherStitch',
              )}
              onPrimary={() => goPortal('home')}
              onSecondary={() => goPortal(confirmKind === 'book' ? 'book' : 'stitch')}
              callLabel={tx('callNow')}
              callHref={`tel:${business.phone}`}
            />
          </>
        )}

        {portal === 'home' && (
          <HomePortal lang={lang} tx={tx} stats={stats} setPortal={goPortal} />
        )}

        {portal === 'about' && (
          <>
            <PortalBack tx={tx} onBack={goBack} />
            <AboutPortal lang={lang} tx={tx} />
          </>
        )}

        {portal === 'collections' && (
          <>
            <PortalBack tx={tx} onBack={goBack} />
            <CollectionsPortal
              lang={lang}
              tx={tx}
              onBook={() => goPortal('book')}
              onStitch={() => goPortal('stitch')}
            />
          </>
        )}

        {portal === 'book' && (
          <>
            <PortalBack tx={tx} onBack={goBack} />
            <BookPortal
              lang={lang}
              tx={tx}
              form={bookForm}
              setForm={setBookForm}
              busy={busy}
              onSubmit={onBook}
            />
          </>
        )}

        {portal === 'stitch' && (
          <>
            <PortalBack tx={tx} onBack={goBack} />
            <StitchPortal
              lang={lang}
              tx={tx}
              form={stitchForm}
              setForm={setStitchForm}
              busy={busy}
              onSubmit={onStitch}
            />
          </>
        )}

        {portal === 'admin' && (
          <>
            <PortalBack tx={tx} onBack={goBack} />
            <AdminPortal
              tx={tx}
              adminToken={adminToken}
              adminPin={adminPin}
              setAdminPin={setAdminPin}
              busy={busy}
              appointments={appointments}
              orders={orders}
              adminTab={adminTab}
              setAdminTab={setAdminTab}
              onAdminLogin={onAdminLogin}
              onUpdateAppointment={onUpdateAppointment}
              onDeleteAppointment={onDeleteAppointment}
              onUpdateOrder={onUpdateOrder}
              onDeleteOrder={onDeleteOrder}
              logoutAdmin={logoutAdmin}
              refreshAdmin={refreshAdmin}
            />
          </>
        )}

        {portal === 'privacy' && (
          <>
            <PortalBack tx={tx} onBack={goBack} />
            <PrivacyPortal tx={tx} />
          </>
        )}
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-brand-row">
              <BrandMark className="footer-mark" />
              <strong>{business.name}</strong>
            </div>
            <p>{business.owner}</p>
            <p>
              <PhoneLinks />
            </p>
            <p>{address.line}</p>
            <p className="footer-hours">{tx('hours')}</p>
          </div>
          <div className="footer-meta">
            <p className="footer-nav-label">{tx('footerNav')}</p>
            <div className="footer-links">
              <button type="button" className="footer-link" onClick={() => goPortal('book')}>
                {tx('navBook')}
              </button>
              <button type="button" className="footer-link" onClick={() => goPortal('stitch')}>
                {tx('navStitch')}
              </button>
              <button type="button" className="footer-link" onClick={() => goPortal('about')}>
                {tx('navAbout')}
              </button>
              <button type="button" className="footer-link" onClick={() => goPortal('privacy')}>
                {tx('footerPrivacy')}
              </button>
              <button type="button" className="footer-link footer-link-quiet" onClick={() => goPortal('admin')}>
                {tx('goAdmin')}
              </button>
            </div>
            <p>{tx('footerRoles')}</p>
            <p className="footer-copyright">
              {tx('footerCopyright').replace('{year}', String(new Date().getFullYear()))}
            </p>
          </div>
        </div>
      </footer>

      <nav className="mobile-dock" aria-label="Quick actions">
        <a className="mobile-dock-item" href={`tel:${business.phone}`}>
          <span>{tx('callNow')}</span>
        </a>
        <a className="mobile-dock-item mobile-dock-primary" href={waHref(lang)} target="_blank" rel="noreferrer">
          <span>{tx('whatsapp')}</span>
        </a>
        <button type="button" className="mobile-dock-item" onClick={() => goPortal('book')}>
          <span>{tx('dockBook')}</span>
        </button>
      </nav>
    </div>
  )
}
