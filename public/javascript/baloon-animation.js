const particles = [];
for (let i = 0; i < 100; i++) {
    particles.push({
        x: Math.random() > .5 ? 0 : window.innerWidth,
        y: window.innerHeight / 2,
        vx: (Math.random() * 2) - 1,
        vy: (Math.random() * 2 - 1),
        history: [],
        size: 4 + Math.random() * 6,
        color: Math.random() > .5 ? "#000000" : Math.random() > .5 ? "#FF0000" : "#FFFF00"
    });
}

const mouse = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
};

const canvas = document.getElementById('background');

if (canvas && canvas.getContext) {
    var context = canvas.getContext('2d');

    Initialize();
}

function Initialize() {
    canvas.addEventListener('mousemove', MouseMove, false);
    window.addEventListener('resize', ResizeCanvas, false);
    TimeUpdate();

    context.beginPath();

    ResizeCanvas();
}

function TimeUpdate(e) {

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = 0; i < particles.length; i++) {
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;

        if (particles[i].x > window.innerWidth) {
            particles[i].vx = -1 - Math.random();
        } else if (particles[i].x < 0) {
            particles[i].vx = 1 + Math.random();
        } else {
            particles[i].vx *= 1 + (Math.random() * 0.005);
        }

        if (particles[i].y > window.innerHeight) {
            particles[i].vy = -1 - Math.random();
        } else if (particles[i].y < 0) {
            particles[i].vy = 1 + Math.random();
        } else {
            particles[i].vy *= 1 + (Math.random() * 0.005);
        }

        context.strokeStyle = particles[i].color;
        context.beginPath();
        for (var j = 0; j < particles[i].history.length; j++) {
            context.lineTo(particles[i].history[j].x, particles[i].history[j].y);
        }
        context.stroke();

        particles[i].history.push({
            x: particles[i].x,
            y: particles[i].y
        });
        if (particles[i].history.length > 45) {
            particles[i].history.shift();
        }

        for (var j = 0; j < particles[i].history.length; j++) {
            particles[i].history[j].x += 0.01 * (mouse.x - particles[i].history[j].x) / (45/j);
            particles[i].history[j].y += 0.01 * (mouse.y - particles[i].history[j].y) / (45/j);
        }


        let distanceFactor = DistanceBetween(mouse, particles[i]);
        distanceFactor = Math.pow(Math.max(Math.min(10 - (distanceFactor / 10), 10), 2), .5);

        context.fillStyle = particles[i].color;
        context.beginPath();
        context.arc(particles[i].x, particles[i].y, particles[i].size * distanceFactor, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();

    }

    requestAnimationFrame(TimeUpdate);
}

function MouseMove(e) {
    mouse.x = e.layerX;
    mouse.y = e.layerY;

    //context.fillRect(e.layerX, e.layerY, 5, 5);
    //Draw( e.layerX, e.layerY );
}

function Draw(x, y) {
    context.strokeStyle = '#ff0000';
    context.lineWidth = 4;
    context.lineTo(x, y);
    context.stroke();
}

function ResizeCanvas(e) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function DistanceBetween(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}