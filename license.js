// Theme configuration
function getThemeConfig(theme) {
    const themes = {
        'classic': {
            '--primary-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '--primary-color': '#667eea',
            '--secondary-color': '#764ba2',
            '--background': '#ffffff',
            '--surface': '#ffffff',
            '--on-surface': '#333333',
            '--border-color': '#e0e0e0',
            '--text-color': '#333333',
            '--text-secondary': '#666666'
        },
        'classic-dark': {
            '--primary-gradient': 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
            '--primary-color': '#4a5568',
            '--secondary-color': '#2d3748',
            '--background': '#1a202c',
            '--surface': '#2d3748',
            '--on-surface': '#ffffff',
            '--border-color': '#4a5568',
            '--text-color': '#ffffff',
            '--text-secondary': '#cccccc'
        },
        'gold': {
            '--primary-gradient': 'linear-gradient(135deg, #B8860B 0%, #DAA520 100%)',
            '--primary-color': '#B8860B',
            '--secondary-color': '#DAA520',
            '--background': '#FFFDF7',
            '--surface': '#ffffff',
            '--on-surface': '#1F1B13',
            '--border-color': '#e0e0e0',
            '--text-color': '#1F1B13',
            '--text-secondary': '#666666'
        },
        'gold-dark': {
            '--primary-gradient': 'linear-gradient(135deg, #6B4E00 0%, #8B6914 100%)',
            '--primary-color': '#8B6914',
            '--secondary-color': '#6B4E00',
            '--background': '#1A1611',
            '--surface': '#2A2016',
            '--on-surface': '#E8E2D4',
            '--border-color': '#4a5568',
            '--text-color': '#E8E2D4',
            '--text-secondary': '#cccccc'
        },
        'platinum': {
            '--primary-gradient': 'linear-gradient(135deg, #C0C0C0 0%, #E5E5E5 100%)',
            '--primary-color': '#9CA3AF',
            '--secondary-color': '#6B7280',
            '--background': '#FEFEFE',
            '--surface': '#ffffff',
            '--on-surface': '#1A1A1A',
            '--border-color': '#e0e0e0',
            '--text-color': '#1A1A1A',
            '--text-secondary': '#666666'
        },
        'platinum-dark': {
            '--primary-gradient': 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
            '--primary-color': '#9CA3AF',
            '--secondary-color': '#6B7280',
            '--background': '#121212',
            '--surface': '#1F2937',
            '--on-surface': '#E8E8E8',
            '--border-color': '#4a5568',
            '--text-color': '#E8E8E8',
            '--text-secondary': '#cccccc'
        },
        'emerald': {
            '--primary-gradient': 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            '--primary-color': '#059669',
            '--secondary-color': '#10B981',
            '--background': '#F8FDF9',
            '--surface': '#ffffff',
            '--on-surface': '#0F1B11',
            '--border-color': '#e0e0e0',
            '--text-color': '#0F1B11',
            '--text-secondary': '#666666'
        },
        'emerald-dark': {
            '--primary-gradient': 'linear-gradient(135deg, #065F46 0%, #064E3B 100%)',
            '--primary-color': '#10B981',
            '--secondary-color': '#065F46',
            '--background': '#0A1A0C',
            '--surface': '#1A2E1C',
            '--on-surface': '#D4E8D6',
            '--border-color': '#4a5568',
            '--text-color': '#D4E8D6',
            '--text-secondary': '#cccccc'
        },
        'sapphire': {
            '--primary-gradient': 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
            '--primary-color': '#1E40AF',
            '--secondary-color': '#3B82F6',
            '--background': '#F8FBFF',
            '--surface': '#ffffff',
            '--on-surface': '#0F1419',
            '--border-color': '#e0e0e0',
            '--text-color': '#0F1419',
            '--text-secondary': '#666666'
        },
        'sapphire-dark': {
            '--primary-gradient': 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)',
            '--primary-color': '#3B82F6',
            '--secondary-color': '#1D4ED8',
            '--background': '#0A1318',
            '--surface': '#1A2330',
            '--on-surface': '#D4E2F0',
            '--border-color': '#4a5568',
            '--text-color': '#D4E2F0',
            '--text-secondary': '#cccccc'
        },
        'ruby': {
            '--primary-gradient': 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
            '--primary-color': '#DC2626',
            '--secondary-color': '#EF4444',
            '--background': '#FFFBFB',
            '--surface': '#ffffff',
            '--on-surface': '#1B0F0F',
            '--border-color': '#e0e0e0',
            '--text-color': '#1B0F0F',
            '--text-secondary': '#666666'
        },
        'ruby-dark': {
            '--primary-gradient': 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)',
            '--primary-color': '#EF4444',
            '--secondary-color': '#991B1B',
            '--background': '#1A0A0A',
            '--surface': '#2A1A1A',
            '--on-surface': '#E8D4D4',
            '--border-color': '#4a5568',
            '--text-color': '#E8D4D4',
            '--text-secondary': '#cccccc'
        },
        'amethyst': {
            '--primary-gradient': 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
            '--primary-color': '#7C3AED',
            '--secondary-color': '#8B5CF6',
            '--background': '#FDFBFF',
            '--surface': '#ffffff',
            '--on-surface': '#1A0F1B',
            '--border-color': '#e0e0e0',
            '--text-color': '#1A0F1B',
            '--text-secondary': '#666666'
        },
        'amethyst-dark': {
            '--primary-gradient': 'linear-gradient(135deg, #5B21B6 0%, #6D28D9 100%)',
            '--primary-color': '#8B5CF6',
            '--secondary-color': '#6D28D9',
            '--background': '#1A0A1A',
            '--surface': '#2A1A2A',
            '--on-surface': '#E8D4E8',
            '--border-color': '#4a5568',
            '--text-color': '#E8D4E8',
            '--text-secondary': '#cccccc'
        },
        'copper': {
            '--primary-gradient': 'linear-gradient(135deg, #C2410C 0%, #EA580C 100%)',
            '--primary-color': '#C2410C',
            '--secondary-color': '#EA580C',
            '--background': '#FFFCF9',
            '--surface': '#ffffff',
            '--on-surface': '#1B1611',
            '--border-color': '#e0e0e0',
            '--text-color': '#1B1611',
            '--text-secondary': '#666666'
        },
        'copper-dark': {
            '--primary-gradient': 'linear-gradient(135deg, #7C2D12 0%, #9A3412 100%)',
            '--primary-color': '#EA580C',
            '--secondary-color': '#9A3412',
            '--background': '#1A1510',
            '--surface': '#2A251A',
            '--on-surface': '#E8E0D4',
            '--border-color': '#4a5568',
            '--text-color': '#E8E0D4',
            '--text-secondary': '#cccccc'
        },
        'obsidian': {
            '--primary-gradient': 'linear-gradient(135deg, #000000 0%, #374151 100%)',
            '--primary-color': '#374151',
            '--secondary-color': '#000000',
            '--background': '#FFFFFF',
            '--surface': '#ffffff',
            '--on-surface': '#000000',
            '--border-color': '#e0e0e0',
            '--text-color': '#000000',
            '--text-secondary': '#666666'
        },
        'obsidian-dark': {
            '--primary-gradient': 'linear-gradient(135deg, #000000 0%, #111827 100%)',
            '--primary-color': '#6B7280',
            '--secondary-color': '#374151',
            '--background': '#000000',
            '--surface': '#111827',
            '--on-surface': '#FFFFFF',
            '--border-color': '#4a5568',
            '--text-color': '#FFFFFF',
            '--text-secondary': '#cccccc'
        },
        'steel': {
            '--primary-gradient': 'linear-gradient(135deg, #475569 0%, #64748B 100%)',
            '--primary-color': '#475569',
            '--secondary-color': '#64748B',
            '--background': '#F8FAFC',
            '--surface': '#ffffff',
            '--on-surface': '#1E293B',
            '--border-color': '#e0e0e0',
            '--text-color': '#1E293B',
            '--text-secondary': '#666666'
        },
        'steel-dark': {
            '--primary-gradient': 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
            '--primary-color': '#64748B',
            '--secondary-color': '#475569',
            '--background': '#0F172A',
            '--surface': '#1E293B',
            '--on-surface': '#E2E8F0',
            '--border-color': '#4a5568',
            '--text-color': '#E2E8F0',
            '--text-secondary': '#cccccc'
        },
        'midnight': {
            '--primary-gradient': 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
            '--primary-color': '#1E1B4B',
            '--secondary-color': '#312E81',
            '--background': '#FAFBFF',
            '--surface': '#ffffff',
            '--on-surface': '#0A0E1A',
            '--border-color': '#e0e0e0',
            '--text-color': '#0A0E1A',
            '--text-secondary': '#666666'
        },
        'midnight-dark': {
            '--primary-gradient': 'linear-gradient(135deg, #000510 0%, #1A1625 100%)',
            '--primary-color': '#6366F1',
            '--secondary-color': '#312E81',
            '--background': '#000510',
            '--surface': '#0A0A1A',
            '--on-surface': '#E6F0FF',
            '--border-color': '#4a5568',
            '--text-color': '#E6F0FF',
            '--text-secondary': '#cccccc'
        }
    };

    return themes[theme] || themes.classic;
}

// Apply theme
function applyTheme(theme) {
    const root = document.documentElement;
    const themeConfig = getThemeConfig(theme);

    if (themeConfig) {
        Object.entries(themeConfig).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
    }
}

// Apply theme if available
if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['theme'], function (result) {
        if (result.theme) {
            document.documentElement.setAttribute('data-theme', result.theme);
            document.body.className = document.body.className.replace(/theme-\w+(-\w+)*/g, '');
            document.body.classList.add(`theme-${result.theme}`);
            applyTheme(result.theme);
        }
    });
}
