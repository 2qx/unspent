<script lang="ts">
  import Radio from '@smui/radio';
  import FormField from '@smui/form-field';
 
  let versions = [0,1]
  let v = NaN;
</script>

<div >
  {#each versions as option}
    <FormField>
      <Radio bind:group={v} value={option} touch />
      <span slot="label">{option}</span>
    </FormField>
  {/each}
</div>