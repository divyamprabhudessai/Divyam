<script>
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore.js';

    export let data;

    let otpDigits = ['', '', '', ''];
    let isLoading = false;
    let errorMessage = '';
    let otpInputRefs = [];

    function handleOTPInput(index, event) {
        const value = event.target.value;
        if (validateOTPInput(value)) {
            otpDigits[index] = value;
            if (index < 3) {
                otpInputRefs[index + 1].focus();
            }
        } else {
            otpDigits[index] = '';
        }
        otpDigits = [...otpDigits]; // Trigger reactivity
    }

    function handleOTPKeydown(index, event) {
        if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpInputRefs[index - 1].focus();
        }
    }

    function handleOTPPaste(event) {
        event.preventDefault();
        const pastedData = event.clipboardData.getData('text');
        const numbers = pastedData.replace(/\D/g, '').slice(0, 4).split('');
        
        otpDigits = [...otpDigits.map((_, index) => numbers[index] || '')];
        
        const nextEmptyIndex = otpDigits.findIndex(digit => !digit);
        if (nextEmptyIndex !== -1) {
            otpInputRefs[nextEmptyIndex].focus();
        } else if (otpDigits[3]) {
            otpInputRefs[3].focus();
        }
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

<!-- Content -->
<div class="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 relative">
    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50 pointer-events-none"></div>
    
    <!-- Content -->
    <div class="relative z-10 max-w-md w-full">
        <div class="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h1 class="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent mb-8">
                Enter the OTP Code
            </h1>

            <div class="flex flex-col gap-6 w-full max-w-[280px] mx-auto">
                <div class="flex flex-col gap-4">
                    <label class="text-white/70 text-sm">Enter OTP</label>
                    <div class="flex justify-between gap-2">
                        {#each otpDigits as _, index}
                            <input
                                id={`otp-input-${index}`}
                                type="text"
                                maxlength="1"
                                class="w-12 h-16 text-center text-xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                                bind:value={otpDigits[index]}
                                bind:this={otpInputRefs[index]}
                                on:input={(event) => handleOTPInput(index, event)}
                                on:keydown={(event) => handleOTPKeydown(index, event)}
                                on:paste={handleOTPPaste}
                                inputmode="numeric"
                            />
                        {/each}
                    </div>
                </div>

                <button
                    on:click={validateOTP}
                    disabled={isLoading || otpDigits.join('').length !== 4}
                    class="w-full h-16 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white font-medium hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                >
                    {#if isLoading}
                        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Validating...
                    {:else}
                        Validate OTP
                    {/if}
                </button>
            </div>

            {#if errorMessage}
                <p class="text-red-400 text-sm mb-4">{errorMessage}</p>
            {/if}
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
