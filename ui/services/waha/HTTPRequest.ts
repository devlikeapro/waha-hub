export interface HTTPRequest {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    uri: string;
    params: any;
    body?: any;
    headers?: Record<string, string>;
}
