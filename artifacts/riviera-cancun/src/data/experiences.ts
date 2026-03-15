export type Category = 'adventure' | 'relax' | 'cultural';

export type ExperienceData = {
  id: string;
  price: number;
  durationHours: string;
  category: Category[];
  tagType: 'bestSeller' | 'adventure' | 'extreme' | 'cultural' | 'comfort' | 'planB';
  imageUrl: string;
};

export const experiencesData: ExperienceData[] = [
  {
    id: 'id1',
    price: 1200,
    durationHours: "6-8",
    category: ['adventure', 'relax'],
    tagType: 'bestSeller',
    // Unsplash: Luxury Yacht
    imageUrl: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80"
  },
  {
    id: 'id2',
    price: 180,
    durationHours: "3-4",
    category: ['adventure'],
    tagType: 'adventure',
    // Unsplash: ATV Jungle
    imageUrl: "https://images.unsplash.com/photo-1596404987829-450f38b29c54?w=800&q=80"
  },
  {
    id: 'id3',
    price: 150,
    durationHours: "1-2",
    category: ['adventure'],
    tagType: 'extreme',
    // Unsplash: Bungee/Extreme sports
    imageUrl: "https://images.unsplash.com/photo-1526463959828-56eb0f00fbd4?w=800&q=80"
  },
  {
    id: 'id4',
    price: 350,
    durationHours: "8-10",
    category: ['cultural'],
    tagType: 'cultural',
    // Unsplash: Chichen Itza / Ruins
    imageUrl: "https://images.unsplash.com/photo-1518182170546-076616fdfaaf?w=800&q=80"
  },
  {
    id: 'id5',
    price: 80,
    durationHours: "1-2",
    category: ['relax'],
    tagType: 'comfort',
    // Unsplash: Luxury SUV / Transport
    imageUrl: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80"
  },
  {
    id: 'id6',
    price: 220,
    durationHours: "4-6",
    category: ['relax'],
    tagType: 'planB',
    // Unsplash: Indoor Luxury Spa / Museum
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80"
  }
];
