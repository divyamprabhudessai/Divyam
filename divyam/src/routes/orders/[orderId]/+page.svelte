<script>
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/authStore.js';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { get } from 'svelte/store';
    import Logo from '../../../assets/Logo.svg';

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

    onMount(fetchOrderDetails);
</script>
<div class="p-6">
        <!-- Logo header -->

    {#if loading}
        <div class="text-center p-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p class="mt-2">Loading order details...</p>
        </div>
    {:else if error}
        <div class="text-red-500 text-center p-4 bg-red-50 rounded-lg">{error}</div>
    {:else if order}
    <div class="flex gap-x-2 p-5">
        <img src={Logo} alt="Logo"> 
        <h1 class="text-[1.3rem] font-bold">MIGHTY X ABRA</h1>
    </div>
        <div class="flex justify-center items-center">
        <div class="bg-white w-[500px] mt-20 rounded-lg shadow-md p-[40px] space-y-8">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-semibold">Order Details</h2>
                <h2 class="text-2xl font-semibold">Price</h2>
            </div>
            <div class="border-b-2 border-gray-200"></div>
            <div class="flex justify-between py-4">         
                <div class="space-y-3">
                    <h2 class="text-xl font-semibold">{order.offer.name}</h2>
                    <h3 class="text-sm text-gray-500">Quantity: {order.quantity}</h3>
                    <h3 class="text-sm text-gray-500">Order ID: {order.order.id}</h3>
                    <h3 class="text-sm text-gray-500">Reference: {order.offer.reference}</h3>
                </div>
                <div class="space-y-3 text-right">
                    <h2 class="text-lg">Price: ${order.price.toFixed(2)}</h2>
                    <h2 class="text-lg">VAT: ${Number(order.vat).toFixed(2)}</h2>
                    <h2 class="text-xl font-semibold">Total: ${(Number(order.price) + Number(order.vat)).toFixed(2)}</h2>
                </div>
            </div>
            <div class="border-b-2 border-gray-200"></div>
            <div class="flex justify-around gap-4 pt-4">
                <button 
                    on:click={() => goto('/orders')} 
                    class="w-full text-black hover:text-white hover:bg-black bg-white border-2 px-4 py-3 border-black rounded-lg transition-colors duration-200"
                >
                    Back to Orders
                </button>

                <button 
                    on:click={handleCancelOrder} 
                    class="w-full text-red-500 bg-white border-2 px-4 py-3 border-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors duration-200"
                >
                    Cancel Order
                </button>
            </div>
        </div>
    </div>
    {:else}
        <div class="text-center p-4 bg-gray-50 rounded-lg">Order not found</div>
    {/if}

<!-- Confirmation Modal -->
{#if showCancelModal}
    <div class="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
            <h2 class="text-2xl font-bold mb-4">Cancel Order</h2>
            <p class="text-gray-600 mb-6">
                Are you sure you want to cancel this order?<br>
                This action cannot be undone.
            </p>
            <div class="flex gap-4">
                <button 
                    on:click={closeModal}
                    class="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                    No, Keep Order
                </button>
                <button 
                    on:click={confirmCancel}
                    class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                    disabled={cancelling}
                >
                    {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                </button>
            </div>
        </div>
    </div>
{/if}
</div>
