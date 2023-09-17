<script>
	import { beforeUpdate } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { toast } from '@zerodevx/svelte-toast';
  import { addMessages, init } from "svelte-i18n";
  import { Perpetuity, opReturnToInstance, sanitizeAddress } from '@unspent/phi';
  import { deflate } from "pako";
  // ...

  export let data;
  let receiptAddress;
  let contract;



  async function createContract() {
		if (receiptAddress) {
			try {
				try {
					receiptAddress = await sanitizeAddress(receiptAddress);
				} catch (e) {
					if (e.message) {
						toast.push(e.message, { classes: ['warn'] });
					} else {
						toast.push(e, { classes: ['warn'] });
					}
				}

				contract = new Perpetuity(4383, receiptAddress, 1500, 96);
			} catch (e) {
				contract = undefined;
				if (e.message) {
					toast.push(e.message, { classes: ['warn'] });
				} else {
					toast.push(e, { classes: ['warn'] });
				}
			}
		}
	}
</script>

<svelte:head>
	<title>₿∙χ</title>
	<meta name="description" content="Unspent Cash" />
</svelte:head>

<section>
	<h1>
		<span class="welcome">
      

		</span>
  </h1>
    <h1>{$_('create')}</h1>
    <div id=form1>
      <label for="addr">{$_('receive')} </label>
      <textarea id="addr" bind:value={receiptAddress} />
    </div>
    {#if receiptAddress}
    <div>
      <button> {$_('ok')} </button>
    </div>

    
    <progress id="broadcast" max="100" value="70"></progress>    
    {#if contract}

    {/if}
    {$_('spendable')} 1.0416% {$_('year')}<br>
    <br>
    { data.q }
	
    {/if}


</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

  #form1 {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

  textarea {
    width: 350px;
    height: 40px;
  }


	
</style>
