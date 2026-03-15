export type Category = 'adventure' | 'relax' | 'cultural';

export type ExperienceData = {
  id: string;
  price: number;
  durationHours: string;
  category: Category[];
  tagType: 'bestSeller' | 'adventure' | 'extreme' | 'cultural' | 'comfort' | 'planB';
  imageUrl: string;
  fallbackEmoji: string;
};

export const experiencesData: ExperienceData[] = [
  {
    id: 'id1',
    price: 1200,
    durationHours: "6-8",
    category: ['adventure', 'relax'],
    tagType: 'bestSeller',
    imageUrl: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80",
    fallbackEmoji: "⛵"
  },
  {
    id: 'id2',
    price: 180,
    durationHours: "3-4",
    category: ['adventure'],
    tagType: 'adventure',
    imageUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80",
    fallbackEmoji: "🏍️"
  },
  {
    id: 'id3',
    price: 150,
    durationHours: "1-2",
    category: ['adventure'],
    tagType: 'extreme',
    imageUrl: "https://images.unsplash.com/photo-1521150932951-303a95503ed3?w=800&q=80",
    fallbackEmoji: "🪂"
  },
  {
    id: 'id4',
    price: 350,
    durationHours: "8-10",
    category: ['cultural'],
    tagType: 'cultural',
    imageUrl: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80",
    fallbackEmoji: "🏛️"
  },
  {
    id: 'id5',
    price: 80,
    durationHours: "1-2",
    category: ['relax'],
    tagType: 'comfort',
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    fallbackEmoji: "🚙"
  },
  {
    id: 'id6',
    price: 220,
    durationHours: "4-6",
    category: ['relax'],
    tagType: 'planB',
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
    fallbackEmoji: "🧖"
  }
];
