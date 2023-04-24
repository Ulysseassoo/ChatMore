export const dateFormatted = (created_at: string) => {
	const splittedDate = new Date(created_at)
		.toLocaleTimeString([], {
			hourCycle: "h23",
			hour: "2-digit",
			minute: "2-digit",
			second: "numeric",
		})
		.split(":");

	return `${splittedDate[0]}:${splittedDate[1]}`;
};
