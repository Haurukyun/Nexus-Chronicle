#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(process.env.NEXUS_PROJECT_DIR || process.cwd());
const DUMP_PATH = path.join(PROJECT_ROOT, '.dev-state.json');

const server = new Server(
  {
    name: 'nexus-state-inspector',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_active_realm_summary',
        description: 'Get high-level statistics of the active campaign realm (total entities, types breakdown, world phase, active tab).',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'query_dev_entities',
        description: 'Filter and inspect entities in the live exported dev state by type or search term.',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Filter by EntityType (e.g. character, location, condition, item)',
            },
            search: {
              type: 'string',
              description: 'Case-insensitive substring search in name or description',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of records to return (default: 10)',
            },
          },
        },
      },
    ],
  };
});

function readDevState() {
  if (!fs.existsSync(DUMP_PATH)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(DUMP_PATH, 'utf8'));
  } catch {
    return null;
  }
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const state = readDevState();

  if (!state) {
    return {
      content: [
        {
          type: 'text',
          text: `No active dev state found at ${DUMP_PATH}. Click "Dev Snapshot" in Nexus System Settings or run the app to generate state.`,
        },
      ],
    };
  }

  if (name === 'get_active_realm_summary') {
    const world = state.state?.world || state.world || {};
    const entities = world.entities || [];
    const breakdown = {};
    for (const e of entities) {
      breakdown[e.type] = (breakdown[e.type] || 0) + 1;
    }

    const summary = {
      realmName: world.name || 'Unknown',
      worldPhase: world.worldPhase || 'creation',
      totalEntities: entities.length,
      trashCount: (world.trash || []).length,
      entityBreakdown: breakdown,
      activeTab: state.state?.activeTab || state.activeTab,
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }],
    };
  }

  if (name === 'query_dev_entities') {
    const world = state.state?.world || state.world || {};
    let entities = world.entities || [];
    const filterType = args?.type;
    const search = args?.search?.toLowerCase();
    const limit = args?.limit || 10;

    if (filterType) {
      entities = entities.filter((e) => e.type === filterType);
    }
    if (search) {
      entities = entities.filter(
        (e) =>
          (e.name && e.name.toLowerCase().includes(search)) ||
          (e.description && e.description.toLowerCase().includes(search))
      );
    }

    const trimmed = entities.slice(0, limit).map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      parentId: e.parentId,
      updatedAt: e.updatedAt,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${entities.length} entities (showing ${trimmed.length}):\n${JSON.stringify(trimmed, null, 2)}`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

run().catch((err) => {
  console.error('State inspector fatal error:', err);
  process.exit(1);
});
