export class ResponseError {
  response: Response;
  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.response = new Response(body, init);
  }
}
