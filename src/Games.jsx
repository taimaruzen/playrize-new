import { useState, useEffect } from "react";

function Games() {
  const [games, setGames] = useState([]);
  const [visibleCount, setVisibleCount] = useState(50);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  // games.jsonからゲーム一覧を取得
  useEffect(() => {
    fetch("/games.json")
      .then((response) => response.json())
      .then((data) => {
        setGames(data);
      });
  }, []);

  // 下までスクロールしたら50件追加
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100
      ) {
        setVisibleCount((count) => count + 50);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div className="game-controls">
        <input
          className="kensaku"
          type="text"
          placeholder="🔎Search the game..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="category-select"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setVisibleCount(50);
          }}
        >
          <option value="">ALL CATEGORY</option>

          {[...new Set(games.map((game) => game.category))]
            .filter(Boolean)
            .sort()
            .map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
        </select>
      </div>

      <div className="games-list">
        <div className="menubar">
          <video
            src="Video Project 2.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>

        {games
          .filter((game) =>
            game.title.toLowerCase().includes(search.toLowerCase())
          )
          .filter((game) =>
            category === "" || game.category === category
          )
          .slice(0, visibleCount)
          .map((game) => (
            <div className="game-card" key={game.id}>

              {/* PlaygamaのCLID付きURLを直接開く */}
              <a href={game.url}>
                <div
                  className="game-preview"

                  onMouseEnter={(e) => {
                    const video =
                      e.currentTarget.querySelector("video");

                    if (video && game.video) {
                      video.play();
                    }
                  }}

                  onMouseLeave={(e) => {
                    const video =
                      e.currentTarget.querySelector("video");

                    if (video) {
                      video.pause();
                      video.currentTime = 0;
                    }
                  }}
                >
                  <img
                    src={game.thumb}
                    alt={game.title}
                  />

                  {game.video && (
                    <video
                      src={game.video}
                      muted
                      loop
                      playsInline
                      preload="none"
                    />
                  )}
                </div>
              </a>

            </div>
          ))}
      </div>
    </>
  );
}

export default Games;