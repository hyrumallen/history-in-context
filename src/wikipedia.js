// Fetches Wikipedia lead summaries for event links, with a session-lifetime cache.
const cache = new Map()

export function titleFromLink(url) {
  const m = /^https:\/\/en\.wikipedia\.org\/wiki\/([^#?]+)/.exec(url ?? '')
  return m ? m[1] : null
}

export async function fetchSummary(link) {
  if (cache.has(link)) return cache.get(link)
  const title = titleFromLink(link)
  if (!title) {
    cache.set(link, null)
    return null
  }
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const summary = {
      extract: data.extract || null,
      thumbnailUrl: data.thumbnail?.source ?? null,
      pageUrl: data.content_urls?.desktop?.page ?? link,
    }
    cache.set(link, summary)
    return summary
  } catch {
    cache.set(link, null)
    return null
  }
}

export function _clearCache() {
  cache.clear()
}
