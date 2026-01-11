import React, { useState } from 'react';
import './ProductDetail.css';

function ProductDetail({ product, onClose }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const images = [product.image, product.image, product.image];
  const rating = 4.5;
  const totalReviews = 128;
  const totalBuyers = 456;
  const availability = product.quantity > 0 ? 'In Stock' : 'Out of Stock';

  const reviews = [
    { name: 'Rajesh Kumar', rating: 5, comment: 'Excellent quality! Fresh and organic.', date: '2 days ago' },
    { name: 'Priya Sharma', rating: 4, comment: 'Good product, delivered on time.', date: '5 days ago' },
    { name: 'Amit Patel', rating: 5, comment: 'Best quality vegetables!', date: '1 week ago' }
  ];

  return (
    <div className="product-detail-overlay" onClick={onClose}>
      <div className="product-detail-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <div className="product-detail-content">
          <div className="product-images-section">
            <img src={images[selectedImage]} alt={product.name} className="main-product-image" />
            <div className="thumbnail-images">
              {images.map((img, idx) => (
                <img key={idx} src={img} alt={`${product.name} ${idx + 1}`} className={`thumbnail ${selectedImage === idx ? 'active' : ''}`} onClick={() => setSelectedImage(idx)} />
              ))}
            </div>
          </div>

          <div className="product-info-section">
            <h1>{product.name}</h1>
            <div className="rating-section">
              <span className="stars">{'⭐'.repeat(Math.floor(rating))} {rating}</span>
              <span className="review-count">({totalReviews} reviews)</span>
              <span className="buyer-count">• {totalBuyers} buyers</span>
            </div>
            
            <div className="price-section">
              <span className="current-price">₹{product.price}/kg</span>
              <span className={`availability ${availability === 'In Stock' ? 'in-stock' : 'out-stock'}`}>{availability}</span>
            </div>

            <div className="product-details">
              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Farmer:</strong> {product.farmerName}</p>
              <p><strong>Location:</strong> 📍 {product.location}</p>
              <p><strong>Available Quantity:</strong> {product.quantity} kg</p>
            </div>

            <div className="quantity-selector">
              <label>Quantity (kg):</label>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <div className="action-buttons">
              <button className="add-to-cart-btn">🛒 Add to Cart</button>
              <button className="buy-now-btn">Buy Now</button>
            </div>

            <div className="return-policy">
              <h3>Return Policy</h3>
              <p>✓ 7-day return policy</p>
              <p>✓ Fresh guarantee or money back</p>
              <p>✓ Free return pickup</p>
            </div>
          </div>
        </div>

        <div className="reviews-section">
          <h2>Customer Reviews ({totalReviews})</h2>
          <div className="reviews-list">
            {reviews.map((review, idx) => (
              <div key={idx} className="review-card">
                <div className="review-header">
                  <span className="reviewer-name">{review.name}</span>
                  <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                </div>
                <p className="review-comment">{review.comment}</p>
                <span className="review-date">{review.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
