import { NavLink } from 'react-router-dom'
import arkLogo from '../../assets/ark-logo.png'
import { CollapseIcon, DashboardIcon, MinistriesIcon, UsersIcon } from '../icons'
import './Sidebar.css'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/groups', label: 'Groups', icon: UsersIcon },
  { to: '/ministries', label: 'Ministries', icon: MinistriesIcon },
]

const navItemClass = ({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`

type SidebarProps = {
  collapsed: boolean
  mobileOpen: boolean
  onNavigate: () => void
  onToggleCollapse: () => void
}

function Sidebar({ collapsed, mobileOpen, onNavigate, onToggleCollapse }: SidebarProps) {
  return (
    <>
      {mobileOpen && <div className="sidebar-backdrop" onClick={onNavigate} />}

      <nav className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <img src={arkLogo} alt="ARK - Almighty Risen King Church" />
        </div>

        <ul className="sidebar-nav">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink to={to} className={navItemClass} onClick={onNavigate} title={collapsed ? label : undefined}>
                <Icon />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <button type="button" className="collapse-toggle" onClick={onToggleCollapse}>
          <CollapseIcon />
          <span>Collapse</span>
        </button>
      </nav>
    </>
  )
}

export default Sidebar
