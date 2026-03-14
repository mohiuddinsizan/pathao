import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn() utility', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'extra')).toBe('base extra')
  })

  it('resolves Tailwind conflicts (last wins)', () => {
    const result = cn('px-4', 'px-8')
    expect(result).toBe('px-8')
  })

  it('handles empty / undefined inputs', () => {
    expect(cn()).toBe('')
    expect(cn(undefined, null, '')).toBe('')
  })
})
