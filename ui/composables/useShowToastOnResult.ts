import {useToast} from 'primevue/usetoast';

const useShowToastOnResult = () => {
    const toast = useToast();

    function req(
        promise,
        successHeader?: string,
        errorHeader?: string,
        successDetail?: string,
        errorDetail?: string,
        rethrow = true,
    ) {
        return promise
            .then((result) => {
                if (successHeader) {
                    toast.add({
                        severity: 'success',
                        summary: successHeader,
                        detail: successDetail,
                        life: 3000
                    });
                }
                return result
            })
            .catch((error) => {
                if (errorHeader) {
                    let details = []
                    if (errorDetail) {
                        details.push(errorDetail)
                    }
                    if (error.response?.data?.message) {
                        details.push(`Message: ${error.response.data.message}`)
                    }
                    if (error.response?.data?.error) {
                        details.push(`Error: ${error.response.data.error}`)
                    }
                    if (error.response?.status) {
                        details.push(`Status: ${error.response.status}`)
                    }
                    if (error.response?.data) {
                        details.push()
                        details.push(`Response: ${JSON.stringify(error.response.data)}`)
                    }
                    if (details.length === 0) {
                        details.push(error)
                    }
                    toast.add({
                        severity: 'error',
                        summary: errorHeader,
                        detail: details.join("\n"),
                    });
                }
                if (!rethrow) {
                    console.error('Error occurred', error)
                    return
                }
                throw error
            });
    }

    return req
}

export {useShowToastOnResult}
export default useShowToastOnResult
