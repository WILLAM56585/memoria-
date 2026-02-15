window.gameLogic = window.gameLogic || {};
// Inicializa o array global se não existir
window.gameParticles = [];

// NOVO: Adiciona a lógica para salvar o estado de uma partida em andamento.
window.gameLogic.saveGameInProgress = function() {
  const gameData = {
    screen: window.gameState.screen,
    cards: window.gameState.cards,
    flippedCards: window.gameState.flippedCards.map(card => card.id),
    matchedCards: window.gameState.matchedCards.map(card => card.id),
    moves: window.gameState.moves,
    time: window.gameState.time,
    currentCountry: window.gameState.currentCountry,
    currentDifficulty: window.gameState.currentDifficulty,
    timer: window.gameState.timer
  };
  localStorage.setItem('gameInProgress', JSON.stringify(gameData));
  console.log("Partida em andamento salva.");
};

// Função para criar uma explosão de bolhas em uma coordenada específica
window.createBubbleExplosion = function(x, y, color) {
    const amount = 15; // Quantidade de bolhas
    for (let i = 0; i < amount; i++) {
        window.gameParticles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            size: Math.random() * 8 + 4,
            color: color,
            alpha: 1.0,
            life: 1.0,
            isBubble: true
        });
    }
};

window.setupRandomClassicGame = function() {
    // 1. Coletar TODAS as imagens de nível 'medium' de todos os países
    let allMediumImages = [];
    Object.keys(window.playersData).forEach(countryKey => {
        const country = window.playersData[countryKey];
        if (country.medium) {
            allMediumImages = allMediumImages.concat(country.medium);
        }
    });

    // 2. Definir o número de pares para o nível Médio (ex: 8 pares = 16 cartas)
    const numPairs = 8; 
    
    // 3. Embaralhar a lista total e pegar apenas o necessário
    const selectedImages = allMediumImages
        .sort(() => Math.random() - 0.5)
        .slice(0, numPairs);

    // 4. Duplicar para criar os pares e embaralhar novamente
    const gameDeck = [...selectedImages, ...selectedImages]
        .sort(() => Math.random() - 0.5);

    // 5. Configurar o estado do jogo e mudar a tela
    window.gameState.cards = gameDeck.map((img, index) => ({
        id: index,
        image: img,
        isFlipped: false,
        isMatched: false
    }));

    window.gameState.screen = SCREENS.GAME;
    // Resetar timers e jogadas aqui se necessário
    window.gameState.moves = 0;
    window.gameState.time = 0;
};

// NOVO: Adiciona a lógica para carregar uma partida em andamento.
window.gameLogic.loadGameInProgress = function() {
  const savedGame = localStorage.getItem('gameInProgress');
  if (savedGame) {
    try {
      const gameData = JSON.parse(savedGame);

      // Reconstitui o estado do jogo
      window.gameState.screen = gameData.screen;
      // Reconstitui o array de cartas
      window.gameState.cards = gameData.cards.map((cardData, index) => {
        return {
          ...cardData,
          id: cardData.id || index // Adiciona um ID se não existir
        };
      });
      // Reconstitui as cartas viradas e combinadas usando os IDs
      window.gameState.flippedCards = gameData.flippedCards.map(id => window.gameState.cards.find(card => card.id === id)).filter(card => card);
      window.gameState.matchedCards = gameData.matchedCards.map(id => window.gameState.cards.find(card => card.id === id)).filter(card => card);
      window.gameState.moves = gameData.moves;
      window.gameState.time = gameData.time;
      window.gameState.currentCountry = gameData.currentCountry;
      window.gameState.currentDifficulty = gameData.currentDifficulty;
      window.gameState.timer = gameData.timer;

      console.log('Partida em andamento carregada com sucesso!');
      return true;
    } catch (e) {
      console.error('Erro ao carregar partida salva:', e);
      localStorage.removeItem('gameInProgress');
      return false;
    }
  }
  return false;
};

window.gameLogic.resetGame = function() {
  window.gameState.cards = [];
  window.gameState.flippedCards = [];
  window.gameState.matchedCards = [];
  window.gameState.moves = 0;
  window.gameState.time = 0;
  window.gameState.timer = 0;  // zera timer (será redefinido depois)
  window.gameState.isClickLocked = false;

  // NÃO zere esses dois campos! Eles precisam ser preservados ao avançar de fase
  // window.gameState.currentCountry = null;     ← REMOVA ou comente
  // window.gameState.currentDifficulty = null;  ← REMOVA ou comente

  localStorage.removeItem('gameInProgress');
  console.log("Partida reiniciada (país e dificuldade preservados).");
};

// Esta função garante que as imagens estão na RAM antes do jogo abrir
window.preloadImagesForLevel = function(imagePaths) {
    const promises = imagePaths.map(path => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = path;
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null); // Evita travar o jogo se uma imagem falhar
        });
    });
    return Promise.all(promises);
};

window.gameLogic.initGame = function() {
  const hasSavedGame = window.gameLogic.loadGameInProgress();

  if (!hasSavedGame) {
    // Removido: clearInterval(window.gameState.timerInterval);  ← não existe mais

    window.gameState.cards = [];
    window.gameState.flippedCards = [];
    window.gameState.matchedCards = [];
    window.gameState.moves = 0;
    window.gameState.time = 0;
    window.gameState.timer = 0;  // Zera timer inicial
    window.gameState.isClickLocked = false;
  
    switch (window.gameState.currentDifficulty) {
      case 'easy': 
        window.gameState.timer = 45; 
        break;
      case 'medium': 
        window.gameState.timer = 30; 
        break;
      case 'hard': 
        window.gameState.timer = 75;
        break;
      default: 
        window.gameState.timer = 45;
    }
  
    window.stopBackgroundMusic();
    window.playBackgroundMusic(
      window.playersData[window.gameState.currentCountry]?.gameMusic || 
      './assets/audio/musica-menu.ogg'
    );

    window.gameLogic.createCards();
    window.gameState.screen = window.SCREENS.GAME;
  } else {
    // Caso tenha jogo salvo: só restaura a tela
    // NÃO recrie o interval aqui também!
    // Removido: clearInterval e setInterval

    window.gameState.screen = window.SCREENS.GAME;
  }

  // Listener de beforeunload (mantenha)
  window.removeEventListener('beforeunload', window.gameLogic.saveGameInProgress);
  window.addEventListener('beforeunload', window.gameLogic.saveGameInProgress);
};

window.gameLogic.createCards = function() {
  const country = window.playersData[window.gameState.currentCountry];
  if (!country) {
    console.error(`País ${window.gameState.currentCountry} não encontrado em playersData.`);
    return;
  }

  // 1. Configurações de Dificuldade
  let numPairs, cols, rows;
  switch (window.gameState.currentDifficulty) {
    case 'easy':   numPairs = 8;  cols = 4; rows = 4; break;
    case 'medium': numPairs = 10; cols = 5; rows = 4; break;
    case 'hard':   numPairs = 15; cols = 6; rows = 5; break;
    default:       numPairs = 8;  cols = 4; rows = 4;
  }

  // 2. Preparação das Imagens
  let imagesForDifficulty = [...(country[window.gameState.currentDifficulty] || [])];

  // Inicializa contador de uso de imagem se não existir
  if (!window.gameState.imageUsageCount[window.gameState.currentCountry]?.[window.gameState.currentDifficulty]) {
    window.gameState.imageUsageCount[window.gameState.currentCountry] = window.gameState.imageUsageCount[window.gameState.currentCountry] || {};
    window.gameState.imageUsageCount[window.gameState.currentCountry][window.gameState.currentDifficulty] = {};
    imagesForDifficulty.forEach(img => {
      window.gameState.imageUsageCount[window.gameState.currentCountry][window.gameState.currentDifficulty][img] = 0;
    });
  }

  // Embaralha as imagens disponíveis para selecionar aleatoriamente
  imagesForDifficulty.sort(() => Math.random() - 0.5);

  if (imagesForDifficulty.length < numPairs) {
    console.warn(`Imagens insuficientes. Necessário: ${numPairs}, Disponível: ${imagesForDifficulty.length}`);
    numPairs = imagesForDifficulty.length;
  }

  let selectedImages = imagesForDifficulty.slice(0, numPairs);
  
  // Registra uso das imagens e salva
  selectedImages.forEach(img => {
    window.gameState.imageUsageCount[window.gameState.currentCountry][window.gameState.currentDifficulty][img]++;
  });
  if(window.saveGameState) window.saveGameState();

  // Cria o baralho (pares) e embaralha
  let cardsData = [...selectedImages, ...selectedImages];
  cardsData.sort(() => Math.random() - 0.5);

  // 3. CÁLCULO DE LAYOUT RESPONSIVO (O "Cérebro" do Posicionamento)
  
  // Definimos zonas onde as cartas NÃO podem entrar (em pixels responsivos)
  const topSafeArea = window.getResponsiveSize(110);    // Espaço para o Cronômetro/HUD
  const bottomSafeArea = window.getResponsiveSize(100); // Espaço para Botões Inferiores
  const spacing = window.getResponsiveSize(cols > 5 ? 8 : 12); // Espaço menor para níveis difíceis

  const availableW = window.canvas.width * 0.94; // 94% da largura da tela
  const availableH = window.canvas.height - topSafeArea - bottomSafeArea;

  // Cálculo da largura da carta baseado nas colunas
  let cardW = (availableW - (cols - 1) * spacing) / cols;
  let cardH = cardW * 1.35; // Proporção padrão de carta

  // Ajuste de segurança: Se a altura total do grid estourar o espaço vertical:
  if ((cardH * rows) + (rows - 1) * spacing > availableH) {
    cardH = (availableH - (rows - 1) * spacing) / rows;
    cardW = cardH / 1.35; // Recalcula largura mantendo a proporção
  }

  // Limite máximo para evitar que as cartas fiquem gigantes em monitores
  const maxCardDim = window.canvas.width * 0.18;
  if (cardW > maxCardDim) {
    cardW = maxCardDim;
    cardH = cardW * 1.35;
  }

  // Cálculo dos pontos iniciais para centralização perfeita
  const totalGridW = (cols * cardW) + ((cols - 1) * spacing);
  const totalGridH = (rows * cardH) + ((rows - 1) * spacing);
  
  const startX = (window.canvas.width - totalGridW) / 2;
  // O startY começa após a área do topo e centraliza o que sobra
  const startY = topSafeArea + (availableH - totalGridH) / 2;

  // 4. Criação dos Objetos das Cartas
  window.gameState.cards = cardsData.map((imagePath, index) => {
    const r = Math.floor(index / cols);
    const c = index % cols;
    
    return {
      id: index,
      imagePath: imagePath,
      x: startX + c * (cardW + spacing),
      y: startY + r * (cardH + spacing),
      width: cardW,
      height: cardH,
      isFlipped: false,
      isMatched: false,
      isFlipping: false,
      flipProgress: 0,
      flipDirection: 1,
      shakeTime: 0 // Para efeito visual de erro
    };
  });

  console.log(`✅ Grid ${cols}x${rows} gerado com sucesso!`);
};

window.gameLogic.handleCardClick = function(x, y) {
    // Bloqueia clique se estiver em animação ou fora da tela de jogo
    if (window.gameState.isClickLocked || window.gameState.screen !== window.SCREENS.GAME) return;

    // Procura a carta exata onde o utilizador tocou
    const card = window.gameState.cards.find(c =>
        x > c.x && x < c.x + c.width && y > c.y && y < c.y + c.height
    );

    // Verifica se a carta pode ser virada
    if (card && !card.isFlipped && !card.isMatched && window.gameState.flippedCards.length < 2) {
        card.isFlipped = true;
        card.isFlipping = true;
        card.flipProgress = 0;
        card.flipDirection = 1;
        
        window.gameState.flippedCards.push(card);
        if (window.playSoundEffect) window.playSoundEffect(window.SOUND_EFFECTS.FLIP);
        
        window.gameState.moves++;

        if (window.gameState.flippedCards.length === 2) {
            window.gameState.isClickLocked = true;
            // Pequeno delay para o jogador ver a segunda carta antes de verificar o par
            setTimeout(() => {
                window.gameLogic.checkMatch();
            }, 700);
        }
    }
};

function getAbilityCost(currentLevel) {
    return 5 * (currentLevel + 1);
}

// 1. Lógica de Verificação de Pares (Adaptada para o modo clássico)
window.gameLogic.checkMatch = function() {
    if (window.gameState.flippedCards.length < 2) return;

    window.gameState.isClickLocked = true;
    const [card1, card2] = window.gameState.flippedCards;

    if (card1.imagePath === card2.imagePath) {
    // --- ACERTO (PAR CORRETO) ---
    card1.isMatched = card2.isMatched = true; // Use 'isMatched' se for o que está no seu playersData.js
    window.gameState.matchedCards.push(card1, card2);
    
    // 1. EFEITOS VISUAIS (Flash e Bolhas)
    card1.matchFlash = 1.0; 
    card2.matchFlash = 1.0;

    if (window.createBubbleExplosion) {
        window.createBubbleExplosion(card1.x + card1.width / 2, card1.y + card1.height / 2, "#4CAF50");
        window.createBubbleExplosion(card2.x + card2.width / 2, card2.y + card2.height / 2, "#4CAF50");
    }

    // 2. COMBO E RECOMPENSAS
    window.gameState.comboCount = (window.gameState.comboCount || 0) + 1; // Incrementa combo
    window.gameState.playerCoins += 2; 
    window.gameState.timer += 2; // Ganha tempo extra

    // 3. EFEITOS SONOROS
    if (window.playSoundEffect) {
        window.playSoundEffect(window.SOUND_EFFECTS.MATCH);
    }

    // 4. CÁLCULO DE PONTUAÇÃO (MODO CLÁSSICO)
    if (window.gameState.currentCountry === 'classic') {
        window.gameState.classicScore += 100;
        if (window.gameState.comboCount > 1) { // Combo só bônus a partir do 2º acerto seguido
            window.gameState.classicScore += 50 * window.gameState.comboCount;
        }
        if (window.gameState.timer > 20) {
            window.gameState.classicScore += 20;
        }

        if (window.gameState.classicScore > window.gameState.classicBestScore) {
            window.gameState.classicBestScore = window.gameState.classicScore;
        }
    }

    // 5. LIMPEZA DE ESTADO
    window.gameState.flippedCards = [];
    window.gameState.isClickLocked = false;

    // 6. VERIFICA VITÓRIA
    if (window.gameState.matchedCards.length === window.gameState.cards.length) {
        handleWin(); // Chame uma função separada para organizar melhor
    }

} else {
        // --- ERRO (PAR DIFERENTE) ---
        if (window.createBubbleExplosion) {
        window.createBubbleExplosion(card1.x + card1.width / 2, card1.y + card1.height / 2, "#FF4444");
        window.createBubbleExplosion(card2.x + card2.width / 2, card2.y + card2.height / 2, "#FF4444");
    }
        
        // Efeito de tremer ao errar
        card1.shakeTime = 0.5;
        card2.shakeTime = 0.5;

        // Espera um pouco para o jogador ver as cartas e depois desvira
        setTimeout(() => {
            [card1, card2].forEach(card => {
                card.isFlipping = true;
                card.flipDirection = -1; // Inverte a animação para fechar
                card.flipProgress = 0;
            });
            window.gameState.flippedCards = [];
            window.gameState.isClickLocked = false;
        }, 700);
    }
    
    // Salva o progresso após cada jogada para não perder se o app fechar
    if (window.gameLogic.saveGameInProgress) {
        window.gameLogic.saveGameInProgress();
    }
};

// 2. Função de Salvamento (Essencial para mobile)
window.gameLogic.saveGameInProgress = function() {
  if (window.gameState.screen !== window.SCREENS.GAME) return;

  const gameData = {
    screen: window.gameState.screen,
    cards: window.gameState.cards,
    flippedCards: window.gameState.flippedCards.map(c => c.id),
    matchedCards: window.gameState.matchedCards.map(c => c.id),
    moves: window.gameState.moves,
    time: window.gameState.time,
    currentCountry: window.gameState.currentCountry,
    currentDifficulty: window.gameState.currentDifficulty,
    timer: window.gameState.timer
  };
  localStorage.setItem('gameInProgress', JSON.stringify(gameData));
};

window.usarPoderRaioX = function() {
    // 1. Bloqueios de segurança
    if (window.gameState.isClickLocked || 
        window.gameState.peekActive || 
        window.gameState.peekCooldown > 0) {
        return;
    }

    // 2. Ativa o estado Peek
    window.gameState.peekActive = true;
    window.gameState.isClickLocked = true;
    window.gameState.flippedCards = []; // Limpa cliques pendentes
    
    window.playSoundEffect(window.SOUND_EFFECTS.CLICK);

    // 3. Define a duração da visão baseada no nível (em segundos)
    const peekDuration = 1.5 + (window.gameState.abilityLevels.peek * 0.5); // 1.5s → 2.5s
    window.gameState.peekTimer = peekDuration;  // Contador regressivo (vai decrementar no gameLoop)

    // 4. Vira TODAS as cartas não combinadas e não viradas para frente
    window.gameState.cards.forEach(card => {
        if (!card.isMatched && !card.isFlipped) {
            card.isFlipping = true;
            card.flipDirection = 1;   // Virando para frente
            card.flipProgress = 0;
        }
    });

    // 4. Tempo de visão (Nível 1: 1.5s | Nível 2: 2s | Nível 3: 2.5s)
    const tempoDeVisao = 1000 + (window.gameState.abilityLevels.peek * 500);

    setTimeout(() => {
        // 5. Desvira as cartas
        window.gameState.cards.forEach(card => {
            if (!card.isMatched) {
                card.isFlipping = true;
                card.flipDirection = -1;
                card.flipProgress = 0;
            }
        });

        // 6. Libera o jogo após as cartas desvirarem
        setTimeout(() => {
            window.gameState.peekActive = false;
            window.gameState.isClickLocked = false;
        }, 500);

    }, tempoDeVisao);
};

window.gameLogic.resetJumpStates = function() {
    window.gameState.containerJumpStates = {};
    window.gameState.buttonJumpStates = {};
};
// NOVA: Flag global para controlar
window.debugEnabled = false;  // Começa DESLIGADO (progressão normal)

// Função Toggle (Console: window.toggleDebug() OU Pressione 'D' no menu)
window.toggleDebug = function() {
    if (!window.debugEnabled) {
        console.log("🔧 MODO DEBUG ATIVADO!");
        window.gameState.playerCoins = 99999;
        if (window.playersData) {
            window.gameState.unlockedCountries = Object.keys(window.playersData);
            window.gameState.unlockedDifficulties = {};
            Object.keys(window.playersData).forEach(country => {
                window.gameState.unlockedDifficulties[country] = ['easy', 'medium', 'hard'];
            });
        }
        window.gameState.abilityLevels.bonusTime = 5;
        window.gameState.abilityLevels.peek = 3;
        window.debugEnabled = true;
    } else {
        console.log("✅ MODO NORMAL (Progressão) ATIVADO!");
        window.gameState.unlockedCountries = ['england'];
        window.gameState.unlockedDifficulties = { england: ['easy'] };
        window.gameState.playerCoins = 0;
        window.gameState.abilityLevels = { bonusTime: 0, peek: 0 };
        window.debugEnabled = false;
    }
    window.saveGameState();
    if (window.render) window.render();  // Atualiza tela
};

// Tecla 'D' para toggle rápido (apenas no menu)
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'd' && window.gameState.screen === window.SCREENS.MENU) {
        window.toggleDebug();
    }
});
    // Força atualização da tela para destravar os cadeados visualmente
    window.render();

window.gameLogic.startRandomClassicGame = function() {
    console.log("🚀 Iniciando Modo Clássico Misto!");

    // 1. Limpa o estado anterior
    // Removido: clearInterval(window.gameState.timerInterval);  ← não precisa mais
    window.gameState.flippedCards = [];
    window.gameState.matchedCards = [];
    window.gameState.moves = 0;
    window.gameState.time = 0;
    window.gameState.isClickLocked = false;
    
    // 2. Configurações da partida
    window.gameState.currentDifficulty = 'medium'; 
    window.gameState.currentCountry = 'classic'; 
    window.gameState.timer = 45; 
    
    // REMOVA ESSA LINHA INTEIRA:
    // window.gameState.timerInterval = setInterval(window.gameLogic.updateTimer, 1000);

    // === INICIALIZA PONTUAÇÃO E RODADAS ===
    window.gameState.classicScore = 0;  // Reset pontuação para nova partida
    const savedRound = localStorage.getItem('nivelClassico');
    window.gameState.classicRounds = savedRound ? parseInt(savedRound) : 1;

    // 3. Som
    if(window.stopBackgroundMusic) window.stopBackgroundMusic();
    if(window.playBackgroundMusic) window.playBackgroundMusic('./assets/audio/musica-menu.ogg');

    // 4. CRIAR BARALHO MISTO (Mantido conforme o seu)
    let allImages = [];
    Object.keys(window.playersData).forEach(key => {
        const country = window.playersData[key];
        if (country.medium) allImages = allImages.concat(country.medium);
        else if (country.easy) allImages = allImages.concat(country.easy);
    });
    allImages.sort(() => Math.random() - 0.5);
    const selectedImages = allImages.slice(0, 10);
    let deck = [...selectedImages, ...selectedImages];
    deck.sort(() => Math.random() - 0.5);

    // 5. POSICIONAMENTO RESPONSIVO (CORREÇÃO DO TOPO)
    const cols = 5; 
    const rows = 4;
    
    // Áreas de segurança para UI
    const topSafeArea = window.getResponsiveSize(100);    // Espaço para o Timer
    const bottomSafeArea = window.getResponsiveSize(100); // Espaço para botões de poder/voltar
    const spacing = window.getResponsiveSize(12);

    // Área útil para as cartas
    const availableW = window.canvas.width * 0.94;
    const availableH = window.canvas.height - topSafeArea - bottomSafeArea;

    // Cálculo dinâmico do tamanho das cartas
    let cardW = (availableW - (cols - 1) * spacing) / cols;
    let cardH = cardW * 1.35; // Proporção padrão

    // Se as cartas ficarem muito altas para o ecrã, ajusta pela altura
    if ((cardH * rows) + (rows - 1) * spacing > availableH) {
        cardH = (availableH - (rows - 1) * spacing) / rows;
        cardW = cardH / 1.35;
    }

    const totalGridW = (cols * cardW) + ((cols - 1) * spacing);
    const totalGridH = (rows * cardH) + ((rows - 1) * spacing);
    
    const startX = (window.canvas.width - totalGridW) / 2;
    // O startY agora respeita a área de segurança do topo
    const startY = topSafeArea + (availableH - totalGridH) / 2;

    

    // 6. Criar objetos das cartas
    window.gameState.cards = deck.map((img, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        return {
            id: i,
            imagePath: img,
            matchFlash: 0,
            x: startX + c * (cardW + spacing),
            y: startY + r * (cardH + spacing),
            width: cardW,
            height: cardH,
            isFlipped: false,
            isMatched: false,
            isFlipping: false,
            flipProgress: 0,
            flipDirection: 1,
            shakeTime: 0
        };
    });

    // 7. Mudar tela e atualizar clique
    window.gameState.screen = window.SCREENS.GAME;
    if (window.updateCanvasRect) window.updateCanvasRect(); // Garante que o clique siga as cartas
    window.render();
};
// Adicione isso no final de gamelogic.js (ou em uma função update chamada no gameLoop)
window.gameLogic.checkForWin = function() {
    // 1. Usa window.gameState (o global)
    // 2. Compara o total de cartas combinadas com o total de cartas no deck
    if (window.gameState.matchedCards.length === window.gameState.cards.length && !window.gameState.gameWon) {
        
        window.gameState.gameWon = true; 
        
        if (window.playSoundEffect) window.playSoundEffect(window.SOUND_EFFECTS.WIN);
        
        if (window.gameState.currentCountry !== 'classic') {
            if (window.unlockNextDifficulty) window.unlockNextDifficulty();
        }
        
        window.saveGameState();
        
        setTimeout(() => {
            window.gameState.screen = window.SCREENS.GAME_OVER;
            window.render();
        }, 500);
    }
};
// Inicializa o array global se não existir
window.gameParticles = [];

// 1. Criar a explosão de bolhas
window.createBubbleBurst = function(x, y, colorStr) {
    const particleCount = 15; 
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        window.gameParticles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 6 + 2,
            color: colorStr,
            alpha: 1.0,
            life: 1.0,
            isBubble: true // Marcador para usar a física de subir
        });
    }
};

// 2. Atualizar a posição e vida (Lógica de subir)
window.updateGameParticles = function(deltaTime) {
    for (let i = window.gameParticles.length - 1; i >= 0; i--) {
        const p = window.gameParticles[i];
        
        p.x += p.vx;
        p.y += p.vy;

        // Efeito de Bolha: Sobem suavemente
        if (p.isBubble) {
            p.vy -= 0.05; // Força de flutuação
            p.vx *= 0.98; // Resitência do ar lateral
        }

        p.life -= deltaTime;
        p.alpha = Math.max(0, p.life);

        // Remove partículas mortas
        if (p.life <= 0) {
            window.gameParticles.splice(i, 1);
        }
    }
};

// 3. Desenhar no Canvas
window.drawGameParticles = function(ctx) {
    ctx.save();
    window.gameParticles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        ctx.globalAlpha = p.alpha;
        
        // Suporte para HEX ou RGB
        if (p.color.startsWith('#')) {
            ctx.fillStyle = p.color;
        } else {
            ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        }
        
        ctx.fill();

        // Brilho externo branco suave
        ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
    });
    ctx.restore();
};