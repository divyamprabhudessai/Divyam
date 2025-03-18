<script>
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/authStore.js';
    import { goto } from '$app/navigation';
    import { get } from 'svelte/store';

    // State variables
    let orderList = [];
    let isLoading = true;
    let errorMessage = null;

    // Constants
    const API_ENDPOINT = '/api/v2/orders';
    const API_HEADERS = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    const STATUS_STYLES = {
        '0': 'bg-white/5 text-white/90 border-white/20',  // Cancelled
        '9': 'bg-white/10 text-white/90 border-white/20', // Paid
        '10': 'bg-white/5 text-white/90 border-white/20', // Pending Payment
        '12': 'bg-white/10 text-white/90 border-white/20', // Fulfilled
        'default': 'bg-white/5 text-white/90 border-white/20'
    };

    // Utility functions
    function formatDate(dateString) {
        try {
            if (!dateString) return 'N/A';
            return new Date(dateString).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    }

    function getStatusLabel(statusId) {
        const STATUS_LABELS = {
            '0': 'Cancelled',
            '9': 'Paid',
            '10': 'Pending Payment',
            '12': 'Fulfilled'
        };
        return STATUS_LABELS[statusId] || 'Unknown';
    }

    function getStatusStyle(statusId) {
        return STATUS_STYLES[statusId] || STATUS_STYLES.default;
    }

    function formatAmount(amount) {
        try {
            if (!amount?.value || !amount?.currency) {
                return '0.00';
            }
            return `${Number(amount.value).toFixed(2)} ${amount.currency}`;
        } catch (error) {
            console.error('Error formatting amount:', error);
            return '0.00';
        }
    }

    function handleOrderClick(order) {
        if (!order?.id) {
            console.error('Invalid order data');
            return;
        }
        goto(`/orders/${order.id}`);
    }

    // API functions
    async function fetchOrders(authToken, period = 'TODAY') {
        const queryParams = new URLSearchParams({
            onlyOrders: 'true',
            period
        }).toString();

        const response = await fetch(`${API_ENDPOINT}?${queryParams}`, {
            method: 'GET',
            headers: {
                ...API_HEADERS,
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.status === 401) {
            authStore.set(null);
            goto('/auth/request-otp');
            return null;
        }

        if (response.ok) {
            return await response.json();
        }

        if (response.status === 404 && period === 'TODAY') {
            return await fetchOrders(authToken, 'YESTERDAY');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch orders');
    }

    // Lifecycle hooks
    onMount(async () => {
        const auth = get(authStore);
        if (!auth?.token) {
            goto('/auth/request-otp');
            return;
        }

        try {
            orderList = await fetchOrders(auth.token);
        } catch (error) {
            console.error('Error fetching orders:', error);
            errorMessage = error.message || 'Network error. Please try again.';
        } finally {
            isLoading = false;
        }
    });
</script>

<!-- Logo header -->
<div class="fixed top-0 w-full flex items-center justify-between p-4 sm:p-5 bg-black/30 backdrop-blur-lg border-b border-white/10 z-50">
    <div class="flex items-center gap-4">
        <img src="https://img.hotimg.com/allmighty_logo06ba4eaa2ca37a4d.jpeg" alt="Logo" class="h-8 w-auto filter invert"> 
    </div>
    <button 
        on:click={() => {
            authStore.set(null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('authToken');
            }
            goto('/auth/request-otp');
        }}
        class="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition-colors duration-200 text-white/90 hover:text-white"
    >
        <span>Logout</span>
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
        </svg>
    </button>
</div>

<div class="flex h-screen bg-black overflow-hidden pt-[72px]">
    <div class="flex-1 flex flex-col w-full relative overflow-hidden">
        <!-- Gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50 pointer-events-none"></div>
        
        <!-- Content wrapper -->
        <div class="relative z-10 flex flex-col h-full px-4 sm:px-6">
            <!-- Header -->
            <div class="py-6">
                <h1 class="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                    Today's Orders
                </h1>
            </div>
                
            {#if isLoading}
                <div class="flex-1 flex items-center justify-center">
                    <div class="text-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                        <p class="mt-2 text-white/70">Loading orders...</p>
                    </div>
                </div>
            {:else if errorMessage}
                <div class="flex-1 flex items-center justify-center">
                    <div class="text-red-400 text-sm p-4 bg-red-500/10 backdrop-blur-lg rounded-3xl border border-red-500/20 max-w-md w-full">
                        {errorMessage}
                    </div>
                </div>
            {:else}
                <!-- Category Headers - Desktop -->
                <div class="hidden sm:grid grid-cols-6 gap-4 mb-4">
                    <div class="col-span-2">
                        <div class="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
                            <span class="text-sm font-medium text-white/70">Customer</span>
                        </div>
                    </div>
                    <div>
                        <div class="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 text-center">
                            <span class="text-sm font-medium text-white/70">Created</span>
                        </div>
                    </div>
                    <div>
                        <div class="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 text-center">
                            <span class="text-sm font-medium text-white/70">Kiosk</span>
                        </div>
                    </div>
                    <div>
                        <div class="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 text-center">
                            <span class="text-sm font-medium text-white/70">Status</span>
                        </div>
                    </div>
                    <div>
                        <div class="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 text-center">
                            <span class="text-sm font-medium text-white/70">Amount</span>
                        </div>
                    </div>
                </div>

                <!-- Orders List -->
                <div class="flex-1 overflow-y-auto space-y-4 py-4">
                    {#each orderList as order}
                        <div 
                            class="group bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all shadow-2xl relative"
                            on:click={() => handleOrderClick(order)}
                        >
                            <!-- Mobile View -->
                            <div class="sm:hidden space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-white/70">Customer</span>
                                    <span class="text-white font-medium">{order.customer?.name || 'Anonymous'}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-white/70">Created</span>
                                    <span class="text-white font-medium">{formatDate(order.createdAt)}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-white/70">Kiosk</span>
                                    <span class="text-white font-medium">{order.kiosk?.name || 'N/A'}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-white/70">Status</span>
                                    <span class="backdrop-blur-md px-4 py-1.5 rounded-xl text-sm font-medium border transition-all hover:bg-white/10 {getStatusStyle(order.status.id)}">
                                        {getStatusLabel(order.status.id)}
                                    </span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-white/70">Amount</span>
                                    <span class="text-white font-medium">{formatAmount(order.amount)}</span>
                                </div>
                            </div>

                            <!-- Desktop View -->
                            <div class="hidden sm:grid grid-cols-6 gap-4 items-center">
                                <div class="col-span-2 text-white font-medium">{order.customer?.name || 'Anonymous'}</div>
                                <div class="text-center text-white font-medium">{formatDate(order.createdAt)}</div>
                                <div class="text-center text-white font-medium">{order.kiosk?.name || 'N/A'}</div>
                                <div class="text-center">
                                    <span class="inline-block backdrop-blur-md px-4 py-1.5 rounded-xl text-sm font-medium border transition-all hover:bg-white/10 {getStatusStyle(order.status.id)}">
                                        {getStatusLabel(order.status.id)}
                                    </span>
                                </div>
                                <div class="text-center text-white font-medium">{formatAmount(order.amount)}</div>
                            </div>

                            <!-- Arrow icon -->
                            <div class="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <svg 
                                    class="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform duration-300" 
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
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    /* Custom scrollbar */
    ::-webkit-scrollbar {
        width: 8px;
    }

    ::-webkit-scrollbar-track {
        background: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
    }
</style>
