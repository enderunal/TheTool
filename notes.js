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

        this.notesSidebar = document.getElementById('notes-sidebar');
        this.noteTitleInput = document.getElementById('note-title');
        this.noteContentArea = document.getElementById('note-content');
        this.saveButton = document.getElementById('save-note');
        this.deleteButton = document.getElementById('delete-note');
        this.hideListButton = document.getElementById('hide-list');
        this.showListButton = document.getElementById('show-list');
        this.expandButton = document.getElementById('expand-notes');
        this.newNoteListButton = document.getElementById('new-note-list');
        this.expandNotesListButton = document.getElementById('expand-notes-list');

        // Layout state (editor by default, list hidden)
        this.isListVisible = false;
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
        this.showListButton.addEventListener('click', () => this.showList());
        this.newNoteListButton.addEventListener('click', () => this.createNewNote());

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

        // Hide list and show editor when creating new note
        this.hideList();

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

            // Add delete button for all notes in list view
            if (this.notes.length > 1) {
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
            contentContainer.addEventListener('click', (e) => {
                // Prevent double-click from triggering single click
                if (e.detail === 1) {
                    setTimeout(() => {
                        if (e.detail === 1) {
                            this.loadNote(note.id);
                            // Hide list and show editor when note is clicked
                            this.hideList();
                        }
                    }, 200);
                }
            });

            // Add double-click to pin/unpin
            contentContainer.addEventListener('dblclick', (e) => {
                e.preventDefault();
                e.stopPropagation();
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
 * Show notes list
 */
    showList() {
        this.notesListSection.classList.remove('hidden');
        this.isListVisible = true;
        this.renderNotesList();

        // Show search input when list is visible
        this.searchInput.classList.add('visible');
    }

    /**
  * Hide notes list
  */
    hideList() {
        this.notesListSection.classList.add('hidden');
        this.isListVisible = false;

        // Hide search input when list is hidden
        this.searchInput.classList.remove('visible');
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
              background: var(--theme-background, #f5f5f5);
              padding: 20px;
              color: var(--theme-text-primary, #333);
            }
            .container {
              background: var(--theme-surface, white);
              border-radius: 8px;
              padding: 20px;
              height: calc(100vh - 40px);
              box-shadow: var(--theme-shadow, 0 2px 10px rgba(0,0,0,0.1));
              display: flex;
              flex-direction: column;
              overflow: hidden;
              border: 1px solid var(--theme-border, #e0e0e0);
            }
            .header {
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 1px solid var(--theme-border, #e0e0e0);
              flex-shrink: 0;
            }
            h1 {
              margin: 0;
              color: var(--theme-text-primary, #333);
              font-size: 24px;
            }
            #note-title {
              width: 100%;
              padding: 10px;
              border: 1px solid var(--theme-input-border, #ddd);
              border-radius: 6px;
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 15px;
              flex-shrink: 0;
              background: var(--theme-input-background, white);
              color: var(--theme-text-primary, #333);
            }
            #note-title:focus {
              outline: none;
              border-color: var(--theme-input-focus, #667eea);
              box-shadow: 0 0 0 2px var(--theme-accent-light, rgba(102, 126, 234, 0.1));
            }
            #note-content {
              flex: 1;
              width: 100%;
              padding: 15px;
              border: 1px solid var(--theme-input-border, #ddd);
              border-radius: 6px;
              font-size: 14px;
              font-family: inherit;
              resize: none;
              line-height: 1.6;
              min-height: 0;
              overflow-y: auto;
              background: var(--theme-input-background, white);
              color: var(--theme-text-primary, #333);
            }
            #note-content:focus {
              outline: none;
              border-color: var(--theme-input-focus, #667eea);
              box-shadow: 0 0 0 2px var(--theme-accent-light, rgba(102, 126, 234, 0.1));
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
              transition: all 0.2s ease;
            }
            .btn-primary {
              background: var(--theme-button-primary, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
              color: var(--theme-text-on-gradient, white);
              box-shadow: var(--theme-shadow-light, 0 1px 3px rgba(0,0,0,0.1));
            }
            .btn-primary:hover {
              background: var(--theme-button-primary-hover, linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%));
              box-shadow: var(--theme-shadow-medium, 0 2px 8px rgba(0,0,0,0.15));
              transform: translateY(-1px);
            }
            .btn-secondary {
              background: var(--theme-button-secondary, #f5f5f5);
              color: var(--theme-text-secondary, #666);
              border: 1px solid var(--theme-border, #ddd);
              box-shadow: var(--theme-shadow-light, 0 1px 3px rgba(0,0,0,0.1));
            }
            .btn-secondary:hover {
              background: var(--theme-button-secondary-hover, #e8e8e8);
              color: var(--theme-text-primary, #333);
              box-shadow: var(--theme-shadow-medium, 0 2px 8px rgba(0,0,0,0.15));
              transform: translateY(-1px);
            }
            button:active {
              transform: translateY(0);
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

            // Apply current theme to the popup
            chrome.storage.local.get(['currentTheme', 'theme'], (result) => {
                const currentTheme = result.currentTheme || result.theme || 'classic';
                const themeConfig = this.getThemeConfig(currentTheme);
                const root = popup.document.documentElement;

                // Apply CSS custom properties
                Object.entries(themeConfig).forEach(([property, value]) => {
                    root.style.setProperty(property, value);
                });

                // Set theme attribute
                popup.document.body.setAttribute('data-theme', currentTheme);
            });

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

    /**
     * Get theme configuration for popup window
     */
    getThemeConfig(theme) {
        // Import all themes from popup.js to ensure consistency
        const themes = {
            'classic': {
                '--theme-primary': '#667eea',
                '--theme-secondary': '#764ba2',
                '--theme-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '--theme-background': '#ffffff',
                '--theme-surface': '#ffffff',
                '--theme-surface-secondary': '#f5f5f5',
                '--theme-surface-tertiary': '#f9f9f9',
                '--theme-surface-hover': '#f0f0f0',
                '--theme-surface-active': '#e8e8e8',
                '--theme-surface-elevated': '#ffffff',
                '--theme-surface-modal': '#ffffff',
                '--theme-on-surface': '#333333',
                '--theme-on-surface-variant': '#666666',
                '--theme-on-surface-secondary': '#555555',
                '--theme-on-background': '#333333',
                '--theme-text-primary': '#333333',
                '--theme-text-secondary': '#666666',
                '--theme-text-tertiary': '#999999',
                '--theme-text-on-gradient': '#ffffff',
                '--theme-text-muted': '#aaaaaa',
                '--theme-border': '#e0e0e0',
                '--theme-border-variant': '#d1d1d6',
                '--theme-border-light': '#f0f0f0',
                '--theme-border-focus': '#667eea',
                '--theme-outline': '#e0e0e0',
                '--theme-outline-variant': '#f0f0f0',
                '--theme-accent': '#667eea',
                '--theme-accent-hover': '#5a6fd8',
                '--theme-accent-active': '#4c63d2',
                '--theme-accent-light': 'rgba(102, 126, 234, 0.1)',
                '--theme-tab-nav-bg': '#f5f5f5',
                '--theme-tab-hover': 'rgba(103, 58, 183, 0.05)',
                '--theme-tab-active-color': '#673ab7',
                '--theme-button-primary': '#667eea',
                '--theme-button-primary-hover': '#5a6fd8',
                '--theme-button-secondary': '#f5f5f5',
                '--theme-button-secondary-hover': '#e8e8e8',
                '--theme-input-background': '#ffffff',
                '--theme-input-border': '#e0e0e0',
                '--theme-input-focus': '#667eea',
                '--theme-card-background': '#ffffff',
                '--theme-card-border': '#e0e0e0',
                '--theme-list-item-background': '#ffffff',
                '--theme-list-item-hover': '#f5f5f5',
                '--theme-list-item-active': '#667eea',
                '--theme-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
                '--theme-shadow-light': '0 1px 3px rgba(0, 0, 0, 0.1)',
                '--theme-shadow-medium': '0 2px 8px rgba(0, 0, 0, 0.15)',
                '--theme-shadow-heavy': '0 4px 16px rgba(0, 0, 0, 0.2)',
                '--theme-success': '#10b981',
                '--theme-warning': '#f59e0b',
                '--theme-error': '#ef4444',
                '--theme-info': '#3b82f6'
            },
            'classic-dark': {
                '--theme-primary': '#4a5568',
                '--theme-secondary': '#2d3748',
                '--theme-gradient': 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
                '--theme-background': '#1a202c',
                '--theme-surface': '#2d3748',
                '--theme-surface-secondary': '#4a5568',
                '--theme-surface-tertiary': '#374151',
                '--theme-surface-hover': '#374151',
                '--theme-surface-active': '#4a5568',
                '--theme-surface-elevated': '#2d3748',
                '--theme-surface-modal': '#2d3748',
                '--theme-on-surface': '#f7fafc',
                '--theme-on-surface-variant': '#e2e8f0',
                '--theme-on-surface-secondary': '#cbd5e0',
                '--theme-on-background': '#f7fafc',
                '--theme-text-primary': '#f7fafc',
                '--theme-text-secondary': '#e2e8f0',
                '--theme-text-tertiary': '#cbd5e0',
                '--theme-text-on-gradient': '#ffffff',
                '--theme-text-muted': '#a0aec0',
                '--theme-border': '#4a5568',
                '--theme-border-variant': '#374151',
                '--theme-border-light': '#4a5568',
                '--theme-border-focus': '#81c784',
                '--theme-outline': '#4a5568',
                '--theme-outline-variant': '#374151',
                '--theme-tab-nav-bg': '#4a5568',
                '--theme-tab-hover': 'rgba(160, 174, 192, 0.2)',
                '--theme-tab-active-color': '#81c784',
                '--theme-accent': '#81c784',
                '--theme-accent-hover': '#68b36b',
                '--theme-accent-active': '#5a9c5a',
                '--theme-accent-light': 'rgba(129, 199, 132, 0.2)',
                '--theme-button-primary': '#81c784',
                '--theme-button-primary-hover': '#68b36b',
                '--theme-button-secondary': '#4a5568',
                '--theme-button-secondary-hover': '#374151',
                '--theme-input-background': '#2d3748',
                '--theme-input-border': '#4a5568',
                '--theme-input-focus': '#81c784',
                '--theme-card-background': '#2d3748',
                '--theme-card-border': '#4a5568',
                '--theme-list-item-background': '#2d3748',
                '--theme-list-item-hover': '#374151',
                '--theme-list-item-active': '#81c784',
                '--theme-shadow': '0 2px 8px rgba(0, 0, 0, 0.3)',
                '--theme-shadow-light': '0 1px 3px rgba(0, 0, 0, 0.3)',
                '--theme-shadow-medium': '0 2px 8px rgba(0, 0, 0, 0.4)',
                '--theme-shadow-heavy': '0 4px 16px rgba(0, 0, 0, 0.5)',
                '--theme-success': '#68b36b',
                '--theme-warning': '#ed8936',
                '--theme-error': '#f56565',
                '--theme-info': '#63b3ed'
            },
            'gold': {
                '--theme-primary': '#f59e0b',
                '--theme-secondary': '#d97706',
                '--theme-gradient': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                '--theme-background': '#ffffff',
                '--theme-surface': '#ffffff',
                '--theme-surface-secondary': '#fef3c7',
                '--theme-surface-tertiary': '#fefce8',
                '--theme-surface-hover': '#fde68a',
                '--theme-surface-active': '#fcd34d',
                '--theme-surface-elevated': '#ffffff',
                '--theme-surface-modal': '#ffffff',
                '--theme-on-surface': '#92400e',
                '--theme-on-surface-variant': '#a16207',
                '--theme-on-surface-secondary': '#78350f',
                '--theme-on-background': '#92400e',
                '--theme-text-primary': '#92400e',
                '--theme-text-secondary': '#a16207',
                '--theme-text-tertiary': '#78350f',
                '--theme-text-on-gradient': '#ffffff',
                '--theme-text-muted': '#d97706',
                '--theme-border': '#fbbf24',
                '--theme-border-variant': '#fde68a',
                '--theme-border-light': '#fef3c7',
                '--theme-border-focus': '#f59e0b',
                '--theme-outline': '#fbbf24',
                '--theme-outline-variant': '#fde68a',
                '--theme-accent': '#f59e0b',
                '--theme-accent-hover': '#d97706',
                '--theme-accent-active': '#b45309',
                '--theme-accent-light': 'rgba(245, 158, 11, 0.1)',
                '--theme-tab-nav-bg': '#fef3c7',
                '--theme-tab-hover': 'rgba(245, 158, 11, 0.05)',
                '--theme-tab-active-color': '#d97706',
                '--theme-button-primary': '#f59e0b',
                '--theme-button-primary-hover': '#d97706',
                '--theme-button-secondary': '#fef3c7',
                '--theme-button-secondary-hover': '#fde68a',
                '--theme-input-background': '#ffffff',
                '--theme-input-border': '#fbbf24',
                '--theme-input-focus': '#f59e0b',
                '--theme-card-background': '#ffffff',
                '--theme-card-border': '#fbbf24',
                '--theme-list-item-background': '#ffffff',
                '--theme-list-item-hover': '#fef3c7',
                '--theme-list-item-active': '#f59e0b',
                '--theme-shadow': '0 2px 8px rgba(245, 158, 11, 0.1)',
                '--theme-shadow-light': '0 1px 3px rgba(245, 158, 11, 0.1)',
                '--theme-shadow-medium': '0 2px 8px rgba(245, 158, 11, 0.15)',
                '--theme-shadow-heavy': '0 4px 16px rgba(245, 158, 11, 0.2)',
                '--theme-success': '#10b981',
                '--theme-warning': '#f59e0b',
                '--theme-error': '#ef4444',
                '--theme-info': '#3b82f6'
            },
            'gold-dark': {
                '--theme-primary': '#fbbf24',
                '--theme-secondary': '#f59e0b',
                '--theme-gradient': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                '--theme-background': '#1c1917',
                '--theme-surface': '#292524',
                '--theme-surface-secondary': '#44403c',
                '--theme-surface-tertiary': '#57534e',
                '--theme-surface-hover': '#44403c',
                '--theme-surface-active': '#57534e',
                '--theme-surface-elevated': '#292524',
                '--theme-surface-modal': '#292524',
                '--theme-on-surface': '#fef3c7',
                '--theme-on-surface-variant': '#fde68a',
                '--theme-on-surface-secondary': '#fcd34d',
                '--theme-on-background': '#fef3c7',
                '--theme-text-primary': '#fef3c7',
                '--theme-text-secondary': '#fde68a',
                '--theme-text-tertiary': '#fcd34d',
                '--theme-text-on-gradient': '#ffffff',
                '--theme-text-muted': '#fbbf24',
                '--theme-border': '#57534e',
                '--theme-border-variant': '#44403c',
                '--theme-border-light': '#57534e',
                '--theme-border-focus': '#fbbf24',
                '--theme-outline': '#57534e',
                '--theme-outline-variant': '#44403c',
                '--theme-tab-nav-bg': '#44403c',
                '--theme-tab-hover': 'rgba(251, 191, 36, 0.2)',
                '--theme-tab-active-color': '#fbbf24',
                '--theme-accent': '#fbbf24',
                '--theme-accent-hover': '#f59e0b',
                '--theme-accent-active': '#d97706',
                '--theme-accent-light': 'rgba(251, 191, 36, 0.2)',
                '--theme-button-primary': '#fbbf24',
                '--theme-button-primary-hover': '#f59e0b',
                '--theme-button-secondary': '#44403c',
                '--theme-button-secondary-hover': '#57534e',
                '--theme-input-background': '#292524',
                '--theme-input-border': '#57534e',
                '--theme-input-focus': '#fbbf24',
                '--theme-card-background': '#292524',
                '--theme-card-border': '#57534e',
                '--theme-list-item-background': '#292524',
                '--theme-list-item-hover': '#44403c',
                '--theme-list-item-active': '#fbbf24',
                '--theme-shadow': '0 2px 8px rgba(0, 0, 0, 0.3)',
                '--theme-shadow-light': '0 1px 3px rgba(0, 0, 0, 0.3)',
                '--theme-shadow-medium': '0 2px 8px rgba(0, 0, 0, 0.4)',
                '--theme-shadow-heavy': '0 4px 16px rgba(0, 0, 0, 0.5)',
                '--theme-success': '#68b36b',
                '--theme-warning': '#fbbf24',
                '--theme-error': '#f56565',
                '--theme-info': '#63b3ed'
            }
        };

        // For now, return classic if theme not found
        // In a full implementation, you would copy all themes from popup.js
        return themes[theme] || themes.classic;
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
