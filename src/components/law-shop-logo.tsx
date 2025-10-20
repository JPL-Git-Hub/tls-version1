interface LawShopLogoProps {
  width?: number
  height?: number
  className?: string
}

export function LawShopLogo({ width = 180, height = 180, className = "" }: LawShopLogoProps) {
  return (
    <div 
      className={`inline-block ${className}`}
      style={{ width, height }}
    >
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-black font-bold text-center leading-tight" style={{ fontSize: `${width * 0.15}px` }}>
          <div>THE</div>
          <div style={{ fontSize: `${width * 0.25}px`, lineHeight: '0.8' }}>LAW</div>
          <div style={{ fontSize: `${width * 0.25}px`, lineHeight: '0.8' }}>SHOP</div>
        </div>
      </div>
    </div>
  )
}