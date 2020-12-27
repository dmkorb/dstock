export const handleAxiosError = (error) => {
    if (error.response) {
        throw {
            code: error.response.status,
            message: error.response.data.message,
            data: error.response.data
        };
    }

    throw error;
}