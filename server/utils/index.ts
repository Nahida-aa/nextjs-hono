import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ApplicationError extends Error {
  info: string;
  status: number;
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      'An error occurred while fetching the data.',
    ) as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};


export const formatTimestamp = (timestamp: Date): string => {
  const now = new Date();
  const isSameDay = timestamp.toDateString() === now.toDateString();
  const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === timestamp.toDateString();
  const isThisWeek = now.getTime() - timestamp.getTime() < 7 * 24 * 60 * 60 * 1000;
  const isThisYear = now.getFullYear() === timestamp.getFullYear();

  if (isSameDay) {
    return `${timestamp.getHours()}:${timestamp.getMinutes().toString().padStart(2, '0')}`;
  } else if (isYesterday) {
    return `昨天 ${timestamp.getHours()}:${timestamp.getMinutes().toString().padStart(2, '0')}`;
  } else if (isThisWeek) {
    const daysOfWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return daysOfWeek[timestamp.getDay()];
  } else if (isThisYear) {
    return `${timestamp.getMonth() + 1}/${timestamp.getDate()}`;
  } else {
    return `${timestamp.getFullYear()}/${timestamp.getMonth() + 1}/${timestamp.getDate()}`;
  }
};