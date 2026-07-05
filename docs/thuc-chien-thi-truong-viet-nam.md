# Thực chiến Quant cho Thị trường Việt Nam — Áp dụng P-World & Q-World

> Tài liệu companion cho hai cuốn [P-World](p-world.md) (alpha research, buy-side) và [Q-World](q-world.md) (derivatives pricing, sell-side). Đây là lớp "dịch" toàn bộ framework trong hai cuốn sang **thực chiến thị trường chứng khoán Việt Nam**: những gì áp dụng thẳng, những gì phải chỉnh, và những gì chưa dùng được — cùng lộ trình cụ thể để xây một hệ thống giao dịch định lượng tại VN. Bám cơ chế & quy định thị trường VN hiện hành (2026: hậu KRX go-live, nâng hạng FTSE Emerging Market).
>
> **Lưu ý quan trọng:** đây là tài liệu *phương pháp*, không phải khuyến nghị đầu tư hay lời hứa sinh lời. Thị trường VN đang cải cách nhanh (KRX rollout 2026–2028: short selling, T+0, options); **luôn kiểm tra quy định & biểu phí hiện hành với công ty chứng khoán của bạn** trước khi triển khai vốn thật.

---

## Mục lục

1. Tư duy: vì sao Việt Nam khác, và cách dùng tài liệu này
2. Cấu trúc thị trường Việt Nam — cơ chế bạn phải thuộc
3. Những ràng buộc phá vỡ chiến lược trong sách — và cách lách
4. Hai sân chơi: VN30 futures vs long-only equity
5. Dữ liệu: vnstock, point-in-time, và bẫy corporate-action của VN
6. Tín hiệu alpha cho thị trường Việt Nam
7. Backtest engine cho VN — T+2, biên độ ±7%, phí + thuế
8. Xây danh mục long-only + hedge bằng futures
9. Regime và quản trị rủi ro cho thị trường VN
10. Execution và vận hành bot qua API môi giới
11. Ba template chiến lược khả thi tại Việt Nam
12. Kế hoạch 90 ngày, cạm bẫy, và ánh xạ chương P/Q → VN

---

## 1. Tư duy: vì sao Việt Nam khác, và cách dùng tài liệu này

Bạn cầm tài liệu này vì bạn đã đọc — hoặc đang đọc — hai cuốn **P-World** và **Q-World**. Hai cuốn đó dạy bạn *bộ khung tư duy* của một quant: nghĩ về returns như biến ngẫu nhiên, hiểu một alpha được sinh ra rồi chết đi thế nào, backtest mà không tự lừa mình, lắp một danh mục từ hàng chục tín hiệu yếu. Đó là kiến thức không biên giới. Nhưng chúng viết cho một *thị trường mặc định* — kiểu thị trường phát triển như Mỹ: short thoải mái, vay cổ phiếu dễ, phái sinh trên gần như mọi thứ, dữ liệu sạch mấy chục năm, và đối thủ là những cỗ máy đã mài mòn gần hết mọi anomaly đơn giản.

Việt Nam không phải thị trường đó. Tài liệu này là **lớp dịch** — dịch bộ khung P/Q sang các ràng buộc, cơ chế và cơ hội thực tế của thị trường chứng khoán Việt Nam. Không phải để phủ nhận sách, mà để bạn biết: quy tắc nào bê nguyên xi được, quy tắc nào phải bẻ, và chỗ nào VN *dễ ăn hơn* chứ không phải khó hơn.

### Hai giả định của cuốn P sụp đổ ở VN

Cuốn P-World, ngay từ **Chương 1 (P là gì)** và **Chương 8 (Behavioral & limits to arbitrage)**, dựng lên hai giả định nền:

1. **Short tự do.** Muốn bán khống một cổ phiếu định giá cao, bạn vay rồi bán. Đây là điều kiện sống còn của cả một họ chiến lược: long/short equity, pairs trading, market-neutral stat-arb.
2. **Thị trường tương đối hiệu quả.** Alpha đơn giản (một mình momentum, một mình value) đã bị arbitrage mài mòn; muốn sống bạn phải tinh vi, tốc độ cao, hoặc chấp nhận Sharpe mỏng.

Ở Việt Nam, **cả hai đều sai** — và sai theo hai hướng ngược nhau: một hướng *lấy đi* của bạn một công cụ, một hướng *tặng* bạn một lợi thế.

**Hệ quả (a) — mất công cụ short.** Bán khống cổ phiếu cơ sở với nhà đầu tư retail ở VN **hiện chưa làm được**; lộ trình securities borrowing & lending và covered short đang được xây dựng dần theo giai đoạn 2026–2028 qua hệ thống KRX, còn chờ khung pháp lý. Nghĩa là toàn bộ họ chiến lược dựa trên short *trên cổ phiếu* — market-neutral, pairs, stat-arb hai chân long/short cùng lúc trên equity — **chưa chạy được**. Đây không phải chi tiết nhỏ: đó là nửa cái toolbox trong Chương 5 (lý thuyết danh mục), Chương 11 (portfolio construction) và Chương 15 (bản đồ chiến lược) của cuốn P. Nếu bạn muốn short hoặc phòng hộ, cửa duy nhất hiện nay là **VN30 Index Futures** — niêm yết trên HNX, tài sản cơ sở là chỉ số VN30, cho phép long/short cả hai chiều, giao dịch intraday, có đòn bẩy. Vì thế Mục 4 chia thế giới của bạn làm đúng hai sân: *long-only trên cổ phiếu* và *hai chiều trên VN30 futures* — và bạn phải học sống trong ranh giới đó thay vì mơ về pairs trading trên hai mã ngân hàng.

**Hệ quả (b) — được tặng behavioral edge.** Ở chỗ cuốn P bảo "anomaly đơn giản đã chết", VN nói ngược lại. Khoảng **85–90% khối lượng giao dịch** trên thị trường VN đến từ nhà đầu tư **cá nhân (retail) trong nước**. Một thị trường bị chi phối bởi noise trader là một thị trường **kém hiệu quả một cách có hệ thống**: momentum kéo dài hơn, đảo chiều (reversal) rõ hơn, dòng tiền (flow) để lại dấu vết đọc được — trong đó có cả **dòng tiền khối ngoại**, công bố theo mã mỗi ngày, một nguồn tín hiệu đặc thù của VN. Chính **Chương 8 (Behavioral & limits to arbitrage)** của cuốn P mô tả *cơ chế* sinh ra những anomaly này; điều nó không nói được là ở VN cỗ máy đó chạy *mạnh hơn* vì thiếu lực arbitrage để dập — mà một phần chính vì không short được (hệ quả (a) quay lại thành lợi thế). Kết luận thực chiến: **tín hiệu đơn giản sống khỏe ở VN hơn ở thị trường phát triển.** Bạn không cần một mô hình 200 feature. Một momentum sạch, một filter thanh khoản, một chút kỷ luật risk — đã là một chiến lược thật.

### Bạn không đấu với Citadel

Đây là điểm tư duy quan trọng nhất, và là lý do để lạc quan. Ở Mỹ, bạn — một cá nhân với laptop — ngồi cùng bàn poker với các HFT shop nuốt order flow theo microsecond và các quant fund với đội PhD. Ở VN, **cấu trúc thị trường không đặt bạn vào ván đó.** Đối thủ chủ đạo của bạn là đám đông retail giao dịch bằng cảm xúc, tin đồn room chat, và FOMO. Lợi thế của bạn không phải tốc độ hay vốn — mà là **kỷ luật và quy trình**: backtest trung thực, quản trị rủi ro, không đuổi giá trần. Phần lớn người thua ở VN thua vì **thiếu kỷ luật, không phải thiếu cơ hội.** Cơ hội thì thị trường kém hiệu quả này rải đầy; cái khan hiếm là người đủ tỉnh táo để nhặt nó một cách hệ thống.

Nói vậy không phải để coi thường rủi ro. VN có những cái bẫy riêng: đội lái pump-and-dump trên smallcap, corporate action dày đặc làm hỏng data lịch sử, lịch sử giá ngắn khiến overfitting cực dễ. Những cái đó là nội dung của Mục 3, 5 và 9. Nhưng chúng là *bẫy để né*, không phải *bức tường để bỏ cuộc*.

### Một phép tính minh họa cho trực giác chi phí

Để bạn cảm được vì sao "đơn giản nhưng kỷ luật" thắng, hãy nhìn chi phí một vòng mua–bán. *Ví dụ minh họa* (giá cổ phiếu là số giả định; phí/thuế lấy theo khoảng thực tế của thị trường): bạn mua một cổ phiếu HOSE giá 50.000đ, phí môi giới ~0,2%/chiều (áp cả mua và bán), thuế thu nhập khi bán 0,1% trên giá trị bán. Chi phí một vòng:

$$c_{\text{round}} \approx \underbrace{0{,}2\%}_{\text{phí mua}} + \underbrace{0{,}2\%}_{\text{phí bán}} + \underbrace{0{,}1\%}_{\text{thuế bán}} \approx 0{,}5\%$$

Một chiến lược quay vòng 2 lần/tuần ăn ~$0{,}5\% \times 2 = 1\%$/tuần chỉ riêng chi phí — cộng dồn thành cỡ vài chục phần trăm mỗi năm bốc hơi trước khi tính đến lãi. Chính **"điểm gãy chi phí" ở Chương 8–9 cuốn P** giết những chiến lược quay vòng nhanh mà lý thuyết trông đẹp. Bài học VN: mỗi lần bấm nút là mất tiền *chắc chắn*, còn alpha thì chỉ *kỳ vọng*. Tần suất thấp, tín hiệu khỏe, kỷ luật chi phí — đó là tinh thần xuyên suốt tài liệu.

### Cách đọc tài liệu này

Tài liệu gồm 12 mục, mỗi mục là một lớp dịch từ một mảng của P/Q sang VN, và mỗi mục **neo vào chương cụ thể** để bạn quay lại lý thuyết gốc khi cần:

- **Mục 2–3** — cấu trúc thị trường VN (T+2, biên độ ±7% HOSE, bước giá, room ngoại) và các ràng buộc phá vỡ chiến lược sách, ánh xạ **Chương 12 (microstructure)**.
- **Mục 4** — hai sân chơi: long-only equity vs **VN30 futures**, ánh xạ **Chương 16 (trading theo asset class)** và nền forward/futures ở **Q-World Chương 2 (nền tảng) và Chương 9 (lãi suất, futures/basis)**.
- **Mục 5** — data (`vnstock`, PIT, corporate action) — nguồn lỗi backtest lớn nhất ở VN, nối **Chương 2 (dữ liệu & returns)**.
- **Mục 6–7** — tín hiệu alpha cho VN (**Chương 7, 8, 10**) và backtest engine trung thực (**Chương 9**).
- **Mục 8–9** — portfolio long-only + futures hedge (**Chương 5, 11, 14**) và regime & risk (**Chương 4, 14**).
- **Mục 10** — execution qua API broker (**Chương 13**).
- **Mục 11–12** — ba template chiến lược cụ thể và kế hoạch 90 ngày (**Chương 15, 22**).

Bạn không cần đọc tuần tự cả hai cuốn P/Q trước. Cách dùng hiệu quả: đọc mục ở đây, thấy nó trỏ về chương nào thì mở đúng chương đó ra đọc sâu, rồi quay lại. Tài liệu này là **bản đồ dịch**, không phải bản thay thế sách gốc.

Tinh thần chung: **VN không phải phiên bản khó hơn của Mỹ — nó là một thị trường *khác*, kém hiệu quả hơn, ràng buộc hơn, nhưng vì thế cũng *hào phóng* hơn với người có kỷ luật.** Việc của bạn không phải trở thành Citadel. Việc của bạn là biến bộ khung P/Q thành một quy trình chạy được trên các ràng buộc thật của VN — và làm nó một cách trung thực hơn 90% người đang giao dịch quanh bạn.


## 2. Cấu trúc thị trường Việt Nam — cơ chế bạn phải thuộc

Trước khi viết một dòng alpha, bạn phải thuộc lòng bộ luật vật lý của sân chơi. Trong cả P-World lẫn Q-World, mọi công thức đều ngầm giả định một microstructure lý tưởng: bạn mua bán được ở đúng giá bạn thấy, không giới hạn hai chiều, thanh toán tức thời, thanh khoản vô hạn. Thị trường VN vi phạm gần hết các giả định đó theo những cách rất cụ thể — và mỗi vi phạm là một chỗ mà một backtest ngây thơ sẽ nói dối bạn, thường là nói dối *có lợi cho bạn*, tức khoe một Sharpe mà tài khoản thật không bao giờ chạm tới. Mục này liệt kê từng cơ chế và, quan trọng hơn, **ý nghĩa giao dịch** của nó: cái gì bạn không được làm, cái gì backtest không được giả định, cái gì mở ra edge mà thị trường phát triển không cho không. Đây là nền để mục 3 (những ràng buộc phá vỡ chiến lược trong sách) và mục 7 (backtest engine) đứng lên — đọc kỹ một lần ở đây, hai mục sau chỉ việc tham chiếu ngược lại.

### 2.1 Ba sàn và các chỉ số

Chứng khoán VN chia làm **ba sàn**. **HOSE** (còn gọi HSX, đặt tại TP.HCM) là sàn của large-cap và là nơi thanh khoản dồn về — đây là sân chính của bạn. **HNX** (Hà Nội) nhỏ hơn, và **UPCoM** dành cho công ty đại chúng chưa niêm yết chuẩn — thanh khoản mỏng, biên độ rộng hơn, rủi ro cao, nên tránh cho bot định lượng trừ khi bạn biết chính xác mình đang làm gì.

Chỉ số cần thuộc: **VN-Index** phủ toàn bộ HOSE (đây là "thị trường" khi người ta nói thị trường lên hay xuống); **VN30** là rổ 30 large-cap thanh khoản nhất HOSE, **đổi định kỳ khoảng 2 lần/năm**. VN30 là trục xương sống của toàn bộ tài liệu này vì ba lý do sẽ lặp lại xuyên suốt: nó là universe long-only mặc định (thanh khoản dày, ít bị đội lái), nó là tài sản cơ sở của hợp đồng phái sinh chủ lực mà retail dùng được (VN30 Index Futures, mục 4), và bản thân việc rổ đổi định kỳ mở ra một sự kiện event-driven có thể khai thác (index rebalance, mục 6). Ngoài ra có HNX-Index, VN100, VNMidcap, VNSmallcap — hữu ích để phân tầng thanh khoản khi bạn cần một universe rộng hơn, nhưng đừng để một tín hiệu "đẹp" trên smallcap dụ bạn ra ngoài rổ large-cap: phần lớn cái "đẹp" đó là sóng làm giá chứ không phải edge (mục 3).

### 2.2 Giờ giao dịch và ba phiên khớp lệnh

Ngày giao dịch cổ phiếu chia làm phiên sáng **9:00–11:30** và phiên chiều **13:00–14:45**, và — đây là điểm khác biệt lớn nhất so với microstructure trong Ch12 P-World — nó **không phải một phiên khớp lệnh liên tục duy nhất**. Cấu trúc gồm ba giai đoạn khác nhau về bản chất khớp lệnh:

- **ATO** (khớp lệnh mở cửa, 9:00–9:15): một phiên đấu giá định kỳ (call auction) xác định giá mở cửa. Lệnh gom lại rồi khớp một lần ở **một mức giá clearing duy nhất** — không có khái niệm "khớp dần" trong giai đoạn này.
- **Khớp lệnh liên tục** (continuous matching): đây là giai đoạn giống mô hình sổ lệnh limit-order-book chuẩn trong sách, khớp theo ưu tiên giá–thời gian. Phần lớn thanh khoản nội phiên nằm ở đây.
- **ATC** (khớp lệnh đóng cửa, 14:30–14:45): lại là một call auction, xác định **giá đóng cửa** — chính là mức bạn thường dùng làm giá tham chiếu cho phiên sau và làm giá điều chỉnh trong data lịch sử.

Ngoài ra còn có **phiên thỏa thuận** (block/negotiated trades) — nơi các lệnh lớn khớp trực tiếp theo thương lượng, ngoài sổ lệnh liên tục.

**Ý nghĩa giao dịch.** Hai phiên ATO/ATC là call auction, nên khái niệm "spread bid-ask tại thời điểm khớp" của Ch12 không áp dụng nguyên: giá đóng cửa là giá clearing của cả một tập lệnh gom lại, không phải mid-price của một sổ lệnh đang chạy liên tục. Nếu chiến lược của bạn tính tín hiệu trên giá close (ATC) rồi giả định vào lệnh tại chính giá đó, bạn đang phạm một dạng look-ahead tinh vi: tại đúng lúc bạn *biết* giá ATC, phiên đã đóng, không còn ai để khớp nữa. Đây chính là cạm bẫy look-ahead của Ch9 P-World (Backtesting), nhưng ở VN nó sắc hơn một bậc vì giá close sinh ra từ một cơ chế đấu giá riêng chứ không phải là giao dịch cuối cùng của phiên liên tục — bạn không thể lập luận "thì tôi đặt lệnh ngay sát giờ đóng" để né. Quy tắc an toàn, sẽ đóng đinh trong engine ở mục 7: tín hiệu tính trên close của ngày $t$ chỉ được phép thực thi từ phiên $t+1$ trở đi.

### 2.3 Lô chẵn 100 và bước giá (tick size)

Lô giao dịch chuẩn (lô chẵn) trên HOSE là **100 cổ phiếu**; số lẻ 1–99 cổ phiếu (lô lẻ) giao dịch theo cơ chế riêng, thanh khoản kém. Với người xây danh mục, điều này nghĩa là **số lượng cổ phiếu mỗi lệnh phải làm tròn về bội số của 100** — bạn không đặt được vị thế "137 cổ phiếu" một cách trơn tru. Ràng buộc lô chẵn này ăn thẳng vào bài toán position sizing của Ch11 P-World (Portfolio construction): với tài khoản nhỏ và cổ phiếu giá cao, bước nhảy 100 cổ phiếu có thể là một phần đáng kể vốn, làm trọng số danh mục thực tế lệch khỏi mục tiêu tối ưu mà bộ tối ưu hóa trả về. Đây là một nguồn tracking error hệ thống mà backtest phải mô phỏng chứ không được bỏ qua — nếu không, engine sẽ giả định bạn nắm được đúng trọng số phân số mà thị trường không cho phép.

**Bước giá (tick)** trên HOSE phụ thuộc mức giá:

| Mức giá cổ phiếu | Bước giá (tick) |
|---|---|
| $< 10.000$đ | 10đ |
| $10.000$–$< 50.000$đ | 50đ |
| $\ge 50.000$đ | 100đ |

Tick không đồng nhất nghĩa là spread tối thiểu tính theo phần trăm khác nhau rõ rệt giữa các mã. *Ví dụ minh họa (giá cổ phiếu là số giả định):* một cổ phiếu giá 12.000đ có tick 50đ, tức một bước giá đã là $50/12000 \approx 0{,}42\%$; một cổ phiếu 80.000đ có tick 100đ, chỉ $100/80000 = 0{,}125\%$. Cổ phiếu giá thấp chịu spread tương đối lớn hơn — một cost drag mà cost model của bạn (mục 7) nên phản ánh theo từng mã thay vì áp một hằng số phí phẳng cho toàn universe. Chi tiết này nhỏ, nhưng với chiến lược turnover cao nó là hiệu số giữa "lãi trên giấy" và "lỗ thật".

### 2.4 Thanh toán T+2 — luật vật lý quan trọng nhất

Chu kỳ thanh toán là **T+2**: cổ phiếu bạn mua chỉ thực sự về tài khoản vào khoảng ngày T+2, và **cổ phiếu vừa mua CHƯA bán được cho tới khi nó về**. (Trước đây là T+3; hệ thống KRX đang mở đường cho T+1.)

**Ý nghĩa giao dịch — đây là ràng buộc bạn phải khắc cốt.** Trên thị trường cơ sở, bạn **không thể day-trade cùng một lô cổ phiếu**: mua sáng nay thì không bán được đúng lô đó chiều nay hay ngày mai, phải chờ tới khi cổ phiếu về (~T+2). Hệ quả trực tiếp cho quant: mọi chiến lược high-turnover intraday hay mean-reversion nhanh *trên cổ phiếu* — vốn là xương sống của nhiều ví dụ trong Ch7 (Alpha research) và Ch9 (Backtesting) P-World — **không chạy được nguyên trạng trên equity VN**. Turnover thực tế bị chặn cứng bởi chu kỳ nắm giữ tối thiểu ~2 phiên. Nếu bạn cần tốc độ intraday và giao dịch được cả hai chiều, sân chơi phải chuyển sang VN30 futures (mục 4), nơi giao dịch intraday được phép và cơ chế thanh toán không khóa vị thế như cổ phiếu cơ sở. Backtest engine (mục 7) bắt buộc phải mã hóa T+2 như một hard constraint — nếu không, nó sẽ báo cáo một turnover và một Sharpe mà thị trường cơ sở, xét thuần vật lý thanh toán, không cho phép bạn đạt được. Đây là dạng lỗi backtest nguy hiểm nhất vì nó không crash, nó chỉ lặng lẽ thổi phồng kết quả.

### 2.5 Biên độ dao động ±7/10/15% — trần, sàn, và bẫy khớp lệnh

Mỗi phiên, giá mỗi mã chỉ được dao động trong một **biên độ** quanh giá tham chiếu: HOSE **±7%**, HNX **±10%**, UPCoM **±15%**. Ngày chào sàn (giao dịch đầu tiên) biên rộng hơn (HOSE ±20%). Chạm biên trên gọi là **giá trần** ("kịch trần"), chạm biên dưới là **giá sàn** ("kịch sàn").

**Ý nghĩa giao dịch — và cái bẫy backtest lớn nhất.** Khi một cổ phiếu kịch trần, gần như *ai cũng muốn mua và không ai muốn bán*; khi kịch sàn thì ngược lại. Ở hai trạng thái này **thường không có bên đối ứng để khớp**: bạn treo lệnh mua ở giá trần nhưng không có người bán, lệnh của bạn nằm im **không khớp**. Đây là điều một backtest ngây thơ luôn làm sai — nó thấy trong data "giá đóng cửa = giá trần" và hồn nhiên giả định lệnh của bạn được fill ở đó, biến một phiên bạn *không thể mua được* thành một phiên bạn mua trọn vẹn. **Backtest KHÔNG được giả định luôn khớp ở giá trần/sàn.** Cách làm đúng là mô hình hóa xác suất không-khớp khi mã chạm biên, và coi các phiên kịch biên như một chế độ khớp lệnh riêng (chi tiết ở mục 7).

Biên độ còn đặt một trần cứng lên phân phối return ngày: return một phiên trên HOSE bị chặn trong $[-7\%, +7\%]$. Điều này bóp đuôi phân phối và ảnh hưởng tới mọi ước lượng rủi ro trong Ch14 (Risk management) P-World — VaR và vol tính từ dữ liệu bị censoring ở biên sẽ thiên lệch xuống, khiến bạn *đánh giá thấp* rủi ro thật. Và một chuỗi "kịch sàn nhiều phiên liên tiếp" chính là dấu hiệu một cú sập bị biên độ *trải mỏng ra nhiều ngày* thay vì rơi hết trong một phiên: cú giảm 25% ngoài đời có thể hiện ra trong data thành bốn phiên sàn trông "hiền" — một cái bẫy khác cho bất kỳ mô hình rủi ro nào đọc return ngày một cách máy móc.

### 2.6 Room ngoại và dòng tiền khối ngoại

Mỗi mã có **trần tỷ lệ sở hữu nước ngoài** (room ngoại): nhiều mã ở mức 49%, riêng ngân hàng 30%. Mã **hết room** thì nhà đầu tư nước ngoài chỉ mua thêm được qua thỏa thuận, và thường phải trả **premium**. Song song, **giao dịch mua/bán ròng của khối ngoại được công bố hằng ngày theo từng mã**.

**Ý nghĩa giao dịch.** Foreign flow (dòng tiền khối ngoại mua/bán ròng) là **một nguồn tín hiệu đặc thù VN** — một dòng dữ liệu công khai, hằng ngày, theo từng mã, có thể trở thành feature (mục 6) mà nhiều thị trường phát triển không phơi bày sẵn một cách gọn gàng như vậy. Đây là một trong số ít chỗ VN cho bạn *nhiều* thông tin hơn thị trường phát triển, chứ không ít hơn. Room ngoại thì là một ràng buộc mềm cần biết khi xây danh mục: một mã sắp hết room có động lực giá riêng (cầu ngoại dồn nén), và nếu bạn giao dịch qua tài khoản có yếu tố nước ngoài thì khả năng vào lệnh có thể bị chặn ở mã đã hết room — universe khả dụng của bạn hẹp hơn universe trên bảng giá.

### 2.7 Bối cảnh 2025–2028: thị trường đang chuyển mình

Ba diễn biến định hình 3 năm tới, và cả ba đều là lý do để kiến trúc hệ thống của bạn **tách cấu hình cơ chế khỏi logic chiến lược** — vì chính các con số cơ chế sẽ đổi dưới chân bạn:

- **Hệ thống KRX go-live 5/5/2025** (công nghệ Hàn Quốc): nền tảng kỹ thuật cho T+0, bán khống, options và settlement nhanh hơn — nhưng phần lớn tính năng **rollout dần trong 2026–2028**, còn chờ khung pháp lý. Nghĩa là: đừng viết chiến lược dựa trên một tính năng "sắp có" cho tới khi nó thực sự bật.
- **FTSE Russell nâng hạng VN lên Emerging Market** (secondary emerging): kéo dòng vốn ngoại thụ động (ETF và quỹ index) vào các mã trong rổ → mở cơ hội **event-driven** quanh nâng hạng và rebalance rổ chỉ số.
- **CCP** (central counterparty clearing) dự kiến khoảng **Q1/2027** — hạ tầng bù trừ đối tác trung tâm, nền tảng cho nhiều sản phẩm mới và cho việc giảm rủi ro thanh toán.

Với retail ở thời điểm hiện tại, **bán khống cổ phiếu cơ sở vẫn CHƯA làm được** (đang xây lộ trình triển khai dần trong 2026–2028); muốn short hay đòn bẩy hai chiều thì dùng VN30 futures. Chính vì lịch trình mở tính năng còn phụ thuộc khung pháp lý và có thể trượt, quy tắc kỹ sư ở đây rất rõ: đừng hardcode "T+2" hay "±7%" rải rác khắp code — đặt chúng vào một **registry cấu hình cơ chế thị trường** để khi T+1 hay short retail bật lên, bạn đổi đúng một chỗ chứ không phải viết lại engine. Đây không phải lời khuyên chung chung về "code sạch"; nó là hệ quả trực tiếp của việc bạn đang xây trên một thị trường mà các hằng số microstructure có ngày hết hạn.

### 2.8 Bảng tóm tắt cơ chế

| Cơ chế | Con số / quy định | Ý nghĩa giao dịch |
|---|---|---|
| Sàn | HOSE (large-cap), HNX, UPCoM | Bám HOSE/VN30; tránh UPCoM cho bot |
| Chỉ số | VN-Index (toàn HOSE), VN30 (30 large-cap, đổi ~2 lần/năm) | VN30 = universe + tài sản cơ sở futures + event rebalance |
| Giờ | Sáng 9:00–11:30, chiều 13:00–14:45 | Không phải một phiên liên tục duy nhất |
| Phiên | ATO (9:00–9:15), khớp liên tục, ATC (14:30–14:45), thỏa thuận | Close = giá call-auction; tín hiệu trên close thực thi từ $t+1$ |
| Lô chẵn | 100 cổ phiếu (HOSE) | Position size làm tròn bội số 100 → tracking error |
| Tick | <10k: 10đ; 10k–<50k: 50đ; ≥50k: 100đ | Spread tương đối lớn hơn ở cổ phiếu giá thấp |
| Thanh toán | T+2 (đang hướng T+1) | Không day-trade cùng lô ở cổ phiếu; turnover bị chặn |
| Biên độ | HOSE ±7%, HNX ±10%, UPCoM ±15% (chào sàn HOSE ±20%) | Kịch trần/sàn thường KHÔNG khớp → backtest không được giả định fill |
| Room ngoại | Nhiều mã 49%, ngân hàng 30% | Hết room → chặn mua; foreign flow = tín hiệu đặc thù |
| Short cơ sở | Retail CHƯA làm được (lộ trình 2026–2028) | Muốn short/leverage → VN30 futures |
| Bối cảnh | KRX 5/2025; FTSE EM; CCP ~Q1/2027 | Cấu hình cơ chế phải tách khỏi logic → dễ đổi khi T+1/short bật |

Nắm chắc mười một dòng bảng này, bạn đã có bộ ràng buộc để đối chiếu mọi chiến lược trong hai cuốn sách: cái nào chạy thẳng trên equity VN, cái nào phải lách (mục 3), và cái nào buộc phải chuyển sang futures (mục 4). Mọi mục còn lại của chương này đều là hệ quả của mười một dòng đó.


## 3. Những ràng buộc phá vỡ chiến lược trong sách — và cách lách

Cuốn P viết cho một thị trường lý tưởng hóa: bạn short được mọi thứ, khớp lệnh ở gần như mọi mức giá, và có hàng chục năm dữ liệu sạch để kiểm định. Thị trường Việt Nam vi phạm gần như tất cả các giả định đó. Mục này soi từng ràng buộc cấu trúc của VN vào từng lớp chiến lược trong P, chỉ ra chỗ gãy, và — quan trọng hơn — chỉ ra đường lách khả thi. Nguyên tắc xuyên suốt: **một ràng buộc hiếm khi giết chết edge; nó ép edge phải chảy qua một công cụ khác** (thường là VN30 futures) hoặc **thu hẹp universe** về đúng vùng edge còn sống được. Đọc mục này như một bộ lọc: trước khi bê bất kỳ chiến lược nào từ cuốn P sang VN, chạy nó qua năm ràng buộc dưới đây.

### 3.1. Chưa short được cổ phiếu — lớp market-neutral/pairs/stat-arb không chạy trực tiếp

Đây là ràng buộc nặng nhất. Retail VN **hiện chưa bán khống được cổ phiếu cơ sở** (lộ trình securities borrowing & lending + covered short đang được xây dần trong giai đoạn 2026–2028 qua hệ thống KRX, còn chờ khung pháp lý). Toàn bộ họ chiến lược mà cuốn P dựng trên khả năng short một rổ cổ phiếu đều **không thể triển khai nguyên trạng**:

- **Long/short equity** (Ch15 — bản đồ chiến lược): vế short không thực thi được ở tầng cổ phiếu → chiến lược sập một nửa.
- **Pairs trading & statistical arbitrage** (Ch7 alpha research, Ch15): logic cốt lõi là long cái rẻ / short cái đắt trong một cặp cointegrated. Không short → chỉ còn nửa vế long; mà nửa vế long-only của một pair không còn là market-neutral, nó chỉ là một directional bet kém hedged.
- **Factor-neutral / dollar-neutral portfolio** (Ch11 portfolio construction): trung hòa beta bằng cách short một factor portfolio không làm được ở tầng cổ phiếu.

Cách lách có ba tầng, xếp theo mức độ khả thi:

1. **Đẩy toàn bộ nhu cầu short/hedge sang VN30 futures.** VN30 Index Futures (niêm yết HNX từ 8/2017) cho **long/short cả hai chiều, giao dịch intraday, đòn bẩy**, hệ số nhân 100.000 VND/điểm chỉ số. Một chiến lược "long một rổ cổ phiếu + short VN30 futures để trung hòa beta thị trường" **tái tạo được tinh thần market-neutral** của Ch11/Ch14 mà không cần short từng cổ phiếu. Bạn không còn cross-sectional short từng mã, nhưng bạn khử được rủi ro thị trường hệ thống — phần chiếm phần lớn variance của một danh mục cổ phiếu VN. Chi tiết cấu trúc beta-hedge này thuộc Mục 8.

2. **Chuyển pairs sang long-only relative strength.** Thay vì long A / short B, giữ **long A khi A mạnh hơn B**, và thoát về tiền (hoặc luân chuyển sang mã khác) khi tín hiệu đảo. Đây là bản long-only của cross-sectional momentum (Ch7), không phải stat-arb thực thụ: bạn mất tính hedged và ăn trọn beta thị trường, nhưng vẫn khai thác được phần relative strength giữa hai mã.

3. **Chờ hạ tầng.** Khi SBL/covered short mở cho retail (lộ trình dần trong 2026–2028), một phần của Ch15 sẽ "mở khóa". Đến lúc đó, nền forward/futures và Greeks của Q-World (Ch2 nền tảng, Ch9 lãi suất) sẽ thành công cụ định giá cần thiết. Nguyên tắc production: **không thiết kế hệ thống hôm nay dựa trên một tính năng chưa tồn tại**.

### 3.2. T+2 — chặn day-trade ở thị trường cơ sở

Chu kỳ thanh toán ở thị trường cơ sở là **T+2**: cổ phiếu vừa mua **chưa bán được cho tới khi về tài khoản (~T+2)**. Hệ quả trực tiếp: mọi chiến lược intraday / high-frequency trên cổ phiếu cash **không chạy được**. Cụ thể trong P:

- **HFT & market-making tầng microstructure** (Ch12 microstructure, Ch13 execution): không khả thi ở cash equity cho retail — vừa vì T+2 khóa vòng quay trong ngày, vừa vì không có hạ tầng co-location.
- **Intraday mean-reversion trên cổ phiếu** (Ch7): một lô mua sáng nay không thể bán chiều nay để bắt dao động trong phiên.

Cách lách: **đẩy toàn bộ nhu cầu intraday sang VN30 futures**, nơi cho phép mở/đóng vị thế trong cùng một ngày. Còn ở tầng cổ phiếu, chấp nhận **holding period tối thiểu ~vài ngày** như một hard constraint của backtest — nghĩa là các alpha bạn nhắm tới phải là **swing/position** (nắm giữ từ vài ngày đến vài tuần/tháng), không phải intraday. Ràng buộc này thực ra lọc bạn về đúng vùng mà Ch7–Ch8 cho thấy edge behavioral bền hơn: momentum và reversal đa-ngày, không phải noise trong phiên. (Bối cảnh: hệ thống KRX đang hướng tới rút ngắn chu kỳ về T+1, nhưng đây là mốc chưa chốt — đừng thiết kế production dựa vào nó.)

### 3.3. Biên độ ±7% — hiện tượng trần/sàn phá vỡ giả định khớp lệnh

Biên độ dao động giá trong ngày ở HOSE là **±7%** (HNX ±10%, UPCoM ±15%; ngày chào sàn biên rộng hơn). Chạm biên trên = **giá trần** ("kịch trần"), chạm biên dưới = **giá sàn** ("kịch sàn"). Điểm chí tử cho backtest: **khi mã kịch trần/kịch sàn, thường không có bên đối ứng để khớp** — ai cũng muốn mua khi trần, muốn bán khi sàn — nên lệnh của bạn **có thể không khớp**.

Đây là chỗ một backtest ngây thơ nói dối trắng trợn nhất. Các chiến lược nhạy cảm:

- **Momentum / breakout** (Ch7, Phụ lục A — momentum worked example): tín hiệu "giá bứt phá mạnh" thường trùng đúng ngày mã kịch trần — chính là ngày bạn **không mua được**. Backtest giả định khớp ở giá trần sẽ **thổi phồng return một cách hệ thống**, vì nó ghi nhận đúng những cú entry mà đời thực bị bỏ lỡ.
- **Reversal / mean-reversion** (Ch7): tín hiệu "quá bán" hay xuất hiện ở mã kịch sàn — bạn muốn bắt đáy nhưng không ai bán cho bạn ở giá sàn; ngược lại khi bạn muốn thoát một mã đang sàn, không ai mua để bạn ra hàng.

Cách lách nằm ở **kỷ luật của engine backtest** (chi tiết Mục 7), tóm tắt bằng một quy tắc khớp lệnh:

$$\text{fill}_{t} = \begin{cases} \text{no fill} & \text{nếu } P_t = P_{\text{trần}}\ \text{(lệnh mua)}\ \text{hoặc}\ P_t = P_{\text{sàn}}\ \text{(lệnh bán)}\\ \text{fill kèm slippage} & \text{ngược lại}\end{cases}$$

Cụ thể: (1) **cấm khớp lệnh mua ở giá trần và lệnh bán ở giá sàn** trong mô phỏng; (2) khi mã chạm biên, giả định **thanh khoản bốc hơi** ở đúng phía bạn cần — model đúng việc "không khớp" thay vì khớp ảo; (3) coi những ngày locked-limit như **missed trades**, và tính cả cái giá của việc kẹt hàng khi một mã nằm sàn nhiều phiên liên tiếp mà bạn không thoát được. Ràng buộc này thực chất là một **limit to arbitrage** rất đặc thù VN (Ch8): edge tồn tại trên giấy nhưng cơ chế thị trường chặn bạn thu hoạch đúng lúc nó lớn nhất.

### 3.4. Thanh khoản dồn vào VN30 — lọc universe trước, tối ưu sau

Thanh khoản **dồn vào VN30 + large-cap**; ra ngoài rổ đó thanh khoản mỏng, khó khớp. Đi kèm là rủi ro **đội lái (pump-and-dump)** trên mid/small-cap: một "tín hiệu đẹp" trên mã mỏng thường chỉ là sóng làm giá, không phải alpha.

Ảnh hưởng lên P: bất kỳ chiến lược cross-sectional nào quét toàn bộ vài trăm mã HOSE (Ch7 alpha, Ch11 construction) sẽ **tự động nạp rủi ro vào danh mục** — vì các tín hiệu mạnh nhất về mặt thống kê hay nằm ở đuôi smallcap thanh khoản mỏng, đúng chỗ market impact nuốt hết edge và đội lái tạo tín hiệu giả. Một backtest tính return trên universe rộng mà không trừ impact sẽ **đẹp một cách giả tạo**.

Cách lách: **lọc universe là bước đầu tiên, không phải bước tối ưu.** Universe long-only mặc định nên là **VN30** (hoặc mở rộng đến VN100), cộng một sàng **ADV** (average daily volume) để loại những mã mà kích thước lệnh của bạn vượt một tỷ lệ nhỏ của thanh khoản ngày. Chỉ mã qua được cả hai lưới mới cho vào rổ tín hiệu. Đây là hiện thân VN của "capacity constraint" trong Ch11/Ch13: alpha đo trên những mã bạn không giao dịch được ở quy mô thật là alpha không tồn tại.

### 3.5. Lịch sử dữ liệu ngắn — overfitting cực dễ

VN-Index có dữ liệu từ năm 2000, còn **VN30 futures chỉ từ 2017**. Chuỗi ngắn nghĩa là số "regime" độc lập bạn quan sát được rất ít, trong khi số siêu tham số bạn có thể vặn thì gần như vô hạn — công thức hoàn hảo cho **overfitting**. Điều này đánh thẳng vào Ch9 (backtesting) và Ch4 (regime & structural change): một Sharpe 2.0 trên 5 năm dữ liệu futures rất có thể chỉ là may mắn của một–hai regime, không phải một edge bền.

Cách lách là **áp kỷ luật thống kê của Ch9, siết chặt hơn cả bản gốc**: dùng **deflated Sharpe ratio** để phạt số lần thử; **purged & embargoed cross-validation** để tránh leakage qua ranh giới train/test; và ưu tiên **ít tham số, kinh tế học rõ ràng** hơn là một mô hình khớp đẹp mà mù mờ nguyên nhân. Với dữ liệu ngắn thế này, một alpha "giải thích được vì sao nó tồn tại" (retail behavioral, foreign flow) đáng tin hơn nhiều một alpha "backtest đẹp mà không rõ vì sao".

### 3.6. Bảng tổng hợp — chiến lược cuốn P nào chạy thẳng / phải chỉnh / không dùng được ở VN

| Chiến lược / khái niệm (chương P) | Trạng thái ở VN | Ràng buộc chặn | Cách lách |
|---|---|---|---|
| Cross-sectional momentum long-only (Ch7, Phụ lục A) | **Chạy thẳng** (chỉnh nhỏ) | Trần/sàn ở ngày breakout; smallcap | Lọc universe VN30+ADV; cấm khớp ở trần |
| Time-series momentum / trend trên chỉ số (Ch7, Ch16) | **Chạy thẳng** | — | Long-only trên rổ, hoặc thực thi qua VN30 futures |
| Reversal / mean-reversion đa-ngày (Ch7) | **Phải chỉnh** | Sàn khóa lệnh; T+2 | Holding ≥ vài ngày; cấm khớp ở sàn |
| Factor models long-only: value/quality/size (Ch6) | **Phải chỉnh** | Không short → không factor-neutral | Long-only tilt; hedge beta bằng VN30 futures |
| Pairs trading / stat-arb (Ch7, Ch15) | **Không dùng được** trực tiếp | Chưa short cổ phiếu | Chuyển sang long-only relative strength; chờ SBL 2026–2028 |
| Long/short & market-neutral equity (Ch11, Ch14, Ch15) | **Không dùng được** nguyên trạng | Chưa short cổ phiếu | Beta-hedge bằng VN30 futures (Mục 8) |
| Intraday mean-reversion trên cổ phiếu (Ch7) | **Không dùng được** | T+2 | Đưa intraday sang VN30 futures |
| HFT / market-making (Ch12, Ch13) | **Không dùng được** | T+2; không co-location | Bỏ; ngoài tầm retail VN |
| Vol-targeting / risk parity sizing (Ch11, Ch14) | **Chạy thẳng** | — | Áp trực tiếp lên rổ long-only hoặc danh mục futures |
| Kelly / fractional-Kelly sizing (Ch14) | **Chạy thẳng** (thận trọng) | Dữ liệu ngắn → ước lượng edge kém tin | Dùng fractional Kelly; siết theo Sharpe deflated |
| Regime detection & structural break (Ch4) | **Chạy thẳng** (cẩn trọng) | Chuỗi ngắn → ít regime | Ít tham số; xác nhận out-of-sample (Mục 9) |
| Backtest tiêu chuẩn (Ch9) | **Phải chỉnh mạnh** | Trần/sàn, corporate action, data ngắn | Engine VN riêng (Mục 7); deflated Sharpe, purged CV |
| Behavioral alpha / limits to arbitrage (Ch8) | **Chạy thẳng — thậm chí mạnh hơn** | — | Retail ~85–90% volume → noise trader dày; edge đảo chiều/dòng tiền lớn hơn |

Điểm cần nhớ: cột "không dùng được" gần như luôn là hệ quả của **một** ràng buộc (chưa short, hoặc T+2), và gần như luôn có **một** đường vòng — qua VN30 futures, hoặc qua việc thu hẹp về position-trading long-only. Ngược lại, lớp behavioral của Ch8 không những không bị chặn mà còn **được khuếch đại** bởi cấu trúc retail-nặng (~85–90% khối lượng là nhà đầu tư cá nhân) của thị trường VN — đó là lý do các Mục 6 (tín hiệu alpha) và 11 (template) sẽ dồn trọng tâm vào đó, thay vì vào bộ máy long/short kinh điển của sách.


## 4. Hai sân chơi: VN30 futures vs long-only equity

Trước khi viết một dòng code alpha nào, người làm quant ở Việt Nam phải trả lời một câu rất cụ thể: *tôi sẽ trade cái gì?* Đây không phải câu hỏi cảm tính — nó quyết định **bạn được dùng bao nhiêu phần của cuốn P-World**. Lý do rất trực tiếp: hai kỹ thuật xương sống của quant hiện đại — bán khống (short) và đòn bẩy (leverage) — **trên cổ phiếu cơ sở ở VN thì retail hiện chưa làm được**, và lộ trình securities borrowing & lending mới đang được xây dần cho giai đoạn 2026–2028 (còn chờ khung pháp lý qua hệ thống KRX). Bất cứ chiến lược nào trong sách mặc định "short cổ phiếu là chuyện đương nhiên" đều gãy ngay khúc này (chi tiết ràng buộc ở Mục 3).

Trên thực tế, retail VN có ba sân chơi khả dụng, mỗi sân mở khóa một tập con khác nhau của bộ đồ nghề.

### (A) VN30 Index Futures — engine systematic chính

Đây là sân **duy nhất** cho phép cả long lẫn short, giao dịch **intraday** (mua bán trong ngày, không dính chu kỳ T+2 như thị trường cơ sở) và có **đòn bẩy** thật. Vì thế nó là nơi bạn áp được **gần trọn** bộ đồ nghề của cuốn P: từ Ch5 (lý thuyết danh mục), Ch7 (alpha research), Ch9 (backtesting), Ch11 (portfolio construction), Ch13 (execution) cho tới Ch14 (risk management). Tài sản cơ sở là **chỉ số VN30 spot**, nên đây cũng chính là điểm nối với Q-World Ch2 (nền tảng forward/futures) và Ch9 (lãi suất, basis futures–spot).

**Specs cần thuộc lòng:**

- **Hệ số nhân: 100.000 VND/điểm chỉ số.** Notional một hợp đồng $= \text{giá futures VN30} \times 100.000$ VND.
- *Ví dụ minh họa:* VN30 ở $\sim 1.300$ điểm $\Rightarrow$ notional $= 1.300 \times 100.000 = 130.000.000$ VND $\approx$ **130 triệu VND/hợp đồng**. Mỗi điểm chỉ số nhích $\Rightarrow$ P&L đổi 100.000 VND/hợp đồng.
- **Ký quỹ (margin) chỉ một phần notional** — tỷ lệ do VSD/CTCK quy định và thay đổi theo thời kỳ, nên đừng đóng đinh con số %. Ý niệm thực hành: bạn không cần bỏ ra cả 130 triệu; **ký quỹ chỉ một phần, đòn bẩy cỡ $\sim 5\times$**. Đòn bẩy là con dao hai lưỡi — nó khuếch đại cả lãi lẫn lỗ (xem cảnh báo ở cuối mục).
- **Tháng đáo hạn:** tháng hiện tại, tháng kế, và 2 tháng cuối của 2 quý gần nhất. **Ngày đáo hạn: thứ Năm thứ ba** của tháng đáo hạn. Ngày này quan trọng vì khi đó basis (chênh futures–spot) hội tụ về 0 và thanh khoản dịch sang tháng kế — hệ thống của bạn phải biết **roll** vị thế trước khi đáo hạn, nếu không sẽ bị cuốn vào thanh toán và nhiễu giá cuối phiên.

Vì cho short và intraday, VN30 futures là nơi duy nhất bạn chạy được các họ chiến lược **directional hai chiều** (long *và* short theo tín hiệu), **trend-following intraday**, và các mô hình mean-reversion trong ngày. Đó là lý do nó xứng đáng làm *engine systematic chính* cho ai đã đủ chín tay.

### (B) Long-only equity — mua-giữ-bán VN30/large-cap

Sân "hiền" nhất: chỉ **mua rồi giữ rồi bán**, rebalance theo tháng, universe bám **VN30 / large-cap** (thanh khoản dày, ít bị đội lái làm giá). Bạn vẫn dùng được cả một mảng lớn của cuốn P — Ch5 (danh mục), Ch6 (factor models), Ch7 (alpha research) — **nhưng phải cắt bỏ toàn bộ leg short**. Một alpha long/short trong sách, ở đây chỉ giữ lại nửa long: chọn nhóm cổ phiếu *điểm cao nhất* để mua, và bỏ luôn ý định bán khống nhóm điểm thấp.

Ba ràng buộc đặc thù phải khắc vào đầu:

- **T+2:** cổ phiếu vừa mua **chưa bán được cho tới khi về tài khoản** ($\sim$ chiều/ngày T+2). Không có chuyện lướt cùng một lô trong ngày ở thị trường cơ sở. Với rebalance theo tháng thì ràng buộc này ít cắn, nhưng execution logic vẫn phải tôn trọng nó.
- **Biên độ $\pm 7\%$/ngày trên HOSE**, và khi cổ phiếu **kịch trần/kịch sàn thì thường không có bên đối ứng để khớp** (ai cũng muốn mua khi trần, muốn bán khi sàn). Backtest **không được** giả định luôn khớp ở giá trần/sàn — đây là một trong những cái bẫy lớn nhất (xem Mục 7).
- **Chi phí vòng.** *Ví dụ minh họa* (khớp với running example của tài liệu): mua cổ phiếu HOSE giá 50.000đ, phí môi giới $\sim 0{,}2\%$/chiều (mua và bán), thuế thu nhập khi bán $0{,}1\%$ trên giá trị bán (thu mỗi lần bán, bất kể lãi/lỗ). Vòng mua + bán $\Rightarrow$ chi phí $\approx 0{,}2\% + 0{,}2\% + 0{,}1\% \approx \mathbf{0{,}5\%}$. Con số này chính là "điểm gãy chi phí" mà Ch8–9 cuốn P nói tới: một tín hiệu chỉ đáng trade nếu alpha kỳ vọng mỗi vòng **vượt xa** 0,5% sau khi trừ slippage. Nó cũng là lý do vì sao rebalance theo tháng (chứ không phải hằng ngày) mới hợp lý với long-only VN.

### (C) Chứng quyền có bảo đảm (Covered Warrant, CW)

Do công ty chứng khoán phát hành, niêm yết trên HOSE, **chủ yếu là call** trên cổ phiếu cơ sở. Có **đòn bẩy directional**, giao dịch **T+2**, và **không cho short**. CW cho bạn một vị thế đòn bẩy theo một chiều (thường là kỳ vọng tăng của mã cơ sở) mà không phải mở tài khoản phái sinh. Nhưng vì mang bản chất option (giá phụ thuộc thời gian còn lại và độ biến động ngầm định), muốn định giá và quản trị CW cho tử tế bạn cần nền Greeks của Q-World (Ch5–6) — thứ mà đa số retail bỏ qua rồi lỗ vì "time decay" mà không hiểu tại sao. Với người mới, CW **không** phải điểm khởi đầu: nó là công cụ hẹp, chỉ dùng khi đã hiểu rủi ro option.

### Khi nào dùng sân nào

| Nhu cầu | Sân phù hợp | Được short? | Đòn bẩy | Intraday? | Phần P/Q dùng được |
|---|---|---|---|---|---|
| Học nghề, không muốn đòn bẩy giết tài khoản | **(B) Long-only** | Không | Không | Không (T+2) | Ch5–7 (bỏ leg short), Ch9, Ch11, Ch14 |
| Directional hai chiều, trend intraday, hedge danh mục | **(A) VN30 futures** | **Có** | **Có** ($\sim 5\times$) | **Có** | Gần trọn cuốn P; Q Ch2, Ch9 |
| Đặt cược tăng có đòn bẩy, không mở tài khoản phái sinh | **(C) CW** | Không | Có (option) | Không (T+2) | Q Ch5–6 (Greeks) |

### Lời khuyên lộ trình: bắt đầu ở sân B

Nếu bạn là người mới, **hãy khởi động ở sân (B) long-only**, không phải (A). Lý do rất thực dụng: đòn bẩy của futures khuếch đại lỗi. Một hệ thống còn non — sai chỗ nào đó trong data điều chỉnh corporate action (Mục 5), hay backtest quá lạc quan (Mục 7) — nếu chạy trên long-only thì bạn mất tiền *tuyến tính* và còn thời gian sửa. Cũng con lỗi đó chạy trên futures đòn bẩy $\sim 5\times$ thì **cháy tài khoản** trước khi bạn kịp nhận ra hệ thống sai.

Long-only ép bạn làm đúng những thứ nền tảng trước — data sạch, chi phí thật, khớp lệnh thực tế, kỷ luật rebalance — mà không cái ràng buộc nào tha thứ nếu bạn sai. Khi đường cong vốn (equity curve) trên long-only đã ổn định qua vài quý *out-of-sample* thật (không phải backtest), lúc đó mới **thêm dần leg futures**: đầu tiên chỉ để **hedge** danh mục long-only (short vài hợp đồng VN30 khi regime xấu — nối tiếp sang Mục 8), rồi mới tới directional two-way độc lập. Đây là cách "trèo thang đòn bẩy" thay vì nhảy thẳng lên nóc.

*Một phép so notional để thấy chênh lệch cỡ vốn (ví dụ minh họa):* với $\sim 130$ triệu VND, ở sân (B) bạn mua được đúng $\sim 130$ triệu tiền cổ phiếu (không đòn bẩy); cũng số tiền đó ở sân (A) đủ **ký quỹ** cho nhiều hơn một hợp đồng futures, tức phơi nhiễm (exposure) danh nghĩa lớn hơn nhiều lần vốn thực. Chính con số phơi nhiễm đó vừa hấp dẫn vừa nguy hiểm — và là lý do thứ tự B → A không phải lời khuyên đạo đức, mà là quản trị rủi ro.


## 5. Dữ liệu: vnstock, point-in-time, và bẫy corporate-action của VN

Chương 2 cuốn P mở đầu bằng một câu phũ phàng: một alpha xuất sắc chạy trên dữ liệu bẩn chỉ cho ra P&L của một alpha rác, và phần lớn "phát hiện thần kỳ" của tuần đầu tiên hóa ra là ảo ảnh sinh ra từ một cái bẫy dữ liệu mà cả ngành đã biết ba thập kỷ. Ở thị trường Việt Nam câu đó còn đúng gấp bội, vì ba trong số các bẫy kinh điển của Ch2 — corporate actions, survivorship bias, và định nghĩa universe point-in-time — đều biểu hiện ở dạng **nặng hơn** so với thị trường Mỹ mà sách lấy làm chuẩn. Mục này không dạy lại lý thuyết PIT (đọc Ch2 cuốn P cho cơ chế đầy đủ); nó chỉ ra ba cái bẫy đó lộ diện ra sao ở VN, và ta dựng data pipeline thế nào để không rơi vào.

### 5.1 Nguồn dữ liệu: bắt đầu từ vnstock

Điểm khởi đầu thực tế cho một retail quant VN là **`vnstock`** — thư viện Python mã nguồn mở phổ biến nhất để lấy dữ liệu thị trường Việt Nam: giá lịch sử và intraday, báo cáo tài chính, bảng giá, và dữ liệu **khối ngoại** (mua/bán ròng theo mã). Nó miễn phí, đủ để nuôi một bot daily-to-intraday, và là nơi tự nhiên để đặt tầng data của backtester (trong `quantc`, tương ứng tầng data của `src/alpha`). Khi cần chất lượng cao hơn — dữ liệu tài chính đã chuẩn hóa, chuỗi điều chỉnh nhất quán, hoặc lịch sử dài hơn — có các vendor thương mại như **FiinTrade/FiinX** (FiinGroup), **Wichart**, **Vietstock**; chart thì TradingView; cộng đồng phân tích kỹ thuật hay backtest trên **Amibroker**. Nguyên tắc của Ch2 vẫn giữ nguyên bất kể nguồn: **giữ song song hai chuỗi giá** — `adjusted` để tính return, `raw` để mô phỏng giá khớp lệnh thật — cộng một `security master` map identifier bền theo mã.

Một đặc thù VN mà thị trường Mỹ không có: **foreign flow** (khối ngoại mua/bán ròng) được công bố hằng ngày theo mã và lấy được qua vnstock. Nó là một tín hiệu alpha đặc thù VN, không thuộc phạm vi mục này (mục này lo phần data hygiene), nhưng nó phải nằm trong schema data ngay từ đầu — gắn `as_of_date` là **ngày dữ liệu thực sự có sẵn**, đúng kỷ luật PIT của Ch2 — để tầng alpha phía sau có thể dùng mà không rò rỉ tương lai.

### 5.2 Bẫy số một: corporate actions — nguồn lỗi backtest lớn nhất ở VN

Ch2 xếp corporate actions đứng đầu danh sách bẫy giá, với hai cơ chế chính: split và dividend. Ở Mỹ, cả hai tương đối thưa và các vendor lớn (như CRSP) điều chỉnh khá nhất quán. **Ở Việt Nam thì ngược lại**: corporate actions **dày đặc** — cổ tức bằng **cổ phiếu** (không phải tiền mặt), thưởng cổ phiếu, phát hành thêm / quyền mua (rights) — xảy ra rất thường xuyên, và các nguồn data điều chỉnh giá **không nhất quán với nhau**. Đây chính là **nguồn lỗi backtest lớn nhất** ở VN. Nếu bạn chỉ nhớ một điều từ toàn mục này, hãy nhớ điều này.

Vì sao cổ tức bằng cổ phiếu nguy hiểm hơn cổ tức tiền mặt? Cơ chế điều chỉnh của Ch2 vẫn áp được, nhưng sự kiện này vận hành như một **stock split** trá hình: nếu chuỗi giá không được adjust thì return ngây thơ sẽ đọc ra một cú "rớt" ảo — đúng loại sai số đủ để phá hủy mọi tín hiệu momentum hay mean-reversion đi qua nó.

**Ví dụ minh họa (số giả định).** Một mã HOSE đóng cửa **50.000đ** ngày $t-1$. Công ty trả cổ tức bằng cổ phiếu tỷ lệ 20% (giữ 10 cổ nhận thêm 2 cổ). Ngày ex-date, giá tham chiếu được điều chỉnh xuống xấp xỉ $50.000 / 1{,}20 \approx 41.700$đ. Trên **chuỗi raw**, return đọc ra là:

$$r_t^{\text{raw}} = \frac{41.700}{50.000} - 1 \approx -16{,}6\%$$

Một cú giảm 16,6% trong một ngày — nhưng **không nhà đầu tư nào mất tiền**: họ đang giữ nhiều cổ phiếu hơn với cùng tổng giá trị. Đây là "alpha ma" y hệt bẫy dividend của Ch2, chỉ khác là biên độ lớn hơn nhiều vì tỷ lệ chia ở VN thường lớn. Cách chữa giống Ch2: nhân một **adjustment factor** dồn ngược vào toàn bộ giá quá khứ. Với tỷ lệ chia $s$ (ở đây mỗi cổ cũ thành $1{,}2$ cổ mới, $s = 1{,}2$), factor cho ngày đó là $1/s = 1/1{,}2 \approx 0{,}833$. Nhân toàn bộ chuỗi quá khứ với 0,833: giá 50.000 của ngày liền trước thành $50.000 \times 0{,}833 \approx 41.700$, và return trên chuỗi **adjusted** đọc ra $41.700 / 41.700 - 1 = 0\%$ — đúng thực tế. Nhớ chiều điều chỉnh của Ch2: **sửa quá khứ, không sửa hiện tại**; giá hôm nay phải là giá trade được. Với phát hành quyền mua (rights) ở giá ưu đãi, factor phức tạp hơn (phải tính giá trị lý thuyết của quyền), nhưng nguyên tắc y hệt.

Điểm khiến VN khó hơn Mỹ nằm ở chữ **"không nhất quán"**: hai nguồn data khác nhau — hoặc thậm chí cùng một nguồn qua các thời điểm — có thể áp factor khác nhau, làm tròn khác nhau, hoặc bỏ sót một sự kiện. Vì corporate actions dày đặc, các factor **nhân dồn** (như Ch2 lưu ý: một mã nhiều năm có thể có giá adjusted đầu chuỗi chỉ còn một phần nhỏ giá gốc), nên một sai lệch nhỏ ở một sự kiện bị khuếch đại qua toàn chuỗi. Hệ quả hành động: **phải dùng giá đã điều chỉnh, nhưng không tin mù nguồn nào**. Quy trình tối thiểu:

1. Kéo cả `adjusted` và `raw`, giữ song song.
2. Lấy **lịch corporate actions** (ngày ex, loại sự kiện, tỷ lệ) như một bảng riêng.
3. **Kiểm chứng tay vài mã**: chọn 3–5 mã có sự kiện chia lớn đã biết, tự tính lại factor và so với chuỗi adjusted của nguồn. Nếu return quanh ex-date không ra ~0% sau điều chỉnh, nguồn đó sai — đừng backtest trên nó.
4. Nếu có ngân sách, đối chiếu chéo với một vendor thứ hai (FiinX / Wichart / Vietstock) trên chính vài mã đó.

Bước 3 nghe thủ công và nhàm, nhưng nó là ranh giới giữa một backtest thật và một backtest ảo. Ở VN nó không phải tùy chọn.

### 5.3 Bẫy số hai: survivorship — phải gom cả mã bị hủy/đình chỉ

Ch2 gọi survivorship bias là "bẫy đắt nhất vì nó vô hình": dataset chỉ chứa các tên **còn sống hôm nay** thì backtest ngầm né mọi công ty sắp chết, thổi phồng return. Ở VN cơ chế này có một dạng đặc thù và **sắc hơn**: ngoài phá sản/hủy niêm yết do rớt chuẩn, VN còn có **đình chỉ giao dịch và hủy niêm yết đơn lẻ do các vụ thao túng lớn** (các vụ như FLC / Trịnh Văn Quyết, Louis Holdings...). Một mã đang "đẹp" trên biểu đồ có thể bị đình chỉ đột ngột, và nhà đầu tư mắc kẹt với khoản lỗ lớn hoặc không thoát được vị thế.

Nếu universe backtest của bạn chỉ gồm các mã **hiện đang niêm yết**, bạn đã tự trao cho chiến lược một siêu năng lực tiên tri: nó không bao giờ cầm các mã đó vào đúng lúc chúng bị đình chỉ/hủy. Cách chữa giống hệt Ch2: dataset phải chứa **delisted/suspended names** kèm **delisting return** — return thực nhà đầu tư nhận được khi mã ngừng giao dịch (thường là một số âm lớn). Ở VN, nhiều feed rẻ tiền hoặc mặc định có thể **không** giữ đầy đủ các mã đã rời sàn; đây là lý do đầu tiên để nghi ngờ một backtest "quá đẹp". Hành động: chủ động gom danh sách mã đã hủy/đình chỉ theo lịch sử và ghép return cuối của chúng vào universe, thay vì lọc chúng ra một cách vô tình.

### 5.4 Bẫy số ba: universe point-in-time — VN30 "tại thời điểm đó", không phải hôm nay

Đây là điểm số 4 trong danh sách bẫy của Ch2 ("S&P 500 hôm nay khác S&P 500 năm 2010"), và với VN nó gắn thẳng vào universe mặc định của toàn tài liệu này: **VN30**. VN30 là rổ 30 large-cap thanh khoản nhất HOSE, và **rổ này đổi định kỳ ~2 lần/năm**. Một mã nằm trong VN30 hôm nay có thể chưa vào rổ ba năm trước; một mã đã bị loại có thể từng ở trong rổ suốt giai đoạn bạn đang backtest.

Sai lầm kinh điển: backtest chiến lược "long các cổ phiếu **trong VN30**" nhưng áp danh sách thành viên **hôm nay** cho quá khứ. Làm vậy là bạn ngầm chọn những mã đủ tốt để trụ lại rổ — một dạng survivorship bias ở tầng universe, chồng lên bẫy 5.3. Đúng kỷ luật Ch2: mỗi ngày backtest phải hỏi *"mã này có trong VN30 **tại ngày đó** không?"* bằng một bảng membership có `start_date`/`end_date` theo từng kỳ đổi rổ, **không** phải một danh sách VN30 tĩnh. Vì rổ chỉ đổi ~2 lần/năm, bảng này nhỏ và hoàn toàn khả thi để dựng tay từ lịch sử công bố rổ.

Cùng logic PIT áp cho **dữ liệu fundamental**. Ch2 nhấn ba lớp thời gian: kỳ báo cáo (event time), ngày công bố (`as_of_date` / knowledge time), và ngày mỗi bản sửa (valid time). Backtest ở ngày $t$ chỉ được nhìn các hàng có **ngày công bố** $\le t$, không phải kỳ báo cáo $\le t$ — nếu không là look-ahead bias. Ở VN, báo cáo tài chính công bố trễ sau khi kỳ kế toán kết thúc; join theo **ngày công bố** là bắt buộc. Cột `as_of_date` trong schema fundamental không phải chi tiết kỹ thuật — quên nó là toàn bộ nghiên cứu fundamental thành rác (Ch2, phần PIT). Vì lịch sử data VN ngắn (VN-Index từ 2000, VN30 futures từ 2017), mọi phần trăm dữ liệu đều quý; nhưng ngắn cũng nghĩa là **overfitting cực dễ**, nên kỷ luật PIT ở đây không phải để làm đẹp mà để bảo vệ chính kết quả của bạn khỏi ảo giác.

### 5.5 Tóm tắt hành động

Ba bẫy trên là ba tầng của cùng một nguyên tắc Ch2 — **tái dựng đúng trạng thái tri thức của quá khứ**, không để tương lai rò rỉ vào:

| Bẫy (Ch2 cuốn P) | Biểu hiện đặc thù VN | Hành động |
|---|---|---|
| Corporate actions | Cổ tức/thưởng cổ phiếu, rights **dày đặc**; nguồn adjust không nhất quán | Giữ raw + adjusted; kiểm chứng tay vài mã; đối chiếu chéo vendor |
| Survivorship | Đình chỉ/hủy niêm yết do thao túng đơn lẻ | Gom delisted/suspended names + delisting return |
| Universe PIT | VN30 đổi rổ ~2 lần/năm; fundamental công bố trễ | Bảng membership `start/end`; join fundamental theo ngày công bố |

Làm sạch data không hào nhoáng, và như Ch2 nói, một quant buy-side dành nhiều thời gian với schema hơn với phương trình. Ở VN, phần lớn khoảng cách giữa một backtest đẹp-đến-mức-đáng-ngờ và một P&L thật nằm đúng ở ba cột này. Chi tiết cơ chế điều chỉnh, ba lớp thời gian PIT, và định lượng survivorship bias: xem **Ch2 cuốn P** ("Dữ liệu & returns").


## 6. Tín hiệu alpha cho thị trường Việt Nam

Mục này lấy nguyên bộ máy alpha research của cuốn P — **Ch7** (giải phẫu alpha, pipeline chuẩn hóa, IC, Fundamental Law), **Ch6** (factor models, ngôn ngữ neutralize/exposure), và nền behavioral của **Ch8** (vì sao alpha tồn tại) — rồi hỏi đúng một câu: *họ tín hiệu nào thực sự sống được trên thị trường Việt Nam?* Câu trả lời không phải "mọi thứ trong sách". Cấu trúc thị trường VN — nhà đầu tư cá nhân chiếm áp đảo, thanh khoản dồn vào large-cap, chưa short được cổ phiếu cơ sở — vừa **mở ra** vài họ alpha mạnh bất thường, vừa **đóng lại** vài họ mà sách coi là mặc định. Ta đi qua từng họ với đúng khung tra vấn của Ch8: *ai đang trả tiền cho tôi, họ trả vì lỗi gì, và vì sao dòng vốn thông minh chưa bào mòn hết chỗ đó?* Một tín hiệu không trả lời sạch được ba câu này thì chưa phải alpha — nó là một pattern chờ ngày phản bội.

### Vì sao behavioral edge ở VN đậm hơn sách

Ch8 dạy rằng behavioral alpha sinh ra từ **lỗi hệ thống** của con người: disposition effect kìm giá cổ phiếu thắng tạo momentum, overreaction tạo reversal, over-trading do quá tự tin tạo thanh khoản cho người cung cấp thanh khoản hớt. Ở thị trường Mỹ large-cap, phần lớn các lỗi này đã bị vốn thông minh bào mòn tới mức chỉ còn premium mỏng. Ở VN thì khác về *cường độ*: khoảng **85–90% khối lượng giao dịch là nhà đầu tư cá nhân trong nước** (VN-FACTS), tức bên kia mỗi lệnh của bạn thường là một noise trader chứ không phải một arbitrageur kỷ luật đã trừ sạch lỗi. Đây đúng là điều kiện Ch8 nói làm behavioral edge **mạnh hơn thị trường phát triển** — lỗi hành vi ở đây chưa bị vốn thông minh chen vào giữa. Nhưng đúng theo tinh thần "limits to arbitrage", phải nói rõ con dao này cắt hai chiều: chính nơi behavioral edge đậm cũng là sân hoạt động của **đội lái (pump-and-dump)** — nhóm thao túng cổ phiếu thanh khoản thấp, chủ yếu mid/small-cap (VN-FACTS). "Tín hiệu đẹp" trên một cổ phiếu mỏng có thể chỉ là một sóng làm giá đang cuốn bạn vào đúng lúc nó sắp xả. Nguyên tắc phòng vệ xuyên suốt mục này, không thương lượng: **bám VN30/large-cap và lọc bỏ mã thanh khoản mỏng bằng bộ lọc ADV**, đúng như universe long-only mặc định VN-FACTS khuyến nghị.

### Họ 1 — Momentum cross-sectional (12-1 tháng) trên VN30

Đây là ứng viên số một, và lý do kinh tế của nó (Ch8) áp thẳng vào VN. Momentum sống nhờ **under-reaction và disposition effect**: nhà đầu tư bán cổ phiếu thắng quá sớm để chốt lời nhỏ, khiến giá bò lên fair value từ từ thay vì nhảy tới ngay — phần điều chỉnh còn lại rỉ ra trong nhiều tuần. Với một thị trường cá nhân chiếm áp đảo như VN, chính cơ chế "bán non người thắng" này còn đậm hơn nơi sách khảo sát. Tín hiệu chuẩn của Ch7 là return **12 tháng bỏ tháng gần nhất** (bỏ tháng cuối để tránh dính short-term reversal); quy ước ~21 phiên cho một tháng, ~252 phiên cho một năm:

$$\text{mom}_{i,t} = \frac{P_{i,t-21}}{P_{i,t-252}} - 1$$

Long nhóm rank cao, cầm thong thả vài tuần đến vài tháng (half-life dài, turnover thấp — Ch7.2), nên phí vòng và thuế bán 0,1% mỗi lần bán (VN-FACTS) bào mòn ít. Quan trọng: **chạy trên rổ VN30**, không phải toàn HOSE. Momentum trên smallcap VN gần như chắc chắn bắt phải sóng đội lái — đó là sóng làm giá chứ không phải drift behavioral, và nó sẽ đảo chiều dữ dội đúng lúc bạn đang cầm nặng nhất. Cross-ref Ch8: momentum là **Loại 2 (behavioral) — tài sản hao mòn**, cần theo dõi crowding và cân nhắc biến thể có phanh vol (Daniel–Moskowitz risk-managed momentum, Ch7.4), vì "momentum crash" đuôi trái chính là cái giá giữ cho premium này còn sống.

### Họ 2 — Mean reversion ngắn hạn (đảo chiều 5–20 ngày)

Cơ chế (Ch8): over-trading do overconfidence và bán tháo hoảng loạn của nhà đầu tư cá nhân *tạo ra* nhu cầu thanh khoản cấp bách, và người đứng ra cung cấp thanh khoản thu premium. Khi một đám đông hoảng bán gấp, họ cần đối tác *ngay* và trả premium cho tính cấp bách — đứng bên kia lệnh đó, bạn là người được trả. Tín hiệu thô là đảo dấu return ngắn hạn, `-rank(returns(close, 5))` theo cú pháp Ch7.1: mua cái vừa giảm mạnh, bán cái vừa tăng mạnh, kỳ vọng hồi về.

Nhưng đây chính là chỗ **ràng buộc T+2 phá vỡ chiến lược sách** và ta phải lách (nối Mục 3). Ở thị trường cơ sở, cổ phiếu vừa mua **chưa bán được cho tới khi về tài khoản (~T+2)** (VN-FACTS) — bạn không thể quay vòng một lô trong 1–2 ngày như stat-arb Mỹ. Hệ quả trực tiếp: mean reversion tần suất cực ngắn (mua bán trong ngày, quay vòng 1 ngày) **không chạy được trên cổ phiếu cơ sở VN**. Hai đường lách. Một, kéo holding period lên khung 5–20 ngày cho khớp T+2 — chấp nhận half-life dài hơn và IC yếu hơn, đổi lấy một chiến lược thực sự thi hành được. Hai, chuyển ý tưởng reversal ngắn hạn lên **VN30 futures** — công cụ cho **long/short cả hai chiều, giao dịch intraday, đòn bẩy** (VN-FACTS). Đây là lý do reversal ở VN thường sống ở tầng chỉ số (futures) hơn là tầng cổ phiếu lẻ: đúng công cụ cởi đúng ràng buộc.

### Họ 3 — Dòng tiền khối ngoại (foreign net flow) — đặc sản VN

Đây là họ tín hiệu **không có trong danh mục kinh điển của Ch7** vì nó là đặc thù thị trường VN, và theo phân loại Ch8 nó thuộc dòng **structural/informational**: giá trị mua/bán ròng của nhà đầu tư nước ngoài theo từng mã được **công bố hằng ngày** (VN-FACTS). Ở thị trường phát triển, positioning của các quỹ lớn là bí mật đắt tiền phải mua qua alt-data; ở VN nó được trao gần như miễn phí mỗi phiên. Giả thuyết kinh tế: khối ngoại (thường là quỹ tổ chức) mang thông tin và khẩu vị khác đám đông cá nhân trong nước, và dòng vốn của họ có **quán tính** — mua ròng hôm nay thường nối tiếp mua ròng vài phiên tới, tạo một drift giá mà bên cá nhân phản ứng chậm (under-reaction, Ch8). Tín hiệu thô xây dạng foreign net flow chuẩn hóa theo thanh khoản để so được giữa các mã:

$$\text{fflow}_{i,t} = \frac{\text{giá trị mua ròng khối ngoại của mã } i \text{ trong cửa sổ } k \text{ ngày}}{\text{ADV}_{i}}$$

rồi đưa qua đúng pipeline Ch7.1. Hai cảnh báo đặc thù VN, cả hai đều là bẫy backtest. Một, **room ngoại**: mỗi mã có trần tỷ lệ sở hữu nước ngoài (nhiều mã 49%, ngân hàng 30% — VN-FACTS); mã đã **hết room** thì khối ngoại chỉ mua thêm được qua thỏa thuận, thường chịu premium (VN-FACTS) — dòng flow khớp lệnh của các mã này bị *bóp méo* bởi trần sở hữu chứ không phản ánh thuần khẩu vị, nên phải xử lý riêng hoặc loại khỏi universe tín hiệu. Hai, đây vẫn là **tín hiệu thô cần neutralize** (mục dưới): nếu khối ngoại đang mua đều cả rổ ngân hàng thì "fflow cao" của một mã ngân hàng là **industry bet trá hình**, không phải alpha riêng của mã đó.

### Họ 4 — Factor value/quality (long-only tilt)

Value và quality là **risk premium (Ch8 Loại 1)** — bền vô hạn định, capacity lớn, nhưng đau đúng lúc thị trường tệ nhất và không nên cắt trong drawdown (đó là lúc bạn *được trả* để chịu đựng). Trên VN, vì nhà đầu tư cá nhân chưa short được cổ phiếu cơ sở (VN-FACTS), ta **không** dựng được long/short HML thuần như sách; thay vào đó dùng chúng làm **tilt trong danh mục long-only** (nối Mục 8). Ngôn ngữ là của Ch6: value đo bằng earnings yield / book-to-price / FCF yield so *trong ngành*, quality bằng ROE cao đi kèm accruals thấp (earnings là "tiền thật" chứ không phải bút toán — Sloan). Cross-ref Ch6.5: đừng kỳ vọng alpha residual sau khi đã trừ factor — value *là* factor, không phải bí mật riêng của bạn; giá trị cạnh tranh nằm ở định nghĩa sạch hơn và ở dữ liệu point-in-time nghiêm hơn. Ở VN điều thứ hai là chiến trường thật: cổ tức bằng **cổ phiếu**, thưởng cổ phiếu, phát hành thêm/quyền mua diễn ra rất dày (VN-FACTS) khiến các nguồn data điều chỉnh giá không nhất quán — đây là nguồn lỗi backtest lớn nhất ở VN (nối Mục 5 về PIT/corporate-action).

### Họ 5 — Event-driven: nâng hạng FTSE & VN30 rebalance

Structural alpha (Ch8 Loại 3) — cược chống *quy tắc*, không chống *lỗi*. Hai sự kiện VN sạch nhất (VN-FACTS): (1) **FTSE Russell nâng hạng Việt Nam lên Emerging Market** kéo dòng vốn ngoại thụ động (ETF/quỹ index) vào các mã trong rổ — đây là cầu cứng, vô cảm với giá, đúng cơ chế index-add của Ch8; (2) **VN30 rebalance** (rổ đổi định kỳ ~2 lần/năm — VN-FACTS): mã được thêm vào rổ bị các quỹ tham chiếu VN30 mua vào, mã bị loại bị bán ra. Chiến thuật là canh *lịch và quy tắc rổ* — vào vị thế trước ngày effective, thoát khi cầu thụ động đã khớp xong — chứ không canh fundamental. Cảnh báo Ch8 đóng khung capacity: edge index-rebalance co lại khi ai cũng biết trò này và cùng đứng trước ngày effective, nên coi đây là cơ hội có hạn về quy mô, không phải mỏ vô tận.

### Pipeline chuẩn hóa: biến raw signal thành alpha trade được (Ch7.1)

Không tín hiệu thô nào ở trên trade được ngay — chúng lẫn outlier, nghiêng ngành, và thang đo lung tung giữa các ngày. Áp đúng pipeline Ch7.1 cho **mọi** họ trên, theo thứ tự:

1. **Winsorize** — clip outlier về $\pm 3$ MAD quanh median. Ở VN bước này *sống còn*: một mã vừa chia cổ tức bằng cổ phiếu hoặc thưởng cổ phiếu mà chưa được adjust đúng sẽ cho raw signal sai lệch cả chục lần (nối Mục 5).
2. **Neutralize** — hồi quy bỏ phần được giải thích bởi thứ bạn không muốn cược: market, **sector/ngành**, size; giữ lại residual. "Mua ngân hàng" hay "mua BĐS" không phải alpha, nó là industry bet (Ch6.1, Ch7.1).
3. **Rank hoặc z-score** cross-sectional. Trên universe VN dữ liệu bẩn là chuyện thường, nên **rank** thường an toàn hơn z-score vì chống outlier tốt hơn.
4. **Smooth** (EMA) nếu turnover vượt half-life thông tin — nhưng nhớ T+2 đã tự áp một sàn holding period rồi, nên đừng smooth thừa.

### Đo chất lượng: IC và Fundamental Law (Ch7.3)

Chuẩn công nghiệp là **rank-IC** (Spearman) — correlation cross-sectional giữa tín hiệu hôm nay và forward return. Với equity daily, **IC 0.02–0.05 là tín hiệu tốt thật sự**; ai khoe IC 0.2 trên universe rộng gần như chắc chắn dính look-ahead bug (Ch7.3). Fundamental Law nối IC với kết quả:

$$IR \approx IC \times \sqrt{BR}$$

trong đó BR là **breadth** — số cược *độc lập* mỗi năm. Đây là chỗ VN gặp một ràng buộc phũ phàng: **VN30 chỉ có 30 mã** (VN-FACTS). So với một universe hàng nghìn tên như thị trường phát triển, breadth danh nghĩa nhỏ hơn hẳn — và breadth hiệu dụng $N_{\text{eff}} = N/(1+(N-1)\bar\rho)$ (Ch7.3) còn nhỏ hơn nữa vì 30 large-cap VN tương quan cao với nhau. Hệ quả trực tiếp từ công thức: với BR nhỏ, muốn đạt IR đàng hoàng bạn **buộc phải có IC cao hơn** hoặc **tăng breadth theo trục khác** — thêm *tần suất* (rebalance dày hơn, trong giới hạn T+2 và phí), thêm *tín hiệu không tương quan* (kéo $\bar\rho$ của rổ tín hiệu xuống), và thêm *chiều thời gian* (dùng futures cho intraday). Đây chính là la bàn Ch7.3: khi breadth bị chặn cứng bởi cấu trúc thị trường, công sức đổ vào giảm correlation giữa các tín hiệu và vào nâng IC là đòn bẩy lớn nhất bạn có.

**Ví dụ minh họa (số giả định).** Giả sử một combo momentum + foreign-flow trên VN30 đo được mean rank-IC $= 0.04$ với std IC $= 0.12$ trên một mẫu backtest. IC risk-adjusted $= 0.04/0.12 = 0.33$ — ổn định vừa phải. Nếu rebalance hàng tuần (~50 kỳ/năm) và ước breadth hiệu dụng $N_{\text{eff}} \approx 12$ cược độc lập mỗi kỳ (30 mã tương quan cao co về ~12), thì BR $\approx 50 \times 12 = 600$, cho IR lý thuyết $0.04 \times \sqrt{600} \approx 0.98$ *trước* transfer coefficient. Nhân với TC $\approx 0.5$ (phần tín hiệu còn sống sót qua ràng buộc long-only cộng phí, Ch11) còn quãng **0.5**. Đây thuần là con số minh họa cho phương pháp — nhưng nó dạy đúng bài học VN: breadth mỏng ép IR xuống, nên từng điểm phần trăm IC và từng tín hiệu độc lập thêm vào đều đắt giá. Và nhớ haircut live/backtest của Ch7.6: live thường chỉ giữ lại **50–70% IC của backtest**; với lịch sử data VN ngắn (VN-Index từ 2000, VN30 futures từ 2017 — VN-FACTS) thì overfitting cực dễ, nên haircut ở VN nên còn nặng tay hơn con số đó.

### Cảnh báo tổng và ranh giới

Ba điều đóng đinh. Một, **smallcap có thể là đội lái, không phải alpha** — IC đẹp trên mã mỏng thường chỉ là đo lại chính sóng làm giá; bám VN30 và lọc ADV là kỷ luật không thương lượng. Hai, **neutralize theo ngành** trước khi tin bất kỳ IC nào, kẻo bạn đang đo một industry bet trá hình mà tưởng là alpha. Ba, đây là **ví dụ về phương pháp, không phải khuyến nghị mua mã cụ thể** — không con số nào ở trên là lời khuyên đầu tư, và các con số IC/IR đều là minh họa giả định để dạy cách đo, không phải kết quả đã kiểm chứng trên tiền thật. Việc *dựng* backtest để đo những IC này một cách trung thực (purged CV, deflated Sharpe, xử lý corporate-action) là chủ đề của Mục 7; việc *biến* vector alpha đã đo thành danh mục long-only cộng hedge bằng futures là chủ đề của Mục 8.


## 7. Backtest engine cho VN — T+2, biên độ ±7%, phí + thuế

Đây là mục kỹ thuật quan trọng nhất của cả tài liệu. Ch9 cuốn P đã dạy triết lý cốt lõi: backtest **không phải công cụ khám phá mà là công cụ bác bỏ** — nó tồn tại để giết những giả thuyết sai, không phải để đãi cát tìm vàng trong noise. Mọi sai số của backtest đều **có hướng**, gần như luôn nghiêng về phía lạc quan, nên một con số Sharpe chưa qua kiểm toán là *biên trên*, không phải ước lượng không thiên lệch. Ở thị trường VN, ba đặc thù cơ chế — **T+2**, **biên độ ±7%** trên HOSE, và **cấu trúc chi phí phí + thuế** — sinh ra ba nguồn lạc quan giả mới mà một engine bê nguyên từ sách Âu-Mỹ sẽ không bắt được. Mục này chỉ ra chính xác chúng nằm ở đâu, model chúng thế nào, và tại sao bỏ sót từng cái lại bơm return giả theo đúng một hướng.

### 7.1 T+2 — cổ phiếu vừa mua chưa bán được

Theo VN-FACTS, chu kỳ thanh toán ở thị trường cơ sở là **T+2**: cổ phiếu mua hôm nay (ngày $T$) chỉ về tài khoản khoảng chiều/ngày $T+2$, và **chưa bán được cho tới khi về**. Đây không phải chi tiết vận hành vặt — nó là một ràng buộc cứng lên chính không gian chiến lược. Bất kỳ backtest nào cho phép mua ngày $t$ rồi bán cùng lô đó ngay trong ngày $t$ hoặc ngày $t+1$ ở thị trường cơ sở đang tạo ra P&L **không thể thực hiện được** — một dạng look-ahead về thanh khoản: chiến lược "thấy" một cửa thoát lệnh mà đời thật đã khóa lại. Nguy hiểm ở chỗ nó im lặng: không có exception, không có fill bị từ chối, chỉ có một đường equity đẹp hơn thực tế.

Cách model đúng là giữ một biến trạng thái **available-to-sell** cho mỗi mã: mỗi lô mua mang một `settle_date = t + 2` (đếm theo **ngày giao dịch**, bỏ cuối tuần và nghỉ lễ), và engine chỉ cho phép lệnh bán khớp lên phần tồn kho đã settle. Hệ quả định lượng rất thực: nó **chặn ngay từ đầu** mọi chiến lược turnover cực cao trên cơ sở. Một mean-reversion intraday hay kiểu "lướt T+0" trên cổ phiếu — dù Sharpe gross đẹp đến đâu — không tồn tại ở tầng cơ sở VN, và nếu backtest của bạn *thấy* nó sinh lời thì đó là bằng chứng engine đang gian lận, không phải bằng chứng có alpha. Muốn intraday/hai chiều, bạn phải chuyển sân sang **VN30 futures** (giao dịch intraday, có đòn bẩy — xem mục 4), nơi ràng buộc T+2 không áp. Đây là chỗ engine backtest phải tách hẳn hai asset class: một book cơ sở long-only chịu T+2, một book futures không chịu — trộn hai book vào chung một quy tắc fill là sai từ gốc.

Lưu ý cross-ref bối cảnh: VN-FACTS ghi hệ thống KRX (go-live 5/5/2025) đang hướng tới **T+1** với nhiều tính năng rollout dần trong giai đoạn **2026–2028**, còn chờ khung pháp lý. Vì thời hạn chưa chốt, engine nên tham số hóa `SETTLE_LAG` (mặc định 2) thay vì hardcode — khi quy định đổi, bạn chỉnh một hằng số chứ không viết lại logic, và có thể chạy lại chính bộ backtest cũ dưới giả định T+1 để đo trước xem chiến lược nào sẽ được "mở khóa".

### 7.2 Biên độ ±7% — không được giả định khớp ở giá trần/sàn

Ràng buộc thứ hai tinh vi hơn và là nơi phần lớn backtest VN nói dối nặng nhất. HOSE có biên độ **±7%/ngày**; chạm biên trên là **giá trần** ("kịch trần"), chạm biên dưới là **giá sàn** ("kịch sàn"). Điểm chí mạng mà VN-FACTS nhấn mạnh: khi một mã kịch trần/kịch sàn, thường **không có bên đối ứng để khớp** — ai cũng muốn mua khi trần, ai cũng muốn bán khi sàn — nên lệnh của bạn **có thể không khớp**.

Một engine ngây thơ điền fill tại giá đóng cửa mỗi ngày, vô điều kiện. Nhưng nếu tín hiệu bảo "mua" đúng hôm mã kịch trần (ví dụ momentum/breakout — chính loại tín hiệu hay bắt vào ngày bùng nổ), engine ngây thơ tặng bạn một fill ở giá trần mà đời thật bạn **xếp hàng và không mua được**. Cú này bơm return giả một cách có hệ thống, không ngẫu nhiên: nó cho chiến lược "vào" đúng những ngày mạnh nhất — đúng những ngày thanh khoản thực tế lại đóng cửa. Đây là biến thể VN của **Tội 1 (look-ahead)** và **Tội 5 (capacity ảo)** trong Ch9 — bạn giả định một thanh khoản không hề tồn tại, và tệ hơn, bạn giả định nó tồn tại đúng vào lúc tín hiệu cần nó nhất.

Cách model đúng là một **fill rule có điều kiện biên**: nếu giá tham chiếu ngày $t$ chạm trần và bạn muốn mua, hoặc chạm sàn và bạn muốn bán, thì mặc định **non-fill** — bỏ lệnh hoặc trì hoãn sang phiên kế (carry-forward), *không* điền fill. Chỉ khi mã không kịch biên thì cho khớp bình thường. Nếu có data khối lượng khớp thực tế tại trần/sàn thì có thể tinh hơn (partial fill theo tỷ lệ tham gia ADV, như participation cap ở Ch9), nhưng nguyên tắc bảo thủ mặc định là: **không có bằng chứng khớp thì coi như không khớp** — chi phí của việc bảo thủ nhầm là bỏ lỡ vài fill, còn chi phí của việc lạc quan nhầm là tin vào một chiến lược không chạy được. Lưu ý biên độ khác nhau theo sàn (VN-FACTS: HNX ±10%, UPCoM ±15%) và ngày chào sàn HOSE rộng hơn (±20%), nên ngưỡng trần/sàn phải lấy từ bảng biên theo sàn và loại phiên, **không cứng ±7% cho mọi hàng** — dùng một hằng số 7% duy nhất là chính nó một lỗi fact sẽ đọc sai trạng thái biên của các mã HNX/UPCoM.

### 7.3 Chi phí thật — phí mỗi chiều + thuế bán, và độ nhạy turnover

Ch9, Tội 4 nói thẳng: một backtest gross là *fiction*. Ở VN cấu trúc chi phí có một đặc thù mà sách Âu-Mỹ không có: **thuế bán**. Theo VN-FACTS, phí môi giới khoảng **0,15%–0,35%/chiều** tùy công ty chứng khoán (áp cả mua lẫn bán; một số CTCK online/khách lớn thấp hơn), cộng **thuế thu nhập khi bán 0,1%** trên giá trị bán, thu **mỗi lần bán bất kể lãi/lỗ**. Chi tiết cuối cùng này là chỗ chí tử: thuế bán không phải phí trên lợi nhuận mà là phí trên *doanh số*, nên một chiến lược quay vòng nhanh bị đánh thuế cả trên những vòng huề vốn. Ghép lại, một **vòng mua-bán trọn** tốn cỡ (ví dụ minh họa, lấy phí 0,2%/chiều nằm trong khoảng VN-FACTS):

$$\text{phí mua} + \text{phí bán} + \text{thuế bán} \approx 0{,}2\% + 0{,}2\% + 0{,}1\% = 0{,}5\%$$

Con số thật tùy công ty chứng khoán của bạn; hãy thay biểu phí đúng của tài khoản mình vào trước khi tin bất kỳ kết quả nào. Đây chính là "điểm gãy chi phí" mà Ch8 (behavioral & limits to arbitrage) và Ch9 cảnh báo: **turnover cao là chết**. Công thức drag hàng năm từ Ch9, với $c$ là chi phí một chiều tính bằng bps và một chiến lược thay $\tau$ phần danh mục mỗi ngày (mỗi lần thay là một cặp bán-mua, tức khối lượng hai chiều $2\tau$):

$$\text{drag} \approx 2 \times \tau \times c \times 252 \ \text{bps/năm}$$

Với VN, $c$ một chiều không chỉ là phí mà còn cõng **phần thuế bán phân bổ về chiều bán**. Trong bảng dưới, cột $c$ là chi phí một chiều đã gộp đại diện (ví dụ minh họa để cảm số): $c \approx 25$ bps tương ứng phí ~20 bps mỗi chiều cộng phần thuế bán ~10 bps rải trung bình về mỗi chiều của một vòng.

**Bảng độ nhạy chi phí (ví dụ minh họa)** — drag hàng năm theo turnover ngày $\tau$ và chi phí một chiều $c$:

| Turnover ngày $\tau$ | $c=15$ bps | $c=25$ bps | $c=35$ bps |
|---|---|---|---|
| 2% (giữ ~50 ngày) | 1,5%/năm | 2,5%/năm | 3,5%/năm |
| 5% (giữ ~20 ngày) | 3,8%/năm | 6,3%/năm | 8,8%/năm |
| 10% (giữ ~10 ngày) | 7,6%/năm | 12,6%/năm | 17,6%/năm |
| 20% (giữ ~5 ngày) | 15,1%/năm | 25,2%/năm | 35,3%/năm |

Đọc bảng: hàng dưới cùng cho thấy một chiến lược turnover 20%/ngày ở mức chi phí VN thực tế mất **~25%/năm chỉ vì phí + thuế** — nuốt trọn alpha của gần như mọi tín hiệu equity trước cả khi tính slippage. Hệ số 252 là thủ phạm: "25 bps nghe chả đáng gì" nhân với hai chiều và với số ngày giao dịch trong năm biến thành hai chữ số phần trăm mỗi năm. Kết luận hành động rất cụ thể: ở VN, thiết kế nên nghiêng về **low-turnover, holding dài** (rebalance tuần/tháng thay vì hằng ngày, chỉ chạm danh mục khi tín hiệu vượt một ngưỡng no-trade band để tránh quay vòng vì nhiễu), và **mọi** backtest phải chạy độ nhạy chi phí như bảng trên — báo cáo net Sharpe ở ít nhất ba mức $c$ — trước khi tin bất kỳ con số nào. T+2 (mục 7.1) thực ra là một *đồng minh* ở đây: nó cưỡng bức một holding tối thiểu, tự động đẩy bạn ra khỏi vùng turnover chết.

### 7.4 Thanh khoản — lọc VN30 + ngưỡng ADV, không trade mã mỏng

VN-FACTS cảnh báo hai rủi ro nối nhau: thanh khoản **dồn vào VN30 + large-cap**, và **đội lái (pump-and-dump)** trên mid/small-cap khiến "tín hiệu đẹp" thường chỉ là sóng làm giá. Với backtest, điều này áp một **universe filter** bắt buộc *trước* mọi tín hiệu: mặc định bám **VN30** (thanh khoản, ít bị đội lái — universe long-only mặc định theo VN-FACTS) và áp một **ngưỡng ADV** (average daily volume) để loại mã mỏng, kèm **participation cap** như Ch9 (mỗi ngày không đưa quá vài phần trăm ADV vào một tên). Bỏ qua bước này là mở cửa cho capacity ảo (Tội 5) và cho việc backtest ăn phải chính các con sóng thao túng — thứ không tái tạo được, không nhân rộng được, và không phải alpha. Một chi tiết dễ quên: rổ VN30 **đổi định kỳ (~2 lần/năm)** theo VN-FACTS, nên universe filter phải là *point-in-time* — dùng thành phần VN30 hôm nay để lọc quá khứ là một dạng survivorship/look-ahead cửa sau.

### 7.5 Khung pseudo-code event-driven

Ch9 nhấn: phòng thủ look-ahead không phải "cẩn thận hơn" mà là một **kiến trúc event-driven** — engine đẩy dữ liệu nhỏ giọt theo timestamp, code chiến lược tại $t$ chỉ thấy event $\le t$. Dưới đây là khung tối giản, gắn ba xử lý VN (T+2, trần/sàn, phí + thuế). Đây là pseudo-code minh họa, không phải API của thư viện cụ thể nào:

```
for day in trading_days:                        # event-driven: mỗi ngày một event
    prices = feed.bar(day)                       # chỉ dữ liệu <= day
    release_settled_lots(book, day)              # lô có settle_date <= day -> available-to-sell
    signals = strategy.on_bar(day, history_upto(day))   # tín hiệu KHÔNG nhìn tương lai

    for order in strategy.orders(signals):
        px = prices[order.symbol]
        if order.symbol not in universe_asof(day): continue  # lọc VN30 (point-in-time) + ADV
        if order.side == BUY and px.at_ceiling():        # kịch trần
            continue                                     # non-fill: bỏ / carry-forward
        if order.side == SELL and px.at_floor():         # kịch sàn
            continue                                     # non-fill
        qty = min(order.qty, PARTICIP_CAP * px.adv)      # participation cap
        if order.side == SELL:
            qty = min(qty, book.available_to_sell(order.symbol))  # T+2: chỉ bán phần đã settle

        fill = px.ref_price                              # KHÔNG khớp ở giá trần/sàn
        if order.side == BUY:
            fee = fill * qty * FEE_RATE                  # phí mua ~0,15-0,35%/chiều
            book.add_lot(order.symbol, qty, fill,
                         settle_date=next_bday(day, SETTLE_LAG))   # T+2
            cash -= fill * qty + fee
        else:  # SELL
            fee = fill * qty * FEE_RATE                  # phí bán ~0,15-0,35%/chiều
            tax = fill * qty * SELL_TAX_RATE             # thuế bán 0,1% trên giá trị bán
            book.reduce(order.symbol, qty)
            cash += fill * qty - fee - tax

    record_pnl_and_positions(day)
```

Ba dòng "linh hồn VN" là: `settle_date = next_bday(day, SETTLE_LAG)` (T+2), hai nhánh `continue` khi `at_ceiling()/at_floor()` (không khớp ở trần/sàn), và `tax = ... * SELL_TAX_RATE` (thuế bán 0,1% chỉ đánh chiều bán). Bỏ bất kỳ dòng nào là mở lại đúng một nguồn lạc quan giả đã bàn ở trên — và cả ba đều thuộc loại lỗi *im lặng*, không văng exception, nên bạn sẽ không biết mình đang tự lừa cho tới khi tiền thật ra khỏi tài khoản.

### 7.6 Overfit — data VN ngắn, deflated Sharpe + purged CV là bắt buộc

VN-FACTS ghi lịch sử data ngắn: VN-Index từ năm 2000, VN30 futures từ năm 2017 → **overfitting cực dễ**. Điều này khớp thẳng với Ch9: ngưỡng Sharpe giả (mức Sharpe kỳ vọng cao nhất thu được thuần từ may rủi khi thử nhiều cấu hình) xấp xỉ $SR_0 \approx \sqrt{2\ln N / T}$ — nó **tăng theo $N$** (số lần thử) và **phình lên khi $T$ (độ dài mẫu) ngắn**. Với futures VN chỉ vài năm data ($T$ nhỏ), ngưỡng noise cao đến mức một Sharpe backtest 1.5 hoàn toàn có thể là ảo giác của multiple testing. Kỷ luật bắt buộc, không phải tùy chọn:

- **Deflated Sharpe Ratio (DSR)** (Ch9): hiệu chỉnh Sharpe quan sát theo $N$, $T$, và skew/kurtosis — với $T$ ngắn của VN, phần phạt lớn. Phải log trung thực $N$ = *tổng số cấu hình từng chạy qua đầu*, không phải số biến thể còn lưu lại; đây là con số dễ tự bịp nhất vì mọi lần "thử cho vui rồi bỏ" đều tính.
- **Purged K-Fold CV + embargo** và, nếu đủ compute, **CPCV** (Ch9) để lấy *phân phối* Sharpe OOS thay vì một con số — đặc biệt giá trị khi mẫu ngắn khiến một đường OOS đơn lẻ rất nhiễu và dễ đọc nhầm may rủi thành kỹ năng.
- **Holdout thật** chỉ chạm đúng một lần, và **kiểm tra tính trơn theo tham số** (plateau, không phải đỉnh nhọn) — rẻ nhất, mạnh nhất khi data khan: một đỉnh nhọn trên bề mặt tham số gần như chắc chắn là overfit.

Ngoài ra, corporate action dày đặc ở VN (cổ tức bằng **cổ phiếu**, thưởng cổ phiếu, phát hành thêm/quyền mua — nguồn lỗi backtest lớn nhất theo VN-FACTS) là một dạng look-ahead/point-in-time riêng: nếu điều chỉnh giá sai hoặc không nhất quán giữa các nguồn, backtest ăn phải return giả từ chính bước điều chỉnh, chứ không từ chiến lược. Đây là lý do tầng data (mục 5) và tầng backtest phải khớp nhau: engine chỉ đáng tin bằng đúng chuỗi giá điều chỉnh point-in-time nuôi vào nó — data rác thì kiến trúc event-driven hoàn hảo cũng vô nghĩa.

Tóm lại, một engine VN đúng chuẩn Ch9 khác engine sách ở đúng ba điểm cứng — available-to-sell (T+2), non-fill ở trần/sàn (biên độ theo sàn, HOSE ±7%), và cost model có thuế bán — cộng kỷ luật chống overfit gắt hơn vì $T$ ngắn. Backtest ở đây là bài kiểm tra "chiến lược này *không chết*" chứ không phải "chiến lược này kiếm được tiền" (cross-ref mục 8 cho portfolio và mục 11 cho template áp dụng khung này).


## 8. Xây danh mục long-only + hedge bằng futures

Mục 4 đã chia hai sân chơi; mục này ghép chúng lại thành một cỗ máy. Chương 11 (portfolio construction) và chương 14 (risk management) của cuốn P được viết cho một thế giới nơi bạn short được cổ phiếu tự do — mọi công thức tối ưu đều ngầm cho phép $w_i < 0$. Việt Nam không cho phép điều đó ở thị trường cơ sở (VN-FACTS: bán khống cổ phiếu với retail hiện chưa chạy được, lộ trình triển khai dần 2026–2028 qua securities borrowing & lending và covered short trên nền KRX, còn chờ khung pháp lý). Nên nhiệm vụ của mục này là *dịch* hai chương đó sang một thế giới **long-only trên cổ phiếu, cộng một overlay short bằng VN30 futures** — cây cầu hợp pháp duy nhất nối sân futures với sân equity, và là chỗ mọi công thức "cho phép $w_i<0$" của cuốn P được cấy lại vào một thị trường không cho phép điều đó.

### 8.1 Long-only phá vỡ MVO ở đâu

Nhắc lại nghiệm Markowitz gốc, được Ch11.1 dựng lại làm điểm khởi hành: $w^* \propto \Sigma^{-1}\mu$. Nghiệm này *thèm* leg short — chính ví dụ error-maximizer hai tài sản trong Ch11.1 cho ra $w \approx (-0{,}667,\ +1{,}667)$, tức nó short 67% một tên chỉ để dồn 167% vào tên kia, dựng cả cược khổng lồ trên một chênh lệch $\mu$ gần như hoàn toàn là ảo giác thống kê. Ở VN bạn không được ký cái vế âm đó. Ràng buộc long-only $w_i \ge 0$ biến bài toán từ nghiệm dạng đóng thành một **quadratic program có ràng buộc bất đẳng thức** — đúng dạng chuẩn "bài toán thật" của Ch11.7:

$$\max_{w}\ \ \mu^\top w - \tfrac{\gamma}{2}\, w^\top \Sigma w - \text{TC}(w) \quad\text{s.t.}\quad w_i \ge 0,\ \ \sum_i w_i = 1,\ \ w_i \le \bar w,\ \ \Big|{\textstyle\sum_{i\in s}} w_i - b_s\Big| \le \delta_s.$$

Bốn ràng buộc cuối là nơi bạn ép kỷ luật VN vào optimizer — và cũng là nơi long-only hóa ra *dễ chịu hơn* MVO đầy đủ. Bỏ leg short nghĩa là bỏ luôn cái trục low-variance nguy hiểm mà $\Sigma^{-1}$ khuếch đại (Ch11.1: eigenvalue nhỏ nhất của $\Sigma$ đúng bằng variance của trục spread, và optimizer dồn tiền vào đúng chiều nó biết ít nhất). Chặn $w_i<0$ chính là bịt sẵn cái trục đó. Long-only vì thế là một dạng regularization *miễn phí*: nó cấm optimizer làm điều điên rồ, nên trên universe nhiễu như VN nó thường bền hơn out-of-sample — đúng tinh thần "bỏ tối ưu lấy bền" của HRP (Ch11.4).

Ba ràng buộc cần đặt cứng cho VN:

- **Position cap $w_i \le \bar w$.** Trần vị thế từng mã. Vì thanh khoản VN dồn vào VN30/large-cap còn ra ngoài rổ đó thanh khoản mỏng, khó khớp (VN-FACTS), một $\bar w$ cỡ 8–10% ngăn danh mục dồn quá đậm vào một tên khó thoát. Đây cũng là hàng rào chống rủi ro đình chỉ giao dịch/hủy niêm yết đơn lẻ (VN-FACTS: các vụ FLC/Trịnh Văn Quyết, Louis Holdings...) — một mã bị "đóng băng" chỉ đục thủng đúng $\bar w$ của NAV, không hơn.
- **Sector cap.** Ràng buộc tổng trọng số mỗi ngành quanh một mốc $b_s$. VN-Index bị ngân hàng + bất động sản chi phối nặng; không ràng buộc ngành thì danh mục "đa dạng" của bạn thực chất chỉ là một cược ngành trá hình.
- **ADV / liquidity floor.** Loại thẳng mã có ADV mỏng khỏi universe *trước* khi optimize (VN-FACTS: mã mỏng dễ bị đội lái thao túng; "tín hiệu đẹp" trên smallcap có thể chỉ là sóng làm giá). Universe mặc định: **VN30 + lọc ADV**, đúng running example của VN-FACTS — vừa né đội lái, vừa đảm bảo có bên đối ứng để khớp.

Về input $\mu$: đừng ước lượng nó từ chuỗi giá (Ch11.3 — sai số chuẩn của $\hat\mu$ tỷ lệ $\sigma/\sqrt T$ và không bao giờ nhỏ; cần hàng trăm năm dữ liệu mới pin down được mean). Dùng cầu nối Grinold của Ch11.3, $\alpha_i = IC \cdot \sigma_i \cdot z_i$, biến z-score của signal VN (mục 6) thành $\mu$; hoặc né hẳn $\mu$ và chạy min-variance / risk parity thuần risk-based (Ch11.4), vốn *đặc biệt* hợp một thị trường mà $\mu$ gần như không đo được vì lịch sử data quá ngắn (VN-FACTS: VN-Index chỉ từ năm 2000).

### 8.2 Vấn đề cốt lõi: mọi thứ tương quan cao với VN-Index

Đây là lý do long-only *thuần* ở VN nguy hiểm. Thị trường VN có ~85–90% khối lượng là nhà đầu tư cá nhân trong nước (VN-FACTS), di chuyển theo tâm lý bầy đàn: khi VN-Index sập, gần như *cả rổ sập cùng một nhịp*. Về mặt ma trận covariance, điều đó nghĩa là một **eigenvalue thị trường khổng lồ** thống trị phổ của $\Sigma$ — dùng ngôn ngữ RMT của Ch11.2, market factor là eigenvalue vượt xa ngưỡng nhiễu Marchenko-Pastur $\lambda_+$, và một mình nó nuốt phần lớn variance của toàn universe. Hệ quả trực tiếp: một danh mục long-only, dù bạn đa dạng hóa khéo tới đâu qua sector cap và position cap, vẫn mang **beta thị trường dương lớn**. Bạn không thể trung hòa beta bằng cách chọn cổ phiếu, vì gần như không có cổ phiếu beta-âm để mua, và không được short cổ phiếu beta-cao để bù.

Đây chính xác là bài toán mà Ch14 gọi là exposure ẩn: một danh mục *trông* đa dạng nhưng phân rã factor kiểu Barra (Ch6) lộ ra net beta lớn. Khác biệt là ở VN bạn *biết trước* — net beta của bất kỳ long-only book nào cũng dương và cỡ 1, không cần đợi phân rã mới bàng hoàng. Muốn cắt nó, chỉ còn đúng một cửa: **hedge overlay bằng short VN30 futures.**

### 8.3 Beta hedge bằng short VN30 futures — ví dụ tính

Nguyên tắc: giữ nguyên rổ long (nơi bạn có alpha chọn cổ phiếu), rồi *chồng* lên một vị thế short VN30 futures đủ lớn để triệt tiêu dollar-beta của rổ. Vì VN30 futures cho long/short cả hai chiều và dùng đòn bẩy (VN-FACTS: ký quỹ một phần notional, đòn bẩy cỡ ~5x), một lượng vốn ký quỹ nhỏ gánh được notional hedge lớn — đúng thứ ta cần để phủ một rổ long mà không phải bán bớt cổ phiếu.

Số hợp đồng cần short:

$$N^* = \frac{\beta_{\text{book}} \times V_{\text{book}}}{F \times m},$$

với $V_{\text{book}}$ là giá trị rổ long, $\beta_{\text{book}}$ là beta của rổ so với VN30, $F$ là giá futures VN30 (điểm), $m$ là hệ số nhân **100.000 VND/điểm chỉ số** (VN-FACTS). Mẫu số $F\times m$ chính là notional một hợp đồng.

**Ví dụ minh họa** (các con số về danh mục là giả định để minh họa cơ chế; hệ số nhân và biên độ giá là fact VN đã verify): rổ long $V_{\text{book}} = 1$ tỷ VND, phân rã Barra cho $\beta_{\text{book}} = 1{,}1$ (rổ hơi "nóng" hơn chỉ số). VN30 futures ở $F = 1.300$ điểm → notional một hợp đồng $= 1.300 \times 100.000 = 130$ triệu VND (khớp running example VN-FACTS). Dollar-beta của rổ:

$$\beta_{\text{book}} \times V_{\text{book}} = 1{,}1 \times 1\,\text{tỷ} = 1{,}1\ \text{tỷ VND.}$$

Số hợp đồng lý thuyết:

$$N^* = \frac{1{,}1\,\text{tỷ}}{130\,\text{triệu}} = 8{,}46\ \text{hợp đồng.}$$

Bạn không short được 8,46 hợp đồng — chỉ short được số nguyên. Đây là một friction thật, không phải chi tiết vụn: với rổ nhỏ, **granularity của lô hợp đồng để lại residual beta đáng kể.** Short **8 hợp đồng** phủ $8 \times 130 = 1.040$ triệu dollar-beta, để lại residual $+60$ triệu trên $V_{\text{book}} = 1.000$ triệu → residual beta $+0{,}06$ (vẫn hơi long thị trường). Short **9 hợp đồng** phủ $1.170$ triệu, over-hedge $-70$ triệu → residual beta $-0{,}07$ (đã hơi short thị trường). Không lựa chọn nào cho beta đúng 0; bạn chỉ được chọn *hướng lệch mình chịu được*. Với book lớn hơn (chục tỷ trở lên) sai số làm tròn này teo dần thành nhiễu — đó là một lý do hedge overlay chỉ thực sự "mượt" khi vốn đủ lớn để một hợp đồng chỉ là một phần nhỏ của rổ; dưới ngưỡng đó, bạn hedge thô và sống chung với residual.

Kết quả sau hedge: danh mục còn lại **gần beta-trung tính với VN30**, nghĩa là P&L của nó không còn trả lời câu "VN-Index lên hay xuống" mà trả lời câu **"rổ long của bạn có chạy mạnh hơn VN30 hay không"** — tức **alpha tương đối**, thuần kỹ năng chọn cổ phiếu. Đó chính là thứ market-neutral mà Ch14 mô tả, đạt được không phải bằng short cổ phiếu (không được phép ở VN) mà bằng overlay chỉ số. Bạn vừa chuyển từ đặt cược *hướng thị trường* sang đặt cược *kỹ năng chọn cổ phiếu* — đúng mục tiêu tối hậu của portfolio construction.

Ba cảnh báo phải khắc vào bot:

1. **Basis risk.** Bạn hedge exposure-thị-trường của rổ bằng *futures của VN30* — chỉ số của 30 large-cap thanh khoản nhất, không phải toàn bộ VN-Index. Rổ long của bạn, nếu lệch khỏi đúng 30 mã VN30, có tracking error với chỉ số; khi VN30 và phần còn lại của thị trường phân kỳ, hedge hụt. Bản thân $\beta_{\text{book}}$ cũng *trôi theo thời gian và theo regime* — ước nó bằng cửa sổ EWMA (Ch11.2) và **rebalance số hợp đồng định kỳ**, đừng đặt-rồi-quên.
2. **Roll.** VN30 futures đáo hạn vào ngày **thứ Năm thứ ba** của tháng đáo hạn (VN-FACTS); phải roll vị thế short sang tháng kế *trước* khi đáo hạn. Mỗi lần roll là một lần trả phí giao dịch (VN-FACTS: phí phái sinh cỡ vài nghìn đồng/hợp đồng/chiều) cộng với chịu basis của tháng mới.
3. **Margin call procyclical.** Đúng lúc thị trường sập — lúc leg short futures của bạn đang *lãi* — thì rổ long *lỗ*, và margin trên futures có thể bị đòi thêm (VN-FACTS: tỷ lệ ký quỹ do VSD/CTCK quy định, thay đổi theo thời kỳ). Bài học LTCM của Ch14 áp thẳng vào đây: giữ funding buffer để không bị buộc đóng leg hedge đúng lúc bạn cần nó nhất.

### 8.4 Vol targeting: scale toàn danh mục theo regime VN

Ch11.4 và Ch14 dạy vol targeting — nhân toàn bộ gross exposure với $1/\hat\sigma_t$ để giữ vol danh mục quanh một mốc cố định. Kỹ thuật này *đặc biệt* hợp VN, vì vol thị trường VN đổi rất mạnh theo regime (mục 9): những phiên bình lặng xen kẽ với chuỗi ngày cả rổ kịch sàn. Triết lý Ch14 áp thẳng: **vol thì dự báo được (nó dai dẳng, mean-reverting, đo được nhanh) còn return thì không** — nên scale theo vol là đặt cược vào đúng cái duy nhất ta biết.

**Ví dụ minh họa:** target vol danh mục 20%/năm. Regime bình lặng, realized vol đo được 15% → scale gross lên $20/15 \approx 1{,}33$ (nhồi thêm vì thị trường đang rẻ risk). Vào một chuỗi bão, realized vol nhảy lên 35% → scale xuống $20/35 \approx 0{,}57$, cắt hơn nửa gross. Cơ chế này tự động deleverage khi vào regime nguy hiểm, cắt bớt đuôi trái của phân phối P&L (Ch14). Nhưng nhớ đúng giới hạn Ch14 đã cảnh báo: vol dự báo *trễ* — một phiên cả rổ gap sàn $-7\%$ ngay đầu phiên đánh trúng bạn ở size cũ *trước khi* $\hat\sigma$ kịp nhảy; vol targeting làm phân phối gọn hơn nhưng không cứu bạn khỏi cú jump của đúng một ngày. Ở VN, cơ chế biên độ HOSE $\pm7\%$/ngày (VN-FACTS) vừa là bức tường chặn cú lỗ một ngày ở $-7\%$, vừa là cái bẫy: khi cổ phiếu kịch sàn thường **không có bên đối ứng để khớp** (ai cũng muốn bán, không ai muốn mua — VN-FACTS), bạn không thoát được ở giá sàn. Nên đừng backtest vol targeting với giả định "cắt được ngay ở giá sàn" — đó là một trong những giả định lạc quan giết chết backtest ở VN.

### 8.5 Kelly / half-Kelly cho mức leverage tổng

Câu hỏi cuối của construction: gross exposure *tổng* nên là bao nhiêu? Ch14 trả lời bằng Kelly liên tục $f^* = \mu/\sigma^2$, và cả ba sự thật thực chiến của nó đều nghiêng về **half-Kelly**.

**Ví dụ minh họa:** một chiến lược long-only-đã-hedge có $\mu = 8\%$/năm (alpha tương đối sau khi trung hòa beta) và $\sigma = 20\%$ → full-Kelly $f^* = 0{,}08/0{,}20^2 = 2{,}0$x, half-Kelly $1{,}0$x. Ba lý do dùng half-Kelly ở VN còn *mạnh hơn* thị trường phát triển:

- **$\mu$ ước lượng cực tệ** vì lịch sử data VN ngắn (VN-FACTS: VN-Index từ 2000, VN30 futures từ 2017) → overfitting cực dễ. Ch14 định lượng đòn này: nếu bạn tưởng $\mu = 8\%$ nhưng thực ra chỉ $4\%$, thì full-Kelly bạn đang chạy *chính là* double-Kelly của thực tại — mà double-Kelly kéo growth rate về âm. Half-Kelly là hàng rào chống đúng sai số này, đổi ~25% growth lấy việc chỉ chịu một phần tư variance và không bao giờ rơi qua mép vực.
- **Đuôi dày và jump.** Rủi ro đình chỉ/hủy niêm yết đơn lẻ và các cú thao túng (VN-FACTS: FLC/Trịnh Văn Quyết, Louis Holdings...) làm đuôi trái dày hơn Gaussian; full-Kelly giả định một phân phối "ngoan" mà VN không hề có.
- **Correlation ẩn giữa các cược.** Ch14: Kelly nhiều cược là $f^* = \Sigma^{-1}\mu$, chính công thức tangency của Ch5. Khi mọi cổ phiếu long tương quan cao với nhau (8.2), tổng size Kelly phải cắt mạnh — đúng ví dụ Ch14: hai cược đối xứng độc lập cho tổng $4{,}44$x, nhưng nếu tương quan lên $\rho=0{,}8$ thì tổng tụt còn $2{,}47$x, tức **cắt 44%** dù mỗi cược riêng vẫn hấp dẫn y hệt. Ở VN, nơi cả rổ cùng thắng cùng thua, đây không phải trường hợp biên mà là mặc định.

Xếp thứ tự đúng: vol targeting (8.4) và Kelly (8.5) là hai lớp *độc lập* — Kelly cho bạn mốc gross trung bình dài hạn, vol targeting điều chỉnh nó lên xuống quanh mốc theo regime. Và trên tất cả, funding constraint của Ch14 là trần cứng: *thị trường có thể vô lý lâu hơn thời gian bạn còn trả nổi margin* — khi Kelly và funding xung đột, funding luôn thắng.


## 9. Regime và quản trị rủi ro cho thị trường VN

Hai chương trụ cột của cuốn P cho phần này là **Ch4 (Regime & structural change)** và **Ch14 (Risk management)**. Ch4 dạy ta rằng tham số thị trường không cố định mà trôi theo từng **regime** — những đoạn ổn định bị ngăn cách bởi các **structural break** — và công cụ trung tâm là mô hình phân trạng thái *calm / stress / crisis*, trong đó **vol là biến regime tốt nhất và dễ nhận biết nhất**. Ch14 dạy ba tầng phòng thủ: **position sizing** (Kelly và half-Kelly), **drawdown control**, và trên hết là **survival constraint** khi có đòn bẩy — "thị trường có thể vô lý lâu hơn khả năng bạn trả margin". Mục này áp cả hai vào đặc thù VN, nơi **~85–90% khối lượng là nhà đầu tư cá nhân trong nước** và thị trường hay có những đợt "sập tương quan" đồng loạt.

### 9.1 Regime của thị trường VN: nhận diện để chỉnh size

Regime lý thuyết của Ch4 là ẩn (latent), phải suy ra từ return. Cái may ở VN là có vài biến regime **quan sát trực tiếp được**, nên bạn không cần fit HMM ngay từ đầu — có thể khởi động bằng regime rule-based rồi mới nâng cấp lên mô hình xác suất.

**Chu kỳ lãi suất — driver vĩ mô số một.** Pha nới lỏng (lãi suất hạ, tín dụng rẻ) thường đi cùng dòng tiền cá nhân đổ vào chứng khoán và momentum mạnh; pha thắt chặt đảo ngược khẩu vị rủi ro. Đây đúng tinh thần *regime của cả một mô hình động* mà Hamilton (Ch4) mô tả: không chỉ vol đổi, mà cả **dấu và độ mạnh của các tín hiệu** cũng đổi theo môi trường lãi suất — một alpha momentum lời trong pha nới lỏng có thể đổi dấu trong pha thắt chặt.

**"Bật/tắt" dòng vốn ngoại.** Theo VN-FACTS, **khối ngoại mua/bán ròng được công bố hằng ngày theo từng mã** — đây là một biến regime đặc thù của VN mà thị trường phát triển không có sẵn ở dạng minh bạch như vậy. Những pha nước ngoài bán ròng kéo dài thường là *risk-off*; những pha mua ròng mạnh — nhất là quanh **nâng hạng FTSE Russell lên Emerging Market**, sự kiện kéo dòng vốn thụ động (ETF/quỹ index) vào các mã trong rổ — là *risk-on*. Foreign flow vì thế vừa là nguồn tín hiệu alpha (đã bàn ở phần tín hiệu), vừa là **biến phân regime** ở tầng danh mục.

**Sự kiện vĩ mô và mốc pháp lý.** Họp chính sách, số liệu vĩ mô, và các mốc của lộ trình KRX (short selling, T+1, options rollout dần **2026–2028**) là những thời điểm dễ tạo **structural break**. Quanh các mốc này, hành xử đúng theo Ch4 là **giảm độ tin vào mô hình fit trên regime cũ**: hạ size trước, xác nhận sau.

Vì sao regime lại quan trọng *hơn* ở VN? Vì thị trường này hay có **đợt sập tương quan** — mọi mã cùng rơi, "calm" chuyển "crisis" chỉ trong vài phiên. Đó chính là chuyển từ regime persistence cao sang regime vol-cực-cao mà Ch4 mô hình hóa bằng transition matrix. Công cụ vận hành đơn giản nhất là **vol targeting** (Ch14): ước lượng vol danh mục $\hat\sigma_t$ (realized hoặc GARCH), rồi giữ vol mục tiêu cố định bằng cách scale toàn bộ vị thế theo $1/\hat\sigma_t$. *Ví dụ minh họa:* chiến lược có vol dài hạn 20%/năm, target 15% → chế độ bình thường chạy exposure $15/20 = 0{,}75$; khi vol nhảy lên 40% trong một tuần bão, exposure tự động cắt còn $15/40 \approx 0{,}38$ — deleverage đúng lúc, không cần đoán hướng, vì "vol thì đoán được, return thì không".

### 9.2 Rủi ro đặc thù VN

**(1) Concentration / correlation — khó đa dạng hóa thật.** Thanh khoản VN dồn vào **VN30 + large-cap**; ra ngoài rổ đó thanh khoản mỏng, khó khớp. Hệ quả kép: bạn *muốn* bám VN30 để tránh mã mỏng, nhưng chính vì thế danh mục dễ biến thành **một cược đơn trá hình** — các large-cap VN tương quan cao, và trong stress correlation chạy về gần 1. Đây đúng cơ chế Ch14 định lượng: correlation nhích từ 0 lên 0,8 đã cắt tổng Kelly leverage tới ~44%, và trong crisis nó không dừng ở 0,8. Bài học vận hành: đừng tin diversification tính trên correlation của giai đoạn calm; hãy stress-test danh mục ở kịch bản $\rho \to 0{,}95$.

**(2) Đội lái / thao túng — tránh mã mỏng.** Theo VN-FACTS, nhóm thao túng (pump-and-dump) hoạt động trên **mid/small-cap thanh khoản thấp**; một "tín hiệu đẹp" trên smallcap có thể chỉ là sóng làm giá. Nặng hơn, các **sự kiện thao túng lớn** (các vụ FLC/Trịnh Văn Quyết, Louis Holdings...) mang rủi ro **đình chỉ giao dịch, hủy niêm yết đơn lẻ** — một cú *idiosyncratic tail* mà không mô hình vol nào bắt được. Đây là lập luận rủi ro trực tiếp cho **universe VN30/large-cap + lọc ADV**: bạn hy sinh một ít edge behavioral trên smallcap để loại rủi ro nhị phân "về 0".

**(3) VN30 futures: đòn bẩy gặp gap kịch sàn.** Đây là rủi ro nguy hiểm nhất và được mổ xẻ riêng ở 9.3.

**(4) Drawdown control + Kelly, gắt hơn vì mẫu ngắn.** Với **lịch sử data ngắn** (VN-Index từ 2000, VN30 futures từ 2017), $\mu$ ước lượng cực kém tin cậy — trong khi Ch14 chỉ rõ $f^\star = \mu/\sigma^2$ nhạy tuyến tính với $\mu$. Ước sai $\mu$ gấp đôi biến cái-tưởng-là-full-Kelly thành double-Kelly thật, mà double-Kelly đưa tốc độ tăng trưởng kỳ vọng về **không hoặc âm**. Ở VN, lập luận half-Kelly còn *mạnh hơn* thị trường phát triển, vì mẫu ngắn khiến overfitting dễ và $\mu$ dễ ảo. Chuẩn thực chiến: chạy **half-Kelly hoặc nhẹ hơn**, đặt trần drawdown cứng (ví dụ dừng mở vị thế mới khi drawdown chạm ngưỡng định trước), và ưu tiên **survival constraint** trên expected value.

### 9.3 VN30 futures: margin call và cú gap đòn bẩy

Theo VN-FACTS, VN30 Index Futures niêm yết HNX, **hệ số nhân 100.000 VND/điểm chỉ số**, cho long/short cả hai chiều và giao dịch intraday, với **ký quỹ chỉ một phần notional** (tỷ lệ do VSD/CTCK quy định, thay đổi theo thời kỳ — đòn bẩy cỡ vài lần). Chính đòn bẩy là nơi cơ chế **procyclical margin** của Ch14 (bài học LTCM 1998) tái diễn ở VN: đúng lúc thị trường tệ nhất, yêu cầu ký quỹ bị nâng, buộc bạn đóng vị thế ngay tại đáy.

Số học đòn bẩy tàn nhẫn theo đúng logic LTCM: nếu equity chỉ đỡ một phần nhỏ notional, một biến động ngược chiều tương đối nhỏ của chỉ số cũng đủ bốc hơi phần lớn equity *trước khi* view của bạn kịp đúng. Cộng thêm đặc thù VN: VN30 spot bị chặn bởi biên độ **HOSE ±7%/ngày**, và khi thị trường **gap** mạnh về một phía, futures có thể trượt rất nhanh; nếu các large-cap trong rổ đồng loạt **kịch sàn** thì theo VN-FACTS còn có rủi ro **không có bên đối ứng để khớp** — bạn muốn cắt lỗ mà không thoát ra được.

*Ví dụ minh họa (số giả định để làm rõ cơ chế, không phải quy định cụ thể):* giả sử VN30 ~1.300 điểm → notional 1 hợp đồng $= 1.300 \times 100.000 = 130$ triệu VND. Giả sử bạn ký quỹ ban đầu 26 triệu (đòn bẩy 5x minh họa), giữ 1 hợp đồng **long**. Chỉ số giảm 4% về 1.248 điểm:

$$\Delta = (1.248 - 1.300)\times 100.000 = -52 \times 100.000 = -5{,}2 \text{ triệu VND}.$$

Khoản lỗ mark-to-market 5,2 triệu ăn thẳng vào equity 26 triệu → còn ~20,8 triệu, tức **mất 20% equity chỉ với một cú 4% của chỉ số** — đòn bẩy 5x hiện nguyên hình. Giờ chồng thêm cú **procyclical**: vol tăng khiến CTCK nâng tỷ lệ ký quỹ (đúng cơ chế Ch14). Nếu mức ký quỹ yêu cầu cho vị thế nhảy từ 26 lên 34 triệu, bạn vừa mất 5,2 triệu MtM *vừa* phải nạp thêm ~13 triệu để lấp khoảng cách giữa equity còn lại (20,8) và mức ký quỹ mới (34) — tức bù cả phần nâng 26→34 lẫn phần lỗ. Nếu tài khoản không có buffer, bạn nhận **margin call** và bị **force-close đúng đáy**. Nếu phiên đó VN30 gap mạnh hơn nữa, một cú gap đòn bẩy có thể **quét sạch tài khoản**. Cùng một view, hai nhà giao dịch: người giữ buffer vốn lớn sống qua đoạn path xấu và ăn trọn nhịp hồi; người full-margin chết trước khi được minh oan — đúng châm ngôn Ch14: **alpha không nằm ở tín hiệu, mà ở bảng cân đối kế toán**.

Quy tắc vận hành cho futures VN, rút từ Ch14: (a) chạy **đòn bẩy thực tế thấp hơn nhiều so với mức tối đa** mà ký quỹ cho phép, giữ buffer tiền mặt đủ chịu cả cú MtM lẫn cú nâng haircut; (b) đặt **stop theo mức vốn** chứ không chỉ theo điểm chỉ số, và nhớ rằng stop có thể **không khớp** khi kịch sàn; (c) coi tỷ lệ ký quỹ là biến **procyclical** — khi sizing phải tính kịch bản "vol tăng + haircut tăng đồng thời", vì đó là con số VaR không bao giờ cho bạn.

Cross-reference: regime detection và vol-as-regime ở **Ch4**; vol targeting, Kelly/half-Kelly, procyclical margin, LTCM và cơ chế margin-call dây chuyền ở **Ch14**. Nền forward/futures & basis khi đi sâu định giá hợp đồng nằm ở **Q-World Ch2 và Ch9**.


## 10. Execution và vận hành bot qua API môi giới

Chương 13 cuốn P (Execution) dựng execution thành một ngành riêng: cost model, Almgren-Chriss, TCA, và RL cho child order placement. Phần lớn bộ máy đó sinh ra cho quỹ trade hàng triệu đô một tên, nơi market impact là con quái vật cần thuần hóa. Với một retail quant VN chạy bot vốn nhỏ, tần suất thấp, câu chuyện đảo ngược: impact gần như bằng 0, nhưng bạn phải chiến đấu với những thứ Ch13 chỉ lướt qua — T+2 chặn day-trade ở thị trường cơ sở, lệnh không khớp khi kịch trần/kịch sàn, và một tầng hạ tầng API dễ vỡ. Mục này lấy đúng khung tư duy của Ch13 và dịch nó sang thực tế đó: giữ nguyên các thước đo (IS, participation, cost-risk curve) nhưng thay bài toán "thuần hóa impact" bằng bài toán "không đánh mất alpha vì cơ khí vận hành".

### Chọn API môi giới — và biết mình đang mua gì

Một số công ty chứng khoán VN cung cấp API để đặt lệnh tự động và lấy data: **DNSE** (EntradeX / DNSE API, định hướng algo/retail), **SSI** (FastConnect API), **TCBS** (TCInvest / open API), **VNDIRECT** (dstock API). Ở tầng bot, cả bốn về bản chất cung cấp cùng một hợp đồng: một đường để **đặt/hủy/sửa lệnh**, một đường để **truy vấn vị thế và số dư**, và một luồng **data giá** (thường trùng nguồn `vnstock` mà bạn đã dùng để backtest — Mục 5). Mọi tính năng cụ thể vượt ngoài đó — loại lệnh nâng cao, streaming, môi trường sandbox, giới hạn tần suất gọi — thay đổi theo từng CTCK và theo thời gian, nên phải đọc tài liệu API hiện hành của chính nhà cung cấp bạn dùng thay vì giả định. Nguyên tắc chọn không phải "API nào xịn nhất" mà "API nào khớp được thói quen vận hành của bạn": có môi trường thử (demo/paper) không, giới hạn tần suất ra sao, và có tách được khóa chỉ-đọc với khóa đặt-lệnh không (để một khóa lộ ra không đồng nghĩa mất quyền giao dịch).

Điểm mấu chốt về kiến trúc: **backtest engine (Mục 7) và execution phải nói cùng một ngôn ngữ lệnh.** Nếu backtest giả định khớp tại giá đóng cửa (close), bot phải có một đường thực hiện gần close tương ứng; mọi chênh lệch giữa "lệnh trong mô phỏng" và "lệnh gửi qua API" là một nguồn slippage bạn sẽ trả bằng tiền thật. Đây là biểu hiện cụ thể của nguyên tắc Ch13: TCA chỉ có nghĩa khi decision price của bạn được định nghĩa dứt khoát — và ở đây decision price đó do chính backtest engine ấn định.

### Execution đơn giản là execution đúng cho quy mô này

Ch13 xếp các thuật toán execution trên một đường cong cost-risk: TWAP/VWAP ở đầu (rải đều để né impact), Implementation Shortfall/arrival ở giữa, adaptive/RL ở đỉnh. Với vốn nhỏ tần suất thấp trên VN30 large-cap, bạn sống ở tận cùng bên trái đường cong đó và không cần leo lên. Lý do là số học của square-root law (§13.2): impact $\approx c\,\sigma\sqrt{Q/V}$, với $Q$ là khối lượng bạn giao dịch và $V$ là khối lượng thị trường (ADV). Ví dụ minh họa (số giả định): mua 200 triệu VND một mã VN30 có ADV vài trăm tỷ đồng/ngày → participation $Q/V$ cỡ $0{,}001$ (0,1% ADV), nên $\sqrt{Q/V} \approx 0{,}03$; nhân với $c\sigma$ cỡ vài phần trăm ra impact chỉ **vài bps**. So với chi phí vòng cứng của thị trường VN — phí môi giới khoảng 0,15%–0,35% mỗi chiều cộng thuế bán 0,1% thu trên mỗi lần bán bất kể lãi/lỗ (Mục 3), tức khoảng nửa phần trăm cho một vòng mua-bán trọn vẹn — thì market impact là hạt bụi. Kết luận thẳng: **đừng xây thuật toán execution phức tạp để tiết kiệm thứ vốn đã gần bằng 0.** Cụ thể bạn chỉ cần hai chế độ:

- **Limit gần close.** Đặt lệnh giới hạn quanh giá tham chiếu cuối phiên khi tín hiệu là daily và backtest khớp tại close. Phiên **ATC** (khớp lệnh định kỳ đóng cửa, 14:30–14:45 — Mục 2) cho một giá đóng cửa xác định để bám; đặt limit hợp lệ theo bước giá (tick HOSE: giá <10.000đ bước 10đ, 10.000–<50.000đ bước 50đ, ≥50.000đ bước 100đ — Mục 2) để lệnh không bị từ chối vì sai tick, và làm tròn khối lượng về **lô chẵn 100 cổ phiếu** trên HOSE (Mục 2). Phần lô lẻ dôi ra (1–99 cổ phiếu) phải giao dịch riêng và không nên trông cậy khớp cùng nhịp — cứ để bot bỏ qua nó cho tới khi gom đủ lô chẵn.
- **Rải nhẹ trong phiên (TWAP thủ công) cho lệnh lớn tương đối.** Nếu một lệnh chạm cỡ vài phần trăm ADV của mã (dễ xảy ra khi ra ngoài VN30 vào vùng thanh khoản mỏng — nơi VN-FACTS cảnh báo có đội lái làm giá trên mid/small-cap), chia nhỏ thành vài lát trong ngày. Đây đúng là nghiệm $\lambda \to 0$ của Almgren-Chriss (§13.3) — rải đều để tối thiểu impact — chỉ khác là bạn làm thủ công bằng một vòng lặp gửi lệnh, không cần solver.

**KHÔNG đưa HFT / market making vào.** §13.8 mô tả cung cấp thanh khoản ở thang mili-giây; điều đó bất khả thi cho retail VN vì hai lý do độc lập: hạ tầng (độ trễ API môi giới không phải colocation) và cấu trúc thị trường (T+2 khiến cổ phiếu vừa mua chưa bán lại được cho tới khi về tài khoản ~T+2 — Mục 2, 4). Bot của bạn là một daily/low-frequency executor, không phải một sinh vật vi cấu trúc. Nếu thật sự cần đánh intraday hai chiều có đòn bẩy, sân chơi đúng là **VN30 futures** (long/short cả hai chiều, giao dịch trong ngày — Mục 4), không phải cố ép cổ phiếu cơ sở làm việc nó không làm được.

### TCA cơ bản: đo IS thực tế so với backtest

Ch13 đặt **Implementation Shortfall (IS)** làm thước đo trung tâm buộc mọi thứ phải thành thật (§13.2). Với bot VN, decision price tự nhiên là **giá mà backtest giả định khớp** (thường là close của ngày ra tín hiệu), và bạn đo mỗi lệnh:

$$\text{IS}_{\text{bps}} = \text{sign}\cdot\frac{\bar P_{\text{exec}} - P_{\text{decision}}}{P_{\text{decision}}}\times 10^4 \;+\; \text{phí}\;+\;\text{thuế bán}$$

với $\text{sign}=+1$ cho mua, $-1$ cho bán, cộng thêm phần **opportunity cost** cho khối lượng *không khớp được*. Ở VN, phần opportunity cost này thường không đến từ "giá chạy mất" như thị trường Mỹ mà từ **kịch trần/kịch sàn không có bên đối ứng** (xem dưới). Ví dụ minh họa (số giả định): tín hiệu mua tại close 50.000đ; bot khớp trung bình 50.100đ (đặt limit hơi cao để chắc fill) → execution slippage $= (50.100-50.000)/50.000\times10^4 = 20$ bps; giả sử phí mua 0,2% (nằm trong khoảng 0,15%–0,35% của Mục 3) $= 20$ bps → tổng khoảng 40 bps cho chiều mua, và chiều bán còn gánh thêm thuế bán 0,1% ($= 10$ bps) thu trên mọi lần bán. Con số này phải được ghi log mỗi lệnh và **gộp lại theo thời gian** (§13.5): IS trung bình theo mã, theo giờ đặt (ATC so với khớp liên tục), theo kích cỡ lệnh. Nếu IS trung bình ổn định quanh mức chi phí bạn đã trừ trong backtest, model chi phí của bạn đúng. Nếu nó trôi cao hơn một cách có hệ thống, bạn có một lỗ rò cần vá — không phải "xui".

### Quy trình lên live: paper → vốn nhỏ thật → giám sát LIVE vs BACKTEST

Ch9 (Backtesting) cảnh báo backtest luôn lạc quan và bắt áp **haircut** lên edge trước khi tin (§9.6). Quy trình lên live chính là bài kiểm tra thực nghiệm cho cái haircut đó, đi theo ba nấc, không nhảy cóc:

1. **Paper trade qua demo/API.** Chạy bot gửi lệnh vào môi trường thử (nếu CTCK của bạn cung cấp) hoặc mô phỏng khớp bằng data live nhưng không đặt tiền thật. Mục tiêu ở nấc này thuần về **cơ khí**: bot có gửi đúng lệnh, đúng mã, đúng tick, đúng lô chẵn 100 cổ phiếu (Mục 2) không; có xử lý được ngày nghỉ, ngày giao dịch không hưởng quyền (corporate action — Mục 5) không. Chưa phải lúc đánh giá alpha.
2. **Vốn nhỏ thật.** Chuyển sang tiền thật ở quy mô mà mất trắng cũng không đau. Đây là nấc duy nhất phát lộ những chi phí mà paper giấu đi: slippage thật khi khớp, lệnh bị từ chối, và quan trọng nhất — **fill thật ở giá thật**, gồm cả những lệnh treo không khớp vì trần/sàn.
3. **Giám sát LIVE vs BACKTEST song song.** Mỗi ngày, chạy lại backtest trên đúng data đến hôm nay và so P&L mô phỏng với P&L live. Đây là biểu đồ quan trọng nhất trong phòng vận hành.

Cách đọc khoảng chênh live-vs-backtest chính là chẩn đoán, và Ch9 cùng §13.5 cho sẵn cây quyết định:

- **Lệch nhỏ, ổn định, bằng đúng haircut đã trừ** → hệ thống lành mạnh; đây là cái giá đã biết trước.
- **Live tệ hơn backtest một cách có hệ thống** → hoặc **model chi phí sai** (bạn trừ thiếu phí/thuế/slippage — quay lại phần TCA), hoặc **bug data** khiến backtest thấy một quá khứ không có thật. Ở VN, nghi phạm số một luôn là **corporate action**: cổ tức và thưởng bằng cổ phiếu, phát hành thêm/quyền mua rất dày (Mục 5, VN-FACTS liệt đây là "nguồn lỗi backtest lớn nhất") — một chuỗi giá điều chỉnh sai làm backtest lãi ảo mà live không bao giờ chạm tới.
- **Live tốt hơn backtest** → cũng phải điều tra chứ không được ăn mừng; thường là dấu hiệu look-ahead ngược, hoặc một giả định khớp trong backtest quá bi quan.

### Lưu ý vận hành — nơi bot thật sự chết

Alpha và backtest được viết ở các mục khác; ở đây chỉ nói phần cơ khí giết bot trong đời thực, và đều bắt rễ từ đặc thù thị trường VN trong VN-FACTS:

- **Lệnh không khớp khi kịch trần/kịch sàn.** Biên độ ngày HOSE ±7% (HNX ±10%, UPCoM ±15% — Mục 2; ngày chào sàn biên rộng hơn). Khi một mã chạm **trần**, ai cũng muốn mua và gần như **không có bên bán đối ứng** → lệnh mua của bạn treo không khớp; đối xứng cho **sàn** khi bạn muốn bán. VN-FACTS nhấn mạnh backtest KHÔNG được giả định luôn khớp ở giá trần/sàn — và bot cũng vậy. Bot phải phân biệt "lệnh chưa khớp" với "lệnh đã khớp" trước khi cập nhật vị thế, và có logic rõ ràng: hoặc **để lệnh treo và ghi nhận opportunity cost**, hoặc **hủy và thử lại phiên sau**, chứ tuyệt đối không coi như đã fill.
- **Retry có kỷ luật.** Gọi API thất bại (timeout, vượt giới hạn tần suất, phiên hết hạn) là chuyện thường. Retry phải **idempotent** — trước khi gửi lại một lệnh, truy vấn lại trạng thái để chắc chắn lệnh cũ chưa vào sổ, nếu không bạn khớp gấp đôi. Đặt trần số lần retry và dùng backoff; một vòng retry mù là cách nhanh nhất để nhân đôi vị thế ngoài ý muốn.
- **Kill-switch khi drawdown.** Đây là móc nối trực tiếp tới Risk management (Ch14) và regime/risk (Mục 9). Ch14 mở đầu bằng số học tàn nhẫn: mất 50% cần lãi 100% chỉ để hòa vốn — sống sót là điều kiện tiên quyết của compound. Bot vận hành phải có một **kill-switch tự động**: khi drawdown thực tế vượt một ngưỡng đặt trước, hoặc khi số lệnh lỗi (hay độ lệch so với backtest) vượt ngưỡng, bot **dừng gửi lệnh mới** và báo động cho người. Ngưỡng này không phải để tối ưu return mà để cắt đuôi trái — một bug data hoặc một sự kiện thao túng/đình chỉ giao dịch đơn lẻ (rủi ro đặc thù VN trong VN-FACTS, kiểu các vụ FLC/Louis Holdings) không được phép biến thành một chuỗi lệnh sai mà không ai chặn.

Khép lại theo tinh thần §13.9: với retail VN, execution không phải nơi kiếm alpha mà là nơi **không đánh mất** alpha đã có — giữ cho khoảng cách LIVE-vs-BACKTEST bằng đúng cái haircut bạn đã lường trước, và có sẵn một cái phanh khi nó không còn như vậy.


## 11. Ba template chiến lược khả thi tại Việt Nam

Các mục trước đã ráp xong bộ đồ nghề: data (mục 5), tín hiệu alpha VN (mục 6), backtest engine tôn trọng ràng buộc T+2 / biên độ / kịch trần (mục 7), và khung portfolio long-only cộng futures hedge (mục 8). Mục này gói tất cả lại thành **ba template** — ba khung phương pháp cụ thể, đủ để bạn tự nghiên cứu, code, và backtest. Mỗi template nêu rõ: ý tưởng, sân chơi, tín hiệu, chế độ rebalance, chi phí và rủi ro đặc thù, chương P/Q liên quan, một ví dụ số minh họa, và — quan trọng nhất — **capacity, decay, và cạm bẫy**.

Nhắc trước một lần cho cả mục: **đây là khung phương pháp để bạn tự nghiên cứu và backtest, KHÔNG phải khuyến nghị đầu tư và KHÔNG có gì đảm bảo sinh lời.** Mọi con số bên dưới đều là *ví dụ minh họa* với giả định tự đặt; số thật của bạn phải ra từ backtest trên data của chính bạn, với chi phí thật của công ty chứng khoán bạn dùng.

Ta xếp ba template theo hai "sân chơi" mà mục trước đã phân biệt: **sân A = VN30 Index Futures** (cho phép long/short cả hai chiều, giao dịch intraday, đòn bẩy) và **sân B = long-only equity** (bị chặn short cổ phiếu cơ sở, kẹt chu kỳ thanh toán T+2). Template 1 sống ở sân A; Template 2 sống ở sân B; Template 3 bắc cầu giữa hai sân. Hãy đọc ba template như ba *lát cắt* của cùng một bộ chương P/Q, chứ không phải ba món tách rời: cùng một kỷ luật backtest, cùng một logic breadth, chỉ khác nhau ở ràng buộc thị trường mà mỗi cái phải sống chung.

### Template 1 — VN30 futures: trend + mean-reversion (sân A)

**Ý tưởng.** VN30 futures hiện là công cụ phổ biến nhất ở VN cho phép retail short và giao dịch intraday với đòn bẩy, nên nó là nơi tự nhiên để chạy các chiến lược *directional cả hai chiều*. Ý tưởng lõi: kết hợp một module **trend-following** (đi theo động lượng khi thị trường có xu hướng) với một module **mean-reversion** (fade các cú giật quá đà khi thị trường đi ngang), và để một **regime filter** quyết định module nào được bật. Đây chính là cấu trúc "hai chế độ" mà Ch4 cuốn P (regime & structural change) dựng lên: dùng realized volatility hoặc một Markov-switching signal để phân loại thị trường thành *trending* vs *ranging*, rồi bật đúng module. Điểm tinh tế: regime filter không "chọn đúng tương lai" — nó chỉ đổi *phân phối* cược của bạn sao cho khớp với chế độ đang quan sát được, và đó đã là một lợi thế nếu hai chế độ thật sự luân phiên.

**Sân.** Sân A — VN30 Index Futures, niêm yết HNX, tài sản cơ sở là chỉ số VN30 (spot). Hệ số nhân 100.000 VND/điểm chỉ số; ví dụ minh họa: VN30 ~1.300 điểm → notional ~130 triệu VND/hợp đồng. Ký quỹ chỉ một phần notional (tỷ lệ do VSD/CTCK quy định theo thời kỳ — coi như đòn bẩy cỡ ~5x). Lợi thế cấu trúc lớn nhất so với sân B: futures **không dính ràng buộc T+2 kiểu "mua lô nào phải chờ lô đó về mới bán được"** của cổ phiếu cơ sở, nên bạn mở và đóng vị thế được cả hai chiều **ngay trong ngày**. (Bản thân giá futures vẫn có biên độ dao động ngày, neo theo biên độ của chỉ số cơ sở — bạn vẫn phải để bot xử lý trường hợp giá chạm biên; điều khác biệt so với sân B là không bị khóa bán theo chu kỳ thanh toán.)

**Tín hiệu.** Trend module: một cặp moving-average crossover hoặc breakout kênh giá ($n$-day high/low) trên chuỗi giá futures; vào long khi giá phá đỉnh, short khi thủng đáy. Mean-reversion module: một z-score của giá quanh moving-average — khi giá lệch quá $k$ độ lệch chuẩn và regime đang *ranging*, fade về trung bình. Regime filter (Ch4 P): nếu realized vol thấp và autocorrelation của returns dương → *trending*, ưu tiên trend module; nếu vol cao/choppy → *ranging*, ưu tiên mean-reversion. Sizing theo vol targeting (Ch14 P — risk management): số hợp đồng $\propto 1/\hat\sigma$ để P&L ngày có vol ổn định, thay vì để một cú vol nhảy biến một cược bình thường thành một cược to gấp đôi mà bạn không chủ ý.

**Rebalance.** Đây là template *nhanh nhất* trong ba cái: tín hiệu tính lại mỗi thanh nến (intraday hoặc cuối ngày, tùy timeframe bạn chọn). Vì futures có các tháng đáo hạn xác định và đáo hạn vào **thứ Năm thứ ba** của tháng đáo hạn, backtest và bot phải xử lý **roll**: chuyển vị thế sang hợp đồng tháng kế trước khi thanh khoản của hợp đồng hiện tại cạn — chi tiết mà Ch16 P (trading theo asset class, phần futures) nhấn mạnh. Bỏ sót roll là một trong những lỗi backtest futures kinh điển: đường P&L đẹp giả tạo vì bạn "quên" chi phí và gap của mỗi lần đảo hợp đồng.

**Chi phí / rủi ro đặc thù.** Phí phái sinh tính theo *hợp đồng* (gồm phần VSD + HNX + CTCK) cỡ vài nghìn đồng/hợp đồng/chiều, cộng phí quản lý vị thế qua đêm nếu giữ overnight. Vì đòn bẩy cỡ ~5x, **rủi ro chính là drawdown khuếch đại**: một cú ngược 2% của chỉ số biến thành ~10% trên vốn ký quỹ, và nếu ký quỹ tụt dưới ngưỡng thì bạn bị gọi bổ sung — đòn bẩy khuếch đại cả P&L lẫn *nhịp* buộc phải hành động. Ch13 P (execution) và Ch14 P (risk management) là bắt buộc ở đây: hard stop theo vol, giới hạn số hợp đồng, và kỷ luật roll. Cạm bẫy trend module: **whipsaw** trong thị trường đi ngang (thua liên tục các cú crossover giả). Cạm bẫy mean-reversion: **fade nhầm một xu hướng thật** — bán khi giá còn chạy tiếp; regime filter tồn tại chính để giảm hai lỗi này, nhưng nó chỉ giảm chứ không diệt.

**Ví dụ số minh họa (giả định).** Giả sử trend module có Sharpe ~0,6 nhưng drawdown sâu trong ranging market; mean-reversion module Sharpe ~0,5 nhưng "nổ" trong trending market. Nếu correlation giữa P&L hai module thấp (nhờ regime filter tách chúng theo thời gian), portfolio gộp hai module có thể đạt Sharpe cao hơn từng cái riêng lẻ — đúng logic breadth $IR \approx IC\sqrt{BR}$ của Ch7 P: thêm một nguồn cược *độc lập* nâng information ratio. Nhấn lại: các con số Sharpe ở đây là *giả định để minh họa*, không phải kết quả đo.

**Capacity / decay.** Capacity bị chặn bởi **thanh khoản VN30 futures** — bạn không thể đẩy hàng trăm hợp đồng vào cùng một thời điểm mà không tự làm dịch giá. Với retail thì capacity thường không phải ràng buộc chính, nhưng slippage khi giao dịch intraday thì có, và nó ăn thẳng vào một chiến lược tần suất cao như thế này. **Decay**: các tín hiệu trend/MR đơn giản là công khai và bị arbitrage nhanh; edge suy giảm khi càng nhiều bot chạy cùng logic. Đây là template dễ overfit nhất vì nhiều tham số ($n$, $k$, ngưỡng regime) — mỗi tham số thêm vào là một bậc tự do để đường cong in-sample uốn theo nhiễu, nên phải dùng purged CV và deflated Sharpe (mục 7, Ch9 P) nghiêm ngặt.

### Template 2 — Long-only momentum + foreign-flow trên rổ VN30 (sân B)

**Ý tưởng.** Vì short cổ phiếu cơ sở retail **hiện chưa làm được**, ta ở lại sân B với một danh mục **long-only, cross-sectional**: mỗi kỳ, xếp hạng 30 mã VN30 theo một điểm tổng hợp (momentum + foreign flow), giữ nhóm đầu bảng, bỏ nhóm cuối. Đây là bản VN-hóa của ví dụ momentum xuyên suốt cuốn P (Ch7, Phụ lục A) — nhưng chỉ có "chân long", không có "chân short" để hedge. Chính vì thiếu chân short, đây không phải là một factor bet thuần túy mà là một *directional bet có nghiêng factor*: bạn vẫn ăn beta thị trường, chỉ là chọn lọc mã tốt hơn trung bình.

**Sân.** Sân B — cổ phiếu HOSE, universe = **VN30** (thanh khoản nhất, ít bị đội lái — đúng khuyến cáo lọc mã mỏng ở mục về rủi ro đặc thù). Lô chẵn HOSE là 100 cổ phiếu; kẹt T+2 (mua hôm nay thì ~T+2 lô đó mới về tài khoản và mới bán được).

**Tín hiệu.** Hai khối trực giao hóa với nhau (Ch7 P, signal orthogonalization): (1) **Momentum 12-1** kiểu Jegadeesh-Titman đã điều chỉnh về VN — return 12 tháng bỏ 1 tháng gần nhất, tính trên giá **đã điều chỉnh corporate action đúng** (đây là nguồn lỗi backtest số một ở VN vì corporate action dày đặc — cổ tức cổ phiếu, thưởng, phát hành quyền — và các nguồn data điều chỉnh không nhất quán — mục 5); (2) **Foreign flow** — mua/bán ròng khối ngoại lũy kế theo mã, một tín hiệu *đặc thù VN* công bố hằng ngày (mục 6). Điểm tổng hợp = trọng số hai z-score. Có thể chồng thêm một factor tilt kiểu Ch6 P (ví dụ nghiêng nhẹ về value/quality) nếu backtest cho thấy nó bổ sung breadth thay vì chỉ trùng lặp với momentum.

**Rebalance.** **Hàng tháng.** Đây là lựa chọn có chủ đích, không phải mặc định: rebalance thưa để (a) giảm số vòng giao dịch → giảm chi phí; (b) sống thoải mái với ràng buộc T+2 (không cần bán-mua cùng lô trong ngày); (c) hợp với tần suất decay của momentum, vốn là tín hiệu tháng-quý chứ không phải phút-giờ. Ch11 P (portfolio construction) chỉ cách giới hạn turnover và dùng no-trade band để không "đảo cả sổ" mỗi tháng — một mã tụt vài bậc trong bảng xếp hạng không đáng để bạn trả chi phí vòng bán-mua nếu nó vẫn nằm trong vùng đệm.

**Chi phí / rủi ro đặc thù.** Chi phí vòng (mua + bán) ~ phí 0,15%–0,35%/chiều × 2 chiều cộng **thuế thu nhập khi bán 0,1%** (thu mỗi lần bán trên giá trị bán, bất kể lãi/lỗ) → cỡ ~0,5% mỗi vòng theo running example. Rebalance tháng trên VN30 turnover vừa phải nên chi phí năm ở mức chịu được. Rủi ro đặc thù: (1) **không có chân short → không market-neutral**; danh mục có beta ~1 với VN-Index, nên **tháng thị trường sập, template này sập theo** — đây là lý do mục 8 ghép nó với futures hedge tùy chọn để cắt bớt beta. (2) **Kịch trần/kịch sàn**: HOSE biên độ ±7%/ngày; mã bạn muốn mua có thể kịch trần đúng ngày rebalance và **không khớp được** vì không có bên bán (ai cũng ôm khi trần) — backtest KHÔNG được giả định luôn khớp ở giá trần (mục 7), nếu không bạn sẽ "mua được" trong backtest những lệnh mà ngoài đời sẽ treo. (3) **Corporate action** điều chỉnh sai lệch làm momentum tính sai — một mã chia tách hay trả cổ tức cổ phiếu mà nguồn data quên điều chỉnh sẽ trông như vừa "sụt giá" và bị xếp hạng oan.

**Ví dụ số minh họa (giả định).** Momentum 12-1 trong cuốn P (Phụ lục A) minh họa rank-IC ~0,025 trên một universe rộng ~1000 mã; trên VN30 chỉ có **30 mã** → breadth thấp hơn nhiều, đừng kỳ vọng cùng Sharpe. Ví dụ minh họa: nếu rank-IC trên VN30 ~0,03 nhưng breadth hiệu dụng chỉ ~40 cược độc lập/năm, thì $IR \approx 0{,}03\sqrt{40} \approx 0{,}19$ — khiêm tốn. Foreign-flow bổ sung một nguồn cược *ít tương quan* với momentum, kéo breadth hiệu dụng lên và do đó nâng $IR$ ngay cả khi IC từng tín hiệu không đổi — đó chính là lý do ghép hai tín hiệu thay vì nhân đôi một tín hiệu. (Số giả định, minh họa quan hệ $IR \approx IC\sqrt{BR}$ của Ch7 P, không phải kết quả đo.)

**Capacity / decay.** Capacity **tốt hơn** Template 1 vì cổ phiếu VN30 là nhóm thanh khoản nhất thị trường — chịu được vốn lớn hơn trước khi impact ăn mòn edge. **Decay**: momentum là factor công khai nên đông người khai thác; foreign-flow đặc thù VN nên có thể "tươi" hơn, nhưng cả hai đều decay khi bị đông người chạy. Cạm bẫy: **breadth thấp** (chỉ 30 mã) là hạn chế cấu trúc, không phải thứ tune được — và cám dỗ tự nhiên là nong universe ra midcap/smallcap để tăng số mã. **Đừng.** Đó chính là nơi đội lái tạo "tín hiệu đẹp" giả trên thanh khoản mỏng (mục về rủi ro đặc thù); breadth bạn thêm được là breadth *độc hại*, làm hỏng chứ không cứu information ratio.

### Template 3 — Basis VN30 futures–spot + event nâng hạng / rebalance rổ (sân A/B)

**Ý tưởng.** Hai edge khác hẳn hai template trên, cùng gom vào đây vì cả hai đều dựa trên **quan hệ giá có neo lý thuyết** thay vì dự báo hướng. (a) **Basis trade**: futures VN30 và spot (chỉ số VN30) bị buộc với nhau bởi cost-of-carry; khi basis (futures − spot) lệch khỏi giá trị fair, ta kỳ vọng nó hội tụ về 0 khi đáo hạn — một cái neo *toán học* chứ không phải một dự đoán về hướng thị trường. (b) **Event-driven**: khi FTSE Russell nâng hạng VN lên Emerging Market kéo dòng vốn ngoại thụ động vào rổ, hoặc khi rổ VN30 đảo định kỳ (~2 lần/năm), dòng vốn *thụ động* (ETF/quỹ index) buộc phải mua/bán các mã vào/ra rổ → tạo áp lực giá dự đoán được quanh ngày hiệu lực.

**Sân.** Sân A/B — basis trade dùng **cả** futures (sân A) **và** spot; event-driven chủ yếu là **long-only cổ phiếu** (sân B) vì short cơ sở chưa mở. Lưu ý quan trọng: basis trade "đầy đủ" (arbitrage khóa hai chân) cần short được một chân — chân spot có thể phải thay bằng rổ cổ phiếu VN30 hoặc ETF mô phỏng, và chân short thì chỉ đặt được qua futures. Vì short cổ phiếu retail chưa có, phiên bản khả thi nhất cho retail **không phải** arbitrage khóa cứng mà là **directional trên chính basis qua futures** cộng theo dõi hội tụ về đáo hạn — nghĩa là bạn vẫn ăn một phần rủi ro hướng, và phải trung thực gọi nó đúng tên thay vì tự nhận là "phi rủi ro".

**Tín hiệu.** Basis (Ch9 cuốn Q — lãi suất / forward / futures, và Ch15/16 cuốn P — bản đồ chiến lược & asset class): tính basis = giá futures − giá spot chỉ số; so với carry fair value; giao dịch khi lệch vượt ngưỡng, đóng khi hội tụ hoặc tại đáo hạn (thứ Năm thứ ba của tháng đáo hạn). Event: danh sách mã dự kiến vào/ra rổ FTSE/VN30 (công bố trước ngày hiệu lực); vào vị thế trước ngày rebalance, thoát quanh ngày hiệu lực khi dòng tiền thụ động khớp lệnh.

**Rebalance.** **Theo lịch sự kiện**, không phải theo tần suất cố định: basis giao dịch quanh chu kỳ đáo hạn hàng tháng; event giao dịch quanh vài mốc rebalance/nâng hạng trong năm. Đây là template *ít cược nhất* trong ba cái — nhưng mỗi cược có một luận điểm rõ ràng bạn viết ra được thành một câu, điều mà không phải chiến lược tần suất cao nào cũng làm được.

**Chi phí / rủi ro đặc thù.** Basis: chi phí gồm cả phí futures lẫn phí/thuế cổ phiếu nếu dùng chân spot; rủi ro **tracking** giữa rổ cổ phiếu bạn tự dựng và chỉ số thật (nếu không dùng ETF khớp), cộng rủi ro roll khi đảo hợp đồng. Event: rủi ro **"tin đã vào giá"** — nếu ai cũng biết mã nào vào rổ, giá đã chạy trước ngày bạn kịp vào; và rủi ro *không khớp được khi kịch trần/sàn* quanh ngày hiệu lực, đúng lúc bạn cần thoát nhất. Cả hai đều nhạy với thanh khoản; tránh mã ngoài VN30 / large-cap.

**Ví dụ số minh họa (giả định).** Nếu basis fair ~0 khi sát đáo hạn nhưng thị trường đẩy futures lệch vài điểm chỉ số so với spot, mỗi điểm = 100.000 VND/hợp đồng; hội tụ 3 điểm → ~300.000 VND/hợp đồng trước phí (ví dụ minh họa, không phải giá thật — và "trước phí" là chữ then chốt, vì phí futures cho một cược nhỏ như thế ăn mất phần đáng kể). Event: mức "premium quanh ngày hiệu lực" của một mã hút vốn thụ động là giả thuyết bạn phải **backtest trên các lần rebalance lịch sử** — mà lịch sử VN ngắn nên số mẫu ít, dễ overfit.

**Capacity / decay.** Basis: capacity bị chặn bởi thanh khoản futures cộng khả năng dựng chân spot. Event: capacity ổn (large-cap) nhưng **số sự kiện mỗi năm rất ít** → breadth cực thấp, mỗi lần lại là một mẫu → **rủi ro overfit trên lịch sử ngắn** là cạm bẫy lớn nhất (mục về rủi ro: data VN ngắn — VN-Index từ 2000, VN30 futures từ 2017 — nên overfit cực dễ). Decay: nâng hạng FTSE là sự kiện *một lần* trong giai đoạn chuyển mình hiện tại, không lặp lại để bạn học rút kinh nghiệm qua nhiều vòng; rebalance rổ thì lặp nhưng ngày càng đông người đón đầu → edge co lại theo mỗi kỳ.

### Chọn template nào để bắt đầu

Nếu bạn muốn **học vòng đời chiến lược đầy đủ nhất với ràng buộc VN dễ thở nhất**, Template 2 (long-only momentum + foreign-flow, rebalance tháng) là điểm khởi đầu tự nhiên: nó dùng đúng bộ chương P mà cả tài liệu này xoay quanh (Ch5 lý thuyết danh mục, Ch6 factor, Ch7 alpha research, Ch11 portfolio construction, cộng Phụ lục A), tránh đòn bẩy, và data cần chỉ là giá đã điều chỉnh corporate action + foreign flow — cả hai đều lấy được từ `vnstock`. Template 1 dạy bạn kỷ luật execution/risk của thế giới có đòn bẩy (Ch4 regime, Ch13 execution, Ch14 risk, Ch16 asset class). Template 3 dạy bạn tư duy relative-value và event (Ch15/16 P, Ch9 Q) — nhưng để dành lại sau, vì lịch sử ngắn khiến nó khó backtest thành thật nhất. Dù chọn cái nào, kỷ luật của mục 7 — purged CV, deflated Sharpe, không giả định khớp ở giá trần/sàn, chi phí thật của chính công ty chứng khoán bạn dùng — mới là thứ quyết định template của bạn sống hay chết ngoài đời, chứ không phải độ đẹp của đường equity in-sample.


## 12. Kế hoạch 90 ngày, cạm bẫy, và ánh xạ chương P/Q → VN

Mười một mục trước đã trải ra toàn bộ vật liệu: tư duy, cấu trúc thị trường, ràng buộc giao dịch, các lớp tài sản (asset class), data, alpha, backtest engine, portfolio, regime, execution, và ba template chiến lược. Mục cuối đóng gói tất cả thành một thứ bạn có thể **bắt đầu vào thứ Hai tuần sau**: một kế hoạch 90 ngày có nghiệm thu từng chặng, một bảng cạm bẫy để dán lên tường, và một bảng ánh xạ lớn cho biết mỗi chương của P-World (cùng vài chương Q-World liên quan) là dùng thẳng được, phải chỉnh, hay chưa dùng được ở Việt Nam. Khép lại là danh sách tài nguyên và — quan trọng nhất — một lời nhắc về kỳ vọng đúng cho 90 ngày đầu. Không có mục nào trong đây là lý thuyết suông; mỗi dòng đều quy về một hành động bạn gõ được vào terminal hoặc một tiêu chí bạn tick được.

### 12.1. Kế hoạch 90 ngày

Chia làm bốn chặng. Nguyên tắc xuyên suốt: **không bước sang chặng sau nếu chặng trước chưa có output kiểm chứng được.** Đừng viết signal khi engine chưa đáng tin; đừng paper trade khi backtest chưa qua nổi kiểm định thống kê. Mỗi chặng dưới đây kết bằng một tiêu chí nghiệm thu cụ thể — không đạt thì ở lại, không đi tiếp. Đây không phải checklist trang trí: cái giá của việc nhảy cóc là bạn sẽ đổ vốn thật vào một pipeline mà chính bạn không biết chỗ nào đang nói dối.

**Tuần 1–3 — Hạ tầng dữ liệu và engine backtest của riêng bạn.** Cài `vnstock`, kéo về giá lịch sử VN30, khối lượng, và dòng tiền mua/bán ròng của khối ngoại theo mã (foreign flow được công bố hằng ngày). Việc thật sự tốn công không phải cài thư viện mà là **làm sạch corporate action**: cổ tức bằng cổ phiếu, thưởng cổ phiếu, phát hành thêm và quyền mua rất dày ở VN (mục 5), nên bạn phải kiểm tra chuỗi giá điều chỉnh của mình có nhất quán không — đây là **nguồn lỗi backtest lớn nhất ở Việt Nam** vì nhiều nguồn data điều chỉnh không giống nhau. Cách kiểm rẻ nhất: chọn vài mã vừa chia cổ tức cổ phiếu, tự tính lại hệ số điều chỉnh, rồi so với ít nhất hai nguồn — chỗ nào lệch là chỗ đó sẽ đẻ ra return giả. Song song, **tự viết một backtest engine event-driven** (đừng dùng vectorized ở bước này) theo đúng thiết kế ở mục 7: mô phỏng T+2 (cổ phiếu vừa mua chưa bán được cho tới khi về tài khoản, khoảng T+2), chặn khớp khi giá kịch trần/kịch sàn (biên HOSE $\pm 7\%$; HNX $\pm 10\%$, UPCoM $\pm 15\%$ nếu universe của bạn chạm hai sàn kia — khi kịch biên thường không có bên đối ứng nên lệnh của bạn có thể **không khớp**), và trừ đúng chi phí: phí môi giới khoảng $0{,}15\%$–$0{,}35\%$/chiều tùy CTCK, cộng thuế thu nhập khi bán $0{,}1\%$ trên giá trị bán, thu mỗi lần bán bất kể lãi hay lỗ. **Nghiệm thu tuần 3:** engine chạy được một chiến lược buy-and-hold tầm thường và ra đúng đường vốn (equity curve) mà bạn có thể verify bằng tay trên vài lệnh — từng đồng phí, từng ngày T+2, từng lần chạm biên. *(Ánh xạ: P Ch2 dữ liệu & returns, P Ch9 backtesting, P Ch13 execution.)*

**Tuần 4–8 — Momentum long-only trên VN30, đầy đủ ma sát.** Chạy chiến lược tham chiếu — cross-sectional momentum trên rổ VN30 theo đúng worked example của **Phụ lục A cuốn P** — nhưng nhúng vào môi trường VN thật: chi phí vòng mua+bán (ví dụ minh họa: mua giá 50.000đ, phí $0{,}2\%$/chiều cộng thuế bán $0{,}1\%$ → chi phí vòng khoảng $0{,}5\%$), thuế bán thu mỗi lần bán bất kể lãi/lỗ, ràng buộc T+2, biên độ trần/sàn, và **survivorship** — universe VN30 phải là rổ *tại thời điểm đó* (point-in-time), không phải rổ hôm nay chiếu ngược, vì rổ VN30 được đổi định kỳ khoảng hai lần mỗi năm và một mã rớt rổ hôm nay có thể đã nằm trong rổ ba năm trước. Rồi đọc kết quả bằng ba con mắt: Information Coefficient (tương quan giữa signal và return kỳ sau), **Sharpe sau phí** (không phải Sharpe gross — con số gross ở VN đẹp một cách lừa dối vì phí và thuế bán ăn mòn rất mạnh, nhất là khi turnover cao), và **deflated Sharpe** để phạt cho số lần bạn đã thử. Vì lịch sử data VN ngắn (VN-Index từ 2000, VN30 futures mới từ 2017), overfitting cực dễ; kỷ luật deflated Sharpe và purged CV ở đây không phải để cho đẹp mà là phòng thủ sống còn. **Nghiệm thu tuần 8:** bạn biết momentum long-only *sau mọi ma sát* còn sống hay không, và biết chính xác chi phí giết mất bao nhiêu phần alpha. *(Ánh xạ: P Ch7 alpha research, P Phụ lục A, P Ch9 backtesting, P Ch20 performance attribution.)*

**Tuần 9–12 — Thêm tín hiệu ít tương quan và paper trade.** Một signal đơn độc thì mong manh; giá trị thật đến từ **kết hợp các nguồn ít tương quan** (mục 6, 8). Thêm ít nhất một tín hiệu đặc thù VN mà thị trường phát triển không sẵn có: **foreign flow** (mua/bán ròng của khối ngoại theo mã, công bố hằng ngày — một nguồn tín hiệu riêng của VN) và/hoặc **short-term reversal** (đảo chiều ngắn hạn — mạnh vì phần lớn khối lượng giao dịch, cỡ 85–90%, là nhà đầu tư cá nhân trong nước, nhiều noise trader). Đo tương quan của signal mới với momentum; nếu gần bằng 0 mà mỗi cái đều có IC dương thì đó là vàng, vì lúc đó bạn được cộng thêm return mà không cộng thêm rủi ro chung. Sau đó **paper trade qua API môi giới** (các CTCK như DNSE, SSI, TCBS, VNDIRECT đều cung cấp API đặt lệnh và data — mục 10): chạy pipeline sinh lệnh mỗi ngày nhưng đặt lệnh giả, ghi lại lệnh dự kiến kèm giá và thời điểm để về sau đối chiếu với giá khớp thật. **Nghiệm thu tuần 12:** một portfolio đa tín hiệu long-only đang "chạy" hằng ngày trên giấy, có log đầy đủ để đối soát từng lệnh. *(Ánh xạ: P Ch6 factor models, P Ch8 behavioral & limits to arbitrage, P Ch11 portfolio construction, P Ch13 execution.)*

**Sau 90 ngày — vốn nhỏ thật, đo live-vs-backtest.** Chỉ khi paper trade đã ổn định mới bỏ **vốn nhỏ** vào và bắt đầu việc quan trọng nhất mà không backtest nào làm thay được: **đo độ lệch giữa live và backtest.** Slippage thật so với giả định, tỷ lệ lệnh không khớp khi giá gần trần/sàn, chi phí thật của CTCK bạn đang dùng (đọc kỹ biểu phí thực tế thay vì con số khoảng trong sách). Nếu live tệ hơn backtest nhiều — điều gần như luôn xảy ra ở lần đầu — thì mặc định là **giả định trong engine sai chứ không phải thị trường sai**; quay lại sửa engine cho khớp thực tế rồi mới bàn đến chuyện chiến lược. Đây là vòng lặp bạn sẽ sống chung với nó mãi.

### 12.2. Bảng tổng "cạm bẫy VN"

Sáu cái bẫy này giết nhiều backtest VN nhất. In ra, dán lên tường.

| Cạm bẫy | Vì sao giết backtest | Cách xử lý tối thiểu |
|---|---|---|
| **Corporate action** (cổ tức cổ phiếu, thưởng, quyền mua) | Điều chỉnh giá phức tạp, nhiều nguồn data điều chỉnh *không nhất quán* → chuỗi return sai từ gốc | Tự tính lại hệ số điều chỉnh; đối chiếu ≥2 nguồn; soi kỹ đúng các ngày sự kiện |
| **Trần/sàn không khớp được** | Kịch trần ai cũng muốn mua / kịch sàn ai cũng muốn bán → thường không có bên đối ứng, lệnh *không khớp* | Engine chặn fill khi giá chạm biên (HOSE $\pm 7\%$; HNX $\pm 10\%$; UPCoM $\pm 15\%$); không giả định luôn khớp ở trần/sàn |
| **Đội lái (pump-and-dump)** | "Tín hiệu đẹp" trên mid/small-cap thanh khoản thấp có thể chỉ là sóng làm giá | Bám VN30/large-cap; lọc bỏ mã mỏng bằng ngưỡng ADV |
| **Data lịch sử ngắn** | VN-Index từ 2000, VN30 futures từ 2017 → mẫu ít → overfit cực dễ | Deflated Sharpe, purged CV, ít tham số, ít lần thử |
| **Chi phí + thuế** | Phí khoảng $0{,}15\%$–$0{,}35\%$/chiều tùy CTCK, cộng thuế bán $0{,}1\%$ mỗi lần → vòng cỡ $0{,}5\%$ | Luôn đọc Sharpe *sau phí*; phạt turnover cao |
| **T+2** | Cổ phiếu vừa mua chưa bán được cho tới khi về (khoảng T+2) → chặn day-trade trên cơ sở, kẹt vốn | Mô phỏng T+2 trong engine; cần intraday/hai chiều → dùng VN30 futures |

### 12.3. Bảng ánh xạ lớn: chương P/Q → VN

Ba trạng thái: **[Dùng thẳng]** dùng gần như nguyên bản; **[Phải chỉnh]** ý tưởng đúng nhưng phải nhúng ràng buộc VN; **[Chưa dùng được]** thiếu điều kiện thị trường (short cơ sở, options niêm yết rộng, thanh khoản, hoặc data).

| Chương | Nội dung | Trạng thái ở VN | Ghi chú |
|---|---|---|---|
| **P Ch1** P là gì | Khung tư duy P | Dùng thẳng | Nền tảng, không phụ thuộc thị trường |
| **P Ch2** Dữ liệu & returns | Xử lý giá/return | Phải chỉnh | Corporate action VN dày; universe point-in-time |
| **P Ch3** Thống kê/econometrics | Công cụ thống kê | Dùng thẳng | Toán không đổi theo biên giới |
| **P Ch4** Regime & structural change | Nhận diện regime | Phải chỉnh | Regime VN chịu chi phối mạnh bởi dòng tiền retail và dòng vốn khối ngoại (mục 4, 9) |
| **P Ch5** Lý thuyết danh mục | Mean-variance | Phải chỉnh | Ràng buộc long-only; short cổ phiếu cơ sở retail chưa làm được |
| **P Ch6** Factor models | Mô hình nhân tố | Phải chỉnh | Factor VN cần calibrate lại; value/size hành xử khác thị trường phát triển |
| **P Ch7** Alpha research | Quy trình tìm alpha | Dùng thẳng | Quy trình đúng; nhớ behavioral edge ở VN mạnh hơn (mục 6, 8) |
| **P Ch8** Behavioral & limits to arbitrage | Sai giá hành vi | Dùng thẳng | *Tâm điểm lợi thế VN* — thị trường retail-dominated (85–90% khối lượng), limits to arbitrage rất rõ |
| **P Ch9** Backtesting | Kỷ luật backtest | Phải chỉnh | Bơm T+2 / biên độ trần-sàn / phí / thuế / survivorship (mục 7) |
| **P Ch10** Feature engineering & labeling | Tạo feature/nhãn | Dùng thẳng | Kỹ thuật chung |
| **P Ch11** Portfolio construction | Dựng danh mục | Phải chỉnh | Long-only; muốn hedge / đi hai chiều thì mượn VN30 futures (mục 8) |
| **P Ch12** Microstructure theory | Vi cấu trúc | Phải chỉnh | Áp vào phiên ATO/ATC, bước giá (tick), lô chẵn 100, cơ chế trần/sàn |
| **P Ch13** Execution | Thực thi lệnh | Phải chỉnh | Qua API CTCK; mô hình slippage riêng cho VN (mục 10) |
| **P Ch14** Risk management | Quản trị rủi ro | Phải chỉnh | Thêm rủi ro đình chỉ/hủy niêm yết đơn lẻ và hết room ngoại |
| **P Ch15** Bản đồ chiến lược | Phân loại chiến lược | Phải chỉnh | Lọc bỏ nhánh cần short hoặc options trên cơ sở |
| **P Ch16** Trading theo asset class | Đa asset class | Phải chỉnh | VN hiện có: equity long-only, VN30 futures, chứng quyền (CW) |
| **P Ch17** Machine learning | ML cho alpha | Phải chỉnh | *Cẩn trọng* — data ngắn, ML overfit rất nhanh ở VN |
| **P Ch18** Credit & FI relative value | RV tín dụng/FI | Chưa dùng được | Công cụ trái phiếu/tín dụng cho retail chưa đủ (futures TPCP có nhưng ít thanh khoản với retail) |
| **P Ch19** Volatility trading | Giao dịch vol | Chưa dùng được | Chưa có options niêm yết rộng; chờ rollout KRX |
| **P Ch20** Performance attribution | Bóc tách hiệu suất | Dùng thẳng | Bắt buộc để biết alpha đến từ đâu (mục 9) |
| **P Ch21** Industry | Bức tranh ngành | Dùng thẳng | Bối cảnh nghề |
| **P Ch22** Lộ trình | Roadmap học | Dùng thẳng | Chính là tinh thần của mục này |
| **P Phụ lục A** Momentum worked example | Ví dụ momentum | Dùng thẳng | Xương sống của chặng tuần 4–8 |
| **Q Ch2** Nền tảng forward/futures | Định giá kỳ hạn | Phải chỉnh | Nền để hiểu **basis** giữa VN30 futures và spot (mục 4) |
| **Q Ch9** Lãi suất (futures/basis) | Basis, cost of carry | Phải chỉnh | Dùng cho hedge và basis trade trên VN30 futures |
| **Q Ch5–6** Options/Greeks | Định giá quyền chọn | Chưa dùng được | Chỉ chạm khi làm CW (do CTCK phát hành, chủ yếu là call, có đòn bẩy); dùng đủ khi options mở rộng |

Đọc bảng theo chiều dọc: phần lớn P **dùng được nếu chịu chỉnh**; nhóm **[Chưa dùng được]** đúng bằng những chỗ VN còn thiếu công cụ (short cổ phiếu cơ sở, options niêm yết rộng, tín dụng cho retail) — và đó cũng chính là bản đồ những gì sẽ mở ra khi hệ thống KRX rollout dần trong giai đoạn 2026–2028 và việc FTSE Russell nâng hạng Việt Nam lên Emerging Market kéo dòng vốn ngoại thụ động vào các mã trong rổ. Phần lớn Q-World hiện *chưa dùng nhiều* cho retail VN, nhưng nền forward/futures và Greeks sẽ cần ngay khi CW/options mở rộng.

### 12.4. Tài nguyên và kỳ vọng đúng

**Data và công cụ.** Điểm khởi đầu: **`vnstock`** — thư viện Python mã nguồn mở miễn phí và phổ biến nhất để lấy dữ liệu VN (giá lịch sử/intraday, báo cáo tài chính, bảng giá, khối ngoại). Vendor nâng cao khi cần dữ liệu sâu/sạch hơn: **FiinTrade/FiinX** (FiinGroup), **Wichart**, **Vietstock**. Chart: TradingView. Cộng đồng phân tích kỹ thuật VN dùng nhiều **Amibroker** để backtest — hữu ích để đối chiếu kết quả, nhưng engine event-driven tự viết mới là thứ bạn kiểm soát được từng giả định. **API đặt lệnh (bot):** các CTCK như DNSE (EntradeX / DNSE API, hướng algo/retail), SSI (FastConnect API), TCBS (TCInvest / open API), VNDIRECT (dstock API) — mỗi bên cung cấp API đặt lệnh và data; hãy đọc kỹ tài liệu cùng quy định hiện hành của từng CTCK trước khi cắm bot vào, vì tính năng và điều khoản thay đổi theo thời kỳ.

**Kỳ vọng đúng cho 90 ngày.** Đây là điểm dễ tự lừa nhất. **90 ngày đầu, mục tiêu KHÔNG phải là lãi.** Mục tiêu là một **pipeline sạch** — data đúng, engine trung thực về T+2, biên độ trần/sàn, phí và thuế, cùng một quy trình đo lường không tự dối. Ai đặt mục tiêu "kiếm tiền trong quý đầu" sẽ bị dụ tắt bớt chi phí trong backtest, nới giả định fill ở trần/sàn, hay nhồi tham số cho đường vốn đẹp — rồi trả giá bằng tiền thật ngay lệnh đầu. Chỉ tiêu đúng của quý đầu gói trong một câu hỏi: *tôi có tin được con số backtest của mình không?* Khi câu trả lời là có — sau khi đã trừ mọi ma sát và đã đo live-vs-backtest với vốn nhỏ — thì bạn mới thực sự bắt đầu.

### 12.5. Cầu kết

Toàn bộ tài liệu này chỉ nói một điều: **P-World và Q-World cho bạn khung tư duy đúng, nhưng thị trường Việt Nam là một môi trường cụ thể với ràng buộc cụ thể.** Momentum, factor, risk parity, basis trade — nguyên lý không đổi khi qua biên giới; cái đổi là T+2 chặn day-trade trên cơ sở, biên độ trần/sàn làm lệnh không khớp lúc kịch biên, retail chưa short được cổ phiếu cơ sở nên phải mượn VN30 futures để đi hai chiều, corporate action dày làm data dễ sai, và một thị trường mà 85–90% khối lượng là nhà đầu tư cá nhân — vừa là cái bẫy (đội lái, noise) vừa là mỏ vàng (behavioral edge mạnh). Người thắng ở đây không phải người có mô hình phức tạp nhất, mà người **trung thực nhất với ma sát** và kiên nhẫn xây pipeline trước khi xây lợi nhuận. Sách cho bạn nguyên lý; mục này cho bạn 90 ngày đầu; phần còn lại là kỷ luật lặp lại vòng live-vs-backtest cho tới khi con số bạn tin được cũng là con số thị trường trả cho bạn.

---

> *Tài liệu phương pháp, không phải khuyến nghị đầu tư. Thị trường VN đang cải cách (KRX rollout 2026–2028); kiểm tra quy định & biểu phí hiện hành với công ty chứng khoán trước khi triển khai vốn thật.*

*Hết — Thực chiến cho Thị trường Việt Nam.*
