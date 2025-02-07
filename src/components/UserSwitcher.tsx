import { SegmentedControl } from '@mantine/core';
import { useUser } from '../contexts/UserContext';

export default function UserSwitcher() {
  const { currentUser, setCurrentUser } = useUser();

  return (
    <SegmentedControl
      value={currentUser}
      onChange={(value: 'El' | 'Lin') => setCurrentUser(value)}
      data={[
        { label: 'El', value: 'El' },
        { label: 'Lin', value: 'Lin' },
      ]}
      style={{ width: 200 }}
    />
  );
}
