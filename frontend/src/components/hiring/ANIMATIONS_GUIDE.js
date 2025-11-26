// ============================================
// HIRING PAGE ANIMATIONS
// ============================================
// Import this file vào components để sử dụng animations

// Sử dụng:
// <div className="fade-in-up">Content</div>
// <div className="slide-in-left">Content</div>
// <div className="pulse">Content</div>

// Danh sách animations sẵn có:
// 1. fade-in-up         - Fade in với slide up
// 2. slide-in-left      - Slide vào từ trái
// 3. slide-in-right     - Slide vào từ phải
// 4. pulse              - Xung xung nhịp (2s)
// 5. shimmer            - Hiệu ứng sáng bóng
// 6. bounce             - Bật lên (2s)
// 7. floatingAnimation  - Nổi lên xuống (3s)
// 8. scrollBounce       - Bật scroll indicator (2s)
// 9. blobAnimation      - Blob shape animation (15-20s)
// 10. spin              - Quay 360 độ (0.8s)

// ============================================
// SCSS VARIABLES
// ============================================
/*
$transition-fast: 0.2s ease;      // Nhanh
$transition-normal: 0.3s ease;    // Bình thường
$transition-slow: 0.5s ease;      // Chậm
*/

// ============================================
// ANIMATION EXAMPLES
// ============================================

/*
// Example 1: Fade In Up on mount
<section className="fade-in-up">
  <h2>Hello World</h2>
</section>

// Example 2: Staggered animations
<div className="fade-in-up" style={{ animationDelay: '0s' }}>Item 1</div>
<div className="fade-in-up" style={{ animationDelay: '0.1s' }}>Item 2</div>
<div className="fade-in-up" style={{ animationDelay: '0.2s' }}>Item 3</div>

// Example 3: Loading spinner
<div className="spinner">
  Loading...
</div>

// Example 4: Pulsing button
<button className="pulse">
  Click me
</button>
*/

// ============================================
// TIMING REFERENCE
// ============================================
/*
Fast (0.2s)        - Immediate feedback
Normal (0.3s)      - Smooth & noticeable
Slow (0.5s)        - Gentle & relaxed

Stagger delays:
  0s, 0.1s, 0.2s, 0.3s, 0.4s, 0.5s
  Perfect for list items
*/

// ============================================
// COLOR ANIMATIONS
// ============================================
/*
Hover color transition:
  transition: color $transition-normal;
  
Button hover:
  &:hover {
    background: linear-gradient(...);
    box-shadow: $shadow-heavy;
    transform: translateY(-2px);
  }
*/

// ============================================
// RESPONSIVE ANIMATIONS
// ============================================
/*
@media (max-width: $mobile) {
  // Reduce animation duration on mobile
  .fade-in-up {
    animation: fadeInUp 0.4s ease-out;
  }
}
*/

export const animationGuide = {
  available: [
    'fade-in-up',
    'slide-in-left',
    'slide-in-right',
    'pulse',
    'shimmer',
    'bounce',
    'floatingAnimation',
    'scrollBounce',
    'blobAnimation',
    'spin'
  ],
  
  timings: {
    fast: '0.2s ease',
    normal: '0.3s ease',
    slow: '0.5s ease'
  },

  usage: {
    fadeInUp: 'className="fade-in-up"',
    slideInLeft: 'className="slide-in-left"',
    slideInRight: 'className="slide-in-right"',
    pulse: 'className="pulse"',
    
    stagger: `
      <div className="fade-in-up" style={{ animationDelay: '0s' }}>
      <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
      <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
    `
  }
};
