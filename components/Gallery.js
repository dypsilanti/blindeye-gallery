'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import styles from './Gallery.module.css'

const INITIAL_BATCH_SIZE = 24
const LOAD_MORE_BATCH_SIZE = 16

export default function Gallery({ photos }) {
  const [selected, setSelected] = useState(null)
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE)
  const loadMoreRef = useRef(null)

  const close = useCallback(() => setSelected(null), [])

  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE)
  }, [photos])

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

  useEffect(() => {
    const trigger = loadMoreRef.current

    if (!trigger || visibleCount >= photos.length) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisibleCount(photos.length)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return

        setVisibleCount((currentCount) => {
          if (currentCount >= photos.length) return currentCount
          return Math.min(currentCount + LOAD_MORE_BATCH_SIZE, photos.length)
        })
      },
      { rootMargin: '120px 0px' }
    )

    observer.observe(trigger)

    return () => observer.disconnect()
  }, [photos.length, visibleCount])

  const visiblePhotos = photos.slice(0, visibleCount)

  return (
    <>
      <div className={styles.container}>
        <div className={styles.gallery}>
          {visiblePhotos.map(photo => (
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
                sizes="(max-width: 1024px) 33vw, 25vw"
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

        {visibleCount < photos.length && (
          <div
            ref={loadMoreRef}
            className={styles.loadMoreTrigger}
            aria-hidden="true"
          />
        )}
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
