export function load({ url }) {
    const countryCode = url.searchParams.get('countryCode');
    const phoneNumber = url.searchParams.get('phoneNumber');

    if (!countryCode || !phoneNumber) {
        return {
            error: 'Phone number data is missing. Please try requesting OTP again.'
        };
    }

    return {
        countryCode,
        phoneNumber
    };
} 