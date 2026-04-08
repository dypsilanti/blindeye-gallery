const escapeGroqString = (value) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

const getExactValueItems = async (S, context, field, title, matcher) => {
  const client = context.getClient({apiVersion: '2021-06-07'})
  const records = await client.fetch(
    `*[_type == "photo" && defined(${field}) && ${field} != ""]{ "value": ${field} }`
  )

  const values = [...new Set(records.map((record) => record.value).filter(Boolean))]
    .filter((value) => matcher(value))
    .sort((a, b) => a.localeCompare(b))

  if (values.length === 0) {
    return S.documentList()
      .title(`${title} (No matches)`)
      .filter('_type == "photo" && false')
  }

  return S.list()
    .title(title)
    .items(
      values.map((value) => {
        const safeValue = escapeGroqString(value)

        return S.listItem()
          .title(value)
          .child(
            S.documentList()
              .title(value)
              .filter(`_type == "photo" && ${field} == "${safeValue}"`)
              .defaultOrdering([{field: 'date', direction: 'desc'}])
          )
      })
    )
}

const buildAlphaBucket = (S, context, field, title, letters) =>
  S.listItem()
    .title(title)
    .child(async () => {
      const letterSet = new Set(letters.map((letter) => letter.toLowerCase()))
      return getExactValueItems(
        S,
        context,
        field,
        title,
        (value) => letterSet.has((value[0] || '').toLowerCase())
      )
    })

const buildUnknownBucket = (S, field, title) =>
  S.listItem()
    .title(title)
    .child(
      S.documentList()
        .title(title)
        .filter(`_type == "photo" && (!defined(${field}) || ${field} == "")`)
        .defaultOrdering([{field: '_createdAt', direction: 'desc'}])
    )

const buildYearGroup = (S, context, title, matcher) =>
  S.listItem()
    .title(title)
    .child(async () => {
      const client = context.getClient({apiVersion: '2021-06-07'})
      const records = await client.fetch(
        `*[_type == "photo" && defined(year)]{ "value": year }`
      )

      const years = [...new Set(records.map((record) => record.value).filter((value) => Number.isFinite(value)))]
        .filter((year) => matcher(year))
        .sort((a, b) => b - a)

      if (years.length === 0) {
        return S.documentList()
          .title(`${title} (No matches)`)
          .filter('_type == "photo" && false')
      }

      return S.list()
        .title(title)
        .items(
          years.map((year) =>
            S.listItem()
              .title(String(year))
              .child(
                S.documentList()
                  .title(String(year))
                  .filter(`_type == "photo" && year == ${year}`)
                  .defaultOrdering([{field: 'date', direction: 'desc'}])
              )
          )
        )
    })

export const deskStructure = (S, context) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('All Photos')
        .child(
          S.documentTypeList('photo')
            .title('All Photos')
            .defaultOrdering([
              {field: 'date', direction: 'desc'},
              {field: '_createdAt', direction: 'desc'},
            ])
        ),
      S.listItem()
        .title('Featured Photos')
        .child(
          S.documentList()
            .title('Featured Photos')
            .filter('_type == "photo" && isFeatured == true')
            .defaultOrdering([
              {field: 'date', direction: 'desc'},
              {field: '_createdAt', direction: 'desc'},
            ])
        ),
      S.listItem()
        .title('Needs Metadata')
        .child(
          S.documentList()
            .title('Needs Metadata')
            .filter(
              '_type == "photo" && (!defined(band) || band == "" || !defined(venue) || venue == "" || !defined(date) || date == "")'
            )
            .defaultOrdering([{field: '_createdAt', direction: 'desc'}])
        ),
      S.listItem()
        .title('By Year')
        .child(
          S.list()
            .title('By Year')
            .items([
              buildYearGroup(S, context, '2020-2029', (year) => year >= 2020 && year <= 2029),
              buildYearGroup(S, context, '2010-2019', (year) => year >= 2010 && year <= 2019),
              buildYearGroup(S, context, '2000-2009', (year) => year >= 2000 && year <= 2009),
              buildYearGroup(S, context, 'Before 2000', (year) => year < 2000),
              buildUnknownBucket(S, 'year', 'Year Unknown'),
            ])
        ),
      S.listItem()
        .title('By Band')
        .child(
          S.list()
            .title('By Band')
            .items([
              buildAlphaBucket(S, context, 'band', 'Band A-F', ['A', 'B', 'C', 'D', 'E', 'F']),
              buildAlphaBucket(S, context, 'band', 'Band G-L', ['G', 'H', 'I', 'J', 'K', 'L']),
              buildAlphaBucket(S, context, 'band', 'Band M-R', ['M', 'N', 'O', 'P', 'Q', 'R']),
              buildAlphaBucket(S, context, 'band', 'Band S-Z', ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']),
              buildUnknownBucket(S, 'band', 'Band Unknown'),
            ])
        ),
      S.listItem()
        .title('By Venue')
        .child(
          S.list()
            .title('By Venue')
            .items([
              buildAlphaBucket(S, context, 'venue', 'Venue A-F', ['A', 'B', 'C', 'D', 'E', 'F']),
              buildAlphaBucket(S, context, 'venue', 'Venue G-L', ['G', 'H', 'I', 'J', 'K', 'L']),
              buildAlphaBucket(S, context, 'venue', 'Venue M-R', ['M', 'N', 'O', 'P', 'Q', 'R']),
              buildAlphaBucket(S, context, 'venue', 'Venue S-Z', ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']),
              buildUnknownBucket(S, 'venue', 'Venue Unknown'),
            ])
        ),
      S.divider(),
      ...S.documentTypeListItems().filter((listItem) => listItem.getId() !== 'photo'),
    ])
