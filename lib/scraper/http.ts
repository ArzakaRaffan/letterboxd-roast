import axios from 'axios'
import * as cheerio from 'cheerio'
import type { CheerioAPI } from 'cheerio'
import { ScraperError } from './types'

const client = axios.create({
  baseURL: 'https://letterboxd.com',
  timeout: 10000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  },
  maxRedirects: 5,
})

export async function fetchPage(path: string): Promise<CheerioAPI> {
  try {
    const response = await client.get<string>(path)
    return cheerio.load(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new ScraperError('USER_NOT_FOUND')
      }
      throw new ScraperError('SCRAPE_FAILED', error.message)
    }
    throw new ScraperError('SCRAPE_FAILED', String(error))
  }
}
