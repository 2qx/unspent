<script lang="ts">
  import {
    mdiHuman,
    mdiGestureTap,
    mdiMonitorScreenshot,
    mdiPalette,
    mdiCommentArrowLeft,
    mdiAccountGroup,
    mdiRotateRightVariant,
    mdiClipboardCheck,
    mdiLanguageTypescript,
  } from '@mdi/js';
  import { siMaterialdesign, siSvelte, siSass } from 'simple-icons/icons';
  import Paper, { Title, Content } from '@smui/paper';
  import List, {
    Item,
    Graphic,
    Text,
    PrimaryText,
    SecondaryText,
  } from '@smui/list';
  import { Icon, Svg } from '@smui/common';
  import  LockingBytecodeDetail  from '$lib/LockingBytecodeDetails.svelte'
  import TransactionDetail  from '$lib/TransactionDetail.svelte'
	export let data:any;

</script>

<Paper color="primary" class="box">
  <Title
    style="display: flex; justify-content: space-between; align-items: center;"
  >
    <span>Svelte</span>
    <Icon
      component={Svg}
      style="width: 1em; height: auto;"
      viewBox="0 0 24 24"
    >
      <path fill="currentColor" d={siSvelte.path} />
    </Icon>
  </Title>
  <Content>
    SMUI provides strictly typed Svelte components and actions for a wide
    variety of interface elements. SMUI also provides helper utilities for
    building custom and advanced UI components.
  </Content>
</Paper>

{#if data.tx}
	<TransactionDetail bind:txid={data.tx}/>
{/if}
{#if data.lockingBytecode}
   <LockingBytecodeDetail bind:lockingBytecode={data.lockingBytecode}/>
{/if}
