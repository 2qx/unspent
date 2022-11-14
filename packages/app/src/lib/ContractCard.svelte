<script>
    import Card, {
    Content,
    PrimaryAction,
    Media,
    MediaContent,
  } from '@smui/card';
  import makeBlockie from 'ethereum-blockies-base64';

  let clicked;
  export let lockingBytecode;
</script>


<div class="card-container">
  <Card>
    <div style="padding: 1rem;">
      <h2 class="mdc-typography--headline6" style="margin: 0;">
        A card with media.
      </h2>
      <h3 class="mdc-typography--subtitle2" style="margin: 0; color: #888;">
        And a subtitle.
      </h3>
    </div>
    <PrimaryAction on:click={() => clicked++}>
      <Media class="card-media" aspectRatio="square" >
        <img alt={lockingBytecode} src={makeBlockie(lockingBytecode)} />
      </Media>
      <Content class="mdc-typography--body2">
        And some info text. And the media and info text are a primary action
        for the card.
      </Content>
    </PrimaryAction>
  </Card>
</div>