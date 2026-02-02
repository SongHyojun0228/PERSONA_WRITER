require('dotenv').config({ override: true });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ .env 파일에서 GEMINI_API_KEY를 찾을 수 없습니다.");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error("❌ 에러 발생:", data.error.message);
      return;
    }

    console.log("✅ 사용 가능한 모델 목록:");
    data.models.forEach(m => console.log(`- ${m.name.replace('models/', '')}`));
    
  } catch (error) {
    console.error("❌ 네트워크 오류:", error);
  }
}

listModels();