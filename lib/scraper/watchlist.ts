import { fetchPage } from './http'

export async function scrapeWatchlist(username: string): Promise<string[]> {
  const $ = await fetchPage(`/${username}/watchlist/`)
  const titles: string[] = []

  $('li.griditem').each((_, el) => {
    if (titles.length >= 12) return false as unknown as void

    const nameEl = $(el).find('[data-item-name]').first()
    const fullName = nameEl.attr('data-item-name') ?? ''
    const title = fullName.replace(/\s*\(\d{4}\)$/, '').trim()
    if (title) titles.push(title)
  })

  return titles
}
