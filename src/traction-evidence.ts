/** Additional figures supplied for the investor presentation. */
export const downloads = {value: 25131, label: 'Downloads'} as const;
export const tractionTiles = [
 {value: '6m 40s', label: 'Average session time'},
 {value: '300+', label: 'Daily active users'},
 {value: '26.9%', label: 'Returning user rate'},
 {value: '13,641', label: 'Events registered'},
] as const;
export const tractionEvidence = [{...downloads, value: downloads.value.toLocaleString('en-IN')}, ...tractionTiles];
