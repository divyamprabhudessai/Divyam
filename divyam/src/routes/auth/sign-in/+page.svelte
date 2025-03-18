<script>
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore.js';
    import Logo from '../../../assets/Logo.svg';

    export let data;

    // State variables with more descriptive names
    let otpDigits = ['', '', '', ''];
    let otpInputRefs = [];
    let isLoading = false;
    let errorMessage = '';

    // API endpoint configuration
    const API_ENDPOINT = '/api/v2/collaborators';
    const API_HEADERS = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    // Validation function
    function validateOTPInput(value) {
        return /^\d$/.test(value);
    }

    // Error handling function
    function handleApiError(response) {
        return response.clone().json()
            .catch(() => response.text())
            .then(errorData => {
                throw new Error(errorData.message || 'Unknown error occurred');
            });
    }

    // Input handling functions
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

    // Main sign-in function
    async function handleSignIn() {
        if (!data?.countryCode || !data?.phoneNumber) {
            errorMessage = 'Phone number data is missing. Please try requesting OTP again.';
            goto('/auth/request-otp');
            return;
        }

        isLoading = true;
        errorMessage = '';

        try {
            const response = await fetch(`${API_ENDPOINT}?action=sign-in`, {
                method: 'POST',
                headers: API_HEADERS,
                body: JSON.stringify({
                    phone: {
                        countryCode: data.countryCode,
                        number: data.phoneNumber
                    },
                    otp: {
                        code: otpDigits.join('')
                    }
                })
            });

            if (response.status === 200) {
                const signInData = await response.json();
                authStore.set({ token: signInData.token });

                if (typeof window !== 'undefined') {
                    localStorage.setItem('authToken', signInData.token);
                }

                goto('/orders');
            } else {
                await handleApiError(response);
            }
        } catch (error) {
            errorMessage = error.message || 'Network error. Please check your connection and try again.';
            console.error('Sign In Error:', error);
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Logo header -->
    <div class="flex gap-x-2 p-5">
        <img src={Logo} alt="Logo"> 
        <h1 class="text-[1.3rem] font-bold">MIGHTY X ABRA</h1>
    </div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col items-center justify-center px-6 pb-6">
        <div class="bg-white rounded-lg shadow-md w-full max-w-md p-8">
            <h1 class="text-2xl font-bold text-center text-gray-900 mb-8">
                Enter the OTP to<br>sign in to your account
            </h1>

            <div class="flex justify-center gap-4 mb-10">
                {#each otpDigits as _, index}
                    <div class="relative">
                        <input
                            id={`otp-input-${index}`}
                            type="text"
                            maxlength="1"
                            class="w-12 h-14 text-center text-xl border-b-2 border-black focus:outline-none focus:border-blue-500"
                            bind:value={otpDigits[index]}
                            bind:this={otpInputRefs[index]}
                            on:input={(e) => handleOTPInput(index, e)}
                            on:keydown={(e) => handleOTPKeydown(index, e)}
                            on:paste={handleOTPPaste}
                            inputmode="numeric"
                        />
                    </div>
                {/each}
            </div>

            {#if errorMessage}
                <p class="text-red-500 text-center mb-4">{errorMessage}</p>
            {/if}

            <button 
                on:click={handleSignIn}
                disabled={isLoading || otpDigits.join('').length !== 4}
                class="w-full border-2 p-3 rounded-2xl bg-white text-black hover:text-white hover:bg-black transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Signing in...' : 'Sign In'}
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
        -webkit-box-shadow: 0 0 0 30px white inset !important;
    }
</style> 