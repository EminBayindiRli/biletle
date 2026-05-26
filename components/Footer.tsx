export default function Footer({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{
      textAlign: 'center', padding: '20px 24px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      ...style,
    }}>
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>
        biletle,{' '}
        <a
          href="https://codeb.tech"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'rgba(129,140,248,0.6)', textDecoration: 'none', fontWeight: 500 }}
        >
          Codeb.tech
        </a>
        {' '}ürünüdür.
      </span>
    </div>
  )
}
