export interface Designer {
  id: string
  name: string
  role: string
  bio: string
  avatar: string
  accentColor: string
  featuredProductSlugs: string[]
}

export const designers: Designer[] = [
  {
    id: 'maya-chen',
    name: 'Maya Chen',
    role: 'Lead Product Designer',
    bio: 'With a background in industrial design and a passion for tactile experiences, Maya leads the creation of our magnetic product line. Her designs focus on the perfect balance between visual beauty and satisfying fidget mechanics.',
    avatar: '/images/designers/maya-chen.jpg',
    accentColor: 'var(--color-dot-violet)',
    featuredProductSlugs: ['n52-magnetic-balls', 'magnetic-putty'],
  },
  {
    id: 'alex-rivera',
    name: 'Alex Rivera',
    role: 'Sensory Experience Engineer',
    bio: 'Alex brings expertise in material science to every squishy and stretchy toy in our catalog. Obsessed with texture and compression, Alex ensures each product delivers a deeply satisfying sensory response.',
    avatar: '/images/designers/alex-rivera.jpg',
    accentColor: 'var(--color-dot-coral)',
    featuredProductSlugs: ['stress-ball-set', 'squishy-animals'],
  },
  {
    id: 'jordan-kim',
    name: 'Jordan Kim',
    role: 'Mechanical Design Lead',
    bio: 'A former watchmaker turned fidget architect, Jordan designs our clicky and mechanical toys. Every switch, button, and gear is tuned for the most addictive click-feel feedback loop possible.',
    avatar: '/images/designers/jordan-kim.jpg',
    accentColor: 'var(--color-dot-cyan)',
    featuredProductSlugs: ['fidget-cube', 'infinity-cube'],
  },
]
