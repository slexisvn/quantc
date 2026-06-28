export class CalcNode {
  value: unknown = undefined
  valid = false
  readonly dependents: CalcNode[] = []

  constructor(readonly deps: CalcNode[], readonly compute: (values: unknown[]) => unknown, readonly isInput: boolean) {}
}

export class CalcGraph {
  input<T>(value: T): CalcNode {
    const node = new CalcNode([], () => value, true)
    node.value = value
    node.valid = true
    return node
  }

  node<T>(deps: CalcNode[], compute: (values: unknown[]) => T): CalcNode {
    const node = new CalcNode(deps, compute as (values: unknown[]) => unknown, false)
    for (const dep of deps) dep.dependents.push(node)
    return node
  }

  get<T>(node: CalcNode): T {
    if (node.valid) return node.value as T
    const depValues = node.deps.map((dep) => this.get(dep))
    node.value = node.compute(depValues)
    node.valid = true
    return node.value as T
  }

  set<T>(input: CalcNode, value: T): void {
    if (!input.isInput) throw new Error('only input nodes can be set')
    input.value = value
    input.valid = true
    this.invalidate(input)
  }

  private invalidate(node: CalcNode): void {
    for (const dependent of node.dependents) {
      if (dependent.valid) {
        dependent.valid = false
        this.invalidate(dependent)
      }
    }
  }
}
