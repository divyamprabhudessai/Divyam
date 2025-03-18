/** @type {import('./$types').PageLoad} */
export function load({ params }) {
    return {
        orderId: params.orderId
    };
} 