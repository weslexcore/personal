import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P): P => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  ...p,
});

export const ChevronLeft = (p: P) => (
  <svg {...base(p)}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);
export const ChevronRight = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);
export const ChevronDown = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
export const Close = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const Ellipsis = (p: P) => (
  <svg {...base({ ...p, fill: "currentColor", stroke: "none" })}>
    <circle cx="6" cy="12" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="18" cy="12" r="1.8" />
  </svg>
);
export const Check = (p: P) => (
  <svg {...base({ strokeWidth: 2.5, ...p })}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);
export const Share = (p: P) => (
  <svg {...base({ strokeWidth: 1.8, ...p })}>
    <path d="M12 3v13M7.5 7.5L12 3l4.5 4.5" />
    <path d="M5 11v8a2 2 0 002 2h10a2 2 0 002-2v-8" />
  </svg>
);
export const Heart = (p: P & { filled?: boolean }) => {
  const { filled, ...rest } = p;
  return (
    <svg {...base({ strokeWidth: 1.8, ...rest, fill: filled ? "currentColor" : "none" })}>
      <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7.6a4.3 4.3 0 017.5 2.7C19.5 15.9 12 20.5 12 20.5z" />
    </svg>
  );
};
export const Info = (p: P) => (
  <svg {...base({ strokeWidth: 1.8, ...p })}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
);
export const Search = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.2-4.2" />
  </svg>
);
export const Library = (p: P) => (
  <svg {...base({ ...p, fill: "currentColor", stroke: "none" })}>
    <path d="M12 2.5c1.6 0 2.9 1.4 2.9 3.1 0 .5-.1 1-.4 1.4 1.3-.9 3.1-.6 4 .7 1 1.3.8 3.1-.4 4.1.5-.1 1 0 1.5.2 1.5.7 2.1 2.4 1.4 3.9-.7 1.5-2.4 2.1-3.9 1.4-.4-.2-.8-.5-1.1-.9.1 1.6-1 3-2.6 3.3-1.6.3-3.1-.8-3.4-2.4-.4.4-.8.7-1.3.9-1.5.6-3.2-.1-3.8-1.6-.6-1.5.1-3.2 1.6-3.8.4-.2.9-.3 1.4-.2-1.2-1-1.4-2.8-.4-4.1.9-1.3 2.7-1.6 4-.7-.3-.5-.4-.9-.4-1.4 0-1.7 1.3-3.1 2.9-3.1zm0 6.3a3.2 3.2 0 100 6.4 3.2 3.2 0 000-6.4z" />
  </svg>
);
export const Albums = (p: P) => (
  <svg {...base({ strokeWidth: 1.8, ...p })}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
  </svg>
);
export const ForYou = (p: P) => (
  <svg {...base({ strokeWidth: 1.8, ...p })}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="M12 16.2s-4-2.5-4-5.3a2.3 2.3 0 014-1.4 2.3 2.3 0 014 1.4c0 2.8-4 5.3-4 5.3z" />
  </svg>
);
export const Photo = (p: P) => (
  <svg {...base({ strokeWidth: 1.8, ...p })}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="8.5" cy="10" r="1.5" />
    <path d="M21 16l-5-5-8 8" />
  </svg>
);
export const Clock = (p: P) => (
  <svg {...base({ strokeWidth: 1.8, ...p })}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const Star = (p: P) => (
  <svg {...base({ strokeWidth: 1.8, ...p })}>
    <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8z" />
  </svg>
);
export const Pin = (p: P) => (
  <svg {...base({ strokeWidth: 1.8, ...p })}>
    <path d="M12 21s-6-5.5-6-10a6 6 0 0112 0c0 4.5-6 10-6 10z" />
    <circle cx="12" cy="11" r="2" />
  </svg>
);
export const Film = (p: P) => (
  <svg {...base({ strokeWidth: 1.8, ...p })}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
  </svg>
);
export const Frame = (p: P) => (
  <svg {...base({ strokeWidth: 1.8, ...p })}>
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <rect x="7" y="7" width="10" height="10" />
  </svg>
);
export const Grid = (p: P) => (
  <svg {...base({ strokeWidth: 1.8, ...p })}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
  </svg>
);
export const Sidebar = (p: P) => (
  <svg {...base({ strokeWidth: 1.8, ...p })}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
  </svg>
);
export const House = (p: P) => (
  <svg {...base({ strokeWidth: 1.8, ...p })}>
    <path d="M3 11.5L12 4l9 7.5" />
    <path d="M5.5 10.5V20h13v-9.5" />
    <path d="M10 20v-5h4v5" />
  </svg>
);
