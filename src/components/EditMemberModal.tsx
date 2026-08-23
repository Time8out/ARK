import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Modal from './Modal'
import Select from './Select'
import type { Member } from './MembersTable'
import './AddMemberModal.css'

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

function toDateInputValue(iso: string) {
  const d = new Date(iso)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function EditMemberModal({
  member,
  onClose,
  onUpdated,
}: {
  member: Member
  onClose: () => void
  onUpdated?: () => void
}) {
  const [fullName, setFullName] = useState(member.full_name)
  const [birthdate, setBirthdate] = useState(member.birthdate ?? '')
  const [phoneNumber, setPhoneNumber] = useState(member.phone_number ?? '')
  const [homeAddress, setHomeAddress] = useState(member.home_address ?? '')
  const [status, setStatus] = useState(member.status)
  const [dateJoined, setDateJoined] = useState(toDateInputValue(member.created_at))
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { error: updateError } = await supabase
      .from('members')
      .update({
        full_name: fullName,
        birthdate: birthdate || null,
        phone_number: phoneNumber || null,
        home_address: homeAddress || null,
        status,
        created_at: new Date(`${dateJoined}T00:00:00`).toISOString(),
      })
      .eq('id', member.id)

    setSubmitting(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    onUpdated?.()
    onClose()
  }

  return (
    <Modal title="Edit Member" onClose={onClose}>
      <form className="member-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="editFullName">
          Full Name
        </label>
        <input
          id="editFullName"
          type="text"
          placeholder="Enter full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={submitting}
        />

        <label className="field-label" htmlFor="editBirthdate">
          Birthdate
        </label>
        <input
          id="editBirthdate"
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          disabled={submitting}
        />

        <label className="field-label" htmlFor="editPhoneNumber">
          Phone Number
        </label>
        <input
          id="editPhoneNumber"
          type="tel"
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={submitting}
        />

        <label className="field-label" htmlFor="editHomeAddress">
          Home Address
        </label>
        <input
          id="editHomeAddress"
          type="text"
          placeholder="Enter home address"
          value={homeAddress}
          onChange={(e) => setHomeAddress(e.target.value)}
          disabled={submitting}
        />

        <label className="field-label" htmlFor="editDateJoined">
          Date Joined
        </label>
        <input
          id="editDateJoined"
          type="date"
          value={dateJoined}
          onChange={(e) => setDateJoined(e.target.value)}
          disabled={submitting}
        />

        <label className="field-label" htmlFor="editStatus">
          Status
        </label>
        <Select id="editStatus" value={status} onChange={setStatus} options={statusOptions} disabled={submitting} />

        {error && <p className="form-error">{error}</p>}

        <div className="member-form-actions">
          <button type="button" className="cancel-btn" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditMemberModal
