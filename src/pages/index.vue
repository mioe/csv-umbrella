<script setup>
import { useFileDialog } from '@vueuse/core'

const { files, open, reset, onChange } = useFileDialog({
	accept: '.csv',
	multiple: false,
})

onChange((files) => {
	console.log('🦕 files', files)
})
</script>

<template>
	<section class="flex flex-1 items-center justify-center">
		<button
			v-if="!files"
			type="button"
			@click="open"
		>
			{{ $t('choose-file') }}
		</button>

		<fieldset
			v-else
			class="flex items-center justify-center gap-2"
		>
			<legend>{{ files[0].name }}</legend>

			<button
				type="button"
			>
				Upload
			</button>

			<button
				type="button"
				@click="reset"
			>
				{{ $t('reset') }}
			</button>
		</fieldset>
	</section>
</template>
