<script>
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore.js';
    import Logo from '../../../assets/Logo.svg'

    export let data;

    let otpCode = ['', '', '', ''];

    function handleInput(event, index) {
        const value = event.target.value;
        if (/\d/.test(value)) {
            otpCode[index] = value;
            if (index < 3) {
                document.getElementById(`otp-input-${index + 1}`).focus();
            }
        } else {
            otpCode[index] = '';
        }
    }

    async function validateOTP() {
        const enteredOTP = otpCode.join('');

        if (!data?.countryCode || !data?.phoneNumber) {
            alert('Phone number data is missing. Please try requesting OTP again.');
            goto('/auth/request-otp');
            return;
        }

        const requestBody = {
            phone: {
                countryCode: data.countryCode,
                number: data.phoneNumber
            },
            otp: {
                code: enteredOTP
            }
        };

        const validateRes = await fetch('/api/v2/collaborators?action=validate-otp', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (validateRes.status === 204) {
            goto(`/auth/sign-in?countryCode=${encodeURIComponent(data.countryCode)}&phoneNumber=${encodeURIComponent(data.phoneNumber)}`);
        } else {
            alert('Failed to validate OTP. Please try again.');
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
                Enter the OTP Code
            </h1>

            <div class="flex justify-center gap-4 mb-10">
                {#each otpCode as _, index}
                    <div class="relative">
                        <input
                            id={`otp-input-${index}`}
                            type="text"
                            maxlength="1"
                            class="w-12 h-14 text-center text-xl bg-white/5 border-b-2 border-white/20 focus:border-white/50 text-white placeholder-gray-400 focus:outline-none transition-all rounded-lg"
                            bind:value={otpCode[index]}
                            on:input={(event) => handleInput(event, index)}
                        />
                    </div>
                {/each}
            </div>

            <button 
                on:click={validateOTP} 
                class="w-full bg-gradient-to-r from-white via-gray-200 to-white text-black rounded-2xl px-8 py-3 font-medium transition-all duration-300 hover:opacity-90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
            >
                Verify OTP
            </button>
        </div>
    </div>
</div>
