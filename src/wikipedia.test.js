import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { titleFromLink, fetchSummary, _clearCache } from './wikipedia'

describe('titleFromLink', () => {
  it('extracts a plain title', () => {
    expect(titleFromLink('https://en.wikipedia.org/wiki/Battle_of_Waterloo')).toBe('Battle_of_Waterloo')
  })
  it('keeps percent-encoding intact', () => {
    expect(titleFromLink('https://en.wikipedia.org/wiki/Treaty_of_K%C3%BC%C3%A7%C3%BCk_Kaynarca'))
      .toBe('Treaty_of_K%C3%BC%C3%A7%C3%BCk_Kaynarca')
  })
  it('handles parenthesized titles', () => {
    expect(titleFromLink('https://en.wikipedia.org/wiki/Battle_of_Narva_(1700)')).toBe('Battle_of_Narva_(1700)')
  })
  it('strips fragments and query strings', () => {
    expect(titleFromLink('https://en.wikipedia.org/wiki/Napoleon#Legacy')).toBe('Napoleon')
    expect(titleFromLink('https://en.wikipedia.org/wiki/Napoleon?x=1')).toBe('Napoleon')
  })
  it('returns null for non-Wikipedia or missing URLs', () => {
    expect(titleFromLink('https://example.com/wiki/Foo')).toBe(null)
    expect(titleFromLink(undefined)).toBe(null)
  })
})

describe('fetchSummary', () => {
  beforeEach(() => _clearCache())
  afterEach(() => vi.unstubAllGlobals())

  const okResponse = (body) => ({ ok: true, json: async () => body })

  it('maps the API response to extract/thumbnailUrl/pageUrl', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({
      extract: 'The Battle of Waterloo was fought on 18 June 1815.',
      thumbnail: { source: 'https://upload.wikimedia.org/thumb.jpg' },
      content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Battle_of_Waterloo' } },
    }))
    vi.stubGlobal('fetch', fetchMock)
    const s = await fetchSummary('https://en.wikipedia.org/wiki/Battle_of_Waterloo')
    expect(s).toEqual({
      extract: 'The Battle of Waterloo was fought on 18 June 1815.',
      thumbnailUrl: 'https://upload.wikimedia.org/thumb.jpg',
      pageUrl: 'https://en.wikipedia.org/wiki/Battle_of_Waterloo',
    })
    expect(fetchMock).toHaveBeenCalledWith('https://en.wikipedia.org/api/rest_v1/page/summary/Battle_of_Waterloo')
  })
  it('returns null on non-OK response and caches the failure', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404 })
    vi.stubGlobal('fetch', fetchMock)
    expect(await fetchSummary('https://en.wikipedia.org/wiki/Gone')).toBe(null)
    expect(await fetchSummary('https://en.wikipedia.org/wiki/Gone')).toBe(null)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it('returns null when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    expect(await fetchSummary('https://en.wikipedia.org/wiki/Napoleon')).toBe(null)
  })
  it('returns null for a malformed link without fetching', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect(await fetchSummary('https://example.com/nope')).toBe(null)
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it('serves the second call from cache', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ extract: 'x', content_urls: { desktop: { page: 'p' } } }))
    vi.stubGlobal('fetch', fetchMock)
    await fetchSummary('https://en.wikipedia.org/wiki/Sputnik_1')
    await fetchSummary('https://en.wikipedia.org/wiki/Sputnik_1')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
