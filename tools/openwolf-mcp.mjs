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
const WOLF_DIR = path.join(PROJECT_ROOT, '.wolf');

const server = new Server(
  {
    name: 'nexus-openwolf-mcp',
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
        name: 'openwolf_status',
        description: 'Read the latest session handoff status, goals, and recent completed quests from .wolf/STATUS.md.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'openwolf_cerebrum',
        description: 'Read the learned preferences, Do-Not-Repeat rules, and architecture decisions from .wolf/cerebrum.md.',
        inputSchema: {
          type: 'object',
          properties: {
            section: {
              type: 'string',
              description: 'Optional section filter: "User Preferences", "Key Learnings", "Do-Not-Repeat", "Decision Log"',
            },
          },
        },
      },
      {
        name: 'openwolf_anatomy_query',
        description: 'Query .wolf/anatomy.md for a specific file or folder path to get its description and token estimate without reading the whole index.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'File name, folder, or keyword to match against anatomy.md',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'openwolf_log_bug',
        description: 'Log a resolved bug, regression, or repeated edit to .wolf/buglog.json following the official OpenWolf format.',
        inputSchema: {
          type: 'object',
          properties: {
            error_message: { type: 'string' },
            file: { type: 'string' },
            root_cause: { type: 'string' },
            fix: { type: 'string' },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['error_message', 'file', 'root_cause', 'fix'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'openwolf_status') {
      const statusFile = path.join(WOLF_DIR, 'STATUS.md');
      if (!fs.existsSync(statusFile)) {
        return { content: [{ type: 'text', text: 'STATUS.md not found.' }] };
      }
      const content = fs.readFileSync(statusFile, 'utf8');
      return { content: [{ type: 'text', text: content }] };
    }

    if (name === 'openwolf_cerebrum') {
      const cerebrumFile = path.join(WOLF_DIR, 'cerebrum.md');
      if (!fs.existsSync(cerebrumFile)) {
        return { content: [{ type: 'text', text: 'cerebrum.md not found.' }] };
      }
      const content = fs.readFileSync(cerebrumFile, 'utf8');
      const section = args?.section;

      if (section) {
        const regex = new RegExp(`## ${section}[\\s\\S]*?(?=\\n## |$)`, 'i');
        const match = content.match(regex);
        return {
          content: [
            {
              type: 'text',
              text: match ? match[0] : `Section "${section}" not found in cerebrum.md.`,
            },
          ],
        };
      }
      return { content: [{ type: 'text', text: content }] };
    }

    if (name === 'openwolf_anatomy_query') {
      const anatomyFile = path.join(WOLF_DIR, 'anatomy.md');
      if (!fs.existsSync(anatomyFile)) {
        return { content: [{ type: 'text', text: 'anatomy.md not found.' }] };
      }
      const query = (args?.query || '').toLowerCase();
      const lines = fs.readFileSync(anatomyFile, 'utf8').split('\n');
      const matched = lines.filter((l) => l.toLowerCase().includes(query));

      return {
        content: [
          {
            type: 'text',
            text: matched.length > 0 ? matched.join('\n') : `No matching anatomy entries found for "${query}".`,
          },
        ],
      };
    }

    if (name === 'openwolf_log_bug') {
      const buglogFile = path.join(WOLF_DIR, 'buglog.json');
      let bugs = [];
      if (fs.existsSync(buglogFile)) {
        try {
          bugs = JSON.parse(fs.readFileSync(buglogFile, 'utf8'));
        } catch {
          bugs = [];
        }
      }

      const id = `BUG-${String(bugs.length + 1).padStart(3, '0')}`;
      const entry = {
        id,
        timestamp: new Date().toISOString(),
        error_message: args?.error_message,
        file: args?.file,
        root_cause: args?.root_cause,
        fix: args?.fix,
        tags: args?.tags || [],
        occurrences: 1,
        last_seen: new Date().toISOString().split('T')[0],
      };

      bugs.push(entry);
      fs.writeFileSync(buglogFile, JSON.stringify(bugs, null, 2), 'utf8');

      return {
        content: [
          {
            type: 'text',
            text: `Logged ${id} successfully to buglog.json.`,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error executing ${name}: ${error.message}` }],
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

run().catch((error) => {
  console.error('Fatal error in MCP server:', error);
  process.exit(1);
});
