/**
 * Reusable CSS class combinations for common UI patterns
 */

// Avatar styles
export const avatarStyles = {
  ai: 'shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-lg font-semibold shadow-md',
  user: 'w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-full flex items-center justify-center text-lg font-semibold shadow-md',
  large: 'w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg',
} as const;

// Message styles
export const messageStyles = {
  user: 'max-w-[75%] rounded-2xl px-4 py-3 shadow-sm bg-blue-500 text-white',
  assistant: 'max-w-[75%] rounded-2xl px-4 py-3 shadow-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
} as const;