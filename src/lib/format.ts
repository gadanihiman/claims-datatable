import { format } from 'date-fns';

export const formatUSD = (cents: number) =>
	`$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

export const formatD = (iso: string) => format(new Date(iso), 'MMM dd, yyyy');
export const formatT = (iso: string) => format(new Date(iso), 'p');
