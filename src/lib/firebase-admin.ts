/**
 * Firebase Admin SDK stub
 * TODO: Configure Firebase when ready
 */

export type AdminRole = 'admin' | 'editor' | 'viewer' | 'team';

// Stub types for Firebase Admin
interface UserMetadata {
  creationTime?: string;
  lastSignInTime?: string;
}

interface ProviderData {
  providerId?: string;
}

interface UserRecord {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  disabled: boolean;
  emailVerified: boolean;
  metadata: UserMetadata;
  customClaims?: Record<string, unknown>;
  providerData: ProviderData[];
}

interface ListUsersResult {
  users: UserRecord[];
  pageToken?: string;
}

// Mock Firestore that throws to trigger static fallback in products-db.ts
interface QuerySnapshot {
  empty: boolean;
  docs: { id: string; data: () => Record<string, unknown> }[];
  forEach: (callback: (doc: { id: string; data: () => Record<string, unknown> }) => void) => void;
}

interface DocumentSnapshot {
  exists: boolean;
  id: string;
  data: () => Record<string, unknown> | undefined;
}

type QueryRef = {
  get: () => Promise<QuerySnapshot>;
  where: (field: string, op: string, value: unknown) => QueryRef;
  orderBy: (field: string, direction?: string) => QueryRef;
  limit: (n: number) => QueryRef;
};

type DocRef = {
  get: () => Promise<DocumentSnapshot>;
  set: (data: unknown, options?: unknown) => Promise<void>;
  update: (data: unknown) => Promise<void>;
  delete: () => Promise<void>;
};

type CollectionRef = QueryRef & {
  doc: (id?: string) => DocRef;
  add: (data: unknown) => Promise<{ id: string }>;
};

export function getAdminFirestore() {
  const mockQuery: QueryRef = {
    get: async (): Promise<QuerySnapshot> => {
      throw new Error('Firebase not configured - using static data');
    },
    where: (_field: string, _op: string, _value: unknown) => mockQuery,
    orderBy: (_field: string, _direction?: string) => mockQuery,
    limit: (_n: number) => mockQuery,
  };

  const mockDocRef: DocRef = {
    get: async (): Promise<DocumentSnapshot> => {
      throw new Error('Firebase not configured - using static data');
    },
    set: async (_data: unknown, _options?: unknown): Promise<void> => {
      throw new Error('Firebase not configured');
    },
    update: async (_data: unknown): Promise<void> => {
      throw new Error('Firebase not configured');
    },
    delete: async (): Promise<void> => {
      throw new Error('Firebase not configured');
    },
  };

  const mockCollectionRef: CollectionRef = {
    ...mockQuery,
    doc: (_id?: string) => mockDocRef,
    add: async (_data: unknown): Promise<{ id: string }> => {
      throw new Error('Firebase not configured');
    },
  };

  return {
    collection: (_name: string) => mockCollectionRef,
  };
}

export function getAdminAuth() {
  return {
    verifyIdToken: async (_token: string): Promise<{ uid: string; email?: string }> => {
      throw new Error('Firebase Auth not configured');
    },
    getUser: async () => {
      throw new Error('Firebase Auth not configured');
    },
    setCustomUserClaims: async (_uid: string, _claims: Record<string, unknown>) => {
      throw new Error('Firebase Auth not configured');
    },
    listUsers: async (_maxResults?: number, _pageToken?: string): Promise<ListUsersResult> => ({ users: [], pageToken: undefined }),
  };
}

export function getAdminStorage() {
  return {
    bucket: () => ({
      file: (_path: string) => ({
        save: async () => {
          throw new Error('Firebase Storage not configured');
        },
        getSignedUrl: async () => [''],
        delete: async () => {
          throw new Error('Firebase Storage not configured');
        },
      }),
    }),
  };
}

export async function verifyIdToken(_token: string): Promise<{ uid: string; email?: string; role?: string }> {
  throw new Error('Firebase Auth not configured');
}

export function extractBearerToken(_header: string | null): string | null {
  return null;
}

export async function verifyAdminRequest(_authHeader: string | null, _requiredRole?: AdminRole): Promise<{ uid: string; role: AdminRole; email?: string }> {
  throw new Error('Firebase Auth not configured - admin access disabled');
}
