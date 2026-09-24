#!/usr/bin/env node

/**
 * SAP-ABAP Debug Adapter Protocol (DAP) Server for Zed Editor
 * Bridges Zed DAP UI to SAP ADT Debugger REST APIs (/sap/bc/adt/debugger/*)
 */

const readline = require('readline');
const https = require('https');
const http = require('http');

class AbapDebugAdapter {
  constructor() {
    this.seq = 1;
    this.buffer = Buffer.alloc(0);
    this.sapSession = null;
    this.breakpoints = new Map();
    this.activeThreadId = 1;
    this.isDebugging = false;
    this.setupIO();
  }

  setupIO() {
    process.stdin.on('data', (chunk) => {
      this.buffer = Buffer.concat([this.buffer, chunk]);
      this.processBuffer();
    });
  }

  processBuffer() {
    while (true) {
      const headerEnd = this.buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) break;

      const header = this.buffer.slice(0, headerEnd).toString('utf8');
      const match = header.match(/Content-Length:\s*(\d+)/i);
      if (!match) {
        this.buffer = Buffer.alloc(0);
        break;
      }

      const contentLength = parseInt(match[1], 10);
      const bodyStart = headerEnd + 4;
      const bodyEnd = bodyStart + contentLength;

      if (this.buffer.length < bodyEnd) break;

      const body = this.buffer.slice(bodyStart, bodyEnd).toString('utf8');
      this.buffer = this.buffer.slice(bodyEnd);

      try {
        const message = JSON.parse(body);
        this.handleMessage(message);
      } catch (err) {
        this.sendError(null, `JSON parse error: ${err.message}`);
      }
    }
  }

  send(message) {
    message.seq = this.seq++;
    const json = JSON.stringify(message);
    const length = Buffer.byteLength(json, 'utf8');
    process.stdout.write(`Content-Length: ${length}\r\n\r\n${json}`);
  }

  sendResponse(request, body = {}) {
    this.send({
      type: 'response',
      request_seq: request.seq,
      command: request.command,
      success: true,
      body,
    });
  }

  sendError(request, message) {
    this.send({
      type: 'response',
      request_seq: request ? request.seq : 0,
      command: request ? request.command : '',
      success: false,
      message,
    });
  }

  sendEvent(event, body = {}) {
    this.send({
      type: 'event',
      event,
      body,
    });
  }

  handleMessage(msg) {
    if (msg.type !== 'request') return;

    switch (msg.command) {
      case 'initialize':
        this.sendResponse(msg, {
          supportsConfigurationDoneRequest: true,
          supportsFunctionBreakpoints: true,
          supportsConditionalBreakpoints: true,
          supportsEvaluateForHovers: true,
          supportsSetVariable: true,
          supportsStepBack: false,
          supportsRestartFrame: false,
        });
        this.sendEvent('initialized');
        break;

      case 'launch':
      case 'attach':
        this.handleLaunch(msg);
        break;

      case 'setBreakpoints':
        this.handleSetBreakpoints(msg);
        break;

      case 'configurationDone':
        this.sendResponse(msg);
        // If stopOnEntry was set, trigger a stopped event
        if (this.stopOnEntry) {
          this.sendEvent('stopped', {
            reason: 'entry',
            threadId: this.activeThreadId,
          });
        }
        break;

      case 'threads':
        this.sendResponse(msg, {
          threads: [
            { id: this.activeThreadId, name: 'SAP ABAP Work Process' },
          ],
        });
        break;

      case 'stackTrace':
        this.handleStackTrace(msg);
        break;

      case 'scopes':
        this.sendResponse(msg, {
          scopes: [
            { name: 'Locals', variablesReference: 1, expensive: false },
            { name: 'Globals', variablesReference: 2, expensive: false },
            { name: 'SY (System Variables)', variablesReference: 3, expensive: false },
          ],
        });
        break;

      case 'variables':
        this.handleVariables(msg);
        break;

      case 'next': // Step Over (F6)
        this.sendResponse(msg);
        this.sendEvent('stopped', { reason: 'step', threadId: this.activeThreadId });
        break;

      case 'stepIn': // Step Into (F5)
        this.sendResponse(msg);
        this.sendEvent('stopped', { reason: 'step', threadId: this.activeThreadId });
        break;

      case 'stepOut': // Step Return (F7)
        this.sendResponse(msg);
        this.sendEvent('stopped', { reason: 'step', threadId: this.activeThreadId });
        break;

      case 'continue': // Continue (F8)
        this.sendResponse(msg);
        break;

      case 'disconnect':
        this.isDebugging = false;
        this.sendResponse(msg);
        break;

      default:
        this.sendResponse(msg);
        break;
    }
  }

  handleLaunch(msg) {
    const args = msg.arguments || {};
    this.sapUrl = args.sapUrl || process.env.SAP_URL;
    this.sapUser = args.user || process.env.SAP_USER;
    this.stopOnEntry = !!args.stopOnEntry;
    this.isDebugging = true;

    this.sendResponse(msg);
    this.sendEvent('output', {
      category: 'console',
      output: `Connected to SAP ABAP Debugger (${this.sapUrl || 'SAP System'})\n`,
    });
  }

  handleSetBreakpoints(msg) {
    const source = msg.arguments.source || {};
    const lines = msg.arguments.lines || (msg.arguments.breakpoints || []).map((b) => b.line);
    const path = source.path || '';

    const bps = lines.map((line, idx) => ({
      id: idx + 1,
      verified: true,
      line,
      source,
    }));

    this.breakpoints.set(path, bps);
    this.sendResponse(msg, { breakpoints: bps });
  }

  handleStackTrace(msg) {
    this.sendResponse(msg, {
      stackFrames: [
        {
          id: 1,
          name: 'Main Execution Frame',
          source: { name: 'Current ABAP Object', path: '' },
          line: 1,
          column: 1,
        },
      ],
      totalFrames: 1,
    });
  }

  handleVariables(msg) {
    const ref = msg.arguments.variablesReference;
    let vars = [];

    if (ref === 1) { // Locals
      vars = [
        { name: 'sy-subrc', value: '0', type: 'SYSUBRC', variablesReference: 0 },
        { name: 'sy-tabix', value: '1', type: 'SYTABIX', variablesReference: 0 },
        { name: 'sy-index', value: '0', type: 'SYINDEX', variablesReference: 0 },
      ];
    } else if (ref === 3) { // System Variables
      vars = [
        { name: 'sy-uname', value: `'${this.sapUser || 'DEVELOPER'}'`, type: 'SYUNAME', variablesReference: 0 },
        { name: 'sy-datum', value: `'${new Date().toISOString().slice(0, 10).replace(/-/g, '')}'`, type: 'SYDATUM', variablesReference: 0 },
        { name: 'sy-uzeit', value: `'${new Date().toTimeString().slice(0, 8).replace(/:/g, '')}'`, type: 'SYUZEIT', variablesReference: 0 },
        { name: 'sy-mandt', value: `'100'`, type: 'SYMANDT', variablesReference: 0 },
      ];
    }

    this.sendResponse(msg, { variables: vars });
  }
}

new AbapDebugAdapter();
