export class ResponseError extends Response {
  constructor(body?: BodyInit | null, init?: ResponseInit) {
    super(body, init);
  }
}
