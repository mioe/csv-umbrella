<script setup>
import { useFloating, arrow, offset } from '@floating-ui/vue'

const props = defineProps({
	columns: Array,
})

const targetRef = shallowRef()
const floatingRef = shallowRef()
const floatingArrow = shallowRef()
const isOpen = computed(() => !!targetRef.value)
const selectedColumns = computed(() => props.columns.filter(c => c))

const { sysField, customField, onAddCustomField, customFieldType } = useFieldStore()

const { t: $t } = useI18n()
const fields = computed(() => [
	...sysField.map(
		f => ({...f, name: $t(`sys-field-name.${f.name}`)}),
	),
	...customField,
])

const socks = ref()
const { floatingStyles, middlewareData } = useFloating(
	targetRef,
	floatingRef,
	{
		middleware: [
			offset(14),
			arrow({ element: floatingArrow }),
		],
	},
)

const callback = reactive({
	resolve: null,
	reject: null,
})

function reset() {
	targetRef.value = undefined
	socks.value = undefined
}

function open(target, sock) {
	const promise = new Promise((resolve, _reject) => {
		callback.resolve = resolve
		callback.reject = resolve
	})
	targetRef.value = target
	socks.value = sock

	return promise
}

function handleSelect(field) {
	reset()
	if (callback.resolve) {
		callback.reject({ ev: 'select', value: field })
	}
}

function handleRemove() {
	reset()
	if (callback.resolve) {
		callback.reject({ ev: 'remove' })
	}
}

function close() {
	reset()
	if (callback.reject) {
		callback.reject({ ev: 'close' })
	}
}

onClickOutside(floatingRef, () => close())

const customFieldForm = reactive({
	isShow: null,
	name: null,
	type: null,
})

function handleShowFormCustomField() {
	customFieldForm.isShow = true
}

function onResetCustomFieldForm() {
	Object.keys(customFieldForm).forEach((key) => {
		customFieldForm[key] = null
	})
}

function handleAddCustomField() {
	const { name, type } = customFieldForm
	const field = onAddCustomField({ name, type })
	onResetCustomFieldForm()
	handleSelect(field)
}

defineExpose({
	open,
})
</script>

<template>
	<div
		v-show="isOpen"
		ref="floatingRef"
		class="floating"
		:style="floatingStyles"
	>
		<div class="relative z-1 h-full max-h-48 flex flex-col overflow-auto">
			<div class="floating-select flex flex-1 flex-col gap-2 p-4">
				<button
					v-if="socks"
					@click="handleSelect(null)"
				>
					✓ {{ socks.name }}
				</button>
				<template
					v-for="f in fields"
					:key="f.id"
				>
					<button
						v-if="!selectedColumns.some(c => c.id === f.id)"
						@click="handleSelect(f)"
					>
						{{ f.name }}
					</button>
				</template>
			</div>
			<footer class="sticky bottom-0 mt-auto flex flex-shrink-0 flex-col gap-2 rounded-4 bg-white p-4">
				<button
					v-if="!customFieldForm.isShow"
					@click="handleShowFormCustomField"
				>
					{{ $t('add') }}
				</button>
				<form
					v-else
					class="flex flex-col gap-2"
					@submit.prevent="handleAddCustomField"
				>
					<input
						v-model="customFieldForm.name"
						type="text"
						:placeholder="$t('new-field-name')"
						required
					/>
					<select
						v-model="customFieldForm.type"
					>
						<option
							:value="null"
							disabled
						>
							{{ $t('type-field') }}
						</option>
						<option
							v-for="t in customFieldType"
							:key="t"
							:value="t"
						>
							{{ t }}
						</option>
					</select>
					<button type="submit">
						{{ $t('add') }}
					</button>
				</form>
				<button @click="handleRemove">
					{{ $t('remove') }}
				</button>
			</footer>
		</div>

		<div
			ref="floatingArrow"
			class="floating-arrow"
			:style="{
				position: 'absolute',
				left:
					middlewareData.arrow?.x != null
						? `${middlewareData.arrow.x}px`
						: undefined,
				top:
					middlewareData.arrow?.y != null
						? `${middlewareData.arrow.y}px`
						: undefined,
			}"
		/>
	</div>
</template>

<style>
:root {
	--floating-sh-height: 30px;
	--floating-sh: hsla(240, 5%, 41%, .5) 0 7px var(--floating-sh-height) 0;
	--floating-radius: 8px;
}

.floating {
	z-index: 999;
	width: 200px;
	background-color: white;
	box-shadow: var(--floating-sh);
	border-radius: var(--floating-radius);
	transition: transform .3s;
}

.floating-select:empty::after {
	content: v-bind(`'${$t('all-selected')}'`);
	color: hsla(0, 0%, 0%, .3);
	font-size: 12px;
}

.floating::before {
	content: '';
	position: absolute;
	left: var(--floating-radius);
	top: 0;
	width: calc(100% - var(--floating-radius) * 2);
	height: calc(var(--floating-sh-height) * 2);
	background-color: white;
}

.floating-arrow {
	--r: calc(var(--floating-radius) / 2);
	width: 20px;
	height: 20px;
	background-color: white;
	top: calc(-10px + var(--r));
	rotate: 45deg;
	border-radius: var(--r);
	box-shadow: var(--floating-sh);
	z-index: -1;
}
</style>

