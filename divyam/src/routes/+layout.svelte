<script>
    export let children; // Define 'children' as a prop
    import "../app.css";
</script>

<div class="fixed top-0 w-full flex items-center justify-between p-4 sm:p-5 bg-black/30 backdrop-blur-lg border-b border-white/10 z-50">
    <div class="flex items-center gap-4">
        <img 
            src="https://img.hotimg.com/allmighty_logo-removebg-preview.png" 
            alt="Logo" 
            class="h-12 sm:h-14 w-auto brightness-0 invert opacity-90 hover:opacity-100 transition-opacity duration-200"
        > 
    </div>
    <a 
        href="/"
        class="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition-colors duration-200 text-white/90 hover:text-white"
    >
        <span>Home</span>
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
        </svg>
    </a>
</div>
<div class="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
    <slot>{children}</slot> <!-- Correct way to render child content -->
</div>
