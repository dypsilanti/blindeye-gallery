'use client'

import { useState } from 'react'
import styles from './FilterMenu.module.css'

export default function FilterMenu({ label, options, selected, onSelect, alignLeft = false, dropdownAlign = 'center' }) {
  const [isHovered, setIsHovered] = useState(false)
  const normalizedOptions = options.map((option) => {
    if (typeof option === 'string') {
      return { value: option, label: option }
    }

    return {
      value: option?.value ?? '',
      label: option?.label ?? option?.value ?? '',
    }
  })
  const useColumns = normalizedOptions.length > 12
  const columnSplitIndex = Math.ceil(normalizedOptions.length / 2)
  const firstColumnOptions = normalizedOptions.slice(0, columnSplitIndex)
  const secondColumnOptions = normalizedOptions.slice(columnSplitIndex)

  const selectedOption = normalizedOptions.find((option) => option.value === selected)
  const displayLabel = selectedOption?.label || selected || label
  const allLabel = label.endsWith('y') ? `${label.slice(0, -1)}ies` : `${label}s`

  const renderOption = (option) => (
    <button
      key={option.value}
      type="button"
      className={`${styles.filterOption} ${alignLeft ? styles.leftAligned : ''} ${selected === option.value ? styles.active : ''}`}
      onClick={() => onSelect(option.value)}
    >
      {option.label}
    </button>
  )

  return (
    <div 
      className={`${styles.filterMenu} ${styles[`align${dropdownAlign[0].toUpperCase()}${dropdownAlign.slice(1)}`]}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        className={styles.filterTrigger}
      >
        {displayLabel}
      </button>
      
      <div className={`${styles.filterOptions} ${useColumns ? styles.columns : ''} ${isHovered ? styles.visible : ''}`}>
        <button
          type="button"
          className={`${styles.filterOption} ${alignLeft ? styles.leftAligned : ''} ${!selected ? styles.active : ''}`}
          onClick={() => onSelect('')}
        >
          All {allLabel}
        </button>
        {useColumns ? (
          <div className={styles.columnsGrid}>
            <div className={styles.column}>{firstColumnOptions.map(renderOption)}</div>
            <div className={styles.column}>{secondColumnOptions.map(renderOption)}</div>
          </div>
        ) : (
          normalizedOptions.map(renderOption)
        )}
      </div>
    </div>
  )
}
