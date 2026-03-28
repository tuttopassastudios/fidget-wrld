/**
 * COA (Certificate of Analysis) database stub
 * Not needed for fidget toys - this was for peptide research products
 */

export interface COA {
  id: string;
  productSlug: string;
  productName: string;
  batchLot: string;
  testDate: string;
  expirationDate: string;
  storagePath: string;
  createdAt: string;
  uploadedAt: string;
  uploadedBy: string;
  fileName: string;
  downloadURL: string;
  fileSize: number;
}

export async function getAllCOAs(): Promise<COA[]> {
  return [];
}

export async function getCOAsByProduct(_slug: string): Promise<COA[]> {
  return [];
}

export async function getCOAById(_id: string): Promise<COA | null> {
  return null;
}

export async function createCOA(_data: Omit<COA, 'id' | 'createdAt'>): Promise<string> {
  throw new Error('COA functionality not configured');
}

export async function deleteCOA(_id: string): Promise<{ storagePath: string }> {
  throw new Error('COA functionality not configured');
}
