export interface Animal {
  id: number;
  name: string;
  type: 'vaca' | 'capra' | 'gaina' | 'oaie' | 'porc' | 'cal';
  sex: 'mascul' | 'femela';
  age: number;
  status: string;
  location: string;
}

export interface Cow extends Animal {
  milkPerDay: number;
}

export interface Pig extends Animal {
  meatPerDay: number;
}

export interface Chicken extends Animal {
  eggsPerDay: number;
}

export interface Horse extends Animal {
  workPerDay: number;
}

export interface Sheep extends Animal {
  yarnPerDay: number;
  milkPerDay: number;
}

export interface Goat extends Animal {
  milkPerDay: number;
}

