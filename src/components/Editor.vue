<script setup>
import ColumnPicker from '~/components/ColumnPicker.vue'
import EditorHeader from '~/components/EditorHeader.vue'

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
 * Column and checkbox
 */
const btnColumnRef = shallowRef([])
const columnPickerRef = shallowRef()
const columnSelected = ref([])

async function initTableCheckboxInPage() {
	console.log('🦕 initTableCheckboxInPage')
	table.lastChecked = null
	await nextTick()
	table.checkboxes = tableBodyRef.value.querySelectorAll('input[type="checkbox"]')
}

function handleMainCheckboxCheck(ev) {
	const { checked } = ev.target
	if (checked) {
		columnSelected.value = csv.value.map(row => row[0])
	} else {
		columnSelected.value = []
	}
}

function onChangeMainCheckbox() {
	const countChecked = columnSelected.value.length
	if (countChecked === 0) {
		tableMainCheckboxRef.value.checked = false
		tableMainCheckboxRef.value.indeterminate = false
		// toggleCheckbox({ ev: 'none' })
	} else if (countChecked === csv.value.length) {
		tableMainCheckboxRef.value.checked = true
		tableMainCheckboxRef.value.indeterminate = false
		// toggleCheckbox({ ev: 'all' })
	} else {
		tableMainCheckboxRef.value.checked = false
		tableMainCheckboxRef.value.indeterminate = true
		// toggleCheckbox({ ev: 'some' })
	}
}

function handleCheck(ev) {
	console.log('🦕 handleCheck', ev.target.id)

	if (!ev.shiftKey) {
		const { id, checked } = ev.target
		onSelectedRows([id], checked)
	}

	if (!table.lastChecked) {
		table.lastChecked = ev.target
		onChangeMainCheckbox()
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
	onChangeMainCheckbox()
}

function onSelectedRows(rows, checked) {
	if (checked) {
		columnSelected.value = [...new Set([
			...columnSelected.value,
			...rows,
		])]
	} else {
		columnSelected.value = columnSelected.value
			.filter(id => !rows.includes(id))
	}
}


/**
 * Data
 */
async function handleSave() {
	console.log('🦕 handleSave')
}

watch(
	() => pagination.currentPage,
	() => {
		initTableCheckboxInPage()
	},
)

onUpdated(() => {
	console.log('🦕 onUpdated')
})

onMounted(() => {
	console.log('🦕 onMounted')
	initTableCheckboxInPage()
})
</script>

<template>
	<div class="h-full flex flex-col gap-4">
		<EditorHeader
			:name="name"
			:rows="csv.length"
			:pages="Math.ceil(csv.length / pagination.sizePage)"
			:current-page="pagination.currentPage"
			@change-page="onChangePage"
			@reset="$emit('reset')"
			@save="handleSave"
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
							v-for="(row, rowIdx) in paginatedCsv"
							:id="row[0]"
							:key="row[0]"
						>
							<td class="t-col-checkbox">
								<input
									:id="row[0]"
									type="checkbox"
									:checked="columnSelected.includes(row[0])"
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
									>
										{{ col }}
									</div>
								</td>
							</template>
						</tr>
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
