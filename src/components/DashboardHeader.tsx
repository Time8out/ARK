import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ArrowRightIcon, GroupIcon, PersonMinusIcon, PersonPlusIcon, PlusIcon, TwoPeopleIcon } from './icons'
import AddMemberModal from './AddMemberModal'
import MembersTable, { type MemberFilter } from './MembersTable'
import './DashboardHeader.css'

const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' })

type Counts = {
  total: number
  newThisMonth: number
  active: number
  inactive: number
}

const filterMeta: Record<MemberFilter, { title: string; subtitle: string }> = {
  all: { title: 'All Members', subtitle: 'Manage and view all church members' },
  new: { title: `New Members - ${currentMonth}`, subtitle: 'Members added this month' },
  active: { title: 'Active Members', subtitle: 'Members currently active in the church' },
  inactive: { title: 'Inactive Members', subtitle: 'Members marked as inactive' },
}

function DashboardHeader() {
  const [modalOpen, setModalOpen] = useState(false)
  const [counts, setCounts] = useState<Counts | null>(null)
  const [loadError, setLoadError] = useState('')
  const [activeFilter, setActiveFilter] = useState<MemberFilter | null>('all')
  const [refreshSignal, setRefreshSignal] = useState(0)

  const loadCounts = useCallback(async () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

    const [totalRes, activeRes, inactiveRes, newRes] = await Promise.all([
      supabase.from('members').select('*', { count: 'exact', head: true }),
      supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'inactive'),
      supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth)
        .lt('created_at', startOfNextMonth),
    ])

    const firstError = totalRes.error || activeRes.error || inactiveRes.error || newRes.error
    if (firstError) {
      setLoadError(firstError.message)
      return
    }

    setLoadError('')
    setCounts({
      total: totalRes.count ?? 0,
      active: activeRes.count ?? 0,
      inactive: inactiveRes.count ?? 0,
      newThisMonth: newRes.count ?? 0,
    })
  }, [])

  useEffect(() => {
    loadCounts()
  }, [loadCounts])

  function toggleFilter(filter: MemberFilter) {
    setActiveFilter((current) => (current === filter ? null : filter))
  }

  const stats: { icon: typeof TwoPeopleIcon; label: string; value: string; filter: MemberFilter; viewLabel: string }[] = [
    {
      icon: TwoPeopleIcon,
      label: 'Total Members',
      value: counts ? counts.total.toLocaleString() : '—',
      filter: 'all',
      viewLabel: 'View all members',
    },
    {
      icon: PersonPlusIcon,
      label: `New Members - ${currentMonth}`,
      value: counts ? counts.newThisMonth.toLocaleString() : '—',
      filter: 'new',
      viewLabel: 'View new members',
    },
    {
      icon: GroupIcon,
      label: 'Active Members',
      value: counts ? counts.active.toLocaleString() : '—',
      filter: 'active',
      viewLabel: 'View active members',
    },
    {
      icon: PersonMinusIcon,
      label: 'Inactive Members',
      value: counts ? counts.inactive.toLocaleString() : '—',
      filter: 'inactive',
      viewLabel: 'View inactive members',
    },
  ]

  return (
    <div className="dashboard-header-section">
      <div className="dashboard-header-top">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your church membership</p>
        </div>

        <button type="button" className="add-member-btn" onClick={() => setModalOpen(true)}>
          <PlusIcon />
          Add Member
        </button>
      </div>

      {loadError && <p className="dashboard-header-error">Couldn't load member counts: {loadError}</p>}

      <div className="stat-grid">
        {stats.map(({ icon: Icon, label, value, filter, viewLabel }) => (
          <button
            type="button"
            className={`stat-card ${activeFilter === filter ? 'selected' : ''}`}
            key={label}
            onClick={() => toggleFilter(filter)}
          >
            <div className="stat-card-top">
              <Icon />
              <span className="stat-label">{label.toUpperCase()}</span>
            </div>
            <div className="stat-value">{value}</div>
            <span className="stat-view-link">
              {viewLabel} <ArrowRightIcon />
            </span>
          </button>
        ))}
      </div>

      {activeFilter && (
        <MembersTable
          filter={activeFilter}
          title={filterMeta[activeFilter].title}
          subtitle={filterMeta[activeFilter].subtitle}
          onClose={() => setActiveFilter(null)}
          onDataChanged={loadCounts}
          refreshSignal={refreshSignal}
        />
      )}

      {modalOpen && (
        <AddMemberModal
          onClose={() => setModalOpen(false)}
          onAdded={() => {
            loadCounts()
            setRefreshSignal((s) => s + 1)
          }}
        />
      )}
    </div>
  )
}

export default DashboardHeader
