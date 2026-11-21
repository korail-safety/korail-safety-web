import type { SVGProps } from "react";

// Figma 에셋을 내려받을 수 없어 동일한 형태로 다시 그린 아이콘.
// 색상은 currentColor를 따른다.

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="8"
      height="4"
      viewBox="0 0 8 4"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M0.5 0.5L4 3.5L7.5 0.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <circle
        cx="5.5"
        cy="5.5"
        r="4.75"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9 9L12.25 12.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="10"
      height="18"
      viewBox="0 0 10 18"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M8.5 1.5L1.5 9L8.5 16.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="12"
      height="16"
      viewBox="0 0 12 16"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M6 15V1M6 1L1 6M6 1L11 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="12"
      height="10"
      viewBox="0 0 12 10"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M1 5.2L4.3 8.5L11 1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DocumentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="24"
      viewBox="0 0 20 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12 1H4a3 3 0 0 0-3 3v16a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8l-7-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 1v7h7M6 13h8M6 17h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FilmIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="20"
      viewBox="0 0 24 20"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="1"
        y="1"
        width="22"
        height="18"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9.5 6.5v7l6-3.5-6-3.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M9.5 1.5l3 3L4.5 12.5H1.5v-3l8-8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M1.5 3.5h11M5 3.5V2h4v1.5M3 3.5l.7 9h6.6l.7-9M5.8 6v4.5M8.2 6v4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M1.5 9S4.2 3.75 9 3.75 16.5 9 16.5 9 13.8 14.25 9 14.25 1.5 9 1.5 9Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function EyeOffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M7.4 3.9A6.9 6.9 0 0 1 9 3.75C13.8 3.75 16.5 9 16.5 9a12.6 12.6 0 0 1-1.95 2.6M10.6 10.65A2.25 2.25 0 0 1 7.35 7.4M12.9 12.95A7.4 7.4 0 0 1 9 14.25C4.2 14.25 1.5 9 1.5 9a12.9 12.9 0 0 1 3.6-3.95M1.5 1.5l15 15"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
