import { Agent } from './agent.js';
import { TimelineSystem } from './timeline-system.js';
import { ProactiveSuggestions } from './proactive-system.js';
import { PreferenceLearning } from './preference-system.js';
import { formatCodeBlock, initCodeHighlighting } from './code-formatter.js';

// Sistema de Depuração (carregado dinamicamente)
let DebugSystem = null;

// Flag de debug global (desativar em produção)
const DEBUG = false;
