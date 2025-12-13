/**
 * InlineChecklist - Simplified KISS checklist display
 *
 * Design Philosophy: Ultra-minimal, no accordion, no header
 * - Items displayed directly in task card
 * - Inline progress bar (discreet)
 * - Auto-create checklist when adding first item
 * - Clean, modern, elegant
 */
'use client';

import { useCallback } from 'react';
import { useMutation } from '@apollo/client/react';
import { Box } from '@mui/material';
import {
  TOGGLE_CHECKLIST_ITEM,
  UPDATE_CHECKLIST_ITEM,
  DELETE_CHECKLIST_ITEM,
  ADD_CHECKLIST_ITEM,
  CREATE_CHECKLIST,
} from '@/graphql/mutations';
import { GET_TASKS } from '@/graphql/queries';
import type { Checklist, CreateChecklistData } from '../types';
import { ChecklistItemRow, AddChecklistItem } from './ChecklistItem';
import { ChecklistProgress } from './ChecklistProgress';

interface InlineChecklistProps {
  checklist: Checklist | null;
  taskId: string;
}

const REFETCH_QUERIES = [{ query: GET_TASKS }];

export function InlineChecklist({ checklist, taskId }: InlineChecklistProps) {
  // Mutations
  const [toggleItem] = useMutation(TOGGLE_CHECKLIST_ITEM, {
    refetchQueries: REFETCH_QUERIES,
    optimisticResponse: ({ itemId }) => ({
      toggleChecklistItem: {
        __typename: 'ToggleChecklistItem',
        item: {
          __typename: 'ChecklistItemType',
          id: itemId,
          completed: !checklist?.items.find((i) => i.id === itemId)?.completed,
        },
        errors: [],
      },
    }),
  });

  const [updateItem] = useMutation(UPDATE_CHECKLIST_ITEM, {
    refetchQueries: REFETCH_QUERIES,
  });

  const [deleteItem] = useMutation(DELETE_CHECKLIST_ITEM, {
    refetchQueries: REFETCH_QUERIES,
  });

  const [addItem] = useMutation(ADD_CHECKLIST_ITEM, {
    refetchQueries: REFETCH_QUERIES,
  });

  const [createChecklist] = useMutation<CreateChecklistData>(CREATE_CHECKLIST, {
    refetchQueries: REFETCH_QUERIES,
  });

  // Handlers
  const handleToggle = useCallback(
    (itemId: string) => {
      toggleItem({ variables: { itemId } });
    },
    [toggleItem]
  );

  const handleUpdate = useCallback(
    (itemId: string, text: string) => {
      updateItem({ variables: { itemId, text } });
    },
    [updateItem]
  );

  const handleDelete = useCallback(
    (itemId: string) => {
      deleteItem({ variables: { itemId } });
    },
    [deleteItem]
  );

  const handleAddItem = useCallback(
    async (text: string) => {
      if (checklist) {
        // Add to existing checklist
        await addItem({
          variables: {
            checklistId: checklist.id,
            text,
          },
        });
      } else {
        // Auto-create checklist with first item
        // Important: await both mutations to ensure proper refetch order
        try {
          const result = await createChecklist({
            variables: {
              taskId,
              title: 'Checklist',
            },
          });
          const newChecklistId = result.data?.createChecklist?.checklist?.id;
          if (newChecklistId) {
            // Wait for addItem to complete before refetch updates the UI
            await addItem({
              variables: {
                checklistId: newChecklistId,
                text,
              },
            });
          }
        } catch (error) {
          console.error('Failed to create checklist:', error);
        }
      }
    },
    [addItem, checklist, createChecklist, taskId]
  );

  // Calculate progress
  const items = checklist?.items ?? [];
  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const hasItems = totalCount > 0;

  return (
    <Box onClick={(e) => e.stopPropagation()} sx={{ mt: 1.5 }}>
      {/* Progress bar - only show if has items */}
      {hasItems && (
        <Box sx={{ mb: 1, px: 0.5 }}>
          <ChecklistProgress completed={completedCount} total={totalCount} />
        </Box>
      )}

      {/* Checklist items - sorted by position */}
      {items
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((item) => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            onToggle={handleToggle}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}

      {/* Add new item - always visible */}
      <AddChecklistItem
        onAdd={handleAddItem}
        placeholder={hasItems ? 'Add item...' : '+ Add checklist item'}
      />
    </Box>
  );
}
