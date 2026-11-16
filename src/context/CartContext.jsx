import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext();

const initialState = {
  items: JSON.parse(localStorage.getItem("gt_public_cart") || "[]"),
};

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((i) => i.id === action.payload.id);
      let newItems;
      if (existingItem) {
        newItems = state.items.map((i) =>
          i.id === action.payload.id ? { ...i, qty: i.qty + 1 } : i
        );
      } else {
        newItems = [...state.items, { ...action.payload, qty: 1 }];
      }
      return { ...state, items: newItems };
    }
    case "REMOVE_ITEM": {
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload),
      };
    }
    case "UPDATE_QTY": {
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.id === action.payload.id
              ? { ...i, qty: Math.max(0, i.qty + action.payload.delta) }
              : i
          )
          .filter((i) => i.qty > 0),
      };
    }
    case "CLEAR_CART": {
      return { ...state, items: [] };
    }
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    localStorage.setItem("gt_public_cart", JSON.stringify(state.items));
  }, [state.items]);

  const cartTotal = state.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const cartCount = state.items.reduce((sum, item) => sum + item.qty, 0);

  const addToCart = (item) => dispatch({ type: "ADD_ITEM", payload: item });
  const removeFromCart = (id) => dispatch({ type: "REMOVE_ITEM", payload: id });
  const updateQty = (id, delta) =>
    dispatch({ type: "UPDATE_QTY", payload: { id, delta } });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  return (
    <CartContext.Provider
      value={{
        cart: state.items,
        cartTotal,
        cartCount,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
