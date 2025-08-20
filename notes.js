/**
 * Notes functionality with auto-save and search
 */

class Notes {
    constructor() {
        this.notes = [];
        this.activeNoteId = null;
        this.autoSaveTimeout = null;
        this.useSync = false;

        this.initializeElements();
        this.initializeEventListeners();
        this.loadNotes();
    }

    /**
 * Initialize DOM elements
 */
    initializeElements() {
        this.searchInput = document.getElementById('search-notes');
        this.newNoteButton = document.getElementById('new-note');
        this.expandButton = document.getElementById('expand-notes');

        this.notesContainer = document.getElementById('notes-container');
        this.notesListSection = document.getElementById('notes-list-section');
        this.noteEditorSection = document.getElementById('note-editor-section');
        this.resizeDivider = document.getElementById('resize-divider');

        this.notesSidebar = document.getElementById('notes-sidebar');
        this.noteTitleInput = document.getElementById('note-title');
        this.noteContentArea = document.getElementById('note-content');
        this.saveButton = document.getElementById('save-note');
        this.deleteButton = document.getElementById('delete-note');
        this.hideListButton = document.getElementById('hide-list');
        this.hideEditorButton = document.getElementById('hide-editor');
        this.showListButton = document.getElementById('show-list');
        this.showEditorButton = document.getElementById('show-editor');

        // Layout state (always horizontal split - top/bottom)
        this.isResizing = false;
        this.startPos = { x: 0, y: 0 };
        this.startSize = { list: 180, editor: 0 };
        this.maximizedState = 'none'; // 'none', 'list', 'editor'
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Search functionality
        this.searchInput.addEventListener('input', (e) => {
            this.filterNotes(e.target.value);
        });

        // New note button
        this.newNoteButton.addEventListener('click', () => this.createNewNote());

        // Expand notes button
        this.expandButton.addEventListener('click', () => this.expandNotes());



        // Show/Hide buttons
        this.hideListButton.addEventListener('click', () => this.hideList());
        this.hideEditorButton.addEventListener('click', () => this.hideEditor());
        this.showListButton.addEventListener('click', () => this.showList());
        this.showEditorButton.addEventListener('click', () => this.showEditor());

        // Resize functionality
        this.resizeDivider.addEventListener('mousedown', (e) => this.startResize(e));
        this.resizeDivider.addEventListener('dblclick', () => this.toggleMaximize());
        document.addEventListener('mousemove', (e) => this.handleResize(e));
        document.addEventListener('mouseup', () => this.stopResize());

        // Note title input
        this.noteTitleInput.addEventListener('input', () => this.scheduleAutoSave());

        // Note content area
        this.noteContentArea.addEventListener('input', () => this.scheduleAutoSave());

        // Save button
        this.saveButton.addEventListener('click', () => this.saveCurrentNote(true));

        // Delete button
        this.deleteButton.addEventListener('click', () => this.deleteCurrentNote());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (document.querySelector('#notes').classList.contains('active')) {
                this.handleKeyboard(e);
            }
        });
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(e) {
        // Ctrl+S to save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.saveCurrentNote(true);
        }

        // Ctrl+N for new note
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            this.createNewNote();
        }

        // Delete key when focus is on sidebar
        if (e.key === 'Delete' && document.activeElement.classList.contains('note-item')) {
            e.preventDefault();
            this.deleteCurrentNote();
        }
    }

    /**
     * Generate unique ID for notes
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Create new note
     */
    createNewNote() {
        const newNote = {
            id: this.generateId(),
            title: 'Untitled Note',
            content: '',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            pinned: false
        };

        this.notes.unshift(newNote);
        this.activeNoteId = newNote.id;
        this.renderNotesList();
        this.loadNote(newNote.id);
        this.saveNotes();

        // Focus on title input
        this.noteTitleInput.focus();
        this.noteTitleInput.select();
    }

    /**
     * Load specific note into editor
     */
    loadNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;

        this.activeNoteId = noteId;
        this.noteTitleInput.value = note.title;
        this.noteContentArea.value = note.content;

        // Update active state in sidebar
        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.noteId === noteId) {
                item.classList.add('active');
            }
        });

        // Enable/disable delete button
        this.deleteButton.disabled = this.notes.length <= 1;
    }

    /**
     * Save current note
     */
    saveCurrentNote(manual = false) {
        if (!this.activeNoteId) return;

        const note = this.notes.find(n => n.id === this.activeNoteId);
        if (!note) return;

        const title = this.noteTitleInput.value.trim() || 'Untitled Note';
        const content = this.noteContentArea.value;

        // Check if there are actual changes
        if (note.title === title && note.content === content && !manual) {
            return;
        }

        note.title = title;
        note.content = content;
        note.modified = new Date().toISOString();

        this.renderNotesList();
        this.saveNotes();

        // Show save confirmation for manual saves
        if (manual) {
            this.showSaveConfirmation();
        }
    }

    /**
     * Delete current note
     */
    deleteCurrentNote() {
        if (!this.activeNoteId || this.notes.length <= 1) return;

        if (confirm('Are you sure you want to delete this note?')) {
            this.deleteNote(this.activeNoteId);
        }
    }

    /**
     * Delete specific note by ID
     */
    deleteNote(noteId) {
        if (!noteId || this.notes.length <= 1) return;

        if (confirm('Are you sure you want to delete this note?')) {
            const noteIndex = this.notes.findIndex(n => n.id === noteId);
            if (noteIndex > -1) {
                this.notes.splice(noteIndex, 1);

                // If deleted note was active, select another note
                if (this.activeNoteId === noteId) {
                    const nextNote = this.notes[Math.min(noteIndex, this.notes.length - 1)];
                    this.activeNoteId = nextNote.id;
                    this.loadNote(this.activeNoteId);
                }

                this.renderNotesList();
                this.saveNotes();
            }
        }
    }

    /**
     * Schedule auto-save
     */
    scheduleAutoSave() {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.saveCurrentNote(false);
        }, 2000);
    }

    /**
     * Show save confirmation
     */
    showSaveConfirmation() {
        const originalText = this.saveButton.textContent;
        this.saveButton.textContent = 'Saved!';
        this.saveButton.style.background = '#4CAF50';

        setTimeout(() => {
            this.saveButton.textContent = originalText;
            this.saveButton.style.background = '';
        }, 1500);
    }

    /**
     * Filter notes based on search query
     */
    filterNotes(query) {
        const searchTerm = query.toLowerCase();
        const noteItems = document.querySelectorAll('.note-item');

        noteItems.forEach(item => {
            const noteId = item.dataset.noteId;
            const note = this.notes.find(n => n.id === noteId);

            if (note) {
                const matchesTitle = note.title.toLowerCase().includes(searchTerm);
                const matchesContent = note.content.toLowerCase().includes(searchTerm);

                if (matchesTitle || matchesContent || searchTerm === '') {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            }
        });
    }

    /**
     * Render notes list in sidebar
     */
    renderNotesList() {
        this.notesSidebar.innerHTML = '';

        // Sort notes: pinned first, then by modified date
        const sortedNotes = [...this.notes].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.modified) - new Date(a.modified);
        });

        // Check if editor is hidden to show delete buttons
        const isEditorHidden = this.noteEditorSection.classList.contains('hidden');

        sortedNotes.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            noteItem.dataset.noteId = note.id;

            // Create content container
            const contentContainer = document.createElement('div');
            contentContainer.className = 'note-item-content';

            // Create title element
            const titleElement = document.createElement('div');
            titleElement.className = 'note-item-title';
            titleElement.textContent = note.title;

            // Create preview element
            const previewElement = document.createElement('div');
            previewElement.className = 'note-item-preview';
            previewElement.textContent = note.content.substring(0, 50) + (note.content.length > 50 ? '...' : '');

            contentContainer.appendChild(titleElement);
            contentContainer.appendChild(previewElement);
            noteItem.appendChild(contentContainer);

            // Add delete button if editor is hidden and more than one note
            if (isEditorHidden && this.notes.length > 1) {
                const deleteButton = document.createElement('button');
                deleteButton.className = 'note-item-delete';
                deleteButton.innerHTML = '×';
                deleteButton.title = 'Delete Note';

                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent note selection
                    this.deleteNote(note.id);
                });

                noteItem.appendChild(deleteButton);
            }

            // Add click event to content container
            contentContainer.addEventListener('click', () => {
                this.loadNote(note.id);
            });

            // Add double-click to pin/unpin
            contentContainer.addEventListener('dblclick', () => {
                this.togglePinNote(note.id);
            });

            this.notesSidebar.appendChild(noteItem);
        });

        // Update active state
        if (this.activeNoteId) {
            const activeItem = document.querySelector(`[data-note-id="${this.activeNoteId}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
            }
        }
    }

    /**
 * Toggle pin status of a note
 */
    togglePinNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            note.pinned = !note.pinned;
            this.renderNotesList();
            this.saveNotes();
        }
    }



    /**
 * Hide notes list (maximize editor)
 */
    hideList() {
        // Don't allow hiding if editor is already hidden
        if (this.noteEditorSection.classList.contains('hidden')) {
            return;
        }

        this.notesListSection.classList.add('hidden');
        this.resizeDivider.classList.add('hidden');
        this.noteEditorSection.classList.add('full-width');
        this.showListButton.style.display = 'block';
        this.maximizedState = 'editor';
    }

    /**
     * Show notes list
     */
    showList() {
        this.notesListSection.classList.remove('hidden');
        this.resizeDivider.classList.remove('hidden');
        this.noteEditorSection.classList.remove('full-width');
        this.showListButton.style.display = 'none';
        this.maximizedState = 'none';
        this.resetSplitSizes();
    }

    /**
 * Hide text editor (maximize list)
 */
    hideEditor() {
        // Don't allow hiding if list is already hidden
        if (this.notesListSection.classList.contains('hidden')) {
            return;
        }

        this.noteEditorSection.classList.add('hidden');
        this.resizeDivider.classList.add('hidden');
        this.notesListSection.classList.add('full-width');
        this.showEditorButton.style.display = 'inline-block';
        this.maximizedState = 'list';
    }

    /**
     * Show text editor
     */
    showEditor() {
        this.noteEditorSection.classList.remove('hidden');
        this.resizeDivider.classList.remove('hidden');
        this.notesListSection.classList.remove('full-width');
        this.showEditorButton.style.display = 'none';
        this.maximizedState = 'none';
        this.resetSplitSizes();
    }

    /**
     * Toggle maximize state (double-click functionality)
     */
    toggleMaximize() {
        if (this.maximizedState === 'none') {
            // Maximize editor by default
            this.hideList();
        } else if (this.maximizedState === 'editor') {
            // Switch to maximized list
            this.showList();
            this.hideEditor();
        } else if (this.maximizedState === 'list') {
            // Back to normal split
            this.showEditor();
        }
    }

    /**
     * Reset split sizes to default
     */
    resetSplitSizes() {
        this.notesListSection.style.flexBasis = '';
        this.noteEditorSection.style.flexBasis = '';
    }

    /**
     * Start vertical resizing (horizontal split)
     */
    startResize(e) {
        this.isResizing = true;
        this.startPos.y = e.clientY;

        const listRect = this.notesListSection.getBoundingClientRect();
        this.startSize.list = listRect.height;

        e.preventDefault();
        document.body.style.cursor = 'ns-resize';
    }

    /**
     * Handle vertical resize with maximization zones (horizontal split)
     */
    handleResize(e) {
        if (!this.isResizing) return;

        const containerRect = this.notesContainer.getBoundingClientRect();
        const deltaY = e.clientY - this.startPos.y;
        const newHeight = this.startSize.list + deltaY;
        const containerHeight = containerRect.height;

        // Maximization zones (20px from edges)
        if (newHeight < 20) {
            // Maximize editor (hide list)
            this.hideList();
            return;
        } else if (newHeight > containerHeight - 20) {
            // Maximize list (hide editor)  
            this.hideEditor();
            return;
        }

        // Normal resize with limits
        const constrainedHeight = Math.max(100, Math.min(300, newHeight));
        this.notesListSection.style.flexBasis = constrainedHeight + 'px';
    }

    /**
     * Stop resizing
     */
    stopResize() {
        this.isResizing = false;
        document.body.style.cursor = '';
    }

    /**
     * Save notes to storage
     */
    saveNotes() {
        const storageMethod = this.useSync ? chrome.storage.sync : chrome.storage.local;

        storageMethod.set({
            notes: this.notes,
            activeNoteId: this.activeNoteId,
            notesUseSync: this.useSync
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error saving notes:', chrome.runtime.lastError);

                // If sync fails, fall back to local storage
                if (this.useSync) {
                    this.useSync = false;
                    chrome.storage.local.set({
                        notes: this.notes,
                        activeNoteId: this.activeNoteId,
                        notesUseSync: this.useSync
                    });
                }
            }
        });
    }

    /**
 * Load notes from storage
 */
    loadNotes() {
        // Try to load from both storages and use the most recent
        Promise.all([
            new Promise(resolve => chrome.storage.local.get(['notes', 'activeNoteId', 'notesUseSync', 'notesLayoutHorizontal'], resolve)),
            new Promise(resolve => chrome.storage.sync.get(['notes', 'activeNoteId', 'notesUseSync'], resolve))
        ]).then(([localData, syncData]) => {
            let dataToUse = localData;

            // If sync data exists and is more recent, use it
            if (syncData.notes && syncData.notes.length > 0) {
                const syncModified = Math.max(...syncData.notes.map(n => new Date(n.modified).getTime()));
                const localModified = localData.notes && localData.notes.length > 0
                    ? Math.max(...localData.notes.map(n => new Date(n.modified).getTime()))
                    : 0;

                if (syncModified > localModified) {
                    dataToUse = syncData;
                }
            }

            this.notes = dataToUse.notes || [];
            this.activeNoteId = dataToUse.activeNoteId;
            this.useSync = dataToUse.notesUseSync || false;

            // Always use horizontal split layout (notes on top, editor on bottom)

            // If no notes exist, create a welcome note
            if (this.notes.length === 0) {
                this.createWelcomeNote();
            }

            // Load first note if no active note
            if (!this.activeNoteId && this.notes.length > 0) {
                this.activeNoteId = this.notes[0].id;
            }

            this.renderNotesList();
            if (this.activeNoteId) {
                this.loadNote(this.activeNoteId);
            }
        });
    }

    /**
 * Create welcome note for new users
 */
    createWelcomeNote() {
        const welcomeNote = {
            id: this.generateId(),
            title: 'Welcome to Notes',
            content: 'Welcome to your personal notes!\n\nFeatures:\n• Auto-save as you type\n• Search through all notes\n• Double-click to pin important notes\n• Ctrl+S to save manually\n• Ctrl+N for new note\n\nStart writing your thoughts here!',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            pinned: false
        };

        this.notes.push(welcomeNote);
        this.activeNoteId = welcomeNote.id;
    }

    /**
     * Update note from popup window (direct method)
     */
    updateNoteFromPopup(noteId, title, content) {
        console.log('Direct update from popup:', noteId, title); // Debug
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            note.title = title;
            note.content = content;
            note.modified = new Date().toISOString();

            this.renderNotesList();
            this.loadNote(noteId);
            this.saveNotes();
            console.log('Note updated successfully from popup'); // Debug
        } else {
            console.log('Note not found for popup update:', noteId); // Debug
        }
    }

    /**
     * Expand notes in a popup window
     */
    expandNotes() {
        const currentNote = this.notes.find(n => n.id === this.activeNoteId);
        const title = currentNote ? currentNote.title : 'Note Editor';
        const content = currentNote ? currentNote.content : '';
        const activeNoteId = this.activeNoteId; // Capture for closure

        // Create a simple popup with a larger text area (no forced scrollbars)
        const popup = window.open('', 'notes-popup', 'width=800,height=600,scrollbars=no,resizable=yes');

        if (popup) {
            popup.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>TheTool - ${title}</title>
          <style>
            * {
              box-sizing: border-box;
            }
            html, body {
              height: 100%;
              margin: 0;
              padding: 0;
              overflow: hidden;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f5f5f5;
              padding: 20px;
            }
            .container {
              background: white;
              border-radius: 8px;
              padding: 20px;
              height: calc(100vh - 40px);
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              display: flex;
              flex-direction: column;
              overflow: hidden;
            }
            .header {
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 1px solid #e0e0e0;
              flex-shrink: 0;
            }
            h1 {
              margin: 0;
              color: #333;
              font-size: 24px;
            }
            #note-title {
              width: 100%;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 6px;
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 15px;
              flex-shrink: 0;
            }
            #note-content {
              flex: 1;
              width: 100%;
              padding: 15px;
              border: 1px solid #ddd;
              border-radius: 6px;
              font-size: 14px;
              font-family: inherit;
              resize: none;
              line-height: 1.6;
              min-height: 0;
              overflow-y: auto;
            }
            .actions {
              margin-top: 15px;
              display: flex;
              gap: 10px;
              flex-shrink: 0;
            }
            button {
              padding: 10px 20px;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
            }
            .btn-primary {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .btn-secondary {
              background: #f5f5f5;
              color: #666;
              border: 1px solid #ddd;
            }
            button:hover {
              opacity: 0.9;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Note Editor</h1>
            </div>
            <input type="text" id="note-title" value="${title}" placeholder="Note title...">
            <textarea id="note-content" placeholder="Start writing your note...">${content}</textarea>
            <div class="actions">
              <button class="btn-primary" id="save-close-btn">Save & Close</button>
              <button class="btn-secondary" id="close-btn">Close</button>
            </div>
          </div>
        </body>
        </html>
      `);

            popup.document.close();

            // Set up a reference to this instance for the popup to access
            popup.notesInstance = this;
            popup.activeNoteId = activeNoteId;

            // Add event listeners using a more reliable method
            setTimeout(() => {
                const saveBtn = popup.document.getElementById('save-close-btn');
                const closeBtn = popup.document.getElementById('close-btn');
                const titleInput = popup.document.getElementById('note-title');
                const contentInput = popup.document.getElementById('note-content');

                console.log('Setting up popup event listeners'); // Debug

                if (saveBtn && closeBtn && titleInput && contentInput) {
                    // Save and close function
                    const saveAndClose = () => {
                        const title = titleInput.value;
                        const content = contentInput.value;
                        console.log('Popup: Saving note', activeNoteId, title); // Debug

                        // Direct call to save function
                        if (popup.notesInstance) {
                            popup.notesInstance.updateNoteFromPopup(activeNoteId, title, content);
                        }
                        popup.close();
                    };

                    // Auto-save function
                    const autoSave = () => {
                        const title = titleInput.value;
                        const content = contentInput.value;
                        console.log('Auto-saving note', activeNoteId); // Debug

                        if (popup.notesInstance) {
                            popup.notesInstance.updateNoteFromPopup(activeNoteId, title, content);
                        }
                    };

                    // Add event listeners
                    saveBtn.addEventListener('click', saveAndClose);
                    closeBtn.addEventListener('click', () => popup.close());

                    // Auto-save every 5 seconds
                    setInterval(autoSave, 5000);

                    // Focus on content area
                    contentInput.focus();

                    console.log('Popup event listeners attached successfully'); // Debug
                } else {
                    console.log('Failed to find popup elements'); // Debug
                }
            }, 100); // Small delay to ensure DOM is ready

            // Clean up reference when popup closes
            popup.addEventListener('beforeunload', () => {
                popup.notesInstance = null;
                popup.activeNoteId = null;
            });
        } else {
            alert('Popup blocked! Please allow popups for this extension.');
        }
    }
}

// Initialize notes when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Notes();
    });
} else {
    new Notes();
}
