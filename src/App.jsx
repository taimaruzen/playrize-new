import Hgbt from "./Hgbt.jsx";
import Games from "./Games";

import MyPage from "./MyPage.jsx";
import Signup from "./Signup.jsx";
import EmailSignup from "./EmailSignup";
import "./App.css";
import { Routes, Route, Link, useLocation } from "react-router-dom";



function App() {
  const location = useLocation();
  const hideHeader =
  location.pathname.startsWith("/play/") ||
  location.pathname === "/signup" ||
  location.pathname === "/signup/email";

  const shareToX = () => {
  const text =
    "PLAYRIZEで無料オンラインゲームを遊ぼう！\nゲームが遊ばれるほど、ショップの商品がお得に！";

  const url = "https://playrize.net";

  // Xアプリ用
  const appUrl =
    `twitter://post?message=${encodeURIComponent(
      text + "\n" + url
    )}`;

  // ブラウザ版X
  const webUrl =
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}`;

  // まずXアプリを開いてみる
  window.location.href = appUrl;

  // アプリが開かなかった場合
  setTimeout(() => {
    window.location.href = webUrl;
  }, 1500);
};
  
  
  // メニューが開いているかを記憶
 
  return (
    <div
      className="pr-body"
    >
      <div className="main-box">
          {!hideHeader && (

                
          
              <div className="pr-header" id="playrize-header">
                      <h1 className="pr-title">
                        <Link to="/">PLAYRIZE</Link>
                      </h1>
                      <img src="logo.png" className="PLAYRIZE-logo" alt="白い猫" />

                  <div>
                    <Link to="/login" className="loginbut">
                      LOGIN
                    </Link>
                    <Link to="/signup" className="signupbut">
                      SIGN UP
                    </Link>
                  </div>

                <Hgbt />

              </div>
            
            )}
          

          {!hideHeader && (
            <div className="ngmenus-box">
              <nav className="ngmenus">
                <Link to="/games" className="ng-menu">GAME</Link>
                <a href="https://orenosaundo.base.shop"className="ng-menu">SHOP</a>
                <Link to="/" className="ng-menu">HOME</Link>
      
              </nav>
            </div>
          )}
      

      </div>


        {location.pathname === "/" && (
          <div className="home-main">

            <div className="home-badge">
              PLAY • SHARE • RISE
            </div>

            <h1>
              PLAY<span>RIZE</span>
            </h1>

            <p className="home-sub">
              YOUR NEXT GAME STARTS HERE
            </p>
            
            <p className="home-text">
              無料オンラインゲームを、すぐに楽しもう。
              <br />
              ゲームが遊ばれるほど、ショップの商品がお得に。
            </p>

            <div className="home-buttons">
              <Link to="/games" className="home-button">
                PLAY GAME
                <span>→</span>
              </Link>

              <a href="https://shop.playrize.net" className="home-shop-button">
                SHOP
              </a>
            </div>

            <div className="home-scroll">
              <span>SCROLL</span>
              <div className="scroll-line"></div>
            </div>

          </div>
        )}

        {location.pathname === "/" && (
        <footer className="footer">
          <div className="footer-logo">
            <img src="logo.png" alt="PLAYRIZE" />
            <span>PLAYRIZE</span>
          </div>

         <button
            className="x-share"
            onClick={shareToX}
          >
            <img
              src="x-logo.png"
              alt="Xでシェア"
            />
          </button>
          

        </footer>
        )}
      
      <Routes>
        <Route path="/games" element={<Games />} />
        
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/email" element={<EmailSignup />} />
          
          
      </Routes>

      
    </div>
  );
}

export default App;