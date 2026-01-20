import { ChatMessage as ChatMessageType } from "@/types/chat";
import ProductRecommendationCard from "./ProductRecommendationCard";
import { cn } from "@/lib/utils";
import { Bot, User, Loader2 } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const isLoading = message.isLoading;

  return (
    <div className={cn(
      "flex gap-3 p-3",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      
      {/* Message Content */}
      <div className={cn(
        "flex flex-col gap-2 max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Text Bubble */}
        <div className={cn(
          "px-4 py-2 rounded-2xl text-sm",
          isUser 
            ? "bg-primary text-primary-foreground rounded-br-md" 
            : "bg-muted rounded-bl-md"
        )}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Finding products for you...</span>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        
        {/* Product Recommendations */}
        {!isLoading && message.productRecommendations && message.productRecommendations.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {message.productRecommendations.map((rec, index) => (
              <ProductRecommendationCard 
                key={`${rec.product.id}-${index}`} 
                recommendation={rec} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
