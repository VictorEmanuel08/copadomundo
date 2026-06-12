import { cn } from '@/lib/utils'

export type CrestShape = 'classic' | 'shield' | 'round' | 'diamond' | 'pentagon' | 'star'
export type CrestPattern = 'solid' | 'stripes' | 'halves' | 'diagonal' | 'cross' | 'checkered' | 'rings' | 'chevron'

interface CrestPreviewProps {
  primaryColor: string
  secondaryColor: string
  acronym: string
  shape: CrestShape
  pattern?: CrestPattern
  stars: number
  showOutline?: boolean
  outlineColor?: string
  starsColor?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export function CrestPreview({
  primaryColor,
  secondaryColor,
  acronym,
  shape,
  pattern = 'solid',
  stars,
  showOutline = true,
  outlineColor,
  starsColor = '#ffffff',
  size = 'md',
}: CrestPreviewProps) {
  const borderColor = outlineColor ?? secondaryColor
  const sizeClass = { xs: 'h-8 w-8', sm: 'h-16 w-16', md: 'h-28 w-28', lg: 'h-40 w-40' }[size]
  const fontSize = { xs: 7, sm: 13, md: 20, lg: 30 }[size]

  function getClipPath() {
    switch (shape) {
      case 'classic':
        return 'M50,5 L95,20 L95,60 Q95,90 50,98 Q5,90 5,60 L5,20 Z'
      case 'shield':
        return 'M50,5 L95,25 L95,65 L50,95 L5,65 L5,25 Z'
      case 'diamond':
        return 'M50,5 L95,50 L50,95 L5,50 Z'
      case 'pentagon':
        return 'M50,5 L95,38 L78,92 L22,92 L5,38 Z'
      case 'star':
        return 'M50,4 L63,32 L95,37 L71,59 L78,91 L50,76 L22,91 L29,59 L5,37 L37,32 Z'
      default:
        // 'round' doesn't use path-based clipPath
        return 'M50,5 A45,45 0 1,1 49.9,5 Z'
    }
  }

  const clipPathD = getClipPath()
  const clipId = `crest-clip-${shape}`

  // Renders the background pattern based on selected pattern type
  function renderPattern() {
    switch (pattern) {
      case 'halves':
        return (
          <>
            <rect x="0" y="0" width="50" height="100" fill={primaryColor} />
            <rect x="50" y="0" width="50" height="100" fill={secondaryColor} />
          </>
        )
      case 'stripes':
        return (
          <>
            <rect width="100" height="100" fill={primaryColor} />
            <rect x="14" width="14" height="100" fill={secondaryColor} />
            <rect x="43" width="14" height="100" fill={secondaryColor} />
            <rect x="72" width="14" height="100" fill={secondaryColor} />
          </>
        )
      case 'diagonal':
        return (
          <>
            <rect width="100" height="100" fill={primaryColor} />
            <path d="M-10,15 L15,-10 L110,85 L85,110 Z" fill={secondaryColor} />
          </>
        )
      case 'cross':
        return (
          <>
            <rect width="100" height="100" fill={primaryColor} />
            <rect x="42" y="0" width="16" height="100" fill={secondaryColor} />
            <rect x="0" y="42" width="100" height="16" fill={secondaryColor} />
          </>
        )
      case 'checkered':
        return (
          <>
            <rect width="100" height="100" fill={primaryColor} />
            <rect x="0" y="0" width="50" height="50" fill={secondaryColor} />
            <rect x="50" y="50" width="50" height="50" fill={secondaryColor} />
          </>
        )
      case 'rings':
        return (
          <>
            <rect width="100" height="100" fill={primaryColor} />
            <circle cx="50" cy="50" r="30" fill="none" stroke={secondaryColor} strokeWidth="7" />
            <circle cx="50" cy="50" r="14" fill={secondaryColor} />
          </>
        )
      case 'chevron':
        return (
          <>
            <rect width="100" height="100" fill={primaryColor} />
            <path d="M-10,20 L50,60 L110,20 L110,40 L50,80 L-10,40 Z" fill={secondaryColor} />
          </>
        )
      default:
        // 'solid'
        return <rect width="100" height="100" fill={primaryColor} />
    }
  }

  return (
    <div className={cn('drop-shadow-lg select-none transition-all duration-300', sizeClass)}>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <clipPath id={clipId}>
            {shape === 'round' ? (
              <circle cx="50" cy="50" r="45" />
            ) : (
              <path d={clipPathD} />
            )}
          </clipPath>
          
          {/* Subtle glossy overlay gradient */}
          <linearGradient id="crest-gloss" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Clipped background pattern */}
        <g clipPath={`url(#${clipId})`}>
          {renderPattern()}
          {/* Gloss overlay */}
          <rect width="100" height="100" fill="url(#crest-gloss)" pointerEvents="none" />
        </g>

        {/* Border outline */}
        {showOutline && (shape === 'round' ? (
          <circle cx="50" cy="50" r="45" fill="none" stroke={borderColor} strokeWidth="4.5" />
        ) : (
          <path d={clipPathD} fill="none" stroke={borderColor} strokeWidth="4.5" strokeLinejoin="round" />
        ))}

        {/* Stars */}
        {stars > 0 && (
          <g transform="translate(50, 22)">
            {Array.from({ length: Math.min(stars, 5) }).map((_, i) => {
              const total = Math.min(stars, 5)
              const spacing = 12
              const offset = ((total - 1) * spacing) / 2
              return (
                <polygon
                  key={i}
                  transform={`translate(${i * spacing - offset}, 0)`}
                  points="0,-5 1.5,-1 5,-1 2.2,2 3.2,5.5 0,3.5 -3.2,5.5 -2.2,2 -5,-1 -1.5,-1"
                  fill={starsColor}
                  stroke={borderColor}
                  strokeWidth="1"
                  className="drop-shadow-sm"
                />
              )
            })}
          </g>
        )}

        {/* Acronym text */}
        <text
          x="50"
          y={stars > 0 ? "59" : "54"}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffff"
          stroke={primaryColor}
          strokeWidth="2.5"
          paintOrder="stroke fill"
          fontSize={fontSize}
          fontWeight="900"
          fontFamily="sans-serif"
          letterSpacing="1"
          className="drop-shadow-md select-none"
        >
          {acronym.slice(0, 3).toUpperCase() || 'AAA'}
        </text>
      </svg>
    </div>
  )
}
