const gameArea = document.getElementById('gameArea');
const player = document.getElementById('player');
const scoreElement = document.getElementById('score');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const leaderboardScreen = document.getElementById('leaderboardScreen');
const leaderboardList = document.getElementById('leaderboardList');
const playerNameInput = document.getElementById('playerName');

const serverUrl = 'http://localhost:3000';

let playerPosition = 185;
let enemyInterval;
let animationId;
let score = 0;
let speed = 4;
let running = false;

/* CONTROLES */

document.addEventListener('keydown', e => {
    if (!running) return;

    if (e.key === 'ArrowLeft') playerPosition -= 25;
    if (e.key === 'ArrowRight') playerPosition += 25;

    playerPosition = Math.max(0, Math.min(370, playerPosition));
    player.style.left = playerPosition + 'px';
});

/* START */

function startGame() {

    cancelAnimationFrame(animationId);
    clearInterval(enemyInterval);

    document.querySelectorAll('.enemy').forEach(e=>e.remove());

    score = 0;
    speed = 4;
    running = true;

    scoreElement.textContent = score;

    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');

    enemyInterval = setInterval(createEnemy, 900);
    animationId = requestAnimationFrame(loop);
}

/* ENEMIGOS */

function createEnemy() {

    if (!running) return;

    const e = document.createElement('div');
    e.className = 'enemy';
    e.style.left = Math.random()*370 + 'px';
    e.style.top = '-30px';

    gameArea.appendChild(e);
}

/* LOOP */

function loop() {

    if (!running) return;

    document.querySelectorAll('.enemy').forEach(enemy => {

        enemy.style.top = parseFloat(enemy.style.top) + speed + 'px';

        if (collision(player, enemy)) endGame();

        if (parseFloat(enemy.style.top) > 600) {
            enemy.remove();
            score++;
            scoreElement.textContent = score;
            if (score % 5 === 0) speed += .3;
        }

    });

    animationId = requestAnimationFrame(loop);
}

/* COLISIÓN */

function collision(a,b){

    const A = a.getBoundingClientRect();
    const B = b.getBoundingClientRect();

    return !(
        A.right < B.left ||
        A.left > B.right ||
        A.bottom < B.top ||
        A.top > B.bottom
    );
}

/* GAME OVER */

function endGame(){

    if(!running) return;

    running = false;

    clearInterval(enemyInterval);
    cancelAnimationFrame(animationId);

    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

/* GUARDAR SCORE */

async function saveScore(){

    const name = playerNameInput.value || "Jugador";

    try{

        await fetch(`${serverUrl}/submitScore`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({name, score})
        });

        await showLeaderboard();

    }catch{
        alert("Servidor apagado");
    }
}

/* LEADERBOARD */

async function showLeaderboard(){

    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    try{
        const r = await fetch(`${serverUrl}/getScores`);
        const d = await r.json();

        leaderboardList.innerHTML='';

        if(d.data.length===0){
            leaderboardList.innerHTML='<li>Aún no hay puntuaciones</li>';
        }

        d.data.forEach(p=>{
            const li=document.createElement('li');
            li.textContent=`${p.name} : ${p.score}`;
            leaderboardList.appendChild(li);
        });

        leaderboardScreen.classList.remove('hidden');

    }catch{
        leaderboardList.innerHTML='<li>Servidor apagado</li>';
        leaderboardScreen.classList.remove('hidden');
    }
}

function hideLeaderboard(){
    leaderboardScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
}
