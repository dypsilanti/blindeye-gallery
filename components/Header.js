import FilterMenu from './FilterMenu'
import styles from './Header.module.css'

export default function Header({ filters, onFilterChange, bands, venues, years, sortOrder, onSortChange }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" stroke="black" strokeWidth="3" className={styles.icon}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        blindeye.photo
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

      <div className={styles.sortGroup}>
        {/* Newest — arrow pointing up */}
        <button
          className={`${styles.sortButton} ${sortOrder === 'newest' ? styles.sortActive : ''}`}
          onClick={() => onSortChange('newest')}
          title="Newest first"
          aria-label="Sort newest first"
          aria-pressed={sortOrder === 'newest'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"/>
            <polyline points="5 12 12 5 19 12"/>
          </svg>
          Newest
        </button>

        {/* Oldest — arrow pointing down */}
        <button
          className={`${styles.sortButton} ${sortOrder === 'oldest' ? styles.sortActive : ''}`}
          onClick={() => onSortChange('oldest')}
          title="Oldest first"
          aria-label="Sort oldest first"
          aria-pressed={sortOrder === 'oldest'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <polyline points="19 12 12 19 5 12"/>
          </svg>
          Oldest
        </button>

        {/* Shuffle — dice */}
        <button
          className={`${styles.sortButton} ${sortOrder === 'shuffle' ? styles.sortActive : ''}`}
          onClick={() => onSortChange('shuffle')}
          title="Shuffle photos"
          aria-label="Shuffle photos"
          aria-pressed={sortOrder === 'shuffle'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="3" ry="3"/>
            <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none"/>
            <circle cx="16.5" cy="7.5" r="1.2" fill="currentColor" stroke="none"/>
            <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>
            <circle cx="7.5" cy="16.5" r="1.2" fill="currentColor" stroke="none"/>
            <circle cx="16.5" cy="16.5" r="1.2" fill="currentColor" stroke="none"/>
          </svg>
          Shuffle
        </button>
      </div>
    </header>
  )
}
