import clsx from "clsx";

type ClassValue = Parameters<typeof clsx>[number];

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
