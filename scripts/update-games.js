import fs from "fs";

// PlaygamaのJSONを読み込む
const playgamaData = JSON.parse(
  fs.readFileSync("./public/games.json", "utf-8")
);

const convertedGames = playgamaData.segments[0].hits.map((game) => {
  return {
    id: game.id,
    title: game.title,
    url: game.gameURL,
    category: game.genres[0],
    thumb: game.images[0],
    video: game.videos?.[0]?.playgama_id
    ? `https://static.playgama.com/p-video/${game.videos[0].playgama_id}/orig_length_h320.mp4`
    : null,
  };
});

fs.writeFileSync(
  "./public/games.json",
  JSON.stringify(convertedGames, null, 2)
);

console.log("Playgamaのゲーム一覧を保存しました！");