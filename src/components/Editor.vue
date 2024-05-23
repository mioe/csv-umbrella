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
const { fields } = useFieldStore()

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
	rowSelected.value = []
	await initTableCheckboxInPage()
	onChangeMainCheckbox()
}

/**
 * Data
 */
const ghostInputRef = shallowRef()

async function handleColumnEdit(ev, rowId, colIdx, val) {
	console.log('🦕 handleColumnEdit')
	const target = ev.target

	const result = await ghostInputRef.value.open(target, val)
	if (result.ev === 'submit') {
		const fRow = csv.value.find(row => row[0] === rowId)
		if (fRow[colIdx] === result.value) {
			return
		}
		fRow[colIdx] = result.value
	}
}

async function handleSave() {
	console.log('🦕 handleSave')
}

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
								:fields="fields"
								:columns="table.columns"
							/>
						</tr>
					</thead>

					<tbody ref="tableBodyRef">
						<tr
							v-for="row in paginatedCsv"
							:id="row[0]"
							:key="row[0]"
						>
							<td class="t-col-checkbox">
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
