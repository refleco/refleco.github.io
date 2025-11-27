import { Universe } from "./animations.js";
import './style.css';

function run() {
    const canvasId = "rust-canvas"; // Keeping ID for compatibility with CSS
    const universe = new Universe(canvasId);

    function renderLoop() {
        universe.tick();
        requestAnimationFrame(renderLoop);
    }

    renderLoop();

    window.addEventListener('resize', () => {
        universe.resize(window.innerWidth, window.innerHeight);
        universe.initParticles(); // Re-init to adjust count
    });
}

run();
