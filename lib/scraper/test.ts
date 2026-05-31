import { scrapeLetterboxd } from './index'

async function main() {
  const username = process.argv[2] ?? 'darrencb'
  console.log(`Scraping: ${username}`)
  try {
    const data = await scrapeLetterboxd(username)
    console.log(JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Scraper error:', err)
  }
}

main()
