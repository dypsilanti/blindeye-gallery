'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import styles from './Gallery.module.css'

export default function Gallery({ photos }) {
  const [selected, setSelected] = useState(null)

  const close = useCallback(() => setSelected(null), [])

  useEffect(() => {
    if (!selected) return
    const onKey = (e) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, close])

  // Prevent background scroll while lightbox is open
  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selected])

  return (
    <>
      <div className={styles.container}>
        <div className={styles.gallery}>
          {photos.map(photo => (
            <div
              key={photo._id}
              className={styles.galleryItem}
              onClick={() => setSelected(photo)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected(photo) }}
              aria-label={`View ${photo.band}${photo.venue ? ` at ${photo.venue}` : ''}`}
            >
              <Image
                src={photo.imageUrl}
                alt={photo.altText}
                width={400}
                height={500}
                className={styles.image}
              />
              <div className={styles.overlay}>
                <h3>{photo.band}</h3>
                {photo.venue && <p>{photo.venue}</p>}
                {photo.city && <p>{photo.city}</p>}
                {photo.date && <p>{photo.date}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className={styles.lightboxBackdrop} onClick={close} aria-modal="true" role="dialog">
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={close} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div className={styles.lightboxImageWrap}>
              <Image
                src={selected.fullImageUrl || selected.imageUrl}
                alt={selected.altText}
                fill
                className={styles.lightboxImage}
                sizes="90vw"
                priority
              />
            </div>
            <div className={styles.lightboxMeta}>
              <h2>{selected.band}</h2>
              {selected.venue && <span>{selected.venue}</span>}
              {selected.city && <span>{selected.city}</span>}
              {selected.date && <span>{selected.date}</span>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
