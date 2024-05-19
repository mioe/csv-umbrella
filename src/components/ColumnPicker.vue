<script setup>
defineProps({
	popid: { type: String, required: true },
})
</script>

<template>
	<div>
		<button :popovertarget="popid">
			Select column ->
		</button>
		<div
			:id="popid"
			popover
		>
			{{ popid }}
		</div>
	</div>
</template>

<style>
[popover] {
  font-size: 2rem;
  font-weight: bold;
  overflow: visible;
}
</style>
