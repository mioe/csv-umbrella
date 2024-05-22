<script setup>
import { useFloating } from '@floating-ui/vue'

const targetRef = shallowRef()
const floatingRef = shallowRef()

const inputValue = ref('')

const { floatingStyles } = useFloating(targetRef, floatingRef)

const isOpen = computed(() => !!targetRef.value)

const callback = reactive({
	resolve: null,
	reject: null,
})

function reset() {
	targetRef.value = undefined
}

function open(target, val) {
	const promise = new Promise((resolve, _reject) => {
		callback.resolve = resolve
		callback.reject = resolve
	})
	targetRef.value = target
	inputValue.value = val

	return promise
}

function onSubmit() {
	reset()
	if (callback.reject) {
		callback.reject({ ev: 'submit', value: inputValue.value })
	}
}

onClickOutside(floatingRef, () => onSubmit())

defineExpose({
	open,
})
</script>

<template>
	<input
		v-show="isOpen"
		ref="floatingRef"
		v-model="inputValue"
		class="ghost-input"
		:style="floatingStyles"
		type="text"
		@keyup.enter="onSubmit"
	/>
</template>

<style>
.ghost-input {
	z-index: 999;
	transition: transform .3s;
}
</style>
