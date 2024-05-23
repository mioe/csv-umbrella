<script setup>
import { useVModels } from '@vueuse/core'
import ColumnPicker from '~/components/ColumnPicker.vue'
import GhostInput from '~/components/GhostInput.vue'

const props = defineProps({
	csv: Array,
	sysField: Array,
	customField: Array,
})

const emit = defineEmits([
	'update:csv',
	'reset',
])

const HIDDEN_COL = 1 // uuid - first col in rows

const { t: $t } = useI18n()
const { csv } = useVModels(props, emit)

const tableRef = shallowRef()
const table = reactive({
	checkboxes: [],
	lastChecked: null,
	columns: [],
})

const invalidCsv = reactive({
	format: [],
	localDuplicate: [],
	removeDuplicate: [],
})

const mainCheckboxRef = shallowRef()
const maxColsInRow = computed(() =>
	csv.value.reduce((max, row) => Math.max(max, row.length), 0) - HIDDEN_COL,
)
const fields = computed(() => [
	...props.sysField.map(
		f => ({...f, name: $t(`sys-field-name.${f.name}`)}),
	),
	...props.customField,
])
const selectedRows = ref([])

const initTableCheckbox = () => {
	console.log('🦕 initTableCheckbox')
	table.checkboxes = tableRef.value.querySelectorAll('input[type="checkbox"]')
	table.checkboxes.forEach(checkbox => checkbox.addEventListener('click', handleCheck))
}

const handleMainCheckboxCheck = ev => {
	table.checkboxes.forEach(box => box.checked = ev.target.checked)
	toggleCheckbox({ ev: ev.target.checked ? 'all' : 'none' })
}

const onChangeMainCheckbox = () => {
	const countChecked = tableRef.value.querySelectorAll('input:checked').length
	const countAllBox = table.checkboxes.length
	if (countChecked === 0) {
		mainCheckboxRef.value.checked = false
		mainCheckboxRef.value.indeterminate = false
		toggleCheckbox({ ev: 'none' })
	} else if (countChecked === countAllBox.length) {
		mainCheckboxRef.value.checked = true
		mainCheckboxRef.value.indeterminate = false
		toggleCheckbox({ ev: 'all' })
	} else {
		mainCheckboxRef.value.checked = false
		mainCheckboxRef.value.indeterminate = true
		toggleCheckbox({ ev: 'some' })
	}
}

const onResetCheckbox = () => {
	mainCheckboxRef.value.checked = false
	mainCheckboxRef.value.indeterminate = false
	tableRef.value.querySelectorAll('input:checked').forEach((el) => el.checked = false)
	selectedRows.value = []
}

const handleCheck = ev => {
	if (!table.lastChecked) {
		table.lastChecked = ev.target
		onChangeMainCheckbox()
		return
	}

	if (ev.shiftKey) {
		const start = Array.from(table.checkboxes).indexOf(ev.target)
		const end = Array.from(table.checkboxes).indexOf(table.lastChecked)

		table.checkboxes.forEach((box, idx) => {
			if (idx >= Math.min(start, end) && idx <= Math.max(start, end)) {
				box.checked = table.lastChecked.checked
			}
		})
	}

	table.lastChecked = ev.target
	onChangeMainCheckbox()
}

const btnColumnRef = shallowRef([])
const columnPickerRef = shallowRef()

/**
 * Lazy init of columns array
 */
const initColumnSlots = () => {
	console.log('🦕 initColumnSlots')
	table.columns = []
	for (let i = 0; i < maxColsInRow.value; i++) {
		table.columns.push(null)
	}
}

const handleSelectColumn = async(idx) => {
	const target = btnColumnRef.value[idx]
	if (!table.columns.length) {
		initColumnSlots()
	}
	await nextTick()
	const socks = table.columns[idx]
	const result = await columnPickerRef.value.open(target, socks)
	if (result.ev === 'select') {
		table.columns[idx] = result.value
		onValidate({ ev: 'select', value: { colIdx: idx } })
	} else if (result.ev === 'remove') {
		table.columns.splice(idx, 1)
		csv.value = csv.value.map(
			row => row.filter((_el, elIdx) => elIdx !== idx + HIDDEN_COL),
		)
	}
}

const toggleCheckbox = ({ ev }) => {
	switch (ev) {
	case 'none': {
		selectedRows.value = []
		break
	}
	case 'all': {
		selectedRows.value = 'all'
		break
	}
	default: {
		selectedRows.value = []
		tableRef.value.querySelectorAll('input[type=checkbox]').forEach((el, elIdx) => {
			if (el.checked) {
				selectedRows.value.push(elIdx)
			}
		})
		break
	}
	}
}

const handleRemoveSelectedRows = () => {
	if (selectedRows.value === 'all') {
		csv.value = []
	} else {
		csv.value = csv.value
			.filter((_row, idx) => !selectedRows.value.includes(idx))
	}
	onResetCheckbox()
}

const handleSave = async() => {
	const badColumnIdx = table.columns.map((col, idx) => col ? null : idx).filter(colIdx => colIdx)
	const cloneCsv = JSON.parse(JSON.stringify(csv.value))
		.map(row => row.filter((_col, colIdx) => colIdx > 0))
		.map(row => row.filter((_col, colIdx) => !badColumnIdx.includes(colIdx)))
	const headerCsv = table.columns.filter(col => col).map(col => col.id)
	const data = [
		headerCsv,
		...cloneCsv,
	]

	await fetch('/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8',
		},
		body: JSON.stringify(data),
	})
}

const ghostInputRef = shallowRef()

const handleColumnEdit = async(ev, rowIdx, colIdx, val) => {
	const target = ev.target
	if (!table.columns.length) {
		initColumnSlots()
	}
	const result = await ghostInputRef.value.open(target, val)
	if (result.ev === 'submit') {
		if (csv.value[rowIdx][colIdx] === result.value) {
			return
		}
		csv.value[rowIdx][colIdx] = result.value
		onValidate({ ev: 'submit', value: { rowIdx, colIdx, val }})
	}
}

const onValidate = (result) => {
	const { ev, value } = result
	const { colIdx, val } = value
	console.log('🦕 onValidate', ev, value)

	if (!table.columns[colIdx]) {
		console.log('🦕 onValidate', null)
		return
	}
	const field = table.columns[colIdx]
	if (field.type === 'string') {
		console.log('🦕 onValidate', field.type)
		return
	}

	if (ev === 'select') {
		onCheckValidColumn(field, colIdx)
	} else if (ev === 'submit') {
		onCheckValidValue(field, colIdx, rowIdx)
		return
	}
}

const getRegexByType = (type) => {
	if (type === 'phone') {
		return /^\+?[1-9]\d{1,14}$/
	} else if (type === 'date') {
		return /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.(\d{4})$/
	} else if (type === 'number') {
		return /^-?\d{1,3}(,\d{3})*(\.\d+)?$/
	}
	return null
}

const onCheckValidColumn = (field, colIdx) => {
	const { type } = field
	const idxWithUuid = colIdx + HIDDEN_COL

	const regex = getRegexByType(type)

	if (!regex) {
		return
	}

	if (type === 'phone') {
		csv.value.forEach((row, rowIdx) => {
			if (!regex.test(row[idxWithUuid].replace(/\D/g, ''))) {
				onDetectionInvalid({
					field,
					invalidType: 'format',
					rowIdx,
					colIdxWithUuid: idxWithUuid,
				})
			}
		})
	}
}

const onCheckValidValue = (field, colIdx, rowIdx) => {
	const { type } = field

	const idxWithUuid = colIdx + HIDDEN_COL
	console.log('🦕 onCheckValidValue', type, colIdx, rowIdx, idxWithUuid)
}

const onDetectionInvalid = (err) => {
	const {
		field,
		invalidType,
		rowIdx,
		colIdxWithUuid,
	} = err
	invalidCsv[invalidType].push({ field, rowIdx, colIdxWithUuid })
}

onUpdated(() => {
	console.log('🦕 onUpdated')
	if (!table.checkboxes.length) {
		initTableCheckbox()
	}
})

onMounted(() => {
	console.log('🦕 onMounted')
})
</script>

<template>
	<div class="h-full flex flex-col gap-4">
		<header class="ghost-white flex flex-wrap justify-between gap-4 p-4">
			<div class="flex gap-2">
				<template v-if="!selectedRows.length">
					<button @click="$emit('reset')">
						{{ $t('choose-new-file') }}
					</button>
				</template>
				<template v-else>
					<code>
						{{ $t('selected') }} {{ selectedRows === 'all' ? csv.length : selectedRows.length }}:
					</code>
					<button @click="handleRemoveSelectedRows">
						{{ $t('remove') }}
					</button>
				</template>
			</div>
			<div class="flex gap-2">
				<button
					:disabled="!table.columns.filter(c => c).length"
					@click="handleSave"
				>
					{{ $t('save') }}
				</button>
			</div>
		</header>

		<div class="ghost-white table-wrapper">
			<div class="table-container">
				<table class="table-custom">
					<thead
						v-if="csv"
						class="table-head"
					>
						<tr>
							<th class="col-check">
								<input
									ref="mainCheckboxRef"
									type="checkbox"
									:checked="false"
									:indeterminate="false"
									@click="handleMainCheckboxCheck"
								/>
							</th>
							<th
								v-for="(_col, colIdx) in maxColsInRow"
								:key="colIdx"
							>
								<div class="col-body">
									<button
										ref="btnColumnRef"
										@click="handleSelectColumn(colIdx)"
									>
										{{ table.columns[colIdx] ? table.columns[colIdx].name : $t('select-column') }}
									</button>
								</div>
							</th>

							<ColumnPicker
								ref="columnPickerRef"
								:fields="fields"
								:columns="table.columns"
							/>
						</tr>
					</thead>
					<tbody ref="tableRef">
						<tr
							v-for="(row, rowIdx) in csv"
							:id="row[0]"
							:key="row[0]"
						>
							<td class="col-check">
								<input type="checkbox" />
							</td>
							<template
								v-for="(col, colIdx) in row"
								:key="colIdx"
							>
								<td
									v-if="colIdx > 0"
									@click="handleColumnEdit($event, rowIdx, colIdx, col)"
								>
									<div
										class="col-body"
										:title="col"
									>
										{{ col }}
									</div>
								</td>
							</template>
						</tr>
						<GhostInput ref="ghostInputRef" />
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<style>
.table-wrapper {
	position: relative;
	overflow: hidden;
}

.table-container {
	position: relative;
	overflow: auto;
	height: 100%;
}

.table-head {
	position: sticky;
	z-index: 9;
	top: 0;
	background-color: white;
	width: 100%;
	border-bottom: 1px solid #e5ebf0;
}

.table-custom {
	all: unset;
	display: table;
}

.table-custom th {
	text-align: left;
	padding-top: 16px;
	padding-bottom: 16px;
}

.col-body {
	min-width: 200px;
	max-width: 200px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.col-check {
	position: sticky;
	left: 0;
	background-color: white;
	padding-left: 8px;
	padding-right: 8px;
	border-left: 1px solid #e5ebf0;
}
</style>
