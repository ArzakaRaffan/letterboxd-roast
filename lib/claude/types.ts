export type ClaudeError = 'CLAUDE_FAILED' | 'CLAUDE_EMPTY_RESPONSE'

export class ClaudeGenerationError extends Error {
  constructor(public code: ClaudeError, message?: string) {
    super(message ?? code)
    this.name = 'ClaudeGenerationError'
  }
}