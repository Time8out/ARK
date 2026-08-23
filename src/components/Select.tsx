import { useEffect, useRef, useState } from 'react'
import { ChevronDownIcon } from './icons'
import './Select.css'

export type SelectOption = { value: string; label: string }

function Select({
  id,
  value,
  onChange,
  options,
  disabled,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const selected = options.find((o) => o.value === value)

  return (
    <div className="custom-select" ref={wrapperRef}>
      <button
        type="button"
        id={id}
        className={`custom-select-trigger ${open ? 'open' : ''}`}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{selected?.label}</span>
        <ChevronDownIcon />
      </button>

      {open && (
        <div className="custom-select-menu">
          {options.map((opt) => (
            <button
              type="button"
              key={opt.value}
              className={`custom-select-option ${opt.value === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Select
