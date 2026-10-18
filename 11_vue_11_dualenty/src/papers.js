import { ref } from 'vue';

export const papers = ref([
 { paperId: 1, entryId: '2301.00001', title: 'Notes on the Analytical Engine', abstract: 'A description of the first general-purpose computing machine.' },
 { paperId: 2, entryId: '2301.00002', title: 'On Computable Numbers', abstract: 'Introduces the concept of a universal computing machine.' },
 { paperId: 3, entryId: '2301.00003', title: 'The Education of a Computer', abstract: 'Proposes compilers that translate human-readable code into machine code.' },
]);

let nextId = 4;

export function getPaper(paperId) {
 return papers.value.find((p) => p.paperId === Number(paperId));
}

export function addPaper(paper) {
 papers.value.push({ ...paper, paperId: nextId++ });
}

export function updatePaperById(paper) {
 const index = papers.value.findIndex((p) => p.paperId === Number(paper.paperId));
 if (index === -1) throw new Error('Could not find that paper.');
 papers.value[index] = { ...paper };
}

export function deletePaperById(paperId) {
 papers.value = papers.value.filter((p) => p.paperId !== Number(paperId));
}
