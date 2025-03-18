<script>
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/authStore.js';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { get } from 'svelte/store';

    let order = null;
    let loading = true;
    let error = null;
    let showCancelModal = false;
    let cancelling = false;

    async function fetchOrderDetails() {
        const auth = get(authStore);
        if (!auth?.token) {
            goto('/auth/request-otp');
            return;
        }

        const orderId = $page.params.orderId;
        if (!orderId) {
            error = 'Order ID is missing';
            loading = false;
            return;
        }

        try {
            const res = await fetch(`/api/v2/orders/${orderId}/items`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                order = data[0];
            } else {
                const errorData = await res.json().catch(() => ({}));
                error = errorData.message || 'Failed to fetch order details';
            }
        } catch (err) {
            console.error('Error fetching order details:', err);
            error = 'Network error. Please try again.';
        } finally {
            loading = false;
        }
    }

    async function handleCancelOrder() {
        showCancelModal = true;
    }

    async function confirmCancel() {
        if (cancelling) return;
        cancelling = true;
        const orderId = $page.params.orderId;
        const auth = get(authStore);
        try {
            const res = await fetch(`/api/v2/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify({
                    "status": { "id": 0 }
                })
            });

            if (res.ok) {
                goto('/orders');
            } else {
                const errorData = await res.json().catch(() => ({}));
                error = errorData.message || 'Failed to cancel order';
                console.log(error);
            }
        } catch (err) {
            console.error('Error cancelling order:', err);
            error = 'Network error. Please try again.';
        } finally {
            cancelling = false;
            showCancelModal = false;
        }
    }

    function closeModal() {
        showCancelModal = false;
        cancelling = false;
    }

    function handleLogout() {
        authStore.set(null);
        localStorage.removeItem('authToken');
        goto('/');
    }

    onMount(fetchOrderDetails);
</script>

<div class="min-h-screen flex flex-col px-4 sm:px-6 relative">
    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50 pointer-events-none"></div>
    
    <!-- Content -->
    <div class="flex-1 flex items-center justify-center">
        {#if loading}
            <div class="text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p class="mt-2 text-white/70">Loading order details...</p>
            </div>
        {:else if error}
            <div class="text-red-400 text-sm p-4 bg-red-500/10 backdrop-blur-lg rounded-3xl border border-red-500/20 max-w-md w-full">
                {error}
            </div>
        {:else if order}
            <div class="relative z-10 max-w-2xl w-full mt-[8vw]">
                <div class="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                    <h1 class="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent mb-8">
                        Order Details
                    </h1>

                    <!-- Order Info -->
                    <div class="space-y-6">
                        <!-- Header -->
                        <div class="flex justify-between items-center pb-4 border-b border-white/10">
                            <div class="text-white/70">Order ID</div>
                            <div class="text-white font-medium">{order.order.id}</div>
                        </div>

                        <!-- Item Details -->
                        <div class="space-y-4">
                            <div class="flex justify-between items-start">
                                <div class="space-y-1">
                                    <h2 class="text-xl text-white font-medium">{order.offer.name}</h2>
                                    <p class="text-white/70">Reference: {order.offer.reference}</p>
                                    <p class="text-white/70">Quantity: {order.quantity}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Price Breakdown -->
                        <div class="space-y-3 pt-4 border-t border-white/10">
                            <div class="flex justify-between">
                                <span class="text-white/70">Price</span>
                                <span class="text-white">${order.price.toFixed(2)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-white/70">VAT</span>
                                <span class="text-white">${Number(order.vat).toFixed(2)}</span>
                            </div>
                            <div class="flex justify-between pt-2 border-t border-white/10">
                                <span class="text-white font-medium">Total</span>
                                <span class="text-white font-medium">${(Number(order.price) + Number(order.vat)).toFixed(2)}</span>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex gap-4 pt-8">
                            <button 
                                on:click={() => goto('/orders')}
                                class="group relative flex-1 overflow-hidden rounded-2xl px-6 py-3 transition-all duration-300"
                            >
                                <!-- Gradient background -->
                                <div class="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 group-hover:opacity-75 transition-opacity duration-300"></div>
                                
                                <!-- Animated border -->
                                <div class="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-white/40 transition-colors duration-300"></div>
                                
                                <!-- Content -->
                                <div class="relative flex items-center justify-center">
                                    <span class="text-white font-medium">Back to Orders</span>
                                </div>
                            </button>

                            <button 
                                on:click={handleCancelOrder}
                                class="group relative flex-1 overflow-hidden rounded-2xl px-6 py-3 transition-all duration-300"
                            >
                                <!-- Gradient background -->
                                <div class="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 group-hover:opacity-75 transition-opacity duration-300"></div>
                                
                                <!-- Animated border -->
                                <div class="absolute inset-0 rounded-2xl border border-red-500/20 group-hover:border-red-500/40 transition-colors duration-300"></div>
                                
                                <!-- Content -->
                                <div class="relative flex items-center justify-center">
                                    <span class="text-red-400 font-medium">Cancel Order</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {:else}
            <div class="text-white/70 text-center">Order not found</div>
        {/if}
    </div>
</div>

<!-- Confirmation Modal -->
{#if showCancelModal}
    <div class="fixed inset-0 backdrop-blur-xl bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl max-w-md w-full mx-4">
            <div class="flex justify-center space-x-4">
                <button 
                    on:click={confirmCancel}
                    disabled={cancelling}
                    class="group relative overflow-hidden rounded-2xl px-8 py-3 transition-all duration-300 bg-red-500/20 hover:bg-red-500/30"
                >
                    <!-- Animated border -->
                    <div class="absolute inset-0 rounded-2xl border border-red-500/30 group-hover:border-red-500/50 transition-colors duration-300"></div>
                    
                    <!-- Content -->
                    <div class="relative flex items-center justify-center">
                        <span class="text-red-400 font-medium">{cancelling ? 'Cancelling...' : 'Cancel Order'}</span>
                    </div>
                </button>
                <button 
                    on:click={() => showCancelModal = false}
                    class="group relative overflow-hidden rounded-2xl px-8 py-3 transition-all duration-300"
                >
                    <!-- Gradient background -->
                    <div class="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 group-hover:opacity-75 transition-opacity duration-300"></div>
                    
                    <!-- Animated border -->
                    <div class="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-white/40 transition-colors duration-300"></div>
                    
                    <!-- Content -->
                    <div class="relative flex items-center justify-center">
                        <span class="text-white font-medium">Keep Order</span>
                    </div>
                </button>
            </div>
        </div>
    </div>
{/if}

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
