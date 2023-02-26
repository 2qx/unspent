<script lang="ts">
	import Tooltip, { Wrapper } from '@smui/tooltip';
	import { Icon } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import { Svg } from '@smui/common';

	export let address: string;
</script>

<Wrapper>
	<IconButton
		href="https://blockchair.com/bitcoin-cash/address/{address}"
		target="_blank"
		touch
		color="secondary"
		size="button"
		ripple={false}
	>
		<Icon component={Svg} viewBox="2 2 22 22">
			<path
				fill="currentColor"
				d="m 12.986211,23.033985 5.306349,-3.303844 v -6.74658 c 0,-0.131639 -0.0234,-0.257971 -0.06294,-0.378921 l -5.360329,3.337034 c 0.07554,0.179108 0.116921,0.374437 0.116921,0.57597 z"
			/>
			<path
				fill="currentColor"
				d="M 11.816937,0.94789702 6.5105653,4.251752 v 6.746527 c 0,0.131714 0.023384,0.258047 0.062957,0.378996 L 11.933857,8.0402403 c -0.07555,-0.1791822 -0.11692,-0.3744512 -0.11692,-0.576014 z"
			/>
			<path
				fill="currentColor"
				d="M 12.11283,8.3501649 6.7354072,11.698787 c 0.090838,0.127229 0.2077579,0.238311 0.3462634,0.325249 l 5.2074414,3.242024 c 0.158289,0.09852 0.293195,0.223062 0.401123,0.366363 l 5.378291,-3.347725 c -0.09082,-0.127229 -0.207737,-0.238311 -0.346254,-0.325174 L 12.514858,8.7174249 C 12.355665,8.6180039 12.221655,8.4934658 12.11283,8.3501649 Z"
			/>
			<path fill="currentColor" d="m 11.816974,23.033985 v -5.986868 l -4.7910241,3.00461 z" />
		</Icon>
	</IconButton>
	<Tooltip>View on BlockChair</Tooltip>
</Wrapper>
