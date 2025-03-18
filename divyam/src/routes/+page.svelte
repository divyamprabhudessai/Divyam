<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    let isVisible = false;

    onMount(() => {
        isVisible = true;
    });

    function handleGetStarted() {
        goto('/auth/request-otp');
    }
</script>

<div class="min-h-screen flex flex-col px-4 sm:px-6 relative">
    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50 pointer-events-none"></div>
    
    <!-- Content -->
    <div class="flex-1 flex flex-col">
        <!-- Main Content -->
        <div class="relative z-10 mt-[8vw]">
            <div class="max-w-4xl w-full text-center mx-auto">
                <div class="space-y-6">
                    <!-- Main heading with animation -->
                    <h1 
                        class="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent opacity-0 transition-all duration-1000"
                        class:opacity-100={isVisible}
                        class:translate-y-0={isVisible}
                        style="transform: translateY(20px);"
                    >
                        Effortless Order Management
                    </h1>

                    <!-- Subheading with animation -->
                    <p 
                        class="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto opacity-0 transition-all duration-1000 delay-300"
                        class:opacity-100={isVisible}
                        class:translate-y-0={isVisible}
                        style="transform: translateY(20px);"
                    >
                        Streamline your orders with our intuitive dashboard. Track, manage, and stay in control—all in one place.
                    </p>

                    <!-- Animated arrow button -->
                    <div 
                        class="mt-8 opacity-0 transition-all duration-1000 delay-500"
                        class:opacity-100={isVisible}
                        class:translate-y-0={isVisible}
                        style="transform: translateY(20px);"
                    >
                        <button 
                            on:click={handleGetStarted}
                            class="group relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300"
                        >
                            <svg 
                                class="w-6 h-6 text-white transform group-hover:translate-x-1 transition-transform duration-300" 
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
                        </button>
                    </div>
                </div>
            </div>
        </div>

 <div class="relative z-10 container mx-auto px-4 mt-16 md:mt-24">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-3xl md:text-4xl font-bold mb-8 text-white">Demo Video</h2>
      <div class="relative w-full max-w-3xl mx-auto aspect-video rounded-lg overflow-hidden shadow-2xl">
        <iframe
          src="https://streamable.com/e/kfq0nd"
          class="absolute inset-0 w-full h-full"
          frameborder="0"
          allowfullscreen
          allow="autoplay; fullscreen"
        ></iframe>
      </div>
    </div>
  </div>

      
    </div>
</div>

<style>
    /* Add a subtle pulse animation to the button */
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }

    button {
        animation: pulse 2s infinite;
    }
</style>
