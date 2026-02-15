let nivelAtualClassico = localStorage.getItem('nivelClassico') ? parseInt(localStorage.getItem('nivelClassico')) : 1;
window.transitionAlpha = 1;
let lastFrameTime = 0;

const canvas = document.getElementById('gameCanvas');
if (!canvas) {
    console.error("Canvas não encontrado no DOM!");
    throw new Error("Canvas não inicializado.");
}
window.canvas = canvas;
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function ajustarCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.setTransform(1, 0, 0, 1, 0, 0); /* Reseta escala */
}
ajustarCanvas(); // Chamada inicial
window.addEventListener("resize", ajustarCanvas);

function preloadSounds() {
    const promises = [];
     Object.values(window.playersData).forEach(countryData => {
        if (countryData.gameMusic) {
            soundFiles[countryData.gameMusic] = countryData.gameMusic;
        }
    });

    // Adicione as músicas do menu
    MENU_MUSIC_PATHS.forEach(path => {
        soundFiles[path] = path;
    });
    Object.values(soundFiles).forEach(path => {
        const audio = new Audio(path);
        window.loadedSounds[path] = audio;
        promises.push(new Promise((resolve) => {
            audio.oncanplaythrough = () => resolve();
            audio.onerror = () => resolve(); // não trava se der erro
            audio.load();
        }));
    });
    return Promise.all(promises);
}

const MENU_MUSIC_PATHS = [
    './assets/audio/musica-menu.ogg',
    './assets/audio/musica-menu-2.ogg',
    './assets/audio/musica-menu-3.ogg',
];
window.MENU_MUSIC_PATHS = MENU_MUSIC_PATHS;

const SCREENS = {
    LOADING: 'loading',
    MENU: 'menu',
    MODE_SELECT: 'modeSelect',
    COUNTRY_SELECT: 'countrySelect',
    DIFFICULTY_SELECT: 'difficultySelect',
    GAME: 'game',
    GAME_OVER: 'gameOver',
    PAUSE: 'pause',
    ABILITIES: 'abilities',
    ABILITY_DETAILS: 'abilityDetails',
    SETTINGS: 'settings',
    CREDITS: 'credits', 
    ABILITIES_TUTORIAL: 'abilitiesTutorial'
};

const SOUND_EFFECTS = {
    CLICK: 'butao-1',
    FLIP: 'clique-na-carta',
    MATCH: 'button-27',
    MISMATCH: 'button-10',
    WIN: 'concluido',
    LOSE: 'derrota',
    COIN_SPEND: 'som-comprar',
    UPGRADE_SUCCESS: 'evoluir',
    UPGRADE_FAIL: 'erro-evolu',
    COIN_GAIN: 'dinheiro',
};

const soundFiles = {
    [SOUND_EFFECTS.CLICK]: './assets/audio/butao-1.ogg',
    [SOUND_EFFECTS.MATCH]: './assets/audio/button-27.ogg',
    [SOUND_EFFECTS.MISMATCH]: './assets/audio/button-10.ogg',
    [SOUND_EFFECTS.FLIP]: './assets/audio/clique-na-carta.ogg',
    [SOUND_EFFECTS.WIN]: './assets/audio/concluido.ogg',
    [SOUND_EFFECTS.LOSE]: './assets/audio/derrota.ogg',
    [SOUND_EFFECTS.COIN_SPEND]: './assets/audio/som-comprar.ogg',
    [SOUND_EFFECTS.UPGRADE_SUCCESS]: './assets/audio/evoluir.ogg',
    [SOUND_EFFECTS.UPGRADE_FAIL]: './assets/audio/erro-evolu.ogg',
    [SOUND_EFFECTS.COIN_GAIN]: './assets/audio/dinheiro.ogg',
};


const CARD_ASPECT_RATIO = 0.7;
const CANVAS_MARGIN_X_PERCENT = 0.04;
const CANVAS_MARGIN_Y_PERCENT = 0.1;
const FALLBACK_IMAGE_PATH = './assets/img/fallback-image.jpg';

window.SCREENS = SCREENS;
window.SOUND_EFFECTS = SOUND_EFFECTS;
window.CARD_ASPECT_RATIO = CARD_ASPECT_RATIO;
window.CANVAS_MARGIN_X_PERCENT = CANVAS_MARGIN_X_PERCENT;
window.CANVAS_MARGIN_Y_PERCENT = CANVAS_MARGIN_Y_PERCENT;
window.FALLBACK_IMAGE_PATH = FALLBACK_IMAGE_PATH;

window.loadedImages = {};
window.loadedSounds = {};
let assetsLoaded = 0;
let assetsToLoad = [];
let screenAlpha = 0; // <--- ADICIONE ESTA LINHA AQUI

// ESTADO INICIAL ÚNICO E CORRETO DO JOGO
const initialGameState = {
    screen: SCREENS.LOADING,
    cards: [],
    flippedCards: [],
    matchedCards: [],
    moves: 0,
    time: 0,
    timer: null,
    isClickLocked: false,
    currentCountry: null,
    currentDifficulty: null,
    unlockedCountries: ['england'],
    unlockedDifficulties: { england: ['easy'] },
    imageUsageCount: {
        england: { easy: {}, medium: {}, hard: {} },
        espanha: { easy: {}, medium: {}, hard: {} },
        brasil: { easy: {}, medium: {}, hard: {} }
    },
    buttonJumpStates: {},
    containerJumpStates: {},
    menuOpen: false,
    hasUserInteracted: false,
    sfxEnabled: true,
    musicEnabled: true,
    abilityLevels: {
        bonusTime: 0,
        peek: 0,
    },
    playerCoins: 0,
    coins: 0,
    currentSkinIndex: 0,
    hasSeenAbilitiesTutorial: false,
    
    // VARIÁVEIS DO RAIO-X
    peekActive: false,
    peekCooldown: 0,

    // NOVAS VARIÁVEIS PARA O COMBO
    comboCount: 0,
    floatingTexts: [],

    // === NOVAS VARIÁVEIS PARA O MODO CLÁSSICO ===
    classicScore: 0,
    classicRounds: 1,
    classicBestScore: 0,

    // NOVOS CAMPOS PARA O DELAY DA DERROTA
    showResultBlock: false,      // controla se o bloco aparece após o delay
    resultStartTime: 0,          // timestamp quando perdeu

    // === CORREÇÃO AQUI: VARIÁVEIS DO FADE DE DERROTA ===
    gameOverFade: 0,             // Opacidade do fundo preto (0 a 1)
    gameOverFadeActive: false    // Controla se o efeito de escurecer está rodando
};

// Atribuir o estado inicial correto diretamente à variável global
window.gameState = JSON.parse(JSON.stringify(initialGameState));

// 3. FUNÇÃO QUE SOBRESCREVE COM O QUE ESTÁ SALVO
function loadGameState() {
    const savedDataString = localStorage.getItem('gameState');
    if (savedDataString) {
        try {
            const loadedState = JSON.parse(savedDataString);
            // Mescla o que foi carregado com o estado inicial (Fallback Seguro)
            window.gameState = { ...initialGameState, ...loadedState };
            console.log('Dados carregados com sucesso');
        } catch (e) {
            console.error('Erro ao ler progresso, usando inicial', e);
        }
    }
}

window.currentlyPlayingSFX = null;
window.playSoundEffect = function(effect) {
    if (!window.gameState.sfxEnabled) {
        return;
    }

    // REMOVIDO: A lógica que pausava o som anterior (window.currentlyPlayingSFX.pause...)
    // Motivo: Isso causava o AbortError em cliques rápidos e impedia sons simultâneos.

    const soundPath = soundFiles[effect];

    if (soundPath && window.loadedSounds[soundPath]) {
        // Clona o nó de áudio para permitir sobreposição (tocar o mesmo som várias vezes)
        const audio = window.loadedSounds[soundPath].cloneNode();
        audio.volume = 0.5;

        // Tenta reproduzir sem armazenar em variável global para não bloquear o próximo
        audio.play().catch(e => {
            // Ignora AbortError silenciosamente, pois geralmente significa interação rápida demais
            if (e.name !== "AbortError") {
                console.warn("Erro ao reproduzir som:", e);
            }
        });
        
        // O garbage collector do JS limpará o áudio quando ele terminar, 
        // já que não estamos salvando a referência globalmente para SFX curtos.
    }
};

window.playBackgroundMusic = function(musicPath) {
    if (!gameState.hasUserInteracted) return;
    if (gameState.backgroundMusic) {
        if (gameState.backgroundMusic.src.includes(musicPath.split('/').pop()) && !gameState.backgroundMusic.paused) return;
        gameState.backgroundMusic.pause();
        gameState.backgroundMusic.currentTime = 0;
    }
    if (gameState.musicEnabled && window.loadedSounds[musicPath]) {
        gameState.backgroundMusic = window.loadedSounds[musicPath];
        gameState.backgroundMusic.loop = true;
        
        // NOVO: Define o volume da música para um valor fixo.
        // Você pode ajustar o valor (0.0 a 1.0) conforme desejar.
        gameState.backgroundMusic.volume = 0.1;
        
        gameState.backgroundMusic.play().catch(e => console.warn("Erro ao reproduzir música:", e));
    }
};

window.stopBackgroundMusic = function() {
    if (gameState.backgroundMusic) gameState.backgroundMusic.pause();
};

window.saveUnlockedCountries = function() {
    localStorage.setItem('unlockedCountries', JSON.stringify(gameState.unlockedCountries));
};

window.saveUnlockedDifficulties = function() {
    localStorage.setItem('unlockedDifficulties', JSON.stringify(gameState.unlockedDifficulties));
};

function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp;

    // Aumenta a opacidade gradualmente até 1
    if (screenAlpha < 1) {
        screenAlpha += 0.05;
        ctx.globalAlpha = screenAlpha;
    } else {
        ctx.globalAlpha = 1.0;
    }

    // 1. Cooldown da Habilidade Peek
    if (window.gameState.peekCooldown > 0) {
        window.gameState.peekCooldown -= deltaTime;
        if (window.gameState.peekCooldown < 0) window.gameState.peekCooldown = 0;
    }

    // 2. Atualização das Cartas (Flip e Shake)
    gameState.cards.forEach(card => {
        if (card.isFlipping) {
            const flipSpeed = 2.0;
            card.flipProgress += deltaTime * flipSpeed;
            if (card.flipProgress >= 1) {
                card.flipProgress = 1;
                card.isFlipping = false;
                card.isFlipped = card.flipDirection === 1;
                if (card.flipDirection === -1) card.flipProgress = 0;
            }
        }

        if (card.shakeTime > 0) {
            card.shakeTime -= deltaTime;
        } else {
            card.shakeTime = 0;
        }
    });

    // 3. Animação de Salto dos Botões
    for (const buttonId in gameState.buttonJumpStates) {
        const anim = gameState.buttonJumpStates[buttonId];
        if (anim && anim.isJumping) {
            const jumpSpeed = 6.0;
            anim.jumpProgress += deltaTime * jumpSpeed * anim.jumpDirection;
            if (anim.jumpProgress >= 1 && anim.jumpDirection === 1) {
                anim.jumpProgress = 1;
                anim.jumpDirection = -1;
            } else if (anim.jumpProgress <= 0 && anim.jumpDirection === -1) {
                anim.jumpProgress = 0;
                anim.isJumping = false;
                delete gameState.buttonJumpStates[buttonId];
            }
        }
    }

    // 4. Animação de Salto dos Containers
    for (const containerId in gameState.containerJumpStates) {
        const anim = gameState.containerJumpStates[containerId];
        if (anim && anim.isJumping) {
            const jumpSpeed = 6.0;
            anim.jumpProgress += deltaTime * jumpSpeed * anim.jumpDirection;
            if (anim.jumpProgress >= 1 && anim.jumpDirection === 1) {
                anim.jumpProgress = 1;
                anim.jumpDirection = -1;
            } else if (anim.jumpProgress <= 0 && anim.jumpDirection === -1) {
                anim.jumpProgress = 0;
                anim.isJumping = false;
            }
        }
    }

    // 5. Rotações e Efeitos Globais
    gameState.iconRotation = (gameState.iconRotation || 0) + deltaTime * 30;
    gameState.pulseScale = Math.sin(Date.now() / 500) * 0.05 + 1;

    // 6. Textos Flutuantes
    if (window.gameState.floatingTexts && window.gameState.floatingTexts.length > 0) {
        for (let i = window.gameState.floatingTexts.length - 1; i >= 0; i--) {
            const ft = window.gameState.floatingTexts[i];
            ft.y -= 1;
            ft.life -= deltaTime;
            ft.alpha = Math.max(0, ft.life);
            if (ft.life <= 0) {
                window.gameState.floatingTexts.splice(i, 1);
            }
        }
    }

    // 7. Lógica do jogo ativo: Timer + Vitória
    // 7. Lógica do jogo ativo: Timer + Vitória
    if (gameState.screen === SCREENS.GAME && gameState.cards && gameState.cards.length > 0) {
        if (gameState.timer > 0) {
            gameState.timer -= deltaTime;
            gameState.time += deltaTime;
        }

        // --- GATILHO DE DERROTA ---
        if (gameState.timer <= 0) {
            gameState.timer = 0;
            gameState.screen = SCREENS.GAME_OVER; // Muda a tela
            
            // Inicia o efeito de Fade
            gameState.gameOverFade = 0;          // Começa transparente
            gameState.gameOverFadeActive = true; // Ativa a animação de escurecer
            gameState.showResultBlock = false;   // Esconde o texto/botões por enquanto

            window.playSoundEffect(SOUND_EFFECTS.LOSE);
            window.saveGameState();

            // Após 2 segundos (tempo do fade), mostra o bloco de derrota
            setTimeout(() => {
                gameState.showResultBlock = true;
                render(); 
            }, 2000); 
        }

        window.gameLogic.checkForWin();
    }

    // --- ANIMAÇÃO DO FADE DE DERROTA ---
    // Faz a tela escurecer gradualmente se estiver no Game Over
    if (gameState.screen === SCREENS.GAME_OVER && gameState.gameOverFadeActive) {
        if (gameState.gameOverFade < 0.8) {
            gameState.gameOverFade += deltaTime * 0.5; // Velocidade do fade
        }
    }

    // 1. Atualiza a lógica das partículas e textos (Cálculos)
    if (window.updateGameParticles) {
        window.updateGameParticles(deltaTime);
    }

    // 2. Chama o desenho principal (Cartas, Fundo e HUD)
    render(); 

    // 3. Camada de OVERLAY (Tudo que fica na frente de tudo)
    
    // Se estiver no Game Over, desenha a tela de derrota/vitória
    if (gameState.screen === SCREENS.GAME_OVER) {
        window.drawGameOverScreen(); 
    }

    // Textos de Combo (Brilham por cima do quadro de derrota)
    if (window.drawComboTexts && window.gameState.floatingTexts.length > 0) {
        window.drawComboTexts();
    }

    // Partículas/Bolhas (O toque final, no topo de tudo)
    if (window.drawGameParticles) {
        window.drawGameParticles(ctx);
    }

    requestAnimationFrame(gameLoop);
}


window.render = function() {
    // 1. Limpa o Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 2. Fundo padrão (Preto ou o fundo de menu se preferir)
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Desenha a tela atual
    switch (gameState.screen) {
        case SCREENS.LOADING:
            drawLoadingScreen(assetsLoaded / assetsToLoad.length);
            break;
        case SCREENS.MENU:
            drawMenuScreen();
            break;
        case SCREENS.COUNTRY_SELECT:
            drawCountrySelectScreen();
            break;
        case SCREENS.DIFFICULTY_SELECT:
            drawDifficultySelectScreen();
            break;
        case SCREENS.GAME:
            drawGameScreen();
            break;
        case SCREENS.GAME_OVER:
            drawGameOverScreen();
            break;
        case SCREENS.PAUSE:
            drawPauseScreen();
            break;
        case SCREENS.ABILITIES:
            drawAbilitiesScreen();
            break;
        // --- TELAS QUE FALTAVAM NO SEU CÓDIGO ---
        case SCREENS.ABILITY_DETAILS:
            if (window.drawAbilityDetailsScreen) window.drawAbilityDetailsScreen();
            break;
        case SCREENS.ABILITIES_TUTORIAL:
            if (window.drawAbilitiesTutorialScreen) window.drawAbilitiesTutorialScreen();
            break;
        // ---------------------------------------
        case SCREENS.SETTINGS:
            drawSettingsScreen();
            break;
        case SCREENS.CREDITS:
            drawCreditsScreen();
            break;
    }

    if (window.gameState.floatingTexts && window.gameState.floatingTexts.length > 0) {
        if (window.drawComboTexts) window.drawComboTexts();
    }

    // 4. Desenha as partículas e textos flutuantes por cima de tudo (Overlay)
    if (window.drawComboTexts) window.drawComboTexts();
    
    // Se você tiver partículas de clique, elas também entram aqui no final
    if (window.desenharParticulasClique) window.desenharParticulasClique();

    // ADICIONE ISSO NO FINAL DO RENDER:
    if (window.drawGameParticles) {
        window.drawGameParticles(ctx); // Garanta que 'ctx' é o seu contexto do canvas
    }
};

async function init() {
    canvas.style.display = 'none';

    // CSS da tela de carregamento (Mantido o seu excelente trabalho de cores)
    const css = `
        body { background: #2c3e50; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .box { width: 260px; height: 360px; border: 5px solid #d35400; border-radius: 10px; background: #ecf0f1; position: relative; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.4); perspective: 800px; }
        .card { width: 40px; height: 60px; position: absolute; animation: drop 0.6s ease forwards; transform-style: preserve-3d; }
        .card-inner { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform 0.6s ease; }
        .card-front, .card-back { width: 100%; height: 100%; position: absolute; border: 2px solid #333; border-radius: 5px; backface-visibility: hidden; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; }
        .card-back { background: #3498db; box-shadow: inset 0 0 10px rgba(0,0,0,0.2); }
        .card-front { background: #ffffff; transform: rotateY(180deg); color: #333; }
        .card.flipped .card-inner { transform: rotateY(180deg); }
        @keyframes drop { 0% { top: -70px; opacity: 0; } 100% { top: var(--top); opacity: 1; } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
        .pulse { animation: pulse 0.6s infinite; }
        .progress { margin-top: 20px; font-size: 24px; font-weight: bold; color: white; }
    `;

    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    const box = document.createElement('div');
    box.id = 'box'; box.classList.add('box');
    document.body.appendChild(box);

    const progressDiv = document.createElement('div');
    progressDiv.id = 'progress'; progressDiv.classList.add('progress');
    progressDiv.textContent = '0%';
    document.body.appendChild(progressDiv);

    // 1. Coleta de recursos (Apenas uma vez)
    const imagesToLoad = [];
    if (window.playersData) {
        for (const countryKey in window.playersData) {
            const country = window.playersData[countryKey];
            imagesToLoad.push(country.flag, country.backImage, country.gameBackground);
            if (country.cardBackground) imagesToLoad.push(country.cardBackground);
            for (const diff in country) {
                if (Array.isArray(country[diff])) imagesToLoad.push(...country[diff]);
            }
        }
    }
    // Filtrar duplicados para evitar que passe de 100%
    const uniqueImages = [...new Set(imagesToLoad)].filter(path => path);

    let loadedCount = 0;
    const totalResources = uniqueImages.length + 1; // +1 para os sons
    let count = 0;
    const totalCards = 25;
    const rows = 5;
    const cardWidth = 40, cardHeight = 60, spacingX = 10, spacingY = 10;
    const cards = [];

    function updateLoadingProgress() {
        let percent = Math.floor((loadedCount / totalResources) * 100);
        percent = Math.min(percent, 100); // Clamping
        progressDiv.textContent = `${percent}%`;

        // Calcula quantas cartas devem cair baseado no progresso
        let targetCount = Math.floor((percent / 100) * totalCards);
        while (count < targetCount) {
            createAndAddCard();
            count++;
        }
        if (count >= totalCards && loadedCount >= totalResources) {
            setTimeout(showMessage, 800);
        }
    }

    function createAndAddCard() {
        const card = document.createElement('div');
        card.classList.add('card');
        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');
        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        
        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);

        const col = Math.floor(count / rows);
        const row = count % rows;
        const left = row * (cardWidth + spacingX) + 10;
        const top = col * (cardHeight + spacingY) + 10;

        card.style.setProperty('--top', `${top}px`);
        card.style.top = `${top}px`;
        card.style.left = `${left}px`;
        box.appendChild(card);
        cards.push({ element: card, front: cardFront, col, row });
    }

    const animationPromise = new Promise((resolve) => {
        window.showMessage = function() {
            const messageMap = { '0-0': 'V', '1-1': 'A', '2-2': 'M', '3-3': 'O', '4-4': 'S' };
            cards.forEach(({ element, front, col, row }) => {
                const key = `${col}-${row}`;
                if (messageMap[key]) {
                    front.textContent = messageMap[key];
                    setTimeout(() => element.classList.add('flipped'), 100 * (col + row));
                }
            });
            setTimeout(showOnlyExclamation, 2500);
        };

        function showOnlyExclamation() {
            cards.forEach(({ element, front, col, row }) => {
                element.classList.remove('flipped');
                element.classList.remove('pulse');
                front.textContent = '';
                front.style.background = '#ffeeba';
                if (col === 2 && row === 2) {
                    setTimeout(() => {
                        front.textContent = '!';
                        front.style.background = '#c3f0ca';
                        element.classList.add('flipped', 'pulse');
                    }, 300);
                }
            });
            setTimeout(resolve, 2500);
        }
    });

    // 2. Execução do carregamento real
    const loadPromises = uniqueImages.map(path => {
        return new Promise((res) => {
            const img = new Image();
            img.onload = img.onerror = () => {
                loadedCount++;
                updateLoadingProgress();
                res();
            };
            img.src = path;
            loadedImages[path] = img;
        });
    });

    const soundsPromise = preloadSounds().then(() => {
        loadedCount++;
        updateLoadingProgress();
    });

    await Promise.all([...loadPromises, soundsPromise, animationPromise]);

    // 3. Finalização
    box.remove();
    progressDiv.remove();
    style.remove();
    canvas.style.display = 'block';

    const setupAudioUnlock = () => {
        if (!gameState.hasUserInteracted) {
            gameState.hasUserInteracted = true;
            const randomIndex = Math.floor(Math.random() * MENU_MUSIC_PATHS.length);
            window.playBackgroundMusic(MENU_MUSIC_PATHS[randomIndex]);
            canvas.removeEventListener('click', setupAudioUnlock);
            canvas.removeEventListener('touchend', setupAudioUnlock);
        }
    };
    canvas.addEventListener('click', setupAudioUnlock);
    canvas.addEventListener('touchend', setupAudioUnlock);

    gameState.screen = SCREENS.MENU;
    canvas.style.visibility = 'visible';
    requestAnimationFrame(gameLoop); 
}

const GAME_SECRET = "MinhaChaveSecretaSuperDificil_2025!"; // Adicione isso

async function simpleHash(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function saveGameState() {
    const dataToSave = {
        unlockedCountries: gameState.unlockedCountries,
        unlockedDifficulties: gameState.unlockedDifficulties,
        imageUsageCount: gameState.imageUsageCount,
        abilityLevels: gameState.abilityLevels, // Salvar as habilidades
        playerCoins: gameState.playerCoins,
        hasSeenAbilitiesTutorial: gameState.hasSeenAbilitiesTutorial, // Salvar as moedas
        // === SALVE AS NOVAS VARIÁVEIS PARA O MODO CLÁSSICO ===
        classicScore: gameState.classicScore,
        classicRounds: gameState.classicRounds,
        classicBestScore: gameState.classicBestScore
    };
    const dataString = JSON.stringify(dataToSave);
    const dataHash = await simpleHash(dataString);
    localStorage.setItem('gameState', dataString);
    localStorage.setItem('gameStateHash', dataHash);
    console.log('Jogo salvo com segurança.');
}

window.saveUnlockedCountries = function() {
    // Salva apenas os países desbloqueados
    localStorage.setItem('unlockedCountries', JSON.stringify(window.gameState.unlockedCountries));
    // NOTA: É recomendável chamar saveGameState() no final de qualquer alteração de estado para garantir a persistência.
    window.saveGameState(); 
    console.log("Países desbloqueados salvos.");
};

async function loadGameState() {
    const savedDataString = localStorage.getItem('gameState');
    const savedHash = localStorage.getItem('gameStateHash');

    if (!savedDataString || !savedHash) {
        console.warn('Nenhum dado salvo ou hash encontrado. Iniciando novo jogo.');
        return;
    }

    const calculatedHash = await simpleHash(savedDataString);
    if (calculatedHash !== savedHash) {
        console.error('Alerta de Segurança: Os dados salvos foram adulterados!');
        localStorage.removeItem('gameState');
        localStorage.removeItem('gameStateHash');
        return;
    }

    try {
        const loadedState = JSON.parse(savedDataString);
        gameState.unlockedCountries = loadedState.unlockedCountries;
        gameState.unlockedDifficulties = loadedState.unlockedDifficulties;
        gameState.imageUsageCount = loadedState.imageUsageCount;
        // Carregar as novas variáveis, com um fallback caso não existam
        gameState.abilityLevels = loadedState.abilityLevels || initialGameState.abilityLevels;
        gameState.playerCoins = loadedState.playerCoins || initialGameState.playerCoins;
        gameState.hasSeenAbilitiesTutorial = loadedState.hasSeenAbilitiesTutorial || initialGameState.hasSeenAbilitiesTutorial;
        console.log('Jogo carregado com sucesso.');
    } catch (e) {
        console.error('Erro ao carregar os dados salvos:', e);
    }
}
// === BLOCO CORRIGIDO NO FIM DE script.js ===
window.addEventListener('load', () => {
    loadGameState(); 
    
    // 1. Torna o canvas visível
    canvas.style.visibility = 'visible'; 

    // 2. Inicia o loop do jogo
    init();
    
    // 3. Garante que o cálculo de clique (do input.js) está 100% correto
    if (window.updateCanvasRect) { 
        window.updateCanvasRect(); // CHAMA A FUNÇÃO DE FATO
    }
});

window.addEventListener('beforeunload', () => {
    if (window.gameState.screen === SCREENS.GAME) {
        window.gameLogic.saveGameInProgress();
    }
});