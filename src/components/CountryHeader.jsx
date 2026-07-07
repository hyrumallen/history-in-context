import { getEraName } from '../eras'
import { SERIF } from '../constants'

export default function CountryHeader({ country, year }) {
  const era = getEraName(country, year)
  return (
    <div style={{
      fontFamily: SERIF,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '4px 8px',
      height: '100%',
    }}>
      <span style={{ fontSize: '14px', color: '#4a3a22', letterSpacing: '0.5px', fontWeight: 600 }}>
        {era}
      </span>
      {era !== country.name && (
        <span style={{
          fontSize: '8.5px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: '#a08c62',
          marginTop: '1px',
        }}>
          {country.name}
        </span>
      )}
    </div>
  )
}
