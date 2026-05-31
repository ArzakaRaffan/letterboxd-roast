import type { LetterboxdData } from '../scraper/types'
import { ClaudeGenerationError } from './types'
import { buildPrompt } from './prompt'

export async function generateRoast(data: LetterboxdData): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new ClaudeGenerationError('CLAUDE_FAILED', 'ANTHROPIC_API_KEY is not set')
  }

  const prompt = buildPrompt(data)
  let lastError: unknown

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          temperature: 1.0,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        const msg = (err as { error?: { message?: string } }).error?.message ?? `HTTP ${response.status}`
        const isTransient = response.status === 429 || response.status === 503 || response.status === 529
        if (!isTransient || attempt === 3) {
          throw new ClaudeGenerationError('CLAUDE_FAILED', msg)
        }
        lastError = new Error(msg)
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt))
        continue
      }

      const data = await response.json()
      const text = data.content?.[0]?.text?.trim()
      if (!text) throw new ClaudeGenerationError('CLAUDE_EMPTY_RESPONSE')
      return text
    } catch (error) {
      if (error instanceof ClaudeGenerationError) throw error
      lastError = error
      const msg = error instanceof Error ? error.message : ''
      const isTransient = /429|503|529|overloaded|rate limit/i.test(msg)
      if (!isTransient || attempt === 3) break
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt))
    }
  }

  const msg = lastError instanceof Error ? lastError.message : String(lastError)
  throw new ClaudeGenerationError('CLAUDE_FAILED', msg)
}