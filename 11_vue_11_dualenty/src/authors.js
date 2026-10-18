import { ref } from 'vue';

export const authors = ref([
{ authorId: 1, name: 'Ada Lovelace', affiliation: 'University of London', email: 'ada@example.com' },
{ authorId: 2, name: 'Alan Turing', affiliation: 'University of Cambridge', email: 'alan@example.com' },
{ authorId: 3, name: 'Grace Hopper', affiliation: 'Yale University', email: 'grace@example.com' },
]);

let nextId = 4;

export function getAuthor(authorId) {
return authors.value.find((a) => a.authorId === Number(authorId));
}

export function addAuthor(author) {
authors.value.push({ ...author, authorId: nextId++ });
}

export function updateAuthorById(author) {
const index = authors.value.findIndex((a) => a.authorId === Number(author.authorId));
if (index === -1) throw new Error('Could not find that author.');
authors.value[index] = { ...author };
}

export function deleteAuthorById(authorId) {
authors.value = authors.value.filter((a) => a.authorId !== Number(authorId));
}


