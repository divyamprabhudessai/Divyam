<script>
    import { goto } from '$app/navigation';

    let countryCode = '91';
    let phoneNumber = '';
    let isLoading = false;
    let errorMessage = '';

    async function requestOTP() {
        if (!phoneNumber || phoneNumber.length < 10) {
            errorMessage = 'Please enter a valid phone number.';
            return;
        }

        isLoading = true;
        errorMessage = '';

        try {
            const res = await fetch('/api/v2/collaborators?action=request-otp', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    phone: {
                        countryCode: countryCode,
                        number: phoneNumber
                    }
                })
            });

            if (res.status === 204) {
                goto(`/auth/validate-otp?countryCode=${encodeURIComponent(countryCode)}&phoneNumber=${encodeURIComponent(phoneNumber)}`);
            } else {
                const responseClone = res.clone();
                try {
                    const errorData = await responseClone.json();
                    errorMessage = errorData.message || 'Unknown error';
                } catch (parseError) {
                    const errorText = await res.text();
                    errorMessage = errorText || 'Unknown error';
                }
            }
        } catch (error) {
            console.error('Error requesting OTP:', error);
            errorMessage = 'Network error. Please try again.';
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 relative">
    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50 pointer-events-none"></div>
    
    <!-- Logo header -->
    <div class="fixed top-0 w-full flex items-center justify-between p-4 sm:p-5 bg-black/30 backdrop-blur-lg border-b border-white/10 z-50">
        <div class="flex items-center gap-4">
            <img 
                src="https://img.hotimg.com/allmighty_logo-removebg-preview.png" 
                alt="Logo" 
                class="h-12 sm:h-14 w-auto brightness-0 invert opacity-90 hover:opacity-100 transition-opacity duration-200"
            > 
        </div>
        <a 
            href="/"
            class="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition-colors duration-200 text-white/90 hover:text-white"
        >
            <span>Home</span>
            <svg 
                class="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="2" 
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
            </svg>
        </a>
    </div>
    
    <!-- Content -->
    <div class="relative z-10 max-w-md w-full">
        <div class="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h1 class="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent mb-8">
                Enter your phone number
            </h1>

            <div class="relative flex gap-4 mb-6">
                <div class="w-1/3 relative">
                    <div class="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-xl"></div>
                    <input 
                        type="text" 
                        bind:value={countryCode}
                        placeholder="Code"
                        class="relative w-full h-16 text-center text-xl bg-transparent border border-white/20 focus:border-white/40 text-white placeholder-gray-400 focus:outline-none transition-all rounded-xl backdrop-blur-sm"
                    />
                </div>
                <div class="w-2/3 relative">
                    <div class="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-xl"></div>
                    <input 
                        type="text" 
                        bind:value={phoneNumber}
                        placeholder="Phone Number"
                        class="relative w-full h-16 text-xl px-4 bg-transparent border border-white/20 focus:border-white/40 text-white placeholder-gray-400 focus:outline-none transition-all rounded-xl backdrop-blur-sm"
                    />
                </div>
            </div>

            {#if errorMessage}
                <p class="text-red-400 text-sm mb-4">{errorMessage}</p>
            {/if}

            <button 
                on:click={requestOTP}
                disabled={isLoading}
                class="group relative w-full overflow-hidden rounded-2xl px-8 py-3 mt-8 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <!-- Gradient background -->
                <div class="absolute inset-0 bg-gradient-to-r from-white via-gray-200 to-white opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                
                <!-- Animated border -->
                <div class="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-white/40 transition-colors duration-300"></div>
                
                <!-- Content -->
                <div class="relative flex items-center justify-center gap-2">
                    <span class="text-black font-semibold">
                        {isLoading ? 'Requesting...' : 'Request OTP'}
                    </span>
                    {#if !isLoading}
                        <svg 
                            class="w-5 h-5 text-black transform group-hover:translate-x-1 transition-transform duration-300" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                stroke-linecap="round" 
                                stroke-linejoin="round" 
                                stroke-width="2" 
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                        </svg>
                    {/if}
                </div>
            </button>
        </div>
    </div>
</div>

<style>
    /* Remove spinner buttons from number inputs */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Remove background color when autofilled */
    input:-webkit-autofill {
        -webkit-box-shadow: 0 0 0 30px transparent inset !important;
    }

    /* Add subtle glow effect on focus */
    input:focus {
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
    }
</style>