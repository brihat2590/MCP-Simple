import type { SVGProps } from "react";

// One cohesive line-icon set (1.6 stroke, rounded joins) so the whole app
// shares a single visual language instead of mixed emoji / ad-hoc glyphs.
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 20, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function PizzaIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3.5c4.7 0 8.5 3.8 8.5 8.5L12 20.5 3.5 12c0-4.7 3.8-8.5 8.5-8.5Z" />
      <circle cx="10" cy="10" r="1" />
      <circle cx="13.5" cy="12.5" r="1" />
    </Base>
  );
}

export function SaladIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 11h16a8 8 0 0 1-8 8 8 8 0 0 1-8-8Z" />
      <path d="M8 11c0-2 1.5-3.5 3.5-4M14 7c1.8.3 3 1.7 3.5 4" />
    </Base>
  );
}

export function DrinkIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 4h12l-1.4 15.2a1 1 0 0 1-1 .8H8.4a1 1 0 0 1-1-.8Z" />
      <path d="M6.4 9h11.2" />
    </Base>
  );
}

export function DessertIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 11a7 7 0 0 1 14 0Z" />
      <path d="M4 11h16l-1.3 8.2a1 1 0 0 1-1 .8H6.3a1 1 0 0 1-1-.8Z" />
      <path d="M12 3v2" />
    </Base>
  );
}

export function PlateIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
    </Base>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 12h13" />
      <path d="M12.5 6.5 18 12l-5.5 5.5" />
    </Base>
  );
}

export function ReceiptIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 3.5h12v17l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2-2 1.2Z" />
      <path d="M9 8h6M9 12h6" />
    </Base>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Base>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M20 11a8 8 0 0 0-14-4.5L4 8" />
      <path d="M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 14 4.5L20 16" />
      <path d="M20 20v-4h-4" />
    </Base>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6Z" />
    </Base>
  );
}

export const CATEGORY_ICON: Record<string, (p: IconProps) => React.ReactElement> = {
  pizza: PizzaIcon,
  salad: SaladIcon,
  drink: DrinkIcon,
  dessert: DessertIcon,
};
