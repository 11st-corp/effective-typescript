const x: number = null;

const y: number | null = null;

const el = document.getElementById('status');
el.textContent = 'Ready';

if (el) {
    el.textContent = 'Ready';
}
el!.textContent = 'Ready';