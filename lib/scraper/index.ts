import { scrapeProfile } from './profile'
import { scrapeRecentFilms } from './films'
import { scrapeWatchlist } from './watchlist'
import { ScraperError, type LetterboxdData } from './types'

export async function scrapeLetterboxd(username: string): Promise<LetterboxdData> {
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    throw new ScraperError('USER_NOT_FOUND', 'Invalid username format')
  }

  try {
    const [profileData, recentFilms, watchlist] = await Promise.all([
      scrapeProfile(username),
      scrapeRecentFilms(username),
      scrapeWatchlist(username),
    ])

    return {
      username,
      bio: profileData.bio,
      favoriteFilms: profileData.favoriteFilms,
      recentFilms,
      watchlist,
      totalFilmsWatched: profileData.totalFilmsWatched,
      memberSince: profileData.memberSince,
    }
  } catch (error) {
    if (error instanceof ScraperError) throw error
    throw new ScraperError('SCRAPE_FAILED', String(error))
  }
}

export * from './types'
