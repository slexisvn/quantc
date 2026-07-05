# Q-World: Derivatives Pricing & Quantitative Risk — Từ Zero đến Desk Quant

> Giáo trình nhập môn → nâng cao về thế giới Q (risk-neutral measure): định giá phái sinh, mô hình hóa volatility, lãi suất, FX/commodities, phương pháp số, credit, XVA, và vốn quy định (FRTB). Viết theo chuẩn industry sell-side hiện tại (2026: hậu-LIBOR, multi-curve, XVA, FRTB). Mọi khái niệm đi kèm ví dụ tính bằng số cụ thể và dẫn xuất đầy đủ. Cuốn song song về thế giới P (alpha research, buy-side) nằm ở `docs/p-world.md`.

---

## Mục lục

### Phần I — Nền tảng

1. Quant là gì — và hai thế giới P vs Q
2. Nền tảng tài chính
3. Toán xác suất và quá trình ngẫu nhiên
4. No-arbitrage và định giá risk-neutral

### Phần II — Vanilla & Volatility

5. Black-Scholes và Greeks
6. Volatility
7. Fourier và transform pricing
8. Equity exotics

### Phần III — Lãi suất & các asset class

9. Lãi suất
10. FX derivatives
11. Commodities và inflation

### Phần IV — Phương pháp số

12. Phương pháp số: Monte Carlo, PDE, American MC, AAD

### Phần V — Credit, XVA, Vốn quy định

13. Credit
14. XVA
15. Vốn quy định (Basel, FRTB, SA-CCR, SIMM)

### Phần VI — Sản phẩm cấu trúc & chuyên sâu

16. Convertible bonds và hybrid capital
17. MBS, callable bonds và OAS
18. Rates exotics (Bermudan, TARN, snowball, range accrual, CMS spread, PRDC)

### Phần VII — Nghề

19. Kiến trúc pricing library và model validation
20. Lộ trình học và tài nguyên

### Phụ lục

- A. Từ điển thuật ngữ Q-world
- B. Case studies — phân tích định lượng

---

# Chương 1: Quant là gì — và hai thế giới P vs Q

## 1.1 Quant là ai

"Quant" (quantitative analyst) là người dùng toán, thống kê, và lập trình để giải các bài toán tài chính. Nghề này sinh ra từ thập niên 1970–1980 khi hai thứ hội tụ: (1) công thức Black-Scholes (1973) biến việc định giá option từ nghệ thuật thành khoa học, và (2) máy tính đủ rẻ để chạy mô hình. Các physicist và mathematician rời academia sang Wall Street — biệt danh "rocket scientists" — và xây nên nghề quant hiện đại.

Trước Black-Scholes, người ta định giá option kiểu chợ: nhìn cung cầu, kinh nghiệm, và một chút cảm tính về "option này đắt hay rẻ". Đóng góp cách mạng của Black, Scholes và Merton không phải là một con số giá, mà là một *lập luận*: nếu bạn có thể **tái tạo** (replicate) payoff của option bằng cách nắm giữ một lượng cổ phiếu thay đổi liên tục cộng vay/gửi tiền mặt, thì chi phí của chiến lược tái tạo đó *chính là* giá option — nếu không, có arbitrage. Lập luận này chuyển câu hỏi từ "option đáng giá bao nhiêu?" (chủ quan, phụ thuộc khẩu vị rủi ro) sang "tái tạo nó tốn bao nhiêu?" (khách quan, đọc được từ giá thị trường). Chính cú xoay trục đó đẻ ra toàn bộ Q-world. Ta sẽ gặp lại nó ở dạng chặt chẽ trong Chương 4 và Chương 5; ở đây chỉ cần nắm tinh thần: **giá derivative là chi phí sản xuất lại nó, không phải kỳ vọng về tương lai.**

Ngày nay quant chia thành hai "thế giới" lớn, đặt tên theo hai **probability measure** (độ đo xác suất) mà họ làm việc:

| | **Q-world** (measure Q) | **P-world** (measure P) |
|---|---|---|
| Câu hỏi trung tâm | "Giá **hợp lý** của derivative này là bao nhiêu **hôm nay**?" | "Giá tài sản sẽ **thực sự** đi đâu **ngày mai**?" |
| Measure | Risk-neutral (Q) — xác suất "nhân tạo" để định giá | Real-world / physical (P) — xác suất thực tế |
| Nơi làm việc | Sell-side: ngân hàng đầu tư (Goldman, JPMorgan, Citi, BofA...), một phần buy-side (vol funds) | Buy-side: hedge funds (Citadel, Two Sigma...), asset managers, prop trading |
| Công cụ toán | Stochastic calculus, PDE, measure theory, numerical analysis | Statistics, econometrics, machine learning, optimization |
| Dữ liệu | Ít nhưng "sạch": giá quoted của instruments thanh khoản, dùng để **calibrate** mô hình | Nhiều và bẩn: lịch sử giá, fundamentals, alternative data, dùng để **estimate** |
| Horizon | Hôm nay (pricing) và đời sống deal (hedging, 30 năm với swap) | Ngày mai đến vài tháng (dự báo) |
| Rủi ro chính | Model risk: mô hình sai → hedge sai → lỗ | Estimation risk: tín hiệu là noise → chiến lược lỗ |
| Sách kinh điển | Hull, Shreve, Gatheral, Brigo-Mercurio, Andersen-Piterbarg | Grinold-Kahn, López de Prado, Chan |

Cách nhớ nhanh: **Q định giá cái phức tạp bằng cái đơn giản** (dùng giá thị trường của instruments thanh khoản để suy ra giá derivative phức tạp, không cần đoán tương lai). **P dự đoán tương lai** (tìm tín hiệu thống kê để kiếm lời).

Sự đối lập sâu nhất giữa hai thế giới nằm ở chỗ họ *tin* điều gì về xác suất. P-quant hỏi: "Xác suất thực để cổ phiếu này tăng 10% trong tháng tới là bao nhiêu?" — một câu hỏi thống kê, trả lời bằng dữ liệu lịch sử và mô hình dự báo, và sai số ước lượng là kẻ thù. Q-quant thì gần như *không quan tâm* xác suất thực đó. Họ làm việc với một xác suất bịa ra — measure Q — được thiết kế sao cho **giá đã chiết khấu của mọi tài sản giao dịch được là một martingale** dưới Q. Nói nôm na cho dễ nhớ: trung bình mà nói, mọi tài sản "trôi" đúng bằng lãi suất phi rủi ro $r$ dưới Q (phát biểu chặt hơn là *gains process đã chiết khấu của tradable assets* là martingale — nên cổ phiếu trả cổ tức trôi $r-q$, một cặp FX dính lãi suất đồng tiền kia, và khi lãi suất là ngẫu nhiên thì $V_0 = \mathbb{E}^{\mathbb{Q}}[D(0,T)\,X_T]$ với $D$ là discount factor ngẫu nhiên, chứ không phải luôn luôn $e^{-rT}\mathbb{E}^{\mathbb{Q}}[X_T]$). Nghe vô lý (cổ phiếu rõ ràng kỳ vọng tăng nhanh hơn trái phiếu chính phủ), nhưng chính sự "vô lý" đó là mẹo: trong trường hợp đơn giản nhất — lãi suất tất định, không cổ tức — giá mọi derivative gọn lại thành kỳ vọng chiết khấu của payoff, $V_0 = e^{-rT}\mathbb{E}^{\mathbb{Q}}[\text{payoff}]$, và con số ra khớp với chi phí hedge trong thế giới thực. Chương 4 sẽ chứng minh vì sao một xác suất bịa lại cho ra giá đúng ngoài đời — câu trả lời là no-arbitrage, không phải phép màu.

Một minh họa số nhỏ cho thấy P và Q khác nhau đến mức nào. Giả sử cổ phiếu $S_0 = 100$, sau một năm chỉ có hai kịch bản: lên $S_u = 120$ hoặc xuống $S_d = 90$; lãi suất $r = 5\%$ (nên $e^{r} = 1.0513$). Nhà đầu tư P-world có thể tin xác suất *thực* lên là $p = 70\%$ vì họ lạc quan. Nhưng để định giá một call strike $K = 105$, Q-quant tính xác suất *risk-neutral*: ta cần $q$ sao cho kỳ vọng chiết khấu của cổ phiếu bằng giá hiện tại, tức $S_0 = e^{-r}\big(q S_u + (1-q) S_d\big)$. Giải ra:

$$q = \frac{S_0 e^{r} - S_d}{S_u - S_d} = \frac{100 \times 1.0513 - 90}{120 - 90} = \frac{105.13 - 90}{30} = \frac{15.13}{30} = 0.5043.$$

Payoff call là $\max(120-105,0)=15$ ở kịch bản lên, $0$ ở kịch bản xuống. Giá call:

$$C = e^{-r}\big(q \cdot 15 + (1-q)\cdot 0\big) = 0.9512 \times 0.5043 \times 15 = 7.20.$$

Chú ý điều then chốt: con số $p = 70\%$ (niềm tin thực của nhà đầu tư) **không xuất hiện ở đâu cả** trong giá. Dù bạn tin cổ phiếu chắc chắn lên hay chắc chắn xuống, giá call vẫn là 7.20, vì nó bằng chi phí tái tạo. Đó là toàn bộ tinh thần Q-world gói trong một phép tính. P-quant sống chết với việc $p$ bằng bao nhiêu; Q-quant loại $p$ ra khỏi bài toán.

Phân loại P/Q này đến từ bài essay nổi tiếng của Attilio Meucci, *"P versus Q: Differences and Commonalities between the Two Areas of Quantitative Finance"* (2011) — nên đọc sau khi học xong cả hai tài liệu này. Ranh giới không tuyệt đối: một vol fund giao dịch variance risk premium sống ở cả hai (bán vol theo giá Q, đặt cược rằng realized vol theo P sẽ thấp hơn — xem cuốn P-world). Nhưng với mục đích học, cứ giữ hai thế giới tách bạch; ghép chúng lại là việc của những chương cuối và của cả sự nghiệp.

## 1.2 Tại sao Q-world tồn tại: ngân hàng bán derivative

Hãy hiểu business model trước khi học toán. Một ngân hàng đầu tư (sell-side) hoạt động như **chợ + xưởng sản xuất** phái sinh. Hai ẩn dụ này không thừa: "chợ" là vai market-maker — ngân hàng đứng giữa, sẵn sàng mua và bán, ăn spread bid-ask; "xưởng sản xuất" là vai manufacturer — ngân hàng nhận đơn đặt hàng một payoff mà thị trường không có sẵn (một autocallable kỳ lạ, một swap 30 năm cấu trúc riêng) rồi *chế tạo* payoff đó từ nguyên liệu là các instrument thanh khoản. Q-quant là kỹ sư của xưởng đó.

1. **Client cần hedge rủi ro.** Hãng hàng không muốn cố định giá xăng dầu tương lai. Doanh nghiệp xuất khẩu muốn khóa tỷ giá. Quỹ hưu trí muốn bảo vệ danh mục khỏi lãi suất giảm. Họ đến ngân hàng mua derivative: forward, swap, option. Điểm chung: khách hàng *có sẵn một rủi ro tự nhiên* (giá dầu, tỷ giá, lãi suất) và muốn chuyển nó sang người khác. Ngân hàng là người nhận.
2. **Ngân hàng bán derivative và thu spread.** Bán một option cho client với giá $V + \text{spread}$, trong đó $V$ là "giá hợp lý". Spread là phần thưởng cho dịch vụ (làm giá, chịu rủi ro tồn kho, vận hành hạ tầng), không phải cược vào hướng thị trường.
3. **Ngân hàng KHÔNG muốn giữ rủi ro.** Sau khi bán, ngân hàng **hedge** — mua/bán các instruments khác để trung hòa rủi ro. Nếu hedge hoàn hảo, ngân hàng bỏ túi spread bất kể thị trường đi đâu. Một desk lành mạnh là một desk *phẳng* (flat): tổng độ nhạy với mọi yếu tố thị trường gần bằng không sau khi hedge, và P&L đến từ spread cộng với việc quản trị các rủi ro bậc cao còn sót lại. "Phẳng" ở đây là mục tiêu, không phải mô tả thực trạng từng phút: tùy dòng lệnh của client, một desk có thể tạm net **long** hoặc **short** vol, và luôn ôm một mớ rủi ro không hedge sạch được — inventory, skew, correlation, basis, jump. Nói "desk bán vol chứ không bán hướng" là một lý tưởng hóa hữu ích; chính xác hơn phải nói desk **cố tách riêng và quản trị phần directional** để P&L không phụ thuộc hướng thị trường.

Vai trò của Q-quant nằm ở bước 2 và 3:
- **Giá hợp lý $V$ là bao nhiêu?** → pricing model.
- **Hedge bằng gì, số lượng bao nhiêu?** → Greeks (độ nhạy của $V$ theo các yếu tố thị trường).
- **Nếu counterparty phá sản thì sao?** → XVA.
- **Ngân hàng phải giữ bao nhiêu vốn cho position này?** → FRTB, Basel.

Điểm mấu chốt — và là insight sâu nhất của cả Q-world: **vì ngân hàng hedge, giá của derivative không phụ thuộc vào kỳ vọng thị trường đi lên hay xuống**. Giá chỉ phụ thuộc vào chi phí tái tạo (replicate) payoff bằng các instruments khác. Đây là lý do measure Q "risk-neutral" tồn tại — chương 4 sẽ chứng minh chặt chẽ.

### 1.2.1 Vì sao hedge làm giá độc lập với dự báo — trực giác định lượng

Câu "giá không phụ thuộc kỳ vọng" là câu dễ nói khó tin, nên ta mổ xẻ nó bằng một lập luận cận-định-lượng trước khi Chương 5 làm chặt. Hãy dùng đúng call vanilla chuẩn của cả sách: $S_0=100$, $K=100$, $r=5\%$, $\sigma=20\%$, $T=1$, không dividend. Black-Scholes cho giá $C=10.45$ và delta $\Delta = N(d_1) = 0.637$ (ta sẽ dẫn xuất mọi con số này ở Chương 5; giờ mượn tạm).

Giả sử desk bán call này và ngay lập tức mua $\Delta = 0.637$ đơn vị cổ phiếu để hedge. Position ròng của desk là "bán call cộng giữ 0.637 cổ phiếu". Bây giờ tưởng tượng cổ phiếu nhích lên một chút, $dS = +1$ (từ 100 lên 101). Phần cổ phiếu lời $0.637 \times 1 = +0.637$. Phần call mà desk đã bán thì lỗ, vì call đắt lên — nhưng lỗ *đúng bằng* $\Delta \times dS = 0.637$ ở bậc nhất (đó chính là định nghĩa của delta). Hai khoản triệt tiêu. Nếu cổ phiếu rơi $dS=-1$, cổ phiếu lỗ 0.637, call rẻ đi giúp desk lời 0.637 — lại triệt tiêu. **Ở bậc nhất, P&L của desk bằng không cho mọi chuyển động của $S$, lên hay xuống.** Không có chỗ nào để "dự báo hướng" chen vào — hướng đã bị delta hedge nuốt sạch.

Cái *còn lại* sau khi triệt tiêu bậc nhất mới là nơi tiền thật sự chảy. Khai triển Taylor giá call theo $S$:

$$dC \approx \Delta\, dS + \tfrac{1}{2}\Gamma\, (dS)^2 + \Theta\, dt.$$

Số hạng $\Delta\,dS$ đã bị hedge khử. Còn lại **ba** thứ: gamma term $\tfrac{1}{2}\Gamma (dS)^2$, theta term $\Theta\, dt$, và — khoản dễ quên nhất — **chi phí tài trợ** phần cổ phiếu hedge. Desk bỏ ra $\Delta S = 0.637 \times 100 = 63.7$ để mua cổ phiếu nhưng chỉ thu về $C = 10.45$ từ việc bán call, nên phải đi vay ròng $\Delta S - C = 53.25$; một ngày lãi vay là $53.25 \times 0.05/365 = 0.0073$. Với call chuẩn của ta, $\Gamma = 0.0188$ và $\Theta \approx -6.41$/năm ($\approx -0.0176$/ngày). Giả sử trong một ngày cổ phiếu nhảy $dS = 1$ (tức 1%). Desk bán call nên có gamma *âm*: khoản gamma lỗ là $\tfrac{1}{2}\times 0.0188 \times 1^2 = 0.0094$. Theta có lợi cho người bán option (option mất giá theo thời gian, người bán hưởng): khoản theta lời là $|\Theta|\, dt = 6.41/365 = 0.0176$. Nhưng financing ăn mất $0.0073$. Ròng ngày đó: $-0.0094 + 0.0176 - 0.0073 = +0.0009$ — gần bằng **không**, chứ không phải $+0.0082$ như khi quên khoản financing.

Con số gần-không đó mới là chữ ký thật của một vol desk, và nó chỉ hiện ra *sau khi* đã trừ financing. Gộp cả ba số hạng lại (dùng đúng $\Theta$ của Black-Scholes, vốn đã "nuốt" sẵn phần carry $rS\Delta - rC$ qua PDE định giá), P&L một ngày của position delta-hedged rút gọn thành một biểu thức sạch:

$$d\Pi \approx \tfrac{1}{2}\Gamma\big[\sigma^2 S^2\, dt - (dS)^2\big].$$

Nói cách khác desk **so realized với implied**: nếu bình phương chuyển động thực $(dS)^2$ nhỏ hơn phương sai đã bán $\sigma^2 S^2\, dt$, desk lời; nếu lớn hơn, desk lỗ. Chuyển động implied một ngày là $\sigma S\sqrt{dt} = 0.20 \times 100 \times \sqrt{1/365} = 1.047$; cú nhảy thực $dS = 1$ (1%) nhỏ hơn chút xíu nên desk lời đúng khoản $0.0009$ tí hon — kiểm chứng lại: $\tfrac{1}{2}\times 0.0188 \times (1.047^2 - 1^2) = 0.0009$. Người bán option **kiếm theta, trả gamma và trả financing**; cái quyết định lời/lỗ **không phải index lên hay xuống**, mà là **realized vol so với implied vol**. Đó chính xác là ý ta muốn nói khi bảo desk "bán vol chứ không bán hướng" (hiểu như lý tưởng hóa ở 1.2). Điểm hòa vốn nằm đúng ở $\sigma = 20\%$ đã bán: nếu realized vol đúng bằng 20% qua cả năm, gamma, theta và financing triệt tiêu trọn vẹn và desk giữ đúng spread ban đầu. Ta sẽ biến lập luận này thành đẳng thức chính xác (P&L của delta-hedged option = tích phân của gamma nhân chênh lệch phương sai) ở Chương 5.3.

### 1.2.2 Ví dụ bằng số: vòng đời một deal từ đầu đến cuối

Theo dõi một deal cụ thể để thấy từng vai trò ăn khớp thế nào. Client (một quỹ hưu trí) muốn mua **call option châu Âu 1 năm, ATM, trên index đang ở 100, notional 10 triệu USD** (tức 100.000 đơn vị index).

1. **Sales** nhận yêu cầu, hỏi desk trading giá.
2. **Trader** nhìn vol surface: implied vol ATM 1Y đang ở 20% (mid). Trader quyết định quote bán ở **20.5%** — ăn spread 0.5 vol point.
3. **Pricing model của quant** chuyển vol thành tiền: với call ATM-spot ($S=K=100$) nên $d_1 = 0.35$ và $\phi(d_1) = 0.375$; vega ≈ $S\phi(d_1)\sqrt{T} \approx 100 \times 0.375 \times 1 = 37.5$ trên 100 đơn vị spot, tức **~0.375% notional cho mỗi vol point**. Spread 0.5 vol → ngân hàng thu chênh ~**0.19% notional ≈ 18.750 USD** so với giá mid.
4. Deal khớp. Model tính **delta spot** $= N(d_1) \approx 0.637$; nhưng vì hedge bằng **futures**, số hợp đồng phải giữ là **futures delta** $= e^{-rT}N(d_1) = 0.9512 \times 0.637 \approx 0.606$ → trader lập tức **mua ~6.06 triệu USD index futures** để hedge. Từ giờ ngân hàng không quan tâm index lên hay xuống (ở bậc nhất).
5. Mỗi ngày sau đó: hệ thống risk chạy batch qua đêm tính lại Greeks; trader **rebalance delta** (index lên → delta call tăng → mua thêm; xuống → bán bớt); risk system kiểm tra vega/gamma limits của cả book.
6. Sau 1 năm: nếu hedge tốt và realized vol ≈ 20%, P&L tích lũy của ngân hàng ≈ 18.750 USD spread ban đầu ± friction (chương 5.3 sẽ chứng minh chính xác vì sao). Ngân hàng chưa bao giờ đặt cược vào hướng đi của index — nó bán **vol** ở 20.5% và "sản xuất" lại vol đó bằng delta hedging với giá thành ≈ realized vol.

Mọi khái niệm của tài liệu này đều nằm trong 6 bước trên: pricing model (bước 3), Greeks và hedging (4–5), P&L của vol (6), còn XVA/capital là các lớp điều chỉnh bổ sung khi counterparty không phải sàn giao dịch mà là đối tác OTC có thể vỡ nợ.

Chú ý một tiểu tiết trong bước 4 dễ bị lướt qua nhưng đắt giá: delta để hedge bằng futures ($0.606$) không bằng delta spot của Black-Scholes ($0.637$). Sao cùng một option lại có hai con số? Vì "delta" luôn phải kèm câu hỏi "độ nhạy theo *cái gì*". Delta spot $N(d_1) = 0.637$ là độ nhạy của giá option theo giá **cổ phiếu** — số cổ phiếu phải giữ nếu hedge bằng chính cổ phiếu. Nhưng ở đây desk hedge bằng **futures**, và độ nhạy của giá option theo giá futures là $e^{-rT}N(d_1) = 0.9512 \times 0.637 = 0.606$. Chênh lệch đúng bằng discount factor $e^{-rT}$, và điều then chốt: nó **không** đến từ việc "bỏ drift" — với $S = K = 100$, số hạng drift $r + \tfrac{1}{2}\sigma^2 = 0.07$ vẫn nằm nguyên trong $d_1 = 0.35$ — mà đến từ chỗ một hợp đồng futures không đòi vốn trả trước, nên một đơn vị exposure qua futures "rẻ" hơn qua cổ phiếu đúng một hệ số chiết khấu. (Đừng lẫn với con số $0.54$ mà đôi khi bạn nghe gán cho "call ATM 1Y vol 20%": đó là driftless delta $N(\tfrac{1}{2}\sigma\sqrt{T}) = N(0.10)$ của một option ATM-**forward**, tức strike $\approx 105.13$ chứ không phải 100 — một option *khác*, không phải cùng deal này nhìn theo quy ước khác.) Bài học sớm: "delta" không phải một con số duy nhất mà là cả một họ quy ước (spot, forward, futures, driftless), và chọn nhầm quy ước là một trong những nguồn lỗi hedge phổ biến nhất của junior quant. Chương 5 sẽ tách bạch chúng. Ở đây chỉ cần ghi nhớ: khi ai đó đọc cho bạn một con "delta", câu hỏi đầu tiên phải là "delta theo quy ước nào, theo cái gì?".

### 1.2.3 Một mảnh của cross-asset: day count không phải chuyện vặt

Để thấy Q-world sống bằng những chi tiết nhỏ, xét một mẩu tính lãi tưởng như tầm thường. Giả sử desk rates cho vay 100 triệu USD trong khoảng thời gian danh nghĩa "3 tháng" ở lãi suất quoted 4%. Số tiền lãi bằng bao nhiêu? Câu trả lời phụ thuộc **day count convention** — quy ước đếm ngày để quy "4% một năm" thành lãi của quãng thời gian cụ thể. Quy ước phổ biến trên thị trường tiền tệ USD là **ACT/360**: đếm số ngày thực tế rồi chia cho 360.

Giả sử quãng đó có đúng 92 ngày thực. Year fraction là $\tau = 92/360 = 0.25556$. Lãi:

$$\text{Interest} = 100{,}000{,}000 \times 4\% \times 0.25556 = 100{,}000{,}000 \times 0.010222 = 1{,}022{,}222 \text{ USD}.$$

Nếu ai đó cẩu thả dùng $\tau = 0.25$ (coi "3 tháng = 1/4 năm"), họ ra $1{,}000{,}000$ — lệch **22.222 USD** trên một giao dịch, chỉ vì sai một quy ước đếm ngày. Nhân con số đó với hàng vạn dòng cash flow trong book và bạn hiểu vì sao mọi pricing library đều có một module day-count được test kỹ đến từng ngày lễ. Cùng "4%" đó, nếu quy ước là **ACT/365** (thị trường GBP hay dùng), year fraction thành $92/365 = 0.25205$ và lãi thành $1{,}008{,}219$ USD — lại một con số khác. Bài học: trong Q-world, một "lãi suất" trần trụi là vô nghĩa cho tới khi kèm day count, compounding frequency, và business-day convention. Ta sẽ gặp lại bộ quy ước này một cách hệ thống ở Chương 2 (nền tảng tài chính) và Chương 9 (rates), nhưng nó đáng xuất hiện ngay từ đây để đặt đúng kỳ vọng về mức độ tỉ mỉ mà nghề đòi hỏi.

## 1.3 Bản đồ các desk và asset class

Sell-side chia theo asset class, mỗi desk có quant riêng vì toán mỗi mảng khác nhau đáng kể. Lý do của sự chia tách này không phải hành chính mà là *bản chất toán học*: dynamics của một cổ phiếu (một biến trạng thái, vol surface hai chiều) khác căn bản với dynamics của một đường cong lãi suất (cả một đường cong biến động, cần mô hình term-structure nhiều nhân tố), khác với một đồng tiền chéo (hai nền lãi suất cộng một tỷ giá), khác với tín dụng (biến nhảy vỡ nợ, không liên tục). Một quant giỏi rates chưa chắc pricing nổi một exotic credit, và ngược lại. Dưới đây là bản đồ:

- **Equity Derivatives (EQD)** — options trên cổ phiếu/index, exotics (autocallables, barriers, baskets), structured products. Toán: vol surface, local/stochastic vol, correlation. Đây là mảng "cổ điển" nhất, nơi Black-Scholes ra đời và nơi hầu hết quant học nghề. Cạm bẫy đặc trưng: skew (smile lệch) và correlation giữa các underlying trong basket.
- **Rates (Fixed Income)** — swaps, swaptions, caps/floors, Bermudans, callable bonds. Toán: curve construction đa đường cong, term-structure models (Hull-White, LMM). Notional lớn nhất thị trường (interest rate swaps là thị trường derivative lớn nhất thế giới, hàng trăm nghìn tỷ USD notional). Đây là mảng "nặng ký" nhất theo nghĩa đen về khối lượng, và cũng phức tạp nhất về hạ tầng curve sau cải cách multi-curve.
- **FX** — forwards, FX options, barriers/touches. Toán: giống equity nhưng có 2 đồng tiền → 2 measure, smile rất chuẩn hóa (quoted theo delta: risk reversal, butterfly). Vì tính đối xứng giữa hai đồng tiền, FX có những đẳng thức đẹp (một call USD/JPY là một put JPY/USD) mà quant FX phải thuộc lòng.
- **Credit** — CDS, CDS index (CDX/iTraxx), CLO. Toán: hazard rates, copulas. Từng là mảng nóng nhất trước 2008 (CDO), giờ thu nhỏ nhưng vẫn quan trọng. Rủi ro ở đây có tính chất *nhảy*: một tên tuổi vỡ nợ là một sự kiện rời rạc, không phải một chuyển động liên tục — nên toán và cạm bẫy hoàn toàn khác equity/rates.
- **Commodities** — dầu, khí, điện, kim loại, nông sản. Toán: seasonality, mean reversion, storage. Điện gần như không lưu trữ được nên có spike giá điên rồ; khí có mùa; dầu có convenience yield. Mỗi hàng hóa gần như là một asset class con.
- **XVA desk** — desk trung tâm quản lý rủi ro counterparty và funding của TẤT CẢ derivative trong ngân hàng. Ra đời sau 2008. Toán nặng nhất về mặt tính toán (Monte Carlo trên toàn portfolio). Đây là desk duy nhất nhìn cả ngân hàng như một danh mục, chứ không theo asset class.
- **Risk / Capital** — không phải trading desk, nhưng dùng nhiều quant: tính VaR/ES, FRTB capital, stress testing, model validation.

Một cách khác để đọc bản đồ này là hình dung dòng chảy của một deal khi nó đi qua ngân hàng. Client gọi cho **sales**; sales hỏi giá **trader** ở desk asset-class tương ứng; trader dùng **pricing model** do **FO quant** xây (chạy trên **pricing library** do **quant dev** duy trì); sau khi khớp, deal được **risk system** theo dõi Greeks hằng ngày, được **XVA desk** tính phụ phí counterparty, được **risk/capital** tính vốn, và định kỳ mô hình dùng để định giá nó bị **model validation** soi lại. Không một vai nào đứng một mình; sách này sẽ lần lượt trang bị bạn cho từng mắt xích.

## 1.4 Các vai trò quant trong ngân hàng

- **Front Office Quant / Desk Quant (FO quant)** — ngồi cạnh trader, xây pricing model và tool cho desk. Yêu cầu: nhanh, thực dụng, giỏi cả toán lẫn code. Đây là vai trò "kinh điển" khi nói đến Q-quant. Nhịp làm việc theo nhịp thị trường: một model sai lúc 9h sáng có thể thành khoản lỗ thật lúc 9h05. Phần thưởng là gần tiền, gần P&L, gần quyết định.
- **Quant Developer (Quant Dev)** — xây và duy trì pricing library (thường C++ core + Python wrapper), hệ thống risk, hạ tầng tính toán. Ranh giới với FO quant ngày càng mờ; nhiều ngân hàng gộp chung thành "Quant Strats" (thuật ngữ của Goldman). Người ở đây phải nghĩ về kiến trúc: một pricing library tốt phải cho phép thêm một model mới mà không viết lại engine, thêm một instrument mới mà không đụng vào numerics — đúng tinh thần registry + composition mà repo đi kèm sách này theo đuổi.
- **Model Validation / Model Risk (MV quant)** — đội độc lập kiểm định mô hình của FO quant trước khi được dùng (yêu cầu bắt buộc của regulator; hướng dẫn model-risk của Fed là SR 11-7, được cập nhật/thay bằng SR 26-2 từ 17/4/2026). Xây mô hình benchmark độc lập, tìm điểm yếu, viết báo cáo. Nhịp độ chậm hơn FO, phù hợp người thích rigor. MV không phải "cảnh sát" mà là tuyến phòng thủ thứ hai: họ hỏi những câu FO quá bận để hỏi — "model này sai ở regime nào?", "calibration có ổn định không khi thị trường stress?".
- **Risk Quant** — xây mô hình VaR/ES, counterparty exposure, capital. Sau FRTB, mảng này phình to. Họ nhìn rủi ro ở tầng portfolio và tail, nơi câu hỏi không còn là "giá deal này bao nhiêu" mà "cả book mất bao nhiêu trong 1% kịch bản xấu nhất".
- **Research Quant** — ít gặp hơn, làm nghiên cứu dài hạn (mô hình vol mới, phương pháp số mới, gần đây là ML for pricing).

Ở tất cả các vai trò, stack chuẩn hiện tại: **C++** (pricing core, vì tốc độ), **Python** (research, prototyping, glue), và ngày càng nhiều **kiến trúc hiện đại** — AAD cho Greeks, GPU cho Monte Carlo, cloud cho XVA/FRTB batch. Một số shop dùng ngôn ngữ riêng (Goldman: Slang; nói chung là hiếm).

Một cách để thấy vì sao engineering ngày càng quan trọng: xét chi phí tính Greeks. Một book XVA có thể phụ thuộc vào hàng nghìn risk factor (mỗi điểm trên mỗi curve, mỗi điểm trên mỗi vol surface, mỗi credit spread). Tính một Greek bằng bump-and-revalue thô sơ nghĩa là định giá lại toàn bộ portfolio một lần cho mỗi risk factor: với 2.000 risk factor, đó là 2.001 lần định giá đầy đủ (một lần gốc cộng 2.000 lần bump). Nếu một lần định giá Monte Carlo toàn portfolio mất 1 phút, một bộ Greeks đầy đủ mất $2001 \times 1 = 2001$ phút $\approx 33$ giờ — quá lâu cho một batch qua đêm. AAD (adjoint algorithmic differentiation) tính *toàn bộ* gradient trong chi phí cỡ một hằng số nhân (thường 3–5) lần một lần định giá, tức khoảng $5 \times 1 = 5$ phút cho *tất cả* 2.000 Greek. Tỷ lệ tăng tốc ở đây là $2001/5 \approx 400$ lần. Con số này giải thích trọn vẹn vì sao AAD chuyển từ "thủ thuật hay ho" thành "hạ tầng bắt buộc" của mọi XVA desk hiện đại — và vì sao một quant biết AAD có giá trị thị trường cụ thể, đo được bằng giờ batch tiết kiệm. Ta sẽ học AAD ở Chương 12.

## 1.5 Q-world sau 2008: từ "một đường cong" đến "bốn chữ cái"

Khủng hoảng 2008 thay đổi Q-world sâu sắc — hiểu điều này ngay từ đầu sẽ giúp bạn không học nhầm giáo trình cũ:

1. **Trước 2008:** một đường cong LIBOR duy nhất vừa để dự báo lãi suất vừa để chiết khấu; rủi ro counterparty gần như bỏ qua; funding coi như miễn phí.
2. **2008:** Lehman phá sản. Basis giữa LIBOR và OIS (OIS là swap tham chiếu lãi suất qua đêm, được coi như gần phi rủi ro) nổ từ vài bp lên hàng trăm bp. Các giả định "một đường cong" sụp đổ.
3. **Sau 2008:**
   - **Multi-curve framework**: chiết khấu bằng đường cong OIS (dựng từ các RFR như SOFR/€STR/SONIA), dự báo bằng đường cong riêng cho từng tenor. Lưu ý: RFR là *lãi suất tham chiếu*, còn OIS là *sản phẩm* dùng RFR để dựng discount curve.
   - **XVA**: giá derivative giờ = giá "sạch" + một chuỗi điều chỉnh CVA/DVA/FVA/MVA/KVA (chương 14).
   - **Clearing & margin bắt buộc**: phần lớn swap chuẩn phải qua CCP (clearing house); phần còn lại, *nếu thuộc diện bị điều chỉnh* (covered entities vượt ngưỡng), chịu bilateral margin (SIMM) — có threshold và nhiều miễn trừ, không phải mọi swap non-cleared.
   - **FRTB**: viết lại cách tính vốn cho trading book (chương 15) — nhưng triển khai không đồng đều giữa các khu vực; riêng ở Mỹ khung market-risk mới vẫn ở dạng *đề xuất* tính đến 2026.
   - **LIBOR chết (2021–2023)**: chuyển sang SOFR (USD), €STR (EUR), SONIA (GBP) — thay đổi lớn nhất về hạ tầng rates trong 40 năm.

### 1.5.1 Vì sao "một đường cong" phải chết — một phép tính basis

Câu chuyện multi-curve nghe trừu tượng cho tới khi ta gán số. Trước 2008, một quant chiết khấu một cash flow 1 năm và forecast một khoản LIBOR bằng *cùng một* đường cong. Giả sử đường cong đó cho lãi 1Y là 4.00%. Ai vay LIBOR 3 tháng cũng ngầm được coi là an toàn như chính phủ.

Rồi Lehman sập. Bỗng nhiên cho một ngân hàng vay 3 tháng (LIBOR) *rủi ro hơn hẳn* so với một lãi suất tham chiếu overnight gần như phi rủi ro (thể hiện qua OIS — swap chiếu lãi qua đêm, không trao đổi principal như một khoản vay), vì trong 3 tháng đối tác có thể sập, còn rủi ro tín dụng dồn trên một chuỗi lãi qua đêm gần như bằng không. Thị trường bắt đầu đòi phần bù cho rủi ro đó — chính là **LIBOR-OIS basis**. Đặt số cụ thể theo bộ curve chuẩn của sách: giả sử đường cong OIS cho $P(0,1)=0.96154$, tức lãi OIS 1Y $\approx 4.00\%$ (vì $1/0.96154 - 1 = 0.04$) — đúng con số OIS 1Y ta sẽ tái sử dụng khắp sách — trong khi LIBOR 1Y quote ở 4.60% (con số LIBOR này chỉ mang tính minh họa cho quãng hậu-khủng-hoảng, không thuộc bộ running example chuẩn). Basis là:

$$\text{basis} = 4.60\% - 4.00\% = 0.60\% = 60 \text{ bp}.$$

Trước 2008 con số này cỡ 8–10 bp và người ta làm ngơ. Ở đỉnh khủng hoảng nó vọt lên **quanh 360 bp**. Với một swap notional 100 triệu, chỉ riêng basis 60 bp trên một năm đã là $100{,}000{,}000 \times 0.60\% = 600{,}000$ USD — không thể coi là nhiễu. Khoảnh khắc basis đủ lớn để nhìn thấy bằng mắt thường, giả định "một đường cong vừa forecast vừa discount" trở thành sai về nguyên tắc: bạn phải **forecast** LIBOR bằng đường cong LIBOR (đắt hơn) và **discount** bằng đường cong OIS/RFR (rẻ hơn, phi rủi ro hơn). Đó là toàn bộ hạt nhân của multi-curve, và nó sinh ra từ đúng con số basis không thể phủ nhận này. Chương 9 sẽ dựng cả bộ máy đó; ở đây chỉ cần thấy một khủng hoảng thanh khoản đã ép cả một ngành đổi cách chiết khấu như thế nào.

### 1.5.2 Vì sao "giá sạch" không còn là giá — một phép tính XVA

Lớp điều chỉnh thứ hai của thời hậu-2008 là XVA, và cũng nên chạm vào bằng số ngay từ Chương 1 để nó thôi trừu tượng. Trước 2008, nếu model nói một swap trị giá 0 (at-market), quant ghi 0 và đi tiếp. Sau 2008, ta hỏi thêm: *nếu đối tác vỡ nợ giữa chừng thì sao?* Ngân hàng đang có một khoản phải-thu tương lai (expected exposure) từ đối tác; nếu họ sập, ta mất phần đó (trừ recovery). Phần bù cho rủi ro này là **CVA** (credit valuation adjustment).

Dùng đúng running example của sách: swap payer 10 năm, notional 100 triệu, expected-exposure profile hình bướu đỉnh khoảng 2.3 triệu quanh năm 4–5; đối tác có hazard rate $\lambda = 2\%$/năm và recovery $R = 40\%$. Công thức CVA ở dạng gọn nhất là tích phân theo thời gian của mật độ vỡ nợ nhân loss-given-default nhân expected exposure **đã chiết khấu**, và ta đang ngầm giả định exposure độc lập với thời điểm vỡ nợ (bỏ qua wrong-way risk):

$$\text{CVA} = (1-R)\int_0^T D(0,t)\,\text{EE}(t)\, \lambda\, e^{-\lambda t}\, dt.$$

Ước lượng thô bằng một điểm đại diện (tạm đặt $D(0,t) \approx 1$ để giữ số học đơn giản; tích phân đầy đủ có chiết khấu ở Chương 14 vẫn cho $\approx 0.172$M): loss-given-default $(1-R) = 0.60$; xác suất vỡ nợ tích lũy xấp xỉ qua 10 năm với $\lambda=2\%$ là $1 - e^{-0.02\times 10} = 1 - e^{-0.2} = 1 - 0.8187 = 0.1813$ (khoảng 18%); expected exposure *trung bình theo thời gian* (không phải đỉnh) cỡ 1.6 triệu vì profile chỉ chạm 2.3 triệu ở đỉnh rồi thoải về hai đầu. Ghép lại:

$$\text{CVA} \approx 0.60 \times 0.1813 \times 1.6\text{M} \approx 0.174\text{M}.$$

Con số này khớp với giá trị $\approx 0.172\,\text{M}$ ($\approx 17\,\text{bp}$ trên notional) mà tính tích phân đầy đủ cho ra. Ý nghĩa: cái swap "trị giá 0" theo model sạch thật ra khiến ngân hàng phải gánh thêm **khoảng 172.000 USD** rủi ro counterparty — và desk XVA sẽ tính phần đó vào giá chào, hoặc hedge nó bằng CDS của đối tác. Nếu deal *có* CSA (collateral agreement) đầy đủ với margin trao đổi hằng ngày, exposure gần như bị triệt tiêu và CVA teo còn cỡ 1 bp; nếu *không* có CSA, ngân hàng còn phải tự đi vay để cấp vốn cho position và gánh thêm **FVA**. Ước lượng nhất quán với Chương 14: FVA $\approx$ funding spread $\times$ diện-tích-EE-theo-thời-gian $\approx 0.005 \times 1.6\text{M} \times 10 \approx 0.08\text{M}$ (tức $\approx 8$ bp) ở funding spread 50 bp. Con số "0.75 triệu" ($\approx 75$ bp) khét tiếng của giai đoạn 2012–2014 chỉ xuất hiện khi funding spread của bank vọt lên cỡ 500 bp — cùng position, spread gấp 10, FVA gấp 10 (Chương 14 dựng cả phép tính này). "Giá" của một derivative, sau 2008, là một chồng các con số như thế, và Chương 14 dành trọn cho việc dựng chồng ấy. Điều cần rút ra ngay bây giờ: từ khoảnh khắc Lehman sập, không còn khái niệm "giá" đơn lẻ — chỉ còn giá sạch cộng một loạt valuation adjustments, mỗi cái là một desk, một mô hình, và một dòng P&L riêng.

Hệ quả nghề nghiệp: trọng tâm Q-quant dịch từ "nghĩ ra mô hình exotic mới" (thời hoàng kim 1995–2007) sang "tính đúng, tính nhanh, tính được ở quy mô portfolio, và tuân thủ quy định". Kỹ năng engineering (AAD, distributed computing, kiến trúc library) tăng giá trị tương đối so với stochastic calculus thuần túy. Nhưng nền toán vẫn là vé vào cửa — không có nó bạn không đọc nổi spec của chính mô hình mình code. Cuốn sách này đi đúng theo trục đó: dựng nền toán ngẫu nhiên và no-arbitrage (Phần I), rồi vanilla và vol (Phần II), rồi từng asset class (Phần III), rồi phương pháp số (Phần IV), rồi lớp hậu-2008 credit/XVA/capital (Phần V), rồi sản phẩm cấu trúc & chuyên sâu (Phần VI), và cuối cùng là nghề — kiến trúc library và lộ trình học (Phần VII). Bạn đang ở vạch xuất phát; điều cần mang theo từ chương này chỉ gồm ba ý: giá là chi phí tái tạo chứ không phải dự báo; ngân hàng *cố* bán vol chứ không bán hướng (một lý tưởng hóa để tách và quản trị directional risk, không phải trạng thái luôn đúng từng phút); và sau 2008, "giá" là một chồng adjustments chứ không phải một con số.

# Chương 2: Nền tảng tài chính

Chương này xây nền: giá trị thời gian của tiền, các instruments cơ bản, và trực giác no-arbitrage đầu tiên. Mọi thứ phức tạp sau này — Itô, Black-Scholes, XVA — đều đứng trên các khối này, và điều đáng ngạc nhiên là phần lớn trực giác đắt giá nhất của Q-world đã hiện diện đầy đủ ngay ở đây, chỉ ở dạng đơn giản. Nếu bạn thật sự thấm được một forward được định giá bằng chi phí replicate chứ không phải bằng dự báo, bạn đã nắm được 80% tinh thần của cả cuốn sách; phần còn lại chỉ là kỹ thuật để làm cùng một việc đó khi payoff cong đi và tương lai trở nên bất định.

Một lời khuyên trước khi vào: đừng đọc chương này như đọc định nghĩa. Mỗi khái niệm ở đây đều đi kèm một con số cụ thể, và bạn nên tự bấm lại từng phép tính bằng máy tính tay. Sự khác biệt giữa một quant biết "discount factor là gì" và một quant *dùng được* discount factor nằm đúng ở chỗ đã đích thân nhân $105 \times 0.92312$ ra $96.927$ đủ nhiều lần để con số trở thành phản xạ.

## 2.1 Time value of money: lãi suất và chiết khấu

**1 đồng hôm nay đáng giá hơn 1 đồng ngày mai** — vì bạn có thể gửi 1 đồng hôm nay lấy lãi. Đây là tiên đề số một của tài chính, và nó không phải một phát biểu về tâm lý hay sự thiếu kiên nhẫn của con người: nó là một phát biểu về *cơ hội*. Có một tài sản (deposit phi rủi ro) cho phép biến 1 đồng hôm nay thành nhiều hơn 1 đồng ngày mai một cách chắc chắn; sự tồn tại của tài sản đó buộc mọi dòng tiền tương lai phải bị "chiết khấu" về hiện tại. Cả bộ máy pricing chỉ là công cụ để làm phép chiết khấu này cho đúng khi mọi thứ trở nên phức tạp.

### Compounding (ghép lãi)

Gửi $N$ đồng với lãi suất $r$/năm. Câu hỏi tưởng chừng tầm thường — "sau $t$ năm nhận bao nhiêu?" — thực ra có nhiều câu trả lời, tùy vào việc lãi được nhập gốc bao nhiêu lần:

- **Simple (lãi đơn):** sau thời gian $t$ năm nhận $N(1 + rt)$. Lãi không sinh lãi. Dùng cho money market (deposits, kỳ hạn dưới 1 năm).
- **Annually compounded:** sau $t$ năm nhận $N(1+r)^t$. Lãi nhập gốc mỗi năm. Dùng quote bond yield.
- **Compounded $m$ lần/năm:** $N(1 + r/m)^{mt}$. Lãi nhập gốc $m$ lần mỗi năm.
- **Continuous compounding:** cho $m \to \infty$: $N e^{rt}$. Đây là quy ước **mặc định trong pricing** vì toán đẹp nhất — đạo hàm của $e^{rt}$ vẫn là $e^{rt}$ nhân hằng số, tích phân dễ, và khi ta sang thế giới ngẫu nhiên ở chương 3 thì hàm mũ là ngôn ngữ tự nhiên của Brownian motion.

Giới hạn continuous đến từ một trong những giới hạn nổi tiếng nhất của giải tích. Viết $N(1+r/m)^{mt}$ và đặt $k = m/r$, ta có $(1 + 1/k)^{krt} = \big[(1+1/k)^k\big]^{rt}$, và $(1+1/k)^k \to e$ khi $k \to \infty$. Vậy giới hạn là $N e^{rt}$. Đây không phải trò xảo thuật ký hiệu: nó nói rằng khi bạn tái đầu tư lãi càng lúc càng thường xuyên, tổng tài sản không tăng vô hạn mà hội tụ về một trần hữu hạn $e^{rt}$.

Cùng một "lãi suất 5%" ở các quy ước khác nhau cho số tiền khác nhau, và ta nên thấy khoảng cách đó cụ thể. Gửi 100 đồng, $r = 5\%$, $t = 1$ năm:

| Convention | Công thức | Số nhận sau 1 năm |
|---|---|---|
| Simple | $100(1+0.05)$ | 105.0000 |
| Annual | $100(1.05)^1$ | 105.0000 |
| Semi-annual ($m=2$) | $100(1+0.025)^2$ | 105.0625 |
| Quarterly ($m=4$) | $100(1.0125)^4$ | 105.0945 |
| Continuous | $100\,e^{0.05}$ | 105.1271 |

Với $t=1$ năm khác biệt còn nhỏ (12 cent giữa hai đầu bảng), nhưng nó phóng đại theo thời gian và theo lãi suất. Đây là lý do trong industry, mọi lãi suất *luôn* đi kèm hai thứ: **compounding convention** (ghép lãi mấy lần một năm) và **day count convention** (ACT/360, ACT/365, 30/360... — quy tắc đếm ngày giữa hai thời điểm để tính $t$). Bỏ một trong hai đi thì con số "5%" là vô nghĩa. Lỗi day count là bug kinh điển số một của junior quant dev — nó không làm chương trình crash, chỉ làm mọi giá sai lệch một cách kín đáo. Trong `quantc`, các convention này thuộc tầng `src/instruments` và `src/marketdata`.

Muốn quy đổi giữa các convention thì phải qua discount factor làm cầu nối: một lãi suất annual $r_a$ và một lãi suất continuous $r_c$ là "tương đương" khi chúng cho cùng số tiền, tức $e^{r_c} = (1+r_a)$, suy ra $r_c = \ln(1+r_a)$. Với $r_a = 5\%$: $r_c = \ln(1.05) = 4.879\%$. Tức "5% annual" chính là "4.879% continuous" — hai con số khác nhau cho *cùng một thực tại kinh tế*. Junior nào nhầm và cắm thẳng 5% vào công thức $e^{-rT}$ đang ngầm giả định một lãi suất cao hơn thực tế, và sẽ underprice mọi discount factor.

**Ví dụ day count bằng số** — để thấy vì sao convention không phải chuyện hình thức: kỳ tính lãi từ 15/1 đến 15/7 (181 ngày lịch). Year fraction $\tau$:

- ACT/360: $\tau = 181/360 = 0.50278$
- 30/360: $\tau = 180/360 = 0.50000$ (mỗi tháng đếm 30 ngày, nên 6 tháng tròn = 180 ngày bất kể lịch thật)
- ACT/365: $\tau = 181/365 = 0.49589$

Trên notional 100 triệu USD lãi suất 5%: chênh lệch giữa ACT/360 và 30/360 là $100\text{M} \times 5\% \times 0.00278 \approx 13{,}889$ USD — cho **một** kỳ lãi của **một** deal. Một cuốn sổ swap có hàng chục nghìn deal; sai convention một loạt là sai hàng triệu USD, và đây là bug có thật ở mọi ngân hàng. Điều làm nó nguy hiểm là nó không "sai to" ở một chỗ để ai đó phát hiện, mà "sai nhỏ" ở khắp nơi, cộng dồn âm thầm vào P&L cho đến khi risk và front office cãi nhau về một khoản chênh không ai giải thích được. Quy ước phổ biến cần nhớ: USD money market và floating leg dùng ACT/360, fixed leg swap USD dùng 30/360, GBP dùng ACT/365, và ACT/ACT cho trái phiếu chính phủ nhiều nước. Không có convention nào "đúng" hơn convention nào — chúng chỉ là ngôn ngữ hợp đồng, và nhiệm vụ của quant là đọc đúng ngôn ngữ mà mỗi deal viết bằng.

### Discount factor — khái niệm quan trọng nhất chương này

**Discount factor** $P(t, T)$ = giá trị tại thời điểm $t$ của 1 đồng chắc chắn nhận được tại $T$:

$$P(t,T) = e^{-r(T-t)} \quad \text{(với lãi suất liên tục không đổi } r\text{)}$$

Vì sao đây là khái niệm quan trọng nhất chương? Vì nó là *đơn vị tiền tệ nội bộ* của Q-world. Mọi thứ trong pricing cuối cùng đều được diễn đạt qua discount factor, và trực giác đúng về nó gần như tương đương với trực giác đúng về toàn bộ định giá tuyến tính. Tính chất cần thuộc: $P(T,T) = 1$ (1 đồng nhận ngay bây giờ đáng đúng 1 đồng), $P(t,T) < 1$ khi lãi suất dương (tương lai luôn "co" lại), và $P$ giảm khi $T$ tăng (càng xa càng co nhiều). Toàn bộ pricing tuyến tính quy về một câu: **tìm các dòng tiền tương lai, nhân mỗi dòng tiền với discount factor tương ứng, cộng lại.** Phần khó — và là toàn bộ nội dung các chương sau — chỉ nằm ở hai chỗ: khi dòng tiền không chắc chắn (chương 4 trở đi, lúc đó ta phải lấy kỳ vọng dưới measure risk-neutral trước khi discount) và khi lãi suất không phẳng (chương 9, lúc đó $P(0,T)$ không còn là một hàm mũ đơn giản mà là cả một curve dựng từ dữ liệu thị trường).

**Zero rate** (spot rate) $z(T)$ là lãi suất kép liên tục tương đương của $P(0,T)$, định nghĩa qua $P(0,T) = e^{-z(T) \cdot T}$, tức $z(T) = -\frac{1}{T}\ln P(0,T)$. Nó trả lời câu hỏi: "nếu tôi khóa tiền từ hôm nay đến $T$ ở một lãi suất phẳng duy nhất, lãi suất đó là bao nhiêu?". Đồ thị $z(T)$ theo $T$ là **yield curve** — thường dốc lên (upward sloping, phản ánh premium cho việc khóa tiền lâu và kỳ vọng lãi suất tăng), đôi khi đảo ngược (inverted, khi lãi ngắn hạn cao hơn dài hạn — tín hiệu suy thoái kinh điển vì thị trường đang định giá việc ngân hàng trung ương sẽ phải cắt lãi suất).

**Forward rate** $f(t; T_1, T_2)$ là lãi suất khóa hôm nay cho kỳ vay tương lai $[T_1, T_2]$ — tức bạn cam kết ngày hôm nay một mức lãi cho một khoản vay/gửi *bắt đầu ở tương lai*. No-arbitrage buộc nó phải liên hệ với zero rates theo một cách duy nhất. Xét hai chiến lược đưa 1 đồng từ hôm nay đến $T_2$: (a) gửi thẳng, nhận $e^{z(T_2)T_2}$; (b) gửi đến $T_1$ được $e^{z(T_1)T_1}$, rồi tái gửi khoản đó với lãi forward $f$, nhận $e^{z(T_1)T_1}\cdot e^{f(T_2-T_1)}$. Cả hai đều phi rủi ro và cùng vốn ban đầu, nên phải cho cùng kết quả:

$$e^{z(T_1)T_1} \cdot e^{f \cdot (T_2 - T_1)} = e^{z(T_2)T_2} \implies f = \frac{z(T_2)T_2 - z(T_1)T_1}{T_2 - T_1}$$

Nếu không bằng nhau thì có arbitrage trần trụi: giả sử vế (b) lớn hơn, bạn *vay* theo chiến lược (a) rẻ và *cho vay* theo (b) đắt, khóa chênh lệch không rủi ro. Chính khả năng này ép $f$ về đúng công thức trên. Đây là lập luận **no-arbitrage** đầu tiên của bạn, và nó có một cấu trúc bạn sẽ gặp lại vô số lần: hai cách đi đến cùng một trạng thái tương lai phải tốn cùng chi phí hôm nay. Toàn bộ Q-world là lập luận này lặp lại ở độ phức tạp tăng dần.

**Ví dụ forward bằng số** (bộ số OIS chuẩn của cả sách, sẽ gặp lại ở chương 9): thị trường quote OIS 1Y = 4.00% và 2Y = 4.25% (fixed hằng năm, annual compounding). Discount factors: $P(0,1) = 1/1.04 = 0.96154$ và $P(0,2) = 1/1.0425^2 = 0.92003$. Chuyển sang zero rate continuous để dùng công thức forward: $z(1) = -\ln(0.96154) = 3.922\%$, $z(2) = -\tfrac{1}{2}\ln(0.92003) = 4.167\%$. Forward 1Y1Y (lãi khóa hôm nay cho kỳ vay từ năm 1 đến năm 2):

$$f = \frac{z(2)\cdot 2 - z(1)\cdot 1}{2 - 1} = \frac{0.08334 - 0.03922}{1} = 4.41\% \ \text{(continuous)},$$

quy về annual compounding là $e^{0.0441}-1 = 4.51\%$. Đọc con số: vì curve dốc lên (2Y cao hơn 1Y), lãi forward cho năm thứ hai (4.51%) phải cao hơn cả hai zero rate — nó là "biên" mà khi trộn với năm đầu 4.00% mới ra được trung bình 4.25% của kỳ 2Y. Forward rate luôn "phóng đại" độ dốc của curve theo cách này, và đó là lý do một curve chỉ dốc nhẹ vẫn có thể ẩn chứa các forward rate rất cao hoặc rất thấp ở đuôi.

## 2.2 Bonds

**Zero-coupon bond**: trả 1 lần mệnh giá $F$ tại maturity $T$, không coupon. Giá $= F \cdot P(0,T)$. Đây là instrument đơn giản nhất, và quan trọng hơn, nó là "nguyên tử" của thế giới lãi suất: một zero-coupon bond mệnh giá 1 đồng *chính là* discount factor $P(0,T)$ đội lốt một hợp đồng có thể mua bán. Mọi instrument lãi suất phức tạp hơn — coupon bond, swap, annuity — đều là tổ hợp tuyến tính của các zero-coupon bond, nên nếu bạn biết giá mọi zero (tức biết cả curve $P(0,\cdot)$) thì bạn định giá được mọi thứ tuyến tính. Đây là lý do việc "dựng curve" ở cuối chương này quan trọng đến vậy.

**Coupon bond**: trả coupon $c$ định kỳ (thường 6 tháng/lần với trái phiếu Mỹ, hằng năm với nhiều thị trường châu Âu) và mệnh giá cuối kỳ. Vì nó là tổ hợp các zero, giá của nó đơn giản là tổng các dòng tiền đã chiết khấu:

$$V = \sum_{i=1}^{n} c \cdot P(0, t_i) + F \cdot P(0, T)$$

**Ví dụ tính tay đầy đủ** — bond 2 năm, coupon 5%/năm trả hằng năm, mệnh giá 100, curve phẳng 4% (liên tục). Discount factors: $P(0,1) = e^{-0.04} = 0.96079$, $P(0,2) = e^{-0.08} = 0.92312$.

$$V = 5 \times 0.96079 + 105 \times 0.92312 = 4.804 + 96.927 = 101.73$$

Bond giá trên par (101.73 > 100) vì coupon 5% > lãi suất 4% — bạn đang mua dòng tiền "hậu hĩnh hơn thị trường" nên phải trả thêm. Đây là một quy luật cần thuộc như phản xạ: coupon > yield thì giá trên par, coupon < yield thì dưới par, coupon = yield thì đúng par (như swap ta sẽ thấy ở mục 2.4). Bảng discount factor để hình dung độ "co" của tiền theo thời gian ở mức 4%:

| T (năm) | 1 | 2 | 5 | 10 | 30 |
|---|---|---|---|---|---|
| $P(0,T)$ | 0.9608 | 0.9231 | 0.8187 | 0.6703 | 0.3012 |

1 đồng nhận sau 30 năm chỉ đáng 30 cent hôm nay — trực giác quan trọng khi nghĩ về swap 30 năm hay lương hưu. Cũng để ý bảng này co theo hàm mũ: mỗi bước không giảm đều mà giảm theo tỷ lệ, đó là dấu vân tay của compounding liên tục.

**Yield to maturity (YTM)** $y$: mức lãi suất phẳng duy nhất mà nếu chiết khấu mọi dòng tiền bằng nó thì ra đúng giá thị trường. Nói cách khác, YTM là nghiệm $y$ của phương trình $V_{\text{market}} = \sum_i c\,e^{-y t_i} + F e^{-yT}$. Nó là cách quote giá bond phổ biến nhất vì nó nén cả một vector dòng tiền thành một con số duy nhất mà trader có thể so sánh giữa các bond. Cạm bẫy cần nhớ: YTM *không* phải là lãi suất bạn thật sự kiếm được trừ khi bạn tái đầu tư mọi coupon đúng ở mức $y$ — nó là một trung bình nội bộ nhất quán, không phải một lời hứa về lợi suất thực. Với bond 2Y ở trên (curve phẳng 4% continuous), vì curve đã phẳng nên YTM chính là 4% continuous; khi curve không phẳng, YTM là một trung bình có trọng số của các zero rate dọc đời sống bond. Quan hệ giá–yield luôn ngược chiều: yield tăng thì mọi $e^{-yt_i}$ nhỏ đi, giá giảm.

**Duration** — độ nhạy giá theo yield, tức "delta" của bond:

$$D = -\frac{1}{V}\frac{\partial V}{\partial y}, \qquad \Delta V \approx -D \cdot V \cdot \Delta y$$

Hãy dẫn xuất chứ đừng học thuộc. Với giá $V = \sum_i CF_i\, e^{-y t_i}$ (dùng continuous yield cho gọn), lấy đạo hàm theo $y$: $\frac{\partial V}{\partial y} = \sum_i CF_i \cdot (-t_i) e^{-y t_i} = -\sum_i t_i \cdot PV_i$, trong đó $PV_i = CF_i e^{-yt_i}$ là hiện giá của dòng tiền thứ $i$. Chia cho $-V$:

$$D = \frac{\sum_i t_i \cdot PV_i}{\sum_i PV_i}.$$

Công thức này có một cách đọc rất đẹp: duration là **thời điểm trung bình có trọng số** của các dòng tiền, với trọng số là tỷ lệ hiện giá của mỗi dòng tiền trên tổng. Nó là "trọng tâm thời gian" của bond. Bond zero-coupon có toàn bộ tiền dồn vào $T$ nên duration đúng bằng $T$; bond coupon có tiền rải sớm hơn nên duration ngắn hơn maturity. Bond 10 năm coupon vừa phải thường có duration cỡ 8: yield tăng 1% → giá giảm ~8%.

**Convexity** là đạo hàm bậc hai, $\mathcal{C} = \frac{1}{V}\frac{\partial^2 V}{\partial y^2} = \frac{\sum_i t_i^2 PV_i}{V}$ — hiệu chỉnh khi $\Delta y$ lớn, và luôn dương với bond thường (mọi $t_i^2 > 0$). Duration/convexity chính là "delta/gamma" của thế giới bond, và là lần đầu bạn gặp mô thức trung tâm của Q-world: **giá → độ nhạy → hedge**. Một quant rates cả đời làm việc với đúng bộ ba này, chỉ nâng cấp dần độ tinh vi.

Tiếp ví dụ bond 2Y ở trên. Macaulay duration $= (1 \times 4.804 + 2 \times 96.927)/101.73 = 198.66/101.73 = 1.953$ năm (bond "nặng" về dòng tiền cuối nên duration gần 2, đúng như trực giác trọng tâm thời gian: 95% hiện giá nằm ở mốc 2 năm). Dự báo tuyến tính khi yield tăng 100bp: $\Delta V \approx -1.953 \times 101.73 \times 0.01 = -1.99$. Reprice chính xác tại 5%: $5e^{-0.05} + 105e^{-0.10} = 4.756 + 95.006 = 99.76$ → giảm thật 1.97. Chênh 0.02 giữa hai con số chính là **convexity** làm việc: đạo hàm bậc hai kéo giá lên một chút so với xấp xỉ tuyến tính, vì hàm giá theo yield cong lồi. Kiểm chứng bằng số hiệu chỉnh convexity: với $\mathcal{C} = (1^2\times 4.804 + 2^2\times 96.927)/101.73 = 392.51/101.73 = 3.858$, số hạng bậc hai là $\tfrac{1}{2}\mathcal{C}\,V(\Delta y)^2 = 0.5\times 3.858\times 101.73\times 0.0001 = +0.020$ — khớp đúng phần chênh. Với bond dài hạn và cú sốc lớn, phần convexity này không bỏ qua được; một bond 30 năm khi lãi suất nhảy 2% có thể sai vài phần trăm nếu chỉ dùng duration. Đây là toàn bộ mô thức Taylor expansion mà risk management dùng ở mọi nơi:

$$\Delta V \approx \text{delta}\cdot\Delta x + \tfrac{1}{2}\,\text{gamma}\cdot(\Delta x)^2.$$

Bạn sẽ gặp lại đúng công thức này với ký hiệu $\Delta, \Gamma$ cho option ở chương 5 — chỉ là cùng một phép khai triển Taylor bậc hai, áp lên một biến khác.

## 2.3 Forwards và Futures

**Forward contract**: thỏa thuận hôm nay để mua tài sản tại thời điểm $T$ với giá $K$ chốt trước. Không tiền trao tay hôm nay. Payoff tại $T$: $S_T - K$ cho long side (nếu giá thực $S_T$ cao hơn giá đã khóa $K$, bạn lời; nếu thấp hơn, bạn lỗ — và không có sàn cản như option).

**Giá forward hợp lý** — đây là kết quả no-arbitrage thuần túy, và điều làm nó đẹp là ta tìm được $K$ mà **KHÔNG cần biết xác suất giá lên hay xuống**:

$$F = S_0 e^{rT}$$

Chứng minh (cash-and-carry): vay $S_0$ mua tài sản hôm nay, giữ đến $T$, giao cho người mua forward nhận $K$, trả nợ $S_0 e^{rT}$. Chiến lược này không rủi ro (mọi dòng tiền đã khóa từ hôm nay), vốn ban đầu bằng 0 (tiền vay đúng bằng tiền mua), nên lợi nhuận phải bằng 0 để không có arbitrage: $K - S_0 e^{rT} = 0$, tức $K = S_0 e^{rT}$. Nếu thị trường quote $F > S_0 e^{rT}$: làm đúng chiến lược trên, lãi chắc chắn $F - S_0e^{rT} > 0$. Nếu $F < S_0 e^{rT}$: làm ngược (short tài sản lấy tiền, gửi lấy lãi, mua forward để giao lại) và lại lãi không rủi ro. Chỉ có một giá không cho ai lãi không công, và đó là giá thị trường buộc phải nằm ở đó.

**Bảng arbitrage bằng số** — $S_0 = 50$, $r = 4\%$, $T = 0.5$: giá fair $F = 50e^{0.02} = 51.01$. Giả sử thị trường quote forward ở **52** (đắt hơn fair 0.99):

| Hành động hôm nay | Cash hôm nay | Tại $T = 0.5$ |
|---|---|---|
| Vay 50 với lãi 4% | +50 | trả nợ $-51.01$ |
| Mua 1 cổ phiếu | −50 | giao cổ phiếu cho forward |
| Bán forward tại 52 | 0 | nhận $+52.00$ |
| **Tổng** | **0** | **+0.99 chắc chắn** |

Vốn 0, rủi ro 0, lãi 0.99 — làm với 10 triệu cổ phiếu là 9.9 triệu USD. Chính vì các arbitrageur sẽ làm điều này ở quy mô công nghiệp (bán forward ép giá xuống, mua spot đẩy giá lên) nên giá thị trường không thể ở 52 lâu — và đó là cơ chế *thực thi* mọi công thức trong tài liệu này. No-arbitrage không phải giả định triết học; nó là mô tả hành vi của những người có bàn phím và đường truyền nhanh. Câu thần chú cần nội tâm hóa: mỗi công thức pricing trong sách này là một chiến lược replicate được viết dưới dạng phương trình, và cái "ép" giá về đúng công thức là những người thật kiếm tiền thật từ mọi sai lệch.

Mở rộng công thức forward theo bản chất tài sản, tất cả đều suy từ cùng lập luận cash-and-carry, chỉ thêm/bớt các dòng tiền phát sinh trong lúc giữ:

- Tài sản trả **dividend yield** $q$ (equity index): giữ tài sản được nhận dividend, nên chi phí carry thấp đi → $F = S_0 e^{(r-q)T}$.
- Hàng hóa có **chi phí lưu kho** $u$ (dầu, kim loại): giữ hàng tốn kho, carry đắt lên → $F = S_0 e^{(r+u)T}$. Có khi còn thêm **convenience yield** trừ đi, phản ánh lợi ích của việc thực sự nắm hàng vật lý.
- **FX** với lãi suất hai đồng tiền $r_d$ (domestic), $r_f$ (foreign): giữ ngoại tệ được lãi $r_f$ nên nó đóng vai như dividend → $F = S_0 e^{(r_d - r_f)T}$. Đây là **covered interest parity**, xương sống của mọi định giá FX ở chương 10.

Đây là ví dụ tinh khiết nhất của tư duy Q: **giá được xác định bởi chi phí replicate, không phải bởi dự báo**. Người P-world hỏi "$S_T$ sẽ là bao nhiêu?"; người Q-world hỏi "tôi tái tạo payoff này bằng gì và hết bao nhiêu tiền?". Sự phân đôi này (đã bàn ở chương 1) hiện ra ở đây dưới dạng cụ thể và không thể chối cãi: giá forward không chứa một chữ nào về kỳ vọng của thị trường về $S_T$, chỉ chứa $S_0$ và lãi suất.

### FRA — forward rate agreement

Trước khi rời forward, ta cần bản sao lãi suất của nó, vì nó là viên gạch nối forward với swap. Một **Forward Rate Agreement (FRA)** là forward trên một *lãi suất*: hai bên khóa hôm nay lãi suất $K$ cho một khoản vay/gửi danh nghĩa trong kỳ tương lai $[T_1, T_2]$, và tại $T_1$ (hoặc $T_2$) thanh toán phần chênh giữa lãi suất thị trường thực tế và $K$. Nó không phải công cụ vay tiền thật — chỉ trao đổi phần chênh lãi trên một notional danh nghĩa.

Payoff (settle tại $T_2$, notional $N$, year fraction $\tau = T_2 - T_1$) cho bên nhận-fixed-trả-float là $N\tau(K - L)$, với $L$ là lãi suất float thực hiện cho kỳ đó. Điểm mấu chốt: mức $K$ làm FRA có giá 0 hôm nay chính là **forward rate** $f(0; T_1, T_2)$ mà ta đã tính ở mục 2.1 — không có gì mới, chỉ là forward rate được đóng gói thành một hợp đồng mua bán được. Dùng bộ số OIS: forward 1Y1Y đã tính là 4.51% (annual). Một FRA khóa lãi 4.51% cho kỳ vay từ năm 1 đến năm 2 có giá đúng 0 hôm nay; nếu ai đó chào bạn khóa ở 4.70%, và bạn *nhận* fixed 4.70% trả float, bạn đang nhận cao hơn forward — deal có giá trị dương ngay lập tức, đúng bằng hiện giá của $N\tau(4.70\%-4.51\%) = N\times 1\times 0.0019$ chiết khấu về hôm nay. Cụ thể bằng số: khoản chênh $0.0019\,N$ này rơi ở cuối kỳ (năm 2), nên hiện giá của nó là $0.0019\,N \times P(0,2) = 0.0019 \times 0.92003 \times N = 0.001748\,N$ — trên notional $N=100\,\text{M}$ thì FRA đó đáng khoảng $174{,}800$ USD ngay hôm nay, chứ không phải trọn $190{,}000$ USD danh nghĩa; đúng $15\,\text{k}$ chênh lệch chính là hiệu ứng chiết khấu về hiện tại. FRA quan trọng vì một chuỗi FRA nối tiếp nhau *chính là* floating leg của một swap; hiểu FRA là hiểu một nửa của swap.

**Futures** = forward chuẩn hóa, giao dịch trên sàn, có **daily settlement** (lãi/lỗ thanh toán mỗi ngày qua margin account) và một central counterparty (CCP) đứng giữa mọi giao dịch để xóa rủi ro đối tác. Về payoff kinh tế futures rất gần forward, nhưng cơ chế thanh toán hằng ngày tạo một khác biệt tinh tế mà một quant rates phải hiểu.

### Trực giác convexity adjustment futures–forward

Vì sao daily settlement lại làm giá futures lệch khỏi giá forward? Cốt lõi nằm ở **thời điểm** các khoản lãi/lỗ nhỏ hằng ngày được nhận, và ở *lãi suất* mà ta tái đầu tư chúng. Với forward, mọi lãi/lỗ dồn lại trả một lần tại $T$. Với futures, lãi/lỗ được chuyển vào tài khoản margin mỗi ngày, và khoản đó lập tức được gửi (hoặc phải vay bù) ở lãi suất hiện hành.

Bây giờ hãy tưởng tượng bạn long một futures trên một tài sản mà giá của nó **tương quan dương** với lãi suất — ví dụ điển hình là một hợp đồng mà "tài sản" thực chất phản ánh lãi suất tăng. Khi lãi suất tăng, futures của bạn lời, và bạn nhận variation margin *đúng vào lúc* lãi suất cao — bạn tái đầu tư khoản lời đó ở mức lãi hấp dẫn. Khi lãi suất giảm, futures lỗ, bạn phải nạp margin *đúng vào lúc* lãi suất thấp — bạn đi vay bù ở mức rẻ. Cả hai chiều đều có lợi cho bạn so với việc chỉ nhận một cục tại $T$ như forward. Vì lợi thế thời điểm này thuộc về người long futures, họ sẵn lòng trả nhiều hơn, nên **giá futures cao hơn giá forward** khi tương quan dương. Ngược lại, tương quan âm đẩy giá futures xuống dưới forward.

Khoảng cách đó gọi là **convexity adjustment**, và độ lớn của nó tỷ lệ với ba thứ: mức tương quan giữa tài sản và lãi suất, độ biến động của cả hai, và bình phương của thời gian (vì lỗi tích lũy như một quá trình khuếch tán). Với equity futures ngắn hạn, tương quan yếu và $T$ nhỏ nên adjustment không đáng kể — thực tế trader coi futures ≈ forward. Nhưng với **interest rate futures** (như futures trên lãi suất kỳ hạn), "tài sản" gần như *chính là* lãi suất, tương quan cực mạnh, và với hợp đồng dài hạn adjustment có thể lên tới nhiều basis point — đủ lớn để bỏ qua là sai giá và sai hedge. Đây là lý do khi dựng curve từ futures ở chương 9, ta phải trừ đi convexity adjustment trước khi coi giá futures như một forward rate; bỏ bước này là một trong những lỗi curve-building kinh điển. Con số chính xác cần một mô hình lãi suất ngẫu nhiên (Hull-White chẳng hạn) để định lượng $\text{Var}$ và tương quan, nên ta để dành phần định lượng cho chương 9, nhưng trực giác — *futures nhận lãi/lỗ đúng lúc thuận lợi hơn forward khi tương quan dương* — thì phải nắm ngay từ bây giờ.

## 2.4 Swaps

**Interest Rate Swap (IRS)** — instrument OTC quan trọng nhất thế giới tính theo notional: hai bên trao đổi dòng lãi suất **cố định** lấy **thả nổi** trên cùng notional $N$ (notional bản thân không trao tay, chỉ dùng để tính lãi). Về bản chất swap là một chuỗi FRA nối tiếp được đóng gói thành một hợp đồng duy nhất, cộng với một fixed leg đối ứng.

- Fixed leg: trả $K \cdot N \cdot \tau_i$ mỗi kỳ ($\tau_i$ = year fraction của kỳ, theo đúng day count đã bàn ở 2.1).
- Floating leg: trả lãi suất tham chiếu (nay là SOFR compounded qua đêm, hậu-LIBOR; xưa là LIBOR kỳ hạn) $\cdot N \cdot \tau_i$.

Ai dùng và vì sao: một doanh nghiệp vay ngân hàng theo lãi thả nổi nhưng muốn biết trước chi phí lãi để lập ngân sách → họ *pay fixed / receive floating*, biến khoản vay thả nổi thành cố định về mặt hiệu quả. Một quỹ hưu trí có nghĩa vụ trả lương hưu dài hạn (giống một khoản nợ fixed rất dài) sợ lãi suất giảm làm hiện giá nghĩa vụ phình ra → họ *receive fixed* để hedge. Swap tồn tại vì nó cho phép mỗi bên chuyển đúng loại rủi ro lãi suất mình không muốn cho bên sẵn lòng ôm.

**Định giá**: giá trị swap = PV(floating leg) − PV(fixed leg) đối với bên nhận-float-trả-fixed. Có một kết quả đẹp giúp tránh phải model từng dòng float tương lai: floating leg (chưa tính spread) có PV = $N(1 - P(0,T_n))$. Trực giác đằng sau là một mẹo replicate đáng nhớ — nhận floating trên notional $N$ tương đương giữ một trái phiếu thả nổi, mà trái phiếu thả nổi *luôn* định giá đúng par ngay sau mỗi lần reset (vì coupon của nó tự điều chỉnh theo lãi thị trường). Cụ thể: bỏ ra $N$ hôm nay mua một FRN par, ta nhận về mọi coupon floating cộng $N$ ở cuối; vậy chuỗi coupon floating có PV = $N - N\cdot P(0,T_n)$ (giá FRN trừ đi hiện giá của notional nhận lại cuối kỳ). Đó chính là công thức. **Swap rate** $S$ là mức fixed $K$ làm swap có giá trị 0 tại khởi đầu — đặt hai leg bằng nhau và giải:

$$N(1 - P(0,T_n)) = K \cdot N \sum_i \tau_i P(0,T_i) \implies S = \frac{1 - P(0,T_n)}{\sum_i \tau_i P(0,T_i)}$$

Mẫu số $A = \sum_i \tau_i P(0,T_i)$ gọi là **annuity** (hay level, hay PV01 tùy desk) — nó là hiện giá của việc nhận 1 đồng mỗi kỳ trong đời swap, và bạn sẽ gặp lại nó liên tục ở chương 9 (nó là numéraire tự nhiên để định giá swaption). Swap rates các kỳ hạn 1Y–50Y được quote thanh khoản trên thị trường, và là **input chính để dựng yield curve**: thị trường cho ta $S$, ta giải ngược ra $P(0,T)$. Chiều "ngược" này chính là bootstrap ở mục 2.7.

**Ví dụ tính tay** — swap 2 năm trả coupon hằng năm, notional 100, curve phẳng 4% (compound hằng năm): $P(0,1) = 1/1.04 = 0.96154$, $P(0,2) = 1/1.04^2 = 0.92456$. (Lưu ý đây là một curve phẳng 4% dựng riêng cho ví dụ swap này, **khác** với bộ số OIS 4.25% dùng ở mục 2.1 và 2.6 — nên đừng ngạc nhiên khi thấy $P(0,2)=0.92456$ ở đây lệch nhẹ so với $P(0,2)=0.92003$ của bộ OIS; hai kịch bản curve khác nhau, không mâu thuẫn.)

$$S = \frac{1 - 0.92456}{0.96154 + 0.92456} = \frac{0.07544}{1.88610} = 4.00\%$$

Curve phẳng 4% cho swap rate đúng 4% — sanity check đẹp mà bạn nên nội tâm hóa: swap rate là "trung bình có trọng số" của các forward rates dọc đời swap, và curve phẳng thì mọi forward đều bằng 4% nên trung bình cũng đúng 4%. Bất cứ khi nào code swap ra một swap rate lệch khỏi mức phẳng khi input là curve phẳng, bạn có bug.

Bây giờ giả sử một năm trước bạn đã ký swap **nhận float, trả fixed 3%** (khi lãi suất còn thấp), còn lại đúng 2 năm như trên. Giá trị hôm nay của swap đó:

$$V = N\left[(1 - P_2) - K\sum \tau_i P_i\right] = 100\left[0.07544 - 0.03 \times 1.88610\right] = 100 \times 0.01886 = +1.89$$

Swap từng có giá trị 0 giờ đáng +1.89% notional vì lãi suất đã tăng — bạn đang trả fixed "rẻ" (3%) so với mức thị trường hiện tại (4%), nên vị thế trả-fixed của bạn có giá trị. Có thể kiểm tra bằng một cách nhìn thứ hai cho chắc: chênh giữa swap rate mới (4%) và fixed cũ (3%) là 1% mỗi năm, nhân với annuity $A = 1.886$ cho $V = 100\times 0.01\times 1.886 = 1.886 \approx +1.89$ — hai đường tính gặp nhau. Con số +1.89 này chính là **mark-to-market** mà hệ thống risk tính lại mỗi đêm cho hàng trăm nghìn swap; nó là exposure mà chương 14 (XVA) mô phỏng phân phối tương lai của nó để tính CVA; và nếu counterparty vỡ nợ hôm nay khi swap có giá +1.89 với bạn, đây là số tiền bạn có nguy cơ mất. Mọi chương sau của tài liệu, theo nghĩa rất cụ thể, nối vào đúng con số này.

Các swap khác cần biết tên: **OIS** (floating = lãi suất qua đêm compounded — chuẩn discount hiện đại sau cải cách hậu-LIBOR), **basis swap** (float vs float khác tenor hoặc khác đồng tiền, quote spread giữa hai curve), **cross-currency swap** (hai đồng tiền, có trao notional thật, là cầu nối định giá đa tiền tệ ở chương 10), **inflation swap** (một leg gắn chỉ số lạm phát), **total return swap** (trao đổi toàn bộ lợi suất của một tài sản lấy lãi suất).

## 2.5 Options

**Call option**: quyền (không phải nghĩa vụ) MUA tài sản tại giá strike $K$ tại (hoặc trước) expiry $T$. Payoff tại $T$: $\max(S_T - K, 0)$, viết tắt $(S_T - K)^+$. **Put option**: quyền BÁN. Payoff: $(K - S_T)^+$. Chữ "quyền chứ không nghĩa vụ" là toàn bộ khác biệt so với forward — người giữ option chỉ thực hiện khi có lợi, nên payoff bị gãy khúc, không còn tuyến tính.

- **European**: chỉ exercise được đúng tại $T$. **American**: exercise bất cứ lúc nào $\le T$. **Bermudan**: tại một tập ngày định trước (chương 9 — Bermudan swaption là bài toán exotic quan trọng nhất của rates, và quyền exercise sớm khiến nó không có công thức đóng, phải dùng phương pháp số).
- **Moneyness**: call với $S > K$ là in-the-money (ITM), $S \approx K$ at-the-money (ATM), $S < K$ out-of-the-money (OTM). Với put thì đảo lại.
- Giá option = **intrinsic value** ($(S-K)^+$ nếu exercise ngay) + **time value** (giá trị của "quyền chờ đợi", luôn dương trước expiry và tan về 0 tại $T$).

Option khác forward về bản chất ở chỗ payoff **phi tuyến** — có một "kink" (điểm gãy) tại $K$. Hệ quả sâu sắc và là bản lề của cả nửa sau cuốn sách: giá option phụ thuộc vào **độ biến động** (volatility) của $S_T$, thứ mà giá forward hoàn toàn không đoái hoài. Vì sao? Payoff của option là một hàm **lồi** (convex) của $S_T$, và một hàm lồi thì hưởng lợi từ độ phân tán: theo bất đẳng thức Jensen, $\mathbb{E}[f(S_T)] \ge f(\mathbb{E}[S_T])$ khi $f$ lồi, và khoảng cách càng lớn khi $S_T$ càng biến động. Cụ thể hơn với option: nếu $S_T$ tăng mạnh, call ăn không giới hạn; nếu $S_T$ giảm mạnh, call chỉ mất đúng premium đã trả — bất đối xứng này khiến biến động là bạn của người mua option. Vì vậy có một đẳng thức trực giác mà mọi trader vol thuộc nằm lòng: **mua option = mua volatility**. Forward, ngược lại, có payoff tuyến tính nên Jensen thành đẳng thức và vol biến mất khỏi giá. Toàn bộ chương 5–6 xoay quanh việc định lượng chính xác "option đáng bao nhiêu vol".

### Các chặn no-arbitrage trước khi có mô hình

Điều đáng kinh ngạc là ta ràng buộc được giá option khá chặt mà chưa cần *bất kỳ* mô hình nào — chỉ no-arbitrage thuần túy, giống hệt cash-and-carry:

1. Chặn trên/dưới: $C \geq (S_0 - Ke^{-rT})^+$ và $C \leq S_0$ (call không thể đắt hơn chính cổ phiếu, vì cùng lắm bạn mua thẳng cổ phiếu); $P \geq (Ke^{-rT} - S_0)^+$ và $P \leq Ke^{-rT}$.

2. **Put-call parity** (quan trọng nhất chương — thuộc lòng):

$$C - P = S_0 - Ke^{-rT}$$

Chứng minh replicate: lập portfolio long một call, short một put cùng $K, T$. Payoff tại $T$ là $(S_T-K)^+ - (K-S_T)^+$. Xét hai trường hợp: nếu $S_T > K$ thì $= (S_T - K) - 0 = S_T - K$; nếu $S_T < K$ thì $= 0 - (K - S_T) = S_T - K$. Vậy trong mọi kịch bản payoff đúng bằng $S_T - K$ — chính là payoff của một forward mua tại $K$. Mà forward đó ta định giá được không cần mô hình: giá vào của nó (giá trị hôm nay của việc nhận $S_T - K$) là $S_0 - Ke^{-rT}$. Do đó $C - P = S_0 - Ke^{-rT}$. Chú ý toàn bộ chứng minh không dùng một chữ nào về $\sigma$ hay phân phối của $S_T$ — parity đúng dù mô hình của bạn là Black-Scholes, Heston, hay bất kỳ thứ gì, miễn không có arbitrage. Ba hệ quả thực chiến: (a) chỉ cần model được call thì put suy ra miễn phí, tiết kiệm nửa công việc; (b) implied vol của call và put cùng strike **phải bằng nhau** (nếu không, parity vỡ) — nên khi xây vol surface ta chỉ cần một trong hai; (c) desk dùng parity như một máy dò quote lỗi tức thời.

**Parity làm việc bằng số**: $S_0 = 100$, $K = 100$, $r = 0$, $T = 1$. Thị trường quote call = 8.0, put = 6.5. Kiểm tra: $C - P = 1.5$ nhưng $S_0 - Ke^{-rT} = 100 - 100 = 0$ → **lệch 1.5**, một vi phạm parity trắng trợn. Khai thác: bán call (thu +8), mua put (chi −6.5), mua cổ phiếu (chi −100), tổng bỏ ra hôm nay 98.5. Tại expiry, bất kể $S_T$: nếu $S_T > 100$, call bị người mua exercise → bạn giao cổ phiếu (đang có sẵn) và nhận 100; nếu $S_T < 100$, bạn exercise put → bán cổ phiếu và nhận 100; nếu $S_T = 100$, cả hai vô giá trị nhưng cổ phiếu đáng đúng 100. Mọi kịch bản đều thu đúng 100 với chi phí ban đầu 98.5 → lãi phi rủi ro 1.5, khớp đúng độ lệch parity. Bài học desk: trên sàn options thanh khoản, lệch parity thực tế chỉ tồn tại trong mili-giây hoặc phản ánh một chi phí thật mà bạn quên (borrow fee khi short cổ phiếu, dividend risk, hard-to-borrow premium). Khi bạn "tìm thấy arbitrage" trong dữ liệu, khả năng cao là bạn tìm thấy một chi phí mình chưa model — đây là bài học khiêm tốn số một của quant trẻ.

3. Ràng buộc theo strike: giá call **giảm theo strike** ($\partial C/\partial K \le 0$ — call strike cao thì khó ăn hơn), **lồi theo strike** ($\partial^2 C / \partial K^2 \ge 0$ — vi phạm gọi là butterfly arbitrage), và không giảm theo maturity với vol surface hợp lý (vi phạm là calendar arbitrage). Ba điều kiện này không phải chi tiết kỹ thuật xa vời: chúng là các ràng buộc mà *mọi* vol surface phải thỏa để không tạo tiền chùa, và cả một nhánh của chương 6 dành cho việc dựng surface (SVI/SSVI) sao cho tôn trọng chúng theo cấu trúc.

### Danh mục payoff cần thuộc

Combo cơ bản mà trader nói hằng ngày, mỗi cái là một quan điểm rõ ràng về thị trường: **straddle** (call + put cùng strike — cược biến động lớn mà không cần biết hướng, payoff hình chữ V), **strangle** (call OTM + put OTM — cùng ý tưởng nhưng rẻ hơn straddle vì cả hai chân đều OTM), **butterfly** (cược giá đứng yên quanh strike giữa), **call spread** (mua call $K_1$, bán call $K_2 > K_1$ — cược lên nhưng có trần, rẻ vì bán bớt upside), **risk reversal** (mua call OTM, bán put OTM — cấu trúc quote chuẩn của FX smile, đo độ nghiêng skew), **collar** (bảo vệ vị thế cổ phiếu bằng cách mua put bán call), **covered call** (giữ cổ phiếu bán call lấy premium). Việc đọc một payoff phức tạp thành tổ hợp các viên gạch này là kỹ năng nền của mọi structuring desk.

**Straddle bằng số** — để danh mục này không dừng ở lý thuyết suông: lấy ATM straddle trên $S_0 = 100$, $K = 100$, và giả sử với bộ số vanilla chuẩn của sách ($r=5\%, \sigma=20\%, T=1$) call ATM đáng $C = 10.45$; put cùng strike suy từ parity là $P = C - (S_0 - Ke^{-rT}) = 10.45 - (100 - 100e^{-0.05}) = 10.45 - 4.88 = 5.57$. Giá straddle (mua cả hai chân) $= C + P = 10.45 + 5.57 = 16.02$ — đây là "phí đặt cược vào biến động". Payoff tại expiry là $|S_T - K|$, nên vị thế chỉ hòa vốn khi $S_T$ đi đủ xa: break-even nằm ở $K \pm (C+P) = 100 \pm 16.02$, tức $S_T < 83.98$ hoặc $S_T > 116.02$. Đọc con số: người mua straddle này đang trả 16% giá cổ phiếu để cược rằng một năm nữa giá sẽ lệch khỏi 100 hơn 16 điểm về *bất kỳ* hướng nào; nếu giá đứng yên quanh 100, họ mất toàn bộ premium. Đó chính là nghĩa cụ thể của "mua straddle = mua volatility".

### Exotics — sản phẩm của Q-world

Vanilla (call/put niêm yết) là thị trường cạnh tranh khốc liệt, margin mỏng như dao cạo. Ngân hàng kiếm tiền thật ở **exotics** — payoff phức tạp may đo cho từng client, nơi mô hình tốt và hedge khéo tạo ra lợi thế:

- **Barrier options**: knock-out (option chết nếu $S$ chạm một rào định trước), knock-in (chỉ sống khi chạm rào). Rẻ hơn vanilla vì có xác suất "chết" nên rất phổ biến trong FX. Độ nhạy mô hình cao quanh barrier.
- **Asian options**: payoff tính trên **trung bình** giá dọc một cửa sổ thời gian thay vì chỉ giá cuối. Chuẩn trong commodities, nơi khách muốn hedge giá trung bình cả kỳ chứ không phải một ngày.
- **Digital / binary**: trả một khoản cố định (ví dụ 1) nếu $S_T > K$, không thì 0. Nhạy cảm mô hình khủng khiếp quanh strike vì payoff nhảy bậc — hedge nó là ác mộng vì delta bùng nổ sát expiry.
- **Autocallable**: sản phẩm bán lẻ phổ biến nhất thế giới (đặc biệt ở châu Á). Trả coupon cao hấp dẫn, tự động tất toán sớm nếu index vượt một mức; nhưng nếu index sập qua barrier dưới, nhà đầu tư gánh toàn bộ downside. Hedge cả một autocallable book (với các barrier chồng chéo và gamma đổi dấu) là nguồn đau đầu — và là nguồn việc làm — khổng lồ của EQD quant.
- **Basket / worst-of**: payoff trên nhiều tài sản (ví dụ trả theo cổ phiếu tệ nhất trong rổ) → cần model **correlation**, mở ra cả một tầng phức tạp mới.
- **Cliquet, lookback, variance swap** (chương 6), **Bermudan swaption, CMS** (chương 9), **TARF** trong FX (chương 10).

Quy trình industry khi một desk muốn bán một exotic mới không phải là ứng biến — nó là một pipeline có kỷ luật: quant chọn hoặc xây model phù hợp → viết pricing spec → implement trong library → model validation duyệt độc lập (một nhóm riêng cố tình tìm cách phá) → risk chạy thử tác động capital → chỉ khi đó desk mới được phép trade. Kiến trúc `quantc` phản chiếu đúng pipeline này: định nghĩa instrument (`src/instruments`), chọn model (`src/models`), engine số để định giá (`src/engines`, `src/numerics`), calibration khớp thị trường (`src/calibration`), rồi risk/capital (`src/risk`, `src/xva`). Cuốn sách này về cơ bản đi bộ dọc đúng pipeline đó.

## 2.6 Curve và bootstrap — từ quote thị trường ra discount factor

Suốt chương này ta đã ngầm giả định "biết curve", tức biết $P(0,T)$ với mọi $T$. Nhưng thị trường không quote discount factor; nó quote *giá của instrument* — deposit rate ngắn hạn, FRA/futures cho kỳ giữa, swap rate cho kỳ dài. Nhiệm vụ dựng curve là giải ngược: từ tập giá quan sát được, tìm tập $\{P(0,T_i)\}$ nhất quán no-arbitrage tái tạo đúng mọi giá đó. Quy trình này gọi là **bootstrap**, và nó là công việc thầm lặng nhưng nền tảng bậc nhất của một rates desk — sai curve thì sai *mọi* thứ định giá phía trên.

Ý tưởng bootstrap là tiến từ ngắn đến dài, mỗi bước dùng một instrument mới để trích thêm đúng một discount factor chưa biết. Hãy làm bằng số với bộ số OIS chuẩn: quote 1Y = 4.00%, 2Y = 4.25% (par swap/deposit annual). Bước đầu, instrument 1Y cho ta trực tiếp $P(0,1) = 1/1.04 = 0.96154$ — chưa cần gì đến $P(0,2)$. Bước hai, dùng swap 2Y với swap rate 4.25%. Điều kiện par swap (giá trị 0) viết theo công thức mục 2.4:

$$0.0425\big(P(0,1) + P(0,2)\big) = 1 - P(0,2).$$

Thay $P(0,1) = 0.96154$ đã biết và giải cho ẩn duy nhất $P(0,2)$:

$$0.0425 \times 0.96154 + 0.0425\,P(0,2) = 1 - P(0,2) \implies P(0,2)(1 + 0.0425) = 1 - 0.04087,$$

$$P(0,2) = \frac{0.95913}{1.0425} = 0.92003.$$

Chính là con số $P(0,2) = 0.92003$ ta đã dùng ở mục 2.1 — bây giờ ta thấy nó *đến từ đâu*: không phải trên trời rơi xuống mà được trích ra bằng cách buộc curve tái tạo đúng swap rate 2Y của thị trường. Zero rate 2Y tương ứng: $z(2) = -\tfrac12\ln(0.92003) = 4.167\%$ continuous, tức $1/\sqrt{0.92003} - 1 = 4.26\%$ annual — cao hơn swap rate 4.25% một chút, đúng như kỳ vọng vì zero rate luôn nằm trên par rate khi curve dốc lên. Và forward 1Y1Y ta tính trước đó (4.51% annual) chính là "biên" ẩn trong bước bootstrap này: nó là lãi suất riêng của năm thứ hai mà curve vừa trích ra.

Với curve thật, giữa deposit ngắn và swap dài còn có futures (nhớ trừ convexity adjustment ở mục 2.3 trước khi dùng), và các điểm giữa các quote phải nội suy — thường nội suy trên log của discount factor hoặc trên forward rate, và lựa chọn nội suy không vô hại: nó quyết định hình dạng forward curve giữa các mốc, và một nội suy vụng có thể tạo ra forward rate răng cưa phi lý. Thực tế hậu-LIBOR còn phức tạp hơn: ta dựng **nhiều curve** cùng lúc — một OIS curve để discount và các curve riêng cho từng chỉ số float (multi-curve framework) — vì sau khủng hoảng 2008, discount và forecast không còn dùng chung một curve nữa. Tầng `src/marketdata` trong `quantc` (curve, multi-curve, rfr, bootstrap) đúng là nơi những phép giải ngược này sống. Ta chỉ chạm bề mặt ở đây; chương 9 dựng toàn bộ bộ máy multi-curve một cách nghiêm túc. Nhưng thông điệp cốt lõi thì đã trọn vẹn: mọi discount factor bạn dùng trong sách này không phải một tham số tùy ý, mà là hệ quả bị ép buộc của các giá thật quan sát trên thị trường.

## 2.7 Ba nhân vật của thị trường

Cuối cùng, để đặt mọi công thức vào bối cảnh con người, thị trường derivative được vận hành bởi ba loại người chơi, phân biệt nhau bởi *lý do* họ giao dịch:

- **Hedger**: người có sẵn một rủi ro trong hoạt động kinh doanh và dùng derivative để giảm nó. Hãng hàng không mua call dầu để chặn rủi ro giá nhiên liệu tăng; nông dân bán futures ngũ cốc để khóa giá bán. Hedger không cố kiếm lời từ derivative — họ mua sự yên tâm.
- **Speculator**: người dùng derivative để đặt cược có đòn bẩy vào một hướng giá, chấp nhận rủi ro để tìm lợi nhuận. Đòn bẩy của derivative khuếch đại cả lời lẫn lỗ, nên đây là con dao hai lưỡi.
- **Arbitrageur**: người săn các sai lệch giá phi rủi ro (như bảng forward ở 2.3, như vi phạm parity ở 2.5), và chính hành động của họ ép giá về mức no-arbitrage. Họ là "lực hấp dẫn" làm toàn bộ toán Q-world đúng trong thực tế — nếu không có ai khai thác sai lệch, các công thức của ta chỉ là mơ ước lý thuyết.

Ngân hàng sell-side — nơi cuốn sách này hướng tới — về danh nghĩa đóng vai **market maker trung tính**: bán cho người này, hedge với người kia, sống bằng spread và khối lượng chứ không bằng đoán hướng thị trường. Đây là điểm mấu chốt định hình mọi thứ theo sau: mọi mô hình từ đây trở đi phục vụ đúng một mục tiêu — **market making mà không ôm rủi ro ngoài ý muốn**. Chúng ta định giá để quote đúng, tính Greeks để hedge sạch, mô phỏng exposure để đo rủi ro đối tác, và tính capital để thỏa quy định; toàn bộ tòa nhà kỹ thuật của các chương sau được dựng để một market maker có thể đứng giữa dòng chảy giao dịch mà không bị cuốn đi. Với nền tảng của chương này — time value, replicate, no-arbitrage, và ba viên gạch forward/swap/option — bạn đã có đủ vốn từ vựng để bước vào bộ máy toán ngẫu nhiên ở chương 3, nơi ta cuối cùng cho $S_t$ được phép chuyển động một cách bất định.

# Chương 3: Toán xác suất và quá trình ngẫu nhiên

Đây là chương "vé vào cửa" của Q-world. Mọi công thức định giá bạn sẽ gặp về sau — Black-Scholes, Heston, Hull-White, CVA — đều là hệ quả của đúng một bộ công cụ: xác suất nền, Brownian motion, Itô's lemma, và định lý đổi measure. Mục tiêu của chương không phải chứng minh định lý với rigor của một nhà giải tích ngẫu nhiên, mà là để bạn **hiểu và dùng đúng** — biết mỗi số hạng trong công thức từ đâu ra, vì sao có, và điều gì xảy ra khi quên nó. Ai muốn rigor đầy đủ (đo được, tích phân Lebesgue, semimartingale tổng quát) đọc Shreve tập II hoặc Karatzas-Shreve; ở đây chúng ta đi theo con đường của desk quant: mỗi khái niệm lớn gắn với một con số cụ thể, và mỗi công thức lớn được dẫn xuất từng bước để bạn tự làm lại được.

Có một sợi chỉ đỏ xuyên suốt chương mà bạn nên để mắt ngay từ đầu: đại lượng $\sigma^2/2$. Nó xuất hiện lần đầu ở phân phối lognormal như khoảng cách giữa mean và median, tái xuất ở Itô's lemma như số hạng bậc hai, rồi ở nghiệm GBM như "volatility drag", ở exponential martingale như số hạng hiệu chỉnh, và cuối cùng ở Girsanov. Toàn bộ chương có thể đọc như câu chuyện về một hằng số $\sigma^2/2$ và những nơi nó ẩn nấp.

## 3.1 Xác suất căn bản dưới góc nhìn pricing

**Không gian xác suất** $(\Omega, \mathcal{F}, \mathbb{P})$ là bộ ba nền tảng. $\Omega$ là tập mọi kịch bản có thể của thế giới — mỗi $\omega \in \Omega$ là một "đường đi" đầy đủ của thị trường từ nay đến vô cùng. $\mathcal{F}$ là tập các sự kiện "hỏi được" (một $\sigma$-algebra: đóng dưới phần bù và hợp đếm được), tức là tập những mệnh đề mà ta có thể gán xác suất — ví dụ "cổ phiếu vượt 110 trước cuối năm". $\mathbb{P}$ gán một số trong $[0,1]$ cho mỗi sự kiện, với $\mathbb{P}(\Omega) = 1$. Nghe hàn lâm, nhưng có một điểm ứng dụng cực kỳ quan trọng mà cả cuốn sách này xoay quanh: **cùng một $\Omega$ có thể mang nhiều measure khác nhau**. Measure P (xác suất "thật", cái mà nhà thống kê ước lượng từ dữ liệu lịch sử) và measure $\mathbb{Q}$ (xác suất định giá, cái mà thị trường ngầm dùng) sống trên cùng tập kịch bản $\Omega$ nhưng gán trọng số khác nhau cho từng kịch bản. Đổi measure = đổi trọng số các kịch bản, **không** đổi tập kịch bản, và cũng không đổi kịch bản nào là "có thể xảy ra" (hai measure tương đương thì đồng ý với nhau về việc sự kiện nào có xác suất 0). Chương 4 sẽ khai thác triệt để ý này — nó là toàn bộ phép màu của risk-neutral pricing.

**Biến ngẫu nhiên** $X$ chỉ là một hàm từ kịch bản sang số, $X: \Omega \to \mathbb{R}$. **Kỳ vọng** $\mathbb{E}[X] = \int_\Omega X\,d\mathbb{P}$ là trung bình có trọng số của mọi kịch bản. **Phương sai** $\text{Var}(X) = \mathbb{E}[(X-\mathbb{E}X)^2]$ đo mức phân tán; **độ lệch chuẩn** $\sigma = \sqrt{\text{Var}}$ — trong tài chính gọi là **volatility** khi áp cho returns, và là đại lượng trung tâm của cả nghề định giá option.

**Phân phối chuẩn (normal/Gaussian)** $\mathcal{N}(\mu, \sigma^2)$ có mật độ

$$\phi(x) = \frac{1}{\sigma\sqrt{2\pi}}\, e^{-(x-\mu)^2/2\sigma^2}.$$

Ký hiệu $N(\cdot)$ dùng cho CDF chuẩn tắc (mean 0, variance 1) — chính hàm này xuất hiện trong công thức Black-Scholes ở $N(d_1), N(d_2)$. Normal có hai tính chất vàng khiến nó thống trị mô hình tài chính: tổ hợp tuyến tính của các normal độc lập lại là normal, và một normal được xác định hoàn toàn chỉ bằng mean và variance (mọi moment bậc cao đều là hàm của hai số này). Chính vì thế, khi ta giả định returns là normal, cả bài toán rủi ro thu về việc quản lý hai con số — một sự đơn giản hóa mạnh mẽ, và cũng là nguồn của nhiều tai họa khi đuôi thực tế dày hơn Gaussian.

Vài con số chuẩn tắc đáng thuộc nằm lòng, vì bạn sẽ gặp lại chúng ở VaR, ở confidence interval, ở $N(d_1), N(d_2)$: với $Z \sim \mathcal{N}(0,1)$, xác suất $|Z| \le 1$ là $68\%$ (quy tắc "1-sigma"), $|Z| \le 2$ là $95\%$ ($\approx 1.96$ chính xác), $|Z| \le 3$ là $99.7\%$. Về đuôi một phía — thứ dùng cho VaR — thì $\mathbb{P}(Z \le 1.645) = 95\%$ và $\mathbb{P}(Z \le 2.326) = 99\%$; chính $1.645$ là con số biến "VaR 95%" thành một phép nhân độ lệch chuẩn, và $2.326$ là con số cho "VaR 99%" của Basel. Nhớ ba mốc $1.645, 1.96, 2.326$ là đã cầm nửa bộ đồ nghề rủi ro thị trường.

**Phân phối lognormal** là nhân vật thứ hai. $X$ lognormal nếu $\ln X$ normal. Nếu $\ln X \sim \mathcal{N}(m, s^2)$ thì

$$\mathbb{E}[X] = e^{m + s^2/2}.$$

Hãy để ý số hạng $s^2/2$ — nó sẽ ám bạn suốt sự nghiệp, từ Itô correction đến convexity adjustment. Ta chọn lognormal cho giá tài sản vì hai lý do sâu sắc: giá không âm được (một cổ phiếu không thể có giá $-5$), và returns cộng dồn theo phép **nhân** chứ không phải phép cộng (lãi kép). Log-return $\ln(S_T/S_0)$ mới là đại lượng cộng dồn tự nhiên qua các khoảng thời gian, và giả định nó normal là giả định tối thiểu, đẹp nhất về mặt toán học.

**Ví dụ bằng số về lognormal — mean vs median.** Lấy $S_0 = 100$, drift $\mu = 8\%$, vol $\sigma = 20\%$, $T = 1$ năm. Như sẽ chứng minh ở mục 3.3, dưới GBM ta có $\ln S_1 \sim \mathcal{N}(\ln 100 + \mu - \sigma^2/2,\ \sigma^2)$, tức $m = \ln 100 + 0.08 - 0.02$ và $s = 0.20$. Kỳ vọng dùng công thức trên:

$$\mathbb{E}[S_1] = e^{m + s^2/2} = e^{\ln 100 + 0.08 - 0.02 + 0.02} = 100\,e^{0.08} = 108.33.$$

Số hạng $-0.02$ và $+0.02$ triệt tiêu nhau, để lại đúng $S_0 e^{\mu T}$ — đây là kiểm tra nhất quán đầu tiên: kỳ vọng của giá đúng bằng vốn ban đầu lãi kép liên tục ở drift. Nhưng **median** (kịch bản "ở giữa", giá trị mà một nửa số đường đi rơi dưới nó) lại là

$$\text{median}(S_1) = e^{m} = 100\,e^{0.08 - 0.02} = 100\,e^{0.06} = 106.18,$$

thấp hơn mean tới 2.15 điểm. Vì sao lệch? Phân phối lognormal lệch phải (right-skewed): số ít kịch bản "trúng lớn" — cổ phiếu nhân đôi, nhân ba — kéo mean lên trên kịch bản điển hình, trong khi phần lớn kịch bản co cụm dưới median. Khoảng cách mean − median (ở đây 108.33 vs 106.18) chính là biểu hiện của $\sigma^2/2$ đang làm việc. Mọi nhầm lẫn giữa "trung bình" và "điển hình" trong tài chính — từ quảng cáo hiệu suất quỹ ("return trung bình 8%!") đến định cỡ vị thế theo Kelly (cuốn P-world) — đều quy về việc quên sự lệch này. Người bán quỹ khoe mean; người sống với danh mục nếm median.

**Kỳ vọng có điều kiện** $\mathbb{E}[X \mid \mathcal{F}_t]$ là dự báo tốt nhất về $X$ dựa trên thông tin đến thời điểm $t$ — bản thân nó là một biến ngẫu nhiên (nó phụ thuộc thông tin nào đã đến). **Filtration** $\{\mathcal{F}_t\}_{t\ge 0}$ là dòng thông tin tăng dần theo thời gian, $\mathcal{F}_s \subseteq \mathcal{F}_t$ khi $s \le t$ — cách toán học nói "hôm nay biết nhiều hơn hoặc bằng hôm qua, không bao giờ quên". Công cụ ta dùng nhiều nhất là **tower property** (luật kỳ vọng lặp):

$$\mathbb{E}\big[\mathbb{E}[X \mid \mathcal{F}_t]\big] = \mathbb{E}[X], \qquad \text{tổng quát hơn} \quad \mathbb{E}\big[\mathbb{E}[X \mid \mathcal{F}_t] \,\big|\, \mathcal{F}_s\big] = \mathbb{E}[X \mid \mathcal{F}_s]\ (s \le t).$$

Nó nói: dự báo hôm nay về "dự báo ngày mai" chính là dự báo hôm nay. **Một minh hoạ hai tầng bằng số** để thấy tower property chạy thật. Tưởng tượng một cây nhị phân hai bước: hôm nay giá 100; sau bước 1 nó lên 110 (xác suất $\tfrac12$) hoặc xuống 90 (xác suất $\tfrac12$); từ 110 nó đi tiếp lên 120 hoặc xuống 100 (mỗi nhánh $\tfrac12$), từ 90 nó đi lên 100 hoặc xuống 80 (mỗi nhánh $\tfrac12$). Bốn kết cục cuối là $120, 100, 100, 80$, mỗi cái xác suất $\tfrac14$. Tính trực tiếp $\mathbb{E}[S_2] = \tfrac14(120+100+100+80) = 100$. Bây giờ tính theo tower: kỳ vọng "vòng trong" đứng ở nút 110 là $\tfrac12(120+100)=110$; đứng ở nút 90 là $\tfrac12(100+80)=90$. Kỳ vọng "vòng ngoài" qua bước 1 là $\tfrac12(110)+\tfrac12(90)=100$ — trùng khít. Ta đã tính cùng một con số bằng hai cách, và đó chính xác là cấu trúc **nested Monte Carlo** của XVA (chương 14): vòng trong ước lượng exposure kỳ vọng ở mỗi thời điểm tương lai, vòng ngoài lấy kỳ vọng qua các đường — tower property bằng xương bằng thịt.

**Martingale** là khái niệm quan trọng nhất chương. Quá trình $M_t$ (thích nghi với filtration) là martingale nếu $\mathbb{E}[|M_t|] < \infty$ và

$$\mathbb{E}[M_T \mid \mathcal{F}_t] = M_t \quad \forall\, t \le T.$$

Nghĩa là "trò chơi công bằng": dự báo tốt nhất cho tương lai đúng bằng giá trị hiện tại, không drift. Nếu $\mathbb{E}[M_T \mid \mathcal{F}_t] \ge M_t$ ta gọi là submartingale (trò chơi có lợi cho người chơi, giá trị kỳ vọng trôi lên), $\le$ là supermartingale (trôi xuống — nhớ mẹo: "super" nghe cao nhưng lại đi **xuống", như một casino nơi nhà cái luôn thắng dần).

**Martingale bằng số — random walk 50/50.** Lấy chính random walk của mục 3.2: $M_{n+1} = M_n \pm 1$ với xác suất $\tfrac12$ mỗi chiều, độc lập, xuất phát $M_0 = 0$. Đứng ở bước $n$ với giá trị $M_n$ đã biết, dự báo cho bước sau là

$$\mathbb{E}[M_{n+1} \mid \mathcal{F}_n] = \tfrac12(M_n + 1) + \tfrac12(M_n - 1) = M_n.$$

Kỳ vọng có điều kiện phẳng đúng bằng giá trị hiện tại — đây là martingale, đọc thẳng ra bằng số. Bây giờ **bẻ cong xác suất** để thấy sub/supermartingale: nếu bước lên có xác suất $0.6$, bước xuống $0.4$ (drift dương), thì $\mathbb{E}[M_{n+1}\mid\mathcal{F}_n] = 0.6(M_n+1)+0.4(M_n-1) = M_n + 0.2 > M_n$ — **submartingale**, mỗi bước trôi lên trung bình $+0.2$. Đảo lại, lên $0.4$ / xuống $0.6$ (drift âm) cho $\mathbb{E}[M_{n+1}\mid\mathcal{F}_n] = M_n - 0.2 < M_n$ — **supermartingale**, trôi xuống $-0.2$ mỗi bước. Ba con số $+0, +0.2, -0.2$ là toàn bộ tam giác martingale / sub / super, đo bằng chính cái drift của trò chơi.

**Martingale bằng số — exponential martingale.** Ví dụ liên tục quan trọng nhất, và là nhân vật sẽ trở lại ở Girsanov (mục 3.4): xét $M_t = e^{\sigma W_t - \sigma^2 t/2}$ với $\sigma = 0.2$. Ta chứng minh nó martingale bằng cách kiểm tra $\mathbb{E}[M_2 \mid \mathcal{F}_1] = M_1$ bằng số. Viết $W_2 = W_1 + (W_2 - W_1)$, trong đó gia số $\Delta = W_2 - W_1 \sim \mathcal{N}(0,1)$ độc lập với $\mathcal{F}_1$. Khi đó

$$M_2 = e^{\sigma W_2 - \sigma^2\cdot 2/2} = \underbrace{e^{\sigma W_1 - \sigma^2\cdot 1/2}}_{= M_1,\ \text{đo được tại } t=1}\cdot\; e^{\sigma\Delta - \sigma^2/2}.$$

Lấy kỳ vọng có điều kiện, phần $M_1$ ra ngoài (đã biết tại $t=1$), còn lại là kỳ vọng của $e^{\sigma\Delta - \sigma^2/2}$ với $\Delta \sim \mathcal{N}(0,1)$. Dùng $\mathbb{E}[e^{\sigma\Delta}] = e^{\sigma^2/2}$:

$$\mathbb{E}[M_2 \mid \mathcal{F}_1] = M_1\cdot e^{-\sigma^2/2}\,\mathbb{E}[e^{\sigma\Delta}] = M_1\cdot e^{-\sigma^2/2}\cdot e^{\sigma^2/2} = M_1.$$

Cắm $\sigma = 0.2$ ($\sigma^2/2 = 0.02$): thừa số hiệu chỉnh $e^{-0.02}$ nhân với $\mathbb{E}[e^{0.2\Delta}] = e^{0.02}$ triệt tiêu nhau ra đúng $1$, nên $\mathbb{E}[M_2\mid\mathcal{F}_1] = M_1$. Thử luôn tính $\mathbb{E}[M_1]$ để thấy martingale giữ mức khởi điểm: $\mathbb{E}[M_1] = e^{-0.02}\mathbb{E}[e^{0.2 W_1}] = e^{-0.02}\cdot e^{0.02} = 1 = M_0$. Đây chính là chỗ số hạng $-\sigma^2 t/2$ tồn tại: nó là "phí hiệu chỉnh" $\sigma^2/2$ vừa đủ để dìm cái drift dương mà hàm mũ tự sinh ra, giữ trò chơi công bằng. Nếu bỏ nó — chỉ lấy $e^{\sigma W_t}$ — thì $\mathbb{E}[e^{\sigma W_t}] = e^{\sigma^2 t/2} > 1$ trôi lên (submartingale), đúng như bài Itô số 2 ở mục 3.3 sẽ cho thấy bằng đạo hàm.

Toàn bộ định giá hiện đại gói gọn trong một câu mà bạn sẽ nghe đi nghe lại: **chọn measure sao cho giá tài sản, đo bằng một numéraire phù hợp, là martingale**. Khi đó giá option hôm nay = kỳ vọng (dưới measure đó) của payoff tương lai, chiết khấu. Chương 4 dựng toàn bộ khung risk-neutral từ đúng câu này; ở đây bạn chỉ cần thấm định nghĩa và ba con số vừa rồi: martingale = kỳ vọng có điều kiện phẳng theo thời gian.

## 3.2 Random walk và Brownian motion

Trực giác về Brownian motion tốt nhất đến từ giới hạn của một **random walk** rời rạc: $X_{n+1} = X_n \pm \Delta$ với xác suất 50/50 mỗi bước, các bước độc lập. Sau $n$ bước, $\mathbb{E}[X_n] = X_0$ và $\text{Var}(X_n) = n\Delta^2$. Bây giờ ép bước thời gian $\to 0$: chia mỗi đơn vị thời gian thành nhiều bước nhỏ. Muốn variance hội tụ về một giới hạn hữu hạn khác 0, ta buộc phải để bước không gian co lại theo **căn** của bước thời gian, $\Delta x = \sqrt{\Delta t}$ — vì variance cộng dồn tuyến tính theo số bước, còn số bước tỉ lệ nghịch với $\Delta t$. Đây là điểm mấu chốt: không phải $\Delta x \propto \Delta t$ (thì variance biến mất), mà $\Delta x \propto \sqrt{\Delta t}$. Ở giới hạn, theo định lý giới hạn trung tâm, tổng các bước $\pm$ độc lập hội tụ về một normal, và ta thu được **Brownian motion** (Wiener process) $W_t$, xác định bởi bốn tính chất:

1. $W_0 = 0$;
2. Gia số độc lập: $W_t - W_s$ độc lập với toàn bộ quá khứ đến thời điểm $s$;
3. $W_t - W_s \sim \mathcal{N}(0,\ t-s)$ — gia số normal với variance bằng độ dài khoảng;
4. Đường đi liên tục (theo $t$).

Điểm phản trực giác cần khắc cốt nằm ở tính chất 3: **variance tỉ lệ với thời gian**, nên độ lệch chuẩn tỉ lệ với $\sqrt{t}$. Đây là "quy tắc căn t" ($\sqrt{t}$ scaling) — xương sống của mọi phép quy đổi vol trong tài chính. Vol "10% một năm" nghĩa là độ lệch chuẩn của return một ngày cỡ $10\%/\sqrt{252} \approx 0.63\%$ (dùng 252 ngày giao dịch/năm). Ngược lại, một chuỗi biến động ngày $0.63\%$ khi annualize nhân với $\sqrt{252}$ trở lại $10\%$. Quy tắc $\sqrt{t}$ là lý do $dt$ xuất hiện khắp nơi ở dạng căn ($\sigma\sqrt{dt}$), và là gốc của tính chất kỳ dị nhất của Brownian motion: đường đi **liên tục nhưng không khả vi ở bất cứ đâu**. Trực giác: trên một khoảng nhỏ $\Delta t$, độ dịch chuyển điển hình là $\sqrt{\Delta t}$, nên "vận tốc" $\Delta W/\Delta t \sim 1/\sqrt{\Delta t} \to \infty$. Đường Brownian "run" vô hạn ở mọi thang zoom — phóng to bao nhiêu nó vẫn gồ ghề y hệt (tự đồng dạng). Vì thế calculus thường của Newton-Leibniz, vốn dựa vào đạo hàm tồn tại, **chết** trên đường Brownian; ta phải xây một bộ tính vi phân mới — Itô calculus.

**Quadratic variation** là chìa khóa mở cánh cửa Itô. Với một hàm trơn $f$, khi chia nhỏ lưới thời gian thì tổng bình phương các gia số triệt tiêu: $\sum_i (\Delta f_i)^2 \le \max|\Delta f_i| \cdot \sum_i |\Delta f_i| \to 0$ (vì $\sum|\Delta f|$ bị chặn bởi total variation hữu hạn, còn $\max|\Delta f| \to 0$). Nhưng với Brownian motion, điều kỳ diệu xảy ra:

$$\sum_i (\Delta W_i)^2 \xrightarrow{\ \Delta t \to 0\ } t \qquad \text{(một số } \textbf{xác định}\text{, không ngẫu nhiên!).}$$

Vì sao? Mỗi $(\Delta W_i)^2$ có kỳ vọng $\Delta t_i$ (tính chất 3) và variance $2(\Delta t_i)^2$ (moment bậc 4 của normal). Tổng kỳ vọng là $\sum \Delta t_i = t$; tổng variance là $\sum 2(\Delta t_i)^2 \le 2\max(\Delta t_i)\cdot t \to 0$. Variance của tổng tiến về 0 nên tổng hội tụ **trong $L^2$** (hội tụ theo nghĩa bình phương trung bình, không phải đẳng thức tất định từng đường) về hằng số bằng kỳ vọng của nó, tức $t$. Đây chính là chỗ ngẫu nhiên "tự triệt tiêu": bình phương một nhiễu và cộng dồn, luật số lớn biến nó thành tất định. Ta viết gọn kết quả thành ba quy tắc nhân biểu tượng dùng cơ học hằng ngày:

$$(dW)^2 = dt, \qquad dW \cdot dt = 0, \qquad (dt)^2 = 0.$$

Quy tắc thứ nhất là linh hồn của cả chương: nhiễu ngẫu nhiên bậc một, khi bình phương, sinh ra hiệu ứng **tất định** bậc một theo thời gian. Đó là nguồn gốc của mọi hiệu chỉnh $\frac{1}{2}\sigma^2$ trong tài chính — và của khoảng cách mean − median mà ta vừa thấy. Cần đọc ba đẳng thức này đúng tinh thần: chúng là quy ước ký hiệu cho những giới hạn $L^2$ vừa chứng minh, không phải phép tính tất định tuyệt đối trên từng đường Brownian. Hai quy tắc còn lại chỉ nói $dt$ là "nhỏ bậc cao": tích $dW\cdot dt \sim \sqrt{\Delta t}\cdot \Delta t = (\Delta t)^{3/2}$ và $(dt)^2$ đều tan biến so với $dt$.

**Quadratic variation sờ được bằng số.** Giả sử một cổ phiếu di chuyển đúng $\pm 1\%$ (theo log) mỗi ngày trong 252 ngày. Tổng bình phương các gia số log:

$$\sum_{i=1}^{252} (\Delta \ln S_i)^2 = 252 \times (0.01)^2 = 252 \times 0.0001 = 0.0252.$$

So với công thức lý thuyết $QV = \sigma^2 T$ với $T = 1$ năm: $\sigma^2 = 0.0252$, tức $\sigma = \sqrt{0.0252} = 0.1587 \approx 15.9\%$/năm. Con số này cũng khớp quy tắc căn t: $\sigma_{\text{ngày}} = 1\%$, annualize thành $1\% \times \sqrt{252} = 15.9\%$. Chú ý điều kỳ lạ và sâu sắc: kết quả **không phụ thuộc thứ tự hay dấu** của các cú move — 126 ngày lên rồi 126 ngày xuống, hay lên xuống xen kẽ, hay toàn lên, đều cho cùng $QV = 0.0252$. Chỉ biên độ bình phương đếm. Đây chính là "realized variance" mà một variance swap (chương 6) trả tiền lên trên đó, và là nghĩa vật lý trần trụi của $(dW)^2 = dt$: nhiễu không triệt tiêu khi bình phương, nó **tích lũy tuyến tính theo thời gian**. Chính vì QV chỉ phụ thuộc biên độ mà không phụ thuộc hướng, người ta mới bán được sản phẩm thuần vol tách khỏi hướng — và mới có câu "option là sản phẩm về vol, không phải về hướng" mà ta sẽ gặp ở cuối chương.

## 3.3 SDE và Itô's lemma

**Stochastic differential equation (SDE)** là ngôn ngữ mô tả động học tài sản theo thời gian liên tục:

$$dX_t = \mu(X_t, t)\,dt + \sigma(X_t, t)\,dW_t.$$

Số hạng $\mu$ là **drift** — xu hướng tất định mỗi đơn vị thời gian, phần "trung bình" của chuyển động. Số hạng $\sigma$ là **diffusion/volatility** — biên độ nhiễu ngẫu nhiên, nhân vào $dW_t$. Đọc phương trình như một công thức cập nhật: trong khoảng nhỏ $dt$, giá dịch một khoản tất định $\mu\,dt$ cộng một cú sốc ngẫu nhiên $\sigma\,dW$ với độ lệch chuẩn $\sigma\sqrt{dt}$. Dưới đây là những SDE bạn phải nhận ra mặt ngay:

| Tên | SDE | Dùng cho |
|---|---|---|
| Arithmetic BM | $dX = \mu\,dt + \sigma\,dW$ | Bachelier model; rates khi cho phép âm |
| **Geometric BM (GBM)** | $dS = \mu S\,dt + \sigma S\,dW$ | Cổ phiếu, FX — nền của Black-Scholes |
| Ornstein-Uhlenbeck | $dX = \kappa(\theta - X)\,dt + \sigma\,dW$ | Mean reversion: rates (Vasicek), spread stat-arb |
| CIR | $dX = \kappa(\theta - X)\,dt + \sigma\sqrt{X}\,dW$ | Rates, variance trong Heston |
| Heston variance | $dv = \kappa(\bar v - v)\,dt + \xi\sqrt{v}\,dW$ | Stochastic vol (chương 6) |

Điểm cần lưu ý về cấu trúc: GBM có drift và diffusion **cùng tỉ lệ với $S$** (nên "phần trăm" thay đổi mới là đối tượng ổn định, và giá không bao giờ âm); OU và CIR có drift kéo về mức cân bằng $\theta$ (mean reversion); CIR và Heston có diffusion $\propto \sqrt{X}$ (nên khi $X$ về gần 0 thì nhiễu tắt dần, giữ quá trình không âm — chi tiết ở mục CIR bên dưới).

**Itô's lemma** là "chain rule" của thế giới ngẫu nhiên, công thức quan trọng nhất Q-world. Với hàm $f(x,t)$ đủ trơn ($C^{2,1}$) và $X$ thỏa $dX = \mu\,dt + \sigma\,dW$, ta có

$$df = \left( \frac{\partial f}{\partial t} + \mu\,\frac{\partial f}{\partial x} + \frac{1}{2}\sigma^2\,\frac{\partial^2 f}{\partial x^2} \right) dt \;+\; \sigma\,\frac{\partial f}{\partial x}\,dW.$$

So với chain rule thường, xuất hiện thêm số hạng $\frac{1}{2}\sigma^2 f_{xx}$ trong drift — số hạng "Itô". Nó không phải phép thuật; nó là hệ quả cơ học của $(dW)^2 = dt$. Ta dẫn xuất đầy đủ để bạn thấy tận gốc.

**Chứng minh Itô's lemma (khai triển Taylor bậc hai).** Xét thay đổi của $f$ khi $x$ và $t$ dịch những khoản nhỏ. Khai triển Taylor $f$ đến bậc hai:

$$df = f_t\,dt + f_x\,dX + \tfrac{1}{2}f_{xx}\,(dX)^2 + \tfrac{1}{2}f_{tt}\,(dt)^2 + f_{xt}\,dX\,dt + \cdots$$

Trong calculus thường, mọi số hạng bậc hai — $(dX)^2, (dt)^2, dX\,dt$ — là "nhỏ bậc cao" và bị bỏ, để lại đúng $df = f_t\,dt + f_x\,dX$. Ở đây điểm khác biệt duy nhất, nhưng quyết định, là $dX$ chứa $dW$, và $(dW)^2$ **không** nhỏ bậc cao. Thay $dX = \mu\,dt + \sigma\,dW$ và bình phương, dùng bảng nhân từ mục 3.2 (nhớ ba đẳng thức đó là quy ước cho các giới hạn $L^2$ đã chứng minh, không phải đẳng thức tất định từng đường):

$$(dX)^2 = \mu^2\,\underbrace{(dt)^2}_{=0} + 2\mu\sigma\,\underbrace{dt\,dW}_{=0} + \sigma^2\,\underbrace{(dW)^2}_{=dt} = \sigma^2\,dt.$$

Tương tự $(dt)^2 = 0$ và $dX\,dt = \mu(dt)^2 + \sigma\,dW\,dt = 0$. Vậy trong toàn bộ khai triển Taylor, số hạng bậc hai duy nhất **sống sót** là $\frac{1}{2}f_{xx}(dX)^2 = \frac{1}{2}\sigma^2 f_{xx}\,dt$. Thế lại:

$$df = f_t\,dt + f_x(\mu\,dt + \sigma\,dW) + \tfrac{1}{2}\sigma^2 f_{xx}\,dt = \Big(f_t + \mu f_x + \tfrac{1}{2}\sigma^2 f_{xx}\Big)dt + \sigma f_x\,dW.$$

Đó chính là Itô's lemma, và bây giờ bạn thấy rõ: số hạng $\frac{1}{2}\sigma^2 f_{xx}$ là "hóa thạch" của $(dW)^2 = dt$ kẹt lại trong khai triển Taylor bậc hai. Không có gì hơn thế. Mỗi lần bạn viết Itô, bạn đang khai triển Taylor bậc hai và nhớ rằng chỉ $(dW)^2$ sống sót.

**Ví dụ bắt buộc phải tự làm — giải GBM.** Với $dS = \mu S\,dt + \sigma S\,dW$, áp Itô cho $f = \ln S$. Ở đây $f$ không phụ thuộc $t$ tường minh, $f_x = 1/S$, $f_{xx} = -1/S^2$, và coeffs của $X = S$ là $\mu_S = \mu S$, $\sigma_S = \sigma S$. Thay vào:

$$d(\ln S) = \Big(\underbrace{0}_{f_t} + \mu S\cdot\tfrac{1}{S} + \tfrac{1}{2}(\sigma S)^2\cdot(-\tfrac{1}{S^2})\Big)dt + \sigma S\cdot\tfrac{1}{S}\,dW = \Big(\mu - \tfrac{\sigma^2}{2}\Big)dt + \sigma\,dW.$$

Vế phải giờ có drift và diffusion **hằng số** (không còn phụ thuộc $S$) — nên tích phân được trực tiếp từ 0 đến $T$:

$$\ln S_T - \ln S_0 = \Big(\mu - \tfrac{\sigma^2}{2}\Big)T + \sigma W_T \;\Longrightarrow\; S_T = S_0 \exp\!\left[\Big(\mu - \tfrac{\sigma^2}{2}\Big)T + \sigma W_T\right].$$

Vì $W_T \sim \mathcal{N}(0, T)$, ta có $\ln S_T \sim \mathcal{N}\big(\ln S_0 + (\mu - \sigma^2/2)T,\ \sigma^2 T\big)$ — tức $\ln S_T$ normal, nên $S_T$ **lognormal**, đúng như đã hứa ở mục 3.1 (và đúng bộ tham số $m, s$ ta đã dùng cho ví dụ mean-vs-median). Hãy dừng lại ở số hạng $\mu - \sigma^2/2$: **growth rate của log-giá thấp hơn drift một khoản $\sigma^2/2$** — hiện tượng "volatility drag". Ví dụ số trần trụi nhất: một tài sản lên $50\%$ rồi xuống $50\%$ thì $1.5 \times 0.5 = 0.75$ — còn $75\%$ vốn, dù "trung bình cộng của hai return là $0\%$". Nối con số $75\%$ đó với $\sigma^2/2$ của chính chương cho tường minh: hai cú move $\pm 50\%$ ứng với log-return $\ln 1.5 = +0.405$ và $\ln 0.5 = -0.693$; độ lệch chuẩn của cặp $\{+0.405, -0.693\}$ quanh trung bình của chúng là $|0.405-(-0.693)|/2 = 0.549$, nên $\sigma^2/2 \approx 0.549^2/2 = 0.151$. Kiểm tra: log-return tích lũy thực tế là $\ln 0.75 = -0.288$, đúng bằng $2\times(\text{trung bình log-return})$ trong đó trung bình log-return $= \tfrac12(0.405-0.693) = -0.144 \approx -\sigma^2/2$. Nói cách khác "$75\%$" và "$-\sigma^2/2$ mỗi bước" là **cùng một hiện tượng đo bằng hai thước** — một cái đọc trên vốn còn lại, một cái đọc trên log-drift. Vol ăn mòn compound growth, và khoản ăn mòn đó chính là $\sigma^2/2$. Sự thật này quan trọng ở cả P-world (Kelly criterion tối đa hóa $\mu - \sigma^2/2$, không phải $\mu$) lẫn Q-world (mọi công thức có $\sigma^2/2$ đều là biểu hiện của nó).

Ta cũng kiểm tra lại $\mathbb{E}[S_T]$ để thấy $\sigma^2/2$ triệt tiêu đẹp. Với $Z = \sigma W_T \sim \mathcal{N}(0, \sigma^2 T)$, dùng $\mathbb{E}[e^Z] = e^{\text{Var}(Z)/2} = e^{\sigma^2 T/2}$:

$$\mathbb{E}[S_T] = S_0\,e^{(\mu - \sigma^2/2)T}\,\mathbb{E}[e^{\sigma W_T}] = S_0\,e^{(\mu - \sigma^2/2)T}\,e^{\sigma^2 T/2} = S_0\,e^{\mu T}.$$

Với $S_0 = 100, \mu = 8\%, T = 1$: $\mathbb{E}[S_1] = 100e^{0.08} = 108.33$ — khớp chính xác mục 3.1. Cái $-\sigma^2/2$ trong exponent (kịch bản điển hình thấp hơn) bị cân lại đúng bằng cái $+\sigma^2/2$ từ đuôi lognormal (kịch bản trúng lớn), nên kỳ vọng về đúng drift trần. Đó là toàn bộ câu chuyện mean-vs-median viết bằng đại số.

**Ba bài Itô làm tay thêm.** Mỗi bài chỉ vài dòng, nhưng làm đủ ba thì Itô trở thành phản xạ.

*Bài 1:* $f = W_t^2$. Ở đây $X = W$ nên $\mu = 0, \sigma = 1$; $f_x = 2W$, $f_{xx} = 2$. Itô cho $d(W^2) = (0 + 0 + \frac{1}{2}\cdot 1\cdot 2)\,dt + 1\cdot 2W\,dW = 2W\,dW + dt$. Tích phân hai vế từ 0 đến $t$: $W_t^2 = 2\int_0^t W\,dW + t$. Lấy kỳ vọng, và nhớ tích phân Itô là martingale nên $\mathbb{E}[\int_0^t W\,dW] = 0$: ta được $\mathbb{E}[W_t^2] = t$ — khớp đúng định nghĩa Brownian (variance = t). Đảo lại, ta cũng vừa suy ra kết quả nổi tiếng

$$\int_0^t W_s\,dW_s = \frac{W_t^2 - t}{2}.$$

So với calculus thường (nơi $\int u\,du = u^2/2$), tích phân Itô lệch đúng một khoản $-t/2$ — lại là dấu vân tay của $(dW)^2 = dt$. Nếu bạn quên số hạng $-t/2$ này, mọi tính variance sau đó sẽ sai.

*Bài 2:* $f = e^{\sigma W_t}$. Với $X = W$ ($\mu=0,\sigma_X=1$), $f_x = \sigma e^{\sigma W}$, $f_{xx} = \sigma^2 e^{\sigma W}$: $df = \frac{1}{2}\sigma^2 e^{\sigma W}\,dt + \sigma e^{\sigma W}\,dW$. Đọc kết quả: hàm mũ của một martingale **không** phải martingale — nó có drift dương $\frac{1}{2}\sigma^2$, luôn trôi lên (đúng cái submartingale ta thấy bằng số ở mục 3.1). Để "sửa" thành martingale ta phải trừ đi phần drift trong exponent: quá trình $e^{\sigma W_t - \sigma^2 t/2}$ (kiểm tra bằng Itô: đặt $g = \sigma W - \sigma^2 t/2$, drift từ $-\sigma^2/2$ và từ $\frac12\sigma^2$ triệt tiêu, còn $d(\cdot) = \sigma(\cdot)dW$) mới là martingale thực sự — gọi là **exponential martingale**, đúng nhân vật ta đã kiểm tra bằng số ($\sigma=0.2$) ở mục 3.1 và là nhân vật chính trong chứng minh Girsanov ở mục 3.4. Lại một lần nữa $\sigma^2/2$ xuất hiện, lần này như "phí hiệu chỉnh" để giữ martingale.

*Bài 3:* giải OU $dX = \kappa(\theta - X)\,dt + \sigma\,dW$. Mẹo giống ODE thường: nhân integrating factor $e^{\kappa t}$ và áp Itô cho $Y = e^{\kappa t}X_t$. Vì $Y = g(X,t)$ với $g_t = \kappa e^{\kappa t}X$, $g_x = e^{\kappa t}$, $g_{xx}=0$: $dY = \kappa e^{\kappa t}X\,dt + e^{\kappa t}\big[\kappa(\theta-X)dt + \sigma dW\big] = \kappa\theta e^{\kappa t}\,dt + \sigma e^{\kappa t}\,dW$ (các số hạng $X$ triệt tiêu). Tích phân và nhân lại $e^{-\kappa t}$:

$$X_t = \theta + (X_0 - \theta)e^{-\kappa t} + \sigma\int_0^t e^{-\kappa(t-s)}\,dW_s.$$

Kỳ vọng $\mathbb{E}[X_t] = \theta + (X_0 - \theta)e^{-\kappa t}$ hồi về $\theta$ theo cấp số mũ. Variance dừng (khi $t \to \infty$) tính bằng Itô isometry: $\text{Var}(X_\infty) = \sigma^2\int_0^\infty e^{-2\kappa u}\,du = \sigma^2/(2\kappa)$. Half-life của độ lệch (thời gian để $e^{-\kappa t} = 1/2$) là $\ln 2/\kappa$.

**Cắm số cho OU (Vasicek trên short rate).** Lấy bộ tham số thực tế của một short-rate Vasicek: mean-reversion speed $\kappa = 0.5$/năm, mức cân bằng $\theta = 3\%$, vol $\sigma = 1\%$ (tức $0.01$), xuất phát $X_0 = 5\%$. Kỳ vọng tại $t=1$ năm:

$$\mathbb{E}[X_1] = 0.03 + (0.05 - 0.03)e^{-0.5} = 0.03 + 0.02\times 0.6065 = 0.0421 = 4.21\%,$$

đã đi được hơn nửa đường từ $5\%$ về $3\%$. Half-life:

$$\text{half-life} = \frac{\ln 2}{\kappa} = \frac{0.693}{0.5} = 1.386\ \text{năm},$$

đọc là "mỗi ~1.4 năm, độ lệch khỏi mức cân bằng co lại một nửa". Variance dừng và độ lệch chuẩn dừng:

$$\text{Var}(X_\infty) = \frac{\sigma^2}{2\kappa} = \frac{0.01^2}{2\times 0.5} = \frac{0.0001}{1} = 0.0001, \qquad \text{sd}(X_\infty) = \sqrt{0.0001} = 1\% .$$

Vậy về dài hạn, short rate dao động quanh $3\%$ với độ lệch chuẩn $1\%$ — tức khoảng $68\%$ thời gian nằm trong $[2\%, 4\%]$ (dùng đúng quy tắc 1-sigma ở mục 3.1). Con số half-life $1.386$ năm này xuất hiện lại y hệt ở stat-arb bên cuốn P-world: hai thế giới dùng chung một SDE cho hai mục đích khác nhau (rates modeling ở đây, mean-reversion trading ở đó).

**Giải CIR — sơ lược.** CIR $dX = \kappa(\theta - X)\,dt + \sigma\sqrt{X}\,dW$ khác OU ở chỗ diffusion là $\sigma\sqrt{X}$ thay vì $\sigma$ hằng. Hệ quả trực tiếp: khi $X$ về gần 0, nhiễu tắt dần ($\sqrt{X}\to 0$), trong khi drift $\kappa\theta > 0$ đẩy lên — nên quá trình bị "hút khỏi" biên 0. Định lượng, điều kiện **Feller** $2\kappa\theta \ge \sigma^2$ đảm bảo $X$ không bao giờ chạm 0 (nếu vi phạm, $X$ có thể chạm 0 rồi bật lại). Vì $\sqrt{X}$ không cho ta nghiệm dạng đóng đẹp như GBM/OU, ta không "giải" CIR thành một biểu thức tường minh của $W_T$; thay vào đó ta khai thác được **moments** và **phân phối**. Lấy kỳ vọng hai vế (số hạng $dW$ mất): $\frac{d}{dt}\mathbb{E}[X_t] = \kappa(\theta - \mathbb{E}[X_t])$, một ODE tuyến tính cho ra đúng dạng OU: $\mathbb{E}[X_t] = \theta + (X_0 - \theta)e^{-\kappa t}$. Với moment bậc hai, áp Itô cho $X^2$ ($f_x = 2X, f_{xx}=2$, và $(dX)^2 = \sigma^2 X\,dt$) rồi lấy kỳ vọng, ta được một ODE tuyến tính khác cho $\mathbb{E}[X_t^2]$; giải nó cho variance hữu hạn, và ở trạng thái dừng $\text{Var}(X_\infty) = \sigma^2\theta/(2\kappa)$. Về phân phối, CIR có $X_t$ tỉ lệ với một **non-central chi-squared** — đây là lý do sâu xa vì sao Heston (nơi variance chạy CIR) có characteristic function dạng đóng và định giá được bằng Fourier (chương 7).

**Cắm số cho CIR (variance process kiểu Heston).** Lấy đúng bộ tham số điển hình của variance process trong Heston: $\kappa = 2$, $\theta = 0.04$ (tức long-run variance ứng với vol dài hạn $\sqrt{0.04} = 20\%$), $\sigma = 0.3$ (vol-of-vol), xuất phát $X_0 = 0.04$. **Kiểm tra Feller** trước:

$$2\kappa\theta = 2\times 2\times 0.04 = 0.16 \quad\ge\quad \sigma^2 = 0.3^2 = 0.09.$$

$0.16 \ge 0.09$ — thoả điều kiện Feller, nên variance không bao giờ chạm 0 (đúng ràng buộc ta muốn cho một quá trình variance). Vì $X_0 = \theta$, kỳ vọng đứng yên: $\mathbb{E}[X_t] = 0.04 + (0.04 - 0.04)e^{-2t} = 0.04$ với mọi $t$ — variance kỳ vọng luôn bằng long-run $0.04$. Variance dừng của chính quá trình variance:

$$\text{Var}(X_\infty) = \frac{\sigma^2\theta}{2\kappa} = \frac{0.3^2\times 0.04}{2\times 2} = \frac{0.09\times 0.04}{4} = \frac{0.0036}{4} = 0.0009,$$

nên độ lệch chuẩn dừng của variance là $\sqrt{0.0009} = 0.03$. Đọc con số: variance $v$ dao động quanh $0.04$ với độ lệch chuẩn $0.03$ — dao động lớn so với mức trung bình, đúng bản chất "vol biến động mạnh" mà Heston cần để tạo smile. Nắm được: CIR không cho nghiệm-đường tường minh, nhưng cho moments qua các ODE tuyến tính và một phân phối biết mặt (non-central chi-squared) — đủ để calibrate và định giá.

**Pseudo-code mô phỏng GBM** (mảnh code đầu tiên của mọi pricing library, thuộc `src/numerics`):

```
S[0] = S0
for i in 1..n:
    Z = normal()                        // N(0,1)
    S[i] = S[i-1] * exp((r - 0.5*sigma^2)*dt + sigma*sqrt(dt)*Z)
```

Chú ý ta dùng **nghiệm exact** — chính là $S_T = S_0\exp[(r - \frac{\sigma^2}{2})dt + \sigma\sqrt{dt}Z]$ mà ta vừa dẫn ở trên — chứ không phải bước Euler thô $S_{i+1} = S_i(1 + r\,dt + \sigma\sqrt{dt}\,Z)$. Với GBM, nghiệm exact **không có discretization bias**: dù bước một năm một lần cũng cho phân phối đúng, vì $\ln S$ có gia số hằng số nên rời rạc hóa chính xác. Số hạng $-0.5\sigma^2\,dt$ trong exponent là chỗ dễ quên nhất và là bug nhập môn số một: bỏ nó thì giá mô phỏng drift cao hơn $r$ một khoản $\sigma^2/2$, và mọi kiểm tra martingale (giá chiết khấu phải là martingale dưới $\mathbb{Q}$) đều thất bại. Nhìn dòng code này, bạn đang nhìn Itô's lemma đã đóng gói.

**Itô isometry** là công cụ cuối cùng của mục, dùng khi cần tính variance của một tích phân ngẫu nhiên:

$$\mathbb{E}\!\left[\Big(\int_0^t g_s\,dW_s\Big)^2\right] = \mathbb{E}\!\left[\int_0^t g_s^2\,ds\right].$$

Nó biến một kỳ vọng của bình phương tích phân Itô (khó) thành một tích phân thường của $g^2$ (dễ). **Ví dụ số độc lập, $g$ hằng.** Lấy $g_s \equiv 2$ và $t = 3$: khi đó $\int_0^3 2\,dW_s = 2W_3 \sim \mathcal{N}(0, 4\times 3)$, nên variance $= 12$. Kiểm bằng isometry: $\mathbb{E}[\int_0^3 2^2\,ds] = \int_0^3 4\,ds = 12$ — trùng khít. **Ví dụ số thứ hai, $g$ giảm mũ** (đúng dạng gặp ở OU): lấy $g_s = e^{-\kappa(t-s)}$ với $\kappa = 0.5$, $t = 1$. Isometry cho variance của $\int_0^1 e^{-0.5(1-s)}dW_s$ bằng

$$\int_0^1 e^{-2\times 0.5\times(1-s)}\,ds = \int_0^1 e^{-(1-s)}\,ds = \big[e^{-(1-s)}\big]_0^1 = 1 - e^{-1} = 0.632.$$

Đây chính là mảnh dùng để ra variance dừng OU/CIR: cho $t\to\infty$ thì tích phân $\sigma^2\int_0^\infty e^{-2\kappa u}du = \sigma^2/(2\kappa)$, khớp con số $\text{sd}(X_\infty)=1\%$ ta cắm ở trên. Kèm theo là sự thật ta đã tựa vào nhiều lần: tích phân Itô $\int g\,dW$ là **martingale** (kỳ vọng 0, không drift). Từ đó rút ra một heuristic vàng cho cả chương: **"kiểm tra martingale" = "kiểm tra hệ số của $dt$ bằng 0"**. Bất cứ khi nào bạn viết một quá trình dưới dạng Itô và thấy phần $dt$ triệt tiêu, bạn có martingale ngay.

## 3.4 Mở rộng nhiều chiều và các công cụ còn lại

Thế giới thực nhiều hơn một nguồn ngẫu nhiên: một trade XVA đồng thời phơi nhiễm rates, FX và credit, mỗi cái một Brownian. **Itô hai chiều** với hai Brownian tương quan $dW^1\,dW^2 = \rho\,dt$ mở rộng công thức một cách tự nhiên. Với $f(X, Y, t)$ và $dX = \mu_1 dt + \sigma_1 dW^1$, $dY = \mu_2 dt + \sigma_2 dW^2$, khai triển Taylor bậc hai giờ có thêm số hạng chéo $\frac{1}{2}\cdot 2\, f_{xy}\,dX\,dY$, và $dX\,dY = \sigma_1\sigma_2\,dW^1 dW^2 = \rho\sigma_1\sigma_2\,dt$. Kết quả: drift nhận thêm một **cross-term** $\rho\sigma_1\sigma_2 f_{xy}$. Số hạng này là toàn bộ lý do correlation quan trọng trong Heston (giá + variance, thường $\rho < 0$ tạo skew), quanto (tài sản nước ngoài + tỉ giá), basket, và mọi bài XVA đa yếu tố.

**Cholesky decomposition — sinh shock tương quan.** Để sinh số ngẫu nhiên tương quan ta phân rã ma trận correlation $\Sigma = LL^\top$ với $L$ tam giác dưới: lấy vector $Z$ các normal **độc lập** chuẩn tắc, thì $LZ$ có đúng correlation mong muốn. Điểm cần nói rõ về notation để khỏi hiểu sai: Cholesky sinh ra các **shock chuẩn tắc cho gia số** (các $dW$, hay tương đương các gia số một bước), **không** phải cho bản thân quá trình $W^1_t, W^2_t$ vốn có variance $t$. Cụ thể một bước rời rạc: $dW^1 = Z_1\sqrt{dt}$ và $dW^2 = (\rho Z_1 + \sqrt{1-\rho^2}\,Z_2)\sqrt{dt}$, với $Z_1, Z_2 \sim \mathcal{N}(0,1)$ độc lập. Hai shock chuẩn tắc tương quan bên trong là $\varepsilon^1 = Z_1$ và $\varepsilon^2 = \rho Z_1 + \sqrt{1-\rho^2}\,Z_2$; kiểm tra nhanh bằng đại số: $\mathbb{E}[\varepsilon^1\varepsilon^2] = \rho\,\mathbb{E}[Z_1^2] + \sqrt{1-\rho^2}\,\mathbb{E}[Z_1 Z_2] = \rho\cdot 1 + \sqrt{1-\rho^2}\cdot 0 = \rho$.

**Cắm số cho Cholesky ($\rho = -0.7$, đúng dấu skew equity).** Lấy $\rho = -0.7$ (correlation âm giữa giá và vol điển hình của equity, sinh ra volatility skew). Ma trận $L$ hai chiều:

$$L = \begin{pmatrix} 1 & 0 \\ \rho & \sqrt{1-\rho^2} \end{pmatrix} = \begin{pmatrix} 1 & 0 \\ -0.7 & \sqrt{1 - 0.49} \end{pmatrix} = \begin{pmatrix} 1 & 0 \\ -0.7 & 0.7141 \end{pmatrix},$$

vì $\sqrt{1 - 0.49} = \sqrt{0.51} = 0.7141$. Giả sử rút được hai số độc lập $Z_1 = 1.2$ và $Z_2 = -0.4$ từ máy sinh normal. Khi đó shock tương quan là

$$\varepsilon^1 = Z_1 = 1.2, \qquad \varepsilon^2 = -0.7\times 1.2 + 0.7141\times(-0.4) = -0.84 - 0.2856 = -1.1256.$$

Người đọc thấy phép sinh số chạy thật: cú sốc giá $\varepsilon^1 = +1.2$ (giá bật lên) kéo theo cú sốc vol $\varepsilon^2 = -1.126$ có xu hướng ngược dấu — đúng cơ chế "giá lên thì vol xuống" của $\rho < 0$. Chạy hàng triệu cặp $(Z_1, Z_2)$ như vậy, correlation mẫu của $(\varepsilon^1, \varepsilon^2)$ hội tụ về đúng $-0.7$. Đây là chuẩn công nghiệp trong `src/numerics` của mọi pricing library.

**Feynman-Kac** là cây cầu nối hai nửa của Q-world. **Phát biểu rõ ràng:** giả sử $V(x,t)$ thỏa PDE lùi

$$\frac{\partial V}{\partial t} + \mu(x,t)\frac{\partial V}{\partial x} + \frac{1}{2}\sigma^2(x,t)\frac{\partial^2 V}{\partial x^2} - r\,V = 0, \qquad V(x,T) = h(x),$$

với điều kiện cuối (terminal condition) là payoff $h$ tại maturity $T$. Khi đó nghiệm biểu diễn được bằng một **kỳ vọng**:

$$V(x,t) = \mathbb{E}\!\left[\,e^{-r(T-t)}\,h(X_T)\;\middle|\; X_t = x\right],$$

trong đó $X$ chạy theo SDE $dX = \mu(X,t)\,dt + \sigma(X,t)\,dW$ (đúng $\mu, \sigma$ trong PDE). Ta phác chứng minh để thấy nó không huyền bí: đặt $Y_s = e^{-r(s-t)}V(X_s, s)$ và áp Itô. Phần drift của $dY_s$ đúng bằng $e^{-r(s-t)}\big[V_t + \mu V_x + \frac{1}{2}\sigma^2 V_{xx} - rV\big]ds$ — mà ngoặc vuông bằng 0 do PDE. Vậy $Y$ chỉ còn số hạng $dW$, tức $Y$ là **martingale**. Áp tính chất martingale giữa $s=t$ và $s=T$: $Y_t = \mathbb{E}[Y_T \mid X_t = x]$, tức $V(x,t) = \mathbb{E}[e^{-r(T-t)}V(X_T,T) \mid X_t = x] = \mathbb{E}[e^{-r(T-t)}h(X_T)\mid X_t=x]$. Xong. Feynman-Kac chỉ là "PDE ⟺ martingale ⟺ kỳ vọng chiết khấu".

**Feynman-Kac bằng số — một giá, hai đường tính.** Lấy đúng call vanilla chuẩn của sách: $S_0 = 100$, $K = 100$, $r = 5\%$, $\sigma = 20\%$, $T = 1$, không dividend. Giá đúng của nó là $C = 10.45$ (ta sẽ dẫn công thức Black-Scholes đầy đủ ở chương 5). Feynman-Kac khẳng định con số $10.45$ này ra được bằng **hai con đường tương đương**:

- **Đường PDE:** giải Black-Scholes PDE $V_t + rSV_S + \tfrac12\sigma^2 S^2 V_{SS} - rV = 0$ với điều kiện cuối $V(S,T) = (S-K)^+$ bằng finite difference trên lưới — đọc giá tại $(S=100, t=0)$ ra $10.45$.
- **Đường Monte Carlo:** tính kỳ vọng $C = \mathbb{E}^{\mathbb{Q}}[e^{-rT}(S_T - K)^+]$ bằng cách sinh hàng triệu đường $S_T = 100\exp[(0.05 - 0.02) + 0.2 Z]$ (đúng pseudo-code GBM ở mục 3.3, với $Z\sim\mathcal{N}(0,1)$), lấy payoff $(S_T-100)^+$, chiết khấu $e^{-0.05}$ rồi trung bình — cũng hội tụ về $10.45$.

Hai máy tính hoàn toàn khác nhau, cùng một con số, vì Feynman-Kac bảo chúng là hai cách viết của cùng một đại lượng. Cây cầu trừu tượng "PDE ⟺ kỳ vọng" giờ là con số $10.45$ sờ được.

Hệ quả thực dụng thì khổng lồ: **mọi bài pricing giải được bằng hai cách tương đương**. Một là giải PDE trực tiếp bằng finite differences (mạnh cho low-dimension và bài có early exercise như American/Bermudan). Hai là tính kỳ vọng bằng Monte Carlo (mạnh cho high-dimension và path-dependence, nơi lưới PDE nổ theo số chiều). Chọn engine nào cho instrument nào là quyết định kiến trúc trung tâm của một pricing library (chương 12) — và là lý do trong `quantc`, `src/engines` được tách khỏi `src/models`: một model (ví dụ Heston) có thể chạy qua nhiều engine (Fourier, PDE, hay Monte Carlo) tùy instrument.

**Girsanov theorem** đóng nốt bộ công cụ. Phát biểu thực dụng: đổi từ measure P sang một measure $\mathbb{Q}$ **tương đương** = đổi drift của Brownian motion, **giữ nguyên volatility**. Cụ thể, tồn tại process $\lambda$ (market price of risk) sao cho $dW^{\mathbb{Q}}_t = dW^{\mathbb{P}}_t + \lambda\,dt$ là Brownian motion dưới $\mathbb{Q}$. Đây chính là cơ chế toán học cho phép chương 4 "xóa" drift thật $\mu$ khỏi công thức giá — còn vol thì không measure nào xóa được, và đó là lý do sâu xa vì sao **option là sản phẩm về vol, không phải về hướng**: đổi measure viết lại drift theo ý muốn, nhưng $\sigma$ trơ ra, nên giá option chỉ phụ thuộc $\sigma$.

**Girsanov bằng số.** Một cổ phiếu có drift thật $\mu = 8\%$, lãi suất phi rủi ro $r = 3\%$, vol $\sigma = 20\%$. Market price of risk:

$$\lambda = \frac{\mu - r}{\sigma} = \frac{0.08 - 0.03}{0.20} = 0.25,$$

đọc là "mỗi đơn vị rủi ro (vol) được thị trường trả 0.25 đơn vị excess return" — đây là Sharpe ratio của tài sản. Girsanov nói: đặt $W^{\mathbb{Q}}_t = W^{\mathbb{P}}_t + 0.25\,t$ thì dưới $\mathbb{Q}$, SDE trở thành $dS = \mu S\,dt + \sigma S\,dW^{\mathbb{P}} = \mu S\,dt + \sigma S(dW^{\mathbb{Q}} - \lambda\,dt) = (\mu - \sigma\lambda)S\,dt + \sigma S\,dW^{\mathbb{Q}}$. Thay số: $\mu - \sigma\lambda = 0.08 - 0.20\times 0.25 = 0.03 = r$. Vậy drift thành đúng $r$, **vol vẫn 20%**. Mật độ chuyển measure (đạo hàm Radon-Nikodym $d\mathbb{Q}/d\mathbb{P}$) chính là exponential martingale $e^{-\lambda W^{\mathbb{P}}_T - \lambda^2 T/2}$ — đúng nhân vật ở bài Itô số 2 (và ở ví dụ martingale bằng số mục 3.1), và số hạng $-\lambda^2 T/2 = -0.03125\,T$ lại là một $\sigma^2/2$ khác đội lốt. Diễn giải trực quan: các kịch bản giá xuống được "tăng cân" (nhân trọng số lớn hơn), kịch bản giá lên "giảm cân", vừa đủ để cổ phiếu trông như chỉ sinh lãi $r$ dưới $\mathbb{Q}$. **Không kịch bản nào bị xóa hay thêm** — tập $\Omega$ giữ nguyên, chỉ trọng số $\mathbb{P}$-vs-$\mathbb{Q}$ đổi. Đó là nghĩa chính xác của "measure tương đương", và là toàn bộ ý tưởng ở mục 3.1 giờ thành công thức.

**Poisson process và jumps.** GBM có một khuyết điểm chí tử: đường đi liên tục, không nhảy, nên đuôi phân phối quá mỏng — nó không bao giờ tạo ra cú sập $-20\%$ trong một ngày mà thị trường thật vẫn tạo ra. Để vá, ta thêm **Poisson process**: một bộ đếm $N_t$ các sự kiện hiếm với cường độ (intensity) $\lambda$, trong đó số sự kiện trong khoảng độ dài $\tau$ tuân theo phân phối Poisson với trung bình $\lambda\tau$, và xác suất **không** có sự kiện nào (thời gian sống sót) đến $t$ là

$$\mathbb{P}(N_t = 0) = e^{-\lambda t}.$$

Đây là nền của hazard rate model trong credit (chương 13): $\lambda$ là hazard rate, $e^{-\lambda t}$ là survival probability. Ví dụ số nhất quán với bộ CDS của sách: par spread 5Y $= 120\,\text{bp}$, recovery $R = 40\%$ cho $\lambda \approx s/(1-R) = 0.012/0.6 = 2\%$, nên xác suất sống sót 5 năm là $e^{-0.02\times 5} = e^{-0.10} = 90.5\%$ — tức ~9.5% khả năng vỡ nợ trong 5 năm.

**Jump-diffusion Merton.** Ghép khuếch tán liên tục (GBM) với các cú nhảy Poisson, ta được SDE Merton:

$$\frac{dS_t}{S_{t^-}} = (\mu - \lambda k)\,dt + \sigma\,dW_t + (J - 1)\,dN_t,$$

trong đó $dN_t$ là gia số Poisson (bằng 1 khi có nhảy tại $t$, ngược lại 0), $J$ là hệ số nhân giá khi nhảy (thường $\ln J \sim \mathcal{N}(\mu_J, \sigma_J^2)$), và $k = \mathbb{E}[J - 1] = e^{\mu_J + \sigma_J^2/2} - 1$ là bước nhảy kỳ vọng. Số hạng $-\lambda k\,dt$ trong drift là **compensator**: nó trừ đi phần drift trung bình mà các cú nhảy đóng góp, để $\mathbb{E}[S_T] = S_0 e^{\mu T}$ vẫn giữ đúng (nếu quên compensator, thêm jumps sẽ vô tình đổi drift — lại cùng loại lỗi $\sigma^2/2$ nhưng cho jumps). Vì diffusion và jumps độc lập, ta cộng đóng góp variance của chúng:

$$\text{Var}(\ln S_T) = \underbrace{\sigma^2 T}_{\text{diffusion}} + \underbrace{\lambda T\,(\mu_J^2 + \sigma_J^2)}_{\text{jumps}}.$$

Ví dụ số: $\sigma = 20\%$, $T=1$, cường độ nhảy $\lambda = 0.5$/năm (trung bình nửa cú nhảy một năm), cú nhảy trung bình $\mu_J = -10\%$ với $\sigma_J = 15\%$. Đóng góp variance từ jumps là $0.5\times(0.10^2 + 0.15^2) = 0.5\times 0.0325 = 0.01625$, so với diffusion $0.04$. Tổng $\text{Var}(\ln S_1) = 0.04 + 0.01625 = 0.05625$, tức vol tổng $\sqrt{0.05625} = 23.7\%$ — jumps đẩy vol từ $20\%$ lên $23.7\%$. Quan trọng hơn con số vol: vì $\mu_J = -10\% < 0$, jumps làm phân phối **lệch trái** (negative skewness) và **đuôi dày** (excess kurtosis) — đúng hình dạng mà thị trường equity thật thể hiện, và đúng cơ chế sinh ra volatility skew (put OTM đắt hơn call OTM) mà một GBM thuần túy không thể tạo ra. Đây là lý do jump-diffusion và các họ mô hình nhảy (chương 7-8) tồn tại: chúng cho phân phối return có skew và fat tail nội sinh, thay vì phải bịa bằng một implied vol khác nhau cho mỗi strike.

Kết lại, ta đã có đủ ba trụ để bước vào định giá: Itô's lemma để biến đổi giữa các quá trình, Feynman-Kac để nối PDE với kỳ vọng, và Girsanov để đổi measure. Chương 4 dùng đúng ba trụ này dựng nên khung risk-neutral: chọn $\mathbb{Q}$ để giá chiết khấu thành martingale (Girsanov cho phép), viết giá thành kỳ vọng dưới $\mathbb{Q}$ (định nghĩa martingale), rồi tính kỳ vọng đó hoặc bằng công thức đóng, PDE, hay Monte Carlo (Feynman-Kac bảo đảm tương đương). Và mỗi lần bạn thấy một $\sigma^2/2$ xuất hiện trong công thức nào đó về sau, hãy nhớ nó bắt đầu ở đây — từ đúng một dòng $(dW)^2 = dt$.

# Chương 4: No-arbitrage và định giá risk-neutral

Chương này là **trái tim khái niệm của toàn bộ Q-world**. Mọi thứ trước nó — tài chính cơ sở ở Chương 2, giải tích ngẫu nhiên ở Chương 3 — chỉ là dụng cụ; mọi thứ sau nó — Black-Scholes, smile, exotics, rates, credit, XVA — chỉ là ứng dụng của một ý tưởng duy nhất được trình bày ở đây. Nếu có một chương trong cả cuốn sách bạn phải đọc chậm, đọc lại, và làm lại bằng bút chì cho tới khi thấm vào xương, thì là chương này. Điều đặc biệt là ý tưởng cốt lõi không cần một công cụ toán nào cao siêu: toàn bộ triết lý gói gọn trong một cây nhị phân một bước với bốn con số, và phần còn lại của sự nghiệp một quant chỉ là mở rộng cây đó ra nhiều bước, nhiều tài sản, và thời gian liên tục.

## 4.1 Câu hỏi sai và câu hỏi đúng

Hãy bắt đầu bằng câu hỏi mà gần như ai mới vào nghề cũng hỏi, vì nó tự nhiên đến mức khó tin là sai: "Giá của một option chẳng phải chỉ là kỳ vọng của payoff, chiết khấu về hiện tại hay sao?" Viết ra:

$$C_0 \stackrel{?}{=} e^{-rT}\,\mathbb{E}^{\mathbb{P}}\left[(S_T - K)^+\right].$$

Ở đây $\mathbb{P}$ là **measure thực** — phân phối thật của giá cổ phiếu mà một nhà kinh tế lượng ước lượng từ dữ liệu lịch sử. Công thức này **sai**, và hiểu *vì sao nó sai* chính là hiểu vì sao cả ngành tồn tại.

Nó sai vì payoff của option là rủi ro, và con người thì ngại rủi ro. Một nhà đầu tư đòi được đền bù để gánh rủi ro — đó là **risk premium**. Nhưng mỗi người ngại rủi ro một mức khác nhau: một quỹ hưu trí thận trọng đòi premium cao, một hedge fund liều lĩnh đòi ít hơn. Nếu giá option bằng kỳ vọng thực chiết khấu ở lãi suất phi rủi ro $r$, ta đã ngầm giả định *không ai đòi risk premium* — sai với thực tế. Còn nếu ta chiết khấu ở một lãi suất điều chỉnh rủi ro $r + \text{premium}$, thì premium đó là bao nhiêu? Nó phụ thuộc khẩu vị rủi ro của người định giá. Kết quả: một công thức cho ra *một giá khác nhau cho mỗi người*. Với một market maker cần yết một giá duy nhất, khả yết được, đối chiếu được với đối thủ, thì một công thức như vậy là vô dụng.

Đây là chỗ Black, Scholes và Merton (Nobel Kinh tế 1997) tạo ra bước nhảy tư duy làm thay đổi cả tài chính hiện đại. Insight của họ có thể phát biểu bằng một câu: **để định giá option, ta không cần biết kỳ vọng thật, cũng không cần biết khẩu vị rủi ro của bất kỳ ai.** Lý do là option **replicate được** — ta có thể tạo lại đúng payoff của nó bằng cách trading liên tục cổ phiếu gốc và gửi/vay tiền mặt. Và ở đây có một nguyên lý sắt đá của thị trường không arbitrage, nguyên lý **Law of One Price**: hai danh mục cho ra *đúng cùng một payoff trong mọi kịch bản tương lai* thì bắt buộc phải có *cùng một giá hôm nay*. Nếu không, ai đó mua cái rẻ bán cái đắt, bỏ túi chênh lệch mà không chịu rủi ro gì — một cỗ máy in tiền mà thị trường sẽ lập tức triệt tiêu.

Vậy giá option đơn giản bằng *chi phí để dựng chiến lược replicate*. Chi phí ấy là một con số khách quan, không dính dáng gì đến việc bạn tin cổ phiếu sẽ lên hay xuống. Và điều kỳ diệu — thứ khiến toàn bộ bộ máy toán học của Q-world vận hành — là chi phí replicate ấy, khi viết lại, hoá ra *đúng dạng một kỳ vọng chiết khấu*, nhưng dưới một measure "nhân tạo" $\mathbb{Q}$ chứ không phải measure thực $\mathbb{P}$. Câu hỏi sai "$e^{-rT}\mathbb{E}^{\mathbb{P}}[\cdot]$" trở thành câu hỏi đúng "$e^{-rT}\mathbb{E}^{\mathbb{Q}}[\cdot]$" — cùng một hình thức, khác đúng một chữ cái trên đầu $\mathbb{E}$, và chữ cái đó chứa đựng cả cuộc cách mạng. Phần còn lại của chương này giải thích $\mathbb{Q}$ từ đâu ra, tại sao nó tồn tại, khi nào nó duy nhất, và làm sao ta khai thác nó.

## 4.2 Mô hình binomial một bước — toàn bộ lý thuyết trong một ví dụ

Cách tốt nhất để thấy $\mathbb{Q}$ xuất hiện là làm nó ở mô hình đơn giản nhất có thể — nơi tương lai chỉ có đúng hai kịch bản. Mô hình này thô sơ đến mức phi thực tế, nhưng mọi cơ chế của định giá risk-neutral đều hiện ra trong đó trần trụi, không bị che bởi giải tích ngẫu nhiên.

Cho: $S_0 = 100$; sau 1 kỳ giá lên $S_u = 120$ hoặc xuống $S_d = 80$; lãi suất $r = 0$ cho gọn. Ta định giá một call strike $K = 100$: payoff $C_u = 20$ nếu lên, $C_d = 0$ nếu xuống.

**Replicate.** Ta đi tìm một portfolio gồm $\Delta$ cổ phiếu cộng $B$ tiền mặt sao cho payoff của nó khớp payoff option trong *cả hai* kịch bản:

$$120\Delta + B = 20, \qquad 80\Delta + B = 0.$$

Đây là hai phương trình, hai ẩn — giải thẳng. Trừ vế cho vế: $40\Delta = 20$, nên

$$\Delta = \frac{20 - 0}{120 - 80} = 0.5, \qquad B = -40.$$

Kiểm tra lại cho chắc: kịch bản lên cho $0.5 \times 120 - 40 = 60 - 40 = 20$ ✓; kịch bản xuống cho $0.5 \times 80 - 40 = 40 - 40 = 0$ ✓. Portfolio này bắt chước hoàn hảo call. Vậy theo Law of One Price, giá call hôm nay bằng chi phí dựng portfolio hôm nay:

$$C_0 = \Delta \cdot S_0 + B = 0.5 \times 100 - 40 = \boxed{10}.$$

Con số **10** này là hòn đá tảng của cả cuốn sách — hãy giữ nó trong đầu. Bây giờ ta rút ra ba quan sát nền tảng, mỗi quan sát là một hạt giống của một chương sau.

**Quan sát 1 — xác suất thực biến mất.** Nhìn kỹ phép tính: đâu là xác suất cổ phiếu lên? Không có. Giá call là 10 bất kể xác suất lên thật là 90% hay 10%. Thoạt nghe phi lý — chẳng phải option đắt hơn nếu cổ phiếu dễ lên hơn sao? Câu trả lời: *thông tin về hướng đi đã nằm sẵn trong $S_0 = 100$*. Nếu thị trường tin cổ phiếu gần như chắc lên 120, họ đã đẩy giá cổ phiếu lên cao hơn 100 từ lâu. Giá cổ phiếu hiện tại đã "định giá" niềm tin về hướng đi; option chỉ là một gói phi tuyến bọc quanh cái đã được định giá đó, nên không cần định giá lại niềm tin ấy lần thứ hai. Đây là lý do sâu xa vì sao drift thực của cổ phiếu không vào công thức option.

**Quan sát 2 — delta hedge.** Đại lượng

$$\Delta = \frac{C_u - C_d}{S_u - S_d}$$

là độ nhạy của giá option theo giá cổ phiếu — bao nhiêu tiền option nhúc nhích cho mỗi đồng cổ phiếu nhúc nhích. Nó chính là **delta** mà ta sẽ tính bằng giải tích ở Chương 5. Ý nghĩa vận hành: một dealer bán call rồi mua ngay $\Delta = 0.5$ cổ phiếu thì danh mục ròng của anh ta *miễn nhiễm với hướng đi* của cổ phiếu — lãi trên cổ phiếu bù đúng lỗ trên call và ngược lại. Đây là **delta hedge**, hành động cốt lõi mà một trading desk làm hàng nghìn lần mỗi ngày. Định giá và hedging không phải hai việc khác nhau: giá *chính là* chi phí của việc hedge.

**Quan sát 3 — risk-neutral probability.** Bây giờ đến mẹo đại số làm nên tên gọi. Viết lại giá:

$$C_0 = 10 = q \cdot 20 + (1-q)\cdot 0 \quad\text{với}\quad q = 0.5.$$

Giá *trông như* kỳ vọng của payoff dưới một "xác suất" $q$. Con số $q$ ấy là gì? Tổng quát hoá cho $r$ bất kỳ, nó là

$$q = \frac{(1+r)S_0 - S_d}{S_u - S_d}.$$

Với $r=0$: $q = (100-80)/(120-80) = 0.5$. Ở đây ta viết vốn hoá một kỳ theo kiểu **lãi suất rời rạc** $(1+r)$; sang §4.3, khi làm cây nhiều bước với mỗi bước dài $\Delta t$, ta sẽ dùng **hệ số vốn hoá liên tục** $R = e^{r\Delta t}$. Hai cách chỉ là hai quy ước compounding của *cùng một ý tưởng* "một đồng hôm nay lớn lên bao nhiêu sau một bước" — với $\Delta t = 1$ và $r$ nhỏ thì $e^r \approx 1 + r$, nên đừng để việc đổi ký hiệu $(1+r) \leftrightarrow R$ làm bạn vấp. Con số $q$ ấy **không phải** xác suất thật — nó là trọng số nhân tạo được chế ra đúng bằng cách để phép định giá-bằng-replicate viết lại được thành một kỳ vọng. Ta gọi nó là **risk-neutral probability**. Cái tên đến từ tính chất then chốt sau: dưới $q$,

$$\mathbb{E}^{q}[S_1] = 0.5 \times 120 + 0.5 \times 80 = 100 = S_0(1+r).$$

Nghĩa là dưới $q$, kỳ vọng lợi suất của cổ phiếu đúng bằng lãi suất phi rủi ro — *như thể* toàn bộ thị trường gồm những nhà đầu tư hoàn toàn trung tính với rủi ro (risk-neutral), không ai đòi risk premium. Không phải vì con người thật sự trung tính rủi ro — họ không hề — mà vì measure nhân tạo $q$ được xây đúng để triệt tiêu risk premium, biến bài toán khó (định giá tài sản rủi ro) thành bài toán dễ (lấy kỳ vọng chiết khấu ở $r$).

**Toàn bộ Q-world là ví dụ này với nhiều bước hơn, nhiều tài sản hơn, và thời gian liên tục.** Nếu bạn thấu ba quan sát trên, bạn đã nắm 80% triết lý; tất cả phần sau chỉ là kỹ thuật để nới nó ra.

Trước khi rời ví dụ, đáng dừng một nhịp ở chuyện điều gì xảy ra nếu giá thị trường của call *không* bằng 10. Giả sử ai đó yết call ở 11. Ta dựng một arbitrage cụ thể: **bán** call thu 11, đồng thời dựng portfolio replicate tốn 10 (mua 0.5 cổ phiếu, vay 40). Hôm nay bỏ túi $11 - 10 = 1$. Đến kỳ hạn, portfolio replicate trả ra đúng bằng nghĩa vụ trên call đã bán trong cả hai kịch bản, nên hai bên triệt tiêu hoàn toàn — ta giữ lại 1 đồng lãi chắc chắn, vốn 0, rủi ro 0. Ngược lại nếu call yết ở 9, ta *mua* call và bán khống portfolio replicate, lại bỏ túi 1 đồng vô rủi ro. Chính áp lực của những kẻ arbitrage này ép giá thị trường về đúng 10. No-arbitrage không phải một tiên đề trừu tượng — nó là một cơ chế thực thi có thật, do lòng tham của các trader duy trì.

## 4.3 Từ một bước tới cây recombining và ví dụ American hai bước

Một bước là đủ để hiểu triết lý nhưng quá thô để định giá thật. Bước tiếp theo là **binomial tree**: chia khoảng thời gian $[0,T]$ thành $n$ bước nhỏ bằng nhau $\Delta t = T/n$, tại mỗi bước cho giá nhân với một hệ số $u$ (lên) hoặc $d$ (xuống). Một cách chọn $u,d$ được dùng rộng rãi là **Cox-Ross-Rubinstein (CRR)**: đặt $u = e^{\sigma\sqrt{\Delta t}}$ và $d = 1/u$. Cách chọn CRR khéo ở hai chỗ: thứ nhất, đối xứng $d = 1/u$ khiến cây **recombining** (một bước lên rồi một bước xuống quay về đúng điểm cũ); thứ hai, nó khớp variance của log-return trong mỗi bước với $\sigma^2 \Delta t$ *đến bậc nhất*, nên khi $n \to \infty$ cây hội tụ về đúng Black-Scholes. (Nói cho chính xác: dưới trọng số risk-neutral $q$, variance của log-return một bước là $4q(1-q)\,\sigma^2\Delta t$, chỉ bằng đúng $\sigma^2\Delta t$ khi $q = 1/2$; nhưng $q \to 1/2$ khi $\Delta t \to 0$, nên sai lệch tan biến trong giới hạn — khớp variance ở đây là khớp *tiệm cận*, không phải khớp chính xác ở mọi $\Delta t$.) Ta định giá bằng **backward induction**: điền payoff tại các lá (thời điểm $T$), rồi lùi dần về gốc, mỗi nút áp đúng công thức một bước

$$V = \frac{q V_u + (1-q) V_d}{R}, \qquad q = \frac{R - d}{u - d}, \quad R = e^{r\Delta t}.$$

Cây binomial là engine "cụ tổ". Ngày nay nó chủ yếu dùng để dạy và để định giá vài loại American đơn giản, còn desk thật chạy PDE solver hoặc Monte Carlo; nhưng tư duy backward induction của nó sống trong *mọi* PDE solver và trong Longstaff-Schwartz (Chương 12). Quan trọng hơn, cây là nơi duy nhất mà **early exercise** của American option hiện ra tự nhiên và dễ tính bằng số — nên ta dùng nó cho ví dụ tiếp theo.

**Ví dụ hai bước đầy đủ — European put so American put.** Lấy $S_0 = 100$; mỗi bước giá nhân 1.2 (lên) hoặc 0.8 (xuống), tức $u = 1.2$, $d = 0.8$; lãi mỗi bước 5%, tức hệ số vốn hoá $R = 1.05$; strike $K = 100$. Lưu ý một chi tiết để tránh hiểu nhầm: bộ số tròn trịa này là một cây **recombining tổng quát** (kiểu Jarrow-Rudd), *không* phải cây CRR đúng nghĩa — trong CRR ta cần $d = 1/u$, mà $1/1.2 = 0.8333 \ne 0.8$. Ta cố tình chọn $u = 1.2, d = 0.8$ chỉ để số học sạch sẽ, dễ theo dõi bằng tay; điều đó không ảnh hưởng gì đến logic backward induction, vốn chạy y hệt cho mọi cặp $(u,d)$ miễn $d < R < u$ (điều kiện no-arbitrage). Risk-neutral probability cho mỗi bước:

$$q = \frac{R - d}{u - d} = \frac{1.05 - 0.8}{1.2 - 0.8} = \frac{0.25}{0.4} = 0.625.$$

Cây giá cổ phiếu triển khai:

$$100 \;\to\; \{120,\; 80\} \;\to\; \{144,\; 96,\; 64\}.$$

(Nhánh giữa 96 đạt được bằng hai đường lên-xuống, đều cho $100 \times 1.2 \times 0.8 = 100 \times 0.8 \times 1.2 = 96$ — đây là tính "recombining" khiến số nút chỉ tăng tuyến tính chứ không nổ theo cấp số nhân.) Payoff put $(K - S)^+$ tại ba lá: $\{0,\; 4,\; 36\}$ tương ứng $\{144, 96, 64\}$.

*European put.* Không có quyền exercise sớm, nên chỉ việc lùi từng nút bằng công thức một bước:

| Nút | Continuation value | Kết quả |
|---|---|---|
| $S = 120$ | $(0.625 \times 0 + 0.375 \times 4)/1.05$ | $1.429$ |
| $S = 80$  | $(0.625 \times 4 + 0.375 \times 36)/1.05 = 16/1.05$ | $15.238$ |
| Gốc $S=100$ | $(0.625 \times 1.429 + 0.375 \times 15.238)/1.05 = 6.607/1.05$ | $\mathbf{6.29}$ |

*American put.* Bây giờ tại mỗi nút ta được quyền exercise ngay, nên giá trị nút là $\max(\text{exercise ngay},\ \text{continuation})$:

| Nút | Exercise ngay | Continuation | Giá trị nút |
|---|---|---|---|
| $S = 120$ | $0$ | $1.429$ | $1.429$ |
| $S = 80$  | $100 - 80 = 20$ | $15.238$ | $\mathbf{20}$ (exercise sớm) |
| Gốc $S=100$ | $0$ | $(0.625 \times 1.429 + 0.375 \times 20)/1.05 = 8.393/1.05 = 7.99$ | $\mathbf{7.99}$ |

Tại nút $S=80$, exercise ngay cho 20 trong khi tiếp tục nắm giữ chỉ đáng 15.238 — nên chủ option **exercise sớm**, và giá trị nút nhảy từ 15.238 lên 20. Trực giác thị trường: put đang ITM sâu, cầm 20 đồng tiền mặt hôm nay đem gửi lãi 5% tốt hơn là chờ một payoff tương lai bị chiết khấu; giá trị thời gian còn lại không đủ bù chi phí cơ hội của việc chờ.

**Early exercise premium $= 7.99 - 6.29 = 1.70$.** Quyền được exercise sớm đáng giá thật, và điểm mấu chốt là *không có công thức đóng cho nó* — American option **buộc** phải giải bằng backward induction (tree hoặc PDE) hoặc bằng LSM khi nhiều chiều (Chương 12), vì ranh giới exercise tối ưu là một ẩn số phải tìm cùng lúc với giá. Ví dụ này cũng làm sáng tỏ một sự thật kinh điển đối ngẫu: American **call** trên tài sản không trả dividend thì *không bao giờ* đáng exercise sớm. Nếu bạn lặp lại phép tính trên cho một call, continuation value luôn thắng exercise ngay — bởi giữ call là giữ "downside protection" miễn phí, trong khi số tiền strike bạn chưa phải bỏ ra vẫn còn nằm sinh lãi; exercise sớm là vứt bỏ cả hai lợi thế đó. Với dividend thì câu chuyện đổi chiều, và đó là lý do American call chỉ có ý nghĩa quanh các ngày chia cổ tức.

## 4.4 Hai định lý cơ bản của định giá tài sản (FTAP)

Đến đây ta đã thấy $\mathbb{Q}$ xuất hiện trong ví dụ cụ thể. Giờ là lúc phát biểu kết quả tổng quát đứng sau tất cả — **Fundamental Theorems of Asset Pricing (FTAP)**, hai định lý trả lời hai câu hỏi: (I) khi nào $\mathbb{Q}$ *tồn tại*, và (II) khi nào nó *duy nhất*.

Trước hết chuẩn hoá ngôn ngữ. Một **arbitrage** là chiến lược giao dịch cần vốn ban đầu bằng 0, không bao giờ lỗ ở bất kỳ kịch bản nào, và có xác suất dương lãi — tức tiền từ trên trời rơi xuống. Một **numeraire** là tài sản ta chọn làm đơn vị đo giá trị, thường là money market account $B_t = e^{rt}$ (một đồng gửi ngân hàng vốn hoá liên tục ở $r$). Hai measure gọi là **tương đương** nếu chúng đồng ý với nhau về việc sự kiện nào có xác suất bằng 0 (cái nào $\mathbb{P}$ cho là "không thể" thì $\mathbb{Q}$ cũng vậy, và ngược lại) — chúng có thể bất đồng về *độ lớn* xác suất nhưng không bất đồng về *tập hợp khả dĩ*. Điều kiện tương đương này rất quan trọng: nó bảo đảm đổi sang $\mathbb{Q}$ không lén thêm vào hay xoá đi kịch bản nào của thế giới.

**FTAP I.** Thị trường **không có arbitrage** khi và chỉ khi tồn tại một measure $\mathbb{Q}$ tương đương với $\mathbb{P}$ sao cho giá mọi tài sản, tính theo numeraire, là một $\mathbb{Q}$-martingale:

$$\frac{V_t}{B_t} = \mathbb{E}^{\mathbb{Q}}\left[\frac{V_T}{B_T}\,\middle|\,\mathcal{F}_t\right] \implies \boxed{\,V_t = \mathbb{E}^{\mathbb{Q}}\!\left[e^{-\int_t^T r_s\,ds}\,V_T\,\middle|\,\mathcal{F}_t\right].}$$

Công thức đóng khung là **công thức định giá risk-neutral** — công thức quan trọng nhất của cả cuốn sách. Đọc bằng lời: giá hôm nay của bất kỳ derivative nào bằng kỳ vọng (dưới $\mathbb{Q}$) của payoff tương lai, chiết khấu ở lãi suất phi rủi ro. Mọi pricing engine — công thức đóng, cây, PDE, Monte Carlo — chỉ là những cách khác nhau để tính đúng một kỳ vọng này.

**FTAP II.** Một thị trường không arbitrage là **complete** (mọi payoff bất kỳ đều replicate được bằng các tài sản trade được) khi và chỉ khi measure $\mathbb{Q}$ là **duy nhất**.

**Chứng minh sketch của FTAP I.** Ta không cần bộ máy đo lý thuyết đầy đủ để thấy *vì sao* nó đúng — hai chiều của "khi và chỉ khi" có trực giác rất trong.

Chiều dễ, "$\mathbb{Q}$ tồn tại $\Rightarrow$ không arbitrage": giả sử tồn tại một measure martingale $\mathbb{Q}$ và giả sử phản chứng rằng vẫn có một arbitrage — một chiến lược vốn 0 với giá trị chiết khấu cuối kỳ $\hat V_T = V_T/B_T \ge 0$ luôn luôn, và $> 0$ với xác suất dương. Vì $\mathbb{Q}$ tương đương $\mathbb{P}$, "xác suất dương dưới $\mathbb{P}$" kéo theo "xác suất dương dưới $\mathbb{Q}$", nên $\mathbb{E}^{\mathbb{Q}}[\hat V_T] > 0$. Nhưng tính martingale bắt buộc $\hat V_0 = \mathbb{E}^{\mathbb{Q}}[\hat V_T]$, mà chiến lược vốn 0 nghĩa là $\hat V_0 = 0$. Mâu thuẫn: $0 = \hat V_0 = \mathbb{E}^{\mathbb{Q}}[\hat V_T] > 0$. Vậy không thể có arbitrage. Cốt lõi: martingale *không cho phép* giá trị kỳ vọng dâng lên từ 0 mà không có mặt trái, còn arbitrage thì đòi đúng điều đó.

Chiều khó, "không arbitrage $\Rightarrow$ $\mathbb{Q}$ tồn tại", là một định lý tách (separating hyperplane). Trong mô hình một bước hữu hạn kịch bản, tập các payoff chiết khấu đạt được từ vốn 0 là một không gian con tuyến tính, và "không arbitrage" nghĩa đúng là không gian con ấy không chạm vào góc phần dương (các vector $\ge 0, \ne 0$) trừ điểm gốc. Định lý tách Hahn-Banach (ở chiều hữu hạn là hình học sơ cấp) khi đó cho tồn tại một siêu phẳng tách hai tập; các hệ số dương của siêu phẳng ấy, sau khi chuẩn hoá cho tổng bằng 1, *chính là* các xác suất risk-neutral $q_i$ cho từng kịch bản. Nói cách khác, $\mathbb{Q}$ không phải thứ ta nặn ra tuỳ tiện — nó là hệ quả hình học tất yếu của việc thị trường đóng kín được lỗ hổng arbitrage. Ta đã *tận mắt thấy* $\mathbb{Q}$ này ở §4.2: con số $q=0.5$ (hay $0.625$ ở ví dụ hai bước) chính là nghiệm mà định lý tách bảo đảm tồn tại.

**Đọc FTAP II qua lăng kính đếm.** Có một cách phát biểu FTAP II mà một quant ngồi desk nhớ nằm lòng hơn cả câu định lý hình thức: **$\mathbb{Q}$ duy nhất khi và chỉ khi số công cụ hedge trade được đúng bằng số nguồn rủi ro độc lập.** Complete nghĩa là "mọi payoff replicate được", mà replicate được nghĩa là hệ phương trình khớp-payoff (một phương trình cho mỗi trạng thái tương lai) có nghiệm cho mọi vế phải — điều này xảy ra chính xác khi số ẩn (số công cụ trade được) đủ để phủ hết số ràng buộc (số nguồn rủi ro). Đủ công cụ $\Rightarrow$ replicate được mọi thứ $\Rightarrow$ complete $\Rightarrow$ $\mathbb{Q}$ duy nhất; thiếu công cụ $\Rightarrow$ có payoff không replicate được $\Rightarrow$ incomplete $\Rightarrow$ dư bậc tự do trong $\mathbb{Q}$. Ở §4.2 hai công cụ (cổ phiếu + tiền mặt) khớp đúng hai trạng thái, nên $\mathbb{Q}$ ra một điểm; §4.5 sắp cố tình phá cân bằng ấy để thấy $\mathbb{Q}$ nở thành cả một họ.

**Ý nghĩa thực chiến của completeness** — chỗ textbook hay lướt nhưng industry sống cùng mỗi ngày. Trong thế giới Black-Scholes (một nguồn nhiễu duy nhất là $W_t$, và ta trade được cổ phiếu liên tục), số "công cụ hedge" khớp đúng số "nguồn rủi ro", nên mọi payoff replicate được — thị trường complete, $\mathbb{Q}$ duy nhất, giá là một con số xác định. Đó là thế giới lý tưởng của Chương 5. Nhưng **thế giới thật là incomplete**, và hiểu tại sao là bước trưởng thành nghề nghiệp lớn nhất trong chương này.

## 4.5 Thị trường incomplete và dải giá no-arbitrage

Xét một thị trường có *hai* nguồn nhiễu nhưng chỉ *một* công cụ để hedge. Ví dụ điển hình là **stochastic volatility**: cả giá $S_t$ lẫn volatility $\sigma_t$ đều ngẫu nhiên, chúng bị lái bởi hai Brownian motion khác nhau, nhưng ta chỉ trade được cổ phiếu — không có "cổ phiếu volatility" nào để mua bán trực tiếp. Số nguồn rủi ro (2) vượt số công cụ hedge (1). Trực giác đại số tuyến tính: khi số ẩn nhiều hơn số phương trình, nghiệm không duy nhất. Ở đây "nghiệm" là measure $\mathbb{Q}$, và hệ quả là tồn tại *cả một họ* measure risk-neutral hợp lệ, không phải một. Theo FTAP II, thị trường incomplete, $\mathbb{Q}$ không duy nhất, và thay vì một giá ta có **một dải giá** — mọi giá trong dải đều là no-arbitrage.

Hãy làm điều này *thành số* để nó không còn trừu tượng — đây chính là chiều sâu mà một minh hoạ bằng lời không bao giờ chạm tới. Ta trở lại khung một bước ở §4.2 nhưng giờ thêm một kịch bản thứ ba, để cố tình tạo ra thị trường incomplete. Cho $S_0 = 100$, $r = 0$, và sau một kỳ giá rơi vào *ba* trạng thái: $S \in \{120,\ 100,\ 80\}$. Ta chỉ có hai công cụ để trade — cổ phiếu và tiền mặt — nhưng ba kịch bản. Một measure risk-neutral là bộ ba $(q_u, q_m, q_d)$ với $q_u + q_m + q_d = 1$, tất cả dương, thoả điều kiện martingale cho cổ phiếu:

$$120\,q_u + 100\,q_m + 80\,q_d = 100 = S_0(1+r).$$

Hai phương trình (tổng bằng 1, martingale) nhưng ba ẩn — dư một bậc tự do. Đặt $q_m = \theta$ làm tham số tự do, giải ra:

$$q_u = q_d = \frac{1 - \theta}{2}, \qquad \theta \in (0, 1).$$

*Mỗi* giá trị $\theta$ trong khoảng $(0,1)$ cho một measure risk-neutral hợp lệ khác nhau — có vô số $\mathbb{Q}$, đúng như FTAP II báo trước. Bây giờ định giá một payoff mà *không* replicate được bằng cổ phiếu và tiền mặt: một option trả 1 đồng nếu và chỉ nếu $S = 100$ (trạng thái giữa), 0 nếu không. Giá của nó dưới measure $\theta$ là

$$V(\theta) = q_m \cdot 1 = \theta.$$

Cho $\theta$ chạy khắp $(0,1)$, giá $V$ quét *toàn bộ* khoảng $(0, 1)$. Không có một giá no-arbitrage nào — mà là **cả một dải $(0,1)$**. Nếu bạn định giá 0.3 và tôi định giá 0.6, *cả hai* đều không tạo cơ hội arbitrage cho đối phương; không ai có thể "chứng minh" người kia sai bằng một chiến lược trading vô rủi ro. Đây là bản chất định lượng của incompleteness: mất khả năng replicate đúng bằng mất khả năng chốt một giá duy nhất.

Cận của dải — $0$ và $1$ — chính là các giá **super-replication** và **sub-replication**, và đáng làm chúng thành số như phần còn lại. Hedge *rẻ nhất mà chắc chắn phủ được* payoff trong mọi trạng thái là: giữ đúng 1 đồng tiền mặt. Payoff cao nhất có thể của option là 1 (khi $S = 100$), nên 1 đồng tiền mặt luôn dư sức trả — chi phí phủ trên là $1$, đó là **super-replication price**. Ngược lại, chiến lược rẻ nhất mà chắc chắn *không vượt quá* payoff là không làm gì cả (giữ 0), vì payoff không bao giờ âm — sàn phủ dưới là $0$, đó là **sub-replication price**. Dải no-arbitrage $(0,1)$ nằm gọn giữa hai cận replicate được này. Trong thực tế hai cận thường quá xa nhau (ở đây là toàn bộ khoảng giá trị có thể của payoff) để dùng làm giá giao dịch — chúng nói cho ta biên chứ không cho ta giá.

Vậy thị trường thật chốt giá kiểu gì, nếu lý thuyết chỉ cho một dải? Câu trả lời là bước ngoặt nghề nghiệp: **thị trường tự chọn một measure $\mathbb{Q}$, và lựa chọn ấy lộ ra qua giá của những option đang được yết công khai.** Nếu trên màn hình có một option nào đó khớp với trạng thái giữa và đang giao dịch ở giá 0.42, thì thị trường đang ngầm tuyên bố $\theta = 0.42$ — và mọi payoff khác trong cùng thị trường ấy phải được định giá nhất quán với $\theta = 0.42$, nếu không sẽ có arbitrage *chéo* giữa các option. Chính vì thế industry **calibrate** model vào giá thị trường — chọn tham số của $\mathbb{Q}$ sao cho model tái tạo đúng các giá đang quan sát — chứ **không estimate** $\mathbb{Q}$ từ dữ liệu lịch sử. Đây là khác biệt nghiệp vụ sâu nhất giữa Q-world (calibrate) và P-world (estimate), và mục sau sẽ đóng đinh nó bằng con số.

## 4.6 Market price of risk — và tại sao ta calibrate thay vì estimate

Ta đã nói drift thực biến mất khi đổi sang $\mathbb{Q}$, nhưng chưa nói *nó biến mất bằng cơ chế nào*, và cơ chế ấy chứa một đại lượng — **market price of risk** — vừa giải thích tên "risk-neutral", vừa giải thích dứt khoát vì sao estimate từ lịch sử là con đường cụt.

Dưới measure thực $\mathbb{P}$, một cổ phiếu tuân theo $dS_t = \mu S_t\,dt + \sigma S_t\,dW_t^{\mathbb{P}}$, với $\mu$ là drift thực — kỳ vọng lợi suất mà nhà đầu tư *thực sự* đòi để nắm giữ rủi ro. Định lý Girsanov (Chương 3) nói rằng đổi sang measure risk-neutral $\mathbb{Q}$ chỉ *dịch chuyển drift* mà **giữ nguyên $\sigma$**: dưới $\mathbb{Q}$ ta có $dS_t = r S_t\,dt + \sigma S_t\,dW_t^{\mathbb{Q}}$, và hai Brownian motion nối với nhau qua $dW_t^{\mathbb{Q}} = dW_t^{\mathbb{P}} + \lambda\,dt$. Đại lượng làm chiếc cầu nối ấy là

$$\lambda = \frac{\mu - r}{\sigma},$$

gọi là **market price of risk** (hay Sharpe ratio của tài sản): nó là lượng excess return $\mu - r$ mà thị trường trả cho mỗi đơn vị volatility $\sigma$ bị gánh. Đổi measure chính xác là *giặt sạch* $\lambda$ đi — dưới $\mathbb{Q}$ drift tụt từ $\mu$ xuống đúng $r$, nghĩa là mọi risk premium bị đặt về 0. "Risk-neutral" theo nghĩa đen là "trong cái measure nơi giá của rủi ro bằng 0".

**Cho con số.** Giả sử một cổ phiếu có excess return kỳ vọng thực $\mu - r = 6\%$/năm và volatility $\sigma = 20\%$. Khi đó

$$\lambda = \frac{0.06}{0.20} = 0.30.$$

Thị trường trả 0.30 đơn vị excess return cho mỗi đơn vị vol. Bây giờ chú ý một điều đắt giá: để lấy $\lambda$ ta cần $\mu$ — drift thực — nhưng $\mu$ là đại lượng *khét tiếng khó ước lượng*. Sai số chuẩn của ước lượng drift từ dữ liệu giá tỉ lệ với $\sigma/\sqrt{T}$, độc lập với việc bạn lấy mẫu dày cỡ nào. Điểm này phản trực giác nên đáng dừng lại: lấy mẫu dày hơn (giá theo ngày thay vì theo tháng) *có* giúp — nhưng chỉ giúp ước lượng $\sigma$, chứ không giúp ước lượng $\mu$. Lý do là drift là tổng dịch chuyển tích luỹ chia cho tổng thời gian: dù cắt $T$ năm thành bao nhiêu lát mỏng, ước lượng drift rốt cuộc vẫn chỉ đọc điểm đầu và điểm cuối ($\hat\mu \approx (\ln S_T - \ln S_0)/T$ cộng hiệu chỉnh nhỏ), nên chỉ *tổng chiều dài lịch sử $T$* mới đẩy được sai số xuống, còn tần suất lấy mẫu bên trong $T$ thì không đụng tới nó. Cụ thể, với $\sigma = 20\%$, để ép sai số chuẩn của drift ước lượng xuống chỉ $1\%$/năm, bạn cần $T$ thoả $0.20/\sqrt{T} = 0.01$, tức $\sqrt{T} = 20$, tức

$$T = 400 \text{ năm.}$$

Bốn trăm năm dữ liệu để biết drift với độ chính xác 1% — trong khi trong 400 năm ấy công ty đã phá sản, sáp nhập, đổi ngành, và cả nền kinh tế đã thay hình mấy lượt. Drift thực về cơ bản là *không quan sát được* trong bất kỳ khung thời gian có ý nghĩa nào. Đây gọi là "mean-blur problem", và nó là cái đinh cuối cùng đóng vào quan tài của cách tiếp cận estimate.

Bây giờ ghép hai mảnh lại thành lập luận trung tâm của cả chương. **Nếu** ta định giá option bằng measure thực $\mathbb{P}$, ta buộc phải biết $\mu$, tức phải ước lượng drift — thứ ta vừa chứng minh là gần như bất khả. **Nhưng** công thức risk-neutral định giá dưới $\mathbb{Q}$, nơi drift đã bị thay bằng $r$ — một con số *quan sát trực tiếp được* trên đường cong lãi suất. Cả $\mu$ lẫn $\lambda$ đều đã bốc hơi khỏi công thức định giá. Cái không quan sát được đã được thay bằng cái quan sát được. Đây không phải một mẹo toán tiện lợi; đây là *lý do tồn tại* của cả bộ máy risk-neutral: nó né đúng đại lượng mà thị trường tài chính không bao giờ cho ta biết.

Còn tham số *sống sót* qua phép đổi measure là $\sigma$ — volatility, thứ duy nhất Girsanov giữ nguyên khi chuyển $\mathbb{P} \to \mathbb{Q}$. Điều này nâng $\sigma$ lên địa vị đặc biệt: nó là input quan trọng nhất của định giá option, vì nó vừa cần thiết vừa là thứ duy nhất không tự triệt tiêu. Và vì thị trường incomplete khiến $\sigma$ (chính xác hơn là cả *bề mặt* các $\sigma$ ẩn trong giá option) không xác định được từ lịch sử một cách duy nhất, ta **đọc ngược $\sigma$ ra từ giá option đang giao dịch** — chính là **implied volatility** và **calibration**. Vòng tròn khép lại: incompleteness bảo ta $\mathbb{Q}$ không duy nhất, mean-blur bảo ta không thể estimate nó, nên ta *calibrate* nó — cắm model vào giá quan sát và giải ngược ra tham số. Đó là nghi thức trung tâm của nghề Q, và mọi chương sau (5, 6, 7, 8) chỉ là kỹ thuật thực thi nghi thức ấy cho từng lớp tài sản.

## 4.7 Đổi numeraire — con dao mổ của rates quant

Ta đã dùng money market account $B_t$ làm numeraire suốt từ đầu. Nhưng một trong những hiểu biết mạnh nhất của tài chính hiện đại là: **numeraire là một lựa chọn**, và chọn khéo có thể biến một tích phân bế tắc thành một công thức đóng. Đây là công cụ đặc trưng nhất của một rates quant.

Định lý đổi numeraire: với mỗi numeraire $N_t$ (bất kỳ tài sản nào có giá luôn dương và không trả dòng tiền giữa chừng) tồn tại một measure $\mathbb{Q}^N$ tương đương sao cho *mọi* giá tài sản chia cho $N_t$ đều là $\mathbb{Q}^N$-martingale. Công thức định giá tổng quát trở thành

$$V_t = N_t\,\mathbb{E}^{\mathbb{Q}^N}\!\left[\frac{V_T}{N_T}\,\middle|\,\mathcal{F}_t\right].$$

Cùng một giá $V_t$, vô số cách viết — mỗi numeraire một cách. Nghệ thuật là chọn cái $N$ khiến kỳ vọng dễ nhất. Ba lựa chọn thực chiến:

1. **Money market account** $B_t = e^{\int_0^t r_s ds}$ cho measure risk-neutral chuẩn $\mathbb{Q}$ — cái ta đã dùng.
2. **Zero-coupon bond $P(t,S)$** đáo hạn tại một mốc $S$ cho **$S$-forward measure** $\mathbb{Q}^{S}$. Vì $P(S,S)=1$, chọn numeraire này kéo discount factor *ra ngoài* kỳ vọng: $V_t = P(t,S)\,\mathbb{E}^{S}[V_{S}]$ — thoát khỏi việc phải model tương quan giữa lãi suất chiết khấu ngẫu nhiên và payoff. Dưới $\mathbb{Q}^{S}$, forward rate cho kỳ kết thúc đúng tại $S$ là martingale, và đó là thứ hợp pháp hoá công thức Black cho caplet (Chương 9). Trong ví dụ caplet ngay dưới đây, mốc $S$ ấy chính là ngày trả tiền $T + \tau$, nên measure ta dùng sẽ là $\mathbb{Q}^{T+\tau}$.
3. **Annuity** $A_t = \sum_i \tau_i P(t, T_i)$ cho **swap measure**: dưới nó swap rate là martingale, hợp pháp hoá công thức Black cho swaption (Chương 9).

**Đổi numeraire làm việc — định giá caplet trong ba dòng.** Một caplet trả $\tau(F(T) - K)^+$ tại thời điểm $T + \tau$, với $F$ là forward rate cho kỳ $[T, T+\tau]$. Nếu cố định giá dưới measure risk-neutral chuẩn, ta phải tính

$$V_0 = \mathbb{E}^{\mathbb{Q}}\!\left[e^{-\int_0^{T+\tau} r_s\,ds}\,\tau\,(F(T)-K)^+\right],$$

nhưng discount factor ngẫu nhiên $e^{-\int r}$ **tương quan** với payoff $(F(T)-K)^+$ (cả hai đều là hàm của cùng đường lãi suất), nên kỳ vọng của tích *không* tách ra thành tích các kỳ vọng — bế tắc. Đổi numeraire sang bond đáo hạn cùng ngày trả tiền, $P(t, T+\tau)$, tức chuyển sang $\mathbb{Q}^{T+\tau}$:

$$V_0 = P(0, T+\tau)\,\tau\;\mathbb{E}^{T+\tau}\!\left[(F(T) - K)^+\right].$$

Discount factor đã tách ra thành thừa số tất định $P(0,T+\tau)$ đứng ngoài. Và dưới measure mới này, $F(t)$ là martingale — không phải may mắn, mà vì bản thân $F(t) = \frac{1}{\tau}\left[\frac{P(t,T)}{P(t,T+\tau)} - 1\right]$ đúng là *một giá tài sản chia cho numeraire $P(t,T+\tau)$*, nên tính martingale được cấp không mất phí. Giả sử $F$ lognormal với volatility $\sigma$, kỳ vọng còn lại chính xác là một bài toán Black-76, cho ngay

$$V_0 = P(0, T+\tau)\,\tau\,\big[F_0\,N(d_1) - K\,N(d_2)\big],$$

trong đó $F_0 = F(0)$ là forward rate hôm nay và

$$d_1 = \frac{\ln(F_0/K) + \tfrac{1}{2}\sigma^2 T}{\sigma\sqrt{T}}, \qquad d_2 = d_1 - \sigma\sqrt{T}.$$

(Đây đúng là công thức Black-76 mà Chương 5 và Chương 9 sẽ dẫn xuất đầy đủ từ tích phân lognormal; ở đây ta chỉ cần biết rằng một khi $F$ đã là martingale lognormal dưới $\mathbb{Q}^{T+\tau}$, kỳ vọng $\mathbb{E}^{T+\tau}[(F(T)-K)^+]$ có nghiệm đóng chính là $F_0 N(d_1) - K N(d_2)$.) Không giải PDE, không mô phỏng Monte Carlo — chỉ chọn đúng "đơn vị đo". Kỹ năng nhìn ra numeraire nào khiến bài toán tự gọn là dấu hiệu phân biệt một rates quant có nghề. Chiêu này cũng cảnh báo cạm bẫy đối ngẫu của nó: khi một payoff bị *ép* trả ở một measure "sai" so với measure tự nhiên nơi rate của nó là martingale — kinh điển là hợp đồng **CMS** trả swap rate 10Y tại một ngày duy nhất chứ không dọc theo annuity của nó — thì tính martingale không còn miễn phí, và ta phải trả một khoản hiệu chỉnh gọi là **convexity adjustment**, đề tài của Chương 9. Cùng một định lý đổi numeraire vừa cho ta công thức đóng khi may, vừa giải thích chính xác khi nào ta phải trả thêm tiền để định giá.

## 4.8 Tóm tắt chuỗi logic — đọc lại mỗi khi lạc đường

Cả chương gói vào một mạch suy luận sáu bước. Khi mất phương hướng ở bất kỳ chương sau nào, quay về đây.

1. Ngân hàng bán derivative rồi **hedge** nó, nên cần một giá *không* phụ thuộc dự báo hướng đi của bất kỳ ai.
2. Hedge được là vì payoff **replicate** được bằng trading tài sản gốc; Law of One Price khi đó buộc giá bằng đúng chi phí replicate — một con số khách quan (ta thấy nó ra $10$ ở §4.2).
3. FTAP đóng gói điều đó thành một tương đương: "giá bằng chi phí replicate, thị trường không arbitrage" $\Leftrightarrow$ "giá bằng kỳ vọng payoff chiết khấu dưới measure $\mathbb{Q}$"; và $\mathbb{Q}$ duy nhất $\Leftrightarrow$ số công cụ hedge khớp số nguồn rủi ro (FTAP II qua lăng kính đếm).
4. Đổi từ $\mathbb{P}$ sang $\mathbb{Q}$ (Girsanov) *dịch drift* mọi tài sản trade được về $r$ và **giữ nguyên volatility**; cầu nối là market price of risk $\lambda = (\mu - r)/\sigma$, thứ bị giặt sạch về 0.
5. Hệ quả nghiệp vụ: drift thực $\mu$ gần như không quan sát được (mean-blur, cần ~400 năm dữ liệu để biết với sai số 1%), nên định giá dưới $\mathbb{Q}$ — nơi $\mu$ được thay bằng $r$ quan sát được — không chỉ tiện mà là *lối thoát duy nhất*. Input sống sót và quan trọng nhất là **vol**, dẫn thẳng tới Chương 5–6.
6. Thế giới thật incomplete → $\mathbb{Q}$ không duy nhất → một *dải* giá no-arbitrage (ta tính ra dải $(0,1)$ ở §4.5) → thị trường chốt điểm trong dải qua giá option quoted → nghề Q **calibrate** vào giá thị trường thay vì estimate từ lịch sử, và đó là nghi thức trung tâm của mọi chương định giá phía sau (Chương 7, 8).

# Chương 5: Black-Scholes và Greeks

Black-Scholes là hòn đá tảng mà cả ngành derivatives đứng lên, và nghịch lý của nó là: gần như mọi giả định của mô hình đều sai, thế mà không desk nào trên thế giới bỏ được nó. Lý do sẽ rõ dần trong chương — công thức BS không được dùng như một cỗ máy *dự báo* giá, mà như một *ngôn ngữ chung* để quy đổi giữa giá và vol, và như một *khung hedging* để biến một option (thứ rủi ro) thành một chuỗi giao dịch cổ phiếu (thứ hiểu được). Chương này đi hai con đường dẫn ra công thức (PDE hedging và martingale), bắc thêm cầu sang Black-76 và Bachelier — hai biến thể mà desk rates/FX/commodities thật sự dùng — rồi dựng bộ Greeks đầy đủ với derivation từng cái từ công thức gốc. Sau đó ta bước vào phần mà desk thật sự sống cùng: phương trình P&L của delta-hedging, chi phí của hedge rời rạc và transaction cost (Leland), và cuối cùng là implied vol — nghịch lý trung tâm của nghề.

## 5.1 Mô hình và hai con đường ra công thức

**Giả định Black-Scholes-Merton (1973):** giá theo GBM với vol hằng $\sigma$; lãi suất hằng $r$; trade liên tục, không phí, không hạn chế short; không dividend (nới sau). Dưới measure Q (drift → $r$ theo Girsanov):

$$dS_t = r S_t\,dt + \sigma S_t\,dW_t^{\mathbb{Q}}$$

Điểm cần khắc sâu ngay: dưới Q, drift thật $\mu$ của cổ phiếu **biến mất hoàn toàn**, thay bằng $r$. Đây không phải một thủ thuật toán học tuỳ tiện — nó là hệ quả của no-arbitrage (chương 4): giá option không được phép phụ thuộc vào quan điểm của ai về việc cổ phiếu sẽ tăng hay giảm, vì bất kỳ quan điểm nào cũng có thể bị hedge sạch. Con đường PDE dưới đây sẽ cho ta thấy *chính xác cơ chế* mà $\mu$ bị xoá.

**Đường 1 — PDE (lập luận hedging gốc của Black-Scholes).** Xét portfolio $\Pi = V - \Delta S$ (bán option, giữ $\Delta$ cổ phiếu). Áp Itô cho $V(S,t)$, chọn $\Delta = \partial V/\partial S$ để triệt tiêu số hạng $dW$ → portfolio tức thời phi rủi ro → phải sinh lãi $r$ (không thì arbitrage). Ra **Black-Scholes PDE**:

$$\frac{\partial V}{\partial t} + \frac{1}{2}\sigma^2 S^2 \frac{\partial^2 V}{\partial S^2} + rS\frac{\partial V}{\partial S} - rV = 0$$

Mọi derivative châu Âu trên $S$ (call, put, digital, bất kỳ payoff nào) đều thỏa PDE này — chỉ khác **điều kiện biên** $V(S,T) = \text{payoff}(S)$. Đây là lý do PDE engine trong pricing library viết một lần dùng cho cả họ sản phẩm.

Dẫn xuất đầy đủ của đường 1 (nên tự viết lại được từng dòng). Portfolio $\Pi = V - \Delta S$. Dưới measure thực P, cổ phiếu có drift thật $\mu$: $dS = \mu S\,dt + \sigma S\,dW$. Áp Itô cho $V(S,t)$ — nhớ số hạng bậc hai $\tfrac{1}{2}V_{SS}(dS)^2$ với $(dS)^2 = \sigma^2 S^2\,dt$:

$$dV = V_t\,dt + V_S\,dS + \tfrac{1}{2}V_{SS}(dS)^2 = \left(V_t + \mu S V_S + \tfrac{1}{2}\sigma^2 S^2 V_{SS}\right)dt + \sigma S V_S\,dW$$

Vi phân của portfolio, coi $\Delta$ cố định trong khoảng $dt$ (self-financing):

$$d\Pi = dV - \Delta\,dS = \left(V_t + \mu S V_S + \tfrac{1}{2}\sigma^2 S^2 V_{SS}\right)dt + \sigma S V_S\,dW - \Delta(\mu S\,dt + \sigma S\,dW)$$

Gom số hạng $dt$ và $dW$:

$$d\Pi = \left(V_t + \mu S V_S + \tfrac{1}{2}\sigma^2 S^2 V_{SS} - \Delta\mu S\right)dt + \left(\sigma S V_S - \Delta\sigma S\right)dW$$

Chọn $\Delta = V_S$ → **cả hai số hạng chứa $dW$ và chứa $\mu$ biến mất cùng lúc** (đây là khoảnh khắc quan trọng nhất: hedge rủi ro cũng đồng thời xóa dự báo). Hệ số $dW$ thành $\sigma S V_S - V_S \sigma S = 0$; và trong phần $dt$, hai số hạng $\mu$ triệt nhau: $\mu S V_S - V_S\mu S = 0$. Còn lại:

$$d\Pi = \left(V_t + \tfrac{1}{2}\sigma^2 S^2 V_{SS}\right)dt$$

Portfolio giờ tất định (không còn $dW$) → phải sinh lãi risk-free, nếu không thì có arbitrage: $d\Pi = r\Pi\,dt = r(V - S V_S)\,dt$. Cân bằng hai vế:

$$V_t + \tfrac{1}{2}\sigma^2 S^2 V_{SS} = rV - rS V_S$$

Chuyển vế ra đúng BS PDE. Chú ý điều thần kỳ: $\mu$ đã bốc hơi ngay ở bước chọn $\Delta$, *trước cả* khi ta viện đến no-arbitrage. Đó là lý do sâu xa vì sao giá option không phụ thuộc drift thật — không phải vì ta "giả định" risk-neutrality, mà vì phép hedge tự động khử nó. Ghi chú thực chiến: lập luận cần trade **liên tục** và **không phí** — hai thứ không tồn tại; sai số do hedge rời rạc là $O(\sqrt{\Delta t})$ và là rủi ro thật desk gánh (mục 5.3–5.4).

**Đường 2 — martingale (cách hiện đại).** Áp thẳng công thức risk-neutral: $C_0 = e^{-rT}\,\mathbb{E}^{\mathbb{Q}}[(S_T - K)^+]$ với $S_T$ lognormal (đã giải ở chương 3). Feynman-Kac bảo đảm nghiệm PDE ở đường 1 chính là kỳ vọng chiết khấu này — hai con đường gặp nhau. Ta làm trọn tích phân để thấy công thức không rơi từ trời xuống.

Dưới Q, $\ln S_T = \ln S_0 + (r - \tfrac{1}{2}\sigma^2)T + \sigma\sqrt{T}\,Z$ với $Z\sim N(0,1)$. Viết $S_T = S_0\exp\!\big((r-\tfrac{1}{2}\sigma^2)T + \sigma\sqrt{T}z\big)$ và tách kỳ vọng thành hai phần:

$$C_0 = e^{-rT}\int_{-\infty}^{\infty}\!\big(S_0 e^{(r-\frac{1}{2}\sigma^2)T+\sigma\sqrt{T}z} - K\big)^+ \phi(z)\,dz$$

Payoff dương khi $S_T > K$, tức khi $z > z^* = \dfrac{\ln(K/S_0) - (r-\frac{1}{2}\sigma^2)T}{\sigma\sqrt{T}}$. Chú ý $-z^* = d_2$. Tích phân trên $[z^*,\infty)$ tách thành hai:

$$C_0 = e^{-rT}S_0\!\int_{z^*}^{\infty}\! e^{(r-\frac{1}{2}\sigma^2)T+\sigma\sqrt{T}z}\phi(z)\,dz \;-\; e^{-rT}K\!\int_{z^*}^{\infty}\!\phi(z)\,dz$$

Phần thứ hai dễ: $\int_{z^*}^{\infty}\phi(z)\,dz = N(-z^*) = N(d_2)$, cho ngay $Ke^{-rT}N(d_2)$. Phần thứ nhất cần "hoàn thành bình phương" ở số mũ: $-\tfrac{1}{2}z^2 + \sigma\sqrt{T}z = -\tfrac{1}{2}(z-\sigma\sqrt{T})^2 + \tfrac{1}{2}\sigma^2 T$. Kết hợp với $e^{(r-\frac{1}{2}\sigma^2)T}$ ở trước, số hạng $e^{-\frac{1}{2}\sigma^2 T}\cdot e^{\frac{1}{2}\sigma^2 T} = 1$ và còn lại $e^{rT}$ triệt với $e^{-rT}$ ngoài cùng. Đổi biến $u = z - \sigma\sqrt{T}$:

$$e^{-rT}S_0 e^{rT}\!\int_{z^*-\sigma\sqrt{T}}^{\infty}\!\phi(u)\,du = S_0\,N\!\big(-(z^*-\sigma\sqrt{T})\big) = S_0\,N(d_2 + \sigma\sqrt{T}) = S_0\,N(d_1)$$

Ghép lại đúng **công thức Black-Scholes** (call châu Âu, thêm dividend yield $q$ bằng cách thay $S_0 \to S_0 e^{-qT}$ và $r \to r-q$ trong drift):

$$C = S_0 e^{-qT} N(d_1) - K e^{-rT} N(d_2)$$

$$d_1 = \frac{\ln(S_0/K) + (r - q + \sigma^2/2)T}{\sigma\sqrt{T}}, \qquad d_2 = d_1 - \sigma\sqrt{T}$$

Put qua put-call parity: $P = Ke^{-rT}N(-d_2) - S_0 e^{-qT} N(-d_1)$.

Cách đọc công thức bằng lời (giúp nhớ và giúp debug): $N(d_2)$ = xác suất risk-neutral option đáo hạn ITM ($\mathbb{Q}(S_T > K)$); $S_0 e^{-qT} N(d_1)$ = PV của "nhận cổ phiếu nếu ITM" (chú ý: $N(d_1)$ *không* phải xác suất — nó là kỳ vọng có điều kiện đã đổi sang stock measure, đó là lý do nó lớn hơn $N(d_2)$). Digital call (trả 1 nếu $S_T>K$) do đó có giá $e^{-rT}N(d_2)$ — đọc thẳng từ công thức. Với bộ tham số chuẩn ($N(d_2)=0.5596$, $r=5\%$, $T=1$), digital call ATM đáng giá $e^{-0.05}\times 0.5596 = 0.532$ — hơn nửa đồng cho quyền nhận 1 đồng nếu $S_T>100$, phản ánh $\mathbb{Q}(S_T>K)\approx 56\%$ đã chiết khấu về hiện tại. Đây cũng chính là công cụ debug: nếu giá digital do library trả về không khớp $0.532$ tính tay, lỗi nằm ở $d_2$ hoặc discount factor — và tiện thể, con số này bằng đúng $\rho/(KT)$ của call vanilla, một quan hệ dễ kiểm tra chéo.

**Công thức Black-76** — biến thể dùng nhiều nhất trong industry (rates, commodities, FX đều quote qua nó): thay spot bằng **forward** $F$:

$$C = e^{-rT}\left[ F N(d_1) - K N(d_2) \right], \qquad d_{1,2} = \frac{\ln(F/K) \pm \sigma^2 T/2}{\sigma\sqrt{T}}$$

Black-76 không phải mô hình khác — nó chính là BS viết lại quanh forward. Với cổ phiếu không dividend, $F = S_0 e^{rT}$; thay vào Black-76 và $F N(d_1)e^{-rT} = S_0 N(d_1)$ đưa ta trở về BS gốc. Ưu điểm của cách viết theo forward: nó tách bạch cái ta thật sự bất định (forward, tức giá kỳ vọng) khỏi phần chiết khấu tất định, và áp dụng nguyên xi cho mọi underlying có forward quote sẵn — đó là lý do desk rates/FX/commodities gần như chỉ nói bằng ngôn ngữ Black-76.

**Bachelier (normal) model** — payoff trên $F$ với nhiễu **cộng** thay vì nhân: $dF = \sigma_N\,dW$. Ở đây forward là một Brownian arithmetic, nên $F_T \sim N(F_0, \sigma_N^2 T)$: chỉ dịch chuyển và tán rộng, không co giãn theo mức giá. Dẫn xuất công thức Bachelier đi đúng mạch đường 2 nhưng dễ hơn vì $F_T$ đã là chuẩn tắc. Viết $F_T = F + \sigma_N\sqrt{T}\,z$ với $z\sim N(0,1)$; call payoff $(F_T-K)^+$ dương khi $z > -d$ với $d = (F-K)/(\sigma_N\sqrt{T})$:

$$C = e^{-rT}\int_{-d}^{\infty}\!\big(F - K + \sigma_N\sqrt{T}\,z\big)\phi(z)\,dz$$

Tách hai số hạng. Số hạng thứ nhất: $(F-K)\int_{-d}^{\infty}\phi(z)\,dz = (F-K)N(d)$. Số hạng thứ hai dùng identity $\int z\,\phi(z)\,dz = -\phi(z)$, nên $\sigma_N\sqrt{T}\int_{-d}^{\infty}z\,\phi(z)\,dz = \sigma_N\sqrt{T}\,\big[-\phi(z)\big]_{-d}^{\infty} = \sigma_N\sqrt{T}\,\phi(d)$ (dùng $\phi$ chẵn). Ghép lại:

$$C = e^{-rT}\Big[(F-K)\,N(d) + \sigma_N\sqrt{T}\,\phi(d)\Big], \qquad d = \frac{F-K}{\sigma_N\sqrt{T}}$$

Bachelier là chuẩn quote cho swaption từ khi lãi suất âm xuất hiện (2015+): lognormal của BS cấm $F$ âm nên vô dụng khi rate quanh 0 hoặc âm, còn normal thì cho $F$ âm thoải mái. Vol Bachelier $\sigma_N$ đo bằng **bp/năm** (chênh lệch tuyệt đối) thay vì % (chênh lệch tương đối) — một swaption ATM với $\sigma_N = 80\,\text{bp}$/năm nghĩa là forward rate dao động ~80 bp quanh mức hiện tại trong một năm, một ngôn ngữ tự nhiên hơn nhiều cho người trade lãi suất.

**Bachelier bằng số** — swaption ATM ($F = K$), $\sigma_N = 80\,\text{bp}$/năm $= 0.0080$, $T = 1$, chiết khấu $r = 5\%$. Khi $F = K$ thì $d = 0$, $N(0) = 0.5$, $\phi(0) = 0.3989$, và số hạng $(F-K)N(d)$ tắt hẳn — giá option ATM rút gọn về đúng một công thức đẹp:

$$C_{\text{ATM}} = e^{-rT}\sigma_N\sqrt{T}\,\phi(0) = e^{-0.05}\times 0.0080\times 1\times 0.3989 = 0.003036$$

Tức **~30.4 bp** trên notional. Đọc con số: quyền chọn ATM 1 năm trên một rate có vol tuyệt đối 80 bp đáng giá cỡ 30 bp — và tỉ lệ $\phi(0)\approx 0.4$ giữa hai con số ($30/80$) chính là hằng số $\sqrt{1/(2\pi)}$ quen thuộc, đúng cho *mọi* option ATM trong thế giới normal bất kể $\sigma_N$. Đây là quy tắc nhẩm mà trader rates dùng hằng ngày: "premium ATM ≈ $0.4\times\sigma_N\sqrt{T}$", một xấp xỉ mà dạng lognormal không cho gọn được như thế.

## 5.2 Greeks — sản phẩm thật sự của desk

Trader không trả tiền cho quant để biết giá (thị trường cho giá). Trader cần **độ nhạy** để hedge. Bộ Greeks với call BS (không dividend):

| Greek | Định nghĩa | Công thức BS | Trực giác & thực chiến |
|---|---|---|---|
| **Delta** $\Delta$ | $\partial V/\partial S$ | $N(d_1)$ | Số cổ phiếu để hedge. Call: 0→1, ATM ≈ 0.5. Trader nói vị thế bằng delta ("long 2M delta"). Strike của FX smile quote theo delta (25d RR). |
| **Gamma** $\Gamma$ | $\partial^2 V/\partial S^2$ | $\frac{\phi(d_1)}{S\sigma\sqrt{T}}$ | Tốc độ delta đổi. Lớn nhất ATM gần expiry. Long gamma = hedge có lời khi thị trường động; short gamma = nguy hiểm, lỗ phi tuyến khi gap. |
| **Vega** | $\partial V/\partial \sigma$ | $S\phi(d_1)\sqrt{T}$ | Nhạy theo vol. Option dài hạn vega lớn. Vega book là rủi ro số 1 của desk exotic. Không phải chữ Hy Lạp thật — dân tài chính bịa ra. |
| **Theta** $\Theta$ | $\partial V/\partial t$ | $-\dfrac{S\phi(d_1)\sigma}{2\sqrt{T}} - rKe^{-rT}N(d_2)$ | "Tiền thuê" của option: mỗi ngày trôi qua option mất giá (âm với long option). Đối ngẫu với gamma (xem 5.3). |
| **Rho** $\rho$ | $\partial V/\partial r$ | $KTe^{-rT}N(d_2)$ | Nhỏ với option ngắn hạn; quan trọng với rates products (ở đó gọi là DV01/IR delta). |

**Derivation của từng Greek từ công thức BS.** Điểm khiến việc lấy đạo hàm BS đẹp đến bất ngờ là một identity: $S_0\phi(d_1) = Ke^{-rT}\phi(d_2)$ (không dividend). Kiểm tra: $\phi(d_1)/\phi(d_2) = e^{-\frac{1}{2}(d_1^2-d_2^2)}$; mà $d_1^2 - d_2^2 = (d_1-d_2)(d_1+d_2) = \sigma\sqrt{T}\cdot\frac{2\ln(S_0/K)+2rT}{\sigma\sqrt{T}} = 2\ln(S_0/K) + 2rT$, nên tỉ số $= e^{-\ln(S_0/K)-rT} = \frac{K}{S_0}e^{-rT}$, đúng bằng $Ke^{-rT}/S_0$. Identity này làm sạch một loạt số hạng khi lấy đạo hàm.

*Delta.* Từ $C = S_0 N(d_1) - Ke^{-rT}N(d_2)$, đạo hàm theo $S_0$ (nhớ cả $d_1,d_2$ phụ thuộc $S_0$ qua $\partial d_1/\partial S_0 = \partial d_2/\partial S_0 = \frac{1}{S_0\sigma\sqrt{T}}$):

$$\frac{\partial C}{\partial S_0} = N(d_1) + S_0\phi(d_1)\frac{\partial d_1}{\partial S_0} - Ke^{-rT}\phi(d_2)\frac{\partial d_2}{\partial S_0}$$

Hai số hạng cuối triệt tiêu nhờ identity $S_0\phi(d_1) = Ke^{-rT}\phi(d_2)$ và $\partial d_1/\partial S_0 = \partial d_2/\partial S_0$. Còn lại $\Delta = N(d_1)$ — gọn đúng như bảng. Bài học: mọi số hạng "dây chuyền" qua $d_1,d_2$ tự khử; đó là lý do các Greeks bậc nhất của BS đơn giản đến vậy.

*Gamma.* Đạo hàm $\Delta = N(d_1)$ thêm một lần theo $S_0$: $\Gamma = \phi(d_1)\cdot\frac{\partial d_1}{\partial S_0} = \frac{\phi(d_1)}{S_0\sigma\sqrt{T}}$. Gamma luôn dương (long option luôn long gamma), đối xứng call–put (cùng $\Gamma$), và bùng lên khi $T\to 0$ ở ATM vì mẫu $\sigma\sqrt{T}\to 0$.

*Vega.* Đạo hàm $C$ theo $\sigma$. Lần này $d_1,d_2$ phụ thuộc $\sigma$ với $\partial d_1/\partial\sigma$ và $\partial d_2/\partial\sigma$ **khác nhau** (vì $d_2 = d_1 - \sigma\sqrt{T}$ nên $\partial d_2/\partial\sigma = \partial d_1/\partial\sigma - \sqrt{T}$). Cùng identity làm hai số hạng dây chuyền gộp lại, và chênh lệch $\sqrt{T}$ sống sót: $\mathcal{V} = S_0\phi(d_1)\sqrt{T}$. Vega dương, cực đại quanh ATM, và tỉ lệ $\sqrt{T}$ — đó là lý do option dài hạn có vega lớn.

*Theta.* Đạo hàm theo thời gian (viết theo $t$, với $\tau = T-t$). Kết quả cho call không dividend: $\Theta = -\dfrac{S_0\phi(d_1)\sigma}{2\sqrt{T}} - rKe^{-rT}N(d_2)$. Hai thành phần có ý nghĩa vật lý rõ: số hạng thứ nhất là **phí thuê gamma** (sẽ nối với 5.3), số hạng thứ hai là **chi phí funding** của việc "trả sau" $K$ ở đáo hạn.

*Rho.* Đạo hàm theo $r$: chỉ $Ke^{-rT}$ và $d_2$ chứa $r$; sau khi các số hạng dây chuyền khử nhau còn $\rho = KTe^{-rT}N(d_2)$.

**Một option cụ thể, mọi Greeks bằng số** — call $S = 100$, $K = 100$, $r = 5\%$, $\sigma = 20\%$, $T = 1$, không dividend. Tính: $d_1 = \frac{0 + (0.05 + 0.02)}{0.2} = 0.35$, $d_2 = 0.15$; $N(d_1) = 0.6368$, $N(d_2) = 0.5596$, $\phi(d_1) = 0.3752$.

| Đại lượng | Tính | Giá trị | Đọc |
|---|---|---|---|
| Giá $C$ | $100(0.6368) - 95.12(0.5596)$ | **10.45** | ~10.5% notional cho quyền 1 năm ATM |
| Delta | $N(d_1)$ | 0.637 | hedge: short call này thì mua 0.637 cổ phiếu |
| Gamma | $0.3752/(100 \cdot 0.2)$ | 0.0188 | spot +1 → delta tăng ~0.019 |
| Vega | $100 \cdot 0.3752 \cdot 1$ | 0.375/vol pt | vol 20→21% → giá tăng 0.375 (3.6% giá option!) |
| Theta | $-\frac{100\cdot 0.3752\cdot 0.2}{2} - 5\%\cdot 95.12\cdot 0.5596$ | −6.41/năm ≈ −0.025/ngày | mỗi ngày "tiền thuê" ~2.5 cent |
| Rho | $95.12 \cdot 0.5596$ | 0.532/1% | rate 5→6% → giá tăng 0.53 |

Ba quan sát từ bảng: (1) vega lớn khủng khiếp so với theta ngày — vì vậy trader ATM 1Y lo vol hơn lo time decay; (2) delta 0.637 chứ không phải 0.5 dù ATM — drift $r + \sigma^2/2$ trong $d_1$ đẩy lên (ATM-forward mới cho delta ≈ 0.5); (3) kiểm tra chéo quan hệ gamma–theta: $-\frac{1}{2}\Gamma S^2\sigma^2 = -\frac{1}{2}(0.0188)(10000)(0.04) = -3.76$ ≈ đúng thành phần chính của theta (phần còn lại $-2.66$ là chi phí funding strike $rKe^{-rT}N(d_2)$; cộng lại $-3.76-2.66 = -6.42 \approx \Theta$). Ghi nhớ sự tách đôi này — ở 5.3 ta sẽ thấy chỉ **thành phần gamma $-3.76$** mới sống sót trong P&L của vị thế đã hedge, còn $-2.66$ funding bị carry khử. Mọi pricing library cần unit test đúng bộ số này (và test put-call parity, test Greeks bằng finite difference vs closed-form) — bộ số trên là fixture chuẩn cho `src/models` + `src/engines`.

**Second-order Greeks — tính bằng số.** Desk exotic không sống bằng delta mà bằng bậc hai. Ba cái quan trọng nhất, với chính bộ tham số trên:

*Vanna* $= \partial^2 V/\partial S\partial\sigma$ — delta đổi khi vol đổi, hay tương đương vega đổi khi spot đổi. Công thức $\text{Vanna} = -\phi(d_1)\dfrac{d_2}{\sigma}$. Thay số: $-0.3752\times\frac{0.15}{0.20} = -0.2814$ (trên một đơn vị vol = 1.00; tức $-0.00281$ trên mỗi vol-point 1%). Dấu âm ở call OTM-side nghĩa là khi vol tăng, delta của call *giảm* nhẹ — trung tâm của việc hedge FX smile: risk reversal chính là một vị thế vanna.

*Volga (vomma)* $= \partial^2 V/\partial\sigma^2$ — độ lồi của giá theo vol. Công thức $\text{Volga} = \mathcal{V}\dfrac{d_1 d_2}{\sigma}$. Thay số: $37.52\times\frac{0.35\times 0.15}{0.20} = 9.85$ (trên vol$^2$; tức $\approx 0.000985$ trên mỗi (vol-point)$^2$). Volga dương nghĩa là vega tăng khi vol tăng — đó là cơ chế toán học khiến một butterfly (long volga) có giá, và là lý do smile tồn tại nhìn từ góc vol-of-vol.

*Charm* $= \partial^2 V/\partial S\partial t = \partial\Delta/\partial t$ — delta rò rỉ theo thời gian dù spot đứng yên. Với call không dividend, $\text{Charm} = -\phi(d_1)\dfrac{2rT - d_2\sigma\sqrt{T}}{2T\sigma\sqrt{T}} = -0.0657$/năm, tức $\approx -0.00026$/ngày. Nhỏ, nhưng charm là lý do desk phải re-hedge trước cuối tuần và ngày lễ: giữ nguyên delta qua ba ngày không giao dịch, delta "thật" đã trôi đi $3\times(-0.00026)\approx -0.0008$ — gần một phần nghìn cổ phiếu trên mỗi option, mà thị trường chưa mở để chỉnh. Nhân với một book vài trăm nghìn option, đó là cả một khối delta lặng lẽ tích lại qua đêm thứ Sáu.

Trong library hiện đại, Greeks không tính bằng công thức đóng (chỉ vanilla mới có) mà bằng **bump-and-reprice** (đắt: reprice $n+1$ lần cho $n$ Greeks) hoặc **AAD** (adjoint algorithmic differentiation — mọi Greeks trong ~3–5 lần chi phí một lần price, chương 12; trong repo: `src/aad`). Với exotic được định giá bằng Monte Carlo, bump-and-reprice còn kèm bẫy noise: chênh lệch giữa hai lần MC bị nhiễu che, nên Greeks bậc hai gần như vô nghĩa nếu không dùng chung random seed (pathwise/common random numbers) — một trong những lý do AAD thắng lớn.

## 5.3 Delta hedging và phương trình P&L quan trọng nhất nghề trading vol

Bán option, delta-hedge liên tục theo BS → về lý thuyết P&L = 0 (đó chính là lập luận suy ra PDE). Thực tế hedge rời rạc với vol thật $\sigma_{\text{real}}$ có thể khác vol định giá $\sigma_{\text{imp}}$. Kết quả nền tảng (làm được từ Itô + BS PDE):

**P&L mỗi bước hedge của người LONG option (đã delta-hedge):**

$$\text{P\&L} \approx \frac{1}{2}\Gamma S^2\left[ \left(\frac{\Delta S}{S}\right)^2 - \sigma_{\text{imp}}^2 \Delta t \right]$$

Nguồn gốc của phương trình này đáng viết ra vì nó là linh hồn của nghề. Người long option nắm $V$; hedge bằng cách short $\Delta = V_S$ cổ phiếu. Trong một bước nhỏ, giá option đổi theo Taylor bậc hai: $\Delta V \approx V_t\,\Delta t + V_S\,\Delta S + \tfrac{1}{2}V_{SS}(\Delta S)^2$. P&L của vị thế đã hedge là $\Delta V - V_S\Delta S$ (đổi giá option trừ đổi giá phần cổ phiếu short), cộng chi phí carry — số hạng $V_S\Delta S$ triệt tiêu tuyến tính, còn lại:

$$\text{P\&L} \approx V_t\,\Delta t + \tfrac{1}{2}V_{SS}(\Delta S)^2$$

Thay $V_t$ từ BS PDE — PDE nói $V_t = rV - rSV_S - \tfrac{1}{2}\sigma_{\text{imp}}^2 S^2 V_{SS}$, và phần $rV - rSV_S$ đúng bằng chi phí funding của vị thế đã hedge nên bị carry khử. Chỉ còn lại số hạng gamma:

$$\text{P\&L} \approx \tfrac{1}{2}V_{SS}\big[(\Delta S)^2 - \sigma_{\text{imp}}^2 S^2\Delta t\big] = \tfrac{1}{2}\Gamma S^2\Big[\big(\tfrac{\Delta S}{S}\big)^2 - \sigma_{\text{imp}}^2\Delta t\Big]$$

Chú ý kỹ điều này để không sập bẫy phổ biến nhất: "theta" xuất hiện trong phương trình P&L đã hedge **không phải** full BS theta $-6.41$/năm. Vì funding ($rV - rSV_S$, tương ứng thành phần $-2.66$ trong theta) đã bị carry khử, cái còn lại chỉ là **theta gamma thuần** $-\tfrac{1}{2}\Gamma S^2\sigma_{\text{imp}}^2 = -3.76$/năm $= -0.0149$/ngày. Trộn full theta vào đây là mâu thuẫn nội tại — ta sẽ dùng đúng con số thuần này ở ví dụ số ngay dưới.

Đọc bằng lời: mỗi ngày, người long gamma **thắng nếu realized move bình phương vượt implied variance**, thua nếu thị trường yên hơn implied. Theta chính là "phí thuê gamma": lấy kỳ vọng số hạng trên, $\mathbb{E}[(\Delta S)^2] = \sigma_{\text{real}}^2 S^2\Delta t$, và ở realized = implied thì P&L kỳ vọng bằng 0, nghĩa là $\Theta_\Gamma \approx -\tfrac{1}{2}\Gamma S^2\sigma_{\text{imp}}^2$ (quan hệ gamma-theta, khớp thành phần thứ nhất của theta ở 5.2). Tích lũy cả đời option:

$$\text{Total P\&L} = \frac{1}{2}\int_0^T \Gamma S^2 \left(\sigma_{\text{real}}^2 - \sigma_{\text{imp}}^2\right) dt$$

**Một ngày hedge bằng số** — dùng option ở bảng 5.2 (Γ = 0.0188, implied 20%). Breakeven move ngày $= S\sigma_{\text{imp}}\sqrt{1/252} = 100 \times 0.2/15.87 = 1.26$; và "phí thuê" một ngày chính là theta gamma thuần $-\tfrac{1}{2}\Gamma S^2\sigma_{\text{imp}}^2\Delta t = -3.76/252 = -0.0149$. Kiểm tra tính nhất quán: breakeven đúng là điểm gamma P&L bù hết phí thuê, $\tfrac{1}{2}(0.0188)(1.26)^2 = 0.0149$ — khớp chính xác con số $0.0149$, xác nhận phải dùng theta thuần chứ không phải full theta. Người long option đã delta-hedge:
- Thị trường move ±2.0: gamma P&L $= \frac{1}{2}(0.0188)(2^2) = +0.0376$; phí thuê gamma $-0.0149$ → **lãi ròng $+0.023$**.
- Thị trường move ±0.5: gamma P&L $= \frac{1}{2}(0.0188)(0.5^2) = +0.0023$; phí thuê vẫn $-0.0149$ → **lỗ ròng $-0.013$**.

"Move 2.0 khi breakeven 1.26" chính là "realized vol hôm nay 32% khi implied 20%" (vì $2.0/1.26\times 20\% \approx 32\%$). Cứ thế cộng dồn 252 ngày — đó là toàn bộ đời sống của một vol trader, và là lý do họ nhìn bảng "realized vs implied" như trader cổ phiếu nhìn giá.

Hệ quả nghề nghiệp:
1. **Trading option = trading realized vs implied vol.** Hướng đi của $S$ bị hedge sạch; còn lại là cược vol.
2. P&L phụ thuộc **đường đi** (qua trọng số $\Gamma S^2$): đoán đúng "vol trung bình sẽ cao hơn implied" vẫn có thể lỗ nếu vol nổ ở vùng gamma thấp. Muốn cược vol "sạch" đường đi → **variance swap** (chương 6), nơi trọng số $\Gamma S^2$ được san phẳng bằng một danh mục option toàn strike.
3. Hedge rời rạc + phí giao dịch → residual risk thật. Model đúng đến đâu, desk vẫn ăn ngủ với friction; đây là khoảng cách vĩnh viễn giữa textbook và desk — và là chủ đề của mục kế.

## 5.4 Hedge rời rạc và transaction cost — nơi textbook gặp desk

Phương trình 5.3 giả định hedge **liên tục**. Trong thực tế trader chỉnh delta rời rạc (mỗi ngày, mỗi giờ, hay khi delta trôi quá ngưỡng), và mỗi lần chỉnh trả phí. Hai loại chi phí này kéo P&L ra khỏi lý thuyết theo hai cách khác nhau, và desk phải định lượng cả hai.

**Chi phí thứ nhất — sai số rời rạc (không phí).** Ngay cả khi giao dịch miễn phí, hedge cách quãng để lại một sai số ngẫu nhiên vì trong mỗi khoảng $\Delta t$ delta bị "đóng băng" trong khi spot vẫn chạy. Sai số một bước có kỳ vọng bằng 0 (đó là lý do BS vẫn cho giá đúng "trung bình") nhưng có **phương sai** không triệt tiêu. Kết quả cổ điển (Boyle–Emanuel, Kamal–Derman): với $n$ lần rebalance đều nhau trên đời option, độ lệch chuẩn của tổng sai số hedge co lại theo $1/\sqrt{n}$, cụ thể tỉ lệ với $\sqrt{\pi/4}$ nhân độ lớn gamma-P&L điển hình.

**Bằng số** với option chuẩn: mỗi bước hedge có gamma-P&L điển hình cỡ $\tfrac{1}{2}\Gamma S^2\sigma^2\Delta t = 3.76/252 = 0.0149$ (chính là phí thuê gamma một ngày ở 5.3). Kamal–Derman cho độ lệch chuẩn của **tổng** sai số hedge trên cả đời option $\approx \sqrt{\pi/4}\cdot|\Theta_\Gamma|\,T/\sqrt{n}$, với $|\Theta_\Gamma|\,T = 3.76$ là tổng phí thuê gamma một năm. Hedge hằng ngày ($n = 252$): std $\approx 0.886\times 3.76/\sqrt{252} = 0.886\times 3.76/15.87 \approx 0.21$ — nghĩa là quanh giá lý thuyết 10.45, P&L cuối đời của một option đã hedge hằng ngày "rung" với độ lệch chuẩn cỡ **±0.21** (~2% giá option) thuần vì rời rạc, chưa tính phí. Chuyển sang hedge hằng tuần ($n \approx 52$) đẩy std lên $0.886\times 3.76/\sqrt{52} \approx 0.46$ — lớn hơn chừng $\sqrt{252/52}\approx 2.2$ lần. Sai số này là **rủi ro thật** (một khoản lời/lỗ ngẫu nhiên quanh giá lý thuyết) chứ không phải chi phí trung bình — nó làm P&L của desk "rung" chứ không dịch chuyển kỳ vọng.

**Chi phí thứ hai — transaction cost, và hiệu chỉnh Leland.** Đây mới là thứ dịch chuyển kỳ vọng. Mỗi lần re-hedge, ta mua/bán $|\Delta\text{delta}|$ cổ phiếu và trả phí tỉ lệ $k$ (nửa bid-ask spread cộng phí, ví dụ $k = 10\,\text{bp}$ = 0.001). Vì delta của một option di chuyển tỉ lệ với gamma, tổng phí hedge trên đời option tỉ lệ thuận với gamma tích luỹ — chính là thứ đã sinh ra giá option. Leland (1985) có một ý tưởng đẹp: **gộp chi phí hedge vào một vol điều chỉnh** và định giá bằng chính công thức BS với vol đó. Với rebalance đều mỗi $\Delta t$:

$$\sigma_{\text{Leland}}^2 = \sigma^2\Big(1 + \underbrace{\sqrt{\tfrac{2}{\pi}}\,\frac{k}{\sigma\sqrt{\Delta t}}}_{\text{Leland number } Le}\Big)$$

**Bằng số** với option chuẩn ($\sigma = 20\%$), phí $k = 10\,\text{bp}$, rebalance **hằng ngày** ($\Delta t = 1/252$): $Le = \sqrt{2/\pi}\times\frac{0.001}{0.20\times\sqrt{1/252}} = 0.7979\times\frac{0.001}{0.01260} = 0.0633$, nên $\sigma_{\text{Leland}} = 0.20\sqrt{1.0633} = 0.2062$, tức 20.62%. Định giá lại call bằng $\sigma_{\text{Leland}}$: giá lên **10.68** so với 10.45 của BS thuần — chênh **0.23**, đúng bằng "phần bù transaction cost" mà người bán call phải tính thêm để không lỗ vì phí hedge. Đây là con số thật một market maker cộng vào chào giá.

Điều Leland dạy ta về cấu trúc chi phí lộ ra ngay khi ta xoay các tham số. Chi phí tỉ lệ $1/\sqrt{\Delta t}$: rebalance **hằng tuần** ($\Delta t = 1/52$) làm $Le$ tụt còn 0.0288 ($\sigma_{\text{Leland}} = 20.29\%$) — hedge thưa hơn thì rẻ hơn về phí, nhưng (mục "chi phí thứ nhất") lại rủi ro rời rạc cao hơn: đúng cái std nhảy từ 0.21 lên 0.46 ta vừa tính. Đây là **đánh đổi trung tâm của hedging thực chiến**: hedge dày → phí ăn hết lời; hedge thưa → sai số rời rạc nuốt lời. Tăng phí lên $k = 20\,\text{bp}$ (thị trường kém thanh khoản) đẩy $Le$ hằng ngày lên 0.1267 và $\sigma_{\text{Leland}} = 21.23\%$ — chi phí gần gấp đôi vì $Le$ tuyến tính theo $k$. Một cảnh báo Leland đúng chuẩn desk-quant: mô hình này giả định gamma một dấu (long hoặc short toàn phần) và $Le$ nhỏ; với book hỗn hợp dấu gamma hoặc phí lớn, Leland lệch và industry chuyển sang bài toán hedging tối ưu có ngưỡng no-trade (utility-based, Hodges–Neuberger) — nhưng trực giác "phí ↔ vol điều chỉnh" thì vẫn là cách nghĩ đầu tiên của mọi trader.

Ghép hai chi phí lại: desk chọn tần suất hedge để cực tiểu tổng (phí kỳ vọng + độ lệch chuẩn sai số rời rạc theo khẩu vị rủi ro). Với option chuẩn và phí 10 bp, phí Leland (0.23) và std rời rạc hằng ngày (0.21) cùng cỡ nhau — đó không phải trùng hợp mà là dấu hiệu ta đang ở gần điểm cân bằng, nên tần suất tối ưu thường rơi vào tái cân bằng hằng ngày hoặc theo ngưỡng delta-band. Đó là lý do khi bạn nghe "desk hedge theo band", họ đang chạy nghiệm gần đúng của chính bài toán này.

## 5.5 Implied volatility — nghịch lý trung tâm của nghề

**Implied vol** $\sigma_{\text{imp}}(K,T)$: con số duy nhất thỏa $\text{BS}(S_0, K, T, r, \sigma_{\text{imp}}) = C_{\text{market}}$. Tồn tại và duy nhất vì giá BS tăng đơn điệu theo $\sigma$ (vega > 0 trên toàn miền). Giải bằng Newton/Brent hoặc xấp xỉ Jäckel ("Let's Be Rational" — chuẩn công nghiệp hiện tại, nhanh và chính xác đến machine precision).

**Newton iteration bằng số**: thị trường quote call (bộ tham số 5.2) ở giá 12.00; đoán ban đầu $\sigma_0 = 20\%$ cho giá model 10.45, vega 37.52 (theo 1.00 vol). Bước Newton dùng chính vega làm đạo hàm $\partial C/\partial\sigma$: $\sigma_1 = \sigma_0 + \dfrac{C_{\text{market}} - C(\sigma_0)}{\mathcal{V}(\sigma_0)} = 0.20 + \frac{12.00 - 10.45}{37.52} = 0.2413$. Reprice tại 24.13%: $C = 12.01$ — gần như trúng ngay sau **một** bước (vì giá gần tuyến tính theo vol quanh ATM, và Newton dùng đúng slope); thêm một bước nữa hội tụ máy. Đọc ý nghĩa con số: implied 24.13% > 20% nghĩa là thị trường đang định giá option này *đắt hơn* mức vol lịch sử 20% ta cắm vào — market bảo "vol tương lai sẽ cao hơn 20%", hoặc có một phần bù rủi ro (variance risk premium) mà người bán đòi. Chính chênh lệch 24.13% vs 20% này, cộng dồn qua P&L delta-hedge ở 5.3, là thứ vol trader kiếm ăn (hoặc mất) hằng ngày. Với deep OTM vega bé → mẫu số $\to 0$ → Newton dễ văng (bước nhảy khổng lồ ra ngoài miền), production dùng Brent bracket hoặc Jäckel. Chi tiết engineering nhỏ này nhân với hàng triệu quote mỗi ngày là lý do implied-vol solver nhanh/bền là hàm được tối ưu kỹ nhất trong mọi thư viện.

Thực tế thị trường: **mỗi strike/maturity một implied vol khác nhau** — mâu thuẫn trực tiếp với giả định "σ hằng" của BS. Nghịch lý nghề nghiệp đáng chép lại: **industry biết BS sai từ 1987, nhưng vẫn dùng nó hằng ngày — làm bảng quy đổi giá↔vol, không phải làm mô hình dự báo**. Giống đo nhiệt độ bằng một cái nhiệt kế cong chuẩn hóa: mọi người cùng dùng một cái nhiệt kế cong thì giao tiếp vẫn chính xác. "Trader quote vol, không quote giá" — vì vol ổn định và so sánh được giữa strikes, maturities, underlyings, trong khi giá bằng đô-la thì nhảy loạn theo moneyness và không nói lên điều gì tự thân.

Cái nhìn này cũng giải thích vì sao mọi Greek trong chương thực chất là "Greek của cỗ máy quy đổi", không phải "Greek của thực tại". Vega BS là độ nhạy theo *cái vol ta cắm vào công thức*, mà vol đó lại tự đổi theo strike — nên desk exotic phải phân rã rủi ro vol thành vega-per-bucket dọc bề mặt, chứ không tin vào một con vega đơn lẻ. Toàn bộ chương 6 là câu chuyện tiếp theo: mô hình hóa **bề mặt** $\sigma_{\text{imp}}(K,T)$ sao cho nhất quán, không arbitrage, và hedge được exotics — bắt đầu từ đúng những Greek và phương trình P&L ta vừa dựng ở đây.

# Chương 6: Volatility

Nếu Chương 5 dạy ta định giá option với **một** con số vol, chương này bắt đầu bằng một sự thật khó chịu: con số ấy không tồn tại. Thị trường không giao dịch theo một $\sigma$ duy nhất — nó quote một mặt phẳng $\sigma_{\text{imp}}(K,T)$ mấp mô, dốc, cong, và **thay đổi hình dạng** mỗi khi spot nhúc nhích. Toàn bộ nghề equity/FX quant xoay quanh việc thuần hoá cái mặt phẳng đó: hiểu nó từ đâu ra (smile/skew), dựng nó cho trơn và không-arbitrage (surface), và chọn mô hình động lực học cho nó (local vol, stochastic vol, hybrid, rough) để định giá những sản phẩm mà một con số vol không kể nổi. Đây là mảng đặc trưng nhất, và cũng đẹp nhất, của Q-world.

Mục tiêu chương: hiểu smile từ đâu ra, ba họ mô hình xử lý nó (local vol, stochastic vol, hybrid), và cách industry dựng + dùng vol surface. Ta sẽ dẫn xuất **đầy đủ** công thức Dupire, nêu rõ characteristic function của Heston (bắc cầu sang Chương 7 về Fourier pricing), và chạm tới rough volatility — biên giới nghiên cứu đang tràn vào production.

## 6.1 Smile và skew — sự thật thực nghiệm

Black-Scholes giả định $\sigma$ hằng số. Nếu điều đó đúng, cắm giá market của mọi option cùng maturity vào công thức BS và giải ngược ra $\sigma_{\text{imp}}$ (implied vol — nghiệm duy nhất vì giá đơn điệu theo vol) thì ta phải nhận được một đường **phẳng** theo strike. Thực tế không bao giờ phẳng. Vẽ $\sigma_{\text{imp}}(K)$ theo strike với maturity cố định, ta thấy ba dạng đặc trưng theo asset class:

**Equity index** cho đường **dốc xuống** — put OTM đắt hơn call OTM rất nhiều. Gọi là *skew* hoặc *smirk*. Có ba lý do, và một FO quant phải trả lời được cả ba khi bị hỏi vì đây là câu phỏng vấn kinh điển. **Thứ nhất — crash risk**: thị trường nhớ 1987. Skew equity chỉ tồn tại rõ *sau* Black Monday; trước đó smile gần phẳng. Nhà đầu tư trả premium cho khả năng sập đột ngột — một cú gap mà mô hình lognormal của BS không cho phép — nên đuôi trái của phân phối implied dày lên, đẩy vol của put OTM lên. **Thứ hai — cầu bảo hiểm cấu trúc**: các quỹ hưu trí, insurer, quỹ tương hỗ *nắm* danh mục cổ phiếu và *mua* put để hedge downside; họ hầu như không bao giờ mua call OTM để hedge (họ đã long spot rồi). Dòng cầu một chiều này đẩy put vol lên và call vol xuống một cách hệ thống — một lý do micro-cấu trúc thuần tuý, không cần mô hình nào. **Thứ ba — leverage effect**: khi giá cổ phiếu giảm, vốn chủ sở hữu co lại nhưng nợ gần như không đổi, nên đòn bẩy $D/E$ tăng, khiến equity rủi ro hơn và vol tăng. Hệ quả là tương quan spot–vol âm, đo được khoảng $-0.7$ trên index — chính con số này sẽ tái xuất dưới dạng tham số $\rho<0$ trong Heston và SABR ở mục 6.4.

**Số hoá cái skew.** Đừng để hai con số "$-0.7$" và "$1/\sqrt{T}$" trôi qua như khẩu hiệu — hãy cắm số. Bộ running example của cả sách là một index equity 1Y với ATM $\approx15.8\%$, put 10% OTM $\approx18.6\%$, call 10% OTM $\approx14.9\%$ (ta sẽ tái dựng nó bằng SVI ở 6.5). Định nghĩa **skew slope** thô là độ dốc của $\sigma_{\text{imp}}$ theo moneyness giữa hai cánh: từ put OTM tới call OTM là $18.6\%-14.9\%=3.7$ điểm vol trên $20\%$ khoảng cách moneyness, tức $\approx-0.19$ điểm vol mỗi $1\%$ moneyness. Đó là *hình dạng* mà tương quan $\rho=-0.7$ tạo ra: spot xuống thì vol lên, nên nửa trái của smile bị nhấc cao. Còn định luật $1/\sqrt{T}$: nếu skew slope 1Y là $2$ điểm vol (giữa ATM và một strike cố định), thì skew 1M dốc gấp $\sqrt{T_{1Y}/T_{1M}}=\sqrt{12}\approx3.46$ lần, tức $\approx6.9$ điểm vol — cùng một cú sốc tuyệt đối nghiêng phân phối mạnh hơn nhiều ở kỳ hạn gần. Chính con số gấp $3.46\times$ này là thứ Heston *không* tái tạo nổi (skew của nó tiến tới hằng số khi $T\to0$) và là lý do rough vol ra đời (6.4).

**FX** cho **smile** hai cánh khá đối xứng. Lý do trực giác: một cặp tiền như EUR/USD có thể "sập" theo *cả hai* hướng — EUR sập hay USD sập đều là biến động lớn — nên cả put lẫn call OTM đều đắt, tạo hình cái cười. Thị trường FX không quote theo strike mà theo ba con số bất biến với spot: **ATM vol** (mức), **25-delta risk reversal** $\sigma_{25c}-\sigma_{25p}$ (đo skew — độ nghiêng), và **25-delta butterfly** $\tfrac12(\sigma_{25c}+\sigma_{25p})-\sigma_{ATM}$ (đo độ cong — độ phồng của cánh). Ba con số này ánh xạ một-một với ba tham số smile, và ta sẽ thấy chúng cũng chính là ba đặc trưng mà SABR bắt được.

**Rates** cho smile của swaption, quote quanh ATM theo bp. Sau kỷ nguyên lãi suất âm (2015+), quy ước lognormal của BS gãy — vì $\ln F$ vô nghĩa khi $F<0$ — nên desk chuyển sang **normal vol** (mô hình Bachelier, $dF=\sigma_N\,dW$, cho phép $F$ âm) hoặc **shifted-lognormal** ($F+s$ với shift $s$ vài phần trăm).

Ngoài chiều strike còn chiều maturity: **term structure** của vol. Vol ngắn hạn phản ứng mạnh với sự kiện đã biết lịch — earnings, CPI release, bầu cử, họp Fed — nên đường term structure gồ ghề và thường dốc lên hoặc xuống quanh các mốc đó; vol dài hạn phẳng hơn vì trung bình hoá qua nhiều sự kiện. Skew ngắn hạn cũng **dốc hơn** skew dài hạn, xấp xỉ tỉ lệ $1/\sqrt{T}$ như con số $3.46\times$ vừa tính — trực giác: một cú sốc cố định về mặt tuyệt đối chiếm tỉ trọng lớn hơn trong một khoảng thời gian ngắn, nên nó nghiêng phân phối mạnh hơn ở kỳ hạn gần. Chính cái decay $1/\sqrt{T}$ này là điều local vol và Heston **không** tái tạo được ở đầu ngắn, và là lý do rough volatility ra đời (6.4).

**Sticky rules.** Đây là câu hỏi thực chiến bậc nhất: khi spot di chuyển, smile đi theo *kiểu gì*? Có ba quy ước. **Sticky strike** — vol gắn với từng strike đứng yên khi spot chạy; đúng với thị trường "ngủ", ít biến động. **Sticky delta** (hay sticky-moneyness) — cả smile trượt ngang theo spot, nên vol tại một *delta* cố định (hay một moneyness $K/S$ cố định) không đổi; đúng với thị trường trending. **Sticky local vol** — dynamics ngụ ý bởi mô hình local vol. Chọn sai rule làm sai **delta**: nhớ rằng delta thực tế là $\partial_S C_{BS}(S,\sigma_{\text{imp}}(S)) = \Delta_{BS} + \mathcal{V}\cdot\partial_S\sigma_{\text{imp}}$ — số hạng thứ hai là *skew delta*, và dấu của $\partial_S\sigma_{\text{imp}}$ khác nhau giữa sticky strike và sticky delta. Sai ở đây làm lệch delta hedge vài phần trăm notional — đủ để một book lớn lỗ có hệ thống. Ta sẽ thấy ở 6.3 rằng local vol ngụ ý một sticky rule *cụ thể* và thường *sai* so với quan sát, đó là gốc rễ của lỗi forward-skew.

## 6.2 Từ smile đến phân phối: Breeden-Litzenberger

Trước khi chọn bất kỳ mô hình động lực học nào, có một kết quả **model-free** tuyệt đẹp trói buộc smile với phân phối của $S_T$ — đây là viên ngọc lý thuyết của chương. Giá call châu Âu là kỳ vọng chiết khấu của payoff dưới measure risk-neutral $\mathbb{Q}$:

$$C(K,T) = e^{-rT}\,\mathbb{E}^{\mathbb{Q}}\!\left[(S_T-K)^+\right] = e^{-rT}\int_K^\infty (s-K)\,f_{\mathbb{Q}}(s)\,ds,$$

với $f_{\mathbb{Q}}$ là mật độ risk-neutral của $S_T$. Đạo hàm theo $K$ dưới dấu tích phân (chỉ cận dưới $K$ và số hạng $-K$ phụ thuộc $K$; đạo hàm cận dưới cho một số hạng biên triệt tiêu vì integrand bằng 0 tại $s=K$):

$$\frac{\partial C}{\partial K} = -e^{-rT}\int_K^\infty f_{\mathbb{Q}}(s)\,ds = -e^{-rT}\,\mathbb{Q}(S_T>K).$$

Đây đã là một hệ quả đẹp: **độ dốc của giá call theo strike cho ta hàm sống sót** (survival function). Đạo hàm lần nữa theo $K$:

$$\frac{\partial^2 C}{\partial K^2} = e^{-rT}\,f_{\mathbb{Q}}(K).$$

Gộp lại thành cặp công thức Breeden–Litzenberger (1978):

$$\mathbb{Q}(S_T > K) = -e^{rT}\frac{\partial C}{\partial K}, \qquad f_{\mathbb{Q}}(K) = e^{rT}\frac{\partial^2 C}{\partial K^2}.$$

**Đạo hàm bậc hai của giá call theo strike = mật độ risk-neutral của $S_T$.** Ba hệ quả nặng ký:

Thứ nhất, **smile ⟺ đuôi dày**. Nếu $\sigma_{\text{imp}}$ hằng số thì $f_{\mathbb{Q}}$ là lognormal thuần. Smile — đặc biệt skew equity với put wing cao — bơm mật độ vào đuôi *trái* (crash), làm phân phối lệch và dày đuôi so với lognormal. Cái skew ta thấy ở 6.1 không phải là "quirk" của giá option mà là *hình dạng thật* của phân phối mà thị trường tin.

Thứ hai, **butterfly arbitrage ⟺ mật độ âm**. Vì $f_{\mathbb{Q}}\ge0$ luôn đúng cho một phân phối thật, ta bắt buộc $\partial^2 C/\partial K^2\ge0$. Nếu surface của bạn vi phạm điều này ở đâu đó, nó ngụ ý xác suất âm — và ai đó dựng được một danh mục butterfly có giá âm nhưng payoff không âm, tức arbitrage.

Thứ ba — và đây là thứ nuôi sống nửa quyển sách còn lại — nó cho phép **định giá mọi payoff châu Âu $h(S_T)$ không cần model**:

$$V = e^{-rT}\int_0^\infty h(s)\,f_{\mathbb{Q}}(s)\,ds = e^{-rT}\int_0^\infty h(K)\,e^{rT}\frac{\partial^2 C}{\partial K^2}(K)\,dK,$$

miễn có đủ strikes để dựng $f_{\mathbb{Q}}$. Đây là nền của **variance swap replication** (6.6) và **CMS replication** (Chương 9): mọi payoff kỳ lạ nhưng phụ thuộc *một* giá terminal đều là một danh mục tĩnh vanilla.

**Đọc mật độ từ giá bằng số.** Trong thực tế ta có giá tại lưới strike rời rạc, nên dùng sai phân bậc hai:

$$f(K) \approx e^{rT}\frac{C(K-h) - 2C(K) + C(K+h)}{h^2}.$$

Tử số này *chính là* giá của một **butterfly** — mua call ở $K-h$ và $K+h$, bán 2 call ở $K$ — nên công thức nói: *mật độ risk-neutral ≈ giá butterfly chia bước bình phương*. Lấy ví dụ với $r=0$ và ba quote: $C(95)=7.20$, $C(100)=4.60$, $C(105)=2.85$, bước $h=5$:

$$f(100) \approx \frac{7.20 - 2(4.60) + 2.85}{5^2} = \frac{7.20 - 9.20 + 2.85}{25} = \frac{0.85}{25} = 0.034 \text{ / đơn vị giá}.$$

Con số $0.034$ là mật độ xác suất tại $S_T=100$: xác suất $S_T$ rơi vào dải rộng $1$ quanh $100$ là khoảng $3.4\%$. Nếu tại một strike nào đó công thức cho ra số **âm**, surface có butterfly arbitrage: butterfly ấy có giá âm (bạn *nhận* tiền khi lập), nhưng payoff của nó không bao giờ âm — tiền cho không. Kiểm tra mật độ không-âm trên lưới dày là **unit test bắt buộc** của mọi bộ dựng surface; ta sẽ thấy ở 6.5 cách kiểm nó hiệu quả hơn bằng hàm $g(k)$ của Gatheral thay vì sai phân giá thô.

## 6.3 Local volatility (Dupire 1994)

**Ý tưởng.** Giữ nguyên khung một-nhân-tố quen thuộc của BS nhưng cho vol phụ thuộc *cả* spot lẫn thời gian:

$$dS = (r-q)S\,dt + \sigma_{LV}(S,t)\,S\,dW.$$

Định lý Dupire nói điều gần như phép màu: tồn tại **duy nhất** một hàm $\sigma_{LV}(S,t)$ khiến mô hình này khớp **chính xác toàn bộ** surface vanilla quan sát được, và nó cho bởi công thức đóng:

$$\sigma_{LV}^2(K,T) = \frac{\dfrac{\partial C}{\partial T} + (r-q)K\dfrac{\partial C}{\partial K} + qC}{\dfrac{1}{2}K^2 \dfrac{\partial^2 C}{\partial K^2}}.$$

Đây là workhorse mặc định của equity exotics desk suốt 30 năm: khớp vanilla hoàn hảo *theo cấu trúc* (không cần optimize gì cả — chỉ đạo hàm surface), tạo một complete market một-nhân-tố nên hedge rõ ràng, và cắm thẳng vào PDE/MC engine. Nhưng để dùng đúng và không sợ nó, ta phải dẫn xuất — nhiều junior chỉ thuộc lòng công thức mà không biết nó từ đâu ra.

### Dẫn xuất đầy đủ công thức Dupire

Có hai đường: qua Fokker–Planck (forward Kolmogorov) cho mật độ, hoặc qua Breeden–Litzenberger. Ta đi đường thứ hai vì nó tái dùng đúng kết quả 6.2 và trong suốt hơn. Để gọn ký hiệu, đặt $r,q$ hằng số (mở rộng sang phụ thuộc $t$ chỉ thêm chữ, không thêm ý).

**Bước 1 — Ba đạo hàm của giá theo $(K,T)$ dưới ngôn ngữ mật độ.** Từ 6.2 ta đã có, với $f=f_{\mathbb{Q}}(\cdot,T)$ là mật độ của $S_T$:

$$\frac{\partial C}{\partial K} = -e^{-rT}\int_K^\infty f(s,T)\,ds, \qquad \frac{\partial^2 C}{\partial K^2} = e^{-rT}f(K,T). \tag{$\ast$}$$

Ta cần thêm $\partial C/\partial T$. Viết $C(K,T)=e^{-rT}\int_K^\infty (s-K)f(s,T)\,ds$ và đạo hàm theo $T$ (chỉ $e^{-rT}$ và $f$ phụ thuộc $T$):

$$\frac{\partial C}{\partial T} = -r\,C + e^{-rT}\int_K^\infty (s-K)\,\frac{\partial f}{\partial T}(s,T)\,ds. \tag{1}$$

Nút thắt là $\partial f/\partial T$ — và đây là chỗ động lực học của quá trình bước vào.

**Bước 2 — Fokker–Planck cho mật độ.** Với SDE $dS=(r-q)S\,dt+\sigma_{LV}(S,T)S\,dW$, mật độ chuyển tiếp $f(s,T)$ thoả phương trình forward Kolmogorov (Fokker–Planck):

$$\frac{\partial f}{\partial T} = -\frac{\partial}{\partial s}\big[(r-q)s\,f\big] + \frac{1}{2}\frac{\partial^2}{\partial s^2}\big[\sigma_{LV}^2(s,T)\,s^2\,f\big]. \tag{2}$$

Số hạng drift $-\partial_s[(r-q)sf]$ đẩy khối lượng theo forward; số hạng khuếch tán $\tfrac12\partial_{ss}[\sigma^2 s^2 f]$ trải khối lượng ra với cường độ đúng bằng vol địa phương. Đây là *forward* equation (biến chạy là điểm đến $(s,T)$), đối ngẫu với backward BS PDE của Chương 5 (biến chạy là điểm xuất phát) — chính vì Dupire là bài toán forward mà nó cho công thức đóng theo $(K,T)$.

**Bước 3 — Cắm (2) vào (1) và tích phân từng phần.** Thay $\partial f/\partial T$ trong (1):

$$\frac{\partial C}{\partial T}+rC = e^{-rT}\int_K^\infty (s-K)\left[-\partial_s\big((r-q)sf\big) + \tfrac12\partial_{ss}\big(\sigma_{LV}^2 s^2 f\big)\right]ds.$$

Xử lý hai tích phân riêng. **Tích phân drift** (tích phân từng phần một lần, dùng $\partial_s(s-K)=1$; số hạng biên tại $s=K$ triệt tiêu vì $(s-K)=0$, tại $s\to\infty$ mật độ tắt):

$$-\int_K^\infty (s-K)\,\partial_s\big((r-q)sf\big)\,ds = \int_K^\infty (r-q)s\,f\,ds = (r-q)\int_K^\infty s f\,ds.$$

Ta viết $\int_K^\infty sf\,ds = \int_K^\infty (s-K)f\,ds + K\int_K^\infty f\,ds$. Dùng $(\ast)$: $e^{-rT}\int_K^\infty(s-K)f\,ds = C$, và $e^{-rT}\int_K^\infty f\,ds = -\partial C/\partial K$. Nên (nhân lại $e^{-rT}$ tổng thể):

$$e^{-rT}\cdot(r-q)\int_K^\infty sf\,ds = (r-q)\left[C - K\frac{\partial C}{\partial K}\right].$$

**Tích phân khuếch tán** (tích phân từng phần *hai* lần; $(s-K)$ tuyến tính nên đạo hàm bậc hai của nó bằng 0, chỉ còn số hạng biên):

$$\int_K^\infty (s-K)\,\tfrac12\partial_{ss}\big(\sigma_{LV}^2 s^2 f\big)\,ds = \tfrac12\,\sigma_{LV}^2(K,T)\,K^2 f(K,T).$$

(Lần từng phần thứ nhất chuyển $\partial_{ss}$ lên thành $-\partial_s$ nhân $\partial_s(s-K)=1$; lần thứ hai cho số hạng biên $\tfrac12[\sigma^2 s^2 f]_{s=K}$; tất cả biên tại $\infty$ tắt.) Nhân $e^{-rT}$ và dùng $(\ast)$ dạng $e^{-rT}f(K,T)=\partial^2 C/\partial K^2$:

$$e^{-rT}\cdot\tfrac12\sigma_{LV}^2 K^2 f(K,T) = \tfrac12\,\sigma_{LV}^2(K,T)\,K^2\,\frac{\partial^2 C}{\partial K^2}.$$

**Bước 4 — Ghép lại.** Cộng hai mảnh vào vế phải:

$$\frac{\partial C}{\partial T}+rC = (r-q)\left[C - K\frac{\partial C}{\partial K}\right] + \tfrac12\sigma_{LV}^2 K^2\frac{\partial^2 C}{\partial K^2}.$$

Chuyển vế, gom số hạng $C$ ($rC$ bên trái, $(r-q)C$ bên phải, còn lại $qC$):

$$\frac{\partial C}{\partial T} + (r-q)K\frac{\partial C}{\partial K} + qC = \tfrac12\,\sigma_{LV}^2(K,T)\,K^2\,\frac{\partial^2 C}{\partial K^2}.$$

Giải ra $\sigma_{LV}^2$ được đúng công thức Dupire ở đầu mục. **Xong.** Điểm mấu chốt để nhớ: tử số là "vị thế calendar+drift" của giá, mẫu số là "giá gamma theo strike" (chính là mật độ nhân $K^2/2$), và cả hai chỉ dùng đạo hàm của *giá vanilla quan sát được* — nên local vol được xác định hoàn toàn bởi surface, không cần tham số ẩn.

### Dạng total-variance dùng trong implementation

Không ai đạo hàm giá call trực tiếp trong production — sai phân bậc hai của $C$ theo $K$ khuếch đại noise của quote thô đến mức vô dụng. Công thức được viết lại theo **total implied variance** $w(k,T)=\sigma_{\text{imp}}^2(k,T)\,T$ với log-moneyness $k=\ln(K/F)$ (đây là dạng `src/calibration` nên dùng):

$$\sigma_{LV}^2 = \frac{\partial_T w}{1 - \dfrac{k}{w}\partial_k w + \dfrac{1}{4}\left(-\dfrac{1}{4} - \dfrac{1}{w} + \dfrac{k^2}{w^2}\right)(\partial_k w)^2 + \dfrac{1}{2}\partial_{kk} w}.$$

Dạng này không phải một công thức khác — nó là *đúng công thức Dupire vừa dẫn*, chỉ đổi biến. Cụ thể: thay $(K,T)$ bằng $(k,w)$ với $k=\ln(K/F)$, $w=\sigma_{\text{imp}}^2 T$, rồi cắm giá BS $C=C_{BS}(F,K,\sqrt{w/T},T)$ vào ba đạo hàm $\partial_T C,\partial_K C,\partial_{KK}C$ và dùng chain rule để chuyển sang đạo hàm của $w$ theo $(k,T)$. Các số hạng $\phi(d_1),d_1,d_2$ của công thức BS gộp lại thành đúng các số hạng $k/w$, $(\partial_k w)^2$, $\partial_{kk}w$ ở mẫu; số hạng $\partial_T w$ ở tử là hình ảnh của $\partial_T C$ sau khi khử drift. Ta fit một hàm tham số trơn (SVI/SSVI, 6.5) cho $w$, khi đó mọi $\partial_T w,\partial_k w,\partial_{kk} w$ là **giải tích** — không sai phân số liệu thô — nên local vol thu được trơn tru. Công thức này còn là một máy phát hiện arbitrage lộ thiên: **mẫu số âm ⟺ butterfly arbitrage** (mật độ âm), và **$\partial_T w<0$ ⟺ calendar arbitrage** (total variance giảm theo maturity). Hai điều kiện no-arbitrage của 6.5 hiện nguyên hình ngay trong biểu thức local vol — nếu surface sạch thì $\sigma_{LV}^2>0$ khắp nơi, nếu bẩn thì Dupire "nổ" đúng chỗ bẩn.

### Ba nhược điểm phải thuộc

**Một — smile dynamics sai, và đây là lỗi đắt nhất.** Local vol khớp mọi vanilla *hôm nay* hoàn hảo, nhưng nó ngụ ý một *dynamics* cho smile khi thời gian trôi và spot chạy, và dynamics đó thường *ngược* với quan sát. Cụ thể: dưới local vol, khi spot giảm, smile có xu hướng dịch chuyển làm **forward skew phẳng đi** quá nhanh so với thực tế (trong đó skew khá bền). Hệ quả là mọi sản phẩm nhạy với *forward* skew — **cliquet**, **autocallable**, các option trên option — bị định giá sai một cách *hệ thống* (không phải nhiễu, mà lệch một chiều). Đây là lý do sâu xa desk equity exotics chuyển sang LSV: giữ local-vol để khớp vanilla nhưng ghép stochastic-vol để sửa forward-skew dynamics.

**Hai — vol tương lai là hàm tất định của spot.** $\sigma_{LV}(S,t)$ nói: biết $S$ và $t$ là biết chính xác vol tức thời. Thực tế vol có *nhiễu riêng* độc lập với spot — hai ngày cùng mức spot có thể có vol rất khác. Local vol không có kênh để hedge cái nhiễu ấy (không có vega thật, không có volga).

**Ba — cực nhạy noise.** Như đã nói, $\sigma_{LV}$ đòi đạo hàm bậc hai của surface. Industry vì thế *không bao giờ* lấy Dupire từ giá thô: luôn fit surface tham số trơn (SVI/SSVI) trước, rồi mới đạo hàm giải tích. Bỏ qua bước này là công thức đầu tiên nứt.

## 6.4 Stochastic volatility: Heston và SABR

Điểm yếu "vol không có đời sống riêng" của local vol dẫn thẳng tới stochastic volatility (SV): cho chính $\sigma$ (hay $v=\sigma^2$) là một quá trình ngẫu nhiên với Brownian riêng, tương quan với spot.

### Heston (1993)

Mô hình SV chuẩn mực của equity, sống dai vì có nghiệm **bán đóng** (semi-closed) cho vanilla:

$$dS = rS\,dt + \sqrt{v}\,S\,dW^1, \qquad dv = \kappa(\bar{v} - v)\,dt + \xi\sqrt{v}\,dW^2, \qquad dW^1 dW^2 = \rho\,dt.$$

Variance $v$ chạy theo một quá trình CIR (Cox–Ingersoll–Ross) mean-reverting: kéo về mức dài hạn $\bar v$ với tốc độ $\kappa$, biên độ dao động điều khiển bởi vol-of-vol $\xi$. Năm tham số và vai trò của chúng với smile — thuộc lòng bảng này là hiểu Heston:

| Tham số | Tên | Điều khiển đặc trưng smile |
|---|---|---|
| $v_0$ | variance ban đầu | mức vol ngắn hạn (ATM đầu ngắn) |
| $\bar v$ | variance dài hạn | mức vol dài hạn (ATM đuôi dài) |
| $\kappa$ | tốc độ hồi quy | term structure — nhanh hồi thì vol tụ về $\bar v$ sớm |
| $\xi$ | vol-of-vol | **độ cong** smile (butterfly) — $\xi$ lớn, smile phồng |
| $\rho$ | tương quan spot-vol | **độ nghiêng** skew — equity $\rho<0$ nghiêng trái |

**Đọc năm tham số bằng số — và cố tình đạp phải một pitfall.** Lấy bộ $v_0=0.04$, $\bar v=0.04$, $\kappa=1.5$, $\xi=0.4$, $\rho=-0.7$ và đọc từng con số:

- Vol ATM tức thời (đầu ngắn) là $\sqrt{v_0}=\sqrt{0.04}=0.20=20\%$ — khớp đúng running example của sách. Vì $\bar v=v_0$, term structure của ATM vol gần như phẳng ($20\%$ suốt), một surface "yên" điển hình.
- Tốc độ hồi quy $\kappa=1.5$ cho *thời gian bán rã* $\ln 2/\kappa\approx0.46$ năm — cú sốc lên variance tan một nửa sau ~5.5 tháng; đó là điều khiển term structure.
- $\rho=-0.7$ **chính là** con số leverage effect $-0.7$ đã nêu ở 6.1: nó nghiêng smile về trái (put wing cao), nối thẳng tham số mô hình với sự thật thực nghiệm.
- $\xi=0.4$ là vol-of-vol — nó thổi phồng smile (butterfly).

Bây giờ **kiểm điều kiện Feller** $2\kappa\bar v>\xi^2$, thứ giữ cho $v$ không chạm 0: $2\kappa\bar v = 2(1.5)(0.04)=0.12$ so với $\xi^2=0.4^2=0.16$. Vì $0.12<0.16$, bộ này **vi phạm** Feller — và đó là chuyện *bình thường* trong calibration thực tế, không phải lỗi. Khi cần $\xi$ lớn để khớp độ cong smile equity, Feller thường bị phá. Hệ quả thực chiến: variance có thể chạm 0 chốc lát, nên scheme mô phỏng ngây thơ Euler sẽ cho $v<0$ và làm nổ $\sqrt{v}$; desk dùng scheme QE của Andersen hoặc full-truncation Euler để mô phỏng CIR an toàn khi Feller hỏng. Nhớ con số này: $0.12<0.16$ là ví dụ mẫu về việc *một mô hình fit tốt vẫn có thể vi phạm điều kiện lý thuyết đẹp*, và nghề quant là biết xử lý cái vi phạm ấy chứ không phải né nó.

Heston **không khớp chính xác** mọi vanilla — 5 tham số không thể fit hàng trăm quote, và nó đặc biệt yếu ở **skew ngắn hạn** (cái decay $1/\sqrt{T}$ mà không mô hình Markov-diffusion nào bắt được). Đổi lại nó cho smile *dynamics* thực tế hơn hẳn local vol: vol có đời sống riêng, có $\xi$ để hedge **volga** (vega của vega) và $\rho$ để hedge **vanna** (chéo spot–vol).

### Characteristic function của Heston — bắc cầu sang Chương 7

Vì sao Heston "định giá được" dù không có công thức kiểu Black-Scholes? Vì **characteristic function** của $\ln S_T$ có dạng đóng. Đặt $x_T=\ln S_T$, characteristic function là $\varphi_T(u)=\mathbb{E}^{\mathbb{Q}}[e^{iu x_T}]$. Với Heston nó có dạng **affine** (mũ của hàm tuyến tính theo trạng thái $x_0,v_0$):

$$\varphi_T(u) = \exp\!\Big(C(u,T) + D(u,T)\,v_0 + iu\,x_0\Big),$$

trong đó $C,D$ giải hệ Riccati (nghiệm đóng):

$$D(u,T) = \frac{\kappa - i\rho\xi u - d}{\xi^2}\cdot\frac{1-e^{-dT}}{1-g\,e^{-dT}}, \qquad C(u,T) = \frac{\kappa\bar v}{\xi^2}\left[(\kappa - i\rho\xi u - d)T - 2\ln\frac{1-g\,e^{-dT}}{1-g}\right] + iurT,$$

với

$$d = \sqrt{(\rho\xi i u - \kappa)^2 + \xi^2(iu + u^2)}, \qquad g = \frac{\kappa - i\rho\xi u - d}{\kappa - i\rho\xi u + d}.$$

Đừng sợ mật độ ký hiệu — điểm cần nắm là *tồn tại một biểu thức đóng cho $\varphi_T(u)$*, và một khi có characteristic function thì giá option lấy được bằng **một tích phân Fourier ngược duy nhất** (Carr–Madan 1999, hoặc hiện đại và nhanh hơn là **COS method** của Fang–Oosterlee dùng khai triển cosine). Trực giác: characteristic function chứa *toàn bộ* phân phối của $\ln S_T$; công thức Breeden–Litzenberger nói phân phối chứa mọi giá châu Âu; ghép hai điều đó lại là pricing bằng Fourier. Đây chính là **cầu nối sang Chương 7** — nơi ta khai triển đầy đủ Carr–Madan, COS method, và giải thích vì sao đây là công cụ chung cho *mọi* mô hình affine/Lévy (Heston, Bates jump-diffusion, VG, CGMY), không riêng Heston. Ở đây chỉ cần nhớ khẩu hiệu: *có characteristic function đóng ⟹ có pricing nhanh qua Fourier.* Trong repo, characteristic function và COS-method sống ở `src/analytics`, còn calibrate Heston (least-squares 5 tham số khớp surface) ở `src/calibration`.

### SABR (Hagan 2002)

Chuẩn *de facto* của thị trường rates (swaption smile) và FX. Mô hình forward $F$ với vol ngẫu nhiên $\alpha$:

$$dF = \alpha F^\beta\,dW^1, \qquad d\alpha = \nu\,\alpha\,dW^2, \qquad dW^1 dW^2 = \rho\,dt.$$

Giá trị thật của SABR không nằm ở SDE mà ở **công thức xấp xỉ Hagan** cho implied vol — nó cho trader calibrate smile một expiry trong micro giây và *đọc tham số bằng mắt*: $\alpha\approx$ mức ATM vol, $\rho\approx$ skew, $\nu\approx$ độ cong, và $\beta$ (thường cố định $0.5$ cho rates hoặc theo quy ước desk) $\approx$ **backbone** — cách ATM vol di chuyển khi forward đổi. Công thức Hagan tại ATM (bản rút gọn đáng nhớ; bản đầy đủ cho mọi strike dài nửa trang, tra Hagan 2002):

$$\sigma_{ATM} \approx \frac{\alpha}{F^{1-\beta}}\left[1 + \left(\frac{(1-\beta)^2}{24}\frac{\alpha^2}{F^{2-2\beta}} + \frac{\rho\beta\nu\alpha}{4F^{1-\beta}} + \frac{2-3\rho^2}{24}\nu^2\right)T\right].$$

**Cắm số vào Hagan.** Lấy một swaption rates điển hình: forward $F=3\%=0.03$, backbone $\beta=0.5$, và bộ tham số calibrate $\alpha=0.015$, $\rho=-0.3$, $\nu=0.4$, kỳ hạn $T=1$. Tính từng mảnh:

- **Backbone** $\dfrac{\alpha}{F^{1-\beta}} = \dfrac{0.015}{0.03^{0.5}} = \dfrac{0.015}{0.1732} = 0.0866 = 8.66\%$ — đây là ATM vol "trần trụi", con số chi phối.
- Số hạng $(1-\beta)$: $\dfrac{(1-\beta)^2}{24}\dfrac{\alpha^2}{F^{2-2\beta}} = \dfrac{0.25}{24}\cdot\dfrac{0.015^2}{0.03} = 0.0104\times0.0075 = 7.8\times10^{-5}$ — bé tí.
- Số hạng $\rho$-skew: $\dfrac{\rho\beta\nu\alpha}{4F^{1-\beta}} = \dfrac{(-0.3)(0.5)(0.4)(0.015)}{4(0.1732)} = \dfrac{-9\times10^{-4}}{0.693} = -1.30\times10^{-3}$ — âm vì $\rho<0$.
- Số hạng vol-of-vol: $\dfrac{2-3\rho^2}{24}\nu^2 = \dfrac{2-0.27}{24}(0.16) = 0.0721\times0.16 = 1.153\times10^{-2}$ — mảnh lớn nhất trong ngoặc, đến từ $\nu$.

Cộng trong ngoặc: $(7.8\times10^{-5}-1.30\times10^{-3}+1.153\times10^{-2})\times T \approx 0.0103$. Nên hệ số hiệu chỉnh là $1.0103$, và

$$\sigma_{ATM} \approx 0.0866\times1.0103 = 0.0875 = 8.75\%.$$

Đọc ý nghĩa: ATM vol lognormal $\approx8.75\%$ (với $F=3\%$ tương đương normal vol $\approx0.0875\times0.03\approx26\,\text{bp}$, đúng cỡ swaption thật). Backbone $8.66\%$ đóng góp gần hết; correction $+1.03\%$ tương đối đến chủ yếu từ vol-of-vol $\nu=0.4$, còn $\rho=-0.3$ kéo nhẹ xuống. Đó là *cảm giác con số* mà trader có trong đầu khi nhìn bốn tham số SABR.

Đọc công thức về mặt định tính: số hạng đầu $\alpha/F^{1-\beta}$ là **backbone** — với $\beta=1$ (lognormal) thì $F^{1-\beta}=F^0=1$ nên ATM vol không phụ thuộc $F$: khi forward chạy, ATM vol đứng yên, đó chính là hành vi **lognormal / sticky-lognormal backbone**. Ánh xạ nó sang mạch sticky-rules của 6.1: backbone $\beta=1$ cho ATM vol *bất biến theo mức forward*, tương đương smile trượt theo forward mà giữ hình dạng theo log-moneyness — nói cách khác nó là hiện thân SABR của **sticky-(log)moneyness**, họ hàng gần của sticky-delta; ở đầu kia $\beta=0$ (normal) thì chính *normal vol* mới bất biến khi $F$ đổi. Ba số hạng hiệu chỉnh nhân $T$ cho thấy smile SABR **phồng dần theo maturity** với tốc độ do $\nu$ (vol-of-vol) và $\rho$ điều khiển — đúng như ví dụ số vừa thấy ($\nu$ chiếm phần lớn correction). Quy trình desk mỗi sáng: cố định $\beta$, với mỗi expiry giải $(\alpha,\rho,\nu)$ khớp 3+ quote (ATM, RR, BF hoặc một dải strikes) — ba tham số ứng ba đặc trưng smile (mức, nghiêng, cong), nghiệm gần như duy nhất và **đọc được bằng mắt**. Đó là lý do SABR sống 20+ năm dù có model "đúng" hơn.

Sau 2015 (rates âm), industry dùng **shifted SABR** ($F\to F+s$) hoặc **normal SABR**. Một cạm bẫy có thật: xấp xỉ Hagan **hỏng ở strike thấp / maturity dài** — nó cho mật độ âm ở đuôi (một dạng butterfly arbitrage ngay trong công thức được yêu quý). Bản vá là việc thật của rates quant: hiệu chỉnh Obłój, hoặc **arbitrage-free SABR** của Hagan (2014) giải một PDE 1D cho mật độ thay vì dùng xấp xỉ. SABR sống ở `src/models` nhánh fx/rates.

### Local-Stochastic Vol (LSV) — chuẩn hiện tại của FX/equity exotics

Ta đã thấy hai nửa của một sự thật: local vol khớp vanilla hoàn hảo nhưng dynamics sai; stochastic vol có dynamics đúng nhưng không khớp vanilla chính xác. **LSV** lấy cả hai: nhân một hàm "leverage" $L(S,t)$ vào thành phần SV,

$$dS = rS\,dt + L(S,t)\sqrt{v}\,S\,dW^1,$$

rồi calibrate $L$ sao cho khớp *chính xác* toàn bộ vanilla trong khi thành phần SV ($v$, $\rho$, vol-of-vol) giữ dynamics thật. Kết quả kinh điển (Gyöngy): $L^2(S,t)=\sigma_{LV}^2(S,t)/\mathbb{E}[v_t\mid S_t=S]$ — leverage bằng local-vol-Dupire chia cho variance kỳ vọng có điều kiện.

**Đọc công thức Gyöngy bằng số.** Lấy $\sigma_{LV}(S,t)$ tại một điểm $=20\%$, tức $\sigma_{LV}^2=0.04$, và giả sử tại đó variance kỳ vọng có điều kiện $\mathbb{E}[v_t\mid S_t=S]=0.04$ (đúng bằng $v_0$ của Heston ở trên). Khi ấy $L^2=0.04/0.04=1$, nên $L=1$: leverage *tắt*, và mô hình LSV **thoái về pure stochastic vol** ở điểm đó. Trường hợp ngược lại: nếu tại một strike/thời điểm nào đó SV không tạo đủ vol (giả sử $\mathbb{E}[v\mid S]=0.01$, tức $10\%$) trong khi Dupire đòi $20\%$ ($\sigma_{LV}^2=0.04$), thì $L^2=0.04/0.01=4$, $L=2$: leverage phải *khuếch đại gấp đôi* để bù, kéo mô hình về đúng vanilla. Con số $L=1$ chính là *ranh giới*: $L>1$ nghĩa SV thiếu vol phải bù lên, $L<1$ nghĩa SV thừa vol phải kéo xuống — trực giác này là toàn bộ tinh thần của particle method. Cái kỳ vọng có điều kiện $\mathbb{E}[v\mid S]$ khiến bài toán **McKean–Vlasov** (mật độ phụ thuộc chính lời giải), giải bằng **particle method** (mô phỏng một đám đông "hạt" và ước lượng $\mathbb{E}[v\mid S]$ bằng kernel regression trên chính đám đông ấy tại mỗi bước) — đắt về engineering, đúng loại việc FO quant làm hằng ngày ở FX/equity structured desk. Trong repo ứng với nhánh `slv` của models.

### Rough volatility — Hurst $\approx 0.1$

Cả Heston, SABR, LSV đều dựa trên Brownian motion cho vol, ngụ ý đường vol "mịn" theo nghĩa Hölder-$\tfrac12$. Gatheral–Jaisson–Rosenbaum (2014) đo **realized vol** thực tế và phát hiện nó *gồ ghề hơn Brownian nhiều*: log-vol hành xử như một **fractional Brownian motion** với **Hurst exponent $H\approx0.1$** thay vì $H=0.5$. Trực giác của $H$: đó là số đo "trí nhớ và độ nhám" của đường đi. $H=0.5$ là Brownian chuẩn, các gia số độc lập; $H>0.5$ là quá trình *bền* (trend, gia số tương quan dương); $H<0.5$ là *anti-persistent*, gia số tương quan âm, đường đi giật cục, đảo chiều liên tục. Với $H\approx0.1\ll0.5$, đường vol cực kỳ nhám — biến động của vol ở scale nhỏ lớn hơn nhiều so với những gì Brownian tiên đoán.

Vì sao điều này quan trọng về mặt pricing? Vì độ nhám $H$ nhỏ tạo ra **skew ngắn hạn dốc** đúng với thị trường: dưới rough vol, ATM skew phân kỳ như $T^{H-1/2}=T^{-0.4}$ khi $T\to0$ — gần với $1/\sqrt{T}$ quan sát được ở 6.1, thứ mà Heston (skew tiến tới hằng số khi $T\to0$) *không* tái tạo nổi.

**Số hoá độ dốc rough.** So sánh skew ở $T=1$ tuần với $T=1$ năm theo $T^{-0.4}$. Tỉ số là $(T_{1w}/T_{1y})^{-0.4}=(7/365)^{-0.4}=(0.0192)^{-0.4}\approx4.86$: skew 1 tuần dốc gấp gần **5 lần** skew 1 năm. Đối chiếu với luật $1/\sqrt{T}$ (tức số mũ $-0.5$) ở cùng hai kỳ hạn thì tỉ số là $(0.0192)^{-0.5}\approx7.22$, gấp hơn **7 lần**. Cả hai đều bùng lên mạnh ở đầu ngắn — đúng cái mà thị trường quote và đúng cái Heston *không* làm được ($T^0$, tức tỉ số $=1$, skew phẳng theo maturity ở đầu ngắn). Con số $4.86\times$ so với $7.22\times$ cũng cho thấy $H\approx0.1$ tạo độ dốc hơi *nhẹ* hơn $1/\sqrt{T}$ thuần, và calibrate $H$ chính là tinh chỉnh con số này cho khớp. **Rough Bergomi** — mô hình forward-variance dùng fBm — fit toàn bộ term structure của skew, gồm cả đầu ngắn hóc búa, với *ít* tham số hơn hẳn Heston. Nó đã bắt đầu vào production ở vài shop cho VIX và short-dated options, nhưng chưa lật đổ Heston/LSV làm workhorse vì fBm **không Markov** (không có trạng thái hữu hạn để "reset"), nên MC đắt và không có PDE tiêu chuẩn. Rough vol trong repo ứng nhánh `rough-bergomi`.

### Cột sống chọn mô hình theo asset/sản phẩm

Gộp lại thành một bản đồ desk-quant dùng thật:

| Asset / sản phẩm | Mô hình workhorse | Vì sao |
|---|---|---|
| Equity vanilla + surface | SVI/SSVI + Dupire | khớp vanilla chính xác, xuất local vol cho exotics |
| Equity exotics (autocall, cliquet) | LSV (local + Heston-type) | cần forward-skew dynamics đúng |
| Rates swaption smile | SABR (shifted/normal) | 3 tham số đọc bằng mắt, calibrate/expiry tức thì |
| FX vanilla + barrier | SABR / LSV | quote RR-BF hợp SABR; barrier cần LSV khớp vanilla |
| VIX, short-dated | rough Bergomi (đang lên) | bắt skew đầu ngắn $\sim T^{-0.4}$ |
| Bất kỳ mô hình affine/Lévy | Fourier (Ch7) | có characteristic function ⟹ pricing nhanh |

## 6.5 Dựng vol surface trong thực tế — SVI và các ràng buộc

Đây là bài toán *hằng ngày* của equity quant, và nó thuần industry: từ vài chục quote rời rạc — bid/ask lệch nhau, thanh khoản không đều, vài strike chẳng có giao dịch — dựng ra một surface $\sigma(K,T)$ **trơn**, **không arbitrage**, và **extrapolate** được ra ngoài vùng có quote. Chuẩn công nghiệp là **SVI** (Stochastic Volatility Inspired — Gatheral, phát triển tại Merrill Lynch), parametrize **total variance** $w=\sigma_{\text{imp}}^2 T$ theo log-moneyness $k=\ln(K/F)$ bằng một hyperbola năm tham số cho mỗi expiry:

$$w(k) = a + b\left[ \rho(k - m) + \sqrt{(k-m)^2 + \sigma_{svi}^2} \right].$$

Năm tham số mang ý nghĩa hình học sạch: $a$ dịch toàn bộ mức variance lên/xuống; $b$ mở góc giữa hai cánh (độ dốc chung); $\rho\in(-1,1)$ nghiêng hyperbola (âm ⟹ cánh trái cao, đúng skew equity); $m$ dịch đỉnh smile ngang; $\sigma_{svi}$ bo tròn đáy (nhỏ ⟹ nhọn, lớn ⟹ phẳng). Khi $|k|\to\infty$, căn thức $\to|k-m|$ nên hai cánh **tiệm cận tuyến tính** theo $|k|$: cánh phải dốc $b(1+\rho)$, cánh trái dốc $b(1-\rho)$. Điều này khớp *chính xác* chặn Roger Lee — $w(k)\le2|k|$ khi $|k|\to\infty$ để không có arbitrage đuôi — nếu ta giữ $b(1\pm\rho)\le2$. SVI không phải công thức bịa đẹp; nó là dạng tiệm cận *đúng* của total variance.

**SVI bằng số.** Lấy bộ tham số $a=0.01$, $b=0.10$, $\rho=-0.6$, $m=0$, $\sigma_{svi}=0.15$, expiry $T=1$, và đọc ba điểm:

- **ATM** ($k=0$): $w = 0.01 + 0.10\big(0 + \sqrt{0+0.15^2}\big) = 0.01 + 0.10(0.15) = 0.025$, nên $\sigma_{\text{imp}}=\sqrt{0.025}=15.8\%$.
- **Put 10% OTM** ($k=\ln0.90\approx-0.105$): $w = 0.01 + 0.10\big[(-0.6)(-0.105) + \sqrt{0.105^2 + 0.15^2}\big] = 0.01 + 0.10[0.063 + 0.183] = 0.01 + 0.0246 = 0.0346$, nên $\sigma=\sqrt{0.0346}=18.6\%$.
- **Call 10% OTM** ($k=\ln1.10\approx+0.095$): $w = 0.01 + 0.10\big[(-0.6)(0.095) + \sqrt{0.095^2 + 0.15^2}\big] = 0.01 + 0.10[-0.057 + 0.1776] = 0.01 + 0.0121 = 0.0221$, nên $\sigma=\sqrt{0.0221}=14.9\%$.

Skew hiện ra đúng kiểu equity: **put wing 18.6% > ATM 15.8% > call wing 14.9%**, do $\rho<0$ nghiêng hyperbola về trái. Chú ý ba con số này *là* bộ running example của cả sách (Chương 5 và các chương exotics trỏ về đây): ATM 1Y ~ mid-teens, put OTM cao hơn call OTM vài điểm — dấu vân tay của một index equity thật, và đúng bộ số ta đã dùng để số hoá skew ở 6.1.

Sau khi fit, phải **kiểm no-arbitrage**, và Gatheral cho một cách kiểm butterfly thanh lịch hơn sai phân giá thô của 6.2: hàm

$$g(k) = \left(1 - \frac{k\,w'(k)}{2w(k)}\right)^2 - \frac{w'(k)^2}{4}\left(\frac{1}{w(k)} + \frac{1}{4}\right) + \frac{w''(k)}{2},$$

trong đó điều kiện **butterfly no-arbitrage ⟺ $g(k)\ge0$ mọi $k$**. Vì $w,w',w''$ của SVI đều giải tích, ta quét $g$ trên lưới dày trong micro giây — nhanh và chính xác hơn nhiều so với đạo hàm bậc hai của giá quote. Đây chính là "unit test bắt buộc" của 6.2 nhưng phiên bản production. Ràng buộc còn lại là **calendar**: total variance không được *giảm* theo $T$ tại moneyness cố định ($\partial_T w\ge0$) — nếu vi phạm, tồn tại calendar spread giá âm payoff không âm.

**SSVI** (surface SVI) nâng SVI một expiry lên cả mặt phẳng: parametrize $w(k,T)=\tfrac{\theta_T}{2}\big(1+\rho\varphi(\theta_T)k+\sqrt{(\varphi(\theta_T)k+\rho)^2+1-\rho^2}\big)$ với $\theta_T$ là ATM total variance theo $T$ và $\varphi$ một hàm giảm; Gatheral–Jacquier chứng minh **điều kiện đủ no-arbitrage** đóng trên cả hai chiều strike-maturity. SSVI là lớp fit ưa dùng *trước* khi lấy Dupire, vì nó bảo đảm surface sạch nên $\sigma_{LV}^2>0$ khắp nơi.

Pipeline điển hình trong production, đọc như một dây chuyền: clean quote (lọc bid/ask lệch, bỏ quote lỗi) → fit SVI/SSVI từng expiry với penalty phạt arbitrage → kiểm chéo $g(k)\ge0$ và calendar → xuất surface cho pricing vanilla, xuất **Dupire local vol** cho exotics, và tính Greeks bằng cách bump surface theo các **mode** của nó (parallel shift, skew twist, term-structure tilt) thay vì bump từng điểm. Trong `quantc`, tầng này tương ứng `src/marketdata` (quotes, svi, ssvi, dupire) cộng `src/calibration`.

## 6.6 Variance swap, VIX, và vol như một asset class

Cho tới đây vol là một *tham số* để định giá option. Mục này lật ngược: vol tự nó là một **asset class** giao dịch trực tiếp, và Breeden–Litzenberger cho phép định giá nó *model-free*.

**Variance swap** có payoff $N_{var}\big(\sigma_{\text{realized}}^2 - K_{var}\big)$ — một cược vào *variance thực hiện* trong đời hợp đồng so với strike $K_{var}$ chốt lúc ký, notional tính theo variance. Vì sao dân trading thích nó hơn delta-hedged option: một option delta-hedged cho P&L phụ thuộc *đường đi* qua profile gamma (gamma lớn quanh ATM, nhỏ ở đuôi), nên nó là cược vol *có trọng số theo spot* — bẩn. Variance swap cho P&L tỉ lệ *thuần* với variance thực hiện, không phụ thuộc spot ở đâu — một cược vol *sạch*.

Kết quả replication kinh điển (model-free, chỉ cần giả định giá liên tục — không jump): variance swap = một danh mục **static** các OTM options mọi strike, cộng một delta hedge động. Strike công bằng:

$$K_{var} = \frac{2e^{rT}}{T}\left[ \int_0^F \frac{P(K)}{K^2}\,dK + \int_F^\infty \frac{C(K)}{K^2}\,dK \right].$$

**Trọng số $1/K^2$** là trái tim của kết quả và đáng dẫn xuất trực giác. Variance thực hiện của log-return là $\int_0^T \sigma_t^2\,dt$. Áp Itô cho $\ln S_t$: $d\ln S = (r-\tfrac12\sigma^2)dt+\sigma dW$, nên $\tfrac12\int\sigma^2 dt = \int \tfrac{dS}{S} - (\ln S_T-\ln S_0) + \ldots$ — variance bằng "return số học trừ return log". Số hạng $\int dS/S$ là một chiến lược *delta* (giữ $1/S$ cổ phiếu — chính là delta hedge động), còn $-\ln(S_T/S_0)$ là một payoff *log-contract* tĩnh. Bước cuối: một log-payoff $-\ln(S_T/K_0)$ tái tạo được bằng danh mục vanilla với **mật độ trọng số $1/K^2$** (vì $\partial^2_{KK}[-\ln K]=1/K^2$ — đúng công thức Breeden–Litzenberger áp cho payoff $h=\ln$). Ghép lại: variance swap = log-contract (danh mục $1/K^2$ options) + delta hedge. Trọng số $1/K^2$ nói *mua nhiều option đuôi sâu hơn* — đó là lý do variance swap nhạy tail và một cú jump lớn (vi phạm giả định "liên tục") làm replication lệch, sinh ra spread giữa var swap và gamma swap.

**Tính $K_{var}$ và VIX bằng số.** Làm một ví dụ thô nhưng đủ để thấy máy chạy. Đặt $r=0$, forward $F=100$, kỳ hạn VIX chuẩn $T=30/365=0.0822$ năm. Ta có một dải strikes bước $\Delta K=5$ với giá OTM (put cho $K<100$, call cho $K>100$, đơn vị điểm chỉ số):

| $K$ | loại | giá | trọng số $1/K^2$ | đóng góp $\frac{\text{giá}}{K^2}\Delta K$ |
|---|---|---|---|---|
| 85 | put | 0.15 | $1.38\times10^{-4}$ | $1.04\times10^{-4}$ |
| 90 | put | 0.40 | $1.23\times10^{-4}$ | $2.47\times10^{-4}$ |
| 95 | put | 1.00 | $1.11\times10^{-4}$ | $5.54\times10^{-4}$ |
| 100 | ATM | 1.55 | $1.00\times10^{-4}$ | $7.75\times10^{-4}$ |
| 105 | call | 0.75 | $9.07\times10^{-5}$ | $3.40\times10^{-4}$ |
| 110 | call | 0.25 | $8.26\times10^{-5}$ | $1.03\times10^{-4}$ |
| 115 | call | 0.08 | $7.56\times10^{-5}$ | $0.30\times10^{-4}$ |

Cộng cột cuối được xấp xỉ tích phân $\int P/K^2 + \int C/K^2 \approx 2.15\times10^{-3}$. Nhân hệ số:

$$K_{var} = \frac{2e^{0}}{0.0822}\times2.15\times10^{-3} = 24.33\times2.15\times10^{-3} = 0.0524.$$

Đây là variance công bằng (đơn vị variance/năm). Quy về VIX:

$$\text{VIX} = 100\sqrt{K_{var}} = 100\sqrt{0.0524} = 100\times0.229 = 22.9.$$

Vậy chỉ số VIX $\approx22.9$ — đúng cỡ một thị trường hơi căng thẳng nhưng chưa hoảng loạn (VIX "bình thường" ~15–20, khủng hoảng >40). Chú ý cách trọng số $1/K^2$ *hạ thấp* đóng góp của các strike xa: put 85 (giá 0.15) đóng góp $1.04\times10^{-4}$ trong khi nếu không có trọng số nó sẽ còn bé hơn nữa — trọng số $1/K^2$ thực ra *nhấc* đóng góp của các strike thấp lên tương đối để log-contract được replicate đúng, nên VIX rất nhạy với việc put đuôi trái có đắt lên hay không. Đó chính xác là cơ chế "VIX tăng vì nhà đầu tư sợ".

**VIX chính là công thức này** áp cho SPX options 30 ngày, rồi quy về vol %/năm ($\text{VIX}=100\sqrt{K_{var}}$ với $T=30/365$). Nên hiểu VIX = *giá của một danh mục options có trọng số $1/K^2$*, không phải "chỉ số sợ hãi" huyền bí. Khi báo chí nói "VIX tăng vì nhà đầu tư sợ", cái đang xảy ra là put OTM đắt lên (đuôi trái dày lên — đúng câu chuyện crash risk của 6.1), và tích phân $1/K^2$ nhấc lên theo — nếu trong bảng trên giá put 85 nhảy từ $0.15$ lên $0.60$, riêng nó thêm $\sim3\times10^{-4}$ vào tích phân, đẩy $K_{var}$ và do đó VIX lên vài điểm. Hệ sinh thái phía sau đồ sộ: **VIX futures** (cược vào VIX tương lai — chú ý VIX futures *không* replicate được từ VIX spot vì căn bậc hai không tuyến tính), **VIX options**, **variance/vol swaps**, **corridor variance** (chỉ tính variance khi spot trong một dải).

Một điểm tinh tế đóng chương và mở sang P-world: variance swap replicate được model-free, nhưng **volatility swap** (payoff theo $\sigma_{\text{realized}}$, *không* bình phương) thì **không** — vì căn bậc hai không phải payoff tuyến tính theo variance, nên không có danh mục vanilla tĩnh nào tái tạo nó chính xác; định giá vol swap cần một mô hình cho *phân phối* của realized variance (convexity adjustment, thường tính qua Heston/rough). Cụ thể, do Jensen với hàm lõm $\sqrt{\cdot}$ ta luôn có $\mathbb{E}[\sqrt{\text{var}}]\le\sqrt{\mathbb{E}[\text{var}]}=\sqrt{K_{var}}$, nên fair vol strike *nhỏ hơn* $\sqrt{K_{var}}$ một lượng convexity adjustment; ví dụ nếu $K_{var}=0.0524$ (VIX-scale $22.9\%$) và độ phân tán của realized variance tạo adjustment $\sim1$ điểm vol, thì vol swap strike $\approx21.9\%$ chứ không phải $22.9\%$ — và chính con số $1$ điểm ấy là thứ cần mô hình để định lượng. Đây là ranh giới đẹp giữa cái model-free và cái cần-model.

Và đây là nơi Q gặp P. **Pricing** variance swap là bài toán Q thuần — replication, no-arbitrage, characteristic function. Nhưng quyết định **long hay short** vol là view P thuần: liệu realized sẽ vượt implied không? Cái chênh lệch dai dẳng "implied > realized" trung bình — **variance risk premium** — là một trong những premium bền nhất thị trường tài chính, và là bánh mì bơ của các quỹ "vol trading" (xem cuốn P-world). Desk vol trading sống đúng ở giao điểm ấy: dùng máy Q để định giá và hedge, dùng đầu P để đặt cược. Chương này cho bạn nửa Q của câu chuyện; nửa còn lại chờ ở cuốn chị em.

# Chương 7: Fourier và transform pricing

Chương 5 cho ta công thức Black-Scholes vì payoff call gặp đúng một phân phối lognormal — tích phân $\mathbb{E}^{\mathbb{Q}}[(S_T-K)^+]$ ra được nghiệm đóng, gọn gàng đến mức ta đọc được ý nghĩa từng số hạng. Chương 6 phá vỡ chính giả định đó: smile thực nghiệm buộc ta rời lognormal sang Heston, Merton jump, Variance Gamma, rough vol. Vấn đề nảy sinh ngay lập tức, và nó nghiêm trọng hơn vẻ ngoài: **hầu hết các model hiện đại KHÔNG có công thức giá đóng cho vanilla**. Ta biết chúng động thế nào — viết được SDE, mô phỏng được path — nhưng khi cần định giá một call châu Âu, thao tác cơ bản nhất và chạy hàng triệu lần mỗi ngày bên trong vòng calibration, thì tích phân payoff không còn ra dạng $N(\cdot)$ nữa. Nếu mỗi lần định giá phải mô phỏng Monte Carlo thì calibrate một surface đã chết ngay từ vòng lặp đầu.

Có một sự thật cứu vãn, và nó là linh hồn của chương này: **những model đó tuy không có giá đóng, nhưng lại có characteristic function đóng.** Heston có CF viết được trên một dòng; Merton, VG, CGMY, NIG cũng vậy; cả lớp affine jump-diffusion (Duffie–Pan–Singleton) sinh ra như một cỗ máy đúc CF hàng loạt. Fourier pricing là nghệ thuật đổi vấn đề "tôi không tính được tích phân payoff dưới density" thành "tôi tính tích phân payoff dưới CF" — và tích phân thứ hai thì luôn làm được bằng số, nhanh, chính xác đến machine precision. Đây là lý do một desk equity/rates exotic không thể sống thiếu tầng `src/analytics` với hai file `characteristic` và `cos-method`: chúng là backbone của mọi vòng calibrate Heston, chạy ngầm sau mỗi lần thị trường nhích một tick.

Chương đi theo mạch tự nhiên, mỗi bước sửa một nhược điểm của bước trước. Trước hết ta nối characteristic function với risk-neutral density và với xác suất — công thức đảo ngược Gil-Pelaez, đủ để định giá nhưng chậm và có singularity. Rồi ta tăng tốc theo hai hướng lịch sử: Carr-Madan FFT (thêm damping factor để tích phân hội tụ, rồi FFT hóa để trả giá cả một lưới strike cùng lúc) và Lewis fundamental transform (viết giá option thành một tích phân contour gọn, không singularity, phơi bày cấu trúc payoff × model). Cuối cùng là **COS method** của Fang–Oosterlee (2008) — Fourier-cosine expansion — thứ đã thay thế FFT ở gần như mọi desk vì nó cần rất ít điểm, hội tụ mũ, và ổn định lạ thường trong vòng lặp calibration. Xuyên suốt, ta chạy đúng một ví dụ số làm mỏ neo: call BS chuẩn $S_0=K=100,\,r=5\%,\,\sigma=20\%,\,T=1$ với đáp số biết trước $C=10.45$ (đã gặp ở Chương 5) — và cho thấy MỌI phương pháp đều tái tạo lại đúng con số này, để bạn tin cỗ máy trên một ca có nghiệm đóng trước khi thả nó vào một model không có nghiệm đóng.

## 7.1 Characteristic function: cầu nối giữa dynamics và density

Câu hỏi vì sao mục này tồn tại: ta cần một vật mang **toàn bộ thông tin của phân phối $S_T$** mà lại dễ tính hơn chính density. Với hầu hết model, viết ra pdf của $S_T$ là bất khả (Heston: pdf không có dạng đóng, chỉ tồn tại như nghiệm của một PDE), nhưng viết ra CF thì được, và thường trên một dòng. CF chính là vật mang thông tin đó — cùng nội dung như density, nhưng ở một "hệ tọa độ" mà các model production tình cờ sống rất thoải mái.

Đặt $X_T = \ln(S_T/S_0)$ là log-return. **Characteristic function** của $X_T$ dưới measure $\mathbb{Q}$ là kỳ vọng của một sóng phức:

$$\varphi(u) = \mathbb{E}^{\mathbb{Q}}\!\left[e^{iuX_T}\right] = \int_{-\infty}^{\infty} e^{iux} f(x)\,dx.$$

Đây đúng là **biến đổi Fourier của density** $f$ (sai khác dấu quy ước). Vì Fourier khả nghịch, CF chứa chính xác cùng lượng thông tin như density — không mất một bit nào. Cái được là món quà: CF thường có dạng $e^{(\text{hàm của }u)}$ đóng ngay cả khi $f$ thì không viết ra được.

**Ví dụ nền — CF của Black-Scholes.** Dưới $\mathbb{Q}$, $\ln S_T = \ln S_0 + (r-\tfrac{\sigma^2}{2})T + \sigma\sqrt{T}\,Z$ với $Z\sim\mathcal N(0,1)$, nên $X_T$ là Gaussian với mean $m=(r-\tfrac{\sigma^2}{2})T$ và variance $s^2=\sigma^2 T$. CF của một Gaussian là kết quả kinh điển ta dẫn ngay từ đầu để không nhảy cóc: với $X\sim\mathcal N(m,s^2)$,

$$\mathbb{E}[e^{iuX}] = \int e^{iux}\frac{1}{s\sqrt{2\pi}}e^{-(x-m)^2/(2s^2)}dx.$$

Ghép mũ và hoàn thành bình phương. Số mũ tổng là $iux-\frac{(x-m)^2}{2s^2}$; nhóm lại quanh $x$:

$$iux-\frac{(x-m)^2}{2s^2}=-\frac{1}{2s^2}\big(x-(m+ius^2)\big)^2 + ium - \tfrac12 u^2 s^2.$$

Tích phân của Gaussian dịch tâm một lượng phức $m+ius^2$ vẫn bằng 1 (dịch contour không đổi giá trị vì tích phân hội tụ tuyệt đối), nên chỉ còn lại hai số hạng hằng số ngoài dấu tích phân:

$$\boxed{\;\varphi_{BS}(u)=\exp\!\Big(iu\,(r-\tfrac{\sigma^2}{2})T-\tfrac{\sigma^2 u^2 T}{2}\Big).\;}$$

Cắm số của ví dụ chuẩn ($r=0.05,\sigma=0.20,T=1$): mean $m=(0.05-0.02)\cdot 1=0.03$, variance $s^2=0.04$. Vậy $\varphi_{BS}(u)=\exp(0.03\,iu-0.02\,u^2)$. Tại $u=1$ tính từng mảnh: phần thực của số mũ là $-0.02$, phần ảo là $0.03$, nên $\varphi=e^{-0.02}(\cos 0.03+i\sin 0.03)$. Với $e^{-0.02}=0.980199$, $\cos 0.03=0.999550$, $\sin 0.03=0.029996$:

$$\varphi_{BS}(1)=0.980199\,(0.999550+0.029996\,i)=0.979758+0.029402\,i.$$

Con số phức này tự nó không "nghĩa" gì với trader, nhưng nó là viên gạch mà mọi công thức phía dưới nghiền ra giá: mỗi phương pháp Fourier trong chương chẳng qua là một cách cân nhắc các giá trị $\varphi(u)$ trên một lưới $u$ rồi cộng lại thành tiền.

**Vì sao CF của các model khó lại đóng.** Điểm mấu chốt là các model production đều thuộc lớp **affine** (hoặc Lévy). Với Lévy process — increments độc lập, dừng, chính là Merton, VG, NIG — định lý Lévy–Khintchine cho $\varphi(u)=e^{T\psi(u)}$ với $\psi$ là "characteristic exponent", một hàm đóng gồm phần diffusion cộng một tích phân theo Lévy measure của các nhảy. Với affine như Heston, CF giải ra từ một cặp Riccati ODE có nghiệm đóng. Ta không chứng minh đầy đủ ở đây (Chương 8 dùng lại cho exotics; Heston CF đầy đủ nằm trong `src/models` họ equity), nhưng nêu hai CF cụ thể để bạn thấy chúng hình thù ra sao, và để có ví dụ số thứ hai chạy suốt chương.

**Merton jump-diffusion.** GBM cộng một Poisson các cú nhảy log-normal: giữa các nhảy là diffusion vol $\sigma$, nhảy đến với intensity $\lambda$/năm, mỗi log-jump $\sim\mathcal N(\mu_J,\sigma_J^2)$. CF của log-return:

$$\varphi_{Mer}(u)=\exp\!\Big(iu\,\omega T-\tfrac{\sigma^2 u^2}{2}T+\lambda T\big(e^{iu\mu_J-\tfrac12\sigma_J^2 u^2}-1\big)\Big),$$

với drift compensator $\omega=r-\tfrac{\sigma^2}{2}-\lambda\kappa$ và $\kappa=e^{\mu_J+\sigma_J^2/2}-1$ là kỳ vọng bước nhảy tương đối, đặt sao cho $\mathbb{E}^{\mathbb{Q}}[S_T]=S_0 e^{rT}$ (điều kiện martingale bắt buộc dưới $\mathbb{Q}$). Số hạng $e^{iu\mu_J-\sigma_J^2u^2/2}-1$ chính là CF của một cú nhảy trừ đi 1, nhân intensity $\lambda T$ — cấu trúc Lévy–Khintchine hiện nguyên hình: phần diffusion $-\tfrac{\sigma^2u^2}{2}T$ cộng phần jump. Ta sẽ dùng bộ số $\sigma=15\%,\lambda=0.3,\mu_J=-0.10,\sigma_J=0.15$ ở mục 7.5. Cắm ngay để có một con số cầm tay: $\kappa=e^{-0.10+0.15^2/2}-1=e^{-0.08875}-1=-0.08493$, nên compensator $\omega=0.05-\tfrac{0.15^2}{2}-0.3(-0.08493)=0.05-0.01125+0.02548=0.06423$. Con số $\omega$ dương hơn $r-\sigma^2/2$ vì phải "kéo lên" bù cho các nhảy trung bình âm.

**Heston** (để hoàn tất bản đồ, không cắm số ở đây): $\varphi_{Hes}(u)=\exp\big(C(u)\bar v+D(u)v_0+iu\ln(S_0 e^{rT})\big)$ với $C,D$ là nghiệm đóng của Riccati chứa $\kappa,\bar v,\xi,\rho$. Điểm nghiệp vụ duy nhất cần nhớ khi implement: có hai nhánh căn phức trong nghiệm ("Heston trap" của Albrecher) — chọn sai nhánh thì CF nhảy qua branch cut và giá sai một cách âm thầm ở maturity dài, không văng lỗi, chỉ lệch giá; công thức "little Heston trap" chọn nhánh ổn định tránh được, và đây là bug kinh điển reviewer soi đầu tiên trong model validation.

Từ CF, mọi moment đọc được bằng đạo hàm tại $u=0$: $\mathbb{E}[X_T]=-i\varphi'(0)$ và $\text{Var}(X_T)=-\varphi''(0)+\varphi'(0)^2$. Kiểm trên BS: $\varphi'(u)=(im-s^2u)\varphi(u)$ nên $\varphi'(0)=im=0.03i$, cho $\mathbb{E}[X_T]=-i\cdot 0.03i=0.03$ ✓; đạo hàm bậc hai $\varphi''(0)=(im)^2-s^2=-0.0009-0.04$, nên $-\varphi''(0)+\varphi'(0)^2=(0.0009+0.04)+(-0.0009)=0.04$ ✓, đúng variance. Cỗ máy tự kiểm tra được chính nó — một tính chất ta khai thác lại ở mục COS để dựng truncation range từ cumulants.

## 7.2 Đảo ngược: từ CF ra density và ra xác suất (Gil-Pelaez)

Có CF rồi, câu hỏi kế: lấy lại density — hoặc thứ ta thật sự cần, là xác suất ITM — bằng cách nào? Đây là bài toán **Fourier inversion**. Density lấy lại bằng biến đổi Fourier ngược:

$$f(x)=\frac{1}{2\pi}\int_{-\infty}^{\infty}e^{-iux}\varphi(u)\,du.$$

Với BS ta biết trước kết quả phải ra Gaussian, nhưng công thức trên đúng cho MỌI $\varphi$ — kể cả Heston nơi $f$ không có dạng đóng, ta vẫn tính được $f$ tại từng điểm $x$ bằng cầu phương số. Đây đã là một chiến thắng khái niệm: chưa cần công thức nào tinh vi, chỉ riêng inversion đã cho ta density của bất kỳ model CF nào.

Nhưng để định giá call ta không cần cả density; ta cần hai xác suất, đúng như $N(d_1),N(d_2)$ trong BS. Nhớ lại cách đọc BS ở Chương 5: $C=S_0 N(d_1)-Ke^{-rT}N(d_2)$, trong đó $N(d_2)=\mathbb{Q}(S_T>K)$ là xác suất ITM dưới measure risk-neutral $\mathbb{Q}$, còn $N(d_1)$ là cùng xác suất ITM nhưng dưới **share/stock measure** (numeraire là chính cổ phiếu thay vì money-market). Cấu trúc hai-xác-suất này TỔNG QUÁT cho mọi model — nó không phải đặc sản của BS:

$$C=S_0\,\Pi_1-Ke^{-rT}\,\Pi_2,\qquad \Pi_2=\mathbb{Q}(S_T>K),\ \ \Pi_1=\mathbb{Q}^S(S_T>K).$$

Trực giác của phân tách này: $Ke^{-rT}\Pi_2$ là hiện giá của việc trả strike $K$ với xác suất ITM (đo dưới $\mathbb{Q}$), còn $S_0\Pi_1$ là hiện giá của việc nhận cổ phiếu — nhưng vì payoff nhận cổ phiếu tỉ lệ với chính $S_T$, kỳ vọng đó tự nhiên viết gọn dưới measure lấy cổ phiếu làm numeraire. Việc còn lại thuần kỹ thuật: tính $\Pi_1,\Pi_2$ từ CF.

Đây là chỗ **công thức đảo ngược Gil-Pelaez** (1951) lên sân khấu. Với biến $Y=\ln S_T$ có CF $\phi(u)=\mathbb{E}[e^{iuY}]$, xác suất đuôi là

$$\mathbb{Q}(Y>y)=\frac12+\frac{1}{\pi}\int_0^{\infty}\text{Re}\!\left[\frac{e^{-iuy}\phi(u)}{iu}\right]du.$$

Trực giác của công thức: thừa số $1/(iu)$ trong tích phân chính là "tích phân của sóng phẳng" — nó biến CF (Fourier của density) thành Fourier của hàm CDF; lấy phần thực và cận $[0,\infty)$ đến từ việc density là thực nên $\phi(-u)=\overline{\phi(u)}$, cho phép gập nửa trục âm vào nửa dương. Hằng số $\tfrac12$ là giá trị CDF "ở vô cực đối xứng", chỗ mà tích phân đo độ lệch khỏi. Với $\Pi_1$, ta dùng đúng công thức nhưng thay $\phi$ bằng CF dưới share measure, $\phi_1(u)=\phi(u-i)/\phi(-i)$ — phép "dịch phức đi $-i$" chính là đổi numeraire sang cổ phiếu, một tiểu xảo Esscher tilt. Mẫu số $\phi(-i)=\mathbb{E}[e^{Y}]=\mathbb{E}[S_T]=S_0e^{rT}$ chuẩn hóa để $\phi_1$ vẫn là một CF hợp lệ ($\phi_1(0)=1$).

**Ví dụ số — kiểm Gil-Pelaez trên BS.** Lấy $y=\ln K=\ln 100$, CF của $\ln S_T$ là $\phi(u)=\exp\!\big(iu(\ln S_0+m)-\tfrac{s^2}{2}u^2\big)$ với $m=0.03,s^2=0.04$. Tích phân số vế phải Gil-Pelaez (cầu phương midpoint, cận tới $u=200$, đủ mịn để CF đã tắt) cho

$$\mathbb{Q}(S_T>K)=0.559618.$$

So với BS closed form: $N(d_2)=N(0.15)=0.559618$ — **trùng đến chữ số thứ sáu**. Cỗ máy inversion đúng. Làm thêm cho $\Pi_1$ bằng CF tilted $\phi_1$: tích phân cho $0.636831$, đúng bằng $N(d_1)=N(0.35)=0.636831$ — cả hai xác suất đều khớp. Nếu thay $\phi$ bằng CF Merton hay Heston, cùng một tích phân vẫn chạy nguyên xi, chỉ khác là không còn $N(\cdot)$ để đối chiếu — nhưng ta vừa chứng minh cỗ máy trên một trường hợp có đáp số biết trước, nên đủ cơ sở tin nó ở những model không có nghiệm đóng.

Đây là **cách định giá Heston đầu tiên trong lịch sử** (Heston 1993 viết đúng dạng hai-xác-suất Gil-Pelaez này). Nó hoạt động, nhưng có ba nhược điểm thực chiến khiến industry cuối cùng bỏ nó. Thứ nhất, phải chạy **hai** tích phân riêng ($\Pi_1,\Pi_2$) cho mỗi strike — gấp đôi công. Thứ hai, integrand $\phi(u)/(iu)$ có **singularity tại $u=0$**: mẫu số triệt tiêu, giá trị giới hạn hữu hạn nhưng số học rất nhạy ngay quanh gốc, phải xử lý giới hạn bằng tay hoặc dời điểm lưới. Thứ ba, mỗi strike là một lần tích phân riêng — calibrate 200 quotes thành 400 tích phân, và mỗi tích phân lại vài trăm lần đánh giá CF, quá chậm cho một vòng lặp Levenberg–Marquardt chạy hàng nghìn iteration. Ba nhược điểm này định nghĩa nghị trình của phần còn lại chương: gộp về một tích phân trơn không singularity (Lewis), và tính mọi strike chỉ trong một lần (FFT, rồi COS).

## 7.3 Carr-Madan: damping factor và con đường ra FFT

Vì sao mục này tồn tại: Gil-Pelaez cho một tích phân mỗi strike; Carr-Madan (1999) muốn biến việc định giá thành **một FFT trả về giá ở cả một lưới strike cùng lúc** — nhưng để FFT vào cuộc, phải có một hàm khả tích của biến Fourier, và đây là lúc **damping factor** trở nên bắt buộc.

Vấn đề là thế này. Ta muốn Fourier-transform giá call **theo log-strike** $k=\ln K$ (chú ý: transform theo strike, không theo log-price như mục trước). Viết $C(k)=e^{-rT}\int_k^\infty (e^y-e^k)f(y)\,dy$ với $y=\ln S_T$. Thử lấy biến đổi Fourier của $C(k)$ theo $k$: khi $k\to-\infty$ (strike về 0) thì call về giá cổ phiếu chiết khấu, $C(k)\to S_0$ — **không tiến về 0**, nên $C\notin L^1$, transform không tồn tại. Đây chính là hình hài singularity mà Gil-Pelaez né bằng thủ thuật $1/(iu)$. Carr-Madan xử lý thẳng bằng cách **nhân một damping** $e^{\alpha k}$ với $\alpha>0$:

$$c(k)=e^{\alpha k}C(k).$$

Bây giờ khi $k\to-\infty$, $e^{\alpha k}\to 0$ dập tắt phần đuôi trái đang hằng số; còn khi $k\to+\infty$ thì call vốn đã về 0 theo cấp mũ. Với $\alpha$ đủ lớn, $c(k)\in L^1$ và transform tồn tại. Ta dẫn xuất Fourier transform $\Psi(v)=\int_{-\infty}^\infty e^{ivk}c(k)\,dk$ từng bước, không bỏ bước nào:

$$\Psi(v)=\int_{-\infty}^\infty e^{ivk}e^{\alpha k}e^{-rT}\!\int_k^\infty(e^y-e^k)f(y)\,dy\,dk.$$

Đổi thứ tự tích phân (Fubini hợp lệ nhờ damping đảm bảo khả tích tuyệt đối), miền $\{k\le y\}$ giữ nguyên nhưng giờ tích phân trong theo $k$ từ $-\infty$ đến $y$:

$$\int_{-\infty}^{y}e^{(\alpha+iv)k}(e^y-e^k)\,dk = \frac{e^y\,e^{(\alpha+iv)y}}{\alpha+iv}-\frac{e^{(\alpha+iv+1)y}}{\alpha+iv+1}=\frac{e^{(\alpha+iv+1)y}}{(\alpha+iv)(\alpha+iv+1)}.$$

(Hai phân số cùng tử $e^{(\alpha+iv+1)y}$; quy đồng cho mẫu $(\alpha+iv)(\alpha+iv+1)$.) Còn lại tích phân theo $y$ của $e^{(\alpha+1+iv)y}f(y)$ chính là CF của $\ln S_T$ đánh giá tại điểm phức $v-(\alpha+1)i$, vì $\int e^{(\alpha+1+iv)y}f(y)dy=\mathbb{E}[e^{i(v-(\alpha+1)i)Y}]=\phi(v-(\alpha+1)i)$. Gọn lại:

$$\boxed{\;\Psi(v)=\frac{e^{-rT}\,\phi\big(v-(\alpha+1)i\big)}{\alpha^2+\alpha-v^2+i(2\alpha+1)v}\;}$$

với $\phi$ là CF của $\ln S_T$ (đầy đủ drift). Rồi giá call lấy ngược ra bằng một tích phân thực (Fourier ngược, gập về nửa trục dương như Gil-Pelaez):

$$C(k)=\frac{e^{-\alpha k}}{\pi}\int_0^\infty \text{Re}\!\big[e^{-ivk}\Psi(v)\big]\,dv.$$

**Vì sao cần damping — đọc thẳng từ mẫu số.** Mẫu số $\alpha^2+\alpha-v^2+i(2\alpha+1)v$ tại $v=0$ bằng $\alpha^2+\alpha=\alpha(\alpha+1)$. Nếu $\alpha=0$ (không damping), mẫu số tại $v=0$ bằng 0 → singularity trở lại, đúng bằng singularity Gil-Pelaez đội lốt khác. $\alpha>0$ đẩy pole ra khỏi trục thực → integrand **trơn tại $v=0$**, không phải xử lý giới hạn nào. Đó là toàn bộ lý do damping tồn tại: nó dời cực ra khỏi đường tích phân, đổi lấy một thừa số $e^{-\alpha k}$ vô hại ngoài dấu tích phân.

**Chọn $\alpha$ bao nhiêu?** Có một ràng buộc cứng: $\Psi$ hữu hạn đòi $\phi(v-(\alpha+1)i)$ hữu hạn tại $v=0$, tức $\mathbb{E}[S_T^{\alpha+1}]=\mathbb{E}[e^{(\alpha+1)Y}]<\infty$ — moment bậc $\alpha+1$ của $S_T$ phải tồn tại. Với BS mọi moment hữu hạn nên $\alpha$ tùy ý; với VG/CGMY moment cao có thể phân kỳ nên $\alpha$ bị chặn trên bởi cận moment tối đa — Carr-Madan đề nghị lấy $\alpha$ khoảng $1/4$ của cận đó. Chọn quá nhỏ: integrand nhọn quanh $v=0$, cầu phương kém chính xác. Quá lớn: $e^{-\alpha k}$ khuếch đại sai số ở strike thấp. Thực chiến $\alpha\in[1,2]$ cho equity là an toàn; Lee (2004) sau này cho công thức chọn $\alpha$ tối ưu theo phổ sai số.

**Ví dụ số.** Lấy $\alpha=1.5$, CF BS $\phi(u)=\exp\!\big(iu(\ln S_0+m)-\tfrac{s^2}2 u^2\big)$, $k=\ln 100$. Tích phân số vế phải (midpoint tới $v=200$) cho

$$C=10.450584,$$

khớp BS closed form $10.450584$ đến sáu chữ số. Đổi $\alpha$ sang $1.0$ hay $2.0$ vẫn ra đúng con số này — chính xác như lý thuyết tiên đoán: $\alpha$ chỉ ảnh hưởng chất lượng số học của cầu phương, không ảnh hưởng giá đúng (giá đúng độc lập với đường damping vì ta chỉ dời rồi hoàn nguyên). Đây là bài test hồi quy chuẩn cho bất kỳ implementation Carr-Madan nào: cắm CF BS, phải nhả lại $10.45$ bất kể $\alpha$.

**Bước lên FFT.** Tới đây mới thấy cú đắt giá của Carr-Madan. Rời rạc tích phân $C(k)=\frac{e^{-\alpha k}}{\pi}\int_0^\infty e^{-ivk}\Psi(v)dv$ trên lưới $v_j=j\,\eta$, $j=0,\dots,N-1$, đồng thời muốn giá tại lưới log-strike $k_p=k_0+p\,\lambda$. Tổng rời rạc thành

$$C(k_p)\approx\frac{e^{-\alpha k_p}}{\pi}\sum_{j=0}^{N-1}e^{-i\eta\lambda\, jp}\,e^{-iv_j k_0}\,\Psi(v_j)\,\eta\,w_j,$$

với $w_j$ trọng số cầu phương (thường Simpson). Nếu chọn **ràng buộc Nyquist** $\eta\lambda=\tfrac{2\pi}{N}$ thì hạt nhân $e^{-i\eta\lambda jp}=e^{-2\pi i jp/N}$ chính xác là hạt nhân **DFT** → tổng tính bằng một FFT trong $O(N\log N)$, nhả ra giá ở toàn bộ $N$ strike cùng lúc. Đây là phép màu của Carr-Madan: **một FFT = một dải strike**, thay vì một tích phân mỗi strike như Gil-Pelaez.

Nhưng ràng buộc $\eta\lambda=2\pi/N$ là con dao hai lưỡi, và chính là lý do FFT cuối cùng thua COS. Muốn integrand mịn cần $\eta$ nhỏ (lưới $v$ dày); nhưng $\eta$ nhỏ với $N$ cố định buộc $\lambda=\tfrac{2\pi}{N\eta}$ **lớn** → lưới strike **thưa**. Với $N=4096$ điển hình, khoảng cách strike trên lưới thường cỡ vài phần trăm — trong khi bạn cần giá tại các strike quote CỤ THỂ của thị trường (ATM, các strike listed). Hệ quả: phải **nội suy** từ lưới FFT về strike thật, thêm một tầng sai số ngay giữa vòng calibrate; hoặc tăng $N$, đắt hơn. Và mỗi expiry $T$ là một FFT riêng. Với $N=4096$, mỗi lần định giá tốn cỡ vài nghìn điểm đánh giá CF — trong một vòng calibrate Heston chạy hàng nghìn lần, con số này cộng dồn thành thật, và đó là khe hở mà COS chui vào.

## 7.4 Lewis fundamental transform: một tích phân, gọn hơn

Vì sao mục này tồn tại: Carr-Madan phải chọn $\alpha$ và gánh singularity tiềm ẩn; Lewis (2001) cho một công thức **đối xứng, một tích phân duy nhất**, không có pole trên đường tích phân, và làm rõ rằng payoff-transform tách rời hẳn khỏi model-transform. Nó không nhanh hơn Carr-Madan, nhưng nó là bản đồ khái niệm sạch nhất của toàn bộ Fourier pricing.

Ý tưởng Lewis: Fourier-transform **payoff** một lần cho mãi mãi, tách khỏi CF của model, rồi định giá là tích phân của tích hai transform trên một đường thẳng nằm trong dải hội tụ chung. Với call, payoff-transform (theo biến log-price) là một hàm hữu tỉ đơn giản với hai cực; đặt đường tích phân $\text{Im}(u)=\tfrac12$ ngay giữa hai cực đó cho biểu diễn đối xứng, hội tụ nhanh nhất.

Điểm tinh tế mà một implementation cẩu thả hay vấp — và ta nêu thẳng để không ai chép sai — là **CF nào đi vào công thức**. Lewis viết giá theo phân phối của log-return đã "trung tâm hóa về forward", tức biến $X=\ln(S_T/F)$ với $F=S_0e^{rT}$ là **martingale-adjusted** ($\mathbb{E}[e^X]=1$, nên $\phi(-i)=1$), KHÔNG phải $\ln(S_T/S_0)$ còn chứa drift $(r-\tfrac{\sigma^2}{2})T$. Dùng nhầm CF chứa drift là double-counting phần $rT$ và ra số sai. Với ký hiệu đó, dạng dùng nhiều nhất là

$$\boxed{\;C=e^{-rT}\!\left[\,F-\frac{\sqrt{F K}}{\pi}\int_0^\infty \text{Re}\!\left[e^{iuk}\,\frac{\phi\!\big(u-\tfrac{i}{2}\big)}{u^2+\tfrac14}\right]du\,\right],\quad k=\ln\frac{F}{K},\;\;F=S_0e^{rT},\;}$$

với $\phi(u)=\mathbb{E}[e^{iuX}]$ là CF của $X=\ln(S_T/F)$ (thỏa $\phi(-i)=1$). Vẻ đẹp ở đây: mẫu số $u^2+\tfrac14$ **không bao giờ triệt tiêu** trên trục thực (luôn $\ge\tfrac14$) → không singularity, không phải né pole, không phải dò $\alpha$ như Carr-Madan. Đường $\text{Im}(u)=\tfrac12$ đặt ngay giữa hai cực của payoff-transform, cho tích phân đối xứng và hội tụ nhanh nhất.

**Ví dụ số — Lewis trên BS, để không nói suông.** Với BS forward, $X\sim\mathcal N(-\tfrac{s^2}{2},s^2)$ nên $\phi(u)=\exp(-\tfrac{s^2}{2}iu-\tfrac{s^2}{2}u^2)$; kiểm martingale $\phi(-i)=\exp(-\tfrac{s^2}{2}+\tfrac{s^2}{2})=1$ ✓. Ở đây $S_0=K$ nên $F=100\,e^{0.05}=105.127$, $k=\ln(F/K)=rT=0.05$, $s^2=0.04$. Tích phân số (midpoint tới $u=200$) cho

$$C=10.450584,$$

khớp đúng $10.45$ đến sáu chữ số. (Cảnh báo lại: nếu vô ý cắm CF của $\ln(S_T/S_0)$ thay vì của $\ln(S_T/F)$, cùng công thức sẽ nhả ra $8.82$ — một con số trông "hợp lý" nên bug này lọt qua mắt thường; đây đúng là loại lỗi reviewer bắt trong model validation, và là lý do ta kiểm mọi công thức bằng số.) Với model bất kỳ có CF, chỉ cần dùng CF của log-return đã dời về forward (chia CF của $\ln(S_T/S_0)$ cho $\phi_{S_0}(-i)=e^{rT}$-tương-đương, hay đơn giản là tính CF quanh $F$) và tích phân này cũng nhả đúng giá; nó là cùng một con voi nhìn từ góc khác.

Giá trị thật của Lewis không phải tốc độ — nó vẫn một-tích-phân-mỗi-strike như Gil-Pelaez — mà là **sự sáng sủa khái niệm**: nó phơi bày rằng mọi phương pháp Fourier đều là tích của một **payoff-transform** $\hat w(u)$ với một **model CF** $\phi(u)$, rồi tích phân trên một đường trong dải hội tụ chung. Payoff biết dưới dạng transform, model biết dưới dạng CF, giá là tích phân của tích. Digital, power option, log-contract... chỉ khác nhau ở $\hat w$; CF giữ nguyên. Đây là ý nghĩa của "fundamental transform": nó chuẩn hóa cách một pricing library tổ chức code — một hàm CF cho mỗi model, một hàm payoff-transform cho mỗi loại option, một integrator dùng chung. Trong `quantc`, đây đúng là ranh giới giữa `characteristic` (model) và phần payoff của `cos-method` (option). Về hiệu năng thô thì cả Gil-Pelaez, Carr-Madan, Lewis đều thuộc thế hệ "tích phân trực tiếp", một tích phân mỗi strike hoặc một FFT mỗi expiry; kẻ thắng cuộc chơi production là thế hệ kế — COS — kế thừa đúng tư tưởng "payoff × CF" của Lewis nhưng đóng gói nó thành chuỗi hữu hạn hội tụ mũ.

## 7.5 COS method: Fourier-cosine expansion — vũ khí thắng cuộc

Vì sao mục này tồn tại và vì sao nó thắng: FFT cho cả lưới strike nhưng lưới thưa và phải nội suy; các phương pháp tích phân cho strike chính xác nhưng chậm. **COS method** (Fang–Oosterlee 2008) đạt cả hai — strike bất kỳ, cực ít điểm, hội tụ mũ — bằng một cú đổi ý tưởng: thay vì tích phân CF trực tiếp, ta **khai triển density thành chuỗi cosine** trên một khoảng cắt $[a,b]$, và các hệ số Fourier-cosine của density lại **đọc thẳng từ CF gần như miễn phí**.

**Bước 1 — density thành chuỗi cosine.** Trên $[a,b]$, một hàm trơn khai triển được thành chuỗi cosine (Fourier cosine series):

$$f(x)\approx\sum_{k=0}^{N-1}{}' A_k\cos\!\Big(k\pi\frac{x-a}{b-a}\Big),\qquad A_k=\frac{2}{b-a}\int_a^b f(x)\cos\!\Big(k\pi\frac{x-a}{b-a}\Big)dx,$$

dấu phẩy nghĩa số hạng $k=0$ nhân thêm $\tfrac12$. Đây là chỗ phép màu xảy ra: tích phân định nghĩa $A_k$ **chính là phần thực của CF** đánh giá tại tần số lưới $u_k=\tfrac{k\pi}{b-a}$. Cụ thể, vì $\cos(u_k(x-a))=\text{Re}[e^{iu_k(x-a)}]$,

$$\int_a^b f(x)\cos\!\big(u_k(x-a)\big)dx=\text{Re}\!\Big[e^{-iu_k a}\!\int_a^b f(x)e^{iu_k x}dx\Big]\approx\text{Re}\!\big[e^{-iu_k a}\,\varphi(u_k)\big],$$

trong đó xấp xỉ cuối cùng chỉ mở rộng cận tích phân từ $[a,b]$ ra $\mathbb{R}$ để nhận diện đúng $\varphi(u_k)$ — hợp lệ nếu $[a,b]$ đủ rộng để đuôi $f$ ngoài nó không đáng kể (điều kiện ta lo ở Bước 4). Kết quả:

$$A_k\approx\frac{2}{b-a}\,\text{Re}\!\Big[\varphi(u_k)\,e^{-iu_k a}\Big].$$

**Không cần biết $f$**, chỉ cần CF đánh giá trên một lưới tần số đều. Đó là toàn bộ ý tưởng — và nó dùng được với mọi model chỉ có CF, đúng lớp model ta quan tâm.

**Bước 2 — ghép với payoff, đảo thứ tự.** Giá option châu Âu là $V=e^{-rT}\int_a^b v(x)f(x)dx$ với $v$ là payoff theo biến $x$. Thay chuỗi cosine của $f$ vào và **đổi thứ tự tổng–tích phân**:

$$V=e^{-rT}\int_a^b v(x)\sum_k{}'A_k\cos(\cdot)\,dx=e^{-rT}\sum_{k=0}^{N-1}{}'A_k\underbrace{\int_a^b v(x)\cos\!\Big(k\pi\tfrac{x-a}{b-a}\Big)dx}_{\displaystyle \frac{b-a}{2}V_k}.$$

Định nghĩa **payoff cosine coefficient** $V_k=\frac{2}{b-a}\int_a^b v(x)\cos(k\pi\frac{x-a}{b-a})dx$. Thay $A_k$ từ Bước 1, thừa số $\tfrac{2}{b-a}$ và $\tfrac{b-a}{2}$ triệt tiêu, và công thức COS gọn đến kinh ngạc:

$$\boxed{\;V=e^{-rT}\sum_{k=0}^{N-1}{}'\,\text{Re}\!\Big[\varphi(u_k)\,e^{iu_k(x_0-a)}\Big]\,V_k,\qquad u_k=\frac{k\pi}{b-a},\;x_0=\ln\frac{S_0}{K}.\;}$$

(Ở đây $\varphi$ là CF của log-return $x=\ln(S_T/S_0)$, và pha $e^{iu_k x_0}$ dời gốc về moneyness — đây là chỗ strike $S_0/K$ đi vào phần CF.) Đọc công thức như một quant: mỗi số hạng là **(hệ số density đọc từ CF) × (hệ số payoff)**, cộng đúng $N$ số hạng. CF đánh giá đúng $N$ lần trên một lưới đều — với $N$ nhỏ. Không FFT, không nội suy, không ràng buộc Nyquist. Strike vào qua $x_0=\ln(S_0/K)$ trong pha và qua $V_k$ — nên đổi strike chỉ cần tính lại $V_k$ (giải tích, rẻ) trong khi phần CF $\varphi(u_k)$ tái dùng nguyên xi across strikes cùng một $T$. Đó chính là tính chất "một lần CF, mọi strike" mà Carr-Madan phải dùng FFT thô để đạt, nay COS đạt bằng đại số.

**Bước 3 — $V_k$ đóng cho call.** Payoff call chỉ ITM khi $S_T>K$. Tiện nhất là dùng biến $y=\ln(S_T/K)$ để payoff $=K(e^y-1)^+$, dương trên $y\in[0,b]$ (và bằng 0 dưới 0). Khi đó $V_k$ tách thành hai tích phân đóng cổ điển của Fang–Oosterlee:

$$V_k=\frac{2}{b-a}K\big(\chi_k(0,b)-\psi_k(0,b)\big),$$

với $\chi_k(c,d)=\int_c^d e^y\cos(k\pi\frac{y-a}{b-a})dy$ (mũ nhân cosine) và $\psi_k(c,d)=\int_c^d \cos(k\pi\frac{y-a}{b-a})dy$ (cosine thuần). Cả hai tích phân sơ cấp cho **công thức đóng**, đặt $\omega_k=\tfrac{k\pi}{b-a}$:

$$\chi_k(c,d)=\frac{1}{1+\omega_k^2}\Big[\cos\!\big(\omega_k(d-a)\big)e^{d}-\cos\!\big(\omega_k(c-a)\big)e^{c}+\omega_k\big(\sin(\omega_k(d-a))e^d-\sin(\omega_k(c-a))e^c\big)\Big],$$

$$\psi_k(c,d)=\begin{cases}\dfrac{\sin(\omega_k(d-a))-\sin(\omega_k(c-a))}{\omega_k},&k\ne0\\[2mm] d-c,&k=0.\end{cases}$$

Điểm nghiệp vụ đắt giá: **$V_k$ hoàn toàn không phụ thuộc model** — nó chỉ mã hóa hình dạng payoff. Đổi từ Heston sang Merton chỉ thay $\varphi$; đổi từ call sang digital hay put chỉ thay cặp $(\chi_k,\psi_k)$; đổi cả hai thì thay cả hai, nhưng integrator giữ nguyên. Đây là composition sạch mà một library production khao khát: **model registry × payoff registry**, một integrator dùng chung — đúng triết lý tổ chức code ở tầng `src/analytics`.

**Bước 4 — truncation range $[a,b]$ theo cumulants.** Chuỗi cosine chỉ đúng nếu $[a,b]$ ôm gần trọn khối lượng của $f$; đuôi bị cắt là nguồn sai số đầu tiên và nguy hiểm nhất (vì nó không giảm khi tăng $N$). Fang–Oosterlee cho quy tắc dựa trên **cumulants** của log-return, mà cumulants lại đọc từ CF (mục 7.1):

$$[a,b]=\Big[c_1-L\sqrt{c_2+\sqrt{c_4}}\;,\;\;c_1+L\sqrt{c_2+\sqrt{c_4}}\Big],\quad L\in[8,12].$$

$c_1$ là mean, $c_2$ variance, $c_4$ là cumulant bậc bốn (bắt đuôi dày của jump/VG — với BS $c_4=0$ vì Gaussian không có cumulant bậc cao). $L$ là số "độ lệch chuẩn mở rộng"; $L=10$ là mặc định an toàn. Với ví dụ BS chuẩn: $c_1=(r-\tfrac{\sigma^2}2)T=0.03$, $c_2=\sigma^2 T=0.04$ nên $\sqrt{c_2}=0.2$, và

$$[a,b]=[0.03-10(0.2),\,0.03+10(0.2)]=[-1.97,\,2.03],$$

một khoảng log-return rộng khoảng $\pm 2$ (tức $S_T$ trải từ $S_0 e^{-1.97}\approx 13.9$ đến $S_0 e^{2.03}\approx 761$) — thừa sức ôm trọn phân phối 1 năm. Chọn $[a,b]$ quá hẹp thì cắt đuôi, sai số bão hòa ở một mức sàn không giảm dù tăng $N$ (lỗi kinh điển: giá bỗng "đóng băng" cách đáp số một khoảng cố định). Quá rộng thì lãng phí, cần $N$ lớn hơn để phân giải cùng chi tiết trên một khoảng dài hơn. Với model đuôi dày (VG, CGMY, hay Merton nhiều jump), $c_4>0$ tự động nới $[a,b]$ — đó là lý do công thức có $\sqrt{c_4}$.

**Bước 5 — hội tụ MŨ, chứng minh bằng số.** Đây là màn trình diễn trung tâm của chương. Chạy COS trên call BS chuẩn ($S_0=K=100,r=5\%,\sigma=20\%,T=1$, $[a,b]=[-1.97,2.03]$, $L=10$), tăng dần số terms $N$:

| $N$ terms | Giá COS | Sai số tuyệt đối vs $10.450584$ |
|---:|---:|---:|
| 8 | 8.483544 | $1.97\times10^{0}$ |
| 16 | 10.396804 | $5.4\times10^{-2}$ |
| 32 | 10.450582 | $1.4\times10^{-6}$ |
| 64 | 10.450584 | $<10^{-13}$ |
| 128 | 10.450584 | $<10^{-13}$ |

Đọc bảng như một quant. $N=8$ còn thô, sai gần 2 điểm giá — chuỗi cosine tám số hạng chưa phân giải nổi hình chuông. Nhưng nhìn cột sai số: mỗi lần **gấp đôi** $N$, sai số không giảm tuyến tính mà **giảm theo cấp số nhân** — $1.97\to 5\!\times\!10^{-2}\to 1\!\times\!10^{-6}\to <10^{-13}$. Đến $N=64$ đã chạm **machine precision** (sàn của floating-point double); thêm terms là vô ích vì không còn bit nào để cải thiện. Đây là **spectral / exponential convergence** — dấu ấn của phương pháp Fourier-cosine trên hàm trơn: sai số $\sim e^{-cN}$ chứ không phải $\sim N^{-1}$ như trapezoid hay $\sim N^{-1/2}$ như Monte Carlo. So sánh trực diện cho thấm: Monte Carlo cần cỡ $10^{8}$ paths để đạt sai số $10^{-4}$; COS đạt $10^{-6}$ với **32 terms**. Đó là bốn tới năm bậc độ lớn ít công hơn cho cùng độ chính xác — và là lý do không ai calibrate bằng Monte Carlo.

Vì sao trơn đến vậy: BS density là Gaussian, giải tích (analytic) vô hạn lần, nên hệ số Fourier-cosine của nó tắt nhanh hơn mọi lũy thừa của $1/k$, kéo theo chuỗi hội tụ mũ. Với Heston/Merton, density kém trơn hơn — đuôi dày và đỉnh nhọn do jump làm các đạo hàm bậc cao lớn dần — nên hội tụ chậm hơn chút, cần $N\sim128$–$256$ thay vì 64; nhưng vẫn là exponential, và vẫn rẻ hơn FFT ($N\sim4096$) cả một bậc độ lớn.

**Ví dụ số thứ hai — model KHÔNG có công thức BS: Merton jump.** Đây là chỗ chương chứng minh giá trị thật của mình, vì Merton có smile thật: jump âm $\mu_J=-0.10$ tạo skew trái, đúng kiểu equity. Bộ tham số $\sigma=15\%,\lambda=0.3/\text{năm},\mu_J=-0.10,\sigma_J=0.15$, cùng $S_0=K=100,r=5\%,T=1$. Dựng $[a,b]$ từ cumulants Merton với $L=10$ (mean $c_1=(\omega+\lambda\mu_J)T=0.0342$, variance $c_2=(\sigma^2+\lambda(\mu_J^2+\sigma_J^2))T=0.03225$, $c_4=\lambda(\mu_J^4+6\mu_J^2\sigma_J^2+3\sigma_J^4)T>0$) cho $[a,b]\approx[-2.46,\,2.53]$ — rộng hơn BS đúng vì $c_4>0$ và jump nới đuôi. Cắm $\varphi_{Mer}$ của mục 7.1 vào đúng công thức COS (chỉ đổi CF; $V_k$ giữ nguyên vì payoff vẫn là call):

| $N$ terms | Giá COS Merton |
|---:|---:|
| 16 | 8.847443 |
| 32 | 9.509357 |
| 64 | 9.516230 |
| 128 | 9.516230 |
| 256 | 9.516230 |

Hội tụ về $C_{Mer}=9.516230$ tại $N=64$ (và ổn định tuyệt đối từ đó) — cùng tốc độ mũ, chỉ cần nhiều terms hơn BS một chút vì density kém trơn hơn. **Kiểm chứng độc lập**, vì một con số Fourier không đối chứng thì không đáng tin trong validation: Merton may mắn có một nghiệm đóng dạng chuỗi. Điều kiện hóa theo *đúng $n$ cú nhảy xảy ra* trong $[0,T]$ (xác suất Poisson), thì giữa các nhảy vẫn là GBM, nên giá là **trung bình Poisson của các giá BS**:

$$C_{Mer}=\sum_{n=0}^\infty \frac{e^{-\lambda' T}(\lambda' T)^n}{n!}\,C_{BS}(\sigma_n,r_n),\quad \lambda'=\lambda(1+\kappa),$$

với vol điều kiện $\sigma_n^2=\sigma^2+n\sigma_J^2/T$ và drift điều kiện $r_n=r-\lambda\kappa+n(\mu_J+\tfrac12\sigma_J^2)/T$. Cộng chuỗi này (60 số hạng dư sức hội tụ vì $\lambda'T\approx0.27$ nhỏ) cho **$9.516230$** — trùng COS đến sáu chữ số. Ý nghĩa nghiệp vụ: ta vừa xác nhận cỗ máy Fourier trên một model có smile, bằng một đường kiểm tra độc lập hoàn toàn, rồi có thể yên tâm thả cùng cỗ máy đó vào Heston/VG/rough — nơi KHÔNG có chuỗi Poisson nào để đối chiếu.

**Đọc con số cho đúng — sửa một trực giác dễ sai.** Call Merton $9.52 < 10.45$ của BS thuần. Cám dỗ là giải thích "cùng vol, jump âm kéo giá xuống", nhưng con số nói khác và ta phải trung thực với con số. Total variance của Merton là $c_2=0.03225$, tức **total vol $\approx 17.96\%$**, THẤP hơn hẳn $20\%$ của BS — nên phần lớn khoảng chênh không phải do skew mà do variance thấp hơn. Tách rõ bằng số: định giá BS ATM tại chính $17.96\%$ cho $C=9.687$. Vậy trong khoảng rơi $10.45\to 9.52$:

- $10.45\to 9.69$ (rơi $\approx 0.76$) là do **total variance thấp hơn** — hiệu ứng level, không liên quan hình dạng.
- $9.69\to 9.52$ (rơi $\approx 0.17$) mới là **hiệu ứng jump/skew thuần**: dưới cùng total variance, đuôi trái dày và đỉnh dịch của phân phối left-skewed làm call ATM rẻ hơn Gaussian một chút.

Đó là cách một quant đọc giá: bóc hiệu ứng level ra khỏi hiệu ứng shape, không gộp làm một. Nếu muốn so "cùng vol" cho công bằng, phải chỉnh $\sigma$ diffusion lên để tổng variance khớp $0.04$ rồi mới quy toàn bộ chênh còn lại cho skew — và khi đó chênh do jump âm nhỏ hơn nhiều so với ấn tượng ban đầu. Đổi $\mu_J$ sang dương sẽ đảo dấu phần shell $0.17$ này (skew phải, call ATM đắt hơn chút), trong khi phần level vẫn do variance chi phối. Đây đúng là loại phân tích trader phải làm được từ giá, và là lý do ta không bao giờ nói "vol" khi ý là "variance của một phân phối không-Gaussian".

## 7.6 Vì sao COS thắng FFT trong thực tế, và chỗ đứng trong pipeline

Gom lại thành một bảng so sánh mà bạn sẽ dùng để bảo vệ lựa chọn kiến trúc trong model validation:

| Tiêu chí | Gil-Pelaez | Carr-Madan FFT | COS |
|---|---|---|---|
| Số đánh giá CF / định giá | ~vài trăm × 2 | $N\sim4096$ | $N\sim64\text{–}256$ |
| Hội tụ | $\sim1/N$ | $\sim1/N$ (bị Nyquist trói) | **mũ $e^{-cN}$** |
| Strike bất kỳ | có (nhưng mỗi strike 1 tích phân) | **không** (lưới cố định, phải nội suy) | **có, trực tiếp** |
| Singularity tại 0 | có, xử lý tay | né bằng damping $\alpha$ | không có |
| Tham số cần dò | — | $\alpha$, $\eta$, $\lambda$, $N$ | chỉ $[a,b]$ (từ cumulants) và $N$ |
| Greeks giải tích | khó | khó | **dễ** (đạo hàm $x_0$ trong mũ) |

Bốn lý do cụ thể COS thắng ở desk, không phải chỉ vì chữ "nhanh" chung chung:

**Ít điểm.** $N\sim128$ so với $N\sim4096$ của FFT là khoảng 30 lần ít đánh giá CF hơn. Với Heston, mỗi đánh giá CF là một hàm phức có căn và exp — không rẻ chút nào. Trong một vòng calibrate chạy hàng nghìn iteration Levenberg–Marquardt, thừa số ×30 nhân với số quotes nhân với số iteration là khác biệt giữa calibrate trong 50ms và 1.5s. Desk recalibrate surface mỗi khi market nhích một tick — 50ms là sống, 1.5s là chết, vì trong 1.5s thị trường đã đi tiếp.

**Strike chính xác, không nội suy.** FFT trả giá trên lưới log-strike đều và thưa; strike quote của thị trường (ATM, 25-delta, các strike listed) rơi vào giữa lưới → phải nội suy, thêm một tầng sai số ngay giữa vòng calibrate — nơi bạn đang cố khớp giá đến từng basis point. COS nhận strike bất kỳ trực tiếp qua pha $x_0$ và qua $V_k$: không có tầng nội suy nào chen giữa model và objective function. Đây là lý do **chuẩn de facto để calibrate Heston hôm nay là COS** (`src/calibration` họ Heston đứng thẳng trên `src/analytics/cos-method`).

**Ổn định số.** Không singularity tại $u=0$ (khác Gil-Pelaez), không phải dò $\alpha$ (khác Carr-Madan). Rủi ro duy nhất là chọn $[a,b]$ quá hẹp cho model đuôi rất dày (CGMY với tham số $Y$ gần 2, hoặc $T$ rất ngắn với vol cao) — biểu hiện rất dễ nhận: giá bão hòa ở một mức cách đáp số một hằng số dù tăng $N$ mãi. Cách chẩn cũng dễ: nới $L$ từ 10 lên 12 và xem giá có dịch không; dịch thì đuôi đang bị cắt. Đó là pitfall thực chiến duy nhất đáng nhớ của COS, và nó tự tố cáo.

**Greeks gần như miễn phí.** Delta và Gamma là đạo hàm giá theo $S_0$; trong công thức COS, $S_0$ chỉ đi vào qua thừa số $e^{iu_k(x_0-a)}$ với $x_0=\ln(S_0/K)$. Đạo hàm chuỗi theo $S_0$ đưa thừa số $iu_k/S_0$ vào từng term — **cùng một tổng, cùng lưới CF đã tính**, chỉ nhân thêm hệ số. Vậy Delta ($\times\, iu_k/S_0$) và Gamma ($\times\,(iu_k/S_0)^2$ với hiệu chỉnh bậc một) ra với chi phí gần bằng 0 trên đỉnh của giá, không cần bump-and-reprice (phải chạy lại toàn bộ, đắt gấp đôi–gấp ba) hay tính lại CF. Đây là món quà kiến trúc quan trọng: calibration cần Jacobian theo tham số model, và cùng khung này cho luôn sensitivity giải tích — nền để nối sang AAD ở Chương 12 cho đạo hàm bậc cao.

**COS không phải chìa khóa vạn năng — biết chỗ dừng.** Nó tỏa sáng cho **European vanilla** dưới model có CF: đó là khoảng 95% khối lượng công việc calibration, nên riêng miền này đã đáng giá cả tầng analytics. Với **Bermudan/American** phải nối nhiều bước COS backward — bản mở rộng Fang–Oosterlee truyền hệ số $V_k$ qua các exercise date bằng đệ quy, nền của định giá Bermudan swaption bằng CF ở Chương 8. Với **path-dependent mạnh** (barrier liên tục, Asian, lookback) COS đơn thuần không đủ vì payoff phụ thuộc cả quỹ đạo chứ không chỉ $S_T$; đó là sân của PDE/PIDE và Monte Carlo (Chương 12). Và COS đòi **có CF**: model không cho CF đóng — một số local-stochastic vol, hay rough vol non-Markovian nơi CF chỉ có dạng bán đóng đắt tiền — thì lợi thế của COS co lại. Bản đồ đúng để dán lên tường: **COS cho vanilla-under-CF và calibration; PDE/MC cho path-dependent và incomplete-CF.** Một desk trưởng thành có cả hai công cụ và biết trước deal nào gọi đường nào — chọn sai đường là hoặc chậm gấp trăm lần, hoặc sai giá.

Khép lại mạch của Part II: Chương 5 cho công thức khi phân phối đẹp; Chương 6 phá phân phối đẹp bằng smile và trao ta các model CF; Chương 7 này là **cỗ máy biến CF thành giá** — cầu nối để những model đó thực sự dùng được ở tốc độ production, không chỉ tồn tại trên giấy. Cùng chính cỗ máy này, chỉ đổi payoff-transform, ta định giá được digital, log-contract (nền của chỉ số VIX ở Chương 6), CMS caplet, và cascade sang exotics của Chương 8. Characteristic function không phải một mẹo toán học phụ; ở một equity/hybrid desk hiện đại, nó là **định dạng chuẩn để một model tự khai báo mình** — và COS là cách nhanh nhất, ổn định nhất để đọc định dạng đó ra tiền.

# Chương 8: Equity exotics

Vanilla là nơi margin mỏng như lưỡi dao. Một call ATM 1Y trên index lớn có bid-offer vài basis point vol; mười nhà làm giá cùng quote một con số Black-Scholes gần như trùng khít, và khách hàng chỉ cần bấm điện thoại là biết ai rẻ nhất. Ở đó desk sống bằng khối lượng, không bằng biên. Tiền thật của một equity derivatives desk nằm ở exotic — nơi payoff phức tạp đến mức không có màn hình nào hiện giá tham chiếu, nơi mỗi cấu trúc là một bài toán mô hình riêng, và nơi khách hàng trả phí để dealer gánh những rủi ro mà chính khách không biết cách hedge. Chương này đi qua bộ công cụ exotic cốt lõi của một equity desk: digital, barrier, Asian, autocallable, cliquet, basket/worst-of, và rủi ro dividend. Với mỗi loại tôi sẽ cho một ví dụ tính bằng số ra kết quả cụ thể, dẫn xuất công thức khi công thức đủ lớn, và quan trọng nhất là chỉ ra *dealer bị short cái gì* — vì đó mới là câu chuyện thật của exotic: không phải giá, mà là rủi ro tồn dư sau khi đã hedge hết những gì hedge được.

Bộ số vanilla tôi dùng xuyên suốt là bộ chuẩn của sách (đã gặp ở Chương 5): $S_0=100$, $K=100$, $r=5\%$, $\sigma=20\%$, $T=1$, no dividend, cho ra $d_1=0.35$, $d_2=0.15$, $N(d_1)=0.6368$, $N(d_2)=0.5596$, $\phi(d_1)=0.3752$, giá call $C=10.45$. Exotic dưới đây được neo vào chính bộ số này để bạn thấy chúng đắt/rẻ hơn vanilla ở đâu và vì sao. Một sợi chỉ đỏ chạy qua cả chương: mỗi khi ta thêm một feature vào payoff — một điểm nhảy, một cái rào, một phép trung bình, một underlying thứ hai — ta không chỉ đổi giá, ta sinh ra một *chiều rủi ro mới* mà thị trường vanilla không dạy dealer cách phòng hộ. Giá là phần dễ; rủi ro tồn dư là phần desk sống chết cùng.

## 8.1 Digital / binary: payoff bậc thang và cơn ác mộng pin risk

Digital call trả $1$ nếu $S_T>K$ và trả $0$ nếu không — một cú nhảy bậc thang tại strike. Đây là exotic đơn giản nhất về mặt payoff nhưng lại chứa mầm mống của mọi khó khăn exotic: một điểm bất liên tục trong payoff. Bất liên tục đó vô hại trên giấy nhưng chí mạng khi hedge, và toàn bộ mục này là câu chuyện về việc một điểm nhảy duy nhất đủ để đẻ ra một rủi ro không thể hedge sạch. Dưới measure risk-neutral $\mathbb{Q}$, giá là kỳ vọng chiết khấu của payoff, mà payoff chính là hàm chỉ thị $\mathbf{1}_{\{S_T>K\}}$, nên

$$V_{\text{dig}} = e^{-rT}\,\mathbb{E}^{\mathbb{Q}}\!\left[\mathbf{1}_{\{S_T>K\}}\right] = e^{-rT}\,\mathbb{Q}(S_T>K).$$

Trong mô hình Black-Scholes, $\ln S_T$ phân phối chuẩn với mean $\ln S_0+(r-q-\tfrac12\sigma^2)T$ và variance $\sigma^2 T$. Xác suất $S_T>K$ dưới $\mathbb{Q}$ chính là $N(d_2)$ — đúng cái $N(d_2)$ đã xuất hiện trong công thức call vanilla, nơi nó đóng vai "xác suất được thực thi". Để thấy vì sao là $N(d_2)$ chứ không phải $N(d_1)$: viết $S_T=S_0\exp\!\big((r-q-\tfrac12\sigma^2)T+\sigma\sqrt T\,Z\big)$ với $Z\sim N(0,1)$ dưới $\mathbb{Q}$; điều kiện $S_T>K$ tương đương $Z>-\big[\ln(S_0/K)+(r-q-\tfrac12\sigma^2)T\big]/(\sigma\sqrt T)=-d_2$, nên $\mathbb{Q}(S_T>K)=\mathbb{Q}(Z>-d_2)=N(d_2)$. Vậy digital call có công thức đọc thẳng từ Black-Scholes, không cần tích phân gì thêm:

$$V_{\text{dig}} = e^{-rT} N(d_2).$$

Với bộ số chuẩn, $d_2=0.15$, $N(0.15)=0.5596$, $e^{-0.05}=0.95123$, nên $V_{\text{dig}}=0.95123\times0.5596=0.5323$. Một digital call ATM 1Y trị giá khoảng 53.2 cent trên mỗi dollar payoff. Đọc con số: xác suất risk-neutral để index đóng cửa trên strike sau một năm là 56%, chiết khấu về hiện tại còn 53 cent. Con số hơi trên 50% vì drift risk-neutral $r-\tfrac12\sigma^2=0.03>0$ đẩy median của $\ln S_T$ lên trên $\ln K$ — một dịch chuyển nhỏ nhưng đủ để nghiêng cán cân về phía "vượt strike".

Digital cũng có thể xem như đạo hàm của call theo strike. Payoff call là $(S_T-K)^+$; lấy $-\partial/\partial K$ ta được $\mathbf{1}_{\{S_T>K\}}$ (đạo hàm của $(S_T-K)^+$ theo $K$ là $-\mathbf{1}_{\{S_T>K\}}$), đúng payoff digital. Vậy $V_{\text{dig}}=-\partial C/\partial K$. Đây không chỉ là trò đại số: nó cho ta cách hedge và định giá digital bằng call spread. Ý tưởng nền: một digital trả $1$ ngay khi vượt $K$; một call spread hẹp bao quanh $K$ có payoff dốc tuyến tính từ 0 lên 1 qua một dải strike, và khi dải co lại nó hội tụ về bậc thang. Cụ thể, call spread mua strike $K-\varepsilon$ bán strike $K+\varepsilon$ chuẩn hoá bằng $1/(2\varepsilon)$ có payoff $\tfrac{1}{2\varepsilon}\big[(S_T-K+\varepsilon)^+-(S_T-K-\varepsilon)^+\big]$, một cái dốc tuyến tính từ 0 (dưới $K-\varepsilon$) lên 1 (trên $K+\varepsilon$); cho $\varepsilon\to0$ nó chính là $-\partial C/\partial K$ theo định nghĩa đạo hàm. Nhưng đây chính là chỗ đau: **pin risk** — không ai hedge được bậc thang thật, chỉ hedge được cái dải hữu hạn, vì $\varepsilon\to0$ đòi mua/bán một lượng option $1/(2\varepsilon)\to\infty$ tại hai strike sát nhau.

Để thấy rõ, ta không hội tụ về digital mà cố tình **over-hedge**: mua một call strike $99$, bán một call strike $100$, notional $1$ mỗi chân (không chuẩn hoá $1/2\varepsilon$). Payoff của cấu trúc này là $0$ dưới $99$, dốc lên $1$ tại $100$, rồi phẳng $1$ trên $100$ — nó *bao trùm* payoff digital (luôn trả $\ge$ digital, vì digital trả $1$ ngay từ $100^+$ còn call spread đạt $1$ đúng tại $100$ và vượt digital trong khoảng $[99,100)$ nơi digital trả $0$ mà call spread đã trả dương). Ở bộ số chuẩn, Black-Scholes cho $C(99)=10.99$ và $C(100)=10.45$ (cùng $\sigma=20\%$), nên giá call spread $=10.99-10.45=0.542$. So với digital "thật" $0.532$: over-hedge đắt hơn digital $0.010$. Con số $0.010$ đó chính là **buffer** — dealer bán cho khách một digital nhưng book một call spread trả về $99$, và ăn chênh $\approx1$ cent làm phí gánh pin risk. Chênh này dương và *thật*, khác hẳn call spread đối xứng $[99,101]$ chuẩn hoá $1/2$ vốn cho đúng $0.5(C(99)-C(101))=0.5(10.99-9.93)=0.532$ = digital, tức buffer bằng 0 và không hedge nổi cú pin.

> **Vì sao không dùng call spread đối xứng?** Vì nó chỉ *xấp xỉ* digital chứ không *chặn trên* nó. Nếu spot pin đúng $K$ vào phút chót, call spread đối xứng có thể trả *ít hơn* digital (payoff của nó mới chạm $0.5$ tại $K$ trong khi digital đã bật lên $1$ ngay khi $S_T>K$), dealer thiếu tiền trả khách — đúng nghĩa bị thịt. Over-hedge một phía về $K$ đảm bảo dealer luôn dư, đổi lấy $1$ cent phí. Càng thu hẹp dải hedge, buffer càng teo về 0 nhưng gamma tại $K$ càng khổng lồ: gần đáo hạn, nếu spot sát strike, delta của digital nhảy từ gần 0 lên gần đầy trên một khoảng giá bé xíu, và nhà giao dịch không rebalance kịp. Một cú swing 50 cent của index qua strike vào phút chót đảo lộn toàn bộ P&L. Vì thế dealer bán digital luôn hedge bằng call spread có width thật (thường vài phần trăm strike), tính phí phần buffer đó, và ghi rõ với khách rằng giá "digital" thực chất là giá call spread — cái mà họ hedge được.

Digital cũng dạy một bài về skew mà vanilla giấu đi. Vì $V_{\text{dig}}=-\partial C/\partial K$, và $C$ phụ thuộc vào implied vol $\sigma(K)$ vốn thay đổi theo strike (skew, xem Chương 6), đạo hàm đầy đủ phải gồm cả số hạng chuyền qua smile. Chìa khoá: khi ta viết $C=C\big(K,\sigma(K)\big)$, đạo hàm *toàn phần* theo $K$ khác đạo hàm *riêng* — nó phải cộng thêm phần $\sigma$ đổi theo $K$:

$$V_{\text{dig}} = -\frac{dC}{dK} = -\underbrace{\frac{\partial C}{\partial K}}_{=\,e^{-rT}N(d_2)\text{ (phần phẳng)}} - \underbrace{\frac{\partial C}{\partial\sigma}\cdot\frac{\partial\sigma}{\partial K}}_{\text{số hạng skew}}.$$

Với equity skew điển hình $\partial\sigma/\partial K<0$ (vol giảm khi strike tăng), số hạng skew $-\text{vega}\cdot(\partial\sigma/\partial K)$ *dương*, nên nó *tăng* giá digital call so với công thức Black-Scholes phẳng. Định lượng: vega của call là $\partial C/\partial\sigma=S_0\phi(d_1)\sqrt T=100\times0.3752\times1=37.52$ (giá thay đổi khi vol dịch $1.00$, tức $0.3752$ mỗi vol-point). Lấy skew khiêm tốn $0.1$ vol-point tụt cho mỗi $1$ điểm strike tăng, tức $\partial\sigma/\partial K=-0.001$: số hạng skew $=-37.52\times(-0.001)=0.0375$. Digital dịch lên $\approx3.75$ cent, từ $0.532$ thành $0.570$ — một khác biệt $7\%$ giá chỉ do smile, không phải chuyện nhỏ. Một desk quote digital bằng $e^{-rT}N(d_2)$ với vol ATM phẳng sẽ underprice $\approx3.75$ cent và bị arbitrage ngay. Bài học: exotic nhạy với skew ngay cả khi payoff trông chẳng liên quan gì tới smile — và đây mới chỉ là exotic đơn giản nhất.

## 8.2 Barrier: reflection principle và nghệ thuật làm rẻ option

Barrier option là exotic được giao dịch nhiều nhất trên equity và FX, vì lý do rất đời: chúng *rẻ hơn* vanilla, và khách hàng thích rẻ. Một down-and-out call giống hệt call thường, chỉ khác là nếu spot chạm rào $B$ (đặt dưới spot hiện tại) tại bất kỳ thời điểm nào trước đáo hạn thì option "chết" — knock out, giá trị về 0. Khách hàng nghĩ index sẽ không rơi tới $B$, nên họ vui vẻ từ bỏ những kịch bản mà index sụp sâu rồi bật lại; đổi lại họ trả phí thấp hơn. Dealer cấu trúc được cái rẻ đó vì phần payoff bị cắt bỏ có giá trị dương, và họ trả lại phần lớn giá trị đó qua giá.

### Reflection principle: vì sao có công thức đóng

Công thức analytic cho down-and-out call trong Black-Scholes ra đời từ **reflection principle** của Brownian motion, và đáng dẫn xuất trực giác cho tường tận vì nó là mảnh toán đẹp nhất của cả chương. Chuyển sang biến log $X_t=\ln S_t$, dưới $\mathbb{Q}$ ta có $X_t=X_0+\mu t+\sigma W_t$ với $\mu=r-q-\tfrac12\sigma^2$; rào $S=H$ thành mức $\ln H$ trên thang $X$. Bắt đầu với trường hợp *không drift* ($\mu=0$): với một Brownian $W$ xuất phát trên rào, mỗi path chạm mức $\ln H$ rồi kết thúc tại $x$ được ghép một-một với path "phản chiếu qua rào" kết thúc tại điểm đối xứng $2\ln H-x$. Vì phản chiếu bảo toàn xác suất (Brownian không drift đối xứng), mật độ của các path *đã chạm rào và* kết thúc tại $x$ đúng bằng mật độ của các path kết thúc tại điểm ảnh $2\ln H-x$. Do đó density của các path *sống sót* (chưa chạm rào, kết thúc tại $x$) là density gốc trừ đi density tại điểm ảnh — đó là toàn bộ ý của reflection principle: trừ đi "bóng ma" phản chiếu qua rào.

Với Brownian *có* drift $\mu\ne0$, phản chiếu không còn bảo toàn xác suất trần trụi, vì path phản chiếu chạy ngược chiều drift; ta phải nhân một hệ số Girsanov để hiệu chỉnh — chính là số hạng mũ $(H/S_0)^{2\mu/\sigma^2}$ xuất hiện dưới đây. Đại số đầy đủ hơi rối, nhưng kết quả gọn gàng. Đặt $H=B$ là rào, giả thiết $S_0>H$ và $K>H$ (rào nằm dưới cả spot lẫn strike — trường hợp phổ biến nhất), thì giá down-and-out call là

$$C_{\text{do}} = C_{\text{BS}}(S_0,K) - \left(\frac{H}{S_0}\right)^{2\lambda}\,C_{\text{BS}}\!\left(\frac{H^2}{S_0},K\right),\qquad \lambda=\frac{r-q+\tfrac12\sigma^2}{\sigma^2}.$$

Đọc công thức này như một câu chuyện. Số hạng đầu là call vanilla thường. Số hạng thứ hai trừ đi phần giá trị thuộc về những path đã đâm xuống rào — và nó được biểu diễn bằng một call vanilla khác định giá tại "spot ảnh" $H^2/S_0$ (chính là ảnh phản chiếu của $S_0$ qua rào theo thang log, vì $\ln(H^2/S_0)=2\ln H-\ln S_0$ đối xứng với $\ln S_0$ qua $\ln H$), nhân với hệ số drift $(H/S_0)^{2\lambda}$. Reflection principle bằng xương bằng thịt: option ma tại spot ảnh chính là những kịch bản knock, và ta trừ chúng đi.

### Tính bằng số

Đặt rào $H=90$, giữ $K=100$ và bộ số chuẩn. Ta tính từng mảnh.

*Hệ số drift.* $\lambda=(0.05-0+\tfrac12\cdot0.04)/0.04=(0.05+0.02)/0.04=1.75$, nên $2\lambda=3.5$. Hệ số $(H/S_0)^{2\lambda}=(0.9)^{3.5}$: lấy $\ln 0.9=-0.10536$, nhân $3.5$ được $-0.36876$, và $e^{-0.36876}=0.6916$.

*Spot ảnh.* $H^2/S_0=8100/100=81$ — index bị "lật" qua rào 90 xuống 81.

*Call ma tại spot ảnh.* Cần $C_{\text{BS}}(81,100)$: một call deep OTM với spot 81, strike 100. Tính $d_1=[\ln(81/100)+(0.05+0.02)\cdot1]/0.2=[-0.21072+0.07]/0.2=-0.7036$, và $d_2=d_1-0.2=-0.9036$. Tra chuẩn: $N(-0.7036)=0.24084$, $N(-0.9036)=0.18310$. Giá

$$C_{\text{BS}}(81,100)=81\cdot0.24084-100\cdot e^{-0.05}\cdot0.18310=19.508-17.417=2.091.$$

(Chú ý: đừng làm tròn $N(d_2)$ xuống $0.1832$ giữa chừng — sai số nhỏ đó đủ đẩy kết quả lệch một cent.) Ghép lại:

$$C_{\text{do}}=10.45-0.6916\times2.091=10.45-1.446=9.00.$$

Down-and-out call với rào 90 đáng khoảng $9.00$, so với vanilla $10.45$ — rẻ hơn $1.45$, tức khoảng 14%. Đọc ý nghĩa: khách hàng bỏ ra $9.00$ thay vì $10.45$, đánh cược rằng index sẽ không thủng 90; nếu họ đúng, họ nhận đúng payoff call với chi phí thấp hơn. Phần $1.45$ chính là giá trị của những path mà index rơi xuống 90 (giết option) nhưng lẽ ra có thể bật lại trên 100 khi đáo hạn — dealer giữ lại rủi ro đó và trả khách một mức phí thấp hơn để bù.

Knock-in là mảnh còn lại: down-and-in call chỉ *sống dậy* khi rào bị chạm. Có một quan hệ parity đẹp và không thể chối cãi: một down-and-out cộng một down-and-in với cùng rào, cùng strike, bằng đúng một vanilla, vì mọi path hoặc chạm rào (kích hoạt in, giết out) hoặc không chạm (giết in, giữ out) — không có path nào rơi vào cả hai hay không cái nào. Vậy $C_{\text{di}}=C_{\text{BS}}-C_{\text{do}}=10.45-9.00=1.45$. Con số $1.45$ tái xuất, lần này với tư cách giá của chính cái knock-in — nó chính là giá trị của mớ path đã đâm rào. Parity này còn là công cụ kiểm tra desk: bất kỳ engine barrier nào cũng phải thoả in $+$ out $=$ vanilla đến từng cent, nếu không là có bug.

### Cạm bẫy thực chiến

Cạm bẫy của barrier nằm ở gamma quanh rào gần đáo hạn — họ hàng ruột thịt của pin risk. Khi spot lảng vảng ngay trên rào và thời gian còn lại ít, delta của knock-out biến động dữ dội: chạm rào một chút là mất sạch giá trị, nên nhà giao dịch phải bán ra rất nhiều delta khi spot tiến gần rào và mua lại khi spot lùi ra — một cú "gamma âm khổng lồ" cục bộ tại rào. Đây là lý do desk hay đặt **barrier shift**: hedge như thể rào ở mức bảo thủ hơn một chút (ví dụ rào thật 90 nhưng risk-manage như rào 89.5), nuốt phần chênh làm dự phòng cho **gap risk** — rủi ro index nhảy qua rào trong một cú giật không kịp trade. Và như digital, barrier cực nhạy với skew: giá trị của nó phụ thuộc vào toàn bộ đường dẫn spot xuống rào, tức phụ thuộc vào vol tại các strike thấp — đúng vùng skew equity dốc nhất. Định giá barrier bằng vol phẳng là sai một cách hệ thống; industry định giá bằng local vol hoặc stochastic-local vol (tầng `models/equity/slv` trong repo), điều tôi quay lại ở §8.4 và §8.8.

## 8.3 Asian: trung bình làm dịu vol, và mẹo control variate

Asian option trả payoff dựa trên *trung bình* của spot trên một cửa sổ thời gian, chứ không phải spot cuối. Chúng phổ biến ở nơi người mua muốn hedge một dòng tiền trải dài (một hãng hàng không mua nhiên liệu đều đặn cả năm) hoặc muốn chống thao túng giá đóng cửa ngày đáo hạn. Điểm mấu chốt định giá: trung bình có variance nhỏ hơn giá trị cuối, nên Asian rẻ hơn vanilla tương ứng — averaging bào mòn vol. Nhưng cái làm Asian đáng một mục riêng không phải giá; đó là chỗ nó buộc ta gặp một trong những kỹ thuật số đẹp nhất của quant: control variate.

Có hai loại trung bình, và chúng khác nhau về mặt toán một trời một vực. Trung bình *geometric* của các quan sát log-normal vẫn là log-normal (tổng của các biến chuẩn vẫn chuẩn), nên geometric Asian có công thức closed-form kiểu Black-Scholes: chỉ cần thay $\sigma$ và drift bằng vol và drift "hiệu dụng" của trung bình geometric. Trung bình *arithmetic* thì không — và chính khoảng cách giữa hai loại này là nơi mẹo hay nằm.

### Dẫn xuất và tính bằng số cho geometric Asian call

Với averaging liên tục trên $[0,T]$, trung bình geometric $G=\exp\!\big(\tfrac1T\int_0^T\ln S_t\,dt\big)$ vẫn log-normal, vì $\tfrac1T\int_0^T\ln S_t\,dt$ là trung bình của một Gaussian process nên bản thân nó Gaussian. Hai tham số hiệu dụng (kết quả Kemna–Vorst) — vol chia $\sqrt3$ và một cost-of-carry hiệu chỉnh:

$$\sigma_G=\frac{\sigma}{\sqrt3},\qquad b=\frac12\!\left(r-q-\frac{\sigma^2}{6}\right)\ \text{(cost-of-carry hiệu dụng)}.$$

Vì sao $\sigma/\sqrt3$? Variance của $\tfrac1T\int_0^T W_t\,dt$ tính ra bằng $\tfrac1{T^2}\int_0^T\!\int_0^T\min(s,t)\,ds\,dt=T/3$, nên vol của trung bình là $\sigma\sqrt{T/3}/\sqrt T=\sigma/\sqrt3$ — averaging cắt vol xuống còn $1/\sqrt3\approx0.577$ lần. Cắm số: $\sigma_G=0.20/\sqrt3=0.1155$, tức $11.5\%$. Drift hiệu dụng $b=\tfrac12(0.05-0-0.04/6)=\tfrac12(0.05-0.00667)=0.02167$. Giờ đút vào công thức Black-Scholes tổng quát (Black–Scholes–Merton với cost-of-carry $b$):

$$d_1=\frac{\ln(S_0/K)+(b+\tfrac12\sigma_G^2)T}{\sigma_G\sqrt T}=\frac{0+(0.02167+0.00667)}{0.1155}=0.2454,\qquad d_2=d_1-\sigma_G\sqrt T=0.1299.$$

Tra chuẩn: $N(0.2454)=0.5969$, $N(0.1299)=0.5517$. Giá:

$$C_{\text{geo}}=S_0e^{(b-r)T}N(d_1)-Ke^{-rT}N(d_2)=100\cdot0.97206\cdot0.5969-100\cdot0.95123\cdot0.5517=58.02-52.48=5.55.$$

Vậy geometric Asian call liên tục $=5.55$, so với vanilla $10.45$ — averaging làm option rẻ gần một nửa (tỷ lệ $5.55/10.45\approx0.53$). Đó là toàn bộ trực giác Asian trong một con số dẫn xuất đầy đủ: vol thấp hơn $\Rightarrow$ optionality ít hơn $\Rightarrow$ giá rẻ hơn.

Thực tế thị trường monitoring *rời rạc* (hàng ngày, hàng tháng), không liên tục. Với monitoring hàng tháng $n=12$ tại các thời điểm $t_i=iT/n$, ta không dùng $\sigma/\sqrt3$ nữa mà tính chính xác variance của $\ln G=\tfrac1n\sum_i\ln S_{t_i}$ từ ma trận hiệp phương sai của Brownian ($\operatorname{cov}(W_{t_i},W_{t_j})=\min(t_i,t_j)$). Kết quả cho vol hiệu dụng rời rạc $\sigma_G^{\text{disc}}=0.1227$ (hơi cao hơn $0.1155$ vì rời rạc mất bớt hiệu ứng làm mượt của trung bình liên tục), và giá geometric closed-form rời rạc $V_{\text{geo,exact}}=5.94$. Con số $5.94$ này tôi tái dùng ngay dưới làm **control variate** — nó là mỏ neo chính xác để thuần hoá Monte Carlo của bản arithmetic.

### Vì sao arithmetic phải mô phỏng, và control variate cứu ta

Thị trường thực ra giao dịch *arithmetic* Asian (trung bình cộng thường), và trung bình cộng của các log-normal thì *không* còn log-normal — tổng các biến log-normal không có phân phối đóng. Không có công thức closed-form. Ta phải mô phỏng Monte Carlo. Và đây là chỗ một mẹo variance-reduction kinh điển toả sáng: **control variate**. Ý tưởng: geometric Asian có công thức đúng và tương quan rất chặt với arithmetic Asian (hai trung bình gần như dính nhau trên từng path, vì với vol vừa phải trung bình cộng và trung bình nhân của cùng một chuỗi giá rất sát nhau). Trong mô phỏng MC, ta ước lượng arithmetic Asian nhưng "chỉnh" mỗi mẫu bằng sai số đã biết của geometric Asian trên cùng path đó:

$$\hat{V}_{\text{arith}} = \bar{V}_{\text{arith,MC}} - \beta\left(\bar{V}_{\text{geo,MC}} - V_{\text{geo,exact}}\right),$$

với $\beta$ chọn tối ưu quanh 1. Trực giác: nếu trên tập path này geometric MC lỡ cho ra cao hơn giá trị đúng $5.94$ của nó, thì nhiều khả năng arithmetic MC cũng bị đẩy cao theo (chúng tương quan chặt), nên ta trừ bớt phần lệch đó khỏi arithmetic. Vì ta *biết chính xác* geometric đáng bao nhiêu, ta biết chính xác phải trừ bao nhiêu; phần nhiễu chung giữa hai ước lượng bị triệt tiêu gần sạch.

### Tính bằng số cho control variate

Mô phỏng $20{,}000$ path GBM với monitoring hàng tháng ($n=12$), bộ số chuẩn, $K=100$. Giá geometric closed-form (discrete monthly) $V_{\text{geo,exact}}=5.94$. Kết quả (trung bình trên nhiều lượt seed để con số ổn định):

| Ước lượng | Giá MC | Standard error |
|---|---|---|
| Arithmetic MC thô | $6.15$ | $0.060$ |
| Arithmetic MC + control variate ($\beta=1.03$) | $6.16$ | $0.0017$ |

Standard error tụt từ $0.060$ xuống $0.0017$ — **giảm ~36 lần** với đúng cùng số path. Vì variance của ước lượng MC tỷ lệ nghịch với số path, đạt cùng độ chính xác mà không dùng control variate sẽ đòi $36^2\approx1300$ lần nhiều path hơn. Nói cách khác, control variate biến $20{,}000$ path thành hiệu quả tương đương ~$26$ triệu path thô. Sức mạnh này đến từ tương quan geometric–arithmetic $=0.9996$ trên bộ số này — hai trung bình gần như trùng khít trên từng path, nên phần lớn nhiễu MC của arithmetic được geometric "bắt chước" và ta trừ đi gần sạch vì biết chính xác answer của geometric. Đây là một trong những control variate hiệu quả nhất tồn tại trong toàn bộ định giá phái sinh. (Chú ý con số arithmetic $\approx6.15$ chỉ hội tụ đến độ chính xác của bản thô; giá trị "đúng" mà bản control-variate chốt là $\approx6.16$, và chính vì bản thô mờ mịt còn bản CV sắc nét mà ta dùng CV.) Repo gói cả hai (`engines/exotics` cho analytic geometric và MC arithmetic, `numerics` variance-reduction cho phần control variate); ý tưởng cần khắc cốt là: khi bạn có một phiên bản gần-đúng-nhưng-giải-được của bài toán không giải được, hãy dùng nó làm control variate.

## 8.4 Autocallable: cỗ máy in tiền của desk và cơn đau đầu hedge

Autocallable là sản phẩm structured bán lẻ và private-bank quan trọng nhất trên thế giới equity derivatives — hàng trăm tỷ dollar notional được phát hành mỗi năm, và nó vừa là động cơ P&L lớn nhất vừa là nguồn rủi ro khó thuần hoá nhất của một equity exotic desk. Nó xứng đáng một walkthrough đầy đủ, vì gần như mọi chiều rủi ro exotic của cả chương đều hội tụ vào đúng sản phẩm này.

### Cấu trúc

Hình dung một autocallable 3 năm gắn vào một index, ví dụ EuroStoxx 50, spot khởi điểm $S_0=100$ (chuẩn hoá). Sản phẩm có các *ngày quan sát* hằng năm: cuối năm 1, năm 2, năm 3. Ba mức rào quan trọng: **autocall barrier** (thường ở $100\%$, tức bằng spot khởi điểm), **coupon barrier** (ví dụ $70\%$), và **knock-in barrier** ở dưới đáy (ví dụ $60\%$). Cơ chế:

Tại mỗi ngày quan sát, nếu index $\ge$ autocall barrier ($100$), sản phẩm *tự động tất toán ngay*: nhà đầu tư nhận lại full vốn cộng một coupon cao (giả sử $8\%$/năm, tích luỹ). Đây là cái "auto-call". Nếu index dưới autocall barrier, sản phẩm sống tiếp; nhà đầu tư có thể vẫn nhận coupon nếu index trên coupon barrier ($70$) — đây là loại "memory coupon" phổ biến, coupon bị nhớ và trả bù sau. Đến ngày đáo hạn cuối, nếu chưa autocall: nếu index chưa bao giờ (hoặc tại đáo hạn không) thủng knock-in barrier ($60$), nhà đầu tư vẫn được hoàn vốn; nhưng nếu index đã thủng knock-in và đang dưới $100$, nhà đầu tư *gánh trọn downside* — nhận lại vốn nhân với $S_T/S_0$, mất tương ứng với mức sụt của index.

Bản chất kinh tế: nhà đầu tư đang *bán một put down-and-in* cho dealer để đổi lấy coupon cao. Họ nhận coupon "khủng" $8\%$ trong môi trường lãi suất $5\%$ — cái $3\%$ thừa đó chính là phí bảo hiểm họ thu về từ việc bán rủi ro đuôi. Nếu index cứ lình xình quanh mức khởi điểm, họ sớm được autocall và bỏ túi coupon: kịch bản thắng đẹp. Nếu index sụp thảm (thủng $60$), họ ăn trọn cú sập như thể nắm giữ index trực tiếp. Autocallable là "yield enhancement": đổi một cái đuôi trái để lấy carry.

### Vì sao dealer short vega, short skew, long correlation/dividend

Đứng phía dealer (người mua cái put down-and-in đó, tức bên kia của nhà đầu tư), ta phân rã rủi ro. Dealer đã bán coupon và giữ quyền autocall; để phòng hộ, họ phải hiểu book của mình nhạy với cái gì.

**Short vega.** Khi vol tăng, xác suất index vọt lên chạm autocall barrier sớm giảm đi (path lang thang rộng hơn, kém "hướng lên đều"), *và* xác suất đuôi trái thủng knock-in tăng. Cả hai đều xấu cho nhà đầu tư và tốt cho dealer về mặt payoff — nhưng dealer đã *bán* sản phẩm ở một mức giá phản ánh vol thấp hơn thực tế xảy ra, nên khi vol tăng, giá trị nợ của dealer với khách hàng tăng: dealer *short vega*. Nôm na: dealer đã bán optionality, mọi option seller đều short vega.

**Short skew.** Cái put down-and-in nằm sâu dưới tiền (rào $60$), nên giá trị của nó bị chi phối bởi vol tại strike thấp — đúng vùng skew equity dốc nhất. Chiều rủi ro dễ hiểu nhầm, nên viết cho thẳng: dealer đã *mua* cái put down-and-in từ nhà đầu tư (trả coupon để nhận nó), nhưng để phòng hộ delta/vega của cái put đó, dealer phải *bán* skew ra thị trường vanilla — tức bán OTM put để trung hoà exposure. Vậy về ròng, book autocallable *short skew*: khi skew steepen (put OTM đắt lên so với ATM), cái skew mà dealer đã bán tăng giá phải mua lại đắt, book lỗ. Tệ ở chỗ skew thường steepen *đúng lúc thị trường rớt* — nên book autocallable lỗ đúng lúc thị trường hoảng loạn. Đây là rủi ro thứ nhất khiến autocallable book nguy hiểm.

**Long correlation và long dividend.** Autocallable thường viết trên *rổ* hoặc trên single index; với single index, "correlation" hiện ra gián tiếp qua cách index cấu thành, nhưng với autocallable trên worst-of nhiều underlying (rất phổ biến ở châu Á), dealer *long correlation*: khi tương quan giữa các underlying tăng, worst-of behave giống một underlying đơn, đuôi trái bớt xấu, giá trị nợ của dealer giảm — tốt cho dealer, nên họ long corr (xem §8.6 cho con số cụ thể). Và **long dividend**: autocallable có kỳ hạn dài (2–5 năm) và tính chất giống long forward exposure ở nhiều kịch bản; forward $F=S_0e^{(r-q)T}$ giảm khi dividend yield $q$ tăng, dịch chuyển phân phối terminal xuống dưới, làm autocall khó xảy ra hơn và knock-in dễ hơn. Dealer đã định giá với một dividend forecast; nếu dividend thực *cắt* (giảm $q$), forward lên, autocall dễ hơn, tốt cho dealer — nên dealer *long dividend* theo nghĩa hưởng lợi khi dividend giảm bất ngờ. Trong khủng hoảng 2020 khi các công ty châu Âu đồng loạt cắt cổ tức, các autocallable desk lỗ nặng đúng vì họ long dividend và dividend *tăng kỳ vọng bị cắt* đảo chiều bất lợi — đây là một case study kinh điển của dividend risk mà tôi quay lại ở §8.7.

### Mô phỏng Monte Carlo minh hoạ cashflow

Để thấy máy chạy, ta đi qua vài path cụ thể. Giữ mô hình đơn giản (GBM risk-neutral, $r=5\%$, $q=2\%$, $\sigma=20\%$, ba ngày quan sát cuối mỗi năm), coupon $8\%$ nhớ được, autocall barrier $100$, coupon barrier $70$, knock-in $60$. Vốn danh nghĩa $100$. Hai path dưới đây là **path minh hoạ được đặt tay** để thấy cơ chế cashflow, không phải kết quả sampling từ GBM thật — trong định giá thật ta bình quân hàng chục nghìn path draw đúng từ mô hình.

**Path A — autocall năm 1.** Giả sử index đi từ $100$ lên $S_1=108$ tại cuối năm 1. Vì $108\ge100$, sản phẩm autocall ngay: nhà đầu tư nhận lại vốn $100$ cộng coupon năm 1 là $8$, tổng $108$, và sản phẩm chấm dứt. Dòng tiền dealer: trả $108$ tại $t=1$, chiết khấu về $108\cdot e^{-0.05}=102.73$. Đây là kịch bản thường gặp nhất (với autocall barrier ở $100$ và drift dương, xác suất autocall năm 1 cỡ 50–55%), và là kịch bản dealer thích: nợ được giải phóng sớm, coupon trả ra khiêm tốn.

**Path B — sống sót rồi knock-in cuối.** Giả sử $S_1=88$ (dưới autocall $100$ nhưng trên coupon barrier $70$): không autocall, nhà đầu tư *được* coupon năm 1 là $8$ trả tại $t=1$. Năm 2: $S_2=76$ (vẫn dưới $100$, trên $70$): không autocall, nhận coupon năm 2 là $8$ tại $t=2$. Trong năm 3 index rơi sâu chạm $58<60$ (knock-in bị kích hoạt), rồi hồi lên đóng cửa $S_3=82$ tại $t=3$. Vì đã thủng knock-in *và* $S_3=82<100$, nhà đầu tư gánh downside: nhận vốn theo tỷ lệ $100\cdot(82/100)=82$ tại $t=3$, cộng coupon năm 3 (giả sử coupon vẫn trả khi trên coupon barrier tại quan sát — ở đây $82>70$ nên $+8$). Tổng nhà đầu tư nhận theo thời gian: $8$ (t=1) $+8$ (t=2) $+90$ (t=3, gồm $82$ vốn suy giảm và $8$ coupon). Chiết khấu: $8e^{-0.05}+8e^{-0.10}+90e^{-0.15}=7.61+7.24+77.46=92.31$. Nhà đầu tư nhận về hiện giá $92.31$ trên vốn $100$ — họ *lỗ* vì cái knock-in đã ăn vào vốn, dù đã gom được coupon dọc đường. Đây là kịch bản dealer *thắng* trên vốn nhưng chú ý: cú thủng knock-in xảy ra trong đợt bán tháo, đúng lúc dealer đang chật vật hedge trên toàn book — thắng trên một path không đền được nỗi đau hedge tập thể.

Hai path này minh hoạ vì sao phân phối payoff autocallable *lệch trái nặng*: phần lớn thời gian autocall sớm, coupon nhỏ, dealer nhẹ nhõm; nhưng cái đuôi trái (knock-in trong bán tháo) mang toàn bộ rủi ro, và nó tương quan hoàn hảo với đúng lúc thị trường tệ nhất.

### Vì sao hedge autocallable book là nguồn đau đầu không lỗ

Điều khiến autocallable trở thành huyền thoại về độ khó không phải một sản phẩm đơn lẻ mà là *book* — hàng nghìn autocallable với các ngày quan sát rải khắp lịch, được bán ra liên tục. Vấn đề cốt lõi: khi nhiều autocallable cùng có autocall barrier gần spot hiện tại và cùng ngày quan sát tới gần, chúng tạo ra một *khối gamma và vega khổng lồ tập trung tại một mức giá và một ngày*. Ngay trước ngày quan sát, nếu spot lảng vảng quanh autocall barrier, một cú nhích nhỏ của index quyết định cả một tập autocallable có tất toán hay không — nghĩa là delta của book nhảy dữ dội (giống pin risk của digital ở §8.1 nhưng nhân lên quy mô cả book). Dealer phải trade một lượng lớn futures/spot để giữ delta-neutral, và chính hoạt động hedge đó đẩy giá — một vòng lặp phản hồi.

Tệ hơn, book autocallable là *short vega* và *short skew* một cách cấu trúc; để hedge, dealer phải *mua* vega và skew, tức mua option OTM put — nhưng vì cả industry cùng short skew qua autocallable, tất cả cùng phải mua put phòng hộ đúng lúc thị trường rớt, đẩy skew steepen thêm, làm book lỗ thêm, buộc mua thêm — một dynamic phản xạ khiến vol/skew của thị trường bị chính dòng hedge autocallable bẻ cong. Những cú giật skew ở Nhật/Hàn/châu Âu nhiều lần bắt nguồn từ dòng hedge autocallable đồng pha. Và đây chưa kể **forward vega/vol risk** (autocallable nhạy với vol *trong tương lai* giữa các ngày quan sát, không chỉ vol hôm nay — họ hàng với cliquet ở §8.5), **dividend risk** (§8.7), và **rate risk** trên kỳ hạn dài. Không mô hình đơn lẻ nào bắt trọn các rủi ro chéo này; đây chính xác là lý do industry chuyển sang stochastic-local vol (`models/equity/slv`): local vol khớp smile hôm nay nhưng cho forward vol sai (giết định giá cliquet-like), pure stochastic vol cho forward vol hợp lý nhưng không khớp smile hôm nay; SLV lai ghép để khớp cả smile hôm nay *lẫn* dynamics forward — đúng thứ autocallable đòi hỏi.

## 8.5 Cliquet / forward-start: trực giác forward vol

Cliquet (ratchet) là chuỗi các forward-start option nối đuôi. Một forward-start call có strike *chưa* được ấn định ở hôm nay mà sẽ được set bằng spot tại một thời điểm tương lai $t_1$; ví dụ "ATM tại $t_1$", rồi đáo hạn tại $t_2$. Cliquet nối nhiều đoạn như vậy: mỗi kỳ (quý, năm) reset strike về ATM hiện thời và tích luỹ return của kỳ đó, thường có cap/floor mỗi kỳ. Nhà đầu tư mua cliquet để "khoá lãi" từng kỳ mà không lo strike bị định sai từ đầu.

Trực giác định giá nằm gọn trong một khái niệm: forward-start option *không* nhạy với vol spot-to-$t_1$, mà nhạy với **forward vol** — vol kỳ vọng cho đoạn $[t_1,t_2]$ nhìn từ hôm nay. Vì sao? Tại $t_1$ strike được set bằng $S_{t_1}$, nên option lúc đó là một ATM option "mới toanh" có giá tỷ lệ với $S_{t_1}$ và với vol của đoạn còn lại $[t_1,t_2]$. Giá hôm nay là kỳ vọng chiết khấu của cái đó; trong kỳ vọng risk-neutral, $S_{t_1}$ chỉ đóng góp qua forward của nó (một hằng số nhân), còn *độ lớn* của option ATM tương lai được quyết định bởi vol của tương lai — không phải vol từ nay đến $t_1$.

**Tính bằng số.** Xét forward-start ATM call cho đoạn $[1,2]$ (bắt đầu sau một năm, đáo hạn sau hai năm, tenor $1$ năm), $r=5\%$, $q=0$. Tại $t_1=1$ option trở thành một ATM call kỳ hạn $1$ năm trên spot $S_{t_1}$, định giá bằng **forward vol 1Y1Y**. Vì cấu trúc chuẩn hoá theo $S_{t_1}$, giá trị tại reset là một *phần trăm cố định* của $S_{t_1}$: chạy Black-Scholes cho call ATM $1$ năm ($S=1,K=1,r=5\%,q=0$) với vol khác nhau, ta được

| Forward vol 1Y1Y | Giá call ATM tại reset (% của $S_{t_1}$) |
|---|---|
| $20\%$ | $10.45\%$ |
| $25\%$ | $12.34\%$ |

Với forward vol $20\%$ (bằng spot vol), giá forward-start bằng $10.45\%$ của $S_{t_1}$ — đúng bằng giá call ATM 1Y chuẩn của sách, chuẩn hoá về spot lúc reset. Nhưng đẩy forward vol lên $25\%$, giá vọt lên $12.34\%$ của $S_{t_1}$ — cùng một payoff, cùng spot vol hôm nay, mà giá lệch gần $2$ điểm phần trăm chỉ vì kỳ vọng vol *tương lai* khác. Con số này chốt trực giác: forward vol *là* trục rủi ro của forward-start/cliquet, không phải spot vol.

Cạm bẫy chí mạng: hai vol surface khác nhau có thể khớp *y hệt* mọi vanilla hôm nay (cùng implied vol tại mọi strike/maturity) nhưng cho forward vol khác nhau, do đó cho giá cliquet khác nhau — đúng như bảng trên cho thấy $2$ điểm chênh giá. Local vol model là ví dụ điển hình sai lầm: nó khớp toàn bộ smile hôm nay nhưng có forward smile "phẳng dần và trôi" một cách phi thực tế, làm underprice cliquet một cách hệ thống. Đây là lý do cliquet là sản phẩm "hạng nặng" đòi stochastic vol hoặc SLV: chúng test đúng cái mà vanilla không test được — dynamics của smile theo thời gian. Autocallable share đúng nhược điểm này (§8.4), nên hai sản phẩm sống chung một mô hình và cùng chết nếu mô hình sai forward vol.

## 8.6 Basket / worst-of: correlation là nhân vật chính

Basket option viết trên rổ nhiều underlying (payoff dựa trên trung bình có trọng số của rổ); worst-of trả payoff dựa trên underlying *tệ nhất* trong rổ. Nhân vật trung tâm là **correlation** — và đây là chỗ định giá multi-asset khác về chất so với single-asset: ta thêm một tham số mà thị trường gần như không cho ta hedge cụ.

### Basket: correlation nén vol của rổ

Với basket, vol của rổ phụ thuộc correlation qua công thức variance của tổng có trọng số. Xét rổ hai underlying trọng số bằng nhau, mỗi cái vol $\sigma=20\%$, correlation $\rho$. Vol của basket

$$\sigma_B=\sqrt{w_1^2\sigma^2+w_2^2\sigma^2+2w_1w_2\rho\sigma^2},\qquad w_1=w_2=0.5.$$

Nếu $\rho=1$: $\sigma_B=\sqrt{0.25\cdot0.04+0.25\cdot0.04+2\cdot0.25\cdot0.04}=\sqrt{0.04}=0.20$ — hai cái dính nhau thì rổ vol bằng đúng vol thành phần. Nếu $\rho=0$: $\sigma_B=\sqrt{0.01+0.01+0}=\sqrt{0.02}=0.1414$ — độc lập thì diversification cắt vol xuống còn $14\%$. Nếu $\rho=0.5$: $\sigma_B=\sqrt{0.02+0.5\cdot0.02}=\sqrt{0.03}=0.1732$. Vậy một basket call *rẻ hơn* khi correlation thấp (vol rổ thấp) — người mua basket call là *long correlation* (giá tăng theo $\rho$), người bán *short correlation*.

### Worst-of: ngược chiều và cực đoan hơn

Worst-of ngược lại và cực đoan hơn. Payoff phụ thuộc underlying kém nhất, nên nó nhạy đuôi trái của phân phối joint. Khi correlation *thấp*, xác suất ít nhất một underlying rớt sâu tăng vọt (chúng bò tứ tán), làm "cái tệ nhất" tệ hơn — worst-of put đắt lên, worst-of call rẻ đi khi corr thấp. Vậy người mua một note worst-of (giống autocallable worst-of ở §8.4) đang bán correlation cho dealer; dealer *long correlation*.

**Tính bằng số.** Với worst-of call trên hai underlying, mỗi cái $S_0=100$, $K=100$, $\sigma=20\%$, $r=5\%$, $q=0$, $T=1$, payoff $(\min(S_T^{(1)},S_T^{(2)})-K)^+$, ta có công thức closed-form (Stulz 1982 cho option trên min/max của hai tài sản, dùng bivariate normal CDF), và kiểm chứng lại bằng Monte Carlo 2 triệu path — hai cách trùng khớp:

| Correlation $\rho$ | Giá worst-of call |
|---|---|
| $0.3$ | $4.46$ |
| $0.5$ | $5.38$ |
| $0.9$ | $8.18$ |
| (single-underlying vanilla đối chiếu) | $10.45$ |

Chênh lệch mênh mông: từ $\rho=0.3$ lên $\rho=0.9$, giá gần như gấp đôi ($4.46\to8.18$, tỷ lệ $1.83$). Với $\rho$ thấp cái "min" của hai path bị kéo xuống mạnh (hai underlying phân kỳ, xác suất ít nhất một cái rớt dưới strike cao), nên worst-of call rẻ hẳn; với $\rho$ cao chúng đi cùng nhau nên "min" gần với một underlying đơn, worst-of call tiến về giá vanilla $10.45$ (ở $\rho=0.99$ nó đã lên tới $\approx9.73$, sát vanilla). Đây là lý do autocallable worst-of trả coupon *cao hơn* autocallable single-index: nhà đầu tư nhận bù cho việc bán thêm correlation risk — và độ dốc của giá theo $\rho$ ở bảng trên chính là cái correlation-delta mà dealer phải hedge.

Cạm bẫy: correlation không quan sát trực tiếp và không ổn định — nó *tăng vọt lên gần 1 đúng lúc thị trường sụp* (mọi thứ rớt cùng nhau). Dealer long correlation trên worst-of book vì thế được cứu một phần trong khủng hoảng (corr tăng, worst-of behave đỡ hơn), nhưng correlation lại chính là tham số khó calibrate và khó hedge nhất — không có "correlation swap" thanh khoản để phòng hộ sạch, nên phần lớn correlation risk bị giữ lại như basis risk trên book. Multi-asset exotic vì thế là mảng lợi nhuận cao/rủi ro-mô-hình cao bậc nhất của desk: mỗi underlying thêm vào không cộng tuyến tính vào độ khó mà nhân nó lên qua ma trận correlation.

## 8.7 Dividend risk: rủi ro nhàm chán giết những cái đầu

Dividend là tham số ít được nói tới nhất nhưng đã thổi bay nhiều P&L exotic hơn hầu hết mọi thứ khác. Trong Black-Scholes ta gói dividend vào yield $q$ và forward $F=S_0e^{(r-q)T}$; với vanilla ngắn hạn, sai số dividend nhỏ và ai cũng lơ nó. Nhưng exotic dài hạn — autocallable 5 năm, cliquet nhiều năm — có exposure dividend cực lớn, vì mỗi phần trăm sai lệch $q$ dịch chuyển toàn bộ forward curve qua nhiều năm, và exotic sống chết theo vị trí của forward so với các rào.

Tính bằng số cho thấy đòn bẩy. Với autocallable 3Y, forward năm 3 là $F_3=100\cdot e^{(0.05-0.02)\cdot3}=100\cdot e^{0.09}=109.42$. Nếu dividend yield bất ngờ tăng từ $2\%$ lên $4\%$ (các công ty tăng chi trả, hoặc dự báo cắt bị đảo), $F_3=100\cdot e^{(0.05-0.04)\cdot3}=100\cdot e^{0.03}=103.05$ — forward năm 3 tụt hơn $6$ điểm ($109.42\to103.05$). Với một sản phẩm mà autocall barrier ở $100$, một cú tụt forward $6$ điểm làm xác suất index đóng trên $100$ tại quan sát giảm rõ rệt (autocall khó hơn) và xác suất thủng knock-in $60$ tăng lên — dịch chuyển giá trị sản phẩm hàng phần trăm notional, trên một book hàng chục tỷ là con số chín chữ số.

Chiều rủi ro là chỗ đau. Dealer autocallable thường *long dividend* theo nghĩa đã phân tích ở §8.4: họ hưởng lợi khi dividend *giảm* (forward lên, autocall dễ). Nhưng dividend risk bất đối xứng và nhảy cóc: cổ tức không trôi mượt, chúng bị *cắt đột ngột* trong suy thoái (2008, 2020) — đúng lúc thị trường rớt và autocallable đã lỗ vì knock-in và skew. Năm 2020, khi ngân hàng và doanh nghiệp châu Âu bị buộc/khuyến nghị dừng chia cổ tức, dividend forecast dài hạn sụp, forward tụt, và các autocallable desk đã long dividend lỗ chồng lên nỗi đau skew và correlation — một cú "tất cả rủi ro cùng nổ một lúc". Bài học desk: dividend không phải tham số nhàm chán để nhét vào $q$ rồi quên; trên exotic dài hạn nó là một trục rủi ro bậc một, cần dividend curve riêng (implied từ giá futures/forward dài hạn) và cần được hedge bằng dividend swap/future ở những nơi có thanh khoản.

## 8.8 Sợi chỉ xuyên suốt: exotic là câu chuyện về rủi ro tồn dư

Nhìn lại cả chương, một khuôn mẫu hiện lên. Mỗi exotic bắt đầu từ một payoff mà khách hàng muốn và định giá được bằng một mô hình; nhưng giá không phải phần thú vị. Phần thú vị — và phần sinh tử của desk — là *cái gì còn lại sau khi hedge*. Digital để lại pin risk (buffer $\approx1$ cent trong ví dụ over-hedge của ta). Barrier để lại gap risk và gamma tại rào (down-and-out rào 90 định giá $9.00$, để lại $1.45$ giá trị knock-in cần quản). Asian arithmetic để lại nhiễu Monte Carlo mà ta thuần bằng control variate (SE tụt $36$ lần, tương đương $\sim1300$ lần số path). Autocallable để lại một mớ hỗn độn short vega, short skew, long correlation, long dividend, cộng forward vol risk, tất cả tương quan với nhau và tương quan với đúng lúc thị trường sụp. Cliquet để lại forward vol risk mà chỉ SLV mới định giá đúng ($2$ điểm chênh giá giữa forward vol $20\%$ và $25\%$). Basket/worst-of để lại correlation risk không hedge sạch được (giá worst-of call từ $4.46$ lên $8.18$ khi $\rho$ đi từ $0.3$ lên $0.9$). Dividend luồn qua tất cả như một trục ẩn ($6$ điểm forward năm 3 bốc hơi khi $q$ nhích $2\%$).

Chính vì rủi ro tồn dư này mà exotic có margin dày: khách hàng trả để dealer gánh những chiều rủi ro không có thị trường thanh khoản để đẩy đi. Và chính vì nó mà mô hình quan trọng — không phải để in ra một con số giá, mà để đo *đúng* các Greeks bậc hai và bậc chéo (vega theo strike, vega theo thời gian tương lai, cross-gamma spot–vol, correlation-delta, dividend delta) mà desk sẽ dùng để hedge từng ngày. Một autocallable book định giá bằng local vol trông "khớp thị trường" nhưng cho forward vega sai sẽ hedge sai và cháy khi smile dịch chuyển; định giá bằng SLV (tầng `models/equity/slv`, dựng trên stochastic vol của Chương 6 và pricing engine Fourier/PDE/MC của Chương 7 và Chương 12) cho các sensitivity đúng chiều. Đó là lý do tồn tại của cả một tầng mô hình chỉ để phục vụ nhúm sản phẩm này — và là lý do equity exotics vẫn là nơi quant giỏi kiếm được nhiều tiền nhất, đồng thời là nơi cháy tài khoản nhanh nhất khi mô hình sai.

# Chương 9: Lãi suất

Thị trường rates là thị trường derivative lớn nhất hành tinh — riêng notional OTC interest-rate derivatives vượt 400 nghìn tỷ USD — và là nơi Q-quant "nặng đô" nhất. Lý do rất cụ thể: một cổ phiếu là *một* con số $S_t$, còn lãi suất là *cả một đường cong* $P(0,T)$ tiến hóa theo thời gian, một vật thể vô hạn chiều. Bạn không hedge một điểm mà hedge cả term structure; không có một vol mà có nguyên một cube; không có một measure mà nhảy qua lại giữa forward measure, annuity measure, spot measure tùy instrument. Chương này đi theo đúng thứ tự một desk rates dựng kiến thức: bức tranh hậu-LIBOR, các instruments, dựng curve (bài toán hạ tầng số một mà mọi thứ khác đứng lên trên), smile của rates, rồi term-structure models và các convexity adjustment nối tất cả lại. Xuyên suốt, mỗi khái niệm được neo bằng một phép tính ra số cụ thể — vì rates là môn học mà trực giác chỉ đến sau khi bạn tự bootstrap được một curve và tự thấy forward "phóng đại" độ dốc thế nào.

## 9.1 Bức tranh sau cải cách LIBOR

**LIBOR** (London Interbank Offered Rate) — lãi suất liên ngân hàng "khảo sát", từng là tham chiếu của khoảng 400 nghìn tỷ USD hợp đồng — đã bị khai tử (USD LIBOR chấm dứt hẳn tháng 6/2023) sau scandal thao túng và vì một lý do sâu hơn: thị trường vay liên ngân hàng kỳ hạn thực chất đã cạn giao dịch thật, nên mỗi sáng các bank "ước lượng" một lãi suất mà đằng sau nó gần như không có deal nào. Một benchmark định giá cho hàng trăm nghìn tỷ mà lại dựa trên phán đoán chủ quan là rủi ro hệ thống không thể chấp nhận. Thay thế là **RFR (risk-free rates)** — lãi suất giao dịch thật, qua đêm, gần như không rủi ro tín dụng:

| Đồng tiền | RFR | Bản chất |
|---|---|---|
| USD | **SOFR** | Repo qua đêm có đảm bảo bằng Treasury |
| EUR | **€STR** (vẫn còn EURIBOR song song) | Vay qua đêm không đảm bảo |
| GBP | SONIA | Qua đêm không đảm bảo |
| JPY | TONA | Qua đêm |

Khác biệt cấu trúc quan trọng nhất là chiều nhìn của thời gian. LIBOR là **term rate nhìn về phía trước** (forward-looking): đầu kỳ 3 tháng, bạn đã biết ngay lãi suất sẽ trả cuối kỳ. SOFR là **overnight rate compound nhìn về phía sau** (backward-looking): chỉ khi kỳ kết thúc, sau khi đã cộng dồn toàn bộ các fixing qua đêm, bạn mới biết coupon. Sự đảo chiều này nghe nhỏ nhưng lan khắp hệ thống: schedule tính lãi phải đổi, thị trường thêm **payment lag** để kịp thanh toán, pricing caplet trên compounded rate phải xử lý một chi tiết mới (vol "tắt dần" trong kỳ observation), và — quan trọng cho curve — trục tín dụng LIBOR-OIS basis biến mất, chỉ còn một curve chiết khấu sạch. Sách giáo khoa cũ (kể cả Hull bản cũ) viết bằng LIBOR; đọc để nắm ý tưởng vẫn tốt, nhưng khi làm thật phải dịch hết sang ngôn ngữ RFR.

**Compounded SOFR bằng số.** Xét một coupon một kỳ 3 ngày (minh họa; kỳ thật là 1M hoặc 3M) với các fixing qua đêm 5.30%, 5.31%, 5.29%, quy ước ngày ACT/360. Hệ số lãi cộng dồn là tích của từng ngày:

$$\text{Hệ số lãi} = \left(1 + \tfrac{0.0530}{360}\right)\left(1 + \tfrac{0.0531}{360}\right)\left(1 + \tfrac{0.0529}{360}\right) - 1 = 4.417\text{bp}$$

Rate quy đổi về năm $= 4.417\text{bp} \times 360/3 = 5.30\%$. Con số này gần như bằng trung bình cộng của ba fixing (5.30%) vì lãi kép trên ba ngày là bậc hai nhỏ không đáng kể — nhưng trên kỳ 3 tháng, phần lãi-trên-lãi đã đủ để phải tính đúng compound thay vì lấy trung bình. Để thấy phần bậc-hai ấy không phải là hư cấu: nếu ba fixing là 5.30% phẳng thì trung bình cộng cho đúng 5.30%, nhưng compound thật cho $(1+0.0530/360)^3 - 1$ quy về năm $= 5.3002\%$ — chênh 0.02bp trên 3 ngày, mà scale tuyến tính lên một kỳ 90 ngày ở mức rate 5% thì phần lãi-kép này đã cỡ vài chục bp năm, không thể làm ngơ. Điểm nghiệp vụ nằm ở chỗ *khi nào* biết con số: ngày cuối kỳ mới ra coupon, nên thị trường thêm payment lag (thường 2 ngày) để back-office kịp xử lý.

**Vol "tắt dần" — dẫn xuất và một con số.** Một caplet viết trên compounded rate có một đặc thù không hề tồn tại thời LIBOR: khi kỳ observation đã chạy được một phần, các fixing đã chốt biến phần rate còn lại thành ít ngẫu nhiên hơn, nên vol hiệu dụng của rate giảm dần trong kỳ. Kết quả Lyashenko–Mercurio cho phương sai tích lũy đến khi caplet đáo hạn $T$, với kỳ accrual dài $\delta = T-S$:

$$\sigma_{\text{eff}}^2\,T = \sigma^2\left(T - \frac{\delta}{3}\right)$$

Con số $-\delta/3$ không phải hằng số ma thuật — nó rơi thẳng ra từ *phương sai của trung bình một Brownian motion*. Compounded RFR trên kỳ $[S,T]$ về bản chất là *trung bình* của rate tức thời qua kỳ; và nếu rate tức thời khuếch tán như $\sigma\,dW$, thì trung bình theo thời gian của một Brownian trên đoạn dài $L$ có phương sai đúng bằng $\sigma^2 L/3$. Kiểm tra một dòng: $\int_0^L W_u\,du$ có phương sai $\sigma^2 L^3/3$ (đặc trưng của tích phân Brownian), chia cho $L^2$ khi lấy trung bình ra $\sigma^2 L/3$ — hệ số $1/3$ chính là thứ ta cần. Ghép phần "đóng băng" trước kỳ (đóng góp đầy đủ $\sigma^2 S$) với phần trung-bình-trong-kỳ (đóng góp $\sigma^2 \delta/3$, *không* phải $\sigma^2\delta$) ra đúng $\sigma^2(S + \delta/3) = \sigma^2(T - 2\delta/3)$... — chính xác hơn, hạch toán đầy đủ hiệp phương sai giữa hai phần cho ra $\sigma^2(T - \delta/3)$. Thông điệp trực giác giữ nguyên: **trung bình của một quá trình khuếch tán tích lũy ít phương sai hơn giá trị điểm cuối, và mất đúng một phần ba kỳ accrual.**

Lấy số: caplet đáo hạn $T=1$ năm trên compounded rate kỳ 3M ($\delta=0.25$), vol forward phẳng $\sigma=30\%$. Vol hiệu dụng:

$$\sigma_{\text{eff}} = \sigma\sqrt{\frac{T-\delta/3}{T}} = 0.30\sqrt{\frac{1 - 0.0833}{1}} = 0.30\times 0.9574 = 28.7\%$$

Vol tụt từ 30% xuống 28.7% — chỉ một hiệu chỉnh nhỏ ở đây vì $\delta$ ngắn so với $T$, nhưng với caplet trên kỳ 1Y compounded (đầu curve, $\delta$ lớn so với $T$) hiệu ứng vọt lên: nếu $\delta = T = 1$ thì hệ số thành $\sqrt{1 - 1/3} = 0.816$, vol tụt tận 18% (từ 30% xuống 24.5%) — bỏ qua là mis-price thấy được ngay. Đây là ví dụ điển hình rằng cải cách benchmark không chỉ đổi tên mà đổi cả toán học của sản phẩm — bạn phải scale vol theo *phần kỳ còn sống* chứ không dùng vol cả kỳ.

## 9.2 Instruments của thị trường rates

Trước khi dựng curve hay model, phải biết curve được dựng *từ* cái gì và model được calibrate *vào* cái gì. Đây là bộ instrument nền của desk rates, đi từ đoạn đầu curve ra đến các exotic dài hạn.

**Deposit và futures ngắn hạn.** SOFR futures (CME) có thanh khoản khổng lồ và neo đoạn đầu curve. Nhưng futures không thể dùng thẳng như forward: do **daily margining**, mỗi ngày lãi biến động thì margin biến động, và vì P&L margin có tương quan dương với chính rate (rate tăng → futures giảm giá → bên short được ghi có lúc lãi suất tái đầu tư cao), futures rate luôn cao hơn forward rate một lượng gọi là **convexity adjustment**. Điều chỉnh này cần một model. Ở xấp xỉ bậc thấp nhất — giới hạn mean reversion $a\to 0$ của Hull-White — nó gọn lại thành:

$$\text{forward} \approx \text{futures} - \tfrac{1}{2}\sigma^2\,t_1 t_2$$

Đây *không* phải công thức Hull-White đầy đủ (bản đầy đủ thay $t_1 t_2$ bằng tích các hàm $B(t_1,t_2)$ mang mean reversion $a$, xem 9.5); nó là xấp xỉ khi $a$ rất nhỏ, đủ để lấy con số nhanh trên đoạn ngắn. Lấy $\sigma = 1\%$ (100bp/năm, dạng normal), futures đáo hạn $t_1 = 2$ năm và kỳ tích lũy tới $t_2 = 2.25$: điều chỉnh $\approx \tfrac{1}{2}(0.01)^2 \times 2 \times 2.25 = 2.25\times10^{-4} = 2.25\,\text{bp}$. Nghe nhỏ, nhưng bỏ qua nó thì đoạn 2Y của curve lệch vài bp — đủ để P&L của một book STIR lớn sai vài trăm nghìn USD.

Với đoạn futures dài hơn phải dùng công thức HW đầy đủ mang $a$, vì xấp xỉ $a\to 0$ *over-estimate* adjustment. Thấy điều đó bằng số: bản đầy đủ dùng $B(t_1,t_2)=\big(1-e^{-a(t_2-t_1)}\big)/a$ và $B(0,t_1)$, với $a=0.05$ và $t_1=2, t_2=2.25$ thì $B(t_1,t_2)=(1-e^{-0.05\times0.25})/0.05 = 0.2484$ so với giá trị $a\to0$ là $t_2-t_1 = 0.25$ — nhỏ hơn ~0.6%. Trên đoạn 2Y chênh chưa tới 0.02bp, nên xấp xỉ $a\to0$ ổn; nhưng đẩy futures ra 10Y thì $B$ và $t$ tách nhau mạnh, xấp xỉ phóng đại adjustment rõ rệt và phải dùng $B$ thật.

**OIS (Overnight Indexed Swap).** Fixed vs compounded overnight — đây là instrument dựng curve *chính* hiện nay, quote từ 1 tuần đến 50 năm. Chân floating trả đúng SOFR compound của kỳ, chân fixed trả một rate cố định; par swap rate là rate làm hai chân bằng nhau tại thời điểm ký. Vì floating leg gần như risk-free, OIS curve chính là discount curve trong thế giới collateralized.

Cho thấy "par swap rate" là gì bằng số, dùng luôn curve phẳng 4% (running example): trên curve OIS phẳng 4% annual, $P(0,1)=1/1.04=0.96154$ và $P(0,2)=1/1.04^2=0.92456$, nên annuity 2Y $= P(0,1)+P(0,2)=1.8861$. Par swap rate 2Y $= \big(1-P(0,2)\big)/\text{annuity} = (1-0.92456)/1.8861 = 4.00\%$ — đúng bằng rate curve, như phải thế trên curve phẳng. Giá trị nghiệp vụ hiện ra khi rate thị trường *dịch khỏi* rate đã ký: giả sử bạn đang giữ một swap *trả fixed 3%* còn đúng 2 năm trong khi par rate hiện tại là 4.00%. MTM về phía payer là chênh rate nhân annuity nhân notional,

$$\text{MTM} = (S_{\text{par}} - K)\times \text{annuity}\times \text{notional} = (0.04 - 0.03)\times 1.8861 \times 100 = +1.89.$$

Bạn đang trả fixed rẻ hơn thị trường 1% mỗi năm trong 2 năm, hiện-giá-hóa qua annuity thành $+1.89$ trên notional 100 (đã gặp con số này ở Chương 2). Đây cũng là cách đọc **DV01/PV01**: dịch par rate 1bp thì MTM đổi $\approx \text{annuity}\times 1\text{bp}\times\text{notional} = 1.8861\times 0.0001\times 100 = 0.0189$ — tức khoảng 1.9 cent cho mỗi 1bp trên notional 100. Annuity chính là hệ số biến "1bp rate" thành "tiền", và mọi risk report của rates desk chạy trên đúng phép nhân này.

**IRS trên RFR.** Cấu trúc như OIS nhưng desk vẫn quen gọi "swap"; với EUR còn tồn tại swap trên EURIBOR và các **basis swap** đổi giữa hai chỉ số — mỗi basis là một curve riêng phải bootstrap.

**Cap/Floor.** Một chuỗi option trên rate từng kỳ: caplet là call trên forward rate của kỳ đó, floorlet là put. Một cap 5Y trên tần suất quý là 20 caplet cộng lại. Quote bằng một **flat vol** (một vol duy nhất cho cả cap) hoặc bằng smile từng caplet (vol khác nhau theo strike). Một caplet đơn ra số ngay bằng công thức Bachelier (dùng cho rates từ kỷ nguyên rate âm): lấy caplet ATM trên forward 1Y1Y $=4.51\%$ (con số ta bootstrap ở 9.3), strike $K = 4.51\%$, normal vol $\sigma_N = 100\,\text{bp}$, $T=1$, kỳ accrual $\tau=1$, discount tại $T_2$ là $P(0,2)=0.9200$. Vì ATM nên $d=(F-K)/(\sigma_N\sqrt T)=0$, và giá caplet $= P(0,2)\,\tau\,\sigma_N\sqrt{T}\,\phi(0) = 0.9200\times 1\times 0.01\times 0.3989 = 0.00367$, tức **36.7bp trên notional** cho một caplet ATM ở vol 100bp. Một cap là tổng các mảnh như thế, mỗi mảnh discount và vol riêng.

**Swaption.** Option để bước vào một swap: payer swaption cho quyền *trả fixed* (cược rate tăng), receiver swaption cho quyền *nhận fixed*. Ma trận quote theo hai chiều expiry × tenor ("1Y10Y" = option 1 năm để bước vào swap 10 năm) trở thành **cube** khi thêm chiều strike. Đây là bề mặt vol quan trọng nhất của toàn thị trường rates: mọi model exotic đều phải khớp vào cube này.

**Bermudan swaption.** Quyền exercise vào *nhiều* ngày định trước thay vì một — trái tim của mọi callable bond và callable note. Đây là bài pricing "exotic chuẩn" của rates, đòi hỏi một term-structure model thật (không thể chỉ dùng công thức vanilla) cộng Longstaff-Schwartz hoặc PDE để định giá tối ưu điểm dừng.

**CMS (Constant Maturity Swap).** Coupon trả theo một swap rate constant-maturity (ví dụ swap rate 10Y) quan sát lại mỗi kỳ. CMS là instrument dạy ta bài học sâu nhất về measure: swap rate là martingale dưới annuity measure, nhưng CMS lại trả coupon dưới forward measure của ngày trả — sai lệch giữa hai measure sinh ra **convexity adjustment**, và cách tính đúng adjustment này bằng static replication trên toàn bộ swaption smile là một trong những kỹ thuật đẹp nhất của quant rates. Mục 9.6 sẽ dẫn xuất đầy đủ.

## 9.3 Curve construction — bài toán hạ tầng số một

**Bài toán.** Từ một tập quotes thị trường (futures, OIS/swap rates các tenor) dựng ra hàm discount $P(0,T)$ liên tục cho *mọi* $T$. Mọi pricing, mọi risk, mọi XVA đứng trên curve này; sai curve là sai tất cả, và sai một cách âm thầm vì không có "giá đúng" để so. Trong `quantc` tầng này sống ở `src/marketdata` cùng `src/calibration`. Đây là lý do desk rates coi curve engineer là vị trí nền tảng: một bug interpolation không làm crash gì cả, nó chỉ làm risk report sai vài phần trăm mỗi ngày cho đến khi ai đó nhận ra.

**Bootstrap cổ điển.** Ý tưởng là một vòng lặp tham lam: sắp instruments theo maturity tăng dần; với mỗi instrument, mọi dòng tiền *trừ cái cuối* đã được định giá bằng đoạn curve đã dựng trước đó, nên chỉ còn đúng một ẩn $P(0,T_i)$, giải để instrument reprice đúng par. Đi từng nấc đến hết curve. Vẻ đẹp của nó là mỗi bước chỉ giải một phương trình một ẩn.

**Bootstrap tính tay 2 nấc.** Lấy quotes OIS 1Y = 4.00% và OIS 2Y = 4.25% (fixed trả hằng năm, notional 1). Một swap par nghĩa là hiện giá chân fixed bằng hiện giá chân floating, mà chân floating par luôn có giá $1 - P(0,T)$ (một danh mục nhận lãi qua đêm rồi hoàn gốc), nên điều kiện par gọn lại thành "PV chân fixed cộng gốc discount bằng 1".

*Nấc 1:* swap 1Y par tương đương $0.04 \cdot P(0,1) + P(0,1) = 1$, suy ra $P(0,1) = 1/1.04 = 0.96154$.

*Nấc 2:* swap 2Y par tương đương $0.0425\,[P(0,1) + P(0,2)] + P(0,2) = 1$. Vì $P(0,1)$ đã biết từ nấc 1, ta giải cho ẩn duy nhất còn lại:

$$P(0,2) = \frac{1 - 0.0425 \times 0.96154}{1.0425} = \frac{0.95913}{1.0425} = 0.92003$$

Suy ra zero rate 2Y $= (1/0.92003)^{1/2} - 1 = 4.26\%$ và **forward 1Y1Y** $= P(0,1)/P(0,2) - 1 = 0.96154/0.92003 - 1 = 4.51\%$. Hãy đọc kết quả như một trader. Curve dốc lên rất nhẹ (spot 4.00% ở 1Y, 4.26% ở 2Y), nhưng forward 1Y1Y đã nhảy tới **4.51%** — cao hơn cả zero 2Y. Đây là hiện tượng cốt lõi phải cảm được bằng số: **forward luôn "phóng đại" độ dốc của curve**. Trực giác: swap rate 2Y là một dạng trung bình của hai forward liên tiếp (forward 0Y1Y $= 4.00\%$ và forward 1Y1Y); nếu trung bình phải là 4.26% mà đoạn đầu chỉ có 4.00%, thì đoạn sau buộc phải kéo lên vượt trung bình để bù lại — nên forward thứ hai vọt tới 4.51%. Ai không nắm quan hệ spot–forward này bằng số sẽ liên tục ngạc nhiên vì sao một dịch chuyển nhỏ của curve dài lại tạo forward risk lớn ở giữa. Lặp quy trình này cho 30–50 quotes là ra production curve; mọi phức tạp còn lại chỉ là tinh chỉnh quanh chính vòng lặp một-ẩn-một-phương-trình này.

**Thực tế hiện đại tinh vi hơn.** Bốn lớp tinh chỉnh biến bootstrap giáo khoa thành curve production:

*Interpolation quyết định chất lượng.* Giữa các điểm bootstrap, ta phải nội suy, và lựa chọn nội suy quyết định hình dạng forward curve — thứ mà mọi Greek đứng lên trên. Nội suy tuyến tính trên $\ln P$ tương đương forward tức thời bậc thang, cho forward xấu và gãy khúc. Cubic spline trơn hơn nhưng có hai tật chết người: nó **dao động** (overshoot quanh các điểm quote sát nhau) và nó **không local** — đổi một quote 10Y làm rung forward ở 3Y.

Hãy thấy tật dao động bằng số. Forward tức thời là $f(t) = -\,d\ln P/dt$; nó âm ngay khi $\ln P$ *tăng* cục bộ theo $t$ — tức khi spline overshoot đẩy một discount factor xa lên cao hơn hàng xóm gần maturity. Giả sử hai quote sát nhau cho $P(4.90)=0.8000$ và $P(5.00)=0.7990$ (curve giảm đều, đúng chuẩn), nhưng một cubic overshoot nhấc điểm giữa lên $P(4.95)=0.8005$ — cao hơn *cả* điểm 4.90. Trên đoạn $[4.90, 4.95]$ discount factor tăng, nên forward:

$$f \approx -\frac{\ln P(4.95) - \ln P(4.90)}{4.95 - 4.90} = -\frac{\ln(0.8005) - \ln(0.8000)}{0.05} = -1.25\% = -125\text{bp}$$

Forward âm 125bp là cờ arbitrage đỏ chót — không thị trường nào cho vay để *nhận* lãi âm 125bp giữa hai kỳ hạn sát nhau. Trader ghét cay đắng tính không-local và dao động này vì nó khiến risk "chạy lung tung": bump một tenor, sensitivity nhảy ở tenor khác chẳng liên quan, và forward có thể lặn xuống âm. Chuẩn công nghiệp phổ biến là **monotone convex (Hagan-West)** hoặc tension spline dựng thẳng trên instantaneous forward, với bốn tiêu chí cứng: forward luôn dương, curve trơn, thay đổi local, và Jacobian của risk ổn định.

*Global fit thay vì bootstrap tuần tự.* Khi các curve phụ thuộc lẫn nhau — multi-curve, cross-currency — không thể giải tuần tự nữa vì ẩn của curve này nằm trong phương trình của curve kia. Ta giải *đồng thời* toàn bộ $P(0,T_i)$ bằng Newton đa chiều khớp mọi quotes cùng lúc. Phần thưởng đi kèm là một **Jacobian giải tích** cho phép map risk từ zero rates trở về market quotes — chính là **par-point risk** mà trader thực sự hedge (bạn hedge bằng cách mua/bán các instrument quote được, không phải "zero rate 7.3Y").

*Multi-curve và collateral discounting.* Đây là thay đổi kiến trúc lớn nhất hậu-2008: chiết khấu phải theo curve *phù hợp với collateral của deal*, không phải một curve risk-free vũ trụ. Một deal có CSA nhận collateral USD trả lãi SOFR thì chiết khấu bằng curve SOFR; CSA trả €STR thì chiết khấu bằng €STR cộng cross-currency basis; deal không collateral thì chiết khấu ở curve funding của bank (dẫn tới FVA, xem Chương 14). Khẩu quyết là "một deal — nhiều curve": một curve *dự báo* coupon floating (forecast curve của chỉ số) và một curve *chiết khấu* theo CSA. Mục 9.4 dẫn xuất công thức này bằng số.

*Turn-of-year và meeting dates.* Đoạn cực ngắn của curve không trơn: quanh mỗi ngày họp Fed/ECB có **jump** kỳ vọng chính sách, và cuối năm có hiệu ứng thanh khoản (turn-of-year) đẩy overnight rate lệch một-hai ngày. Curve STIR production dựng jump tại đúng meeting date thay vì trơn qua — chi tiết rất "đời" mà mọi desk short-rate đòi hỏi.

**Risk trên curve.** DV01/PV01 đo P&L khi shift 1bp (ta vừa thấy $\approx 0.0189$ trên swap 2Y notional 100); bucketed delta đo sensitivity theo *từng* quote (par risk); forward risk đo theo forward rate. Với **AAD** (adjoint algorithmic differentiation), full curve risk của một portfolio trăm nghìn swap tính trong đúng một backward pass thay vì bump-and-revalue từng bucket — đây là lý do mọi ngân hàng lớn đã chuyển sang AAD cho rates (tầng `src/aad`), vì bump-recompute với 50 buckets × trăm nghìn deals là bất khả thi trong thời gian thực.

## 9.4 Multi-curve và collateral discounting — dẫn xuất rõ

Trước 2008, một curve LIBOR làm cả hai việc: dự báo coupon floating và chiết khấu dòng tiền. Basis LIBOR-OIS gần như bằng 0 nên chẳng ai phân biệt. Khủng hoảng đẩy basis lên hàng trăm bp, phơi bày rằng hai chức năng là hai vật khác nhau. Ngày nay ta tách bạch dứt khoát, và đây là dẫn xuất bằng số vì sao.

Xét một forward rate floating của kỳ $[T_1, T_2]$, quan sát trên chỉ số dự báo (forecast). Forward "trong sạch" của chỉ số đó, ký hiệu $F^{\text{fwd}}$, được suy từ **forecast curve** $P^{f}$:

$$F^{\text{fwd}}(T_1,T_2) = \frac{1}{\tau}\left(\frac{P^{f}(0,T_1)}{P^{f}(0,T_2)} - 1\right)$$

với $\tau$ là year-fraction. Nhưng giá của caplet/coupon này lại được chiết khấu bằng **discount curve** $P^{d}$ khớp collateral (CSA), thường là OIS. Giá của một coupon floating trả tại $T_2$ là:

$$V = P^{d}(0,T_2)\cdot \tau \cdot F^{\text{fwd}}(T_1,T_2)$$

Điểm mấu chốt là forward $F^{\text{fwd}}$ phải lấy từ *forecast* curve, không phải từ discount curve. Đây chính là chỗ cách làm ẩu single-curve sai to: nó dùng *một* curve (thường là OIS discount) cho cả hai việc, nên forecast luôn cả coupon bằng curve OIS — bỏ mất basis giữa chỉ số và OIS. Lấy số cụ thể với index-OIS basis điển hình ~50bp, $\tau=1$.

*Discount curve OIS:* $P^{d}(0,1)=0.9615$, $P^{d}(0,2)=0.9230$. Forward 1Y1Y *ngụ ý bởi curve OIS* là

$$F^{d} = \frac{0.9615}{0.9230} - 1 = 4.17\%.$$

*Forecast curve của chỉ số* mang thêm ~50bp basis, cho một forward cao hơn — giả sử bootstrap từ basis swap ra $F^{\text{fwd}} = 4.67\%$ (đúng $F^{d} + 0.50\%$).

Giờ so hai cách định giá cùng một coupon floating trả tại năm 2, **cùng chiết khấu bằng OIS** $P^{d}(0,2)=0.9230$:

- **Multi-curve (đúng):** forecast bằng forecast curve → $V = 0.9230 \times 4.67\% = 4.31\%$ notional.
- **Single-curve (ẩu):** forecast luôn bằng curve OIS → $V = 0.9230 \times 4.17\% = 3.85\%$ notional.

Chênh lệch **46bp** trên *một* cashflow — không hề nhỏ, và nó đúng bằng basis 50bp bị bỏ sót (nhân discount factor 0.923). Trên một book swap vài trăm tỷ notional với dòng tiền floating suốt nhiều kỳ, sai lệch này tích lũy thành hàng chục triệu. Bài học: **forward đến từ forecast curve mang basis của chỉ số, chiết khấu đến từ discount curve khớp CSA, không bao giờ trộn lẫn.** (Lưu ý: chọn *cùng* curve để discount hai kịch bản là cố ý — để cô lập đúng tác động của việc forecast sai; nếu còn dùng chung curve để discount thì sai chồng thêm.)

Với cross-currency, thêm một tầng nữa. Một deal collateral bằng USD nhưng dòng tiền EUR phải chiết khấu bằng "EUR-collateralized-in-USD" curve = €STR cộng **cross-currency basis** — chính là giá thị trường của việc funding EUR bằng collateral USD. Cross-currency basis EUR/USD từng chạy tới $-50$ đến $-30\,\text{bp}$, phản ánh nhu cầu USD toàn cầu. Cho thấy bằng số: một cashflow 1 EUR trả tại năm 5, curve €STR ở 2.50% (comp năm). Chiết khấu ở €STR thuần cho $P^{\text{€STR}}(0,5) = 1.025^{-5} = 0.8839$. Chiết khấu ở €STR $+$ basis $-30\,\text{bp}$ $= 2.20\%$ cho $P^{\text{xccy}}(0,5) = 1.022^{-5} = 0.8969$. Chênh lệch $0.8969 - 0.8839 = 0.01305$, tức **130bp trên mỗi 1 EUR danh nghĩa** — trên 100M EUR cashflow, chiết khấu đúng curve xccy làm PV cao hơn **1.30 triệu EUR** so với dùng €STR thuần. Basis âm nghĩa là chiết khấu *nhẹ* hơn (rate thấp hơn), PV cao hơn; dùng sai curve ở đây là mis-value cả triệu trên một dòng tiền. Tầng này ứng với `src/marketdata` xccy trong repo.

## 9.5 Mô hình lãi suất: bản đồ chọn model

Khác equity — nơi bạn model một tài sản $S_t$ — rates bắt bạn model *cả đường cong* tiến hóa, một bài toán vô hạn chiều. Lịch sử quant rates đọng lại ba truyền thống, mỗi cái chọn một cách "nén" chiều vô hạn ấy thành thứ tính được.

### Short-rate models — cổ điển, vẫn sống khỏe

Ý tưởng đơn giản nhất: model một biến duy nhất, lãi suất tức thời $r_t$, rồi mọi bond price suy ra bằng kỳ vọng risk-neutral của discount factor:

$$P(t,T) = \mathbb{E}^{\mathbb{Q}}\!\left[e^{-\int_t^T r_s\,ds}\,\Big|\,\mathcal{F}_t\right]$$

Cả term structure trở thành *hàm* của một trạng thái $r_t$ — nén vô hạn chiều về một chiều. Cái giá phải trả là mọi tenor động cùng một hướng (chỉ có một factor), nhưng đổi lại ta được nghiệm đóng và tốc độ.

**Vasicek** $dr = \kappa(\theta - r)\,dt + \sigma\,dW$ là mô hình Ornstein-Uhlenbeck: $r$ bị kéo về mức dài hạn $\theta$ với tốc độ $\kappa$, dao động biên độ $\sigma$. Cho nghiệm đóng bond và option, cho phép rate âm (từng bị coi là bug, nay là feature sau kỷ nguyên rate âm ở EUR/JPY). Một con số để Vasicek không treo trừu tượng: lấy $\kappa=0.10$, $\theta=4\%$, $r_0=2\%$. Kỳ vọng của short rate tại thời điểm $t$ là $\mathbb{E}[r_t]=\theta+(r_0-\theta)e^{-\kappa t}$; tại $t=5$ năm, $\mathbb{E}[r_5]=0.04+(0.02-0.04)e^{-0.5}=0.04-0.02\times0.6065=2.79\%$ — rate mới đi được hơn một phần ba quãng đường từ 2% về mức dài hạn 4% sau 5 năm, vì mean reversion chậm ($\kappa=0.10$ ứng half-life $\ln2/0.10\approx6.9$ năm). Đó chính là trực giác "rates dai dẳng". Nhược điểm chí mạng để dùng production: ba tham số $(\kappa,\theta,\sigma)$ không thể khớp *chính xác* cả curve hôm nay — mà curve hôm nay là dữ liệu đầu vào thiêng liêng, sai nó là arbitrage ngay từ ngày 0.

**Hull-White (extended Vasicek)** vá đúng lỗ đó: $dr = (\theta(t) - a\,r)\,dt + \sigma\,dW$, biến mức dài hạn thành *hàm thời gian* $\theta(t)$ được chọn để khớp chính xác curve khởi tạo. Đây là **workhorse thật sự của industry hiện nay**: nghiệm đóng cho bond, caplet, swaption; PDE, tree, Monte Carlo đều nhanh; và mô phỏng exact cho XVA. Bản hai nhân tố (HW2F, tương đương G2++) thêm một Brownian thứ hai để tạo correlation giữa các đoạn curve — cần thiết cho sản phẩm nhạy hình dạng curve như CMS spread options.

Bộ công thức Hull-White phải thuộc khi implement là **affine term structure**:

$$P(t,T) = A(t,T)\,e^{-B(t,T)\,r_t}, \qquad B(t,T) = \frac{1 - e^{-a(T-t)}}{a}$$

trong đó $A(t,T)$ có công thức đóng theo curve ban đầu và $(a,\sigma)$. Điều kiện then chốt: tại $t=0$ model *phải* reprice đúng curve thị trường, nên $A$ bị khóa bởi

$$A(0,T) = P^{\text{mkt}}(0,T)\,e^{B(0,T)\,r_0},$$

tức $A$ không tự do mà chính là thứ "gánh" toàn bộ curve khởi tạo. Hãy đọc mọi mảnh bằng số cho một bond 10Y, $a=0.05$, short rate $r_0 = 5\%$, curve khởi tạo phẳng $5\%$ liên tục (nên $P^{\text{mkt}}(0,10)=e^{-0.05\times10}=0.6065$).

- $B(0,10) = (1 - e^{-0.05\times10})/0.05 = (1 - 0.6065)/0.05 = 7.87$ — "duration nhạy với factor": bond 10Y có sensitivity với short-rate factor gấp gần 8 lần bond kỳ hạn cực ngắn, hợp trực giác duration.
- $A(0,10) = 0.6065 \times e^{7.87 \times 0.05} = 0.6065 \times e^{0.3935} = 0.6065 \times 1.4822 = 0.8989$.
- Ráp lại kiểm tra: $P(0,10) = A(0,10)\,e^{-B\,r_0} = 0.8989 \times e^{-7.87\times0.05} = 0.8989 \times 0.6746 = 0.6065$ — đúng bằng $P^{\text{mkt}}(0,10)$, đúng như thiết kế. Đây là điểm mấu chốt của affine: $B$ là hình học thuần, $A$ hấp thụ curve để model không bao giờ arbitrage curve hôm nay.

Đọc mean reversion $a = 0.05$ bằng số: một cú sốc lãi suất có **half-life** $\ln 2 / 0.05 \approx 14$ năm — cú sốc rates dai dẳng khủng khiếp, đúng bản chất rates so với equity (nơi shock tan trong ngày). Vol của zero rate kỳ hạn $T$ tỉ lệ $\sigma\,B(t,T)/(T-t)$, **giảm dần theo kỳ hạn** vì $B$ tăng chậm hơn $T$; đọc bằng số với $a=0.05$: hệ số $B(0,T)/T$ đi từ $0.975$ ở $T=1$ xuống $0.885$ ở $T=5$, $0.787$ ở $T=10$, $0.518$ ở $T=30$ — vol zero-rate 30Y chỉ còn hơn nửa vol đầu ngắn, khớp thực nghiệm rằng đầu ngắn curve dữ dội hơn đầu dài. Calibration điển hình: cố định $a$ theo desk (hoặc fit vào *tỷ lệ* vol giữa các tenor), rồi fit $\sigma$ — có thể piecewise theo thời gian — vào dải swaption ATM trên đường chéo liên quan đến deal. Điểm khiến HW thống trị `src/xva`: vì $r_{t+\Delta}$ có phân phối Gaussian dạng đóng, ta mô phỏng bước dài tùy ý mà *không bias*, cực rẻ — đúng thứ cần khi phải simulate curve cho hàng nghìn deals trong một chạy CVA.

**CIR** $dr = \kappa(\theta-r)\,dt + \sigma\sqrt{r}\,dW$ đặt $\sqrt{r}$ vào diffusion để giữ rate không âm — nay ít dùng cho rates chính (vì rate âm có thật) nhưng sống khỏe trong credit (intensity model) và trong biến thể Heston. Điều kiện Feller $2\kappa\theta \ge \sigma^2$ đảm bảo rate không chạm 0: ví dụ $\kappa=0.3,\theta=4\%$ cho $2\kappa\theta=0.024$, nên $\sigma$ phải $\le\sqrt{0.024}=15.5\%$ (dạng $\sigma\sqrt r$) thì mới không dính biên — một ràng buộc calibration rất thực. **Black-Karasinski** dùng lognormal short rate, khớp trực giác "vol tỷ lệ với mức rate" nhưng mất nghiệm đóng, phải tree/PDE.

### HJM — khung lý thuyết thống nhất tất cả

Thay vì model một điểm $r_t$, Heath-Jarrow-Morton model *toàn bộ* forward curve tức thời $f(t,T)$ cùng lúc: $df(t,T) = \mu(t,T)\,dt + \sigma(t,T)\,dW$. Kết quả trung tâm — và là một trong những định lý đẹp nhất của quant — là **điều kiện drift HJM**: để không arbitrage, dưới measure $\mathbb{Q}$ drift bị vol xác định *hoàn toàn*, không còn tự do:

$$\mu(t,T) = \sigma(t,T)\int_t^T \sigma(t,s)\,ds$$

Ý nghĩa sâu: **model rates = chọn cấu trúc vol**, drift chỉ là hệ quả no-arbitrage. Bạn không được chọn drift; chọn vol xong là drift đã bị khóa. Cho thấy điều kiện này ra một con số cụ thể trên vol dạng mũ $\sigma(t,T)=\sigma e^{-a(T-t)}$ (chính là dạng dẫn tới Hull-White), với $\sigma=1\%$, $a=0.05$, $t=0$, $T=5$: tích phân bên trong $\int_0^5 \sigma e^{-a s}\,ds = \sigma(1-e^{-0.25})/0.05 = 0.01\times 4.424 = 0.04424$, và $\sigma(0,5)=0.01\times e^{-0.25}=0.00779$, nên drift $\mu(0,5)=0.00779\times 0.04424 = 3.4\times10^{-4}$ mỗi năm — tức forward 5Y "trôi lên" khoảng 3.4bp/năm *chỉ để bù no-arbitrage*, không phải vì view thị trường nào. Drift ấy hoàn toàn do vol sinh ra, minh họa sống động rằng bạn không có quyền tự do với drift. HJM tổng quát là non-Markovian (không rút về PDE thấp chiều được, vì trạng thái là cả curve), nên trên thực tế ta dùng các *trường hợp riêng Markovian*: Hull-White chính là HJM với vol dạng mũ $\sigma(t,T) = \sigma e^{-a(T-t)}$, và **Cheyette/quasi-Gaussian** là lớp Markovian linh hoạt hơn — đang được nhiều desk chọn cho exotics vì cho phép gắn local/stochastic vol lên rates mà vẫn giữ được cấu trúc PDE thấp chiều.

### Market models — LMM

**LIBOR Market Model (BGM)**, nay là **Forward Market Model trên RFR**, tấn công vấn đề từ hướng ngược lại: thay vì model một biến trừu tượng $r_t$, nó model *trực tiếp* chính các forward rates $F_i$ mà trader quan sát và giao dịch được, mỗi cái lognormal (hoặc shifted/normal) dưới forward measure riêng của nó. Ưu điểm là tham số hóa bằng đúng thứ trader thấy: cap/swaption vols và correlation giữa các forwards; khớp smile bằng **SABR-LMM**. Nhược điểm là chiều cao — mỗi forward là một biến, một curve 40 tenor là 40 biến — nên chỉ chạy được bằng Monte Carlo, và Bermudan phải dùng Longstaff-Schwartz. Dùng cho các exotic phức tạp nhất: callable structured notes, ratchets, các sản phẩm path-dependent đa-tenor.

Hai công thức thực chiến của khu vực này phải nắm. Thứ nhất, **swaption qua Black trên swap rate** với annuity làm numeraire (đã gặp ở Chương 4): payer swaption $= A(0)\,[S_0 N(d_1) - K N(d_2)]$ với vol lognormal, trong đó $A(0)$ là annuity (tổng discount factor của các kỳ fixed) và $S_0$ là forward swap rate. Phiên bản **normal (Bachelier)** dùng từ kỷ nguyên rate âm, khi lognormal không định nghĩa được với rate âm:

$$V = A(0)\,\sigma_N\sqrt{T}\,\big[d\,N(d) + \phi(d)\big], \qquad d = \frac{S_0 - K}{\sigma_N\sqrt{T}}$$

Chú ý $\sigma_N$ đo bằng **bp/năm** chứ không phải phần trăm — swaption USD 1Y10Y quote quanh 80–120bp tùy regime. Một ví dụ số cho **một payer swaption ATM 1Y10Y**: ATM nghĩa $S_0 = K$, nên $d=0$; lấy $\sigma_N = 100\,\text{bp}$ $= 0.01$, $T=1$, annuity $A(0)=8$ (swap 10Y). Tại $d=0$ có $N(0)=0.5$, $\phi(0)=0.3989$, nên

$$V = 8 \times 0.01 \times \sqrt{1} \times [0 + 0.3989] = 0.0319.$$

Đọc đơn vị cho *chuẩn*, tránh cạm bẫy thường gặp: $V = 0.0319$ là **giá trị tuyệt đối $= 3.19\%$ notional** — annuity $A(0)=8$ đã nhân vào rồi. Nếu muốn diễn đạt "running trên annuity" (giá chia annuity, đơn vị bp mỗi kỳ) thì đó là $V/A(0) = 0.0319/8 = 0.00399 = 39.9 \approx 40\,\text{bp}$. Hai con số không mâu thuẫn — chúng là hai *quy chiếu* khác nhau: 319bp là giá option đầy đủ tính trên notional, còn ~40bp là chính $\sigma_N\sqrt{T}\,\phi(0)$, tức "vol nhân căn thời gian nhân mật độ", đọc như premium chuẩn hóa. Nói gọn: giá một payer swaption ATM 1Y10Y ở vol 100bp là **3.19% notional**, tương đương **~40bp running trên annuity**. Công thức normal cho ATM gọn tuyệt đẹp: $V_{\text{ATM}} = A(0)\,\sigma_N\sqrt{T/2\pi}$, dùng để nhẩm nhanh trên desk (kiểm tra: $8\times0.01\times\sqrt{1/6.283} = 8\times0.01\times0.3989 = 0.0319$, khớp).

Đáng làm một *cross-check lognormal-vs-normal* để thấy hai công thức ăn khớp, và để nhớ cách dịch giữa hai loại vol. Với forward swap rate $S_0=4.0\%$, quy tắc xấp xỉ ATM là $\sigma_N \approx \sigma_{\text{ln}}\times S_0$, nên $\sigma_N=100\,\text{bp}$ ứng $\sigma_{\text{ln}} = 0.01/0.04 = 25\%$. Đưa $\sigma_{\text{ln}}=25\%$ vào công thức Black lognormal (ATM, $S_0=K=4\%$, $T=1$, $A(0)=8$): $d_1 = \tfrac12\sigma_{\text{ln}}\sqrt T = 0.125$, $d_2=-0.125$, $N(d_1)=0.5497$, $N(d_2)=0.4503$, cho $V = 8\times 0.04\times(0.5497-0.4503) = 8\times0.04\times0.0994 = 0.0318 = 3.18\%$ notional. Gần như trùng khít con số Bachelier 3.19% — sai lệch 0.01% chỉ là số hạng bậc cao của phép dịch vol. Bài học desk: ở ATM, chọn lognormal hay normal không đổi giá; khác biệt thật chỉ hiện ra ở strike xa và khi rate gần/dưới 0 (nơi lognormal *sập*, buộc phải normal).

Thứ hai, **drift LMM dưới spot LIBOR measure** — công thức khiến mọi sinh viên "ngộ" ra vì sao LMM chỉ chạy được bằng Monte Carlo. Dưới **spot LIBOR measure** (rolling numeraire = tài khoản tái đầu tư qua các forward kế tiếp), tổng chạy từ forward *đang sống kế tiếp* $\beta(t)$ (chỉ số nhỏ nhất với $T_{\beta(t)} > t$) tới $k$:

$$\frac{dF_k}{F_k} = \sigma_k(t)\sum_{j=\beta(t)}^{k} \frac{\tau_j\,\rho_{jk}\,\sigma_j(t)\,F_j(t)}{1 + \tau_j F_j(t)}\,dt + \sigma_k(t)\,dW_k$$

Chú ý cẩn thận mốc dưới của tổng: dưới **spot measure** nó là $j=\beta(t)$ (forward đang sống), *không phải* "$j: T_j \le T_k$" chung chung — dấu tổng chạy *xuôi* từ forward gần nhất còn sống ra tới $k$. Nếu bạn làm việc dưới **terminal/forward measure** của $T_N$ thì tổng đổi chiều (chạy từ $k+1$ tới $N$) và drift đổi dấu. Nhầm mốc/nhầm measure là lỗi implement kinh điển làm lệch dấu drift và sinh arbitrage âm thầm trong simulation. Drift của forward thứ $k$ phụ thuộc **mọi forward đang sống trước nó** — state-dependent và stochastic. Không một PDE thấp chiều nào chứa nổi cái drift này (trạng thái là cả vector forward), nên Monte Carlo là bắt buộc. Nhưng cấu trúc lại rất "cơ khí": mỗi số hạng trong tổng chính là một phép đổi measure nối tiếp qua các $T_j$ — mỗi bước dịch numeraire từ forward measure này sang forward measure kia sinh đúng một số hạng drift — nên code lên thẳng từ công thức mà không cần mẹo gì. Đây là ví dụ trong sạch nhất rằng "đổi numeraire có giá bằng drift".

**Bảng chọn model theo bài toán (thực tế desk):**

| Bài toán | Model chuẩn hiện nay |
|---|---|
| Vanilla swaption/cap quote & risk | SABR (shifted/normal) từng expiry |
| Bermudan swaption, callables | Hull-White 1F/2F hoặc Cheyette, PDE/LSM |
| CMS, CMS spread | Replication trên SABR smile; HW2F cho spread |
| Exotic đa-tenor path-dependent | LMM/SABR-LMM, Monte Carlo |
| XVA simulation (nghìn deals) | HW1F/2F (rẻ, đủ tốt) — đúng lớp model trong `src/xva` |
| Capital/FRTB | Sensitivities từ model FO + aggregation quy định (`src/risk`) |

Đọc bảng này như một triết lý: model không có "tốt nhất", chỉ có "đúng cho bài toán". SABR cho vanilla vì nó chỉ cần khớp smile một expiry và cho công thức implied vol gần đóng. Hull-White cho Bermudan vì nó rẻ, Markovian, PDE được, và độ chính xác model đã đủ cho một sản phẩm mà rủi ro lớn nhất là điểm dừng chứ không phải smile. LMM cho exotic đa-tenor vì chỉ nó tham số hóa được correlation giữa mọi forward. Và HW cho XVA vì bạn cần simulate curve mười nghìn lần cho một trăm nghìn deals — chỉ tốc độ mới đủ.

## 9.6 CMS convexity adjustment — replication đầy đủ trên swaption smile

Đây là mục "cao cấp" của chương và là ví dụ đẹp nhất rằng đổi measure *có giá bằng tiền*, tính được đến từng bp. Bài toán: một CMS coupon trả swap rate $S_T$ (chẳng hạn swap rate 10Y) quan sát tại $T$, nhưng *thanh toán* tại một thời điểm $T_p$ (thường $= T$ hoặc lệch một kỳ). Câu hỏi trung tâm: kỳ vọng cần dùng để định giá là gì?

**Vì sao có adjustment.** Swap rate $S_t$ là martingale dưới **annuity measure** $\mathbb{Q}^A$ (numeraire là annuity $A_t$), tức $\mathbb{E}^{A}[S_T] = S_0$, forward swap rate hôm nay. Nhưng CMS coupon trả một khoản dưới **forward measure** $\mathbb{Q}^{T_p}$ (numeraire là bond $P(t,T_p)$), và dưới measure này $S_T$ *không* còn là martingale. Đại lượng ta cần là $\mathbb{E}^{T_p}[S_T]$, và nó lệch khỏi $S_0$ đúng bằng **convexity adjustment**:

$$\mathbb{E}^{T_p}[S_T] = S_0 + \text{CA}, \qquad \text{CA} > 0 \text{ (thường)}$$

Trực giác dấu: khi rate tăng, annuity (numeraire cũ) co lại, nên trọng số Radon-Nikodym khi đổi sang forward measure đề cao các kịch bản rate cao — kéo kỳ vọng lên trên $S_0$. CMS "thích" rate cao hơn mức forward phẳng ngụ ý, nên phải trả thêm.

**Replication — dẫn xuất.** Ý tưởng Hagan: bất kỳ payoff phi tuyến của $S_T$ nào cũng phân rã thành một danh mục *tĩnh* các swaption trên mọi strike, và swaption thì đã có giá thị trường (qua smile). Cơ chế là đẳng thức Carr-Madan mà ta đã gặp khi replicate variance swap: mọi hàm trơn $g(S)$ viết lại được thành giá trị tại điểm neo $S_0$, cộng một tầng đạo hàm bậc nhất, cộng *tích phân trọng số $g''(K)$ của các payoff option* $(S-K)^+$ và $(K-S)^+$ trên mọi strike. Áp vào payoff CMS (là $S_T$ nhân tỷ số numeraire annuity/bond, một hàm phi tuyến của $S_T$), phần phi tuyến ấy được replicate bằng đúng một rổ payer/receiver swaption, và convexity adjustment trở thành một *tích phân trên smile*:

$$\text{CA} = \frac{1}{P(0,T_p)}\left[\int_0^{S_0}\! w(K)\,\text{Rec}(K)\,dK + \int_{S_0}^{\infty}\! w(K)\,\text{Pay}(K)\,dK\right]$$

trong đó $\text{Pay}(K)$, $\text{Rec}(K)$ là giá payer/receiver swaption strike $K$ (lấy đúng từ swaption smile, thường parametrize bằng SABR), và $w(K)$ là trọng số hình học — cụ thể tỉ lệ với đạo hàm bậc hai của hàm ánh xạ $G(S)$ đưa từ annuity-numeraire về $T_p$-bond-numeraire, chính là $g''(K)$ trong Carr-Madan. Đọc công thức: adjustment *không* là một con số ad-hoc mà là **giá của một rổ swaption thực** — nếu bạn muốn hedge convexity của CMS, bạn mua đúng rổ swaption này. Đây là lý do CMS được coi là "swaption smile viết lại": nó nhạy toàn bộ smile chứ không chỉ ATM.

**Xấp xỉ Hagan bằng số — và θ từ đâu ra.** Với payment lag bằng 0 và một xấp xỉ mức một (linear TSR - terminal swap rate model), adjustment gọn lại thành:

$$\text{CA} \approx S_0\,\big(e^{\sigma^2 T} - 1\big)\cdot \theta$$

Điểm yếu nhất của mọi ví dụ CMS là hệ số hình học $\theta$: nếu thả một con số vào thì cả kết quả bp treo lơ lửng. Ta dẫn $\theta$ từ *đạo hàm của annuity theo rate*, đúng tinh thần linear-TSR. Trong xấp xỉ curve phẳng, annuity (level) của swap $n$ kỳ annual nhìn như hàm của swap rate $S$ là

$$A(S) = \frac{1 - (1+S)^{-n}}{S},$$

và hệ số convexity chính là *độ đàn hồi âm của annuity theo rate*:

$$\theta = -\,S_0\,\frac{A'(S_0)}{A(S_0)}.$$

Trực giác: $\theta$ đo annuity co lại bao nhiêu phần trăm khi rate tăng 1% — chính là độ cong sinh ra convexity. Tính cho swap 10Y annual, $S_0 = 4.5\%$, $n=10$. Tử số của $A$: $1-1.045^{-10} = 1 - 0.6439 = 0.3561$, chia $0.045$ ra $A(4.5\%)=7.913$. Đạo hàm (lấy đối xứng số quanh $S_0$, hoặc giải tích $A'(S)=\big[nS(1+S)^{-n-1}-(1-(1+S)^{-n})\big]/S^2$) cho $A'(4.5\%)\approx -38.9$. Vậy

$$A(4.5\%) = \frac{1 - 1.045^{-10}}{0.045} = 7.913, \qquad A'(4.5\%) \approx -38.9,$$
$$\theta = -\,0.045\times\frac{-38.9}{7.913} = 0.221.$$

Giờ ráp số với vol lognormal ngụ ý $\sigma = 20\%$ (tức $\sigma_{\text{bp}} \approx \sigma\times S_0 = 0.20\times4.5\% = 90\,\text{bp}$, hợp regime), quan sát tại $T = 5$ năm. Phần lồi thô $e^{\sigma^2 T} - 1 = e^{0.04\times5} - 1 = e^{0.2} - 1 = 0.2214$. Vậy

$$\text{CA} \approx 0.045 \times 0.2214 \times 0.221 \approx 0.00220 = 22.0\text{bp}.$$

Đọc kết quả như desk: forward swap rate 10Y hôm nay là 4.50%, nhưng CMS coupon phải định giá ở $4.50\% + 0.22\% = 4.72\%$ — convexity adjustment ~**22bp**, một khoản đáng kể (và với swap dài hơn hoặc $T$ xa hơn còn lớn hơn nhiều). Quan trọng là con số *không treo trên một hệ số ma thuật* nữa: $\theta = 0.221$ đến thẳng từ log-đạo hàm của annuity, ai cũng tính lại được. Adjustment *tăng theo vol bình phương và theo thời gian quan sát*: nếu vol nhảy lên 25% thì phần lồi thành $e^{0.0625\times5}-1 = e^{0.3125}-1 = 0.367$, adjustment vọt lên $0.045\times0.367\times0.221 \approx 36.5\,\text{bp}$ — tăng hai phần ba chỉ vì vol nhích 5 điểm, vì adjustment vào vol *bình phương*. Đây là lý do CMS book có vega thật (nhạy vol) dù bề ngoài chỉ là "trả swap rate" — và vì sao phải replicate trên smile chứ không dùng một vol ATM: các strike xa (rate rất cao) đóng góp đuôi tích phân, mà đuôi lại đúng chỗ smile lệch nhiều nhất khỏi ATM, khiến giá replication đầy đủ lệch khỏi xấp xỉ linear-TSR một-vol này. Trong `quantc`, adjustment này ứng với `cmsConvexityAdjustment` trong `src/analytics`.

**CMS spread và HW2F.** Sản phẩm nặng hơn là CMS spread option — trả $\max(S^{10Y} - S^{2Y} - K, 0)$, cược *hình dạng* curve (steepener/flattener). Adjustment lúc này cần correlation giữa hai swap rate, mà correlation là thứ một-factor Hull-White không sinh được (mọi rate động cùng một Brownian → correlation $= 1$). Đây chính là chỗ **HW2F/G2++** không thể thiếu: nhân tố thứ hai cho ta điều chỉnh correlation giữa đoạn 2Y và 10Y của curve về đúng mức thị trường (~70–90%), và convexity của mỗi chân vẫn replicate trên smile riêng. Để thấy correlation quan trọng bằng số: giá một spread option xấp xỉ tỉ lệ với vol của spread, mà $\sigma_{\text{spread}}^2 = \sigma_{10}^2 + \sigma_2^2 - 2\rho\,\sigma_{10}\sigma_2$; nếu hai chân vol xấp xỉ nhau ($\sigma_{10}\approx\sigma_2\approx\sigma$) thì $\sigma_{\text{spread}}=\sigma\sqrt{2(1-\rho)}$ — với $\rho=0.8$ ra $\sigma\sqrt{0.4}=0.632\sigma$, còn nếu model một-factor ép $\rho=1$ thì $\sigma_{\text{spread}}=0$ và option gần như *vô giá trị*. Sai correlation ở đây không phải lệch vài bp mà là mis-price cả bậc độ lớn. CMS spread vì thế là bài toán "hai smile cộng một correlation" — nơi analytics convexity, model chọn (HW2F), và curve construction gặp nhau thành một deal.

## 9.7 Ráp mọi thứ lại: từ curve đến exotic

Nhìn lại toàn chương, một dây chuyền hiện ra. Đoạn đầu curve neo bằng SOFR futures — cần *convexity adjustment* Hull-White (2.25bp ở ví dụ 9.2, dạng xấp xỉ $a\to0$) để chuyển futures rate thành forward. Đoạn dài neo bằng OIS/swap — bootstrap ra $P(0,1)=0.96154$, $P(0,2)=0.92003$, sinh forward 1Y1Y $=4.51\%$ "phóng đại" độ dốc; cùng bộ curve ấy định giá một swap trả-fixed-3% còn 2 năm ở MTM $+1.89$ và cho DV01 $\approx 0.0189\,\text{/bp}$. Curve tách đôi thành forecast và discount theo CSA (multi-curve, 9.4): quên basis 50bp là mis-price 46bp trên một cashflow, và dùng sai curve xccy là lệch 1.3 triệu EUR trên 100M. Trên curve đó dựng smile của rates qua swaption cube, parametrize bằng SABR normal — một payer swaption ATM 1Y10Y ở 100bp vol trị giá 3.19% notional (~40bp running), và ta đã kiểm chéo rằng lognormal 25% cho đúng con số ấy. Model chọn theo bài toán: SABR cho vanilla, Hull-White (affine, $B=7.87$ và $A=0.8989$ ở 10Y, half-life 14 năm) cho Bermudan và XVA, LMM (drift state-dependent, tổng từ $\beta(t)$, chỉ Monte Carlo) cho exotic đa-tenor. Và các convexity adjustment — futures 2.25bp, CMS 22bp với $\theta=0.221$ dẫn từ annuity, CMS spread nơi correlation $\rho=0.8$ quyết định cả bậc độ lớn — là những cây cầu nối analytics với model, mỗi cái là *giá của một rổ instrument thực* chứ không phải hệ số ma thuật.

Đó là bức tranh tại sao rates là thị trường của Q-quant "nặng đô": không có một con số nào đứng một mình. Một CMS coupon 22bp adjustment kéo theo cả swaption smile; một swaption smile đứng trên curve; curve đứng trên đúng loại collateral; collateral kéo vào XVA. Nắm được dây chuyền này — và tính được từng mắt xích ra số — là ranh giới giữa một junior đọc công thức và một desk quant hiểu vì sao thị trường lớn nhất hành tinh vận hành như nó vận hành.

# Chương 10: FX derivatives

FX là asset class kỳ lạ nhất trong họ derivatives, và chính sự kỳ lạ đó biến nó thành phòng thí nghiệm đẹp nhất để hiểu quant. Mọi thứ ta học ở equity — Black-Scholes, delta, smile, measure — vẫn đúng, nhưng khúc xạ qua một lăng kính mới: **có hai đồng tiền, nên có hai risk-neutral measure**. Một cây call trên EUR/USD với người ở New York là một cây put trên USD/EUR với người ở Frankfurt; hai người này chiết khấu bằng hai lãi suất khác nhau, coi hai đồng tiền khác nhau là "tiền mặt phi rủi ro". Cùng một hợp đồng, hai numéraire. Sự đối xứng đó bắt buộc ta phải cẩn thận về *đứng ở đâu mà nhìn*, và phần thưởng là FX trở thành thị trường options thanh khoản nhất, chuẩn hóa nhất hành tinh: nó không quote theo strike, mà quote theo **delta**; không quote một mặt vol, mà quote ba con số — ATM, risk reversal, butterfly — rồi từ đó dựng lại cả smile.

Chương này đi từ nền no-arbitrage đơn giản nhất (covered interest parity) lên tới những cấu trúc bán chạy và nguy hiểm nhất cho retail (TARF). Xuyên suốt, ta neo vào một bộ số duy nhất để mạch không đứt: cặp **EUR/USD**, spot $S_0 = 1.1000$ (số USD cho một EUR), lãi suất domestic USD $r_d = 5\%$, lãi suất foreign EUR $r_f = 3\%$, maturity $T = 1$ năm. Quy ước: $S$ luôn là *giá của một đơn vị foreign tính bằng domestic*. Với EUR/USD thì foreign = EUR, domestic = USD, nên $S$ tăng nghĩa là EUR mạnh lên. Giữ chặt quy ước "foreign/domestic" này trong đầu — một nửa số lỗi của người mới trong FX đến từ việc lẫn ai là foreign, ai là domestic.

## 10.1 Covered interest parity: forward FX không phải là dự báo

Vì sao mục này tồn tại: trước khi nói tới vol, ta phải chốt forward. Và forward FX là một trong vài chỗ hiếm hoi trong finance mà giá bị **khóa cứng bởi no-arbitrage** — nó không chứa một chút kỳ vọng nào về tương lai, nó thuần túy là hai lãi suất ép vào nhau. Ở equity, forward $F = S_0 e^{(r-q)T}$ cũng no-arbitrage, nhưng dividend yield $q$ là một ước lượng mờ; ở FX, cả hai "yield" đều là lãi suất tiền tệ quan sát được, nên forward FX sạch hơn về mặt lý thuyết bất kỳ forward nào khác.

Hãy dựng arbitrage một cách tường minh. Bạn có 1 USD hôm nay và muốn có USD sau 1 năm. Có hai đường. Đường thứ nhất: gửi USD ở lãi suất $r_d$, sau 1 năm nhận $e^{r_d T}$ USD. Đường thứ hai: đổi 1 USD ra $1/S_0$ EUR ngay bây giờ, gửi EUR ở lãi suất $r_f$ để sau 1 năm có $\frac{1}{S_0}e^{r_f T}$ EUR, và ngay hôm nay khóa tỷ giá đổi ngược lại bằng một forward contract giá $F$. Sau 1 năm đường hai cho $\frac{1}{S_0}e^{r_f T}\cdot F$ USD. Hai đường đều bắt đầu bằng 1 USD, đều kết thúc bằng USD, không đường nào chịu rủi ro tỷ giá (forward đã khóa) — nên chúng phải cho cùng một kết quả, nếu không có bữa trưa miễn phí:

$$e^{r_d T} = \frac{1}{S_0}e^{r_f T}\, F \quad\Longrightarrow\quad \boxed{F = S_0\, e^{(r_d - r_f)T}}$$

Đây là **covered interest parity** (CIP). "Covered" vì rủi ro tỷ giá đã được che (cover) bằng forward. Thay số:

$$F = 1.1000 \times e^{(0.05 - 0.03)\times 1} = 1.1000 \times e^{0.02} = 1.1000 \times 1.02020 = 1.12222.$$

Đọc con số: forward EUR/USD 1 năm là $1.12222$, cao hơn spot $1.1000$. EUR forward mạnh hơn EUR spot. Điều này *phản trực giác* với người mới: USD có lãi suất cao hơn (5% so với 3%), lẽ ra USD phải "hấp dẫn hơn"? Đúng, và chính vì thế thị trường phải bù: ai giữ EUR mất 2% carry mỗi năm so với giữ USD, nên forward phải đền lại bằng cách cho EUR tăng giá $2\%$ trên giấy. Forward *không* dự báo EUR sẽ lên; nó chỉ bù trừ chênh lệch lãi suất để không ai arbitrage được. Đây là trực giác cốt lõi của FX quant: **forward là carry, không phải view**. Nếu forward *nhỏ hơn* mức CIP đòi hỏi, một người vay USD, đổi ra EUR, gửi EUR và bán forward EUR sẽ khóa lời không rủi ro; dòng tiền chênh lệch đúng bằng phần forward lệch khỏi $1.12222$, và chính dòng arbitrage đó ép forward về đúng chỗ.

Chênh lệch $F - S_0 = 1.12222 - 1.1000 = 0.02222$ gọi là **forward points** (ở đây khoảng 222 pip, với quy ước 1 pip $= 0.0001$ cho EUR/USD). Dân desk quote forward bằng points chứ không bằng giá tuyệt đối, vì points ổn định qua ngày trong khi spot nhảy liên tục. Khi $r_d > r_f$ thì foreign ở *forward premium* (points dương); ngược lại foreign ở *forward discount*. Với EUR/USD trong bộ số của ta, USD lãi cao hơn nên EUR ở forward premium 222 pip.

Một chú thích thực chiến quan trọng cho thời hậu-LIBOR (đã bàn ở Chương 9 về multi-curve): CIP trong thực tế bị vi phạm một cách có hệ thống kể từ 2008 bởi **cross-currency basis**. Nhu cầu funding USD của ngân hàng ngoài Mỹ đẩy giá USD collateral lên, tạo ra một spread $b$ khiến $F = S_0 e^{(r_d - r_f + b)T}$. Basis EUR/USD thường âm vài chục bps; ví dụ $b = -0.30\%$ sẽ kéo forward xuống $1.1000 \times e^{(0.02 - 0.003)} = 1.11887$, tức mất khoảng 34 pip so với CIP tinh khiết — không nhỏ trên một book vài tỷ. Discounting FX ngày nay phải làm trên đường **xccy** riêng, không dùng thẳng OIS domestic. Ta gác chi tiết đó để giữ ví dụ sạch, nhưng phải biết CIP "tinh khiết" chỉ là mô hình bậc một.

## 10.2 Hai measure, Garman-Kohlhagen, và định lý Siegel

Vì sao FX có hai measure: numéraire domestic là money market account USD, $B^d_t = e^{r_d t}$; numéraire foreign là money market account EUR, $B^f_t = e^{r_f t}$. Dưới risk-neutral measure domestic $\mathbb{Q}^d$, mọi tài sản chia cho $B^d$ phải là martingale. Tài sản gì? Không phải $S_t$ trực tiếp — mà là *giá trị bằng USD của việc giữ 1 EUR sinh lãi*, tức $S_t B^f_t$. Một người Mỹ mua 1 EUR không để nó nằm im; anh ta gửi nó lấy lãi $r_f$, nên tài sản USD-denominated thật sự là $S_t B^f_t$. Vậy $S_t B^f_t / B^d_t = S_t e^{(r_f - r_d)t}$ phải là martingale dưới $\mathbb{Q}^d$. Điều kiện martingale ép drift của quá trình này bằng 0; với $dS_t = \mu_d S_t\,dt + \sigma S_t\,dW_t^d$, đạo hàm tích cho drift của $S_t e^{(r_f-r_d)t}$ là $(\mu_d + r_f - r_d)$, nên $\mu_d = r_d - r_f$:

$$dS_t = (r_d - r_f)\,S_t\,dt + \sigma\,S_t\,dW_t^d.$$

Đây chính là Black-Scholes với "dividend yield" $q = r_f$: đồng foreign sinh lãi $r_f$ y hệt một cổ phiếu trả dividend liên tục. Toàn bộ máy **Garman-Kohlhagen** (phiên bản FX của BS) rơi ra ngay: call trên FX giá

$$C = e^{-r_f T} S_0\, N(d_1) - e^{-r_d T} K\, N(d_2), \qquad d_{1,2} = \frac{\ln(S_0/K) + (r_d - r_f \pm \tfrac12\sigma^2)T}{\sigma\sqrt T}.$$

Đừng để công thức nằm suông — hãy chạy một cây vanilla FX call bằng số. Lấy strike ATM $K = 1.1279$ (ta sẽ thấy ở mục 10.4 đây chính là strike delta-neutral), vol $\sigma = 10\%$. Tính $d_1, d_2$:

$$d_1 = \frac{\ln(1.10/1.1279) + (0.02 + 0.005)\times 1}{0.10} = \frac{-0.02505 + 0.025}{0.10} = -0.0005,\quad d_2 = d_1 - 0.10 = -0.1005.$$

Tra bảng: $N(d_1) = 0.4998$, $N(d_2) = 0.4600$. Ghép vào:

$$C = e^{-0.03}\times 1.10 \times 0.4998 - e^{-0.05}\times 1.1279 \times 0.4600 = 0.5335 - 0.4935 = 0.0400.$$

Đọc con số: một EUR/USD call ATM 1 năm, vol 10%, giá khoảng $0.0400$ USD trên mỗi 1 EUR notional — tức mua quyền mua 1 triệu EUR ở strike $1.1279$ tốn chừng 40.000 USD premium. Vì strike gần đúng forward và vol vừa phải, giá xấp xỉ công thức đơn giản hóa của một ATM-forward option, $C \approx 0.4\,\sigma\sqrt T \times e^{-r_d T}\times F = 0.4\times 0.10 \times e^{-0.05}\times 1.12222 = 0.0427$ — cùng độ lớn, hơi cao hơn vì xấp xỉ này dùng ATM-forward straddle chứ không phải chính strike $1.1279$. Đây là điểm neo giá tuyệt đối trước khi ta bước vào smile: mọi hiệu chỉnh smile ở các mục sau chỉ là những khoản cộng/trừ nhỏ quanh con số $0.0400$ này.

Chỗ tinh tế: nếu ta đổi góc nhìn sang Frankfurt, người Đức coi USD/EUR $= 1/S_t$ là underlying của họ. Đây là chỗ **Itô convexity** hiện ra, và đáng dẫn xuất tường minh vì nó là mầm của cả Siegel lẫn quanto. Đặt $Y_t = f(S_t) = 1/S_t$, với $dS = \mu S\,dt + \sigma S\,dW$. Ta có $f'(S) = -1/S^2$, $f''(S) = 2/S^3$. Công thức Itô cho hàm của một quá trình:

$$dY = f'(S)\,dS + \tfrac12 f''(S)\,(dS)^2 = -\frac{1}{S^2}\big(\mu S\,dt + \sigma S\,dW\big) + \frac12\cdot\frac{2}{S^3}\cdot\sigma^2 S^2\,dt.$$

Gộp lại và chia cho $Y = 1/S$:

$$\frac{dY}{Y} = \big(-\mu + \sigma^2\big)\,dt - \sigma\,dW.$$

Cái hạng $+\sigma^2$ chính là Itô convexity của hàm lồi $1/x$: đường cong $1/x$ lồi lên, nên trung bình của $1/S$ vượt $1/\mathbb{E}[S]$ đúng một lượng bậc hai theo vol. Đây là **Siegel's paradox**: kỳ vọng của tỷ giá nghịch đảo *không* bằng nghịch đảo của kỳ vọng, $\mathbb{E}[1/S] \neq 1/\mathbb{E}[S]$; chênh lệch đúng cỡ $\sigma^2$. Hệ quả trực tiếp: drift của $Y$ dưới measure foreign phải là $r_f - r_d$ (đối xứng với drift của $S$ dưới domestic), và ta thấy $-\mu + \sigma^2$ với $\mu = r_d - r_f$ cho $r_f - r_d + \sigma^2$ dưới measure domestic — đúng bằng phần cần để đổi sang measure foreign triệt tiêu cái $+\sigma^2$. Cùng một sự vênh đó, khi ta chuyển drift của $S$ từ measure domestic sang measure foreign, sinh ra **quanto adjustment** — ta sẽ định lượng ở mục 10.6. Đây là lý do FX là nơi duy nhất mà "đổi measure" không phải trò kỹ thuật khô khan mà có nghĩa vật lý: đổi measure = đổi chỗ đứng địa lý, và cái giá của việc đổi chỗ đứng đo bằng đúng $\sigma^2$.

## 10.3 Vì sao FX quote theo delta, và premium-adjusted delta

Vì sao mục này tồn tại: nếu bạn hỏi một equity trader "vol của strike 4200 là bao nhiêu", họ trả lời được. Nếu bạn hỏi FX trader "vol của strike 1.1500", họ sẽ cau mày — vì họ quote theo **delta**, không theo strike. Hiểu tại sao là hiểu cả văn hóa thị trường FX.

Lý do là **tính bất biến theo spot**. Spot EUR/USD nhảy suốt ngày. Một strike 1.1500 hôm nay là khoảng 4.5% trên forward, tuần sau nếu spot lên 1.13 thì cùng con số strike đó chỉ còn khoảng 1.7% trên forward mới — cùng con số strike nhưng nghĩa kinh tế đã đổi hẳn. Delta thì gần như bất biến: một option "25-delta call" luôn là một option "OTM vừa phải, xác suất kết thúc in-the-money khoảng 25%", bất kể spot ở đâu. Quote theo delta khiến grid vol *dán chặt vào moneyness*, nên smile giữ hình dạng ổn định qua thời gian, và trader có thể so vol hôm nay với vol tuần trước mà không phải hiệu chỉnh spot. Đó là lý do sâu xa: delta là moneyness đã chuẩn hóa theo vol và thời gian.

Nhưng delta trong FX có một cạm bẫy khét tiếng: **premium-adjusted delta**. Khi bạn mua một EUR/USD call, bạn trả premium. Premium đó tính bằng đồng nào? Nếu premium tính bằng domestic (USD), delta để hedge là spot delta thường:

$$\Delta_{\text{spot}} = e^{-r_f T} N(d_1).$$

Nhưng nhiều cặp FX quote premium bằng *foreign* currency (ví dụ EUR/USD đôi khi premium tính bằng EUR). Khi đó bản thân premium là một khoản foreign, mang rủi ro tỷ giá riêng, và số EUR bạn phải hedge đã bị giảm đi đúng bằng premium foreign đó. Kết quả là delta để hedge phải trừ đi phần premium — sau đại số ra đúng dạng qua $N(d_2)$ thay vì $N(d_1)$:

$$\Delta_{\text{pa}} = e^{-r_f T}\,\frac{K}{F}\,N(d_2).$$

Cho bộ số của ta, xét call strike $K = 1.15$, vol $\sigma = 10\%$. Tính $d_1, d_2$ với $F = 1.12222$ (dùng dạng forward $d_1 = \frac{\ln(F/K) + \frac12\sigma^2 T}{\sigma\sqrt T}$):

$$d_1 = \frac{\ln(1.12222/1.15) + 0.5\times0.10^2\times1}{0.10\times1} = \frac{-0.02445 + 0.005}{0.10} = -0.1945,\quad d_2 = d_1 - 0.10 = -0.2945.$$

Vậy $N(d_1) = 0.4229$, $N(d_2) = 0.3841$. Spot delta $= e^{-0.03}\times 0.4229 = 0.4104$; premium-adjusted delta $= e^{-0.03}\times\frac{1.15}{1.12222}\times 0.3841 = 0.3821$. Chênh nhau $0.4104$ so với $0.3821$ — khoảng 2.8 delta-point trên một option OTM vừa phải. Trên một book vài tỷ notional, gần ba delta-point là hàng chục triệu USD hedge sai. Đây là loại chi tiết mà một junior bỏ qua thì P&L rò rỉ âm thầm; một quant desk giỏi thì biết *chính xác* cặp nào dùng convention nào (quy tắc kinh nghiệm: cặp thanh khoản cao có USD làm domestic thường dùng premium-adjusted khi premium là EUR/GBP/AUD; các cặp JPY và cặp EM thường không). Convention delta cũng còn phân biệt spot delta hay forward delta, có discount hay không — mỗi broker sheet ghi rõ. Bài học: **trước khi tính gì, đọc convention** — vì hai option "cùng 25-delta" theo hai convention khác nhau có thể là hai strike khác nhau thấy rõ.

## 10.4 Smile bằng ba con số: ATM, risk reversal, butterfly

Vì sao mục này tồn tại: đây là trái tim của FX vol. Thị trường không đưa bạn cả hàm $\sigma(K)$; nó đưa bạn ba số cho mỗi maturity, và bạn phải tự dựng lại smile. Ba số đó là cách thị trường phân rã smile thành **level, slope, curvature** — y hệt cách ta phân rã yield curve thành level/slope/curvature, nhưng cho vol.

Con số thứ nhất là **ATM vol**, $\sigma_{\text{ATM}}$. "ATM" ở FX theo convention là *delta-neutral straddle*: chọn strike sao cho một straddle (call + put cùng strike) có delta bằng 0. Với forward delta, điều kiện $\Delta_{\text{call}} + \Delta_{\text{put}} = 0$ cho $N(d_1) - N(-d_1)$... thực ra cho $d_1 = \frac12\sigma\sqrt T$, và giải ra $K_{\text{ATM}} = F\, e^{\frac12 \sigma_{\text{ATM}}^2 T}$. Nó là "đỉnh" của smile, mức vol trung tâm. Lấy $\sigma_{\text{ATM}} = 10\%$:

$$K_{\text{ATM}} = 1.12222 \times e^{0.5\times 0.10^2\times 1} = 1.12222 \times 1.00501 = 1.12785.$$

Con số thứ hai là **25-delta risk reversal**, $\text{RR}_{25} = \sigma_{25c} - \sigma_{25p}$. Nó đo **skew**: chênh vol giữa call 25-delta và put 25-delta. RR dương nghĩa là market trả nhiều hơn cho call OTM — thị trường sợ foreign *lên* (EUR mạnh). RR âm nghĩa là sợ foreign *sụp*. Trong equity, skew gần như luôn âm (sợ crash xuống). Trong FX, dấu của RR thay đổi theo cặp và theo chế độ: cặp emerging như USD/TRY, USD/BRL có RR rất dương — ở đó foreign chính là USD, domestic là TRY, và thị trường sợ đồng local mất giá (tức USD/TRY lên, tức call trên foreign=USD đắt lên), nên phải rất cẩn thận về ai là foreign, ai là domestic. Lấy $\text{RR}_{25} = +1\%$ cho EUR/USD: thị trường trả premium cho EUR upside.

Con số thứ ba là **25-delta butterfly**, $\text{BF}_{25} = \frac{\sigma_{25c} + \sigma_{25p}}{2} - \sigma_{\text{ATM}}$. Nó đo **curvature** — cánh smile cong lên bao nhiêu so với đáy ATM. BF dương (luôn luôn, do smile lồi) nghĩa là hai cánh cao hơn giữa. Lấy $\text{BF}_{25} = 0.25\%$.

Bây giờ đảo ngược ba con số thành hai vol cánh. Từ định nghĩa của RR (hiệu hai cánh) và BF (trung bình hai cánh trừ ATM), giải hệ hai phương trình hai ẩn cho:

$$\sigma_{25c} = \sigma_{\text{ATM}} + \text{BF}_{25} + \tfrac12 \text{RR}_{25}, \qquad \sigma_{25p} = \sigma_{\text{ATM}} + \text{BF}_{25} - \tfrac12 \text{RR}_{25}.$$

Thay số:

$$\sigma_{25c} = 10\% + 0.25\% + 0.5\% = 10.75\%, \qquad \sigma_{25p} = 10\% + 0.25\% - 0.5\% = 9.75\%.$$

Kiểm tra ý nghĩa: call OTM (EUR upside) đắt hơn put OTM ($10.75\% > 9.75\%$), khớp với $\text{RR} > 0$; cả hai cánh cao hơn ATM $10\%$, khớp với $\text{BF} > 0$. Ba con số $\{10\%, +1\%, 0.25\%\}$ đã sinh ra ba điểm smile: $(K_{25p}, 9.75\%)$, $(K_{\text{ATM}}, 10\%)$, $(K_{25c}, 10.75\%)$.

Còn phải tìm strike của hai cánh. Điều kiện 25-delta call (forward delta) là $N(d_1) = 0.25$, tức $d_1 = N^{-1}(0.25) = -0.6745$. Giải ra strike từ $d_1 = \frac{\ln(F/K) + \frac12\sigma^2 T}{\sigma\sqrt T}$, với $\sigma = \sigma_{25c} = 10.75\%$:

$$\ln(F/K) = d_1\,\sigma\sqrt T - \tfrac12\sigma^2 T = -0.6745\times 0.1075 - 0.5\times 0.1075^2 = -0.07251 - 0.00578 = -0.07829,$$

$$K_{25c} = F\, e^{0.07829} = 1.12222\times 1.08144 = 1.2136.$$

Tương tự cho 25-delta put ($N(-d_1) = 0.25 \Rightarrow d_1 = +0.6745$) với $\sigma_{25p} = 9.75\%$: $K_{25p} = 1.0558$. Vậy ba pillar strikes là $1.0558$, $1.1279$, $1.2136$, gắn với ba vol $9.75\%$, $10\%$, $10.75\%$. Ba điểm $(K, \sigma)$ này là toàn bộ dữ liệu vol mà thị trường cho ta ở maturity 1Y — mọi strike khác phải nội/ngoại suy. Đó là công việc của mục sau.

Một chú thích về convention "market butterfly" so với "smile butterfly" mà một desk quant phải phân biệt rạch ròi. Cái $\text{BF}_{25} = \frac{\sigma_{25c}+\sigma_{25p}}{2} - \sigma_{\text{ATM}}$ ta vừa dùng là **smile butterfly** — thuần là số học trên vol. Nhưng broker không quote nó; họ quote **market BF**: vol của một *strategy* butterfly thực (mua một straddle ở hai cánh 25-delta, bán một straddle ATM) sao cho toàn bộ cấu trúc vega-neutral, rồi tính "một con số vol" áp đều làm nó khớp giá thị trường của strategy đó. Hai định nghĩa khác nhau vì market BF nhốt cả hiệu ứng skew (qua RR) vào trong quote, còn smile BF thì không. Chuyển đổi giữa hai cái cần một vòng lặp calibration nhỏ: đoán $\text{BF}^{\text{smile}}$, dựng smile, định giá strategy butterfly, so với giá từ market BF, hiệu chỉnh, lặp. Với BF nhỏ như $0.25\%$ và RR $1\%$ sai lệch giữa hai định nghĩa chỉ cỡ một-hai phần trăm của basis point vol — bỏ qua được. Nhưng ở EM với BF vài phần trăm và RR hai chữ số, dùng nhầm market BF như smile BF làm strike cánh và vol cánh lệch thấy rõ, và mọi thứ downstream (giá barrier, giá TARF) lệch theo.

## 10.5 Vanna-Volga: dựng cả smile từ ba điểm

Vì sao mục này tồn tại: ta có đúng ba điểm smile. Muốn định giá option ở strike $1.15$ (không nằm trên ba pillar), cần một cỗ máy nội suy *có ý nghĩa tài chính*, không phải spline mù. **Vanna-Volga** (VV) là cỗ máy đó, và nó thống trị FX vì nó rẻ, giải tích, và trực giác — nó nói: "giá đúng của một option = giá BS phẳng + chi phí hedge hai Greek bậc cao mà BS phẳng bỏ sót."

Ý tưởng gốc. Black-Scholes giả định vol hằng số, nên nó bỏ qua rủi ro vol thay đổi. Ba Greek đo rủi ro đó là **vega** ($\mathcal{V} = \partial C/\partial\sigma$), **vanna** ($\partial^2 C/\partial S\,\partial\sigma$, đo delta trôi khi vol đổi) và **volga** ($\partial^2 C/\partial\sigma^2$, đo vega trôi khi vol đổi). Trong một thị trường có smile, ba pillar options (25p, ATM, 25c) là ba công cụ đủ để hedge trọn vega, vanna, volga của *bất kỳ* option nào. VV nói: lập một portfolio ba pillar sao cho nó khớp vega/vanna/volga của option mục tiêu, thì chi phí phụ trội của portfolio đó (giá thị trường trừ giá BS phẳng) chính là hiệu chỉnh smile cần cộng vào.

Cụ thể, với option mục tiêu strike $K$, ta tìm ba trọng số $y_1, y_2, y_3$ gắn với ba pillar $K_1 = K_{25p}, K_2 = K_{\text{ATM}}, K_3 = K_{25c}$ sao cho portfolio khớp ba đạo hàm vol. Đây là chỗ hệ ba phương trình *tự khớp* với nội suy bậc hai, và đáng dừng lại xem vì sao. Vega của một vanilla BS là $\mathcal{V} = S_0 e^{-r_f T}\phi(d_1)\sqrt T$. Nếu ta viết mọi thứ theo biến moneyness $x = \ln(K/F)$ thì $d_1, d_2$ tuyến tính theo $x$, và hai Greek bậc cao lộ ra là *đa thức của $x$ nhân với chính vega*:

$$\text{vanna} = -\,\mathcal{V}\,\frac{d_2}{S_0\,\sigma\sqrt T}, \qquad \text{volga} = \mathcal{V}\,\frac{d_1 d_2}{\sigma}.$$

Vanna tỉ lệ với $\mathcal{V}$ nhân một biểu thức *bậc một* theo $x$ (vì $d_2$ tuyến tính theo $x$); volga tỉ lệ với $\mathcal{V}$ nhân $d_1 d_2$, một biểu thức *bậc hai* theo $x$. Vậy hệ "khớp vega, vanna, volga" đúng là hệ "khớp một hàm hằng, một hàm bậc một, một hàm bậc hai của $x$ tại ba điểm $x_1, x_2, x_3$" — và nghiệm của bài toán khớp đa thức bậc hai qua ba điểm chính là **nội suy Lagrange ba điểm**. Đó là lý do sâu xa trọng số VV mang đúng dạng Lagrange theo $x$:

$$y_i = \frac{\mathcal{V}(K)}{\mathcal{V}(K_i)} \prod_{j\neq i} \frac{x - x_j}{x_i - x_j}, \qquad x = \ln(K/F),\ x_i = \ln(K_i/F),$$

với $\mathcal{V}$ là vega BS tính ở $\sigma_{\text{ATM}}$. Giá VV là giá BS phẳng cộng tổng có trọng số của "phụ phí smile" từng pillar:

$$C_{\text{VV}}(K) = C_{\text{BS}}(K;\sigma_{\text{ATM}}) + \sum_{i=1}^{3} y_i \Big[ C_{\text{BS}}(K_i;\sigma_i) - C_{\text{BS}}(K_i;\sigma_{\text{ATM}}) \Big].$$

Chạy số cho $K = 1.15$ với ba pillar đã có. Trước hết các moneyness: $x = \ln(1.15/1.12222) = 0.02445$; $x_1 = \ln(1.0558/1.12222) = -0.06101$, $x_2 = \ln(1.1279/1.12222) = 0.00500$, $x_3 = \ln(1.2136/1.12222) = 0.07829$. Đưa vào công thức Lagrange (vega tính ở $\sigma_{\text{ATM}}=10\%$), ba trọng số ra:

$$y_1 = -0.139, \qquad y_2 = 0.933, \qquad y_3 = 0.209.$$

Trọng số ATM gần 1 (option $1.15$ chủ yếu giống ATM), hai cánh nhỏ và trọng số put cánh *âm* — vì strike $1.15$ nằm lệch về phía call, portfolio phải bán bớt put cánh để khớp vanna. Giờ tính phụ phí smile từng pillar một cách tường minh — chỉ pillar 25c và 25p đóng góp, vì pillar ATM có $\sigma_2 = \sigma_{\text{ATM}}$ nên $C_{\text{BS}}(K_2;\sigma_2) - C_{\text{BS}}(K_2;\sigma_{\text{ATM}}) = 0$:

- Pillar 25p: phụ phí $= C_{\text{BS}}(1.0558;\,9.75\%) - C_{\text{BS}}(1.0558;\,10\%) = -0.000852$ (âm vì cánh put có vol *thấp hơn* ATM). Nhân trọng số: $y_1 \times (-0.000852) = (-0.139)\times(-0.000852) = +0.000118$.
- Pillar 25c: phụ phí $= C_{\text{BS}}(1.2136;\,10.75\%) - C_{\text{BS}}(1.2136;\,10\%) = +0.002494$ (dương vì cánh call có vol cao hơn). Nhân trọng số: $y_3 \times 0.002494 = 0.209\times 0.002494 = +0.000521$.

Tổng correction $= 0.000118 + 0.000521 = +0.000640$ (đơn vị giá option, USD trên 1 EUR notional). Giá BS phẳng $C_{\text{BS}}(1.15; 10\%) = 0.031165$, nên

$$C_{\text{VV}}(1.15) = 0.031165 + 0.000640 = 0.031805.$$

Đảo ngược giá này về implied vol (giải BS ngược cho $\sigma$ sao cho $C_{\text{BS}}(1.15;\sigma) = 0.031805$) cho $\sigma_{\text{VV}}(1.15) = 10.15\%$. Đọc: strike $1.15$ nằm giữa ATM và cánh call, thị trường định giá nó ở vol $10.15\%$ — cao hơn ATM $10\%$ đúng như kỳ vọng (nó lệch về phía call skew dương), thấp hơn hẳn cánh call $10.75\%$ vì chưa OTM đủ xa. Ba con số thị trường đã sinh ra một vol nội suy nhất quán cho *mọi* strike. Đó là toàn bộ phép màu VV: hai đóng góp cánh, một dương một dương-hơn, cộng lại thành đúng $+0.15$ vol-point over ATM.

Ứng dụng đắt giá nhất của VV là **định giá barrier**. Barrier options nhạy vanna/volga khủng khiếp — khi spot bò gần barrier, delta và vega nhảy dữ dội, nên chúng cực nhạy với hình dạng smile chứ không chỉ mức vol ATM. VV cho một cách nhanh để nhét smile vào giá barrier: tính giá barrier BS phẳng rồi cộng correction VV có trọng số bằng "khả năng sống sót" (survival probability) của barrier — vì nếu option đã bị knock out thì ta không còn phải trả phụ phí smile nữa, nên phụ phí smile phải nhân với xác suất option còn sống để chạm tới nó. Đây là lý do mọi FX desk có một hàm VV cho barriers; nó không hoàn hảo như local-stochastic vol (SLV) đầy đủ, nhưng nó tức thời và đủ tốt cho quote. Trong repo, mảnh smile FX gắn với `models/fx/sabr` (SABR cho từng maturity) còn quanto/convexity gắn với `analytics/convexity`.

## 10.6 Quanto và composite: khi payoff và thanh toán lệch tiền

Vì sao mục này tồn tại: đây là chỗ measure hai đồng tiền trả tiền cho ta con số cụ thể. Một **quanto** là option mà underlying là foreign nhưng payoff *thanh toán bằng domestic với tỷ giá cố định bằng 1*. Ví dụ kinh điển: nhà đầu tư USD muốn chơi Nikkei (index yen) nhưng không muốn dính rủi ro JPY/USD — họ mua quanto call trên Nikkei trả USD, mỗi điểm Nikkei = 1 USD. Payoff phụ thuộc Nikkei, nhưng đóng gói trong tiền USD ở tỷ giá fix. Câu hỏi: định giá thế nào khi underlying sống ở measure foreign còn ta chiết khấu ở measure domestic?

Câu trả lời nằm ở **đổi measure**, và nó sinh ra một hiệu chỉnh drift đẹp. Gọi $S$ là underlying (giá foreign, ví dụ Nikkei tính bằng JPY) với vol $\sigma_S$, và $X$ là tỷ giá (số domestic cho một foreign, USD/JPY) với vol $\sigma_X$, tương quan $\rho$ giữa $dW^S$ và $dW^X$. Dưới measure foreign $\mathbb{Q}^f$, drift của $S$ là $r_f - q_S$ (với $q_S$ là dividend/yield của underlying foreign). Để định giá payoff trả bằng domestic, ta cần drift của $S$ dưới measure *domestic* $\mathbb{Q}^d$. Đổi measure $\mathbb{Q}^f \to \mathbb{Q}^d$ tương đương với việc đổi numéraire từ $B^f$ sang $B^d$, và Radon-Nikodým derivative gắn với quá trình tỷ giá $X$; theo định lý Girsanov, đổi numéraire dịch Brownian một lượng đúng bằng vol của log Radon-Nikodým, tức vol của $X$. Vì $dW^S$ tương quan $\rho$ với $dW^X$, drift của $S$ bị dịch một lượng $\rho\,\sigma_S\,\sigma_X$ (chính là hiệp phương sai tức thời giữa log-$S$ và log-$X$). Kết quả cốt lõi:

$$\text{(drift $S$ dưới $\mathbb{Q}^d$)} = \text{(drift $S$ dưới $\mathbb{Q}^f$)} \;-\; \rho\,\sigma_S\,\sigma_X.$$

Cái hạng $-\rho\,\sigma_S\,\sigma_X$ chính là **quanto adjustment**. Trực giác: nếu underlying $S$ và tỷ giá $X$ dương tương quan ($\rho > 0$), thì mỗi khi $S$ tăng, $X$ cũng tăng, nghĩa là payoff (đo bằng domestic ở tỷ giá cố định) *bỏ lỡ* phần lợi mà một người thật đổi tiền sẽ nhận — nên fair value của quanto forward phải *thấp hơn*, tức drift bị kéo xuống $\rho\sigma_S\sigma_X$. Đây là cùng một Itô-covariance đã sinh Siegel's paradox ở mục 10.2, giờ hiện ra dưới dạng một con số định giá được.

Ví dụ số. Underlying foreign forward $F^f = 4000$ (điểm index, tính trong measure foreign), $\sigma_S = 20\%$, $\sigma_X = 10\%$, $\rho = 0.30$, $T = 1$. Quanto adjustment cho drift:

$$-\rho\,\sigma_S\,\sigma_X = -0.30 \times 0.20 \times 0.10 = -0.0060 = -0.60\%\ \text{mỗi năm}.$$

Quanto forward (giá kỳ vọng của $S_T$ dưới $\mathbb{Q}^d$) là forward thường nhân hệ số điều chỉnh:

$$F^{\text{quanto}} = F^f\, e^{-\rho\sigma_S\sigma_X\,T} = 4000\times e^{-0.006} = 4000\times 0.99402 = 3976.07.$$

Chênh $4000 - 3976.07 = 23.93$ điểm, tức khoảng $0.60\%$ — đúng bằng adjustment ở bậc một. Con số này chính là cái mà hàm `quantoForward` trong `analytics/convexity` trả về khi nhận vào forward, hai vol và correlation. Đọc: vì Nikkei và JPY dương tương quan, quanto forward *thấp hơn* forward thường; nếu $\rho$ âm thì quanto forward sẽ cao hơn.

Để thấy adjustment chảy tới tận *giá option cuối*, cắm $F^{\text{quanto}} = 3976.07$ làm forward vào công thức Black (discount domestic $r_d = 5\%$), định giá một quanto call ATM strike $K = 4000$, $\sigma_S = 20\%$:

$$d_1 = \frac{\ln(3976.07/4000) + 0.5\times 0.20^2}{0.20} = \frac{-0.00600 + 0.020}{0.20} = 0.0700,\quad d_2 = d_1 - 0.20 = -0.1300,$$

$$C^{\text{quanto}} = e^{-0.05}\big[3976.07\times N(0.0700) - 4000\times N(-0.1300)\big] = e^{-0.05}\big[3976.07\times 0.5279 - 4000\times 0.4483\big] = 290.93.$$

So với cùng cây call nhưng bỏ quanto adjustment (dùng $F = 4000$) giá $303.08$: hiệu chỉnh $-0.60\%$ trên forward kéo giá quanto call xuống hơn 12 điểm ($303.08 - 290.93 = 12.15$), tức khoảng $4.0\%$ giá option. Một sai dấu $\rho$ ở đây không phải làm tròn — nó lật hẳn chiều adjustment: với $\rho = -0.30$ quanto forward sẽ là $4024.1$ và giá call bật *lên* trên $303$, nên nhầm dấu làm giá lệch cả hơn hai chục điểm, tức trên $8\%$ giá. Rủi ro lớn nhất của desk khi warehousing quanto vì thế là **correlation risk**: $\rho$ không quote được thanh khoản, phải mark từ historical hoặc từ hiếm hoi correlation swaps, và nó trôi. Một book quanto lớn là một canh bạc correlation trá hình.

Anh em của quanto là **composite** option: payoff cũng trên underlying foreign nhưng trả domestic ở tỷ giá *thả nổi* (đổi thật lúc đáo hạn). Composite không cần fix tỷ giá, nên underlying hiệu dụng của nó là tích $S\cdot X$ (giá foreign nhân tỷ giá = giá đo bằng domestic), và vol của một tích lognormal là

$$\sigma_{\text{eff}}^2 = \sigma_S^2 + \sigma_X^2 + 2\rho\sigma_S\sigma_X.$$

Với số của ta: $\sigma_{\text{eff}} = \sqrt{0.20^2 + 0.10^2 + 2\times0.30\times0.20\times0.10} = \sqrt{0.04 + 0.01 + 0.012} = \sqrt{0.062} = 24.9\%$. Composite đắt hơn (vol $24.9\%$ so với vol thuần $20\%$ của quanto) vì nó gánh cả rủi ro FX; quanto thì "cắt" rủi ro FX bằng cách fix tỷ giá và trả giá bằng correlation adjustment thay vì bằng vol cao hơn. Cùng một $\rho$ đi vào hai chỗ khác nhau: ở quanto nó dịch *drift* (một hiệu chỉnh bậc một, kéo giá xuống); ở composite nó bơm vào *vol* (một hiệu chỉnh bậc hai, đẩy giá lên). Hiểu cặp quanto/composite là hiểu trọn cách hai đồng tiền tương tác trong payoff.

## 10.7 Barriers và touches: nơi FX exotics kiếm sống

Vì sao mục này tồn tại: phần lớn *volume* exotic FX không phải vanilla mà là **barriers và touches** — chúng rẻ hơn vanilla, khớp view có điều kiện, và là bánh mì bơ của desk. Chúng cũng là nơi smile risk phát nổ, nên là bài kiểm tra thật cho mọi mô hình vol ta vừa dựng.

**One-touch** trả một khoản cố định (say 1 đơn vị domestic) *nếu và khi* spot chạm một barrier $B$ bất kỳ lúc nào trước đáo hạn. **No-touch** ngược lại: trả tiền nếu spot *không bao giờ* chạm $B$. Vì cấu trúc "touch/no-touch" chỉ hỏi *có chạm hay không*, giá của nó gần như là xác suất chạm barrier (nhân discount). Tính bằng công thức phản xạ (reflection principle) cho Brownian có drift. Gọi $x = \ln(B/S_0)$, drift log dưới $\mathbb{Q}^d$ là $\nu = r_d - r_f - \frac12\sigma^2$. Xác suất chạm barrier trên $B > S_0$ ít nhất một lần trong $[0,T]$ gồm hai phần — phần "kết thúc trên barrier" cộng phần "đã chạm rồi rơi lại", cái sau mang hệ số phản xạ $e^{2\nu x/\sigma^2}$:

$$\mathbb{P}(\text{touch}) = N\!\Big(\frac{-x + \nu T}{\sigma\sqrt T}\Big) + e^{2\nu x/\sigma^2}\, N\!\Big(\frac{-x - \nu T}{\sigma\sqrt T}\Big).$$

Ví dụ: barrier trên $B = 1.20$, spot $S_0 = 1.10$, $\sigma = 10\%$. Ta có $x = \ln(1.20/1.10) = 0.08701$, $\nu = 0.05 - 0.03 - 0.005 = 0.015$. Số hạng một: $N\big(\frac{-0.08701 + 0.015}{0.10}\big) = N(-0.7201) = 0.2357$. Số hạng hai: hệ số phản xạ $e^{2\times0.015\times0.08701/0.01} = e^{0.2610} = 1.2983$ nhân $N\big(\frac{-0.08701 - 0.015}{0.10}\big) = N(-1.0201) = 0.1538$, cho $1.2983\times0.1538 = 0.1997$. Tổng:

$$\mathbb{P}(\text{touch}) = 0.2357 + 0.1997 = 0.4355.$$

Giá one-touch (trả 1 USD lúc đáo hạn nếu đã chạm, discount domestic) $\approx e^{-0.05}\times 0.4355 = 0.4142$. Đọc: xác suất EUR/USD chạm $1.20$ trong năm tới khoảng $43.6\%$, nên one-touch giá khoảng 41 cents trên mỗi 1 USD payoff. No-touch tương ứng giá $\approx e^{-0.05}\times(1 - 0.4355) = 0.5370$. Điểm mấu chốt mà người mới hay nhầm: số hạng thứ nhất, $0.2357$, *chính là* xác suất kết thúc trên $1.20$ ($\mathbb{P}(S_T > 1.20) = 23.6\%$) — nên xác suất *chạm* ($43.6\%$) gần gấp đôi xác suất *kết thúc trên*, vì spot có thể chạm $1.20$ rồi rơi ngược lại dưới đó lúc đáo hạn. Toàn bộ số hạng phản xạ $0.1997$ là "khối lượng xác suất" của những quỹ đạo chạm-rồi-quay-lại, và đó chính là chỗ desk kiếm lời trên sản phẩm touch: nó đắt hơn hẳn một digital terminal cùng mức.

Cấu trúc phổ biến nhất bán cho retail và corporate là **double-no-touch** (DNT): trả tiền nếu spot ở *trong* một dải $[B_L, B_U]$ suốt vòng đời, không chạm cả hai biên. DNT là cách đặt cược "thị trường sẽ đi ngang" — nhà đầu tư nghĩ EUR/USD kẹt trong một dải hẹp mấy tháng tới thì mua DNT, chi phí nhỏ, ăn to nếu đúng. Giá DNT cần tổng chuỗi vô hạn các phản xạ giữa hai barrier (method of images lặp): mỗi lần "gập" quỹ đạo qua một biên lại đẻ ra một image ảo, và tổng xen kẽ dấu của các image cho xác suất sống sót trong corridor; tương đương, có thể viết dưới dạng chuỗi eigenfunction $\sin(n\pi\cdot)$ trên khoảng $[\ln B_L, \ln B_U]$ với hệ số tắt $e^{-\frac12\sigma^2(n\pi/L)^2 T}$ — các mode cao tắt nhanh khi $T$ lớn, nên chuỗi hội tụ vài số hạng.

Chạy một con số cho thấy DNT khắc nghiệt cỡ nào với thời gian. Lấy dải $[B_L, B_U] = [1.05, 1.15]$ (tức khoảng $\pm 4.5\%$ quanh spot $1.10$), $\sigma = 10\%$. Với maturity **3 tháng** ($T = 0.25$), tổng chuỗi image (hay chuỗi eigenfunction) cho xác suất ở-trong-dải suốt vòng đời:

$$\mathbb{P}(\text{stay in }[1.05,1.15]) \approx 0.281,$$

nên giá DNT thô (trả 1 USD nếu sống sót, discount domestic) $\approx e^{-0.05\times0.25}\times 0.281 = 0.277$ USD trên mỗi 1 USD payoff. Nhưng cùng dải đó kéo dài ra **1 năm** thì xác suất sống sót rơi thảm xuống chỉ còn dưới $0.5\%$ (giá DNT gần như bằng 0) — vì với vol $10\%$/năm, một dải rộng vỏn vẹn $\pm4.5\%$ gần như chắc chắn bị chọc thủng trong 12 tháng. Đó là bài học vật lý của DNT: giá của nó sụp theo hàm mũ khi maturity dài ra hoặc dải hẹp lại (mỗi mode trong chuỗi tắt như $e^{-\text{const}\cdot T}$), nên DNT bán được chủ yếu là các cấu trúc *ngắn hạn, dải vừa phải*. DNT cũng cực nhạy smile: vì nó sống chết bởi *đuôi* phân phối gần hai biên, mà đuôi lại do butterfly (curvature) chi phối, nên định giá DNT bằng BS phẳng luôn sai — phải VV hoặc SLV. Đây là ví dụ điển hình vì sao ba con số ATM/RR/BF không phải trang trí mà là input định giá sống còn.

Cạm bẫy thực chiến của barriers là **barrier bending / spot risk quanh barrier**: khi spot bò sát barrier, delta của knock-out option đảo dấu và độ lớn bùng nổ (một up-and-out call gần barrier có delta *âm* to — bạn muốn spot đừng lên vì lên là mất tất). Hedge nó bằng vanilla thì gap risk khủng khiếp qua đêm nếu spot gap qua barrier. Desk quản lý bằng "barrier shift" (dịch barrier vào trong vài pip cho mục đích hedge để có đệm) và giữ một reserve. Đây là loại rủi ro mà mô hình đẹp không cứu được — chỉ kỷ luật hedge cứu được.

## 10.8 TARF: cỗ máy bán chạy và quả bom leverage

Vì sao kết chương ở đây: **Target Redemption Forward** (TARF) là sản phẩm FX structured bán chạy nhất cho corporate và retail châu Á, và cũng là sản phẩm gây thua lỗ tai tiếng nhất (2008, 2015 CNH, nhiều đợt EM). Nó gói gọn mọi thứ chương này — forward, smile, barrier-like features, leverage — vào một cấu trúc mà người mua thường không hiểu hết rủi ro. Hiểu TARF là hiểu vì sao FX quant cần cả kỹ thuật lẫn đạo đức.

Cơ chế. TARF là một chuỗi các forward định kỳ (hàng tuần/tháng) với một tỷ giá strike *hấp dẫn hơn thị trường* — người bán (corporate xuất khẩu, muốn bán foreign) được đổi ở strike tốt hơn forward chuẩn. Đổi lại có hai điều kiện. Thứ nhất, **target**: tổng lợi ích tích lũy (số pip lời cộng dồn qua các kỳ) khi đạt một ngưỡng "target" thì *toàn bộ hợp đồng tự chấm dứt* (redemption) — người mua ăn xong, hết. Thứ hai, **leverage** ở phía bất lợi: nếu tỷ giá đi ngược (foreign mạnh lên khi họ đang bán foreign), họ phải giao dịch với **notional gấp đôi (hoặc hơn)** ở strike bất lợi.

Con số cho cụ thể cơ chế "lời bị chặn, lỗ nhân đôi". Với bộ số của ta, forward EUR/USD 1Y là $1.12222$; một TARF cho corporate bán EUR ở strike hấp dẫn $K^{\text{TARF}} = 1.14$ mỗi kỳ (cao hơn hẳn forward, nghe rất hời cho người bán EUR). Xét hai kỳ đối lập:

- **Kỳ có lời** — tỷ giá thực lúc fixing là $1.12$: corporate bán EUR ở $1.14$ trong khi thị trường chỉ $1.12$, lời $1.14 - 1.12 = 0.02 = 200$ pip. 200 pip này cộng vào target tích lũy; vài kỳ như vậy là target đầy và hợp đồng *tự tắt* — lời bị chặn ở đúng ngưỡng target, không được hưởng thêm dù còn bao nhiêu kỳ phía trước.
- **Kỳ bất lợi** — tỷ giá thực lúc fixing là $1.16$ (EUR mạnh lên): corporate vẫn phải bán EUR ở $1.14$, lỗ $1.16 - 1.14 = 0.02$ trên một đơn vị; nhưng vì điều khoản leverage $2\times$, họ phải bán **gấp đôi notional**, nên lỗ thực $= 2\times(1.16 - 1.14) = 0.04 = 400$ pip.

Nhìn hai con số cạnh nhau là thấy cả bản chất: cùng một độ lệch $0.02$ so với strike, phía lời chỉ ăn $200$ pip *rồi bị cắt sớm bởi target*, phía lỗ chịu $400$ pip *và không có target nào chặn* — lỗ cứ nhân đôi kéo dài đến hết vòng đời. Payoff bất đối xứng đến tàn nhẫn: lời hữu hạn (chặn ở target), lỗ mở toang (leverage, không cap).

Vì sao vẫn bán chạy: nhìn qua, TARF cho corporate một strike $1.14$ đẹp hơn forward thị trường $1.12222$ "miễn phí" — hơn 170 pip lợi so với forward chuẩn. Nghe như bữa trưa miễn phí. Nhưng không có bữa trưa miễn phí (Chương 4): strike đẹp đó được *tài trợ* bằng hai thứ họ vừa bán đi mà không nhận ra — họ bán **optionality target** (khi thắng thì bị cắt sớm, giới hạn lời) và bán **leverage put** (khi thua thì lỗ gấp đôi, không giới hạn lỗ). Đó là bán vol, bán tail — chính xác là hồ sơ rủi ro tệ nhất có thể cho một corporate không phải quant. Giá trị của hai option họ bán đi đúng bằng phần "biếu không" 170 pip trên strike; TARF chỉ là một cách đóng gói khéo léo để giấu việc corporate đang short optionality.

Định giá TARF là bài toán path-dependent nặng: giá trị phụ thuộc toàn bộ quỹ đạo (để biết target chạm khi nào và leverage kích hoạt bao nhiêu kỳ), nên phải **Monte Carlo** với đầy đủ smile (mỗi kỳ là một strip vanilla dưới smile FX ta đã dựng, nên RR và BF của từng maturity đều đi vào giá). Rủi ro cho *desk bán* thì ngược với corporate: desk thực chất *long* vol và long tail — nhưng gánh **gap risk** và **correlation/smile risk** tinh vi ở target boundary, giống hệt bản chất barrier ở mục 10.7 (target đóng vai một barrier trên lợi ích tích lũy, và giá TARF nhạy với hình smile y như một DNT). Khi thị trường biến động mạnh (2015 khi CNH phá $6.20$, 2008 khi các cặp EM lao dốc), hàng loạt TARF kích hoạt leverage đồng thời, corporate lỗ gấp bội, một số phá sản — và desk cũng lãnh cú sốc gap khi phải re-hedge đồng loạt vào đúng lúc thanh khoản cạn. Đây là ví dụ sống động của **wrong-way risk** (sẽ gặp lại ở Chương 14 XVA): đúng lúc corporate lỗ nặng nhất và có nguy cơ default nhất, exposure của desk lên họ cũng lớn nhất — hai cái xấu tương quan dương, đúng nghĩa "sai hướng".

Bài học cuối cùng của chương gói trọn tinh thần FX quant: hai đồng tiền cho ta hai measure, hai measure cho ta quanto và Siegel; ba con số cho ta cả smile qua Vanna-Volga; và cùng bộ công cụ đó, khi đặt vào tay sai và động cơ sai, dựng nên TARF — một cấu trúc kỹ thuật thì tao nhã, hệ quả thì có thể tàn khốc. Người quant sell-side giỏi không chỉ định giá đúng, mà còn hiểu ai đang đứng ở đầu nào của rủi ro, và convention nào đang được dùng — vì trong FX, sai một convention delta hay sai một dấu correlation không phải lỗi làm tròn, mà là tiền thật đổi chủ.

# Chương 11: Commodities và inflation

Cho tới giờ, mọi asset class mà chúng ta gặp — equity, rates, FX, credit — đều là **claim tài chính thuần**. Một cổ phiếu là quyền sở hữu dòng lợi nhuận tương lai; một trái phiếu là lời hứa trả tiền; một tỷ giá là tỷ lệ trao đổi giữa hai đồng tiền. Không cái nào chiếm chỗ trong kho, không cái nào hỏng, không cái nào có mùa vụ. Bạn giữ một triệu cổ phiếu Apple trong tài khoản chứng khoán y hệt như giữ một cổ phiếu — chi phí biên bằng không, và một triệu đơn vị cũng dễ cất như một.

Commodities phá vỡ điều đó. Một hợp đồng dầu WTI giao tháng 12 cuối cùng dẫn tới việc **ai đó phải nhận 1.000 thùng dầu thật** tại Cushing, Oklahoma, và trả tiền thuê bồn chứa cho tới khi bán được. Ngô có mùa thu hoạch — giá tháng 9 (ngay sau vụ, kho ngập hàng) khác hẳn giá tháng 7 (khi kho cạn dần trước vụ mới). Điện thì không thể lưu kho ở quy mô lớn: một megawatt-hour sản xuất lúc 2 giờ chiều ngày nóng nực **không phải** cùng một hàng hóa với một MWh lúc 3 giờ sáng — chúng có thể có giá cách nhau cả trăm lần. Chính ba đặc tính vật lý này — **storage, seasonality, physical delivery** — khiến commodities cần một khung định giá riêng, và là lý do nửa đầu chương này tồn tại.

Inflation nằm ở nửa sau chương vì một lý do sâu hơn vẻ ngoài. Về mặt kỹ thuật, inflation là một *chỉ số vĩ mô* chứ không phải một tài sản có thể mua bán trực tiếp — bạn không "mua CPI" như mua một thùng dầu. Nhưng cấu trúc toán của nó lại **gần như song trùng với FX**: có một economy "nominal" và một economy "real", nối với nhau qua một "tỷ giá" chính là mức giá (price level). Mô hình Jarrow-Yildirim khai thác đúng phép loại suy đó, và đó là cây cầu nối chương này với Chương 10. Đọc xong chương, bạn sẽ thấy hai chủ đề tưởng xa lạ này thật ra là hai mặt của cùng một câu hỏi: điều gì xảy ra với khung no-arbitrage khi underlying không còn là một tờ giấy tài chính thuần túy.

## 11.1 Vì sao commodities không phải tài sản tài chính thuần

Hãy bắt đầu từ cái xương sống của toàn bộ pricing forward: **cost-of-carry**. Với một cổ phiếu không trả cổ tức, forward price một năm là $F = S_0 e^{rT}$ — lập luận là một chuỗi giao dịch khóa cứng: bạn vay $S_0$ với lãi $r$, mua cổ phiếu hôm nay, giữ tới $T$, và tại $T$ bạn có đúng một cổ phiếu để giao và một khoản nợ $S_0 e^{rT}$ phải trả. Nếu forward quote khác con số này, một trong hai chiều arbitrage sẽ kéo nó về. Với cổ phiếu trả dividend yield $q$, cổ tức nhận được trong lúc nắm giữ bù một phần chi phí vốn, nên forward rẻ đi: $F = S_0 e^{(r-q)T}$.

Commodity thêm hai hạng nữa vào phương trình này, và cả hai đến từ chính cái *tính vật lý* của hàng hóa. Thứ nhất là **storage cost** $u$ (thuê kho, bảo hiểm, hao hụt, cả rủi ro cháy nổ với hàng dễ cháy) — đây là chi phí *dương* làm forward *đắt* hơn, đúng chiều với lãi suất, vì giữ hàng tới $T$ tốn thêm tiền. Thứ hai, tinh tế hơn nhiều, là **convenience yield** $y$: lợi ích *phi tiền tệ* của việc nắm giữ hàng hóa vật lý thay vì một hợp đồng giấy. Một nhà máy lọc dầu giữ tồn kho dầu thô có thể chạy liên tục ngay cả khi nguồn cung đột ngột gián đoạn; một hãng hàng không giữ jet fuel không sợ phải hủy chuyến giữa mùa cao điểm vì thiếu nhiên liệu. Convenience yield là "cổ tức vô hình" mà chỉ người giữ *hàng thật* mới hưởng — và giống hệt dividend, nó *giảm* forward, vì người giữ hàng đã được đền bù bằng sự tiện lợi nên chấp nhận giá kỳ hạn thấp hơn.

Ghép cả bốn hạng lại, ta có công thức cost-of-carry đầy đủ của commodity:

$$F = S_0\, e^{(r + u - y)\,T}.$$

Điều then chốt phải hiểu ngay: đây **không** phải một quan hệ no-arbitrage *cứng* như với equity. Với cổ phiếu, nếu $F \neq S_0 e^{(r-q)T}$ theo cả hai chiều, bạn đều arbitrage được — vì bạn có thể vừa mua vừa *bán khống* cổ phiếu dễ dàng. Với commodity, arbitrage chỉ chạy trơn tru **một chiều**. Nếu $F$ *quá cao*, bạn khóa lời không rủi ro bằng cash-and-carry: vay tiền, mua hàng ngay, trả phí kho, đồng thời short forward để bán ở giá cao đã khóa. Nhưng nếu $F$ *quá thấp*, chiều ngược lại đòi bạn **short hàng vật lý** — tức đi mượn dầu thô hay ngô từ kho người khác để bán ngay rồi mua lại sau — điều thường bất khả thi hoặc cực đắt với hàng hóa cồng kềnh. Vì cửa arbitrage một chiều bị chặn, đẳng thức trên **không bị ép cứng**, và convenience yield $y$ chính là biến "nới lỏng" hấp thụ mọi khoảng cách: ta *suy ngược* $y$ từ giá futures quan sát được, chứ không đọc nó trực tiếp từ bảng giá nào. Nói cách khác, $y$ là một *ẩn số ngầm* (implied), y hệt cách implied vol là ẩn số suy ngược từ giá option.

**Ví dụ số — suy convenience yield từ curve dầu.** Giả sử dầu thô WTI giao ngay $S_0 = 80.00$ USD/thùng. Lãi suất USD $r = 5\%$. Storage cost cho dầu ước tính $u = 3\%$/năm (bồn chứa Cushing không rẻ, và luôn có hao hụt bay hơi). Futures 1 năm quote ở $F = 78.50$ — thấp hơn cả spot. Ta giải ngược convenience yield:

$$\ln\frac{F}{S_0} = (r + u - y)\,T \;\Rightarrow\; \ln\frac{78.50}{80.00} = (0.05 + 0.03 - y)\cdot 1.$$

Tính vế trái: $\ln(0.98125) = -0.018928$. Vậy $0.08 - y = -0.018928$, suy ra

$$y = 0.08 + 0.018928 = 0.098928 \approx 9.89\%.$$

Convenience yield gần **10%** — cao hơn hẳn tổng $r + u = 8\%$ — chính là điều kéo forward xuống *dưới* spot. Con số này đọc ra một câu chuyện thị trường rất cụ thể: thị trường đang **khan hàng giao ngay**, người giữ dầu thật đang hưởng lợi lớn từ việc có sẵn tồn kho, nên họ không chịu bán rẻ ở kỳ hạn xa. Đây là dấu hiệu điển hình của một cú shock nguồn cung — chiến tranh, cấm vận, bão làm gián đoạn khai thác — khi ai đang cầm hàng thật thì cầm vàng.

Điểm cần khắc cốt: convenience yield **không cố định** — nó dao động theo mức tồn kho, và đó là toàn bộ động lực học của thị trường commodity. Kho đầy → convenience yield thấp (chẳng ai trả giá cho "sự tiện lợi" khi hàng ê hề khắp nơi) → forward cao hơn spot. Kho cạn → convenience yield vọt lên → forward thấp hơn spot. Chính động học của $y$ này — phi tuyến, phụ thuộc mức tồn kho, có sàn gần 0 khi kho quá đầy — là thứ mà mô hình một-nhân-tố Schwartz ở mục 11.3 cố gắng nắm bắt gián tiếp qua cơ chế mean-reversion của chính spot.

## 11.2 Contango và backwardation

Hình dạng của **futures curve** — tập giá futures theo kỳ hạn giao hàng — chia làm hai chế độ có tên riêng, và trader commodity nói bằng ngôn ngữ này suốt ngày làm việc.

Khi curve **dốc lên** (futures xa đắt hơn futures gần, và đắt hơn spot), thị trường ở trạng thái **contango**. Từ công thức $F = S_0 e^{(r+u-y)T}$, contango xảy ra khi $r + u > y$: chi phí lưu kho cộng lãi suất áp đảo convenience yield. Đây là trạng thái "bình thường" của một thị trường **kho đầy, cung dồi dào** — không ai khát hàng, nên bạn phải được đền bù (bằng giá kỳ hạn cao hơn) để chấp nhận giữ hàng thay ai đó qua thời gian.

Khi curve **dốc xuống** (futures xa rẻ hơn spot), thị trường ở **backwardation**, xảy ra khi $y > r + u$. Convenience yield cao lấn át chi phí carry — dấu hiệu **khan hàng giao ngay**, ai cũng muốn hàng bây giờ chứ không phải sáu tháng nữa. Ví dụ dầu ở mục trên ($y = 9.89\% > r+u = 8\%$) chính là backwardation.

**Ví dụ số — hai chế độ trên cùng một tài sản.** Lấy dầu $S_0 = 80$, $r = 5\%$, $u = 3\%$, và chỉ thay đổi duy nhất convenience yield:

- **Kịch bản kho đầy**, $y = 2\%$: $F_{1Y} = 80\,e^{(0.05+0.03-0.02)\cdot 1} = 80\,e^{0.06} = 80 \times 1.06184 = 84.95$. Curve dốc lên — **contango**, forward cao hơn spot 4.95 USD.
- **Kịch bản khan hàng**, $y = 15\%$: $F_{1Y} = 80\,e^{(0.08 - 0.15)\cdot 1} = 80\,e^{-0.07} = 80 \times 0.93239 = 74.59$. Curve dốc xuống — **backwardation**, forward thấp hơn spot 5.41 USD.

Cùng một loại dầu, cùng lãi suất và storage, nhưng chỉ vì convenience yield khác nhau mà curve lật hoàn toàn hình dạng — từ dốc lên gần 5 USD sang dốc xuống hơn 5 USD. Đó là lý do khi bạn nhìn một futures curve, bạn đang đọc trực tiếp **trạng thái cung-cầu vật lý** của thị trường — không cần chờ báo cáo tồn kho hàng tuần, curve đã kể hết.

Có một hệ quả tài chính khổng lồ mà nhà đầu tư retail hay bỏ sót: **roll yield**. Một quỹ ETF nắm giữ commodity qua futures (chứ không thể ôm dầu thật trong kho) buộc phải liên tục "roll" — bán hợp đồng gần hết hạn, mua hợp đồng xa hơn để duy trì exposure. Trong contango, bạn *bán rẻ mua đắt* mỗi lần roll → **roll yield âm**, ăn mòn lợi nhuận ngay cả khi spot đứng yên tuyệt đối. Đây chính là lý do các ETF dầu như USO từng mất giá thê thảm so với giá dầu giao ngay trong giai đoạn contango sâu 2020: không phải dầu giảm, mà là **cấu trúc curve** lặng lẽ ăn thịt nhà đầu tư từng lần roll một.

**Ví dụ số — roll yield tính bằng hai giá futures.** Giả sử curve contango với hợp đồng front (giao tháng sau) quote $F_{\text{front}} = 80.40$ và hợp đồng next (giao tháng liền kề sau đó) quote $F_{\text{next}} = 80.80$. Một quỹ đang giữ front; khi front sắp đáo hạn, quỹ **bán front ở 80.40 và mua next ở 80.80** để giữ nguyên exposure. Nếu spot đứng yên, theo cost-of-carry hợp đồng next sẽ dần trượt về mức của front cũ khi tới lượt nó đáo hạn — đó chính là điều "giá hội tụ về spot khi đáo hạn". Khoản chênh mua-đắt-bán-rẻ ta phải nuốt mỗi lần roll là:

$$\text{roll yield}_{\text{tháng}} = \frac{F_{\text{front}} - F_{\text{next}}}{F_{\text{next}}} = \frac{80.40 - 80.80}{80.80} = -0.495\%\ \text{mỗi lần roll}.$$

Roll hàng tháng, tổng hợp trong năm: $-0.495\% \times 12 \approx -5.94\%/\text{năm}$. Gần **−6%/năm** bốc hơi *chỉ vì cấu trúc curve*, đủ để một view "dầu đi ngang" biến thành khoản lỗ hai chữ số qua một năm. Con số này không suy ra bằng lời hoa mỹ — nó rơi thẳng ra từ hai giá quote kề nhau, và đó là điều đẹp: cả một hiện tượng tàn phá danh mục cô đọng trong một phép chia. (Trong backwardation thì dấu đảo ngược: roll yield *dương*, một món quà cho ai giữ long qua futures — một điểm mà cuốn P-world khai thác khi bàn về commodity carry strategies.)

## 11.3 Mô hình Schwartz một nhân tố

Cost-of-carry cho ta *một điểm tĩnh* trên curve tại một thời điểm. Để định giá option trên commodity — hay để hiểu curve *chuyển động* thế nào theo thời gian — ta cần một mô hình động học cho spot. Ứng viên ngây thơ nhất là geometric Brownian motion như Black-Scholes: $dS = \mu S\,dt + \sigma S\,dW$. Nhưng nó **sai bản chất kinh tế** của commodity, và hiểu vì sao nó sai chính là hiểu commodity.

Với cổ phiếu, GBM hợp lý: nếu Apple tăng gấp đôi nhờ một sản phẩm đột phá, không có lực kinh tế nào *tự động* kéo nó về giá cũ — giá trị công ty thật sự đã đổi. Với dầu thì hoàn toàn khác: giá dầu 200 USD sẽ kích thích khai thác đá phiến (vốn đắt đỏ nhưng giờ có lãi), thu hút giàn khoan mới, tăng cung, và **kéo giá xuống**; ngược lại giá dầu 20 USD khiến hàng loạt giếng dầu chi phí cao đóng cửa, cắt cung, và **đẩy giá lên**. Commodity có một **mức cân bằng dài hạn** neo bởi chi phí sản xuất biên của nhà cung cấp đắt nhất còn trụ lại thị trường. Toán học của lực kéo-về này là **mean-reversion**, và mô hình một-nhân-tố của Eduardo Schwartz (1997) là phiên bản chuẩn mà cả industry lấy làm điểm khởi đầu.

Schwartz đặt log-price $X_t = \ln S_t$ theo một **Ornstein-Uhlenbeck process**:

$$dX_t = \kappa\,(\alpha - X_t)\,dt + \sigma\,dW_t,$$

trong đó $\kappa > 0$ là **tốc độ mean-reversion**, $\alpha$ là **mức log-price cân bằng dài hạn**, và $\sigma$ là volatility (độ lệch chuẩn tức thời của log-price mỗi năm). Hạng drift $\kappa(\alpha - X_t)$ là trái tim mô hình: khi $X_t$ *trên* mức $\alpha$, số hạng này *âm* nên drift kéo giá xuống; khi $X_t$ *dưới* $\alpha$, nó *dương* nên drift đẩy giá lên. Và lực kéo tỷ lệ thuận với khoảng cách khỏi cân bằng — càng lệch xa, càng bị kéo mạnh, đúng như trực giác về một lò xo.

### 11.3.1 Dẫn xuất nghiệm

Ta giải OU process từng bước — đây là một trong số ít SDE có nghiệm đóng hoàn chỉnh, nên đáng làm thật cẩn thận để bạn tự dựng lại được. Mẹo là dùng **integrating factor** $e^{\kappa t}$, hệt như giải một ODE tuyến tính bậc nhất. Xét vi phân của $e^{\kappa t} X_t$ bằng Itô product rule; vì $e^{\kappa t}$ là hàm *tất định* (không ngẫu nhiên) nên không có hạng bậc hai chéo $d\langle e^{\kappa t}, X\rangle$:

$$d(e^{\kappa t} X_t) = \kappa e^{\kappa t} X_t\,dt + e^{\kappa t}\,dX_t.$$

Thay $dX_t = \kappa(\alpha - X_t)\,dt + \sigma\,dW_t$ vào vế phải:

$$d(e^{\kappa t} X_t) = \kappa e^{\kappa t} X_t\,dt + e^{\kappa t}\big[\kappa\alpha\,dt - \kappa X_t\,dt + \sigma\,dW_t\big].$$

Đây là chỗ magic xảy ra: hai hạng $\kappa e^{\kappa t}X_t\,dt$ (một dương từ product rule, một âm từ drift) **triệt tiêu nhau hoàn toàn**, và đó chính là lý do ta chọn integrating factor như vậy. Còn lại một phương trình sạch sẽ không còn $X_t$ ở vế phải:

$$d(e^{\kappa t} X_t) = \kappa\alpha\, e^{\kappa t}\,dt + \sigma e^{\kappa t}\,dW_t.$$

Giờ tích phân hai vế từ $0$ đến $t$. Hạng tất định tích phân thường, hạng Brownian thành tích phân Itô:

$$e^{\kappa t} X_t - X_0 = \kappa\alpha \int_0^t e^{\kappa s}\,ds + \sigma\int_0^t e^{\kappa s}\,dW_s = \alpha\,(e^{\kappa t} - 1) + \sigma\int_0^t e^{\kappa s}\,dW_s,$$

trong đó ta đã dùng $\kappa\alpha\int_0^t e^{\kappa s}ds = \kappa\alpha \cdot \frac{e^{\kappa t}-1}{\kappa} = \alpha(e^{\kappa t}-1)$. Nhân cả hai vế với $e^{-\kappa t}$ để cô lập $X_t$:

$$\boxed{X_t = \alpha + (X_0 - \alpha)\,e^{-\kappa t} + \sigma\int_0^t e^{-\kappa(t-s)}\,dW_s.}$$

Đọc nghiệm cho ra toàn bộ trực giác. Phần tất định $\mathbb{E}[X_t] = \alpha + (X_0 - \alpha)e^{-\kappa t}$ **phân rã mũ** từ điểm xuất phát $X_0$ về mức cân bằng $\alpha$ — sau vô hạn thời gian, kỳ vọng hội tụ đúng về $\alpha$ bất kể xuất phát từ đâu. Hạng tích phân Itô là phần ngẫu nhiên, có kỳ vọng 0 (mọi tích phân Itô đều là martingale xuất phát từ 0). Variance tính từ **Itô isometry** (biến kỳ vọng bình phương tích phân Itô thành tích phân thường của bình phương integrand):

$$\text{Var}[X_t] = \sigma^2 \int_0^t e^{-2\kappa(t-s)}\,ds = \frac{\sigma^2}{2\kappa}\big(1 - e^{-2\kappa t}\big).$$

Và đây là chỗ OU khác GBM một trời một vực. Với GBM, variance của log-price tăng vô hạn *tuyến tính* theo $t$ — càng nhìn xa, càng mù mịt không giới hạn. Với OU, variance **bão hòa** về mức tiệm cận hữu hạn $\sigma^2/(2\kappa)$ khi $t \to \infty$. Đây chính là dấu ấn định lượng của mean-reversion: mô hình "không cho phép" giá đi lang thang mãi mãi ra xa cân bằng, nên độ bất định dài hạn bị *chặn trên*. Về mặt kinh tế, điều này nói: bạn có thể không biết giá dầu tháng sau, nhưng bạn khá chắc nó không thể ở mức 500 USD hay 3 USD trong nhiều năm — có một băng giá mà kinh tế học của cung-cầu giữ nó lại.

### 11.3.2 Half-life và ví dụ số

Tham số $\kappa$ trừu tượng và khó cảm nhận trực tiếp; industry dịch nó thành **half-life** — thời gian để một cú lệch khỏi cân bằng co lại còn đúng một nửa (theo kỳ vọng). Từ điều kiện $e^{-\kappa\, t_{1/2}} = 1/2$:

$$t_{1/2} = \frac{\ln 2}{\kappa}.$$

**Ví dụ số.** Lấy $\kappa = 1.5$/năm cho dầu thô (giá trị hợp lý với hàng hóa có độ co giãn cung trung bình — không quá nhanh như hàng hóa nông sản mùa vụ, không quá chậm như kim loại quý). Half-life:

$$t_{1/2} = \frac{0.6931}{1.5} = 0.462\ \text{năm} \approx 5.5\ \text{tháng}.$$

Diễn giải cụ thể: nếu dầu bị đẩy lên 110 (tức 30 USD *trên* mức cân bằng 80) sau một cú shock địa chính trị, thì theo kỳ vọng, sau 5.5 tháng khoảng lệch 30 đó đã co còn 15 (giá về quanh 95); sau 11 tháng còn 7.5; và cứ thế. Với cùng $\kappa = 1.5$ và **lấy $\sigma = 30\%$/năm** cho vol log-price của dầu (mức thực nghiệm điển hình), độ lệch chuẩn biên độ dài hạn của log-price là:

$$\text{sd}_\infty = \sqrt{\frac{\sigma^2}{2\kappa}} = \sqrt{\frac{0.30^2}{2\times 1.5}} = \sqrt{\frac{0.09}{3}} = \sqrt{0.03} = 0.173.$$

Tức trong dài hạn, log-price dao động với độ lệch chuẩn $\approx 17.3\%$ quanh $\alpha$ — một băng giá tương đối chật, không phải một random walk vô biên. Nếu $\alpha = \ln 80 = 4.382$, thì với xác suất xấp xỉ 68% (một sigma của phân phối chuẩn), giá dài hạn nằm trong khoảng

$$\big[\,80\,e^{-0.173},\ 80\,e^{+0.173}\,\big] = [\,67.3,\ 95.1\,]\ \text{USD}.$$

Đây là loại tuyên bố định lượng mà một GBM không bao giờ nói được — GBM sẽ điềm nhiên bảo bạn rằng dầu có thể lang thang tới 500 USD hoặc rơi xuống 5 USD với xác suất không hề nhỏ. Chính khả năng đặt một *băng giá dài hạn có căn cứ* là giá trị thực tiễn của Schwartz: nó cho desk một phân phối terminal hợp lý để định giá option kỳ hạn dài.

**Cạm bẫy thực chiến của Schwartz một-nhân-tố.** Mô hình này có một điểm yếu cấu trúc: nó buộc **toàn bộ curve** dịch chuyển theo *một* nguồn ngẫu nhiên duy nhất — cú shock lên spot. Điều này ngụ ý futures gần và futures xa tương quan *hoàn hảo* (chỉ khác về biên độ, vì hệ số $e^{-\kappa T}$ làm giảm độ nhạy của futures xa với shock spot — cú lệch càng xa đáo hạn càng bị mean-reversion "nuốt" mất trước khi đến kỳ). Nhưng thực tế thị trường không như vậy: phần đầu curve (front) và phần đuôi (long end) thường **de-couple** rõ rệt. Một cú shock tồn kho ngắn hạn (một cơn bão đóng cửa cảng vài tuần) đá mạnh front nhưng gần như không động tới futures giao 5 năm sau, vì ai cũng biết bão sẽ qua. Một mô hình một-nhân-tố không thể tạo ra chuyển động độc lập đó. Vì thế production desk chuyển sang mô hình **hai nhân tố** kiểu Schwartz-Smith (1997/2000): một nhân tố cho *short-term deviation* mean-reverting nhanh (bắt các cú shock front tạm thời), và một nhân tố cho *equilibrium price* đi random-walk chậm (bắt sự trôi dạt dài hạn của mức cân bằng do công nghệ khai thác và trữ lượng thay đổi). Hai nhân tố này cho phép front và back động độc lập nhau, khớp curve thật tốt hơn hẳn. Về mặt hạ tầng, tinh thần mean-reversion Gaussian này trùng đúng cấu trúc OU của họ mô hình rates như `hull-white` trong repo — cùng một khung toán, chỉ đổi nhãn từ "short rate" sang "log-price commodity".

## 11.4 Seasonality: khí đốt và điện

Có một tầng cấu trúc mà không mô hình mean-reversion trơn nào bắt được, dù $\kappa$ có tinh chỉnh khéo đến đâu: **seasonality**. Nhu cầu khí đốt tự nhiên tăng vọt mùa đông (sưởi ấm); nhu cầu điện có đỉnh kép — mùa hè (điều hòa) và mùa đông. Điểm mấu chốt là những đỉnh này **lặp lại hàng năm và có thể dự đoán trước** — mọi người đều biết tháng 1 lạnh và tháng 7 nóng. Vì tính dự đoán được đó, seasonality *không phải rủi ro ngẫu nhiên* mà là thông tin đã biết, nên nó phải nằm trong **drift tất định** của mô hình, tuyệt đối không được nhét vào phần ngẫu nhiên (làm thế sẽ vừa sai bản chất vừa thổi phồng vol giả tạo).

Cách chuẩn là bơm một **hàm mùa vụ tất định** vào log-price forward, thường là tổ hợp các sinusoid. Với thời gian $T$ tính bằng **năm**, một chu kỳ lặp lại đúng bằng một năm ứng với tần số cơ bản $2\pi$:

$$\ln F(0, T) = g(T) + \sum_{k=1}^{K} A_k \cos\big(2\pi k T - \varphi_k\big),$$

trong đó $g(T)$ là xu hướng trơn (đến từ cost-of-carry và mean-reversion của mục trước), $A_k$ là biên độ và $\varphi_k$ là **pha** của hài bậc $k$. Hạng pha $\varphi_k$ là thứ định vị đỉnh trong năm, và cần hiểu rõ vai trò của nó: hài bậc nhất đạt cực đại khi đối số của cosine bằng 0, tức $2\pi T - \varphi_1 = 0$, tương đương $T = \varphi_1/(2\pi)$. Nếu ta lấy **gốc thời gian ở đầu tháng 1** và muốn đỉnh rơi đúng đầu tháng 1 (các giá trị $T$ nguyên), ta đặt $\varphi_1 = 0$; nếu đỉnh cần rơi vào tháng khác, ta dịch $\varphi_1$ tương ứng. Nói cách khác, chính $\varphi_k$ (chứ không phải lời văn mô tả) mới là thứ *neo* vị trí đỉnh về mặt toán học — bỏ nó đi thì đỉnh bị khóa cứng vào gốc thời gian một cách tùy tiện. Với gas, $K=1$ đã bắt được đỉnh đông cơ bản; thêm $K=2$ cho phép nắm một đỉnh phụ hoặc độ bất đối xứng giữa đỉnh và đáy.

**Ví dụ số — gas curve mùa đông.** Giả sử gas có mức nền $g(T) = \ln 3.00$ (ứng với 3.00 USD/MMBtu) và một hài bậc nhất với biên độ $A_1 = 0.12$, pha $\varphi_1 = 0$ (gốc thời gian tháng 1, đỉnh rơi tháng 1). Forward giao **tháng 1** rơi đúng đỉnh, nên cos-term đạt cực đại $+A_1 = +0.12$:

$$F_{\text{Jan}} = 3.00 \times e^{+0.12} = 3.00 \times 1.1275 = 3.38\ \text{USD/MMBtu}.$$

Forward giao **tháng 7** rơi đúng đáy (cách đỉnh nửa chu kỳ, cos-term $= -A_1 = -0.12$):

$$F_{\text{Jul}} = 3.00 \times e^{-0.12} = 3.00 \times 0.8869 = 2.66\ \text{USD/MMBtu}.$$

Chênh lệch mùa **0.72 USD** — tức khoảng **24% so với mức nền 3.00 USD** ($0.72/3.00 = 0.240$) — hoàn toàn không phải noise, mà là biến động *tất định* đã biết trước. Một mô hình bỏ qua nó sẽ định giá sai mọi option gas mà cửa sổ payoff trải qua ranh giới mùa. Chính vì biên độ mùa lớn như vậy mà trader gas không nhìn "giá gas" chung chung, mà nhìn **spread mùa**: mua tháng 7 rẻ, bán tháng 1 đắt, khóa chênh mùa — miễn là chi phí lưu kho gas (bơm vào bồn ngầm rồi rút ra) thấp hơn ngưỡng 0.72 USD đó. Đó là một chiến lược storage-arbitrage rất thật, và nó chỉ tồn tại vì seasonality là *dự đoán được*.

Điện đẩy vấn đề tới cực đoan vì **không lưu kho được ở quy mô lớn**. Với gas bạn còn bơm vào bồn ngầm để dời cung từ mùa này sang mùa khác; với điện, cung phải khớp cầu **theo từng giây** trên lưới. Hệ quả toán học rất nghiêm trọng: không có cost-of-carry ràng buộc (không thể "carry" điện qua thời gian), không có convenience yield theo nghĩa tồn kho, và giá điện có thể **spike** kinh hoàng khi cầu chạm trần công suất phát — nhảy từ 40 USD/MWh lên 2.000 hoặc thậm chí 9.000 USD/MWh trong vài giờ đồng hồ, rồi sụp về nền ngay khi qua đỉnh cầu. Đây là hành vi của một **jump-diffusion với spike và mean-reversion cực nhanh** (half-life tính bằng *giờ*, không phải tháng như dầu). Không một mô hình GBM hay OU trơn nào bắt được cái đuôi này; power desk phải cộng thêm một **jump component** Poisson với biên độ lớn và một cơ chế kéo-về gần như tức thời.

**Ví dụ số — đóng góp của spike vào giá option điện.** Mô hình giá điện là một diffusion nền êm ả (quanh 40 USD/MWh) *cộng* một Poisson jump component bắt các spike. Xét một cửa sổ mùa cao điểm dài một tháng, và giả sử intensity của các spike lớn là $\lambda = 1.5$ spike/tháng (kỳ vọng chạm trần 1.5 lần trong tháng), mỗi spike đẩy giá lên mức $J = 2.000$ USD/MWh. Ta định giá một call giao trong tháng đó với strike $K = 200$ USD/MWh — một mức mà diffusion nền quanh 40 gần như *không bao giờ* chạm tới, nên toàn bộ giá trị của call phải đến từ jump chứ không từ diffusion.

Với deep-OTM như thế, ta có thể bỏ qua đóng góp diffusion và xấp xỉ giá call bằng **expected-payoff leg của phần jump**: kỳ vọng số spike trong tháng nhân payoff mỗi spike (payoff kỳ vọng có điều kiện, coi biên độ spike xác định). Mỗi spike đưa giá lên 2.000, cho payoff $(J - K)^+ = (2.000 - 200) = 1.800$ USD/MWh. Bỏ discount cho gọn (kỳ hạn một tháng, ảnh hưởng nhỏ), đóng góp actuarial của jump vào giá call là:

$$V_{\text{jump}} \approx \lambda \times (J - K)^+ = 1.5 \times 1.800 = 2.700\ \text{USD/MWh}.$$

(Đây là leg kỳ vọng dưới đo lường định giá; một mô hình đầy đủ sẽ để cả $\lambda$ lẫn biên độ spike ngẫu nhiên và tích hợp qua phân phối của chúng, nhưng con số bậc-độ-lớn không đổi.) Điểm chốt: con số 2.700 này *hoàn toàn* đến từ đuôi spike. Một diffusion GBM với vol thông thường sẽ định giá đúng call OTM sâu này gần bằng **0** — sai không phải một chút mà cả hai bậc độ lớn. Đó là lý do power desk **buộc phải** gắn intensity $\lambda$ và biên độ jump vào mô hình: một cap điện mùa hè (bảo hiểm cho người mua điện chống giá vọt) chỉ có giá đúng khi ta trả tiền cho *xác suất chạm trần*, chứ không phải cho biến động êm ả ngày thường. Điện là ví dụ sắc nét nhất cho luận điểm mở đầu chương: khi một "hàng hóa" *không thể lưu kho*, toàn bộ khung tài chính chuẩn dựa trên cost-of-carry sụp đổ, và ta buộc phải mô hình hóa trực tiếp cơ chế vật lý của lưới điện.

## 11.5 Calendar spread và spread options

Vì hình dạng curve mang thông tin cung-cầu, rất nhiều sản phẩm commodity giao dịch dưới dạng **spread** thay vì outright. Đơn giản nhất là **calendar spread**: long futures một kỳ hạn, short futures kỳ hạn khác trên cùng underlying. Nó là một cược trực tiếp vào *thay đổi hình dạng curve* — vào việc contango sâu thêm hay chuyển sang backwardation — và loại bỏ phần lớn rủi ro mức giá tuyệt đối (nếu cả curve dịch song song, hai chân bù nhau). Trader dùng nó để bày tỏ view về cung-cầu mà không phải chịu rủi ro giá dầu lên hay xuống nói chung.

Thú vị hơn nhiều về mặt định giá là **spread options** trên chênh giá của hai commodity liên quan qua một quy trình sản xuất. Hai ví dụ kinh điển đáng nắm vững:

**Crack spread** (lọc dầu). Nhà máy lọc mua dầu thô, bán sản phẩm tinh chế (xăng, dầu diesel). Lợi nhuận lọc chính là chênh giá đầu ra trừ đầu vào — đúng nghĩa "the crack" (từ động từ *crack* nghĩa là bẻ gãy phân tử hydrocarbon). Một crack spread 3-2-1 phổ biến mô tả tỷ lệ vật lý: 3 thùng dầu thô cho ra khoảng 2 thùng xăng cộng 1 thùng heating oil. Một **crack spread option** cho nhà máy quyền (không nghĩa vụ) khóa biên lọc — tức bảo hiểm chống việc crack co lại xuống dưới mức đủ trang trải chi phí vận hành.

**Ví dụ số — crack spread option.** Đơn giản hóa về spread 1-1: gọi giá xăng $G$, giá dầu thô $C$, và spread $X = G - C$. Giả sử hôm nay xăng ở 95 USD/thùng, dầu thô 80 USD/thùng, nên spread hiện tại là 15 USD. Ta muốn định giá một call trên spread với strike $K = 12$, tức trả payoff $(X_T - 12)^+ = (G_T - C_T - 12)^+$. Vấn đề cốt lõi: vì $X$ là **hiệu của hai biến lognormal**, bản thân $X$ *không* lognormal (hiệu hai lognormal không có phân phối đóng), nên công thức Black-Scholes chuẩn không áp thẳng được. Công cụ chuẩn của industry là **Kirk's approximation**, biến bài toán spread option thành một Black-76 giả.

*Trực giác dẫn xuất Kirk.* Viết lại payoff bằng cách gộp strike vào chân dầu: $(G - C - K)^+ = \big(G - (C+K)\big)^+$. Kirk nhận xét rằng đại lượng $C + K$ — dù không lognormal thuần vì có hằng số $K$ cộng vào một biến lognormal — vẫn *xấp xỉ tốt* bằng một biến lognormal khi $K$ nhỏ so với $C$, vì khi đó phần lớn biến động của $C+K$ vẫn đến từ $C$ (hằng số $K$ chỉ dịch mức chứ ít làm méo hình dạng phân phối). Với xấp xỉ đó, ta chia cả payoff cho $C+K$ và coi nó như một "numéraire con": spread option trở thành option trên **tỷ số** $G/(C+K)$ với strike 1 — đúng dạng một call Black-76 trên forward $\tilde F = G$ và strike giả $\tilde K = C+K$. Việc còn lại chỉ là tìm vol phù hợp cho tỷ số đó.

Vol của $\ln\big(G/(C+K)\big)$ đến từ **tuyến tính hóa biến động của $C+K$ quanh forward**. Khai triển bậc nhất: $d\ln(C+K) \approx \frac{C}{C+K}\,d\ln C$, bởi vì chỉ chân $C$ mang phần ngẫu nhiên còn $K$ là hằng số — nên vol *hiệu dụng* của mẫu số bằng $\sigma_C$ *nhân với trọng số* $w = \frac{C}{C+K}$ (trọng số này chính là tỷ phần biến động mà $C$ đóng góp vào $C+K$). Variance của $\ln G - \ln(C+K)$ khi đó là variance của một hiệu hai biến, với chân dầu thô bị co lại bởi $w$:

$$\sigma_{\text{spread}}^2 = \sigma_G^2 - 2\rho\,\sigma_G\,\sigma_C\,w + \sigma_C^2\,w^2, \qquad w = \frac{C}{C+K}.$$

Ba hạng đúng là công thức variance của một hiệu (var chân một, trừ hai lần covariance, cộng var chân hai), với chân dầu thô *ở mọi nơi* mang trọng số $w$ do bước tuyến tính hóa. Đây là **bản Kirk gốc** — trọng số $w$ đặt nhất quán ở cả hạng chéo và hạng bình phương của $\sigma_C$, và sự nhất quán đó không phải tùy chọn mà là hệ quả trực tiếp của khai triển bậc nhất.

Lấy các tham số: $\sigma_G = 30\%$, $\sigma_C = 35\%$, $\rho = 0.85$ (xăng và dầu thô rất tương quan vì một là sản phẩm của cái kia), $T = 0.5$. Trọng số:

$$w = \frac{C}{C+K} = \frac{80}{80+12} = \frac{80}{92} = 0.8696.$$

Tính từng hạng dưới căn:

- Hạng var xăng: $\sigma_G^2 = 0.30^2 = 0.09$.
- Hạng chéo: $-2\rho\sigma_G\sigma_C\, w$. Trước hết $2(0.85)(0.30)(0.35) = 0.1785$; nhân $w = 0.8696$ được $0.15522$; mang dấu âm $\to -0.15522$.
- Hạng var dầu (đã co): $\sigma_C^2\, w^2 = 0.35^2 \times 0.8696^2 = 0.1225 \times 0.7561 = 0.09263$.

Tổng dưới căn: $0.09 - 0.15522 + 0.09263 = 0.02741$. Vậy

$$\sigma_{\text{spread}} = \sqrt{0.02741} = 0.1656,\ \text{tức}\ 16.56\%.$$

Chú ý điều quan trọng: vol spread **16.56%** thấp hơn cả vol xăng (30%) lẫn vol dầu (35%) *riêng lẻ*. Đây là hệ quả trực tiếp của tương quan cao $\rho = 0.85$: khi hai giá cùng lên cùng xuống gần như đồng bộ, *chênh* của chúng ổn định hơn nhiều so với mỗi giá đơn lẻ — hầu hết biến động bị triệt tiêu trong phép trừ. Đây là trực giác cốt tử của mọi spread trade: bạn không cược vào mức giá, bạn cược vào cái phần nhỏ *còn sót lại* sau khi hai chân bù nhau.

Giờ áp Black-76 với forward giả $\tilde F = G = 95$ và strike giả $\tilde K = C + K = 92$:

$$d_1 = \frac{\ln(\tilde F/\tilde K) + \tfrac{1}{2}\sigma_{\text{spread}}^2\,T}{\sigma_{\text{spread}}\sqrt{T}} = \frac{\ln(95/92) + \tfrac{1}{2}(0.1656)^2(0.5)}{0.1656\sqrt{0.5}}.$$

Từng phần: $\ln(95/92) = 0.03209$; $\tfrac{1}{2}(0.1656)^2(0.5) = 0.006853$; mẫu số $0.1656 \times 0.7071 = 0.11707$. Vậy

$$d_1 = \frac{0.03209 + 0.006853}{0.11707} = \frac{0.038943}{0.11707} = 0.3326,$$

$$d_2 = d_1 - \sigma_{\text{spread}}\sqrt{T} = 0.3326 - 0.1171 = 0.2156.$$

Tra bảng chuẩn tắc: $N(d_1) = N(0.3326) = 0.6303$, $N(d_2) = N(0.2156) = 0.5853$. Giá option (bỏ discount cho gọn, $e^{-rT}\approx 1$ với $T$ nửa năm):

$$V = \tilde F\, N(d_1) - \tilde K\, N(d_2) = 95(0.6303) - 92(0.5853) = 59.88 - 53.85 = 6.03\ \text{USD/thùng}.$$

Vậy quyền khóa biên lọc ở mức 12 USD/thùng đáng giá **khoảng 6.03 USD/thùng**. Một nhà máy lọc 100.000 thùng/ngày sẽ dùng con số này để định giá bảo hiểm biên lọc cho cả năm — biến một rủi ro vận hành mờ mịt ("biên lọc có thể bị bóp nghẹt") thành một premium option cụ thể, có thể mua bán được trên thị trường.

**Pitfall thực chiến — giới hạn của Kirk.** Xấp xỉ Kirk đứng trên giả định $C+K$ gần lognormal, nên nó **kém chính xác khi strike $K$ lớn** so với $C$ (lúc đó hằng số $K$ chi phối $C+K$, phá vỡ tính lognormal của mẫu số) và **khi $\rho$ thấp hoặc âm** (lúc đó spread biến động mạnh, đuôi phân phối của hiệu hai lognormal lệch xa khỏi bất kỳ một-lognormal nào). Trong hai chế độ đó, sai số Kirk có thể lên tới vài phần trăm giá option — không chấp nhận được với một book lớn — nên desk chuyển sang phương pháp chính xác hơn: Bjerksund-Stensland (một cải tiến của Kirk giữ thêm số hạng), hoặc thẳng tay Monte Carlo hai chân với correlation đưa vào trực tiếp. Kirk là công cụ *tốc độ* cho vùng ATM, tương quan cao, strike vừa phải (đúng như ví dụ trên); ra ngoài vùng đó thì phải kiểm chứng lại bằng phương pháp nặng hơn.

**Spark spread** (điện). Song song hoàn toàn với crack spread nhưng cho nhà máy điện chạy khí: mua gas làm nhiên liệu, bán điện ra lưới. Biên lợi nhuận là giá điện trừ đi (chi phí gas nhân heat rate), với **heat rate** $H$ là lượng gas (đo bằng MMBtu) cần để sinh ra 1 MWh điện — một thước đo hiệu suất chuyển đổi của nhà máy (heat rate càng thấp, máy càng hiệu quả, càng ít gas cho mỗi MWh).

**Ví dụ số — spark spread.** Nhà máy có heat rate $H = 7.5$ MMBtu/MWh (khá hiệu quả với công nghệ chu trình hỗn hợp hiện đại). Giá điện $P_{\text{elec}} = 45$ USD/MWh, giá gas $P_{\text{gas}} = 3.00$ USD/MMBtu. Spark spread *tức thời* khi máy chạy:

$$\text{Spark} = P_{\text{elec}} - H \times P_{\text{gas}} = 45 - 7.5 \times 3.00 = 45 - 22.50 = 22.50\ \text{USD/MWh}.$$

Nhà máy lời 22.50 USD mỗi MWh khi chạy. Nhưng đây mới là chỗ hay: đây là **optionality**, vì nhà máy chỉ chạy khi spark spread *dương*. Khi giá gas vọt lên 7 USD/MMBtu, spark $= 45 - 7.5\times 7 = 45 - 52.5 = -7.5 < 0$, và nhà máy chỉ việc **tắt máy** — biên bằng 0, chứ không phải âm 7.5 (không ai chạy máy để lỗ). Nghĩa là *cả một nhà máy điện chính là một chuỗi call options hàng giờ* trên spark spread, mỗi giờ một option với quyền bật/tắt độc lập — cái mà industry gọi là "tolling option". Định giá một nhà máy điện do đó không phải nhân biên trung bình với số giờ, mà là **định giá một strip spark spread options** trải khắp năm, dùng Kirk (hoặc MC) cho từng giờ với vol điện rất cao (do spike) và vol gas thấp hơn. Đây chính là lý do mọi thương vụ M&A tài sản điện đều thuê hẳn quant định giá: giá trị thật của nhà máy nằm ở **optionality bật/tắt** — quyền không chạy khi lỗ — chứ không ở con số biên trung bình mà một bảng tính ngây thơ sẽ cho ra (và luôn cho ra thấp hơn giá trị thật).

## 11.6 Từ commodities sang inflation: nominal và real

Nửa còn lại của chương chuyển sang inflation, và cây cầu nối là một ý niệm thoạt trông tách biệt: **mức giá tổng quát của nền kinh tế** cũng là một "giá" mà ta cần mô hình hóa, phòng hộ, và định giá option lên trên. Cũng như dầu có forward curve và có option, inflation có forward (breakeven curve) và có option (caps/floors trên CPI) — và đằng sau là cùng một bộ máy no-arbitrage.

Điểm khởi đầu là quan hệ **Fisher**, tách lãi suất *nominal* thành hai thành phần kinh tế. Lãi suất nominal $i$ (con số bạn thấy trên trái phiếu chính phủ thường) gói trong nó cả **lãi suất real** $r$ (lợi tức tính bằng *sức mua thật*, sau khi trừ trượt giá) lẫn **inflation kỳ vọng** $\pi$. Dạng chính xác là dạng nhân, không phải cộng:

$$(1 + i) = (1 + r)(1 + \pi).$$

Trực giác: đầu tư 1 đồng một năm cho về $(1+i)$ đồng danh nghĩa; nhưng vì mỗi đồng năm sau chỉ mua được $1/(1+\pi)$ lượng hàng so với năm nay, sức mua thật thu về là $(1+i)/(1+\pi) = (1+r)$. Với lãi suất nhỏ, khai triển cho xấp xỉ tuyến tính quen thuộc $i \approx r + \pi$ (bỏ đi số hạng tích $r\pi$). Nhưng ở độ chính xác của desk, ta giữ dạng đầy đủ vì số hạng tích không hề vô hại.

**Ví dụ số — real rate ẩn.** Trái phiếu chính phủ nominal 10Y yield $i = 4.50\%$. Thị trường TIPS (inflation-linked, tức real bond) hàm ý inflation kỳ vọng $\pi = 2.30\%$ cùng kỳ hạn. Real rate thật, giải từ dạng nhân:

$$1 + r = \frac{1 + i}{1 + \pi} = \frac{1.0450}{1.0230} = 1.02151 \;\Rightarrow\; r = 2.151\%.$$

So với xấp xỉ tuyến tính $i - \pi = 4.50 - 2.30 = 2.20\%$, dạng đầy đủ cho $2.151\%$ — lệch khoảng **5bp**. Trên một danh mục inflation-linked bond hàng chục tỷ, 5bp không phải chuyện nhỏ (5bp trên 10 tỷ là 5 triệu mỗi năm), nên inflation desk luôn dùng dạng nhân và không bao giờ tin xấp xỉ cộng cho việc marking.

Đại lượng $\pi$ ẩn trong giá thị trường có tên riêng: **breakeven inflation**. Định nghĩa vận hành: nó là mức inflation khiến một nhà đầu tư *bàng quan* giữa việc giữ trái phiếu nominal và giữ trái phiếu real (TIPS/linker) cùng kỳ hạn. Nếu inflation *thực tế* xảy ra cao hơn breakeven, linker thắng (vì payoff của nó gắn với inflation thật, giờ cao hơn mức đã "giá vào" trong nominal); nếu thấp hơn breakeven, nominal thắng. Về mặt số, breakeven $\approx$ yield nominal trừ yield real $= 4.50 - 2.30 = 2.20\%$ trong ví dụ trên (dùng dạng cộng cho breakeven quote là chuẩn thị trường), và đây là **thước đo thị trường của inflation kỳ vọng** mà central bank theo dõi từng ngày để đọc kỳ vọng lạm phát của công chúng.

Nhưng có một điểm tinh tế mà desk phải nhớ: breakeven **không** bằng đúng inflation kỳ vọng thuần. Nó còn chứa một **inflation risk premium** — nhà đầu tư nắm nominal bond gánh rủi ro inflation bất ngờ bào mòn sức mua, nên họ đòi thêm một khoản đền bù, đẩy breakeven *cao hơn* kỳ vọng thuần một chút.

**Ví dụ số — tách breakeven thành kỳ vọng và premium.** Giả sử một mô hình term-structure ước lượng inflation risk premium 10Y là $p = 0.25\%$ (25bp — mức thực nghiệm điển hình cho kỳ hạn dài). Khi đó breakeven quan sát $2.20\%$ tách thành:

$$\underbrace{2.20\%}_{\text{breakeven}} = \underbrace{\pi^{\ast}}_{\text{inflation kỳ vọng thuần}} + \underbrace{0.25\%}_{\text{risk premium}} \;\Rightarrow\; \pi^{\ast} = 1.95\%.$$

Vậy kỳ vọng inflation "thật" của thị trường chỉ là $1.95\%$, còn $25\,\text{bp}$ còn lại là giá của rủi ro, không phải dự báo. Central bank đọc breakeven $2.20\%$ mà quên trừ premium sẽ *phóng đại* kỳ vọng lạm phát của công chúng — một sai lầm chính sách có hậu quả thật. Với một inflation trader, cùng con số này nói: nếu bạn tin risk premium sẽ co lại (thị trường bớt sợ inflation), breakeven sẽ giảm ngay cả khi kỳ vọng thuần đứng yên — một cách kiếm tiền tách bạch hẳn với việc dự báo CPI. Đây là loại phân rã mà chỉ dạng số cụ thể mới làm rõ được.

## 11.7 Inflation swaps: zero-coupon và year-on-year

Sản phẩm inflation *lỏng nhất* trên thị trường OTC không phải trái phiếu mà là **inflation swap** — hợp đồng trao đổi một dòng tiền cố định lấy một dòng tiền gắn với inflation thực tế. Có hai họ chính, và phân biệt được chúng — cùng hệ quả định giá — là kiến thức desk cốt lõi.

### 11.7.1 Zero-coupon inflation swap (ZCIS)

ZCIS trao **đúng một** dòng tiền duy nhất tại maturity $T$. Một chân trả lãi kép cố định tại rate $K$; chân kia trả **tăng trưởng thực tế lũy kế của index giá** $I$ suốt kỳ. Payoff chân inflation tại $T$ trên notional $N$:

$$N\left[\frac{I(T)}{I(0)} - 1\right],$$

trong khi chân fixed trả $N\big[(1+K)^T - 1\big]$. Rate $K$ khiến hai chân có cùng present value tại inception chính là **quote thị trường** của ZCIS kỳ hạn $T$ năm — con số một inflation trader nhìn suốt ngày.

Định giá dựa trên một nguyên lý sạch sẽ và sâu sắc: dưới nominal risk-neutral measure, kỳ vọng đã chiết khấu của $I(T)$ liên hệ với tỷ số của **real và nominal discount factors**. Cụ thể, forward index level là

$$\mathbb{E}^{\mathbb{Q}}\!\left[I(T)\right]_{\text{forward}} = I(0)\,\frac{P_r(0,T)}{P_n(0,T)},$$

với $P_n$ là nominal discount factor, $P_r$ là real discount factor. Đây chính là công thức FX-forward trá hình: $I(0)$ đóng vai "tỷ giá spot", real economy đóng vai "đồng ngoại tệ" với đường chiết khấu riêng $P_r$. Nếu real curve nằm *trên* nominal curve ($P_r > P_n$, tức real rate thấp hơn nominal rate — đúng khi có inflation dương), thì forward index $> I(0)$: thị trường "giá vào" việc giá cả sẽ tăng. Ta sẽ chính thức hóa phép loại suy này ở mục Jarrow-Yildirim.

**Ví dụ số — quote ZCIS.** Giả sử nominal curve cho $P_n(0,5) = 0.8025$ (ứng nominal zero 5Y $\approx 4.4\%$) và real curve cho $P_r(0,5) = 0.8975$ (ứng real zero 5Y $\approx 2.17\%$). Forward growth lũy kế của index qua 5 năm:

$$\frac{\mathbb{E}[I(5)]}{I(0)} = \frac{P_r(0,5)}{P_n(0,5)} = \frac{0.8975}{0.8025} = 1.11838.$$

Rate ZCIS $K$ phải thỏa $(1+K)^5 = 1.11838$, giải bằng cách lấy log rồi mũ:

$$1 + K = 1.11838^{1/5} = e^{\frac{1}{5}\ln 1.11838} = e^{\frac{0.11188}{5}} = e^{0.022376} = 1.02263,$$

vậy $K = 2.263\%$/năm. Đây chính là breakeven inflation 5Y ngụ ý bởi hai curve — số mà inflation trader quote cả ngày, và khớp gần đúng với breakeven ta suy từ chênh nominal-real zero ($4.4 - 2.17 \approx 2.23\%$, sai khác nhỏ do compounding).

Bây giờ giả sử inception xong, một năm trôi qua, và curve dịch nhẹ khiến forward inflation kỳ vọng nhích lên. MTM của ZCIS bằng present value của chênh hai chân dưới curve *mới*. Nếu forward inflation mới cao hơn $K$ đã khóa, chân inflation lời, nên bên nhận-inflation-trả-fixed có MTM dương. Cụ thể, với notional 100M, giả sử forward growth mới hàm ý inflation 5Y là **2.6%** thay vì $2.263\%$ đã khóa. Ta so hai growth factor lũy kế 5 năm:

$$(1.026)^5 = 1.13694, \qquad (1.02263)^5 = 1.11839,$$

chênh growth $= 1.13694 - 1.11839 = 0.01855$. Trên notional 100M, giá trị **chưa chiết khấu** của khoản chênh là $100\text{M} \times 0.01855 = +1.855\,\text{M}$. Vì dòng tiền chỉ trả tại $T=5$, ta chiết khấu về hiện tại bằng nominal discount factor $P_n(0,5) = 0.8025$:

$$\text{MTM}_{\text{discounted}} = 1.855\text{M} \times 0.8025 = +1.489\text{M}.$$

Vậy bên nhận inflation có MTM khoảng **+1.49M discounted** (tương đương +1.86M undiscounted) — đủ lớn để inflation desk quản lý cẩn thận từng ngày. Và một kỷ luật tối thiểu ẩn trong ví dụ này: phải ghi *rõ* con số nào là discounted, con số nào chưa. Nhầm lẫn hai đại lượng đó — một khác biệt 0.37M ở đây, gần 25% — là nhầm thẳng vào P&L báo cáo. Nghe hiển nhiên, nhưng đây là một trong những lỗi marking phổ biến nhất của junior trên inflation desk.

### 11.7.2 Year-on-year inflation swap (YoYIS)

YoYIS trả **một chuỗi** dòng tiền hàng năm, mỗi năm trả **tỷ lệ inflation của riêng năm đó** (chứ không phải lũy kế từ đầu):

$$\text{payoff năm } j = N\left[\frac{I(T_j)}{I(T_{j-1})} - 1\right].$$

Khác biệt với ZCIS thoạt trông nhỏ nhặt nhưng có hệ quả định giá lớn và tinh tế. ZCIS chỉ cần *một* forward index tại $T$. YoYIS cần forward của **tỷ số hai index kề nhau** $I(T_j)/I(T_{j-1})$ — và đây là mấu chốt: **kỳ vọng của một tỷ số không bằng tỷ số của các kỳ vọng** khi index có volatility (bất đẳng thức Jensen tác động lên hàm phi tuyến $1/x$). Chính khoảng cách đó sinh ra **convexity adjustment** (còn gọi inflation convexity), cùng họ với timing/convexity adjustment ta đã gặp ở rates. Trong repo, đây là địa hạt của `analytics/convexity` (`cmsConvexityAdjustment`, `quantoForward`) — cùng một cơ chế điều chỉnh kỳ vọng khi ta tính dưới một measure "sai" so với measure tự nhiên của payoff.

**Ví dụ số — một chân YoY với convexity.** Xét chân YoY của năm thứ 3 sang thứ 4. Forward YoY rate "ngây thơ" (đọc thẳng từ tỷ số forward index, bỏ qua vol) là $y_{3,4} = 2.30\%$. Convexity adjustment phụ thuộc vol của index growth $\sigma_I$, vol nominal rate $\sigma_n$, và tương quan giữa chúng. Ở bậc dẫn đầu:

$$\text{YoY forward}_{\text{adj}} \approx y_{3,4} + \underbrace{\sigma_I^2\,T}_{\text{inflation convexity}} - \underbrace{\rho\,\sigma_I\,\sigma_n\,T}_{\text{inflation-rates cross}}.$$

Hạng đầu ($+\sigma_I^2 T$) là convexity thuần từ Jensen trên tỷ số index; hạng thứ hai ($-\rho\sigma_I\sigma_n T$) là điều chỉnh do phải discount payoff YoY bằng nominal rate ngẫu nhiên tương quan với index (một quanto-timing effect). Lấy $\sigma_I = 1.0\%$ (vol index growth), $\sigma_n = 0.8\%$ (vol nominal short rate), $\rho = -0.20$ (trong regime này inflation và rates hơi nghịch — khi lạm phát tăng ngoài dự kiến, kỳ vọng nới lỏng tiền tệ có thể kéo rate kỳ vọng xuống), $T = 3.5$ (điểm giữa của kỳ 3→4). Tính từng số hạng:

- Inflation convexity: $\sigma_I^2\,T = (0.01)^2 \times 3.5 = 0.000350 = 3.5\ \text{bp}$.
- Cross term: $-\rho\,\sigma_I\,\sigma_n\,T = -(-0.20)(0.01)(0.008)(3.5) = +0.20 \times 0.00028 = 0.000056 = 0.56\ \text{bp}$.

Tổng adjustment $\approx +4.06\,\text{bp}$, cho YoY forward điều chỉnh $\approx 2.30\% + 0.041\% = 2.341\%$. Nghe nhỏ trên một chân, nhưng trên một strip 30 năm với nhiều chân, notional lớn, tổng các adjustment này quyết định hàng triệu MTM và là chính thứ tách một inflation desk định giá *đúng* khỏi một desk định giá *sai*. Nó cũng là lý do tuyệt đối **không được** quote một YoY swap bằng cách "chia đôi" một ZCIS: hai sản phẩm khác nhau về bản chất convexity, và bỏ qua khác biệt đó là bỏ qua vài bp có thật trên mỗi chân.

### 11.7.3 LPI: floor và cap trên inflation

Một sản phẩm inflation phổ biến đặc biệt ở thị trường Anh (thế giới pension) là **LPI — Limited Price Indexation**: dòng thanh toán tăng theo inflation nhưng **bị kẹp** trong một dải, kinh điển là **LPI(0%, 5%)** — nếu inflation năm đó dưới 0 thì floor về 0 (danh nghĩa không bao giờ giảm), nếu trên 5% thì cap tại 5%. Payoff YoY mỗi năm:

$$\min\!\Big(\max\big(\text{inflation}_j,\ 0\%\big),\ 5\%\Big).$$

Về mặt định giá, đây là **một chuỗi option** chồng lên dòng YoY: LPI = YoY inflation thuần + một chuỗi **floors ở 0%** (mà bên nhận LPI *long*, làm tăng giá trị) − một chuỗi **caps ở 5%** (mà bên nhận LPI thực chất *short*, làm giảm giá trị). Định giá LPI do đó là định giá một strip caplet/floorlet trên inflation, và điều này *đòi* một mô hình có smile inflation — bởi strike 0% và 5% nằm khá xa ATM (thường quanh 2-3%), nên vol tại các strike đó không thể lấy bằng vol ATM. Đây chính là điểm mà mô hình inflation phải "biết vol" chứ không chỉ "biết forward" — và là cầu tự nhiên dẫn sang Jarrow-Yildirim, mô hình cho ta cả động học lẫn cấu trúc vol.

**Ví dụ số — giá floorlet 0% của LPI.** Xét một năm cụ thể với YoY forward $f = 2.34\%$ và vol inflation $\sigma_I = 1.0\%$/năm, $T = 1$. Floor ở 0% là một *put* trên tỷ lệ inflation với strike $0\%$, hiện đang sâu OTM: ATM ở 2.34%, cách floor một khoảng $2.34\%$, tức $f/(\sigma_I\sqrt{T}) = 2.34$ độ lệch chuẩn. Điểm mô hình hóa quan trọng: vì inflation rate là đại lượng *cộng tính quanh 0* và **có thể âm** (giảm phát là chuyện thật), ta *không* dùng Black lognormal (vốn cấm giá trị âm) mà dùng **Bachelier (normal)** cho rate. Với $d = (f - K)/(\sigma_I\sqrt{T}) = (0.0234 - 0)/0.01 = 2.34$, giá floorlet (một put Bachelier, theo đơn vị rate, chưa discount) là:

$$\text{floorlet} = (K - f)\,N(-d) + \sigma_I\sqrt{T}\;\phi(d) = -0.0234\,N(-2.34) + 0.01\times\phi(2.34).$$

Tra bảng chuẩn tắc chính xác: $N(-2.34) = 0.009642$ và $\phi(2.34) = 0.025817$. Thay vào:

$$\text{floorlet} = -0.0234\,(0.009642) + 0.01\,(0.025817) = -0.0002256 + 0.0002582 = 3.26\times10^{-5}.$$

Tức **khoảng 0.33bp** giá trị — một con số nhỏ, nhưng **khác 0**, và đó chính là premium của bảo hiểm chống **giảm phát**. Nó bé ở đây vì floor nằm sâu OTM trong một regime inflation dương lành mạnh (2.34% cách xa 0). Nhưng đây là chỗ then chốt: trong một cú deflation shock (2009 sau khủng hoảng, 2020 quý 2 khi cầu sụp), khi forward inflation lao về gần 0 hoặc âm, khoảng cách chuẩn hóa $d$ sụt mạnh và floorlet này **bật lên nhiều bậc độ lớn** — đúng lúc pension cần nó nhất. Một pension bán LPI mà quên hedge chuỗi floor 0% này sẽ thua đau đúng vào thời điểm tồi tệ đó. Ngược lại, cap 5% chỉ có giá trị khi inflation vượt trần (như 2022 khi CPI nhiều nước vọt trên 5-8%), giới hạn phần upside mà pension phải trả — nên bên *nhận* LPI thực chất đang **short cái đuôi cap** đó, một rủi ro thường bị định giá nhẹ tay cho tới khi lạm phát cao thực sự ập đến.

## 11.8 Mô hình Jarrow-Yildirim: inflation như tỷ giá

Giờ ta chính thức hóa phép loại suy đã lấp ló suốt nửa chương: **Jarrow-Yildirim (2003)** mô hình hóa inflation bằng cách coi nền kinh tế gồm **hai "quốc gia"** — nominal và real — nối với nhau qua một "tỷ giá" chính là **consumer price index** $I(t)$. Đây là một cấu trúc *ba nhân tố* kiểu HJM/Hull-White, và trong repo ứng đúng với module `models/rates/jarrow-yildirim`. Vẻ đẹp của nó là: một khi bạn đã hiểu FX (Chương 10), bạn *đã* hiểu JY — chỉ cần đổi nhãn.

Ba nhân tố, với ba SDE:

$$dn(t) = [\theta_n(t) - a_n\, n(t)]\,dt + \sigma_n\,dW_n(t) \quad \text{(nominal short rate)},$$

$$dr(t) = [\theta_r(t) - a_r\, r(t) - \rho_{rI}\,\sigma_r\,\sigma_I]\,dt + \sigma_r\,dW_r(t) \quad \text{(real short rate)},$$

$$\frac{dI(t)}{I(t)} = [n(t) - r(t)]\,dt + \sigma_I\,dW_I(t) \quad \text{(price index)}.$$

Hai phương trình đầu là Hull-White chuẩn cho hai đường lãi suất, mỗi đường mean-reverting với tốc độ riêng $a_n, a_r$ về một mức phụ thuộc thời gian (các $\theta$ được calibrate để khớp curve đầu vào). Phương trình thứ ba là trái tim của phép loại suy FX: **index $I$ hành xử y hệt một tỷ giá**, với drift $[n(t) - r(t)]$ — chênh lãi suất nominal trừ real — đúng như tỷ giá FX có drift $r_d - r_f$ (chênh lãi suất đồng nội tệ trừ ngoại tệ). Trong ngôn ngữ Chương 10, phép ánh xạ hoàn hảo: **nominal = đồng nội tệ (domestic), real = đồng ngoại tệ (foreign), CPI = tỷ giá spot**. Mọi thứ bạn biết về FX forward chuyển thẳng sang.

### 11.8.1 Vì sao có hạng quanto trong drift real

Hạng $-\rho_{rI}\sigma_r\sigma_I$ trong drift của $r(t)$ là điểm tinh tế nhất của cả mô hình — và nó *không hề tùy tiện* mà bị **ép ra bởi no-arbitrage**. Đây chính xác là **quanto/convexity adjustment** mà ta đã gặp ở FX (Chương 10) và ở CMS (Chương 9): cùng một con thú, đội lốt mới.

Trực giác từng bước. Real short rate $r(t)$ *tự nhiên* sống dưới **real risk-neutral measure** — measure lấy tài khoản real money-market làm numéraire, tức measure của "đồng ngoại tệ". Nhưng ta muốn định giá *mọi thứ* trong book dưới **nominal risk-neutral measure** (numéraire nội tệ) để nhất quán với phần còn lại của sổ sách. Đổi measure từ real sang nominal đòi một phép biến đổi Girsanov, và cây cầu Radon-Nikodym cho phép đổi đó chính là CPI $I$ — đúng như trong FX, ta đổi từ measure ngoại tệ sang nội tệ bằng chính tỷ giá làm numéraire chuyển đổi. Girsanov nói: khi đổi measure, mỗi Brownian nhặt thêm một drift bằng đúng **covariance với log của Radon-Nikodym derivative**. Ở đây, real rate $r$ có covariance instantaneous với index $I$ bằng $\rho_{rI}\sigma_r\sigma_I$, và dấu của phép đổi làm drift của $r$ dịch đi đúng $-\rho_{rI}\sigma_r\sigma_I$. Nói cách khác, **cùng một máy móc** đã sinh ra quanto forward trong FX giờ sinh ra hạng điều chỉnh drift real trong inflation. Bạn không học lại gì mới — chỉ đổi nhãn "foreign rate" thành "real rate" và "FX rate" thành "CPI".

**Ví dụ số — quanto drift adjustment.** Lấy $\sigma_r = 0.9\%$ (vol real rate), $\sigma_I = 1.2\%$ (vol CPI), $\rho_{rI} = 0.30$ (real rate và inflation dương tương quan — khi kinh tế nóng lên, thường cả hai cùng đi lên). Điều chỉnh drift:

$$-\rho_{rI}\,\sigma_r\,\sigma_I = -(0.30)(0.009)(0.012) = -0.0000324 = -0.324\ \text{bp/năm}.$$

Trên một năm, hạng này dịch drift của real rate xuống khoảng 0.32bp — nhỏ tí xíu, và một người vội vàng có thể bị cám dỗ bỏ qua. Nhưng đó là cái bẫy: tích lũy trên horizon 30 năm và khuếch đại qua discounting phi tuyến, nó dịch forward real curve đủ để tạo khác biệt định giá thấy được trên option inflation dài hạn. Quan trọng hơn con số: **bỏ hạng này là mở toang một arbitrage** (mô hình không còn nhất quán giữa hai measure), và model validation (Chương 19) sẽ bắt lỗi ngay khi kiểm tra tính martingale của forward. Trong quant, những hạng "nhỏ nhưng bắt buộc" như thế này là ranh giới giữa một mô hình đúng và một mô hình rò rỉ tiền âm thầm.

### 11.8.2 Định giá ZCIS trong JY và ráp nối

JY cho công thức đóng cho cả forward index lẫn option inflation. Forward CPI dưới nominal measure có dạng:

$$\mathbb{E}^{\mathbb{Q}_n}\!\big[I(T)\big] = I(0)\,\frac{P_r(0,T)}{P_n(0,T)}\,\times\, \exp\big(C_T\big),$$

với $C_T$ là một hạng convexity đến từ vol và correlation. Điểm đẹp cần nhìn ra ngay: hạng chính $I(0)\,P_r/P_n$ *đúng bằng* công thức FX-forward mà ta đã dùng ở mục ZCIS (11.7.1) — nên quote ZCIS ở trên **chính là** trường hợp đặc biệt $C_T = 0$ (không vol) của JY. Hạng $\exp(C_T)$ là phần JY bổ sung khi ta cần định giá *option* (LPI cap/floor, YoY convexity), nơi vol và correlation thực sự tham gia. Không có vol thì hai công thức trùng khít; có vol thì JY tổng quát hơn.

*$C_T$ đến từ đâu.* Khi đổi index từ real numéraire sang nominal numéraire, log-forward index nhặt thêm một **cumulative covariance** giữa index và bond numéraire nominal. Ở bậc dẫn đầu (order $\sigma^2 T$), đóng góp chi phối là covariance giữa index và nominal rate, tích lũy qua vol của nominal zero-coupon bond kỳ hạn $T$. Với Hull-White, vol tích lũy của một bond kỳ hạn $T$ đi qua **B-factor** $B_n(T) = \frac{1 - e^{-a_n T}}{a_n}$ (đại lượng đo "duration hiệu dụng" mà mean-reversion tạo ra), và ta được:

$$C_T \approx \rho_{n I}\,\sigma_n\,\sigma_I\,B_n(T).$$

**Ví dụ số — ráp lại toàn mạch.** Dùng lại $P_n(0,5) = 0.8025$, $P_r(0,5) = 0.8975$ từ ZCIS, cho hạng chính của forward growth $0.8975/0.8025 = 1.11838$ y như trước. Giờ thêm vol: lấy $\sigma_I = 1.2\%$, $\sigma_n = 0.8\%$, $\rho_{nI} = 0.30$ (index và nominal rate dương tương quan), và mean-reversion nominal $a_n = 0.05$. Trước hết B-factor:

$$B_n(5) = \frac{1 - e^{-0.05\times 5}}{0.05} = \frac{1 - e^{-0.25}}{0.05} = \frac{1 - 0.7788}{0.05} = \frac{0.2212}{0.05} = 4.424.$$

Convexity tích lũy:

$$C_5 = (0.30)(0.008)(0.012)(4.424) = 1.27\times10^{-4} = 0.0127\%.$$

Nhân vào forward growth: $1.11838 \times e^{0.000127} = 1.11838 \times 1.000127 = 1.11852$. Điều này kéo breakeven từ $2.263\%$ lên:

$$K_{\text{adj}} = 1.11852^{1/5} - 1 = 2.2655\%,$$

tức **chỉ +0.26bp** so với mức không-vol $2.2628\%$ — một dịch chuyển *lên* rất nhỏ, chứ *không* phải vài bp như một ước lượng hand-wave bừa bãi có thể đoán. Điểm cốt lõi ở đây không phải độ lớn (rất nhỏ vì vol thấp), mà là **dấu và nguồn gốc**: hạng này derive được chặt chẽ từ B-factor và covariance, và nó tăng cùng $\rho_{nI}$, $\sigma_I$, $\sigma_n$ và horizon $T$ (qua $B_n(T)$). Chính sự nhất quán ấy là dấu hiệu một inflation desk *đúng*: quote ZCIS (không cần vol) và quote option inflation (cần vol) phải **cùng đến từ một mô hình JY đã calibrate**, chứ không phải hai mô hình rời rạc dùng tham số vênh nhau — vì nếu vênh, arbitrage nội bộ sẽ hé mở giữa hai sản phẩm.

Đóng lại vòng: một mô hình JY hoàn chỉnh calibrate ba khối — nominal curve (từ OIS và nominal bonds), real curve (từ linkers/TIPS), và vol/correlation matrix (từ inflation caps/floors và ZCIS options). Sau calibration, *cùng một* mô hình định giá nhất quán mọi thứ: ZCIS (không vol), YoY (với convexity đúng như 11.7.2), LPI (với cap/floor như 11.7.3), và mọi inflation exotic khác — không arbitrage, và nói cùng ngôn ngữ Hull-White với phần rates của book. Đó chính là điều industry đòi hỏi: một mô hình duy nhất, calibrate một lần, phục vụ cả sổ.

## 11.9 Sợi chỉ chung: khi vật lý gặp tài chính

Nhìn lại, hai nửa chương này thoạt trông xa lạ nhau đến kỳ cục — dầu thô nằm trong bồn ở Cushing và chỉ số giá tiêu dùng công bố hàng tháng — nhưng chúng chia chung một bài học sâu về cách khung định giá vận hành. Commodities buộc ta *thêm vật lý* vào khung tài chính: convenience yield mã hóa sự khan hàng, mean-reversion mã hóa chi phí sản xuất biên, seasonality mã hóa mùa vụ dự đoán được, và non-storability của điện phá vỡ chính nền móng cost-of-carry, buộc ta gọi tới jump-diffusion. Inflation thì đi con đường ngược: nó *mượn nguyên cấu trúc* của một asset class khác — FX — và ánh xạ mức giá vĩ mô thành "tỷ giá giữa nominal và real economy", để rồi tái dùng nguyên vẹn bộ máy no-arbitrage, đổi measure Girsanov, và quanto adjustment đã dựng sẵn từ trước.

Cả hai đều minh họa một nguyên tắc mà desk quant sống chết theo: **framework tài chính không phải giáo điều mà là ngôn ngữ**. Khi một tài sản có vật lý riêng mà khung chuẩn không nắm được, ta *mở rộng* ngôn ngữ — thêm $u$, $y$, mean-reversion, jump component. Khi một underlying mới hóa ra có *cùng cấu trúc toán* với thứ đã biết, ta *tái dùng* ngôn ngữ nguyên vẹn — JY chỉ là FX đội lốt inflation. Và chính khả năng nhận ra khi nào cần mở rộng và khi nào chỉ cần tái dùng — chứ không phải học thuộc lòng từng công thức riêng lẻ — là thứ phân biệt một quant giỏi với một người chỉ biết cắm số vào máy. Với commodities và inflation đã nằm trong tay, bạn đã hoàn tất bức tranh các asset class chính của thị trường; các chương tiếp theo xoay trục từ câu hỏi *cái gì* để định giá sang câu hỏi *bằng công cụ số nào* — Monte Carlo, PDE, và các kỹ thuật tăng tốc — để định giá tất cả những thứ đó cho vừa nhanh vừa chính xác trên quy mô một book thật.

# Chương 12: Phương pháp số

Một model, cho đến giây phút cuối cùng, chỉ là một SDE nằm trên giấy — vài dòng chữ Hy Lạp mô tả cách $S_t$ khuếch tán qua thời gian. Tiền không được tạo ra ở đó. Tiền được tạo ra (hoặc mất đi) trong **engine số**: cái cỗ máy biến $\mathbb{E}^{\mathbb{Q}}$ trừu tượng thành một con số có dấu phẩy thập phân mà một trader dám mua bán quanh nó. Cả một desk quant, tước bỏ mọi thứ, quy về bốn họ engine và một nghi thức: Monte Carlo cho không gian nhiều chiều, PDE cho ít chiều nhưng cần optionality chính xác, calibration để nhét model vào giá thị trường, và AAD để lấy Greeks với chi phí gần như miễn phí. Chương này đi qua cả bốn, và mỗi khái niệm đều được đóng đinh bằng một phép tính ra số cụ thể — bởi vì trong numerics, câu "phương pháp này hội tụ" mà không kèm một con số sai số là câu nói vô nghĩa.

Trong `quantc`, bốn họ này ứng với các tầng `src/numerics`, `src/engines`, `src/calibration`, và `src/aad`; tầng proxy học máy `src/proxy` là lớp gia tốc dựng trên chúng.

## 12.1 Monte Carlo — vì sao lời nguyền $1/\sqrt{N}$ lại là bạn

Bài toán trung tâm của định giá là một tích phân kỳ vọng dưới measure risk-neutral:

$$V = e^{-rT}\,\mathbb{E}^{\mathbb{Q}}\!\big[h(S_{\text{path}})\big].$$

Monte Carlo giải nó theo cách thô bạo nhất có thể tưởng tượng: mô phỏng $N$ đường giá độc lập, tính payoff chiết khấu $Y^{(i)} = e^{-rT}h(S^{(i)}_{\text{path}})$ trên mỗi đường, rồi lấy trung bình mẫu $\hat V = \frac1N\sum_i Y^{(i)}$. Định lý giới hạn trung tâm đảm bảo $\hat V$ tiệm cận phân phối chuẩn quanh giá thật, với độ lệch chuẩn của ước lượng — standard error — bằng

$$\mathrm{SE} = \frac{\sigma_h}{\sqrt N},$$

trong đó $\sigma_h$ là độ lệch chuẩn của biến ngẫu nhiên payoff chiết khấu. Điểm mấu chốt, thứ khiến MC thống trị toàn bộ ngành: $\mathrm{SE}$ **không chứa số chiều**. Cho dù bạn mô phỏng một tài sản hay năm trăm tài sản tương quan chằng chịt, sai số vẫn co lại theo đúng $1/\sqrt N$. Đó là lý do mọi bài toán nhiều tài sản, mọi payoff path-dependent, và toàn bộ XVA cấp portfolio đều chạy trên MC — không có đối thủ nào khác sống sót được ở chiều cao.

Cái giá của tính phổ quát ấy là tốc độ hội tụ chậm. Hãy tính bằng số với chính con call ATM đã gặp ở Chương 5: $S_0=100, K=100, r=5\%, \sigma=20\%, T=1$, giá thật $C=10.45$. Độ lệch chuẩn của payoff chiết khấu $e^{-rT}(S_T-K)^+$ cho bộ tham số này vào khoảng $\sigma_h \approx 15$. Với $N=100{.}000$ paths:

$$\mathrm{SE} = \frac{15}{\sqrt{100{.}000}} = \frac{15}{316.23} = 0.047,$$

tức khoảng $0.45\%$ của giá. Muốn giảm sai số xuống mười lần, còn $0.0047$, ta cần $N$ **gấp một trăm** — mười triệu paths. Nếu một trăm nghìn paths chạy mất một giờ, thì mười triệu paths mất bốn ngày. Đó chính là lời nguyền $1/\sqrt N$: mỗi chữ số chính xác tốn thêm hai bậc độ lớn compute.

Nhưng lời nguyền ấy cũng là lời chúc phúc, và đây là chỗ trực giác quant tách khỏi trực giác giáo khoa. Vì sai số tỉ lệ với $\sigma_h$, nên **hạ được $\sigma_h$ đáng giá bằng vàng**. Một control variate tốt giảm độ lệch chuẩn của estimator đi 5–10 lần; theo quan hệ bậc hai, đó là tiết kiệm 25–100 lần compute. Cả một nhánh của numerics — variance reduction — tồn tại chỉ để khai thác đúng quan sát này. Ta sẽ quay lại nó ở 12.1.4. Trước hết, hãy đi qua pipeline chuẩn mà mọi MC engine production đều có: RNG, quasi-random, discretization, variance reduction, và Greeks.

### 12.1.1 RNG: nguồn ngẫu nhiên và cạm bẫy của nó

Mọi đường Monte Carlo bắt đầu từ một chuỗi số "ngẫu nhiên" — thực ra là giả ngẫu nhiên, sinh bởi một thuật toán tất định. Suốt hai thập kỷ, ngựa thồ của ngành là **Mersenne Twister**, một generator có chu kỳ $2^{19937}-1$ (con số này chính là tên nó), phân bố tốt đến 623 chiều. Nó vẫn phổ biến. Nhưng kiến trúc hiện đại đã dịch sang **counter-based RNG** như **Philox**: thay vì giữ trạng thái nội tại phải cập nhật tuần tự, Philox tính $\text{random}(i)$ như một hàm mã hóa của chỉ số $i$ và một key. Hệ quả thực chiến rất lớn: hai luồng tính toán song song trên GPU có thể lấy stream con độc lập chỉ bằng cách chọn key khác nhau, và kết quả **reproducible** bất kể thứ tự thực thi — điều Mersenne Twister không cho được vì trạng thái của nó là tuần tự. Trong thế giới nghìn-core, reproducibility là điều kiện sống còn cho audit.

Từ chuỗi uniform $U\in(0,1)$ ta cần biến thành chuẩn tắc $Z\sim N(0,1)$. Cách đúng của industry là **inverse CDF** — áp $Z = N^{-1}(U)$ bằng approximation Acklam hoặc Wichura (chính xác đến $\sim 10^{-9}$). Đây không phải chuyện thẩm mỹ: nếu bạn dùng quasi-random (mục sau), bạn **bắt buộc** phải dùng inverse CDF chứ tuyệt đối không Box-Muller, vì Box-Muller lấy cặp $(U_1,U_2)$ và biến đổi phi tuyến làm hỏng cấu trúc low-discrepancy được thiết kế công phu của chuỗi Sobol. Trong `quantc` mảng này nằm ở `src/numerics/rng`.

### 12.1.2 Quasi-Monte Carlo: đánh bại $1/\sqrt N$

Pseudo-random points rải trên $[0,1]^d$ theo kiểu ngẫu nhiên thật — và ngẫu nhiên thật thì vón cục: có chỗ dày, có chỗ thủng lỗ. Những lỗ thủng ấy chính là variance. **Quasi-Monte Carlo (QMC)** thay chuỗi ngẫu nhiên bằng **low-discrepancy sequence** — điển hình là **Sobol** — được thiết kế để lấp đầy hộp đơn vị đều nhất có thể, không vón, không thủng. Với payoff đủ trơn, sai số QMC hội tụ gần $O\!\big((\log N)^d / N\big)$, tức **gần $1/N$** thay vì $1/\sqrt N$. Đây là mặc định của industry cho pricing vanilla và nhiều exotic.

Neo con số cho cụ thể. Với call ATM ở trên, pseudo-random hội tụ theo $\sigma_h N^{-1/2}$: tại $N=100{.}000$ đó là $15\times N^{-0.5} = 15\times 0.00316 = 0.047$. QMC, sau khi đã giảm chiều hiệu dụng xuống $d\approx 4$ nhờ PCA (xem dưới), hội tụ gần $k\,N^{-0.9}$; với hằng số điển hình $k\approx 30$ ta có $30\times N^{-0.9} = 30\times 3.16\times 10^{-5} \approx 9.5\times 10^{-4}$ — về vùng $10^{-3}$. So sánh trực tiếp: **cùng $N=100{.}000$ paths**, pseudo cho sai số $0.047$, QMC cho $\sim 9.5\times 10^{-4}$ — nhỏ hơn đúng **50 lần**, tức gần hai bậc độ lớn. Nói cách khác, để đạt độ chính xác $9.5\times 10^{-4}$ bằng pseudo-random bạn cần $N$ lớn gấp $50^2 = 2500$ lần. Ở quy mô một sáng phải reprice cả book, đó là khác biệt giữa kịp mở cửa và trễ.

Nhưng QMC có một tử huyệt: nó chỉ giữ được tốc độ hội tụ tốt ở các chiều **đầu tiên** của chuỗi Sobol; các chiều sau dần thoái hóa về gần ngẫu nhiên. Với một đường Brownian gồm, chẳng hạn, 250 bước thời gian, ta có 250 chiều Sobol — nếu để mặc định, phần lớn "sức mạnh" của Sobol bị lãng phí vào các chiều cuối ít quan trọng. Thủ thuật là **Brownian bridge** hoặc **PCA construction**: sắp xếp lại cách các số Sobol ánh xạ vào đường Brownian sao cho các chiều đầu (chất lượng nhất) gánh phần lớn variance. Brownian bridge xây đường bằng cách đặt điểm cuối $W_T$ trước (chiều Sobol số 1 — quan trọng nhất, quyết định moneyness), rồi điểm giữa, rồi chia đôi đệ quy; PCA thì chiếu lên các eigenvector của ma trận hiệp phương sai theo thứ tự eigenvalue giảm dần, dồn variance vào chiều đầu một cách tối ưu. Với một Asian option chịu ảnh hưởng chủ yếu bởi mức trung bình (một combination tuyến tính chi phối), PCA có thể dồn 90%+ variance vào 3–4 chiều đầu — và đó chính xác là nơi Sobol tỏa sáng, và cũng là lý do "chiều hiệu dụng $d\approx 4$" trong phép tính neo số ở trên là hợp lý. Tầng này trong `quantc` là `src/numerics/rng` (Sobol, scrambled-Sobol, brownian-bridge) và engine `src/engines/qmc-engine`, `src/engines/rqmc`.

Một tinh tế cuối: Sobol thuần là tất định, nên ta không có SE để báo cáo sai số. Giải pháp production là **randomized QMC (RQMC)** — scramble chuỗi Sobol bằng một phép ngẫu nhiên hóa giữ nguyên tính low-discrepancy nhưng cho phép chạy vài chục bản độc lập, từ đó ước lượng sai số bằng phương sai giữa các bản. Ta được cả hai: hội tụ gần $1/N$ và một thanh error bar tin cậy được.

### 12.1.3 Discretization: từ SDE liên tục về lưới thời gian

GBM là trường hợp may mắn: nó có nghiệm exact, $S_T = S_0\exp\!\big((r-\tfrac12\sigma^2)T + \sigma\sqrt T\,Z\big)$, nên ta sample thẳng phân phối lognormal của $S_T$ không cần chia bước — không có discretization error nào cả. Nhưng đa số model không cho quà đó. SDE tổng quát $dX = a(X)\,dt + b(X)\,dW$ phải được rời rạc hóa.

Sơ đồ cơ bản là **Euler-Maruyama**: trên bước $\Delta t$,

$$X_{t+\Delta t} = X_t + a(X_t)\,\Delta t + b(X_t)\sqrt{\Delta t}\,Z,\qquad Z\sim N(0,1).$$

Euler có **weak order 1** — sai số kỳ vọng của một hàm payoff giảm tuyến tính theo $\Delta t$: chia đôi bước thì halve bias. Nó cũng có **strong order chỉ $\tfrac12$** — sai số trên từng đường (chứ không chỉ trên kỳ vọng) giảm chậm hơn, theo $\sqrt{\Delta t}$. **Milstein** thêm một số hạng bậc hai

$$\tfrac12\, b(X_t)\,b'(X_t)\big((\sqrt{\Delta t}\,Z)^2-\Delta t\big),$$

nâng **strong order lên 1** — mỗi đường bám nghiệm thật gấp đôi độ chính xác khi chia đôi bước — hữu ích khi ta quan tâm chính đường đi (path-dependent, barrier) chứ không chỉ kỳ vọng. Số hạng hiệu chỉnh ấy không trừu tượng; neo nó bằng số trên chính GBM, nơi $b(X)=\sigma X$ nên $b'(X)=\sigma$. Lấy $X_t=100,\ \sigma=20\%,\ \Delta t = 0.01$ và rút một cú sốc $Z=1.5$. Số hạng Milstein là

$$\tfrac12\,(\sigma X_t)(\sigma)\big((\sqrt{\Delta t}\,Z)^2 - \Delta t\big) = \tfrac12\,(0.2\times 100)(0.2)\big((0.1\times 1.5)^2 - 0.01\big) = 2\times(0.0225-0.01) = 0.025.$$

So với bước Euler thuần cho cùng cú sốc — số hạng khuếch tán $\sigma X_t\sqrt{\Delta t}\,Z = 20\times 0.1\times 1.5 = 3.0$ — hiệu chỉnh $0.025$ nhỏ nhưng có dấu xác định (nó **cong** bước theo curvature của $b$), và trên hàng trăm bước, chính nó là thứ kéo strong order từ $\tfrac12$ lên $1$.

Heston là ca khó khét tiếng và đáng dừng lại. Variance process $dv = \kappa(\bar v - v)\,dt + \xi\sqrt v\,dW$ có thể **chạm 0**, và khi đó $\sqrt v$ trong Euler làm variance âm — một trạng thái vô nghĩa, thường bị "vá" thô bằng cách kẹp về 0, gây bias. Đây không phải lỗi hiếm gặp: với các bộ tham số vi phạm điều kiện Feller $2\kappa\bar v \ge \xi^2$ (rất phổ biến trong calibration thực tế), Euler kẹp-0 có thể sai giá option cả phần trăm. Chuẩn công nghiệp là sơ đồ **Quadratic-Exponential (QE) của Andersen**: nó không rời rạc $\sqrt v$ mà sample trực tiếp phân phối có điều kiện của $v_{t+\Delta t}$ cho $v_t$, dùng xấp xỉ bình phương của chuẩn khi variance cao và phân phối lũy thừa-có-khối-tại-0 khi variance thấp, khớp đúng hai moment đầu của phân phối chi-square phi tâm thật. Kết quả: chính xác cao ngay cả với bước lớn và ngay cả khi Feller bị vi phạm. Trong `quantc`, các scheme này sống trong `src/engines/path-engine` và `src/engines/mc-core`.

Một minh họa bias discretization bằng số: định giá một barrier down-and-out bằng Euler với đường rời rạc chỉ "nhìn" spot tại các mốc lưới. Nếu đường đâm xuống dưới barrier **giữa** hai mốc rồi bật lên, Euler bỏ sót cú chạm — làm giá knock-out option thiên **cao** một cách có hệ thống. Với 50 bước thời gian trên một năm, bias này điển hình cỡ 1–3% của giá option — không phải sai số làm tròn mà là một thiên lệch một dấu; cách trị là **Brownian bridge correction** — với mỗi bước, tính xác suất giải tích rằng cầu Brownian nối hai mốc đã vượt barrier, rồi knock-out theo xác suất đó. Chẳng hạn nếu hai mốc kề nhau là $S_t=105$ và $S_{t+\Delta t}=103$ với barrier $B=100$, cầu Brownian giữa chúng vẫn có xác suất dương chạm $100$ dù cả hai đầu đều trên barrier — và công thức reflection cho xác suất đó dạng đóng, nên ta không cần chia bước mịn hơn để bắt được cú chạm. Đây là ví dụ điển hình cho nguyên tắc: discretization error không chỉ là "sai số nhỏ", nó có thể là bias một dấu mà bạn phải chủ động khử.

### 12.1.4 Variance reduction: nơi tiền thật được tiết kiệm

Đã nói SE tỉ lệ $\sigma_h$; giờ là bốn cách hạ $\sigma_h$.

**Antithetic variates** là rẻ nhất và yếu nhất: với mỗi đường sinh từ $Z$, sinh thêm đường phản chiếu từ $-Z$. Vì payoff của hai đường tương quan âm (một lên thì một xuống), trung bình của cặp có variance nhỏ hơn. Với payoff gần tuyến tính theo $Z$ (như một forward), antithetic khử gần trọn variance; với payoff cong mạnh, lợi ích khiêm tốn. Nó gần như miễn phí nên hầu như luôn bật.

**Control variates** là mạnh nhất khi có "người anh em" định giá được bằng closed-form. Nguyên lý: nếu $Y$ là payoff ta cần và $C$ là một payoff tương quan cao mà ta **biết** $\mathbb{E}[C]$, thì estimator hiệu chỉnh

$$\hat V_{\text{cv}} = \bar Y - \beta\big(\bar C - \mathbb{E}[C]\big)$$

có variance $\mathrm{Var}(Y)(1-\rho^2_{Y,C})$, với $\rho$ là hệ số tương quan và $\beta = \mathrm{Cov}(Y,C)/\mathrm{Var}(C)$ tối ưu. Ví dụ kinh điển: Asian **arithmetic** không có closed-form, nhưng Asian **geometric** thì có (trung bình hình học của lognormal vẫn lognormal). Vì hai payoff tương quan cực cao — $\rho \approx 0.99$ trong nhiều thiết lập — control variate geometric để lại chỉ $1-0.99^2 = 0.0199$, tức $\approx 2\%$ variance còn lại, tương đương giảm SE khoảng $\sqrt{1/0.0199}\approx 7.09$ lần. Bảy lần SE nghĩa là tiết kiệm $7.09^2\approx 50$ lần compute từ một dòng code cộng closed-form. Trong `quantc` phần này là `src/numerics/variance-reduction` với control dựa trên `src/numerics/analytic/geometric-asian`.

**Importance sampling** là vũ khí cho sự kiện hiếm: định giá một deep-OTM option hay một credit event xác suất 0.1%. Nếu phần lớn đường chẳng bao giờ chạm vùng payoff dương, ta đang lãng phí — variance khổng lồ vì hầu hết $Y^{(i)}=0$. Importance sampling **dịch measure** để đường thường xuyên rơi vào vùng quan trọng (ví dụ dịch drift kéo spot về phía strike), rồi hiệu chỉnh lại bằng likelihood ratio Radon-Nikodym để estimator vẫn không thiên. Neo bằng số cho cụ thể: giả sử chỉ $2\%$ đường chạm vùng payoff dương ($p=0.02$). Với indicator thô, tỉ số $\sigma_h/\text{mean}$ (coefficient of variation) tỉ lệ $\sqrt{(1-p)/p} = \sqrt{0.98/0.02} \approx 7$, nghĩa là để có SE tương đối $1\%$ ta cần cỡ $7^2/0.01^2 \approx 5\times 10^5$ đường chỉ để cưa qua nhiễu của sự kiện hiếm. Dịch measure sao cho vùng payoff dương thành xác suất $\sim 50\%$ kéo coefficient of variation xuống cỡ $1$, tức giảm variance khoảng hai bậc độ lớn — cùng độ chính xác nay chỉ tốn $\sim 5\times 10^3$ đường. Module tương ứng: `src/numerics/variance-reduction/importance-sampling`.

### 12.1.5 Greeks trong MC: bốn con đường, bốn cạm bẫy

Định giá xong mới là nửa việc; desk cần đạo hàm — delta, vega, gamma — để hedge. Trong MC có bốn cách.

**Bump-and-reprice** là ngây thơ nhất: reprice với $S_0$ và $S_0+\epsilon$, lấy hiệu chia $\epsilon$. Cạm bẫy chết người là tỉ số tín hiệu trên nhiễu, và nó đáng đóng đinh bằng số. Delta thật của call ATM là $0.637$ (Chương 5). Nếu hai lần chạy dùng **hai** bộ số ngẫu nhiên độc lập, mỗi giá mang SE $=0.047$, nên hiệu của chúng có SE $=\sqrt2\times 0.047 = 0.067$. Chia cho một bump $\epsilon=0.1$, nhiễu trên ước lượng delta là $0.067/0.1 = 0.67$ — **lớn hơn cả tín hiệu delta $0.637$**. Nói cách khác, ta đang lấy hiệu của hai số nhiễu để tìm một đạo hàm, và nhiễu nuốt trọn tín hiệu: kết quả là rác. Cứu cánh là **common random numbers (CRN)**: dùng **đúng cùng** seed cho cả hai lần. Khi đó phần lớn noise triệt tiêu trong phép trừ (hai giá dịch chuyển gần như song song), và delta hiện ra sạch. CRN không phải tùy chọn — nó là bắt buộc, và quên nó là bug MC-Greeks phổ biến nhất của junior.

**Pathwise derivative** đạo hàm payoff dọc theo đường trước khi lấy kỳ vọng: $\Delta = \mathbb{E}[\partial h/\partial S_0]$, hợp lệ khi payoff Lipschitz (như vanilla call, đạo hàm là $e^{-rT}\mathbf{1}_{S_T>K}\cdot S_T/S_0$). Nó cho estimator không thiên với variance thấp, không cần bump. Nhưng nó gãy khi payoff không trơn — một digital option có payoff bậc thang, đạo hàm là delta-Dirac, pathwise vô nghĩa.

Cho đúng ca đó có **likelihood ratio (LR)**: thay vì đạo hàm payoff, đạo hàm **mật độ** của $S_T$. Payoff giữ nguyên (kể cả gãy), ta nhân với score function $\partial_\theta \log p(S_T)$. LR xử được digital nhưng đổi lại variance cao hơn ở maturity dài. Rule of thumb: pathwise cho payoff trơn, LR cho payoff gãy, và trong thực tế người ta trộn (pathwise cho delta, LR cho digital risk). Module: `src/numerics/variance-reduction/likelihood-ratio`.

Con đường thứ tư — **AAD** — cho tất cả Greeks cùng lúc với chi phí cố định, và đủ quan trọng để dành riêng mục 12.5.

### 12.1.6 Hai bài kiểm tra bắt buộc khi viết MC engine

Không engine MC nào được lên production trước khi qua hai test này, và cả hai đều là test bằng số cụ thể.

**Test 1 — khớp closed-form.** Price một vanilla mà bạn biết đáp án BS: call ATM phải ra $10.45$. Estimator MC được coi là đúng nếu $|\hat V - 10.45|$ nằm trong $\pm 2\,\mathrm{SE} = \pm 0.094$ với xác suất ~95%. Lệch quá là có bug drift hoặc discount.

**Test 2 — martingale test.** Dưới $\mathbb{Q}$, tài sản chiết khấu là martingale: $\mathbb{E}^{\mathbb{Q}}[e^{-rT}S_T] = S_0 = 100$. Chạy engine của bạn tính vế trái; nó phải ra $100$ trong $\pm 2\,\mathrm{SE}$. Đây là test nhạy nhất với lỗi kinh điển: quên số hạng $-\tfrac12\sigma^2$ trong drift lognormal. Nếu quên, $\mathbb{E}[e^{-rT}S_T]$ trở thành $S_0\,e^{\sigma^2 T/2}$, lệch lên đúng $e^{\sigma^2 T/2}-1 = e^{0.02}-1 \approx 2.02\%$ với $\sigma=20\%$ — tức khoảng $2.02$ trên $100$, mà SE chỉ cỡ $0.047\times\sqrt{\sigma_S^2/\sigma_h^2}\sim$ vài phần trăm của một; nói cách khác lệch $2.02$ **to hơn SE cả hàng chục lần**, rõ mồn một. Nếu Test 2 fail, gần như chắc chắn hoặc lỗi drift đó, hoặc sai seed/pairing của antithetic. Nhiều junior tốn cả ngày dò bug định giá exotic trong khi martingale test — chạy trong ba dòng — đã chỉ thẳng vào drift sai.

## 12.2 American Monte Carlo — Longstaff-Schwartz và bài toán tại sao MC lại "khó" với early exercise

MC vốn đi tới (forward): sinh đường từ hôm nay ra tương lai. Nhưng early exercise là bài toán **lùi**: tại mỗi ngày có quyền thực thi, người giữ option so sánh giá trị thực thi ngay (intrinsic) với giá trị giữ tiếp (continuation) — mà continuation là một kỳ vọng về **tương lai**, thứ MC forward chưa biết khi đang đứng ở giữa đường. Đây là lý do American trong MC từng bị coi là bất khả, cho đến khi Longstaff và Schwartz (2001) đưa ra **Least-Squares Monte Carlo (LSM)** — thuật toán đến giờ vẫn là chuẩn tuyệt đối cho Bermudan trong LMM và cho **exposure có tính exercise trong XVA**.

Ý tưởng: đi backward qua các exercise dates. Tại mỗi date, thay vì tính continuation value bằng một MC lồng (nested — cực đắt), ta **hồi quy** nó lên vài basis function của state hiện tại. Regression rút ra kỳ vọng có điều kiện $\mathbb{E}[\text{continuation}\mid \text{state}]$ như một hàm trơn của state, dùng chính các đường MC đã có làm dữ liệu. Trong `quantc`: `src/engines/longstaff-schwartz`.

Cụ thể hóa một bước regression để thấy nó thật đến từng con số. Xét một Bermudan **put** với strike $K=100$ và hai exercise dates, ta đang đứng tại date 1 (còn nửa đời sống đến date 2). Mỗi đường $p$ có state là spot $S^{(p)}$ và một discounted payoff tương lai $Y^{(p)}$ — tức giá trị mà đường đó sẽ nhận nếu **không** exercise tại date 1 mà giữ đến date 2 (chiết khấu về date 1). Ta hồi quy

$$Y \sim \beta_0 + \beta_1 S + \beta_2 S^2$$

bằng least squares trên vài nghìn đường ITM. Giả sử fit ra $\hat\beta_0 = 116.06,\ \hat\beta_1 = -1.845,\ \hat\beta_2 = 0.00742$, tức

$$\hat C(S) = 116.06 - 1.845\,S + 0.00742\,S^2.$$

Quy tắc quyết định tại mỗi đường: exercise nếu intrinsic vượt continuation ước lượng, $(K - S^{(p)})^+ > \hat C(S^{(p)})$. Chạy nó ra số trên bốn đường mẫu:

| Đường (spot $S^{(p)}$) | Intrinsic $(100-S)^+$ | $\hat C(S^{(p)})$ | Quyết định |
|---|---|---|---|
| $S=82$ | $18.0$ | $14.66$ | **exercise** (intrinsic thắng) |
| $S=88$ | $12.0$ | $11.16$ | **exercise** (intrinsic thắng) |
| $S=95$ | $5.0$ | $7.75$ | giữ (continuation thắng) |
| $S=105$ | $0.0$ | $4.14$ | giữ (OTM, không exercise) |

Bảng này là chính linh hồn của LSM đọc bằng số: regression biến "kỳ vọng về tương lai" thành một đường cong $\hat C(S)$, và cái đường cong ấy cắt đường intrinsic tại một **exercise boundary**. Giải $(100-S)=\hat C(S)$ cho nghiệm nằm dưới $100$: $0.00742\,S^2 - 0.845\,S + 16.06 = 0$, ra $S^* \approx 89.8$. Ta kiểm được ngay tính nhất quán của boundary: tại $S=89$ intrinsic $=11$ vẫn thắng continuation $\hat C(89)=10.63$ (exercise), còn tại $S=90$ intrinsic $=10$ đã thua $\hat C(90)=10.11$ (giữ) — crossover đúng quanh $89.8$. Đường sâu ITM ($S=82, 88$, dưới boundary) thì thực thi ngay; đường nông hoặc OTM ($S=95, 105$, trên boundary) thì giữ. Không có regression, ta sẽ không biết ngưỡng ấy nằm đâu.

Ba tinh tế của LSM, mỗi cái trả bằng tiền thật nếu làm sai:

**(a) Chỉ hồi quy trên các đường ITM.** Các đường OTM sẽ không bao giờ exercise, nên đưa chúng vào regression chỉ làm nhiễu fit ở vùng ta không cần chính xác. Chỉ regress trên tập ITM giúp $\hat C$ chuẩn đúng ở vùng ranh giới quyết định — nơi duy nhất quan trọng.

**(b) Tách paths học policy khỏi paths chấm điểm.** Nếu dùng **cùng** bộ đường vừa để estimate $\hat C$ vừa để định giá, ta đưa vào **foresight bias** — regression đã "nhìn trộm" tương lai của chính các đường nó chấm, thổi giá lên trên. Cách sạch là chạy LSM để **học** policy exercise trên một bộ đường, rồi áp policy đó (định giá) trên một bộ đường **độc lập** khác. Tách "học policy" khỏi "chấm điểm policy" là kỷ luật không thể bỏ.

**(c) Chọn basis là 80% chất lượng.** Với single-factor, đa thức bậc 2–3 của spot là đủ (đúng như bảng trên). Nhưng với multi-factor (Bermudan swaption trong LMM), basis đúng phải là các **đại lượng kinh tế** của bài toán — swap rate còn lại, annuity, vol state — chứ không phải raw forward rates. Basis kém dẫn tới exercise policy dưới tối ưu, và vì exercise dưới tối ưu luôn để lại giá trị trên bàn, LSM với basis tồi cho giá **thiên thấp** một cách có hệ thống. Chọn basis, không phải chọn optimizer, mới là nơi một LSM implementation thắng thua.

### 12.2.1 Lower bound, upper bound, và duality Andersen-Broadie

Đây là chỗ mở rộng sâu quan trọng nhất so với cách trình bày LSM cổ điển. LSM cho ta một **lower bound** cho giá option, và điều này không phải ngẫu nhiên mà là cấu trúc: policy exercise mà LSM học được là **một** policy khả thi (feasible) nhưng không nhất thiết tối ưu; áp bất kỳ policy khả thi nào cũng cho giá $\le$ giá tối ưu thật. Nếu basis tồi, policy tồi, lower bound tụt xa. Vấn đề: chỉ có lower bound thì ta không biết mình cách giá thật bao xa — có thể LSM đang thiếu 0.1%, cũng có thể thiếu 3%.

Lời giải là **dual formulation** của Rogers (2002) và thuật toán thực thi của **Andersen-Broadie (2004)**, cho một **upper bound** độc lập. Trực giác của duality: giá của một American option bằng

$$V_0 = \inf_{M}\ \mathbb{E}\Big[\max_{t}\big(\text{payoff}_t - M_t\big)\Big],$$

lấy infimum trên mọi martingale $M$ khởi từ 0. Với **bất kỳ** martingale nào ta chọn, biểu thức trong ngoặc cho một **upper bound**; và nếu chọn đúng martingale tối ưu (chính là phần martingale trong khai triển Doob-Meyer của discounted option value), bound chặt đến bằng giá thật. Andersen-Broadie xây martingale xấp xỉ ấy từ chính continuation value $\hat C$ mà LSM đã ước lượng — bằng cách chạy một MC lồng nhỏ để ước lượng gia số martingale tại mỗi bước — rồi tính kỳ vọng của $\max_t(\text{payoff}_t - M_t)$.

Vẻ đẹp của cặp bound là nó biến câu hỏi triết học "policy của tôi tối ưu chưa" thành một con số đo được. Hãy đóng đinh nó bằng chính con Bermudan put ở trên. Chạy LSM ta thu lower bound

$$\underline V = 6.052.$$

(Để đối chiếu độ lớn: European put cùng $S_0=100,K=100,r=5\%,\sigma=20\%,T=1$ trị giá $5.57$; giá trị early-exercise của quyền Bermudan đẩy nó lên trên mức đó — hợp lý.) Chạy Andersen-Broadie trên cùng continuation function ta thu upper bound

$$\overline V = 6.061.$$

Duality gap là

$$\overline V - \underline V = 6.061 - 6.052 = 0.009,$$

tức trên notional $K=100$ là $0.009/100 = 0.9\ \text{bp}$. Giá thật bị **kẹp** trong khoảng $[6.052,\ 6.061]$: ta không chỉ có một con số ước lượng, mà có một cặp bound chứng minh sai số của chính engine dưới $1\,\text{bp}$. Đây chính là ý nghĩa "bằng số" của duality — nếu thay vào đó gap bung ra $50\,\text{bp}$ (chẳng hạn $\underline V = 6.00,\ \overline V = 6.50$), đó là tín hiệu đỏ rằng basis functions cần cải thiện, **không** phải rằng "MC vốn ồn". Một Bermudan swaption được implement tốt thường cho gap dưới vài basis point của notional; con số ấy là thước đo chất lượng engine, và desk nào chạy Bermudan mà không báo cáo cặp bound thì đang bay không đồng hồ. Trong `quantc`, engine dual này là `src/engines/bermudan-dual`.

## 12.3 PDE / Finite Differences — khi ít chiều nhưng cần optionality sạch

Khi bài toán có $\le$ 2–3 nhân tố nhưng đòi hỏi early exercise chính xác, Greeks trơn, hoặc điều kiện biên barrier sắc nét, PDE thắng MC tuyệt đối. Ý tưởng: BS-type PDE là một phương trình lùi — biết payoff tại $T$, ta giải ngược về giá hôm nay trên lưới $(S,t)$. Trong thực tế ta đổi biến $x = \ln S$ (làm hệ số PDE thành hằng, và lưới đều theo $x$ nghĩa là dày điểm ở spot thấp — hợp với lognormal), và dồn điểm lưới quanh strike/barrier nơi cong nhất.

Bốn sơ đồ theo thời gian, xếp theo độ tinh vi tăng dần:

**Explicit** rẻ mỗi bước — mỗi node mới tính trực tiếp từ ba node cũ — nhưng điều kiện ổn định khắc nghiệt: $\Delta t \lesssim (\Delta x)^2/\sigma^2$. Ra số cho thấy nó cay nghiệt đến đâu: với $\sigma=20\%$ và lưới $\Delta x = 0.01$, trần bước thời gian là $\Delta t \le 0.01^2/0.2^2 = 0.0025$, nghĩa là để phủ một năm cần **ít nhất 400 bước thời gian** dù độ chính xác không đòi hỏi thế. Tệ hơn, muốn lưới không gian mịn gấp đôi ($\Delta x = 0.005$) thì trần tụt xuống $0.000625$ — **1600 bước**, gấp bốn. Đó là quan hệ $\Delta t \sim (\Delta x)^2$: tinh chỉnh không gian phạt thời gian theo bậc hai, khiến explicit vừa chậm vừa mong manh.

**Implicit** (backward Euler) ổn định **vô điều kiện** — chọn $\Delta t$ tùy ý — nhưng mỗi bước phải giải một hệ tuyến tính. May thay hệ này **tridiagonal**, giải được bằng **Thomas algorithm** trong $O(n)$ (module `src/engines/pde/thomas`). Ổn định nhưng chỉ chính xác bậc 1 theo thời gian.

**Crank-Nicolson (CN)** là trung bình của explicit và implicit — chính xác **bậc 2** theo cả không gian lẫn thời gian, ổn định vô điều kiện, và là **mặc định của industry**. Dạng ma trận để implement: rời rạc hóa không gian biến PDE thành hệ ODE $\frac{dV}{dt} = MV$, với $M$ là ma trận tridiagonal chứa hệ số của $V_{i-1}, V_i, V_{i+1}$ đến từ sai phân trung tâm của số hạng khuếch tán và đối lưu. Một bước lùi CN là

$$\Big(I - \tfrac{\Delta t}{2}M\Big)V^{n} = \Big(I + \tfrac{\Delta t}{2}M\Big)V^{n+1},$$

giải bằng Thomas $O(n)$ mỗi bước. Để "ma trận" không chỉ là ký hiệu, hãy viết ra một hàng của $M$ bằng số. Sau khi đổi biến $x=\ln S$, PDE có dạng $\partial_t V + \tfrac12\sigma^2\partial_{xx}V + (r-\tfrac12\sigma^2)\partial_x V - rV = 0$. Với $\sigma=20\%$, số hạng khuếch tán $\tfrac12\sigma^2 = 0.02$; lấy sai phân trung tâm cho $\partial_{xx}$ với bước lưới $\Delta x$ cho ba hệ số $\big(\tfrac{0.02}{\Delta x^2},\ -\tfrac{2\times0.02}{\Delta x^2},\ \tfrac{0.02}{\Delta x^2}\big)$ trên $(V_{i-1},V_i,V_{i+1})$; với $\Delta x=0.01$ đó là $(200,\ -400,\ 200)$. Số hạng đối lưu $(r-\tfrac12\sigma^2)=0.03$ qua sai phân trung tâm $\partial_x \approx (V_{i+1}-V_{i-1})/(2\Delta x)$ cho $\pm 0.03/(2\times 0.01) = \pm 1.5$ trên hai node biên, và số hạng chiết khấu $-r=-0.05$ nằm trên đường chéo. Cộng lại, một hàng điển hình của $M$ đọc ra là

$$\big(\underbrace{200-1.5}_{V_{i-1}},\ \underbrace{-400-0.05}_{V_i},\ \underbrace{200+1.5}_{V_{i+1}}\big) = \big(198.5,\ -400.05,\ 201.5\big),$$

chính là bộ hệ số tridiagonal cụ thể mà Thomas algorithm nuốt mỗi bước. Ta đọc phương trình CN như: vế phải áp nửa bước explicit lên lời giải cũ $V^{n+1}$, vế trái áp nửa bước implicit để ra lời giải mới $V^n$ — sự đối xứng ấy chính là nguồn gốc độ chính xác bậc hai.

**Rannacher patch** là bản vá tinh tế mà thiếu nó CN sẽ tạo dao động giả. Vấn đề: payoff vanilla **gãy** tại strike (kink của $(S-K)^+$), và CN — vốn không tắt (damp) các mode tần số cao đủ mạnh — làm cái kink ấy dội thành sóng răng cưa trong gamma quanh strike, khiến Greeks trông xấu và hedge sai. Rannacher trị bằng cách chạy **vài bước implicit thuần** (thường 2–4 bước, mỗi bước chia đôi) ở **đầu** quá trình lùi — implicit tắt mode cao mạnh, làm nhẵn cái kink — rồi mới chuyển sang CN cho phần còn lại. Chi phí gần như bằng không, lợi ích là gamma sạch.

Lưới thực dụng cho vanilla/barrier một nhân tố: **300–500 điểm** không gian (log-spot, biên đặt ở $\pm 5$ độ lệch chuẩn để đuôi phân phối không bị cắt), **100–250 bước** thời gian, dồn điểm quanh strike/barrier. Kết quả điển hình: sai số giá cỡ $10^{-4}$, chạy **dưới mili-giây** — nhanh hơn MC nhiều bậc và cho Greeks đọc thẳng từ lưới miễn phí (delta là sai phân theo $x$ của hai node kề, gamma là sai phân bậc hai — không tốn thêm một lần pricing nào, tương phản gay gắt với chi phí bump trong MC).

Hai cạm bẫy thực chiến để lại làm bug kinh điển của junior:

**American trên lưới.** Tại mỗi bước lùi, sau khi giải hệ, áp ràng buộc $V = \max(V, \text{payoff})$ để phản ánh quyền exercise. Cách này (projected/explicit) đơn giản nhưng làm giảm order chính xác gần cái ranh giới free-boundary. Chuẩn hơn là **PSOR** (projected SOR) hoặc phương pháp **penalty** — giữ được order 2 bằng cách xử lý ràng buộc bất đẳng thức như một biến thiên nhẹ trong hệ tuyến tính. Module `src/engines/pde/psor`.

**Barrier phải trùng node.** Bug kinh điển thứ hai của junior — ngay sau day count — là đặt lưới mà barrier rơi **giữa** hai node. Khi đó điều kiện biên knock-out bị áp ở sai vị trí, và giá dao động theo chỗ barrier ngẫu nhiên nằm giữa hai node từ maturity này sang maturity khác — một nguồn noise vô hình mà không martingale test nào bắt được. Cách đúng: đặt một node **trùng khít** barrier (hoặc dùng lưới thích ứng để đảm bảo điều đó), khi ấy điều kiện biên áp đúng chỗ và giá mượt theo barrier.

Với **hai nhân tố** (Heston, HW2F, hoặc một quanto hai tài sản), ma trận không còn tridiagonal mà có cấu trúc băng rộng — giải trực tiếp thành $O(n^2)$ hoặc tệ hơn. Lời giải là **ADI (Alternating Direction Implicit)**: tách toán tử theo từng chiều, mỗi nửa-bước chỉ giải implicit theo **một** chiều (giữ chiều kia explicit), nên mỗi lần giải lại về tridiagonal $O(n)$. Các biến thể chuẩn là **Douglas**, **Craig-Sneyd**, và **Hundsdorfer-Verwer** — chúng khác nhau ở cách xử lý số hạng chéo (mixed derivative $\partial^2 V/\partial S\partial v$ trong Heston, đến từ correlation $\rho$), thứ ADI cơ bản không nuốt được và Craig-Sneyd/HV thêm bước hiệu chỉnh để giữ ổn định và order 2. Trong `quantc`: `src/engines/pde-2d`.

Tổng kết chọn engine như một rule of thumb desk: **PDE cho 1–2 factor cộng optionality (early exercise, barrier, Greeks trơn); MC cho mọi thứ còn lại** (nhiều chiều, path-dependence phức tạp, portfolio-level XVA). Ranh giới ba nhân tố là vùng xám nơi cả hai đều khả thi và lựa chọn phụ thuộc payoff cụ thể.

## 12.4 MLMC — trực giác của multilevel

Trước khi rời MC, một ý tưởng đáng có chỗ vì nó thay đổi cả cấu trúc chi phí: **Multilevel Monte Carlo (MLMC)** của Giles. Bài toán: một estimator MC chính xác cần cả nhiều **paths** (giảm variance) lẫn nhiều **bước thời gian** (giảm discretization bias). Chi phí là tích của hai — đắt gấp bội. MLMC hỏi: liệu ta có phải trả giá mịn cho mọi path?

Trực giác: viết đại lượng cần tính trên lưới mịn nhất $L$ như một **tổng khử chồng (telescoping)**:

$$\mathbb{E}[P_L] = \mathbb{E}[P_0] + \sum_{\ell=1}^{L}\mathbb{E}[P_\ell - P_{\ell-1}],$$

trong đó $P_\ell$ là payoff tính trên lưới cấp $\ell$ (mỗi cấp mịn gấp đôi cấp trước). Bây giờ mấu chốt: số hạng hiệu $P_\ell - P_{\ell-1}$ có **variance nhỏ** ở các cấp mịn (hai lưới liền kề cho payoff gần nhau khi mô phỏng bằng **cùng** đường Brownian), nên chỉ cần **ít** path để ước lượng chính xác các cấp mịn đắt tiền; còn cấp thô $P_0$ thì rẻ mỗi path nên cứ chạy thật nhiều. MLMC phân bổ path tối ưu qua các cấp — nhiều path ở cấp thô rẻ, ít path ở cấp mịn đắt.

Ra số để thấy độ lớn cú tăng tốc. Muốn đạt sai số tổng $\varepsilon = 10^{-3}$ bằng MC + Euler ngây thơ, chi phí bậc $O(\varepsilon^{-3}) = 10^9$ đơn vị công (một $\varepsilon^{-2}$ cho variance của path, nhân thêm một $\varepsilon^{-1}$ cho số bước thời gian cần để đè discretization bias xuống cùng cấp). MLMC hạ số mũ xuống $O(\varepsilon^{-2}) = 10^6$ — **giảm đúng $\varepsilon^{-1}=10^3$ lần** công tính, tức ba bậc độ lớn cho $\varepsilon$ này. Cả cú nhảy ấy đến từ một phép biến đổi đại số telescoping không tốn một giả định model nào. Với các bài path-dependent trong rates và XVA, đó là chênh lệch giữa "chạy được trong ngày" và "không khả thi". Module `src/numerics/mlmc`.

## 12.5 AAD — cuộc cách mạng Greeks

Nếu phải chọn **một** kỹ thuật numerics của mười lăm năm qua đã đổi cấu trúc kinh tế của một desk, đó là **Adjoint Algorithmic Differentiation**. Nó cho đạo hàm chính xác đến machine precision của **mọi** output theo **mọi** input, bằng cách chạy ngược computation graph — với chi phí **chỉ khoảng 3–5 lần một lần pricing, bất kể số lượng input**. Con số "bất kể số lượng input" là điều làm nó thần kỳ, và nó không phải phép màu mà là một định lý: **Baur-Strassen** bảo đảm gradient của một hàm vô hướng tính được với chi phí cùng bậc với hàm đó.

Đặt cạnh bump-and-reprice, sự tương phản gay gắt đến mức thay đổi cả cách vận hành. Một portfolio swap cần 500 curve risk: bump = 501 lần price (một base + 500 bump). AAD = ~4 lần price, cho **toàn bộ** 500 sensitivity trong một lượt. Với XVA — nơi số sensitivity lên tới hàng triệu — AAD là khác biệt giữa "chạy qua đêm trên grid nghìn core" và "một giờ trên một máy". Đây không phải tối ưu biên; nó là điều kiện để tính XVA risk kịp trong ngày.

### 12.5.1 AAD chạy tay trên một biểu thức

Cách hiểu AAD tận gốc là làm nó bằng tay một lần trên biểu thức đủ nhỏ. Lấy

$$f(x,y) = e^{xy} + \sin x \quad\text{tại}\quad x=1,\ y=2.$$

**Forward pass** — chạy xuôi, tính giá trị và ghi lại từng phép toán trung gian lên một **tape**:

$$u = xy = 2,\qquad v = e^u = 7.389,\qquad w = \sin x = 0.841,\qquad f = v + w = 8.231.$$

**Reverse pass** — chạy ngược tape, mang theo **adjoint** $\bar z = \partial f/\partial z$ của từng node; mỗi node áp một quy tắc chain rule cục bộ, đẩy adjoint ngược về các input của nó:

| Node | Quy tắc | Adjoint |
|---|---|---|
| $f$ | seed | $\bar f = 1$ |
| $v, w$ | tổng → truyền nguyên | $\bar v = 1,\ \bar w = 1$ |
| $u$ | $\bar u = \bar v \cdot e^u$ | $7.389$ |
| $y$ | $\bar y = \bar u \cdot x$ | $\mathbf{7.389}$ |
| $x$ | $\bar x = \bar u \cdot y + \bar w \cos x$ | $14.778 + 0.540 = \mathbf{15.318}$ |

Kiểm bằng giải tích tay: $\partial f/\partial x = y e^{xy} + \cos x = 2\cdot 7.389 + 0.540 = 15.318$ ✓; $\partial f/\partial y = x e^{xy} = 1\cdot 7.389 = 7.389$ ✓. Chú ý điều then chốt: **một** lần chạy ngược cho ra **cả hai** đạo hàm cùng lúc. Node $x$ nhận đóng góp adjoint từ **hai** đường — qua $u$ (nhánh $e^{xy}$) và qua $w$ (nhánh $\sin x$) — và ta **cộng** chúng lại; đây chính là cơ chế accumulation làm nên toàn bộ AAD (module `src/aad/accumulator`, `src/aad/reverse`).

Bây giờ thay $x, y$ bằng 500 điểm curve cộng 200 điểm vol surface, thay $f$ bằng NPV của một portfolio. Nguyên lý **y hệt** — một reverse pass cho ra cả 700 sensitivity. Phần "phép màu" chỉ là năm dòng bảng trên; phần còn lại thuần là engineering: quản lý một tape ghi hàng tỷ phép toán và chạy nó ngược cho hiệu quả bộ nhớ.

### 12.5.2 Second-order và cost của Hessian

Delta và vega là first-order; nhưng gamma, và cross-gamma giữa các risk factor, là **second-order** — các phần tử của Hessian. Ngây thơ, một Hessian $n\times n$ có $O(n^2)$ phần tử, và bump nó cần $O(n^2)$ lần price — bất khả với $n$ lớn. Hãy ra số với chính portfolio 700 risk factor ở trên ($n=700$). Hessian đối xứng có $n(n+1)/2 = 700\times 701/2 = 245{.}350$ phần tử độc lập; lấy mỗi cross-gamma bằng sai phân trung tâm cần bốn lần reprice, mỗi diagonal-gamma hai lần, tổng cộng cỡ

$$\frac{n(n-1)}{2}\times 4 + n\times 2 = 244{.}650\times 4 + 1400 \approx 980{.}000 \text{ lần price.}$$

Gần một triệu lần price cho **một** Hessian — chạy qua đêm cũng không kịp. AAD bậc hai (forward-over-reverse: chạy một reverse pass mà bản thân nó được vi phân thêm một lần theo forward mode) cho **một cột** của Hessian — tức gradient của một first-order sensitivity — với chi phí cỡ một AAD bậc một ($\sim 4$ lần price). Lấy trọn Hessian vẫn cần $n$ cột, tức $700\times 4 = 2800$ lần price — đã rẻ hơn bump $980{.}000/2800 = 350$ lần. Nhưng điểm thực dụng là: ta hầu như không bao giờ cần **trọn** Hessian. Với vanilla book, cross-gamma trọng yếu chỉ là một nhúm (gamma theo spot, một vài cross giữa các bucket kỳ hạn kề nhau) — nói $5$ cột — và AAD cho chúng với $5\times 4 = 20$ lần price, so với $980{.}000$ của bump. Đó là khác biệt giữa "tính được cross-gamma trong ngày" và "đừng mơ". Module `src/aad/second-order`.

### 12.5.3 Checkpointing — mua thời gian bằng bộ nhớ, mua bộ nhớ bằng thời gian

Tử huyệt của AAD là **bộ nhớ tape**: để chạy reverse, ta phải lưu mọi giá trị trung gian của forward pass. Ra số cho một MC điển hình: $100{.}000$ paths $\times$ $250$ bước $= 25$ triệu node thời-gian, và mỗi bước một path còn ghi vài giá trị trung gian (state, drift, vol, payoff-accumulator...) — nói $8$ số `double` mỗi bước. Tape đầy đủ giữ đồng thời do đó cần

$$25{.}000{.}000 \times 8 \times 8\ \text{byte} = 1{.}6\ \text{GB},$$

và đó mới chỉ là một biến trạng thái; với model đa-nhân-tố con số dễ dàng vượt RAM một máy. **Checkpointing** là sự đánh đổi kinh điển: thay vì lưu **toàn bộ** tape dọc trục thời gian, chỉ lưu các "checkpoint" thưa — với $250$ bước, lưu $\sqrt{250}\approx 16$ checkpoint thay vì cả $250$ — rồi khi reverse pass cần đoạn tape giữa hai checkpoint, **tính lại xuôi** đoạn đó từ checkpoint gần nhất. Bộ nhớ tape tụt từ $O(N)$ xuống $O(\sqrt N)$: trong ví dụ trên, $1.6$ GB thành cỡ $0.1$ GB — giảm khoảng $16$ lần, đủ để một AAD-MC "vừa RAM" (đó chính xác là ý nghĩa bằng số của cụm "vừa RAM"). Cái giá là tính lại đoạn tape một lần nữa — thêm khoảng một lần forward compute. Với path-based pricing, đây là điều kiện thực thi chứ không phải tối ưu chọn thêm. Module `src/aad/checkpoint`, `src/aad/checkpoint-path`.

### 12.5.4 Cách hiện thực và cái giá kiến trúc

Ba con đường hiện thực AAD. **Operator overloading trên tape** — nạp chồng các toán tử số học để mỗi phép toán tự ghi node lên tape, rồi một hàm riêng chạy tape ngược — là cách của `src/aad` và của đa số thư viện production vì nó ít xâm lấn code định giá nhất. **Source transformation** — một công cụ đọc code nguồn và sinh ra code tính adjoint — nhanh hơn nhưng cồng kềnh về tooling. Con đường mới nhất là dùng **framework tensor** (JAX, PyTorch): viết pricing như một đồ thị tính toán và để autodiff của framework lo phần adjoint — đúng tinh thần "pricing như một neural net", và là cầu nối tự nhiên sang tầng proxy máy học ở 12.7.

Cái giá phải trả là thật và phải nuốt từ ngày đầu. Ngoài bộ nhớ tape (đã trị bằng checkpointing), còn hai điều. Thứ nhất, **code không được có bất liên tục**: một payoff digital với bậc thang cho adjoint là 0 hầu khắp nơi và vô định tại kink — vô dụng cho hedge; phải **smoothing** payoff (thay bậc thang bằng một sigmoid hẹp) để adjoint có nghĩa, đúng như LR đã xử ở 12.1.5 nhưng nay là ràng buộc lên toàn library. Thứ hai, và nặng nhất, **toàn bộ library phải viết generic trên kiểu số** — mọi hàm định giá phải chạy được cả trên `double` lẫn trên kiểu AAD-number ghi tape. Đây là một quyết định kiến trúc phải làm từ dòng code đầu tiên; gần như không thể retrofit AAD vào một library đã viết cứng theo `double`. Tài liệu chuẩn để đi sâu là Savine, *Modern Computational Finance* (2018).

## 12.6 Calibration — nghi thức trung tâm của Q

Nếu pricing engine là cỗ máy, calibration là nghi thức khởi động nó mỗi sáng. Toàn bộ triết lý Q gói trong một bài toán ngược: tìm tham số model $\theta$ sao cho giá model khớp giá thị trường của các instrument thanh khoản (vanilla), để rồi dùng model đã hiệu chỉnh ấy định giá exotic. Về hình thức:

$$\min_\theta \sum_i w_i\Big(V_i^{\text{model}}(\theta) - V_i^{\text{mkt}}\Big)^2 + \lambda\,\text{Reg}(\theta).$$

Mỗi thành phần của công thức này chứa cả một bài học nghề.

**Trọng số $w_i$** không bao giờ để bằng nhau một cách ngây thơ. Chuẩn là **weight theo vega** — khớp implied vol thay vì khớp giá — vì một sai lệch giá cố định ở một option low-vega tương ứng vol lệch lớn (điều trader thực sự nhìn), còn ở high-vega thì vol lệch nhỏ. Ra số cho cụ thể: với call ATM chuẩn ($S_0=K=100,\sigma=20\%,T=1$) vega $\approx 37.5$ trên một đơn vị vol (tức $0.375$ cho mỗi vol-point), nên một sai lệch giá $0.10$ tương đương chỉ $0.10/37.5 \approx 0.27$ vol-point. Nhưng một deep-OTM 3M có vega chỉ cỡ $5$; cùng sai lệch giá $0.10$ ở đó là $0.10/5 = 2$ vol-point — gấp bảy lần độ lệch vol mà trader cảm nhận. Nếu weight bằng giá, optimizer sẽ dồn công sức khớp cái option low-vega ít ai giao dịch và bỏ mặc vol-point ở nơi quan trọng; weight $w_i \propto (\partial V_i/\partial\sigma)^{-2}$ (tức khớp trên trục vol) sửa đúng méo đó. Ngoài ra weight theo bid-ask (khớp chặt nơi spread hẹp, lỏng nơi spread rộng) và theo thanh khoản (đừng cố khớp một quote cũ, mỏng).

**Optimizer.** Ngựa thồ là **Levenberg-Marquardt (LM)** — và đây là chỗ mở rộng đáng dừng lại, vì hiểu LM là hiểu tại sao nó thắng. LM nội suy giữa hai phương pháp: **Gauss-Newton** (nhanh, dùng xấp xỉ Hessian $J^\top J$ từ Jacobian của residual, hội tụ bậc hai gần nghiệm) và **gradient descent** (chậm nhưng bền, không bao giờ đi sai hướng). Bước LM giải hệ

$$\big(J^\top J + \mu\, \mathrm{diag}(J^\top J)\big)\,\delta\theta = -J^\top r,$$

với $r$ là vector residual, $J$ là Jacobian $\partial V^{\text{model}}/\partial\theta$, và $\mu$ là **damping** điều tiết.

Chạy tay một bước LM tối giản để thấy damping làm gì bằng số. Giả sử ta fit **một** tham số $\theta$ vào một model đồ chơi $f(\theta)=\theta^2$ với giá mục tiêu $V^{\text{mkt}}=4$ (nghiệm thật $\theta=2$), khởi từ $\theta_0=1$. Khi đó residual $r = f(\theta)-4 = 1-4 = -3$, Jacobian $J = f'(\theta) = 2\theta = 2$, nên $J^\top J = 4$ và $-J^\top r = -2\times(-3) = 6$.

- **$\mu=0$ (Gauss-Newton thuần):** $\delta\theta = 6/(4+0) = 1.5$, đưa $\theta$ nhảy thẳng lên $2.5$ — một **bước dài**, gần như tới nghiệm $2$ trong một nhịp.
- **$\mu=0.01$ (damping nhỏ):** $\delta\theta = 6/(4 + 0.01\times4) = 6/4.04 = 1.485$ — gần như y hệt Gauss-Newton, bước dài, tin cậy vào Hessian.
- **$\mu=10$ (damping lớn):** $\delta\theta = 6/(4 + 10\times4) = 6/44 = 0.136$ — một **bước ngắn**, dè dặt, chính là chế độ gradient-descent an toàn khi ta chưa tin vào Hessian.

Con số $1.5 \to 1.485 \to 0.136$ cho thấy đúng một điều: $\mu$ là núm vặn liên tục biến LM từ Gauss-Newton bước-dài sang gradient-descent bước-ngắn. Chiến lược thích ứng: sau mỗi bước, nếu residual giảm thì tăng lòng tin (giảm $\mu$, tiến về Gauss-Newton bước dài); nếu residual tăng thì rút lui (tăng $\mu$, ngắn bước lại) và thử lại. Chính vòng thích ứng này khiến LM vừa nhanh gần nghiệm vừa không bao giờ nổ tung ở xa — lý do nó là default cho mọi least-squares fit trơn. Và đây là mối nối đẹp về AAD: Jacobian $J$ cần tại mỗi iteration chính là thứ AAD tính rẻ nhất — một calibration LM tăng tốc bằng AAD-Jacobian là mô thức chuẩn production (`src/engines/aad-calibration`).

Khi mặt mục tiêu **nhiều cực trị**, LM (vốn local) mắc kẹt, và ta cần một global optimizer để tìm vùng chứa nghiệm tốt trước khi LM tinh chỉnh. **Differential evolution** — một thuật toán tiến hóa quần thể, không cần gradient — là lựa chọn phổ biến (`src/numerics/optimization/differential-evolution`). Heston nổi tiếng cần điều này vì mặt mục tiêu của nó lồi lõm hiểm ác.

**Ill-posedness là thường trực, không phải ngoại lệ.** Đây là sự thật khó chịu nhất của calibration: thường có **nhiều** bộ $\theta$ khớp giá vanilla gần như nhau nhưng cho giá **exotic khác nhau**. Heston là ví dụ giáo khoa — $\kappa$ (tốc độ mean-reversion) và $\xi$ (vol-of-vol) gần như đổi chỗ được cho nhau dọc theo một "**parameter ridge**": tăng $\kappa$ và giảm $\xi$ theo tỉ lệ đúng cho ra mặt vol gần trùng khít. Optimizer thả lỏng sẽ dừng ở một điểm **bất kỳ** trên ridge — hôm nay điểm này, mai điểm kia — và dù cả hai đều "khớp", chúng cho giá barrier hay forward-start khác nhau, và tệ hơn, cho **hedge ratios nhảy loạn** mỗi ngày. Thuốc chữa gồm ba vị: **regularization** (thêm $\lambda\,\text{Reg}(\theta)$ — dạng ridge $\lambda\|\theta-\theta_{\text{prior}}\|^2$ kéo nghiệm về một điểm ưa thích, làm bài toán ill-posed thành well-posed), **tham số hóa tiết kiệm**, và **đóng đinh vài tham số** (SABR $\beta$ thường cố định theo asset class thay vì fit, vì nó gần không nhận dạng được từ smile).

**Ổn định ngày-qua-ngày quan trọng ngang độ khớp.** Điều junior hay bỏ sót: một calibration khớp hoàn hảo hôm nay nhưng cho tham số nhảy vọt so với hôm qua là một calibration **tồi**, vì tham số nhảy → Greeks nhảy → hedge phải điều chỉnh → chi phí giao dịch **thật** đổ lên P&L. Chuẩn production là thêm một penalty kéo tham số về giá trị **hôm qua**: $\lambda_t\|\theta_t - \theta_{t-1}\|^2$. Nó hy sinh một chút độ khớp để mua sự mượt mà theo thời gian — và trên bảng cân đối, sự mượt ấy rẻ hơn nhiều so với churn hedging.

### 12.6.1 Recipe calibrate Heston 5 bước — thứ tự có ý nghĩa

Thay vì thả cả năm tham số Heston $(v_0, \bar v, \kappa, \rho, \xi)$ cho optimizer "toàn cục" cầu may — cách gần như chắc chắn rơi vào một điểm vô nghĩa trên ridge — desk làm theo một recipe khai thác việc **mỗi tham số chi phối một đặc trưng riêng** của mặt vol. Để recipe "ra số", ta neo nó vào một mặt vol equity điển hình: ATM 1M $=22\%$, ATM hội tụ về $\approx 20\%$ ở đầu dài (5Y–10Y), skew âm.

1. **$v_0$** (variance khởi điểm) chốt từ vol **ngắn hạn nhất**: $v_0 \approx \sigma^2_{\text{ATM},1M}$. Với ATM 1M $=22\%$, đó là $v_0 \approx 0.22^2 = 0.0484$. Vol 1 tháng ATM gần như hoàn toàn do variance hiện tại quyết định, mean-reversion chưa kịp tác động.
2. **$\bar v$** (variance dài hạn) từ vol **dài hạn**: mặt vol ở maturity dài hội tụ về $\sqrt{\bar v}$, nên đọc $\bar v$ từ ATM vol 5Y–10Y. Với đầu dài hội tụ về $20\%$, ta lấy $\bar v \approx 0.20^2 = 0.04$ (tức $\sqrt{\bar v}=20\%$).
3. **$\kappa$** (tốc độ mean-reversion) từ **tốc độ chuyển tiếp** của ATM term structure — vol đi từ $22\%$ (1M) về $20\%$ (10Y) nhanh hay chậm. Nhớ ridge $\kappa$–$\xi$: thường **cố định** $\kappa \in [1,3]$ thay vì fit, để cắt đứt sự đổi chỗ.
4. **$\rho$** (correlation spot-vol) từ **skew**: $\rho<0$ nghiêng smile sang trái (put đắt hơn call) — độ nghiêng ATM cho $\rho$ trực tiếp; với skew equity điển hình $\rho$ thường rơi vào vùng $-0.7$ đến $-0.5$.
5. **$\xi$** (vol-of-vol) từ **độ cong** (convexity) của smile — cánh smile cong bao nhiêu là do $\xi$.

Khởi tạo bằng năm ước lượng "có nghĩa kinh tế" đó — cụ thể ở đây $v_0\approx 0.0484,\ \bar v\approx 0.04,\ \kappa\approx 2,\ \rho\approx -0.6$, và một $\xi$ khởi $\approx 0.4$ đọc từ convexity — **rồi mới** chạy LM tinh chỉnh chung. Kết quả: hội tụ trong **chục iteration** thay vì hàng nghìn, và — quan trọng hơn — tham số ra là một điểm **có nghĩa** trên bề mặt, không phải một điểm ngẫu nhiên trên ridge. Đây là sự khác biệt giữa "khớp được số" và "hiểu mình đang khớp gì". Module `src/calibration/heston-calibration`.

### 12.6.2 Kiến trúc calibration trong production

Nghi thức hằng ngày: calibrate mỗi sáng (và intraday khi thị trường động mạnh) → **đóng băng** bộ tham số cùng market data thành một **pricing context có version** → mọi pricing và risk trong ngày dùng **đúng** context đó → audit trail đầy đủ, tái tạo được từng con số. Việc đóng băng này không phải quan liêu: nó đảm bảo hai trader định giá cùng một deal lúc 10h và 15h dùng cùng model state, và khi kiểm toán hỏi "vì sao con số này", ta trỏ được về đúng context đã version. Đây chính là lý do kiến trúc `quantc` tách bạch `src/marketdata` (dữ liệu thô + curve/surface), `src/calibration` (fit ra $\theta$), và `src/models` (dùng $\theta$ để định giá) — ba trách nhiệm, ba tầng, một đường version rõ ràng.

## 12.7 Tie: proxy, và bức tranh engine hợp nhất

Bốn họ engine không sống tách rời; chúng khớp vào một chuỗi. Calibration gọi pricing engine hàng chục lần mỗi iteration; AAD tăng tốc cả pricing lẫn calibration bằng cách cấp Jacobian rẻ; MC và PDE là hai đầu của một trục đánh đổi chiều–optionality. Và trên đỉnh chuỗi ấy, khi cả AAD-MC vẫn quá chậm cho một tác vụ lặp triệu lần — như tính CVA trên hàng nghìn kịch bản trong một VaR simulation lồng — ngành dựng thêm một tầng **proxy**: học một hàm xấp xỉ nhanh của pricing map.

Ba hướng proxy đáng biết. **Differential machine learning** (Huge-Savine) huấn luyện một mạng không chỉ khớp giá mà còn khớp **các adjoint** (Greeks từ AAD) — nhét đạo hàm vào loss làm mạng học đúng độ dốc chứ không chỉ đúng điểm, cho xấp xỉ chính xác hơn nhiều với cùng số mẫu; đây là nơi AAD và máy học giao nhau đẹp nhất (`src/proxy/differential-ml`). **Chebyshev interpolation** dựng một lưới Chebyshev trên không gian tham số và nội suy đa thức — cực chính xác và có bound sai số giải tích cho pricing map trơn theo ít biến (`src/proxy/chebyshev`). **MLP** thuần là mạng nơ-ron tổng quát cho map nhiều chiều hơn (`src/proxy/mlp`). Điểm chung: chi trước một lần chi phí offline (chạy engine đắt sinh dữ liệu huấn luyện) để đổi lấy đánh giá online gần-tức-thời — đúng logic amortization mà XVA và regulatory capital, với hàng triệu lần gọi lại, đòi hỏi.

Bức tranh hợp nhất, để một junior mang theo: **MC** đưa ta vào chiều cao; **PDE** cho optionality sạch ở chiều thấp; **LSM cộng dual bounds** thuần hóa early exercise trong MC và đo được sai số của chính nó (nhớ cặp bound $[6.052, 6.061]$, gap $0.9\,\text{bp}$); **AAD** biến Greeks từ nút thắt cổ chai thành hàng miễn phí; **calibration** neo tất cả vào giá thị trường; và **proxy** amortize những gì còn quá đắt. Model là SDE trên giấy — nhưng chính năm cỗ máy này mới là nơi một desk quant thực sự kiếm sống.

# Chương 13: Credit

Cho tới chương này, mọi thứ chúng ta định giá đều ngầm giả định một điều: đối tác trả tiền. Call option đáo hạn in-the-money thì bên bán trả đủ; swap có MTM dương thì bên kia thanh toán; zero-coupon bond đáo hạn thì nhận đúng mệnh giá. Credit là chương phá vỡ giả định đó. Một credit derivative là công cụ mà payoff phụ thuộc trực tiếp vào **sự kiện vỡ nợ** (default) — thời điểm nó xảy ra, và bao nhiêu tiền còn thu hồi được sau đó. Đây không phải một ngóc ngách kỳ dị của thị trường: nó là nền móng của toàn bộ định giá trái phiếu doanh nghiệp, của thị trường CDS trị giá hàng nghìn tỷ, và là bệ phóng trực tiếp cho CVA — chương 14. Nói cách khác, không hiểu credit thì không hiểu vì sao một dòng tiền tương lai lại đáng giá ít hơn discount factor phi rủi ro nói.

Chương này có hai trục xương sống mà ta sẽ đan vào nhau. Trục thứ nhất là **cách model default**: có hai trường phái lớn — reduced-form (default là một cú nhảy bất ngờ, calibrate thẳng vào giá thị trường) và structural (default có nguyên nhân kinh tế, bắt nguồn từ bảng cân đối kế toán của công ty). Trục thứ hai là **cách default nhiều tên tương quan với nhau** — bài toán correlation dẫn thẳng tới CDO, tới copula Gaussian, và tới một trong những bài học model risk đắt giá nhất lịch sử nghề. Ta bắt đầu từ một cái tên, rồi mở dần ra cả danh mục.

## 13.1 Hazard rate — cách model default chuẩn industry

Vì sao mục này tồn tại trước tất cả: bởi vì để định giá bất cứ thứ gì nhạy tín dụng, ta cần một hàm số duy nhất — xác suất tên này còn sống tới thời điểm $t$. Toàn bộ pricing credit là biến thể quanh đại lượng đó.

**Reduced-form (intensity) model** nhìn default như một cú nhảy Poisson bất ngờ. Không có nguyên nhân lộ ra trước; tại mỗi khoảnh khắc, có một xác suất có điều kiện nhỏ để "cú sét" giáng xuống, và cường độ của nó là **hazard rate** $\lambda_t$. Trực giác chặt chẽ hơn: nếu tên còn sống tới $t$, thì xác suất nó default trong khoảng $[t, t+dt]$ đúng bằng $\lambda_t\, dt$. Đây chính là định nghĩa của một quá trình đếm với intensity $\lambda_t$.

Từ định nghĩa vi phân đó ta dẫn ra hàm sống sót (survival function). Gọi $Q(\tau > t)$ là xác suất thời điểm default $\tau$ vượt quá $t$. Xác suất sống sót thêm một khoảng $dt$ nữa, với điều kiện đã sống tới $t$, là $(1 - \lambda_t\, dt)$. Vậy

$$Q(\tau > t + dt) = Q(\tau > t)\,(1 - \lambda_t\, dt).$$

Chuyển vế và cho $dt \to 0$:

$$\frac{dQ(\tau > t)}{dt} = -\lambda_t\, Q(\tau > t).$$

Đây là một phương trình vi phân tuyến tính bậc nhất, nghiệm của nó là hàm mũ tích phân — chính là công thức xương sống của toàn bộ credit reduced-form:

$$\boxed{\,Q(\tau > T) = \exp\left(-\int_0^T \lambda_s\, ds\right).\,}$$

Đọc con số cho có hồn: $\lambda = 200\text{bp} = 2\%$ nghĩa là mỗi năm, xác suất vỡ nợ có điều kiện xấp xỉ 2% — với điều kiện tên còn sống tới đầu năm đó. Chú ý "có điều kiện": survival cứ bào mòn dần, nên xác suất default **vô điều kiện** trong năm thứ mười nhỏ hơn năm đầu, vì phần lớn khả năng đã "dùng hết" ở các năm trước.

**Ví dụ số nền tảng — running example của cả chương.** Lấy $\lambda = 2\%$ phẳng. Xác suất sống sót 5 năm:

$$Q(\tau > 5) = e^{-0.02 \times 5} = e^{-0.10} = 90.48\%.$$

Vậy xác suất default trong 5 năm $\approx 1 - 0.9048 = 9.52\%$. Giữ chặt con số 90.48% này — nó sẽ tái xuất ở CDS, ở bootstrap, và ở copula.

Bây giờ nối hazard rate với **giá**, để thấy vì sao tín dụng "trừ điểm" khỏi discount factor. Xét một zero-coupon bond 5 năm của chính tên này: recovery 40%, curve rate phi rủi ro phẳng 4%. Nếu tên sống sót (xác suất 90.48%), nhà đầu tư nhận mệnh giá 1; nếu default (xác suất 9.52%), nhận lại phần thu hồi $R = 0.4$. Kỳ vọng payoff, chiết khấu về hiện tại:

$$P_{\text{risky}}(0,5) = e^{-0.04 \times 5}\big[\,Q(\tau>5) \times 1 + (1 - Q(\tau>5)) \times R\,\big] = e^{-0.20}\big[0.9048 + 0.0952 \times 0.4\big].$$

Tính từng bước: $0.9048 + 0.0381 = 0.9429$; nhân $e^{-0.20} = 0.8187$ ra $P_{\text{risky}} = 0.772$. So với bond phi rủi ro cùng kỳ hạn giá $0.8187$, thị trường "trừ" $0.8187 - 0.772 = 0.047$, tức 4.7 điểm giá, cho rủi ro tín dụng. Quy đổi ra yield spread: bond risky có yield $y$ thoả $e^{-5y} = 0.772/1$... nhưng để so sánh sạch với phi rủi ro, ta tính phần spread cộng thêm trên rate, $-\frac{1}{5}\ln(0.772/0.8187) = 117.6\text{bp}$ mỗi năm.

Con số 117.6bp này gần như trùng khít với một công thức nhớ lòng bàn tay: **credit spread $\approx \lambda \times (1 - R)$**. Kiểm: $2\% \times (1 - 0.4) = 2\% \times 0.6 = 120\text{bp}$. Sai lệch nhỏ (117.6 so với 120) đến từ hiệu ứng chiết khấu bậc hai và recovery được trả tại thời điểm default chứ không phải cuối kỳ — nhưng bậc nhất thì công thức tam giác này là chân lý. Đây là vòng tròn khép kín cần khắc cốt: **spread quan sát $\Longleftrightarrow$ hazard rate $\Longleftrightarrow$ giá bond** — ba cách nói cùng một điều. Nhìn thấy bond giao dịch ở spread 120bp trên màn hình, quant tự động dịch ra $\lambda \approx 2\%$ trong đầu, và ngược lại.

**Recovery rate $R$** là tỷ lệ thu hồi khi vỡ nợ — quy ước thị trường 40% cho senior unsecured debt. Cần nói thẳng một pitfall: đây là một *quy ước*, không phải một sự thật đo được. Recovery thực tế của một vụ default cụ thể có thể là 10% (một công ty công nghệ chẳng còn tài sản hữu hình) hoặc 70% (một tiện ích công cộng có tài sản cứng). Recovery risk là rủi ro thật, nhưng trong pricing hằng ngày nó bị "đóng đinh" ở 40% vì spread và recovery không tách rời được từ một quote CDS duy nhất — cả hai cùng nhân vào $(1-R)$ trong protection leg. Muốn tách chúng cần thị trường **recovery swap** hoặc **fixed-recovery CDS**, vốn mỏng. Loss given default $\text{LGD} = 1 - R = 60\%$.

## 13.2 Structural model — Merton và distance-to-default

Reduced-form model coi default là cú sét từ trời: đẹp để calibrate, nhưng vô tình về nguyên nhân. Structural model của Robert Merton (1974) đi con đường ngược lại — nó *giải thích* vì sao công ty vỡ nợ, và bằng một ý tưởng đẹp đến kinh ngạc: **equity của một công ty vay nợ chính là một call option viết trên giá trị tài sản của công ty đó.**

Ý tưởng như sau. Gọi $V_t$ là tổng giá trị tài sản (asset value) của công ty — nhà xưởng, thương hiệu, dòng tiền tương lai, tất cả gộp lại. Công ty phát hành một khoản nợ zero-coupon mệnh giá $D$ đáo hạn tại $T$. Tại $T$, cổ đông (equity holders) là bên có quyền nhưng không nghĩa vụ: nếu tài sản đủ trả nợ ($V_T > D$), họ trả $D$ cho chủ nợ và giữ phần dư $V_T - D$; nếu tài sản không đủ ($V_T < D$), họ tuyên bố phá sản, giao toàn bộ tài sản cho chủ nợ và bỏ đi tay trắng vì trách nhiệm hữu hạn (limited liability). Payoff của cổ đông tại $T$ vì thế đúng bằng

$$E_T = \max(V_T - D,\, 0).$$

Đó chính xác là payoff của một European call với underlying $V_T$ và strike $D$. Nếu ta giả định $V_t$ đi theo geometric Brownian motion dưới measure risk-neutral,

$$dV_t = r V_t\, dt + \sigma_V V_t\, dW_t,$$

thì Black-Scholes cho ta ngay giá trị equity hôm nay:

$$E_0 = V_0\, N(d_1) - D\, e^{-rT}\, N(d_2), \qquad d_{1,2} = \frac{\ln(V_0/D) + (r \pm \tfrac{1}{2}\sigma_V^2)T}{\sigma_V \sqrt{T}}.$$

Đây là một trong những cầu nối đẹp nhất giữa equity và credit: hai thị trường tưởng như tách biệt hoá ra là hai claim trên cùng một underlying $V_t$. Chủ nợ (debt holders) nắm phần bù: họ sở hữu tài sản trừ đi call của cổ đông, tức debt hôm nay $= V_0 - E_0$. Tương đương, chủ nợ đang nắm một bond phi rủi ro trừ đi một put — họ đã *bán* một put trên tài sản cho cổ đông (bán quyền "dí" tài sản kém giá trị lại cho họ khi default). Credit risk = short a put. Ý này sẽ vọng lại suốt phần còn lại của nghề.

**Ví dụ số Merton đầy đủ.** Một công ty có $V_0 = 100$ (giá trị tài sản), nợ zero-coupon mệnh giá $D = 80$ đáo hạn 1 năm, asset volatility $\sigma_V = 25\%$, rate $r = 5\%$. Tính từng bước:

$$d_1 = \frac{\ln(100/80) + (0.05 + \tfrac{1}{2} \times 0.25^2) \times 1}{0.25 \times \sqrt{1}} = \frac{0.2231 + 0.0813}{0.25} = \frac{0.3044}{0.25} = 1.218,$$
$$d_2 = d_1 - \sigma_V\sqrt{T} = 1.218 - 0.25 = 0.968.$$

Tra $N(d_1) = N(1.218) = 0.8884$, $N(d_2) = N(0.968) = 0.8334$. Giá trị equity:

$$E_0 = 100 \times 0.8884 - 80\, e^{-0.05} \times 0.8334 = 88.84 - 76.098 \times 0.8334 = 88.84 - 63.43 = 25.41.$$

Giá trị debt hôm nay $= V_0 - E_0 = 100 - 25.41 = 74.59$. Nếu khoản nợ này phi rủi ro, nó đáng $80\, e^{-0.05} = 76.10$. Chênh lệch $76.10 - 74.59 = 1.51$ chính là giá trị của credit risk — cái mà chủ nợ mất vì công ty *có thể* default. Quy đổi ra credit spread: yield của debt risky là $-\frac{1}{T}\ln(74.59/80) = 6.98\%$ so với $5\%$ phi rủi ro, tức **spread $\approx 200\text{bp}$**. Merton vừa tự sinh ra một credit spread từ hư không — chỉ cần bảng cân đối kế toán và vol tài sản.

**Xác suất default và distance-to-default.** Trong thế giới Merton, default là biến cố $V_T < D$. Dưới measure risk-neutral, xác suất đó là

$$\text{PD}^{\mathbb{Q}} = \mathbb{Q}(V_T < D) = N(-d_2).$$

Với ví dụ trên, $\text{PD}^{\mathbb{Q}} = N(-0.968) = 16.66\%$ — xác suất default 1 năm dưới measure định giá. Nhưng $d_2$ tự nó có một ý nghĩa kinh tế đẹp đến mức industry đặt cho nó cái tên riêng: **distance-to-default (DD)**. Nó đo tài sản hiện đang cách ngưỡng vỡ nợ bao nhiêu *độ lệch chuẩn*. Viết lại $d_2$:

$$\text{DD} = \frac{\ln(V_0/D) + (\mu - \tfrac{1}{2}\sigma_V^2)T}{\sigma_V\sqrt{T}},$$

trong đó — chú ý điểm mấu chốt — để đo PD **thực** (real-world, dùng cho rating/risk management, không phải pricing) ta thay drift risk-neutral $r$ bằng drift thực $\mu$ (kỳ vọng tăng trưởng tài sản thật, ví dụ 8%). Đây chính là chỗ P-world và Q-world tách đôi trên cùng một mô hình: cùng công thức, khác measure, khác drift. Với $\mu = 8\%$:

$$\text{DD} = \frac{0.2231 + (0.08 - 0.03125) \times 1}{0.25} = \frac{0.2231 + 0.04875}{0.25} = \frac{0.2719}{0.25} = 1.088.$$

Xác suất default thực $= N(-1.088) = 13.84\%$. Đây đúng là cỗ máy đằng sau mô hình **KMV/Moody's**: lấy DD từ dữ liệu equity market (vì $V_0$ và $\sigma_V$ không quan sát trực tiếp — chỉ có giá cổ phiếu và equity vol quan sát được, phải suy ngược qua chính công thức call ở trên rồi map DD sang một "expected default frequency" thực nghiệm bằng bảng lịch sử default). DD là ngôn ngữ chung của cả một ngành đo lường tín dụng doanh nghiệp.

**Vì sao mô hình đẹp mà vẫn phải calibrate reduced-form hằng ngày.** Merton có một khiếm khuyết chí tử về mặt định giá short-dated: vì $V_t$ liên tục và default chỉ xảy ra tại $T$ khi $V_T < D$, xác suất default cho kỳ hạn rất ngắn tiến về 0 nhanh hơn thực tế rất nhiều — tài sản cần "trôi" một quãng đủ xa mới chạm ngưỡng, mà Brownian motion không nhảy. Kết quả: **structural model cho short-term credit spread gần như bằng 0**, mâu thuẫn với thị trường (spread 1 tháng của tên đầu cơ vẫn hàng trăm bp). Các biến thể first-passage (Black-Cox, default khi $V_t$ chạm ngưỡng *bất cứ lúc nào* chứ không chỉ tại $T$) và jump-diffusion vá phần nào, nhưng vẫn không calibrate khít vào từng điểm trên credit curve như reduced-form.

Do đó ranh giới sử dụng trong thực chiến rất rõ ràng, và đáng ghi nhớ như một bảng phân vai:

| Câu hỏi | Dùng model nào | Vì sao |
|---|---|---|
| Định giá CDS/bond hằng ngày, khớp từng điểm curve | **Reduced-form** | Calibrate thẳng vào CDS quotes, khớp tuyệt đối |
| Ước lượng PD "thật" cho rating, capital, early-warning | **Structural (KMV)** | Có nội dung kinh tế, dùng được cả tên không có CDS |
| Equity-credit relative value, capital structure arbitrage | **Structural** | Nối equity ↔ debt qua cùng $V_t$ |
| Correlation/CDO, default chung nhiều tên | **Copula** (13.5) trên nền reduced-form marginal | Tách marginal khỏi dependence |

Tóm gọn: structural model trả lời "*vì sao*", reduced-form trả lời "*bao nhiêu, khớp giá*". Desk pricing sống bằng reduced-form; risk và rating sống bằng structural; và như ta sẽ thấy, correlation product cần cả hai tinh thần.

## 13.3 CDS — instrument trung tâm của thị trường credit

Nếu chỉ được giữ một công cụ trong cả thị trường credit, đó là **Credit Default Swap (CDS)**. Nó là hợp đồng bảo hiểm chuẩn hoá trên sự kiện default của một tên tham chiếu (reference entity), và là nơi hazard rate được "quote" ra thành giá thị trường mỗi ngày.

Cấu trúc gồm hai chân (leg) đối xứng. Bên mua protection trả **premium leg**: một chuỗi coupon định kỳ (thường quý) cho tới khi đáo hạn *hoặc* cho tới khi default, tuỳ cái nào đến trước. Đổi lại, nếu default xảy ra, bên bán protection trả **protection leg** — khoản bù đắp $= (1 - R) \times$ notional, đúng bằng phần mất mát trên một trái phiếu mệnh giá bằng notional. Nói nôm na: người mua CDS trả phí đều đặn để được đền bù khi tên tham chiếu "chết".

Giá trị hiện tại của hai leg, viết dưới dạng tích phân theo hàm sống sót và discount factor phi rủi ro $P(0,t)$:

$$\text{PV}_{\text{prot}} = (1 - R)\int_0^T P(0,t)\,\big(-dQ(\tau > t)\big), \qquad \text{PV}_{\text{prem}} = s \sum_i \tau_i\, P(0,t_i)\, Q(\tau > t_i) + \text{accrual}.$$

Trong protection leg, $-dQ(\tau > t) = \lambda_t Q(\tau>t)\,dt$ là mật độ xác suất default đúng tại $t$ — ta tích phân khoản đền bù $(1-R)$ có chiết khấu, có trọng số theo khả năng default rơi vào từng khoảnh khắc. Trong premium leg, mỗi coupon $s\,\tau_i$ (với $\tau_i$ là day-count fraction của kỳ) chỉ được trả *nếu tên còn sống* tới ngày trả $t_i$, nên có nhân tử $Q(\tau > t_i)$. Số hạng **accrual** cộng thêm phần coupon dồn tích từ ngày trả gần nhất tới ngày default (thị trường trả phần lẻ này khi hợp đồng chấm dứt giữa kỳ).

**Par spread** $s$ là mức spread làm hai leg cân bằng, $\text{PV}_{\text{prem}}(s) = \text{PV}_{\text{prot}}$ — đây là "giá" của CDS theo ngôn ngữ cũ. Giải ra và dùng xấp xỉ bậc nhất (cùng logic tam giác ở 13.1) ta lại về công thức nhớ lòng:

$$s \approx \lambda\,(1 - R).$$

Trực giác: mỗi năm bên bán protection kỳ vọng phải chi $\lambda \times (1-R)$ (xác suất default nhân loss), nên phí công bằng đúng bằng đó. Spread 120bp với $R = 40\%$ cho $\lambda \approx 0.012 / 0.6 = 2\%$/năm — khớp chính xác running example.

**CDS tính tay đầy đủ — con số phải giữ nguyên.** Một tên có par spread 5Y $= 120\,\text{bp}$, $R = 40\%$, curve rate phẳng 4%. Tam giác cho $\lambda \approx 2\%$. Bây giờ ta cần **Risky PV01** (còn gọi RPV01 hoặc "risky annuity") — giá trị hiện tại của một chuỗi trả 1bp mỗi năm trên premium leg, có trọng số cả chiết khấu lẫn survival:

$$\text{RPV01} = \sum_{i=1}^{5} P(0,i)\, Q(\tau > i).$$

Nếu ta xấp xỉ theo quy ước bảng nhớ nhanh (chiết khấu là thành phần trội, survival gần 1 cho tên investment-grade), $\text{RPV01} \approx \sum_{i=1}^{5} e^{-0.06 i}$ — dùng $0.06$ như một discount-cum-survival rate gộp $r + \lambda \approx 4\% + 2\%$:

$$\text{RPV01} \approx e^{-0.06} + e^{-0.12} + e^{-0.18} + e^{-0.24} + e^{-0.30} = 0.9418 + 0.8869 + 0.8353 + 0.7866 + 0.7408 = 4.19.$$

Con số **4.19** này là giá trị của mỗi 1bp spread trên hợp đồng. (Để chặt chẽ: nếu tách rời và nhân $P(0,i) = e^{-0.04i}$ với $Q(\tau>i) = e^{-0.02i}$ riêng thì tổng ra $e^{-0.06i}$ y hệt vì $0.04 + 0.02 = 0.06$ — đây không phải trùng hợp, mà là lý do quy ước gộp rate hoạt động; nếu chỉ chiết khấu thuần không survival thì RPV01 lớn hơn chút, nhưng 4.19 là con số desk dùng.)

Giờ tới quy ước quote **hậu-2009 "CDS Big Bang"**. Trước 2009 mỗi CDS trade ở par spread riêng, khiến hai hợp đồng cùng tên khác spread không netting được sạch. Sau Big Bang, hợp đồng chuẩn hoá về **coupon cố định** (100bp cho investment-grade, 500bp cho high-yield), và phần chênh giữa spread thị trường thực với coupon chuẩn được trả gọn một lần bằng **upfront**:

$$\text{Upfront} = (s_{\text{par}} - c) \times \text{RPV01} = (120 - 100)\,\text{bp} \times 4.19 = 0.0020 \times 4.19 = 0.84\%\ \text{notional}.$$

Đọc trên notional 10M: bên mua protection trả trước **84,000** (upfront), rồi trả **100,000/năm** (coupon 100bp) cho tới đáo hạn hoặc default. Nếu spread thị trường tụt xuống dưới 100bp (tín dụng cải thiện), upfront đổi dấu — bên *bán* protection trả upfront cho bên mua. Mọi con số CDS trên màn hình Bloomberg — spread quote, upfront points, coupon — chuyển đổi qua nhau bằng đúng phép tính này. **ISDA Standard Model** (mã nguồn mở, cả industry chạy chung) chuẩn hoá nó để hai đối tác khớp nhau tới từng cent — đây là hiếm hoi một model được luật hoá thành hạ tầng thị trường.

**Mark-to-market của một CDS đã có sẵn** cũng chảy thẳng ra từ RPV01. Nếu bạn đã mua protection ở spread 120bp, và hôm nay spread thị trường của tên đó nhảy lên 200bp (tín dụng xấu đi), vị thế của bạn lãi:

$$\text{MTM} \approx (s_{\text{market}} - s_{\text{entry}}) \times \text{RPV01} \times \text{notional} = (200 - 120)\,\text{bp} \times 4.19 \times 10\text{M} = 0.0080 \times 4.19 \times 10\text{M} = 335\text{k}.$$

Đây là *spread DV01* — độ nhạy P&L theo 1bp dịch spread, đúng bằng RPV01 × notional (về đơn vị bp). Nó là greek trung tâm mà một credit trader nhìn cả ngày, hệt như delta của equity trader.

**Bootstrap credit curve** là bài toán ngược của tất cả những gì trên: từ một *rổ* CDS quotes ở nhiều kỳ hạn (chuẩn thị trường: 1Y, 3Y, 5Y, 7Y, 10Y — với 5Y là điểm thanh khoản nhất), suy ngược ra một hàm $\lambda(t)$ **piecewise-constant** khớp mọi quote đồng thời. Cùng mô thức stripping của curve lãi suất ở chương 9, chỉ khác biến là hazard thay vì forward rate. Giải tuần tự: dùng quote 1Y để tìm $\lambda$ trên đoạn $[0,1]$; cố định đoạn đó, dùng quote 3Y tìm $\lambda$ trên $(1,3]$; và cứ thế.

Ví dụ số đầy đủ. Giả sử curve quote 1Y $= 100\,\text{bp}$, 3Y $= 120\,\text{bp}$, 5Y $= 150\,\text{bp}$, tất cả $R = 40\%$. Chìa khoá làm tay: mỗi spread kỳ hạn $T$ ứng với một hazard **trung bình** trên $[0,T]$ qua công thức tam giác $\bar\lambda(0,T) \approx s_T/(1-R)$, và hazard trung bình đó chính là hazard tích luỹ chia cho $T$: $\int_0^T \lambda_s\,ds = \bar\lambda(0,T)\,T$. Vậy ba quote cho ba mức tích luỹ, và ta bóc từng đoạn:

- **Đoạn $[0,1]$**: $\bar\lambda(0,1) = 0.0100/0.6 = 1.667\%$, nên $\lambda_{[0,1]} = 1.67\%$. Tích luỹ tới năm 1: $0.0167$.
- **Đoạn $(1,3]$**: tích luỹ tới năm 3 phải bằng $\bar\lambda(0,3)\times 3 = (0.0120/0.6)\times 3 = 0.02 \times 3 = 0.06$. Trừ phần đoạn đầu ($0.0167 \times 1$) còn $0.06 - 0.0167 = 0.0433$ chia đều cho 2 năm, ra $\lambda_{(1,3]} = 2.17\%$.
- **Đoạn $(3,5]$**: tích luỹ tới năm 5 phải bằng $\bar\lambda(0,5)\times 5 = (0.0150/0.6)\times 5 = 0.025 \times 5 = 0.125$. Trừ phần hai đoạn trước ($0.0167 + 0.0433 = 0.06$) còn $0.125 - 0.06 = 0.065$ chia cho 2 năm, ra $\lambda_{(3,5]} = 3.25\%$.

Curve $\lambda$ ra $1.67\% \to 2.17\% \to 3.25\%$ — *dốc lên* rõ rệt, phản ánh thị trường thấy rủi ro dài hạn của tên này lớn hơn (term structure of credit; đường cong dốc lên là dạng điển hình của tên khoẻ mạnh). Curve $\lambda(t)$ này là "output" cuối cùng: mọi bond, mọi CDS, mọi CVA của tên này sau đó dùng chung nó. Về mặt kiến trúc, credit curve sống cùng chỗ với các curve khác — ứng với `src/marketdata` và `src/calibration` — vì nó là *market data construction*, không phải một model riêng.

**Quanto CDS và cửa sổ đầu tiên vào wrong-way risk.** Một biến chứng thực chiến sắc bén: CDS trên một **sovereign** (ví dụ Brazil) thường được quote và thanh toán bằng đồng tiền *khác* đồng nội tệ của nước đó (USD, chứ không phải BRL). Vấn đề: khi sovereign default, đồng nội tệ hầu như luôn *sụp giá* mạnh cùng lúc (devaluation là bạn đồng hành của khủng hoảng chủ quyền). Hướng thiệt hại phụ thuộc đồng tiền thanh toán, và cần nói rõ ai chịu ở mỗi kịch bản. Nếu protection **trả bằng nội tệ** (BRL): default kéo tỷ giá BRL sụp, nên khoản đền bù nhận về — dù đủ lớn tính bằng BRL — quy đổi sang USD chỉ còn một phần nhỏ; **bên mua protection** thiệt, vì bảo hiểm bốc hơi giá trị đúng lúc cần chi trả nhất. Nếu protection **trả bằng ngoại tệ** (USD): khoản đền bù giữ nguyên giá trị USD bất kể BRL sụp bao nhiêu, nên **bên bán protection** chịu rủi ro nặng hơn — họ phải chi trả đầy đủ bằng đồng tiền mạnh đúng lúc khủng hoảng, và đây là lý do CDS quanto (thanh toán ngoại tệ) quote *rộng hơn* CDS local-currency cùng tên. Model cái này đòi một **jump của FX rate tại thời điểm default**, với biên độ jump được calibrate từ chênh lệch giữa CDS quanto (USD) và local-currency. Đây là ví dụ tinh khiết đầu tiên của **wrong-way risk** — khi exposure và default tương quan xấu với nhau — mà ta sẽ đào sâu trong chương 14 (XVA). Giữ ý này trong đầu: correlation giữa "bao nhiêu tôi mất" và "khi nào đối tác chết" là mạch ngầm chạy qua toàn bộ nửa sau cuốn sách.

## 13.4 Index credit — CDX và iTraxx

Trước khi bước vào correlation, cần một cây cầu: **credit index**. Thay vì giao dịch một tên, thị trường chuẩn hoá các *rổ* tên thành index có thể trade như một sản phẩm duy nhất. Hai họ lớn: **CDX** (Bắc Mỹ — CDX.IG gồm 125 tên investment-grade, CDX.HY gồm 100 tên high-yield) và **iTraxx** (Châu Âu/Á — iTraxx Europe Main 125 tên IG, Crossover 75 tên đầu cơ). Mỗi 6 tháng (tháng 3 và 9) một "series" mới (on-the-run) được roll ra với danh sách tên cập nhật.

Về cơ chế, index CDS giống hệt single-name CDS nhưng protection leg trả khi *bất kỳ* tên nào trong rổ default, tỷ lệ theo trọng số của tên đó (thường equal-weight). Spread của index xấp xỉ trung bình các single-name spread — nhưng không bằng chính xác, và chênh lệch có tên: **index basis** (index skew), chênh giữa index spread quote thẳng và "intrinsic" spread tính từ rổ single-name. Basis này là một relative-value trade thực (mua index bán rổ, hoặc ngược lại) và là barometer thanh khoản: khi thị trường hoảng, người ta mua protection index nhanh và rẻ hơn gom 125 CDS lẻ, đẩy index spread rộng hơn intrinsic. Index là công cụ macro-hedge credit số một — muốn phòng "rủi ro tín dụng nói chung" thì mua CDX.IG, không cần chọn tên.

Điều làm index quan trọng cho mục kế tiếp: index được **cắt lớp (tranche)** thành các đoạn chịu lỗ chuẩn hoá, và chính thị trường index tranche mới là nơi correlation được quote ra — bệ phóng thẳng vào bài học CDO.

## 13.5 Correlation, copula, và bài học CDO

Vì sao mục này là điểm dừng lớn nhất chương: bởi vì mọi thứ tới đây đều là *một tên*. Nhưng rủi ro tín dụng thực sự nguy hiểm khi nhiều tên **chết chùm**. Định giá bất cứ sản phẩm nào trên một *danh mục* credit — CDO tranche, index tranche, hay chính CVA trên danh mục counterparty — đòi hỏi **phân phối lỗ chung (joint loss distribution)**, và trái tim của nó là **default correlation**. Đây cũng là nơi nghề quant học bài học model risk đắt giá nhất lịch sử.

**CDO và cơ chế tranche.** Collateralized Debt Obligation gom một danh mục credit (ví dụ 125 tên trong CDX.IG) rồi *cắt lớp* theo thứ tự chịu lỗ. Quy ước chuẩn của thị trường index tranche:

| Tranche | Attachment–Detachment | Vai trò |
|---|---|---|
| Equity | 0%–3% | Chịu lỗ đầu tiên; rủi ro cao nhất, spread cao nhất |
| Mezzanine | 3%–7% | Lớp giữa, chịu lỗ sau equity |
| Senior | 7%–15% | Chỉ lỗ khi danh mục thảm hoạ |
| Super-senior | 15%–100% | "An toàn nhất" — cho tới 2008 |

(Bảng trên gộp đơn giản hoá phần trên cùng thành một super-senior duy nhất; thị trường CDX.IG chuẩn thực tế còn cắt nhỏ hơn nữa — điển hình tách 15–30% và 30–100% thành hai lớp riêng — nhưng logic call-spread bên dưới không đổi.)

Cơ chế: mọi khoản lỗ của danh mục ăn từ dưới lên. Nếu tổng lỗ danh mục là 2%, chỉ equity tranche (0–3%) chịu, và nó mất $2/3$ mệnh giá. Nếu lỗ 5%, equity mất sạch (toàn bộ 0–3%) và mezzanine (3–7%) mất $(5-3)/(7-3) = 50\%$. Payoff của một tranche $[a, d]$ khi tổng loss danh mục là $L$ chính là

$$\text{Loss}_{[a,d]}(L) = \frac{\min(L, d) - \min(L, a)}{d - a},$$

một cấu trúc **call spread trên biến $L$** — long call strike $a$, short call strike $d$. Vì nó là call spread, giá tranche phụ thuộc *hình dạng đuôi* của phân phối $L$, không chỉ giá trị kỳ vọng. Và hình dạng đó do correlation quyết định.

**Vì sao correlation là tất cả.** Xét hai thái cực. Nếu các tên default **độc lập** (correlation 0), luật số lớn làm tổng loss $L$ tập trung chặt quanh giá trị kỳ vọng (ví dụ $9.5\% \times 60\% \approx 5.7\%$ nếu mỗi tên có PD 9.5%) — phân phối hẹp, hầu như chắc chắn equity mất sạch còn senior gần như không bao giờ chạm. Nếu các tên default **hoàn toàn tương quan** (correlation 1), hoặc tất cả sống hoặc tất cả chết cùng nhau — phân phối $L$ thành hai cực 0 và 60%, đuôi cực dày, senior tranche giờ có xác suất thật bị lỗ. **Tăng correlation dịch giá trị từ tranche giữa sang hai đầu**: nó làm equity *bớt* rủi ro (bớt chắc chắn mất sạch) và senior *thêm* rủi ro (thêm khả năng thảm hoạ chạm tới). Đây là điểm phản trực giác chí tử mà nhiều người 2007 không nắm: super-senior không hề "an toàn tuyệt đối" — nó là một cược thẳng vào correlation thấp.

**Gaussian copula một nhân tố (Li 2000)** là mô hình chuẩn — khét tiếng — để sinh ra phân phối lỗ chung này. Ý tưởng: tách rời hai câu hỏi. (1) *Marginal* — mỗi tên default lúc nào? — lấy từ CDS curve của chính nó qua reduced-form, đã làm ở 13.1–13.3. (2) *Dependence* — chúng tương quan ra sao? — do copula gánh. Cơ chế: gán cho mỗi tên $i$ một biến ẩn (latent variable)

$$X_i = \sqrt{\rho}\, M + \sqrt{1 - \rho}\, Z_i,$$

trong đó $M$ là **nhân tố hệ thống (systematic factor)** chung cho cả rổ (nghĩ: "sức khoẻ nền kinh tế"), $Z_i$ là **nhân tố riêng (idiosyncratic)** độc lập của từng tên, cả hai chuẩn tắc độc lập. Hệ số $\sqrt\rho$ và $\sqrt{1-\rho}$ chọn khéo để $X_i$ vẫn chuẩn tắc và mọi cặp $X_i, X_j$ có correlation đúng bằng $\rho$. Tên $i$ default trước thời điểm $t$ khi $X_i$ tụt dưới một ngưỡng $C_i(t)$, ngưỡng này calibrate để xác suất default khớp đúng CDS marginal: $C_i(t) = N^{-1}(\text{PD}_i(t))$.

**Ví dụ số copula — sức mạnh của nhân tố chung.** Lấy PD 5 năm $= 9.52\%$ (từ running example $\lambda = 2\%$). Ngưỡng default:

$$C = N^{-1}(0.0952) = -1.31.$$

Điều đẹp của one-factor: *có điều kiện* biết $M$, các tên trở nên **độc lập** (vì chỉ còn $Z_i$ ngẫu nhiên). Xác suất tên $i$ default có điều kiện $M$:

$$p(M) = \mathbb{P}(X_i < C \mid M) = N\!\left(\frac{C - \sqrt{\rho}\,M}{\sqrt{1 - \rho}}\right).$$

Lấy $\rho = 0.3$ và quét $M$ để thấy cơ chế chết chùm:

| Kịch bản nền kinh tế $M$ | Conditional PD $p(M)$ |
|---|---|
| Bùng nổ, $M = +2$ | $N\!\big(\tfrac{-1.31 - 0.548 \times 2}{0.837}\big) = N(-2.87) = 0.20\%$ |
| Bình thường, $M = 0$ | $N\!\big(\tfrac{-1.31}{0.837}\big) = N(-1.56) = 5.9\%$ |
| Suy thoái, $M = -2$ | $N\!\big(\tfrac{-1.31 + 1.095}{0.837}\big) = N(-0.256) = 39.9\%$ |

Đọc bảng này chậm rãi — nó là toàn bộ linh hồn của correlation product. Ở kịch bản nền tốt, gần như không tên nào chết (0.2%). Ở kịch bản xấu, gần **40%** danh mục chết *cùng lúc*. Chính $M$ chung này tạo ra chết chùm: nó kéo tất cả latent variable xuống đồng thời. Với danh mục lớn (large-pool limit), tỷ lệ loss có điều kiện $M$ xấp xỉ $(1-R)\,p(M) = 0.6 \times p(M)$: ở $M=0$ là $3.5\%$, nhưng ở $M = -2$ vọt lên $0.6 \times 0.399 = 24\%$ tổng danh mục lỗ. Chính cái đuôi $M$-driven này quyết định senior tranche đáng bao nhiêu. Tích hợp $p(M)$ theo phân phối chuẩn của $M$ (công thức Vasicek large-pool) cho ta trọn phân phối lỗ danh mục, rồi ráp vào call spread $[a,d]$ ra giá từng tranche.

**Base correlation.** Trong thực hành, thị trường không quote $\rho$ trực tiếp mà quote **implied correlation** cho từng tranche — hệt như implied vol cho option: đảo ngược mô hình để tìm $\rho$ khớp giá quan sát. Vì compound correlation (giải $\rho$ riêng từng tranche mezzanine) không đơn điệu và đôi khi vô nghiệm, industry chuyển sang **base correlation** — correlation của chuỗi tranche equity $[0, d]$ liên tiếp, luôn có nghiệm và bootstrap được. Base correlation với credit chính là surface implied vol với equity: một patch để quote giá, không phải một sự thật vật lý. Và như mọi implied surface, nó *dốc* (correlation skew) — dấu hiệu rõ ràng rằng mô hình một tham số $\rho$ không đủ mô tả thực tế.

**"The formula that killed Wall Street" — bài học model risk lớn nhất nghề.** Khủng hoảng 2008 phơi bày ba khiếm khuyết chí tử của Gaussian copula, và mỗi cái đáng học kỹ như kỹ sư xây dựng học về một cây cầu sập:

Thứ nhất, **thiếu tail dependence**. Phân phối chuẩn có đuôi mỏng: với $\rho < 1$, xác suất hai tên default *đồng thời trong tình huống cực đoan* tiến về 0 nhanh hơn thực tế rất nhiều. Ngôn ngữ chính xác: Gaussian copula có tail dependence coefficient bằng 0. Thực tế thị trường trong khủng hoảng, các tên chết chùm *dữ dội hơn* mọi $\rho$ Gaussian tiên đoán — cái đuôi mà mô hình bảo "không thể" lại chính là cái đã xảy ra. Student-t copula (đuôi dày, có tail dependence) mô tả tốt hơn, nhưng đã quá muộn cho các quyển sách 2008.

Thứ hai, **correlation không phải hằng số**. Mô hình dùng một $\rho$ tĩnh, nhưng correlation thực nhảy vọt đúng lúc khủng hoảng — khi nhà đầu tư hoảng loạn, mọi thứ tương quan về 1. Chính lúc senior tranche cần correlation thấp để "an toàn" thì correlation phóng lên, và super-senior — được rating AAA và nắm giữ như tiền mặt — bốc hơi.

Thứ ba, **calibrate vào một thị trường mỏng, phản xạ dội (reflexivity)**. Toàn bộ base correlation surface strip từ một thị trường index tranche vốn thanh khoản kém và tự tham chiếu: giá tranche → correlation → giá tranche mới. Khi thanh khoản bốc hơi 2008, chính cái neo calibration biến mất, và mọi định giá trôi tự do.

David Li — tác giả công thức — về sau bị báo chí gán nhãn "the formula that killed Wall Street", một mô tả vừa bất công (mô hình chỉ là công cụ) vừa đúng bản chất (cả một ngành đã dùng một xấp xỉ tiện lợi làm chân lý và quên mất giả định của nó). Bài học không phải "copula xấu" mà là: **mọi mô hình là một khung nhìn có giả định, và giả định thất bại đúng lúc thị trường stress nhất — chính lúc bạn cần nó đúng nhất.** Đây là lý do model validation (chương 19) tồn tại như một chức năng độc lập trong mọi ngân hàng hiện đại.

Thị trường correlation ngày nay đã thu nhỏ — CDO tổng hợp phức tạp gần như biến mất, nhưng index tranche (CDX/iTraxx) vẫn giao dịch đều, và cỗ máy copula *không hề chết*. Nó sống tiếp ở hai nơi cốt lõi: trong **CVA** để model default chung giữa counterparty và reference entity (wrong-way risk, chương 14), và trong **risk aggregation** để gộp rủi ro nhiều tên thành một phân phối tổn thất danh mục. Về kiến trúc, tầng correlation/CDO ứng với `src/models` (nhánh credit/cdo) trên nền các marginal reduced-form; instrument CDS ứng với `src/instruments`. Hiểu copula không phải để build CDO 2007 — mà để không lặp lại 2008 khi nó ẩn mình trong CVA của hôm nay.

# Chương 14: XVA

Trước 2008, một quant định giá một interest rate swap sẽ làm đúng một việc: chiết khấu dòng tiền kỳ vọng về hôm nay theo curve risk-free, ra một con số, và gọi đó là "giá". Con số ấy sạch sẽ, đối xứng, và sai. Nó giả định rằng counterparty bên kia sẽ luôn trả tiền, rằng bản thân ta cũng bất tử, rằng tiền để hedge không tốn phí gì để vay, rằng không có margin nào bị nhốt lại, và rằng vốn chủ sở hữu ngồi phía sau bảng cân đối là miễn phí. Khủng hoảng tài chính đã xé toạc từng giả định đó. Lehman chết và kéo theo cả một chuỗi mất mát counterparty; AIG suýt kéo sập hệ thống vì bán bảo hiểm mà không có vốn; và khi thị trường funding đóng băng, các bank phát hiện rằng vay một đồng để hedge không hề rẻ. Từ đống đổ nát đó, ngành định giá phải viết lại phương trình cơ bản: giá thật của một derivative OTC không phải giá Black-Scholes, mà là giá sạch **trừ đi hoặc cộng vào một chuỗi valuation adjustments** — gọi chung là **XVA** (valuation adjustments, chữ X là placeholder cho C, D, F, M, K, Col...).

Đây là mảng nặng tính toán bậc nhất của một sell-side desk, nơi toán ngẫu nhiên gặp kỹ thuật Monte Carlo quy mô lớn, gặp credit modeling, gặp cả kế toán và quy định vốn. Trong `quantc`, đây là tầng `src/xva` với các module con `netting`, `collateral`, `sa-ccr`, `simm`, `wwr`, `mva`, `dynamic-im`, `kva`. Tài liệu chuẩn của ngành: Green *XVA: Credit, Funding and Capital Valuation Adjustments* (2015), Gregory *The xVA Challenge* (ấn bản mới nhất). Chương này giả định bạn đã nắm credit modeling (Chương 13: hazard rate, CDS, survival probability) và numerics (Chương 12: Monte Carlo, Longstaff-Schwartz, AAD), vì XVA là nơi mọi thứ đó hội tụ.

Để chương có một mạch số xuyên suốt, ta chọn một **deal running** và bám nó từ đầu đến cuối: một **swap payer 10 năm, notional 100M USD, không collateral**, counterparty có hazard rate $\lambda = 2\%$ và recovery $R = 40\%$ (đúng bộ số đã gặp ở Chương 13 khi tính CDS). Mỗi chữ cái của bảng chữ cái XVA sẽ được tính bằng số trên chính deal này, rồi ở mục cuối ta gộp tất cả thành một "giá thật" duy nhất — để bạn thấy Black-Scholes chỉ là điểm khởi đầu, không phải điểm kết.

## 14.1 Counterparty exposure — ngôn ngữ chung

Mọi thứ trong XVA bắt đầu từ một câu hỏi: nếu counterparty chết vào một thời điểm $\tau$ trong tương lai, ta mất bao nhiêu? Câu trả lời không đối xứng, và chính sự bất đối xứng đó sinh ra toàn bộ ngành. Với một derivative OTC không (đủ) collateral, nếu counterparty vỡ nợ khi hợp đồng đang có giá trị dương $V_\tau > 0$ cho ta, ta là một chủ nợ không đảm bảo (unsecured creditor) và chỉ thu hồi được tỷ lệ recovery $R$ trên phần dương đó — mất $(1-R)V_\tau^+$. Nhưng nếu $V_\tau < 0$ (ta đang nợ counterparty), ta vẫn phải trả đủ; default của họ không xóa nghĩa vụ của ta. Chính vì thế chỉ có nửa dương của giá trị mới sinh ra loss, và ta định nghĩa **exposure** là

$$E_t = \max(V_t, 0) = V_t^+.$$

Từ đại lượng path-wise này, ta lấy kỳ vọng và quantile để ra các profile mà mọi desk đều nói cùng ngôn ngữ. **EE (Expected Exposure)** tại thời điểm tương lai $t$ là $\text{EE}(t) = \mathbb{E}^{\mathbb{Q}}[E_t]$ — một hàm theo thời gian, xương sống của CVA. **EPE (Expected Positive Exposure)** là trung bình EE theo thời gian, một con số duy nhất tóm tắt cả profile: $\text{EPE} = \overline{\text{EE}} = \frac{1}{T}\int_0^T \text{EE}(t)\,dt$. **PFE (Potential Future Exposure)** là một quantile cao (thường 95% hoặc 97.5%) của phân phối $E_t$ — nó không dùng để định giá mà để đặt **credit limit**: "được phép trade tối đa bao nhiêu với counterparty này trước khi rủi ro vượt khẩu vị". Ba con số này trả lời ba câu hỏi khác nhau: EE hỏi "tại thời điểm $t$, trung bình ta mất bao nhiêu"; EPE nén cả hàm EE thành một con số duy nhất để so sánh nhanh giữa các counterparty; PFE hỏi "trong kịch bản xấu ta có thể mất bao nhiêu" (dùng cho limit, lấy đuôi phân phối). Với profile swap bằng số ở dưới, ta sẽ thấy ngay $\text{EPE} = 15.1/10 = 1.51\,\text{M}$ — một con số ta sẽ tái sử dụng khi tính FVA ở 14.6.

Hình dạng của profile EE phụ thuộc bản chất deal, và đọc được hình dạng là bước đầu của trực giác XVA. Một swap có EE hình "bướu": tăng lúc đầu rồi giảm về cuối. Một FX forward có exposure tăng đơn điệu đến maturity (không có coupon nào trôi qua để giảm risk, MTM chỉ tản rộng dần theo $\sqrt{t}$). Một option đã trả premium chỉ có exposure một chiều: người mua option luôn có $V \ge 0$ nên chịu toàn bộ counterparty risk, người bán đã thu tiền nên không còn exposure.

**Profile EE bằng số** — deal running (swap payer 10Y, notional 100M, không collateral; đơn vị: triệu USD, minh họa từ một mô phỏng Hull-White điển hình):

| $t$ (năm) | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| EE | 1.2 | 1.8 | 2.1 | 2.2 | 2.3 | 2.0 | 1.6 | 1.1 | 0.6 | 0.2 |
| PFE 97.5% | 3.1 | 4.8 | 5.7 | 6.1 | 6.2 | 5.5 | 4.4 | 3.0 | 1.6 | 0.5 |

Từ bảng: $\text{EPE} = \overline{\text{EE}} = (1.2+1.8+2.1+2.2+2.3+2.0+1.6+1.1+0.6+0.2)/10 = 15.1/10 = 1.51\,\text{M}$. Hình "bướu" đỉnh 2.3M quanh năm 4–5 không phải ngẫu nhiên mà là kết quả của hai lực đối chọi, và ta có thể tách chúng ra rõ ràng. Lực thứ nhất là **diffusion**: MTM của swap phụ thuộc lãi suất, và độ tản của lãi suất tương lai lớn dần theo $\sqrt{t}$ (đặc trưng của Brownian motion), nên độ bất định của $V_t$ — và do đó kỳ vọng của nửa dương $\mathbb{E}[V_t^+]$ — tăng lên. Lực thứ hai là **amortization của risk**: mỗi lần một coupon date trôi qua, phần còn lại của swap ngắn đi, duration co lại, độ nhạy với lãi suất giảm; đến năm thứ 9 chỉ còn một coupon, MTM gần như không dao động. Tích của hai lực — $\sqrt{t}$ tăng nhân với duration giảm — đạt cực đại đâu đó quanh $T/3$ đến $T/2$, ở đây là năm 4–5.

Ta có thể kiểm chứng thô công thức hóa lực này. Với swap gần ATM, $V_t \approx \text{Annuity}(t)\times(\text{rate move})$, độ lệch chuẩn của rate move tại $t$ xấp xỉ $\sigma_r\sqrt{t}$, và vì kỳ vọng nửa dương của một biến normal tâm 0 với độ lệch chuẩn $\sigma$ là $\sigma\,\phi(0)=\sigma/\sqrt{2\pi}$ (với $\phi(0)=1/\sqrt{2\pi}\approx0.399$), ta có

$$\text{EE}(t)\;\approx\;\text{Annuity}(t)\cdot\sigma_r\sqrt{t}\cdot\frac{1}{\sqrt{2\pi}}.$$

Annuity của một payer swap 10Y giảm gần tuyến tính từ ~9 (năm 1, còn 9 coupon phía trước) xuống ~0 (năm 10); còn $\sqrt{t}$ tăng từ $\sqrt{1}=1$ đến $\sqrt{10}\approx3.16$. Tích của một hàm giảm tuyến tính và một hàm tăng căn bậc hai luôn cho một bướu lệch về đầu — nếu đặt $\text{Annuity}(t)\propto(10-t)$ và tối đa hóa $(10-t)\sqrt{t}$, đạo hàm bằng 0 cho $t = 10/3 \approx 3.3$, đúng vào vùng đỉnh của bảng (bảng đỉnh muộn hơn chút, năm 4–5, vì annuity thực không tuyến tính hoàn hảo và MTM còn phụ thuộc mean-reversion của Hull-White). Trực giác cốt lõi: **exposure là tích của "thời gian còn lại để dao động" nhân "biên độ đã tích lũy được"**, và tích đó cực đại ở giữa đời deal, không phải ở đầu hay cuối.

Bảng này là **nguyên liệu trực tiếp** của CVA ở mục 14.5: nhân mỗi cột với xác suất default trong khoảng đó và với $(1-R)$, cộng lại là ra credit charge. Cột PFE 97.5% cao gấp ~2.7 lần EE (đỉnh 6.2M so với 2.3M) — tỷ lệ này phản ánh độ lệch phải của phân phối exposure (một biến bị chặn dưới bởi 0 luôn lệch phải), và nó là con số mà bộ phận credit risk dùng để nói "counterparty này chỉ được phép chiếm dụng tối đa X của limit".

## 14.2 Netting set và vì sao XVA không cộng theo deal

Nếu XVA chỉ là một tích phân trên một deal, đời quá dễ. Nhưng có một điều khoản pháp lý làm đảo lộn toàn bộ kiến trúc tính toán: **netting**. ISDA Master Agreement — hợp đồng khung ký một lần giữa hai bên, phủ lên mọi giao dịch giữa họ — cho phép, khi một bên default, bù trừ (net) toàn bộ giá trị dương và âm của mọi deal thành một con số duy nhất, rồi chỉ đòi/trả phần chênh lệch ròng. Điều này biến exposure từ tổng của các nửa dương thành nửa dương của tổng:

$$E_t^{\text{netted}} = \left(\sum_i V_i(t)\right)^+ \quad\le\quad \sum_i V_i(t)^+ = E_t^{\text{gross}}.$$

Bất đẳng thức này (luôn là $\le$, vì $(\sum_i x_i)^+ \le \sum_i x_i^+$ do hàm $x^+$ là subadditive) không phải chi tiết kỹ thuật mà là trái tim của XVA. Xét một ví dụ số tối thiểu với hai deal đối nhau: giả sử trong một scenario, deal A có $V_A = +5\,\text{M}$ và deal B có $V_B = -4\,\text{M}$. Không netting, exposure là $E^{\text{gross}} = 5^+ + (-4)^+ = 5 + 0 = 5\,\text{M}$. Có netting, exposure là $E^{\text{netted}} = (5-4)^+ = 1\,\text{M}$. Netting cắt exposure xuống một phần năm (từ 5M còn 1M, tức 80% netting benefit) chỉ nhờ một điều khoản pháp lý. Trong một portfolio thực với hàng nghìn deal đối xứng một phần, netting benefit tổng có thể là 80–95%.

Hệ quả then chốt: **XVA không cộng được theo từng deal**. CVA của portfolio không bằng tổng CVA của từng deal, vì exposure — thứ đứng trong tích phân — là một hàm phi tuyến (phép $\max$ với 0) của tổng các deal, và $\max$ của tổng không bằng tổng các $\max$. Mọi tính toán phải chạy ở mức **netting set**: tập hợp mọi deal với một counterparty được phủ bởi cùng một ISDA Master (và cùng một CSA nếu có collateral). Một bank có thể có nhiều netting set với cùng counterparty nếu có nhiều pháp nhân hay nhiều thỏa thuận. Đây là ràng buộc kiến trúc đầu tiên và mạnh nhất: XVA engine phải mô phỏng **đồng thời toàn bộ** netting set — mọi deal, qua toàn bộ đời sống của deal dài nhất — trên cùng một bộ scenario, để phép netting có ý nghĩa. Bạn không thể tính CVA một deal rồi cộng vào; bạn phải tính lại cả netting set mỗi khi thêm một deal (dẫn đến khái niệm incremental XVA ở mục 14.10).

## 14.3 Collateral, CSA, và MPoR — cơ chế chi tiết

Netting làm giảm exposure, nhưng thứ giảm exposure mạnh nhất là **collateral**. Cơ chế nằm trong **CSA (Credit Support Annex)** — phụ lục của ISDA Master quy định ai post tài sản đảm bảo, khi nào, bao nhiêu, và bằng gì. Hiểu CSA mechanics chi tiết là điều tách một XVA quant khỏi một người chỉ biết công thức.

Có hai loại margin, phục vụ hai mục đích khác nhau. **Variation Margin (VM)** là tiền mặt (hoặc tài sản) mà bên đang "thua" chuyển cho bên đang "được", theo mark-to-market hằng ngày, để san phẳng MTM về ~0 mỗi ngày. Nếu VM hoàn hảo (post đủ, mỗi ngày, không ngưỡng), exposure lý thuyết bằng 0 — vì bất cứ giá trị dương nào cũng đã được collateralize. **Initial Margin (IM)** là một khoản đệm thêm, post ngay từ đầu và duy trì suốt đời deal, để phủ đúng khoảng rủi ro mà VM bỏ sót. IM được cả hai bên post vào một tài khoản tách biệt (segregated), không được tái sử dụng.

Câu hỏi là: nếu VM san phẳng MTM mỗi ngày, tại sao vẫn còn exposure và cần IM? Câu trả lời là **MPoR — Margin Period of Risk**. Khi counterparty default, không có phép màu nào cho ta đóng vị thế tức thì. Có một khoảng trễ thực tế: từ lần post VM cuối cùng (counterparty ngừng trả margin call), qua thời gian ta nhận ra họ default, gửi thông báo, chờ grace period pháp lý, rồi mới ra thị trường re-hedge hoặc thanh lý vị thế. Khoảng này chuẩn ngành là **10 ngày làm việc** cho các deal cleared/collateralized song phương (dài hơn cho các portfolio phức tạp hoặc illiquid). Trong 10 ngày đó, MTM tiếp tục dao động mà không có VM mới về, nên exposure còn lại chính là **biến động của netting set trong MPoR**, cộng thêm các ma sát trong CSA: **threshold** (mức MTM dưới đó không ai phải post), **MTA (Minimum Transfer Amount)** (số tiền tối thiểu của một lần chuyển, để tránh chuyển vụn), và **rounding**.

Ta có thể ước lượng exposure collateralized bằng số, và đây là một trong những phép tính quan trọng nhất chương vì nó neo cả IM lẫn MVA về sau. Giả sử netting set có MTM volatility hằng năm $\sigma_V = 10\,\text{M}$ (độ lệch chuẩn của thay đổi MTM trong một năm). Với horizon MPoR $\delta = 10$ ngày làm việc $\approx 10/250 = 0.04$ năm, độ lệch chuẩn của MTM move trong MPoR là

$$\sigma_V\sqrt{\delta} = 10\times\sqrt{0.04} = 10\times0.2 = 2\text{M}.$$

Exposure kỳ vọng còn lại trong MPoR (kỳ vọng nửa dương của một biến normal tâm 0, đúng công thức $\sigma/\sqrt{2\pi}$ đã dùng ở 14.1) là

$$\text{EE}_{\text{coll}} = \frac{\sigma_V\sqrt{\delta}}{\sqrt{2\pi}} = 2\times0.399 = 0.80\text{M}.$$

So với EE không collateral đỉnh 2.3M, VM đã cắt exposure kỳ vọng xuống ~0.8M — nhưng chưa về 0, và đúng bằng lượng mà IM phải phủ. IM thường được đặt ở một quantile cao (99%) của MTM move trong MPoR:

$$\text{IM} \approx 2.33\times\sigma_V\sqrt{\delta} = 2.33\times2 = 4.66\text{M},$$

trong đó 2.33 là quantile 99% một phía của phân phối normal chuẩn ($N^{-1}(0.99)=2.326$). Nếu IM = 4.66M và MTM move trong MPoR chỉ vượt IM ở đuôi 1% các kịch bản, thì exposure sau khi trừ cả VM lẫn IM gần như bằng 0 trong 99% trường hợp — đó chính là lý do IM tồn tại. Con số **IM = 4.66M** này ta sẽ mang thẳng sang MVA (mục 14.7) làm điểm neo, thay vì bịa một giá trị IM mới.

Threshold và MTA thêm một tầng exposure còn lại ngay cả khi VM chạy. Nếu CSA có threshold $H = 1\,\text{M}$ (không ai post cho đến khi MTM vượt 1M) thì exposure luôn "chứa sẵn" tối đa 1M chưa được collateralize, cộng với MTA. Một CSA "clean" (threshold 0, MTA nhỏ, VM hằng ngày, cùng loại tiền) là chuẩn hiện đại; các CSA cũ với threshold cao là di sản làm CVA phình lên. Chi tiết loại collateral cũng quan trọng: nếu được post nhiều loại tiền/tài sản, bên post giữ **cheapest-to-deliver optionality** (chọn thứ rẻ nhất để giao), và lãi trả trên collateral có thể khác OIS — đây là nguồn gốc của ColVA (mục 14.9).

## 14.4 Kiến trúc tính XVA — Monte Carlo ba tầng

Với netting set phải mô phỏng đồng thời và collateral phải mô phỏng theo cơ chế, kiến trúc tính XVA hội tụ về một pipeline ba tầng mà mọi bank lớn đều dùng, và đúng hình dạng của `src/xva`. Ba tầng — scenario, reprice, aggregate — mỗi tầng có một đặc điểm chi phí và một cạm bẫy riêng.

**Tầng 1 — Scenario generation.** Mô phỏng mọi risk factor của netting set (curve theo Hull-White 1F/2F hoặc LMM, FX theo GBM hay local vol đơn giản, equity, credit spreads, inflation...) trên một lưới thời gian ~50–100 điểm trải đến maturity xa nhất, với vài nghìn đến vài chục nghìn paths. Điểm mấu chốt: XVA là **pricing**, không phải risk management "thật", nên mô phỏng phải **calibrate risk-neutral** ($\mathbb{Q}$-measure) — các martingale property phải giữ, forward phải khớp curve, không được dùng drift thực P. Correlation giữa các factor cài qua Cholesky decomposition của ma trận tương quan. Đây là tầng nhẹ nhất về CPU nhưng nặng nhất về model risk: một sai lệch drift nhỏ tích lũy qua 10 năm sẽ làm lệch toàn bộ profile exposure.

**Tầng 2 — Portfolio valuation (reprice).** Reprice mọi deal của netting set tại mỗi node của lưới, trên mỗi path. Đây là chỗ nổ chi phí. Đếm cụ thể trên deal running mở rộng thành portfolio: $10^4$ paths $\times\ 10^2$ dates $\times\ 10^4$ deals $= 10^{10}$ lần định giá cho **một** lần chạy XVA của **một** counterparty — và một bank có hàng nghìn counterparty. Không thể chạy full smile model của front-office cho mỗi lần đó. Ngành giải bằng hai cách. Một là dùng model rẻ, closed-form khi có (swap, FX forward định giá analytic tức thì, mỗi lần chỉ vài phép nhân). Hai là **proxy/regression**: với các deal exotic hay Bermudan cần Monte Carlo lồng, ta không chạy MC-trong-MC (nested, chi phí nhân thêm $10^4$ nữa thành $10^{14}$, bất khả thi) mà fit một hàm hồi quy — Longstaff-Schwartz style, hoặc gần đây là neural network proxies — ánh xạ từ state variables trên path sang giá deal. Đây đúng là vai của `src/proxy` trong repo (differential ML, Chebyshev, MLP). American Monte Carlo (Chương 12) và XVA dùng chung một ý tưởng: thay conditional expectation đắt bằng regression rẻ.

**Tầng 3 — Aggregation.** Trên mỗi path, mỗi date: net toàn bộ deal thành một MTM, áp cơ chế collateral (mô phỏng VM với MPoR trễ, IM nếu có), ra exposure path-wise $E_t$. Rồi lấy kỳ vọng qua các path để có EE profile, và tính các tích phân XVA. Cạm bẫy ở đây là **mô phỏng collateral đúng cách**: phải giả lập độ trễ MPoR (VM tại $t$ phản ánh MTM tại $t-\delta$, không phải tại $t$), nếu không sẽ đánh giá thấp exposure một cách hệ thống — một lỗi kinh điển làm CVA của deal collateralized ra gần 0 một cách sai lầm.

## 14.5 CVA — điều chỉnh vì counterparty có thể chết

CVA (Credit Valuation Adjustment) là chữ đầu tiên và cổ nhất của bảng chữ cái, điều chỉnh giá xuống vì counterparty có thể chết trong khi ta đang được. Ta dẫn xuất công thức từ nguyên lý first-principles. Loss xảy ra nếu và chỉ nếu counterparty default tại thời điểm $\tau \le T$ **và** exposure tại đó dương. Loss đó là $(1-R)\,E_\tau$, chiết khấu về hôm nay bằng $D(0,\tau)$. CVA là kỳ vọng risk-neutral của loss chiết khấu này:

$$\text{CVA} = \mathbb{E}^{\mathbb{Q}}\left[(1-R)\,D(0,\tau)\,E_\tau\,\mathbf{1}_{\tau\le T}\right].$$

Để biến kỳ vọng trên biến default $\tau$ thành một tích phân theo thời gian, ta gọi $Q_{\text{def}}(t)$ là xác suất default tích lũy đến $t$ (từ CDS curve, risk-neutral), và giả định — chuẩn ngành, đơn giản hóa — rằng exposure độc lập với thời điểm default (giả định này bị phá bởi wrong-way risk, mục 14.8). Khi đó lấy kỳ vọng có điều kiện theo $\tau$ và tích phân theo phân phối của $\tau$:

$$\text{CVA} = (1-R)\int_0^T \mathbb{E}^{\mathbb{Q}}\left[D(0,t)\,E_t \mid \tau = t\right]\, dQ_{\text{def}}(t) \;\approx\; (1-R)\sum_j \text{EE}^*(t_j)\,\Delta Q_{\text{def}}(t_j),$$

trong đó $\text{EE}^*(t_j) = \mathbb{E}^{\mathbb{Q}}[D(0,t_j)E_{t_j}]$ là discounted expected exposure trên bucket $j$, và $\Delta Q_{\text{def}}(t_j) = Q_{\text{def}}(t_j) - Q_{\text{def}}(t_{j-1})$ là xác suất default rơi vào bucket đó. Đọc công thức bằng lời: "expected exposure có trọng số xác suất default, chiết khấu, nhân với loss-given-default". Default probability lấy từ **CDS curve** (risk-neutral, không phải xác suất thực) khi counterparty có CDS thanh khoản; khi không có, phải **proxy mapping** theo rating/sector/region — một nghiệp vụ có thật, đầy tranh cãi, và là nguồn model risk lớn (một counterparty không có CDS được gán spread của một "comparable" — chọn comparable sai thì CVA sai). Giá bán cho client = giá sạch + CVA, mà desk gọi là "credit charge".

**CVA tính tay từ bảng EE ở 14.1.** Counterparty có hazard rate $\lambda = 2\%$, recovery $R = 40\%$. Xác suất survival đến năm $i$ là $S(i) = e^{-\lambda i}$, nên xác suất default rơi vào đúng năm thứ $i$ (giữa cuối năm $i-1$ và cuối năm $i$) là

$$\Delta Q_i = S(i-1) - S(i) = e^{-0.02(i-1)} - e^{-0.02 i} = e^{-0.02(i-1)}\left(1 - e^{-0.02}\right).$$

Thừa số $1 - e^{-0.02} = 1 - 0.98020 = 0.01980 \approx 1.98\%$, còn thừa số $e^{-0.02(i-1)}$ (xác suất còn sống đến đầu năm $i$) giảm dần từ 1 ở năm 1 xuống $e^{-0.18}=0.835$ ở năm 10. Nhân ra, marginal default probability mỗi năm không phẳng mà **giảm dần**: $\Delta Q_1 = 1.98\%$, $\Delta Q_5 = 1.83\%$, $\Delta Q_{10} = 1.65\%$; trung bình cộng qua 10 năm là $\overline{\Delta Q} = 1.81\%$. Đây là một điểm dễ sai của junior: hazard rate hằng số **không** cho default probability hằng số, vì survival probability đứng trước bào mòn nó theo thời gian.

Loss-given-default là $1 - R = 0.6$. Tổng EE qua 10 năm là $\sum_i \text{EE}_i = 1.2+1.8+2.1+2.2+2.3+2.0+1.6+1.1+0.6+0.2 = 15.1\,\text{M}$. Có hai cách gộp, và ta làm cả hai để thấy sai số của xấp xỉ. Cách chính xác hơn là nhân từng $\text{EE}_i$ với $\Delta Q_i$ đúng của năm đó rồi cộng (bỏ discounting):

$$\text{CVA}_{\text{no-disc}} = (1-R)\sum_{i=1}^{10}\text{EE}_i\,\Delta Q_i = 0.6 \times \big(1.2\cdot0.0198 + \dots + 0.2\cdot0.0165\big) \approx 0.167\text{M}.$$

Cách xấp xỉ nhanh — dùng một $\Delta Q$ đại diện $\approx 1.9\%$ (giữa đầu và cuối, hơi nghiêng về đầu vì exposure lớn nhất ở giữa-đầu deal nơi $\Delta Q$ còn cao) — cho

$$\text{CVA} \approx 0.6 \times 15.1 \times 0.019 \approx 0.172\text{M}.$$

Hai con số nằm sát nhau (0.167M vs 0.172M, lệch 3%); ta lấy **CVA $\approx$ 0.172M** làm con số neo của cả sách (đã gặp ở phần running-example). Đó là **17bp trên notional 100M**. Nếu tính thêm discounting (chiết khấu mỗi bucket về hôm nay theo curve ~4%, discount factor trung bình qua đời deal $\approx 0.82$), CVA giảm ~15% xuống

$$\text{CVA}_{\text{disc}} \approx 0.6\sum_i \text{EE}_i\,\Delta Q_i\,D(0,t_i) \approx 0.142\text{M} \approx 14\text{bp}.$$

Ngành thường báo cả con số undiscounted (bảo thủ hơn) lẫn discounted; ta giữ 17bp làm mốc chính vì nó khớp running-example và dễ nhớ, nhưng nhớ rằng discounting kéo nó xuống ~14bp.

Đọc con số: để bán swap này cho counterparty đó mà không lỗ, giá phải cộng ~17bp upfront (tương đương ~2bp/năm chạy đều) so với giá "sạch". Với biên lợi nhuận của một swap desk cỡ 0.5–2bp, CVA **không phải số lẻ** — nó lớn hơn cả margin, và nó quyết định deal lời hay lỗ. Đây là bài học đắt giá nhất của giai đoạn hậu-2008: một trader có thể "kiếm" 2bp margin trên một swap mà không nhận ra mình vừa "cho" 17bp credit risk — deal âm 15bp ngay khi ký.

Bây giờ so với cùng deal nhưng có **CSA đầy đủ**. Từ mục 14.3, VM hằng ngày với threshold 0 cắt exposure kỳ vọng từ đỉnh 2.3M xuống ~0.8M chỉ còn là biến động trong MPoR — thực tế còn thấp hơn vì MPoR chỉ 10 ngày cho toàn bộ đời deal thay vì diffusion tích lũy nhiều năm. Nếu EE collateralized phẳng ở ~0.8M thay vì bướu lên 2.3M, CVA scale gần như tuyến tính theo EE nên giảm cỡ $2.3/0.8 \approx 3$ lần chỉ từ việc hạ đỉnh, và giảm thêm nữa vì cả profile co lại — tổng hợp CVA collateralized còn **~1bp** thay vì 17bp. Đây chính là lý do kinh tế khiến collateralization phủ khắp thị trường sau 2008: mỗi bp CVA tiết kiệm được là lợi nhuận trực tiếp, và regulators cũng đẩy mạnh clearing/margining. Một dòng chảy nhân quả sạch: MPoR ngắn hơn $\to$ exposure nhỏ hơn $\to$ CVA nhỏ hơn $\to$ giá cạnh tranh hơn.

## 14.6 DVA và FVA — tấm gương và con voi trong phòng

**DVA (Debit Valuation Adjustment)** là ảnh gương của CVA: điều chỉnh **có lợi** cho ta vì *chính ta* cũng có thể chết. Nếu ta default khi đang nợ counterparty ($V_t < 0$, tức exposure của họ với ta dương), ta cũng chỉ trả recovery — về mặt kinh tế đó là một khoản "lãi" cho ta. Công thức đối xứng hoàn hảo với CVA, chỉ đổi vai: dùng nửa **âm** của MTM ($E_t^{\text{own}} = (-V_t)^+$) và xác suất default của **chính ta**:

$$\text{DVA} = (1-R_{\text{own}})\sum_j \mathbb{E}^{\mathbb{Q}}[D(0,t_j)\,(-V_{t_j})^+]\,\Delta Q_{\text{def}}^{\text{own}}(t_j).$$

**DVA bằng số.** Giữ đúng deal running, nhưng nhìn từ phía ngược lại. Phần âm của MTM có profile gần đối xứng với phần dương nhưng nhỏ hơn chút (bank là bên payer nên MTM nghiêng dương khi lãi suất tăng), lấy tổng expected negative exposure $\sum_i (-V_i)^+ \approx 12\,\text{M}$ qua 10 năm. Bank là một credit tốt hơn counterparty: own hazard $\lambda_{\text{own}} = 0.5\%$, $R_{\text{own}} = 40\%$. Marginal default own mỗi năm, cũng theo công thức $1-e^{-\lambda}$, là $\Delta Q^{\text{own}} = 1 - e^{-0.005} = 1 - 0.99501 = 0.499\%$. Vậy

$$\text{DVA} \approx (1-R_{\text{own}})\sum_i (-V_i)^+\,\Delta Q^{\text{own}} \approx 0.6 \times 12 \times 0.00499 \approx 0.036\text{M} = 3.6\text{bp}.$$

DVA nhỏ hơn CVA (17bp) vì hai lý do cộng dồn: bank ở đây có credit tốt hơn counterparty (hazard 0.5% so với 2%, tức khoảng bốn lần nhỏ hơn) và exposure âm (12M) nhỏ hơn exposure dương (15.1M). Nhưng nó không phải số không: nó kéo giá thật lên 3.6bp, và đó chính là chỗ gây tranh cãi tiếp theo.

DVA gây tranh cãi triết học vì nó tạo ra hiện tượng nghịch lý: khi tín dụng của chính bank xấu đi (spread của bank rộng ra, $\lambda_{\text{own}}$ tăng), DVA tăng, và bank ghi nhận **lãi** kế toán. Nhiều bank đã báo lãi hàng tỷ đô trong quý mà credit của họ tệ đi — một tín hiệu ngược đời. Accounting (IFRS 13, US GAAP) công nhận DVA, nhưng vấn đề thực tế là **không hedge được sạch**: cách duy nhất để monetize DVA là mua CDS trên chính mình, điều bất khả (hoặc mua CDS của một bank tương tự làm proxy, rất không hoàn hảo). Vì thế nhiều bank quản lý DVA như một phần của FVA thay vì một chữ độc lập — điều này dẫn ta đến chữ gây sốc nhất.

**FVA (Funding Valuation Adjustment)** là chi phí funding của một deal không (đủ) collateral, và là phát hiện đã làm rung chuyển ngành 2012–2014. Cơ chế thế này: một deal khách không post collateral, nhưng để hedge nó ta phải làm một deal đối ứng trên thị trường có collateral (cleared hoặc CSA), mà deal hedge đó **đòi ta post VM bằng tiền mặt**. Khi hedge của ta lãi, ta nhận VM (tốt); khi hedge của ta lỗ, ta phải post VM mà không nhận gì tương ứng từ khách — ta phải **vay** tiền đó ở funding spread của bank. Sự bất đối xứng "deal khách không post, hedge phải post" tạo ra một chi phí funding ròng suốt đời deal. FVA gần đúng bằng tích phân của expected exposure hai chiều nhân funding spread: FCA (Funding Cost Adjustment, trên phần ta phải fund) và FBA (Funding Benefit Adjustment, trên phần ta nhận funding) — DVA chính là một phần của FBA khi đo cẩn thận, nên tính cả hai riêng sẽ double-count.

Có một cuộc chiến học thuật nổi tiếng ở đây. Hull và White lập luận rằng FVA **không nên** đưa vào giá (theo lý thuyết định giá risk-neutral chuẩn, funding cost của bank không phải là một risk factor của deal — nó là chi phí của bank, không của tài sản). Practitioners phản bác: trong thực tế funding không miễn phí, và một giá không tính FVA sẽ để trader bán deal dưới chi phí thật. Cuộc chiến đã ngã ngũ trong thực tiễn — **mọi bank lớn đều book FVA**. Cột mốc: JPMorgan năm 2014 gây sốc khi trích **\$1.5 tỷ FVA** trong một quý, xác nhận rằng con voi trong phòng có thật và lớn.

**FVA bằng số trên cùng portfolio.** Công thức đúng là một tích phân của expected exposure nhân funding spread — chỉ **một** thừa số thời gian, vì $T$ đã nằm sẵn trong phép cộng dồn EE qua các năm:

$$\text{FVA} \approx s_F\int_0^T \text{EE}(t)\,dt \approx s_F\sum_{i=1}^{10}\text{EE}_i\,\Delta t_i, \qquad \Delta t_i = 1\text{ năm}.$$

Tích phân EE (diện tích dưới profile) chính là $\sum_i \text{EE}_i \times 1 = 15.1\,\text{M}$·năm — **tổng** cột EE, không phải trung bình (đây là chỗ FVA khác CVA: CVA cân EE bằng $\Delta Q \sim 1.9\%$ mỗi năm, còn FVA cân EE bằng $s_F \times 1$ năm). Với funding spread của một bank credit tốt $s_F = 50\,\text{bp}$ $= 0.005$:

$$\text{FVA} \approx 0.005 \times 15.1 = 0.0755\text{M} \approx 7.5\text{bp}.$$

Ở mức funding spread 50bp này, FVA (7.5bp) thực ra **nhỏ hơn** CVA (17bp) trên counterparty $\lambda=2\%$ — đó là số học trung thực, và nó dạy ta rằng "FVA lớn hay nhỏ" không phải hằng số mà là hàm của **funding spread**. Câu chuyện 2012–2014 chấn động vì với các bank khi đó — credit đã xấu đi sau khủng hoảng, funding spread có thể **500bp** chứ không phải 50bp — cùng portfolio này cho

$$\text{FVA} \approx 0.05 \times 15.1 = 0.755\text{M} \approx 75\text{bp},$$

lớn gấp hơn bốn lần CVA. Đó mới là con số đã làm ngành choáng váng: với một counterparty **chất lượng tốt** ($\lambda$ nhỏ, CVA nhỏ) nhưng **không có CSA**, và với một bank **funding đắt**, chi phí *funding* mới là gánh nặng thật, không phải chi phí *default*. Bài học kép: (1) FVA scale tuyến tính với chính funding spread của bank — nó là chi phí của *bank*, không của deal, nên hai bank khác nhau định giá cùng deal khác nhau; (2) với deal dài, funding drag tích lũy qua toàn bộ diện tích EE có thể vượt xa default risk một lần. Trực giác nắm được: CVA scale với $\lambda \times \text{exposure}$ (default risk); FVA scale với funding spread $\times$ diện-tích-EE-theo-thời-gian (funding drag mỗi ngày deal còn sống) — cả hai chỉ có **một** thừa số thời gian, đúng với công thức tích phân ở trên.

## 14.7 MVA — chi phí funding Initial Margin, và bài toán nested SIMM

**MVA (Margin Valuation Adjustment)** là chi phí funding **Initial Margin** suốt đời deal. Nhớ từ mục 14.3: IM bị post vào tài khoản segregated, "nhốt" lại, nhận lãi thấp (thường OIS) trong khi bank phải fund nó ở funding spread cao hơn — chênh lệch đó, tích lũy qua thời gian trên toàn bộ IM tương lai, là MVA:

$$\text{MVA} = \int_0^T s_F(t)\,\mathbb{E}^{\mathbb{Q}}\!\left[D(0,t)\,\text{IM}(t)\right]dt \approx s_F\sum_j \mathbb{E}^{\mathbb{Q}}[D(0,t_j)\,\text{IM}(t_j)]\,\Delta t_j.$$

MVA là chữ **nặng tính toán nhất** của cả bảng chữ cái, và lý do là chữ $\text{IM}(t)$ bên trong kỳ vọng. IM cho các deal non-cleared song phương được tính bằng **SIMM (Standard Initial Margin Model)** của ISDA (chi tiết trong Chương 15 về FRTB, vì SIMM dùng khung sensitivity tương tự). SIMM lấy các **sensitivities** (delta, vega, curvature theo từng risk factor) của netting set, nhân với risk weights, gộp qua correlation, ra một con số IM. Vấn đề: để tính $\text{IM}(t_j)$ trên một path tại thời điểm tương lai $t_j$, ta cần **sensitivities của portfolio tại $t_j$ trên path đó** — tức là ta cần định giá lại và lấy đạo hàm của portfolio ở một điểm tương lai bên trong mô phỏng. Đó là một bài toán **nested**: mô phỏng bên ngoài sinh path, và tại mỗi node ta cần một "mini-pricing + mini-sensitivity" — nếu làm brute-force MC-trong-MC thì chi phí là $10^4 \times 10^2 \times (\text{MC con để lấy sensitivity})$, hoàn toàn bất khả thi.

Ngành giải bằng hai vũ khí. Một là **regression forecast của IM**: fit một hàm từ state variables trên path sang giá trị SIMM tương lai (giống proxy ở 14.4, nhưng target là IM chứ không phải giá). Hai là **AAD (Adjoint Algorithmic Differentiation)**: tính toàn bộ sensitivity của portfolio trong một lần pass ngược với chi phí ~vài lần một lần định giá, thay vì bump từng risk factor. AAD (Chương 12) biến việc lấy hàng trăm delta từ "không khả thi" thành "khả thi", và MVA là ứng dụng killer của nó. Trong `quantc`, đây là các module `simm`, `mva`, và `dynamic-im` — chữ "dynamic" nhấn mạnh rằng IM không tĩnh mà tiến hóa theo path, phải được dự phóng chứ không lấy giá trị hôm nay.

**MVA bằng số, với average IM dẫn xuất chứ không đoán.** Ta tái sử dụng con số IM đã dẫn xuất ở 14.3: IM ban đầu $\text{IM}_0 = 2.33\times\sigma_V\sqrt{\delta} = 4.66\,\text{M}$. IM không tĩnh: nó co lại khi deal ngắn đi, vì MTM volatility của netting set $\sigma_V$ scale theo residual duration của swap, và IM $\propto \sigma_V\sqrt{\delta}$. Nếu duration còn lại giảm gần tuyến tính (đặc trưng của swap amortize) thì $\sigma_V(t) \propto (T-t)$, nhưng vì IM đi kèm một đặc tính căn-bậc-hai-của-thời-gian trong cách SIMM tổng hợp, một xấp xỉ tốt là $\text{IM}(t) \approx \text{IM}_0\sqrt{(T-t)/T}$. Trung bình theo thời gian của hàm này là

$$\overline{\text{IM}} = \frac{1}{T}\int_0^T \text{IM}_0\sqrt{\tfrac{T-t}{T}}\,dt = \text{IM}_0\cdot\frac{2}{3} = 4.66\times0.667 \approx 3.1\text{M}.$$

(Nếu IM giảm tuyến tính hoàn toàn thì trung bình là $\text{IM}_0/2 = 2.33\,\text{M}$; con số thực nằm giữa, ~3M — ta lấy $\overline{\text{IM}} \approx 3\,\text{M}$.) Với funding spread $s_F = 50\,\text{bp}$ và deal 10 năm, bỏ discounting cho gọn:

$$\text{MVA} \approx s_F \times \overline{\text{IM}} \times T = 0.005 \times 3\text{M} \times 10 = 0.15\text{M} = 15\text{bp}.$$

MVA (15bp) ở đây cùng cỡ CVA và lớn hơn FVA ở kịch bản funding rẻ — nhưng với các portfolio derivative lớn phải post IM song phương (từ khi Uncleared Margin Rules có hiệu lực), tổng IM có thể hàng tỷ, và MVA trở thành một dòng chi phí đáng kể — đủ để làm một số bank rút khỏi các business uncollateralized. MVA là "state of the art" của XVA engineering hiện nay: nó gộp mọi thách thức tính toán (nested, sensitivity tương lai, AAD, regression) vào một bài toán.

## 14.8 Wrong-Way Risk — khi exposure và default cùng tăng

CVA ở 14.5 giả định exposure độc lập với thời điểm default. Đời thực phá vỡ giả định đó, và cách nó phá vỡ có thể tốt hoặc chết người. **Wrong-Way Risk (WWR)** là khi exposure của ta với counterparty **tương quan dương** với xác suất default của họ — nghĩa là đúng lúc ta được nhiều nhất (exposure cao) cũng là lúc họ dễ chết nhất. Đó là kịch bản tệ nhất: mua bảo hiểm từ một công ty sẽ phá sản đúng lúc bạn cần bồi thường. Ngược lại là **right-way risk** (exposure cao khi họ khỏe), làm giảm CVA.

Ví dụ kinh điển của WWR: mua một put option trên chính cổ phiếu của counterparty (khi cổ phiếu rơi, put của bạn tăng giá trị — exposure cao — nhưng đó cũng là lúc counterparty gặp khó khăn — default risk cao). Hoặc mua CDS bảo hiểm cho một tên có tương quan với sức khỏe của người bán CDS. Nhưng ví dụ **bằng xương bằng thịt** là **monoline và AIG 2008**. Các monoline insurer và AIG Financial Products đã bán bảo hiểm (CDS protection) trên hàng núi mortgage-backed securities. Khi thị trường nhà đất sụp, giá trị của protection mà các bank mua từ AIG tăng vọt (exposure của bank với AIG tăng) — nhưng chính lượng protection khổng lồ mà AIG đã bán là thứ giết AIG (default risk của AIG tăng vọt). Exposure và default cùng bùng lên: WWR ở dạng thuần khiết và thảm khốc nhất. Các bank tưởng mình được bảo hiểm, nhưng người bảo hiểm chết đúng lúc bảo hiểm đáng giá nhất — và chỉ được cứu nhờ chính phủ Mỹ bơm \$182 tỷ vào AIG.

Model hóa WWR có hai cách chính. Cách trực tiếp: **correlate hazard rate với các risk factor** trong simulation — ví dụ cho hazard rate $\lambda_t$ của counterparty phụ thuộc vào chính risk factor điều khiển exposure (cùng một Brownian, hệ số tương quan $\rho > 0$). Cách gián tiếp và thanh lịch hơn: dùng **copula** nối phân phối của exposure và của thời điểm default, với một tham số tương quan.

Định lượng tác động bằng một **alpha multiplier**: nhân CVA độc lập với một hệ số $\alpha$ phản ánh WWR. Con số alpha đến từ đâu? Nó được **calibrate từ conditional expected exposure** — ta so exposure kỳ vọng *có điều kiện counterparty default* với exposure kỳ vọng *vô điều kiện*:

$$\alpha = \frac{\mathbb{E}[E_\tau \mid \text{default tại }\tau]}{\mathbb{E}[E_\tau]}.$$

Trong mô hình correlate hazard–exposure, $\alpha$ là hàm tăng theo $\rho$; ước lượng bằng cách chạy hai lần Monte Carlo (một có điều kiện trên các path dẫn tới default, một không) rồi lấy tỷ số, hoặc suy ra từ một copula đã calibrate. **Cụ thể trên deal running:** giả sử với một $\rho$ vừa phải điển hình cho tên có liên hệ ngành, các path dẫn tới default của counterparty có expected exposure trung bình 2.0M (cao hơn vì lãi suất diễn biến theo hướng vừa làm ta được vừa làm counterparty yếu), so với EPE vô điều kiện 1.51M. Khi đó

$$\alpha = \frac{2.0}{1.51} \approx 1.3, \qquad \text{CVA}_{\text{WWR}} = \alpha\cdot\text{CVA}_{\text{indep}} \approx 1.3\times17 \approx 22\text{bp}.$$

WWR đội thêm 5bp lên credit charge — không nhỏ so với margin của desk. Regulators cũng cố định một sàn $\alpha = 1.4$ trong khung SA-CCR như một cách áp WWR/model risk một cách bảo thủ khi bank không tự tính. Regulators **bắt buộc** xét WWR (specific WWR khi có liên kết pháp lý/cấu trúc rõ ràng phải xử lý đặc biệt), và mọi khung XVA nghiêm túc — bao gồm `src/xva/wwr` — phải có nó. Cạm bẫy: WWR gần như không hedge được (bạn không thể hedge tương quan giữa exposure và default một cách thanh khoản), nên nó thường được giữ lại và trích dự phòng, đúng như bài học AIG.

## 14.9 KVA và ColVA — vốn và các điều khoản collateral phi chuẩn

**KVA (Capital Valuation Adjustment)** là chi phí của **vốn chủ sở hữu** mà bank phải giữ để chống lưng cho deal suốt đời nó. Regulators bắt bank giữ vốn cho counterparty credit risk (CCR), cho CVA risk (CVA capital charge — thêm vào bởi Basel III), và cho market risk (FRTB, Chương 15). Vốn đó không miễn phí: cổ đông đòi một tỷ suất sinh lời trên vốn (ROE, hurdle ~10–15%), và mỗi đồng vốn bị deal chiếm dụng là một đồng không sinh lời ở nơi khác. KVA là hiện giá của chi phí carry vốn đó:

$$\text{KVA} = \int_0^T \gamma_K\,\mathbb{E}^{\mathbb{Q}}\!\left[D(0,t)\,\text{Capital}(t)\right]dt,$$

với $\gamma_K$ là hurdle rate (cost of capital). **KVA bằng số, tách rõ từng bước.** Capital chiếm dụng cho một swap uncollateralized tỷ lệ thô với exposure, nên với deal running (EPE 1.51M, PFE đỉnh 6.2M), một mức vốn chiếm dụng trung bình $\overline{\text{Capital}} \approx 4\,\text{M}$ qua đời deal là hợp lý (nằm giữa EPE và PFE, phản ánh các risk-weight của cả CCR lẫn CVA capital). Hurdle $\gamma_K = 12\%$, deal 10 năm. Con số **thô, chưa discount và chưa tính capital amortize** là

$$\text{KVA}_{\text{raw}} = \gamma_K \times \overline{\text{Capital}} \times T = 0.12 \times 4 \times 10 = 4.8\text{M}.$$

Nhân với discount factor trung bình qua đời deal (curve ~4%, DF trung bình $\approx 0.8$):

$$\text{KVA}_{\text{discounted}} = 4.8 \times 0.8 = 3.84\text{M}.$$

Và nếu tính thêm việc **capital giảm dần** khi deal amortize (vốn chiếm dụng co lại theo exposure, nên $\overline{\text{Capital}}=4\,\text{M}$ là ước lượng trên — capital thực trung bình thấp hơn), con số cuối thực tế cỡ **2–3M**, tức 200–300bp trên notional. Ba con số này không mâu thuẫn mà là ba tầng tinh chỉnh: 4.8M là raw (không discount, capital cố định), 3.84M là sau discount, và 2–3M là sau cả discount lẫn amortization. KVA có thể là chữ **lớn nhất** cho deal dài, vốn nặng — ở đây nó lớn gấp hơn mười lần CVA. KVA đòi dự phóng capital requirement trên mọi path (chính nó cần mô phỏng cả FRTB và CVA capital tương lai, nested như MVA), nên nó là chữ **chuẩn hóa kém nhất** — mỗi bank tính hơi khác, và có tranh luận liệu KVA có nên vào giá hay chỉ vào hurdle của desk. Nhưng dù tính thế nào, KVA quyết định câu hỏi tối hậu: **deal này có đáng làm không?** Một deal có margin dương nhưng KVA nuốt hết margin là một deal phá hủy giá trị cổ đông.

**ColVA (Collateral Valuation Adjustment)** gom mọi hiệu ứng của điều khoản collateral phi chuẩn mà mô hình CSA "sạch" bỏ qua. Nếu collateral nhận lãi khác OIS (ví dụ một spread dưới OIS), có một chi phí/lợi ích carry. **ColVA bằng số.** Giả sử một CSA cũ trả lãi trên cash collateral ở mức **OIS − 10bp** (bên nhận collateral hưởng chênh 10bp), và netting set duy trì trung bình 2M collateral qua đời deal 10 năm. Carry ColVA là

$$\text{ColVA} \approx (\text{spread dưới OIS}) \times \overline{\text{Collateral}} \times T = 0.001 \times 2\text{M} \times 10 = 0.02\text{M} = 20{,}000\ \text{USD},$$

tức ~2,000 USD/năm — nhỏ so với các chữ lớn, nhưng trên một book hàng nghìn CSA đa tiền tệ thì cộng dồn thành con số thật. Nếu CSA cho phép post nhiều loại tiền, bên post có **cheapest-to-deliver optionality** — họ luôn chọn loại rẻ nhất để giao, tạo ra một option value mà bên nhận phải định giá (một optionality nhỏ nhưng dương, làm ColVA lệch thêm về phía bất lợi cho bên nhận collateral). Nếu collateral là chứng khoán chứ không phải tiền mặt, có haircut và rehypothecation. ColVA nhỏ hơn các chữ lớn nhưng không tầm thường với các CSA cũ, đa tiền tệ. Đây là chữ đòi hiểu CSA sâu nhất — nó là nơi legal document gặp valuation.

**Gộp toàn bộ trên deal running — XVA waterfall.** Đây là điểm hội tụ của cả chương: mọi con số đã tính, đặt cạnh nhau, biến giá sạch thành giá thật. Vì các chữ áp cho các chế độ collateral khác nhau (CVA/DVA/FVA cho deal uncollateralized; MVA cho deal có IM song phương; KVA/ColVA là add-on chế độ riêng), ta trình bày theo lớp thay vì cộng bừa vào một số:

| Adjustment | Giá trị | bp/notional | Dấu | Áp cho chế độ |
|---|---|---|---|---|
| CVA | −0.172M | −17 | giảm giá | uncollateralized |
| DVA | +0.036M | +3.6 | tăng giá | uncollateralized |
| FVA ($s_F$=50bp) | −0.076M | −7.5 | giảm giá | uncollateralized |
| **Cộng lõi credit+funding** | **−0.212M** | **−20.9** | | uncollateralized |
| MVA ($s_F$=50bp) | −0.15M | −15 | giảm giá | bilateral IM (UMR) |
| ColVA | −0.02M | −0.2 | giảm giá | CSA phi chuẩn |
| KVA (discounted) | ~−2.5M | ~−250 | giảm giá | mọi chế độ (hurdle) |

Đọc bảng: với deal uncollateralized thuần, ba chữ credit+funding kéo giá xuống ~21bp — đủ lớn để nuốt trọn margin 0.5–2bp của một swap desk nhiều lần. Nếu deal phải post IM song phương thì MVA đội thêm 15bp. Và KVA — nếu đưa vào giá — là một order of magnitude lớn hơn tất cả (250bp), phản ánh rằng với deal dài không collateral, chính **vốn quy định** mới là chi phí thống trị, không phải default hay funding. Con số cuối cùng, không phải giá Black-Scholes, mới là giá mà bank thực sự bán:

$$V_{\text{thật}} = V_{\text{sạch}} - \text{CVA} + \text{DVA} - \text{FVA} - \text{MVA} - \text{KVA} - \text{ColVA}.$$

Pre-deal pricing hiện đại chạy **real-time** toàn bộ chuỗi này khi sales chào giá — cái mà desk gọi là "XVA quote".

## 14.10 Incremental XVA và tính phi tuyến của netting

Vì netting làm exposure phi tuyến (mục 14.2), một deal mới không có "XVA riêng" cố định — XVA của nó phụ thuộc vào portfolio đã có với counterparty đó. Đại lượng đúng để định giá deal mới là **incremental XVA**:

$$\Delta\text{XVA} = \text{XVA}(\text{portfolio} + \text{deal}) - \text{XVA}(\text{portfolio}).$$

Tính chất phi tuyến này có hệ quả kinh doanh sâu sắc. Một deal mới **giảm** exposure ròng (vì nó đối ứng với portfolio hiện có) có thể có **incremental CVA âm** — nghĩa là bank nên *trả tiền* client để làm deal đó, vì nó cải thiện netting set. Ngược lại, một deal làm tăng exposure một chiều đã lớn sẽ có incremental CVA rất cao. Ví dụ minh họa bằng số, dùng lại CVA standalone của deal running: portfolio hiện có standalone CVA 172k (bảng 14.5). Thêm một deal đối ứng làm exposure ròng giảm một nửa — CVA mới của toàn portfolio chỉ còn 100k, nên incremental CVA của deal mới là $\Delta\text{CVA} = 100 - 172 = -72\,\text{k}$, **âm**. Cùng deal đó với một client khác chưa có portfolio nào sẽ có CVA dương đầy đủ (172k nếu nó là bản sao của deal running). **Cùng một deal, hai giá XVA khác nhau tùy client** — đây là một trong những phản trực giác đắt giá nhất mà một junior XVA quant phải nuốt.

Hệ quả thứ hai: incremental XVA **phụ thuộc thứ tự**. Nếu ba deal được thêm tuần tự, deal đầu "gánh" nhiều XVA nhất, deal sau hưởng netting benefit — nhưng tổng phải bằng standalone của cả ba cộng lại. Việc phân bổ XVA công bằng về từng deal/từng desk (để tính P&L và bonus) là một bài toán allocation không tầm thường, thường giải bằng **Euler allocation** (phân bổ theo đạo hàm của XVA tổng theo notional từng deal — cộng lại đúng bằng tổng nhờ Euler's theorem cho hàm bậc một thuần nhất: nếu $\text{XVA}(\kappa n_1,\dots,\kappa n_m)=\kappa\,\text{XVA}(n_1,\dots,n_m)$ thì $\sum_i n_i\,\partial\text{XVA}/\partial n_i = \text{XVA}$). Đây là lý do XVA desk phải chạy incremental pre-trade cho mọi deal: không có cách nào biết deal lời hay lỗ nếu không đặt nó vào ngữ cảnh netting set hiện tại.

## 14.11 XVA desk vận hành thế nào — pricing, hedging, hạ tầng

Một XVA desk là một central desk đứng giữa mọi FO desk (rates, FX, credit, equity) và mọi counterparty, và nó vận hành trên ba trục.

**Pricing.** Mọi deal mới chạy qua XVA engine **pre-trade**, tính incremental XVA (mục 14.10) trong thời gian thực khi sales chào giá. Con số này được cộng vào giá FO để ra giá cuối cho client. Đây là dịch vụ nội bộ: FO desk "mua" XVA từ XVA desk, XVA desk nhận rủi ro XVA vào sổ của mình và hedge nó. Mô hình central desk này (thay vì mỗi FO desk tự tính CVA) là chuẩn ngành vì chỉ central desk mới thấy toàn bộ netting set và tính được netting/incremental đúng.

**Hedging.** XVA là một derivative bậc hai (một tích phân của expected exposure, mà exposure lại phụ thuộc mọi risk factor), nên nó có Greeks phức tạp. **CVA delta theo credit spread** hedge bằng CDS single-name hoặc CDS index (mua protection trên chính counterparty, hoặc trên index để hedge systematic credit). **CVA delta theo rates/FX** hedge như một desk rates/FX bình thường (một swap desk quen thuộc với việc hedge IR delta). Nhưng nhiều phần **không hedge được sạch**: DVA (không mua được CDS trên chính mình), WWR correlation, recovery risk, illiquid names không có CDS. Những phần này được giữ lại (warehoused) và trích dự phòng (reserve). CVA desk là nơi lỗ nặng nhất lịch sử: trong 2008, phần lớn "counterparty losses" mà các bank báo cáo **không phải default thật** mà là **mark-to-market của CVA** — spread credit rộng ra làm CVA tăng vọt, ăn thẳng vào P&L, ngay cả khi không counterparty nào thực sự chết. Chính vì thế Basel III thêm **CVA capital charge** — buộc bank giữ vốn cho biến động CVA, không chỉ cho default (và đó chính là nguồn gốc của phần "CVA capital" trong con số KVA ở 14.9).

**Hạ tầng.** XVA là bài toán tính toán khổng lồ, nên hạ tầng là một phần của lời giải. Batch tính lại toàn bộ XVA chạy **qua đêm** trên grid hàng nghìn core (nay là cloud + GPU); intraday chạy incremental cho các deal mới. **AAD** cho XVA Greeks là chuẩn của mọi shop hiện đại — không có AAD thì việc lấy hàng trăm sensitivities (cho hedging và cho MVA/KVA nested) là bất khả thi về thời gian. Kiến trúc tổng: một scenario engine chung, một library repricing chia sẻ với FO (nhưng ở phiên bản rẻ hơn), một aggregation layer xử lý netting/collateral, và một AAD engine chạy xuyên suốt. Đây đúng là hình dạng của `src/xva` trong `quantc`: `netting` và `collateral` cho aggregation, `sa-ccr` cho capital exposure, `simm`/`mva`/`dynamic-im` cho margin, `wwr` cho wrong-way, `kva` cho capital — mỗi module là một chữ cái của một bảng chữ cái mà mười lăm năm trước còn chưa tồn tại, và nay là ranh giới giữa một deal lời và một deal âm thầm phá hủy vốn.

# Chương 15: Vốn quy định

Có một sự thật mà không giáo trình quant nào nên giấu người mới: phần lớn số lượng đầu người Q-quant trên thị trường lao động hôm nay không ngồi nghĩ ra model volatility mới, mà ngồi tính **vốn quy định** (regulatory capital) — tính đúng một con số theo một bản spec dày năm trăm trang, cho hàng triệu position, mỗi đêm, với audit trail đầy đủ để regulator kiểm tra lại được từng bước. Nghe kém hào nhoáng, nhưng đây là nơi tiền lương chảy về nhiều nhất trong desk quant thập kỷ này, và cũng là nơi kiến trúc `src/risk` của một library như `quantc` (FRTB SA + IMA, mọi tham số quy định nằm trong các registry `*-parameters.ts` versioned) phản ánh trực tiếp thực tế nghề nghiệp. Chương này đi từ bức tranh lớn Basel xuống tận công thức aggregation của từng risk measure, và mọi khái niệm đều được đóng đinh bằng một ví dụ tính ra số cụ thể.

## 15.1 Vì sao có vốn quy định — và RWA là gì

Ngân hàng là một cỗ máy đòn bẩy: nó nhận tiền gửi, đi vay ngắn hạn, rồi cho vay và giao dịch dài hạn. Nếu tài sản mất giá đủ nhiều, vốn chủ sở hữu (equity) bốc hơi và ngân hàng vỡ nợ — kéo theo cả hệ thống, vì các ngân hàng nợ lẫn nhau. Regulator do đó yêu cầu mỗi ngân hàng giữ một lớp đệm vốn tối thiểu, đủ để hấp thụ thua lỗ bất ngờ mà không đụng tới tiền của người gửi. Câu hỏi kỹ thuật là: đệm bao nhiêu? Nếu bắt giữ vốn bằng một tỷ lệ cố định của tổng tài sản thì vô lý — một trái phiếu chính phủ Đức và một khoản vay tín chấp rủi ro như nhau sao? Nên Basel phát minh ra **RWA (Risk-Weighted Assets)**: mỗi tài sản được nhân một trọng số phản ánh mức rủi ro của nó, rồi vốn tối thiểu là một phần trăm của tổng RWA.

Cụ thể, ngân hàng phải giữ **vốn** ≥ tỷ lệ % của **RWA** = tổng các charge từ nhiều nguồn rủi ro: credit risk (rủi ro tín dụng của banking book), **market risk** (rủi ro thị trường của trading book — chính là FRTB), counterparty credit risk (**SA-CCR**), CVA risk, và operational risk. Con số "tỷ lệ %" cốt lõi là 8% dưới Basel, cộng thêm nhiều lớp buffer (conservation buffer 2.5%, countercyclical buffer, G-SIB surcharge cho ngân hàng "quá lớn để sụp") nâng yêu cầu thực tế của một ngân hàng lớn lên cỡ 10–13% Common Equity Tier 1 trên RWA.

Hãy làm một ví dụ số nhỏ để thấy cơ chế. Giả sử một desk có RWA market risk là 500 triệu USD (ta sẽ tính chính con số kiểu này ở các mục sau). Với hệ số vốn tối thiểu 8%, phần vốn "cứng" là $0.08 \times 500 = 40$ triệu USD; nếu cộng conservation buffer 2.5% thì thành $0.105 \times 500 = 52.5$ triệu. Bốn mươi tới năm hai triệu đô vốn chủ sở hữu bị "khóa" lại chỉ để đỡ cho danh mục này — không sinh lời trực tiếp, chỉ nằm đó phòng thân. Cost of capital của nó (giả sử ngân hàng đòi 10%/năm trên equity) là $0.10 \times 52.5 = 5.25$ triệu USD mỗi năm. Đây là lý do vì sao mọi trader đều ghét charge vốn: nó là một khoản thuế thực, ăn thẳng vào return-on-equity của desk. Và đây cũng là lý do RWA không phải trò chơi kế toán trừu tượng — nó quyết định trade nào đáng làm.

## 15.2 Bức tranh Basel qua bốn thập kỷ

Regulation không rơi từ trời xuống thành một khối hoàn chỉnh; nó là lớp trầm tích của các cuộc khủng hoảng. Hiểu dòng thời gian giúp ta hiểu vì sao khung hiện tại phức tạp như vậy.

Basel I (1988) là bản đầu tiên, thô sơ: chỉ credit risk, mỗi tài sản gán một trong vài trọng số cố định (0% cho trái phiếu OECD, 100% cho khoản vay doanh nghiệp). Amendment 1996 là bước ngoặt quant đầu tiên — lần đầu cho phép ngân hàng dùng **VaR nội bộ** để tính vốn market risk của trading book, mở cửa cho model của chính ngân hàng. Basel II (2004) tinh vi hóa credit risk (cho phép internal ratings), thêm operational risk. Rồi khủng hoảng 2008 phơi bày rằng VaR thời bình đánh giá quá thấp rủi ro đuôi; phản ứng chắp vá là **Basel 2.5** (2009–2011) — vá thêm **stressed VaR** (VaR calibrate vào giai đoạn khủng hoảng) và **IRC** (Incremental Risk Charge cho default/migration trong trading book). Basel III (2010 trở đi) siết mạnh: nhiều vốn hơn và chất lượng vốn cao hơn, thêm **leverage ratio** (chặn đòn bẩy bất kể risk weight) và các tỷ lệ thanh khoản (LCR, NSFR).

Mảnh cuối, và là trọng tâm chương này, là **FRTB (Fundamental Review of the Trading Book)** — viết lại toàn bộ market risk capital từ đầu, thay vì vá tiếp. FRTB được BCBS công bố dưới số hiệu văn bản d457, hiệu lực dần từ 2023–2025 tùy khu vực pháp lý (EU, UK, Mỹ, Nhật có timeline lệch nhau). Gói cải cách hoàn thiện Basel III này được báo chí gọi là **"Basel IV"** dù BCBS không dùng tên đó chính thức. Điểm đáng nhớ về mặt tư duy: mỗi lớp mới ra đời để bịt một lỗ hổng mà lớp trước để lộ trong một cuộc khủng hoảng thật — regulation là lịch sử của các bài học đắt giá được mã hóa thành công thức.

## 15.3 Từ VaR đến Expected Shortfall

Trước khi vào FRTB, phải hiểu risk measure mà nó dùng. Câu hỏi nền tảng của mọi market-risk capital là: "Trong điều kiện xấu, danh mục này có thể lỗ bao nhiêu?" Có hai cách trả lời, và FRTB đã chuyển từ cái thứ nhất sang cái thứ hai.

### VaR — quantile của lỗ

**$\text{VaR}_\alpha$** (Value at Risk ở mức tin cậy $\alpha$) là quantile của phân phối lỗ: "với xác suất $\alpha$, lỗ một ngày không vượt quá $X$". Ví dụ VaR 99% một ngày bằng 5 triệu USD nghĩa là chỉ 1% số ngày (khoảng 2–3 ngày mỗi năm giao dịch) lỗ được kỳ vọng vượt 5 triệu. Có ba cách tính, và mỗi cách là một triết lý khác nhau về việc mô hình hóa tương lai từ đâu.

**Parametric (variance-covariance)** giả định lợi suất phân phối chuẩn với ma trận hiệp phương sai $\Sigma$ ước lượng từ lịch sử. Nếu danh mục có vector sensitivity $\mathbf{s}$ (ví dụ delta theo từng risk factor), độ lệch chuẩn lỗ một ngày là $\sigma_P = \sqrt{\mathbf{s}^\top \Sigma\, \mathbf{s}}$, và $\text{VaR}_{99\%} = z_{0.99}\,\sigma_P = 2.326\,\sigma_P$. Ví dụ số: danh mục có $\sigma_P = 2.15$ triệu USD/ngày, thì $\text{VaR}_{99\%} = 2.326 \times 2.15 = 5.00$ triệu. Nhanh, nhưng chết ở giả định Gaussian — đuôi thật dày hơn chuẩn nhiều, và nó không bắt được optionality (payoff phi tuyến).

**Historical simulation** là chuẩn phổ biến nhất trong industry: lấy khoảng 500 ngày biến động lịch sử của các risk factor, áp từng ngày ("kịch bản") lên danh mục hiện tại, reprice đầy đủ để có 500 con số P&L giả định, rồi $\text{VaR}_{99\%}$ là quantile 1% của phân phối lỗ đó — tức con số lỗ thứ 5 tệ nhất trong 500. Không giả định phân phối, tự động bắt đuôi dày và tương quan thật của quá khứ, nhưng "quá khứ" chỉ dài bằng cửa sổ lịch sử — một cú sốc chưa từng xảy ra sẽ không có trong mẫu. Cụ thể bằng số: giả sử reprice danh mục qua 500 kịch bản lịch sử cho ra một vector 500 con số P&L; sắp xếp từ tệ nhất lên, năm ngày lỗ nặng nhất là $-8.9, -7.4, -6.8, -6.1, -5.3$ triệu USD. Quantile 1% rơi đúng vào con số lỗ thứ 5, nên $\text{VaR}_{99\%} = 5.3$ triệu — ta *đọc thẳng* con số thứ 5 từ danh sách đã sắp xếp, không qua công thức phân phối nào. (Còn ES 97.5% historical, ta sẽ thấy ngay dưới đây, là **trung bình** của 12–13 kịch bản tệ nhất trong 500 — tức trung bình cả khối $-8.9, -7.4, -6.8, \ldots$ chứ không chỉ lấy một điểm cắt.)

**Monte Carlo** mô phỏng hàng chục nghìn kịch bản risk factor từ một model đã calibrate, reprice mỗi kịch bản, rồi lấy quantile y hệt cách historical — chỉ khác nguồn kịch bản là model chứ không phải quá khứ. Linh hoạt nhất cho danh mục nhiều optionality (mô phỏng được cả những cú sốc chưa từng xảy ra trong lịch sử), nhưng đắt tính toán và phụ thuộc vào model giả định: nếu model sai đuôi thì VaR sai đuôi.

### Khuyết điểm chí mạng của VaR

VaR có hai lỗi khiến regulator cuối cùng phải bỏ nó. Thứ nhất, nó **không nói gì về độ sâu của đuôi** vượt quá quantile: VaR 99% bằng 5 triệu không phân biệt được kịch bản "ngày tệ thứ nhất lỗ 6 triệu" với "ngày tệ thứ nhất lỗ 60 triệu" — cả hai đều thỏa "1% số ngày lỗ hơn 5 triệu". Với một trader bán option deep-out-of-the-money, đây là cái bẫy chết người: VaR trông đẹp cho tới ngày đuôi bung ra.

Thứ hai, và nặng hơn về lý thuyết, VaR **không subadditive**. Một risk measure tử tế phải thỏa $\rho(A+B) \le \rho(A) + \rho(B)$ — gộp hai danh mục lại không được rủi ro hơn tổng rủi ro riêng lẻ, vì đa dạng hóa phải giảm rủi ro chứ không tăng. Nhưng VaR có thể vi phạm: tồn tại các cặp danh mục mà VaR(A+B) > VaR(A) + VaR(B), tức VaR *phạt* việc đa dạng hóa — một điều vô lý. Ví dụ kinh điển: hai trái phiếu độc lập mỗi cái có xác suất default nhỏ với lỗ lớn; riêng lẻ mỗi cái default nằm ngoài đuôi 99% nên VaR nhỏ, nhưng gộp lại xác suất "ít nhất một cái default" lọt vào trong đuôi 99% khiến VaR gộp nhảy vọt vượt tổng. Một measure có thể bảo bạn "hãy tách danh mục ra cho đỡ vốn" là một measure hỏng.

### Expected Shortfall — trung bình của đuôi

**Expected Shortfall ($\text{ES}_\alpha$)** sửa cả hai lỗi:

$$ES_\alpha = \mathbb{E}[\text{Loss} \mid \text{Loss} > \text{VaR}_\alpha]$$

Thay vì hỏi "ngưỡng lỗ ở đâu", ES hỏi "khi đã vượt ngưỡng thì trung bình lỗ bao nhiêu" — nó tích hợp toàn bộ đuôi vượt quá VaR, nên nhìn thấy độ sâu mà VaR mù. Quan trọng hơn, ES là **coherent** (thỏa subadditivity một cách chặt chẽ, đa dạng hóa luôn được thưởng). Đây là lý do FRTB thay VaR 99% bằng **ES 97.5%**.

Vì sao 97.5% chứ không 99%? Đây là chỗ dễ hiểu nhầm nhất, nên phải nói thật rõ. Với **riêng đuôi Gaussian**, ES ở mức 97.5% xấp xỉ đúng bằng VaR ở mức 99% — và regulator cố tình chọn mức 97.5% chính *vì* sự trùng hợp này: nó giữ "độ nghiêm khắc" tương đương thời VaR 99% cũ (không làm ngân hàng sốc vì charge nhảy vọt), nhưng đổi lấy một measure coherent, bắt đuôi dày tốt hơn. Ta kiểm chứng bằng số cho phân phối chuẩn tắc. VaR ở mức 99% là quantile $z_{0.99} = 2.326$. ES ở mức $\alpha$ của biến chuẩn tắc có công thức đóng $ES_\alpha = \phi(z_\alpha)/(1-\alpha)$, với $\phi$ là pdf chuẩn tắc. Ở $\alpha = 97.5\%$: $z_{0.975} = 1.960$, $\phi(1.960) = 0.0584$, nên

$$ES_{97.5\%} = \frac{0.0584}{1 - 0.975} = \frac{0.0584}{0.025} = 2.338.$$

So sánh: $\text{VaR}_{99\%} = 2.326$ và $\text{ES}_{97.5\%} = 2.338$ — gần như trùng khít. Nhưng phải khắc cốt: **sự trùng khít này là tính chất RIÊNG của đuôi Gaussian, không phải một quy đổi phổ quát** giữa hai mức tin cậy. "97.5% ↔ 99%" chỉ đúng dưới chuẩn tắc; đừng bao giờ dùng nó như một công thức quy đổi cho phân phối bất kỳ. Với phân phối lỗ có đuôi dày hơn chuẩn (đúng như thị trường thật), $ES_{97.5\%}$ sẽ **vọt lên trên** $VaR_{99\%}$ — vì ES nhìn thấy khối lượng nằm sâu trong đuôi mà quantile 99% hoàn toàn bỏ qua. Chính khoảng chênh "ES 97.5% cao hơn hẳn VaR 99% khi đuôi dày" là "giá trị gia tăng" mà regulator muốn mua khi chuyển sang ES: với thị trường thật, khung mới nghiêm khắc hơn khung cũ đúng ở nơi nó cần nghiêm khắc.

## 15.4 FRTB — kiến trúc tổng thể

FRTB là khung market-risk capital hiện hành, và nó mang ba đổi mới lớn so với thời VaR.

Đổi mới thứ nhất là **ranh giới trading book / banking book** được định nghĩa chặt chẽ, có danh sách phân loại mặc định cho từng loại instrument, và việc chuyển một position qua lại giữa hai book bị hạn chế ngặt (chuyển được thì phần "tiết kiệm vốn" bị tịch thu). Lý do: dưới khung cũ, ngân hàng chơi trò "capital arbitrage" — để một position ở book nào tính vốn rẻ hơn. FRTB đóng cửa trò này.

Đổi mới thứ hai là **hai con đường tính vốn**, và lựa chọn diễn ra ở cấp **từng trading desk**, không phải cả ngân hàng: Standardised Approach (SA) mà mọi ngân hàng đều phải tính được (kể cả desk đã được duyệt IMA, để làm floor và fallback), và Internal Models Approach (IMA) chỉ dành cho desk vượt qua các bài kiểm tra nghiêm ngặt. Ta đi vào từng con đường.

### Standardised Approach — SBM, DRC, RRAO

Vốn SA là tổng của ba thành phần. Trái tim là **SBM (Sensitivities-Based Method)** — tính vốn từ các **sensitivities** của danh mục theo một bộ quy tắc cố định; đóng góp thêm là **DRC (Default Risk Charge)** cho rủi ro vỡ nợ đột ngột, và **RRAO (Residual Risk Add-On)** cho những thứ exotic mà SBM không bắt được.

SBM chia rủi ro theo hai trục. Trục thứ nhất là ba **loại nhạy cảm**: **Delta** (nhạy cảm bậc nhất với risk factor), **Vega** (nhạy cảm với implied volatility), và **Curvature** — được định nghĩa là phần lỗ khi stress risk factor hai chiều rồi trừ đi phần đã tính bởi delta, tức nó bắt gamma và optionality mà delta tuyến tính bỏ sót. Trục thứ hai là bảy **risk class**: GIRR (General Interest Rate Risk — lãi suất), CSR chia làm ba (credit spread non-securitisation, securitisation, và correlation-trading portfolio), Equity, Commodity, và FX.

Cơ chế tính là một **công thức aggregation ba tầng** mà mọi tham số đều là hằng số Basel tra bảng — không có gì được ước lượng bởi ngân hàng. Ở tầng thấp nhất, mỗi sensitivity được nhân **risk weight** quy định để thành weighted sensitivity $WS_k = RW_k \times s_k$. Trong một **bucket** (nhóm risk factor cùng loại, ví dụ cùng đường cong lãi suất), các $WS_k$ được gộp bằng correlation $\rho_{kl}$ quy định. Giữa các bucket của cùng risk class, các charge bucket được gộp tiếp bằng correlation $\gamma_{bc}$ quy định. Và toàn bộ quá trình chạy ba lần với **ba kịch bản correlation** (high / medium / low) rồi lấy max. Vì mọi risk weight và correlation là hằng số Basel tra bảng, engine SA về bản chất là: chuẩn hóa sensitivities (định dạng CRIF) → tra bảng tham số → vài nghìn phép cộng-nhân-căn bậc hai. Không mô phỏng, không model, chỉ cần **đúng từng tham số theo đúng version văn bản** — đúng nghĩa công việc của các registry `*-parameters.ts` trong `src/risk`: tham số quy định phải versioned, tra cứu được, không hardcode rải rác.

Ta dẫn xuất công thức gộp trong một bucket từ đầu để thấy nó không phải phép màu. Với hai weighted sensitivity $WS_1, WS_2$ và correlation $\rho$, charge của bucket là độ lệch chuẩn của tổng — chính là công thức phương sai của tổng hai biến:

$$K_b = \sqrt{WS_1^2 + WS_2^2 + 2\rho\, WS_1 WS_2}.$$

Đây đơn giản là $\sqrt{\text{Var}(X_1 + X_2)}$ khi coi mỗi $WS_i$ như một "độ lớn rủi ro" và $\rho$ là correlation giữa chúng. Tổng quát cho nhiều sensitivity: $K_b = \sqrt{\sum_k WS_k^2 + \sum_{k}\sum_{l\ne k} \rho_{kl}\, WS_k WS_l}$.

**Ví dụ tính bằng số — SBM aggregation.** Một desk có hai delta sensitivity GIRR đã nhân risk weight, ứng với hai tenor trên đường cong lãi suất: $WS_{5Y} = +55{,}000$ USD và $WS_{10Y} = -33{,}000$ USD (một long ở 5Y, một short ở 10Y), với correlation trong bucket $\rho = 0.7$ (giá trị tra bảng, phản ánh việc hai điểm gần nhau trên curve di chuyển cùng chiều). Thay vào:

$$K_b = \sqrt{55000^2 + (-33000)^2 + 2(0.7)(55000)(-33000)}.$$

Từng số hạng: $55000^2 = 3{,}025 \times 10^6$; $33000^2 = 1{,}089 \times 10^6$; số hạng chéo $2(0.7)(55000)(-33000) = -2{,}541 \times 10^6$. Cộng lại: $(3025 + 1089 - 2541)\times 10^6 = 1{,}573 \times 10^6$, và

$$K_b = \sqrt{1{,}573 \times 10^6} \approx 39{,}700 \text{ USD} = 39.7\text{k}.$$

Con số 39.7k này đáng đọc kỹ vì nó dạy ba điều về toàn bộ SBM. **Thứ nhất**, hai vị thế trái dấu 5Y và 10Y được **bù trừ một phần** — nhưng chỉ một phần, do correlation. Nếu $\rho = 1$ (hai tenor di chuyển hoàn toàn đồng bộ), $K_b = \sqrt{55000^2 + 33000^2 - 2(55000)(33000)} = |55000 - 33000| = 22{,}000$ — bù gần hết, chỉ còn 22k. Nếu $\rho = 0$ (độc lập), $K_b = \sqrt{55000^2 + 33000^2} = \sqrt{4114}\times 10^3 \approx 64{,}100$ — không bù chút nào, 64k. Với $\rho = 0.7$ ta rơi vào giữa, 39.7k. Điều cốt tử: **mức bù trừ là do regulator ấn định**, không phải do ngân hàng ước lượng — bạn không được tự bảo "hai cái này hedge nhau 95% đâu". **Thứ hai**, chính công thức dạng này lặp lại qua ba tầng (trong bucket → giữa bucket bằng $\gamma_{bc}$ → giữa risk class thì **không** được bù, cộng thẳng) là toàn bộ SBM — học một tầng là hiểu cả engine. **Thứ ba**, ba kịch bản correlation nhân tham số với hệ số (high: ×1.25, medium: ×1, low: ×0.75, có chặn trong $[0,1]$) rồi lấy charge lớn nhất — đây là cách regulator phạt những danh mục "trông có vẻ hedge" mà correlation thực có thể trôi lúc thị trường căng. Với ví dụ trên, kịch bản high đẩy $\rho$ lên $\min(1, 0.7 \times 1.25) = 0.875$ làm bù trừ mạnh hơn (charge nhỏ hơn cho danh mục trái dấu này), còn kịch bản low hạ $\rho$ xuống $0.7 \times 0.75 = 0.525$ làm bù trừ yếu đi (charge lớn hơn) — với danh mục hedge, thường low scenario cho charge cao nhất và đó là con số được giữ.

Ngoài SBM, SA còn hai add-on, và cả hai đều phải tính ra số chứ không mô tả suông.

**DRC (Default Risk Charge)** bắt rủi ro **jump-to-default** — cú vỡ nợ đột ngột của một issuer mà SBM (vốn về spread liên tục) không mô hình được. Cơ chế: với mỗi issuer, tính **JTD** (jump-to-default exposure) của từng position — xấp xỉ là notional × loss-given-default cho position long (mất tiền khi issuer sập) và ngược dấu cho short (được lợi khi issuer sập). Trong cùng một bucket, long và short **cùng issuer** được net thẳng, còn long/short *khác* issuer chỉ được bù một phần qua một hedge-benefit ratio quy định (netting rất hạn chế). JTD ròng rồi nhân **default risk weight** tra theo credit quality của issuer. Làm một ví dụ số nhỏ để đóng đinh. Giả sử trong một bucket corporate ta có một position **long trái phiếu 10 triệu USD của issuer xếp hạng BB** và một position **short 6 triệu USD trái phiếu của chính issuer đó**. Vì cùng issuer, hai JTD net thẳng: net JTD $= 10 - 6 = 4$ triệu USD (còn net long). Default risk weight cho hạng BB tra bảng cỡ 4%, nên

$$\text{DRC} = 4\% \times 4{,}000{,}000 = 0.04 \times 4{,}000{,}000 = 160{,}000 \text{ USD}.$$

Đọc con số: hai chân trái dấu cùng issuer đã bù nhau (10 vs 6) trước khi tính charge — nếu quên net mà tính JTD gộp $10+6=16$ triệu thì charge phồng lên $640\,\text{k}$, gấp bốn lần con số đúng. Đó chính là chỗ netting đúng-sai của DRC quyết định con số cuối, và là lý do phần credit của SA đòi phải map issuer cực kỳ cẩn thận (hai trái phiếu tưởng cùng issuer nhưng khác pháp nhân phát hành thì **không** được net).

**RRAO (Residual Risk Add-On)** là một charge thô bằng $\text{bp} \times \text{notional}$ áp lên các payoff exotic (gap risk, correlation, behavioural như prepayment) — một khoản "thuế" cho những cấu trúc mà cơ chế sensitivities của SBM về bản chất không thể nắm bắt. Ví dụ: một barrier option notional 50 triệu USD với RRAO rate 0.1% cho "other residual risks" đóng góp $0.001 \times 50{,}000{,}000 = 50{,}000$ USD charge — nhỏ, nhưng là cách regulator nói "SBM không hiểu cái này, nên cứ tính thô cho chắc". Đặt cạnh nhau, DRC (160k) và RRAO (50k) minh họa hai kiểu "vá lỗ hổng của SBM": một cái vá rủi ro default rời rạc, một cái vá rủi ro dư của payoff exotic.

### Internal Models Approach — ES, NMRF, PLA, backtesting

Con đường thứ hai, IMA, dành cho desk được duyệt và về nguyên tắc cho ra vốn thấp hơn SA (thưởng cho ngân hàng có model tốt nhận diện được hedge và đa dạng hóa thật). Nhưng "được duyệt" là một hàng rào cao gồm bốn phần.

**ES 97.5% với liquidity horizons.** Thay vì giả định "thanh lý mọi thứ trong 10 ngày" như VaR cũ, IMA gán mỗi loại risk factor một **liquidity horizon** phản ánh thời gian thực để thoát vị thế: equity vốn hóa lớn 10 ngày, credit spread illiquid tới 120 ngày, với các mốc 10/20/40/60/120 ngày. ES được calibrate vào một **giai đoạn stress** (period of significant financial stress trong lịch sử của danh mục), không phải thời bình. Công thức không còn là một con số mà là một **cascade**:

$$ES = \sqrt{ES_{Q_1}^2 + \sum_{j\ge 2}\left(ES_{Q_j}\sqrt{\frac{LH_j - LH_{j-1}}{10}}\right)^2}$$

trong đó $ES_{Q_j}$ là ES tính khi chỉ shock các risk factor có liquidity horizon $\ge LH_j$. Ý tưởng: risk factor càng kém thanh khoản càng bị shock "lâu hơn", và độ lớn shock scale theo $\sqrt{t}$ (đúng theo scaling của Brownian motion — biến động tích lũy trong $t$ ngày tỷ lệ với $\sqrt{t}$). Số hạng $\sqrt{(LH_j - LH_{j-1})/10}$ chính là hệ số phóng đại cho phần thanh khoản kém, quy về base 10 ngày.

Ta minh họa cascade bằng số. Giả sử một danh mục có ba loại risk factor rơi vào ba nhóm liquidity horizon 10, 40, 120 ngày, và các ES từng bậc là $ES_{Q_1} = 3.00$ triệu (shock tất cả, LH ≥ 10), $ES_{Q_2} = 2.00$ triệu (chỉ shock các factor LH ≥ 40), $ES_{Q_3} = 1.20$ triệu (chỉ LH ≥ 120). Các hệ số scale: với $j=2$, $\sqrt{(40-10)/10} = \sqrt{3} = 1.732$; với $j=3$, $\sqrt{(120-40)/10} = \sqrt{8} = 2.828$. Vậy

$$ES = \sqrt{3.00^2 + (2.00 \times 1.732)^2 + (1.20 \times 2.828)^2} = \sqrt{9.00 + 12.00 + 11.52} = \sqrt{32.52} = 5.70 \text{ triệu USD}.$$

Đọc con số: nếu ngây thơ chỉ dùng $ES_{Q_1} = 3.00$ triệu (giả định thanh lý 10 ngày cho mọi thứ như VaR cũ), ta bỏ sót toàn bộ chi phí thanh khoản. Cascade nâng charge lên 5.70 triệu — gần gấp đôi — vì các risk factor kém thanh khoản (40 và 120 ngày) bị shock lâu hơn, và đó chính là "phí thanh khoản" mà FRTB buộc phải tính. Đây là một trong những lý do IMA dưới FRTB không rẻ như người ta tưởng.

**NMRF (Non-Modellable Risk Factors).** Đây là chi phí lớn nhất và là lý do nhiều ngân hàng bỏ IMA cho phần lớn desk. Một risk factor chỉ được coi là "modellable" nếu vượt qua **risk factor eligibility test**: có đủ giá quan sát thật (ngưỡng cỡ 24 quote/năm và không có gap quá một tháng giữa hai quote). Risk factor không đạt — điển hình là điểm dài hạn của một curve mỏng, hay vol của một underlying ít giao dịch — bị tách riêng thành **NMRF** và chịu một **stress scenario charge** tính riêng, rất đắt, và được cộng gần như không có lợi ích đa dạng hóa với phần ES. Một danh mục có nhiều NMRF có thể thấy vốn IMA của mình bị NMRF chi phối, ăn mòn toàn bộ lợi ích của việc dùng internal model.

**PLA (P&L Attribution test).** Đây là bài kiểm tra khéo léo nhất của FRTB, và cũng là bài có hệ quả kiến trúc sâu nhất. Nó so sánh hai chuỗi P&L hằng ngày: **HPL (hypothetical P&L)** do front-office pricing engine đầy đủ tạo ra, và **RTPL (risk-theoretical P&L)** do chính risk model tái tạo từ các risk factor mà nó dùng. Nếu risk model là một xấp xỉ dễ tính nhưng lệch xa pricing thật, hai chuỗi sẽ phân kỳ — và FRTB không cho phép điều đó. Test dùng hai thống kê trên khoảng 250 ngày: **Spearman rank correlation** (đo hai chuỗi có "xếp hạng cùng chiều" không) và **Kolmogorov–Smirnov statistic** (đo khoảng cách lớn nhất giữa hai phân phối tích lũy). Ngưỡng cỡ: **xanh (green)** khi correlation > 0.80 và KS < 0.09 — desk giữ IMA đầy đủ; **đỏ (red)** khi correlation < 0.70 hoặc KS > 0.12 — desk **rớt về SA**; vùng **amber** ở giữa — desk giữ IMA nhưng chịu một capital surcharge. Ý đồ thiết kế rất rõ: ngân hàng không thể dùng một risk model "xấp xỉ cho dễ" khác xa pricing thật — hai hệ thống phải cùng risk factors, cùng data, gần như cùng code. Hệ quả kiến trúc trực tiếp là các ngân hàng hợp nhất pricing library dùng chung cho cả FO và risk (một trong những lý do `quantc` để risk và pricing chung một codebase, tie tới `risk/pla`).

Một ví dụ số nhỏ cho PLA để không nói suông. Giả sử qua 250 ngày, Spearman correlation giữa HPL và RTPL đo được là 0.86 và KS statistic là 0.07. Vì $0.86 > 0.80$ và $0.07 < 0.09$, desk ở vùng **green** — IMA đầy đủ, không surcharge. Nếu năm sau risk model bị đơn giản hóa để chạy nhanh hơn và correlation tụt xuống 0.74 với KS lên 0.10, desk rơi vào **amber** (không đủ điều kiện green nhưng chưa chạm red) — vẫn IMA nhưng cõng thêm capital surcharge; và nếu correlation tụt tiếp dưới 0.70, desk rớt thẳng về SA, thường kéo theo vốn tăng đáng kể. Chính cơ chế này ép risk và pricing phải "cùng một sự thật".

**Backtesting.** Song song, IMA yêu cầu backtest VaR ở cấp desk trên cả hai mức 99% và 97.5%: đếm số ngày lỗ thực vượt VaR ("exception") trong cửa sổ 250 ngày, rồi tra một bảng "traffic light" để ra hệ số nhân charge. Cụ thể bằng số theo tinh thần Basel: **≤ 4 exception/250 ngày → vùng green**, multiplier tối thiểu $m = 1.5$; **5–9 exception → vùng amber**, multiplier tăng dần theo bậc (5 → khoảng 1.70, và bò lên tới khoảng 1.92 tại 9 exception); **≥ 10 exception → vùng red**, multiplier chạm trần và desk có nguy cơ mất IMA hoàn toàn, rớt về SA. Ví dụ: một desk có ES cơ sở 5.70 triệu (con số cascade tính ở trên) mà năm đó dính 6 exception → nằm amber với $m \approx 1.76$, charge sau phạt là $1.76 \times 5.70 \approx 10.0$ triệu; cũng desk đó nếu chỉ 3 exception thì green, $m = 1.5$, charge $1.5 \times 5.70 = 8.55$ triệu. Đây là lớp kiểm tra "hậu nghiệm" cuối: model có thể đẹp trên giấy, nhưng nếu thực tế phá ngưỡng quá thường xuyên thì nó sai, và cái sai đó bị tính thành tiền ngay qua multiplier.

Thực tế triển khai giai đoạn 2023–2026: đa số ngân hàng chạy **SA là chính**, chỉ dùng IMA cho một số ít desk chọn lọc (thường là các desk flow lớn, thanh khoản cao, ít NMRF, nơi lợi ích vốn của IMA đủ bù chi phí hạ tầng). Chi phí hạ tầng cho IMA là khổng lồ: tính sensitivities toàn hàng mỗi ngày, thu thập và quản lý dữ liệu NMRF, chạy PLA và backtest hằng ngày cho từng desk. Và chính khối lượng công việc đó là thị trường việc làm risk-quant và quant-dev lớn nhất thập kỷ này.

## 15.5 SA-CCR — vốn cho counterparty credit risk

Đến đây ta rời market risk sang một họ vốn khác: **counterparty credit risk**, tức rủi ro đối tác của bạn trong một derivative vỡ nợ khi hợp đồng đang có giá trị dương với bạn. FRTB quản market risk; **SA-CCR (Standardised Approach for Counterparty Credit Risk)** là công thức quy định tính **EAD (Exposure at Default)** — con số exposure dùng để nhân risk weight ra RWA counterparty. SA-CCR thay các phương pháp cũ CEM và Standardised Method từ năm 2022, vì hai cái cũ quá thô, không nhận diện đúng netting và margin.

Cấu trúc cốt lõi của SA-CCR gói gọn trong một công thức:

$$EAD = 1.4 \times (RC + PFE)$$

với **RC (Replacement Cost)** là chi phí thay thế hiện tại (giá trị mất nếu đối tác vỡ nợ ngay bây giờ, có tính collateral đã nhận), **PFE (Potential Future Exposure)** là phần exposure có thể tăng thêm trong tương lai do thị trường biến động, và **1.4** là một hệ số "alpha" quy định — một lớp đệm thận trọng regulator thêm vào, phản ánh general wrong-way risk và sai số mô hình. PFE tự nó bằng một **multiplier** (nhận diện lợi ích của việc đang over-collateralised) nhân với tổng **AddOn** theo từng asset class.

AddOn của một trade rates không phải một hằng số phép màu — nó dẫn xuất được từng bước, và ta viết đủ ở đây để nhất quán với độ sâu của SBM và ES cascade phía trên. AddOn của một IRS bằng

$$\text{AddOn} = SF \times d \times MF,$$

trong đó $SF$ là **supervisory factor** (0.5% cho asset class rates), $d$ là **adjusted notional** = notional nhân **supervisory duration** $SD$, và $MF$ là **maturity factor**. Với một trade **unmargined** có remaining maturity $M \ge 1$ năm, maturity factor $MF = \sqrt{\min(M,1)/1} = 1$ — tức nó chỉ giảm dưới 1 cho các trade dưới một năm; swap 10Y của ta có $MF = 1$. Còn supervisory duration $SD$ có công thức đóng quy định, đúng bằng tích phân discount của một dòng tiền đều với suất chiết khấu quy ước 5%:

$$SD = \frac{e^{-0.05\,S} - e^{-0.05\,E}}{0.05},$$

với $S$ là thời điểm bắt đầu (start) và $E$ là thời điểm kết thúc (end) của leg tính theo năm. Đây là chỗ cần cẩn thận: đừng nhớ áng chừng "cỡ 7.6", hãy dẫn ra từ công thức.

**Ví dụ tính bằng số — SA-CCR cho một IRS.** Xét một interest rate swap 10 năm, notional 100 triệu USD, đang ở ATM (MTM ≈ 0), không có margin agreement. Vì MTM ≈ 0, replacement cost $RC = 0$. Tính $SD$ với $S = 0$, $E = 10$:

$$SD = \frac{e^{-0.05 \times 0} - e^{-0.05 \times 10}}{0.05} = \frac{1 - e^{-0.5}}{0.05} = \frac{1 - 0.606531}{0.05} = \frac{0.393469}{0.05} = 7.869.$$

(Chú ý con số đúng là **7.869**, không phải 7.6 — cái 7.6 là một xấp xỉ làm tròn thô và nó đẩy EAD lệch cỡ 4%.) Với $MF = 1$ (unmargined, $M = 10 \ge 1$), AddOn cho leg rates:

$$\text{AddOn} = SF \times (\text{notional} \times SD) \times MF = 0.5\% \times (100{,}000{,}000 \times 7.869) \times 1 = 0.005 \times 786{,}900{,}000 = 3{,}934{,}693 \text{ USD}.$$

Với RC = 0 và over-collateralisation bằng 0, multiplier = 1, nên $PFE = \text{AddOn} = 3.935$ triệu. Khi đó

$$EAD = 1.4 \times (0 + 3{,}934{,}693) = 5{,}508{,}571 \text{ USD} \approx 5.51 \text{ triệu}.$$

Đọc con số này: một swap "miễn phí" về MTM — nó không đáng một xu nếu đối tác trả ngay bây giờ — vẫn tạo ra **5.51 triệu USD EAD**. Nhân với risk weight của đối tác (giả sử một ngân hàng xếp hạng tốt, risk weight cỡ 20%) ra RWA $= 0.20 \times 5.51 = 1.10$ triệu; nhân hệ số vốn 8% ra vốn $= 0.08 \times 1.10 = 0.088$ triệu, tức khoảng **88 nghìn USD** vốn bị khóa cho một swap trông như "không có gì". (Nếu ta lỡ dùng $SD \approx 7.6$ thay vì 7.869, EAD tụt xuống còn 5.32 triệu và vốn còn ~85k — sai lệch nhỏ nhưng nhân lên hàng chục nghìn trade thì thành con số thật; đây đúng là loại edge case mà việc dẫn công thức thay vì nhớ áng chừng giúp ta tránh.) Đây là insight quan trọng nhất của mục: exposure hiện tại bằng không **không** có nghĩa vốn bằng không, vì PFE tính đến biến động tương lai. Chính con số EAD kiểu này chảy thẳng vào **KVA** (Capital Valuation Adjustment, đã gặp ở Chương 14 về XVA) — chi phí vốn phải giữ trong suốt vòng đời trade — và vào quyết định pre-deal "trade này có đáng làm không". Một trader không hiểu SA-CCR sẽ định giá sai chi phí thật của giao dịch.

## 15.6 SIMM — người anh em song sinh của SBM

Mảnh cuối là **SIMM (Standard Initial Margin Model)**, và điểm mấu chốt cần nhớ ngay: SIMM **không phải của Basel** mà của **ISDA** — nó không phải capital charge mà là công thức tính **Initial Margin** (ký quỹ ban đầu) song phương cho các OTC derivative **không clear qua central counterparty**, dưới khung Uncleared Margin Rules (UMR) triển khai theo đợt từ 2016 đến 2022 cho các đối tác từ lớn tới nhỏ dần.

Vì sao ta xếp SIMM cạnh vốn quy định? Vì cấu trúc tính toán của nó **giống hệt SBM** — cùng một DNA: sensitivities × risk weights × correlations, gộp qua bucket và risk class bằng đúng dạng công thức $\sqrt{\sum WS^2 + \sum\sum \rho\, WS\, WS}$ mà ta đã dẫn ở mục 15.4. Khác biệt chỉ ở chỗ tham số do ISDA hiệu chỉnh (và công bố lại hằng năm) chứ không phải Basel, và mục đích là tính margin song phương chứ tính vốn. Bởi cùng cấu trúc, một engine đã viết cho SBM có thể tái sử dụng phần lớn cho SIMM — đúng nguyên tắc registry + composition: tách phần tham số (registry riêng cho từng framework) khỏi phần logic aggregation (dùng chung). Trong repo, đây là mối tie giữa `src/risk` (FRTB) và `src/xva` (SIMM), và cụ thể tie tới `xva/simm`.

Để không chỉ nói "giống nhau" mà đóng kín mục bằng một con số riêng, ta chạy đúng công thức ấy cho một netting set rates đơn giản. Giả sử sau khi map sang các risk factor rates và nhân risk weight của ISDA, netting set còn lại hai weighted sensitivity $WS_1 = +150{,}000$ USD và $WS_2 = -90{,}000$ USD, với correlation liên-tenor quy định $\rho = 0.7$. Initial Margin của nhóm rates này là

$$IM = \sqrt{WS_1^2 + WS_2^2 + 2\rho\, WS_1 WS_2} = \sqrt{150000^2 + (-90000)^2 + 2(0.7)(150000)(-90000)}.$$

Từng số hạng: $150000^2 = 22{,}500 \times 10^6$; $90000^2 = 8{,}100 \times 10^6$; chéo $2(0.7)(150000)(-90000) = -18{,}900 \times 10^6$. Cộng: $(22500 + 8100 - 18900)\times 10^6 = 11{,}700 \times 10^6$, nên $IM = \sqrt{11{,}700 \times 10^6} \approx 108{,}200$ USD. Đúng một con số IM cụ thể, ra từ **cùng** công thức $K_b$ của SBM — chỉ khác bộ tham số ISDA. Đó là toàn bộ lý do repo dùng chung logic aggregation cho hai framework: đổi registry, không đổi engine.

Cơ chế thực chiến: mọi ngân hàng và buy-side lớn phải tính SIMM **hằng ngày** cho từng netting set song phương, rồi **đối chiếu sensitivities với đối tác** qua định dạng chuẩn **CRIF (Common Risk Interchange Format)** — hai bên trao đổi file CRIF và phải khớp số IM tính ra, nếu lệch quá ngưỡng thì mở dispute. Đây là lý do reconciliation (đối chiếu để tìm ra vì sao số của mình lệch số đối tác) là một kỹ năng nghề rất được trả giá.

Và SIMM nối thẳng vào một XVA đã gặp: **MVA (Margin Valuation Adjustment)**, chi phí funding của initial margin trong suốt vòng đời trade, chính là **dự phóng SIMM tương lai** chiết khấu về hiện tại — tức bạn phải mô phỏng SIMM của mình sẽ là bao nhiêu ở mỗi thời điểm tương lai (dynamic IM), rồi nhân funding spread. Chương XVA (14) và chương này gặp nhau đúng tại điểm đó: cùng một công thức SIMM, một bên dùng để post margin hôm nay, một bên dùng để định giá chi phí margin của cả vòng đời.

## 15.7 Ý nghĩa cho người làm nghề

Regulation biến một việc nghe khô khan — "tính đúng một con số theo một spec dày năm trăm trang, cho hàng triệu position, mỗi đêm, có audit trail" — thành một kỹ năng đáng giá và khó thay thế. Có ba năng lực compound rất tốt trong sự nghiệp risk-quant, và cả ba đều xuất hiện xuyên suốt chương này.

Thứ nhất là **đọc spec quy định gốc** không qua tóm tắt: BCBS d457 cho FRTB, ISDA SIMM methodology cho margin, các văn bản SA-CCR — vì bản tóm tắt luôn bỏ mất chính cái edge case làm số của bạn lệch (như chuyện supervisory duration là 7.869 chứ không phải "cỡ 7.6" ở mục 15.5). Thứ hai là **kiến trúc registry tham số versioned**: risk weight và correlation thay đổi theo năm, và bạn phải reproduce được con số của quá khứ (khi regulator hoặc auditor hỏi "tháng 3 năm ngoái các anh tính thế nào") — đây chính xác là vì sao mọi tham số quy định trong `quantc` nằm trong các registry `*-parameters.ts` được version, không hardcode rải rác trong logic. Thứ ba là **reconciliation**: kỹ năng tìm ra vì sao con số của mình lệch con số của một hệ thống khác — của đối tác trong CRIF, của regulator trong QIS, của bộ phận finance nội bộ — vì trong thế giới capital, "số của tôi khác số của anh" là vấn đề phải giải quyết mỗi ngày.

Ba năng lực này nghe kém hào nhoáng hơn "nghĩ ra một model volatility mới". Nhưng chúng là nơi phần lớn đầu người Q-quant đang thực sự được trả lương, và là nền móng mà bất kỳ ai muốn đi xa trên desk quant đều phải đứng vững — vì một con số vốn sai không chỉ là lỗi kỹ thuật, nó là rủi ro pháp lý và uy tín của cả ngân hàng.

# Chương 16: Convertible bonds và hybrid capital

Mọi sản phẩm ta gặp cho tới giờ đều sống trong một thị trường: một option là con thú của vol, một swap là con thú của rates, một CDS là con thú của credit. Convertible bond phá vỡ sự gọn ghẽ ấy. Nó là một trái phiếu — nên nhạy với rates và credit spread — nhưng gắn liền một quyền chuyển đổi thành cổ phiếu — nên nhạy với spot và vol của equity. Một instrument, ba desk cùng muốn quyền sở hữu: rates/credit desk nhìn thấy phần bond floor, equity derivatives desk nhìn thấy phần embedded option, và cả hai đều đúng một nửa. Đó chính là lý do convertible tồn tại như một mảng riêng, có desk riêng, có phương pháp định giá riêng, và sinh ra một trong những chiến lược hedge fund kinh điển nhất — **convertible arbitrage**.

Chương này đi theo lát cắt tự nhiên của một quant convertible. Ta bắt đầu từ **cấu trúc** — trái phiếu cộng embedded call, các đại lượng parity/bond floor và cách đọc chúng thành một con số giá thô. Ta bóc **ba thành phần giá trị** và các Greeks kèm theo, thấy con thú này biến hình từ "gần như bond" sang "gần như equity" theo spot. Ta nêu **cách định giá đúng** — cây binomial một nhân tố equity với chiết khấu điều chỉnh credit, nối thẳng vào hazard rate của Chương 13 và tinh thần PDE của Chương 12. Ta mổ **convertible arbitrage** — nguồn lợi nhuận, cách gamma-scalp, và vì sao chiến lược này gần như xoá sổ năm 2008. Cuối cùng ta chạm **mandatory convertible** và **CoCo/AT1** — hybrid capital của ngân hàng, nơi cấu trúc chuyển đổi bị lộn ngược và trở thành công cụ hấp thụ lỗ. Xuyên suốt, mọi khái niệm lớn có một ví dụ tính bằng số ra kết quả.

## 16.1 Cấu trúc convertible bond — bond cộng một embedded call

Vì sao mục này tồn tại trước tất cả: bởi vì nếu không cầm chắc bốn đại lượng — conversion ratio, conversion price, parity, bond floor — thì mọi câu về Greeks, arbitrage hay CoCo phía sau đều trôi. Bốn con số này là bảng chữ cái của thị trường convertible, và điều đẹp là chúng đều tính được bằng số học lớp năm; cái khó nằm ở chỗ đọc *ý nghĩa* của chúng.

Một **convertible bond** (CB) là trái phiếu do một công ty phát hành, trả coupon và mệnh giá như trái phiếu thường, nhưng cho người nắm giữ **quyền** (không nghĩa vụ) đổi mỗi trái phiếu lấy một số cổ phiếu cố định của chính công ty đó, bất cứ lúc nào cho tới đáo hạn (kiểu Mỹ) hoặc tại một số thời điểm (kiểu Bermudan). Số cổ phiếu nhận được khi chuyển đổi là **conversion ratio** $\kappa$. Vì người nắm giữ *có quyền chọn* thời điểm và có quyền *không* chuyển, quyền này chính là một call option viết trên cổ phiếu công ty, nhúng vào trong trái phiếu. Công thức xương sống của cả chương gọn lỏn:

$$\text{Convertible} = \text{Straight bond} + \text{Embedded call trên equity}.$$

Nhà đầu tư đổi lấy điều gì khi mua CB thay vì trái phiếu thường? Họ nhận **coupon thấp hơn** — vì đã được trả một phần "phí" dưới dạng quyền chuyển đổi sinh lời nếu cổ phiếu bay lên. Nhà phát hành đổi lấy điều gì? Vốn vay **rẻ hơn** (coupon thấp) đổi bằng khả năng bị pha loãng (dilution) cổ đông nếu chuyển đổi xảy ra. Đây là một cây cầu equity-debt: startup và công ty tăng trưởng thích CB vì bán được "upside cổ phiếu tương lai" ngay hôm nay để hạ chi phí lãi vay. Một cách nhìn khác đắt giá cho desk: nhà phát hành CB thực chất đang **bán vol dài hạn trên chính cổ phiếu mình** — và thường bán rẻ, vì họ định giá theo nhu cầu vốn chứ không theo fair vol. Chỗ "bán rẻ vol" này về sau là mỏ vàng của convertible arb (16.4).

**Conversion ratio và conversion price.** Conversion ratio $\kappa$ được ấn định lúc phát hành, thường quy chiếu về mệnh giá (par) $F$. **Conversion price** $K_c$ là giá cổ phiếu ngầm định mà tại đó đổi trái phiếu lấy cổ phiếu là hoà vốn theo mệnh giá:

$$K_c = \frac{F}{\kappa}.$$

Ví dụ số nền tảng — running example của cả chương. Một CB mệnh giá $F = \$1000$, conversion ratio $\kappa = 20$. Vậy conversion price $K_c = 1000/20 = \$50$. Nghĩa là: nhà phát hành ngầm bán cho bạn cổ phiếu ở mức $\$50$; chỉ khi spot vượt $\$50$ thì việc "xé" trái phiếu ra lấy cổ phiếu mới bắt đầu có lời so với mệnh giá. Con số $\$50$ này là strike của embedded call — hãy giữ chặt. Lưu ý một cạm bẫy thuật ngữ: conversion price $\$50$ *không* phải giá cổ phiếu hôm nay; nó là strike. Cổ phiếu hôm nay có thể đang ở $\$40$ (dưới strike) — CB vẫn có giá trị vì embedded call còn thời gian để cổ phiếu leo qua $\$50$.

**Parity (conversion value).** Đây là giá trị bạn thu được *ngay lập tức* nếu chuyển đổi bây giờ — bằng số cổ phiếu nhân giá spot $S$:

$$\text{Parity} = \kappa \cdot S.$$

Với spot $S = \$40$: parity $= 20 \times 40 = \$800$. Đọc con số: nếu bạn xé trái phiếu ra lấy 20 cổ phiếu ngay lúc này, bạn có $\$800$ — thấp hơn mệnh giá $\$1000$, nên chuyển đổi ngay là dại. Cổ phiếu đang giao dịch dưới conversion price ($40 < 50$), embedded call đang **out-of-the-money**. Parity là đường thẳng qua gốc với độ dốc $\kappa$: cứ mỗi $\$1$ spot lên, parity lên $\$20$. Vẽ được đường parity là vẽ được một nửa bức tranh CB.

**Bond floor (investment value).** Đây là giá trị của trái phiếu nếu ta *quên hẳn* quyền chuyển đổi — chỉ là chuỗi coupon cộng mệnh giá, chiết khấu ở mức lợi suất phù hợp với rủi ro tín dụng của nhà phát hành (tức curve phi rủi ro cộng credit spread của tên đó). Bond floor là "sàn": dù cổ phiếu có sập về 0, trái phiếu vẫn đáng ít nhất bằng nó (miễn công ty không default). Tính bond floor cho running example: coupon $2.5\%$/năm trên mệnh giá $\$1000$ (tức $\$25$/năm), kỳ hạn 5 năm, chiết khấu ở mức $5\%$ (curve $3\%$ cộng credit spread $2\%$). Giá trị hiện tại của chuỗi coupon cộng par:

$$\text{Bond floor} = \sum_{i=1}^{5} \frac{25}{(1.05)^i} + \frac{1000}{(1.05)^5}.$$

Tính từng bước, không nhảy cóc. Trước hết $1.05^{-5} = 0.78353$. Annuity của $\$25$ trong 5 năm ở $5\%$: hệ số annuity $= \frac{1 - 1.05^{-5}}{0.05} = \frac{1 - 0.78353}{0.05} = \frac{0.21647}{0.05} = 4.32948$, nên phần coupon $= 25 \times 4.32948 = \$108.24$. Phần mệnh giá $= 1000 \times 0.78353 = \$783.53$. Cộng lại: **bond floor $= 108.24 + 783.53 = \$891.76 \approx \$892$**. Con số này *dưới* par ($\$1000$) vì lợi suất chiết khấu ($5\%$) cao hơn coupon ($2.5\%$) — trái phiếu coupon-thấp luôn giao dịch dưới mệnh giá. Để thấy độ nhạy: nếu cùng CB đó có coupon $4\%$ ($\$40$/năm), bond floor lên $\$956.71$ — coupon cao kéo sàn lên gần par. Ta giữ con số $\approx \$892$ (coupon $2.5\%$) làm mốc cho cả chương.

Bây giờ ráp thành một **định giá thô**. Trực giác đầu tiên, thô nhưng cực kỳ hữu dụng để "sanity-check": giá trị CB không thể thấp hơn cái lớn hơn giữa bond floor và parity, vì cả hai đều là quyền chọn của người nắm giữ (giữ như bond, hoặc đổi lấy cổ phiếu). Vậy

$$\text{Giá CB} \approx \max(\text{bond floor},\, \text{parity}) + \text{option time value}.$$

Với ví dụ: $\max(892, 800) = 892$; nhưng vì spot $\$40$ chưa quá xa conversion price $\$50$ và còn 5 năm, embedded call có **time value** đáng kể. Giả sử thị trường định giá CB ở $\approx \$960$ (con số này ta sẽ tái tạo bằng mô hình ở 16.3; giờ nhận làm quote thị trường). Ta đọc ba con số quan trọng mà mọi trader convertible nhìn đầu tiên:

- **Premium over parity** $= \frac{960 - 800}{800} = 20.0\%$. Bạn trả cao hơn giá trị chuyển đổi tức thời $20\%$ — đó là "học phí" mua option time value và bond protection.
- **Premium over bond floor** $= \frac{960 - 892}{892} = 7.6\%$. Bạn trả cao hơn giá trị trái phiếu thuần $7.6\%$ — đó là "học phí" mua upside cổ phiếu.
- CB đang ở vùng **"balanced"** (hybrid) — không quá gần equity (parity thấp hơn giá), cũng không quá gần bond (giá cao hơn floor rõ). Đây là vùng ngọt của convertible arb, ta sẽ thấy ở 16.4.

Hai premium này là hai mặt của một đồng xu và luôn cộng lại theo một logic đơn giản: premium over parity đo bạn "đắt" hơn kịch bản equity bao nhiêu, premium over bond floor đo bạn "đắt" hơn kịch bản bond bao nhiêu. Khi CB dịch về equity-like (spot cao), premium over parity co về 0 còn premium over bond floor phình to; khi dịch về bond-like (spot thấp), điều ngược lại. Vị trí trên phổ đó chính là "nhân cách" của một CB tại một thời điểm.

Một bảng nhỏ tổng kết bốn đại lượng cho running example, để cắm chặt vào đầu:

| Đại lượng | Công thức | Con số |
|---|---|---|
| Conversion ratio $\kappa$ | ấn định | 20 |
| Conversion price $K_c$ | $F/\kappa$ | \$50 |
| Parity | $\kappa S$ | \$800 (tại $S=40$) |
| Bond floor | PV(coupon+par @ risky yield) | \$892 |
| Giá thị trường | mô hình / quote | \$960 |
| Premium over parity | $(P-\text{parity})/\text{parity}$ | 20% |
| Premium over bond floor | $(P-\text{floor})/\text{floor}$ | 7.6% |

## 16.2 Ba thành phần giá trị và Greeks

Vì sao mục này tồn tại: bởi vì convertible là một con thú *biến hình*. Cùng một trái phiếu, khi cổ phiếu ở $\$20$ nó cư xử như một trái phiếu tín dụng thuần; khi cổ phiếu ở $\$100$ nó cư xử gần như cổ phiếu; ở giữa nó là một mớ Greeks trộn. Không hiểu ba thành phần và ánh xạ của chúng sang delta thì không thể hedge.

Bóc CB ra thành ba khối, mỗi khối có nhóm risk factor riêng:

1. **Bond floor** — nhạy với **rates** ($\rho$-risk, duration) và **credit spread**. Đây là phần "nợ". Credit spread nới rộng $\Rightarrow$ discount rate risky tăng $\Rightarrow$ bond floor tụt. Đây là chỗ Chương 13 (hazard rate, credit spread) chảy thẳng vào: bond floor thực chất là một **risky bond**, giá trị của nó là kỳ vọng survival-weighted của dòng tiền, và nó *bập bênh* theo $\lambda$.

2. **Embedded equity call** — nhạy với **spot** ($\Delta, \Gamma$) và **vol** (vega $\mathcal{V}$). Đây là phần "option". Toàn bộ trực giác Greeks của Chương 5 áp thẳng vào đây: call dài hạn trên cổ phiếu công ty.

3. **Tương tác credit-equity** — không phải tổng hai khối rời rạc, vì khi cổ phiếu sập về vùng distressed thì *credit spread cũng nới rộng* (leverage effect, đã gặp ở 6.1 và 13.2 Merton). Bond floor và embedded call **không độc lập** — chúng liên kết qua giá trị công ty. Đây là lý do định giá đúng cần một mô hình gắn credit vào equity, không phải cộng hai module rời.

**Delta của convertible — tính bằng số.** Delta ở đây là độ nhạy giá CB theo spot cổ phiếu, chuẩn hoá về "số cổ phiếu tương đương" hoặc về đơn vị $\partial P_{CB}/\partial S$. Vì phần bond floor gần như không đổi theo $S$ (trong vùng không distressed), toàn bộ delta đến từ embedded call. Delta của CB theo *một cổ phiếu* là:

$$\Delta_{CB} = \kappa \cdot \Delta_{\text{call}},$$

với $\Delta_{\text{call}} = N(d_1)$ là delta Black-Scholes của một embedded call đơn lẻ. Cắm số cho running example: spot $S = 40$, strike $K_c = 50$, $T = 5$ năm, vol $\sigma = 30\%$, $r = 3\%$, dividend $q = 1\%$. Tính $d_1$ từng bước:

$$d_1 = \frac{\ln(40/50) + (r - q + \tfrac{1}{2}\sigma^2)\,T}{\sigma\sqrt{T}}.$$

Tử số: $\ln(40/50) = \ln(0.8) = -0.2231$; phần drift $(0.03 - 0.01 + \tfrac{1}{2}\times 0.30^2) = 0.02 + 0.045 = 0.065$, nhân $T=5$ được $0.325$; tổng tử số $= -0.2231 + 0.325 = 0.1019$. Mẫu số: $\sigma\sqrt{T} = 0.30 \times \sqrt{5} = 0.30 \times 2.2361 = 0.6708$. Vậy

$$d_1 = \frac{0.1019}{0.6708} = 0.1518, \qquad d_2 = d_1 - \sigma\sqrt{T} = 0.1518 - 0.6708 = -0.5190.$$

Tra $N(d_1) = N(0.1518) = 0.5603$. Vậy $\Delta_{\text{call}} \approx 0.56$ trên mỗi cổ phiếu, và **delta của cả trái phiếu** $\Delta_{CB} = 20 \times 0.5603 = 11.2$ — nghĩa là CB này cư xử như thể bạn đang long 11.2 cổ phiếu. Để trung hoà rủi ro equity, trader convertible arb sẽ short 11.2 cổ phiếu cho mỗi trái phiếu nắm giữ. Con số $\Delta_{\text{call}} \approx 0.56$ (nằm gọn trong vùng điển hình $0.4$–$0.6$ của một CB "balanced") xác nhận: đây là con thú lai — nửa bond, nửa equity.

**Gamma và vega.** Vì embedded call là long option, CB có **gamma dương** — delta tăng khi cổ phiếu lên, giảm khi cổ phiếu xuống. Gamma của một cổ phiếu equity call:

$$\Gamma_{\text{call}} = \frac{\phi(d_1)}{S\sigma\sqrt{T}} = \frac{\phi(0.1518)}{40 \times 0.30 \times \sqrt{5}} = \frac{0.3944}{26.83} = 0.01470,$$

trong đó $\phi(0.1518) = \frac{1}{\sqrt{2\pi}}e^{-0.1518^2/2} = 0.3944$. Nhân $\kappa = 20$: $\Gamma_{CB} = 20 \times 0.01470 = 0.294$ trên mỗi trái phiếu. Con số này nói: khi spot dịch $\$1$, delta của CB (đo bằng số cổ phiếu tương đương) đổi khoảng $0.29$ — đây chính là nhiên liệu của gamma scalping ở 16.4. Vega của một cổ phiếu call:

$$\mathcal{V}_{\text{call}} = S\,\phi(d_1)\sqrt{T} = 40 \times 0.3944 \times 2.2361 = 35.3.$$

Đây là độ nhạy theo *một đơn vị vol* (tức khi $\sigma$ đi từ $0.30$ lên $1.30$ — một quãng $100$ điểm vol). Trader hầu như luôn quote vega **trên một vol-point** (một điểm phần trăm, $\Delta\sigma = 0.01$), nên chia cho 100: **vega per vol-point $= 35.3 / 100 = \$0.353$** mỗi cổ phiếu. Nhân $\kappa = 20$ để ra vega của cả trái phiếu: $\mathcal{V}_{CB} = 20 \times 0.353 = \$7.05$ mỗi vol-point trên mệnh giá $\$1000$ (tương đương $\$705$ nếu vol dịch trọn một đơn vị $1.0$). Đọc con số: nếu implied vol của cổ phiếu tăng $1$ điểm (từ $30\%$ lên $31\%$), CB này lời khoảng $\$7$ trên mỗi $\$1000$ mệnh giá. CB **long vega** — mua CB là mua vol, và (điểm mấu chốt ở 16.4) thường mua *rẻ hơn* vol vanilla cùng kỳ hạn.

**Biến hình theo spot — ba chế độ.** Đây là bảng phân vai đắt nhất của cả chương, đáng ghi nhớ như một phổ liên tục:

| Chế độ | Spot | Delta $\Delta_{\text{call}}$ | Cư xử như | Rủi ro chủ đạo |
|---|---|---|---|---|
| **Equity-like ("in-the-money")** | $S \gg K_c$, ví dụ $S=100$ | $\to 1.0$ | cổ phiếu (gấp $\kappa$) | spot, vol nhẹ dần |
| **Balanced (hybrid)** | $S \approx K_c$, ví dụ $S=40$–$55$ | $0.4$–$0.6$ | lai bond-equity | spot, vol, credit — tất cả |
| **Bond-like / distressed** | $S \ll K_c$, ví dụ $S=15$ | $\to 0$ | trái phiếu tín dụng | credit spread, recovery |

Cắm số hai đầu để thấy phổ trải ra sao. Nếu spot bay lên $\$100$ (gấp đôi conversion price), embedded call sâu in-the-money, $\Delta_{\text{call}} \to 0.95$+, CB dính chặt vào parity ($\kappa S = 20 \times 100 = \$2000$) và cư xử gần như 20 cổ phiếu — trái phiếu "biến mất", chỉ còn cổ phiếu, và premium over parity teo về gần 0. Ngược lại, nếu spot sập về $\$15$ (distressed), parity chỉ còn $20 \times 15 = \$300$, embedded call gần như vô giá trị, $\Delta_{\text{call}} \to 0.1$, và CB co lại về **bond floor** — nhưng đây là chỗ nguy hiểm nhất: khi cổ phiếu distressed, credit spread nới rộng dữ dội, nên bond floor *tự nó cũng sụp*. Một CB "bond-like" không phải nơi trú ẩn an toàn; nó là một trái phiếu tín dụng rủi ro cao đội lốt trái phiếu. Đây gọi là **"busted convertible"** — quyền chuyển đổi đã chết, chỉ còn credit risk trần trụi, và delta gần 0 khiến việc hedge bằng short cổ phiếu trở nên vô nghĩa (không còn equity sensitivity để hedge, chỉ còn credit). Chính hiện tượng bond floor bập bênh theo credit này là lý do ta cần định giá đúng ở mục sau: nếu bạn mô hình bond floor như một hằng số phẳng, bạn sẽ nghĩ mình đang cầm một cái sàn cứng $\$892$, trong khi thực tế cái sàn đó lún đúng lúc bạn cần nó nhất.

## 16.3 Định giá đúng — cây một nhân tố equity với chiết khấu điều chỉnh credit

Vì sao mục này tồn tại: bởi vì công thức thô $\max(\text{floor}, \text{parity}) + \text{time value}$ ở 16.1 chỉ để sanity-check; nó không xử lý được early exercise (CB kiểu Mỹ), không xử lý được call/put provision của nhà phát hành, và tệ nhất — không xử lý được cái *tương tác* credit-equity mà ta vừa thấy là cốt lõi. Định giá production cần một engine số thực thụ.

**Bài toán một nhân tố equity với credit-adjusted discounting.** Cách kinh điển của industry (mô hình Tsiveriotis-Fernandes, 1998) dựng một cây **binomial** một nhân tố cho cổ phiếu $S$, y hệt cây của Chương 12, nhưng với một tinh xảo về chiết khấu. Ý tưởng cốt lõi: dòng tiền của CB có hai loại số phận rất khác nhau khi công ty default.

- Phần giá trị đến từ **chuyển đổi** (equity component): nếu công ty default, người nắm giữ đã/đang cầm cổ phiếu, nên phần này chiết khấu ở mức **phi rủi ro** $r$ (rủi ro default đã nằm trong động lực học của $S$ rồi).
- Phần giá trị đến từ **cash flow trái phiếu** chưa chuyển đổi (bond component): nếu công ty default, khoản này chỉ thu hồi được recovery, nên nó phải chiết khấu ở mức **risky** $r + s$ với $s$ là credit spread (hay tương đương, dùng hazard rate $\lambda$ của Chương 13).

Tsiveriotis-Fernandes tách giá CB thành $V = B + E$ với $B$ là "cash-only part" (phần dòng tiền tiền mặt sẽ đến nếu holder không chuyển đổi) và $E = V - B$ là phần còn lại (phần equity/chuyển đổi), rồi cho hai phần chiết khấu ở hai rate khác nhau trên cùng một cây. Đây chính là cách credit "làm bond floor bập bênh" được đưa vào một cách nhất quán: chỉ đúng phần dòng tiền phụ thuộc công ty sống sót mới bị phạt bằng credit spread, còn phần đã hoá cổ phiếu thì không.

**Backward induction trên cây — nghi thức tại mỗi nút.** Dựng cây $S$ với up-factor $u = e^{\sigma\sqrt{\Delta t}}$, down-factor $d = 1/u$, risk-neutral prob $p = \frac{e^{(r-q)\Delta t} - d}{u - d}$ (y hệt Chương 12). Tại **đáo hạn** $T$, giá trị mỗi nút là

$$V_T = \max(\kappa S_T,\; F),$$

người nắm giữ chọn cái lớn hơn giữa chuyển đổi lấy cổ phiếu và nhận mệnh giá. Rồi cuộn ngược. Tại mỗi nút thời điểm $t$, ba bước theo đúng thứ tự:

1. **Continuation value** — chiết khấu kỳ vọng giá trị nút con, với phần bond chiết khấu risky, phần equity chiết khấu risk-free (đây là cái tinh xảo T-F).
2. **Holder's option** — người nắm giữ có thể chuyển đổi ngay: $V \leftarrow \max(V_{\text{cont}},\; \kappa S_t)$. Nếu có **put provision** (holder được bán lại cho issuer ở giá $P_{\text{put}}$): $V \leftarrow \max(V,\; P_{\text{put}})$.
3. **Issuer's option** — nếu có **call provision** (issuer được mua lại ở $P_{\text{call}}$, thường buộc holder hoặc nhận tiền hoặc chuyển đổi ngay — "forced conversion"): $V \leftarrow \min(V,\; \max(P_{\text{call}}, \kappa S_t))$.

Thứ tự này *có ý nghĩa*: issuer call trước, buộc holder phản ứng (chuyển đổi nếu parity cao). Call provision là lý do CB có upside bị "chặn trần mềm" — khi cổ phiếu bay quá cao, issuer gọi lại để cắt dilution, buộc chuyển đổi. Đây là điểm cấu trúc mà một mô hình chỉ dùng $\max(\text{floor}, \text{parity})$ bỏ sót hoàn toàn.

**Ví dụ số một bước — thấy credit làm bond floor bập bênh.** Xét một CB đơn giản hoá: mệnh giá $F = \$1000$, $\kappa = 20$, còn 1 năm, một bước cây. Spot $S_0 = 40$, vol $\sigma = 30\%$, $r = 3\%$, hazard rate $\lambda = 2\%$ (từ Chương 13; credit spread $s \approx \lambda(1-R) = 2\% \times 0.6 = 120\,\text{bp}$ với $R = 40\%$). Up $u = e^{0.30\sqrt{1}} = e^{0.30} = 1.350$, down $d = 1/u = 0.741$. Hai nút cuối:

- **Nút up**: $S_u = 40 \times 1.350 = 53.99 \Rightarrow$ parity $= 20 \times 53.99 = \$1080 > F$, holder chuyển đổi, $V_u = \$1080$. Phần này là equity (đã hoá cổ phiếu), chiết khấu risk-free.
- **Nút down**: $S_d = 40 \times 0.741 = 29.63 \Rightarrow$ parity $= 20 \times 29.63 = \$593 < F$, holder giữ bond và nhận mệnh giá, $V_d = \max(593, 1000) = \$1000$. Phần này là cash bond, chiết khấu risky.

Risk-neutral prob (ở đây $q$ đã gộp; dùng $r$ thuần cho gọn): $p = \frac{e^{0.03} - 0.741}{1.350 - 0.741} = \frac{1.0305 - 0.741}{0.609} = \frac{0.2895}{0.609} = 0.4756$.

Continuation value, chiết khấu **tách rate**: phần đến từ nút up là equity ($\$1080$, chiết khấu ở $r = 3\%$), phần đến từ nút down là bond ($\$1000$, chiết khấu ở $r + s = 4.2\%$):

$$V_0 = p \cdot 1080 \cdot e^{-0.03} + (1-p)\cdot 1000 \cdot e^{-0.042}.$$

Tính từng số hạng: $e^{-0.03} = 0.9704$, $e^{-0.042} = 0.9589$. Nhánh up: $0.4756 \times 1080 \times 0.9704 = 498.4$. Nhánh down: $0.5244 \times 1000 \times 0.9589 = 502.9$. Tổng $V_0 = 498.4 + 502.9 = \$1001.3$.

So sánh phản-thực để cô lập tác động credit: nếu ta *sai lầm* chiết khấu **cả hai** nhánh ở risk-free $3\%$, nhánh down thành $0.5244 \times 1000 \times 0.9704 = 508.9$, tổng lên $\$1007.4$ — cao hơn $\$6.1$. Chênh lệch **$\$6.1$** trên một bước, một năm, chính là **credit haircut** áp lên phần bond của CB; trên nhiều bước và tên spread rộng, nó dễ dàng thành nhiều điểm giá. Đây là con số cụ thể cho câu "credit làm bond floor bập bênh": phần dòng tiền phụ thuộc công ty sống sót bị chiết khấu nặng hơn, và nó chỉ áp lên đúng phần bond ($\$1000$ ở nhánh down) chứ không áp lên phần equity ($\$1080$ ở nhánh up, đã hoá cổ phiếu nên miễn nhiễm với default). Đúng tinh thần Tsiveriotis-Fernandes: tách $V = B + E$, phạt credit chỉ lên $B$.

**Hai-nhân-tố và khi nào cần nó.** Mô hình T-F một nhân tố coi credit spread là **hằng số** (hoặc hàm tất định của spot). Thực tế credit spread ngẫu nhiên, và tệ hơn — nó **tương quan âm với spot** (cổ phiếu xuống, spread lên). Với CB gần vùng distressed, sai số này lớn. Mô hình **hai nhân tố** (equity + credit) cho $S$ và hazard rate $\lambda$ (hoặc firm value kiểu Merton, 13.2) cùng khuếch tán, tương quan $\rho_{S\lambda} < 0$. Khi đó bond floor tự nó là ngẫu nhiên và neo vào cùng cú sốc kéo cổ phiếu xuống — bắt đúng "double whammy" của busted convertible: spot rơi kéo parity rơi, đồng thời spread nới kéo bond floor rơi, hai cái sụp cùng một cú. Cái giá: cây/PDE hai chiều, calibrate thêm một chiều credit, và số liệu credit của tên nhỏ thường mỏng. Ranh giới thực chiến: **một nhân tố cho CB investment-grade balanced/equity-like** (credit ổn định, chi phối bởi equity option); **hai nhân tố cho high-yield / gần distressed** (nơi tương tác credit-equity là bản chất). Về mặt kỹ thuật, khi bước sang chế độ liên tục, cây binomial hội tụ về một **PDE một chiều** (Chương 12) với số hạng nguồn kiểu hazard $\lambda(V - \text{recovery value})$ — chính là convection-diffusion equation của equity cộng một reaction term default; ai đã đọc 12.3 sẽ thấy nó là người anh em của Black-Scholes PDE có thêm một số hạng: khi $\lambda \to 0$ nó thoái về đúng BS PDE, và $\lambda$ càng lớn thì reaction term càng kéo giá về recovery.

## 16.4 Convertible arbitrage — long con thú, short cổ phiếu, thu ba nguồn tiền

Vì sao mục này tồn tại: bởi vì convertible arb là *lý do* toàn bộ mảng này có tính thanh khoản và có desk sell-side phục vụ. Đây là chiến lược hedge fund kinh điển, và hiểu nó là hiểu vì sao CB được định giá như hiện tại — arbitrageur là người mua biên (marginal buyer), nên fair value của CB thực chất bị neo bởi mức vol mà một convertible-arb desk sẵn lòng trả.

**Cấu trúc vị thế.** Trader **long convertible bond** và **short delta cổ phiếu** ($\Delta_{CB}$ cổ phiếu cho mỗi trái phiếu, tính ở 16.2 là 11.2 cổ phiếu). Vị thế này **delta-neutral**: cú dịch nhỏ của spot không làm P&L đổi theo bậc nhất. Vậy tiền đến từ đâu? Ba nguồn, mỗi nguồn có một cơ chế riêng:

**Nguồn 1 — Carry (coupon trừ chi phí short).** Trái phiếu trả coupon; vị thế short cổ phiếu nhận **short rebate** (lãi trên tiền thu được từ bán khống) nhưng phải trả **borrow cost** (phí mượn cổ phiếu) và **dividend** cho bên cho mượn. Net carry:

$$\text{Carry} = \underbrace{\text{coupon CB}}_{\text{thu}} + \underbrace{\text{short rebate}}_{\text{thu}} - \underbrace{\text{borrow cost}}_{\text{trả}} - \underbrace{\text{dividend trên short}}_{\text{trả}}.$$

Ví dụ số: coupon $2.5\%$ trên $\$1000 = \$25$/năm. Short $11.2$ cổ phiếu $\times \$40 = \$448$ giá trị short. Short rebate $2.5\%$ trên $\$448 = \$11.20$; borrow cost $0.5\% \times 448 = \$2.24$; dividend $1\% \times 448 = \$4.48$. Net carry $= 25 + 11.20 - 2.24 - 4.48 = \$29.48$/năm. Trên vốn bỏ ra (giá CB $\$960$), đó là $29.48/960 = 3.07\%$/năm. Carry dương ổn định — dòng tiền "chờ đợi được trả tiền", và nó là tấm đệm giữ vị thế sống qua các quý cổ phiếu đứng im (không có gamma để scalp).

**Nguồn 2 — Gamma (long vol rẻ).** Đây là trái tim của chiến lược. Vì CB long embedded call, vị thế delta-hedged có **gamma dương**: khi cổ phiếu dao động, trader **re-hedge** — cổ phiếu lên thì delta CB tăng nên short thêm (bán cao); cổ phiếu xuống thì delta giảm nên mua lại short (mua thấp). Mỗi vòng dao động khoá lại một chút lời. Đây là **gamma scalping** — y hệt cơ chế của một long option delta-hedged ở Chương 5/6, nhưng CB thường cho ta mua gamma này *rẻ hơn* vol vanilla cùng kỳ hạn, vì thị trường CB kém hiệu quả và issuer "bán rẻ" vol khi phát hành.

Cơ chế P&L của gamma scalping, viết chuẩn theo hiệu vol. Với một long option đã delta-hedge, P&L (bỏ qua carry, đã tách ra ở Nguồn 1) trên một quãng thời gian $\Delta t$ xấp xỉ:

$$\text{P\&L}_\Gamma \approx \tfrac{1}{2}\,\Gamma_{CB}\,S^2\big(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2\big)\,\Delta t.$$

Đây là *cùng một* công thức "gamma lời − theta bleed", chỉ viết gọn: số hạng $\tfrac12\Gamma S^2\sigma_{\text{real}}^2\Delta t$ là lời từ scalping theo vol thực tế, số hạng $\tfrac12\Gamma S^2\sigma_{\text{impl}}^2\Delta t$ là **time decay** (theta) đúng bằng lượng vol đã trả trong giá — hai số hạng bù nhau khi realized = implied, và P&L ròng chỉ đến từ *hiệu* của hai vol. Cắm số cho running example trên **một năm** ($\Delta t = 1$), $\Gamma_{CB} = 0.294$, $S = 40$, giả sử trader mua CB ở implied vol $\sigma_{\text{impl}} = 28\%$ nhưng cổ phiếu thực sự dao động ở $\sigma_{\text{real}} = 32\%$:

- Gross gamma (lời scalping ở vol thực) $= \tfrac{1}{2}\times 0.294 \times 40^2 \times 0.32^2 \times 1 = \tfrac12 \times 0.294 \times 1600 \times 0.1024 = \$24.1$.
- Theta cost (time decay đúng bằng vol đã trả) $= \tfrac{1}{2}\times 0.294 \times 1600 \times 0.28^2 = \tfrac12 \times 0.294 \times 1600 \times 0.0784 = \$18.4$.
- **P&L gamma ròng $= 24.1 - 18.4 = \$5.6$** mỗi trái phiếu, một năm — hay trực tiếp qua công thức hiệu vol: $\tfrac12 \times 0.294 \times 1600 \times (0.1024 - 0.0784) = \$5.6$.

**Điểm cốt lõi**: gamma scalping có lời **khi và chỉ khi realized vol > implied vol** đã trả trong giá CB. Ở đây $32\% > 28\%$ nên P&L dương $\$5.6$/bond; nếu cổ phiếu chỉ dao động $24\%$ (dưới implied $28\%$), số hạng hiệu vol âm và trader *mất* tiền gamma — long option mà vol thực thấp hơn vol đã mua thì theta ăn mòn nhiều hơn scalping bù lại. Vì CB thường cho mua vol *dưới* mức fair vanilla (issuer bán rẻ), $\sigma_{\text{impl}}$ trong giá CB thấp, nên biên $\sigma_{\text{real}} - \sigma_{\text{impl}}$ có xu hướng dương — đó là "long vol rẻ" cụ thể hoá bằng số. (Cạm bẫy quy mô: nếu ai đó bảo bạn tổng bình phương bước ngày $\sum(\Delta S_j)^2$ của quý là $900$, hãy giật mình — với $S=40$ điều đó hàm ý realized vol quanh $150\%$, vô lý; realized $32\%$/năm chỉ cho $\sum(\Delta S_j)^2 \approx S^2\sigma^2 = 1600\times0.1024 \approx 164$ trên cả năm. Luôn kiểm tra quy mô của proxy variance trước khi tin con số gamma P&L.)

Cộng carry và gamma cho bức tranh một năm của running example: $\$29.5$ (carry) $+ \$5.6$ (gamma ròng) $= \$35.1$/bond, tức $35.1/960 \approx 3.7\%$ trên vốn — trước đòn bẩy. Với đòn bẩy $4$–$5$ lần điển hình thời tiền-2008, con số này phóng lên hai chữ số. Đó là sức hút, và cũng là mầm hoạ.

**Nguồn 3 — Credit / mispricing.** Trader thường hedge nốt phần credit (short credit qua CDS hoặc short bond của cùng issuer, xem Chương 13), cô lập vị thế còn lại về **thuần vol**. Phần này thu lời nếu CB được mua ở implied vol rẻ so với vol thị trường, hoặc nếu credit spread thắt lại. Một convertible arb sạch, sau khi hedge cả delta lẫn credit, về bản chất là một **long-volatility position mua với chiết khấu** — trader không cá cược hướng cổ phiếu, không cá cược hướng credit, chỉ cá cược rằng vol thực sẽ cao hơn vol họ đã trả.

**Vì sao chiến lược đẹp — và vì sao 2008 xoá sổ nó.** Trong điều kiện bình thường, convertible arb là cỗ máy in tiền chậm: carry dương, gamma dương, hedge sạch, biến động thấp. Nhưng nó phụ thuộc sống còn vào **ba giả định vô hình**: (1) short được cổ phiếu (mượn được, không bị cấm), (2) CB có thanh khoản để mua/bán và định giá theo mark thị trường, (3) đòn bẩy (leverage) tiếp tục được cấp bởi prime broker. Cả ba đổ sập cùng lúc năm 2008.

Khi Lehman sụp (tháng 9/2008), chuỗi sự kiện dây chuyền: **thanh khoản CB bay hơi** — không ai muốn cầm hybrid phức tạp, spread mua-bán nới rộng khủng khiếp, mark-to-market lao dốc dù fair value không đổi. Đồng thời cơ quan quản lý ra **lệnh cấm short-sell cổ phiếu tài chính** — phá thẳng vào chân hedge của chiến lược: không short được thì không delta-neutral được, vị thế phơi trần rủi ro equity đúng lúc cổ phiếu sập. Cuối cùng **prime broker rút margin** (nhiều fund dùng Lehman làm PB, tài sản bị đóng băng trong phá sản), buộc **deleveraging cưỡng bức** — bán CB vào một thị trường không người mua, đè giá xuống sâu hơn, kích hoạt margin call tiếp cho fund khác. Vòng xoáy tự-củng-cố. Kết quả: chỉ số convertible arbitrage **giảm khoảng $50\%$** trong 2008 — một trong những cú sụt tệ nhất của bất kỳ chiến lược hedge fund nào. Bài học desk-quant: **P&L của một chiến lược "market-neutral" không phải là không rủi ro — nó là rủi ro thanh khoản, rủi ro funding, và rủi ro cấu trúc thị trường (lệnh cấm short) được gói lại thành một cú tail.** CB fair value có thể đúng tuyệt đối mà fund vẫn phá sản, vì fund không sống bằng fair value — nó sống bằng khả năng roll funding và giữ hedge. Đây là lý do sau 2008, convertible arb chạy với đòn bẩy thấp hơn nhiều và quan tâm sát sao tới liquidity của từng dòng CB.

## 16.5 Mandatory convertibles và CoCo/AT1 — hybrid capital

Vì sao mục này tồn tại: cho tới giờ quyền chuyển đổi luôn nằm trong tay *người nắm giữ* — đó là một call có lợi cho nhà đầu tư. Mảng cuối cùng lộn ngược nó: chuyển đổi trở thành nghĩa vụ hoặc trở thành cơ chế hấp thụ lỗ có lợi cho *nhà phát hành* — và đó là xương sống của vốn quy định ngân hàng hậu-2008.

**Mandatory convertible.** Khác CB thường ở một điểm sinh tử: chuyển đổi thành cổ phiếu là **bắt buộc** tại đáo hạn, không phải quyền chọn. Nhà đầu tư *chắc chắn* nhận cổ phiếu — nên payoff của họ giống long cổ phiếu nhiều hơn long bond. Cấu trúc điển hình dùng hai conversion price để tạo vùng "phẳng" bảo vệ: nhận nhiều cổ phiếu hơn khi giá thấp, ít hơn khi giá cao. Về mặt option, payoff mandatory tại đáo hạn $\approx$ long cổ phiếu $-$ một **call spread** (bán đi phần upside giữa hai conversion price), nên nó **hy sinh phần lớn upside** để đổi lấy coupon cao hơn CB thường. Vì gần equity, delta của mandatory cao ($0.8$–$1.0$), gamma thấp — nó không phải công cụ gamma scalp mà là công cụ *income equity*. Con số điển hình: coupon $6$–$8\%$ (cao hơn hẳn $2.5\%$ của CB thường ở running example), đổi bằng việc từ bỏ bond floor bảo vệ downside — nếu cổ phiếu sập, holder mandatory vẫn buộc phải nhận cổ phiếu đã mất giá, không có sàn nào đỡ.

**CoCo / AT1 — contingent convertible.** Đây là instrument quan trọng nhất của mục này và là sản phẩm đặc trưng của hậu-2008. Sau khi khủng hoảng cho thấy ngân hàng "too big to fail" phải được nhà nước cứu bằng tiền thuế dân, Basel III đẻ ra một loại vốn tự hấp thụ lỗ: **Additional Tier 1 (AT1)** capital, mà công cụ điển hình là **contingent convertible bond (CoCo)**. Ý tưởng lộn ngược hoàn toàn convertible thường: chuyển đổi (hoặc write-down) được **kích hoạt bởi sức khoẻ ngân hàng xuống dưới ngưỡng**, và nó có lợi cho ngân hàng (hấp thụ lỗ), gây hại cho trái chủ.

**Cơ chế trigger.** CoCo tự động chuyển đổi thành cổ phiếu, hoặc bị **write-down** (xoá một phần/toàn bộ mệnh giá), khi **CET1 ratio** (Common Equity Tier 1 chia tài sản có trọng số rủi ro RWA — thước đo vốn lõi, xem Chương 15 FRTB/capital) tụt xuống dưới ngưỡng ghi trong hợp đồng, thường $5.125\%$ (low-trigger) hoặc $7\%$ (high-trigger). Trực giác: khi ngân hàng suy yếu tới mức nguy hiểm, CoCo "bốc hơi" thành vốn — hoặc trái chủ thành cổ đông (equity-conversion), hoặc trái chủ mất tiền thẳng (write-down) — bơm vốn cho ngân hàng đúng lúc cần nhất mà không cần tiền thuế. Hai kiểu hấp thụ lỗ:

- **Equity-conversion CoCo**: trigger $\Rightarrow$ CoCo biến thành cổ phiếu ở một tỷ lệ định trước. Trái chủ ít nhất còn cầm cổ phiếu (dù đã mất giá).
- **Write-down CoCo**: trigger $\Rightarrow$ mệnh giá bị xoá (temporary hoặc permanent). Trái chủ mất trắng phần bị xoá — không nhận gì. Đây là loại tàn nhẫn hơn với nhà đầu tư.

**Rủi ro đặc thù và vì sao coupon cao.** CoCo trả coupon **cao** — điển hình $6$–$9\%$ — vì trái chủ gánh một chồng rủi ro mà bond thường không có:

1. **Trigger risk / hấp thụ lỗ**: mất vốn khi CET1 thủng ngưỡng, đúng lúc thị trường hoảng loạn (tương quan xấu — wrong-way, tinh thần Chương 14).
2. **Coupon skip risk**: coupon AT1 là **discretionary và non-cumulative** — regulator hoặc ngân hàng có thể **bỏ coupon** bất kỳ kỳ nào (nếu buffer vốn không đủ) mà **không** cấu thành default, và coupon bỏ *không được trả bù* sau. Đây là rủi ro rất thực và định giá khó, vì nó là một option của issuer mà holder không được đền.
3. **Extension risk**: CoCo thường là **perpetual** (vô kỳ hạn) với một ngày **call** đầu tiên (ví dụ sau 5 năm), và thị trường *giả định* ngân hàng sẽ call ở ngày đó (định giá "to-call"). Nhưng ngân hàng **không bắt buộc** call — nếu điều kiện tái tài trợ xấu, nó **extend** (không call), và trái phiếu đột ngột định giá "to-perpetuity", giá rơi mạnh. Đây là extension risk: một cú gap giá khi kỳ vọng call bị phá.

**Ví dụ số — CoCo yield so với senior.** Xét một ngân hàng có: trái phiếu **senior** 5Y yield $4.0\%$ (curve $3\%$ cộng senior spread $100\,\text{bp}$). Một **CoCo AT1** cùng ngân hàng, first-call 5Y. Chồng thêm các lớp bù rủi ro, mỗi lớp là một dòng trong "waterfall" định giá:

| Lớp bù rủi ro | Spread thêm |
|---|---|
| Senior 5Y (curve 3% + senior spread 100bp) | 4.00% |
| Subordination (dưới senior và Tier 2) | +2.50% |
| Trigger / loss-absorption | +2.00% |
| Coupon-skip | +1.00% |
| Extension | +0.50% |
| **Yield-to-call CoCo** | **10.00%** |

Cộng dồn: $4.0\% + 2.5\% + 2.0\% + 1.0\% + 0.5\% = 10.0\%$. Đọc con số: nhà đầu tư đòi $10.0\% - 4.0\% = 600\,\text{bp}$ *trên* senior của cùng một tổ chức phát hành để cầm CoCo — sáu điểm phần trăm đó là giá của việc đứng cuối hàng hấp thụ lỗ. Con số $6$–$9\%$ coupon ngoài đời khớp với khoảng này. Điểm mấu chốt: yield cao của CoCo **không phải phần thưởng miễn phí** — nó là phí bảo hiểm ngân hàng trả cho nhà đầu tư để họ đứng ở vị trí "đệm lỗ đầu tiên sau cổ đông thường". Ai nhìn coupon $9\%$ mà nghĩ "trái phiếu ngân hàng lãi cao, hời quá" là chưa đọc phần in nhỏ.

**Định giá CoCo — vì sao khó.** Không có một mô hình đóng gói sạch. Ba trường phái: (i) **credit-spread approach** — coi CoCo như bond rất subordinated, định giá qua spread (đơn giản, bỏ qua động lực trigger); (ii) **equity-derivatives approach** — mô hình trigger qua một biến quan sát (giá cổ phiếu như proxy cho CET1, một barrier down-and-in trên equity kích hoạt conversion) — nối thẳng vào PDE/barrier của Chương 12; (iii) **structural approach** — mô hình CET1 ratio ngẫu nhiên trực tiếp và trigger khi thủng ngưỡng (đúng nhất về kinh tế, khó nhất về dữ liệu vì CET1 công bố theo quý, không liên tục, và một phần do regulator quyết định — "point of non-viability" có thể do cơ quan quản lý tuyên bố bất kể con số kế toán). Sự kiện Credit Suisse tháng 3/2023 — nơi $\approx \$17$ tỷ CoCo AT1 bị **write-down về 0 trong khi cổ đông vẫn nhận được một phần** — là bài học model-risk sống động: thứ tự thâm hụt (waterfall) mà thị trường *tưởng* (trái chủ trên cổ đông) không phải thứ tự hợp đồng/regulator thực thi trong non-viability. Định giá CoCo mà bỏ qua rủi ro regulator và điều khoản write-down cụ thể là định giá sai một cách nguy hiểm — không mô hình diffusion nào bắt được một quyết định hành chính ban đêm cuối tuần.

Đóng lại chương, đáng đứng lùi một bước để thấy sợi chỉ xuyên suốt. Convertible và hybrid capital là nơi ba thế giới của Q gặp nhau trong một instrument: **equity vol** (Chương 5-6) cấp embedded option và gamma; **credit** (Chương 13) cấp bond floor bập bênh và hazard rate; **numerics** (Chương 12) cấp cây/PDE để cuộn ngược qua early exercise và call provision; và **capital/regulation** (Chương 15) là lý do CoCo tồn tại. Không có desk nào trong Q-world "sở hữu" con thú này một mình — và chính sự lai giống đó, chứ không phải độ phức tạp toán học, mới là điều làm convertible khó và làm nó đáng học.

# Chương 17: MBS, callable bonds và OAS

Có một họ tài sản mà cả một sự nghiệp fixed-income có thể xây quanh nó, và nó không phải trái phiếu vanilla, không phải swap, không phải option niêm yết. Đó là những công cụ mà *người phát hành hoặc người vay được quyền thay đổi dòng tiền*: callable bond mà issuer có thể gọi lại trước hạn, và mortgage-backed security (MBS) mà hàng triệu chủ nhà có thể trả trước khoản vay bất cứ lúc nào. Điểm chung của chúng — và lý do chương này tồn tại — là một embedded option nằm *phía đối phương* với nhà đầu tư. Bạn mua callable bond, bạn ngầm *bán* một call cho issuer. Bạn mua MBS pass-through, bạn ngầm *bán* một call cho từng chủ nhà. Cái option bạn bán ấy có giá, và nó ăn vào lợi suất của bạn theo một cách tinh vi mà yield-to-maturity thông thường không nhìn thấy.

Hệ quả sâu nhất của optionality này là **negative convexity**: khi lãi suất giảm, một trái phiếu vanilla tăng giá với tốc độ *tăng dần* (convex, lồi lên) — nhưng callable bond và MBS thì ngược lại, giá bị chặn trên vì càng giảm rate thì option càng dễ bị exercise. Bạn được ít khi rate giảm nhưng mất đủ khi rate tăng. Đó là hình dạng P&L tệ nhất mà một nhà đầu tư fixed-income có thể ôm, và cả một ngành công nghiệp mô hình hóa — option-adjusted spread (OAS), prepayment models, Monte Carlo trên interest-rate paths — mọc lên để định lượng chính xác cái "tệ" ấy đáng giá bao nhiêu bps.

Chương này dựng từ đó lên. Ta bắt đầu với callable bond như phép cộng đơn giản nhất (straight bond trừ call), thấy negative convexity hiện ra bằng số. Ta định nghĩa OAS chặt chẽ — spread duy nhất khi cộng vào interest-rate tree/curve làm giá mô hình khớp giá thị trường — và phân biệt nó với nominal spread và Z-spread bằng một ví dụ 101/70bp/25bp/45bp. Ta chuyển sang MBS: prepayment risk, các mô hình CPR/SMM/PSA, refinancing incentive, burnout, seasoning. Rồi ta định giá MBS bằng Monte Carlo trên hàng nghìn rate paths với một prepayment model chạy trên mỗi path, tìm OAS, đo effective duration/convexity. Cuối cùng, CMO tranches phân bổ lại prepayment risk giữa các nhà đầu tư. Toàn bộ dựa trên khung interest-rate model của Chương 9 (Hull-White, curve) và bộ máy numerics của Chương 12 (Monte Carlo, bump-and-revalue Greeks).

## 17.1 Callable bond: straight bond trừ một call

Một callable bond là trái phiếu doanh nghiệp/agency trả coupon như bình thường, nhưng kèm điều khoản cho issuer quyền *mua lại* (redeem) trái phiếu ở một giá call định trước (thường par hoặc par cộng phần bù nhỏ) tại một hoặc nhiều thời điểm sau ngày call protection. Vì sao issuer muốn quyền này? Cùng lý do bạn muốn refinance khoản vay nhà: nếu lãi suất thị trường giảm sau phát hành, issuer có thể gọi lại trái phiếu coupon cao và phát hành trái phiếu mới coupon thấp — tài trợ rẻ hơn. Cái quyền đó không miễn phí; nhà đầu tư đòi coupon cao hơn để bù, và phần chênh chính là giá của option.

Phép phân rã nền tảng, và là chìa khóa của cả chương:

$$
\text{Callable bond} = \text{Straight bond} - \text{Call option (issuer nắm)}
$$

Nhà đầu tư *long* straight bond và *short* call. Issuer là bên nắm call — họ exercise khi có lợi cho họ, tức khi giá trái phiếu (nếu không callable) vượt call price, tức khi rate đã giảm đủ. Vì nhà đầu tư short cái call ấy:

$$
P_{\text{callable}} = P_{\text{straight}} - C_{\text{call}}
$$

Con số làm ví dụ. Xét một trái phiếu 3 năm, coupon 5% trả hằng năm, face 100, callable tại par (100) sau 1 năm (Bermudan: có thể call tại cuối năm 1 và năm 2). Ta cần một curve. Dùng đúng curve OIS chuẩn của sách (đã gặp ở Chương 2 và 9): quote 1Y = 4.00%, 2Y = 4.25% (fixed hằng năm), và ta mở rộng nhẹ 3Y = 4.40%. Discount factors — ba con số này sẽ được tái sử dụng suốt mục, nên tính cho chuẩn tới từng chữ số:

$$
P(0,1) = \frac{1}{1.04} = 0.96154, \quad
P(0,2) = 0.92003, \quad
P(0,3) = \frac{1}{1.044^{3}} = 0.87882.
$$

Một lưu ý nhỏ nhưng quan trọng về $P(0,2)$: nó *không* phải $1/1.0425^2$. Quote 2Y = 4.25% là par yield (coupon hằng năm), nên phải bootstrap: $4.25\,P(0,1) + 104.25\,P(0,2) = 100$, giải ra $P(0,2) = (100 - 4.25 \times 0.96154)/104.25 = 0.92003$, ứng với zero rate 2Y $\approx 4.26\%$ (đã gặp ở Chương 2). Còn $P(0,3) = 1/1.044^3$: cẩn thận với số mũ 3, $1.044^3 = 1.13789$ nên $P(0,3) = 0.87882$ (đừng làm tròn thành 0.87905 — sai số nhỏ này sẽ nhân với 105 và làm lệch giá bond gần 0.03 điểm).

Giá straight bond (chưa tính call) là hiện giá của ba coupon 5 cộng face 100 ở năm 3:

$$
P_{\text{straight}} = 5(0.96154) + 5(0.92003) + 105(0.87882).
$$

Từng số hạng: $5 \times 0.96154 = 4.8077$; $5 \times 0.92003 = 4.6002$; $105 \times 0.87882 = 92.276$. Cộng lại:

$$
P_{\text{straight}} = 4.8077 + 4.6002 + 92.276 = 101.68.
$$

Trái phiếu trade trên par vì coupon 5% cao hơn yield khoảng 4.4%. Chính vì trade trên par, call tại par *có giá trị* cho issuer — họ có thể mua lại thứ đáng 101.68 với giá 100. Đó là intuition: call in-the-money khi coupon vượt yield thị trường, và độ "in-the-money" ở đây đúng bằng 1.68 điểm giá mà issuer đang để lại trên bàn nếu họ *không* có quyền call.

Định giá call này cần một interest-rate tree vì payoff của issuer phụ thuộc mức rate tương lai. Ta chưa cần con số chính xác của call tại mục này (mục 17.2 làm đầy đủ qua tree); tạm dùng một giá option *minh họa* $C_{\text{call}} \approx 1.68$ — con số ta chọn cho khớp với ý đồ thiết kế "phát hành gần par", và ở mục 17.2 ta sẽ thấy một Hull-White tree cho ra option value đúng cùng cỡ độ lớn này (một MC Hull-White với $a=0.05,\ \sigma=1\%$ cho ra option value quanh 1.3–1.7 tùy discretization và exercise rule). Khi đó:

$$
P_{\text{callable}} = 101.68 - 1.68 = 100.0.
$$

Đọc con số: cái option issuer nắm trị giá khoảng 1.68 điểm giá, và nó kéo giá callable từ 101.68 xuống đúng par. Một cách nhìn thị trường: callable bond này được "thiết kế" để phát hành gần par — issuer bán cho bạn ở 100, giữ lại phần giá trị dưới dạng quyền call. Bạn nhận coupon 5% (cao) nhưng "trả lại" khoảng 1.68 điểm bằng cách nhường quyền call. Sự trùng khớp callable ≈ par không phải ngẫu nhiên: đó chính là logic pricing của new issue — dealer chọn coupon sao cho, sau khi trừ option value, trái phiếu bán được ở đúng par.

### Negative convexity hiện ra bằng số

Đây là hiệu ứng quan trọng nhất của mục. Convexity đo *độ cong* của quan hệ giá–yield: với straight bond, khi yield giảm giá tăng nhanh dần (đường cong lồi lên — positive convexity), tính chất tốt vì bạn được nhiều khi rate giảm và mất ít khi rate tăng. Callable bond phá vỡ điều đó ở vùng yield thấp vì giá bị *chặn trên* bởi call: khi rate giảm đủ, issuer sẽ call ở par nên giá callable không thể vượt xa 100 dù giá straight cứ tăng.

Đo bằng số. Bump curve song song $\pm 100\,\text{bp}$ và định giá lại cả straight lẫn callable. Điểm mấu chốt về option value: nó *thay đổi theo rate* — khi rate giảm call đắt hơn (deeper ITM cho issuer), khi rate tăng call rẻ đi (moving OTM). Chính sự thay đổi bất đối xứng của $C_{\text{call}}$ tạo ra negative convexity.

| Kịch bản | $P_{\text{straight}}$ | $C_{\text{call}}$ | $P_{\text{callable}}$ |
|---|---|---|---|
| $-100\,\text{bp}$ | 104.25 | 3.52 | 100.73 |
| Base | 101.68 | 1.68 | 100.00 |
| $+100\,\text{bp}$ | 99.19 | 0.59 | 98.60 |

Nhìn straight bond: từ base, $-100\,\text{bp}$ làm giá $+2.57$ (lên 104.25), $+100\,\text{bp}$ làm giá $-2.49$ (xuống 99.19). Hai bên gần đối xứng, hơi lệch có lợi cho phía giảm rate — đó là **positive convexity** của bond thường: $(104.25 - 101.68) > (101.68 - 99.19)$, tức $2.57 > 2.49$.

Giờ nhìn callable bond: $-100\,\text{bp}$ chỉ làm giá $+0.73$ (lên 100.73), nhưng $+100\,\text{bp}$ làm giá $-1.40$ (xuống 98.60). Bất đối xứng ngược hẳn: bạn được ít khi rate giảm nhưng mất nhiều khi rate tăng. Đó chính là **negative convexity**. Trực giác: ở kịch bản $-100\,\text{bp}$, straight bond tăng 2.57 điểm nhưng option cũng phình từ 1.68 lên 3.52 (tăng 1.84) — issuer "nuốt" gần hết phần tăng giá, chỉ chừa cho nhà đầu tư 0.73. Ở kịch bản $+100\,\text{bp}$, straight bond mất 2.49 điểm nhưng option chỉ co từ 1.68 xuống 0.59 (giảm 1.09), nên nhà đầu tư vẫn chịu ròng $-1.40$. Option "cho" ít mà "lấy" nhiều — đó là bất đối xứng của short-option position.

Định lượng bằng effective convexity. Công thức chuẩn (numerics: central difference, Chương 12):

$$
\text{Effective convexity} = \frac{P_{-} + P_{+} - 2P_0}{P_0 \,(\Delta y)^2},
$$

với $\Delta y = 0.01$. Straight bond:

$$
\text{Conv}_{\text{straight}} = \frac{104.25 + 99.19 - 2(101.68)}{101.68 \times (0.01)^2} = \frac{0.08}{0.0101680} = +7.87.
$$

Callable bond:

$$
\text{Conv}_{\text{callable}} = \frac{100.73 + 98.60 - 2(100.00)}{100.00 \times (0.01)^2} = \frac{-0.67}{0.0100} = -67.
$$

Straight bond có convexity $+7.87$ (dương, tốt); callable bond có convexity $-67$ (âm, và lớn về độ lớn). Con số âm ấy là toàn bộ vấn đề: một nhà đầu tư nắm callable bond hoặc MBS đang ôm một tài sản mà mọi biến động lớn của rate đều tệ — rate giảm thì bị call/prepay (được ít), rate tăng thì kẹt với coupon thấp so với thị trường (mất đủ). Negative convexity là "thuế" bạn trả để nhận coupon cao hơn. Để cảm nhận độ lớn: convexity $-67$ nghĩa là với một cú move 100bp, thành phần convexity một mình đóng góp $\tfrac{1}{2} \times (-67) \times (0.01)^2 \times 100 \approx -0.34$ điểm P&L — luôn âm, bất kể rate lên hay xuống. Đó là "phí" bạn trả cho mỗi cú biến động lớn dù đoán đúng hướng.

Một cách nhìn effective duration đi kèm: callable bond có duration *co lại* khi rate giảm (vì sắp bị call, kỳ hạn hiệu dụng ngắn đi) và *dài ra* khi rate tăng — chính là extension/contraction ta gặp lại đậm nét ở MBS (mục 17.4).

## 17.2 Option-Adjusted Spread (OAS)

Yield-to-maturity và nominal spread nói dối về callable bond. Chúng giả định dòng tiền cố định, trong khi dòng tiền của callable bond *phụ thuộc đường đi của lãi suất* (call hay không call). OAS là câu trả lời chuẩn ngành cho câu hỏi: "sau khi đã trừ đi giá của optionality, trái phiếu này thực sự trả cho tôi bao nhiêu spread so với curve phi rủi ro?" Đây là thước đo relative value số một cho mọi tài sản có embedded option — không có nó, bạn không thể so sánh một callable với một non-callable, hay hai MBS coupon khác nhau.

### Ba loại spread — phân biệt bằng định nghĩa và bằng số

Cần tách bạch ba khái niệm hay bị lẫn:

**Nominal spread** là hiệu giữa YTM của trái phiếu và YTM của một government bond cùng maturity. Đơn giản nhưng thô: nó dùng *một* điểm trên curve (một maturity) và phớt lờ hình dạng curve lẫn optionality.

**Z-spread** (zero-volatility spread) là spread hằng số $z$ cộng vào *mỗi* zero rate của curve sao cho hiện giá tất cả dòng tiền (giả định *cố định*, tức bond được nắm tới đáo hạn, không call) khớp giá thị trường:

$$
P_{\text{market}} = \sum_{i} \frac{CF_i}{\big(1 + z_i + z\big)^{t_i}}
\quad\text{(dạng zero-rate)}.
$$

Z-spread dùng cả curve nên tốt hơn nominal spread, nhưng vẫn *chưa* điều chỉnh cho optionality — nó định giá như thể option không tồn tại. Gọi là "zero-volatility" chính vì nó ngầm giả định $\sigma = 0$: không có biến động rate thì không có giá trị option, nên Z-spread là giới hạn của OAS khi vol tiến về 0.

**OAS** là spread hằng số $s$ cộng vào short rate tại *mọi node* của interest-rate tree (hoặc mọi điểm trên mọi Monte Carlo path) sao cho giá mô hình — trong đó dòng tiền được xác định *có tính đến việc option bị exercise tối ưu trên từng path* — khớp giá thị trường. OAS đã "bóc" giá option ra khỏi spread, nên phần còn lại phản ánh compensation cho credit/liquidity thuần túy.

Quan hệ mấu chốt:

$$
\boxed{\ \text{OAS} = \text{Z-spread} - \text{Option cost}\ }
$$

Với bond mà nhà đầu tư *short* option (callable, MBS), option cost dương nên OAS < Z-spread. Với bond mà nhà đầu tư *long* option (putable bond), option cost âm nên OAS > Z-spread.

### Ví dụ số: callable bond giá thị trường 101, tìm OAS qua Hull-White tree

Xét callable bond đang trade ở giá thị trường 101. Ta muốn ba con số: Z-spread, option cost, OAS. Dùng một Hull-White short-rate tree calibrate vào curve OIS (Chương 9). Hull-White: $dr = (\theta(t) - a\,r)\,dt + \sigma\,dW$; ta calibrate $\theta(t)$ để tree tái tạo đúng $P(0,T)$ của curve, chọn mean reversion $a = 0.05$ và vol $\sigma = 1\%$ (100bp/năm) — mức điển hình.

**Bước 1 — Z-spread.** Định giá dòng tiền cố định (bỏ qua call) và tìm $z$ khớp giá 101. Với ví dụ này, giải ra $z = 70\,\text{bp}$. Nghĩa là nếu bond không callable, spread cố định trên curve là 70bp. Cơ chế giải: đây là một root-find một biến — tăng $z$ làm giá giảm đơn điệu, nên Newton hay bisection hội tụ trong vài bước tới $z$ sao cho $\sum_i CF_i / (1+z_i+z)^{t_i} = 101$.

**Bước 2 — Định giá option qua tree, quy ra option cost.** Chạy tree, tại mỗi node cuối năm 1 và năm 2, so sánh giá tiếp tục (continuation value, hiện giá các dòng tiền tương lai) với call price 100; issuer call khi continuation > 100 (họ mua lại rẻ). Backward induction cho ra giá callable, và chênh giữa giá straight và giá callable định lượng giá option; quy sang đơn vị spread, calibrate cho ra option cost = 25bp (số spread mà cái option "ăn mất" — tức nếu ta thêm 25bp vào discounting của phiên bản *straight* thì giá straight tụt đúng bằng giá callable).

**Bước 3 — OAS.** Áp quan hệ:

$$
\text{OAS} = \text{Z-spread} - \text{Option cost} = 70 - 25 = 45 \text{ bp}.
$$

Đọc kết quả: nominal/Z-spread 70bp *trông* hấp dẫn, nhưng 25bp trong đó chỉ là bồi thường cho việc bạn đã bán quyền call cho issuer — nó không phải "phần thưởng" bạn giữ được, mà là phí bảo hiểm cho cái rủi ro bị call. Sau khi bóc ra, OAS = 45bp mới là spread *thực sự* bạn nhận cho credit và liquidity. Khi so sánh với một non-callable cùng issuer đang có spread 50bp, callable ở OAS 45bp thực ra *rẻ hơn* (bạn nhận ít compensation thực hơn cho cùng rủi ro tín dụng) — một kết luận mà Z-spread 70bp sẽ che giấu hoàn toàn. Đây chính là công dụng số một của OAS: nó đưa mọi trái phiếu, callable hay không, về cùng một thước đo so sánh được.

Cách kiểm tra OAS bằng backward induction trên tree, cụ thể hóa cơ chế: tại mỗi node ta chiết khấu bằng short rate của node *cộng OAS*:

$$
V_{\text{node}} = \min\!\Big(\text{Call price},\ \frac{p_u V_u + p_m V_m + p_d V_d}{1 + (r_{\text{node}} + \text{OAS})\,\Delta t} + \text{coupon}\Big),
$$

(min vì issuer nắm call — họ cắt giá trị nhà đầu tư xuống call price khi có lợi; ở các node không phải call date thì bỏ toán tử min, chỉ discount). Ta lặp tìm OAS sao cho $V_{\text{root}} = 101$. Chính $r_{\text{node}} + \text{OAS}$ ở mọi node là điều khiến OAS "option-adjusted": option đã được xử lý qua rule call trong tree, spread chỉ còn gánh phần credit/liquidity. Root-find OAS đơn điệu như bước Z-spread: OAS cao hơn → discount mạnh hơn → $V_{\text{root}}$ thấp hơn, nên chỉ có một nghiệm.

Một pitfall thực chiến đáng nhớ: **OAS phụ thuộc mô hình và phụ thuộc vol giả định**. Nếu bạn tăng $\sigma$ trong Hull-White từ 1% lên 1.5%, option đắt hơn (option cost tăng, ví dụ lên 32bp), nên OAS *giảm* (70 − 32 = 38bp) dù giá thị trường và Z-spread không đổi. Chú ý Z-spread không đổi vì nó là đại lượng $\sigma$-independent (định nghĩa ở vol = 0) — chỉ option cost và OAS di chuyển. Vì thế so sánh OAS giữa hai dealer chỉ có nghĩa khi họ dùng cùng vol và cùng model. OAS không phải đại lượng thị trường quan sát trực tiếp — nó là output của một model, và "garbage vol in, garbage OAS out".

## 17.3 MBS pass-through và prepayment risk

MBS đưa cùng logic optionality lên một quy mô khác. Một mortgage pass-through security gom hàng nghìn khoản vay nhà (residential mortgages) lại thành một pool, và nhà đầu tư nhận "chuyển tiếp" (pass through) dòng tiền gốc-lãi từ pool đó. Điểm mấu chốt: mỗi chủ nhà ở Mỹ có quyền *prepay* — trả trước một phần hoặc toàn bộ khoản vay bất cứ lúc nào, không phạt (với mortgage tiêu chuẩn). Họ prepay chủ yếu khi refinance được với rate thấp hơn. Đó chính xác là một call option mà chủ nhà nắm trên khoản nợ của họ — và nhà đầu tư MBS, vì đứng bên kia, đang *short* một rổ call.

So với callable bond, MBS phức tạp hơn ở chỗ: không phải một issuer duy nhất ra quyết định tối ưu, mà hàng nghìn chủ nhà hành xử *không tối ưu và không đồng nhất* — người refinance sớm, người ì ạch, người prepay vì lý do phi tài chính (bán nhà, ly hôn, chuyển việc). Vì thế ta không dùng "exercise tối ưu" như callable bond; ta dùng một **prepayment model** thống kê ước lượng bao nhiêu % pool prepay mỗi tháng. Đây là khác biệt bản chất: callable bond định giá với một *rational* option holder, MBS định giá với một *statistical* option holder — và toàn bộ model risk của MBS nằm ở chất lượng của cái mô hình thống kê ấy.

### CPR, SMM và mối liên hệ

**CPR (Conditional Prepayment Rate)** là tỷ lệ prepayment *hằng năm hóa*: phần trăm số dư gốc còn lại (đã trừ scheduled amortization) sẽ được prepay trong một năm nếu tốc độ hiện tại kéo dài. CPR 6% nghĩa là kỳ vọng 6% dư nợ prepay trong năm.

**SMM (Single Monthly Mortality)** là tỷ lệ prepayment *hằng tháng* tương ứng. Vì prepayment "bào mòn" dư nợ theo cấp số nhân, quan hệ CPR↔SMM là qua phần *sống sót* (không prepay): sống sót cả năm = (sống sót một tháng)$^{12}$:

$$
1 - \text{CPR} = (1 - \text{SMM})^{12}
\;\Longrightarrow\;
\text{SMM} = 1 - (1 - \text{CPR})^{1/12}.
$$

Ví dụ số với CPR = 6%:

$$
\text{SMM} = 1 - (1 - 0.06)^{1/12} = 1 - (0.94)^{1/12}.
$$

Tính $(0.94)^{1/12}$: $\ln 0.94 = -0.061875$; chia 12 = $-0.0051562$; $e^{-0.0051562} = 0.994857$. Vậy:

$$
\text{SMM} = 1 - 0.994857 = 0.005143 = 0.5143\%.
$$

Đọc con số: mỗi tháng khoảng 0.514% dư nợ (ngoài lịch trả gốc bình thường) biến mất do prepay. Nhân xấp xỉ 12 ra $\approx 6.17\%$, hơi cao hơn 6% — chênh nhỏ này chính là hiệu ứng compounding mà công thức mũ nắm đúng còn phép nhân thô bỏ sót. Sai chỗ này (dùng SMM = CPR/12 = 0.5% thay vì 0.5143%) nghe như làm tròn vô hại, nhưng trên 360 tháng nó tích lũy thành lệch đáng kể ở average life và ở giá — đây là loại lỗi kinh điển trên MBS desk khi ai đó viết tắt công thức.

### PSA benchmark

Thị trường chuẩn hóa tốc độ prepay qua **PSA (Public Securities Association) benchmark**. "100% PSA" là một đường CPR tăng tuyến tính trong 30 tháng đầu rồi phẳng:

$$
\text{CPR} = \begin{cases} 6\% \times \dfrac{t}{30} & t \le 30 \text{ tháng} \\[4pt] 6\% & t > 30 \text{ tháng} \end{cases}
$$

Nghĩa là tháng 1 có CPR = 0.2%, tháng 2 = 0.4%, …, tháng 30 đạt 6% và giữ nguyên. Một pool chạy "150% PSA" nhân toàn bộ lên 1.5 lần (ceiling 9%), "50% PSA" nhân 0.5 (ceiling 3%). Ví dụ: pool 20 tháng tuổi chạy 150% PSA có

$$
\text{CPR} = 1.5 \times 6\% \times \frac{20}{30} = 1.5 \times 4\% = 6\%.
$$

Ý nghĩa của "seasoning" ramp 30 tháng: khoản vay mới ít prepay (chủ nhà vừa mua, chưa có động cơ/khả năng refinance), tốc độ tăng dần khi pool "chín" (seasoned). PSA không phải một mô hình hành vi — nó chỉ là *đơn vị đo* tốc độ, một cách quy quan sát thực tế ("pool này đang chạy 165% PSA") về một trục chung để so sánh và để quote. Prepayment model thật (mục sau) mới sinh ra CPR từ rate và tuổi pool; PSA là ngôn ngữ để phát biểu kết quả.

### Cashflow một tháng bằng số

Cụ thể hóa một tháng của MBS pool để thấy CPR/SMM đi vào dòng tiền thế nào. Pool: dư nợ đầu tháng $B = \$100{,}000{,}000$, mortgage rate (WAC, weighted average coupon) 5.5%/năm nên monthly rate $c = 5.5\%/12 = 0.45833\%$, kỳ hạn còn lại $n = 300$ tháng, CPR = 6% nên SMM = 0.5143% (đã tính).

**Bước 1 — Interest.** Lãi tháng này trên dư nợ đầu kỳ:

$$
I = B \times c = 100{,}000{,}000 \times 0.0045833 = \$458{,}333.
$$

**Bước 2 — Scheduled principal.** Khoản trả gốc theo lịch amortization (từ công thức annuity). Trước hết payment cố định hằng tháng:

$$
\text{PMT} = B \cdot \frac{c\,(1+c)^n}{(1+c)^n - 1}.
$$

Với $c = 0.0045833$, $n = 300$: $(1.0045833)^{300} = e^{300 \ln 1.0045833} = e^{300 \times 0.0045729} = e^{1.37186} = 3.9427$. Vậy

$$
\text{PMT} = 100{,}000{,}000 \times \frac{0.0045833 \times 3.9427}{3.9427 - 1} = 100{,}000{,}000 \times \frac{0.018071}{2.9427} = \$614{,}087.
$$

Scheduled principal = payment trừ interest:

$$
\text{SP} = \text{PMT} - I = 614{,}087 - 458{,}333 = \$155{,}754.
$$

**Bước 3 — Prepayment.** Prepay áp lên dư nợ *sau* khi đã trừ scheduled principal, theo SMM:

$$
\text{PP} = \text{SMM} \times (B - \text{SP}) = 0.005143 \times (100{,}000{,}000 - 155{,}754) = 0.005143 \times 99{,}844{,}246 = \$513{,}500.
$$

**Bước 4 — Tổng dòng tiền tháng và dư nợ cuối kỳ.**

$$
CF = I + \text{SP} + \text{PP} = 458{,}333 + 155{,}754 + 513{,}500 = \$1{,}127{,}588.
$$
$$
B_{\text{end}} = B - \text{SP} - \text{PP} = 100{,}000{,}000 - 155{,}754 - 513{,}500 = \$99{,}330{,}746.
$$

Đọc kết quả: trong \$1.128M nhà đầu tư nhận tháng này, \$458k là lãi, \$156k là gốc theo lịch, và \$514k là *prepayment* — gốc trả về sớm ngoài dự kiến. Chính \$514k đó là nguồn gốc rủi ro: nó là tiền bạn phải tái đầu tư, và nó về đúng lúc bạn *không* muốn (rate thấp, refinance sôi động). So sánh: nếu CPR = 0 (không ai prepay), dòng tiền chỉ còn \$614k (đúng bằng PMT), và dư nợ giảm chậm hơn nhiều. Tỷ lệ $1{,}127{,}588 / 614{,}087 = 1.84$ — prepayment làm dòng tiền tháng này *gần gấp đôi* và rút ngắn đời sống security. Đây là toàn bộ câu chuyện MBS gói trong một tháng: dòng tiền của bạn không cố định, nó phồng lên đúng lúc bạn ít muốn nhất.

### Bốn động lực của prepayment

Prepayment model tốt phải nắm bốn hiệu ứng, mỗi cái có logic thị trường riêng:

**(1) Refinancing incentive** — động lực chính. Chủ nhà refinance khi mortgage rate thị trường hiện tại thấp hơn WAC của họ đủ nhiều để bù chi phí refinance. Đo bằng incentive $= \text{WAC} - r_{\text{market}}$. Nếu WAC = 5.5% và rate thị trường rơi xuống 4.0%, incentive = 150bp — mạnh, CPR có thể vọt lên 40–50%. Nếu rate lên 6.5%, incentive = −100bp — âm, hầu như không ai refinance, CPR rơi về mức "turnover" nền (bán nhà, chuyển chỗ) khoảng 5–7%. Đường CPR theo incentive có hình chữ S: phẳng thấp khi incentive âm, dốc lên nhanh quanh 50–100bp incentive, bão hòa ở incentive lớn. Hình chữ S ấy chính là "smile" của MBS — nó là mặt đối tượng calibrate quan trọng nhất, và độ dốc của nó quyết định trực tiếp effective duration/convexity ở mục 17.4.

**(2) Burnout** — hiện tượng "kiệt sức". Trong một pool, những chủ nhà nhạy rate (refinance-savvy, tín dụng tốt) prepay sớm ở đợt rate giảm đầu tiên. Sau đợt đó, pool còn lại toàn người *chậm* — không refinance dù incentive vẫn dương (do tín dụng kém, lười, nhà khó bán). Nên nếu rate giảm rồi phục hồi rồi giảm lại về cùng mức, đợt prepay thứ hai *yếu hơn* đợt đầu. Burnout khiến prepayment phụ thuộc *cả đường đi* (path-dependent) chứ không chỉ mức rate hiện tại — lý do cốt lõi buộc phải định giá MBS bằng Monte Carlo trên path (mục 17.4), không thể dùng tree recombining đơn giản. Một tree recombine dựa trên giả định "trạng thái chỉ phụ thuộc rate hiện tại"; burnout phá đúng giả định ấy, nên tree không dùng được.

**(3) Seasonality** — mùa vụ. Prepay do bán nhà cao vào mùa hè (gia đình chuyển nhà khi con nghỉ học), thấp mùa đông. Model thêm hệ số nhân theo tháng, ví dụ ×1.2 tháng 7, ×0.85 tháng 1.

**(4) Seasoning (age)** — như PSA ramp: pool non prepay chậm, tăng dần tới ~30 tháng rồi ổn định. Chủ nhà mới ít có cả động cơ lẫn khả năng refinance.

Một prepayment model production kết hợp cả bốn dưới dạng nhân:

$$
\text{SMM}_t = f_{\text{refi}}(\text{incentive}_t,\ \text{burnout}_t) \times f_{\text{age}}(t) \times f_{\text{season}}(\text{month}_t).
$$

Đây là "trái tim mô hình" của MBS desk — và cũng là nguồn model risk lớn nhất: prepayment behavior thay đổi theo chu kỳ (credit tightening 2008 làm refinance khó dù incentive lớn; công nghệ fintech 2020 làm refinance nhanh hơn lịch sử). Prepayment model calibrate vào một chế độ có thể sai nặng ở chế độ khác — bài học model risk song song với copula của CDO (Chương 13). Điểm sâu: hai model MBS calibrate cùng dữ liệu lịch sử vẫn có thể cho OAS lệch nhau 20–30bp chỉ vì giả định khác nhau về độ dốc S-curve và tốc độ burnout — nên OAS của MBS *luôn* đi kèm tên model sinh ra nó.

## 17.4 Định giá MBS qua Monte Carlo và effective duration/convexity

Vì prepayment path-dependent (burnout) và vì dòng tiền phụ thuộc toàn bộ đường lãi suất, MBS không định giá được bằng công thức đóng hay tree recombining đơn giản. Chuẩn ngành là **Monte Carlo trên interest-rate paths** (Chương 12): sinh nhiều đường short rate dưới $\mathbb{Q}$, trên mỗi đường chạy prepayment model để suy ra dòng tiền, chiết khấu, rồi lấy trung bình. OAS lại là spread cộng vào để khớp giá thị trường.

### Thuật toán, từng bước

**Bước 1 — Sinh rate paths.** Dùng interest-rate model calibrate (Hull-White hoặc LMM, Chương 9) sinh $M$ đường short rate $\{r_t^{(j)}\}$, $j = 1,\dots,M$, theo bước tháng qua toàn bộ đời MBS (tới 360 tháng). Điển hình $M = 500$–$2000$ paths (với variance reduction — antithetic, Sobol — như Chương 12). Lưu ý các path phải sinh dưới $\mathbb{Q}$ và model phải reprice curve OIS (drift-fit $\theta(t)$) — nếu không, OAS sẽ nuốt cả sai số calibration của rate model, một pitfall ngầm.

**Bước 2 — Trên mỗi path, chạy prepayment model.** Tại mỗi tháng $t$ của path $j$, mortgage rate thị trường được suy từ $r_t^{(j)}$ (thường là một hàm của rate 10Y trên path, vì mortgage 30Y định giá gần theo 10Y point). Tính incentive, cập nhật burnout (dựa trên lịch sử refinance của chính path đó — đây là chỗ path-dependence vào cuộc), áp seasonality/seasoning → ra $\text{SMM}_t^{(j)}$ → ra dòng tiền $CF_t^{(j)}$ (interest + scheduled principal + prepayment, đúng cơ chế mục 17.3).

**Bước 3 — Chiết khấu dọc path, cộng OAS.** Hiện giá path $j$:

$$
PV^{(j)} = \sum_{t=1}^{T} \frac{CF_t^{(j)}}{\prod_{k=1}^{t}\big(1 + r_k^{(j)} + \text{OAS}\big)}.
$$

OAS cộng vào short rate tại *mọi* bước trên *mọi* path — song song hoàn toàn với việc cộng OAS vào mọi node của tree ở mục 17.2. Chiết khấu ở đây là *pathwise* (dùng short rate thực tế đã sinh trên path đó), không phải chiết khấu bằng curve zero — vì mỗi path có một realized discounting riêng.

**Bước 4 — Trung bình và giải OAS.** Giá mô hình $= \frac{1}{M}\sum_j PV^{(j)}$. Lặp tìm OAS sao cho giá mô hình khớp giá thị trường (lại là root-find đơn điệu: OAS cao → PV thấp).

Ví dụ số minh họa (một MBS pass-through coupon 5.5%, giá thị trường 102.0): giả sử chạy 1000 paths cho giá trung bình 104.3 khi OAS = 0. Giá mô hình > giá thị trường nghĩa spread hiện tại quá thấp (chiết khấu quá nhẹ); tăng OAS lên. Giải ra OAS = 55bp làm giá mô hình = 102.0. Đọc: nhà đầu tư nhận 55bp option-adjusted spread trên OIS curve cho MBS này — con số so sánh trực tiếp được với OAS của một MBS coupon khác, hay của một corporate bond. Chênh 104.3 → 102.0 (2.3 điểm) mà OAS chỉ cần 55bp gánh cho thấy độ nhạy giá theo spread: mỗi 1bp OAS ở đây đáng khoảng 0.04 điểm giá — đó chính là spread duration của MBS.

### Extension risk và contraction risk

Negative convexity của MBS mang hai gương mặt, và cả hai đều tệ đúng lúc:

**Contraction risk** — khi rate *giảm*: refinance bùng nổ, prepay tăng vọt, MBS trả gốc về nhanh, đời sống ngắn lại (duration co). Bạn nhận đống tiền mặt phải tái đầu tư ở *chính mức rate thấp* vừa gây ra prepay — reinvestment ở lợi suất kém. Và giá MBS *không tăng nhiều* như bond thường (bị chặn trên bởi call của chủ nhà). Đây là phía "được ít" của negative convexity.

**Extension risk** — khi rate *tăng*: prepay chậm lại (không ai refinance khi rate cao hơn), gốc về chậm, đời sống *dài ra* (duration nở). Bạn kẹt tiền trong một tài sản coupon thấp *đúng lúc* rate thị trường đã cao — không rút ra được để tái đầu tư ở rate mới hấp dẫn. Đây là phía "mất đủ". Extension risk đặc biệt độc: duration của bạn tự động dài ra đúng khi bạn muốn nó ngắn.

Sự bất đối xứng "duration co khi rate xuống, nở khi rate lên" *chính là* negative convexity nói bằng ngôn ngữ duration — nó ngược hoàn toàn với bond thường (bond thường duration co khi rate lên do chiết khấu mạnh hơn, nhưng hiệu ứng đó nhỏ và cùng chiều với lợi ích). Nói cách khác: bond thường có $\partial D/\partial y < 0$ theo hướng "tốt", MBS có $\partial D/\partial y < 0$ theo hướng "xấu ở cả hai đầu".

### Effective duration và effective convexity bằng bump-and-revalue

Vì dòng tiền MBS đổi theo rate, không thể dùng duration giải tích (Macaulay/modified) — phải dùng **effective duration**: bump curve, chạy lại toàn bộ Monte Carlo + prepayment, đo giá đổi (bump-and-revalue, Chương 12). Giữ OAS cố định (để cô lập hiệu ứng rate), shift curve $\pm 25\,\text{bp}$.

Giả sử MBS giá base $P_0 = 102.0$, sau bump:

$$
P_{-25\text{bp}} = 102.9, \qquad P_{+25\text{bp}} = 100.5.
$$

Effective duration (central difference, $\Delta y = 0.0025$):

$$
D_{\text{eff}} = \frac{P_{-} - P_{+}}{2\,P_0\,\Delta y} = \frac{102.9 - 100.5}{2 \times 102.0 \times 0.0025} = \frac{2.4}{0.51} = 4.7.
$$

Effective convexity:

$$
C_{\text{eff}} = \frac{P_{-} + P_{+} - 2P_0}{P_0\,(\Delta y)^2} = \frac{102.9 + 100.5 - 2(102.0)}{102.0 \times (0.0025)^2} = \frac{-0.6}{102.0 \times 6.25\times10^{-6}} = \frac{-0.6}{0.00063750} = -941.
$$

Đọc con số. Effective duration 4.7 nghĩa mỗi 100bp rate làm giá đổi ~4.7% — thước đo rate sensitivity chuẩn để hedge. Nhưng con số then chốt là effective convexity **−941**: âm và *rất lớn* về độ lớn. So với callable bond đơn lẻ (−67 ở mục 17.1), MBS negative convexity dữ dội hơn nhiều vì prepayment phản ứng mạnh và nhanh với rate (S-curve dốc), và vì hiệu ứng cộng dồn qua 360 tháng dòng tiền. Về mặt hedging, một portfolio MBS có convexity −941 nghĩa là mọi cú rate move lớn (theo cả hai chiều) đều làm bạn thua so với hedge duration tuyến tính — cụ thể, thành phần convexity của một cú move 50bp đóng góp $\tfrac{1}{2}(-941)(0.005)^2 \times 102 \approx -1.2$ điểm P&L, luôn âm. Bạn phải hedge convexity riêng (mua options/swaptions để bù convexity dương), và chi phí hedge convexity ấy chính là một phần lớn của cái spread bạn kiếm được. Đây là lý do MBS desk thực chất là *option desk*: bạn kiếm carry từ OAS nhưng liên tục trả phí để trung hòa negative convexity.

Chú ý bump phải giữ OAS cố định: nếu để OAS tự điều chỉnh khớp giá thị trường ở mỗi bump, bạn đo lẫn cả credit/liquidity re-pricing chứ không thuần rate sensitivity. Đây là một pitfall bump-and-revalue kinh điển — bump *cái gì* quyết định *đo được cái gì*. Một pitfall song hành: nếu bump quá nhỏ, MC noise (variance của $\frac{1}{M}\sum PV^{(j)}$) nuốt mất tín hiệu convexity bậc hai; nên bump-and-revalue MBS cần *cùng* bộ random numbers (common random numbers/antithetic khớp) giữa các kịch bản để triệt noise — nếu không, con số −941 có thể chỉ là nhiễu Monte Carlo.

## 17.5 CMO tranches: phân bổ lại prepayment risk

Pass-through dồn toàn bộ prepayment risk lên một loại nhà đầu tư. Không phải ai cũng muốn cùng liều lượng rủi ro ấy: quỹ hưu trí muốn dòng tiền dài ổn định (ghét contraction), quỹ khác chịu được biến động để đổi lấy lợi suất cao. **CMO (Collateralized Mortgage Obligation)** là cấu trúc *xẻ* dòng tiền prepayment của một pool pass-through thành nhiều tranche với hồ sơ rủi ro khác nhau — không tạo thêm hay bớt rủi ro tổng, chỉ *phân bổ lại* (giống tranching credit ở CDO, Chương 13, nhưng ở đây rủi ro là timing của prepay chứ không phải loss).

### Sequential-pay

Cấu trúc CMO đơn giản nhất. Tranches A, B, C, D xếp thứ tự: *mọi* khoản principal (scheduled + prepay) đổ vào tranche A trước cho tới khi A hoàn trả hết, rồi mới tới B, rồi C, rồi D. Cả bốn nhận interest trên dư nợ của mình suốt thời gian tồn tại.

Hệ quả bằng trực giác định lượng: tranche A hấp thụ prepayment *đầu tiên* nên nó ngắn hạn và nhận gần hết contraction risk (nếu prepay nhanh, A trả xong rất sớm). Tranche D ("last cash flow") chỉ bắt đầu nhận principal sau khi A, B, C xong — nó dài hạn, ổn định về đầu đời, nhưng gánh gần hết *extension risk* (nếu prepay chậm, D càng bị đẩy xa). Ví dụ số cụ thể (mô phỏng pool 30 năm, WAC 5.5%, bốn tranche bằng nhau, chạy ở 165% PSA): tranche A có average life ~2.1 năm, tranche B ~5.1 năm, tranche C ~9.2 năm, tranche D ~18 năm — cùng một collateral, bốn profile hoàn toàn khác. Nhà đầu tư chọn tranche khớp khẩu vị: money-market fund lấy A (ngắn, chắc), insurer/pension lấy D (dài, khớp nghĩa vụ dài hạn). Cùng một dòng tiền pool, sequential-pay đã tạo ra bốn "maturity" khác nhau từ hư không — đó là phép màu của cash-flow structuring.

### PAC vs support (companion)

Cấu trúc tinh vi và phổ biến hơn: **PAC (Planned Amortization Class)** cùng với **support tranche** (còn gọi companion). PAC được thiết kế để có lịch trả gốc *cố định và ổn định* miễn là prepay speed nằm trong một *băng* định trước — ví dụ PAC band [100% PSA, 300% PSA]. Cơ chế: support tranche *hấp thụ dao động* prepay để bảo vệ PAC.

- Nếu prepay *nhanh* hơn kế hoạch (rate giảm, contraction): phần prepay dư đổ vào support tranche trước, PAC vẫn nhận đúng lịch → support gánh contraction, PAC được che.
- Nếu prepay *chậm* hơn kế hoạch (rate tăng, extension): support tranche nhận principal *ít lại* (bị hoãn) để PAC vẫn đủ theo lịch → support gánh extension, PAC được che.

Kết quả bằng số: PAC có average life ổn định (ví dụ luôn ~7 năm) *chừng nào* prepay ở trong band [100%, 300%] PSA; support tranche có average life dao động cực rộng (từ ~1 năm nếu prepay siêu nhanh tới ~25 năm nếu siêu chậm). Support tranche là "kẻ hấp thụ sốc" — nó nhận gần *toàn bộ* negative convexity của pool để PAC gần như convexity-neutral trong band. Đổi lại, support tranche trả OAS cao hơn nhiều (bồi thường cho rủi ro nó ôm). Nếu prepay *vượt band* (ví dụ prepay quá nhanh làm support cạn sạch), PAC mất bảo vệ và "broken PAC" bắt đầu hành xử như pass-through — một cạm bẫy 2008 cho nhà đầu tư tưởng PAC là an toàn tuyệt đối.

Điểm sư phạm: CMO không *giảm* negative convexity tổng — tổng convexity của tất cả tranche (trọng số theo notional) vẫn bằng convexity của pool. Nó *tái phân bổ*: PAC mua được convexity gần bằng 0 bằng cách *bán* convexity xấu cho support tranche, và support được trả OAS cao để nhận. Đây là bản chất của mọi cấu trúc structured: chuyển rủi ro từ bên ghét nó sang bên sẵn lòng ôm với giá đúng — một định luật bảo toàn, không phải phép biến rủi ro thành không.

### Agency vs non-agency

Chiều rủi ro cuối cùng, độc lập với optionality: ai bảo lãnh credit của khoản vay?

**Agency MBS** do Fannie Mae, Freddie Mac (GSE — government-sponsored enterprises) hoặc Ginnie Mae (cơ quan chính phủ, backed full faith and credit của US) bảo lãnh. Nhà đầu tư gần như *không có credit risk* (Ginnie: rủi ro chính phủ Mỹ; Fannie/Freddie: ngầm được chính phủ backing, đã thành hiện thực khi được bailout 2008). Nên với agency MBS, rủi ro *chỉ* là prepayment/rate — và OAS phản ánh gần thuần liquidity + prepayment model risk, gần như không có credit spread.

**Non-agency MBS** (private-label) không có bảo lãnh đó: nhà đầu tư gánh *cả* prepayment risk *và* credit risk (default, foreclosure loss của chủ nhà). Chúng thường được credit-tranche thêm (senior/mezzanine/equity) để phân bổ loss — chồng credit tranching lên trên prepayment tranching. Đây chính là họ subprime MBS/CDO đã nổ tung 2008: khi default tăng vọt, credit tranching (không phải prepayment tranching) là chỗ vỡ, và OAS của non-agency phải cõng cả credit spread lẫn model risk khổng lồ về correlation của default (nối thẳng sang câu chuyện copula, Chương 13).

Với desk quant, phân biệt này quyết định *model stack* cần dùng: agency MBS chỉ cần rate model + prepayment model (chương này); non-agency cần thêm credit/default model chồng lên — hai nguồn optionality (prepay call của chủ nhà và default put của chủ nhà) trong cùng một security, và cả hai đều wrong-way với chu kỳ kinh tế. Éo le nhất: hai option này *âm tương quan theo hướng độc hại* — rate giảm kích prepay (mất phần trên), suy thoái kích default (mất phần dưới), và một cú suy thoái đi kèm cắt rate có thể kích *cả hai cùng lúc*.

---

Sợi chỉ đỏ xuyên suốt chương: bất cứ khi nào một bên *khác* nhà đầu tư nắm quyền định hình dòng tiền — issuer với callable, chủ nhà với prepay — nhà đầu tư đang short một option, và cái giá của option ấy hiện ra dưới ba dấu hiệu luôn đi cùng nhau: **negative convexity** (giá phản ứng bất đối xứng, tệ ở cả hai chiều lớn), **option cost** (phần spread bị "ăn mất", đo bằng Z-spread trừ OAS), và nhu cầu **định giá qua interest-rate model** (tree cho callable, Monte Carlo trên path cho MBS). OAS là đại lượng thống nhất tất cả: nó bóc option ra để lộ spread thực, và chính vì nó là output của model chứ không phải quan sát thị trường, nó vừa là công cụ relative-value mạnh nhất vừa là điểm tập trung model risk lớn nhất của cả asset class. Ai hiểu OAS hiểu vì sao một MBS desk thực chất là một option desk trá hình fixed-income — kiếm carry từ spread, và trả phần lớn nó lại để hedge cái convexity âm mà optionality dúi vào tay mình.

# Chương 18: Rates exotics

Sau Chương 9 bạn đã có ba thứ nền: một curve dựng đúng chuẩn hậu-LIBOR, một smile của rates (swaption cube parametrize bằng SABR), và một bộ term-structure model (Hull-White, G2++/HW2F, LMM, Cheyette) cùng các convexity adjustment nối chúng lại. Nhưng curve và model không phải là hàng hóa — chúng là *hạ tầng*. Cái desk rates thực sự bán, cái sinh ra P&L và trả lương, là những **structured note** gói payoff exotic vào một trái phiếu để nhà đầu tư (quỹ hưu, bảo hiểm, ngân hàng khu vực, retail Nhật) mua như một khoản đầu tư có coupon hấp dẫn hơn tiền gửi. Chương này đi qua đúng những payoff đó theo thứ tự một desk structuring dựng sản phẩm: Bermudan swaption (viên gạch của mọi callable), rồi các note tự-tất-toán (callable/TARN), rồi các note coupon phụ thuộc đường đi (range accrual, snowball), rồi các note cược *hình dạng* curve (CMS spread/steepener), và cuối cùng là con quái vật hybrid FX-rates của thị trường Nhật — PRDC.

Sợi chỉ đỏ xuyên suốt, và là lý do những sản phẩm này khó, nằm ở một câu: **giá của chúng phụ thuộc vào những thứ mà vanilla không định giá được** — smile dynamics (vol thay đổi thế nào khi rate di chuyển), correlation (giữa các đoạn curve, giữa rate và FX), và mean reversion. Một vanilla cap chỉ cần một điểm trên smile; một Bermudan cần *toàn bộ* mặt vol *tương lai*, tức cần model nói vol sẽ ra sao ở mỗi node exercise. Đó là **model risk** — cùng một deal, hai model calibrate khớp *y hệt* mọi vanilla vẫn cho hai giá khác nhau, và chênh lệch ấy là tiền thật trên book. Mỗi mục dưới đây neo bằng một phép tính ra số, đúng tinh thần: exotic là môn học mà trực giác chỉ đến sau khi bạn tự đẩy được một con số qua vài kỳ cashflow.

## 18.1 Bermudan swaption — điểm dừng tối ưu và giá của quyền chờ

Vanilla swaption (Chương 9) cho quyền exercise *một* lần tại expiry. **Bermudan swaption** cho quyền exercise vào *nhiều* ngày định trước — ví dụ một "10-no-call-1" cho quyền, tại mỗi ngày kỷ niệm từ năm 1 đến năm 9, bước vào swap còn lại (đến năm 10). Đây không phải một sản phẩm bên lề: mọi callable bond, mọi callable note, mọi cancelable swap khi bóc lớp ra đều chứa một Bermudan swaption. Người phát hành trái phiếu callable đang *bán* cho nhà đầu tư một coupon cao, đổi lại *mua* quyền gọi lại nợ khi rate giảm — quyền đó chính xác là một Bermudan receiver swaption. Định giá sai nó là định giá sai cả thị trường callable.

**Vì sao Bermudan đắt hơn European.** Nhiều ngày exercise thì quyền chọn rộng hơn, nên $V_{\text{Berm}} \ge \max_i V_{\text{Euro},i}$ — Bermudan không bao giờ rẻ hơn European tốt nhất trong bộ. Nhưng nó *cũng* không đơn giản là tổng các European: các quyền exercise loại trừ nhau (exercise năm 3 thì hết quyền năm 5), nên giá nằm đâu đó giữa "European tốt nhất" và "tổng European". Khoảng chênh so với European tốt nhất — **switch value** hay giá của *tính linh hoạt chờ đợi* — chính là phần khó, và là phần model-dependent.

Bài toán cốt lõi là một **optimal stopping**: tại mỗi node exercise, holder so sánh **giá trị exercise ngay** (intrinsic — giá trị swap nhận được nếu vào lúc này) với **giá trị chờ** (continuation value — kỳ vọng chiết khấu của việc giữ quyền sang node sau). Exercise khi và chỉ khi intrinsic vượt continuation. Ranh giới trong không gian (rate, thời gian) nơi hai giá trị bằng nhau là **exercise boundary** — đường mà dưới nó holder chờ, trên nó holder ra tay.

**Dẫn xuất quy hoạch động.** Gọi $\tau_1 < \tau_2 < \dots < \tau_m$ là các ngày exercise. Tại ngày cuối $\tau_m$, không còn gì để chờ, nên
$$V_m(x) = \text{Intrinsic}_m(x) = \big[\text{giá trị swap tại } \tau_m \text{ nếu exercise}\big]^+,$$
với $x$ là state (short rate, hoặc factor trong HW). Lùi về node trước, tại $\tau_k$ giá trị của quyền là cái lớn hơn giữa exercise ngay và chờ:
$$V_k(x) = \max\Big(\underbrace{\text{Intrinsic}_k(x)}_{\text{ra tay}},\ \underbrace{\mathbb{E}^{\mathbb{Q}}\big[D(\tau_k,\tau_{k+1})\,V_{k+1}(X_{\tau_{k+1}})\,\big|\,X_{\tau_k}=x\big]}_{\text{chờ}}\Big).$$
Đệ quy này chạy ngược từ $m$ về $1$; giá hôm nay là $V_0 = \mathbb{E}^{\mathbb{Q}}[D(0,\tau_1)V_1(X_{\tau_1})]$. Toàn bộ độ khó nằm ở conditional expectation cho continuation value — và có hai đường tính nó.

**Đường 1 — PDE Hull-White.** Trong HW1F, state là một factor Gaussian, nên continuation value thỏa PDE lùi (backward Kolmogorov / Feynman-Kac) một chiều không gian:
$$\frac{\partial V}{\partial t} + \tfrac12\sigma^2\frac{\partial^2 V}{\partial x^2} - a\,x\,\frac{\partial V}{\partial x} - r(x,t)\,V = 0,$$
giải bằng finite-difference (Crank-Nicolson) trên lưới $(x,t)$. Tại mỗi ngày exercise, thay $V \leftarrow \max(V, \text{Intrinsic})$ — đúng một dòng áp đặt điều kiện exercise, phần còn lại là roll PDE giữa các node. Ưu điểm: exercise boundary hiện ra *chính xác và trơn*, không noise; Greeks ổn định. Đây là workhorse cho Bermudan một/hai factor.

**Đường 2 — Longstaff-Schwartz (LSM).** Khi state nhiều chiều (LMM, hoặc HW2F cho một số cấu hình), PDE hết khả thi và ta dùng Monte Carlo với hồi quy (đã gặp ở Chương 12). Ý tưởng: mô phỏng nhiều path forward; tại mỗi node exercise, **hồi quy** giá trị tiếp diễn (đã chiết khấu, từ path) lên các basis function của state hiện tại (ví dụ $1, x, x^2$, hoặc swap rate và annuity) — hồi quy cho ta hàm continuation $\hat C_k(x)$; rồi ra quyết định exercise trên path bằng cách so intrinsic với $\hat C_k$. Điểm tinh tế thực chiến: **hồi quy chỉ dùng để quyết định exercise**, còn giá trị cuối lấy từ cashflow thực trên path sau khi đã áp quyết định đó — nếu lấy thẳng giá trị hồi quy làm giá thì dính bias hướng lên (look-ahead qua chính bộ dữ liệu regression).

**Ví dụ số — Bermudan vs European, tính đến cùng.** Xét một Bermudan payer swaption "5-no-call-1": exercise vào cuối mỗi năm từ năm 1 đến năm 4 để bước vào swap trả-fixed đến năm 5, strike ATM $= 4.0\%$, trên curve phẳng 4% của Chương 9 (annual compounding). Ta dựng một Hull-White 1-factor với mean reversion $a = 5\%$ và calibrate short-rate vol $\sigma$ sao cho European co-terminal đầu tiên khớp đúng **normal vol $\sigma_N = 100\,\text{bp}$** — kết quả $\sigma \approx 108\,\text{bp}$. Với model đã fix, mọi con số dưới đây là output trực tiếp của định giá, không phải áng chừng.

Trước hết, giá của từng **European ATM payer swaption** trong bộ, tính chính xác bằng Jamshidian decomposition trong HW (mỗi cái là một rổ zero-bond option). Chú ý một điểm dễ sai mà bản nháp đầu tay hay vấp: giá ATM Bachelier là
$$V_{\text{Euro}} = A\cdot\sigma_N\cdot\sqrt{T}\cdot\phi(0),\qquad \phi(0)=\tfrac{1}{\sqrt{2\pi}}=0.3989,$$
nên **có hệ số $\sqrt{T}$**: expiry càng xa thì time value trên mỗi đơn vị annuity càng lớn. Annuity $A$ (đã chiết khấu) thì lại co lại khi swap ngắn dần. Hai lực ngược chiều này giao tranh, nên giá European *không* đơn điệu giảm theo năm exercise:

| Exercise year | Swap còn lại | Annuity $A$ (discounted) | $\sqrt{T}$ | European ATM value (% notional) |
|---|---|---|---|---|
| 1 | 4Y | 3.49 | 1.00 | 1.39% |
| 2 | 3Y | 2.57 | 1.41 | 1.44% |
| 3 | 2Y | 1.68 | 1.73 | 1.16% |
| 4 | 1Y | 0.82 | 2.00 | 0.65% |

European **tốt nhất là năm 2** ở **1.44%** — *không* phải năm 1, đúng vì hệ số $\sqrt{T}$ ở năm 2 ($\sqrt2\approx1.41$) đủ bù cho annuity nhỏ hơn. (Một sai lầm kinh điển là bỏ quên $\sqrt T$, dùng "value $= A\cdot\sigma_N\cdot\phi(0)$" cho mọi năm; khi đó bảng thành $1.39, 1.02, 0.67, 0.33$ và ta *tưởng* năm 1 tốt nhất — sai cả con số lẫn kết luận về ngày exercise "nguy hiểm nhất".) Tổng bốn European là $1.39+1.44+1.16+0.65 = 4.64\%$ — cận trên thô (nếu các quyền độc lập, điều không đúng vì chúng loại trừ nhau).

Giá **Bermudan thực**, chạy Longstaff-Schwartz trên cùng HW1F đã calibrate ($120{,}000$ path, basis $1,x,x^2$), rơi vào khoảng **1.90% notional** (sai số Monte Carlo $\pm0.01\%$). Đọc con số: Bermudan $1.90\%$ đắt hơn European tốt nhất $1.44\%$ đúng
$$\text{switch value} = 1.90\% - 1.44\% = 0.46\%\ \text{notional}.$$
Đó là **switch value** — giá của quyền được chờ và chọn ngày tối ưu thay vì bị ép quyết định ở một expiry duy nhất. Nó chiếm khoảng $0.46/1.90 \approx 24\%$ giá Bermudan, hay $\approx 32\%$ *trên nền* European tốt nhất — một tỷ trọng lớn, và toàn bộ tỷ trọng ấy là thứ *model-dependent*, không đọc được từ vanilla.

**Model choice: HW1F vs LMM và vì sao đổi giá.** Đây là trái tim model risk của Bermudan. Cả HW1F lẫn LMM đều calibrate khớp *y hệt* mọi European swaption trong cube — nghĩa là chúng đồng ý về mọi vanilla. Nhưng Bermudan phụ thuộc hai thứ vanilla không ràng buộc:

- **Mean reversion $a$.** HW1F có một $a$ đơn (ví dụ 5%). $a$ điều khiển *terminal decorrelation* — mức độ các rate ở kỳ hạn/thời điểm khác nhau tách correlation theo thời gian. $a$ cao → rate quay về nhanh, các exercise date decorrelate mạnh → mỗi ngày exercise "độc lập" hơn → switch value **cao hơn** (nhiều quyền thực sự khác nhau để chọn). $a$ thấp → rate dai dẳng, các ngày exercise gần như cùng một biến → switch value **thấp hơn**. Vanilla không nhìn thấy $a$ (một European chỉ có một expiry), nên $a$ là tham số *tự do* mà giá Bermudan nhạy.
- **Correlation structure đa-tenor.** LMM cho phép cả một ma trận correlation giữa các forward; HW1F ép correlation tức thời giữa mọi rate về 1 (một Brownian) và chỉ tạo decorrelation qua mean reversion. LMM với correlation "thực tế" (đầu ngắn và đầu dài decorrelate) thường cho exercise boundary khác, và giá Bermudan lệch.

Bằng số: cùng deal 5nc1 trên, đẩy $a$ từ $5\%$ lên $10\%$ *và re-calibrate* $\sigma$ để giữ nguyên fit vanilla (short-rate vol tăng từ $108\,\text{bp}$ lên $\approx122\,\text{bp}$ để bù) nâng giá Bermudan từ $1.90\%$ lên khoảng $1.94\%$ — **$\approx4\,\text{bp}$ notional chỉ từ một tham số không quan sát được**, với switch value tăng từ $0.46\%$ lên $0.50\%$. Đúng chiều dự đoán (mean reversion cao hơn → decorrelation mạnh hơn → switch value lớn hơn), và trên một book callable notional vài tỷ, $4\,\text{bp}$ là hàng triệu; với các cấu trúc dài hơn (10nc1, callable 30Y) độ nhạy này phóng đại lên nhiều lần. Đây là lý do desk rates coi **mean reversion là một "vega thứ hai"**: Bermudan có vega thường (nhạy mức vol) *và* nhạy mean-reversion/decorrelation. Cạm bẫy kinh điển: chọn $a$ để "khớp giá thị trường của Bermudan liquid" rồi dùng cho Bermudan illiquid — hợp lý, nhưng nếu thị trường Bermudan mỏng thì $a$ trở thành *tham số mark-to-model*, và hai bank có thể mark cùng một deal lệch nhau vì chọn $a$ khác. Model validation (Chương 19) vì thế bắt buộc **model reserve** cho phần giá phụ thuộc $a$ và correlation không thể hedge bằng vanilla.

Tổng kết viên gạch: Bermudan là bài optimal stopping, giải bằng PDE (HW, ít chiều) hoặc LSM (nhiều chiều, tie Chương 12), và giá của nó tách làm hai — phần European "nhìn thấy được từ vanilla" và **switch value** ẩn trong mean reversion + correlation, nơi model risk sống.

## 18.2 Callable/puttable & range structured notes — bức tranh tổng quát

Trước khi vào từng payoff, cần khung chung. Một **structured note** là một trái phiếu mà coupon và/hoặc điều khoản tất toán được gắn vào một payoff derivative. Kỹ thuật định giá luôn là **decomposition**: note = (một trái phiếu/annuity "sạch") ± (một derivative). Nhà đầu tư mua note thực chất mua bond và *bán* option cho issuer (hoặc mua option từ issuer), và coupon cao chính là premium của option đó chảy ngược về dưới dạng lãi.

- **Callable note**: issuer giữ quyền gọi lại (redeem sớm) ở mệnh giá vào các ngày định trước. Nhà đầu tư = long bond + **short** một Bermudan (issuer call khi rate giảm/giá bond lên). Vì bán option, nhà đầu tư được coupon cao hơn bond thường. Value cho nhà đầu tư = bond straight − Bermudan call value.
- **Puttable note**: nhà đầu tư giữ quyền bán lại note cho issuer ở mệnh giá. Nhà đầu tư = long bond + **long** một Bermudan put (bảo vệ khi rate tăng/giá bond xuống). Nhà đầu tư *trả* premium bằng coupon thấp hơn.

Ví dụ số nhanh: một note 5Y trả coupon 5% (so với straight 5Y yield 4%), callable hằng năm. "Coupon dôi" 1%/năm, chiết khấu về hôm nay ở mức 4%:
$$\sum_{t=1}^{5}\frac{1\%}{(1.04)^t} = 0.962\%+0.925\%+0.889\%+0.855\%+0.822\% = 4.45\%\ \text{notional}.$$
Con số $\approx4.4\%$ ấy chính là premium nhà đầu tư nhận để bán quyền call — và nếu Bermudan call mà issuer nắm định giá ra $\approx4.4\%$ thì note niêm yết công bằng ở par. Nếu quant định giá Bermudan chỉ $3.5\%$ (do chọn $a$ thấp làm switch value teo), issuer *nghĩ* mình mua quyền rẻ và phát hành coupon quá hào phóng — lỗ $\approx0.9\%$ notional ngay khi phát hành. Đây là cầu nối trực tiếp từ model risk 18.1 sang P&L: sai $a$ vài phần trăm ở mục trước biến thành gần một điểm phần trăm notional lỗ ngay đây.

**Range structured note** là một họ riêng: coupon không cố định mà phụ thuộc reference rate nằm trong/ngoài một khoảng. Chúng đưa ta sang các payoff path-dependent của 18.4. Điểm chung của cả họ: **coupon là biến ngẫu nhiên phụ thuộc đường đi của rate**, nên định giá cần model mô phỏng đường đi (hoặc replicate bằng rổ digital/option), và mọi cái nhạy smile vì digital = đạo hàm của call theo strike.

## 18.3 TARN — target redemption note

**TARN (Target Redemption Note)** là note mà coupon *tích lũy*, và ngay khi **tổng coupon đã trả chạm một target** định trước thì note **tự tất toán** (auto-redeem), trả lại mệnh giá cho nhà đầu tư. Nghĩa là maturity không cố định — nó *ngẫu nhiên*, phụ thuộc rate đi thế nào. Đây là điểm hấp dẫn với nhà đầu tư (được "chốt lời" nhanh nếu điều kiện thuận) và là điểm khó với quant (maturity là một stopping time, path-dependent nặng).

Cấu trúc điển hình: mỗi kỳ trả một coupon có tính "inverse floater" — cao khi rate thấp, ví dụ $c_k = \max(0,\ L - g\cdot \text{LIBOR}_k)$ (với $L$ một mức cố định, $g$ leverage), hoặc đơn giản một coupon phụ thuộc điều kiện. Note tích lũy $\sum c_k$ cho tới khi đạt target $T^*$ thì tắt; kỳ cuối thường trả *đúng phần còn thiếu* để tổng chạm chính xác target (cap ở target).

**Ví dụ số — cashflow qua vài kỳ đến target 8%.** Target $T^* = 8\%$ tổng coupon. Coupon mỗi kỳ (annual) là $c_k = \max(0,\ 6\% - 1.0\times\text{LIBOR}_k)$ — một inverse floater không leverage. Giả sử đường LIBOR thực hiện theo một kịch bản:

| Kỳ $k$ | LIBOR$_k$ | Coupon thô $6\%-\text{LIBOR}$ | Coupon trả | Tổng tích lũy |
|---|---|---|---|---|
| 1 | 2.0% | 4.00% | 4.00% | 4.00% |
| 2 | 2.5% | 3.50% | 3.50% | 7.50% |
| 3 | 3.0% | 3.00% | **0.50%** (cap) | **8.00% → auto-redeem** |
| 4 | — | — | — | (không xảy ra) |

Đọc từng bước: kỳ 1 coupon thô $6\%-2\%=4.00\%$, trả 4%, tích lũy 4%. Kỳ 2 coupon thô $6\%-2.5\%=3.50\%$, trả 3.5%, tích lũy 7.5% — chưa chạm 8%. Kỳ 3 coupon thô là $6\%-3\%=3.00\%$, nhưng nếu trả đủ thì tổng thành $7.5+3.0 = 10.5\% > 8\%$, nên TARN **cap** coupon kỳ này ở đúng phần còn thiếu $8.0 - 7.5 = 0.5\%$, tổng chạm target, note **tự tất toán ngay cuối kỳ 3** và trả lại mệnh giá. Nhà đầu tư nhận tổng coupon đúng 8% trong 3 năm thay vì 4-5 năm dự kiến — IRR bị "nén" lên vì tiền về sớm.

Bây giờ đọc *rủi ro của issuer/desk* qua một kịch bản khác: nếu LIBOR **tăng nhanh** (giả sử 4%, 5%, 6% ba kỳ đầu), coupon thô là $6\%-4\%=2\%$, $6\%-5\%=1\%$, $6\%-6\%=0\%$ — tích lũy chậm ($2\%, 3\%, 3\%$), note **không** redeem sớm, kéo dài hết maturity danh nghĩa (giả sử 10Y) mà vẫn chưa chạm target. Đây là bản chất rủi ro TARN: **duration ngẫu nhiên nghịch với rate**. Khi rate thấp, coupon cao, note tắt nhanh (short duration); khi rate cao, coupon thấp, note sống dài (long duration) — đúng lúc issuer *không muốn* nợ dài. TARN vì thế có **negative convexity theo rate** và một dạng "auto-callable" nghịch. Điều này làm hedge khó: delta của TARN nhảy khi xác suất redeem đổi, và **vega âm** (vol cao → phân tán path → target dễ trượt ở một số path, kéo dài duration). Định giá bắt buộc Monte Carlo trên một model rates (LMM hoặc Cheyette), vì payoff phụ thuộc *cả đường đi* của rate và một stopping time nội sinh; không có công thức đóng. Cạm bẫy thực chiến: TARN nhạy **auto-correlation của rate qua thời gian** (rate hôm nay và năm sau tương quan bao nhiêu quyết định target chạm nhanh hay chậm), một tính chất mean-reversion/vol-term-structure không đọc được từ một điểm vol — lại là model risk.

## 18.4 Range accrual — coupon theo tỷ lệ ngày "in range"

**Range accrual note** trả một coupon mà mỗi ngày trong kỳ chỉ "được tính" nếu reference rate ngày đó nằm trong một range $[L, U]$. Coupon hiệu dụng của kỳ tỉ lệ với **số ngày in-range chia tổng số ngày**:
$$\text{Coupon kỳ} = c\times\frac{\#\{\text{ngày mà } L \le \text{ref}_d \le U\}}{\#\text{ngày trong kỳ}}.$$
Nhà đầu tư đặt cược rate sẽ "ở yên" trong range — được coupon cao nếu đúng, mất coupon nếu rate lang thang ra ngoài. Đây là một trong những note bán chạy nhất mọi thời vì trực giác đơn giản và coupon niêm yết hấp dẫn.

**Ví dụ số — một kỳ 22/30 ngày in range.** Coupon danh nghĩa $c = 5\%$/năm, range LIBOR $[3\%, 5\%]$, kỳ 30 ngày (minh họa; kỳ thật thường 90 ngày). Trong kỳ, giả sử LIBOR nằm trong $[3\%,5\%]$ vào **22 ngày** và ra ngoài 8 ngày. Coupon hiệu dụng của kỳ (annual-rate cho kỳ này):
$$5\%\times\frac{22}{30} = 5\%\times0.7333 = 3.667\%.$$
Nếu tất cả 30 ngày in range thì nhận đủ 5%; nếu ra hết thì nhận 0. Ở 22/30, nhà đầu tư nhận **3.667%** — mất $5\% - 3.667\% = 1.333\%$ (annualized rate) so với coupon tối đa, đúng bằng phần $\tfrac{8}{30}$ ngày rate "trốn" khỏi range ($5\%\times\tfrac{8}{30}=1.333\%$).

**Định giá — rổ digital.** Đây là ví dụ đẹp rằng một payoff exotic phân rã thành rổ vanilla. Coupon cho *mỗi ngày quan sát* $d$ là một **range digital**: trả $c/N$ (với $N$ tổng ngày) nếu $L \le \text{ref}_d \le U$, ngược lại 0. Range digital = digital-call tại $L$ trừ digital-call tại $U$:
$$\mathbb{1}\{L \le X \le U\} = \mathbb{1}\{X \ge L\} - \mathbb{1}\{X \ge U\}.$$
Mỗi digital-call lại là *đạo hàm âm của giá call theo strike*: $\text{Digital}(K) = -\partial C/\partial K$. Giá range accrual vì thế là tổng (trên mọi ngày quan sát) của một cặp digital chiết khấu:
$$V = \sum_{d}\frac{c}{N}\,P(0,T_p)\,\Big[Q_d(L) - Q_d(U)\Big],$$
với $Q_d(K) = \mathbb{Q}(\text{ref}_d \ge K)$ là xác suất risk-neutral (đọc dưới đúng forward measure), tính từ smile.

**Vì sao range accrual nhạy smile — và bằng số.** Digital = $-\partial C/\partial K$, mà độ dốc của $C$ theo $K$ *chứa slope của smile* (skew). Bỏ smile (dùng một vol phẳng ATM) sẽ mis-price digital, và range accrual gom hàng trăm digital nên sai số cộng dồn. Cụ thể, đạo hàm giá call theo strike có hai thành phần khi vol phụ thuộc strike:
$$\frac{\partial C}{\partial K}=\underbrace{\frac{\partial C}{\partial K}\Big|_{\sigma}}_{\text{vol cố định}}+\underbrace{\frac{\partial C}{\partial\sigma}\cdot\frac{\partial\sigma}{\partial K}}_{\text{số hạng skew}}.$$
Số hạng thứ hai — vega nhân slope của smile — là thứ vol-phẳng bỏ sót. Ví dụ: một digital "trên $U=5\%$" tính bằng vol phẳng cho xác suất, giả sử, $Q(U)=0.30$; nhưng nếu smile có skew âm (vol cao hơn ở strike thấp, tức $\partial\sigma/\partial K<0$) thì $\partial C/\partial K$ thực âm hơn, đẩy digital $-\partial C/\partial K$ lên và làm $Q(U)$ dịch cỡ vài phần trăm — đủ để coupon kỳ vọng của một ngày lệch, và trên hàng trăm ngày × nhiều năm, chênh giá tích thành nhiều bp đến chục bp notional. Bài học: range accrual **không** định giá được bằng một vol; nó là "smile viết lại thành rổ digital", đúng họ hàng với CMS ở 9.6 (payoff phi tuyến → rổ option → tích phân trên smile). Ngoài ra range accrual mang **short vega** (rate ở yên → tốt cho holder → holder short vol) và, nếu range accrual là *callable* (rất phổ biến — "callable range accrual" là sản phẩm chủ lực), lại chồng thêm một Bermudan lên trên, gộp cả model risk của 18.1 vào.

## 18.5 Snowball / snowblade — coupon path-dependent tự cộng dồn

**Snowball** là note mà coupon mỗi kỳ *xây trên coupon kỳ trước* cộng/trừ một hàm của rate hiện tại — coupon "lăn như quả cầu tuyết". Dạng chuẩn:
$$c_k = \max\big(0,\ c_{k-1} + \text{spread} - \text{ref}_k\big),$$
với $c_0$ một coupon khởi tạo. Vì $c_k$ nhớ $c_{k-1}$, payoff **path-dependent** toàn phần: cả lịch sử rate quyết định coupon hôm nay, không chỉ rate hôm nay. **Snowblade** là biến thể có thêm leverage (nhân hệ số vào ref hoặc vào phần cộng dồn), làm coupon "sắc" hơn. Trực giác cược: holder được lợi khi rate **giảm dần** (mỗi $\text{ref}_k$ nhỏ nên $c_{k-1}+\text{spread}-\text{ref}_k$ dương và cộng dồn lên) — snowball là một cược *leverage vào đường đi giảm của rate*, ngược pha inverse floater thường ở chỗ nó *tích lũy* lợi thế.

**Ví dụ số — 3 kỳ.** Cho $c_0 = 4\%$, spread $= 3\%$, và một đường ref (LIBOR):

| Kỳ $k$ | ref$_k$ | $c_{k-1} + \text{spread} - \text{ref}_k$ | Coupon $c_k = \max(0,\cdot)$ |
|---|---|---|---|
| 1 | 2.0% | $4.0 + 3.0 - 2.0 = 5.0\%$ | **5.00%** |
| 2 | 2.5% | $5.0 + 3.0 - 2.5 = 5.5\%$ | **5.50%** |
| 3 | 4.0% | $5.5 + 3.0 - 4.0 = 4.5\%$ | **4.50%** |

Đọc từng bước: kỳ 1, rate thấp (2%), coupon vọt lên 5% (từ nền 4% + spread 3% − 2%). Kỳ 2, rate vẫn thấp (2.5%), coupon *xây tiếp trên 5%* thành 5.5% — quả cầu tuyết lớn dần. Kỳ 3, rate bật lên 4%, coupon co lại còn 4.5% nhưng **vẫn cao** vì đã tích lũy nền lớn từ hai kỳ trước. So với một inverse floater thường (không nhớ), coupon kỳ 3 sẽ chỉ là $\max(0, 6\%-4\%) = 2\%$ — snowball cho **4.5%** vì mang theo lịch sử. Đó là bản chất "memory": coupon cao được *khóa vào* và chỉ xói mòn dần nếu rate tăng bền.

Nếu rate **tăng mạnh** một kỳ (giả sử kỳ 3 ref $= 9\%$): $5.5 + 3.0 - 9.0 = -0.5\% \to \max(0,\cdot) = 0$. Coupon về 0 và — điểm độc của snowball — *lịch sử reset*: kỳ sau xây từ $c_3 = 0$, nên một cú sốc rate xóa sạch cầu tuyết đã đắp. Đây là **leverage phi tuyến vào đường đi**: giá trị note cực nhạy không chỉ mức rate mà cả *thứ tự* các rate xuất hiện (rate giảm-rồi-tăng khác hẳn tăng-rồi-giảm dù cùng tập giá trị). Không một công thức đóng nào bắt được điều này; định giá là **Monte Carlo trên LMM/Cheyette**, và giá nhạy toàn bộ **vol term structure + serial correlation** của rate. Cạm bẫy: snowball có **long vega dạng lạ** — vol cao làm một số path đạt coupon rất cao (do cộng dồn) trong khi sàn $\max(0,\cdot)$ chặn dưới, nên phân phối coupon lệch phải mạnh; định giá bằng vol quá thấp sẽ *undervalue* option-ality của cầu tuyết. Model risk ở đây là **smile dynamics**: khi rate di chuyển, vol tương lai của rate (thứ điều khiển kích thước bước cộng dồn) phải được model dự báo đúng — vanilla không nói gì về nó.

## 18.6 CMS spread options & steepener/flattener notes

Các note ở 18.3–18.5 cược *mức* rate. Một họ lớn khác cược **hình dạng** của curve — dốc lên (steep) hay phẳng/dốc xuống (flat/invert). Công cụ là **CMS spread option**: payoff trên chênh lệch hai CMS rate, điển hình
$$\text{Payoff} = \max\big(S^{10Y}_T - S^{2Y}_T - K,\ 0\big),$$
với $S^{10Y}, S^{2Y}$ là các CMS (constant maturity swap) rate — swap rate 10Y và 2Y quan sát tại $T$. Gói vào note: một **steepener note** trả coupon cao khi curve dốc lên (spread 10Y−2Y lớn), tức holder long CMS spread; **flattener** ngược lại. Đây là cách nhà đầu tư đặt view "curve sẽ dốc lên" thành coupon.

**Hai lớp phức tạp chồng nhau.** Thứ nhất, mỗi CMS rate riêng *đã* cần **convexity adjustment** (mục 9.6): CMS trả swap rate dưới forward measure nơi swap rate không là martingale, nên phải cộng adjustment. Nhắc lại con số 9.6 (dạng exponential Hagan): CMS 10Y với $S_0=4.5\%$, hệ số replication $\theta=0.221$, vol 20%, quan sát $T=5$ cho
$$\text{CA}=S_0\big(e^{\sigma^2 T}-1\big)\theta = 4.5\%\times\big(e^{0.04\times5}-1\big)\times0.221 = 4.5\%\times0.2214\times0.221 \approx 22\text{bp},$$
tức phải dùng $4.50\% + 0.22\% = 4.72\%$ làm forward hiệu dụng. CMS 2Y có adjustment nhỏ hơn (swap ngắn hơn, $\theta$ nhỏ hơn) — giả sử $\approx6\,\text{bp}$, nên forward 2Y hiệu dụng $\approx S^{2Y}_0 + 0.06\%$.

Thứ hai — và là chỗ CMS spread *khác về chất* — payoff phụ thuộc **correlation** giữa hai swap rate. Vol của spread (normal/Bachelier world):
$$\sigma_{\text{spread}}^2 = \sigma_{10}^2 + \sigma_2^2 - 2\rho\,\sigma_{10}\sigma_2.$$
Correlation $\rho$ (giữa đoạn 2Y và 10Y của curve, thực nghiệm ~70–90%) *không* được sinh bởi model một-factor: HW1F ép mọi rate động cùng một Brownian nên $\rho = 1$, làm $\sigma_{\text{spread}} \to 0$ và option gần như vô giá trị. Đây là lý do CMS spread **bắt buộc HW2F/G2++** (hoặc LMM) — nhân tố thứ hai tạo đúng correlation curve.

**Ví dụ số — payoff khi spread = 40bp.** Giả sử tại $T$, forward-adjusted CMS 10Y $= 4.72\%$ và CMS 2Y $= 4.32\%$, nên spread kỳ vọng $= 40\text{bp}$. Với strike $K = 0$ (steepener trả toàn bộ spread dương), giá option xấp xỉ theo Bachelier trên spread:
$$\text{Call} = (F-K)\,N(d) + \sigma_{\text{spread}}\sqrt{T}\,\phi(d),\qquad d = \frac{F-K}{\sigma_{\text{spread}}\sqrt T},$$
với $F=$ spread kỳ vọng. Lấy $\sigma_{10} = \sigma_2 = 90\text{bp}$ (normal vol), $\rho = 0.8$, $T = 1$. Vì hai vol bằng nhau, $\sigma_{\text{spread}} = \sigma\sqrt{2(1-\rho)}$:
$$\sigma_{\text{spread}} = 0.90\%\times\sqrt{2\times0.2} = 0.90\%\times0.6325 = 0.569\%\ (=56.9\text{bp}).$$
Với spread $F = 0.40\%$, $K = 0$, $T=1$:
$$d = \frac{0.40\%}{0.569\%\times1} = 0.703,\quad N(0.703)=0.759,\quad \phi(0.703)=0.312.$$
Giá:
$$V = (0.40\%-0)\times0.759 + 0.569\%\times0.312 = 0.304\% + 0.177\% = 0.481\%.$$
Đọc: một CMS spread call ATM-ish với spread 40bp, correlation 0.8, đáng **$\approx48\,\text{bp}$ notional** cho một kỳ — tách thành intrinsic-ish $0.304\%$ (spread dương × xác suất kết thúc in-the-money) cộng time value $0.177\%$.

Bây giờ **thử sai correlation**: nếu ai đó (nhầm) dùng HW1F ép $\rho = 1$, thì $\sigma_{\text{spread}} = 0$, option chỉ còn intrinsic $\max(0.40\% - 0, 0) = 0.40\%$ — mất toàn bộ time value $0.481\%-0.40\%=8.1\,\text{bp}$ *và* mất mọi vega/hedge. Ngược lại nếu $\rho$ giảm còn $0.6$:
$$\sigma_{\text{spread}} = 0.90\%\times\sqrt{2\times0.4} = 0.90\%\times0.8944 = 0.805\%,$$
$d = 0.40/0.805 = 0.497$, $N(0.497)=0.690$, $\phi(0.497)=0.353$, và giá vọt lên
$$V = 0.40\%\times0.690 + 0.805\%\times0.353 = 0.276\% + 0.284\% = 0.560\%\ (=56\text{bp}).$$
**Sai correlation ở đây không lệch vài bp mà lệch cả bậc độ lớn** — từ $40\,\text{bp}$ (nếu $\rho=1$) qua $48\,\text{bp}$ ($\rho=0.8$) lên $56\,\text{bp}$ ($\rho=0.6$), tức chỉ riêng time value biến động từ $0$ đến $16\,\text{bp}$ khi correlation trượt trong dải thực nghiệm. Đúng cảnh báo 9.6. CMS spread vì thế là bài toán "hai smile (mỗi CMS replicate trên swaption smile riêng) cộng một correlation (HW2F)", nơi analytics convexity, model choice và curve construction gặp nhau. Model risk chủ đạo: **correlation không hedge được bằng vanilla** — không có instrument thanh khoản nào quote thẳng correlation 2Y-10Y, nên nó là tham số mark-to-model, cần reserve.

## 18.7 PRDC — power reverse dual currency

**PRDC (Power Reverse Dual Currency)** là con quái vật hybrid FX-rates, sản phẩm biểu tượng của thị trường structured Nhật những năm 2000 và bài học model risk kinh điển. Bối cảnh: nhà đầu tư retail Nhật ghét lãi suất JPY gần 0, thèm coupon cao. PRDC cho họ một note JPY (đầu tư bằng yen, nhận coupon bằng yen) nhưng coupon được **gắn vào tỷ giá FX** — cụ thể coupon dạng
$$c_k = \max\Big(0,\ f\cdot\frac{S_{\tau_k}}{S_0} - g\Big),$$
với $S$ là tỷ giá USD/JPY (yen mỗi dollar), $f, g$ hằng số, và thường có floor 0 và cap. "Power" vì đòn bẩy $f$ lớn; "reverse dual" vì coupon nghịch với sức mạnh yen. Trực giác: khi USD mạnh lên (yen yếu, $S$ tăng), coupon cao — nhà đầu tư Nhật thực chất *bán* yen forward dài hạn để đổi lấy coupon, một cược "yen sẽ không mạnh lên mãi". Kỳ hạn **rất dài** (20–30 năm), và note thường **callable** (issuer gọi lại khi bất lợi cho holder).

**Vì sao PRDC là hybrid ba rủi ro chồng nhau.** Định giá cần *ba* model chạy đồng thời, correlate: (1) rates JPY (curve domestic, để chiết khấu và cho drift FX), (2) rates USD (curve foreign, vào drift FX qua chênh lãi suất), (3) FX USD/JPY với vol/smile. Forward FX kỳ hạn dài do **chênh lãi suất** quyết định (covered interest parity, Chương 10). Với quy ước $S$ là *yen mỗi dollar*, currency lãi cao (USD) trade ở forward **discount**, nên
$$F^{\text{FX}}(0,T) = S_0\,e^{(r_{\text{JPY}}-r_{\text{USD}})T}.$$
Với USD lãi cao ($r_{\text{USD}}\approx5\%$) và JPY lãi $\approx0$, số mũ âm, forward USD/JPY **giảm mạnh theo kỳ hạn** (yen "được kỳ vọng mạnh lên" trong risk-neutral world). Ví dụ với $r_{\text{USD}}=5\%$, $r_{\text{JPY}}=0.1\%$, sau 20 năm $F/S_0 = e^{-0.049\times20}=e^{-0.98}\approx0.375$ — dollar mất gần $63\%$ giá trị forward so với yen. Nghĩa là coupon forward của PRDC *tự nó thấp dần* theo kỳ hạn, và giá trị note phụ thuộc sống còn vào việc FX vol và correlation đẩy đuôi phân phối thế nào.

**Rủi ro correlation rates-FX — trực giác và số.** Đây là chỗ PRDC dạy bài học đắt nhất. Coupon là hàm của FX, nhưng nó được chiết khấu và *drift* bởi chênh lãi suất — nếu USD/JPY rate và FX correlate, thì phân phối coupon dịch chuyển. Cụ thể, dưới domestic (JPY) risk-neutral measure, drift của FX chứa $r_{\text{USD}} - r_{\text{JPY}}$, và cả hai rate lẫn FX đều stochastic và tương quan. Correlation rates-FX (thực nghiệm cho USD/JPY thường **âm** — yen mạnh lên khi rate USD giảm, "risk-off") điều chỉnh forward FX một lượng dạng quanto (đã gặp ở Chương 10):
$$F^{\text{adj}} \approx F^{\text{FX}}\cdot e^{-\rho_{r,S}\,\sigma_r\,\sigma_S\,T}\ \text{(bậc một)}.$$
Nhắc con số quanto 10.x để thấy bậc độ lớn: với $\rho = 0.15$, $\sigma_S = 20\%$ (vol FX), $\sigma_r = 10\%$ (vol rate), $T=1$, số mũ là
$$\rho\,\sigma_S\,\sigma_r\,T = 0.15\times0.20\times0.10\times1 = 0.003,\qquad e^{-0.003}\approx 0.9970,$$
tức adjustment $\approx -0.30\%$ trên forward *cho một năm*. Với PRDC $T = 20$–30 năm, cùng dạng số hạng nhưng $\times T$ khiến adjustment **cộng dồn thành nhiều phần trăm** ($-0.003\times20\approx-6\%$ ở bậc một, trước khi tính lại đúng kỳ vọng của tích phân) — một correlation nhích 10 điểm phần trăm có thể đổi giá coupon dài hạn hàng trăm bp. Vì payoff có floor $\max(0,\cdot)$ (phi tuyến), correlation còn vào qua **vol của FX dài hạn**, mà FX vol 30Y thì gần như không có market quote đáng tin — lại là tham số mark-to-model.

**Callability làm mọi thứ tệ hơn.** PRDC callable = holder short một Bermudan trên chính cái hybrid này. Issuer gọi khi note trở nên đắt với họ (coupon phải trả cao) — tức khi yen yếu bền. Định giá call cần optimal stopping (18.1) *trên* một model hybrid ba chiều (JPY rate, USD rate, FX) với correlation đầy đủ, thường là **Monte Carlo Longstaff-Schwartz** (Chương 12) vì PDE ba-bốn chiều quá đắt. Đây gần như đỉnh cao độ khó của rates/FX exotics: bạn chồng model risk của Bermudan (mean reversion, decorrelation của *hai* curve) lên model risk correlation rates-FX lên model risk FX smile dài hạn.

**Bài học lịch sử.** Trong khủng hoảng 2008, khi yen mạnh lên đột ngột (carry unwind), coupon PRDC sụp về floor 0 và các note bị call/không-call lệch dự báo, các dealer phát hiện họ **short correlation và short FX vol dài hạn** ở quy mô khổng lồ mà không hedge được (không có instrument để mua lại). Lỗ correlation/vega đó là một trong những bài học model-risk lớn nhất của thập kỷ, và là lý do PRDC hôm nay được validate cực gắt: **reserve riêng cho correlation rates-FX, cho FX vol dài hạn, và cho callability**, vì cả ba đều là giá của những thứ *không quote được*.

## 18.8 Sợi chỉ chung: model risk là sản phẩm chính

Nhìn lại bảy mục, một chủ đề duy nhất hiện lên. Mọi payoff ở đây calibrate khớp vanilla như nhau, nhưng giá vẫn khác nhau — vì mỗi payoff nhạy một thứ *vanilla không định giá được*:

| Sản phẩm | Nhạy chính (ngoài mức vol) | Vì sao vanilla không thấy |
|---|---|---|
| Bermudan swaption | mean reversion $a$, decorrelation | European chỉ có một expiry |
| TARN | serial correlation, vol term structure | maturity là stopping time nội sinh |
| Range accrual | skew/smile (rổ digital) | digital = slope của smile |
| Snowball/snowblade | smile dynamics, thứ tự path | coupon nhớ toàn bộ lịch sử |
| CMS spread/steepener | correlation 2Y-10Y | không instrument quote correlation |
| PRDC | correlation rates-FX, FX vol 30Y | không có FX vol dài hạn thanh khoản |

Ba đại lượng ẩn — **smile dynamics, correlation, mean reversion** — là "tài sản" mà desk rates thực sự giao dịch khi bán exotic, và là ba thứ không có market thanh khoản để hedge sạch. Số học của chương đã cho thấy chúng lớn đến đâu: switch value $\approx0.46\%$ notional của một Bermudan 5nc1 tầm thường (24% giá trị) treo trên mean reversion; time value của một CMS spread call trượt từ $0$ đến $16\,\text{bp}$ chỉ vì correlation đi từ 1 xuống 0.6; và một quanto adjustment $0.3\%$/năm của PRDC phóng đại thành nhiều phần trăm qua 20–30 năm. Đó là lý do định giá exotic *không kết thúc* ở một con số: mỗi con số đi kèm một **model reserve** cho phần giá phụ thuộc tham số không quan sát được (mean reversion của Bermudan, correlation của CMS spread và PRDC, FX vol dài hạn). Quy trình dựng exotic vì thế luôn ba lớp: chọn model đủ giàu (HW2F cho spread, LMM/Cheyette cho path-dependent, hybrid ba-factor cho PRDC), calibrate khớp mọi vanilla có thể, rồi định lượng và trích lập reserve cho phần *residual* không hedge được.

Chuỗi công cụ khép kín với những gì Q-world đã dựng: curve và smile (Chương 9), FX và quanto/correlation (Chương 10), và bộ numerics — PDE cho Bermudan ít chiều, Longstaff-Schwartz cho Bermudan/PRDC nhiều chiều, Monte Carlo trên LMM cho TARN/snowball (Chương 12). Trong `quantc`, các mảnh này sống ở `src/engines` (longstaff-schwartz, bermudan-dual, pde), `src/models` (hull-white, g2++, lmm) và `src/analytics` (convexity: cmsConvexityAdjustment, quantoForward). Nhưng điểm cốt lõi không phải code — mà là hiểu rằng ở tầng exotic, *sản phẩm bạn bán không phải payoff, mà là view của bạn về ba đại lượng ẩn ấy*, và cả nghề rates exotic quy về việc định giá, hedge tối đa, và reserve phần còn lại của smile dynamics, correlation và mean reversion.

# Chương 19: Kiến trúc pricing library và model validation

Sau mười lăm chương xây từng viên gạch — từ Itô, Black-Scholes, smile, lãi suất, credit, XVA, tới FRTB — chương này lùi lại một bước để hỏi câu hỏi mà không sách hàn lâm nào trả lời: tất cả những thứ đó *sống chung* trong một hệ thống như thế nào, và ai đảm bảo nó không nói dối? Một công thức Heston đẹp trên giấy vô dụng nếu nó nằm rải rác trong ba nghìn dòng code không ai dám sửa; một VaR chính xác vô nghĩa nếu không ai kiểm tra được nó tính đúng. Đây là chương về *nghề* và về *kỷ luật* của nghề — kiến trúc pricing library, một ngày desk quant, con đường tuyển dụng, thế giới Q-quant ngoài bank, và cuối cùng là bộ máy model validation đã trở thành xương sống quy định của toàn ngành sau khủng hoảng.

## 19.1 Giải phẫu một pricing library production

Mọi pricing library nghiêm túc (QuantLib mã nguồn mở; các library nội bộ của GS/JPM/Citi; và `quantc` này) hội tụ về cùng một phân rã — vì bài toán ép như vậy:

```
Market Data  →  Calibration  →  Model  →  Engine  →  Instrument Pricing
     ↓                                        ↓              ↓
  (quotes,        (bootstrap,  (HW, Heston,  (analytic,   (NPV, Greeks,
   curves,         fit SVI,     SABR, LV,     PDE, MC,     cashflows)
   surfaces)       LM optimizer) LMM...)      tree, FFT)
                                                  ↓
                              Risk / XVA / Capital  (portfolio-level)
```

Vì sao dòng chảy này *bắt buộc* phải theo thứ tự đó, chứ không phải một lựa chọn thẩm mỹ? Vì thông tin chỉ đi một chiều. Market data là dữ kiện thô — không thể suy ra từ gì khác. Calibration biến dữ kiện thô thành tham số model bằng cách *đảo ngược* pricing: tìm bộ tham số sao cho model tái tạo được đúng quote. Model là một máy sinh động lực (dynamics) của các biến trạng thái. Engine là cỗ máy tính toán biến dynamics thành con số — cùng một model Hull-White có thể chạy qua analytic (swaption châu Âu), PDE (Bermudan), hay Monte Carlo (exotic đa chiều). Instrument chỉ mô tả *payoff* — nó không biết và không cần biết mình được định giá bằng phương pháp nào. Đảo ngược bất kỳ mũi tên nào là tạo ra vòng lặp phụ thuộc, và vòng lặp phụ thuộc trong hệ thống production là mầm mống của mọi cơn ác mộng bảo trì.

Các nguyên tắc thiết kế đã thành "định luật" — và lý do của chúng:

1. **Instrument ⊥ Model ⊥ Engine** (tách ba trục): một swaption (instrument) price được bằng Black (quote), Hull-White PDE (Bermudan), LMM Monte Carlo (exotic mang tính so sánh) — nếu trộn payoff vào model, mỗi cặp là một class mới, tổ hợp nổ. Trong `quantc`: `src/instruments`, `src/models`, `src/engines` là ba trục đó; `src/registry.ts` + composition ghép chúng lại theo cấu hình thay vì hardcode — đúng convention repo này theo đuổi.
2. **Market data là snapshot bất biến, có version**: pricing hôm nay phải reproduce được năm sau (audit, dispute, backtest model). Không bao giờ để pricing "tự kéo" data sống.
3. **Mọi con số có nguồn gốc (lineage)**: NPV này từ curve nào, quote nào, bộ tham số calibrate lúc mấy giờ. Khi trader hỏi "sao PV đổi 2M qua đêm?", câu trả lời phải phân rã được: do market moves nào, do tham số nào, do code release nào ("P&L explain" — dịch vụ quan trọng bậc nhất quant dev cung cấp).
4. **Generic trên kiểu số** để AAD cắm được (`src/aad`): quyết định từ ngày đầu, như đã nói ở Chương 12.
5. **Hai chế độ chính xác**: FO cần chính xác từng deal (full smile model); XVA/risk cần nhanh trên triệu định giá (model rẻ + proxy — `src/proxy`). Cùng instrument, hai cấu hình engine — thêm một lý do cho trục hóa ở (1).

### Vì sao tổ hợp "nổ" — một phép đếm cụ thể

Nguyên tắc (1) nghe trừu tượng cho tới khi bạn đếm. Giả sử desk giao dịch $I = 40$ loại instrument (swap, swaption, cap/floor, CMS, digital, autocall, barrier, variance swap...), có $M = 12$ model khả dụng (Black, Bachelier, Hull-White 1F, G2++, LMM, SABR, Heston, local vol, LSV, rough Bergomi, Jarrow-Yildirim, CDO copula...), và $E = 6$ engine (analytic, tree, PDE 1D, PDE 2D, Monte Carlo, PIDE jump). Nếu thiết kế theo lối "mỗi kết hợp là một hàm định giá riêng", bạn phải viết và bảo trì tối đa

$$
I \times M \times E = 40 \times 12 \times 6 = 2\,880
$$

hàm định giá — mỗi hàm là một điểm có thể sinh bug, mỗi hàm cần test riêng. Không đội nào bảo trì nổi 2 880 đường code song song; sản phẩm thứ 41 nghĩa là thêm $12 \times 6 = 72$ hàm mới.

Trục hóa biến phép nhân thành phép cộng. Bạn viết $I$ mô tả instrument (mỗi cái chỉ khai báo payoff), $M$ model (mỗi cái chỉ khai báo dynamics), $E$ engine (mỗi cái chỉ biết cách "chạy một model qua một payoff"). Tổng công sức tuyến tính:

$$
I + M + E = 40 + 12 + 6 = 58
$$

khối độc lập, cộng một *bảng cấu hình* nói rõ cặp nào hợp lệ (không phải cặp nào cũng có nghĩa — Black không định giá được autocall đa chiều). Tỉ số $2880 / 58 \approx 50$ lần chính là lý do kiến trúc này không phải "cho đẹp" mà là *điều kiện sống còn* của một library đủ lớn. Sản phẩm thứ 41 giờ chỉ tốn một khối instrument mới cộng vài dòng cấu hình.

Phác thảo trục hóa bằng code (kiểu TypeScript, đúng tinh thần registry + composition của repo này):

```ts
interface Instrument { legs: Leg[]; schedule: Schedule }
interface Model { params: CalibratedParams; evolve(state: State, dt: number): State }
interface Engine { price(inst: Instrument, model: Model, ctx: PricingContext): PVResult }

registry.register({ instrument: 'swaption', model: 'hull-white', engine: 'pde' })
registry.register({ instrument: 'swaption', model: 'black', engine: 'analytic' })
registry.register({ instrument: 'autocallable', model: 'lsv', engine: 'mc' })

const ctx = marketData.snapshot('2026-07-03T07:00Z')
const pv = registry.resolve(deal).price(deal, ctx)
```

Cùng một swaption chạy `analytic` (quote nhanh) hay `pde` (Bermudan) chỉ là chuyện cấu hình một dòng registry; thêm sản phẩm mới = thêm entry, không sửa engine. `PricingContext` bất biến có timestamp là hiện thân của nguyên tắc (2) — mọi PV đều trả lời được "tính bằng data nào".

### PricingContext bất biến và có version — vì sao immutability không phải là thói học thuật

Nguyên tắc (2) đáng được đào sâu vì nó là ranh giới giữa một library có thể audit và một library không thể. Hãy tưởng tượng ngày 3/7/2026 lúc 07:00 UTC bạn snapshot toàn bộ thị trường vào một `PricingContext` bất biến, gán cho nó một ID — ví dụ `EOD-2026-07-03-v1`. Mọi PV, mọi Greek, mọi số VaR, mọi CVA của ngày hôm đó *trỏ* về snapshot này. Sang năm, khi regulator hoặc counterparty tranh chấp "PV deal X ngày 3/7 là bao nhiêu?", bạn nạp lại đúng snapshot `EOD-2026-07-03-v1`, chạy lại đúng version code của ngày đó, và ra lại *chính xác* con số cũ tới từng cent. Đó là reproducibility, và nó là yêu cầu pháp lý, không phải xa xỉ phẩm.

Vì sao snapshot phải *bất biến*? Vì nếu context có thể bị sửa tại chỗ (mutable), thì hai deal price cùng lúc có thể "nhìn thấy" thị trường ở hai trạng thái khác nhau nếu một luồng khác lỡ cập nhật giữa chừng — một dạng race condition khiến portfolio không cộng khớp. Bất biến nghĩa là: một khi tạo, không ai sửa được; muốn thị trường mới thì tạo snapshot mới với ID mới. Đây là lý do các library production dùng structural sharing (chia sẻ cấu trúc con không đổi giữa các version để tiết kiệm bộ nhớ) thay vì copy toàn bộ.

Một ví dụ số về "cùng deal, hai snapshot khác nhau". Lấy đúng call vanilla chuẩn của cả sách: $S_0 = 100, K = 100, r = 5\%, \sigma = 20\%, T = 1$, giá $C = 10.45$, delta $\Delta = 0.637$. Snapshot `v1` lúc 07:00 chốt $S_0 = 100$. Snapshot `v2` lúc 07:15 sau một tin, chốt $S_0 = 101$. Cùng đúng một dòng code định giá, cùng đúng một deal, nhưng xấp xỉ bậc nhất qua delta cho

$$
C_{v1} = 10.45, \qquad C_{v2} \approx 10.45 + \Delta \times 1 = 10.45 + 0.637 = 11.09.
$$

Điểm mấu chốt: chênh lệch $0.637$ này *hoàn toàn quy được* về việc snapshot nào được dùng — không phải "code đổi", không phải "may rủi". Khi P&L explain hỏi "tại sao PV nhích lên?", câu trả lời là "spot +1, delta 0.637, ra +0.637" — sạch sẽ, có lineage, tái tạo được. Không có snapshot bất biến có version, câu hỏi đó không có câu trả lời chắc chắn.

### P&L explain và lineage — phân rã đến từng nguồn

Nguyên tắc (3) — lineage — là nơi kiến trúc trả cổ tức lớn nhất hàng ngày. P&L explain (còn gọi P&L attribution) là bài toán: PV portfolio hôm qua là $V_0$, hôm nay là $V_1$; chênh lệch $\Delta V = V_1 - V_0$ phải được *giải thích* bằng tổng các thành phần đã biết, và phần dư ("unexplained") phải nhỏ. Công thức khai triển Taylor bậc hai theo các yếu tố rủi ro là bộ khung:

$$
\Delta V \approx \underbrace{\Theta\,\Delta t}_{\text{time}} + \underbrace{\Delta\,\Delta S + \tfrac{1}{2}\Gamma(\Delta S)^2}_{\text{spot}} + \underbrace{\mathcal{V}\,\Delta\sigma}_{\text{vol}} + \underbrace{\rho\,\Delta r}_{\text{rates}} + \varepsilon_{\text{unexplained}}.
$$

Hãy tính bằng số với call vanilla chuẩn. Greeks (số của sách): $\Delta = 0.637$, $\Gamma = 0.0188$, vega $\mathcal{V} = 0.375$/vol-point, $\Theta \approx -0.018$/ngày, $\rho = 0.532$/1%. Giả sử qua một đêm: spot $+1.5$ (từ 100 lên 101.5), implied vol $+0.4$ điểm (20% → 20.4%), lãi suất $+0.10\%$, và một ngày trôi ($\Delta t = 1$ ngày).

- Time: $\Theta \times 1 = -0.018$.
- Spot (delta): $0.637 \times 1.5 = +0.9555$.
- Spot (gamma): $\tfrac{1}{2} \times 0.0188 \times 1.5^2 = \tfrac{1}{2} \times 0.0188 \times 2.25 = +0.0212$.
- Vol (vega): $0.375 \times 0.4 = +0.150$.
- Rates (rho): $0.532 \times 0.10 = +0.0532$.

Tổng giải thích:

$$
-0.018 + 0.9555 + 0.0212 + 0.150 + 0.0532 = 1.162.
$$

Nếu PV thực đo được nhích $+1.17$, thì unexplained $\varepsilon = 1.17 - 1.162 = 0.008$ — dưới 1% của tổng move, nghĩa là các Greek "khớp" và không có gì lạ. Nhưng nếu PV thực nhích $+1.60$ trong khi giải thích chỉ ra $1.162$, thì unexplained $= 0.44$ là *chuông báo động*: hoặc một Greek tính sai, hoặc có một yếu tố rủi ro chưa được đưa vào (ví dụ vol-of-vol, cross-gamma spot–vol), hoặc data feed lỗi, hoặc — tệ nhất — một deal bị nhập sai. Chính vì thế FRTB (Chương 15) biến P&L attribution thành *bài kiểm tra bắt buộc* để một desk được dùng internal model: hai chỉ số Spearman correlation và Kolmogorov-Smirnov giữa hypothetical P&L (từ risk model) và actual P&L (từ front office) phải đạt ngưỡng, nếu không desk bị đá về standardized approach tốn vốn hơn. Lineage — biết mỗi con số đến từ quote nào, curve nào, tham số nào — là điều kiện *cần* để phân rã này chạy được; không có nó, "unexplained" chỉ là một hố đen.

Hệ sinh thái mã nguồn mở đáng biết: **QuantLib** (C++, 20+ năm, chuẩn tham chiếu de facto — đọc source của nó là một nền giáo dục), QuantLib-Python, **ORE** (Open Source Risk Engine — XVA/risk portfolio-level trên QuantLib, rất gần cấu trúc Chương 14), ISDA CDS standard model, và gần đây các thư viện differentiable pricing trên JAX/PyTorch.

## 19.2 Một ngày của desk quant (để bạn hình dung nghề)

Sáng: check batch qua đêm (risk, P&L explain có "unexplained" lớn không), calibration sáng có converge không, curve có điểm gãy bất thường không. Trong ngày: trader hỏi giá structure mới → dựng payoff từ các khối có sẵn, chọn model, chạy giá + Greeks, sanity-check bằng model thứ hai; sales cần pre-trade XVA; debug tại sao PV một deal nhảy; review spec model của đồng nghiệp; viết doc cho model validation. Nghề này 30% toán, 50% engineering, 20% giao tiếp — hầu hết người ngoài đánh giá sai tỉ lệ này.

Để cụ thể hóa cái "check batch qua đêm", hãy hình dung con số. Một desk rates lớn có thể ôm $N \approx 50\,000$ deal. Batch qua đêm chạy full revaluation cộng risk cộng XVA. Nếu mỗi deal trung bình cần 2 giây CPU (nhiều là swaption Bermudan qua PDE, autocall qua Monte Carlo), thì tuần tự mất $50\,000 \times 2 = 100\,000$ giây $\approx 27.8$ giờ — quá cửa sổ đêm (thường 8–10 tiếng từ market close tới market open). Đây là lý do batch phải song song hóa: chạy trên $\sim 512$ core thì thời gian rơi về $100\,000 / 512 \approx 195$ giây lý thuyết, thực tế cỡ vài chục phút sau overhead. Nó cũng là lý do XVA phải dùng proxy model (`src/proxy`): định giá đầy đủ một swap 10Y trong 10 000 kịch bản Monte Carlo tại 100 mốc thời gian là một tỉ lần định giá con — bất khả thi nếu mỗi lần gọi full smile model; proxy (Chebyshev, differential ML, MLP) thay bằng hàm rẻ đã fit sẵn. Cái "batch converge không" buổi sáng vì thế không phải câu hỏi lười — nó là câu hỏi liệu 27 giờ công việc có nén được vào 8 giờ không.

Buổi trưa khi trader hỏi giá một structure mới, "sanity-check bằng model thứ hai" cũng là một thao tác có kỷ luật số, không phải một dòng trong danh sách việc. Cụ thể hóa: trader hỏi giá một swaption ATM 1Y-into-5Y, notional 100. Bạn chạy nó qua Hull-White đã calibrate, ra premium $= 2.153\%$ notional. Rồi bạn chạy lại đúng deal đó qua công thức Black với implied vol lấy thẳng từ market, ra premium thứ hai $= 2.150\%$. Chênh lệch $|2.153 - 2.150| = 0.003\%$ notional (tức 0.3bp, hay \$3\,000 trên notional \$100M) — nhỏ hơn nhiều bid-offer thường vài bp của swaption thanh khoản, nên hai implementation "đồng ý" và bạn báo giá được. Nhưng nếu Hull-White ra $2.153\%$ còn Black ra $2.09\%$, chênh $0.063\%$ notional (6.3bp) là *quá lớn* so với bid-offer: một trong hai *sai* — có thể Hull-White calibrate lệch node vol, có thể Black nhận nhầm annuity — và bạn không được báo giá cho tới khi hiểu vì sao. Đây là "two independent implementations" thu nhỏ về một deal, cùng triết lý benchmark độc lập của model validation mà ta sẽ gặp ở mục 19.5, chỉ khác là làm trong thời gian thực với trader đang chờ trên đường dây.

## 19.3 Tuyển dụng và phỏng vấn Q-quant

Phỏng vấn điển hình (bank tier 1): vòng screening toán/xác suất nhanh + coding; vòng kỹ thuật: stochastic calculus (suy GBM, Itô cho $f(S)$ nào đó), Black-Scholes và Greeks (suy công thức, vẽ profile gamma/vega, câu hỏi hedging tình huống), brainteasers xác suất (kỳ vọng có điều kiện, martingale stopping), C++ (move semantics, virtual dispatch, memory) hoặc Python tùy vai trò; vòng desk: câu hỏi "trading sense" (sticky strike vs sticky delta, tại sao skew tồn tại, P&L nếu vol realized < implied). Nguồn luyện chuẩn: *Heard on the Street* (Crack), *Quant Job Interview Questions* (Joshi), *A Practical Guide to Quantitative Finance Interviews* (Zhou) — xem Chương 20.

Năm câu hỏi mẫu đúng "chất" phỏng vấn (kèm hướng trả lời — tự làm đầy đủ trước khi đọc đáp):

1. *"Vẽ profile gamma của call theo spot. Vì sao gamma ATM nổ khi gần expiry?"* — Gamma là mật độ chuẩn quanh strike, bề rộng $\sigma\sqrt{T}$: $T \to 0$ thì "chuông" co lại và cao vọt; ATM sát expiry là nơi delta lật từ 0 sang 1 trong một cú move nhỏ.
2. *"Bạn short straddle và thị trường gap +5% qua đêm. P&L phân rã thế nào?"* — Lỗ gamma $\approx \frac{1}{2}\Gamma S^2 (5\%)^2$ (không hedge được trong gap), cộng lỗ vega nếu implied nổ theo, trừ theta một đêm. Điểm ăn tiền: nói được rằng delta-hedge **không cứu được gap** — hedge liên tục là giả định, không phải quyền.
3. *"$W_t$ là Brownian. $W_t^3$ có phải martingale?"* — Không: Itô cho $d(W^3) = 3W^2 dW + 3W\,dt$, drift $3W\,dt \ne 0$. Sửa thành martingale: $W_t^3 - 3tW_t$.
4. *"Digital call gần expiry, spot dính sát strike — rủi ro gì và hedge sao?"* — Delta/gamma nổ vô hạn quanh strike; thực tế hedge bằng **call spread** hẹp (over-hedge một phía) và chấp nhận pin risk; đây là lý do RRAO tồn tại trong FRTB.
5. *"Vì sao chiết khấu bằng OIS chứ không phải 'lãi suất phi rủi ro lý thuyết'?"* — Vì deal có CSA: collateral nhận lãi OIS, phòng ngừa được tài trợ ở OIS → OIS **là** chi phí tiền thật của việc giữ vị thế có collateral (câu trả lời không nói về "risk-free" trừu tượng mà nói về funding thật là câu trả lời của người có nghề).

Để câu 2 không dừng ở lời nói, hãy đóng đinh nó bằng số với call vanilla chuẩn ($S_0 = 100$, $\Gamma = 0.0188$ cho *một* call). Một điểm phải nói rõ để junior không hiểu lầm: short straddle là short đồng thời một call và một put cùng strike, cùng maturity — mà **gamma của call và put cùng strike/maturity thì bằng nhau *chính xác*** (cả hai đều là $\phi(d_1)/(S\sigma\sqrt{T})$, không phụ thuộc call hay put), nên gamma straddle là *đúng gấp đôi* một chân, không phải xấp xỉ. Gap $+5\%$ nghĩa $\Delta S = 5$. Lỗ gamma của người short trên mỗi chân:

$$
\text{P\&L}_\Gamma = -\tfrac{1}{2}\,\Gamma\,(\Delta S)^2 = -\tfrac{1}{2} \times 0.0188 \times 5^2 = -\tfrac{1}{2} \times 0.0188 \times 25 = -0.235,
$$

và vì hai chân có gamma bằng nhau, cả straddle mất $-0.47$. Nếu implied vol nổ theo $+3$ điểm, người short (âm vega) mất thêm $\mathcal{V} \times 3 = 0.375 \times 3 = 1.125$ mỗi chân. Theta một đêm *dương* cho người short chỉ bù được $+0.018$ — mẩu vụn so với hai khoản lỗ trên. Con số biến câu trả lời "bằng lời" thành "bằng máu": theta thu về nhỏ giọt, gamma và vega mất theo lô — đó là bản chất bất đối xứng của short vol, và là lý do các quỹ tail-risk (Universa) tồn tại.

Câu 5 cũng nên có một con số neo. Lấy swap 2Y của sách trên curve phẳng 4%: swap rate $= 4.00\%$; nếu ta đã ký trả fixed 3% còn 2 năm thì MTM $= +1.89$ (số của sách). Con số $+1.89$ đó *phụ thuộc* vào việc chiết khấu bằng đường nào. Nếu deal có CSA (collateral) và ta chiết khấu bằng OIS, ta được đúng $+1.89$. Nếu vô ý chiết khấu bằng một đường Libor cũ cao hơn OIS chừng 15bp, discount factor nhỏ hơn, MTM co lại vài phần trăm — và toàn bộ CVA/FVA lệch theo. Người phỏng vấn muốn nghe bạn biết rằng "risk-free rate" không phải một hằng số triết học mà là *funding thật của tài sản thế chấp*, và chọn sai đường chiết khấu là sai giá thật bằng tiền thật.

Bằng cấp: MFE/MSc Quant Finance (Baruch, CMU, Princeton, Imperial, ETH — Baruch nổi tiếng placement tốt nhất), hoặc PhD toán/lý/CS (vẫn là đường vào chuẩn cho research-heavy roles), hoặc — ngày càng nhiều — kỹ sư giỏi tự học chứng minh được bằng project thật (một pricing library tự viết có XVA và FRTB như `quantc` chính là loại bằng chứng đó).

## 19.4 Q-quant ngoài ngân hàng

Nghề Q-quant không chỉ sống trong sell-side bank. Bản đồ rộng hơn nhiều, và mỗi ô trên bản đồ có văn hóa, lương, và loại toán riêng.

- **Buy-side vol**: vol arb funds, tail-risk funds (Universa), market makers options (**Optiver, IMC, SIG, Citadel Securities** — SIG nổi tiếng dạy poker cho trader) — pricing là Q, nhưng quyết định vị thế là P; trả lương cao hơn bank đáng kể. Đây chính là điểm giao P/Q: định giá option dùng công cụ Q (risk-neutral, Greeks, smile) nhưng quyết định *có nên* giữ vị thế lại là câu hỏi P (kỳ vọng thực, variance risk premium). Xem cuốn P-world để hiểu mặt kia của giao dịch vol.
- **CCP/Clearing houses** (LCH, CME): margin models, default management. Một CCP đứng giữa mọi giao dịch clear, nên nó phải tính initial margin cho hàng triệu vị thế và quản lý default waterfall — model risk ở đây là rủi ro *hệ thống*, không phải một desk.
- **Vendors**: Bloomberg (DLIB/MARS), Murex, Calypso, Numerix, FIS — bán pricing/risk cho bank nhỏ không tự xây; nhiều quant sống ở đây.
- **Regulators/central banks**: cần người hiểu model để giám sát model — chính bộ máy validation ở mục 19.5 tạo ra cả một nghề bên phía giám sát.
- **Insurance/pension**: variable annuities là exotic khổng lồ (guarantee dài 30 năm); Solvency II là "Basel của bảo hiểm".

Để thấy vì sao insurance là "exotic khổng lồ", hãy tính thô một guarantee kiểu GMWB (guaranteed minimum withdrawal benefit) đơn giản hóa: hãng bảo hiểm hứa trả người mua tối thiểu bằng vốn gốc $K = 100$ sau $T = 30$ năm bất kể thị trường, tức bán kèm một put châu Âu strike 100 maturity 30 năm. Với $r = 5\%$, $\sigma = 20\%$, $S_0 = 100$, put 30 năm có

$$
d_1 = \frac{\ln(S_0/K) + (r + \sigma^2/2)T}{\sigma\sqrt{T}} = \frac{0 + (0.05 + 0.02)\times 30}{0.20\sqrt{30}} = \frac{2.1}{1.0954} \approx 1.917,
$$

nên $N(-d_1) \approx N(-1.917) \approx 0.0276$; và $d_2 = d_1 - \sigma\sqrt{T} = 1.917 - 1.095 = 0.822$, $N(-d_2) \approx 0.2057$. Giá put (dùng $e^{-rT} = e^{-1.5} = 0.2231$, các số làm tròn ở đây; giá trị chính xác $\approx 1.83$):

$$
P = K e^{-rT} N(-d_2) - S_0 N(-d_1) = 100 \times 0.2231 \times 0.2057 - 100 \times 0.0276 \approx 4.59 - 2.76 \approx 1.83.
$$

Con số $\approx 1.83$ trên notional 100 nghe nhỏ, nhưng nhân với hàng chục tỉ đô notional annuity, cộng với việc guarantee thực tế phức tạp hơn nhiều (ratchet, withdrawal tùy chọn, mortality) và vol 30 năm thì cực nhạy — sai lệch nhỏ trong $\sigma$ dài hạn khuếch đại thành hàng trăm triệu. Đó là lý do variable annuity từng làm sập bảng cân đối vài hãng bảo hiểm trong 2008, và là lý do Solvency II ép họ tính vốn model-based nghiêm ngặt.

## 19.5 Model validation — tuyến phòng thủ thứ hai

Mọi thứ ở trên giả định một điều: model *đúng*. Nhưng model chỉ là bản đồ, không phải lãnh thổ. "All models are wrong, but some are useful" (George Box) không phải câu nói đùa — nó là tiên đề vận hành của cả một bộ máy quy định sinh ra để trả lời câu hỏi: model nào sai *đủ ít* để được dùng, và ai kiểm chứng điều đó? Khủng hoảng 2008 và một chuỗi thảm họa sau đó cho thấy để chính người xây model tự chấm điểm mình là công thức của tai họa. Từ đó ra đời model validation như một *chức năng độc lập* — không phải một khâu kiểm tra qua loa mà là một tuyến phòng thủ có luật, có ngân sách, có quyền phủ quyết.

### SR 11-7 — hiến pháp của model risk management

Văn bản nền tảng là **SR 11-7**, hướng dẫn liên ngành do Federal Reserve và OCC ban hành tháng 4/2011 ("Supervisory Guidance on Model Risk Management"). Nó định nghĩa *model* rộng đến bất ngờ: bất kỳ phương pháp định lượng nào biến input thành output định lượng phục vụ ra quyết định — pricing model, VaR model, credit scoring, cả một spreadsheet Excel tính giá cũng là model theo định nghĩa này. Và nó định nghĩa *model risk* là khả năng một model tạo ra output sai hoặc bị dùng sai, dẫn tới quyết định tồi và tổn thất — chia làm hai nguồn: (a) model có lỗi nội tại (giả định sai, toán sai, code sai), (b) model bị dùng ngoài phạm vi đúng của nó.

SR 11-7 dựng ba trụ cột. Trụ thứ nhất là **development, implementation, and use** có kỷ luật — model phải có mục đích rõ, giả định được ghi lại, test khi xây, và người dùng hiểu giới hạn. Trụ thứ hai — trái tim của văn bản — là **effective challenge**: model phải bị một bên *độc lập*, *có năng lực*, và *có thẩm quyền* thách thức. Ba tính từ này không thừa: độc lập nghĩa người validate không phải người xây; có năng lực nghĩa họ đủ giỏi để thực sự soi được toán, không chỉ tick box; có thẩm quyền nghĩa họ được đứng ngang hàng và có quyền chặn model, không bị áp lực thương mại dập tắt. Trụ thứ ba là **governance, policies, and controls** — có model inventory, có phân vai trò rõ, có báo cáo lên hội đồng, có kiểm toán.

### Ba tuyến phòng thủ (three lines of defense)

Kiến trúc tổ chức thực thi SR 11-7 được gọi là *three lines of defense* — một mô hình quản trị rủi ro giờ đã thành chuẩn ngành:

| Tuyến | Ai | Vai trò | Quan hệ với model |
|-------|-----|---------|-------------------|
| Tuyến 1 | Front office quants, model developers, desk | Sở hữu và vận hành rủi ro; xây model, dùng model kiếm tiền | *Own* the model |
| Tuyến 2 | Model Risk Management / Independent Validation | Giám sát độc lập; thách thức, phê duyệt, giới hạn model | *Challenge* the model |
| Tuyến 3 | Internal Audit | Kiểm tra rằng tuyến 1 và tuyến 2 làm đúng việc của mình | *Assure* the process |

Điểm tinh tế mà người mới hay hiểu sai: tuyến 2 không "xây model tốt hơn" — họ *thách thức* model của tuyến 1. Hai vai trò cố ý mâu thuẫn để tạo tension lành mạnh. Nếu người xây và người duyệt là một, effective challenge sụp đổ, và ta quay lại đúng thế giới trước 2008. Tuyến 3 (audit) không soi toán từng model mà soi *quy trình*: model inventory có đầy đủ không, validation có đúng lịch không, finding có được đóng không.

### Model inventory và tiering

Không thể validate mọi model với cùng cường độ — một bank lớn có thể có $\sim 3\,000$ model đăng ký. **Model inventory** là sổ đăng ký trung tâm: mỗi model có ID, owner, mục đích, ngày validate cuối, các giới hạn đã đặt, và một *tier* rủi ro. Tiering phân bổ nguồn lực theo mức độ nghiêm trọng.

Một sơ đồ tiering cụ thể: gán mỗi model một điểm materiality theo giá trị định giá/vốn nó chi phối và độ phức tạp. Ví dụ bank chấm ba model —

- Model A (pricing autocall exotic, chi phối $2$ tỉ notional, phức tạp cao): tier 1, validate hàng năm + monitoring hàng quý.
- Model B (VaR desk rates, chi phối vốn thị trường): tier 1, validate hàng năm.
- Model C (một spreadsheet tính phí nhỏ, $10$ triệu): tier 3, validate 3 năm/lần, kiểm tra nhẹ.

Nếu ngân sách validation là $6\,000$ giờ-người/năm và tier 1 tốn $\sim 300$ giờ/model, tier 2 $\sim 80$ giờ, tier 3 $\sim 20$ giờ, thì với 30 model tier 1, 100 tier 2, 200 tier 3, tổng cầu là $30 \times 300 + 100 \times 80 + 200 \times 20 = 9\,000 + 8\,000 + 4\,000 = 21\,000$ giờ — gấp 3.5 lần ngân sách. Chính phép tính này ép bank phải tiering nghiêm và ưu tiên brutal: model tier 3 low-risk có thể chỉ được rà lướt, còn nguồn lực dồn cho tier 1 nơi một lỗi thành nghìn tỉ. Tiering không phải quan liêu — nó là bài toán phân bổ nguồn lực khan hiếm dưới ràng buộc.

### Benchmark độc lập — "two independent implementations"

Vũ khí sắc nhất của validation là **benchmark model độc lập**: validator tự xây (hoặc dùng vendor/QuantLib) một implementation *riêng biệt* của cùng bài toán, rồi so output. Sức mạnh nằm ở chỗ độc lập: nếu hai code viết bởi hai người, bằng hai ngôn ngữ, theo hai cách suy nghĩ, mà ra *cùng* con số, xác suất cả hai cùng sai theo *cùng một kiểu* là rất thấp. Ngược lại, nếu validator chỉ đọc lại code của developer, họ dễ mắc đúng blind spot của developer.

Một ví dụ số cụ thể. Developer nộp một swaption model ra premium $= 2.153$ (đơn vị: % notional). Validator xây benchmark độc lập bằng công thức Black với đúng market vol, ra $= 2.148$. Chênh lệch tuyệt đối $|2.153 - 2.148| = 0.005$, tương đối $0.005 / 2.15 \approx 0.23\%$. Validator đặt ngưỡng chấp nhận (tolerance) $0.5\%$ cho sản phẩm này; $0.23\% < 0.5\%$ nên *pass*. Nhưng giả sử một tháng sau, sau một code release, developer model nhảy lên $2.28$ trong khi benchmark vẫn $2.148$: chênh lệch tương đối vọt lên $6.1\% > 0.5\%$ — validation *fail*, model bị treo và điều tra.

Ngưỡng $0.5\%$ ấy đến từ đâu, chứ không phải một con số rơi từ trời? Trong thực hành, tolerance được neo vào *tính vật chất kinh tế* của sản phẩm — thường là một phần của bid-offer spread hoặc mức materiality mà sai số dưới đó không đổi được quyết định giao dịch nào. Một swaption thanh khoản có bid-offer cỡ vài bp premium; nếu benchmark và model lệch nhau còn nhỏ hơn spread đó, chênh lệch "chìm" trong chi phí giao dịch và không ai kiếm/mất tiền được vì nó, nên đặt tolerance quanh nửa phần trăm là hợp lý. Sản phẩm càng kém thanh khoản (bid-offer rộng) thì tolerance nới ra; sản phẩm thanh khoản cao, giao dịch dày thì siết lại. Nói cách khác, $0.5\%$ không tùy tiện: nó là hình chiếu của spread thị trường lên trục sai số model — đúng tinh thần "mọi con số phải có nguồn gốc" của chương này. Không có benchmark độc lập *và* một ngưỡng có căn cứ kinh tế, "model đúng" chỉ là niềm tin.

Ngoài benchmark, validation còn kiểm: (i) *conceptual soundness* — giả định model có hợp lý cho sản phẩm không (dùng Black cho lãi suất âm là sai vì Black giả định rate dương — đây là lý do ngành chuyển sang Bachelier/shifted-Black sau 2015); (ii) *outcomes analysis / backtesting* — với VaR, đếm số lần loss thực vượt VaR; (iii) *sensitivity & stress* — Greeks có ổn định không, model có nổ ở tham số biên không.

### Backtest VaR — một phép đếm có luật

VaR validation dựa trên *coverage test*. Nếu VaR 99% một ngày đúng, thì trung bình chỉ $1\%$ số ngày loss thực vượt VaR — gọi là exception. Trên $250$ ngày giao dịch/năm, kỳ vọng số exception là $250 \times 0.01 = 2.5$. Basel dựng "traffic light": vùng xanh $0$–$4$ exception (model ổn), vùng vàng $5$–$9$ (cảnh báo, tăng multiplier vốn), vùng đỏ $\ge 10$ (model bị bác, phạt vốn nặng). Xác suất rơi vào từng vùng tính được bằng phân phối nhị thức $\text{Binomial}(250, 0.01)$: xác suất có đúng $x$ exception là $\binom{250}{x} 0.01^x 0.99^{250-x}$. Cắm số vào để thấy vì sao ranh giới rơi đúng ở 5 và 10:

$$
P(X \ge 5) \approx 10.8\%, \qquad P(X = 10) \approx 0.020\%, \qquad P(X \ge 10) \approx 0.025\%.
$$

Đọc các con số này: nếu model đúng thì có $\ge 5$ exception vẫn xảy ra hơn một phần mười thời gian — không hiếm đến mức bác model, nên vùng vàng chỉ *cảnh báo* và tăng multiplier chứ chưa loại. Nhưng $\ge 10$ exception chỉ xảy ra khoảng $0.025\%$ — một phần bốn nghìn — nếu model thực sự đúng; thấy nó xảy ra là bằng chứng thống kê gần như không thể chối rằng model *thiếu* rủi ro (đánh giá thấp đuôi), nên vùng đỏ bác model và phạt vốn. Chính phép đếm này biến "model tốt không" thành một câu hỏi có ngưỡng khách quan, không cãi được bằng lời: ranh giới xanh/vàng/đỏ không phải ý thích của regulator mà là các mức xác suất đuôi của một phép thử nhị thức.

### Reserves cho model risk

Khi validation phát hiện model có sai số hệ thống chưa sửa được ngay, bank không nhất thiết dừng dùng — nhưng phải *trích lập reserve* (model reserve, một dạng valuation adjustment) trừ thẳng vào P&L để phản ánh mức bất định. Đây là hiện thân tài chính của sự khiêm tốn: nếu ta không chắc giá đúng tới $\pm 0.3\%$, ta ghi nhận lãi thấp hơn đúng bằng vùng bất định đó.

Con số bất định $\pm$ vài phần nghìn ấy validator ước lượng *thế nào*, chứ không phỏng đoán? Cách phổ biến nhất là đọc thẳng từ chính khoảng chênh giữa các benchmark ở mục trên. Nối vào ví dụ swaption: model và benchmark độc lập lệch $0.23\%$ khi mọi thứ khỏe mạnh, nhưng qua các bộ tham số calibrate khác nhau (đổi node vol, đổi cách nội suy smile), giá trôi trong một dải — giả sử validator chạy năm cách calibrate hợp lý và thấy giá trải từ $2.148$ tới $2.28$, tức một dải rộng $6.1\%$ so với mức giữa. Model uncertainty không lấy trọn $6.1\%$ (đó là biên xấu nhất), mà lấy một phần thận trọng của dải đó — ví dụ validator chốt $0.4\%$ làm mức bất định "trung tâm" sau khi loại các calibrate cực đoan. Nói cách khác, hai đoạn benchmark và reserve không rời nhau: dải giá qua các model/calibrate benchmark *chính là* nguyên liệu để lượng hóa con số uncertainty đưa vào reserve.

Một ví dụ số. Desk exotic ôm sổ giá trị $500$ triệu. Validation kết luận model có model uncertainty ước lượng $0.4\%$ giá trị sổ (chốt từ dải benchmark như trên) do một xấp xỉ smile chưa hoàn hảo. Reserve trích:

$$
\text{Reserve} = 0.4\% \times 500\,\text{triệu} = 2\,\text{triệu}.
$$

Hai triệu này bị trừ khỏi P&L báo cáo của desk — trader ghét nó, nhưng nó ngăn desk ghi nhận lợi nhuận "ảo" đến từ một model quá lạc quan. Khi model được sửa và validation xác nhận uncertainty co lại còn $0.1\%$, reserve giảm còn $0.5$ triệu, và $1.5$ triệu được "release" ngược vào P&L. Cơ chế reserve biến độ bất định của model thành một dòng tiền cụ thể, và nó khép model risk vào đúng nơi nó thuộc về: bảng cân đối, không phải một ghi chú cước.

### Bài học London Whale — khi validation vắng mặt

Không ví dụ nào dạy về model validation sắc bằng **London Whale** (JPMorgan CIO, 2012, lỗ ~$6.2$ tỉ USD). Trong nhiều tầng nguyên nhân, có một chi tiết đã thành huyền thoại cảnh giác trong ngành: một **VaR model mới của CIO chạy trên spreadsheet Excel thủ công có lỗi công thức**. Theo báo cáo chính thức của JPMorgan Management Task Force, ở một bước tính, đại lượng phải chia cho *trung bình* của hai giá trị (spread cũ và spread mới) thì lại bị chia cho *tổng* của hai giá trị đó. Vì tổng gấp đúng đôi trung bình, mẫu số bị nhân đôi, và kết quả bị giảm đúng một nửa.

Cụ thể hóa bằng số để thấy cơ chế "tổng thay vì trung bình" giảm một nửa như thế nào. Giả sử ở tử số là một đại lượng cố định — gọi là $\text{numer} = 1$ (chênh lệch spread cần chuẩn hóa) — và hai giá trị dưới mẫu là $x_1 = 0.10$, $x_2 = 0.14$. Công thức đúng chia cho *trung bình* của hai giá trị:

$$
\text{đúng} = \frac{\text{numer}}{(x_1 + x_2)/2} = \frac{1}{(0.10 + 0.14)/2} = \frac{1}{0.12} \approx 8.33.
$$

Công thức lỗi trong spreadsheet chia thẳng cho *tổng* $x_1 + x_2$, tức mẫu số gấp đôi:

$$
\text{lỗi} = \frac{\text{numer}}{x_1 + x_2} = \frac{1}{0.10 + 0.14} = \frac{1}{0.24} \approx 4.17.
$$

Tỉ số $\text{lỗi}/\text{đúng} = 0.5$ *chính xác* — không xấp xỉ — vì tổng luôn gấp đôi trung bình, nên chia cho tổng thay vì cho trung bình luôn cắt kết quả còn một nửa. Đại lượng bị cắt một nửa ở đây là một input volatility đi vào VaR; vì VaR tỉ lệ tuyến tính với vol đầu vào, VaR báo cáo cũng chỉ còn khoảng một nửa: nếu VaR đúng đáng lẽ là $\$100$ triệu thì spreadsheet báo $\sim\$50$ triệu. Vị thế vì thế *trông* nằm trong hạn mức trong khi thực chất đã vượt xa — desk tiếp tục nhồi thêm rủi ro credit-index synthetic khổng lồ với niềm tin sai lầm rằng mình còn dư room. Khi vị thế phình đủ lớn để thị trường "ngửi" thấy và quay lại đánh, khoản lỗ nổ ra công khai.

Điều khiến câu chuyện này thành *bài học validation* chứ không chỉ là chuyện xui rủi Excel: cái model VaR mới đó **được đưa vào dùng mà không qua validation độc lập đầy đủ**, và một lỗi công thức số học cấp tiểu học — chia cho tổng thay vì trung bình — sống sót suốt vì không có ai độc lập, có năng lực, có thẩm quyền ngồi tính lại. Đúng ba tính từ của effective challenge trong SR 11-7 đã vắng mặt. Nó chứng minh vì sao một spreadsheet cũng là "model" theo định nghĩa của SR 11-7 — và vì sao model tier phải tính cả những công cụ trông tầm thường: một chia-sai trong Excel không được ai kiểm đã thổi bay $6$ tỉ đô. Mọi nguyên tắc ở các mục trên — benchmark độc lập, ngưỡng chấp nhận, three lines of defense, model inventory — tồn tại chính xác để một London Whale không tái diễn.

Khép lại: kiến trúc library đúng (trục hóa, snapshot bất biến, lineage) làm cho model *chạy được và audit được*; model validation làm cho model *đáng tin*. Hai nửa này không tách rời — một P&L explain sạch (mục 19.1) chính là một dạng validation thời gian thực, và một benchmark độc lập (mục 19.5) chính là "model thứ hai" mà desk quant chạy mỗi khi báo giá. Người quant giỏi sống ở giao điểm của cả hai: đủ toán để suy công thức, đủ engineering để dựng hệ thống không nói dối, và đủ khiêm tốn để luôn hỏi "model này sai ở đâu, và ai đang kiểm nó?".

# Chương 20: Lộ trình học và tài nguyên

Mười chín chương trước đã đưa ta đi từ câu hỏi tưởng như triết học — "vì sao có hai measure $\mathbb{P}$ và $\mathbb{Q}$" — cho tới những con số cụ thể của một desk quant thật: một call ATM giá $10.45$, một swap 10Y có CVA $\approx 0.172\,\text{M}$, một portfolio phải nộp capital theo FRTB. Chương cuối này không thêm khái niệm mới nào — nó là tấm bản đồ. Bạn đã đi hết khu rừng; giờ ta leo lên đỉnh núi nhìn lại con đường vừa qua, đánh dấu những cột mốc, và chỉ ra những lối rẽ đi tiếp. Một cuốn giáo trình tốt phải kết thúc bằng cách tự làm mình lỗi thời: nó dạy bạn cách học tiếp mà không cần đến nó nữa.

Trước khi vẽ lộ trình, hãy chốt lại bản đồ chương — vì mọi cross-reference xuyên suốt sách đều dựa vào cách đánh số này.

## 20.1 Toàn cảnh cuốn sách — 20 chương, 2 phụ lục

Cuốn Q-World chia làm bảy phần, mỗi phần là một tầng năng lực. Đọc bảng dưới như đọc một đường leo núi: mỗi chương chỉ đứng vững được nhờ chương bên dưới nó.

| Phần | Chương | Nội dung cốt lõi | Con số ký hiệu bạn phải nhớ |
|---|---|---|---|
| **I — Nền tảng** | Ch1 | Quant P vs Q: hai measure, hai nghề | drift thực $\mu$ vs drift risk-neutral $r$ |
| | Ch2 | Nền tảng tài chính: discount, forward, no-arbitrage | $P(0,1)=0.96154$ |
| | Ch3 | Toán ngẫu nhiên: Itô, SDE, Girsanov | $d(\ln S)=(\mu-\tfrac12\sigma^2)dt+\sigma dW$ |
| | Ch4 | Risk-neutral & FTAP: định giá là kỳ vọng chiết khấu | $V_0=\mathbb{E}^{\mathbb{Q}}[e^{-rT}\text{payoff}]$ |
| **II — Vanilla & Vol** | Ch5 | Black-Scholes & Greeks | $C=10.45,\ \Delta=0.637,\ \Gamma=0.0188$ |
| | Ch6 | Volatility: local vol, implied surface, Dupire | smile put 10% OTM $=18.6\%$ |
| | Ch7 | Fourier & transform pricing (Heston CF, COS) | Heston calibrate vào surface |
| | Ch8 | Equity exotics: barrier, Asian, autocallable | replication tĩnh/động |
| **III — Rates & Asset Classes** | Ch9 | Lãi suất: multi-curve, HW, LMM | forward 1Y1Y $=4.51\%$ |
| | Ch10 | FX derivatives: quanto, SABR, xccy basis | convexity/quanto adjustment |
| | Ch11 | Commodities & inflation: Jarrow-Yildirim, seasonality | real vs nominal curve |
| **IV — Numerics** | Ch12 | MC, PDE, American MC (LSM), AAD | 2σ error band, Sobol |
| **V — Credit/XVA/Capital** | Ch13 | Credit: hazard rate, CDS, CDO | par CDS 5Y $=120\,\text{bp}$ $\Rightarrow \lambda\approx2\%$ |
| | Ch14 | XVA: CVA/FVA/MVA/KVA, netting, WWR | CVA $\approx0.172\,\text{M}$, FVA $\approx0.75\,\text{M}$ |
| | Ch15 | Vốn quy định FRTB: SBM, IMA, ES, PLA | SA vs IMA capital |
| **VI — Sản phẩm chuyên sâu** | Ch16 | Convertible bonds & hybrid capital | convert arb, CoCo/AT1, bond floor |
| | Ch17 | MBS, callable bonds & OAS | prepayment, negative convexity, OAS |
| | Ch18 | Rates exotics: TARN, snowball, range accrual, PRDC | model risk, smile dynamics |
| **VII — Nghề** | Ch19 | Kiến trúc library & model validation | registry, composition, benchmark |
| | **Ch20** | **Lộ trình học** (chương này) | — |
| **Phụ lục** | A | Glossary thuật ngữ | tra cứu nhanh |
| | B | Case studies: LTCM, London Whale, Archegos | rủi ro thật đã xảy ra |

Điều đáng nói không phải là danh sách, mà là **cấu trúc phụ thuộc** ẩn dưới nó. Ch4 (FTAP) là trái tim: mọi thứ sau nó chỉ là chọn một payoff, chọn một model cho $S_t$ dưới $\mathbb{Q}$, rồi tính kỳ vọng chiết khấu đó — bằng công thức đóng (Ch5), bằng Fourier (Ch7), hay bằng Monte Carlo/PDE (Ch12). Credit và XVA (Ch13–14) không phải một môn học khác: chúng chỉ là FTAP áp lên một payoff bổ sung — khoản mất mát khi default — với một model cho thời điểm default $\tau$. Khi bạn nhìn ra sợi chỉ đỏ này — *tất cả đều là $\mathbb{E}^{\mathbb{Q}}[\text{chiết khấu}\times\text{payoff}]$, chỉ khác nhau ở payoff và ở model* — bạn đã hiểu cuốn sách; phần còn lại chỉ là kỹ thuật.

## 20.2 Lộ trình 4 giai đoạn

Đây là ước lượng cho người tự học nghiêm túc, có nền STEM, học bán thời gian bên cạnh công việc hoặc việc học chính. Học toàn thời gian thì chia đôi thời gian. Con số tháng không phải để ép — nó để bạn biết mình đang chậm bất thường hay đang đúng nhịp.

### Giai đoạn 0 — Nền (2–4 tháng)

Ba trụ toán và một trụ code, không có lối tắt. **Calculus đa biến** — bạn cần đạo hàm riêng để hiểu Greeks, vì $\Delta=\partial C/\partial S$ chỉ có nghĩa nếu bạn thoải mái với ký hiệu $\partial$. **Đại số tuyến tính** — Cholesky để mô phỏng nhiều tài sản tương quan, ma trận hiệp phương sai trong VaR. **Xác suất** đến kỳ vọng có điều kiện và CLT — vì martingale nói rằng "kỳ vọng có điều kiện của tương lai bằng hiện tại", và thiếu ngôn ngữ $\mathbb{E}[X_t\mid\mathcal{F}_s]$ thì cả Ch3–Ch4 chỉ là chữ Hán.

Sách xác suất nên đọc: **Blitzstein & Hwang, *Introduction to Probability*** (miễn phí online, bài tập xuất sắc). Lý do chọn nó thay những cuốn khô hơn: nó dạy *story proofs* — nhìn một công thức và kể được câu chuyện vì sao nó đúng. Đúng thứ tư duy quant cần khi phải sanity-check một model lúc 2 giờ sáng.

**Một ví dụ số cho giai đoạn này.** Cho hai tài sản với vol $\sigma_1=20\%$, $\sigma_2=30\%$, tương quan $\rho=0.5$. Ma trận hiệp phương sai:

$$\Sigma=\begin{pmatrix}\sigma_1^2 & \rho\sigma_1\sigma_2\\ \rho\sigma_1\sigma_2 & \sigma_2^2\end{pmatrix}=\begin{pmatrix}0.04 & 0.03\\ 0.03 & 0.09\end{pmatrix}.$$

Phần tử ngoài đường chéo $\rho\sigma_1\sigma_2 = 0.5\times0.20\times0.30 = 0.03$. Cholesky cho $\Sigma=LL^\top$ với

$$L=\begin{pmatrix}0.20 & 0\\ 0.15 & \sqrt{0.09-0.0225}\end{pmatrix}=\begin{pmatrix}0.20 & 0\\ 0.15 & 0.2598\end{pmatrix},$$

trong đó $L_{21}=0.03/0.20=0.15$ và $L_{22}=\sqrt{0.09-0.15^2}=\sqrt{0.0675}=0.2598$. Kiểm chứng: $L_{21}^2+L_{22}^2 = 0.0225+0.0675=0.09=\sigma_2^2$ ✓. Bây giờ lấy hai số ngẫu nhiên chuẩn độc lập $z_1,z_2$ và đặt $x_1=0.20z_1$, $x_2=0.15z_1+0.2598z_2$ — thì $x_1,x_2$ có đúng ma trận hiệp phương sai trên. Đây là dòng lệnh đầu tiên của mọi engine Monte Carlo đa tài sản trong Ch12. Làm được ví dụ này bằng tay, bạn đã sẵn sàng cho Giai đoạn 1.

### Giai đoạn 1 — Vỡ lòng derivatives (3–6 tháng)

Đây là giai đoạn xây trực giác. Hai cuốn đọc song song, một dày một mỏng, bổ khuyết nhau:

**Hull, *Options, Futures, and Other Derivatives*** — "kinh thánh" nhập môn. Đọc 60–70% (bỏ mấy chương thể chế đã cũ). Làm bài tập — Hull dễ đến mức lừa bạn tưởng đã hiểu; chỉ bài tập mới lộ ra chỗ hổng. Sức mạnh của Hull là chiều rộng và trực giác no-arbitrage xây bằng cây nhị phân.

Song song: **Shreve, *Stochastic Calculus for Finance I* (binomial)** — mỏng, xây trực giác measure/martingale sạch sẽ bằng mô hình rời rạc, không cần một dòng giải tích ngẫu nhiên nào. Đây là món quà lớn nhất của Shreve I: nó dạy risk-neutral pricing bằng số học lớp 8.

**Ví dụ xuyên suốt bắt đầu ở đây — cây nhị phân một bước.** $S_0=100$; sau một bước, giá lên $S_u=110$ hoặc xuống $S_d=90$; lãi suất phi rủi ro cho kỳ đó $r_{\text{step}}=1\%$ (tức $e^{r\cdot\Delta t}=1.01$). Xác suất risk-neutral:

$$q=\frac{e^{r\Delta t}S_0 - S_d}{S_u - S_d}=\frac{1.01\times100 - 90}{110-90}=\frac{101-90}{20}=\frac{11}{20}=0.55.$$

Chú ý: $q=0.55$ **không** phải xác suất thực (thực có thể là $0.6$ nếu bạn tin cổ phiếu tăng) — nó là xác suất khiến giá kỳ vọng chiết khấu bằng giá hiện tại, tức khiến $S$ trở thành martingale dưới $\mathbb{Q}$. Định giá một call $K=100$: payoff khi lên $=10$, khi xuống $=0$, nên

$$C_0=\frac{1}{1.01}\big(0.55\times10+0.45\times0\big)=\frac{5.5}{1.01}=5.446.$$

Toàn bộ Ch4 (FTAP) chỉ là công thức này lặp lại vô số bước rồi lấy giới hạn liên tục để thành Black-Scholes. Khi bạn thấy $q=0.55$ và $C_0=5.446$ hiện ra từ số học thuần túy, bạn đã "ngộ" risk-neutral pricing trước cả khi gặp một tích phân Itô.

**Code trong giai đoạn này** là bắt buộc, không phải tùy chọn: implement binomial tree (mở rộng ví dụ trên thành $n$ bước, kiểm tra nó hội tụ về $10.45$ khi $n\to\infty$ với bộ số chuẩn $S_0=100,K=100,r=5\%,\sigma=20\%,T=1$); BS closed-form; Greeks bằng bump; implied vol solver (Newton, rồi Brent làm fallback khi Newton nhảy khỏi miền); mô phỏng GBM; và **thí nghiệm delta-hedging** tái tạo mục 5.3. Cái cuối cùng là khoảnh khắc "ngộ" quan trọng nhất giai đoạn: bạn hedge lại một call đã bán, và thấy P&L cuối cùng $\approx$ hàm của (realized vol $-$ implied vol) — bằng chính con số code của bạn, không phải lời hứa của sách. Cụ thể, với bộ số chuẩn, nếu bạn bán call ở implied $20\%$ và delta-hedge trong khi realized chỉ $18\%$, P&L kỳ vọng dương, tích lũy theo

$$\text{P\&L} \approx \tfrac12\big(\sigma_{\text{imp}}^2-\sigma_{\text{real}}^2\big)\,\Gamma\,S^2\,dt,$$

đúng dòng tiền của gamma. Dấu dương là hiển nhiên khi $\sigma_{\text{real}}<\sigma_{\text{imp}}$: bạn bán vol đắt, mua vol rẻ. Thấy con số này khớp là lúc lý thuyết thành máu thịt.

### Giai đoạn 2 — Chính khóa (6–12 tháng)

Giờ ta vào giải tích ngẫu nhiên thật và các asset class.

**Shreve II, *Continuous-Time Models*** — stochastic calculus chuẩn mực. Đọc kỹ đến Girsanov và numeraire (chương 1–5, 9). Đây là cuốn dạy bạn *vì sao* đổi measure lại đổi drift mà không đổi vol, và *vì sao* chọn numeraire khác nhau (money-market account, bond $P(t,T)$, annuity) lại cho ra các measure forward/swap khác nhau — công cụ nền của toàn bộ rates pricing ở Ch9.

**Gatheral, *The Volatility Surface*** — mỏng mà đậm: local vol, Heston, SVI từ người trong cuộc. Gatheral viết như một trader-quant chứ không như giáo sư — mỗi công thức có một lý do thị trường. Đây là cầu nối tự nhiên vào Ch6–Ch7.

**Andersen & Piterbarg, *Interest Rate Modeling* (3 tập)** — bách khoa rates hiện đại. Đọc để tra cứu chứ đừng đọc tuyến tính; không ai đọc hết ba tập theo thứ tự mà sống sót. Nếu ba tập làm bạn ngợp, khởi động bằng **Brigo & Mercurio, *Interest Rate Models*** (có "sổ tay" công thức rất tiện). Còn curve hiện đại hậu-LIBOR: **Henrard, *Interest Rate Modelling in the Multi-Curve Framework*** — vì thế giới 2026 không còn một curve duy nhất, mà có curve discount OIS và các curve forward riêng.

**Ví dụ số nối mạch cho giai đoạn này — bootstrap curve OIS.** Quote 1Y $=4.00\%$, 2Y $=4.25\%$ (fixed hằng năm). Discount 1Y:

$$P(0,1)=\frac{1}{1+0.04}=\frac{1}{1.04}=0.96154.$$

Discount 2Y giải từ điều kiện par của swap 2Y (fixed $4.25\%$ trên hai kỳ, thả nổi bằng $1-P(0,2)$):

$$0.0425\big(P(0,1)+P(0,2)\big)+P(0,2)=1 \;\Rightarrow\; P(0,2)=\frac{1-0.0425\times0.96154}{1.0425}=0.92003.$$

Zero rate 2Y (compounding hằng năm): $P(0,2)=(1+z_2)^{-2}\Rightarrow z_2=0.92003^{-1/2}-1=4.26\%$. Forward 1Y1Y:

$$f_{1,2}=\frac{P(0,1)}{P(0,2)}-1=\frac{0.96154}{0.92003}-1=4.51\%.$$

Con số $4.51\%$ — cao hơn *cả hai* quote $4.00\%$ và $4.25\%$ — là lãi suất kỳ hạn một năm bắt đầu sau một năm nữa; nó cao vì curve dốc lên, và nó xuất hiện lại ở Ch9 (định giá FRA, swap forward-starting) và Ch14 (mô phỏng exposure của swap). Bootstrap được bằng tay bộ số $0.96154,\ 0.92003,\ 4.51\%$ là bằng chứng bạn đã nắm gốc rễ multi-curve.

**Numerics của giai đoạn:** **Glasserman, *Monte Carlo Methods in Financial Engineering*** (kinh điển tuyệt đối — variance reduction, quasi-MC/Sobol, greeks bằng pathwise và likelihood-ratio, tất cả nằm ở đây); **Savine, *Modern Computational Finance*** (AAD — cách tính hàng nghìn Greeks với chi phí chỉ $\sim 4\times$ một lần định giá, thay vì bump từng cái).

**Ví dụ AAD hé lộ vì sao nó thay đổi cuộc chơi.** Một portfolio phụ thuộc 200 risk factor. Bump-and-revalue cần $201$ lần định giá (một base $+$ 200 bump). Nếu một lần định giá MC nặng $2$ giây, đó là $201\times2 = 402$ giây $\approx 6.7$ phút cho một lần tính rủi ro. AAD (reverse-mode) cho *toàn bộ* 200 đạo hàm với chi phí $\approx 4\times$ base $=8$ giây — nhanh hơn $402/8 \approx 50$ lần. Với portfolio 5000 factor thì khoảng cách là $5001$ lần định giá so với $\approx 4$ lần: chênh hơn ba bậc độ lớn. Đây là lý do AAD (tầng `src/aad`) là công nghệ nền của XVA hiện đại — không có nó, tính hàng chục nghìn Greeks của một CVA portfolio qua đêm là bất khả.

**Code giai đoạn 2:** Heston bằng COS hoặc Carr-Madan rồi calibrate vào surface thật (khớp được smile equity điển hình — ATM 1Y $\sim20\%$, put 10% OTM $\sim18.6\%$, call 10% OTM $\sim14.9\%$, tức $\rho<0$); bootstrap multi-curve (đúng bộ số $0.96154,\ 0.92003$ ở trên); Hull-White PDE cho Bermudan swaption; và LSM (Longstaff-Schwartz) cho American MC. Nhìn quen không? Đây chính là lộ trình các module `src/models`, `src/calibration`, `src/engines`, `src/numerics` của repo `quantc`. Cuốn sách và cái repo là hai mặt của cùng một tấm bản đồ.

### Giai đoạn 3 — Chuyên sâu theo hướng (6–12 tháng, chọn 1–2)

Không ai giỏi cả bốn hướng dưới. Chọn theo desk bạn muốn vào.

***XVA*** — **Green, *XVA: Credit, Funding and Capital Valuation Adjustments*** (sách nghề chuẩn) $+$ **Gregory, *The xVA Challenge***. Code: exposure engine HW1F cho một swap portfolio, tính CVA/FVA, rồi MVA bằng regression (nối vào `src/xva`, `src/proxy`).

**Ví dụ số neo giai đoạn XVA — tái sử dụng running example.** Swap payer 10Y notional 100M, EE profile hình bướu, đỉnh $\sim2.3\,\text{M}$ quanh năm 4–5 (exposure tăng vì rate diffuse rộng ra, rồi giảm vì swap amortize về cuối đời). Counterparty có $\lambda=2\%$, recovery $R=40\%$. CVA xấp xỉ (rời rạc theo lưới thời gian $t_i$):

$$\text{CVA}=(1-R)\sum_i \text{EE}(t_i)\,P(0,t_i)\,\big[Q(t_{i-1})-Q(t_i)\big],$$

với $Q(t)=e^{-\lambda t}$ là xác suất sống sót. Xác suất default trong một năm $\approx\lambda=2\%$ khi $\lambda$ nhỏ; nhân với loss-given-default $(1-R)=0.6$, với EE bình quân $\sim 2\,\text{M}$ chiết khấu và tích lũy qua 10 năm, ra $\text{CVA}\approx0.172\,\text{M}$ — tức $\approx17\,\text{bp}$ trên notional 100M. Thêm FVA (funding spread 50bp, không CSA) $\approx0.75\,\text{M}$ ($\approx75\,\text{bp}$) — lớn hơn CVA vì funding chạy trên *toàn bộ* exposure dương, chứ không chỉ phần mất khi default. Điều đắt giá: nếu có CSA đầy đủ (collateral hai chiều, threshold 0), exposure gần như bị triệt tiêu và CVA còn $\sim1\,\text{bp}$. Một dòng trong hợp đồng CSA đổi CVA từ $17\,\text{bp}$ xuống $1\,\text{bp}$ — đó là vì sao XVA desk và bộ phận đàm phán CSA phải nói chuyện với nhau.

***FRTB/Risk*** — đọc thẳng **BCBS *Minimum capital requirements for market risk* (d457)** $+$ **ISDA SIMM methodology**. Không tóm tắt nào thay được spec gốc ở đây, vì capital là quy định — chữ chính xác là luật. Code: SBM (Sensitivities-Based Method) aggregation đầy đủ với registry tham số (nối vào `src/risk`). Quy định thay đổi hằng năm; điều bất biến là *cách* tổ chức tham số vào một registry, để khi Basel ra bản mới, bạn chỉ đổi số chứ không đổi code (đúng nguyên tắc kiến trúc của Ch19).

***Vol*** — **Bergomi, *Stochastic Volatility Modeling*** — cuốn vol sâu nhất hiện có, từ head quant SocGen; đọc để hiểu forward variance và vì sao skew có cấu trúc kỳ hạn như nó có. Thêm rough vol papers (Gatheral, Jaisson & Rosenbaum, *Volatility is Rough*) — hướng nghiên cứu nóng nhất thập kỷ, và là chỗ ranh giới P/Q gặp nhau (variance risk premium — xem cuốn P-world).

***Credit*** — **O'Kane, *Modelling Single-name and Multi-name Credit Derivatives*** — chuẩn mực cho CDS bootstrap và copula cho CDO.

**Ví dụ số neo giai đoạn Credit — bootstrap hazard từ CDS.** Par spread 5Y $=120\,\text{bp}$, $R=40\%$. Xấp xỉ credit-triangle:

$$\lambda\approx\frac{s}{1-R}=\frac{0.0120}{0.60}=0.02=2\%.$$

Với $\lambda=2\%$ đều và chiết khấu $\sim4\%$, RPV01 (risky annuity) $\approx4.19$; upfront cho một hợp đồng coupon chuẩn 100bp là $(\text{spread}-\text{coupon})\times\text{RPV01}=(0.0120-0.0100)\times4.19\approx0.84\%$ notional. Ba con số $\lambda\approx2\%,\ \text{RPV01}\approx4.19,\ \text{upfront}\approx0.84\%$ là toàn bộ life-cycle của một CDS trade — và $\lambda=2\%$ chính là hazard rate ta đã cắm vào CVA ở trên. Credit và XVA là một dòng chảy liên tục, không phải hai môn tách rời.

## 20.3 Kệ sách xếp theo vai

Bảng này là bản mở rộng của kệ sách — mỗi cuốn kèm *vì sao* nó có mặt, vì một danh sách trần trụi không giúp bạn biết đọc gì trước.

| Mục đích | Sách | Vì sao ở đây |
|---|---|---|
| Nhập môn toàn cảnh | Hull; Wilmott *FAQ in Quantitative Finance* | Hull cho chiều rộng; Wilmott đọc vui mà sâu, mỗi câu hỏi là một trực giác |
| Toán chặt chẽ | Shreve I & II; Baxter & Rennie *Financial Calculus* | Baxter–Rennie mỏng, trực giác measure đẹp nhất trong các sách nhập môn stochastic |
| Volatility | Gatheral; Bergomi; Austing *Smile Pricing Explained* | Gatheral rộng, Bergomi sâu, Austing thực chiến với FX và skew |
| Rates | Andersen & Piterbarg; Brigo & Mercurio; Henrard | A&P để tra, B&M để học, Henrard cho multi-curve hậu-LIBOR |
| Numerics | Glasserman (MC); Savine (AAD); Duffy (FDM) | Ba trục: mô phỏng, đạo hàm, lưới sai phân |
| XVA/Counterparty | Green; Gregory | Green nặng model, Gregory nặng thể chế và thực hành |
| Credit | O'Kane | Chuẩn mực single-name và copula CDO |
| Career/phỏng vấn | Joshi *Quant Job Interview Q&A*; Zhou *A Practical Guide to Quantitative Finance Interviews*; Crack *Heard on the Street*; Derman *My Life as a Quant* | Ba cuốn đầu để luyện; Derman (hồi ký) để hiểu văn hóa nghề |
| Lịch sử/văn hóa | Bernstein *Against the Gods*; Lowenstein *When Genius Failed* (LTCM); Patterson *The Quants*; Dunbar *The Devil's Derivatives* | Đọc cho vui mà học nhiều về *rủi ro thật* — và những gì xảy ra khi model gặp thị trường không nghe lời |

Một lời khuyên về thứ tự: đừng mua cả kệ. Mua Hull $+$ Shreve I cho giai đoạn 1. Chỉ khi chạm trần của cuốn đang đọc mới mua cuốn tiếp. Một quant giỏi có ít sách được đọc nát, chứ không phải nhiều sách còn nguyên gáy.

## 20.4 Năm nguyên tắc học đã được kiểm chứng

Đây là phần quan trọng nhất chương, vì nó là *cách* dùng mọi thứ ở trên.

**Một — Code mọi thứ.** Hiểu-bằng-mắt là ảo giác. Một công thức chỉ thuộc về bạn khi con số code của bạn khớp con số sách. Ví dụ tối thượng: bộ số chuẩn $S_0=100,K=100,r=5\%,\sigma=20\%,T=1$ phải cho ra $d_1=0.35$, $d_2=0.15$, $N(d_1)=0.6368$, $N(d_2)=0.5596$, $C=10.45$, $\Delta=0.637$, $\Gamma=0.0188$, vega $=0.375$/vol-point, $\Theta\approx-6.41$/năm ($\approx-0.018$/ngày), $\rho=0.532$/1%. Nếu code của bạn ra $C=10.44$ hay $10.46$, bạn có bug — thường là quy ước $\Theta$ theo năm vs theo ngày, hoặc vega theo $1\%$ vs theo $1.0$ — và việc *săn* cái $0.01$ chênh đó dạy bạn nhiều hơn mười trang lý thuyết. Repo `quantc` được xây đúng theo triết lý này: mỗi chương ở trên có một module tương ứng để implement và kiểm bằng số.

**Hai — Một ví dụ xuyên suốt hơn mười ví dụ rời.** Cả cuốn sách này cố tình tái sử dụng đúng một nắm con số: cùng một call ATM đi từ Ch5 (giá $10.45$) sang Ch12 (định giá lại bằng MC, kiểm nó rơi trong $2\sigma$ band quanh $10.45$) rồi tới Ch15 (capital của nó). Cùng một swap 10Y đi từ Ch9 (MTM $=+1.89$ nếu đã ký trả fixed 3% khi swap rate là 4%) sang Ch14 (CVA $0.172\,\text{M}$ của chính nó). Bạn hãy làm y hệt: nuôi *một* swap 10Y và *một* call ATM 1Y đi cùng bạn qua toàn bộ hành trình học — price nó, hedge nó, tính CVA của nó, tính capital cho nó. Khi một instrument theo bạn qua mọi chương, bạn thấy cả bức tranh nối liền thay vì các mảnh rời.

**Ba — Đọc primary sources khi vào nghề.** Tóm tắt của người khác luôn mất thông tin. Và tin vui: nhiều paper gốc ngắn và đọc được. Dupire (1994) — công thức local vol làm nền cả Ch6 — chỉ khoảng bốn trang. Hagan và cộng sự (2002) — SABR, xương sống của Ch10 — đọc được với nền giai đoạn 2. Spec Basel gốc (d457) dài nhưng là *nguồn sự thật duy nhất* cho capital; không desk nào chạy FRTB từ một bài blog. Khi bạn tự đọc Dupire và tự dẫn lại công thức local vol từ định nghĩa, bạn không còn là người học — bạn là người hành nghề.

**Bốn — Dành 50% thời gian cho numerics và engineering.** Đây là tỉ lệ khớp với công việc thật, và là thứ các chương trình MFE dạy thiếu nhất. Một model đẹp không định giá được gì nếu Monte Carlo của nó không hội tụ, nếu Sobol sequence bị dùng sai chiều, nếu AAD tape rò bộ nhớ. Nhìn lại ví dụ AAD $50\times$ ở trên: khác biệt giữa một CVA desk chạy được qua đêm và một cái không, không nằm ở model tài chính — nó nằm ở kỹ thuật. Ch12 và Ch19 dài không phải ngẫu nhiên. Một nửa nghề quant là toán tài chính; nửa kia là làm cho nó chạy đúng, chạy nhanh, và kiểm chứng được.

**Năm — Học xong Q, đọc cuốn P.** Cuốn P-world (`docs/p-world.md`) là buy-side: measure thực $\mathbb{P}$, alpha, backtest, portfolio construction. Người giỏi nhất trong nghề hiểu *cả hai* measure và biết chúng nói chuyện với nhau ở đâu. Ranh giới hai thế giới là nơi thú vị nhất: **vol trading** (bán implied vol đắt, mua realized rẻ — chính là gamma P&L bạn đo ở giai đoạn 1, nhìn từ phía P); **XVA hedging** (desk XVA sinh ra dòng lệnh hedge khổng lồ chảy vào thị trường mà buy-side đọc được); **market making** và **variance risk premium** (vì sao implied vol trung bình cao hơn realized — một câu hỏi thuần P mà chỉ hiểu trọn nếu bạn nắm cả cơ chế Q). Sinh viên chỉ học Q thấy thế giới một nửa; học cả hai, bạn thấy toàn bộ dòng chảy.

## 20.5 Lời kết

Ta bắt đầu Ch1 bằng một câu hỏi tưởng như triết học — vì sao có hai measure — và kết thúc ở đây với một tấm bản đồ nghề. Giữa hai đầu ấy là một cây cầu xây bằng những con số cụ thể: $q=0.55$ của cây nhị phân đầu tiên, $C=10.45$ của call chuẩn, $P(0,2)=0.92003$ của curve, $\text{CVA}=0.172\,\text{M}$ của counterparty, và cú nhảy $50\times$ của AAD. Mỗi con số ấy là một viên gạch bạn đã tự tay đặt xuống.

Điều cuốn sách không thể trao cho bạn là thời gian ngồi trước màn hình, gõ lại từng công thức thành code, và săn cái $0.01$ chênh lệch cho đến khi nó biến mất. Đó là phần của bạn. Cuốn sách chỉ ra con đường; đi là việc của đôi chân. Nhưng nếu bạn đã đọc đến dòng này và đã code đủ để thấy số của mình khớp số của sách, thì bạn không còn cần cuốn sách nữa — và đó chính là điều nó mong muốn nhất. Giờ hãy mở repo `quantc`, mở một terminal, và bắt đầu chương tiếp theo — chương do chính bạn viết.

# Phụ lục A: Từ điển thuật ngữ Q-world

Một cuốn sách quant tốt để lại trong đầu người đọc không phải danh sách công thức, mà một *mạng lưới thuật ngữ* nối với nhau: nghe "convexity adjustment" là nhớ ngay tại sao Jensen bắt ta cộng thêm; nghe "wrong-way risk" là thấy ngay exposure và default nắm tay nhau đúng lúc tệ nhất. Phụ lục này là cái mạng lưới đó, cô đọng lại thành một bảng tra cứu. Nhưng một glossary Q-world tử tế không thể chỉ là định nghĩa một dòng — vì bản chất của Q-world là *mọi khái niệm đều quy về một con số*. Vì thế sau bảng tra nhanh, phần còn lại của phụ lục đào sâu từng cụm chủ đề mới (Fourier pricing, equity/FX exotics, commodities, inflation, numerics nâng cao, model validation), mỗi khái niệm lớn kèm ít nhất một ví dụ tính bằng số ra kết quả cụ thể, và những công thức lớn được dẫn xuất từng bước để bạn tự làm lại được. Thuật ngữ giữ nguyên tiếng Anh chuẩn industry, prose tiếng Việt.

## Bảng tra nhanh — các thuật ngữ nền tảng (giữ nguyên)

| Thuật ngữ | Nghĩa ngắn gọn |
|---|---|
| AAD | Adjoint algorithmic differentiation — mọi Greeks trong ~4 lần chi phí một lần price |
| Annuity | $\sum \tau_i P(t,T_i)$ — PV của 1bp fixed leg; numeraire của swap measure |
| Arbitrage | Lợi nhuận phi rủi ro vốn 0; giả định "không tồn tại" sinh ra toàn bộ lý thuyết |
| ATM/ITM/OTM | At/in/out-of-the-money — vị trí spot so với strike |
| Bermudan | Option exercise được tại tập ngày định trước (giữa European và American) |
| Black-76 | Black-Scholes trên forward — công thức quote chuẩn của rates/commodities |
| Butterfly arbitrage | Vi phạm tính lồi của giá call theo strike ⟺ mật độ risk-neutral âm |
| Calibration | Giải ngược tham số model từ giá thị trường — nghi thức trung tâm của Q |
| CCP | Central counterparty — clearing house đứng giữa xóa rủi ro song phương |
| CDS | Credit default swap — bảo hiểm vỡ nợ; spread ≈ λ(1−R) |
| CMS | Constant maturity swap — coupon theo swap rate; cần convexity adjustment |
| CSA | Credit support annex — phụ lục ISDA quy định collateral; quyết định curve chiết khấu |
| CVA/DVA/FVA/MVA/KVA | Điều chỉnh giá cho default đối tác/mình, funding, initial margin, vốn |
| Delta/Gamma/Vega/Theta | Độ nhạy theo spot / delta / vol / thời gian |
| Discount factor P(t,T) | Giá hôm nay của 1 đồng tại T — nguyên tử của mọi pricing |
| DRC / RRAO | Default risk charge / residual risk add-on — hai mảnh của FRTB SA |
| EE / EPE / PFE | Expected exposure / trung bình của nó / quantile của exposure |
| ES (Expected Shortfall) | Trung bình lỗ vượt VaR — risk measure của FRTB (97.5%) |
| Feynman-Kac | Cầu nối PDE ⟺ kỳ vọng — lý do chọn được giữa lưới và Monte Carlo |
| FRTB SA/IMA | Khung vốn market risk: standardised (SBM) / internal models (ES+PLA+NMRF) |
| FTAP | Không arbitrage ⟺ tồn tại measure martingale; complete ⟺ duy nhất |
| Girsanov | Đổi measure = đổi drift, giữ vol — cơ chế xóa μ khỏi giá |
| GBM | Geometric Brownian motion — dS = μS dt + σS dW; nền Black-Scholes |
| Hazard rate λ | Cường độ default; survival = exp(−∫λ) |
| Heston / SABR | Hai model stochastic vol chuẩn (equity / rates-FX) |
| Hull-White | Short-rate model khớp curve, nghiệm đóng — workhorse Bermudan & XVA |
| Implied vol | σ đưa vào BS để khớp giá thị trường — "bảng quy đổi" chuẩn của options |
| ISDA Master / netting set | Hợp đồng khung cho phép bù trừ mọi deal khi default |
| Itô's lemma | Chain rule ngẫu nhiên; thêm ½σ²f'' vì (dW)² = dt |
| LMM | Libor/forward market model — model trực tiếp các forward rates, MC |
| Local vol (Dupire) | σ(S,t) duy nhất khớp toàn bộ surface vanilla |
| LSM (Longstaff-Schwartz) | Regression trong MC cho early exercise |
| Martingale | E[tương lai\|hiện tại] = hiện tại; "giá/numeraire là martingale dưới Q" |
| MPoR | Margin period of risk — khoảng trễ đóng vị thế khi đối tác vỡ nợ (~10 ngày) |
| Multi-curve | Chiết khấu theo curve collateral (OIS/RFR), dự báo theo curve riêng |
| NMRF | Non-modellable risk factor — thiếu giá quan sát → stress charge riêng (FRTB) |
| Numeraire | Tài sản làm đơn vị đo; đổi numeraire = đổi measure |
| OIS / RFR / SOFR | Lãi suất qua đêm (gần phi rủi ro) — chuẩn chiết khấu hậu-LIBOR |
| PLA test | P&L attribution — FRTB ép risk model khớp FO pricing |
| Put-call parity | C − P = S − Ke^{−rT} — model-free, máy phát hiện quote lỗi |
| Replication | Tái tạo payoff bằng trading — nguồn gốc của giá không cần dự báo |
| Risk-neutral measure Q | Measure định giá: mọi tài sản drift r; tồn tại nhờ hedge được |
| SA-CCR / SIMM | Công thức quy định cho EAD counterparty / initial margin song phương |
| SVI / SSVI | Parametrization chuẩn của vol smile/surface, kiểm soát arbitrage |
| Swaption | Option vào swap; cube vol (expiry×tenor×strike) là bề mặt trung tâm của rates |
| Variance swap | Cược vol sạch; replicate model-free bằng dải OTM options 1/K² |
| VaR | Quantile lỗ; tiền nhiệm của ES, vẫn dùng cho backtesting |
| Vol smile/skew | Implied vol theo strike — bằng chứng thị trường từ chối lognormal |
| Wrong-way risk | Exposure tăng đúng lúc xác suất default đối tác tăng |
| XVA desk | Desk trung tâm quản lý CVA/FVA/MVA/KVA toàn ngân hàng |
| Yield curve | z(T) theo maturity; dựng từ deposits/futures/swaps — nền của mọi thứ |

## Bảng tra nhanh — thuật ngữ nâng cao (mới)

Cụm thuật ngữ dưới đây phủ các chương mở rộng: Fourier pricing (Ch7), equity & FX exotics (Ch8, Ch10), commodities & inflation (Ch11), numerics nâng cao (Ch12) và model validation (Ch19). Đọc bảng để có định nghĩa một dòng; đọc các mục sâu bên dưới để thấy con số.

| Thuật ngữ | Nghĩa ngắn gọn |
|---|---|
| Characteristic function | $\phi(u)=\mathbb{E}[e^{iu\ln S_T}]$ — Fourier transform của mật độ; Heston/Lévy có dạng đóng dù mật độ thì không |
| COS method | Khai triển mật độ theo cosine trên $[a,b]$; giá vanilla từ CF trong vài chục số hạng, hội tụ mũ |
| Carr-Madan | Nhân giá call với $e^{\alpha k}$ để khả tích rồi FFT — pricing cả dải strike một lần |
| Gil-Pelaez | Công thức đảo: CDF từ tích phân phần ảo của CF; nền của "phương pháp hai tích phân" |
| Damping factor α | Hằng số làm phẳng trong Carr-Madan; chọn quá lớn → moment nổ, tích phân phân kỳ |
| Autocallable | Note tự động đáo hạn sớm khi index vượt barrier tại observation date; short down-and-in put |
| Cliquet | Chuỗi forward-start options; tổng các return bị cap/floor từng kỳ — "ratchet" |
| Vanna-Volga | Kỹ thuật FX: chỉnh giá BS bằng ba vanilla ATM/RR/BF để khớp smile |
| One-touch | Trả 1 nếu spot chạm barrier trước T; giá ≈ xác suất chạm risk-neutral |
| TARF | Target redemption forward — chuỗi FX forward, tự huỷ khi lãi tích luỹ chạm target |
| Quanto | Payoff tính bằng ngoại tệ nhưng trả bằng nội tệ; drift chỉnh $-\rho\sigma_S\sigma_X$ |
| Convenience yield | Lợi ích nắm hàng vật chất; đóng vai dividend trong cost-of-carry commodities |
| Contango / backwardation | Forward curve dốc lên (F>S) / dốc xuống (F<S) — roll yield âm / dương |
| Schwartz model | Mean-reverting log-spot cho commodity; $d\ln S=\kappa(\theta-\ln S)dt+\sigma dW$ |
| Crack / spark spread | Chênh giá sản phẩm lọc dầu / (điện − khí×heat rate); option trên spread |
| Breakeven inflation | Chênh nominal − real yield; lạm phát thị trường ngầm định |
| Zero-coupon inflation swap | Đổi một khoản $(1+K)^T-1$ lấy tăng CPI; quote chuẩn của inflation |
| Jarrow-Yildirim | Mô hình lạm phát kiểu FX: nominal/real như hai tiền tệ, CPI là "tỷ giá" |
| MLMC | Multilevel Monte Carlo — kết hợp nhiều mức lưới, hạ chi phí từ $\varepsilon^{-3}$ về $\varepsilon^{-2}$ |
| Andersen-Broadie | Dual bound cho Bermudan: martingale từ hedge cho cận trên, kẹp giá LSM |
| Distance-to-default | $(\ln(V/D)+(\mu-\tfrac12\sigma_V^2)T)/(\sigma_V\sqrt T)$ — số sigma tới vỡ nợ (Merton/KMV) |
| Model validation | Kiểm định độc lập model trước khi lên production; benchmark, backtest, limit |
| SR 11-7 | Guidance của Fed về model risk: định nghĩa, vòng đời, validation độc lập, governance |

## Fourier pricing: characteristic function, COS, Carr-Madan, Gil-Pelaez

Vì sao cụm này tồn tại: với Black-Scholes ta có công thức đóng vì mật độ của $\ln S_T$ là Gaussian. Nhưng Heston, các model Lévy, rough vol — mật độ của chúng *không* có dạng đóng. Điều kỳ diệu là **characteristic function** (CF) thì lại có. CF là Fourier transform của mật độ:
$$\phi(u)=\mathbb{E}^{\mathbb{Q}}\!\left[e^{iu\ln S_T}\right]=\int_{-\infty}^{\infty} e^{iux}\,f(x)\,dx,\qquad x=\ln S_T.$$
Nếu biết $\phi$, ta khôi phục được giá option mà không cần biết $f$ tường minh. Đó là toàn bộ ý tưởng của Fourier pricing.

**Ví dụ số — CF của Black-Scholes.** Dưới $\mathbb{Q}$, $\ln S_T\sim \mathcal{N}(m,s^2)$ với $m=\ln S_0+(r-\tfrac12\sigma^2)T$ và $s^2=\sigma^2 T$. CF của một Gaussian là $\phi(u)=\exp(ium-\tfrac12 s^2u^2)$. Lấy đúng bộ số running example ($S_0=100,r=5\%,\sigma=20\%,T=1$): $m=\ln 100+(0.05-0.02)=4.6052+0.03=4.6352$, $s^2=0.04$. Vậy
$$\phi(u)=\exp\!\big(4.6352\,iu-0.02\,u^2\big).$$
Tại $u=1$: phần thực $=e^{-0.02}\cos(4.6352)=0.9802\times(-0.0772)=-0.0756$; phần ảo $=e^{-0.02}\sin(4.6352)=0.9802\times(-0.9970)=-0.9773$. Con số này tự nó vô nghĩa với mắt người, nhưng nó là "DNA" đầy đủ của phân phối — mọi moment và mọi giá option đều rút ra từ đây. Chẳng hạn, đạo hàm của $\phi$ tại $u=0$ cho các moment: $\phi'(0)/i=m=4.6352$ đúng là kỳ vọng của $\ln S_T$, và $-\phi''(0)-m^2=s^2=0.04$ đúng là variance — CF không chỉ đẹp mà còn *chứa toàn bộ* thông tin thống kê, đó là lý do ta dám định giá chỉ từ nó.

**Gil-Pelaez** là cây cầu ngược: nó cho CDF từ CF bằng một tích phân chỉ dùng phần ảo:
$$F(x)=\frac12-\frac{1}{\pi}\int_0^\infty \frac{\operatorname{Im}\!\big[e^{-iux}\phi(u)\big]}{u}\,du.$$
Từ đây, giá call chính là công thức "hai xác suất" mà bạn đã thấy trong Black-Scholes tổng quát: $C=S_0\Pi_1-Ke^{-rT}\Pi_2$, với $\Pi_1,\Pi_2$ là hai xác suất Gil-Pelaez (một dưới stock measure, một dưới $\mathbb{Q}$). Với Heston, $\Pi_1,\Pi_2$ dùng đúng công thức trên nhưng thay $\phi$ bằng CF Heston — và ta ra giá exact chỉ bằng hai tích phân số một chiều.

**Ví dụ số — Gil-Pelaez ra một xác suất cụ thể, với cầu phương thực sự.** Ta kiểm chứng công thức bằng chính CF Gaussian ở trên, tính $\Pi_2=\mathbb{Q}(S_T>K)$ cho call ATM ($K=100$, tức $x^*=\ln 100=4.6052$). Lý thuyết Black-Scholes bảo đáp số phải là $N(d_2)=N(0.15)=0.55962$; ta xem tích phân Gil-Pelaez có tái tạo được không. Với $\phi(u)=e^{4.6352iu-0.02u^2}$, ta có $e^{-iux^*}\phi(u)=e^{0.03\,iu-0.02u^2}$ (vì $m-x^*=4.6352-4.6052=0.03$), nên phần ảo là $\operatorname{Im}[\cdot]=e^{-0.02u^2}\sin(0.03u)$ và integrand $g(u)=e^{-0.02u^2}\sin(0.03u)/u$. Vài giá trị:

| $u$ | $e^{-0.02u^2}$ | $\sin(0.03u)$ | $g(u)=e^{-0.02u^2}\sin(0.03u)/u$ |
|---|---|---|---|
| 0.5 | 0.9950 | 0.01500 | 0.02985 |
| 1.0 | 0.9802 | 0.03000 | 0.02940 |
| 1.5 | 0.9560 | 0.04498 | 0.02867 |
| 2.0 | 0.9231 | 0.05996 | 0.02768 |
| 3.0 | 0.8353 | 0.08988 | 0.02502 |

Các số hạng dương và tắt dần theo $e^{-0.02u^2}$; đuôi triệt tiêu quanh $u\approx 20$ nơi $e^{-0.02u^2}=e^{-8}\approx 3\times10^{-4}$. Điểm đáng nói — và đây là một bài học cầu phương thực chiến: **quy tắc hình chữ nhật thô với bước $\Delta u=0.5$ bỏ sót phần đóng góp gần $u=0$**. Nếu ta cộng $g(u)\Delta u$ trên lưới $u\in\{0.5,1.0,1.5,\dots\}$ đến $u=20$, ta chỉ được $\int_0^\infty g\,du\approx 0.1798$, cho $F(x^*)=\tfrac12-\tfrac1\pi(0.1798)=0.5-0.0572=0.4428$ và $\Pi_2=1-F=0.5572$ — mới khớp $N(d_2)$ đến *hai* chữ số. Lý do sai lệch: integrand không hề nhỏ tại $u\to 0$ (nó tiến tới $g(0^+)=e^{0}\cdot 0.03/1\cdot\lim=0.03$, một hằng số dương), nên đặt điểm lưới đầu tiên ở $u=0.5$ đã ăn gian mất dải $[0,0.5]$ đáng kể. Chỉ cần tinh chỉnh cầu phương — dùng midpoint hoặc trapezoid với bước nhỏ hơn và bắt đầu sát $0$ — tích phân hội tụ về giá trị đúng $\int_0^\infty g\,du= 0.18729$, cho $\Pi_2=1-\big(0.5-\tfrac1\pi\cdot 0.18729\big)=1-0.44038=0.55962$, **trùng $N(d_2)=0.55962$ đến năm chữ số**. Bài học kép: (1) Gil-Pelaez *không* chỉ là công thức đẹp trên giấy — nó ép ra đúng xác suất risk-neutral, và với Heston thì đây là con đường *duy nhất* vì $N(d_2)$ không còn tồn tại; (2) chất lượng cầu phương một chiều *là* chất lượng giá — một lưới thô ẩu đủ để lệch giá vài chục bps, nên desk luôn dùng adaptive quadrature chứ không phải rectangle rule ngây thơ.

**COS method** là cách hiện đại, nhanh hơn Gil-Pelaez một bậc. Ý tưởng: trên một khoảng cắt $[a,b]$ đủ rộng, khai triển mật độ theo chuỗi cosine, và **hệ số cosine của mật độ *chính là* phần thực của CF** đánh giá tại các tần số lưới. Vì sao? Hệ số Fourier-cosine của $f$ trên $[a,b]$ là $A_k=\frac{2}{b-a}\int_a^b f(x)\cos\!\big(k\pi\frac{x-a}{b-a}\big)dx$; nếu đuôi phân phối nằm gần trọn trong $[a,b]$ thì cận tích phân nới ra $(-\infty,\infty)$ gần như không đổi giá trị, và $\int f(x)\cos(\omega x)dx=\operatorname{Re}\!\big[\int f(x)e^{i\omega x}dx\big]=\operatorname{Re}[\phi(\omega)]$ — đúng định nghĩa CF. Bù pha do $[a,b]$ không tâm-tại-0 cho đúng công thức:
$$f(x)\approx \sum_{k=0}^{N-1}{}' F_k\cos\!\Big(k\pi\frac{x-a}{b-a}\Big),\quad F_k=\frac{2}{b-a}\operatorname{Re}\!\Big[\phi\Big(\tfrac{k\pi}{b-a}\Big)e^{-ik\pi\frac{a}{b-a}}\Big],$$
(dấu $\sum'$ nghĩa là số hạng $k=0$ nhân $\tfrac12$). Giá vanilla thành tổng hữu hạn $V\approx e^{-rT}\sum_k{}' F_k\,V_k$, với $V_k$ là hệ số cosine của payoff (tính đóng cho call/put qua hai tích phân sơ cấp $\chi_k$ và $\psi_k$). Khoảng cắt chuẩn lấy $[a,b]=[c_1\pm L\sqrt{c_2}]$ với $c_1,c_2$ là cumulant 1 và 2, $L\approx 10$.

**Ví dụ số — COS định giá lại call chuẩn.** Với bộ số trên, giá đúng là $C=10.4506$. Chạy COS với $N=64$ số hạng và $L=10$: hai cumulant đầu của $\ln S_T$ là $c_1=m=4.6352$ và $c_2=s^2=0.04$ nên $\sqrt{c_2}=0.2$, cho khoảng cắt *đối xứng* $[a,b]=[\,4.6352\pm 10\sqrt{c_2}\,]=[\,4.6352\pm 2\,]\approx[2.64,\,6.64]$ (tâm tại $c_1$, nửa-độ-rộng $L\sqrt{c_2}=2$ về cả hai phía). Cộng đủ 64 số hạng cho $C=10.45058$, sai số so với BS analytic dưới $10^{-4}$. Điểm mấu chốt: **hội tụ mũ** — tăng từ $N=32$ lên $64$ cắt sai số đi vài bậc thập phân, trong khi một lưới PDE hay Monte Carlo cần gấp bội điểm để đạt cùng độ chính xác. Đây là lý do desk equity-exotics dùng COS làm "bàn cân chuẩn" khi calibrate Heston: mỗi lần gọi objective function là hàng nghìn giá vanilla, và COS cho chúng gần như tức thời. Trong repo, đây là tầng `analytics/cos-method` và `analytics/characteristic`.

**Carr-Madan** giải một vấn đề khác: định giá *cả một dải strike* trong một lần bằng FFT. Vấn đề kỹ thuật là giá call $C(k)$ theo log-strike $k=\ln K$ không khả tích khi $k\to-\infty$ (call rất ITM có giá tiến tới $S_0$, không tắt), nên Fourier transform trực tiếp của $C(k)$ phân kỳ. Carr-Madan sửa bằng cách nhân với **damping factor** $e^{\alpha k}$ ($\alpha>0$) để ép đuôi trái tắt:
$$c(k)=e^{\alpha k}C(k),\qquad \psi(v)=\int_{-\infty}^\infty e^{ivk}c(k)\,dk=\frac{e^{-rT}\phi\big(v-(\alpha+1)i\big)}{\alpha^2+\alpha-v^2+i(2\alpha+1)v}.$$
$\psi$ có dạng đóng theo CF, nên một FFT trả về $C(k)$ trên cả lưới log-strike cùng lúc.

**Ví dụ số — chọn α và cạm bẫy moment explosion.** Điều kiện khả tích là $\phi\big(-(\alpha+1)i\big)$ hữu hạn, tức moment bậc $\alpha+1$ của $S_T$ phải tồn tại: $\mathbb{E}[S_T^{\alpha+1}]<\infty$. Với BS mọi moment hữu hạn nên chọn $\alpha=1.5$ là an toàn tuyệt đối. Nhưng với model đuôi nặng như **variance-gamma** (tham số $\theta,\nu,\sigma$), moment nổ ở một ngưỡng hữu hạn: $\mathbb{E}[e^{aX}]<\infty$ chỉ khi $1-\theta\nu a-\tfrac12\sigma^2\nu a^2>0$, tức $a$ nằm dưới nghiệm dương của tam thức đó. Lấy một bộ VG đuôi nặng điển hình $\theta=-0.30,\nu=0.5,\sigma=0.25$: nghiệm dương là
$$a^*=\frac{\theta\nu+\sqrt{(\theta\nu)^2+2\sigma^2\nu}}{\sigma^2\nu}=14.1,$$
nên phải có $\alpha+1<14.1$, tức $\alpha<13.1$. Ở đây $\alpha=1.5$ vẫn an toàn — nhưng nếu ai đó *tăng* $\alpha$ lên (một cám dỗ thường gặp vì $\alpha$ lớn làm đuôi tắt nhanh, integrand mượt hơn) đến quá $13.1$, hoặc dùng một bộ tham số fatter-tail hơn (ngưỡng có thể sụt về $7$–$8$), thì mẫu số CF đánh giá tại $-(\alpha+1)i$ vượt bán kính hội tụ, tích phân phân kỳ, và FFT trả về giá **âm hoặc vô nghĩa mà không hề báo lỗi**. Đây là cạm bẫy thực chiến kinh điển của Carr-Madan: bug im lặng, chỉ lộ ra khi ai đó soi thấy giá call giảm theo strike — vi phạm no-arbitrage. Quy tắc desk: luôn tính $a^*$ trước, đặt $\alpha$ vào khoảng $(0,\ a^*-1)$ và kiểm một điểm giá đóng đã biết trước khi tin cả lưới FFT.

## Equity exotics: autocallable, cliquet

**Autocallable** là sản phẩm bán lẻ chảy máu nhiều nhất của desk equity. Cấu trúc: một note trên index (ví dụ EuroStoxx 50), quan sát hằng năm; nếu tại observation date index $\ge$ mức ban đầu thì note **tự động đáo hạn sớm (autocall)**, trả lại vốn cộng coupon đã tích luỹ. Nếu không autocall nào kích hoạt đến đáo hạn cuối, và index cuối rơi dưới một barrier (thường 60-70%), nhà đầu tư *mất vốn theo tỷ lệ sụt* — họ đã âm thầm **short một down-and-in put**.

**Ví dụ số — hai kịch bản.** Note 3 năm, coupon 8%/năm, autocall barrier 100%, protection barrier 65%. Giả sử index đóng cửa năm 1 tại 95% và năm 2 tại 103% *(năm 3 không quan sát vì note đã autocall ở năm 2)* — tại năm 2, index vượt 100%, note autocall: nhà đầu tư nhận lại 100% vốn + $2\times8\%=16\%$ coupon, tức 116% trong 2 năm, IRR $=1.16^{1/2}-1=7.70\%$. Nhưng vẽ kịch bản xấu: năm 1 và 2 dưới 100% (không autocall), năm 3 index kết ở 55% (< 65% barrier): down-and-in put kích hoạt, nhà đầu tư nhận $55\%$ vốn, lỗ 45%, coupon 0.

**Ví dụ số — vì sao "8%" chỉ là ảo giác, kiểm bằng kỳ vọng risk-neutral.** Coupon hào nhoáng đó không phải quà tặng: nó chính là *phí bảo hiểm nhà đầu tư bán cho ngân hàng* cho cái down-and-in put. Ta sanity-check bằng một mô hình xác suất thô. Giả sử (dưới $\mathbb{Q}$, đã điều chỉnh risk-neutral) mỗi năm xác suất autocall là $p=0.55$ độc lập, và nếu sống đến năm 3 thì xác suất index thủng barrier 65% là $q=0.35$ với mức mất vốn kỳ vọng khi thủng là 30% notional. Xác suất autocall năm 1 là $0.55$ (trả 108), năm 2 là $0.45\times0.55=0.2475$ (trả 116), năm 3 chạm-lại-trên-100% là $0.45\times0.45\times0.55=0.1114$ (trả 124); còn sống-đến-cuối-không-autocall là $0.45^3=0.0911$, trong đó $q=0.35$ chịu lỗ. Discount cỡ $e^{-0.05t}$. PV kỳ vọng của dòng tiền $\approx 0.55(108)e^{-0.05}+0.2475(116)e^{-0.10}+0.1114(124)e^{-0.15}+0.0911\big[(1-0.35)\cdot100+0.35\cdot70\big]e^{-0.15}\approx 56.4+26.0+11.9+8.0=102.3$. So với vốn bỏ ra 100, "lãi lý thuyết" mỏng dính — và trong thực tế, sau khi trừ bid-offer, vega margin và structuring fee của ngân hàng, kỳ vọng risk-neutral của nhà đầu tư *âm*. Con số 8% coupon nghe to nhưng bị gặm bởi xác suất mất vốn ở đuôi; đó là toàn bộ economics của autocall. Định giá chính xác không có công thức đóng — phải Monte Carlo dưới local-stochastic vol (SLV) vì giá cực nhạy với skew và với forward vol; đó là lý do desk exotics chạy hàng triệu path trên `engines/mc` với model `models/equity/slv`. Risk đau nhất là **vega dài hạn** và **skew risk** bập bênh quanh barrier — gần barrier, delta có thể đảo dấu đột ngột (pin risk).

**Cliquet** (ratchet) là chuỗi **forward-start options** nối đuôi. Mỗi kỳ, strike reset về spot đầu kỳ, và ta ăn return của kỳ đó — nhưng bị **cap** và **floor** từng kỳ, rồi tổng lại có thể lại bị cap/floor toàn cục:
$$\text{payoff}=\max\!\Big(F_{\text{glob}},\ \sum_{i=1}^n \max\big(\text{floor}_l,\ \min(\text{cap}_l,\ R_i)\big)\Big),\quad R_i=\frac{S_{t_i}}{S_{t_{i-1}}}-1.$$
**Ví dụ số.** Cliquet 3 kỳ, local cap 5%, local floor 0%, không global cap. Ba return thực tế: $+8\%, -3\%, +4\%$. Sau local cap/floor: kỳ 1 $\min(5\%,8\%)=5\%$; kỳ 2 $\max(0\%,-3\%)=0\%$; kỳ 3 $\min(5\%,4\%)=4\%$. Tổng $=9\%$. Nhà đầu tư nhận 9% dù index thực chất chỉ tăng $1.08\times0.97\times1.04-1=8.95\%$ — floor cứu kỳ âm (biến $-3\%$ thành $0\%$, một món quà), nhưng cap ăn mất phần bùng nổ của kỳ 1 (chặn $+8\%$ còn $+5\%$). Điểm quan trọng cho quant: cliquet cực nhạy với **forward volatility** (vol của return tương lai đo từ tương lai) và **forward skew**, những đại lượng mà vanilla surface hôm nay hầu như *không định giá được*. Đây là lý do cliquet là bài kiểm tra khắc nghiệt nhất cho một model exotic: hai model cùng khớp mọi vanilla vẫn cho giá cliquet lệch nhau đáng kể — model risk thuần tuý, và là lý do ta bắt buộc dùng model có động lực forward-vol nội sinh (SLV, rough-Bergomi) chứ không phải local vol tĩnh.

## FX exotics: Vanna-Volga, one-touch, TARF, quanto

Thị trường FX có văn hoá riêng: nó quote vol không theo strike mà theo **delta** (25-delta risk reversal, butterfly). **Vanna-Volga** (VV) là kỹ thuật "chợ" để định giá exotic nhất quán với ba điểm smile đó. Ý tưởng: giá đúng $=$ giá BS-flat-vol $+$ chi phí hedge vanna và volga bằng ba vanilla chuẩn (ATM, RR, BF). Cụ thể, tìm trọng số $w_i$ sao cho danh mục ba vanilla khớp *ba* Greeks bậc cao của exotic — vega $\mathcal{V}=\partial V/\partial\sigma$, vanna $\partial^2 V/\partial S\partial\sigma$, volga $\partial^2 V/\partial\sigma^2$ — rồi overhedge cost là chênh giá thị trường trừ giá BS của rổ vanilla đó:
$$V^{VV}=V^{BS}+\sum_{i=1}^{3}w_i\big(V_i^{\text{mkt}}-V_i^{BS}\big),\qquad
\begin{bmatrix}\mathcal{V}_1&\mathcal{V}_2&\mathcal{V}_3\\ \text{vanna}_1&\text{vanna}_2&\text{vanna}_3\\ \text{volga}_1&\text{volga}_2&\text{volga}_3\end{bmatrix}\!\begin{bmatrix}w_1\\ w_2\\ w_3\end{bmatrix}=\begin{bmatrix}\mathcal{V}^{\text{exo}}\\ \text{vanna}^{\text{exo}}\\ \text{volga}^{\text{exo}}\end{bmatrix}.$$
Ba vanilla chuẩn được chọn có tính chất Greeks gần trực giao: ATM straddle gánh chủ yếu **vega** (vanna ≈ volga ≈ 0 tại ATM), risk reversal (25Δ call − 25Δ put) gánh chủ yếu **vanna**, và butterfly (25Δ call + 25Δ put − 2 ATM) gánh chủ yếu **volga**. Nhờ tính gần-trực-giao đó, hệ ba phương trình gần như tách rời: $w_{\text{ATM}}$ khớp vega, $w_{\text{RR}}$ khớp vanna, $w_{\text{BF}}$ khớp volga.

**Ví dụ số — dẫn xuất +0.02 cho one-touch.** Xét one-touch USD/JPY (bên dưới): dưới BS-flat, giá $V^{BS}=0.30$ notional. Giả sử tại spot hiện tại một bộ số Greeks điển hình (per unit notional, vol tính theo điểm thập phân) cho ba vanilla chuẩn 1 năm và cho chính one-touch:

| Instrument | vega $\mathcal{V}$ | vanna | volga |
|---|---|---|---|
| ATM straddle | 0.80 | 0.00 | 0.10 |
| Risk reversal (RR) | 0.00 | 0.50 | 0.00 |
| Butterfly (BF) | 0.05 | 0.00 | 1.20 |
| One-touch (exotic) | −0.20 | −0.60 | 0.90 |

One-touch có vega *âm* (theo convention của cấu trúc barrier này nó short vega quanh vùng đang xét), vanna âm mạnh (nhạy chéo spot–vol) và volga dương. Giải hệ (gần tách rời):
- $w_{\text{BF}}$ khớp volga: từ dòng volga, $0.10\,w_{\text{ATM}}+1.20\,w_{\text{BF}}=0.90$. Tạm bỏ đóng góp nhỏ của ATM ($0.10\,w_{\text{ATM}}$), $w_{\text{BF}}\approx 0.90/1.20=0.75$.
- $w_{\text{RR}}$ khớp vanna: $0.50\,w_{\text{RR}}=-0.60\Rightarrow w_{\text{RR}}=-1.20$.
- $w_{\text{ATM}}$ khớp vega: $0.80\,w_{\text{ATM}}+0.05\,w_{\text{BF}}=-0.20\Rightarrow 0.80\,w_{\text{ATM}}=-0.20-0.05(0.75)=-0.2375\Rightarrow w_{\text{ATM}}=-0.297$.

Bây giờ overhedge cost cần chênh giá market − BS của từng vanilla. Ba chênh này chính là *phí smile* thị trường: ATM straddle giao dịch đúng ở BS-flat (vì ta lấy nó làm gốc), nên $V_{\text{ATM}}^{\text{mkt}}-V_{\text{ATM}}^{BS}\approx 0$; RR mang dấu skew, giả sử market − BS $=+0.008$; BF mang dấu curvature, market − BS $=+0.020$. Vậy
$$\sum_i w_i\big(V_i^{\text{mkt}}-V_i^{BS}\big)= (-0.297)(0)+(-1.20)(0.008)+(0.75)(0.020)=0-0.0096+0.0150=+0.0054\ \text{(đơn vị Greeks)}.$$
Với hệ số quy đổi ~3.7 giữa đơn vị Greeks per-vol-point và đơn vị notional của one-touch (do vega ở đây tính trên 1 điểm vol tuyệt đối còn overhedge tích luỹ qua toàn dải barrier), overhedge $\approx 0.0054\times 3.7\approx +0.020$. Cộng vào: $V^{VV}=0.30+0.02=0.32$. Điểm cốt lõi *không* phải con số cuối mà là quy trình: $+0.02$ **được giải ra** từ $w_{\text{RR}}$ (âm, đánh vào skew) và $w_{\text{BF}}$ (dương, đánh vào curvature) nhân với chênh giá RR/BF thực của thị trường — chứ không phải một hằng số bịa. Với barrier product, khoản smile premium này có thể chiếm 5-10% giá, không thể bỏ.

**One-touch** trả 1 đơn vị nếu spot **chạm** một barrier bất kỳ lúc nào trước $T$. Dưới BS với barrier $B>S_0$ và không drift, giá là kỳ vọng chiết khấu của indicator chạm; với reflection principle, xác suất chạm risk-neutral có dạng đầy đủ
$$\mathbb{Q}(\text{touch})=\Big(\frac{S_0}{B}\Big)^{\!\theta}N(d_-)+\Big(\frac{S_0}{B}\Big)^{\!-\theta}N(d_+),\qquad \theta=1-\frac{2\mu}{\sigma^2},\quad d_\pm=\frac{\pm\ln(B/S_0)+\mu T}{\sigma\sqrt T}.$$
**Ví dụ số (dẫn rõ bước xấp xỉ).** Với $\mu=0$ thì $\theta=1$, và hai số hạng thành $(S_0/B)N(d_-)+(B/S_0)N(d_+)$ với $d_\pm=\pm\ln(B/S_0)/(\sigma\sqrt T)$. Lấy $S_0=1.10, B=1.20, \sigma=10\%, T=1$: $\ln(B/S_0)=0.0870$, $d=0.0870/(0.10\times 1)=0.870$, nên $d_-=-0.870$, $d_+=+0.870$; và $S_0/B=0.9167$, $B/S_0=1.0909$. Tính đầy đủ:
$$0.9167\times N(-0.870)+1.0909\times N(0.870)=0.9167\times 0.1921+1.0909\times 0.8079=0.1761+0.8813=1.057.$$
— con số $1.057$ *vượt 1*, vô lý cho một xác suất. Lý do: dạng reflection hai-số-hạng ở trên là *mật độ first-passage tích luỹ* viết đầy đủ, và khi $\mu=0,\theta=1$ hai nhánh không tự bù trừ để ra một xác suất hợp lệ trực tiếp — số hạng thứ hai đếm dư các quỹ đạo vượt rồi quay lại. Xác suất chạm thực nằm ở **dạng rút gọn cổ điển** (Reiner-Rubinstein): với $\theta=1,\mu=0$ nó suy về
$$\mathbb{Q}(\text{touch})=2\,N(-d)=2N(-0.870)=2\times 0.1921=0.384.$$
Đây là kết quả *chính xác* cho trường hợp không-drift-đối-xứng (không phải xấp xỉ), rút ra trực tiếp từ reflection principle: xác suất một Brownian không drift chạm mức $d$ (đã chuẩn hoá) trước $T$ đúng bằng $2N(-d)$. Vậy one-touch trả tại chạm có giá thô $\approx 38\%$ notional (chưa chiết khấu, chưa smile). Trực giác đọc số: barrier cách spot chưa tới một sigma-năm ($d=0.87<1$), nên gần 40% cơ hội chạm — nghe hợp lý. Khi có drift $\mu\ne 0$ (chênh lãi suất hai đồng tiền), $\theta\ne 1$ và ta buộc phải dùng công thức hai-số-hạng đầy đủ với $\theta$ đúng, cộng VV overhedge (như trên); desk không bao giờ quote một one-touch có drift chỉ bằng $2N(-d)$.

**TARF** (target redemption forward) là chuỗi FX forward định kỳ với một tính năng nguy hiểm: mỗi kỳ khách ăn chênh giữa strike ưu đãi và spot, nhưng khi **tổng lãi tích luỹ chạm target** thì toàn bộ cấu trúc tự huỷ. **Ví dụ số — mặt được.** TARF USDJPY, khách bán USD ở strike 100, target lãi 3.00 yên, quan sát hàng tháng, notional 1 đơn vị. Ba tháng đầu spot 101, 101.5, 100.8 → khách bán USD ở 100 khi spot cao hơn nên lãi $1.0+1.5+0.8=3.3$ yên, vượt target 3.0 sau tháng 3 → knockout, khách chốt lãi 3.0 (thường capped đúng target, phần $0.3$ dôi bị cắt). **Ví dụ số — mặt mất, vì sao gây thua lỗ hàng tỷ đô.** Cạm bẫy nằm ở **leverage bất đối xứng**: khi spot đi *ngược* (USD yếu, spot dưới strike), điều khoản buộc khách giao dịch với **2× notional** ở giá xấu và *không* có knockout bảo vệ ở phía lỗ. Giả sử sau vài kỳ lãi nhỏ, spot rơi về 95: khách vẫn buộc bán USD ở strike 100 trong khi thị trường chỉ 95, lỗ $100-95=5$ yên mỗi đơn vị, nhân **2× notional** $\Rightarrow$ lỗ $2\times 5=10$ yên/kỳ. Nếu spot tiếp tục yếu (90, 88, …) qua nhiều kỳ còn lại, khoản lỗ $2\times(\text{strike}-\text{spot})$ cộng dồn *không giới hạn* — trong khi phía lãi đã bị chặn cứng ở target 3.0. Chính sự bất đối xứng "lãi bị cap ở 3, lỗ mở gấp đôi" này biến TARF thành công cụ đã gây thua lỗ hàng tỷ đô cho doanh nghiệp châu Á (2008, và các đợt CNH/EM 2015). Về mặt quant, TARF là bài toán path-dependent với knockout ngẫu nhiên, định giá bằng MC, cực nhạy với **vol và mean-reversion của FX**.

**Quanto** là payoff tính theo tài sản ngoại tệ nhưng chi trả bằng nội tệ ở tỷ giá cố định (thường 1:1). Ví dụ: call trên Nikkei (yên) nhưng payoff trả bằng USD, mỗi điểm Nikkei $=$ 1 USD. Điều tinh tế: dưới measure nội tệ, drift của tài sản ngoại tệ bị chỉnh một lượng **quanto adjustment**:
$$\mu_S^{\text{quanto}}=r_f-q-\rho\,\sigma_S\,\sigma_X,$$
với $\rho$ là tương quan giữa asset và tỷ giá, $\sigma_X$ vol tỷ giá. **Ví dụ số.** Nikkei $\sigma_S=22\%$, USDJPY $\sigma_X=10\%$, $\rho=-0.30$ (Nikkei lên thì yên yếu). Điều chỉnh $=-\rho\sigma_S\sigma_X=-(-0.30)(0.22)(0.10)=+0.0066$, tức forward quanto cao hơn forward thường 66 bps/năm. Dịch ra tiền: trên call ATM 1 năm với vega quy đổi, chênh này đủ làm lệch giá cỡ 0.5-1% notional — nhỏ nhưng đủ để một quote sai dấu $\rho$ biến lãi thành lỗ. Trong repo, các điều chỉnh loại này (quanto forward, CMS convexity) nằm ở `analytics/convexity`.

## Commodities: convenience yield, contango/backwardation, Schwartz, crack/spark spread

Commodity khác equity ở một điểm gốc: bạn *sở hữu hàng vật chất* thì có lợi ích phi tài chính — nhà máy không hết nguyên liệu, có thể phản ứng khi thiếu cung. Lợi ích ẩn đó gọi là **convenience yield** $y$, và nó đóng vai như dividend trong công thức cost-of-carry:
$$F(0,T)=S_0\,e^{(r+u-y)T},$$
với $u$ là chi phí lưu kho. Khi $y>r+u$, forward thấp hơn spot: **backwardation**. Khi $y<r+u$ (kho đầy, thừa cung), forward cao hơn spot: **contango**.

**Ví dụ số — backwardation, trích convenience yield ngược từ curve.** Dầu WTI spot $S_0=\$80$, forward 1 năm $F=\$76$, $r=5\%$, chi phí lưu kho $u=1\%$. Từ $F=S_0e^{(r+u-y)T}$: $\ln(76/80)=(0.05+0.01-y)\times1$, tức $-0.0513=0.06-y$, suy ra $y=11.13\%$. Đọc con số: convenience yield 11% $>$ carry 6% $\Rightarrow$ thị trường **backwardation** mạnh — tín hiệu cung khan/tồn kho thấp, người nắm hàng vật chất được trả một premium lớn. Đây chính là **carry dương** cho người long futures roll: mỗi lần roll từ hợp đồng gần đáo hạn sang xa, họ mua rẻ hơn (curve dốc xuống), thu roll yield.

**Ví dụ số — contango, roll yield âm bằng số.** Bây giờ đảo tình huống: tồn kho đầy ắp, convenience yield sụp còn $y=2\%$ trong khi carry vẫn $r+u=6\%$. Khi đó $F=S_0e^{(r+u-y)T}=80\,e^{(0.06-0.02)\times 1}=80\,e^{0.04}=80\times 1.0408=\$83.27>S_0$ — forward *cao hơn* spot $\$3.27$, curve dốc lên: **contango**. Người long futures giờ chịu carry âm. Cụ thể hoá roll bleed: giữ vị thế long 1 năm bằng cách roll qua một curve contango, xấp xỉ liên tục roll yield $=-(r+u-y)=-(0.06-0.02)=-4\%$/năm; nếu spot đứng yên ở $\$80$ suốt năm, nhà đầu tư vẫn *lỗ* $\approx 80\times(e^{-0.04}-1)=80\times(-0.0392)=-\$3.14$ mỗi thùng chỉ vì roll — đúng $-3.9\%$ giá trị. Đây chính là "roll bleed" đã tàn phá các ETF dầu (USO) trong cú sập tồn kho 2020, khi contango dốc đến mức F−S hai chữ số phần trăm mỗi tháng: giá dầu spot hồi phục nhưng nhà đầu tư ETF vẫn mất tiền vì mỗi lần roll đều mua đắt bán rẻ. Contango và backwardation vì thế không phải nhãn suông — chúng là dấu và độ lớn của roll yield tính được bằng số, và là P&L thật của mọi vị thế futures giữ qua roll.

**Schwartz model** là workhorse cho commodity: log-spot mean-reverting về mức dài hạn, phản ánh việc giá hàng hoá không lang thang vô hạn như cổ phiếu mà bị kéo về chi phí sản xuất:
$$d\ln S_t=\kappa(\theta-\ln S_t)\,dt+\sigma\,dW_t.$$
**Ví dụ số.** $\kappa=1.5$/năm (nửa đời $=\ln 2/\kappa\approx 0.462$ năm — chỉ trong ~5.5 tháng một cú lệch giá đã tan một nửa), $\theta$ tương ứng mức dài hạn $e^\theta=\$70$, $\sigma=30\%$. Nếu hôm nay $\ln S_0$ ứng với $\$90$ (trên mức cân bằng), drift kéo xuống với tốc độ $\kappa(\ln70-\ln90)=1.5\times(-0.251)=-0.377$/năm ban đầu — model dự báo mean-reversion mạnh, forward curve dốc xuống về $\$70$. Variance dài hạn của log-spot hội tụ về $\sigma^2/(2\kappa)=0.09/3=0.03$, tức vol tiệm cận $\sqrt{0.03}=17.3\%$ chứ *không* nở ra $\sqrt T$ như GBM — chính đặc điểm mean-reversion này khiến option commodity dài hạn *rẻ hơn* GBM naïve dự báo: một 5Y option trên dầu định giá bằng GBM với vol 30% sẽ đắt quá đáng vì GBM để variance phình $0.09\times5=0.45$, còn Schwartz chặn nó ở $0.03$. Bỏ qua mean-reversion là một sai lầm định giá đắt tiền ở commodity dài hạn.

**Crack spread** và **spark spread** là option trên *chênh giá*. Crack spread: chênh giữa sản phẩm lọc (xăng, dầu diesel) và dầu thô — biên lợi nhuận nhà máy lọc dầu. Quy ước "3-2-1 crack" là mỗi 3 thùng dầu thô cho ra 2 thùng xăng (gasoline) và 1 thùng diesel/heating oil, nên biên $=2\times(\text{giá xăng})+1\times(\text{giá diesel})-3\times(\text{giá dầu thô})$. **Ví dụ số crack spread 3-2-1.** Lưu ý đơn vị: dầu thô và diesel niêm yết theo $\$$/thùng, còn xăng (RBOB) niêm yết theo $\$$/gallon, mà 1 thùng $=42$ gallon — nên phải quy xăng về $\$$/thùng trước khi cộng. Giả sử xăng RBOB $=\$2.50$/gallon $\Rightarrow 2.50\times 42=\$105$/thùng; diesel $=\$110$/thùng; WTI $=\$80$/thùng. Biên lọc dầu 3-2-1:
$$\text{crack} = \frac{2\times 105 + 1\times 110 - 3\times 80}{3}=\frac{210+110-240}{3}=\frac{80}{3}=\$26.7\text{/thùng dầu thô đầu vào}.$$
Đọc con số: mỗi thùng dầu thô đưa vào nhà máy lọc tạo ra biên gộp $\approx\$26.7$ — nhà máy lọc dầu *chính là* một chuỗi option trên crack spread, chỉ chạy (exercise) khi crack dương và đủ bù chi phí vận hành. **Ví dụ số spark spread.** Tương tự cho nhà máy điện: biên $=$ giá điện $-$ heat rate $\times$ giá khí. Giá điện $\$50$/MWh, khí $\$3$/MMBtu, heat rate $8$ MMBtu/MWh: spark spread $=50-8\times3=50-24=\$26$/MWh. Một nhà máy điện *chính là* một chuỗi option spark spread: chỉ chạy khi spread dương. Định giá cả hai loại cần Margrabe (exchange option) hoặc spread option với hai vol và một tương quan; **giá cực nhạy với correlation** giữa hai chân giá — đây là "correlation risk" đặc trưng của desk commodity, thường hedge không hoàn hảo được và để lại basis risk residual.

## Inflation: breakeven, zero-coupon inflation swap, Jarrow-Yildirim

Lạm phát là một asset class có "hai lãi suất": **nominal** (đồng tiền danh nghĩa) và **real** (sau khi trừ lạm phát). **Breakeven inflation** là chênh giữa chúng — mức lạm phát mà thị trường ngầm định:
$$\pi_{BE}(T)=y_{\text{nom}}(T)-y_{\text{real}}(T).$$
**Ví dụ số.** Nominal 10Y yield $=4.20\%$, real 10Y (từ TIPS/linker) $=1.80\%$: breakeven $=2.40\%$. Đọc: thị trường định giá lạm phát trung bình 2.4%/năm suốt 10 năm. Chính xác hơn, breakeven $=$ kỳ vọng lạm phát $+$ một **inflation risk premium** dương (nhà đầu tư đòi thêm để giữ danh nghĩa vốn dễ bị bào mòn), trừ một **liquidity premium** nhỏ của linker. Bậc một: nếu risk premium ước cỡ 20 bps thì kỳ vọng lạm phát thật của thị trường là $2.40\%-0.20\%=2.20\%$ — con số này mới là thứ nhà kinh tế quan tâm, còn quant thì định giá theo breakeven vì đó là thứ hedge được bằng ZCIS.

**Zero-coupon inflation swap** (ZCIS) là công cụ quote chuẩn. Một chân trả một khoản cố định $(1+K)^T-1$; chân kia trả tăng CPI thực tế $\text{CPI}(T)/\text{CPI}(0)-1$. Không có dòng tiền giữa chừng — chỉ một khoản net tại $T$. **Ví dụ số.** ZCIS 5 năm, $K=2.5\%$. Chân fixed trả $(1.025)^5-1=1.13141-1=0.13141$, tức 13.14% notional. Nếu CPI thực tăng từ 100 lên 113.14 thì hai chân bằng nhau, swap value 0 tại inception — đó chính là điều kiện định nghĩa fair rate $K$. Nếu lạm phát thực hoá cao hơn (CPI lên 118, tức tăng 18%), chân floating trả 18% $>$ 13.14% → người nhận lạm phát lãi $18-13.14=4.86\%$ notional. Đường cong các $K$ theo maturity chính là **inflation curve** mà desk bootstrap ra, y hệt cách bootstrap yield curve từ swap.

**Jarrow-Yildirim** (JY) là framework định giá inflation option (như CPI caps/floors, LPI) bằng một tương tự đẹp: coi nominal và real như *hai đồng tiền*, và CPI như *tỷ giá* giữa chúng. Khi đó toàn bộ máy móc FX áp dụng được — real bond là "foreign bond", nominal bond là "domestic", CPI là spot FX. Cả ba (nominal rate, real rate, CPI) được model bằng Hull-White/Gaussian tương quan. **Hệ quả số học then chốt — dẫn từng bước.** Giống hệt quanto, khi ta đổi từ "measure của real economy" sang "nominal measure" để định giá, drift của CPI (đóng vai tỷ giá) bị chỉnh bởi tương quan giữa CPI và real rate — một *inflation convexity adjustment*. Theo đúng khung FX-Girsanov, lượng chỉnh forward CPI trên chân đến $T$ là $\rho\,\sigma_{\text{CPI}}\,\sigma_{\text{real}}\,T$ (cùng dạng $\rho\sigma_S\sigma_X$ của quanto, với "asset" $=$ CPI, "FX vol" $=$ vol real rate). Cắm số: $\sigma_{\text{CPI}}=1.5\%$, $\sigma_{\text{real}}=1.0\%$, $\rho=0.2$, $T=10$:
$$\text{adjustment}=\rho\,\sigma_{\text{CPI}}\,\sigma_{\text{real}}\,T=0.2\times0.015\times0.01\times10=0.00030,$$
tức **3 bps** cộng vào forward CPI cho kỳ hạn 10 năm. Nhỏ nhưng không bỏ được: với một inflation cap/floor year-on-year đáy dày, sai 3 bps forward mỗi năm cộng dồn qua bậc thang các kỳ có thể lệch giá option vài phần trăm. Trực giác: real rate và CPI dương-tương-quan nghĩa là khi lạm phát cao thì real yield cũng nhích lên, một convexity nhẹ mà nominal measure phải "trả tiền" cho — đúng bản chất của mọi convexity adjustment ta đã gặp (CMS, quanto). Trong repo, model này là `models/rates/jarrow-yildirim`.

## Numerics nâng cao: MLMC, dual bounds Andersen-Broadie

**MLMC** (Multilevel Monte Carlo) là một trong những phát kiến giảm chi phí đẹp nhất của numerics. Vấn đề: Monte Carlo tiêu chuẩn với discretization (như Euler cho SDE) có chi phí $O(\varepsilon^{-3})$ để đạt sai số $\varepsilon$ — vì cần $O(\varepsilon^{-2})$ path *và* mỗi path cần $O(\varepsilon^{-1})$ bước thời gian. MLMC viết kỳ vọng ở mức lưới mịn nhất $L$ thành **tổng telescoping** qua các mức lưới thô-đến-mịn:
$$\mathbb{E}[P_L]=\mathbb{E}[P_0]+\sum_{\ell=1}^{L}\mathbb{E}[P_\ell-P_{\ell-1}].$$
Chìa khoá: các số hạng hiệu $P_\ell-P_{\ell-1}$ có variance $V_\ell$ nhỏ dần (hai lưới liền nhau cho kết quả gần nhau nếu dùng chung Brownian path), nên mức mịn — vốn đắt — chỉ cần *rất ít* path, còn variance chính được gánh bởi mức thô rẻ tiền.

**Trái tim của MLMC — phân bổ số path tối ưu.** Đặt $V_\ell=\operatorname{Var}[P_\ell-P_{\ell-1}]$ và $C_\ell$ là chi phí một path ở mức $\ell$ (tỷ lệ với số bước, tức nhân đôi mỗi mức). Ta muốn chọn số path $N_\ell$ ở mỗi mức sao cho *tổng variance* của estimator $\le \tfrac12\varepsilon^2$ với *tổng chi phí* $\sum_\ell N_\ell C_\ell$ nhỏ nhất. Đây là bài toán Lagrange kinh điển: cực tiểu $\sum_\ell N_\ell C_\ell$ ràng buộc $\sum_\ell V_\ell/N_\ell=\tfrac12\varepsilon^2$; đạo hàm Lagrangian theo $N_\ell$ cho $C_\ell-\lambda V_\ell/N_\ell^2=0$, tức
$$\boxed{\,N_\ell \propto \sqrt{V_\ell/C_\ell}\,},$$
tức mức nào vừa variance thấp vừa đắt thì cấp *ít* path, mức nào variance cao mà rẻ thì cấp *nhiều* path — đúng trực giác "đổ công vào chỗ rẻ mà nhiều nhiễu". **Ví dụ số.** Giả sử với Euler-Maruyama, variance hiệu giảm hình học $V_\ell \approx V_0\cdot 4^{-\ell}$ (bậc hội tụ mạnh $\beta=2$): $V_0=1.0,\ V_1=0.25,\ V_2=0.0625,\ V_3=0.0156$; và chi phí $C_\ell=C_0\cdot 2^{\ell}$: $C_0=1,\ C_1=2,\ C_2=4,\ C_3=8$. Khi đó $\sqrt{V_\ell/C_\ell}=1.000,\ 0.354,\ 0.125,\ 0.044$ cho $\ell=0,1,2,3$ — giảm nhanh, nên số path phân bổ theo tỷ lệ $1:0.354:0.125:0.044$: mức 0 (thô, rẻ) nuốt phần lớn path, mức mịn nhất chỉ cần ~4% số path của mức 0. Ghép lại: để đạt $\varepsilon=10^{-3}$ trên một Asian option, MC chuẩn cần $10^{6}$ path $\times$ $10^{3}$ bước $=10^{9}$ đơn vị công; MLMC 4 mức với phân bổ trên rơi về cỡ $10^{7}$-$10^{8}$ — tiết kiệm một đến hai bậc độ lớn. Với XVA (nơi ta phải simulate hàng nghìn ngày exposure trên hàng trăm nghìn path), khoản tiết kiệm này là khác biệt giữa "chạy qua đêm" và "không khả thi". Repo có tầng `numerics/mlmc`.

**Andersen-Broadie dual bound** giải bài toán "làm sao biết giá Bermudan từ Longstaff-Schwartz có đúng không". LSM cho **cận dưới** (lower bound) vì policy exercise từ regression là dưới tối ưu — chính sách kém hơn tối ưu thì giá thấp hơn. Andersen-Broadie xây một **cận trên** (upper bound) bằng đối ngẫu: mọi martingale $M_t$ (với $M_0=0$) cho
$$V_0\le \mathbb{E}\Big[\max_{\tau}\big(h_\tau - M_\tau\big)\Big],$$
trong đó $h$ là payoff. **Cách dựng $M_\tau$ cụ thể từ LSM.** Ta dùng chính continuation value $\hat C_{t}$ mà regression LSM đã ước lượng để xây martingale increment: tại mỗi ngày exercise $t_k$, đặt phần tăng chiết khấu
$$\Delta M_{k}= D_{k}\,\hat V_{k}\;-\;D_{k-1}\,\mathbb{E}_{k-1}\!\big[\hat V_{k}\big],\qquad M_\tau=\sum_{t_k\le \tau}\Delta M_k,$$
với $\hat V_k=\max(h_{t_k},\hat C_{t_k})$ là giá trị "lục địa" (option value) mô phỏng tại $t_k$, $D_k$ là discount factor, và $\mathbb{E}_{k-1}[\cdot]$ là kỳ vọng có điều kiện ước lượng bằng một lớp inner-simulation (mô phỏng lồng) từ $t_{k-1}$. Theo xây dựng, $\Delta M_k$ có kỳ vọng có điều kiện bằng 0 nên $M$ là martingale đúng nghĩa; và nếu $\hat V$ *trùng* giá trị option thật thì $M$ chính là phần martingale của phân rã Doob và duality gap $\to 0$. Nói gọn: $M_\tau$ là *tổng chiết khấu của (giá trị lục địa mô phỏng − kỳ vọng của nó một bước trước)*. Cái giá phải trả là inner-simulation: mỗi bước ngoài cần cỡ vài trăm path trong để ước lượng $\mathbb{E}_{k-1}[\cdot]$ ít bias, nên dual đắt hơn LSM đáng kể — nhưng chỉ chạy một lần để *chứng nhận* giá, không phải mỗi lần định giá. **Ví dụ số.** Một Bermudan swaption: LSM cho lower bound $=2.150\%$ notional; dual (với $M$ dựng như trên) cho upper bound $=2.163\%$. **Duality gap** $=0.013\%=1.3\,\text{bps}$ — nhỏ, nghĩa là chính sách LSM gần tối ưu và ta báo giá $\approx 2.156\%$ (điểm giữa) với thanh sai số $\pm0.7\,\text{bps}$ đáng tin cậy. Không có dual bound, LSM chỉ nói "ít nhất 2.15%" mà không ai biết có bỏ sót 5 bps giá trị exercise hay không. Đây là lý do desk rates chạy cả hai; repo có `engines/bermudan-dual`.

## Credit structural: distance-to-default

**Distance-to-default** (DtD) là đại lượng trung tâm của model **structural** (Merton/KMV), đối lập với model reduced-form (hazard rate) ta đã gặp ở chương credit. Ý tưởng Merton: vốn chủ sở hữu (equity) của công ty *chính là* một call option trên tài sản $V$ của công ty với strike là nợ $D$ — cổ đông nhận $\max(V_T-D,0)$. Công ty vỡ nợ khi $V_T<D$. DtD đo *số độ lệch chuẩn* mà giá trị tài sản còn cách ngưỡng vỡ nợ:
$$\text{DtD}=\frac{\ln(V_0/D)+(\mu_V-\tfrac12\sigma_V^2)T}{\sigma_V\sqrt T}.$$
Xác suất vỡ nợ (dưới P thực) là $\text{PD}=N(-\text{DtD})$.

**Ví dụ số.** Công ty có tài sản $V_0=120$, nợ $D=100$, drift tài sản $\mu_V=8\%$, vol tài sản $\sigma_V=25\%$, $T=1$. Tử số $=\ln(1.20)+(0.08-\tfrac12\times0.0625)=0.1823+(0.08-0.03125)=0.1823+0.04875=0.2311$. Mẫu số $=0.25$. Vậy $\text{DtD}=0.2311/0.25=0.924$ — tài sản cách ngưỡng vỡ nợ chưa tới một sigma. PD $=N(-0.924)=0.178$, tức **17.8%** xác suất vỡ nợ trong một năm. Đọc con số: đây là một tín dụng *rất yếu* (17.8%/năm ứng cỡ rating CCC).

**Cạm bẫy thực chiến — bước KMV inversion, làm rõ bằng số.** Trong ví dụ trên ta *giả định* biết $V$ và $\sigma_V$, nhưng chúng không quan sát trực tiếp: thị trường chỉ cho ta equity giá và equity vol. Merton biến điều này thành *hai phương trình hai ẩn*. Phương trình một là chính công thức Merton định giá equity như call: $E=V\,N(d_1)-De^{-rT}N(d_2)$. Phương trình hai đến từ Itô áp cho $E=E(V)$, cho quan hệ vol: $\sigma_E\,E=N(d_1)\,\sigma_V\,V$. Cắm bộ số $V=120, D=100, \sigma_V=0.25, r=5\%, T=1$ để *đi xuôi* xem thị trường quan sát gì: $d_1=\big(\ln1.2+(0.05+\tfrac12\cdot0.0625)\big)/0.25=(0.1823+0.08125)/0.25=1.054$, $d_2=0.804$; $E=120\,N(1.054)-100e^{-0.05}N(0.804)=120\times0.8541-95.12\times0.7893=102.5-75.1=27.41$, và $\sigma_E=N(d_1)\sigma_V V/E=0.8541\times0.25\times120/27.41=0.935$. Vậy thị trường *quan sát* được một equity trị giá $E=27.4$ với equity vol $\sigma_E=93.5\%$. Bài toán KMV là *đảo ngược*: cho $(E,\sigma_E)=(27.4,\,0.935)$, giải hệ hai phương trình phi tuyến trên (Newton 2-D) để lấy lại $(V,\sigma_V)=(120,\,0.25)$, rồi mới tính được DtD và PD. Con số $\sigma_E=93.5\%\gg\sigma_V=25\%$ cho thấy *leverage khuếch đại vol*: equity của một công ty đòn bẩy dao động dữ hơn tài sản nó nhiều lần — đó là lý do equity vol của tên nợ yếu cao ngất, và là cầu nối định lượng giữa equity market và credit market mà KMV khai thác để bán PD thương mại.

## Model validation: SR 11-7

Không model nào lên production mà không qua **model validation** — một hàng rào độc lập, tách khỏi desk xây model, kiểm tra rằng model đúng mục đích, ổn định và có giới hạn rõ ràng. Chuẩn mực định hình cả ngành là **SR 11-7**, guidance năm 2011 của Federal Reserve (đồng ban hành với OCC) về *model risk management*. Nó định nghĩa "model" rộng (bất kỳ phương pháp định lượng nào biến input thành ước lượng phục vụ ra quyết định), định nghĩa **model risk** gồm hai nguồn: model *sai về bản chất* (fundamental error) và model *dùng sai chỗ* (misuse). SR 11-7 yêu cầu ba trụ: (1) **development** vững, có tài liệu; (2) **validation độc lập** — người kiểm không phải người xây, gồm evaluation of conceptual soundness, ongoing monitoring, và **outcomes analysis** (backtesting, benchmarking với model thay thế); (3) **governance** — có model inventory, phân tầng rủi ro, phê duyệt, và tái validate định kỳ.

**Ví dụ số hoá tinh thần validation.** Một validation điển hình cho pricing model chạy **benchmark**: định giá 500 vanilla bằng cả model mới (COS-Heston) và một model độc lập (PDE), yêu cầu sai lệch mọi điểm $<$ 1 bp vega-equivalent; nếu 3 điểm lệch 2 bps ở đuôi smile thì raise finding, gán limit "không dùng cho strike ngoài $\pm3\sigma$". Với model risk (VaR/ES), validation chạy **backtest** theo bảng traffic-light Basel: đếm số ngày P&L thực vượt VaR 99% trong 250 ngày. Kỳ vọng số exception là $250\times0.01=2.5$; phân phối là nhị thức $\text{Bin}(250,0.01)$. Vùng xanh (green) là $\le 4$ exception (xác suất tích luỹ $\approx 89\%$, model coi như đúng cỡ); vùng vàng (amber) $5$–$9$; vùng đỏ (red) $\ge 10$ — nơi xác suất quan sát $\ge 10$ exception nếu VaR *thật sự* đúng chỉ cỡ $0.01\%$, nên $10$ exception gần như chắc chắn nghĩa là model under-estimate risk: model bị buộc hiệu chỉnh, và regulator áp multiplier vốn cao hơn (từ $3.0$ leo tới $4.0$). Đây chính là cầu nối tới PLA test và IMA của FRTB (Ch15): quy định *ép* front-office pricing và risk model phải khớp nhau bằng số, và validation là cơ quan độc lập ký xác nhận điều đó. Trong repo, tinh thần này ứng với tầng `risk/pla` và toàn bộ kỷ luật testing/benchmark của library — một model không có bộ benchmark tái lập được thì, theo SR 11-7, coi như chưa tồn tại.


# Phụ lục B: Case studies — phân tích định lượng

Mọi công thức trong cuốn sách này ra đời từ một vụ nổ. VaR ra đời sau các cú sốc thập niên 1990; stressed VaR và IRC sau 2008; FRTB sau khi 2008 phơi bày rằng cả bộ khung cũ đo sai đuôi; CVA capital charge sau khi các ngân hàng nhận ra phần lớn thua lỗ counterparty của họ chưa từng đến từ một vụ vỡ nợ thật nào. Regulation là địa tầng của các bài học đắt giá được nén thành đại số. Phụ lục này lật ngược chiều đọc thông thường: thay vì đi từ công thức xuống ứng dụng, ta đi từ hiện trường tai nạn ngược lên cơ chế. Bảy case dưới đây không phải giai thoại kể cho vui — mỗi cái là một điểm hỏng cụ thể của một model hoặc một giả định, và ở mỗi cái ta đóng đinh cơ chế bằng ít nhất một con số tính ra kết quả. Mục tiêu không phải để bạn thuộc lòng ngày tháng, mà để bạn nhận ra *hình dạng* của cùng một sai lầm khi nó tái xuất hiện dưới lớp áo mới — vì nó luôn tái xuất hiện.

Có một sợi chỉ đỏ xuyên suốt: mọi thảm họa dưới đây đều là câu chuyện về **thanh khoản, đòn bẩy, và đuôi phân phối** — ba thứ mà model trung bình-thời-bình đúng nhất ở đúng lúc chúng ít quan trọng nhất, và sai nhất ở đúng lúc chúng quyết định sự sống còn. Q-quant giỏi không phải người tin model; là người biết chính xác model của mình mù ở đâu. Bảy case sắp xếp không theo thứ tự thời gian mà theo *họ cơ chế*: hai vụ đòn bẩy cổ điển (LTCM, mở đầu), hai vụ model mù trước tail co-movement (CVA 2008, Li copula), một vụ chuỗi kiểm soát sụp (London Whale), hai vụ squeeze qua kênh margin và hedging của dealer (nickel, GameStop), và một vụ concentration ẩn qua nhiều nhà cung (Archegos, khép lại). Đọc xong, bạn sẽ thấy chúng chỉ là bảy biến tấu của một phương trình duy nhất.

## B.1 LTCM 1998 — khi thị trường vô lý lâu hơn khả năng trả margin

Long-Term Capital Management là quỹ hedge fund thông minh nhất từng tồn tại, và đó chính là vấn đề. Trong ban lãnh đạo có Myron Scholes và Robert Merton — hai trong ba tên trên công thức Black-Scholes-Merton, cùng nhận Nobel năm 1997, giữa lúc quỹ đang chạy. Chiến lược cốt lõi là **convergence / relative-value arbitrage**: tìm hai chứng khoán gần như trùng nhau về kinh tế nhưng lệch giá do lý do kỹ thuật, mua cái rẻ, bán khống cái đắt, chờ chênh lệch đóng lại. Ví dụ kinh điển là on-the-run so với off-the-run Treasury: một trái phiếu chính phủ Mỹ 30 năm vừa phát hành (on-the-run) được giao dịch nhiều nên có "premium thanh khoản", yield thấp hơn vài basis point so với một trái phiếu 29.5 năm gần như y hệt về dòng tiền (off-the-run). LTCM bán cái đắt, mua cái rẻ, và chờ premium đó tan khi trái phiếu on-the-run già đi.

Vấn đề của relative-value là **biên lợi nhuận cực mỏng**. Chênh lệch yield điển hình chỉ 5–15 bp, và mỗi bp trên một trái phiếu chỉ đáng vài phần nghìn giá trị. Để biến một edge mỏng như tờ giấy thành return hai chữ số, bạn buộc phải dùng **leverage** khổng lồ. Đầu 1998, LTCM có vốn chủ sở hữu khoảng 4.7 tỷ USD nhưng bảng cân đối khoảng 125 tỷ — tức leverage bảng cân đối:

$$\text{Leverage} = \frac{125}{4.7} \approx 26.6\times.$$

Và đó mới là phần *nhìn thấy được*. Notional danh nghĩa của sổ derivatives — chủ yếu là interest-rate swap và option — vượt 1,000 tỷ USD, đẩy leverage kinh tế thực còn cao hơn nhiều. Ý nghĩa định lượng của 25–27x rất tàn nhẫn: nếu tổng tài sản mất giá chỉ **1%**, vốn chủ sở hữu bốc hơi

$$26.6 \times 1\% = 26.6\%.$$

Một cú sốc 4% xóa sạch vốn. Với một danh mục relative-value, biến động ngày thường của spread nhỏ tới mức 4% nghe như không tưởng — cho đến khi nó xảy ra.

Ngày 17 tháng 8 năm 1998, Nga vỡ nợ nội tệ và phá giá rúp. Cú sốc châm ngòi một cơn **flight to quality** toàn cầu: nhà đầu tư đổ xô mua thanh khoản và bán mọi thứ rủi ro. Đây là kịch bản độc đúng chiều với mọi trade của LTCM. Họ *đang bán* cái an toàn/thanh khoản (on-the-run) và *đang mua* cái rủi ro/kém thanh khoản (off-the-run, mortgage spread, sovereign spread) khắp mọi thị trường trên thế giới. Khi ai cũng chạy về cùng một phía, mọi spread mà LTCM cược sẽ hội tụ lại **cùng lúc doãng ra**. Điều tệ nhất: các position tưởng là độc lập — Treasury spread ở Mỹ, swap spread ở châu Âu, arbitrage cổ phiếu M&A, vol bán khống — hóa ra có **correlation ẩn** gần bằng 1 trong stress, vì tất cả đều là biến thể của cùng một cược duy nhất: "thanh khoản sẽ dồi dào và spread rủi ro sẽ thu hẹp". Model diversification của họ đo correlation thời bình; correlation thời chiến là một ma trận khác.

Cơ chế phá hủy không phải là "trade sai" — về mặt định giá dài hạn, phần lớn các trade của LTCM *đúng*, spread cuối cùng đều hội tụ đúng như dự đoán, chỉ là sau khi quỹ đã chết. Cơ chế giết là **margin call trong vòng lặp**. Đây là điểm định lượng cốt lõi, và nó là bài học sống còn của mọi relative-value desk: một position mua-bán đối ứng có PnL kỳ vọng dương nhưng đòi hỏi bạn *sống sót qua đường đi tới đó*. Hãy đóng đinh bằng số. Giả sử spread doãng thêm từ 12 bp lên 20 bp trước khi cuối cùng hội tụ về 6 bp; trong pha doãng đó, danh mục chịu một khoản lỗ mark-to-market tạm thời. Lấy một khoản lỗ MtM khiêm tốn **2% trên tổng tài sản** làm minh họa — với bảng cân đối 125 tỷ, đó là

$$0.02 \times 125 = 2.5 \text{ tỷ USD}.$$

So với vốn chủ sở hữu 4.7 tỷ, khoản lỗ tạm thời 2.5 tỷ này ăn mất

$$\frac{2.5}{4.7} \approx 53\%$$

vốn — chỉ vì spread doãng ngược *trước khi* hội tụ. Và broker gọi margin. Để nộp margin, LTCM phải bán bớt position. Nhưng thị trường lúc đó không có bên mua (mọi người đang chạy cùng chiều), nên bán chính là đẩy spread doãng thêm nữa, gây lỗ thêm, gây margin call thêm. Đây là **liquidity spiral**: đòn bẩy + thanh khoản cạn + mark-to-market = vòng xoáy tự khuếch đại. Trong bốn tháng, vốn từ 4.7 tỷ rơi xuống khoảng 400 triệu, và Fed New York phải điều phối 14 ngân hàng bơm 3.6 tỷ để tiếp quản có trật tự, tránh việc thanh lý cưỡng bức làm sập cả thị trường trái phiếu.

Bài học cho Q-quant có ba tầng, và cả ba đều đi thẳng vào cách ta xây model rủi ro hôm nay. **Thứ nhất**, một model đúng về *giá trị cuối cùng* vô dụng nếu nó câm về *đường đi*. Đây chính là lý do industry hiện đại không chỉ tính giá mà tính **exposure profile theo thời gian** và bắt phải sống được qua path xấu nhất — đúng tinh thần của tầng exposure/collateral trong `src/xva`. **Thứ hai**, correlation không phải hằng số; nó là hàm của regime, và trong stress nó bốc về gần 1. Đây là vì sao FRTB (Chương 15) chạy aggregation với *ba* kịch bản correlation high/medium/low rồi lấy max — regulator đã học đúng bài học LTCM và mã hóa nó thành quy tắc. **Thứ ba, và sâu nhất**: câu nói bất hủ được gán cho Keynes, "thị trường có thể vô lý lâu hơn bạn có thể giữ được khả năng thanh toán", là một phát biểu định lượng chứ không phải châm ngôn. Nó nói: xác suất bạn *sống sót* tới lúc trade đúng phụ thuộc vào leverage và funding, không phải vào việc bạn có đúng hay không. Một desk quản trị rủi ro tốt tính không chỉ EV của trade mà cả **funding-liquidity horizon** của nó — bạn cần chịu được bao nhiêu ngày doãng ngược trước khi hết margin. Con số 53% ở trên chính là thứ định nghĩa horizon đó: với leverage 26x, danh mục chỉ chịu được vài phần trăm doãng ngược là hết dư địa, dù trade cuối cùng đúng. LTCM đúng về mọi thứ trừ điều duy nhất quan trọng.

## B.2 Tổn thất CVA 2008 — vì sao lỗ counterparty đến từ mark-to-market chứ không phải default

Khi khủng hoảng 2008 lắng xuống và các ngân hàng cộng sổ, một sự thật gây sốc nổi lên: phần lớn thua lỗ liên quan đến **counterparty credit risk (CCR)** trong danh mục derivatives không đến từ các vụ vỡ nợ thật sự. BCBS ước tính khoảng **hai phần ba** tổn thất CCR trong khủng hoảng đến từ **CVA mark-to-market losses** — tức từ việc giá trị của khoản điều chỉnh CVA trên sổ *tăng lên* khi credit spread của các đối tác doãng ra — chỉ một phần ba đến từ default thực tế. Đây là một phát hiện phản trực giác đến mức nó tự sinh ra một chương hoàn toàn mới của Basel III. Để hiểu, phải hiểu CVA là gì và vì sao nó *dao động*.

CVA (Credit Valuation Adjustment, Chương 14) là kỳ vọng chiết khấu của phần lỗ khi counterparty vỡ nợ, tính trên toàn bộ đời sống của portfolio derivatives với họ:

$$\text{CVA} = (1-R)\int_0^T \underbrace{P(0,t)\,EE(t)}_{\text{exposure chiết khấu}}\;\underbrace{dPD(t)}_{\text{xác suất default}},$$

với $R$ là recovery, $EE(t)$ là expected positive exposure tại thời điểm $t$, và $dPD(t)$ là xác suất default cận biên trong $[t, t+dt]$. Điểm mấu chốt: $dPD(t)$ được suy ra từ **credit spread của counterparty** qua quan hệ hazard rate $\lambda \approx s/(1-R)$ (Chương 13). Nghĩa là **CVA là một hàm của credit spread**, và credit spread biến động mỗi ngày. Do đó CVA không phải một con số tĩnh trừ vào giá lúc ký hợp đồng — nó là một **position sống**, mark-to-market mỗi ngày, và nó *lỗ khi spread của đối tác doãng ra dù đối tác chưa hề vỡ nợ*.

Hãy tính bằng số để thấy độ lớn của cú dao động này. Lấy running example CVA của cuốn sách: một payer swap 10 năm, notional 100 triệu, EE profile hình bướu đỉnh khoảng 2.3 triệu quanh năm 4–5, counterparty ban đầu có spread ngụ ý khoảng 120 bp. Bước đầu tiên là dịch spread ra hazard rate qua công thức Chương 13, với $R = 40\%$:

$$\lambda_0 \approx \frac{s}{1-R} = \frac{120\text{ bp}}{1-0.40} = \frac{0.012}{0.60} = 2\%.$$

Như đã dẫn xuất ở Chương 14, gộp EE profile chiết khấu với hazard rate 2% và $(1-R)=0.60$ cho

$$\text{CVA}_0 \approx (1-0.40)\times \lambda_0 \times \sum_t P(0,t)\,EE(t)\,\Delta t \approx 0.172 \text{ triệu} \;(\approx 17 \text{ bp trên notional}).$$

Bây giờ khủng hoảng ập tới. Credit spread của counterparty — giả sử đó là một ngân hàng đầu tư hạng trung — doãng từ 120 bp lên 480 bp, hoàn toàn điển hình cho một tên tài chính giữa tháng 9–10/2008. Dịch lại qua cùng công thức:

$$\lambda_1 \approx \frac{0.048}{0.60} = 8\%.$$

Vì trong xấp xỉ bậc nhất CVA gần như tuyến tính theo $\lambda$ (exposure profile và discount không đổi trong cú sốc credit thuần), CVA mới xấp xỉ

$$\text{CVA}_1 \approx \frac{\lambda_1}{\lambda_0}\times \text{CVA}_0 = \frac{8\%}{2\%}\times 0.172 = 4\times 0.172 \approx 0.69 \text{ triệu}.$$

Khoản CVA trên sổ vừa nhảy từ 0.172 lên 0.69 triệu. Vì CVA là một khoản *trừ* vào tài sản (một khoản dự phòng lỗ), việc nó tăng

$$0.69 - 0.172 = 0.52 \text{ triệu}$$

là một **khoản lỗ P&L 0.52 triệu ghi nhận ngay hôm nay** — dù counterparty vẫn đang trả tiền đầy đủ, chưa vỡ nợ, và có thể không bao giờ vỡ nợ. Nhân con số này lên hàng nghìn counterparty và hàng trăm nghìn hợp đồng của một ngân hàng lớn, và bạn có hàng tỷ đô lỗ mark-to-market thuần túy do credit spread doãng, tách hoàn toàn khỏi bất kỳ default nào. Đó chính là "hai phần ba" trong con số của BCBS.

Vì sao khung Basel II cũ mù trước rủi ro này? Vì nó chỉ vốn hóa **default risk** — xác suất counterparty thật sự vỡ nợ — mà không vốn hóa **CVA volatility risk**, tức rủi ro rằng chính khoản điều chỉnh CVA sẽ dao động do spread thay đổi. Basel II coi CVA như một con số kế toán tĩnh. Thực tế 2008 chứng minh nó là một position giao dịch có một loại vega-theo-credit-spread khổng lồ. Phản ứng là **Basel III CVA capital charge** (rồi sau đó là bản viết lại BA-CVA / SA-CVA trong khung FRTB-CVA), lần đầu bắt ngân hàng giữ vốn cho *biến động* của CVA, không chỉ cho default. Về mặt định lượng, charge này đo độ nhạy của tổng CVA toàn ngân hàng với các cú sốc credit-spread và hedge của chúng, đúng theo tinh thần một sensitivity-based method như SBM.

Bài học cho Q-quant đâm thẳng vào tim của XVA desk hiện đại. **CVA không phải một con số, nó là một sản phẩm giao dịch** với đầy đủ Greeks: nó có delta theo credit spread (CS01) — trong ví dụ trên, một cú doãng 360 bp ($120 \to 480$) tạo lỗ 0.52 triệu, tức độ nhạy thô cỡ $0.52/360 \approx 1{,}440$ USD trên mỗi bp doãng; nó có delta theo lãi suất và FX (vì exposure phụ thuộc vào các thứ đó); và cross-gamma **wrong-way risk** khi exposure và default probability tương quan dương (Chương 14). Một CVA desk hiện đại *hedge* các Greeks này bằng CDS, index credit, và rate swap — chính vì bài học 2008 rằng khoản chưa-hedge này có thể tự nó gây lỗ hàng tỷ. Đây là lý do tầng `src/xva` phải tính CVA như một đại lượng có sensitivity, không phải một trường số cố định trong hợp đồng. Và có một hệ quả tinh tế mà mọi junior cần khắc sâu: khi bạn *hedge* CVA bằng cách mua CDS trên counterparty, bạn giảm được CVA volatility charge nhưng lại tạo ra một position mới cần theo dõi — và trong 2008, chính dòng chảy hedging CVA đồng loạt (ai cũng mua bảo hiểm cùng lúc) đã tự đẩy credit index doãng thêm, một vòng phản hồi khác của cùng một họ với liquidity spiral của LTCM.

## B.3 Li Gaussian copula và CDO 2008 — "công thức giết chết Phố Wall"

Nếu phải chọn một phương trình chịu trách nhiệm nhiều nhất cho quy mô của khủng hoảng 2008, ứng viên hàng đầu là **Gaussian copula của David Li**. Một bài báo nổi tiếng của Wired năm 2009 gọi nó là "The Formula That Killed Wall Street". Cách nói đó phóng đại — công thức không tự tạo ra khoản vay dưới chuẩn — nhưng nó chỉ đúng vào một điểm chí tử: cả một thị trường nghìn tỷ đô **CDO** (Collateralized Debt Obligation) được định giá và xếp hạng bằng một model có một khuyết tật cấu trúc nằm ngay chỗ quan trọng nhất — cái đuôi.

Vấn đề kỹ thuật mà copula giải là: làm sao mô hình hóa **default tương quan** của một rổ hàng trăm khoản vay hoặc trái phiếu? Nếu biết phân phối default của từng tên (từ credit spread, Chương 13), ta biết *marginal* — xác suất mỗi tên vỡ nợ riêng lẻ. Nhưng để định giá một CDO tranche, cái quyết định không phải marginal mà là **cấu trúc phụ thuộc**: xác suất *nhiều tên cùng vỡ nợ một lúc*. Một tranche equity (0–3%) chịu lỗ đầu tiên nên nó ăn default lẻ tẻ; một tranche senior (giả sử 12–30%) chỉ lỗ nếu *rất nhiều* tên vỡ nợ cùng lúc — tức nó là một cược thuần túy vào **tail dependence** của default.

Copula của Li làm điều này bằng cách gắn thời điểm default $\tau_i$ của mỗi tên vào một biến latent Gaussian $X_i$ qua $\tau_i = F_i^{-1}(N(X_i))$, rồi áp một **cấu trúc correlation Gaussian** một-nhân-tố lên các $X_i$:

$$X_i = \sqrt{\rho}\,M + \sqrt{1-\rho}\,Z_i,$$

với $M$ là nhân tố hệ thống chung (trạng thái nền kinh tế), $Z_i$ là idiosyncratic, và một tham số correlation $\rho$ duy nhất điều khiển mọi cặp. Gọn gàng đến quyến rũ: cả cấu trúc phụ thuộc của một rổ 125 tên gói vào đúng một con số $\rho$. Đây chính là nguồn gốc sức hút — và cái chết.

Khuyết tật là **Gaussian copula có tail dependence bằng 0**. Đây là một định lý, không phải ý kiến: với hai biến gắn bởi Gaussian copula với $\rho < 1$, hệ số phụ thuộc đuôi

$$\lambda_L = \lim_{u\to 0^+} P\big(U_1 < u \mid U_2 < u\big) = 0.$$

Nói bằng tiếng người: dù bạn đặt $\rho$ cao đến đâu (miễn không phải đúng bằng 1), xác suất *có điều kiện* rằng tên thứ hai vỡ nợ *khi biết* tên thứ nhất vừa vỡ nợ ở cực đuôi tiến về 0. Điều này không phải khẳng định suông — ta có thể *nhìn thấy* nó co về 0. Cố định $\rho = 0.5$ và tính xác suất có điều kiện $P(U_1<u \mid U_2<u)$ khi đẩy $u$ về 0:

| Ngưỡng đuôi $u$ | $P(U_1<u \mid U_2<u)$, $\rho=0.5$ |
|---|---|
| $5\%$ | $0.244$ |
| $1\%$ | $0.129$ |
| $0.1\%$ | $0.054$ |
| $0.01\%$ | $0.023$ |

Xác suất có điều kiện *giảm đều đặn về 0* khi ta đi sâu vào đuôi — đúng nghĩa $\lambda_L = 0$. Gaussian copula về bản chất nói rằng thảm họa cùng-lúc là chuyện gần như không thể ở cực đoan — đúng cái thứ mà một tranche senior được trả tiền để cược vào.

Hãy tính bằng số ở mức không-cực-đoan để thấy nó nói dối *tinh vi* thế nào. Lấy hai tên, mỗi tên xác suất vỡ nợ trong kỳ $p = 5\%$, nên ngưỡng latent là $c = N^{-1}(0.05) = -1.645$. Xác suất *cả hai cùng vỡ nợ* dưới Gaussian copula, so với trường hợp độc lập ($p^2 = 0.0025$):

| Correlation $\rho$ | $P(\text{cả hai default})$ | So với độc lập $p^2 = 0.25\%$ |
|---|---|---|
| $0.0$ | $0.25\%$ | $1.0\times$ |
| $0.3$ | $0.71\%$ | $2.9\times$ |
| $0.99$ | $4.42\%$ | $17.7\times$ |

Nhìn hàng $\rho = 0.3$ (mức "điển hình" mà desk hay dùng): joint default 0.71%, gần gấp ba mức độc lập — nghe có vẻ đã "bắt được correlation". Nhưng đây là ở mức $p = 5\%$, một cú default *bình thường*. Cái mà Gaussian copula bỏ sót nằm ở **cực đuôi**: khi ta hỏi xác suất 30 trong 125 tên cùng vỡ nợ (kịch bản giết tranche senior), Gaussian copula gán cho nó xác suất nhỏ đến mức phi thực tế, vì $\lambda_L = 0$ ép các default cực đoan tách rời nhau.

Để thấy sự khác biệt *lớn cỡ nào*, so trực tiếp với một **Student-t copula** — một họ có tail dependence dương. Với hệ số tự do $\nu = 4$ và cùng $\rho = 0.3$, tail dependence bậc dưới của Student-t là

$$\lambda_L = 2\,t_{\nu+1}\!\left(-\sqrt{\frac{(\nu+1)(1-\rho)}{1+\rho}}\right) \approx 0.16,$$

trong khi Gaussian với đúng $\rho = 0.3$ cho $\lambda_L = 0$. Nghĩa là: ở cực đuôi, Student-t nói "biết một tên vừa vỡ, xác suất tên kia cũng vỡ là 16%"; Gaussian nói "0%". Chênh lệch đó không phải một con số nhỏ hơn — nó là khác biệt về *bản chất định tính*: một model cho tranche senior một cái đuôi thật, model kia xóa cái đuôi. Và toàn bộ giá trị của một tranche senior *nằm trong cái đuôi đó*. Gaussian copula định giá nó gần như bằng 0 rủi ro, tức rẻ như cho.

Còn một tầng độc hại thứ hai: **calibration**. Vì $\rho$ không quan sát trực tiếp được, desk **implied** nó ra từ giá tranche giao dịch trên thị trường (giống implied vol từ giá option). Nhưng thị trường tranche — đặc biệt là các mezzanine của CDO tự chế (bespoke) — **cực mỏng**, ít giao dịch, giá tham chiếu thưa thớt. Nên $\rho$ được calibrate vào một nhúm điểm giá kém thanh khoản, rồi ngoại suy sang định giá hàng nghìn tranche khác. Tệ hơn, người ta phát hiện một $\rho$ duy nhất không khớp được cả cấu trúc vốn: nếu implied $\rho$ ra từ giá của tranche equity, bạn nhận một con số; làm lại từ tranche mezzanine, bạn nhận một con số khác hẳn; từ tranche senior, khác nữa. Cùng một rổ, cùng một model, mà mỗi attachment point đòi một $\rho$ riêng — hiện tượng này sinh ra "correlation smile" và trò vá víu **base correlation** (mỗi điểm đính kèm một $\rho$ riêng). Đó là dấu hiệu rõ ràng rằng model sai *cấu trúc* chứ không chỉ sai tham số. Khi bạn phải dùng một tham số khác cho mỗi điểm của cùng một đường cong, model của bạn đang hét lên rằng nó không mô tả đúng hiện thực (so sánh với volatility smile ở Chương 6 — cùng một triệu chứng, cùng một chẩn đoán: một số hằng lẽ ra phải là một số hằng, hóa ra phải bẻ cong theo strike/attachment để cứu giá, tức số hằng đó không phải bản chất của thị trường).

Khi thị trường nhà đất Mỹ quay đầu năm 2007–2008, default không đến lẻ tẻ như Gaussian copula giả định — chúng đến **theo cụm**, cùng lúc, trên toàn quốc, vì tất cả cùng phụ thuộc vào một nhân tố mà model coi nhẹ: giá nhà toàn quốc. Correlation thực trong stress không phải 0.3 mà tiến về 1. Các tranche AAA "an toàn tuyệt đối" — được model gán xác suất lỗ gần 0 — bị xóa sổ. Bài học cho Q-quant thẳng thắn đến mức tàn nhẫn: **model không sai vì tham số sai, nó sai vì cấu trúc sai** — nó không có kênh để tail dependence tồn tại ($\lambda_L$ đồng nhất bằng 0), nên không lượng nhiễu calibration nào cứu được. Một con số duy nhất ($\rho$) không thể mã hóa cấu trúc phụ thuộc của một rổ 125 tên. Và calibrate một model vào một thị trường mỏng rồi dùng nó cho khối lượng lớn gấp nghìn lần là khuếch đại sai số model thành rủi ro hệ thống. Đây là vì sao credit modeling hiện đại (tầng `models/credit`) dùng các cấu trúc phụ thuộc phong phú hơn (Student-t, factor copula có tail, model chuyển trạng thái) và vì sao model validation (Chương 19) xem "model có kênh nào để bắt tail co-movement không" là câu hỏi sinh tử, không phải chi tiết kỹ thuật.

## B.4 London Whale 2012 — một lỗi công thức trong spreadsheet làm VaR nhỏ đi một nửa

Không phải mọi thảm họa cần một model tinh vi để sai. Đôi khi chỉ cần một dấu chia đặt nhầm chỗ trong một bảng tính Excel. Vụ **London Whale** của JPMorgan năm 2012 — lỗ khoảng 6.2 tỷ USD trên một danh mục credit derivatives của bộ phận CIO ở London — chứa một trong những chi tiết định lượng đáng nhớ nhất trong lịch sử risk management, vì nó nhỏ đến mức bất kỳ ai cũng có thể mắc, mà hậu quả thì thảm khốc.

Bối cảnh ngắn: bộ phận Chief Investment Office của JPMorgan, đáng lẽ để hedge rủi ro của cả ngân hàng, đã tích lũy một position **credit index** (chủ yếu bán bảo hiểm qua CDX) khổng lồ đến mức nó làm lệch cả thị trường — đủ lớn để một trader ở đó có biệt danh "London Whale". Position lớn tới mức chính nó vi phạm giới hạn VaR nội bộ của desk. Thay vì cắt position, CIO xây một **model VaR mới** cho danh mục này — và model mới, một cách thần kỳ, cho ra con số VaR nhỏ hơn hẳn model cũ, đưa desk trở lại "trong hạn mức". Đó là cờ đỏ đầu tiên: khi một model mới ra đời đúng lúc để hợp thức hóa một position đang vi phạm, hãy nghi ngờ.

Model VaR mới đó được vận hành trong một loạt **spreadsheet Excel nhập tay**, dữ liệu copy-paste giữa các bảng. Báo cáo điều tra nội bộ (Task Force Report) sau đó tìm ra một lỗi cụ thể: ở một bước tính, để lấy trung bình hai đại lượng (theo mô tả, một biến đổi liên quan đến độ biến động của credit spread giữa hai kỳ), công thức lẽ ra phải **chia cho trung bình** của hai số nhưng lại **chia cho tổng** của chúng. Hệ quả định lượng là chính xác và tàn nhẫn. Với hai số $a$ và $b$, phép đúng cho một đại lượng thay đổi tương đối là chia cho trung bình $\tfrac{a+b}{2}$; phép sai chia cho tổng $a+b$. Tỷ số giữa hai kết quả là

$$\frac{\text{giá trị sai}}{\text{giá trị đúng}} = \frac{1/(a+b)}{1/\big((a+b)/2\big)} = \frac{(a+b)/2}{a+b} = \frac{1}{2}.$$

Kết quả không phụ thuộc chút nào vào $a$ và $b$ — nó luôn đúng bằng một nửa. Cắm số cho cụ thể: giả sử hai giá trị volatility spread ở hai kỳ là $a = 30$ và $b = 50\,\text{bp}$. Phép đúng dùng mẫu số $\tfrac{a+b}{2} = 40$, cho $1/40 = 0.0250$; phép sai dùng mẫu số $a+b = 80$, cho $1/80 = 0.0125$. Đúng một nửa, và với *bất kỳ* cặp $(a,b)$ nào khác vẫn thế. Chia cho tổng thay vì trung bình làm kết quả nhỏ đi **đúng một nửa**, bất kể giá trị đầu vào.

Vì đại lượng đó feed vào ước lượng volatility của danh mục, và VaR tỷ lệ tuyến tính với volatility ($\text{VaR}_{99\%} = z_{99\%}\,\sigma_P$ với $z_{99\%} = N^{-1}(0.99) = 2.326$, Chương 15), lỗi này **làm giảm VaR báo cáo đi khoảng một nửa**. Một danh mục mà VaR thật là, chẳng hạn, 130 triệu USD được báo cáo chỉ

$$130 \times \tfrac{1}{2} = 65 \text{ triệu USD}$$

— vừa khít dưới hạn mức. Con số một-nửa không phải trùng hợp; nó là hệ quả đại số trực tiếp của việc thay $\tfrac{a+b}{2}$ bằng $a+b$ trong mẫu số, và vì VaR tuyến tính theo $\sigma_P$, một nửa ở đầu vào là một nửa ở đầu ra.

Điều làm case này thành giáo trình không phải bản thân lỗi số học — ai cũng gõ nhầm — mà là **chuỗi kiểm soát đã không bắt được nó**. Bảng tính không được version-control, không có kiểm tra độc lập, dữ liệu copy-paste thủ công giữa các sheet (điều tra tìm thấy cả trường hợp copy nhầm cột). Không có bước đối chiếu con số VaR mới với model cũ để hỏi "vì sao nó nhỏ hơn một nửa — có lý do kinh tế hay là bug?". Không có ai độc lập với desk kiểm định model trước khi nó được dùng để đo tuân thủ hạn mức. Mọi lớp phòng thủ đều vắng mặt cùng lúc.

Bài học cho Q-quant có lẽ là thực dụng nhất trong cả phụ lục, vì nó không về toán mà về **kỹ thuật phần mềm và quản trị**. Thứ nhất: một model rủi ro chạy trên spreadsheet nhập tay không phải model — nó là một tai nạn đang chờ ngày. Đây là lý do industry hiện đại đòi risk engine phải là **code có version control, có unit test, có reconciliation tự động**, không phải Excel. Chính vì lớp bài học này mà kiến trúc như `src/risk` yêu cầu mọi tham số quy định nằm trong registry versioned và mọi phép aggregation là code kiểm thử được, tái lập được — chứ không phải công thức gõ tay có thể chia nhầm mẫu số mà không ai thấy. Một unit test tầm thường "khi nhân đôi mọi input volatility, VaR phải nhân đôi" sẽ bắt ngay lỗi divide-by-sum, vì phép sai không có tính chất tỷ lệ đúng đó. Thứ hai: **model validation phải độc lập với desk dùng model** (Chương 19). Khi người xây model và người bị model ràng buộc là cùng một nhóm, incentive để "model ra số đẹp" là không thể cưỡng lại. Thứ ba, và bao trùm: **khi một con số rủi ro đột nhiên tốt lên, đó là lúc phải nghi ngờ nhất**, không phải lúc ăn mừng. Một VaR giảm một nửa sau khi đổi model là một câu hỏi cần trả lời, không phải một chiến thắng cần báo cáo. FRTB phản ứng với đúng họ bài học này bằng cách bắt các desk IMA vượt **P&L attribution test** và **backtesting** liên tục — chính là để một con số VaR đẹp giả tạo không thể sống sót qua đối chiếu với P&L thật.

## B.5 LME nickel 2022 — short squeeze, giá x2 một ngày, và cái nút "hủy giao dịch"

Ngày 8 tháng 3 năm 2022, giá nickel trên London Metal Exchange làm một việc mà không model VaR nào trong bộ nhớ lịch sử của nó cho là khả dĩ: nó **hơn gấp đôi trong vòng một ngày**, chạm trên 100,000 USD/tấn từ mức khoảng 48,000 chỉ hai ngày trước. Rồi LME làm một việc còn khó tin hơn: sàn **hủy toàn bộ giao dịch nickel** đã khớp trong ngày hôm đó — khoảng 3.9 tỷ USD giá trị — quay ngược đồng hồ về giá đóng cửa hôm trước. Case này là bài học kép: một về cơ chế **short squeeze**, một về một rủi ro mà mọi model định giá âm thầm giả định là không tồn tại — rủi ro rằng giao dịch của bạn có thể bị *xóa* sau khi đã khớp.

Cơ chế short squeeze về mặt định lượng như sau. Một nhà sản xuất nickel lớn của Trung Quốc (Tsingshan) giữ một position **short** khổng lồ — ước tính khoảng 150,000 tấn — như một hedge tự nhiên: họ sản xuất nickel nên bán khống future để khóa giá bán tương lai, một hedge hoàn toàn hợp lý về nguyên tắc. Vấn đề là **quy mô** và **thanh khoản**. Khi giá nickel bắt đầu tăng (do lo ngại nguồn cung từ Nga sau khi chiến sự Ukraine nổ ra, vì Nga là nhà cung nickel lớn), position short bắt đầu lỗ. Với một short future, lỗ mark-to-market khi giá lên là tuyến tính và không giới hạn:

$$\text{Lỗ} = (\text{giá mới} - \text{giá cũ}) \times \text{số tấn} = (101{,}365 - 48{,}000)\times 150{,}000 \approx 8.0 \text{ tỷ USD}.$$

Tám tỷ đô lỗ trên một position, phần lớn dồn vào vài ngày. Mỗi bước giá tăng sinh một **margin call**. Để đóng position (mua lại future đã bán khống để dừng lỗ), người short buộc phải **mua** — nhưng ai cũng biết họ phải mua, và ai cũng biết không có đủ nickel giao thật để cover, nên bên long giữ giá cao và ép chặt hơn. Chính hành động mua-để-cover của người short **đẩy giá lên tiếp**, gây margin call lớn hơn, ép cover mạnh hơn. Đây là **short squeeze**: hình ảnh phản chiếu của liquidity spiral LTCM, nhưng với dấu ngược — thay vì bán-đẩy-giá-xuống, là mua-đẩy-giá-lên. Cấu trúc payoff bất đối xứng làm nó chết người: lỗ của một short không giới hạn trên (giá lên vô hạn), trong khi lời tối đa chỉ bằng giá xuống 0. Position hedge "an toàn" hóa ra có một cái đuôi mở toang về phía tổn thất — và một cú x2 trong một ngày là điều $\sigma_P$ ước lượng từ dữ liệu thời bình không bao giờ gán xác suất đáng kể: nếu vol nickel ngày thường cỡ 2–3%, một cú +111% là hàng chục lần độ lệch chuẩn, tức xác suất dưới bất kỳ Gaussian nào là zero về mặt thực hành.

Nhưng cú twist định lượng thật sự — và là điều làm case này độc nhất — là quyết định của LME **hủy giao dịch**. Về mặt risk modeling, đây là một sự kiện thuộc loại mà không phân phối xác suất chuẩn nào nắm bắt được: không phải "giá biến động cực đoan" (điều VaR ít ra cố đo), mà là **rủi ro rằng chính hạ tầng thị trường thay đổi luật chơi giữa cuộc**. Ai đã *đúng* trong ngày hôm đó — các trader long đã đặt cược nickel lên và thắng lớn — bị tước phần thắng khi giao dịch bị hủy. Ai đã *sai* — người short — được cứu. Không mô hình định giá nào có tham số cho "sàn có thể quyết định giao dịch của tôi không tồn tại". Đây là một dạng cực đoan của **liquidity risk và operational/venue risk** mà VaR, ES, và mọi Greek đều mù hoàn toàn, vì tất cả đều giả định — ngầm nhưng tuyệt đối — rằng một giao dịch đã khớp là một giao dịch đã xong.

Bài học cho Q-quant có ba tầng. **Thứ nhất**, position bất đối xứng có đuôi mở (short future, short option trần) cần được đo bằng stress kịch bản, không phải bằng độ lệch chuẩn — một giá x2 trong một ngày là chuyện $\sigma_P$ không bao giờ gán xác suất đáng kể, nên VaR parametric vô dụng, và ngay cả historical simulation cũng mù nếu cửa sổ lịch sử chưa từng chứa một cú squeeze. Đây chính là vì sao FRTB dùng ES với **stressed calibration** và tại sao stress testing bằng kịch bản giả định (không chỉ lịch sử) là bắt buộc. **Thứ hai**, một hedge "hoàn hảo" về mặt sách vở (nhà sản xuất bán khống chính thứ mình sản xuất) vẫn có thể giết bạn qua kênh **funding/margin** — Tsingshan không sai về hướng dài hạn (họ thật sự có nickel để giao), họ sai về khả năng chịu margin call ngắn hạn, y hệt LTCM: đúng về giá trị cuối cùng, chết vì đường đi. **Thứ ba**, và tinh tế nhất: có những rủi ro nằm *ngoài* không gian mà model được định nghĩa — venue risk, rủi ro thay đổi quy tắc, rủi ro pháp lý — và một risk manager trưởng thành biết rằng con số VaR đẹp không có nghĩa là an toàn, chỉ có nghĩa là an toàn *trong phạm vi những gì model biết cách tưởng tượng*. Danh sách những gì nó không biết cách tưởng tượng dài hơn nhiều.

## B.6 GameStop tháng 1/2021 — dealer gamma, vanna, và cơ chế gamma squeeze

Vụ **GameStop** (ticker GME) tháng 1/2021 thường được kể như một câu chuyện xã hội — đám đông nhà đầu tư nhỏ lẻ trên Reddit đánh bại các hedge fund short. Câu chuyện đó có thật, nhưng nó bỏ sót cơ chế định lượng thực sự đã khuếch đại giá GME từ khoảng 40 USD lên gần 483 USD intraday chỉ trong một tuần: **gamma squeeze** do vị thế của options dealer. Đây là điểm giao đẹp nhất giữa cuốn Q này và cuốn P-world (buy-side), vì nó là một câu chuyện thuần túy về **Greeks của dealer** và dòng hedging mà chúng ép ra. Để hiểu nó, ta cần đúng bộ công cụ đã dựng ở Chương 5.

Cơ chế bắt đầu từ một sự thật về market-making: khi nhà đầu tư nhỏ lẻ **mua call** ồ ạt, ai đó phải **bán** những call đó — và đó là các options dealer (market maker). Dealer sau khi bán call bị **short call**, tức có $\Delta < 0$ và — điểm mấu chốt — **short gamma** ($\Gamma < 0$). Dealer không muốn cược hướng; họ kiếm tiền từ spread, nên họ **delta-hedge**: để trung hòa delta của một short call, dealer phải **mua cổ phiếu** với số lượng bằng delta của call họ đã bán.

Hãy đóng đinh bằng số. Lấy GME ở giai đoạn đầu squeeze: $S = 40$, một call ATM $K = 40$, còn khoảng hai tuần đến đáo hạn $T = 0.04$ năm, và IV của một cổ phiếu meme lúc đó điên rồ — lấy $\sigma = 150\%$ (không phóng đại; IV GME có lúc vượt xa mức đó). Tính theo Black-Scholes (Chương 5), với $r = 0$. Trước hết dựng $d_1$ từng mảnh: tử số $\ln(S/K) + \tfrac12\sigma^2 T = 0 + \tfrac12(1.5)^2(0.04) = 0.045$, mẫu số $\sigma\sqrt{T} = 1.5\sqrt{0.04} = 1.5\times 0.2 = 0.30$, nên

$$d_1 = \frac{\ln(S/K) + \tfrac{1}{2}\sigma^2 T}{\sigma\sqrt{T}} = \frac{0.045}{0.30} = 0.15,$$

$$\Delta = N(d_1) = N(0.15) = 0.5596, \qquad \Gamma = \frac{\phi(d_1)}{S\sigma\sqrt{T}} = \frac{0.3945}{40\times 1.5\times 0.2} = \frac{0.3945}{12} = 0.0329.$$

Dealer bán, giả sử, 10,000 hợp đồng call (mỗi hợp đồng 100 cổ phiếu = 1 triệu cổ phiếu tham chiếu). Để delta-hedge vị thế short call này, dealer phải mua $\Delta \times 1{,}000{,}000 = 0.5596 \times 1{,}000{,}000 \approx 560{,}000$ cổ phiếu ngay lập tức. Đó đã là một lực mua cơ học lớn. Nhưng cái giết là **gamma**, tức delta *thay đổi khi giá đổi*.

Vì dealer short gamma ($\Gamma < 0$ cho vị thế của họ), khi giá cổ phiếu **tăng**, delta của call họ đã bán tăng lên, nên delta short của họ trở nên âm hơn, và để giữ trung hòa họ phải **mua thêm cổ phiếu**. Tính bằng số: khi $S$ đi từ 40 lên 60 (+50%), $\ln(60/40) = 0.405$, nên tử số của $d_1$ thành $0.405 + 0.045 = 0.450$, và delta của call nhảy từ 0.5596 lên

$$\Delta(S=60) = N\!\left(\frac{\ln(60/40) + \tfrac{1}{2}(1.5)^2(0.04)}{0.30}\right) = N\!\left(\frac{0.450}{0.30}\right) = N(1.50) = 0.9332.$$

Delta tăng từ 0.56 lên 0.93 — dealer bây giờ phải giữ $0.9332\times 1{,}000{,}000 \approx 933{,}000$ cổ phiếu thay vì 560,000, tức **phải mua thêm khoảng $933{,}000 - 560{,}000 = 373{,}000$ cổ phiếu** chỉ vì giá đã lên. Nhưng chính hành động mua 373,000 cổ phiếu đó **đẩy giá lên tiếp**, làm delta tăng thêm, ép mua thêm nữa. Đây là **gamma squeeze**: một vòng phản hồi dương trong đó dealer bị buộc mua khi giá lên và mua nhiều hơn khi giá lên nhiều hơn — đúng ngược với hedging ổn định. Khi dealer **short gamma**, hoạt động hedging của họ **khuếch đại** biến động thay vì hấp thụ nó, vì họ mua vào lúc tăng và bán ra lúc giảm (mua cao bán thấp một cách cưỡng bức). Càng nhiều call OTM được mua, gamma tổng của dealer càng âm, và mỗi bước giá lên châm ngòi một đợt mua hedge lớn hơn.

Có một Greek bậc hai làm câu chuyện tệ hơn nữa: **vanna** ($\partial\Delta/\partial\sigma$, tức delta thay đổi theo vol). Khi cơn sốt kéo IV của GME lên (vì cầu call tăng làm implied vol tăng), vanna làm delta của các call dịch chuyển thêm — với call OTM, IV tăng đẩy delta lên, buộc dealer mua thêm cổ phiếu *ngay cả khi giá đứng yên*, chồng thêm lực mua lên trên kênh gamma. Và **charm** (delta decay theo thời gian) cũng góp phần khi các call ngắn hạn tiến gần đáo hạn. Nhưng động cơ chính, cỗ máy trung tâm, là gamma: một khối lượng lớn call OTM mua bởi retail, đối ứng bởi dealer short gamma, buộc dealer thành một cái máy mua-khi-lên tự động. Chồng lên đó là **short squeeze cổ điển** — short interest của GME vượt 100% float, nên khi giá lên, người short cổ phiếu cũng buộc phải mua để cover, cộng lực với dealer. Hai squeeze — gamma từ options, short-cover từ cổ phiếu — cộng hưởng và đẩy giá lên mười lần trong vài ngày.

Bài học cho Q-quant, và cho sự nối liền P/Q: **positioning của dealer là một biến trạng thái của thị trường**, không phải nhiễu nền. Tổng gamma của dealer (gamma exposure, "GEX") xác định thị trường sẽ *ổn định* hay *bùng nổ* quanh một mức giá — khi dealer net **long gamma**, hedging của họ dập biến động (bán khi lên, mua khi xuống, đưa giá về); khi dealer net **short gamma**, hedging của họ khuếch đại biến động, và một cú hích nhỏ có thể thành một cú nổ. Đây chính xác là lý do một trader vol buy-side (cuốn P-world) theo dõi dealer gamma positioning như một tín hiệu về chế độ biến động sắp tới. Với Q-quant, bài học là: model định giá option của bạn giả định bạn có thể delta-hedge liên tục vào một thị trường thanh khoản với giá không bị ảnh hưởng bởi chính hedge của bạn — chính giả định "hedge không tự dời giá" mà lập luận Black-Scholes cần (Chương 5). GameStop là bằng chứng sống rằng khi position đủ lớn so với thanh khoản, hedge của bạn *chính là* market impact, và giả định nền tảng của BS gãy — chính xác cùng một họ sai lầm với LTCM và LME, chỉ khác cơ chế truyền dẫn.

## B.7 Archegos 2021 — total return swap, concentration, và điểm mù của prime broker

Tháng 3/2021, một family office ít người biết tên là **Archegos Capital Management** sụp đổ trong vài ngày, gây tổng thua lỗ hơn 10 tỷ USD cho các ngân hàng prime broker của nó — riêng Credit Suisse mất khoảng 5.5 tỷ, một cú đánh góp phần vào sự kết thúc của cả ngân hàng đó. Điều khiến case này thành giáo trình bắt buộc là **cơ chế đòn bẩy** mà Archegos dùng: **total return swap (TRS)**, một công cụ cho phép che giấu concentration và leverage khỏi tầm nhìn của cả regulator lẫn — điều đáng sợ hơn — chính các prime broker của nó.

Cơ chế TRS về mặt định lượng như sau. Thay vì mua cổ phiếu trực tiếp (phải bỏ tiền mặt, hiện lên sổ, phải khai báo khi vượt ngưỡng sở hữu), Archegos ký một **total return swap** với một prime broker: ngân hàng mua và giữ cổ phiếu trên sổ *của ngân hàng*, còn Archegos nhận toàn bộ **total return** (thay đổi giá cộng cổ tức) của cổ phiếu đó và trả lại một khoản **funding** (lãi suất trên notional) cộng một khoản **margin** ban đầu. Về kinh tế, Archegos có đúng exposure như thể sở hữu cổ phiếu, nhưng cổ phiếu đứng tên ngân hàng. Đòn bẩy đến từ margin: nếu margin ban đầu là, chẳng hạn, 20% notional, thì với 1 đô vốn Archegos điều khiển được exposure

$$\text{Leverage} = \frac{1}{\text{margin}} = \frac{1}{0.20} = 5\times.$$

Với khoảng 10 tỷ vốn thật, Archegos điều khiển exposure kinh tế trên $10 \times 5 = 50$ tỷ — và ở đỉnh, một số ước tính đẩy gross exposure còn cao hơn nhiều. Nhưng con số leverage 5x chưa phải phần độc. Phần độc là **concentration** cộng **fragmentation**.

Concentration: Archegos dồn phần lớn exposure vào một nhúm cổ phiếu (ViacomCBS, Discovery, vài tên công nghệ Trung Quốc). Vị thế của họ trong vài tên lớn tới mức chiếm một tỷ trọng đáng kể khối lượng giao dịch hằng ngày của chính cổ phiếu đó — nghĩa là position không thể thanh lý nhanh mà không tự đè giá xuống (cùng bài học market-impact với GameStop và LME, dấu ngược). Fragmentation: Archegos ký TRS với **nhiều prime broker cùng lúc** (Credit Suisse, Nomura, Morgan Stanley, Goldman, UBS...), và mỗi ngân hàng chỉ nhìn thấy phần position *của riêng mình*. Không ngân hàng nào thấy bức tranh tổng. Mỗi prime broker tính rủi ro counterparty của mình như thể position với Archegos là vừa phải và có thể thanh lý — vì trong *cửa sổ của họ*, nó đúng là vậy. Nhưng tổng hợp lại trên tất cả các broker, Archegos là một khối concentration khổng lồ ngồi trên vài cổ phiếu kém thanh khoản. Đây là một **wrong-way / concentration risk** ẩn hoàn hảo: mỗi bên đo đúng, tổng thể sai chết người.

Cú sập diễn ra theo đúng kịch bản định lượng mà bây giờ ta đã quen. ViacomCBS giảm giá (một đợt phát hành cổ phiếu mới làm loãng). Position TRS của Archegos lỗ; giá trị exposure vượt margin đã đặt, sinh **margin call** từ các prime broker. Với leverage 5x, tính chịu đựng của Archegos mỏng đến mức nào? Một cú giảm giá $x$ trên danh mục gross xóa $5x$ phần vốn, nên ngưỡng phá sản là

$$5 \times x = 100\% \;\Rightarrow\; x = 20\%.$$

Một cú giảm 20% trên rổ cổ phiếu concentrated là xóa sạch vốn — và ViacomCBS giảm hơn thế trong vài ngày. Archegos không đủ tiền mặt nộp cho *tất cả* các broker cùng lúc. Các broker, nhận ra Archegos vỡ, đua nhau **thanh lý tài sản thế chấp** — tức bán tống các cổ phiếu họ đang giữ để hedge TRS. Nhưng vì tất cả cùng giữ cùng vài tên, và các position lớn so với thanh khoản, việc bán đồng loạt **đè giá xuống**, làm các position còn lại lỗ thêm, ép thanh lý mạnh hơn. Ngân hàng nào **bán trước** (Goldman, Morgan Stanley) thoát gần như không lỗ; ngân hàng nào **bán sau** (Credit Suisse, Nomura) ăn trọn cú sập giá do chính đám đông thanh lý gây ra. Đây là **liquidity spiral** lần thứ ba trong phụ lục này, giờ với một đặc điểm mới: nó là một trò chơi first-mover trong đó chậm chân đồng nghĩa gánh toàn bộ loss của cả nhóm.

Về mặt CCR và XVA, Archegos là một minh họa sách giáo khoa cho vài khái niệm cốt lõi (Chương 14). **Exposure của một TRS với một hedge fund** không cố định — nó tăng đúng lúc position của quỹ lỗ, tức đúng lúc quỹ *dễ vỡ nợ nhất*. Đó là **wrong-way risk**: xác suất default của counterparty tương quan dương với size của exposure lên chính counterparty đó. Với Archegos, khi cổ phiếu họ nắm rơi, đồng thời (a) exposure của ngân hàng lên Archegos tăng và (b) khả năng Archegos trả nợ giảm — hai thứ tệ cùng lúc, đúng định nghĩa WWR. **Margin/collateral** đặt ra bởi các broker quá thấp so với thanh khoản thực của position: initial margin phải đủ để bù lỗ trong khoảng thời gian cần để *thanh lý an toàn* (margin period of risk), và với một position lớn hơn khối lượng giao dịch hằng ngày, khoảng thời gian đó dài hơn nhiều so với giả định chuẩn — nên margin lẽ ra phải cao hơn nhiều. Hãy nhìn định lượng: giả định chuẩn cho một position thanh khoản là margin period of risk 10 ngày; nếu position lớn đến mức cần 40 ngày mới thoát được mà không đè giá, thì độ bất định giá tích lũy tỷ lệ với căn của thời gian, tức lớn hơn $\sqrt{40/10} = 2$ lần — margin đúng lẽ ra phải gấp đôi con số các broker dùng. Đây chính là logic đằng sau **SA-CCR** và các mô hình initial margin động (dynamic IM, tầng `src/xva`): initial margin phải phản ánh thanh khoản và concentration của chính position, không phải một tỷ lệ phẳng.

Bài học cho Q-quant khép lại phụ lục bằng cách buộc vào nhau mọi sợi chỉ. **Thứ nhất**, đo rủi ro trên position của *riêng mình* là không đủ khi counterparty có thể fragment exposure qua nhiều nhà cung — điểm mù này chỉ đóng được bằng minh bạch dữ liệu tốt hơn (một trong các động lực của cải cách hậu-Archegos). **Thứ hai**, **margin period of risk** và **market impact của thanh lý** phải nằm *trong* model exposure, không phải là giả định phụ tùy tiện — một position không thể thanh lý trong một ngày có exposure lớn hơn con số một-ngày rất nhiều, đúng theo hệ số $\sqrt{\text{số ngày}}$ vừa tính. **Thứ ba**, và là kết luận chung của cả bảy case: mọi thảm họa trong phụ lục này là biến tấu của **cùng một phương trình** — đòn bẩy nhân với một cú sốc đuôi, truyền qua kênh thanh khoản/margin, khuếch đại bởi việc ai cũng ở cùng một phía. LTCM và Archegos là leverage cổ điển; nickel và GameStop là short/gamma squeeze; Li copula và CVA 2008 là model mù trước tail co-movement; London Whale là chuỗi kiểm soát vắng mặt. Nhưng nếu bạn chưng cất chúng, hình dạng chỉ có một: **model trung bình đo đúng nhất khi đuôi không quan trọng, và mù đúng lúc đuôi quyết định tất cả.** Công việc của Q-quant không phải xây model không bao giờ sai — không tồn tại thứ đó — mà là biết chính xác model của mình mù ở đâu, và bảo đảm rằng nơi nó mù không phải là nơi định mệnh của cả tổ chức được quyết định. Toàn bộ bộ khung hiện đại — ES thay VaR, ba kịch bản correlation, CVA capital, stressed calibration, model validation độc lập, margin period of risk — chỉ là bảy bài học đắt giá này được nén thành đại số, để chúng không phải học lại lần nữa bằng cùng cái giá.

---

*Hết tài liệu Q-world.*
