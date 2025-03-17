import Base from "./Base";

export default function SubmitIcon({ className }: { className?: string }) {
	return (
		<Base className={className}>
			<svg
				width="17"
				height="14"
				viewBox="0 0 17 14"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M2 7H15.5M15.5 7L11 1.5M15.5 7L11 12.5"
					stroke="white"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</Base>
	);
}
