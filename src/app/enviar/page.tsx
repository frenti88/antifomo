import { SubmitEventForm } from '@/components/submit/SubmitEventForm';

export const metadata = {
  title: 'Enviar Evento — AntiFOMO',
  description: 'Envía un evento cultural, fiesta, exposición o plan en Medellín para incluir en el radar de AntiFOMO.',
};

export default function EnviarPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 pt-8 pb-24">
      <h1 className="sr-only">Enviar evento</h1>
      <SubmitEventForm />
    </main>
  );
}
