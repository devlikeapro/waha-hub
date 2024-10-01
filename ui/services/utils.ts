export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function dashboard(url: string) {
    if (!url) {
        return url
    }
    if (url.endsWith("/")) {
        return `${url}dashboard`
    }
    return `${url}/dashboard`
}
