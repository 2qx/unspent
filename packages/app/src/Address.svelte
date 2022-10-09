<script>
    import { copy } from 'svelte-copy';
    export let address;

</script>
  
<button use:copy={address}>
    📋
</button>
{address}

