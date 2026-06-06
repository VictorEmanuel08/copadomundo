import { useId } from 'react'
import { cn } from '@/lib/utils'

export type KitPattern =
  | 'solid' | 'stripes' | 'thin-stripes' | 'hoops' | 'sash'
  | 'halves' | 'quarters' | 'checkered' | 'chevron' | 'sleeves'
  | 'panel' | 'gradient-v'
export type CollarType = 'round' | 'v' | 'polo'

interface KitPreviewProps {
  primaryColor: string
  secondaryColor: string
  tertiaryColor: string
  pattern: KitPattern
  collar: CollarType
  numberColor: string
  number?: string
  playerName?: string
  playerNameColor?: string
  size?: 'sm' | 'md' | 'lg'
}

function ShirtSvg({
  primary, secondary, tertiary,
  pattern, collar, numberColor, number,
  playerName, playerNameColor,
}: {
  primary: string; secondary: string; tertiary: string
  pattern: KitPattern; collar: CollarType
  numberColor: string; number?: string
  playerName?: string; playerNameColor?: string
}) {
  // Unique IDs per instance — prevents SVG id collisions when multiple jerseys are on screen
  const uid = useId().replace(/:/g, '-')
  const clipId   = `sc${uid}`
  const fabricId = `sf${uid}`
  const sideId   = `ss${uid}`
  const gradId   = `sg${uid}`

  const shirtBodyPath = "M10,20 L20,10 L30,16 Q40,10 50,16 L60,10 L70,20 L62,30 L55,26 L55,82 L25,82 L25,26 L18,30 Z"
  const nameColor = playerNameColor || numberColor

  function renderPattern() {
    switch (pattern) {
      case 'halves':
        return <><rect x="0" y="0" width="40" height="100" fill={primary} /><rect x="40" y="0" width="40" height="100" fill={secondary} /></>
      case 'quarters':
        return <><rect x="0" y="0" width="40" height="46" fill={primary} /><rect x="40" y="0" width="40" height="46" fill={secondary} /><rect x="0" y="46" width="40" height="46" fill={secondary} /><rect x="40" y="46" width="40" height="46" fill={primary} /></>
      case 'stripes':
        return <><rect width="100" height="100" fill={primary} />{[14,35,56].map(x => <rect key={x} x={x} width="10" height="100" fill={secondary} />)}</>
      case 'thin-stripes':
        return <><rect width="100" height="100" fill={primary} />{[14,23,32,41,50,59,68].map(x => <rect key={x} x={x} width="2" height="100" fill={secondary} />)}</>
      case 'hoops':
        return <><rect width="100" height="100" fill={primary} />{[18,38,58,78].map(y => <rect key={y} y={y} width="100" height="11" fill={secondary} />)}</>
      case 'sash':
        return <><rect width="100" height="100" fill={primary} /><path d="M5,10 L22,5 L75,85 L58,90 Z" fill={secondary} /></>
      case 'chevron':
        return <><rect width="100" height="100" fill={primary} /><path d="M5,22 L40,48 L75,22 L75,34 L40,60 L5,34 Z" fill={secondary} /></>
      case 'checkered':
        return <><rect width="100" height="100" fill={primary} />{[[10,10],[40,10],[25,25],[55,25],[10,40],[40,40],[25,55],[55,55],[10,70],[40,70]].map(([x,y]) => <rect key={`${x}-${y}`} x={x} y={y} width="15" height="15" fill={secondary} />)}</>
      case 'sleeves':
        return <><rect width="100" height="100" fill={secondary} /><path d="M25,10 L55,10 L55,85 L25,85 Z" fill={primary} /></>
      case 'panel':
        return <><rect width="100" height="100" fill={primary} /><path d="M30,0 L50,0 L50,100 L30,100 Z" fill={secondary} opacity="0.6" /><path d="M0,0 L15,0 L15,100 L0,100 Z" fill={secondary} opacity="0.4" /><path d="M65,0 L80,0 L80,100 L65,100 Z" fill={secondary} opacity="0.4" /></>
      case 'gradient-v':
        return <>
          <defs><linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={primary} /><stop offset="100%" stopColor={secondary} /></linearGradient></defs>
          <rect width="100" height="100" fill={`url(#${gradId})`} />
        </>
      default:
        return <rect width="100" height="100" fill={primary} />
    }
  }

  function renderCollar() {
    switch (collar) {
      case 'v':
        return <><polyline points="31,13 40,24 49,13" fill="none" stroke={tertiary} strokeWidth="3" /><path d="M31,13 L40,24 L49,13 Z" fill="none" stroke={tertiary} strokeWidth="1" /></>
      case 'polo':
        return <><rect x="33" y="10" width="14" height="9" rx="1.5" fill={tertiary} /><line x1="40" y1="10" x2="40" y2="19" stroke={secondary} strokeWidth="1" /><polygon points="30,12 33,20 40,19" fill={tertiary} /><polygon points="50,12 47,20 40,19" fill={tertiary} /></>
      default:
        return <ellipse cx="40" cy="13" rx="9" ry="4" fill={tertiary} />
    }
  }

  const hasName = Boolean(playerName?.trim())
  const numberY = hasName ? 61 : 54

  return (
    <svg viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <defs>
        <clipPath id={clipId}><path d={shirtBodyPath} /></clipPath>
        <linearGradient id={fabricId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="35%" stopColor="#000000" stopOpacity="0.0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={sideId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.3" />
          <stop offset="15%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="85%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {renderPattern()}
        {pattern !== 'sleeves' && (
          <>
            <path d="M10,20 L15,25 L21,22 L17,14 Z" fill={tertiary} opacity="0.8" />
            <path d="M70,20 L65,25 L59,22 L63,14 Z" fill={tertiary} opacity="0.8" />
          </>
        )}
        <path d={shirtBodyPath} fill={`url(#${sideId})`} pointerEvents="none" />
        <path d={shirtBodyPath} fill={`url(#${fabricId})`} pointerEvents="none" />
      </g>

      <path d={shirtBodyPath} fill="none" stroke={tertiary} strokeWidth="2.5" strokeLinejoin="round" />
      {renderCollar()}

      {hasName && (
        <text x="40" y="47" textAnchor="middle" dominantBaseline="middle"
          fill={nameColor} stroke="#000000" strokeWidth="1.5" paintOrder="stroke fill"
          fontSize="6" fontWeight="800" fontFamily="sans-serif" letterSpacing="0.5"
          className="select-none">
          {playerName!.toUpperCase().slice(0, 10)}
        </text>
      )}

      {number && (
        <text x="40" y={numberY} textAnchor="middle" dominantBaseline="middle"
          fill={numberColor} stroke="#000000" strokeWidth="2.5" paintOrder="stroke fill"
          fontSize="18" fontWeight="900" fontFamily="sans-serif"
          className="drop-shadow-md select-none">
          {number}
        </text>
      )}
    </svg>
  )
}

export function KitPreview({
  primaryColor, secondaryColor, tertiaryColor,
  pattern, collar, numberColor, number,
  playerName, playerNameColor,
  size = 'md',
}: KitPreviewProps) {
  const sizeClass = { sm: 'h-20 w-20', md: 'h-36 w-36', lg: 'h-52 w-52' }[size]
  return (
    <div className={cn('drop-shadow-xl transition-all duration-300', sizeClass)}>
      <ShirtSvg
        primary={primaryColor} secondary={secondaryColor} tertiary={tertiaryColor}
        pattern={pattern} collar={collar} numberColor={numberColor} number={number}
        playerName={playerName} playerNameColor={playerNameColor}
      />
    </div>
  )
}
