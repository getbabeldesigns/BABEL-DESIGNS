'use client'

interface UserSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserSidebar({ isOpen, onClose }: UserSidebarProps) {
  const isLoggedIn = false // Will be dynamic later with auth

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
        className={`fixed top-0 right-0 h-screen w-full md:w-[400px] bg-branco shadow-2xl z-50 transition-transform duration-400 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-preto/10">
          <h2 className="font-display text-preto text-3xl">Account</h2>
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
        <div className="p-8">
          {!isLoggedIn ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-inox rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-branco" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-display text-preto text-2xl mb-3">Guest User</h3>
              <p className="text-cinza mb-8">Sign in to access your account</p>
              <button className="w-full py-4 bg-cinza text-branco text-sm tracking-[0.15em] uppercase font-medium hover:bg-preto transition-colors mb-4">
                Sign In
              </button>
              <button className="w-full py-4 bg-transparent text-cinza border-2 border-cinza text-sm tracking-[0.15em] uppercase font-medium hover:bg-cinza hover:text-branco transition-colors">
                Create Account
              </button>
            </div>
          ) : (
            <div>
              {/* Logged in user menu will go here */}
              <ul className="space-y-4">
                <li>
                  <a href="#" className="block py-3 text-preto hover:text-cinza transition-colors border-b border-preto/10">
                    Profile Settings
                  </a>
                </li>
                <li>
                  <a href="#" className="block py-3 text-preto hover:text-cinza transition-colors border-b border-preto/10">
                    Order History
                  </a>
                </li>
                <li>
                  <a href="#" className="block py-3 text-preto hover:text-cinza transition-colors border-b border-preto/10">
                    Saved Projects
                  </a>
                </li>
                <li>
                  <a href="#" className="block py-3 text-preto hover:text-cinza transition-colors border-b border-preto/10">
                    Preferences
                  </a>
                </li>
              </ul>
              <button className="w-full mt-8 py-4 bg-transparent text-cinza border-2 border-cinza text-sm tracking-[0.15em] uppercase font-medium hover:bg-cinza hover:text-branco transition-colors">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}