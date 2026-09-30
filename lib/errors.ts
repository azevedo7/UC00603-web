import { ZodError } from 'zod';
export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function friendlyError(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof ZodError)
    return error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' · ');
  const code = (error as { code?: string })?.code;
  if (code === 'ER_DUP_ENTRY')
    return 'Já existe este NIF, email, cédula, microchip ou horário para o veterinário. Escolha um valor diferente.';
  if (code === 'ER_NO_REFERENCED_ROW_2')
    return 'O registo associado não existe. Atualize a página e selecione novamente.';
  if (code === 'ER_CHECK_CONSTRAINT_VIOLATED')
    return 'Os valores não respeitam as restrições da base de dados. Verifique os campos.';
  if (code === 'ER_ACCESS_DENIED_ERROR' || code === 'ER_TABLEACCESS_DENIED_ERROR')
    return 'A conta MySQL não tem autorização. Verifique a configuração local e as permissões SELECT, INSERT e UPDATE.';
  if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ETIMEDOUT')
    return 'MySQL indisponível. Confirme que o serviço está iniciado e reveja o .env.local.';
  return 'Não foi possível concluir a operação. Tente novamente ou verifique a configuração local.';
}
