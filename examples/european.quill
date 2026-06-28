product EuropeanCall {
  underlying S model gbm
  param strike = 100
  event T = 1.0 {
    pay max(S(T) - strike, 0) at T
  }
}
