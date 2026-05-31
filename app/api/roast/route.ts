import { scrapeLetterboxd } from '@/lib/scraper/index'
import { ScraperError } from '@/lib/scraper/types'
import { generateRoast } from '@/lib/claude/index'
import { ClaudeGenerationError } from '@/lib/claude/types'

// In-memory rate limiting — best-effort on serverless (resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }
  entry.count++
  return true
}

const usernameCooldownMap = new Map<string, number>()
const USERNAME_COOLDOWN_MS = 60 * 1000

const headers = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
}

function err(status: number, message: string): Response {
  return Response.json({ success: false, error: message }, { status, headers })
}

export async function POST(request: Request): Promise<Response> {
  // Step 1: Parse and validate
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return err(400, 'Please enter a valid Letterboxd username.')
  }
  if (!body || typeof body !== 'object' || !('username' in body)) {
    return err(400, 'Please enter a valid Letterboxd username.')
  }
  const rawUsername = (body as Record<string, unknown>).username
  if (typeof rawUsername !== 'string' || !rawUsername.trim()) {
    return err(400, 'Please enter a valid Letterboxd username.')
  }
  const username = rawUsername.trim()
  if (username.length > 30) {
    return err(400, 'Please enter a valid Letterboxd username.')
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return err(400, 'Please enter a valid Letterboxd username.')
  }

  // Step 2: Rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  if (!checkRateLimit(ip)) {
    return err(429, 'Too many requests. Please wait a few minutes before trying again.')
  }
  const usernameLower = username.toLowerCase()
  const lastRoasted = usernameCooldownMap.get(usernameLower)
  if (lastRoasted && Date.now() - lastRoasted < USERNAME_COOLDOWN_MS) {
    return err(429, 'This profile was just roasted. Wait 1 minute before roasting again.')
  }

  // Step 3: Scrape
  let data
  try {
    data = await scrapeLetterboxd(username)
  } catch (error) {
    if (error instanceof ScraperError) {
      if (error.code === 'USER_NOT_FOUND') {
        return err(404, 'Could not find that Letterboxd profile. Check the username and try again.')
      }
      if (error.code === 'PRIVATE_PROFILE') {
        return err(403, 'This Letterboxd profile is private.')
      }
    }
    return err(502, 'Failed to fetch Letterboxd data. Try again in a moment.')
  }

  // Step 4: Generate roast
  let roast
  try {
    roast = await generateRoast(data)
  } catch (error) {
    if (error instanceof ClaudeGenerationError) {
      if (error.code === 'CLAUDE_EMPTY_RESPONSE') {
        return err(500, 'AI returned an empty response. Try again.')
      }
    }
    return err(500, 'Failed to generate roast. Try again.')
  }

  // Step 5: Success — set cooldown and return
  usernameCooldownMap.set(usernameLower, Date.now())
  return Response.json(
    { success: true, roast, username },
    { status: 200, headers }
  )
}