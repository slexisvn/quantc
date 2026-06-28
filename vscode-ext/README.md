# Quill for VS Code

Language support for **Quill**, the quant-finance payoff/contract DSL from [`quantc`](https://github.com/quantc/quantc). A `.quill` script describes a derivative product declaratively and compiles to vectorised Monte Carlo with AAD (adjoint) Greeks.

The extension reuses the project's own parser, type-checker, printer, and pricing engine — bundled into the extension — so diagnostics, formatting, and pricing always match the compiler exactly.

## Features

- **Syntax highlighting** — products, events, schedules, payoffs, control flow, models, built-in functions, operators, numbers, and `//` comments.
- **Live diagnostics** — parse and type errors from the real Quill front end, shown inline and in the Problems panel as you type.
- **Completion** — keywords, built-in functions (with call snippets), and all stochastic models, each with documentation.
- **Hover** — signatures and descriptions for keywords, built-ins, and models.
- **Formatting** — *Format Document* pretty-prints through the canonical Quill printer.
- **Pricing** — **Quill: Price Current File** runs the Monte Carlo engine on the open script and reports price, standard error, and Greeks in the **Quill** output channel.
- **Snippets** — `product`, `european`, `event`, `eventsched`, `schedule`, `pay`, `if`, `ifelse`, `exercise`, `param`, `var`, `underlying`.
- **Editor config** — bracket matching, auto-closing pairs, comment toggling (`Ctrl`/`Cmd`+`/`), and block indentation.

## Models

Completion and hover cover every model the engine supports:

| Model | Description |
|---|---|
| `gbm` | Geometric Brownian motion (lognormal). |
| `bachelier` | Normal model with absolute volatility. |
| `displaced` | Displaced diffusion — GBM on `(S + shift)`. |
| `cev` | Constant-elasticity-of-variance local vol. |
| `heston` | Heston stochastic volatility. |
| `merton` | Merton jump-diffusion. |
| `hw1f` | Hull–White 1-factor short rate. |
| `g2pp` | G2++ two-factor short rate. |
| `fx` | FX rate (Garman–Kohlhagen). |

## Commands

| Command | Description |
|---|---|
| **Quill: Price Current File** | Prices the active `.quill` file and prints price, standard error, and Greeks to the **Quill** output channel. |
| **Quill: Check Current File** | Re-runs diagnostics on the active file. |

## Settings

| Setting | Default | Description |
|---|---|---|
| `quill.market.spot` | `100` | Spot price used when pricing. |
| `quill.market.rate` | `0.03` | Risk-free rate used when pricing. |
| `quill.market.vol` | `0.2` | Volatility used when pricing. |
| `quill.pricing.paths` | `100000` | Number of Monte Carlo paths. |
| `quill.pricing.seed` | `1` | RNG seed. |

## Example

```quill
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
```

Open the file, run **Quill: Price Current File**, and the price, standard error, and Greeks appear in the **Quill** output channel.

## License

MIT — see [LICENSE](LICENSE).
