export default function Logo() {
  return (
    <svg
      width="36"
      height="40"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100%" height="100%" fill="#ffffff"/>
      <g stroke="#f97316" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <g transform="rotate(-45 100 100)">
          <path d="M 104,88 L 104,15 C 80,25 80,80 88,88 " />
          <path d="M 98,110 L 100,165" />
        </g>
        <g transform="rotate(45 100 100)">
          <path d="M 100,165 100,100 L 100,35 Z 100,15 " />
          <path d="M 76,35 L 76,60 C 76,85 124,85 124,60 L 124,35" />
        </g>
      </g>
    </svg>
  )
}


