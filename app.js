document.addEventListener('DOMContentLoaded', function () {
    const addNoteButton = document.getElementById('add-note-button');
    const noteInputSection = document.getElementById('note-input-section');
    const addNote = document.getElementById('add-note');
    const noteTitle = document.getElementById('note-title');
    const noteContent = document.getElementById('note-content');
    const notesContainer = document.querySelector('.notes-container');
    let editMode = false;
    let editNoteId = null;

    addNoteButton.addEventListener('click', function () {
        if (noteInputSection.classList.contains('hidden')) {
            noteInputSection.classList.remove('hidden');
        } else {
            noteInputSection.classList.add('hidden');
            resetForm();
        }
    });

    addNote.addEventListener('click', async function () {
        const note = {
            title: noteTitle.value,
            content: noteContent.value,
            date: new Date().toLocaleDateString()
        };

        if (editMode) {
            const response = await fetch(`/edit_note/${editNoteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(note)
            });

            if (response.ok) {
                const updatedNote = await response.json();
                updateNoteElement(updatedNote);
                resetForm();
            } else {
                console.error('Failed to edit note');
            }
        } else {
            const response = await fetch('/add_note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(note)
            });

            if (response.ok) {
                const newNote = await response.json();
                displayNote(newNote);
                resetForm();
            } else {
                console.error('Failed to add note');
            }
        }
    });

    async function fetchNotes() {
        const response = await fetch('/get_notes');
        if (response.ok) {
            const notes = await response.json();
            notes.forEach(displayNote);
        } else {
            console.error('Failed to fetch notes');
        }
    }

    function displayNote (note) {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.dataset.id = note.id; // Добавляем ID заметки в атрибут данных
        noteCard.innerHTML = `
            <div class="note-header">
                <h3 class="note-title">${note.title}</h3>
                <span class="note-date">${note.date}</span>
            </div>
            <p class="note-text">${note.content}</p>
            <div class="note-footer">
                <button class="btn-edit" title="Редактировать">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        notesContainer.appendChild(noteCard);

        // Добавляем обработчик для кнопки удаления
        const deleteButton = noteCard.querySelector('.btn-delete');
        deleteButton.addEventListener('click', async function () {
            const noteId = noteCard.dataset.id;
            const response = await fetch(`/delete_note/${noteId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                noteCard.remove();
            } else {
                console.error('Failed to delete note');
            }
        });

        // Добавляем обработчик для кнопки редактирования
        const editButton = noteCard.querySelector('.btn-edit');
        editButton.addEventListener('click', function () {
            editMode = true;
            editNoteId = noteCard.dataset.id;
            noteTitle.value = note.title;
            noteContent.value = note.content;
            noteInputSection.classList.remove('hidden');
        });
    }

    function updateNoteElement (note) {
        const noteCard = document.querySelector(`.note-card[data-id='${note.id}']`);
        noteCard.querySelector('.note-title').textContent = note.title;
        noteCard.querySelector('.note-text').textContent = note.content;
        noteCard.querySelector('.note-date').textContent = note.date;
    }

    function resetForm () {
        noteTitle.value = '';
        noteContent.value = '';
        editMode = false;
        editNoteId = null;
        noteInputSection.classList.add('hidden');
    }

    fetchNotes();
});
