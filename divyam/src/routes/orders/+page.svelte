<script>
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/authStore.js';
    import { goto } from '$app/navigation';
    import { get } from 'svelte/store';
    import SideBar from '$lib/components/SideBar.svelte';
    import Logo from '../../assets/Logo.svg';

    // State variables with more descriptive names
    let orderList = [];
    let filteredOrderList = [];
    let searchQuery = '';
    let selectedStatus = '';
    let isLoading = true;
    let errorMessage = null;
    let isSidebarOpen = false;

    // Constants
    const API_ENDPOINT = '/api/v2/orders';
    const API_HEADERS = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    const ORDER_STATUS_OPTIONS = [
        { id: '', label: 'All Statuses' },
        { id: '0', label: 'Cancelled' },
        { id: '9', label: 'Paid' },
        { id: '10', label: 'Pending Payment' },
        { id: '12', label: 'Fulfilled' }
    ];

    const STATUS_STYLES = {
        '0': 'bg-red-500/20 text-red-400 border border-red-500/30',
        '9': 'bg-green-500/20 text-green-400 border border-green-500/30',
        '10': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        '12': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
        'default': 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    };

    // Reactive statement for filtering orders
    $: {
        if (orderList) {
            filteredOrderList = orderList.filter(order => {
                const customerName = order.customer?.name || 'Anonymous';
                const matchesSearch = customerName.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = !selectedStatus || order.status.id.toString() === selectedStatus;
                return matchesSearch && matchesStatus;
            });
        }
    }

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
        const status = ORDER_STATUS_OPTIONS.find(s => s.id === statusId.toString());
        return status ? status.label : 'Unknown';
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

    // Event handlers
    function handleSidebarToggle() {
        isSidebarOpen = !isSidebarOpen;
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
            filteredOrderList = orderList;
        } catch (error) {
            console.error('Error fetching orders:', error);
            errorMessage = error.message || 'Network error. Please try again.';
        } finally {
            isLoading = false;
        }
    });
</script>

<div class="flex h-screen bg-black overflow-hidden">
    <SideBar 
        bind:showMenu={isSidebarOpen}
        on:toggleMenu={handleSidebarToggle}
    />
    
    <div class="flex-1 flex flex-col w-full relative overflow-hidden">
        <!-- Gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black pointer-events-none"></div>
        
        <!-- Content wrapper -->
        <div class="relative z-10 flex flex-col h-full">
            <!-- Mobile Header -->
            <div class="sm:hidden flex items-center justify-between p-4 bg-black/30 backdrop-blur-lg border-b border-white/10">
                <div class="flex items-center gap-x-2">
                    <img src={Logo} alt="Logo" class="h-6 w-auto filter invert"> 
                    <h1 class="text-[1.1rem] font-bold text-white">DIVYAM</h1>
                </div>
                <button 
                    class="p-2 hover:bg-white/5 rounded-xl transition-all duration-300"
                    on:click={handleSidebarToggle}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                </button>
            </div>

            <!-- Desktop Header -->
            <div class="hidden sm:block p-6 pb-0">
                <h1 class="text-2xl font-bold text-white mb-6">Today's Orders</h1>
            </div>
                
            {#if isLoading}
                <div class="flex-1 flex items-center justify-center">
                    <div class="text-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                        <p class="mt-2 text-white/70">Loading orders...</p>
                    </div>
                </div>
            {:else if errorMessage}
                <div class="flex-1 flex items-center justify-center px-4">
                    <div class="text-red-400 text-center p-4 bg-red-500/10 backdrop-blur-lg rounded-lg border border-red-500/20 max-w-md w-full">
                        {errorMessage}
                    </div>
                </div>
            {:else}
                <!-- Search and Filter Section -->
                <div class="p-4 space-y-3">
                    <div class="bg-white/5 backdrop-blur-xl rounded-2xl p-4 space-y-3 border border-white/10">
                        <input 
                            type="text" 
                            class="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-sm text-white placeholder-gray-400 focus:border-white/40 focus:outline-none transition-all" 
                            placeholder="Search orders by customer name" 
                            bind:value={searchQuery}
                        />

                        <select 
                            class="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-sm text-white focus:border-white/40 focus:outline-none transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDI0IDI0IiBzdHJva2U9IndoaXRlIj48cGF0aCBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTE5IDlsLTcgNy03LTciLz48L3N2Zz4=')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem]" 
                            bind:value={selectedStatus}
                        >
                            {#each ORDER_STATUS_OPTIONS as status}
                                <option class="bg-black text-white" value={status.id}>{status.label}</option>
                            {/each}
                        </select>
                    </div>

                    <!-- Desktop Table Header -->
                    <div class="hidden sm:grid grid-cols-6 gap-4 px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10">
                        <div class="col-span-2">Customer</div>
                        <div class="text-center">Created</div>
                        <div class="text-center">Kiosk</div>
                        <div class="text-center">Status</div>
                        <div class="text-center">Amount</div>
                    </div>
                </div>

                <!-- Orders List -->
                <div class="flex-1 overflow-y-auto px-4 pb-4">
                    <div class="grid gap-3">
                        {#each filteredOrderList as order}
                            <div 
                                class="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
                                on:click={() => handleOrderClick(order)}
                            >
                                <div class="sm:hidden space-y-2">
                                    <div class="flex justify-between items-center">
                                        <span class="text-white/70">Customer:</span>
                                        <span class="text-white">{order.customer?.name || 'Anonymous'}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-white/70">Created:</span>
                                        <span class="text-white">{formatDate(order.createdAt)}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-white/70">Kiosk:</span>
                                        <span class="text-white">{order.kiosk?.name || 'N/A'}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-white/70">Status:</span>
                                        <span class="px-2 py-1 rounded-full text-sm {getStatusStyle(order.status.id)}">
                                            {getStatusLabel(order.status.id)}
                                        </span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-white/70">Amount:</span>
                                        <span class="text-white">{formatAmount(order.total)}</span>
                                    </div>
                                </div>

                                <div class="hidden sm:grid grid-cols-6 gap-4 items-center">
                                    <div class="col-span-2 text-white">{order.customer?.name || 'Anonymous'}</div>
                                    <div class="text-center text-white">{formatDate(order.createdAt)}</div>
                                    <div class="text-center text-white">{order.kiosk?.name || 'N/A'}</div>
                                    <div class="text-center">
                                        <span class="px-2 py-1 rounded-full text-sm {getStatusStyle(order.status.id)}">
                                            {getStatusLabel(order.status.id)}
                                        </span>
                                    </div>
                                    <div class="text-center text-white">{formatAmount(order.total)}</div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
