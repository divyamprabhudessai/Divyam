<script>
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore.js';
    import { get } from 'svelte/store';
    import Logo from '../../assets/Logo.svg';
    import OrdersIcon from '../../assets/Orders.svg';
    import Logout from '../../assets/Logout.svg';

    export let showMenu = false;

    // Create a dispatch function to communicate with parent
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    function toggleMenu() {
        dispatch('toggleMenu');
    }

    function handleLogout() {
        try {
            const auth = get(authStore);
            authStore.set(null);

            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth');
                localStorage.removeItem('authToken');
            }

            goto('/auth/request-otp');
        } catch (error) {
            console.error('Error during logout:', error);
            goto('/auth/request-otp');
        }
    }
</script>

<!-- Desktop Sidebar -->
<div class="hidden sm:flex w-1/5 h-screen flex-col bg-black/30 backdrop-blur-lg border-r border-white/10">
    <div class="flex items-center gap-x-2 p-5 border-b border-white/10">
        <img src={Logo} alt="Logo" class="h-8 w-auto filter invert"> 
        <h1 class="text-[1.3rem] font-bold text-white">DIVYAM</h1>
    </div>

    <nav class="flex-1 p-6">
        <a 
            href="/orders" 
            class="flex space-x-[20px] py-2 px-4 text-gray-300 hover:bg-white/5 rounded-xl transition-all duration-300"
        >
            <img src={OrdersIcon} alt="" class="filter invert"> 
            <p class="text-[1.2rem] font-bold">Orders</p>
        </a>
    </nav>

    <div class="p-6 border-t border-white/10">
        <button 
            class="flex space-x-[20px] py-2 px-4 text-gray-300 hover:bg-white/5 w-full rounded-xl transition-all duration-300"
            on:click={handleLogout}
        >
            <img src={Logout} alt="" class="filter invert">
            <p class="text-[1.2rem] font-bold">Logout</p>
        </button>
    </div>
</div>

<!-- Mobile Menu -->
{#if showMenu}
    <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 sm:hidden" on:click={toggleMenu}>
        <div class="absolute right-0 top-0 h-full w-64 bg-black/30 backdrop-blur-xl border-l border-white/10" on:click|stopPropagation>
            <div class="p-4 flex justify-end border-b border-white/10">
                <button 
                    class="p-2 hover:bg-white/5 rounded-xl transition-all duration-300"
                    on:click={toggleMenu}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <nav class="p-4">
                <a 
                    href="/orders" 
                    class="flex items-center space-x-[20px] py-2 px-4 text-gray-300 hover:bg-white/5 rounded-xl transition-all duration-300"
                    on:click={toggleMenu}
                >
                    <img src={OrdersIcon} alt="" class="filter invert"> 
                    <p class="text-[1.2rem] font-bold">Orders</p>
                </a>
                <button 
                    class="flex items-center space-x-[20px] py-2 px-4 text-gray-300 hover:bg-white/5 w-full rounded-xl transition-all duration-300 mt-2"
                    on:click={handleLogout}
                >
                    <img src={Logout} alt="" class="filter invert">
                    <p class="text-[1.2rem] font-bold">Logout</p>
                </button>
            </nav>
        </div>
    </div>
{/if}
