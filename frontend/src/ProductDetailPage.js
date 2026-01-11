import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initialProducts } from './productsData';
import { translations } from './translations';
import { useCart } from './CartContext';
import Navbar from './Navbar';

const API_URL = 'http://localhost:5000/api';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();
  const [allProducts, setAllProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [wishlist, setWishlist] = useState(JSON.parse(localStorage.getItem('wishlist') || '[]'));
  const language = localStorage.getItem('language') || 'en';
  const t = translations[language];

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // First, try to find product in initialProducts and show immediately
    const initialProduct = initialProducts.find(p => p.id === parseInt(id));
    if (initialProduct) {
      setProduct(initialProduct);
      setLoading(false);
    }
    
    // Then fetch API products in background for related products
    const fetchAllProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        const combined = data && data.length > 0 ? [...initialProducts, ...data] : initialProducts;
        setAllProducts(combined);
        
        // If product wasn't found in initialProducts, find it in combined
        if (!initialProduct) {
          const foundProduct = combined.find(p => p._id === id);
          setProduct(foundProduct);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setAllProducts(initialProducts);
        if (!initialProduct) {
          setLoading(false);
        }
      }
    };
    fetchAllProducts();
  }, [id]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const mobile = e.target.mobile.value;
    const password = e.target.password.value;

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password })
      });

      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.token);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('Login successful!');
        setShowLoginModal(false);
        e.target.reset();
      } else {
        alert('Invalid credentials');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Login failed');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const name = e.target.signupName.value;
    const email = e.target.signupEmail.value;
    const password = e.target.signupPassword.value;
    const userType = e.target.userType.value;

    const signupData = { name, email, password, userType };

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });

      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.token);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert(`Account created successfully! Welcome ${name}!`);
        setShowSignupModal(false);
        e.target.reset();
      } else {
        const error = await response.json();
        alert(error.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Cannot connect to server');
    }
  };

  const handleTextOnly = (e) => {
    e.target.value = e.target.value.replace(/[0-9]/g, '');
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`${quantity} ${t.kg} ${t.productNames[product.name] || product.name} ${language === 'en' ? 'added to cart!' : language === 'hi' ? 'कार्ट में जोड़ा गया!' : 'कार्टमध्ये जोडले!'}`);
  };

  if (loading) {
    return (
      <>
        <Navbar setShowLoginModal={setShowLoginModal} setShowSignupModal={setShowSignupModal} setShowOrdersModal={setShowOrdersModal} />
        <div style={{minHeight: '100vh', background: '#f0f8f0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontSize: '1.5rem', color: '#228B22'}}>Loading...</div>
        </div>
      </>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <>
      <Navbar setShowLoginModal={setShowLoginModal} setShowSignupModal={setShowSignupModal} setShowOrdersModal={setShowOrdersModal} />
      <div style={{minHeight: '100vh', background: '#f0f8f0', padding: '2rem'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
        
        <div style={{background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem'}}>
            <div>
              <img src={product.image} alt={t.productNames[product.name] || product.name} style={{width: '100%', height: '400px', objectFit: 'cover', borderRadius: '15px', marginBottom: '1rem'}} />
              <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.5rem'}}>
                <img src={product.image} alt="thumb" style={{width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '3px solid #228B22'}} />
                <img src={product.image} alt="thumb" style={{width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', opacity: 0.7}} />
                <img src={product.image} alt="thumb" style={{width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', opacity: 0.7}} />
              </div>
              
              <div style={{marginBottom: '1.5rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>{t.quantityKg}:</label>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{padding: '0.7rem 1.2rem', background: '#228B22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.2rem'}}>-</button>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" style={{width: '80px', padding: '0.7rem', textAlign: 'center', border: '2px solid #228B22', borderRadius: '5px', fontSize: '1rem'}} />
                  <button onClick={() => setQuantity(quantity + 1)} style={{padding: '0.7rem 1.2rem', background: '#228B22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.2rem'}}>+</button>
                </div>
              </div>
              
              <div style={{display: 'flex', gap: '1rem'}}>
                <button onClick={handleAddToCart} style={{flex: 1, padding: '1.2rem', background: 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold'}}>🛒 {t.addToCart}</button>
                <button onClick={() => {
                  if (!authToken) {
                    alert(language === 'en' ? 'Please login to buy products' : language === 'hi' ? 'उत्पाद खरीदने के लिए कृपया लॉगिन करें' : 'उत्पादने खरेदी करण्यासाठी कृपया लॉगिन करा');
                    setShowLoginModal(true);
                    return;
                  }
                  setShowCheckoutModal(true);
                }} style={{flex: 1, padding: '1.2rem', background: 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold'}}>{t.buyNow}</button>
              </div>
            </div>
            
            <div>
              <h1 style={{fontSize: '2.5rem', marginBottom: '1rem', color: '#2c5530'}}>{t.productNames[product.name] || product.name}</h1>
              
              <p style={{fontSize: '3rem', color: '#228B22', fontWeight: 'bold', margin: '1.5rem 0'}}>₹{product.price}/{t.kg}</p>
              
              <div style={{background: '#f0f8f0', padding: '1.5rem', borderRadius: '15px', marginBottom: '1.5rem'}}>
                <p style={{margin: '0.7rem 0', fontSize: '1.1rem', color: product.quantity > 0 ? '#228B22' : '#dc3545', fontWeight: 'bold'}}>✓ {product.quantity > 0 ? t.inStock : t.outOfStock}</p>
                <p style={{margin: '0.7rem 0', fontSize: '1.1rem'}}><strong>{t.category}:</strong> {t[product.category] || product.category}</p>
                <p style={{margin: '0.7rem 0', fontSize: '1.1rem'}}><strong>{t.farmer}:</strong> {t.farmerNames[product.farmerName] || product.farmerName}</p>
                <p style={{margin: '0.7rem 0', fontSize: '1.1rem'}}><strong>{t.location}:</strong> 📍 {t.locations[product.location] || product.location}</p>
                <p style={{margin: '0.7rem 0', fontSize: '1.1rem'}}><strong>{t.quantity}:</strong> {product.quantity} {t.kg}</p>
              </div>
              
              <div style={{background: '#fff3cd', padding: '1.5rem', borderRadius: '15px'}}>
                <p style={{margin: '0.5rem 0', fontWeight: 'bold', fontSize: '1.1rem'}}>{t.returnPolicy}:</p>
                <p style={{margin: '0.5rem 0', fontSize: '1rem'}}>✓ {t.dayReturn}</p>
                <p style={{margin: '0.5rem 0', fontSize: '1rem'}}>✓ {t.freshGuarantee}</p>
                <p style={{margin: '0.5rem 0', fontSize: '1rem'}}>✓ {t.freeReturn}</p>
              </div>
            </div>
          </div>
          
          <div style={{borderTop: '3px solid #e0e0e0', paddingTop: '2rem'}}>
            {allProducts.filter(p => {
              if (!p._id || p.id === product.id || p._id === product._id) return false;
              const productWords = product.name.toLowerCase().split(' ');
              const newProductWords = p.name.toLowerCase().split(' ');
              return productWords.some(word => newProductWords.some(newWord => word.length >= 2 && newWord.startsWith(word.substring(0, 2))));
            }).length > 0 && (
              <div style={{marginBottom: '3rem'}}>
                <h2 style={{fontSize: '2rem', marginBottom: '1.5rem', color: '#2c5530'}}>More {t.productNames[product.name] || product.name} from Other Farmers</h2>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
                  {allProducts.filter(p => {
                    if (!p._id || p.id === product.id || p._id === product._id) return false;
                    const productWords = product.name.toLowerCase().split(' ');
                    const newProductWords = p.name.toLowerCase().split(' ');
                    return productWords.some(word => newProductWords.some(newWord => word.length >= 2 && newWord.startsWith(word.substring(0, 2))));
                  }).map(similarProduct => (
                    <div key={similarProduct.id || similarProduct._id} className="product-card" onClick={() => navigate(`/product/${similarProduct._id || similarProduct.id}`)} style={{cursor: 'pointer'}}>
                      <img src={similarProduct.image} alt={similarProduct.name} className="product-image" style={{width: '100%', height: '200px', objectFit: 'cover'}} />
                      <div className="product-info">
                        <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          {t.productNames[similarProduct.name] || similarProduct.name}
                          <span onClick={(e) => {
                            e.stopPropagation();
                            if (!authToken) {
                              alert('Please login to add items to wishlist');
                              setShowLoginModal(true);
                              return;
                            }
                            const isInWishlist = wishlist.some(item => (item.id || item._id) === (similarProduct.id || similarProduct._id));
                            const newWishlist = isInWishlist ? wishlist.filter(item => (item.id || item._id) !== (similarProduct.id || similarProduct._id)) : [...wishlist, similarProduct];
                            setWishlist(newWishlist);
                            localStorage.setItem('wishlist', JSON.stringify(newWishlist));
                          }} style={{cursor: 'pointer', fontSize: '1.2rem'}}>{wishlist.some(item => (item.id || item._id) === (similarProduct.id || similarProduct._id)) ? '❤️' : '🤍'}</span>
                        </h3>
                        <p className="product-price">₹{similarProduct.price}/{t.kg}</p>
                        <p>{t.quantity}: {similarProduct.quantity} {t.kg}</p>
                        <p className="product-location">📍 {t.locations[similarProduct.location] || similarProduct.location}</p>
                        <p>{t.farmer}: {t.farmerNames[similarProduct.farmerName] || similarProduct.farmerName}</p>
                        <button className="buy-btn" onClick={(e) => {
                          e.stopPropagation();
                          if (!authToken) {
                            alert('Please login to buy products');
                            setShowLoginModal(true);
                            return;
                          }
                        }}>{t.buyNow}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <h2 style={{fontSize: '2rem', marginBottom: '1.5rem', color: '#2c5530'}}>{t.customerReviews}</h2>
            
            <div style={{background: '#f9f9f9', padding: '2rem', borderRadius: '15px', marginBottom: '2rem'}}>
              <h3 style={{marginBottom: '1rem', fontSize: '1.5rem'}}>{t.writeReview}</h3>
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                if (!authToken) {
                  alert(language === 'en' ? 'Please login to submit a review' : language === 'hi' ? 'समीक्षा सबमिट करने के लिए कृपया लॉगिन करें' : 'पुनरावलोकन सबमिट करण्यासाठी कृपया लॉगिन करा');
                  setShowLoginModal(true);
                  return;
                }
                alert(language === 'en' ? 'Review submitted successfully!' : language === 'hi' ? 'समीक्षा सफलतापूर्वक सबमिट की गई!' : 'पुनरावलोकन यशस्वीरित्या सबमिट केले!');
                e.target.reset();
              }}>
                <div style={{marginBottom: '1rem'}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>{t.rating}:</label>
                  <select required style={{padding: '0.7rem', borderRadius: '8px', border: '2px solid #228B22', width: '100%', fontSize: '1rem'}}>
                    <option value="">{t.selectRating}</option>
                    <option value="5">{t.stars5}</option>
                    <option value="4">{t.stars4}</option>
                    <option value="3">{t.stars3}</option>
                    <option value="2">{t.stars2}</option>
                    <option value="1">{t.stars1}</option>
                  </select>
                </div>
                <div style={{marginBottom: '1rem'}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>{t.yourReview}:</label>
                  <textarea required placeholder={t.shareExperience} style={{width: '100%', padding: '0.7rem', borderRadius: '8px', border: '2px solid #228B22', minHeight: '100px', fontSize: '1rem'}}></textarea>
                </div>
                <button type="submit" style={{padding: '0.8rem 2rem', background: '#228B22', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold'}}>{t.submitReview}</button>
              </form>
            </div>
            
            <div style={{color: '#888', textAlign: 'center', padding: '3rem', fontSize: '1.2rem'}}>
              <p>{t.noReviews}</p>
            </div>
          </div>
        </div>
        </div>
      </div>

      {showLoginModal && (
        <div className="modal" onClick={(e) => e.target.className === 'modal' && setShowLoginModal(false)}>
          <div className="modal-content">
            <span className="close" onClick={() => setShowLoginModal(false)}>&times;</span>
            <h2>{t.loginToFarmTrade}</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>{t.mobileNumber}</label>
                <input type="tel" name="mobile" pattern="[0-9]{10}" placeholder={t.enterMobile} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} maxLength="10" required />
              </div>
              <div className="form-group">
                <label>{t.password}</label>
                <div style={{position: 'relative'}}>
                  <input 
                    type={showLoginPassword ? "text" : "password"}
                    name="password" 
                    placeholder={t.enterPassword} 
                    required 
                  />
                  <span 
                    onClick={() => setShowLoginPassword(!showLoginPassword)} 
                    style={{position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '1.2rem'}}
                  >
                    {showLoginPassword ? '👁️' : '👁️🗨️'}
                  </span>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{display: 'block', margin: '0 auto'}}>{t.login}</button>
            </form>
          </div>
        </div>
      )}

      {showSignupModal && (
        <div className="modal" onClick={(e) => e.target.className === 'modal' && setShowSignupModal(false)}>
          <div className="modal-content">
            <span className="close" onClick={() => setShowSignupModal(false)}>&times;</span>
            <h2>{t.joinFarmTrade}</h2>
            <form onSubmit={handleSignup}>
              <div className="form-group">
                <label>{t.fullName}</label>
                <input type="text" name="signupName" onInput={handleTextOnly} placeholder={t.enterName} required />
              </div>
              <div className="form-group">
                <label>{t.mobileNumber}</label>
                <input type="tel" name="signupMobile" pattern="[0-9]{10}" placeholder={t.enterMobile} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} maxLength="10" required />
              </div>
              <div className="form-group">
                <label>{t.password}</label>
                <div style={{position: 'relative'}}>
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="signupPassword" 
                    pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%&*!])[A-Za-z\\d@#$%&*!]{8,}" 
                    title={t.passwordRequirement} 
                    placeholder={t.enterPassword}
                    required 
                  />
                  <span 
                    onClick={() => setShowPassword(!showPassword)} 
                    style={{position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '1.2rem'}}
                  >
                    {showPassword ? '👁️' : '👁️🗨️'}
                  </span>
                </div>
              </div>
              <div className="form-group">
                <label>{t.iAmA}</label>
                <select name="userType" required>
                  <option value="">{t.selectType}</option>
                  <option value="farmer">{t.farmerType}</option>
                  <option value="buyer">{t.buyerType}</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{display: 'block', margin: '0 auto'}}>{t.signup}</button>
            </form>
          </div>
        </div>
      )}

      {showCartModal && (
        <div className="modal" onClick={(e) => e.target.className === 'modal' && setShowCartModal(false)}>
          <div className="modal-content" style={{maxWidth: '600px'}}>
            <span className="close" onClick={() => setShowCartModal(false)}>&times;</span>
            <h2>🛍️ {language === 'en' ? 'Your Cart' : language === 'hi' ? 'आपकी कार्ट' : 'तुमची कार्ट'}</h2>
            {cart.length === 0 ? (
              <p style={{textAlign: 'center', padding: '2rem', color: '#666'}}>{language === 'en' ? 'Your cart is empty' : language === 'hi' ? 'आपकी कार्ट खाली है' : 'तुमची कार्ट रिकामी आहे'}</p>
            ) : (
              <>
                {cart.map(item => (
                  <div key={`${item.id}-${language}`} style={{display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #eee', alignItems: 'center'}}>
                    <img src={item.image} alt={t.productNames[item.name] || item.name} style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px'}} />
                    <div style={{flex: 1}}>
                      <h4 style={{margin: '0 0 0.5rem 0'}}>{t.productNames[item.name] || item.name}</h4>
                      <p style={{margin: '0.2rem 0', fontSize: '0.85rem', color: '#666'}}>📍 {t.locations[item.location] || item.location}</p>
                      <p style={{margin: '0.2rem 0', fontSize: '0.85rem', color: '#666'}}>{t.farmer}: {t.farmerNames[item.farmerName] || item.farmerName}</p>
                      <p style={{margin: '0.2rem 0', color: '#228B22', fontWeight: 'bold'}}>₹{item.price}/{t.kg}</p>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <button onClick={() => updateQuantity(item.id, item.cartQuantity - 1)} style={{padding: '0.3rem 0.7rem', background: '#228B22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>-</button>
                      <span style={{minWidth: '30px', textAlign: 'center'}}>{item.cartQuantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.cartQuantity + 1)} style={{padding: '0.3rem 0.7rem', background: '#228B22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{padding: '0.5rem 1rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>×</button>
                  </div>
                ))}
                <div style={{padding: '1.5rem', background: '#f0f8f0', marginTop: '1rem', borderRadius: '10px'}}>
                  <p style={{fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'right', margin: 0}}>{language === 'en' ? 'Total' : language === 'hi' ? 'कुल' : 'एकूण'}: ₹{getCartTotal()}</p>
                </div>
                <button className="btn-primary" style={{width: '100%', marginTop: '1rem'}} onClick={() => { setShowCartModal(false); navigate('/'); }}>{language === 'en' ? 'Go to Checkout' : language === 'hi' ? 'चेकआउट पर जाएं' : 'चेकआउटवर जा'}</button>
              </>
            )}
          </div>
        </div>
      )}

      {showOrdersModal && (
        <div className="modal" onClick={(e) => e.target.className === 'modal' && setShowOrdersModal(false)}>
          <div className="modal-content" style={{maxWidth: '800px'}}>
            <span className="close" onClick={() => setShowOrdersModal(false)}>&times;</span>
            <h2>📦 {language === 'en' ? 'My Orders' : language === 'hi' ? 'मेरे ऑर्डर' : 'माझे ऑर्डर'}</h2>
            <div style={{color: '#888', textAlign: 'center', padding: '3rem', fontSize: '1.2rem'}}>
              <p>{language === 'en' ? 'No orders yet' : language === 'hi' ? 'अभी तक कोई ऑर्डर नहीं' : 'अद्याप कोणतेही ऑर्डर नाही'}</p>
            </div>
          </div>
        </div>
      )}

      {showCheckoutModal && (
        <div className="modal" onClick={(e) => e.target.className === 'modal' && setShowCheckoutModal(false)}>
          <div className="modal-content" style={{maxWidth: '600px'}}>
            <span className="close" onClick={() => setShowCheckoutModal(false)}>&times;</span>
            <h2>{language === 'en' ? 'Checkout' : language === 'hi' ? 'चेकआउट' : 'चेकआउट'}</h2>
            <div style={{marginBottom: '1.5rem', padding: '1rem', background: '#f0f8f0', borderRadius: '10px'}}>
              <h3 style={{margin: '0 0 1rem 0'}}>{language === 'en' ? 'Order Summary' : language === 'hi' ? 'ऑर्डर सारांश' : 'ऑर्डर सारांश'}</h3>
              <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                <img src={product.image} alt={t.productNames[product.name] || product.name} style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px'}} />
                <div style={{flex: 1}}>
                  <h4 style={{margin: '0 0 0.5rem 0'}}>{t.productNames[product.name] || product.name}</h4>
                  <p style={{margin: '0.2rem 0', color: '#666'}}>{language === 'en' ? 'Quantity' : language === 'hi' ? 'मात्रा' : 'प्रमाण'}: {quantity} {t.kg}</p>
                  <p style={{margin: '0.2rem 0', color: '#228B22', fontWeight: 'bold'}}>₹{product.price} x {quantity} = ₹{product.price * quantity}</p>
                </div>
              </div>
              <div style={{borderTop: '2px solid #228B22', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem'}}>
                <span>{language === 'en' ? 'Total' : language === 'hi' ? 'कुल' : 'एकूण'}:</span>
                <span>₹{product.price * quantity}</span>
              </div>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const paymentMethod = e.target.payment.value;
              const total = product.price * quantity;
              const address = e.target.address.value;
              
              if (paymentMethod === 'upi') {
                const newOrder = {
                  id: Date.now(),
                  items: [{ ...product, quantity: quantity }],
                  total: total,
                  address: address,
                  payment: 'UPI',
                  date: new Date().toLocaleDateString(),
                  status: 'Payment Pending'
                };
                const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
                const updatedOrders = [newOrder, ...existingOrders];
                localStorage.setItem('orders', JSON.stringify(updatedOrders));
                
                const upiUrl = `upi://pay?pa=9067579706@ptyes&pn=Vaibhav Alat&am=${total}&cu=INR&tn=FarmTrade Order Payment`;
                window.location.href = upiUrl;
                
                setShowCheckoutModal(false);
                alert(`${language === 'en' ? 'Order placed! Please complete the payment of' : language === 'hi' ? 'ऑर्डर दिया गया! कृपया भुगतान पूरा करें' : 'ऑर्डर दिली! कृपया पेमेंट पूर्ण करा'} ₹${total} ${language === 'en' ? 'in your UPI app.' : language === 'hi' ? 'अपने UPI ऐप में।' : 'तुमच्या UPI अॅपमध्ये।'}`);
                navigate('/');
              } else {
                const newOrder = {
                  id: Date.now(),
                  items: [{ ...product, quantity: quantity }],
                  total: total,
                  address: address,
                  payment: paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod,
                  date: new Date().toLocaleDateString(),
                  status: 'Pending'
                };
                const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
                const updatedOrders = [newOrder, ...existingOrders];
                localStorage.setItem('orders', JSON.stringify(updatedOrders));
                alert(`${language === 'en' ? 'Order placed successfully!' : language === 'hi' ? 'ऑर्डर सफलतापूर्वक दिया गया!' : 'ऑर्डर यशस्वीरित्या दिली!'}\n${language === 'en' ? 'Total' : language === 'hi' ? 'कुल' : 'एकूण'}: ₹${total}`);
                setShowCheckoutModal(false);
                navigate('/');
              }
            }}>
              <div className="form-group">
                <label>{language === 'en' ? 'Delivery Address' : language === 'hi' ? 'डिलीवरी पता' : 'डिलिव्हरी पत्ता'}</label>
                <textarea name="address" defaultValue={JSON.parse(localStorage.getItem('user') || '{}').address || ''} placeholder={language === 'en' ? 'Enter your complete delivery address' : language === 'hi' ? 'अपना पूरा डिलीवरी पता दर्ज करें' : 'तुमचा संपूर्ण डिलिव्हरी पत्ता प्रविष्ट करा'} required style={{width: '100%', padding: '0.7rem', borderRadius: '8px', border: '2px solid #228B22', minHeight: '80px'}}></textarea>
              </div>
              <div className="form-group">
                <label>{language === 'en' ? 'Payment Method' : language === 'hi' ? 'भुगतान विधि' : 'पेमेंट पद्धत'}</label>
                <select name="payment" required style={{width: '100%', padding: '0.7rem', borderRadius: '8px', border: '2px solid #228B22'}}>
                  <option value="">{language === 'en' ? 'Select Payment Method' : language === 'hi' ? 'भुगतान विधि चुनें' : 'पेमेंट पद्धत निवडा'}</option>
                  <option value="cod">{language === 'en' ? 'Cash on Delivery' : language === 'hi' ? 'कैश ऑन डिलीवरी' : 'कॅश ऑन डिलिव्हरी'}</option>
                  <option value="upi">UPI</option>
                  <option value="card">{language === 'en' ? 'Credit/Debit Card' : language === 'hi' ? 'क्रेडिट/डेबिट कार्ड' : 'क्रेडिट/डेबिट कार्ड'}</option>
                  <option value="netbanking">{language === 'en' ? 'Net Banking' : language === 'hi' ? 'नेट बैंकिंग' : 'नेट बॅंकिंग'}</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{width: '100%'}}>{language === 'en' ? 'Place Order' : language === 'hi' ? 'ऑर्डर दें' : 'ऑर्डर द्या'}</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductDetailPage;
