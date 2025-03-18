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
            const date = new Date(dateString);
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
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

    // Add logout function
    function handleLogout() {
        authStore.set(null);
        localStorage.removeItem('authToken');
        goto('/');
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
            const orders = await response.json();
            console.log('Fetched orders:', orders);
            return orders;
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

<div class="min-h-screen flex flex-col relative">
    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50 pointer-events-none"></div>
    
    <!-- Content -->
    <div class="flex-1">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
            <!-- Today's Orders Section -->
            <div class="relative z-10 mt-[8vw]">
                <div class="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                    <h1 class="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent mb-8">
                        Today's Orders
                    </h1>

                    <!-- Orders List -->
                    {#if isLoading}
                        <div class="text-center py-8">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                        <p class="mt-2 text-white/70">Loading orders...</p>
                    </div>
                    {:else if errorMessage}
                        <div class="text-red-400 text-sm p-4 bg-red-500/10 backdrop-blur-lg rounded-3xl border border-red-500/20">
                            {errorMessage}
                </div>
                    {:else if orderList.length === 0}
                        <div class="text-white/70 text-center py-8">No orders found</div>
            {:else}
                        <!-- Column Headers -->
                        <div class="hidden md:grid grid-cols-6 gap-4 px-6 py-3 mb-4 bg-white/5 backdrop-blur-sm rounded-2xl">
                            <div class="col-span-2 text-white/70 font-medium">Customer</div>
                            <div class="text-white/70 font-medium text-center">Created</div>
                            <div class="text-white/70 font-medium text-center">Kiosk</div>
                            <div class="text-white/70 font-medium text-center">Status</div>
                            <div class="text-white/70 font-medium text-right">Amount</div>
                    </div>

                        <!-- Orders -->
                        <div class="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2">
                            {#each orderList as order}
                            <button 
                                on:click={() => handleOrderClick(order)}
                                    class="w-full group"
                                >
                                    <div class="grid grid-cols-1 md:grid-cols-6 gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                                        <!-- Mobile: Stacked Layout -->
                                        <div class="md:hidden space-y-3">
                                            <div class="flex justify-between items-center">
                                                <span class="text-white/70">Customer</span>
                                                <span class="text-white font-medium">{order.customer?.name || 'Anonymous'}</span>
                                            </div>
                                            <div class="flex justify-between items-center">
                                                <span class="text-white/70">Date</span>
                                                <span class="text-white font-medium">{formatDate(order.created?.at)}</span>
                                            </div>
                                            <div class="flex justify-between items-center">
                                                <span class="text-white/70">Kiosk</span>
                                                <span class="text-white font-medium">{order.kiosk?.code || 'N/A'}</span>
                                            </div>
                                            <div class="flex justify-between items-center">
                                                <span class="text-white/70">Status</span>
                                                <span class="backdrop-blur-md px-4 py-1.5 rounded-xl text-sm font-medium border transition-all {getStatusStyle(order.status.id)}">
                                                    {getStatusLabel(order.status.id)}
                                                </span>
                                            </div>
                                            <div class="flex justify-between items-center">
                                                <span class="text-white/70">Amount</span>
                                                <span class="text-white font-medium">{formatAmount(order.amount)}</span>
                                            </div>
                                        </div>

                                        <!-- Desktop: Grid Layout -->
                                        <div class="hidden md:block col-span-2 text-white">
                                            <div class="font-medium">{order.customer?.name || 'Anonymous'}</div>
                                            <div class="text-white/70 text-sm">{order.customer?.phone?.number || 'N/A'}</div>
                                    </div>
                                        <div class="hidden md:flex items-center justify-center text-white font-medium">
                                            {formatDate(order.created?.at)}
                                        </div>
                                        <div class="hidden md:flex items-center justify-center text-white font-medium">
                                            {order.kiosk?.code || 'N/A'}
                                    </div>
                                        <div class="hidden md:flex items-center justify-center">
                                            <span class="backdrop-blur-md px-4 py-1.5 rounded-xl text-sm font-medium border transition-all {getStatusStyle(order.status.id)}">
                                                {getStatusLabel(order.status.id)}
                                        </span>
                                    </div>
                                        <div class="hidden md:flex items-center justify-end text-white font-medium">
                                            {formatAmount(order.amount)}
                                        </div>
                                </div>
                            </button>
                        {/each}
                    </div>
                    {/if}
                </div>
            </div>
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
