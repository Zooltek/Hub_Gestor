import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * Logotipo oficial Bling ERP
 */
export function BlingLogo({ className = "size-6", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#00AA66" />
      <path
        d="M15 13H26C29.866 13 33 16.134 33 20C33 22.361 31.831 24.449 30.038 25.72C32.392 26.984 34 29.458 34 32.3C34 36.553 30.553 40 26.3 40H15V13ZM21 24H25.5C27.709 24 29.5 22.209 29.5 20C29.5 17.791 27.709 16 25.5 16H21V24ZM21 37H26.3C28.896 37 31 34.896 31 32.3C31 29.704 28.896 27.6 26.3 27.6H21V37Z"
        fill="white"
      />
    </svg>
  );
}

/**
 * Logotipo oficial Tiny ERP
 */
export function TinyLogo({ className = "size-6", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#00A896" />
      <path
        d="M13 15H35V21H27.5V36H20.5V21H13V15Z"
        fill="white"
      />
      <circle cx="34" cy="33" r="3" fill="#F0F3F4" />
    </svg>
  );
}

/**
 * Logotipo oficial Omie ERP
 */
export function OmieLogo({ className = "size-6", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#001E62" />
      <circle cx="24" cy="24" r="14" stroke="#00C4CC" strokeWidth="4" />
      <circle cx="24" cy="24" r="7" fill="#FF5000" />
      <path d="M24 10V14" stroke="#00C4CC" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 34V38" stroke="#00C4CC" strokeWidth="3" strokeLinecap="round" />
      <path d="M10 24H14" stroke="#00C4CC" strokeWidth="3" strokeLinecap="round" />
      <path d="M34 24H38" stroke="#00C4CC" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Logotipo oficial ContaAzul ERP
 */
export function ContaAzulLogo({ className = "size-6", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#0080FF" />
      <path
        d="M15 28C15 23.029 19.029 19 24 19C28.971 19 33 23.029 33 28"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M20 28C20 25.791 21.791 24 24 24C26.209 24 28 25.791 28 28"
        stroke="#FFCC00"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="24" cy="14" r="2.5" fill="white" />
    </svg>
  );
}

/**
 * Logotipo oficial Millennium ERP
 */
export function MillenniumLogo({ className = "size-6", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#0E2F56" />
      <path
        d="M14 34V14L24 26L34 14V34H29.5V23L24 30L18.5 23V34H14Z"
        fill="#E5B25D"
      />
    </svg>
  );
}

/**
 * Logotipo oficial Mercado Livre
 */
export function MercadoLivreLogo({ className = "size-6", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#FFE600" />
      <path
        d="M14 26.5C14 22 17.5 17 24 17C30.5 17 34 22 34 26.5C34 31 29.5 33 24 33C18.5 33 14 31 14 26.5Z"
        stroke="#2D3277"
        strokeWidth="2.5"
      />
      <path
        d="M18 25C19.5 27 22 28.5 24 28.5C26 28.5 28.5 27 30 25"
        stroke="#2D3277"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="20" cy="22" r="1.5" fill="#2D3277" />
      <circle cx="28" cy="22" r="1.5" fill="#2D3277" />
    </svg>
  );
}

/**
 * Logotipo oficial Shopify
 */
export function ShopifyLogo({ className = "size-6", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#95BF47" />
      <path
        d="M31.5 16.5C31.4 16.3 31.2 16.2 30.9 16.2L27.5 15.6C27.5 15.4 27.4 14.8 27.2 14.2C26.6 12.3 25.1 11.2 23.3 11.2C21.8 11.2 20.6 12 20.1 13.3C19.8 14.1 19.7 15 19.8 15.7L16.6 16.3C16.3 16.4 16.2 16.6 16.1 16.9L13.2 33.2C13.1 33.5 13.3 33.8 13.6 33.9L28.8 37.8C28.9 37.8 29.1 37.8 29.2 37.7L34.8 17.1C34.8 16.9 34.7 16.6 31.5 16.5ZM23.3 13.4C24.1 13.4 24.8 14.1 25.2 15.2L21.4 15.8C21.6 14.4 22.3 13.4 23.3 13.4ZM24.5 31.5C21.8 31.5 20.2 29.8 20.2 29.8L20.8 27.6C20.8 27.6 22.1 28.8 23.7 28.8C25.1 28.8 25.7 28 25.7 27.2C25.7 25.1 21.2 25.2 21.2 21.5C21.2 18.8 23.3 17.5 25.7 17.5C27.6 17.5 29 18.6 29 18.6L28.2 20.9C28.2 20.9 27.2 20 25.8 20C24.8 20 24 20.5 24 21.4C24 23.3 28.5 23.3 28.5 27C28.5 29.7 26.5 31.5 24.5 31.5Z"
        fill="white"
      />
    </svg>
  );
}

/**
 * Logotipo oficial Tray E-commerce
 */
export function TrayLogo({ className = "size-6", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#FF5500" />
      <path
        d="M13 16H35V22H27V36H21V22H13V16Z"
        fill="white"
      />
      <path
        d="M28 26L35 36H28V26Z"
        fill="#FFE5D9"
      />
    </svg>
  );
}

/**
 * Logotipo oficial Shopee
 */
export function ShopeeLogo({ className = "size-6", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#EE4D2D" />
      <path
        d="M24 13C21.2 13 19 15.2 19 18V19H29V18C29 15.2 26.8 13 24 13Z"
        stroke="white"
        strokeWidth="2.5"
      />
      <path
        d="M14 19H34L32 36H16L14 19Z"
        fill="white"
      />
      <path
        d="M25.5 23.5C23.5 23.5 22 24.2 22 25.5C22 27.5 26.5 27 26.5 29.5C26.5 31 24.5 31.5 23.5 31.5C22 31.5 20.5 30.5 20.5 30.5L20 32.5C20 32.5 21.5 33.5 23.5 33.5C26 33.5 28.5 32 28.5 29.5C28.5 27 24 27.5 24 25.5C24 24.5 25 24.5 26 24.5C27 24.5 28 25 28 25L28.5 23.5C28.5 23.5 27.5 23.5 25.5 23.5Z"
        fill="#EE4D2D"
      />
    </svg>
  );
}

/**
 * Logotipo oficial Amazon Marketplace
 */
export function AmazonLogo({ className = "size-6", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#232F3E" />
      <path
        d="M14 30C19 34 29 34 34 30"
        stroke="#FF9900"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M32 28L36 30.5L33 34"
        fill="#FF9900"
      />
      <path
        d="M24 16C21 16 19 17.5 19 19.5C19 22.5 29 21.5 29 25C29 27 27 28 24 28"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Logotipo oficial Magazine Luiza (Magalu)
 */
export function MagaluLogo({ className = "size-6", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#0086FF" />
      <circle cx="17" cy="24" r="5" fill="#FFDF00" />
      <circle cx="27" cy="24" r="5" fill="#00D084" />
      <circle cx="22" cy="18" r="4" fill="#FF4D4D" />
      <circle cx="33" cy="20" r="3" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * Logotipo oficial Nuvemshop
 */
export function NuvemshopLogo({ className = "size-6", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#2B3674" />
      <path
        d="M17 28C14.79 28 13 26.21 13 24C13 21.98 14.5 20.31 16.48 20.04C17.27 16.6 20.33 14 24 14C28.42 14 32 17.58 32 22C33.66 22 35 23.34 35 25C35 26.66 33.66 28 32 28H17Z"
        fill="#2CDDC7"
      />
    </svg>
  );
}

/**
 * Logotipo oficial API REST & Webhooks
 */
export function RestApiLogo({ className = "size-6", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#6B21A8" />
      <path
        d="M18 16L12 24L18 32"
        stroke="#E9D5FF"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M30 16L36 24L30 32"
        stroke="#E9D5FF"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26 14L22 34"
        stroke="#C084FC"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Helper dinâmico para renderizar o logo correto de um plugin do Hub
 */
export function getPluginLogo(systemName: string, className = "size-8"): React.ReactNode {
  const norm = (systemName || "").toLowerCase();

  if (norm.includes("mercadolivre")) {
    return <MercadoLivreLogo className={className} />;
  }
  if (norm.includes("shopify")) {
    return <ShopifyLogo className={className} />;
  }
  if (norm.includes("tray")) {
    return <TrayLogo className={className} />;
  }
  if (norm.includes("shopee")) {
    return <ShopeeLogo className={className} />;
  }
  if (norm.includes("amazon")) {
    return <AmazonLogo className={className} />;
  }
  if (norm.includes("magalu") || norm.includes("magazineluiza")) {
    return <MagaluLogo className={className} />;
  }
  if (norm.includes("nuvemshop")) {
    return <NuvemshopLogo className={className} />;
  }
  if (norm.includes("bling")) {
    return <BlingLogo className={className} />;
  }
  if (norm.includes("tiny")) {
    return <TinyLogo className={className} />;
  }
  if (norm.includes("omie")) {
    return <OmieLogo className={className} />;
  }
  if (norm.includes("contaazul")) {
    return <ContaAzulLogo className={className} />;
  }
  if (norm.includes("millennium")) {
    return <MillenniumLogo className={className} />;
  }

  return <RestApiLogo className={className} />;
}

/**
 * Helper dinâmico para renderizar o logo de um ERP
 */
export function getErpLogo(erpId: string, className = "size-8"): React.ReactNode {
  const norm = (erpId || "").toLowerCase();

  if (norm.includes("bling")) {
    return <BlingLogo className={className} />;
  }
  if (norm.includes("tiny")) {
    return <TinyLogo className={className} />;
  }
  if (norm.includes("omie")) {
    return <OmieLogo className={className} />;
  }
  if (norm.includes("contaazul") || norm.includes("conta_azul")) {
    return <ContaAzulLogo className={className} />;
  }
  if (norm.includes("millennium")) {
    return <MillenniumLogo className={className} />;
  }

  return <RestApiLogo className={className} />;
}
