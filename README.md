# Photo Portfolio - Next.js

A modern photo portfolio site built with Next.js 14, featuring a responsive grid layout and interactive filtering system.

## Features

- ✨ **Next.js 14 App Router** - Modern React framework with server components
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
