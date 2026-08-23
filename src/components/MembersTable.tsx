import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabaseClient'
import { ChevronLeftIcon, ChevronRightSmallIcon, KebabIcon, PencilIcon, SearchIcon } from './icons'
import EditMemberModal from './EditMemberModal'
import './MembersTable.css'

export type MemberFilter = 'all' | 'new' | 'active' | 'inactive'

export type Member = {
  id: string
  full_name: string
  birthdate: string | null
  phone_number: string | null
  home_address: string | null
  status: string
  created_at: string
}

const PAGE_SIZE = 8

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getPageNumbers(current: number, total: number) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current, current - 1, current + 1])
  return Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)
}

function MembersTable({
  filter,
  title,
  subtitle,
  onClose,
  onDataChanged,
  refreshSignal,
}: {
  filter: MemberFilter
  title: string
  subtitle: string
  onClose: () => void
  onDataChanged?: () => void
  refreshSignal?: number
}) {
  const [rows, setRows] = useState<Member[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const portalMenuRef = useRef<HTMLDivElement>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [filter, debouncedSearch])

  const fetchRows = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError('')

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

    let query = supabase.from('members').select('*', { count: 'exact' })

    if (filter === 'active') query = query.eq('status', 'active')
    if (filter === 'inactive') query = query.eq('status', 'inactive')
    if (filter === 'new') query = query.gte('created_at', startOfMonth).lt('created_at', startOfNextMonth)
    if (debouncedSearch) query = query.ilike('full_name', `%${debouncedSearch}%`)

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data, error: fetchError, count } = await query

    if (requestIdRef.current !== requestId) return
    setLoading(false)

    if (fetchError) {
      setError(fetchError.message)
      return
    }

    setRows((data as Member[]) ?? [])
    setTotalCount(count ?? 0)
  }, [filter, debouncedSearch, page, refreshSignal])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        portalMenuRef.current &&
        !portalMenuRef.current.contains(target)
      ) {
        setOpenMenuId(null)
      }
    }
    if (openMenuId) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

  function toggleMenu(id: string, e: React.MouseEvent<HTMLButtonElement>) {
    if (openMenuId === id) {
      setOpenMenuId(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    setOpenMenuId(id)
  }

  async function handleDelete(id: string) {
    setOpenMenuId(null)
    if (!window.confirm('Delete this member? This cannot be undone.')) return

    const { error: deleteError } = await supabase.from('members').delete().eq('id', id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }

    onDataChanged?.()
    setRows((prev) => prev.filter((m) => m.id !== id))
    setTotalCount((prev) => Math.max(0, prev - 1))
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const showingFrom = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const showingTo = Math.min(page * PAGE_SIZE, totalCount)

  return (
    <div className="members-table-section">
      <div className="members-table-top">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <div className="members-table-actions">
          <div className="table-search">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="button" className="table-close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
      </div>

      {error && <p className="members-table-error">{error}</p>}

      <div className="members-table-wrap">
        <table className="members-table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Joined Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="members-table-empty">
                  No members found.
                </td>
              </tr>
            )}
            {rows.map((m) => (
              <tr key={m.id}>
                <td>
                  <span className="member-avatar">{m.full_name.charAt(0).toUpperCase()}</span>
                </td>
                <td className="member-name">{m.full_name}</td>
                <td>{m.home_address || '—'}</td>
                <td>{m.phone_number || '—'}</td>
                <td>{formatDate(m.created_at)}</td>
                <td>
                  <span className={`status-badge ${m.status}`}>
                    {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => setEditingMember(m)}
                      aria-label="Edit member"
                      title="Edit"
                    >
                      <PencilIcon />
                    </button>

                    <div className="kebab-wrapper" ref={openMenuId === m.id ? triggerRef : undefined}>
                      <button
                        type="button"
                        className="kebab-btn"
                        onClick={(e) => toggleMenu(m.id, e)}
                        aria-label="Row actions"
                      >
                        <KebabIcon />
                      </button>
                      {openMenuId === m.id &&
                        menuPosition &&
                        createPortal(
                          <div
                            className="kebab-menu portal"
                            ref={portalMenuRef}
                            style={{ top: menuPosition.top, right: menuPosition.right }}
                          >
                            <button type="button" className="danger" onClick={() => handleDelete(m.id)}>
                              Delete
                            </button>
                          </div>,
                          document.body
                        )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="members-table-footer">
        <span>
          Showing {showingFrom} to {showingTo} of {totalCount} members
        </span>

        <div className="pagination">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeftIcon />
          </button>
          {getPageNumbers(page, totalPages).map((p, i, arr) => (
            <span key={p} style={{ display: 'contents' }}>
              {i > 0 && p - arr[i - 1] > 1 && <span className="pagination-ellipsis">…</span>}
              <button
                type="button"
                className={p === page ? 'active' : ''}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            </span>
          ))}
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRightSmallIcon />
          </button>
        </div>
      </div>

      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onUpdated={() => {
            fetchRows()
            onDataChanged?.()
          }}
        />
      )}
    </div>
  )
}

export default MembersTable
