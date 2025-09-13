/**
 * IF-ELSE block with mutator following Blockly standard pattern
 * Based on Blockly's controls_if block implementation
 */
import * as Blockly from 'blockly/core';

export function registerIfElseMutator() {
  // Define the mutator methods
  const IF_ELSE_MUTATOR_MIXIN = {
    elseifCount_: 0,
    elseCount_: 0,
    
    /**
     * Create XML to represent the inputs.
     */
    mutationToDom: function(this: any): Element {
      const container = Blockly.utils.xml.createElement('mutation');
      if (this.elseifCount_) {
        container.setAttribute('elseif', String(this.elseifCount_));
      }
      if (this.elseCount_) {
        container.setAttribute('else', '1');
      }
      return container;
    },
    
    /**
     * Parse XML to restore the inputs.
     */
    domToMutation: function(this: any, xmlElement: Element) {
      this.elseifCount_ = parseInt(xmlElement.getAttribute('elseif') || '0', 10);
      this.elseCount_ = parseInt(xmlElement.getAttribute('else') || '0', 10);
      this.updateShape_();
    },
    
    /**
     * Populate the mutator's dialog with this block's components.
     */
    decompose: function(this: any, workspace: any) {
      const containerBlock = workspace.newBlock('controls_if_if');
      containerBlock.initSvg();
      let connection = containerBlock.nextConnection;
      
      for (let i = 1; i <= this.elseifCount_; i++) {
        const elseifBlock = workspace.newBlock('controls_if_elseif');
        elseifBlock.initSvg();
        connection.connect(elseifBlock.previousConnection);
        connection = elseifBlock.nextConnection;
      }
      
      if (this.elseCount_) {
        const elseBlock = workspace.newBlock('controls_if_else');
        elseBlock.initSvg();
        connection.connect(elseBlock.previousConnection);
      }
      
      return containerBlock;
    },
    
    /**
     * Reconfigure this block based on the mutator dialog's components.
     */
    compose: function(this: any, containerBlock: any) {
      let clauseBlock = containerBlock.nextConnection?.targetBlock();
      // Count number of inputs.
      this.elseifCount_ = 0;
      this.elseCount_ = 0;
      
      const valueConnections = [null];
      const statementConnections = [null];
      let elseStatementConnection = null;
      
      while (clauseBlock) {
        if (clauseBlock.type === 'controls_if_elseif') {
          this.elseifCount_++;
          valueConnections.push(clauseBlock.valueConnection_ || null);
          statementConnections.push(clauseBlock.statementConnection_ || null);
        } else if (clauseBlock.type === 'controls_if_else') {
          this.elseCount_ = 1;
          elseStatementConnection = clauseBlock.statementConnection_ || null;
        }
        clauseBlock = clauseBlock.nextConnection?.targetBlock() || null;
      }
      
      this.updateShape_();
      // Reconnect any child blocks.
      this.reconnectChildBlocks_(valueConnections, statementConnections, elseStatementConnection);
    },
    
    /**
     * Store pointers to any connected child blocks.
     */
    saveConnections: function(this: any, containerBlock: any) {
      let clauseBlock = containerBlock.nextConnection?.targetBlock();
      let i = 1;
      while (clauseBlock) {
        if (clauseBlock.type === 'controls_if_elseif') {
          const inputIf = this.getInput('IF' + i);
          const inputDo = this.getInput('DO' + i);
          clauseBlock.valueConnection_ = inputIf?.connection?.targetConnection || null;
          clauseBlock.statementConnection_ = inputDo?.connection?.targetConnection || null;
          i++;
        } else if (clauseBlock.type === 'controls_if_else') {
          const inputDo = this.getInput('ELSE');
          clauseBlock.statementConnection_ = inputDo?.connection?.targetConnection || null;
        }
        clauseBlock = clauseBlock.nextConnection?.targetBlock() || null;
      }
    },
    
    /**
     * Modify this block to have the correct number of inputs.
     */
    updateShape_: function(this: any) {
      // Delete everything.
      if (this.getInput('ELSE')) {
        this.removeInput('ELSE');
      }
      for (let i = 1; this.getInput('IF' + i); i++) {
        this.removeInput('IF' + i);
        this.removeInput('DO' + i);
      }
      // Rebuild block.
      for (let i = 1; i <= this.elseifCount_; i++) {
        this.appendValueInput('IF' + i)
            .setCheck('Boolean')
            .appendField('else if');
        this.appendStatementInput('DO' + i);
      }
      if (this.elseCount_) {
        this.appendStatementInput('ELSE')
            .appendField('else');
      }
    },
    
    /**
     * Reconnect child blocks.
     */
    reconnectChildBlocks_: function(this: any, valueConnections: any[], statementConnections: any[], elseStatementConnection: any) {
      // Sửa lỗi: Sử dụng API mới của Blockly thay vì Blockly.Mutator.reconnect
      for (let i = 1; i <= this.elseifCount_; i++) {
        // Kiểm tra nếu connection tồn tại trước khi reconnect
        if (valueConnections[i]) {
          const ifInput = this.getInput('IF' + i);
          if (ifInput && ifInput.connection) {
            ifInput.connection.connect(valueConnections[i]);
          }
        }
        if (statementConnections[i]) {
          const doInput = this.getInput('DO' + i);
          if (doInput && doInput.connection) {
            doInput.connection.connect(statementConnections[i]);
          }
        }
      }
      // Reconnect else statement
      if (elseStatementConnection) {
        const elseInput = this.getInput('ELSE');
        if (elseInput && elseInput.connection) {
          elseInput.connection.connect(elseStatementConnection);
        }
      }
    }
  };
  
  // Helper block for mutator dialog (container)
  Blockly.Blocks['controls_if_if'] = {
    init: function() {
      this.setStyle('ottobit_control_blue');
      this.appendDummyInput()
          .appendField('if');
      this.setNextStatement(true);
      this.setTooltip('');
      this.contextMenu = false;
    }
  };
  
  // Helper block for mutator dialog (else if)
  Blockly.Blocks['controls_if_elseif'] = {
    init: function() {
      this.setStyle('ottobit_control_blue');
      this.appendDummyInput()
          .appendField('else if');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
      this.contextMenu = false;
    }
  };
  
  // Helper block for mutator dialog (else)
  Blockly.Blocks['controls_if_else'] = {
    init: function() {
      this.setStyle('ottobit_control_blue');
      this.appendDummyInput()
          .appendField('else');
      this.setPreviousStatement(true);
      this.setTooltip('');
      this.contextMenu = false;
    }
  };
  
  // Register the mutator
  Blockly.Extensions.registerMutator(
    'ottobit_if_mutator',
    IF_ELSE_MUTATOR_MIXIN,
    undefined,
    ['controls_if_elseif', 'controls_if_else']
  );
}