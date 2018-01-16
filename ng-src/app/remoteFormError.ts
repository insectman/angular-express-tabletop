export class RemoteFormError extends Error {
  public field: string;
  public type: string;
  constructor(message, fieldName?, errorType?) {
    super(message);
    if (fieldName) {
      this.field = fieldName;
      this.type = errorType;
    }
  }
}
