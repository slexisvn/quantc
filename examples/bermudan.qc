product BermudanPut {
  underlying S model gbm
  param strike = 100
  event t in schedule(0.1, 1.0, 0.1) {
    exercise continuation {
      pay max(strike - S(t), 0) at t
    }
  }
}
