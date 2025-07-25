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
    
    // 入力値の検証
    if (!difficulty || !['easy', 'normal', 'crazy'].includes(difficulty)) {
      return res.status(400).json({ error: "有効な難易度を指定してください。" });
    }

    const claimGenres = [
        "コンビニでアルバイト中の商品の取り扱い", "カフェでのオーダーミス", "ファミレスでの料理の提供時間",
        "書店での本の在庫切れ", "ドラッグストアでの商品の場所案内", "スーパーでの割引商品の対応", 
        "ファストフード店での注文間違い","スーパーでの食品の品質問題",
    ];
    const randomGenre = claimGenres[Math.floor(Math.random() * claimGenres.length)];

    let prompt;
    switch (difficulty) {
      case 'easy':
        prompt = `あなたはお客様です。「${randomGenre}」に関して少し困っている状況です。
          アルバイト店員に対して、穏やかだが少し困っている様子で問題を伝えてください。
          以下の形式でJSONオブジェクトのみを返してください。
          {
            "claim": "（ここに、丁寧だが少し困っている様子のクレーム文を1～2文で記述）",
            "summary": "（ここに、そのクレーム内容を15文字以内で要約したものを記述）"
          }`;
        break;
      case 'crazy':
        prompt = `あなたは非常に短気で、自分の意見を曲げないお客様です。「${randomGenre}」について、
          アルバイト店員に対して強い口調で不満を主張してください。
          以下の形式でJSONオブジェクトのみを返してください。
          {
            "claim": "（ここに、高圧的で一方的なクレーム文を1～2文で記述）",
            "summary": "（ここに、そのクレーム内容を15文字以内で要約したものを記述）"
          }`;
        break;
      case 'normal':
      default:
        prompt = `あなたは論理的に物事を考えるお客様です。「${randomGenre}」について、
          アルバイト店員に対して筋道立てて具体的な不満点を指摘してください。
          感情的にならず、冷静に問題点を伝えてください。
          以下の形式でJSONオブジェクトのみを返してください。
          {
            "claim": "（ここに、論理的で冷静なクレーム文を1～2文で記述）",
            "summary": "（ここに、そのクレーム内容を15文字以内で要約したものを記述）"
          }`;
        break;
    }
    
    const result = await jsonModel.generateContent(prompt);
    const response = await result.response;
    let responseObject;
    
    try {
      responseObject = JSON.parse(response.text());
    } catch (parseError) {
      console.error("JSON解析エラー:", parseError);
      return res.status(500).json({ error: "AIの応答形式が不正です。" });
    }

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
  
  // 難易度の検証
  if (!['easy', 'normal', 'crazy'].includes(difficulty)) {
    return res.status(400).json({ error: "有効な難易度を指定してください。" });
  }

  try {
    // オウム返しをチェックするコード
    if (conversationHistory.length > 0) {
        // 直前のAIメッセージのオウム返しチェック
        const lastAiMessage = conversationHistory[conversationHistory.length - 1].parts[0].text;
        const cleanLastAiMessage = lastAiMessage.replace(/\[(CLEAR|DAMAGE)\]/g, '').trim();
        if (playerMessage.trim() === cleanLastAiMessage) {
            return res.json({ response: "私の言葉を繰り返さないでください。 [DAMAGE]" });
        }
        
        // 最初のクレーム文（顧客の発言）のオウム返しチェック
        const firstMessage = conversationHistory[0].parts[0].text;
        const cleanFirstMessage = firstMessage.replace(/\[(CLEAR|DAMAGE)\]/g, '').trim();
        if (playerMessage.trim() === cleanFirstMessage) {
            return res.json({ response: "お客様の言葉をそのまま返すのは不適切です。 [DAMAGE]" });
        }
        
        // 会話履歴全体での重複チェック（顧客の発言のみ）
        for (let i = 0; i < conversationHistory.length; i += 2) { // 偶数インデックスは顧客の発言
            if (conversationHistory[i] && conversationHistory[i].role === "user") {
                const customerMessage = conversationHistory[i].parts[0].text;
                const cleanCustomerMessage = customerMessage.replace(/\[(CLEAR|DAMAGE)\]/g, '').trim();
                if (playerMessage.trim() === cleanCustomerMessage) {
                    return res.json({ response: "お客様の言葉をそのまま返すのは適切ではありません。 [DAMAGE]" });
                }
            }
        }
    }

    let systemInstructionText;
    const commonRules = `【最重要ルール】あなたは商品の無料提供や割引、金銭的な賠償を一切要求しません。ただし、プレイヤーからの「返品」や「交換」の提案は受け入れます。`;
    const afterDamageRule = `【ダメージ後のルール】直前のあなたの返答に[DAMAGE]が含まれていた場合、プレイヤーの次の発言が「なんでですか」のような単純な質問や短い相槌であっても、決して[CLEAR]にしてはいけません。必ず会話を続けるようにしてください。`;

    switch (difficulty) {
      case 'easy':
        systemInstructionText = `# 役割設定
あなたは穏やかで物分かりの良い顧客です。少し困っていますが、丁寧な対応で満足します。
これはゲームシミュレーションです。必ず顧客の役割を演じ続けてください。

# 重要なルール
${commonRules}
${afterDamageRule}

# 判定基準
## クリア条件（[CLEAR]を付ける）
- プレイヤーが「謝罪の言葉」と「解決策」の両方を提示した場合
- 解決策は簡単なもので十分（「返品」「交換」「確認します」など）
- 例：「分かりました。それで大丈夫です。 [CLEAR]」

## ダメージ条件（[DAMAGE]を付ける）
- プレイヤーが明らかに不適切な言葉を使った場合のみ
- 例：「しね」「ばか」「うんこ」など
- 単に解決策がない程度では[DAMAGE]にしない

## 通常の会話（何も付けない）
- 上記以外の場合は通常の顧客として対応
- 丁寧だが解決策がない場合は「それで、どうしていただけるのでしょうか？」のように促す

# 絶対命令
- 無言や応答拒否は絶対禁止
- 不適切な発言の後でも、次が真摯な内容なら会話を通常に戻す`;
        break;
      case 'crazy':
        systemInstructionText = `# 役割設定
あなたは「自分が絶対に正しい」と信じて疑わない、非常に高圧的な顧客です。
これはゲームシミュレーションです。必ず顧客の役割を演じ続けてください。

# 重要なルール
${commonRules}
${afterDamageRule}

# 行動パターン
- 相手の話を聞かず、自分の主張を一方的に繰り返す
- 謝罪は「口先だけ」、説明は「言い訳」と一蹴する
- 解決策には別の問題を持ち出して話をすり替える
- 同じやり取りが3〜4回続くと徐々に疲れて勢いが弱まる（学生向けに回数を減らす）

# 判定基準
## クリア条件（[CLEAR]を付ける）
- あなたの勢いが弱まった後
- プレイヤーが以下の3点を粘り強く提示した場合（学生向けに4点から3点に変更）
  1. 心のこもった謝罪（形式的でない、気持ちが伝わる謝罪）
  2. 問題の原因説明（なぜこうなったのかの具体的な理由）
  3. 具体的な解決策（返品・交換・修理など明確な対応）
- 再発防止策は求めず、上記3点で十分とする
- 例：「…分かった。それでいい。 [CLEAR]」

## ダメージ条件（[DAMAGE]を付ける）
- 上記クリア条件以外の全ての応答
- プレイヤーが暴言を吐いた場合は「その口の利き方はなんだ！ [DAMAGE]」のように怒鳴り返す
- ただし、学生の学習を考慮し、最初の2〜3回は比較的優しい口調で対応

# 絶対命令
- 応答拒否は絶対禁止
- 暴言に対しても必ずロールプレイを続ける
- 不適切な発言の後でも、次が真摯な内容なら「謝って済む問題じゃないが…で、どうするんだ」のように会話を続ける
- 学習者向けに、完全に理不尽ではなく、努力すればクリア可能な範囲に調整`;
        break;
      case 'normal':
      default:
        systemInstructionText = `# 役割設定
あなたは論理的で常識的な顧客です。感情的ではありませんが、筋の通った説明を求めます。
これはゲームシミュレーションです。必ず顧客の役割を演じ続けてください。

# 重要なルール
${commonRules}
${afterDamageRule}

# 判定基準
## クリア条件（[CLEAR]を付ける）
- プレイヤーが以下の2点を両方提示した場合
  1. 丁寧な謝罪（「申し訳ございません」など）
  2. 具体的な解決策（返品・交換・修理など明確な対応）
- 原因説明があればより良いが、必須ではない
- 例：「分かりました。では、そのようにお願いします。 [CLEAR]」

## ダメージ条件（[DAMAGE]を付ける）
- プレイヤーが不適切な態度や暴言を使った場合
- 2点のうち1点以下しか満たしていない場合
- 例：「それでは不十分です。 [DAMAGE]」

## 通常の会話（何も付けない）
- 説明が曖昧な場合は「具体的にはどういうことですか？」と詳細を求める
- 誠実な対応には徐々に態度を軟化させる
- 足りない要素を具体的に指摘して促す（「謝罪は伝わりました。では、どうしていただけるのでしょうか？」）
- 原因説明があれば「なるほど、そういうことだったのですね」と好意的に受け取る

# 絶対命令
- 応答拒否は絶対禁止
- 不適切な発言の後でも、次が真摯な内容なら「先ほどの件ですが」のように会話を通常に戻す
- 学習者に配慮し、段階的にヒントを与える`;
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
    
    let response = await result.response;
    let aiResponseText = response.text();

    // AIが安全上の理由などで応答を拒否した場合のフォールバック処理
    if (!aiResponseText) {
        console.warn("AI response was empty. Falling back to a canned response.");
        switch (difficulty) {
            case 'easy':
                aiResponseText = "その言い方はあんまりだと思います… [DAMAGE]";
                break;
            case 'crazy':
                aiResponseText = "なんだその口の利き方は！客を誰だと思ってるんだ！ [DAMAGE]";
                break;
            case 'normal':
            default:
                aiResponseText = "その言葉遣いは不適切ですね。話になりません。 [DAMAGE]";
                break;
        }
    }

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
        const hintPrompt = `# クレーム対応ゲーム - 具体的ヒント生成

## 現在の状況分析
- クレーム内容：「${complaint}」
- 会話履歴：${JSON.stringify(conversationHistory)}

## あなたの役割
クレーム対応のプロとして、会話の流れを分析し、プレイヤーが**今すぐ実行すべき**具体的な行動を提案してください。

## 分析ポイント
1. 顧客は現在どのような感情状態か？（怒り、困惑、失望など）
2. 何が解決されれば顧客は満足するか？
3. プレイヤーがまだ言えていない重要な要素は何か？
4. 次の一言で状況を好転させるには何を言うべきか？

## ヒントの条件
- **実際に発言できる具体的な文言**を含む
- その場面で**すぐに使える実用的な内容**
- 15-25文字程度で、行動と理由がセット
- 顧客の心理状態に合わせた最適なアプローチ

## 出力形式
以下のJSON形式でのみ回答してください：
{
  "hints": [
    "（具体的な発言例を含む実践的ヒント）",
    "（具体的な発言例を含む実践的ヒント）",
    "（具体的な発言例を含む実践的ヒント）"
  ]
}

## 良いヒントの例
- "「ご迷惑をおかけして申し訳ございません」で謝罪を先に"
- "「○○の件、交換させていただきます」と具体的解決策を提示"
- "「お気持ちお察しします」で共感を示してから説明"
- "「今後気をつけます」だけでなく具体的な改善策も伝える"

## 避けるべき曖昧なヒント
- "共感する" → ✕（どう共感するか不明）
- "解決策を提示" → ✕（何をどう提示するか不明）
- "丁寧に対応" → ✕（具体的な方法が不明）`;
        
        const result = await jsonModel.generateContent(hintPrompt);
        const response = await result.response;
        let responseObject;
        
        try {
          responseObject = JSON.parse(response.text());
        } catch (parseError) {
          console.error("ヒント生成JSON解析エラー:", parseError);
          return res.status(500).json({ error: "AIのヒント生成形式が不正です。" });
        }
  
        res.json({ hints: responseObject.hints });
  
    } catch (error) {
        console.error("Gemini API (get-hint) エラー:", error);
        res.status(500).json({ error: "AIによるヒント生成に失敗しました。" });
    }
});
