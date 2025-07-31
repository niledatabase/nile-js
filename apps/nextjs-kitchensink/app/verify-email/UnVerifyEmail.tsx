'use client';
import { Button } from '@/components/ui/button';

export type ServerResponse = {
  ok: boolean;
  message?: string;
};
type Props = {
  action: () => Promise<ServerResponse>;
};
export default function UnverifiyEmail({ action }: Props) {
  return (
    <div className="w-3xl mx-auto">
      <Button onClick={() => action()}>Reset verification</Button>
    </div>
  );
}
