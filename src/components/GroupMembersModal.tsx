import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Member } from './MembersTable'
import type { Group } from './GroupsManager'
import { PlusIcon, SearchIcon } from './icons'
import Modal from './Modal'
import './AddMemberModal.css'
import './GroupMembersModal.css'

type MemberRow = Pick<Member, 'id' | 'full_name' | 'phone_number' | 'status'>

function GroupMembersModal({
  group,
  onClose,
  onChanged,
}: {
  group: Group
  onClose: () => void
  onChanged?: () => void
}) {
  const [currentMembers, setCurrentMembers] = useState<MemberRow[]>([])
  const [availableMembers, setAvailableMembers] = useState<MemberRow[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const loadCurrentMembers = useCallback(async () => {
    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('group_members')
      .select('members(id, full_name, phone_number, status)')
      .eq('group_id', group.id)

    setLoading(false)

    if (fetchError) {
      setError(fetchError.message)
      return
    }

    const members = ((data ?? []) as unknown as { members: MemberRow }[])
      .map((row) => row.members)
      .filter(Boolean)
    setCurrentMembers(members)
  }, [group.id])

  useEffect(() => {
    loadCurrentMembers()
  }, [loadCurrentMembers])

  useEffect(() => {
    let cancelled = false

    async function loadAvailable() {
      const currentIds = currentMembers.map((m) => m.id)

      let query = supabase.from('members').select('id, full_name, phone_number, status').limit(10)
      if (currentIds.length > 0) query = query.not('id', 'in', `(${currentIds.join(',')})`)
      if (debouncedSearch) query = query.ilike('full_name', `%${debouncedSearch}%`)
      query = query.order('full_name', { ascending: true })

      const { data, error: fetchError } = await query
      if (cancelled) return

      if (fetchError) {
        setError(fetchError.message)
        return
      }
      setAvailableMembers((data as MemberRow[]) ?? [])
    }

    loadAvailable()
    return () => {
      cancelled = true
    }
  }, [currentMembers, debouncedSearch])

  async function handleAdd(memberId: string) {
    setBusyId(memberId)
    const { error: insertError } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, member_id: memberId })

    setBusyId(null)

    if (insertError) {
      setError(insertError.message)
      return
    }

    await loadCurrentMembers()
    onChanged?.()
  }

  async function handleRemove(memberId: string) {
    setBusyId(memberId)
    const { error: deleteError } = await supabase
      .from('group_members')
      .delete()
      .match({ group_id: group.id, member_id: memberId })

    setBusyId(null)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    await loadCurrentMembers()
    onChanged?.()
  }

  return (
    <Modal title={`Manage Members — ${group.name}`} onClose={onClose} wide>
      <div className="group-members-modal">
        {error && <p className="form-error">{error}</p>}

        <div className="group-members-section">
          <h3>
            Current Members {!loading && <span className="count-pill">{currentMembers.length}</span>}
          </h3>
          <div className="group-members-list">
            {!loading && currentMembers.length === 0 && (
              <p className="group-members-empty">No members added yet.</p>
            )}
            {currentMembers.map((m) => (
              <div className="group-member-row" key={m.id}>
                <span className="group-member-avatar">{m.full_name.charAt(0).toUpperCase()}</span>
                <div className="group-member-info">
                  <span className="group-member-name">{m.full_name}</span>
                  {m.phone_number && <span className="group-member-phone">{m.phone_number}</span>}
                </div>
                <button
                  type="button"
                  className="remove-member-btn"
                  onClick={() => handleRemove(m.id)}
                  disabled={busyId === m.id}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="group-members-section">
          <h3>Add Members</h3>
          <div className="group-members-search">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search members to add..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="group-members-list">
            {availableMembers.length === 0 && (
              <p className="group-members-empty">No matching members.</p>
            )}
            {availableMembers.map((m) => (
              <div className="group-member-row" key={m.id}>
                <span className="group-member-avatar">{m.full_name.charAt(0).toUpperCase()}</span>
                <div className="group-member-info">
                  <span className="group-member-name">{m.full_name}</span>
                  {m.phone_number && <span className="group-member-phone">{m.phone_number}</span>}
                </div>
                <button
                  type="button"
                  className="add-member-row-btn"
                  onClick={() => handleAdd(m.id)}
                  disabled={busyId === m.id}
                >
                  <PlusIcon /> Add
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="member-form-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default GroupMembersModal
