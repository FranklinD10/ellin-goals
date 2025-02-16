export interface Category {
  value: string;
  label: string;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  { value: 'health', emoji: '🏃', label: 'Health & Fitness' },
  { value: 'productivity', emoji: '💼', label: 'Productivity' },
  { value: 'personal', emoji: '🎯', label: 'Personal Growth' },
  { value: 'mindfulness', emoji: '🧘', label: 'Mindfulness' },
  { value: 'learning', emoji: '📚', label: 'Learning' },
  { value: 'social', emoji: '👥', label: 'Social' },
  { value: 'creative', emoji: '🎨', label: 'Creative' },
  { value: 'finance', emoji: '💰', label: 'Finance' },
  { value: 'spiritual', emoji: '📖', label: 'Spiritual' }
] as const;

export const getCategoryDetails = (category: string): Category => {
  return CATEGORIES.find(c => c.value === category) || 
    { value: category, emoji: '📝', label: category };
};