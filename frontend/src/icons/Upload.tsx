import Base from "./Base";

export default function UploadIcon({ className }: { className?: string }) {
    return (
        <Base className={className}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M16.0001 6.00004L16.0001 19.3334M16.0001 6.00004C15.0664 6.00004 13.3221 8.65911 12.6667 9.33337M16.0001 6.00004C16.9337 6.00004 18.678 8.65911 19.3334 9.33337"
                    stroke="#ACACAC"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M26.6667 22C26.6667 25.3093 25.976 26 22.6667 26H9.33337C6.02404 26 5.33337 25.3093 5.33337 22"
                    stroke="#ACACAC"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </Base>
    )
}