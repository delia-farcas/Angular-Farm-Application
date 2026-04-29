export interface Animal {
  id: number;
  name: string;
  type: 'vaca' | 'capra' | 'gaina' | 'oaie' | 'porc' | 'cal';
  sex: 'mascul' | 'femela';
  age: number;
  status: string;
  location: string;
  observations: string;
  ownerId: number; 
}

