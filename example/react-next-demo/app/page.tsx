'use client';

import * as SvgComs from '@yoroll/react-icon'
import { useState } from 'react'

const COLORS = ['#ffffff', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff']
const SIZES = [40, 30, 24, 16]

const iconEntries = Object.entries(SvgComs).filter(
  ([, C]) => typeof C === 'function'
) as [string, React.ComponentType<SvgComs.IconProps>][]

export default function Home() {
  const [color, setColor] = useState('#ffffff')
  const [size, setSize] = useState(30)
  const [copiedName, setCopiedName] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filteredIcons = iconEntries.filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  )

  const onClick = (name: string) => {
    const snippet = `import { ${name} } from '@yoroll/react-icon'\n\n<${name} size={${size}} color={'${color}'} />`
    navigator.clipboard.writeText(snippet)
    setCopiedName(name)
    setTimeout(() => setCopiedName(null), 1500)
  }

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      padding: '24px 32px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: 0 }}>
          Linear Game Icons
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
          Click any icon to copy the import code
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 20,
        padding: '14px 18px',
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Color Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.45)' }}>Color</span>
          {COLORS.map((c) => (
            <div
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                backgroundColor: c,
                cursor: 'pointer',
                border: color === c ? '2px solid rgba(255,255,255,0.8)' : '2px solid transparent',
                transform: color === c ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.15s ease',
              }}
            />
          ))}
        </div>

        {/* Size Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.45)' }}>Size</span>
          {SIZES.map((s) => (
            <div
              key={s}
              onClick={() => setSize(s)}
              style={{
                width: 34,
                height: 28,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                cursor: 'pointer',
                backgroundColor: size === s ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                color: size === s ? '#fff' : 'rgba(255,255,255,0.45)',
                border: size === s ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.15s ease',
              }}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="text"
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: 180,
              height: 30,
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(255,255,255,0.04)',
              color: '#fff',
              fontSize: 12,
              padding: '0 10px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 20,
        flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 8,
          backgroundColor: 'rgba(96,165,250,0.08)',
          border: '1px solid rgba(96,165,250,0.15)',
        }}>
          <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(96,165,250,0.9)' }}>@yoroll/react-icon</span>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 8,
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{iconEntries.length}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>total icons</span>
        </div>
        {search && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 8,
            backgroundColor: 'rgba(255,217,61,0.08)',
            border: '1px solid rgba(255,217,61,0.15)',
          }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#ffd93d' }}>{filteredIcons.length}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,217,61,0.6)' }}>matched</span>
          </div>
        )}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 8,
          backgroundColor: 'rgba(107,203,119,0.08)',
          border: '1px solid rgba(107,203,119,0.15)',
        }}>
          <span style={{ fontSize: 12, color: 'rgba(107,203,119,0.8)' }}>
            Also available as <span style={{ fontFamily: 'monospace' }}>@yoroll/rn-icon</span> for React Native
          </span>
        </div>
      </div>

      {/* Icon Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
        gap: 2,
      }}>
        {filteredIcons.map(([name, C], i) => {
          const isCopied = copiedName === name
          return (
            <div
              onClick={() => onClick(name)}
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 6px 10px',
                borderRadius: 8,
                cursor: 'pointer',
                border: isCopied
                  ? '1px solid rgba(107,203,119,0.3)'
                  : '1px solid transparent',
                backgroundColor: isCopied
                  ? 'rgba(107,203,119,0.06)'
                  : 'transparent',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isCopied) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isCopied) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.borderColor = 'transparent'
                }
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                backgroundColor: 'rgba(255,255,255,0.03)',
              }}>
                {C && <C size={size} color={color} />}
              </div>
              <span style={{
                fontSize: 9,
                color: isCopied ? '#6bcb77' : 'rgba(255,255,255,0.35)',
                marginTop: 8,
                textAlign: 'center',
                wordBreak: 'break-all',
                lineHeight: 1.3,
                transition: 'color 0.15s ease',
              }}>
                {isCopied ? '✓ Copied!' : name}
              </span>
            </div>
          )
        })}
      </div>
    </main>
  )
}
