import Image from 'next/image'
import styles from './Gallery.module.css'

export default function Gallery({ photos }) {
  return (
    <div className={styles.container}>
      <div className={styles.gallery}>
        {photos.map(photo => (
          <div key={photo._id} className={styles.galleryItem}>
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
  )
}
