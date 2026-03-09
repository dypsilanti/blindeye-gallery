import Image from 'next/image'
import styles from './Gallery.module.css'

export default function Gallery({ photos }) {
  return (
    <div className={styles.container}>
      <div className={styles.gallery}>
        {photos.map(photo => (
          <div key={photo.id} className={styles.galleryItem}>
            <Image
              src={photo.src}
              alt={photo.alt}
              width={400}
              height={500}
              className={styles.image}
            />
            <div className={styles.overlay}>
              <h3>{photo.title}</h3>
              <p>{photo.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
