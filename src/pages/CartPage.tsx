
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Trash2, X } from "lucide-react";
import { Cart as CartType, CartItem, Product } from "@/types/product";
import { products } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CartPage = () => {
  const [cart, setCart] = useState<CartType>({
    items: [],
    totalItems: 0,
    subtotal: 0
  });

  // For demo purposes, we'll add some items to the cart on component mount
  useEffect(() => {
    const mockCart: CartType = {
      items: [
        {
          productId: "1001",
          title: "Premium Cotton T-Shirt",
          price: {
            original: 29.99,
            discounted: 24.99
          },
          colorVariant: {
            id: "c1",
            name: "Black",
            colorCode: "#000000",
            images: [
              "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600"
            ]
          },
          sizeVariant: {
            id: "s2",
            name: "M",
            inStock: true
          },
          quantity: 1
        },
        {
          productId: "1002",
          title: "Slim Fit Jeans",
          price: {
            original: 79.99,
            discounted: 59.99
          },
          colorVariant: {
            id: "c1",
            name: "Dark Blue",
            colorCode: "#00008B",
            images: [
              "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600"
            ]
          },
          sizeVariant: {
            id: "s2",
            name: "32x30",
            inStock: true
          },
          quantity: 1
        }
      ],
      totalItems: 2,
      subtotal: 84.98 // 24.99 + 59.99
    };

    setCart(mockCart);
  }, []);

  const updateQuantity = (itemIndex: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedItems = [...cart.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      quantity: newQuantity
    };

    // Recalculate cart totals
    const totalItems = updatedItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + ((item.price.discounted || item.price.original) * item.quantity),
      0
    );

    setCart({
      items: updatedItems,
      totalItems,
      subtotal
    });
  };

  const removeItem = (itemIndex: number) => {
    const updatedItems = cart.items.filter((_, index) => index !== itemIndex);
    
    // Recalculate cart totals
    const totalItems = updatedItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + ((item.price.discounted || item.price.original) * item.quantity),
      0
    );

    setCart({
      items: updatedItems,
      totalItems,
      subtotal
    });

    toast.success("Item removed from cart");
  };

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    toast.error("Invalid coupon code");
  };

  // If cart is empty
  if (cart.items.length === 0) {
    return (
      <MainLayout>
        <div className="container-custom py-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <ShoppingCart size={32} className="text-gray-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-500 mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Button asChild className="bg-brand hover:bg-brand-dark">
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 py-6">
        <div className="container-custom">
          <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-grow">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-200 text-sm font-medium text-gray-500">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Total</div>
              </div>

              {/* Cart Item Rows */}
              {cart.items.map((item, index) => (
                <div
                  key={`${item.productId}-${item.colorVariant.id}-${item.sizeVariant.id}`}
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-12 gap-4 p-4",
                    index < cart.items.length - 1 && "border-b border-gray-200"
                  )}
                >
                  {/* Product Info (Mobile & Desktop) */}
                  <div className="col-span-1 md:col-span-6">
                    <div className="flex gap-4">
                      <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-md">
                        <img
                          src={item.colorVariant.images[0]}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-between flex-grow">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            <Link to={`/product/${item.productId}`}>
                              {item.title}
                            </Link>
                          </h3>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <span
                              className="inline-block w-4 h-4 rounded-full mr-2"
                              style={{
                                backgroundColor: item.colorVariant.colorCode,
                              }}
                            />
                            <span>{item.colorVariant.name}</span>
                            <span className="mx-2">•</span>
                            <span>Size: {item.sizeVariant.name}</span>
                          </div>
                        </div>
                        
                        {/* Mobile Price */}
                        <div className="md:hidden mt-2 flex items-center justify-between">
                          <div>
                            {item.price.discounted ? (
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-900">
                                  ${item.price.discounted.toFixed(2)}
                                </span>
                                <span className="ml-1 text-xs text-gray-500 line-through">
                                  ${item.price.original.toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm font-medium text-gray-900">
                                ${item.price.original.toFixed(2)}
                              </span>
                            )}
                          </div>
                          
                          <button
                            onClick={() => removeItem(index)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Price */}
                  <div className="hidden md:flex col-span-2 items-center justify-center">
                    {item.price.discounted ? (
                      <div className="text-center">
                        <div className="font-medium">
                          ${item.price.discounted.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 line-through">
                          ${item.price.original.toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <span className="font-medium">
                        ${item.price.original.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="col-span-1 md:col-span-2 flex items-center md:justify-center">
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="px-2 py-1 border-r"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-4 py-1">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="px-2 py-1 border-l"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total & Remove (Desktop) */}
                  <div className="hidden md:flex col-span-2 items-center justify-between">
                    <span className="font-medium">
                      $
                      {(
                        (item.price.discounted || item.price.original) *
                        item.quantity
                      ).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(index)}
                      className="text-gray-400 hover:text-red-500"
                      aria-label="Remove item"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <Button asChild variant="outline" className="mb-8">
              <Link to="/">
                Continue Shopping
              </Link>
            </Button>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              
              {/* Coupon Code */}
              <form onSubmit={applyCoupon} className="mb-6">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Coupon code"
                    className="flex-grow"
                  />
                  <Button type="submit" variant="secondary">
                    Apply
                  </Button>
                </div>
              </form>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
              </div>
              
              <Button className="w-full bg-brand hover:bg-brand-dark">
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CartPage;
