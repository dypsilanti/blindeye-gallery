'use client'

import { useState } from 'react'
import styles from './FilterMenu.module.css'

export default function FilterMenu({ label, options, selected, onSelect }) {
  const [isHovered, setIsHovered] = useState(false)
  
  const displayLabel = selected || label

  return (
    <div 
      className={styles.filterMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button type="button" className={styles.filterTrigger}>
        {displayLabel}
      </button>
      
      <div className={`${styles.filterOptions} ${isHovered ? styles.visible : ''}`}>
        <button
          type="button"
          className={`${styles.filterOption} ${!selected ? styles.active : ''}`}
          onClick={() => onSelect('')}
        >
          All {label}
        </button>
        {options.map(option => (
          <button
            key={option}
            type="button"
            className={`${styles.filterOption} ${selected === option ? styles.active : ''}`}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
