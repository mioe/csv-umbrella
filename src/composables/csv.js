export const useCsvToArrayWithUniqId = (data, delimiter = ',', omitFirstRow = false) =>
	data
		.slice(omitFirstRow ? data.indexOf('\n') + 1 : 0)
		.split('\n')
		.filter(v => v.length)
		.map(v => [crypto.randomUUID(), ...v.split(delimiter)])
