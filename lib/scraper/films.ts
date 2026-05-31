import { fetchPage } from './http'
import type { RecentFilm } from './types'

export async function scrapeRecentFilms(username: string): Promise<RecentFilm[]> {
  const $ = await fetchPage(`/${username}/films/`)
  const films: RecentFilm[] = []

  // Each film is a li.griditem containing a LazyPoster react-component
  // and a p.poster-viewingdata that holds the rating span
  $('li.griditem').each((_, el) => {
    if (films.length >= 12) return false as unknown as void

    // Title + year from data-item-name attribute on the LazyPoster div
    const nameEl = $(el).find('[data-item-name]').first()
    const fullName = nameEl.attr('data-item-name') ?? ''
    if (!fullName.trim()) return

    const yearMatch = fullName.match(/\((\d{4})\)$/)
    const year = yearMatch ? yearMatch[1] : null
    const title = fullName.replace(/\s*\(\d{4}\)$/, '').trim()

    // Rating from span.rating with class rated-N (1-10 scale → divide by 2)
    const ratingEl = $(el).find('.rating')
    const ratingClass = ratingEl.attr('class') ?? ''
    const ratedMatch = ratingClass.match(/\brated-(\d+)\b/)
    const rating = ratedMatch ? parseInt(ratedMatch[1], 10) / 2 : null

    films.push({ title, rating, year })
  })

  return films
}
