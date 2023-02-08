<Dialog
  bind:open
  on:SMUIDialog:closed={closeHandler}
>
  <Header>
    
    <IconButton action="close" class="material-icons">close</IconButton>
  </Header>
  <Content id="default-focus-content">
    <Address address={codeValue} />
    <AddressQrCode codeValue={codeValue} />
  </Content>

</Dialog>
 
<IconButton on:click={() => (open = true)} 
  touch color="secondary"
  size="button"  >
  <Icon class="material-icons">qr_code_2</Icon>
</IconButton>
 
<script lang="ts">
  import Address from "./Address.svelte";
  import Dialog, { Header, Title, Content } from '@smui/dialog';
  import IconButton, { Icon } from '@smui/icon-button';
  import AddressQrCode from './AddressQrCode.svelte';
 
  export let codeValue:string;
  let open = false;
 
  function closeHandler(e: CustomEvent<{ action: string }>) {
    
  }
</script>