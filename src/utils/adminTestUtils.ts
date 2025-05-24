
import { createTestProduct } from "@/utils/createTestProduct";
import { toast } from "@/hooks/use-toast";

export const initializeTestDataForAdmin = async () => {
  try {
    console.log("Admin: Initializing test data...");
    await createTestProduct();
    console.log("Admin: Test product initialization completed");
    toast({
      title: "Success",
      description: "Test product created successfully.",
    });
  } catch (error) {
    console.error("Admin: Error initializing test product:", error);
    toast({
      title: "Error",
      description: "Failed to create test product. Check console for details.",
      variant: "destructive",
    });
  }
};
