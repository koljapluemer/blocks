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
  takenTitles: string[];
  onSubmit: (title: string) => void;
};

export function ProjectFormModal({ visible, onClose, initialTitle, takenTitles, onSubmit }: Props) {
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
      title={initialTitle ? 'Edit project' : 'New project'}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onPress={onClose} />
          <Button label="Save" onPress={() => onSubmit(trimmed)} disabled={!valid} />
        </>
      }>
      <TextField
        value={title}
        onChangeText={setTitle}
        placeholder="Project title"
        autoFocus
        onSubmitEditing={() => valid && onSubmit(trimmed)}
      />
      {collision && (
        <ThemedText type="small" style={{ color: '#DD2E44' }}>
          A project with that title already exists.
        </ThemedText>
      )}
    </Modal>
  );
}
