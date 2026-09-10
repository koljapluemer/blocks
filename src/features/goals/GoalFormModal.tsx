import { useEffect, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { TextField } from '@/components/ui/text-field';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Present => edit mode. */
  initialTitle?: string;
  /** Project this goal belongs to (context label). */
  projectTitle: string;
  /** Every other goal title, for the global-uniqueness check. */
  takenTitles: string[];
  onSubmit: (title: string) => void;
};

export function GoalFormModal({
  visible,
  onClose,
  initialTitle,
  projectTitle,
  takenTitles,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState(initialTitle ?? '');

  useEffect(() => {
    if (visible) setTitle(initialTitle ?? '');
  }, [visible, initialTitle]);

  const trimmed = title.trim();
  const collision =
    trimmed.length > 0 &&
    trimmed !== initialTitle &&
    takenTitles.some((t) => t.toLowerCase() === trimmed.toLowerCase());
  const valid = trimmed.length > 0 && !collision;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={initialTitle ? 'Edit goal' : `New goal in ${projectTitle}`}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onPress={onClose} />
          <Button label="Save" onPress={() => onSubmit(trimmed)} disabled={!valid} />
        </>
      }>
      <TextField
        value={title}
        onChangeText={setTitle}
        placeholder="Goal title"
        autoFocus
        onSubmitEditing={() => valid && onSubmit(trimmed)}
      />
      {collision && (
        <ThemedText type="small" style={{ color: '#DD2E44' }}>
          Another goal already has that title.
        </ThemedText>
      )}
    </Modal>
  );
}
