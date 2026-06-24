const KEY = 'waha-dashboard.clientId'

function generate(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }
    return `c-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

export function getClientId(): string {
    if (typeof localStorage === 'undefined') {
        return generate()
    }
    let id = localStorage.getItem(KEY)
    if (!id) {
        id = generate()
        localStorage.setItem(KEY, id)
    }
    return id
}
