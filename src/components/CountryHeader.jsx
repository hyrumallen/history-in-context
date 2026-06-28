export default function CountryHeader({ country }) {
  return (
    <div style={{
      background: country.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      fontSize: '12.5px',
      letterSpacing: '0.3px',
      textAlign: 'center',
      padding: '4px 8px',
      height: '100%',
      color: '#1a1a1a',
    }}>
      {country.name}
    </div>
  )
}
