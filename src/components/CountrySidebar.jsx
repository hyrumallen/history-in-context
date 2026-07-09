import Legend from './Legend'

const CONTINENT_ORDER = ['Europe', 'Asia & Middle East', 'Africa', 'Americas']

export default function CountrySidebar({ countries, selectedIds, onChange, open, overlay = false }) {
  const groups = CONTINENT_ORDER
    .map(continent => ({ continent, items: countries.filter(c => c.continent === continent) }))
    .filter(g => g.items.length > 0)

  const toggleCountry = (id) => {
    onChange(selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id])
  }

  const toggleContinent = (items, allSelected) => {
    const ids = items.map(c => c.id)
    onChange(allSelected
      ? selectedIds.filter(id => !ids.includes(id))
      : [...selectedIds, ...ids.filter(id => !selectedIds.includes(id))])
  }

  return (
    <div className="sidebar-panel" style={overlay ? {
      position: 'fixed',
      top: 52,
      right: 0,
      bottom: 0,
      width: open ? '82%' : 0,
      maxWidth: 320,
      zIndex: 30,
      overflow: 'hidden',
      background: '#f8f3e7',
      borderLeft: open ? '1px solid #d8c9a8' : 'none',
      boxShadow: open ? '-6px 0 20px rgba(74, 58, 34, 0.25)' : 'none',
    } : {
      width: open ? 230 : 0,
      flexShrink: 0,
      overflow: 'hidden',
      background: '#f8f3e7',
      borderLeft: open ? '1px solid #d8c9a8' : 'none',
    }}>
      <div style={{
        width: overlay ? '100%' : 230,
        height: '100%',
        overflowY: 'auto',
        padding: '14px 16px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.8px',
          color: '#888',
          marginBottom: 6,
        }}>
          EVENT TYPES
        </div>
        <Legend />

        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.8px',
          color: '#888',
          margin: '16px 0 2px',
        }}>
          COUNTRIES
        </div>
        {groups.map(({ continent, items }) => {
          const selectedCount = items.filter(c => selectedIds.includes(c.id)).length
          const all = selectedCount === items.length
          const some = selectedCount > 0 && !all
          return (
            <div key={continent} style={{ marginTop: 10 }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '3px 0',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '12.5px',
                color: '#333',
              }}>
                <input
                  type="checkbox"
                  checked={all}
                  ref={el => { if (el) el.indeterminate = some }}
                  onChange={() => toggleContinent(items, all)}
                  style={{ accentColor: '#4a6fa5', margin: 0 }}
                />
                {continent}
              </label>
              <div style={{ paddingLeft: 20, borderLeft: '2px solid #e3e3e6', marginLeft: 6 }}>
                {items.map(c => (
                  <label key={c.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '3px 0',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#333',
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(c.id)}
                      onChange={() => toggleCountry(c.id)}
                      style={{ accentColor: '#4a6fa5', margin: 0 }}
                    />
                    <span style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: c.mapColor,
                      flexShrink: 0,
                      display: 'inline-block',
                    }} />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
