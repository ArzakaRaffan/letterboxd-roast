import { fetchPage } from './http'
import { ScraperError } from './types'

export async function scrapeProfile(username: string): Promise<{
  bio: string | null
  favoriteFilms: string[]
  totalFilmsWatched: string | null
  memberSince: string | null
}> {
  const $ = await fetchPage(`/${username}/`)

  // Private profile detection
  const bodyText = $('body').text().toLowerCase()
  if (
    bodyText.includes('this profile is private') ||
    bodyText.includes("this account's content is private") ||
    $('[data-js-trigger="private"]').length > 0
  ) {
    throw new ScraperError('PRIVATE_PROFILE')
  }

  // og:description contains: "X films watched. Favorites: A (year), B (year). Bio: ..."
  const ogDesc = $('meta[property="og:description"]').attr('content') ?? ''

  // Total films watched
  let totalFilmsWatched: string | null = null
  const filmsMatch = ogDesc.match(/([\d,]+)\s+films?\s+watched/i)
  if (filmsMatch) totalFilmsWatched = filmsMatch[1]

  // Fallback: from .profile-statistic elements
  if (!totalFilmsWatched) {
    $('h4.profile-statistic, .profile-statistic').each((_, el) => {
      const label = $(el).find('.definition, .label').text().trim().toLowerCase()
      if (label === 'films') {
        const val = $(el).find('.value').text().trim()
        if (val) totalFilmsWatched = val
      }
    })
  }

  // Favorite films: from LazyPoster components in the .favourites section
  const favoriteFilms: string[] = []
  $('.favourites [data-item-name], section.favourites [data-item-name]').each((_, el) => {
    if (favoriteFilms.length >= 4) return false as unknown as void
    const raw = $(el).attr('data-item-name') ?? ''
    const title = raw.replace(/\s*\(\d{4}\)$/, '').trim()
    if (title) favoriteFilms.push(title)
  })

  // Fallback: parse from og:description "Favorites: A, B, C."
  if (favoriteFilms.length === 0) {
    const favsMatch = ogDesc.match(/Favorites:\s*(.+?)(?:\.\s*Bio:|$)/i)
    if (favsMatch) {
      const raw = favsMatch[1].trim()
      // Split carefully: films end with "(YEAR)" so use that as delimiter
      const entries = raw.split(/,\s*(?=[A-ZÀ-ɏ"'Le\s])/)
      for (const entry of entries.slice(0, 4)) {
        const title = entry.trim().replace(/\s*\(\d{4}\)$/, '').trim()
        if (title) favoriteFilms.push(title)
      }
    }
  }

  // Bio: from .profile-person-bio section (plain text, strip HTML)
  let bio: string | null = null
  const bioEl = $('.profile-person-bio .collapsed-text')
  if (bioEl.length) {
    const rawBio = bioEl.text().trim()
    if (rawBio) bio = rawBio
  }
  if (!bio) {
    // Fallback: from og:description after "Bio: "
    const bioMatch = ogDesc.match(/\.\s*Bio:\s*(.+)$/i)
    if (bioMatch) bio = bioMatch[1].trim() || null
  }

  // Member since: search the full page HTML for "member since [word] [year]"
  // This text is often inside a meta content attribute or bio text
  let memberSince: string | null = null
  const fullHtml = $.html()
  const memberMatch = fullHtml.match(/[Mm]ember\s+since\s+(?:\w+\s+)?(\d{4})/i)
  if (memberMatch) memberSince = memberMatch[1]

  return { bio, favoriteFilms, totalFilmsWatched, memberSince }
}
