import { requireUser } from '@/lib/auth';
import { dashboard } from '@/lib/queries';
import { apiError, json } from '@/lib/http';
export async function GET() {
  try {
    return json(await dashboard(await requireUser()));
  } catch (e) {
    return apiError(e);
  }
}
