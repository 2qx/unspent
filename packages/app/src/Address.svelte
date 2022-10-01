<script>
    import { copy } from 'svelte-copy';
    export let address;

</script>
  
{address}

<button use:copy={address}>
    Copy
</button>