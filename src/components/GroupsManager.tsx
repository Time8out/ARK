import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { KebabIcon, PencilIcon, PlusIcon, UsersIcon } from './icons'
import GroupFormModal from './GroupFormModal'
import GroupMembersModal from './GroupMembersModal'
import './GroupsManager.css'

export type GroupKind = 'group' | 'ministry'

export type Group = {
  id: string
  kind: GroupKind
  name: string
  description: string | null
  created_at: string
}

function GroupCard({
  group,
  memberCount,
  onEdit,
  onDelete,
  onManageMembers,
}: {
  group: Group
  memberCount: number
  onEdit: () => void
  onDelete: () => void
  onManageMembers: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div className="group-card">
      <div className="group-card-top">
        <h3>{group.name}</h3>
        <div className="group-card-actions">
          <button type="button" className="edit-btn" onClick={onEdit} aria-label="Edit" title="Edit">
            <PencilIcon />
          </button>
          <div className="kebab-wrapper" ref={menuOpen ? menuRef : undefined}>
            <button
              type="button"
              className="kebab-btn"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More actions"
            >
              <KebabIcon />
            </button>
            {menuOpen && (
              <div className="kebab-menu">
                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete()
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="group-card-description">{group.description || 'No description yet.'}</p>

      <div className="group-card-footer">
        <span className="group-member-count">
          <UsersIcon /> {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </span>
        <button type="button" className="manage-members-btn" onClick={onManageMembers}>
          Manage Members
        </button>
      </div>
    </div>
  )
}

function GroupsManager({
  kind,
  title,
  subtitle,
  addLabel,
}: {
  kind: GroupKind
  title: string
  subtitle: string
  addLabel: string
}) {
  const [groups, setGroups] = useState<Group[]>([])
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [managingGroup, setManagingGroup] = useState<Group | null>(null)
  const requestIdRef = useRef(0)

  const loadGroups = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('groups')
      .select('*')
      .eq('kind', kind)
      .order('created_at', { ascending: false })

    if (requestIdRef.current !== requestId) return

    if (fetchError) {
      setLoading(false)
      setError(fetchError.message)
      return
    }

    const groupRows = (data as Group[]) ?? []
    setGroups(groupRows)

    if (groupRows.length === 0) {
      setMemberCounts({})
      setLoading(false)
      return
    }

    const { data: memberRows, error: countError } = await supabase
      .from('group_members')
      .select('group_id')
      .in(
        'group_id',
        groupRows.map((g) => g.id)
      )

    if (requestIdRef.current !== requestId) return
    setLoading(false)

    if (countError) {
      setError(countError.message)
      return
    }

    const counts: Record<string, number> = {}
    for (const row of memberRows ?? []) {
      counts[row.group_id] = (counts[row.group_id] ?? 0) + 1
    }
    setMemberCounts(counts)
  }, [kind])

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  async function handleDelete(group: Group) {
    if (!window.confirm(`Delete "${group.name}"? This cannot be undone.`)) return

    const { error: deleteError } = await supabase.from('groups').delete().eq('id', group.id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    loadGroups()
  }

  return (
    <div className="groups-manager">
      <div className="groups-manager-top">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <button type="button" className="primary-btn" onClick={() => setFormOpen(true)}>
          <PlusIcon /> {addLabel}
        </button>
      </div>

      {error && <p className="groups-manager-error">{error}</p>}

      {!loading && groups.length === 0 && (
        <div className="groups-empty">
          <p>No {title.toLowerCase()} yet.</p>
        </div>
      )}

      <div className="groups-grid">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            memberCount={memberCounts[group.id] ?? 0}
            onEdit={() => setEditingGroup(group)}
            onDelete={() => handleDelete(group)}
            onManageMembers={() => setManagingGroup(group)}
          />
        ))}
      </div>

      {formOpen && (
        <GroupFormModal kind={kind} onClose={() => setFormOpen(false)} onSaved={loadGroups} />
      )}

      {editingGroup && (
        <GroupFormModal
          kind={kind}
          group={editingGroup}
          onClose={() => setEditingGroup(null)}
          onSaved={loadGroups}
        />
      )}

      {managingGroup && (
        <GroupMembersModal
          group={managingGroup}
          onClose={() => setManagingGroup(null)}
          onChanged={loadGroups}
        />
      )}
    </div>
  )
}

export default GroupsManager
