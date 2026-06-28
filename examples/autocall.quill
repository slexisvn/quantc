product Autocall {
  underlying S model gbm
  param coupon = 0.02
  var accrued = 0
  event t in schedule(0.25, 3.0, 0.25) {
    accrued = accrued + coupon
    if S(t) >= S(0) then {
      pay 1 + accrued at t
      stop
    }
  }
  event T = 3.0 {
    pay min(S(T) / S(0), 1) at T
  }
}
