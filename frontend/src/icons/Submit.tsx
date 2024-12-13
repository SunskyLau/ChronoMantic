import Base from "./Base";

export default function SubmitIcon({ className }: { className?: string }) {
    return (
        <Base className={className}>
            <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx="16" cy="16" r="16" fill="black" />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.8491 10.0268C14.4661 9.66621 14.4479 9.06347 14.8085 8.68049C15.169 8.29751 15.7717 8.27932 16.1547 8.63986L23.044 15.1254C23.3826 15.2714 23.6196 15.6082 23.6196 16.0004C23.6196 16.3926 23.3825 16.7294 23.0438 16.8754L16.1547 23.3608C15.7717 23.7213 15.169 23.7031 14.8085 23.3202C14.4479 22.9372 14.4661 22.3344 14.8491 21.9739L20.1828 16.9528H9.33319C8.80721 16.9528 8.38081 16.5264 8.38081 16.0004C8.38081 15.4744 8.80721 15.048 9.33319 15.048H20.1829L14.8491 10.0268Z"
                    fill="white"
                />
            </svg>
        </Base>
    )
}