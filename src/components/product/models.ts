import type { ComponentType } from 'react';

// Legacy model registry — existing products have no inline 3D model.
// 3D-printed products use STLViewer instead.
export function getModelComponent(_slug: string): ComponentType | null {
  return null;
}
