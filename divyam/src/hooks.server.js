export const handle = async ({ event, resolve }) => {
    try {
        // Handle OPTIONS requests for CORS preflight
        if (event.request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept'
                }
            });
        }

        // Forward `/api` requests to the external API
        if (event.url.pathname.startsWith('/api')) {
            const apiPath = event.url.pathname.replace('/api', '');
            const apiUrl = new URL(apiPath, 'https://api-tst.trymighty.com');
            
            // Copy query parameters
            event.url.searchParams.forEach((value, key) => {
                apiUrl.searchParams.append(key, value);
            });

            let body;
            if (event.request.method !== 'GET') {
                const contentType = event.request.headers.get('content-type');
                if (contentType?.includes('application/json')) {
                    body = await event.request.json();
                } else {
                    body = await event.request.text();
                }
            }

            console.log('Request URL:', apiUrl.toString());
            console.log('Request method:', event.request.method);
            console.log('Request headers:', Object.fromEntries(event.request.headers));
            if (body) console.log('Request body:', body);

            const response = await fetch(apiUrl, {
                method: event.request.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': event.request.headers.get('origin') || '*',
                    'Authorization': event.request.headers.get('authorization')
                },
                body: body ? JSON.stringify(body) : undefined,
                credentials: 'include'  // Include cookies
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers));

            // Handle 204 No Content responses
            if (response.status === 204) {
                return new Response(null, {
                    status: 204,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
                        'Access-Control-Allow-Credentials': 'true'
                    }
                });
            }

            const contentType = response.headers.get('content-type');
            let responseBody;
            
            try {
                responseBody = contentType?.includes('application/json')
                    ? await response.json()
                    : await response.text();
                console.log('Response body:', responseBody);
            } catch (e) {
                console.error('Error parsing response:', e);
                responseBody = await response.text();
                console.log('Response text:', responseBody);
            }

            return new Response(
                typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody),
                {
                    status: response.status,
                    statusText: response.statusText,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
                        'Access-Control-Allow-Credentials': 'true',
                        'Content-Type': contentType || 'application/json'
                    }
                }
            );
        }

        return resolve(event);
    } catch (error) {
        console.error('Server Error:', error);
        return new Response(
            JSON.stringify({ 
                error: 'Internal Server Error',
                message: error.message 
            }), 
            { 
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
                    'Access-Control-Allow-Credentials': 'true'
                }
            }
        );
    }
};
