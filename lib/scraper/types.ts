export type RecentFilm = {
  title: string
  rating: number | null
  year: string | null
}

export type LetterboxdData = {
  username: string
  bio: string | null
  favoriteFilms: string[]
  recentFilms: RecentFilm[]
  watchlist: string[]
  totalFilmsWatched: string | null
  memberSince: string | null
}

export type ScraperErrorCode =
  | 'USER_NOT_FOUND'
  | 'PRIVATE_PROFILE'
  | 'SCRAPE_FAILED'

export class ScraperError extends Error {
  constructor(public code: ScraperErrorCode, message?: string) {
    super(message ?? code)
    this.name = 'ScraperError'
  }
}
