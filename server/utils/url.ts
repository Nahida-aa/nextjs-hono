
export const getBaseUrl = async () => process.env.NODE_ENV === 'development' ? process.env.__NEXT_PRIVATE_ORIGIN : process.env.NEXT_PUBLIC_URL