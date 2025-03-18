<script>
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore.js';

    export let data;

    let otpDigits = ['', '', '', ''];
    let isLoading = false;
    let errorMessage = '';

    function handleOTPInput(event, index) {
        const value = event.target.value;
        if (validateOTPInput(value)) {
            otpDigits[index] = value;
            if (index < 3) {
                document.getElementById(`otp-input-${index + 1}`).focus();
            }
        } else {
            otpDigits[index] = '';
        }
        otpDigits = [...otpDigits]; // Trigger reactivity
    }

    function validateOTPInput(value) {
        return /^\d$/.test(value);
    }

    async function validateOTP() {
        const enteredOTP = otpDigits.join('');

        if (!data?.countryCode || !data?.phoneNumber) {
            errorMessage = 'Phone number data is missing. Please try requesting OTP again.';
            goto('/auth/request-otp');
            return;
        }

        isLoading = true;
        errorMessage = '';

        try {
            const response = await fetch('/api/v2/collaborators?action=validate-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    phone: {
                        countryCode: data.countryCode,
                        number: data.phoneNumber
                    },
                    otp: {
                        code: enteredOTP
                    }
                })
            });

            if (response.status === 204) {
                const params = new URLSearchParams({
                    countryCode: data.countryCode,
                    phoneNumber: data.phoneNumber
                });
                goto(`/auth/sign-in?${params.toString()}`);
            } else {
                const responseClone = response.clone();
                try {
                    const errorData = await responseClone.json();
                    errorMessage = errorData.message || 'Unknown error';
                } catch (parseError) {
                    const errorText = await response.text();
                    errorMessage = errorText || 'Unknown error';
                }
            }
        } catch (error) {
            console.error('OTP Validation Error:', error);
            errorMessage = 'Network error. Please try again.';
        } finally {
            isLoading = false;
        }
    }
</script>

<!-- Logo -->
<div class="flex justify-center mb-8">
    <img src="https://img.hotimg.com/allmighty_logo06ba4eaa2ca37a4d.jpeg" alt="Logo" class="h-8 w-auto filter invert">
</div>

<div class="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 relative">
    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50 pointer-events-none"></div>
    
    <!-- Content -->
    <div class="relative z-10 max-w-md w-full">
        <div class="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h1 class="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent mb-8">
                Enter the OTP Code
            </h1>

            <div class="flex justify-center gap-4 mb-10">
                {#each otpDigits as _, index}
                    <div class="relative">
                        <input
                            id={`otp-input-${index}`}
                            type="text"
                            maxlength="1"
                            class="w-12 h-14 text-center text-xl bg-white/5 border-b-2 border-white/20 focus:border-white/50 text-white placeholder-gray-400 focus:outline-none transition-all rounded-lg"
                            bind:value={otpDigits[index]}
                            on:input={(event) => handleOTPInput(event, index)}
                            inputmode="numeric"
                        />
                    </div>
                {/each}
            </div>

            {#if errorMessage}
                <p class="text-red-400 text-sm mb-4">{errorMessage}</p>
            {/if}

            <button 
                on:click={validateOTP}
                disabled={isLoading || otpDigits.join('').length !== 4}
                class="w-full bg-gradient-to-r from-white via-gray-200 to-white text-black rounded-2xl px-8 py-3 font-medium transition-all duration-300 hover:opacity-90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Validating...' : 'Verify OTP'}
            </button>
        </div>
    </div>
</div>

<style>
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    input:-webkit-autofill {
        -webkit-box-shadow: 0 0 0 30px white inset !important;
    }
</style>
