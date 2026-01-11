import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { translations } from './translations';
import { useCart } from './CartContext';

function Navbar({ setShowLoginModal, setShowSignupModal, setShowCartModal, setShowOrdersModal, setShowProfileModal, setShowWishlistModal, setShowSettingsModal, setShowCartPage }) {
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const authToken = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    window.location.reload();
  };

  const t = translations[language];

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery) {
      localStorage.setItem('searchQuery', searchQuery);
      navigate('/');
      setTimeout(() => {
        const productsSection = document.getElementById('products');
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  };

  return (
    <header>
      <nav className="navbar">
        <div className="nav-brand">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>🌾FarmTrade</a>
        </div>
        <ul className="nav-menu">
          <li><a href="/#home" onClick={(e) => { e.preventDefault(); navigate('/'); }}>{ t.home}</a></li>
          <li><a href="/#products" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => document.getElementById('products')?.scrollIntoView({behavior: 'smooth'}), 100); }}>{t.products}</a></li>
          <li><a href="/#sell" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => document.getElementById('sell')?.scrollIntoView({behavior: 'smooth'}), 100); }}>{t.sell}</a></li>
          <li><a href="/#about" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => document.getElementById('about')?.scrollIntoView({behavior: 'smooth'}), 100); }}>{t.about}</a></li>
          <li><a href="/#contact" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'}), 100); }}>{t.contact}</a></li>
        </ul>
        <div className="navbar-right">
          <div className="search-bar">
            <div className="search-container">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input type="text" placeholder={t.searchProducts} value={searchQuery} onChange={handleSearch} onKeyDown={handleSearchSubmit} />
            </div>
          </div>
          <button className="cart-icon" title="Cart" onClick={() => {
            if (setShowCartPage) {
              setShowCartPage(true);
            } else {
              localStorage.setItem('openCartPage', 'true');
              navigate('/');
            }
          }}>
            🛒
            <span className="cart-badge" style={{display: getCartCount() > 0 ? 'flex' : 'none'}}>{getCartCount()}</span>
          </button>
          {authToken && (
            <button className="cart-icon" title="Orders" onClick={() => setShowOrdersModal(true)}>
              📦
            </button>
          )}
          <div className="language-selector" onMouseEnter={() => setShowLangDropdown(true)} onMouseLeave={() => setShowLangDropdown(false)}>
            <span className="current-lang">
              <img src={language === 'en' ? 'https://flagcdn.com/80x60/us.png' : 'https://flagcdn.com/80x60/in.png'} alt="flag" className="flag-img" style={{imageRendering: 'crisp-edges'}} />
              {language === 'en' ? 'EN' : language === 'hi' ? 'हिंदी' : 'मराठी'}
            </span>
            <div className={`lang-dropdown ${showLangDropdown ? 'active' : ''}`}>
              <label onClick={() => changeLanguage('en')}><img src="https://flagcdn.com/80x60/us.png" alt="US" className="flag-img" style={{imageRendering: 'crisp-edges'}} /> English</label>
              <label onClick={() => changeLanguage('hi')}><img src="https://flagcdn.com/80x60/in.png" alt="India" className="flag-img" style={{imageRendering: 'crisp-edges'}} /> हिंदी</label>
              <label onClick={() => changeLanguage('mr')}><img src="https://flagcdn.com/80x60/in.png" alt="India" className="flag-img" style={{imageRendering: 'crisp-edges'}} /> मराठी</label>
            </div>
          </div>
          <div className="auth-buttons">
            {authToken && user ? (
              <div 
                style={{position: 'relative'}} 
                onMouseEnter={() => setShowUserMenu(true)} 
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <button className="btn-login">{user.name.split(' ')[0]}</button>
                {showUserMenu && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      background: 'white',
                      border: '2px solid #228B22',
                      borderRadius: '8px',
                      marginTop: '0',
                      paddingTop: '5px',
                      minWidth: '180px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      zIndex: 1000
                    }}
                    onMouseEnter={() => setShowUserMenu(true)}
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <button 
                      onClick={() => { 
                        setShowUserMenu(false); 
                        if (setShowProfileModal) {
                          setShowProfileModal(true);
                        } else {
                          localStorage.setItem('openModal', 'profile');
                          navigate('/');
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 15px',
                        background: 'none',
                        border: 'none',
                        borderBottom: '1px solid #eee',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: '#333'
                      }}
                    >
                      👤 User Profile
                    </button>
                    <button 
                      onClick={() => { setShowOrdersModal(true); setShowUserMenu(false); }}
                      style={{
                        width: '100%',
                        padding: '10px 15px',
                        background: 'none',
                        border: 'none',
                        borderBottom: '1px solid #eee',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: '#333'
                      }}
                    >
                      📦 Your Orders
                    </button>
                    <button 
                      onClick={() => { 
                        setShowUserMenu(false); 
                        if (setShowWishlistModal) {
                          setShowWishlistModal(true);
                        } else {
                          localStorage.setItem('openModal', 'wishlist');
                          navigate('/');
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 15px',
                        background: 'none',
                        border: 'none',
                        borderBottom: '1px solid #eee',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: '#333'
                      }}
                    >
                      ❤️ Wish List
                    </button>
                    <button 
                      onClick={() => { 
                        setShowUserMenu(false); 
                        if (setShowSettingsModal) {
                          setShowSettingsModal(true);
                        } else {
                          localStorage.setItem('openModal', 'settings');
                          navigate('/');
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 15px',
                        background: 'none',
                        border: 'none',
                        borderBottom: '1px solid #eee',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: '#333'
                      }}
                    >
                      ⚙️ Settings
                    </button>
                    <button 
                      onClick={() => { 
                        setShowUserMenu(false);
                        if (setShowLoginModal) {
                          setShowLoginModal(true);
                        } else {
                          localStorage.setItem('openLoginModal', 'true');
                          navigate('/');
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 15px',
                        background: 'none',
                        border: 'none',
                        borderBottom: '1px solid #eee',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: '#333'
                      }}
                    >
                      🔄 Switch Account
                    </button>
                    <button 
                      onClick={() => { 
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('user');
                        localStorage.removeItem('wishlist');
                        setShowUserMenu(false);
                        window.location.reload();
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 15px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: '#228B22',
                        fontWeight: 'bold'
                      }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="btn-login" onClick={() => setShowLoginModal(true)}>{t.login}</button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
