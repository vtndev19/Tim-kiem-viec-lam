import React from "react";
import "./HiringFooter.scss";

const HiringFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="hiring-footer">
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            {/* Company Info */}
            <div className="footer-section">
              <div className="footer-logo">
                <div className="logo-icon">💼</div>
                <h3>JobFinder</h3>
              </div>
              <p>
                Nền tảng tuyển dụng hiện đại dành cho nhà tuyển dụng và ứng
                viên.
              </p>
              <div className="social-links">
                <a href="#" className="social-link" title="Facebook">
                  f
                </a>
                <a href="#" className="social-link" title="Twitter">
                  𝕏
                </a>
                <a href="#" className="social-link" title="LinkedIn">
                  in
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4>Nhanh</h4>
              <ul>
                <li>
                  <a href="#hero">Trang chủ</a>
                </li>
                <li>
                  <a href="#form">Đăng tuyển</a>
                </li>
                <li>
                  <a href="#jobs">Quản lý</a>
                </li>
                <li>
                  <a href="#">Bảng giá</a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="footer-section">
              <h4>Hỗ trợ</h4>
              <ul>
                <li>
                  <a href="#">Hướng dẫn</a>
                </li>
                <li>
                  <a href="#">FAQ</a>
                </li>
                <li>
                  <a href="#">Liên hệ</a>
                </li>
                <li>
                  <a href="#">Báo cáo sự cố</a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="footer-section">
              <h4>Pháp lý</h4>
              <ul>
                <li>
                  <a href="#">Điều khoản dịch vụ</a>
                </li>
                <li>
                  <a href="#">Chính sách riêng tư</a>
                </li>
                <li>
                  <a href="#">Cookie</a>
                </li>
                <li>
                  <a href="#">Tuân thủ</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="newsletter-section">
            <div className="newsletter-content">
              <h3>📧 Nhận cập nhật mới</h3>
              <p>
                Đăng ký để nhận thông tin về các tin tuyển dụng mới và cập nhật
                nền tảng.
              </p>
              <div className="newsletter-form">
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="newsletter-input"
                />
                <button className="button button-primary button-small">
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p className="copyright">
            © {currentYear} JobFinder. Tất cả quyền được bảo lưu. | Phát triển
            bởi <span className="highlight">VTN Dev</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default HiringFooter;
