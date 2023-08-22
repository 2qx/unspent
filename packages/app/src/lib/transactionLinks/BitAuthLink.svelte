<script lang="ts">
	import Tooltip, { Wrapper } from '@smui/tooltip';
	import { Icon } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import { Svg } from '@smui/common';

	export let link: string;
</script>

<Wrapper>
	<IconButton
		href="{link}"
		target="_blank"
		touch
		color="primary"
		size="button"
		ripple={false}
	>
		<Icon component={Svg} viewBox="5 5 70 70">
      <path
				fill="primary"
				d="m 40,31.6 c -1.5,0 -2.8,0.4 -4,1.3 -1.2,0.9 -2.3,2 -3.2,3.3 v 14.3 c 0.8,1.2 1.7,2.1 2.9,2.7 1.1,0.7 2.4,1 3.7,1 2.4,0 4.3,-1 5.6,-2.9 1.3,-1.9 1.9,-4.7 1.9,-8.5 0,-3.7 -0.6,-6.6 -1.7,-8.5 C 44,32.6 42.3,31.6 40,31.6 Z"
			/>
			<path
				fill="primary"
				d="M 66.4,0 H 12 C 5.4,0 0,5.4 0,12 v 54.4 c 0,6.6 5.4,12 12,12 h 54.4 c 6.6,0 12,-5.4 12,-12 V 12 C 78.4,5.4 73,0 66.4,0 Z M 20.9,50.8 7.8,42.6 v -4.8 l 12.8,-7.8 2.5,3.4 -11.3,6.9 11.6,7.2 z m 28,3.1 c -2,2.8 -4.8,4.1 -8.5,4.1 -3.3,0 -6,-1.2 -7.9,-3.6 l -0.3,3 H 28.1 V 16.9 l 4.6,-0.5 v 16 c 2.2,-2.9 5,-4.4 8.3,-4.4 3.7,0 6.4,1.3 8.2,4 1.8,2.6 2.6,6.3 2.6,11.1 0.1,4.4 -0.9,8 -2.9,10.8 z M 70.5,42.6 57.4,50.8 55,47.5 66.6,40.3 55.3,33.4 57.8,30 70.5,37.9 Z"
			/>
		</Icon>
	</IconButton>
	<Tooltip>View on BitAuth</Tooltip>
</Wrapper>
