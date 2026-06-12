import { useId } from "react"
import { cn } from "@/lib/utils"
import type { CrestShape, CrestPattern } from "./CrestPreview"

export type KitPattern =
  | "solid"
  | "stripes"
  | "thin-stripes"
  | "hoops"
  | "sash"
  | "halves"
  | "quarters"
  | "checkered"
  | "chevron"
  | "sleeves"
  | "panel"
  | "gradient-v"
export type CollarType = "round" | "v" | "polo"

interface KitPreviewProps {
  primaryColor: string
  secondaryColor: string
  pattern: KitPattern
  collar: CollarType
  numberColor?: string
  number?: string
  playerName?: string
  playerNameColor?: string
  textScale?: number
  outlineColor?: string
  showOutline?: boolean
  showCrest?: boolean
  crestPrimary?: string
  crestSecondary?: string
  crestShape?: CrestShape
  crestPattern?: CrestPattern
  crestAcronym?: string
  crestStars?: number
  size?: "sm" | "md" | "lg"
}

function getCrestClipPath(shape: CrestShape): string {
  switch (shape) {
    case "classic":
      return "M50,5 L95,20 L95,60 Q95,90 50,98 Q5,90 5,60 L5,20 Z"
    case "shield":
      return "M50,5 L95,25 L95,65 L50,95 L5,65 L5,25 Z"
    case "diamond":
      return "M50,5 L95,50 L50,95 L5,50 Z"
    case "pentagon":
      return "M50,5 L95,38 L78,92 L22,92 L5,38 Z"
    case "star":
      return "M50,4 L63,32 L95,37 L71,59 L78,91 L50,76 L22,91 L29,59 L5,37 L37,32 Z"
    default:
      return "" // round uses circle
  }
}

function ShirtSvg({
  primary,
  secondary,
  pattern,
  collar,
  numberColor = '#ffffff',
  number,
  playerName,
  playerNameColor,
  textScale = 1,
  outlineColor = "#ffffff",
  showOutline = true,
  showCrest = false,
  crestPrimary = "#1e3a8a",
  crestSecondary = "#f59e0b",
  crestShape = "classic",
  crestPattern = "solid",
  crestAcronym = "AAA",
  crestStars = 0,
}: {
  primary: string
  secondary: string
  pattern: KitPattern
  collar: CollarType
  numberColor?: string
  number?: string
  playerName?: string
  playerNameColor?: string
  textScale?: number
  outlineColor?: string
  showOutline?: boolean
  showCrest?: boolean
  crestPrimary?: string
  crestSecondary?: string
  crestShape?: CrestShape
  crestPattern?: CrestPattern
  crestAcronym?: string
  crestStars?: number
}) {
  const uid = useId().replace(/:/g, "-")
  const clipId = `sc${uid}`
  const fabricId = `sf${uid}`
  const sideId = `ss${uid}`
  const gradId = `sg${uid}`
  const crestClipId = `cc${uid}`

  const shirtBodyPath =
    "M10,20 L20,10 L30,16 Q40,10 50,16 L60,10 L70,20 L62,30 L55,26 L55,82 L25,82 L25,26 L18,30 Z"
  const nameColor = playerNameColor || numberColor

  function renderPattern() {
    switch (pattern) {
      case "halves":
        return (
          <>
            <rect x="0" y="0" width="40" height="100" fill={primary} />
            <rect x="40" y="0" width="40" height="100" fill={secondary} />
          </>
        )
      case "quarters":
        return (
          <>
            <rect x="0" y="0" width="40" height="46" fill={primary} />
            <rect x="40" y="0" width="40" height="46" fill={secondary} />
            <rect x="0" y="46" width="40" height="46" fill={secondary} />
            <rect x="40" y="46" width="40" height="46" fill={primary} />
          </>
        )
      case "stripes":
        return (
          <>
            <rect width="100" height="100" fill={primary} />
            {[14, 35, 56].map((x) => (
              <rect key={x} x={x} width="10" height="100" fill={secondary} />
            ))}
          </>
        )
      case "thin-stripes":
        return (
          <>
            <rect width="100" height="100" fill={primary} />
            {[14, 23, 32, 41, 50, 59, 68].map((x) => (
              <rect key={x} x={x} width="2" height="100" fill={secondary} />
            ))}
          </>
        )
      case "hoops":
        return (
          <>
            <rect width="100" height="100" fill={primary} />
            {[18, 38, 58, 78].map((y) => (
              <rect key={y} y={y} width="100" height="11" fill={secondary} />
            ))}
          </>
        )
      case "sash":
        return (
          <>
            <rect width="100" height="100" fill={primary} />
            <path d="M5,10 L22,5 L75,85 L58,90 Z" fill={secondary} />
          </>
        )
      case "chevron":
        return (
          <>
            <rect width="100" height="100" fill={primary} />
            <path
              d="M5,22 L40,48 L75,22 L75,34 L40,60 L5,34 Z"
              fill={secondary}
            />
          </>
        )
      case "checkered":
        return (
          <>
            <rect width="100" height="100" fill={primary} />
            {[
              [10, 10],
              [40, 10],
              [25, 25],
              [55, 25],
              [10, 40],
              [40, 40],
              [25, 55],
              [55, 55],
              [10, 70],
              [40, 70],
            ].map(([x, y]) => (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width="15"
                height="15"
                fill={secondary}
              />
            ))}
          </>
        )
      case "sleeves":
        return (
          <>
            <rect width="100" height="100" fill={secondary} />
            <path d="M25,10 L55,10 L55,85 L25,85 Z" fill={primary} />
          </>
        )
      case "panel":
        return (
          <>
            <rect width="100" height="100" fill={primary} />
            <path
              d="M30,0 L50,0 L50,100 L30,100 Z"
              fill={secondary}
              opacity="0.6"
            />
            <path
              d="M0,0 L15,0 L15,100 L0,100 Z"
              fill={secondary}
              opacity="0.4"
            />
            <path
              d="M65,0 L80,0 L80,100 L65,100 Z"
              fill={secondary}
              opacity="0.4"
            />
          </>
        )
      case "gradient-v":
        return (
          <>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={primary} />
                <stop offset="100%" stopColor={secondary} />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill={`url(#${gradId})`} />
          </>
        )
      default:
        return <rect width="100" height="100" fill={primary} />
    }
  }

  function renderCollar() {
    switch (collar) {
      case "v":
        return (
          <polyline
            points="31,13 40,22 49,13"
            fill="none"
            stroke="rgba(0,0,0,0.25)"
            strokeWidth="1.5"
          />
        )
      case "polo":
        return (
          <rect
            x="34"
            y="10"
            width="12"
            height="7"
            rx="1"
            fill="rgba(0,0,0,0.12)"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="0.8"
          />
        )
      default:
        return (
          <ellipse
            cx="40"
            cy="13"
            rx="9"
            ry="3.5"
            fill="rgba(0,0,0,0.12)"
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="0.8"
          />
        )
    }
  }

  function renderMiniCrest() {
    const cx = 46,
      cy = 29,
      size = 10
    const x0 = cx - size / 2
    const y0 = cy - size / 2

    function miniPattern() {
      switch (crestPattern) {
        case "halves":
          return (
            <>
              <rect x="0" y="0" width="50" height="100" fill={crestPrimary} />
              <rect
                x="50"
                y="0"
                width="50"
                height="100"
                fill={crestSecondary}
              />
            </>
          )
        case "stripes":
          return (
            <>
              <rect width="100" height="100" fill={crestPrimary} />
              <rect x="14" width="14" height="100" fill={crestSecondary} />
              <rect x="43" width="14" height="100" fill={crestSecondary} />
              <rect x="72" width="14" height="100" fill={crestSecondary} />
            </>
          )
        case "diagonal":
          return (
            <>
              <rect width="100" height="100" fill={crestPrimary} />
              <path
                d="M-10,15 L15,-10 L110,85 L85,110 Z"
                fill={crestSecondary}
              />
            </>
          )
        case "cross":
          return (
            <>
              <rect width="100" height="100" fill={crestPrimary} />
              <rect
                x="42"
                y="0"
                width="16"
                height="100"
                fill={crestSecondary}
              />
              <rect
                x="0"
                y="42"
                width="100"
                height="16"
                fill={crestSecondary}
              />
            </>
          )
        case "checkered":
          return (
            <>
              <rect width="100" height="100" fill={crestPrimary} />
              <rect x="0" y="0" width="50" height="50" fill={crestSecondary} />
              <rect
                x="50"
                y="50"
                width="50"
                height="50"
                fill={crestSecondary}
              />
            </>
          )
        case "rings":
          return (
            <>
              <rect width="100" height="100" fill={crestPrimary} />
              <circle
                cx="50"
                cy="50"
                r="30"
                fill="none"
                stroke={crestSecondary}
                strokeWidth="7"
              />
              <circle cx="50" cy="50" r="14" fill={crestSecondary} />
            </>
          )
        case "chevron":
          return (
            <>
              <rect width="100" height="100" fill={crestPrimary} />
              <path
                d="M-10,20 L50,60 L110,20 L110,40 L50,80 L-10,40 Z"
                fill={crestSecondary}
              />
            </>
          )
        default:
          return <rect width="100" height="100" fill={crestPrimary} />
      }
    }

    const clipPathD = getCrestClipPath(crestShape)

    return (
      <svg
        x={x0}
        y={y0}
        width={size}
        height={size}
        viewBox="0 0 100 100"
        overflow="visible"
      >
        <defs>
          <clipPath id={crestClipId}>
            {crestShape === "round" ? (
              <circle cx="50" cy="50" r="45" />
            ) : (
              <path d={clipPathD} />
            )}
          </clipPath>
          <linearGradient id={`cg${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <g clipPath={`url(#${crestClipId})`}>
          {miniPattern()}
          <rect
            width="100"
            height="100"
            fill={`url(#cg${uid})`}
            pointerEvents="none"
          />
        </g>
        {crestShape === "round" ? (
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={crestSecondary}
            strokeWidth="5"
          />
        ) : (
          <path
            d={clipPathD}
            fill="none"
            stroke={crestSecondary}
            strokeWidth="5"
            strokeLinejoin="round"
          />
        )}
        {crestStars > 0 && (
          <g transform="translate(50,22)">
            {Array.from({ length: Math.min(crestStars, 3) }).map((_, i) => {
              const total = Math.min(crestStars, 3)
              const offset = ((total - 1) * 14) / 2
              return (
                <polygon
                  key={i}
                  transform={`translate(${i * 14 - offset}, 0)`}
                  points="0,-5 1.5,-1 5,-1 2.2,2 3.2,5.5 0,3.5 -3.2,5.5 -2.2,2 -5,-1 -1.5,-1"
                  fill="#ffffff"
                  stroke={crestSecondary}
                  strokeWidth="1.5"
                />
              )
            })}
          </g>
        )}
        <text
          x="50"
          y={crestStars > 0 ? "60" : "55"}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffff"
          stroke={crestPrimary}
          strokeWidth="4"
          paintOrder="stroke fill"
          fontSize="26"
          fontWeight="900"
          fontFamily="sans-serif"
          letterSpacing="1"
        >
          {crestAcronym.slice(0, 3).toUpperCase()}
        </text>
      </svg>
    )
  }

  const hasName = Boolean(playerName?.trim())
  const scale = textScale ?? 1
  const nameFontSize = 5.5 * scale
  const numberFontSize = 16 * scale
  const nameStr = playerName ? playerName.toUpperCase().slice(0, 10) : ""
  const maxNameWidth = 26
  const estimatedNameWidth = nameStr.length * nameFontSize * 0.65
  const nameTextLength =
    estimatedNameWidth > maxNameWidth ? maxNameWidth : undefined
  // number on top, name below
  const numberY = 50
  const nameY = hasName ? numberY + numberFontSize * 0.65 + nameFontSize + 2 : 0

  return (
    <svg
      viewBox="0 0 80 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={shirtBodyPath} />
        </clipPath>
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
        <path d={shirtBodyPath} fill={`url(#${sideId})`} pointerEvents="none" />
        <path
          d={shirtBodyPath}
          fill={`url(#${fabricId})`}
          pointerEvents="none"
        />
      </g>

      {showOutline && (
        <path
          d={shirtBodyPath}
          fill="none"
          stroke={outlineColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}
      {renderCollar()}

      {showCrest && renderMiniCrest()}

      {number && (
        <text
          x="40"
          y={numberY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={numberColor}
          stroke="#000000"
          strokeWidth="2"
          paintOrder="stroke fill"
          fontSize={numberFontSize}
          fontWeight="900"
          fontFamily="sans-serif"
          className="drop-shadow-md select-none"
        >
          {number}
        </text>
      )}

      {hasName && (
        <text
          x="40"
          y={nameY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={nameColor}
          stroke="#000000"
          strokeWidth="1.2"
          paintOrder="stroke fill"
          fontSize={nameFontSize}
          fontWeight="800"
          fontFamily="sans-serif"
          letterSpacing="0.4"
          {...(nameTextLength
            ? { textLength: nameTextLength, lengthAdjust: "spacingAndGlyphs" }
            : {})}
          className="select-none"
        >
          {nameStr}
        </text>
      )}
    </svg>
  )
}

export function KitPreview({
  primaryColor,
  secondaryColor,
  pattern,
  collar,
  numberColor = '#ffffff',
  number,
  playerName,
  playerNameColor,
  textScale,
  outlineColor,
  showOutline,
  showCrest,
  crestPrimary,
  crestSecondary,
  crestShape,
  crestPattern,
  crestAcronym,
  crestStars,
  size = "md",
}: KitPreviewProps) {
  const sizeClass = { sm: "h-20 w-20", md: "h-36 w-36", lg: "h-52 w-52" }[size]
  return (
    <div
      className={cn("drop-shadow-xl transition-all duration-300", sizeClass)}
    >
      <ShirtSvg
        primary={primaryColor}
        secondary={secondaryColor}
        pattern={pattern}
        collar={collar}
        numberColor={numberColor}
        number={number}
        playerName={playerName}
        playerNameColor={playerNameColor}
        textScale={textScale}
        outlineColor={outlineColor}
        showOutline={showOutline}
        showCrest={showCrest}
        crestPrimary={crestPrimary}
        crestSecondary={crestSecondary}
        crestShape={crestShape}
        crestPattern={crestPattern}
        crestAcronym={crestAcronym}
        crestStars={crestStars}
      />
    </div>
  )
}
