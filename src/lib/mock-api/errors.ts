export class MockApiError extends Error {
  constructor(
    message: string,
    public code: string = 'MOCK_ERROR',
  ) {
    super(message);
    this.name = 'MockApiError';
  }
}
