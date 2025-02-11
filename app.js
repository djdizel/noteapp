document.addEventListener('DOMContentLoaded', function () {
    const addNoteButton = document.getElementById('add-note-button');
    const noteInputSection = document.getElementById('note-input-section');
    const addNote = document.getElementById('add-note');
    const noteTitle = document.getElementById('note-title');
    const noteContent = document.getElementById('note-content');
    const notesContainer = document.querySelector('.notes-container');

    addNoteButton.addEventListener('click', function () {
        if (noteInputSection.classList.contains('hidden')) {
            noteInputSection.classList.remove('hidden');
        } else {
            noteInputSection.classList.add('hidden');
        }
    });

    addNote.addEventListener('click', async function () {
        const note = {
            title: noteTitle.value,
            content: noteContent.value,
            date: new Date().toLocaleDateString()
        };

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
            noteTitle.value = '';
            noteContent.value = '';
            noteInputSection.classList.add('hidden');
        } else {
            console.error('Failed to add note');
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
    }

    fetchNotes();
});
