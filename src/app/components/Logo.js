export default function Logo({ size = "md", showText = true }) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-14",
  };

  const imageSizes = {
    sm: 32,
    md: 40,
    lg: 56,
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        <img 
          src="/logo.svg" 
          alt="Kamyab Logo" 
          width={imageSizes[size]} 
          height={imageSizes[size]}
          className="object-contain"
        />
      </div>
      {showText && (
        <div>
          <h1 className={`${textSizes[size]} font-bold text-slate-900 tracking-tight`}>
            Kamyab
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            VCF Converter
          </p>
        </div>
      )}
    </div>
  );
}
