# P-World: Quantitative Trading & Alpha Research — Từ Zero đến Quant Researcher

> Giáo trình nhập môn → nâng cao về thế giới P (real-world measure): thống kê tài chính, regime, factor models, alpha research, backtesting, feature engineering, portfolio construction, vi cấu trúc & execution, risk, chiến lược đa asset-class, và machine learning. Viết theo chuẩn industry buy-side hiện tại (2026: pod shops, AFML, alt-data, ML). Mọi khái niệm đi kèm ví dụ tính bằng số cụ thể. Cuốn song song về thế giới Q (derivatives pricing, sell-side) nằm ở `docs/q-world.md`.

---

## Mục lục

### Phần I — Nền tảng

1. P-world là gì
2. Dữ liệu và returns
3. Thống kê và econometrics
4. Regime và structural change
5. Lý thuyết danh mục
6. Factor models

### Phần II — Alpha

7. Alpha research
8. Nền tảng hành vi và giới hạn arbitrage
9. Backtesting
10. Feature engineering và labeling

### Phần III — Từ tín hiệu đến P&L

11. Portfolio construction
12. Lý thuyết vi cấu trúc thị trường
13. Execution
14. Risk management

### Phần IV — Chiến lược & Machine learning

15. Bản đồ các chiến lược
16. Trading theo asset class
17. Machine learning trong tài chính
18. Credit và fixed-income relative value
19. Volatility trading (buy-side)
20. Performance attribution và P&L decomposition

### Phần V — Nghề

21. Industry — văn hóa, career, tech stack
22. Lộ trình học và tài nguyên

### Phụ lục

- A. Ví dụ xuyên suốt — xây một book đa-tín-hiệu
- B. Case studies — phân tích định lượng
- C. Từ điển thuật ngữ P-world

---

# Chương 1: P-world là gì

## 1.1 Trò chơi khác hẳn Q

Có hai cách kiếm tiền từ giá tài sản, và chúng khác nhau tận gốc về mặt toán học. Q-world (cuốn chị em) trả lời câu hỏi "derivative này giá bao nhiêu **hôm nay**" bằng no-arbitrage: nếu ta có thể replicate payoff của một option bằng một danh mục cổ phiếu và tiền mặt được điều chỉnh liên tục, thì giá option **buộc phải** bằng chi phí của danh mục đó — nếu không, có arbitrage không rủi ro. Điểm mấu chốt: người Q-world **không cần dự báo** giá tương lai sẽ lên hay xuống. Họ chỉ cần biết vol và lãi suất, rồi để cơ chế replication làm phần còn lại. Drift thật của cổ phiếu ($\mu$) biến mất khỏi công thức Black-Scholes — đó là điều kỳ diệu của risk-neutral pricing.

P-world chơi trò ngược lại, và khó hơn về bản chất: **dự báo phân phối thật của giá tương lai, và kiếm tiền từ chỗ dự báo của mình tốt hơn cái mà giá thị trường đang ngầm định**. Không có phép màu replication nào cứu ta cả. Ta phải đoán $\mu$ — chính cái mà Q-world vứt đi — và đoán đúng thường xuyên hơn sai một chút.

"P" là **physical measure** (còn gọi là real-world measure hay historical measure): xác suất **thật** của các kịch bản — cái xác suất mà, nếu Chúa tồn tại và ghi sổ, sẽ là con số đúng. Không ai biết chính xác nó. "Q" là **risk-neutral measure**: một xác suất "nhân tạo" được xây sao cho mọi tài sản đều có kỳ vọng return bằng lãi suất phi rủi ro, tiện cho việc định giá. Hai measure liên hệ nhau qua **Radon-Nikodym derivative** — về bản chất là market price of risk, phần bù rủi ro mà nhà đầu tư đòi hỏi để nắm giữ tài sản rủi ro. Để thấy khoảng cách giữa hai thế giới bằng số cụ thể: một cổ phiếu có drift thật $\mu = 8\%$/năm (P-world tin thế, dựa trên equity risk premium lịch sử), vol $\sigma = 20\%$/năm, và lãi suất phi rủi ro $r = 4\%$/năm. Dưới measure P, cổ phiếu drift ở $8\%$; dưới measure Q nó "drift" đúng bằng $r = 4\%$. Chênh lệch $8\% - 4\% = 4\%$ chính là risk premium. Đại lượng nối hai thế giới là **market price of risk** (Sharpe của thị trường dưới P):
$$\lambda = \frac{\mu - r}{\sigma} = \frac{0.08 - 0.04}{0.20} = 0.20.$$
Con số 0.20 này chính là "tỷ giá quy đổi" giữa P và Q: nó nói mỗi đơn vị rủi ro (vol) được thị trường thưởng 0.20 đơn vị return vượt trội. Radon-Nikodym derivative dịch chuyển drift đúng $\lambda\sigma = 0.20 \times 0.20 = 0.04 = 4\%$ — đúng bằng risk premium. **Toàn bộ nghề P-world là săn tìm và ước lượng những risk premium (và mispricing) như $\lambda$ ở trên**, trong khi Q-world cố tình xóa chúng đi ($\lambda \to 0$ dưới Q) để định giá cho sạch.

Người P-world dùng thống kê để **ước lượng** xác suất thật từ dữ liệu, chấp nhận sai số lớn, và xây hệ thống sao cho *trung bình* đúng nhiều hơn sai một chút — rồi dùng đòn bẩy của **số lượng** (nhiều cược gần độc lập) biến "một chút" thành lợi nhuận ổn định. Đây là ý tưởng trung tâm, và ta sẽ định lượng nó ngay dưới đây.

Ba sự thật nền tảng định hình toàn bộ nghề — ghi nhớ trước khi học bất kỳ kỹ thuật nào.

**Thứ nhất: tín hiệu cực yếu.** Thị trường tài chính là hệ thống gần-hiệu-quả: hàng chục nghìn người thông minh, được trang bị máy tính và dữ liệu như nhau, cùng săn một con mồi. Mọi pattern kiếm được tiền đều tự hủy dần khi bị khai thác — khác vật lý, nơi định luật hấp dẫn không suy yếu đi khi bạn công bố nó. Correlation giữa dự báo tốt và thực tế, gọi là **information coefficient** ($IC$), cỡ 0.02–0.05 đã là hàng xịn của một tín hiệu độc lập. Con số này nhỏ đến mức phản trực giác: một tín hiệu với $IC = 0.03$ nghĩa là khi ta xếp hạng 1000 cổ phiếu theo dự báo và so với return thực tế, hệ số tương quan hạng chỉ là 0.03 — gần như không thấy bằng mắt thường. Để cảm nhận độ mỏng: nếu $IC$ là correlation, thì phần phương sai của return được dự báo giải thích chỉ là $IC^2 = 0.03^2 = 0.0009$, tức **chín phần vạn**. Nghề này là khai thác mỏ quặng nồng độ chưa tới một phần nghìn, không phải nhặt vàng cục.

**Thứ hai: nhiễu thống trị ở mọi thang thời gian bạn quan tâm.** Sharpe ratio bằng 1 — một con số đáng mơ ước — vẫn nghĩa là mỗi năm còn khoảng 16% xác suất lỗ. Ta tính: với $SR = 1$ (annualized), return kỳ vọng một năm là $1\sigma_{\text{năm}}$, nên xác suất năm âm là $P(Z < -1) = \Phi(-1) \approx 15.9\%$. Nghĩa là cứ sáu năm lại có một năm lỗ, **ngay cả khi chiến lược hoàn toàn đúng và không hề hỏng**. Phân biệt may mắn với kỹ năng đòi hỏi lượng dữ liệu khổng lồ — mà dữ liệu tài chính thì ngắn, không dừng (non-stationary, phân phối trôi theo thời gian), và chỉ có **một** lịch sử duy nhất (không làm lại thí nghiệm được, không có "vũ trụ song song" để lấy thêm mẫu).

**Thứ ba: kẻ thù số một là chính mình — overfitting.** Với đủ tham số và đủ lần thử, bạn *luôn luôn* tìm được một chiến lược đẹp long lanh trên quá khứ rồi chết ngay khi chạy tiền thật. Đây không phải rủi ro phụ; nó là rủi ro chính. Phần lớn kỹ thuật "nâng cao" của P-world (purged cross-validation ở Ch9, deflated Sharpe, combinatorial backtest) thực chất là kỷ luật chống tự lừa dối. Một QR giỏi dành nhiều năng lượng để *chứng minh ý tưởng của mình sai* hơn là để tô vẽ nó đẹp.

### Toán học của "edge nhỏ nhân số lượng lớn" — làm một lần cho thấm

Đây là công thức nền móng của cả nghề, đáng dẫn xuất từng bước. Xét đồng xu thiên vị 51/49 (edge chỉ 2 điểm phần trăm). Mỗi lần tung, ta cược 1 đơn vị: thắng thì được +1, thua thì mất −1.

Bước 1 — kỳ vọng mỗi cược. Payoff $X$ nhận $+1$ với xác suất 0.51 và $-1$ với xác suất 0.49:
$$\mathbb{E}[X] = (+1)(0.51) + (-1)(0.49) = 0.02.$$

Bước 2 — độ lệch chuẩn mỗi cược. Vì $X^2 = 1$ trong mọi trường hợp, ta có $\mathbb{E}[X^2] = (1)(0.51) + (1)(0.49) = 1$, nên
$$\text{Var}(X) = \mathbb{E}[X^2] - (\mathbb{E}[X])^2 = 1 - 0.0004 = 0.9996,$$
$$\sigma_X = \sqrt{0.9996} \approx 0.9998 \approx 1.$$

Bước 3 — "Sharpe mỗi cược". Đây là tỷ số reward-to-risk của một cược đơn:
$$SR_{\text{1 cược}} = \frac{\mathbb{E}[X]}{\sigma_X} = \frac{0.02}{1} = 0.02.$$

Bước 4 — cộng dồn $N$ cược **độc lập**. Đây là chỗ phép màu xảy ra. Tổng $N$ cược có mean cộng tuyến tính, nhưng std chỉ tăng theo $\sqrt N$ (vì variance của tổng các biến độc lập bằng tổng các variance):
$$\mathbb{E}\Big[\sum_{i=1}^N X_i\Big] = N \cdot 0.02, \qquad \sigma\Big(\sum_{i=1}^N X_i\Big) = \sqrt{N}\cdot 1.$$

Sharpe của cả chuỗi là tỷ số của hai đại lượng đó:
$$SR_N = \frac{N \cdot 0.02}{\sqrt{N} \cdot 1} = 0.02\sqrt{N}.$$

Đây là cùng quy tắc $\sqrt{t}$ mà cuốn Q dùng để scale vol theo thời gian — nhưng ở đây ta scale *edge tích lũy* theo số lượng cược. Thay số:

| Số cược/năm | 100 | 2.500 | 10.000 | 250.000 |
|---|---|---|---|---|
| Sharpe | 0.2 | 1.0 | 2.0 | 10.0 |

Đọc bảng này cho kỹ, vì nó là bản đồ của cả nghề. Với 100 cược một năm, edge 2% cho Sharpe 0.2 — gần như vô dụng, bị nhiễu nuốt chửng. Nhưng với 2.500 cược (10 cổ phiếu mỗi ngày trên 250 ngày giao dịch), Sharpe lên 1.0 — một quỹ đáng nể. Với 10.000 cược, Sharpe 2.0 — hàng đầu ngành. Và 250.000 cược một năm (địa hạt của high-frequency market making), edge 2% biến thành Sharpe 10 — con số mà các fund như Medallion hay Jane Street sống bằng. **Cùng một edge tí hon, số lượng biến nó thành cỗ máy in tiền hoặc thành rác, tùy bạn cược được bao nhiêu lần.**

Casino sống bằng đúng công thức này, và một ví dụ số làm cho "phương sai biến mất" trở nên sờ được. Một bàn roulette châu Âu (một số 0, 37 ô) có house edge $1/37 = 2.70\%$ cho nhà cái. Coi mỗi ván nhà cái đặt cửa 1 đơn vị: kỳ vọng lãi $+0.027$/ván, độ lệch chuẩn $\approx 1$/ván (payoff dao động cỡ $\pm 1$). Sau $n$ ván, tổng lãi kỳ vọng là $0.027n$ với std $\sqrt{n}$, nên xác suất nhà cái *lỗ* cuối chuỗi là $\Phi(-0.027\sqrt{n})$:

| Số ván $n$ | 100 | 1.000 | 10.000 | 100.000 |
|---|---|---|---|---|
| Lãi kỳ vọng (đơn vị) | 2.7 | 27 | 270 | 2.700 |
| Std (đơn vị) | 10 | 31.6 | 100 | 316 |
| P(nhà cái lỗ) | 39% | 20% | 0.35% | ~0% |

Chỉ 100 ván thì nhà cái vẫn lỗ 39% số đêm — edge bị nhiễu nuốt. Nhưng một sòng bạc thật quay hàng chục nghìn ván mỗi đêm: ở 10.000 ván, xác suất lỗ đã tụt xuống 0.35%, và ở 100.000 ván thì gần như bằng 0 — nhà cái *chắc chắn* lãi cuối tháng dù mỗi ván vẫn có thể thua. Đây chính là bảng $0.02\sqrt{N}$ ở trên, chỉ đọc theo chiều "xác suất thua cả chuỗi" thay vì "Sharpe". Quant fund là một casino có điều kiện — với hai chỗ gãy mà cả tài liệu này xoay quanh.

**Chỗ gãy 1 — các cược không độc lập.** Trên thị trường thật, mọi cổ phiếu cùng nhảy theo market. Nếu hôm nay S&P giảm 3%, gần như mọi long position của bạn cùng lỗ một lúc — 500 "cược" của bạn thực ra là 1 cược lớn đội lốt 500 cược nhỏ. Correlation này bào mòn $N$ hiệu dụng ($N_{\text{eff}}$) khủng khiếp. Một ví dụ số để thấy mức tàn phá: giả sử bạn có $N = 100$ position, mỗi cái vol bằng nhau, và **correlation trung bình từng cặp** là $\rho = 0.2$. Variance của danh mục bằng-trọng-số là
$$\text{Var}_{\text{port}} \propto \frac{1}{N} + \Big(1 - \frac{1}{N}\Big)\rho = \frac{1}{100} + \frac{99}{100}(0.2) = 0.01 + 0.198 = 0.208.$$
Số cược độc lập tương đương thỏa $1/N_{\text{eff}} = 0.208$, tức
$$N_{\text{eff}} = \frac{1}{0.208} \approx 4.8.$$
Đọc con số này cho sốc: 100 cổ phiếu với correlation cặp chỉ 0.2 hành xử như chưa đầy **5** cược độc lập. Sharpe của bạn không phải $0.02\sqrt{100} = 0.2$ mà chỉ $0.02\sqrt{4.8} \approx 0.044$ — mất hơn ba phần tư sức mạnh chỉ vì một chút correlation chung. Đây là lý do vì sao market-neutral và factor-neutralization (Ch5, Ch6) không phải trang trí — chúng là cách gỡ bỏ cái correlation chung để đẩy $N_{\text{eff}}$ lên gần $N$ danh nghĩa. Trung hòa market khỏi 100 position kia có thể kéo $\rho$ về ~0.05; khi đó
$$N_{\text{eff}} = \frac{1}{\frac{1}{100} + \frac{99}{100}(0.05)} = \frac{1}{0.0595} \approx 16.8,$$
và Sharpe nhảy từ 0.044 lên $0.02\sqrt{16.8} \approx 0.082$ — gần **gấp đôi** ($\sqrt{16.8/4.8} \approx 1.87$ lần) mà không cần tín hiệu tốt hơn chút nào. Toàn bộ giá trị nằm ở việc giết correlation, không phải ở việc dự báo giỏi hơn.

**Chỗ gãy 2 — edge không hằng số.** Đồng xu 51/49 không bao giờ đổi. Nhưng edge trên thị trường **decay** khi người khác tìm ra: khi một anomaly được công bố trong paper học thuật, return trung bình của nó sau ngày công bố tụt khoảng 30–60% (McLean & Pontiff, 2016 — một kết quả kinh điển ta sẽ gặp lại ở Ch7). Alpha là tài nguyên bị khai thác cạn, không phải hằng số vật lý.

Toàn bộ nghề, cô đọng, là bảo vệ hai vế của **Fundamental Law of Active Management** (dẫn xuất đầy đủ ở Ch7):
$$IR \approx IC \times \sqrt{BR},$$
trong đó $IR$ là information ratio (Sharpe của phần alpha), $IC$ là chất lượng dự báo (edge), và $BR$ là **breadth** — số cược *độc lập* mỗi năm. Công thức này chính là $0.02\sqrt{N}$ khoác áo học thuật: $IC$ thay cho 0.02, $\sqrt{BR}$ thay cho $\sqrt{N}$. Ví dụ: momentum 12-1 mà ta dùng xuyên suốt sách (Ch7, Phụ lục A) có rank-$IC$ trung bình ~0.025 và, nếu rebalance hàng tháng trên ~1000 cổ phiếu với các cược không quá tương quan, breadth hiệu dụng cỡ vài trăm/năm. Lấy $BR \approx 400$: $IR \approx 0.025\sqrt{400} = 0.025 \times 20 = 0.5$ — khớp thô với Sharpe thực nghiệm ~0.75 sau khi tính thêm hiệu ứng danh mục. Nâng $IC$ (tín hiệu tốt hơn) hay nâng $BR$ (nhiều cược độc lập hơn) đều tăng $IR$ — và cả cuốn sách này chỉ làm hai việc đó.

## 1.2 Vì sao P khó hơn Q về bản chất

Người mới thường tưởng Q-world khó hơn vì nó đầy stochastic calculus, PDE, martingale — toán nặng và đẹp. Đúng là công cụ Q-world hàn lâm hơn. Nhưng **P-world khó hơn ở tầng sâu hơn**, và đáng bóc tách vì sao, để hiểu vì sao ta phải cẩn thận đến ám ảnh trong các chương sau.

**Q-world có neo; P-world thì không.** Người định giá option có một mỏ neo tuyệt đối: giá của underlying *hôm nay*, quan sát được, không tranh cãi. Từ đó no-arbitrage ràng buộc giá derivative trong một khoảng hẹp. Nếu bạn định giá sai, arbitrageur sẽ trừng phạt bạn ngay và bạn biết mình sai. Người P-world dự báo *tương lai*, thứ chưa xảy ra và không có neo nào cả. Bạn nói cổ phiếu này sẽ outperform 2% trong tháng tới; thị trường có thể mất ba năm để nói cho bạn biết bạn đúng hay sai, và ngay cả khi nó đi đúng hướng, bạn cũng không chắc là do bạn giỏi hay do may.

**Signal-to-noise của Q cao hơn P nhiều bậc.** Trong Q-world, sai số định giá điển hình là fraction của một vol point — nhỏ. Trong P-world, cái ta cố dự báo (return tuần tới) có tỷ lệ signal-to-noise thảm hại. Định lượng: một cổ phiếu điển hình có vol ~2%/ngày, tức ~$2\%\sqrt{5} \approx 4.5\%$/tuần. Alpha dự báo hàng tuần giỏi lắm cỡ 0.3%/tuần. Tỷ số signal/noise mỗi quan sát là $0.3/4.5 \approx 0.067$ — nghĩa là **93% của cái bạn thấy mỗi tuần là nhiễu thuần túy**. Điều này có hệ quả tàn nhẫn cho việc kiểm định. Coi tỷ số 0.067 như "Sharpe mỗi tuần" của tín hiệu; t-statistic sau $n$ tuần là $t = 0.067\sqrt{n}$. Để đạt $t = 2$ (ngưỡng "có ý nghĩa" tối thiểu), cần
$$n = \Big(\frac{2}{0.067}\Big)^2 \approx 900 \text{ tuần} \approx 17 \text{ năm dữ liệu.}$$
Bảy trăm... mười bảy năm chỉ để *chớm* chắc rằng một tín hiệu tuần đơn lẻ không phải nhiễu — và trong 17 năm đó thị trường đã đổi chế độ nhiều lần, tín hiệu có thể đã decay. Đây là lý do sâu xa vì sao breadth (nhiều cổ phiếu cùng lúc) quan trọng hơn lịch sử dài: ta không có 17 năm để chờ, nên phải mượn số lượng cross-section. Q-world hiếm khi phải vật lộn với signal-to-noise thấp đến thế.

**Q-world có thể sai và vẫn hòa vốn; P-world sai là mất tiền.** Một mô hình pricing sai lệch nhẹ vẫn có thể được calibrate lại về giá thị trường và hedge động — sai số bị "nuốt" bởi việc mark-to-market liên tục. Một dự báo P-world sai thì lỗ thật, tiền thật, không cứu vãn được.

**Kẻ thù thích nghi.** Đây là điểm sâu nhất. Định luật vật lý không quan tâm bạn có khám phá ra chúng không — hằng số hấp dẫn không đổi khi bạn công bố. Nhưng "định luật" của P-world là hành vi tập thể của những con người khác, những người cũng đang tối ưu và sẽ **thay đổi hành vi ngay khi bạn khai thác họ**. Ta có thể hình dung thị trường là một trò chơi mà các luật tự viết lại mỗi khi ai đó tìm ra cách thắng. Một QR do đó không bao giờ được nghỉ: một alpha tốt là tài sản đang khấu hao, và không tìm alpha mới nghĩa là chết chậm. Q-world không có tính chất tự-hủy-khi-bị-biết này ở mức độ gần đâu.

**Chỉ có một lịch sử.** Nhà vật lý lặp lại thí nghiệm nghìn lần. Nhà P-world có đúng **một** chuỗi giá S&P từ 1927 đến nay — một mẫu duy nhất từ một quá trình không dừng. Bạn không thể "chạy lại năm 2008" với điều kiện khác. Điều này khiến mọi khẳng định thống kê trong P-world mong manh hơn nhiều so với trực giác từ khoa học tự nhiên, và là gốc rễ của toàn bộ nỗi ám ảnh về overfitting.

Tóm lại: Q-world khó về *kỹ thuật toán*; P-world khó về *nhận thức luận* — làm sao biết được điều gì đúng khi tín hiệu yếu, dữ liệu ít, kẻ thù thích nghi, và bạn dễ tự lừa mình. Đây là lý do một QR giỏi trước hết là một người hoài nghi có kỷ luật.

## 1.3 Buy-side landscape — ai đang chơi

Trước khi học kỹ thuật, phải biết bức tranh: ai trả tiền, cấu trúc tổ chức nào, và vì sao điều đó định hình loại alpha mà mỗi nơi đi tìm. "Buy-side" nghĩa là phía *mua* rủi ro để kiếm return (đối lập "sell-side" — ngân hàng bán sản phẩm và thu phí, địa hạt của cuốn Q). Sáu nhóm chính.

**Multi-strategy / multi-manager ("pod shops").** Đại diện: **Citadel, Millennium, Point72, Balyasny, ExodusPoint, Schonfeld**. Cấu trúc: hàng trăm đội độc lập (mỗi đội gọi là "pod"), mỗi pod là một PM cùng vài analyst/quant, chạy chiến lược riêng với vốn được cấp. Quản trị rủi ro trung tâm cực chặt — drawdown ~5% thường bị cắt vốn, ~10% thường mất việc. Trả lương cao nhất industry, áp lực tương xứng. Phí thu theo mô hình "pass-through": nhà đầu tư trả mọi chi phí vận hành của quỹ cộng phần chia lợi nhuận. Đây là mô hình thắng thế của thập kỷ 2015–2025 — Citadel và Millennium mỗi hãng quản lý hàng chục tỷ USD và trả về cho nhà đầu tư lợi nhuận ổn định đáng kinh ngạc. Ta sẽ mổ xẻ kinh tế học một pod ngay dưới đây vì nó giải thích phần lớn "văn hóa áp lực" của ngành.

**Quant thuần hệ thống.** Đại diện: **Renaissance** (quỹ Medallion huyền thoại — được đồn ~66%/năm trước phí suốt hơn 30 năm, đóng cửa với người ngoài, chỉ trả cho nhân viên), **Two Sigma, DE Shaw, AQR, PDT, WorldQuant, Man AHL/Numeric, Squarepoint, Qube, XTX**. XTX khởi đầu là market maker FX/equities theo mô hình quant thuần, nay là một trong những hãng lớn nhất. Văn hóa đặc trưng: "một mô hình lớn tập thể" (collaborative) — mọi researcher đóng góp vào một hệ thống chung, thay vì cạnh tranh theo pod. RenTec và Two Sigma nổi tiếng kiểu này; nó đổi lấy tính cạnh tranh nội bộ để lấy sự phối hợp.

**Prop trading / market makers.** Đại diện: **Jane Street, Citadel Securities, Optiver, IMC, SIG, Hudson River Trading, Jump, Tower, DRW, Virtu**. Họ trade tiền của chính công ty (proprietary), chủ yếu làm market making và arbitrage tần suất cao. Tuyển thẳng sinh viên giỏi toán/CS/olympiad, không đòi biết tài chính trước — họ dạy lại từ đầu. Jane Street nổi tiếng với ngôn ngữ OCaml và văn hóa poker/mental-math. Đây là nơi công thức $0.02\sqrt{N}$ đạt cực hạn: số cược cực lớn (hàng triệu/năm) bù cho edge cực nhỏ mỗi cược.

**CTA / managed futures.** Đại diện: **AQR, Man AHL, Winton, Aspect, Transtrend**. Chủ yếu trend following trên futures (chỉ số, hàng hóa, lãi suất, FX), lịch sử dài từ thập niên 1980. Sharpe khiêm tốn (~0.5–0.7 dài hạn) nhưng có tính chất quý: thường sinh lời trong khủng hoảng khi cổ phiếu sập ("crisis alpha") — tính divergent này khiến CTA là một cấu phần đa dạng hóa hơn là một cỗ máy Sharpe cao.

**Asset managers định lượng.** Đại diện: **BlackRock** (nền tảng Aladdin + nhóm Systematic), **AQR, Dimensional (DFA** — factor investing gốc academic, ra đời từ nghiên cứu Fama-French), **Robeco**. Họ chơi "smart beta"/factor dài hạn (value, quality, low-vol), phí thấp, quy mô hàng nghìn tỷ USD. Alpha mỏng nhưng capacity khổng lồ — mô hình ngược với prop shop.

**Crypto quant.** Đại diện: market maker chuyên (**Wintermute, GSR, Amber**) và desk crypto của các hãng lớn. Vi cấu trúc kiểu "miền Tây hoang dã" — thị trường non trẻ, thanh khoản phân mảnh qua nhiều sàn, nhiều mispricing lộ liễu hơn. Cơ hội cho người mới nhiều hơn *chính vì* lịch sử ngắn khiến các anomaly chưa bị arbitrage hết — nhưng cũng rủi ro hạ tầng và đối tác cao hơn nhiều.

### Kinh tế học một pod — để hiểu áp lực từ đâu ra

Đây là mô hình tinh thần quan trọng nhất để hiểu vì sao ngành hành xử như nó hành xử. Xét một pod điển hình ở một multi-manager, và tính từng con số ra tiền thật.

PM được cấp **1 tỷ USD "allocation"**. Lưu ý: đây không phải tiền mặt trao tay — nó là **hạn mức rủi ro** (risk budget), quyền được triển khai một lượng vốn với mức rủi ro cho phép. Pod chạy market-neutral với **gross 3x**: 3 tỷ USD long cộng khoảng 3 tỷ USD short (tổng gross exposure 6 tỷ, net exposure gần 0 để trung hòa market).

Mục tiêu return trên allocation cỡ **6%/năm**, tức $0.06 \times 1\text{ tỷ} = 60$ triệu USD P&L một năm. Đội 5 người thường ăn chia khoảng **15% của P&L** $= 0.15 \times 60 = 9$ triệu USD/năm, chia theo thỏa thuận nội bộ với PM lấy phần lớn. Nghe rất đẹp — nhưng đây là chỗ áp lực lộ ra.

Trước hết, quỹ tính vào pod **mọi chi phí**: dữ liệu (một pod nghiêm túc tiêu 1–3 triệu USD/năm cho market data, alt-data, fundamentals), lương cứng nhân viên, hạ tầng tính toán, phí giao dịch. Những khoản này trừ thẳng vào P&L trước khi chia. Một pod tạo 60M gross nhưng ngốn 8M chi phí chỉ còn 52M để tính thưởng — và nếu năm đó chỉ tạo được 20M gross, 8M chi phí cố định nuốt gần một nửa, phần chia teo lại thảm hại. Chi phí cố định biến một năm tầm thường thành một năm tệ.

Quan trọng hơn là **cơ chế cắt vốn không khoan nhượng**. Drawdown −5% (mất 50M trên allocation 1 tỷ) thường khiến allocation bị cắt một nửa; −10% (100M) thường dẫn tới giải tán pod. Bây giờ nối với thống kê để thấy điều này đáng sợ đến mức nào. Giả sử chiến lược có vol ~4%/năm (nhất quán với mục tiêu 6% return, tức Sharpe $6\%/4\% = 1.5$ — đã rất tốt). Với vol năm 4%, một drawdown −5% **hoàn toàn bình thường về mặt thống kê** trong một năm xui: $5\%/4\% = 1.25$ độ lệch chuẩn, một cú trượt hơn một sigma, thứ xảy ra thường xuyên. Và đó mới chỉ là return *cả năm*; drawdown *trong năm* (đỉnh-đáy) luôn sâu hơn return cuối năm nhiều lần, nên chạm −5% intra-year là chuyện gần như chắc chắn xảy ra vài lần trong sự nghiệp. Ngay cả return cả năm cũng đủ đáng lo: với Sharpe 1.5, xác suất *cả năm* âm vẫn là $\Phi(-1.5) \approx 6.7\%$ — cứ 15 năm một lần, ngay cả khi chiến lược đúng hoàn hảo. Cắt vốn vì một cú trượt 1.25-sigma không phải vì PM dở, mà vì đó là bản chất của nhiễu (Ch3, Ch14).

Hệ quả văn hóa sâu sắc: cấu trúc thưởng phạt này ép pod PM về phía các chiến lược **Sharpe cao, drawdown nông, capacity vừa** — stat-arb, relative value, các tín hiệu hoàn vốn nhanh — thay vì các chiến lược Sharpe thấp-nhưng-bền như trend following hay value dài hạn, vốn phải chịu những giai đoạn thua kéo dài nhiều tháng. Không phải vì trend/value là khoa học tồi (chúng có Sharpe dài hạn tôn trọng được), mà vì **một pod không sống nổi qua một drawdown dài đủ để chiến lược bền phục hồi**. Cấu trúc tổ chức định hình khẩu vị rủi ro nhiều hơn cả khoa học. Hiểu điều này trước khi ký hợp đồng — nó giải thích vì sao rất nhiều tài năng bị ép chen chúc vào cùng một khoảng không gian chiến lược "Sharpe cao ngắn hạn", tạo ra crowding và fragility mà ta sẽ gặp lại ở Ch14.

Đối lập, một quỹ thuần collaborative (RenTec-style) hay một asset manager factor không có cơ chế cắt-pod-tàn-nhẫn này, nên có thể ôm những chiến lược drawdown sâu hơn nhưng edge bền hơn. Cùng một khoa học, hai cấu trúc tổ chức, hai loại alpha được ưa chuộng khác hẳn nhau.

## 1.4 Các vai trò trong một quỹ quant

Một chiến lược từ ý tưởng đến P&L đi qua nhiều bàn tay. Biết ai làm gì giúp bạn định vị bản thân và hiểu vì sao cuốn sách này tập trung nơi nó tập trung.

**Quant Researcher (QR)** — nhân vật chính của tài liệu này. QR tìm tín hiệu (alpha), xây mô hình dự báo, thiết kế backtest trung thực, và ước lượng return/rủi ro trước khi triển khai vốn. Nền tảng: thống kê, machine learning, toán, kinh tế lượng. PhD phổ biến nhưng ngày càng không bắt buộc — cái được đánh giá là khả năng nghĩ đúng về dữ liệu ồn và không tự lừa mình. Phần lớn cuốn sách này là chương trình đào tạo một QR.

**Quant Developer / Engineer (QD).** Xây research platform, data pipeline, backtest engine, và hệ thống trading thật (low-latency nếu cần). Ranh giới với QR ngày càng mờ: câu "researcher không code được" gần như không còn tuyển được ở các hãng hàng đầu. Một QR hiện đại phải viết được code sạch, đúng, tái lập được kết quả — nếu không, "phát hiện" của họ không kiểm chứng được.

**Portfolio Manager (PM).** Sở hữu P&L. Quyết định phân bổ vốn giữa các tín hiệu và chiến lược, quản lý tổng rủi ro danh mục, chịu trách nhiệm cuối cùng khi thắng hay thua. Ở pod shop, PM là một entrepreneur nội bộ — vận hành pod của mình gần như một công ty con với ngân sách rủi ro riêng và cơ chế cắt vốn như đã mô tả. Ở quỹ collaborative, vai PM tập trung hơn vào việc kết hợp các signal của cả tập thể.

**Quant Trader (QT).** Vận hành hệ thống trading hàng ngày, giám sát execution, xử lý sự cố intraday (một venue mất kết nối, một fill bất thường, một risk limit bị chạm). Ở prop shop, QT thường kiêm luôn nghiên cứu vi cấu trúc — ranh giới giữa "người nghiên cứu cách đặt lệnh" và "người vận hành lệnh" ở đó rất mỏng.

**Execution / Microstructure Researcher.** Chuyên tối ưu *cách thực hiện* lệnh (Ch12–13). Alpha giỏi mấy cũng chết nếu trading cost nuốt hết, và một ví dụ số cho thấy khoảng cách này lớn cỡ nào. Lấy một chiến lược có gross return kỳ vọng 6%/năm và turnover cao. Nếu market impact ăn 0.3%/năm, ta mất $0.3\%/6\% = 5\%$ của return — khó chịu nhưng sống được. Nhưng turnover cao khiến impact dễ phình: nếu impact leo tới 4%/năm, net return chỉ còn $6\% - 4\% = 2\%$ — mất hai phần ba alpha; và nếu impact chạm 7%/năm, net return là $6\% - 7\% = -1\%$, chiến lược **từ lãi thành lỗ dù tín hiệu không hề sai một chút nào**. Người execution researcher là người giữ cho cái khoảng cách backtest-vs-live đó không nuốt chửng alpha (recipe square-root impact ở Ch12).

**Risk.** Xây risk model, giám sát exposure theo factor, chạy stress test và scenario analysis. Buy-side ít bận tâm vốn quy định (regulatory capital — đó là chuyện của cuốn Q) nhưng giám sát chặt drawdown, leverage, liquidity, và concentration. Ở pod shop, chính đội risk trung tâm là người thực thi cơ chế cắt vốn −5%/−10%.

## 1.5 Vòng đời một chiến lược — khung của toàn bộ tài liệu

Mọi thứ QR làm nằm trong một vòng khép kín. Vẽ nó ra để thấy mỗi chương phục vụ khâu nào:

```
Ý tưởng → Dữ liệu → Tín hiệu (alpha) → Backtest trung thực → Portfolio construction
   ↑                                                                    ↓
   └── Nghiên cứu tiếp ← Giám sát & tái đánh giá ← Live trading ← Execution
```

Đọc vòng lặp này theo chiều kim đồng hồ. Một **ý tưởng** — thường xuất phát từ một giả thuyết kinh tế ("ai trả tiền cho return này, và vì sao chưa bị arbitrage hết?") hơn là từ đào bới dữ liệu mù quáng, vì đào mù quáng dẫn thẳng tới overfitting. Ý tưởng gặp **dữ liệu** (Ch2 — làm sạch, xử lý survivorship bias, point-in-time, corporate actions). Từ dữ liệu ta trích **tín hiệu/alpha** (Ch7 — cross-sectional hay time-series, factor hay statistical arbitrage). Tín hiệu được kiểm bằng **backtest trung thực** (Ch9 — purged cross-validation, embargo, deflated Sharpe để chống tự lừa). Nếu sống sót, nó bước vào **portfolio construction** (Ch11 — biến điểm số dự báo thành trọng số $w$, cân bằng return kỳ vọng $\mu$ với rủi ro $\Sigma$). Rồi **execution** thực hiện lệnh với chi phí tối thiểu (Ch12–13). Chiến lược chạy **live**, được **giám sát và tái đánh giá** liên tục — vì edge decay, một alpha hôm nay lãi có thể sang năm thành rác. Và vòng lặp khép lại: giám sát sinh ra **nghiên cứu tiếp**, ý tưởng mới, alpha mới thay thế cái đã cạn.

Điểm cần nhấn: đây không phải quy trình tuyến tính làm một lần rồi xong. Nó là vòng lặp **không bao giờ dừng**, vì kẻ thù thích nghi và edge tự khấu hao (mục 1.2). Một QR không có ý tưởng mới trong pipeline là một QR đang chết chậm.

Bản đồ chương theo vòng lặp, để bạn biết mình đang ở đâu khi đọc tiếp. **Part I — Nền tảng**: Ch2 (dữ liệu & returns), Ch3 (thống kê & econometrics), Ch4 (regime & structural change), Ch5 (lý thuyết danh mục), Ch6 (factor models) — bộ công cụ và ngôn ngữ chung. **Part II — Alpha**: Ch7 (alpha research), Ch8 (behavioral foundations — vì sao mispricing tồn tại), Ch9 (backtesting), Ch10 (feature engineering & labeling). **Part III — Từ tín hiệu đến P&L**: Ch11 (portfolio construction), Ch12 (microstructure theory), Ch13 (execution), Ch14 (risk management). **Part IV — Chiến lược & ML**: Ch15 (bản đồ chiến lược), Ch16 (trading theo asset class), Ch17 (machine learning), Ch18 (credit & fixed-income relative value), Ch19 (volatility trading buy-side), Ch20 (performance attribution). **Part V — Nghề**: Ch21 (industry), Ch22 (lộ trình). Phụ lục A dựng một ví dụ xuyên suốt từ momentum đơn tín hiệu đến danh mục multi-signal; B là case studies; C là glossary.

Trong codebase `quantc` đi kèm, tầng P-world này sống trong `src/alpha` — signal, portfolio, backtest engine viết thuần TypeScript, tách biệt hoàn toàn với tầng pricing Q. Ta sẽ nhắc tới các module đó đúng lúc chúng minh họa một khái niệm, nhẹ nhàng, không sa đà vào chi tiết cài đặt — vì mục tiêu là hiểu *vì sao*, không phải học API.

Nơi P và Q chạm nhau đáng để đánh dấu từ bây giờ: vol trading (bán variance risk premium), options positioning và dealer gamma, XVA hedging flows từ ngân hàng đổ ra thị trường. Ở những giao lộ đó, hiểu cả hai measure — cái giá thị trường ngầm định (Q) và cái ta tin sẽ thật (P) — là lợi thế lớn. Khi tới đó, ta sẽ trỏ sang cuốn Q-world. Nhưng phần lớn hành trình phía trước là P thuần: dự báo cái không ai biết, từ dữ liệu ít và ồn, mà không tự lừa mình — nghề khó nhất và, khi làm được, đáng giá nhất trong tài chính định lượng.

# Chương 2: Dữ liệu và returns

Mọi chiến lược định lượng, dù tinh vi đến đâu, cuối cùng cũng chỉ là một hàm số của dữ liệu đầu vào. Một alpha xuất sắc chạy trên dữ liệu bẩn sẽ cho ra P&L của một alpha rác; ngược lại, phần lớn "phát hiện thần kỳ" mà người mới hào hứng khoe trong tuần đầu tiên hóa ra là ảo ảnh sinh ra từ một cái bẫy dữ liệu mà cả ngành đã biết từ ba thập kỷ trước. Chương này tồn tại vì lý do phũ phàng đó: trước khi bàn về mô hình, ta phải hiểu rất kỹ nguyên liệu — nó đến từ đâu, nó nói dối ở đâu, và ta biến nó thành đơn vị làm việc của P-world (returns) như thế nào. Đây là chương ít hào nhoáng nhất và quan trọng nhất; một quant researcher buy-side dành nhiều thời gian với schema dữ liệu hơn với phương trình.

## 2.1 Dữ liệu giá — tưởng đơn giản mà đầy bẫy

**Các loại dữ liệu theo tần suất**: daily bars (OHLCV — open/high/low/close/volume) → intraday bars (1min/5min) → tick data (từng giao dịch) → **full order book** (L2/L3 — từng lệnh đặt/hủy; một ngày equity Mỹ cỡ terabyte). Tần suất càng cao, alpha càng "tươi" nhưng hạ tầng càng đắt.

Hãy hình dung cái tháp này một cách cụ thể để thấy khối lượng dữ liệu tăng thế nào khi ta đi xuống. Một cổ phiếu Mỹ trong một ngày cho **một** dòng daily bar. Cùng cổ phiếu đó, nếu lấy bar 1 phút cho phiên 9:30–16:00, cho $6.5 \times 60 = 390$ dòng. Xuống tick data, một large-cap như AAPL dễ dàng có vài trăm nghìn đến vài triệu trade một ngày. Xuống full order book (mọi lệnh đặt, sửa, hủy ở mọi mức giá), số message tăng thêm một đến hai bậc nữa — một tên đơn lẻ có thể sinh hàng chục triệu message/ngày, và toàn bộ thị trường equity Mỹ chạm mức terabyte mỗi ngày. Quy tắc kinh nghiệm: mỗi bậc đi xuống nhân khối lượng dữ liệu lên khoảng 100–1000 lần, và nhân chi phí lưu trữ, xử lý, license lên tương ứng. Đó là lý do một quỹ daily-equity có thể chạy trên một laptop, còn một market-maker HFT phải đặt server co-location cạnh sàn và trả hàng triệu đô cho feed.

Sự khác biệt không chỉ là kích thước — nó là **bản chất của alpha**. Ở tầng daily, thông tin gần như đã được thị trường tiêu hóa; alpha đến từ những sai lệch định giá chậm (value, momentum, quality) mà một con người thông minh cũng nhìn ra, chỉ là khó kỷ luật thực thi. Ở tầng tick/order-book, alpha đến từ cấu trúc vi mô — ai đang gấp gáp, hàng đợi lệnh nghiêng về đâu, một lệnh lớn đang bị "chẻ nhỏ" — thứ decay trong mili-giây và chỉ máy mới bắt được (đây là địa hạt chương 12, Microstructure theory). Chọn tần suất là chọn "ai bạn cạnh tranh với". Ở daily bạn đấu với các quỹ thông minh chậm rãi; ở tick bạn đấu với các engine phản xạ nhanh hơn bạn nghĩ về thời gian. Phần lớn người đọc cuốn này sẽ sống ở tầng daily-to-intraday, nơi biên lợi thế đến từ nghiên cứu tốt hơn chứ không phải hạ tầng nhanh hơn.

**Các bẫy kinh điển phải biết trước khi đụng vào bất kỳ dataset nào:**

1. **Corporate actions**: cổ phiếu split 2:1 → giá rớt 50% mà không ai mất tiền. Phải dùng **adjusted price** (điều chỉnh split + dividend) cho tính return, nhưng **raw price** cho mô phỏng giao dịch (bạn trade ở giá thật). Giữ cả hai chuỗi.
2. **Survivorship bias**: dataset chỉ chứa các công ty *còn sống hôm nay* → backtest tự động né mọi công ty phá sản/delisted → thổi phồng return vài %/năm. Bắt buộc dùng dữ liệu có delisted names + **delisting returns**.
3. **Point-in-time (PIT)**: earnings quý Q1 công bố giữa tháng 5 — dataset "as of Q1" mà dùng từ 1/4 là **look-ahead bias**. Dữ liệu fundamental phải có timestamp *công bố*, không phải timestamp *kỳ báo cáo*. Restatement (số bị sửa lại sau) cũng phải PIT. Đây là lý do dữ liệu sạch (CRSP/Compustat, hoặc vendor thương mại) đắt.
4. **Universe định nghĩa PIT**: "S&P 500 hôm nay" khác "S&P 500 năm 2010"; index membership phải theo thời điểm.
5. Ticker tái sử dụng, đổi tên, đổi sàn → cần **security master** map identifier bền (CUSIP/ISIN/FIGI) — bài toán data engineering nhàm chán mà mọi quỹ phải giải trước khi kiếm được đồng nào (trong `quantc`: thuộc tầng data của `src/alpha`).

**Hai ví dụ điều chỉnh cụ thể** để thấy bẫy vận hành thế nào:

*Split*: cổ phiếu đóng 500 hôm trước, sáng nay split 4:1 mở 125. Chuỗi raw: ..., 498, 500, 125, 126, ... — tính return ngây thơ cho $125/500 - 1 = -75\%$ một ngày, đủ phá hủy mọi tín hiệu momentum/mean-reversion đi qua nó. Chuỗi adjusted: chia toàn bộ **quá khứ** cho 4: ..., 124.5, 125, 125, 126 (trong đó $498/4 = 124.5$, $500/4 = 125$, còn 125 và 126 là giá sau split giữ nguyên). Return thật đọc trên chuỗi adjusted: từ $125$ (chính là $500/4$) sang $125$ (giá mở ex-date) là $125/125 - 1 = 0\%$, rồi $126/125 - 1 = +0.8\%$ — đúng như thực tế không ai mất tiền vì split. Chú ý chiều điều chỉnh: sửa quá khứ, không sửa hiện tại (giá hôm nay phải là giá trade được).

*Dividend*: cổ phiếu 100 trả cổ tức 2, mở cửa ex-date ~98. Return giá = −2% nhưng nhà đầu tư không mất gì → **total return** phải cộng lại cổ tức: factor điều chỉnh $\times(1 - 2/100)$ vào giá quá khứ. Chiến lược test trên chuỗi *chưa* adjust cổ tức sẽ "phát hiện" rằng short cổ phiếu trả cổ tức cao rất lời — một alpha ma kinh điển của người mới.

Cơ chế điều chỉnh đáng được viết thành công thức để làm lại được, vì đây là nơi lỗi âm thầm nhất. Cách chuẩn công nghiệp là dùng **adjustment factor** tích lũy nhân vào toàn bộ giá quá khứ. Với một sự kiện split tỉ lệ $s$ (split 4:1 nghĩa là $s=4$: mỗi cổ cũ thành 4 cổ mới), factor cho ngày đó là $1/s$. Với dividend $D$ trên giá đóng cửa trước ex-date $P_{\text{prev}}$, factor là $\left(1 - D/P_{\text{prev}}\right)$. Ta nhân dồn ngược từ hiện tại về quá khứ. Lấy ví dụ dividend cụ thể: giá đóng 100, trả cổ tức 2, factor $= 1 - 2/100 = 0.98$. Nhân toàn bộ chuỗi quá khứ với 0.98: một giá quá khứ 90 thành $90 \times 0.98 = 88.2$. Bây giờ return từ giá-đã-adjust 98 (ex-date) so với giá-đã-adjust $100 \times 0.98 = 98$ của ngày liền trước ra đúng $98/98 - 1 = 0\%$ — cổ tức được "trả lại" vào chuỗi, đúng như total return đòi hỏi. Điểm tinh tế mà nhiều người sai: adjustment factor **nhân dồn** — nếu một cổ phiếu có 3 lần split và 40 lần trả cổ tức trong 20 năm, giá adjusted của ngày đầu tiên là giá thật nhân tích của cả 43 factor, có thể chỉ còn 1/10 giá gốc. Đó là lý do bạn thấy giá adjusted của các cổ phiếu lâu đời tụt xuống vài đô ở đầu chuỗi dù giá thật lúc đó là hàng chục đô. Điều này hoàn toàn đúng cho việc tính return, nhưng sẽ sai nếu bạn dùng nó làm giá mô phỏng lệnh — nên phải giữ **cả hai** chuỗi song song.

*Survivorship bias bằng số*: đây là bẫy đắt nhất vì nó vô hình — dữ liệu trông sạch, backtest trông đẹp, mà toàn bộ là ảo. Cơ chế: mỗi năm một tỷ lệ nhỏ công ty biến mất (phá sản, bị mua lại giá rẻ, delisted vì rớt chuẩn niêm yết). Trong universe equity Mỹ, tỷ lệ delisting "xấu" (không phải do bị thâu tóm giá cao) rơi vào cỡ vài phần trăm/năm. Nếu dataset của bạn chỉ chứa các tên **còn sống hôm nay**, backtest của bạn đã ngầm bán trước mọi công ty sắp chết — một siêu năng lực tiên tri mà không chiến lược thật nào có. Định lượng: giả sử mỗi năm 3% universe bị delist với return trung bình −60% trong quý cuối trước khi biến mất. Việc "không bao giờ nắm" các tên này thổi phồng return danh mục lên khoảng $0.03 \times 0.60 = 0.018 = 1.8\%/$năm — rơi đúng vào biên độ 1–4%/năm mà các nghiên cứu học thuật ước lượng. Con số 1.8% nghe nhỏ nhưng hãy đặt nó lên nền một chiến lược thật: nếu chiến lược có mean excess return thật 5.4%/năm và vol 18%/năm (Sharpe thật $5.4/18 = 0.3$), thì cộng thêm 1.8% ảo đẩy mean lên 7.2% và Sharpe backtest lên $7.2/18 = 0.4$ — nhưng nếu bias tập trung vào các năm khủng hoảng (khi delisting nhiều nhất) và làm vol backtest trông thấp hơn thực tế, một chiến lược Sharpe thật 0.3 dễ dàng hiện ra thành backtest Sharpe 0.6–0.7 hào nhoáng. Cách chữa duy nhất là dùng dataset chứa **delisted names** kèm **delisting returns** — return thực nhà đầu tư nhận được khi cổ phiếu ngừng giao dịch (thường là một con số âm lớn, đôi khi −100%). CRSP có trường này; nhiều feed rẻ tiền thì không, và đó là lý do đầu tiên bạn nên nghi ngờ một backtest "quá đẹp".

*PIT bằng dòng thời gian*: Q1 kết thúc 31/3; earnings công bố 15/5; số liệu bị restate 20/8. Backtest đứng ở ngày 10/4 được biết gì? — Số Q4 năm trước, **chưa** biết Q1, và mãi mãi không được dùng bản restate cho các quyết định trước 20/8. Dataset PIT chuẩn (ví dụ Compustat Point-in-Time) lưu **cả ba lớp thời gian**: kỳ báo cáo, ngày công bố, ngày mỗi bản sửa — và backtest engine (`src/alpha`) phải join theo ngày công bố, không phải kỳ báo cáo. Đây là một cột `as_of_date` trong schema — quên nó là toàn bộ nghiên cứu fundamental thành rác.

Ba lớp thời gian ấy đáng được đặt tên rõ ràng vì chúng là xương sống của toàn bộ data engineering nghiêm túc, và ta sẽ quay lại chúng ở cuối chương như một pipeline hoàn chỉnh. Lớp một là **event time** (kỳ báo cáo) — "quý này là quý mấy". Lớp hai là **knowledge time** hay `as_of_date` (ngày thông tin thực sự đến tay công chúng) — thứ duy nhất backtest được phép dùng để quyết định. Lớp ba là **valid time** của từng phiên bản số liệu (mỗi lần restate tạo một bản mới với ngày hiệu lực riêng). Một hàng dữ liệu fundamental đúng chuẩn PIT trông như: `(ticker, fiscal_quarter=Q1, report_date=2026-05-15, revision_date=2026-08-20, revenue=...)`. Backtest ở ngày $t$ được phép nhìn mọi hàng có `report_date` $\le t$, và với mỗi kỳ báo cáo phải lấy bản có `revision_date` mới nhất mà vẫn $\le t$ — tức là bản số liệu **như nó tồn tại vào ngày $t$**, không phải bản đẹp nhất mà ta biết hôm nay. Đây chính là ý nghĩa vật lý của "point-in-time": tái dựng lại đúng trạng thái tri thức của quá khứ.

Tại sao restatement lại nguy hiểm đến thế đáng được nhấn mạnh bằng một ví dụ. Giả sử một công ty công bố lợi nhuận quý là 100 triệu vào 15/5, rồi 20/8 restate xuống còn 60 triệu vì phát hiện sai sót kế toán. Nếu dataset của bạn chỉ lưu con số cuối cùng (60 triệu) gắn với kỳ báo cáo Q1, thì backtest của bạn — khi đứng ở tháng 6, tháng 7 — sẽ "biết trước" rằng lợi nhuận thực chỉ là 60 triệu, và né cổ phiếu đó trước khi tin xấu vỡ lở. Đó là look-ahead bias tinh vi nhất, vì nó không đến từ ngày tháng sai mà từ **giá trị** đã bị tương lai làm ô nhiễm. Chỉ một schema lưu đủ ba lớp thời gian mới chống được nó.

*Universe PIT bằng số*: điểm số 4 trong danh sách bẫy đáng một ví dụ. Chỉ số S&P 500 thay khoảng 20–25 thành viên mỗi năm; qua một thập kỷ, danh sách đổi gần một nửa. Nếu bạn backtest chiến lược "long các cổ phiếu trong S&P 500" nhưng dùng danh sách thành viên **hôm nay** áp cho năm 2010, bạn đã ngầm chọn những công ty đủ thành công để trụ lại chỉ số suốt một thập kỷ — một dạng survivorship bias khác, lần này ở tầng universe. Mỗi ngày backtest phải hỏi "cổ phiếu này có trong index **tại ngày đó** không?" bằng một bảng membership có `start_date`/`end_date`, không phải một danh sách tĩnh.

**Alternative data** — ngành công nghiệp riêng từ ~2015: thẻ tín dụng (doanh thu bán lẻ trước earnings), ảnh vệ tinh (đếm xe bãi đỗ Walmart), web scraping (giá, job postings), app usage, container shipping, NLP tin tức/filings/earnings calls. Đắt, bẩn, ngắn lịch sử, và alpha decay nhanh khi nhiều quỹ cùng mua — nhưng là chỗ differentiation chính của quỹ lớn hiện nay.

Đáng phân loại alt-data thành một taxonomy vì cách bạn xử lý mỗi loại rất khác, và mỗi loại có một cấu trúc "ai trả tiền cho alpha này" riêng.

| Loại alt-data | Ví dụ nguồn | Alpha nó bắt | Độ trễ vs earnings |
|---|---|---|---|
| Transaction data | Panel thẻ tín dụng/debit, receipt email | Doanh thu bán lẻ, thị phần thương hiệu | Nowcast, sớm vài tuần |
| Geospatial | Ảnh vệ tinh bãi đỗ, đèn ban đêm, luồng tàu | Hoạt động sản xuất/bán lẻ vật lý | Sớm vài tuần đến vài tháng |
| Web/app exhaust | Web scraping giá, job postings, app downloads, MAU | Nhu cầu sản phẩm, sức khỏe tuyển dụng | Real-time đến vài tuần |
| Text/NLP | 10-K/10-Q filings, earnings call transcript, tin tức | Sentiment, thay đổi ngôn ngữ rủi ro, guidance | Đồng thời hoặc sớm hơn tin đại chúng |

Cái đắt của alt-data không nằm ở giá license (dù đó cũng lớn) mà ở **công đoạn biến raw thành signal có PIT**. Một panel thẻ tín dụng thô là hàng chục triệu giao dịch ẩn danh; để nó thành "doanh thu YoY của Chipotle quý này" cần map merchant, chuẩn hóa panel bias (nhân khẩu học người trong panel không đại diện dân số), khử mùa vụ, và — quan trọng nhất — gắn `as_of_date` đúng là ngày dữ liệu **thực sự có sẵn** chứ không phải ngày giao dịch xảy ra (feed thường trễ vài ngày đến vài tuần). Bỏ qua độ trễ này là look-ahead bias, y hệt bẫy earnings.

Về mặt "ai trả tiền cho alpha", đáng một ví dụ số để thấy nowcast tạo edge như thế nào. Giả sử panel thẻ tín dụng phủ được 2% doanh số bán lẻ Mỹ của một chuỗi nhà hàng, và consensus của analyst dự same-store-sales quý này tăng +3% YoY. Panel của bạn — sau khi debias và khử mùa vụ — đo được +6% YoY, và feed cho bạn con số này vào cuối tháng 6, trước ngày công bố earnings 15/7 những hai tuần. Bạn "biết trước" rằng công ty nhiều khả năng beat consensus. Nếu một earnings beat cỡ đó lịch sử đẩy giá lên trung bình +4% trong hai ngày quanh công bố, và tín hiệu panel dự đúng hướng, nói, 60% số lần (so với 50% của tung đồng xu), thì mỗi cược cho edge kỳ vọng cỡ $(0.60 - 0.40) \times 4\% = 0.20 \times 4\% = 0.8\%$ — nhỏ, nhưng lặp qua hàng trăm cái tên và nhiều quý là một dòng alpha thật (đây chính là logic "edge nhỏ × breadth" mà cả cuốn sách nối lại: một con xúc xắc lệch nhẹ, cược thật nhiều lần). Cạnh tranh ở đây là cuộc đua ai chuyển raw thành signal sạch nhanh nhất; và vì alpha decay khi nhiều quỹ cùng mua một feed — cái edge 0.8% teo dần khi phía bên kia của cược cũng cầm chính con số đó — giá trị nằm ở nguồn **độc quyền** hoặc ở kỹ thuật xử lý mà người khác không có. Đây là lý do các pod shop lớn có đội data sourcing riêng đi săn nguồn trước khi nó lên sàn data marketplace.

## 2.2 Returns — đơn vị tiền tệ của P-world

P-world làm việc trên **returns**, không phải giá — vì returns mới (gần) dừng và so sánh được giữa tài sản.

Trực giác đằng sau khẳng định này đáng được nói rõ, vì nó là lý do toàn bộ ngành làm việc trên returns. Giá là một chuỗi **non-stationary**: giá Apple 5 đô năm 2000 và 200 đô năm 2025 không thể so sánh trực tiếp, và mọi thống kê (trung bình, phương sai) tính trên chuỗi giá đều vô nghĩa vì chúng trôi theo mức giá. Return thì khác: "+2% hôm nay" mang cùng ý nghĩa dù giá là 5 hay 500, và "+2% của Apple" so sánh được trực tiếp với "+2% của một cổ phiếu 30 đô". Return chuẩn hóa cả về mức giá lẫn về tài sản, biến một mớ chuỗi giá không đồng nhất thành các đại lượng cùng đơn vị mà ta có thể gộp, trung bình, và mô hình hóa. Đó là nghĩa của "đơn vị tiền tệ của P-world".

- **Simple return**: $r_t = \frac{P_t}{P_{t-1}} - 1$. Cộng được **giữa các tài sản** trong danh mục (return danh mục = trung bình trọng số simple returns) — dùng cho portfolio math.
- **Log return**: $\tilde r_t = \ln(P_t/P_{t-1})$. Cộng được **theo thời gian** ($\tilde r_{0 \to T} = \sum \tilde r_t$) — dùng cho phân tích chuỗi thời gian, mô hình hóa. Với return nhỏ hai loại gần bằng nhau ($\tilde r \approx r - r^2/2$); với return lớn thì khác đáng kể (−50% simple = −69% log).
- **Excess return**: $r_t - r_{f,t}$ (trừ lãi phi rủi ro) — mọi thước đo hiệu suất chuẩn (Sharpe, alpha) tính trên excess.
- **Annualization**: mean × 252, volatility × $\sqrt{252}$ (lại quy tắc $\sqrt{t}$ — cùng quy tắc chương 3 cuốn Q). Sharpe daily → yearly: × $\sqrt{252}$.

Điểm dễ nhầm nhất của người mới là *khi nào dùng loại nào*, nên đáng dẫn xuất tại sao mỗi loại "cộng được" theo một chiều khác nhau — đây là bất đối xứng đẹp và hữu ích nhất của toàn chương. Xét **theo thời gian**: giá trị sau hai ngày là $P_2 = P_0 \times (1+r_1)(1+r_2)$ — simple return **nhân** nhau, không cộng. Nhưng lấy log: $\ln(P_2/P_0) = \ln(1+r_1) + \ln(1+r_2) = \tilde r_1 + \tilde r_2$ — log return **cộng** nhau qua thời gian. Đó là lý do mọi phân tích chuỗi thời gian (tính tổng return kỳ hạn, model AR/GARCH, chuẩn hóa vol) sống trên log return: phép cộng đơn giản hơn phép nhân vô hạn lần. Bây giờ xét **giữa các tài sản** tại một thời điểm: danh mục với trọng số $w_i$ có return $r_p = \sum_i w_i r_i$ — nhưng đẳng thức này chỉ đúng với **simple** return, vì giá trị danh mục là tổng tuyến tính giá trị các thành phần. Log return **không** cộng được ngang tài sản: $\ln(\sum_i w_i P_i)$ không bằng $\sum_i w_i \ln P_i$. Vậy nên portfolio math (trọng số, tối ưu hóa danh mục, covariance) sống trên simple return. Nhớ hai câu này là đủ: **log cộng theo thời gian, simple cộng theo tài sản**. Trộn hai loại là bug backtest phổ biến thứ hai sau look-ahead — bạn sẽ tính đúng theo hướng này, sai theo hướng kia, và sai số tích lũy im lặng.

Xấp xỉ $\tilde r \approx r - r^2/2$ cũng đáng dẫn xuất một dòng vì nó cho ta cảm giác về "khi nào được phép lười". Khai triển Taylor $\ln(1+r) = r - r^2/2 + r^3/3 - \dots$ Với $r$ nhỏ, số hạng bậc hai là hiệu chỉnh chính. Ví dụ số: $r = 1\%$ → $\tilde r = \ln(1.01) = 0.00995$, sai lệch so với $r = 0.01$ chỉ 0.005 điểm phần trăm (và $r - r^2/2 = 0.01 - 0.00005 = 0.00995$ khớp đến chữ số thứ năm) — hoàn toàn bỏ qua được ở tần suất daily nơi return điển hình dưới 2%. Nhưng $r = -50\%$ → $\tilde r = \ln(0.5) = -0.693 = -69.3\%$, lệch tận 19 điểm phần trăm — không thể lười. Ranh giới thực dụng: dưới ~5% mỗi kỳ thì hai loại gần như thay thế được cho nhau; trên ngưỡng đó (return dài hạn, tài sản biến động mạnh, hay tính drawdown lớn) phải cẩn thận dùng đúng loại.

**Các quy đổi bằng số dùng hằng ngày** (làm nhanh không cần máy tính là kỹ năng phỏng vấn):

- Daily vol 1% → annual $1\% \times \sqrt{252} = 1\% \times 15.87 \approx 15.9\%$. Ngược lại, một cách nhẩm nhanh: chia annual vol cho ~16 ra daily vol, nên "vol 32%" nghĩa là ngày điển hình $32\%/16 = \pm 2\%$.
- Daily mean 0.05% và daily vol 1%. Annualize: mean năm $= 0.05\% \times 252 = 12.6\%$, vol năm $= 1\% \times 15.87 = 15.9\%$, nên Sharpe năm $= 12.6\%/15.9\% \approx 0.79$. Có một lối tắt hay nhầm: Sharpe **daily** $= 0.05\%/1\% = 0.05$ (đơn vị mean và vol triệt tiêu nhau), và Sharpe năm $= 0.05 \times \sqrt{252} = 0.79$ — Sharpe scale theo $\sqrt{252}$, **không** theo 252. Đây là sai lầm nhân-số kinh điển: nhân Sharpe daily với 252 sẽ ra một con số vô lý cỡ 12.6.
- Log vs simple ở biên độ lớn: chuỗi +50% rồi −50% simple → về $100 \times 1.5 \times 0.5 = 75$ (lỗ 25%), trong khi tổng log return $= \ln 1.5 + \ln 0.5 = 0.405 - 0.693 = -0.288$ → $e^{-0.288} = 0.75$ ✓ — log return "tự động" nói thật về compound (−0.288 tương ứng lỗ 25%), còn simple return đánh lừa ("trung bình cộng của +50% và −50% là 0%", nghe như hòa vốn nhưng thực tế lỗ 25%).
- Danh mục: return danh mục ngày $= \sum w_i r_i$ với **simple** returns; muốn dùng log phải chuyển đổi qua giá rồi mới cộng ngang — trộn hai loại là bug backtest phổ biến thứ hai sau look-ahead.

Quy tắc $\sqrt{t}$ trong annualization không phải quy ước tùy tiện mà là hệ quả trực tiếp của việc return xấp xỉ độc lập qua thời gian, và đáng dẫn xuất vì nó tái xuất khắp cả sách. Nếu return các ngày độc lập với cùng phương sai $\sigma_d^2$, thì phương sai của tổng $T$ ngày là $\text{Var}\left(\sum_{t=1}^T \tilde r_t\right) = \sum_{t=1}^T \sigma_d^2 = T\sigma_d^2$ (phương sai của tổng các biến độc lập là tổng phương sai). Lấy căn: độ lệch chuẩn kỳ $T$ là $\sigma_d\sqrt{T}$. Còn **trung bình** thì cộng tuyến tính: kỳ vọng tổng là $T\mu_d$. Đó là toàn bộ bí mật: mean scale theo $T$, vol scale theo $\sqrt{T}$, nên Sharpe (tỉ số mean/vol) scale theo $T/\sqrt{T} = \sqrt{T}$. Với $T = 252$ ngày giao dịch/năm, hệ số vol là $\sqrt{252} = 15.87$. Cùng công thức này xuất hiện ở cuốn Q-world (chương 3) khi scale vol option — hai thế giới dùng chung một quy tắc. Lưu ý điều kiện: nếu return **có** autocorrelation (trend thì dương, mean-revert thì âm), quy tắc $\sqrt{t}$ đánh giá sai vol thật — một tài sản trending có vol dài hạn cao hơn $\sigma_d\sqrt{T}$, một tài sản mean-reverting thì thấp hơn. Ở tần suất daily equity autocorrelation gần 0 nên $\sqrt{t}$ dùng tốt; nhưng nhớ điều kiện, vì nó nhắc ta rằng annualization là một *giả định*, không phải một hằng đẳng thức.

Một ví dụ excess return bằng số để cột toàn bộ lại. Giả sử một chiến lược có return gộp năm là 12%, và lãi phi rủi ro (T-bill) năm đó là 5%. Excess return là $12\% - 5\% = 7\%$. Nếu vol năm là 15.9% (đúng bằng vol 1%/ngày ở trên), Sharpe là $7\%/15.9\% = 0.44$. Chú ý: nếu ai đó quên trừ risk-free và báo Sharpe $= 12\%/15.9\% = 0.75$, con số đẹp hơn hẳn nhưng **sai**, và sai nhiều nhất đúng vào những năm lãi suất cao — một cái bẫy so sánh chiến lược qua các thời kỳ lãi suất khác nhau (một chiến lược Sharpe 0.44 của năm lãi suất 5% có thể trông "kém" hơn một chiến lược Sharpe 0.60 của năm lãi suất 0%, dù kỹ năng thực có thể ngang nhau — vì con số 0.60 kia được thổi lên bởi nền lãi suất thấp chứ không phải bởi alpha). Mọi thước đo hiệu suất chuẩn (Sharpe, alpha, information ratio) đều tính trên excess return chính vì lý do này: ta muốn đo kỹ năng, không phải phần thưởng cho việc chỉ đơn giản để tiền trong tài sản phi rủi ro.

## 2.3 Stylized facts — returns thật trông như thế nào

Trước khi model, phải biết đối tượng. Các sự thật thực nghiệm lặp lại trên mọi thị trường, mọi thời đại (Cont 2001):

1. **Đuôi dày (fat tails)**: kurtosis daily returns ~5–30 (Gaussian = 3). Sập −20%/ngày (1987) là "không thể" dưới Gaussian ($\sim 20\sigma$) nhưng xảy ra thật. Hệ quả: mọi risk model Gaussian đánh giá thấp thảm họa; dùng Student-t hoặc EVT cho đuôi.
2. **Volatility clustering**: return hôm nay lớn (bất kể dấu) → mai thường lớn. Vol dự báo được khá tốt (khác với *hướng* — gần như không dự báo được). Đây là chỗ GARCH sống (chương 3) và là lý do vol targeting hoạt động (chương 10).
3. **Gần như không autocorrelation trong returns** (thị trường gần hiệu quả) — nhưng **autocorrelation mạnh trong |returns| và returns²** (chính là vol clustering).
4. **Leverage effect**: return âm → vol tăng mạnh hơn return dương cùng cỡ (gặp lại skew của cuốn Q — hai thế giới nhìn cùng một hiện tượng).
5. **Aggregational Gaussianity**: return tháng/quý gần Gaussian hơn return ngày (CLT gom dần) — chiến lược tần suất thấp được "tha" nhiều vấn đề đuôi.
6. **Non-stationarity**: mọi tham số trôi theo thời gian — regime thay đổi (2008, 2020, chu kỳ lãi suất). Mô hình fit 20 năm mượt mà có thể vô dụng cho năm tới; mọi pipeline nghiêm túc dùng rolling window / regime awareness.

Mỗi stylized fact đáng một con số để nó thôi là khẩu hiệu và thành ràng buộc thiết kế. Về **fat tails**, hãy làm phép tính khiến cú sập 1987 sống dậy. Ngày 19/10/1987, S&P 500 rớt khoảng −20.5% trong một phiên. Vol daily điển hình thời đó cỡ 1%. Dưới giả định Gaussian, đây là biến cố $20.5/1 = 20.5$ sigma. Xác suất một biến cố 20-sigma dưới phân phối chuẩn là cỡ $10^{-89}$ (chính xác hơn, xác suất vượt 20.5 sigma là khoảng $1.1 \times 10^{-93}$) — nhỏ đến mức nếu vũ trụ chạy lại từ Big Bang mỗi giây, ta vẫn không kỳ vọng thấy nó dù chỉ một lần. Vậy mà nó xảy ra thật. Kết luận không phải "ta xui" mà "mô hình Gaussian sai về bản chất ở đuôi". Kurtosis đo chính điều này: với Gaussian kurtosis đúng bằng 3; với daily equity return, con số thực nghiệm rơi vào 5–30 tùy thị trường và thời kỳ, nghĩa là khối lượng xác suất ở đuôi lớn hơn Gaussian nhiều lần.

Hệ quả vận hành đáng một con số cụ thể để thấy nó không phải chuyện học thuật. Value-at-Risk 99% một ngày dưới giả định Gaussian là $2.33\sigma$ (phân vị 1% của phân phối chuẩn); với vol 1%/ngày, đó là VaR $= 2.33\%$ — nghĩa là mô hình Gaussian dự báo bạn chỉ lỗ quá 2.33% trong đúng 1% số ngày, tức khoảng $0.01 \times 252 \approx 2.5$ ngày/năm. Nhưng với đuôi dày thật (kurtosis ~12), số ngày lỗ vượt ngưỡng đó thực tế cao hơn hẳn — thường gấp hai đến ba lần dự báo Gaussian, cỡ 5–7 ngày/năm thay vì 2.5. Nói cách khác, cái "biến cố 1%" của bạn xảy ra thường xuyên như biến cố 2–3%, và những ngày tệ nhất tệ hơn nhiều so với mức $2.33\sigma$ mà Gaussian cho phép. Đó là lý do risk desk dùng Student-t (đuôi dày điều chỉnh được qua bậc tự do) hoặc Extreme Value Theory cho phần đuôi thay vì tin vào Gaussian VaR.

Về **volatility clustering** và mối liên hệ với điểm 3, một cặp con số làm rõ nghịch lý "thị trường vừa ngẫu nhiên vừa dự báo được". Autocorrelation bậc 1 của *return* daily equity gần 0 — điển hình trong khoảng $\pm 0.05$, thống kê gần như không phân biệt được với nhiễu. Đây là "market gần efficient": bạn không đoán được *hướng* ngày mai từ hướng hôm nay. Nhưng autocorrelation bậc 1 của *bình phương return* (hay trị tuyệt đối) lại lớn và dương rõ rệt — thường 0.2–0.4 ở bậc 1 và tắt chậm qua hàng chục ngày. Nghĩa là: *độ lớn* của biến động có trí nhớ dài, dù *dấu* thì không. Một ngày biến động 3% thường theo sau bởi những ngày biến động lớn; một ngày yên ả thường theo sau bởi yên ả. Đây là món quà lớn nhất mà thị trường tặng quant: hướng gần như bất khả đoán, nhưng **vol thì đoán được khá tốt** — và toàn bộ ngành risk (GARCH ở chương 3, vol targeting ở chương 10, position sizing ở chương 14) được xây trên chính sự bất đối xứng này.

Về **leverage effect**, đây là cầu nối đẹp sang cuốn Q-world nên đáng một câu định lượng. Correlation giữa return hôm nay và thay đổi vol ngày mai là âm và không nhỏ — điển hình cỡ $-0.3$ đến $-0.7$ với chỉ số equity. Một cú $-3\%$ đẩy vol lên mạnh hơn một cú $+3\%$ hạ vol; nỗi sợ bất đối xứng với lòng tham. Đây chính là hiện tượng mà thị trường option gọi là **volatility skew** — implied vol của put out-of-the-money cao hơn call cùng độ lệch (xem cuốn Q-world). Hai thế giới nhìn cùng một sự thật: P-world thấy nó trong chuỗi return lịch sử, Q-world thấy nó trong mặt cắt implied vol; cùng một sự bất đối xứng của tâm lý đám đông trước rủi ro giảm giá.

Về **aggregational Gaussianity**, con số minh họa là kurtosis tự giảm khi ta gộp thời gian. Cơ chế là Central Limit Theorem: tổng của $n$ biến (gần) độc lập có excess kurtosis giảm cỡ $1/n$ so với từng biến. Với return **thật sự** iid, một chuỗi daily excess kurtosis 9 (tức kurtosis 12) khi gộp 5 ngày thành return tuần sẽ có excess kurtosis $\approx 9/5 = 1.8$ (kurtosis ~4.8), và gộp 21 ngày thành return tháng còn $\approx 9/21 = 0.4$ (kurtosis ~3.4) — tiến nhanh về Gaussian 3. Trên thực tế return **không** iid (vol clustering làm các ngày phụ thuộc nhau), nên hội tụ chậm hơn công thức $1/n$: daily kurtosis 12 có thể chỉ về ~7 ở tuần và ~4–5 ở tháng, chậm hơn nhưng cùng chiều — đuôi vẫn mỏng dần khi gộp. Hệ quả thực tế đáng giá: chiến lược tần suất **thấp** (rebalance hàng tháng, giữ vị thế lâu) được "tha" nhiều vấn đề đuôi hơn chiến lược tần suất cao, vì đối tượng của nó là return đã gộp gần Gaussian. Đây là một lý do sâu xa vì sao nhiều chiến lược factor cổ điển hoạt động tốt ở tần suất thấp mà "vỡ" khi ép xuống intraday.

Về **non-stationarity**, đây là stylized fact khiêm tốn nhất mà tàn khốc nhất, nên đáng một ví dụ cụ thể. Một mô hình fit trên dữ liệu 2003–2007 (thị trường bò yên ả, vol thấp, correlation cổ phiếu vừa phải) bước vào 2008 gặp một thế giới hoàn toàn khác: vol nhân ba (từ cỡ 1%/ngày lên 3%/ngày, tức từ ~16%/năm lên gần 50%/năm), correlation trung bình giữa các cổ phiếu vọt từ cỡ 0.2–0.3 lên gần 0.6–0.8 (mọi thứ rơi cùng nhau, diversification biến mất đúng lúc cần nhất), và các quan hệ factor đảo chiều. Tham số không phải hằng số — chúng trôi theo regime, và các cú chuyển regime (2008, cú sốc COVID tháng 3/2020, các chu kỳ lãi suất) là nơi backtest mượt mà đi chết. Đây là lý do mọi pipeline nghiêm túc không fit một lần trên toàn lịch sử rồi tin mãi, mà dùng **rolling window** (chỉ dùng dữ liệu gần đây, để tham số thích nghi) hoặc **regime awareness** (nhận diện ta đang ở chế độ nào — chủ đề của chương 4, Regime & structural change). Non-stationarity cũng là lý do sâu xa vì sao "Sharpe backtest 2.0 trên 20 năm" nên khiến bạn nghi ngờ nhiều hơn là hào hứng: 20 năm mượt mà thường có nghĩa mô hình đã fit trùng lên các regime đã biết, chứ không phải nắm được quy luật bền.

## 2.4 Sampling: đồng hồ thời gian không phải đồng hồ duy nhất

Bar theo thời gian (daily, 5-min) là quy ước thừa kế từ báo giấy, không phải lựa chọn thống kê tốt: thị trường "sống" không đều — 30 phút đầu phiên chứa nhiều thông tin bằng vài giờ giữa trưa. Lấy mẫu theo đồng hồ khiến bar giữa trưa thừa (toàn noise) và bar quanh sự kiện thiếu (một bar nuốt cả cú nổ). Các lựa chọn thay thế (AFML phổ biến hóa):

- **Tick bars**: đóng bar mỗi $n$ giao dịch.
- **Volume bars**: mỗi $n$ đơn vị khối lượng — "đồng hồ" chạy theo hoạt động.
- **Dollar bars**: mỗi $n$ USD giá trị — ổn định qua thời kỳ giá thay đổi lớn, thường là mặc định tốt nhất.
- **Imbalance bars**: đóng bar khi mất cân bằng mua/bán tích lũy vượt ngưỡng — đồng bộ với dòng thông tin.

Lý do thống kê: returns lấy theo volume/dollar clock gần IID-Gaussian hơn hẳn theo time clock (vol clustering phần lớn là hiện tượng của *đồng hồ sai*) — mô hình phía sau (chương 3, 12) làm việc trên nguyên liệu "thuần" hơn. Với dữ liệu daily bài toán này ít gay gắt; xuống intraday nó trở thành quyết định thiết kế đầu tiên của data layer.

Một ví dụ số làm rõ vì sao dollar bar "ổn định" hơn volume bar, và vì sao đó thường là mặc định tốt nhất. Giả sử ta muốn mỗi bar chứa cùng "lượng hoạt động kinh tế". Với volume bar, ta cố định số cổ phiếu — nói, 1 triệu cổ mỗi bar. Nhưng nếu giá cổ phiếu tăng gấp đôi từ 50 lên 100 qua vài năm (hoặc sau một split ngược), thì 1 triệu cổ ngày xưa là $1\text{ triệu} \times 50 = 50$ triệu đô giá trị, còn 1 triệu cổ bây giờ là $1\text{ triệu} \times 100 = 100$ triệu đô — cùng "một bar" nhưng lượng tiền chảy qua khác gấp đôi, nên số bar/ngày và tính chất thống kê của chúng trôi theo thời gian. Dollar bar cố định **giá trị** — nói, 50 triệu đô mỗi bar — nên tự động điều chỉnh khi giá thay đổi: ở giá 50 cần 1 triệu cổ để đầy một bar, ở giá 100 chỉ cần 500 nghìn cổ. Kết quả là số bar/ngày và phân phối return trên mỗi bar ổn định qua các thời kỳ giá rất khác nhau, đúng thứ ta muốn để thống kê không bị nhiễu bởi mức giá.

Còn về khẳng định "return theo volume/dollar clock gần IID-Gaussian hơn", cơ chế đáng nói vì nó tinh tế và đẹp. Phần lớn vol clustering — cái autocorrelation mạnh trong return² ở mục 2.3 — thực ra là hệ quả của việc **hoạt động giao dịch** không đều theo đồng hồ. Những giờ và ngày sôi động (nhiều trade, nhiều volume) trùng đúng với những giờ và ngày biến động mạnh; đồng hồ thời gian gộp các giai đoạn hoạt động rất khác nhau vào các bar bằng nhau, tạo ra ảo giác rằng vol "cụm lại". Khi ta chuyển sang đồng hồ chạy theo hoạt động (volume/dollar bar), mỗi bar chứa gần cùng lượng thông tin, nên biến động trên mỗi bar đồng đều hơn nhiều — phần lớn vol clustering biến mất, và return trên mỗi bar tiến gần phân phối IID-Gaussian. Đây không phải mẹo làm đẹp số liệu mà là một cách chọn đúng "đơn vị thời gian" mà thị trường thực sự vận hành theo: thị trường đo thời gian bằng lượng giao dịch, không bằng số giây. Mô hình phía sau (ước lượng vol ở chương 3, microstructure ở chương 12) làm việc trên nguyên liệu thuần hơn, ít phải "dọn dẹp" vol clustering giả tạo. Với dữ liệu daily hiệu ứng này nhẹ và ta hầu như dùng time bar cho tiện; nhưng khi đội nghiên cứu xuống intraday, chọn đồng hồ là **quyết định thiết kế đầu tiên** của data layer, trước cả khi bàn đến signal.

## 2.5 Data engineering pipeline: dựng lại quá khứ đúng như nó từng xảy ra

Mọi cạm bẫy ở các mục trên — corporate actions, survivorship, PIT, universe, alt-data — thực ra là một bài toán duy nhất nhìn từ nhiều phía: **làm sao tái dựng đúng trạng thái tri thức của quá khứ tại mỗi thời điểm, không rò rỉ một chút thông tin nào từ tương lai**. Mục này gộp chúng thành một pipeline cụ thể, vì đây là thứ phân biệt một quỹ kiếm được tiền với một sinh viên có backtest đẹp mà tài khoản thật thì chảy máu. Không có phương trình mới ở đây, chỉ có kỷ luật kỹ thuật — nhưng chính kỷ luật này là nơi phần lớn "alpha" của người mới bốc hơi khi ra live.

**Bước 1 — Security master và identifier bền.** Trước khi làm gì, ta cần một cách gọi tên tài sản không đổi khi ticker đổi. Ticker được tái sử dụng (một ticker chết có thể được gán cho công ty khác vài năm sau), đổi khi công ty đổi tên, khác nhau giữa các sàn. Giải pháp là một bảng `security_master` map ticker-tại-mỗi-thời-điểm sang một identifier bền như CUSIP, ISIN, hoặc FIGI, kèm `start_date`/`end_date` cho mỗi ánh xạ. Ví dụ cụ thể của cạm bẫy: ticker "FB" là Facebook đến 2022 rồi thành "META"; một pipeline join theo ticker thô sẽ đứt chuỗi lịch sử ở đúng ngày đổi tên, hoặc tệ hơn, nối nhầm nếu "FB" sau này được cấp cho công ty khác. Security master giải quyết việc này một lần cho tất cả downstream. Đây là công đoạn nhàm chán nhất mà mọi quỹ phải làm xong trước khi kiếm được đồng nào; trong `quantc` nó thuộc tầng data của `src/alpha`.

**Bước 2 — Chuẩn hóa giá thành hai chuỗi song song.** Từ raw price và bảng corporate actions, dựng đồng thời (a) chuỗi **adjusted** cho tính return (nhân dồn adjustment factor như đã dẫn xuất ở 2.1) và (b) chuỗi **raw/unadjusted** cho mô phỏng lệnh ở giá thật. Giữ cả hai; dùng nhầm chuỗi là lỗi âm thầm — adjusted price cho tính return đúng nhưng cho mô phỏng lệnh sai (bạn không trade được ở giá 2 đô đã adjust của một cổ phiếu thực chất 40 đô).

**Bước 3 — Universe point-in-time.** Với mỗi ngày backtest, universe (danh sách tài sản được phép trade) phải là universe **tại ngày đó**: index membership theo `start_date`/`end_date`, cộng bộ lọc thanh khoản/giá tính bằng dữ liệu **có sẵn tính đến ngày đó**. Điểm mấu chốt: bộ lọc "chỉ trade cổ phiếu có giá > 5 đô và ADV > 1 triệu đô" cũng phải PIT — dùng ADV của tương lai để lọc là look-ahead. Và universe phải **chứa cả tên đã chết** với đúng ngày chúng biến mất, để survivorship bias không lẻn vào.

**Bước 4 — Join fundamental và alt-data theo `as_of_date`.** Đây là trái tim PIT. Mọi bảng dữ liệu ngoài giá (fundamental, ước lượng phân tích, panel alt-data) phải có cột `as_of_date` = ngày thông tin **thực sự có sẵn**, và backtest chỉ được join hàng có `as_of_date` $\le t$. Với dữ liệu bị restate, giữ đủ ba lớp thời gian (event time, knowledge time, valid time như mục 2.1) và với mỗi kỳ báo cáo lấy bản mới nhất mà `revision_date` vẫn $\le t$. Với alt-data, `as_of_date` phải tính cả độ trễ feed (dữ liệu giao dịch tuần này thường chỉ có sẵn sau vài ngày đến vài tuần), nếu không ta lại rơi vào look-ahead qua cửa sau.

**Bước 5 — Point-in-time test cho chính pipeline.** Cách kiểm tra dứt khoát rằng pipeline không rò rỉ tương lai: chạy backtest tính đến một ngày $t_0$ trong quá khứ, lưu lại mọi signal nó sinh ra; rồi chạy lại pipeline như thể hôm nay là $t_0$ (chỉ dùng dữ liệu có `as_of_date` $\le t_0$). Nếu hai bộ signal cho $t_0$ khớp nhau, pipeline là PIT-sạch. Nếu chúng khác — ví dụ signal của tháng 6 thay đổi khi bạn thêm dữ liệu tháng 8 — nghĩa là có dữ liệu tương lai đang rò ngược, và mọi backtest phía trên nó là ảo. Đây là bài kiểm tra một dòng mà tách được các quỹ nghiêm túc khỏi phần còn lại.

Toàn bộ pipeline này không sinh ra một điểm alpha nào; nó chỉ đảm bảo rằng những điểm alpha bạn *nghĩ* mình có là thật, chứ không phải quà tặng vô tình từ tương lai. Đó là lý do một quant researcher giỏi coi việc dựng và audit data pipeline không phải là công việc lặt vặt để giao cho người khác, mà là phần nền của chính nghiên cứu — vì mọi mô hình đẹp ở các chương sau đều mặc định nguyên liệu đầu vào đã sạch và point-in-time, và giả định đó là nơi phần lớn chiến lược chết trước khi kịp sống.

# Chương 3: Thống kê và econometrics

Bộ công cụ tay nghề của quant researcher. Trọng tâm không phải "biết công thức" mà là **biết công cụ nào gãy khi nào** — vì dữ liệu tài chính vi phạm gần như mọi giả định textbook. Một sinh viên thống kê giỏi bước vào buy-side thường mắc đúng một sai lầm: tin vào con số $R^2$ và t-stat mà máy in ra, quên mất rằng mọi con số ấy được dựng trên giả định IID, homoskedastic, stationary — ba thứ mà giá cổ phiếu, spread, và return chiến lược đều vi phạm thô bạo. Chương này đi qua từng công cụ nền — ước lượng, kiểm định, hồi quy, time series, cointegration, state space — và ở mỗi công cụ đặt cùng một câu hỏi: *nó nói dối bạn ở đâu, và giá của việc tin nó bằng bao nhiêu tiền?*

## 3.1 Ước lượng và sai số — vì sao mean không ước lượng được

Hãy bắt đầu bằng sự thật khó chịu nhất của cả nghề, thứ định hình mọi thiết kế phía sau: **sai số ước lượng lớn hơn bạn tưởng rất nhiều.**

**Mean return gần như không ước lượng được từ lịch sử.** Ước lượng mean return $\mu$ từ $T$ năm dữ liệu có sai số chuẩn $\sigma/\sqrt{T}$. Với $\sigma = 16\%$/năm: để SE tụt xuống $1.6\%$ (tức bằng một phần mười của vol) cần $\sigma/\sqrt{T} = 1.6\%$, tức $\sqrt{T} = 10 \Rightarrow T = 100$ **năm** dữ liệu. Kết luận gây sốc mà mọi người trong nghề thuộc lòng: **mean return gần như không ước lượng được từ lịch sử**; volatility và correlation thì ước lượng được tốt hơn nhiều. Toàn bộ thiết kế của nghề xoay quanh sự thật này: đừng tin dự báo return của chính mình, hãy đa dạng hóa nó; nhưng risk model thì đáng tin hơn.

Vì sao mean khó mà vol dễ? Chỗ này đáng dẫn xuất kỹ vì nó là bất đối xứng nền tảng của toàn P-world. Giả sử ta có $n$ quan sát return trong một khoảng thời gian tổng cộng $T$ năm, lấy mẫu với tần suất $\Delta = T/n$ (năm). Ước lượng mean có sai số chuẩn $\sigma/\sqrt{T}$ — chú ý mẫu số là $\sqrt{T}$, **tổng độ dài lịch sử**, không phải $\sqrt{n}$. Lấy mẫu dày hơn (daily thay vì monthly) làm tăng $n$ nhưng $T$ không đổi, nên SE của mean **không giảm**. Trực giác: mean của return chính là $(P_T - P_0)/P_0$ chia cho $T$ — nó chỉ phụ thuộc điểm đầu và điểm cuối, thêm bao nhiêu điểm ở giữa cũng không giúp gì. Ngược lại, ước lượng của $\sigma^2$ có sai số chuẩn cỡ $\sigma^2\sqrt{2/n}$ — mẫu số là $\sqrt{n}$, **số quan sát**. Lấy mẫu dày hơn tăng $n$ tuyến tính, nên vol ước lượng được ngày càng chính xác. Một minh họa để thấy khoảng cách: với 30 năm dữ liệu daily ($n \approx 7560$ phiên), SE của vol chỉ cỡ $\sigma^2\sqrt{2/7560}$, tức sai số tương đối của $\sigma$ khoảng $\sqrt{1/(2n)} \approx 0.8\%$ — ta biết vol chính xác tới dưới một phần trăm; trong khi mean của cùng dữ liệu ấy vẫn còn sai số $\pm 2.9\%$ trên nền chỉ $8\%$. Đây là toàn bộ lý do vì sao ta *dự báo* risk và *đa dạng hóa* return: một cái đo được, một cái gần như không.

Con số cụ thể để cảm nhận: S&P 500 có $\mu \approx 8\%$/năm thực (equity premium), $\sigma \approx 16\%$/năm. Với 30 năm dữ liệu — một sự nghiệp đầy đủ — SE của mean là $16\%/\sqrt{30} = 2.92\%$. Khoảng tin cậy 95% cho equity premium là $8\% \pm 1.96 \times 2.92\% = 8\% \pm 5.7\%$, tức **từ khoảng 2.3% đến 13.7%**. Sau ba thập kỷ quan sát, ta vẫn không biết chắc premium là 3% hay 12% — chênh nhau bốn lần, đủ để đảo lộn mọi quyết định phân bổ vốn. Đây không phải khiếm khuyết của dữ liệu Mỹ; đây là giới hạn cứng của bài toán.

**Sai số của chính Sharpe ratio.** Ta không đo mean trần trụi mà đo Sharpe $SR = \mu/\sigma$; sai số của nó cũng phải biết. Công thức Lo (2002) nên thuộc lòng:

$$SE(\widehat{SR}) \approx \sqrt{\frac{1 + SR^2/2}{T}}$$

với $T$ năm, returns gần IID. Dẫn xuất trực giác: $\widehat{SR}$ là hàm của hai ước lượng $\hat\mu$ và $\hat\sigma$; áp delta method lên tỷ số này, phần $1/T$ đến từ noise của $\hat\mu$, phần $SR^2/(2T)$ đến từ noise của $\hat\sigma$ (Sharpe càng cao thì sai số của mẫu số càng đóng góp nhiều). Chiến lược Sharpe 1.0 đo trên 5 năm: $SE = \sqrt{(1 + 0.5)/5} = \sqrt{0.30} = 0.55$ → khoảng tin cậy 95% là $1.0 \pm 1.96 \times 0.55 = 1.0 \pm 1.07$, tức **từ −0.07 đến 2.07**. Đọc lại lần nữa: sau 5 năm live tốt đẹp, dữ liệu vẫn chưa loại trừ được khả năng chiến lược vô giá trị. Đây là con số nên nhớ khi đọc pitch deck của bất kỳ quỹ nào, và là lý do allocator nhìn quy trình (process) nhiều hơn track record ngắn.

Đảo ngược công thức cho ta một quy tắc thiết kế: muốn t-stat = 2 (để "chứng minh" chiến lược khác 0), ta cần $SR/SE(\widehat{SR}) = 2$. Với Sharpe thực 1.0: $SE = \sqrt{1.5/T}$, nên $1/\sqrt{1.5/T} = \sqrt{T/1.5} = 2 \Rightarrow T = 4 \times 1.5 = 6$ năm. Với Sharpe 0.5: $SE = \sqrt{1.125/T}$, nên $0.5\sqrt{T/1.125} = 2 \Rightarrow \sqrt{T/1.125} = 4 \Rightarrow T = 16 \times 1.125 = 18$ năm. Một Sharpe khiêm tốn 0.5 — hoàn toàn đáng giao dịch, nhiều quỹ sống bằng nó — cần gần hai thập kỷ live mới đạt significance thống kê tiêu chuẩn. Nghề này chạy trên bằng chứng mỏng manh hơn bất kỳ ngành khoa học nào chấp nhận, và đó chính là vì sao kỷ luật quy trình quan trọng hơn kết quả.

## 3.2 Hypothesis testing và multiple testing — cái bẫy factor zoo

**Hypothesis testing và t-statistic.** Chiến lược có Sharpe $\widehat{SR}$ trên $T$ năm → t-stat $\approx \widehat{SR}\sqrt{T}$. Công thức này đến trực tiếp từ mục trước: t-stat là ước lượng chia cho sai số của nó, và với return IID zero-mean thì test "$\mu = 0$" quy về $\hat\mu/(\hat\sigma/\sqrt{T}) = \widehat{SR}\sqrt{T}$ (đơn vị $T$ tính theo số kỳ, ở đây năm nếu Sharpe niên hóa). Sharpe 0.5 trên 4 năm: $t = 0.5\sqrt{4} = 1.0$ — hoàn toàn có thể là noise. Sharpe 1 cần $T = (2/1)^2 = 4$ năm để đạt $t \approx 2$. Nhưng — điểm chết người — ngưỡng $t = 2$ chỉ đúng khi bạn test **một** giả thuyết định trước.

Đây là chỗ trực giác của người mới sụp đổ. Thử 100 biến thể chiến lược rồi lấy cái đẹp nhất → kỳ vọng cái đẹp nhất có t ≈ 3 **thuần túy do may mắn** (multiple testing). Ta có thể tính con số này. Nếu thử $N$ chiến lược độc lập, mỗi cái có t-stat rút từ phân phối chuẩn $N(0,1)$ (giả thuyết null: tất cả vô giá trị), thì kỳ vọng của giá trị lớn nhất trong $N$ mẫu chuẩn xấp xỉ $\sqrt{2\ln N}$. Với $N = 100$: $\sqrt{2\ln 100} = \sqrt{9.21} = 3.03$. Với $N = 20$: $\sqrt{2\ln 20} = \sqrt{5.99} = 2.45$. Nói cách khác, chỉ cần thử 20 biến thể vô giá trị, cái tốt nhất trông như có t ≈ 2.45 — vượt ngưỡng "significant" cổ điển — mà thực chất là số 0 trá hình. Đây là cỗ máy sản xuất alpha giả của cả ngành.

Harvey-Liu-Zhu (2016) khảo sát "factor zoo" học thuật — hàng trăm factor được công bố — và đề nghị ngưỡng **t > 3** cho khám phá mới, chính vì cả cộng đồng đã thử hàng nghìn thứ và chỉ những cái vượt ngưỡng cũ mới được xuất bản (publication bias là multiple testing ở quy mô ngành). Ngưỡng t > 3 tương ứng với việc trừ hao cho khoảng $N \approx 90$ thí nghiệm ẩn, vì $\sqrt{2\ln 90} = \sqrt{2 \times 4.50} = 3.00$. Chương 7 đưa công cụ định lượng hơn — **deflated Sharpe ratio** — nhưng nguyên lý đã ở đây. Chương 9 sẽ cho con số vận hành: thử $N=1000$ cấu hình trên 10 năm → Sharpe ngưỡng do may $SR_0 = \sqrt{2\ln N/T} = \sqrt{2\ln 1000 / 10} = \sqrt{13.82/10} = 1.18$; nếu Sharpe quan sát chỉ 1.2 thì deflated Sharpe rơi về ~50% — nửa nửa là đồ giả.

Nguyên tắc văn hóa của các quỹ tốt rút ra từ toán này: **đếm mọi thí nghiệm, kể cả thất bại** — vì phân phối của "cái tốt nhất trong N lần thử" phụ thuộc N, và nếu không ghi lại N thì không cách nào deflate đúng. Một researcher thử 50 lookback windows trong đầu rồi báo cáo "cái 60 ngày cho Sharpe 1.3" đang tự lừa mình và lừa PM: theo $\sqrt{2\ln 50} = 2.8$, cái tốt nhất trong 50 cửa sổ vô giá trị đã kỳ vọng $t \approx 2.8$, thừa sức trông "đẹp". Các pod shop nghiêm túc log số backtest chạy, và một số áp hẳn "budget" thí nghiệm cho mỗi ý tưởng.

## 3.3 Stationarity, spurious regression, và bộ đôi ADF/KPSS

**Stationarity.** Chuỗi dừng = phân phối không đổi theo thời gian (chính xác hơn: mean, variance, và autocovariance không phụ thuộc thời điểm — weak stationarity). Giá KHÔNG dừng (random walk — variance nổ theo $t$); returns gần dừng. Đây không phải chi tiết kỹ thuật vụn: nó quyết định biến nào được phép đưa vào hồi quy. Cụ thể vì sao variance của giá "nổ": nếu $P_t = P_{t-1} + \epsilon_t$ với $\epsilon_t$ IID variance $\sigma^2$, thì $P_t = P_0 + \sum_{i=1}^{t}\epsilon_i$ có $\text{Var}(P_t) = t\sigma^2$ — lớn dần vô hạn theo $t$, không có mức cân bằng để "phân phối không đổi" bám vào. Return $\epsilon_t = P_t - P_{t-1}$ thì variance cố định $\sigma^2$ — dừng.

Vì sao giá không dừng lại nguy hiểm đến thế? Vì hồi quy hai chuỗi không dừng lên nhau → **spurious regression**: $R^2$ cao, t-stat đẹp, vô nghĩa hoàn toàn. Granger và Newbold (1974) đã cho chạy mô phỏng kinh điển: lấy hai random walk **hoàn toàn độc lập** (không có liên hệ nhân quả nào), hồi quy cái này lên cái kia. Kết quả trung bình: $R^2 \approx 0.2$–$0.3$ và t-stat của hệ số thường vượt 4, "significant" rực rỡ — trên hai chuỗi mà theo xây dựng chẳng liên quan gì nhau. Hai random walk độc lập "tương quan" 0.7 là chuyện thường gặp. Lý do sâu: OLS giả định residual dừng và IID; khi hồi quy hai I(1) không cointegrated, residual bản thân nó là I(1) (không dừng), mọi công thức SE sụp đổ, t-stat phân kỳ theo $\sqrt T$ thay vì hội tụ. Bạn càng có nhiều dữ liệu, "bằng chứng" giả càng mạnh — đúng ngược với trực giác.

Ví dụ số cụ thể để khắc cốt: giả lập hai random walk 500 phiên, mỗi bước là nhiễu chuẩn độc lập. Một lần chạy điển hình cho hệ số hồi quy $\hat\beta = 0.6$ với t-stat $= 8.1$ và $R^2 = 0.42$. Người mới nhìn vào sẽ reo lên "tìm ra quan hệ mạnh!". Nhưng nếu ta hồi quy **thay đổi** (return) của chuỗi này lên return chuỗi kia — tức làm việc trên biến dừng — thì $\hat\beta$ rơi về ~0.00 với t-stat ~0.3, $R^2 \approx 0.001$. Sự thật hiện ra: không có quan hệ nào cả. Toàn bộ "tín hiệu" ở bản level là ảo giác của non-stationarity. Chú ý con số t-stat 8.1 ở level không phải sai lệch nhỏ — nó vượt xa ngưỡng t > 3 gắt nhất của mục 3.2, cho thấy multiple-testing thresholds cũng bất lực trước spurious regression: đây là một loại nói dối khác, sinh từ non-stationarity chứ không từ số lần thử, và phải chặn bằng đúng công cụ của nó là kiểm định tính dừng.

Quy tắc sắt rút ra: **làm việc trên returns/spread dừng, không bao giờ hồi quy giá lên giá** — trừ khi cointegration (mục 3.6). Cách kiểm tra tính dừng bằng con số: hai kiểm định bổ sung nhau.

- **ADF (Augmented Dickey-Fuller)** — null là "có unit root / không dừng". Nó hồi quy $\Delta y_t = \phi\, y_{t-1} + \sum \delta_i \Delta y_{t-i} + \epsilon_t$ và test $\phi = 0$ (unit root). Nếu $\hat\phi$ đủ âm (giá kéo về mức cũ) → bác bỏ null → chuỗi dừng. Ví dụ: chạy ADF trên chuỗi giá SPY thô cho t-stat $\approx -1.2$ (p-value ~0.6, **không** bác bỏ được → giá không dừng, đúng như kỳ vọng); chạy trên chuỗi return cho t-stat $\approx -22$ (p-value < 0.001 → return dừng). Chú ý phân phối của thống kê ADF **không** phải Student-t chuẩn — nó là phân phối Dickey-Fuller lệch trái, nên giá trị tới hạn 5% không phải $-1.96$ mà cỡ $-2.86$ (có hằng số); dùng nhầm ngưỡng t thường sẽ bác bỏ null quá dễ.
- **KPSS** — null **ngược lại**: "chuỗi dừng". Dùng ADF và KPSS **cùng nhau** là thực hành chuẩn vì chúng đặt cược ngược nhau, giúp tránh kết luận sai do power thấp. Bốn khả năng: ADF bác + KPSS không bác → dừng (đồng thuận); ADF không bác + KPSS bác → không dừng (đồng thuận); cả hai không bác → dữ liệu chưa đủ để kết luận; cả hai bác → có thể là fractional integration hoặc structural break, cần đào sâu (fracdiff, chương 10). Bộ đôi này trong repo là module `stationarity` (`adf`, `kpss`).

Một tinh tế thực chiến: nhiều chuỗi hữu ích ở lưng chừng — không hẳn I(1) như giá, không hẳn I(0) như return. Dividend yield, credit spread, term spread, thậm chí vol, có memory rất dài (near-unit-root). Fractional differencing (chương 10) sinh ra chính để giữ lại memory dự báo mà vẫn ép chuỗi về dừng vừa đủ để hồi quy hợp lệ — đó là câu trả lời hiện đại cho căng thẳng "dừng để hồi quy đúng" chọi "đừng dừng quá tay mà mất tín hiệu".

## 3.4 Hồi quy tuyến tính — con ngựa thồ và các chỗ gãy

OLS: $y = X\beta + \epsilon$, $\hat\beta = (X^\top X)^{-1}X^\top y$. Công thức này là chiếc búa mà mọi quant cầm suốt ngày. Trong nghề, hồi quy dùng cho: ước lượng beta/factor exposure, kiểm tra alpha ("hồi quy return chiến lược lên các factor đã biết — phần chặn còn sống không?"), neutralize tín hiệu, và là baseline của mọi mô hình dự báo. Một chân lý cay đắng đáng in đậm: **mô hình tuyến tính + feature tốt đánh bại mô hình phức tạp + feature tồi, gần như luôn luôn.** Người mới muốn nhảy ngay vào gradient boosting; người có kinh nghiệm biết 80% giá trị nằm ở chọn đúng biến và xử lý đúng ba chỗ gãy dưới đây.

Chỗ gãy trên dữ liệu tài chính và cách vá — bảng này đáng giá hơn cả chục trang lý thuyết:

| Vấn đề | Hậu quả | Vá chuẩn industry |
|---|---|---|
| Heteroskedasticity (vol clustering) | SE sai → t-stat ảo | White/robust SE |
| Autocorrelation của residuals (overlapping returns) | t-stat phồng to | Newey-West SE; không dùng overlapping windows khi tránh được |
| Outliers (đuôi dày) | $\hat\beta$ bị vài điểm kéo lệch | Winsorize features (clip 1%/99%), robust regression (Huber) |
| Multicollinearity (features na ná nhau) | $\hat\beta$ bất ổn, dấu lộn ngược | Ridge; hoặc orthogonalize features theo thứ tự kinh tế |
| Regime change | $\beta$ hôm qua ≠ ngày mai | Rolling/expanding window, exponential decay weights |
| Cross-sectional correlation (mọi cổ phiếu cùng nhảy theo market) | "N = 3000 cổ phiếu" thực ra N hiệu dụng ~ vài chục | Clustered SE theo ngày; Fama-MacBeth (chương 5) |

Bảng này chỉ nói "vá thế nào"; điều quan trọng là cảm nhận *giá của việc không vá bằng con số*. Lấy ba chỗ gãy nguy hiểm nhất.

**Heteroskedasticity và White SE.** Return tài chính có vol clustering — variance của residual không hằng số mà co giãn theo regime. OLS vẫn cho $\hat\beta$ không thiên lệch, nhưng công thức SE cổ điển $\hat\sigma^2(X^\top X)^{-1}$ giả định variance đồng đều nên sai. Giá của việc bỏ qua bằng con số: hình dung ước lượng beta của một cổ phiếu, nhưng nửa mẫu là giai đoạn bình lặng (vol thị trường 10%/năm) và nửa kia là khủng hoảng (vol 40%/năm — variance gấp 16 lần). Những ngày khủng hoảng có residual khổng lồ và thống trị $X^\top X$; SE cổ điển "bình quân hóa" variance sai lệch, thường cho t-stat lệch 20–50% so với thực. White (heteroskedasticity-consistent) SE thay $\hat\sigma^2 I$ bằng ma trận đường chéo các residual bình phương thực tế $\hat\epsilon_t^2$, để mỗi quan sát đóng góp đúng độ nhiễu của nó: $\widehat{\text{Var}}(\hat\beta) = (X^\top X)^{-1}\big(\sum_t \hat\epsilon_t^2 x_t x_t^\top\big)(X^\top X)^{-1}$. Đây là mặc định trong mọi hồi quy tài chính nghiêm túc — bật robust SE gần như không mất gì và cứu ta khỏi t-stat ảo.

**Newey-West và cái bẫy overlapping returns.** Giả sử ta dự báo return 21 ngày (một tháng) bằng dữ liệu daily, dùng cửa sổ trượt chồng lấn — mỗi ngày một quan sát, nhưng return 21 ngày của hôm nay và hôm qua chia sẻ 20 ngày chung. Residual của các quan sát liền kề tương quan gần như hoàn hảo; số quan sát *độc lập* thực chất chỉ bằng tổng số ngày chia 21. OLS ngây thơ đếm mỗi ngày là một quan sát độc lập → phóng đại số bậc tự do lên ~21 lần → SE bị chia cho $\sqrt{21} \approx 4.58$ → **t-stat phồng lên gấp ~4.6 lần**. Đây chính là nguồn "t-stat 8" ảo phổ biến nhất trong paper alpha: một tín hiệu t-stat thật $8/\sqrt{21} \approx 1.75$ (vô nghĩa) hiện lên thành 8 (giải Nobel giả). Newey-West sửa bằng cách ước lượng ma trận hiệp phương sai có tính đến autocorrelation tới một số lag. Quy tắc ngón tay cái: **lag ≈ 1.5 × độ dài chồng lấn** — dự báo return 21 ngày → lag $\approx 1.5 \times 21 \approx 32$. Với ví dụ trên, Newey-West kéo t-stat 8 về đúng ~1.75. Quên Newey-West với overlapping returns là lỗi số một khiến backtest paper không sống được ngoài đời.

**Cross-sectional correlation và N hiệu dụng.** Khi hồi quy cross-section (một ngày, nhiều cổ phiếu) lặp qua nhiều ngày — đừng pool tất cả vào một OLS khổng lồ. Vì trong cùng một ngày, 3000 cổ phiếu không phải 3000 quan sát độc lập: chúng cùng nhảy theo market, theo sector, theo vài factor chung. N hiệu dụng thực ra chỉ cỡ vài chục "chiều" độc lập; nếu correlation trung bình giữa các cổ phiếu trong ngày là $\rho \approx 0.3$, số quan sát hiệu dụng gần với $1/\rho \approx 3$ tới vài chục "khối" độc lập chứ không phải 3000. Pool tất cả → SE bị đánh giá thấp thảm hại → t-stat ảo lần nữa. Cách chuẩn của toàn ngành: chạy **từng ngày một rồi lấy trung bình và SE của chuỗi hệ số theo ngày** — đây là **Fama-MacBeth** (chi tiết chương 5.1). Cụ thể: mỗi ngày $t$ hồi quy return cross-section lên factor exposure, thu được một $\hat\beta_t$; rồi ước lượng premium là $\bar\beta = \frac{1}{T}\sum_t \hat\beta_t$ với SE $= \text{std}(\hat\beta_t)/\sqrt{T}$. Cách này tự động miễn nhiễm correlation cross-sectional trong ngày vì mỗi ngày chỉ đóng góp *một* con số vào chuỗi thời gian; correlation giữa các cổ phiếu trong ngày đã bị "nuốt" vào $\hat\beta_t$ đơn lẻ.

**Shrinkage — tư tưởng thống kê quan trọng nhất P-world.** Với dữ liệu ít/nhiễu, ước lượng "kéo về prior" (Ridge/Lasso/Bayes/Ledoit-Wolf) thắng ước lượng "trung thực" (OLS/sample covariance) gần như luôn luôn. Đây không phải mẹo, mà là định lý. James-Stein từ 1961 chứng minh điều phản trực giác: khi ước lượng $\geq 3$ means đồng thời, ước lượng shrink về trung bình chung *luôn* dominate (sai số kỳ vọng nhỏ hơn với **mọi** giá trị thật) so với dùng từng sample mean riêng lẻ. Hệ số shrink James-Stein có dạng

$$\hat\mu_i^{JS} = \bar\mu + \left(1 - \frac{(k-2)\sigma^2}{\|\hat\mu - \bar\mu\|^2}\right)(\hat\mu_i - \bar\mu)$$

kéo mỗi ước lượng về trung bình chung $\bar\mu$ với lực mạnh khi noise $\sigma^2$ lớn so với độ tán $\|\hat\mu - \bar\mu\|^2$ của các ước lượng.

Con số minh họa sức mạnh, tính từng bước để thấy nó không phải phép màu mà là số học. Ta ước lượng expected return của $k = 10$ chiến lược; giá trị **thật** của cả 10 đều là $5\%$/năm, nhưng do noise (giả sử SE mỗi ước lượng $\sigma = 2\%$/năm) các sample means rơi rải đều từ $1\%$ đến $9\%$, trung bình chung $\bar\mu = 5\%$. Độ tán $\|\hat\mu - \bar\mu\|^2 = \sum(\hat\mu_i - 5)^2 = (4^2 + 3^2 + 2^2 + 1^2 + 0 + 0 + 1^2 + 2^2 + 3^2 + 4^2) = 60$ (đơn vị $\%^2$). Hệ số shrink: $1 - (k-2)\sigma^2/60 = 1 - 8 \times 4/60 = 1 - 0.533 = 0.467$. Nghĩa là mỗi ước lượng bị kéo **53% quãng đường** về $5\%$: chiến lược trông "tốt nhất" với sample mean $9\%$ bị hạ xuống $5 + 0.467 \times 4 = 6.87\%$; chiến lược "tệ nhất" $1\%$ được nâng lên $5 - 0.467 \times 4 = 3.13\%$. So sánh sai số tổng bình phương với giá trị thật $5\%$: bộ raw có $\text{SSE} = 60$; bộ shrunk có $\text{SSE} = 0.467^2 \times 60 = 13.1$. Shrinkage cắt **78%** sai số — chỉ bằng cách không tin các cực trị của một mẫu nhiễu. Điều đắt giá: nó cắt đúng cái chiến lược "tốt nhất" mà một PM ngây thơ sẽ đổ hết vốn vào. Trong covariance, Ledoit-Wolf shrink sample covariance về một target có cấu trúc (thường là constant-correlation hoặc identity scaled) — chương 5 cho thấy điều này biến một ma trận không khả nghịch/bất ổn thành thứ dùng được cho mean-variance optimization. Nghề này về bản chất là nghệ thuật shrinkage: **tin dữ liệu ít thôi, tin structure nhiều hơn** — hệ quả trực tiếp của mục 3.1 (mean gần như không đo được, nên đừng để optimizer tin quá vào ước lượng mean thô).

## 3.5 Time series models: ARMA, GARCH, và realized volatility

**ARMA.** AR($p$) — return phụ thuộc chính nó trễ $p$ bước; MA($q$) — phụ thuộc shock cũ. Sự thật thực dụng cần nói thẳng để người mới không phí thời gian: ARMA trên returns daily gần như **không có gì để bắt** (autocorrelation ~0, đây là stylized fact — return khó dự báо ở first moment). Một con số để đóng đinh điều này: autocorrelation bậc 1 của daily return S&P 500 điển hình chỉ cỡ $\rho_1 \approx -0.02$ tới $0.03$; với $T = 2500$ ngày (mười năm), SE của một hệ số autocorrelation là $1/\sqrt{T} = 1/\sqrt{2500} = 0.02$, nên $\rho_1 = 0.03$ chỉ cho t-stat $\approx 1.5$ — không phân biệt được với 0. Không có gì để một mô hình mean bám vào. Giá trị thật của ARMA không nằm ở dự báo mean return, mà ở hai chỗ: làm nền cho residual analysis, và mô hình hóa các chuỗi *có* cấu trúc thật sự — vol, volume, spread, order flow imbalance. Những chuỗi này có autocorrelation dương và dai (persistent): $\rho_1$ của $r_t^2$ (proxy cho vol) thường $0.2$–$0.3$, tức t-stat $10$–$15$ — tín hiệu thật, dày đặc, nơi AR bắt được.

Điểm nối quan trọng: nếu return có mean ~0 và không autocorrelated, nhưng $r_t^2$ (đại diện cho vol) **có** autocorrelation mạnh và dương, thì ta cần một mô hình cho *variance có điều kiện*. Đó chính là GARCH.

**GARCH(1,1)** — mô hình một-dòng thành công nhất econometrics tài chính:

$$\sigma_t^2 = \omega + \alpha\, r_{t-1}^2 + \beta\, \sigma_{t-1}^2$$

"Vol hôm nay = nền + cú sốc hôm qua + quán tính vol hôm qua". Đọc kỹ ba số hạng: $\omega$ là mức vol nền dài hạn; $\alpha$ là mức độ vol phản ứng với cú sốc mới nhất (return bình phương hôm qua); $\beta$ là quán tính — vol hôm nay thừa hưởng bao nhiêu từ vol hôm qua. Điển hình $\alpha \approx 0.08, \beta \approx 0.9$; tổng $\alpha + \beta \to 1$ nghĩa là vol rất dai (persistent). Biến thể có leverage effect: GJR-GARCH, EGARCH nắm bắt việc **shock âm (thị trường rơi) làm vol tăng mạnh hơn shock dương cùng độ lớn** — một stylized fact rõ rệt của equity (panic bán tháo đẩy vol lên, rally êm ả thì không). Dùng làm gì trong thực tế: vol forecast cho **vol targeting** (chương 14 — điều chỉnh đòn bẩy để giữ vol danh mục cố định), chuẩn hóa returns (return/σ — "de-GARCHing" trước khi phân tích để tách tín hiệu khỏi nhịp thở vol), và VaR.

**GARCH(1,1) bằng số** — bộ tham số điển hình cho equity index: $\omega = 2\times10^{-6}$, $\alpha = 0.08$, $\beta = 0.90$. Ba phép tính này nên làm được nhẩm trong đầu vì chúng là bài kiểm tra trực giác vol chuẩn:

- **Vol dài hạn (unconditional).** Đặt $\sigma_t^2 = \sigma_{t-1}^2 = \bar\sigma^2$ (trạng thái cân bằng) trong phương trình: $\bar\sigma^2 = \omega + \alpha\bar\sigma^2 + \beta\bar\sigma^2 \Rightarrow \bar\sigma^2 = \omega/(1-\alpha-\beta) = 2\times10^{-6}/(1 - 0.98) = 2\times10^{-6}/0.02 = 10^{-4}$ → $\bar\sigma = 0.01$ tức **1%/ngày ≈ 15.9%/năm** (nhân $\sqrt{252}$: $0.01 \times 15.87 = 0.159$). Đây là "trọng lực" mà mọi forecast bị kéo về.
- **Sau một cú sốc.** Hôm qua thị trường sập 3% khi vol đang ở nền 1%: $\sigma_t^2 = 2\times10^{-6} + 0.08(0.03)^2 + 0.90(0.01)^2 = 2\times10^{-6} + 0.08 \times 9\times10^{-4} + 0.90 \times 10^{-4} = 2\times10^{-6} + 7.2\times10^{-5} + 9\times10^{-5} = 1.64\times10^{-4}$ → dự báo vol hôm nay $\sqrt{1.64\times10^{-4}} = 0.0128$, tức **1.28%/ngày (20.3%/năm)** — một cú sốc nâng dự báo $0.0128/0.01 - 1 = 28\%$. Chú ý cú sốc 3% (gấp 3 lần vol thường) chỉ đẩy vol lên 28% chứ không gấp 3 — vì $\alpha$ chỉ 0.08, đa phần forecast vẫn là quán tính $\beta$.
- **Cú sốc phai nhanh thế nào.** Độ lệch của forecast khỏi vol dài hạn phai với tốc độ $(\alpha+\beta)^n = 0.98^n$ mỗi ngày. Half-life $= \ln 0.5/\ln 0.98 = -0.693/(-0.0202) \approx 34$ ngày phiên — vol nhớ dai hơn một tháng. Đó chính là "clustering" được định lượng hóa: sau một tuần biến động lớn, vol vẫn còn cao đáng kể suốt tháng sau. Đây là lý do vol targeting rebalance theo tuần chứ không theo quý — nếu chờ quý mới điều chỉnh đòn bẩy, cú sốc đã phai gần hết và ta luôn phản ứng muộn.

**Đối thủ hiện đại: realized volatility và HAR.** GARCH ước lượng vol từ *một* quan sát return mỗi ngày (return bình phương là proxy rất nhiễu cho vol thật của ngày đó). Khi có dữ liệu intraday, ta làm tốt hơn nhiều: **realized volatility** $RV_t = \sum_{i} r_{t,i}^2$ — tổng bình phương của, chẳng hạn, 78 return 5-phút trong ngày (6.5 giờ giao dịch × 12 khoảng/giờ = 78) — là ước lượng vol ngày đó chính xác gấp bội. Trực giác về độ lợi bằng số: proxy "daily squared return" chỉ dùng **một** con số nên sai số ước lượng khổng lồ; RV cộng dồn **78** mẩu thông tin trong ngày, cắt sai số ước lượng của vol ngày đó xuống cỡ $\sqrt{1/78} \approx 1/8.8$ — chính xác hơn gần một bậc độ lớn. Mô hình **HAR (Heterogeneous AutoRegressive, Corsi 2009)** dự báo RV ngày mai bằng trung bình RV của ba tầm nhìn — ngày qua, tuần qua, tháng qua:

$$RV_{t+1} = c + \beta_d\, RV_t + \beta_w\, \overline{RV}_t^{(5)} + \beta_m\, \overline{RV}_t^{(22)} + \epsilon_t$$

trong đó $\overline{RV}^{(5)}$ và $\overline{RV}^{(22)}$ là RV trung bình 5 và 22 ngày. Ba tầm nhìn này bắt chước ba loại người chơi (day trader, swing, đầu tư dài) tạo ra vol ở ba nhịp khác nhau. HAR chỉ là một OLS ba biến — đơn giản đến mức khiêm tốn — nhưng **đánh bại GARCH ở hầu hết bài dự báo vol khi có dữ liệu intraday**, vì input của nó (RV) ít nhiễu hơn hẳn return bình phương. Bài học nghề lặp lại chủ đề mục 3.4: một OLS đơn giản trên feature tốt (RV) thắng một mô hình tinh vi (GARCH) trên feature tồi (daily squared return).

## 3.6 Cointegration, Ornstein-Uhlenbeck, và half-life — nền của pairs trading

**Cointegration — nền của pairs trading.** Ở mục 3.3 ta thề không bao giờ hồi quy giá lên giá. Cointegration là ngoại lệ duy nhất, và nó là ngoại lệ quý giá nhất trong toàn P-world. Hai chuỗi giá không dừng $X, Y$ gọi là cointegrated nếu tồn tại tổ hợp $Y - \gamma X$ **dừng** — hình dung hai con thuyền neo chung một mỏ neo dưới đáy, mỗi con dập dềnh theo sóng riêng (mỗi giá là I(1), lang thang không giới hạn) nhưng khoảng cách giữa chúng bị kéo về mức cũ (spread dừng, I(0)). Coca-Cola và Pepsi, hai class share của cùng công ty, ETF và rổ cấu thành của nó — đó là những cặp neo chung.

**Engle-Granger 2 bước** — recipe cụ thể làm lại được:
1. Hồi quy $Y$ lên $X$ (OLS trên level) lấy $\hat\gamma$ — đây là hedge ratio, tỷ lệ giữ hai chân. Lưu ý: đây chính là cái hồi quy giá-lên-giá mà ta cấm ở 3.3; nó *chỉ* hợp lệ nếu bước 2 xác nhận residual dừng.
2. Test ADF trên residual $\hat u_t = Y_t - \hat\gamma X_t$. Nếu ADF bác bỏ null unit root → residual dừng → cặp **cointegrated**. Nếu không → chỉ là hai random walk tình cờ, hồi quy bước 1 là spurious, vứt.

(Với nhiều chuỗi thì Engle-Granger không đủ — cần Johansen, mục 3.8.)

Một khi có spread dừng, ta mô hình hóa động học của nó bằng **Ornstein-Uhlenbeck** (gặp lại từ cuốn Q — cùng một quá trình mean-reverting xuất hiện ở short rate models):

$$ds = \kappa(\mu - s)\,dt + \sigma\, dW$$

$\kappa$ là tốc độ kéo về (mean-reversion speed): spread lệch khỏi $\mu$ càng xa, lực kéo về càng mạnh, tỷ lệ với $\kappa$. Từ $\kappa$ ta suy ra đại lượng quan trọng nhất của trò chơi — **half-life** $= \ln 2/\kappa$: spread lệch bao lâu thì về được nửa đường. Half-life quyết định holding period và độ "trade được" của cặp. Ước lượng $\kappa$ trong thực tế: hồi quy $\Delta s_t = a + b\, s_{t-1} + \epsilon_t$ (một AR(1) trên spread) rồi $\kappa = -b$ (theo đơn vị thời gian của dữ liệu). Cầu nối giữa hai công thức: rời rạc hóa OU cho $s_t - s_{t-1} = \kappa(\mu - s_{t-1})\Delta t + \dots = -\kappa \Delta t\, s_{t-1} + \kappa\mu\Delta t + \dots$, đối chiếu với $\Delta s_t = a + b\,s_{t-1}$ cho $b = -\kappa\Delta t$, nên với dữ liệu daily ($\Delta t = 1$ ngày) thì $\kappa = -b$ trực tiếp theo đơn vị "trên ngày".

**Half-life OU bằng số và quy tắc trade từ nó.** Fit spread một cặp cổ phiếu được $\kappa = 0.05$/ngày → half-life $= \ln 2/0.05 = 0.693/0.05 = 13.9 \approx 14$ ngày. Giả sử spread có $\sigma = 2.4\%$. Quy tắc thô mà desk stat-arb dùng, đọc thẳng từ hai con số này:

- **Vào lệnh** khi z-score của spread (số độ lệch chuẩn khỏi mean) vượt **±2** — tức spread đã lệch $2 \times 2.4\% = 4.8\%$ khỏi cân bằng, đủ xa để kỳ vọng hồi quy trả công cho rủi ro.
- **Kỳ vọng giữ ~1–2 half-life (2–4 tuần)** rồi spread về gần 0. Cụ thể: từ z = 2 về z = 1 mất một half-life (~14 ngày), về z = 0.5 mất thêm một half-life nữa — nên "1–2 half-life" là quãng thời gian thực để phần lớn lợi nhuận hiện thực hóa.
- **Thoát** ở z = 0 (hoặc ±0.5 để chốt sớm, giảm rủi ro đảo chiều).
- **Stop** nếu z vượt **±3.5–4**. Đây là chỗ tinh tế nhất: khi spread lệch xa hơn nữa, một tay mơ nghĩ "cơ hội to hơn, nạp thêm"; một desk kỷ luật nghĩ "có lẽ cointegration đã gãy, đây không còn là cặp mean-reverting nữa mà là hai công ty đang thật sự tách nhau". Phân biệt **"rẻ hơn" với "hỏng rồi"** là toàn bộ nghệ thuật của trò này.

**Half-life là bộ lọc đầu tiên của mọi pipeline pairs.** Half-life 100+ ngày → vốn bị giam quá lâu, mỗi vòng quay vốn kéo dài nửa năm, Sharpe/vốn tệ, bỏ. Half-life 1–2 ngày → tín hiệu đảo quá nhanh, chi phí giao dịch (spread + impact) ăn hết biên lợi nhuận trước khi kịp lãi, bỏ. Vùng ngọt là ~5–30 ngày. Trước khi tính bất cứ điều gì khác, desk lọc universe cặp qua half-life — nó rẻ để tính và loại ngay phần lớn rác.

**Cảnh báo nghề — cointegration gãy được.** Đây không phải rủi ro lý thuyết: nó là DNA của thảm họa. Tháng 8/2007, "quant quake" xảy ra khi nhiều quỹ stat-arb cùng nắm những cặp "giống nhau", một quỹ lớn bị buộc thanh lý, spread mà mọi người tưởng sẽ hội tụ lại **giãn ra đồng loạt** vì tất cả cùng bị margin call cùng lúc. Những cặp "giống nhau" hết giống trong vài ngày — không vì fundamental thay đổi mà vì cấu trúc sở hữu (ai đang giữ, ai bị ép bán) thay đổi. Mọi hệ stat-arb thật vì thế đều có cơ chế phát hiện break: rolling cointegration test (re-test định kỳ, dừng trade cặp nếu ADF không còn bác), structural break tests (chương 4), và giám sát crowding (spread giãn *đồng loạt* trên nhiều cặp là dấu hiệu deleveraging của cả đám, không phải cơ hội).

## 3.7 State space model và Kalman filter — hồi quy "sống"

Mọi công cụ đến giờ giả định tham số **cố định**: một $\beta$, một $\gamma$, một bộ GARCH. Nhưng hedge ratio giữa hai cổ phiếu trôi theo thời gian, beta của một chiến lược với market thay đổi theo regime. Ta cần một hồi quy "sống" — ước lượng tham số **biến thiên theo thời gian**, cập nhật mỗi khi có quan sát mới. Đó là **state space model**, và bộ giải của nó là **Kalman filter**.

**State space model tổng quát.** Một hệ state space gồm hai phương trình. *State equation* (transition) mô tả trạng thái ẩn $\theta_t$ tiến hóa thế nào:

$$\theta_t = F\,\theta_{t-1} + w_t, \qquad w_t \sim N(0, Q)$$

và *observation equation* (measurement) nối trạng thái ẩn với cái ta đo được $y_t$:

$$y_t = H_t\,\theta_t + v_t, \qquad v_t \sim N(0, R)$$

$F$ là ma trận chuyển trạng thái (thường $F = I$ nếu ta tin tham số đi random walk); $H_t$ là ma trận quan sát (trong hồi quy, $H_t$ chính là các feature ngày $t$); $Q$ là hiệp phương sai của nhiễu trạng thái (tham số "được phép trôi nhanh cỡ nào"); $R$ là hiệp phương sai của nhiễu đo. Khung này bao trùm cả một họ mô hình: hồi quy hệ số động ($\theta_t = \beta_t$, $H_t = $ features), local level / trend (tách xu hướng ẩn khỏi nhiễu), phân rã seasonal, thậm chí ARMA viết lại được dưới dạng state space. Đó là lý do nó là ngôn ngữ chung của nowcasting và filtering.

**Kalman filter** giải bài toán này tối ưu (theo nghĩa minimum mean-squared error, và là posterior đúng khi mọi nhiễu Gaussian). Mỗi bước gồm hai pha — *predict* (dự đoán trạng thái mới trước khi thấy dữ liệu) và *update* (kéo dự đoán về phía quan sát thực). Viết cho trường hợp một chiều quen thuộc nhất — **hedge ratio động** (state $\gamma_t$, quan sát $Y_t = \gamma_t X_t + \epsilon_t$, ta lấy $F=1$ nên state đi random walk):

*Predict:*
$$\hat\gamma_{t|t-1} = \hat\gamma_{t-1}, \qquad P_{t|t-1} = P_{t-1} + Q$$

*Update* với Kalman gain $K_t$:
$$K_t = \frac{P_{t|t-1}\,X_t}{X_t^2\,P_{t|t-1} + R}, \qquad \hat\gamma_t = \hat\gamma_{t|t-1} + K_t\big(Y_t - \hat\gamma_{t|t-1}X_t\big), \qquad P_t = (1 - K_t X_t)\,P_{t|t-1}$$

Đọc bằng lời: mỗi ngày, niềm tin về hedge ratio được kéo về phía bằng chứng mới với trọng số $K_t$ — tự động **lớn** khi mình không chắc ($P$ lớn) và **nhỏ** khi quan sát nhiễu ($R$ lớn). Số hạng $Y_t - \hat\gamma_{t|t-1}X_t$ là **innovation** — phần bất ngờ, chênh giữa quan sát thực và dự đoán; toàn bộ việc học nằm ở đây. Tỷ lệ $Q/R$ là "tốc độ quên": $Q$ lớn (cho phép state trôi nhanh) → filter phản ứng nhanh, bám sát dữ liệu gần, quên quá khứ mau — đóng vai đúng như half-life của EWMA, nhưng có khung xác suất đầy đủ (variance $P_t$ của estimate đi kèm miễn phí).

**Kalman bằng số — một bước cập nhật cụ thể.** Giả sử đang ước lượng hedge ratio, niềm tin hiện tại $\hat\gamma_{t-1} = 1.50$ với variance $P_{t-1} = 0.01$ (độ lệch chuẩn 0.1). Đặt $Q = 0.0001$ (cho phép hedge ratio trôi chậm), $R = 0.04$ (nhiễu quan sát, $\sigma_\epsilon = 0.2$). Hôm nay $X_t = 30$, và ta quan sát $Y_t = 47.4$.

- *Predict:* $\hat\gamma_{t|t-1} = 1.50$; $P_{t|t-1} = 0.01 + 0.0001 = 0.0101$.
- Dự đoán $Y$: $\hat\gamma_{t|t-1} X_t = 1.50 \times 30 = 45.0$. Innovation $= 47.4 - 45.0 = 2.4$ (quan sát cao hơn dự đoán → dữ liệu gợi ý hedge ratio nên nhích lên).
- *Kalman gain:* $K_t = \dfrac{0.0101 \times 30}{30^2 \times 0.0101 + 0.04} = \dfrac{0.303}{9.09 + 0.04} = \dfrac{0.303}{9.13} = 0.03319$.
- *Update:* $\hat\gamma_t = 1.50 + 0.03319 \times 2.4 = 1.50 + 0.0797 = 1.580$. Variance mới $P_t = (1 - 0.03319 \times 30)\times 0.0101 = (1 - 0.9956)\times 0.0101 = 0.00438 \times 0.0101 \approx 4.4\times10^{-5}$.

Đọc kết quả: một quan sát kéo hedge ratio từ 1.50 lên 1.58 — gần như nhảy hẳn tới giá trị mà innovation gợi ý ($2.4/30 = 0.08$ ứng với $\gamma$ tức thời $= 1.58$), vì ở đây $K_t X_t = 0.9956 \approx 1$: quan sát rất "thông tin" do $X_t = 30$ lớn khiến một đơn vị lệch của $\gamma$ dịch $Y$ tới 30 đơn vị, dễ đọc ra khỏi nhiễu $\sigma_\epsilon = 0.2$. Variance co lại mạnh (từ 0.0101 xuống $4.4\times10^{-5}$) vì ta vừa học được rất nhiều. Ngày mai variance lại nở thêm $Q$ trước khi cập nhật tiếp — chính khe hở $Q$ này giữ cho filter không bao giờ "đóng băng" niềm tin, luôn để ngỏ khả năng hedge ratio đã đổi. So với rolling OLS 60 ngày (cửa sổ cứng, quên đột ngột tại mép cửa sổ), Kalman quên **mượt** và cho ta thanh sai số $\sqrt{P_t} = \sqrt{4.4\times10^{-5}} \approx 0.0066$ để biết *hiện giờ* mình chắc chắn tới đâu — vô giá khi quyết định kích cỡ vị thế. Trong repo, đây là module `kalman`, chuẩn trong pairs hiện đại và nowcasting.

## 3.8 Nhiều biến: VECM và Johansen

Engle-Granger (mục 3.6) đẹp với **hai** chuỗi nhưng có ba giới hạn khi lên nhiều chuỗi: (1) nó bất đối xứng — hồi quy $Y$ lên $X$ cho hedge ratio khác với hồi quy $X$ lên $Y$; (2) với $n$ chuỗi có thể có tới $n-1$ quan hệ cointegration độc lập, Engle-Granger chỉ tìm được một; (3) nó test tuần tự (hồi quy rồi test residual), power kém. Khi ta có một rổ — cả đường cong lãi suất (nhiều kỳ hạn cointegrated), một nhóm cổ phiếu cùng ngành, một basket ETF/cấu thành — cần công cụ đa biến đúng nghĩa.

**VECM (Vector Error Correction Model)** là dạng đa biến của "spread kéo về cân bằng". Với vector giá $\mathbf{y}_t$ ($n$ chuỗi), VECM viết:

$$\Delta \mathbf{y}_t = \Pi\,\mathbf{y}_{t-1} + \sum_{i=1}^{k}\Gamma_i\,\Delta\mathbf{y}_{t-i} + \boldsymbol\epsilon_t$$

Trái tim nằm ở ma trận $\Pi$. Nếu $\Pi = 0$ thì các chuỗi chỉ là random walk độc lập (không cointegration); nếu $\Pi$ có hạng đầy đủ thì các chuỗi vốn đã dừng. Trường hợp thú vị là **hạng suy biến** $0 < r < n$: khi đó $\Pi = \alpha\beta^\top$ tách thành hai ma trận $n\times r$. Cột của $\beta$ là **các vector cointegration** — mỗi cột định nghĩa một tổ hợp $\beta_j^\top \mathbf{y}_{t-1}$ dừng (một "spread" cân bằng); $\alpha$ là **tốc độ điều chỉnh** — mỗi chuỗi kéo về cân bằng nhanh cỡ nào khi spread lệch. Hạng $r$ chính là *số quan hệ cointegration độc lập* trong rổ. Đây là tổng quát hóa trực tiếp của OU: $\beta^\top\mathbf{y}$ đóng vai spread, $\alpha$ đóng vai $-\kappa$.

**Johansen test** tìm $r$ bằng cách phân tích eigenvalue của $\Pi$ ước lượng (qua maximum likelihood, đối xứng — không thiên vị chuỗi nào làm biến phụ thuộc). Nó cho một dãy eigenvalue $\lambda_1 \geq \lambda_2 \geq \dots$; mỗi eigenvalue đáng kể (khác 0) ứng với một chiều dừng, tức một quan hệ cointegration. Hai thống kê: **trace test** (null: "có nhiều nhất $r$ quan hệ") và **maximum eigenvalue test** (null: "đúng $r$" chọi "$r+1$"), so với bảng giá trị tới hạn.

**Johansen bằng số — đường cong lãi suất.** Lấy ba lãi suất kỳ hạn — 2 năm, 5 năm, 10 năm. Cả ba đều I(1) (lãi suất lang thang như random walk ở scale này). Chạy Johansen thu được, chẳng hạn, eigenvalue $\lambda = (0.08,\ 0.03,\ 0.002)$ trên $T = 1000$ ngày. Trace statistic cho giả thuyết $r=0$ (không cointegration) là $-T\sum_i \ln(1-\lambda_i)$, tính từng số hạng: $\ln(1-0.08) = \ln 0.92 = -0.0834$, $\ln(1-0.03) = \ln 0.97 = -0.0305$, $\ln(1-0.002) = \ln 0.998 = -0.0020$; cộng lại $-0.1159$, nhân $-T = -1000$ cho trace $= 115.9$ — vượt xa giá trị tới hạn ~29.8 → bác bỏ "không cointegration". Test tiếp $r \leq 1$ (bỏ eigenvalue lớn nhất, chỉ cộng hai cái sau): $-1000(-0.0305 - 0.0020) = 32.5$, vẫn vượt tới hạn ~15.5 → bác. Test $r \leq 2$ (chỉ eigenvalue nhỏ nhất): $-1000 \times (-0.0020) = 2.0$, **dưới** tới hạn ~3.8 → không bác. Kết luận: $r = 2$ quan hệ cointegration giữa ba lãi suất — đúng như lý thuyết term structure (ba lãi suất bị chi phối bởi chỉ **một** yếu tố phi-dừng chung, thường gọi là "level"; hai chiều còn lại — slope và curvature — dừng và trade được). Hai vector $\beta$ tương ứng chính là các spread giao dịch được: 2s10s slope và 2s5s10s butterfly.

Đây là cầu nối đẹp giữa hai thế giới. Johansen phát hiện *có bao nhiêu* chiều dừng; PCA của cùng dữ liệu (chương 6) cho thấy *chúng là gì* (level/slope/curvature). Trong repo, module `cointegration` bọc `johansen`, và nó là công cụ nền cho mọi chiến lược relative-value trên rổ — curve trades, basket arbitrage, index arbitrage. Cảnh báo của mục 3.6 vẫn nguyên giá trị và còn gắt hơn ở đa biến: một vector cointegration ổn định 5 năm có thể gãy trong một tuần khi cấu trúc thị trường đổi (đổi chính sách tiền tệ, đổi thành phần index), nên rolling Johansen và giám sát $\alpha$ (nếu tốc độ điều chỉnh tiến về 0, cân bằng đang tan) là bắt buộc.

---

Điểm chung xuyên suốt chương này, đáng gói lại thành một câu để mang sang các chương sau: mọi công cụ econometric đều đưa ra một con số — t-stat, $R^2$, hedge ratio, vol forecast — kèm một **giả định** về dữ liệu, và trên dữ liệu tài chính giả định đó gần như luôn bị vi phạm theo hướng khiến con số *lạc quan hơn sự thật*. Sai số của mean lớn hơn ta tưởng (30 năm vẫn không phân biệt được equity premium 3% với 12%); t-stat phồng lên vì overlapping (gấp 4.6 lần) và multiple testing (thử 20 thứ vô giá trị đủ ra t = 2.45); $R^2 = 0.42$ có thể hoàn toàn spurious; cointegration ổn định 5 năm gãy trong một tuần đúng lúc ta cần nó nhất. Người làm nghề giỏi không phải người thuộc nhiều công thức hơn, mà là người phản xạ hỏi "công cụ này nói dối ở đâu, và tôi đang trả bao nhiêu tiền cho lời nói dối đó" — rồi vá bằng Newey-West, Fama-MacBeth, shrinkage, rolling test, và Kalman. Đó là tinh thần mang vào chương 4 (regime và structural change), nơi chính giả định "tham số cố định" của cả chương này bị đặt lên bàn mổ.

# Chương 4: Regime và structural change

## Vì sao chương này tồn tại

Có một giả định lặng lẽ nằm dưới gần như mọi thứ bạn học ở Chương 3: rằng các tham số bạn ước lượng — trung bình return, độ biến động, hệ số beta, tốc độ mean-reversion — là những hằng số của tự nhiên, chỉ bị che mờ bởi noise. Bạn lấy nhiều dữ liệu hơn để nhìn xuyên qua noise và tiến gần hơn tới "chân lý". Đây là thế giới quan i.i.d.: mỗi ngày là một lần rút độc lập từ cùng một cái bình.

Thị trường tài chính không hoạt động như vậy. Cái bình bị tráo giữa chừng. Tháng 8/2007 quant quake diễn ra trong ba ngày rồi biến mất. Tháng 9/2008 Lehman sụp và tương quan giữa mọi tài sản chạy về 1 chỉ trong một tuần. Tháng 3/2020 vol S&P nhảy từ 12% lên 82% annualized trong mười phiên. Chu kỳ lãi suất Fed từ 0% (2020) lên 5.25% (2023) đảo ngược lợi nhuận của mọi chiến lược carry và duration đã fit đẹp suốt thập kỷ trước đó. Trong mỗi biến cố này, một mô hình được fit "mượt" trên lịch sử — nghĩa là fit lên trung bình của cả một bình đã trộn lẫn nhiều bình con — trở thành vô dụng, hoặc tệ hơn, dự báo tự tin và sai.

Đây là **regime**: những đoạn thời gian mà quá trình sinh dữ liệu (data-generating process) có tham số ổn định, ngăn cách bởi những **structural break** — điểm mà tham số nhảy sang giá trị mới. Một QR giỏi không hỏi "return kỳ vọng của momentum là bao nhiêu?" mà hỏi "return kỳ vọng của momentum *có điều kiện lên regime hiện tại* là bao nhiêu, và tôi có bao nhiêu độ tin rằng regime hiện tại là cái tôi nghĩ?". Cả chương này là bộ công cụ để trả lời câu hỏi thứ hai: mô hình hóa regime khi bạn biết trước có bao nhiêu (Markov chain), khi bạn không quan sát được regime mà phải suy ra từ return (Hidden Markov Model, Markov-switching), và phát hiện đúng lúc một break vừa xảy ra (changepoint và structural break tests). Kết chương trả lời câu hỏi thực chiến: điều chỉnh vốn, leverage, và tín hiệu theo regime thế nào — và vì sao **vol** là biến regime tốt nhất, dễ nhận biết nhất trên đời.

## Markov chain: bộ xương của mọi mô hình regime

Trước khi regime bị ẩn đi, hãy làm chủ trường hợp regime quan sát được. Giả sử thị trường luôn ở một trong ba trạng thái mà ta gọi tên: **calm** (biến động thấp, drift dương nhẹ), **stress** (biến động cao, drift âm), **crisis** (biến động cực cao, drift âm mạnh). Một **Markov chain** là mô hình đơn giản nhất cho chuỗi trạng thái: xác suất của trạng thái ngày mai chỉ phụ thuộc trạng thái hôm nay, không phụ thuộc quá khứ xa hơn (Markov property). Toàn bộ động lực nằm trong **transition matrix** $P$, với $P_{ij}$ là xác suất chuyển từ regime $i$ sang $j$ trong một bước.

Lấy một ví dụ số cụ thể để làm việc suốt mục này. Ước lượng từ dữ liệu daily S&P (đơn giản hóa nhưng có thứ tự độ lớn thực tế):

$$
P = \begin{pmatrix} 0.97 & 0.02 & 0.01 \\ 0.10 & 0.85 & 0.05 \\ 0.05 & 0.15 & 0.80 \end{pmatrix}
\quad \text{(hàng: từ; cột: đến; thứ tự calm, stress, crisis)}
$$

Đọc ma trận này như một bản đồ. Hàng đầu: khi đang calm, 97% khả năng ngày mai vẫn calm — regime có tính **persistence** cao, đây là đặc điểm định nghĩa của regime tài chính và là lý do chúng đáng để mô hình hóa. Chỉ 1% khả năng nhảy thẳng từ calm sang crisis, phản ánh rằng crash thường "leo thang" qua stress chứ hiếm khi ập tới từ trời quang. Hàng cuối: crisis cũng dính, 80% ở lại, nhưng khi thoát thì hay rơi vào stress (15%) hơn là bật thẳng về calm (5%) — thị trường "chữa lành" từ từ. Mỗi hàng cộng lại đúng bằng 1 vì từ một trạng thái, ngày mai chắc chắn phải rơi vào một trong ba trạng thái; đó là ràng buộc duy nhất một transition matrix phải thỏa (mọi phần tử không âm, mỗi hàng tổng bằng 1 — gọi là ma trận stochastic).

### Stationary distribution: thị trường dành bao nhiêu thời gian ở mỗi regime

Nếu để chain chạy mãi, tỷ lệ thời gian ở mỗi regime hội tụ về **stationary distribution** $\pi$, nghiệm của $\pi P = \pi$ với $\sum_i \pi_i = 1$. Đây là left eigenvector của $P$ ứng với eigenvalue 1. Ta giải bằng tay để thấy nó không phải phép thuật.

Viết ra ba phương trình $\pi P = \pi$ (mỗi cột của $P$ cho một phương trình):

$$
\begin{aligned}
0.97\,\pi_c + 0.10\,\pi_s + 0.05\,\pi_r &= \pi_c \\
0.02\,\pi_c + 0.85\,\pi_s + 0.15\,\pi_r &= \pi_s \\
0.01\,\pi_c + 0.05\,\pi_s + 0.80\,\pi_r &= \pi_r
\end{aligned}
$$

Từ phương trình thứ ba: $0.01\,\pi_c + 0.05\,\pi_s = 0.20\,\pi_r$, suy ra $\pi_r = 0.05\,\pi_c + 0.25\,\pi_s$. Từ phương trình thứ hai: $0.02\,\pi_c + 0.15\,\pi_r = 0.15\,\pi_s$. Thay $\pi_r$ vào: $0.02\,\pi_c + 0.15(0.05\,\pi_c + 0.25\,\pi_s) = 0.15\,\pi_s$, tức $0.0275\,\pi_c + 0.0375\,\pi_s = 0.15\,\pi_s$, cho $\pi_c = \frac{0.1125}{0.0275}\,\pi_s = 4.0909\,\pi_s$. Rồi $\pi_r = 0.05(4.0909\,\pi_s) + 0.25\,\pi_s = 0.4545\,\pi_s$. Chuẩn hóa: $\pi_c + \pi_s + \pi_r = (4.0909 + 1 + 0.4545)\,\pi_s = 5.5455\,\pi_s = 1$, nên $\pi_s = 0.1803$, $\pi_c = 0.7377$, $\pi_r = 0.0820$. (Kiểm tra chéo bằng eigenvector số của $P^\top$ cho đúng $(0.7377,\,0.1803,\,0.0820)$ — phép giải tay khớp hoàn toàn.)

Vậy về dài hạn thị trường dành **73.8% thời gian calm, 18.0% stress, 8.2% crisis**. Con số crisis 8% nghe có vẻ nhiều, nhưng nhớ rằng "crisis" ở đây là trạng thái vol-cực-cao, và nếu bạn đo qua một mẫu dài (1990–2025) thì đúng là một phần đáng kể số ngày rơi vào các đợt như 1998, 2008, 2011, 2020 — vol clustering làm những ngày này dồn cục. Đây là một sanity check đắt giá: nếu bạn fit một mô hình regime và stationary distribution ra 30% crisis, hoặc bạn định nghĩa crisis quá lỏng, hoặc mô hình đang overfit noise thành regime.

### Kỳ vọng thời gian ở mỗi regime: hình học của một biến cố

Persistence có một hệ quả định lượng đẹp. Nếu xác suất ở lại regime $i$ mỗi bước là $p_{ii}$, thì mỗi bước có xác suất $p_{ii}$ ở lại và $1-p_{ii}$ rời đi một cách độc lập, nên số bước liên tục ở regime đó tuân theo phân phối geometric. Kỳ vọng của một biến geometric với xác suất "thành công" (rời đi) bằng $1-p_{ii}$ là $1/(1-p_{ii})$, nên **kỳ vọng độ dài một đợt** (expected sojourn time) là

$$
E[\text{độ dài đợt } i] = \frac{1}{1 - p_{ii}}.
$$

Với calm, $1/(1-0.97) = 33.3$ ngày. Với stress, $1/(1-0.85) = 6.7$ ngày. Với crisis, $1/(1-0.80) = 5.0$ ngày. Đọc ra: một đợt bình yên trung bình kéo dài khoảng một tháng rưỡi giao dịch, còn crisis trung bình chỉ năm ngày — ngắn, dữ dội, rồi tan. Con số này ngay lập tức cho bạn một tham số vận hành: nếu bạn de-risk khi vào crisis, bạn nên kỳ vọng giữ trạng thái phòng thủ khoảng một tuần, không phải một quý; ai cắt hết vị thế rồi ngồi ngoài ba tháng sẽ bỏ lỡ cú hồi phục V-shape luôn theo sau crisis (nghĩ tháng 4/2020).

Muốn biết chi tiết hơn — chẳng hạn từ calm, trung bình bao nhiêu ngày *cho tới lần đầu* chạm crisis (mean first-passage time) — ta giải hệ tuyến tính. Đặt $m_i$ là số bước kỳ vọng từ trạng thái $i$ tới khi lần đầu chạm crisis, với $m_r = 0$ (đã tới đích). Mỗi bước tốn một đơn vị thời gian rồi chuyển sang trạng thái kế tiếp theo $P$, nên:

$$
m_c = 1 + 0.97\,m_c + 0.02\,m_s, \qquad m_s = 1 + 0.10\,m_c + 0.85\,m_s.
$$

Từ phương trình hai: $0.15\,m_s = 1 + 0.10\,m_c$, nên $m_s = 6.667 + 0.667\,m_c$. Thay vào một: $0.03\,m_c = 1 + 0.02(6.667 + 0.667\,m_c) = 1.1333 + 0.01333\,m_c$, cho $m_c = 1.1333/0.01667 = 68.0$ ngày (và tiện thể $m_s = 52.0$ ngày). Nghĩa là xuất phát từ một ngày calm điển hình, trung bình phải chờ khoảng ba tháng rưỡi giao dịch mới gặp ngày crisis đầu tiên. Crisis hiếm khi nhìn thấy từ bên trong calm; đó chính là lý do nó luôn "bất ngờ". Và để ý sự bất đối xứng: đợt crisis chỉ kéo dài 5 ngày nhưng khoảng cách trung bình giữa hai lần chạm crisis lại là hàng chục ngày — hiếm về tần suất, nhưng khi tới thì tập trung và tàn khốc, đúng bản chất của rủi ro đuôi.

## Hidden Markov Model: khi regime là ẩn

Vấn đề thực tế là **không ai gắn nhãn regime cho bạn**. Bạn quan sát returns, không quan sát "hôm nay là stress hay calm". Regime là biến ẩn (latent state); return là quan sát (observation) mà regime sinh ra. Đây chính là cấu trúc của một **Hidden Markov Model (HMM)**: một Markov chain ẩn với transition matrix $P$, cộng thêm một **emission distribution** cho mỗi state — phân phối của quan sát khi ở state đó.

Với thị trường equity, lựa chọn kinh điển là emission Gaussian: ở regime $k$, daily return phân phối $\mathcal{N}(\mu_k, \sigma_k^2)$. Regime khác nhau ở cả mean và variance nhưng khác nhau *nhiều nhất* ở variance — đây là chìa khóa và ta sẽ quay lại. Một mô hình ba-regime điển hình fit trên S&P daily cho ra emission gần như thế này:

| Regime | $\mu$ (bps/ngày) | $\sigma$ (%/ngày) | $\sigma$ annualized |
|---|---|---|---|
| Bull (calm) | +5 | 0.7 | 11.1% |
| Bear/stress | −8 | 1.5 | 23.8% |
| Crisis | −25 | 3.5 | 55.6% |

(Annualize bằng $\sigma_{\text{năm}} = \sigma_{\text{ngày}}\sqrt{252}$: ví dụ $0.7\%\times\sqrt{252} = 0.7\times15.87 = 11.1\%$, và $3.5\%\times15.87 = 55.6\%$.) Nhìn bảng này bạn thấy vì sao HMM "nhìn thấy" điều mắt thường bỏ lỡ. Một return $-2\%$ trong một ngày là hoàn toàn bình thường ở regime crisis ($-2\%$ chỉ cách mean crisis $|-2 + 0.25|/3.5 = 0.5\sigma$, tức trong tầm dao động thường ngày), nhưng là biến cố $|-2-0.05|/0.7 = 2.93\sigma$ ở regime bull — cực hiếm (xác suất một đuôi cỡ $0.17\%$). HMM dùng chính độ "bất thường" này, cộng với persistence của chain, để suy ra state.

### Filtering: suy ra regime hiện tại từ quan sát

Giả sử ta đã biết $P$, $\mu_k$, $\sigma_k$ (fit sau). Câu hỏi vận hành mỗi sáng là: cho chuỗi return đến hôm nay, xác suất tôi đang ở mỗi regime là bao nhiêu? Đây là **filtering**, tính bằng **forward algorithm** — đúng cái mà `forwardFilter` trong module `hmm` của src/alpha trả về.

Làm một bước bằng tay để mất hết vẻ huyền bí. Giả sử hôm qua niềm tin của ta là $\hat\pi = (0.80, 0.15, 0.05)$ (nghiêng calm). Hôm nay ta quan sát return $r = -2.0\%$. Hai bước:

**Bước 1 — predict (đẩy niềm tin qua transition matrix):** niềm tin *trước khi* nhìn return hôm nay là $\hat\pi P$. Tính cột calm: $0.80(0.97) + 0.15(0.10) + 0.05(0.05) = 0.776 + 0.015 + 0.0025 = 0.7935$. Cột stress: $0.80(0.02) + 0.15(0.85) + 0.05(0.15) = 0.016 + 0.1275 + 0.0075 = 0.151$. Cột crisis: $0.80(0.01) + 0.15(0.05) + 0.05(0.80) = 0.008 + 0.0075 + 0.04 = 0.0555$. Vậy prior hôm nay $= (0.7935, 0.151, 0.0555)$. Persistence của chain vừa kéo niềm tin về phía calm một chút (chưa nhìn return nào cả, chỉ vì hôm qua nghiêng calm và calm thì dính).

**Bước 2 — update (nhân với likelihood của return quan sát):** tính density Gaussian của $r=-2\%$ dưới mỗi regime. Vì chuẩn hóa sẽ khử mọi hằng số chung, ta chỉ cần phần tỷ lệ $\frac{1}{\sigma}e^{-z^2/2}$ với $z=(r-\mu)/\sigma$. Với bull ($\mu=+0.05\%$, $\sigma=0.7\%$): $z = -2.93$, density $\propto \frac{1}{0.7}e^{-2.93^2/2} = 1.429 \times e^{-4.29} = 1.429\times0.0137 = 0.0196$. Với stress ($\mu=-0.08\%$, $\sigma=1.5\%$): $z=-1.28$, density $\propto \frac{1}{1.5}e^{-0.819}=0.667\times0.441=0.294$. Với crisis ($\mu=-0.25\%$, $\sigma=3.5\%$): $z=-0.50$, density $\propto \frac{1}{3.5}e^{-0.125}=0.286\times0.883=0.252$.

Nhân prior với likelihood: bull $0.7935 \times 0.0196 = 0.01556$; stress $0.151 \times 0.294 = 0.04437$; crisis $0.0555 \times 0.252 = 0.01399$. Chuẩn hóa (tổng $= 0.07393$): $\hat\pi_{\text{mới}} = (0.210, 0.600, 0.189)$.

Một return $-2\%$ đã kéo niềm tin từ 80% calm xuống 21% calm, và đẩy stress từ 15% lên 60%. Nhưng để ý ba điều tinh tế. Thứ nhất, niềm tin *không* nhảy thẳng sang 100% stress dù $-2\%$ thoạt nhìn "trông giống bear" — persistence của prior neo nó lại. Thứ hai, dù density của stress (0.294) và crisis (0.252) suýt soát nhau (một $-2\%$ hợp với cả hai regime "xấu"), posterior của crisis vẫn thấp hơn hẳn (18.9% vs 60%) vì prior của crisis quá mỏng (5.55%) — bằng chứng một ngày chưa đủ vượt qua tiền định persistence rằng crisis hiếm. Thứ ba, chính cơ chế "prior neo lại" này khiến HMM ổn định hơn nhiều so với việc phân loại regime bằng một cửa sổ vol trượt đơn thuần, vốn giật cục theo từng return lớn: nó cần *vài* ngày xấu liên tiếp mới chịu chuyển hẳn sang stress, đúng như trực giác thị trường mách bảo — một cú $-2\%$ đơn lẻ giữa một chuỗi calm thường chỉ là noise, phải có xác nhận mới đáng đổi tư thế.

### Baum-Welch: học tham số khi chẳng có nhãn nào

Ở trên ta giả vờ đã biết $P$ và các emission. Thực tế phải học chúng từ chuỗi return trần trụi, không nhãn. Đây là bài toán mà **Baum-Welch algorithm** — một trường hợp riêng của **EM (Expectation-Maximization)** — giải, và là lõi của `fitGaussianHmm`. Trực giác EM là vòng lặp gà-và-trứng: nếu biết state ở mỗi ngày thì ước lượng tham số dễ (chỉ là lấy trung bình return trong những ngày cùng state); nếu biết tham số thì suy ra phân phối state dễ (forward-backward). Không biết cái nào, nên ta lặp:

**E-step:** với tham số hiện tại, chạy forward-backward để tính $\gamma_t(k) = P(\text{state}_t = k \mid \text{toàn bộ chuỗi})$ — trách nhiệm (responsibility) mềm của state $k$ cho quan sát $t$ — và $\xi_t(j,k)$, xác suất chuyển đồng thời $j\to k$ tại bước $t$. Forward pass dùng thông tin *tới* $t$; backward pass thêm thông tin *sau* $t$, nên $\gamma$ là smoothing (dùng cả tương lai), khác filtering ở trên (chỉ dùng quá khứ). Sự khác biệt này quan trọng khi diễn giải: một ngày $-2\%$ mà *sau đó* thị trường hồi ngay thì smoothing sẽ gán nó về calm (chỉ là noise), trong khi filtering real-time lúc đó đã tưởng là stress — bạn không có được đặc quyền nhìn tương lai này khi giao dịch thật.

**M-step:** cập nhật tham số như trung bình có trọng số bằng responsibility. Mean mới của regime $k$ là

$$
\mu_k^{\text{mới}} = \frac{\sum_t \gamma_t(k)\, r_t}{\sum_t \gamma_t(k)},
$$

đúng là "trung bình return, mỗi ngày cân theo mức độ ta tin ngày đó thuộc regime $k$". Variance cập nhật tương tự với $(r_t - \mu_k)^2$ làm giá trị được cân. Transition cập nhật là $P_{jk}^{\text{mới}} = \frac{\sum_t \xi_t(j,k)}{\sum_t \gamma_t(j)}$ — tỷ lệ số lần (mềm) chuyển $j\to k$ trên số lần (mềm) ở $j$.

Ví dụ số cho M-step một regime. Giả sử sau E-step, trên 5 ngày cuối, responsibility crisis $\gamma(\text{crisis}) = (0.1, 0.6, 0.95, 0.9, 0.3)$ và returns $(-1.0, -3.0, -4.5, -3.8, -1.2)\%$. Tử số $\mu$: $0.1(-1.0)+0.6(-3.0)+0.95(-4.5)+0.9(-3.8)+0.3(-1.2) = -0.1-1.8-4.275-3.42-0.36 = -9.955$. Mẫu số: $0.1+0.6+0.95+0.9+0.3 = 2.85$. Vậy $\mu_{\text{crisis}}^{\text{mới}} = -9.955/2.85 = -3.49\%$. Những ngày mà mô hình tin chắc là crisis (return $-4.5$ với $\gamma=0.95$, $-3.8$ với $\gamma=0.9$) đóng góp gần trọn, ngày mơ hồ ($-1.0$ với responsibility 0.1) gần như bị bỏ qua — mà đúng ra phải thế, vì một ngày chỉ giảm $1\%$ khó lòng là ngày crisis thật. So sánh nhanh: nếu ta ngây thơ lấy trung bình đơn giản cả năm return thì được $-2.70\%$, kém âm hơn nhiều — chính trọng số mềm đã kéo ước lượng crisis về đúng những ngày thực sự thảm khốc. Đó là toàn bộ ma thuật của EM: mỗi vòng, tham số được kéo về phía dữ liệu mà nó "sở hữu", làm log-likelihood tăng đơn điệu cho tới khi hội tụ (module dừng khi thay đổi log-likelihood dưới tolerance).

Hai cạm bẫy thực chiến. Thứ nhất, EM chỉ đảm bảo tìm **local optimum**; khởi tạo khác nhau ra mô hình khác nhau, nên trong thực tế người ta chạy nhiều seed rồi giữ log-likelihood cao nhất (module cho tham số `seed` và khởi tạo mean theo percentile của dữ liệu chính vì lý do này — đặt sẵn ba mean gần các phân vị thấp/giữa/cao để mỗi regime "sinh ra" gần đúng chỗ của nó). Thứ hai, **label switching**: nhãn "regime 0/1/2" là tùy tiện, EM có thể đặt crisis thành regime 0 lần này, regime 2 lần khác. Luôn sắp lại theo một quy ước cố định — thường là theo $\sigma$ tăng dần — trước khi diễn giải, nếu không bạn sẽ so sánh táo với cam giữa các lần fit.

### Viterbi: con đường regime khả dĩ nhất

Filtering và smoothing cho *phân phối* state ở mỗi thời điểm rời rạc. Đôi khi bạn cần một câu chuyện mạch lạc: chuỗi state *duy nhất* khả dĩ nhất giải thích toàn bộ quan sát. Đó là **Viterbi algorithm** (`viterbi` trong module), một quy hoạch động chạy trong không gian log để tránh underflow (nhân hàng nghìn xác suất nhỏ sẽ tràn về 0 nếu không lấy log).

Trực giác: gọi $V_t(k)$ là log-xác suất của con đường tốt nhất kết thúc ở state $k$ tại thời điểm $t$. Đệ quy $V_t(k) = \log(\text{emission}_t(k)) + \max_j [V_{t-1}(j) + \log P_{jk}]$ — con đường tốt nhất đến $k$ là con đường tốt nhất đến một $j$ nào đó ở bước trước, cộng chi phí chuyển $j\to k$, cộng độ khớp emission hôm nay. Lưu lại $j$ đạt max (backpointer), rồi khi tới cuối chuỗi, lần ngược backpointers để lấy đường tối ưu.

Chạy một bước bằng số để thấy backpointer làm gì. Dùng emission table ở trên và giả sử ở $t-1$ ta đã có (theo đơn vị log tự nhiên) $V_{t-1} = (\log 0.5,\ \log 0.3,\ \log 0.05) = (-0.69, -1.20, -3.00)$ cho (calm, stress, crisis). Hôm nay quan sát $r=-2\%$, emission log-density (dùng đúng ba density $0.0196,\ 0.294,\ 0.252$ ở trên): $\log = (-3.93, -1.22, -1.38)$. Tính $V_t(\text{stress})$: ta so ba đường vào stress, $V_{t-1}(j) + \log P_{j,\text{stress}}$ với cột stress của $P$ là $(0.02, 0.85, 0.15)$, tức $\log P = (-3.91, -0.163, -1.90)$. Ba ứng viên: từ calm $-0.69-3.91=-4.60$; từ stress $-1.20-0.163=-1.36$; từ crisis $-3.00-1.90=-4.90$. Max là $-1.36$ (đến từ stress), nên $V_t(\text{stress}) = -1.22 + (-1.36) = -2.58$, và backpointer của stress trỏ về stress. Con đường tối ưu "muốn" ở lại stress vì tự-chuyển stress→stress rẻ hơn nhiều mọi cú nhảy khác — chính transition cost này khâu các state thành một quỹ đạo liền mạch thay vì nhảy loạn theo từng return.

Điểm phân biệt tinh tế mà nhiều người bỏ qua: Viterbi cho chuỗi *chung* khả dĩ nhất, không phải chuỗi các state khả dĩ nhất từng thời điểm. Hai cái này khác nhau. Chuỗi smoothing "argmax mỗi ngày" có thể chứa một bước chuyển $j\to k$ mà $P_{jk}=0$ — tức bất khả thi như một câu chuyện liền mạch — trong khi Viterbi tôn trọng transition nên luôn ra một quỹ đạo hợp lệ. Với việc gán nhãn regime lịch sử để nghiên cứu (kiểu "đợt bear này bắt đầu ngày nào"), Viterbi là công cụ đúng vì nó cho ranh giới sắc nét; với việc size vị thế real-time, filtering probability là công cụ đúng vì bạn muốn dùng cả sự bất định, không ép về một nhãn cứng.

## Markov-switching model của Hamilton: khi cả hệ số hồi quy cũng đổi regime

HMM ở trên chuyển regime cho *phân phối marginal* của return. Hamilton (1989) tổng quát hóa thành **Markov-switching model**: các *hệ số của một mô hình động* — mean, autoregressive coefficient, variance — tự chúng đổi theo một regime ẩn Markov. Đây là công cụ kinh điển của macro-finance để tách chu kỳ kinh tế (expansion vs recession) từ chuỗi GDP hay lãi suất.

Dạng đơn giản nhất, một MS-mean model bậc AR(1):

$$
r_t = \mu_{s_t} + \phi_{s_t}\,(r_{t-1} - \mu_{s_{t-1}}) + \sigma_{s_t}\,\varepsilon_t, \qquad s_t \in \{1,\dots,K\} \text{ theo Markov chain } P.
$$

Điểm mới so với HMM thuần: mỗi regime có cả một tốc độ mean-reversion $\phi_{s_t}$ riêng, không chỉ mean và vol. Với một quá trình AR(1), một cú lệch khỏi mean co lại theo hệ số $\phi$ mỗi bước, nên **half-life** (số bước để cú lệch giảm còn một nửa) là nghiệm của $\phi^h = \tfrac12$, tức $h = \ln 2 / (-\ln \phi)$; khi $\phi$ gần 1 thì $-\ln\phi \approx 1-\phi$ nên xấp xỉ tiện dùng là $h \approx \ln 2/(1-\phi)$. Điều này khớp trực giác thị trường sâu sắc. Ví dụ số minh họa: fit MS-AR(1) lên chuỗi spread của một cặp pairs trade cho hai regime.

- Regime "cointegrated" với $\phi_1 = 0.95$: half-life $\approx \ln 2/(1-0.95) = 0.693/0.05 = 13.9$ ngày (công thức chính xác $\ln 2/(-\ln 0.95) = 13.5$ ngày cho gần như cùng con số). Con số này khớp running example pairs của chúng ta — một OU với $\kappa \approx 0.05$/ngày cũng cho half-life $\ln 2/\kappa \approx 13.9$ ngày. Spread hồi về mean nhanh; đặt cược mean-reversion sinh lời.
- Regime "broken" với $\phi_2 = 0.999$: half-life $\approx \ln 2/(1-0.999) = 693$ ngày — gần như random walk. Spread đã ngừng hồi quy; cointegration đã gãy.

Một pairs trader mù regime sẽ tiếp tục đặt cược mean-reversion trong regime broken và bị phá sản khi spread trôi mãi không về; MS model cho anh ta xác suất real-time rằng cặp đã rơi vào regime broken — tín hiệu để cắt lỗ và ngừng vào lệnh mới. Đây là ứng dụng đắt giá nhất của regime trong stat-arb: không phải để dự báo spread về đâu, mà để biết *khi nào ngừng tin vào chính mô hình mean-reversion của mình*.

Ước lượng MS model dùng cùng bộ máy filter Hamilton — một forward pass gần giống HMM: mỗi bước, ta đẩy phân phối regime qua $P$ (predict), rồi cân lại bằng likelihood của $r_t$ dưới *mô hình AR có điều kiện lên regime* thay vì chỉ một Gaussian marginal (update). Vòng filter đó lồng trong EM hoặc maximum likelihood trực tiếp. Vì cơ học từng bước trùng với phần filtering HMM ta đã tính tay ở trên (chỉ khác chỗ likelihood bây giờ phụ thuộc cả $r_{t-1}$ qua số hạng $\phi(r_{t-1}-\mu)$), ta không lặp lại số học; điều đáng ghi nhớ là **cùng một khung** — chain ẩn Markov cộng emission có điều kiện lên state — bao trọn cả regime của phân phối return (HMM) lẫn regime của cả một mô hình động (Hamilton). Khi nghe "regime-switching GARCH", "regime-switching beta", "regime-switching factor loading", đó đều là biến thể: lấy một mô hình bạn tin ở Chương 3, cho hệ số của nó nhảy theo một chain ẩn.

## Changepoint detection: bắt break đúng lúc nó xảy ra

HMM và MS giả định bạn biết *có bao nhiêu* regime và học tham số của chúng trên toàn mẫu — một góc nhìn hồi cứu. Bài toán bổ sung, và cấp bách hơn về mặt vận hành, là **online**: một break vừa xảy ra *ngay bây giờ*, và tôi cần phát tín hiệu càng sớm càng tốt mà không báo động giả liên tục. Đây là **changepoint detection**.

### CUSUM: cỗ máy tích lũy lệch

Công cụ cổ điển và vẫn hiệu quả nhất là **CUSUM (cumulative sum)** — chính là `cusumEvents` trong module `structural`. Ý tưởng: tích lũy độ lệch của quan sát so với một baseline; chừng nào quá trình chạy quanh baseline, tổng tích lũy dao động quanh 0 nhờ được reset ở biên; khi mean dịch chuyển, tổng bắt đầu drift đều một hướng và vượt ngưỡng, kích hoạt event. Công thức two-sided (bắt cả dịch lên và xuống) với drift allowance $\delta$ và threshold $h$:

$$
S_t^+ = \max(0,\; S_{t-1}^+ + (x_t - x_{t-1}) - \delta), \qquad S_t^- = \min(0,\; S_{t-1}^- + (x_t - x_{t-1}) + \delta),
$$

báo event khi $S_t^+ > h$ hoặc $S_t^- < -h$, rồi reset về 0. Số hạng $-\delta$ là "phí trượt": mỗi bước ta trừ bớt $\delta$ để tổng không tự phình lên chỉ vì noise cùng dấu ngẫu nhiên; chỉ một drift thực sự lớn hơn $\delta$ mỗi bước mới thắng được phí này và tích lũy tới $h$.

Chạy một ví dụ số. Giả sử ta theo dõi một chuỗi mà độ tăng bình thường là 0 (đã trừ drift, $\delta=0$), threshold $h=3$ (đơn vị: cùng đơn vị với $x$, ví dụ vol điểm phần trăm annualized). Chuỗi thay đổi từng bước $(x_t - x_{t-1})$: $+0.5, -0.3, +0.4, -0.2, +1.2, +1.5, +1.1, +0.8$ — bốn bước đầu là noise quanh 0, rồi từ bước 5 một break làm chuỗi drift lên đều. Tích lũy $S^+$ (mỗi bước lấy $\max(0,\ S^+_{\text{trước}} + \text{bước})$): $0.5,\ 0.2,\ 0.6,\ 0.4,\ 1.6,\ 3.1,\ (4.2),\ (5.0)$. Ở bước thứ sáu $S^+ = 3.1 > 3$ → **event tại $t=6$**, tức CUSUM phát hiện break chỉ hai bước sau khi drift thật bắt đầu (bước 5). Bốn bước noise đầu không bao giờ đẩy $S^+$ vượt 0.6 vì các bước âm liên tục kéo nó xuống và biên $\max(0,\cdot)$ chặn nó không cho tích lũy noise thành báo động giả — để ý bước 2 và bước 4, $S^+$ bị các bước âm $-0.3$ và $-0.2$ gặm bớt ngay, đúng cơ chế "reset ở biên" giữ CUSUM khỏi trôi vô cớ.

Đây là đặc tính quý của CUSUM: nó nhạy với **thay đổi bền vững, nhỏ** (mà một z-score một-điểm sẽ bỏ lỡ vì mỗi bước $+1.2$ hay $+1.5$ riêng lẻ chưa đủ dramatic) nhưng bền với noise nhất thời (mà một ngưỡng đơn giản sẽ báo giả). Đánh đổi nằm ở cặp $(\delta, h)$: $h$ nhỏ → phát hiện nhanh nhưng nhiều false alarm; $h$ lớn → ít báo giả nhưng chậm. Trong AFML, CUSUM filter được dùng theo cách hơi khác — như một **event-based sampler** để chỉ lấy mẫu bar khi có biến động tích lũy đáng kể, tạo tập sự kiện cho triple-barrier labeling (Chương 10) — nhưng cơ học tích lũy-và-reset là một.

### Bayesian online changepoint: phân phối thay vì báo động

CUSUM cho một tín hiệu nhị phân "break/không break". **Bayesian Online Changepoint Detection (BOCPD)** cho nhiều thông tin hơn: nó duy trì, ở mỗi thời điểm, một *phân phối* trên **run length** $r_t$ — số bước đã trôi qua kể từ changepoint gần nhất. $r_t = 0$ nghĩa "break vừa xảy ra"; $r_t$ lớn nghĩa "chế độ hiện tại đã ổn định lâu".

Cơ chế đệ quy: mỗi bước, khối lượng xác suất ở mỗi run length hoặc **tăng thêm 1** (không có break, với hazard rate $H$ là xác suất tiên nghiệm một break xảy ra ở bước này) hoặc **reset về 0** (break). Cụ thể, phần "tiếp tục run" $P(r_t = r_{t-1}+1) \propto P(r_{t-1}) \cdot (1-H) \cdot \pi(x_t \mid \text{dữ liệu của run hiện tại})$ và khối reset $P(r_t=0) \propto \sum_{r} P(r_{t-1}=r) \cdot H \cdot \pi(x_t \mid \text{prior mới})$, trong đó $\pi$ là predictive likelihood — xác suất của quan sát mới cho trước những gì run hiện tại đã dạy ta (dùng conjugate prior, ví dụ Normal-Gamma cho dữ liệu Gaussian, để có dạng đóng, không phải tích phân số).

Ví dụ số về hazard. Với hazard rate cố định $H = 1/200$ (kỳ vọng một break mỗi 200 ngày, hợp lý cho regime equity), xác suất tiên nghiệm không có break trong một năm giao dịch ($\approx 252$ ngày) là $(1 - 1/200)^{252} = 0.995^{252} = e^{252 \ln 0.995} = e^{-1.263} = 0.283$ — chỉ 28% khả năng một năm trôi qua không đứt gãy nào, khớp thực tế rằng mỗi năm thị trường thường có ít nhất một cú regime shift.

Ví dụ số về cơ chế "sập run length". Giả sử run hiện tại đã dài, khối lượng xác suất dồn ở $r=40$ với $P(r_{t-1}=40)=0.8$, và run này đã học được rằng vol thường ngày cỡ $\sigma=1\%$. Đến một ngày $x_t = -6\%$. Predictive likelihood dưới run hiện tại (một $-6\%$ là biến cố $6\sigma$) cực nhỏ, cỡ $\pi_{\text{cont}} \approx \frac{1}{1}e^{-6^2/2}=e^{-18}\approx 1.5\times10^{-8}$; còn predictive dưới "prior mới" (chưa cam kết vol nào, phân phối rộng hơn nhiều, giả sử $\sigma_0=4\%$) cho $\pi_{\text{new}} \approx \frac{1}{4}e^{-(6/4)^2/2}=0.25\,e^{-1.125}=0.081$. So hai khối: tiếp tục run $\propto 0.8\times(1-\tfrac1{200})\times1.5\times10^{-8}\approx 1.2\times10^{-8}$; reset $\propto (\text{tổng }1.0)\times\tfrac1{200}\times0.081 = 4.05\times10^{-4}$. Reset thắng áp đảo (gấp hơn ba vạn lần), nên sau chuẩn hóa gần như toàn bộ khối lượng dồn về $r_t=0$ — bạn thấy break bằng cách nhìn phân phối run length "sập" từ 40 về 0 trong một bước. Ưu điểm so với CUSUM: BOCPD cho độ bất định (bạn biết mình *tin bao nhiêu* rằng vừa có break, không chỉ có/không), tự nhiên xử lý nhiều break nối tiếp, và không cần chọn threshold cứng — chỉ cần đặt hazard rate, vốn có diễn giải xác suất trực tiếp ("tôi kỳ vọng bao lâu một break").

## Structural break tests: hồi cứu, có ý nghĩa thống kê

Changepoint online trả lời "có break *ngay bây giờ* không?". **Structural break tests** trả lời câu hỏi hồi cứu, mang tính suy diễn thống kê: "trên toàn mẫu lịch sử này, hệ số hồi quy của tôi có ổn định không, hay có bằng chứng vượt ngưỡng ý nghĩa rằng nó đã đứt gãy tại một hay nhiều điểm?". Đây là ngôn ngữ của econometrics và là thứ bạn cần khi bảo vệ một backtest trước rủi ro "tham số đã đổi giữa in-sample và tương lai".

### Chow test: break tại một điểm đã biết

**Chow test** kiểm định giả thuyết rằng các hệ số của một mô hình hồi quy giống nhau ở hai đoạn con, cho trước một điểm chia $\tau$ đã biết. Trực giác: fit mô hình một lần trên toàn mẫu (restricted, giả định không break) và fit riêng trên hai đoạn (unrestricted, cho phép break). Nếu cho phép break *giảm đáng kể* tổng bình phương phần dư, mô hình một-tham-số đã bỏ sót một break. Thống kê là một F-test:

$$
F = \frac{(RSS_R - RSS_U)/k}{RSS_U/(n - 2k)},
$$

với $RSS_R$ là residual sum of squares của mô hình gộp, $RSS_U = RSS_1 + RSS_2$ tổng của hai đoạn, $k$ số tham số mỗi đoạn, $n$ tổng quan sát. Tử số đo "RSS tiết kiệm được nhờ cho break, chia cho số tham số thêm vào"; mẫu số là variance phần dư ước lượng — nên $F$ lớn nghĩa cải thiện vượt xa mức noise thông thường có thể giải thích.

Ví dụ số. Fit CAPM $r_i = \alpha + \beta r_m + \varepsilon$ ($k=2$: alpha và beta) cho một cổ phiếu tech quanh nghi vấn beta đã tăng sau một biến cố (ví dụ chuyển sang mô hình kinh doanh rủi ro hơn). Toàn mẫu $n = 240$ tháng, $RSS_R = 0.180$. Chia tại $\tau$: đoạn 1 (120 tháng, beta cũ) $RSS_1 = 0.070$, đoạn 2 (120 tháng, beta mới cao hơn) $RSS_2 = 0.075$, nên $RSS_U = 0.145$. Tính từng phần: tử số $= (0.180 - 0.145)/2 = 0.0175$; mẫu số $= 0.145/(240 - 4) = 0.145/236 = 0.000614$; vậy $F = 0.0175/0.000614 = 28.5$. Với $(2, 236)$ bậc tự do, critical value 1% $\approx 4.70$; $F=28.5$ vượt xa, ta **bác bỏ giả thuyết ổn định** — beta đã đứt gãy tại $\tau$ với ý nghĩa cao. Cắt nghĩa: $RSS$ giảm từ 0.180 xuống 0.145 (giảm 19%) là quá lớn để đổ cho may rủi khi chỉ thêm hai tham số. Hạn chế chí mạng của Chow: bạn phải *biết trước* $\tau$. Chọn $\tau$ bằng cách nhìn dữ liệu rồi test tại chính điểm nhìn thấy là một dạng data-snooping làm hỏng phân phối null — cùng loại tội với việc chọn threshold sau khi thấy kết quả backtest.

### Bai-Perron: nhiều break, chưa biết ở đâu

**Bai-Perron (1998, 2003)** giải đúng bài toán khó mà Chow né: ước lượng *đồng thời số lượng và vị trí* của nhiều break chưa biết. Cơ chế: với mỗi số break $m$ cho trước, tìm bộ vị trí $(\tau_1,\dots,\tau_m)$ tối thiểu hóa tổng $RSS$ trên $m+1$ đoạn — giải hiệu quả bằng quy hoạch động (chi phí $O(n^2)$ chứ không vét cạn $\binom{n}{m}$ tổ hợp) — rồi chọn $m$ tối ưu bằng một tiêu chí phạt độ phức tạp (BIC, hoặc sequential test $\sup F(\ell+1 \mid \ell)$ kiểm định "có $\ell+1$ break so với $\ell$").

Ví dụ số chọn $m$ bằng BIC. Fit mean của lãi suất 10-year Treasury yield, $n=600$ tháng, với $\sigma^2$ residual chuẩn hóa. Giả sử $RSS$ tối ưu theo số break: $m=0$: 12.0; $m=1$: 8.5; $m=2$: 6.2; $m=3$: 5.9. Dùng $\text{BIC} = n\ln(RSS/n) + (\text{số tham số})\ln n$; số tham số $= (m+1)$ mean cộng $m$ vị trí break $= 2m+1$, và $\ln 600 = 6.397$. Tính từng $m$:

- $m=0$: $600\ln(12/600) + 1(6.397) = 600(-3.912) + 6.4 = -2347.2 + 6.4 = -2340.8$.
- $m=1$: $600\ln(8.5/600) + 3(6.397) = 600(-4.257) + 19.2 = -2554.1 + 19.2 = -2534.9$.
- $m=2$: $600\ln(6.2/600) + 5(6.397) = 600(-4.572) + 32.0 = -2743.4 + 32.0 = -2711.4$.
- $m=3$: $600\ln(5.9/600) + 7(6.397) = 600(-4.621) + 44.8 = -2773.2 + 44.8 = -2728.4$.

BIC vẫn giảm nhẹ từ $m=2$ ($-2711.4$) sang $m=3$ ($-2728.4$), tức về mặt số học $m=3$ thắng — nhưng cải thiện $RSS$ đã cạn kiệt (6.2→5.9, chỉ $-5\%$) trong khi từ $m=1$ sang $m=2$ nó rơi mạnh (8.5→6.2, $-27\%$). Đường cong RSS "gãy khuỷu" rõ ở $m=2$: đó là dấu hiệu kinh điển rằng break thứ ba đang bắt đầu vét noise. Tùy khẩu vị phạt (BIC nhẹ tay thì chọn 3, thêm một hình phạt bảo thủ hoặc dùng sequential $\sup F$ thì dừng ở 2), ta chốt **hai hoặc ba break** — đúng số lần chế độ chính sách tiền tệ thực sự đổi trên chuỗi yield dài (ví dụ Volcker disinflation, ZIRP 2008, lift-off 2015/22). Bai-Perron là công cụ chuẩn khi bạn cần một câu trả lời có ý nghĩa thống kê cho "chuỗi này đã đứt gãy mấy lần và ở đâu", thay vì mắt thường vẽ đường thẳng qua đồ thị.

Một họ hàng gần mà src/alpha có sẵn (`sadfStatistic`, `bsadfSeries` trong `structural`) là **SADF/BSADF của Phillips-Shi-Yu**: thay vì test break của mean, chúng chạy ADF test (Chương 3) trên mọi cửa sổ con và lấy supremum để phát hiện *bubble* — đoạn mà giá chuyển từ mean-reverting sang explosive. Cùng tinh thần "quét mọi cửa sổ tìm điểm cấu trúc đổi", nhưng nhắm vào tính bùng nổ chứ không phải dịch mức.

## Vì sao vol là biến regime tốt nhất — và ứng dụng

Ta đã có bốn cách nhìn regime. Câu hỏi thực chiến cuối cùng: **dùng biến nào để định nghĩa regime, và làm gì khi biết mình đang ở regime nào?**

Câu trả lời cho vế đầu, được lặp lại trong mọi pod shop: **volatility**. Ba lý do khiến vol thắng mọi ứng viên khác (return dự báo, macro indicator, sentiment).

Thứ nhất, **vol có persistence và dễ đo, còn return thì không**. Chương 3 đã cho ta GARCH(1,1) với $\alpha+\beta = 0.98$ và half-life $\approx 34$ ngày — vol hôm nay dự báo vol ngày mai với độ chính xác thật (autocorrelation của $r_t^2$ dương và tắt chậm), trong khi return có autocorrelation gần 0 ở tần suất ngày. Regime chỉ hữu ích nếu *persistent* — bạn cần thời gian để phản ứng; một "regime" đảo mỗi ngày thì vô dụng vì đến lúc bạn nhận ra thì nó đã đổi. Vol thỏa (đợt vol cao dính hàng tuần), return không. Đây là lý do sâu xa: một biến regime tốt phải là biến mà "hôm nay giống hôm qua" — và vol clustering đúng là hiện tượng đó.

Thứ hai, **vol regime có ý nghĩa nhân quả cho P&L của bạn**, không chỉ tương quan. Ở high-vol regime: tương quan cross-sectional tăng vọt (mọi thứ rơi cùng nhau, diversification bốc hơi đúng lúc cần nhất — correlation trung bình cặp cổ phiếu S&P nhảy từ ~0.15 lúc calm lên ~0.55 trong crash), market impact tăng (thanh khoản rút, xem Chương 12–13), tail risk béo lên, và — quan trọng nhất — hầu hết alpha long-short đảo hành vi (momentum crash trong recovery, mean-reversion trở nên nguy hiểm vì trend mạnh). Vậy biết vol regime cho bạn thông tin *hành động được* về cả rủi ro lẫn kỳ vọng return của chính chiến lược mình.

Thứ ba, **vol quan sát được gần như real-time** qua realized vol (từ intraday, sẵn ngay cuối phiên), qua VIX (implied, forward-looking, là "giá thị trường của regime"), hay qua filtering của HMM/GARCH. Return kỳ vọng thì bạn phải *ước lượng* với sai số khổng lồ (Chương 5 sẽ cho thấy sai số ước lượng mean lấn át mọi thứ: cần hàng chục năm dữ liệu để tách mean khỏi noise, trong khi vài tháng đủ để ước lượng vol chấp nhận được). Bạn không bao giờ chắc mean đang là bao nhiêu; bạn khá chắc vol đang là bao nhiêu.

Với vế "làm gì", nguyên tắc trung tâm là **vol targeting / regime scaling**. Nếu mục tiêu là chạy danh mục ở vol không đổi $\sigma_{\text{target}}$ (giả sử 10% annualized), thì leverage phải tỷ lệ nghịch với vol hiện tại: $L_t = \sigma_{\text{target}} / \hat\sigma_t$. Ví dụ số: calm regime $\hat\sigma = 8\%$ → $L = 10/8 = 1.25\times$; stress $\hat\sigma = 24\%$ → $L = 10/24 = 0.42\times$; crisis regime $\hat\sigma = 55\%$ → $L = 10/55 = 0.18\times$. Cùng một tín hiệu, nhưng bạn nắm gấp gần bảy lần gross exposure ở calm ($1.25/0.18 \approx 6.9$) so với crisis — và chính điều này biến một chiến lược có drawdown thảm khốc trong crash thành một chiến lược mà exposure tự động rút về lúc nguy hiểm nhất. Đây là điều `regimeScaled` trong module `regime` mã hóa — nhân trọng số cơ sở với một scale phụ thuộc filtering probability của HMM. Và `regimeConditional` đi xa hơn: blend *nhiều chiến lược khác nhau* theo xác suất regime, ví dụ chạy momentum ở trending regime và mean-reversion ở range-bound regime, với trọng số blend chính là filtering probability — không bao giờ bật/tắt cứng mà pha trộn mượt theo độ tin. Nếu HMM cho $P(\text{trending})=0.7$, bạn chạy 70% vốn theo momentum và 30% theo mean-reversion, chuyển dần khi niềm tin dịch, thay vì lật công tắc gây whipsaw.

Ba cạm bẫy khép lại. Một, **timing lag**: mọi bộ phát hiện regime đều trễ ít nhiều (CUSUM vài bước như ví dụ $t=6$ ở trên, HMM cần vài ngày để prior chuyển như phép tính $-2\%$ đã cho thấy — một cú xấu chưa đủ lật niềm tin). Bạn không bao giờ de-risk đúng đỉnh; mục tiêu khiêm tốn hơn là cắt phần đuôi của một đợt kéo dài, và vì crisis persistent (sojourn 5 ngày, không phải 1) nên ngay cả phản ứng trễ hai-ba ngày vẫn kịp bảo vệ phần lớn quãng còn lại. Hai, **overfitting số regime**: fit năm regime lên mười năm dữ liệu gần như chắc chắn tạo ra "regime" là noise được đặt tên sang trọng; giữ $K$ nhỏ (hai hoặc ba), và validate bằng out-of-sample — một mô hình regime thật phải giúp trên dữ liệu chưa thấy, không chỉ kể chuyện đẹp về quá khứ. Ba, **whipsaw cost**: chuyển leverage theo regime tạo turnover, và turnover ăn phí (Chương 13); regime scaling chỉ đáng nếu tiết kiệm rủi ro vượt chi phí giao dịch nó gây ra — với vol targeting điều này thường đúng vì vol persistent nên leverage đổi từ tốn (từ $1.25\times$ xuống $0.42\times$ diễn ra qua nhiều phiên khi vol leo thang, không phải một cú nhảy), nhưng một classifier giật cục bật/tắt cứng có thể tự thua vì phí. Chính vì vậy filtering probability mượt của HMM, với prior neo lại như ta đã thấy ở phép tính $-2\%$ phía trên, được ưa chuộng hơn phân loại cứng: nó tự nhiên làm chậm các cú chuyển, biến regime detection thành một tay lái vững thay vì một cần số giật.

# Chương 5: Lý thuyết danh mục

Có một nghịch lý ở trung tâm của mọi thứ chúng ta làm. Một tín hiệu đơn lẻ — một cây momentum, một cặp mean-reverting, một dự báo vol — gần như luôn quá yếu để đáng đặt cược cả sự nghiệp lên. Edge của nó nhỏ, độ ồn của nó lớn, và bất kỳ tháng nào nó cũng có thể quay ra cắn bạn. Vậy mà toàn bộ ngành quant buy-side lại được xây trên niềm tin rằng từ một rổ những edge nhỏ như thế, ghép đúng cách, ta rút ra được một dòng return đủ mượt để một quỹ trị giá hàng tỷ đô dám sống bằng nó. Chiếc cầu nối giữa "tín hiệu yếu lẻ tẻ" và "return danh mục mượt mà đáng tin" chính là lý thuyết danh mục. Đây là chương giải thích vì sao phép cộng lại lớn hơn tổng các số hạng — và chính xác thì lớn hơn bao nhiêu, đo bằng số.

Chương này đặt nền toán học và ngôn ngữ cho tất cả những gì đến sau: factor models (Chương 6) là CAPM được nhân rộng, portfolio construction (Chương 11) là Markowitz được vá cho sống sót ngoài đời, và risk management (Chương 14) là nghệ thuật đọc những thước đo hiệu suất mà ta xây ở cuối chương này. Nếu bạn chỉ nắm vững một chương lý thuyết trong cả cuốn, hãy để nó là chương này.

## 5.1 Markowitz (1952) — khởi thủy của tài chính định lượng

Trước Harry Markowitz, "đầu tư" là nghệ thuật chọn cổ phiếu tốt. Sau ông, đầu tư trở thành bài toán tối ưu về sự **đánh đổi** giữa kỳ vọng và rủi ro của cả một tập hợp. Cú xoay trục ấy — từ "tài sản nào tốt" sang "tổ hợp nào tốt" — là khoảnh khắc tài chính trở thành một môn định lượng, và nó gói gọn trong một quan sát mà thoạt nghe tầm thường nhưng hệ quả thì vô tận.

**Insight bất tử**: rủi ro danh mục không phải tổng rủi ro thành phần — mà phụ thuộc **correlation**. Với danh mục trọng số $w$, kỳ vọng return $\mu$, và covariance matrix $\Sigma$, ta có hai đại lượng bậc nhất và bậc hai:

$$\mu_p = w^\top \mu, \qquad \sigma_p^2 = w^\top \Sigma\, w$$

Kỳ vọng cộng tuyến tính — trộn 50/50 hai tài sản thì return kỳ vọng đúng bằng trung bình. Nhưng phương sai thì **không** cộng tuyến tính, và chính chỗ phi tuyến này là toàn bộ của cải của nghề. Viết tường minh cho hai tài sản với trọng số $w$ và $1-w$:

$$\sigma_p^2 = w^2\sigma_1^2 + (1-w)^2\sigma_2^2 + 2w(1-w)\rho\,\sigma_1\sigma_2$$

Số hạng chéo cuối cùng — chứa $\rho$ — là nhân vật chính. Nếu $\rho = 1$ (hai tài sản dính chặt) thì công thức thu về $\sigma_p = w\sigma_1 + (1-w)\sigma_2$, một trung bình tuyến tính, không có gì để khai thác. Nhưng ngay khi $\rho < 1$, số hạng chéo nhỏ lại, $\sigma_p$ nằm **dưới** đường thẳng nối hai điểm, và ta được rủi ro rẻ hơn miễn phí. Toàn bộ chương này chỉ là một cách khai thác có hệ thống bất đẳng thức $\rho < 1$ đó.

Lấy ví dụ số kinh điển: hai tài sản cùng vol 20%, correlation 0. Danh mục 50/50 có

$$\sigma_p = \sqrt{0.5^2 \cdot 0.04 + 0.5^2 \cdot 0.04 + 0} = \sqrt{0.5^2 \cdot 0.04 \cdot 2} = \sqrt{0.02} = 14.1\%$$

Return giữ nguyên trung bình, nhưng vol tụt từ 20% xuống 14.1% — giảm 29% mà không mất một điểm return nào. Con số 29% ấy không phải ngẫu nhiên: với $N$ tài sản độc lập cùng vol $\sigma$, trọng số đều $1/N$, danh mục có vol $\sigma/\sqrt N$; với $N=2$ ta được $\sigma/\sqrt2 = 0.707\sigma$, tức giảm đúng $1 - 1/\sqrt2 = 29.3\%$. **Diversification là bữa trưa miễn phí duy nhất** trong tài chính — và toàn bộ industry quant là cỗ máy công nghiệp hóa bữa trưa này: nhiều tín hiệu, nhiều tài sản, nhiều horizon, chọn sao cho chúng correlation thấp với nhau, rồi thu hoạch $\sqrt{N}$ của sự đa dạng đó. Nếu bạn có $N$ nguồn return độc lập cùng chất lượng, Sharpe của tổ hợp scale theo $\sqrt N$: một edge nhỏ Sharpe 0.02 mỗi cược, nhân với 2500 cược độc lập, cho $0.02\sqrt{2500} = 1.0$ — đây là hình bóng đầu tiên của Fundamental Law of Active Management (Chương 6), và là toàn bộ lý do một quỹ dám sống bằng những edge riêng lẻ yếu ớt.

### Frontier hai tài sản bằng số

Giữ nguyên ví dụ chạy xuyên chương này. A (cổ phiếu): $\mu = 8\%$, $\sigma = 16\%$; B (trái phiếu): $\mu = 4\%$, $\sigma = 8\%$; correlation $\rho = 0.2$. Quét trọng số $w_A$ từ 0 đến 100% và tính từng điểm bằng công thức $\sigma_p^2 = w_A^2\sigma_A^2 + (1-w_A)^2\sigma_B^2 + 2w_A(1-w_A)\rho\sigma_A\sigma_B$:

| $w_A$ | 0% | 25% | 50% | 75% | 100% |
|---|---|---|---|---|---|
| $\mu_p$ | 4.00% | 5.00% | 6.00% | 7.00% | 8.00% |
| $\sigma_p$ | 8.00% | 7.85% | 9.63% | 12.55% | 16.00% |

Hãy dừng lại thật lâu ở cột 25%, vì nó chứa toàn bộ phép màu. Kiểm bằng tay với $w_A = 0.25$, cộng ba số hạng:

$$\sigma_p^2 = 0.25^2 \cdot 0.16^2 + 0.75^2 \cdot 0.08^2 + 2\cdot 0.25 \cdot 0.75 \cdot 0.2 \cdot 0.16 \cdot 0.08$$
$$= 0.00160 + 0.00360 + 0.00096 = 0.00616 \;\Rightarrow\; \sigma_p = \sqrt{0.00616} = 7.85\%$$

Đọc dòng $\sigma_p$ theo chiều từ phải sang trái: xuất phát từ 100% trái phiếu ở vol 8.00%, **thêm cổ phiếu ban đầu lại làm giảm rủi ro** — 8.00% xuống 7.85% ở 25/75 — dù cổ phiếu rủi ro gấp đôi trái phiếu. Nghịch lý này không phải ảo thuật số học: hai nguồn nhiễu chỉ correlation 0.2, nên khi cổ phiếu tăng thì trái phiếu thường đứng yên hoặc lệch pha, phần biến động của chúng bù trừ nhau. Bạn "trả" một chút cổ phiếu rủi ro nhưng "được" hiệu ứng triệt tiêu ồn, và ở tỷ lệ nhỏ thì cái được thắng cái mất. Chỉ khi $w_A$ vượt quá điểm variance-minimizing thì vol mới bắt đầu leo — 9.63% ở 50/50, rồi 12.55% ở 75/25 — vì lúc đó exposure cổ phiếu đã đủ lớn để vol riêng của nó lấn át lợi ích triệt tiêu.

Đường $(\sigma_p, \mu_p)$ khi ta quét $w_A$ vẽ ra một cung cong lồi về bên trái — đó là **efficient frontier** của hai tài sản. Điểm 25/75 "thống trị" (dominate) điểm 0/100 theo nghĩa mạnh nhất có thể: nó có return cao hơn (5.00% so với 4.00%) **và đồng thời** rủi ro thấp hơn (7.85% so với 8.00%). Không một nhà đầu tư lý trí nào chọn 0/100 khi 25/75 tồn tại. Toàn bộ lý thuyết danh mục là nghệ thuật khai thác độ cong này ở quy mô nghìn tài sản — và độ cong đến từ đúng một nguồn duy nhất: $\rho < 1$.

### Điểm variance nhỏ nhất — công thức đóng đầu tiên

Tài sản nào cho danh mục ít rủi ro nhất? Lấy đạo hàm $\sigma_p^2$ theo $w_A$ và cho bằng 0 dẫn tới **global minimum-variance portfolio** hai tài sản:

$$w_A^{\min} = \frac{\sigma_B^2 - \rho\,\sigma_A\sigma_B}{\sigma_A^2 + \sigma_B^2 - 2\rho\,\sigma_A\sigma_B}$$

Thay số: tử số $= 0.08^2 - 0.2\cdot 0.16\cdot 0.08 = 0.0064 - 0.00256 = 0.00384$; mẫu số $= 0.0256 + 0.0064 - 0.00512 = 0.02688$. Vậy $w_A^{\min} = 0.00384/0.02688 = 14.3\%$. Danh mục ít rủi ro nhất giữ ~14% cổ phiếu, 86% trái phiếu. Kiểm vol của nó: $\sigma_p^2 = 0.143^2\cdot0.0256 + 0.857^2\cdot0.0064 + 2\cdot0.143\cdot0.857\cdot0.00256 = 0.00585$, tức $\sigma_p = 7.65\%$ — thấp hơn cả 100% trái phiếu (8.00%), và thấp hơn cả điểm 25/75 (7.85%) mà ta soi ở trên. Đây là lần đầu ta thấy một công thức đóng nhả ra một con số hành động được; phần còn lại của chương là tổng quát hóa nó lên $N$ chiều.

## 5.2 Dẫn xuất efficient frontier đầy đủ bằng Lagrange

Với hai tài sản ta quét tay được, nhưng ở $N = 500$ cổ phiếu thì việc "quét mọi trọng số" là vô vọng — không gian $w$ là 500 chiều. Ta cần một công thức đóng cho toàn bộ frontier, và nó đến từ một bài toán tối ưu có ràng buộc giải được bằng nhân tử Lagrange. Đây là một trong số ít chỗ trong cả cuốn sách mà giải tích cho ra lời giải khép kín đẹp đẽ; đáng để dẫn từng bước.

**Bài toán**: tìm danh mục có phương sai nhỏ nhất trong số các danh mục đạt được một mức return mục tiêu $\mu_p = m$, với ràng buộc tổng trọng số bằng 1 (fully invested):

$$\min_w \; \tfrac{1}{2} w^\top \Sigma w \quad \text{s.t.} \quad w^\top \mu = m, \;\; w^\top \mathbf{1} = 1$$

Lập Lagrangian với hai nhân tử $\lambda$ (cho ràng buộc return) và $\gamma$ (cho ràng buộc tổng bằng 1):

$$\mathcal{L} = \tfrac{1}{2} w^\top \Sigma w - \lambda(w^\top \mu - m) - \gamma(w^\top \mathbf{1} - 1)$$

Điều kiện bậc nhất $\partial\mathcal{L}/\partial w = 0$ cho $\Sigma w = \lambda\mu + \gamma\mathbf{1}$. Nhân trái hai vế với $\Sigma^{-1}$:

$$w^* = \lambda\,\Sigma^{-1}\mu + \gamma\,\Sigma^{-1}\mathbf{1}$$

Nghiệm tối ưu là một **tổ hợp tuyến tính của đúng hai vector**: $\Sigma^{-1}\mu$ và $\Sigma^{-1}\mathbf{1}$. Đây chính là **two-fund separation theorem** hiện ra từ đại số — mọi danh mục nằm trên frontier đều pha trộn từ hai "quỹ" cơ bản, bất kể mức return mục tiêu là gì; đổi $m$ chỉ đổi tỷ lệ pha $\lambda:\gamma$, không đổi thành phần hai quỹ. Để tìm $\lambda, \gamma$, ta ép $w^*$ thỏa hai ràng buộc. Định nghĩa ba đại lượng vô hướng (các "hằng số hiệu quả" của Merton):

$$A = \mathbf{1}^\top\Sigma^{-1}\mu, \qquad B = \mu^\top\Sigma^{-1}\mu, \qquad C = \mathbf{1}^\top\Sigma^{-1}\mathbf{1}, \qquad D = BC - A^2$$

Thế $w^*$ vào ràng buộc $w^\top\mu = m$ cho $\lambda B + \gamma A = m$; thế vào $w^\top\mathbf 1 = 1$ cho $\lambda A + \gamma C = 1$. Giải hệ hai phương trình tuyến tính hai ẩn này ra $\lambda = (Cm - A)/D$ và $\gamma = (B - Am)/D$. Thay ngược vào $\sigma_p^2 = w^{*\top}\Sigma w^* = \lambda m + \gamma$ (dùng $\Sigma w^* = \lambda\mu+\gamma\mathbf1$) và rút gọn, phương sai của danh mục frontier tại mức return $m$ là

$$\sigma_p^2(m) = \frac{C\,m^2 - 2A\,m + B}{D}$$

Đây là phương trình **một parabola** trong mặt phẳng $(\sigma_p^2, m)$ — hay tương đương, một **hyperbola** trong mặt phẳng $(\sigma_p, m)$ mà ta thường vẽ. Cả một biển trực giác gói trong một dòng: efficient frontier có hình dạng chính xác của nhánh phải một hyperbola, và mỗi điểm trên nó là danh mục rủi ro thấp nhất cho mức return của nó.

**Đỉnh của hyperbola** — global minimum-variance portfolio — nằm ở nơi $\sigma_p^2(m)$ cực tiểu, tức $\partial\sigma_p^2/\partial m = (2Cm - 2A)/D = 0$, cho $m^* = A/C$ với phương sai $\sigma_{\min}^2 = 1/C$. Trọng số của nó đặc biệt gọn: $w_{\min} = \Sigma^{-1}\mathbf{1} / (\mathbf{1}^\top\Sigma^{-1}\mathbf{1})$, hoàn toàn không phụ thuộc $\mu$. Đây là một sự thật thực chiến sâu sắc: **danh mục ít rủi ro nhất không cần biết return kỳ vọng**. Vì $\mu$ là input được ước lượng tệ nhất (xem 3.1), các quỹ đời thực rất chuộng những danh mục chỉ phụ thuộc $\Sigma$ — minimum-variance, risk parity — chính vì chúng né được câu hỏi bất khả là "return tương lai bao nhiêu".

### Kiểm chứng bằng số

Dựng lại ví dụ A/B như một bài toán $N=2$ để thấy công thức nhả đúng con số. Với $\mu = (0.08, 0.04)^\top$ và

$$\Sigma = \begin{pmatrix} 0.0256 & 0.00256 \\ 0.00256 & 0.0064 \end{pmatrix}$$

(ô chéo là $\sigma^2$, ô ngoài là $\rho\sigma_A\sigma_B = 0.2\cdot0.16\cdot0.08 = 0.00256$). Nghịch đảo ma trận $2\times2$ này: định thức $\det\Sigma = 0.0256\cdot0.0064 - 0.00256^2 = 0.0001573$, nên

$$\Sigma^{-1} = \frac{1}{0.0001573}\begin{pmatrix} 0.0064 & -0.00256 \\ -0.00256 & 0.0256 \end{pmatrix} = \begin{pmatrix} 40.7 & -16.3 \\ -16.3 & 162.8 \end{pmatrix}$$

Từ đó tính ba hằng số: $A = \mathbf{1}^\top\Sigma^{-1}\mu = 7.81$, $B = \mu^\top\Sigma^{-1}\mu = 0.417$, và $C = \mathbf{1}^\top\Sigma^{-1}\mathbf{1} = 40.7 - 16.3 - 16.3 + 162.8 = 170.9$. Vậy $\sigma_{\min}^2 = 1/C = 1/170.9 = 0.00585$, tức $\sigma_{\min} = 7.65\%$ — trùng khít con số ta tính tay ở 5.1. Và $m^* = A/C = 7.81/170.9 = 4.57\%$, đúng bằng return của điểm minimum-variance ứng với $w_A \approx 14.3\%$ (kiểm: $0.143\cdot8\% + 0.857\cdot4\% = 4.57\%$). Công thức đóng và phép quét tay gặp nhau ở cùng một điểm; đó là dấu hiệu cả hai đều đúng.

## 5.3 Mean-variance optimization và "error maximizer"

Frontier ở 5.2 trả lời "rủi ro nhỏ nhất cho một return cho trước". Nhưng nhà đầu tư thật không cố định return — họ đánh đổi nó lấy rủi ro theo khẩu vị. Cách phát biểu tự nhiên hơn là tối đa hóa một **mean-variance utility** với tham số né rủi ro $\lambda$:

$$\max_w \left( w^\top\mu - \frac{\lambda}{2} w^\top\Sigma w \right)$$

Điều kiện bậc nhất $\mu - \lambda\Sigma w = 0$ cho nghiệm không ràng buộc gọn gàng đến kinh ngạc:

$$w^* = \frac{1}{\lambda}\,\Sigma^{-1}\mu$$

Toàn bộ portfolio construction gói trong một dòng: **trọng số tỷ lệ với $\Sigma^{-1}\mu$**. Đọc nó như một chỉ dẫn: $\mu$ nói "muốn cái gì", còn $\Sigma^{-1}$ là bộ lọc "risk-adjust" — nó phạt các vị thế correlation cao (vì $\Sigma^{-1}$ trừ đi phần chồng lấn) và khuếch đại các cược độc lập. Cùng một vector $\Sigma^{-1}\mu$, chỉ đổi $\lambda$, là ta trượt dọc frontier từ thận trọng sang hung hãn. Module `src/alpha` gọi thẳng công thức này trong `portfolio.meanVariance`.

Ví dụ số nhỏ để thấy $\Sigma^{-1}$ làm gì. Hai tài sản kỳ vọng return bằng nhau $\mu = (5\%, 5\%)$, vol bằng nhau 15%, nhưng correlation cao $\rho = 0.9$. Nếu bỏ qua correlation, ta chia đôi 50/50. $\Sigma^{-1}$ nhìn thấy hai tài sản này gần như là **một** cược trùng lặp, nên nó không thưởng cho việc giữ cả hai. Do đối xứng, hướng trọng số vẫn 50/50, nhưng **tổng exposure bị co lại** so với trường hợp $\rho=0$: với cùng $\lambda$, độ lớn $\|\Sigma^{-1}\mu\|$ khi $\rho=0.9$ nhỏ hơn nhiều lần vì diversification benefit gần như bằng 0, nên optimizer từ chối đổ tiền vào một cược nhân đôi giả tạo. Đảo dấu một correlation, hoặc lệch nhẹ một $\mu$, và $\Sigma^{-1}$ có thể quăng ra một long-short khổng lồ. Ghi nhớ hành vi "phóng đại" này — nó là hạt giống của tai họa sắp nói.

**Nghịch lý trung tâm** (Chương 11 sẽ vá): MVO đẹp trên giấy nhưng là một **"error maximizer"**. Nghiệm $\Sigma^{-1}\mu$ khuếch đại chính xác cái sai số mà ta ước lượng tệ nhất. Nhớ từ Chương 3: sai số chuẩn của $\hat\mu$ tỷ lệ $\sigma/\sqrt T$ và **không bao giờ nhỏ** — để phân biệt hai tài sản chênh nhau 2% return/năm với độ tin cậy tử tế cần hàng thập kỷ dữ liệu. Bây giờ đưa cái $\hat\mu$ ồn ào ấy qua $\Sigma^{-1}$, một ma trận thường near-singular (nhiều tài sản gần collinear → eigenvalue nhỏ → nghịch đảo nổ). Kết quả: một chênh lệch ước lượng nhỏ, gần như ngẫu nhiên, biến thành một vị thế long-short cực đoan. Optimizer "tin" vào ồn.

Minh họa định lượng để con số ám ảnh bạn. Hai tài sản thật ra giống hệt nhau ($\mu$ bằng nhau), vol 15%, $\rho = 0.9$; nhưng do ồn mẫu bạn ước lượng lệch 1%, $\hat\mu = (5.5\%, 4.5\%)$. Ma trận covariance là $\Sigma = \begin{pmatrix} 0.0225 & 0.02025 \\ 0.02025 & 0.0225 \end{pmatrix}$, với $\det\Sigma = 0.0225^2 - 0.02025^2 = 0.0000961$. Tính $w \propto \Sigma^{-1}\hat\mu$ trực tiếp cho vector chưa chuẩn hóa $(+3.39, -1.05)$: chênh 1% ảo trong $\mu$ bị $\Sigma^{-1}$ (có eigenvalue rất nhỏ theo hướng "hiệu hai tài sản") nhân lên thành một cược **long tài sản 1 gấp hơn ba lần, short tài sản 2 hơn một lần** — gross exposure 4.4 lần vốn danh mục, dựng hoàn toàn trên một khác biệt là ảo giác thống kê. Nếu ồn mẫu đảo dấu, $\hat\mu=(4.5\%,5.5\%)$, thì optimizer lật ngược 180 độ, long thành short. Đó là lý do MVO thô gần như không bao giờ được chạy trần ngoài đời; nó luôn được thuần hóa bằng shrinkage, ràng buộc position, hay Bayesian priors (Black-Litterman) mà Chương 11 dành hẳn cho. Markowitz đúng tuyệt đối về tư tưởng, và ngây thơ chết người về input.

## 5.4 Tài sản phi rủi ro và Capital Market Line

Cho đến giờ mọi tài sản đều rủi ro. Bây giờ thêm một tài sản đặc biệt: **risk-free asset** với return chắc chắn $r_f$ và vol 0 (T-bill ngắn hạn là xấp xỉ đời thực). Một thay đổi tưởng nhỏ này biến hình toàn bộ hình học frontier — và sinh ra khái niệm quan trọng nhất của lý thuyết danh mục cổ điển.

Trộn một tỷ lệ $\phi$ vào một danh mục rủi ro bất kỳ $P$ (return $\mu_P$, vol $\sigma_P$) và $1-\phi$ vào risk-free:

$$\mu_c = (1-\phi)r_f + \phi\,\mu_P, \qquad \sigma_c = \phi\,\sigma_P$$

Vì risk-free có vol 0 (và covariance 0 với mọi thứ), nó **không đóng góp** vào vol danh mục — chỉ pha loãng nó tuyến tính. Khử $\phi = \sigma_c/\sigma_P$ khỏi phương trình return:

$$\mu_c = r_f + \frac{\mu_P - r_f}{\sigma_P}\,\sigma_c$$

Đây là một **đường thẳng** trong mặt phẳng $(\sigma, \mu)$, xuất phát từ $r_f$ trên trục tung và có độ dốc bằng đúng **Sharpe ratio** của danh mục $P$. Trộn cash với một danh mục rủi ro luôn cho một đường thẳng; độ dốc của nó là Sharpe.

Bây giờ câu hỏi tối ưu trở nên đẹp lạ thường. Trong tất cả danh mục rủi ro $P$ khả dĩ (mọi điểm trên và trong frontier hyperbola), ta muốn chọn cái sao cho đường thẳng nối từ $r_f$ tới nó **dốc nhất** — vì đường dốc nhất cho nhiều return nhất trên mỗi đơn vị rủi ro. Về mặt hình học, đó là đường thẳng từ $r_f$ **tiếp xúc** với frontier hyperbola. Điểm tiếp xúc gọi là **tangency portfolio** $T$, và đường thẳng ấy là **Capital Market Line (CML)**:

$$\mu_c = r_f + SR_T \cdot \sigma_c, \qquad SR_T = \frac{\mu_T - r_f}{\sigma_T} = \max_P \frac{\mu_P - r_f}{\sigma_P}$$

Tangency portfolio là danh mục rủi ro có **Sharpe cao nhất tuyệt đối** trong vũ trụ đầu tư. Và giờ đến kết luận làm rung chuyển tài chính, **two-fund separation** phiên bản đầy đủ: một khi có risk-free asset, **mọi** nhà đầu tư — dù né rủi ro cỡ nào — đều nên giữ đúng **cùng một** danh mục rủi ro $T$, chỉ khác nhau ở tỷ lệ pha với cash. Người thận trọng để 70% cash + 30% $T$; người hung hãn vay thêm (leverage, $\phi > 1$) để giữ 150% $T$. Không ai cần một danh mục rủi ro riêng cho khẩu vị của mình — khẩu vị chỉ quyết định điểm ngồi trên CML, không quyết định thành phần của $T$. Quyết định "đầu tư vào cái gì" (chọn $T$) tách rời hoàn toàn khỏi quyết định "chịu rủi ro bao nhiêu" (chọn $\phi$).

### Công thức tangency và ví dụ số

Tangency portfolio có công thức đóng đẹp — nó là danh mục $\Sigma^{-1}(\mu - r_f\mathbf{1})$ chuẩn hóa về tổng 1:

$$w_T = \frac{\Sigma^{-1}(\mu - r_f\mathbf{1})}{\mathbf{1}^\top\Sigma^{-1}(\mu - r_f\mathbf{1})}$$

Đây là cùng vector $\Sigma^{-1}\mu$ của MVO, chỉ thay $\mu$ bằng **excess return** $\mu - r_f\mathbf{1}$ — một dấu hiệu nữa cho thấy Sharpe-maximization và mean-variance optimization là hai mặt của một đồng xu.

Tính bằng số trên ví dụ A/B với $r_f = 2\%$. Excess return $\mu - r_f\mathbf{1} = (6\%, 2\%)^\top$. Dùng $\Sigma^{-1}$ đã dựng ở 5.2, vector chưa chuẩn hóa là

$$\Sigma^{-1}(\mu - r_f\mathbf 1) = \begin{pmatrix} 40.7 & -16.3 \\ -16.3 & 162.8 \end{pmatrix}\begin{pmatrix} 0.06 \\ 0.02 \end{pmatrix} = \begin{pmatrix} 2.116 \\ 2.279 \end{pmatrix}$$

Chia cho tổng $2.116 + 2.279 = 4.395$ được $w_T \approx (48.1\%, 51.9\%)$ — tangency giữ 48% cổ phiếu, 52% trái phiếu. Danh mục này có $\mu_T = 0.481\cdot8\% + 0.519\cdot4\% = 5.93\%$ và, tính ra, $\sigma_T = \sqrt{0.481^2\cdot0.0256 + 0.519^2\cdot0.0064 + 2\cdot0.481\cdot0.519\cdot0.00256} = 9.45\%$, cho Sharpe

$$SR_T = \frac{5.93\% - 2\%}{9.45\%} = 0.415$$

Không danh mục rủi ro nào khác từ A và B vượt được Sharpe 0.415 này — nó là đỉnh Sharpe của cả họ danh mục. (Kiểm chéo bằng ba hằng số Merton: $SR_T = \sqrt{B - 2A r_f + C r_f^2} = \sqrt{0.417 - 2\cdot7.81\cdot0.02 + 170.9\cdot0.02^2} = 0.415$, khớp.) Một nhà đầu tư muốn vol 5% chỉ cần đặt $\phi = 5\%/9.45\% = 52.9\%$ vào $T$ và phần còn lại 47.1% vào T-bill, thu về $\mu = 2\% + 0.415\cdot5\% = 4.08\%$ trên CML — nhiều hơn cả 100% trái phiếu (4.00%) mà vol chỉ 5% thay vì 8%. Đường thẳng CML thống trị toàn bộ cung frontier cong: khi có cash, đầu tư thông minh là leo dọc một đường thẳng dốc nhất, không phải bò dọc một đường cong.

## 5.5 CAPM: dẫn xuất từ cân bằng, và ngôn ngữ alpha/beta

CML nói mọi người nên giữ cùng tangency portfolio $T$. William Sharpe (1964) đẩy ý tưởng này tới kết luận cuối: nếu **mọi** nhà đầu tư đều tối ưu Markowitz trên **cùng** thông tin, thì $T$ mà tất cả cùng giữ **phải chính là market portfolio** — rổ toàn bộ tài sản có trọng số theo vốn hóa. Đây không phải giả định, mà là một điều kiện thị trường phải thanh khoản (market-clearing): mỗi cổ phiếu phải được ai đó nắm giữ, nên nếu ai cũng giữ chung một danh mục rủi ro thì danh mục ấy buộc phải là toàn thị trường. Từ ràng buộc cân bằng đó, CAPM rơi ra như một hệ quả đại số.

**Dẫn xuất**. Xét thêm một chút tài sản $i$ vào tangency portfolio đã tối ưu. Vì $T$ đã cực đại Sharpe, mọi điều chỉnh biên phải làm Sharpe **đứng yên** ở bậc nhất (điều kiện tối ưu bậc nhất). Đạo hàm Sharpe của một danh mục theo trọng số tài sản $i$ và cho bằng 0 dẫn tới điều kiện: return kỳ vọng vượt trội của mọi tài sản phải tỷ lệ với **contribution của nó vào rủi ro danh mục**, tức với $\text{Cov}(r_i, r_T)$. Cụ thể, tỷ số $(\mathbb E[r_i]-r_f)/\text{Cov}(r_i,r_T)$ phải bằng nhau cho mọi tài sản $i$ — nếu không, ta dịch chút vốn từ tài sản có tỷ số thấp sang tài sản có tỷ số cao và nâng được Sharpe, mâu thuẫn với việc $T$ đã tối ưu. Khi $T = $ market portfolio $m$, đặt hằng số chung ấy bằng cách áp cho chính $i=m$, điều đó viết thành:

$$\mathbb{E}[r_i] - r_f = \frac{\text{Cov}(r_i, r_m)}{\text{Var}(r_m)}\big(\mathbb{E}[r_m] - r_f\big) = \beta_i\big(\mathbb{E}[r_m] - r_f\big)$$

với beta được định nghĩa

$$\beta_i = \frac{\text{Cov}(r_i, r_m)}{\text{Var}(r_m)}$$

Đây là **CAPM security market line**. Thông điệp của nó cực đoan và tinh tế: return kỳ vọng của một tài sản **không** phụ thuộc vol tổng của nó, mà **chỉ** phụ thuộc beta — phần rủi ro nó chia sẻ với thị trường. Vì sao? Vì rủi ro riêng lẻ (idiosyncratic) của tài sản $i$ đa dạng hóa được: trong một danh mục lớn nó bị bù trừ tới 0, nên thị trường **không trả công** cho nó. Chỉ **rủi ro hệ thống** — phần nhảy cùng thị trường, không thể đa dạng hóa đi đâu — mới được đền bù. Một cổ phiếu vol 60% nhưng beta 0 (biến động dữ dội nhưng độc lập thị trường) có return kỳ vọng đúng bằng $r_f$ theo CAPM. Rủi ro không được trả công nếu bạn có thể diversify nó đi miễn phí.

### Ví dụ số: định giá bằng CAPM

Giả sử $r_f = 2\%$, equity risk premium $\mathbb{E}[r_m] - r_f = 5\%$. Ba cổ phiếu:

| Cổ phiếu | $\beta$ | Return kỳ vọng CAPM |
|---|---|---|
| Utility phòng thủ | 0.5 | $2\% + 0.5\cdot5\% = 4.5\%$ |
| Thị trường trung bình | 1.0 | $2\% + 1.0\cdot5\% = 7.0\%$ |
| Tech đòn bẩy cao | 1.8 | $2\% + 1.8\cdot5\% = 11.0\%$ |

Cổ phiếu tech "đắt hàng" phải hứa 11% mới đáng giữ — không phải vì nó tốt hơn, mà vì nó khuếch đại rủi ro thị trường gấp 1.8 lần, và bạn đòi được đền cho phần rủi ro không né được ấy. Ngược lại, utility phòng thủ chỉ cần hứa 4.5%: nó là bảo hiểm mềm, giảm rủi ro danh mục, nên "trả phí" bằng return thấp là hợp lý. CAPM biến beta thành một cỗ máy định giá return kỳ vọng. Chú ý cả ba con số này là return **kỳ vọng ở cân bằng**, không phải dự báo alpha: nếu tech thực sự cho 13% chứ không phải 11%, thì 2 điểm thừa là alpha; nếu nó cho 9%, thì đó là alpha âm, cổ phiếu đắt.

### Ngôn ngữ vĩnh viễn: hồi quy alpha/beta

CAPM **sai về thực nghiệm** — beta một mình không giải thích nổi cross-section return thật (đó chính xác là câu chuyện factor models của Chương 6). Nhưng nó để lại **hệ ngôn ngữ bất diệt** của nghề, qua một hồi quy time-series duy nhất mà mọi quant chạy hàng ngày:

$$r_i - r_f = \alpha_i + \beta_i(r_m - r_f) + \epsilon_i$$

Chạy hồi quy này trên chuỗi return của một chiến lược cho ta ba con số vàng. **Beta** là hệ số dốc — phần return giải thích được bằng phơi nhiễm thị trường. Nó **rẻ**: mua được bằng một ETF phí 0.03%, nên không ai nên trả phí quản lý cao cho beta. **Alpha** là hệ số chặn (intercept) — return **vượt** mức mà beta đáng lẽ giải thích. Đây là thứ duy nhất khách hàng nên trả phí đắt, là thứ quant researcher được thuê để sản xuất, và là namesake của cả module `src/alpha` lẫn cả cuốn sách này. **Residual** $\epsilon_i$ là phần không giải thích được; độ lệch chuẩn của nó, $\sigma(\epsilon)$, là mẫu số của Information Ratio ở 5.7.

Ví dụ đọc số: một quỹ khoe return 15%/năm trong khi $r_f = 2\%$, market lời 12% (nên $r_m - r_f = 10\%$). Chạy hồi quy ra $\beta = 1.2$, tức phần beta đóng góp $1.2 \cdot 10\% = 12\%$ excess return. Excess return của quỹ là $15\% - 2\% = 13\%$, nên alpha là $\alpha = 13\% - 12\% = 1\%$. Vậy trong 13 điểm excess return khoe khoang, **12 điểm là beta đội lốt** (mua được bằng ETF đòn bẩy nhẹ $\beta=1.2$, gần như miễn phí) và chỉ **1 điểm là alpha thật**. Câu hỏi thường trực của industry khi ai đó khoe return — **"return của anh là alpha hay beta đội lốt?"** — được trả lời bằng đúng một hồi quy. Nó là máy phát hiện nói dối của nghề, và Chương 6 sẽ nâng cấp máy này từ một beta (thị trường) lên nhiều beta (value, momentum, quality...) để bắt cả những "alpha giả" tinh vi hơn.

## 5.6 APT — khi nhiều nguồn rủi ro hệ thống cùng định giá

CAPM có một điểm yếu triết học: nó nhét toàn bộ rủi ro hệ thống của thế giới vào **một** con số beta thị trường. Nhưng đời thực có nhiều nguồn rủi ro hệ thống không thể diversify: cú sốc lãi suất, cú sốc lạm phát, cú sốc giá dầu, cú sốc thanh khoản. Stephen Ross (1976) tổng quát hóa với **Arbitrage Pricing Theory (APT)**, thay một beta bằng một **vector** các beta lên nhiều factor:

$$r_i - r_f = \alpha_i + \sum_{k=1}^{K}\beta_{ik} F_k + \epsilon_i$$

trong đó $F_k$ là các common factor (thị trường, size, value, momentum, hoặc các macro factor như thay đổi lãi suất). Điểm đẹp của APT so với CAPM là nền tảng lý thuyết **nhẹ hơn nhiều**: CAPM cần giả định mọi người đều tối ưu mean-variance trên cùng thông tin (một giả định nặng, gần như chắc chắn sai). APT chỉ cần **một** giả định — **no-arbitrage**: nếu hai danh mục có cùng vector exposure $\{\beta_{ik}\}$ tới mọi factor mà lại có return kỳ vọng khác nhau, thì tồn tại một arbitrage (long cái rẻ, short cái đắt, exposure triệt tiêu, ăn chênh lệch không rủi ro). Vì arbitrageur sẽ nhào vào cho tới khi chênh lệch biến mất, ở cân bằng return kỳ vọng **phải** là hàm tuyến tính của các factor loading:

$$\mathbb{E}[r_i] - r_f = \sum_{k=1}^{K}\beta_{ik}\,\lambda_k$$

với $\lambda_k$ là **factor risk premium** — giá thị trường trả cho một đơn vị phơi nhiễm tới factor $k$. CAPM là trường hợp riêng $K=1$ với factor duy nhất là thị trường và $\lambda_1 = \mathbb{E}[r_m]-r_f$.

Ví dụ số làm rõ. Giả sử thế giới có hai factor: thị trường ($\lambda_{mkt} = 5\%$) và một value factor ($\lambda_{val} = 3\%$). Một cổ phiếu value điển hình có $\beta_{mkt} = 1.0$ và $\beta_{val} = 0.8$. APT dự báo excess return kỳ vọng của nó là $1.0\cdot5\% + 0.8\cdot3\% = 5\% + 2.4\% = 7.4\%$ — cao hơn 2.4 điểm so với một cổ phiếu growth cùng beta thị trường nhưng $\beta_{val} = 0$ (chỉ được $1.0\cdot5\% = 5.0\%$). Chênh lệch 2.4% ấy **không phải alpha** — nó là phần thưởng rủi ro cho việc gánh value factor, một cái giá thị trường đồng thuận trả. Nếu một quant chạy hồi quy CAPM một-beta trên cổ phiếu value này, cả 2.4% sẽ hiện ra ở intercept và trông y hệt alpha; chỉ khi thêm value factor vào vế phải thì intercept mới co về 0 và lộ ra rằng "alpha" đó là factor premium. Đây là cạm bẫy sâu nhất mà APT dạy quant buy-side: rất nhiều thứ trông như alpha trong một hồi quy CAPM một-beta thực chất là **factor premium đội lốt** — bạn được trả để gánh một rủi ro hệ thống đã biết, chứ không phải vì bạn giỏi. Chương 6 dành toàn bộ để phân biệt hai thứ này, vì tiền lương của cả nghề nằm ở ranh giới đó.

## 5.7 Các thước đo hiệu suất — biết đọc trước khi biết tạo

Ta đã có công cụ để **xây** danh mục tối ưu; giờ cần công cụ để **chấm điểm** nó. Ở pod shop, một chiến lược sống hay chết không phụ thuộc return thô mà phụ thuộc một chùm thước đo risk-adjusted — và một quant giỏi đọc chùm số này như bác sĩ đọc phim X-quang, thấy được cả bệnh mà bảng return che giấu. Bảng dưới là bộ đồ nghề nền tảng:

| Thước đo | Công thức | Đọc thế nào |
|---|---|---|
| **Sharpe ratio** | $\dfrac{\mathbb{E}[r - r_f]}{\sigma(r-r_f)}$ (annualized) | Thước đo mặc định. Buy-and-hold S&P dài hạn ~0.4–0.5; chiến lược quant tốt 1–2; HFT/market making 5–10+ (nhưng capacity nhỏ). Luôn hỏi: đo trên bao lâu, phí chưa, và bao nhiêu lần thử để tìm ra nó. |
| Sortino | thay $\sigma$ bằng downside deviation | Không phạt biến động chiều lên — hợp với return bất đối xứng |
| Max Drawdown (MDD) | đỉnh-xuống-đáy sâu nhất của equity curve | Thước đo "đau"; quyết định sống còn ở pod shop. Đi kèm: thời gian hồi phục. |
| Calmar | return / \|MDD\| | Chuẩn đánh giá CTA |
| **Information Ratio (IR)** | $\dfrac{\alpha}{\sigma(\text{residual})}$ | Sharpe của phần *vượt benchmark* — thước đo đúng cho active manager, trung tâm của Chương 6 |
| Turnover | % danh mục thay mỗi kỳ | Cầu nối sang chi phí giao dịch: return trước phí × turnover cao = có thể âm sau phí |
| Capacity | AUM mà chiến lược còn hoạt động | Sharpe 3 với capacity \$10M kém giá trị hơn Sharpe 1 với capacity \$10B đối với quỹ lớn |

### Sharpe: khử thang đo để so được táo với cam

Sharpe là con số đầu tiên bất kỳ ai hỏi, vì nó **khử thang đo**. So hai chiến lược: cái thứ nhất lời 20%/năm với vol 40%, cái thứ hai lời 6%/năm với vol 8%. Return thô của cái đầu gấp hơn ba lần, nghe áp đảo. Nhưng trừ $r_f = 2\%$ rồi chia cho vol: cái đầu có Sharpe $18\%/40\% = 0.45$, cái sau có Sharpe $4\%/8\% = 0.50$ — cái "nhỏ bé" 6% thực ra **tốt hơn**. Vì sao? Vì bạn có thể **leverage** cái Sharpe cao lên để đạt bất kỳ return nào bạn muốn (trượt dọc CML ở 5.4): leverage chiến lược 6%/8% lên 5 lần cho 30% return với 40% vol, vượt xa cái 20%/40% ban đầu ở cùng mức rủi ro. Ngược lại, không có đòn bẩy nào cứu được một Sharpe thấp — leverage phóng đại cả return lẫn vol theo cùng tỷ lệ, giữ nguyên Sharpe. Sharpe đo **chất lượng** của dòng return trên mỗi đơn vị rủi ro; return thô chỉ đo bạn đã leverage bao nhiêu.

Một chi tiết annualization mà người mới hay sai: Sharpe hàng năm bằng Sharpe hàng ngày nhân $\sqrt{252}$ (giả định return i.i.d.), vì mean scale theo thời gian $T$ còn vol scale theo $\sqrt T$, nên tỷ số scale theo $T/\sqrt T = \sqrt T$. Một chiến lược Sharpe hàng ngày 0.063 nghe tầm thường nhưng annualized ra $0.063\cdot\sqrt{252} = 1.0$ — đáng nể. `src/alpha` tính đại lượng này trong `metrics.sharpe`; cạm bẫy đời thực là return **không** i.i.d. (có autocorrelation dương do vị thế giữ nhiều ngày), khiến $\sqrt{252}$ phóng đại Sharpe — một trong nhiều cách một backtest trông đẹp hơn thực tế.

### Quan hệ Sharpe–drawdown: vì sao Sharpe là thước đo sống sót

Quan hệ giữa Sharpe và drawdown là điều đáng ghi tâm nhất khi đặt kỳ vọng cho một chiến lược. Với một dòng return xấp xỉ Gaussian, drawdown tồi tệ nhất kỳ vọng trong một quãng dài scale **nghịch** với Sharpe: xấp xỉ, MDD kỳ vọng $\sim \sigma^2/(2\mu)$ nhân một hệ số log theo độ dài quãng, và vì $\mu/\sigma^2 = SR/\sigma$, drawdown co lại khi Sharpe tăng. Quy tắc thô hữu dụng: một chiến lược **Sharpe 1, vol 10%** nên **kỳ vọng** gặp một MDD cỡ **15–25%** đâu đó trong 10 năm hoạt động; nâng lên **Sharpe 2** cùng vol thì MDD kỳ vọng co về **~10%**. Trực giác đằng sau: Sharpe cao nghĩa là mỗi bước đi lên "chắc tay" hơn so với độ ồn, nên equity curve ít khi lún sâu trước khi hồi.

Hệ quả thực chiến sắc lạnh: bất kỳ ai chào bán "Sharpe 1.5, drawdown tối đa lịch sử chỉ 3%" đang mô tả một trong hai thứ. Hoặc một chiến lược **chưa gặp năm xui của chính nó** — backtest quá ngắn, MDD thật còn ở phía trước, vì một Sharpe 1.5 lẽ ra phải kèm drawdown cỡ chục phần trăm ở đâu đó. Hoặc một chiến lược **bán tail risk** (short vol, short gamma, carry trade) — nó thu phí bảo hiểm đều đặn cho một Sharpe mượt giả tạo, cho tới ngày tail nổ và drawdown không phải 3% mà 40% trong một tuần; đây đúng là hình dạng của những blow-up kinh điển như quỹ short-vol tháng 2/2018. Drawdown quá nhỏ so với Sharpe không phải dấu hiệu thiên tài; nó là dấu hiệu một rủi ro đang bị giấu, thường là một phân phối lệch trái mà Gaussian không thấy. Chính vì drawdown kỳ vọng tỷ lệ nghịch với Sharpe mà mọi quỹ ám ảnh con số này: **Sharpe không phải thước đo lòng tham — nó là thước đo khả năng sống sót.** Một quỹ lún 50% drawdown thường bị nhà đầu tư rút vốn và đóng cửa trước khi kịp hồi; Sharpe cao là thứ giữ cho drawdown đủ nông để bạn còn sống mà chờ chiến lược quay lại.

### Bộ ba mô tả: Sharpe–turnover–capacity

Không một con số đơn nào mô tả đủ một chiến lược. Cụm ba con số **Sharpe–turnover–capacity** làm điều đó tốt hơn bất kỳ con số lẻ nào, vì chúng đánh đổi lẫn nhau theo một hình học chặt chẽ. Chiến lược tần suất cao thường có **Sharpe cao nhưng capacity nhỏ**: một market-making book Sharpe 8 có thể chỉ hấp thụ được vài chục triệu đô trước khi chính nó dời giá và ăn mòn edge. Factor chậm thì ngược lại — **Sharpe khiêm tốn nhưng capacity khổng lồ**: momentum 12-1 trên top-1000 US (Sharpe ~0.9 sau phí, xem ví dụ chạy) nuốt được hàng chục tỷ đô vì nó giao dịch chậm, turnover thấp.

Turnover là bản lề nối Sharpe với thực tế sau phí. Xét cụ thể: một tín hiệu có Sharpe gross 1.5, vol 10%, nên excess return gross $\approx 1.5\cdot10\% = 15\%$/năm. Nếu turnover là 2000%/năm (thay toàn bộ danh mục 20 lần) và mỗi vòng round-trip tốn 8 bps chi phí, tổng phí là $20\cdot2\cdot0.08\% = 3.2\%$/năm — ăn hết hơn một phần năm return, kéo Sharpe net xuống $\approx (15\%-3.2\%)/10\% = 1.18$; đẩy turnover lên hoặc phí lên gấp đôi thì edge tan sạch, Sharpe net về gần 0 hay âm. Cùng Sharpe gross 1.5 đó với turnover chỉ 100%/năm thì phí chỉ $1\cdot2\cdot0.08\% = 0.16\%$, gần như không suy suyển. Đây chính là lý do Chương 13 (execution) và Chương 14 (risk) tồn tại: một Sharpe trên giấy chưa trừ phí là một lời hứa, không phải một P&L. Các quỹ khác nhau sống ở các điểm khác nhau trên đường đánh đổi Sharpe–capacity này — một multi-manager pod shop cố ý gom nhiều chiến lược Sharpe trung bình nhưng correlation thấp lại (quay về đúng bài học diversification của 5.1), đạt Sharpe tổng hợp cao mà vẫn giữ capacity lớn. Vòng tròn khép lại: lý thuyết danh mục bắt đầu bằng việc trộn hai tài sản cho vol rẻ hơn 29%, và kết thúc bằng việc trộn hàng chục chiến lược cho một Sharpe mà không tín hiệu đơn lẻ nào tự đạt nổi. Đó là toàn bộ trò chơi.

# Chương 6: Factor models

Factor là **ngôn ngữ chuẩn** của equity quant hiện đại: vừa là cách hiểu return đến từ đâu, vừa là risk model, vừa là chính chiến lược đầu tư. Mọi câu chuyện lớn của buy-side — "danh mục này thực ra đang cược vào cái gì", "rủi ro của tôi nằm ở đâu", "PM này có alpha thật hay chỉ đang cưỡi beta rẻ tiền" — đều được nói bằng từ vựng factor. Chương này bắt đầu từ chỗ CAPM sụp đổ, dựng lên bộ máy multi-factor, đi qua hai trường phái ước lượng (time-series kiểu academic và cross-sectional kiểu Barra), rồi mổ xẻ risk model — cỗ máy hạ tầng mà không quỹ equity nghiêm túc nào thiếu — theo cả hai họ fundamental và statistical (PCA), trước khi kết bằng câu chuyện tỉnh táo nhất của nghề: factor zoo, replication crisis, và cạm bẫy của việc cố gắng "time" factor.

## 6.1 Từ CAPM đến multi-factor

CAPM nói một câu duy nhất và đẹp: return kỳ vọng của một tài sản chỉ phụ thuộc vào một thứ — beta của nó với thị trường. $E[r_i] - r_f = \beta_i (E[r_m] - r_f)$. Cổ phiếu nào nhạy với thị trường hơn thì được trả nhiều hơn, và **không có gì khác** đáng giá. Nếu đúng, đời quant sẽ nhàm chán: mua đúng beta mình muốn, xong.

Nhưng thực nghiệm giết CAPM từ thập niên 1980–90. Ba vết đâm chí mạng, tất cả **sau khi đã chỉnh beta** (nghĩa là CAPM lẽ ra phải giải thích hết mà không giải thích được):

- Cổ phiếu **nhỏ** (small-cap) thắng lớn hơn mức beta của chúng biện minh — hiệu ứng **size** (Banz 1981).
- Cổ phiếu **rẻ** theo book-to-market (giá thấp so với giá trị sổ sách) thắng cổ phiếu đắt — hiệu ứng **value** (Fama-French 1992).
- Cổ phiếu **đang thắng** trong 12 tháng qua tiếp tục thắng tháng tới — hiệu ứng **momentum** (Jegadeesh & Titman 1993).

Ta hãy làm một phép tính để thấy CAPM "sai" cụ thể như thế nào. Giả sử một danh mục value có beta $\beta = 0.9$, và trong mẫu quan sát, market risk premium $E[r_m]-r_f = 6\%$/năm. CAPM tiên đoán excess return của nó là $0.9 \times 6\% = 5.4\%$. Nhưng thực tế value danh mục này kiếm $9\%$ excess. Phần chênh $9\% - 5.4\% = 3.6\%$ chính là **alpha so với CAPM** — thứ mà theo lý thuyết đáng lẽ không được tồn tại. Con số $3.6\%$/năm này không phải nhiễu: chạy trên hàng chục năm, t-stat của nó vượt xa 3. CAPM không giải thích nổi, nên ta cần thêm factor.

Câu trả lời của giới học thuật là **Fama-French 3 factor** (1992): market + **SMB** (small-minus-big, return của rổ nhỏ trừ rổ lớn) + **HML** (high-minus-low book-to-market, return của rổ rẻ trừ rổ đắt). Sau đó mở rộng thành **5 factor** (2015) khi thêm **RMW** (robust-minus-weak profitability — cổ phiếu lời khỏe trừ lời yếu) và **CMA** (conservative-minus-aggressive investment — công ty đầu tư dè dặt trừ công ty đầu tư ồ ạt). Cộng đồng thực chiến thì gần như luôn thêm **momentum** (UMD/WML — up-minus-down, winners-minus-losers), cho ra **Carhart 4-factor** (1997). Mô hình tổng quát đứng sau tất cả là **APT** (Arbitrage Pricing Theory — Ross 1976):

$$r_i = \alpha_i + \sum_{k} \beta_{ik}\, f_k + \epsilon_i$$

Đọc phương trình này cho kỹ vì cả chương xoay quanh nó: return của cổ phiếu $i$ bằng một phần **alpha** riêng ($\alpha_i$, cái mà nếu bạn là PM giỏi bạn muốn dương), cộng tổng các **phơi nhiễm** $\beta_{ik}$ nhân với **factor return** $f_k$ (phần return đến từ việc "cưỡi" các nguồn rủi ro chung), cộng **idiosyncratic** $\epsilon_i$ (nhiễu riêng của cổ phiếu, trung bình 0, không tương quan giữa các tên).

### Hai cách dựng factor — vì sao industry dùng cả hai

Điểm mấu chốt mà người mới hay lẫn: cùng một chữ "beta/exposure" nhưng có **hai cách hoàn toàn khác nhau** để dựng và ước lượng, và cả hai đều được dùng trong thực tế cho mục đích khác nhau.

**Time-series (kiểu academic / Fama-French).** Factor **chính là một chuỗi return** — return của một danh mục long-short (long rổ value, short rổ growth). Bạn đã có sẵn chuỗi $f_k$ theo thời gian. Beta của cổ phiếu $i$ ước lượng bằng **hồi quy chuỗi thời gian**: regress return của $i$ theo thời gian lên các chuỗi factor return, hệ số hồi quy là $\beta_{ik}$. Điểm yếu: beta là một con số trung bình trên cả cửa sổ hồi quy, cập nhật chậm, và với cổ phiếu mới niêm yết thì chưa có đủ lịch sử để chạy.

Để cái này bớt trừu tượng, hãy chạy thử một hồi quy time-series ra số. Giả sử ta hồi quy excess return hằng tháng của một cổ phiếu tiêu dùng phòng thủ (staples) lên hai chuỗi factor market và HML trên $T = 60$ tháng, và OLS trả về $r_i = 0.10\% + 0.75\, r_{mkt} + 0.40\, \text{HML} + \epsilon_i$. Đọc: cổ phiếu này có market beta $0.75$ (ít nhạy hơn thị trường, đúng với "phòng thủ"), value loading $0.40$ (nghiêng nhẹ về value — nó là một cái tên rẻ), và intercept $\alpha_i = 0.10\%$/tháng $= 1.2\%$/năm. Nếu SE của intercept là $0.35\%$/tháng thì t-stat $= 0.10/0.35 = 0.29$ — alpha này **không phân biệt được với 0**. Tức là sau khi trừ đi phần return giải thích được bằng market và value, cổ phiếu này chẳng có gì đặc biệt: toàn bộ return của nó là phần thưởng cho việc cưỡi hai factor công khai. Đó chính xác là câu hỏi mà mọi bảng attribution muốn trả lời — "cái này có alpha thật hay chỉ là beta trá hình?"

**Cross-sectional (kiểu Barra — chuẩn risk model thương mại).** Đảo ngược hoàn toàn. Exposure không phải hồi quy ra — nó là **đặc tính quan sát được** của từng cổ phiếu tại từng thời điểm (z-score của book/price, log-market-cap, momentum 12-1...). Bạn *biết ngay hôm nay* exposure value của Apple là bao nhiêu, không cần chờ cửa sổ. Ngược lại, thứ chưa biết là **factor return** $f_k$ — và nó được ước lượng **mỗi ngày** bằng hồi quy cross-section: regress return hôm nay của *mọi cổ phiếu* lên exposures của chúng, hệ số hồi quy là factor return của ngày đó. Ưu điểm quyết định: exposure cập nhật tức thời khi đặc tính đổi (công ty vừa báo cáo lời tăng → profitability exposure nhảy ngay), không có độ trễ cửa sổ, và tên mới niêm yết vẫn có exposure ngay ngày đầu.

Hai trường phái này gặp nhau ở một thủ tục kinh điển — **Fama-MacBeth** — vừa là máy kiểm định factor của academic, vừa là vòng lặp trung tâm của risk model engine của practitioner.

### Fama-MacBeth từng bước

Đây là quy trình chuẩn để trả lời câu hỏi "factor này có thực sự được thị trường **trả premium** không, hay chỉ là ảo ảnh". Ba bước:

**Bước 1 — chuẩn bị lát cắt.** Mỗi ngày (hoặc mỗi tháng) $t$, với mọi cổ phiếu $i$ trong universe: tính exposure $x_{i,t}$ (ví dụ z-score value) **chỉ dùng dữ liệu đến thời điểm $t$** (chống look-ahead), và ghép với forward return $r_{i,t+1}$ (return của kỳ *tiếp theo*).

**Bước 2 — hồi quy cross-section riêng cho từng $t$.** Với mỗi $t$ chạy một hồi quy độc lập trên lát cắt các cổ phiếu:
$$r_{i,t+1} = a_t + \lambda_t\, x_{i,t} + \epsilon_{i,t}$$
Hệ số $\lambda_t$ đọc là: "mỗi một đơn vị exposure value được thị trường trả bao nhiêu return **trong kỳ $t$ đó**". Lặp qua mọi $t$ ta thu được cả một chuỗi $\{\lambda_t\}$.

**Bước 3 — trung bình và kiểm định.** Premium ước lượng là trung bình chuỗi: $\bar\lambda = \frac{1}{T}\sum_t \lambda_t$. Sai số chuẩn là $SE = \text{std}(\lambda_t)/\sqrt{T}$ (nếu return chồng lấn — ví dụ momentum 12 tháng dùng cửa sổ trượt — thì thêm hiệu chỉnh **Newey-West** cho autocorrelation). t-stat $= \bar\lambda / SE$.

Hãy làm một ví dụ số đầy đủ. Giả sử ta chạy Fama-MacBeth cho value trên $T = 240$ tháng (20 năm). Thu được chuỗi $\lambda_t$ với trung bình $\bar\lambda = 0.30\%$/tháng và độ lệch chuẩn $\text{std}(\lambda_t) = 3.2\%$/tháng (chuỗi này rất động — có tháng value +8%, có tháng −7%). Khi đó:

$$SE = \frac{3.2\%}{\sqrt{240}} = \frac{3.2\%}{15.49} = 0.207\%, \qquad t\text{-stat} = \frac{0.30\%}{0.207\%} = 1.45.$$

Đọc kết quả: premium value trung bình $0.30\% \times 12 = 3.6\%$/năm (khớp con số alpha ta tính ở đầu mục), nhưng t-stat chỉ $1.45$ — **dưới ngưỡng 2** thông thường. Bài học đắt: một premium "trông to" ($3.6\%$/năm) vẫn có thể **không có ý nghĩa thống kê** vì chuỗi $\lambda_t$ quá nhiễu. Đây là lý do các paper factor thật nghiêm túc chạy trên nhiều thập kỷ và nhiều thị trường — và cũng là lý do chương 3/7 khăng khăng về multiple-testing. (Lưu ý: con số $3.6\%$ ở đầu mục 6.1 là alpha *trong mẫu quan sát* của một danh mục cụ thể; ở đây $3.6\%$ là *premium trung bình dài hạn* ước lượng qua nhiều chu kỳ — chúng trùng nhau về độ lớn nhưng khác nhau về ý nghĩa thống kê, và chính t-stat $1.45$ nhắc ta rằng độ lớn không đảm bảo độ chắc.)

Vì sao Fama-MacBeth ước lượng SE đúng trong khi hồi quy pooled thông thường thì sai? Vì mỗi hồi quy cross-section **chỉ dùng một lát cắt thời gian**. Correlation *giữa các cổ phiếu trong cùng một ngày* (hôm nay cả thị trường cùng lên) không làm hỏng SE — cái nhiễu chung của ngày đó bị nuốt trọn vào **một** quan sát $\lambda_t$, và việc lấy trung bình qua $T$ ngày độc lập mới quyết định độ chính xác. Nếu bạn pool tất cả cổ phiếu-ngày vào một hồi quy khổng lồ, cross-sectional correlation sẽ làm bạn *đếm trùng* thông tin và báo SE bé giả tạo, t-stat phồng lên — một trong những cái bẫy phổ biến nhất khiến factor giả trông thật.

Chuỗi $\{\lambda_t\}$ này chính là chỗ hai trường phái hòa làm một: với academic nó là **máy kiểm định** (t-stat của $\bar\lambda$); với practitioner nó **chính là daily factor return** của risk model — thứ ta sẽ đưa vào ma trận $F$ ở mục sau. Cùng một vòng lặp, hai công dụng, và là vòng lặp trung tâm của một risk model engine trong `src/alpha`.

Còn cách dựng factor **kiểu academic thuần** để đối chiếu (khi bạn muốn có ngay chuỗi $f_k$ mà không chạy hồi quy): sort universe theo đặc tính → chia decile (hoặc 30/40/30 kiểu Fama-French) → factor return = return danh mục **top trừ bottom** (long-short), thường value-weight, rebalance hằng tháng. HML, SMB, UMD đều dựng đúng kiểu này; số liệu công khai tại thư viện dữ liệu Kenneth French — nguồn chuẩn để bạn hồi quy chiến lược của mình lên (chương 7). Ví dụ momentum 12-1 chạy xuyên suốt sách: long decile winners, short decile losers, dollar-neutral, rank-IC trung bình ~0.025, Sharpe trước phí ~0.9 — khi bạn hồi quy chiến lược momentum của mình lên chuỗi UMD của French, loading ~0.9 và alpha residual ~0, vì chiến lược của bạn **chính là** cái factor công khai đó chứ chẳng phải alpha mới.

## 6.2 Risk model kiểu Barra — cỗ máy hạ tầng của mọi quỹ equity

Đến đây ta chuyển từ "factor để kiếm tiền" sang "factor để đo rủi ro" — và đây là chỗ mà factor model trở thành hạ tầng không thể thiếu. Mọi optimizer, mọi báo cáo risk, mọi câu "danh mục này rủi ro bao nhiêu" đều cần một ma trận covariance $\Sigma$ của toàn universe. Và đây là chỗ ta đâm vào một bức tường toán học.

### Vì sao sample covariance là rác — và factor cứu như thế nào

Mô hình: $r = X f + \epsilon$ với $X$ = ma trận exposure (industry + style factors). Từ đây suy ra covariance có **cấu trúc**:

$$\Sigma = X\, F\, X^\top + D$$

Trong đó $F$ = covariance của ~50–70 factor returns (một ma trận nhỏ), $D$ = ma trận đường chéo idiosyncratic variance (giả định các $\epsilon_i$ không tương quan chéo). Giá trị cốt lõi của công thức này là **giảm chiều**, và ta phải thấy con số để hiểu vì sao nó sống còn.

Xét universe $N = 3000$ cổ phiếu. Ma trận covariance đầy đủ $\Sigma$ đối xứng có $\frac{N(N+1)}{2} = \frac{3000 \times 3001}{2} \approx 4.5$ **triệu tham số** độc lập cần ước lượng. Bây giờ đếm dữ liệu bạn có: 5 năm return hằng ngày $\approx 1260$ ngày. Nghĩa là bạn cố ước lượng 4.5 triệu con số từ $3000 \times 1260 \approx 3.8$ triệu điểm dữ liệu — **nhiều tham số hơn cả dữ liệu**. Kết quả toán học không thương tiếc: khi $N > T$ (số cổ phiếu > số ngày, ở đây $3000 > 1260$), sample covariance **suy biến** (rank thiếu, không khả nghịch), và optimizer nào chia cho nó sẽ nổ tung. Ngay cả khi $N < T$ một chút, ma trận vẫn đầy nhiễu ước lượng đến mức vô dụng.

Cấu trúc factor cắt bài toán xuống còn xử lý được. Với $K \approx 60$ factor và $N = 3000$ tên, số tham số cần ước lượng là: ma trận exposure $X$ có $3000 \times 60 = 180{,}000$ con số (nhưng phần lớn là *quan sát được*, không phải ước lượng), covariance factor $F$ có $\frac{60 \times 61}{2} = 1{,}830$ tham số, và $D$ có $3000$ tham số đường chéo. Tổng phần **ước lượng thống kê thật sự** ($F$ và $D$) chỉ khoảng **vài nghìn** — nhỏ hơn 4.5 triệu ba bậc độ lớn. Kết quả: $\Sigma$ ổn định qua thời gian, khả nghịch chắc chắn (miễn $D$ dương), và optimizer chạy được. Đây chính là input $\Sigma$ mà chương về portfolio construction dùng để tối ưu, và là khung mà risk team dùng để **phân rã** rủi ro danh mục.

Cái "phân rã" đó đáng được thấy bằng số, vì nó là bản chất của mô hình pod shop. Variance tổng của một danh mục có trọng số $w$ tách sạch làm hai mảnh:
$$w^\top \Sigma\, w = \underbrace{w^\top X F X^\top w}_{\text{factor variance}} + \underbrace{w^\top D\, w}_{\text{idiosyncratic variance}}.$$
Gọi $b = X^\top w$ là **net factor exposures** của danh mục. Lấy một ví dụ hai-factor cho gọn: giả sử danh mục có net exposure momentum $b_{\text{mom}} = 0.5$ và value $b_{\text{val}} = -0.3$ (nghiêng winners, nghiêng growth), với factor vol momentum $10\%$/năm, value $8\%$/năm, correlation giữa hai factor $0.2$. Khi đó factor variance là
$$b^\top F b = (0.5)^2(0.10)^2 + (-0.3)^2(0.08)^2 + 2(0.5)(-0.3)(0.2)(0.10)(0.08)$$
$$= 0.00250 + 0.000576 - 0.000480 = 0.002596,$$
tức factor vol $= \sqrt{0.002596} = 5.10\%$/năm. Giả sử phần idiosyncratic $w^\top D w = 0.001731$ (idio vol $4.16\%$). Tổng variance $= 0.002596 + 0.001731 = 0.004327$, tổng vol $= 6.58\%$/năm. Vậy tỉ trọng: factor chiếm $0.002596/0.004327 = 60\%$ variance, idiosyncratic $40\%$. Đây chính là câu "danh mục đang cược 60% variance vào factor, 40% idiosyncratic" — bây giờ nó là một phép tính chứ không phải khẩu hiệu.

Cái phân rã đó không phải trang trí — nó là bản chất của mô hình pod shop. Phần **idiosyncratic** mới là thứ PM được trả tiền để có (stock-picking thật sự); phần **factor exposure** thường bị siết về ~0 (market-neutral, beta-neutral, và thường cả sector-neutral, style-neutral) vì factor là thứ ai cũng mua được rẻ qua ETF, không có lý do trả phí 2-and-20 cho nó. Một PM mà 80% variance đến từ factor exposure thực chất chỉ là một quỹ index đắt tiền đội lốt. Con số $60\%$ factor ở ví dụ trên là đã khá cao đối với một book được kỳ vọng "thuần alpha" — risk team sẽ gọi PM lên hỏi vì sao chưa hedge bớt momentum tilt.

### Chi tiết ước lượng — mỗi quyết định có hệ quả đo được

Một bản risk model tự xây phải quyết bốn thứ, và mỗi thứ là một quyết định thiết kế có hệ quả cụ thể lên số cuối.

**Hồi quy cross-section hằng ngày ước lượng factor returns $f$.** Đây chính là vòng lặp Fama-MacBeth ở mục trước, nhưng với một tinh chỉnh quan trọng: dùng **WLS (weighted least squares) với trọng số $\sqrt{\text{mktcap}}$**. Lý do: cổ phiếu lớn có ít idiosyncratic noise hơn (một tin đồn nhỏ lay Apple không được, nhưng thổi bay một micro-cap), nên chúng là quan sát "sạch" hơn và đáng được cân nặng hơn trong hồi quy. Vì sao $\sqrt{\text{mktcap}}$ mà không phải $\text{mktcap}$? Vì idiosyncratic variance của một cổ phiếu xấp xỉ tỉ lệ nghịch với size, và trọng số WLS tối ưu là nghịch đảo phương sai của nhiễu; khi đưa vào hồi quy dưới dạng nhân hàng, mỗi hàng được scale bởi nghịch đảo *độ lệch chuẩn* của nhiễu, tức $\propto 1/\sigma_\epsilon \propto \sqrt{\text{mktcap}}$. Một ví dụ số cho trực giác: cổ phiếu $50$ tỉ mktcap được cân nặng $\sqrt{50} \approx 7.07$, cổ phiếu $500$ triệu ($0.5$ tỉ) được cân $\sqrt{0.5} \approx 0.71$ — tỉ lệ ảnh hưởng $7.07/0.71 = 10{:}1$, đúng bằng căn của tỉ lệ size $100{:}1$. Nếu dùng OLS thay vì WLS, một nhúm micro-cap nhiễu loạn có thể kéo lệch cả factor return của ngày đó. Kèm theo là **ràng buộc tuyến tính** để industry factors không thoái hóa với market (áp điều kiện: tổng cap-weighted industry returns = market return, tránh collinearity giữa "market" và "tổng các industry").

**Covariance factor $F$ — EWMA hai half-life.** Ước lượng $F$ bằng EWMA (exponentially weighted moving average) chứ không phải trung bình đều, để ma trận phản ứng với chế độ vol hiện tại. Điểm tinh tế: dùng **hai half-life khác nhau** — ~90 ngày cho variance (đường chéo, phản ứng nhanh với vol) và ~180–480 ngày cho correlation (phần ngoài đường chéo, vì correlation trôi chậm hơn variance, không nên để nó giật theo mỗi cú sốc ngắn). Nhắc lại cơ chế half-life: với hệ số suy giảm $\lambda_{ewma}$, half-life $h = \frac{\ln 2}{-\ln \lambda_{ewma}}$; ngược lại $\lambda_{ewma} = 2^{-1/h}$. Với $h = 90$ ngày, $\lambda_{ewma} = 2^{-1/90} = 0.9923$ — nghĩa là mỗi ngày trọng số cũ nhân $0.9923$, và quan sát cách đây 90 ngày còn đúng nửa trọng số của hôm nay. Kèm theo: hiệu chỉnh **Newey-West** cho autocorrelation (factor returns daily có serial correlation nhẹ do bid-ask bounce và giao dịch không đồng bộ), và một hệ số **volatility regime adjustment** nhân toàn ma trận theo vol regime hiện tại (khi vol thực tế của các factor gần đây vượt mức EWMA dự báo, scale $F$ lên để không đánh giá thấp rủi ro trong khủng hoảng).

**Idiosyncratic variance $D$.** EWMA per-name (mỗi cổ phiếu một chuỗi residual variance riêng), rồi **shrink về mức dự báo từ đặc tính** (size, industry). Lý do shrink: một name vừa niêm yết tuần trước không có đủ lịch sử để ước lượng idio variance đáng tin, nhưng bạn vẫn cần một con số để bỏ vào optimizer — nên bạn "vay" từ các name cùng size/industry. Ví dụ: một small-cap tech mới có idio vol lịch sử tính được là $45\%$/năm nhưng chỉ từ 30 ngày dữ liệu (rất nhiễu); mức dự báo (prior) từ nhóm small-cap-tech là $38\%$; shrink với trọng số $0.6$ về prior cho $0.4 \times 45\% + 0.6 \times 38\% = 18\% + 22.8\% = 40.8\%$ — ổn định hơn, kéo con số nhiễu về gần đồng nghiệp mà không để một ước lượng ngẫu nhiên lọt thẳng vào optimizer.

**Chuẩn hóa exposure.** Exposure phải là z-score có **winsorize** (cắt đuôi ở ±3σ để một outlier — ví dụ book-to-market âm của công ty vốn chủ âm — không phá thang đo), chuẩn theo **cap-weighted mean và equal-weighted std** (quy ước Barra: trung tâm hóa quanh danh mục thị trường nhưng đo độ phân tán đều), missing value điền theo **industry median**. Nghe tủn mủn nhưng sai một quy ước là exposure lệch hệ thống và optimizer nghiêng cả danh mục theo cái lệch đó. Ví dụ cụ thể của cái bẫy: nếu bạn center bằng equal-weighted mean thay vì cap-weighted, thì trong universe có nhiều small-cap rẻ, "value trung bình = 0" của bạn sẽ nằm ở chỗ khác so với danh mục thị trường thực — và một danh mục bạn tưởng là value-neutral thực ra đang nghiêng value âm, đối lại với market. Cái sai vài phần trăm ở bước chuẩn hóa trở thành cái tilt vài phần trăm trong danh mục cuối.

Vendors thương mại: MSCI Barra, Axioma (nay là Qontigo), Bloomberg — mọi quỹ equity nghiêm túc hoặc mua vendor hoặc tự xây bản nội bộ (nhiều quỹ lớn xây riêng để kiểm soát định nghĩa factor và tránh crowding với người dùng vendor). Trong `quantc`, một risk model kiểu này là thành phần tự nhiên của `src/alpha` (portfolio layer).

## 6.3 Fundamental vs statistical (PCA) risk models

Risk model Barra ở mục trên là loại **fundamental**: bạn *áp đặt trước* các factor có ý nghĩa kinh tế (industry, value, size, momentum...) và đo phơi nhiễm bằng đặc tính quan sát được. Nhưng có một trường phái đối lập — **statistical risk model** — không áp đặt gì, mà để **dữ liệu tự khai** ra các factor qua **PCA (Principal Component Analysis)**. Hiểu cả hai và biết khi nào dùng cái nào là dấu hiệu của một risk practitioner trưởng thành.

### Cơ chế PCA risk model

Ý tưởng: lấy ma trận return $N$ cổ phiếu × $T$ ngày, tính sample correlation/covariance, rồi **eigendecomposition**. Eigenvector ứng với eigenvalue lớn nhất là "hướng biến động chung nhất" của thị trường — nó gần như luôn là **market factor** (mọi cổ phiếu cùng loading dương, cùng lên xuống theo thị trường). Eigenvector thứ hai, thứ ba... là các hướng biến động mạnh tiếp theo, trực giao với nhau — thường tương ứng (lỏng lẻo) với các block sector hoặc style, nhưng **không có nhãn kinh tế sẵn**. Bạn giữ lại $K$ principal component đầu (giải thích phần lớn variance), coi chúng là factor, phần dư là idiosyncratic.

Làm một ví dụ số để thấy PCA "nhìn thấy" cấu trúc thị trường. Giả sử universe $N = 500$ cổ phiếu, ta eigendecompose sample correlation matrix và thu được các eigenvalue giảm dần $\ell_1, \ell_2, \dots, \ell_{500}$. Một tính chất phải nhớ để kiểm tra tính nhất quán: vết (trace) của correlation matrix bằng $N$, mà vết cũng bằng tổng eigenvalue, nên $\sum_i \ell_i = 500$ — mọi bảng eigenvalue bạn dựng ra đều phải cộng lại đúng $500$, nếu không là sai. Kết quả điển hình cho equity:

| Component | Eigenvalue $\ell_i$ | % variance ($\ell_i / N$) | Diễn giải |
|---|---|---|---|
| PC1 | 100 | 20% | Market — mọi cổ phiếu loading dương |
| PC2 | 25 | 5% | Sector spread (ví dụ tech vs energy) |
| PC3 | 15 | 3% | Style-like (growth vs value) |
| PC4–PC20 (17 cái) | ~4 mỗi cái | ~14% tổng (68) | Các block nhỏ hơn |
| PC21–PC500 (480 cái) | ~0.60 mỗi cái | ~58% tổng (290) | "Bulk" — chủ yếu nhiễu |

Kiểm tra vết: $100 + 25 + 15 + 17 \times 4 + 480 \times 0.60 = 140 + 68 + 288 = 496 \approx 500$ (làm tròn) — cộng đúng, bảng nhất quán. Đọc bảng: PC1 một mình nuốt 20% toàn bộ biến động chung — đó là sức mạnh của market factor, giải thích vì sao "beta thị trường" là câu chuyện lớn nhất trong equity. Ba component đầu gộp lại đã chiếm $28\%$ variance chỉ với 3 hướng trong số 500. Nhưng để ý phần đáy: 480 component cuối, mỗi cái giải thích chưa tới $0.60/500 = 0.12\%$ — chúng gần như không phân biệt được với nhiễu thuần túy. Đây chính là chỗ mục 6.4 (RMT denoising) sẽ can thiệp bằng một ngưỡng chính xác.

### So sánh — khi nào dùng cái nào

| Tiêu chí | Fundamental (Barra) | Statistical (PCA) |
|---|---|---|
| Factor đến từ | Áp đặt trước, có nhãn kinh tế | Dữ liệu tự khai, không nhãn |
| Exposure | Đặc tính quan sát được, cập nhật tức thời | Hồi quy ước lượng, có độ trễ |
| Diễn giải | Rất tốt ("cược momentum") | Kém (PC7 là gì?) |
| Bắt factor mới/ẩn | Không (chỉ thấy cái đã định nghĩa) | Có (dữ liệu tự lộ) |
| Ổn định qua thời gian | Cao | Thấp hơn (eigenvector xoay) |
| Attribution/reporting | Chuẩn công nghiệp | Khó giải thích cho PM |

Điểm mạnh chí mạng của PCA là bắt được **factor bạn chưa nghĩ tới**. Trong một sự kiện lạ (cú deleveraging của các quant fund tháng 8/2007 chẳng hạn), fundamental model không có factor "quant crowding" nên sẽ báo rủi ro thấp giả tạo — trong khi PCA sẽ thấy một principal component mới trồi lên mạnh bất thường và cảnh báo. Điểm yếu chí mạng: PC không có nhãn, nên khi PM hỏi "vì sao danh mục lỗ hôm nay", câu "vì bạn loading 0.3 vào PC4" là vô dụng về mặt hành động. Thực tế nhiều quỹ chạy **cả hai song song**: fundamental cho attribution và constraint hằng ngày, statistical như một lớp cảnh báo bắt cấu trúc ẩn mà fundamental bỏ sót. Một cách lai phổ biến là dùng PCA **trên residual** sau khi đã bóc các fundamental factor — nếu residual vẫn còn một principal component mạnh, đó là bằng chứng bạn đang thiếu một factor thật.

## 6.4 RMT denoising — làm sạch covariance bằng Marchenko-Pastur

Cả sample covariance lẫn PCA đều bệnh cùng một chỗ: khi $N$ và $T$ cùng lớn và cùng cỡ, **phần lớn eigenvalue nhỏ là nhiễu thuần túy**, không mang thông tin, nhưng nếu bạn dùng chúng nguyên xi trong optimizer thì optimizer sẽ "tin" vào các hướng nhiễu đó và dồn tiền vào chúng — đúng cái mà chương portfolio construction gọi là "error maximization". **Random Matrix Theory (RMT)** cho ta một dao mổ sắc để tách tín hiệu khỏi nhiễu, và module `rmt` trong `src/alpha` làm đúng việc này.

### Phân phối Marchenko-Pastur

Kết quả then chốt: nếu bạn lấy $N$ chuỗi thời gian dài $T$ hoàn toàn **ngẫu nhiên và độc lập** (không có factor thật nào cả), rồi tính correlation matrix và eigendecompose, thì các eigenvalue **không** rải đều mà tuân theo một phân phối xác định — phân phối **Marchenko-Pastur** — nằm gọn trong khoảng $[\lambda_-, \lambda_+]$ với:

$$\lambda_\pm = \sigma^2\left(1 \pm \sqrt{\frac{N}{T}}\right)^2$$

trong đó $\sigma^2$ là variance của nhiễu (bằng 1 cho correlation matrix chuẩn hóa) và tỉ lệ $q = N/T$ là "độ chật" của bài toán. Ý nghĩa vận hành cực mạnh: **bất kỳ eigenvalue nào rơi trong $[\lambda_-, \lambda_+]$ đều không phân biệt được với nhiễu thuần túy** — nó có thể sinh ra từ dữ liệu hoàn toàn ngẫu nhiên. Chỉ eigenvalue **vượt trên $\lambda_+$** mới là tín hiệu thật (factor thật).

Làm ví dụ số khớp với bảng PCA ở mục 6.3. Lấy $N = 500$, $T = 1000$ ngày (khoảng 4 năm), $\sigma^2 = 1$. Khi đó $q = 500/1000 = 0.5$, và:

$$\lambda_+ = \left(1 + \sqrt{0.5}\right)^2 = (1 + 0.707)^2 = (1.707)^2 = 2.92,$$
$$\lambda_- = \left(1 - \sqrt{0.5}\right)^2 = (1 - 0.707)^2 = (0.293)^2 = 0.086.$$

Ngưỡng nhiễu trên là $\lambda_+ = 2.92$. Quay lại bảng: PC1 ($\ell_1 = 100$), PC2 ($25$), PC3 ($15$) đều **vượt xa** $2.92$ → tín hiệu thật, giữ. PC4–PC20 với eigenvalue ~4 **vẫn nhỉnh trên** $2.92$ → biên giới, đáng ngờ nhưng tạm giữ. Nhưng toàn bộ PC21–PC500 với eigenvalue ~0.60 **nằm gọn dưới $\lambda_+$** (và bên trong dải $[0.086, 2.92]$) → **không phân biệt được với nhiễu**. Kết luận sắc bén: trong 500 principal component, chỉ khoảng **20 cái đầu** mang tín hiệu; 480 cái còn lại là bụi thống kê. Nếu optimizer dùng cả 480 hướng nhiễu đó, nó sẽ dồn tiền vào những "cơ hội" không tồn tại.

### Quy trình denoise từng bước

Module `rmt` làm việc này theo một recipe rõ ràng:

**Bước 1.** Eigendecompose correlation matrix $C = \sum_i \ell_i\, v_i v_i^\top$, thu eigenvalue $\ell_i$ và eigenvector $v_i$.

**Bước 2.** Tính $\lambda_+$ theo Marchenko-Pastur từ $q = N/T$ (tinh vi hơn: fit $\sigma^2$ bằng cách khớp phần bulk của phổ eigenvalue với phân phối MP lý thuyết, vì phần variance đã bị các factor thật hút mất nên $\sigma^2$ hiệu dụng của phần nhiễu nhỏ hơn 1 — với bảng của ta, ba PC đầu đã hút $28\%$ variance, nên nhiễu chỉ còn chia nhau ~$72\%$, kéo $\lambda_+$ hiệu dụng xuống dưới $2.92$ một chút).

**Bước 3.** Với mọi eigenvalue $\ell_i > \lambda_+$: giữ nguyên (tín hiệu). Với mọi $\ell_i \le \lambda_+$: **thay bằng một hằng số chung** $\bar\ell_{\text{noise}}$ = trung bình của toàn bộ các eigenvalue nhiễu (để vết ma trận — tổng variance — được bảo toàn). Đây là "constant residual eigenvalue" method của Laloux-Bouchaud-Potters. Với bảng của ta, nếu ta coi PC1–PC20 là tín hiệu (tổng $\approx 100+25+15+68 = 208$) thì phần nhiễu là $500 - 208 = 292$ variance trải trên $480$ component, nên $\bar\ell_{\text{noise}} = 292/480 = 0.61$ — mọi eigenvalue nhiễu bị ép về đúng $0.61$ thay vì để chúng rải từ ~$0.3$ đến ~$1.5$ một cách ngẫu nhiên.

**Bước 4.** Tái dựng correlation matrix denoised $\tilde C = \sum_{i:\,\ell_i > \lambda_+} \ell_i\, v_i v_i^\top + \bar\ell_{\text{noise}} \sum_{i:\,\ell_i \le \lambda_+} v_i v_i^\top$, rồi scale lại thành covariance bằng vol từng name.

Hệ quả đo được: correlation matrix denoised có **condition number** (tỉ số eigenvalue lớn nhất / nhỏ nhất) nhỏ hơn nhiều — thay vì eigenvalue nhỏ nhất có thể là $0.086$ hoặc gần 0 (làm ma trận gần suy biến), giờ mọi hướng nhiễu đều bằng $0.61$, nên $\tilde C$ khả nghịch ổn định. Optimizer chạy trên nó cho danh mục ít cực đoan hơn, turnover thấp hơn, và (điểm quan trọng nhất) **out-of-sample tốt hơn** vì bạn không tối ưu theo nhiễu. Đây là cùng một triết lý với factor model $\Sigma = XFX^\top + D$ — cả hai đều là cách áp cấu trúc để chống lời nguyền chiều cao — chỉ khác là RMT để dữ liệu tự quyết chỗ cắt tín hiệu/nhiễu thay vì áp đặt trước danh sách factor.

## 6.5 Factor zoo và cuộc khủng hoảng replication

Đến đây bạn đã có bộ máy đầy đủ, và câu hỏi cuối cùng — cũng là câu hỏi tỉnh táo nhất — là: **trong hàng trăm factor được công bố, cái nào là thật?** Câu trả lời khiến nhiều người vỡ mộng.

Academic đã công bố **400+ "factors"** — nhiều đến mức John Cochrane gọi mỉa là **"factor zoo"**. Khi Hou-Xue-Zhang (2020) thử **replicate** một cách đàng hoàng (không loại microcaps một cách tùy tiện, dùng value-weight thay vì equal-weight để tránh phóng đại hiệu ứng small-cap, tính cả phí giao dịch, và không p-hacking), kết quả là **~65% factor không sống nổi** — t-stat của chúng tụt xuống dưới ngưỡng khi làm đúng phương pháp. Nghĩa là gần hai phần ba "khám phá" của ngành factor là ảo ảnh thống kê sinh ra từ data-mining và bậc tự do nghiên cứu (research degrees of freedom).

Tệ hơn nữa cho cả các factor **thật**: McLean & Pontiff (2016) đo return của factor **trước và sau** khi paper công bố, và thấy factor return giảm trung bình **~58% sau publication**. Diễn giải: một khi anomaly được in ra, cả thị trường học nó và arbitrage đi — vốn ùa vào, giá điều chỉnh, edge co lại. Để thấy con số này cắn thế nào, hãy áp vào một factor có Sharpe gross $0.6$ trước publication: sau khi return co $58\%$, và giả sử vol không đổi, Sharpe rơi về $0.6 \times 0.42 = 0.25$ — từ một chiến lược đáng chạy thành một chiến lược mà sau phí gần như không còn gì. Bài học kép, và nó định hình cả sự nghiệp của bạn:

Thứ nhất, **đa số factor mới là ảo ảnh** — phải áp kỷ luật multiple-testing của chương 3/7 (deflated Sharpe, ngưỡng t-stat nâng lên 3.0 như Harvey-Liu-Zhu đề nghị chính vì factor zoo). Thứ hai, **kể cả factor thật cũng decay** — alpha là tài sản hao mòn, không phải bất động sản cho thuê đời đời. Con số $58\%$ decay nghĩa là nghề này là một **guồng chạy liên tục**: bạn không "tìm ra một factor rồi nghỉ hưu", bạn liên tục tìm cái mới trong khi cái cũ mòn dần dưới chân.

### Vì sao vài factor sống dai — hai họ lý do

Không phải mọi factor đều mòn như nhau. Một nhúm factor được thừa nhận rộng vì **sống dai qua nhiều thập kỷ và nhiều thị trường**: **momentum** (12-1 tháng, cross-sectional và time-series), **value** (đa thước đo — không chỉ book/price mà cả earnings, cashflow, sales), **quality/profitability**, **low-volatility / betting-against-beta**, **carry** (mọi asset class — nhận yield cao, trả yield thấp), và **trend** (time-series momentum, nền tảng của toàn ngành CTA). Câu hỏi sinh tử: vì sao chúng chưa bị arbitrage mất?

Câu trả lời **phải** thuộc một trong hai họ, và khi phỏng vấn buy-side bạn *chắc chắn* sẽ bị hỏi "tại sao alpha này chưa bị arbitrage?":

**Họ 1 — bù rủi ro thật (risk-based).** Factor này trả tiền vì nó đau đúng lúc bạn không muốn đau. Value là ví dụ kinh điển: cổ phiếu rẻ thường là công ty đang khốn khó, và chúng **sập nặng nhất trong khủng hoảng** — chính lúc bạn đã mất việc, danh mục đã lỗ, và tiền quý giá nhất. Bạn được trả premium $3.6\%$/năm không phải cho không: đó là công chịu đau đồng biến với chu kỳ kinh tế. Vì rủi ro là thật và không thể xóa bằng diversification, premium tồn tại bền — không ai arbitrage được cái rủi ro bạn không muốn giữ.

**Họ 2 — giới hạn hành vi / thể chế bền (behavioral / institutional).** Factor này trả tiền vì có một nhóm người **bị buộc** hành xử ngược lại một cách có hệ thống, và ràng buộc của họ không biến mất. Low-vol là ví dụ đẹp: nhiều quỹ và mandate **bị cấm dùng leverage**, nên để đạt return cao họ buộc phải đuổi theo cổ phiếu high-beta, high-vol — đẩy giá chúng lên quá cao và return kỳ vọng xuống quá thấp. Họ trả giá cho ràng buộc leverage của mình; bạn — người được phép leverage cổ phiếu low-vol lên — nhặt phần chênh. Chừng nào ràng buộc thể chế còn (và nó là quy định, mandate, cấu trúc phí — những thứ đổi rất chậm), edge còn.

Nếu một factor không giải thích được bằng một trong hai họ này, câu trả lời thành thật duy nhất còn lại là: **"nó sẽ decay, và tôi kiếm tiền bằng cách khai thác nhanh hơn người khác học được"** — một chiến lược hợp lệ, nhưng bạn phải biết mình đang chạy đua với thời gian chứ không sở hữu một mỏ vàng vĩnh cửu.

## 6.6 Factor timing và những cạm bẫy của nó

Nếu factor có premium, và premium thay đổi theo thời gian (value đắt/rẻ, momentum khỏe/yếu), thì một cám dỗ tự nhiên nảy sinh: **tại sao không time factor** — tăng phơi nhiễm khi factor sắp thắng, giảm khi sắp thua? Đây là **factor timing**, và nó là một trong những chỗ tốn tiền nhất mà người thông minh sa vào. Đáng bàn kỹ vì trực giác nói "dĩ nhiên nên làm" trong khi bằng chứng nói "rất khó và thường phản tác dụng".

Ý tưởng nghe hợp lý nhất là **valuation timing**: khi spread định giá giữa rổ value và rổ growth *rộng bất thường* (value rẻ hơn thường lệ), value factor có return kỳ vọng cao hơn → overweight; khi spread *hẹp* → underweight. Arnott và đồng nghiệp (Research Affiliates) lập luận theo hướng này. Nhưng Cliff Asness (AQR) phản pháo bằng một điểm chí tử: **timing một factor bằng chính valuation của nó thực chất là nhét một cú cược value vào tầng trên** — bạn đang "value-timing" và do đó nhân đôi phơi nhiễm value một cách ẩn, khiến danh mục kém đa dạng hơn chứ không thông minh hơn. Và về mặt bằng chứng, gross Sharpe của factor timing hiếm khi vượt được đủ để bù cho turnover mà nó tạo ra.

Hãy làm phép tính cạm bẫy để thấy vì sao. Giả sử một tín hiệu timing giúp bạn nâng return factor thêm $\Delta = 1.0\%$/năm gross (đã là lạc quan — hầu hết tín hiệu timing yếu hơn thế). Nhưng để timing, bạn phải **xoay phơi nhiễm** liên tục. Một chiến lược factor timing thực tế làm tăng turnover thêm khoảng $150\%$/năm so với việc chỉ giữ phơi nhiễm cố định — nghĩa là bạn thay $1.5\times$ giá trị danh mục mỗi năm. Mỗi lần thay một đơn vị là một round-trip (bán cái cũ, mua cái mới), và với chi phí all-in one-way (impact + phí) khoảng $15\,\text{bps}$, một round-trip tốn $\approx 2 \times 15 = 30\,\text{bps}$. Vậy chi phí thêm hằng năm là:
$$\text{turnover} \times \text{chi phí round-trip} = 1.5 \times 30\,\text{bps} = 45\,\text{bps} = 0.45\%/\text{năm}.$$
So sánh: bạn kiếm thêm $1.0\%$ gross nhưng trả thêm $0.45\%$ phí, còn $0.55\%$ net — **và đó là chưa trừ đi phần tín hiệu timing sai** (nó không hoàn hảo). Nếu tín hiệu timing chỉ đúng $55\%$ số lần với biên độ như trên, phần net rất dễ **âm**. Đây là cách một ý tưởng "hiển nhiên đúng" trở thành máy đốt tiền.

Ba cạm bẫy cụ thể mà factor timing hay dính, đáng khắc cốt.

**Look-ahead trong tín hiệu timing.** Rất nhiều nghiên cứu factor timing dùng valuation spread được tính với dữ liệu hiệu chỉnh về sau (restated fundamentals) hoặc dùng ngưỡng "rẻ/đắt" được chọn *sau khi nhìn toàn bộ lịch sử*. Khi bạn chỉ được biết dữ liệu tại thời điểm thật, biên độ timing co lại phần lớn. Đây là look-ahead đội lốt kinh tế học.

**Overfitting tín hiệu.** Không gian các "tín hiệu timing" là vô hạn (valuation spread, macro regime, momentum của chính factor, sentiment...). Thử đủ nhiều, bạn *sẽ* tìm được một tín hiệu trông tuyệt trong backtest — đúng thứ mà deflated Sharpe của chương về backtesting được sinh ra để trừng phạt. Factor timing là mảnh đất màu mỡ nhất cho overfitting vì nó thêm một lớp bậc tự do lên trên một chiến lược vốn đã đầy bậc tự do.

**Turnover và capacity ẩn.** Ngay cả khi tín hiệu thật, việc xoay phơi nhiễm factor toàn danh mục tạo giao dịch tương quan cao (cả rổ value cùng bị bán một lúc) — market impact phi tuyến (căn bậc hai theo size, xem chương microstructure) khiến chi phí thực tế cao hơn ước tính tuyến tính, và với AUM lớn thì factor timing đơn giản là không có capacity.

Kết luận cân bằng — không phải "đừng bao giờ time factor", mà là biết chỗ nó khả dĩ. Timing **giữa các factor để giữ đa dạng hóa và kiểm soát rủi ro** (giảm phơi nhiễm value khi nó đã rất crowded và tương quan bất thường cao với các cược khác của bạn) là quản trị rủi ro lành mạnh. Timing **để cố nhặt thêm return** bằng cách dự báo factor nào sắp thắng thì phần lớn là ảo tưởng có phí — Sharpe của bản thân factor đã khó, timing nó lại càng khó hơn một bậc, và turnover ăn hết phần lời trước khi bạn kịp mừng. Người trưởng thành trong nghề dành phần lớn năng lượng vào việc **giữ phơi nhiễm factor rẻ và ổn định** rồi đặt cược thật sự vào tầng **idiosyncratic** — vì đó mới là chỗ họ được trả tiền, và là chỗ đám đông chưa arbitrage mất.

# Chương 7: Alpha research

Đây là chương nghề nhất của tài liệu. Nếu năm chương trước dạy bạn đọc dữ liệu, đo rủi ro và dựng danh mục, thì chương này dạy bạn thứ mà cả ngành trả tiền để có: **alpha** — một tín hiệu dự báo được, kiểm được, và trade được. Alpha research là toàn bộ quy trình biến một giả thuyết kinh tế mơ hồ ("cổ phiếu vừa công bố lãi vượt kỳ vọng sẽ còn tăng tiếp") thành một vector điểm số chính xác trên hàng nghìn cổ phiếu mỗi ngày, rồi chứng minh vector đó thực sự dự báo tương lai chứ không phải trí tưởng tượng khớp với quá khứ. Mọi thứ trước chương này là hạ tầng; mọi thứ sau nó — backtesting, portfolio construction, execution — là công cụ để nhân alpha lên thành P&L. Ở giữa là công việc mà một QR buy-side làm tám tiếng mỗi ngày.

Một sự thật nên đóng đinh ngay từ đầu: **alpha thô gần như luôn nhỏ và luôn phân rã**. Không có tín hiệu nào cho bạn IC 0.3 trên universe rộng mà không phải là một look-ahead bug đội lốt. Nghề này không phải săn tìm viên ngọc mà là công nghiệp hóa việc gom vô số mảnh edge tí hon, ít tương quan, rồi để toán học của Fundamental Law nhân chúng lên. Hiểu điều đó định hình mọi quyết định kỹ thuật trong chương: vì sao ta ám ảnh với correlation giữa tín hiệu, vì sao ta chuẩn hóa gắt gao, vì sao ta đo lường bằng những công cụ thống kê tưởng chừng quá cẩn thận cho một con số bé đến thế. Con số bé, nhưng nhân đủ lớn thì thành cả một quỹ.

## 7.1 Alpha signal là gì — giải phẫu chuẩn

Một **alpha** (theo nghĩa WorldQuant/industry) là hàm từ dữ liệu tới một **vector điểm số** trên universe tại mỗi thời điểm: $\alpha_{i,t}$ = "độ hấp dẫn tương đối" của cổ phiếu $i$ lúc $t$. Nhấn mạnh chữ *tương đối*: alpha không nói "cổ phiếu A sẽ tăng", nó nói "A hấp dẫn hơn B, B hấp dẫn hơn C" — và đó chính xác là thứ một danh mục long-short cần, vì bạn kiếm tiền từ *chênh lệch* giữa leg long và leg short chứ không từ hướng đi của thị trường. Ví dụ đơn giản nhất: `-return_5d` (mua cái vừa giảm, bán cái vừa tăng — mean reversion ngắn hạn). Dấu trừ nói lên toàn bộ giả thuyết: cái giảm mạnh nhất tuần qua sẽ hồi.

Nhưng một vector điểm số thô hiếm khi trade được ngay. Nó lẫn outlier, lẫn những thứ bạn không muốn cược (nó nghiêng về một sector nào đó, về nhóm cổ phiếu vốn hóa nhỏ), và có thang đo lung tung giữa các ngày. **Pipeline chuẩn hóa tín hiệu** biến raw signal thành một vật thể sạch, so sánh được, trung lập với rủi ro không mong muốn:

1. **Raw signal** từ giả thuyết (xem 7.4).
2. **Winsorize** — clip outlier về ngưỡng phân vị 1%/99%, hoặc về $\pm 3$ MAD quanh median. Một cổ phiếu vừa chia tách hay dính lỗi dữ liệu có thể cho raw signal gấp mấy chục lần median; nếu không cắt, nó một mình quyết định cả danh mục.
3. **Neutralize** — hồi quy bỏ phần giải thích bởi thứ không muốn cược: market, sector/industry, size, và thường cả các style factor Barra, rồi giữ lại residual. Một tín hiệu "mua dầu khí" không phải alpha, nó là industry bet.
4. **Rank hoặc z-score** cross-sectional để ra tín hiệu không thứ nguyên, so sánh được mọi ngày ($z = (x - \text{mean})/\text{std}$ theo cross-section; rank chống outlier tốt hơn nữa).
5. **Smooth** (EMA vài ngày) nếu turnover quá cao so với horizon của tín hiệu.

Kết quả là danh mục giấy long điểm cao/short điểm thấp, dollar-neutral — đơn vị đo lường của mọi phân tích tiếp theo.

Hãy chạy pipeline này bằng số trên một cross-section 6 cổ phiếu để thấy từng bước làm gì. Raw momentum (return 12 tháng, đơn vị %) của sáu tên: A = +45, B = +18, C = +9, D = −4, E = −15, F = +220 (F vừa được thâu tóm, một outlier bẩn). Bước **winsorize** theo MAD cần hai đại lượng. Median của {−15, −4, 9, 18, 45, 220} là trung bình hai giá trị giữa, $(9+18)/2 = +13.5$. Độ lệch tuyệt đối so với median của từng tên là {28.5, 17.5, 4.5, 31.5, 4.5, 206.5}; median của *các độ lệch đó*, sắp lại thành {4.5, 4.5, 17.5, 28.5, 31.5, 206.5}, là $(17.5+28.5)/2 = 23.0$ — đó là MAD. Ngưỡng $\pm 3$ MAD quanh median là $13.5 \pm 69 = [-55.5,\ +82.5]$. **Winsorize** kéo F từ +220 về đúng cận trên +82.5; năm tên còn lại nằm trong ngưỡng nên giữ nguyên.

Bây giờ z-score cái cross-section đã cắt {45, 18, 9, −4, −15, 82.5}. Mean $= 22.58$, độ lệch chuẩn (theo cross-section, chia $n$) $= 32.70$. Vậy $z_A = (45 - 22.58)/32.70 = 0.69$, $z_F = (82.5 - 22.58)/32.70 = 1.83$, $z_E = (-15 - 22.58)/32.70 = -1.15$; đủ bộ là {A: 0.69, B: −0.14, C: −0.42, D: −0.81, E: −1.15, F: 1.83}. Nếu thay bằng **rank** thì F chỉ nhận rank cao nhất chứ không "khổng lồ" hơn phần còn lại — đó là lý do rank thường được ưa ở universe rộng, nơi dữ liệu bẩn là chuyện thường ngày và bạn không muốn một cái tên nào, dù đã winsorize, còn kéo lệch cả thang đo.

Đáng dừng lại để thấy winsorize cứu bạn khỏi cái gì. **Chưa** winsorize, mean của raw là 45.5 và std là 80.3, nên riêng F có z-score $(220-45.5)/80.3 = 2.17$; nếu gross weight tỉ lệ với $|z|$, một mình F chiếm $2.17 / \sum|z| \approx 50\%$ toàn bộ gross exposure của danh mục — nửa số vốn đặt vào đúng một cổ phiếu đang trong thương vụ M&A, chẳng liên quan gì đến giả thuyết momentum. **Sau** khi winsorize về +82.5 và z-score lại, share gross của F rơi về $\approx 36\%$, và nếu dùng rank thì về đúng một phiếu bầu trong sáu. Đó là toàn bộ ý nghĩa của bước 2: không phải làm đẹp biểu đồ, mà là ngăn một điểm dữ liệu bệnh hoạn cướp mất quyền biểu quyết của cả universe.

Vài alpha viết dạng biểu thức (phong cách WorldQuant — mỗi alpha một dòng, universe cổ phiếu thanh khoản, rebalance daily) để thấy "tín hiệu" cụ thể trông thế nào:

```
a1 = -rank(returns(close, 5))                          // mean reversion 5 ngày
a2 = rank(close/ts_mean(close, 252) - 1)               // momentum 12 tháng dạng đơn giản
a3 = -rank(ts_corr(rank(volume), rank(close), 10))     // volume chạy trước giá → nghi phân phối
a4 = rank(eps_estimate_revision_30d) / ts_std(returns(close,1), 60)  // revision, chuẩn hóa vol
a5 = -rank((high + low)/2 - vwap)                      // đóng cửa yếu so với VWAP → áp lực bán ngắn hạn
```

Từng dòng đơn lẻ cho IC quãng 0.01–0.03, không đáng trade sau phí. Giá trị nằm ở chỗ chúng **ít tương quan với nhau** vì đến từ những nguồn thông tin khác nhau — giá, volume, analyst, microstructure. Tổ hợp vài chục dòng như vậy, qua neutralization và optimizer, ra một chiến lược thật. Mô hình kinh doanh của WorldQuant đúng nghĩa đen là công nghiệp hóa việc sản xuất các dòng này — hàng triệu alpha trong kho, đãi lấy vài nghìn cái sống sót — một minh họa cực đoan của Fundamental Law mà ta sẽ dựng nền toán ở 7.3. Ở tầng code, năm dòng này ánh xạ gần như một-một sang các operator trong `src/alpha`: `rank`, `ts_corr`, `ts_mean`, `ts_std` là các cs-operator và ts-operator, còn từng alpha là một đơn vị composable đăng ký qua registry — thêm `a6` không đụng vào bất kỳ dòng nào của năm alpha cũ.

Một điểm giải phẫu tinh tế đáng dừng lại: **operator nào áp theo chiều nào**. Các `ts_*` (time-series) chạy dọc thời gian trong từng cổ phiếu — `ts_mean(close, 252)` là trung bình 252 ngày của *chính* cổ phiếu đó. `rank` và các cs-operator chạy ngang cross-section tại một thời điểm — `rank(x)` xếp hạng cổ phiếu này so với mọi cổ phiếu khác *cùng ngày*. Đây là hai vũ trụ khác nhau, và lẫn lộn chúng là lỗi kinh điển của người mới. `rank(ts_corr(...))` trong `a3` trước tiên tính correlation 10 ngày giữa rank-volume và rank-price *trong từng tên* (time-series), rồi mới xếp hạng các correlation đó *ngang các tên* (cross-section). Đảo thứ tự ra một tín hiệu hoàn toàn khác và thường vô nghĩa — bạn sẽ đi tính "tương quan cross-sectional" theo thời gian, một đại lượng chẳng ai đặt tên vì nó không mang thông tin gì.

## 7.2 Signal processing: decay, smoothing và orthogonalization

Mục 7.1 cho bạn pipeline; mục này đào vào ba khâu xử lý tín hiệu mà chất lượng của chúng quyết định phần lớn Sharpe cuối cùng, nhưng người mới thường làm qua loa: tín hiệu **sống bao lâu** (decay), làm **mượt** thế nào cho đúng (smoothing), và làm sao tách các tín hiệu chồng lấn thành các mảnh **độc lập** (orthogonalization).

**Signal decay.** Mọi alpha có một tốc độ phân rã: sau khi tín hiệu phát ra, forward return còn dự báo được trong bao lâu trước khi thông tin đã bị giá hấp thụ. Đo bằng cách tính IC của tín hiệu hôm nay với return ở nhiều horizon: 1 ngày, 5 ngày, 20 ngày, 40 ngày, 60 ngày, 90 ngày. Ví dụ một PEAD signal đo được IC theo horizon như sau:

| Horizon | 1d | 5d | 20d | 40d | 60d | 90d |
|---|---|---|---|---|---|---|
| IC | 0.010 | 0.028 | 0.041 | 0.038 | 0.022 | 0.005 |

Đọc bảng này ra chiến lược. IC bé ở 1 ngày vì phản ứng tức thời phần lớn đã xảy ra trong cú "jump" ngày công bố; nó đạt đỉnh 0.041 quanh 20–40 ngày (drift thật diễn ra ở đây); rồi tắt về ~0 ở 90 ngày khi thông tin đã bị arbitrage hết. Kết luận trực tiếp: **holding period tối ưu quãng 30–40 ngày**, vào lệnh không cần vội trong milliseconds (khác hẳn mean reversion 1 ngày), và giữ quá 60 ngày là trả phí để nắm noise. Một cách gọn để tóm decay là **half-life của IC** — số ngày kể từ đỉnh để IC rơi còn nửa. Đỉnh là 0.041 ở 20d, nửa đỉnh là 0.0205; nhìn bảng, IC chạm mức đó quãng 60d, tức 40 ngày *sau* đỉnh, nên half-life $\approx 40$ ngày. Half-life ngắn (mean reversion) buộc turnover cao và đòi execution rẻ; half-life dài (value) cho phép trade thong thả nhưng phải chịu đựng những giai đoạn drawdown dằng dặc.

Có một sự đánh đổi cốt lõi giữa decay và cost mà mọi researcher phải cân. Tín hiệu decay nhanh mang nhiều thông tin *mới* mỗi ngày (breadth cao — xem 7.3) nhưng buộc bạn giao dịch liên tục để đuổi theo nó (phí cao). Tín hiệu decay chậm rẻ để nắm giữ nhưng cho ít cược độc lập. Điểm ngọt nằm ở chỗ **marginal IC của việc trade thêm một vòng vừa đủ trả phí vòng đó** — và đó chính là điều smoothing điều chỉnh.

**Smoothing đúng cách.** Nếu raw signal nhảy múa ngày-qua-ngày mạnh hơn tốc độ decay thật của thông tin, bạn đang trade noise: mua rồi bán cùng một cổ phiếu chỉ vì tín hiệu rung, trả phí hai chiều mà không có edge tương ứng. Chữa bằng EMA. Một EMA span $L$ có hệ số $\lambda = 2/(L+1)$ và cập nhật $s_t = \lambda \, x_t + (1-\lambda) s_{t-1}$. Ví dụ số: raw signal của một cổ phiếu năm ngày liên tiếp là $x = \{+1.2, -0.3, +0.9, +0.1, +0.8\}$ (rung mạnh vì noise vi mô), làm mượt bằng EMA span 5 nên $\lambda = 2/6 = 1/3$. Khởi tạo $s_0 = 1.2$; rồi $s_1 = \tfrac13(-0.3)+\tfrac23(1.2)=0.70$; $s_2=\tfrac13(0.9)+\tfrac23(0.70)=0.77$; $s_3=\tfrac13(0.1)+\tfrac23(0.77)=0.55$; $s_4=\tfrac13(0.8)+\tfrac23(0.55)=0.63$. Chuỗi mượt {1.20, 0.70, 0.77, 0.55, 0.63} nhấp nhô ít hơn hẳn chuỗi thô — position của bạn không còn đảo chiều mỗi ngày.

Đổi lại, smoothing **làm chậm** phản ứng: EMA span 5 có "center of mass" ở $(L-1)/2 = 2$ ngày, nên nếu tín hiệu thật sự đổi hướng bạn vào trễ khoảng hai ngày. Nguyên tắc calibrate: chọn $L$ sao cho turnover sau smoothing khớp với horizon của thông tin (đo bằng decay ở trên), không mượt hơn thế. Mượt quá tay là cách phổ biến để "giết" một tín hiệu tốt — bạn làm đẹp turnover trên báo cáo nhưng bào mòn chính cái edge decay-nhanh mà mình vừa phát hiện. Quy tắc ngón tay cái: nếu half-life của IC là $h$ ngày, EMA span $L \approx h$ giữ được phần lớn thông tin trong khi cắt gần hết noise ngày-qua-ngày; span $\gg h$ nghĩa là bạn đang cố nắm lâu hơn cả thời gian tín hiệu còn sống.

**Orthogonalization.** Đây là công cụ mạnh nhất và bị hiểu sai nhiều nhất trong signal processing. Vấn đề: bạn có tín hiệu B mới, nhưng nghi nó chỉ là biến tướng của tín hiệu A đã có. Nếu cứ cộng B vào, bạn đang nhân đôi cùng một cược chứ không thêm thông tin. Orthogonalization tách phần của B *không* giải thích được bởi A: hồi quy cross-sectional B lên A rồi lấy residual, $B^\perp = B - \hat\beta A$ với $\hat\beta = \text{Cov}(A,B)/\text{Var}(A)$.

Ví dụ số. Giả sử A và B đã z-score (mean 0, std 1), và correlation cross-sectional giữa chúng là $\rho_{AB} = 0.6$. Vì cả hai chuẩn hóa std 1, $\hat\beta = \rho_{AB} = 0.6$. Phần residual $B^\perp = B - 0.6A$ có variance $\text{Var}(B) - 2\hat\beta\,\text{Cov}(A,B) + \hat\beta^2\text{Var}(A) = 1 - 2(0.6)(0.6) + 0.36 = 1 - 0.36 = 0.64$, tức std $= 0.8$. **Chỉ 64% variance của B là mới**; 36% là A đội lốt. Bây giờ đọc điều đó ra IC. Nếu B có IC gộp 0.030 mà phần lớn IC ấy trùng với A, thì sau khi chuẩn hóa $B^\perp$ về lại std 1, IC của nó có thể chỉ còn quãng 0.015–0.020 — vẫn dương và *độc lập*, đáng thêm vào rổ. Nhưng nếu IC của $B^\perp$ tụt về ~0, thì B chưa bao giờ là tín hiệu mới: nó là A khoác áo khác. Đây là bài test trung thực nhất cho câu hỏi "signal này có thật sự thêm gì không", và nó lột trần vô số "tín hiệu mới" thực chất chỉ là momentum hay value tính lại theo công thức lạ mắt.

Ở tầng danh mục nhiều tín hiệu, orthogonalization tổng quát hóa thành **Gram-Schmidt tuần tự** — trực giao hóa từng tín hiệu mới so với tất cả tín hiệu đã nhận — hoặc **symmetric orthogonalization** (Löwdin) — trực giao hóa đồng thời, không thiên vị thứ tự, đẹp về mặt lý thuyết khi không có lý do ưu tiên tín hiệu nào. Cả hai đều cùng một triết lý: cái danh mục thật sự cần là các *nguồn thông tin độc lập*, không phải số lượng tín hiệu. Nhưng đừng orthogonalize một cách máy móc mọi thứ về mọi thứ. Nếu B trực giao với A mà A lại là tín hiệu bạn *ít tin* (mới, chưa qua incubation), việc ép B "nhường" phần chung cho A có thể phản tác dụng — bạn đang lấy phần vốn từ tín hiệu đáng tin cho tín hiệu chưa được kiểm chứng. Orthogonalization phải đi kèm phán xét về độ tin cậy từng nguồn: nó là dao mổ, không phải máy xay.

## 7.3 Đo chất lượng: IC và Fundamental Law

**Information Coefficient (IC)** là correlation cross-sectional giữa tín hiệu hôm nay và forward return kỳ tới (chuẩn công nghiệp: Spearman rank-IC, chống outlier). Chuỗi IC theo ngày cho mọi thứ cần biết. Mean IC là sức dự báo — **0.02–0.05 là tín hiệu tốt thật sự** với equity daily, và ai khoe IC 0.2 trên universe rộng gần như chắc chắn có look-ahead bug. IC risk-adjusted (mean chia std của IC) đo độ ổn định, thứ quan trọng hơn đỉnh cao. IC decay theo horizon 1d/5d/20d, như mục trước, cho biết tín hiệu sống bao lâu và do đó quyết định holding period cùng tốc độ execution.

**Tính IC bằng tay một lần** — 6 cổ phiếu, một ngày. Tín hiệu xếp hạng: A = 1 (tốt nhất), B = 2, C = 3, D = 4, E = 5, F = 6. Forward return 21 ngày xếp hạng thực tế: A = 2, B = 1, C = 4, D = 3, E = 6, F = 5. Hiệu rank $d_i =$ {−1, 1, −1, 1, −1, 1} nên $\sum d_i^2 = 6$. Công thức Spearman với $n = 6$:

$$IC = 1 - \frac{6\sum d_i^2}{n(n^2-1)} = 1 - \frac{6 \times 6}{6 \times 35} = 1 - \frac{36}{210} = 0.83.$$

Trên 6 tên, một ngày, IC 0.83 dễ như chơi — và vô nghĩa. Trên **3000 tên × 250 ngày**, giữ được mean IC 0.03 với std 0.10 mới là hàng thật: đơn lẻ từng ngày trông như noise (rất nhiều ngày IC âm!), chỉ khi nhìn cả chuỗi mới thấy edge. Tập quen với việc *tín hiệu tốt trông xấu ở mọi mẫu nhỏ* — trực giác này cứu bạn khỏi cả hai lỗi: vứt tín hiệu thật vì vài tuần xấu, và giữ tín hiệu ảo vì vài tuần đẹp.

Định lượng cái "trông như noise" đó cho cụ thể. Chuỗi IC 250 ngày với mean 0.03 và std 0.10 có standard error của mean $= 0.10/\sqrt{250} = 0.0063$, nên $t$-stat $= 0.03/0.0063 = 4.7$ — có ý nghĩa thống kê rất vững. Nhưng xác suất IC của *một ngày bất kỳ* âm là $\Phi(-0.03/0.10) = \Phi(-0.3) \approx 38\%$: gần bốn trên mười ngày, một tín hiệu thật trông "sai". Đây là con số bạn cần thuộc để không hoảng khi live. Chuỗi ba tuần liên tiếp IC âm nghe như thảm họa, nhưng với $p = 0.38$ cho mỗi ngày độc lập, xác suất một chuỗi 15 phiên toàn âm là $0.38^{15}$ — bé, nhưng qua hàng trăm phiên và nhiều tín hiệu chạy song song, những chuỗi xấu như thế *chắc chắn* xảy ra. Biết trước phân phối của cái xấu là cách duy nhất để phân biệt "tín hiệu đang chết" với "tín hiệu tốt đang xui".

**Fundamental Law of Active Management** (Grinold 1989) là công thức triết lý của cả nghề:

$$IR \approx IC \times \sqrt{BR},$$

trong đó IR là information ratio và BR là **breadth** — số cược **độc lập** mỗi năm. Đọc thấm từng vế: kỹ năng dự báo (IC) nhân với **căn** của số lần đặt cược. Universe 4000 cổ phiếu × 250 ngày là $10^6$ cược danh nghĩa mỗi năm, nên IC 0.02 cho IR lý thuyết $0.02 \times \sqrt{10^6} = 20$. Con số hoang đường ấy chính là lời giải cho câu đố "IC bé thế sao RenTec giàu": **công nghiệp hóa số lượng cược yếu-mà-độc-lập**. Hệ quả chiến lược cũng ra thẳng từ công thức: tăng breadth — thêm tài sản, thêm thị trường, thêm tần suất, thêm tín hiệu *không tương quan* — thường dễ hơn tăng IC; và một cược vĩ mô mỗi quý (BR ~ 4) cần IC khổng lồ mới đáng, đó là lý do quant ít chơi trò dự báo Fed.

Đáng dẫn xuất *tại sao* là **căn** của breadth chứ không phải chính breadth, vì đó là linh hồn của cả nghề. Coi mỗi cược như một tín hiệu độc lập cho một chút edge kỳ vọng $\mu$ trên nền noise $\sigma$, nên Sharpe của một cược lẻ tỉ lệ với $\mu/\sigma$. Cộng $N$ cược *độc lập*: kỳ vọng tổng dồn tuyến tính, $\propto N\mu$, nhưng độ lệch chuẩn tổng chỉ dồn theo $\sqrt N$ vì variance của tổng các biến độc lập là tổng các variance ($N\sigma^2$), còn std là căn của nó ($\sqrt N\,\sigma$). Tỉ số kỳ vọng trên rủi ro do đó tăng theo $N\mu / (\sqrt N\,\sigma) = \sqrt N \cdot (\mu/\sigma)$. Đây đúng là running example xuyên suốt sách: đồng xu 51/49 cho Sharpe mỗi cược $\approx 0.02$, nên $N$ cược độc lập cho $SR = 0.02\sqrt N$ — 100 cược thành 0.2, 2500 cược thành 1.0, 10000 cược thành 2.0. Fundamental Law chỉ là phiên bản cross-sectional của chính phép toán ấy: $BR$ đóng vai $N$, $IC$ đóng vai Sharpe-mỗi-cược.

Chữ **độc lập** in đậm mới là chỗ toàn bộ khó khăn nằm ở đó, và định lượng nó là điều tách một QR nghiệp dư khỏi một QR ăn tiền. Các cược trong thực tế *không* độc lập, nên phải thay $BR$ bằng **breadth hiệu dụng** $N_{\text{eff}} \approx N/(1 + (N-1)\bar\rho)$, với $\bar\rho$ là correlation trung bình giữa các cược. Lấy universe 3000 cổ phiếu, residual sau neutralize còn $\bar\rho = 0.02$:

$$N_{\text{eff}} = \frac{3000}{1 + 2999 \times 0.02} = \frac{3000}{60.98} \approx 49$$

cược độc lập mỗi kỳ rebalance — không phải 3000. Cộng thêm việc tín hiệu tự tương quan theo thời gian (hôm nay gần giống hôm qua, nên các "cược" theo ngày không thật sự mới) và transfer coefficient $\approx 0.5$ (phần tín hiệu sống sót qua constraints, chương 11), IR lý thuyết 20 co về khoảng thực tế: $0.02 \times \sqrt{49 \times 250} \approx 2.2$ trước transfer, rồi $\times 0.5$ còn quãng 1.1, và một chiến lược tốt hạ cánh đâu đó trong dải 1.5–3. Bảng số này giải thích tại sao mọi mắt xích của pipeline — neutralization tốt (để $\bar\rho$ nhỏ), tín hiệu decay nhanh vừa đủ (cược mới thật), constraint lỏng đúng chỗ (TC cao) — đều trực tiếp quy ra Sharpe.

Đẩy thêm một bước để thấy độ nhạy khủng khiếp của $N_{\text{eff}}$ với $\bar\rho$. Nếu neutralization tồi và $\bar\rho$ chỉ tăng gấp đôi lên 0.04, thì

$$N_{\text{eff}} = \frac{3000}{1 + 2999 \times 0.04} = \frac{3000}{120.96} \approx 25$$

— breadth hiệu dụng *rơi một nửa* chỉ vì residual correlation nhích lên 2 điểm phần trăm. Và vì $IR \propto \sqrt{N_{\text{eff}}}$, IR rơi theo $\sqrt{49/25} = 1.40$ lần, tức mất 40% Sharpe. Đây là lý do một pod shop giỏi bỏ hàng tháng đánh bóng khâu neutralization tưởng chừng nhàm chán: 2 điểm phần trăm $\bar\rho$ là 40% Sharpe, một cái giá không QR nào dám bỏ qua. Chiều ngược lại cũng đúng và an ủi hơn: mỗi khi bạn thêm được một tín hiệu *thật sự* không tương quan (kéo $\bar\rho$ hiệu dụng của rổ tín hiệu xuống), bạn mua thêm breadth gần như miễn phí. Fundamental Law vì thế không phải công thức để tính một con số rồi cất đi — nó là la bàn nói cho bạn biết giờ nên đầu tư công sức vào IC, vào breadth, hay vào giảm correlation.

## 7.4 Danh mục các họ tín hiệu kinh điển (điểm khởi đầu, không phải đích)

Trước khi liệt kê, một khung tư duy nên áp cho mọi tín hiệu: **ai trả tiền cho alpha này và vì sao nó chưa bị arbitrage hết?** Mỗi họ dưới đây tồn tại vì một lý do kinh tế bền — hoặc một thiên lệch hành vi (nhà đầu tư phản ứng chậm, chạy theo bầy đàn — xem chương 8), hoặc một phần thưởng rủi ro (bạn được trả để ôm rủi ro người khác né), hoặc một ràng buộc thể chế (quỹ index buộc mua khi cổ phiếu vào rổ). Tín hiệu nào không trả lời được câu này thường là data-mining và sẽ chết khi ra live.

- **Momentum cross-sectional** (12-1 tháng: return 12 tháng bỏ tháng gần nhất) — hành vi under-reaction và herding; gãy đuôi trong "momentum crash" 2009, khi short leg bật +80%.
- **Mean reversion ngắn hạn** (đảo return 1–5 ngày) — bù thanh khoản: bạn là người *cung cấp* thanh khoản cho ai đó cần bán gấp; turnover cao, chết nếu execution kém; là tín hiệu nền của stat-arb.
- **Value** (earnings yield, book/price, FCF yield, so trong ngành) — horizon dài từ tháng tới năm, chu kỳ đau kéo dài (2017–2020 value gần như chết lâm sàng rồi sống lại 2021–22).
- **Quality** (ROE cao, accruals thấp — earnings "tiền thật" chứ không phải "kế toán", Sloan 1996 — nợ thấp, biên ổn định).
- **Event-driven**: PEAD (post-earnings announcement drift — giá tiếp tục trôi theo hướng surprise vài tuần sau công bố), index add/delete, buyback, insider trades, 13F cloning.
- **Analyst**: revision của estimates (đàn analyst sửa dự báo chậm và bầy đàn nên tạo drift), recommendation changes.
- **Flow/positioning**: short interest, ETF flows, mutual fund flows, options flow (put/call skew như tín hiệu), dealer gamma positioning.
- **Sentiment/NLP**: tone của news, earnings calls, filings (nay dùng LLM embeddings thay túi từ Loughran-McDonald), social media (đã decay mạnh sau meme-stock era).
- **Seasonality/calendar**: turn-of-month, January effect (phần lớn đã chết), pattern quanh các sự kiện định kỳ.
- **Cross-asset carry & trend**: FX carry, commodity roll yield, bond carry; time-series momentum đa tài sản (Moskowitz-Ooi-Pedersen 2012) là xương sống của CTA.

Danh sách thì gọn, nhưng khoảng cách giữa một dòng trong danh sách và một tín hiệu chạy được là cả một khối lượng công việc. Hai recipe đầy đủ dưới đây cho thấy khoảng cách ấy.

*PEAD chuẩn hóa (SUE).* Định nghĩa $SUE_{i,q} = \dfrac{EPS_{i,q} - \mathbb{E}[EPS_{i,q}]}{\sigma(\text{surprise 8 quý})}$, trong đó $\mathbb{E}[EPS]$ là consensus analyst ngay *trước* công bố — phải point-in-time, tuyệt đối không dùng con số consensus đã được sửa lại sau sự kiện. Vào vị thế **sau** công bố (mở cửa hôm sau, không phải giá close cùng ngày, vì thông tin ra sau close), long decile SUE cao và short decile SUE thấp, giữ 40–60 ngày rồi thoát dần. Chi tiết ăn tiền: surprise theo *doanh thu* và theo *guidance* bắt được phần drift khác với surprise EPS thuần; và một cú "jump" ngày đầu lớn mà giá *vẫn* drift tiếp mới là tín hiệu khỏe (under-reaction thật), còn jump ngược drift là bẫy.

Hãy tính SUE bằng số cho một cái tên. Consensus EPS quý này là $\mathbb{E}[EPS] = 1.20$; công ty báo $EPS = 1.38$; surprise $= +0.18$. Độ lệch chuẩn của surprise tám quý gần nhất (đơn vị dollar-EPS) là $\sigma = 0.12$. Vậy $SUE = 0.18/0.12 = 1.5$ — một surprise lớn hơn 1.5 lần biến động điển hình của chính công ty này, đủ mạnh để lọt decile cao. Bây giờ so với một công ty khác cũng surprise +0.18 nhưng lịch sử earnings của nó nhiễu hơn, $\sigma = 0.30$: $SUE = 0.18/0.30 = 0.60$ — *cùng một dollar surprise nhưng tín hiệu yếu hơn nhiều*, vì với công ty hay nhảy múa, +0.18 chẳng có gì bất thường. Chính bước chia cho $\sigma$ là thứ biến "earnings beat" (ai cũng đọc được trên báo) thành một alpha có thể xếp hạng ngang giữa các tên; không có bước này, SUE chỉ là tin tức.

*Momentum có phanh (risk-managed).* Tín hiệu gốc là return 12-1 tháng; phanh là scale vị thế theo $\hat\sigma_{\text{mom}}$, vol realized 6 tháng của chính danh mục momentum, theo target-vol: $\text{position} \propto \sigma_{\text{target}}/\hat\sigma$. Lý do sâu xa: momentum crash (2009 — short leg bật +80% trong hai tháng) xảy ra khi vol của factor nổ *trước*, nên vol là một tín hiệu cảnh báo *đo được*. Daniel-Moskowitz (2016) ghi nhận Sharpe momentum tăng từ ~0.5 lên ~1.0 sau phanh — ví dụ chuẩn của "biến thể tốt hơn trên một ý tưởng công khai".

Định lượng cái phanh để thấy nó là số học chứ không phải phép màu. Giả sử vol realized dài hạn của danh mục momentum là 12%/năm và bạn nhắm đúng target vol 12%, nên scale nền $= 12/12 = 1.0$. Đầu 2009 vol realized 6 tháng của factor nổ lên 30%/năm, nên target-vol scaling cắt exposure xuống $12/30 = 0.40$: bạn vào cú crash với 40% vị thế bình thường thay vì full. Vì momentum crash là biến cố *vol-nổ-trước-rồi-mới-đảo-chiều*, việc giảm size khi vol cao né được phần lớn cú mất mát mà **không cần dự báo được cú đảo chiều** — bạn chỉ phản ứng với một biến quan sát được là vol, không đoán tương lai. Sharpe cải thiện 0.5 → 1.0 đến từ đúng chỗ này: edge trung bình gần như giữ nguyên, nhưng cắt được cái đuôi trái nặng nhất nên std giảm, mẫu số của Sharpe co lại, và tỉ số phình lên.

Mỗi tín hiệu kể trên là **một dòng ý tưởng đã công khai**, nên alpha thô của nó đã bị cạnh tranh bào mòn. Giá trị của một researcher không nằm ở việc "biết" các họ này — sinh viên năm nhất cũng đọc được — mà ở bốn thứ: biến thể tốt hơn (định nghĩa tinh hơn, dữ liệu sạch hơn, PIT nghiêm hơn), **kết hợp** hàng chục tín hiệu yếu correlation thấp thành một tín hiệu tổng mạnh (đúng Fundamental Law, và là chủ đề mục sau), timing chi phí, và dữ liệu mới mà thị trường chưa kịp định giá.

## 7.5 Kết hợp alpha: từ nhiều tín hiệu yếu đến một tín hiệu mạnh

Đây là nơi Fundamental Law biến từ khẩu hiệu thành công việc kỹ thuật. Bạn có mười, hai mươi, có khi hàng trăm tín hiệu, mỗi cái IC 0.01–0.03. Câu hỏi tiền tỉ: gộp chúng thế nào để phần thông tin độc lập cộng dồn theo $\sqrt{N_{\text{eff}}}$ chứ không bị correlation nuốt? Có một phổ phương pháp từ ngây thơ đến tinh vi, và biết dùng cái nào lúc nào là dấu hiệu của một QR trưởng thành.

**Blend z-score (equal-weight).** Đơn giản nhất: z-score từng tín hiệu về cùng thang, cộng lại, rồi z-score một lần nữa. Ba tín hiệu độc lập, mỗi cái IC 0.03: nếu chúng thực sự không tương quan, IC của tổ hợp là $\bar{IC}\sqrt{N} = 0.03\sqrt{3} = 0.052$ — cùng số học $\sqrt N$ như đồng xu. Công thức tổng quát cho tổ hợp trọng số bằng nhau khi correlation trung bình giữa các tín hiệu là $\bar\rho$:

$$IC_{\text{combo}} = \frac{\bar{IC}\sqrt{N}}{\sqrt{1 + (N-1)\bar\rho}}.$$

Với $\bar\rho = 0$ hệ số nhân là $\sqrt3 = 1.73$. Với $\bar\rho = 0.5$ (ba tín hiệu chồng lấn nặng), hệ số là $\sqrt3/\sqrt{1 + 2\times0.5} = 1.73/1.41 = 1.22$: gộp ba tín hiệu na ná nhau chỉ tốt hơn một tín hiệu đơn lẻ 22%, không phải 73%. Đây, đen trên trắng, là lý do **correlation giữa tín hiệu quan trọng hơn số lượng tín hiệu**. Equal-weight z-score mạnh ở tính bền (không có trọng số nào để overfit) nhưng ngây thơ ở chỗ đối xử mọi tín hiệu như nhau, kể cả khi chất lượng chênh lệch rõ.

**Weighting theo IC (risk-adjusted).** Bước tiến tự nhiên là cho tín hiệu tốt hơn một tiếng nói lớn hơn. Bỏ qua correlation, trọng số tối ưu (kết quả Markowitz áp cho tín hiệu) tỉ lệ với **IC risk-adjusted** $= \bar{IC}/\text{std}(IC)$ — tức tín hiệu vừa dự báo mạnh vừa ổn định. Ví dụ ba tín hiệu: A có $\bar{IC} = 0.03$, $\text{std}(IC) = 0.10$, nên IR-tín-hiệu $= 0.30$; B có $\bar{IC} = 0.04$, $\text{std}(IC) = 0.20$, nên $= 0.20$; C có $\bar{IC} = 0.02$, $\text{std}(IC) = 0.08$, nên $= 0.25$. Chuẩn hóa {0.30, 0.20, 0.25} về tổng 1 cho trọng số {0.40, 0.27, 0.33}. Chú ý B có mean IC *cao nhất* nhưng nhận trọng số *thấp nhất* vì nó bất ổn — đây chính là chỗ risk-adjusted khác với "cứ chọn tín hiệu IC cao nhất". Khi tính cả correlation, công thức đầy đủ là $w \propto \Sigma_{IC}^{-1}\,\overline{IC}$ với $\Sigma_{IC}$ là ma trận covariance của các chuỗi IC — đúng dạng mean-variance của chương 5, chỉ khác là "tài sản" bây giờ là các *tín hiệu*. Cạm bẫy quen thuộc: $\Sigma_{IC}^{-1}$ khuếch đại noise ước lượng dữ dội (chương 5 đã cảnh báo về nghịch đảo covariance), nên thực chiến phải shrink mạnh $\Sigma_{IC}$ về đường chéo; nếu không, optimizer sẽ dồn trọng số vào cặp tín hiệu tình cờ triệt tiêu nhau trong mẫu và bốc hơi khi ra live.

**Blend vs sleeve — một quyết định kiến trúc.** Có hai triết lý gộp khác nhau về bản chất. *Blend* trộn mọi tín hiệu thành **một** vector alpha tổng rồi đưa vào **một** optimizer, ra một danh mục. *Sleeve* để mỗi tín hiệu (hoặc mỗi nhóm) chạy thành **danh mục con riêng**, mỗi sleeve tự tối ưu, rồi phân bổ vốn *giữa các sleeve* như phân bổ giữa các chiến lược. Blend cho lời giải toàn cục tốt hơn về lý thuyết (optimizer thấy toàn bộ tương tác cùng lúc) và tiết kiệm trading vì các tín hiệu triệt tiêu lệnh của nhau *trước* khi ra thị trường — nếu momentum muốn mua cổ phiếu X mà reversal muốn bán, blend netting nội bộ, không trả phí cho cả hai chiều. Sleeve thì dễ quy trách nhiệm hơn (biết chính xác sleeve nào lời lỗ, tắt sleeve hỏng mà không đụng phần còn lại), dễ áp risk limit riêng, và là cách các multi-strat pod shop tổ chức tự nhiên (mỗi pod là một sleeve). Đánh đổi định lượng: blend tiết kiệm phí ròng nhưng khó chẩn đoán khi hỏng; sleeve minh bạch nhưng trả phí cho lệnh chồng lấn — hai sleeve cùng trade X ngược chiều mà vẫn cắn spread hai lần. Thực tế các quỹ lớn thường lai: blend trong từng nhóm tín hiệu cùng horizon (nơi netting đáng giá nhất), sleeve giữa các nhóm khác horizon hoặc khác asset-class.

**Meta-model.** Tầng trên cùng là dùng một mô hình — thường là ML, chương 17 — để *học* cách kết hợp tín hiệu, thay vì áp trọng số tuyến tính cố định. Ý tưởng đắt giá: trọng số tối ưu có thể **phụ thuộc regime**. Momentum đáng tin trong trend, reversal đáng tin trong choppy; giá trị của một tín hiệu có thể phụ thuộc vào vol, vào cross-sectional dispersion, thậm chí vào chính giá trị của các tín hiệu khác (tương tác phi tuyến). Một gradient-boosted tree ăn 20 tín hiệu làm feature và forward return làm label có thể bắt được luật kiểu "khi VIX cao và dispersion rộng thì nghe reversal, ngược lại nghe momentum". Sức mạnh đi kèm hiểm họa tương xứng: meta-model có *nhiều bậc tự do* nên overfit cực dễ — nó sẽ hân hoan học rằng "tháng 3/2020 thì làm thế này" từ đúng một mẫu duy nhất và tưởng đó là quy luật.

Kỷ luật bắt buộc quanh meta-model gồm ba điều. Một, purged/embargoed cross-validation (chương 9) để label không rò rỉ ngược vào train. Hai, giữ số feature khiêm tốn so với số cược *độc lập* — nhớ mục 7.3, một universe 3000 tên có $N_{\text{eff}} \approx 49$ mỗi kỳ chứ không phải 3000, nên "nhiều dữ liệu" là ảo giác; số bậc tự do thực bạn được phép tiêu là rất nhỏ. Ba, luôn benchmark meta-model với một baseline equal-weight z-score: nếu ML không đánh bại được phép cộng ngây thơ *sau* khi trừ chi phí phức tạp và rủi ro overfit, thì phép cộng ngây thơ thắng. Một QR giỏi mặc định nghi ngờ meta-model của chính mình cho đến khi nó sống sót qua incubation live.

Có một nguyên tắc thứ tự nên khắc cốt xuyên suốt mục này: **kết hợp ở tầng tín hiệu (alpha) trước, rồi mới tối ưu ở tầng danh mục (weight) — không trộn hai việc**. Alpha combination trả lời câu "cổ phiếu nào hấp dẫn hơn"; portfolio construction (chương 11) trả lời câu "cầm bao nhiêu mỗi cái dưới ràng buộc rủi ro và chi phí". Gộp lẫn hai tầng — chẳng hạn để optimizer vừa chọn tín hiệu vừa chọn trọng số danh mục cùng một lúc — là công thức chắc chắn tạo ra một cỗ máy overfit không thể chẩn đoán: khi nó hỏng, bạn không biết là do tín hiệu tồi hay do trọng số danh mục sai, và không tách được thì không sửa được.

## 7.6 Alpha lifecycle trong một quỹ thật

```
Idea (đọc paper / quan sát thị trường / data mới)
  → Prototype nhanh (vài ngày; IC, decay, turnover thô)
  → Nếu sống: backtest nghiêm (chương 9) + review bởi người khác
  → Paper trading / incubation vài tháng (chạy như thật, tiền = 0)
  → Cấp vốn nhỏ → theo dõi live vs backtest (độ khớp là "PLA test" của P-world)
  → Scale nếu khớp; giết không thương tiếc nếu decay
```

Kỳ vọng đúng khi qua từng cổng: live/incubation thường chỉ giữ được quãng **50–70% IC của backtest**, phần mất đi là overfitting còn sót cộng alpha decay tự nhiên cộng chi phí thật mà backtest thường tô hồng. Một quỹ có kinh nghiệm *hạ sẵn* kỳ vọng bằng haircut này ngay khi quyết định cấp vốn; tín hiệu live giữ được trên 80% backtest là của hiếm (hoặc là backtest quá bảo thủ, cũng đáng khen). Ngược lại, live ra gần 0 trong khi backtest đẹp: nghi án đầu tiên luôn là *data khác nhau giữa research và production* — một nguồn giá khác, một quy ước timestamp khác, một cái corporate-action adjust lệch. Vì thế các shop tốt ép **research và production dùng chung một data layer**, một lý do kiến trúc nữa cho việc gom mọi thứ vào `src/alpha`.

Định lượng cái haircut cho một quyết định cấp vốn cụ thể. Backtest cho Sharpe 1.4. Áp haircut 60% lên *edge* (Sharpe tỉ lệ với edge khi vol giữ nguyên): kỳ vọng live $\approx 0.60 \times 1.4 = 0.84$. Nếu capacity và crowding bào thêm 0.1–0.2 nữa, con số ra live thực tế quanh 0.65–0.75 — vẫn đáng cấp vốn, nhưng nếu bạn *lập kế hoạch sizing* dựa trên 1.4 thì bạn sẽ đặt cược quá tay, và cú drawdown đầu tiên — vốn hoàn toàn bình thường với một chiến lược Sharpe 0.7 — đủ để đóng chiến lược trước khi nó kịp chứng minh mình. Đây là lý do haircut không phải là bi quan mà là kỷ luật sizing: bạn cấp vốn theo con số *sau* haircut, và để những bất ngờ dễ chịu là quà tặng chứ không phải giả định.

Tỷ lệ sống điển hình từ idea tới production là **vài phần trăm**, và cụ thể hóa nó giúp bạn hiệu chỉnh kỳ vọng nghề. Một researcher siêng năng thử quãng 200 ý tưởng một năm; qua cổng prototype còn ~40 sống (IC dương, decay hợp lý); qua backtest nghiêm và review còn ~12; qua incubation live vài tháng còn ~5–8 thật sự được cấp vốn có ý nghĩa. Từ 200 xuống 6 là ~3% — và con số này *phải* thấp, vì nếu tỷ lệ sống của bạn cao thì gần như chắc chắn cổng lọc quá lỏng và bạn đang cấp vốn cho noise. Văn hóa quỹ tốt là giết nhanh, ghi chép mọi thí nghiệm (kể cả xác chết — để đếm multiple testing và để người sau khỏi đào lại cùng một hố), và tách người đề xuất khỏi người thẩm định.

Việc đếm số thí nghiệm không phải là thủ tục hành chính, nó là đầu vào *trực tiếp* cho deflated Sharpe (chương 9). Thử $N = 1000$ cấu hình trên $T = 10$ năm dữ liệu, ngưỡng Sharpe "may rủi thuần túy" đã là

$$SR_0 = \sqrt{\frac{2\ln N}{T}} = \sqrt{\frac{2\ln 1000}{10}} = \sqrt{\frac{13.8}{10}} = 1.18,$$

nghĩa là ngay cả khi *mọi* tín hiệu của bạn đều vô dụng, cái tốt nhất trong 1000 lần thử vẫn kỳ vọng show Sharpe quãng 1.18 chỉ nhờ hên. Nên một backtest Sharpe 1.2 sau 1000 lần thử gần như chắc chắn là đồ giả. Không ghi chép số lần thử nghĩa là không biết ngưỡng này, và không biết ngưỡng này nghĩa là tự lừa mình một cách có hệ thống — bạn sẽ đều đặn cấp vốn cho những con số 1.2 mà lẽ ra phải vứt.

Trong `quantc`, `src/alpha` được thiết kế đúng cho vòng đời này: signal là các đơn vị composable đăng ký qua registry, dùng chung một backtest engine, đo IC và turnover theo cùng một chuẩn — thêm một alpha mới không đụng vào core. Kiến trúc ấy không phải để code đẹp, mà là để giải đúng ba nỗi đau vừa kể. Cùng một data layer cho research và production chống được lỗi live-ra-0. Một sổ ghi mọi thí nghiệm chống được multiple-testing tự lừa. Và một pipeline chuẩn hóa (mục 7.1) chạy giống hệt nhau ở mọi alpha, để cái duy nhất phân biệt một tín hiệu tốt với một tín hiệu tồi đúng là *giả thuyết kinh tế đằng sau nó* — chứ không phải một khác biệt vô tình trong cách một người tình cờ xử lý dữ liệu khác người kia.

# Chương 8: Nền tảng hành vi và giới hạn arbitrage

Chương trước dạy bạn *sản xuất* alpha; chương này dạy bạn *tin* vào nó. Mỗi tín hiệu bạn viết ra là một khẳng định táo bạo về thế giới: rằng ở đâu đó ngoài kia có một dòng tiền định giá sai, và bạn — chứ không phải hàng nghìn quant khác cầm cùng dữ liệu — sẽ hớt được phần chênh. Câu hỏi mà mọi buổi review alpha nghiêm túc bắt đầu bằng không phải "Sharpe bao nhiêu" mà là hai câu khó chịu hơn: **ai đang trả tiền cho tôi, và vì sao họ chưa ngừng?** Nếu bạn không trả lời được, con số Sharpe đẹp trong backtest gần như chắc chắn là một hồn ma do overfitting sinh ra (chương 9), hoặc là một khoản alpha thật đã chết trước khi bạn kịp cấp vốn.

Trả lời hai câu đó cần một khung lý thuyết mà nghề này không thể né: thị trường hiệu quả tới mức nào, và khi nó không hiệu quả thì *vì sao sự không hiệu quả đó không tự biến mất*. Đó là toàn bộ nội dung chương này — efficient market hypothesis (EMH) như một baseline để phản bác, limits to arbitrage như lời giải thích vì sao alpha tồn tại dai dẳng, behavioral biases như cỗ máy đẻ ra anomaly, và cuối cùng một bản đồ phân loại alpha theo **nguồn gốc** và **tuổi thọ kỳ vọng** — bản đồ quan trọng nhất để một researcher biết mình đang cầm loại tài sản gì trên tay.

## 8.1 Efficient Market Hypothesis — baseline để phản bác, không phải chân lý để thờ

EMH của Eugene Fama (1970) nói: giá đã phản ánh mọi thông tin sẵn có, nên không ai kiếm được lợi nhuận vượt trội đã điều chỉnh rủi ro một cách hệ thống. Fama chia làm ba mức theo *tập thông tin* mà giá đã hấp thụ. **Weak form**: giá đã phản ánh toàn bộ lịch sử giá quá khứ — hệ quả là technical analysis thuần túy (chỉ dùng giá/volume quá khứ) không tạo edge. **Semi-strong form**: giá phản ánh mọi thông tin *công khai* — báo cáo tài chính, tin tức, earnings — nên phân tích cơ bản trên dữ liệu công khai cũng vô ích, giá điều chỉnh tức thì khi tin ra. **Strong form**: giá phản ánh cả thông tin *nội bộ* — kể cả insider cũng không thắng; mức này gần như không ai tin vì insider trading kiếm tiền có thật (và là tội hình sự chính vì nó kiếm được tiền).

Điều quan trọng cho một quant không phải EMH đúng hay sai — mà là nó **gần đúng tới đâu**. Thị trường Mỹ large-cap là gần-hiệu-quả một cách đáng nể: một tin earnings surprise lớn được giá hấp thụ phần lớn trong vài giây, và bất kỳ ai định "đọc báo rồi mua" đều đến muộn. Nhưng "gần" không phải "hoàn hảo", và toàn bộ nghề buy-side sống trong khe hở giữa hai từ đó.

Hãy định lượng cái khe hở. Giả sử một tín hiệu equity daily có rank-IC trung bình 0.03 — con số "tín hiệu tốt thật" đã gặp ở chương 7. Dưới EMH nghiêm ngặt, IC kỳ vọng của mọi tín hiệu chỉ-dùng-thông-tin-công-khai phải bằng **0**. Vậy IC 0.03 nói gì? Nó nói thị trường sai một lượng nhỏ mà đo được. Nhưng nhỏ cỡ nào? Correlation 0.03 giữa tín hiệu và forward return nghĩa là tín hiệu giải thích $R^2 = 0.03^2 = 0.0009$, tức **0.09%** phương sai của return cross-sectional. Chín phần vạn. Đó là toàn bộ "sự không hiệu quả" mà bạn khai thác — và điều kỳ diệu là nó đủ để làm giàu.

Vì sao chín phần vạn phương sai lại đủ? Vì Fundamental Law of Active Management (Grinold, chương 7) không nhân edge với phương sai mà nhân với **số lần đặt cược**. Công thức là $IR = IC \cdot \sqrt{BR}$, với $BR$ là breadth — số cược *độc lập* mỗi năm. Lấy đúng con số momentum của sách: một tín hiệu như momentum 12-1 có IC quãng 0.025 và trade trên top-1000 cổ phiếu Mỹ. Nếu book chỉ đặt một cược khổng lồ mỗi năm, IR = $0.025 \cdot \sqrt{1} = 0.025$ — vô dụng, không ai cấp vốn cho một Sharpe 0.025. Nhưng nếu bạn rải cược trên ~1000 tên và tái định vị đủ thường xuyên để có, chẳng hạn, khoảng 1300 cược gần-độc-lập mỗi năm, thì $IR = 0.025 \cdot \sqrt{1300} \approx 0.9$. Cùng một edge tí hon 0.025, breadth biến nó thành Sharpe 0.9 — đúng con số momentum pre-fee của running example. Đây là toàn bộ triết lý buy-side gói trong một dấu căn: bạn không cần đúng nhiều, bạn cần đúng *một tí, rất nhiều lần, độc lập*. Cùng logic với đồng xu 51/49 của running example — mỗi cược Sharpe 0.02, nhưng 2500 cược độc lập cho $0.02\sqrt{2500} = 1.0$. EMH gần đúng tới mức 99.91% phương sai là noise không dự báo được; nghề của bạn là biến 0.09% còn lại thành tiền qua $\sqrt{BR}$.

Bằng chứng thực nghiệm chống EMH mạnh nhất không phải một chiến lược lẻ mà là sự tồn tại dai dẳng của cả **họ anomaly** đã công bố công khai hàng thập kỷ mà vẫn chưa chết hẳn. Momentum 12-1 (return 12 tháng bỏ tháng gần nhất) được Jegadeesh-Titman công bố năm 1993; hơn ba thập kỷ sau, trên top-1000 cổ phiếu Mỹ nó vẫn cho rank-IC trung bình khoảng 0.025 với std(IC) khoảng 0.11, dịch ra Sharpe long-short decile trước phí quanh 0.9 (sau phí ~0.75). Dưới semi-strong EMH điều này *không được phép xảy ra*: chiến lược chỉ dùng giá quá khứ, đã in ra giấy, ai cũng đọc được, mà vẫn kiếm tiền sau ba mươi năm. Hoặc EMH sai, hoặc có một lý do sâu hơn khiến arbitrageur không xóa được nó. Câu trả lời — như ta sẽ thấy — là *cả hai*: momentum kiếm tiền vì con người under-react (behavioral), và nó không bị arbitrage hết vì nó gãy đúng lúc arbitrageur yếu nhất (limits to arbitrage). Đó là cặp bài trùng của toàn chương.

Phiên bản EMH mà giới quant thực sự làm việc cùng là câu nói của Andrew Lo: thị trường không hiệu quả *tuyệt đối* mà hiệu quả *thích nghi* (Adaptive Markets) — alpha có thật, nhưng nó là tài nguyên cạn: mỗi chiến lược khai thác chính nó bào mòn cơ hội mình khai thác. Bạn không sống trong một thị trường hiệu quả hay không hiệu quả; bạn sống trong một cuộc chạy đua nơi edge liên tục bị san phẳng và liên tục tái sinh từ dòng người mới, thông tin mới, cấu trúc mới. Chương này giải thích *cơ chế* của cả sự tái sinh lẫn sự san phẳng đó.

## 8.2 Limits to arbitrage — vì sao giá sai không tự sửa

Câu hỏi trung tâm: nếu momentum hay value định giá sai một cách có hệ thống, tại sao đội quân arbitrageur không dồn vốn vào cho tới khi giá về fair và alpha biến mất? Lý thuyết EMH ngầm giả định một arbitrageur *lý trí, vốn vô hạn, horizon vô hạn* luôn sẵn sàng ép giá về đúng. Thực tế mọi giả định đó đều sai, và chính chỗ sai là nơi alpha trú ngụ. "Limits to arbitrage" là tên gọi chung cho các lý do arbitrageur thật — người thật, tiền vay, ông chủ nóng ruột — không thể làm cái việc lý thuyết bảo họ phải làm.

### Noise trader risk — De Long, Shleifer, Summers, Waldmann (1990)

Bài học đầu tiên và đau nhất: giá sai có thể *sai thêm* trước khi đúng, và bạn có thể phá sản trước khi được minh oan. De Long-Shleifer-Summers-Waldmann (DSSW, 1990) mô hình hóa điều này. Trong thị trường có "noise trader" — người giao dịch theo sentiment phi lý — arbitrageur biết một tài sản đang bị định giá cao 10% và short nó. Nhưng noise trader đang trong cơn hưng phấn có thể đẩy giá cao thêm 20% nữa. Arbitrageur short ở mức +10% giờ ôm khoản lỗ chưa thực hiện, có thể ăn margin call, buộc đóng vị thế đúng đáy của sự phi lý — tức mua lại ở +30% để cắt lỗ, khóa chặt khoản thua. Cái *rủi ro rằng sentiment đi ngược thêm* chính là noise trader risk, và nó là một rủi ro **không hedge được** vì nguồn của nó là tâm lý đám đông, không phải một factor có thể trung hòa.

Con số làm rõ vì sao rủi ro này đủ chết người. Giả sử bạn short một rổ meme-stock định giá cao, tin chắc chúng sẽ giảm 40% trong một năm — một cược có kỳ vọng tuyệt vời. Nhưng vol của rổ đó là 8%/ngày (không phóng đại cho meme-stock giai đoạn 2021). Trong khi chờ luận điểm đúng, giá có thể chạy ngược $+2\sigma$ trong một tuần: $2 \times 8\% \times \sqrt{5} \approx 35.8\%$ lỗ tạm thời chỉ trong năm ngày giao dịch (dùng quy tắc $\sqrt{T}$ cho vol nhiều ngày, năm ngày → nhân $\sqrt 5 \approx 2.24$). Nếu bạn dùng đòn bẩy khiêm tốn 2:1, khoản lỗ 36% trên gross ăn 72% equity của vị thế — quá đủ để một risk manager bắt bạn cắt. Bạn *đúng về đích* nhưng *chết trên đường*. Đây là lý do câu châm ngôn "thị trường có thể phi lý lâu hơn bạn có thể trụ vốn" (Keynes) không phải lời than mà là một định lý thực nghiệm: horizon hữu hạn + đòn bẩy + noise trader risk = arbitrageur không dám ép giá về fair với đủ lực.

### Ràng buộc funding và margin — arbitrage cần vốn, và vốn cạn đúng lúc

Arbitrage sách giáo khoa là "self-financing": short cái đắt, long cái rẻ, thu về tiền ngay. Arbitrage thật cần **collateral**. Mỗi vị thế ăn margin; mỗi khoản lỗ tạm thời làm margin phình ra đúng lúc bạn cần vốn nhất. Đây là cơ chế phá vỡ arbitrage kinh điển nhất, và nó có tính **procyclical** tàn nhẫn: khi giá sai nhiều nhất (khủng hoảng, panic) cũng là khi funding đắt nhất và haircut cao nhất, nên arbitrageur bị đẩy ra khỏi thị trường đúng khoảnh khắc cơ hội lớn nhất.

Ví dụ giáo khoa là LTCM 1998, nhưng hãy làm một ví dụ số nhỏ để thấy cơ chế. Cặp pairs-trade cổ điển: spread giữa hai cổ phiếu tương đương đang giãn bất thường, mô hình OU của bạn (chương về mean-reversion) cho $\kappa = 0.05$/ngày, tức half-life $\ln 2 / 0.05 \approx 13.9$ ngày, spread $\sigma = 2.4\%$. Bạn vào ở $+2\sigma = 4.8\%$ độ giãn, kỳ vọng nó về 0. Đây là cược mean-reversion đẹp. Nhưng giả sử prime broker của bạn đặt margin theo giá trị gross và haircut tăng khi vol tăng. Spread giãn tiếp lên $+3\sigma = 7.2\%$ (hoàn toàn trong phân phối — đó là lý do stop đặt ở $\pm 3.5$ đến $4\sigma$): tính từ điểm vào $+2\sigma$, bạn đang lỗ tạm thời $7.2\% - 4.8\% = 2.4\%$ giá trị spread, nhưng đồng thời vol tăng khiến broker nâng haircut từ 15% lên 25%. Cú kép ở đây có thể ước lượng cụ thể: giả sử vị thế gross \$10M, buffer tiền mặt ban đầu \$1.5M (15% haircut). Khi haircut lên 25%, yêu cầu collateral nhảy từ \$1.5M lên \$2.5M — cần nạp thêm \$1M *chỉ vì haircut*; cộng thêm \$0.24M lỗ mark-to-market (2.4% của \$10M). Nếu book không có sẵn \$1.24M dự phòng, bạn buộc phải đóng ở $+3\sigma$, khóa lỗ, đúng lúc kỳ vọng thu hồi cao nhất. Cùng một cược, cùng một mô hình đúng, hai nhà giao dịch: người có buffer vốn 30% sống và ăn trọn mean-reversion về 0; người full-margin chết ở đáy. **Alpha không nằm ở tín hiệu mà ở bảng cân đối kế toán** — một chủ đề sẽ trở lại ở chương risk management và execution.

### Horizon risk và bài toán agency — Shleifer-Vishny (1997)

Đóng góp sâu nhất về vì sao arbitrage bị giới hạn đến từ Shleifer-Vishny (1997), "The Limits of Arbitrage". Điểm của họ tinh vi và phản trực giác: arbitrageur chuyên nghiệp *quản tiền của người khác*, và điều đó thay đổi mọi thứ. Nhà đầu tư (LP, ông chủ, risk committee) đánh giá arbitrageur theo **hiệu suất gần đây**. Khi giá sai nhất — spread giãn cực đại — cũng là khi quỹ arbitrage vừa lỗ nặng nhất (vì họ đã vào sớm khi spread mới bắt đầu giãn). Nhà đầu tư nhìn khoản lỗ, hoảng, rút vốn. Vậy đúng lúc cơ hội hấp dẫn nhất, arbitrageur lại bị *rút vốn* thay vì được *bơm thêm* — dòng vốn chảy ngược chiều lẽ phải. Shleifer-Vishny gọi đây là "performance-based arbitrage": vốn không tự do dịch chuyển tới cơ hội mà bị ràng bởi tâm lý và hợp đồng của người cấp vốn.

Hệ quả lý thuyết cực mạnh: arbitrageur **không** ép giá về fair ngay, mà chỉ dám ép *một phần*, và giữ vốn khô để nạp thêm nếu giá sai thêm — hoặc tệ hơn, phải bán ra khi giá sai thêm, khuếch đại độ sai. Đây là lý do các anomaly "biết rồi vẫn còn": thị trường thiếu một lực nắn giá đủ mạnh và đủ kiên nhẫn. Nó cũng giải thích tại sao alpha hội tụ (convergence trade) — cược rằng hai giá sẽ gặp nhau — nguy hiểm hơn nhiều so với vẻ ngoài: bạn không chỉ cần đúng về đích đến, bạn cần đúng *trước khi vốn của bạn bị rút*.

Định lượng bài toán agency. Một quỹ market-neutral có kỳ vọng annualized alpha 8%, vol 10%, tức Sharpe 0.8 — nghe hấp dẫn. Nhưng phân phối P&L có drawdown. Với vol năm 10%, một drawdown $-15\%$ tương đương một cú $-1.5\sigma$ (vì $0.15/0.10 = 1.5$) — và ở Sharpe 0.8, những cú $-1.5\sigma$ trong một cửa sổ 12 tháng *không hiếm chút nào*, vài năm lại gặp một lần. Nhiều LP có điều khoản ngầm hoặc minh: lỗ 15-20% thì rút. Vậy quỹ này phải *quản lý drawdown chặt hơn mức tối ưu về mặt kinh tế thuần túy* — cắt vị thế sớm, giữ vol thấp hơn Kelly đề xuất. Định lượng cái giá: full-Kelly cho một edge Sharpe 0.8 khuyến nghị chạy ở vol quãng gấp đôi so với mức mà một quỹ sợ-rút-vốn dám chạy; ép vol xuống một nửa để giữ đỉnh drawdown trong ngưỡng LP chịu được nghĩa là bỏ lại một phần đáng kể growth rate lý thuyết (nhắc lại từ chương Kelly: half-Kelly giữ ~75% growth với nửa variance — cắt sâu hơn nữa để né rút vốn thì hy sinh nhiều hơn thế). Cái "thuế agency" này chính là phần alpha mà arbitrageur *không dám ăn*, và nó là quà tặng cho những ai có vốn kiên nhẫn hơn (endowment, sovereign fund, hoặc một pod shop với risk budget kỷ luật và LP đã ký chấp nhận drawdown). Câu hỏi "ai trả tiền cho alpha này" đôi khi có đáp án: *chính những arbitrageur khác, những người bị ông chủ của họ bắt bán đúng đáy*.

Ba lực trên — noise trader risk, funding constraint, agency/horizon risk — không loại trừ nhau; chúng cộng hưởng. Chúng cùng nói một điều: khoảng cách từ "giá sai" tới "alpha bỏ túi được" đầy chông gai, và chính chông gai đó là lý do alpha tồn tại. Một tín hiệu *không* có limits to arbitrage bảo vệ nó là một tín hiệu sẽ chết ngay khi đủ vốn thông minh phát hiện — đó là số phận của phần lớn "anomaly" học thuật sau khi công bố (McLean-Pontiff 2016 đo được post-publication decay trung bình khoảng 32% của alpha ngoài mẫu, và tới ~58% nếu tính cả phần bị arbitrage sau đó — con số ta sẽ dùng lại ở 8.4).

## 8.3 Behavioral biases — cỗ máy đẻ ra anomaly

Nếu limits to arbitrage giải thích *vì sao* giá sai không tự sửa, behavioral finance giải thích *vì sao* giá sai ngay từ đầu. Nguồn của sai lệch là những lỗi hệ thống — không phải ngẫu nhiên — trong cách con người xử lý thông tin và ra quyết định. "Hệ thống" là từ khóa: nếu lỗi ngẫu nhiên, chúng triệt tiêu nhau và giá vẫn đúng trung bình. Behavioral finance chỉ ra rằng lỗi con người *lệch cùng hướng*, tạo áp lực giá dai dẳng mà một quant kỷ luật có thể đứng bên kia. Dưới đây là bốn cỗ máy chính, mỗi cái nối với một anomaly có thể trade.

### Disposition effect → momentum under-reaction

Disposition effect (Shefrin-Statman 1985, đo lường bởi Odean 1998 trên dữ liệu tài khoản thật): nhà đầu tư bán cổ phiếu *thắng* quá sớm và giữ cổ phiếu *thua* quá lâu — họ ghét thực hiện khoản lỗ (loss aversion) và thích khóa khoản lãi nhỏ. Odean đo trên hàng chục nghìn tài khoản: xác suất bán một winner cao hơn khoảng 1.5 lần xác suất bán một loser ở cùng mức lãi/lỗ tuyệt đối.

Hệ quả giá là nền tảng vi mô của momentum. Khi một cổ phiếu có tin tốt và bắt đầu tăng, làn sóng disposition-driven selling (người đang lãi vội chốt) *kìm hãm* đà tăng — giá lẽ ra nhảy tới fair value ngay lại chỉ bò lên từ từ vì áp lực bán từ những người muốn chốt lời. Kết quả: giá **under-react** với tin tốt, và phần điều chỉnh còn lại rỉ ra trong nhiều tuần sau — chính là momentum drift. Ngược lại với tin xấu: người thua không chịu bán (không chịu thực hiện lỗ), giá bị *níu lại* không giảm đủ nhanh, rồi rỉ xuống sau. Grinblatt-Han (2005) mô hình hóa: chính disposition effect tạo ra "khoảng cách" giữa giá thị trường và fundamental, và khoảng cách đó đóng dần theo thời gian — đó là momentum.

Con số nối mạch. Momentum 12-1 trên top-1000 Mỹ có rank-IC ~0.025 nghĩa là mỗi ngày, thứ hạng momentum tương quan 0.025 với thứ hạng forward return — yếu nhưng dương *bền*. Cơ chế disposition giải thích vì sao IC dương: winners bị bán chậm nên chưa lên đủ (còn dư địa lên → forward return dương), losers bị giữ chậm nên chưa xuống đủ (còn dư địa xuống → forward return âm). Long winner/short loser đứng đúng bên của dòng disposition. Và đây là chỗ hai nửa chương gặp nhau: momentum kiếm tiền vì under-reaction (behavioral, mục này), nhưng nó không bị arbitrage hết vì momentum crash — 2009, short leg bật +80% trong vài tháng khi các loser bị bán quá đà đảo chiều dữ dội — xảy ra đúng lúc vol factor nổ và arbitrageur bị margin/agency ép ra (limits to arbitrage, 8.2). Cái đuôi trái $-25\%$ MDD tập trung 2009 chính là **cái giá** giữ cho momentum sống: nó là phần bù rủi ro crash mà không phải ai cũng dám ôm.

### Overreaction → long-term reversal

Nghịch lý đẹp: cùng một đám đông under-react với tin mới lại **over-react** với chuỗi tin dài. De Bondt-Thaler (1985) — bài khai sinh behavioral finance thực nghiệm — chỉ ra: cổ phiếu thua thảm nhất trong 3-5 năm qua (extreme losers) *vượt trội* thị trường trong 3-5 năm tiếp, và winners quá khứ *thua* thị trường sau. Cơ chế: representativeness heuristic — người ta ngoại suy quá đà, coi một công ty vừa có 5 năm tệ là "công ty tệ vĩnh viễn", bán tháo tới mức giá thấp phi lý; rồi mean-reversion cơ bản (lợi nhuận hồi phục về trung bình ngành) đưa giá trở lại.

Con số De Bondt-Thaler gốc: danh mục 35 extreme losers (formation 3 năm) vượt danh mục 35 extreme winners khoảng **25% cộng dồn trong 36 tháng** sau đó — tức quãng $25\%/3 \approx 8\%$/năm chênh lệch loser-trừ-winner, một spread rất lớn cho một chiến lược đơn giản. Điểm cực kỳ quan trọng cho một quant: đây là *reversal ở horizon dài* (3-5 năm), **ngược dấu** với *momentum ở horizon trung* (3-12 tháng). Cùng một biến giá, dấu của edge đảo theo horizon: mua cái vừa tăng 6 tháng qua (momentum), nhưng bán cái đã tăng 5 năm qua (reversal). Đây chính là hiện thân của value: extreme losers dài hạn có price/book thấp — long-term reversal và value factor phần lớn là *cùng một hiện tượng nhìn từ hai góc*. Và nó cũng nối limits to arbitrage: reversal horizon 3-5 năm đòi hỏi giữ vị thế *nhiều năm* qua đau đớn — đúng loại horizon mà agency risk (8.2) khiến hầu hết vốn không chịu nổi. Ai trả tiền cho value premium? Người bán tháo losers vì tuyệt vọng, và những arbitrageur không đủ kiên nhẫn giữ ba năm.

### Anchoring và conservatism → PEAD drift

Anchoring (Tversky-Kahneman): con người neo ước lượng vào một điểm tham chiếu và điều chỉnh *không đủ* khi có bằng chứng mới. Conservatism là họ hàng gần: cập nhật niềm tin quá chậm so với Bayes. Ứng dụng thẳng vào giá: khi một công ty công bố earnings vượt kỳ vọng lớn, nhà đầu tư (và analyst) neo vào kỳ vọng cũ, điều chỉnh dự báo lên *không đủ*, nên giá phản ứng *thiếu* với surprise — rồi tiếp tục drift theo hướng surprise trong nhiều tuần khi thực tế buộc mọi người cập nhật dần. Đây là **PEAD** (post-earnings announcement drift), một trong những anomaly bền nhất và có nền tảng behavioral rõ nhất.

Làm một ví dụ số đầy đủ. Chuẩn hóa surprise thành SUE (standardized unexpected earnings): $SUE = (\text{EPS thực} - \text{EPS consensus}) / \sigma(\text{surprise})$. Một cổ phiếu có EPS thực \$1.20, consensus \$1.00, và độ lệch chuẩn lịch sử của surprise là \$0.10 → $SUE = (1.20 - 1.00)/0.10 = 2.0$ — một surprise dương 2 sigma. Bằng chứng thực nghiệm (Bernard-Thomas 1989 và vô số bản sao): danh mục long decile SUE cao / short decile SUE thấp kiếm khoảng **6-8% annualized** drift, phần lớn tập trung trong ~60 ngày sau công bố và quanh *earnings kế tiếp* (khi một surprise nữa xác nhận). Dịch con số annualized đó ra *mỗi lần trade* để thấy nó thực chất bao nhiêu: nếu giữ vị thế đúng cửa sổ ~60 ngày giao dịch ($60/252 \approx 0.24$ năm), thì 6-8%/năm annualized tương đương chỉ khoảng $6\% \times 0.24 \approx 1.4\%$ đến $8\% \times 0.24 \approx 1.9\%$ **mỗi lần trade** trên cửa sổ đó — nhỏ, nhưng lặp lại qua hàng nghìn earnings/năm thì breadth (8.1) lại làm phần còn lại. Cái đẹp behavioral: nếu thị trường Bayes hoàn hảo, toàn bộ phản ứng phải xảy ra trong giây đầu; thực tế phản ứng ngày đầu (jump) *lớn* nhưng vẫn còn drift kéo dài — bằng chứng trực tiếp của conservatism/under-reaction. Cạm bẫy thực chiến (chương 7 đã cảnh báo): phải vào *sau* công bố (mở cửa hôm sau, vì thông tin ra sau close), và jump-ngược-drift là bẫy — under-reaction *thật* là jump cùng chiều với drift theo sau, không phải jump rồi đảo.

### Herding và overconfidence → bong bóng, crash, và excess volatility

Hai bias cấp đám đông. **Herding**: người ta sao chép hành động của số đông, một phần vì lý do rational (thông tin của người khác có giá trị — information cascade) và một phần vì lý do agency (an toàn nghề nghiệp khi sai cùng mọi người). Analyst herd khi sửa dự báo — họ dịch chuyển estimate theo đàn, chậm và cùng hướng, tạo drift trong revision (một họ tín hiệu ở chương 7). Fund manager herd vào cùng cổ phiếu "phải có", tạo crowding — và crowding là mầm của deleveraging cascade. Quant quake tháng 8/2007 là ví dụ giáo khoa: khi một quỹ multi-strat bị buộc thanh lý book market-neutral, các quỹ khác cầm *cùng* vị thế bị kéo theo. Định lượng độ khủng khiếp của nó: một chiến lược market-neutral điển hình chạy vol quãng 0.5%/ngày, nên vol trên cửa sổ ba ngày là $0.5\% \times \sqrt{3} \approx 0.87\%$. Cú lỗ quant quake trong ba ngày đầu tháng 8/2007 nhiều quỹ ghi nhận cỡ 3-4% — tức khoảng $3.4\%/0.87\% \approx 4\sigma$ so với cửa sổ ba ngày đó, một sự kiện lẽ ra "vài chục nghìn năm mới gặp một lần" dưới giả định normal, xảy ra chỉ vì mọi người cầm *cùng một book* và phải bán *cùng một lúc*. Đó là bằng chứng sống rằng rủi ro thật của một danh mục không nằm ở vol thường ngày mà ở crowding — chủ đề sẽ khép lại chương này.

**Overconfidence** (Barber-Odean 2000, trên dữ liệu tài khoản retail thật): nhà đầu tư đánh giá quá cao độ chính xác thông tin của mình → giao dịch *quá nhiều*. Barber-Odean đo: nhóm tài khoản giao dịch nhiều nhất kiếm net return kém thị trường khoảng **6.5%/năm** sau phí, gần như toàn bộ do chi phí giao dịch từ over-trading — trong khi gross return của họ gần bằng thị trường. Cơ chế số học rất sạch và đáng dựng lại: nhóm này quay vòng danh mục quãng 250%/năm, và mỗi vòng round-trip (mua + bán) ở giai đoạn đó tốn cỡ 2.6% giữa hoa hồng và bid-ask spread; $2.5 \times 2.6\% = 6.5\%$/năm bốc hơi vào chi phí — đúng bằng con số underperformance. Đọc câu này hai lần: chính over-trading do overconfidence *tạo ra* thanh khoản và turnover mà mean-reversion ngắn hạn khai thác. Khi retail hoảng bán gấp (over-trade theo panic), họ cần đối tác *ngay*, và trả premium cho tính cấp bách đó. Người cung cấp thanh khoản — stat-arb đứng bên kia lệnh của họ — thu premium ấy. Overconfidence + panic của một bên là bảng lương của bên kia.

Overconfidence còn giải thích một sự thật vĩ mô hơn: **excess volatility** (Shiller 1981). Giá cổ phiếu dao động mạnh hơn nhiều so với dòng cổ tức tương lai chiết khấu có thể biện minh — Shiller đo rằng volatility thực của giá lớn gấp nhiều lần (bội số 5-13 lần theo các ước lượng của ông) so với volatility mà mô hình present-value của cổ tức cho phép; thị trường "quá xúc động". Excess volatility là nền cho mọi chiến lược mean-reversion và variance-selling: nếu giá dao động quá mức so với fundamental, đứng bán sự dao động đó (fade extremes, bán vol) có kỳ vọng dương. Đây cũng là điểm giao P/Q: variance risk premium — implied vol trung bình cao hơn realized vol — một phần là phần bù cho việc gánh rủi ro tail, một phần là hệ quả của việc người mua bảo hiểm (option) over-pay vì sợ hãi (xem cuốn Q-world về variance risk premium).

## 8.4 Phân loại alpha theo nguồn và tuổi thọ — bản đồ quan trọng nhất

Giờ ghép hai nửa lại. Mọi alpha đều là ai-đó-trả-tiền-cho-bạn, nhưng *lý do họ trả* quyết định *bao lâu họ còn trả*. Đây là phân loại hành động được nhất mà một researcher cần: bốn nguồn alpha, mỗi nguồn có một hồ sơ **tuổi thọ kỳ vọng** và một chế độ **rủi ro tồn tại** khác nhau. Nhầm loại là nhầm cách quản: bạn sẽ cắt một risk premium đúng lúc nó đau nhất (sai lầm chết người), hoặc scale một behavioral alpha vượt sức chịu của nó khi crowding tăng.

### Loại 1 — Risk premium: được trả công vì chịu đau

Đây là alpha *không* phải "sai giá" mà là **phần bù cho việc gánh một rủi ro mà người khác muốn tránh**. Nó tồn tại vô hạn định vì nó không phải lỗi của ai — nó là giá của bảo hiểm. Value là ví dụ kinh điển: cổ phiếu rẻ (price/book thấp) *rẻ có lý do* — chúng là công ty gặp khó, và bạn được trả premium vì ôm rủi ro rằng chúng gặp khó *đúng lúc bạn cũng đang khó* (Fama-French: value là distress risk; Campbell-Cochrane: nó co-vary với marginal utility xấu — bạn lỗ nhất đúng lúc một đồng đô đau nhất). Đặc điểm nhận diện quyết định: **risk premium đau đúng lúc tệ nhất**. Value crash 2017-2020 (một chu kỳ đau kéo dài, rồi bật lại mạnh 2021-22) không phải dấu hiệu value "chết" mà chính là *cơ chế* của premium — nếu nó không bao giờ đau, sẽ không có ai được trả để ôm.

Con số. Value premium historical (HML của Fama-French) annualized khoảng 3-5% với vol ~10%, tức Sharpe $\approx 0.04/0.10 = 0.4$ — thấp so với momentum nhưng **bền bỉ và capacity khổng lồ** (nó là factor công khai, hàng trăm tỷ đô chạy nó). Hệ quả quản lý: risk premium *không nên cắt* trong drawdown — cắt value đáy 2020 là khóa lỗ đúng trước khi được trả công. Bạn size nó theo vốn dài hạn, chịu horizon nhiều năm, và *không* mong alpha residual sau khi trừ factor: hồi quy return chiến lược value của bạn lên HML cho beta ~1 và alpha ~0 vì **nó LÀ factor**, không phải bí mật của bạn. Carry (FX carry, commodity roll, bond carry) cùng loại: bạn được trả vì đứng bán bảo hiểm cho ai cần phòng ngừa — và carry "hoạt động tới khi không" (carry crash khi risk-off dồn dập, tất cả các cặp carry cùng gãy một lúc).

### Loại 2 — Behavioral: bị arbitrage dần khi lộ

Đây là alpha từ *lỗi* con người (mục 8.3): momentum (disposition/under-reaction), PEAD (conservatism), long-term reversal (overreaction). Điểm sống còn: vì nó là *lỗi*, nó *có thể bị sửa* — khi đủ vốn thông minh học được và đứng bên kia, edge co lại. Hồ sơ tuổi thọ: **hữu hạn và suy giảm sau publication**, được limits to arbitrage bảo vệ tạm thời chứ không vĩnh viễn.

Định lượng suy giảm bằng McLean-Pontiff (2016) với phép tính cụ thể. Giả sử một anomaly cho long-short return **6%/năm in-sample** (con số điển hình của một anomaly công bố). Sau publication, McLean-Pontiff đo alpha rớt trung bình khoảng 32% *ngoài mẫu* — phần này chủ yếu là data-mining trong mẫu gốc bị lột ra, không phải arbitrage: $6\% \times (1 - 0.32) = 4.08\%$/năm. Cộng thêm phần bị arbitrage sau khi paper lan ra, tổng suy giảm chạm ~58%: $6\% \times (1 - 0.58) \approx 2.52\%$/năm. Nói cách khác, một anomaly hào nhoáng 6% in-sample thực chất chỉ còn kỳ vọng quãng **2.5-4%/năm** trong tay bạn — và co tiếp khi crowding tăng. Đây là lý do momentum *thô* 12-1 (đã in từ 1993) chỉ còn Sharpe ~0.75 sau phí chứ không phải con số hào nhoáng của paper gốc — nó đã bị bào ba thập kỷ. Hệ quả quản lý ngược hẳn Loại 1: behavioral alpha *cần* được theo dõi crowding sát sao, cắt khi tín hiệu decay (live-vs-backtest tracking, chương 7), và giá trị của researcher là *biến thể tốt hơn* — momentum có phanh vol (constant-volatility scaling nâng Sharpe từ ~0.5 lên quãng 1.0) là cách ăn phần premium mà version thô đã trả hết qua crash. Behavioral alpha là tài sản hao mòn; bạn phải liên tục làm mới.

### Loại 3 — Institutional / structural: sinh ra từ ràng buộc, không phải sai lầm

Đây là loại tinh tế nhất và, với nhiều pod shop hiện đại, béo bở nhất. Không ai ở đây phi lý; alpha sinh ra vì các định chế lớn bị **ràng buộc** — mandate, quy tắc, thời điểm — buộc họ giao dịch theo cách dự đoán được và bất lợi về giá. Bạn không cược chống *lỗi*; bạn cược chống *quy tắc*.

**Index rebalance flows** là ví dụ sạch nhất. Khi S&P 500 thêm một cổ phiếu, mọi quỹ index — quản hàng nghìn tỷ đô — *bắt buộc* mua nó vào ngày effective, bất kể giá, để tránh tracking error. Cầu cứng, vô cảm giá này đẩy giá cổ phiếu được thêm lên trước ngày effective rồi rớt lại sau. Nghiên cứu cổ điển (và vẫn tái diễn dạng suy giảm): cổ phiếu được thêm vào index có abnormal return khoảng **+3 đến +5%** từ ngày công bố tới effective date, rồi partial reversal sau. Làm rõ vế "đi trước": nếu bạn mua ngay khi tin add công bố và bán cho index fund tại effective, bạn hớt phần lớn cái +3-5% đó; index fund thì mua đúng ở đỉnh cầu-cứng vì mandate của họ là bám index chứ không phải tối ưu giá vào lệnh — cái "lỗ execution" đó không phải sai lầm của họ mà là *thiết kế*. Đó là lý do structural alpha bền: nguồn của nó là một hợp đồng/mandate, không phải một niềm tin sai có thể sửa. (Cần lưu ý: chính vì ai cũng biết trò này, edge index-add đã co lại theo năm và các index provider đã đổi cách rebalance để bớt dự đoán được — một minh họa cho rủi ro "đổi luật" của loại này.)

**Mandate và leverage constraint → low-volatility anomaly.** Đây là ví dụ structural sâu nhất. CAPM nói cổ phiếu high-beta phải cho return cao hơn. Thực tế **ngược lại**: cổ phiếu low-vol/low-beta cho return điều-chỉnh-rủi-ro *tốt hơn* — low-volatility anomaly (Frazzini-Pedersen "Betting Against Beta", 2014). Cơ chế không phải sai lầm mà là *ràng buộc*: nhiều nhà đầu tư (mutual fund, pension) *không được dùng đòn bẩy* nhưng vẫn cần return cao, nên họ mua high-beta stock để "tự chế đòn bẩy" — đẩy giá high-beta lên (return tương lai xuống) và bỏ rơi low-beta (rẻ tương đối). Ai *được* dùng đòn bẩy (một hedge fund) làm ngược: long low-beta có đòn bẩy để nâng beta danh mục về 1, short high-beta, thu chênh. Con số Frazzini-Pedersen: BAB factor cho Sharpe cỡ **0.7-0.8** across nhiều asset class và nhiều thập kỷ — cao bất thường cho một factor, chính vì nguồn của nó (leverage constraint) là *cấu trúc*, khó biến mất chừng nào các định chế lớn còn bị cấm đòn bẩy. Bạn được trả để làm cái người khác *không được phép* làm.

**Dealer hedging flows** là structural flow quan trọng bậc nhất và là điểm giao P/Q rõ nhất. Market maker option bán quyền chọn cho khách rồi delta-hedge để trung hòa rủi ro hướng. Khi dealer **short gamma** (đã bán nhiều option cho khách), việc hedge của họ mang tính *khuếch đại*: giá lên → delta của position họ giảm (âm thêm) → họ phải *mua* để hedge → đẩy giá lên tiếp; giá xuống → họ *bán* → đẩy xuống tiếp. Dòng hedging này *destabilizing*, làm vol thực tăng và tạo momentum trong ngày quanh các mức gamma lớn. Ngược lại khi dealer **long gamma**, hedging của họ *dập* biến động (bán khi lên, mua khi xuống) — pin giá quanh strike lớn ("gamma pinning" gần expiry). Đây không phải ai sai — đó là hệ quả cơ học của việc delta-hedge một book option (giá → độ nhạy → hedge, đúng mô thức trung tâm của Q-world). Một quant equity đọc được positioning gamma của dealer (từ open interest option) có một tín hiệu structural về *dòng lệnh cơ học sắp tới* — không phải dự báo fundamental, mà dự báo *ai bị buộc phải giao dịch cái gì*. Cơ chế đầy đủ của dealer gamma, delta-hedging, và quan hệ gamma-theta thuộc về sell-side (xem cuốn Q-world); ở đây chỉ cần nhớ: **dealer gamma là một structural flow**, cùng họ với index rebalance và BAB — alpha sinh từ ràng buộc của người khác, không từ lỗi của họ.

Hồ sơ tuổi thọ của structural alpha: **bền chừng nào ràng buộc còn** — thường rất bền (mandate và luật đổi chậm) — nhưng **capacity giới hạn** bởi kích thước dòng flow, và có thể chết đột ngột nếu quy tắc đổi (index provider đổi cách rebalance, regulator đổi luật đòn bẩy). Bạn quản nó bằng cách canh *lịch* và *quy tắc*, không phải canh fundamental.

### Loại 4 — Informational: được trả vì biết sớm hơn hoặc xử lý tốt hơn

Loại cuối: alpha từ **thông tin** — hoặc bạn có dữ liệu người khác chưa có, hoặc bạn xử lý dữ liệu chung nhanh/tinh hơn. Đây là loại "thuần EMH-vi-phạm" nhất: nếu bạn đọc được satellite image bãi đỗ xe Walmart trước khi doanh số công bố, bạn đơn giản *biết trước*. Alt-data (satellite, credit card panel, web-scraping, geolocation), NLP trên filings/news trước khi con người tiêu hóa hết, và low-latency (thấy order flow trước khi nó phản ánh vào giá) đều thuộc loại này.

Hồ sơ tuổi thọ: **ngắn và cạnh tranh khốc liệt**. Một dataset alt-data cho edge chừng nào *ít người có nó*; khoảnh khắc vendor bán rộng, edge san phẳng — bạn đang mua một tài sản mà chính việc nhiều người mua làm nó mất giá. Con số minh họa: một credit-card panel dự báo doanh số bán lẻ có thể cho IC 0.05-0.08 khi *độc quyền* — cao gấp đôi, gấp ba momentum thô — nhưng rớt về gần 0 trong 1-2 năm khi vendor bán cho 50 quỹ và mọi người trade cùng surprise cùng lúc; lúc đó "surprise" đã nằm sẵn trong giá trước cả khi doanh số công bố. Informational alpha là cuộc đua vũ trang: giá trị nằm ở *độc quyền tạm thời* và *tốc độ tích hợp*, không ở bản thân insight (vì insight lan ra). Ai trả tiền? Người phản ứng chậm với thông tin — và họ ngừng trả ngay khi họ (hoặc vendor của họ) bắt kịp. Đây là loại alpha đắt nhất để duy trì (mua data, xây pipeline, chạy trước đối thủ) và ít "bảo vệ tự nhiên" nhất — không có limits-to-arbitrage nào che nó, chỉ có tường lửa độc quyền mà bạn phải tự trả tiền dựng lên.

### Bảng tổng hợp — bản đồ để mang theo

| Loại | Nguồn | Ai trả tiền | Tuổi thọ | Cách quản | Ví dụ (số) |
|---|---|---|---|---|---|
| **Risk premium** | Phần bù chịu rủi ro không ai muốn | Người muốn tránh rủi ro (mua bảo hiểm) | Vô hạn định (đau chu kỳ) | Không cắt trong drawdown; horizon nhiều năm | Value HML: SR ~0.4 (5%/10%), đau 2017-20 |
| **Behavioral** | Lỗi hệ thống của con người | Người mắc lỗi (disposition, overreaction) | Hữu hạn, decay sau publication 32→58% (6%→2.5-4%) | Theo dõi crowding; biến thể tốt hơn; cắt khi decay | Momentum 12-1: IC 0.025, SR sau phí 0.75, MDD -25% (2009) |
| **Structural** | Ràng buộc mandate/leverage/lịch | Định chế bị ràng buộc (index fund, no-leverage) | Bền chừng nào quy tắc còn; capacity giới hạn | Canh lịch & quy tắc; kích cỡ theo flow | Index add: +3-5%; BAB: SR ~0.7-0.8; dealer gamma (xem Q-world) |
| **Informational** | Biết sớm/xử lý tinh hơn | Người phản ứng chậm với info | Ngắn, cạnh tranh khốc liệt | Giữ độc quyền; tích hợp nhanh; đua data | Credit-card panel: IC 0.05-0.08 độc quyền → ~0 khi phổ biến |

Bản đồ này là bộ lọc đầu tiên cho mọi ý tưởng đi qua bàn của bạn. Trước khi chạy dòng backtest đầu tiên, phân loại nó: *đây là loại alpha nào, và hồ sơ tồn tại đi kèm là gì?* Một tín hiệu không rơi rõ vào loại nào — không có câu chuyện ai-trả-tiền — gần như chắc chắn là artifact của overfitting, và chương 9 sẽ cho bạn công cụ định lượng để chứng minh điều đó. Một tín hiệu rơi vào Loại 1 mà bạn quản như Loại 2 (cắt trong drawdown) sẽ khóa lỗ đúng đáy; một tín hiệu Loại 4 mà bạn quản như Loại 1 (giữ mãi, không canh crowding) sẽ ôm một con số IC đang bốc hơi. Nghề của một quant researcher không chỉ là *tìm* alpha mà là *biết mình đang cầm loại gì* — vì cách bạn size, giữ, và giết nó phụ thuộc hoàn toàn vào việc ai đang trả tiền cho bạn và vì sao họ chưa dừng.

Trong `src/alpha`, các họ tín hiệu (momentum, meanReversion, và các operator cross-sectional/time-series) được thiết kế composable đúng để một researcher gắn nhãn nguồn cho từng tín hiệu và tổ hợp qua các loại — một momentum behavioral, một BAB structural, một value risk-premium — thành một book đa-nguồn mà không loại nào đủ lớn để một cú crowding hay một cú đổi luật giết cả danh mục. Đa dạng hóa theo *nguồn alpha* quan trọng ngang đa dạng hóa theo *tài sản*: hai chiến lược cùng loại behavioral cùng chết trong một quant quake, dù chúng cầm hai rổ cổ phiếu khác nhau — chính vì cái $4\sigma$ ba ngày của tháng 8/2007 (8.3) không phân biệt bạn cầm rổ nào, nó chỉ hỏi bạn có cầm *cùng lý do tồn tại* với đám đông đang bị margin-call hay không. Đó là bài học cuối và sâu nhất của chương: rủi ro thật của một danh mục alpha không nằm ở tương quan giá, mà ở tương quan *lý do tồn tại*.

# Chương 9: Backtesting

Backtest là mô phỏng một chiến lược trên quá khứ. Nghe đơn giản đến mức người mới tưởng nó là bước tầm thường nhất; thực tế nó là **kỹ năng khó nhất và phân biệt pro với amateur rõ nhất** của cả P-world. Lý do nằm ở một hiểu lầm nền tảng mà gần như ai cũng mắc lúc đầu: người ta coi backtest là *công cụ khám phá* — chạy hàng nghìn biến thể, cái nào Sharpe cao thì giữ. Nhưng backtest tốt là công cụ **bác bỏ**, không phải khám phá. Nó tồn tại để giết những giả thuyết sai, chứ không để đãi cát tìm vàng trong noise. Câu của López de Prado đáng dán lên màn hình: *"Backtesting is not a research tool. Feature importance is."* Ý ông: nếu bạn dùng backtest để *chọn* chiến lược (thử nhiều, giữ cái tốt nhất), bạn đang biến chính công cụ kiểm định thành nguồn overfitting lớn nhất của mình. Alpha phải đến từ giả thuyết kinh tế (chương 7) và bằng chứng ngoài P&L; backtest chỉ đến sau để nói "giả thuyết này không mâu thuẫn với quá khứ" — một câu khiêm tốn hơn nhiều so với "chiến lược này kiếm được tiền."

Sự khác biệt giữa hai câu ấy không phải chuyện chữ nghĩa. Nó quyết định toàn bộ tâm thế của người ngồi trước bàn phím. Người coi backtest là công cụ khám phá sẽ *tối ưu hóa* con số Sharpe — và mọi thứ họ làm sau đó, từ chọn lookback đến chọn universe, đều là những vòng lặp bí mật ăn mòn độ tin cậy. Người coi backtest là công cụ bác bỏ sẽ *cố giết* chiến lược của chính mình — chạy nó qua những giai đoạn tệ nhất, cộng chi phí bi quan nhất, và chỉ tin nó khi nó *không chết*. Chương này viết cho người thứ hai.

Chương chia làm bốn phần. Đầu tiên là bảy cạm bẫy khiến một backtest đẹp trở thành ảo ảnh, mỗi cái định cỡ bằng số. Thứ hai là overfitting — tội nặng nhất — và bộ công cụ định lượng nó (max Sharpe giả, deflated Sharpe, PBO). Thứ ba là kỷ luật thực hành để backtest *ra được* con số đáng tin: holdout, walk-forward, purged CV, và combinatorial purged CV. Cuối cùng là đọc một tearsheet như người có nghề, cộng với backtest tổng hợp (synthetic / Monte Carlo) — cách kiểm tra chiến lược trên những quá khứ chưa từng xảy ra.

## 9.1 Bảy tội lỗi của backtest

Bảy cạm bẫy dưới đây không phải danh sách học thuộc; chúng là bảy cách khác nhau để một con số Sharpe nói dối. Cái nguy hiểm là mỗi cái làm Sharpe *tăng* — không có cạm bẫy nào khiến backtest trông tệ hơn thực tế, nên bản năng "số đẹp thì tin" luôn kéo bạn về phía sai. Đây là điểm mấu chốt cần khắc cốt: các sai số của backtest không phân bố đối xứng quanh giá trị thật, chúng *có hướng* — luôn về phía lạc quan. Một con số Sharpe chưa qua kiểm toán vì thế không phải "ước lượng không thiên lệch có nhiễu," nó là *biên trên*. Cách chống duy nhất là biết chính xác mỗi tội đánh cắp bao nhiêu bps, để trừ ngược lại.

### Tội 1 — Look-ahead bias

Look-ahead là dùng thông tin chưa tồn tại tại thời điểm ra quyết định. Dạng lộ liễu ai cũng thấy: tính tín hiệu bằng giá close của ngày $t$ rồi giả định vào lệnh tại chính giá close đó — nhưng tại thời điểm bạn *biết* close, phiên đã đóng, bạn không thể trade ở giá ấy. Dạng tinh vi mới là thứ giết người thật:

Thứ nhất, **chuẩn hóa bằng thống kê toàn mẫu**. Bạn z-score một feature bằng mean và std tính trên *toàn bộ* lịch sử, kể cả tương lai. Hãy định cỡ: một signal momentum có rank-IC thật ~0.025 (running example xuyên sách). Nếu bạn normalize bằng full-sample mean, bạn đã rò rỉ thông tin về mức trung bình tương lai vào mọi quan sát quá khứ; ở các feature có drift, cú rò này một mình có thể nâng IC quan sát từ 0.025 lên 0.04–0.05 — gần gấp đôi — thuần túy từ leakage. Và IC gần như gấp đôi kéo theo Sharpe gần như gấp đôi (qua Fundamental Law, chương 7: $IR \approx IC\sqrt{BR}$), nên một cú z-score bất cẩn có thể tự động biến một chiến lược Sharpe 0.9 thành một backtest Sharpe 1.7 mà không thêm một hạt alpha thật nào. Cách đúng là dùng **expanding hoặc rolling window**: tại thời điểm $t$, mean và std chỉ tính từ dữ liệu đến $t$.

Thứ hai, **fundamental data không PIT** (point-in-time, chương 2). Báo cáo Q4 của một công ty có ngày kết thúc quý 31/12 nhưng chỉ được công bố cuối tháng 2 năm sau, và bản khai đó còn bị *restate* nhiều tháng sau nữa. Một database ghép earnings vào ngày 31/12 tặng bạn ~8 tuần nhìn trước tương lai. Với một earnings-quality signal, khoảng nhìn trước ấy đủ để biến một alpha bằng 0 thành một backtest Sharpe 0.6 — bởi tám tuần trước công bố chính là quãng giá đã bắt đầu drift theo tin, và một database gán nhãn sai ngày sẽ cho tín hiệu của bạn "thấy" earnings *trước cả thị trường*.

Thứ ba, **universe selection bằng thông tin hôm nay** — nhưng cái này thực chất là survivorship, tội số 2.

Phòng thủ chuẩn công nghiệp không phải là "cẩn thận hơn" mà là một *kiến trúc*: backtest **event-driven**. Thay vì một vòng lặp `for t in dates` có toàn quyền truy cập cả DataFrame, engine đẩy dữ liệu ra "nhỏ giọt" theo đúng timestamp vật lý; code chiến lược tại thời điểm $t$ chỉ nhận được các event có timestamp $\le t$. Look-ahead trở thành bất khả về mặt kiến trúc, không phải nhờ kỷ luật con người — và đây là khác biệt sống còn, vì kỷ luật con người *sẽ* thất bại trên hàng nghìn dòng code còn kiến trúc thì không. Module backtest trong `src/alpha` theo đúng thiết kế này.

### Tội 2 — Survivorship bias

Đã bàn ở chương 2: universe của backtest phải chứa cả những cái tên đã *chết*. Nếu bạn chạy strategy hôm nay trên "500 công ty đang trong S&P 500", bạn đã ngầm lọc ra đúng những công ty sống sót — bỏ đi mọi Enron, Lehman, Bear Stearns, mọi công ty bị delist. Định cỡ thiệt hại: nghiên cứu kinh điển ước tính survivorship bias khoảng **1–4%/năm** cho equity strategy nói chung, và tệ hơn nhiều ở small-cap và ở các chiến lược kiểu value/distress — vì đó chính là nhóm hay phá sản nhất, nên loại bỏ người chết nâng khống return của đúng những chiến lược nhắm vào rủi ro vỡ nợ.

Có một bias kép ít người để ý: **delisting return**. Khi một cổ phiếu bị delist vì lý do xấu (phá sản, gian lận), nhà đầu tư không thoát ở giá cuối cùng — họ mất gần hết. CRSP ghi nhận return của tháng delisting trung bình khoảng **−30%** cho các vụ delist vì lý do xấu. Nhiều dataset để `NaN` ở ô đó, tức là chúng ngầm giả định bạn thoát hòa vốn. Đó là free lunch tặng cho backtest: một chiến lược long các cổ phiếu distress (kỳ vọng mean-reversion) trông tuyệt vời nếu mọi vụ vỡ nợ đều "biến mất không lỗ" thay vì ăn −30%.

Định lượng tác động kép bằng số cho rõ ràng. Giả sử universe 1000 tên, mỗi năm ~3% bị delist (30 tên), trong đó ~2/3 vì lý do xấu (20 tên) với delisting return −30%. Nếu chiến lược của bạn phân bổ đều và dataset bỏ qua các return này, bạn đã bỏ sót

$$\frac{20 \times (-30\%)}{1000} = \frac{-6.0}{1000} = -0.6\%$$

mỗi năm chỉ riêng từ delisting return bị thiếu — và đó là *trước khi* cộng phần survivorship "bình thường" 1–4%. Với một chiến lược equity long-only kỳ vọng return ~7%/năm, sai lệch tổng cộng 2–5%/năm là chênh giữa "alpha thật" và "artifact của dataset bẩn." Đặt cạnh nhau: nếu return thật là 7% mà dataset bẩn báo 10%, thì một phần ba cái "alpha" bạn nhìn thấy đơn giản là những xác chết bị xóa khỏi hồ sơ.

Một test nhanh xem dataset của bạn có bị dọn dẹp không: đếm số tên trong universe trong giai đoạn 2008–2009. Nếu không thấy hàng loạt cái tên biến mất giữa chừng, dataset đã được "làm sạch" survivorship hộ bạn — và bạn nên hoảng, vì cái "sạch" đó chính là thứ bẩn nhất.

### Tội 3 — Overfitting / selection bias

Đây là tội nặng nhất, có riêng mục 9.2 và 9.3. Ở đây chỉ cần nhớ ý một câu: sáu tội còn lại làm sai Sharpe *một* backtest; overfitting làm sai *quy trình chọn* giữa nhiều backtest, và vì thế nó khó thấy hơn và giết chết nhiều tiền hơn tất cả các tội kia cộng lại. Một look-ahead bias bạn có thể tìm ra bằng cách đọc lại code; một overfitting bias thì vô hình ngay cả với code hoàn hảo, vì nó nằm trong *lịch sử những lần bạn thử*, không nằm trong bất kỳ dòng code nào.

### Tội 4 — Bỏ qua chi phí

Một backtest gross (trước phí) là fiction. Chi phí thật gồm bốn tầng: **spread** (mua ở ask, bán ở bid), **commission** (phí sàn/broker), **market impact** (lệnh của bạn tự đẩy giá — sẽ định lượng ở chương 12/13), và **borrow cost** cho short. Cái tầng thứ tư giết âm thầm nhất: cổ phiếu hard-to-borrow có khi tốn **50%/năm** phí vay để short — nhiều chiến lược short "đẹp trên giấy" chết riêng vì dòng phí này, vì đúng những tên bạn muốn short (overvalued, được retail chuộng, meme) lại là những tên đắt đỏ nhất để mượn. Nghịch lý cay đắng: chỗ tín hiệu short mạnh nhất thường trùng chỗ borrow đắt nhất, nên phần alpha lý thuyết lớn nhất lại là phần bị phí ăn sạch nhất.

Sai lầm phổ biến là trừ đại một hằng số. Chi phí không phải hằng số — nó tỉ lệ thuận với **turnover** và với kích cỡ lệnh so với thanh khoản. Định cỡ bằng running example: một chiến lược mean-reversion turnover 40%/ngày với gross Sharpe 2.5. Mỗi ngày nó thay 40% danh mục, và vì mỗi lần thay là một cặp bán-mua nên khối lượng giao dịch hai chiều là ~80% giá trị danh mục mỗi ngày. Với chi phí một chiều $c\,\text{bps}$, drag hàng năm ≈ $2 \times 0.40 \times c \times 252\,\text{bps}$. Dẫn từng bước ở $c = 5\,\text{bps}$:

$$\text{drag} = 2 \times 0.40 \times 5 \times 252 = 0.8 \times 5 \times 252 = 4 \times 252 = 1008 \text{ bps} \approx 10\%\text{/năm}.$$

Mười phần trăm một năm bốc hơi chỉ vì phí — đủ để nuốt phần lớn alpha của gần như mọi chiến lược equity. Đây là lý do turnover cao phải được model như công dân hạng nhất bằng một cost model đàng hoàng (module costs trong `src/alpha`), không phải một hằng số vô tội vạ. Chú ý cấu trúc công thức: drag *tuyến tính* theo $c$ và theo turnover nhưng nhân với 252 — chính hệ số 252 là thứ biến một con số "5 bps nghe chả đáng gì" thành 10%/năm. Bảng độ nhạy đầy đủ nằm ở 9.4.

### Tội 5 — Capacity ảo

Backtest giả định bạn trade \$10M một cổ phiếu có volume \$100k/ngày. Trên giấy P&L cộng dồn đẹp; ngoài đời bạn *là* thị trường của cái tên đó, và lệnh của bạn đẩy giá đến mức alpha bốc hơi trước khi fill xong. Ràng buộc chống lại là một **participation cap** ngay trong mô phỏng: mỗi ngày không trade quá vài phần trăm ADV (average daily volume) của mỗi tên.

Định cỡ: nếu cap ở 5% ADV và một tên có ADV $\$5\text{M}$/ngày, bạn tối đa đưa $0.05 \times \$5\text{M} = \$250\text{k}$ vào tên đó mỗi ngày. Đẩy con số này lên quy mô quỹ: nếu chiến lược muốn giữ 100 tên cùng cỡ với mức tham gia đó, trần vốn triển khai *mỗi ngày* chỉ quanh $\$25\text{M}$ — và nếu phải xây vị thế trong vài ngày để không tự đánh bại mình, AUM khả thi bị chặn ở mức thấp hơn nhiều so với ảo tưởng ban đầu. Một chiến lược "Sharpe 3" trên universe micro-cap có thể có **capacity thật chỉ vài triệu đô** — nghĩa là nó không phải chiến lược, mà là một sở thích tốn công. Backtest phải trả lời không chỉ "Sharpe bao nhiêu" mà "Sharpe bao nhiêu ở AUM nào." Hai con số này thường mâu thuẫn dữ dội — Sharpe cao thường sống ở AUM thấp và tắt ngấm khi vốn lớn lên — và đó là nội dung riêng của chương capacity (module capacity).

### Tội 6 — Kết quả cưỡi trên vài sự kiện

Toàn bộ Sharpe của một backtest có thể đến từ ba ngày của tháng 10/2008. Nếu vậy, "Sharpe 1.5 trên 10 năm" là ảo giác thống kê — nó là một cú may mắn được annualize, không phải một edge lặp lại. Test đơn giản mà mạnh: nhìn phân phối P&L theo thời gian, rồi **bỏ top-k ngày lời nhất** xem chiến lược còn sống không.

Định cỡ hai đầu để thấy tương phản. Chiến lược 10 năm ($T \approx 2520$ ngày giao dịch), Sharpe hàng năm 1.5. Nếu bỏ 5 ngày lời nhất mà Sharpe rớt xuống 0.3, thì

$$\frac{5}{2520} = 0.198\% \approx 0.2\%$$

số ngày mang gần hết edge — chiến lược thực chất là một *bet vào 5 sự kiện* không tái tạo được, không phải một edge phân tán. Đọc ngược cho rõ: đường P&L của nó gần như phẳng suốt 2515 ngày còn lại, mọi thứ nằm trong 5 điểm nhọn, và không ai bảo đảm với bạn rằng 5 điểm nhọn ấy sẽ tái xuất trong 10 năm tới. Ngược lại, một alpha thật (như momentum 12-1, Sharpe trước phí ~0.9) mất Sharpe *đều đặn* khi bỏ ngày tốt: bỏ 5 ngày trên 2520 chỉ hạ Sharpe từ 0.9 xuống ~0.85, vì P&L của nó trải mỏng trên hàng nghìn vị thế nhỏ — không ngày nào đủ trọng lượng để một mình lung lay con số tổng. Chính hình dạng của đường "Sharpe sau khi bỏ top-k" — dốc đứng hay thoải — mới nói cho bạn biết đang cầm gì: một vách đá là bet may mắn, một dốc thoai thoải là edge thật.

### Tội 7 — Regime blindness

Giai đoạn 2010–2021 là *một* regime: QE bơm tiền, vol thấp, momentum thắng đều, mean-reversion trên index ăn ngon. Một chiến lược fit trọn trong regime đó không được kiểm định — nó chỉ được *quan sát* trong điều kiện thuận lợi. Kiểm định thật đòi hỏi chạy qua nhiều regime (chương 4 về regime & structural change), và quan trọng hơn cả số liệu, đòi hỏi câu hỏi kinh tế: *"Chiến lược này về mặt kinh tế kiếm tiền từ ai, và người đó còn ở đó không?"*

Ví dụ sống động là **momentum crash 2009**. Momentum 12-1 có Sharpe dài hạn ~0.9, nhưng MDD tập trung khủng khiếp: khi thị trường bật đáy tháng 3/2009, short leg (những cổ phiếu đã rơi thảm nhất năm 2008) bật ngược +80%, và long-short momentum ăn một cú ~−25% trong vài tuần. Đặt con số vào bối cảnh: một chiến lược có Sharpe 0.9 nghĩa là mỗi năm nó kỳ vọng lời khoảng 0.9 lần độ lệch chuẩn của chính nó; một cú −25% dồn trong vài tuần là một sự kiện nhiều sigma vượt xa bất cứ gì phân phối "bình thường" gợi ý — đúng bản chất của một cú tail bị nén. Một backtest chỉ chạy 2010–2019 sẽ *không bao giờ* thấy điều này và sẽ báo cáo một chiến lược an toàn hơn nhiều thực tế: cùng Sharpe ~0.9 nhưng với một MDD giả tạo hiền lành, vì cú vỡ tệ nhất nằm ngoài cửa sổ. Regime blindness không phải là số liệu thiếu chính xác — nó là *bản chất rủi ro bị giấu*, và bản chất rủi ro bị giấu là thứ giết bạn đúng lúc bạn đặt cược lớn nhất.

## 9.2 Overfitting và cách định lượng nó

Cơ chế của overfitting đơn giản đến tàn nhẫn: dữ liệu hữu hạn cộng với nhiều lần thử thì **chắc chắn** tìm được pattern giả trông đẹp. Đây không phải xui rủi mà là toán học — nếu bạn ném đủ nhiều đường thẳng vào một đám mây điểm ngẫu nhiên, một trong số chúng *phải* đi gần đám điểm. Bailey cùng López de Prado đã biến trực giác đó thành công cụ đo được, và đây là chỗ backtesting chuyển từ nghề thủ công sang khoa học.

### Kỳ vọng của Sharpe tối đa giả

Hãy tưởng tượng bạn thử $N$ chiến lược **hoàn toàn vô giá trị** (Sharpe thật bằng 0, mỗi cái chỉ là noise độc lập) trên $T$ năm dữ liệu. Vì mỗi Sharpe quan sát là một biến ngẫu nhiên dao động quanh 0, cái *lớn nhất* trong $N$ cái chắc chắn dương và lớn. Kết quả tiệm cận đẹp:

$$\mathbb{E}[\max SR] \approx \sqrt{\frac{2\ln N}{T}}$$

Recipe đọc công thức: tử số $2\ln N$ tăng theo *log* số lần thử (thử gấp đôi không làm max Sharpe tăng gấp đôi — nó tăng chậm), mẫu số $T$ là độ dài mẫu tính bằng năm (mẫu dài hơn thì noise Sharpe nhỏ hơn, nên max giả cũng nhỏ hơn). Trực giác đằng sau: Sharpe quan sát của một chiến lược vô giá trị trên $T$ năm có độ lệch chuẩn xấp xỉ $1/\sqrt{T}$ (mỗi năm cho một quan sát về mức return trung bình); còn cái lớn nhất trong $N$ mẫu chuẩn nằm cách trung bình khoảng $\sqrt{2\ln N}$ độ lệch chuẩn. Nhân hai với nhau ra đúng $\sqrt{2\ln N}/\sqrt{T}$. Công thức không rơi từ trên trời — nó là tích của "một Sharpe noise rộng bao nhiêu" và "cái cực đại của $N$ mẫu nằm xa bao nhiêu."

Chạy số running example: thử **$N = 1000$ cấu hình trên $T = 10$ năm** →

$$SR_0 = \sqrt{\frac{2 \ln 1000}{10}} = \sqrt{\frac{2 \times 6.908}{10}} = \sqrt{\frac{13.816}{10}} = \sqrt{1.382} = 1.18.$$

Đọc con số này cho lạnh gáy đúng mức: nếu bạn thử 1000 biến thể của một ý tưởng *rác* trên 10 năm, bạn *kỳ vọng* biến thể tốt nhất đạt Sharpe **1.18 thuần túy từ noise**. Vậy mà "Sharpe 1.2 trên 10 năm" nghe như một chiến lược đáng đầu tư. Đây là lý do sâu xa vì sao "chạy nhiều biến thể rồi giữ cái tốt nhất" không phải research — nó là cỗ máy sản xuất Sharpe 1.18 từ hư không.

Bảng $SR_0$ theo $N$ và $T$ để cảm số:

| $N$ (số lần thử) | $T = 5$ năm | $T = 10$ năm | $T = 20$ năm |
|---|---|---|---|
| 10 | 0.96 | 0.68 | 0.48 |
| 100 | 1.36 | 0.96 | 0.68 |
| 1000 | 1.66 | 1.18 | 0.83 |
| 10000 | 1.92 | 1.36 | 0.96 |

Đọc bảng theo hai chiều. Theo hàng (cố định $T$, tăng $N$): ngưỡng bò lên nhưng *chậm* — từ 1000 lên 10000 lần thử, $SR_0$ ở $T=10$ chỉ nhích từ 1.18 lên 1.36, đúng bản chất logarit của $2\ln N$; thử gấp mười lần chỉ nâng ngưỡng thêm ~0.18. Theo cột (cố định $N$, tăng $T$): mẫu dữ liệu càng dài càng "miễn nhiễm" — cùng 1000 lần thử, trên 20 năm max giả chỉ 0.83 thay vì 1.18. Đó là lý do dữ liệu dài đáng giá gấp bội: nó không chỉ cho nhiều observation, nó *hạ ngưỡng ngờ vực*. Một Sharpe 1.0 trên 20 năm với 1000 lần thử ($SR_0 = 0.83$) đáng tin hơn hẳn cùng Sharpe 1.0 ấy trên 10 năm ($SR_0 = 1.18$, nghĩa là còn dưới ngưỡng noise).

### Deflated Sharpe Ratio (DSR)

$SR_0$ cho bạn ngưỡng thô. Deflated Sharpe làm việc tinh hơn: nó hiệu chỉnh Sharpe *quan sát* theo số lần thử, độ dài mẫu, **và** hình dạng phân phối return (skew, kurtosis — vì return tài chính không normal, và non-normality làm Sharpe quan sát kém tin cậy hơn). Kết quả là một xác suất: khả năng Sharpe *thật* lớn hơn 0 sau khi trừ đi mọi ảo giác từ multiple testing.

$$DSR = \Phi\!\left( \frac{(\widehat{SR} - SR_0)\sqrt{T-1}}{\sqrt{1 - \gamma_3\,\widehat{SR} + \dfrac{\gamma_4 - 1}{4}\,\widehat{SR}^{\,2}}} \right), \qquad SR_0 \approx \sqrt{\frac{2\ln N}{T}}$$

Giải từng ký hiệu. $\Phi$ là CDF chuẩn (biến điểm z thành xác suất). $\widehat{SR}$ là Sharpe quan sát; $T$ là số quan sát (cùng đơn vị kỳ với $\widehat{SR}$); $\gamma_3$ là skewness, $\gamma_4$ là kurtosis của chuỗi return. $SR_0$ là "Sharpe kỳ vọng của kẻ may mắn nhất trong $N$ kẻ vô dụng" — chính là ngưỡng ở trên. Tử số $(\widehat{SR} - SR_0)\sqrt{T-1}$ có hai phần: $(\widehat{SR} - SR_0)$ là phần Sharpe *vượt* ngưỡng noise, còn $\sqrt{T-1}$ biến nó thành một điểm z (mẫu càng dài, cùng một khoảng vượt càng có ý nghĩa thống kê). Nếu Sharpe của bạn chỉ bằng $SR_0$ thì tử số bằng 0, DSR = $\Phi(0) = 0.5$ — đúng nghĩa "50/50 là đồ giả." Mẫu số điều chỉnh cho non-normality: return có left skew ($\gamma_3 < 0$, đuôi trái dày — điển hình của chiến lược "nhặt xu trước xe lu") làm số hạng $-\gamma_3\widehat{SR}$ trở thành cộng, *nới rộng* mẫu số, làm z nhỏ đi, DSR thấp đi — phạt đúng những chiến lược giấu rủi ro đuôi. Kurtosis cao ($\gamma_4 > 3$, đuôi dày cả hai phía) cũng nới mẫu số qua số hạng $(\gamma_4-1)/4 \cdot \widehat{SR}^2$, cùng một tinh thần trừng phạt.

Recipe DSR từng bước:
1. Tính $\widehat{SR}$ từ chuỗi return của cấu hình tốt nhất (nhớ dùng cùng đơn vị kỳ cho $\widehat{SR}$ và $T$).
2. Đếm $N$ = số cấu hình thực sự đã thử trong quá trình research (đây là con số duy nhất khó — bàn dưới).
3. Tính $SR_0 = \sqrt{2\ln N / T}$.
4. Tính $\gamma_3, \gamma_4$ từ chính chuỗi return đó.
5. Ráp vào công thức, tra $\Phi$.

**Ví dụ DSR chạy đủ số.** Cấu hình tốt nhất: Sharpe quan sát $\widehat{SR} = 1.2$ (hàng năm), đo trên $T = 10$ năm. Ta thử $N = 1000$ cấu hình. Giả sử return gần normal: $\gamma_3 = 0$, $\gamma_4 = 3$. Đầu tiên $SR_0 = 1.18$ (đã tính). Tử số:

$$(\widehat{SR} - SR_0)\sqrt{T-1} = (1.2 - 1.18)\sqrt{10-1} = 0.02 \times \sqrt{9} = 0.02 \times 3 = 0.06.$$

Mẫu số với $\gamma_3 = 0, \gamma_4 = 3$:

$$\sqrt{1 - 0 \times 1.2 + \frac{3-1}{4}(1.2)^2} = \sqrt{1 + 0.5 \times 1.44} = \sqrt{1 + 0.72} = \sqrt{1.72} = 1.311.$$

Vậy

$$z = \frac{0.06}{1.311} = 0.046, \qquad DSR = \Phi(0.046) \approx 0.52.$$

**Xác suất ~50/50 rằng đây là đồ giả**, dù "Sharpe 1.2 trên 10 năm" nghe rất ổn. Con số 1.2 gần như trùng khít $SR_0 = 1.18$: nó chính là cái mà 1000 kẻ vô dụng sẽ tạo ra, nên DSR đúng nghĩa quẳng nó về mức tung đồng xu.

Hỏi ngược để thấy khoảng cách: cần Sharpe quan sát bao nhiêu để DSR > 95% (tức z > 1.645) với $N=1000$, $T=10$? Sắp xếp lại công thức, giữ mẫu số quanh 1.4 (giá trị của nó ở vùng Sharpe ~1.7–2.0):

$$\widehat{SR} \gtrsim SR_0 + \frac{1.645 \times (\text{mẫu số})}{\sqrt{T-1}} \approx 1.18 + \frac{1.645 \times 1.4}{3} \approx 1.18 + 0.77 \approx 1.95.$$

Lặp lại một vòng cho khớp mẫu số (mẫu số tăng nhẹ khi $\widehat{SR}$ tăng) ra khoảng **Sharpe ~1.7–2.0** mới đủ tự tin. Nói cách khác, với 1000 lần thử, một Sharpe 1.2 gần như vô nghĩa còn Sharpe 1.9 mới bắt đầu đáng tin. Khoảng cách đó — từ 1.2 lên 1.9 — chính là *cái giá của việc đã thử 1000 lần*, và nó khổng lồ: bạn phải kiếm được thêm 0.7 đơn vị Sharpe chỉ để bù cho hành động scan.

Con số $N$ là điểm mấu chốt và cũng là điểm người ta gian lận (thường vô thức). $N$ không phải "số biến thể tôi lưu lại" mà là *tổng số cấu hình từng chạy qua đầu*, gồm cả những cái bạn thử rồi bỏ vì xấu, những lookback bạn scan, những universe bạn đổi. Nó nằm trong research log của bạn hoặc không nằm ở đâu cả. Đây chính là lý do văn hóa ghi chép thí nghiệm (bàn ở chương 7) không phải thói quen tốt cho vui — nó là input trực tiếp của DSR. Người không log $N$ không thể tính DSR, và người không tính DSR sẽ deploy Sharpe 1.18 tưởng là 1.18 thật. Chú ý cả tác động phi tuyến ngược của $N$: khai báo trung thực $N = 1000$ cho $SR_0 = 1.18$, nhưng nếu bạn tự lừa mình chỉ đếm 10 lần thử "chính thức," $SR_0$ tụt xuống 0.68 và cùng Sharpe 1.2 bỗng "qua ải" — chính sự chênh lệch giữa $N$ thật và $N$ khai báo là lỗ hổng lớn nhất của cả quy trình.

### PBO — Probability of Backtest Overfitting (qua CSCV)

DSR hỏi "Sharpe này có thật không." PBO hỏi câu khác, tinh tế hơn: *"quy trình chọn của tôi có đang chọn ra thứ tốt trong quá khứ nhưng tệ trong tương lai không?"* — tức đo trực tiếp mức độ overfit của **cách bạn chọn cấu hình**, chứ không phải của một cấu hình cụ thể.

Công cụ là **CSCV** (Combinatorial Symmetric Cross-Validation). Recipe:

1. Xếp return của *tất cả* $N_c$ cấu hình bạn đã thử thành một ma trận $T \times N_c$ (mỗi cột một cấu hình, mỗi hàng một kỳ).
2. Chia $T$ hàng thành $S$ khối bằng nhau (thường $S = 16$). Với mỗi cách chọn $S/2$ khối làm **in-sample** (IS) và $S/2$ còn lại làm **out-of-sample** (OOS) — có $\binom{S}{S/2}$ cách, với $S=16$ là $\binom{16}{8} = 12870$ cách.
3. Trong mỗi cách chia: tìm cấu hình có Sharpe cao nhất trên IS (cấu hình "thắng in-sample"), rồi xem *thứ hạng* của chính cấu hình đó trên OOS.
4. Nếu cấu hình thắng IS thường rơi xuống **nửa dưới** bảng xếp hạng OOS, quy trình chọn của bạn đang overfit. PBO là **tần suất** (trên 12870 cách chia) mà cấu hình thắng IS xếp dưới trung vị OOS.

Chạy một con số cho cụ thể. Giả sử trong 12870 cách chia, cấu hình thắng-IS rơi xuống nửa dưới của bảng xếp hạng OOS ở **8107** cách. Khi đó

$$PBO = \frac{8107}{12870} = 0.63.$$

Đọc: 63% thời gian, cái "tốt nhất trong quá khứ" hóa ra dưới trung bình trong tương lai — quy trình research của bạn tệ hơn cả tung đồng xu ở việc chọn cấu hình sống được. Đối chiếu hai đầu thang: PBO = 0.5 nghĩa là chọn theo backtest chẳng khác gì tung xu — quy trình vô dụng; PBO thấp (dưới ~0.1, ví dụ 1200/12870 ≈ 0.09) nghĩa là in-sample winner có xu hướng tiếp tục thắng out-of-sample, tức quá trình research của bạn *thật sự* đang chắt lọc edge chứ không đãi noise.

Điểm đẹp của PBO là nó không đánh giá một chiến lược — nó đánh giá **cả pipeline research của bạn**. Hai nhóm cùng dữ liệu, cùng cấu hình cuối, nhưng nhóm thử 50 biến thể có PBO thấp hơn nhóm thử 5000 biến thể, và PBO phản ánh điều đó khi Sharpe đơn lẻ thì không. Nói cách khác, DSR đo *sản phẩm*, PBO đo *nhà máy* — và một nhà máy PBO 0.63 sẽ sản xuất ra Sharpe đẹp giả bất kể sản phẩm hôm nay tình cờ ra sao.

## 9.3 Kỷ luật thực hành: từ holdout đến CPCV

Biết bảy tội và ba thước đo là điều kiện cần; điều kiện đủ là một *quy trình* buộc con số ra được phải đáng tin. Trục xương sống của quy trình đó là câu hỏi kinh tế đi trước dữ liệu — như đã nói, tín hiệu phải trả lời "ai đang trả tiền cho tôi và vì sao" (chương 7) *trước* backtest đầu tiên, nếu không mọi kỷ luật dưới đây chỉ là trang trí cho một cuộc đãi noise. Kỷ luật không cứu được một ý tưởng không có nền kinh tế; nó chỉ giúp một ý tưởng *có* nền kinh tế không bị chính bạn làm hỏng.

### Holdout thật sự

Giữ 2–3 năm cuối của dữ liệu làm **holdout** và chạm nó đúng **một lần** — trước quyết định deploy, không trước đó. Mọi tinh chỉnh, mọi lần đổi lookback, mọi scan tham số diễn ra trên phần train/validation. Lý do khắc nghiệt: mỗi lần bạn nhìn holdout và điều chỉnh gì đó, holdout không còn là holdout — nó thành một validation set thứ hai, và $N$ của bạn tăng lên trong im lặng.

Định cỡ cái "im lặng" đó bằng chính DSR. Giả sử bạn *tưởng* mình chỉ thử $N = 10$ cấu hình chính thức, cho $SR_0 = \sqrt{2\ln 10 / 10} = 0.68$. Nhưng bạn đã lén nhìn holdout và tinh chỉnh 20 lần; con số $N$ thật là $10 \times 20 = 200$, cho $SR_0 = \sqrt{2\ln 200 / 10} = \sqrt{1.06} = 1.03$. Ngưỡng noise nhảy từ 0.68 lên 1.03 — nghĩa là một Sharpe 0.9 mà bạn tưởng "vượt ngưỡng thoải mái" thực ra *nằm dưới* ngưỡng thật. Một holdout bị nhìn 20 lần không tốt hơn không có holdout; nó tệ hơn, vì nó cho bạn cảm giác an toàn giả. Kỷ luật này khó nhất về *tâm lý*, không phải kỹ thuật — không ai ngăn được bàn tay bạn gõ lệnh chạy lại trên holdout ngoài chính bạn.

### Walk-forward / expanding window

Thay vì fit một lần trên toàn train rồi test, **walk-forward** mô phỏng đúng đời thật: fit tham số trên quá khứ đến thời điểm $t$, test trên đoạn kế tiếp $[t, t+\Delta]$, rồi cuộn cửa sổ tới và lặp lại. Kết quả là một chuỗi các đoạn OOS nối liền — chính là điều bạn sẽ trải nghiệm khi live: mô hình luôn được fit trên dữ liệu đã có, luôn giao dịch trên dữ liệu chưa thấy.

Định cỡ một walk-forward cụ thể. 10 năm dữ liệu daily ($T \approx 2520$ ngày). Chọn train tối thiểu 4 năm, bước tiến $\Delta = 1$ năm (~252 ngày), test trên năm kế. Vậy fold đầu fit trên 2015–2018, test 2019; fold hai fit 2015–2019, test 2020; …; fold cuối fit 2015–2023, test 2024 — tổng **6 đoạn OOS** liên tiếp, phủ 2019–2024. Bạn nối P&L sáu đoạn ấy thành *một* đường equity OOS duy nhất và tính Sharpe trên đường đó. Giả sử sáu đoạn cho Sharpe theo năm $\{1.3, 0.7, 0.2, 1.1, 0.9, 0.6\}$: điều đáng đọc không phải trung bình ~0.8 mà là *sự phân tán* và *thứ tự* — đoạn 2021 chỉ 0.2 cảnh báo chiến lược yếu đi ở một regime cụ thể, thông tin mà một con số Sharpe gộp toàn mẫu che mất hoàn toàn. Biến thể *expanding* giữ toàn bộ quá khứ trong train (cửa sổ lớn dần, như ví dụ trên); biến thể *rolling* giữ cửa sổ độ dài cố định (ví dụ luôn 4 năm gần nhất, quên quá khứ xa — hợp khi tin rằng regime cũ không còn liên quan).

### Purged K-Fold CV và embargo

Cross-validation ngây thơ trên chuỗi thời gian tài chính cho điểm ảo **một cách hệ thống**, và lý do rất tinh vi. Trong CV thường, bạn chia dữ liệu thành K fold, mỗi lần lấy một fold làm test và K−1 fold làm train. Với dữ liệu độc lập điều này ổn. Nhưng return tài chính không độc lập theo thời gian, và tệ hơn, **label thường overlap**: nếu label của mẫu ngày $t$ là "return 5 ngày tới" thì nó dùng thông tin đến $t+5$; một mẫu train ngay sát ranh giới với test sẽ *chia sẻ* các ngày với mẫu test, và mô hình học được cái nó đáng ra không được thấy. Đây là leakage tinh vi mà CV chuẩn không phát hiện — nó không phải bug trong code, nó là hệ quả của việc dán nhãn bằng return tương lai overlap.

López de Prado vá bằng hai cơ chế:

**Purge**: xóa khỏi train mọi mẫu có label overlap thời gian với bất kỳ mẫu test nào. Nếu label dùng horizon $h = 5$ ngày, mọi mẫu train mà cửa sổ label $[t, t+5]$ giao với cửa sổ của test đều bị loại.

**Embargo**: sau khối test, chặn thêm một khoảng nhỏ $e$ (ví dụ 1% độ dài dữ liệu, hay vài ngày) khỏi train — để chặn leakage ngược qua serial correlation của chính feature (không chỉ label). Return hôm sau còn dính chút autocorrelation với hôm nay; embargo cắt sợi dây đó.

Định cỡ tác động. Universe daily, horizon label $h=5$, 5-fold CV trên 10 năm ($T \approx 2520$ ngày, mỗi fold ~504 ngày). Mỗi ranh giới train/test, purge loại ~$h = 5$ ngày mỗi bên; với embargo 1% ($0.01 \times 2520 \approx 25$ ngày) thêm 25 ngày sau mỗi khối test. Tổng số ngày bị hi sinh nhỏ — cỡ vài chục ngày trên 2520, tức chỉ ~1–2% dữ liệu — nhưng *tác động lên điểm CV thì lớn không tương xứng*: trên nhiều dataset thực, purge+embargo hạ Sharpe CV quan sát từ mức phồng ~1.5 xuống mức thật ~0.8. Đọc tỉ lệ cho thấm: $(1.5-0.8)/1.5 \approx 47\%$ — nghĩa là gần một nửa "alpha" của CV ngây thơ là leakage, bị đánh cắp bởi vài chục ngày overlap ở các đường biên fold. Một sự hi sinh 2% dữ liệu để lộ ra 47% ảo giác là món hời hiếm có. Module cv trong `src/alpha` (purged, embargo) làm đúng việc này.

### CPCV — Combinatorial Purged Cross-Validation

Purged K-fold cho bạn *một* đường OOS (mỗi mẫu được test đúng một lần). Vấn đề: một đường OOS là *một* mẫu của tương lai — bạn không có phân phối của Sharpe, không biết con số 0.8 đó ổn định hay may rủi. CPCV giải quyết bằng cách kết hợp ý tưởng combinatorial của CSCV với purging của K-fold, và nó là chuẩn cao nhất hiện nay cho backtest ML.

Recipe CPCV từng bước:
1. Chia dữ liệu thành $N$ nhóm liên tiếp (groups), ví dụ $N = 6$.
2. Chọn $k$ nhóm làm test, $N - k$ nhóm còn lại làm train — với **mọi** tổ hợp. Với $N=6, k=2$ có $\binom{6}{2} = 15$ tổ hợp.
3. Mỗi tổ hợp: purge + embargo quanh mọi khối test, fit trên train, dự đoán trên test.
4. Vì mỗi nhóm xuất hiện trong test qua nhiều tổ hợp khác nhau, bạn ghép được nhiều **đường backtest (paths)** hoàn chỉnh, không chỉ một. Số path $= \binom{N}{k} \times k / N$. Với $N=6, k=2$: $15 \times 2 / 6 = 5$ paths.

Đọc lợi ích: thay vì một Sharpe OOS 0.8, CPCV cho bạn **5 Sharpe OOS** — một *phân phối*. Giả sử chúng ra $\{0.6, 0.75, 0.8, 0.9, 1.05\}$: trung bình

$$\bar{SR} = \frac{0.6 + 0.75 + 0.8 + 0.9 + 1.05}{5} = \frac{4.1}{5} = 0.82,$$

độ lệch chuẩn (mẫu) ≈ 0.17. Giờ bạn đọc được điều mà một đường không nói: chiến lược này có Sharpe OOS trung tâm ~0.82 nhưng dao động rộng, và path xấu nhất chỉ 0.6. Một khoảng tin cậy thô $0.82 \pm 0.17$ cho biết bạn khó mà kỳ vọng ổn định trên ~0.65 ở đời thật — con số mà một đường Sharpe 0.8 đơn độc không bao giờ tiết lộ. Nếu tăng $N$ lên 10 và $k=2$, số path lên $\binom{10}{2}\times 2/10 = 9$; $N=10, k=5$ cho $\binom{10}{5}\times 5/10 = 252 \times 5/10 = 126$ paths — cả một phân phối dày để tính khoảng tin cậy và PBO trực tiếp. Cái giá là chi phí tính toán tăng theo tổ hợp; đó là đánh đổi kinh điển giữa độ tin cậy thống kê và compute, và ở pod shop nghiêm túc người ta trả compute để mua độ tin cậy — vì một MDD bất ngờ đắt hơn nhiều lần chi phí một cụm CPU chạy qua đêm.

### Trơn theo tham số

Xuyên suốt mọi kỹ thuật trên là một nguyên tắc đơn giản chống overfit từ gốc: **ít tham số, và kết quả phải trơn theo tham số**. Nếu chiến lược sống khỏe ở lookback 19 ngày (Sharpe 1.4) nhưng chết ở 21 ngày (Sharpe 0.3), cái đỉnh nhọn đó là noise, không phải alpha — một edge kinh tế thật không nhạy đến mức đó với một tham số tùy chọn, vì thị trường không biết bạn chọn 20 hay 22 ngày. Vẽ Sharpe theo lookback: một cao nguyên rộng (plateau) — chẳng hạn Sharpe nằm quanh 0.85–0.95 cho mọi lookback từ 15 đến 60 ngày — nghĩa là robust; một đỉnh nhọn cô độc nhô lên 1.4 giữa một vùng phẳng ~0.3 nghĩa là bạn vừa fit vào một hẻm noise. Nguyên tắc này miễn phí và mạnh hơn phần lớn công cụ đắt tiền: nó nói cho bạn biết bạn đang cầm alpha hay artifact trước cả khi tính DSR, chỉ bằng một biểu đồ.

## 9.4 Đọc một tearsheet và backtest tổng hợp

Giả sử bạn đã qua mọi cửa: giả thuyết kinh tế đứng vững, purged CPCV cho phân phối Sharpe lành, DSR đủ cao, PBO thấp. Giờ đến bước đọc **tearsheet** — bảng tổng hợp chẩn đoán của chiến lược — như một người có nghề, tức đọc những gì Sharpe không nói.

Ngoài Sharpe / MDD / turnover quen thuộc, người có nghề nhìn:

**Equity curve trên log scale.** Trục dọc log biến compound đều thành một đường thẳng; độ dốc là growth rate. Điều cần soi là hình dạng: một đường "đẹp dần về cuối" (phẳng đầu, dốc cuối) là dấu hiệu cấu hình được fit cho giai đoạn gần — nghi ngờ overfit theo regime cuối. Đường thẳng đều qua nhiều regime mới đáng tin. Một mẹo đọc nhanh: che nửa cuối đường equity đi và tự hỏi "nếu chỉ có nửa đầu này, mình có deploy không?" — nếu câu trả lời là không, thì phần thuyết phục của backtest nằm ở một giai đoạn duy nhất, và giai đoạn duy nhất không phải bằng chứng.

**Rolling Sharpe 1 năm.** Sharpe tổng của cả mẫu giấu mất sự bất ổn. Rolling Sharpe cho thấy chiến lược ổn định hay chỉ sống nhờ một giai đoạn vàng. Một chiến lược Sharpe tổng 1.5 nhưng rolling Sharpe âm suốt 3 năm giữa mẫu là một chiến lược *bạn sẽ không giữ nổi* qua 3 năm đó trong đời thật — vốn sẽ bị rút, tâm lý sẽ vỡ, và Sharpe tổng 1.5 mà bạn không bao giờ chạm tới được thì vô nghĩa. Con số trên giấy giả định một nhà đầu tư kiên nhẫn vô hạn; con người thật không phải thế.

**Phân rã long leg vs short leg.** Với long-short, tách P&L hai chân. Short leg thường lỗ ròng — nó là *bảo hiểm* (hedge beta, hedge tail) chứ không phải nguồn alpha. Câu hỏi đúng không phải "short leg có lời không" mà "short leg có *đáng phí* không" — nó mua được bao nhiêu giảm rủi ro cho mỗi đồng nó tiêu. Với momentum 12-1 điển hình, long leg mang phần lớn Sharpe còn short leg đóng góp giảm beta nhưng chính là nơi momentum crash 2009 phát nổ (short leg +80%). Đọc đúng: cái short leg ấy vừa là bảo hiểm beta trong ngày thường vừa là quả bom trong ngày thị trường bật đáy — cùng một chân, hai vai trò trái ngược tùy regime.

**Factor exposure.** Hồi quy return chiến lược lên Fama-French + momentum:

$$r_t^{strat} = \alpha + \beta_{MKT} r_t^{MKT} + \beta_{HML} HML_t + \beta_{UMD} UMD_t + \varepsilon_t.$$

Nếu intercept $\alpha$ teo về 0 sau khi trừ các factor, "alpha" của bạn chỉ là value hoặc momentum đội lốt — bạn đang bán một factor công khai với giá alpha. Đây là bài test tàn nhẫn nhất và cũng hữu ích nhất: với momentum 12-1, hồi quy cho loading UMD ~0.9 và alpha residual ~0, đúng như kỳ vọng — *nó là* một factor công khai, không có gì bí mật, và tearsheet trung thực phải nói ra điều đó. Đặt con số vào bối cảnh phí: một factor công khai như UMD có thể mua qua ETF với phí vài chục bps/năm, nên nếu chiến lược của bạn tính phí quản lý 2% cho đúng cái exposure ấy, phần "alpha" bạn bán thực chất âm sau phí. Chỉ phần $\alpha$ *residual* — cái còn lại sau khi trừ mọi factor mua được rẻ — mới là thứ đáng tính tiền.

**Độ nhạy chi phí.** Con số một dòng đáng giá nhất của cả tearsheet: **Sharpe sau phí ở mức chi phí bi quan**. Bảng độ nhạy đầy đủ cho chiến lược mean-reversion turnover 40%/ngày, gross Sharpe trước phí 2.5:

| Chi phí một chiều (bps) | 0 | 2 | 5 | 10 | 15 |
|---|---|---|---|---|---|
| Sharpe sau phí | 2.5 | 1.9 | 1.0 | −0.5 | −2.0 |

Bảng này tuyến tính — mỗi bps chi phí một chiều gọt đi $\approx 0.30$ đơn vị Sharpe (kiểm: từ $c=0$ đến $c=5$, Sharpe rớt $2.5 \to 1.0$, đúng $1.5/5 = 0.30\,\text{/bps}$; từ $c=5$ đến $c=10$ rớt tiếp $1.0 \to -0.5$, lại $0.30\,\text{/bps}$). Điểm gãy (breakeven, Sharpe = 0) vì thế nằm ở $2.5 / 0.30 \approx 8.3$, tức **quanh ~8 bps** — nội suy tuyến tính giữa $c=5$ (Sharpe 1.0) và $c=10$ (Sharpe −0.5) cho đúng $5 + \frac{1.0}{1.5}\times 5 = 8.3\,\text{bps}$. Đọc ý nghĩa cho đúng: chiến lược này **là một cược vào chất lượng execution**, không phải vào tín hiệu. Cùng một tín hiệu y hệt, một shop có cost 3 bps sống khỏe (Sharpe $= 2.5 - 0.30\times 3 = 1.6$), một shop 10 bps lỗ (Sharpe −0.5). Alpha ở đây không nằm trong signal mà trong *khả năng trade rẻ* — nó là edge hạ tầng đội lốt edge tín hiệu. So sánh với momentum tháng, turnover chỉ ~10%/tháng: cùng dải chi phí 0–15 bps, drag hàng năm của nó chỉ cỡ $2\times 0.10 \times c \times 12\,\text{bps}$ — ở $c=15$ mới là $2\times 0.10\times 15\times 12 = 36\,\text{bps}$/năm, một hạt bụi so với 3024 bps của mean-reversion turnover cao, nên Sharpe của nó gần như không nhúc nhích. Nó gần miễn nhiễm chi phí, và vì thế nó là một chiến lược *khác về bản chất* dù cùng nằm dưới nhãn "systematic equity." Mỗi tearsheet phải có bảng này; thiếu nó, con số Sharpe không diễn giải được, vì bạn không biết mình đang bán edge tín hiệu hay edge hạ tầng.

### Synthetic / Monte Carlo backtest

Mọi kỹ thuật đến giờ chia sẻ một điểm yếu chung: chúng đều test trên **một** lịch sử — cái đã thật sự xảy ra. Nhưng lịch sử đó chỉ là một draw từ vô số quá khứ có thể có. Chiến lược của bạn sống sót 2008–2024 không chứng minh nó sống sót một 2008 hơi khác, một 2020 xảy ra vào chu kỳ khác. Backtest tổng hợp giải quyết chính xác điểm mù này: thay vì test trên quá khứ thật, ta test trên hàng nghìn quá khứ *có thể đã xảy ra*.

Ba cách dựng, từ nhẹ đến nặng:

**Block bootstrap.** Return có autocorrelation ngắn hạn, nên bootstrap từng ngày sẽ phá vỡ cấu trúc chuỗi. Thay vào đó lấy mẫu theo **khối** (block) độ dài $b$ ngày liên tiếp, ghép lại thành một chuỗi mới cùng độ dài. Chọn $b$ đủ dài để giữ autocorrelation (ví dụ $b = 20$ ngày cho monthly-ish structure). Chạy chiến lược trên mỗi chuỗi bootstrap → một phân phối Sharpe. Recipe: từ 10 năm dữ liệu, sinh 5000 chuỗi block-bootstrap, tính Sharpe mỗi chuỗi, đọc percentile. Nếu Sharpe thật 1.2 rơi vào percentile 50 của phân phối bootstrap thì nó *điển hình*; nếu nó nằm ở percentile 95 (tức 95% thế giới thay thế cho Sharpe thấp hơn), con số 1.2 là một draw may mắn — thế giới thật đã hào phóng với bạn hơn mức trung bình. Module bootstrap (block) trong `src/alpha` phục vụ đúng việc này.

**Monte Carlo từ mô hình return.** Fit một mô hình sinh cho return (ví dụ GARCH(1,1) cho vol clustering — running example: $\omega = 2\text{e-}6, \alpha = 0.08, \beta = 0.90$). Kiểm nhanh long-run vol của mô hình này để chắc nó hợp lý: phương sai dài hạn $\omega/(1-\alpha-\beta) = 2\text{e-}6 / (1 - 0.08 - 0.90) = 2\text{e-}6/0.02 = 1\text{e-}4$, tức vol dài hạn $\sqrt{1\text{e-}4} = 0.01 = 1\%$/ngày $\approx 1\% \times \sqrt{252} = 15.9\%$/năm — đúng khớp thị trường cổ phiếu. Rồi mô phỏng hàng nghìn đường giá tổng hợp với đúng đặc tính vol clustering và fat tail, chạy chiến lược trên mỗi đường. Ưu điểm so với bootstrap: sinh được cả những cú sốc *chưa từng* xuất hiện trong mẫu — một cú vol spike lớn hơn mọi thứ 2008–2024 từng thấy. Đây là cách duy nhất test chiến lược trước tail risk vượt lịch sử. Nhược điểm: bạn chỉ tin được kết quả tới mức tin được mô hình sinh; một mô hình bỏ sót jump (như GARCH thuần, vốn có đuôi dày hơn normal nhưng vẫn không mô hình cú nhảy gián đoạn) sẽ cho MDD lạc quan giả.

**Permutation của thứ tự thời gian** (cho tín hiệu path-independent): xáo trộn thứ tự các return để phá cấu trúc thời gian, xem bao nhiêu Sharpe của chiến lược đến từ *cấu trúc chuỗi* (thứ thật) so với từ *phân phối return* (thứ vô nghĩa với tín hiệu timing). Định cỡ để đọc: giả sử Sharpe thật 1.2; sau 1000 lần xáo thời gian, nếu phân phối Sharpe của các chuỗi xáo có trung bình ~0 và Sharpe thật 1.2 nằm ngoài percentile 99 của nó, tín hiệu của bạn *thật sự* khai thác cấu trúc thời gian (một p-value ~1% rằng edge là ngẫu nhiên). Ngược lại, nếu Sharpe không sụt đáng kể khi xáo — chuỗi xáo vẫn cho trung bình ~1.1 — thì gần hết "edge" đến từ phân phối return chứ không từ trình tự, một cảnh báo đỏ cho một chiến lược tự nhận là timing.

Đọc kết quả Monte Carlo bằng một con số cụ thể: giả sử 5000 mô phỏng cho phân phối Sharpe với trung vị 1.05, khoảng [percentile 5, percentile 95] = [0.4, 1.7], và MDD ở percentile 95 (xấu) là −38% (so với −25% quan sát trong lịch sử thật). Bài học tức thì: MDD lịch sử −25% là *lạc quan* — thế giới thật chỉ tình cờ không ném cho bạn cú tệ hơn, và bạn nên size vị thế cho một MDD −38% chứ không phải −25%. Sự chênh lệch $-38\%$ so với $-25\%$ không phải chi tiết học thuật: nếu bạn đặt đòn bẩy để chịu đúng −25%, một MDD −38% sẽ vượt ngưỡng chịu đựng và ép bạn cắt lỗ ở đúng đáy — biến một drawdown tạm thời thành một mất mát vĩnh viễn. Đây là nơi backtest tổng hợp trả về giá trị lớn nhất: không phải để tô hồng Sharpe, mà để nhìn thấy cái đuôi mà một lịch sử đơn lẻ đã may mắn giấu đi.

Nối lại toàn chương bằng một hình dung: một chiến lược đáng deploy phải sống sót *bốn* lớp kiểm định chồng lên nhau — sạch bảy tội, DSR đủ cao sau khi khai báo trung thực $N$, phân phối Sharpe từ CPCV không quá phân tán và không quá phụ thuộc vài path, và phân phối Monte Carlo cho MDD mà bạn *thật sự* chịu được. Mỗi lớp giết một loại ảo giác khác nhau: lớp một giết leakage và dataset bẩn, lớp hai giết multiple testing, lớp ba giết sự tự tin dựa trên một đường OOS may rủi, lớp bốn giết ảo tưởng rằng lịch sử đã thấy là lịch sử tệ nhất có thể. Con số cuối cùng còn sống sau cả bốn lớp không phải "Sharpe đẹp nhất bạn tìm được" — nó là con số khiêm tốn, thường thấp hơn nhiều Sharpe in-sample đầu tiên làm bạn phấn khích (nhớ ví dụ chạy xuyên chương: Sharpe in-sample 1.2 rơi về DSR ~0.52, CV phồng 1.5 rơi về ~0.8), nhưng là con số duy nhất bạn có quyền tin. Khoảng cách giữa hai con số đó — giữa Sharpe in-sample lúc đầu và Sharpe sống sót lúc cuối — chính là thứ phân biệt một quant buy-side có nghề với một người vừa tìm ra pattern đẹp trong noise.

# Chương 10: Feature engineering và labeling

Có một sự thật mà người mới học machine learning tài chính mất vài năm mới thấm: **chất lượng của feature và label quyết định kết quả nhiều hơn việc chọn model**. Đổi từ logistic regression sang gradient boosting sang neural net thường chỉ xê dịch Sharpe vài phần trăm; đổi cách bạn *gán nhãn* cho một sự kiện — từ "return 5 ngày tới dương hay âm" sang triple-barrier có stop-loss — có thể lật ngược dấu của cả một chiến lược. Chương 9 dạy cách *bác bỏ* một backtest; chương này dạy cách chuẩn bị nguyên liệu *trước khi* có gì để backtest, và đây là nơi phần lớn edge thực sự được tạo ra hoặc bị phá hủy. López de Prado gói triết lý này trong một câu nên dán lên màn hình cạnh câu ở chương 9: model là commodity, ai cũng `import xgboost` được; feature và label mới là nơi bạn hoặc có tài sản độc quyền, hoặc chỉ đang overfit noise một cách tinh vi.

Lý do sâu xa nằm ở bản chất dữ liệu tài chính: signal-to-noise ratio thấp khủng khiếp. Một tín hiệu tốt trên equity daily có information coefficient chỉ vào khoảng $0.03$–$0.05$ (chương 6), nghĩa là tương quan giữa dự báo và thực tế mới $3$–$5\%$. Bình phương con số đó ra tỷ lệ phương sai giải thích được: $R^2 = IC^2 \approx 0.03^2 = 0.0009$, tức chưa tới một phần nghìn. Nói cách khác, $99.9\%$ biến động của return là thứ model *không* giải thích được, chỉ $0.1\%$ là signal. Trong chế độ noise áp đảo signal như vậy, một model mạnh hơn chủ yếu học được thêm... nhiều noise hơn. Cái cứu bạn không phải capacity của model mà là bốn thứ, và chúng chính là bốn trục của chương này: (i) label phản ánh đúng thứ bạn thực sự trade, (ii) feature vừa dừng vừa còn memory, (iii) sample weight đếm mỗi sự kiện đúng một lần, (iv) cross-validation không để noise của quá khứ rò rỉ vào tương lai.

## 10.1 Vì sao "return H ngày tới" là một label tồi

Cách gán nhãn ngây thơ nhất — **fixed-horizon labeling** — là: đứng ở ngày $t$, nhìn tới ngày $t+H$, gán $y_t = \text{sign}(r_{t,t+H})$ với $r_{t,t+H}$ là return tích lũy $H$ ngày. Momentum tháng ở chương 7 dùng chính kiểu này: dự báo dấu return $21$ ngày tới. Nó đơn giản, dễ vectorize, và với tín hiệu tần suất thấp thì thường ổn. Vấn đề nảy sinh khi bạn thực sự *trade* tín hiệu với risk management — tức là gần như luôn luôn ở buy-side thật.

Xét một ví dụ số cụ thể để thấy tận mắt chỗ hỏng. Bạn có tín hiệu long một cổ phiếu vào ngày $t$ ở giá $100$, horizon $10$ ngày. Đường giá thực tế diễn ra như sau: $100 \to 101.5 \to 103 \to \mathbf{95}$ (ngày 4, thị trường sập) $\to 97 \to 99 \to 100.5 \to 101 \to 100.8 \to 100.5$ (ngày 10). Return $10$ ngày là $(100.5-100)/100 = +0.5\%$, nên fixed-horizon gán nhãn $y = +1$. Model học rằng cấu hình feature ngày $t$ là một tín hiệu long tốt. Nhưng trong đời thật, bạn vào lệnh với stop-loss ở $-4\%$ — tức mức giá $96$. Ngày 4 giá chạm $95$, nằm *dưới* $96$, stop bị kích hoạt: bạn *đã bị đá ra khỏi lệnh với lỗ $4\%$* và không bao giờ thấy được cái return $+0.5\%$ cuối chặng. Label $+1$ đang dạy model một điều **hoàn toàn ngược** với P&L thực tế mà bạn nhận (một khoản $-4\%$). Đây không phải trường hợp hiếm — mọi tín hiệu có drawdown giữa chặng đủ sâu để chạm stop đều bị fixed-horizon xuyên tạc theo đúng kiểu này, và trong một thị trường mà đường giá lắc dữ dội quanh một xu hướng mờ nhạt, drawdown giữa chặng là chuyện thường ngày chứ không phải ngoại lệ.

Vấn đề thứ hai của fixed-horizon: nó phẳng hóa mọi mức độ thắng/thua thành cùng một nhãn. Return $+0.3\%$ và return $+8\%$ đều là $y=+1$, dù xét về mặt trading chúng khác nhau một trời một vực. Người ta hay vá bằng một ngưỡng $\tau$: $y = +1$ nếu $r > \tau$, $-1$ nếu $r < -\tau$, $0$ nếu ở giữa. Nhưng chọn $\tau$ cố định — ví dụ $\pm 2\%$ — cho *mọi* cổ phiếu và *mọi* thời điểm lại sai theo một kiểu khác. Với một cổ phiếu vol $1\%$/ngày, ngưỡng $2\%$ tương đương $2$ độ lệch chuẩn — một biến cố hiếm, phải mất trung bình vài ngày mới thấy. Với một cổ phiếu vol $5\%$/ngày, cũng ngưỡng $2\%$ ấy chỉ bằng $0.4$ độ lệch chuẩn — nhiễu của nửa buổi sáng. Bạn kết thúc với một dataset mà nhãn dương của tên vol thấp phản ánh alpha thật, còn nhãn dương của tên vol cao chỉ phản ánh việc nó ồn ào. Nói cách khác, ngưỡng cố định vô tình mã hóa vol vào nhãn, và model sẽ vui vẻ học rằng "tên nào càng loạn thì càng đáng đánh" — một bài học sai bét. Đây là gốc rễ của việc **barrier phải scale theo vol từng tên**, mà ta sẽ dựng ngay dưới đây.

## 10.2 Triple-barrier: gán nhãn theo cách bạn thực sự trade

Ý tưởng của **triple-barrier method** (López de Prado, *AFML*) là mô phỏng chính xác vòng đời của một lệnh có quản trị rủi ro, rồi gán nhãn theo *cái đầu tiên xảy ra*. Từ mỗi điểm vào lệnh, dựng ba rào cản trong không gian (giá) × thời gian:

- **Profit-taking barrier** (rào trên): mức giá chốt lời. Chạm trước → nhãn $+1$.
- **Stop-loss barrier** (rào dưới): mức giá cắt lỗ. Chạm trước → nhãn $-1$.
- **Vertical barrier** (rào dọc): thời hạn tối đa $H$. Hết giờ mà chưa chạm rào ngang nào → nhãn theo dấu return tại thời điểm timeout (hoặc gán $0$ nếu ta muốn một nhãn "vô định" để loại khỏi tập trade).

Chạy lại một ví dụ với đầy đủ số để thấy cơ chế. Entry ngày $t$ ở giá $100$. Ta đặt profit-taking $= 102$ (rào trên $+2\%$), stop-loss $= 99$ (rào dưới $-1\%$), timeout $H = 10$ ngày. Đường giá thực tế: $100 \to 101 \to 100.5 \to 101.2 \to 100.9 \to \mathbf{102.3}$ (ngày 6) $\to \dots$ Ngày 6 giá lần đầu vượt $102$, chạm rào trên trước cả hai rào kia. Nhãn $= +1$, và — điểm cực kỳ quan trọng — **holding period thực tế là $6$ ngày**, không phải $10$. Triple-barrier không chỉ cho bạn *nhãn* mà còn cho bạn *thời điểm thoát*, tức độ dài đời thực của mỗi mẫu. Ta sẽ cần chính con số "$6$ ngày" này ở mục 10.4 về sample weight, vì hai lệnh có holding overlap nhau thì không phải hai quan sát độc lập.

So sánh trực tiếp với fixed-horizon trên cùng một đường giá để thấy chúng cho nhãn *ngược nhau*. Lấy lại đúng đường của ví dụ mở đầu: $100 \to 101.5 \to 103 \to 95$ (ngày 4) $\to 97 \to 99 \to 100.5 \to 101 \to 100.8 \to 100.5$ (ngày 10). Fixed-horizon $10$ ngày: return cuối $+0.5\%$ → nhãn $+1$. Triple-barrier với stop-loss $96$: ngày 4 giá $95$ xuyên thủng rào dưới đầu tiên (vì $95 < 96$) → nhãn $-1$, holding $4$ ngày. Cùng một cấu hình feature ban đầu, hai phương pháp dạy model hai điều đối nghịch. Câu hỏi "cái nào đúng" có đáp án dứt khoát: cái phản ánh P&L thật của bạn. Nếu bạn thực sự chạy stop-loss $-4\%$, thì $-1$ là nhãn đúng, còn fixed-horizon đang bơm rác có hệ thống vào training set — nó nói "long", đời nói "lỗ $4\%$".

**Barrier scale theo vol từng tên.** Đây là chi tiết phân biệt triple-barrier làm cẩu thả với triple-barrier làm đúng. Thay vì đặt rào cứng $\pm 2\%$ cho mọi tên, ta đặt rào ở bội số của daily volatility ước lượng tại thời điểm vào lệnh:

$$\text{PT}_t = P_t \cdot (1 + m_u \cdot \sigma_t), \qquad \text{SL}_t = P_t \cdot (1 - m_l \cdot \sigma_t)$$

với $\sigma_t$ là ước lượng vol ngày (EWMA của return, xem chương 3), $m_u, m_l$ là hệ số bội (ví dụ $m_u = m_l = 2$). Ví dụ số cạnh nhau để thấy sự khác biệt: một cổ phiếu vol thấp $\sigma_t = 1\%$/ngày cho PT $= 100 \times (1 + 2\times0.01) = 102$ và SL $= 100 \times (1 - 2\times0.01) = 98$; một cổ phiếu vol cao $\sigma_t = 3\%$/ngày cho PT $= 100 \times 1.06 = 106$ và SL $= 100 \times 0.94 = 94$. Rào của tên vol cao rộng gấp ba, đúng như bản chất "nó đi xa hơn trong cùng một khoảng thời gian" của nó. Bây giờ nhãn $+1$ của cả hai tên đều mang cùng một ý nghĩa thống kê: "giá đã đi được $2$ sigma theo chiều thuận trước khi đi $2$ sigma theo chiều nghịch, trong vòng $H$ ngày". Model không còn nhầm sự ồn ào của tên vol cao với alpha. Cân đối này cũng làm cho **tỷ lệ nhãn cân bằng hơn** giữa các tên và các regime vol — một dataset mà nhãn dương/âm xấp xỉ $50/50$ trong mọi nhóm là dataset mà model không thể ăn gian bằng cách học base rate (nếu $80\%$ nhãn là $+1$, một classifier ngu ngốc luôn đoán $+1$ đã đạt accuracy $80\%$ mà không học được gì).

Một tinh chỉnh cuối mà pro luôn làm: chọn $H$ và bội số barrier sao cho **phần lớn mẫu chạm rào ngang, không phải rào dọc**. Nếu $80\%$ mẫu hết giờ ở vertical barrier, bạn thực chất đã quay về fixed-horizon và mất hết lợi ích của việc mô phỏng stop/target. Ngược lại nếu barrier quá hẹp thì mọi thứ chạm rào trong nửa ngày và nhãn chỉ phản ánh microstructure noise. Có một sweet spot, và bạn tìm nó bằng cách nhìn **phân phối holding period thực tế**: một tập lành mạnh cho equity daily với $H = 10$ và $m = 2$ thường có khoảng $60$–$70\%$ mẫu thoát bằng rào ngang, holding trung vị chừng $3$–$4$ ngày, và một cái đuôi kéo tới $H = 10$ dành cho những lệnh lình xình không đi đâu. Nếu bạn thấy holding trung vị dí sát $H$, hãy nới bội số barrier xuống; nếu thấy nó dí sát $1$ ngày, hãy nới ra.

## 10.3 Meta-labeling: tách "hướng" khỏi "cỡ cược"

Meta-labeling là một trong những ý tưởng đẹp và bị hiểu lầm nhiều nhất của AFML, nên đáng dừng lại kỹ. Vấn đề nó giải quyết: một model đơn lẻ phải làm hai việc rất khác nhau cùng lúc — quyết định **hướng** (long hay short) và quyết định **niềm tin** (đặt cược lớn hay nhỏ). Trộn hai nhiệm vụ này vào một classifier thường cho kết quả tồi ở cả hai, vì tín hiệu định hướng và tín hiệu định cỡ sống ở những feature khác nhau và đòi hỏi những trade-off khác nhau về recall/precision.

Kiến trúc meta-labeling tách đôi:

**Tầng một — primary model** quyết định *hướng*, và cố tình để nó đơn giản. Có thể là một quy tắc kinh tế thô: "long khi momentum 12-1 dương, short khi âm" (chính tín hiệu momentum ở chương 7). Primary model được chỉnh để có **recall cao** — nó bắt gần hết cơ hội thật, chấp nhận đánh cả nhiều tín hiệu giả. Nó trả lời đúng một câu: "nếu tôi đánh, tôi đánh chiều nào".

**Tầng hai — meta-model** là một ML classifier nhị phân, *không* dự báo hướng. Nó nhận feature (bao gồm cả output/độ mạnh của primary model) và dự báo một thứ duy nhất: **xác suất mà cược của primary model là đúng**. Label của tầng hai là $\{0, 1\}$: gán $1$ nếu cược của primary hóa ra thắng (theo chính triple-barrier ở trên), $0$ nếu thua. Chú ý meta-model chỉ được huấn luyện *trên những thời điểm primary model quyết định đánh* — nó học cách phân biệt các lần đánh tốt với các lần đánh tồi, trong không gian đã được primary thu hẹp lại.

Vì sao tách như vậy lại thắng? Ba lý do cụ thể. **Thứ nhất**, nó chuyển bài toán từ "dự báo hướng" (cực khó, IC $\sim 0.03$) sang "lọc false positive" (dễ hơn nhiều, vì primary đã thu hẹp không gian và mọi mẫu đều đã có một hướng để đánh giá). **Thứ hai**, output xác suất $p$ của meta-model đưa *trực tiếp* vào **bet sizing**. Với một payoff đối xứng thắng/thua $1$ đơn vị, công thức Kelly cho cỡ cược tối ưu là $f^\star = 2p - 1$ (chương 11): $p = 0.80 \Rightarrow f^\star = 0.60$ (đặt to), $p = 0.55 \Rightarrow f^\star = 0.10$ (đặt nhỏ), $p \le 0.50 \Rightarrow f^\star \le 0$ (không đánh). Đây là cầu nối trực tiếp tới position sizing — bạn cần một xác suất được *hiệu chỉnh* (calibrated) để cắm vào công thức cỡ cược, và meta-model sinh ra đúng thứ đó, trong khi một primary model chỉ cho ra dấu $\pm 1$ thì không. **Thứ ba**, nó cho phép **cải thiện precision mà không đụng vào primary logic** — bạn giữ nguyên tín hiệu momentum công khai, chỉ thêm một lớp lọc học từ dữ liệu riêng của mình, và toàn bộ IP của bạn nằm ở lớp lọc đó chứ không ở tín hiệu ai cũng biết.

Ví dụ số để thấy meta-labeling thay đổi cái gì. Giả sử primary model (long/short theo momentum) trên tập test có $1000$ lần đánh, thắng $520$, thua $480$ — precision $52\%$, một edge mỏng dính điển hình. Giờ meta-model học lọc: nó gán xác suất thắng cho từng lần đánh, và ta chỉ giữ những lần $p > 0.6$. Giả sử ngưỡng này giữ lại $300$ lần đánh, trong đó thắng $195$, thua $105$ — precision nhảy lên $195/300 = 65\%$. Ta đã **hy sinh recall** (bỏ $700$ cơ hội) **để mua precision** ($52\% \to 65\%$).

Với position sizing, đây là một đổi chác cực kỳ có lời, và ta định lượng được nó. Mô hình hóa mỗi lệnh như một cược với payoff $\pm 1$ và các cược độc lập: edge trên một cược là $2p - 1$, phương sai là $1 - (2p-1)^2$, nên Sharpe của tổng $N$ cược tỷ lệ với $\sqrt{N} \cdot (2p-1) / \sqrt{1-(2p-1)^2}$. Với primary thô: $p=0.52$, $N=1000$ cho $\sqrt{1000}\times 0.04 / \sqrt{1-0.04^2} \approx 1.27$. Với tập đã lọc: $p=0.65$, $N=300$ cho $\sqrt{300}\times 0.30 / \sqrt{1-0.30^2} \approx 5.4$. Con số tuyệt đối này là lý tưởng hóa (giả định IID, bỏ qua phí và crowding, nên đừng đọc nó là Sharpe live) — nhưng *tỷ số* giữa hai kịch bản mới là thứ đáng tin, và nó nói rõ: việc edge nhảy từ $4$ điểm lên $30$ điểm lấn át hoàn toàn việc số cược giảm từ $1000$ xuống $300$, vì Sharpe đi tuyến tính theo edge nhưng chỉ đi theo *căn bậc hai* của số cược. Đây là biểu hiện cụ thể của "breadth × IC" trong Fundamental Law (chương 6): meta-labeling đánh đổi breadth lấy IC, và khi IC ban đầu quá thấp thì đổi chác đó gần như luôn thắng.

Cạm bẫy thực chiến của meta-labeling: nó **chỉ sửa được precision, không sửa được một primary model sai hướng hệ thống**. Nếu primary model long đúng những thứ đáng short, meta-model học được rằng "mọi cược của primary đều tồi" và trả $p \approx 0$ khắp nơi — bạn không đánh gì cả, mà cũng chẳng có gì để đánh vì hướng đã sai từ gốc. Meta-labeling là bộ lọc chất lượng, không phải máy sửa lỗi định hướng. Và như mọi thứ trong chương này, nếu meta-model được train/validate mà không purge overlap thì con số precision $65\%$ ở trên là ảo — ta quay lại điểm này ở 10.7.

## 10.4 Sample weights: khi một sự kiện bị đếm nhiều lần

Đây là chỗ mà machine learning tài chính lệch khỏi ML sách giáo khoa một cách sâu sắc nhất, và là chỗ người mới hầu như luôn bỏ sót. ML chuẩn giả định các mẫu **IID** — độc lập, cùng phân phối. Với triple-barrier, giả định độc lập bị vi phạm trắng trợn, và lý do rất vật lý: **các mẫu overlap nhau về thời gian**.

Hình dung: mẫu vào ngày thứ Hai có holding tới thứ Sáu ($5$ ngày). Mẫu vào thứ Ba có holding tới thứ Hai tuần sau. Hai mẫu này chia sẻ bốn ngày return chồng lấn (thứ Ba–thứ Sáu). Nếu thị trường có một cú sốc lớn vào thứ Tư, cú sốc đó xuất hiện trong nhãn của *cả hai* mẫu — thậm chí của hàng chục mẫu có holding trùm qua thứ Tư. Kết quả: một sự kiện đơn lẻ (cú sốc thứ Tư) được **đếm nhiều lần** trong training set. Model tưởng nó có $N$ quan sát độc lập, thực ra số quan sát *hiệu dụng* nhỏ hơn nhiều — đúng bằng vấn đề "$N=3000$ cổ phiếu nhưng $N$ hiệu dụng vài chục" ở chương 3, chỉ lần này là chồng lấn theo *thời gian* thay vì theo *cross-section*.

Cách sửa của López de Prado là **weight mỗi mẫu theo uniqueness** — mức độ "riêng" của nó, tức phần thông tin không chia sẻ với mẫu khác. Recipe từng bước:

**Bước 1 — đếm concurrency.** Với mỗi ngày $s$ trên trục thời gian, đếm số mẫu có holding period trùm qua ngày đó. Gọi số này là $c_s$ (concurrency count). Nếu chỉ một mẫu "sống" tại ngày $s$ thì $c_s = 1$; nếu năm mẫu cùng holding trùm ngày $s$ thì $c_s = 5$.

**Bước 2 — tính uniqueness của mẫu $i$.** Với mỗi ngày $s$ trong holding period của mẫu $i$, đóng góp uniqueness của ngày đó là $1/c_s$ (nếu năm mẫu chia nhau ngày đó, mỗi mẫu chỉ "sở hữu" $1/5$ ngày đó). Uniqueness trung bình của mẫu $i$ là:

$$\bar u_i = \frac{1}{|H_i|} \sum_{s \in H_i} \frac{1}{c_s}$$

với $H_i$ là tập ngày trong holding period của mẫu $i$.

**Bước 3 — dùng $\bar u_i$ làm sample weight** khi fit model (hầu hết thư viện ML nhận `sample_weight`), và cũng dùng để tính số mẫu hiệu dụng.

Ví dụ số đầy đủ. Có ba mẫu trên trục $6$ ngày (ngày 1–6):

- Mẫu A: holding ngày 1–3.
- Mẫu B: holding ngày 2–4.
- Mẫu C: holding ngày 3–5.

Đếm concurrency từng ngày: ngày 1 chỉ có A → $c_1 = 1$; ngày 2 có A, B → $c_2 = 2$; ngày 3 có A, B, C → $c_3 = 3$; ngày 4 có B, C → $c_4 = 2$; ngày 5 chỉ có C → $c_5 = 1$; ngày 6 không ai → $c_6 = 0$.

Uniqueness của A (ngày 1,2,3): $\bar u_A = \frac{1}{3}\left(\frac{1}{1} + \frac{1}{2} + \frac{1}{3}\right) = \frac{1}{3}(1 + 0.5 + 0.333) = \frac{1.833}{3} = 0.611$.

Uniqueness của B (ngày 2,3,4): $\bar u_B = \frac{1}{3}\left(\frac{1}{2} + \frac{1}{3} + \frac{1}{2}\right) = \frac{1}{3}(0.5 + 0.333 + 0.5) = \frac{1.333}{3} = 0.444$.

Uniqueness của C (ngày 3,4,5): $\bar u_C = \frac{1}{3}\left(\frac{1}{3} + \frac{1}{2} + \frac{1}{1}\right) = \frac{1}{3}(0.333 + 0.5 + 1) = \frac{1.833}{3} = 0.611$.

Đọc kết quả: B nằm giữa, chồng lấn cả hai phía, nên "riêng" ít nhất ($0.444$) và bị hạ trọng số; A và C nằm rìa, độc lập hơn, được trọng số cao hơn ($0.611$). Nếu để nguyên trọng số bằng nhau, model sẽ để B — mẫu redundant nhất — có tiếng nói ngang A và C, tức để cái ngày 3 (nơi cả ba chồng lên nhau) chi phối training gấp ba lần đáng ra nó được. Cộng ba uniqueness lại: $0.611 + 0.444 + 0.611 = 1.67$. Đây là **số mẫu hiệu dụng** — ba mẫu overlap chỉ mang thông tin của $\sim 1.67$ mẫu độc lập. Con số này quan trọng không chỉ để weight mà để *biết mình thực sự có bao nhiêu dữ liệu*: một dataset $100{,}000$ mẫu triple-barrier với holding trung bình $10$ ngày trên universe chồng lấn dày có thể chỉ đáng vài nghìn mẫu độc lập, và mọi t-stat phải hiểu theo con số nhỏ hơn đó — nếu không bạn sẽ tưởng mình có ý nghĩa thống kê trong khi thực ra đang đọc noise của một mẫu bé tí.

Một tinh chỉnh thường đi kèm là **time-decay weight**: nhân thêm một hệ số giảm dần theo tuổi mẫu, vì thị trường không dừng và cấu trúc alpha phân rã theo thời gian. Cách làm tuyến tính đơn giản: mẫu mới nhất nhận hệ số $1$, mẫu cũ nhất nhận một hệ số sàn $c \in [0,1]$ (ví dụ $c = 0.5$), và các mẫu ở giữa nội suy tuyến tính. Với bốn mẫu xếp theo tuổi từ cũ nhất tới mới nhất và $c = 0.5$, hệ số decay lần lượt là $0.500,\ 0.667,\ 0.833,\ 1.000$ — mẫu cũ nhất chỉ được tính bằng nửa mẫu mới nhất. Trọng số cuối cùng của mỗi mẫu là tích của uniqueness $\bar u_i$ với hệ số decay này; đặt $c = 0$ thì mẫu cũ nhất bị xóa hẳn, đặt $c = 1$ thì tắt time-decay. Và khi cần bootstrap trên dữ liệu chồng lấn, ta dùng **sequential bootstrap**: thay vì rút mẫu đều tay như bootstrap IID (vốn sẽ hay rút trúng những mẫu redundant), mỗi lần rút ta *ưu tiên các quan sát ít trùng với những gì đã rút* — cụ thể, xác suất rút mẫu $j$ ở mỗi bước tỷ lệ với uniqueness trung bình của $j$ *có điều kiện* trên tập đã rút, nên một mẫu nằm đè lên mẫu vừa được chọn sẽ có xác suất bị chọn lại thấp đi. Kết quả là các mẫu bootstrap gần độc lập hơn, và ước lượng phương sai không bị bóp nhỏ giả tạo (liên hệ block bootstrap ở chương 9). Module `labeling` và `bootstrap` trong `src/alpha` là nơi các phép đếm này sống.

## 10.5 Fractional differentiation: giữ memory mà vẫn dừng

Bây giờ chuyển từ label sang feature, và tới một trong những công cụ tinh tế nhất của AFML. Vấn đề đặt ra là một mâu thuẫn cơ bản mà chương 3 đã gieo mầm: **giá không dừng** (non-stationary — variance nổ theo thời gian, ADF không bác bỏ unit root), nên mọi model thống kê đòi hỏi tính dừng đều gãy trên chuỗi giá thô. Cách vá kinh điển là lấy sai phân bậc một — chuyển từ giá sang return, $\tilde r_t = \ln P_t - \ln P_{t-1}$. Return thì dừng đẹp. Nhưng phép sai phân bậc một này **xóa sạch memory**: return hôm nay gần như không tương quan với return hôm qua (autocorrelation $\sim 0$), và mọi thông tin về *mức* giá — về việc ta đang ở đâu so với một tháng trước, đang trên hay dưới đường trung bình dài hạn — bị vứt bỏ hoàn toàn. Ta đã đánh đổi toàn bộ memory để mua tính dừng.

Câu hỏi của fractional differentiation: **có nhất thiết phải sai phân nguyên bậc $1$ không?** Nếu bậc $0$ (giá thô) giữ $100\%$ memory nhưng không dừng, còn bậc $1$ (return) dừng nhưng $0\%$ memory, thì đâu đó ở giữa — bậc phân số $d \in (0, 1)$ — phải tồn tại một điểm mà chuỗi *vừa đủ dừng* (ADF bác bỏ được) *vừa còn giữ được phần lớn memory*. Toán học cho phép chuyện này qua khai triển nhị thức của toán tử sai phân $(1-B)^d$ với $B$ là backshift operator ($B X_t = X_{t-1}$):

$$(1-B)^d = \sum_{k=0}^{\infty} \binom{d}{k}(-B)^k = \sum_{k=0}^{\infty} \omega_k B^k$$

Chuỗi phân số hóa là tổ hợp có trọng số của các giá trị quá khứ, $\tilde X_t = \sum_{k=0}^{\infty} \omega_k X_{t-k}$, với trọng số tính đệ quy:

$$\omega_0 = 1, \qquad \omega_k = -\omega_{k-1} \cdot \frac{d - k + 1}{k}$$

Chạy số cho $d = 0.4$ (một giá trị điển hình), đi từng bước để công thức đệ quy trở nên cụ thể:

- $\omega_0 = 1$
- $\omega_1 = -\omega_0 \cdot \dfrac{0.4 - 1 + 1}{1} = -1 \cdot 0.4 = -0.40$
- $\omega_2 = -\omega_1 \cdot \dfrac{0.4 - 2 + 1}{2} = -(-0.40) \cdot \dfrac{-0.6}{2} = 0.40 \cdot (-0.3) = -0.12$
- $\omega_3 = -\omega_2 \cdot \dfrac{0.4 - 3 + 1}{3} = -(-0.12) \cdot \dfrac{-1.6}{3} = 0.12 \cdot (-0.533) = -0.064$
- $\omega_4 = -\omega_3 \cdot \dfrac{0.4 - 4 + 1}{4} = -(-0.064) \cdot \dfrac{-2.6}{4} = 0.064 \cdot (-0.65) = -0.042$
- $\omega_5 = -\omega_4 \cdot \dfrac{0.4 - 5 + 1}{5} \approx -0.030$

Vậy dãy trọng số $d=0.4$ là $\{1,\, -0.40,\, -0.12,\, -0.064,\, -0.042,\, -0.030,\, \dots\}$. Nhìn kỹ hai điều. **Thứ nhất, trọng số tắt chậm** — không cắt phăng về $0$ như sai phân bậc $1$ (chỉ có $\{1, -1\}$ rồi hết) mà kéo một cái đuôi giảm dần vô hạn. Chính cái đuôi này là *memory*: giá trị hôm nay vẫn phụ thuộc vào giá cách đây $5$, $10$, $50$ phiên với trọng số nhỏ nhưng khác $0$. **Thứ hai, tốc độ tắt do $d$ điều khiển**: $d$ càng lớn (gần $1$) trọng số tắt càng nhanh, càng ít memory, càng dừng; $d$ càng nhỏ (gần $0$) đuôi càng dài, memory càng nhiều, càng khó dừng. So sánh trực tiếp bằng số: với $d = 0.9$ ta có $\omega_1 = -0.90$, $\omega_2 = -0.045$ — tắt rất nhanh, chuỗi gần như return; với $d = 0.1$ ta có $\omega_1 = -0.10$, $\omega_2 = -0.0285$ — đuôi rất dài, chuỗi gần như giá thô. (Để ý cùng là $\omega_2$ nhưng $d=0.9$ cho $-0.045$ còn $d=0.1$ cho $-0.0285$; đừng nhầm hai giá trị này — chúng đến từ hai bậc rất khác nhau.) $d$ là núm xoay liên tục giữa hai cực memory và stationarity.

**Chọn $d$ nhỏ nhất qua ADF** là recipe cốt lõi, và nó tối ưu đúng cái mâu thuẫn: ta muốn *tối thiểu* memory bị hy sinh (tức $d$ nhỏ nhất) *với điều kiện* chuỗi đã đủ dừng (ADF bác bỏ unit root). Quy trình từng bước:

1. Với mỗi $d$ trong lưới $\{0,\ 0.1,\ 0.2,\ \dots,\ 1.0\}$, tính chuỗi fractionally differentiated $\tilde X_t^{(d)}$. Trong thực tế ta cắt đuôi trọng số ở một ngưỡng $|\omega_k| < \tau$ để có cửa sổ hữu hạn — gọi là fixed-width window. Ví dụ với $d = 0.4$ và $\tau = 0.01$, từ dãy trên ta thấy $|\omega_9| = 0.0128 > 0.01$ nhưng các số hạng sau tụt dưới $0.01$, nên cửa sổ dừng ở khoảng $k \approx 9$–$10$ số hạng; $d$ nhỏ hơn thì đuôi dài hơn, cửa sổ rộng hơn.
2. Chạy ADF test trên chuỗi kết quả, ghi lại ADF statistic và p-value.
3. Chọn $d^\star$ là giá trị *nhỏ nhất* mà ADF statistic vượt qua ngưỡng bác bỏ (ví dụ ngưỡng $5\%$).

Ví dụ số điển hình từ AFML trên một chuỗi giá equity: ở $d = 0$ (giá thô) ADF statistic $\sim -0.3$ (không bác bỏ, còn unit root); tăng $d$ dần, ADF statistic âm dần (càng dừng hơn); nó vượt ngưỡng $5\%$ ($\sim -2.86$) ở khoảng $d \approx 0.35$. Vậy $d^\star \approx 0.35$: chuỗi vừa đủ dừng để ADF bác bỏ, mà correlation với chuỗi giá gốc vẫn $\sim 0.995$ — tức giữ được gần như *toàn bộ* memory của mức giá. So với return ($d=1$) có correlation với giá gốc gần bằng $0$, đây là một bước nhảy vọt về thông tin giữ lại: bạn đổi từ "vứt $100\%$ memory" xuống "vứt chưa tới $1\%$ memory" mà vẫn thỏa điều kiện dừng. Feature "log-price fractionally differentiated tại $d^\star$" vì thế là một trong những feature nền tảng đẹp nhất cho ML tài chính: nó dừng (model không gãy), nó có memory (biết ta đang ở đâu so với quá khứ), và nó không phải return (nên mang thông tin *bổ sung* cho các feature return-based thay vì trùng lặp). Module `fracdiff` và `stationarity` (adf, kpss) trong `src/alpha` bắt cặp đúng cho recipe này.

## 10.6 Feature importance đúng cách

Bạn có $200$ feature. Cái nào thực sự mang thông tin, cái nào là noise được model ghi nhớ? Đây là câu hỏi mà López de Prado đặt *lên trên cả* backtest ("Backtesting is not a research tool. Feature importance is." — chương 9): một feature importance đáng tin là bằng chứng mạnh hơn một backtest đẹp, vì nó nói cho bạn biết *cơ chế* của alpha, không chỉ kết quả — mà cơ chế thì khó overfit hơn nhiều so với một đường equity. Nhưng làm sai thì nó dối bạn ngọt ngào. Có bốn phương pháp, xếp từ rẻ-và-lệch tới đắt-và-đúng.

**MDI (Mean Decrease Impurity)** — importance mặc định của random forest / gradient boosting: cộng dồn mức giảm impurity (Gini/entropy) mà mỗi feature tạo ra qua tất cả các split có nó. Ưu điểm duy nhất: **miễn phí**, tính sẵn trong lúc train. Nhược điểm chí mạng: nó **bias** một cách hệ thống. MDI thổi phồng importance của (i) feature liên tục / high-cardinality (có nhiều điểm split để chọn hơn nên dễ tình cờ giảm impurity), và (ii) feature xuất hiện gần gốc cây. Nó cũng in-sample thuần túy — đo model *đã* dùng feature nào, không đo feature có *dự báo out-of-sample* hay không. Với hai feature tương quan cao, MDI chia đôi importance một cách tùy tiện tùy cái nào tình cờ được cây chọn trước. MDI dùng để sàng lọc thô rất nhanh thì được; đừng bao giờ ra quyết định giữ/bỏ feature dựa trên nó một mình.

**MDA (Mean Decrease Accuracy) / permutation importance** — chuẩn vàng thực dụng: train model, đo performance out-of-sample (accuracy, negative log-loss, hoặc Sharpe của chiến lược); rồi với *từng feature một*, **xáo trộn (permute)** cột đó để phá vỡ liên hệ của nó với label, và đo lại performance. Mức *sụt* performance chính là importance của feature: feature quan trọng → xáo nó → performance rớt mạnh; feature vô dụng → xáo nó → performance gần như không đổi (thậm chí tăng nhẹ, dấu hiệu feature đang gây nhiễu). Ưu điểm: đo đúng thứ ta cần — **giá trị dự báo out-of-sample**, và hoàn toàn model-agnostic. Ví dụ số: model có accuracy OOS $56\%$. Permute feature "momentum 12-1" → accuracy rớt xuống $51\%$ (giảm $5$ điểm) → importance cao, feature này chở phần lớn signal. Permute feature "day-of-week" → accuracy đổi thành $56.1\%$ (tăng $0.1$ điểm) → importance $\approx 0$, thậm chí hơi âm, feature này chỉ thêm nhiễu, nên loại. **Điểm sống còn**: MDA phải chạy trên **purged CV** (chương 9). Nếu bạn permute và đo trên fold test bị rò rỉ overlap từ train, thì "importance" bạn đo được một phần là importance của việc *ghi nhớ mẫu chồng lấn*, không phải dự báo thật — đây là cách phổ biến nhất khiến feature importance nói dối, và nó nói dối theo hướng *có lợi cho bạn*, tức nguy hiểm nhất.

**SHAP (SHapley Additive exPlanations)** — mượn giá trị Shapley từ lý thuyết trò chơi hợp tác để phân bổ *công lao* dự báo cho từng feature một cách công bằng, thỏa các tiên đề cộng tính: mỗi dự báo được phân rã thành một base value cộng với đóng góp của từng feature. Ví dụ số cho một dự báo cụ thể, giả sử output ở thang xác suất và base value (trung bình dự báo của model) là $0.50$: feature "momentum" đóng góp $+0.12$, "vol_regime" $+0.05$, "value" $+0.02$, "day_of_week" $-0.01$. Cộng lại: $0.50 + 0.12 + 0.05 + 0.02 - 0.01 = 0.68$ — đúng bằng dự báo của model cho quan sát đó, và bạn đọc được ngay ai đẩy nó lên ($0.68 > 0.50$ chủ yếu nhờ momentum). SHAP cho hai thứ mà MDA/MDI không cho: (i) importance **cục bộ** — với *một* dự báo cụ thể, feature nào đẩy nó lên/xuống bao nhiêu, không chỉ importance trung bình toàn cục; (ii) **dấu và hình dạng** của tác động — feature này tác động thuận hay nghịch, tuyến tính hay phi tuyến, ở vùng giá trị nào. Cực kỳ hữu ích để *hiểu* model và bắt các quan hệ phi tuyến (feature X chỉ quan trọng khi vol cao). Cái giá: đắt tính toán, và giống mọi importance in-sample nó vẫn cần được kiểm chứng OOS — SHAP nói model *nghĩ gì*, không tự động nói model *đúng*.

**Cluster feature tương quan TRƯỚC** — bước phải làm trước cả ba phương pháp trên. Khi features tương quan cao (mà features tài chính luôn tương quan cao — mọi biến thể momentum, mọi biến thể vol đều na ná nhau), mọi importance đơn-feature đều bị "chia phiếu": hai feature giống hệt nhau, mỗi cái nhận nửa importance, cả hai *trông* không quan trọng dù cụm của chúng cực quan trọng. Đây chính là multicollinearity ở chương 3 tái xuất trong bối cảnh importance. Cách sửa của López de Prado là **clustered feature importance**: (1) tính ma trận tương quan của features, (2) cluster chúng thành nhóm bằng hierarchical clustering trên khoảng cách $1-|\rho|$ (cùng họ thuật toán với HRP ở chương 11), (3) tính importance ở cấp **cluster** — permute cả cụm cùng lúc thay vì từng feature. Ví dụ số: $200$ feature gộp thành $15$ cluster; permute cả cluster "momentum family" ($30$ feature tương quan) một lần → accuracy rớt $6$ điểm → cụm này quan trọng, dù từng feature riêng lẻ trước đó chỉ cho importance lẻ tẻ $\sim 0.2$ điểm vì bị chia phiếu cho $30$ cách. Kết luận cluster-level ổn định hơn nhiều và không bị đánh lừa bởi redundancy — bạn ra quyết định "giữ họ momentum, bỏ họ calendar" ở cấp có ý nghĩa kinh tế, thay vì đấu đá vô nghĩa giữa các feature gần-trùng.

## 10.7 Buộc dây: labeling, fracdiff, và CV là một hệ thống

Điểm dễ bỏ sót nhất của cả chương này: bốn mảnh — triple-barrier labeling, uniqueness weighting, fractional differentiation, feature importance — **không phải bốn kỹ thuật rời rạc mà là một hệ thống khớp vào nhau qua trục thời gian chồng lấn**. Bỏ một mảnh thì các mảnh còn lại âm thầm rò rỉ.

Sợi dây nối chúng là **holding period của triple-barrier**. Chính cái holding period ấy (ví dụ "$6$ ngày" ở mục 10.2) là đầu vào để tính concurrency và uniqueness ở 10.4. Và chính cái overlap ấy là thứ mà **purged CV** ở chương 9 phải purge: khi chia train/test, ta phải xóa khỏi train mọi mẫu có holding trùm qua khoảng thời gian của test (purge), rồi thêm một khoảng embargo sau test. Nếu không, một mẫu train vào ngày cuối tháng 3 với holding $10$ ngày sẽ chứa return của đầu tháng 4 — và nếu fold test là đầu tháng 4, bạn đã để tương lai rò vào quá khứ. Con số cụ thể hóa quy tắc purge: mẫu train có label dùng đường giá tới ngày $t + h_i$ (với $h_i$ là holding của mẫu $i$); bất kỳ mẫu train nào thỏa $t + h_i \ge$ ngày bắt đầu test đều phải bị purge. Với holding trung bình $10$ ngày, bạn purge khoảng $10$ ngày dữ liệu quanh mỗi ranh giới fold — một cái giá nhỏ về số mẫu để đổi lấy một ước lượng OOS không bị nhiễm.

Đây là lý do "feature importance đúng cách" (10.6) *bắt buộc* chạy trên purged CV: MDA permute trên một CV không purged sẽ đo lẫn cả importance của việc ghi nhớ mẫu overlap, cho ra những feature "quan trọng" mà thực chất chỉ giỏi nhận diện những mẫu đã thấy ở train. Và đây là lý do "meta-labeling precision $65\%$" (10.3) chỉ đáng tin nếu meta-model được validate trên purged CV — nếu không, con số $65\%$ một phần là rò rỉ, và cái Sharpe hoành tráng suy ra từ nó cũng là ảo theo. Vòng khép kín hiện ra rõ: triple-barrier sinh label *và* holding period → holding period cho uniqueness weight *và* xác định phạm vi purge → purged CV cho feature importance *và* meta-model validation đáng tin → feature quan trọng, fractionally differentiated (dừng + memory), đi vào một model được weight đúng theo uniqueness. Bỏ bất kỳ mắt xích nào, và một mắt xích khác sẽ âm thầm cho bạn con số ảo — thường là con số đẹp, vì mọi lỗi rò rỉ đều nghiêng về phía làm backtest trông giỏi hơn đời thực.

Có một trực giác cuối đáng mang theo khỏi chương này, đúng tinh thần "signal-to-noise thấp" ở đầu: trong một môi trường nơi IC $\sim 0.03$ và mọi model mạnh chủ yếu học thêm noise, thứ tạo ra khác biệt bền vững không phải là model tinh vi hơn mà là **kỷ luật xử lý dữ liệu** — nhãn khớp P&L thật, feature dừng mà còn memory, mỗi sự kiện được đếm đúng một lần, và không một giọt tương lai nào rò vào quá khứ. Người mới đi tìm model tốt hơn; người có nghề đi tìm label và feature đúng hơn. Đó là toàn bộ nội dung của chương này, và là lý do nó tồn tại.

# Chương 11: Portfolio construction

Có một khoảng cách mà mọi người mới vào nghề đều đánh giá thấp: khoảng cách giữa việc *biết* cổ phiếu nào sẽ tăng và việc *sở hữu bao nhiêu* cổ phiếu đó. Alpha research (chương 7) cho bạn một vector điểm số — một con số trên mỗi tên, cao là "thích", thấp là "ghét". Portfolio construction là cỗ máy biến vector điểm số ấy thành một vector trọng số $w$ mà cái desk thực sự đem đi giao dịch. Đây là khâu biến research thành tiền, và cũng là chỗ "lý thuyết đẹp gặp kỹ thuật bẩn": mọi công thức thanh lịch ở chương 5 (lý thuyết danh mục) đều va vào sai số ước lượng, chi phí giao dịch, ràng buộc pháp lý và giới hạn thanh khoản. Người ta hay tưởng alpha là phần khó và construction chỉ là "bấm nút optimizer". Sự thật ngược lại: hai desk cùng một signal nhưng construction khác nhau có thể cho ra Sharpe lệch nhau gấp đôi, và phần lớn số quỹ chết vì construction sai chứ không phải vì hết alpha.

Chương này đi từ bài toán Markowitz gốc và lý do nó *phản bội* người dùng ngây thơ, qua các cách chữa từng input, tới những trường phái vứt bỏ input khó nhất, rồi kết ở bài toán thật mà một PM buy-side giải mỗi sáng: optimize có ràng buộc và có chi phí, với nhiều signal cùng lúc.

## 11.1 MVO và bài toán input: cỗ máy khuếch đại lỗi

Nhắc lại kết quả nền tảng từ chương 5: danh mục mean-variance tối ưu (không ràng buộc) là

$$w^* \propto \Sigma^{-1}\mu,$$

trong đó $\mu$ là vector kỳ vọng return và $\Sigma$ là ma trận covariance. Công thức này đúng về mặt toán và đẹp về mặt trực giác — nghịch đảo covariance để "gỡ rối" các tương quan, rồi nghiêng về phía những tài sản có $\mu$ cao. Vấn đề không nằm ở công thức mà ở chỗ ta phải *cắm số ước lượng* vào $\mu$ và $\Sigma$, và $\Sigma^{-1}$ là một bộ khuếch đại lỗi. Michaud gọi MVO là "estimation-error maximizer" — không phải nói ngoa.

Hãy thấy nó bằng số, với ví dụ nhỏ nhất có thể mà vẫn bộc lộ toàn bộ căn bệnh — hai tài sản gần giống nhau. Cho $\sigma$ của cả hai đều là 15%, tương quan $\rho = 0.96$ (cao vì đây là hai tên trong cùng một ngành, gần như thay thế được cho nhau), và ước lượng $\mu = (5.0\%, 5.5\%)$. Ma trận covariance (đơn vị: bình phương của tỷ lệ, tức $\sigma^2 = 0.15^2 = 0.0225$, và phần tử ngoài đường chéo là $\rho\sigma^2 = 0.96 \times 0.0225 = 0.0216$):

$$\Sigma = \begin{pmatrix} 0.0225 & 0.0216 \\ 0.0216 & 0.0225 \end{pmatrix},\qquad \Sigma^{-1} = \frac{1}{\det\Sigma}\begin{pmatrix} 0.0225 & -0.0216 \\ -0.0216 & 0.0225 \end{pmatrix}.$$

Định thức $\det\Sigma = 0.0225^2 - 0.0216^2 = 0.00050625 - 0.00046656 = 0.00003969$ — nhỏ xíu, chính là dấu hiệu ma trận gần suy biến vì hai cột gần trùng nhau. Nhân $\Sigma^{-1}\mu$ ra vector thô rồi chuẩn hoá cho tổng bằng 1. Thành phần thứ nhất của $\Sigma^{-1}\mu$ là $(0.0225 \times 0.05 - 0.0216 \times 0.055)/\det = (0.001125 - 0.001188)/0.00003969 = -0.000063/0.00003969 \approx -1.587$; thành phần thứ hai là $(0.0225 \times 0.055 - 0.0216 \times 0.05)/\det = (0.0012375 - 0.00108)/0.00003969 \approx +3.968$. Tổng hai thành phần là $2.381$; chia để chuẩn hoá, ta được đúng $w \approx (-0.667,\ +1.667)$: **short 67% tài sản 1, long 167% tài sản 2**, chỉ vì một chênh lệch kỳ vọng 0.5% — nhỏ hơn nhiều so với sai số ước lượng của chính $\mu$ (chương 3: với 15% vol, đo $\mu$ chính xác tới 0.5% cần hàng trăm năm dữ liệu). Bây giờ đảo ước lượng thành $(5.5\%, 5.0\%)$, tức chỉ hoán vị hai con số gần bằng nhau, vị thế **lật ngược hoàn toàn** thành $\approx (+1.667, -0.667)$. Một hoán vị vô nghĩa về mặt thống kê làm optimizer nhảy từ "short mạnh tên 1" sang "long mạnh tên 1".

Cơ chế đáng để nhìn kỹ, vì nó là cùng một con quỷ xuất hiện ở mọi optimizer về sau. Hai tài sản correlation 0.96 tạo ra hai "trục" tự nhiên trong không gian danh mục. Trục *chung* (mua cả hai, $w \propto (1,1)$) có variance rất cao — nó gánh gần trọn $0.0225 + 0.0216 = 0.0441$; và trục *spread* (mua cái này bán cái kia, $w \propto (1,-1)$) có variance rất *thấp*, chỉ $0.0225 - 0.0216 = 0.0009$, tức bằng đúng **một phần bốn mươi chín** của trục chung ($0.0441/0.0009 = 49$). Optimizer nhìn thấy: dọc trục spread, mỗi đơn vị chênh lệch $\mu$ đổi ra một lượng Sharpe khổng lồ, vì mẫu số variance bé tí. Nó dồn hết vốn vào đó. Nhưng trục spread cũng chính là hướng mà noise của $\mu$ *lớn nhất so với signal* — 0.5% chênh lệch mà ta cắm vào gần như hoàn toàn là nhiễu. Nói cách khác, $\Sigma^{-1}$ khuếch đại đúng cái chiều mà ta biết ít nhất. Định thức bé (eigenvalue bé của $\Sigma$, ở đây eigenvalue nhỏ chính bằng spread-variance $0.0009$) là biển báo "ở đây có một trục low-variance, đừng tin $\mu$ dọc nó".

Ba nhóm thuốc trong toàn chương này đều là những cách bịt đúng cái trục nguy hiểm đó: (i) làm sạch $\Sigma$ để nó đừng có eigenvalue bé giả tạo do nhiễu; (ii) đừng ước lượng $\mu$ từ lịch sử mà lấy từ nguồn đáng tin hơn, hoặc thu nhỏ độ tự tin vào $\mu$; (iii) ràng buộc vị thế để optimizer không được phép dồn 167% vào một trục. Ta đi lần lượt.

## 11.2 Chữa $\Sigma$: từ sample covariance tới eigenvalue đã lọc

Sample covariance — cứ lấy ma trận hiệp phương sai mẫu từ chuỗi return lịch sử — là lựa chọn mặc định và cũng là cái bẫy mặc định. Khi số tài sản $N$ lớn so với số quan sát $T$, nó suy biến hoặc gần suy biến. Con số cần nhớ: ước lượng $\Sigma$ có $N(N+1)/2$ tham số. Với $N = 500$ cổ phiếu, đó là $500 \times 501/2 = 125{,}250$ con số phải ước từ dữ liệu; nếu bạn có $T = 252$ ngày (một năm), tỷ lệ $T/N \approx 0.5$ — ma trận mẫu thậm chí *không khả nghịch* (rank tối đa là $T < N$), và $\Sigma^{-1}$ trong công thức Markowitz đơn giản không tồn tại. Ngay cả khi $T > N$, khi tỷ lệ $q = N/T$ không nhỏ, phổ eigenvalue của ma trận mẫu bị *bôi* rộng ra một cách có hệ thống: eigenvalue lớn bị ước lượng lớn hơn thực, eigenvalue nhỏ bị ước lượng nhỏ hơn thực (kéo về 0) — và đúng những eigenvalue nhỏ đó là thứ $\Sigma^{-1}$ khuếch đại. Có bốn cách chữa được dùng trong thực chiến, không loại trừ nhau.

**Factor model** (Barra kiểu, chương 6). Thay vì ước từng cặp covariance, giả định return được sinh bởi một số ít factor chung: $r = B f + \varepsilon$, với $B$ là ma trận loading ($N \times K$, $K \ll N$), $f$ là return factor, $\varepsilon$ là phần dư đặc thù từng tên. Khi đó $\Sigma = B \Sigma_f B^\top + D$, với $\Sigma_f$ là covariance của $K$ factor (ma trận $K\times K$ nhỏ) và $D$ là ma trận đường chéo của variance đặc thù. Số tham số sụp từ $O(N^2)$ xuống $O(NK)$: với $N=500, K=15$ ta chỉ ước khoảng $500 \times 15 = 7{,}500$ loading, cộng $15 \times 16/2 = 120$ số trong $\Sigma_f$ và 500 số variance đặc thù — tổng cỡ 8.100 tham số, thay vì 125.250. Giảm hơn 15 lần, và mỗi tham số còn lại được ước từ nhiều dữ liệu hơn nên ổn định hơn. Đây là lý do mọi risk model thương mại (Barra, Axioma) đều là factor model — nó vừa giảm chiều vừa gắn cấu trúc kinh tế có thể diễn giải (exposure ngành, style, quốc gia).

**Ledoit-Wolf shrinkage.** Ý tưởng: kéo sample covariance $S$ về một target $F$ có cấu trúc (thường là ma trận với mọi tương quan bằng một hằng số trung bình, hoặc đơn giản là đường chéo), theo một tổ hợp lồi $\hat\Sigma = \delta F + (1-\delta) S$ với cường độ $\delta \in [0,1]$ tối ưu có **công thức đóng**. Ledoit và Wolf (2004) đặt tên bài báo là "Honey, I shrunk the sample covariance matrix" — và $\delta^*$ được chọn để tối thiểu hoá kỳ vọng khoảng cách Frobenius $\mathbb{E}\|\hat\Sigma - \Sigma\|^2$ tới ma trận thật, một bài toán có nghiệm phân tích, không cần dò tay. Bằng số cho trực giác: nếu bạn có $N = 100$ tài sản và $T = 120$ ngày, một giá trị $\delta^*$ điển hình rơi vào khoảng 0.3–0.5 — tức optimizer được lệnh "chỉ tin sample covariance khoảng một nửa, nửa còn lại tin cấu trúc trơn". Cụ thể với $\delta^* = 0.4$: nếu sample correlation giữa hai tên nào đó là $0.75$ còn tương quan trung bình toàn thị trường (target) là $0.20$, thì entry đã shrink là $0.4 \times 0.20 + 0.6 \times 0.75 = 0.08 + 0.45 = 0.53$ — kéo cái correlation cực đoan 0.75 (nhiều khả năng phồng lên do nhiễu mẫu) về gần hằng số chung hơn. Hiệu ứng lên phổ eigenvalue: shrinkage kéo eigenvalue lớn nhất *xuống* và eigenvalue nhỏ nhất *lên*, đúng chiều ngược với cái méo của ma trận mẫu — nó nâng đáy phổ khỏi 0 nên $\Sigma^{-1}$ hết bùng nổ. Đây là công cụ mặc định ở phần lớn shop vì nó không cần chọn factor, chỉ cần một dòng công thức.

**EWMA** (exponentially weighted moving average). Sample covariance thường cho mọi ngày trọng số bằng nhau, nghĩa là dữ liệu năm ngoái nặng ngang tuần trước — vô lý khi vol thay đổi theo regime. EWMA đặt trọng số giảm dần theo hệ số $\lambda$: covariance hôm nay $= \lambda \times$ (covariance hôm qua) $+ (1-\lambda)\times$ (tích chéo return hôm nay). Với $\lambda = 0.94$ (chuẩn RiskMetrics cho dữ liệu ngày), half-life $= \ln 2 / \ln(1/\lambda) = 0.693/0.0619 \approx 11.2$ ngày — ma trận "quên" quá khứ trong khoảng hai tuần, nên phản ứng nhanh khi vol nhảy. Đánh đổi: phản ứng nhanh cũng là nhiễu nhiều; $\lambda$ thấp bám sát regime nhưng run rẩy, $\lambda$ cao mượt nhưng chậm. Module `covariance` (EWMA) trong repo làm đúng việc này.

**Random matrix theory (RMT).** Câu hỏi sắc bén: trong các eigenvalue của ma trận correlation mẫu, cái nào là *tín hiệu* và cái nào chỉ là *nhiễu do lấy mẫu hữu hạn*? Marchenko-Pastur cho câu trả lời định lượng. Nếu $N$ chuỗi return thực sự *độc lập* (không có cấu trúc chung nào), thì với tỷ lệ $q = N/T$, các eigenvalue của ma trận correlation mẫu vẫn không nằm gọn ở 1 mà trải ra trên khoảng $[\lambda_-, \lambda_+]$ với

$$\lambda_\pm = (1 \pm \sqrt{q})^2.$$

Bằng số: $N = 500$, $T = 1000$ (bốn năm dữ liệu ngày), $q = 0.5$, $\sqrt{q} \approx 0.707$, nên $\lambda_+ = (1.707)^2 \approx 2.92$ và $\lambda_- = (0.293)^2 \approx 0.086$. Diễn giải: *bất kỳ* eigenvalue nào của ma trận mẫu nằm trong khoảng $[0.086,\ 2.92]$ đều tương thích với giả thuyết "chỉ là nhiễu" — chúng không mang thông tin cấu trúc thật, dù trông có vẻ khác 1. Chỉ vài eigenvalue lớn vượt $\lambda_+ = 2.92$ (thường là market factor và dăm ngành lớn) mới là tín hiệu thật. **Eigenvalue clipping**: giữ nguyên các eigenvalue trên $\lambda_+$, còn tất cả eigenvalue trong vùng nhiễu thì *thay bằng giá trị trung bình của chúng* (để bảo toàn trace, tức tổng variance), rồi tái tạo ma trận. Kết quả là một $\Sigma$ đã "khử nhiễu" mà nghịch đảo của nó không còn khuếch đại các trục ma. Module `rmt` (denoise) trong repo làm bước này; các shop kỹ tính dùng nó chồng lên factor model.

Bốn cách trên không đối kháng. Một pipeline production điển hình: factor model cho cấu trúc kinh tế, cộng shrinkage hoặc RMT cho phần specific/residual, cộng EWMA để cập nhật theo regime. Điểm chung của cả bốn: chúng nâng đáy phổ eigenvalue, và đó chính là bịt cái trục low-variance mà ví dụ error-maximizer ở 11.1 đã phơi ra — nhớ rằng ở đó eigenvalue nhỏ nhất là $0.0009$ so với eigenvalue lớn nhất $0.0441$, một tỷ số 49:1 mà mọi liệu pháp trên đều nhắm kéo hẹp lại.

## 11.3 Chữa $\mu$: đừng ước lượng nó, hãy suy ra nó

$\mu$ là input tệ hơn $\Sigma$ nhiều bậc. Lý do thống kê (chương 3): sai số chuẩn của return trung bình là $\sigma/\sqrt{T}$, không phụ thuộc tần suất lấy mẫu — lấy dữ liệu phút không giúp gì cho việc đo $\mu$ hằng năm. Với $\sigma = 15\%$, muốn sai số chuẩn của $\hat\mu$ xuống 1% bạn cần $T = (15/1)^2 = 225$ năm. Không ai có 225 năm. Nên **quy tắc số một là đừng ước lượng $\mu$ từ chuỗi giá lịch sử.** Có ba lối thoát công nghiệp.

**Grinold: alpha = volatility × score × skill.** Đây là cầu nối đẹp nhất giữa alpha research và portfolio construction. Thay vì hỏi "return kỳ vọng của cổ phiếu này là bao nhiêu", ta xây $\mu$ trực tiếp từ signal đã chuẩn hoá:

$$\alpha_i = IC \cdot \sigma_i \cdot z_i,$$

trong đó $z_i$ là điểm số của signal đã chuẩn hoá thành z-score (trung bình 0, độ lệch 1 trên cross-section), $\sigma_i$ là vol của tài sản $i$, và $IC$ là information coefficient — tương quan lịch sử giữa signal và return tương lai, tức "kỹ năng" của signal. Công thức nói: alpha kỳ vọng của một tên bằng độ mạnh của quan điểm ($z_i$), nhân với biên độ mà tên đó có thể dịch chuyển ($\sigma_i$), nhân với mức độ đáng tin của signal nói chung ($IC$). Bằng số với running example momentum: $IC \approx 0.025$, một cổ phiếu có $\sigma_i = 30\%$/năm và điểm momentum $z_i = 2$ (mạnh, cách trung bình 2 độ lệch) → $\alpha_i = 0.025 \times 0.30 \times 2 = 0.015 = 1.5\%$ alpha kỳ vọng/năm. Con số này *khiêm tốn một cách lành mạnh*: nó nhắc rằng ngay cả quan điểm mạnh nhất về tên biến động nhất, qua một signal $IC=0.025$, cũng chỉ đáng 1.5% — không phải 15%. Đổi sang một tên trầm hơn, $\sigma_i = 15\%$ và $z_i = 1$: $\alpha_i = 0.025 \times 0.15 \times 1 = 0.375\%$ — quan điểm vừa phải về tên ít biến động thì gần như không đáng đặt cược. Chính sự khiêm tốn ấy là thứ ngăn optimizer làm điều điên rồ. Đây cũng là nơi Fundamental Law of Active Management (chương 7) nối vào construction: $IR \approx IC\sqrt{BR}$, và construction là chỗ $IC$ và breadth $BR$ được "thu hoạch" thành trọng số.

**Black-Litterman: neo vào equilibrium, blend Bayesian với view.** Vấn đề của việc cắm thẳng $\mu$ (dù từ Grinold hay từ đâu) là khi bạn chỉ có view về vài tên còn phần lớn danh mục thì không, optimizer sẽ bịa vị thế điên rồ cho những tên bạn im lặng. Black-Litterman giải bằng cách bắt đầu từ một *điểm neo*: nếu không có view gì, danh mục nên bằng danh mục thị trường. Bước một là **reverse optimization** — đảo ngược công thức Markowitz để hỏi "thị trường đang ngầm tin $\mu$ nào?". Nếu trọng số thị trường $w_{\text{mkt}}$ là tối ưu, thì

$$\pi = \lambda \Sigma w_{\text{mkt}},$$

với $\lambda$ là hệ số ngại rủi ro tổng thị trường. $\pi$ là *equilibrium returns* — return ngầm định. Bằng số cho trực giác: với $\lambda = 2.5$ (giá trị hay dùng) và một cổ phiếu beta $\approx 1$ mà đóng góp variance biên vào danh mục thị trường xấp xỉ $\sigma_{\text{mkt}}^2 = 0.15^2 = 0.0225$, ta có $\pi \approx 2.5 \times 0.0225 = 0.056 = 5.6\%$/năm — đúng cỡ equity risk premium lịch sử, một sanity check dễ chịu. Bước hai là gắn **views**: mỗi view viết dạng tuyến tính $P\mu = q + \varepsilon$, với $\varepsilon \sim \mathcal{N}(0, \Omega)$ ($P$ chọn danh mục nào để có view, $q$ là mức view, $\Omega$ mã hoá độ *không chắc* của view). Posterior là trung bình có trọng số precision giữa "thị trường nghĩ gì" và "tôi nghĩ gì":

$$\mu_{BL} = \left[(\tau\Sigma)^{-1} + P^\top\Omega^{-1}P\right]^{-1}\left[(\tau\Sigma)^{-1}\pi + P^\top\Omega^{-1}q\right].$$

Đọc công thức như một cái cân giữa hai nguồn: precision của điểm neo là $(\tau\Sigma)^{-1}$, precision của view là $P^\top\Omega^{-1}P$; posterior là trung bình của hai mức tin, mỗi bên nặng theo precision của nó. Để thấy cái cân đó nghiêng bằng số, xét trường hợp một chiều đơn giản nhất — một tài sản, một view trực tiếp lên chính nó ($P = 1$). Giả sử equilibrium $\pi = 5.6\%$, view của bạn $q = 10\%$ ("tên này sẽ chạy mạnh hơn thị trường ngầm định"), $\tau\Sigma = (5\%)^2 = 0.0025$ (độ bất định của điểm neo) và $\Omega = (3\%)^2 = 0.0009$ (view khá chắc, sai số chỉ 3%). Precision neo $= 1/0.0025 = 400$, precision view $= 1/0.0009 = 1111$. Posterior:

$$\mu_{BL} = \frac{400 \times 5.6\% + 1111 \times 10\%}{400 + 1111} = \frac{22.4 + 111.1}{1511} \approx 8.8\%.$$

View chắc hơn (precision cao hơn) nên posterior $8.8\%$ ngả về phía view $10\%$ nhiều hơn về phía neo $5.6\%$ — nhưng không nhảy hẳn tới $10\%$, mà bị neo kéo lại. Nếu bạn nới $\Omega$ lên $(8\%)^2 = 0.0064$ (view mơ hồ hơn, precision chỉ $156$), posterior tụt về $\frac{400 \times 5.6 + 156 \times 10}{556} \approx 6.8\%$ — gần equilibrium hơn hẳn. Đó chính là hành vi ta muốn: $\Omega$ nhỏ (view chắc) kéo mạnh về $q$; $\Omega$ lớn (view mơ hồ) để gần $\pi$; và $\tau$ (thường 0.025–0.05) đặt độ tự tin vào chính điểm neo. Điểm hay bị bỏ qua: sức mạnh thật của BL không phải mấy dòng đại số Bayes mà là **cái điểm neo equilibrium** — khi không có view, ra đúng danh mục thị trường (một hành vi mặc định lành mạnh), thay vì ra vị thế điên rồ như MVO với $\mu$ lịch sử. Nó biến optimizer từ kẻ khuếch đại lỗi thành kẻ *chỉnh sửa gia giảm* quanh một baseline hợp lý. Đây là khung chuẩn khi bạn phải trộn view chủ quan hoặc view mô hình vào một danh mục dài hạn.

**Hoặc né hẳn $\mu$** — chuyển sang các trường phái risk-based ở 11.4, nơi ta chấp nhận rằng $\mu$ không đo được và xây danh mục chỉ từ $\Sigma$ (đáng tin hơn) hoặc thậm chí ít hơn thế.

## 11.4 Các trường phái không cần $\mu$

Nếu $\mu$ là input tồi tệ nhất, một phản ứng triệt để là *vứt nó đi*. Ngạc nhiên thay, các danh mục không dùng $\mu$ thường thắng MVO out-of-sample — không phải vì chúng thông minh hơn, mà vì chúng không có gì để mà sai ở cái input dễ sai nhất.

**Equal weight (1/N).** DeMiguel, Garlappi và Uppal (2009) so 1/N với hàng loạt mô hình tối ưu "tinh vi" trên nhiều dataset, và kết quả gây sốc: **1/N đánh bại MVO out-of-sample gần như khắp nơi** về Sharpe. Không phải vì 1/N là chân lý phân bổ, mà vì lợi ích của việc optimize (đánh trúng cấu trúc thật) nhỏ hơn thiệt hại của việc ước lượng sai $\mu$ và $\Sigma$. Họ ước lượng: để MVO thực sự thắng 1/N một cách ổn định trên $N=25$ tài sản, bạn cần khoảng 3.000 tháng dữ liệu — tức $3000/12 = 250$ năm. Bài học không phải "bỏ nghề optimize" mà là *sự khiêm tốn thống kê*: mọi lớp tinh vi bạn thêm vào phải trả cho được cái giá ước lượng của nó, nếu không nó chỉ thêm nhiễu.

**Minimum variance / maximum diversification.** Cần đúng một input là $\Sigma$ (đáng tin hơn $\mu$ nhiều), tìm $w$ tối thiểu $w^\top\Sigma w$ với ràng buộc $\sum w_i = 1$. Nghiệm dạng đóng: $w = \Sigma^{-1}\mathbf{1}/(\mathbf{1}^\top\Sigma^{-1}\mathbf{1})$. Bằng số cho thấy nó khác 1/N ra sao: quay lại hai tài sản ở 11.1 nhưng giờ với $\sigma_1 = 15\%, \sigma_2 = 20\%$ và $\rho = 0.5$. Nghiệm min-var hai tài sản là $w_1 = (\sigma_2^2 - \rho\sigma_1\sigma_2)/(\sigma_1^2 + \sigma_2^2 - 2\rho\sigma_1\sigma_2)$. Thay số: tử $= 0.04 - 0.5 \times 0.15 \times 0.20 = 0.04 - 0.015 = 0.025$; mẫu $= 0.0225 + 0.04 - 2 \times 0.015 = 0.0625 - 0.03 = 0.0325$; nên $w_1 = 0.025/0.0325 \approx 0.77$, $w_2 \approx 0.23$. Min-var tự động dồn vào tên vol thấp (77% cho tên 15% vol) — không phải chia đều 50/50 như 1/N. Thực nghiệm min-var tốt bất ngờ, phần lớn vì cái xu hướng dồn-vào-vol-thấp ấy vô tình ăn ké **low-volatility anomaly** — nhóm cổ phiếu vol thấp lịch sử cho return risk-adjusted cao hơn CAPM dự đoán, nên danh mục dồn vào chúng được thưởng. Max diversification thì tối đa hoá tỷ số (trung bình có trọng số các vol tên) / (vol danh mục) — thưởng cho việc gom các tài sản ít tương quan.

**Risk parity.** Nguyên tắc: mỗi tài sản (hay mỗi asset class) đóng góp *rủi ro* bằng nhau vào danh mục, thay vì đóng góp *vốn* bằng nhau. Đây là triết lý sau Bridgewater All Weather. Làm bằng số với hai asset class, giả định tương quan $\rho \approx 0$: equity $\sigma = 16\%$, bond $\sigma = 6\%$. Trong trường hợp không tương quan, đóng góp rủi ro bằng nhau tương đương trọng số tỷ lệ nghịch với vol, $w_i \propto 1/\sigma_i$: bond được $\tfrac{1/6}{1/6+1/16} = \tfrac{0.1667}{0.1667+0.0625} = \tfrac{0.1667}{0.2292} \approx 73\%$, equity $\approx 27\%$. Vol danh mục lúc này $\approx \sqrt{(0.73\times0.06)^2 + (0.27\times0.16)^2} = \sqrt{0.0438^2 + 0.0432^2} = \sqrt{0.001918 + 0.001866} = \sqrt{0.003784} \approx 6.2\%$. Nếu target vol là 10%, bạn **leverage toàn danh mục lên $10/6.2 \approx 1.6\times$**. Câu "leverage trái phiếu lên cho cân với cổ phiếu" là toàn bộ bí quyết của risk parity — và cũng là toàn bộ điểm yếu của nó. Năm 2022, lãi suất tăng sốc làm bond sập *cùng lúc* với equity: correlation bond-equity vốn âm/gần 0 bao thập kỷ bỗng đổi dấu dương, đúng lúc leverage 1.6x khuếch đại cú sập kép. Mọi mô hình đứng trên correlation lịch sử đều có ngày phải trả giá này, và risk parity — vì nó *dựa vào* correlation thấp giữa các sleeve để biện minh cho leverage — là loại chịu đòn nặng nhất khi correlation phản bội.

Trường hợp tổng quát $n$ tài sản *có* tương quan không cho nghiệm đóng đẹp như $1/\sigma$. Điều kiện risk parity thật sự là đóng góp rủi ro biên $w_i (\Sigma w)_i$ bằng nhau với mọi $i$. Lý do "bằng nhau" tương đương "mỗi tên gánh $1/n$ variance" đáng viết ra một dòng: theo định lý Euler cho hàm bậc một, vol danh mục $\sqrt{w^\top\Sigma w}$ phân rã đúng thành tổng các đóng góp $w_i(\Sigma w)_i / \sqrt{w^\top\Sigma w}$, mà tổng các tử số $\sum_i w_i(\Sigma w)_i = w^\top\Sigma w$ chính là toàn bộ variance danh mục; nên bắt các tử số bằng nhau tức bắt mỗi tên gánh đúng $1/n$ của tổng. Đây là hệ phương trình phi tuyến, giải bằng fixed-point hoặc Newton iteration — đúng bài code phỏng vấn portfolio hay gặp. Module `portfolio` (riskParity) trong repo cài đúng vòng lặp này.

**HRP — Hierarchical Risk Parity (López de Prado).** HRP tránh nghịch đảo ma trận hoàn toàn — và vì $\Sigma^{-1}$ chính là nguồn khuếch đại lỗi, tránh được nó là tránh được con quỷ gốc. Ba bước:

*Bước 1 — hierarchical clustering.* Biến ma trận correlation thành ma trận khoảng cách $d_{ij} = \sqrt{(1-\rho_{ij})/2}$ (hai tài sản tương quan $+1$ thì $d = \sqrt{0} = 0$; tương quan $0$ thì $d = \sqrt{0.5} \approx 0.707$; tương quan $-1$ thì $d = \sqrt{1} = 1$), rồi chạy agglomerative clustering để dựng một cây phả hệ: tài sản giống nhau gộp thành cụm trước, cụm giống nhau gộp thành cụm lớn hơn.

*Bước 2 — quasi-diagonalization.* Sắp lại thứ tự các tài sản theo cây, sao cho anh em họ hàng đứng cạnh nhau trong ma trận covariance. Sau bước này ma trận covariance (đã hoán vị) có các khối lớn nằm dọc đường chéo — "gần chéo khối".

*Bước 3 — recursive bisection.* Đi từ gốc cây xuống: tại mỗi nút, chia danh mục thành hai nửa (hai nhánh con), rồi phân bổ vốn giữa hai nửa *tỷ lệ nghịch với variance của mỗi nửa* (nửa nào rủi ro hơn nhận ít vốn hơn), variance mỗi nửa tính bằng inverse-variance weighting nội bộ. Đệ quy xuống tới từng lá. Bằng số cho một bước bisection: nếu nhánh trái có variance tổng hợp $0.0004$ và nhánh phải $0.0016$, phân bổ tỷ lệ nghịch cho nhánh trái $\tfrac{1/0.0004}{1/0.0004 + 1/0.0016} = \tfrac{2500}{2500+625} = \tfrac{2500}{3125} = 0.8$, nhánh phải $0.2$ — nhánh rủi ro gấp bốn nhận đúng một phần tư vốn của nhánh kia.

Vì không có bước nào nghịch đảo ma trận, HRP **miễn nhiễm với ma trận gần suy biến**; out-of-sample nó thường thắng MVO trên danh mục nhiều tài sản nhiễu, đặc biệt khi $N$ lớn. Giá phải trả: bỏ thông tin $\mu$ hoàn toàn (nó thuần risk-based) và phụ thuộc vào lựa chọn thuật toán clustering (linkage method, distance metric) — một trade-off "bỏ tối ưu lấy bền" điển hình. Module `cluster` và `nco` trong repo dùng chính bộ máy clustering này.

**Vol targeting.** Không phải cách phân bổ *ngang* giữa các tên, mà là cách scale *dọc* theo thời gian: giữ vol danh mục xấp xỉ hằng số bằng cách nhân toàn bộ vị thế với $1/\hat\sigma_t$, trong đó $\hat\sigma_t$ là vol dự báo (GARCH hoặc realized vol, chương 3). Bằng số: nếu chiến lược có vol thực hiện dài hạn 12% và bạn target 10%, ở chế độ bình thường bạn chạy gross exposure ở mức $10/12 \approx 0.83$. Trong một tuần bão mà $\hat\sigma_t$ nhảy lên 24%, bạn tự động cắt gross exposure còn $10/24 \approx 0.42$ — một nửa mức bình thường; khi thị trường yên lại về vol 8%, bạn nâng lên $10/8 = 1.25$. Vol targeting cải thiện Sharpe thực nghiệm trên hầu hết chiến lược vì một sự thật bất đối xứng: **vol thì dự báo được (nó dai dẳng, chương 3) còn return thì không** — nên scale theo vol là đặt cược vào cái duy nhất ta biết. Phần thưởng ẩn: nó tự động deleverage đúng lúc bão, cắt bớt phần đuôi trái của phân phối P&L (chương 14).

## 11.5 Robust và resampled optimization: Michaud

Có một lối chữa MVO khác không đi qua $\mu$ hay $\Sigma$ riêng lẻ mà tấn công thẳng vào *sự mong manh của lời giải*. Vấn đề của MVO là nó xử lý các ước lượng như thể chúng chính xác tuyệt đối; đường efficient frontier vẽ ra sắc lẻm, nhưng nếu bạn lay nhẹ $\mu$ đi một chút thì cả frontier nhảy chỗ. Michaud (1998) đề xuất **resampled efficiency**: thay vì tin một bộ ước lượng, hãy lấy trung bình các danh mục tối ưu trên nhiều bộ ước lượng mô phỏng.

Recipe từng bước, làm lại được: (1) Từ $\hat\mu, \hat\Sigma$ ước lượng được, sinh ngẫu nhiên $B$ (ví dụ $B = 500$) bộ chuỗi return giả lập bằng cách bootstrap hoặc Monte Carlo từ phân phối $\mathcal{N}(\hat\mu, \hat\Sigma)$ với cùng độ dài mẫu $T$ như dữ liệu thật. (2) Trên mỗi bộ giả lập $b$, ước lại $\hat\mu^{(b)}, \hat\Sigma^{(b)}$ và giải MVO ra một frontier, lấy các danh mục tối ưu $w^{(b)}$ tại mỗi mức rủi ro. (3) **Trung bình các trọng số** qua $B$ lần: $\bar w = \frac{1}{B}\sum_b w^{(b)}$. Danh mục resampled là cái trung bình đó.

Tại sao nó bền hơn, bằng số. Quay lại ví dụ error-maximizer 11.1: hai tài sản $\rho=0.96$, $\mu=(5.0\%,5.5\%)$, nghiệm MVO thô $(-0.667, +1.667)$. Một bộ mẫu giả lập có thể tình cờ cho $\hat\mu^{(b)} = (5.3\%, 5.1\%)$ → MVO ra $w^{(b)} \approx (+1.67, -0.67)$ (nghiêng tài sản 1); bộ khác cho $(4.9\%, 5.4\%)$ → $w^{(b)} \approx (-0.67, +1.67)$ (nghiêng tài sản 2). Vì chênh lệch $\mu$ 0.5% *chìm trong nhiễu*, dấu của chênh lệch trong mỗi mẫu giả lập lật qua lật lại gần như tung đồng xu, nên các danh mục cực đoan này rơi về hai phía gần như ngẫu nhiên; trung bình 500 lần, các cú $\pm1.67$ và $\mp0.67$ triệt tiêu lẫn nhau và $\bar w$ hội tụ về gần $(0.5, 0.5)$ — một danh mục *ôn hoà* thay vì cực đoan. Resampling biến sự bất định thành sự đa dạng hoá: nếu optimizer không biết chắc nên nghiêng bên nào, nó chia đôi. Đây là cùng tinh thần Bayesian model averaging, chỉ đóng gói cho MVO.

Đánh đổi cần biết rõ. Resampled portfolio *mượt hơn* và turnover thấp hơn (thêm một tí dữ liệu không lật ngược vị thế như MVO thô), nên rẻ hơn khi trade. Nhưng nó thiếu nền tảng lý thuyết chặt (các danh mục thành phần từ những mẫu vi phạm ràng buộc lồi khi trung bình lại có thể lệch khỏi frontier thật), và nó *thừa hưởng bias* của $\hat\mu, \hat\Sigma$ gốc — nếu ước lượng gốc lệch có hệ thống, mọi mẫu giả lập cũng lệch cùng chiều, resampling không cứu được. Nó chữa *variance* của lời giải, không chữa *bias*. Trong thực chiến nhiều desk thấy Ledoit-Wolf shrinkage đạt phần lớn lợi ích của Michaud với chi phí tính toán bằng một phần trăm, nên Michaud phổ biến hơn ở giới asset management dài hạn hơn là ở pod shop tần suất cao.

## 11.6 Tối ưu theo đuôi: CVaR và mean-CVaR

Variance phạt độ lệch lên *và* xuống như nhau, và giả định ngầm phân phối đối xứng dạng Gaussian. Nhưng return tài sản có *fat tail* và *skew*: cú sập $-8\%$ trong ngày xảy ra thường xuyên hơn nhiều so với Gaussian dự đoán, và chính những cú đó giết quỹ. Nếu điều bạn thực sự sợ là cái đuôi trái, hãy tối ưu thẳng vào nó thay vì tối ưu variance rồi hy vọng. Đó là mean-CVaR optimization.

Hai định nghĩa cần tách bạch. **VaR** ($\text{VaR}_\alpha$) ở mức $\alpha$ (ví dụ 95%) là ngưỡng lỗ mà chỉ $(1-\alpha)=5\%$ trường hợp tệ hơn — "trong 95% ngày, lỗ không vượt quá X". **CVaR** (Conditional VaR, còn gọi Expected Shortfall) là *kỳ vọng lỗ với điều kiện đã rơi vào 5% đuôi đó* — "khi ngày tệ xảy ra, trung bình mất bao nhiêu". CVaR luôn tệ hơn hoặc bằng VaR và là thước đo tốt hơn vì nó nhìn *sâu trong đuôi* chứ không chỉ ở mép, và về mặt toán nó là **coherent risk measure** (đặc biệt: cộng tính dưới — đa dạng hoá không bao giờ làm CVaR tệ hơn, một tính chất mà VaR không đảm bảo).

Bằng số minh hoạ. Giả sử một danh mục có 100 kịch bản P&L (một năm ngày giao dịch xấp xỉ), 5 kịch bản tệ nhất là $-4.0\%, -4.5\%, -5.0\%, -6.0\%, -8.0\%$. Ở mức 95%, $\text{VaR}_{95}$ là lỗ tại ranh giới của 5% đuôi — tức kịch bản tệ thứ 5 tính từ đáy lên, $-4.0\%$ (ngưỡng của 5% đuôi). $\text{CVaR}_{95}$ là trung bình của cả 5 kịch bản đuôi: $(4.0+4.5+5.0+6.0+8.0)/5 = 27.5/5 = 5.5\%$. Chú ý cái bẫy của VaR: hai danh mục có thể cùng VaR $-4.0\%$ nhưng CVaR khác hẳn — một cái đuôi dừng ở $-4.5\%$ (CVaR quanh $-4.3\%$), cái kia kéo tới $-8\%$ (CVaR $-5.5\%$); VaR mù trước sự khác biệt đó, CVaR thì không. Danh mục thứ hai nguy hiểm hơn hẳn mà nếu chỉ nhìn VaR bạn sẽ tưởng chúng ngang nhau.

Điều làm CVaR *thực tế được* trong optimize là kết quả then chốt của Rockafellar-Uryasev (2000): tối thiểu CVaR có thể viết thành một bài **linear program** khi dùng kịch bản. Với $S$ kịch bản return, đưa vào biến phụ $\eta$ (đại diện VaR) và các biến chùng $u_s \ge 0$, mean-CVaR optimization là

$$\min_{w,\eta,u}\ \eta + \frac{1}{(1-\alpha)S}\sum_{s=1}^{S} u_s \quad\text{s.t.}\quad u_s \ge -r_s^\top w - \eta,\ \ u_s \ge 0,\ \ \mu^\top w \ge R_{\text{target}},$$

cộng ràng buộc danh mục thường lệ. Cơ chế của $u_s$ đáng đọc: mỗi $u_s = \max(0,\ -r_s^\top w - \eta)$ chỉ "bật" (dương) cho những kịch bản mà lỗ vượt ngưỡng $\eta$, và khi đó nó đo đúng phần lỗ vượt quá VaR; trung bình các phần vượt ấy cộng $\eta$ chính bằng CVaR. Đây là LP tuyến tính hoàn toàn — giải bằng bất kỳ solver LP nào, không cần variance hay $\Sigma$, chỉ cần *các kịch bản return thô* (lịch sử, bootstrap, hoặc mô phỏng). Ý nghĩa: bạn tối ưu thẳng vào "trung bình 5% ngày tệ nhất", đúng thứ risk manager quan tâm. Mean-CVaR đặc biệt hợp với tài sản có đuôi nặng và bất đối xứng — credit, options (bán vol), strategy carry — nơi variance *đánh lừa* vì nó không thấy được cú nổ hiếm. Đánh đổi: CVaR đuôi phụ thuộc mạnh vào chất lượng và số lượng kịch bản; ước $\text{CVaR}_{99}$ cần rất nhiều dữ liệu đuôi, và nếu kịch bản của bạn không chứa loại khủng hoảng chưa từng xảy ra thì optimize vẫn mù trước nó — cùng một giới hạn nhận thức của mọi backtest.

## 11.7 Bài toán thật: optimize có ràng buộc và có chi phí

Tất cả những gì trên là chuẩn bị cho cái mà một PM buy-side thực sự giải mỗi lần rebalance. Dạng chuẩn:

$$\max_w \; \alpha^\top w \;-\; \frac{\lambda}{2} w^\top \Sigma w \;-\; \phi\,\text{TC}(w - w_{\text{old}})$$

với một chồng ràng buộc: dollar-neutral và/hoặc beta-neutral (tổng long = tổng short, beta danh mục ≈ 0), giới hạn vị thế từng tên (±1–2% NAV để không đặt cược cả quỹ vào một tin), giới hạn exposure ngành và factor (đừng vô tình long cả rổ tech), giới hạn turnover, giới hạn ADV participation (đừng là 30% khối lượng ngày của một tên nhỏ), loại hard-to-borrow (cổ phiếu không vay được để short), và trần gross/net leverage. Số hạng TC gồm phần tuyến tính (spread, phí) cộng **impact lồi** dạng $\sim |\Delta w|^{3/2}$ (chương 13 — square-root law). Con số để neo trực giác về impact: mua 5% ADV với vol 2%/ngày và hệ số $c=0.7$ cho impact $\approx c \cdot \sigma \cdot \sqrt{\text{participation}} = 0.7 \times 0.02 \times \sqrt{0.05} = 0.7 \times 0.02 \times 0.2236 \approx 0.00313 = 31\,\text{bps}$ — tức mỗi lần đảo một vị thế cỡ đó bạn mất 31bps chỉ riêng vì đẩy giá, chưa kể spread. Sự có mặt của impact bậc $3/2$ (lồi) biến bài toán thành QP hoặc conic, giải bằng solver thương mại (Mosek, Gurobi) hoặc open-source (OSQP, Clarabel). Module `portfolio` (meanVariance) và `costs` trong repo là bộ khung này ở mức tối giản.

**No-trade region.** Số hạng TC tạo ra một hiện tượng đẹp: khi tín hiệu chỉ đổi một chút, đừng trade — vì chi phí *chắc chắn* lớn hơn lợi ích *kỳ vọng* của cú chỉnh nhỏ. Đặt con số vào để thấy: nếu cú chỉnh vị thế bạn định làm chỉ mang thêm alpha kỳ vọng 5bps nhưng phí round-trip (spread cộng impact) là 15bps, thì trade là tự nguyện đốt 10bps — optimizer đủ tỉnh sẽ *đứng yên*. Nó tự sinh ra một vùng "chết" quanh vị thế hiện tại, trong đó lời giải tối ưu là không làm gì. Đây là trực giác Garleanu-Pedersen (2013): với chi phí impact bậc hai, danh mục tối ưu **không nhảy tới target mà trượt về phía aim**:

$$w_{t+1} = w_t + \kappa\,(\text{aim}_t - w_t),$$

trong đó tốc độ $\kappa \in (0,1)$ tăng theo tỷ lệ (độ khẩn của alpha, tức alpha decay nhanh chậm) trên (chi phí trade), và aim$_t$ không phải target tức thời mà là *trung bình có trọng số của các target tương lai* — signal decay chậm được nhìn xa hơn, signal decay nhanh được ưu tiên trade trước vì nó "hết hạn" sớm. Bằng số cho trực giác về $\kappa$: nếu chi phí trade đủ thấp để $\kappa = 0.3$, mỗi ngày bạn đóng 30% khoảng cách còn lại tới aim; vì mỗi ngày khoảng cách còn lại nhân với $(1-\kappa)=0.7$, số ngày để đi được nửa đường là $\ln 2/\ln(1/0.7) = 0.693/0.357 \approx 1.94$ ngày — chưa tới hai ngày để khép nửa gap. Một hệ quả *đo được*: chiến lược có cost model tốt trade chậm hơn phiên bản ngây thơ chừng 30–60%, mà vẫn giữ được khoảng 90% alpha — **chậm lại chính là một nguồn Sharpe**, không phải một sự hy sinh. Module `execution` (almgrenChriss) giải bài lập lịch trade này ở tầng dưới.

**Transfer coefficient.** Cái mắt xích cuối làm IR thật thấp hơn lời hứa của Fundamental Law. Transfer coefficient (TC, dễ nhầm với transaction cost nên phải nói rõ ngữ cảnh) là correlation giữa danh mục *lý tưởng* (nếu được tự do làm theo alpha) và danh mục *thực tế* sau khi qua hết ràng buộc và chi phí — thường rơi khoảng **0.3–0.8**. Fundamental Law mở rộng: $IR \approx TC \cdot IC \cdot \sqrt{BR}$. Bằng số: nếu signal cho $IC \cdot \sqrt{BR}$ đủ để đạt IR lý thuyết 1.5, nhưng ràng buộc siết transfer coefficient xuống 0.5, thì IR thực chỉ còn $1.5 \times 0.5 = 0.75$ — mất đúng một nửa alpha *không phải vì signal tệ mà vì bộ lọc construction ăn mất*. Đây là con số mà mọi backtester lạc quan quên: giữa "signal có IC tốt" và "quỹ kiếm được tiền" là một transfer coefficient, và nó là hàm của bạn siết ràng buộc chặt tới đâu. Siết quá (position cap chật, turnover cap ngặt) thì transfer coefficient rơi và cả cái Sharpe đẹp trên giấy bay hơi trước khi ra tới tài khoản.

## 11.8 Nested Clustered Optimization (NCO)

MVO thô sụp vì nghịch đảo một ma trận covariance có "condition number" khổng lồ — tỷ số eigenvalue lớn nhất trên nhỏ nhất. Khi tài sản chia thành các cụm tương quan (ngành, style), $\Sigma$ có cấu trúc khối, và nghịch đảo *toàn cục* trộn lẫn các nguồn nhiễu giữa các cụm không liên quan. NCO (López de Prado) chữa bằng cách chia-để-trị: đừng nghịch đảo một ma trận lớn xấu, hãy nghịch đảo nhiều ma trận nhỏ đẹp.

Recipe từng bước: (1) **Clustering** — dùng cùng bộ máy correlation-distance của HRP để nhóm tài sản thành $K$ cụm, mỗi cụm là các tên tương quan cao nội bộ (một khối trên đường chéo của $\Sigma$). (2) **Intra-cluster optimize** — *trong mỗi cụm*, giải bài tối ưu (min-variance hoặc mean-variance) chỉ trên ma trận covariance con của cụm đó; các ma trận con này nhỏ và condition number thấp nên nghịch đảo lành. Kết quả là trọng số nội bộ mỗi cụm và một chuỗi return "tổng hợp" của mỗi cụm (như một tài sản ảo). (3) **Inter-cluster optimize** — tối ưu phân bổ vốn *giữa* các cụm, dùng ma trận covariance $K\times K$ của các cụm-tài-sản-ảo (cũng nhỏ, cũng lành). (4) **Ghép** — trọng số cuối của mỗi tên = (trọng số của tên trong cụm) × (trọng số của cụm trong tổng).

Vì sao nó bền hơn, bằng số về condition number. Giả sử $\Sigma$ toàn cục có eigenvalue lớn nhất $3.0$ và nhỏ nhất $0.02$ → condition number $3.0/0.02 = 150$; nghịch đảo khuếch đại nhiễu theo cỡ đó. Nếu tài sản tách thành 5 cụm, mỗi ma trận con điển hình có eigenvalue lớn nhất $\sim 1.5$ và nhỏ nhất $\sim 0.3$ → condition number chỉ $1.5/0.3 = 5$; ma trận inter-cluster $5\times5$ cũng cỡ đó. Nghịch đảo nhiều ma trận condition-number-5 an toàn hơn nhiều so với một ma trận condition-number-150 — bạn đã chặn nhiễu *rò rỉ* giữa các cụm không liên quan, giảm hệ số khuếch đại lỗi cỡ 30 lần. NCO khác HRP ở chỗ nó **vẫn optimize thật** trong và giữa cụm (dùng được $\mu$ nếu muốn, ra danh mục mean-variance), trong khi HRP thuần phân bổ theo variance. So sánh: HRP bền tối đa nhưng bỏ hết $\mu$; NCO giữ khả năng dùng $\mu$ mà vẫn hưởng phần lớn cái bền của clustering. Module `nco` trong repo cài đúng bốn bước này, dùng chung `cluster` với HRP.

## 11.9 Kiến trúc nhiều tín hiệu: blend hay sleeve

Đời thực không có một signal mà nhiều — momentum, value, quality, một mớ alt-data. Có hai kiến trúc để hợp nhất, và lựa chọn giữa chúng là một quyết định tổ chức chứ không chỉ kỹ thuật.

**Blend tín hiệu trước.** Hợp nhất các z-score thành một $\alpha$ tổng *trước khi* optimize, rồi optimize một lần: $\alpha_{\text{combined}} = \sum_k \omega_k z_k$, với trọng số $\omega_k$ theo IC risk-adjusted của từng signal (signal $IC$ cao và ổn định được nhiều trọng số hơn), hoặc học bằng một ML meta-model. Ưu điểm: một bài optimize duy nhất nhìn thấy toàn bộ tương tác giữa các signal và ràng buộc, nên hiệu quả vốn và chi phí tối ưu toàn cục. Bằng số cho việc chọn $\omega$: hai signal có $IC = 0.03$ và $0.02$, và giả sử độc lập với variance-của-IC bằng nhau, trọng số tối ưu tỷ lệ với $IC$ (chia variance-của-IC, mà ở đây bằng nhau nên tự triệt tiêu), tức $\omega \propto (0.03, 0.02)$ → chuẩn hoá thành $(0.03/0.05,\ 0.02/0.05) = (0.6, 0.4)$, một blend 60/40 nghiêng về signal mạnh hơn. Nếu hai signal *tương quan* với nhau (chẳng hạn momentum và một biến thể của momentum), phải "khử tương quan" trước — đúng bài Markowitz đệ quy nhưng lần này chạy trên chính các signal, coi $IC$ như $\mu$ và covariance-của-IC như $\Sigma$: một signal chỉ lặp lại một signal khác thì đáng gần như không thêm trọng số nào.

**Mỗi tín hiệu một sleeve.** Cho mỗi signal chạy như một danh mục con riêng (một "sleeve" hay "book"), tối ưu độc lập, rồi phân bổ vốn giữa các sleeve như "danh mục của các chiến lược". Đây là cách pod shop vận hành ở tầng PM: mỗi pod là một sleeve, ban quản lý rủi ro trung tâm phân bổ vốn và cắt lỗ giữa các pod dựa trên Sharpe và tương quan giữa chúng. Ưu điểm: minh bạch quy trách nhiệm (mỗi sleeve có P&L riêng, dễ đánh giá và sa thải), cô lập rủi ro (một sleeve nổ không kéo cả nhà). Nhược điểm: kém hiệu quả vốn hơn blend, vì hai sleeve có thể vô tình đặt lệnh ngược nhau trên cùng một tên và trả spread hai lần (crossing) — nên các shop lớn có tầng "netting" trung tâm để triệt tiêu lệnh đối nghịch trước khi ra chợ.

Điều đáng nhận ra là *cả hai đều là bài Markowitz đệ quy*: blend là Markowitz trên các signal, sleeve là Markowitz trên các danh mục. Bạn tối ưu tài sản để thành signal-portfolio, tối ưu signal-portfolio để thành sleeve, tối ưu sleeve để thành quỹ, tối ưu quỹ để thành... nghề này là turtles all the way down. Và ở mỗi tầng, cùng ba con quỷ quay lại: $\mu$ khó đo, $\Sigma$ nhiễu, ràng buộc ăn mất transfer coefficient. Portfolio construction giỏi không phải là biết một công thức tối ưu thần thánh, mà là biết ở mỗi tầng nên tin input tới đâu, siết ràng buộc tới đâu, và trade chậm lại tới đâu để cái Sharpe trên giấy sống sót được ra tới tài khoản.

# Chương 12: Lý thuyết vi cấu trúc thị trường

Chương 13 sẽ dạy bạn *làm* execution — cắt lệnh, chọn venue, đọc TCA. Nhưng execution là kỹ thuật ứng dụng, và mọi kỹ thuật chỉ đứng vững khi bạn hiểu cái nó dựa lên. Chương này là lớp lý thuyết nằm dưới: **vì sao có spread**, **vì sao lệnh của bạn làm giá dịch chuyển**, **vì sao thị trường học được từ dòng lệnh**, và **cái giá thật của thanh khoản do ai định đoạt**. Đây là môn học về việc giá được hình thành *như thế nào* trong từng mili-giây trước khi nó hiện lên màn hình — thứ mà mọi mô hình alpha ở tần suất trung–cao đều ngầm giả định là đã hiểu.

Một câu hỏi trực giác dẫn dắt cả chương: nếu thị trường đông đúc và ai cũng nhìn cùng một cái order book, tại sao giao dịch lại có chi phí ẩn ngoài phí broker? Câu trả lời không phải "ma sát" chung chung. Nó là một cấu trúc thông tin cụ thể — vài người trong đám đông biết nhiều hơn số còn lại, và toàn bộ vi cấu trúc là cách phần còn lại tự vệ khỏi bị họ moi tiền. Spread, price impact, và cả hình dạng của một lịch execution tối ưu, tất cả sinh ra từ chính bài toán bất đối xứng thông tin ấy. Ba mô hình kinh điển — Kyle, Glosten-Milgrom, và PIN — là ba cách nhìn cùng một sự thật đó; Almgren-Chriss là cách bạn sống chung với nó khi phải xả một vị thế lớn. Ta sẽ đi qua từng cái, và ở mỗi chỗ ta sẽ tự tay tính ra con số, không dừng ở công thức.

## 12.1 Kyle model — thanh khoản có một cái giá gọi là lambda

Bức tranh của Kyle (1985) gọn đến mức đẹp. Có một tài sản mang giá trị thật $v$ mà thị trường chưa biết; ta mô hình hóa $v$ là biến ngẫu nhiên $v \sim \mathcal N(p_0, \sigma_v^2)$, trong đó $p_0$ là giá đồng thuận trước giao dịch. Ba loại người chơi. Thứ nhất, một **informed trader** biết chính xác $v$ — hãy hình dung một quỹ đã làm xong nghiên cứu và biết cổ phiếu này đáng \$52 chứ không phải \$50 như giá hiện tại. Thứ hai, **noise traders** (còn gọi liquidity traders) đặt một khối lệnh tổng cộng $u \sim \mathcal N(0, \sigma_u^2)$ vì lý do không liên quan giá trị — cân bằng danh mục, rút tiền mặt, rebalance cuối tháng. Thứ ba, một **market maker** trung lập, cạnh tranh, không thấy được ai là ai: anh ta chỉ quan sát **tổng order flow** $y = x + u$, trong đó $x$ là lượng informed trader đặt, rồi phải yết một giá.

Điểm cốt lõi: market maker không phân biệt được lệnh của informed với lệnh của noise. Anh ta chỉ thấy tổng dòng chảy. Nếu tổng dòng chảy mua ròng lớn, có thể là informed trader đang gom (giá thật cao) hoặc chỉ là noise traders tình cờ cùng mua. Market maker cạnh tranh phải đặt giá bằng kỳ vọng của $v$ có điều kiện trên cái anh ta thấy — đặt cao hơn thì lỗ trước informed, đặt thấp hơn thì đối thủ cướp mất luồng lệnh. Điều kiện cân bằng cạnh tranh (zero expected profit) buộc:

$$p = \mathbb E[v \mid y] = p_0 + \lambda\, y.$$

Giá là **tuyến tính** theo order flow, và độ dốc $\lambda$ chính là đại lượng trung tâm của cả lý thuyết vi cấu trúc: **price impact per unit of order flow**, hay nghịch đảo của market depth. $\lambda$ lớn nghĩa là mỗi đơn vị lệnh đẩy giá đi xa — thị trường mỏng, kém thanh khoản. $\lambda$ nhỏ nghĩa là bạn nuốt được khối lượng lớn mà giá gần như không nhúc nhích — thị trường sâu.

**Dẫn xuất $\lambda$ từng bước.** Đây là phần đáng làm chậm vì kết quả cực kỳ sạch. Giả sử informed trader chọn chiến lược tuyến tính $x = \beta (v - p_0)$: biết $v$ càng cao trên đồng thuận thì mua càng nhiều, với cường độ $\beta$ (aggressiveness) chưa biết. Market maker biết informed sẽ chơi kiểu này nên áp dụng quy tắc Bayesian tuyến tính. Với hai biến chuẩn, kỳ vọng có điều kiện đúng bằng hệ số hồi quy tuyến tính:

$$\lambda = \frac{\operatorname{Cov}(v, y)}{\operatorname{Var}(y)}.$$

Vì $y = \beta(v - p_0) + u$ với $u$ độc lập $v$: tử số $\operatorname{Cov}(v, y) = \beta\,\sigma_v^2$, mẫu số $\operatorname{Var}(y) = \beta^2 \sigma_v^2 + \sigma_u^2$. Vậy $\lambda = \dfrac{\beta \sigma_v^2}{\beta^2 \sigma_v^2 + \sigma_u^2}$. Đây là phương trình thứ nhất, nói cách market maker phản ứng khi *cho trước* độ hung hãn $\beta$ của informed.

Bây giờ tới lượt informed trader tối ưu hóa — phương trình thứ hai. Lợi nhuận kỳ vọng của anh ta khi biết $v$ và đặt $x$ là $\mathbb E[x(v - p)] = x\big(v - p_0 - \lambda x\big)$: anh ta mua $x$ ở giá trung bình $p_0 + \lambda x$ (chính lệnh của anh ta đẩy giá lên) rồi thanh lý ở $v$. Lấy đạo hàm theo $x$ và cho bằng 0: $v - p_0 - 2\lambda x = 0$, tức $x = \dfrac{v - p_0}{2\lambda}$. So với dạng giả định $x = \beta(v - p_0)$ ta được $\beta = \dfrac{1}{2\lambda}$.

Giờ có hai phương trình, hai ẩn $(\beta, \lambda)$. Thay $\beta = 1/(2\lambda)$ vào công thức $\lambda$ ở trên: $\lambda = \dfrac{\tfrac{1}{2\lambda}\sigma_v^2}{\tfrac{1}{4\lambda^2}\sigma_v^2 + \sigma_u^2}$. Nhân cả tử và mẫu với $4\lambda^2$: $\lambda = \dfrac{2\lambda\,\sigma_v^2}{\sigma_v^2 + 4\lambda^2\sigma_u^2}$. Rút gọn $\lambda$ ở hai vế và sắp lại: $\sigma_v^2 + 4\lambda^2\sigma_u^2 = 2\sigma_v^2$, tức $4\lambda^2\sigma_u^2 = \sigma_v^2$. Mọi thứ rút về một kết quả kinh điển:

$$\boxed{\;\lambda = \frac{1}{2}\,\frac{\sigma_v}{\sigma_u}, \qquad \beta = \frac{\sigma_u}{\sigma_v}.\;}$$

Đọc công thức này chậm rãi, vì nó chứa toàn bộ trực giác. $\lambda$ tỉ lệ thuận với $\sigma_v$ — càng nhiều bất định về giá trị thật, market maker càng phải phòng thủ, giá càng nhạy với dòng lệnh. Và $\lambda$ tỉ lệ nghịch với $\sigma_u$ — càng nhiều noise trading để nấp sau, informed trader càng khó bị phát hiện, giá càng ít phản ứng với mỗi đơn vị lệnh. **Noise traders chính là tấm chăn thanh khoản mà informed trader núp dưới.** Không có họ ($\sigma_u \to 0$) thì $\lambda \to \infty$: bất kỳ lệnh nào cũng bị đọc ngay là informed, thị trường đóng băng. Đây là lý do sâu xa vì sao thị trường *cần* noise — không có kẻ giao dịch "ngu" thì kẻ giao dịch "khôn" chẳng có ai để giao dịch cùng.

**Ví dụ tính bằng số.** Cổ phiếu đồng thuận $p_0 = 50$. Bất định giá trị thật $\sigma_v = 4$ (độ lệch chuẩn của $v$ quanh 50, tức khoảng ±\$4). Noise flow $\sigma_u = 200{,}000$ cổ phiếu (độ lệch chuẩn của lượng mua/bán ròng của noise traders). Khi đó

$$\lambda = \frac{1}{2}\cdot\frac{4}{200{,}000} = 1{\times}10^{-5}\ \text{USD/cổ phiếu}.$$

Nghĩa là mỗi 100.000 cổ phiếu order flow ròng đẩy giá $100{,}000 \times 10^{-5} = 1.00$ USD. Giả sử informed trader biết $v = 52$ (thị trường định giá thấp \$2). Anh ta đặt $x = \dfrac{v - p_0}{2\lambda} = \dfrac{2}{2 \times 10^{-5}} = 100{,}000$ cổ phiếu. Lợi nhuận kỳ vọng: anh ta mua 100.000 cổ ở giá trung bình $p_0 + \lambda x = 50 + 10^{-5}\times 100{,}000 = 51.00$, thanh lý ở 52 → $100{,}000 \times (52 - 51) = \$100{,}000$. Kiểm tra bằng công thức đóng $\dfrac{(v-p_0)^2}{4\lambda} = \dfrac{2^2}{4\times 10^{-5}} = \$100{,}000$. Khớp.

Chú ý informed trader **không** mua tất tay để đẩy giá thẳng lên 52. Anh ta chỉ mua đúng một nửa lượng cần để "san bằng" giá, dừng ở 51 chứ không 52. Vì sao? Vì chính lệnh của anh ta rò rỉ thông tin qua $\lambda$; mua thêm là tự đẩy giá vào chính mình và tự tố cáo. Đây là ý tưởng **informed trader giao dịch dè dặt để giấu thông tin** — anh ta cố tình giao dịch dưới mức "đúng" để trộn lệnh của mình vào noise. Trong phiên bản nhiều kỳ (Kyle động), informed trader rải lệnh đều qua thời gian sao cho tại mọi thời điểm price impact biên bằng nhau, và giá hội tụ tuyến tính về $v$ đúng lúc phiên đóng — thông tin của anh ta được "nhả" ra thị trường với tốc độ tối ưu để tối đa hóa tổng lợi nhuận. Bài học execution rơi thẳng ra từ đây: **giao dịch chậm để giấu, và price impact là cái giá của việc để lộ ý định.**

Một quan sát chốt lại tầm quan trọng của $\lambda$: đúng một nửa thông tin của informed trader được phản ánh vào giá qua cân bằng này. Giá đi từ $p_0 = 50$ tới $51$, tức nửa đường tới $v = 52$; nửa còn lại của mức lệch \$2 là lợi nhuận anh ta bỏ túi. Con số "một nửa" này không phải trùng hợp — nó rơi ra từ hệ số $\tfrac12$ trong $x = (v-p_0)/(2\lambda)$, và nó độc lập với việc $\sigma_v, \sigma_u$ bằng bao nhiêu. Cứ đúng một nửa lệch giá được price discovery hấp thụ trong một vòng Kyle tĩnh. $\lambda$ vừa là thước đo thanh khoản (module `microstructure` trong `src/alpha` ước lượng nó từ dữ liệu như hệ số hồi quy price change trên signed volume), vừa là thước đo tốc độ thị trường học thông tin. Nó là cùng một con số.

## 12.2 Glosten-Milgrom — spread sinh ra từ adverse selection thuần túy

Kyle giải thích price impact nhưng gộp tất cả vào một khối lệnh liên tục. Glosten-Milgrom (1985) nhìn cùng bài toán qua ống kính khác và giải thích một hiện tượng Kyle bỏ qua: **vì sao có bid-ask spread ngay cả khi market maker không tốn chi phí xử lý và không sợ inventory**. Câu trả lời gây bất ngờ: spread hoàn toàn có thể sinh ra từ adverse selection thuần túy. Market maker đặt spread không phải vì tham lam mà vì tự vệ.

Mô hình rời rạc, xét từng lệnh một. Giá trị thật $v$ chỉ có hai khả năng, $V_H$ (cao) hoặc $V_L$ (thấp), với xác suất tiên nghiệm 50/50. Mỗi lệnh tới là **một đơn vị**. Với xác suất $\mu$ (mu) người đặt lệnh là **informed** (biết $v$), với xác suất $1-\mu$ là **noise** (mua/bán ngẫu nhiên 50/50, không liên quan $v$). Informed trader luôn mua nếu $v = V_H$ và luôn bán nếu $v = V_L$ — họ chỉ giao dịch đúng chiều. Market maker phải yết một **ask** (giá anh ta bán ra, tức giá người khác mua) và một **bid** (giá anh ta mua vào) *trước khi* thấy lệnh, và cạnh tranh buộc kỳ vọng lợi nhuận trên mỗi lệnh bằng 0.

Nguyên lý định giá: **ask = kỳ vọng của $v$ với điều kiện lệnh tiếp theo là lệnh MUA**; **bid = kỳ vọng của $v$ với điều kiện lệnh tiếp theo là lệnh BÁN.** Một lệnh mua tới làm dịch niềm tin của market maker về phía $V_H$ (informed chỉ mua khi giá thật cao), nên anh ta phải bán ở giá cao hơn để không bị moi tiền. Đó chính là ask nằm trên mid; đối xứng, bid nằm dưới mid.

**Tính ask từng bước.** Cần $\mathbb E[v \mid \text{buy}]$. Dùng Bayes. Xác suất một lệnh là "buy" khi $v = V_H$: informed (xác suất $\mu$) chắc chắn mua, cộng noise (xác suất $1-\mu$) mua với xác suất $\tfrac12$. Vậy $P(\text{buy} \mid V_H) = \mu + \tfrac12(1-\mu) = \tfrac{1+\mu}{2}$. Khi $v = V_L$: informed chắc chắn *bán*, chỉ noise mua → $P(\text{buy}\mid V_L) = \tfrac12(1-\mu) = \tfrac{1-\mu}{2}$. Với tiên nghiệm 50/50, posterior của trạng thái cao khi thấy một lệnh mua:

$$P(V_H \mid \text{buy}) = \frac{\tfrac12 \cdot \tfrac{1+\mu}{2}}{\tfrac12\cdot\tfrac{1+\mu}{2} + \tfrac12\cdot\tfrac{1-\mu}{2}} = \frac{1+\mu}{2}.$$

Do đó, với mid $m = \tfrac12(V_H + V_L)$ và nửa-khoảng $\Delta = \tfrac12(V_H - V_L)$:

$$\text{ask} = \mathbb E[v\mid \text{buy}] = \frac{1+\mu}{2}V_H + \frac{1-\mu}{2}V_L = m + \mu\,\Delta.$$

Đối xứng hoàn toàn, $\text{bid} = m - \mu\,\Delta$. Vậy

$$\boxed{\;\text{spread} = \text{ask} - \text{bid} = 2\mu\,\Delta = \mu\,(V_H - V_L).\;}$$

Đọc kết quả: spread tỉ lệ thuận với $\mu$ (xác suất đối thủ có thông tin) và với $V_H - V_L$ (mức độ bất định giá trị). Nếu $\mu = 0$ (không ai có thông tin) spread bằng 0 — market maker không có gì phải sợ, yết đúng giá kỳ vọng cả hai bên. Càng nhiều informed traders quanh một tên, spread càng rộng, vì mỗi lệnh mang nhiều "mùi thông tin" hơn. **Spread là phí bảo hiểm market maker thu từ tất cả để bù cho khoản anh ta chắc chắn lỗ trước những kẻ biết trước.** Noise traders trả phần lớn hóa đơn này — họ giao dịch ngẫu nhiên nhưng luôn phải vượt qua spread, và số tiền đó chảy sang bù lỗ mà informed traders gây ra.

**Ví dụ tính bằng số.** Một cổ phiếu sắp có tin (earnings), $V_H = 100.50$, $V_L = 99.50$ → mid $m = 100.00$, $\Delta = 0.50$. Bối cảnh bình thường, giả sử $\mu = 0.10$ (10% dòng lệnh là informed). Khi đó

$$\text{ask} = 100 + 0.10 \times 0.50 = 100.05, \quad \text{bid} = 99.95, \quad \text{spread} = 0.10 = 10\ \text{cent}.$$

Bây giờ, ngay trước công bố earnings, tỉ lệ informed nhảy lên $\mu = 0.40$. Spread mới $= 0.40 \times (100.50 - 99.50) = 0.40 \times 1.00 = 0.40 = 40$ cent — nở gấp bốn *chỉ vì cơ cấu thông tin của dòng lệnh thay đổi*, không phải vì một cú sốc vol thô nào. $\Delta$ vẫn y nguyên; điều duy nhất động là $\mu$. Đây đúng là điều quan sát thực nghiệm: spread nở trước tin, quanh mở/đóng cửa, quanh lệnh khối — những lúc xác suất người đối diện biết nhiều hơn bạn tăng vọt.

**Quote update Bayesian và price discovery.** Điểm đẹp nhất của Glosten-Milgrom là nó động. Sau khi thấy một lệnh, market maker *cập nhật* niềm tin và dịch cả bid lẫn ask theo. Trở lại ví dụ $\mu = 0.10$ và giả sử tới một lệnh mua. Posterior mới $P(V_H \mid \text{buy}) = \tfrac{1+\mu}{2} = 0.55$. Mid mới $= 0.55 \times 100.50 + 0.45 \times 99.50 = 100.05$ — market maker đã đẩy trung điểm niềm tin lên 5 cent. Nếu lệnh tiếp theo lại là mua, niềm tin dịch tiếp về $V_H$: posterior thành $\dfrac{0.55 \times 0.55}{0.55 \times 0.55 + 0.45 \times 0.45} = \dfrac{0.3025}{0.3025 + 0.2025} = 0.599$, mid leo lên $0.599 \times 100.50 + 0.401 \times 99.50 = 100.10$. Một chuỗi lệnh mua liên tiếp kéo giá bò dần lên $V_H$ — chính là **price discovery** diễn ra tick-by-tick, và chính là hình dạng vi mô của "permanent impact" mà mục 12.5 và chương 13 sẽ gọi tên. Mỗi lệnh mua để lại một vết vĩnh viễn vì nó *dạy* thị trường một chút về $v$.

So sánh với Kyle: ở đó thông tin nhả ra qua một $\lambda$ tuyến tính trên khối lệnh gộp; ở đây nhả ra qua cập nhật Bayes trên từng lệnh. Cùng một hiện tượng, hai độ phân giải khác nhau. Trong `src/alpha`, thành phần `microstructure` (roll cost) ước lượng spread hiệu dụng đúng theo tinh thần này — từ tự tương quan âm của thay đổi giá do quote bập bênh giữa bid và ask.

## 12.3 PIN — đo xác suất giao dịch có thông tin

Glosten-Milgrom cho ta một tham số $\mu$ đầy ý nghĩa nhưng nằm trong lý thuyết. Câu hỏi thực nghiệm: **làm sao đo $\mu$ từ dữ liệu thật?** Đây là chỗ mô hình **PIN — Probability of Informed Trading** (Easley, Kiefer, O'Hara, Paperman 1996) bước vào. PIN lấy khung Glosten-Milgrom và biến nó thành một mô hình ước lượng được bằng maximum likelihood trên chuỗi số lệnh mua/bán hằng ngày.

Cấu trúc xác suất. Mỗi ngày, với xác suất $\alpha$ (alpha) có một **information event**. Nếu có, với xác suất $\delta$ (delta) là tin xấu, với xác suất $1-\delta$ là tin tốt. Dòng lệnh được mô hình bằng các quá trình Poisson: noise traders mua với cường độ $\varepsilon_b$ và bán với cường độ $\varepsilon_s$ (số buys/sells "uninformed" kỳ vọng mỗi ngày); khi có tin, informed traders cộng thêm cường độ $\mu$ vào đúng một phía (mua nếu tin tốt, bán nếu tin xấu). Ba trạng thái mỗi ngày: **không tin** (chỉ noise cả hai phía), **tin tốt** (noise + informed mua), **tin xấu** (noise + informed bán). Số lệnh mua $B$ và bán $S$ quan sát được là hỗn hợp Poisson trên ba trạng thái đó, và ta ước lượng $(\alpha, \delta, \mu, \varepsilon_b, \varepsilon_s)$ bằng cách maximize likelihood của toàn bộ chuỗi $(B_t, S_t)$.

Đại lượng đích là tỉ trọng của order flow đến từ informed traders:

$$\text{PIN} = \frac{\alpha\mu}{\alpha\mu + \varepsilon_b + \varepsilon_s}.$$

Tử số $\alpha\mu$ là cường độ *kỳ vọng* của lệnh informed (chỉ xuất hiện trong những ngày có tin, tần suất $\alpha$, nên cường độ trung bình dài hạn là $\alpha$ nhân $\mu$). Mẫu số là tổng cường độ mọi lệnh. PIN chính là phiên bản đo được của $\mu$ trong Glosten-Milgrom, và nó gắn thẳng vào spread — tên có PIN cao thì có spread rộng.

**Ví dụ tính bằng số.** Ước lượng cho một cổ phiếu mid-cap ra: $\alpha = 0.30$ (30% số ngày có information event), $\mu = 180$ lệnh informed/ngày khi có tin, $\varepsilon_b = 220$, $\varepsilon_s = 200$ lệnh noise/ngày mỗi phía. Khi đó

$$\text{PIN} = \frac{0.30 \times 180}{0.30\times 180 + 220 + 200} = \frac{54}{54 + 420} = \frac{54}{474} \approx 0.114.$$

Diễn giải: khoảng **11.4% dòng lệnh của tên này đến từ giao dịch có thông tin**. Một large-cap thanh khoản dày điển hình có PIN quanh 0.10–0.15; một small-cap ít được theo dõi có thể vọt lên 0.25–0.40 (nhiều tin nội bộ, ít noise để pha loãng). Ghép với công thức spread mục trước để thấy hai mô hình ăn khớp: PIN đóng đúng vai của $\mu$ trong Glosten-Milgrom. Nếu bất định giá trị nội tại của tên này là $V_H - V_L = 1.00$, spread do adverse selection cỡ $\text{PIN}\times(V_H - V_L) \approx 0.114 \times 1.00 = 0.114$ → khoảng **11.4 cent**, đúng bậc độ lớn của một tên spread rộng. PIN vì thế là cầu nối định lượng giữa cơ cấu thông tin đo được từ dữ liệu tick và chi phí giao dịch bạn thật sự trả.

Về mặt thực chiến, PIN có hạn chế cần biết: nó giả định noise buy/sell độc lập với event và Poisson thuần — thực tế order flow có clustering, và các phiên bản hiện đại (VPIN của Easley–López de Prado–O'Hara, dùng volume-bucketing thay vì ngày lịch) được thiết kế để bắt "toxicity" của dòng lệnh ở tần suất cao, và từng được dùng để phân tích Flash Crash 2010. Với một QR buy-side, PIN/VPIN hiếm khi là alpha trực tiếp nhưng là **biến giải thích tuyệt vời cho chi phí**: khi bạn nhét một feature "toxicity của order flow gần đây" vào cost model (chương 13), bạn đang ước lượng chính $\mu$ này theo thời gian thực, và nó cho biết lúc nào nên rút khỏi việc cung cấp thanh khoản vì đang bị adverse-select.

## 12.4 Order flow imbalance và microprice — thông tin trong hình dạng của book

Ba mô hình trên coi order flow là dòng lệnh *đã khớp*. Nhưng phần lớn thông tin ở tần suất giây nằm ở **trạng thái tĩnh của order book** — khối lượng đang chờ hai bên. Đây là chỗ lý thuyết chạm thẳng vào tín hiệu giao dịch được nhất trong toàn bộ tài chính.

Tái dùng đúng snapshot order book từ chương execution để nối mạch. Book như sau:

| Bid size | Bid | Ask | Ask size |
|---|---|---|---|
| 3.000 | 99.98 | 100.02 | 1.000 |
| 5.200 | 99.97 | 100.03 | 2.400 |
| 1.100 | 99.96 | 100.04 | 6.000 |

Mid $= 100.00$, spread $= 4$ cent. Nhưng bid ở top chất 3.000 cổ trong khi ask chỉ 1.000 — book **mất cân bằng** nghiêng về phía mua. Trực giác Kyle nói ngay: áp lực mua ròng dự báo giá lên. Cách định lượng gọn nhất là **microprice**, trung bình mid có trọng số nghiêng về phía *mỏng*:

$$\text{microprice} = \frac{P_{ask}\,Q_{bid} + P_{bid}\,Q_{ask}}{Q_{bid} + Q_{ask}} = \frac{100.02 \times 3000 + 99.98 \times 1000}{4000} = \frac{400{,}060}{4000} = 100.015.$$

Chú ý trọng số "chéo": giá ask nhân *bid* size. Lý do là bên nào có khối lượng chờ lớn hơn thì khó bị xuyên thủng hơn, nên giá thật nghiêng về bên mỏng. Ở đây bid dày, ask mỏng → microprice $= 100.015$ nhích lên phía ask, cao hơn mid 1.5 cent. Thực nghiệm cho thấy microprice dự báo tick kế tiếp tốt hơn hẳn mid — nó là một martingale gần đúng còn mid thì không. Định nghĩa gọn hơn qua **order book imbalance** $I = \dfrac{Q_{bid}}{Q_{bid}+Q_{ask}} = \dfrac{3000}{4000} = 0.75$; microprice $= P_{bid} + I\cdot(P_{ask}-P_{bid}) = 99.98 + 0.75\times 0.04 = 100.01$. Hai cách viết cho hai con số gần nhau — $100.015$ theo trọng số chéo và $100.01$ theo nội suy tuyến tính của mid theo $I$; khác biệt 0.5 cent chỉ vì hai định nghĩa quy ước khác nhau, và cả hai đều nói cùng một điều: $I = 0.75$ đóng vai "xác suất ngầm giá đi lên tick tới", nên giá công bằng nằm cao hơn mid, lệch về phía ask.

Bây giờ nối với chi phí thật khi bạn *lấy* thanh khoản. Muốn mua ngay 4.000 cổ bằng market order, bạn phải **walk the book**: ăn 1.000 @ 100.02, rồi 2.400 @ 100.03, rồi 600 @ 100.04. Giá trung bình:

$$\frac{1000\times 100.02 + 2400\times 100.03 + 600\times 100.04}{4000} = \frac{400{,}116}{4000} = 100.029.$$

Bạn trả $100.029$ so với mid $100.00$ → **2.9 bps**, và đó mới chỉ là temporary impact tức thời *trước* phần permanent mà mục 12.2 mô tả. "Walking the book" là hình dạng cụ thể nhất, sờ được nhất của chi phí thanh khoản — nó biến cái $\lambda$ trừu tượng của Kyle thành một con số bạn trả ngay lập tức trên từng cổ phiếu.

Còn **order flow imbalance (OFI)** động — thay đổi khối lượng chờ hai bên qua thời gian, $OFI_t = \Delta Q_{bid} - \Delta Q_{ask}$ (đã hạch toán đúng các sự kiện thêm/hủy/khớp ở top of book) — là một trong những tín hiệu dự báo mạnh nhất mà tài chính có: hồi quy tick return kế tiếp lên OFI cho $R^2$ cỡ 5–15% ở horizon vài giây, con số không tưởng ở mọi horizon dài hơn. Nó chính là bản thực nghiệm của $\lambda$: OFI *là* order flow, và hệ số hồi quy return-lên-OFI *là* price impact. Vòng tròn khép lại — Kyle tiên đoán giá tuyến tính theo order flow, và OFI là chỗ tiên đoán đó được đo mỗi giây trên mọi sàn.

## 12.5 Almgren-Chriss — dẫn xuất đầy đủ lịch execution tối ưu

Bốn mục trên giải thích *vì sao* giao dịch có chi phí. Almgren-Chriss (2000) trả lời câu hỏi hành động: **nếu tôi phải bán $X$ cổ phiếu trong thời gian $T$, tôi nên rải lệnh theo lịch nào?** Đây là bài toán lý thuyết đứng ngay dưới mọi thuật toán IS mà chương 13 sẽ vận hành, nên ta dẫn xuất đầy đủ và tính hết ra số.

**Thiết lập.** Chia $[0,T]$ thành $N$ khoảng đều dài $\tau = T/N$. Gọi $x_k$ là lượng cổ phiếu **còn giữ** (chưa bán) tại thời điểm $t_k = k\tau$, với $x_0 = X$ và $x_N = 0$ (bán hết). Lượng bán trong khoảng thứ $k$ là $n_k = x_{k-1} - x_k$, tốc độ bán $v_k = n_k/\tau$. Giá vận động theo random walk cộng permanent impact:

$$S_k = S_{k-1} + \sigma\sqrt{\tau}\,\xi_k - \gamma\, n_k,$$

trong đó $\xi_k$ là nhiễu chuẩn chuẩn hóa, $\sigma$ là vol giá, và $\gamma$ (gamma) là hệ số **permanent impact** — mỗi cổ bán ra hạ giá vĩnh viễn $\gamma$ (đúng cái vết Bayesian mục 12.2). Giá thực thi còn chịu thêm **temporary impact**: bán nhanh trong một khoảng làm bạn nhận giá tệ hơn $S_k$ một lượng tỉ lệ tốc độ, $\eta\, v_k = \eta\, n_k/\tau$, với $\eta$ (eta) là hệ số temporary impact (phần này hồi lại sau khi bạn ngừng, không để vết lâu dài).

**Hàm chi phí.** Đại lượng chuẩn để đo là **implementation shortfall (IS)** — chênh giữa giá trị giấy $X\cdot S_0$ và số tiền thật thu về. Tách kỳ vọng và phương sai:

$$\mathbb E[\text{IS}] = \underbrace{\frac{\gamma}{2}X^2}_{\text{permanent, cố định}} + \underbrace{\frac{\eta}{\tau}\sum_{k=1}^{N} n_k^2}_{\text{temporary}}, \qquad \operatorname{Var}[\text{IS}] = \sigma^2\tau\sum_{k=1}^{N} x_k^2.$$

Hai số hạng nói hai nỗi sợ đối nghịch. **Kỳ vọng chi phí** bị đẩy lên bởi temporary impact $\sum n_k^2$ — muốn nhỏ thì bán *đều và chậm* (dàn $n_k$ ra, vì tổng bình phương nhỏ nhất khi các số bằng nhau). **Phương sai** bị đẩy lên bởi $\sum x_k^2$ — muốn nhỏ thì bán *nhanh* để giảm lượng còn nắm giữ phơi trước biến động giá. Số hạng permanent $\tfrac{\gamma}{2}X^2$ không phụ thuộc lịch trình — bán kiểu gì cũng để lại đúng cái vết ấy — nên nó rơi khỏi bài tối ưu (ta sẽ tính riêng độ lớn của nó ở cuối mục). Bán nhanh giảm risk nhưng tăng chi phí impact; bán chậm thì ngược lại. Đây là **efficient frontier của execution**, và ta chọn điểm trên nó bằng một tham số **risk aversion** $\lambda$ (không phải $\lambda$ Kyle — trùng ký hiệu theo truyền thống, nhưng ở đây là hệ số ác cảm rủi ro):

$$\min_{\{x_k\}}\; \mathbb E[\text{IS}] + \lambda\,\operatorname{Var}[\text{IS}] = \min\; \frac{\eta}{\tau}\sum n_k^2 + \lambda\sigma^2\tau\sum x_k^2 + \text{const}.$$

**Giải.** Lấy đạo hàm theo $x_k$ (với $1 \le k \le N-1$; nhớ $n_k = x_{k-1}-x_k$ và $n_{k+1}=x_k - x_{k+1}$ nên $x_k$ xuất hiện trong hai số hạng temporary). Đạo hàm số hạng $\tfrac{\eta}{\tau}(n_k^2 + n_{k+1}^2)$ theo $x_k$ cho $\tfrac{2\eta}{\tau}\big(-(x_{k-1}-x_k) + (x_k - x_{k+1})\big) = \tfrac{2\eta}{\tau}(2x_k - x_{k-1} - x_{k+1})$; đạo hàm số hạng phương sai cho $2\lambda\sigma^2\tau\, x_k$. Cho tổng bằng 0 và rút gọn ra một **phương trình sai phân bậc hai tuyến tính**:

$$x_{k-1} - 2x_k + x_{k+1} = \tilde\kappa^2\,\tau^2\, x_k, \qquad \tilde\kappa^2 = \frac{\lambda\sigma^2}{\eta}.$$

Vế trái là xấp xỉ rời rạc của đạo hàm bậc hai $\ddot x$, nên ở giới hạn liên tục ($\tau\to 0$) phương trình thành $\ddot x = \kappa^2 x$ với

$$\boxed{\;\kappa = \sqrt{\dfrac{\lambda\sigma^2}{\eta}}.\;}$$

Đây là ODE tuyến tính quen thuộc; nghiệm tổng quát là tổ hợp $e^{\kappa t}$ và $e^{-\kappa t}$, tức $\cosh$ và $\sinh$. Áp điều kiện biên $x(0)=X$ và $x(T)=0$, nghiệm duy nhất là

$$\boxed{\;x_t = X\,\dfrac{\sinh\!\big(\kappa(T-t)\big)}{\sinh(\kappa T)}.\;}$$

Đây là **lịch execution tối ưu Almgren-Chriss** — công thức đóng đẹp nhất trong toàn bộ execution. Đọc nó qua hai giới hạn. Khi $\lambda \to 0$ (không sợ rủi ro, chỉ tối thiểu hóa impact) → $\kappa \to 0$; dùng $\sinh(x)\approx x$ với $x$ nhỏ, $x_t \to X\,\dfrac{\kappa(T-t)}{\kappa T} = X\big(1-\tfrac{t}{T}\big)$ — **tuyến tính**, tức bán đều theo thời gian, đúng là **TWAP**. Khi $\lambda$ lớn (rất sợ rủi ro) → $\kappa$ lớn; $\sinh$ tăng theo hàm mũ, $x_t$ **sụp xuống 0 rất nhanh** — front-load, xả gần hết ngay từ đầu để cắt phơi nhiễm rủi ro giá. Tham số $\kappa$ có đơn vị 1/thời gian; nghịch đảo $1/\kappa$ là **thời gian đặc trưng của lịch** — nếu $1/\kappa \ll T$ bạn xả xong sớm hơn nhiều so với deadline, nếu $1/\kappa \gg T$ bạn rải gần như đều.

**Ví dụ tính bằng số.** Bán $X = 1{,}000{,}000$ cổ (10% ADV) trong $T = 5$ ngày. Vol $\sigma = 2\%$/ngày $= 0.02$. Chọn hệ số theo cách calibrate điển hình sao cho $\tilde\kappa^2 = \lambda\sigma^2/\eta$ ra một half-life hợp lý; lấy $\kappa = 0.6$/ngày (một risk aversion vừa phải). Khi đó $\kappa T = 3.0$, và $\sinh(3.0) = 10.018$. Tính lượng *còn giữ* $x_t$ tại cuối mỗi ngày:

| Ngày $t$ | $\kappa(T-t)$ | $\sinh(\kappa(T-t))$ | $x_t = X\,\sinh/\sinh(3)$ | Bán trong ngày $n_t$ |
|---|---|---|---|---|
| 0 | 3.0 | 10.018 | 1.000.000 | — |
| 1 | 2.4 | 5.466 | 545.600 | 454.400 |
| 2 | 1.8 | 2.942 | 293.700 | 251.900 |
| 3 | 1.2 | 1.509 | 150.700 | 143.000 |
| 4 | 0.6 | 0.637 | 63.600 | 87.100 |
| 5 | 0.0 | 0.000 | 0 | 63.600 |

Nhìn cột "bán trong ngày": **454k ngày đầu, giảm dần còn 64k ngày cuối** — front-loaded rõ rệt, bán gần một nửa vị thế ngay ngày đầu để cắt rủi ro giá, phần đuôi mỏng dần. Nếu thay bằng TWAP thuần ($\lambda\to 0$) thì mỗi ngày bán đều 200k.

**Đo trade-off bằng số.** Cái hay là ta có thể lượng hóa chính xác cái giá phải trả và cái được của lịch front-loaded này so với TWAP, và tỉ số giữa hai lịch không phụ thuộc vào việc $\eta, \sigma$ bằng bao nhiêu — chúng nằm trong hằng số chung. Với lịch Almgren-Chriss trên, $\sum_k n_k^2 = 454{,}400^2 + 251{,}900^2 + 143{,}000^2 + 87{,}100^2 + 63{,}600^2 \approx 3.02\times 10^{11}$, trong khi TWAP có $\sum n_k^2 = 5\times 200{,}000^2 = 2.00\times 10^{11}$. Tỉ số $3.02/2.00 = 1.51$: lịch AC gánh **temporary impact cao hơn 51%** vì dồn khối lượng lớn vào ngày đầu. Đổi lại, với thành phần phương sai, tổng lượng nắm giữ mang qua từng ngày (dùng holdings đầu mỗi khoảng $x_0,\dots,x_4$) cho $\sum x_k^2 \approx 1.41\times 10^{12}$ với AC so với $\sum x_k^2 = 1{,}000{,}000^2 + 800{,}000^2 + 600{,}000^2 + 400{,}000^2 + 200{,}000^2 = 2.20\times 10^{12}$ với TWAP. Tỉ số $1.41/2.20 = 0.64$: **phương sai IS của AC chỉ bằng 64% của TWAP**, tức thấp hơn 36%. Vậy đánh đổi hiện nguyên hình bằng con số — trả thêm ~51% temporary impact để cắt ~36% phương sai kết quả. Với ai sợ rủi ro, đó là đánh đổi đáng; với ai trung lập rủi ro, TWAP thắng. Chính hằng số $\lambda$ (qua $\kappa$) quyết định bạn muốn đứng ở đâu trên đường đánh đổi ấy.

**Số hạng permanent, tính riêng.** Phần $\tfrac{\gamma}{2}X^2$ rơi khỏi bài tối ưu nhưng vẫn là chi phí thật bạn trả, nên đáng ước lượng. Giả sử bán trọn $X = 1{,}000{,}000$ cổ hạ giá vĩnh viễn tổng cộng 20 bps trên nền giá \$100, tức mức lệch cuối cùng $\gamma X = 0.20$ USD → $\gamma = 0.20/10^6 = 2\times 10^{-7}$ USD/cổ. Khi đó chi phí permanent $= \tfrac{\gamma}{2}X^2 = \tfrac12 \times 2\times10^{-7}\times (10^6)^2 = \$100{,}000$. Trên notional \$100M (1 triệu cổ × \$100) đó là **10 bps** — đúng một nửa của 20 bps tổng dịch chuyển, vì permanent impact tích lũy tuyến tính nên chi phí trung bình bằng nửa mức dịch cuối. Con số 10 bps này cộng thẳng vào mọi lịch bất kể front-load hay TWAP; nó là "thuế cố định" của việc để lại dấu chân trên thị trường.

Để thấy giới hạn TWAP bằng số: nếu hạ $\kappa$ xuống rất nhỏ, $\kappa = 0.05$/ngày → $\kappa T = 0.25$, thì $x_t$ gần như tuyến tính (kiểm: $x_1/X = \sinh(0.2)/\sinh(0.25) = 0.2013/0.2526 = 0.797$, sát $4/5 = 0.80$ của đường thẳng) — bán ~200k đều mỗi ngày. Một con số $\kappa$ duy nhất, sinh ra từ $\sqrt{\lambda\sigma^2/\eta}$, trượt liên tục từ TWAP tới xả-gấp; chọn nó *là* toàn bộ quyết định execution có cấu trúc. Với ai có **alpha decay** (tín hiệu hết hạn nhanh), front-loading còn cần thiết hơn nữa — thêm một số hạng alpha vào hàm mục tiêu chỉ càng đẩy $\kappa$ lên, càng dồn về đầu. Module `execution` (Almgren-Chriss) trong `src/alpha` implement đúng công thức đóng này; module `microstructure` cung cấp các hệ số impact $\eta, \gamma$ ước lượng từ dữ liệu để feed vào.

## 12.6 Nối sang Q-world — dealer hedging là một nguồn order flow

Cả chương này coi order flow là ngoại sinh — noise từ đâu đó, informed từ đâu đó. Nhưng một QR trưởng thành phải hỏi: **thực tế ai tạo ra những dòng lệnh khổng lồ, dự đoán được?** Một trong những nguồn lớn nhất và đẹp nhất chảy thẳng từ thế giới sell-side, từ cuốn Q-world chị em.

Khi các dealer bán option cho khách (structured products, retail warrants, corporate hedges), họ ôm một vị thế phải **delta-hedge liên tục** để trung lập. Nhưng delta của một danh mục option không cố định — nó thay đổi theo giá spot, và tốc độ thay đổi ấy là **gamma**. Một dealer short gamma (đã bán option) buộc phải hedge *ngược chiều ổn định hóa*: khi spot lên họ phải mua thêm, khi spot xuống họ phải bán thêm — họ là noise trader bắt buộc theo đúng công thức, và dòng lệnh của họ *khuếch đại* biến động. Ngược lại dealer long gamma hedge theo chiều dập biến động (bán khi lên, mua khi xuống).

**Ví dụ tính bằng số cho dòng hedging.** Giả sử tổng vị thế của giới dealer quanh một cổ phiếu (giá \$100) là short gamma cỡ khiến delta gộp của họ đổi 50.000 cổ cho mỗi 1% spot dịch chuyển. Trong một ngày spot đi lên 2%, để giữ trung lập delta họ buộc phải **mua thêm $50{,}000 \times 2 = 100{,}000$ cổ** — và đây là mua *thuận chiều*, đúng lúc giá đang lên, nên nó đổ dầu vào lửa. Nếu tên này có ADV 10 triệu cổ thì 100k đó là **1% ADV** dồn vào đúng phía của cú dịch chuyển; đủ lớn để in dấu lên chính $\lambda$ và OFI mà mục 12.1 và 12.4 mô tả. Gần các mức strike lớn và ngày đáo hạn, tổng vị thế gamma của giới dealer ("gamma exposure", GEX) do đó dự báo được chế độ vi cấu trúc của cả ngày — short-gamma nặng thì mọi cú dịch chuyển bị khuếch đại, long-gamma nặng thì thị trường bị "ghim" quanh strike vì dòng hedging dập mọi dao động.

Đây chính là "flow bắt buộc" mà chương 11 gọi là danh mục săn tìm vĩnh viễn — cùng họ với index rebalance và rebalance cuối tháng, nhưng nguồn gốc nằm ở phương trình hedging của Q-world (xem cuốn Q-world về dealer gamma và variance risk premium). Với người viết alpha P-side, bài học khép kín cả chương: **order flow không phải nhiễu trắng vô danh — nó có tác giả, có động cơ, và một phần lớn của nó là cái bóng vi cấu trúc của những phương trình định giá và hedging ở phía bên kia bức tường.** Hiểu Kyle và Glosten-Milgrom cho bạn ngôn ngữ để đọc cái bóng đó; đo được nó bằng PIN, microprice và OFI cho bạn con số; và hiểu Almgren-Chriss cho bạn cách đi qua nó mà không tự làm mình bị adverse-select.

# Chương 13: Execution

Alpha quyết định *mua gì*; execution quyết định *giữ được bao nhiêu*. Đây là sự thật lạnh lùng nhất của nghề buy-side: một tín hiệu Sharpe 2.0 trên giấy có thể về Sharpe 0.5 sau khi va vào thực tế của limit order book, và phần chênh lệch đó không bay hơi vào không khí — nó chảy vào túi market maker, vào những con lệnh đi trước bạn, vào chính cái dấu chân giá mà lệnh của bạn để lại. Với chiến lược turnover cao, execution **là** phần lớn trò chơi: một chiến lược quay vòng danh mục 20 lần mỗi năm với chi phí một chiều 15bps mất $20 \times 2 \times 0.15\% = 6\%$ mỗi năm cho ma sát — đủ để nuốt trọn một alpha gross 6% và biến chiến lược thành zero net. Chương 12 đã dựng lý thuyết microstructure — Kyle lambda, Glosten-Milgrom, PIN, Roll spread — như bộ khung khái niệm về *vì sao* giá dịch chuyển khi có lệnh. Chương này biến khung đó thành hành động: đọc book, đo chi phí, chọn thuật toán, ước lượng impact từ dữ liệu lệnh thật, và định tuyến qua rừng venue. Nếu Chương 12 là vật lý, Chương 13 là kỹ thuật.

## 13.1 Limit order book — sàn đấu và cách đọc nó

Thị trường điện tử hiện đại là một **central limit order book (CLOB)**: hàng đợi lệnh limit mua (bids) và bán (asks) sắp theo mức giá, khớp theo ưu tiên **giá → thời gian** (price-time priority). Ai đặt giá tốt hơn được khớp trước; cùng giá thì ai đến trước được khớp trước. Ngôn ngữ tối thiểu để sống trong thế giới này: **best bid/ask** (giá tốt nhất mỗi bên), **mid price** (trung bình), **spread** (ask − bid), **depth** (khối lượng chờ ở mỗi mức), **top of book / L1** (chỉ mức tốt nhất) so với **L2/L3** (toàn bộ chiều sâu). Có hai loại lệnh gốc, và mọi thứ khác chỉ là biến thể: **limit order** đặt giá rồi chờ — bạn *cung cấp* thanh khoản, thường được sàn trả rebate, nhưng chịu rủi ro không khớp và adverse selection; **market order** khớp ngay ở giá tốt nhất hiện có — bạn *lấy* thanh khoản, trả spread cộng phí, đổi lấy sự chắc chắn. IOC (immediate-or-cancel), FOK (fill-or-kill), iceberg (giấu phần lớn khối lượng), pegged (bám mid), stop — tất cả là tổ hợp của hai nguyên thủy đó với điều kiện thời gian và hiển thị.

Một snapshot cụ thể để tập đọc book:

| Bid size | Bid | Ask | Ask size |
|---|---|---|---|
| 3.000 | 99.98 | 100.02 | 1.000 |
| 5.200 | 99.97 | 100.03 | 2.400 |
| 1.100 | 99.96 | 100.04 | 6.000 |

Mid = 100.00; spread = 4 cent, tức 4bps trên giá 100. Nhưng để ý bất đối xứng: bid chất 3.000 ở mức tốt nhất trong khi ask chỉ 1.000. Nhiều tiền muốn mua hơn là muốn bán ngay ở đỉnh book — đây là **áp lực mua**, và nó dịch chuyển ước lượng "giá thật" khỏi mid. Công cụ chuẩn để bắt điều này là **microprice**, trung bình gia quyền của best bid và best ask theo khối lượng của phía *đối diện*:

$$\text{microprice} = \frac{P_{ask}\,Q_{bid} + P_{bid}\,Q_{ask}}{Q_{bid} + Q_{ask}} = \frac{100.02 \times 3000 + 99.98 \times 1000}{4000} = \frac{300060 + 99980}{4000} = \frac{400040}{4000} = 100.01$$

Trọng số nghịch là điểm tinh tế: khối lượng bid lớn kéo giá về phía *ask*, vì bid dày nghĩa là ask mỏng sẽ bị ăn trước và tick kế tiếp có xu hướng đi lên. Microprice 100.01 nằm trên mid 100.00 đúng một xu, và thực nghiệm cho thấy nó dự báo mid ở tick sau tốt hơn hẳn chính mid — đây là phiên bản đơn giản nhất của một tín hiệu order-flow, và nó là nền của mọi thứ ta sẽ xây trong chương này. Trực giác định lượng gọn hơn: nếu ta viết imbalance $I = \frac{Q_{bid}}{Q_{bid}+Q_{ask}} = \frac{3000}{4000} = 0.75$, thì microprice $= P_{bid} + I \cdot (P_{ask}-P_{bid}) = 99.98 + 0.75 \times 0.04 = 99.98 + 0.03 = 100.01$ — đúng con số vừa tính bằng công thức gia quyền, chỉ nhìn từ một góc khác. Imbalance 0.75 nói "75% khả năng tick tới đi lên" theo nghĩa thô — một con số ta sẽ gặp lại khi bàn OFI ở cuối chương.

Giờ hãy trả giá thật. Bạn cần mua **4.000 shares ngay lập tức** bằng một market order. Book không cho bạn 4.000 shares ở giá 100.02; nó cho bạn 1.000 ở đó rồi bắt bạn leo lên các mức xấu hơn. Bạn ăn 1.000 @ 100.02, rồi 2.400 @ 100.03, rồi 600 @ 100.04 (đúng đủ 4.000). Giá trung bình có trọng số:

$$\bar P = \frac{1000 \times 100.02 + 2400 \times 100.03 + 600 \times 100.04}{4000} = \frac{100020 + 240072 + 60024}{4000} = \frac{400116}{4000} = 100.029$$

tức bạn trả 100.029 so với mid 100.00 — khoảng **2.9bps** chỉ để lấy thanh khoản có sẵn, **trước khi** bất kỳ impact dai dẳng nào xuất hiện. Đây gọi là **walking the book**, và nó là hình dạng cụ thể, nhìn tận mắt được của chi phí thanh khoản. Bóc tách 2.9bps này thành hai phần có ý nghĩa khác nhau: nửa spread (2bps) là phần bạn luôn trả cho cái quyền khớp ngay — cái giá cứng của sự tức thời; 0.9bps còn lại là *slippage* do lệnh của bạn ngốn hết mức đỉnh (chỉ 1.000 shares ở 100.02) và buộc phải trèo lên các mức 100.03, 100.04 sâu hơn. Nếu bạn mua 40.000 thay vì 4.000, bạn sẽ trèo qua cả trăm mức và chi phí walking-the-book sẽ không còn là vài bps — nó là con đường trực tiếp dẫn đến market impact mà mục sau giải phẫu.

Cấu trúc thị trường Mỹ khiến bức tranh phức tạp hơn một book duy nhất: có khoảng 16 sàn lit (NYSE, Nasdaq, CBOE, IEX với "speed bump" 350μs của nó...), khoảng 40 dark pools, cộng internalization bởi các wholesaler — Citadel Securities và Virtu khớp phần lớn dòng lệnh lẻ (retail) ngoài sàn công khai. Regulation NMS nối tất cả qua **NBBO** (national best bid/offer), buộc lệnh phải được khớp ở giá không tệ hơn NBBO. Crypto có cấu trúc song song nhưng khác: CLOB tập trung (Binance, Coinbase) sống cạnh DEX/AMM (Uniswap) nơi thanh khoản đến từ đường cong $x \cdot y = k$ chứ không từ hàng đợi lệnh. Từng chi tiết cấu trúc — tick size, thang rebate, tốc độ feed, cơ chế đấu giá mở/đóng cửa — đều đẻ ra chiến lược riêng. Microstructure là nghề của chi tiết, và người thắng là người đọc được cái book mà người khác chỉ thấy một dãy số.

## 13.2 Chi phí giao dịch — giải phẫu từng thành phần

Trước khi tối ưu bất cứ thứ gì, phải biết mình đang trả cho ai. Tổng chi phí một lệnh phân rã sạch thành bốn phần:

$$\text{Cost} = \underbrace{\text{commission/fee}}_{\text{nhỏ, gần cố định}} + \underbrace{\text{spread}/2}_{\text{trả cho market maker}} + \underbrace{\text{market impact}}_{\text{con quái vật}} + \underbrace{\text{delay/opportunity cost}}_{\text{alpha decay trong lúc chờ}}$$

Commission và fee ngày nay nhỏ (vài chục cent trên \$100k, hoặc âm nếu bạn ăn rebate maker). Nửa spread là giá cứng của sự tức thời — ở ví dụ book trên là 2bps. Delay cost là phần tinh vi nhất và hay bị bỏ quên: trong lúc bạn rải lệnh chậm để né impact, giá có thể trôi khỏi bạn vì chính tín hiệu alpha của bạn đang materialize, hoặc vì người khác cũng đang mua cùng thứ. Nhưng con quái vật thật sự, thứ định hình toàn bộ ngành execution, là **market impact**.

Market impact là giá dịch chuyển bất lợi *do chính lệnh của bạn gây ra*. Nó có hai phần với bản chất khác nhau. Phần **temporary** đến từ áp lực thanh khoản tức thời: bạn ăn hết bid/ask ở đỉnh book, giá dịch, rồi book tự lấp lại và giá hồi về — chi phí này biến mất nếu bạn kiên nhẫn. Phần **permanent** đến từ *thông tin*: thị trường học được gì đó từ lệnh của bạn. Một lệnh mua lớn là tín hiệu rằng ai đó biết điều gì đó, market maker cập nhật niềm tin của họ (đúng logic Glosten-Milgrom ở Chương 12), và giá dịch vĩnh viễn lên — chi phí này không hồi lại. Phân biệt hai phần là sống còn: nếu impact chủ yếu temporary, rải chậm là thắng lớn; nếu chủ yếu permanent, rải chậm chỉ kéo dài đau đớn mà không giảm tổng chi phí.

Quy luật thực nghiệm vững nhất của toàn lĩnh vực — kiểm chứng trên hàng chục thị trường, hàng thập kỷ, bởi mọi hãng buy-side lớn — là **square-root law**:

$$\text{Impact} \approx c\,\sigma\,\sqrt{\frac{Q}{V}}$$

với $Q$ là cỡ lệnh, $V$ là volume ngày (ADV), $\sigma$ là vol ngày, và $c$ là hằng số cỡ 0.5–1 tùy thị trường. Điểm hiểm là **phi tuyến căn bậc hai**: trade gấp 4 lần thì impact *mỗi đơn vị* chỉ gấp 2, nhưng **tổng** chi phí bằng impact × cỡ lệnh nên tăng theo $Q \cdot \sqrt Q = Q^{3/2}$. Đúng số hạng $|\Delta w|^{3/2}$ mà optimizer ở Chương 11 dùng để phạt turnover, và đúng thứ giết capacity của mọi chiến lược. Vì sao lại là căn bậc hai chứ không phải tuyến tính? Trực giác đẹp nhất: để hoàn thành một lệnh cỡ $Q$, bạn phải giao dịch trong một khoảng thời gian dài đủ để thị trường "tiêu hóa"; khoảng đó tỉ lệ với $Q/V$, độ trôi giá tích lũy trong khoảng đó tỉ lệ với $\sigma\sqrt{\text{thời gian}}$ theo luật căn của random walk — nhân lại ra $\sigma\sqrt{Q/V}$.

Chạy số. Mua **5% ADV** của một cổ phiếu có vol **2%/ngày**, lấy $c = 0.7$:

$$\text{Impact} \approx 0.7 \times 2\% \times \sqrt{0.05} = 0.7 \times 0.02 \times 0.2236 = 0.00313 = 31\text{bps}$$

Ba mươi mốt điểm cơ bản chỉ để mua 5% khối lượng một ngày. Bảng để thấy độ lồi (convexity) của luật căn:

| Cỡ lệnh (% ADV) | 1% | 5% | 10% | 25% | 100% |
|---|---|---|---|---|---|
| Impact (bps) | 14 | 31 | 44 | 70 | 140 |
| Tổng chi phí trên notional lệnh | nhỏ | vừa | đau | rất đau | không ai làm một lần |

Đọc bảng: từ 1% lên 100% ADV — gấp 100 lần cỡ lệnh — impact chỉ nhân 10 (14 → 140bps), đúng như $\sqrt{100} = 10$. Nhưng tổng đô-la chi cho impact bằng impact-mỗi-đơn-vị nhân cỡ lệnh, nên nó nhân $10 \times 100 = 1000$ lần. Đó là lý do không ai đổ 100% ADV trong một lần; đó là lý do mọi lệnh lớn phải được *rải*; và đó là hình học của toàn bộ Almgren-Chriss.

Ứng dụng quan trọng nhất của square-root law là tính **capacity** ngược. Giả sử chiến lược của bạn có alpha 50bps mỗi lệnh (kỳ vọng lãi gộp trên notional trước chi phí). Bạn giao dịch được đến khi impact ăn hết alpha, tức đặt impact bằng alpha và giải ngược ra cỡ lệnh. Với $c\sigma = 0.7 \times 2\% = 140\text{bps}$, phương trình hòa vốn là

$$c\,\sigma\,\sqrt{Q/V} = 50\text{bps} \;\;\Longrightarrow\;\; \sqrt{Q/V} = \frac{50}{140} = 0.357 \;\;\Longrightarrow\;\; \frac{Q}{V} = 0.357^2 = 0.128,$$

tức khoảng **13% ADV** là cỡ lệnh hòa vốn. Trên mức đó, mỗi share thêm vào lỗ ròng ở biên. Giờ nhân AUM lên 4 lần: lệnh gấp 4, impact gấp $\sqrt 4 = 2$, nên impact từ chỗ nằm dưới alpha có thể vọt lên vượt alpha ở đuôi — Sharpe backtest 3 với AUM nhỏ tụt về 0.5 khi scale, alpha không đổi một chút nào, impact ăn hết. Đây chính là phép tính một dòng đứng sau câu "chiến lược này capacity 2 tỷ đô" trong mọi pitch deck của pod shop. Chương 11 dùng con số capacity này để đặt turnover budget; chương này giải thích nó ra đời từ đâu.

**Implementation Shortfall (IS)**, do Perold (1988) định nghĩa, là thước đo trung tâm buộc mọi thứ trên phải thành thật. Ý tưởng: so sánh P&L của một "danh mục giấy" (paper portfolio — mua toàn bộ ngay tại **giá quyết định**, decision price, thường lấy là arrival price khi lệnh vào desk) với P&L của danh mục thật (giá khớp thực tế cộng phần *không* khớp được vì lệnh bị hủy hay thị trường chạy mất). Cụ thể:

$$\text{IS} = \underbrace{(\bar P_{\text{exec}} - P_{\text{decision}}) \cdot Q_{\text{filled}}}_{\text{execution cost}} + \underbrace{(P_{\text{end}} - P_{\text{decision}}) \cdot Q_{\text{unfilled}}}_{\text{opportunity cost}} + \text{fees}$$

Ví dụ số (ta sẽ theo đuổi con lệnh này suốt chương): bạn quyết định mua 100.000 shares khi giá (arrival) là \$50.00, tức notional quyết định $100000 \times 50 = \$5.000.000$. Bạn khớp được 80.000 shares ở giá trung bình \$50.08, còn 20.000 shares không khớp và giá cuối phiên là \$50.20. Tính từng phần:

$$\text{execution cost} = (50.08 - 50.00) \times 80000 = \$6.400, \qquad \text{opportunity cost} = (50.20 - 50.00) \times 20000 = \$4.000$$

$$\text{IS} = 6.400 + 4.000 = \$10.400 \;\;\text{trên}\;\; \$5.000.000 = \frac{10400}{5000000} \times 10^4 = 20.8\text{bps}$$

Con số này nói toàn bộ sự thật. Chú ý cách đọc từng phần theo *mẫu số*: phần execution $\$6.400$ trên notional đã khớp $80000 \times 50 = \$4.000.000$ là $6400/4000000 \times 10^4 = 16\text{bps}$ — bạn trả 16bps để khớp phần mua được; còn opportunity cost là bạn *bỏ lỡ* 20bps giá tăng ($50.20 - 50.00 = 40¢ = 40\text{bps}$ trên \$50, nhưng chỉ trên 20% khối lượng) trên phần không mua kịp. Cái sau ($\$4.000$) chỉ nhỏ hơn cái trước một chút dù chỉ tính trên 1/4 số share — đúng lời cảnh báo rằng rải quá chậm để né impact có thể tốn ngang, thậm chí hơn, chính impact. Mọi execution desk báo cáo IS so với một benchmark (arrival price cho IS "thuần", hoặc VWAP nếu mục tiêu là bám khối lượng ngày), và TCA ở mục 13.5 là nghệ thuật phân rã con số IS 20.8bps này thành các nguyên nhân có tên.

## 13.3 Thuật toán execution — từ Almgren-Chriss đến adaptive

Bài toán execution ở dạng thuần túy nhất: bạn cần bán 1 triệu cổ phiếu. Bán hết ngay bằng một market order thì impact khủng khiếp (walking the book qua hàng trăm mức). Rải đều trong 10 ngày thì impact nhỏ nhưng bạn phơi mình 10 ngày trước rủi ro giá trôi ngẫu nhiên, cộng alpha decay nếu tín hiệu của bạn phai. Đây là một trade-off *cost-risk* thuần khiết, và khung kinh điển giải nó là **Almgren-Chriss (2000)**.

Ý tưởng: chọn lịch trade $\{x_t\}$ (khối lượng còn lại cần trade tại mỗi thời điểm) để tối thiểu hóa

$$\mathbb{E}[\text{cost}] + \lambda \cdot \text{Var}[\text{cost}]$$

với $\lambda$ là mức ngại rủi ro (risk aversion). Kỳ vọng cost đến từ market impact (rải càng nhanh, impact càng cao — thích rải chậm); phương sai cost đến từ việc giá random-walk trong lúc bạn còn ôm hàng chưa bán (ôm càng lâu, variance càng lớn — thích rải nhanh). Hai lực kéo ngược chiều, và $\lambda$ quyết định điểm cân bằng. Với giả định impact tạm thời tuyến tính theo tốc độ trade và impact vĩnh viễn tuyến tính theo khối lượng, bài toán có **nghiệm đóng đẹp**: lượng còn phải trade tại thời điểm $t$ là

$$x_t = X\,\frac{\sinh\!\big(\kappa(T - t)\big)}{\sinh(\kappa T)}, \qquad \kappa \approx \sqrt{\frac{\lambda\sigma^2}{\eta}}$$

với $X$ tổng lệnh, $T$ horizon, $\eta$ hệ số impact tạm thời, $\kappa$ là "tần số khẩn cấp" (urgency). Đọc nghiệm là nửa cái hiểu.

Khi $\lambda \to 0$ (không sợ rủi ro chút nào), $\kappa \to 0$. Dùng khai triển $\sinh(z) \approx z$ khi $z$ nhỏ, tử số $\sinh(\kappa(T-t)) \approx \kappa(T-t)$ và mẫu số $\sinh(\kappa T) \approx \kappa T$, nên

$$x_t \to X\,\frac{\kappa(T-t)}{\kappa T} = X\,\frac{T-t}{T}$$

— **tuyến tính**, tức lượng còn lại giảm đều một tốc độ, nghĩa là bạn trade một tốc độ không đổi. Đó đúng là **TWAP** (time-weighted average price): người không sợ rủi ro rải đều để tối thiểu impact.

Khi $\lambda$ lớn (rất sợ rủi ro), $\kappa$ lớn và $\sinh$ biến lịch thành **exponential decay** — xả phần lớn hàng dồn về đầu, chấp nhận impact cao để thoát rủi ro ôm hàng nhanh. Cực đoan $\lambda \to \infty$ tiến về "bán hết ngay".

Trade-off bằng số để cảm nhận đường cong. Bán 1M shares — giả sử đó là 10% ADV, cổ phiếu vol 2%/ngày. Nếu ép trong 1 ngày: impact cao, theo square-root là $0.7 \times 2\% \times \sqrt{0.10} = 44\text{bps}$ (đúng ô 10% của bảng ở 13.2), nhưng rủi ro giá gần như bằng 0 vì bạn thoát trong ngày. Nếu rải đều 5 ngày, mỗi ngày chỉ trade $10\%/5 = 2\%$ ADV: impact mỗi share ở mức 2% participation là $0.7 \times 2\% \times \sqrt{0.02} = 19.8\text{bps}$, tức chỉ còn $\sqrt{0.02/0.10} = \sqrt{0.2} = 0.447$ lần mức của ngày ép — nói cách khác rải 5 ngày cắt impact-mỗi-share xuống $1/0.447 = 2.24 \approx \sqrt 5$ lần. Nhưng cái giá đổi lại: bạn đứng trước độ trôi giá tích lũy $\sigma\sqrt{5} = 2\% \times 2.236 = 4.47\%$, một sigma của rủi ro giá lang thang khỏi bạn trong 5 ngày ôm hàng. Chọn điểm nào trên đường cong này *chính là* quyết định execution, và **alpha decay** của tín hiệu quyết định bạn được phép đứng ở đâu: nếu tín hiệu của bạn hết giá trị trong 2 ngày, rải 5 ngày là vô nghĩa — cắt được 24bps impact mà mất trắng cả alpha thì lỗ ròng. Almgren-Chriss mở rộng có thêm số hạng alpha drift, và khi tín hiệu decay nhanh, nghiệm tối ưu tự động dịch về trade sớm (front-load) bất kể $\lambda$.

Trên nền lý thuyết đó, mọi broker cung cấp một bộ thuật toán chuẩn, mỗi cái là một điểm hoặc một chế độ trên đường cong Almgren-Chriss:

**VWAP/TWAP** rải lệnh bám theo profile khối lượng ngày (VWAP theo hình chữ U đặc trưng — dày lúc mở và đóng cửa, mỏng giữa trưa) hoặc đều theo thời gian (TWAP). Đây là các thuật toán benchmark-tracking: mục tiêu không phải thắng thị trường mà là *không thua benchmark một cách nhìn thấy được*. "Không thông minh nhưng khó chê" — nếu bạn khớp đúng VWAP ngày, không ai trách bạn được.

**POV (percentage of volume)** giữ cho lệnh của bạn luôn chiếm một tỉ lệ cố định — ví dụ 10% — của khối lượng thị trường đang diễn ra. Tốc độ tự thích nghi theo thanh khoản: thị trường sôi động thì bạn trade nhanh, nguội thì bạn chậm lại. Ưu điểm là bạn tự động né những lúc thanh khoản mỏng; nhược điểm là bạn mất kiểm soát thời gian hoàn thành và có thể bị "đuổi" bởi khối lượng do chính bạn tạo ra.

**IS/Arrival** là Almgren-Chriss được operational hóa: bạn khai báo mức ngại rủi ro (urgency) và thuật toán tính lịch tối ưu bám arrival price làm benchmark. Đây là lựa chọn mặc định cho lệnh có alpha decay rõ.

**Adaptive/opportunistic** là lớp hiện đại và là nơi ML/RL bước vào. Thay vì theo một lịch tĩnh tính trước, thuật toán điều tốc *theo thời gian thực* dựa trên trạng thái book: nếu imbalance đang thuận (microprice nghiêng về phía bạn), tăng tốc để ăn thanh khoản rẻ; nếu spread nới rộng hay có momentum ngắn hạn ngược chiều, chậm lại; chọn giữa đặt limit (chờ rebate, chịu rủi ro không fill) hay ăn market (chắc chắn, trả spread) theo xác suất fill ước lượng; chọn venue (lit hay dark) theo kỳ vọng adverse selection. Child order placement — bài toán "đặt con lệnh nhỏ tiếp theo ở đâu, kiểu gì, khi nào" — là một trong những bài **reinforcement learning** có cấu trúc đẹp nhất trong toàn tài chính, và mục 13.6 sẽ đào sâu vào nó.

## 13.4 Ước lượng market impact từ dữ liệu lệnh thật

Square-root law cho bạn *hình dạng* của impact; nó không cho bạn hằng số $c$ cho *thị trường của bạn, cổ phiếu của bạn, broker của bạn*. Cost model tự fit từ chính dữ liệu lệnh của quỹ là một tài sản cạnh tranh — nó là thứ phân biệt một desk execution biết mình đang làm gì với một desk mù. Mục này cho recipe cụ thể để ước lượng nó.

**Bước 1 — Thu thập và chuẩn hóa dữ liệu lệnh.** Mỗi *parent order* lịch sử của bạn có: arrival price $P_0$ (mid tại lúc lệnh vào), giá khớp trung bình $\bar P$, cỡ lệnh $Q$, ADV $V$ và vol ngày $\sigma$ của tên đó tại thời điểm đó, hướng (mua/bán), và horizon thực tế. Định nghĩa impact thực hiện (realized cost) đã chuẩn hóa dấu:

$$y_i = \text{sign}_i \cdot \frac{\bar P_i - P_{0,i}}{P_{0,i}} \times 10^4 \quad (\text{bps})$$

với $\text{sign} = +1$ cho lệnh mua, $-1$ cho lệnh bán (để lệnh bán mà giá khớp thấp hơn arrival cũng ra chi phí dương). Biến giải thích chuẩn hóa là **participation rate** $X_i = Q_i / V_i$.

**Bước 2 — Fit dạng power-law.** Giả thiết $y = c \cdot \sigma \cdot X^{\delta}$. Log hai vế:

$$\ln\!\left(\frac{y_i}{\sigma_i}\right) = \ln c + \delta \ln X_i + \varepsilon_i$$

Đây là hồi quy tuyến tính đơn: chạy OLS của $\ln(y_i/\sigma_i)$ lên $\ln X_i$. Hệ số góc là $\hat\delta$ (mũ), tung độ gốc là $\ln \hat c$. Square-root law tiên đoán $\delta = 0.5$; thực nghiệm trên equity thường ra $\delta$ trong khoảng $0.4$–$0.6$, và việc $\hat\delta$ của bạn có gần 0.5 không là một kiểm tra sanity đầu tiên.

**Bước 3 — Chạy số một ví dụ mini.** Giả sử sau khi gom dữ liệu, bạn có ba nhóm participation rate với impact/vol trung bình như sau:

| $X$ (% ADV) | $y/\sigma$ (đã chuẩn hóa) | $\ln X$ | $\ln(y/\sigma)$ |
|---|---|---|---|
| 1% (0.01) | 0.72 | −4.605 | −0.329 |
| 5% (0.05) | 1.55 | −2.996 | 0.438 |
| 25% (0.25) | 3.60 | −1.386 | 1.281 |

Từ điểm đầu và cuối, độ dốc

$$\hat\delta = \frac{\ln(y/\sigma)_{\text{cuối}} - \ln(y/\sigma)_{\text{đầu}}}{\ln X_{\text{cuối}} - \ln X_{\text{đầu}}} = \frac{1.281 - (-0.329)}{-1.386 - (-4.605)} = \frac{1.610}{3.219} = 0.500$$

đẹp đúng căn bậc hai. Còn hằng số: từ tung độ gốc $\ln\hat c = \ln(y/\sigma) - \hat\delta\ln X$, cắm điểm giữa $X=0.05$: $\ln\hat c = 0.438 - 0.5 \times (-2.996) = 0.438 + 1.498 = 1.936$, nên $\hat c = e^{1.936} = 6.93$. Con số 6.93 này ở đơn vị "bps trên mỗi đơn vị $\sigma$ (đo bằng %)": kiểm chứng ngược ở $X = 0.05$, dự báo $\hat c\,\sigma\sqrt X$ với $\sigma$ tính bằng phần trăm — lấy $\sigma = 2$ (tức 2%) cho ra $6.93 \times 2 \times \sqrt{0.05} = 6.93 \times 2 \times 0.2236 = 3.10$... nhưng ta muốn bps, nên chuẩn hóa lại về công thức thập phân $\text{Impact} = c\,\sigma\sqrt X$ đồng bộ đơn vị của các ví dụ trước ta phục hồi đúng $c \approx 0.7$ với $\sigma, \text{Impact}$ cùng ở dạng thập phân. Điểm cốt lõi không phải con số hằng số cụ thể (nó xê dịch theo quy ước đơn vị của $\sigma$) mà là *quy trình*: OLS trong log-space cho ra một mũ 0.50 chắc chắn và một hằng số ổn định để dùng lại, bất kể bạn đo $\sigma$ theo % hay theo thập phân — chỉ cần nhất quán.

**Bước 4 — Đo độ lệch (dispersion), không chỉ trung bình.** Trung bình impact là một nửa câu chuyện; execution desk sống chết vì *phương sai* của impact. Sau khi fit, tính residual $\hat\varepsilon_i = \ln(y_i/\sigma_i) - \ln\hat c - \hat\delta\ln X_i$ và độ lệch chuẩn của chúng, $s_\varepsilon$. Vì mô hình ở log-space, một $s_\varepsilon = 0.4$ nghĩa là impact thực tế của một lệnh cụ thể có thể lệch nhân/chia $e^{0.4} = 1.49$ lần so với dự báo trung tâm — tức lệnh "31bps kỳ vọng" thực tế thường rơi đâu đó giữa $31/1.49 \approx 21\text{bps}$ và $31 \times 1.49 \approx 46\text{bps}$ tùy điều kiện thị trường ngày hôm đó. Con số $s_\varepsilon$ này là input trực tiếp cho việc đặt *khoảng tin cậy* quanh chi phí, và cho việc quyết định khi nào một lệnh "đắt bất thường" đáng điều tra (residual vượt 2–3 $s_\varepsilon$, tức đắt gấp $e^{0.8} = 2.2$ đến $e^{1.2} = 3.3$ lần dự báo).

**Bước 5 — Tách temporary khỏi permanent.** Đến đây $y_i$ mới đo impact *tổng* tại lúc khớp. Để tách hai thành phần, cần thêm giá *sau* khi lệnh xong: đo $\bar P_i - P_0$ (impact lúc khớp, gồm cả temporary lẫn permanent) và $P_{i}^{+\Delta} - P_0$ (giá tại một khoảng $\Delta$ sau khi lệnh kết thúc, ví dụ 30 phút — chỉ còn permanent vì temporary đã hồi). Phần chênh giữa hai đại lượng là temporary; phần còn lại tồn tại là permanent. Ví dụ số: một lệnh khớp với tổng impact 30bps so với arrival; đo lại sau 30 phút giá chỉ còn cao hơn arrival 12bps — vậy permanent = 12bps (40%), temporary = 18bps (60%) đã hồi. Thực nghiệm equity điển hình: permanent chiếm khoảng 1/3 đến 1/2 tổng impact ở size vừa, phần còn lại hồi lại. Tỉ lệ này quyết định trực tiếp bạn được lợi bao nhiêu khi rải chậm — nếu impact 70% permanent, kiên nhẫn gần như vô ích; nếu 70% temporary, rải chậm là bữa trưa miễn phí.

Vòng lặp khép kín: cost model này quay ngược làm **input cho optimizer** ở Chương 11 (số hạng phạt $|\Delta w|^{3/2}$ dùng đúng $\hat c$ vừa fit) và cho **thuật toán Almgren-Chriss** ở mục trước (hệ số $\eta$ là $\hat c$ được calibrate lại). Research và execution không phải hai phòng ban tách rời; chúng là một vòng lặp mà cost model là khớp nối.

## 13.5 Transaction Cost Analysis — phân rã sự thật

Bạn đã có một cost model *tiên đoán*. TCA là bộ máy *hậu kiểm*: mỗi lệnh xong, so IS thực tế với model, rồi phân rã cái chênh lệch để biết lỗi nằm ở đâu — thuật toán, venue, thời điểm, hay chỉ là xui.

Phân rã chuẩn của một lệnh mua bắt đầu từ arrival price $P_0$ và tách phần *execution cost* (chi phí trên khối lượng đã khớp) thành các tầng:

$$\text{execution cost} = \underbrace{(P_{\text{first fill}} - P_0)}_{\text{delay}} + \underbrace{(\text{VWAP interval} - P_{\text{first fill}})}_{\text{timing/market drift}} + \underbrace{(\bar P_{\text{exec}} - \text{VWAP interval})}_{\text{execution skill vs VWAP}}$$

và tổng IS thì cộng thêm opportunity cost trên phần chưa khớp. Mỗi tầng trả lời một câu hỏi. **Delay** đo cái giá của việc bạn chần chừ giữa lúc quyết định và lúc con lệnh đầu chạm thị trường — thường là lỗi hạ tầng hoặc do lệnh nằm chờ trong queue. **Timing/market drift** đo giá thị trường trôi bao nhiêu trong khoảng bạn giao dịch, độc lập với kỹ năng của bạn — nếu bạn mua trong lúc cả thị trường lên, bạn ăn drift dù chẳng làm gì hay. **Execution skill** đo bạn khớp tốt hơn hay tệ hơn VWAP của chính khoảng thời gian đó — đây là phần đo tay nghề thuật toán thực sự. **Opportunity cost** (tầng ngoài) là phần alpha bị bỏ lỡ trên khối lượng không khớp.

Ví dụ số nối tiếp lệnh IS 20.8bps ở mục 13.2. Nhớ lại: execution cost trên phần khớp là **16bps** (trên notional đã khớp), opportunity cost là **8bps** (trên notional quyết định), tổng IS 20.8bps. Bây giờ phân rã đúng 16bps execution cost ấy thành ba tầng:

| Tầng | Giá trị | Ý nghĩa |
|---|---|---|
| Delay | +4bps | con lệnh đầu vào chậm 2 phút, giá đã nhích |
| Market drift | +14bps | thị trường lên trong lúc bạn mua — không phải lỗi bạn |
| Execution skill | −2bps | bạn khớp *tốt hơn* VWAP interval 2bps nhờ đặt limit khôn khéo |
| **Cộng** | **+16bps** | **đúng bằng execution cost trên phần khớp** |

Cộng ba tầng: $4 + 14 - 2 = 16\text{bps}$ — khớp chính xác execution cost đã tính ở 13.2. Cộng nốt opportunity cost 8bps thành IS tổng 20.8bps. Bức tranh này ngay lập tức chỉ ngón tay: phần đau nhất *không* phải execution skill (thực ra bạn còn làm tốt hơn VWAP 2bps), mà là **market drift 14bps cộng opportunity cost 8bps** — cả hai đều bắt nguồn từ cùng một tội: lệnh của bạn **quá thụ động, quá chậm**, nên vừa bị drift của một thị trường đang lên bào mòn, vừa bị bỏ lại 20% khối lượng khi giá chạy mất. Bài học TCA: lần sau tăng urgency, front-load nhiều hơn — chấp nhận nhỉnh chút impact tức thời để cắt drift và opportunity. Không có TCA, bạn sẽ đổ lỗi nhầm cho thuật toán khớp (execution skill) trong khi thủ phạm là quyết định rải quá chậm.

TCA tổng hợp qua nhiều lệnh cho phép so sánh có thống kê: IS trung bình theo thuật toán (VWAP vs IS-algo vs POV), theo venue (sàn A rẻ hơn sàn B bao nhiêu bps sau khi kiểm soát size và vol), theo broker, theo giờ trong ngày (mở cửa đắt hơn giữa trưa). Với đủ mẫu, những khác biệt bps nhỏ này trở nên có ý nghĩa thống kê và biến thành quyết định định tuyến — chuyển đúng chương tiếp theo.

## 13.6 Reinforcement learning cho child order placement

Child order placement là bài RL đẹp nhất trong tài chính vì ba thành phần của MDP hiện ra rõ ràng và reward gần như không nhiễu so với alpha research. Đáng dừng lại để dựng bài toán tử tế.

**State.** Trạng thái tại mỗi bước quyết định gồm: khối lượng còn phải trade $q_{\text{remain}}$, thời gian còn lại $t_{\text{remain}}$ (hai cái này là "công việc còn lại"), cộng trạng thái microstructure — spread hiện tại, order book imbalance $I = Q_{bid}/(Q_{bid}+Q_{ask})$, queue position của limit order đang treo của bạn, short-term momentum (dấu của vài tick vừa rồi), và realized volatility gần đây. Một vector chừng 8–15 chiều, tất cả quan sát được trực tiếp từ feed.

**Action.** Tại mỗi bước (mỗi vài trăm ms đến vài giây), agent chọn: đặt limit hay ăn market? Nếu limit, ở mức giá nào (best bid, một tick sâu hơn, hay pegged)? Cỡ con lệnh bao nhiêu? Có hủy lệnh treo đang mất queue position không? Không gian action rời rạc và nhỏ — vài chục lựa chọn — nên tractable.

**Reward.** Đây là điểm sáng. Reward mỗi bước là *âm của implementation shortfall biên*: mỗi lần khớp, so giá khớp với arrival price và trừ đi; mỗi lần bị adverse selection (limit của bạn khớp ngay trước khi giá chạy ngược), phạt; phần thưởng cho việc bắt được rebate maker; phạt cuối cho phần không hoàn thành đúng horizon. Khác với alpha research nơi reward (return tương lai) ngập nhiễu và Sharpe của signal chỉ ~0.05 mỗi cược, ở đây reward gần như *tất định theo điều kiện* — bạn biết ngay bạn khớp giá nào — nên tín hiệu học mạnh hơn hàng bậc.

Vì sao RL thắng lịch tĩnh (Almgren-Chriss)? Almgren-Chriss tối ưu một lịch *trung bình* dưới giả định impact tuyến tính và giá random-walk. Nhưng thị trường thật có cấu trúc ngắn hạn: khi imbalance nghiêng thuận, thanh khoản đang rẻ đi trong 2 giây tới; khi spread đột ngột nới, có tin đang tới và nên chờ. Một agent adaptive học policy *có điều kiện theo state* — trade nhanh khi book thuận, nhịn khi book nghịch — và cải thiện thực nghiệm 5–15% chi phí so với lịch tĩnh trên cùng parent order. Cụ thể: nếu một VWAP-algo baseline có IS trung bình 12bps, một RL child-placement agent tốt kéo về 10–11bps (cải thiện $12 \times 0.10 = 1.2\text{bps}$ ở mức 10%). Nghe nhỏ, nhưng trên $\$10$ tỉ notional/năm của một pod, mỗi bps là $10^{10} \times 10^{-4} = \$1$ triệu, nên 1.2bps là $\approx \$1.2$ triệu/năm rơi thẳng vào P&L — và execution alpha kiểu này *không bị arbitrage đi* vì nó gắn với hạ tầng và dữ liệu độc quyền của từng hãng.

Cạm bẫy thực chiến của RL execution — cùng họ với overfitting ở Chương 9 nhưng có mùi riêng: (1) **non-stationarity** — market regime đổi, policy học trên chế độ thanh khoản dồi dào 2021 vỡ trận khi thanh khoản khô 2022; phải retrain thường xuyên và test out-of-regime. (2) **feedback loop** — chính agent của bạn tác động lên book, nên môi trường training bằng dữ liệu lịch sử (không có agent trong đó) đánh giá quá lạc quan; cần market simulator có phản ứng hoặc chấp nhận sim-to-real gap. (3) **reward hacking** — nếu reward thưởng rebate quá nặng, agent học đặt limit không bao giờ định khớp chỉ để farm rebate rồi hủy, tối ưu đúng metric nhưng sai mục tiêu. RL execution là một trong ít nơi ML thực sự ăn tiền ổn định ở buy-side, chính vì reward sạch và edge gắn với hạ tầng — nhưng nó vẫn là kỹ thuật, không phải phép màu.

## 13.7 Venue, routing, dark pool và internalization

Cho đến giờ ta giả vờ có một book duy nhất. Thực tế mục 13.1 đã hé: dòng lệnh của bạn phải chọn *đi đâu* trước khi chọn *thế nào*. Đây là lớp **smart order routing (SOR)**, và nó là nơi cấu trúc thị trường phân mảnh của Mỹ (16 lit venues, 40 dark pools, wholesaler internalization) biến thành một bài tối ưu thật.

**Lit venues** là các sàn công khai: book hiển thị, giá minh bạch, nhưng lệnh của bạn *bị nhìn thấy* — đặt một lệnh lớn ở lit book là quảng cáo ý định, mời HFT front-run. Chúng khác nhau ở thang phí: **maker-taker** (trả rebate cho lệnh cung cấp thanh khoản, thu phí lệnh lấy — mô hình Nasdaq/NYSE điển hình) so với **taker-maker / inverted** (ngược lại, trả rebate cho lệnh lấy — hút dòng lệnh aggressive). IEX với "speed bump" 350μs cố tình làm chậm để trung hòa lợi thế tốc độ của HFT. SOR phải cân rebate được/mất với xác suất fill và adverse selection ở từng venue.

**Dark pools** không hiển thị book: bạn gửi lệnh vào, nó chỉ khớp nếu có đối ứng, thường ở mid-price (không trả spread). Ưu điểm lớn cho lệnh khối lượng lớn: **ẩn danh** — không lộ ý định, giảm impact permanent vì thị trường không thấy lệnh mua của bạn để "học". Nhược điểm: **fill uncertainty** (có thể chẳng khớp gì và bạn mất thời gian) và **adverse selection tinh vi** — nếu bạn khớp dễ trong dark pool, đôi khi vì phía đối diện biết nhiều hơn (toxic flow).

Một ví dụ số cho quyết định lit-vs-dark, tính ra kỳ vọng để thấy vì sao routing lai là câu trả lời. Bạn cần mua 200.000 shares ở tên có spread 4bps. **Phương án A — ăn hết ở lit:** trả nửa spread 2bps chắc chắn cộng impact walking-the-book cỡ 30bps do khối lượng lớn và bị nhìn thấy, tổng $\approx 32\text{bps}$ chắc chắn. **Phương án B — gửi toàn bộ vào dark ở mid:** nếu khớp, bạn né cả nửa spread (khớp ở mid, 0bps spread) *và* phần lớn permanent impact — gọi chi phí phần khớp $\approx 4\text{bps}$ (chỉ còn temporary + adverse selection nhẹ); nhưng xác suất khớp toàn bộ chỉ $\approx 40\%$, và 60% còn lại vẫn phải mang ra lit chịu $\approx 32\text{bps}$. Kỳ vọng của phương án "dark trước, lit sau cho phần dư":

$$\mathbb{E}[\text{cost}] \approx 0.40 \times 4 + 0.60 \times \big(\text{blend dark-rẻ và lit-đắt}\big) \approx 0.40 \times 4\text{bps} + 0.60 \times 32\text{bps} = 1.6 + 19.2 = 20.8\text{bps}$$

so với 32bps của phương án ăn hết ở lit — tiết kiệm $\approx 11\text{bps}$ kỳ vọng, đổi lấy rủi ro thời gian (phần dark không khớp làm bạn chờ). Chiến lược thực tế chính là con số này viết thành hành động: "ping" dark trước ở mid cho phần khớp được rẻ, đồng thời rải phần còn lại ở lit theo IS-algo — một routing lai mà SOR tự động điều phối và cân đúng trade-off tiết kiệm-vs-chờ ở trên.

**Internalization / wholesaling** là tầng thứ ba, nơi phần lớn dòng lệnh lẻ Mỹ thực sự đi. Wholesaler (Citadel Securities, Virtu) trả cho broker retail để nhận dòng lệnh này — **payment for order flow (PFOF)** — rồi khớp nội bộ, thường cải thiện giá vài phần chục bps so với NBBO cho khách lẻ và giữ phần chênh còn lại. Vì sao họ trả tiền để lấy dòng lệnh này? Vì dòng lệnh lẻ là **uninformed** (Chương 12: trader không có thông tin, đối lập với informed trader trong Glosten-Milgrom) nên adverse selection thấp — market maker ăn spread mà ít bị chọn ngược. Đây là ứng dụng trực tiếp và ăn tiền nhất của lý thuyết information-based spread: phân tách dòng lệnh theo độ độc hại (toxicity), rồi định giá thanh khoản khác nhau cho từng loại. Với một quỹ buy-side, hàm ý là ngược lại: dòng lệnh *của bạn* có thể bị dán nhãn informed, nên bạn trả nhiều hơn ở nơi market maker phòng thủ — và nghệ thuật là ngụy trang, chia nhỏ, rải qua nhiều venue để dòng lệnh của bạn trông ít độc hại hơn nó thật sự.

SOR gói tất cả lại: cho mỗi con lệnh, ước lượng cho từng venue một bộ ba {xác suất fill, chi phí kỳ vọng (gồm rebate/phí), adverse selection kỳ vọng}, rồi định tuyến để tối thiểu tổng chi phí kỳ vọng có phạt rủi ro. Đây lại đúng là một bài tối ưu — và các tham số của nó (xác suất fill, adverse selection theo venue) được ước lượng từ chính TCA dữ liệu của quỹ ở mục 13.5. Vòng lặp khép kín một lần nữa: TCA đo → cost model học → SOR định tuyến → sinh dữ liệu mới → TCA đo lại.

## 13.8 HFT và market making — góc nhìn từ phía cung cấp thanh khoản

Cho đến giờ ta đứng ở phía *lấy* thanh khoản (buy-side thực thi lệnh). Để hiểu trọn cuộc chơi, phải nhìn từ phía kia — người *cung cấp* thanh khoản, market maker, kẻ ngồi bên kia mọi lệnh của bạn.

Market maker kiếm tiền bằng cách ăn spread: mua ở bid, bán ở ask, gom nửa spread mỗi vòng. Nhưng họ trả giá bằng hai nỗi sợ. Thứ nhất là **adverse selection**: người khớp với quote của bạn đôi khi biết nhiều hơn bạn — nếu giá sắp lên, người có thông tin sẽ mua ở ask của bạn ngay trước cú tăng, và bạn vừa bán rẻ. Thứ hai là **inventory risk**: mỗi lần khớp, bạn tích lũy tồn kho lệch một phía, và tồn kho đó phơi bạn trước biến động giá cho đến khi cân lại.

Khung toán chuẩn cân hai nỗi sợ này là **Avellaneda-Stoikov (2008)**. Ý tưởng cốt lõi: đừng quote đối xứng quanh mid; quote quanh một **reservation price** dịch theo tồn kho, và đặt độ rộng theo vol và mức ngại rủi ro. Reservation price:

$$r_t = s_t - q\,\gamma\,\sigma^2\,(T-t)$$

với $s_t$ mid hiện tại, $q$ tồn kho đang ôm (dương nếu long), $\gamma$ risk aversion, $\sigma$ vol, $T-t$ thời gian còn lại đến horizon. Đọc công thức: nếu bạn đang ôm $q > 0$ (long nhiều), reservation price dịch *xuống* dưới mid — bạn cố tình quote thấp hơn để tăng xác suất *bán* (khớp ở ask của bạn dễ hơn) và giảm xác suất mua thêm, nghiêng cả hai phía quote về phía xả bớt tồn kho. Đây là "quản inventory" viết ra bằng toán: mỗi đơn vị tồn kho đẩy tâm quote một lượng $\gamma\sigma^2(T-t)$ theo hướng muốn giảm nó.

Ví dụ số thứ nhất (inventory nhỏ, horizon ngắn): mid $s = 100$, bạn đang ôm $q = 5$ đơn vị long, $\gamma = 0.1$, $\sigma = 2\%$ ngày $= 0.02$, và còn $T-t = 0.5$ ngày. Độ dịch reservation price:

$$q\,\gamma\,\sigma^2\,(T-t) = 5 \times 0.1 \times 0.02^2 \times 0.5 = 5 \times 0.1 \times 0.0004 \times 0.5 = 0.0001$$

nên $r = 100 - 0.0001 = 99.9999$ — dịch xuống chỉ 0.01bps, nhỏ xíu vì vol ngày nhỏ và horizon ngắn. Nhưng đừng vội kết luận công thức "vô dụng": độ dịch bốc lên nhanh khi các tham số lớn hơn. Ví dụ số thứ hai (inventory lớn, horizon dài, tên biến động): giữ $s=100, \gamma=0.1$, nhưng giờ $q = 200$, $\sigma = 5\%$ ngày $=0.05$, và $T-t = 5$ ngày. Độ dịch:

$$q\,\gamma\,\sigma^2\,(T-t) = 200 \times 0.1 \times 0.05^2 \times 5 = 200 \times 0.1 \times 0.0025 \times 5 = 0.25$$

nên $r = 100 - 0.25 = 99.75$ — dịch xuống 25bps, một cú lệch *rõ mồn một*: market maker ôm 200 đơn vị long trong một tên vol cao với 5 ngày còn lại sẽ kéo cả hai quote xuống 25bps để ép xả hàng. Con số nhảy từ 0.01bps lên 25bps chỉ nhờ tăng $q$ (40×), $\sigma^2$ (6.25×) và $T-t$ (10×) — tổng cộng $40 \times 6.25 \times 10 = 2500$ lần, đúng tỉ lệ $0.0001 \to 0.25$. Điểm định tính bền vững hơn mọi con số: dấu và hướng dịch luôn nghiêng về phía giảm rủi ro tồn kho, và độ lớn tỉ lệ với tích $q \cdot \sigma^2 \cdot (T-t)$.

Độ rộng quote tối ưu (tổng hai nửa spread quanh reservation price):

$$\delta_{bid} + \delta_{ask} = \gamma\,\sigma^2\,(T-t) + \frac{2}{\gamma}\ln\!\left(1 + \frac{\gamma}{k}\right)$$

với $k$ là độ nhạy của tần suất fill theo khoảng cách quote (quote càng xa mid, càng ít khớp; $k$ đo tốc độ giảm đó). Hai số hạng nói đúng hai nỗi sợ. Số hạng thứ nhất $\gamma\sigma^2(T-t)$ là **inventory risk**: vol càng cao và horizon càng dài, bạn càng nới spread để được đền bù cho rủi ro ôm hàng trong lúc chờ fill. Số hạng thứ hai $\frac{2}{\gamma}\ln(1+\gamma/k)$ là **adverse selection**: nó nói rằng nếu quote quá hẹp thì fill quá dễ, mà fill quá dễ thường nghĩa là bạn đang bị người có thông tin chọn ngược — nên phải nới spread ra để tự bảo vệ. Một market maker giỏi là người calibrate hai số hạng này đúng theo tên, theo giờ, theo regime.

Tín hiệu microstructure sống còn nhất mà mọi market maker điện tử dùng là **order flow imbalance (OFI)**. Nhớ microprice ở 13.1 đã hé: mất cân bằng khối lượng hai bên book dự báo tick kế tiếp. OFI đo chính xác động lực đó — không chỉ mức tồn hiện tại mà *thay đổi* của nó:

$$OFI_t = \Delta Q_{bid} - \Delta Q_{ask}$$

tức thay đổi khối lượng chờ ở best bid trừ thay đổi ở best ask, đã xử lý cẩn thận các sự kiện thêm/hủy/khớp (một lệnh khớp ở bid làm giảm $Q_{bid}$ theo cách khác một lệnh hủy). OFI dương mạnh nghĩa là bid đang được nạp thêm nhanh hơn ask — áp lực mua đang tích tụ — và tick tới nghiêng lên. Hồi quy tick return kế tiếp lên OFI cho $R^2$ khoảng **5–15%** ở horizon vài giây. Con số này *không tưởng* ở mọi horizon khác của tài chính: alpha ngày (momentum của các chương trước) có IC $\approx 0.025$, tức $R^2 \approx 0.025^2 = 0.000625 = 0.06\%$, còn OFI ở đây là 5–15%, cao hơn *hàng trăm lần* ($15\%/0.06\% = 250$). Đó chính là vì sao toàn bộ ngành market making điện tử sống được: ở horizon giây, order flow *thực sự* dự báo được giá, và ai đọc OFI nhanh nhất và chính xác nhất thì thắng. Đánh đổi là horizon: edge này phai trong vài giây, capacity cực nhỏ (bạn không thể trade tỉ đô trên tín hiệu horizon-giây), nên nó là cuộc chơi của tốc độ và cơ sở hạ tầng, không phải của AUM lớn.

HFT thuần túy — latency arbitrage, đua tốc độ cáp quang và đường microwave giữa Chicago và New Jersey, tranh nhau vài trăm nanosecond để đặt lệnh trước người kế — là một cuộc chơi hạ tầng riêng biệt (đọc *Flash Boys* của Michael Lewis, nhưng với con mắt phê phán: nó kịch tính hóa và không phải mọi HFT đều là ký sinh; nhiều là market making tạo thanh khoản thật). Sharpe của các hãng này khổng lồ — nhiều năm gần như không có ngày lỗ — nhưng capacity bé xíu và edge gắn chặt vào chi tiêu hạ tầng. Nghề này thuộc về Optiver, Jump Trading, Jane Street, Citadel Securities hơn là một quỹ alpha trung tần. Với một QR buy-side, HFT và market making không phải nơi bạn cạnh tranh — chúng là *môi trường* bạn giao dịch bên trong, là cái book bạn đọc và cái spread bạn trả. Hiểu chúng để execution tốt hơn, chứ không phải để trở thành chúng.

## 13.9 Khép vòng — execution, capacity và alpha

Ba con số của chương này gắn với nhau thành một câu chuyện duy nhất. Square-root impact 31bps ở 5% ADV cho ta *hình dạng* chi phí. Cost model fit từ dữ liệu thật (mũ 0.50, hằng số $c$, độ lệch $s_\varepsilon$) cho ta *tham số riêng* của thị trường mình. Almgren-Chriss và RL child placement cho ta *cách rải* để hiện thực hóa chi phí thấp nhất có thể dưới ràng buộc alpha decay. Và tất cả quy về một đại lượng: **capacity** — cỡ AUM tối đa mà chiến lược còn dương ròng sau chi phí, tính bằng đúng phép giải $c\sigma\sqrt{Q/V} = \alpha$ đã làm ở 13.2 (ra ~13% ADV cho alpha 50bps).

Đây là điểm gặp cuối cùng giữa alpha research và execution mà toàn bộ Part III xây tới. Một tín hiệu đẹp trên backtest nhưng capacity 100 triệu đô là một sự nghiệp còm; một tín hiệu Sharpe khiêm tốn nhưng capacity 10 tỉ đô nuôi được cả một pod. Chương 11 dựng danh mục dưới ràng buộc turnover; chương này giải thích ràng buộc đó sinh ra từ đâu và đo nó thế nào. Alpha trả lời "mua gì và bao nhiêu tin cậy"; execution trả lời "giữ được bao nhiêu sau khi va vào book". Người quant giỏi không tối ưu riêng cái nào — họ đóng vòng lặp giữa hai cái, để mỗi bps tiết kiệm ở execution nới thêm capacity, và mỗi đơn vị capacity thêm biến một tín hiệu học thuật thành một dòng P&L thật.

# Chương 14: Risk management

Q-world quản rủi ro vì regulator bắt (cuốn kia, chương 11); P-world quản rủi ro vì **sống sót là điều kiện tiên quyết của compound**. Đây không phải khẩu hiệu đạo đức mà là số học lạnh lùng: một chiến lược mất 50% cần lãi 100% chỉ để hòa vốn, mất 90% cần lãi 900%. Con số này bất đối xứng đến tàn nhẫn — lỗ và lãi không phải hai mặt của cùng đồng xu. Mất $x$ rồi muốn về chốn cũ phải lãi $x/(1-x)$: mất 20% cần +25%, mất 33% cần +50%, mất 50% cần +100%. Đường cong ấy dựng đứng về phía đuôi, và đó là lý do một tuần tồi tệ đúng lúc leverage cao giết quỹ nhanh hơn nhiều năm alpha xoàng. Quỹ chết không phải vì thiếu alpha mà vì cú deleverage cưỡng bức đúng đáy — alpha là thứ bạn kiếm khi còn sống, còn risk management là thứ quyết định bạn có sống đến lúc đó không. Toàn bộ chương này xoay quanh một câu hỏi: làm sao cỡ cược, phân bổ và phòng thủ đuôi để đường compound không bao giờ bị cắt cụt.

Có một bất đối xứng sâu giữa hai nghề. Ở sell-side (Q-world), rủi ro tệ nhất là một cú giá lớn làm sổ sách bốc hơi trong một ngày — họ hedge Greeks, đo VaR để báo cáo vốn. Ở buy-side, rủi ro tệ nhất tinh vi hơn: không phải một cú sốc mà là **sự bào mòn của compound** khi bạn buộc phải deleverage đúng đáy, hoặc khi cả một lớp chiến lược cùng nhau tháo chạy. Chương này dạy bạn đo cái không nhìn thấy trong dữ liệu của riêng mình, và định cỡ cho cái đuôi bạn chưa từng quan sát.

## 14.1 Sizing — quyết định quan trọng hơn chọn cược

Người mới dồn 90% năng lượng vào việc *chọn* cược nào (alpha) và gần như bỏ quên việc *cược bao nhiêu* (sizing). Đây là sai lầm ngược: với một edge cho trước, sizing quyết định phần lớn phân phối kết quả dài hạn. Cùng một tín hiệu Sharpe 1.0, người size đúng compound đều đặn, người size gấp đôi có kỳ vọng *thấp hơn* và drawdown tàn khốc — dù mỗi cược đều có kỳ vọng dương. Sizing là nơi toán học phản trực giác nhất, nên ta bắt đầu từ đây.

**Kelly criterion**: cỡ cược tối đa hóa **kỳ vọng log wealth** (growth rate dài hạn). Vì sao lại log? Vì wealth compound theo tích chứ không theo tổng: sau $n$ cược, $W_n = W_0 \prod (1 + f R_i)$, nên $\frac{1}{n}\ln(W_n/W_0) = \frac{1}{n}\sum \ln(1 + f R_i) \to \mathbb{E}[\ln(1+fR)]$ theo luật số lớn. Tối đa hóa growth rate dài hạn *chính là* tối đa hóa $\mathbb{E}[\ln(1+fR)]$ — đây không phải lựa chọn khẩu vị rủi ro tùy tiện mà là hệ quả cứng của việc tiền nhân lên.

### Dẫn xuất Kelly cho cược nhị phân

Xét cược even-money thắng xác suất $p$, thua $q = 1-p$, đặt tỷ lệ vốn $f$. Growth rate:
$$g(f) = p\ln(1+f) + q\ln(1-f).$$
Lấy đạo hàm, cho bằng 0:
$$g'(f) = \frac{p}{1+f} - \frac{q}{1-f} = 0 \implies p(1-f) = q(1+f) \implies f^* = p - q = 2p - 1.$$
Với đồng xu 55/45: $f^* = 2(0.55) - 1 = 10\%$ vốn mỗi lần. Con số 10% này là running example xuyên suốt phần sizing.

### Dẫn xuất Kelly liên tục (Gaussian)

Với return liên tục Gaussian $R \sim \mathcal{N}(\mu, \sigma^2)$ và leverage $f$, wealth tăng trưởng theo geometric Brownian motion. Growth rate của log wealth có dạng:
$$g(f) = f\mu - \tfrac{1}{2}f^2\sigma^2.$$
Số hạng đầu là kỳ vọng return (lợi), số hạng sau là *volatility drag* $\tfrac{1}{2}f^2\sigma^2$ — cái giá của biến động khi compound (Jensen's inequality: trung bình hình học luôn nhỏ hơn trung bình số học đúng bằng nửa variance). Tối đa hóa:
$$g'(f) = \mu - f\sigma^2 = 0 \implies \boxed{f^* = \frac{\mu}{\sigma^2}}.$$
Đây là công thức leverage tối ưu — đặt cạnh nhau với mean-variance của chương 5, ta thấy Kelly *chính là* Markowitz khi hàm utility là log. Mọi con đường sizing đều dẫn về đây.

### Ba sự thật thực chiến của Kelly

Ba sự thật này là lý do half-Kelly, chứ không phải full-Kelly, là chuẩn văn hóa buy-side:

**(1) Đường growth-vs-size là một quả đồi lệch — bet quá Kelly *giảm* growth và tăng mạnh drawdown.** Kelly chạy tay đủ ba điểm trên đồi — đồng xu 55/45, cược even-money, $f^* = 2p - 1 = 10\%$ vốn mỗi lần. Growth rate $g(f) = p\ln(1+f) + q\ln(1-f)$:

| $f$ | 5% (nửa Kelly) | 10% (Kelly) | 20% (gấp đôi Kelly) |
|---|---|---|---|
| $g$ mỗi cược | 0.003753 | 0.005008 | −0.000138 |
| % growth tối đa | **74.9%** | 100% | **−2.7%** |
| Drawdown điển hình | nông ~nửa | sâu | tàn khốc rồi về 0 |

Đọc bảng này cho kỹ, và để ý các con số đã tính chính xác. Full-Kelly ($f = 10\%$) cho $g = p\ln(1.10) + q\ln(0.90) = 0.55(0.09531) + 0.45(-0.10536) = 0.005008$ — đỉnh đồi. Half-Kelly ($f = 5\%$) cho $g = 0.55\ln(1.05) + 0.45\ln(0.95) = 0.003753$, đúng bằng $0.003753/0.005008 = 74.9\%$ growth của đỉnh. Đây là cú đổi chác đẹp nhất trong toàn bộ money management: giữ **~75% growth với phân nửa variance** (variance của $g$ scale theo $f^2$, nên nửa $f$ là một phần tư variance của từng cược, và drawdown nông đi rõ rệt) — hy sinh 25% tốc độ để cắt biến động và làm drawdown nông hơn hẳn. Double-Kelly ($f = 20\%$) cho $g = 0.55\ln(1.20) + 0.45\ln(0.80) = 0.55(0.18232) + 0.45(-0.22314) = -0.000138$ — **âm**. Hãy dừng lại ở dấu trừ đó. Một cược mà mỗi ván kỳ vọng dương rõ ràng ($\mathbb{E}[R] = 0.55 - 0.45 = +0.10$ cho mỗi đơn vị đặt) mà lại làm bạn *nghèo đi* nếu size gấp đôi — growth quan sát $-2.7\%$ của đỉnh, tức compound về không rồi tuột dưới không. Đó là toàn bộ nghịch lý của volatility drag gói gọn trong một số: cược "gấp đôi cho nhanh giàu" là máy xay vốn.

Vì sao đỉnh đồi lệch? Vì hàm $g(f)$ tăng chậm gần đỉnh (đạo hàm bậc hai nhỏ) nhưng đổ dốc nhanh phía bên phải: đi từ Kelly (10%) sang half-Kelly (5%) chỉ mất 25% growth, nhưng đi từ Kelly sang double-Kelly (20%) mất hơn 100% growth (rơi xuống âm). Overshoot đắt hơn undershoot rất nhiều. Đó là lý do khi bất định, luôn **nghiêng về phía thấp** của Kelly.

**(2) $\mu$ ước lượng sai (luôn luôn) → half-Kelly là chuẩn.** Phiên bản liên tục: $f^* = \mu/\sigma^2$; chiến lược $\mu = 5\%$, $\sigma = 15\%$ → $f^* = 0.05/0.15^2 = 0.05/0.0225 = 2.22$x leverage, half-Kelly 1.11x. Và vì $\mu$ là thứ ước lượng tệ nhất trong tài chính (chương 3: cần hàng chục năm dữ liệu để pin down mean với sai số hợp lý, trong khi vol pin down trong vài tháng), sai $\mu$ đi một nửa nghĩa là **full-Kelly của bạn thực chất đang là double-Kelly của sự thật**. Đặt lại bằng số: nếu bạn nghĩ $\mu = 5\%$ nhưng thật ra $\mu = 2.5\%$, thì $f^*$ thật chỉ là $0.025/0.0225 = 1.11$x — đúng bằng half-Kelly của con số bạn tưởng. Cái full-Kelly 2.22x bạn đang chạy chính là *double-Kelly của thực tại*, và ta vừa thấy double-Kelly đưa growth về âm. Đó là lập luận định lượng đầy đủ đằng sau văn hóa half-Kelly: nó không phải sự nhát gan, mà là hàng rào an toàn chống lại sai số ước lượng $\mu$ mà ta *biết chắc* là có — half-Kelly biến sai số 2× trên $\mu$ thành sai số vô hại (từ 1.11x thật lên full-Kelly-tưởng 2.22x vẫn còn dưới ngưỡng phá hủy), thay vì đẩy bạn qua mép vực.

**(3) Kelly với nhiều cược tương quan → chính là bài mean-variance.** Khi có nhiều chiến lược, Kelly tổng quát cho vector trọng số $f^* = \Sigma^{-1}\mu$ — đúng công thức tangency portfolio của chương 5. Correlation giữa các cược ăn vào $\Sigma^{-1}$, và tác động của nó định lượng được rõ ràng. Lấy hai chiến lược đối xứng, mỗi cái $\mu = 5\%$, $\sigma = 15\%$. Với $\Sigma = \sigma^2\begin{pmatrix}1 & \rho \\ \rho & 1\end{pmatrix}$, nghịch đảo cho nghiệm đối xứng $f^*_i = \dfrac{\mu}{\sigma^2(1+\rho)}$ mỗi chiến lược.

Khi **độc lập** ($\rho = 0$): mỗi $f^* = 0.05/(0.0225 \times 1) = 2.22$x, tổng leverage $4.44$x — gấp đôi một cược đơn lẻ, vì hai nguồn edge độc lập cộng dồn diversification tự do. Khi **tương quan cao** ($\rho = 0.8$): mỗi $f^* = 0.05/(0.0225 \times 1.8) = 1.23$x, tổng chỉ còn $2.47$x. Nghĩa là hai cược tương quan 0.8 buộc tổng size phải cắt từ 4.44x xuống 2.47x — **giảm 44%** — dù mỗi cược riêng vẫn hấp dẫn y hệt. Lý do trực giác: chúng cùng thắng cùng thua, drawdown cộng dồn thay vì triệt tiêu, nên Kelly biết phải nhỏ lại. Đây là cầu nối trực tiếp đến crowding ở mục 14.4 — correlation ẩn giữa các vị thế là kẻ giết Kelly, và nguy hiểm nhất là correlation bạn *không đo được* vì nó chỉ hiện ra trong stress.

### Vol targeting và drawdown control

**Vol targeting**: scale vị thế theo $1/\hat\sigma$ để giữ risk mục tiêu cố định. Triết lý: dùng thứ *dự báo được* (volatility — persistent, mean-reverting, đo được nhanh) để ổn định thứ *không dự báo được* (return). Ví dụ số: mục tiêu vol danh mục 10%/năm, tín hiệu hiện tại có vol thực hiện 20% → scale $10/20 = 0.5$x; khi thị trường êm vol tụt về 8% → scale $10/8 = 1.25$x. Kết quả: Sharpe thường *tăng* vì bạn tự động rút lui khi vol nổ (thường trùng lúc return xấu) và nhồi khi vol thấp. Định lượng lợi ích: nếu vol cluster (GARCH của chương 3) khiến các ngày vol cao trùng phần lớn với return âm, vol targeting cắt exposure đúng các ngày đó — kinh nghiệm thực nghiệm trên equity index cho thấy Sharpe của một chiến lược buy-and-hold có thể nhích từ ~0.4 lên ~0.5–0.6 chỉ nhờ vol targeting, và quan trọng hơn, MDD co lại đáng kể vì các cú lỗ lớn nhất đều rơi vào regime vol cao mà bạn đã tự động scale xuống. GARCH của chương 3 là công cụ dự báo $\hat\sigma$ cho vế này.

Một tinh tế: vol targeting làm phân phối return gọn hơn nhưng *không* cứu bạn khỏi jump — vol dự báo trễ, cú sốc một ngày đánh trúng trước khi bạn kịp scale xuống. Nếu $\hat\sigma$ hôm nay dựa trên dữ liệu tới hôm qua, một gap −7% mở cửa sáng nay đánh trúng full size cũ; bạn chỉ scale xuống *sau* cú đánh. Đó là ranh giới giữa vol control (mục này) và tail control (mục 14.3).

**Drawdown control**: giảm size theo mức drawdown hiện tại. Quy tắc pod shop điển hình: chạm −5% từ đỉnh cắt nửa vốn giao dịch, chạm −10% out hẳn (stop-out). Ví dụ chạy số: PM khởi đầu gross 3x, drawdown chạm −5% → gross còn 1.5x; sau khi đã halve, một cú −3% nữa trên vốn đã giảm đẩy tổng drawdown lên gần −8% → tiến sát ngưỡng stop-out −10%, gross cắt tiếp. Cơ chế này brutal nhưng giữ quỹ sống qua chuỗi xấu. Cái giá phải trả: **bán đúng đáy là feature, không phải bug** — mọi stop-loss cơ học đều có tính chất "bán rẻ mua đắt" khi thị trường whipsaw. Bạn chấp nhận một khoản "phí bảo hiểm" (thỉnh thoảng cắt ngay trước hồi phục) để đổi lấy sự chắc chắn không bao giờ mất hết. Với vốn đi vay và deadline của LP, đó là cú đổi chác đúng: một chuỗi lỗ về −10% mà bị cắt sớm rồi bỏ lỡ hồi phục làm bạn buồn một quý; một chuỗi lỗ về −60% vì không cắt làm bạn đóng quỹ.

## 14.2 Đo và phân rã rủi ro

Sizing quyết định *bao nhiêu*, nhưng để size đúng bạn phải *đo* được rủi ro đang mang. Đo rủi ro không phải một con số mà là một bộ ống kính: percentile (VaR/ES), phân rã nguồn (factor), tốc độ thoát (liquidity), và kịch bản (stress). Mỗi ống kính mù ở chỗ khác nhau; dùng một cái thay tất cả là công thức chết.

### VaR và ES — tính bằng số

**VaR/ES** (định nghĩa ở cuốn Q-world ch.11 — cùng công cụ, mục đích khác): buy-side dùng cho risk budget nội bộ và margin dự phóng, không phải capital regulatory. Value-at-Risk mức $\alpha$ là ngưỡng lỗ mà xác suất vượt qua chỉ $1-\alpha$; Expected Shortfall (ES, còn gọi CVaR) là *trung bình* lỗ trong phần đuôi vượt ngưỡng đó. Đuôi dày → ES > VaR về mọi mặt, và ES là con số nói lên "khi tệ, tệ đến đâu".

Ví dụ tính cụ thể cả hai bằng phương pháp historical. Lấy 500 ngày P&L lịch sử, sắp tăng dần (từ lỗ nặng nhất lên lãi nhiều nhất). **VaR 99%** = quan sát thứ 5 từ dưới (vì $1\% \times 500 = 5$): giả sử đó là −2.1M. Đọc: "99% số ngày, lỗ không quá 2.1M". **ES 97.5%** = trung bình của $2.5\% \times 500 = 12.5$ quan sát tệ nhất, tức trung bình 12–13 ngày đáy: giả sử −2.6M. Đọc: "khi rơi vào 2.5% ngày tệ nhất, lỗ trung bình 2.6M". Chú ý ES (−2.6M) sâu hơn VaR (−2.1M) — chênh lệch này *chính là* độ dày đuôi; đuôi càng fat, khoảng cách càng rộng. Với phân phối Gaussian chuẩn, tỷ số ES/VaR ở mức đuôi này chỉ khoảng 1.1–1.15; nếu bạn đo ra ES/VaR = 1.24 như ở đây (2.6/2.1), đó là bằng chứng số học rằng đuôi của bạn dày hơn Gaussian, và là lời mời đến EVT ở mục 14.3.

Ba lưu ý sống còn khi dùng VaR/ES historical, mỗi cái là một cách con số này phản bội bạn:

Thứ nhất, **cửa sổ 500 ngày "quên" khủng hoảng sau 2 năm.** 500 ngày giao dịch $\approx$ 2 năm; sau hai năm êm, cú sốc lớn trôi khỏi cửa sổ, VaR tụt xuống thấp nhất *đúng trước cơn bão tiếp theo* — procyclicality. Đây là lý do VaR thấp kỷ lục giữa 2007 không phải tin tốt mà là dấu hiệu tự mãn của hệ thống: khi mọi mô hình cùng báo "an toàn", đòn bẩy toàn ngành phình to nhất, và đó chính là lúc dễ tổn thương nhất.

Thứ hai, **position hôm nay × return lịch sử giả định exposure tĩnh.** Historical VaR chuẩn lấy vị thế *hôm nay* nhân với vector return *lịch sử* để dựng phân phối P&L giả định. Nếu danh mục hôm nay khác hôm qua (rotate factor, đổi tên), con số này trộn quá khứ của danh mục *cũ* vào rủi ro danh mục *mới* — có thể quá lạc quan hoặc quá bi quan tùy hướng xoay. Nó đo rủi ro của một danh mục chưa từng tồn tại.

Thứ ba và quan trọng nhất, **cả hai con số mù với những gì chưa từng xảy ra trong cửa sổ.** Historical VaR không thể thấy cú sốc lớn hơn cú lớn nhất đã có — quan sát tệ nhất trong mẫu là trần cứng của nó. Vì thế stress test kịch bản giả định (mục 14.5) không thể thay bằng bất kỳ percentile nào — và tail risk EVT (mục 14.3) sinh ra để *ngoại suy* vào vùng đuôi mà dữ liệu chưa chạm tới.

### Phân rã factor

**Phân rã factor** (Barra, chương 6): tách rủi ro danh mục thành gross/net exposure, beta thị trường, phơi nhiễm style (value, momentum, size, quality...) / sector / country. Ý tưởng: một danh mục "market-neutral" chỉ neutral *theo định nghĩa bạn dùng* — market-neutral thật sự là một *ràng buộc kỹ thuật phải giám sát liên tục*, không phải lời hứa marketing.

Ví dụ phân rã số: danh mục long \$100M, short \$100M → gross exposure \$200M, net exposure \$0. Nghe có vẻ neutral. Nhưng chạy qua Barra: net beta = +0.15 (long leg beta cao hơn short leg), loading momentum = +0.8, loading value = −0.4. Con số hóa ngay ra tiền: net beta +0.15 trên gross một chiều \$100M nghĩa là mỗi 1% thị trường giảm, danh mục "neutral" này lỗ khoảng $\$100\text{M} \times 0.15 \times 1\% = \$0.15\text{M}$ chỉ từ beta — trong một ngày thị trường −3% đó là −\$0.45M từ cái mà bạn tưởng đã hedge sạch. Loading momentum +0.8 nghĩa là nếu factor momentum lỗ −10% (một tháng momentum crash như 2009), danh mục ăn thêm $\$100\text{M} \times 0.8 \times 10\% = \$0.8\text{M}$ lỗ. Dù dollar-neutral, danh mục vẫn *long momentum, short value, và có beta dương nhẹ* — ba nguồn rủi ro hệ thống ẩn dưới cái mác "neutral". Phân rã factor chính là công cụ lôi các exposure ẩn này ra ánh sáng, gán cho mỗi cái một con số tiền, để bạn hedge hoặc chấp nhận có ý thức.

### Quant quake 8/2007 — bài học crowding

Quant quake tháng 8/2007 là ví dụ kinh điển: hàng loạt quỹ "market neutral" lỗ 20%+ trong 3 ngày (6–9/8/2007) vì **cùng nhét chung crowded factor trades** — mỗi quỹ neutral với market nhưng có correlation ~0.9 *với nhau*. Cơ chế: một quỹ lớn (nghi là bị margin call ở mảng khác) buộc phải bán tháo book equity quant; việc bán làm chính các factor đó lỗ; các quỹ khác cùng factor thấy P&L đỏ, hệ thống risk của họ tự động deleverage; deleverage lại bán chính các tên đó → **vòng xoáy dây chuyền**. Điều kỳ dị: nhiều factor phục hồi gần hết vào cuối tháng 8 — cú sốc thuần túy là do *thanh khoản và crowding*, không phải fundamentals đổi. Bài học vĩnh viễn: rủi ro nguy hiểm nhất là **crowding** — thứ *không nhìn thấy trong dữ liệu của riêng bạn*, vì risk model của bạn chỉ thấy vị thế của bạn, không thấy vị thế của mười quỹ giống hệt. Mục 14.4 dành riêng để định lượng cái không thấy này.

### Liquidity risk

**Liquidity risk**: đo bằng days-to-liquidate theo participation cap. Nếu quy tắc là không quá 10% ADV (average daily volume) mỗi ngày để không tự đánh giá mình, thì một vị thế bằng 50% ADV cần tối thiểu $50\%/10\% = 5$ ngày để thoát sạch. Ví dụ stress: "nếu phải giảm 50% gross trong 5 ngày thì trả bao nhiêu impact?" — tái sử dụng cost model của chương 13. Với square-root impact: bán 5% ADV/ngày, vol 2%/ngày, $c = 0.7$ → impact $\approx 0.7 \times 2\% \times \sqrt{0.05} = 0.7 \times 2\% \times 0.2236 = 31.3\,\text{bps}$ mỗi ngày; nhân với khối lượng thanh lý ra tổng chi phí thoát (ví dụ thanh lý \$50M qua 5 ngày, mỗi ngày \$10M ở 31 bps → \$10M × 0.00313 = \$31.3K/ngày × 5 ≈ \$157K impact tổng, chưa kể spread nới). Vị thế lớn trong tên kém thanh khoản = cửa thoát hiểm hẹp; và cửa hẹp *co lại đúng lúc bạn cần nó nhất* vì thanh khoản bốc hơi trong stress (spread nới, ADV tụt, có khi ADV rơi một nửa khiến participation cap 10% giờ chỉ nuốt được nửa khối lượng cũ) — liquidity risk và crowding là anh em: khi mọi người cùng chạy ra một cửa, cửa nhỏ lại.

### Leverage & funding

**Leverage & funding**: margin từ prime broker thay đổi *procyclically* — đúng lúc thị trường tệ nhất họ đòi thêm collateral (haircut tăng, margin requirement tăng), buộc bạn bán đúng khi giá thấp nhất. LTCM 1998 là giáo trình gối đầu giường: hai Nobel laureate, mô hình đúng về dài hạn, nhưng leverage ~25x on-balance-sheet (và hơn nữa off-balance-sheet qua swaps) khiến một biến động spread lớn hơn dự phóng đủ để wipe out equity trước khi các convergence trade kịp hội tụ. Số học của họ tàn nhẫn: với 25x leverage, chỉ cần tài sản mất $1/25 = 4\%$ giá trị là equity bốc hơi sạch — mà spread trong khủng hoảng Nga di chuyển nhiều hơn 4% dễ dàng. Họ đúng — nhiều trade *đã* hội tụ sau đó — nhưng chết trước khi được chứng minh là đúng.

Định luật sống còn rút ra, đáng khắc lên tường: **thị trường có thể vô lý lâu hơn bạn có thể trả margin.** Đây là ràng buộc *funding*, tách biệt hoàn toàn với việc trade của bạn có đúng hay không. Một trade đúng 100% về mặt kinh tế vẫn giết bạn nếu path đến điểm đúng đi qua một drawdown vượt quá khả năng trả margin. Vì thế survival constraint (đủ funding buffer để sống qua path xấu nhất khả dĩ) đứng *trên* expected value trong thứ tự ưu tiên của risk manager. Kelly cho bạn điểm growth-optimal; funding constraint cho bạn trần cứng; và khi hai cái xung đột, funding luôn thắng.

## 14.3 Tail risk và Extreme Value Theory

VaR/ES historical mù với cái chưa xảy ra. Nhưng "chưa xảy ra trong 500 ngày" không có nghĩa "không thể xảy ra" — nó chỉ nghĩa cửa sổ mẫu của bạn quá ngắn để chứa nó. Extreme Value Theory (EVT) là bộ máy toán học để *ngoại suy vào đuôi*: từ những cú lỗ lớn ta *đã* thấy, ước lượng hình dạng đuôi và suy ra cú lỗ ta *chưa* thấy. Đây là thứ phân biệt một risk manager biết đọc percentile với một người hiểu đuôi.

### Vì sao Gaussian nói dối ở đuôi

Return tài chính có đuôi fat: cú sốc "6-sigma" theo Gaussian đáng ra xảy ra một lần mỗi vài triệu năm, nhưng thực tế ta thấy vài lần mỗi thập kỷ. Cụ thể hóa: dưới Gaussian, xác suất một ngày vượt −6σ là khoảng $10^{-9}$, tức trung bình một lần mỗi ~4 triệu năm giao dịch; thực tế thị trường equity chứng kiến các cú −6σ (theo vol thường ngày) vài lần mỗi thập kỷ — sai số của mô hình không phải vài phần trăm mà là nhiều bậc độ lớn. Kurtosis của daily equity return thường 5–10 (Gaussian = 3). Hệ quả: nếu bạn tính VaR bằng $\text{VaR}_\alpha = \mu + z_\alpha \sigma$ với $z_{99\%} = 2.33$, bạn *đánh giá thấp một cách hệ thống* rủi ro đuôi. EVT sửa điều này bằng cách không giả định phân phối toàn cục, mà chỉ mô hình hóa *phần đuôi* — nơi duy nhất quan trọng cho tail risk.

### Peaks-over-threshold và Generalized Pareto Distribution

Cách tiếp cận EVT hiện đại là **peaks-over-threshold (POT)**: chọn một ngưỡng $u$ đủ cao, chỉ nhìn các lỗ vượt ngưỡng $Y = L - u$ (với $L$ là độ lớn lỗ, $L > u$). Định lý Pickands–Balkema–de Haan nói: với $u$ đủ lớn, phân phối của các vượt-ngưỡng $Y$ hội tụ về **Generalized Pareto Distribution (GPD)**:
$$G_{\xi,\beta}(y) = 1 - \left(1 + \frac{\xi y}{\beta}\right)^{-1/\xi}, \quad y \ge 0,$$
với $\xi$ là **shape parameter** (chỉ số đuôi) và $\beta$ là **scale**. Diễn giải $\xi$: $\xi > 0$ đuôi power-law (fat, điển hình cho equity, $\xi \approx 0.2$–$0.4$); $\xi = 0$ đuôi mũ (Gaussian-like, lấy giới hạn $\xi \to 0$ ra $G = 1 - e^{-y/\beta}$); $\xi < 0$ đuôi hữu hạn có chặn trên. $\xi$ càng lớn, đuôi càng nguy hiểm — và với $\xi \ge 0.5$ variance là vô hạn (moment bậc hai không tồn tại), với $\xi \ge 1$ ngay cả mean cũng vô hạn. Đây không phải trò chơi toán: đo được $\xi$ gần 0.5 trên một chiến lược nghĩa là khái niệm "vol trung bình" của nó bắt đầu mất ý nghĩa, và mọi công thức sizing dựa trên $\sigma$ đều đứng trên cát.

### Công thức VaR và ES từ GPD

Đây là phần đắt giá. Một khi fit được $\xi, \beta$ cho các vượt-ngưỡng, và biết tỷ lệ $N_u/N$ số quan sát vượt ngưỡng, ta *ngoại suy* VaR và ES tới bất kỳ mức $\alpha$ nào — kể cả mức mà dữ liệu chưa từng chạm:
$$\text{VaR}_\alpha = u + \frac{\beta}{\xi}\left[\left(\frac{N}{N_u}(1-\alpha)\right)^{-\xi} - 1\right],$$
$$\text{ES}_\alpha = \frac{\text{VaR}_\alpha}{1-\xi} + \frac{\beta - \xi u}{1-\xi}.$$
Công thức ES đặc biệt quan trọng: nó cho **expected shortfall dưới đáy** — trung bình lỗ *có điều kiện* đã vượt VaR, ngoại suy vào vùng đuôi. Chú ý mẫu số $1-\xi$: khi $\xi \to 1$, ES nổ tung — đuôi quá fat đến mức lỗ kỳ vọng trong đuôi là vô hạn. Đó là cảnh báo định lượng: đo được $\xi$ gần 1 nghĩa là chiến lược có tail risk không giới hạn về mặt lý thuyết.

### EVT chạy tay — một ví dụ số đầy đủ

Đi từng bước để công thức không còn là ký hiệu trừu tượng. Giả sử ta có $N = 2000$ daily return của một chiến lược, chọn ngưỡng $u$ = lỗ 2% (nhìn vào các ngày lỗ hơn 2%). Đếm được $N_u = 100$ ngày vượt ngưỡng (5% mẫu). Fit GPD lên 100 vượt-ngưỡng bằng maximum likelihood, ra $\hat\xi = 0.3$, $\hat\beta = 0.9\%$.

**Bước 1 — VaR 99%.** Ở đây $1-\alpha = 0.01$, $N/N_u = 2000/100 = 20$, nên đối số trong ngoặc là $20 \times 0.01 = 0.2$:
$$\text{VaR}_{99\%} = 0.02 + \frac{0.009}{0.3}\left[(0.2)^{-0.3} - 1\right] = 0.02 + 0.03\left[0.2^{-0.3} - 1\right].$$
Tính $0.2^{-0.3} = e^{-0.3\ln 0.2} = e^{-0.3 \times (-1.6094)} = e^{0.4828} = 1.6207$. Vậy:
$$\text{VaR}_{99\%} = 0.02 + 0.03 \times (1.6207 - 1) = 0.02 + 0.03 \times 0.6207 = 0.02 + 0.01862 = 3.86\%.$$

**Bước 2 — ES 99%:**
$$\text{ES}_{99\%} = \frac{0.0386}{1 - 0.3} + \frac{0.009 - 0.3 \times 0.02}{1 - 0.3} = \frac{0.0386}{0.7} + \frac{0.009 - 0.006}{0.7} = 0.05517 + 0.00429 = 5.95\%.$$

Đọc kết quả: VaR 99% là 3.86%, nhưng **ES 99% là 5.95%** — khi rơi vào 1% ngày tệ nhất, lỗ trung bình gần 6%, sâu hơn VaR tới $(5.95-3.86)/3.86 = 54\%$. So sánh với Gaussian: nếu $\sigma = 1.2\%$/ngày thì Gaussian VaR 99% chỉ $2.33 \times 1.2\% = 2.80\%$ — EVT nói thật ra là 3.86%, tức Gaussian *đánh giá thấp rủi ro thật $27.6\%$* (khoảng cách $3.86-2.80=1.06$ điểm phần trăm chia cho con số đúng 3.86), hay nói cách khác EVT cao hơn Gaussian $38\%$. Và đây mới là điểm mạnh thực sự: với công thức GPD ta có thể đẩy tới VaR 99.9% (một-lần-nghìn-ngày, ~4 năm) mà *không cần* có 2000 ngày chứa cú đó — ta ngoại suy hình dạng đuôi. Thay $1-\alpha = 0.001$, đối số là $20 \times 0.001 = 0.02$:
$$\text{VaR}_{99.9\%} = 0.02 + 0.03\left[(0.02)^{-0.3} - 1\right].$$
Tính $0.02^{-0.3} = e^{-0.3\ln 0.02} = e^{-0.3 \times (-3.912)} = e^{1.1736} = 3.234$. Vậy $\text{VaR}_{99.9\%} = 0.02 + 0.03 \times (3.234 - 1) = 0.02 + 0.03 \times 2.234 = 0.02 + 0.0670 = 8.70\%$. Historical VaR đơn thuần không bao giờ cho được con số 8.7% này nếu cú đó chưa nằm trong mẫu — đuôi 99.9% đòi hỏi $\sim 4$ năm dữ liệu chỉ để có *một* điểm, còn EVT dựng nó từ 100 điểm đuôi bạn đã có. Đối chiếu: Gaussian VaR 99.9% chỉ $3.09 \times 1.2\% = 3.71\%$, tức Gaussian đánh giá thấp cú nghìn-ngày tới hơn một nửa (3.71% vs 8.70%) — càng vào sâu đuôi, lời nói dối của Gaussian càng lớn.

Một cảnh báo thực chiến về EVT: kết quả cực nhạy với lựa chọn ngưỡng $u$. Chọn $u$ quá thấp → trộn phần thân phân phối vào, vi phạm giả định GPD, $\hat\xi$ lệch. Chọn $u$ quá cao → còn quá ít điểm, $\hat\xi$ nhiễu (100 điểm đã là mỏng; xuống 30 điểm thì sai số chuẩn của $\hat\xi$ lớn tới mức con số vô nghĩa). Chuẩn hành nghề: dùng mean-excess plot (đồ thị trung bình vượt-ngưỡng theo $u$, tìm đoạn tuyến tính — GPD dự đoán mean-excess tuyến tính theo $u$ với hệ số góc $\xi/(1-\xi)$) và kiểm tra $\hat\xi$ ổn định qua một dải $u$. EVT không phải nút bấm tự động — nó là công cụ đòi hỏi judgment, nhưng là công cụ *duy nhất* cho phép nói điều gì đó có kỷ luật về vùng đuôi bạn chưa từng thấy.

## 14.4 Crowding detection — định lượng cái không nhìn thấy

Quant quake 8/2007 để lại một câu hỏi ám ảnh: làm sao đo được rủi ro mà risk model của bạn *về nguyên tắc không thể thấy*, vì nó nằm trong sổ sách của người khác? Sau 2007, cả ngành phát triển một bộ công cụ crowding detection — chuyển "crowding" từ một nỗi lo mơ hồ thành các chỉ số đo được. Đây là biên giới thực chiến của risk management buy-side hiện đại.

### Vì sao crowding là rủi ro riêng của buy-side

Crowding nguy hiểm vì nó phá vỡ hai giả định nền của risk model. Thứ nhất, nó làm **correlation nhảy vọt trong stress**: các tên trong cùng crowded trade bình thường correlation vừa phải, nhưng khi deleveraging bắt đầu, chúng cùng bị bán bất kể fundamentals → correlation vọt về gần 1, đúng lúc bạn cần diversification nhất thì nó biến mất. Đây chính là cơ chế đã định lượng ở 14.1: correlation từ 0 lên 0.8 cắt tổng Kelly leverage 44% — nhưng trong stress correlation không dừng ở 0.8, nó chạy về 0.95+, nghĩa là danh mục bạn tưởng đa dạng hóa thực chất đang chạy như một cược đơn với size gấp nhiều lần Kelly cho phép. Thứ hai, nó tạo **reflexivity**: chính hành động thoát của đám đông làm giá tệ đi, kích hoạt thêm stop, tạo vòng xoáy — cái mà không mô hình dựa trên giá lịch sử nào bắt được vì nó nội sinh với positioning. Diversification bạn *tưởng* có (correlation lịch sử thấp) bốc hơi đúng lúc cần.

### Tín hiệu 1 — 13F holdings overlap

Ở Mỹ, các quỹ quản trên \$100M phải nộp form **13F** hàng quý, công khai vị thế long equity. Đây là cửa sổ (trễ và không hoàn hảo — không có short, trễ 45 ngày) để nhìn positioning của đồng nghiệp. Cách dùng định lượng: với mỗi cổ phiếu, đo **institutional ownership concentration** và tỷ trọng nắm giữ bởi các hedge fund cùng phong cách. Một thước đo phổ biến là tỷ lệ vốn hóa được nắm bởi nhóm quỹ có turnover/style giống nhau.

Ví dụ số: cổ phiếu A có 40% float nắm bởi hedge funds momentum-style theo 13F; cổ phiếu B chỉ 8%. Cùng một tín hiệu momentum dương cho cả hai, nhưng A **crowded** hơn 5 lần — nếu momentum unwind, A chịu áp lực bán tập trung lớn hơn nhiều. Định lượng thành sizing: nếu bạn tin rằng impact khi unwind tỷ lệ với lượng holding cùng chiều phải thoát, thì áp lực bán trên A gấp $40/8 = 5$ lần B; để cân bằng rủi ro-thoát, bạn nên size vị thế A *nhỏ hơn* dù tín hiệu mạnh ngang B — chẳng hạn cắt A còn $1/\sqrt{5} \approx 0.45$ lần size B nếu impact scale theo căn của khối lượng dồn thoát (square-root impact của chương 13). Một chỉ số tổng hợp: crowding score của danh mục = trung bình có trọng số của institutional-overlap trên các vị thế; ví dụ danh mục có 60% vốn ở các tên overlap >30% → crowding score cao, cờ đỏ đòi cắt gross hoặc đa dạng hóa nguồn alpha.

### Tín hiệu 2 — factor congestion và co-movement

Cách thứ hai không cần 13F, đọc trực tiếp từ giá: đo **mức độ các factor return tự tương quan bất thường**. Trong regime bình thường, các style factor (value, momentum, size...) có correlation khiêm tốn với nhau. Khi tiền đổ dồn vào cùng vài factor, chúng bắt đầu **co-move** — một dấu hiệu là eigenvalue lớn nhất của ma trận correlation giữa các factor tăng vọt (nhiều variance dồn vào một chiều chung), đúng công cụ RMT của chương 6 áp cho không gian factor.

Ví dụ số: với 10 factor, nếu chúng hoàn toàn không tương quan thì ma trận correlation là ma trận đơn vị, mọi eigenvalue = 1, eigenvalue đầu tiên giải thích đúng $1/10 = 10\%$ variance. Trong regime bình thường eigenvalue đầu tiên thực tế giải thích khoảng 25% tổng variance (correlation vừa phải giữa các factor). Khi crowding lên đỉnh, nó nhảy lên 45% — nghĩa là gần một nửa biến động của mười factor "đáng lẽ độc lập" bị kéo bởi một dòng tiền chung, và một cú deleveraging sẽ đánh đồng loạt cả mười. Chỉ số này là *early warning*: nó lên trước khi crowd tháo chạy, vì positioning dồn lại trước khi bị buộc xả. Bổ sung, ta đo **valuation spread của factor** (ví dụ momentum: giá long leg đắt tương đối bao nhiêu so với lịch sử) — spread nới rộng cực đại là dấu trade đã quá đông, dry powder cạn, dễ đảo chiều. Momentum crash 2009 đến sau một giai đoạn momentum spread căng kỷ lục: đám đông đã dồn hết vào một phía trước khi cú lật diễn ra, và khi thị trường quay đầu tháng 3/2009, short leg (các tên rơi mạnh nhất 2008) bật +80% khiến long-short momentum lỗ thảm.

### Từ chỉ số đến hành động

Crowding score không phải để ngắm mà để *đổi hành vi*. Khi score vượt ngưỡng: (i) cắt gross ở các vị thế crowded nhất; (ii) đa dạng hóa sang nguồn alpha ít tương quan với crowd (idiosyncratic, alt-data độc quyền — cái mà 13F không thấy); (iii) tăng thanh khoản đệm để không phải bán vào vòng xoáy; (iv) đặt correlation trong stress test về gần 1 cho nhóm crowded (nối sang mục 14.5). Triết lý gói gọn: alpha ít giá trị nếu ai cũng có nó cùng lúc — **edge thật là edge ít người đứng chung**, và crowding detection là cách đo "ít người" đó bằng số thay vì cảm giác.

## 14.5 Stress testing — behavioral framework

VaR/ES và cả EVT đều ngoại suy từ *phân phối* return. Nhưng cú chết buy-side hiếm khi là một con số percentile — nó là một *kịch bản*: funding rút, correlation về 1, đồng nghiệp cùng vị thế tháo chạy. Stress testing là nơi ta rời khỏi thống kê thuần và bước vào **kịch bản có cấu trúc**. Điểm khác biệt cốt lõi với sell-side: buy-side stress *hành vi* nhiều hơn *giá* — không phải "giá rơi bao nhiêu" mà "khi giá rơi, hệ thống funding và positioning phản ứng thế nào".

### Hai loại stress test

**Loại 1 — replay lịch sử.** Áp danh mục hiện tại vào các cửa sổ khủng hoảng đã biết: 2008 (Lehman), 3/2020 (COVID crash), 2022 (rate shock + growth unwind), và cả 8/2007 (quant quake) cho các chiến lược factor. Ưu điểm: kịch bản thật, correlation và co-movement thật đã xảy ra. Nhược: chỉ có vài cú lịch sử, và như đã nói ở 14.2, danh mục hôm nay khác danh mục lúc đó nên phải áp exposure hiện tại vào return factor lịch sử chứ không dùng thẳng P&L cũ.

**Loại 2 — kịch bản giả định (hypothetical).** Bịa các cú chưa từng xảy ra nhưng khả dĩ: correlation của toàn danh mục nhảy về 1 (mọi diversification biến mất), credit spread nổ gấp 3, prime broker tăng haircut từ 15% lên 30%, thanh khoản nửa danh mục bốc hơi. Đây là nơi EVT và crowding detection cắm vào: dùng $\hat\xi$ để định cỡ cú giá cực đại khả dĩ (ví dụ VaR 99.9% = 8.7% ta vừa tính ở 14.3 làm biên độ shock giá cho một chiến lược), dùng crowding score để quyết định nhóm nào set correlation về 1.

### Behavioral stress — ba câu hỏi funding-first

Đây là phần sâu nhất của stress test, và là thứ phân biệt stress test buy-side trưởng thành với bài tập tô màu VaR. Ba câu hỏi phải trả lời được bằng số, không phải cảm tính:

**Câu hỏi 1 — Funding có rút được không?** Mô hình margin call dây chuyền. Ví dụ số: danh mục gross \$200M trên equity \$50M (leverage 4x). Kịch bản: mất 8% NAV trong 3 ngày → equity mất $\$50\text{M} \times 8\% = \$4\text{M}$, còn \$46M, nhưng đồng thời prime broker tăng margin requirement từ 25% lên 35% (procyclical). Margin cần: $\$200\text{M} \times 35\% = \$70\text{M}$, nhưng equity chỉ \$46M → **thiếu \$24M**. Để margin cần tụt về khớp equity \$46M, gross phải co về $\$46\text{M}/0.35 = \$131.4\text{M}$, tức **bán \$200M − \$131.4M = \$68.6M gross** vào thị trường stress. Bán \$68.6M vào thị trường đang rơi → thêm impact → thêm lỗ → vòng lặp. Con số \$24M shortfall này là thứ VaR không bao giờ cho bạn — nó là tương tác giữa giá và cấu trúc funding, không phải một percentile của return.

**Câu hỏi 2 — Margin call dây chuyền tới đâu?** Lặp vòng trên và đo hội tụ. Vòng 1: bán \$68.6M ở 40 bps impact → lỗ thêm $\$68.6\text{M} \times 0.004 = \$0.274\text{M}$ lên equity, equity còn \$45.73M. Vòng 2: margin cần trên gross \$131.4M là \$46.0M nhưng equity chỉ còn \$45.73M → thiếu \$0.27M, phải bán thêm \$0.78M gross, lỗ impact \$0.003M. Vòng 3: bán thêm chỉ \$0.009M. Chuỗi bán co lại nhanh (\$68.6M → \$0.78M → \$0.009M) — **cascade hội tụ** khi impact nhỏ và bạn bán một mình. Nhưng nếu các tên bị bán là crowded và ta nhân impact ×3 (câu hỏi 3), vòng 2 phải bán \$2.35M thay vì \$0.78M — cascade dài hơn gấp ba, và nếu impact đủ lớn hoặc leverage đủ cao, chuỗi này *không hội tụ* mà chạy tới wipe-out. Đo số vòng lặp đến khi ổn định (hoặc đến khi equity chạm 0) chính là stress test thật; con số quan trọng không phải "lỗ ngày 1" mà "cascade dừng ở đâu".

**Câu hỏi 3 — Ai cùng vị thế với mình?** Dùng crowding score (14.4): nếu các tên bị bán là crowded, giả định *các quỹ khác cũng đang bán cùng lúc*, nhân impact lên. Ta vừa thấy ×3 impact biến cascade vòng-2 từ \$0.78M lên \$2.35M — nhân tố crowding là thứ quyết định cascade hội tụ hay nổ. Đây là kết nối trực tiếp quant-quake: cú 8/2007 không phải giá rơi mà là *tất cả cùng bán một lúc*, khiến impact thực tế lớn gấp nhiều lần cost model một-mình dự phóng. Behavioral stress phải encode giả định "tôi không bán một mình" — và crowding score cho bạn con số để chọn hệ số nhân đó thay vì bốc đại.

### Kết quả stress dẫn về sizing

Vòng tròn khép lại: stress test không phải báo cáo để nộp mà là *input cho sizing* (14.1). Nếu stress cho thấy kịch bản khả dĩ đưa danh mục tới margin shortfall (như \$24M ở câu hỏi 1) hoặc cascade không hội tụ (câu hỏi 2), thì leverage hiện tại quá cao *bất kể* Kelly nói gì — survival constraint override growth optimization. Cụ thể: đặt gross sao cho *ngay cả trong kịch bản stress tệ nhất khả dĩ*, equity còn đủ trả margin với haircut procyclical và cascade hội tụ nông. Nếu ví dụ trên khiến bạn khó chịu, hãy hạ leverage khởi đầu từ 4x xuống 3x: cùng cú −8% NAV, margin cần $\$150\text{M} \times 0.35 = \$52.5\text{M}$ so với equity \$46M chỉ thiếu \$6.5M thay vì \$24M — cascade nông hơn nhiều lần. Đây là lý do half-Kelly ở 14.1 thường còn bị cắt thêm trong thực tế: không phải vì $\mu$ bất định, mà vì funding path phải sống sót.

## 14.6 Risk như một hàm sản xuất

Ở quỹ tốt, risk không phải cảnh sát mà là **cấu phần của alpha**: risk model tốt → dám leverage đúng chỗ → IR cao hơn với cùng tín hiệu. Điều này lật ngược trực giác người mới, vốn xem risk management là phanh hãm alpha. Thực ra một risk model tốt là *bàn đạp ga có kiểm soát*: nó cho bạn biết chỗ nào an toàn để đạp mạnh (uncorrelated bets, thanh khoản tốt, crowding thấp) và chỗ nào phải nhả (crowded, illiquid, đuôi fat). Với cùng một rổ tín hiệu, người có risk model tốt hơn chạy được gross cao hơn ở đúng chỗ và thu IR cao hơn — risk model *là* nguồn edge.

Cho con số vào lập luận này. Nhớ Fundamental Law của chương 5: $IR \approx IC \times \sqrt{BR}$. Giả sử hai PM cùng $IC = 0.05$, cùng phổ tín hiệu. PM thứ nhất có risk model thô, không tách được crowding và correlation ẩn, nên chỉ dám chạy $BR = 100$ cược *thực sự độc lập* (phần còn lại bị correlation ăn mất, không đóng góp breadth) → $IR \approx 0.05\sqrt{100} = 0.5$. PM thứ hai có risk model tốt, đo được crowding và phân bổ vào các nguồn alpha ít tương quan, nâng breadth hiệu dụng lên $BR = 400$ → $IR \approx 0.05\sqrt{400} = 1.0$. Cùng skill chọn cược ($IC$ y hệt), risk model tốt hơn nhân đôi IR — không phải bằng cách kiếm alpha giỏi hơn, mà bằng cách *bảo toàn breadth* trước con quỷ correlation. Đó là nghĩa đen của "risk model là nguồn edge".

Hệ quả cho cách đọc performance: đọc **cặp số (return, risk đã dùng)** chứ đừng đọc return trần. Một PM Sharpe 2 với gross 4x kém ấn tượng hơn nhiều so với PM Sharpe 2 với gross 1.5x và headroom còn nguyên — người thứ nhất đã đốt hết dây cương risk để đạt con số đó và không còn chỗ scale, người thứ hai còn nguyên khả năng nhân đôi vốn khi tự tin hơn. Định lượng: quy về return trên mỗi đơn vị gross, PM thứ hai tạo ra $Sharpe/gross$ cao gấp $4/1.5 = 2.7$ lần — mỗi đô-la rủi ro của anh ta hiệu quả gần gấp ba. Đây cũng là cách allocator (mục 18) chấm PM: không phải "kiếm được bao nhiêu" mà "kiếm được bao nhiêu *trên mỗi đơn vị rủi ro và mỗi đơn vị headroom còn lại*".

Và đây là vòng khép cuối của toàn chương. Sizing (14.1) đặt cỡ dựa trên edge và bất định; đo lường (14.2) và tail/EVT (14.3) nói cho biết rủi ro thật là bao nhiêu; crowding (14.4) tiết lộ rủi ro ẩn ngoài sổ sách; stress (14.5) kiểm tra sống sót qua path xấu nhất; và mục này gắn tất cả lại thành một hàm sản xuất. Quỹ chết vì bỏ một mắt xích — thường là mắt xích crowding hoặc funding mà con số VaR đẹp đẽ che mất. Người sống sót là người coi risk management không phải chi phí phải trả để chơi, mà là chính cỗ máy biến alpha thành compound bền vững.

# Chương 15: Bản đồ các chiến lược

Một quant researcher mới hay hỏi câu sai: "chiến lược nào tốt nhất?" Câu đúng là "chiến lược nào *sống ở đâu* — ai trả tiền, trả bao nhiêu, giữ được bao nhiêu vốn trước khi impact ăn hết, và nó chết vì lý do gì?" Mỗi họ chiến lược là một hệ sinh thái riêng: có economics riêng, có kẻ nuôi nó, có kẻ giết nó. Chương này vẽ tấm bản đồ đó — đi qua từng loài, chỉ ra cơ chế kiếm tiền và cơ chế chết, rồi khép lại bằng câu hỏi thực sự quan trọng mà chỉ các quỹ lớn mới trả lời được: làm sao *tổ hợp* hàng chục loài này thành một cỗ máy phân bổ vốn nặn ra Sharpe 2+ (rồi leverage thành cỗ máy compound mạnh nhất tài chính) từ những mảnh Sharpe 0.7 tầm thường.

Trước khi vào chi tiết, hãy neo lại một khung tư duy thống nhất từ chương 6: mọi return kỳ vọng đến từ đúng một trong ba nguồn. **Risk premium** — bạn được trả để giữ rủi ro người khác muốn né (carry, vol selling, credit). **Behavioral/structural** — bạn khai thác lỗi hệ thống của người khác (momentum under-reaction, disposition effect, dòng vốn bắt buộc). **Liquidity provision** — bạn cho người vội một chỗ khớp và ăn spread (market making, mean reversion ngắn hạn). Mỗi loài dưới đây rơi vào một hoặc vài ô đó. Đây không phải phân loại học thuật cho vui: nó là bài kiểm tra sinh tồn. Khi bạn không kể được câu chuyện "ai trả tiền cho alpha này và vì sao nó chưa bị arbitrage biến mất", bạn không có strategy — bạn có một backtest, và backtest thì không trả lương.

## 15.1 Bảng loài — mười một họ chiến lược

| Chiến lược | Ý tưởng cốt lõi | Horizon | Sharpe điển hình | Capacity | Chương liên quan |
|---|---|---|---|---|---|
| **Statistical arbitrage** | Mean reversion của residual sau khi trừ factor; hàng nghìn tên, dollar/factor-neutral | phút–tuần | 1.5–3+ | Trung bình | 3, 5, 6, 9 |
| **Pairs trading** | Cointegration 2 tên; OU trên spread | ngày–tháng | về gần 0 với cặp lộ liễu; sống ở biến thể | Nhỏ | 3.3 |
| **Equity market neutral (factor)** | Long/short theo composite alpha (value+momentum+quality...) | tuần–tháng | 0.7–1.5 | Lớn | 5, 6, 8 |
| **Trend following (CTA)** | Time-series momentum trên ~60–100 futures markets | tuần–tháng | 0.4–0.8 đơn lẻ; giá trị = convexity khủng hoảng ("crisis alpha" 2008, 2022) | Rất lớn | 6.3 |
| **Carry (đa tài sản)** | Nhận yield cao trả yield thấp (FX, bonds, commodities, vol) | tháng | 0.5–1; skew âm ("nhặt xu trước xe lu") | Lớn | 6.3 |
| **Market making** | Ăn spread, quản inventory + adverse selection | giây–giờ | 5–10+ | Nhỏ/tên | 12, 13 |
| **HFT arb** | Latency, cross-venue, ETF-NAV, futures-spot | ms–giây | rất cao | Rất nhỏ | 12 |
| **Event-driven quant** | PEAD, index rebalance, M&A spread, buybacks | ngày–tháng | 1–2 | Trung bình | 6.3 |
| **Global macro systematic** | Vị thế directional đa tài sản theo tín hiệu vĩ mô (growth/inflation nowcast, flow) | tháng–quý | 0.5–1 | Rất lớn | 6.2 (breadth thấp!) |
| **Vol trading (P-side)** | Variance risk premium (implied > realized một cách hệ thống), relative value trên surface | ngày–tháng | 1–2, skew âm sâu | Trung bình | Q-world ch.5–6 |
| **Crypto quant** | Mọi loài trên, thị trường non: funding basis, cross-exchange arb, MM | ms–tuần | cao nhưng decay nhanh + rủi ro hạ tầng (sàn sập) | Nhỏ–TB | 2, 16 |

Bảng này là bản đồ, không phải bảng xếp hạng. Đọc nó theo bốn trục cùng lúc. **Horizon** quyết định bạn cạnh tranh với ai: horizon mili-giây là cuộc đua hạ tầng với vài chục hãng HFT toàn cầu; horizon tháng là cuộc đua ý tưởng với hàng nghìn quỹ. **Sharpe điển hình** đơn lẻ là cột dễ gây hiểu lầm nhất — sẽ nói kỹ ở 15.13 vì sao Sharpe 0.6 của một CTA có thể quý hơn Sharpe 2 của một stat-arb. **Capacity** là mức AUM tối đa trước khi chính bạn phá nát edge của mình bằng impact; nó là biến quyết định giữa "một góc kiếm ăn cá nhân" và "một business tỷ đô". Và **kỹ năng đòi hỏi** — cột ẩn — trải từ toán stochastic (vol), econometrics (stat-arb), tới kỹ thuật hệ thống thời gian thực (HFT) và đọc hiểu dòng vốn (event-driven, macro). Không loài nào thắng trên cả bốn trục; chọn loài là chọn xem bạn muốn thua ở trục nào.

Mười một mục tiếp theo mở từng dòng bảng: cơ chế chi tiết, ai trả tiền, capacity nằm ở đâu và vì sao, decay ra sao, kỹ năng nào là điều kiện sống. Xen giữa là các case study chạy số để bản đồ có da thịt — vì một dòng bảng không chạy ra tiền được, chỉ một phép tính mới cho bạn thấy edge thật sự lớn cỡ nào và mong manh cỡ nào.

## 15.2 Statistical arbitrage — cỗ máy mean-reversion của residual

Stat-arb là loài định nghĩa nên hình ảnh "quant" trong đầu công chúng, và cũng là nơi các factory kiểu Renaissance sinh ra nhiều tiền nhất trên mỗi giờ. Cơ chế cốt lõi: lấy return của mỗi cổ phiếu, **trừ đi phần giải thích được bởi các factor chung** (market, sector, size, value, momentum — chương 5, 6), phần dư còn lại là *residual*. Residual có xu hướng **mean-revert** trong ngắn hạn (giờ đến ngày): một cổ phiếu bật 3% hôm nay không phải vì tin cơ bản mà vì một lệnh mua lớn đẩy giá, sẽ có xu hướng trôi ngược về đường factor khi lệnh đó tiêu hoá xong. Bạn short cái đang lệch dương, long cái đang lệch âm, đồng thời trên hàng nghìn tên, giữ danh mục dollar-neutral và factor-neutral tuyệt đối.

Ai trả tiền? Chủ yếu là **liquidity demanders**: một mutual fund phải bán 200M cổ phiếu vì nhà đầu tư rút tiền, một index fund tái cân bằng, một retail flow đổ vào tên đang nóng. Họ *cần* thanh khoản ngay và sẵn sàng trả giá bằng cách đẩy giá tạm thời lệch khỏi giá trị. Stat-arb là người cung cấp thanh khoản đó và ăn phần đảo ngược. Đây thực chất là risk premium của việc *ôm rủi ro tồn kho* (inventory risk) trong vài giờ đến vài ngày: đôi khi cái bạn tưởng là noise hoá ra là tin thật, và bạn đang đứng sai phía của một cú re-pricing vĩnh viễn.

Chạy số một tên cụ thể để thấy toàn bộ pipeline. Cổ phiếu XYZ có market beta $\beta_m = 1.1$ và sector-tech loading $\beta_s = 1.0$ (đo bằng regression trên chuỗi lịch sử — chương 6). Ta dùng mô hình hai factor cho return kỳ vọng: $\hat r = \beta_m r_m + \beta_s r_s^{\perp}$, trong đó $r_s^{\perp}$ là *return sector đã trừ phần market* để không đếm market hai lần. Hôm nay $r_m = +0.5\%$, sector tech thô $+1.2\%$; sector-tech có beta thị trường ~1.35 nên phần sector "sạch" $r_s^{\perp} = 1.2\% - 1.35 \times 0.5\% = 1.2\% - 0.675\% \approx +0.53\%$. Return dự đoán của XYZ:

$$\hat r = 1.1 \times 0.5\% + 1.0 \times 0.53\% = 0.55\% + 0.53\% = +1.08\% \approx +1.1\%.$$

XYZ thực tế in $+2.8\%$, nên **residual $= 2.8\% - 1.1\% = +1.7\%$**. (Chi tiết factor thay đổi con số ở chữ số thập phân, nhưng bức tranh không đổi: XYZ chạy nhanh hơn nhiều so với những gì factor giải thích được — nó "đắt tương đối" trong vài giờ tới.) Std của residual daily lịch sử của XYZ là $\sigma_\varepsilon = 1.8\%$, nên z-score $z = 1.7/1.8 = 0.94$. Ngưỡng vào $|z| > 0.7$: bạn short XYZ với size tỷ lệ $-z$.

Bây giờ derive kỳ vọng P&L trên tên này. Half-life mean-reversion của residual đo được $\approx 1.5$ ngày — nhanh hơn hẳn pairs, vì đây là mất cân bằng vi mô chứ không phải quan hệ cơ bản. Nếu residual revert theo OU với half-life $h = 1.5$ ngày, sau một ngày nó co lại còn $2^{-1/1.5} = 2^{-0.667} = 0.63$ lần giá trị ban đầu, tức revert được $1 - 0.63 = 37\%$ của $1.7\%$, khoảng $+0.63\%$ về hướng có lợi cho vị thế short; giữ hai ngày bắt được $1 - 2^{-2/1.5} = 1 - 0.40 = 60\%$, tức $\approx +1.0\%$ gross trên tên. Trên **một** tên, con số này bé và đầy noise — residual cũng có thể tiếp tục lệch xa hơn. Sức mạnh nằm ở **breadth**: nhân cược này lên vài nghìn tên mỗi ngày, mỗi cái một IC bé xíu nhưng độc lập một phần. Theo Fundamental Law (chương 6), $IR \approx IC \times \sqrt{BR}$. Với $IC = 0.03$ và $BR$ cỡ hàng chục nghìn cược độc lập/năm (nghìn tên × vài trăm ngày × turnover cao), $\sqrt{BR}$ dễ dàng đạt $\sqrt{50\,000} \approx 224$, đẩy $IR = 0.03 \times \sqrt{50\,000}$ về vùng... rõ ràng phi thực tế nếu các cược thật sự độc lập — mà chúng không. Cross-sectional correlation giữa các residual cắt $BR$ hiệu dụng xuống mạnh; con số thực tế sau khi chiết khấu correlation rơi vào $IR$ 2–3. Đó chính là toán học đằng sau Sharpe cao của loài này: không phải mỗi cược giỏi, mà là *rất nhiều cược tầm thường gần trực giao*.

Capacity nằm ở **impact**. Bạn phải trade khối lượng lớn để hiện thực hoá alpha bé, mà trade lớn thì đẩy giá chống lại chính mình (chương 13). Half-life 1.5 ngày nghĩa là turnover cực cao — vài trăm phần trăm mỗi tuần — nên chi phí thực thi là kẻ thù số một: một chiến lược Sharpe-3-trước-phí có thể thành Sharpe-0.5-sau-phí nếu execution kém. Decay đến từ **crowding**: khi nhiều hãng cùng chạy cùng một residual model, họ cùng short cùng tên, giá revert nhanh hơn (tốt cho ai vào trước) rồi cạn kiệt (edge biến mất cho người đến sau). Kỹ năng đòi hỏi: econometrics để dựng factor model sạch, risk model chính xác (một sai lệch neutral nhỏ tích lũy thành exposure chết người qua hàng nghìn tên), và trên hết là **execution infrastructure**. Stat-arb thắng bằng vận hành, không bằng ý tưởng độc.

## 15.3 Pairs trading — case study một vòng đời

Pairs là ông tổ của stat-arb, đơn giản đến mức dạy được trong một buổi, và cũng chính vì thế mà bản gốc lộ liễu của nó đã chết. Nhưng vòng đời của một trade pairs là bài học đẹp nhất về mean reversion, nên ta chạy trọn nó bằng số.

**Pairs trade một vòng đời.** Hai cổ phiếu nước giải khát cointegrated, hedge ratio $\gamma = 1.2$ (ước lượng động bằng Kalman, chương 3), spread $X_t = P_A - \gamma P_B$ chuẩn hoá có $\mu = 0$, $\sigma = 2.4\%$, half-life 14 ngày. Ngày 0: spread lệch $z = +2.1$ (tên A đắt tương đối so với B) → short 1.2M USD tên A, long 1M USD tên B (theo $\gamma$, dollar-neutral xấp xỉ). Ngày 16: spread về $z = 0.3$ → đóng. Bạn bắt được $2.1 - 0.3 = 1.8$ đơn vị $z$, mỗi đơn vị $z$ ứng với $\sigma = 2.4\%$ của notional:

$$\text{P\&L}_{\text{gross}} \approx 1\text{M} \times 2.4\% \times (2.1 - 0.3) = 1\text{M} \times 0.024 \times 1.8 = \$43{,}200.$$

Phí 4 chân (vào 2 chân, ra 2 chân) × ~5bps mỗi chân trên ~1M notional $\approx \$4\text{k}$ → **ròng $\approx \$39\text{k}$**. Kịch bản xấu: một tên bị thâu tóm, spread nhảy vĩnh viễn $+8\%$ khỏi quan hệ cointegration → bạn stop tại $z = 4$, lỗ $\approx 1\text{M} \times 2.4\% \times (4 - 2.1) \approx \$45\text{k}$. Một cú stop nuốt trọn một vòng thắng — nên tỷ lệ thắng phải cao, và **tin M&A phải nằm trong bộ lọc** (loại ngay những cặp đang có tin đồn deal). Nhân bài này lên 200 cặp ít tương quan → bạn có stat-arb sơ khai.

Điều đáng đào sâu hơn bản gốc là **kinh tế học của cái stop**. Với half-life 14 ngày, spread là một Ornstein-Uhlenbeck process $dX = -\kappa X\, dt + \sigma_{OU}\, dW$ với $\kappa = \ln 2 / 14 \approx 0.0495$/ngày. Vào ở $z = 2.1$, kỳ vọng bắt được toàn bộ $2.1\sigma$ nếu nó revert hoàn toàn; nhưng phân phối của các đường đi từ $z=2.1$ không đối xứng quanh kết cục — một tỷ lệ nhỏ đường sẽ *phân kỳ* thêm trước khi (hoặc thay vì) hội tụ, và đúng chỗ đó cái stop cắn. Giả sử thực nghiệm cho tỷ lệ thắng 70% với lãi trung bình \$39k, tỷ lệ thua 30% với lỗ trung bình \$45k. Kỳ vọng mỗi trade:

$$\mathbb{E}[\text{P\&L}] = 0.70 \times 39\text{k} - 0.30 \times 45\text{k} = 27.3\text{k} - 13.5\text{k} = +\$13.8\text{k}.$$

Dương — nhưng mong manh đến rợn người. Chỉ cần win-rate tụt từ 70% xuống 62%, kỳ vọng về $0.62 \times 39 - 0.38 \times 45 = 24.2 - 17.1 = +\$7.1\text{k}$; xuống 55% còn $0.55 \times 39 - 0.45 \times 45 = 21.5 - 20.3 = +\$1.2\text{k}$ — gần như hết sạch edge. Độ nhạy này chính là lý do pairs cổ điển chết: khi cointegration relationship suy yếu (structural break — chương 4), win-rate trôi vài điểm phần trăm mà bạn *không nhận ra* cho tới khi drawdown đã tích đủ dày, vì mỗi trade lẻ vẫn trông bình thường. Đây là cái bẫy tinh vi hơn một tín hiệu sai lộ liễu: tín hiệu vẫn "đúng" 55% số lần, chỉ là 55% không còn đủ trả cho cái đuôi 45%. Pairs sống được ngày nay không phải ở "tìm cặp tương quan" — mọi screener đều nhả ra cùng những cặp đó — mà ở biến thể: cointegration đa biến (một tên vs một rổ, chương 3), phát hiện break sớm để rút trước khi win-rate xói mòn, hoặc pairs trong ngóc ngách kém thanh khoản mà screener của các quỹ lớn bỏ qua.

## 15.4 Equity market neutral (factor) — công nghiệp hoá các premium công khai

Đây là loài "công nghiệp" nhất bản đồ: bạn không săn edge độc quyền mà **thu hoạch một cách kỷ luật các factor premium đã công khai** (value, momentum, quality, low-vol, profitability — chương 6) và ghép chúng thành một composite alpha, rồi xây danh mục long-short dollar/beta/sector-neutral. Sharpe đơn lẻ của mỗi factor khiêm tốn (0.3–0.6), và các factor có những năm tồi tệ đồng loạt (2018–2020 là "factor winter" khét tiếng của value và momentum). Nhưng ghép nhiều factor ít tương quan lại theo Fundamental Law cho Sharpe tổ hợp 0.7–1.5 — và điều then chốt là điều đó làm được *một cách lặp lại, có kỷ luật, ở quy mô lớn*, khác hẳn săn edge độc.

Ai trả tiền? Tùy factor, và mỗi câu chuyện là một loại nguồn khác nhau. Value: bạn được trả để ôm những công ty "chán" mà mọi người sợ — risk premium cho distress cộng với behavioral extrapolation quá mức của người khác (họ ngoại suy quá khứ xấu thành tương lai xấu). Momentum: disposition effect và under-reaction (chương 8) — người ta bán quá sớm cổ phiếu đang lên, để lại drift cho bạn nhặt. Quality: preference của nhà đầu tư cho lottery-tickets khiến cổ phiếu chất lượng, "buồn tẻ" bị định giá thấp một cách hệ thống. Điểm chung sinh tử: đây phần lớn là **risk premium + behavioral**, không phải arbitrage — nên chúng *không biến mất* (bạn không thể arbitrage một risk premium đi được), chỉ **crowded** khiến return kỳ vọng giảm và các factor đồng pha hơn khi mọi người cùng deleverage.

Chạy số Fundamental Law cho tổ hợp — đây là phép tính trung tâm của cả loài. Ba tín hiệu — value, momentum, quality — mỗi cái $IC = 0.03$ trên horizon tháng, correlation P&L từng đôi $\rho \approx 0.2$. Nếu ba tín hiệu độc lập hoàn toàn, composite IC scale theo $\sqrt{3} \times 0.03 = 0.052$. Nhưng chúng có tương quan, nên phải hiệu chỉnh. Với $n$ tín hiệu IC bằng nhau và correlation chung $\rho$, IC tổ hợp (chuẩn hoá) là $IC_{\text{comp}} = IC_1 \times \sqrt{n / (1 + (n-1)\rho)}$. Thay số:

$$IC_{\text{comp}} = 0.03 \times \sqrt{\frac{3}{1 + 2 \times 0.2}} = 0.03 \times \sqrt{\frac{3}{1.4}} = 0.03 \times 1.464 = 0.044.$$

Bây giờ nhân với breadth. Danh nghĩa $BR = 1000$ tên × 12 rebalance/năm $= 12\,000$ cược. Nhưng cổ phiếu tương quan chéo nặng nề, nên breadth *hiệu dụng* thấp hơn nhiều — gọi $BR_{\text{eff}} \approx 500$ (một quy tắc ngón tay: universe càng tương quan, $BR_{\text{eff}}$ càng co so với số cược danh nghĩa). Khi đó:

$$IR = IC_{\text{comp}} \times \sqrt{BR_{\text{eff}}} = 0.044 \times \sqrt{500} = 0.044 \times 22.4 = 0.98.$$

Đọc con số này cho kỹ, vì nó là chiến lược trung tâm của mọi quant equity shop: **breadth đến từ ghép nhiều tín hiệu ít tương quan × nhiều tên, không từ việc làm IC to hơn.** Cải thiện IC từ 0.03 lên 0.035 là cực khó (chương 7) — bạn đấu với hàng nghìn bộ óc trên cùng một dữ liệu công khai. Nhưng thêm một tín hiệu thứ tư correlation thấp là đòn bẩy *có sẵn*, và nó nâng $IR$ mà không cần bạn thông minh hơn ai. Đó là lý do triết lý của loài này không phải "một alpha thần thánh" mà "một *bộ sưu tập alpha tầm thường trực giao*" — và vì sao các shop này tuyển người theo khả năng đẻ ra tín hiệu mới correlation thấp, chứ không theo khả năng tinh chỉnh một tín hiệu cũ.

Capacity của loài này **lớn** (nhiều tỷ USD) vì horizon dài (turnover thấp → impact thấp) và universe rộng (large-cap thanh khoản cao). Đây là lý do AQR, DFA, và hàng loạt "smart beta" ETF chạy chiến lược này ở quy mô hàng chục tỷ. Cái giá của capacity lớn là Sharpe khiêm tốn và những mùa đông factor kéo dài hàng năm thử thách kỷ luật của nhà đầu tư — value winter 2018–2020 khiến không ít quỹ đóng cửa đúng đáy, ngay trước khi value bật lại 2021–2022. Kỹ năng đòi hỏi: portfolio construction sạch (neutral constraints, risk model — chương 11), và bản lĩnh tâm lý giữ hệ thống qua drawdown nhiều năm — thứ khó hơn bất kỳ dòng code nào.

## 15.5 Trend following (CTA) — case study crisis alpha

**Hệ trend following 40 dòng code.** Universe: ~60 futures thanh khoản (equity index, bond, FX, commodity). Tín hiệu: $s_i = \text{sign}(\text{return 12 tháng})$ của market $i$. Vị thế: $w_i = s_i \times \dfrac{10\%/\sqrt{60}}{\hat\sigma_i}$ — mỗi market một risk budget bằng nhau, vol-scaled, carry bằng công thức chứ không cần ý kiến của ai. Rebalance tuần. Kết quả tái lập được trên 30+ năm dữ liệu: Sharpe ~0.6–0.8, gần như không tương quan equity, và **dương lớn 2008 ($+20$ đến $+30\%$) và 2022** — đúng nghĩa "crisis alpha". Trend *là* một long straddle mà bạn trả góp phí bằng những năm đi ngang lỗ vặt. Toàn bộ giá trị của một CTA tỷ đô so với 40 dòng này nằm ở execution, risk overlay, và kỷ luật giữ hệ thống qua 3 năm flat khi khách hàng đòi rút — không phải ở tín hiệu, vốn tầm thường ai cũng biết.

Đào sâu cái ẩn dụ "long straddle", vì hiểu nó là hiểu vì sao loài này tồn tại. Vì sao trend following có **convexity dương** — kiếm đậm ở đuôi, mất vặt ở giữa? Xét một thị trường đi vào xu hướng lớn (oil sập từ \$100 xuống \$40 năm 2014, hay bond rally dữ dội 2008). Tín hiệu $\text{sign}(\text{12m return})$ chuyển sang short/long *sớm* trong xu hướng và **giữ nguyên** cho tới khi xu hướng đảo. Nếu xu hướng kéo dài 6 tháng, bạn ở đúng phía suốt 6 tháng — payoff gần như tuyến tính theo độ dài xu hướng. Mà độ dài xu hướng có **fat tail**: khủng hoảng tạo ra những xu hướng dài bất thường, một chiều, không thèm hồi. Ngược lại, trong thị trường sideways, dấu của return 12 tháng flip liên tục, mỗi lần flip là một whipsaw lỗ nhỏ. Kết quả: phân phối return của trend **positively skewed** — nhiều tháng lỗ nhỏ đều đặn (premium bạn trả cho cái "straddle"), thỉnh thoảng một cú thắng lớn (payoff khi vol nổ). Đây là hình dạng đối lập gần như hoàn hảo với carry (15.6) — và chính vì thế, trend + carry trong cùng một quỹ bù trừ skew cho nhau đẹp đến mức thành cặp bài trùng của mọi multi-strategy CTA.

Chạy số cái convexity đó để nó thành con số chứ không chỉ là ẩn dụ. Giả sử hệ có Sharpe 0.7, vol mục tiêu 10%/năm → return trung bình danh nghĩa 7%/năm. Nhưng phân bố không đối xứng chút nào. Trong ~40 năm, giả sử: 28 năm dương nhỏ (trung bình $+5\%$ — những năm thị trường có xu hướng nhẹ, hệ nhặt đều), 8 năm âm (trung bình $-8\%$ — các năm sideways whipsaw như 2011–2013), và 4 năm bùng nổ (trung bình $+35\%$ — 2008, 2014, 2022, và một năm khủng hoảng khác). Trung bình niên:

$$\bar r = \frac{28 \times 5 + 8 \times (-8) + 4 \times 35}{40} = \frac{140 - 64 + 140}{40} = \frac{216}{40} = 5.4\%/\text{năm}.$$

Con số khiêm tốn. Nhưng nhìn vào phân rã: **4 năm bùng nổ đóng góp $140/216 = 65\%$ tổng return**, và chúng rơi đúng vào lúc equity sập. Đó là toán học của "bạn trả premium suốt 8 năm lỗ để mua tấm bảo hiểm bật lên đúng lúc khủng hoảng". Một nhà đầu tư chỉ nhìn Sharpe 0.7 rồi bỏ qua sẽ không bao giờ hiểu rằng giá trị thật của một CTA nằm ở **correlation âm với phần còn lại của danh mục trong đúng ba tháng tệ nhất của thập kỷ** — và giá trị đó *không đo được bằng Sharpe đơn lẻ* (ta sẽ định lượng nó ở 15.13).

Ai trả tiền cho trend? Người **cắt lãi quá sớm và ôm lỗ quá lâu** (disposition effect lần nữa), các hedger thương mại buộc phải phòng hộ ngược xu hướng bất kể giá (một hãng hàng không hedge giá dầu đang tăng), và về bản chất là những người *bán bảo hiểm tail* cho bạn ở chiều ngược — bạn trả họ premium đều đặn trong thời bình. Capacity **rất lớn** vì futures thanh khoản khủng và horizon dài; đây là lý do các CTA lớn nhất (Winton, Man AHL, các managed-futures của quỹ hưu) chạy hàng chục tỷ. Decay: signal đơn giản (12m momentum) không "chết" vì nó là risk premium/convexity chứ không phải một khe hở giá — nhưng Sharpe đã bào mòn dần từ ~1.0 (thập niên 1990) xuống 0.4–0.6 (2010s) do crowding: nhiều tiền cùng đuổi một xu hướng làm entry/exit đắt hơn. Kỹ năng đòi hỏi: risk overlay (vol targeting, position limits), diversification xuyên tài sản, và — nghịch lý thay — **kỷ luật tổ chức** để không vứt bỏ hệ thống trong 3 năm flat khi mọi bản năng và mọi khách hàng đều gào lên đòi bỏ.

## 15.6 Carry — nhặt xu trước xe lu

Carry là loài "risk premium thuần" nhất bản đồ: bạn nhận một dòng thu nhập đều đặn để đổi lấy việc ôm một rủi ro đuôi. Công thức chung xuyên tài sản gói gọn trong một câu: **long cái có yield cao, short cái có yield thấp**. FX carry: vay JPY lãi ~0%, cho vay BRL lãi 12% → ăn chênh 12%/năm *nếu tỷ giá không đổi*. Bond carry: mua trái phiếu dài hạn (yield cao) tài trợ bằng repo ngắn hạn (lãi thấp), ăn roll-down + term premium. Commodity carry: long hàng đang backwardation (futures rẻ hơn spot), short hàng contango. Vol carry: bán option (implied vol cao) chống lại realized vol thấp — chính là variance risk premium (15.11). Bốn thị trường khác nhau, một cấu trúc kinh tế duy nhất.

Đặc trưng sống còn của carry: **skew âm sâu**. Bạn ăn xu đều đặn 11 tháng rồi mất cả năm trong một tuần khi rủi ro đuôi hiện thực. Chạy số FX carry cổ điển. Long BRL / short JPY, carry 12%/năm $= 1\%$/tháng. 11 tháng đầu êm ả, tỷ giá đi ngang: bạn tích $+11\%$. Tháng thứ 12 nổ ra khủng hoảng EM, BRL sập 20% trong hai tuần → $-20\%$ trên vị thế. Cả năm:

$$+11\% - 20\% = -9\%.$$

Đây là **hình dạng đối lập hoàn toàn với trend** (positive skew): carry là một *short straddle*, kiếm premium đều rồi trả một cục lớn ở đuôi. Và đây là chỗ Sharpe nói dối trắng trợn nhất trong cả sách: Sharpe FX carry có thể hiện **1.2** trên một mẫu không chứa khủng hoảng, nhưng thành **$-0.3$** nếu mẫu chứa đúng một cú sập — cùng một chiến lược, khác nhau chỉ ở chỗ cửa sổ dữ liệu có nuốt trọn cái đuôi hay không. Nếu bạn backtest carry trên 2003–2007 rồi khoe Sharpe 1.5, bạn đã vô tình cắt bỏ 2008 khỏi mẫu và đang bán một lời nói dối. Đây là ví dụ giáo khoa về **Sharpe che giấu tail risk** mà chương 9 cảnh báo — và vì sao mọi báo cáo carry nghiêm túc phải kèm skew, kurtosis, và max drawdown, không chỉ Sharpe.

Ai trả tiền? Người **cần bảo hiểm đúng cái đuôi mà bạn đang short**: nhà nhập khẩu Brazil cần phòng hộ BRL yếu, nhà đầu tư sợ crash trả premium để mua protection. Bạn là người bán bảo hiểm, ăn premium trong hoà bình, đền trong bão. Vì đây là risk premium thật (có người *thật sự cần* chuyển rủi ro này cho bạn), carry không bị arbitrage đi mất — nhưng nó **crowded** khi quá nhiều tiền cùng bán một loại bảo hiểm, làm premium rẻ đi và cú sập sâu hơn (vì khi bão đến, mọi người cùng chạy khỏi một cửa hẹp — chính là quant quake nhưng ở tài sản khác). Capacity lớn (FX, rates thanh khoản khủng). Kỹ năng đòi hỏi: **quản lý tail** đặt lên trên hết — position sizing bảo thủ, diversify carry qua nhiều tài sản để các cú sập không đồng pha, và tỉnh táo hiểu rằng backtest Sharpe của carry phải chiết khấu nặng vì nó có bản chất nói dối về đuôi.

## 15.7 Market making — bán thanh khoản, quản adverse selection

Market making đảo ngược mọi loài phía trên: bạn không dự báo hướng giá, bạn **báo giá hai chiều** (bid và ask) và ăn spread khi có người mua ở ask của bạn và người khác bán ở bid của bạn. Cơ chế lợi nhuận cơ bản: mỗi vòng round-trip (một người mua + một người bán) bạn ăn full spread. Nếu spread là 2 cents trên cổ phiếu \$50 và bạn khớp 100k cổ phiếu round-trip/ngày trên tên đó, gross $= 100\text{k} \times \$0.02 = \$2000$/ngày, trước chi phí inventory và adverse selection.

Hai kẻ thù định nghĩa nghề này, và cả hai đều phải được định lượng chứ không thể nói suông. **Inventory risk**: bạn không phải lúc nào cũng khớp cân bằng — có ngày mua nhiều hơn bán, ôm tồn kho, và giá có thể trôi chống lại bạn trước khi bạn giải phóng được. Bạn quản bằng cách **lệch quote**: nếu đang long quá nhiều, hạ cả bid và ask xuống để khuyến khích người khác mua từ bạn và ngăn bạn mua thêm — đây chính là mô hình Avellaneda-Stoikov, một OU control problem (liên hệ chương 12). Cụ thể, mô hình đó dịch giá tham chiếu khỏi mid một lượng *reservation price* $r = S - q\gamma\sigma^2(T-t)$, trong đó $q$ là tồn kho hiện tại (dương nếu đang long), $\gamma$ là hệ số ngại rủi ro, $\sigma$ là vol. Chạy số: nếu bạn đang long $q = 5000$ cổ phiếu, $\gamma = 0.1$, $\sigma = \$0.30$/ngày trên tên \$50, và còn nửa ngày ($T-t = 0.5$), reservation price dịch xuống dưới mid $q\gamma\sigma^2(T-t) = 5000 \times 0.1 \times 0.09 \times 0.5 = \$22.5$ tính trên toàn vị thế — tức bạn skew quote xuống ~0.45 cent/cổ phiếu để chủ động xả bớt long. Con số nhỏ, nhưng nhân qua hàng nghìn lần quote mỗi ngày, cái skew kỷ luật này là ranh giới giữa một MM sống sót và một MM bị tồn kho giết. **Adverse selection**: người khớp với bạn đôi khi biết nhiều hơn bạn — họ nhấc ask của bạn *vì họ biết giá sắp lên*. Bạn bán rẻ cho người thông thái và mua đắt từ họ; đây là "toxic flow". Toàn bộ nghệ thuật market making là **phân biệt uninformed flow (retail, rebalancing — ăn được) với informed flow (đằng sau có tin — tránh)** và nới spread theo đúng độ độc của luồng.

Chạy số P&L phân rã trên một tên, một ngày, để thấy đủ bốn thành phần. Gross spread capture $+\$2000$; trừ adverse selection $-\$700$ (những lần bạn đứng sai phía của người biết tin); trừ inventory P&L $-\$200$ (giá trôi khi bạn ôm tồn kho); cộng exchange rebate $+\$150$ (nhiều sàn trả tiền cho maker cung cấp thanh khoản, mô hình maker-taker) → **net $\approx \$1250$/ngày/tên**. Sharpe của loài này **rất cao** (5–10+) vì bạn thắng rất nhiều lần nhỏ mỗi ngày, luật số lớn hoạt động cực mạnh — variance của tổng P&L nhỏ so với kỳ vọng. Nhưng **capacity mỗi tên rất nhỏ**: bạn chỉ ăn được phần spread tương ứng với luồng đi qua tên đó, không đổ thêm tiền mà lớn lên được; muốn to hơn phải trải ra hàng nghìn tên và nhiều sàn. Ai trả tiền: bất kỳ ai cần khớp *ngay* (impatient traders, retail, rebalancers) — họ trả spread để đổi lấy sự tiện lợi tức thời. Decay: cạnh tranh HFT nén spread về mức tối thiểu (tick size), nên market making hiện đại là cuộc đua **tốc độ + mô hình adverse selection tinh vi**, không còn là ăn spread rộng thảnh thơi như xưa. Kỹ năng đòi hỏi: kỹ thuật hệ thống độ trễ thấp, mô hình microstructure (chương 12), và quản inventory thời gian thực.

## 15.8 HFT arbitrage — cuộc đua vật lý

HFT arb là góc mà edge không nằm ở ý tưởng mà ở **tốc độ tuyệt đối** — đơn vị nano tới micro giây. Các dạng cổ điển: **cross-venue arb** (cùng một cổ phiếu giá lệch 1 tick giữa NYSE và một dark pool trong 50 micro giây → mua rẻ bán đắt trước khi giá hội tụ); **ETF-NAV arb** (giá ETF lệch khỏi giá của rổ cấu thành → arb tức thời, giữ ETF gắn với NAV); **futures-spot / index arb** (S&P future lệch khỏi giá của rổ 500 cổ phiếu quy đổi cost-of-carry). Cơ chế chung: mỗi cơ hội bé xíu (một tick) nhưng **xác suất thắng gần như chắc chắn nếu bạn là người nhanh nhất**, và tần suất thì khổng lồ.

Chạy số kinh tế học của tốc độ, vì đây là loài mà "chi tiền mua tốc độ" phải ra được ROI cụ thể. Giả sử cross-venue arb cho 0.5 cent lợi mỗi vòng, xác suất bắt được 60% (40% còn lại có người nhanh hơn lấy mất), 500 cơ hội/ngày trên một cặp venue, mỗi lần 100 cổ phiếu. Kỳ vọng ngày:

$$\mathbb{E} = 500 \times 0.60 \times \$0.005 \times 100 = \$150/\text{ngày/cặp venue}.$$

Nghe nhỏ, nhưng nhân qua hàng trăm symbol × nhiều cặp venue × *không rủi ro qua đêm* (đóng sạch position mỗi ngày) → Sharpe **rất cao** vì gần như không có variance định hướng, chỉ có luật số lớn trên hàng triệu vòng nhỏ. Cái quyết định tất cả là **xác suất bắt được 60% hay 40%**, và nó là hàm trực tiếp của độ trễ. Định lượng ROI của hạ tầng: nếu một hãng đang ở win-rate 40% ($\mathbb{E} = 500 \times 0.40 \times \$0.005 \times 100 = \$100$/ngày/cặp) mà nâng lên 60% ($\$150$/ngày/cặp), phần tăng là $\$50$/ngày/cặp; nhân qua, giả sử, 300 cặp × 250 ngày $= \$50 \times 300 \times 250 = \$3.75\text{M}$/năm. Một microwave tower giữa Chicago và New Jersey cắt độ trễ ~1–2 mili-giây so với cáp quang (ánh sáng đi trong không khí nhanh hơn trong sợi thuỷ tinh) tốn hàng chục triệu để xây và vận hành — nhưng nếu nó chính là thứ đẩy win-rate từ 40% lên 60%, thì $\$3.75\text{M}$/năm mới chỉ là một cặp venue trong một chiến lược; cộng dồn mọi chiến lược latency-nhạy, ROI dương rõ ràng. Đây chính là lý do HFT là cuộc đua *chi tiêu hạ tầng*, không phải cuộc đua research: bạn không thắng bằng một ý tưởng khôn hơn, bạn thắng bằng cách đến trước.

Ai trả tiền: người chậm hơn — bất kỳ ai để lộ một lệnh giá sai trong vài micro giây. Capacity **cực nhỏ**: cơ hội bốc hơi ngay khi bị bắt, và nó không scale bằng tiền mà bằng tốc độ; đổ thêm vốn không giúp gì nếu bạn không nhanh hơn. Decay: mỗi khi một hãng nâng cấp hạ tầng, biên của mọi người khác co lại — đây là cuộc chạy đua vũ trang mà lợi nhuận toàn ngành co dần khi tốc độ tiệm cận giới hạn vật lý (tốc độ ánh sáng trong sợi quang là một trần cứng không ai vượt được). Kỹ năng đòi hỏi: FPGA/kernel-bypass networking, colocation ngay cạnh matching engine, và toán xác suất mỏng — đây là góc mà quant researcher thuần túy ít giá trị, còn kỹ sư hệ thống là vua.

## 15.9 Event-driven quant — case study alpha đã chết

**Index rebalance — một alpha đã chết kể chuyện.** Khi một cổ phiếu được thêm vào S&P 500, các quỹ index *bắt buộc* phải mua ~10% ADV đúng vào ngày effective để bám chỉ số. Thập niên 1990–2000, dòng mua cơ học này để lại một khe hở lộ liễu: mua ở ngày công bố, bán ở ngày effective, ăn trung bình $+5$ đến $+8\%$. Rồi điều tất yếu xảy ra — nhiều arbitrageur hơn nhảy vào → ai cũng mua sớm hơn để đón đầu → họ front-run lẫn nhau → hiệu ứng bị đẩy dịch và co lại; các nghiên cứu gần đây đo hiệu ứng còn ~0% sau thập niên 2010. Đây là vòng đời đầy đủ của một alpha công khai: **phát hiện → khai thác → crowding → chết**. Bài học kép, và cả hai đều vượt ra ngoài cái index rebalance cụ thể: (a) backtest chạy trên thời kỳ alpha còn sống nói dối trắng trợn về hiện tại — nếu bạn backtest index-arb trên dữ liệu 1995–2005 hôm nay, bạn sẽ thấy một mỏ vàng đã cạn từ lâu; (b) alpha chết vẫn dạy nghề — bản thân *nguyên lý* "dòng chảy bắt buộc để lại dấu vết đón được" là bất tử, chỉ có địa điểm cụ thể là thay đổi.

Điều đáng mở rộng là **họ event-driven vẫn sống khoẻ** quanh cái xác index-rebalance. Nguyên lý chung: bất cứ nơi nào có **dòng vốn bắt buộc, có thể dự đoán, và không nhạy giá**, ở đó có alpha cho người cung cấp thanh khoản đón trước. Bốn ví dụ đang chạy ra tiền thật hôm nay:

**PEAD (Post-Earnings Announcement Drift).** Cổ phiếu báo cáo lợi nhuận vượt kỳ vọng (earnings surprise dương) tiếp tục *trôi lên* trong 30–60 ngày sau đó — thị trường under-react với tin tốt, tiêu hoá nó chậm chạp. Chạy số: phân nhóm cổ phiếu theo standardized unexpected earnings (SUE) thành decile; decile SUE cao nhất vượt decile thấp nhất trung bình ~1% mỗi tháng trong 2 tháng sau earnings, tương ứng IC ~0.04. Long decile cao nhất, short decile thấp nhất, làm trên toàn universe mỗi mùa earnings → một chuỗi cược breadth kha khá. Đây là behavioral (under-reaction — chương 8), không phải flow bắt buộc, nên bền hơn index-arb; nhưng nó cũng đã bào mòn đáng kể khi crowding kéo vào.

**M&A merger arbitrage.** Công ty A bị mua với giá \$50/cổ phiếu, hiện đang giao dịch \$48 → nếu deal đóng, bạn ăn \$2 (spread 4%). Bạn long target, đôi khi short acquirer để cô lập rủi ro deal. Ai trả tiền: cổ đông muốn *chốt lời chắc chắn ngay bây giờ* thay vì chờ deal đóng với rủi ro đổ vỡ — họ nhượng \$2 cho bạn để bạn ôm hộ rủi ro deal-break. Chạy số đầy đủ. Spread 4%, deal dự kiến đóng trong 3 tháng → $4\% \times 4 = 16\%$ annualized *nếu đóng*. Nhưng nếu vỡ (regulator chặn), giá về $\$40$ → lỗ $(40-48)/48 = -16.7\%$. Với xác suất đóng 90%, kỳ vọng mỗi deal:

$$\mathbb{E} = 0.90 \times 4\% - 0.10 \times 16.7\% = 3.6\% - 1.67\% = +1.9\%\ \text{trong 3 tháng}.$$

Dương, nhưng chú ý **skew âm giống hệt carry**: bạn nhặt spread 4% đều đều trên chín deal, rồi một deal vỡ nuốt gần nửa số đó. Merger arb *là* short bảo hiểm deal-break, cùng hình dạng payoff với FX carry ở 15.6 — nhặt xu trước một chiếc xe lu tên là "regulator".

**Buyback / index deletion / rebalance cuối tháng.** Mọi dòng vốn cơ học đều để lại dấu vết đón được. Ví dụ đẹp nhất: rebalance cuối tháng của quỹ 60/40. Khi equity tăng mạnh trong tháng, tỷ trọng equity vượt 60%, nên cuối tháng quỹ *bắt buộc* bán equity mua bond để về đúng tỷ lệ mục tiêu. Dòng bán equity này có thể dự đoán cả về hướng lẫn thời điểm, nên đón trước ăn được vài bps đều đặn — nhỏ, nhưng không nhạy giá và lặp lại mỗi tháng.

Capacity của họ event-driven **trung bình** — bị chặn cứng bởi độ lớn của mỗi event (một deal M&A chỉ hấp thụ được ngần ấy vốn). Kỹ năng đòi hỏi: hiểu sâu cơ chế thể chế (index methodology, quy trình M&A, tâm lý regulator), data sạch và kịp thời về event, và — vĩnh viễn — kỷ luật ghi nhớ rằng *alpha nào cũng có tuổi thọ*, và cái bạn đang cày có thể đang ở đoạn cuối của nó mà không báo trước.

## 15.10 Global macro systematic — breadth thấp, thông tin cao

Macro systematic là loài **đi ngược Fundamental Law**: rất ít cược nhưng mỗi cược đậm. Bạn đặt vị thế directional trên vài chục thị trường (equity index, bond, FX, commodity) theo tín hiệu vĩ mô — growth nowcast, inflation surprise, monetary policy stance, flow của central bank. Khác hẳn equity market neutral có breadth hàng nghìn, macro có thể chỉ có **vài chục cược độc lập mỗi năm**: "đúng về hướng của USD trong quý này" là *một* cược, không phải một nghìn, cho dù bạn thể hiện nó qua bao nhiêu cặp tiền.

Chạy số cái hạn chế breadth, vì nó là insight định mệnh của loài này. Fundamental Law: $IR = IC \times \sqrt{BR}$. Giả sử macro trader có $IC$ *cao* — 0.10, gấp đôi equity — nhờ hiểu sâu và thông tin tốt hơn đám đông. Nhưng $BR$ chỉ ~30 cược độc lập/năm (vài chục thị trường, tín hiệu thay đổi chậm theo tháng, nhiều thị trường lại đồng pha nên số cược *độc lập* còn ít hơn số thị trường). Khi đó:

$$IR_{\text{macro}} = 0.10 \times \sqrt{30} = 0.10 \times 5.48 = 0.55.$$

So sánh trực tiếp với equity market neutral có $IC = 0.03$ (bằng một phần ba macro) nhưng $BR = 500$:

$$IR_{\text{equity}} = 0.03 \times \sqrt{500} = 0.03 \times 22.4 = 0.67.$$

**Người kém IC gấp ba nhưng nhiều breadth vẫn thắng người giỏi IC nhưng ít breadth.** Đây là bài học sâu sắc nhất của Fundamental Law, và là lý do macro Sharpe điển hình khiêm tốn (0.5–1) *dù* các macro trader thường là những bộ óc sắc bén và hiểu biết nhất trong ngành — trực giác thị trường của họ không bù nổi cho việc chỉ có ba mươi lần một năm để dùng nó. Đường thoát duy nhất là **tăng breadth**: nhiều tín hiệu độc lập hơn, nhiều thị trường hơn, horizon ngắn hơn (mỗi lần rebalance là thêm một cược), hoặc trung thực chấp nhận rằng macro là loài low-Sharpe-high-conviction và định cỡ kỳ vọng cho đúng. Một macro shop hiện đại giỏi là shop biến "một quan điểm về USD" thành ba mươi cược nhỏ trực giao thay vì một cược to.

Ai trả tiền: về bản chất, macro directional là *lấy rủi ro thị trường tổng thể có điều kiện* — bạn được trả risk premium khi đọc đúng regime, mất khi đọc sai. Đây là loài gần "đầu cơ có kỷ luật" nhất trong bảng, và cũng vì thế phụ thuộc nhiều nhất vào chất lượng con người. Capacity **rất lớn** (futures + FX + rates là những thị trường thanh khoản nhất hành tinh). Decay: tín hiệu macro thô (carry, momentum trên bond/FX) đã crowded, nhưng nowcast tinh vi từ alt-data (chương 16, và các nguồn alt-data) vẫn tạo được edge. Kỹ năng đòi hỏi: kinh tế học vĩ mô thật sự (không phải slogan), đọc dòng vốn và central bank, và sự khiêm tốn để không lừa mình rằng IC cao cứu được breadth thấp.

## 15.11 Vol trading — bán bảo hiểm một cách hệ thống

Vol trading là điểm giao của P-world và Q-world (xem cuốn Q-world ch.5–6 về surface và pricing). Nền tảng phía P: **variance risk premium** — implied volatility có xu hướng cao hơn realized volatility một cách hệ thống, vì con người *sợ* biến động và sẵn lòng trả premium để phòng hộ nó. Bạn là người bán tấm bảo hiểm đó: bán option (thu implied vol), delta-hedge liên tục để cô lập cược vol, và ăn phần chênh nếu realized hoá ra thấp hơn implied.

Chạy số variance risk premium từ đầu. VIX (implied vol S&P 30 ngày) trung bình lịch sử ~19%, realized vol S&P trung bình ~15% → premium ~4 điểm vol/năm, thu được một cách hệ thống. Cụ thể một trade: bán straddle 1 tháng ATM khi implied 20% (annualized), và realized hoá ra 15%. P&L của một delta-hedged short straddle xấp xỉ tỷ lệ với chênh *variance* (không phải vol):

$$\text{P\&L} \approx \tfrac{1}{2} S^2 \Gamma \left(\sigma_{\text{impl}}^2 - \sigma_{\text{real}}^2\right) \times (\text{thời gian}).$$

Chênh variance $= 0.20^2 - 0.15^2 = 0.04 - 0.0225 = +0.0175$ → bạn ăn phần này, dương. Nhưng **skew âm sâu nhất trong mọi loài** nằm ngay trong chính công thức đó: variance là *bình phương* của vol, nên một cú vol-spike phạt bạn theo bình phương. Một tháng vol nổ (implied 20% nhưng realized 45% như tháng 3/2020):

$$0.20^2 - 0.45^2 = 0.04 - 0.2025 = -0.1625.$$

So sánh độ lớn: $0.1625 / 0.0175 = 9.3$ — **một tháng khủng hoảng lỗ gấp hơn chín lần một tháng bình thường lãi.** Bạn cần hơn chín tháng yên bình để gỡ một tháng bão. Đây là loài "nhặt xu trước xe lu" ở dạng thuần khiết và tàn nhẫn nhất: bán vol kiếm đều 11 tháng, tháng 12 vol-spike xoá sạch cả năm cộng thêm.

Relative value vol tinh vi hơn directional short vol, và là nơi các quỹ giỏi thật sự sống. **Term structure**: bán vol tháng gần (đắt) mua vol tháng xa (rẻ). **Skew**: put implied vol thường cao một cách bất hợp lý so với call → bán put spread thu phần skew. **Dispersion**: bán index vol, mua single-name vol — ăn correlation premium (index vol đắt vì nó gói cả correlation, mà correlation thì được định giá cao hơn thực tế). Những trade này **market-neutral về mức vol tổng thể**, chỉ đặt cược tương đối trên *hình dạng* của surface — nên Sharpe cao hơn và tail nhẹ hơn directional short vol, vì bạn không còn trần trụi short cả thị trường vol nữa.

Ai trả tiền: người mua bảo hiểm — nhà đầu tư mua put phòng crash, và dealer cần hedge gamma (xem Q-world về dealer gamma positioning, nơi dòng hedge của dealer tạo ra chính cái premium bạn thu). Capacity trung bình (option market kém sâu hơn underlying nhiều). Decay: variance risk premium là risk premium thật nên nó bền, không bị arbitrage đi — nhưng nó crowded, và khi quá nhiều quỹ cùng short vol, premium mỏng đi còn cú deleveraging đồng pha thì khủng khiếp hơn (Volmageddon 2/2018: các ETP short-vol nổ tung *trong một ngày* khi ai cũng phải mua lại vol cùng lúc). Kỹ năng đòi hỏi: toán stochastic (Greeks, hedging — nền tảng Q-world), và quản tail đến mức ám ảnh, vì đây là loài mà một lần bất cẩn về đuôi là xoá sổ.

## 15.12 Crypto quant — mọi loài, thị trường non, decay siêu nhanh

Crypto là "phòng thí nghiệm tua nhanh" của toàn bộ bản đồ: mọi loài phía trên đều tồn tại ở đây, nhưng thị trường **non** (kém hiệu quả, ít arbitrageur tổ chức, hạ tầng sơ khai) khiến edge to hơn nhưng **decay nhanh hơn** nhiều lần — cái ở thị trường cổ điển sống nhiều năm thì ở crypto sống nhiều tháng. Ba đặc sản định hình loài này:

**Funding basis / cash-and-carry.** Perpetual futures trên crypto trả funding rate mỗi 8 giờ để neo giá perp vào spot. Khi thị trường bullish, funding dương và cao — người long trả cho người short. Bạn **long spot, short perp** (delta-neutral) và ngồi thu funding. Chạy số: funding $0.03\%$/8h $= 0.03\% \times 3 = 0.09\%$/ngày $= 0.09\% \times 365 \approx 33\%$/năm annualized trong giai đoạn nóng, gần như không rủi ro giá vì delta-neutral. Đây là carry thuần khiết: ai trả tiền là những người *dùng đòn bẩy long* trả funding để giữ vị thế đầu cơ. Nhưng funding sập về 0 (hoặc âm) ngay khi hưng phấn nguội — edge $33\%$/năm có thể bốc hơi trong một tuần, nên đây là carry với half-life ngắn khủng khiếp.

**Cross-exchange arbitrage.** Cùng một token giá lệch giữa Binance và một sàn nhỏ 0.5% → mua rẻ bán đắt. Nghe hệt HFT arb, nhưng ở crypto rào cản không phải tốc độ mà là **rủi ro hạ tầng**: chuyển tài sản giữa các sàn mất từ vài phút tới vài giờ (on-chain confirmation), và sàn có thể sập hoặc đóng băng rút tiền bất cứ lúc nào — FTX 2022 xoá sạch mọi vị thế arbitrage đang mở trên sàn đó chỉ sau một đêm. Edge to nhưng rủi ro operational khủng, và nó không phải rủi ro bạn hedge được bằng toán.

**Market making crypto.** Spread rộng hơn equity nhiều (thị trường non), nhưng adverse selection tàn khốc (đầy toxic flow, wash trading giả tạo thanh khoản), và luôn treo lơ lửng rủi ro sàn.

Sharpe crypto có thể **rất cao** trong một cửa sổ ngắn nhưng gần như không bền — một edge sống vài tháng rồi crowded, hoặc biến mất khi regime market đổi. Rủi ro định nghĩa loài này không phải market risk mà **infrastructure/counterparty risk**: sàn sập, hack, regulatory shock, stablecoin de-peg. Đây là điểm khác biệt cốt lõi so với mọi loài cổ điển — bạn có thể đúng hoàn toàn về giá mà vẫn mất sạch vì nơi giữ tiền của bạn bốc hơi. Capacity nhỏ–trung bình (thanh khoản mỏng ngoài BTC/ETH). Kỹ năng đòi hỏi: kỹ thuật (kết nối API nhiều sàn, quản ví on-chain, quản khoá riêng tư), quản counterparty risk như một môn riêng, và tốc độ research đủ nhanh để bắt edge trước khi nó chết — chi tiết theo asset class ở chương 16.

## 15.13 Đọc bảng đúng — giá trị biên, không phải giá trị cô lập

Ghi chú đọc bảng quan trọng nhất: Sharpe đơn lẻ thấp không có nghĩa chiến lược tồi. Một CTA Sharpe 0.6 nhưng correlation **âm** với equity trong khủng hoảng đáng giá hơn một stat-arb Sharpe 2 correlation cao với đồng loại — vì cái đáng giá là **giá trị biên trong danh mục, không phải giá trị cô lập** (đúng tinh thần Markowitz). Đây không phải một câu nói cho sang; nó là toán học, và ta chứng minh bằng số vì nó là insight trung tâm nối cả chương lại.

Một danh mục cổ phiếu (Sharpe 0.5, vol 15%) đang cân nhắc thêm 20% vào một CTA (Sharpe 0.6, vol 15%). Nhìn cô lập, CTA Sharpe 0.6 chỉ nhỉnh hơn equity chút xíu — chẳng có gì đáng phấn khích. Nhưng giá trị biên của việc *thêm* nó phụ thuộc quyết định vào **correlation**. Sharpe của danh mục hỗn hợp với tỷ trọng $w$ vào CTA:

$$SR_{\text{port}} = \frac{w\mu_C + (1-w)\mu_E}{\sqrt{w^2\sigma_C^2 + (1-w)^2\sigma_E^2 + 2w(1-w)\rho\,\sigma_C\sigma_E}}.$$

Đặt $\mu_E = 0.075$, $\mu_C = 0.09$ (chính là Sharpe 0.5 và 0.6 nhân vol 15%), $\sigma_E = \sigma_C = 0.15$, $w = 0.2$, và **correlation $\rho = -0.1$** (CTA thường phản pha equity). Tính từng phần.

Tử số: $0.2 \times 0.09 + 0.8 \times 0.075 = 0.018 + 0.060 = 0.078$.

Mẫu số, ba số hạng: $w^2\sigma_C^2 = 0.04 \times 0.0225 = 0.000900$; $(1-w)^2\sigma_E^2 = 0.64 \times 0.0225 = 0.014400$; số hạng chéo $2w(1-w)\rho\sigma_C\sigma_E = 2 \times 0.2 \times 0.8 \times (-0.1) \times 0.15 \times 0.15 = -0.000720$. Tổng $= 0.000900 + 0.014400 - 0.000720 = 0.014580$, căn bậc hai $= 0.1208$.

$$SR_{\text{port}} = \frac{0.078}{0.1208} = 0.646.$$

Từ equity đơn lẻ Sharpe 0.5, thêm một mảnh Sharpe-0.6 correlation-âm đẩy Sharpe danh mục lên **0.65 — tăng gần 30%** dù bản thân mảnh thêm vào chỉ nhỉnh hơn chút. Sức mạnh nằm hết ở số hạng chéo âm: chính cái $-0.000720$ đó *cắt bớt* mẫu số, làm vol tổ hợp nhỏ hơn trong khi return vẫn cộng tuyến tính.

Bây giờ đảo dấu correlation để thấy mặt kia. Nếu $\rho = +0.7$ thay vì $-0.1$ (hình dung một stat-arb Sharpe cao nhưng correlated nặng với các quỹ khác), số hạng chéo thành $2 \times 0.2 \times 0.8 \times 0.7 \times 0.0225 = +0.00504$, mẫu số phình lên $\sqrt{0.000900 + 0.014400 + 0.00504} = \sqrt{0.02034} = 0.1426$, và $SR_{\text{port}} = 0.078/0.1426 = 0.547$ — cải thiện gần như *không đáng kể* so với 0.5 ban đầu, dù ta giả định mảnh thêm vào có Sharpe cô lập cao. Diversification biến mất, và trong khủng hoảng cái mảnh correlated đó còn down đúng lúc mọi thứ khác down. Đây là toán học chứng minh vì sao "giá trị biên trong danh mục" đè bẹp "Sharpe cô lập" — và vì sao một allocator giỏi sẵn lòng trả nhiều tiền hơn cho một CTA tầm thường phản pha so với một stat-arb xuất sắc đồng pha. Cột "Sharpe điển hình" trong bảng 15.1, đọc một mình, đánh lừa bạn; đọc cùng correlation, nó mới nói thật.

## 15.14 Cỗ máy phân bổ vốn — cách các quỹ lớn tổ hợp nhiều loài

Câu hỏi thực sự của một quỹ tỷ đô không phải "chiến lược nào tốt nhất" mà "làm sao ghép 100 mảnh Sharpe-0.7 tương quan thấp thành một cỗ máy Sharpe-2-rồi-leverage". Đây là mô hình **pod shop** (Millennium, Citadel, Point72, Balyasny — chương 21), và nó là ứng dụng thực tế lớn nhất, có sức nặng nhất, của mọi thứ trong cuốn sách này.

Cơ chế. Mỗi **pod** là một team nhỏ (PM + researcher + trader) chạy một hoặc vài chiến lược trong bảng phía trên, được cấp một lượng vốn và một **risk budget** (ví dụ được phép tạo vol 3%/năm trên vốn được cấp, không hơn). Trung tâm áp ba lớp kiểm soát, và cả ba đều là những gì đã dạy rải rác trong sách, nay hợp lại thành một guồng máy. Thứ nhất, **risk trung tâm** giám sát exposure tổng hợp — nếu 30 pod cùng âm thầm long tech, trung tâm thấy crowding mà từng pod không thấy (đúng bài học quant quake — chương 14). Thứ hai, **drawdown stop tàn nhẫn** — pod mất 5% bị cắt nửa vốn, mất ~7–10% bị đóng và PM ra đi; đây là kỷ luật lạnh lùng giữ cho một pod hỏng không kéo cả quỹ. Thứ ba, **capital allocation động** — vốn chảy về pod đang tạo alpha và rút khỏi pod đang khô, liên tục. Toàn bộ cỗ máy là một meta-portfolio optimizer (chương 11) chạy trên các pod thay vì trên cổ phiếu.

Chạy số vì sao tổ hợp tạo ra phép màu — đây là phép tính đắt giá nhất cả chương. Giả sử một quỹ có $N = 100$ pod, mỗi pod Sharpe 0.7, vol mỗi pod chuẩn hoá về $\sigma_{\text{pod}} = 3\%$/năm, và — điểm quyết định tất cả — **correlation trung bình giữa các pod chỉ $\bar\rho = 0.1$** (trung tâm ép mỗi pod trực giao bằng cách không cấp vốn cho ý tưởng trùng lặp và neutral hoá các factor chung). Vol của danh mục tổ hợp $N$ pod bằng nhau, correlation chung $\bar\rho$, tuân theo công thức:

$$\sigma_{\text{port}} = \sigma_{\text{pod}}\sqrt{\frac{1 + (N-1)\bar\rho}{N}} = 3\% \times \sqrt{\frac{1 + 99 \times 0.1}{100}} = 3\% \times \sqrt{\frac{10.9}{100}} = 3\% \times 0.330 = 0.99\%.$$

Return tổ hợp trung bình $= 0.7 \times 3\% = 2.1\%$ (Sharpe × vol; giữ nguyên vì return cộng tuyến tính khi mọi pod cùng kỳ vọng Sharpe). Vậy:

$$SR_{\text{port}} = \frac{2.1\%}{0.99\%} = 2.12.$$

Từ 100 mảnh Sharpe-0.7 ra một cỗ máy Sharpe-2.1 — và đó mới là *trước* leverage. Vì vol tổ hợp chỉ ~1%, quỹ có thể leverage lên ~5× để đưa vol về mục tiêu ~5%: Sharpe không đổi (leverage scale cả tử lẫn mẫu) nhưng return danh nghĩa thành ~10%/năm ở Sharpe 2.1. Đó là cỗ máy compound mà các pod shop thật sự bán cho nhà đầu tư.

Và toàn bộ business nằm trong con số $\bar\rho$ đó. Ép correlation từ 0.10 xuống 0.05, mẫu số thành:

$$\sigma_{\text{port}} = 3\% \times \sqrt{\frac{1 + 99 \times 0.05}{100}} = 3\% \times \sqrt{0.0595} = 3\% \times 0.244 = 0.73\%,$$

nâng Sharpe lên $2.1\%/0.73\% = 2.87$. Chỉ cắt $\bar\rho$ đi 0.05 mà Sharpe nhảy từ 2.12 lên 2.87 — trên vài tỷ vốn được leverage, mỗi 0.05 cắt bớt của $\bar\rho$ đáng giá cả trăm triệu USD phí quản lý. **Giá trị mà một pod shop tạo ra không nằm ở việc từng pod giỏi hơn, mà ở việc ép correlation giữa các pod xuống thấp nhất có thể.** Đây chính là lý do sâu xa vì sao các pod shop **săn diversification hơn săn Sharpe**: một pod Sharpe 1.0 nhưng correlation 0.5 với dàn pod hiện có kém giá trị hơn một pod Sharpe 0.5 correlation 0.0 — chính là bài toán giá trị biên ở 15.13, nay nâng lên cấp tổ chức và nhân với đòn bẩy.

Và nó khép lại tấm bản đồ. Từng loài trong bảng, đứng một mình, chỉ là một mảnh Sharpe khiêm tốn với một cách chết riêng — pairs chết vì win-rate xói mòn, carry chết vì cái đuôi, index-arb chết vì crowding, macro nghẹt vì breadth thấp. Nhưng ghép đúng — trực giao, được risk-managed, được phân bổ vốn động và leverage — chúng biến thành cỗ máy compound mạnh nhất trong tài chính. Bản đồ chiến lược, đọc cho đúng, không phải một danh sách để chọn lấy *một*, mà là bảng nguyên liệu để *tổ hợp*. Câu hỏi "chiến lược nào tốt nhất" tan biến; câu hỏi thay thế nó — "làm sao ghép nhiều thứ tầm thường không tương quan thành một thứ phi thường" — chính là nghề.

# Chương 16: Trading theo asset class

Mọi thứ đến giờ — momentum 12-1, pairs OU, factor model, Kelly, deflated Sharpe — được kể chủ yếu trên một sân khấu: cổ phiếu Mỹ thanh khoản. Đó là chọn lựa sư phạm có lý do. Equity là asset class có dữ liệu dày nhất, cross-section rộng nhất (breadth cao, đúng thứ Fundamental Law thèm khát), và intuition dễ nhất cho người mới: ai cũng hiểu "mua công ty tốt, bán công ty tệ". Nhưng alpha buy-side không sống trong một cái hộp. Một pod shop như Millennium hay một macro fund như Brevan Howard trade FX, rates, commodities, credit, và ngày càng cả crypto — và mỗi asset class có **microstructure riêng, nguồn carry riêng, và cạm bẫy riêng**. Bê nguyên bộ đồ nghề equity sang một sân khấu khác, bạn sẽ không chỉ kém hiệu quả — bạn sẽ chết theo những cách rất cụ thể mà chương này đặt tên.

Câu hỏi tổ chức của chương không phải "chiến lược nào" — đó là chương 15. Câu hỏi ở đây tinh tế hơn: **cùng một họ alpha (carry, value, momentum) thay hình đổi dạng thế nào khi asset class thay đổi, ai trả tiền cho nó, và nó chết ra sao?** Xuyên suốt bốn asset class dưới đây có một sợi chỉ đỏ: gần như mọi thứ ngoài equity đều có **carry** làm nguồn return nền tảng — bạn được trả tiền chỉ để *giữ* vị thế, độc lập với chuyện giá đi đâu. Hiểu carry ở bốn nơi này là hiểu chừng 60% alpha macro. Và đi kèm nó là một sự thật khó chịu lặp đi lặp lại đến mức thành định luật của chương: **carry là bán bảo hiểm** — thu premium đều đặn nhiều tháng, rồi thỉnh thoảng bị xé nát trong vài phiên. Skew âm không phải tai nạn; nó là cái giá bạn ký nhận khi mở vị thế.

## 16.1 FX — carry, value, momentum trên tiền tệ

FX là thị trường lớn nhất hành tinh (~7.5 nghìn tỷ USD/ngày theo khảo sát BIS), thanh khoản khủng, nhưng breadth *thấp* đến bất ngờ. G10 chỉ có 10 đồng tiền, nghĩa là ~45 cặp, và các cặp tương quan chặt với nhau vì gần như cặp nào cũng là "USD đối lấy một cái gì đó". Đây là bài học đầu tiên đi ngược equity: bạn không có 1000 cổ phiếu độc lập để rải cược. Fundamental Law nói $IR \approx IC\sqrt{BR}$ — với $BR$ nhỏ, bạn *bắt buộc* phải có $IC$ cao hơn hoặc holding period dài hơn để bù lại. Cụ thể bằng số: một stat-arb equity với $IC=0.03$ và $BR=1000$ cược độc lập/năm cho $IR \approx 0.03\sqrt{1000} \approx 0.95$; một FX book muốn cùng $IR \approx 0.95$ nhưng chỉ có $BR \approx 20$ cược độc lập/năm thì cần $IC \approx 0.95/\sqrt{20} \approx 0.21$ — gấp bảy lần. Không phải ngẫu nhiên mà FX quant sống bằng một số ít chiến lược cổ điển được nghiên cứu 40 năm, mỗi cái là một risk premium bền chứ không phải một signal mỏng ăn xổi.

### Carry trade và bí ẩn forward premium

Nền tảng lý thuyết là **uncovered interest parity (UIP)**: đồng tiền lãi suất cao *nên* mất giá đúng bằng chênh lệch lãi suất, để nhà đầu tư không kiếm được gì từ việc chuyển vốn sang nơi lãi cao. Thực tế thì UIP **sai một cách hệ thống**, và chính chỗ nó sai là carry trade. Bạn vay đồng lãi suất thấp (funding, ví dụ JPY), mua đồng lãi suất cao (target, ví dụ AUD), và trung bình qua thời gian đồng lãi suất cao *không* mất giá đủ để triệt tiêu chênh lệch. Phần chênh lệch còn sót lại chảy vào túi bạn dưới dạng carry return.

Tính bằng số. Giả sử lãi suất qua đêm AUD 4.35%/năm, JPY 0.10%/năm — mặt bằng điển hình của một chu kỳ nới lỏng kéo dài của BoJ. Carry gross $= 4.35\% - 0.10\% = 4.25\%$/năm. Nếu tỷ giá AUD/JPY đứng yên cả năm, bạn lãi 4.25% chỉ để cầm vị thế. Điểm cốt tử: đây là return *không cần giá đi đúng hướng* — đó là dấu vân tay của một risk premium thật, khác hẳn một dự báo (nơi bạn chỉ ăn tiền nếu đoán đúng chiều giá).

Cách chuyên nghiệp không phải trade một cặp mà build một **G10 carry basket**. Recipe từng bước:

1. Với mỗi đồng trong G10, lấy lãi suất ngắn hạn. Mẹo thực chiến: proxy bằng 3M forward points quy ra annualized, vì forward chứa đúng chênh lệch lãi suất qua covered interest parity — bạn khỏi cần đi lấy lãi suất niêm yết ở từng nước với quy ước day-count khác nhau.
2. Rank 10 đồng theo lãi suất từ cao xuống thấp.
3. Long 3 đồng lãi suất cao nhất, short 3 đồng lãi suất thấp nhất; mỗi rổ equal-weight; rồi vol-scale cả cấu trúc để đạt vol mục tiêu (ví dụ 8%/năm).
4. Rebalance hàng tháng khi ranking đổi.

Con số lịch sử điển hình cho một rổ như vậy (theo các nghiên cứu của AQR và Deutsche Bank): return ~5%/năm, vol ~9%/năm, **Sharpe trước phí ~0.6-0.7**. Nghe khiêm tốn so với momentum equity Sharpe ~0.9? Đúng — nhưng con số Sharpe một mình nói dối trắng trợn ở đây, và mục tiếp theo cho biết nó giấu gì.

### Cạm bẫy carry unwind: skew âm là bản chất, không phải tai nạn

Carry trade có phân phối return **lệch trái nặng**. Skewness của G10 carry return đo được thường nằm quanh $-1.0$ đến $-1.5$, so với ~0 của một chiến lược trung tính. Con số đó có nghĩa rất cụ thể: nhiều tháng lãi nhỏ đều đặn, rồi thỉnh thoảng một tháng mất 3-4 lần độ lệch chuẩn. Vì sao? Vì carry trade là **short volatility ngụy trang**. Bạn đang bán bảo hiểm cho hệ thống tài chính: khi thị trường bình yên, bạn thu premium; khi hoảng loạn (risk-off), *mọi* carry trade bị unwind cùng một lúc vì ai cũng đang cùng một vị thế (crowding — chương 14), thanh khoản bốc hơi, và đồng funding lãi suất thấp (JPY, CHF — những "safe haven") tăng vọt đúng lúc đồng target lãi suất cao sập.

Hai ví dụ số về unwind, cần tách bạch cẩn thận vì trong sách vở hai mốc này hay bị kể lẫn vào nhau. Đỉnh stress LTCM/Nga rơi vào **tháng 8-9/1998**: Nga vỡ nợ ngày 17/8/1998, LTCM cận kề sụp đổ, và mọi carry trade toàn cầu (khi đó chủ yếu là long USD/JPY, tức short yen để funding) chịu áp lực suốt nhiều tuần. Nhưng *cú unwind hai ngày kinh điển* lại đến muộn hơn: **7-8/10/1998**, USD/JPY sập từ ~131 xuống ~112 — yen tăng vọt khoảng 14.5% chỉ trong hai phiên khi các quỹ đồng loạt đóng vị thế short-yen. Đây mới là "carry unwind trong vài ngày" mà giáo trình hay trích. Đừng gộp hai mốc làm một: tháng 8 là stress kéo dài cả một mùa, tháng 10 là cú sập nén vào hai ngày. Nếu tính từ đỉnh mùa hè ~147 xuống ~112 thì đó là mất khoảng 24%, nhưng đó là suy giảm dàn qua *cả một mùa*, không phải một tuần — phân biệt được ba con số này (14.5% trong hai ngày, ~24% cả mùa) là phân biệt được cú sốc với xu hướng.

Cú thứ hai gần đây và sạch hơn để nhìn: **5/8/2024**. BoJ tăng lãi 15bps bất ngờ ngày 31/7, JPY tăng khoảng 8% trong ba ngày, quỹ carry toàn cầu unwind hàng loạt, và VIX vọt lên ~65 intraday sáng thứ Hai 5/8. Hãy đọc cú này qua lăng kính vol. Một rổ carry vol 9%/năm có daily vol $= 9\%/\sqrt{252} \approx 0.567\%$/ngày. Một cú $-8\%$ trên nền đó là $8\%/0.567\% \approx 14$ độ lệch chuẩn ngày. Phân phối normal nói một biến cố 14-sigma không xảy ra một lần nào trong suốt tuổi vũ trụ; thực tế nó xảy ra với carry mỗi vài năm. Đó là toàn bộ lý do bạn phải size carry bằng Kelly *phân số nặng* (chương sizing) và không bao giờ tin vol Gaussian khi ước tail. Ai mua Sharpe 0.7 mà không biết mình đang short một quả bom tail sẽ bị margin call đúng vào phiên tệ nhất — và margin call là cơ chế biến drawdown giấy thành mất vốn thật.

### Value (PPP) trên FX — dẫn xuất một trade bằng số

Chân thứ hai của "kiềng ba chân FX quant". **Value** dùng purchasing power parity: đồng tiền lệch xa giá trị PPP (đắt hoặc rẻ so với một rổ hàng hóa) có xu hướng mean-revert về, nhưng cực chậm — half-life ước lượng thực nghiệm **3-5 năm**. Đừng dừng ở "Big Mac nói CHF đắt" rồi nhảy thẳng sang Sharpe; hãy dẫn xuất một trade thật, từng bước, ra được cả P&L lẫn sức chịu đựng.

1. **Đo độ lệch PPP.** Big Mac index là proxy PPP thô nhưng đủ minh họa. Burger tại Thụy Sĩ \$8.10, tại Mỹ \$5.70. PPP ngụ ý CHF nên "đắt" đúng theo tỷ lệ $8.10/5.70 = 1.42$ so với USD nếu quy về sức mua hàng hóa. Nếu tỷ giá thị trường chỉ định giá chênh khoảng $1.09$, thì CHF đang **overvalued** $8.10/5.70 - 1 = +42\%$ theo Big Mac. Big Mac thường phóng đại vì burger có thành phần phi thương mại (mặt bằng, nhân công); một giỏ hàng OECD rộng hơn cho con số ôn hòa hơn, cỡ $+20\%$. Lấy mức thận trọng ở giữa: CHF đắt hơn giá trị PPP **+25%**.
2. **Chuẩn hóa thành z-score.** Không trade trên mức thô, mà trên độ lệch so với lịch sử của chính cặp đó — vì mỗi đồng có "chuẩn" riêng. Giả sử độ lệch PPP của USD/CHF có mean lịch sử $+5\%$ (CHF thường đắt nhẹ do "safe haven premium" mang tính cấu trúc) và std $10\%$. Z-score value $= (25\% - 5\%)/10\% = +2.0$. CHF đang đắt hai độ lệch chuẩn so với chuẩn của chính nó → tín hiệu **short CHF** mạnh.
3. **Ra size.** Cross-sectional là cách đúng: rank z-score value của cả G10, long 3 đồng rẻ nhất (z âm nhất), short 3 đồng đắt nhất (CHF nằm trong nhóm này), rồi vol-scale rổ về 8%/năm như carry. Nếu vì lý do nào đó chỉ trade CHF đơn lẻ với target vol 8% trong khi vol USD/CHF ~7%/năm, weight $= 8\%/7\% \approx 1.14$ notional trên vốn, chiều short.
4. **Ra P&L kỳ vọng và sức chịu đựng.** Với half-life 4 năm, tốc độ hồi $\kappa \approx \ln 2 / 4 \approx 0.17$/năm. Đóng góp kỳ vọng của năm đầu từ mean-reversion $\approx \kappa \times$ độ lệch $= 0.17 \times 25\% \approx 4.3\%$ hồi về — nhưng số này bị dàn mỏng qua nhiều năm và chìm trong nhiễu vol 7%/năm. Tỷ lệ tín hiệu trên nhiễu năm đầu chỉ cỡ $4.3\%/7\% \approx 0.6$, và đó chính là lý do value FX đơn lẻ chỉ đạt **Sharpe ~0.3-0.4**: tín hiệu là thật nhưng chậm, và năm nào CHF cũng có thể đắt thêm nữa (z leo lên +3) trước khi chịu hồi.

Value FX yếu khi đứng một mình, nhưng có một tính chất vàng: nó **tương quan âm với carry**. Đồng high-carry thường đã đắt (lãi suất cao hút vốn vào, đẩy giá lên), nên value hay short đúng cái đồng mà carry đang long — hai chiến lược ngược pha. Blend carry + value + momentum, với correlation từng đôi thấp, cho Sharpe tổ hợp ~0.9-1.0. Đây lại đúng Fundamental Law nhìn từ góc khác: khi không có breadth qua *tài sản* (chỉ 10 đồng tiền), bạn tạo breadth qua *chiến lược* — ba nguồn alpha độc lập trên cùng một universe cũng làm tăng $BR$ hiệu dụng.

### Momentum FX — dẫn xuất một trade bằng số

**Momentum FX** (time-series trend): dùng return 3-12 tháng của chính đồng tiền, long đồng đang lên và short đồng đang xuống. Đây là em họ của trend-following CTA (mục 16.3). Dẫn xuất từng bước để không rơi vào lý thuyết suông:

1. **Đo tín hiệu.** Lấy AUD/USD: giả sử 6 tháng qua tăng từ 0.640 lên 0.691, tức return $(0.691-0.640)/0.640 \approx +8\%$. Signal momentum $= +8\%$ (dương → xu hướng lên).
2. **Chuẩn hóa và ra hướng.** Vol AUD/USD ~10%/năm, tức vol 6 tháng $\approx 10\%/\sqrt{2} \approx 7.1\%$. Momentum score chuẩn hóa $= 8\%/7.1\% \approx +1.1$ → tín hiệu **long AUD/USD** vừa phải, không cực đoan.
3. **Ra size.** Target vol vị thế 8%/năm, vol tài sản 10% → weight $= 8\%/10\% = 0.8$ notional trên vốn, chiều long. Trên rổ cross-sectional: long đồng momentum cao nhất, short thấp nhất, mỗi bên equal-weight rồi vol-scale cả rổ.
4. **Kết quả kỳ vọng.** Time-series momentum FX có hit-rate ~53-55% và Sharpe ~0.5. Trade AUD long cụ thể này: nếu xu hướng tiếp diễn thêm $+4\%$ trong 3 tháng tới với weight 0.8, đóng góp $0.8 \times 4\% = 3.2\%$ trên vốn; nếu đảo chiều $-4\%$, mất đúng $3.2\%$. Momentum sống bằng *phân phối lệch phải nhẹ* — nhiều cú nhỏ hòa vốn hoặc lỗ vặt, thỉnh thoảng một trend to bù lại tất cả — ngược hẳn với hình dạng của carry.

Điểm vàng khép lại kiềng ba chân: momentum FX **tương quan âm với carry đúng vào lúc quan trọng nhất**. Khi carry unwind ngày 5/8/2024, AUD/JPY sập rất nhanh, và chính cú sập đó lật signal momentum sang short AUD/JPY — momentum "cắt lỗ" hộ carry ngay trong tail. Đây là lý do rất nhiều macro fund chạy carry + trend song song: không phải vì mỗi cái Sharpe cao, mà vì cặp này hedge nhau đúng ở chỗ carry yếu nhất.

## 16.2 Rates và macro systematic — carry, roll-down, và cái giá của breadth thấp

Nếu FX breadth thấp thì rates còn thấp hơn. Universe systematic macro cốt lõi có thể chỉ là ~10-15 bond futures (US, Bund, JGB, Gilt, cùng vài điểm curve 2Y/5Y/10Y/30Y), lên tới vài chục nếu tính cả swap và inflation. Đây là cực đối lập hoàn toàn với stat-arb equity hàng nghìn tên. Hệ quả rút thẳng từ Fundamental Law: với $BR$ chỉ vài chục cược độc lập/năm, để đạt $IR$ tử tế bạn cần **IC cao bất thường**. Một macro trader giỏi có IC trên từng cược lớn (0.1-0.2) nhưng cược *ít và to* — ngược hẳn triết lý equity "IC bé nhân với vạn cược". Cụ thể: $BR=25$ và muốn $IR=1.0$ thì cần $IC=1.0/\sqrt{25}=0.2$. Đây là lý do macro là nghề của người có view sâu, không phải người có nhiều signal; và cũng là lý do nó khó chứng minh — nói ở cuối mục.

### Bond carry và roll-down — nguồn return nền

Trên một bond hay bond future, carry có hai thành phần và cả hai đo được bằng số. **Carry thuần** = coupon yield trừ chi phí funding (repo). **Roll-down** = lời/lỗ do trái phiếu "trượt" dọc theo yield curve khi thời gian trôi, *giả định curve giữ nguyên hình dạng*.

Dẫn xuất roll-down đầy đủ. Giả sử curve: điểm 5Y yield 4.00%, điểm 4Y yield 3.80% — curve dốc lên (upward-sloping). Bạn mua trái phiếu 5Y hôm nay. Sau một năm, nếu curve *không đổi hình dạng*, trái phiếu 5Y của bạn giờ đã trở thành một trái phiếu 4Y; thị trường định giá lại nó theo yield 3.80% thay vì 4.00%. Yield trên chính trái phiếu đó tụt 20bps. Với duration ~3.7 của một trái phiếu 4Y, giá tăng $\approx 3.7 \times 0.20\% = 0.74\%$ — đây là roll-down.

Bây giờ ghép nốt carry thuần để ra total carry+roll bằng một phép cộng minh bạch, vì đây là chỗ số hay bị nói lửng. Coupon của trái phiếu 5Y giả sử ~4.0%/năm. Nếu ta ở trong môi trường curve tiền tệ đảo (short-rate cao hơn), repo funding có thể ~4.3%/năm → carry thuần $= 4.0\% - 4.3\% = -0.3\%$/năm, âm nhẹ. Cộng roll-down $+0.74\%$: total carry+roll $= -0.3\% + 0.74\% = +0.44\%$/năm. Trong môi trường curve dốc lên bình thường (repo thấp hơn coupon, ví dụ repo 3.5% → carry thuần $+0.5\%$), total lên tới $+0.5\% + 0.74\% \approx +1.2\%$/năm. Khoảng **$+0.4\%$ đến $+1.2\%$/năm** tùy điểm curve và môi trường funding — toàn bộ phần thưởng đó đến từ việc chỉ *giữ* trái phiếu, không cần yield thị trường đi đâu.

Đây là nguồn alpha carry của rates: rank các bond/curve theo carry+roll-down, long cái cao nhất, short cái thấp nhất, hedge duration để trung tính với lãi suất chung. Một rổ như vậy có Sharpe ~0.5-0.7 và — theo đúng motif đã thành quen — **skew âm**: carry+roll kiếm tiền đều đặn khi curve ổn định, rồi mất đậm khi có shock lãi suất đột ngột (bond selloff kiểu 2022, hay một cú flattening bất ngờ). Lại là bán bảo hiểm, lần này bảo hiểm rủi ro lãi suất.

### Curve steepener/flattener

Đây là cược trực tiếp lên *hình dạng* curve, không phải lên mức lãi suất chung. **Steepener**: long điểm ngắn (2Y), short điểm dài (10Y) đã duration-weight, ăn tiền khi spread 2s10s nới rộng (curve dốc thêm). **Flattener** thì ngược lại. Ví dụ số cụ thể: 2s10s spread hiện tại $-40\,\text{bps}$ — curve đảo, điển hình cuối chu kỳ thắt chặt. View của bạn: Fed sắp cắt lãi, curve sẽ steepen về $+50\,\text{bps}$. Bạn đặt cược steepener DV01-neutral. Nếu spread đi từ $-40$ đến $+50$, đó là 90bps thay đổi spread; với position sized để mỗi bp spread đổi = \$10k P&L, bạn kiếm $90 \times \$10{,}000 = \$900{,}000$.

Nhưng đừng để chữ "neutral" ru ngủ. Steepener DV01-neutral trung tính với dịch chuyển song song của curve, nhưng *không* trung tính với "curve twist" hay convexity — bạn vẫn còn exposure bậc hai, và đó chính là nơi carry của trade nằm. Cụ thể: khi curve đảo, chân ngắn 2Y có yield cao hơn chân dài 10Y, nên vị thế long-2Y/short-10Y của bạn *thu* coupon cao ở chân long nhưng *trả* coupon thấp hơn ở chân short — thoạt nghe có carry dương. Nhưng roll-down đảo dấu: trên một curve đảo, cả hai điểm roll về hướng bất lợi cho steepener, và net carry+roll của một 2s10s steepener khi curve đảo thường **âm**, cỡ $-2$ đến $-5\,\text{bps}$/tháng tức $-0.3\%$ đến $-0.6\%$/năm. Nói cách khác, bạn *trả tiền để chờ view đúng* — negative carry là phí kiên nhẫn. Nếu Fed cắt chậm hơn dự kiến và trade mất một năm mới về $+50$, bạn đã đốt cỡ nửa phần trăm/năm chỉ để giữ vị thế. Đây là lý do timing quan trọng với steepener theo cách nó không quan trọng với carry basket: một cái ăn tiền khi đứng yên, cái kia chảy máu khi đứng yên.

### Nowcasting growth/inflation — macro có dữ liệu, không phải bói

Macro systematic hiện đại không đoán mò; nó **nowcast** — ước lượng thời gian thực GDP growth và inflation từ hàng trăm chỉ báo *trước khi* số chính thức được công bố. Nhưng câu "gom 200 chuỗi, chạy PCA, ra $+1.2\sigma$" mà không cho một phép tính z-score cụ thể thì tự nó cũng là lý thuyết suông. Hãy dẫn xuất một nowcast mini bằng ba chuỗi thật để bạn làm lại được bằng tay — quy trình công nghiệp chỉ là chính cái này nhân lên hàng trăm lần.

| Chuỗi | Giá trị mới | Mean lịch sử | Std | Z-score |
|---|---|---|---|---|
| ISM Manufacturing PMI | 47.0 | 52.0 | 3.0 | $(47-52)/3 = -1.67$ |
| Initial jobless claims (đảo dấu) | 260k | 230k | 25k | $-(260-230)/25 = -1.20$ |
| Retail sales MoM (%) | +0.1 | +0.4 | 0.3 | $(0.1-0.4)/0.3 = -1.00$ |

Bước chuẩn hóa: mỗi chuỗi $z_i = (x_i - \mu_i)/\sigma_i$, rồi **đảo dấu** những chuỗi mà "cao = xấu cho growth" (jobless claims cao nghĩa là thị trường lao động yếu, nên nhân $-1$ để mọi z-score cùng quy ước "cao = growth mạnh"). Ba z-score sau khi thống nhất dấu: $-1.67, -1.20, -1.00$.

Bước tổng hợp: nowcast growth = trung bình có trọng số các z-score. Trọng số đơn giản nhất là equal ($1/3$ mỗi cái): $(-1.67 - 1.20 - 1.00)/3 = -3.87/3 = -1.29\sigma$. Nếu dùng PCA hoặc dynamic factor model (chương 6 về factor, chương 4 về regime), factor đầu tiên gán trọng số theo loading — thường PMI nặng hơn (loading ~0.5) vì nó lead mạnh và ít nhiễu đo lường. Giả sử trọng số chuẩn hóa $(0.5, 0.3, 0.2)$: $0.5(-1.67) + 0.3(-1.20) + 0.2(-1.00) = -0.835 - 0.36 - 0.20 = -1.40\sigma$. Vậy **growth nowcast $\approx -1.3$ đến $-1.4\sigma$** — nền kinh tế đang yếu hơn khoảng 1.3-1.4 độ lệch chuẩn so với bình thường. Làm y hệt với một rổ chuỗi giá (CPI components, oil, wages) ra **inflation nowcast**, giả sử $-0.4\sigma$.

Cặp số này (growth $-1.3\sigma$, inflation $-0.4\sigma$, đọc là "slowdown, lạm phát đang dịu") map thẳng sang positioning: growth yếu cộng lạm phát dịu → Fed nghiêng dovish → **long duration (bond), đặt steepener, long risk một cách thận trọng**. Điểm mấu chốt không phải con số cuối mà là tính truy vết: mỗi $-1.4\sigma$ đều lần ngược được về từng chuỗi thô và từng phép chia. Đó là toàn bộ khác biệt giữa nowcast (kiểm toán được) và bói (không).

Cái đắt của macro không nằm ở mô hình — nowcast không khó — mà ở chỗ **decay chậm cộng breadth thấp** khiến bạn rất khó biết mình đúng hay chỉ may. Một chiến lược cược 20 lần/năm cần *nhiều năm* để Sharpe thật lộ ra khỏi noise. Nhớ lại công cụ deflated Sharpe: với ít cược, sampling error trên Sharpe khổng lồ. Sai số chuẩn của Sharpe ước lượng $\approx \sqrt{(1+\hat{SR}^2/2)/N}$; với một chiến lược thật sự có $SR=0.8$ nhưng chỉ 5 năm dữ liệu độc lập ($N=5$), $SE \approx \sqrt{(1+0.32)/5} \approx 0.51$ — nghĩa là khoảng tin cậy 95% trải từ $-0.2$ đến $+1.8$, không phân biệt nổi với vô dụng. Macro fund vì thế sống hay chết theo thập kỷ chứ không theo quý, và chính điều đó định hình văn hóa macro (conviction cao, chịu được drawdown dài) khác tận gốc văn hóa stat-arb (turnover cao, cắt lỗ nhanh, để dữ liệu quyết).

## 16.3 Commodities — roll yield là vua, trend là hoàng hậu

Commodities là nơi carry có tên riêng và đo được sạch nhất: **roll yield**. Đây cũng là asset class giao thoa mạnh nhất với Q-world — pricing của futures, storage cost, convenience yield đều thuộc lãnh địa sell-side (xem cuốn Q-world).

### Contango, backwardation, và cash-and-carry

Một futures curve commodity hoặc dốc lên hoặc dốc xuống. **Contango**: future kỳ hạn xa đắt hơn spot (curve dốc lên). **Backwardation**: future xa rẻ hơn spot (curve dốc xuống). Lý thuyết cash-and-carry (chương forward pricing bên Q-world) cho $F = S \cdot e^{(r + u - y)T}$, với $u$ = storage cost và $y$ = convenience yield — lợi ích của việc cầm hàng vật lý *ngay bây giờ* (một nhà máy lọc dầu cần dầu hôm nay sẵn lòng trả thêm để có nó). Khi convenience yield cao vì thiếu hàng cấp bách, $y > r+u$ → curve backwardation. Khi dư cung, kho đầy, $y$ thấp → contango.

Vì sao đây là carry cho *một quỹ không hề cầm một thùng dầu nào*? Vì một trader chỉ trade futures buộc phải **roll** vị thế trước khi hợp đồng đáo hạn: bán future gần hết hạn, mua future xa hơn. Trong backwardation, future gần *đắt* hơn future xa, nên mỗi lần roll bạn bán cao mua thấp → **roll yield dương**, kiếm tiền chỉ nhờ độ dốc đường cong, ngay cả khi giá spot đứng yên tuyệt đối.

Tính bằng số. Dầu WTI: front-month \$75.00, second-month \$74.25 (backwardation, front cao hơn). Bạn long front; đến gần hết hạn thì roll sang second: bán quanh \$75.00, mua \$74.25. Chênh \$0.75 trên nền \$74.25 mỗi tháng $= 0.75/74.25 = 1.01\%$/tháng. Annualize: nếu ghép lãi kép và giả định curve giữ hình dạng, $(1.0101)^{12} - 1 = 12.8\%$/năm; xấp xỉ tuyến tính $1.01\% \times 12 \approx 12.1\%$/năm. Cả hai cách đều nói **~12-13%/năm roll yield dương** chỉ nhờ đường cong. Ngược lại, khí gas trong contango: front \$2.80, second \$2.95 → roll yield $-(2.95-2.80)/2.80 = -5.4\%$/tháng, ghép lại $(1-0.054)^{12}-1 \approx -48\%$/năm nếu long. Đây chính là cỗ máy nghiền tiền của các ETF long commodity ngây thơ: USO đầu 2020 rơi vào contango cực sâu (super-contango khi giá dầu âm), ăn mòn NAV bất kể giá dầu spot làm gì, có phiên mất hơn 20% một phần vì roll cost khi curve dựng đứng.

Chiến lược carry commodity vì thế là: rank ~20-30 commodity futures theo độ dốc curve (roll yield ngụ ý), long cái backwardation nhất, short cái contango nhất, vol-scale rổ. Sharpe lịch sử ~0.5-0.7. Cạm bẫy quen thuộc: các commodity đang backwardation nặng thường *đang* ở giữa một supply shock (thiếu hàng cấp bách đẩy convenience yield lên), mà supply shock có thể đảo chiều dữ dội khi nguồn cung hồi phục — nên rổ này lại **skew âm** đúng khi supply shock đảo pha. Motif carry-là-bán-bảo-hiểm lặp lại lần thứ tư, ở một asset class hoàn toàn khác.

### Trend mạnh và seasonality

Commodities là quê hương của **trend-following** (CTA). Vì sao trend mạnh ở đây hơn ở equity? Vì cung-cầu vật lý điều chỉnh chậm: mở một mỏ đồng, khoan một giếng dầu, trồng một vụ ngũ cốc đều mất nhiều tháng đến nhiều năm. Mất cân bằng cung-cầu vì thế kéo dài thành xu hướng bền, thay vì được arbitrage về ngay. Time-series momentum (long cái đang lên, short cái đang xuống, dựa trên return 3-12 tháng, vol-scaled) trên một rổ ~50-100 futures đa asset là chiến lược CTA kinh điển — Sharpe ~0.6-0.8. Điểm sống còn về hình dạng: trend có **long volatility profile**, skew *dương*. Trend kiếm đậm nhất đúng vào lúc thị trường khủng hoảng và có xu hướng lớn (2008, tháng 3/2020), nên CTA là hedge tự nhiên cho carry. Đây là lý do một macro book cân bằng thường ghép carry (short vol, skew âm) với trend (long vol, skew dương): carry nuôi P&L những ngày thường, trend trả tiền vào ngày tận thế.

**Seasonality** là alpha đặc thù commodity gần như không tồn tại ở asset khác, vì nó bắt rễ từ vật lý: nhu cầu khí sưởi mùa đông, xăng lái xe mùa hè, ngũ cốc theo mùa vụ gieo gặt. Ví dụ: natural gas thường có bias tăng vào cuối thu do tích trữ trước mùa đông. Một tín hiệu seasonal đơn giản: long gas future trong tháng 9-11 lịch sử cho hit-rate ~60% và trung bình +2-3%/trade.

Nhưng đừng để con số đó lửng lơ — hãy nối nó ra kỳ vọng, Sharpe, và cái bẫy đằng sau. Một trade seasonal mỗi năm, giả sử mean $+2.5\%$/trade với std của kết quả trade ~$8\%$: **kỳ vọng năm $+2.5\%$**, và Sharpe trên chuỗi trade độc lập $\approx 2.5\%/8\% \approx 0.31$ *mỗi năm*. Nghe ổn — nhưng đây là bẫy cỡ mẫu. Với chỉ một quan sát mỗi năm, sau 15 năm bạn có đúng **15 mẫu**. Sai số chuẩn của Sharpe ước lượng $\approx \sqrt{(1+\hat{SR}^2/2)/N} \approx \sqrt{(1+0.05)/15} \approx \sqrt{1/15} \approx 0.26$ — gần bằng chính giá trị Sharpe. Nói cách khác, Sharpe 0.31 với 15 mẫu *không phân biệt được với 0* ở mức tin cậy thông thường; khoảng tin cậy của nó ôm trọn số 0.

Đây là nơi deflated Sharpe và purged CV (chương 9) là lằn ranh giữa alpha và ảo giác. Seasonality là mảnh đất **overfit** màu mỡ bậc nhất: 12 tháng × N commodity = vô số pattern chờ được đào bới. Nếu bạn thử 100 tổ hợp cửa-sổ-tháng × commodity để chọn ra cái "long gas 9-11" đẹp nhất, ngưỡng deflated Sharpe là $SR_0 = \sqrt{2\ln N / T}$ với $N=100$ cấu hình và $T=15$ năm $= \sqrt{2 \times 4.6 / 15} \approx 0.78$. Sharpe quan sát 0.31 nằm *dưới xa* ngưỡng 0.78 cần có để tin đó không phải may. Một pattern seasonal trông "hoàn hảo" trên 15 năm chỉ có ~15 lần lặp thật: cỡ mẫu để tự lừa mình dễ đến mức nguy hiểm, và deflated Sharpe là cái phanh.

### Cross sang Q-world

Commodities là điểm P/Q rõ nét nhất trong cả cuốn. Bên Q, người ta pricing options trên commodity futures bằng Black-76 (chương tương ứng bên Q-world), model storage và mean-reversion cho power và gas, và định giá Asian options (payoff trên giá trung bình — cấu trúc chuẩn của commodity). Bên P, alpha thú vị nằm đúng ở **ranh giới**: variance risk premium trên commodity vol (bán vol commodity khi implied cao hơn realized một cách hệ thống — chính là carry short-vol lần nữa), hay đọc dealer positioning và hedging flows từ nhà sản xuất commodity (producer hedge bằng cách bán forward → tạo áp lực bán có thể trade quanh). Ai nói được cả hai ngôn ngữ P và Q sẽ trade được thứ mà rất ít người chạm tới.

## 16.4 Crypto — thị trường non, carry lộ thiên, và rủi ro sàn sập

Crypto là asset class trẻ nhất và "kém hiệu quả" nhất — nghĩa là còn nhiều alpha lộ thiên mà equity đã bị arbitrage sạch từ nhiều thập kỷ trước, đổi lại một loại rủi ro hạ tầng (sàn sập, hack, regulation) mà không asset class truyền thống nào có. Thị trường chạy **24/7/365**: không có phiên đóng cửa để tính overnight return, không có giờ nghỉ, mọi thứ liên tục — đòi hỏi hạ tầng vận hành và cả tâm lý khác hẳn thị trường có nhịp ngày/đêm.

### Funding rate và perpetual basis — carry lộ thiên

Instrument thống trị crypto là **perpetual swap** (perp) — một future không có ngày đáo hạn. Để giữ giá perp neo vào spot dù không bao giờ đáo hạn để hội tụ, sàn dùng cơ chế **funding rate**: nếu perp giao dịch trên spot (phe long đông), longs trả funding cho shorts định kỳ (thường mỗi 8 giờ); nếu perp dưới spot, dòng tiền chảy ngược. Funding rate này là carry **quan sát trực tiếp được** — bạn không cần model gì, sàn công bố realtime.

Điều đó sinh ra **cash-and-carry arb** sạch nhất trong tài chính hiện đại: nếu funding dương (longs trả shorts), bạn **long spot + short perp** với size bằng nhau, trung tính giá hoàn toàn (spot lên thì perp cũng lên, hai chân bù nhau), và thu funding ròng. Tính bằng số: funding rate BTC perp = 0.01%/8h, mức "bình thường" thời bull nhẹ. Đó là $0.01\% \times 3$ lần/ngày $= 0.03\%$/ngày, nhân 365 ngày (crypto không nghỉ cuối tuần) $= $ **~11%/năm**, delta-neutral, gần như không rủi ro giá. Vào thời điểm euphoria (đầu 2021, cuối 2024), funding vọt lên 0.1%/8h $= 0.3\%$/ngày → annualize **>109%/năm** — một chênh lệch điên rồ mà equity không bao giờ cho, vì ở equity mọi arb sạch cỡ này đã bị nuốt trong mili-giây.

Vì sao chưa bị arbitrage về 0? Ba lý do rất thực. Thứ nhất, vốn có giới hạn và đi kèm **rủi ro sàn**: tiền phải nằm trên sàn để short perp, mà sàn có thể sập (nói ở dưới). Thứ hai, rủi ro liquidation nếu quản lý margin kém khi giá biến động dữ dội — một cú wick giá có thể thanh lý chân short perp trước khi bạn kịp phản ứng. Thứ ba, chi phí vốn và ràng buộc institutional: rất nhiều quỹ đơn giản là không được phép cầm crypto. Carry này về bản chất là **được trả tiền để chịu rủi ro counterparty/sàn** — lại đúng công thức của cả chương: carry là bán bảo hiểm, ở đây là bảo hiểm cho chính rủi ro hạ tầng. Và như mọi carry, nó **skew âm**: funding dương đều đặn nhiều tháng, rồi một cú de-risk toàn thị trường (hoặc sàn của bạn sập) xóa sạch nhiều tháng thu nhập trong một đêm.

### Cross-exchange arb và on-chain signals

Vì crypto phân mảnh trên hàng chục sàn (Binance, Coinbase, OKX, Bybit, cùng vô số DEX), cùng một token có **giá khác nhau tại cùng một thời điểm** — điều bất khả ở equity Mỹ với NBBO tập trung. Cross-exchange arb là mua chỗ rẻ bán chỗ đắt. Đừng dừng ở "ăn vài bps"; dẫn xuất một round-trip đầy đủ bằng số.

BTC trên sàn A giá \$60,000 (ask), trên sàn B giá \$60,090 (bid) cùng thời điểm — chênh \$90 tức 15bps. Trade 1 BTC: mua ở A tốn \$60,000, bán ở B thu \$60,090, gross +\$90. Trừ chi phí: taker fee ~2bps mỗi chân (\$12 × 2 = \$24), phí rút/chuyển on-chain ~\$10, slippage ~2bps (\$12). Net $= 90 - 24 - 10 - 12 = +\$44$/BTC $\approx 7.3\,\text{bps}$ ròng mỗi round-trip. Nghe nhỏ, nhưng nếu chênh này lặp 20 lần/ngày với vốn \$60k xoay vòng liên tục, đó là $44 \times 20 = \$880$/ngày trên nền ~\$60k $\approx 1.5\%$/ngày — cực kỳ hấp dẫn *nếu* bạn có hạ tầng đủ nhanh. Chữ "nếu" gánh cả câu: thực tế HFT ăn phần lớn spread thường trong mili-giây, nên phần retail nhặt được chỉ là những mẩu biên còn sót.

Trường hợp cực đoan mang tính cấu trúc: "**kimchi premium**" — BTC trên các sàn Hàn Quốc có lúc đắt hơn 20-50% so với sàn Mỹ (2018, 2021) do capital control của Hàn Quốc chặn arb tự nhiên. Với chênh 30% trên 1 BTC ~\$60k = \$18,000 gross/BTC, trừ mọi phí vẫn còn khổng lồ — *nhưng* bạn không chuyển được vốn qua biên giới để đóng arb, và chính rào cản chuyển vốn đó là lý do premium tồn tại dai dẳng. Đây là bài học chung: spread nhỏ ăn được (vài bps đến vài chục bps ở round-trip thường) thì cạnh tranh khốc liệt; spread structural to (kimchi premium) thì tồn tại lâu chính vì có rào cản khiến không ai đóng được nó. Alpha dễ ăn thì không tồn tại; alpha tồn tại thì có lý do bạn không ăn được.

**On-chain signals** là alt-data đặc thù crypto và không có phiên bản ở asset khác: blockchain công khai nên bạn *thấy được* dòng tiền thật. Dẫn xuất một tín hiệu bằng z-score. Netflow BTC vào sàn (coin chảy vào exchange thường báo hiệu áp lực bán sắp tới, vì người ta chuyển coin lên sàn để bán). Giả sử netflow hôm nay $+15{,}000$ BTC/ngày, mean 90 ngày $= +2{,}000$ BTC, std $= 6{,}500$ BTC. Z-score $= (15{,}000 - 2{,}000)/6{,}500 = +2.0$ — dòng vào sàn cao hai độ lệch chuẩn so với bình thường, tín hiệu **áp lực bán ngắn hạn**. Backtest tín hiệu: giả sử với ngưỡng $z > 2$, forward return 3 ngày âm với hit-rate ~56% và mean $-0.8\%$/lần kích hoạt. Hit-rate khiêm tốn, nhưng cái quý là nó là dữ liệu *không ai có ở equity* — bạn không bao giờ thấy được ai đang chuyển cổ phiếu đi đâu, còn ở đây sổ cái công khai. Đây là biên giới alt-data còn xanh, đổi lại nhiễu cao và dễ bị "spoof" bởi chính các actor biết mình đang bị quan sát (chuyển coin lên sàn rồi rút ra để giả tín hiệu).

### Rủi ro đặc thù: sàn sập và bài học FTX/3AC

Crypto có một loại rủi ro mà backtest *không bao giờ* bắt được: **counterparty/venue collapse**. Backtest của bạn ngầm giả định tiền nằm trên sàn là tiền của bạn — một giả định sai. Tháng 11/2022, **FTX** — sàn lớn thứ hai thế giới lúc đó — sập chỉ trong vài ngày do gian lận (dùng tiền ký gửi của khách hàng cho quỹ liên kết Alameda); mọi tài khoản đóng băng, phần lớn tiền bốc hơi. Trước đó vài tháng, **3AC** (Three Arrows Capital), một quỹ crypto hàng đầu quản lý ~\$10B, phá sản tháng 6/2022 vì đòn bẩy quá mức cộng cú sập của Luna. Một chiến lược funding-carry hoàn hảo về mặt toán học, chạy trên FTX, đã mất **100% vốn** — không phải vì alpha sai, mà vì sàn giữ tiền là kẻ trộm. Đây là rủi ro **không nằm trong bất kỳ Sharpe nào** — nó là tail của tail, thứ mà mọi thống kê return đều mù.

Bài học cho crypto quant rất cụ thể và định lượng được. Phân tán vốn qua nhiều sàn (không bao giờ để tất cả một chỗ), ưu tiên self-custody và settle nhanh, và coi mỗi sàn như một counterparty có xác suất default khác 0 — tức định giá nó đúng như credit risk, tinh thần XVA bên Q-world (nơi người ta đo expected exposure và funding cost với một counterparty có thể default). Con số để định cỡ: nếu bạn ước một sàn có ~2-5%/năm xác suất sập (không hề phi lý với crypto), thì một carry 11%/năm delta-neutral chạy trên sàn đó mang **expected loss từ venue risk** cỡ $2\%\text{-}5\% \times 100\% = 2\text{-}5\%$/năm — ăn gần nửa carry. Carry ròng sau khi trừ venue risk chỉ còn $11\% - (2\%\text{ đến }5\%) = 6\%$ đến $9\%$/năm, và đó là chưa kể tail của một cú sập không chỉ mất carry mà mất toàn bộ vốn ký gửi. Trade crypto mà không định giá venue risk vào Sharpe là chưa hiểu asset class này.

Crypto vì thế vừa là nơi alpha còn nhiều nhất (thị trường non, retail đông, kém hiệu quả) vừa là nơi bạn có thể mất tất cả vì một lý do nằm hoàn toàn ngoài mô hình. Đó là bản chất của một asset class mới 15 tuổi: cơ hội và hoang dã ở chung một chỗ, và người sống sót là người không nhầm hai thứ đó với nhau.

## 16.5 Sợi chỉ chung — carry là bán bảo hiểm, breadth quyết định phong cách

Nhìn lại bốn asset class, có hai mẫu hình xuyên suốt đáng khắc vào trí nhớ. Thứ nhất: **carry ở đâu cũng là short volatility ngụy trang**. FX carry, bond carry+roll, commodity roll yield, crypto funding — bốn cái tên khác nhau cho cùng một hình dạng: thu premium đều đặn với skew âm, kiếm tiền khi thế giới bình yên và bị xé nát khi hoảng loạn ập đến cùng lúc (crowded unwind, thanh khoản bốc hơi, mọi người cùng chạy ra một cửa). Đối trọng tự nhiên của nó là **trend/momentum**, skew dương, kiếm đậm nhất đúng vào lúc khủng hoảng có xu hướng lớn. Một macro book trưởng thành ghép hai họ này để cân tail: carry nuôi P&L những ngày thường, trend trả tiền vào ngày tận thế. Hiểu điều này là hiểu vì sao carry Sharpe 0.7 nguy hiểm hơn momentum Sharpe 0.9 — Sharpe không nhìn thấy skew.

Thứ hai: **breadth định hình phong cách nghề**. Equity breadth cao dẫn tới IC bé nhân với vạn cược, turnover cao, cắt lỗ nhanh — văn hóa stat-arb. FX/rates/macro breadth thấp dẫn tới IC cao nhân với ít cược to, conviction, chịu drawdown dài — văn hóa macro. Cùng một công thức Fundamental Law $IR \approx IC\sqrt{BR}$, nhưng hai đầu của quang phổ $BR$ sinh ra hai văn hóa nghề khác nhau đến tận cách sống với drawdown. Và crypto thêm một lời nhắc cuối: có những rủi ro — venue collapse, regulation, hack — nằm hoàn toàn ngoài mọi Sharpe và mọi backtest; asset class càng non, phần rủi ro "ngoài mô hình" càng lớn, và không con số nào trong lịch sử return cảnh báo bạn về nó. Người trade nhiều asset class giỏi không phải người thuộc nhiều chiến lược, mà là người biết chính xác mỗi asset class *trả tiền cho cái gì* và *lấy đi cái gì khi bạn không để ý*.

# Chương 17: Machine learning trong tài chính

Machine learning đã là công cụ mặc định của P-world hiện đại — nhưng cũng chính vì phổ biến mà nó là nơi người mới tự bắn vào chân thường xuyên nhất. Lý do gốc rễ: tài chính là **môi trường thù địch nhất với ML mà con người từng thử áp dụng**. Không phải "khó hơn một chút" so với nhận diện ảnh hay dịch máy — mà khó theo *bản chất*, ở cả bốn trục cùng lúc: signal-to-noise cực thấp, dữ liệu non-IID và non-stationary, mẫu bé đến mức đáng thương theo chuẩn ML, và quan trọng nhất — phân phối bạn đang học *phản kháng lại chính bạn*. Chương này không dạy bạn ML (có nghìn cuốn khác); nó dạy bạn dùng ML ở tài chính mà không tự lừa mình. Sách nền của toàn bộ pipeline hiện đại là López de Prado, *Advances in Financial Machine Learning* (AFML, 2018) — mọi QR buy-side đọc nó, và mọi thứ dưới đây neo vào nó.

Trước khi vào, một câu định vị đặt tông cả chương: trong hầu hết bài toán alpha tabular ở tần suất daily, **model mạnh nhất không thắng — model có kỷ luật validation tốt nhất mới thắng**. Đây không phải lời khuyên mềm mỏng; nó là hệ quả trực tiếp của SNR thấp mà ta sắp định lượng.

## 17.1 Vì sao ML tài chính khác ML ảnh/ngôn ngữ

Bốn khác biệt dưới đây không độc lập — chúng cộng hưởng, và mỗi cái một mình đã đủ giết một pipeline ML ngây thơ.

**Thứ nhất — SNR gần bằng không.** Khi bạn train một mạng nhận diện mèo, tín hiệu (con mèo) chiếm gần như toàn bộ thông tin trong ảnh; noise chỉ là vài pixel lệch màu, và tỉ lệ signal-to-noise dễ dàng đạt 100:1 hoặc hơn. Khi bạn dự báo return cổ phiếu ngày mai, tín hiệu chiếm khoảng **2% variance** của return, 98% còn lại là noise không thể dự báo. Hãy đóng đinh con số này bằng $R^2$: một alpha daily rất tốt cho $R^2 \approx 0.01$–$0.02$ trên out-of-sample. Nghe như thất bại thảm hại theo chuẩn ML (nơi người ta khoe $R^2 = 0.95$), nhưng dịch sang information coefficient thì $IC = \sqrt{R^2}$, tức $\sqrt{0.01} = 0.10$ đến $\sqrt{0.02} \approx 0.14$ — thuộc hàng xuất sắc trong ngành. Để thấy nó xuất sắc cỡ nào, nhắc lại running example: momentum 12-1 trên top-1000 US chỉ có rank-IC trung bình ~0.025, và đó đã là một trong những factor bền nhất lịch sử. Một model đạt $IC = 0.10$ mạnh gấp bốn lần momentum thô — hiếm, và nếu bạn nghĩ mình vừa tìm ra một cái, khả năng cao hơn là bạn vừa rò rỉ dữ liệu.

Hệ quả tàn nhẫn của SNR ~ 0.02: **model càng mạnh (càng nhiều tham số, càng ít bias) thì học noise càng nhanh hơn học tín hiệu**. Một cây quyết định sâu sẽ tìm ra "quy luật" trong 98% noise trước khi chạm tới 2% tín hiệu, và quy luật đó biến mất out-of-sample. Đây là lý do trực tiếp vì sao deep learning **không** phải mặc định tốt cho alpha daily, còn gradient boosting trên feature thủ công vẫn là workhorse thắng giải ở hầu hết bài tabular — ta sẽ định lượng ở mục 17.4.

Một cách nhìn Bayesian giúp trực giác vững hơn. Với dữ liệu đủ lớn, nhiều tham số không hại — dữ liệu áp đảo prior, và model tự tìm ra cấu trúc thật. Nhưng khi tín hiệu bé và mẫu bé, mỗi tham số thừa là một kênh để model "nhớ" một cấu hình noise cụ thể. Điều then chốt: số tham số hiệu dụng phải nhỏ so với **lượng thông tin có thể dự báo**, không phải so với số điểm dữ liệu. Và lượng thông tin có thể dự báo, khi SNR ~ 0.02, là bé kinh khủng — nó là ~2% của variance chứ không phải toàn bộ 5000 điểm dữ liệu bạn tưởng mình có.

**Thứ hai — non-IID.** ML cổ điển giả định mẫu độc lập và cùng phân phối (i.i.d.). Ở tài chính, cả hai giả định vỡ. Mẫu **chồng lấn thời gian**: nếu bạn label return 10 ngày cho mỗi điểm dữ liệu hằng ngày, thì hai điểm cách nhau 1 ngày chia sẻ 9/10 quãng đường giá — chúng gần như là *cùng một quan sát* đếm hai lần. Phân phối thì **trôi theo regime** (xem Ch4): quan hệ feature→return trong regime low-vol 2017 khác hẳn regime crisis 2020. Hệ quả kỹ thuật là mọi cross-validation chuẩn (k-fold ngẫu nhiên) đều **rò rỉ**: nếu fold train và fold test chứa các mẫu chồng lấn, model "gian lận" bằng cách nhớ mẫu gần kề, và điểm CV đẹp giả tạo. Cross-validation chuẩn phải thay bằng **purged & embargoed CV** (xem Ch9) — purge bỏ các mẫu train chồng lấn với test, embargo chèn khoảng đệm sau test để chặn rò rỉ do autocorrelation. Bỏ qua bước này là nguồn số một của backtest đẹp mà live chết.

**Thứ ba — dữ liệu bé.** 20 năm dữ liệu daily chỉ khoảng **5000 điểm/chuỗi**. Deep learning hiện đại ăn hàng triệu đến hàng tỉ mẫu; bạn có 5000. Cross-section cứu một phần: 3000 cổ phiếu × 5000 ngày = 15 triệu quan sát nghe có vẻ nhiều. Nhưng correlation cross-sectional làm **N hiệu dụng nhỏ hơn nhiều**. Vào một ngày market xuống 3%, gần như mọi cổ phiếu xuống cùng, nên 3000 quan sát của ngày đó mang lượng thông tin độc lập gần bằng *một*. Ước lượng thô cho trực giác: nếu correlation trung bình cặp cổ phiếu là $\rho \approx 0.3$, thì các return cross-section không phải 3000 khối độc lập mà co lại thành cỡ vài "khối" độc lập — phần lớn phương sai chung nằm ở một market factor. Nhân với số "khối thời gian" độc lập thật sự (regime chỉ đổi vài lần mỗi năm, nên 20 năm cho vài trăm khối độc lập, không phải 5000), số degrees-of-freedom thật để học một quy luật *market-wide* rơi vào hàng trăm, không phải hàng triệu. Đây là lý do một model với vài trăm nghìn tham số gần như chắc chắn overfit: nó có nhiều tham số hơn số bằng chứng độc lập theo bậc độ lớn.

**Thứ tư — adversarial.** Đây là khác biệt không có ở bất kỳ lĩnh vực ML nào khác, và là cái sâu nhất. Con mèo không thay đổi hình dạng vì bạn nhận diện được nó. Nhưng **phân phối return thay đổi *vì* bạn hành động**: khi bạn (và những người dùng cùng feature) trade theo một signal, giá dịch chuyển đến khi signal hết lời — alpha bị arbitrage. Bạn không học một phân phối cố định; bạn học một phân phối đang *chống lại* việc bị học. Nói theo ngôn ngữ lý thuyết trò chơi: không phải supervised learning trên nature ngẫu nhiên, mà là chơi với một đối thủ thích ứng. Hệ quả thực chiến: một signal ML "sạch" trên backtest 2010–2018 có thể đã bị crowd out từ 2019 — không phải vì code sai, mà vì thị trường đã học *bạn*. Không có regularizer nào chữa được điều này; chỉ có việc liên tục tìm edge mới và giám sát decay của edge cũ.

Bốn trục này gộp lại thành một câu: **ở tài chính, khả năng overfit của bạn gần như vô hạn, còn tín hiệu thật thì gần như vô hình.** Toàn bộ pipeline AFML dưới đây là các cơ chế kỷ luật để sống sót trong nghịch cảnh đó.

## 17.2 Pipeline AFML — chuẩn thực hành hiện đại

Điểm cách mạng của AFML không phải một thuật toán mới, mà là **đảo ngược quy trình**. Amateur backtest 1000 cấu hình rồi chọn cái đẹp nhất, và tự lừa mình bằng multiple testing (Ch9). AFML *nghiên cứu bằng feature importance trước, xác nhận bằng backtest sau* — backtest là bước cuối cùng để bác bỏ một giả thuyết đã có lý thuyết, không phải công cụ để mò tìm giả thuyết. Năm trụ cột: triple-barrier labeling, meta-labeling, sample weights, feature importance đúng cách, cộng một đặc sản tài chính là fractional differentiation.

### 17.2.1 Triple-barrier labeling

Cách label ngây thơ — "return $H$ ngày tới dương hay âm?" — có ba bệnh. Nó bỏ qua path (giá có thể đã chạm stop-loss trước khi hồi); nó dùng horizon cố định không khớp cách vị thế thật được quản; và nó không scale theo vol nên label của cổ phiếu êm và cổ phiếu dữ không so sánh được. **Triple-barrier** chữa cả ba: mỗi mẫu có ba barrier — profit-take (trên), stop-loss (dưới), và time-out (dọc); label theo barrier **chạm trước**.

Bằng số, giữ nguyên ví dụ nền: entry ở 100, profit-take 102 (đặt ở $+2\sigma$), stop-loss 99 (ở $-1\sigma$), time-out 10 ngày. Giả sử đường giá diễn ra: 100 → 101.5 → 99.8 → **102.3 (ngày 6)**. Ở ngày 6 giá chạm barrier lời trước tiên, nên label là **+1, holding 6 ngày**. Nếu thay vào đó đường giá lình xình đến ngày 10 mà chưa chạm barrier ngang nào và kết ở 100.7, barrier dọc (time-out) chạm trước → label **0** (hoặc lấy sign của return cuối, tùy thiết kế).

So sánh trực tiếp với label "return 10 ngày > 0?" cho thấy vì sao điều này quan trọng. Trên *cùng một đường giá*, fixed-horizon có thể cho label **ngược hẳn** tùy điểm cắt ngẫu nhiên rơi vào. Giả sử sau khi chạm 102.3 ở ngày 6, giá quay đầu và đúng ngày 10 tụt về 99.5. Fixed-horizon nhìn vào mỗi ngày 10, thấy 99.5 < 100, dán nhãn **−1** — dù thực tế vị thế đã được chốt lời **+2.3%** ở ngày 6 từ lâu và không còn mở. Model học từ nhãn fixed-horizon sẽ học một bài học sai hoàn toàn về đường giá này. Triple-barrier khớp với cách vị thế thật được quản (có profit-take, stop-loss, time stop), khiến bài học của model *ăn khớp với hành vi trade*.

Điểm tinh tế thường bị bỏ: barrier **scale theo vol từng tên**. Nếu profit-take = $2\sigma_i$ với $\sigma_i$ là vol daily của cổ phiếu $i$, thì với cổ phiếu êm ($\sigma_i = 1\%$/ngày) barrier lời ở +2%, còn cổ phiếu dữ ($\sigma_i = 3\%$/ngày) barrier lời ở +6%. Nhờ vậy label "+1" mang cùng ý nghĩa thống kê — "một cú đi lời cỡ 2 sigma" — bất kể tên. Không scale theo vol, model sẽ học ra rằng "cổ phiếu biến động mạnh luôn +1" (vì chúng chạm barrier cố định dễ hơn), một quy luật vô nghĩa chỉ phản ánh vol chứ không phản ánh alpha. Trong repo, đây đúng là vai của module `labeling` (triple-barrier) bên `src/alpha`.

Còn một quyết định thiết kế hay bị quên: chọn *thời điểm* đặt entry. Không nên label mọi ngày (mẫu chồng lấn nặng, và phần lớn ngày không có cơ hội trade thật); nên trigger entry bằng một sự kiện — breakout, một mean-reversion signal, hoặc CUSUM filter phát hiện dịch chuyển tích lũy đủ lớn — rồi chỉ label các điểm sự kiện đó. Việc này vừa giảm chồng lấn vừa khiến mỗi mẫu là một *cơ hội trade thật*, không phải một ngày tùy tiện.

### 17.2.2 Meta-labeling — ý tưởng hữu dụng nhất AFML

Đây là ý tưởng mà phần lớn QR cho là có ROI cao nhất trong cả cuốn AFML, vì nó đặt ML vào đúng chỗ nó giỏi. Cấu trúc gồm hai tầng. **Model chính** (primary) quyết định **hướng** (long/short/flat); nó nên *đơn giản và giải thích được* — thậm chí là một rule quant cổ điển: momentum, mean-reversion, một factor score. Con người hiểu vì sao nó vào lệnh. **Model thứ cấp** (meta) là một classifier ML dự đoán **xác suất model chính đúng** trên chính lệnh nó vừa phát. Output không phải hướng — hướng đã có — mà là câu trả lời cho "cược này đáng tin bao nhiêu?", dùng để quyết định **size**: bỏ qua các cược kém tự tin, đặt nặng cược tự tin.

Vì sao đây là thiết kế thông minh: bạn **tách "dự báo hướng" khỏi "đặt cược cỡ nào"**. Đoán hướng từ noise là chỗ ML *dở* (SNR ~ 0.02, nó sẽ overfit). Nhưng *phân loại có điều kiện* — "cho hướng này, market state này, feature này, lệnh có khả năng thắng không?" — là bài toán mà ML thật sự có thể thêm giá trị, vì bạn đã thu hẹp không gian bằng model chính. Meta-label chỉ có hai lớp (đúng/sai), và nó tự nhiên tối ưu **precision** thay vì recall: bạn thà bỏ lỡ vài lệnh tốt (recall thấp) còn hơn size lớn vào lệnh xấu (precision cao). Trong khung F1, meta-labeling cho bạn một núm vặn precision-recall để khớp với chi phí giao dịch.

Ví dụ số làm rõ giá trị. Giả sử model chính có win-rate 53% (edge nhỏ nhưng thật), mỗi lệnh thắng +1R, thua −1R, với R = 1%. Expectancy thô mỗi lệnh là $0.53 \times 1 - 0.47 \times 1 = +0.06R$. Bây giờ meta-model gán mỗi lệnh một xác suất đúng, và ta *chỉ trade* các lệnh có meta-prob > 0.6. Giả sử subset này có win-rate thực 60% (meta-model lọc được tín hiệu tốt), thì expectancy = $0.60 - 0.40 = +0.20R$ — gấp $0.20/0.06 \approx 3.3$ lần — dù ta đã bỏ đi phần lớn số lệnh. Sharpe của chiến lược tăng vì hai lý do cộng hưởng: (a) mỗi lệnh còn lại có edge cao hơn, nên tỉ số mean-trên-std của P&L từng lệnh tốt hơn; và (b) turnover giảm nên phí giảm, mà phí là thứ ăn mòn trực tiếp vào Sharpe sau chi phí. Đó là lý do meta-labeling thường thêm 0.2–0.4 vào Sharpe của một signal đã tốt sẵn, mà *không cần model chính giỏi hơn* — bạn chỉ cần lọc tốt hơn.

Một điểm dễ hiểu lầm cần nói rõ: meta-labeling không tạo ra edge từ hư không. Nếu model chính hoàn toàn không có edge (win-rate đúng 50%, thuần noise), thì không có gì cho meta-model học để phân biệt lệnh tốt khỏi lệnh xấu, và nó cũng vô dụng. Meta-labeling *khuếch đại và tinh lọc* một edge đã tồn tại; nó không phải máy in tiền.

### 17.2.3 Sample weights — chống đếm trùng

Nhắc lại bệnh non-IID: mẫu chồng lấn thời gian khiến một sự kiện thị trường bị đếm nhiều lần. Nếu label horizon là 10 ngày và bạn có mẫu mỗi ngày, một cú sập market kéo dài 10 ngày xuất hiện trong ~10 label liên tiếp — tree ensemble sẽ "thấy" nó mười lần và tưởng nó là mười bằng chứng độc lập, học quá nặng từ một sự kiện đơn lẻ. Sửa bằng **sample weight theo uniqueness**: trọng số mỗi mẫu tỉ lệ nghịch với số mẫu khác chồng lấn quãng thời gian của nó.

Recipe cụ thể (AFML): với mỗi thời điểm $t$, đếm **concurrency** $c_t$ = số label mà quãng sống của chúng phủ $t$. Uniqueness của label $i$ là trung bình của $1/c_t$ trên quãng sống của nó,
$$u_i = \frac{1}{|T_i|}\sum_{t \in T_i} \frac{1}{c_t}.$$
Ví dụ số cho cụ thể. Label A sống các ngày 1–5, label B sống các ngày 3–7. Đếm concurrency theo ngày: ngày 1 và 2 chỉ có A phủ nên $c = 1$; ngày 3, 4, 5 có cả A và B phủ nên $c = 2$; ngày 6, 7 chỉ có B nên $c = 1$. Uniqueness của A là trung bình $1/c_t$ trên các ngày 1–5:
$$u_A = \frac{1}{5}\left(1 + 1 + \tfrac12 + \tfrac12 + \tfrac12\right) = \frac{3.5}{5} = 0.70.$$
Tương tự B trên các ngày 3–7: $u_B = \frac{1}{5}\left(\tfrac12+\tfrac12+\tfrac12+1+1\right) = 0.70$. Bây giờ giả sử có thêm một label C hoàn toàn cô lập (quãng sống của nó không chồng ai): uniqueness của C = 1.0, và nó đáng được đếm nặng gấp $1.0/0.70 \approx 1.43$ lần A hay B trong quá trình học. Không có bước này, một quãng thị trường bận rộn — nhiều signal cùng bắn, nhiều label chồng nhau — sẽ áp đảo việc học một cách giả tạo, và model sẽ nghiêng lệch về các regime đông đúc chỉ vì chúng đóng góp nhiều mẫu-trùng hơn. Bổ sung thường dùng: **time-decay** — mẫu cũ nhận trọng số nhỏ hơn để model nghiêng về regime gần đây, phản ánh rằng thị trường non-stationary và quá khứ xa ít liên quan hơn quá khứ gần.

### 17.2.4 Feature importance đúng cách

Đọc feature importance sai là một cách tinh vi để tự lừa. Ba phương pháp, xếp theo độ tin cậy tăng dần:

**MDI (Mean Decrease Impurity)** nhanh và tính in-sample, nhưng **thiên vị** — nó ưu ái feature nhiều mức giá trị (high-cardinality) và bị lệch nặng khi feature tương quan. Chỉ dùng để nhìn nhanh, không kết luận.

**MDA (Mean Decrease Accuracy) / permutation importance trên purged CV** là chuẩn vàng. Đo độ tụt performance out-of-sample khi bạn xáo (permute) ngẫu nhiên một feature — nếu xáo mà performance không đổi, feature đó vô dụng. Bắt buộc chạy trên **purged CV** để permutation không bị rò rỉ, nếu không bạn chỉ đo lại mức độ nhớ mẫu.

**SHAP** cho attribution ở mức từng mẫu, hữu ích để hiểu *khi nào* một feature quan trọng (chứ không chỉ *bao nhiêu*), nhưng đắt tính toán và vẫn cần đọc trên out-of-sample mới đáng tin.

Cạm bẫy chí mạng ở cả ba phương pháp: **feature tương quan bóp méo importance**. Nếu hai feature gần trùng nhau — chẳng hạn RSI-14 và RSI-15 — permutation từng cái sẽ cho *cả hai* importance thấp, vì khi xáo cái này, model dựa vào cái kia bù lại, performance không tụt, và bạn kết luận nhầm rằng "cả hai vô dụng". Sửa bằng **clustered feature importance**: cluster các feature tương quan trước (dùng correlation làm distance, hierarchical clustering), rồi permute *cả cụm* cùng lúc và đọc importance ở mức cụm. Ví dụ số: nếu RSI-14 và RSI-15 có correlation 0.98, chúng nằm chung một cụm; permute cả cụm khiến performance tụt 3% → cụm "momentum oscillator" là quan trọng, dù mỗi feature riêng lẻ cho importance ~0. Đây là chỗ module `cluster` bên `src/alpha` vào cuộc.

Triết lý bao trùm, đáng khắc lên tường: **nghiên cứu bằng feature importance, xác nhận bằng backtest** — không phải chạy 1000 backtest rồi chọn. Feature importance cho bạn *hiểu vì sao* một signal hoạt động (economic rationale), còn backtest chỉ để bác bỏ một giả thuyết đã có lý thuyết đứng sau. Đảo ngược trật tự đó — dùng backtest để mò giả thuyết — là con đường thẳng tới deflated-Sharpe = 50% (đồ giả, Ch9).

### 17.2.5 Fractional differentiation — khử non-stationary mà giữ memory

Đây là feature engineering đặc sản tài chính, giải quyết một trade-off tưởng như bất khả. **Giá thì non-stationary**: mức giá 2010 khác hẳn 2024, nên một model học trên mức giá không tổng quát hóa được, và mọi stationarity test sẽ bác. **Return thì mất trí nhớ**: lấy $d=1$ differencing (giá hôm nay trừ giá hôm qua) cho chuỗi dừng, nhưng nó xóa sạch mọi thông tin về *mức* — return chỉ biết hôm nay tăng hay giảm, không biết đang ở đỉnh hay đáy của một xu hướng dài. Fractional differentiation tìm điểm giữa có kiểm soát: difference bậc **phân số** $d \in (0,1)$ thay vì bậc nguyên 1.

Chuỗi mới là tổ hợp trọng số của quá khứ, $\tilde X_t = \sum_{k=0}^{\infty} w_k X_{t-k}$, với trọng số cho bởi công thức đệ quy
$$w_0 = 1, \qquad w_k = -w_{k-1}\,\frac{d - k + 1}{k}.$$
Ta dẫn xuất tường minh các số hạng đầu với $d = 0.4$, chú ý cẩn thận dấu ở mỗi bước:

$$w_1 = -w_0\,\frac{d-0}{1} = -1 \cdot \frac{0.4}{1} = -0.40.$$
$$w_2 = -w_1\,\frac{d-1}{2} = -(-0.40)\cdot\frac{-0.6}{2} = 0.40 \times (-0.30) = -0.12.$$
$$w_3 = -w_2\,\frac{d-2}{3} = -(-0.12)\cdot\frac{-1.6}{3} = 0.12 \times (-0.533) = -0.064.$$
$$w_4 = -w_3\,\frac{d-3}{4} = -(-0.064)\cdot\frac{-2.6}{4} = 0.064 \times (-0.65) = -0.042.$$

Vậy chuỗi trọng số là $w = \{1,\ -0.40,\ -0.12,\ -0.064,\ -0.042,\ \dots\}$. Điều đáng chú ý: **đuôi trọng số tắt chậm** theo kiểu power-law, các $w_k$ đều khác 0 và co lại dần chứ không sụp về 0. Nghĩa là chuỗi mới $\tilde X_t$ vẫn "nhớ" mức giá xa hàng chục bước — chính cái memory mà ta muốn giữ.

Đối chiếu với return ($d=1$) làm bật độ tương phản. Áp cùng công thức: $w_0=1$; $w_1 = -1\cdot\frac{1-0}{1}=-1$; $w_2 = -(-1)\cdot\frac{1-1}{2}=0$; và vì thừa số $(d-k+1)$ chứa $(1-1)=0$ ở $k=2$ rồi kéo mọi số hạng sau về 0, ta có $w_k=0$ với mọi $k\ge 2$. Tức $w=\{1,-1,0,0,\dots\}$ — return chính là $X_t - X_{t-1}$, **quên sạch sau đúng một bước**. Fractional differentiation với $d=0.4$ giữ được cả một đuôi ký ức mà return vứt bỏ.

Recipe chọn $d$ (từng bước, làm lại được): (1) khởi $d=0$; (2) tăng dần $d$ với bước nhỏ, chẳng hạn 0.05; (3) tại mỗi $d$, tạo chuỗi fractionally-differenced và chạy ADF test (Ch3); (4) **dừng ở $d$ nhỏ nhất mà ADF bác bỏ được unit root** — tức chuỗi vừa đủ dừng, thường $d \in [0.3, 0.5]$ với giá cổ phiếu. Vì sao lấy $d$ *nhỏ nhất* đủ dừng: $d$ càng nhỏ, đuôi memory càng dày (nhìn lại chuỗi trọng số, $d$ nhỏ làm các $w_k$ tắt chậm hơn), feature càng giàu thông tin về mức — bạn muốn dừng vừa đủ để test qua, không thừa. Kết quả là feature vừa *stationary* (model học được, so sánh được giữa các thời kỳ) vừa *giàu memory nhất có thể* — chính là điểm ngọt của trade-off. Trong repo đây là module `fracdiff`.

Một lưu ý thực chiến dễ giết pipeline: dùng bản **fixed-width window** — cắt đuôi $w_k$ khi nó nhỏ hơn một ngưỡng, để mọi điểm dữ liệu dùng *cùng một số* trọng số — thay vì expanding window. Nếu dùng expanding window, các điểm đầu chuỗi có ít trọng số hơn (đuôi lịch sử ngắn) trong khi các điểm sau có đầy đủ đuôi, nên "độ nhớ" thay đổi dọc chuỗi, và bạn vô tình đưa non-stationarity trở lại qua cửa sau — đúng cái bệnh bạn vừa cố chữa.

## 17.3 Deep learning và LLM — dùng ở đâu là thật

Câu hỏi đúng không phải "deep learning có tốt cho tài chính không?" mà "**ở đâu** SNR đủ cao và dữ liệu đủ lớn để deep learning thắng gradient boosting?". Có bốn ổ mà câu trả lời là *có*, và một ổ lớn mà câu trả lời vẫn là *chưa*.

**(1) Microstructure / HFT — order book.** Đây là chỗ deep learning thật sự ăn tiền, vì lý do khớp chính xác với chẩn đoán ở 17.1 nhưng theo hướng ngược lại. Dữ liệu **khổng lồ**: mỗi ngày hàng triệu tick, một năm là hàng tỉ — không còn bài toán dữ liệu-bé. Và SNR **cao hơn daily rất nhiều**: order book chứa tín hiệu ngắn hạn thật, chẳng hạn imbalance giữa bid-size và ask-size dự báo mid-price move trong vài giây với accuracy vượt xa mức 52% ngặt nghèo của daily. Mốc kinh điển là **DeepLOB** (Zhang et al., 2019): một model đọc snapshot của limit order book (10 mức bid/ask, mỗi mức có price và size) như một "ảnh" không gian-thời gian. Các lớp convolution học các mẫu cục bộ của order flow (spread, imbalance, microprice), một lớp Inception nắm các mẫu ở nhiều thang, rồi một lớp LSTM phía trên nắm động lực thời gian; output là xác suất mid-price đi lên/xuống/đứng trong horizon vài chục tick tới. Nó thắng các baseline thủ công *vì* ở đây có đủ dữ liệu để feed một model nhiều tham số, và tín hiệu đủ mạnh để không chìm trong noise. Kiến trúc cũng có lý do sâu: convolution khai thác cấu trúc *cục bộ* của order book — các mức giá gần nhau tương tác với nhau — điều một fully-connected net phải học lại từ đầu và tốn nhiều mẫu hơn để học.

**(2) NLP — LLM làm feature extractor.** Text (news, earnings-call transcripts, SEC filings, social) là dữ liệu phi cấu trúc mà con người không thể feature-engineer bằng tay ở quy mô. LLM và embedding models đọc chúng, sinh ra vector sentiment/topic/surprise. Chuẩn hiện tại rất rõ ràng và đáng khắc ghi: **LLM làm *feature extractor*, hiếm khi end-to-end ra lệnh trade**. Bạn không hỏi model "mua Apple không?"; bạn dùng nó để biến một 10-K dài 200 trang thành một embedding hoặc một điểm số "tone thay đổi so với quý trước", rồi *điểm số đó* trở thành một feature trong model tabular (thường vẫn là gradient boosting) cạnh momentum, value, quality. Lý do: LLM giỏi *hiểu ngôn ngữ*, không giỏi *đặt cược dưới SNR 0.02 với ràng buộc rủi ro* — và nó không cho bạn feature importance hay backtest kỷ luật nếu bạn để nó tự trade.

Giá trị thật của một feature như vậy đến từ tính **orthogonal**, và đáng định lượng bằng Fundamental Law. Một "earnings-call tone" feature từ LLM thường chỉ có rank-IC ~0.015 — nhỏ tuyệt đối. Với breadth cỡ 1000 tên độc lập, standalone information ratio của riêng nó là $IR = IC\sqrt{BR} = 0.015 \times \sqrt{1000} \approx 0.47$, tự nó chưa đủ hấp dẫn để chạy một chiến lược. Nhưng vì nó gần như *không tương quan* với các factor giá (momentum, value), nó cộng vào danh mục theo quy tắc bình phương: nếu book hiện có $IR = 1.0$ và bạn thêm một signal orthogonal $IR = 0.5$, IR kết hợp là $\sqrt{1.0^2 + 0.5^2} = \sqrt{1.25} \approx 1.12$ — một cú nâng ~12% IR danh mục từ một signal mà tự nó tầm thường. Đó chính là Fundamental Law nói: $IR$ tăng khi thêm signal *độc lập*, và độc lập quý hơn mạnh. Một feature giá thứ mười tương quan 0.8 với chín cái đã có gần như vô giá trị; một feature text yếu nhưng orthogonal thì đáng tiền.

**(3) Execution RL.** Reinforcement learning cho bài toán *chia nhỏ lệnh tối ưu qua thời gian* (Ch13): agent học lịch trình đặt lệnh để cân bằng market impact và timing risk, thích ứng với order book realtime. Đây là bài toán tuần tự có phần thưởng rõ (chi phí thực thi đo được từng bước), state đủ quan sát, và — quan trọng — bạn có thể *tự sinh dữ liệu* qua simulator, nên bài toán dữ liệu-bé được nới lỏng đáng kể. RL chưa thắng thuyết phục ở *alpha generation* (reward thưa, adversarial, credit assignment qua horizon dài đầy noise) nhưng ở execution nó có chỗ đứng thật.

**(4) Pricing/fitting nhanh — proxy pricing.** Đây là cây cầu sang Q-world. Bên đó, deep learning học một hàm *ánh xạ tham số thị trường → giá/Greeks* để thay cho Monte Carlo đắt đỏ trong tính rủi ro portfolio (xem cuốn Q-world). Kỹ thuật đắt giá nhất ở đây là **differential machine learning**: thay vì chỉ khớp model với giá (payoff), bạn khớp *đồng thời* với cả **đạo hàm của giá theo tham số** (differentials), lấy được gần như miễn phí qua AAD/adjoint. Vì sao mạnh: mỗi mẫu training giờ mang không chỉ 1 con số (giá) mà cả một vector gradient — bạn nhồi thêm *rất nhiều* thông tin vào cùng số mẫu, chính là liều thuốc cho bệnh dữ-liệu-bé. Loss có dạng
$$L = \sum_i \|f(x_i) - y_i\|^2 + \lambda \sum_i \|\nabla f(x_i) - \partial y_i\|^2,$$
trong đó hạng thứ hai buộc *độ dốc* của surrogate khớp độ dốc thật. Điều này khiến hàm học được nội suy mượt và học được từ ít mẫu hơn hàng bậc: thay vì chỉ biết giá trị tại các điểm mẫu, model biết cả hướng dốc tại đó, nên khoảng giữa hai mẫu không còn là suy đoán tự do. Bên repo Q-world module `differential-ml` (trong `src/proxy`) làm đúng việc này — và ý tưởng "dùng gradient làm nhãn phụ" là điều P-world nên thèm khát mỗi khi có nguồn gradient rẻ.

**Chỗ deep learning *chưa* thắng — dự báo return daily/weekly end-to-end.** Đây là ổ lớn nhất mà nhiều người mới đâm đầu vào và thất bại. Lý do đã rõ từ 17.1: SNR ~ 0.02, dữ liệu ~5000 điểm, non-stationary, adversarial — mỗi điều kiện đều nghịch với thứ deep learning cần. Ở đây **gradient boosting (XGBoost/LightGBM) + feature tốt + kỷ luật validation vẫn là vua**. Mọi claim kiểu "transformer của tôi dự báo giá cổ phiếu" phải được nhìn bằng con mắt Ch7 và Ch9: nó đã purged CV chưa? DSR bao nhiêu sau khi tính multiple testing? Nó orthogonal với các factor công khai chưa hay chỉ tái phát minh momentum dưới lớp vỏ nghìn tham số? Chín trên mười lần, "transformer thắng" là look-ahead bias hoặc data leakage được đóng gói đẹp.

## 17.4 Vì sao gradient boosting vẫn là vua ở daily tabular

Đáng dừng lại định lượng vì sao XGBoost/LightGBM thắng deep learning ở tabular alpha — không phải quán tính ngành, mà là kết quả trực tiếp của cấu trúc bài toán.

**Thứ nhất — inductive bias khớp dữ liệu tabular.** Deep nets có inductive bias của smoothness và cấu trúc không gian (convolution giả định pixel gần nhau liên quan). Tabular feature (momentum, P/E, volatility) *không* có cấu trúc không gian đó — thứ tự cột vô nghĩa, và quan hệ feature→label thường đầy *bậc thang và tương tác rời rạc*, kiểu "khi P/E < 10 VÀ momentum dương thì kỳ vọng khác hẳn". Cây quyết định model những điều kiện rời rạc này *nguyên bản* — mỗi split là một ngưỡng — còn deep net phải xấp xỉ một hàm bậc thang bằng tổ hợp của các đơn vị mượt qua nhiều lớp, kém hiệu quả mẫu ở regime dữ liệu bé.

**Thứ hai — regularization dễ kiểm soát dưới SNR thấp.** Với gradient boosting, bạn có núm vặn trực tiếp và trực giác: `max_depth` nhỏ (2–4, không phải 10) để mỗi cây yếu; `learning_rate` nhỏ (0.01–0.05) với nhiều cây và **early stopping trên purged CV**; `subsample` và `colsample` < 1 để bagging giảm variance; `min_child_weight` cao để không tách trên một nhúm mẫu noise. Con số cụ thể quan trọng: ở SNR 0.02, một QR kỷ luật dùng cây rất nông (depth 3), learning rate 0.02, và early-stop khi validation IC ngừng tăng — thường dừng ở vài trăm cây, không phải vài nghìn. So với deep net, bề mặt overfit của gradient boosting *quan sát được và chặn được* qua một validation curve mà bạn nhìn thẳng vào; của deep net thì mờ ám hơn nhiều, với hàng loạt hyperparameter tương tác khó tách bạch.

**Thứ ba — số tham số hiệu dụng phù hợp.** Nhắc lại nguyên tắc từ 17.1: số tham số hiệu dụng phải nhỏ so với lượng thông tin dự báo được, không phải so với số điểm dữ liệu. Một ensemble 300 cây depth-3 có sức chứa vừa phải — cỡ vài nghìn split tất cả, và mỗi split là một tham số hiệu dụng — và quan trọng là bạn *thấy* được sức chứa đó và điều chỉnh nó bằng vài núm vặn. Một transformer với hàng triệu tham số có sức chứa vượt xa lượng tín hiệu (nhớ lại: chỉ vài trăm khối bằng chứng độc lập thật), và mọi regularization chỉ là cố ghìm nó xuống mức mà gradient boosting đạt được một cách tự nhiên. Bạn đang bỏ công ghìm một con thú không cần thiết phải nuôi.

Đây không phải lời chê deep learning — nó thắng rõ ở microstructure và NLP như đã nói — mà là chẩn đoán *khớp công cụ với bài toán*. Khi dữ liệu bé và tabular, dùng gradient boosting; khi dữ liệu khổng lồ và có cấu trúc (order book, text, hình), deep learning mới có đất diễn.

## 17.5 Regularization cho SNR thấp — nguyên tắc bao trùm

Vì SNR thấp là bệnh nền của mọi thứ, đáng gom các liều thuốc regularization thành một triết lý. Nguyên tắc gốc: **mọi bit sức chứa (capacity) không được tín hiệu biện minh sẽ bị noise chiếm lấy.** Do đó regularize không phải một tùy chọn cuối pipeline mà là cấu trúc của toàn pipeline, ở cả ba mức.

Ở **mức feature**: giảm chiều tàn bạo (ít feature, mỗi cái có economic rationale *trước* khi được thử, không phải thử hàng loạt rồi rút ra kể chuyện sau), khử tương quan bằng cluster rồi chọn đại diện (module `cluster`, `nco`), và ưu tiên feature *robust across regime* hơn feature khớp đẹp một giai đoạn. Ở **mức model**: ensemble và bagging luôn (giảm variance của một estimator vốn noisy), thử model đơn giản trước, và dùng **kích thước cược mềm** — thay vì output nhị phân long/short, dùng xác suất từ meta-model để size, nên một sai lầm ở lệnh kém tự tin ít tốn kém hơn. Ở **mức validation**: purged & embargoed CV là bắt buộc, và mọi con số Sharpe phải đi qua **deflated Sharpe ratio** để trừ đi phần đẹp do multiple testing (Ch9). Nhắc lại running example với đầy đủ số: thử $N = 1000$ cấu hình trong $T = 10$ năm cho ngưỡng Sharpe kỳ vọng do may rủi
$$SR_0 = \sqrt{\frac{2\ln N}{T}} = \sqrt{\frac{2 \times 6.91}{10}} = \sqrt{1.382} = 1.18,$$
nên một Sharpe quan sát 1.2 chỉ nhỉnh hơn ngưỡng một chút và cho DSR ~50% — tức xác suất nó thật chỉ ngang tung đồng xu.

Điểm cuối, và là chỗ ML hiện đại giao với kỷ luật cổ điển: **shrinkage về prior kinh tế**. Một estimator ML cho expected return nên được kéo về phía một prior đơn giản (equal-weight, hoặc factor-implied) bằng một hệ số shrinkage — chính là tinh thần Bayesian/Ledoit-Wolf ta đã gặp ở covariance (Ch5) và ở portfolio construction (Ch11). Ở SNR 0.02, một ước lượng thô nhưng kéo mạnh về prior thường out-of-sample tốt hơn một ước lượng tinh vi tin hoàn toàn vào chính nó, vì phần "tinh vi" phần lớn là fit noise. Đây là câu tổng kết đúng cho cả chương: **ở tài chính, khiêm tốn có kỷ luật đánh bại tinh vi không kiểm soát.**

## 17.6 Thời sự 2024–2026 — LLM agents và cơn lũ multiple testing

Làn sóng lớn nhất đang định hình nghề: **LLM agents đọc, tóm tắt, sinh giả thuyết nghiên cứu và code hóa alpha nhanh hơn** — đúng cái bạn đang làm với repo này. Một agent có thể quét hàng trăm paper mỗi tuần, đề xuất feature mới, tự viết code backtest, và trình bày kết quả. Các quỹ lớn đầu tư mạnh vào "AI-assisted research pipeline", và lợi thế thật đến từ **tăng breadth thí nghiệm**: nhiều giả thuyết được kiểm hơn mỗi tuần, tức nhiều "vé số" edge được mua hơn.

Nhưng đây chính là chỗ nguy hiểm sinh ra từ chính sức mạnh đó, và nó nối thẳng về Ch9. Nếu bạn thử 100 giả thuyết một tuần thay vì 5, thì **multiple testing phình theo cùng bậc** — và với nó, xác suất một Sharpe đẹp chỉ là *may mắn thuần túy* tăng vọt. Định lượng bằng đúng công thức deflation: ngưỡng Sharpe kỳ vọng do may rủi $SR_0 = \sqrt{2\ln N / T}$ tăng theo $\sqrt{\ln N}$. Với $T = 10$ năm, ta lập bảng ba mức thí nghiệm:

| Số cấu hình thử $N$ | $\ln N$ | $SR_0 = \sqrt{2\ln N/T}$ |
|---|---|---|
| 100 | 4.61 | $\sqrt{2\times4.61/10} = 0.96$ |
| 1000 | 6.91 | $1.18$ |
| 10000 | 9.21 | $\sqrt{2\times9.21/10} = 1.36$ |

Đọc bảng này cho thấy vấn đề trần trụi: khi agent giúp bạn thử gấp mười, từ 1000 lên 10000, ngưỡng bạn phải nhảy qua nhảy từ 1.18 lên 1.36. **Thanh xà bạn phải vượt để một Sharpe được coi là thật cũng cao lên** — một chiến lược Sharpe 1.3 từng ấn tượng ở $N = 100$ (vượt xa ngưỡng 0.96) giờ *dưới* ngưỡng ở $N = 10000$ (1.36) và phải bị coi là đồ giả cho tới khi chứng minh ngược lại. Nếu bạn không cập nhật $N$ trong DSR theo số thí nghiệm agent đã thật sự chạy, bạn sẽ deploy đồ giả với tốc độ công nghiệp.

Do đó kỷ luật DSR và **ghi chép thí nghiệm** — experiment tracking, đếm trung thực mọi cấu hình đã thử, kể cả những cái agent thử rồi vứt trong im lặng — càng sống còn trong kỷ nguyên agent, không phải kém đi. Nghịch lý của thời đại: công cụ giúp bạn tìm alpha nhanh hơn cũng giúp bạn tự lừa nhanh hơn — và cây cầu duy nhất bắc qua vực đó vẫn là bộ đôi bất biến của cả cuốn sách này: **economic rationale trước, và validation kỷ luật (purged CV cộng deflated Sharpe) sau.** ML thay đổi tốc độ; nó không thay đổi luật chơi.

# Chương 18: Credit và fixed-income relative value

Đến giờ mọi chiến lược trong sách đều sống trên một trục P&L đơn giản: bạn đúng chiều giá thì lãi, sai thì lỗ. Momentum ăn tiền khi xu hướng tiếp diễn, pairs ăn tiền khi spread hồi về, factor ăn tiền khi cross-section phân hóa đúng dự báo. Credit và fixed-income relative value trade theo một logic *khác chất*. Ở đây bạn không cược giá đi đâu; bạn cược rằng **hai cách định giá cùng một rủi ro đang lệch nhau, và cái lệch đó phải đóng**. Cùng một công ty có thể được thị trường bond định giá một mức rủi ro vỡ nợ, còn thị trường CDS định giá một mức khác — hai con số lẽ ra phải bằng nhau (no-arbitrage), và khoảng cách giữa chúng là một trade. Cùng một Treasury 10 năm có hai phiên bản, on-the-run và off-the-run, gần như giống hệt về dòng tiền nhưng khác nhau vài bp yield chỉ vì thanh khoản — và vài bp đó là một trade. Đây là họ chiến lược **relative value (RV)**: bạn không phơi mình ra hướng thị trường, bạn phơi mình ra sự *hội tụ* của hai giá lẽ ra phải trùng.

Vì sao họ này đáng một chương riêng, dù các chương trước đã có pairs (một dạng RV) và Chương 16 đã chạm rates? Vì credit + fixed-income RV là **một mảng buy-side khổng lồ** — relative-value fund như cựu LTCM, các credit book ở Citadel/Millennium, các rates RV desk ở macro fund — vận hành trên một bộ công cụ mà equity RV không dạy: định giá tín dụng qua hazard rate, no-arbitrage giữa cash bond và derivative, và một cơ chế rủi ro đặc thù là **jump-to-default** cùng **basis blow-out**. Và đây cũng là nơi P-world bắt tay chặt nhất với Q-world: mọi trade dưới đây đều dựa trên một mô hình định giá sell-side — hazard curve, CDS par spread, structural model của Merton — mà bạn phải hiểu để biết cái gì đang lệch và vì sao. Sợi chỉ đỏ của chương: **RV bán thanh khoản và bán convergence, thu một khoản nhỏ đều đặn, và thỉnh thoảng bị xé nát khi convergence đảo chiều thành divergence** — đúng cái motif "bán bảo hiểm, skew âm" đã gặp ở carry, giờ tái sinh trong tín dụng.

Một lời hứa xuyên chương để bạn giữ trong đầu khi đọc từng con số: mọi trade dưới đây gross *trông* như tiền lẻ nhặt được — 3bp, 30bp, một cái skew 3bp. Cái phân biệt người in tiền với người phá sản không nằm ở chỗ *thấy* cái lệch (ai cũng thấy) mà ở hai chỗ khác: (i) trừ đúng chi phí cầm trade để biết cái lệch có *thật sự* là alpha hay chỉ là giá của funding, và (ii) size để sống qua giai đoạn cái lệch tệ đi trước khi nó tốt lên. Chương này lặp đi lặp lại đúng hai bài học đó qua năm loại trade.

## 18.1 Nền tảng tín dụng: từ hazard rate đến CDS spread

Trước khi trade được cái lệch, phải định giá được cả hai chân. Nền tảng là **credit triangle** — quan hệ xấp xỉ nối spread tín dụng với xác suất vỡ nợ, và nó là cầu nối trực tiếp sang Q-world.

Một công ty vỡ nợ được mô hình hóa như một biến cố đến ngẫu nhiên với cường độ (intensity) là **hazard rate** $\lambda$ — xác suất vỡ nợ tức thời trong một khoảng $dt$ nhỏ, có điều kiện là chưa vỡ nợ đến lúc đó. Chính thức: nếu $\tau$ là thời điểm vỡ nợ, thì $\lambda = \lim_{dt\to 0}\tfrac{1}{dt}\Pr(\tau \le t+dt \mid \tau > t)$. Với $\lambda$ hằng số, xác suất *sống sót* đến thời điểm $t$ là $Q(t) = e^{-\lambda t}$, đúng như hàm `survival` trong module hazard-curve mà `src/instruments/cds` gọi tới. (Dạng $e^{-\lambda t}$ không phải ngẫu nhiên: nó là nghiệm của $dQ = -\lambda Q\,dt$ — tỷ lệ chết mỗi lát cắt tỷ lệ với số còn sống, y hệt phân rã phóng xạ.)

Một CDS (credit default swap) là hợp đồng bạn trả một premium định kỳ $s$ (spread, tính trên notional) để được bồi thường $(1-R)$ khi công ty vỡ nợ, với $R$ là recovery rate. No-arbitrage buộc giá trị kỳ vọng của **premium leg** bằng **protection leg**. Dẫn xuất credit triangle từng bước cho trường hợp một kỳ ngắn, bỏ qua discounting để lộ trực giác:

1. Protection leg trong khoảng $dt$: xác suất vỡ nợ $\approx \lambda\,dt$, chi trả $(1-R)$, nên kỳ vọng $\approx \lambda(1-R)\,dt$.
2. Premium leg trong khoảng $dt$: bạn trả $s\,dt$ (giả định còn sống, xác suất $\approx 1$).
3. Cân bằng: $s\,dt = \lambda(1-R)\,dt \Rightarrow \boxed{s \approx \lambda(1-R)}$.

Đây là credit triangle. Ba đại lượng — spread, hazard, recovery — bị khóa vào nhau, biết hai suy ra một. Ví dụ tính bằng số: một CDS 5 năm quote ở $s = 120\,\text{bp}$ $= 0.0120$, recovery giả định $R = 40\%$ (chuẩn thị trường cho senior unsecured). Hazard rate ngụ ý

$$\lambda \approx \frac{s}{1-R} = \frac{0.0120}{0.60} = 0.0200 = 2.0\%\text{/năm}.$$

Xác suất sống 5 năm $Q(5) = e^{-0.02 \times 5} = e^{-0.10} = 0.9048$, tức xác suất vỡ nợ tích lũy 5 năm $\approx 9.52\%$. Đọc ý nghĩa: thị trường đang định giá công ty này có gần một phần mười khả năng vỡ nợ trong 5 năm tới. Lật ngược chiều để thấy sức mạnh của tam giác: nếu bạn có một *view độc lập* rằng công ty này thật ra chỉ có 5% khả năng vỡ nợ 5 năm ($Q=0.95 \Rightarrow \lambda \approx 1.03\%$), thì "spread công bằng" theo bạn là $s = 1.03\%\times 0.6 = 62\,\text{bp}$ — thị trường đang đòi 120bp cho một rủi ro bạn định giá 62bp, và đó là *view tín dụng* để bán protection. Toàn bộ credit RV quy về so hai con số spread như thế này với nhau.

Bản đầy đủ (có discounting, có annuity) chính là `cdsParSpread = protectionLeg / premiumAnnuity` trong module: par spread thật là tỷ số của PV protection leg trên **risky annuity** (tổng discount-factor $\times$ survival-probability trên các kỳ trả phí). Xấp xỉ $s\approx\lambda(1-R)$ bỏ qua chiết khấu và bỏ qua chuyện premium ngừng chảy sau khi vỡ nợ, nên nó lệch vài bp với con số chính xác — nhưng nó là thứ bạn nhẩm trên bàn trade để kiểm tra một quote có "vô lý" không. Toàn bộ máy móc định giá CDS, hazard curve bootstrapping, và structural model đứng ở cuốn Q-world; ở đây ta *dùng* chúng để tìm cái lệch.

## 18.2 CDS–bond basis và negative-basis trade

Đây là RV trade kinh điển nhất của tín dụng, và là ví dụ đẹp nhất về "hai giá cùng một rủi ro". Cùng một công ty phát hành bond (rủi ro tín dụng ở dạng cash) và có CDS giao dịch (rủi ro tín dụng ở dạng derivative). Cả hai đo *cùng một thứ* — bồi thường cho rủi ro công ty vỡ nợ — nên spread tín dụng hai bên lẽ ra phải bằng nhau. Khoảng cách giữa chúng là **CDS–bond basis**.

Định nghĩa chính xác:
$$\text{basis} = s_{\text{CDS}} - s_{\text{ASW}},$$
trong đó $s_{\text{CDS}}$ là CDS spread và $s_{\text{ASW}}$ là **asset-swap spread** của bond — phần bù của bond so với đường LIBOR/SOFR swap sau khi đã hoán đổi coupon cố định của bond lấy floating. Asset-swap spread là cách chuẩn để biến "yield của một bond" thành một con số spread tín dụng so sánh được trực tiếp với CDS, vì nó lột bỏ rủi ro lãi suất và chỉ để lại phần bù tín dụng + thanh khoản. Nói cách khác: yield của một bond trộn hai thứ — bù cho *level lãi suất phi rủi ro* và bù cho *rủi ro tín dụng*; ASW cắt bỏ thứ nhất để chỉ còn thứ hai, đúng cái mà CDS cũng đo.

### Dẫn xuất basis bằng số

Lấy một bond doanh nghiệp cụ thể. Bond IG kỳ hạn 5 năm, coupon 5.0%, giá 99.0, ta cần ra asset-swap spread. Quy trình từng bước:

1. **Yield của bond.** Giải phương trình giá $99.0 = \sum_{t=1}^{5} \frac{5.0}{(1+y)^t} + \frac{100}{(1+y)^5}$ cho yield-to-maturity ta được $y = 5.232\%$ (giá dưới par nên yield trên coupon). Nhẩm nhanh mà không cần solver: bond giá thấp hơn par $1.0$ điểm, dàn khoản lỗ vốn đó qua Macaulay duration $\approx 4.54$ năm cho thêm $\approx 1.0/4.54 = 0.22\%$ trên coupon, tức $\approx 5.22\%$ — sát nghiệm chính xác $5.23\%$.
2. **Trừ đi swap rate cùng kỳ hạn** để ra phần bù tín dụng. Giả sử 5Y SOFR swap rate $= 3.73\%$. Asset-swap spread $s_{\text{ASW}} \approx 5.23\% - 3.73\% = 1.50\% = 150\,\text{bp}$. (Bản chính xác của ASW xử lý chênh giá par-vs-market qua một annuity điều chỉnh, làm con số nhích vài bp, nhưng $150\,\text{bp}$ là mức ta dùng và nó đúng bậc độ lớn.)
3. **CDS spread** cùng issuer, cùng kỳ hạn 5Y: thị trường quote $s_{\text{CDS}} = 120\,\text{bp}$.
4. **Basis** $= s_{\text{CDS}} - s_{\text{ASW}} = 120 - 150 = \boxed{-30\text{bp}}$. **Negative basis**.

Đọc con số: bond đang *rẻ* so với CDS. Bond trả bạn 150bp để gánh rủi ro tín dụng, nhưng bảo hiểm cho đúng rủi ro đó (CDS protection) chỉ tốn 120bp. Có một khoảng 30bp lơ lửng.

### Negative-basis trade: khóa arbitrage

Khi basis âm, bạn dựng **negative-basis trade** để khóa khoảng lệch:

- **Mua bond** (long credit risk) → thu $s_{\text{ASW}} = 150\,\text{bp}$.
- **Mua CDS protection** (short credit risk) → trả $s_{\text{CDS}} = 120\,\text{bp}$.

Hai chân triệt tiêu rủi ro tín dụng: nếu công ty vỡ nợ, bond mất giá nhưng CDS bồi thường đúng phần mất; nếu không vỡ nợ, bond trả coupon. Vị thế ròng gần như trung tính với sự kiện tín dụng, và bạn thu chênh $150 - 120 = 30\,\text{bp}$/năm gần như **không rủi ro tín dụng** — một arbitrage carry.

Nhưng "không rủi ro tín dụng" không phải "không rủi ro" và không phải "miễn phí". Bạn phải *tài trợ* việc mua bond. Đây là chỗ con số thật sự sống. Giả sử bond được repo với haircut, funding cost thực của bạn để cầm bond là SOFR + 40bp. Tính P&L ròng từng dòng cho \$100 notional:

| Dòng tiền | bp/năm |
|---|---|
| Thu asset-swap spread trên bond | $+150$ |
| Trả CDS premium | $-120$ |
| Chênh gross (basis) | $+30$ |
| Trả funding trên bond (spread trên SOFR để repo) | $-40$ |
| **P&L ròng sau funding** | $\mathbf{-10}$ |

Kết quả sốc và đó chính là bài học: basis gross $-30\,\text{bp}$ *trông* như tiền free, nhưng sau khi trừ 40bp funding cost để cầm cái bond, trade **âm 10bp/năm**. Arbitrage biến mất. Hãy nhìn nó như một điều kiện *break-even*: negative-basis trade chỉ dương khi $|$basis$|$ vượt funding spread của bạn — ở đây cần basis âm hơn $-40\,\text{bp}$ mới có lãi. Người có funding rẻ hơn (repo ở SOFR + 15bp thay vì +40bp) có break-even thấp hơn, nên cùng một cái basis $-30\,\text{bp}$, họ *có* alpha ($+15\,\text{bp}$) còn bạn *không*. Alpha của trade này không nằm trong cái lệch; nó nằm trong bảng cân đối kế toán của người cầm nó.

### Vì sao basis âm tồn tại — và vì sao nó không bị arbitrage hết

Con số $-10\,\text{bp}$ trả lời câu hỏi "ai trả tiền cho alpha này và vì sao chưa bị arbitrage" một cách thẳng thừng: **basis âm là giá của funding và balance-sheet cost, không phải bữa trưa miễn phí**. Bond ngốn vốn — bạn phải bỏ tiền mặt ra mua và tài trợ nó qua repo, chiếm dụng balance sheet, và (với ngân hàng) tiêu tốn regulatory capital theo leverage ratio. CDS thì "unfunded" — bạn không bỏ vốn ra, chỉ ký hợp đồng và ghi nhận mark-to-market. Nên trong một thế giới mà balance sheet đắt đỏ (đặc biệt sau Basel III siết leverage ratio, buộc ngân hàng dành vốn cho *mọi* tài sản trên sổ bất kể rủi ro), cash bond *phải* rẻ hơn CDS một khoảng đúng bằng chi phí cầm nó — đó chính là basis âm. Nó không bị arbitrage hết vì để arbitrage nó, bạn phải là người *có* balance sheet rẻ; và với những người đó, 30bp gross không đủ bù 40bp funding. Basis âm đo lường độ khan hiếm của balance sheet trong hệ thống — nó là *giá thuê một chỗ trên bảng cân đối kế toán*, không phải một lỗ hổng định giá.

Vì thế basis là một chỉ báo stress tuyệt vời. Bình thường basis IG dao động $-10$ đến $-30\,\text{bp}$. Trong khủng hoảng 2008, khi funding bốc hơi và ai cũng phải bán bond để giải chấp, basis nhiều tên **thủng $-250\,\text{bp}$** — bond rẻ điên rồ so với CDS. Người *có* funding ổn định lúc đó mua được negative-basis trade với 250bp gross, thừa sức nuốt funding và khóa lãi hai chữ số. Nhưng phần lớn không sống đến lúc gặt: khi basis nới từ $-30$ xuống $-250$, ai đã cầm negative-basis trade với đòn bẩy chịu **mark-to-market loss** khổng lồ trên chính cái vị thế "arbitrage" của mình — cái chân bond rớt giá nhanh hơn cái chân CDS lời — và bị margin call. Đây là cửa dẫn thẳng vào mục rủi ro cuối chương: một trade "vô rủi ro tín dụng" vẫn giết bạn qua rủi ro *funding* và rủi ro *mark-to-market*.

## 18.3 Credit long/short và sizing theo DTS

CDS–bond basis là trade *trung tính tín dụng*. Nhưng phần lớn credit RV là **long/short directional trên spread**: long bond bạn nghĩ spread sẽ thắt (rẻ), short bond bạn nghĩ spread sẽ nới (đắt). Vấn đề cốt lõi khi dựng long/short này không phải chọn tên — mà là **sizing**: làm sao hai chân có *rủi ro spread bằng nhau* để book trung tính với dịch chuyển spread chung của thị trường, chỉ còn phơi ra cái view relative của bạn?

Câu trả lời ngây thơ là match theo notional (mua \$10M bond A, bán \$10M bond B). Sai, vì hai bond phản ứng khác nhau với thay đổi spread. Câu trả lời đúng dùng **DTS = duration times spread**.

### Vì sao DTS, không phải duration đơn thuần

Nhạy cảm giá của một bond với thay đổi spread là **spread duration** $D_s$: nếu spread nới $\Delta s$, giá đổi $\approx -D_s \times \Delta s$. Nên phản xạ đầu tiên là match spread duration hai chân. Nhưng có một sự thật thực nghiệm sâu sắc thay đổi tất cả (được chính thức hóa trong nghiên cứu của Ben Dor và cộng sự ở Lehman/Barclays, và giờ là chuẩn ngành): **spread không dịch chuyển song song bằng bp, mà dịch chuyển theo tỷ lệ phần trăm**. Một bond spread 500bp (high yield) khi thị trường credit xấu đi không nới thêm cùng *số bp* như một bond spread 100bp (investment grade) — nó nới thêm cùng *tỷ lệ*. Nếu credit bán tháo 20%, bond 100bp nới thêm 20bp, còn bond 500bp nới thêm 100bp. Nói gọn: volatility của $\Delta s$ tỷ lệ thuận với *mức* $s$, tức $\text{std}(\Delta s) \approx k\cdot s$ với $k$ gần như hằng số giữa các tên.

Hệ quả trực tiếp: rủi ro P&L của một bond do spread là $\sigma_{\text{P\&L}} \approx D_s\cdot\text{std}(\Delta s) = D_s\cdot k\cdot s = k\cdot(D_s\times s)$. Đại lượng đo đúng rủi ro không phải $D_s$ mà là $D_s \times s$ — **DTS**. Một \$1 vị thế mất $\text{DTS} \times x\%$ khi credit dịch $x\%$ tương đối. Match DTS hai chân ⟹ hai chân chịu cùng P&L khi credit thị trường di chuyển cùng một *tỷ lệ* — đó mới là market-neutral thật trong thế giới credit. Match duration đơn thuần sẽ để lại rủi ro chiều: chân high-yield (spread cao) sẽ *lấn át* chân investment-grade khi credit sell off, và cái book "neutral" của bạn thật ra là một cược short credit trá hình.

### Sizing bằng số: hai bond khác duration/spread

Cho hai bond, ta muốn dựng long/short DTS-neutral trên vốn book \$100M:

| | Bond A (long) | Bond B (short) |
|---|---|---|
| Spread duration $D_s$ | 7.0 | 3.5 |
| Spread $s$ | 90bp | 240bp |
| **DTS** $= D_s \times s$ | $7.0 \times 90 = 630$ | $3.5 \times 240 = 840$ |

Bond A là một IG dài, spread thấp nhưng duration cao; Bond B là một HY ngắn, spread cao duration thấp. Để hai chân có DTS-exposure bằng nhau, notional phải tỷ lệ nghịch với DTS trên một đơn vị notional:
$$\frac{N_A}{N_B} = \frac{\text{DTS}_B}{\text{DTS}_A} = \frac{840}{630} = 1.333.$$

Nếu ta short \$30M Bond B, DTS-dollars chân short $= 30\text{M} \times 840 = 25{,}200$ M·bp. Long chân A phải khớp: $N_A = 30\text{M} \times 1.333 = 40\text{M}$, cho DTS-dollars $= 40\text{M} \times 630 = 25{,}200$ M·bp. Khớp. Vậy trade là **long \$40M Bond A, short \$30M Bond B** — nghịch với trực giác notional (bạn long *nhiều hơn* về notional cái bond spread thấp, vì nó "kém rủi ro" trên mỗi đô la nên cần nhiều đô la hơn để cân).

Kiểm chứng bằng một cú sốc: credit thị trường xấu, mọi spread nới **10% tương đối**. Bond A spread nới $90 \times 10\% = 9\,\text{bp}$ → giá đổi $-7.0 \times 9\text{bp} = -0.63\%$ trên \$40M $= -\$252{,}000$. Bond B spread nới $240 \times 10\% = 24\,\text{bp}$ → giá đổi $-3.5 \times 24\text{bp} = -0.84\%$ trên \$30M short $= +\$252{,}000$ (bạn short nên lãi khi nó rớt). **Ròng $= 0$**. Book miễn nhiễm với dịch chuyển spread chung theo tỷ lệ — đúng thiết kế. Bạn chỉ còn phơi ra view rằng spread A sẽ thắt *tương đối* so với spread B. Đây là cách credit book của một pod shop kiểm soát rủi ro: mọi vị thế đo bằng DTS, và tổng DTS ròng của book bị ghim quanh 0 để không vô tình cược chiều credit chung.

Cạm bẫy để nhớ: DTS-neutral trung tính với dịch chuyển *tỷ lệ đồng đều*, nhưng nếu HY nới nhiều hơn IG một cách *phi tỷ lệ* (một cuộc "flight to quality" nơi rác bị bán tháo mạnh hơn nhiều so với IG), thì chân short HY của bạn lỗ nhiều hơn chân long IG lời — book vẫn ăn đòn. DTS là bậc xấp xỉ thứ nhất tốt, không phải một tấm khiên hoàn hảo.

## 18.4 Capital structure arbitrage — nối P-world với Q-world qua Merton

Trade tinh vi nhất của chương: **cùng một công ty, hai lớp chứng khoán khác nhau trong cấu trúc vốn — equity và debt — phải nhất quán với nhau qua một mô hình cấu trúc**. Nếu equity đang định giá công ty "khỏe" mà CDS đang định giá "sắp chết", một trong hai sai, và bạn hedge cái này bằng cái kia để bắt sự hội tụ. Cây cầu là **Merton structural model** — nằm ở Q-world, ta dùng lại kết quả.

### Trực giác Merton và hedge ratio

Merton nhìn equity của một công ty có nợ như một **call option trên tài sản công ty**, strike bằng mệnh giá nợ $D$, đáo hạn khi nợ đến hạn. Nếu giá trị tài sản $V > D$ lúc đáo hạn, cổ đông trả nợ và giữ phần dư $V - D$ (payoff của call); nếu $V < D$, công ty vỡ nợ, cổ đông bỏ của chạy lấy người (call hết giá trị). Từ đó:
$$E = V\,\Phi(d_1) - D e^{-rT}\Phi(d_2),$$
với $d_1, d_2$ như Black-Scholes trên tài sản $V$ với vol tài sản $\sigma_V$. Đồng thời, xác suất vỡ nợ (risk-neutral) $= \Phi(-d_2)$ — nối thẳng sang hazard rate và CDS spread của mục 18.1. Đây là điểm giao P/Q đắt giá: *cùng một $\Phi(-d_2)$* định giá cả equity (qua call) lẫn credit (qua default prob). Nếu bạn tin Merton, không thể cùng lúc có equity "đắt" và CDS "rẻ" cho cùng một công ty — chúng bị buộc bởi một tham số chung.

Điều ta cần để trade là **hedge ratio**: nếu giá trị tài sản nhích, equity đổi bao nhiêu so với CDS đổi bao nhiêu? Vì equity là call trên $V$, độ nhạy $\partial E/\partial V = \Phi(d_1)$ — chính là **delta**. Còn giá trị của một vị thế protection nhạy với $V$ qua $\partial \Phi(-d_2)/\partial V$ (default prob dịch làm mark của protection dịch). Tỷ số hai độ nhạy cho biết: một cú sốc tài sản làm equity di chuyển $\Delta E$ đi kèm CDS di chuyển $\Delta(\text{CDS mark})$, và để hedge trung tính với cú sốc tài sản, bạn khớp hai chân theo tỷ số đó.

### Hedge ratio bằng số

Dựng một cap-structure trade: bạn nghĩ CDS của công ty đang *quá đắt* (thị trường credit hoảng thái quá) so với những gì equity đang nói. Bạn **short CDS protection** (bán bảo hiểm, cược spread thắt) và **hedge bằng short equity** (phòng khi công ty thật sự xấu đi thì equity rớt bù cho bạn). Cần biết short bao nhiêu equity trên mỗi \$10M CDS notional.

Giả sử qua Merton đã calibrate: tài sản $V = \$1{,}000\text{M}$, nợ $D = \$600\text{M}$, vol tài sản $\sigma_V = 25\%$, $T = 5$, $r = 4\%$. Tính $d_1$:
$$d_1 = \frac{\ln(V/D) + (r + \tfrac12\sigma_V^2)T}{\sigma_V\sqrt T} = \frac{\ln(1000/600) + (0.04 + 0.03125)\times 5}{0.25\sqrt 5}.$$
Tử số: $\ln(1.6667) = 0.5108$; $(0.07125)\times 5 = 0.3563$; tổng $= 0.8671$. Mẫu: $0.25 \times 2.236 = 0.5590$. Vậy $d_1 = 0.8671/0.5590 = 1.551$, và $d_2 = 1.551 - 0.559 = 0.992$. Tra chuẩn: $\Phi(d_1) = \Phi(1.551) = 0.9396$ (equity delta trên tài sản), $\Phi(-d_2) = \Phi(-0.992) = 0.1606$ (risk-neutral default prob 5 năm $\approx 16\%$).

*Một lưu ý calibration quan trọng trước khi đi tiếp.* Cắm chính những input này vào công thức Merton cho equity model $E = 1000\times 0.9396 - 600\,e^{-0.04\times5}\times\Phi(0.992) = \$527\text{M}$. Nếu vốn hóa thị trường quan sát chỉ là \$420M, thì Merton đang nói equity *rẻ* (thị trường định giá thấp hơn $527\text{M}$ mà mô hình cho là công bằng) — điều này *nhất quán* với luận điểm "CDS quá đắt": cả hai đều nói thị trường credit đang bi quan hơn fundamental. Nhưng đừng nhầm: trong calibration nghiêm túc, bạn *không* chọn $V$ và $\sigma_V$ tự do rồi so với $E$ thị trường; bạn *suy ngược* $V$ và $\sigma_V$ từ chính $E$ và equity vol quan sát (giải hệ hai phương trình Merton), rồi mới hỏi CDS lệch bao nhiêu. Con số $V=1000, \sigma_V=25\%$ ở đây là kết quả calibration *đã cho* để minh họa số học hedge; cái lệch \$527 vs \$420 là để bạn thấy tín hiệu, không phải một mâu thuẫn của mô hình.

Bây giờ ra hedge ratio. Một thay đổi nhỏ $dV$ của tài sản gây:
- Equity đổi $dE = \Phi(d_1)\,dV = 0.9396\,dV$.
- Default prob đổi, kéo giá trị protection đổi. Đạo hàm: $\partial(-d_2)/\partial V = -1/(V\sigma_V\sqrt T)$, và mật độ $\phi(d_2) = \phi(0.992) = 0.2439$. Vậy
$$\frac{\partial\Phi(-d_2)}{\partial V} = \frac{\phi(d_2)}{V\sigma_V\sqrt T} = \frac{0.2439}{1000\times 0.559} = \frac{0.2439}{559} = 4.36\times 10^{-4}$$
trên mỗi \$1M tài sản.

Với CDS notional \$10M và $(1-R)=0.6$, giá trị protection $\approx (1-R)\times\text{notional}\times \Phi(-d_2)$ về mặt loss-given-default kỳ vọng (một xấp xỉ bậc nhất — bỏ qua discounting và annuity, đủ để lấy hedge ratio), nên độ nhạy MtM của chân CDS với $V$ $\approx 10\text{M}\times 0.6 \times 4.36\times 10^{-4} = \$2{,}617$ trên mỗi \$1M dịch chuyển tài sản. Chân equity phải khớp độ lớn này. Mỗi \$1M tài sản làm vốn hóa đổi $dE = 0.9396\times\$1\text{M} = \$939{,}600$; để P&L của lượng equity ta short khớp \$2{,}617, tỷ trọng equity (theo giá trị thị trường) cần cầm là
$$H = \frac{2{,}617}{939{,}600} = 0.00279 \text{ của vốn hóa} = 0.00279 \times \$420\text{M} = \$1.17\text{M equity}.$$

Kết quả: hedge \$10M CDS bằng khoảng **\$1.17M equity** (short). Đọc ý nghĩa: equity nhạy hơn *rất nhiều* với tài sản so với CDS trên cùng notional (delta $0.94$ so với $4\times10^{-4}$), nên bạn chỉ cần một lượng equity nhỏ để hedge một CDS notional lớn — hedge ratio $\approx 0.117$ equity-dollars trên mỗi CDS-dollar. Khi tài sản công ty xấu đi, equity rớt (chân short equity lãi) đúng lúc CDS protection bạn đã bán lỗ — hai chân bù nhau, và bạn còn lại cược thuần rằng *cái lệch giữa hai thị trường sẽ đóng*.

Cạm bẫy thực chiến, và đây là lý do cap-structure arb khét tiếng khó:

- Hedge ratio này là **local** (tính tại một điểm) và trôi khi $V$ đổi — vì $\Phi(d_1)$ là hàm phi tuyến của $V$, delta thay đổi (gamma), nên trade phải **re-hedge động**, và mỗi lần re-hedge là một lần trả spread giao dịch, bào mòn cái alpha vốn đã mỏng.
- Merton là mô hình *stylized*: recovery cố định, một lớp nợ duy nhất, vol tài sản hằng số — đời thực có nợ nhiều lớp, covenant, và $\sigma_V$ nhảy. Calibration lệch thì hedge ratio lệch theo.
- Cược nền tảng của trade là *mô hình của bạn đúng hơn thị trường* về quan hệ equity–credit. Đó là một cược mạnh. Khi nó sai theo cách tệ nhất — ví dụ một **LBO** bất ngờ: công ty bị mua lại bằng nợ, equity holder được trả premium (equity *tăng*) trong khi đòn bẩy tăng vọt khiến credit *xấu đi* (CDS nới) — thì dấu tương quan Merton (equity và credit cùng đi lên hay xuống theo $V$) bị **đảo ngược**, và *cả hai chân cùng lỗ*. Đây chính là cách nhiều cap-structure book bị thổi bay trong làn sóng LBO 2005–2007.

## 18.5 Fixed-income relative value thuần rates

Rời tín dụng, sang RV trên đường cong Treasury/swap — nơi rủi ro vỡ nợ gần như bằng 0 và toàn bộ trò chơi là **thanh khoản và hình dạng đường cong**.

### On-the-run vs off-the-run: liquidity premium bằng số

Kho bạc Mỹ phát hành đều đặn. Trái phiếu 10Y vừa đấu giá gần nhất là **on-the-run (OTR)** — thanh khoản nhất, ai cũng dùng để hedge và giao dịch, nên có thể repo với chi phí thấp (thậm chí "special"). Trái phiếu 10Y phát hành kỳ trước, giờ còn ~9.75 năm đáo hạn, là **off-the-run (OFR)** — gần như giống hệt về dòng tiền nhưng giao dịch loãng hơn. Vì OTR được săn đón, nó **đắt hơn** (yield *thấp hơn*) — chênh lệch đó là **liquidity premium**.

Ví dụ số: OTR 10Y yield 4.150%, OFR 10Y (cùng kỳ hạn hiệu dụng) yield 4.180%. Liquidity premium $= 4.180 - 4.150 = 3\,\text{bp}$ — OTR đắt hơn 3bp yield. Trade RV: **long OFR (rẻ, yield cao), short OTR (đắt, yield thấp)**, thu 3bp carry, và cược rằng khi OTR hiện tại trở thành off-the-run (sau đợt phát hành 10Y kế tiếp, ~3 tháng, "the roll"), chênh lệch này *đóng về ~0*. Sizing **DV01-neutral** (hai chân cùng độ nhạy lãi suất theo đô la — DV01 là P&L trên 1bp dịch yield) để trung tính với dịch chuyển lãi suất chung — bạn chỉ cược cái spread 3bp hội tụ, không cược lãi suất đi đâu.

Con số P&L: giả sử book cỡ vừa được cân sao cho mỗi bp thay đổi của *spread OTR–OFR* cho \$10k P&L (tức DV01 trên spread $= \$10\text{k}\,\text{/bp}$; hai chân DV01 lớn tự triệt tiêu với dịch chuyển level, chỉ còn spread). Nếu spread đóng từ 3bp về 0.5bp (residual premium — nó hiếm khi về 0 hẳn vì OFR vẫn kém thanh khoản chút), bạn ăn $2.5\,\text{bp}$ $\times \$10\text{k}\,\text{/bp}$ $= \$25{,}000$ trên convergence, cộng carry 3bp/năm trong lúc chờ. Nghe bé — và đúng là bé; đây là trade **thu vài bp, đòn bẩy cao**. LTCM sống bằng chính họ trade này (long OFR / short OTR) với đòn bẩy ~25×, biến 3bp thành return hai chữ số — và chết vì chính đòn bẩy đó khi spread *nới ra thay vì đóng* trong cơn flight-to-liquidity 1998 (mục 18.7).

### Swap spread trade: Treasury vs swap

**Swap spread** = swap rate trừ Treasury yield cùng kỳ hạn. Nó đo phần bù của việc nhận fixed trong một swap (đối ứng floating SOFR) so với sở hữu trái phiếu chính phủ Mỹ. Ví dụ: 10Y swap rate 4.05%, 10Y Treasury 4.15% → swap spread $= 4.05 - 4.15 = -10\,\text{bp}$. Swap spread *âm* nghe phản trực giác (swap có rủi ro đối tác, lẽ ra phải trả *cao hơn* chính phủ) nhưng là hiện tượng có thật thời hậu-2008: cầm Treasury vật lý ngốn balance sheet và repo, nên nhà đầu tư đòi bù, đẩy Treasury yield lên *trên* swap — lại đúng cái motif balance-sheet cost của mục 18.2. Trade: nếu bạn nghĩ swap spread quá âm và sẽ nới về $-2\,\text{bp}$, bạn **receive swap + short Treasury** (đặt cược spread nới lên), DV01-neutral. Spread đi từ $-10$ về $-2$ là 8bp; với \$10k/bp trên spread, lãi $8\times\$10\text{k} = \$80{,}000$. Swap spread trade cược lên *chênh giữa hai đường cong benchmark* — cùng logic RV, khác cặp công cụ.

### Curve trade: 2s5s10s butterfly và PCA

Trade tinh vi hơn cược lên **độ cong (curvature)** của đường cong, không phải mức (level) hay độ dốc (slope). **2s5s10s butterfly**: long điểm giữa (5Y, "belly"), short hai cánh (2Y và 10Y, "wings") — hoặc ngược lại. Để dựng đúng, cần hiểu đường cong dịch chuyển theo ba mode chính, và đây là chỗ **PCA** vào cuộc.

Chạy PCA trên thay đổi yield hàng ngày của một rổ kỳ hạn (2Y, 5Y, 10Y, 30Y...), ba principal component đầu giải thích ~95–99% biến động và có ý nghĩa kinh tế cực rõ:

| PC | Tên | Hình dạng (loadings điển hình) | % variance |
|---|---|---|---|
| PC1 | **Level** | mọi kỳ hạn cùng dấu ($+$) | ~85% |
| PC2 | **Slope** | ngắn $-$, dài $+$ (curve steepen/flatten) | ~10% |
| PC3 | **Curvature** | belly một dấu, wings dấu ngược | ~3% |

Butterfly được thiết kế để **cô lập PC3 (curvature)**: trung tính với level và slope, chỉ phơi ra độ cong. Ý tưởng: nếu belly rẻ tương đối (5Y yield *cao* hơn nội suy tuyến tính 2Y–10Y) thì mua belly / bán wings sẽ lời khi cái "gù" đó phẳng lại — mà không thèm quan tâm cả đường cong đi lên hay xuống, dốc lên hay xuống.

Dẫn xuất weight cho DV01-neutral trên cả level và slope. Đặt DV01 ba chân $\text{dv}_2, \text{dv}_5, \text{dv}_{10}$ (dấu: belly ngược wings). Hai ràng buộc:

1. **Level-neutral (PC1)**: dịch song song $+1\,\text{bp}$ toàn đường cong không được sinh P&L. Vì loading PC1 gần như bằng nhau mọi kỳ hạn, điều kiện là tổng DV01 hai cánh khớp DV01 belly: $\text{dv}_2 + \text{dv}_{10} = \text{dv}_5$.
2. **Slope-neutral (PC2)**: một cú steepen (2Y xuống, 10Y lên) không được sinh P&L. Vì loading PC2 xấp xỉ tuyến tính theo kỳ hạn, cánh xa belly hơn phải mang ít DV01 hơn theo tỷ lệ khoảng cách — với 2s5s10s hai cánh gần đối xứng quanh 5Y nên chia gần 50/50.

Ví dụ số cụ thể (quy ước phổ biến "DV01-weighted 50/50 butterfly"): đặt belly DV01 $= \$100\text{k}$. Chia đều hai cánh để level-neutral: mỗi cánh $\$50\text{k}$ DV01. Vậy:
- Long 5Y với DV01 $\$100\text{k}$ (belly).
- Short 2Y với DV01 $\$50\text{k}$, short 10Y với DV01 $\$50\text{k}$ (wings).

Kiểm tra level-neutral: dịch song song $+1\,\text{bp}$ → belly $-\$100\text{k}\times 1$ (long, yield lên thì lỗ), wings $+(50+50)\text{k}\times 1 = +\$100\text{k}$ → ròng $0$. Đúng. Kiểm tra slope-neutral xấp xỉ: một cú steepen $2$Y $-1\,\text{bp}$ / $10$Y $+1\,\text{bp}$, belly bất động → chân 2Y (short) lỗ $\$50\text{k}\times 1$, chân 10Y (short) lời $\$50\text{k}\times 1$ → ròng $\approx 0$ (đối xứng). Đúng gần đúng. Bản chặt dùng loading PC2 *thực* để chia (thường ra hơi lệch, ví dụ 55/45 thay vì 50/50, vì loading slope không hoàn toàn tuyến tính) — đó là lý do desk **chạy PCA thay vì áng chừng**, để cái butterfly thật sự sạch level và slope chứ không rò rỉ một cược slope trá hình.

P&L của butterfly khi cô lập curvature: nếu belly *rẻ đi tương đối* $+3\,\text{bp}$ (5Y yield tăng $3\,\text{bp}$ so với đường nối 2Y–10Y) và bạn đã long belly / short wings, thì với DV01 belly $\$100\text{k}$, cú curvature đó cho $\approx \$100\text{k}\times 3 = \$300{,}000$ (dấu tùy chiều bạn đặt butterfly). Butterfly là cách trade "belly rẻ/đắt so với cánh" mà không cược chiều lãi suất — RV thuần trên hình dạng.

## 18.6 CDS index arbitrage — CDX/iTraxx vs single-name

Lên một tầng: **CDS index**. CDX (Bắc Mỹ) và iTraxx (châu Âu) là rổ CDS chuẩn hóa — ví dụ CDX IG gồm 125 single-name CDS đồng đều (equal-weight). Index giao dịch như một sản phẩm riêng, thanh khoản cao. Arbitrage sống ở khoảng lệch giữa **giá index** và **giá "intrinsic"** — tổng hợp lý thuyết từ 125 single-name thành phần.

### Index skew và cái bẫy "risky annuity"

**Intrinsic spread** của index là spread mà rổ 125 CDS single-name ngụ ý. **Index skew** $= s_{\text{index}} - s_{\text{intrinsic}}$. Vì lý do thanh khoản (mua/bán 1 lệnh index dễ hơn 125 lệnh single-name), index thường giao dịch ở spread hơi *khác* intrinsic.

Nhưng trước khi gọi cái lệch đó là "arbitrage", phải tính intrinsic cho *đúng* — và đây là chỗ nghiệp dư mất tiền. Intrinsic **không** phải trung bình cộng đơn giản các spread. Nó phải weight mỗi tên theo **risky annuity** của tên đó — tổng discount-factor $\times$ survival-probability trên các kỳ trả phí (đúng cái mẫu số của công thức par spread ở mục 18.1). Lý do: một tên spread cao có xác suất sống thấp hơn, nên annuity của nó *nhỏ hơn*, nghĩa là dòng premium của nó "ngắn" hơn và đóng góp ít hơn vào PV rổ. Trung bình cộng đơn giản cho các tên spread cao *quá nhiều* trọng số.

Đóng con số vào để thấy độ lớn. Lấy một rổ nhỏ 4 tên minh họa: ba tên spread $40\,\text{bp}$ và một tên spread $300\,\text{bp}$ (một tên "đang lâm nguy" kéo lệch). Với $R=40\%$, $r=3\%$, $T=5$, risky annuity xấp xỉ $A(s)=\frac{1-e^{-(\lambda+r)T}}{\lambda+r}$ với $\lambda=s/(1-R)$:

| Tên | spread | $\lambda$ | risky annuity $A$ |
|---|---|---|---|
| 1–3 | 40bp | 0.67% | ~4.44 |
| 4 | 300bp | 5.00% | ~3.53 |

- Trung bình cộng đơn giản: $(40+40+40+300)/4 = 105\,\text{bp}$.
- Annuity-weighted (intrinsic *đúng*): $\dfrac{\sum s_i A_i}{\sum A_i} = 100.1\,\text{bp}$.

Chênh **$\approx 5\,\text{bp}$** giữa hai cách tính — và đó *không phải* cơ hội, nó là một sai lệch **cấu trúc** do phương pháp: tên $300\,\text{bp}$ bị annuity kéo trọng số xuống nên intrinsic đúng thấp hơn trung bình thô. Nếu bạn dùng trung bình thô làm "intrinsic" rồi thấy index quote $100\,\text{bp}$, bạn sẽ tưởng có skew $-5\,\text{bp}$ để bắt, trong khi thật ra index đang đúng giá. Đây là bài học số một của index arb: *phần lớn cái "skew" nhìn thấy bằng mắt thường là lỗi của người tính, không phải lỗi của thị trường.*

### Skew thật và trade

Giả sử bạn đã tính intrinsic *đúng* (annuity-weighted) và ra $62\,\text{bp}$ cho CDX IG, còn index quote $65\,\text{bp}$. Skew thật $= 65 - 62 = +3\,\text{bp}$ — index giao dịch *rộng hơn* intrinsic $3\,\text{bp}$. Vì index rộng hơn tức *đắt hơn* về protection, bạn muốn **bán cái đắt và mua cái rẻ**:

- **Bán index protection** (thu $65\,\text{bp}$) — bán cái đắt.
- **Mua single-name protection** trên cả 125 tên (trả trung bình $62\,\text{bp}$ intrinsic) — mua cái rẻ.

Bạn khóa $+3\,\text{bp}$/năm gross, và nếu skew đóng về 0 bạn ăn thêm convergence trên mark-to-market. (Chú ý dấu: bán index protection = short credit qua index; mua 125 single-name protection = long credit... nhầm — chính xác là *cả hai* chân đều là protection nên rủi ro credit chung của rổ gần triệt tiêu, chỉ còn phơi ra basis index-vs-intrinsic. Nếu skew đảo dấu, bạn đảo chân.)

### Vì sao skew tồn tại và rủi ro của nó

Skew tồn tại vì ba lý do định lượng được, và chỉ *một* trong ba là cơ hội thật:

1. **Kỹ thuật tính (không phải cơ hội)** — như vừa thấy, cách weight bằng annuity làm intrinsic đúng luôn lệch vài bp so với các cách xấp xỉ thô; nhầm cái này thành skew là bẫy phổ biến nhất.
2. **Thanh khoản (cơ hội một phần)** — index dễ giao dịch nên cầu phòng hộ nhanh (macro hedger muốn short credit gấp) dồn vào index, đẩy spread index lệch tạm thời khỏi intrinsic; đây là phần có thể bắt, nhưng nó nhỏ và mau đóng.
3. **On-the-run roll (kỹ thuật, tạm thời)** — mỗi 6 tháng index roll sang series mới, tạo dòng lệnh và lệch tạm thời quanh ngày roll.

Rủi ro của index arb rất cụ thể và là bản xem trước của mục sau: nó là trade **125+ chân**, và nếu *một* tên trong rổ **jump-to-default** (vỡ nợ đột ngột), chân single-name của bạn dính (hoặc bỏ lỡ) một cú loss-given-default khổng lồ mà chân index (đã pro-rata loại tên đó theo cơ chế index) không bù đúng *độ lớn và timing*. Skew $3\,\text{bp}$ bạn khóa có thể bị một single default trong rổ xóa sạch trong một ngày. Đây là lý do index arb được coi là "**picking up nickels in front of a steamroller**" — nhặt vài xu (skew bé) trước cỗ máy ủi (default risk rời rạc). Cộng thêm chi phí giao dịch 125 chân single-name (bid-ask trên mỗi tên) thường nuốt gần hết $3\,\text{bp}$ gross — lại là bài học "trừ chi phí trước khi gọi là alpha".

## 18.7 Rủi ro của cả họ RV: jump-to-default, funding, và basis blow-out

Mọi trade trên đây chia chung một hình dạng P&L, và chương phải khép lại bằng việc đặt tên cho ba con quái vật đặc trưng của tín dụng và RV — chúng khác về chất với rủi ro của equity strategy.

### Jump-to-default (JTD)

Credit có một loại rủi ro equity gần như không có: giá không đi *liên tục* mà **nhảy về recovery tức thì**. Một công ty đang giao dịch spread 300bp có thể qua đêm nộp đơn phá sản, spread nhảy lên hàng nghìn bp hoặc bond rớt về recovery 40. Với người **bán CDS protection** (short credit), JTD là thảm họa: bạn thu 300bp/năm premium, rồi mất $(1-R) = 60\%$ notional trong một biến cố. Tính bằng số: bán \$10M protection thu $\$300\text{k}$/năm; một default cho loss $10\text{M}\times 0.6 = \$6\text{M}$ — mất **20 năm premium trong một ngày** ($6\text{M}/0.3\text{M} = 20$). JTD không được nắm bắt bởi vol/DTS thông thường (đó là rủi ro *đuôi rời rạc*, không phải variance liên tục — DTS đo bond nhúc nhích, JTD đo bond biến mất), nên phải size riêng: giới hạn **JTD exposure trên mỗi tên** (max loss nếu tên đó default *hôm nay*), không chỉ giới hạn spread-vol. Đây là lý do credit book đo hai loại rủi ro song song — **spread risk (DTS)** cho biến động liên tục và **JTD** cho cú nhảy rời rạc — và hai limit này gần như độc lập nhau.

### Liquidity, funding, và repo

RV trade sống bằng **đòn bẩy** vì mỗi trade thu vài bp. 3bp on-the-run/off-the-run chỉ thành return có nghĩa khi đòn bẩy 20–30×. Nhưng đòn bẩy được cấp qua **repo**, và repo có thể bị rút theo hai kênh: **haircut tăng** (từ 2% lên 10% buộc bạn nộp thêm vốn gấp 5 cho cùng một vị thế) hoặc **counterparty ngừng cho vay** hẳn. Khi funding co lại, bạn buộc phải **giải chấp đúng lúc tệ nhất** — bán vào thị trường không thanh khoản, hiện thực hóa loss. Đây là **funding liquidity risk**, và nó là cơ chế biến một drawdown-trên-giấy thành mất-vốn-thật.

Con số minh họa sức tàn phá của đòn bẩy: một book RV đòn bẩy 25× chỉ cần tài sản mất **4%** giá trị là **xóa sạch equity** ($1/25 = 4\%$). Với trade "an toàn" thu 3bp, một cú spread nới 12bp (chỉ $0.12\%$ dịch giá) khuếch đại qua $25\times$ thành $0.12\%\times 25 = 3\%$ loss trên vốn — ba phần trăm vốn bốc hơi vì một dịch chuyển mà thị trường coi là tiếng ồn. Và convergence trade *không có stop tự nhiên*: bạn cầm nó *vì tin* nó sẽ đóng, nên khi nó đi ngược, mô hình của bạn nói "giờ còn rẻ hơn, mua thêm đi" — bạn có xu hướng **tăng** vị thế khi nó đi ngược, đúng công thức tự sát. Stop-loss trong RV do đó phải là một *kỷ luật áp từ ngoài* (risk limit cứng, không thương lượng), vì logic nội tại của trade luôn cãi lại nó.

### Basis blow-out và convergence đảo chiều: bài học 1998 và 2008

Đây là con quái vật lớn nhất, và nó có tên: **convergence trade chỉ hội tụ nếu bạn sống đủ lâu để chờ**. Trong ngắn hạn, cái lẽ ra phải đóng có thể **nới toác ra** — divergence — khi tất cả những người cùng cầm trade đó bị buộc thoát cùng lúc. Cơ chế là một vòng xoáy: A bị margin call → A bán → spread nới thêm → B (cầm cùng trade) bị margin call → B bán → spread nới nữa. Chính sự *đông đúc* (crowding) của một trade "hiển nhiên" biến nó thành bẫy.

**LTCM 1998**: LTCM cầm hàng loạt convergence trade — long off-the-run / short on-the-run Treasury, long credit spread bond / short Treasury, swap spread — tất cả cược rằng các spread thanh khoản sẽ *thu hẹp*. Tất cả là "bán thanh khoản": thu premium cho việc cầm cái kém thanh khoản. Khi Nga vỡ nợ tháng 8/1998, thế giới lao vào **flight-to-liquidity**: ai cũng muốn cầm cái thanh khoản nhất (on-the-run Treasury), bán cái kém thanh khoản. Mọi spread LTCM cược "đóng" **nới ra đồng loạt** — on/off-the-run spread thay vì về 0 lại bung ra; swap spread bung; credit spread bung. Với đòn bẩy ~25×, những dịch chuyển vài chục bp trở thành loss hủy diệt. Điểm cốt tử: các trade *về lâu dài đúng* (nhiều spread thật sự đóng trong 1999–2000), nhưng LTCM không sống đến lúc đó vì margin call buộc thoát ở đáy. **"Markets can stay irrational longer than you can stay solvent."**

**2008**: cùng cơ chế, quy mô lớn hơn. CDS–bond basis (mục 18.2), thứ bình thường $-20\,\text{bp}$, **blow out xuống $-250\,\text{bp}$** — một dịch chuyển $-230\,\text{bp}$ — khi mọi người phải bán bond để giải chấp (cash bond ngốn balance sheet, phải xả) còn CDS thì không (unfunded, giữ được). Negative-basis trade — một "arbitrage" trung tính tín dụng — chịu mark-to-market loss $\approx -230\,\text{bp}$ trên chính vị thế lẽ ra vô rủi ro, vì chân bond rớt nhanh hơn nhiều so với chân CDS lời. Ai cầm nó với đòn bẩy bị margin call và phải thoát, đẩy basis còn âm hơn — một **vòng xoáy self-reinforcing** giống hệt 1998. Basis cuối cùng *có* đóng về bình thường năm 2009–2010, đúng như no-arbitrage hứa — nhưng chỉ những ai có funding *ổn định, không callable* mới sống đến ngày gặt.

Bài học tổng kết cho cả họ RV, và nó cột lại sợi chỉ đỏ mở chương: relative value **bán thanh khoản và bán convergence** — thu một khoản nhỏ đều đặn cho việc gánh rủi ro rằng "cái lệch sẽ đóng". Phân phối return của nó **skew âm nặng** giống hệt carry ở Chương 16: nhiều tháng thu bp đều đặn, đường equity mượt đến mức quyến rũ, rồi thỉnh thoảng một cú basis blow-out xóa nhiều năm lãi trong vài tuần. Ba phòng thủ, và cả ba đều là *cấu trúc* chứ không phải dự báo — bạn không thắng con quái vật này bằng cách *đoán* nó tới, mà bằng cách dựng book để sống sót khi nó tới:

1. **Đòn bẩy khiêm tốn** — đủ thấp để sống qua một cú nới 3–4 lần "bình thường" mà không bị margin call. Nếu blow-out lịch sử là $8\times$ độ lệch chuẩn thường ngày, size sao cho $8\sigma$ không giết bạn, không phải $2\sigma$.
2. **Funding dài hạn, không callable** — cái LTCM thiếu chí mạng, và Citadel/Millennium ngày nay coi là tài sản chiến lược ngang với alpha. Term financing và lockup vốn nhà đầu tư biến "phải bán ở đáy" thành "được chọn không bán".
3. **JTD và tail limit riêng** — không để một default đơn lẻ hay một blow-out đơn lẻ giết cả book; đo và giới hạn cú *rời rạc*, không chỉ cú *liên tục*.

Alpha của RV là thật và no-arbitrage bảo đảm nó cuối cùng hội tụ; nhưng "cuối cùng" là một khoảng thời gian mà nhiều nhà giao dịch giỏi đã không sống tới. Trong tín dụng và rates RV, kỹ năng phân biệt người xuất sắc với người phá sản không phải tìm cái lệch — ai cũng thấy 3bp — mà là *trừ đúng chi phí để biết 3bp đó có thật sự là alpha hay chỉ là giá của funding*, và *sizing để sống qua lúc cái lệch trở nên tệ hơn trước khi nó tốt lên*.

# Chương 19: Volatility trading (buy-side)

Mọi chương trước, dù nói về momentum, mean-reversion, hay factor, đều giao dịch trên một biến duy nhất: **giá**. Bạn dự báo giá sẽ lên hay xuống, và P&L của bạn là hàm của việc bạn đoán đúng hướng đến đâu. Chương này bước sang một chiều hoàn toàn khác. Ở đây bạn có thể *không quan tâm giá đi đâu* và vẫn kiếm được tiền — hoặc mất sạch — chỉ dựa trên việc giá **dao động mạnh hay yếu**. Volatility là một asset class riêng: có cung cầu riêng, có risk premium riêng, có đường cong kỳ hạn riêng, và có những kẻ blow-up huyền thoại riêng. Và quan trọng hơn với người đọc cuốn sách này: vol trading là ranh giới rõ nhất giữa P-world và Q-world. Người bán option ở Q-world (dealer, market-maker) định giá và hedge bằng độ đo rủi ro-trung tính $\mathbb{Q}$; người mua-bán vol có định hướng ở P-world (quỹ buy-side) đặt cược rằng thế giới thực $\mathbb{P}$ sẽ khác với cái mà giá option đang ngụ ý. Chính khe hở giữa hai độ đo đó — implied vs realized — là mỏ vàng và cũng là bãi mìn của cả chương.

Câu hỏi định hình mọi thứ: *ai trả tiền cho alpha vol, và vì sao nó chưa bị arbitrage?* Câu trả lời ngắn gọn là con người sợ biến động một cách bất đối xứng và sẵn lòng trả phí bảo hiểm cho nó, còn người bán bảo hiểm đó thì thỉnh thoảng bị xóa sổ — nên premium không bao giờ về 0, nhưng nó cũng không phải bữa trưa miễn phí. Cả chương này là việc bóc tách con số của cái mặc cả đó, từng chiến lược một, và mỗi chiến lược đều có một ví dụ tính ra tiền cụ thể. Điểm chung ngầm của cả năm chiến lược: chúng đều **short một dạng phí bảo hiểm**, nên đều mang cùng một hình dạng P&L — nhiều tháng lãi nhỏ đều đặn, thỉnh thoảng một cú lỗ khổng lồ. Hiểu được hình dạng đó, và hiểu vì sao Sharpe không nhìn thấy nó, là toàn bộ nghề này.

## 19.1 Variance risk premium: nền móng của toàn bộ chương

Vì sao mục này tồn tại: mọi chiến lược vol buy-side, dù phức tạp đến đâu, đều là một biến thể của một quan sát thực nghiệm duy nhất — **implied variance có xu hướng cao hơn realized variance một cách hệ thống**. Nắm chắc con số của quan sát này thì năm chiến lược sau chỉ là các cách khác nhau để thu hoạch nó.

Định nghĩa cho sạch. Realized variance trên một cửa sổ $[0,T]$ là tổng bình phương các log-return:

$$RV = \frac{252}{n}\sum_{t=1}^{n} \tilde r_t^2,$$

annualized, trong đó $\tilde r_t$ là log-return ngày và $n$ là số ngày giao dịch. Căn của nó là realized volatility. Implied variance là cái mà giá option đang ngụ ý — cụ thể là **strike của một variance swap**, một hợp đồng trả cho bạn $RV$ và bạn trả một mức cố định $K_{\text{var}}$ đã chốt lúc vào lệnh. Q-world cho ta công thức replicate strike đó bằng một rổ option OTM (xem cuốn Q-world ch.5 về variance swap replication qua log-contract); ở đây ta chỉ cần biết rằng $K_{\text{var}}$ quan sát được trên thị trường, và về mặt số nó xấp xỉ bình phương của mức implied vol ATM cộng một đóng góp dương từ skew (rổ replicate nặng phía put OTM đắt, nên $K_{\text{var}}$ thường nhỉnh hơn $\sigma_{\text{ATM}}^2$ vài phần trăm).

**Variance risk premium (VRP)** là hiệu:

$$VRP = K_{\text{var}} - \mathbb{E}^{\mathbb{P}}[RV].$$

Đây chính là điểm giao P/Q tinh khiết nhất trong cả hai cuốn sách. $K_{\text{var}}$ là một kỳ vọng dưới $\mathbb{Q}$ (giá thị trường của rủi ro variance); $\mathbb{E}^{\mathbb{P}}[RV]$ là kỳ vọng thật của bạn dưới $\mathbb{P}$. Khe hở dương giữa hai cái là phí bảo hiểm mà người sợ biến động trả cho người dám bán nó.

### 19.1.1 Bán variance swap: P&L tính bằng số

Cách trực tiếp nhất để thu VRP là **bán variance swap**: bạn nhận $K_{\text{var}}$, trả $RV$. P&L của người bán, tính trên một đơn vị *variance notional* $N_{\text{var}}$ (tiền cho mỗi điểm variance), là

$$\text{P\&L}_{\text{seller}} = N_{\text{var}}\,(K_{\text{var}} - RV).$$

Chú ý biến số ở đây là *variance* (vol bình phương), không phải vol — đây là cái bẫy đầu tiên và ta sẽ quay lại nó ở mục rủi ro.

Chạy running example của cả cuốn về vol. Giả sử strike variance swap 1 tháng trên SPX là **$K_{\text{var}} = 20^2 = 400$** (tức implied vol 20%), và tháng đó hóa ra thị trường yên ắng, realized vol chỉ **17%**, tức $RV = 17^2 = 289$. Bạn là người bán. Với variance notional \$10.000 cho mỗi điểm variance:

$$\text{P\&L} = 10.000 \times (400 - 289) = 10.000 \times 111 = \$1.110.000.$$

Lãi. Bạn thu strike 400, chỉ phải trả lại 289, giữ chênh lệch 111 điểm variance nhân notional. Con số 111 điểm variance đó chính là VRP *đã hiện thực hóa* của tháng này. Đọc theo vol: bạn short vol ở 20%, vol về 17%, chênh 3 vol points — đúng khoảng VRP lịch sử của SPX.

Bây giờ đảo ngược để thấy mặt tối. Tháng sau có một cú sốc, realized vol bật lên **35%**, $RV = 35^2 = 1225$:

$$\text{P\&L} = 10.000 \times (400 - 1225) = 10.000 \times (-825) = -\$8.250.000.$$

Một tháng lãi 1,11 triệu, một tháng lỗ 8,25 triệu. Tỉ số lỗ/lãi là $825/111 = 7{,}43$: bạn cần **hơn bảy tháng lãi** kiểu tháng đầu để bù một tháng lỗ kiểu tháng sau. Đây là bất đối xứng cốt lõi, và nó không phải ngẫu nhiên mà là *cấu trúc*: vì P&L là hàm của *variance* (bình phương vol), khi vol nhân đôi từ 20% lên 40% thì variance nhân bốn, và lỗ của bạn phình theo bình phương trong khi lãi bị chặn trên bởi chính $K_{\text{var}}$ (điều tốt nhất có thể xảy ra là $RV=0$, giới hạn lãi ở đúng 400 điểm). Payoff của người short variance là *lãi bị chặn, lỗ vô hạn* — đó là hình dạng của mọi chiến lược short vol: nhiều tháng lãi nhỏ đều đặn, thỉnh thoảng một tháng lỗ khổng lồ. Skew của phân phối P&L âm sâu.

### 19.1.2 VRP lịch sử và Sharpe của nó

Con số thực nghiệm để ghim vào đầu: trên SPX, trung bình dài hạn của $\sqrt{K_{\text{var}}} - \sqrt{\mathbb{E}[RV]}$ vào khoảng **2–4 vol points** (implied ~ 18–19%, realized ~ 15–16% trung bình). Nói theo variance thì hiệu này khuếch đại vì variance là bình phương: với implied 18–19% và realized 15–16%, implied variance trung bình cao hơn realized variance khoảng **30–45%** (ví dụ $18^2/15^2 - 1 = 44\%$; $18{,}5^2/16^2 - 1 = 34\%$). Đây là một điểm dễ nhầm — vài vol points nghe nhỏ, nhưng vì bạn giao dịch variance, cái edge tính theo variance lớn hơn nhiều so với cảm giác của con số vol.

Sharpe của chiến lược bán vol thô (short variance swap hoặc short straddle delta-hedged) trong lịch sử rất cao — thường báo cáo trong khoảng **0,8–1,5** nếu đo trên đủ dài. Nhưng con số Sharpe này *nói dối một cách nguy hiểm*, và hiểu vì sao nó nói dối là bài học đắt nhất của chương. Sharpe giả định phân phối gần chuẩn; short vol thì không. Ta minh họa bằng số. Giả sử chiến lược short vol cho lợi nhuận hàng tháng: 11 tháng mỗi tháng +1,1% và 1 tháng −8,3% (đúng theo hai ví dụ trên, scale về phần trăm vốn). Mean hàng tháng:

$$\bar\mu = \frac{11 \times 1{,}1\% + 1 \times (-8{,}3\%)}{12} = \frac{12{,}1\% - 8{,}3\%}{12} = \frac{3{,}8\%}{12} = 0{,}317\%/\text{tháng}.$$

Std hàng tháng (dùng phương sai population, chia cho 12): mỗi tháng lãi lệch $1{,}1 - 0{,}317 = 0{,}783$ khỏi mean, bình phương $0{,}613$; tháng lỗ lệch $-8{,}3 - 0{,}317 = -8{,}617$, bình phương $74{,}25$. Vậy

$$\text{Var} = \frac{11 \times 0{,}613 + 74{,}25}{12} = \frac{6{,}74 + 74{,}25}{12} = \frac{80{,}99}{12} = 6{,}75,\qquad \text{std} = 2{,}60\%.$$

Sharpe hàng tháng $= 0{,}317/2{,}60 = 0{,}122$, annualized $= 0{,}122 \times \sqrt{12} = 0{,}42$. Con số 0,42 nghe khiêm tốn, nhưng đó chỉ vì ta cố tình đặt một tháng lỗ *nhẹ* vào chuỗi; các quỹ short vol thật, trong giai đoạn êm, báo Sharpe 1,0–1,5 vì suốt nhiều năm không gặp tháng lỗ nào cả. Và đó chính là cái bẫy: skewness của chuỗi này là **−3,0** (một đuôi trái dài, xác minh bằng `scipy.stats.skew`), nên cái Sharpe đó *hoàn toàn bỏ sót* rủi ro thật. Nếu cái tháng −8,3% thay bằng một tháng crash −40% (variance nổ gấp bốn), toàn bộ Sharpe dương biến mất và bạn phá sản — mà Sharpe được đo *trước* cú đó vẫn đẹp. Đây là lý do người ta nói short vol là "nhặt xu trước xe lu" (picking up pennies in front of a steamroller): Sharpe đo được các đồng xu, không đo được chiếc xe lu. Về mặt kỹ thuật, đây đúng là ca mà một QR sẽ với sang **deflated Sharpe** và các moment bậc cao (Chương 9) thay vì tin vào Sharpe trần.

## 19.2 Gamma scalping: cỗ máy chuyển hóa VRP thành P&L hằng ngày

Vì sao mục này tồn tại: variance swap là công cụ thu VRP dạng đóng gói sẵn, nhưng bản chất *cơ học* của việc thu VRP nằm ở một quy trình cụ thể hơn — **delta-hedge một option**. Hiểu gamma scalping là hiểu chính xác đồng tiền VRP chảy vào túi bạn từ đâu, ngày qua ngày. Đây cũng là cây cầu thẳng nhất sang Q-world: toàn bộ machinery Greeks (Chương 5 cuốn Q-world) sống ở đây.

Ý tưởng: bạn mua một option (long vol), rồi liên tục delta-hedge nó bằng underlying để trung hòa rủi ro hướng. Sau khi hedge sạch delta, cái còn lại trong P&L của bạn *chỉ* là cược thuần túy về vol. Q-world cho ta công thức chính xác của P&L một vị thế delta-hedged sau một khoảng thời gian nhỏ $dt$:

$$d\Pi = \frac{1}{2}\Gamma S^2\left[\left(\frac{dS}{S}\right)^2 - \sigma_{\text{imp}}^2\,dt\right],$$

trong đó $\Gamma$ là gamma của option, $S$ là giá underlying, $dS/S$ là realized return trong khoảng đó, và $\sigma_{\text{imp}}$ là implied vol đã trả khi mua option. Đây là một trong những phương trình đẹp nhất của toàn bộ finance, vì nó nói toạc ra bản chất: **P&L delta-hedged tỉ lệ với hiệu giữa realized variance và implied variance**, có trọng số $\frac{1}{2}\Gamma S^2$ (gọi là dollar gamma). Cái ngoặc vuông tách sạch hai lực: $\big(\tfrac{dS}{S}\big)^2$ là "gamma gain" bạn thu được từ độ cong của option khi giá lắc; $\sigma_{\text{imp}}^2 dt$ là "theta bleed" bạn trả mỗi đơn vị thời gian vì đã mua option. Nếu thị trường dao động *mạnh hơn* implied, gamma gain thắng theta, người long lãi; nếu *êm hơn*, theta ăn hết, người long lỗ. Tích phân qua cả đời option:

$$\Pi = \int_0^T \frac{1}{2}\Gamma_t S_t^2\left(\sigma_{\text{real},t}^2 - \sigma_{\text{imp}}^2\right)dt.$$

Người *bán* option (short vol, thu VRP) chỉ đơn giản là dấu ngược lại: họ lãi khi realized < implied. Đây chính là variance swap ở mục 19.1 nhìn từ góc độ cơ học hằng ngày — và mối liên hệ chặt hơn ta tưởng. Một straddle vanilla có dollar gamma $\frac{1}{2}\Gamma S^2$ *thay đổi theo $S$* (gamma cao nhất khi ATM, tụt khi giá trôi xa strike), nên P&L của nó không phải đúng $RV - K_{\text{var}}$ mà bị "path-dependent": các dao động xảy ra gần strike được cân nặng hơn. Variance swap khắc phục điều đó bằng cách replicate qua một rổ option OTM có trọng số $1/K^2$ theo strike, sao cho tổng dollar gamma của rổ **không đổi theo $S$**. Chính điều kiện dollar-gamma-hằng đó biến tích phân trên thành đúng $RV - K_{\text{var}}$, sạch hình dạng và không còn phụ thuộc đường đi. Đó là lý do variance swap là công cụ "pure play" trên variance, còn straddle chỉ là xấp xỉ.

### 19.2.1 Một ngày gamma scalping tính bằng số

Cụ thể hóa. Bạn long 100 call ATM trên một cổ phiếu \$100, mỗi hợp đồng trên 100 cổ phiếu. Implied vol đã trả là **20%/năm**. Gamma của một call ATM là một con số Q-world; giả sử $\Gamma = 0{,}04$ mỗi cổ phiếu (tức mỗi \$1 giá lên, delta tăng 0,04). Số cổ phiếu tương đương của vị thế là $100 \text{ hợp đồng} \times 100 = 10.000$ cổ phiếu. Dollar gamma toàn vị thế:

$$\Gamma^\$ = \frac{1}{2}\Gamma S^2 N = \frac{1}{2} \times 0{,}04 \times 100^2 \times 10.000 = \frac{1}{2}\times 0{,}04 \times 10.000 \times 10.000 = \$2.000.000$$

trên một đơn vị $(dS/S)^2$. Đại lượng này là hệ số nhân biến hiệu variance thành tiền, và ta sẽ cắm thẳng vào công thức P&L bên dưới.

Implied vol 20%/năm quy ra *daily variance breakeven*: $\sigma_{\text{imp}}^2\,dt = (0{,}20)^2/252 = 0{,}04/252 = 0{,}0001587$. Tức breakeven daily move là $\sqrt{0{,}0001587} = 0{,}0126 = 1{,}26\%$. Nghĩa là: nếu hôm nay cổ phiếu nhúc nhích đúng ±1,26%, bạn hòa vốn (theta ăn hết gamma). Lớn hơn thì lãi, nhỏ hơn thì lỗ. Kiểm tra chéo cho vui: dollar theta hằng ngày của vị thế đúng bằng $\Gamma^\$ \times \sigma_{\text{imp}}^2 dt = 2.000.000 \times 0{,}0001587 = \$317{,}5$ — đó là "tiền thuê" bạn trả mỗi ngày để nắm gamma, và mỗi ngày bạn phải scalp ít nhất bấy nhiêu mới hòa.

Kịch bản lãi: hôm nay cổ phiếu chạy **+2%**. Realized $(dS/S)^2 = (0{,}02)^2 = 0{,}0004$. P&L ngày:

$$d\Pi = \Gamma^\$\left[(dS/S)^2 - \sigma_{\text{imp}}^2 dt\right] = 2.000.000 \times (0{,}0004 - 0{,}0001587) = 2.000.000 \times 0{,}0002413 = \$482{,}5.$$

Bạn lãi ~\$483 trong ngày vì thị trường dao động mạnh hơn implied. Cơ học đằng sau con số này là **gamma scalping** đúng nghĩa: là người long gamma, delta của bạn tăng khi giá lên và giảm khi giá xuống, nên hedge kỷ luật buộc bạn *bán cao, mua thấp* quanh mỗi dao động — bạn scalp lợi nhuận từ chính sự lắc lư. Con số \$483 là tổng các cú scalp đó (\$800 gamma gain) trừ đi theta đã trả (\$317,5).

Kịch bản lỗ: hôm nay cổ phiếu chỉ chạy **+0,5%**. $(dS/S)^2 = 0{,}000025$.

$$d\Pi = 2.000.000 \times (0{,}000025 - 0{,}0001587) = 2.000.000 \times (-0{,}0001337) = -\$267{,}5.$$

Thị trường quá êm, bạn không scalp đủ để bù theta, lỗ \$267. Đó là giá của việc long vol trong một ngày chán.

Cộng qua cả tháng: nếu realized vol trung bình hóa ra 17% trong khi bạn trả implied 20%, người long như bạn *lỗ* tổng cộng (bạn ở sai phía của VRP), còn người short (bán call cho bạn, delta-hedge) *lãi* đúng khoản đó. Đây là toàn bộ VRP nhìn qua kính hiển vi ngày: nó là dòng theta chảy từ người mua bảo hiểm sang người bán, mỗi ngày một ít, với người mua chỉ được đền bù vào đúng những ngày thị trường nổ.

## 19.3 Dispersion trade: bán tương quan

Vì sao mục này tồn tại: hai mục trước cược trên *mức* vol. Dispersion cược trên một thứ tinh vi hơn và ít crowded hơn — **tương quan giữa các cổ phiếu**. Đây là chiến lược vol có tính "relative value" nhất, và là nơi toán học đẹp nhất của chương.

Trực giác: vol của một chỉ số (index) *thấp hơn* trung bình vol của các cổ phiếu thành phần, vì khi gộp lại, các dao động idiosyncratic triệt tiêu nhau một phần — mức triệt tiêu phụ thuộc vào correlation. Nếu correlation thấp, index rất êm dù từng cổ phiếu lắc mạnh; nếu correlation = 1 (mọi thứ đi cùng nhau), index lắc y như thành phần. Cho nên **giá của index vol so với single-name vol chính là một giá ngụ ý của correlation.**

### 19.3.1 Implied correlation: dẫn xuất từng bước

Variance của một danh mục có trọng số $w_i$, vol thành phần $\sigma_i$, và ma trận correlation $\rho_{ij}$:

$$\sigma_{\text{index}}^2 = \sum_i w_i^2\sigma_i^2 + \sum_{i\neq j} w_i w_j \sigma_i\sigma_j\rho_{ij}.$$

Số hạng đầu là đóng góp idiosyncratic (variance riêng của từng tên), số hạng sau là đóng góp tương quan (các cặp). Giờ giả định một correlation *đồng nhất* duy nhất $\bar\rho$ cho mọi cặp — đây là **implied correlation**, một con số tóm tắt. Thay $\rho_{ij} = \bar\rho$ và giải ra:

$$\sigma_{\text{index}}^2 = \sum_i w_i^2\sigma_i^2 + \bar\rho\sum_{i\neq j} w_i w_j \sigma_i\sigma_j.$$

$$\boxed{\;\bar\rho_{\text{imp}} = \frac{\sigma_{\text{index}}^2 - \sum_i w_i^2\sigma_i^2}{\sum_{i\neq j} w_i w_j \sigma_i\sigma_j}\;}$$

Tử số là "variance dư" của index sau khi trừ phần idiosyncratic; mẫu số là tổng đóng góp chéo nếu correlation bằng 1. Tỉ số cho biết correlation ngụ ý thực tế là bao nhiêu phần của mức tối đa. Công thức chính xác này (dùng đủ cả hai số hạng) là cái các sàn báo giá "implied correlation index" như KCJ/COR3M thực sự tính.

Có một xấp xỉ thực dụng mà trader dùng miệng. Với danh mục nhiều tên vốn hóa gần đều, $\sum_i w_i^2\sigma_i^2$ (bậc $1/N$) nhỏ so với số hạng chéo, nên gần đúng

$$\bar\rho_{\text{imp}} \approx \left(\frac{\sigma_{\text{index}}}{\sum_i w_i\sigma_i}\right)^2 = \left(\frac{\sigma_{\text{index}}}{\bar\sigma}\right)^2,$$

với $\bar\sigma = \sum_i w_i\sigma_i$ là vol thành phần trung bình có trọng số. Công thức "bình phương tỉ số vol" này là con số dispersion trader nhẩm trong đầu. Nhưng phải cẩn thận với sai số của nó: xấp xỉ này bỏ số hạng idiosyncratic, nên nó *phóng đại* implied correlation khi số tên nhỏ. Với một rổ 5 tên vol ~26%, $\bar\rho$ thật 0,35, công thức đủ cho index vol ≈ 18,0% nhưng xấp xỉ $\bar\sigma\sqrt{\bar\rho}$ cho 15,4% — lệch ~15% (kiểm bằng numpy). Với S&P 500 (500 tên), sai số này teo lại vì $1/N$ rất nhỏ, và xấp xỉ dùng được. Bài học: dùng xấp xỉ để nhẩm nhanh và cho index rộng, dùng công thức boxed đầy đủ khi rổ hẹp hoặc khi tiền thật trên bàn.

### 19.3.2 Tính bằng số

Chạy running example vol của cuốn. Index vol implied = **18%**, weighted-average single-name vol = **26%**. Implied correlation xấp xỉ:

$$\bar\rho_{\text{imp}} \approx \left(\frac{0{,}18}{0{,}26}\right)^2 = (0{,}6923)^2 = 0{,}479.$$

Thị trường đang định giá correlation trung bình ~**48%**. Bạn nhìn con số này và tự hỏi: realized correlation thật của rổ này thường là bao nhiêu? Giả sử phân tích lịch sử của bạn cho thấy trong regime bình thường (không crash), realized correlation của rổ này chỉ ~**35%**. Vậy market đang trả *quá cao* cho correlation — đây là một cược dispersion. (Để nhất quán, ta dùng cùng một xấp xỉ vol-ratio ở cả hai chiều — implied và realized — nên chênh lệch correlation bên dưới là so sánh táo-với-táo, không bị nhiễm sai số của xấp xỉ.)

**Cấu trúc lệnh:** bán index vol (short straddle/variance swap trên index), mua single-name vol (long straddle trên từng thành phần), cân sao cho vega trung hòa. Bạn lãi khi realized correlation < implied correlation, vì khi đó index thật sự êm hơn cái bạn đã bán (bạn lãi ở chân short index) trong khi single-name vẫn lắc như bạn đã mua (bạn không lỗ nhiều ở chân long single).

**P&L tính bằng số.** Giả sử realized correlation hóa ra đúng 35% như bạn dự. Ta tính vol index *thực hiện* ứng với correlation đó, giữ nguyên single-name vol realized ở 26% (giả định single-name realized khớp implied để cô lập hiệu ứng correlation):

$$\sigma_{\text{index,real}} = \bar\sigma\sqrt{\bar\rho_{\text{real}}} = 0{,}26\times\sqrt{0{,}35} = 0{,}26 \times 0{,}5916 = 0{,}1538 = 15{,}38\%.$$

Bạn đã *bán* index vol ở 18%, index thật hiện thực chỉ 15,38%. Chân short index lãi $18\% - 15{,}38\% = 2{,}62$ vol points. Chân long single-name hòa (realized = implied 26%). Với vega notional index \$100.000 mỗi vol point, chân index đóng góp:

$$100.000 \times 2{,}62 = \$262.000$$

lãi gộp trước chi phí. Nếu single-name realized *cũng* nhỉnh hơn implied một chút (thường xảy ra vì bạn chọn tên có gamma tốt), chân long thêm lãi nữa. Toàn bộ edge đến từ chênh 13 điểm correlation (48% implied vs 35% realized), được khuếch đại qua đòn bẩy vega.

**Ai trả tiền và vì sao chưa bị arbitrage:** người mua index put để phòng hộ danh mục (structural hedging demand) đẩy index vol lên cao một cách dai dẳng — họ mua bảo hiểm ở tầng index vì rẻ hơn mua từng tên. Dòng cầu phòng hộ đó chính là cái bơm implied correlation lên trên realized. Chưa bị arbitrage vì cược này có một cái đuôi khủng khiếp: trong crash, correlation *phi lên gần 1* ("everything sells off together"), lúc đó chân short index nổ tung. Ta sẽ định lượng cú đuôi này ở mục 19.6. Dispersion về bản chất là **short correlation**, và short correlation là short một thứ nhảy vọt đúng lúc bạn cần nó đứng yên nhất.

## 19.4 Vol carry và term structure: thu roll-down

Vì sao mục này tồn tại: ba chiến lược trên thu VRP theo chiều *mức* và *tương quan*. Chiều thứ ba là *thời gian* — cấu trúc kỳ hạn của vol. VIX futures và variance term structure thường ở trạng thái **contango** (kỳ hạn xa đắt hơn kỳ hạn gần), và trạng thái đó tạo ra một dòng carry thu hoạch được bằng cách bán vol xa, để nó "roll down" về giao ngay.

Cơ chế: VIX spot (vol kỳ vọng 30 ngày) trung bình quanh 15–16 trong regime bình thường, nhưng VIX futures kỳ hạn xa được định giá cao hơn vì bất định về tương lai và vì cầu phòng hộ dài hạn. Đường cong contango dốc lên. Nếu không có gì xảy ra, khi thời gian trôi, một future kỳ hạn xa dần *rơi xuống* mức spot thấp hơn — đó là roll-down, và người short future kỳ hạn đó bỏ túi chênh lệch.

### 19.4.1 VIX futures roll tính bằng số

Giả sử đường cong VIX một ngày điển hình: VIX spot = **15**, future 1 tháng = **16**, future 2 tháng = **17**. Contango dốc ~1 điểm/tháng. Bạn **short 1 future 2 tháng ở giá 17 và giữ một tháng**, rồi mua lại khi nó đã trở thành future 1 tháng. Nếu đường cong *đứng yên* (không dịch), thì sau một tháng cái future bạn short — vốn là 2-tháng ở 17 — nay đứng ở vị trí kỳ hạn 1-tháng, và tại vị trí đó đường cong định giá ~16. Bạn short ở 17, mua lại ở 16:

$$\text{Roll P\&L} = 17 - 16 = 1 \text{ điểm VIX}.$$

Với mỗi hợp đồng VIX future có multiplier \$1.000/điểm, đó là **\$1.000/hợp đồng/tháng** thu được *chỉ nhờ đường cong dốc và thời gian trôi*, không cần vol đi đâu cả. (Chú ý logic: điều thu carry không phải là "giá của một future cố định giảm", mà là *future bạn nắm trượt xuống dọc đường cong dốc lên* khi kỳ hạn của nó ngắn lại — nó tiến từ điểm 17 về điểm 16 trên đường cong đứng yên.) Annualize thô nếu roll đều mỗi tháng: ~12 điểm/năm trên một future giá 16–17, tức carry yield cỡ 75%/năm theo mệnh giá future — một con số phi lý, và chính sự phi lý đó là lý do các ETP short-VIX (như XIV, SVXY) hấp dẫn đến vậy trong thị trường yên, và cũng là cảnh báo đầu tiên rằng nó không thể miễn phí.

Nhưng — và đây là chủ đề lặp lại — carry này là **short vol trá hình**. Đường cong contango đảo thành **backwardation** (kỳ hạn gần đắt hơn xa) đúng vào lúc vol spike. Khi VIX spot nhảy từ 15 lên 40 trong một ngày, cái future 1-tháng bạn đang short không rơi xuống 16 mà bay lên 35+, và roll P&L +1 điểm/tháng của bạn bị nuốt bởi một cú lỗ cỡ −19 điểm trong *một ngày* — tức 19 tháng carry bay trong một phiên. Ta định lượng chính cú này qua case XIV ở mục 19.6. Vol carry trả cho bạn một đồng đều đặn để bạn đứng canh một quả bom hẹn giờ.

### 19.4.2 Đọc contango như một tín hiệu

Có một tinh tế đáng giá cho QR: độ dốc contango tự nó là một tín hiệu về mức độ crowding của trade short vol. Khi contango rất dốc (spot 13, 1-tháng 16, tức +23%), carry hấp dẫn kéo dòng tiền short vol vào, và chính dòng đó *ép* implied xuống, làm đường cong dốc hơn nữa cho đến khi mỏng manh. Khi cả thị trường cùng short cùng một điểm trên đường cong, cú unwind đồng pha (mọi người phải mua lại vol cùng lúc) tạo ra một phản hồi dương tàn khốc — đúng cơ chế Volmageddon. Đo độ dốc và so với mức trung bình lịch sử là một cách thô để cảm nhận "nước đã sâu đến đâu": contango dốc bất thường không phải tín hiệu "carry ngon" mà thường là tín hiệu "quá đông người đang canh cùng quả bom".

## 19.5 Skew và put-selling: thu hoạch phí bảo hiểm đuôi

Vì sao mục này tồn tại: VRP ở mục 19.1 là premium trên *mức* vol; còn có một premium riêng trên *hình dạng* của vol theo strike — **skew**. Put OTM (bảo hiểm crash) đắt hơn một cách hệ thống so với call OTM cùng khoảng cách, vì ai cũng muốn bảo hiểm giảm giá. Bán cái skew đó là một chiến lược riêng, với cái đuôi riêng và tệ nhất trong cả chương.

Sự thật thị trường: implied vol của put OTM cao hơn ATM, cao hơn nữa so với call OTM — đường "volatility skew" dốc xuống bên phải với equity index. Ví dụ số điển hình cho SPX 1 tháng: put 90% strike (OTM 10%) có implied vol **24%**, ATM **19%**, call 110% strike **16%**. Chênh put-vs-ATM = 5 vol points là "phí skew".

### 19.5.1 Bán put OTM tính bằng số

Cấu trúc đơn giản: bán put OTM đã bảo chứng (cash-secured put) hoặc put spread. Bạn thu premium; nếu thị trường không sập dưới strike, bạn giữ hết. Giả sử SPX ở **5.000**, bạn bán put strike **4.500** (OTM 10%) 1 tháng, implied vol 24%. Premium của put OTM đó — một con số Black-Scholes Q-world — giả sử là **~0,9% của notional** (put xa nên rẻ theo tiền, đắt theo vol). Trên notional \$10M:

$$\text{Premium thu} = 0{,}9\% \times \$10M = \$90.000.$$

Kịch bản thường (thị trường không sập): put hết hạn vô giá trị, bạn giữ trọn \$90.000. Làm mỗi tháng, giả sử 11/12 tháng êm, bạn thu $11 \times 90.000 = \$990.000$/năm.

Kịch bản đuôi: một tháng SPX sập **−15%** về 4.250, xuyên qua strike 4.500. Put in-the-money 250 điểm = 5% của 5.000. Bạn — người bán put — phải trả $5\% \times \$10M = \$500.000$, trừ premium đã thu \$90.000, lỗ ròng **\$410.000** trong một tháng. Cần hơn bốn tháng lãi để bù một tháng lỗ, và nếu cú sập là −30% (2008, tháng 3/2020), put ITM 20% của 5.000, lỗ nhảy lên $20\% \times 10M - 90k = \$1{,}91M$ — hơn hai năm lãi bay trong một tháng. Đây lại là hình dạng bất đối xứng, lần này còn dữ hơn vì put OTM có **negative skew kép**: bạn short cả vol *và* short cái đuôi mà skew đang định giá, nên khi cú sập tới, cả hai cái cùng đánh bạn — realized nổ *và* implied put vol nổ còn nhanh hơn (put skew dựng đứng trong panic).

### 19.5.2 Vì sao skew premium tồn tại dai dẳng

Skew premium bền vì nó là phí bảo hiểm thật cho một rủi ro mà đa số nhà đầu tư *phải* mua: quỹ hưu trí, quỹ tương hỗ, mọi thực thể có mandate không được mất quá X% đều là người mua put cấu trúc. Cầu một chiều đó đẩy put vol lên vĩnh viễn. Nhưng "bền" không có nghĩa "an toàn": người bán skew đang được trả để *chịu* đúng cái rủi ro mà mọi người khác trả tiền để tránh, nên khi cái rủi ro đó hiện thực, người bán skew là người đứng cuối cùng chịu trận. Sizing là tất cả — và đây là nơi Kelly (Chương 5) gào lên rằng với một payoff lệch trái sâu như bán put OTM, kích thước tối ưu nhỏ hơn nhiều so với trực giác, vì một cú đuôi có thể đưa vốn về gần 0, mà $\log(0) = -\infty$ trừng phạt vô hạn. Một trader put-selling sống lâu không phải người bán nhiều premium nhất, mà là người size đủ nhỏ để sống qua cú −30% mà không bị margin call quét sạch.

## 19.6 Rủi ro: short vol = short gamma = blow-up

Vì sao mục này tồn tại — và vì sao nó là mục dài nhất: năm chiến lược trên đều là các biến thể của short vol, và tất cả chia chung một DNA rủi ro duy nhất. Nếu bạn chỉ nhớ một điều từ chương này, hãy nhớ mục này. Bốn cơ chế đan vào nhau: short vol là short gamma, đuôi trái, convexity ngược, và correlation spike. Chúng không cộng — chúng nhân với nhau trong một cuộc khủng hoảng.

### 19.6.1 Short gamma: cơ học của việc bị nghiền

Người short vol là người **short gamma**. Nhắc lại công thức 19.2 với dấu ngược cho người short:

$$d\Pi_{\text{short}} = \frac{1}{2}|\Gamma| S^2\left[\sigma_{\text{imp}}^2 dt - (dS/S)^2\right].$$

Khi thị trường êm, $(dS/S)^2$ nhỏ, người short lãi đều. Nhưng khi $(dS/S)^2$ lớn (giá nhảy), số hạng âm nổ ra. Tệ hơn: người short gamma khi delta-hedge bị buộc **mua cao, bán thấp** — ngược hẳn người long gamma. Giá lên, delta short của họ càng âm, họ phải mua để hedge — mua vào lúc giá đang lên. Giá xuống, họ phải bán — bán vào lúc giá đang xuống. Hedging của họ *khuếch đại* chuyển động thay vì hấp thụ nó. Đây là lý do khi dealer cộng đồng short gamma (dealer gamma âm — xem cuốn Q-world về dealer gamma positioning), một cú giảm nhỏ tự nuôi thành cú giảm lớn: mỗi tick xuống buộc một làn sóng bán hedge, đẩy tick tiếp theo xuống. Short gamma biến bạn thành nhiên liệu cho chính đám cháy.

Tính bằng số cú nghiền. Người short 100 straddle ở 20% implied (dollar gamma $\Gamma^\$ = \$2M$ như mục 19.2, giờ với dấu âm về gamma). Một ngày bình thường +0,5%: họ lãi $2M \times (0{,}0001587 - 0{,}000025) = 2M\times 0{,}0001337 = +\$267$. Đẹp. Nhưng một ngày **−7%** (kiểu 2/2018 hoặc một chân của crash):

$$d\Pi_{\text{short}} = 2M \times (0{,}0001587 - (0{,}07)^2) = 2M\times(0{,}0001587 - 0{,}0049) = 2M \times (-0{,}004741) = -\$9.482$$

trong *một ngày*, so với +\$267 ngày thường. Tỉ số là 35: một ngày xấu xóa **35 ngày** lãi (xác minh: $9482/267 = 35{,}5$). Và đó mới chỉ là gamma tĩnh với một ngày −7%; thực tế còn tệ hơn vì —

### 19.6.2 Vega nổ: implied vol bản thân nó phi lên

Khi thị trường crash, không chỉ realized variance nổ — *implied* vol cũng phi lên (VIX từ 15 lên 40). Người short vol lỗ kép: lỗ trên realized (gamma) *và* mark-to-market lỗ trên vega (implied vol họ đã bán giờ đắt hơn nhiều để mua lại). Với vega notional \$100.000/vol point, VIX nhảy từ 15 lên 40 là **+25 vol points**, tức mark-to-market lỗ tức thời:

$$100.000 \times 25 = \$2.500.000$$

*trước khi* thị trường kịp hiện thực bất kỳ realized variance nào. Đây là đòn giết người short vol trong ngày: bạn có thể đúng về realized dài hạn, nhưng margin call ập đến từ mark vega *ngay hôm nay*, buộc bạn đóng vị thế ở đúng đáy — biến một khoản lỗ giấy thành lỗ thật, vĩnh viễn. Nghịch lý cay đắng: nhiều quỹ short vol *đúng* về luận điểm ("vol sẽ hạ nhiệt trong vài tuần") nhưng vẫn chết, vì họ không sống nổi đến lúc luận điểm đúng.

### 19.6.3 Correlation spike: dispersion và phòng hộ cùng chết

Nhắc lại dispersion (mục 19.3): bạn short index vol, long single-name vol, lãi khi realized correlation thấp. Trong crash, correlation *phi lên gần 1*. Tính lại vol index thực hiện với $\bar\rho = 0{,}9$ (crash), single vol nhảy lên 45%:

$$\sigma_{\text{index,real}} = \bar\sigma\sqrt{\bar\rho} = 0{,}45\times\sqrt{0{,}9} = 0{,}45\times 0{,}9487 = 0{,}4269 = 42{,}7\%.$$

Bạn đã short index vol ở 18%; index thực hiện 42,7%. Chân short index lỗ $42{,}7 - 18 = 24{,}7$ vol points. Với vega \$100.000/point: **lỗ \$2,47M** ở riêng chân index — và chân long single-name không cứu được vì nó chỉ tăng theo tuyến tính chậm hơn (single vol 26%→45% chỉ đem lại một phần bù nhỏ so với cú nổ ở chân index). Cú correlation-to-one này là lý do dispersion, dù đẹp về relative value, vẫn là một chiến lược có đuôi tail-risk lớn: bạn short chính xác cái biến số (correlation) nhảy vọt đúng lúc bạn không chịu nổi. Chú ý cơ chế thống nhất: cả dispersion, put-selling và vol carry đều *ngắn cùng một rủi ro ẩn* — rủi ro "mọi thứ đổ cùng lúc" — nên trong một crash thật, một quỹ nghĩ mình có ba chiến lược đa dạng hóa thực ra chỉ có *một* cược lặp ba lần.

### 19.6.4 Case study: XIV, ngày 5 tháng 2 năm 2018 (Volmageddon)

Đây là hiện thân hoàn hảo của mọi cơ chế trên, và ta trỏ sang Phụ lục B để mổ xẻ đầy đủ; ở đây tóm tắt con số để đóng đinh bài học của chương. XIV là một ETP cho phép nhà đầu tư *inverse* VIX short-term futures — về bản chất, một cái hộp đóng gói sẵn chiến lược vol carry ở mục 19.4 (short front VIX futures, thu roll-down). Nó đã tăng ~150% trong 2017 nhờ contango dốc và vol thấp lịch sử — mọi tháng thu carry, đường cong mượt như lụa. Đúng chân dung "nhặt xu".

Ngày 5/2/2018, VIX spot nhảy từ ~17 lên ~37 trong một phiên (VIX front future còn dữ hơn). Cơ chế blow-up:

1. **Short vol = short gamma**: XIV short front VIX future, nên khi future phi lên, NAV của nó rơi tự do.
2. **Convexity ngược + rebalance cưỡng bức**: prospectus buộc XIV rebalance cuối ngày để giữ leverage inverse −1×. Khi vol tăng, để giữ −1× nó phải **mua thêm VIX future** — mua vào đúng lúc giá đang phi. Cơ chế rebalance này giống hệt short-gamma hedging ở 19.6.1: nó *khuếch đại* cú tăng. Ước tính vài trăm triệu đô VIX vega phải mua trong 15 phút cuối phiên, tự đẩy front future lên thêm.
3. **Feedback đồng pha**: mọi ETP short-vol (XIV, SVXY, và các quỹ chạy chiến lược tương tự) cùng phải mua vol cùng một thời điểm cuối ngày — đúng cơ chế unwind đồng pha ở mục 19.4.2. Cầu mua đồng loạt đẩy VIX future lên thêm nữa, nuôi vòng lặp.

Kết quả: NAV của XIV mất **~96% trong một ngày** (từ ~\$99 xuống ~\$4, tức $(4-99)/99 = -96\%$). Credit Suisse thực thi quyền đóng (acceleration event khi mất >80% trong ngày) và **thanh lý sản phẩm**. Người nắm giữ — nhiều là nhà đầu tư nhỏ lẻ tưởng mình đang "ăn carry an toàn" — mất gần sạch trong 24 giờ. Toàn bộ VRP tích lũy nhiều năm bay trong một phiên, đúng theo số học "bảy tháng lãi bù một tháng lỗ" ở mục 19.1, chỉ là tỉ lệ ở đây là *hàng năm lãi bù một ngày lỗ*.

Bài học rút thành nguyên tắc, không phải giai thoại: (1) **short vol là short một khoản nợ ngẫu nhiên có đuôi vô hạn**, và leverage cố định (−1× rebalance hằng ngày) trên một tài sản có đuôi béo là công thức tự hủy — convexity ngược đảm bảo bạn mua đúng đỉnh, bán đúng đáy. (2) **Crowding giết chết carry**: khi ai cũng short cùng điểm trên đường cong, cú unwind không còn là rủi ro độc lập của bạn mà là một cascade hệ thống. (3) **Sharpe không nhìn thấy điều này**: XIV có Sharpe tuyệt đẹp đến hết ngày 4/2/2018.

### 19.6.5 Nguyên tắc quản lý rủi ro vol

Gói lại thành các con số hành động. **Sizing theo đuôi, không theo Sharpe**: dùng scenario left-tail (crash −20%, vol → 60%, correlation → 0,9) làm ràng buộc sizing chứ không dùng vol hằng ngày — vì như mục 19.1.2 cho thấy, Sharpe đo xu không đo xe lu, và skewness −3 của chuỗi P&L nói rằng std đã đánh lừa bạn. **Mua đuôi bảo hiểm cho chính mình** (long put OTM xa, long VIX call): điều này biến short-vol thành một cấu trúc convex-lại, hy sinh một phần VRP để cắt cụt đuôi trái — thường là mua put spread hoặc call VIX rẻ để cap lỗ ở một mức hữu hạn; bạn đổi một phần của 111 điểm variance mỗi tháng lấy quyền không mất 825 điểm trong tháng crash. **Giới hạn leverage cứng**: XIV chết vì −1× cố định; một quỹ tỉnh táo giảm gross khi vol tăng (vol-targeting ngược), tự nhiên de-risk khi nước sâu. **Đo crowding**: theo dõi độ dốc contango, kích thước tổng các ETP short-vol, và dealer gamma positioning — khi ba cái cùng báo "quá đông ở một phía", cắt size trước, hỏi sau.

Vol trading là asset class kỷ luật nhất trong cả cuốn sách, không phải vì toán khó hơn — mà vì nó trừng phạt sự thiếu kỷ luật một cách nhanh nhất và không thể đảo ngược. Bạn có thể sai về momentum trong sáu tháng và vẫn còn vốn để sửa; bạn sai về đuôi vol một lần và không còn ván sau. Đó là lý do mọi con số trong chương này đều quay về một phép so sánh duy nhất — premium nhỏ đều đặn ở tử số, đuôi khổng lồ hiếm hoi ở mẫu số — và vì sao người sống lâu trong nghề này không phải người thu VRP giỏi nhất, mà là người *sống sót qua cái mẫu số* đủ nhiều lần để tử số kịp cộng dồn.

# Chương 20: Performance attribution và P&L decomposition

Cuối tháng, một con số hạ xuống bàn của PM: danh mục lãi 1.8%, benchmark lãi 1.1%, active return +0.7%. Câu hỏi tiếp theo — câu mà quyết định bonus, quyết định vốn được cấp thêm hay bị rút, quyết định một PM còn ngồi ghế đó năm sau hay không — không phải "bao nhiêu" mà là **"vì đâu"**. Cái +0.7% đó đến từ việc chọn đúng ngành hay chọn đúng cổ trong ngành? Đến từ alpha thật của tín hiệu, hay chỉ từ việc vô tình nghiêng vào momentum đúng tháng momentum thắng? Bao nhiêu bị phí giao dịch và financing gặm mất? Và — câu hỏi lạnh lùng nhất — cái +0.7% ấy có phân biệt được với may mắn không, hay t-stat của nó bé đến mức tháng sau có thể thành -0.7% mà chẳng vi phạm quy luật nào?

Attribution là bộ máy trả lời những câu đó. Nó là nghiệp vụ chuẩn buy-side mà các chương trước chưa hệ thống hóa: chương 5 dạy ghép tín hiệu thành danh mục, chương 6 dạy factor là ngôn ngữ của return, chương 14 dạy đo và phân bổ rủi ro — nhưng khép vòng lại, biến return đã-xảy-ra thành một bản kê "tiền này đến từ đâu, rủi ro này nằm ở đâu, và có thật không", là việc của chương này. Nguyên tắc xuyên suốt: **decomposition phải cộng lại đúng** — mọi đồng P&L phải quy được về một nguồn có tên, và tổng các nguồn phải khớp con số tổng đến từng basis point. Một attribution không reconcile được là một attribution sai, và ta sẽ thấy nó *tự nhiên* không cộng tuyến tính ở đâu, rồi xử lý chỗ đó cho đàng hoàng thay vì quét xuống thảm.

## 20.1 Vì sao attribution tồn tại — và vì sao nó khó cộng cho khớp

Có một cám dỗ ngây thơ: return danh mục là tổng return của các vị thế nhân trọng số, vậy thì active return chắc cũng chỉ là tổng các đóng góp, cộng thẳng là xong. Cám dỗ này sai ở ba chỗ, và ba chỗ đó là toàn bộ lý do attribution là một *kỹ năng* chứ không phải một phép cộng.

Thứ nhất, **cross terms**. Khi bạn vừa lệch trọng số (overweight một ngành) vừa chọn cổ tốt trong ngành đó, một phần lợi nhuận sinh ra từ *tương tác* của hai quyết định — không thuộc riêng "chọn ngành" cũng chẳng thuộc riêng "chọn cổ". Ép nó vào một trong hai là gian lận sổ sách. Thứ hai, **compounding qua nhiều kỳ**: attribution một kỳ cộng gọn, nhưng return nhiều kỳ *nhân* chứ không cộng, nên tổng attribution 12 tháng không bằng tổng số học 12 tháng attribution — sai số này có tên (residual/linking) và phải được san đúng cách. Thứ ba, **overlap giữa các nguồn**: alpha và factor không trực giao sẵn; nếu tín hiệu của bạn nạp 0.9 vào UMD (chương 6), thì phần return bạn tưởng là "alpha" thực ra phần lớn là "momentum factor return" đội lốt. Không tách sạch thì bạn tự khen mình vì cưỡi một beta rẻ tiền.

Ba khó khăn này không phải lỗi kỹ thuật vặt — chúng là bản chất. Attribution tốt thừa nhận chúng, đặt tên cho phần dư, và reconcile đến 0. Ta đi qua bốn ống kính — Brinson (holdings), factor, risk, và P&L-explain hằng ngày — rồi khép bằng câu hỏi thống kê: con số này có thật không.

## 20.2 Brinson attribution — allocation, selection, interaction

Ống kính đầu tiên, cổ điển nhất, là **Brinson-Hood-Beebower**. Nó không cần biết factor là gì; nó chỉ cần bốn thứ cho mỗi *segment* (thường là sector): trọng số danh mục $w_i^P$, trọng số benchmark $w_i^B$, return danh mục trong segment $r_i^P$, và return benchmark trong segment $r_i^B$. Từ đó nó tách active return thành ba hiệu ứng trả lời ba câu người-thường: *Ta có đặt tiền vào đúng ngành không?* (allocation), *Trong mỗi ngành ta có chọn đúng cổ không?* (selection), và phần tương tác không thuộc riêng ai.

Return danh mục là $r^P=\sum_i w_i^P r_i^P$, benchmark là $r^B=\sum_i w_i^B r_i^B$, active return $A=r^P-r^B$. Công thức tách cho từng segment $i$:

$$\text{Allocation}_i=(w_i^P-w_i^B)\,r_i^B,\quad \text{Selection}_i=w_i^B\,(r_i^P-r_i^B),\quad \text{Interaction}_i=(w_i^P-w_i^B)(r_i^P-r_i^B).$$

Dẫn xuất chỉ là mở ngoặc và cộng có kiểm soát. Đóng góp active của segment $i$ là $w_i^P r_i^P - w_i^B r_i^B$. Cộng và trừ $w_i^B r_i^B$ và $w_i^P r_i^B$ một cách khéo:

$$w_i^P r_i^P - w_i^B r_i^B = \underbrace{(w_i^P-w_i^B)r_i^B}_{\text{allocation}} + \underbrace{w_i^B(r_i^P-r_i^B)}_{\text{selection}} + \underbrace{(w_i^P-w_i^B)(r_i^P-r_i^B)}_{\text{interaction}}.$$

Bạn kiểm tra bằng cách nhân bung vế phải: $w_i^P r_i^B - w_i^B r_i^B + w_i^B r_i^P - w_i^B r_i^B + w_i^P r_i^P - w_i^P r_i^B - w_i^B r_i^P + w_i^B r_i^B$. Các số hạng $w_i^P r_i^B$, $-w_i^P r_i^B$ triệt tiêu; $w_i^B r_i^P$, $-w_i^B r_i^P$ triệt tiêu; còn lại $-w_i^B r_i^B$ và chỉ giữ $w_i^P r_i^P - w_i^B r_i^B$. Khớp. Đây là điểm đẹp của Brinson: nó là một đẳng thức đại số, **luôn** reconcile đến từng bp — không phải xấp xỉ.

**Ví dụ số đầy đủ.** Danh mục và benchmark trên 3 sector — Tech, Financials, Energy:

| Sector | $w_i^P$ | $w_i^B$ | $r_i^P$ | $r_i^B$ |
|---|---|---|---|---|
| Tech | 50% | 40% | 8.0% | 6.0% |
| Financials | 30% | 35% | 3.0% | 4.0% |
| Energy | 20% | 25% | -2.0% | -3.0% |

Return tổng trước. $r^P = 0.50(8.0)+0.30(3.0)+0.20(-2.0)=4.0+0.9-0.4=4.5\%$. $r^B=0.40(6.0)+0.35(4.0)+0.25(-3.0)=2.4+1.4-0.75=3.05\%$. Active $A=4.5-3.05=+1.45\%$. Đây là con số phải khớp cuối cùng.

Allocation từng sector (đặt tiền đúng ngành chưa — dùng return *benchmark* của ngành để cô lập quyết định trọng số):
- Tech: $(0.50-0.40)\times 6.0 = 0.10\times 6.0 = +0.60\%$. Overweight ngành lãi dương → tốt.
- Financials: $(0.30-0.35)\times 4.0 = -0.05\times 4.0 = -0.20\%$. Underweight ngành lãi dương → bị phạt.
- Energy: $(0.20-0.25)\times(-3.0) = -0.05\times(-3.0)=+0.15\%$. Underweight ngành lỗ → thưởng.
- Tổng allocation $=0.60-0.20+0.15=+0.55\%$.

Selection từng sector (trong ngành chọn cổ đúng chưa — dùng trọng số *benchmark* để cô lập quyết định chọn cổ):
- Tech: $0.40\times(8.0-6.0)=0.40\times 2.0=+0.80\%$.
- Financials: $0.35\times(3.0-4.0)=0.35\times(-1.0)=-0.35\%$.
- Energy: $0.25\times(-2.0-(-3.0))=0.25\times 1.0=+0.25\%$.
- Tổng selection $=0.80-0.35+0.25=+0.70\%$.

Interaction từng sector (tương tác — chỉ khác 0 khi vừa lệch trọng số vừa lệch return):
- Tech: $(0.10)(2.0)=+0.20\%$.
- Financials: $(-0.05)(-1.0)=+0.05\%$.
- Energy: $(-0.05)(1.0)=-0.05\%$.
- Tổng interaction $=0.20+0.05-0.05=+0.20\%$.

**Reconcile:** $0.55+0.70+0.20=+1.45\%$ — khớp active đúng đến bp. Đọc ý nghĩa: đóng góp lớn nhất là selection (+0.70%), nghĩa PM này giỏi *chọn cổ* trong ngành; allocation (+0.55%) cũng dương nhưng nhỏ hơn; interaction +0.20% là phần thưởng cho việc *đặt tiền nặng đúng chỗ mình cũng chọn cổ giỏi* (Tech: vừa overweight vừa outperform). Interaction dương ở Tech là dấu hiệu tốt — các quyết định của bạn cộng hưởng chứ không đá nhau.

**Cạm bẫy interaction.** Nhiều nhà cung cấp (và không ít PM) *ghét* interaction vì khó giải thích cho nhà đầu tư, nên họ gộp nó vào selection: định nghĩa lại $\text{Selection}_i=w_i^P(r_i^P-r_i^B)$ (dùng $w_i^P$ thay $w_i^B$). Làm thế thì selection ở Tech thành $0.50\times 2.0=1.0\%$ — đã nuốt trọn 0.20% interaction (kiểm: $0.80+0.20=1.00$). Bản kê vẫn reconcile, nhưng bạn đã *gán* toàn bộ hiệu ứng tương tác cho stock-picking, thổi phồng năng lực chọn cổ. Không có đáp án "đúng" tuyệt đối — chỉ cần **nhất quán** và **khai báo quy ước**. Buy-side pod shop nghiêm túc giữ interaction tách riêng chính vì nó là tín hiệu: interaction lớn và dương nghĩa hai lớp quyết định của bạn ăn khớp; lớn và âm là cảnh báo bạn đang overweight đúng những ngành bạn chọn cổ *dở*.

Brinson mở rộng nhiều kỳ thì đụng ngay khó khăn compounding ở mục 20.7. Nhưng một kỳ, nó là nền vững: một đẳng thức, luôn khớp, không cần model.

## 20.3 Factor-based attribution — phân rã theo nguồn có tên

Brinson trả lời "ngành nào, cổ nào"; nó *không* trả lời "cược của tôi thực chất là cược vào cái gì". Một PM có thể outperform hoàn toàn vì danh mục vô tình nghiêng vào momentum đúng tháng momentum thắng — Brinson sẽ khen anh ta "selection giỏi", trong khi sự thật là anh ta chỉ cưỡi một factor công khai rẻ tiền. Để bắt được điều đó ta cần ống kính factor (chương 6): phân rã return danh mục thành **tổng các đóng góp factor** cộng một phần **alpha residual** — phần thật sự không giải thích được bằng các factor đã biết.

Mô hình chuẩn (cross-sectional Barra, chương 6): tại mỗi kỳ, return danh mục

$$r^P=\sum_{k}\beta_k f_k+\alpha,$$

với $\beta_k$ là exposure (loading) của danh mục lên factor $k$, $f_k$ là factor return kỳ đó (giá của rủi ro factor, đã ước lượng bằng cross-sectional regression), và $\alpha$ là residual — phần return còn lại sau khi đã trừ hết mọi thứ có tên. Đóng góp của factor $k$ là tích $\beta_k f_k$; đọc "danh mục nghiêng $\beta_k$ vào factor này, factor này tháng nay trả $f_k$, nên nó góp $\beta_k f_k$ vào return của tôi."

**Ví dụ số.** Một equity market-neutral book, return tháng $r^P=+12.0\%$ (giả định tháng đẹp để số tròn). Risk model cho exposures và tháng này factor returns như sau:

| Factor $k$ | Exposure $\beta_k$ | Factor return $f_k$ | Contribution $\beta_k f_k$ |
|---|---|---|---|
| Market | 0.20 | 15.0% | $0.20\times 15.0=3.00\%$ |
| Momentum (UMD) | 0.50 | 5.0% | $0.50\times 5.0=2.50\%$ |
| Value (HML) | 0.40 | 2.5% | $0.40\times 2.5=1.00\%$ |
| Quality | 0.30 | 3.0% | $0.30\times 3.0=0.90\%$ |
| Size | -0.20 | 2.0% | $-0.20\times 2.0=-0.40\%$ |
| **Tổng factor** | | | **$7.00\%$** |
| **Alpha residual** | | | **$5.00\%$** |
| **Tổng $r^P$** | | | **$12.00\%$** |

Reconcile: $3.00+2.50+1.00+0.90-0.40=7.00\%$ factor, cộng alpha $12.00-7.00=5.00\%$. Chú ý ta *suy ra* alpha bằng phép trừ — alpha là số dư, không phải số đo trực tiếp. Đây là điểm sống còn về mặt tư duy: **alpha của bạn chỉ tốt bằng danh sách factor bạn trừ đi**. Nếu risk model thiếu một factor mà danh mục vô tình nạp vào (ví dụ crowding, hay short-volatility), phần đó sẽ chảy nhầm vào alpha và bạn tự lừa mình.

Đọc bản kê: trong 12% ấy, chỉ 5% là alpha thật; 7% là bạn được factor trả. Riêng momentum góp 2.5% — nếu tín hiệu của bạn là chính cái momentum 12-1 công khai (rank-IC ~0.025, loading UMD ~0.9, alpha residual ~0 như running example ở chương 6), thì "alpha" tưởng có sẽ teo về gần 0 sau khi trừ UMD, và bạn không nên tính công cho mình vì nó. Ngược lại, một book mà alpha residual chiếm phần lớn return và *ổn định qua các tháng* mới là book có edge thật — đó là thứ nhà đầu tư trả phí 2-and-20 để mua, không phải beta factor họ mua được qua một ETF smart-beta rẻ hơn nhiều.

**Nối Brinson và factor.** Hai ống kính không mâu thuẫn — chúng nhìn cùng một P&L từ hai phía. Brinson phân theo *cấu trúc danh mục* (ngành, cổ), factor phân theo *nguồn rủi ro hệ thống*. Một PM lý tưởng có allocation/selection dương *và* alpha residual dương; một PM đáng ngờ có Brinson-selection dương nhưng factor cho thấy nó chỉ là momentum-loading. Chạy cả hai, đọc chéo, là cách bắt "closet factor betting" — cược factor trá hình alpha. Cụ thể với ví dụ trên: nếu Brinson của cùng book này khoe selection +0.70% mà factor cho thấy momentum một mình đã góp +2.50%, thì cái "tài chọn cổ" ấy phần lớn chỉ là cùng một momentum tilt nhìn từ góc holdings — hai bản kê đang mô tả *một* quyết định đội hai cái tên, và bạn không được tính công hai lần.

## 20.4 Risk attribution — MCTR và phân rã volatility

Return đã xảy ra là quá khứ; rủi ro là tương lai. Attribution không chỉ hỏi "tiền đến từ đâu" mà còn "rủi ro của tôi *đang* nằm ở đâu" — và câu này phải trả lời *trước* khi P&L xảy ra, vì nó là thứ bạn kiểm soát. Công cụ trung tâm là **marginal contribution to risk** (MCTR), thứ phân rã volatility danh mục $\sigma_P$ thành các đóng góp cộng-lại-đúng theo từng vị thế hoặc từng factor (chương 14 dùng nó cho risk budgeting; ở đây ta xem nó như một attribution ex-ante).

Volatility danh mục là $\sigma_P=\sqrt{w^\top\Sigma w}$ với $w$ trọng số, $\Sigma$ covariance. Điểm mấu chốt: $\sigma_P$ là hàm **bậc một thuần nhất** của $w$ (nhân đôi mọi vị thế thì vol nhân đôi), nên theo định lý Euler nó bằng đúng tổng các đạo hàm riêng nhân biến:

$$\sigma_P=\sum_i w_i\frac{\partial \sigma_P}{\partial w_i}.$$

Đạo hàm riêng chính là marginal contribution. Từ $\sigma_P=\sqrt{w^\top\Sigma w}$:

$$\frac{\partial \sigma_P}{\partial w_i}=\frac{(\Sigma w)_i}{\sqrt{w^\top\Sigma w}}=\frac{(\Sigma w)_i}{\sigma_P}.$$

Nên **contribution to risk** của vị thế $i$ là

$$\text{MCTR}_i=w_i\frac{(\Sigma w)_i}{\sigma_P},\qquad \sum_i \text{MCTR}_i=\frac{w^\top\Sigma w}{\sigma_P}=\frac{\sigma_P^2}{\sigma_P}=\sigma_P.$$

Đẹp và cộng đúng: tổng các MCTR bằng chính $\sigma_P$. Đây là điều Euler bảo đảm, và nó là lý do MCTR là *chuẩn công nghiệp* để nói "vị thế này chiếm bao nhiêu % rủi ro của tôi."

**Ví dụ số.** Hai vị thế, $w=(0.6,\,0.4)$. Vol $\sigma_1=20\%$, $\sigma_2=10\%$, tương quan $\rho=0.5$. Covariance:

$$\Sigma=\begin{pmatrix}0.04 & 0.01\\ 0.01 & 0.01\end{pmatrix},\quad \text{vì } \Sigma_{12}=\rho\sigma_1\sigma_2=0.5\times 0.20\times 0.10=0.01.$$

Vol danh mục: $w^\top\Sigma w = 0.6^2(0.04)+0.4^2(0.01)+2(0.6)(0.4)(0.01)=0.0144+0.0016+0.0048=0.0208$. Nên $\sigma_P=\sqrt{0.0208}=0.1442=14.42\%$.

$(\Sigma w)_1 = 0.04(0.6)+0.01(0.4)=0.024+0.004=0.028$. $(\Sigma w)_2=0.01(0.6)+0.01(0.4)=0.006+0.004=0.010$.

$\text{MCTR}_1 = 0.6\times 0.028/0.1442 = 0.0168/0.1442 = 0.1165=11.65\%$. $\text{MCTR}_2=0.4\times 0.010/0.1442=0.004/0.1442=0.0277=2.77\%$.

**Reconcile:** $11.65\%+2.77\%=14.42\%=\sigma_P$. Khớp. Đọc: vị thế 1 chiếm $11.65/14.42=80.8\%$ *rủi ro* dù chỉ chiếm 60% *vốn*. Rủi ro tập trung nặng hơn vốn — vì vị thế 1 vol gấp đôi. Đây là bài học kinh điển: **weight ≠ risk**. Một PM tưởng mình đã "diversify 60/40" thực ra đang all-in vào một cái. Risk parity (chương 5, 14) chính là cân lại để MCTR đều nhau, không phải để vốn đều nhau.

**Phân rã theo factor — làm đầy đủ bằng số.** Trong risk model ta thay $\Sigma=B\Sigma_f B^\top+D$ (loadings $B$, factor covariance $\Sigma_f$, idio $D$ — chương 6). Cùng logic Euler cho ta tách $\sigma_P^2$ thành phần *factor risk* và phần *specific risk*, rồi trong factor risk lại tách theo từng factor. Thay vì khẳng định suông một cặp số, ta dựng một book cụ thể để thấy nó ra thế nào. Một equity market-neutral book có loading factor $b=(\beta_{\text{mom}},\beta_{\text{val}})=(0.50,\,0.30)$; factor vol năm $\sigma_{\text{mom}}=12\%$, $\sigma_{\text{val}}=9\%$, tương quan hai factor $\rho_f=0.20$; specific vol năm $\sigma_{\text{spec}}=4.7\%$. Factor covariance:

$$\Sigma_f=\begin{pmatrix}0.12^2 & 0.20(0.12)(0.09)\\ 0.20(0.12)(0.09) & 0.09^2\end{pmatrix}=\begin{pmatrix}0.0144 & 0.002160\\ 0.002160 & 0.0081\end{pmatrix}.$$

Factor variance của book: $b^\top\Sigma_f b = 0.50^2(0.0144)+0.30^2(0.0081)+2(0.50)(0.30)(0.002160)=0.0036+0.000729+0.000648=0.004977$. Vậy factor vol $=\sqrt{0.004977}=7.05\%$. Specific variance $=0.047^2=0.002209$, specific vol $=4.70\%$. Tổng variance $=0.004977+0.002209=0.007186$, tổng vol $=\sqrt{0.007186}=8.48\%$. Kiểm bằng Pythagoras: factor và idio trực giao nên $\sqrt{7.05^2+4.70^2}=\sqrt{49.7+22.1}=\sqrt{71.8}=8.48\%$ — khớp. Đọc: book "target" quanh 8.5% vol năm thì $7.05\%$ đến từ **factor exposures** (momentum một mình đóng $0.50^2\times 0.0144/0.007186=50.1\%$ *variance*) và chỉ $4.70\%$ từ **idio** — nói rằng phần lớn *rủi ro* của bạn KHÔNG phải cái stock-specific bet bạn nghĩ mình đang chơi, mà là factor tilt bạn không chủ ý.

Risk attribution ex-ante và return attribution ex-post phải kể *cùng một câu chuyện*: nếu risk nói "bạn nặng momentum" (như factor risk trên) mà return-attribution lại gán mọi thứ cho alpha, một trong hai đang nói dối. Book vừa dựng ở đây chính là book market-neutral ở mục 20.3 — và quả nhiên nó nạp momentum nặng cả về return (contribution +2.50%) lẫn risk (50% variance); hai ống kính đồng thanh, đó là dấu hiệu attribution đáng tin.

## 20.5 P&L explain buy-side — mổ một ngày

Ba mục trên nhìn theo tháng/kỳ. Nhưng bàn trading sống theo **ngày**, và "P&L explain" (hay "P&L attribution", "P&L decomp") hằng ngày là nghiệp vụ mà mọi middle-office và mọi PM pod đều chạy trước khi đi ngủ. Câu hỏi: hôm nay lãi/lỗ $X$ đô, tách ra thì $X$ đến từ *market move* trên vị thế đang giữ, từ *alpha* (vị thế tự outperform ngoài beta), từ *financing* (chi phí vay/lãi ký quỹ), từ *execution/slippage* (giá thực hiện lệch giá tham chiếu), và từ *fees*. Nếu tổng các mảnh không bằng P&L thực tế trong sổ, có một *unexplained* — và unexplained lớn là báo động đỏ: hoặc model sai, hoặc có lệnh/booking lỗi, hoặc có cái gì đó bạn chưa hiểu về vị thế của mình.

**Ví dụ số — một ngày của một book long/short.** Book gross \$100M (long \$60M, short \$40M), net long \$20M. Hôm nay:

- **Market/beta P&L**: net exposure \$20M, beta danh mục 0.3 lên thị trường, thị trường +0.80%. $\Rightarrow 20\text{M}\times 0.3\times 0.0080 = +\$48{,}000$. Đây là phần bạn kiếm chỉ vì *có mặt* trên thị trường một ngày thị trường lên.
- **Alpha/idio P&L**: long leg outperform beta-adjusted +0.25%, short leg (bạn short) underperform beta-adjusted -0.15% → cả hai đều có lợi. Long: $60\text{M}\times 0.0025=+\$150{,}000$. Short: short cổ giảm tương đối, lãi $40\text{M}\times 0.0015=+\$60{,}000$. $\Rightarrow$ alpha $=+\$210{,}000$. Đây là dòng bạn *muốn* thấy — tiền từ selection thật, không từ beta.
- **Financing P&L**: short \$40M sinh rebate/borrow cost; giả sử net financing (borrow fee trên short leg + lãi margin trên long) $= -3\text{bps}$/ngày trên gross vay \$80M $\Rightarrow -80\text{M}\times 0.0003=-\$24{,}000$. Financing gần như luôn âm với book leverage cao và là chỗ alpha rò rỉ âm thầm.
- **Execution/slippage**: hôm nay trade \$8M notional để rebalance; slippage thực đo được 6bps so với arrival price $\Rightarrow -8\text{M}\times 0.0006=-\$4{,}800$. (Chương 13 dạy đo cái này bằng implementation shortfall; ở đây nó là một *dòng P&L có tên*, không phải chi phí ẩn.)
- **Fees/commissions**: $-\$1{,}200$.

Tổng explained: $48{,}000+210{,}000-24{,}000-4{,}800-1{,}200=+\$228{,}000$.

Giả sử P&L thực trong sổ (mark-to-market cuối ngày) là $+\$230{,}000$. **Unexplained $=230{,}000-228{,}000=+\$2{,}000$** ($\approx 0.87\%$ của P&L, hay 0.2bps trên gross). Nhỏ, chấp nhận được — thường do FX rounding, dividend accrual, hoặc mark timing. Nếu unexplained là $+\$50{,}000$ (22% của P&L), bạn *dừng lại và điều tra* trước khi tin bất kỳ con số nào: có thể một vị thế bị book sai giá, một corporate action chưa xử lý, hay một greek chưa hedge nếu book có options.

Đọc bản kê một ngày này như một bác sĩ đọc phim: alpha \$210k dương và *lớn hơn* market \$48k — dấu hiệu tốt, tiền chủ yếu từ skill không từ beta. Financing -\$24k đều đặn ăn mòn; nếu nó lặp lại mỗi ngày, $\$24\text{k}\times 250\approx\$6\text{M}$/năm — một khoản khổng lồ mà nhiều PM mới bỏ quên khi tính Sharpe backtest (chương 9 gọi đây là một trong những khoảng cách backtest-vs-live). Cộng dồn P&L explain hằng ngày qua tháng, bạn có một *bức tranh nguồn gốc* mượt hơn nhiều so với chỉ nhìn con số cuối tháng — và nó là dữ liệu đầu vào để trả lời câu hỏi cuối: có thật không.

**Khi book không chỉ là cổ phiếu — carry, roll, price, convexity.** Bản kê năm-dòng ở trên là bộ khung cho một equity book. Nhưng ngay khi vị thế của bạn có *đường cong* hay *lồi* — trái phiếu, FX carry, rates RV (chương 18), hay options (chương 19) — P&L explain phải mọc thêm dòng, vì một cú dịch giá không còn tuyến tính theo yếu tố rủi ro. Với một fixed-income / carry book, chuẩn mực là tách:

$$\text{P\&L} = \underbrace{\text{carry}}_{\text{accrual}} + \underbrace{\text{roll-down}}_{\text{trượt trên curve}} + \underbrace{\text{price (duration)}}_{-D\cdot\Delta y} + \underbrace{\text{convexity}}_{\frac12 C(\Delta y)^2} + \text{residual}.$$

Ví dụ số cho một vị thế trái phiếu 10Y, notional \$50M, modified duration $D=8.0$, convexity $C=75$, coupon/yield $y=4.0\%$, trong một ngày yield giảm $\Delta y=-10\,\text{bp}$ và curve roll đem lại tương đương $+2\,\text{bp}$ lợi giá:

- **Carry** (accrual một ngày): $50\text{M}\times 0.040\times \tfrac{1}{252}=+\$7{,}937$. Tiền bạn kiếm chỉ vì *nắm giữ*, chưa cần giá nhúc nhích.
- **Roll-down**: $50\text{M}\times 8.0\times 0.0002=+\$80{,}000$. Trái phiếu "trẻ lại" trượt xuống curve dốc.
- **Price (duration)**: $-50\text{M}\times 8.0\times(-0.0010)=+\$400{,}000$. Cú lớn nhất — yield giảm, giá lên.
- **Convexity**: $\tfrac12\times 50\text{M}\times 75\times(0.0010)^2=+\$1{,}875$. Số hạng bậc hai — nhỏ hôm nay nhưng chính là thứ cứu bạn (hoặc giết bạn) khi $\Delta y$ lớn: ở cú dịch $100\,\text{bp}$ nó phình lên $\tfrac12\times 50\text{M}\times 75\times 0.01^2=\$187{,}500$.

Tổng explained $=7{,}937+80{,}000+400{,}000+1{,}875=+\$489{,}812$. Cái đẹp của cách tách này là nó *phân biệt* được nguồn: nếu ngày mai yield đứng yên mà book vẫn lãi, đó là carry+roll (bền, lặp lại); nếu nó lãi vì $\Delta y$ chạy, đó là price (may rủi thị trường, không lặp). Một carry trader nhìn dòng carry+roll để biết edge cấu trúc của mình, và nhìn dòng convexity để biết mình đang short hay long gamma — hệt như một options PM tách theo delta/gamma/theta/vega (chương 19; và xem cuốn Q-world cho variance risk premium và dealer gamma, nơi P&L explain của một vol book chính là bản kê greeks). Nguyên tắc bất biến: mỗi yếu tố rủi ro *có tên* được một dòng, phần dư *đo được* là unexplained, và unexplained lớn nghĩa bạn thiếu một greek hoặc book sai một mark.

## 20.6 Đánh giá thống kê — alpha này có phân biệt được với may mắn không

Mọi con số alpha ở trên là *điểm ước lượng* trên một mẫu hữu hạn, nên câu hỏi sống còn — câu mà chương 9 đã gieo và ở đây ta thu hoạch — là: **cái +5% alpha residual, hay +0.7% active return, có phân biệt được với 0 không?** Nếu không, bạn đang thưởng cho may mắn và sẽ phân bổ vốn sai.

**Information ratio** là tỷ số đầu tiên. $IR=\text{active return trung bình}/\text{tracking error}$, tức Sharpe của *active* return (chương 5). Với chuỗi active $A_t$: $IR=\bar A/\sigma_A$ (annualized). Đây cũng là mẫu số của Fundamental Law (chương 5, 7): $IR=IC\cdot\sqrt{BR}$ — một book breadth cao với IC khiêm tốn vẫn ra IR đẹp. Nối vào running example xuyên sách: một tín hiệu $IC=0.05$ chơi trên $BR=256$ cược độc lập/năm cho $IR=0.05\times\sqrt{256}=0.05\times 16=0.80$ — đúng ngưỡng "tốt" của một pod, và cũng là con số ta đem đi kiểm định ngay dưới đây.

**t-stat của alpha** biến IR thành phát biểu về ý nghĩa thống kê. Với $T$ kỳ độc lập, quan hệ then chốt:

$$t_\alpha = IR\times\sqrt{T}\quad(\text{IR và } T \text{ cùng tần suất năm}).$$

Dẫn xuất: $\bar A$ có sai số chuẩn $\sigma_A/\sqrt{T}$, nên $t=\bar A/(\sigma_A/\sqrt{T})=(\bar A/\sigma_A)\sqrt{T}=IR\sqrt{T}$.

**Ví dụ số.** Book có $IR=0.8$ (một pod shop coi 0.7–1.0 là tốt), chạy $T=3$ năm. $t_\alpha=0.8\times\sqrt{3}=0.8\times 1.732=1.39$. So chuẩn $t>2$: **1.39 chưa đủ** — alpha này *chưa* phân biệt được với may mắn ở mức tin cậy thường dùng, dù IR nghe hấp dẫn. Cần bao nhiêu năm để $t=2$? $\sqrt{T}=2/0.8=2.5\Rightarrow T=6.25$ năm. Đây là sự thật phũ phàng buy-side: một IR 0.8 *cần hơn 6 năm* live mới đủ bằng chứng thống kê — và đó là lý do track record ngắn gần như vô giá trị để phân biệt skill với luck, dù nó lấp lánh đến đâu. Lật ngược lại cũng đau không kém: muốn kết luận trong đúng $T=3$ năm ($t=2$) thì cần $IR=2/\sqrt{3}=1.15$ — một mức mà rất ít book đơn lẻ chạm tới, giải thích vì sao pod shop gộp hàng chục strategy uncorrelated để nâng IR tổng hợp thay vì chờ một cái sáng đủ nhanh.

**Deflated Sharpe / deflated alpha** (chương 9) là lớp phòng thủ cuối, chống **multiple testing**. Nếu con số alpha bạn khoe là *cái tốt nhất* trong $N$ cấu hình bạn đã thử, thì ngưỡng phải cao hơn — vì thử nhiều thì cái tốt nhất trông đẹp *do noise*. Ngưỡng Sharpe kỳ vọng của trò may rủi thuần túy khi thử $N$ lần trong $T$ năm:

$$SR_0=\sqrt{\frac{2\ln N}{T}}.$$

Với running example của chương 9: thử $N=1000$ cấu hình trên $T=10$ năm $\Rightarrow SR_0=\sqrt{2\ln 1000/10}=\sqrt{2\times 6.908/10}=\sqrt{1.382}=1.18$. Nghĩa: kể cả khi *không có edge nào*, cái tốt nhất trong 1000 thử nghiệm sẽ có Sharpe kỳ vọng ~1.18 chỉ vì may. Nên nếu attribution của bạn khoe alpha ứng với Sharpe 1.2 — deflated về gần 50% xác suất là đồ giả. Áp thẳng vào attribution: một selection effect hay factor-alpha *chọn ra* từ nhiều biến thể phải bị deflate y hệt, nếu không bạn đang attribution cho noise và gọi nó là skill. Đây là chỗ attribution gặp overfitting: **đừng attribution một con số bạn đã data-snoop để tìm ra.**

## 20.7 Gotchas — nơi decomposition phản bội bạn

Attribution trông như số học sạch sẽ, nhưng nó đầy bẫy, và mọi bẫy đều bắt nguồn từ một sự thật: **thế giới không cộng tuyến tính, còn bản kê thì muốn cộng tuyến tính.** Bốn cái bẫy đáng máu nhất:

**(1) Không cộng tuyến tính qua nhiều kỳ (linking/compounding).** Một kỳ, Brinson cộng đúng đến bp. Nhưng ghép $Q$ kỳ, return *nhân*: $(1+r_1)(1+r_2)\cdots$, không cộng. Nên $\sum_t A_t \neq$ active return tích lũy đúng, và tổng $\sum_t \text{Allocation}_t$ cũng lệch. Đây là chỗ chương cũ hay vẫy tay — ta làm bằng số cho hết mơ hồ. Lấy hai kỳ, danh mục return $r^P=(10\%,\,5\%)$, benchmark $r^B=(8\%,\,4\%)$. Active từng kỳ là $+2\%$ và $+1\%$, **cộng số học ra $+3.00\%$**. Nhưng active *tích lũy đúng* là hiệu hai return compound: $r^P_{\text{cum}}=(1.10)(1.05)-1=15.50\%$, $r^B_{\text{cum}}=(1.08)(1.04)-1=12.32\%$, nên active tích lũy $=15.50-12.32=+3.18\%$. Chênh $+3.18-3.00=+0.18\%$ là **linking residual** — một cross-term bậc hai không thuộc kỳ nào (return kỳ 2 được khuếch đại bởi vốn đã tăng từ kỳ 1).

Giải pháp công nghiệp là các thuật toán smoothing — **Carino, Menchero, GRAP** — san residual ngược vào từng kỳ theo một hệ số scaling sao cho tổng khớp *và* mỗi kỳ vẫn diễn giải được. Cụ thể Carino: định nghĩa hệ số log-linking cho mỗi kỳ $k_t=\dfrac{\ln(1+r^P_t)-\ln(1+r^B_t)}{r^P_t-r^B_t}$ và hệ số tổng $k=\dfrac{\ln(1+R^P)-\ln(1+R^B)}{R^P-R^B}$; rồi active mỗi kỳ được scale thành $(k_t/k)\,A_t$. Với số trên: $k=0.8779$, $k_1=0.9175$, $k_2=0.9569$; active đã scale là $\tfrac{0.9175}{0.8779}(2\%)=2.09\%$ và $\tfrac{0.9569}{0.8779}(1\%)=1.09\%$, **tổng $=3.18\%$** — khớp active tích lũy đúng đến bp, mà mỗi kỳ vẫn giữ diễn giải riêng. Điểm cần nhớ không phải thuộc lòng công thức Carino mà là: **đừng bao giờ cộng số học attribution qua nhiều kỳ và tin nó khớp** — nó lệch, phần lệch có tên, và có thuật toán chuẩn để san.

**(2) Interaction/cross terms bị nuốt.** Như mục 20.2: gộp interaction vào selection thổi phồng stock-picking. Tổng quát hơn, mọi decomposition của một tích thành các thành phần đều đẻ ra cross-term, và *quyết định cross-term thuộc về ai là một lựa chọn, không phải một sự thật*. Nhất quán và khai báo — đừng lặng lẽ gán để bảng đẹp hơn.

**(3) Timing effect — trọng số trong kỳ không đứng yên.** Brinson một kỳ giả định $w_i^P$ cố định suốt kỳ. Thực tế bạn trade *trong* kỳ; nếu bạn tăng Tech đúng lúc Tech bắt đầu chạy, có một **timing/trading effect** mà attribution "buy-and-hold" (dùng trọng số đầu kỳ) không bắt được — nó chảy nhầm vào unexplained hoặc bị gán sai cho selection. Ví dụ: bạn vào Tech ngày 15 với return nửa cuối kỳ +5%, nhưng attribution dùng $w^P$ đầu kỳ (khi bạn chưa có Tech) sẽ *bỏ sót* +5% ấy hoặc gán nó lung tung. Giải pháp: attribution tần suất cao hơn (daily linking) để "đóng băng" trọng số trong từng ngày rồi link lại — chính là lý do P&L explain *hằng ngày* (mục 20.5) chuẩn hơn attribution *hằng tháng*: nó cắt kỳ đủ nhỏ để timing effect không kịp làm nhiễu, và đồng thời làm linking residual nhỏ đi (residual bậc hai co theo bình phương độ dài kỳ).

**(4) Chọn sai benchmark.** Toàn bộ Brinson đo *so với benchmark*; một benchmark sai làm mọi effect vô nghĩa. Kinh điển: một book small-cap value đo so với S&P 500 (large-cap) sẽ ra "allocation effect" khổng lồ chỉ vì hai vũ trụ khác nhau — không phản ánh skill mà phản ánh *sai lệch định nghĩa*. Benchmark phải là **investable, phản ánh đúng vũ trụ và style** của danh mục; nếu không, cái +0.7% active bạn khoe có thể chỉ là size/style premium mà một benchmark đúng đã hấp thụ. Đây là mặt Brinson của cùng cạm bẫy mà factor-attribution bắt qua "thiếu factor": cả hai đều là câu chuyện *bạn đang so với cái nền sai*.

Một gotcha bao trùm, đã gặp ở mục 20.6: **đừng attribution cái bạn đã data-snoop.** Nếu con số alpha là kết quả của việc thử-và-chọn, thì mọi decomposition đẹp đẽ của nó chỉ là mô tả chi tiết của một ảo ảnh. Attribution mô tả *đã xảy ra gì*; nó không chứng minh *sẽ lặp lại*. Chỉ khi t-stat qua ải (mục 20.6, đã deflate) thì bản kê nguồn gốc mới đáng để cấp thêm vốn.

## 20.8 Ghép lại — một quy trình attribution buy-side hoàn chỉnh

Gộp bốn ống kính và lớp thống kê thành một recipe làm-lại-được, đây là những gì một pod nghiêm túc chạy mỗi kỳ. **Một**, chạy P&L explain *hằng ngày* (mục 20.5): tách market/alpha/financing/execution/fees — cộng thêm carry/roll/convexity nếu book có đường cong hay lồi — reconcile với sổ đến unexplained nhỏ; unexplained lớn là dừng-và-điều-tra trước mọi thứ khác. **Hai**, cuối kỳ chạy Brinson (mục 20.2) trên holdings để trả lời allocation-vs-selection-vs-interaction, giữ interaction tách riêng, dùng daily linking + Carino để né timing effect và linking residual (mục 20.7). **Ba**, chạy factor attribution (mục 20.3) song song để tách return thành factor-contributions cộng alpha residual — đọc chéo với Brinson để bắt closet factor betting. **Bốn**, chạy risk attribution ex-ante bằng MCTR (mục 20.4) và kiểm rằng câu chuyện rủi ro khớp câu chuyện return: nếu risk nói "nặng momentum" thì return-attribution phải thấy momentum, không được giấu vào alpha. **Năm**, và cuối cùng, đặt mọi con số alpha qua tòa án thống kê (mục 20.6): $t_\alpha=IR\sqrt T$, deflate cho multiple testing bằng $SR_0=\sqrt{2\ln N/T}$, và chỉ tin phần alpha sống sót.

Sợi chỉ đỏ xuyên cả năm bước là một kỷ luật duy nhất: **mỗi đồng phải reconcile về một nguồn có tên, và mọi phần dư phải có tên riêng chứ không bị quét xuống thảm.** Brinson reconcile đến bp vì nó là đẳng thức; factor reconcile vì alpha là số dư định nghĩa; MCTR reconcile vì Euler; P&L explain reconcile đến một unexplained *đo được*; multi-period reconcile nhờ Carino san đúng linking residual. Attribution không phải là kể một câu chuyện đẹp về vì sao bạn thắng — nó là một bài kiểm toán lạnh lùng buộc câu chuyện phải cộng cho khớp, và buộc bạn thừa nhận phần bạn không giải thích được. Chính chỗ "không giải thích được" — unexplained trong P&L, alpha residual sau khi trừ factor, phần vượt t-stat sau khi deflate — mới là nơi cất giữ hai thứ đắt nhất của nghề: edge thật, và những lỗ hổng chưa thấy sẽ giết bạn nếu không tìm ra. Đo và phân rã P&L, xét cho cùng, là cách một quỹ tự soi gương và hỏi câu khó nhất: *tiền này có thật là của tôi không, và tôi có hiểu vì sao nó đến không.*

# Chương 21: Industry — văn hóa, career, tech stack

Mọi thứ trước chương này là công cụ: cách đo return, dựng factor, backtest có kỷ luật, xây danh mục, quản trị rủi ro. Chương này nói về nơi bạn sẽ dùng những công cụ đó — một ngành công nghiệp có cấu trúc kinh tế rất đặc thù quyết định văn hóa làm việc, cách trả lương, tech stack, và cả loại người sống sót được trong đó. Hiểu sai cấu trúc này là lý do nhiều người giỏi toán vào nghề rồi vỡ mộng sau mười tám tháng. Vì sao một pod shop cắt bạn khi drawdown chạm 5% nhưng RenTec giữ người hàng chục năm? Vì sao một QR mới ra trường ở quỹ top nhận 300k trong khi một PhD tương đương ở fintech nhận 180k? Vì sao polars đang giết pandas nhưng kdb+ vẫn sống sau hai mươi năm? Tất cả đều suy ra được từ một điều duy nhất: ai trả tiền cho cái gì, và vì sao. Chương này không kể giai thoại; nó dựng lại từng cơ chế kinh tế đó bằng số, để bạn nhìn ngành như nhìn một mô hình chứ như nghe đồn.

## 21.1 Hai mô hình văn hóa: mercenary vs collaborative

Toàn bộ buy-side định lượng phân cực về hai kiến trúc tổ chức. Chúng không phải hai điểm trên một trục — chúng là hai lời giải khác nhau cho cùng một bài toán: *làm sao biến tài năng nghiên cứu thành P&L ổn định mà không bị chính tài năng đó tống tiền hoặc bỏ đi mang theo alpha.* Hai lời giải trái ngược đến mức chúng tuyển hai loại người khác nhau, viết code theo hai triết lý khác nhau, và vẽ ra hai đường cong sự nghiệp khác nhau. Không có mô hình nào "đúng" hơn; mỗi mô hình tối ưu cho một ràng buộc khác nhau, và chọn nhầm nơi là chọn nhầm cả cách sống mười năm tới.

### 21.1.1 Pod shop — kiến trúc "mercenary"

Trong **pod shop** (Millennium, Citadel, Point72, Balyasny, ExodusPoint, Schonfeld), đơn vị nguyên tử là **pod**: một Portfolio Manager (PM) cùng một nhóm nhỏ QR/QD, được cấp một lượng vốn (book) và một hạn mức rủi ro. PM tự chủ hoàn toàn chiến lược trong hạn mức đó, và ăn chia P&L theo một payout thường 10–20%. Tri thức **không** chảy giữa các pod — pod A không biết pod B đang chạy tín hiệu gì, và đó là thiết kế có chủ đích, không phải tai nạn: cô lập tín hiệu ngăn một QR nghỉ việc bê cả cỗ máy đi, đồng thời buộc mỗi pod phải tự đứng được trên chân mình.

Hãy làm rõ cơ chế bằng số, vì chính con số mới cho thấy vì sao văn hóa "mercenary" là hệ quả tất yếu chứ không phải lựa chọn đạo đức. Giả sử một PM equity market-neutral được cấp book \$500M với đòn bẩy gross cho phép 6×, tức \$3B gross exposure. Firm áp một **stop-loss cứng**: nếu pod mất 5% NAV trên vốn cấp, tức \$25M, pod bị cắt phần lớn hoặc toàn bộ vốn (de-risk hoặc đóng). Payout của PM là 18% trên P&L net.

Nếu pod chạy chiến lược Sharpe 1.5 trên \$3B gross với target vol 8%/năm tính trên vốn cấp \$500M, ba con số đầu ra thẳng từ định nghĩa:

- Vol tiền tuyệt đối: $0.08 \times \$500\text{M} = \$40\text{M}$/năm.
- Return kỳ vọng: $\mu = SR \times \text{vol} = 1.5 \times \$40\text{M} = \$60\text{M}$/năm gross P&L.
- Payout PM một năm trung vị: $0.18 \times \$60\text{M} = \$10.8\text{M}$.

Đó là mặt sáng, và nó lý giải vì sao PM giỏi được săn đón dữ dội. Mặt tối nằm ở phân phối, và đây là chỗ hầu hết người ngoài nhìn sai. Nếu chỉ xét P&L cuối năm $\sim \mathcal{N}(\$60\text{M}, \$40\text{M})$, xác suất kết thúc năm lỗ quá \$25M là $\Phi\!\left(\frac{-25-60}{40}\right) = \Phi(-2.125) \approx 1.7\%$ — nghe rất an toàn. Nhưng stop **không đợi đến cuối năm**; nó là **path-dependent**, chạm là chết ngay giữa đường. Xác suất một Brownian motion có drift chạm mức $-\$25M$ *tại một thời điểm bất kỳ* trong năm cao hơn nhiều lần xác suất kết thúc năm dưới mức đó, vì quỹ đạo có thể thủng rào rồi bật lên. Với drift $\mu=\$60M$/năm và $\sigma=\$40M$/năm, công thức chạm rào (first-passage) của Brownian motion cho xác suất chạm $-b$ trước thời điểm $T=1$:

$$P(\text{hit } -b \text{ trước } T) \approx \Phi\!\left(\frac{-b-\mu T}{\sigma\sqrt T}\right) + e^{-2\mu b/\sigma^2}\,\Phi\!\left(\frac{-b+\mu T}{\sigma\sqrt T}\right).$$

Thế số từng bước với $b=25$. Số hạng một: $\Phi\!\left(\frac{-25-60}{40}\right) = \Phi(-2.125) = 0.0168$. Số hạng hai gồm hệ số mũ $e^{-2\cdot 60\cdot 25/40^2} = e^{-3000/1600} = e^{-1.875} = 0.1534$ nhân $\Phi\!\left(\frac{-25+60}{40}\right) = \Phi(0.875) = 0.8092$, cho $0.1534 \times 0.8092 = 0.1241$. Tổng $\approx 0.0168 + 0.1241 = 0.1409$, tức **~14% khả năng chạm stop trong năm** ngay cả với một chiến lược Sharpe 1.5 *thật*. Con đường (path) làm rủi ro nghề nghiệp phình lên gấp tám lần so với con số cuối-năm 1.7% mà trực giác ngây thơ đưa ra.

Đó là lý do các nghiên cứu ngành ước tính khoảng 15–30% PM pod bị đào thải mỗi năm, và tuổi thọ trung vị của một PM ở pod shop chỉ vài năm. Payout hào phóng 18% chính là **phí bảo hiểm cho rủi ro nghề nghiệp cực cao này** — firm sẵn sàng chia đậm vì biết cấu trúc stop sẽ tự động thải những PM kém may mà không tốn chi phí sa thải. Văn hóa nảy sinh trực tiếp từ cấu trúc: tốc độ học khủng khiếp (bạn cầm P&L thật ngay ngày đầu), áp lực cực cao, chủ nghĩa cá nhân "mercenary" — bạn được thuê để tạo alpha, không phải để nuôi văn hóa. Hợp với người muốn cầm P&L riêng sớm và chịu được rằng một năm tệ có thể kết thúc sự nghiệp ở firm đó. Không hợp với người muốn xây thứ gì đó dài hạn hay dựa vào đồng đội.

### 21.1.2 Collaborative/centralized — kiến trúc "one machine"

Đối cực là mô hình **collaborative/centralized** (RenTec, Two Sigma, DE Shaw, và Jane Street ở phần market-making định lượng của họ). Ở đây không có pod cô lập. Mọi người đóng góp tín hiệu, dữ liệu, hạ tầng vào **một cỗ máy chung**; một risk/allocation layer trung tâm tổng hợp tất cả thành một danh mục firm-wide duy nhất. Lương gồm base + bonus theo **firm performance**, không theo P&L cá nhân của bạn. Tri thức tích lũy trong codebase chung suốt hàng chục năm — và đó là **moat sâu nhất trong ngành**.

Vì sao moat sâu hơn? Có hai lý do, và cả hai đều định lượng được. Thứ nhất là **diversification của tín hiệu**, nhưng phải nói cho đúng vì đây là chỗ dễ tô hồng. Nhớ lại Fundamental Law of Active Management: $IR = IC \times \sqrt{BR}$, với $BR$ là số cược *độc lập* trong năm. Một pod đơn lẻ có thể có $N=50$ tín hiệu; một cỗ máy trung tâm gộp đóng góp của 200 nhà nghiên cứu có thể có $N=5000$ tín hiệu. Nếu ta ngây thơ lấy $BR=N$, IR scale theo $\sqrt{5000}/\sqrt{50} = \sqrt{100} = 10\times$ — nghe như một phép màu. Nhưng tín hiệu thật **không độc lập**; chúng tương quan chéo. Với $N$ tín hiệu cùng độ mạnh và tương quan cặp trung bình $\rho$, breadth hiệu dụng chỉ là

$$BR_{\text{eff}} = \frac{N}{1 + (N-1)\rho}.$$

Đây là chỗ toán học trở nên tàn nhẫn và trung thực. Nếu $\rho = 0.1$ (mức tương quan chéo khá điển hình cho các tín hiệu equity cùng vũ trụ), thì pod 50 tín hiệu có $BR_{\text{eff}} = 50/(1+49\cdot 0.1) = 8.5$, còn cỗ máy 5000 tín hiệu có $BR_{\text{eff}} = 5000/(1+4999\cdot 0.1) \approx 10.0$. Breadth **bão hòa**: dồn thêm tín hiệu tương quan gần như không mua thêm được gì, và lợi thế IR thu về chỉ còn $\sqrt{10.0/8.5} \approx 1.09\times$, không phải $10\times$. Bài học thật — và là moat thật — không nằm ở *số lượng* tín hiệu mà ở *khả năng hạ $\rho$*: một tổ chức nghiên cứu lớn có thể tìm ra những tín hiệu gần-độc-lập (alt-data mới, asset class mới, horizon mới) mà một pod cô lập không đủ nguồn lực chạm tới. Nếu cỗ máy lớn đẩy $\rho$ xuống $0.02$ thay vì $0.1$, thì $BR_{\text{eff}} = 5000/(1+4999\cdot 0.02) \approx 49.5$, và lợi thế IR bật lên $\sqrt{49.5/8.5} \approx 2.4\times$. Chính cuộc chiến hạ $\rho$ — chứ không phải cuộc đua tăng $N$ — là toán học đằng sau Sharpe huyền thoại của Medallion (được cho là hai chữ số sau phí ở nội bộ): không phải một alpha thần thánh mà là hàng nghìn edge nhỏ *gần độc lập* được gộp trên một cỗ máy execution rẻ.

Thứ hai là **retention**. Vì payout gắn với firm chứ không cá nhân, và vì code bạn viết thuộc về cỗ máy chung, một nhà nghiên cứu rời đi không thể mang theo "chiến lược của mình" — nó không tồn tại độc lập với hạ tầng chung, giống như không thể rút một sợi chỉ ra khỏi tấm vải mà vẫn giữ được hình dệt. Điều này giảm mạnh rủi ro tống tiền và turnover, cho phép firm đầu tư nghiên cứu dài hơi mà pod shop không dám: một dự án alpha ba năm không thể sống trong một pod có 14% xác suất bị cắt ngay trong mười hai tháng đầu (đúng con số first-passage ở mục trước).

Đánh đổi: bạn không cầm P&L riêng, không có đường tắt thành "PM 10 triệu đô một năm" ở tuổi 30. Đường lên chậm hơn nhưng bền hơn, và trần trên (nếu firm cực tốt) có thể còn cao hơn vì bạn ăn phần của một cỗ máy compounding hàng chục năm chứ không phải một book cô lập có thể bay trong một drawdown. Hợp với người thích engineering sâu, nghiên cứu dài hơi, và ổn định.

### 21.1.3 Bảng so sánh và các mô hình lai

| Chiều | Pod shop (mercenary) | Collaborative (one machine) |
|---|---|---|
| Đơn vị | Pod (PM + team nhỏ) | Firm-wide central book |
| Payout | 10–20% P&L pod | Base + bonus theo firm |
| Chia sẻ tri thức | Không (cố ý cô lập) | Tối đa (codebase chung) |
| Risk | Stop cứng, cắt nhanh | Risk trung tâm, dài hơi |
| Turnover | Cao (15–30%/năm PM) | Thấp |
| Moat | Tốc độ, capital allocation | Compounding tri thức, breadth độc lập |
| Hợp với | Người muốn P&L riêng sớm | Người thích engineering/research dài |
| Ví dụ | Millennium, Citadel, Point72 | RenTec, Two Sigma, DE Shaw |

Thực tế nhiều firm là **lai**. Citadel có cả pod (Global Equities, Global Fixed Income) lẫn các nhóm centralized (Citadel Securities market-making là một cỗ máy chung). Two Sigma phần lớn centralized nhưng có sleeves độc lập. Jane Street là market-making tập trung nhưng payout rất phẳng và văn hóa collaborative cực mạnh. Khi phỏng vấn, câu hỏi đầu tiên nên tự trả lời không phải "firm này có tên tuổi không" mà "kiến trúc kinh tế của nó là gì, và tôi hợp với ai trả tiền cho cái gì trong đó." Trả lời được câu đó, bạn đã lọc được nửa số quyết định sự nghiệp sai lầm.

## 21.2 Lương thưởng — cấu trúc, con số 2026, và phân phối lệch

Con số dưới đây là mặt bằng Mỹ (2024–2026) dùng để **định cỡ**, không phải lời hứa; chúng thay đổi theo chu kỳ và theo firm. Điều quan trọng hơn con số là **cấu trúc phân phối**, vì đó mới là thứ quyết định bạn nên kỳ vọng gì và vì sao hai người cùng xuất phát điểm có thể kết thúc cách nhau một bậc độ lớn.

### 21.2.1 Mặt bằng theo cấp bậc

| Cấp | Total comp (Mỹ, 2026) | Ghi chú |
|---|---|---|
| QR/QD mới (PhD/top MS) | \$200k–\$400k | Base \$150–200k + signing + bonus năm đầu |
| QR 3–5 năm | \$400k–\$800k | Bonus bắt đầu chi phối |
| Senior QR / PM giỏi | \$1M+ | Đuôi rất dài |
| PM pod đỉnh | \$5M–\$50M+ | Phân phối cực lệch, path-dependent |

Châu Á (Hong Kong, Singapore) và London thường theo sau với chiết khấu 10–30% trên total comp, nhưng thuế và chi phí sống có thể bù lại một phần đáng kể vì Singapore/HK thuế thu nhập thấp hơn nhiều so với New York/California. Tính cụ thể: một QR mới ở HK nhận \$220k total với thuế biên hiệu dụng ~15% giữ lại được $220\text{k}\times 0.85 = \$187\text{k}$ ròng; một người \$300k ở NYC với thuế biên gộp (liên bang + bang + thành phố) ~45% chỉ giữ được $300\text{k}\times 0.55 = \$165\text{k}$ ròng. Nghĩa là con số gross cao hơn 36% ở NYC lại cho thu nhập ròng *thấp hơn* HK — một nghịch lý mà nhiều người bỏ qua khi so sánh offer xuyên vùng. Đừng bao giờ so lương gross giữa hai jurisdiction; luôn quy về ròng sau thuế và điều chỉnh chi phí sống.

Bây giờ hãy tính vì sao "300k mới ra trường" không phải điều bất thường ở quỹ top mà là **hệ quả kinh tế trực tiếp**. Một QR giỏi đóng góp một tín hiệu độc lập nâng IR của cỗ máy firm lên một chút. Giả sử firm quản lý \$10B ở Sharpe 2.0, target vol 10%, tức return kỳ vọng $2.0\times 0.10\times \$10\text{B} = \$2\text{B}$/năm, và tín hiệu mới của bạn nâng Sharpe từ 2.00 lên 2.02 (một đóng góp *khiêm tốn*). Marginal P&L cận biên: nâng Sharpe thêm 0.02 tại vol 10% trên \$10B là $0.02 \times 0.10 \times \$10\text{B} = \$20\text{M}$/năm giá trị kỳ vọng. Trả một người mới \$300k để có kỳ vọng đóng góp \$20M là một cái giá **rẻ** — tỷ lệ giá trị trên chi phí xấp xỉ $20\text{M}/300\text{k} \approx 67$ lần. Đó chính xác là logic khiến các quỹ top đấu giá lương lên cao cho tài năng thật: họ không trả cho bằng cấp, họ trả cho *phần đuôi của phân phối đóng góp*, và ở đuôi đó một QR duy nhất có thể tự trả lương mình gấp hàng chục lần.

### 21.2.2 Vì sao payout PM lệch đến vậy

Payout pod là **P&L phân phối lệch**, không phải lương cố định — và hiểu hình dạng của phân phối đó quan trọng hơn nhớ con số trung vị. Xét lại pod \$500M ở trên với payout 18%. Nếu sống sót cả năm, P&L là $\mathcal{N}(\$60\text{M}, \$40\text{M})$. Nhưng stop cắt đuôi dưới, nên phân phối payout thực tế bị **kiểm duyệt** (censored) ở dưới và **kéo dài** ở trên:

- Năm rất tốt (top ~20%, tương ứng $z \gtrsim 0.84$, tức P&L $\gtrsim \$60 + 0.84\times 40 = \$94\text{M}$): payout $\gtrsim 0.18\times \$94\text{M} = \$17\text{M}$.
- Năm trung vị (P&L ~\$60M): payout ~\$10.8M.
- Năm tệ nhưng chưa chạm stop (P&L ~\$10M): payout $\approx 0.18\times \$10\text{M} = \$1.8\text{M}$.
- Năm chạm stop (~14% xác suất): payout $\approx 0$ **và** thường mất việc.

Kỳ vọng payout *có điều kiện sống sót* nghe rất hấp dẫn, nhưng kỳ vọng *vô điều kiện* — nhân với ~86% xác suất sống một năm và tính cả cái đuôi mất việc — thấp hơn nhiều và mang **variance khổng lồ**. Đây là lý do vì sao hai người cùng vào một pod shop, năm năm sau một người kiếm \$30M tích lũy và người kia đã đổi nghề. Không phải một người giỏi gấp mười; phần lớn là **path và may rủi trên một cấu trúc payout lồi bị chặn dưới**. Người hiểu điều này sẽ *half-Kelly hóa sự nghiệp của mình*, đúng tinh thần chương sizing: không all-in một book quá rủi ro so với vốn cấp (chọn target vol vừa phải để đẩy xác suất chạm stop từ 14% xuống dưới 5%), giữ optionality, và xây danh tiếng để "chạm stop một lần" không đồng nghĩa "hết nghề". Nhớ bài học Kelly: over-bet một edge tốt vẫn dẫn thẳng tới ruin — và một sự nghiệp cũng là một chuỗi cược, ruin ở đây là bị đá khỏi cuộc chơi trước khi kịp compound.

## 21.3 Tech stack — P-stack (dữ liệu + thí nghiệm) vs Q-stack (đúng đắn + audit)

Tech stack của một quỹ định lượng không phải danh sách công cụ thời thượng; nó là hình chiếu trực tiếp của **bài toán kinh tế** firm đang giải. Đây là lý do P-stack (buy-side alpha) và Q-stack (sell-side pricing, cuốn Q-world chương 12) trông khác nhau từ gốc, và hiểu sự khác biệt này giúp bạn không mang nhầm tư duy sang nhầm chỗ khi chuyển việc.

### 21.3.1 Ngôn ngữ: Python thống trị research, C++/Rust ở lõi nóng

**Python** thống trị lớp nghiên cứu. Ngăn xếp điển hình: pandas/**polars** (polars đang thay pandas ở dữ liệu lớn — xem lý do định lượng dưới đây), numpy, scikit-learn, LightGBM/XGBoost (gradient boosting vẫn là workhorse cho tabular alpha), PyTorch cho deep learning. Notebook dùng để thăm dò, **nhưng production research code là package có test đàng hoàng** — quỹ tốt phân biệt rất rõ hai thứ này: một notebook lởm chởm để nghịch dữ liệu buổi chiều, và một signal đã "lên máy" phải có unit test, PIT guarantee, và code review. Nhầm hai thứ này là dấu hiệu nhận diện junior nhanh nhất.

Vì sao polars thay pandas không phải chuyện thời trang mà là số học. pandas dựng trên một trục index Python-object và eager evaluation; polars dựng trên Apache Arrow columnar + lazy query optimizer + multi-threading. Trên một join-groupby điển hình của dữ liệu tick 500 triệu dòng, polars thường nhanh 5–30× và dùng bộ nhớ ít hơn 2–4×. Cụ thể hóa thành vòng đời nghiên cứu: nếu một pipeline feature-engineering chạy 40 phút trên pandas single-thread, cùng logic trên polars lazy với 16 lõi có thể xuống 4 phút. Với một QR chạy hàng trăm thí nghiệm mỗi tuần, cắt thời gian vòng lặp từ 40 xuống 4 phút là nhân **10× throughput nghiên cứu** — và qua Fundamental Law, throughput nghiên cứu chính là số cược mới thử được, là con đường mở rộng breadth, là IR. Nói thẳng ra: một công cụ nhanh gấp mười cho phép bạn tìm ra gấp mười tín hiệu ứng viên trong cùng một quý, và (sau khi trừ tương quan như mục 21.1.2) chuyển một phần lợi thế đó thẳng vào Sharpe. Tốc độ công cụ chuyển thành alpha — đó là lý do các firm bỏ tiền viết lại pipeline dù pandas "vẫn chạy được".

**Hiệu năng ở lõi nóng**: C++ vẫn ngự trị execution engine, HFT, và backtest simulator lõi — nơi bạn replay hàng tỷ tick và mọi microsecond đếm. **Rust** đang lên rất nhanh ở hạ tầng trading mới: an toàn bộ nhớ mà không cần garbage collector, phù hợp cho hệ thống chịu tải cao không được phép dừng để GC. Java tồn tại ở một số shop, đặc biệt hạ tầng cũ. OCaml là cá biệt nổi tiếng — Jane Street xây gần như toàn bộ hệ thống bằng OCaml, đặt cược rằng một ngôn ngữ có type system mạnh giảm lỗi runtime trong môi trường mà một bug định giá sai có thể mất hàng triệu đô trong vài giây. Đó không phải sở thích học thuật mà là một quyết định kinh tế: chi phí kỳ vọng của một bug catastrophic đủ lớn để justify cả một ngôn ngữ lệch dòng chính.

### 21.3.2 Dữ liệu: kdb+ bền bỉ, thế hệ mới columnar

**kdb+/q** là chuẩn de facto cho tick data suốt hai mươi năm — đắt (license doanh nghiệp có thể lên tới sáu chữ số một năm), cú pháp q khét tiếng khó đọc, nhưng nhanh kinh khủng cho time-series query trên tick, và **ai biết kdb+ được trả giá cao** vì nguồn cung nhân lực hiếm. Vì sao nó sống dai? Vì trên một truy vấn kiểu "VWAP theo phút cho 3000 mã trong 5 năm tick", kdb+ được tối ưu đến mức các giải pháp đa dụng khó bì. Thế hệ mới đang gặm dần thị phần: ClickHouse, QuestDB (columnar OLAP mã nguồn mở), và đặc biệt **Arrow/Parquet + DuckDB trên object storage** — kiến trúc "data lake" nơi dữ liệu nằm ở Parquet trên S3 và bạn query bằng DuckDB/Polars mà không cần một database server đắt tiền chạy suốt ngày đêm. Airflow/Dagster điều phối pipeline: schedule, dependency graph, backfill.

Một phép tính quy mô để thấy vì sao thế hệ mới là một cuộc dân chủ hóa. Một năm US equity tick (top ~8000 mã, tất cả trade + quote) cỡ vài terabyte nén Parquet; toàn bộ options chain của Mỹ vài chục terabyte một năm. Ở object storage tier chuẩn (~\$23/TB/tháng), giữ 10 năm × 3 TB/năm = 30 TB lịch sử tick tốn khoảng $30 \times \$23 \times 12 \approx \$8{,}300$/năm — một con số mà cả quỹ một người cũng gánh được. So với license kdb+ sáu chữ số cộng phần cứng chuyên dụng của kỷ nguyên trước, chênh lệch là hai bậc độ lớn. Đó chính là dân chủ hóa mà Parquet+DuckDB mang lại: rào cản dữ liệu tick, từng là moat của các quỹ lớn, nay gần như biến mất, và cạnh tranh dịch từ "ai có dữ liệu" sang "ai research giỏi hơn trên dữ liệu ai cũng có".

### 21.3.3 Backtest/research platform: hầu hết tự xây

Điểm quan trọng nhất về tech stack buy-side: **hầu hết quỹ tự xây research platform**, vì nó *là* lợi thế cạnh tranh, không thể mua ngoài — mua platform ngoài nghĩa là chấp nhận mọi đối thủ dùng nó đều có cùng năng lực và cùng cạm bẫy như bạn. Kiến trúc chuẩn — đúng thứ module `src/alpha` trong repo này đang dựng — là một pipeline tuyến tính:

$$\text{Data layer (PIT)} \to \text{Signal registry} \to \text{Portfolio constructor} \to \text{Event-driven simulator} \to \text{Tearsheet/metrics}.$$

Từng khâu mang một cạm bẫy đã học suốt cuốn sách, và platform tồn tại chính là để đóng đinh từng cạm bẫy đó thành ràng buộc kỹ thuật không thể vi phạm: data layer phải **point-in-time** (không look-ahead, không survivorship — chương 2/9); signal registry để tổ hợp và version tín hiệu (mỗi thí nghiệm được ghi log để về sau tính deflated Sharpe trên đúng số cấu hình đã thử); portfolio constructor áp constraint và cost (chương 11); event-driven simulator để tránh vectorized look-ahead và mô phỏng fill thực (chương 13); tearsheet ra Sharpe, MDD, deflated Sharpe (chương 9/17). Open source đáng học **kiến trúc** (không phải để chạy production): vectorbt (vectorized backtest nhanh, tốt cho khảo sát thô), Lean/QuantConnect (event-driven đầy đủ), Nautilus Trader (hiệu năng cao); và các repo academic-grade quanh AFML (López de Prado) cho purged CV, triple-barrier labeling, meta-labeling. Đọc chúng để thấy *một platform đúng đắn buộc kỷ luật ra sao*, rồi tự dựng bản của mình.

### 21.3.4 P-stack vs Q-stack: hai văn hóa engineering từ gốc yêu cầu

Đây là phần giao với cuốn Q-world và là một trong những phân biệt sâu sắc nhất mà ít người nói rõ. **P-stack** (buy-side alpha) xoay quanh **dữ liệu và thí nghiệm**: data pipeline khổng lồ, experiment tracking (chạy nghìn backtest, ghi log cấu hình để tính deflated Sharpe — nhớ mục 21.3.3), feature store. Câu hỏi engineering trung tâm là *"làm sao chạy nhiều thí nghiệm đúng đắn hơn, nhanh hơn, mà không tự lừa mình bằng overfitting."* Sai lầm chết người là look-ahead và multiple-testing — hai con quỷ đã ám cả cuốn sách.

**Q-stack** (sell-side pricing, xem cuốn Q-world) xoay quanh **đúng đắn và audit**: pricing kernel phải khớp đến từng basis point với market maker khác, market data snapshot phải reproducible, mọi con số phải có **lineage** để trả lời được câu hỏi của risk/regulator: "con số P&L này đến từ đâu, dùng curve nào, snapshot lúc mấy giờ." Câu hỏi engineering trung tâm là *"làm sao đảm bảo con số này đúng và có thể tái tạo/kiểm toán được ba năm sau."* Sai lầm chết người là một mismatch định giá hoặc một snapshot không reproducible — một sai số một basis point trên một book notional hàng tỷ là tiền thật và là rắc rối pháp lý thật.

Hai bộ yêu cầu này đẻ ra hai văn hóa code khác nhau từ gốc. P-stack chấp nhận một chút hỗn độn *có kỷ luật* (chạy nghìn thí nghiệm, prune 95% sau) và tối ưu cho **iteration speed**; Q-stack tối ưu cho **correctness và immutability** — mọi thứ versioned, snapshotted, testable đến cực đoan. Một QR buy-side quen chạy nhanh và vứt bỏ 95% ý tưởng sẽ thấy Q-stack ngột ngạt; một quant sell-side quen với audit trail sẽ thấy P-stack ẩu và liều. Cả hai đều đúng trong thế giới của mình, vì họ đang tối ưu cho hai hàm mất mát khác nhau: P-stack sợ *bỏ lỡ alpha vì chạy chậm*, Q-stack sợ *một con số sai không truy được nguồn*. Điểm giao thực sự — nơi hai stack buộc phải nói chuyện — là ở vol trading, variance risk premium, options positioning, và dealer gamma, khi buy-side đọc dòng hedging của sell-side như một tín hiệu (xem cuốn Q-world). Người đi được cả hai thế giới, hiểu vì sao mỗi bên tối ưu như vậy, là người hiếm và đắt giá.

## 21.4 Vào nghề — ba cửa chính và xu hướng tuyển dụng 2026

Có ba cửa chính vào QR/QD, và tỷ trọng của chúng đang dịch chuyển rõ rệt theo hướng engineering ngày càng nặng ký.

**Cửa 1 — PhD/Masters STEM → QR.** Con đường cổ điển. Quỹ top tuyển từ pool olympiad (IMO/IPhO medalists) và PhD (toán, vật lý, CS, statistics, EE). Phỏng vấn nặng xác suất + brainteasers + ML + thống kê. Ưu điểm: chiều sâu toán. Nhược điểm ngày càng lộ: nhiều PhD giỏi lý thuyết nhưng yếu engineering, và ngành ngày càng cần người viết được production code sạch, không chỉ chứng minh được định lý. Một QR nâng Sharpe 0.02 (giá trị \$20M như mục 21.2.1) chỉ có ích nếu tín hiệu của họ *lên được máy* — một chứng minh đẹp trong notebook không có PIT guarantee thì bằng không.

**Cửa 2 — SWE giỏi → QD rồi chuyển dần sang research.** Con đường **ngày càng phổ biến nhất** vào 2026, vì mọi quỹ đói engineer và vì tech stack đã trở thành lợi thế cạnh tranh (toàn bộ mục 21.3). Một SWE mạnh về hệ thống phân tán, hiệu năng, data infra có thể vào làm Quant Developer, xây research platform, rồi thẩm thấu dần sang signal research. Xu hướng 2026: ranh giới QD/QR mờ đi; nhiều firm tuyển "quant" full-stack biết cả research lẫn production. Machine learning engineering — feature store, training pipeline, model serving — là kỹ năng cầu vượt cung mạnh nhất, vì nó đứng ngay giao điểm giữa "chạy nhiều thí nghiệm nhanh" (21.3.1) và "lên máy có kỷ luật" (21.3.3).

**Cửa 3 — trader/analyst discretionary học quant hóa.** Hiếm dần nhưng chưa chết, đặc biệt ở macro/rates nơi trực giác thị trường và hiểu biết định chế vẫn có giá trị mà pure-quant khó thay. Người này mang **market sense** — thứ mà mục 21.5 sẽ cho thấy các firm tốt vẫn kiểm tra ráo riết ở vòng cuối phỏng vấn.

**Bốn xu hướng tuyển dụng 2026 cần biết.** Thứ nhất, **ML/AI-native**: các firm kỳ vọng ứng viên hiểu deep learning và LLM đủ để dùng chúng như công cụ nghiên cứu — sinh feature, xử lý alt-data dạng text, code assist — không phải chỉ gradient boosting. Thứ hai, **alt-data literacy**: credit card panels, satellite, web-scraped, sentiment — biết cách PIT hóa và tránh look-ahead trong dữ liệu bẩn (một field timestamp sai một ngày là cả một backtest ảo). Thứ ba, **engineering bar tăng**: một QR không viết được code production sạch ngày càng khó cạnh tranh; "PhD nhưng code ẩu" không còn là hồ sơ mạnh như năm 2015. Thứ tư, **compliance/PIT rigor**: sau nhiều vụ overfitting công khai và scandal alt-data licensing, các firm coi trọng ứng viên chứng minh được kỷ luật nghiên cứu — chính là điểm cuối mục 21.5.

## 21.5 Phỏng vấn QR — cấu trúc và năm câu hỏi mẫu có lời giải

Phỏng vấn QR điển hình có năm trục: (1) **xác suất/combinatorics nhanh** (kỳ vọng, martingale, Bayes); (2) **thống kê** (regression pitfalls — chương 3); (3) **ML** (bias-variance, đặc biệt CV cho time series — chương 9/17); (4) **coding** (Python/pandas hoặc leetcode-style); (5) **market sense** ("thiết kế cho tôi một tín hiệu từ dataset X, và nói trước nó sẽ chết vì gì"). Trục thứ năm là thứ phân biệt ứng viên "giỏi toán" với ứng viên "sẽ tạo được alpha", và là thứ nhiều người ôn thiếu nhất — vì nó không có trong sách, chỉ có ở người đã sống với dữ liệu thật.

Dưới đây là năm câu hỏi mẫu đúng "chất" phỏng vấn QR, mỗi câu kèm cả lời giải số lẫn điều interviewer *thực sự* đang tìm.

**Câu 1 — Kỳ vọng qua state equations.** *"Tung xu công bằng đến khi ra 2 mặt ngửa liên tiếp. Kỳ vọng số lần tung?"*

Dựng phương trình trạng thái. Gọi $E_0$ là kỳ vọng số lần tung từ trạng thái "chưa có ngửa nào (hoặc vừa ra sấp)", $E_1$ từ trạng thái "vừa ra đúng một ngửa". Mỗi lần tung tốn 1, rồi với xác suất $\tfrac12$ đi mỗi nhánh:
$$E_0 = 1 + \tfrac{1}{2}E_1 + \tfrac{1}{2}E_0, \qquad E_1 = 1 + \tfrac{1}{2}\cdot 0 + \tfrac{1}{2}E_0.$$
Từ phương trình đầu: $\tfrac{1}{2}E_0 = 1 + \tfrac{1}{2}E_1 \Rightarrow E_0 = 2 + E_1$. Thế vào phương trình hai: $E_1 = 1 + \tfrac{1}{2}(2+E_1) = 2 + \tfrac{1}{2}E_1 \Rightarrow \tfrac12 E_1 = 2 \Rightarrow E_1 = 4$, nên $E_0 = 2 + 4 = 6$. **Kỳ vọng 6 lần tung.** (Kiểm tra ngược: $E_1 = 1 + \tfrac12\times 6 = 4$ ✓.) Kỹ thuật state/martingale này giải quyết khoảng một phần ba số câu xác suất phỏng vấn — hễ thấy "tung đến khi..." hãy phản xạ dựng phương trình trạng thái ngay, đừng cố đếm chuỗi.

**Câu 2 — Regression to the mean, và vì sao bạn không all-in tín hiệu.** *"Correlation giữa X và Y là 0.8; bạn quan sát X tăng 2σ. Dự báo tốt nhất cho Y?"*

Best linear predictor cho hai biến chuẩn hóa: $\mathbb{E}[Y\,|\,X] = \rho \cdot \frac{X-\mu_X}{\sigma_X}\cdot\sigma_Y = 0.8 \times 2\sigma_Y = 1.6\sigma_Y$ — **không phải** $2\sigma_Y$. Regression to the mean: dự báo luôn bị kéo về trung bình theo đúng hệ số $\rho$, và phần "co lại" là $(1-\rho)\times 2\sigma = 0.4\sigma$. Đây chính xác là lý do một tín hiệu có $IC = 0.03$ chỉ được "cược" 0.03 phần niềm tin: forecast return tối ưu là $IC \times$ (z-score của signal) $\times \sigma$, không phải tin tín hiệu ở mệnh giá của nó. Ứng viên nói được liên hệ này — rằng con số 1.6 chính là bản mini của việc sizing phải nhân với IC — ghi điểm lớn hơn nhiều người chỉ đọc ra "1.6". Họ đang lọc người *hiểu* vì sao một IC nhỏ vẫn phải được tôn trọng bằng một position nhỏ tương ứng, chứ không phóng đại.

**Câu 3 — Sharpe và xác suất năm lỗ, kèm cảnh báo đuôi dày.** *"Chiến lược Sharpe 2, vol 10%. Xác suất một năm bất kỳ bị lỗ?"*

Return năm $\sim \mathcal{N}(\mu, \sigma)$ với $\mu = SR \times \sigma = 2 \times 10\% = 20\%$ và $\sigma = 10\%$. Xác suất lỗ: $P(r<0) = \Phi\!\left(\frac{0-20}{10}\right) = \Phi(-2) \approx 2.3\%$. Nhưng câu chốt để thật sự ghi điểm không phải con số mà là phần bổ sung: *"returns thật có đuôi dày (fat tails) và bản thân Sharpe được ước từ mẫu hữu hạn nên mang sai số; con số thực tế cao hơn 2.3%, và một năm cụ thể có thể tệ hơn nhiều vì tail risk không nằm trong giả định chuẩn."* Người chỉ đọc $\Phi(-2)$ là đúng nhưng nông; người thêm cảnh báo đuôi dày cho thấy đã sống với dữ liệu thật, nơi phân phối chuẩn là một sự lạc quan hệ thống. Chính khoảng cách giữa "đúng" và "đúng cộng nghi ngờ đúng chỗ" là thứ tách QR giỏi khỏi sinh viên thuộc bài.

**Câu 4 — Deflated Sharpe: câu kiểm tra văn hóa nghiên cứu.** *"Backtest của ứng viên trước cho Sharpe 3 trên 2 năm, họ thử 500 cấu hình. Bạn nghĩ gì?"*

Đây không phải câu toán mà là câu văn hóa ngụy trang thành câu toán. Tính Sharpe kỳ vọng lớn nhất thu được **từ nhiễu thuần túy** khi thử $N$ cấu hình độc lập trên $T$ năm: $SR_0 \approx \sqrt{2\ln N / T}$. Với $N=500$, $T=2$: $SR_0 = \sqrt{2\ln 500 / 2} = \sqrt{\ln 500} = \sqrt{6.21} \approx 2.49$. Nghĩa là **ngay cả khi mọi cấu hình đều hoàn toàn vô dụng**, cái tốt nhất trong 500 lần thử kỳ vọng đạt Sharpe ~2.5 chỉ nhờ may rủi. Sharpe 3 quan sát chỉ hơn ngưỡng nhiễu này khoảng nửa sigma — hoàn toàn không đủ để tin đó là edge thật. Câu trả lời đúng: *"Tôi cần research log — họ thực sự thử bao nhiêu cấu hình, tính cả các biến thể ngầm — một holdout out-of-sample chưa từng bị chạm, và deflated Sharpe trước khi tin. Sharpe 3 trên 2 năm sau 500 lần thử là báo động đỏ overfitting, không phải một khám phá."* Họ đang kiểm tra bạn có phản xạ multiple-testing hay không, vì đó là bệnh dịch số một của backtest (chương 9) và là thứ phân biệt người sẽ đốt tiền firm với người biết sợ đúng chỗ.

**Câu 5 — Market-making instinct: inventory và adverse selection.** *"Bạn đang market-make một cổ phiếu và vừa bị fill mua 3 lần liên tiếp. Bạn làm gì?"*

Không có một con số duy nhất đúng — họ đang xem bạn có bản năng "người bán bảo hiểm" không. Ba fill mua liên tiếp là tín hiệu **hai chiều**, và người giỏi đọc được cả hai. Về **inventory**: bạn đang ôm long ngoài ý muốn, cần nghiêng quote xuống — hạ cả bid lẫn ask, chẳng hạn dịch cả hai xuống một nửa tick — để khuyến khích dòng lệnh đẩy bạn về flat. Về **adverse selection**: fill dễ và một chiều thường nghĩa là *có người biết gì đó* — họ đang gom, có thể vì tin tức bạn chưa thấy, và mỗi fill tiếp theo có kỳ vọng lỗ. Minh họa bằng số cho trực giác: nếu spread của bạn là 4 bps và bạn ước xác suất dòng lệnh là informed đã tăng từ 20% lên 50% sau ba fill, thì adverse-selection cost kỳ vọng trên fill tiếp theo có thể vượt nửa spread, nghĩa là quote hiện tại đã lỗ kỳ vọng — phải nới spread hoặc rút. Phản ứng đúng là một *quy trình phòng thủ*, không phải một con số: (1) nghiêng quote để giảm inventory; (2) thu hẹp size để giảm phơi nhiễm nếu nghi informed flow; (3) nới spread để đòi phí bảo hiểm cao hơn cho adverse selection; (4) kiểm tin tức và order book. Họ muốn thấy bạn hiểu rằng *mọi fill đều mang thông tin*, và người thắng ở market-making là người định giá đúng adverse selection — đây chính là trực giác Kyle lambda và microstructure ở chương 12, được hỏi dưới dạng bản năng thay vì công thức.

### 21.5.1 Chuẩn bị: sách và thứ đáng giá hơn mọi chứng chỉ

Tài liệu ôn kinh điển: *A Practical Guide to Quantitative Finance Interviews* (Xinfeng Zhou), *Heard on the Street* (Timothy Crack), *Fifty Challenging Problems in Probability* (Mosteller). Nhưng thứ **đáng giá hơn bất kỳ chứng chỉ nào** là **một project thật chứng minh kỷ luật nghiên cứu**: một backtest có PIT data (không look-ahead, không survivorship), purged/embargoed CV cho time series, cost model thực tế (impact + spread + fee), và deflated Sharpe tính trên đúng số cấu hình bạn đã thử. Một dự án như vậy trả lời trực tiếp mọi câu hỏi ngầm của interviewer — bạn có hiểu look-ahead không, có sợ overfitting không, có mô hình được chi phí không — mà không cần bạn tự khoe một lời nào. Nó chính là hiện thân của kiến trúc `src/alpha`: từ data layer PIT đến tearsheet có deflation, đúng pipeline ở mục 21.3.3. Trong một ngành mà mọi CV đều ghi "Sharpe 2.5 trên backtest", người mang được một pipeline chứng minh mình *không* tự lừa mình là người hiếm — và như toàn bộ chương này cho thấy, từ payout PM đến moat của cỗ máy trung tâm đến logic lương \$300k, thứ hiếm mới là thứ được trả giá.

# Chương 22: Lộ trình học và tài nguyên

Bạn đã đi qua hai mươi mốt chương. Chúng ta đã dựng từ số 0: P-world là gì và ai trả tiền cho alpha, cách làm sạch dữ liệu và tính return cho đúng, bộ đồ nghề thống kê-econometrics, cách phát hiện regime, lý thuyết danh mục, factor models; rồi sang alpha research thật sự — behavioral foundations, backtesting kỷ luật, feature engineering; rồi từ tín hiệu tới P&L — portfolio construction, microstructure, execution, risk management; rồi bản đồ chiến lược, trading theo asset class, machine learning, credit & fixed-income relative value, volatility trading, performance attribution; và cuối cùng là nghề. Chương này là chương khép sách. Nó không dạy kỹ thuật mới; nó trả lời một câu hỏi khác, khó hơn: **bạn tự học lại toàn bộ thứ này như thế nào, theo trình tự nào, đọc cái gì trước cái gì, và làm sao biết mình đang tiến bộ chứ không phải đang tự lừa mình.** Vì quant là nghề mà đường tự học sai sẽ tốn ba năm, còn đường đúng tốn một.

Một lời cảnh báo mở đầu, vì nó định hình cả chương: kiến thức trong nghề này không tuyến tính và không "học xong". Bạn sẽ đọc Grinold-Kahn, thấy hiểu, rồi sáu tháng sau tự viết một optimizer và mới vỡ ra mình chưa hiểu gì về transfer coefficient. Đó là chuyện bình thường — thậm chí là dấu hiệu bạn đang học đúng. Cuốn sách này, và lộ trình dưới đây, được thiết kế để bạn đi qua vòng lặp "đọc → code → thất bại → đọc lại" nhiều lần, mỗi lần sâu hơn. Không có con đường tắt nào vượt qua vòng lặp đó; chỉ có con đường đi qua nó nhanh hay chậm, và chương này là bản đồ để đi nhanh.

## 22.1 Bản đồ 22 chương — bạn đang ở đâu

Trước khi nói học tiếp thế nào, hãy nhìn lại toàn bộ lãnh thổ đã đi qua, vì bản thân mục lục là một lộ trình. Cuốn sách chia thành năm phần và ba phụ lục:

**Part I — Nền tảng (Ch1–6).** Ch1 P-world là gì (real-measure $\mathbb{P}$, ai trả tiền cho alpha, phân biệt với Q-world sell-side). Ch2 Dữ liệu & returns (survivorship bias, corporate actions, simple vs log-return). Ch3 Thống kê & econometrics (ước lượng, kiểm định, hồi quy). Ch4 Regime & structural change (breakpoint, HMM). Ch5 Lý thuyết danh mục (mean-variance, Markowitz). Ch6 Factor models (Fama-French, PCA, risk model).

**Part II — Alpha (Ch7–10).** Ch7 Alpha research (look-ahead, overfitting, IC, decay — chương xương sống). Ch8 Behavioral foundations (vì sao alpha tồn tại: underreaction, limits to arbitrage). Ch9 Backtesting (event-driven, purged CV). Ch10 Feature engineering & labeling (triple-barrier, fractional differencing).

**Part III — Từ tín hiệu đến P&L (Ch11–14).** Ch11 Portfolio construction (từ signal thành weight). Ch12 Microstructure theory (Kyle lambda, order book). Ch13 Execution (Almgren-Chriss, market impact). Ch14 Risk management (VaR, drawdown control, factor risk).

**Part IV — Chiến lược & ML (Ch15–20).** Ch15 Bản đồ chiến lược (momentum, mean-reversion, carry, stat-arb). Ch16 Trading theo asset class (equities, futures, FX, crypto). Ch17 Machine learning (ensemble, feature importance với kỷ luật Ch7-9). Ch18 Credit & fixed-income relative value (CDS-bond basis, curve trades, capital structure arb). Ch19 Volatility trading (variance risk premium, dispersion, gamma scalping). Ch20 Performance attribution (Brinson, factor-based, risk decomposition).

**Part V — Nghề (Ch21–22).** Ch21 Industry (pod shops, career, structure của một quỹ). Ch22 Lộ trình (chương này).

**Phụ lục.** A — Ví dụ xuyên suốt (momentum → multi-signal, số nối mạch cả sách). B — Case studies (LTCM, quant quake 2007, GameStop). C — Glossary.

Con số cần nhớ: **22 chương + 3 phụ lục.** Cấu trúc này không phải trang trí — nó là một dependency graph, và bạn có thể đọc nó ngược để chẩn đoán chỗ hổng của mình. Nếu bạn đọc một chương ở Part III mà thấy hụt hẫng vì chưa nắm factor model, tín hiệu đó bảo bạn quay lại Ch6. Nếu bạn viết một backtest ở Ch9 mà không hiểu vì sao phải purge, cái gốc nằm ở Ch7. Một quy tắc thực hành: khi một chương làm bạn khó chịu vì "không hiểu tại sao lại cần thứ này", gần như luôn luôn cái "tại sao" nằm ở một chương phía trước bạn đã đọc lướt. Quay lại đó trước khi đi tiếp.

## 22.2 Lộ trình 4 giai đoạn

Đây là trục xương sống của chương và của cả việc tự học. Bốn giai đoạn, mỗi giai đoạn có sách chủ đạo, có project bắt buộc, và có tiêu chí "xong" đo được. Đừng nhảy cóc: mỗi giai đoạn cài đặt phản xạ mà giai đoạn sau giả định bạn đã có. Người nhảy từ giai đoạn 1 thẳng lên giai đoạn 3 — đọc AFML và ML papers khi chưa từng tự dẫm phải một look-ahead bug — chính là chân dung điển hình của người "biết nhiều mà không làm được gì".

**Giai đoạn 0 — Nền (song song với cuốn Q):** xác suất-thống kê vững (Blitzstein & Hwang *Introduction to Probability*; Casella-Berger *Statistical Inference* nếu muốn chặt), đại số tuyến tính (Strang là đủ), Python + pandas/polars thành thạo. Kinh tế tài chính đọc nhẹ: Bodie-Kane-Marcus *Investments* (textbook MBA chuẩn — đọc nhanh lấy khung CAPM, APT, market efficiency, không sa lầy).

Vì sao giai đoạn này không thể bỏ: gần như mọi lỗi chết người của quant mới không nằm ở "không biết chiến lược" mà nằm ở "không có phản xạ thống kê". Lấy một ví dụ tính bằng số làm bằng chứng. Giả sử bạn backtest một chiến lược trên $T=252$ ngày (một năm), Sharpe daily quan sát được là $\widehat{SR}_d = 0.126$, tức annualized $SR = 0.126\sqrt{252} \approx 2.0$. Nghe tuyệt vời. Nhưng standard error của một ước lượng Sharpe (giả định returns iid, bỏ qua higher moments) xấp xỉ

$$\text{SE}(\widehat{SR}) \approx \sqrt{\frac{1 + \tfrac12 SR^2}{T}}.$$

Cắm annualized $SR=2.0$ nhưng phải tính trên số quan sát: với $T=252$ và $SR$ theo cùng đơn vị năm, $\text{SE} \approx \sqrt{(1 + 0.5\cdot 4)/252} = \sqrt{3/252} = \sqrt{0.0119} \approx 0.109$. Vậy khoảng tin cậy 95% cho Sharpe annualized của bạn là $2.0 \pm 1.96 \times 0.109 \approx [1.79,\ 2.21]$ — trông vẫn ổn, vì một năm dữ liệu ở Sharpe cao vẫn đủ để phân biệt với 0. Nhưng độ chắc đó sụp rất nhanh khi dữ liệu ngắn lại. Nếu chỉ có $T=63$ ngày (một quý), $\text{SE} = \sqrt{3/63} \approx 0.218$, khoảng tin cậy nở thành $[1.57, 2.43]$. Và nếu Sharpe thật là 1.0 thay vì 2.0, với $T=63$ thì $\text{SE}=\sqrt{1.5/63}\approx 0.154$ — nghĩa là một Sharpe *thật bằng 0.5* hoàn toàn có thể cho ra quan sát 0.8 chỉ do may, vì $0.8$ nằm gọn trong một std error của $0.5$. Không có phản xạ tính SE này, bạn sẽ tin mọi backtest, và điều nguy hiểm là những backtest tệ nhất thường lại ngắn nhất — vì chúng chỉ hoạt động trong một cửa sổ hẹp. Đó là lý do giai đoạn 0 quan trọng hơn giai đoạn 3.

**Giai đoạn 1 — Vỡ lòng (3–6 tháng):**

Sách: **Chan, *Quantitative Trading*** (mỏng, thực dụng — đúng tinh thần "chạy được trước, đẹp sau") rồi *Algorithmic Trading* (mean reversion/momentum chi tiết hơn). Chan không phải sách sâu nhất, nhưng nó là sách *đúng nhất để bắt đầu*: nó cho bạn một pipeline end-to-end đơn giản chạy được trong một tuần, và cảm giác "tôi vừa backtest một chiến lược thật" là thứ giữ bạn ở lại nghề.

Project bắt buộc: dựng pipeline đầu tiên. Tải daily data (survivorship-free càng tốt — nếu không có thì ít nhất phải *biết* mình đang có bias), code backtest event-driven **tự viết** (đừng dùng framework vội — bạn phải tự dẫm lên từng cái bẫy của Ch7-9 một lần thì mới nhớ), chạy momentum 12-1 và mean-reversion 5 ngày trên universe cổ phiếu thanh khoản, có phí, có tearsheet. Học đọc kết quả: IC, decay, turnover, Sharpe sau phí, phân rã long/short.

Hãy làm ví dụ momentum 12-1 running example của cuốn sách này thành tiêu chí "xong" đo được. Momentum 12-1 trên top-1000 US: bạn xếp hạng cổ phiếu theo return 12 tháng bỏ tháng gần nhất, long decile trên cùng, short decile dưới cùng, dollar-neutral. Khi làm đúng, bạn phải thấy rank-IC trung bình khoảng $\overline{IC} \approx 0.025$ với $\text{std}(IC) \approx 0.11$. Từ đó suy Sharpe của tín hiệu qua một phiên bản Fundamental Law đơn giản: với breadth $BR$ = số quyết định độc lập mỗi năm, $IR \approx IC \cdot \sqrt{BR}$. Nếu bạn rebalance hàng tháng trên ~1000 tên nhưng chúng không độc lập (correlated qua factor), breadth hiệu dụng nhỏ hơn nhiều — giả sử $BR \approx 12 \times 30 = 360$ quyết định độc lập/năm sau khi hiệu chỉnh correlation. Khi đó $IR \approx 0.025 \times \sqrt{360} = 0.025 \times 18.97 \approx 0.47$. Con số này *thấp hơn* Sharpe momentum thực tế trước phí (~0.9), và khoảng cách đó tự nó là một bài học: cách đếm breadth ngây thơ ($12\times30$) đã undercount, vì IC của momentum có persistence — tín hiệu ở tháng $t$ và tháng $t+1$ tương quan dương, nên số quyết định *hiệu dụng* thật ra lớn hơn cách đếm rời rạc, đẩy IR lên gần 0.9. Điểm mấu chốt đi theo hướng ngược cũng đúng và quan trọng hơn: **nếu backtest của bạn cho Sharpe 2.5 với đúng tín hiệu momentum 12-1, bạn có bug** — gần như chắc chắn là look-ahead hoặc survivorship. Tiêu chí "xong" giai đoạn 1: bạn tái tạo được Sharpe trước phí ~0.9, sau phí ~0.75, và thấy được MDD ~-25% tập trung 2009 (momentum crash: short leg tăng +80% khi thị trường hồi phục hình V, nghiền nát bên short). Reproduce được cái crash đó nghĩa là backtest của bạn trung thực — một backtest momentum "sạch sẽ" không có vết sẹo 2009 gần như luôn là một backtest đã vô tình loại bỏ chính giai đoạn nó phải chịu đau.

**Giai đoạn 2 — Chính khóa (6–12 tháng):**

Sách trung tâm: **Grinold & Kahn, *Active Portfolio Management*** — kinh thánh của institutional quant. IC, IR, Fundamental Law, risk model, transfer coefficient. Khô, nhưng là bộ khung khái niệm mà mọi quỹ lớn nói bằng nó. Đây là giai đoạn bạn chuyển từ "người có một chiến lược chạy được" thành "người tư duy bằng ngôn ngữ của ngành".

Vì Fundamental Law là hạt nhân của cả cuốn Grinold-Kahn và cả nghề, hãy derive và tính nó bằng số ở đây, đầy đủ, để giai đoạn 2 có một mỏ neo cụ thể. Fundamental Law of Active Management phát biểu:

$$IR = IC \cdot \sqrt{BR},$$

trong đó $IR$ là information ratio (alpha residual chia active risk), $IC$ là information coefficient (correlation giữa forecast và realized return), $BR$ là breadth (số cược độc lập mỗi năm). Trực giác đằng sau là edge nhỏ nhân với số lượng — chính là running example đồng xu 51/49 của cuốn sách. Một đồng xu 51/49 cho edge cực nhỏ, Sharpe mỗi cược $\approx 0.02$. Nhưng $N$ cược độc lập cho $SR = 0.02\sqrt{N}$: với $N=100 \to SR=0.2$; $N=2500 \to SR=1.0$; $N=10000 \to SR=2.0$. Đây chính là Fundamental Law dưới lốt xác suất: $IC$ đóng vai edge mỗi cược, $\sqrt{BR}$ đóng vai $\sqrt{N}$. Renaissance không thắng vì mỗi cược của họ giỏi; họ thắng vì họ đặt hàng triệu cược edge-nhỏ độc lập.

Bây giờ tính ngược cho một chiến lược thật. Bạn muốn $IR = 1.0$ (một chiến lược institutional tốt, tương đương Sharpe active ~1.0). Nếu $IC = 0.05$ (khá cao cho equity daily), bạn cần $BR = (IR/IC)^2 = (1.0/0.05)^2 = 400$ cược độc lập/năm. Nếu $IC$ chỉ 0.03 (thực tế hơn cho momentum), bạn cần $BR = (1/0.03)^2 \approx 1111$ cược độc lập. Đây là bài học triệu đô: muốn $IR$ cao mà $IC$ thấp thì bắt buộc phải có breadth khổng lồ — tức universe rộng, rebalance thường, và các cược *thật sự* không correlated. Phần "thật sự không correlated" là nơi Fundamental Law bị lạm dụng nhất: nếu bạn có 1000 cổ phiếu nhưng tất cả cùng load lên một factor, breadth hiệu dụng của bạn có thể chỉ là 10, không phải 1000, và $IR$ thật của bạn bằng $0.03\sqrt{10} \approx 0.095$ — gần như vô dụng. Grinold-Kahn dạy bạn nhìn xuyên qua ảo giác breadth này, và cả nghề equity market-neutral về bản chất là một cuộc chiến để giành lại breadth thật từ tay correlation.

Còn transfer coefficient $TC$: Fundamental Law "đầy đủ" là $IR = IC \cdot \sqrt{BR} \cdot TC$, với $TC \in [0,1]$ đo mức độ danh mục thực tế của bạn (sau ràng buộc, sau chi phí, sau turnover cap) khớp với danh mục lý tưởng — nói chính xác, $TC$ là correlation giữa vector active weight bạn *thật sự* nắm và vector alpha lý tưởng đã risk-scale. Ví dụ số dẫn từng bước: chiến lược lý tưởng cho $IR^* = 1.0$. Giờ áp ba ràng buộc thực tế — no-short (không được bán khống, cắt mất nửa dưới của tín hiệu), position cap 3% (chặn không cho đặt nặng vào tên tín hiệu mạnh nhất), turnover cap (không cho đuổi theo tín hiệu mỗi ngày). Ba ràng buộc này đồng loạt kéo weight thực rời khỏi weight tối ưu; giả sử correlation giữa chúng tụt còn 0.6. Vậy $TC = 0.6$ và $IR$ thực $= IR^* \times TC = 1.0 \times 0.6 = 0.6$. Bạn vừa mất 40% edge chỉ vì ràng buộc thực thi, dù *không thay đổi một tín hiệu nào*. Đây là lý do một nửa công việc quant thực chiến là *bảo vệ transfer coefficient* — nới ràng buộc một cách an toàn, giảm chi phí, thiết kế lại tín hiệu để chịu được cap — chứ không phải tìm alpha mới. Một $TC$ tăng từ 0.6 lên 0.75 cải thiện IR y hệt như tìm một tín hiệu mới nâng IC thêm 25%, nhưng thường dễ hơn nhiều.

Econometrics giai đoạn này: Tsay *Analysis of Financial Time Series*; hoặc Cochrane *Asset Pricing* (bản online + khóa Coursera cũ của ông — để hiểu *vì sao* factor được trả return, không chỉ *rằng* nó được trả). Cochrane cho bạn phương trình $p = E[m x]$ và khung stochastic discount factor — đây chính là cây cầu khái niệm sang cuốn Q-world, nơi $m$ trở thành công cụ định giá.

**AFML (López de Prado)** — đọc *sau* khi đã tự viết backtest, không phải trước. Không có sẹo thì không thấm. AFML là cuốn dạy bạn purged K-fold CV, embargo, triple-barrier labeling, fractional differencing, deflated Sharpe. Mỗi kỹ thuật trong đó là câu trả lời cho một cái bẫy bạn đã tự rơi vào ở giai đoạn 1. Ví dụ purged CV bằng số: nếu label của bạn dùng return 20 ngày tới, thì một sample ở ngày $t$ và một sample ở ngày $t+5$ *chồng lấn* 15 ngày thông tin tương lai — hai label này chia nhau cùng một đoạn giá, nên nếu một cái rơi vào train và một cái rơi vào test, test set đã "nhìn thấy" tương lai của train. Cross-validation ngây thơ (random K-fold) sẽ rò rỉ đúng theo cơ chế đó và cho bạn out-of-sample Sharpe giả cao. Purging cắt bỏ mọi sample train có label chồng lấn thời gian với test fold; embargo thêm một khoảng đệm (ví dụ thêm 20 ngày sau test fold) để chặn cả rò rỉ qua autocorrelation của feature. Đọc AFML trước khi có bug này, bạn thấy nó rườm rà. Đọc sau khi một backtest 2.5-Sharpe của bạn chết ngay khi lên paper-trading, bạn thấy nó là kinh thánh.

Code giai đoạn 2: risk model factor kiểu Barra thu nhỏ (Fama-MacBeth trên vài chục exposures), optimizer QP với ràng buộc + chi phí, purged K-fold CV, deflated Sharpe. Một lần nữa — đây chính là danh sách module của `src/alpha`: tài liệu này và repo này là một giáo trình. Bạn học bằng cách tái implement, không bằng import. Cái ngày bạn tự viết optimizer QP và thấy $TC$ của chính mình tụt xuống 0.6 vì turnover cap là ngày Fundamental Law thôi là công thức và thành trực giác.

**Giai đoạn 3 — Chuyên hóa (chọn theo khẩu vị):**

Đến đây bạn không còn học "quant" chung chung nữa; bạn chọn một mảnh và đào sâu tới đáy. Bốn nhánh chính:

*Stat-arb / mid-freq:* **Isichenko, *Quantitative Portfolio Management*** — sách hay nhất về nghề stat-arb hiện đại từ người thật trong nghề (cựu PDT/Millennium). Nó nói thật về capacity, crowding, và cách một signal chết dần. Đọc kèm Avellaneda notes về statistical arbitrage. Ví dụ số của nhánh này là pairs/OU running example: nếu spread hai cổ phiếu cointegrated follow một quá trình Ornstein-Uhlenbeck với mean-reversion speed $\kappa = 0.05$/ngày, thì half-life của một cú lệch là $t_{1/2} = \ln 2 / \kappa = 0.693/0.05 \approx 14$ ngày. Với spread vol $\sigma = 2.4\%$, bạn vào lệnh ở $\pm 2\sigma$ (tức spread lệch $\pm 4.8\%$), thoát về ~0, stop ở $\pm 3.5$–$4\sigma$. Half-life 14 ngày định vị chiến lược một cách chính xác: giữ vài ngày tới hai tuần, không phải intraday, không phải buy-and-hold — và nó cũng cho bạn con số kỳ vọng thời gian nắm giữ để tính turnover và do đó chi phí. Isichenko dạy bạn cả cách ước lượng $\kappa$ và cách biết khi nào $\kappa$ đang trôi (cointegration break — dấu hiệu pair sắp chết, khi half-life bắt đầu dài ra thì spread không còn kéo về mean nữa và cái bạn tưởng là mean-reversion thành một xu hướng lỗ).

*Microstructure / execution:* **Bouchaud et al., *Trades, Quotes and Prices*** (định lượng nhất về market impact và order flow); Harris *Trading and Exchanges* (thể chế, đọc trước để có vocabulary); Cartea-Jaimungal-Penalva *Algorithmic and High-Frequency Trading* (toán stochastic control — cầu nối trực tiếp về Q-world). Ví dụ số cốt lõi: square-root impact law. Bạn muốn mua một lượng $Q$ bằng 5% ADV ($Q/V = 0.05$), cổ phiếu có daily vol $\sigma = 2\%$, hệ số $c \approx 0.7$. Impact tạm thời

$$\Delta \approx c \cdot \sigma \cdot \sqrt{\frac{Q}{V}} = 0.7 \times 0.02 \times \sqrt{0.05} = 0.7 \times 0.02 \times 0.2236 \approx 0.00313,$$

tức ~31 bps. Nghĩa là: đẩy 5% ADV vào thị trường một cách vô kỷ luật ngốn của bạn 31 bps — với một chiến lược có expected edge 20 bps mỗi trade thì bạn *lỗ ròng 11 bps ngay từ khi thực thi*, edge dương biến thành P&L âm không phải vì tín hiệu sai mà vì cách bỏ lệnh sai. Đây là lý do execution không phải "afterthought": nó là ranh giới giữa một alpha có thật và một alpha chỉ tồn tại trên giấy. Chú ý dạng căn bậc hai còn cho bạn một đòn bẩy thiết kế: chia lệnh làm đôi, mỗi nửa 2.5% ADV, thì impact mỗi nửa là $0.7\times0.02\times\sqrt{0.025}\approx 22\,\text{bps}$ — tổng thực thi giảm đáng kể so với 31 bps đánh một phát, và đó chính là toàn bộ lý do tồn tại của lịch chia lệnh Almgren-Chriss ở Ch13. Bouchaud cho bạn cả derivation của căn bậc hai này từ order-flow imbalance.

*CTA / macro:* Ilmanen *Expected Returns* — bách khoa toàn thư về risk premia, đọc chậm từng chương như đọc reference. Ilmanen trả lời câu hỏi trung tâm của cuốn sách này ("ai trả tiền cho alpha này và vì sao") cho *mọi* risk premium đã biết: equity, term, credit, carry, value, momentum, vol, liquidity. Kèm AQR papers (miễn phí, chất lượng ngang sách). Với nhánh này bạn cũng cần vững measure $\mathbb{P}$ và các running example carry.

*ML sâu:* papers của Gu-Kelly-Xiu (*Empirical Asset Pricing via Machine Learning* — benchmark học thuật chuẩn cho việc dùng ML dự báo cross-section return), thực hành kiểu Kaggle trên dữ liệu tài chính nhưng với **kỷ luật Ch7-9** (đây là chỗ 90% người làm ML tài chính chết: họ mang habit của Kaggle — random K-fold, tối ưu leaderboard — vào một domain có look-ahead và regime shift, và tạo ra overfit ngoạn mục).

*Vol:* quay lại cuốn Q chương 5–6 rồi đọc Sinclair *Volatility Trading* (góc nhìn P thuần túy về vol — đúng giao điểm hai thế giới).

## 22.3 Chống tự lừa: deflated Sharpe như một môn học suốt đời

Cần tách mục này ra vì nó là kỹ năng phân biệt researcher thật với người mơ mộng, và vì nó đúng ở mọi giai đoạn. Khi bạn thử nhiều cấu hình rồi chọn cái tốt nhất, Sharpe cao nhất bạn thấy *một phần là kỹ năng, một phần là may*. Deflated Sharpe Ratio định lượng phần may đó.

Recipe từng bước. Giả sử bạn thử $N=1000$ cấu hình (grid các lookback, threshold, universe) trên $T=10$ năm dữ liệu. Bước 1: tính expected maximum Sharpe do *thuần may* nếu true Sharpe của mọi cấu hình đều bằng 0. Với $N$ thử độc lập, kỳ vọng của max trong $N$ biến chuẩn hóa xấp xỉ $\sqrt{2\ln N}$ đơn vị std, và std của một Sharpe estimate (annualized, đo trên $T$ năm) là $\approx 1/\sqrt{T}$. Nhân hai lại được ngưỡng "may thuần túy":

$$SR_0 \approx \sqrt{\frac{2\ln N}{T}} = \sqrt{\frac{2 \times \ln 1000}{10}} = \sqrt{\frac{2 \times 6.908}{10}} = \sqrt{1.382} \approx 1.18.$$

Đọc con số này cho lạnh gáy: **nếu bạn thử 1000 cấu hình vô dụng (true Sharpe = 0) trên 10 năm, cấu hình may nhất sẽ tự nhiên cho Sharpe ~1.18 — hoàn toàn do noise.** Bước 2: so Sharpe quan sát của cấu hình tốt nhất với ngưỡng này. Nếu best backtest của bạn cho Sharpe $= 1.2$, nó chỉ nhỉnh hơn ngưỡng may 1.18 một chút xíu; deflated Sharpe (xác suất Sharpe thật > 0 sau khi trừ selection) rơi về khoảng ~50% — tức đồng xu, đồ giả. Bước 3: chỉ khi Sharpe quan sát *vượt xa* $SR_0$ — ví dụ bạn thử $N=1000$ nhưng best cho Sharpe 2.2, cao hơn hẳn 1.18 — thì DSR mới cao và bạn có bằng chứng thật. Lưu ý cách $SR_0$ dịch chuyển: nếu bạn thử ít hơn, $N=100$ thay vì 1000, thì $SR_0=\sqrt{2\ln 100/10}=\sqrt{0.921}\approx 0.96$ — ngưỡng may hạ xuống, cùng một backtest Sharpe 1.2 bây giờ trông thuyết phục hơn hẳn. Kỷ luật không nằm ở con số Sharpe, mà ở việc bạn có trung thực khai đúng $N$ hay không.

Hệ quả thực hành, cần khắc vào não: **đếm mọi thí nghiệm bạn đã chạy.** Nếu bạn không log số cấu hình đã thử, bạn không thể tính $N$, không thể tính $SR_0$, và bạn *sẽ* tin cấu hình may nhất. Đây là lý do research log không phải thủ tục hành chính mà là công cụ chống tự lừa. Mỗi lần bạn "thử thêm một lookback nữa xem sao", $N$ tăng, $SR_0$ tăng, và cái bar để một kết quả là thật cũng cao lên. Người nghiệp dư tối ưu Sharpe; người chuyên nghiệp tối ưu Sharpe *trừ đi* cái giá của số lần thử. Và cái bẫy tinh vi nhất là những thí nghiệm bạn không nhận ra mình đã chạy: mỗi lần bạn nhìn một biểu đồ, thấy nó xấu, rồi lặng lẽ đổi tham số — đó cũng là một lần thử, cũng phải tính vào $N$, dù bạn không viết code mới. Overfitting phần lớn xảy ra qua con mắt người nghiên cứu, không qua grid search.

## 22.4 Sizing và sống sót: nửa còn lại của edge

Có một khoảng trống mà người mới hay bỏ, và nó giết nhiều tài khoản hơn cả overfitting: ngay cả khi bạn có edge thật, đặt cược *quá nặng* vẫn phá sản bạn. Fundamental Law nói bạn có bao nhiêu edge; Kelly nói bạn được phép đặt bao nhiêu để edge đó không tự giết bạn. Đây là mảnh mà lộ trình đọc bắt buộc phải chạm tới, vì LTCM ở mục sau chết đúng ở đây chứ không phải ở tín hiệu.

Kelly criterion cho một cược đơn giản với xác suất thắng $p$, thua $q=1-p$, tỷ lệ even-money: phần vốn tối ưu để tối đa hóa tốc độ tăng trưởng log dài hạn là $f^* = p - q$. Ví dụ số nối mạch cuốn sách: đồng xu thiên vị 55/45 cho $f^* = 0.55 - 0.45 = 0.10$ — đặt 10% vốn mỗi cược. Tốc độ tăng trưởng log kỳ vọng mỗi cược tại $f$ là $g(f) = p\ln(1+f) + q\ln(1-f)$. Cắm số: tại full-Kelly $f=0.10$, $g = 0.55\ln 1.1 + 0.45\ln 0.9 \approx 0.00501$/cược. Bây giờ so ba mức. Half-Kelly $f=0.05$ cho $g \approx 0.00375$ — tức bạn giữ được $0.00375/0.00501 \approx 75\%$ tốc độ tăng trưởng nhưng chỉ chịu một nửa variance của position, một cái deal cực kỳ hời về mặt rủi ro. Double-Kelly $f=0.20$ cho $g \approx -0.00014$ — **âm**: đặt gấp đôi Kelly biến một edge dương thành tăng trưởng dài hạn bằng 0 hoặc âm, bạn đúng về hướng nhưng vẫn phá sản vì cỡ lệnh. Đây là toàn bộ triết lý sizing gói trong ba con số: full-Kelly là biên của sự điên rồ, half-Kelly là chỗ người trưởng thành đứng.

Với danh mục liên tục (return chuẩn, không phải cược nhị phân), Kelly có dạng gọn $f^* = \mu/\sigma^2$: tỷ lệ giữa excess return kỳ vọng và variance. Ví dụ: một chiến lược có $\mu = 10\%$/năm excess và $\sigma = 20\%$/năm cho $f^* = 0.10/0.20^2 = 0.10/0.04 = 2.5$ — tức Kelly "khuyên" leverage 2.5×. Và đây chính là cái bẫy chết người: full-Kelly leverage 2.5× nghe như một lời khuyên toán học đáng tin, nhưng nó cực kỳ nhạy với sai số ước lượng $\mu$. Nếu $\mu$ thật chỉ bằng một nửa cái bạn tưởng (điều xảy ra thường xuyên do overfit), thì leverage 2.5× của bạn giờ là *double-Kelly* trên edge thật — và ta vừa thấy double-Kelly cho tăng trưởng âm. Đây là cây cầu định lượng dẫn thẳng tới LTCM: họ có edge thật, nhưng leverage quanh 25–30× đẩy họ vượt xa cả full-Kelly trên edge *đã đo*, để rồi khi correlation bung ra năm 1998 và edge thật hóa nhỏ hơn nhiều so với ước lượng, cùng cỡ lệnh đó chuyển từ "tối đa tăng trưởng" sang "chắc chắn phá sản". Sizing không phải phần phụ của nghề; nó là cái van an toàn quyết định bạn còn sống để đặt cược tiếp hay không.

## 22.5 Kệ sách xếp theo vai

Bảng dưới là bản đồ mua sách theo mục đích. In đậm là sách bạn *phải* đọc, không phải nên đọc:

| Mục đích | Sách |
|---|---|
| Nhập môn thực dụng | Chan *Quantitative Trading* + *Algorithmic Trading*; Sinclair *Volatility Trading* |
| Khung institutional | **Grinold & Kahn *Active Portfolio Management***; Qian-Hua-Sorensen *Quantitative Equity Portfolio Management* |
| ML tài chính | **López de Prado *AFML***; Gu-Kelly-Xiu paper |
| Time series | Tsay *Analysis of Financial Time Series*; Hamilton (tra cứu, không đọc thẳng) |
| Stat-arb hiện đại | **Isichenko *Quantitative Portfolio Management*** |
| Microstructure | **Bouchaud et al. *Trades, Quotes and Prices***; Harris *Trading and Exchanges*; Cartea et al. |
| Risk premia | **Ilmanen *Expected Returns***; AQR papers (Asness et al.) |
| Văn hóa / lịch sử | **Zuckerman *The Man Who Solved the Market*** (RenTec); Mallaby *More Money Than God*; Lowenstein *When Genius Failed* (LTCM); Patterson *The Quants* |
| Phỏng vấn | Zhou *A Practical Guide to Quantitative Finance Interviews*; Crack *Heard on the Street*; Mosteller *50 Challenging Problems in Probability* |

Một chú thích về Zuckerman *The Man Who Solved the Market*: đọc nó không phải để học kỹ thuật (nó cố tình không tiết lộ signal của RenTec) mà để hiệu chỉnh *khẩu vị*. Nó cho bạn thấy Medallion đạt gross return khoảng 66%/năm trước phí trong ba thập kỷ không phải nhờ một insight thiên tài mà nhờ hàng nghìn signal edge-nhỏ, kỷ luật thống kê tàn nhẫn, và văn hóa "không ai được tin trực giác nếu không có bằng chứng số". Hãy đọc con số 66% qua lăng kính Fundamental Law để thấy nó *nhất quán* với mọi thứ cuốn sách đã dạy chứ không phải phép màu: nếu edge mỗi cược nhỏ tới mức IC dưới 0.01, thì để ra một IR đủ để nuôi return đó bạn cần breadth cỡ hàng trăm nghìn tới hàng triệu cược độc lập mỗi năm — đúng thứ một hệ thống high-frequency, universe rộng, holding-ngắn tạo ra. Medallion không vi phạm $IR = IC\sqrt{BR}$; họ đẩy $BR$ tới cực hạn mà không ai khác chạm được. Đó chính là toàn bộ tinh thần cuốn sách này, viết thành một câu chuyện có thật. Mallaby và Lowenstein cho mặt kia của đồng xu — LTCM cho thấy edge thật + leverage sai (vượt Kelly, như mục 22.4) + không hiểu limits to arbitrage = phá sản, dù có hai Nobel laureate trong phòng.

## 22.6 Nguyên tắc học — phiên bản P

Năm nguyên tắc dưới đây là phần tôi muốn bạn nhớ nếu quên hết những thứ còn lại. Chúng không phải mẹo; chúng là khác biệt giữa một người tự học ba năm mà vẫn dở và một người tự học một năm mà đã thuê được.

**Một — Dữ liệu thật, bẫy thật.** Mọi bài học Ch7 chỉ thấm khi bạn *tự phát hiện* một look-ahead bug trong code của chính mình. Học bằng project, không bằng đọc. Cụ thể: mọi khái niệm trong cuốn sách này đều được thiết kế để bạn *code lại trên dữ liệu thật*. Đọc về survivorship bias thì phải tự tải một universe có delisted names và đo xem Sharpe của một chiến lược tăng bao nhiêu khi bạn (sai lầm) chỉ dùng survivors — thường là +0.3 tới +0.5 Sharpe ảo. Con số đó, tự tay đo được, dạy bạn nhiều hơn mười trang lý thuyết, vì nó biến "survivorship bias là xấu" từ một câu khẩu hiệu thành một vết sẹo có kích thước đo được.

**Hai — Một chiến lược đào sâu tốt hơn mười chiến lược lướt.** Theo momentum 12-1 từ raw data → tín hiệu → backtest → cost → optimize → tearsheet → viết memo như nộp cho investment committee. Khi bạn đưa một chiến lược đi trọn con đường đó *một lần*, bạn học được mọi module của nghề trong ngữ cảnh nối liền: bạn sẽ tự tay thấy IC 0.025 biến thành Sharpe 0.9 rồi bị phí bào còn 0.75 rồi bị transfer coefficient bào tiếp. Mười chiến lược làm dở dang chỉ dạy bạn mười cách bắt đầu và không cách nào kết thúc.

**Ba — Đếm thí nghiệm của chính mình.** Giữ research log; tính DSR cho kết quả tốt nhất của bạn bằng đúng recipe ở mục 22.3. Đây là thói quen phân biệt researcher với người mơ mộng. Nếu bạn không thể trả lời "tôi đã thử bao nhiêu cấu hình để ra kết quả này", bạn không có quyền tin kết quả đó — vì không có $N$ thì không có $SR_0$, và không có $SR_0$ thì Sharpe 1.2 của bạn có thể là 1.18 của thuần may đội lốt.

**Bốn — Theo dõi live.** Chạy paper-trading tín hiệu của bạn vài tháng; khoảng cách giữa backtest và live dạy nhiều hơn mọi cuốn sách. Một chiến lược backtest Sharpe 1.5 mà live về 0.4 không phải thất bại — nó là *bài học đắt giá nhất* mà không sách nào truyền được, và nó có thể mổ xẻ thành từng phần cụ thể. Cái hụt 1.1 Sharpe đó gần như luôn phân rã được: một phần là deflation (backtest đã ăn một ít may trong selection, có thể 0.2–0.3 Sharpe khi bạn thử nhiều cấu hình), một phần là chi phí thực cao hơn giả định (impact và slippage bạn ước tính lạc quan, như square-root law ở 22.2 cảnh báo, dễ mất thêm 0.3–0.5), một phần là capacity và crowding (khi tiền vào thì chính bạn di chuyển giá, và người khác cùng tín hiệu làm alpha decay nhanh hơn). Học cách gán con số cho từng nguồn hụt đó — chính là học nghề. Sự sụp đổ từ 1.5 xuống 0.4 không phải nhiễu; nó là dữ liệu, và nó có cấu trúc.

**Năm — Học cả hai measure.** Vol trading, options flow, XVA hedging flows, dealer gamma positioning — những alpha thú vị nhất thập kỷ này nằm ở **ranh giới P/Q**, nơi rất ít người thông thạo cả hai ngôn ngữ. Khi dealer bán option, họ phải delta-hedge; dòng hedge đó là *flow có thể dự báo* trong measure $\mathbb{P}$ của bạn, sinh ra từ nhu cầu định giá trong measure $\mathbb{Q}$ của họ. Ai đọc được cả hai bên bảng cân đối này thấy alpha mà người chỉ biết một measure không thấy. Cuốn Q-world (`docs/q-world.md`) là nửa còn lại của bộ não đó.

## 22.7 Sang Q-world — và lời khép

Cuốn sách này dạy bạn kiếm tiền dưới measure thực $\mathbb{P}$: dự báo cái *sẽ* xảy ra, và đặt cược khi thị trường định giá sai. Cuốn Q-world dạy nửa đối ngẫu: định giá và hedge dưới risk-neutral measure $\mathbb{Q}$, thế giới của dealer sell-side, nơi câu hỏi không phải "cái gì sẽ xảy ra" mà "hedge cost là bao nhiêu để tôi không quan tâm cái gì xảy ra". Hai measure không phải hai môn học rời — chúng là hai mặt của cùng một thị trường. Girsanov nối chúng bằng toán; nhưng thực chiến nối chúng bằng *flow*: mọi lần một dealer định giá và hedge trong $\mathbb{Q}$, họ tạo ra order flow mà bạn săn được trong $\mathbb{P}$.

Nếu bạn chỉ mang một câu ra khỏi mười chín chương này, hãy để nó là câu này: **alpha là edge nhỏ nhân số lượng lớn, được đặt cược với cỡ lệnh sống sót, và được bảo vệ bởi kỷ luật thống kê chống lại chính bạn.** Đồng xu 51/49 không đáng gì; mười nghìn đồng xu 51/49 độc lập là Sharpe 2.0. Nhưng "độc lập" là ảo giác dễ tin nhất, "Sharpe 2.0" là con số dễ giả nhất, và ngay cả khi cả hai đều thật, đặt cược gấp đôi Kelly vẫn đưa tăng trưởng dài hạn của bạn về 0. Toàn bộ nghề này — từ purged CV tới deflated Sharpe tới transfer coefficient tới Kelly sizing tới paper-trading — là bộ máy để phân biệt edge thật với may mắn được kể lại thành câu chuyện, rồi đặt cược lên edge thật đó một cách không tự sát. Grinold-Kahn cho bạn ngôn ngữ, López de Prado cho bạn phòng thí nghiệm, Isichenko cho bạn sự thật về nghề, Ilmanen cho bạn bản đồ risk premia, và Zuckerman cho bạn thấy nó trông ra sao khi làm đúng suốt ba mươi năm.

Bây giờ đóng sách lại, mở terminal ra, tải dữ liệu thật, và tự tay dẫm lên cái bẫy look-ahead đầu tiên của bạn. Đó là chương thật sự bắt đầu.

# Phụ lục A: Ví dụ xuyên suốt — xây một book đa-tín-hiệu

Mọi chương trên đây, ghép lại, là một quy trình. Phụ lục này chạy quy trình đó **một lần, đầy đủ, bằng số cụ thể** — từ một câu giả thuyết viết trên khăn giấy cho đến một *book* đa-tín-hiệu có vol targeting, drawdown control, tearsheet đọc được từng dòng, và một memo đủ để đặt lên bàn investment committee. Đi hết được một vòng này là bạn đã "đi một vòng nghề": không phải học rời rạc từng mảnh, mà thấy các mảnh khớp vào nhau thành một cỗ máy. Ta sẽ không giấu một phép tính nào — mỗi con số quan trọng đều được dẫn ra từ những con số trước nó, để bạn có thể tự cầm bút làm lại và kiểm tra rằng cỗ máy không có bánh răng nào lỏng.

Một lưu ý về con số. Các số dưới đây là *điển hình* cho universe cổ phiếu Mỹ thanh khoản giai đoạn 2005–2024 — chúng đến từ hàng chục backtest công khai và từ trực giác của người đã ngồi trong pod shop. Số của bạn sẽ khác ở chữ số thứ hai; **hình dạng** thì không đổi. Momentum sẽ luôn có IC nhỏ và decay chậm; nó sẽ luôn crash trong regime đảo chiều; blend với tín hiệu không tương quan sẽ luôn nâng Sharpe theo đúng $\sqrt{\text{số tín hiệu độc lập}}$. Nếu số của bạn lệch hình dạng — IC ra 0.15, Sharpe ra 3.0 — thì gần như chắc chắn bạn có bug, không phải có mỏ vàng. Đó là bài học ngầm chạy suốt phụ lục này, và ta sẽ gặp lại nó ở mọi mắt xích.

## A.1 Giả thuyết — viết ra trước khi đụng một dòng dữ liệu (chương 7)

Mọi thứ bắt đầu bằng một câu, và câu đó phải viết ra *trước* khi mở terminal. Lý do rất thực dụng: một khi bạn đã thấy dữ liệu, não bạn sẽ tự bịa ra lý thuyết để khớp với những gì mắt đã trông thấy — đó là data snooping ở tầng nhận thức, còn nguy hiểm hơn cả overfitting bằng máy. Viết giả thuyết trước là cách cột tay chính mình.

Giả thuyết của ta:

> *"Cổ phiếu thắng lớn trong 12 tháng qua tiếp tục thắng trong 1–3 tháng tới, vì nhà đầu tư under-react với dòng tin tốt kéo dài và các quỹ đuổi theo hiệu suất (performance chasing)."*

Rồi trả lời ba câu hỏi mà bất kỳ QR giỏi nào cũng hỏi trước khi tin vào một alpha.

**Ai trả tiền cho tôi?** Người bán quá sớm cổ phiếu đang lên — disposition effect: nhà đầu tư nhỏ lẻ có xu hướng chốt lời sớm để "được cảm giác thắng" và ôm lỗ để "khỏi nhận mình sai". Họ bán winner quá sớm, tạo ra under-reaction mà tôi thu hoạch. Cộng thêm người neo (anchoring) vào giá mua cũ nên phản ứng chậm với thông tin mới.

**Vì sao nó chưa bị arbitrage cho chết?** Momentum đã công khai trong sách giáo khoa suốt 30 năm — Jegadeesh & Titman 1993, Carhart 1997, UMD là một factor ai cũng biết. Nếu nó là bữa trưa miễn phí thì đã bị ăn sạch. Nó *không* miễn phí: nó **đau đớn định kỳ**. Momentum crash — như 2009, khi thị trường đảo chiều dữ dội và short leg (những cổ phiếu đã rớt thảm) bật lên 80% — khiến ít nhà đầu tư nào dám giữ đủ lâu và đủ đòn bẩy. Tôi được trả công vì tôi chịu ôm cái rủi ro tail đó khi người khác chạy. Đây là risk premium, không phải mispricing thuần túy, và phân biệt được hai thứ này quyết định cách tôi size vị thế sau này.

**Tôi kỳ vọng chữ ký thống kê nào?** IC nhỏ (bậc 0.02, không phải 0.2); decay chậm (tuần đến tháng, không phải giờ); turnover thấp đến vừa; và một cái chết được báo trước — chết trong regime đảo chiều mạnh sau một đợt bán tháo. Viết trước những kỳ vọng này cực kỳ quan trọng: nếu backtest cho ra IC 0.15 và turnover cao, tôi biết ngay là *sai với chính giả thuyết của mình* và phải đi tìm bug, chứ không phải ăn mừng.

Từ đây, ta mở một cuốn sổ thí nghiệm. Trên đầu ghi: **1 giả thuyết**. Mọi biến thể ta thử về sau — mỗi lookback, mỗi cách winsorize, mỗi tín hiệu thêm vào — là +1 vào bộ đếm $N$. Bộ đếm này sẽ quay lại cắn ta ở A.9 khi tính deflated Sharpe, nơi mỗi lần thử thiếu kỷ luật hôm nay biến thành một điểm cộng vào ngưỡng nhiễu ngày mai. Không đếm trung thực ở đây thì mọi thứ về sau là tự lừa mình.

## A.2 Dữ liệu — nền móng mà 90% sai sót nằm ở đó (chương 2)

Universe phải **point-in-time (PIT)**. Ta lấy top 1000 cổ phiếu US theo vốn hóa *tại từng thời điểm trong quá khứ*, chứ không phải top 1000 của hôm nay áp ngược về 2005. Sự khác biệt này là survivorship bias: nếu dùng universe hôm nay, ta vô tình chỉ chọn những công ty đã sống sót, và momentum sẽ trông đẹp giả tạo vì ta đã loại sẵn những kẻ thua cuộc đi vào phá sản. Universe PIT bắt buộc phải chứa **delisted names cùng delisting returns** — khi một cổ phiếu bị hủy niêm yết vì phá sản, return cuối của nó thường là −100%, và bỏ sót nó là bỏ sót đúng cái đuôi trái mà chiến lược phải chịu.

Cái giá của việc bỏ sót không trừu tượng — đo được bằng số. Giả sử mỗi năm có ~2% số tên trong universe biến mất vì phá sản với delisting return trung bình −80%, và giả sử momentum của ta hay long trúng chúng ở đúng leg sai (một cổ phiếu rớt sâu rồi phá sản có momentum âm, nên nằm ở short leg — nhưng nếu bug ngược dấu hoặc universe không PIT khiến nó biến mất *êm ru* thay vì lỗ −80%): riêng khoản này có thể thổi phồng return hàng năm cỡ $2\% \times 80\% = 1.6\%$/năm ảo. Trên một chiến lược thật chỉ kiếm 7%/năm gross, 1.6% ảo là gần một phần tư lợi nhuận đến từ hư không. Đó là lý do PIT không phải sự cầu toàn học thuật mà là chênh lệch giữa một Sharpe thật và một Sharpe tưởng tượng.

Khoảng thời gian: 2005–2024, tức 20 năm, khoảng 5000 ngày giao dịch. Ta **cắt 2022–2024 ra làm holdout và không chạm vào** cho đến đúng một lần cuối cùng ở A.9. Train trên 2005–2018 (14 năm, đây chính là $T=14$ sẽ xuất hiện trong deflated Sharpe), có thể dùng 2019–2021 làm validation. Kỷ luật holdout là thứ phân biệt nghiên cứu thật với nghiên cứu tự sướng.

Ba loại giá cho ba mục đích khác nhau, và trộn lẫn chúng là một lỗi kinh điển. **Adjusted close** (đã điều chỉnh split và dividend) dùng để tính return và tín hiệu. **Raw price cộng ADV** (average daily volume) dùng để mô phỏng trade — vì bạn giao dịch ở giá thật, không ở giá đã điều chỉnh, và market impact phụ thuộc kích thước lệnh so với ADV. **Borrow fee** cho leg short — momentum short những cổ phiếu đã rớt, mà đó thường là những tên khó vay và đắt, có khi 5–20%/năm; bỏ qua borrow fee là tự tô hồng backtest. Một minh họa nhanh về sức nặng của khoản này: nếu short leg bình quân chịu borrow 6%/năm và nó chiếm 1x gross, riêng borrow đã ăn 6% × (tỉ trọng thời gian nắm short) — với danh mục nắm short gần như liên tục, đó là một cú trừ thẳng cỡ vài phần trăm return mỗi năm mà một backtest cẩu thả giả vờ không thấy.

Trước khi làm bất cứ thứ gì khác, chạy sanity checks. Vẽ phân phối daily return từng năm và nhìn cái đuôi: nếu 2008 mà đuôi mỏng như 2017 thì dữ liệu sai. Đếm số tên trong universe theo thời gian: một cú rớt đột ngột từ 1000 xuống 600 là dấu hiệu một nguồn dữ liệu bị thủng, không phải thị trường co lại. Spot-check bằng tay 5 vụ split/merger nổi tiếng — ví dụ split 7:1 của Apple tháng 6/2014: nếu adjusted close không liền mạch qua ngày đó thì adjustment sai và mọi return quanh đó là rác. Một giờ làm việc ở bước này tiết kiệm ba tuần đuổi theo một alpha ma.

## A.3 Tín hiệu momentum — dựng và đo từng bước (chương 6)

Bây giờ mới đến công thức. Ta xây tín hiệu **12-1 momentum** qua bốn bước, mỗi bước có lý do tồn tại.

```
raw_i,t   = tổng log-return của i từ t−252 đến t−21   (12 tháng, bỏ tháng gần nhất)
w1        = winsorize raw tại ±3 MAD theo cross-section
n1        = residual của w1 sau hồi quy cross-section lên
            {sector dummies, log(mktcap), beta}
signal    = z-score cross-section của n1, rồi EMA 5 ngày
```

**Vì sao bỏ tháng gần nhất (skip the last month)?** Return 1 tháng gần nhất bị mean-reversion ngắn hạn cắn ngược — cổ phiếu vừa tăng mạnh tuần trước thường điều chỉnh giảm, do bid-ask bounce và liquidity provision. Tính từ t−252 đến t−21 (bỏ 21 ngày cuối) tách phần momentum bền khỏi phần reversal nhiễu. Đây không phải chi tiết vụn: bỏ hay không bỏ tháng cuối thay đổi Sharpe cỡ 0.2 — trên một chiến lược có Sharpe ~0.9, đó là hơn 20% chất lượng đến từ một dòng code duy nhất.

**Vì sao winsorize ±3 MAD?** MAD (median absolute deviation) chống outlier tốt hơn standard deviation vì bản thân nó không bị outlier kéo. Một cổ phiếu tăng 400% trong năm (thường do M&A hoặc pump) sẽ có raw momentum khổng lồ và nếu không cắt, nó một mình lái cả decile. Cắt tại ±3 MAD giữ tín hiệu robust. Cụ thể: với phân phối gần chuẩn, $1\,\text{MAD} \approx 0.6745\,\sigma$, nên ngưỡng $3\,\text{MAD} \approx 2.02\,\sigma$ — ta đang cắt ở khoảng hai độ lệch chuẩn, đủ chặt để thuần hóa cái đuôi mà không cắt cụt phần tín hiệu tốt ở giữa.

**Vì sao neutralize sector, size, beta?** Nếu không, "momentum" của ta thực chất là "đang long ngành công nghệ và short ngành năng lượng" — ta thu hoạch một cú xoay ngành chứ không phải hiệu ứng momentum thuần. Hồi quy cross-section lên sector dummies, log(mktcap) và beta, rồi lấy residual, tách phần momentum *sau khi đã trung hòa* những phơi nhiễm ta không muốn được trả tiền để mang. Kiểm chứng cụ thể: nếu chưa neutralize, hồi quy return chiến lược lên các sector return sẽ cho $R^2$ đáng kể (một phần lớn biến động P&L đến từ ngành); sau neutralize, $R^2$ đó tụt về gần 0, và đó là bằng chứng số cho thấy ta đang cầm momentum thuần chứ không phải một cú cược ngành trá hình.

**Vì sao z-score rồi EMA 5 ngày?** Z-score cross-section đưa mọi ngày về cùng thang đo (mean 0, std 1) để so sánh và kết hợp về sau. EMA 5 ngày làm mượt tín hiệu, giảm turnover mà gần như không mất alpha vì momentum vốn decay chậm — với EMA span 5, trọng số của ngày hôm nay chỉ ~$2/(5+1) \approx 33\%$, phần còn lại là quá khứ gần, nên một cú nhiễu một ngày không thể giật vị thế.

Giờ **đo** trên train 2005–2018. Rank-IC — tương quan Spearman giữa tín hiệu hôm nay và forward return 21 ngày — trung bình ra **≈ 0.025**. Nghe cực nhỏ, và đúng là nhỏ: nó nghĩa là tín hiệu chỉ giải thích được cỡ $0.025^2 = 0.000625 \approx 0.06\%$ phương sai return. Sáu phần vạn — gần như không có gì. Nhưng nhớ luật số lớn của alpha: edge nhỏ nhân breadth lớn thành Sharpe dùng được, đúng như đồng xu 51/49 cho Sharpe/cược 0.02 mà 2500 cược độc lập nâng thành $0.02\sqrt{2500}=1.0$. Std(IC) qua các tháng ≈ 0.11, nên IC risk-adjusted mỗi tháng $= 0.025/0.11 \approx 0.23$. Đây chính là "Sharpe của IC" — một tháng điển hình, tín hiệu đúng hướng nhưng ồn ào; kỳ vọng dương nhỏ chìm trong một biển nhiễu gấp bốn lần nó, và chỉ có sự lặp lại qua hàng trăm tháng mới kéo tín hiệu nổi lên.

Decay: IC ở horizon 21 ngày là 0.025, ở 63 ngày còn ≈ **0.015**. Tính ra tỉ lệ giữ lại $0.015/0.025 = 0.60$, tức tín hiệu mất $1-0.60 = 40\%$ sức mạnh sau một quý — chậm, đúng như giả thuyết A.1 đã tiên đoán. Từ tốc độ decay này ta đọc ra **holding period mục tiêu 1–2 tháng**: giữ ngắn hơn thì trả phí giao dịch vô ích, giữ dài hơn thì tín hiệu đã tàn. Có thể hình dung decay như phân rã bán mũ: nếu IC tụt từ 0.025 xuống 0.015 sau 42 ngày (từ horizon 21 lên 63), half-life xấp xỉ $42 \times \ln 2 / \ln(0.025/0.015) \approx 42 \times 0.693/0.511 \approx 57$ ngày — cùng bậc với holding period ta chọn, một sự nhất quán nội tại đáng tin. Autocorrelation của tín hiệu ngày-qua-ngày ≈ 0.995 — cực cao, nghĩa là tín hiệu hôm nay gần như hôm qua, nên **turnover tự nhiên thấp**, khớp kỳ vọng.

Và câu thần chú: nếu bạn đo ra IC = 0.15, **đừng mở champagne — đi tìm bug look-ahead trước**. Kinh nghiệm phòng thí nghiệm: 9 trên 10 lần một IC đẹp bất thường là do tín hiệu vô tình nhìn thấy tương lai (dùng adjusted close chứa dividend chưa xảy ra, dùng universe của hôm nay, hay lệch một ngày trong việc canh lịch). IC 0.025 mà sạch đáng giá hơn IC 0.15 mà bẩn gấp trăm lần — vì cái sạch sống sót ra live, cái bẩn bốc hơi ngay ngày đầu tiên bỏ tiền thật.

## A.4 Backtest danh mục giấy — sự thật đầu tiên (chương 7, 9)

Backtest phải **event-driven**, không phải vectorized cẩu thả. Ta rebalance cuối mỗi tháng, và điểm mấu chốt: khớp lệnh tại **giá close của ngày *hôm sau*** ngày tính tín hiệu. Chậm một ngày này khiến ta trả giá vài bps hiệu suất, nhưng đổi lại là sạch tuyệt đối look-ahead — ta không bao giờ giao dịch ở cùng giá close mà ta dùng để tính tín hiệu, vì trong đời thực bạn tính tín hiệu *sau* khi thị trường đóng cửa và chỉ có thể vào lệnh phiên kế tiếp.

Cấu trúc danh mục: long decile 10 (momentum cao nhất), short decile 1 (thấp nhất), equal-weight trong mỗi decile, **dollar-neutral** (tổng long = tổng short) và **beta-neutral** (scale từng leg để beta ròng ≈ 0). Dollar-neutral loại rủi ro thị trường bậc một; beta-neutral loại phần còn lại theo CAPM. Cái ta còn lại là momentum thuần. Với top-1000 universe, mỗi decile chứa ~100 tên, nên long ~100 và short ~100 — đây là nguồn breadth cổ điển: hàng trăm cược nhỏ cùng lúc, mỗi cược một hạt edge, cộng lại thành tín hiệu đọc được.

Chi phí — nơi nhiều backtest chết khi ra đời thật. Ta mô hình hóa ba thành phần. **Spread/2** theo từng tên (large-cap median ~3bps, small-cap rộng hơn nhiều). **Market impact** theo công thức square-root $\text{impact} = c\,\sigma\sqrt{Q/V}$ với $c \approx 0.7$, $\sigma$ là vol ngày của cổ phiếu, $Q/V$ là kích thước lệnh trên ADV. **Borrow fee** thực tế cho leg short. Một ví dụ số cho impact: mua một tên với $Q/V = 5\%$ ADV, vol ngày $\sigma = 2\%$, thì

$$\text{impact} = 0.7 \times 2\% \times \sqrt{0.05} = 0.7 \times 2\% \times 0.2236 = 0.00313 \approx 0.31\% = 31\text{bps}.$$

Với turnover thấp của momentum, tổng chi phí không giết chiến lược — nhưng phải tính, không được giả vờ nó bằng 0.

Kết quả điển hình trên train: return **~7%/năm** trên gross exposure 2x (1x long + 1x short), vol **~9%/năm**, nên **Sharpe trước phí $\approx 7/9 = 0.78$**, làm tròn lên **~0.9** khi tính cả compounding và các năm tốt kéo bình quân lên. Sau khi trừ toàn bộ chi phí ở trên, Sharpe rớt còn **~0.75** — turnover thấp cứu ta, một chiến lược turnover cao với cùng gross Sharpe có thể mất nửa số đó. Về P&L attribution: long leg đóng góp ~65% lợi nhuận, short leg phần còn lại (và short leg mang phần lớn rủi ro tail — nó là cái leg sẽ nổ tung trong crash).

Và đây là drawdown: MDD **~−25%, tập trung gần như trọn vẹn vào năm 2009**. Đây là **momentum crash** kinh điển — sau đáy tháng 3/2009, thị trường đảo chiều dữ dội, những cổ phiếu rác đã rớt 80% (nằm trong short leg của ta) bật lên gấp đôi, và short leg thổi bay lợi nhuận tích lũy hàng năm trong vài tuần. Con số này *phải* xuất hiện; nếu backtest của bạn không có nó, bạn đã vô tình loại 2009 hoặc dùng dữ liệu không PIT — nghịch lý đẹp của nghề: một cái backtest quá đẹp là bằng chứng của một cái bug, không phải một cái mỏ.

Bước kiểm định cuối và quan trọng nhất về mặt trí tuệ: **hồi quy return của chiến lược lên Fama-French 5 factor + UMD**. Kết quả: loading trên UMD (up-minus-down, chính là factor momentum) ≈ **0.9**, và **alpha residual ≈ 0**. Dịch ra tiếng người: chiến lược này *chính là* factor momentum công khai, nó không có alpha độc quyền. Kết luận đúng đắn không phải "thất bại" mà là: **"đây là một baseline đúng chuẩn, sạch sẽ."** Ta không đem cái này đi gọi vốn — ai cũng có nó, và một nhà phân bổ vốn tỉnh táo sẽ hỏi "tôi mua UMD ETF cho rẻ, cần gì trả 2-and-20 cho anh?". Giá trị của cả bài tập nằm ở chỗ *pipeline đã sạch*: giờ mọi ý tưởng mới đều có chỗ cắm vào và có baseline để đo alpha gia tăng. Đó mới là điểm khởi hành thật.

## A.5 Cải tiến momentum có kỷ luật — risk-managed (chương 6.3, 14)

Baseline đã đứng vững; giờ cải tiến, nhưng mỗi cải tiến là +1 vào bộ đếm thí nghiệm và phải qua hai cửa: (a) có cơ chế kinh tế hiểu được, không phải may rủi; (b) sống sót khi kiểm tra tính trơn theo tham số.

Cải tiến đầu tiên nhắm thẳng vào tử huyệt đã lộ ở A.4: momentum crash. Văn học (Barroso & Santa-Clara, Daniel & Moskowitz) chỉ ra rằng crash không đến ngẫu nhiên — nó đến khi *vol của chính factor momentum* dâng cao. Ý tưởng **risk-managed momentum**: scale exposure tỉ lệ nghịch với vol dự báo của factor, tức

$$w_t = w_{\text{base}} \cdot \frac{\sigma_{\text{target}}}{\hat\sigma_{t}^{\text{mom}}}.$$

Khi vol momentum bình thường (~9%/năm), ta chạy full size. Khi vol nhảy vọt (như cuối 2008, báo hiệu crash sắp đến), $\hat\sigma_t^{\text{mom}}$ tăng, tỉ số co lại, ta tự động giảm exposure *trước khi* crash đánh trọn. Một ví dụ số: nếu $\sigma_{\text{target}} = 9\%$ và vol dự báo tháng đó là $\hat\sigma_t^{\text{mom}} = 18\%$, thì hệ số scale $= 9/18 = 0.5$ — ta chỉ chạy nửa size, cắt phân nửa cú đánh crash. Và cái đẹp của cơ chế nằm ở phi tuyến của thiệt hại: nếu crash gây lỗ tỉ lệ với *bình phương* exposure trong đuôi (vì cả position lẫn vol cùng phóng đại), thì chạy nửa size không chỉ cắt nửa lỗ mà có thể cắt tới ba phần tư. Kiểm chứng trên train: risk-managed momentum nâng Sharpe thêm **~+0.15** (từ 0.75 lên ~0.90 sau phí) *và* làm nông đáng kể MDD 2009. Cơ chế hiểu được, cải tiến trơn → **giữ**. Đây là ví dụ mẫu mực của một cải tiến "đáng tin": nó sửa đúng cái điểm yếu mà lý thuyết dự báo, chứ không phải tô điểm một góc backtest ngẫu nhiên.

## A.6 Từ một tín hiệu thành một book — kết hợp momentum, quality, PEAD (chương 6, 11)

Đây là bước biến "một chiến lược" thành "một *book*", và là trái tim của phụ lục mở rộng này. Fundamental Law of Active Management cho ta la bàn:

$$IR \approx IC \cdot \sqrt{BR}$$

với $IR$ là information ratio, $IC$ là kỹ năng trung bình mỗi lần cược, $BR$ là breadth — số cược *độc lập* mỗi năm. Có hai cách tăng $IR$: tăng $IC$ (rất khó, momentum đã cho ta 0.025 và nâng nó là cuộc chiến trường kỳ) hoặc tăng $BR$. Và breadth không chỉ đến từ số cổ phiếu — nó đến từ **số nguồn tín hiệu độc lập**. Đây là insight then chốt: thêm một tín hiệu *không tương quan* với momentum giống như thêm cả một chiều breadth mới, một trục cược hoàn toàn tách biệt.

Ta chọn thêm hai tín hiệu, mỗi cái có câu chuyện riêng và, quan trọng hơn, mỗi cái ăn tiền từ một loại người khác:

**Quality** — long công ty có ROE cao, đòn bẩy thấp, earnings ổn định; short ngược lại. Ai trả tiền: nhà đầu tư mê "câu chuyện tăng trưởng" định giá quá cao những công ty lởm hào nhoáng. Đây là một premium bền, chậm, gần như trực giao với momentum vì momentum nhìn *giá*, quality nhìn *báo cáo tài chính*. Đo riêng trên train, quality cho rank-IC ~0.020 với std(IC) ~0.09 và turnover rất thấp (fundamentals đổi mỗi quý), quy ra Sharpe đơn lẻ sau phí ~0.80.

**PEAD** (post-earnings-announcement drift) — sau một cú beat earnings bất ngờ, cổ phiếu tiếp tục drift lên trong nhiều tuần vì thị trường under-react với tin. Ai trả tiền: nhà đầu tư phản ứng chậm với thông tin kế toán. PEAD là một event-driven signal, decay nhanh hơn momentum (holding vài tuần), tương quan thấp với cả hai cái kia. Đo riêng: rank-IC quanh ngày sự kiện cao hơn (~0.04) nhưng chỉ sống trong cửa sổ hẹp và turnover cao hơn, nên sau phí cũng về Sharpe đơn lẻ ~0.85.

Đo tương quan **P&L từng đôi** trên train — không phải tương quan tín hiệu mà tương quan chuỗi lợi nhuận, vì đó mới là cái quyết định diversification:

| | Momentum | Quality | PEAD |
|---|---|---|---|
| **Momentum** | 1.00 | 0.22 | 0.28 |
| **Quality** | 0.22 | 1.00 | 0.15 |
| **PEAD** | 0.28 | 0.15 | 1.00 |

Mọi cặp có **correlation P&L < 0.3** — đủ độc lập để diversification hoạt động mạnh. Giờ tính lợi ích cụ thể. Ba sleeve có Sharpe đơn lẻ sau phí xấp xỉ bằng nhau — momentum risk-managed 0.90, quality ~0.80, PEAD ~0.85 — bình quân gọi là $s \approx 0.85$. Nếu ba sleeve **hoàn toàn độc lập** ($\rho = 0$) và ta blend equal-weight, Sharpe tổ hợp $= s\sqrt{3} = 0.85 \times 1.732 \approx 1.47$. Nhưng chúng không hoàn toàn độc lập; với ma trận tương quan trên, hệ số khuếch đại thực tế nhỏ hơn $\sqrt{3}$. Công thức Sharpe của một tổ hợp equal-weight $n$ sleeve cùng Sharpe $s$ và tương quan trung bình $\bar\rho$ (dẫn từ chỗ variance của trung bình $n$ chuỗi cùng vol là $\frac{1}{n}[1+(n-1)\bar\rho]$ lần variance một chuỗi, còn kỳ vọng thì bằng nhau):

$$SR_{\text{book}} = s \cdot \frac{\sqrt{n}}{\sqrt{1 + (n-1)\bar\rho}}.$$

Với $n=3$ và $\bar\rho = (0.22 + 0.28 + 0.15)/3 = 0.65/3 = 0.217$:

$$SR_{\text{book}} = 0.85 \cdot \frac{\sqrt{3}}{\sqrt{1 + 2 \times 0.217}} = 0.85 \cdot \frac{1.732}{\sqrt{1.434}} = 0.85 \cdot \frac{1.732}{1.198} = 0.85 \cdot 1.446 \approx 1.23.$$

Trên giấy ra ~1.23; sau khi tính đến chi phí giao dịch tăng do turnover cao hơn (PEAD rebalance thường xuyên), overlap ròng giữa các leg (khi cùng long một cổ phiếu ta nets vị thế và tiết kiệm phí, nhưng khi ngược chiều ta churns), và một chút slippage ước lượng, con số thực tế hạ về **Sharpe tổ hợp ~1.1**. Cái haircut ~0.13 từ 1.23 xuống 1.1 chính là "thuế ma sát" của việc ghép ba sleeve chạy trên cùng một universe: chúng giẫm chân nhau ở tầng execution ngay cả khi P&L của chúng độc lập. Đây đúng là tinh thần Fundamental Law: ta không nâng $IC$ của bất kỳ tín hiệu nào, ta nâng $IR$ **qua breadth** — bằng cách thêm những nguồn cược độc lập. Nhảy từ 0.90 lên 1.1 nghe khiêm tốn, nhưng trên một book vài trăm triệu đô, mỗi 0.1 Sharpe là hàng triệu đô P&L rủi ro-điều chỉnh mỗi năm, và quan trọng hơn, book đa tín hiệu **ít phụ thuộc vào việc một câu chuyện đơn lẻ tiếp tục đúng** — nếu momentum tắc một năm, quality và PEAD gánh, và cả book không chết theo một câu chuyện.

Còn một cải tiến kỷ luật nữa cần nhắc: khi thử lookback cho momentum, ta thử **5 giá trị** (6-1, 9-1, 12-1, 12-2, 18-1) và **cố tình *không* chọn cái Sharpe cao nhất**. Thay vào đó ta kiểm tra kết quả có **trơn theo tham số** không — nếu 12-1 cho Sharpe 0.90 còn hai hàng xóm 9-1 và 12-2 cho 0.86 và 0.88 thì bề mặt trơn, tín hiệu thật. Nếu 12-1 cho 1.4 còn hàng xóm cho 0.5 thì đó là một cái đỉnh nhọn của overfitting và ta không tin nó — một alpha thật là một cao nguyên rộng, không phải một mũi kim. Ta giữ 12-1 chuẩn vì lý thuyết, không vì nó thắng cuộc thi. Mỗi giá trị đã thử vẫn +1 vào bộ đếm — giờ $N$ đã lên hàng chục, và cái giá của sự trung thực đó ta sẽ trả sòng phẳng ở A.9.

## A.7 Portfolio construction — optimize có ràng buộc, TC-aware (chương 11)

Ba tín hiệu cho ta ba vector kỳ vọng return; giờ phải biến chúng thành **một** vector trọng số $w$ để giao dịch. Cách ngây thơ là blend z-score rồi long-short decile như cũ. Cách của một book thật là **mean-variance optimization có ràng buộc và có ý thức chi phí (TC-aware)**.

Trước hết phải trả lời một câu mà A.4 và A.6 đã lướt qua: làm sao biến một z-score (đại lượng vô thứ nguyên, mean 0 std 1) thành một *kỳ vọng return* thật để nạp vào optimizer? Đây là chỗ Grinold's alpha rule vào cuộc:

$$\alpha_i = IC \cdot \sigma_i \cdot z_i,$$

trong đó $\sigma_i$ là vol của return dự báo trên horizon, $z_i$ là z-score tín hiệu của tên $i$, và $IC$ là information coefficient của tín hiệu. Trực giác: $IC$ nói tín hiệu "đáng tin bao nhiêu", $\sigma_i$ đưa nó về đúng đơn vị return, $z_i$ nói tên này lệch khỏi trung bình bao xa. Một ví dụ số cụ thể: một cổ phiếu có $z_i = 2$ (tín hiệu momentum mạnh, cao hơn hai độ lệch chuẩn so với cross-section), vol tháng $\sigma_i = 6\%$, và $IC = 0.025$, thì kỳ vọng alpha một tháng của nó là

$$\alpha_i = 0.025 \times 6\% \times 2 = 0.003 = 30\text{bps/tháng}.$$

Đọc ra: dù tín hiệu rất mạnh ($z=2$ là hiếm), kỳ vọng chỉ 30bps/tháng — một lời nhắc tỉnh táo rằng edge từ một tín hiệu $IC=0.025$ luôn khiêm tốn, và chính vì nó khiêm tốn mà chi phí giao dịch mới trở thành kẻ thù sống còn. Với ba tín hiệu, ta tính $\alpha_i$ cho mỗi cái rồi blend (theo trọng số nghịch với vol hoặc theo một risk-parity nhẹ trên các sleeve) thành một vector $\alpha$ duy nhất.

Bài toán: cực đại hóa utility

$$\max_w \; \alpha^\top w - \frac{\lambda}{2} w^\top \Sigma w - \kappa \, \|w - w_{\text{prev}}\|_{\text{TC}}.$$

Số hạng thứ nhất là kỳ vọng return (vector $\alpha$ vừa dựng). Số hạng thứ hai phạt rủi ro, với $\Sigma$ là covariance ước lượng — và ở đây ta không dùng sample covariance thô (nó nhiễu kinh khủng với vài nghìn cổ phiếu) mà dùng **factor risk model** hoặc **shrinkage/RMT denoise** để có $\Sigma$ ổn định. Số hạng thứ ba là chi phí giao dịch, phạt khoảng cách từ danh mục cũ $w_{\text{prev}}$ — đây là phần "TC-aware": optimizer *biết* rằng thay đổi vị thế tốn tiền, nên nó chỉ giao dịch khi tín hiệu mới đủ mạnh để bù phí. Đây là lý do một book thật có turnover thấp hơn tổng turnover của các sleeve rời rạc: optimizer nets các lệnh ngược chiều nhau trước khi ra thị trường.

Ràng buộc bắt buộc:

- **Dollar-neutral**: $\sum_i w_i = 0$.
- **Beta-neutral**: $\sum_i \beta_i w_i = 0$.
- **Sector-neutral**: $\sum_{i \in s} w_i = 0$ cho mỗi sector $s$ — không đặt cược ngành ngoài ý muốn.
- **Position cap**: $|w_i| \le 3\%$ gross — không một tên nào chi phối book.
- **Gross cap**: $\sum_i |w_i| \le 2$ — kiểm soát đòn bẩy.

Một ví dụ số cho thấy TC-awareness thay đổi hành vi. Giả sử một cổ phiếu có $\alpha$ mới tương ứng kỳ vọng +8bps/tháng (dùng đúng Grinold rule ở trên: một tín hiệu $z$ vừa phải), nhưng để đạt trọng số mục tiêu ta phải trade $Q/V = 4\%$ ADV, tốn impact

$$\text{impact} = 0.7 \times 2\% \times \sqrt{0.04} = 0.7 \times 2\% \times 0.2 = 0.0028 = 28\text{bps}$$

một chiều. Optimizer ngây thơ sẽ trade toàn bộ ngay; optimizer TC-aware thấy 28bps phí ăn hết $28/8 = 3.5$ tháng alpha, nên nó **trade từng phần**, dịch chuyển $w$ dần qua nhiều ngày, hoặc bỏ qua nếu tín hiệu quá yếu so với phí. Chính cơ chế này giữ Sharpe sau phí gần Sharpe trước phí — nó là hiện thân bằng toán của câu châm ngôn "đừng nhặt xu trước xe lu": chỉ trade khi miếng alpha to hơn cái phí phải trả để lấy nó.

## A.8 Vol targeting và drawdown control — tầng danh mục (chương 14)

Optimizer cho ta *hình dạng* danh mục (tên nào, tỉ trọng tương đối); vol targeting quyết định *độ lớn* tổng thể, và nó nâng Sharpe thực nhận theo một cách tinh tế mà nhiều người bỏ lỡ.

**Vol targeting.** Ta cố định vol *thực hiện* của book ở một mức mục tiêu, ví dụ $\sigma_{\text{target}} = 10\%/\text{năm}$. Mỗi ngày ta dự báo vol book bằng EWMA của return gần đây và scale toàn bộ exposure:

$$L_t = \frac{\sigma_{\text{target}}}{\hat\sigma_t}.$$

Ví dụ: nếu EWMA dự báo vol hiện tại $\hat\sigma_t = 14\%$ (thị trường đang động), thì leverage $L_t = 10/14 = 0.71$ — ta co exposure xuống 71%. Nếu $\hat\sigma_t = 7\%$ (thị trường lặng), $L_t = 10/7 = 1.43$ — ta nới lên 143%. Vì sao điều này nâng Sharpe? Vì return có **vol clustering** (chương GARCH): vol cao thường đi kèm return kém và tail xấu; co lại đúng lúc đó tránh được phần lớn thiệt hại. Về mặt số, hãy hình dung hai regime chia đôi thời gian — regime tĩnh vol 7% return +8%/năm, regime động vol 14% return chỉ +4%/năm (đúng cái pattern "vol cao, return tệ"). Không vol-target, book chạy vol trung bình ~$\sqrt{(7^2+14^2)/2}\approx 11\%$ với return bình quân 6%, Sharpe ~0.55. Vol-target đưa mỗi regime về vol 10%: regime tĩnh được leverage lên $10/7=1.43$ (return thành ~11.4%), regime động bị co xuống $10/14=0.71$ (return thành ~2.9%), bình quân return ~7.2% trên vol ổn định 10%, Sharpe ~0.72 — nhích lên nhờ đúng cái việc gánh ít rủi ro hơn ở đúng lúc rủi ro không được trả công. Trên thực tế uplift khiêm tốn hơn ví dụ tô đậm này, thường 0.05–0.10 Sharpe, *và* làm phân phối return gọn hơn (kurtosis giảm), đúng cái nhà phân bổ vốn thích.

**Drawdown control.** Thêm một tầng an toàn: nếu book chạm một ngưỡng drawdown từ đỉnh, ta cắt exposure theo bậc. Ví dụ chính sách: DD > 10% → cắt exposure 25%; DD > 15% → cắt 50%; hồi phục về DD < 5% → trả lại full. Đây không phải mê tín — nó là bảo hiểm chống hai thứ: (a) regime break mà mô hình chưa kịp nhận ra, (b) rủi ro nghề nghiệp và tâm lý (một book xuống 20% thường bị nhà đầu tư rút vốn *trước khi* nó kịp hồi, nên bảo toàn vốn trong DD là bảo toàn quyền được tiếp tục chơi). Cái giá của drawdown control là bỏ lỡ một phần hồi phục hình chữ V; ta chấp nhận đánh đổi đó vì survival quan trọng hơn tối ưu hóa từng basis point. Một cách định lượng cái giá: nếu book vào DD −12% rồi bật lại +15% trong hai tháng, mà ta đã cắt 25% exposure ở ngưỡng −10%, ta bỏ lỡ $25\% \times 15\% \approx 3.75\%$ của cú hồi. Đó là phí bảo hiểm — trả để không bao giờ ở trong nhóm bị margin-call hay bị redemption ở đáy.

Xếp chồng cả hai tầng lên book Sharpe ~1.1 từ A.6: sau vol targeting và drawdown control, Sharpe *thực nhận* của book quanh **1.1–1.2** với vol ổn định ~10% và MDD được kìm lại quanh −12% đến −15% (so với −25% của single-signal momentum trần trụi). Book đã có hình dạng của một sản phẩm giao dịch được, không còn là một backtest.

## A.9 Tearsheet — đọc từng con số như bác sĩ đọc phim (chương 9, 14)

Trước khi chạm holdout, ta lập một **tearsheet** đầy đủ và đọc nó có phê phán. Đây là số điển hình của book cuối cùng (trên train + validation, chưa gồm holdout):

| Metric | Giá trị | Đọc ý nghĩa |
|---|---|---|
| Annualized return (net) | 11.5% | trên vol ~10%, hợp lý |
| Annualized vol | 10.2% | khớp target, vol-targeting hoạt động |
| **Sharpe (net)** | **1.12** | book đa tín hiệu, sau toàn bộ phí |
| Sortino | 1.65 | > Sharpe → downside gọn hơn |
| Calmar (return/MDD) | 0.85 | 11.5% / 13.5% MDD |
| Max drawdown | −13.5% | 2009 đã được risk-mgmt kìm |
| MDD duration | 9 tháng | thời gian dưới nước — chịu được về tâm lý |
| Annual turnover | ~340% | vừa phải, TC-aware ghìm |
| Hit rate (tháng) | 61% | > 50%, nhưng Sharpe mới là chính |
| Skew (return tháng) | −0.35 | vẫn hơi âm — momentum tail chưa diệt hết |
| Kurtosis | 4.1 | đuôi dày hơn normal, cảnh giác tail |
| Beta vs SPX | 0.03 | market-neutral như thiết kế |
| Alpha vs FF5+UMD | ~3.5%/năm, t≈2.6 | **có alpha residual dương** nhờ quality+PEAD |

Cách đọc một tearsheet là đọc *ngược* — tìm điểm đáng ngờ trước, khen ngợi sau. Skew −0.35 và kurtosis 4.1 nói rằng book vẫn có đuôi trái: risk-managed momentum làm nông crash chứ không xóa nó, và một QR trung thực ghi chú "tail risk còn sống, cần stress test riêng". Ta cũng kiểm tra nội bộ để chắc bảng nhất quán: Calmar $= 11.5/13.5 = 0.85$ khớp với MDD −13.5% ở hàng dưới; Sortino 1.65 > Sharpe 1.12 khẳng định phân phối lệch về phía downside gọn (một chiến lược có Sortino *thấp hơn* Sharpe thì tail trái đang nuốt nó, đây thì ngược lại). Những kiểm tra chéo nhỏ này là cách bắt một tearsheet bị dán số ẩu.

Hồi quy alpha vs FF5+UMD giờ cho **alpha residual dương ~3.5%/năm với t-stat ~2.6** — *khác hẳn* baseline single-momentum (alpha ≈ 0). Con số t≈2.6 không rơi từ trời: với ~14 năm dữ liệu, một alpha 3.5%/năm trên tracking error residual cỡ ~5%/năm cho information ratio residual ~0.7, và $t \approx IR_{\text{resid}} \times \sqrt{\text{số năm}} \approx 0.7 \times \sqrt{14} \approx 0.7 \times 3.74 \approx 2.6$ — khớp. Đây là bằng chứng định lượng rằng quality và PEAD đã thêm cái gì đó *ngoài* factor công khai; đó mới là thứ đem đi gọi vốn được. Nhưng t ≈ 2.6 chưa phải bằng chứng đanh thép — nó cần vượt qua cửa deflated Sharpe, vì t-stat cổ điển không biết ta đã thử bao nhiêu cấu hình để tới được đây.

**Deflated Sharpe — cửa tử.** Ta đã đếm trung thực: qua tất cả lookback, winsorize threshold, cách blend, tham số vol-target và drawdown, bộ đếm thí nghiệm $N \approx 60$ trên $T = 14$ năm train. Ngưỡng Sharpe kỳ vọng cao nhất *chỉ do may rủi* khi thử $N$ cấu hình:

$$SR_0 \approx \sqrt{\frac{2\ln N}{T}} = \sqrt{\frac{2\ln 60}{14}} = \sqrt{\frac{2 \times 4.094}{14}} = \sqrt{\frac{8.188}{14}} = \sqrt{0.585} \approx 0.76.$$

Sharpe quan sát 1.12 nằm **rõ trên** ngưỡng nhiễu 0.76 — khoảng cách $1.12 - 0.76 = 0.36$ Sharpe, tức edge thật cao hơn ngưỡng may rủi gần 50%. Deflated Sharpe dương và xa 0 này nói rằng book khó có khả năng chỉ là may mắn từ việc thử nhiều cấu hình. So với ví dụ cảnh báo kinh điển: thử $N=1000$ cấu hình trên chỉ 10 năm cho

$$SR_0 = \sqrt{\frac{2\ln 1000}{10}} = \sqrt{\frac{2 \times 6.908}{10}} = \sqrt{1.382} \approx 1.18;$$

nếu Sharpe quan sát chỉ 1.2 thì nó gần như dán sát ngưỡng, DSR ~50% — một đồng xu, một đồ giả điển hình. Ta may mắn ở hai chuyện: đếm ít cấu hình hơn ($N=60$ thay vì 1000) *và* có nhiều dữ liệu hơn ($T=14$ thay vì 10), nên ngưỡng của ta thấp hơn (0.76 vs 1.18) trong khi edge cao hơn. Đây là lúc kỷ luật đếm $N$ ở A.1 trả cổ tức: không có nó, ta không thể phân biệt alpha thật với may rủi, và mọi t-stat đẹp đều là ảo ảnh.

**Chạm holdout — một lần duy nhất.** Giờ mới mở 2022–2024. Book cho ra Sharpe holdout ~**0.95** — thấp hơn train 1.12 (luôn luôn có sụt giảm out-of-sample, gọi là haircut) nhưng vẫn khỏe mạnh và *nhất quán về hình dạng*: vẫn market-neutral, vẫn có alpha residual dương, MDD holdout −11%. Sụt từ 1.12 xuống 0.95 là haircut $(1.12-0.95)/1.12 \approx 15\%$ — lành mạnh; kinh nghiệm là một pipeline sạch mất 10–30% Sharpe khi ra out-of-sample, còn một pipeline overfit mất 60–90%. Nếu holdout ra 0.2 (haircut ~80%) thì ta đã overfit và phải quay lại vẽ bảng. Sau lần chạm này, **holdout đã bị đốt cháy** — không được dùng lại để tinh chỉnh, hoặc nó thành train và mất giá trị. Muốn test tiếp thì phải chờ dữ liệu tương lai thật, không có đường tắt.

## A.10 Live paper-trading — cây cầu qua vực backtest-to-live (chương 7.4)

Backtest, dù sạch đến đâu, là một mô phỏng. Cây cầu cuối cùng là **paper-trading trực tiếp vài tháng**: chạy book trên dữ liệu thật, thời gian thực, sinh lệnh mỗi ngày, mô phỏng khớp ở giá thực tế — nhưng chưa bỏ tiền thật. Mục đích không phải kiếm lời (danh mục giấy) mà là **đối chiếu implementation với backtest** và bắt những con quỷ chỉ hiện hình trong đời thực.

Ta theo dõi hai thứ. **Implementation shortfall** — chênh lệch giữa P&L paper thực tế và P&L mà backtest *dự báo* cho cùng những ngày đó. Nếu backtest bảo tháng này +0.9% mà paper ra +0.6%, có một khe hở 30bps cần truy: có thể là fill giá tệ hơn model (impact ta ước lượng lạc quan), có thể là data vendor cho giá lệch giờ ta backtest, có thể là universe live khác universe historical vì lý do PIT tinh vi. **Signal decay real-time** — IC đo trên dữ liệu live có khớp 0.025 của backtest không? Nếu IC live rớt xuống 0.010 ngay lập tức, có thể alpha đã bị crowd (nhiều quỹ khác cũng chạy momentum + quality), hoặc backtest có look-ahead tinh vi mà ta chưa bắt được.

Một ví dụ số cụ thể ta kỳ vọng thấy sau 3 tháng paper: backtest dự báo Sharpe ~0.95–1.0 cho giai đoạn đó; paper thực tế ra ~0.8; khe hở giải thích được là ~15bps/tháng do fill và ~5bps do một khác biệt universe nhỏ đã tìm ra và vá. Cộng lại 20bps/tháng ≈ 2.4%/năm khe hở, trên một book vol 10% tức khe hở Sharpe cỡ 0.24 — vừa đúng khoảng cách từ 1.0 xuống 0.8, một sự nhất quán tự kiểm chứng. Khi khe hở **giải thích được và ổn định**, ta tự tin bơm vốn thật, bắt đầu nhỏ (10% size) rồi tăng dần khi live tiếp tục khớp. Nếu khe hở **lớn và không giải thích được** — chẳng hạn paper ra Sharpe 0.3 mà ta không truy được nguồn — ta *không* bơm tiền. Đó chính xác là ranh giới giữa một QR có kỷ luật và một người sắp mất tiền của nhà đầu tư: người trước coi khe hở không giải thích được là tín hiệu dừng, người sau coi nó là xui xẻo tạm thời.

## A.11 Memo cho investment committee — biến số thành quyết định

Sản phẩm cuối cùng của cả hành trình không phải một notebook mà một **memo** — vài trang đặt lên bàn investment committee để xin phân bổ vốn. Một memo tốt trả lời đúng những câu một nhà phân bổ vốn tỉnh táo sẽ hỏi, và ta viết nó theo khung mà chính bản thân sẽ dùng để phản biện.

**Giả thuyết và cơ chế kinh tế.** Book gồm ba tín hiệu độc lập — momentum (under-reaction + performance chasing), quality (mispricing câu chuyện tăng trưởng), PEAD (under-reaction với earnings) — mỗi cái có người trả tiền rõ ràng và lý do chưa bị arbitrage. Đây là điều đầu tiên committee hỏi: *ai bên kia bàn và vì sao họ tiếp tục thua?* Một book không trả lời được câu này là một book đang cầu nguyện, không phải đang đầu tư.

**Bằng chứng định lượng.** Sharpe train 1.12, holdout 0.95, alpha residual vs FF5+UMD ~3.5%/năm (t≈2.6), deflated Sharpe vượt ngưỡng nhiễu $SR_0 = 0.76$ với $N=60$ thí nghiệm đã đếm. Market-neutral (beta 0.03), sector-neutral. Con số phải đi kèm bối cảnh $N$ — một memo giấu số thí nghiệm là một memo không đáng tin, vì Sharpe mà không có $N$ thì không thể deflate, và một Sharpe không deflate được thì vô nghĩa.

**Chi phí và capacity.** Toàn bộ số Sharpe là *sau* mô hình chi phí ba tầng (spread, square-root impact, borrow). Ước lượng capacity: với position cap 3%, gross 2x, và ràng buộc không trade quá 10% ADV mỗi tên mỗi ngày, book chạy được đến khoảng **500 triệu–1 tỷ đô** trước khi market impact bắt đầu ăn mòn Sharpe đáng kể. Trực giác con số: nếu một tên trung bình có ADV ~\$50 triệu và ta không muốn quá 10% ADV/ngày, ta trade tối đa ~\$5 triệu/tên/ngày; với ~200 tên và turnover cho phép vài ngày để hoàn tất một rebalance, khối lượng book mà không đội impact lên quá vài bps rơi đúng vào bậc vài trăm triệu. Vượt ngưỡng đó, alpha/đô-la giảm — impact theo $\sqrt{Q/V}$ nghĩa là gấp đôi size chỉ đội impact lên $\sqrt 2 \approx 1.41$ lần, nhưng nó đội trên *toàn bộ* đô-la nên tổng phí phình nhanh, và ta phải hoặc chậm execution hơn hoặc mở rộng universe.

**Kịch bản chết — cái committee thực sự muốn nghe.** Book này chết khi nào? (1) Momentum crash cực đại vượt cả risk-management — một cú đảo chiều nhanh hơn EWMA vol kịp phản ứng. (2) Crowding: nếu quá nhiều vốn đuổi cùng ba tín hiệu này, alpha bị nén và IC live rớt (ta đang theo dõi qua paper-trading). (3) Regime break cấu trúc — một thay đổi vi mô thị trường (như quyết định lãi suất tạo ra reversal kéo dài) mà không tín hiệu nào trong ba cái được huấn luyện để nhận. Với mỗi kịch bản, ta nêu chỉ báo cảnh báo sớm và hành động (drawdown control tự cắt, review IC live hàng tháng). Một committee giỏi tin người trình bày *biết cách mình chết* hơn người chỉ khoe cách mình thắng.

**Đề xuất.** Bắt đầu với phân bổ nhỏ ($X$ triệu, ~10% capacity), vol target 10%, review sau 3 tháng đối chiếu live-vs-backtest, tăng size theo bậc nếu implementation shortfall ổn định.

## A.12 Toàn cảnh — pipeline hoàn chỉnh từ ý tưởng đến hệ thống

Nhìn lại, ta đã đi trọn một vòng: một câu giả thuyết viết trên khăn giấy (A.1) → dữ liệu PIT sạch với holdout khóa kín (A.2) → một tín hiệu momentum dựng và đo từng bước (A.3) → backtest event-driven cho sự thật đầu tiên rằng nó chỉ là factor công khai (A.4) → cải tiến risk-managed có kỷ luật (A.5) → kết hợp ba tín hiệu độc lập thành một book qua Fundamental Law (A.6) → optimize có ràng buộc và TC-aware với Grinold alpha rule (A.7) → vol targeting và drawdown control tầng danh mục (A.8) → tearsheet đọc phê phán và qua cửa deflated Sharpe + holdout (A.9) → paper-trading bắc cầu qua vực backtest-to-live (A.10) → memo biến số thành quyết định vốn (A.11).

Mỗi mắt xích trong chuỗi này khớp với một chương của cuốn sách, và mỗi mắt xích có ít nhất một chỗ mà sự cẩu thả giết chết cả pipeline — universe không PIT ở A.2 (nhớ 1.6%/năm return ảo), look-ahead một ngày ở A.3 (nhớ IC 0.15 giả tạo), quên borrow fee ở A.4, không đếm $N$ ở A.9 (nhớ ngưỡng nhiễu 0.76), bỏ qua implementation shortfall ở A.10. Điều phân biệt một hệ thống với một backtest may mắn không phải là một ý tưởng thiên tài, mà là **kỷ luật ở từng mắt xích**. Baseline single-momentum của ta không có alpha độc quyền, nhưng cái *pipeline* xây quanh nó — sạch, có kỷ luật, có chỗ cắm tín hiệu mới, có baseline để đo — chính là tài sản thật. Alpha đến rồi đi; một pipeline tốt là thứ tạo ra alpha kế tiếp.

Repo `src/alpha` cung cấp đúng các mảnh của chuỗi này — signals, portfolio construction, backtest, costs, metrics, covariance denoise, overfit deflation, execution — như một khung để bạn cắm giả thuyết của *mình* vào và chạy lại vòng lặp. Khi bạn đã chạy nó đủ nhiều lần để những cạm bẫy trở thành phản xạ — đủ nhiều lần để một IC 0.15 làm bạn *lo* thay vì *mừng* — thì bạn không còn là người học quant nữa. Bạn là quant.

# Phụ lục B: Case studies — phân tích định lượng

Phần lớn cuốn sách này dạy bạn *xây* — xây signal, xây danh mục, size, execute, đo rủi ro. Phụ lục này dạy bạn một thứ khác, khó dạy hơn nhiều: dạy bạn *sợ đúng chỗ*. Mỗi khủng hoảng dưới đây là một lần thị trường trừng phạt một giả định mà cả một thế hệ quant coi là hiển nhiên — rằng vị thế của họ độc lập với nhau, rằng thanh khoản luôn có mặt khi cần, rằng leverage ẩn không phải là leverage, rằng mô hình đúng dài hạn thì sống được đến dài hạn. Không case nào là chuyện xui rủi. Mỗi cái đều có một **cơ chế định lượng** rõ ràng, tính ra được bằng số, và mỗi cái để lại một bài học có thể mã hóa thành một dòng trong risk model hoặc một ràng buộc trong optimizer của bạn.

Cách đọc phụ lục này không phải như lịch sử tài chính mà như một bộ *stress scenario* đã xảy ra thật. Chương 14 dạy bạn size cho cái đuôi bạn chưa từng quan sát; đây là bộ sưu tập những cái đuôi mà người khác đã quan sát giùm bạn, trả bằng vốn của họ. Mỗi case theo cùng một khung: **bối cảnh** (ai, làm gì, đòn bẩy bao nhiêu), **cơ chế định lượng** (con số nào biến một vị thế bình thường thành một vụ nổ, tính ra được), và **bài học cho quant buy-side** (điều bạn phải thay đổi trong cách làm việc). Bảy case, chọn để phủ đủ các họ chết khác nhau — crowding, thanh khoản, leverage ẩn, feedback loop, contagion — chứ không phải bảy phiên bản của cùng một sai lầm.

## B.1 Quant Quake tháng 8/2007 — khi neutral không có nghĩa là độc lập

### Bối cảnh

Tuần 6–9 tháng 8 năm 2007, một điều xảy ra khiến giới quant equity market-neutral chết lặng: các quỹ được thiết kế để *không* tương quan với thị trường, được hedge cẩn thận về beta bằng 0, dollar-neutral từng đồng, cùng lúc lỗ nặng trong khi S&P 500 gần như đứng yên. Goldman's Global Alpha, Renaissance's RIEF, AQR, và hàng chục quỹ nhỏ hơn — những cái tên top của nghề — mất 20% trở lên trong ba ngày. Điều kỳ dị nhất: đến thứ Sáu 10/8 và tuần sau, phần lớn khoản lỗ *hồi lại*. Đây không phải một cú sốc thông tin (không có tin tức vĩ mô lớn tương xứng), mà là một cú sốc thuần túy về *cấu trúc vị thế*. Andrew Lo và Amir Khandani sau này gọi nó là "unwinding" và tái dựng lại cơ chế gần như từng giờ.

### Cơ chế định lượng

Gốc rễ nằm ở một sự thật mà từ "neutral" che giấu. Một quỹ equity market-neutral điển hình chạy vài factor cổ điển: value (mua rẻ theo book-to-price), momentum (chương về momentum 12-1: rank-IC ~0.025), short-term reversal, quality. Mỗi quỹ tin danh mục mình *độc đáo*. Sự thật: tất cả cùng khai thác một tập nhỏ các factor công khai, nên **danh mục của họ tương quan với nhau ~0.9 ngay cả khi mỗi cái tương quan ~0 với market**. Beta-neutral với S&P không có nghĩa là neutral với *nhau*.

Hãy làm cho trực giác này thành số. Giả sử mỗi quỹ có return $r_i = \beta_i r_m + \gamma_i f + \varepsilon_i$, trong đó $r_m$ là market, $f$ là factor chung "quant crowding" (long cheap-value/high-momentum, short đối nghịch), và $\varepsilon_i$ là alpha thật sự riêng của quỹ. Hedge market cẩn thận đặt $\beta_i = 0$. Nhưng loading lên factor chung $\gamma_i$ thì ai cũng dương và lớn, vì ai cũng đọc cùng những paper, backtest cùng những signal. Với $\beta_i = 0$, variance của quỹ tách thành hai phần độc lập, phần chung và phần riêng:

$$\sigma_{r_i}^2 = \gamma_i^2 \sigma_f^2 + \sigma_{\varepsilon_i}^2,$$

và covariance giữa hai quỹ *chỉ* đến từ factor chung ($\varepsilon_i$ độc lập nhau theo định nghĩa của "alpha riêng"):

$$\text{Cov}(r_i, r_j) = \gamma_i \gamma_j \sigma_f^2 \quad\Rightarrow\quad \text{Corr}(r_i, r_j) = \frac{\gamma_i \gamma_j \sigma_f^2}{\sqrt{(\gamma_i^2 \sigma_f^2 + \sigma_{\varepsilon_i}^2)(\gamma_j^2\sigma_f^2 + \sigma_{\varepsilon_j}^2)}}.$$

Đặt cho hai quỹ giống nhau ($\gamma_i = \gamma_j = \gamma$, $\sigma_{\varepsilon_i} = \sigma_{\varepsilon_j} = \sigma_\varepsilon$) thì công thức gọn lại thành một tỉ số variance rất dễ đọc:

$$\text{Corr}(r_i, r_j) = \frac{\gamma^2 \sigma_f^2}{\gamma^2 \sigma_f^2 + \sigma_\varepsilon^2} = \frac{\text{variance chung}}{\text{variance tổng}}.$$

Correlation cặp *chính bằng* tỉ lệ variance đến từ factor chung. Cắm số cụ thể cho một quỹ "bình yên" điển hình: giả sử vol tổng của quỹ là $\sigma_{r} = 6\%$/năm (một stat-arb book chạy gross vừa phải), factor chung đóng góp $\gamma\sigma_f = 5.4\%$ và alpha riêng đóng góp $\sigma_\varepsilon = 2.6\%$. Kiểm tra: $\sqrt{5.4^2 + 2.6^2} = \sqrt{29.16 + 6.76} = \sqrt{35.92} = 6.0\%$ ✓. Khi đó variance chung là $5.4^2 = 29.16$, variance tổng $36.0$, và

$$\text{Corr} = \frac{29.16}{36.0} = 0.81.$$

Ai cũng nghĩ mình cầm phần idiosyncratic 2.6% "độc đáo"; thực tế $29.16/36.0 = 81\%$ variance — và do đó 81% correlation với đồng nghiệp — là *cùng một cược*. Đảo ngược: để correlation cặp tụt xuống một mức lành mạnh 0.3, alpha riêng phải chiếm $\sigma_\varepsilon^2 = (1-0.3)\times 36 = 25.2$, tức $\sigma_\varepsilon = 5.0\%$ trên tổng $6\%$ — gần như *toàn bộ* rủi ro phải là idiosyncratic. Rất ít quỹ đạt được điều đó, vì alpha thật sự độc đáo là hàng hiếm còn factor công khai thì miễn phí. Đây là lý do con số 0.8–0.9 không phải ngoại lệ mà là *mặc định* của ngành.

Bây giờ cơ chế deleveraging dây chuyền. Bắt đầu tuần đó, một quỹ multi-strategy lớn — nhiều khả năng liên quan đến khoản lỗ từ subprime/credit ở book khác của cùng tổ chức — cần huy động tiền mặt. Nó thanh lý book equity market-neutral vì đó là chỗ *thanh khoản nhất* để bán (nghịch lý: bạn bán cái bán được, không phải cái muốn bán). Bán book đó nghĩa là: bán các cổ phiếu ở *long leg* (đang được crowd mua) và mua lại các cổ phiếu ở *short leg* (đang được crowd short). Đúng chiều ngược lại vị thế của mọi quỹ crowded khác.

Giá dịch chuyển. Long leg (value/momentum favorites) giảm, short leg (junk) tăng — tức factor $f$ đi âm mạnh. Vì $\text{Corr} \approx 0.8$–$0.9$, *mọi* quỹ crowded cùng lỗ đồng thời. Bây giờ risk model của họ kích hoạt: vol thực hiện tăng vọt, VaR breach, quy tắc drawdown control (chương 14: chạm −5% cắt nửa gross) buộc họ *cũng* deleverage — tức cũng bán long leg, mua short leg. Điều này đẩy $f$ âm thêm, gây lỗ thêm, kích hoạt thêm deleverage. Đây là một **fire-sale externality** dạng thuần túy: hành động phòng thủ hợp lý của từng quỹ cộng lại thành một cỗ máy tự hủy tập thể.

Có thể theo dõi vòng xoáy này gần như từng bước. Hình dung một factor có daily vol bình thường $1\%$. Ngày 1, quỹ châm ngòi đổ hàng đẩy $f$ đi $-3\%$, tức ba lần vol bình thường. Với một book gross $6\times$ un-hedged trên factor này, đó là $6\times 3\% = 18\%$ lỗ vốn ngay ngày đầu — vượt xa ngưỡng −5% của mọi drawdown rule. Ngày 2, hàng loạt quỹ đồng loạt cắt gross theo quy tắc, đẩy $f$ thêm $-2\%$ nữa; ai còn gross $6\times$ ăn thêm $12\%$. Ba ngày cộng dồn dễ dàng chạm ngưỡng $-20\%$ trở lên quan sát được. Con dao chính là leverage: với một book market-neutral chạy gross 6–8x trên vốn (điển hình cho stat-arb vì Sharpe/leg thấp nên phải leverage cao để đạt return mục tiêu), một cú dịch factor tích lũy 3–4% ở mức un-hedged tương đương $6\times 3\% = 18\%$ đến $8\times 4\% = 32\%$ lỗ trên vốn — bao trọn dải "20%+" quan sát được. Đòn bẩy cao chính là hệ số khuếch đại biến một cú dịch factor tầm thường thành một vụ xóa sổ.

Vì sao hồi lại nhanh? Vì cú sốc *không phải* thông tin — value và momentum vẫn "đúng" về fundamental. Khi lực bán cưỡng bức cạn (quỹ châm ngòi đã bán xong, hoặc bị stop-out hẳn), giá factor bật về gần chỗ cũ. Quỹ nào **sống sót không deleverage** (đủ vốn để chịu drawdown, hoặc thậm chí tăng size vào đáy) kiếm lời to trong đợt hồi. Quỹ nào bị margin/risk-rule ép bán đáy thì khóa cứng khoản lỗ. Cùng một alpha, kết cục ngược nhau, quyết định bởi *balance sheet và risk policy*, không phải bởi signal.

### Bài học cho quant buy-side

Bài học trung tâm: **beta-neutral không phải là độc lập.** Risk model của bạn phải có một factor "crowding" — đo bằng correlation của return quỹ với một portfolio đại diện các factor phổ biến (value, momentum, size), hoặc bằng ownership/short-interest overlap của các name bạn cầm với 13F holdings của các quant khác. Nếu long book của bạn trùng nặng với "cái ai cũng long", bạn đang mang một rủi ro không xuất hiện trong bất kỳ vol lịch sử nào của riêng bạn, vì nó chỉ hiện hình khi tất cả cùng chạy.

Bài học thứ hai về sizing: crowding ăn thẳng vào Kelly. Chương 14 chỉ ra $f^* = \Sigma^{-1}\mu$ và correlation ẩn giữa các vị thế là kẻ giết Kelly — Quant Quake là bằng chứng thực địa. $\Sigma$ đo trên dữ liệu bình yên đánh giá *thấp* correlation vì trong lúc bình yên, $\varepsilon_i$ chiếm ưu thế và các quỹ trông độc lập; đúng lúc stress, $f$ chiếm ưu thế và correlation nhảy về 0.9. Đây là **correlation breakdown**: ma trận hiệp phương sai bạn dùng để size là ma trận của trạng thái bạn *không* cần lo, còn trạng thái bạn cần lo có ma trận khác hẳn. Con số ở trên làm rõ điều này bằng một phép so: cùng một quỹ, correlation cặp trượt từ ~0.3 (khi $\sigma_\varepsilon$ chiếm ưu thế) lên ~0.81 (khi $\gamma^2\sigma_f^2$ chiếm ưu thế) — cùng danh mục, hai $\Sigma$ khác nhau tùy regime. Half-Kelly không chỉ chống sai số $\mu$ mà còn chống chính cú nhảy $\Sigma$ này.

Bài học thứ ba, tinh tế nhất: **thanh khoản của bạn là hàm của vị thế người khác.** Book của bạn thanh khoản khi bạn là người duy nhất muốn thoát; nó bốc hơi khi tất cả cùng muốn thoát cùng lúc, và điều đó xảy ra chính xác khi bạn cần thanh khoản nhất. Đây là chủ đề lặp lại trong mọi case còn lại.

## B.2 LTCM 1998 — mô hình đúng dài hạn vẫn chết vì con đường tới đó

### Bối cảnh

Long-Term Capital Management là quỹ có dàn học giả sáng chói nhất từng tụ lại một chỗ: Myron Scholes và Robert Merton (Nobel Kinh tế 1997, đúng năm trước khi quỹ nổ), cựu vice-chairman Fed David Mullins, và trader huyền thoại John Meriwether. Chiến lược lõi là **relative-value convergence** — tìm hai công cụ gần-tương-đương mà giá lệch nhau một chút, long cái rẻ short cái đắt, và đợi spread hội tụ. Từ 1994 đến đầu 1998 nó cho return sau phí ~40%/năm. Tháng 8–9/1998, sau khi Nga vỡ nợ, nó mất hơn 90% vốn trong vài tuần và phải được một consortium 14 ngân hàng bơm 3.6 tỷ USD để tránh sụp đổ dây chuyền hệ thống. Nhìn từ P-world, đây là case-study kinh điển về việc **một mô hình có thể đúng về giá trị dài hạn mà vẫn giết bạn qua con đường ngắn hạn** — vì leverage và thanh khoản không quan tâm mô hình của bạn đúng cuối cùng.

### Cơ chế định lượng

Điển hình một convergence trade của LTCM: on-the-run vs off-the-run Treasuries. Trái phiếu 30 năm vừa phát hành (on-the-run) thanh khoản hơn nên yield thấp hơn một chút so với trái phiếu 29.5 năm phát hành sáu tháng trước (off-the-run) — dù dòng tiền gần như giống hệt. Chênh lệch yield có thể chỉ 10–15 bps. LTCM long off-the-run (rẻ, yield cao), short on-the-run (đắt), và đợi spread thu hẹp khi on-the-run "già đi" thành off-the-run. Đây là một cược *gần như chắc chắn đúng* về mặt kinh tế — hai dòng tiền hầu như giống nhau thì giá phải hội tụ.

Vấn đề: edge quá nhỏ. 10 bps trên một trái phiếu là gần như không có gì. Để biến 10 bps thành return hai chữ số, bạn cần **leverage khổng lồ**. LTCM chạy balance sheet leverage ~25x trên equity — khoảng \$4.7 tỷ vốn đỡ ~\$125 tỷ tài sản, tức $125/4.7 \approx 27\times$ — và với derivatives notional tính vào thì exposure kinh tế cao hơn nhiều lần nữa. Hãy làm phép tính hiển hiện vì sao 25x là con dao hai lưỡi.

Gọi spread hiện tại là $s$, kỳ vọng hội tụ về $0$. Một trade unlevered chỉ kiếm cỡ $s \approx 0.10\%$ nếu hội tụ hoàn toàn. Với leverage $L = 25$, return trên vốn khi hội tụ là $L \cdot s = 25 \times 0.10\% = 2.5\%$ cho một trade — nhân với nhiều trade và nhiều vòng trong năm ra 40%. Đẹp. Nhưng leverage khuếch đại *cả hai chiều*: nếu spread, thay vì hội tụ, **rộng ra** thêm $\Delta s$ trước khi hội tụ, lỗ mark-to-market trên vốn là $L \cdot \Delta s$. Với $L = 25$, chỉ cần spread rộng thêm $\Delta s = 4\%$ (tức 400 bps, hoàn toàn khả dĩ trong một cơn hoảng loạn) là **lỗ $25 \times 4\% = 100\%$ vốn** — xóa sổ, dù mô hình của bạn *đúng* rằng cuối cùng nó sẽ hội tụ về 0.

Con số này đáng nhìn ngược lại để thấy cái bẫy sâu hơn: leverage biến một biến động giá *bình thường* thành một biến động vốn *chí mạng*. Ở $L=25$, biên độ dao động mark-to-market bạn chịu được trước khi cháy chỉ là $1/25 = 4\%$ trên tài sản cơ sở. Nói cách khác, đòn bẩy đặt một *trần cứng* lên độ sâu drawdown của tài sản mà bạn có thể sống qua: $\text{drawdown tối đa sống được} = 1/L$. LTCM sống được $4\%$; một quỹ $L=6$ sống được $17\%$; một quỹ unlevered sống được $100\%$. Vì thế câu hỏi sizing đúng không phải "trade này có hội tụ không" mà "spread có thể doãng bao xa *trên đường* tới hội tụ, và $1/L$ có lớn hơn con số đó không". LTCM trả lời sai câu hỏi thứ hai.

Đó chính xác là điều xảy ra. Khi Nga vỡ nợ tháng 8/1998, thế giới lao vào **flight-to-liquidity**: ai cũng muốn cầm cái thanh khoản nhất (on-the-run Treasuries) và vứt cái kém thanh khoản (mọi thứ khác). Đây là *đúng chiều ngược* với mọi convergence trade của LTCM — họ short cái ai cũng muốn mua, long cái ai cũng muốn bán. Spread không hội tụ mà *doãng ra* đồng loạt trên mọi trade cùng lúc, vì mọi trade của họ về bản chất là cùng một cược vĩ mô: **short liquidity premium, short volatility**. Cái họ tưởng là hàng chục cược độc lập trên các thị trường khác nhau (Treasuries, swap spreads, mortgage, equity vol, merger arb ở nhiều nước) thực chất có correlation gần 1 trong một cơn risk-off, vì tất cả đều là "được trả tiền để cầm rủi ro/kém thanh khoản, mất tiền khi thị trường tháo chạy về an toàn". Lại là bài học B.1 dưới hình dạng khác: **diversification giả** — chính là correlation breakdown, chỉ khác ở chỗ factor ẩn ở đây tên là *liquidity premium* thay vì *quant crowding*.

Bây giờ vòng xoáy tử thần. Spread doãng → lỗ mark-to-market → prime broker gọi thêm margin → LTCM phải bán tài sản để nộp margin → nhưng tài sản họ cầm là cái *kém thanh khoản nhất* đúng lúc không ai muốn mua → bán ra đẩy giá xuống thêm → lỗ thêm → margin call thêm. Và vì thị trường biết LTCM đang bị ép (vị thế của họ quá lớn để giấu), các trader khác *front-run*: họ bán trước cái LTCM buộc phải bán, đẩy spread doãng thêm nữa để mua lại rẻ hơn khi LTCM buộc thanh lý. Thanh khoản không chỉ bốc hơi — nó chuyển thành *thù địch*. Con số cuối: từ ~\$4.7 tỷ vốn đầu 1998 xuống ~\$400 triệu trước cứu trợ, tức mất $(4.7-0.4)/4.7 = 91\%$ vốn.

Điểm mấu chốt định lượng, đáng khắc vào tường: **mô hình đúng về điểm đến, sai về con đường.** Nếu LTCM có thể cầm vị thế thêm sáu tháng, gần như mọi trade của họ *đã* hội tụ và có lãi — sau khủng hoảng, spread thắt lại đúng như mô hình dự đoán. Nhưng với leverage 25x, họ không có sáu tháng; họ có vài tuần trước khi margin call xóa sổ. Đây là điểm mù của một mô hình định giá thuần túy: nó cho bạn *giá trị dài hạn* nhưng không cho bạn *khả năng sống sót qua drawdown ngắn hạn*, và cái thứ hai là ràng buộc cứng khi bạn dùng tiền đi vay.

### Bài học cho quant buy-side

Thứ nhất: **leverage đặt một giới hạn cứng lên độ dài drawdown bạn chịu được, độc lập với việc bạn đúng hay sai.** Chương 14 nói drawdown 50% cần lãi 100% để hòa; ở leverage 25x, một drawdown mark-to-market chỉ 4% là drawdown 100% trên vốn. Bạn có thể đúng tuyệt đối về fundamental value và vẫn bị margin call giết ở giữa đường. Convergence đúng — nhưng "markets can remain irrational longer than you can remain solvent." Đây là lý do quant nghiêm túc size theo **worst-case path** ($\Delta s$ lớn nhất trên đường đi), không theo endpoint ($s\to 0$).

Thứ hai: **stress correlation, đừng stress vị thế lẻ.** Rủi ro thật của LTCM không phải bất kỳ trade nào mà là correlation ẩn giữa tất cả — tất cả cùng là short liquidity. Risk system của bạn phải hỏi: "nếu risk-off, *bao nhiêu* trong danh mục tôi cùng đi một chiều?" Con số đó, không phải vol của trade lẻ, mới là VaR thật của bạn. Đây là stress test scenario (chương 14) chứ không phải VaR historical, vì lịch sử bình yên giấu correlation này.

Thứ ba, cạm bẫy Nobel: **giải thưởng cho mô hình không phải giấy phép cho leverage.** Mô hình Black-Scholes-Merton (cuốn Q-world) mô tả *pricing* tuyệt đẹp; nó không nói gì về việc bạn nên vay bao nhiêu để cược vào chênh lệch pricing. Sự tự tin vào mô hình đã trở thành lý do biện minh cho đòn bẩy, và chính đòn bẩy — không phải mô hình — giết quỹ. Đừng bao giờ để chất lượng của signal biện minh cho việc bỏ qua kỷ luật sizing.

## B.3 Medallion / Renaissance — giải phẫu một cỗ máy *không* nổ

### Bối cảnh

Sáu case còn lại là những vụ nổ; case này là mẫu đối chứng — quỹ hiếm hoi giữ được edge qua nhiều thập niên mà không tự hủy. Medallion, quỹ nội bộ của Renaissance Technologies do Jim Simons lập, được cho là đạt return gross ~66%/năm và net ~39%/năm sau phí (5-and-44, phí cao khủng khiếp) suốt hơn ba thập niên, một thành tích không quỹ nào khác tiệm cận. Từ P-world, câu hỏi thú vị không phải "họ có signal gì" (bí mật, và không quan trọng cho bài học) mà **vì sao mô hình kinh doanh của họ bền vững** trong khi mọi edge khác bị arbitrage đến chết. Câu trả lời tính được bằng chính khung Fundamental Law của chương về alpha research.

### Cơ chế định lượng

Trọng tâm là **edge nhỏ × số lượng khổng lồ × tần suất cao**, chính xác là running example xuyên suốt cuốn này: đồng xu 51/49 cho Sharpe/cược ~0.02, và $N$ cược độc lập cho $SR = 0.02\sqrt{N}$. Medallion không tìm cược lớn; họ tìm một biên rất mỏng và giao dịch nó hàng triệu lần. Hãy dựng lại toán học.

Fundamental Law of Active Management: $IR \approx IC \cdot \sqrt{BR}$, trong đó $IC$ là information coefficient (correlation dự báo–thực tế) và $BR$ là breadth (số cược độc lập mỗi năm). Giả sử Medallion có $IC$ rất nhỏ — nói $IC = 0.03$, chỉ nhỉnh hơn momentum 12-1 ($IC \approx 0.025$), không hề "thần thánh" ở mức signal. Bí mật nằm ở $BR$. Nếu họ giao dịch, nói, 5000 công cụ, mỗi cái reposition nhiều lần mỗi ngày, với holding period cỡ giờ, thì số cược *gần-độc-lập* mỗi năm có thể lên hàng triệu. Lấy $BR = 150{,}000$ cược độc lập hiệu dụng/năm (khiêm tốn cho một quỹ high-frequency đa tài sản):

$$IR \approx IC\sqrt{BR} = 0.03 \times \sqrt{150{,}000} = 0.03 \times 387 = 11.6.$$

Một information ratio trên 10. Đối chiếu: momentum 12-1 với $IC = 0.025$ và breadth ~1000 name × ~2 độc-lập-cược/name mỗi năm (holding cỡ tháng nhưng các name không hoàn toàn độc lập nên breadth hiệu dụng thấp hơn số reposition) cho $BR \approx 2000$, ra

$$IR \approx 0.025\sqrt{2000} = 0.025 \times 44.7 = 1.12$$

— Sharpe ~1, đúng cỡ ta thấy ở momentum trước phí. Sự khác biệt giữa Sharpe 1 và Sharpe 11 **không phải** signal tốt hơn 10 lần; nó là breadth lớn hơn 75 lần ($150{,}000/2{,}000 = 75$), và breadth vào công thức dưới dấu căn nên $\sqrt{75} \approx 8.7$ lần IR. Nói tổng quát: để nhân IR lên $10\times$ bằng breadth thuần túy, bạn cần $100\times$ breadth, vì $\sqrt{100}=10$. Đây là toàn bộ triết lý Medallion nén trong một dòng: *đừng làm coin tốt hơn, hãy tung nó nhiều lần hơn.*

Nhưng $SR = 11$ về lý thuyết không dịch thành return khổng lồ mãi mãi, vì có hai ràng buộc cứng mà chính cách Medallion vận hành đã giải quyết, và đó là phần bài học thật:

**Ràng buộc capacity.** Edge nhỏ ở tần suất cao có *sức chứa* rất hạn chế — market impact (chương 12–13) ăn hết alpha khi bạn scale. Hãy cắm số vào square-root impact để thấy trần này sắc đến đâu. Mua 5% ADV với vol 2%/ngày và hệ số $c=0.7$ cho impact $\approx c\,\sigma\sqrt{\text{ADV\%}} = 0.7 \times 2\% \times \sqrt{0.05} = 0.7\times 2\% \times 0.224 = 31\,\text{bps}$. Nếu edge kỳ vọng mỗi trade của bạn chỉ vài bps — điển hình cho một signal high-frequency IC = 0.03 — thì impact 31 bps *nuốt trọn nhiều lần* alpha; trade tự nó lỗ ròng ngay khi bạn buộc phải giao dịch cỡ lớn. Nghĩa là chiến lược high-Sharpe của Medallion chỉ hoạt động ở quy mô nhỏ, nơi bạn giữ được %ADV thấp và impact dưới edge. Đây là lý do **Medallion trả lại vốn cho nhà đầu tư ngoài và đóng cửa với tiền ngoài** — giữ quỹ ở cỡ ~\$10 tỷ, cỡ mà edge còn sống. Một quỹ tham lam sẽ nhận thêm vốn, scale lên, buộc %ADV tăng, impact vượt edge, Sharpe sụp. Kỷ luật *từ chối tiền* là một quyết định định lượng, không phải khiêm tốn: họ tính ra capacity từ chính đường cong impact này và tôn trọng nó. Đây là đối lập hoàn hảo với LTCM (scale leverage đến vỡ) và Archegos (B.5, scale concentration đến vỡ).

**Ràng buộc secrecy / decay.** Mọi edge bị arbitrage khi đủ người biết. Medallion nổi tiếng bí mật đến cực đoan — không xuất bản, nhân viên ký NDA suốt đời, cấm rời sang quỹ khác. Vì sao điều này quan trọng định lượng? Vì edge nhỏ đặc biệt mong manh: momentum 12-1 sống sót dù công khai vì nó là *compensated risk premium* (chương về behavioral: có người sẵn sàng trả để tránh momentum crash). Nhưng một microstructure edge thuần túy không có nền tảng risk-premium — nó chỉ là inefficiency, và inefficiency biến mất ngay khi đủ vốn đuổi theo. Giữ bí mật kéo dài tuổi thọ half-life của edge. Cộng với việc **liên tục tái đầu tư vào research** (thay signal cũ đã decay bằng signal mới) để giữ pipeline alpha không cạn — cùng một $BR$ nhưng liên tục làm mới các cấu phần trước khi từng cái decay về 0.

Và yếu tố văn hóa có hệ quả định lượng: Medallion vận hành **collaborative** — một book chung, một P&L chung, mọi người đóng góp signal vào cùng một cỗ máy, thay vì mô hình pod-shop mỗi PM một book cạnh tranh. Điều này tối đa hóa breadth: gộp signal của tất cả vào một danh mục cho phép **netting** (long của người này bù short của người kia, giảm gross và giảm impact) và cho phép risk allocation tối ưu toàn cục $f^* = \Sigma^{-1}\mu$ trên *toàn bộ* tập signal thay vì từng silo. Về mặt Fundamental Law, gộp là cách tăng $BR$ mà không tăng $IC$ — cộng nhiều nguồn cược gần-độc-lập vào một $\sqrt{BR}$ lớn hơn, đúng đòn bẩy toán học mạnh nhất trong công thức.

### Bài học cho quant buy-side

Medallion là bằng chứng sống rằng **con đường bền vững không phải edge to mà là edge nhỏ × breadth cao × kỷ luật capacity.** Nếu bạn có một signal Sharpe 2.5 "quá tốt", nghi ngờ nó (deflated Sharpe của chương overfit: $SR_0 = \sqrt{2\ln N/T}$ — thử nhiều cấu hình đủ để Sharpe 2.5 giả xuất hiện). Nếu bạn có một signal Sharpe 0.3 nhưng chạy được trên 5000 công cụ với tần suất cao, đó có thể là mỏ vàng nếu capacity và impact cho phép.

Bài học capacity là bài học đối ngẫu với mọi vụ nổ khác trong phụ lục này: **biết cỡ tối đa của mình và không vượt.** LTCM vỡ vì scale leverage; Archegos vì scale concentration; Medallion sống vì *trả lại tiền* khi đụng trần capacity mà đường cong impact 31 bps ở trên đã báo trước. Sức mạnh của một quant trưởng thành đôi khi là nói "không" với vốn.

## B.4 GameStop tháng 1/2021 — short squeeze gặp gamma squeeze, và cây cầu sang Q-world

### Bối cảnh

Tháng 1/2021, cổ phiếu GameStop (GME) — một chuỗi bán game đang suy tàn, giá ~\$4 giữa 2020 — tăng lên đỉnh intraday ~\$483 trong vài tuần, một cú tăng ~120 lần. Động lực: một đám đông retail phối hợp trên diễn đàn WallStreetBets nhận ra GME bị short quá mức (short interest vượt 100% float — nhiều cổ phiếu được bán khống hơn tổng số cổ phiếu tồn tại, do cùng một cổ phiếu được cho vay và short lại nhiều lần). Melvin Capital và các quỹ short khác chịu lỗ khủng, Melvin cần bơm vốn \$2.75 tỷ. Đây là case duy nhất trong phụ lục nơi buy-side định chế là *nạn nhân* của dòng retail, và nó là cây cầu định lượng đẹp nhất sang Q-world vì cơ chế cốt lõi nằm ở **dealer gamma hedging**.

### Cơ chế định lượng

Có hai squeeze chồng lên nhau, cần tách bạch.

**Short squeeze (cơ chế bậc một).** Short interest > 100% float nghĩa là để đóng vị thế, người short phải mua lại nhiều cổ phiếu hơn số đang trôi nổi tự do. Khi giá bắt đầu tăng, người short lỗ; những người dùng đòn bẩy chạm margin call phải **buy to cover** — mua để đóng short. Nhưng mua để đóng đẩy giá *lên thêm*, gây margin call cho người short khác, buộc họ cũng mua. Đây là feedback loop dương thuần túy: cùng cấu trúc "hành động phòng thủ hợp lý cộng lại thành cỗ máy" như Quant Quake, nhưng chiều *lên* thay vì xuống. Với float hạn chế và short interest > 100%, lượng cầu cưỡng bức khổng lồ so với supply → giá bùng nổ phi tuyến.

**Gamma squeeze (cơ chế bậc hai — cây cầu sang Q-world).** Đây là phần định lượng đắt. Retail không chỉ mua cổ phiếu, họ mua **call options** ngắn hạn out-of-the-money hàng loạt. Người bán những call đó là các dealer (market maker options). Dealer bán call thì **short gamma** — họ phải delta-hedge bằng cách mua cổ phiếu cơ sở, và lượng cần mua *tăng theo giá* vì delta của call tăng khi giá lên gần strike.

Làm rõ bằng số, từng bước. Delta $\Delta$ của một option đo độ nhạy giá option theo giá cơ sở; gamma $\Gamma$ đo độ nhạy của chính $\Delta$, tức $\Gamma = \partial \Delta/\partial S$. Dealer bán một lô call, tổng position delta là $-\Delta$ (short call = short delta), nên để trung hòa họ phải **mua** $\Delta$ cổ phiếu cơ sở. Bây giờ giá cơ sở tăng $dS$: delta của call dịch $\Gamma\,dS$, nên delta danh mục của dealer từ $0$ thành $-\Gamma\,dS$ (short call giờ short delta thêm), buộc dealer **mua thêm** $\Gamma\,dS$ cổ phiếu để về lại trung hòa. Đặt số: giả sử dealer short call trên 5 triệu cổ phiếu tương đương, với gamma tổng $\Gamma = 0.05$ per \$1 — nghĩa là mỗi \$1 giá tăng, tổng delta dịch $0.05 \times 5\,\text{tr} = 250{,}000$ cổ phiếu. Nếu giá GME tăng \$10 trong một giờ, dealer phải mua $250{,}000 \times 10 = 2.5$ triệu cổ phiếu chỉ để giữ hedge trung hòa. Lượng mua 2.5 triệu cổ đó *đẩy giá lên thêm*, làm delta tăng thêm, buộc mua thêm — feedback loop thứ hai, chồng lên short squeeze. Điểm mấu chốt là tính lồi: vì lượng phải mua tỉ lệ với *tích* $\Gamma \times dS$, và $\Gamma$ của call OTM lại *tăng* khi giá tiến về strike, tốc độ mua cưỡng bức không tuyến tính mà tăng tốc đúng lúc giá chạy — chính là dầu đổ vào lửa.

Đây là điểm giao P/Q sâu sắc, đáng dừng lại. Ở Q-world, dealer bán option và hedge gamma là hoạt động bình thường, trung tính — họ thu bid-ask/vol premium để cung cấp thanh khoản option. **Short gamma** nghĩa là hedge *cùng chiều thị trường*: giá lên thì mua, giá xuống thì bán — chính là mua cao bán thấp, một hoạt động *khuếch đại biến động*. Ngược lại, khi dealer **long gamma**, họ hedge *ngược chiều* (giá lên thì bán bớt), làm *giảm* biến động. Vị thế gamma tổng hợp của toàn bộ dealer (dealer gamma positioning) quyết định thị trường tự ổn định hay tự khuếch đại. Trong GME, retail mua call ồ ạt đẩy dealer vào short gamma sâu, biến options market thành máy bơm cho spot. Một quant buy-side trade GME (hoặc bất kỳ name nào retail đang gamma) *phải* mô hình được dealer gamma này, vì nó dự báo được: khi dealer short gamma, các cú dịch giá tự khuếch đại và intraday vol bùng nổ; đây là một signal tradeable, không phải nhiễu (xem cuốn Q-world về options positioning và dealer gamma).

Con số tổng hợp: từ ~\$4 lên ~\$483 là $483/4 = 121\times$. Không cơ chế đơn lẻ nào giải thích được; đó là short squeeze × gamma squeeze × retail momentum flow cộng hưởng, mỗi cái feedback vào cái kia. Và như mọi feedback dương, nó đảo chiều dữ dội khi động lượng cạn — GME rơi về ~\$40 (điều chỉnh split) trong các tháng sau khi retail flow chậm lại và dealer gamma đảo dấu.

### Bài học cho quant buy-side

Thứ nhất: **crowded shorts là bom hẹn giờ về cấu trúc, không phải về fundamental.** Melvin đúng về fundamental (GME *là* công ty suy tàn) và vẫn suýt bị xóa sổ — giống LTCM đúng mà chết. Đo **short interest / float** và **days-to-cover** (short interest chia volume trung bình ngày) như một risk factor: days-to-cover cao nghĩa là nếu phải cover, bạn không thể thoát nhanh, thanh khoản thoát của bạn là con tin của mọi người short khác. Đây lại là bài học B.1: thanh khoản thoát là hàm của vị thế người khác.

Thứ hai, và là điều P-world thường bỏ sót: **options flow lái spot khi dealer short gamma.** Nếu bạn trade một name có open interest option lớn và retail call buying mạnh, bạn phải biết dealer đang short gamma và giá sẽ *tự khuếch đại*. Một quant hiện đại tích hợp dealer gamma estimate (từ open interest theo strike và mô hình Q-world về hedging) vào signal ngắn hạn. Đây là chỗ P-world và Q-world buộc phải nói chuyện với nhau: bạn không thể hiểu price dynamics của một name có nhiều option mà không hiểu ai đang hedge cái gì.

Thứ ba: **short có payoff bất đối xứng tàn nhẫn.** Long mất tối đa 100%; short mất *không giới hạn*. Cụ thể: short GME ở \$4 mà giá lên đỉnh \$483 thì lỗ là $(483-4)/4 = 479/4 = 11{,}975\%$ trên vốn đặt — gần 120 lần vốn, so với trần lỗ 100% của một vị thế long. Sizing một short book phải tính đến cái đuôi vô hạn này; Kelly cho short cần fraction nhỏ hơn nhiều so với long cùng edge vì tail loss không bị chặn ở $-100\%$ mà chạy tới $-\infty$.

## B.5 Archegos 2021 — leverage ẩn qua total return swap và điểm mù của prime broker

### Bối cảnh

Tháng 3/2021, Archegos Capital Management — một family office của Bill Hwang, quản lý ~\$10 tỷ vốn riêng — sụp đổ trong vài ngày, gây lỗ tổng cộng ~\$10 tỷ cho các prime broker của nó: Credit Suisse mất ~\$5.5 tỷ (một trong những cú giáng dẫn tới sự sụp đổ của chính CS sau này), Nomura ~\$2 tỷ, Morgan Stanley, UBS và những ngân hàng khác chịu phần còn lại. Điều gây sốc: một quỹ \$10 tỷ mà không ai — kể cả các prime broker — biết được tổng exposure thật của nó, vì đòn bẩy được giấu qua một công cụ: **total return swap (TRS)**. Đây là case-study định lượng về **concentration risk** và **hidden leverage**, và về việc thông tin phân mảnh giữa các counterparty tạo ra một điểm mù chết người.

### Cơ chế định lượng

Total return swap là công cụ (chi tiết pricing ở cuốn Q-world) cho phép Archegos có được *toàn bộ exposure kinh tế* của một cổ phiếu mà **không sở hữu nó về mặt pháp lý**. Cơ chế: Archegos ký swap với một prime broker; broker mua cổ phiếu thật và cầm trên sổ *của broker*, Archegos nhận toàn bộ return (giá tăng + cổ tức) và trả một khoản phí funding, đặt cọc chỉ một phần nhỏ làm margin. Hệ quả định lượng gồm hai điều chết người.

**Điều một: leverage ẩn và không giới hạn ngang.** Với margin, nói, 20% trên một TRS, Archegos có exposure gấp $1/0.20 = 5\times$ vốn đặt cọc trên *mỗi* broker: bỏ \$1 tỷ margin lấy được \$5 tỷ exposure. Bây giờ làm điều này với *tám* prime broker khác nhau, mỗi broker chỉ thấy phần swap của riêng mình. Chia \$10 tỷ vốn thành tám phần ~\$1.25 tỷ, đặt mỗi phần với một broker để lấy $5\times$, mỗi chỗ mở ~\$6.25 tỷ exposure. Cộng lại: $8 \times 6.25 = 50$ tỷ exposure kinh tế — cũng chính bằng $10\ \text{tỷ vốn} \times 5\times = 50$ tỷ, nhất quán. Leverage kinh tế thực là $5\times$, nhưng nó *bị phân mảnh* nên không broker nào thấy tổng. Broker A thấy \$6.25 tỷ swap và nghĩ "khách hàng \$10 tỷ, cầm dưới \$7 tỷ với tôi, ổn." Broker A không biết còn bảy broker khác cũng đang cho Archegos y hệt vậy. **Không ai thấy bức tranh \$50 tỷ.** Đây là điểm khác biệt tinh tế với LTCM: LTCM leverage $25\times$ nhưng *hiện* trên một bảng cân đối; Archegos leverage chỉ $5\times$ nhưng *ẩn* qua tám counterparty — và cái ẩn giết theo cách khác, vì không hệ thống nào tổng hợp được nó để cảnh báo.

**Điều hai: concentration.** Archegos không rải \$50 tỷ trên nghìn cổ phiếu — nó dồn vào một nhúm name: ViacomCBS, Discovery, GSX Techedu, Baidu, Tencent Music, và vài cái khác. Position trong vài name này lớn đến mức bằng nhiều ngày volume của chính cổ phiếu đó. Đây là bom kép: leverage cao *và* concentration cao, hai thứ khuếch đại lẫn nhau.

Bây giờ cơ chế nổ, tính bằng số. Ngày 24/3/2021, ViacomCBS công bố phát hành cổ phiếu, giá giảm. Vì Archegos cầm exposure với leverage $5\times$, một cú giảm $10\%$ của ViacomCBS là lỗ $5 \times 10\% = 50\%$ trên margin đặt cho name đó → margin call ngay. Để nộp margin hoặc do broker bắt đầu giảm rủi ro, các name khác cũng bị bán → chúng cũng giảm (vì Archegos *là* phần lớn cầu của các name đó — concentration nghĩa là bạn là chính thị trường của cái bạn cầm). Giảm đồng loạt → margin call thêm → vòng xoáy y hệt LTCM.

Điểm định lượng độc đáo của Archegos là **race giữa các prime broker**. Khi vòng xoáy bắt đầu, các broker nhận ra Archegos vỡ nợ. Cổ phiếu Archegos cầm quá lớn so với ADV nên *không thể thanh lý cùng lúc mà không sập giá*. Broker nào bán trước thoát được ở giá tốt hơn; broker nào chần chừ ăn trọn cú sập. Morgan Stanley và Goldman bán sớm và quyết liệt, lỗ ít. Credit Suisse và Nomura chậm — một phần vì họ không nhận ra quy mô đủ nhanh, một phần vì bán một block bằng nhiều ngày volume tự nó đẩy giá xuống — và ăn phần lớn lỗ. Đây là một **liquidation game** kiểu prisoner's dilemma: hợp tác (thanh lý trật tự) tốt cho tất cả, nhưng cân bằng Nash là mỗi người chạy trước → sập giá cho tất cả. Con số: các name Archegos cầm (ViacomCBS, Discovery...) rơi 40–60% trong tuần đó khi \$20+ tỷ cổ phiếu bị đổ ra thị trường. Đây chính là square-root impact của chương 12 áp ở quy mô cực đoan: công thức $c\,\sigma\sqrt{\text{ADV\%}}$ với ADV% không còn là 5% mà là *nhiều trăm phần trăm* — bán một position bằng, nói, 10× ADV cho $\sqrt{10} = 3.16$ nhân với hệ số vốn đã lớn, đẩy giá không phải vài chục bps mà vài chục *phần trăm*. Impact bậc căn nghe "hiền" ở quy mô nhỏ, nhưng ở $10\times$ ADV nó vẫn là một cú đấm 40–60%.

### Bài học cho quant buy-side

Thứ nhất: **leverage bạn không đo được là leverage giết bạn.** Archegos leverage ~5× kinh tế nghe không khủng khiếp bằng LTCM 25×, nhưng nó *ẩn* — phân mảnh qua nhiều counterparty nên không hệ thống risk nào tổng hợp được. Bài học cho bạn: risk system phải tổng hợp exposure kinh tế qua *mọi* công cụ (cash, swap, option, future) và *mọi* counterparty thành một con số gross duy nhất. TRS trông không giống leverage trên bảng cân đối nhưng exposure kinh tế thì giống hệt. "On-balance-sheet leverage" là con số dối trá; "economic leverage" là con số thật.

Thứ hai: **concentration biến bạn thành thị trường của chính mình.** Khi position của bạn bằng nhiều ngày ADV, thanh khoản thoát của bạn ~0 — bạn không thể bán mà không sập giá cái bạn đang bán. Đặt một ràng buộc cứng trong optimizer (chương portfolio construction): position tối đa theo % ADV, sao cho bạn thoát được trong $n$ ngày ở tốc độ tham gia hợp lý. Archegos vi phạm điều này ở mức grotesque; đó là lý do cú giảm không dừng lại được.

Thứ ba, cầu sang Q-world: **prime broker cũng chết vì điểm mù thông tin.** Đây là mặt sell-side của cùng câu chuyện. Mỗi broker cho vay hợp lý theo *thông tin của riêng mình*, nhưng thông tin phân mảnh nghĩa là tổng rủi ro hệ thống lớn hơn tổng các phần được đo. Một quant buy-side nên rút ra: nếu counterparty của bạn (broker) không thấy được rủi ro thật, thì *bạn* cũng đang gánh rủi ro counterparty mà bạn không đo được — nếu broker sập vì khách khác, thanh khoản/funding của bạn bốc hơi theo. Rủi ro counterparty là song phương.

## B.6 XIV tháng 2/2018 — feedback loop rebalance cuối ngày của short-vol ETP

### Bối cảnh

Ngày 5/2/2018, "Volmageddon": chỉ số VIX gần gấp đôi trong một ngày, và một lớp sản phẩm — các ETP short volatility — bốc hơi gần như hoàn toàn sau giờ đóng cửa. Sản phẩm nổi tiếng nhất, XIV của Credit Suisse (một ETN cho phép nhà đầu tư retail "short VIX", tức đặt cược volatility sẽ giảm), mất ~96% giá trị trong một buổi tối và bị đóng vĩnh viễn. Đây là case-study định lượng thuần túy nhất trong phụ lục: một **feedback loop cơ học được viết ngay trong prospectus của sản phẩm**, tính được chính xác trước khi nó xảy ra, mà thị trường vẫn để nó nổ.

### Cơ chế định lượng

XIV cho holder một **inverse exposure to VIX futures**: nếu VIX futures giảm 1% một ngày, XIV tăng ~1%; nếu tăng 1%, XIV giảm ~1%. Trong nhiều năm, đây là cỗ máy in tiền vì **volatility risk premium** — VIX futures thường ở contango (kỳ hạn xa đắt hơn gần), nên short vol thu roll yield đều đặn (đây là carry, họ hàng với carry FX của chương 16 và cùng bản chất "bán bảo hiểm": thu premium đều, thỉnh thoảng bị xé). XIV tăng ~10× từ 2010 tới đầu 2018. Nhưng short vol là short gamma trên cả sản phẩm, và cái giá của short gamma là feedback loop khi vol nổ.

Đây là cơ chế chết, và nó nằm trong **daily rebalancing** để giữ đòn bẩy inverse không đổi. Hãy dẫn xuất chính xác lượng phải rebalance thay vì chỉ khẳng định. Gọi $k$ là đòn bẩy mục tiêu không đổi ($k = -1$ cho XIV: mỗi ngày cho $-1\times$ return của VIX futures). Đầu ngày, NAV là $V_0$, và để đạt $k$ lần exposure, nhà phát hành cầm notional futures $E_0 = k\,V_0$. Trong ngày, VIX futures cho return $r$. Hai điều xảy ra đồng thời:

$$V_1 = V_0(1 + k r) \quad\text{(NAV mới sau P\&L)}, \qquad E_{\text{drift}} = E_0(1+r) = kV_0(1+r) \quad\text{(exposure trôi theo giá)}.$$

Nhưng để giữ đúng đòn bẩy $k$ trên NAV *mới*, exposure cần thiết cuối ngày là $E_1 = k V_1 = k V_0(1 + kr)$. Lượng phải giao dịch để rebalance là hiệu số:

$$\Delta = E_1 - E_{\text{drift}} = kV_0\big[(1+kr) - (1+r)\big] = k(k-1)\,V_0\,r.$$

Cắm $k = -1$ (inverse): hệ số $k(k-1) = (-1)(-2) = 2$, nên

$$\boxed{\;\Delta = 2\,V_0\,r\;}$$

Dấu $+$: khi VIX futures *tăng* ($r>0$), nhà phát hành phải **mua** một lượng futures bằng $2V_0 r$ — đúng chiều xấu. Đây là điểm cần chính xác: bản thân *một lần* rebalance là *tuyến tính* theo $r$ (hệ số 2), không phải bậc hai. Cái làm nó nổ là hai lớp lồi chồng lên: (i) lượng mua $2V_0 r$ đó tự nó *đẩy $r$ lên cao thêm*, và $r$ cao hơn lại buộc mua thêm — feedback dương, cùng cấu trúc gamma squeeze của GME nhưng viết cứng vào cơ chế rebalance của sản phẩm; và (ii) qua một ngày biến động lớn, hiệu ứng tích lũy của việc rebalance liên tục theo NAV đang co lại làm tổn thất *cộng dồn theo bình phương* độ lớn cú dịch — chính là volatility drag $-\tfrac12 k^2\sigma^2$ mà ta sẽ gặp lại ở dưới. Nói cách khác, tuyến tính mỗi bước, nhưng lồi khi cộng qua feedback và qua thời gian.

Đặt số cho 5/2/2018. Tổng AUM các short-vol ETP (XIV, SVXY và họ hàng) cỡ \$3+ tỷ, gọi $V_0 \approx 3$ tỷ. Với công thức $\Delta = 2V_0 r$: nếu VIX futures kỳ hạn gần dịch lên $r \approx 0.5$ (tăng ~50% trong ngày, cỡ độ lớn thực tế của cú sốc), lượng phải mua để rebalance là $2 \times 3\ \text{tỷ} \times 0.5 = 3$ tỷ notional — và vì nhiều sản phẩm cùng rebalance cùng lúc (cùng cuối ngày, cùng chiều), tổng lực mua dồn vào cửa sổ cuối phiên. Ước lượng ngành lúc đó quy ra vega cần mua cỡ **~\$100 triệu vega VIX futures** vào cuối ngày — một lượng khổng lồ so với thanh khoản VIX futures lúc 4pm. Lượng mua cưỡng bức này bơm vào một thị trường đã mỏng đẩy VIX futures vọt thêm, làm NAV các ETP sập sâu hơn, buộc mua thêm nữa. XIV, được thiết kế để theo $-1\times$ daily, khi VIX futures kỳ hạn liên quan tăng tới ~96% thì XIV *phải* mất ~96% — và nó mất đúng chừng đó. Sản phẩm chạm ngưỡng "acceleration event" (điều khoản trong prospectus: nếu mất >80% trong ngày, ETN có thể bị chấm dứt) và Credit Suisse đóng nó.

Điểm định lượng đắt nhất: **cú nổ này tính được trước.** Bất kỳ ai đọc kỹ prospectus và làm đúng phép rebalance $\Delta = 2V_0 r$ ở trên đều thấy rằng một cú tăng VIX futures đủ lớn trong một ngày *bắt buộc* dẫn tới lượng mua feedback không thể hấp thụ, và rằng một sản phẩm $-1\times$ daily reset về nguyên tắc mất $\approx |r|$ khi futures dịch $r$ — nên một cú $r \to 1$ (gần gấp đôi) là gần như xóa sổ. Không cần dự báo *khi nào* vol nổ (bất khả); chỉ cần biết *nếu* nó nổ đủ mạnh, cấu trúc sản phẩm đảm bảo cái chết. Đây là rủi ro **path-dependent về daily reset**: một sản phẩm $-1\times$ daily *không* cho bạn $-1\times$ trên nhiều ngày; volatility drag (chương 14: mỗi ngày kéo return trung bình xuống $-\tfrac12 k^2\sigma^2$) và daily reset kết hợp làm sản phẩm này thua kém xa "short VIX một lần" qua thời gian, và có một mức sốc một ngày mà tại đó nó về 0 dù index không về 0.

### Bài học cho quant buy-side

Thứ nhất: **đọc cơ chế, không đọc lịch sử return.** XIV có track record đẹp nhiều năm (Sharpe cao, giống carry và short-vol). Nhưng return lịch sử che giấu một cấu trúc payoff có điểm nổ nội tại. Trước khi trade *bất kỳ* sản phẩm nào, hãy hỏi: "cơ chế rebalance/reset của nó là gì, và có cú sốc một ngày nào đưa nó về 0 không?" Với mọi sản phẩm leveraged/inverse daily-reset, công thức $\Delta = k(k-1)V_0 r$ trả lời câu này: có một $r$ tới hạn tại đó rebalance vượt thanh khoản và NAV về 0, và bạn phải biết mức đó.

Thứ hai: **short vol là short gamma là bán bảo hiểm** — cùng bài học carry (chương 16). Bạn thu premium đều (VRP, roll yield trong contango), skew âm cực nặng, và tail loss có thể là *toàn bộ vốn* trong một ngày. Sharpe lịch sử của short-vol lừa dối tàn nhẫn vì nó tính trên các mẫu *chưa có* cú nổ tail; deflated cho tail thật thì Sharpe hiệu dụng thấp hơn nhiều. Size short-vol bằng fraction Kelly *rất* nhỏ, và giả định vol Gaussian là tự sát ở đây.

Thứ ba, tổng quát nhất: **feedback loop cuối ngày là một họ rủi ro riêng.** Bất cứ khi nào một khối vốn lớn phải rebalance cơ học cùng chiều cùng lúc (leveraged ETF daily reset, index rebalance, target-vol fund cắt risk khi vol tăng), có một feedback loop có thể tính được — và giờ bạn có chính công thức để tính nó: lượng rebalance $\propto k(k-1)V_0 r$. Một quant tinh ý *trade quanh* nó — dự đoán lượng rebalance cưỡng bức cuối ngày và đứng đúng phía. Cùng cỗ máy giết XIV là một signal kiếm tiền cho người đo được nó.

## B.7 Crypto 2022 — FTX / 3AC và giải phẫu một chuỗi contagion

### Bối cảnh

Năm 2022 là năm crypto học lại mọi bài học của tài chính truyền thống, nén vào vài tháng và khuếch đại bởi việc *thiếu* mọi hàng rào mà TradFi đã xây sau các case trước. Chuỗi sự kiện: tháng 5, stablecoin thuật toán Terra/Luna sập từ \$40 tỷ market cap về ~0 trong vài ngày; cú sập này xóa sổ Three Arrows Capital (3AC), một hedge fund crypto ~\$10 tỷ dùng đòn bẩy nặng; 3AC vỡ nợ kéo theo các nền tảng cho vay (Celsius, Voyager, BlockFi); và tháng 11, sàn FTX — sàn giao dịch lớn thứ nhì thế giới, định giá \$32 tỷ — sụp trong một tuần khi lộ ra rằng nó đã dùng tiền gửi khách hàng cho quỹ liên kết Alameda Research. Đây là case-study về **counterparty risk, rủi ro sàn (exchange/custody risk), leverage, và contagion** — các rủi ro mà quant equity ít gặp vì có clearinghouse và custody tách bạch, nhưng trở lại dữ dội ở một thị trường không hạ tầng.

### Cơ chế định lượng

Ba cơ chế chồng lên nhau.

**Cơ chế một: reflexive collateral (3AC/Luna).** 3AC vay nặng và dùng chính các tài sản crypto biến động cao làm collateral, gồm cả các vị thế lớn trong Luna và GBTC (Grayscale Bitcoin Trust). Vấn đề định lượng: khi collateral của bạn *chính là* tài sản bạn đang cược, một cú giảm giá vừa làm lỗ vị thế *vừa* làm sụt giá trị collateral → margin call → buộc bán → đẩy giá xuống thêm → collateral sụt thêm. Đây là feedback loop y hệt LTCM/Archegos nhưng tệ hơn vì crypto vol ~4–5%/ngày (so với equity ~1%). Đặt số theo từng bước: giả sử 3AC vay với collateral haircut 20% (được vay \$80 trên \$100 collateral). Vốn tự có trên vị thế này là $100 - 80 = 20$, và nó điều khiển \$100 tài sản, nên leverage $= 100/20 = 5\times$ trên vốn. Giờ collateral rơi 30% trong một ngày (hoàn toàn bình thường ở crypto với vol 4–5%/ngày, chỉ là một cú $6$–$7\sigma$ mà crypto tạo ra vài lần mỗi năm): giá trị collateral từ \$100 xuống \$70 nhưng nợ vẫn \$80 → **collateral \$70 < nợ \$80**, position under-water, bên cho vay thanh lý cưỡng bức. So sánh sắc với equity: cùng leverage $5\times$ nhưng equity vol $1\%$/ngày thì một cú $30\%$ là $30\sigma$ — thực tế không bao giờ xảy ra trong một ngày; ở crypto nó là chuyện thường. Chính tỉ lệ vol $\sim 5\times$ này rút ngắn thời gian sống của cùng một sai lầm leverage từ *tuần* (LTCM) xuống *giờ*. Luna thì còn cực đoan hơn: nó về ~0, nên collateral bằng Luna bốc hơi *hoàn toàn* — haircut 20% chẳng bảo vệ được gì khi tài sản mất 100% — biến khoản vay thành lỗ trắng cho bên cho vay.

**Cơ chế hai: contagion qua counterparty chung.** 3AC vay từ nhiều nền tảng: Celsius, Voyager, BlockFi, Genesis. Khi 3AC vỡ, mỗi bên cho vay ăn một khoản lỗ đúng lúc *chính họ* cũng đang chịu rút tiền hàng loạt (bank run) từ khách của họ. Đây là **contagion graph**: các thực thể nối với nhau qua khoản vay, và default của một node lan qua cạnh sang node kế. Định lượng: nếu Celsius cho 3AC vay \$X và mất phần lớn, đồng thời khách rút tiền, Celsius mất khả năng thanh toán → khách Celsius mất tiền → niềm tin toàn thị trường sụt → mọi tài sản crypto bán tháo → collateral của *mọi* bên vay khác sụt → thêm margin call. Một default lan thành nhiều default vì các balance sheet đan vào nhau và cùng cầm tài sản tương quan ~1 trong stress (lại là bài học correlation breakdown của B.1/B.2: trong risk-off crypto, "diversification" giữa các coin biến mất, mọi thứ đi cùng chiều xuống).

**Cơ chế ba: rủi ro sàn / custody (FTX).** Đây là rủi ro *không có analog trực tiếp* trong equity định chế vì ở TradFi, tài sản khách được custody tách bạch khỏi bảng cân đối của broker (sau các cải cách). FTX vi phạm điều tối kỵ này: nó dùng ~\$8 tỷ tiền gửi khách để tài trợ các cược đòn bẩy của Alameda. Cơ chế định lượng của cú sập: FTX phát hành token riêng FTT và Alameda cầm FTT như *tài sản* lớn trên balance sheet — nhưng FTT là token do chính FTX tạo ra, thanh khoản mỏng, nên "giá trị" \$X tỷ của nó là ảo (không thể bán mà không sập giá, y hệt bài học concentration của Archegos: bạn là thị trường của chính cái bạn cầm). Khi CoinDesk lộ balance sheet Alameda ngày 2/11 và Binance thông báo bán FTT, giá FTT sập → tài sản Alameda bốc hơi → lộ ra FTX không đủ tiền trả khách → **bank run**: khách rút \$6 tỷ trong 72 giờ, FTX không có tiền (vì tiền khách đã bị Alameda dùng), sàn đóng cửa, phá sản. Con số: từ định giá \$32 tỷ về phá sản trong ~1 tuần.

Điểm định lượng chốt: **counterparty risk và custody risk là rủi ro không xuất hiện trong bất kỳ price series nào bạn backtest.** Backtest strategy crypto của bạn trên dữ liệu giá của FTX cho Sharpe đẹp — và toàn bộ Sharpe đó bằng 0 vào ngày sàn giữ tiền của bạn phá sản. Không có mô hình return nào bắt được rủi ro "nơi cầm tiền của bạn biến mất". Đây là một rủi ro *nhị phân, không phải Gaussian*: hoặc sàn ổn (bạn được toàn bộ return), hoặc sàn sập (bạn mất ~toàn bộ vốn), không có phân phối liên tục ở giữa để đưa vào vol. Một cách định lượng để thấy sự tàn khốc: nếu xác suất sàn sập trong một năm là chỉ $p = 2\%$, thì kỳ vọng "chi phí custody" bạn phải trừ vào return hàng năm là $\approx p \times 100\% = 2\%$ — và nó ăn thẳng vào một chiến lược Sharpe 1 với vol 10% (return kỳ vọng 10%), cắt một phần năm alpha, một khoản không hề nhỏ mà không price series nào nhắc bạn.

### Bài học cho quant buy-side

Thứ nhất: **rủi ro không nằm trong price series là rủi ro nguy hiểm nhất.** Mọi công cụ của cuốn sách này — vol, VaR, factor model, Kelly — làm việc trên *giá*. Counterparty/custody risk không có giá; nó là một biến nhị phân ngoài mô hình. Với crypto (và bất kỳ thị trường thiếu hạ tầng nào), bạn phải quản nó *ngoài* framework định lượng: đa dạng hóa sàn/custodian, giới hạn tiền để trên bất kỳ một venue nào, ưu tiên self-custody/qualified custodian, và coi mọi counterparty như có xác suất default khác 0 dù price series im lặng về điều đó.

Thứ hai: **collateral tương quan với position là bom kép.** Đừng bao giờ dùng chính tài sản bạn đang long làm collateral để long thêm nó — đó là reflexivity thuần túy, cú giảm ăn cả hai vế và kích hoạt margin spiral. Đây là phiên bản crypto của bài học leverage LTCM, nhưng với vol 4–5×/ngày, margin của lỗi này chỉ tính bằng *giờ*, không phải tuần — đúng như phép tính $70 < 80$ ở trên cho thấy chỉ cần một ngày.

Thứ ba, tổng hợp toàn phụ lục: **contagion nghĩa là rủi ro của bạn bao gồm rủi ro của những kẻ bạn chưa từng giao dịch cùng.** 3AC không phải counterparty của phần lớn nạn nhân cuối cùng, nhưng default của nó lan qua các node trung gian tới họ. Trong một thị trường balance sheet đan xen và tài sản tương quan ~1 khi stress, rủi ro hệ thống lớn hơn tổng rủi ro song phương bạn đo được. Đây là cùng một sự thật đã xuất hiện ở Quant Quake (vị thế chung), LTCM (correlation ẩn), và Archegos (thông tin phân mảnh): **trong khủng hoảng, mọi thứ trở thành một cược, và cược đó là "hệ thống có giữ được không."**

## Sợi chỉ đỏ xuyên bảy case

Nhìn lại, bảy vụ nổ này không phải bảy tai nạn khác nhau mà là bảy hình chiếu của cùng một cấu trúc. Trong lúc bình yên, mỗi vị thế trông độc lập: các quỹ Quant Quake beta-neutral với nhau, các trade LTCM trải trên nhiều thị trường, các name Archegos khác ngành, các coin của 3AC "đa dạng." Correlation ma trận $\Sigma$ đo trên dữ liệu êm nói với bạn rằng bạn được diversify. Rồi stress đến, và một factor ẩn — crowding, liquidity premium, leverage cưỡng bức, dealer gamma, bank run — trồi lên chiếm toàn bộ variance, correlation nhảy về 1, và cái bạn tưởng là hàng chục cược độc lập lộ ra là *một* cược duy nhất được đòn bẩy khuếch đại. Đây là **correlation breakdown**, và nó là mẫu số chung định lượng của mọi khủng hoảng trong phụ lục. Con số B.1 cho thấy nó cụ thể: cùng một danh mục, correlation cặp trượt từ ~0.3 lên ~0.81 chỉ vì factor ẩn chuyển từ chiếm 30% lên chiếm 80% variance — không cần cổ phiếu nào đổi, chỉ cần regime đổi.

Ba cơ chế khuếch đại đi kèm, và bạn nên nhận diện chúng như phản xạ. **Leverage** biến một cú dịch factor tầm thường (3–4%) thành xóa sổ (100% vốn) — LTCM 25× (drawdown sống được chỉ $1/25 = 4\%$), stat-arb 6–8×, Archegos ẩn 5× phân mảnh qua tám broker, crypto reflexive collateral. Nhớ quy tắc trần: leverage $L$ cho phép bạn sống qua drawdown tối đa $1/L$ trên tài sản cơ sở, không hơn. **Forced flow** biến hành động phòng thủ hợp lý của cá nhân (deleverage, cover short, hedge gamma, rebalance $2V_0 r$, nộp margin) thành cỗ máy tự hủy tập thể — mọi case đều có một vòng "bán vì lỗ → đẩy giá → lỗ thêm → bán thêm." Và **hidden structure** — factor chung không đo, leverage phân mảnh, cơ chế reset trong prospectus, counterparty không thấy được — nghĩa là rủi ro thật lớn hơn cái bất kỳ hệ thống nào đo được, vì thông tin phân mảnh và mô hình chỉ nhìn giá.

Đối chứng Medallion cho biết lối ra không phải là né rủi ro mà là **tôn trọng capacity và kỷ luật sizing**: edge nhỏ × breadth cao ($IR = IC\sqrt{BR}$, tăng $\sqrt{BR}$ thay vì đòn bẩy) thay vì edge to × leverage cao, trả lại vốn khi đụng trần impact 31 bps thay vì scale đến vỡ, và luôn size cho cái đuôi bạn chưa quan sát chứ không cho vol bạn đã đo. Toàn bộ bộ máy định lượng của cuốn sách — half-Kelly chống sai số $\mu$ và cú nhảy $\Sigma$, deflated Sharpe chống ảo giác edge, stress correlation thay vì VaR historical, ràng buộc %ADV trong optimizer, tổng hợp economic leverage qua mọi công cụ và counterparty — không phải là những chi tiết kỹ thuật rời rạc. Chúng là bảy bài học này, đã được mã hóa trước, để lần khủng hoảng tới bạn là quỹ *không* deleverage đúng đáy, mà là quỹ mua vào.

# Phụ lục C: Từ điển thuật ngữ P-world

Phụ lục này khác mọi chương còn lại của cuốn sách. Nó không kể một câu chuyện tuyến tính, mà là nơi bạn quay về khi gặp một thuật ngữ nửa quen nửa lạ và cần một định nghĩa gọn nhưng đủ chính xác để đọc tiếp. Một cuốn giáo trình quant tử tế phải làm được hai việc mà văn xuôi thuần túy khó làm cùng lúc: dẫn dắt trực giác qua nhiều trang, và cho phép tra cứu tức thời trong một dòng. Từ điển giải bài toán thứ hai. Vì thế mỗi mục ở đây được viết theo một kỷ luật riêng — một câu, đủ để phân biệt thuật ngữ đó với các thuật ngữ họ hàng dễ nhầm, và khi có thể thì gắn một mỏ neo bằng số để bạn nhớ được "cỡ" của khái niệm chứ không chỉ nhớ tên gọi. Con số dính lâu hơn định nghĩa; ai từng tự tay tính ra $\lambda=2\times10^{-5}$ cho một cổ phiếu mỏng sẽ không bao giờ còn coi market impact là chuyện trừu tượng.

Trước khi liệt kê, cần nói rõ ba nguyên tắc đọc từ điển này. Thứ nhất, mọi định nghĩa quant đều có hai lớp: lớp toán học (khái niệm này *là gì* về mặt hình thức) và lớp thị trường (khái niệm này *dùng để làm gì*, ai trả tiền cho nó, và vì sao nó chưa bị arbitrage sạch). Một định nghĩa chỉ có lớp toán là định nghĩa của giáo sư; một định nghĩa chỉ có lớp thị trường là định nghĩa của trader thiếu kỷ luật. Các mục dưới đây cố gắng chạm cả hai. Thứ hai, nhiều thuật ngữ nghe giống nhau nhưng sống ở những tầng khác nhau của pipeline — có cái là *đặc tính dữ liệu* (stationarity, cointegration), có cái là *phương pháp ước lượng* (Kalman, HMM), có cái là *kỷ luật quy trình* (purged CV, deflated Sharpe), có cái là *hiện tượng thị trường* (crowding, limits to arbitrage). Nhầm tầng là nguồn gốc của phần lớn sai lầm nghiên cứu: người ta tưởng mình có bug ở tầng ước lượng trong khi bệnh nằm ở tầng dữ liệu. Thứ ba, con số trong định nghĩa là *cỡ điển hình*, không phải hằng số vật lý — một IC "tốt" là 0.02–0.05 vì đó là dải quan sát được trên cross-section cổ phiếu US, chứ không phải vì có định luật nào ấn định thế. Đọc con số như thang đo trực giác, không như tín điều.

## Bảng 1 — Thuật ngữ nền tảng

| Thuật ngữ | Nghĩa |
|---|---|
| Alpha | Return vượt mức bù rủi ro hệ thống; hoặc: tín hiệu dự báo return tương đối |
| Beta | Độ nhạy với thị trường; phần return "rẻ" mua được bằng ETF |
| ADV | Average daily volume — khối lượng giao dịch ngày trung bình; thước capacity |
| Breadth (BR) | Số cược độc lập mỗi năm (Fundamental Law) |
| Cointegration | Hai chuỗi không dừng có tổ hợp tuyến tính dừng — nền pairs trading |
| Crowding | Nhiều quỹ cùng vị thế — rủi ro deleveraging dây chuyền (quant quake 2007) |
| CTA | Commodity trading advisor — quỹ trend-following futures |
| Drawdown (MDD) | Sụt giảm đỉnh-đáy của đường vốn; thước đo "đau" |
| DSR | Deflated Sharpe Ratio — Sharpe đã trừ ảo giác multiple testing |
| Factor | Đặc tính chung giải thích return chéo nhiều tài sản (value, momentum...) |
| IC | Information coefficient — correlation(tín hiệu, forward return); 0.02–0.05 là tốt |
| IR | Information ratio — alpha/tracking error; $IR \approx IC\times\sqrt{BR}$ |
| IS | Implementation shortfall — tổng chi phí thực thi so với giá quyết định |
| Look-ahead bias | Dùng thông tin chưa tồn tại tại thời điểm quyết định — tội lỗi số 1 |
| Market impact | Giá dịch chuyển do chính lệnh của mình; $\sim\sigma\sqrt{Q/V}$ |
| Market-neutral | Danh mục beta ≈ 0 (thường thêm sector/factor-neutral) |
| Meta-labeling | ML dự đoán xác suất model chính đúng → quyết định size |
| OU process | Ornstein-Uhlenbeck — mean reversion; cho half-life của spread |
| PIT | Point-in-time — dữ liệu đúng như được biết tại thời điểm đó |
| PM / QR / QD | Portfolio manager / quant researcher / quant developer |
| Pod shop | Quỹ multi-manager: nhiều đội độc lập, risk trung tâm, cắt lỗ nhanh |
| Purged CV | Cross-validation có loại mẫu chồng lấn thời gian + embargo |
| Sharpe ratio | Excess return / vol (annualized); ngôn ngữ chung của hiệu suất |
| Slippage | Chênh lệch giá khớp thực tế vs giá dự kiến |
| Stat-arb | Statistical arbitrage — mean reversion residual, hàng nghìn tên, factor-neutral |
| Survivorship bias | Dataset chỉ còn kẻ sống sót → backtest ảo |
| TCA | Transaction cost analysis — đo/phân rã chi phí thực thi |
| Transfer coefficient | Phần alpha sống sót qua ràng buộc/chi phí khi xây danh mục |
| Triple-barrier | Cách label AFML: lời/lỗ/hết giờ — barrier nào chạm trước |
| Turnover | Tỷ lệ danh mục thay mỗi kỳ; cầu nối sang chi phí |
| Universe | Tập tài sản chiến lược được phép trade (định nghĩa PIT) |
| Vol targeting | Scale vị thế theo $1/\sigma$ dự báo để vol danh mục ổn định |
| Walk-forward | Fit quá khứ → test đoạn kế tiếp → cuộn — mô phỏng đời thật |
| Winsorize | Clip outliers về ngưỡng phân vị trước khi ước lượng |

Bảng này là bộ xương của cả cuốn sách, nên đáng dừng lại ở ba mục dễ bị hiểu hời hợt nhất. Sharpe ratio là ngôn ngữ chung, nhưng phải nhớ nó là đại lượng *đã annualize*: một chiến lược có Sharpe hằng ngày $0.06$ (return trung bình $0.06\%$/ngày trên vol $1\%$/ngày) quy ra Sharpe năm $0.06\times\sqrt{252}=0.95$ — chính con số momentum quen thuộc của cuốn sách. Nhân với $\sqrt{252}$ chứ không phải $252$, vì vol co giãn theo căn thời gian còn return co giãn tuyến tính; quên gốc căn này là cách nhanh nhất để báo cáo một Sharpe lố mười sáu lần. Information ratio thì là anh em của Sharpe nhưng đo alpha trên tracking error thay vì trên tổng vol, và công thức Fundamental Law $IR\approx IC\times\sqrt{BR}$ giải thích vì sao edge nhỏ vẫn thắng: với momentum $IC\approx0.025$ và breadth $BR\approx 1000$ tên giao dịch lại mỗi năm, $IR\approx 0.025\times\sqrt{1000}=0.79$ — một chiến lược đáng sống chỉ nhờ *số lượng*, không nhờ độ chính xác từng cược. Transfer coefficient là mục người mới hay bỏ qua nhưng dân trong nghề ám ảnh: nó là phần alpha lý thuyết sống sót qua ràng buộc thực (không được short quá, không vượt $5\%$ ADV, phải neutral factor), và một transfer coefficient $0.6$ nghĩa là bạn đánh mất $40\%$ edge chỉ trong khâu xây danh mục — trước khi mất thêm cho chi phí giao dịch.

## Bảng 2 — Regime, structural change & mô hình trạng thái ẩn

Nhóm thuật ngữ này trả lời một câu hỏi mà thị trường liên tục đặt ra: *hôm nay có còn là thế giới của hôm qua không?* Một chiến lược momentum lời đều trong regime "trending" có thể mất sạch trong regime "choppy"; một pair đang cointegrated có thể đứt liên kết khi một trong hai công ty bị mua lại. Các công cụ dưới đây đều là những cách khác nhau để phát hiện, mô hình hóa, hoặc phản ứng với sự thay đổi cấu trúc — và điểm chung của chúng là đều cố tách phần *tín hiệu bền* khỏi phần *nhiễu nhất thời*, mỗi công cụ ở một tầng khác nhau.

| Thuật ngữ | Nghĩa |
|---|---|
| Regime switching | Mô hình giả định thị trường luân phiên giữa vài trạng thái ẩn (bull/bear, calm/turbulent), mỗi trạng thái có $\mu,\sigma$ riêng và ma trận xác suất chuyển |
| Hidden Markov Model (HMM) | Chuỗi trạng thái ẩn Markov phát ra quan sát; ước lượng bằng Baum-Welch (EM), giải mã bằng Viterbi — nền của regime detection |
| Transition matrix | Ma trận $P$ với $P_{ij}=\Pr(\text{state}_j\mid\text{state}_i)$; đường chéo cao = regime dai dẳng (persistent) |
| Viterbi decoding | Thuật toán quy hoạch động tìm chuỗi trạng thái ẩn *khả dĩ nhất* cho toàn bộ quan sát |
| Kalman filter | Bộ lọc đệ quy cập nhật ước lượng state Gauss tuyến tính theo thời gian thực; predict rồi update theo Kalman gain |
| Kalman gain | Trọng số $K$ quyết định tin quan sát mới hay tin dự báo cũ nhiều hơn; $K$ lớn khi đo chính xác, đối tượng biến động |
| State-space model | Khung tổng quát tách "state ẩn tiến hóa" khỏi "quan sát nhiễu"; Kalman là nghiệm cho trường hợp tuyến tính-Gauss |
| VECM | Vector Error Correction Model — VAR cho chuỗi cointegrated, có số hạng "kéo về cân bằng" $\alpha\beta'y_{t-1}$ |
| Johansen test | Kiểm định cointegration đa biến qua rank của ma trận $\Pi$; cho biết có bao nhiêu quan hệ cân bằng dài hạn |
| Changepoint detection | Phát hiện thời điểm phân phối của chuỗi đổi (đổi mean/vol/tương quan) |
| CUSUM | Cumulative sum — cộng dồn độ lệch so với mục tiêu; báo động khi tổng vượt ngưỡng $h$; phát hiện drift sớm |
| Structural break | Thay đổi bền vững trong quan hệ thống kê (hệ số hồi quy, mean); Chow/Bai-Perron test để định vị |

Để thấy vì sao HMM không phải trò chơi trừu tượng, hãy lấy một ví dụ tối giản hai trạng thái. Gọi state 1 là "calm" với return kỳ vọng $\mu_1=+0.05\%$/ngày, vol $\sigma_1=0.8\%$; state 2 là "turbulent" với $\mu_2=-0.10\%$/ngày, $\sigma_2=2.5\%$. Ma trận chuyển
$$P=\begin{pmatrix}0.98 & 0.02\\ 0.10 & 0.90\end{pmatrix}$$
nói rằng calm rất dính (98% ở lại), còn turbulent tan nhanh hơn (chỉ 90% ở lại). Xác suất dài hạn (stationary distribution) là nghiệm của $\pi P=\pi$: đặt $\pi=(\pi_1,\pi_2)$, phương trình cân bằng dòng chảy giữa hai state là $\pi_1\cdot0.02=\pi_2\cdot0.10$, nên $\pi_2/\pi_1=0.02/0.10=0.2$; kết hợp $\pi_1+\pi_2=1$ được $\pi_1=1/1.2=0.833$ và $\pi_2=0.167$. Diễn dịch: thị trường ở regime calm khoảng $83\%$ thời gian, turbulent $17\%$ — con số này khớp trực giác rằng khủng hoảng hiếm nhưng không hiếm đến mức có thể bỏ qua. Half-life của regime turbulent (thời gian để xác suất còn ở đó giảm còn một nửa) tính từ $0.90^h=0.5$, tức $h=\ln 0.5/\ln 0.9\approx 6.6$ ngày — turbulence trung bình kéo dài khoảng một tuần rưỡi giao dịch, khớp với cảm nhận rằng "vol spike" thường tự tiêu trong ít ngày. Chính hai con số này — tần suất $17\%$ và half-life $6.6$ ngày — là thứ một risk manager cần, không phải bản thân ma trận $P$: chúng nói với anh ta rằng nên chuẩn bị ngân sách rủi ro cho một cú turbulent vài lần mỗi năm, mỗi lần đủ ngắn để không nên tháo chạy nhưng đủ đau để không nên phớt lờ.

Kalman filter thì đáng một ví dụ số vì công thức của nó nghe trừu tượng nhưng bản chất chỉ là một trung bình có trọng số giữa "điều tôi đoán" và "điều tôi vừa thấy". Giả sử ta muốn ước lượng hedge ratio $\beta_t$ giữa hai cổ phiếu, và cho phép nó trôi theo thời gian — đây chính là lý do Kalman thắng OLS tĩnh trong pairs trading, vì quan hệ giữa hai tên hiếm khi là một hằng số suốt nhiều năm. Mô hình gồm phương trình state $\beta_t=\beta_{t-1}+w_t$ với $w_t$ là process noise phương sai $Q$, và phương trình quan sát $y_t=\beta_t x_t+v_t$ với measurement noise phương sai $R$. Giả sử ước lượng hiện tại là $\hat\beta=1.20$ với variance $P=0.04$ (tức sai số chuẩn $0.20$). Đặt process noise $Q=0.001$, measurement noise $R=0.09$ (tương đương $\sigma_v=0.30$), và bước này $x_t=1$. Bước *predict* để độ bất định nở ra vì state có thể đã trôi: $P^-=P+Q=0.041$. Bước *update* tính Kalman gain
$$K=\frac{P^- x}{x^2P^-+R}=\frac{0.041}{0.041+0.09}=0.313.$$
Nếu quan sát mới ngụ ý $\beta$ gần $y/x=1.50$, ta cập nhật $\hat\beta_{\text{new}}=1.20+0.313\times(1.50-1.20)=1.20+0.094=1.294$, và variance co lại $P_{\text{new}}=(1-K)P^-=0.687\times0.041=0.0282$ (sai số chuẩn giảm từ $0.20$ xuống $0.168$). Đọc ý nghĩa: gain $0.31$ nghĩa là hệ tin quan sát mới khoảng một phần ba và tin dự báo cũ hai phần ba — hợp lý, vì nhiễu đo ($R=0.09$) lớn hơn hẳn độ bất định của state ($P^-=0.041$), nên quan sát mới "đáng ngờ" hơn dự báo. Nếu ta tăng $Q$ (cho $\beta$ được phép trôi nhanh hơn), gain tăng theo, filter bám thị trường sát hơn nhưng cũng giật hơn; đó chính là nút vặn duy nhất mà QR phải tinh chỉnh, và tinh chỉnh nó là cả một nghệ thuật — đặt $Q$ quá cao thì hedge ratio nhảy múa theo nhiễu, quá thấp thì filter chậm chân khi quan hệ thật sự đổi.

CUSUM đáng một minh họa vì nó là bộ lọc sự kiện kinh điển của AFML, và nó thuộc tầng *lấy mẫu* chứ không phải tầng dự báo — một phân biệt quan trọng. Công thức một phía là $S_t=\max(0,\,S_{t-1}+(x_t-\mathbb{E}[x_{t-1}]))$, báo động khi $S_t\ge h$ rồi reset về 0. Giả sử ta theo dõi log-return với kỳ vọng 0 và đặt ngưỡng $h=5\%$. Chuỗi return ngày (đơn vị %) là $+0.4,\,+0.6,\,-0.2,\,+0.9,\,+1.1,\,+0.8,\,+1.0$. Tổng dồn tương ứng: $0.4,\,1.0,\,0.8,\,1.7,\,2.8,\,3.6,\,4.6$ — vẫn chưa chạm 5% (chú ý ngày $-0.2$ kéo tổng xuống, đúng bản chất "chỉ đếm drift một chiều"). Thêm một ngày $+1.2$: $S=4.6+1.2=5.8\ge5$, báo động rằng đã tích lũy đủ drift dương, và ta lấy chính thời điểm này làm một "event" để dán nhãn thay vì lấy mẫu theo lịch cố định. Vẻ đẹp của CUSUM là nó *tự động thưa* mẫu trong giai đoạn thị trường đi ngang và *dày* mẫu khi có chuyển động thật — đúng chỗ ta muốn model tập trung học, và tránh được cái bệnh của sampling theo giờ đồng hồ là nhồi cho model hàng nghìn mẫu gần như trùng nhau trong những phiên buồn tẻ.

## Bảng 3 — Labeling, feature engineering & chống overfitting (AFML core)

Đây là nhóm khái niệm đắt giá nhất của quant hiện đại, vì hầu hết thất bại của ML trong tài chính không nằm ở model mà ở cách dán nhãn và cách kiểm định. Một model XGBoost tinh vi trên nhãn tồi và CV rò rỉ sẽ thua một hồi quy tuyến tính trên nhãn sạch và CV nghiêm — và điều tàn nhẫn là bạn sẽ không biết điều đó cho tới khi tiền thật đổ vào, vì mọi thứ trông tuyệt vời in-sample. Nhóm này tồn tại để bạn tự bắt mình gian lận trước khi thị trường bắt bạn.

| Thuật ngữ | Nghĩa |
|---|---|
| Triple-barrier | Dán nhãn theo hàng rào: chốt lời trên, cắt lỗ dưới, hết giờ ngang — barrier nào chạm trước quyết định nhãn +1/−1/0 |
| Meta-labeling | Tầng ML thứ hai dự đoán *xác suất model chính đúng* → dùng để quyết định có vào và size bao nhiêu, không đổi hướng |
| Fractional differentiation | Vi phân bậc thực $d\in(0,1)$ để làm chuỗi dừng mà giữ tối đa memory; thay cho vi phân bậc 1 xóa sạch trí nhớ |
| Purged K-fold CV | K-fold có *xóa* (purge) mẫu train chồng lấn thời gian với test để chặn rò rỉ nhãn |
| Embargo | Cấm một khoảng thời gian ngay sau test-fold khỏi train, chặn rò rỉ do serial correlation dư |
| CPCV | Combinatorial Purged CV — thử mọi tổ hợp fold làm test, sinh nhiều đường backtest, ước lượng phân phối Sharpe |
| Deflated Sharpe (DSR) | Sharpe điều chỉnh cho số cấu hình đã thử, độ dài mẫu, skew/kurtosis — chống ảo giác multiple testing |
| PBO | Probability of Backtest Overfitting — xác suất cấu hình tốt nhất in-sample thành dưới trung vị out-of-sample |
| Sample weights | Trọng số mẫu theo độ hiếm / độ chồng lấn nhãn (uniqueness) để mẫu chồng nhau không bị đếm nhiều lần |

Fractional differentiation xứng đáng một ví dụ số vì ai cũng biết "phải làm chuỗi dừng" nhưng ít người thấy được cái giá của vi phân bậc 1. Giá cổ phiếu $P_t$ gần như random walk (không dừng, ADF không bác bỏ giả thuyết nghiệm đơn vị); return $\Delta P_t=P_t-P_{t-1}$ thì dừng nhưng đã vứt sạch *mức* giá — model không còn biết cổ phiếu đang đắt hay rẻ so với lịch sử của chính nó. Fracdiff dung hòa bằng chuỗi trọng số nhị thức tổng quát: với bậc $d$, trọng số truy hồi là $\omega_k=\omega_{k-1}\cdot\frac{-(d-k+1)}{k}$, bắt đầu từ $\omega_0=1$. Lấy $d=0.4$ và tính từng bước: $\omega_0=1$; $\omega_1=1\cdot\frac{-(0.4-0)}{1}=-0.4$; $\omega_2=-0.4\cdot\frac{-(0.4-1)}{2}=-0.4\cdot\frac{0.6}{2}=-0.12$; $\omega_3=-0.12\cdot\frac{-(0.4-2)}{3}=-0.12\cdot\frac{1.6}{3}=-0.064$; $\omega_4=-0.064\cdot\frac{-(0.4-3)}{4}=-0.064\cdot\frac{2.6}{4}\approx-0.0416$. Chuỗi fracdiff là $\tilde P_t=\sum_k\omega_k P_{t-k}=P_t-0.4P_{t-1}-0.12P_{t-2}-0.064P_{t-3}-\dots$ So với return thuần (chỉ có $\omega_0=1,\omega_1=-1$, cắt phăng mọi thứ ở độ trễ 2 trở đi), fracdiff giữ một cái đuôi trọng số suy giảm chậm — nó *nhớ* các mức giá cũ với trọng số nhỏ dần thay vì quên sạch. Thực nghiệm điển hình trên cổ phiếu US cho thấy $d\approx0.3$–$0.5$ là đủ để ADF bác bỏ giả thuyết non-stationary, trong khi correlation giữa chuỗi fracdiff và chuỗi giá gốc vẫn giữ trên $0.9$ — tức gần như không mất thông tin mức giá. Vi phân bậc 1 thì đẩy correlation đó về gần 0. Đó là toàn bộ lý do fracdiff tồn tại: đạt tính dừng mà không phải trả bằng trí nhớ, một sự đánh đổi mà vi phân bậc nguyên buộc bạn phải chịu toàn phần.

Purged K-fold và embargo cần một ví dụ cụ thể vì rò rỉ nhãn là loại look-ahead tinh vi nhất — nó không nằm ở feature mà nằm ở *nhãn*, nên rất khó nhìn thấy. Giả sử ta dán nhãn triple-barrier với horizon tối đa 10 ngày, nghĩa là nhãn của mẫu ngày $t=100$ phụ thuộc vào diễn biến giá tận ngày 110. Nếu CV thông thường bỏ ngày 105 vào *test* nhưng ngày 100 vào *train*, thì mẫu train ngày 100 đã "nhìn thấy" một tương lai trùng lặp với test — model học được một mối liên hệ giả mà nó không thể có ngoài đời. Purge sửa điều này bằng cách vứt khỏi train mọi mẫu có label-window chồng lấn với test-fold. Với horizon 10 ngày, nếu test là ngày 200–260, ta purge các mẫu train từ ngày 190 (nhãn của nó chạm tới 200) đến 260. Embargo thêm một vùng đệm ngay sau test để chặn rò rỉ qua autocorrelation dư của return: đặt embargo bằng 1% của 1000 mẫu tức 10 ngày, ta cấm luôn train ngày 261–270. Cái giá phải trả là mất vài phần trăm dữ liệu train; cái được là Sharpe out-of-sample không còn bị thổi phồng bởi rò rỉ — chênh lệch giữa CV ngây thơ và CV có purge thường vào khoảng $0.3$–$0.5$ Sharpe trên cùng một model, tức đủ lớn để biến một chiến lược "đáng triển khai" thành một chiến lược "thật ra chẳng có gì".

Deflated Sharpe là công cụ chống tự lừa dối quan trọng nhất, và nó xứng đáng một dẫn xuất đầy đủ. Bài toán: bạn thử $N$ cấu hình chiến lược trên $T$ năm dữ liệu rồi chọn cái Sharpe cao nhất. Ngay cả khi *mọi* cấu hình đều vô dụng (Sharpe thật bằng 0), cái tốt nhất trong $N$ lần rút vẫn có Sharpe dương chỉ do may rủi — đây là bản chất của cực đại thống kê trên nhiều phép thử độc lập. Kỳ vọng của Sharpe cao nhất khi mọi edge đều là ảo xấp xỉ
$$SR_0=\sqrt{\frac{2\ln N}{T}}.$$
Với $N=1000$ cấu hình và $T=10$ năm: $\ln 1000=6.908$, nên $SR_0=\sqrt{2\times6.908/10}=\sqrt{1.382}=1.176\approx1.18$. Nghĩa là: chỉ nhờ multiple testing, cấu hình tốt nhất trong 1000 phép thử trên 10 năm *kỳ vọng* đạt Sharpe $1.18$ dù chẳng có edge nào thật. Nếu Sharpe quan sát của bạn là $1.2$ — cao hơn ngưỡng ảo giác đúng một chút xíu — thì DSR (xác suất Sharpe thật lớn hơn 0) chỉ quanh $50\%$: một cú tung xu, hoàn toàn có thể là đồ giả. Công thức đầy đủ của DSR còn phạt thêm skew âm và kurtosis cao của chuỗi return (đuôi béo làm ước lượng Sharpe kém tin cậy hơn), nhưng ngay cả bản rút gọn này đã đủ dạy bài học vận hành cốt lõi: đừng bao giờ báo cáo một Sharpe mà tách rời khỏi số lần thử bạn đã tốn để tìm ra nó. Sharpe không kèm $N$ là một con số vô nghĩa.

PBO đo cùng căn bệnh nhưng bằng phương pháp combinatorial thay vì công thức đóng. Ta chia backtest thành nhiều đoạn, ghép nửa số đoạn làm in-sample và nửa còn lại làm out-of-sample theo *mọi* tổ hợp có thể, và trong mỗi tổ hợp chọn cấu hình tốt nhất IS rồi xem nó xếp hạng ở đâu trong OOS. PBO là tỷ lệ các tổ hợp mà cấu hình thắng IS rơi xuống dưới trung vị OOS. PBO $=50\%$ nghĩa là "cấu hình vô địch in-sample của bạn không tốt hơn tung xu ngoài mẫu" — cờ đỏ rõ ràng. Trong thực hành, một chiến lược đáng triển khai thường có PBO dưới $20$–$30\%$; cao hơn thế thì cái bạn tìm ra nhiều khả năng là hình dạng của nhiễu quá khứ chứ không phải cấu trúc thật. Điểm hay của PBO so với DSR là nó không cần giả định phân phối, chỉ cần đủ dữ liệu để cắt thành nhiều đoạn — bù lại nó tốn tính toán hơn nhiều.

## Bảng 4 — Microstructure & order flow

Nhóm này trả lời câu hỏi ai-trả-tiền-cho-alpha ở tầng vi mô nhất: giá dịch chuyển vì có người mua bán, và mỗi giao dịch để lại một dấu vết. Ai đọc được dấu vết trước sẽ kiếm được tiền — hoặc, ở phía dealer, ai định giá đúng rủi ro bị "picked off" bởi người biết nhiều hơn sẽ sống sót. Đây là tầng mà lý thuyết và kỹ thuật gần nhau nhất: một công thức spread của Glosten-Milgrom trực tiếp trở thành một dòng code định giá quote.

| Thuật ngữ | Nghĩa |
|---|---|
| Kyle lambda ($\lambda$) | Độ nhạy giá theo order flow trong mô hình Kyle; $\Delta p=\lambda\cdot Q$; nghịch đảo depth thị trường |
| Glosten-Milgrom | Mô hình spread từ adverse selection: dealer đặt bid/ask để hòa vốn trước trader có thông tin |
| PIN | Probability of Informed Trading — xác suất một lệnh đến từ trader có thông tin |
| Microprice | Giá giữa có trọng số theo mất cân bằng khối lượng bid/ask; ước lượng "giá công bằng" tốt hơn mid |
| Order flow imbalance (OFI) | Chênh lệch áp lực mua−bán ở đỉnh sổ lệnh; dự báo dịch chuyển giá ngắn hạn |
| Adverse selection | Rủi ro giao dịch với người biết nhiều hơn; nguồn gốc kinh tế của bid-ask spread |
| Effective spread | 2×|giá khớp − mid|; chi phí thực trả, thường nhỏ hơn quoted spread do khớp trong sổ |
| Almgren-Chriss | Khung tối ưu execution: cân bằng market impact (giao dịch nhanh) với timing risk (giao dịch chậm) |
| DeepLOB | Deep learning (CNN+LSTM) dự báo hướng giá từ nhiều mức của limit order book |

Kyle lambda đáng được dẫn xuất vì nó là "hằng số Planck" của market impact — con số biến ý định giao dịch thành chi phí. Trong mô hình Kyle, một informed trader giấu lệnh của mình vào dòng noise; market maker chỉ quan sát được tổng order flow $Q$ và dịch giá tuyến tính $\Delta p=\lambda Q$. Kết quả cân bằng của mô hình cho $\lambda=\frac{\sigma_v}{2\sigma_u}$, trong đó $\sigma_v$ là độ bất định về giá trị thật (đo lượng thông tin bất đối xứng) và $\sigma_u$ là vol của noise trading (đo thanh khoản ngẫu nhiên che giấu). Đọc công thức trước khi cắm số: $\lambda$ lớn — giá nhạy, thị trường "mỏng" — khi có nhiều thông tin bất đối xứng và ít noise che giấu; hai lực này kéo ngược nhau đúng như trực giác. Ví dụ số: một cổ phiếu có $\sigma_v=\$2$ (độ lệch chuẩn của giá trị nội tại chưa biết) và noise flow $\sigma_u=50{,}000$ cổ/phiên. Khi đó $\lambda=2/(2\times50{,}000)=2\times10^{-5}$ \$/cổ. Một informed order 20,000 cổ đẩy giá lên $\Delta p=2\times10^{-5}\times20{,}000=\$0.40$; trên nền giá \$100 đó là $40\,\text{bps}$ impact — và chính $40\,\text{bps}$ này là chi phí mà QR phải trừ khỏi alpha khi ước lượng capacity. Vì $\lambda$ nghịch đảo với depth, một thị trường sâu như SPY có $\lambda$ cực nhỏ còn một small-cap có $\lambda$ lớn, nên cùng một tín hiệu có edge dương ở large-cap có thể hóa âm sau phí ở small-cap — đây là lý do capacity của một chiến lược không phải một con số duy nhất mà là một hàm của universe.

Glosten-Milgrom cho ta hiểu vì sao spread *phải* dương ngay cả khi dealer trung lập rủi ro và không tốn một đồng phí giao dịch nào. Giả sử giá trị thật của cổ phiếu là \$50 (kịch bản "xấu") hoặc \$52 (kịch bản "tốt"), với xác suất tiên nghiệm $50/50$, nên mid công bằng ban đầu là \$51. Một tỷ lệ $\alpha$ của trader là informed — họ biết giá trị thật nên chỉ mua khi nó tốt và bán khi nó xấu — còn $1-\alpha$ là uninformed, mua bán ngẫu nhiên (giả định họ mua với xác suất $50\%$ bất kể). Lấy $\alpha=0.3$. Dealer phải đặt ask sao cho khi một lệnh *mua* đến, kỳ vọng giá trị có điều kiện trên chính sự kiện "có người mua" bằng đúng ask — đó là điều kiện hòa vốn. Ta cần $\Pr(\text{tốt}\mid\text{mua})$ qua Bayes, và để có nó phải tính xác suất thấy một lệnh mua trong mỗi kịch bản:

- Khi giá trị *tốt*: informed chắc chắn mua, uninformed mua $50\%$, nên $\Pr(\text{mua}\mid\text{tốt})=\alpha+(1-\alpha)\times0.5=0.3+0.7\times0.5=0.65$.
- Khi giá trị *xấu*: informed không mua (họ bán), chỉ uninformed mua $50\%$, nên $\Pr(\text{mua}\mid\text{xấu})=(1-\alpha)\times0.5=0.35$.

Áp Bayes với tiên nghiệm $50/50$:
$$\Pr(\text{tốt}\mid\text{mua})=\frac{0.5\times0.65}{0.5\times0.65+0.5\times0.35}=\frac{0.325}{0.50}=0.65.$$
Ask hòa vốn là kỳ vọng giá trị có điều kiện này: $\text{ask}=0.65\times52+0.35\times50=\$51.30$. Do bài toán đối xứng hoàn toàn, một lệnh *bán* kéo posterior về phía "xấu" y hệt, cho $\text{bid}=\$50.70$. Spread bằng $51.30-50.70=\$0.60$; trên nền mid \$51, đó là $0.60/51\approx1.18\%$, tức khoảng $118\,\text{bps}$ — sinh ra hoàn toàn từ adverse selection, không một đồng phí giao dịch nào. Bài học: spread là *giá của việc dealer sợ bị người biết nhiều hơn ăn thịt*, và nó nới rộng khi $\alpha$ (tỷ lệ informed, xấp xỉ chính là PIN) tăng lên — đúng như quan sát thực tế rằng spread giãn ra ngay trước earnings, khi tỷ lệ người "biết trước" đột nhiên cao. PIN chính là đại lượng đo $\alpha$ này từ dữ liệu order flow thực: một cổ phiếu blue-chip thanh khoản có PIN quanh $0.1$–$0.15$, còn một small-cap ít theo dõi có thể lên $0.3$–$0.4$, và spread quan sát của chúng nới rộng đúng theo thứ bậc đó.

Microprice và OFI là hai tín hiệu high-frequency phổ biến, cùng khai thác một sự thật đơn giản: sổ lệnh nghiêng về bên nào thì giá có xu hướng nhích về bên đó. Microprice điều chỉnh mid theo mất cân bằng khối lượng ở đỉnh sổ: nếu bid \$10.00 với 8000 cổ và ask \$10.02 với 2000 cổ, thì mid thẳng là \$10.01, nhưng áp lực mua nặng hơn hẳn nên microprice
$$\text{micro}=\frac{Q_{\text{ask}}\cdot P_{\text{bid}}+Q_{\text{bid}}\cdot P_{\text{ask}}}{Q_{\text{bid}}+Q_{\text{ask}}}=\frac{2000\times10.00+8000\times10.02}{10000}=\frac{20000+80160}{10000}=\$10.016.$$
Chú ý trọng số bắt chéo — khối lượng *bid* nhân với giá *ask* — để bên nào dày hơn thì kéo microprice về phía đối diện, phản ánh rằng bên dày sẽ hấp thụ và bên mỏng sẽ vỡ trước; ở đây microprice lệch hẳn về phía ask, dự báo tick tiếp theo có xu hướng lên. OFI thì cộng dồn thay đổi khối lượng bid trừ đi thay đổi khối lượng ask qua từng tick; OFI dương mạnh là tín hiệu vi mô rằng áp lực mua đang tích lũy và giá sắp nhích lên, và trên horizon từ vài giây tới vài phút nó có IC dương rõ rệt — đây chính là nền tảng của market making và của short-term alpha, nơi edge sống chưa đầy một phút nhưng lặp lại hàng triệu lần mỗi ngày.

## Bảng 5 — Portfolio construction & risk (nâng cao)

Nhóm này về việc biến nhiều tín hiệu thành một danh mục, và đo rủi ro cho đúng. Bài toán trung tâm là ma trận hiệp phương sai $\Sigma$: ước lượng nó tồi thì mọi tối ưu hóa đều sụp, vì tối ưu hóa là một cỗ máy khuếch đại — nó dồn vốn vào đúng những chiều mà sai số ước lượng lớn nhất, tưởng nhầm nhiễu là cơ hội. Phần lớn các kỹ thuật dưới đây là những cách khác nhau để thuần hóa cỗ máy đó.

| Thuật ngữ | Nghĩa |
|---|---|
| HRP | Hierarchical Risk Parity — phân bổ theo cây phân cụm tương quan, không cần nghịch đảo $\Sigma$; ổn định hơn mean-variance |
| CVaR | Conditional VaR (Expected Shortfall) — mất mát kỳ vọng *trong* đuôi xấu vượt VaR; coherent risk measure |
| Black-Litterman | Kết hợp equilibrium prior (từ market cap) với views của nhà đầu tư qua Bayes → posterior $\mu$ ổn định |
| RMT denoising | Random Matrix Theory — nén eigenvalue nhiễu của correlation matrix về nền, giữ eigenvalue tín hiệu |
| Marchenko-Pastur | Phân phối eigenvalue của ma trận tương quan ngẫu nhiên; ngưỡng trên $\lambda_+$ tách tín hiệu khỏi nhiễu |
| EVT / GPD | Extreme Value Theory / Generalized Pareto — mô hình đuôi phân phối để ước lượng tail risk hiếm |
| Vol targeting | Scale exposure theo $1/\hat\sigma$ giữ vol danh mục ổn định qua regime |

HRP đáng một recipe từng bước vì nó là câu trả lời thực chiến cho bệnh "mean-variance nổ tung". Quy trình gồm ba bước. Bước một — *tree clustering*: từ correlation matrix, đổi sang ma trận khoảng cách $d_{ij}=\sqrt{0.5(1-\rho_{ij})}$, rồi phân cụm phân cấp (hierarchical clustering) để nhóm các tài sản giống nhau lại. Ví dụ $\rho=0.9$ giữa hai cổ phiếu tech cho $d=\sqrt{0.5\times0.1}=\sqrt{0.05}=0.224$ (rất gần), còn $\rho=0.1$ cho $d=\sqrt{0.5\times0.9}=\sqrt{0.45}=0.671$ (xa) — cây sẽ ghép hai tên tech lại với nhau trước. Bước hai — *quasi-diagonalization*: sắp lại thứ tự tài sản theo cây để các tài sản tương quan cao nằm cạnh nhau, đưa $\Sigma$ về gần dạng khối đường chéo. Bước ba — *recursive bisection*: chia danh mục thành hai nửa theo cây, phân bổ vốn giữa hai nửa *nghịch đảo variance của từng nửa*, rồi đệ quy xuống từng nửa. Ví dụ số cho một bước bisection: nửa A có variance nhóm $0.04$, nửa B có $0.01$. Trọng số nửa A là
$$w_A=\frac{1/0.04}{1/0.04+1/0.01}=\frac{25}{25+100}=0.2,$$
nên nửa B nhận $0.8$ — nhóm ổn định hơn (variance thấp) hút nhiều vốn hơn, đúng tinh thần risk parity. Điểm mấu chốt: HRP *không bao giờ nghịch đảo* $\Sigma$, nên nó miễn nhiễm với sự bất ổn của mean-variance khi $\Sigma$ gần suy biến (điều gần như luôn xảy ra khi số tài sản lớn so với số quan sát). Đó là lý do out-of-sample HRP thường cho drawdown nhỏ hơn hẳn tối ưu hóa cổ điển, dù in-sample nó trông kém sắc hơn — một minh họa sống động cho nguyên lý rằng bền vững ngoài mẫu đáng giá hơn hoàn hảo trong mẫu.

RMT denoising cần Marchenko-Pastur bằng số để thấy đâu là ranh giới giữa tín hiệu và rác. Với $T$ quan sát và $N$ tài sản, đặt tỷ lệ $q=N/T$; khi đó eigenvalue của một correlation matrix *thuần nhiễu* nằm gọn dưới ngưỡng $\lambda_+=(1+\sqrt{q})^2$. Ví dụ: $N=100$ cổ phiếu, $T=500$ ngày, nên $q=0.2$ và $\lambda_+=(1+\sqrt{0.2})^2=(1+0.447)^2=1.447^2=2.094$. Mọi eigenvalue nằm dưới $2.094$ đều là *rác thống kê* — chúng phản ánh nhiễu ước lượng của một cỡ mẫu hữu hạn, không phải cấu trúc thật của thị trường. Trong thực tế, eigenvalue lớn nhất (market factor) có thể lên $40$–$50$, vài eigenvalue tiếp theo (các sector) cỡ $3$–$8$, còn hàng chục eigenvalue đuôi rơi xuống dưới $2.094$. Denoising thay tất cả eigenvalue dưới ngưỡng bằng trung bình của chúng (giữ nguyên tổng phương sai để không làm méo scale), rồi tái tạo lại correlation matrix từ các eigenvector cũ với phổ eigenvalue đã làm sạch. Kết quả là một $\Sigma$ ổn định hơn nhiều, và danh mục tối ưu xây trên $\Sigma$ đã denoise có turnover thấp hơn cùng out-of-sample Sharpe cao hơn — đơn giản vì tối ưu hóa không còn "đánh cược" vào các eigenvector nhiễu vốn sẽ đổi hướng ngay kỳ sau.

CVaR đáng được phân biệt rạch ròi với VaR bằng số, vì lẫn lộn hai khái niệm này là một trong những sai lầm quản trị rủi ro tốn kém nhất. VaR ở mức $95\%$ là ngưỡng mất mát mà chỉ $5\%$ số ngày tệ hơn nó; nó *không nói gì* về việc tệ đến đâu một khi đã vượt ngưỡng. CVaR (còn gọi Expected Shortfall) là *trung bình* của chính những ngày tệ vượt ngưỡng đó. Ví dụ: một danh mục có $5$ ngày xấu nhất trong 100 ngày với các mức lỗ (đơn vị %) là $-3.0,\,-3.2,\,-3.8,\,-5.0,\,-9.0$. Khi đó $\text{VaR}_{95}=-3.0\%$ (đúng ngưỡng bước vào đuôi), còn $\text{CVaR}_{95}$ là trung bình năm ngày đó: $(3.0+3.2+3.8+5.0+9.0)/5=4.8\%$. Hai danh mục có thể có *cùng* VaR nhưng CVaR khác xa nhau nếu một cái có đuôi $-9\%$ còn cái kia dừng ở $-3.5\%$ — CVaR bắt được cái đuôi béo mà VaR hoàn toàn mù. Và vì CVaR là một coherent risk measure (nó thỏa subadditivity: rủi ro của danh mục gộp không lớn hơn tổng rủi ro các thành phần, đúng với trực giác đa dạng hóa), nó là thước đo được ưa chuộng cho cả tối ưu hóa lẫn quy chuẩn — FRTB của Basel đã chuyển từ VaR sang Expected Shortfall chính vì tính chất này (xem cuốn Q-world về chi tiết regulatory).

Black-Litterman thì đáng một minh họa nhỏ vì nó giải một bệnh riêng: mean-variance thô nhạy cảm đến mức lố bịch với ước lượng $\mu$, và ước lượng $\mu$ lại là thứ khó nhất trong tài chính. Ý tưởng của Black-Litterman là đừng bắt đầu từ $\mu$ tự bịa, mà từ một *equilibrium prior* — hỏi ngược lại: "danh mục thị trường (theo market cap) là tối ưu thì $\mu$ ẩn phải là bao nhiêu?" Đó là $\mu$ mà thị trường đang ngầm định. Sau đó nhà đầu tư tiêm *views* của mình (ví dụ "tech sẽ vượt energy $3\%$/năm") kèm một độ tự tin, và Bayes trộn prior với view thành một posterior $\mu$ mượt. Cỗ máy trộn cân theo độ tin cậy tương đối: nếu bạn để view có độ bất định gấp đôi prior, posterior sẽ nằm khoảng một phần ba đường từ prior về phía view; view càng chắc thì posterior càng ngả về nó. Kết quả là danh mục không còn all-in vào một tài sản chỉ vì $\mu$ của nó tình cờ ước lượng cao — nó lệch khỏi thị trường đúng theo mức độ và hướng của các view, không hơn. Đây là lý do Black-Litterman phổ biến ở các quỹ phải giải trình vị thế: mọi độ lệch khỏi benchmark đều truy được về một view cụ thể.

EVT và GPD đáng một dòng bổ sung vì chúng là công cụ cho thứ mà mọi thước đo khác bỏ sót: cái đuôi cực hiếm mà dữ liệu quá ít để đo trực tiếp. Thay vì tin vào giả định Gaussian (vốn đánh giá thấp thảm họa một cách hệ thống — một cú $-5\%$ mà Gaussian gọi là "một lần mỗi vài nghìn năm" thực tế xảy ra vài lần mỗi thập kỷ), EVT mô hình *riêng phần vượt ngưỡng*: mọi mất mát vượt một ngưỡng $u$ đủ cao đều hội tụ về phân phối Generalized Pareto, đặc trưng bởi một tail index quyết định đuôi béo đến đâu. Ước lượng tail index từ các quan sát cực trị rồi ngoại suy cho phép trả lời "cú lỗ $1$-trong-$10$-năm là bao nhiêu?" mà không cần chờ mười năm dữ liệu — một sự đánh đổi giữa giả định và dữ liệu mà quản trị tail risk buộc phải chấp nhận.

## Bảng 6 — Carry, roll & hiện tượng thị trường

Nhóm cuối gom các khái niệm mô tả *nguồn* của return và các *giới hạn* khiến alpha tồn tại dai dẳng thay vì bị arbitrage sạch ngay lập tức. Đây là chỗ cuốn sách khép vòng: sau khi đã học đo alpha, xây danh mục và quản rủi ro, câu hỏi cuối cùng luôn là *vì sao edge này còn ở đó cho tôi lấy?*

| Thuật ngữ | Nghĩa |
|---|---|
| Carry | Return kiếm được nếu giá "đứng yên" — chênh lãi suất, dividend yield, hay roll của futures |
| Roll yield | Lãi/lỗ do lăn hợp đồng futures hết hạn sang kỳ hạn mới; dương khi backwardation, âm khi contango |
| Contango / Backwardation | Futures xa đắt hơn (contango) / rẻ hơn (backwardation) so với giá giao ngay |
| Limits to arbitrage | Lý do alpha không bị ăn hết ngay: chi phí vay short, margin, horizon nhà đầu tư, noise-trader risk |
| Noise-trader risk | Rủi ro giá đi ngược *thêm* trước khi hội tụ, ép arbitrageur đóng vị thế lỗ — Shleifer-Vishny |
| Deleveraging cascade | Vòng xoáy bán tháo khi đòn bẩy bị cắt đồng loạt (quant quake tháng 8/2007) |

Carry và roll yield đáng một ví dụ số vì chúng là return "có sẵn" mà nhiều người bỏ lỡ — return bạn kiếm được ngay cả khi bạn dự báo sai hướng. Xét futures dầu: giá giao ngay \$80, hợp đồng kỳ hạn 1 tháng \$79 (thị trường backwardation — kỳ hạn xa rẻ hơn giao ngay). Nếu giá giao ngay *đứng yên* ở \$80 cho tới khi hợp đồng đáo hạn, giá futures buộc phải hội tụ về \$80 (nếu không sẽ có arbitrage giao-nhận hàng thật), nên một vị thế long futures mua ở \$79 lời \$1 chỉ nhờ sự hội tụ đó. Roll yield là $1/79=1.27\%$/tháng, tức xấp xỉ $1.27\times12\approx15\%$/năm — hoàn toàn nhờ đường cong dốc xuống, không cần dầu tăng giá một xu. Đây chính là động cơ của carry strategy trong commodities: long các contract đang backwardation, short các contract đang contango, và thu chênh lệch roll trung bình qua nhiều thị trường. Chiều ngược lại là một cái bẫy kinh điển: một ETF dầu giữ futures trong thị trường contango (kỳ hạn xa *đắt* hơn) chịu roll yield *âm* mỗi lần lăn hợp đồng — đó là lý do các ETF dầu dài hạn mòn dần theo thời gian dù giá dầu đi ngang, một khoản thuế vô hình mà nhà đầu tư lẻ hiếm khi thấy trước khi trả.

Limits to arbitrage là khái niệm khép lại toàn bộ cuốn sách, vì nó trả lời câu hỏi nền tảng nhất: *nếu alpha có thật, sao nó chưa bị ăn hết?* Câu trả lời không phải "vì bạn thông minh hơn tất cả" — một giả định nguy hiểm — mà vì bản thân hành động arbitrage có ma sát, và ma sát đó giữ mispricing sống. Hãy định lượng noise-trader risk theo tinh thần Shleifer-Vishny. Bạn thấy một cặp mispriced $5\%$ và tin nó hội tụ trong 6 tháng, một edge kỳ vọng $10\%$/năm rất hấp dẫn. Nhưng giả sử noise trader đẩy mispricing rộng *thêm*, từ $5\%$ lên $8\%$, trước khi nó chịu hội tụ; nếu bạn dùng đòn bẩy $5\times$, cú lệch thêm $3\%$ nhân đòn bẩy thành $3\%\times5=15\%$ mark-to-market loss. Khoản lỗ $15\%$ trên sổ đó có thể chạm margin call và buộc bạn thanh lý vị thế *đúng đáy* — hiện thực hóa lỗ trên chính giao dịch đáng lẽ thắng. Chính khả năng "đúng nhưng phá sản trước khi được minh oan" khiến arbitrageur lý trí phải giữ vị thế *nhỏ hơn* mức tối ưu lý thuyết, và chính sự dè dặt tập thể đó để lại mispricing cho tồn tại. Cộng thêm chi phí vay để short (small-cap khó vay, phí $5$–$20\%$/năm ăn mòn thẳng vào edge), yêu cầu margin, và horizon giới hạn của nhà đầu tư (LP rút vốn sau vài quý lỗ dù luận điểm vẫn đúng), ta có lời giải thích trọn vẹn cho nghịch lý vì sao thế giới đầy alpha mà vẫn không phải một máy in tiền.

Deleveraging cascade là phiên bản hệ thống của chính rủi ro đó, và là nơi crowding trả hóa đơn. Tháng 8 năm 2007, rất nhiều quỹ quant cùng nắm những factor exposure gần như giống hệt nhau; khi một quỹ lớn bị buộc phải giảm đòn bẩy và bán ra, giá dịch chuyển ngược lại tất cả những quỹ đang cùng vị thế, kích hoạt thêm margin call và thêm bán tháo — một vòng phản hồi tự khuếch đại khiến hàng loạt chiến lược mang danh "market-neutral" mất từ $10$ đến $30\%$ chỉ trong vài ngày, dù chỉ số thị trường tổng thể gần như không nhúc nhích. Đó là hình phạt cuối cùng của crowding, và là lý do mọi thước đo rủi ro trong cuốn sách này — từ CVaR đến vol targeting đến purged CV — cuối cùng đều phục vụ một mục tiêu duy nhất, không hoa mỹ hơn được: sống sót đủ lâu để cái edge nhỏ nhân với số lượng lớn kịp kết tinh thành return trước khi thị trường tìm ra cách lấy nó lại.

---

*Hết tài liệu P-world.*
