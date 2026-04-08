'use client'

import { useState } from 'react'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const [cartItems] = useState([]) // Empty for now, will be populated later

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-preto/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-screen w-full md:w-[500px] bg-branco shadow-2xl z-50 transition-transform duration-400 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-preto/10">
          <h2 className="font-display text-preto text-3xl">Your Cart</h2>
          <button 
            onClick={onClose}
            className="text-preto hover:text-cinza transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 h-[calc(100vh-200px)] overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-20 h-20 text-inox mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-cinza text-lg mb-4">Your cart is empty</p>
              <button 
                onClick={onClose}
                className="text-preto underline hover:text-cinza transition-colors"
              >
                Continue browsing
              </button>
            </div>
          ) : (
            <div>
              {/* Cart items will be mapped here later */}
            </div>
          )}
        </div>

        {/* Footer - only show if cart has items */}
        {cartItems.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-8 border-t border-preto/10 bg-branco">
            <div className="flex justify-between items-center mb-6">
              <span className="text-preto text-lg font-medium">Total:</span>
              <span className="font-display text-preto text-2xl">$0</span>
            </div>
            <button className="w-full py-4 bg-cinza text-branco text-sm tracking-[0.2em] uppercase font-medium hover:bg-preto transition-colors">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}