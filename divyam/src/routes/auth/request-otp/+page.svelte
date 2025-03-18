<script>
    import { goto } from '$app/navigation';
    import Logo from '../../../assets/Logo.svg';

    // State variables with more descriptive names
    let selectedCountryCode = '91';
    let userPhoneNumber = '';
    let isLoading = false;
    let errorMessage = '';

    // API endpoint configuration
    const API_ENDPOINT = '/api/v2/collaborators';
    const API_HEADERS = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    // Validation function
    function validatePhoneNumber(phoneNumber) {
        return phoneNumber && phoneNumber.length >= 10;
    }

    // Error handling function
    function handleApiError(response) {
        return response.clone().json()
            .catch(() => response.text())
            .then(errorData => {
                throw new Error(errorData.message || 'Unknown error occurred');
            });
    }

    // Main OTP request function
    async function handleOTPRequest() {
        if (!validatePhoneNumber(userPhoneNumber)) {
            errorMessage = 'Please enter a valid phone number.';
            return;
        }

        isLoading = true;
        errorMessage = '';

        try {
            const response = await fetch(`${API_ENDPOINT}?action=request-otp`, {
                method: 'POST',
                headers: API_HEADERS,
                body: JSON.stringify({
                    phone: {
                        countryCode: selectedCountryCode,
                        number: userPhoneNumber
                    }
                })
            });

            if (response.status === 204) {
                const params = new URLSearchParams({
                    countryCode: selectedCountryCode,
                    phoneNumber: userPhoneNumber
                });
                goto(`/auth/validate-otp?${params.toString()}`);
            } else {
                await handleApiError(response);
            }
        } catch (error) {
            errorMessage = error.message || 'Network error. Please try again.';
            console.error('OTP Request Error:', error);
        } finally {
            isLoading = false;
        }
    }
</script>

<!-- Logo header -->
<div class="fixed top-0 w-full flex gap-x-2 p-4 sm:p-5 bg-black/30 backdrop-blur-lg border-b border-white/10">
    <img src={Logo} alt="Logo" class="h-8 sm:h-auto filter invert"> 
    <h1 class="text-[1.1rem] sm:text-[1.3rem] font-bold text-white">DIVYAM</h1>
</div>

<div class="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 relative">
    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50 pointer-events-none"></div>
    
    <!-- Content -->
    <div class="relative z-10 max-w-md w-full">
        <div class="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h1 class="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent mb-8">
                Enter your phone number
            </h1>

            <div class="flex gap-4 mb-6">
                <div class="w-1/4">
                    <input 
                        type="text" 
                        bind:value={selectedCountryCode}
                        placeholder="Code"
                        class="w-full h-14 text-center text-xl bg-white/5 border-b-2 border-white/20 focus:border-white/50 text-white placeholder-gray-400 focus:outline-none transition-all rounded-lg"
                    />
                </div>
                <div class="w-3/4">
                    <input 
                        type="text" 
                        bind:value={userPhoneNumber}
                        placeholder="Phone Number"
                        class="w-full h-14 text-xl px-4 bg-white/5 border-b-2 border-white/20 focus:border-white/50 text-white placeholder-gray-400 focus:outline-none transition-all rounded-lg"
                    />
                </div>
            </div>

            {#if errorMessage}
                <p class="text-red-400 text-sm mb-4">{errorMessage}</p>
            {/if}

            <button 
                on:click={handleOTPRequest}
                disabled={isLoading}
                class="w-full bg-gradient-to-r from-white via-gray-200 to-white text-black rounded-2xl px-8 py-3 mt-8 font-medium transition-all duration-300 hover:opacity-90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Requesting...' : 'Request OTP'}
            </button>
        </div>
    </div>
</div>


