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
        <div className="text-black font-bold whitespace-nowrap" style={{ fontSize: `${width * 0.18}px` }}>
          THE LAW SHOP
        </div>
      </div>
    </div>
  )
}