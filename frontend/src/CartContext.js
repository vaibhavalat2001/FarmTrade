import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();
const API_URL = 'http://localhost:5000/api';

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setCart([]);
    }
  }, []);

  const syncCartToBackend = async (cartData) => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      try {
        await fetch(`${API_URL}/auth/cart`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': authToken
          },
          body: JSON.stringify({ cart: cartData })
        });
      } catch (err) {
        console.error('Failed to sync cart:', err);
      }
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      localStorage.setItem('cart', JSON.stringify(cart));
      syncCartToBackend(cart);
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      alert('Please login to add items to cart');
      return;
    }
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, cartQuantity: quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, cartQuantity: quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.cartQuantity, 0);
  };

  const getCartCount = () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      return 0;
    }
    return cart.length;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
