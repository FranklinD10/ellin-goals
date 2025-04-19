import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import { Box } from '@mui/material';
import { Habit } from '../types';
import { memo } from 'react';
import { AnimatedCard } from './AnimatedCard';

interface VirtualizedHabitListProps {
  habits: Habit[];
  renderItem: (habit: Habit) => React.ReactNode;
}

const cache = new CellMeasurerCache({
  fixedWidth: true,
  defaultHeight: 80,
});

export const VirtualizedHabitList = memo(({ habits, renderItem }: VirtualizedHabitListProps) => {
  return (
    <Box height="calc(100vh - 200px)">
      <AutoSizer>
        {({ width, height }) => (
          <List
            width={width}
            height={height}
            rowCount={habits.length}
            rowHeight={cache.rowHeight}
            rowRenderer={({ index, key, style, parent }) => (
              <CellMeasurer
                cache={cache}
                columnIndex={0}
                key={key}
                rowIndex={index}
                parent={parent}
              >
                <Box style={style}>
                  <AnimatedCard>
                    {renderItem(habits[index])}
                  </AnimatedCard>
                </Box>
              </CellMeasurer>
            )}
          />
        )}
      </AutoSizer>
    </Box>
  );
});
