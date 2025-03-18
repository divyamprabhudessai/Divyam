<script>
    import { goto } from '$app/navigation';
    import Logo from '../assets/Logo.svg';

    function handleGetStarted() {
        goto('/auth/request-otp');
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
    <div class="relative z-10 max-w-2xl w-full">
        <div class="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h1 class="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                Welcome to DIVYAM
            </h1>
            <p class="text-gray-300 mt-4 text-center max-w-md text-sm sm:text-base mx-auto">
                Experience seamless order management with our intuitive dashboard. Sign in with your phone number to get started.
            </p>
            <p class="text-gray-400 mt-2 text-center text-xs sm:text-sm">
                Your one-stop solution for efficient order tracking and management.
            </p>

            <button 
                on:click={handleGetStarted}
                class="w-full sm:w-auto bg-gradient-to-r from-white via-gray-200 to-white text-black rounded-2xl px-8 py-3 mt-8 font-medium transition-all duration-300 hover:opacity-90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black mx-auto block">
                Get Started
            </button>
        </div>
    </div>
</div>
