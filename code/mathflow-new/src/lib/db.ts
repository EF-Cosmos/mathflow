import { openDB, DBSchema, IDBPDatabase } from 'idb';

// ==================== DB Types ====================

export interface Derivation {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DerivationStep {
  id: string;
  derivation_id: string;
  step_number: number;
  input_latex: string;
  output_latex: string;
  operation: string | null;
  annotation: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface MathTemplate {
  id: string;
  category: string;
  name: string;
  description: string | null;
  latex_template: string;
  created_at: string;
}

// ==================== DB Schema ====================

interface MathFlowDB extends DBSchema {
  derivations: {
    key: string;
    value: Derivation;
    indexes: { 'by-updated_at': string };
  };
  derivation_steps: {
    key: string;
    value: DerivationStep;
    indexes: { 'by-derivation_id': string };
  };
  math_templates: {
    key: string;
    value: MathTemplate;
    indexes: { 'by-category': string };
  };
}

// ==================== DB Connection ====================

const DB_NAME = 'mathflow';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MathFlowDB>> | null = null;

function getDB(): Promise<IDBPDatabase<MathFlowDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MathFlowDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const derivations = db.createObjectStore('derivations', { keyPath: 'id' });
        derivations.createIndex('by-updated_at', 'updated_at');

        const steps = db.createObjectStore('derivation_steps', { keyPath: 'id' });
        steps.createIndex('by-derivation_id', 'derivation_id');

        const templates = db.createObjectStore('math_templates', { keyPath: 'id' });
        templates.createIndex('by-category', 'category');
      },
    });
  }
  return dbPromise;
}

// ==================== CRUD: Derivations ====================

export async function getAllDerivations(): Promise<Derivation[]> {
  const db = await getDB();
  return db.getAllFromIndex('derivations', 'by-updated_at');
}

export async function getDerivation(id: string): Promise<Derivation | undefined> {
  const db = await getDB();
  return db.get('derivations', id);
}

export async function saveDerivation(derivation: Derivation, steps: DerivationStep[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['derivations', 'derivation_steps'], 'readwrite');

  // Upsert derivation
  await tx.objectStore('derivations').put(derivation);

  // Delete old steps for this derivation, then insert new ones
  const stepStore = tx.objectStore('derivation_steps');
  const index = stepStore.index('by-derivation_id');
  let cursor = await index.openCursor(derivation.id);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  for (const step of steps) {
    await stepStore.put(step);
  }

  await tx.done;
}

export async function upsertDerivation(derivation: Derivation): Promise<void> {
  const db = await getDB();
  await db.put('derivations', derivation);
}

export async function createDerivation(title: string): Promise<Derivation> {
  const now = new Date().toISOString();
  const derivation: Derivation = {
    id: crypto.randomUUID(),
    title,
    description: null,
    created_at: now,
    updated_at: now,
  };
  const db = await getDB();
  await db.put('derivations', derivation);
  return derivation;
}

export async function deleteDerivation(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['derivations', 'derivation_steps'], 'readwrite');

  // Delete all steps for this derivation
  const stepStore = tx.objectStore('derivation_steps');
  const index = stepStore.index('by-derivation_id');
  let cursor = await index.openCursor(id);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }

  // Delete the derivation itself
  await tx.objectStore('derivations').delete(id);
  await tx.done;
}

// ==================== CRUD: Steps ====================

export async function getStepsForDerivation(derivationId: string): Promise<DerivationStep[]> {
  const db = await getDB();
  return db.getAllFromIndex('derivation_steps', 'by-derivation_id', derivationId);
}

// ==================== CRUD: Templates ====================

export async function getAllTemplates(): Promise<MathTemplate[]> {
  const db = await getDB();
  return db.getAllFromIndex('math_templates', 'by-category');
}

export async function seedTemplatesIfNeeded(templates: MathTemplate[]): Promise<void> {
  const db = await getDB();
  const existing = await db.count('math_templates');
  if (existing === 0) {
    const tx = db.transaction('math_templates', 'readwrite');
    for (const t of templates) {
      await tx.store.add(t);
    }
    await tx.done;
  }
}

// ==================== Conversion Helpers ====================

/** Convert a DB-layer DerivationStep (snake_case) to a component-layer step (camelCase). */
export function toComponentStep(dbStep: DerivationStep): {
  id: string;
  stepNumber: number;
  latex: string;
  operation: string;
  annotation: string;
  timestamp: number;
} {
  return {
    id: dbStep.id,
    stepNumber: dbStep.step_number,
    latex: dbStep.output_latex,
    operation: dbStep.operation ?? '',
    annotation: dbStep.annotation ?? '',
    timestamp: new Date(dbStep.created_at).getTime(),
  };
}

/** Convert a component-layer step (camelCase) to a DB-layer DerivationStep (snake_case). */
export function toDbStep(
  componentStep: {
    id?: string;
    stepNumber: number;
    latex: string;
    operation: string;
    annotation: string;
  },
  derivationId: string,
  stepIndex: number,
): DerivationStep {
  return {
    id: componentStep.id ?? crypto.randomUUID(),
    derivation_id: derivationId,
    step_number: stepIndex,
    input_latex: '',
    output_latex: componentStep.latex,
    operation: componentStep.operation,
    annotation: componentStep.annotation,
    is_verified: false,
    created_at: new Date().toISOString(),
  };
}
