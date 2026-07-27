const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 요청만 허용됩니다.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: '서버에 GEMINI_API_KEY 환경변수가 설정되지 않았습니다.'
    });
  }

  const { mood, mbti } = req.body || {};
  if (typeof mood !== 'string' || !mood.trim() || typeof mbti !== 'string' || !mbti.trim()) {
    return res.status(400).json({ error: '기분과 MBTI를 모두 입력해 주세요.' });
  }

  if (mood.length > 300 || !/^[EI][NS][TF][JP]$/.test(mbti)) {
    return res.status(400).json({ error: '입력값을 확인해 주세요.' });
  }

  const prompt = `
당신은 친근하고 센스 있는 한국 음식 메뉴 큐레이터입니다.
사용자의 현재 기분과 MBTI를 참고하여 오늘 먹기 좋은 음식 메뉴를 추천하세요.
MBTI를 과학적 진단처럼 단정하지 말고 재미 요소로만 가볍게 반영하세요.

사용자 기분: ${mood.trim()}
사용자 MBTI: ${mbti}

다음 형식으로 한국어로 간결하게 답하세요.
🍽️ 오늘의 추천 메뉴: [메뉴 1개]
💡 추천 이유: [기분과 상황에 맞는 이유 2문장]
🥤 함께 먹으면 좋은 것: [사이드 또는 음료 1개]
🔄 다른 선택지: [대체 메뉴 2개]

알레르기나 건강 상태를 알 수 없으므로 의료적 조언은 하지 말고, 필요한 경우 식재료를 확인하라는 짧은 안내를 덧붙이세요.
`.trim();

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 450
          }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error('Gemini API error:', data);
      return res.status(response.status).json({
        error: data?.error?.message || 'Gemini API 요청에 실패했습니다.'
      });
    }

    const recommendation = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('')
      .trim();

    if (!recommendation) {
      return res.status(502).json({ error: 'AI 응답에서 추천 내용을 찾지 못했습니다.' });
    }

    return res.status(200).json({ recommendation });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: '서버에서 요청을 처리하지 못했습니다.' });
  }
}
