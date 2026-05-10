import './Field.css'

export default function Field({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  options = [],
}) {
  const isSelect = type === 'select'
  const isTextarea = type === 'textarea'

  return (
    <div className="field">
      {label && (
        <label htmlFor={name}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      
      {isSelect ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={error ? 'error' : ''}
        >
          <option value="">Select {label?.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      ) : isTextarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={error ? 'error' : ''}
          rows={4}
        />
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={error ? 'error' : ''}
        />
      )}
      
      {error && <span className="error-message">{error}</span>}
    </div>
  )
}
