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
