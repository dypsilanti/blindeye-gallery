import FilterMenu from './FilterMenu'
import styles from './Header.module.css'

export default function Header({ filters, onFilterChange, bands, venues, years }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" stroke="black" strokeWidth="3" className={styles.icon}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        blindeye.fl
      </h1>
      
      <div className={styles.filters}>
        <FilterMenu
          label="Band"
          options={bands}
          selected={filters.band}
          onSelect={(value) => onFilterChange('band', value)}
        />
        <FilterMenu
          label="Venue"
          options={venues}
          selected={filters.venue}
          onSelect={(value) => onFilterChange('venue', value)}
        />
        <FilterMenu
          label="Year"
          options={years}
          selected={filters.year}
          onSelect={(value) => onFilterChange('year', value)}
        />
      </div>
    </header>
  )
}
