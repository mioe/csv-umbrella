<script setup>
defineProps({
	name: String,
	rows: Number,
	pages: Number,
	currentPage: Number,
})
defineEmits(['reset', 'change-page', 'save'])
</script>

<template>
	<header class="ghost-white flex flex-col flex-wrap justify-between gap-2 p-4">
		<div class="flex flex-wrap justify-between gap-2">
			<div class="flex flex-wrap gap-2">
				<p>
					{{ name }} :
					<span class="c-blue-600 font-mono">{{ rows }}</span>
				</p>
				<button @click="$emit('reset')">
					{{ $t('choose-new-file') }}
				</button>
			</div>
			<div>
				<button @click="save">
					{{ $t('save') }}
				</button>
			</div>
		</div>

		<div class="flex flex-wrap gap-2">
			<button
				v-for="p in pages"
				:key="p"
				:class="{
					'c-blue-600 underline': p === currentPage,
				}"
				@click="$emit('change-page', p)"
			>
				{{ p }}
			</button>
		</div>
	</header>
</template>
