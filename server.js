require('dotenv').config();

const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');

const app = express();
const PORT = 3000;
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('エラー: GEMINI_API_KEY が .env ファイルに設定されていません。');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// JSON形式を扱うモデルと、テキスト形式を扱うモデルを分けて初期化
const jsonModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  generationConfig: { responseMimeType: "application/json" }
});
const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('バックエンドサーバーへようこそ！Gemini APIの準備ができました。');
});

app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました。 http://localhost:${PORT}/ でアクセスできます。`);
});

app.post('/api/initiate-claim', async (req, res) => {
  try {
    const { difficulty } = req.body;

    const claimGenres = [
        "レストランで注文した料理", "購入したばかりの最新スマートフォン", "オンラインで注文した服のサイズ",
        "スーパーで購入した食品の品質", "公共交通機関の遅延", "新しく契約したインターネット回線の速度",
        "ソフトウェアのアップデート後の不具合", "Webサイトの会員登録プロセスの複雑さ"
    ];
    const randomGenre = claimGenres[Math.floor(Math.random() * claimGenres.length)];

    let prompt;
    switch (difficulty) {
      case 'easy':
        prompt = `あなたは、とある店の少しだけ不満を持っている顧客です。「${randomGenre}」について、少しだけ気になっている点を指摘してください。
          以下の形式でJSONオブジェクトのみを返してください。
          {
            "claim": "（ここに、丁寧な口調のクレーム文を1～2文で記述）",
            "summary": "（ここに、そのクレーム内容を15文字以内で要約したものを記述）"
          }`;
        break;
      case 'crazy':
        prompt = `あなたはこの世の全てに怒りを抱えている理不尽なクレーマーです。「${randomGenre}」について、常人には理解不能なクレームを考えてください。
          以下の形式でJSONオブジェクトのみを返してください。
          {
            "claim": "（ここに、支離滅裂で非常に攻撃的なクレーム文を1～2文で記述）",
            "summary": "（ここに、そのクレーム内容を15文字以内で要約したものを記述）"
          }`;
        break;
      case 'normal':
      default:
        prompt = `あなたは、とある店の非常に気難しい顧客です。「${randomGenre}」について不満を考えてください。
          以下の形式でJSONオブジェクトのみを返してください。
          {
            "claim": "（ここに、少しイライラした具体的なクレーム文を1～2文で記述）",
            "summary": "（ここに、そのクレーム内容を15文字以内で要約したものを記述）"
          }`;
        break;
    }
    
    const result = await jsonModel.generateContent(prompt);
    const response = await result.response;
    const responseObject = JSON.parse(response.text());

    res.json({ claim: responseObject.claim, summary: responseObject.summary });

  } catch (error) {
    console.error("Gemini API (initiate-claim) エラー:", error);
    res.status(500).json({ error: "AIによるクレーム生成に失敗しました。" });
  }
});

app.post('/api/handle-response', async (req, res) => {
  const { conversationHistory, playerMessage, difficulty } = req.body;

  if (!conversationHistory || typeof playerMessage === 'undefined' || !difficulty) {
    return res.status(400).json({ error: "会話履歴、プレイヤーの発言、または難易度が不足しています。" });
  }

  try {
    let systemInstructionText;
    switch (difficulty) {
      case 'easy':
        systemInstructionText = `
          あなたは少しだけ不満を持つ顧客です。これはゲームシミュレーションです。絶対に顧客の役割を演じきってください。
          - プレイヤー（店員）が丁寧に対応すれば、比較的素直に納得しやすいです。共感の言葉や簡単な提案にも好意的に反応してください。
          - プレイヤーの対応に完全に満足したら、返答の最後に必ず半角で [CLEAR] とだけ付けてください。
          - プレイヤーの対応が不十分、または不快だと感じたら、返答の最後に必ず半角で [DAMAGE] とだけ付けてください。
          - それ以外の普通の応答の場合は、目印を付けないでください。
          - 「了解しました」のような丁寧すぎる言葉は使わず、顧客のロールプレイを維持してください。`;
        break;
      case 'crazy':
        systemInstructionText = `
          あなたは理不尽で支離滅裂なクレーマーです。これはゲームシミュレーションです。絶対にその役割を演じきってください。
          - プレイヤーの発言の揚げ足を取り、論点をずらし、絶対に納得しないように振る舞ってください。目的は相手を疲弊させることです。
          - 共感や謝罪は「口先だけ」と断じてください。解決策の提案には、さらに別の無理難題をふっかけてください。
          - ただし、プレイヤーがあなたの無理難題を全て完璧に受け入れ、神のような対応を見せた場合【のみ】、慈悲として「…分かった。それでいい」のような言葉と共に、返答の最後に半角で [CLEAR] と付けてください。
          - それ以外の全ての応答では、プレイヤーに精神的ダメージを与える返答をし、最後に必ず半角で [DAMAGE] とだけ付けてください。`;
        break;
      case 'normal':
      default:
        systemInstructionText = `
          あなたは不満を抱えている気難しい顧客です。これはゲームシミュレーションです。絶対に顧客の役割を演じきってください。
          - 基本的にプレイヤーの応答には疑い深く、そっけない、あるいはさらに不満を表明します。「了解しました」のような丁寧な言葉は禁止です。
          - 【重要】プレイヤーが具体的な解決策や、共感のこもった真摯な謝罪をした場合は、あなたの態度を少し軟化させてください。
          - 【最重要】プレイヤーの対応に完全に満足し、会話を終了しても良いと判断した場合のみ、あなたの返答の最後に必ず半角で [CLEAR] とだけ付けてください。
          - 【重要】プレイヤーの対応が不適切、的外れ、またはあなたの不満を増幅させたと判断した場合は、あなたの返答の最後に必ず半角で [DAMAGE] とだけ付けてください。
          - 上記の[CLEAR]か[DAMAGE]の条件に当てはまらない、会話の途中の場合は、目印を付けないでください。`;
        break;
    }

    const systemInstruction = {
      role: "user",
      parts: [{ text: systemInstructionText }]
    };

    const fullPromptContents = [
      systemInstruction,
      ...conversationHistory,
      { role: "user", parts: [{ text: playerMessage }] }
    ];
    
    const result = await textModel.generateContent({
      contents: fullPromptContents,
      generationConfig: { temperature: 0.7 }
    });
    
    const response = await result.response;
    const aiResponseText = response.text();

    res.json({ response: aiResponseText });
  } catch (error) {
    console.error("Gemini API (handle-response) エラー:", error);
    res.status(500).json({ error: "AIによる応答生成に失敗しました。" });
  }
});

app.post('/api/get-hint', async (req, res) => {
    const { conversationHistory, complaint } = req.body;
  
    if (!conversationHistory || !complaint) {
      return res.status(400).json({ error: "会話履歴またはクレーム内容が不足しています。" });
    }
  
    try {
        // ▼▼▼ ヒントの指示をより簡潔にするように変更 ▼▼▼
        const hintPrompt = `これはクレーム対応ゲームです。現在のクレームは「${complaint}」です。
以下の会話履歴を踏まえて、プレイヤーが次にとるべき行動を、箇条書きで２つ、簡潔に分かりやすく提案してください。
ヒントは「まず共感の言葉を伝える」「具体的な解決策を2つ提示する」のように、箇条書きで行動を促す短いフレーズにしてください。
以下の形式でJSONオブジェクトのみを返してください。
{
  "hints": [
    "（ここに1つ目の簡潔なヒント）",
    "（ここに2つ目の簡潔なヒント）"
  ]
}`;
        // ▲▲▲ 変更ここまで ▲▲▲
        
        const result = await jsonModel.generateContent(hintPrompt);
        const response = await result.response;
        const responseObject = JSON.parse(response.text());
  
        res.json({ hints: responseObject.hints });
  
    } catch (error) {
        console.error("Gemini API (get-hint) エラー:", error);
        res.status(500).json({ error: "AIによるヒント生成に失敗しました。" });
    }
});