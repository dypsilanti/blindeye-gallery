export default {
  name: 'photo',
  title: 'Photo',
  type: 'document',
  orderings: [
    {
      title: 'Date, Newest',
      name: 'dateDesc',
      by: [
        {field: 'date', direction: 'desc'},
        {field: '_createdAt', direction: 'desc'},
      ],
    },
    {
      title: 'Date, Oldest',
      name: 'dateAsc',
      by: [
        {field: 'date', direction: 'asc'},
        {field: '_createdAt', direction: 'asc'},
      ],
    },
  ],
  fields: [
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
    },
    {
      name: 'band',
      title: 'Band',
      type: 'string',
    },
    {
      name: 'eventName',
      title: 'Event Name',
      type: 'string',
      description: 'Optional show/event label (e.g. "Dog Days Fest 2025")',
    },
    {
      name: 'venue',
      title: 'Venue',
      type: 'string',
    },
    {
      name: 'city',
      title: 'City',
      type: 'string',
    },
    {
      name: 'date',
      title: 'Date (Year or Full Date)',
      type: 'string',
      description: 'Use YYYY when only the year is known, or YYYY-MM-DD for a full date.',
      validation: (rule) =>
        rule.regex(/^(\d{4}|\d{4}-\d{2}-\d{2})$/, {
          name: 'year-or-date',
          invert: false,
        }),
    },
    {
      name: 'year',
      title: 'Year',
      type: 'number',
      description: 'Optional year to help with quick backend organization',
      validation: (rule) => rule.integer().min(1900).max(2100),
    },
    {
      name: 'filename',
      title: 'Filename',
      type: 'string',
      description: 'Original imported filename for easier tracing',
    },
    {
      name: 'sourceFolder',
      title: 'Source Folder',
      type: 'string',
      description: 'Folder path or import batch label',
    },
    {
      name: 'isFeatured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    },
    {
      name: 'notes',
      title: 'Internal Notes',
      type: 'text',
      rows: 3,
    },
  ],
  preview: {
    select: {
      band: 'band',
      venue: 'venue',
      city: 'city',
      date: 'date',
      filename: 'filename',
      media: 'image',
    },
    prepare(selection) {
      const {band, venue, city, date, filename, media} = selection
      const titleParts = [band || 'Untitled Photo', date || 'No date']
      const subtitleParts = [venue, city, filename].filter(Boolean)

      return {
        title: titleParts.join(' - '),
        subtitle: subtitleParts.join(' | '),
        media,
      }
    },
  },
}
