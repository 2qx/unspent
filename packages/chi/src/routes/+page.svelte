<script>

  import { _ } from 'svelte-i18n';
  import { addMessages, init } from "svelte-i18n";

  // ...

  import en from "../locale/uk.json";


  addMessages("en", en);

  init({
    initialLocale: "en",
  });
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Unspent Cash" />
</svelte:head>

<section>
	<h1>
		<span class="welcome">

		</span>
    {$_('receive')}<br>
    {$_('ok')}<br>
    {$_('create')}<br>
    {$_('spendable')} {$_('year')}
    
	</h1>



</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	
</style>
