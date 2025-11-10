import { saveMenuItem, getMenu } from './api';

export const PLACEHOLDER_MENU_ITEMS = [
  {
    name: 'Carne Asada Burrito',
    description: 'Grilled steak with rice, beans, cheese, lettuce, and salsa wrapped in a flour tortilla',
    price: 12.99,
    category: 'Burritos',
    image: 'https://images.unsplash.com/photo-1622620283268-5cf46da1df39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwYnVycml0b3xlbnwxfHx8fDE3NjI3MjU3NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    isSpecial: false,
    specialDays: [],
    available: true,
  },
  {
    name: 'Chicken Enchiladas',
    description: 'Three corn tortillas filled with seasoned chicken, topped with red sauce and melted cheese',
    price: 11.99,
    category: 'Enchiladas',
    image: 'https://images.unsplash.com/photo-1673925885673-15f8e48d4e7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwZW5jaGlsYWRhc3xlbnwxfHx8fDE3NjI3MjU3NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    isSpecial: false,
    specialDays: [],
    available: true,
  },
  {
    name: 'Quesadilla Supreme',
    description: 'Large flour tortilla filled with cheese, grilled vegetables, and your choice of meat',
    price: 10.99,
    category: 'Quesadillas',
    image: 'https://images.unsplash.com/photo-1711488735436-cccd5917b26c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwcXVlc2FkaWxsYXxlbnwxfHx8fDE3NjI3MjU3NTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    isSpecial: false,
    specialDays: [],
    available: true,
  },
];

export async function initializePlaceholders(accessToken: string) {
  try {
    // Check if menu already has items
    const menu = await getMenu();
    if (menu.items && menu.items.length > 0) {
      return false; // Already initialized
    }

    // Add placeholder items
    for (const item of PLACEHOLDER_MENU_ITEMS) {
      await saveMenuItem(item, accessToken);
    }

    return true; // Successfully initialized
  } catch (error) {
    console.log('Error initializing placeholders:', error);
    return false;
  }
}
