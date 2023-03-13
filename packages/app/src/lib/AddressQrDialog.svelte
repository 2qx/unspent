<script lang="ts">
	import Address from './Address.svelte';
	import Dialog, { Header, Title, Content, Actions } from '@smui/dialog';
	import IconButton, { Icon } from '@smui/icon-button';
	import Button, { Label } from '@smui/button';
	import AddressQrCode from './AddressQrCode.svelte';

	import {
		cashAddressToLockingBytecode,
		binToHex,
		CashAddressType,
		decodeCashAddress
	} from '@bitauth/libauth';

	export let codeValue: string;
	let lockingBytecode: string;
	let backgroundImage = '';
	let prefix: string;
	let type: string;

	let open = false;
	function closeHandler(e: CustomEvent<{ action: string }>) {
		switch (e.detail.action) {
		}
	}
	try {
		let lockingBytecodeResult = cashAddressToLockingBytecode(codeValue);
		if (typeof lockingBytecodeResult === 'string') throw lockingBytecodeResult;
		lockingBytecode = binToHex(lockingBytecodeResult.bytecode);

		let addrFormat = decodeCashAddress(codeValue);
		if (typeof addrFormat === 'string') throw addrFormat;
		type = CashAddressType[addrFormat.type];
		prefix = addrFormat.prefix;

		if (addrFormat.prefix === 'bitcoincash') backgroundImage = '/images/bch.png';
		if (addrFormat.prefix === 'bchtest') backgroundImage = '/images/tbch.png';
		if (addrFormat.prefix === 'bchreg') backgroundImage = '/images/rbch.png';
	} catch (e: any) {
		console.log(e.message);
	}
</script>

{#if lockingBytecode}
	<Dialog
		bind:open
		noContentPadding
		aria-labelledby="simple-title"
		aria-describedby="simple-content"
		style="position:unset"
		on:SMUIDialog:closed={closeHandler}
	>
		<Content id="qrCenter">
			<br />
			<AddressQrCode {codeValue} {lockingBytecode} {prefix} {type} {backgroundImage} />
		</Content>
		<Actions>
			<Button variant="raised" action="accept" defaultAction>
				<Label>Done</Label>
			</Button>
		</Actions>
	</Dialog>

	<IconButton on:click={() => (open = true)} touch color="secondary" size="button">
		<Icon class="material-icons">qr_code_2</Icon>
	</IconButton>
{/if}

<style>
	/* #qrCenter {
		margin: auto;
		padding: 10px;
	} */
</style>
