export interface Product {
  id: string;
  name: string;
  price: number;
  retailer: string;
  imageUrl: string;
  link: string;
  specs: Record<string, string | number>;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}
