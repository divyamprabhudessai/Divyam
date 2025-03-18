<script>
    export let children; // Define 'children' as a prop
    import "../app.css";
</script>

<div class="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
    <slot>{children}</slot> <!-- Correct way to render child content -->
</div>
