import { Product } from "./product";

export type ChatRole = "user" | "assistant";

export interface ProductRecommendation {
  product: Product;
  relevanceReason: string;
  score?: number;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  productRecommendations?: ProductRecommendation[];
  isLoading?: boolean;
  timestamp: Date;
}

export interface ProductAssistantResponse {
  message: string;
  recommendations: {
    productId: string;
    relevanceReason: string;
    score: number;
  }[];
  followUpQuestion?: string;
}
