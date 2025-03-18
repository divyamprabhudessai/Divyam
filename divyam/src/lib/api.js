export async function api(endpoint, method, body) {
    return await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
}
