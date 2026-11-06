export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Nhận dữ liệu giá từ máy bơm Python
    const payload = await request.json();
    const { ticker, current_price } = payload;

    if (!ticker || !current_price) {
      return new Response('Thiếu mã cổ phiếu hoặc giá', { status: 400 });
    }

    const SUPABASE_URL = "https://sppfnxugcyyfhyrqmoag.supabase.co";
    // Secret Key sẽ được bảo mật tuyệt đối qua biến môi trường của Cloudflare
    const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY; 

    // Gửi lệnh cập nhật giá vào Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/live_positions?ticker=eq.${ticker}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ current_price: current_price })
    });

    if (!response.ok) {
       const err = await response.text();
       return new Response('Lỗi từ Supabase: ' + err, { status: 500 });
    }

    return new Response(JSON.stringify({ 
      status: "Triage Updated", 
      ticker: ticker, 
      price: current_price 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response('Lỗi máy chủ Gateway: ' + error.message, { status: 500 });
  }
}
