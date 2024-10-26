export interface SendEmailDto {
  to: string;
  from?: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}
