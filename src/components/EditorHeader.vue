<script setup>
defineProps({
	name: String,
	rows: Number,
	pages: Number,
	currentPage: Number,
	rowSelectedLength: Number,
})
defineEmits(['reset', 'change-page', 'save', 'remove'])

const { locale } = useI18n()
const { toggleLocales } = useLocaleStore()
</script>

<template>
	<header class="ghost-white flex flex-col flex-wrap justify-between gap-2 p-4">
		<div class="flex flex-wrap justify-between gap-2">
			<div class="flex flex-wrap gap-2">
				<p>
					{{ name }} :
					<template v-if="rowSelectedLength">
						<button
							class="mr-2"
							@click="$emit('remove')"
						>
							{{ $t('remove') }}
						</button>
						<span

							class="font-mono"
						>
							{{ $t('selected') }} {{ rowSelectedLength }} {{ $t('of').toLowerCase() + ' ' }}
						</span>
					</template>
					<span class="c-blue-600 font-mono">{{ rows }}</span>
				</p>
				<button
					v-if="!rowSelectedLength"
					@click="$emit('reset')"
				>
					{{ $t('choose-new-file') }}
				</button>
			</div>
			<div class="flex flex-wrap gap-2">
				<button @click="save">
					{{ $t('save') }}
				</button>
				<button @click="toggleLocales">
					{{ locale }}
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
