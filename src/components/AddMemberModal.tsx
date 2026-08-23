import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Modal from './Modal'
import Select from './Select'
import './AddMemberModal.css'

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

function AddMemberModal({ onClose, onAdded }: { onClose: () => void; onAdded?: () => void }) {
  const [fullName, setFullName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [homeAddress, setHomeAddress] = useState('')
  const [status, setStatus] = useState('active')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { error: insertError } = await supabase.from('members').insert({
      full_name: fullName,
      birthdate: birthdate || null,
      phone_number: phoneNumber || null,
      home_address: homeAddress || null,
      status,
    })

    setSubmitting(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    onAdded?.()
    onClose()
  }

  return (
    <Modal title="Add New Member" onClose={onClose}>
      <form className="member-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="fullName">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          placeholder="Enter full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={submitting}
        />

        <label className="field-label" htmlFor="birthdate">
          Birthdate
        </label>
        <input
          id="birthdate"
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          disabled={submitting}
        />

        <label className="field-label" htmlFor="phoneNumber">
          Phone Number
        </label>
        <input
          id="phoneNumber"
          type="tel"
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={submitting}
        />

        <label className="field-label" htmlFor="homeAddress">
          Home Address
        </label>
        <input
          id="homeAddress"
          type="text"
          placeholder="Enter home address"
          value={homeAddress}
          onChange={(e) => setHomeAddress(e.target.value)}
          disabled={submitting}
        />

        <label className="field-label" htmlFor="status">
          Status
        </label>
        <Select id="status" value={status} onChange={setStatus} options={statusOptions} disabled={submitting} />

        {error && <p className="form-error">{error}</p>}

        <div className="member-form-actions">
          <button type="button" className="cancel-btn" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Member'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddMemberModal
