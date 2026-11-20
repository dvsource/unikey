// Time belongs to a presentation, including both sides of a cancelled skip.
export class AnswerClock {
  private token?: symbol;
  private visible = false;
  private active = false;
  private since?: number;
  private total = 0;

  constructor(private now = () => performance.now()) {}

  show(token: symbol | undefined, visible: boolean) {
    if (token !== this.token) {
      this.token = token;
      this.total = 0;
      this.since = undefined;
    }
    this.visible = visible;
    this.update();
  }

  foreground(active: boolean) {
    this.active = active;
    this.update();
  }

  private update() {
    if (this.active && this.visible) {
      this.since ??= this.now();
    } else if (this.since !== undefined) {
      this.total = this.elapsed();
      this.since = undefined;
    }
  }

  elapsed() {
    return this.total + (this.since === undefined ? 0 : Math.max(0, this.now() - this.since));
  }
}
