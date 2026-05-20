import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import * as React from 'react';

export type UpgradeReason = 'repos' | 'history' | 'weekly';

const COPY: Record<
  UpgradeReason,
  { title: string; description: string }
> = {
  repos: {
    title: 'Upgrade to Pro',
    description:
      'Free accounts can track up to three repositories. Pro unlocks unlimited repository selection.',
  },
  history: {
    title: 'Upgrade to Pro',
    description:
      'Free accounts can browse and sync the last 30 days of Workday history. Pro unlocks full history.',
  },
  weekly: {
    title: 'Upgrade to Pro',
    description:
      'Free accounts see a preview of the Weekly Summary. Pro unlocks the full breakdown by Work Type.',
  },
};

type UpgradeSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: UpgradeReason;
};

export function UpgradeSheet({
  open,
  onOpenChange,
  reason = 'repos',
}: UpgradeSheetProps) {
  const { title, description } = COPY[reason];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription selectable>{description}</DialogDescription>
      </DialogHeader>
      <Text selectable className="text-muted-foreground text-sm leading-relaxed">
        Pro is available during beta via manual activation. Contact your admin
        or tap below to register interest.
      </Text>
      <DialogFooter className="pt-4">
        <Button variant="outline" onPress={() => onOpenChange(false)}>
          <Text>Not now</Text>
        </Button>
        <Button onPress={() => onOpenChange(false)}>
          <Text>Got it</Text>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export function isFreeTierRepoLimitError(message: string): boolean {
  return (
    message.includes('free_tier_repo_limit') ||
    message.includes('check_violation')
  );
}

export function formatRepoLimitError(message: string): string {
  if (isFreeTierRepoLimitError(message)) {
    return 'Free accounts can track up to three repositories. Upgrade to Pro for unlimited repos.';
  }
  return message;
}
