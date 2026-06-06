interface TeamFlagProps {
  code: string
  name: string
  size?: number
}

export function TeamFlag({ code, name, size = 24 }: TeamFlagProps) {
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={name}
      width={size}
      height={size * 0.67}
      className="rounded-sm object-cover"
      onError={(e) => {
        ;(e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}
