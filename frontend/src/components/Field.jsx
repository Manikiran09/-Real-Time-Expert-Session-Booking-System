import React from 'react';

function Field({
  label,
  value,
  onChange,
  error,
  type = 'text',
  as = 'input',
  readOnly = false,
  disabled = false,
  placeholder = '',
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {as === 'textarea' ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          readOnly={readOnly}
          disabled={disabled}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          readOnly={readOnly}
          disabled={disabled}
          placeholder={placeholder}
        />
      )}
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
}

export default Field;
