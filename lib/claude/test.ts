import { scrapeLetterboxd } from '../scraper/index'
import { generateRoast } from './index'

async function main() {
  const username = process.argv[2] ?? 'darrencb'
  console.log(`Scraping ${username}...`)
  const data = await scrapeLetterboxd(username)
  console.log('Scraped data:', JSON.stringify(data, null, 2))
  console.log('\nGenerating roast...')
  const roast = await generateRoast(data)
  console.log('\n=== ROAST ===\n')
  console.log(roast)
  console.log('\n=============')
}

main().catch(console.error)
