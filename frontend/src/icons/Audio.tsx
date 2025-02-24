import Base from "./Base";

export default function AudioIcon({ className }: { className?: string }) {
    return (
        <Base className={className}>
            <svg width="16" height="21" viewBox="0 0 16 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.0625 18.0042V20.5417H6.64583V18.0042C3.02083 17.5208 0.241667 14.5 0 10.875H2.41667C2.65833 13.5333 5.075 15.7083 7.85417 15.7083C10.6333 15.7083 12.9292 13.5333 13.2917 10.875H15.7083C15.3458 14.5 12.5667 17.5208 9.0625 18.0042ZM7.85417 0C9.54583 0 10.875 1.32917 10.875 3.02083V10.2708C10.875 11.9625 9.54583 13.2917 7.85417 13.2917C6.1625 13.2917 4.83333 11.9625 4.83333 10.2708V3.02083C4.83333 1.32917 6.1625 0 7.85417 0Z" fill="currentColor" />
            </svg>
        </Base>
    )
}
