import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Modal from './Modal'
import type { Group, GroupKind } from './GroupsManager'
import './AddMemberModal.css'

const kindLabel: Record<GroupKind, string> = { group: 'Group', ministry: 'Ministry' }

function GroupFormModal({
  kind,
  group,
  onClose,
  onSaved,
}: {
  kind: GroupKind
  group?: Group
  onClose: () => void
  onSaved?: () => void
}) {
  const [name, setName] = useState(group?.name ?? '')
  const [description, setDescription] = useState(group?.description ?? '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isEditing = !!group

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { error: saveError } = isEditing
      ? await supabase
          .from('groups')
          .update({ name, description: description || null })
          .eq('id', group.id)
      : await supabase.from('groups').insert({ kind, name, description: description || null })

    setSubmitting(false)

    if (saveError) {
      setError(saveError.message)
      return
    }

    onSaved?.()
    onClose()
  }

  return (
    <Modal title={isEditing ? `Edit ${kindLabel[kind]}` : `Add New ${kindLabel[kind]}`} onClose={onClose}>
      <form className="member-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="groupName">
          Name
        </label>
        <input
          id="groupName"
          type="text"
          placeholder={`Enter ${kindLabel[kind].toLowerCase()} name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={submitting}
        />

        <label className="field-label" htmlFor="groupDescription">
          Description
        </label>
        <input
          id="groupDescription"
          type="text"
          placeholder="What is this for? (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={submitting}
        />

        {error && <p className="form-error">{error}</p>}

        <div className="member-form-actions">
          <button type="button" className="cancel-btn" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Saving…' : isEditing ? 'Save Changes' : `Add ${kindLabel[kind]}`}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default GroupFormModal
