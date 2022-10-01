<script lang="ts">
    import  Contract  from "../Contract.svelte"
	export let instance
</script>

{#if instance}

<label>
    Period: <input type=number value={instance.period} min=0 max=48000>
</label>

<label>
    Payout: <input type=number value={instance.payout} min=600 max=100000000>
</label>

<label>
    Index: <input type=number value={instance.index} min=0>
</label>

<Contract bind:instance={instance}></Contract>

{/if}

