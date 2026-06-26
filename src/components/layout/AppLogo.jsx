export default function AppLogo({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-8 h-8 rounded-lg',
    lg: 'w-10 h-10 rounded-xl',
  };

  return (
    <img
      src="/icons/icon-192.png"
      alt="Hala Walla"
      className={`${sizes[size] || sizes.md} object-cover shrink-0 ${className}`}
      width={size === 'lg' ? 40 : size === 'sm' ? 28 : 32}
      height={size === 'lg' ? 40 : size === 'sm' ? 28 : 32}
    />
  );
}
