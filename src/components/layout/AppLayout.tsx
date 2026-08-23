import { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import arkLogo from '../../assets/ark-logo.png'
import { supabase } from '../../lib/supabaseClient'
import ChangePasswordModal from '../ChangePasswordModal'
import { ChevronDownIcon, MenuIcon } from '../icons'
import Sidebar from './Sidebar'
import './AppLayout.css'

function AppLayout() {
  const navigate = useNavigate()
  const [checkingSession, setCheckingSession] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate('/')
        return
      }
      setCheckingSession(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/')
    })

    return () => subscription.subscription.unsubscribe()
  }, [navigate])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (checkingSession) return null

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />

      <div className="app-main">
        <header className="app-header">
          <button
            type="button"
            className="hamburger-btn"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <MenuIcon />
          </button>

          <div className="profile-menu" ref={menuRef}>
            <button type="button" className="profile-trigger" onClick={() => setMenuOpen((v) => !v)}>
              <span className="avatar">
                <img src={arkLogo} alt="" />
              </span>
              <span className="profile-name">Admin</span>
              <ChevronDownIcon />
            </button>

            {menuOpen && (
              <div className="profile-dropdown">
                <button type="button" className="danger" onClick={handleSignOut}>
                  Sign Out
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    setChangePasswordOpen(true)
                  }}
                >
                  Change Password
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>

      {changePasswordOpen && <ChangePasswordModal onClose={() => setChangePasswordOpen(false)} />}
    </div>
  )
}

export default AppLayout
