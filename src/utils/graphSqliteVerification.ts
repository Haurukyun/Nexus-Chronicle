import Database from 'better-sqlite3';
import { WorldEntity } from '../types';

export interface GraphEdge {
    sourceId: string;
    targetId: string;
    relationType: string;
}

/**
 * Creates an in-memory SQLite relational graph of entities to test
 * bidirectional connections, circular parent loops, and orphan states using SQL queries / CTEs.
 */
export function buildInMemoryWorldGraph(entities: WorldEntity[]) {
    const db = new Database(':memory:');

    // Create tables
    db.exec(`
        CREATE TABLE entities (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            name TEXT NOT NULL,
            parent_id TEXT
        );

        CREATE TABLE relations (
            source_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            kind TEXT NOT NULL,
            PRIMARY KEY (source_id, target_id, kind)
        );

        CREATE INDEX idx_relations_source ON relations(source_id);
        CREATE INDEX idx_relations_target ON relations(target_id);
    `);

    const insertEntity = db.prepare(`
        INSERT INTO entities (id, type, name, parent_id)
        VALUES (@id, @type, @name, @parent_id)
    `);

    const insertRelation = db.prepare(`
        INSERT OR IGNORE INTO relations (source_id, target_id, kind)
        VALUES (@source_id, @target_id, @kind)
    `);

    const transaction = db.transaction((entList: WorldEntity[]) => {
        for (const e of entList) {
            insertEntity.run({
                id: e.id,
                type: e.type,
                name: e.name || 'Unnamed',
                parent_id: e.parentId || null,
            });

            // Extract all paired array references
            for (const [key, val] of Object.entries(e)) {
                if (key.startsWith('paired') && Array.isArray(val)) {
                    for (const targetId of val) {
                        if (typeof targetId === 'string' && targetId.trim().length > 0) {
                            insertRelation.run({
                                source_id: e.id,
                                target_id: targetId,
                                kind: key,
                            });
                        }
                    }
                }
            }
        }
    });

    transaction(entities);

    return {
        db,
        /**
         * Detects circular parent-child loops using Recursive CTE
         */
        findParentCycles() {
            const query = db.prepare(`
                WITH RECURSIVE lineage(start_id, current_id, depth, path) AS (
                    SELECT id, parent_id, 1, id || '->' || parent_id
                    FROM entities
                    WHERE parent_id IS NOT NULL

                    UNION ALL

                    SELECT l.start_id, e.parent_id, l.depth + 1, l.path || '->' || e.parent_id
                    FROM lineage l
                    JOIN entities e ON l.current_id = e.id
                    WHERE e.parent_id IS NOT NULL AND l.depth < 50
                )
                SELECT * FROM lineage WHERE current_id = start_id;
            `);
            return query.all();
        },
        /**
         * Detects dangling relations (target does not exist in entity list)
         */
        findDanglingPointers() {
            const query = db.prepare(`
                SELECT r.source_id, r.target_id, r.kind, e.name as source_name
                FROM relations r
                JOIN entities e ON r.source_id = e.id
                LEFT JOIN entities target ON r.target_id = target.id
                WHERE target.id IS NULL;
            `);
            return query.all();
        },
        close() {
            db.close();
        }
    };
}
