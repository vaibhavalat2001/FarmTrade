import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { initialProducts } from './productsData';
import ProductDetailPage from './ProductDetailPage';
import { translations } from './translations';
import { CartProvider, useCart } from './CartContext';

const API_URL = 'https://farm-trade-backend.vercel.app/api';

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, getCartCount, removeFromCart, updateQuantity, getCartTotal, setCart } = useCart();
  const [products, setProducts] = useState(initialProducts);
  const [displayedProducts, setDisplayedProducts] = useState(initialProducts);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCartPage, setShowCartPage] = useState(false);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [showFarmerIdField, setShowFarmerIdField] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState('');
  const [showResetFields, setShowResetFields] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showOrdersPage, setShowOrdersPage] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [wishlist, setWishlist] = useState(JSON.parse(localStorage.getItem('wishlist') || '[]'));
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showMobileVerification, setShowMobileVerification] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [mobileChangeOtp, setMobileChangeOtp] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMobileChangePassword, setShowMobileChangePassword] = useState(false);
  const [orders, setOrders] = useState(JSON.parse(localStorage.getItem('orders') || '[]'));
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [productImagePreview, setProductImagePreview] = useState(null);

  useEffect(() => {
    fetchProducts();
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  useEffect(() => {
    const storedQuery = localStorage.getItem('searchQuery');
    if (storedQuery) {
      setSearchQuery(storedQuery);
      handleSearchWithQuery(storedQuery);
      localStorage.removeItem('searchQuery');
    }
  }, [products]);

  useEffect(() => {
    const openModal = localStorage.getItem('openModal');
    if (openModal) {
      if (openModal === 'profile') setShowProfileModal(true);
      else if (openModal === 'wishlist') setShowWishlistModal(true);
      else if (openModal === 'settings') setShowSettingsModal(true);
      localStorage.removeItem('openModal');
    }
    
    const openLoginModal = localStorage.getItem('openLoginModal');
    if (openLoginModal) {
      setShowLoginModal(true);
      setIsSignupMode(false);
      localStorage.removeItem('openLoginModal');
    }
    
    const openCartPage = localStorage.getItem('openCartPage');
    if (openCartPage) {
      setShowCartPage(true);
      localStorage.removeItem('openCartPage');
    }
  }, []);

  useEffect(() => {
    if (authToken && orders.length >= 0) {
      const syncOrders = async () => {
        try {
          await fetch(`${API_URL}/auth/orders`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': authToken
            },
            body: JSON.stringify({ orders })
          });
        } catch (err) {
          console.error('Failed to sync orders:', err);
        }
      };
      syncOrders();
    }
  }, [orders, authToken]);

  useEffect(() => {
    if (authToken && wishlist.length >= 0) {
      const syncWishlist = async () => {
        try {
          await fetch(`${API_URL}/auth/wishlist`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': authToken
            },
            body: JSON.stringify({ wishlist })
          });
        } catch (err) {
          console.error('Failed to sync wishlist:', err);
        }
      };
      syncWishlist();
    }
  }, [wishlist, authToken]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      setProducts(initialProducts);
      setDisplayedProducts(initialProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts(initialProducts);
      setDisplayedProducts(initialProducts);
    }
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = translations[language];

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
        setUser(data.user);
        setWishlist(data.user.wishlist || []);
        setOrders(data.user.orders || []);
        if (data.user.cart) setCart(data.user.cart);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('wishlist', JSON.stringify(data.user.wishlist || []));
        localStorage.setItem('orders', JSON.stringify(data.user.orders || []));
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

  const sendOtp = () => {
    const mobile = document.getElementById('signupMobile').value;
    if (!mobile || mobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setShowOtpField(true);
    setOtpTimer(120);
    alert(`OTP sent to ${mobile}. Your OTP is: ${otp} (Demo)`);
  };

  const sendForgotPasswordOtp = () => {
    const mobile = document.getElementById('forgotMobile').value;
    if (!mobile || mobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setForgotPasswordOtp(otp);
    setShowResetFields(true);
    setOtpTimer(120);
    alert(`OTP sent to ${mobile}. Your OTP is: ${otp} (Demo)`);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    const otp = e.target.resetOtp.value;
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;
    
    if (otp !== forgotPasswordOtp) {
      alert('Invalid OTP');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    alert('Password reset successful! Please login with your new password.');
    setShowForgotPassword(false);
    setShowResetFields(false);
    setShowLoginModal(true);
    e.target.reset();
  };

  const resendOtp = () => {
    const mobile = document.getElementById('signupMobile').value;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpTimer(120);
    alert(`OTP resent to ${mobile}. Your OTP is: ${otp} (Demo)`);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const name = e.target.signupName.value;
    const mobile = e.target.signupMobile.value;
    const password = e.target.signupPassword.value;
    const userType = e.target.userType.value;
    const farmerId = e.target.farmerId?.value;

    const signupData = { name, mobile, password, userType };
    if (userType === 'farmer' && farmerId) {
      signupData.farmerId = farmerId;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setAuthToken(data.token);
        setUser(data.user);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert(`Account created successfully! Welcome ${name}!`);
        setShowLoginModal(false);
        setShowOtpField(false);
        setShowFarmerIdField(false);
        setIsSignupMode(false);
        e.target.reset();
      } else {
        alert('Error: ' + (data.message || 'Registration failed'));
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Cannot connect to server. Make sure backend is running on port 5000.');
    }
  };

  const handleSellForm = async (e) => {
    e.preventDefault();
    if (!authToken) {
      alert('Please login to list products');
      setShowLoginModal(true);
      return;
    }

    const imageFile = e.target.productImage.files[0];
    let imageUrl = 'https://via.placeholder.com/400x300';
    
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        imageUrl = reader.result;
        submitProduct(imageUrl);
      };
      reader.readAsDataURL(imageFile);
    } else {
      submitProduct(imageUrl);
    }

    const submitProduct = async (imageUrl) => {
      const formData = {
        name: e.target.productName.value,
        category: e.target.category.value,
        price: parseInt(e.target.price.value),
        quantity: parseInt(e.target.quantity.value),
        location: `${e.target.city.value}, ${e.target.state.value}`,
        farmerName: `${e.target.farmerFirstName.value} ${e.target.farmerMiddleName.value || ''} ${e.target.farmerLastName.value}`.replace(/\s+/g, ' ').trim(),
        language: language,
        image: imageUrl
      };

      try {
        const response = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': authToken
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const newProduct = await response.json();
          await fetchProducts();
          alert('Product listed successfully!');
          e.target.reset();
          setProductImagePreview(null);
        } else {
          alert('Error listing product');
        }
      } catch (err) {
        console.error('Error:', err);
        alert('Error listing product');
      }
    };
  };

  const handleBuyNow = () => {
    if (!authToken) {
      alert('Please login to buy products');
      setShowLoginModal(true);
      return;
    }
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }
    setShowCartModal(false);
    setShowCheckoutModal(true);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    const paymentMethod = e.target.payment.value;
    const total = getCartTotal();
    const address = e.target.address.value;
    
    const newOrder = {
      id: Date.now(),
      items: cart.map(item => ({ ...item, quantity: item.cartQuantity })),
      total: total,
      address: address,
      payment: paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod,
      date: new Date().toLocaleDateString(),
      status: paymentMethod === 'upi' ? 'Payment Pending' : 'Pending'
    };
    
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    if (authToken) {
      try {
        await fetch(`${API_URL}/auth/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': authToken
          },
          body: JSON.stringify({ order: newOrder })
        });
      } catch (err) {
        console.error('Failed to save order:', err);
      }
    }
    
    if (paymentMethod === 'upi') {
      const upiUrl = `upi://pay?pa=9067579706@ptyes&pn=Vaibhav Alat&am=${total}&cu=INR&tn=FarmTrade Order Payment`;
      window.location.href = upiUrl;
      setShowCheckoutModal(false);
      alert(language === 'en' ? `Order placed! Please complete the payment of ₹${total} in your UPI app.` : language === 'hi' ? `ऑर्डर दिया गया! कृपया अपने UPI ऐप में ₹${total} का भुगतान पूरा करें।` : `ऑर्डर दिली! कृपया तुमच्या UPI अॅपमध्ये ₹${total} चे पेमेंट पूर्ण करा।`);
    } else {
      alert(`Order placed successfully! Total: ₹${total}\nDelivery Address: ${address}\nPayment Method: ${paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}`);
      setShowCheckoutModal(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const newMobile = e.target.profileMobile.value;
    
    if (newMobile !== user?.mobile && !mobileVerified) {
      alert(language === 'en' ? 'Please verify your current account first' : language === 'hi' ? 'कृपया पहले अपने वर्तमान खाते को सत्यापित करें' : 'कृपया प्रथम तुमचे वर्तमान खाते सत्यापित करा');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authToken
        },
        body: JSON.stringify({
          mobile: newMobile,
          address: e.target.profileAddress.value,
          profileImage: profileImage || user.profileImage
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsEditingProfile(false);
        setMobileVerified(false);
        setShowMobileVerification(false);
        setProfileImage(null);
        alert(language === 'en' ? 'Profile updated successfully!' : language === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गया!' : 'प्रोफाइल यशस्वीरित्या अपडेट झाले!');
      } else {
        const data = await response.json();
        alert(language === 'en' ? `Error: ${data.message}` : language === 'hi' ? `त्रुटि: ${data.message}` : `त्रुटी: ${data.message}`);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      alert(language === 'en' ? 'Cannot connect to server. Please start the backend server.' : language === 'hi' ? 'सर्वर से कनेक्ट नहीं हो सका। कृपया बैकएंड सर्वर शुरू करें।' : 'सर्व्हरशी कनेक्ट होऊ शकत नाही. कृपया बॅकएंड सर्व्हर सुरू करा.');
    }
  };

  const sendMobileChangeOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setMobileChangeOtp(otp);
    setOtpTimer(120);
    alert(`OTP sent to ${user?.mobile}. Your OTP is: ${otp} (Demo)`);
  };

  const verifyMobileChange = async (e) => {
    e.preventDefault();
    const enteredOtp = e.target.mobileChangeOtp.value.trim();
    const enteredPassword = e.target.mobileChangePassword?.value.trim();
    
    if (!enteredOtp && !enteredPassword) {
      alert(language === 'en' ? 'Please enter either OTP or Password' : language === 'hi' ? 'कृपया OTP या पासवर्ड दर्ज करें' : 'कृपया OTP किंवा पासवर्ड प्रविष्ट करा');
      return;
    }
    
    if (enteredOtp && enteredOtp === mobileChangeOtp) {
      setMobileVerified(true);
      setShowMobileVerification(false);
      alert(language === 'en' ? 'Verification successful! You can now change your mobile number.' : language === 'hi' ? 'सत्यापन सफल! अब आप अपना मोबाइल नंबर बदल सकते हैं।' : 'सत्यापन यशस्वी! आता तुम्ही तुमचा मोबाइल नंबर बदलू शकता.');
    } else if (enteredPassword) {
      try {
        const response = await fetch(`${API_URL}/auth/verify-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': authToken
          },
          body: JSON.stringify({ password: enteredPassword })
        });

        if (response.ok) {
          setMobileVerified(true);
          setShowMobileVerification(false);
          alert(language === 'en' ? 'Verification successful! You can now change your mobile number.' : language === 'hi' ? 'सत्यापन सफल! अब आप अपना मोबाइल नंबर बदल सकते हैं।' : 'सत्यापन यशस्वी! आता तुम्ही तुमचा मोबाइल नंबर बदलू शकता.');
        } else {
          alert(language === 'en' ? 'Invalid password' : language === 'hi' ? 'अमान्य पासवर्ड' : 'अवैध पासवर्ड');
        }
      } catch (err) {
        console.error('Password verification error:', err);
        alert(language === 'en' ? 'Cannot connect to server. Please start the backend server.' : language === 'hi' ? 'सर्वर से कनेक्ट नहीं हो सका।' : 'सर्व्हरशी कनेक्ट होऊ शकत नाही.');
      }
    } else {
      alert(language === 'en' ? 'Invalid OTP' : language === 'hi' ? 'अमान्य OTP' : 'अवैध OTP');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      language === 'en' 
        ? 'Are you sure you want to delete your account? This action cannot be undone.' 
        : language === 'hi' 
        ? 'क्या आप वाकई अपना खाता हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।'
        : 'तुम्हाला खात्री आहे की तुम्ही तुमचे खाते हटवू इच्छिता? ही क्रिया पूर्ववत केली जाऊ शकत नाही.'
    );
    
    if (confirmDelete) {
      const finalConfirm = window.confirm(
        language === 'en'
          ? 'Final confirmation: Delete account permanently?'
          : language === 'hi'
          ? 'अंतिम पुष्टि: खाता स्थायी रूप से हटाएं?'
          : 'अंतिम पुष्टीकरण: खाते कायमचे हटवायचे?'
      );
      
      if (finalConfirm) {
        try {
          const response = await fetch(`${API_URL}/auth/delete-account`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': authToken
            }
          });

          if (response.ok) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('wishlist');
            setAuthToken(null);
            setUser(null);
            setWishlist([]);
            setShowSettingsModal(false);
            alert(
              language === 'en'
                ? 'Your account has been deleted successfully.'
                : language === 'hi'
                ? 'आपका खाता सफलतापूर्वक हटा दिया गया है।'
                : 'तुमचे खाते यशस्वीरित्या हटवले गेले आहे.'
            );
          } else {
            const data = await response.json();
            alert(
              language === 'en'
                ? `Error: ${data.message || 'Failed to delete account'}`
                : language === 'hi'
                ? `त्रुटि: ${data.message || 'खाता हटाने में विफल'}`
                : `त्रुटी: ${data.message || 'खाते हटवण्यात अयशस्वी'}`
            );
          }
        } catch (err) {
          console.error('Error deleting account:', err);
          alert(
            language === 'en'
              ? 'Cannot connect to server. Please try again later.'
              : language === 'hi'
              ? 'सर्वर से कनेक्ट नहीं हो सका। कृपया बाद में पुनः प्रयास करें।'
              : 'सर्व्हरशी कनेक्ट होऊ शकत नाही. कृपया नंतर पुन्हा प्रयत्न करा.'
          );
        }
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextOnly = (e) => {
    e.target.value = e.target.value.replace(/[0-9]/g, '');
  };

  const handleContactForm = (e) => {
    e.preventDefault();
    const name = e.target[0].value;
    const email = e.target[1].value;
    const message = e.target[2].value;
    
    const subject = encodeURIComponent(`Contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    
    window.location.href = `mailto:farmtradehelp@gmail.com?subject=${subject}&body=${body}`;
    
    alert('Opening your email client...');
    e.target.reset();
  };

  const filterProducts = (category) => {
    setActiveFilter(category);
    setSearchQuery('');
    if (category === 'all') {
      setDisplayedProducts(products);
    } else {
      if (Array.isArray(products)) {
        setDisplayedProducts(products.filter(p => p.category === category));
      }
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    handleSearchWithQuery(query);
  };

  const handleSearchWithQuery = (query) => {
    if (!Array.isArray(products)) return;
    if (query === '') {
      setDisplayedProducts(products);
    } else {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query)
      );
      setDisplayedProducts(filtered);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && displayedProducts.length > 0) {
      setTimeout(() => {
        const productsSection = document.getElementById('products');
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const scroll = (rowId, direction) => {
    const container = document.getElementById(`carousel-${rowId}`);
    const scrollAmount = 320;
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  const getRowProducts = (rowIndex) => {
    if (!Array.isArray(displayedProducts)) return [];
    const itemsPerRow = 7;
    const start = rowIndex * itemsPerRow;
    return displayedProducts.slice(start, start + itemsPerRow);
  };

  const toggleWishlist = async (product, e) => {
    e.stopPropagation();
    if (!authToken) {
      alert('Please login to add items to wishlist');
      setShowLoginModal(true);
      return;
    }
    const isInWishlist = wishlist.some(item => item.id === product.id);
    const newWishlist = isInWishlist ? wishlist.filter(item => item.id !== product.id) : [...wishlist, product];
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  return (
    <div className="App">
      <header className={showProfileModal || showCartPage || showOrdersPage ? 'profile-header' : ''} style={{position: 'sticky', top: 0, left: 0, right: 0, zIndex: 1000, transition: 'all 0.3s ease', overflow: 'visible'}}>
        <nav className="navbar">
          <div className="nav-brand">
            <a href="#home" onClick={(e) => { e.preventDefault(); if(showProfileModal) setShowProfileModal(false); if(showCartPage) setShowCartPage(false); if(showOrdersPage) setShowOrdersPage(false); setTimeout(() => document.getElementById('home')?.scrollIntoView({behavior: 'smooth'}), 100); }}>🌾FarmTrade</a>
          </div>
          <ul className="nav-menu">
            <li><a href="#home" onClick={(e) => { e.preventDefault(); if(showProfileModal) setShowProfileModal(false); if(showCartPage) setShowCartPage(false); if(showOrdersPage) setShowOrdersPage(false); setTimeout(() => document.getElementById('home')?.scrollIntoView({behavior: 'smooth'}), 100); }}>{t.home}</a></li>
            <li><a href="#products" onClick={(e) => { e.preventDefault(); if(showProfileModal) setShowProfileModal(false); if(showCartPage) setShowCartPage(false); if(showOrdersPage) setShowOrdersPage(false); setTimeout(() => document.getElementById('products')?.scrollIntoView({behavior: 'smooth'}), 100); }}>{t.products}</a></li>
            <li><a href="#sell" onClick={(e) => { e.preventDefault(); if(showProfileModal) setShowProfileModal(false); if(showCartPage) setShowCartPage(false); if(showOrdersPage) setShowOrdersPage(false); setTimeout(() => document.getElementById('sell')?.scrollIntoView({behavior: 'smooth'}), 100); }}>{t.sell}</a></li>
            <li><a href="#about" onClick={(e) => { e.preventDefault(); if(showProfileModal) setShowProfileModal(false); if(showCartPage) setShowCartPage(false); if(showOrdersPage) setShowOrdersPage(false); setTimeout(() => document.getElementById('about')?.scrollIntoView({behavior: 'smooth'}), 100); }}>{t.about}</a></li>
            <li><a href="#contact" onClick={(e) => { e.preventDefault(); if(showProfileModal) setShowProfileModal(false); if(showCartPage) setShowCartPage(false); if(showOrdersPage) setShowOrdersPage(false); setTimeout(() => document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'}), 100); }}>{t.contact}</a></li>
          </ul>
          <div className="navbar-right">
            <div className="search-bar">
              <div className="search-container">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input type="text" placeholder={t.searchProducts} value={searchQuery} onChange={handleSearch} onKeyDown={(e) => { if(e.key === 'Enter' && displayedProducts.length > 0) { if(showProfileModal) setShowProfileModal(false); if(showCartPage) setShowCartPage(false); if(showOrdersPage) setShowOrdersPage(false); setTimeout(() => document.getElementById('products')?.scrollIntoView({behavior: 'smooth'}), 100); } }} />
              </div>
            </div>
            <button className="cart-icon" title="Cart" onClick={() => { 
              if (!authToken) {
                alert('Please login to view cart');
                setShowLoginModal(true);
                return;
              }
              setShowProfileModal(false); 
              setShowOrdersPage(false); 
              setShowCartPage(true); 
            }}>
              🛒
              <span className="cart-badge" style={{display: getCartCount() > 0 ? 'flex' : 'none'}}>{getCartCount()}</span>
            </button>
            {authToken && (
              <button className="cart-icon" title="Orders" onClick={() => { setShowProfileModal(false); setShowCartPage(false); setShowOrdersPage(true); }}>
                📦
              </button>
            )}
            <div className="language-selector" onMouseEnter={() => setShowLangDropdown(true)} onMouseLeave={() => setShowLangDropdown(false)}>
              <span className="current-lang">
                <img src={language === 'en' ? 'https://flagcdn.com/80x60/us.png' : 'https://flagcdn.com/80x60/in.png'} alt="flag" className="flag-img" style={{imageRendering: 'crisp-edges'}} />
                {language === 'en' ? 'EN' : language === 'hi' ? 'हिंदी' : 'मराठी'}
              </span>
              <div className={`lang-dropdown ${showLangDropdown ? 'active' : ''}`} onMouseEnter={() => setShowLangDropdown(true)} onMouseLeave={() => setShowLangDropdown(false)}>
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
                        onClick={() => { setShowProfileModal(true); setShowUserMenu(false); }}
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
                        onClick={() => { setShowOrdersPage(true); setShowUserMenu(false); }}
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
                        onClick={() => { setShowWishlistModal(true); setShowUserMenu(false); }}
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
                        onClick={() => { setShowSettingsModal(true); setShowUserMenu(false); }}
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
                        onClick={() => { setShowUserMenu(false); setShowLoginModal(true); setIsSignupMode(false); }}
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
                          setAuthToken(null); 
                          setUser(null); 
                          setWishlist([]);
                          localStorage.removeItem('authToken'); 
                          localStorage.removeItem('user'); 
                          localStorage.removeItem('wishlist');
                          setShowUserMenu(false);
                          setShowProfileModal(false);
                          setShowCartPage(false);
                          setShowOrdersPage(false);
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
                <button className="btn-login" onClick={() => { setShowLoginModal(true); setIsSignupMode(false); }}>{t.login}</button>
              )}
            </div>
          </div>
        </nav>
      </header>

      {!showProfileModal && !showCartPage && !showOrdersPage && (
      <section id="home" className="hero">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop" alt="Farm" className="hero-image" />
        </div>
        <div className="hero-content">
          <h1>{t.heroTitle}</h1>
          <p>{t.heroSubtitle}</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => document.getElementById('products').scrollIntoView({behavior: 'smooth'})}>{ t.startBuying}</button>
            <button className="btn-secondary" onClick={() => document.getElementById('sell').scrollIntoView({behavior: 'smooth'})}>{t.startSelling}</button>
          </div>
        </div>
      </section>
      )}

      {!showProfileModal && !showCartPage && (
      <section id="products" className="products">
        <div className="container">
          <h2>{t.freshProducts}</h2>
          <div className="product-filters">
            <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => filterProducts('all')}>{t.all}</button>
            <button className={`filter-btn ${activeFilter === 'vegetables' ? 'active' : ''}`} onClick={() => filterProducts('vegetables')}>{t.vegetables}</button>
            <button className={`filter-btn ${activeFilter === 'fruits' ? 'active' : ''}`} onClick={() => filterProducts('fruits')}>{t.fruits}</button>
            <button className={`filter-btn ${activeFilter === 'grains' ? 'active' : ''}`} onClick={() => filterProducts('grains')}>{t.grains}</button>
            <button className={`filter-btn ${activeFilter === 'spices' ? 'active' : ''}`} onClick={() => filterProducts('spices')}>{t.spices}</button>
            <button className={`filter-btn ${activeFilter === 'dairy' ? 'active' : ''}`} onClick={() => filterProducts('dairy')}>{t.dairy}</button>
            <button className={`filter-btn ${activeFilter === 'cash-crops' ? 'active' : ''}`} onClick={() => filterProducts('cash-crops')}>{t.cashCrops}</button>
          </div>
          {activeFilter === 'all' ? (
            <>
              {[0, 1].map(rowIndex => {
                const rowProducts = getRowProducts(rowIndex);
                if (rowProducts.length === 0) return null;
                return (
                  <div key={rowIndex} className="carousel-wrapper">
                    <button className="carousel-arrow left" onClick={() => scroll(rowIndex, 'left')}>‹</button>
                    <div className="carousel-container" id={`carousel-${rowIndex}`}>
                      {rowProducts.map(product => (
                        <div key={product.id || product._id} className="product-card" onClick={() => navigate(`/product/${product._id || product.id}`)} style={{cursor: 'pointer'}}>
                          <img src={product.image} alt={t.productNames[product.name] || product.name} className="product-image" />
                          <div className="product-info">
                            <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                              {t.productNames[product.name] || product.name}
                              <span onClick={(e) => toggleWishlist(product, e)} style={{cursor: 'pointer', fontSize: '1.2rem'}}>{wishlist.some(item => item.id === product.id) ? '❤️' : '🤍'}</span>
                            </h3>
                            <p className="product-price">₹{product.price}/{t.kg}</p>
                            <p>{t.quantity}: {product.quantity} {t.kg}</p>
                            <p className="product-location">📍 {t.locations[product.location] || product.location}</p>
                            <p>{t.farmer}: {t.farmerNames[product.farmerName] || product.farmerName}</p>
                            <button className="buy-btn" onClick={(e) => {
                              e.stopPropagation();
                              if (!authToken) {
                                alert('Please login to buy products');
                                setShowLoginModal(true);
                                return;
                              }
                              // Add to cart logic here
                            }}>{t.buyNow}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="carousel-arrow right" onClick={() => scroll(rowIndex, 'right')}>›</button>
                  </div>
                );
              })}
            </>
          ) : (
            getRowProducts(0).length > 0 && (
              <div className="carousel-wrapper">
                <button className="carousel-arrow left" onClick={() => scroll(0, 'left')}>‹</button>
                <div className="carousel-container" id={`carousel-0`}>
                  {getRowProducts(0).map(product => (
                    <div key={product.id || product._id} className="product-card" onClick={() => navigate(`/product/${product._id || product.id}`)} style={{cursor: 'pointer'}}>
                      <img src={product.image} alt={t.productNames[product.name] || product.name} className="product-image" />
                      <div className="product-info">
                        <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          {t.productNames[product.name] || product.name}
                          <span onClick={(e) => toggleWishlist(product, e)} style={{cursor: 'pointer', fontSize: '1.2rem'}}>{wishlist.some(item => item.id === product.id) ? '❤️' : '🤍'}</span>
                        </h3>
                        <p className="product-price">₹{product.price}/kg</p>
                        <p>{t.quantity}: {product.quantity} kg</p>
                        <p className="product-location">📍 {t.locations[product.location] || product.location}</p>
                        <p>{t.farmer}: {t.farmerNames[product.farmerName] || product.farmerName}</p>
                        <button className="buy-btn">{t.buyNow}</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="carousel-arrow right" onClick={() => scroll(0, 'right')}>›</button>
              </div>
            )
          )}
          {getRowProducts(activeFilter === 'all' ? 2 : 1).length > 0 && (
            <div className="featured-row">
              <h3>{t.featured}</h3>
              <div className="featured-grid">
                {getRowProducts(activeFilter === 'all' ? 2 : 1).map(product => (
                  <div key={product.id || product._id} className="featured-card" onClick={() => navigate(`/product/${product._id || product.id}`)} style={{cursor: 'pointer'}}>
                    <img src={product.image} alt={t.productNames[product.name] || product.name} className="featured-image" />
                    <span className="featured-badge">{t.featured}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {[3, 4].map(rowIndex => {
            const rowProducts = getRowProducts(rowIndex);
            if (rowProducts.length === 0) return null;
            return (
              <div key={rowIndex} className="carousel-wrapper">
                <button className="carousel-arrow left" onClick={() => scroll(rowIndex, 'left')}>‹</button>
                <div className="carousel-container" id={`carousel-${rowIndex}`}>
                  {rowProducts.map(product => (
                    <div key={product.id || product._id} className="product-card" onClick={() => navigate(`/product/${product._id || product.id}`)} style={{cursor: 'pointer'}}>
                      <img src={product.image} alt={t.productNames[product.name] || product.name} className="product-image" />
                      <div className="product-info">
                        <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          {t.productNames[product.name] || product.name}
                          <span onClick={(e) => toggleWishlist(product, e)} style={{cursor: 'pointer', fontSize: '1.2rem'}}>{wishlist.some(item => item.id === product.id) ? '❤️' : '🤍'}</span>
                        </h3>
                        <p className="product-price">₹{product.price}/kg</p>
                        <p>{t.quantity}: {product.quantity} kg</p>
                        <p className="product-location">📍 {t.locations[product.location] || product.location}</p>
                        <p>{t.farmer}: {t.farmerNames[product.farmerName] || product.farmerName}</p>
                        <button className="buy-btn">{t.buyNow}</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="carousel-arrow right" onClick={() => scroll(rowIndex, 'right')}>›</button>
              </div>
            );
          })}
          {displayedProducts.length > 35 && (
            <div className="remaining-products">
              <h3>{t.moreProducts}</h3>
              <div className="product-list">
                {displayedProducts.slice(35, 40).map((product, index) => (
                  <div key={product.id || product._id} className={`product-list-item ${index % 2 === 0 ? 'left' : 'right'}`} onClick={() => navigate(`/product/${product._id || product.id}`)} style={{cursor: 'pointer'}}>
                    <img src={product.image} alt={t.productNames[product.name] || product.name} className="product-list-image" />
                    <div className="product-list-details">
                      <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        {t.productNames[product.name] || product.name}
                        <span onClick={(e) => toggleWishlist(product, e)} style={{cursor: 'pointer', fontSize: '1.2rem'}}>{wishlist.some(item => item.id === product.id) ? '❤️' : '🤍'}</span>
                      </h3>
                      <p className="product-price">₹{product.price}/{t.kg}</p>
                      <p className="product-meta">📍 {t.locations[product.location] || product.location} | {t.quantity}: {product.quantity} {t.kg}</p>
                      <p className="product-farmer">{t.farmer}: {t.farmerNames[product.farmerName] || product.farmerName}</p>
                      <button className="buy-btn">{t.buyNow}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {displayedProducts.length > 40 && (
            <div className="extra-products">
              <h3>{t.allOtherProducts}</h3>
              <div className="product-grid">
                {displayedProducts.slice(40).map(product => (
                  <div key={product.id || product._id} className="product-card" onClick={() => navigate(`/product/${product._id || product.id}`)} style={{cursor: 'pointer'}}>
                    <img src={product.image} alt={t.productNames[product.name] || product.name} className="product-image" />
                    <div className="product-info">
                      <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        {t.productNames[product.name] || product.name}
                        <span onClick={(e) => toggleWishlist(product, e)} style={{cursor: 'pointer', fontSize: '1.2rem'}}>{wishlist.some(item => item.id === product.id) ? '❤️' : '🤍'}</span>
                      </h3>
                      <p className="product-price">₹{product.price}/kg</p>
                      <p>{t.quantity}: {product.quantity} kg</p>
                      <p className="product-location">📍 {t.locations[product.location] || product.location}</p>
                      <p>{t.farmer}: {t.farmerNames[product.farmerName] || product.farmerName}</p>
                      <button className="buy-btn">{t.buyNow}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      )}

      {!showProfileModal && !showCartPage && (
      <section id="sell" className="sell-section">
        <div className="container">
          <h2>{t.sellYourProducts}</h2>
          <form className="sell-form" onSubmit={handleSellForm}>
            <div className="form-group">
              <label>{t.farmerName}</label>
              <div style={{display: 'flex', gap: '1rem'}}>
                <input type="text" name="farmerFirstName" placeholder={t.firstName} onInput={handleTextOnly} required style={{flex: 1}} />
                <input type="text" name="farmerMiddleName" placeholder="Middle Name" onInput={handleTextOnly} style={{flex: 1}} />
                <input type="text" name="farmerLastName" placeholder={t.lastName} onInput={handleTextOnly} required style={{flex: 1}} />
              </div>
            </div>
            <div className="form-group">
              <label>{t.productName}</label>
              <input type="text" name="productName" placeholder={t.enterProductName} onInput={handleTextOnly} required />
            </div>
            <div className="form-group">
              <label>{t.category}</label>
              <select name="category" required>
                <option value="">{t.selectCategory}</option>
                <option value="vegetables">{t.vegetables}</option>
                <option value="fruits">{t.fruits}</option>
                <option value="grains">{t.grains}</option>
                <option value="spices">{t.spices}</option>
                <option value="dairy">{t.dairy}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t.pricePerKg}</label>
              <input type="number" name="price" placeholder={t.enterPrice} required />
            </div>
            <div className="form-group">
              <label>{t.quantityKg}</label>
              <input type="number" name="quantity" placeholder={t.enterQuantity} required />
            </div>
            <div className="form-group">
              <label>Product Image</label>
              <input type="file" name="productImage" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setProductImagePreview(reader.result);
                  reader.readAsDataURL(file);
                }
              }} required style={{width: '100%', padding: '0.7rem', borderRadius: '8px', border: '2px solid #228B22'}} />
              {productImagePreview && (
                <button type="button" onClick={() => {
                  const modal = document.createElement('div');
                  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999';
                  modal.innerHTML = `<img src="${productImagePreview}" style="max-width:90%;max-height:90%;border-radius:10px" onclick="this.parentElement.remove()">`;
                  document.body.appendChild(modal);
                }} style={{marginTop: '0.5rem', padding: '0.5rem 1rem', background: '#228B22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Preview Image</button>
              )}
            </div>
            <div className="form-group">
              <label>{t.location}</label>
              <div style={{display: 'flex', gap: '1rem'}}>
                <input type="text" name="city" placeholder={t.city} onInput={handleTextOnly} required style={{flex: 1}} />
                <input type="text" name="state" placeholder={t.state} onInput={handleTextOnly} required style={{flex: 1}} />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{display: 'block', margin: '0 auto'}}>{t.listProduct}</button>
          </form>
        </div>
      </section>
      )}

      {!showProfileModal && (
      <section id="about" className="about">
        <div className="container">
          <h2>{t.aboutFarmTrade}</h2>
          <div className="about-content">
            <div className="about-text">
              <p>{t.aboutText}</p>
              <ul>
                <li>✓ {t.directConnection}</li>
                <li>✓ {t.fairPricing}</li>
                <li>✓ {t.freshQuality}</li>
                <li>✓ {t.easyTrading}</li>
              </ul>
            </div>
            <div className="about-image">
              <img src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&h=400&fit=crop" alt="Farmer" />
            </div>
          </div>
        </div>
      </section>
      )}

      {!showProfileModal && (
      <section id="contact" className="contact">
        <div className="container">
          <h2>{t.contactUs}</h2>
          <div className="contact-content">
            <div className="contact-info">
              <h3>{t.getInTouch}</h3>
              <p>📧 <a href="mailto:farmtradehelp@gmail.com" style={{color: '#228B22', textDecoration: 'none'}}>farmtradehelp@gmail.com</a></p>
              <p>📞 <a href="tel:+919067579706" style={{color: '#228B22', textDecoration: 'none'}}>+91 9067579706</a></p>
              <p>📍 <a href="#contact" style={{color: '#228B22', textDecoration: 'none'}}>Agricultural Hub, India</a></p>
              <p>💬 <a href="https://chat.whatsapp.com/LAGZSsFAwQZ7pMCaZnKKkN" target="_blank" rel="noopener noreferrer" style={{color: '#228B22', textDecoration: 'none'}}>WhatsApp Us</a></p>
            </div>
            <form className="contact-form" onSubmit={handleContactForm}>
              <input type="text" placeholder={t.yourName} required />
              <input type="email" placeholder={t.yourEmail} required />
              <textarea placeholder={t.yourMessage} required></textarea>
              <button type="submit" className="btn-primary">{t.sendMessage}</button>
            </form>
          </div>
        </div>
      </section>
      )}

      {!showProfileModal && (
      <footer>
        <div className="container">
          <p>&copy; 2026 FarmTrade. {t.allRightsReserved}.</p>
          <p>{t.developedBy} Vaibhav Gajanan Alat</p>
        </div>
      </footer>
      )}

      {showLoginModal && (
        <div className="modal" onClick={(e) => e.target.className === 'modal' && setShowLoginModal(false)}>
          <div className="modal-content">
            <span className="close" onClick={() => setShowLoginModal(false)}>&times;</span>
            <h2>{isSignupMode ? t.joinFarmTrade : t.loginToFarmTrade}</h2>
            {!isSignupMode ? (
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
                  <div style={{textAlign: 'right', marginTop: '0.5rem'}}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setShowLoginModal(false); setShowForgotPassword(true); }} style={{color: '#228B22', textDecoration: 'none', fontSize: '0.9rem'}}>Forgot Password?</a>
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{display: 'block', margin: '0 auto'}}>{t.login}</button>
                <div style={{textAlign: 'center', marginTop: '1rem'}}>
                  <span style={{color: '#666'}}>Don't have an account? </span>
                  <a href="#" onClick={(e) => { e.preventDefault(); setIsSignupMode(true); }} style={{color: '#228B22', textDecoration: 'none', fontWeight: 'bold'}}>Sign Up</a>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignup}>
                <div className="form-group">
                  <label>{t.fullName}</label>
                  <input type="text" name="signupName" onInput={handleTextOnly} placeholder={t.enterName} required />
                </div>
                <div className="form-group">
                  <label>{t.mobileNumber}</label>
                  <input type="tel" id="signupMobile" name="signupMobile" pattern="[0-9]{10}" placeholder={t.enterMobile} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} maxLength="10" required />
                  <button type="button" className="btn-otp" onClick={sendOtp}>{t.sendOTP}</button>
                </div>
                {showOtpField && (
                  <div className="form-group">
                    <label>{t.mobileOTP}</label>
                    <input type="text" name="mobileOtp" maxLength="6" placeholder={t.enterOTP} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} />
                    <div style={{marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      {otpTimer > 0 ? (
                        <span style={{color: '#666', fontSize: '0.9rem'}}>{t.resendOTPIn} {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</span>
                      ) : (
                        <button type="button" onClick={resendOtp} style={{background: 'none', border: 'none', color: '#228B22', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline'}}>🔄 {t.resendOTP}</button>
                      )}
                    </div>
                  </div>
                )}
                <div className="form-group">
                  <label>{t.password}</label>
                  <div style={{position: 'relative'}}>
                    <input 
                      type={showPassword ? "text" : "password"}
                      name="signupPassword" 
                      pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*!])[A-Za-z\d@#$%&*!]{8,}" 
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
                  <select name="userType" onChange={(e) => setShowFarmerIdField(e.target.value === 'farmer')} required>
                    <option value="">{t.selectType}</option>
                    <option value="farmer">{t.farmerType}</option>
                    <option value="buyer">{t.buyerType}</option>
                  </select>
                </div>
                {showFarmerIdField && (
                  <div className="form-group">
                    <label>{t.farmerID}</label>
                    <input type="text" name="farmerId" pattern="[0-9]{11}" onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} maxLength="11" placeholder={t.enterFarmerID} />
                  </div>
                )}
                <button type="submit" className="btn-primary" style={{display: 'block', margin: '0 auto'}}>{t.signup}</button>
                <div style={{textAlign: 'center', marginTop: '1rem'}}>
                  <span style={{color: '#666'}}>Already have an account? </span>
                  <a href="#" onClick={(e) => { e.preventDefault(); setIsSignupMode(false); }} style={{color: '#228B22', textDecoration: 'none', fontWeight: 'bold'}}>Login</a>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showForgotPassword && (
        <div className="modal" onClick={(e) => e.target.className === 'modal' && setShowForgotPassword(false)}>
          <div className="modal-content">
            <span className="close" onClick={() => setShowForgotPassword(false)}>&times;</span>
            <h2>Reset Password</h2>
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>Mobile Number</label>
                <input type="tel" id="forgotMobile" pattern="[0-9]{10}" placeholder="Enter 10-digit mobile number" onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} maxLength="10" required />
                <button type="button" className="btn-otp" onClick={sendForgotPasswordOtp}>Send OTP</button>
              </div>
              {showResetFields && (
                <>
                  <div className="form-group">
                    <label>OTP</label>
                    <input type="text" name="resetOtp" maxLength="6" placeholder="Enter 6-digit OTP" onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} required />
                    <div style={{marginTop: '0.5rem'}}>
                      {otpTimer > 0 ? (
                        <span style={{color: '#666', fontSize: '0.9rem'}}>Resend OTP in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</span>
                      ) : (
                        <button type="button" onClick={sendForgotPasswordOtp} style={{background: 'none', border: 'none', color: '#228B22', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline'}}>🔄 Resend OTP</button>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <div style={{position: 'relative'}}>
                      <input type={showNewPassword ? "text" : "password"} name="newPassword" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*!])[A-Za-z\d@#$%&*!]{8,}" title="Password must be at least 8 characters with uppercase, lowercase, number, and special character" placeholder="Enter new password" required />
                      <span onClick={() => setShowNewPassword(!showNewPassword)} style={{position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '1.2rem'}}>{showNewPassword ? '👁️' : '👁️🗨️'}</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div style={{position: 'relative'}}>
                      <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm new password" required />
                      <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '1.2rem'}}>{showConfirmPassword ? '👁️' : '👁️🗨️'}</span>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{display: 'block', margin: '0 auto'}}>Reset Password</button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {showCartModal && (
        <div className="modal" onClick={(e) => e.target.className === 'modal' && setShowCartModal(false)}>
          <div className="modal-content" style={{maxWidth: '600px'}}>
            <span className="close" onClick={() => setShowCartModal(false)}>&times;</span>
            <h2>🛒 {language === 'en' ? 'Your Cart' : language === 'hi' ? 'आपकी कार्ट' : 'तुमची कार्ट'}</h2>
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
                  </div>
                ))}
                <div style={{padding: '1.5rem', background: '#f0f8f0', marginTop: '1rem', borderRadius: '10px'}}>
                  <p style={{fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'right', margin: 0}}>{language === 'en' ? 'Total' : language === 'hi' ? 'कुल' : 'एकूण'}: ₹{getCartTotal()}</p>
                </div>
                <button className="btn-primary" style={{width: '100%', marginTop: '1rem'}} onClick={handleBuyNow}>{t.buyNow}</button>
              </>
            )}
          </div>
        </div>
      )}

      {showCartPage && (
        <div className="profile-page-wrapper" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'white', zIndex: 999, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          <div className="profile-content" style={{width: '100%', maxWidth: '1400px', paddingTop: '80px', paddingLeft: '1rem', paddingRight: '1rem', paddingBottom: '3rem'}}>
            <span className="close" onClick={() => setShowCartPage(false)} style={{position: 'absolute', top: '1rem', right: '1rem', fontSize: '28px', fontWeight: 'bold', cursor: 'pointer', color: '#aaa'}}>&times;</span>
            <h2 style={{marginTop: '0', paddingTop: '0'}}>🛒 {language === 'en' ? 'Your Cart' : language === 'hi' ? 'आपकी कार्ट' : 'तुमची कार्ट'}</h2>
            {cart.length === 0 ? (
              <p style={{textAlign: 'center', padding: '2rem', color: '#666'}}>{language === 'en' ? 'Your cart is empty' : language === 'hi' ? 'आपकी कार्ट खाली है' : 'तुमची कार्ट रिकामी आहे'}</p>
            ) : (
              <div style={{display: 'flex', flexWrap: 'nowrap', gap: '2rem', marginTop: '1rem'}}>
                <div style={{flex: '1 1 65%', minWidth: '0'}}>
                  {cart.map(item => (
                    <div key={`${item.id}-${language}`} style={{display: 'flex', gap: '1.5rem', padding: '1.5rem', borderBottom: '1px solid #eee', alignItems: 'center'}}>
                      <img src={item.image} alt={t.productNames[item.name] || item.name} style={{width: '150px', height: '150px', objectFit: 'cover', borderRadius: '10px'}} />
                      <div style={{flex: 1}}>
                        <h4 style={{margin: '0 0 0.8rem 0', fontSize: '1.3rem'}}>{t.productNames[item.name] || item.name}</h4>
                        <p style={{margin: '0.4rem 0', fontSize: '1rem', color: '#666'}}>📍 {t.locations[item.location] || item.location}</p>
                        <p style={{margin: '0.4rem 0', fontSize: '1rem', color: '#666'}}>{t.farmer}: {t.farmerNames[item.farmerName] || item.farmerName}</p>
                        <p style={{margin: '0.4rem 0', color: '#228B22', fontWeight: 'bold', fontSize: '1.2rem'}}>₹{item.price}/{t.kg}</p>
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.8rem'}}>
                          <button onClick={() => updateQuantity(item.id, item.cartQuantity - 1)} style={{padding: '0.5rem 1rem', background: '#228B22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.1rem'}}>-</button>
                          <span style={{minWidth: '40px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold'}}>{item.cartQuantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.cartQuantity + 1)} style={{padding: '0.5rem 1rem', background: '#228B22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.1rem'}}>+</button>
                        </div>
                        <button onClick={() => updateQuantity(item.id, 0)} style={{padding: '0.5rem 1rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem'}}>🗑️ Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{flex: '1 1 35%', minWidth: '0', maxWidth: '100%'}}>
                  <div style={{border: '1px solid #ddd', borderRadius: '12px', padding: '1.5rem', background: '#f9f9f9'}}>
                    <h3 style={{margin: '0 0 1rem 0', fontSize: '1.5rem', borderBottom: '2px solid #228B22', paddingBottom: '0.5rem'}}>Price Details</h3>
                    <div style={{marginBottom: '1rem'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1.1rem'}}>
                        <span>MRP (incl. of all taxes)</span>
                        <span>₹{Math.round(getCartTotal() * 1.3)}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#666', fontSize: '1rem'}}>
                        <span>Delivery Fees</span>
                        <span>₹{Math.round(getCartTotal() * 0.05)}</span>
                      </div>
                    </div>
                    <div style={{borderTop: '1px solid #ddd', paddingTop: '1rem', marginBottom: '1rem'}}>
                      <h4 style={{margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#228B22'}}>Discounts</h4>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#228B22', fontSize: '1rem'}}>
                        <span>Discount on MRP</span>
                        <span>− ₹{Math.round(getCartTotal() * 0.2)}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#228B22', fontSize: '1rem'}}>
                        <span>Fresh Produce Offer</span>
                        <span>− ₹{Math.round(getCartTotal() * 0.08)}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#228B22', fontSize: '1rem'}}>
                        <span>Farmer Direct Discount</span>
                        <span>− ₹{Math.round(getCartTotal() * 0.05)}</span>
                      </div>
                    </div>
                    <div style={{borderTop: '2px solid #228B22', paddingTop: '1rem', marginBottom: '1rem'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.6rem'}}>
                        <span>Total Amount</span>
                        <span>₹{getCartTotal()}</span>
                      </div>
                      <p style={{margin: '0.5rem 0 0 0', color: '#228B22', fontSize: '1.1rem', fontWeight: 'bold'}}>You will save ₹{Math.round(getCartTotal() * 0.33)} on this order</p>
                    </div>
                    <div style={{background: '#e8f5e9', padding: '0.8rem', borderRadius: '10px', fontSize: '1rem', lineHeight: '1.5'}}>
                      <p style={{margin: '0 0 0.3rem 0'}}>✅ Safe and Secure Payments</p>
                      <p style={{margin: '0 0 0.3rem 0'}}>✅ Easy Returns</p>
                      <p style={{margin: 0}}>✅ 100% Authentic Products</p>
                    </div>
                    <button className="btn-primary" style={{width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.2rem'}} onClick={handleBuyNow}>{t.buyNow}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showCheckoutModal && (
        <div className="modal" onClick={(e) => e.target.className === 'modal' && setShowCheckoutModal(false)}>
          <div className="modal-content" style={{maxWidth: '600px'}}>
            <span className="close" onClick={() => setShowCheckoutModal(false)}>&times;</span>
            <h2>Checkout</h2>
            <div style={{marginBottom: '1.5rem', padding: '1rem', background: '#f0f8f0', borderRadius: '10px'}}>
              <h3 style={{margin: '0 0 1rem 0'}}>Order Summary</h3>
              {cart.map(item => (
                <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                  <span>{t.productNames[item.name] || item.name} x {item.cartQuantity} {t.kg}</span>
                  <span>₹{item.price * item.cartQuantity}</span>
                </div>
              ))}
              <div style={{borderTop: '2px solid #228B22', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem'}}>
                <span>Total:</span>
                <span>₹{getCartTotal()}</span>
              </div>
            </div>
            <form onSubmit={handleCheckout}>
              <div className="form-group">
                <label>Delivery Address</label>
                <div style={{border: '2px solid #228B22', borderRadius: '8px', padding: '1rem'}}>
                  {user?.address ? (
                    <label style={{display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem'}}>
                      <input type="radio" name="address" value={user.address} defaultChecked required />
                      <div>
                        <strong>Saved Address:</strong><br/>
                        {user.address}
                      </div>
                    </label>
                  ) : null}
                  <button type="button" onClick={() => setShowAddressModal(true)} style={{padding: '0.5rem 1rem', background: '#228B22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>+ Add New Address</button>
                </div>
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select name="payment" required style={{width: '100%', padding: '0.7rem', borderRadius: '8px', border: '2px solid #228B22'}}>
                  <option value="">Select Payment Method</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="upi">UPI</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="netbanking">Net Banking</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{width: '100%'}}>Place Order</button>
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
                <input type="tel" id="signupMobile" name="signupMobile" pattern="[0-9]{10}" placeholder={t.enterMobile} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} maxLength="10" required />
                <button type="button" className="btn-otp" onClick={sendOtp}>{t.sendOTP}</button>
              </div>
              {showOtpField && (
                <div className="form-group">
                  <label>{t.mobileOTP}</label>
                  <input type="text" name="mobileOtp" maxLength="6" placeholder={t.enterOTP} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} />
                  <div style={{marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    {otpTimer > 0 ? (
                      <span style={{color: '#666', fontSize: '0.9rem'}}>{t.resendOTPIn} {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</span>
                    ) : (
                      <button type="button" onClick={resendOtp} style={{background: 'none', border: 'none', color: '#228B22', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline'}}>🔄 {t.resendOTP}</button>
                    )}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label>{t.password}</label>
                <div style={{position: 'relative'}}>
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="signupPassword" 
                    pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*!])[A-Za-z\d@#$%&*!]{8,}" 
                    title={t.passwordRequirement} 
                    placeholder={t.enterPassword}
                    required 
                  />
                  <span 
                    onClick={() => setShowPassword(!showPassword)} 
                    style={{position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '1.2rem'}}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </span>
                </div>
              </div>
              <div className="form-group">
                <label>{t.iAmA}</label>
                <select name="userType" onChange={(e) => setShowFarmerIdField(e.target.value === 'farmer')} required>
                  <option value="">{t.selectType}</option>
                  <option value="farmer">{t.farmerType}</option>
                  <option value="buyer">{t.buyerType}</option>
                </select>
              </div>
              {showFarmerIdField && (
                <div className="form-group">
                  <label>{t.farmerID}</label>
                  <input type="text" name="farmerId" pattern="[0-9]{11}" onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} maxLength="11" placeholder={t.enterFarmerID} />
                </div>
              )}
              <button type="submit" className="btn-primary" style={{display: 'block', margin: '0 auto'}}>{t.signup}</button>
            </form>
          </div>
        </div>
      )}

      {showOrdersPage && (
        <div className="profile-page-wrapper" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'white', zIndex: 999, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          <div className="profile-content" style={{width: '100%', maxWidth: '1400px', paddingTop: '80px', paddingLeft: '1rem', paddingRight: '1rem', paddingBottom: '3rem'}}>
            <span className="close" onClick={() => setShowOrdersPage(false)} style={{position: 'absolute', top: '1rem', right: '1rem', fontSize: '28px', fontWeight: 'bold', cursor: 'pointer', color: '#aaa'}}>&times;</span>
            <h2 style={{marginTop: '0', paddingTop: '0'}}>📦 {language === 'en' ? 'My Orders' : language === 'hi' ? 'मेरे ऑर्डर' : 'माझे ऑर्डर'}</h2>
            {orders.length === 0 ? (
              <div style={{color: '#888', textAlign: 'center', padding: '3rem', fontSize: '1.2rem'}}>
                <p>{language === 'en' ? 'No orders yet' : language === 'hi' ? 'अभी तक कोई ऑर्डर नहीं' : 'अद्याप कोणतेही ऑर्डर नाही'}</p>
              </div>
            ) : (
              <div style={{padding: '1rem'}}>
                {orders.map(order => (
                  <div key={order.id} style={{marginBottom: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '10px', border: '2px solid #e0e0e0'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #228B22'}}>
                      <div>
                        <p style={{margin: '0.2rem 0', fontWeight: 'bold'}}>{language === 'en' ? 'Order' : language === 'hi' ? 'ऑर्डर' : 'ऑर्डर'} #{order.id}</p>
                        <p style={{margin: '0.2rem 0', fontSize: '0.9rem', color: '#666'}}>{order.date}</p>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <p style={{margin: '0.2rem 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#228B22'}}>₹{order.total}</p>
                        <p style={{margin: '0.2rem 0', fontSize: '0.9rem', color: order.status === 'Cancelled' ? '#dc3545' : order.status === 'Delivered' ? '#28a745' : '#ff9800'}}>{order.status}</p>
                      </div>
                    </div>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center'}}>
                        <img src={item.image} alt={t.productNames[item.name] || item.name} style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px'}} />
                        <div style={{flex: 1}}>
                          <p style={{margin: '0.2rem 0', fontWeight: 'bold'}}>{t.productNames[item.name] || item.name}</p>
                          <p style={{margin: '0.2rem 0', fontSize: '0.85rem', color: '#666'}}>{language === 'en' ? 'Quantity' : language === 'hi' ? 'मात्रा' : 'प्रमाण'}: {item.quantity} {t.kg}</p>
                        </div>
                        <p style={{fontWeight: 'bold', color: '#228B22'}}>₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                    <div style={{marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid #ddd'}}>
                      <p style={{margin: '0.2rem 0', fontSize: '0.9rem'}}><strong>{language === 'en' ? 'Address' : language === 'hi' ? 'पता' : 'पत्ता'}:</strong> {order.address}</p>
                      <p style={{margin: '0.2rem 0', fontSize: '0.9rem'}}><strong>{language === 'en' ? 'Payment' : language === 'hi' ? 'भुगतान' : 'पेमेंट'}:</strong> {order.payment}</p>
                    </div>
                    <div style={{marginTop: '1rem', display: 'flex', gap: '0.5rem'}}>
                      {order.status === 'Payment Pending' && order.payment === 'UPI' && (
                        <button 
                          onClick={() => {
                            const upiUrl = `upi://pay?pa=9067579706@ptyes&pn=Vaibhav Alat&am=${order.total}&cu=INR&tn=FarmTrade Order Payment`;
                            window.location.href = upiUrl;
                            alert(language === 'en' ? `Please complete the payment of ₹${order.total} in your UPI app.` : language === 'hi' ? `कृपया अपने UPI ऐप में ₹${order.total} का भुगतान पूरा करें।` : `कृपया तुमच्या UPI अॅपमध्ये ₹${order.total} चे पेमेंट पूर्ण करा।`);
                          }}
                          style={{flex: 1, padding: '0.7rem', background: '#228B22', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}
                        >
                          💳 {language === 'en' ? 'Retry Payment' : language === 'hi' ? 'पुनः भुगतान करें' : 'पुन्हा पेमेंट करा'}
                        </button>
                      )}
                      {(order.status === 'Pending' || order.status === 'Payment Pending') && (
                        <button 
                          onClick={() => {
                            const confirmCancel = window.confirm(
                              language === 'en' 
                                ? 'Are you sure you want to cancel this order?' 
                                : language === 'hi' 
                                ? 'क्या आप वाकई इस ऑर्डर को रद्द करना चाहते हैं?'
                                : 'तुम्हाला खात्री आहे की तुम्ही ही ऑर्डर रद्द करू इच्छिता?'
                            );
                            if (confirmCancel) {
                              const updatedOrders = orders.map(o => 
                                o.id === order.id ? { ...o, status: 'Cancelled' } : o
                              );
                              setOrders(updatedOrders);
                              localStorage.setItem('orders', JSON.stringify(updatedOrders));
                              alert(language === 'en' ? 'Order cancelled successfully!' : language === 'hi' ? 'ऑर्डर सफलतापूर्वक रद्द कर दिया गया!' : 'ऑर्डर यशस्वीरित्या रद्द केली!');
                            }
                          }}
                          style={{flex: 1, padding: '0.7rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}
                        >
                          ❌ {language === 'en' ? 'Cancel Order' : language === 'hi' ? 'ऑर्डर रद्द करें' : 'ऑर्डर रद्द करा'}
                        </button>
                      )}
                      {order.status === 'Cancelled' && (
                        <button 
                          onClick={async () => {
                            const confirmDelete = window.confirm(
                              language === 'en' 
                                ? 'Do you want to remove this order from the list?' 
                                : language === 'hi' 
                                ? 'क्या आप इस ऑर्डर को सूची से हटाना चाहते हैं?'
                                : 'तुम्ही ही ऑर्डर यादीतून काढू इच्छिता?'
                            );
                            if (confirmDelete) {
                              const updatedOrders = orders.filter(o => o.id !== order.id);
                              setOrders(updatedOrders);
                              localStorage.setItem('orders', JSON.stringify(updatedOrders));
                              if (authToken) {
                                try {
                                  await fetch(`${API_URL}/auth/orders/${order.id}`, {
                                    method: 'DELETE',
                                    headers: { 'x-auth-token': authToken }
                                  });
                                } catch (err) {
                                  console.error('Failed to delete order:', err);
                                }
                              }
                            }
                          }}
                          style={{width: '100%', padding: '0.7rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}
                        >
                          🗑️ {language === 'en' ? 'Remove from List' : language === 'hi' ? 'सूची से हटाएं' : 'यादीतून काढा'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showOrdersModal && (
        <div className="modal" onClick={(e) => e.target.className === 'modal' && setShowOrdersModal(false)}>
          <div className="modal-content" style={{maxWidth: '800px'}}>
            <span className="close" onClick={() => setShowOrdersModal(false)}>&times;</span>
            <h2>📦 {language === 'en' ? 'My Orders' : language === 'hi' ? 'मेरे ऑर्डर' : 'माझे ऑर्डर'}</h2>
            {orders.length === 0 ? (
              <div style={{color: '#888', textAlign: 'center', padding: '3rem', fontSize: '1.2rem'}}>
                <p>{language === 'en' ? 'No orders yet' : language === 'hi' ? 'अभी तक कोई ऑर्डर नहीं' : 'अद्याप कोणतेही ऑर्डर नाही'}</p>
              </div>
            ) : (
              <div style={{padding: '1rem'}}>
                {orders.map(order => (
                  <div key={order.id} style={{marginBottom: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '10px', border: '2px solid #e0e0e0'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #228B22'}}>
                      <div>
                        <p style={{margin: '0.2rem 0', fontWeight: 'bold'}}>{language === 'en' ? 'Order' : language === 'hi' ? 'ऑर्डर' : 'ऑर्डर'} #{order.id}</p>
                        <p style={{margin: '0.2rem 0', fontSize: '0.9rem', color: '#666'}}>{order.date}</p>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <p style={{margin: '0.2rem 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#228B22'}}>₹{order.total}</p>
                        <p style={{margin: '0.2rem 0', fontSize: '0.9rem', color: order.status === 'Cancelled' ? '#dc3545' : order.status === 'Delivered' ? '#28a745' : '#ff9800'}}>{order.status}</p>
                      </div>
                    </div>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center'}}>
                        <img src={item.image} alt={t.productNames[item.name] || item.name} style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px'}} />
                        <div style={{flex: 1}}>
                          <p style={{margin: '0.2rem 0', fontWeight: 'bold'}}>{t.productNames[item.name] || item.name}</p>
                          <p style={{margin: '0.2rem 0', fontSize: '0.85rem', color: '#666'}}>{language === 'en' ? 'Quantity' : language === 'hi' ? 'मात्रा' : 'प्रमाण'}: {item.quantity} {t.kg}</p>
                        </div>
                        <p style={{fontWeight: 'bold', color: '#228B22'}}>₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                    <div style={{marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid #ddd'}}>
                      <p style={{margin: '0.2rem 0', fontSize: '0.9rem'}}><strong>{language === 'en' ? 'Address' : language === 'hi' ? 'पता' : 'पत्ता'}:</strong> {order.address}</p>
                      <p style={{margin: '0.2rem 0', fontSize: '0.9rem'}}><strong>{language === 'en' ? 'Payment' : language === 'hi' ? 'भुगतान' : 'पेमेंट'}:</strong> {order.payment}</p>
                    </div>
                    <div style={{marginTop: '1rem', display: 'flex', gap: '0.5rem'}}>
                      {order.status === 'Payment Pending' && order.payment === 'UPI' && (
                        <button 
                          onClick={() => {
                            const upiUrl = `upi://pay?pa=9067579706@ptyes&pn=Vaibhav Alat&am=${order.total}&cu=INR&tn=FarmTrade Order Payment`;
                            window.location.href = upiUrl;
                            alert(language === 'en' ? `Please complete the payment of ₹${order.total} in your UPI app.` : language === 'hi' ? `कृपया अपने UPI ऐप में ₹${order.total} का भुगतान पूरा करें।` : `कृपया तुमच्या UPI अॅपमध्ये ₹${order.total} चे पेमेंट पूर्ण करा।`);
                          }}
                          style={{flex: 1, padding: '0.7rem', background: '#228B22', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}
                        >
                          💳 {language === 'en' ? 'Retry Payment' : language === 'hi' ? 'पुनः भुगतान करें' : 'पुन्हा पेमेंट करा'}
                        </button>
                      )}
                      {(order.status === 'Pending' || order.status === 'Payment Pending') && (
                        <button 
                          onClick={() => {
                            const confirmCancel = window.confirm(
                              language === 'en' 
                                ? 'Are you sure you want to cancel this order?' 
                                : language === 'hi' 
                                ? 'क्या आप वाकई इस ऑर्डर को रद्द करना चाहते हैं?'
                                : 'तुम्हाला खात्री आहे की तुम्ही ही ऑर्डर रद्द करू इच्छिता?'
                            );
                            if (confirmCancel) {
                              const updatedOrders = orders.map(o => 
                                o.id === order.id ? { ...o, status: 'Cancelled' } : o
                              );
                              setOrders(updatedOrders);
                              localStorage.setItem('orders', JSON.stringify(updatedOrders));
                              alert(language === 'en' ? 'Order cancelled successfully!' : language === 'hi' ? 'ऑर्डर सफलतापूर्वक रद्द कर दिया गया!' : 'ऑर्डर यशस्वीरित्या रद्द केली!');
                            }
                          }}
                          style={{flex: 1, padding: '0.7rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}
                        >
                          ❌ {language === 'en' ? 'Cancel Order' : language === 'hi' ? 'ऑर्डर रद्द करें' : 'ऑर्डर रद्द करा'}
                        </button>
                      )}
                      {order.status === 'Cancelled' && (
                        <button 
                          onClick={async () => {
                            const confirmDelete = window.confirm(
                              language === 'en' 
                                ? 'Do you want to remove this order from the list?' 
                                : language === 'hi' 
                                ? 'क्या आप इस ऑर्डर को सूची से हटाना चाहते हैं?'
                                : 'तुम्ही ही ऑर्डर यादीतून काढू इच्छिता?'
                            );
                            if (confirmDelete) {
                              const updatedOrders = orders.filter(o => o.id !== order.id);
                              setOrders(updatedOrders);
                              localStorage.setItem('orders', JSON.stringify(updatedOrders));
                              if (authToken) {
                                try {
                                  await fetch(`${API_URL}/auth/orders/${order.id}`, {
                                    method: 'DELETE',
                                    headers: { 'x-auth-token': authToken }
                                  });
                                } catch (err) {
                                  console.error('Failed to delete order:', err);
                                }
                              }
                            }
                          }}
                          style={{width: '100%', padding: '0.7rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}
                        >
                          🗑️ {language === 'en' ? 'Remove from List' : language === 'hi' ? 'सूची से हटाएं' : 'यादीतून काढा'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="profile-page-wrapper" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'white', zIndex: 999, overflowY: 'auto', overflowX: 'auto'}}>
          <div className="profile-content">
            <span className="close" onClick={() => setShowProfileModal(false)} style={{position: 'absolute', top: '1rem', right: '1rem', fontSize: '28px', fontWeight: 'bold', cursor: 'pointer', color: '#aaa'}}>&times;</span>
            <h2 style={{marginTop: '1rem'}}>👤 {language === 'en' ? 'User Profile' : language === 'hi' ? 'उपयोगकर्ता प्रोफ़ाइल' : 'वापरकर्ता प्रोफाइल'}</h2>
            <div>
              {!isEditingProfile ? (
                <>
                  <div className="profile-image-container">
                    <img 
                      src={user?.profileImage || 'https://via.placeholder.com/150'} 
                      alt="Profile" 
                      className="profile-image"
                    />
                  </div>
                  <div className="profile-info-box">
                    <p className="profile-info-text"><strong>{language === 'en' ? 'Name' : language === 'hi' ? 'नाम' : 'नाव'}:</strong> {user?.name}</p>
                    <p className="profile-info-text"><strong>{language === 'en' ? 'Mobile' : language === 'hi' ? 'मोबाइल' : 'मोबाइल'}:</strong> {user?.mobile}</p>
                    <p className="profile-info-text"><strong>{language === 'en' ? 'User Type' : language === 'hi' ? 'उपयोगकर्ता प्रकार' : 'वापरकर्ता प्रकार'}:</strong> {user?.userType === 'farmer' ? (language === 'en' ? 'Farmer' : language === 'hi' ? 'किसान' : 'शेतकरी') : (language === 'en' ? 'Buyer' : language === 'hi' ? 'खरीदार' : 'खरेदीदार')}</p>
                    {user?.farmerId && <p className="profile-info-text"><strong>{language === 'en' ? 'Farmer ID' : language === 'hi' ? 'किसान आईडी' : 'शेतकरी आयडी'}:</strong> {user.farmerId}</p>}
                    <p className="profile-info-text"><strong>{language === 'en' ? 'Address' : language === 'hi' ? 'पता' : 'पत्ता'}:</strong> {user?.address || (language === 'en' ? 'Not added' : language === 'hi' ? 'नहीं जोड़ा गया' : 'जोडलेले नाही')}</p>
                  </div>
                  <button className="btn-primary profile-button-full" onClick={() => setIsEditingProfile(true)}>{language === 'en' ? 'Edit Profile' : language === 'hi' ? 'प्रोफ़ाइल संपादित करें' : 'प्रोफाइल संपादित करा'}</button>
                  <button className="btn-secondary profile-button-full profile-close-btn" onClick={() => setShowProfileModal(false)}>{language === 'en' ? 'Close' : language === 'hi' ? 'बंद करें' : 'बंद करा'}</button>
                </>
              ) : (
                <>
                  {showMobileVerification ? (
                    <form onSubmit={verifyMobileChange}>
                      <h3 style={{textAlign: 'center', marginBottom: '1rem'}}>{language === 'en' ? 'Verify Your Account' : language === 'hi' ? 'अपने खाते को सत्यापित करें' : 'तुमचे खाते सत्यापित करा'}</h3>
                      <p style={{textAlign: 'center', color: '#666', marginBottom: '1rem'}}>{language === 'en' ? 'Current Mobile:' : language === 'hi' ? 'वर्तमान मोबाइल:' : 'वर्तमान मोबाइल:'} <strong>{user?.mobile}</strong></p>
                      <div className="form-group">
                        <label>{language === 'en' ? 'Enter OTP' : language === 'hi' ? 'OTP दर्ज करें' : 'OTP प्रविष्ट करा'}</label>
                        <input 
                          type="text" 
                          name="mobileChangeOtp" 
                          maxLength="6"
                          placeholder={language === 'en' ? 'Enter 6-digit OTP' : language === 'hi' ? '6 अंकों का OTP दर्ज करें' : '6 अंकी OTP प्रविष्ट करा'}
                          onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                        />
                        <button type="button" className="btn-otp" onClick={sendMobileChangeOtp}>{language === 'en' ? 'Send OTP' : language === 'hi' ? 'OTP भेजें' : 'OTP पाठवा'}</button>
                        {otpTimer > 0 && (
                          <div style={{marginTop: '0.5rem', color: '#666', fontSize: '0.9rem'}}>
                            {language === 'en' ? 'Resend OTP in' : language === 'hi' ? 'OTP पुनः भेजें' : 'OTP पुन्हा पाठवा'} {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                          </div>
                        )}
                      </div>
                      <div style={{textAlign: 'center', margin: '1rem 0', color: '#666'}}>OR</div>
                      <div className="form-group">
                        <label>{language === 'en' ? 'Enter Password' : language === 'hi' ? 'पासवर्ड दर्ज करें' : 'पासवर्ड प्रविष्ट करा'}</label>
                        <div style={{position: 'relative'}}>
                          <input 
                            type={showMobileChangePassword ? "text" : "password"}
                            name="mobileChangePassword" 
                            placeholder={language === 'en' ? 'Enter your password' : language === 'hi' ? 'अपना पासवर्ड दर्ज करें' : 'तुमचा पासवर्ड प्रविष्ट करा'}
                          />
                          <span 
                            onClick={() => setShowMobileChangePassword(!showMobileChangePassword)}
                            style={{position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '1.2rem'}}
                          >
                            {showMobileChangePassword ? '👁️' : '👁️🗨️'}
                          </span>
                        </div>
                      </div>
                      <button type="submit" className="btn-primary profile-button-full">{language === 'en' ? 'Verify' : language === 'hi' ? 'सत्यापित करें' : 'सत्यापित करा'}</button>
                      <button type="button" className="btn-secondary profile-button-full profile-close-btn" onClick={() => setShowMobileVerification(false)}>{language === 'en' ? 'Cancel' : language === 'hi' ? 'रद्द करें' : 'रद्द करा'}</button>
                    </form>
                  ) : (
                    <form onSubmit={handleProfileUpdate}>
                      <div className="profile-image-container">
                        <img 
                          src={profileImage || user?.profileImage || 'https://via.placeholder.com/150'} 
                          alt="Profile" 
                          className="profile-image"
                          style={{marginBottom: '0.5rem'}}
                        />
                        <div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                            style={{display: 'none'}} 
                            id="profileImageInput"
                          />
                          <label htmlFor="profileImageInput" style={{cursor: 'pointer', color: '#228B22', textDecoration: 'underline'}}>
                            {language === 'en' ? 'Change Photo' : language === 'hi' ? 'फोटो बदलें' : 'फोटो बदला'}
                          </label>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>{language === 'en' ? 'Mobile Number' : language === 'hi' ? 'मोबाइल नंबर' : 'मोबाइल नंबर'}</label>
                        <div className="profile-form-group">
                          <input 
                            type="tel" 
                            name="profileMobile" 
                            defaultValue={user?.mobile}
                            pattern="[0-9]{10}" 
                            maxLength="10"
                            onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                            disabled={!mobileVerified}
                            style={{flex: 1, opacity: mobileVerified ? 1 : 0.6}}
                            required 
                          />
                          {!mobileVerified && (
                            <button 
                              type="button" 
                              onClick={() => setShowMobileVerification(true)}
                              style={{padding: '0.5rem 1rem', background: '#228B22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', whiteSpace: 'nowrap'}}
                            >
                              {language === 'en' ? 'Change' : language === 'hi' ? 'बदलें' : 'बदला'}
                            </button>
                          )}
                        </div>
                        {mobileVerified && (
                          <p style={{color: '#228B22', fontSize: '0.85rem', marginTop: '0.3rem'}}>✓ {language === 'en' ? 'Verified - You can now change mobile number' : language === 'hi' ? 'सत्यापित - अब आप मोबाइल नंबर बदल सकते हैं' : 'सत्यापित - आता तुम्ही मोबाइल नंबर बदलू शकता'}</p>
                        )}
                      </div>
                      <div className="form-group">
                        <label>{language === 'en' ? 'Address' : language === 'hi' ? 'पता' : 'पत्ता'}</label>
                        <div style={{display: 'flex', gap: '0.5rem', alignItems: 'flex-start'}}>
                          <div style={{flex: 1, padding: '0.7rem', borderRadius: '8px', border: '2px solid #e0e0e0', minHeight: '80px', background: '#f9f9f9', color: '#333'}}>
                            {user?.address || (language === 'en' ? 'No address added' : language === 'hi' ? 'कोई पता नहीं जोड़ा गया' : 'कोणताही पत्ता जोडलेला नाही')}
                          </div>
                          <input type="hidden" name="profileAddress" value={user?.address || ''} />
                          <button 
                            type="button" 
                            onClick={() => setShowAddressModal(true)}
                            style={{padding: '0.5rem 1rem', background: '#228B22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', whiteSpace: 'nowrap'}}
                          >
                            {language === 'en' ? 'Change' : language === 'hi' ? 'बदलें' : 'बदला'}
                          </button>
                        </div>
                      </div>
                      <button type="submit" className="btn-primary profile-button-full">{language === 'en' ? 'Save Changes' : language === 'hi' ? 'परिवर्तन सहेजें' : 'बदल जतन करा'}</button>
                      <button type="button" className="btn-secondary profile-button-full profile-close-btn" onClick={() => { setIsEditingProfile(false); setProfileImage(null); setMobileVerified(false); }}>{language === 'en' ? 'Cancel' : language === 'hi' ? 'रद्द करें' : 'रद्द करा'}</button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddressModal && (
        <div className="modal" onClick={(e) => e.target.className === 'modal' && setShowAddressModal(false)}>
          <div className="modal-content" style={{maxWidth: '600px'}}>
            <span className="close" onClick={() => setShowAddressModal(false)}>&times;</span>
            <h2>{language === 'en' ? 'Edit Address' : language === 'hi' ? 'पता संपादित करें' : 'पत्ता संपादित करा'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.target); const address = `${formData.get('firstName')} ${formData.get('middleName')} ${formData.get('lastName')}, ${formData.get('flat')}, ${formData.get('area')}, ${formData.get('landmark')}, ${formData.get('city')}, ${formData.get('state')}, ${formData.get('pincode')}, ${formData.get('country')}`; const hiddenInput = document.querySelector('input[name="profileAddress"]'); if (hiddenInput) hiddenInput.value = address; setUser({...user, address}); setShowAddressModal(false); }}>
              <div className="form-group">
                <label>{language === 'en' ? 'Country/Region' : language === 'hi' ? 'देश/क्षेत्र' : 'देश/प्रदेश'}</label>
                <input type="text" name="country" defaultValue="India" required style={{width: '100%', padding: '0.7rem', borderRadius: '8px', border: '2px solid #228B22'}} />
              </div>
              <div className="form-group">
                <label>{language === 'en' ? 'Name' : language === 'hi' ? 'नाम' : 'नाव'}</label>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <input type="text" name="firstName" placeholder={language === 'en' ? 'First Name' : language === 'hi' ? 'पहला नाम' : 'पहिले नाव'} required style={{flex: 1, padding: '0.7rem', borderRadius: '8px', border: '2px solid #228B22'}} />
                  <input type="text" name="middleName" placeholder={language === 'en' ? 'Middle Name' : language === 'hi' ? 'मध्य नाम' : 'मध्यले नाव'} style={{flex: 1, padding: '0.7rem', borderRadius: '8px', border: '2px solid #228B22'}} />
                  <input type="text" name="lastName" placeholder={language === 'en' ? 'Last Name' : language === 'hi' ? 'अंतिम नाम' : 'आडनाव'} required style={{flex: 1, padding: '0.7rem', borderRadius: '8px', border: '2px solid #228B22'}} />
                </div>
              </div>
              <div className="form-group">
                <label>{language === 'en' ? 'Mobile Number' : language === 'hi' ? 'मोबाइल नंबर' : 'मोबाइल नंबर'}</label>
                <input type="tel" name="mobile" pattern="[0-9]{10}" maxLength="10" required style={{width: '100%', padding: '0.7rem', borderRadius: '8px', border: '2px solid #228B22'}} />
              </div>
              <div className="form-group">
                <label>{language === 'en' ? 'Pincode' : language === 'hi' ? 'पिनकोड' : 'पिनकोड'}</label>
                <input type="text" name="pincode" pattern="[0-9]{6}" maxLength="6" required style={{width: '100%', padding: '0.7rem', borderRadius: '8px', border: '2px solid #228B22'}} />
              </div>
              <div className="form-group">
                <label>{language === 'en' ? 'Flat, House no., Building, Company, Apartment' : language === 'hi' ? 'फ्लैट, घर नं., बिल्डिंग, कंपनी, अपार्टमेंट' : 'फ्लॅट, घर क्र., बिल्डिंग, कंपनी, अपार्टमेंट'}</label>
                <input type="text" name="flat" required style={{width: '100%', padding: '0.7rem', borderRadius: '8px', border: '2px solid #228B22'}} />
              </div>
              <div className="form-group">
                <label>{language === 'en' ? 'Area, Street, Sector, Village' : language === 'hi' ? 'क्षेत्र, सड़क, सेक्टर, गांव' : 'क्षेत्र, रस्ता, सेक्टर, गाव'}</label>
                <input type="text" name="area" required style={{width: '100%', padding: '0.7rem', borderRadius: '8px', border: '2px solid #228B22'}} />
              </div>
              <div className="form-group">
                <label>{language === 'en' ? 'Landmark' : language === 'hi' ? 'लैंडमार्क' : 'लॅंडमार्क'}</label>
                <input type="text" name="landmark" style={{width: '100%', padding: '0.7rem', borderRadius: '8px', border: '2px solid #228B22'}} />
              </div>
              <div className="form-group">
                <label>{language === 'en' ? 'Town/City and State' : language === 'hi' ? 'शहर और राज्य' : 'शहर आणि राज्य'}</label>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <input type="text" name="city" placeholder={language === 'en' ? 'Town/City' : language === 'hi' ? 'शहर' : 'शहर'} required style={{flex: 1, padding: '0.7rem', borderRadius: '8px', border: '2px solid #228B22'}} />
                  <select name="state" required style={{flex: 1, padding: '0.7rem', borderRadius: '8px', border: '2px solid #228B22'}}>
                    <option value="">{language === 'en' ? 'Select State' : language === 'hi' ? 'राज्य चुनें' : 'राज्य निवडा'}</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                  </select>
                </div>
              </div>
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                  <input type="checkbox" name="defaultAddress" />
                  <span>{language === 'en' ? 'Make this my default address' : language === 'hi' ? 'इसे मेरा डिफ़ॉल्ट पता बनाएं' : 'हा माझा डीफॉल्ट पत्ता बनवा'}</span>
                </label>
              </div>
              <button type="submit" className="btn-primary" style={{width: '100%'}}>{language === 'en' ? 'Use this address' : language === 'hi' ? 'इस पते का उपयोग करें' : 'हा पत्ता वापरा'}</button>
            </form>
          </div>
        </div>
      )}

      {showWishlistModal && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1001}} onClick={() => setShowWishlistModal(false)}>
          <div style={{position: 'fixed', top: '72px', right: 0, bottom: 0, width: '450px', maxWidth: '90vw', background: 'white', boxShadow: '-2px 0 10px rgba(0,0,0,0.2)', overflowY: 'auto', animation: 'slideInRight 0.3s ease-out'}} onClick={(e) => e.stopPropagation()}>
            <div style={{position: 'sticky', top: 0, background: 'white', padding: '1.5rem', borderBottom: '2px solid #eee', zIndex: 10}}>
              <span className="close" onClick={() => setShowWishlistModal(false)} style={{position: 'absolute', top: '1rem', right: '1rem', fontSize: '28px', fontWeight: 'bold', cursor: 'pointer', color: '#aaa'}}>&times;</span>
              <h2 style={{margin: 0}}>❤️ {language === 'en' ? 'My Wishlist' : language === 'hi' ? 'मेरी इच्छा सूची' : 'माझी इच्छा यादी'}</h2>
            </div>
            {wishlist.length === 0 ? (
              <div style={{color: '#888', textAlign: 'center', padding: '3rem', fontSize: '1.2rem'}}>
                <p>{language === 'en' ? 'Your wishlist is empty' : language === 'hi' ? 'आपकी इच्छा सूची खाली है' : 'तुमची इच्छा यादी रिकामी आहे'}</p>
              </div>
            ) : (
              <div style={{padding: '1rem'}}>
                {wishlist.map(item => (
                  <div key={item.id || item._id} style={{display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #eee', alignItems: 'center', cursor: 'pointer'}} onClick={() => window.location.href = `/product/${item._id || item.id}`}>
                    <img src={item.image} alt={item.name} style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px'}} />
                    <div style={{flex: 1}}>
                      <h4 style={{margin: '0 0 0.5rem 0'}}>{t.productNames[item.name] || item.name}</h4>
                      <p style={{margin: '0.2rem 0', color: '#228B22', fontWeight: 'bold'}}>₹{item.price}/{t.kg}</p>
                      <p style={{margin: '0.2rem 0', fontSize: '0.85rem', color: '#666'}}>📍 {t.locations[item.location] || item.location}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const newWishlist = wishlist.filter(w => (w.id || w._id) !== (item.id || item._id));
                        setWishlist(newWishlist);
                        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
                      }}
                      style={{padding: '0.5rem 1rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="modal" onClick={(e) => e.target.className === 'modal' && setShowSettingsModal(false)}>
          <div className="modal-content" style={{maxWidth: '500px'}}>
            <span className="close" onClick={() => setShowSettingsModal(false)}>&times;</span>
            <h2>⚙️ {language === 'en' ? 'Settings' : language === 'hi' ? 'सेटिंग्स' : 'सेटिंग्ज'}</h2>
            <div style={{padding: '1rem'}}>
              <div style={{marginBottom: '1.5rem', padding: '1.5rem', background: '#fff5f5', border: '2px solid #dc3545', borderRadius: '10px'}}>
                <h3 style={{margin: '0 0 1rem 0', color: '#dc3545', fontSize: '1.2rem'}}>
                  ⚠️ {language === 'en' ? 'Danger Zone' : language === 'hi' ? 'खतरे का क्षेत्र' : 'धोक्याचे क्षेत्र'}
                </h3>
                <p style={{margin: '0 0 1rem 0', color: '#666', fontSize: '0.95rem'}}>
                  {language === 'en' 
                    ? 'Once you delete your account, there is no going back. Please be certain.' 
                    : language === 'hi' 
                    ? 'एक बार जब आप अपना खाता हटा देते हैं, तो वापस नहीं आ सकते। कृपया निश्चित रहें।'
                    : 'एकदा तुम्ही तुमचे खाते हटवले की, परत येणे शक्य नाही. कृपया निश्चित रहा.'}
                </p>
                <button 
                  onClick={handleDeleteAccount}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  🗑️ {language === 'en' ? 'Delete Account' : language === 'hi' ? 'खाता हटाएं' : 'खाते हटवा'}
                </button>
              </div>
              <button 
                className="btn-secondary profile-close-btn" 
                style={{width: '100%'}} 
                onClick={() => setShowSettingsModal(false)}
              >
                {language === 'en' ? 'Close' : language === 'hi' ? 'बंद करें' : 'बंद करा'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {

  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;


