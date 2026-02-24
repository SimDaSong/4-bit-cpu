// ─── Assembler ───

const OPCODES = {
  NOP:  0x0,
  LD:   0x1,
  MOV:  0x2,
  DISP: 0x3,
  XOR:  0x4,
  AND:  0x5,
  OR:   0x6,
  ADD:  0x7,
  SUB:  0xF,
};

function parseRegister(token) {
  const m = token.match(/^\$(\d+)$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (n < 0 || n > 7) return null;
  return n;
}

function assemble(source) {
  const lines = source.split('\n');
  const instructions = [];
  const errors = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].replace(/#.*$/, '').replace(/\/\/.*$/, '').trim();
    if (!raw) continue;

    const tokens = raw.split(/[\s,]+/).filter(Boolean);
    const mnemonic = tokens[0].toUpperCase();
    const lineNum = i + 1;

    if (!(mnemonic in OPCODES)) {
      errors.push(`Line ${lineNum}: Unknown instruction "${tokens[0]}"`);
      continue;
    }

    const opcode = OPCODES[mnemonic];
    let code = 0;
    let asm = mnemonic;

    try {
      switch (mnemonic) {
        case 'NOP':
          code = 0x0000;
          break;

        case 'LD': {
          if (tokens.length < 3) throw 'LD requires register and immediate value';
          const rd = parseRegister(tokens[1]);
          const imm = parseInt(tokens[2], 10);
          if (rd === null) throw `Invalid register "${tokens[1]}"`;
          if (isNaN(imm) || imm < 0 || imm > 15) throw `Immediate must be 0-15, got "${tokens[2]}"`;
          code = (opcode << 12) | (rd << 8) | imm;
          asm = `LD $${rd}, ${imm}`;
          break;
        }

        case 'MOV': {
          if (tokens.length < 3) throw 'MOV requires destination and source register';
          const rd = parseRegister(tokens[1]);
          const ra = parseRegister(tokens[2]);
          if (rd === null) throw `Invalid register "${tokens[1]}"`;
          if (ra === null) throw `Invalid register "${tokens[2]}"`;
          code = (opcode << 12) | (rd << 8) | (ra << 4);
          asm = `MOV $${rd}, $${ra}`;
          break;
        }

        case 'DISP': {
          if (tokens.length < 3) throw 'DISP requires two registers';
          const ra = parseRegister(tokens[1]);
          const rb = parseRegister(tokens[2]);
          if (ra === null) throw `Invalid register "${tokens[1]}"`;
          if (rb === null) throw `Invalid register "${tokens[2]}"`;
          code = (opcode << 12) | (ra << 4) | rb;
          asm = `DISP $${ra}, $${rb}`;
          break;
        }

        case 'XOR':
        case 'AND':
        case 'OR':
        case 'ADD':
        case 'SUB': {
          if (tokens.length < 4) throw `${mnemonic} requires three registers`;
          const rd = parseRegister(tokens[1]);
          const ra = parseRegister(tokens[2]);
          const rb = parseRegister(tokens[3]);
          if (rd === null) throw `Invalid register "${tokens[1]}"`;
          if (ra === null) throw `Invalid register "${tokens[2]}"`;
          if (rb === null) throw `Invalid register "${tokens[3]}"`;
          code = (opcode << 12) | (rd << 8) | (ra << 4) | rb;
          asm = `${mnemonic} $${rd}, $${ra}, $${rb}`;
          break;
        }
      }

      instructions.push({ code, asm, line: lineNum });
    } catch (e) {
      errors.push(`Line ${lineNum}: ${e}`);
    }
  }

  return { instructions, errors };
}

// ─── CPU Emulator ───

class CPU {
  constructor() {
    this.reset();
  }

  reset() {
    this.registers = new Array(8).fill(0);
    this.pc = 0;
    this.output = [];
    this.halted = false;
    this.prevRegisters = new Array(8).fill(0);
  }

  load(instructions) {
    this.program = instructions;
    this.reset();
  }

  step() {
    if (this.halted || this.pc >= this.program.length) {
      this.halted = true;
      return false;
    }

    this.prevRegisters = [...this.registers];
    const inst = this.program[this.pc];
    const code = inst.code;

    const opcode = (code >> 12) & 0xF;
    const addrD = (code >> 8) & 0x7;
    const addrA = (code >> 4) & 0x7;
    const addrB = code & 0x7;
    const data = code & 0xF;

    switch (opcode) {
      case 0x0: // NOP
        break;

      case 0x1: // LD
        this.registers[addrD] = data & 0xF;
        break;

      case 0x2: // MOV
        this.registers[addrD] = this.registers[addrA] & 0xF;
        break;

      case 0x3: // DISP
        this.output.push(this.registers[addrB] & 0xF);
        break;

      case 0x4: // XOR
        this.registers[addrD] = (this.registers[addrA] ^ this.registers[addrB]) & 0xF;
        break;

      case 0x5: // AND
        this.registers[addrD] = (this.registers[addrA] & this.registers[addrB]) & 0xF;
        break;

      case 0x6: // OR
        this.registers[addrD] = (this.registers[addrA] | this.registers[addrB]) & 0xF;
        break;

      case 0x7: // ADD
        this.registers[addrD] = (this.registers[addrA] + this.registers[addrB]) & 0xF;
        break;

      case 0xF: { // SUB
        const a = this.registers[addrA];
        const b = this.registers[addrB];
        this.registers[addrD] = (a - b) & 0xF;
        break;
      }
    }

    this.pc++;
    if (this.pc >= this.program.length) {
      this.halted = true;
    }

    return true;
  }

  changedRegisters() {
    const changed = [];
    for (let i = 0; i < 8; i++) {
      if (this.registers[i] !== this.prevRegisters[i]) changed.push(i);
    }
    return changed;
  }
}

// ─── UI ───

const EXAMPLE_CODE = `LD $0, 0
LD $1, 1
LD $2, 3
LD $3, 3
DISP $2, $3
MOV $4, $2
SUB $4, $4, $1
DISP $2, $4
ADD $3, $3, $1
DISP $2, $3
XOR $5, $3, $4
DISP $2, $5
AND $5, $3, $4
DISP $2, $5
OR $5, $3, $4
DISP $2, $5`;

const $ = (sel) => document.querySelector(sel);
const cpu = new CPU();
let program = [];
let runTimer = null;

// Elements
const codeEl = $('#code');
const errorEl = $('#asm-error');
const regGrid = $('#reg-grid');
const programList = $('#program-list');
const displayOutput = $('#display-output');
const machineCode = $('#machine-code');
const pcDisplay = $('#pc-display');
const btnAssemble = $('#btn-assemble');
const btnRun = $('#btn-run');
const btnStep = $('#btn-step');
const btnReset = $('#btn-reset');
const btnExample = $('#btn-example');
const speedInput = $('#speed');
const speedVal = $('#speed-val');

// Init register grid
function initRegisters() {
  regGrid.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const cell = document.createElement('div');
    cell.className = 'reg-cell';
    cell.id = `reg-${i}`;
    cell.innerHTML = `<span class="reg-name">R${i}</span><span class="reg-val" id="reg-val-${i}">0</span>`;
    regGrid.appendChild(cell);
  }
}

function updateRegisters(changedSet) {
  for (let i = 0; i < 8; i++) {
    const cell = $(`#reg-${i}`);
    const val = $(`#reg-val-${i}`);
    val.textContent = cpu.registers[i];
    if (changedSet.has(i)) {
      cell.classList.add('changed');
    } else {
      cell.classList.remove('changed');
    }
  }
}

function renderProgram() {
  programList.innerHTML = '';
  program.forEach((inst, i) => {
    const row = document.createElement('div');
    row.className = 'inst-row';
    row.id = `inst-${i}`;
    const hex = inst.code.toString(16).toUpperCase().padStart(4, '0');
    row.innerHTML = `<span class="inst-addr">${i}</span><span class="inst-hex">${hex}</span><span class="inst-asm">${inst.asm}</span>`;
    programList.appendChild(row);
  });
}

function renderMachineCode() {
  machineCode.innerHTML = '';
  program.forEach((inst, i) => {
    const hex = inst.code.toString(16).toUpperCase().padStart(4, '0');
    const bin = inst.code.toString(2).padStart(16, '0').replace(/(.{4})/g, '$1 ').trim();
    const row = document.createElement('div');
    row.className = 'mc-row';
    row.innerHTML = `<span class="mc-addr">${i}:</span><span class="mc-hex">${hex}</span><span class="mc-bin">${bin}</span>`;
    machineCode.appendChild(row);
  });
}

function highlightPC() {
  document.querySelectorAll('.inst-row').forEach((r) => r.classList.remove('active'));
  const current = $(`#inst-${cpu.pc}`);
  if (current) {
    current.classList.add('active');
    current.scrollIntoView({ block: 'nearest' });
  }
  pcDisplay.textContent = `PC: ${cpu.pc}`;
}

function renderOutput() {
  displayOutput.textContent = cpu.output.join(' ');
}

function updateUI() {
  const changed = new Set(cpu.changedRegisters());
  updateRegisters(changed);
  highlightPC();
  renderOutput();

  const running = runTimer !== null;
  btnStep.disabled = cpu.halted || running;
  btnRun.disabled = cpu.halted || running;
  btnRun.textContent = running ? 'Running...' : 'Run All';
}

// Actions
function doAssemble() {
  stopRun();
  const { instructions, errors } = assemble(codeEl.value);
  if (errors.length > 0) {
    errorEl.textContent = errors.join('; ');
    return;
  }
  if (instructions.length === 0) {
    errorEl.textContent = 'No instructions to assemble.';
    return;
  }
  errorEl.textContent = '';
  program = instructions;
  cpu.load(program);

  renderProgram();
  renderMachineCode();

  btnRun.disabled = false;
  btnStep.disabled = false;
  btnReset.disabled = false;

  updateUI();
}

function doStep() {
  if (cpu.halted) return;
  cpu.step();
  updateUI();
}

function doRun() {
  if (cpu.halted || runTimer !== null) return;
  const delay = parseInt(speedInput.value, 10);
  btnRun.textContent = 'Running...';
  btnRun.disabled = true;
  btnStep.disabled = true;

  runTimer = setInterval(() => {
    cpu.step();
    updateUI();
    if (cpu.halted) {
      stopRun();
    }
  }, delay);
}

function stopRun() {
  if (runTimer !== null) {
    clearInterval(runTimer);
    runTimer = null;
    btnRun.textContent = 'Run All';
    if (!cpu.halted) {
      btnRun.disabled = false;
      btnStep.disabled = false;
    }
  }
}

function doReset() {
  stopRun();
  if (program.length > 0) {
    cpu.load(program);
  }
  updateUI();
}

// Events
btnAssemble.addEventListener('click', doAssemble);
btnRun.addEventListener('click', doRun);
btnStep.addEventListener('click', doStep);
btnReset.addEventListener('click', doReset);
btnExample.addEventListener('click', () => {
  codeEl.value = EXAMPLE_CODE;
  doAssemble();
});

speedInput.addEventListener('input', () => {
  speedVal.textContent = speedInput.value + 'ms';
});

// Keyboard shortcut: Ctrl+Enter to assemble
codeEl.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    doAssemble();
  }
});

// Init
initRegisters();
