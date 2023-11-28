import { Plugin } from '@nocobase/server';
import WorkflowPlugin from '@nocobase/plugin-workflow';

import LoopInstruction from './LoopInstruction';

export default class WorkflowDynamicCalculationPlugin extends Plugin {
  workflow: WorkflowPlugin;

  async load() {
    const workflowPlugin = this.app.getPlugin(WorkflowPlugin) as WorkflowPlugin;
    this.workflow = workflowPlugin;
    workflowPlugin.instructions.register('loop', new LoopInstruction(workflowPlugin));
  }
}
