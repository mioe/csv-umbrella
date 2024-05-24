<script setup>
import ColumnPicker from '~/components/ColumnPicker.vue'
import EditorHeader from '~/components/EditorHeader.vue'
import GhostInput from '~/components/GhostInput.vue'

const props = defineProps({
	name: String,
	csv: Array,
})
const emit = defineEmits(['update:csv', 'reset'])
const { csv } = useVModels(props, emit)

const HIDDEN_COL = 1 // uuid - first col in rows

const tableBodyRef = shallowRef()
const tableMainCheckboxRef = shallowRef()
const table = reactive({
	columns: [],
	checkboxes: [],
	lastChecked: null,
})

const maxColsInRow = computed(() =>
	csv.value.reduce((max, row) => Math.max(max, row.length), 0) - HIDDEN_COL,
)

const pagination = reactive({
	sizePage: 250,
	currentPage: 1,
})
const paginatedCsv = computed(() =>
	csv.value.slice(
		(pagination.currentPage - 1) * pagination.sizePage,
		pagination.currentPage * pagination.sizePage,
	),
)
function onChangePage(val) {
	pagination.currentPage = val
}

/**
 * Columns
 */
const columnPickerRef = shallowRef()
const btnColumnRef = shallowRef([])

async function initColumnSlots() {
	console.log('🦕 initColumnSlots')
	await nextTick()
	table.columns = []
	for (let i = 0; i < maxColsInRow.value; i++) {
		table.columns.push(null)
	}
}

async function handleSelectColumn(idx) {
	const target = btnColumnRef.value[idx]
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

/**
 * Rows and checkbox
 */
const rowSelected = ref([])

async function initTableCheckboxInPage() {
	console.log('🦕 initTableCheckboxInPage')
	table.lastChecked = null
	await nextTick()
	table.checkboxes = tableBodyRef.value.querySelectorAll('input[type="checkbox"]')
}

function handleMainCheckboxCheck(ev) {
	const { checked } = ev.target
	if (checked) {
		rowSelected.value = csv.value.map(row => row[0])
	} else {
		rowSelected.value = []
	}
}

function onChangeMainCheckbox() {
	const countChecked = rowSelected.value.length
	if (countChecked === 0) {
		tableMainCheckboxRef.value.checked = false
		tableMainCheckboxRef.value.indeterminate = false
	} else if (countChecked === csv.value.length) {
		tableMainCheckboxRef.value.checked = true
		tableMainCheckboxRef.value.indeterminate = false
	} else {
		tableMainCheckboxRef.value.checked = false
		tableMainCheckboxRef.value.indeterminate = true
	}
}

function handleCheck(ev) {
	if (!ev.shiftKey) {
		const { id, checked } = ev.target
		onSelectedRows([id], checked)
	}

	if (!table.lastChecked) {
		table.lastChecked = ev.target
		return
	}

	if (ev.shiftKey) {
		const start = Array.from(table.checkboxes).indexOf(ev.target)
		const end = Array.from(table.checkboxes).indexOf(table.lastChecked)
		const rows = []
		table.checkboxes.forEach((box, idx) => {
			if (idx >= Math.min(start, end) && idx <= Math.max(start, end)) {
				box.checked = table.lastChecked.checked
				rows.push(box.id)
			}
		})
		onSelectedRows(rows, table.lastChecked.checked)
	}

	table.lastChecked = ev.target
}

function onSelectedRows(rows, checked) {
	if (checked) {
		rowSelected.value = [...new Set([
			...rowSelected.value,
			...rows,
		])]
	} else {
		rowSelected.value = rowSelected.value
			.filter(id => !rows.includes(id))
	}
	onChangeMainCheckbox()
}

async function handleRemoveRowSelected() {
	if (csv.value.length === rowSelected.value.length) {
		emit('reset')
		return
	}

	csv.value = csv.value
		.filter(row => !rowSelected.value.includes(row[0]))

	onRemoveInvalidRows(rowSelected.value)
	rowSelected.value = []
	await initTableCheckboxInPage()
	onChangeMainCheckbox()
}

/**
 * Data
 */
const ghostInputRef = shallowRef()

async function handleColumnEdit(ev, rowId, colIdx, val) {
	const target = ev.target

	const result = await ghostInputRef.value.open(target, val)
	if (result.ev === 'submit') {
		const fRow = csv.value.find(row => row[0] === rowId)
		if (fRow[colIdx] === result.value) {
			return
		}
		fRow[colIdx] = result.value
		onValidate({ ev: 'submit', value: { rowId, colIdx: colIdx - HIDDEN_COL, val: result.value }})
	}
}

async function handleSave() {
	const invalidColumns = table.columns.map((col, idx) => col ? null : idx).filter(colIdx => colIdx)
	const bodyCsv = JSON.parse(JSON.stringify(csv.value))
		.map(row => row.filter((_col, colIdx) => colIdx > 0))
		.map(row => row.filter((_col, colIdx) => !invalidColumns.includes(colIdx)))
	const headerCsv = table.columns.filter(col => col).map(col => col.id)
	const data = [
		headerCsv,
		...bodyCsv,
	]

	await fetch('/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8',
		},
		body: JSON.stringify(data),
	})
}

function onValidate(result) {
	const { ev, value } = result
	const { colIdx } = value

	if (!table.columns[colIdx]) {
		return
	}
	const field = table.columns[colIdx]
	if (field.type === 'string') {
		return
	}

	if (ev === 'select') {
		onCheckValidColumn(field, colIdx)
	} else if (ev === 'submit') {
		onCheckValidValue(field, value.rowId, value.val)
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

const getCheckValidHead = (field) => {
	const { type } = field
	const regex = getRegexByType(type)
	return { regex, type }
}

function onCheckValidColumn(field, colIdx) {
	const colIdxWithUuid = colIdx + HIDDEN_COL
	const {
		regex,
		type,
	} = getCheckValidHead(field)

	if (!regex) {
		return
	}

	if (type === 'phone') {
		csv.value.forEach(row => {
			if (!regex.test(row[colIdxWithUuid].replace(/\D/g, ''))) {
				onDetectionInvalid({
					field,
					rowId: row[0],
				})
			}
		})
	} else {
		csv.value.forEach(row => {
			if (!regex.test(row[colIdxWithUuid])) {
				onDetectionInvalid({
					field,
					rowId: row[0],
				})
			}
		})
	}
}

function onCheckValidValue(field, rowId, val) {
	const {
		regex,
		type,
	} = getCheckValidHead(field)

	if (!regex) {
		return
	}

	if (type === 'phone') {
		if (!regex.test(val.replace(/\D/g, ''))) {
			onDetectionInvalid({
				field,
				rowId,
			})
		} else {
			onResetInvalid([field.id])
		}
	} else {
		if (!regex.test(val)) {
			onDetectionInvalid({
				field,
				rowId,
			})
		} else {
			onResetInvalid([field.id])
		}
	}
}

const invalidCsv = reactive({})

function onDetectionInvalid(err) {
	const { field, rowId } = err
	if (!invalidCsv[`${rowId}`]) {
		invalidCsv[`${rowId}`] = []
	}
	invalidCsv[`${rowId}`].push(field.id)
}

function onResetInvalid(colIds) {
	Object.keys(invalidCsv).forEach(key => {
		const newInvalidStatus = invalidCsv[key].filter(colId => !colIds.includes(colId))
		if (!newInvalidStatus.length) {
			delete invalidCsv[key]
		} else {
			invalidCsv[key] = newInvalidStatus
		}
	})
}

function onRemoveInvalidRows(rowIds) {
	const diff = Object.keys(invalidCsv).filter(rowId => rowIds.includes(rowId))
	diff.forEach(rowId => {
		delete invalidCsv[rowId]
	})
}

const getErrorStatusForRow = (rowId) => {
	return Object.keys(invalidCsv).includes(rowId)
}

const getErrorStatusForCol = (rowId, colIdx) => {
	if (getErrorStatusForRow(rowId) && table.columns[colIdx - HIDDEN_COL]) {
		const field = table.columns[colIdx - HIDDEN_COL]
		return invalidCsv[rowId].includes(field.id)
	}
	return false
}

watch(
	() => ([...table.columns]),
	async(newVal, oldVal) => {
		const oldColumns = oldVal.filter(c => c).map(c => c.id)
		const newColumns = newVal.filter(c => c).map(c => c.id)
		const diff = oldColumns.filter(cId => !newColumns.includes(cId))
		onResetInvalid(diff)
	},
	{
		deep: true,
	},
)

watch(
	() => pagination.currentPage,
	async() => {
		await initTableCheckboxInPage()
	},
)

onUpdated(() => {
	console.log('🦕 onUpdated')
})

onMounted(async() => {
	console.log('🦕 onMounted')
	await initTableCheckboxInPage()
	await initColumnSlots()
})
</script>

<template>
	<div class="h-full flex flex-col gap-4">
		<EditorHeader
			:name="name"
			:rows="csv.length"
			:pages="Math.ceil(csv.length / pagination.sizePage)"
			:current-page="pagination.currentPage"
			:row-selected-length="rowSelected.length"
			@change-page="onChangePage"
			@reset="$emit('reset')"
			@save="handleSave"
			@remove="handleRemoveRowSelected"
		/>


		<div class="ghost-white relative overflow-hidden">
			<div class="relative h-full overflow-auto">
				<table class="t">
					<thead class="t-head">
						<tr>
							<th class="t-col-checkbox">
								<input
									ref="tableMainCheckboxRef"
									type="checkbox"
									@click="handleMainCheckboxCheck"
								/>
							</th>
							<th
								v-for="(_col, colIdx) in maxColsInRow"
								:key="colIdx"
							>
								<div class="t-col-body">
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
								:columns="table.columns"
							/>
						</tr>
					</thead>

					<tbody ref="tableBodyRef">
						<tr
							v-for="row in paginatedCsv"
							:id="row[0]"
							:key="row[0]"
							:class="{
								'bg-red-300': getErrorStatusForRow(row[0])
							}"
						>
							<td
								class="t-col-checkbox"
								:class="{
									'bg-red-300': getErrorStatusForRow(row[0])
								}"
							>
								<input
									:id="row[0]"
									type="checkbox"
									:checked="rowSelected.includes(row[0])"
									@click="handleCheck"
								/>
							</td>
							<template
								v-for="(col, colIdx) in row"
								:key="`${row[0]}-${colIdx}`"
							>
								<td v-if="colIdx > 0">
									<div
										class="t-col-body"
										:title="col"
										:class="{
											'c-red-800 underline': getErrorStatusForCol(row[0], colIdx)
										}"
										@click="handleColumnEdit($event, row[0], colIdx, col)"
									>
										{{ col }}
									</div>
								</td>
							</template>
						</tr>

						<GhostInput
							ref="ghostInputRef"
						/>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<style>
.t {
	all: unset;
	display: table;
}

.t-head {
	position: sticky;
	z-index: 9;
	top: 0;
	width: 100%;
	background-color: white;
	border-bottom: 1px solid #e5ebf0;
}

.t-head th {
	text-align: left;
	padding-top: 16px;
	padding-bottom: 16px;
}

.t-col-body {
	min-width: 200px;
	max-width: 200px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.t-col-checkbox {
	position: sticky;
	left: 0;
	padding-left: 8px;
	padding-right: 8px;
	background-color: white;
	border-left: 1px solid #e5ebf0;
}
</style>
