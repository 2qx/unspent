<script lang="ts">
    import { copy } from 'svelte-copy';
    import { toast } from '@zerodevx/svelte-toast'
    export let str:string;

</script>
  
<button use:copy={str}
on:svelte-copy={() => toast.push('String copied to clipboard')}
>
    {str}
</button>

<style>

button {
    background: #E2E8F0;
    color: #50928c;
    border: unset;
    border-radius: 6px;
    padding: .75rem 1.5rem;
    cursor: pointer;
    font-family: 'Courier New', Courier, monospace;
    font-size: small;
    word-break: break-word; 
    flex: 4;
}
button:hover {
    background: #CBD5E1;
    color: #475569;
}
button:focus {
    background: #94A3B8;
    color: #F1F5F9;
}
</style>