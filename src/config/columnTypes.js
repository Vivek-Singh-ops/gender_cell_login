export const COLUMN_TYPES = {
  text: {
    label: 'Text',
    icon: '📝',
    defaultValue: '',
    validation: (value) => typeof value === 'string'
  },
  number: {
    label: 'Number',
    icon: '🔢',
    defaultValue: 0,
    validation: (value) => !isNaN(value)
  },
  image: {
    label: 'Image URL',
    icon: '🖼️',
    defaultValue: '',
    validation: (value) => typeof value === 'string'
  },
  link: {
    label: 'Link/URL',
    icon: '🔗',
    defaultValue: '',
    validation: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return value === '' || value.startsWith('http');
      }
    }
  },
  file: {
    label: 'File',
    icon: '📎',
    defaultValue: '',
    validation: (value) => typeof value === 'string'
  },
  date: {
    label: 'Date',
    icon: '📅',
    defaultValue: new Date().toISOString().split('T')[0],
    validation: (value) => !isNaN(Date.parse(value))
  },
  boolean: {
    label: 'Yes/No',
    icon: '✅',
    defaultValue: false,
    validation: (value) => typeof value === 'boolean'
  },
  email: {
    label: 'Email',
    icon: '📧',
    defaultValue: '',
    validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value === ''
  }
};