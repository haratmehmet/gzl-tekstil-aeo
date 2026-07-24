import React, { useState, useEffect } from 'react'

export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 250,
  className,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
  className?: string
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value !== initialValue) {
        onChange(value)
      }
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, debounce, onChange, initialValue])

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={className}
    />
  )
}
