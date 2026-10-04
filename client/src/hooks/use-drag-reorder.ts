"use client";

import { useState, type DragEventHandler } from "react";

type DragItemProps = {
  draggable: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragOver: DragEventHandler;
  onDrop: () => void;
  onDragEnd: () => void;
};

export function useDragReorder(
  onReorder: (from: number, to: number) => void,
  disabled = false,
) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const reset = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const getItemProps = (index: number): DragItemProps => ({
    draggable: !disabled,
    onDragStart: () => setDragIndex(index),
    onDragEnter: () => setOverIndex(index),
    onDragOver: (event) => event.preventDefault(),
    onDrop: () => {
      if (dragIndex !== null && dragIndex !== index)
        onReorder(dragIndex, index);
      reset();
    },
    onDragEnd: reset,
  });

  return {
    getItemProps,
    isDragging: (index: number) => dragIndex === index,
    isDropTarget: (index: number) =>
      overIndex === index && dragIndex !== null && dragIndex !== index,
  };
}
