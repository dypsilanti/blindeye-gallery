# Photo Portfolio - Next.js

A modern photo portfolio site built with Next.js 14, featuring a responsive grid layout and interactive filtering system.

## Features

- ✨ **Next.js 14 App Router** - Modern React framework with server components
- 🧰 **Embedded Sanity Studio** - Manage portfolio content at `/studio`
- 🎨 **CSS Modules** - Scoped styling for each component
- 🔍 **Dynamic Filtering** - Filter photos by band, venue, and year
- 📱 **Fully Responsive** - Adapts to all screen sizes
- 🎭 **Hover Animations** - Smooth menu transitions and image overlays
- 🖼️ **Optimized Images** - Next.js Image component for performance

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Embedded Sanity Studio

1. Add these values in `.env.local`:
	- `NEXT_PUBLIC_SANITY_PROJECT_ID`
	- `NEXT_PUBLIC_SANITY_DATASET`
	- `NEXT_PUBLIC_SANITY_API_VERSION`
2. Run the app and open [http://localhost:3000/studio](http://localhost:3000/studio)

You can also run the Studio directly with:

```bash
npm run studio
```

### Bulk Upload Photos to Sanity

Use this command to upload a whole folder of images and create `photo` documents:

```bash
npm run import:photos -- ./uploads
```

Optional metadata file:

```bash
npm run import:photos -- ./uploads ./uploads/metadata.json
```

Metadata JSON format (key by filename or filename without extension):

```json
{
	"my-photo.jpg": {
		"band": "The National",
		"venue": "Red Rocks",
		"city": "Morrison",
		"date": "2026-03-11"
	}
}
```

Required env var for imports:
- `SANITY_API_TOKEN` (write-capable token)

Filename fallback format (when no metadata is provided):
- `band--venue--city--YYYY-MM-DD.jpg`

### Bulk Update Photo Fields

Preview a bulk update without changing data:

```bash
npm run bulk:update:photos -- --where band=adhesive --set venue=Curleys --set city=Buffalo --dry-run
```

If your imported values include filenames (e.g. `adhesive-09412`), use partial matching:

```bash
npm run bulk:update:photos -- --where-contains band=adhesive --set band=Adhesive --set venue=Curleys --set city=Buffalo --dry-run
```

Apply the update:

```bash
npm run bulk:update:photos -- --where band=adhesive --set venue=Curleys --set city=Buffalo
```

Supported fields for `--where` and `--set`:
- `band`
- `venue`
- `city`
- `date`

`--where-contains` supports the same fields.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
.
├── app/
│   ├── layout.js          # Root layout with font configuration
│   ├── page.js            # Main page with filtering logic
│   └── studio/            # Embedded Sanity Studio route
│   └── globals.css        # Global styles
├── components/
│   ├── Header.js          # Site header with logo and filters
│   ├── Header.module.css
│   ├── FilterMenu.js      # Popover filter dropdown component
│   ├── FilterMenu.module.css
│   ├── Gallery.js         # Photo grid component
│   ├── Gallery.module.css
│   ├── Footer.js          # Site footer
│   └── Footer.module.css
├── data/
│   └── photos.js          # Photo data and filter options
├── sanity/
│   └── schemaTypes/       # Sanity schema definitions
├── sanity.config.js
├── sanity.cli.js
├── package.json
├── next.config.js
└── jsconfig.json
```

## Customization

### Adding Photos

Edit `data/photos.js` to add or modify photos. Each photo needs:
- `id`: Unique identifier
- `src`: Image URL
- `alt`: Alt text
- `title`: Display title
- `subtitle`: Description
- `band`, `venue`, `year`: Filter attributes

### Styling

All components use CSS Modules for scoped styling:
- Edit `.module.css` files to modify component styles
- Adjust `app/globals.css` for site-wide styles
- Font is configured in `app/layout.js`

## Technologies

- **Next.js 14** - React framework
- **React 18** - UI library
- **CSS Modules** - Component styling
- **Google Fonts (Outfit)** - Typography

## License

© 2026 Visual Stories. All rights reserved.
