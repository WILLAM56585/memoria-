console.log('screenrenderers.js carregado');
let particulasClique = [];

window.getModeSelectLayout = function() {
    const centerX = canvas.width / 2;
    const padding = getResponsiveSize(30);
    const btnWidth = canvas.width * 0.8; 
    const btnHeight = getResponsiveSize(80);
    const spacing = getResponsiveSize(35);
    const startY = canvas.height * 0.40; 

    // 1. Definição dos botões de modo
    const historia = { x: centerX - btnWidth/2, y: startY, w: btnWidth, h: btnHeight };
    const classico = { x: centerX - btnWidth/2, y: startY + btnHeight + spacing, w: btnWidth, h: btnHeight };

    // 2. NOVO LAYOUT para o botão Voltar (Maior, mais acima e mais clicável)
    const backBtnWidth = getResponsiveSize(250);   // LARGURA MAIOR
    const backBtnHeight = getResponsiveSize(70);   // ALTURA MAIOR
    
    // Posição: 35px responsivos abaixo do botão 'Clássico'
    const backBtnY = classico.y + classico.h + getResponsiveSize(35); 
    
    // Garantir que não ultrapasse a tela
    const safeBackBtnY = Math.min(backBtnY, canvas.height - backBtnHeight - padding);

    return {
        historia: historia,
        classico: classico,
        voltar: { x: centerX - backBtnWidth/2, y: safeBackBtnY, w: backBtnWidth, h: backBtnHeight }
    };
};

const COUNTRY_COLORS = {
  england: { main: "#c80815", secondary: "#003366" }, // Vermelho e Azul
  espanha: { main: "#ffc400", secondary: "#e03a3e" }, // Amarelo e Vermelho
  brasil: { main: "#009c3b", secondary: "#ffdf00" }   // Verde e Amarelo
};

// Informações adicionais sobre cada país
const COUNTRY_INFO = {
  england: "Explore a cultura britânica com cartas temáticas de Londres!",
  espanha: "Viva a paixão espanhola com imagens vibrantes!",
  brasil: "Descubra o ritmo e as cores do Brasil!"
};

function drawModeSelectScreen() {
    // 1. Fundo e Partículas
    if(window.drawMenuBackground) window.drawMenuBackground(); 
    if(window.updateParticulas) window.updateParticulas();
    if(window.drawParticulas) window.drawParticulas();
    window.drawCoinsCounter();

    const layout = window.getModeSelectLayout();
    
    // 2. Título da Tela
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const titleSize = getResponsiveSize(36);
    ctx.font = `bold ${titleSize}px 'Bungee'`;
    ctx.fillStyle = '#FFF';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 10;
    ctx.fillText("MODO DE JOGO", canvas.width / 2, canvas.height * 0.15);
    
    ctx.shadowBlur = 0;
    const subTitleSize = getResponsiveSize(18);
    ctx.font = `${subTitleSize}px Arial`;
    ctx.fillStyle = '#BBDEFB';
    ctx.fillText("Escolha seu estilo e desafie sua memória!", canvas.width / 2, canvas.height * 0.25);

    // 3. Botão HISTÓRIA
    drawButton(
        layout.historia.x, layout.historia.y, layout.historia.w, layout.historia.h, 
        "🎮 História", 
        'mode_historia', 
        true, 
        getResponsiveSize(24), 
        ['#FF416C', '#FF4B2B'], 
        16, 
        'Bungee', 
        'white', 2
    );

    // 4. Botão CLÁSSICO
    drawButton(
        layout.classico.x, layout.classico.y, layout.classico.w, layout.classico.h, 
        "🧩 Clássico", 
        'mode_classico', 
        true, 
        getResponsiveSize(24), 
        ['#00C6FF', '#0072FF'], 
        16, 
        'Bungee', 
        'white', 2
    );

    // 5. BOTÃO VOLTAR (IDÊNTICO À SEÇÃO DE PAÍSES)
    const backButtonWidth = window.getResponsiveSize(150);
    const backButtonHeight = window.getResponsiveSize(50);
    const backButtonX = (canvas.width - backButtonWidth) / 2;
    // Posição fixa a 60px do fundo, igual na tela de países
    const backButtonY = canvas.height - backButtonHeight - window.getResponsiveSize(60);
    
    window.drawButton(
        backButtonX, backButtonY, backButtonWidth, backButtonHeight,
        "VOLTAR", 
        'backFromModeSelect', 
        true, 
        window.getResponsiveSize(18),
        ['#555', '#333'], // Cinza escuro idêntico
        10, 
        'Bungee', 
        'white', 
        1 // Borda fina idêntica
    );
}

// --- NOVO: Adicione isto aqui ---
const COUNTRY_EMOJIS = {
  england: "🇬🇧",
  espanha: "🇪🇸",
  brasil: "🇧🇷"
};

function drawCoinsCounter() {
    const coinEmoji = '💰';
    const coinsText = window.gameState.playerCoins;

    const fontSize = getResponsiveSize(30);
    const padding = getResponsiveSize(10);
    const textY = padding + fontSize;
    const textX = padding;

    ctx.fillStyle = 'white';
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${coinEmoji} ${coinsText}`, textX, textY);
}

let particulas = [];
for (let i = 0; i < 80; i++) {
  particulas.push({
    x: Math.random() * 400, // Coordenadas de referência
    y: Math.random() * 600,
    r: Math.random() * 2 + 1,
    alpha: Math.random(),
    vel: Math.random() * 0.02 + 0.005,
    dir: Math.random() > 0.5 ? 1 : -1
  });
}

function drawGradientBackground() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#141E30");
  grad.addColorStop(1, "#243B55");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateParticulas() {
  const referenceWidth = 400; // Base de cálculo para responsividade
  const referenceHeight = 600;

  particulas.forEach(p => {
    // 1. Atualizar posição horizontal
    p.x += (p.vel * getResponsiveSize(1)); 
    
    // 2. Envolvimento horizontal (wrap)
    const scaledX = p.x * (canvas.width / referenceWidth);
    const scaledR = p.r * (canvas.width / referenceWidth);

    if (scaledX > canvas.width + scaledR) {
        p.x = -scaledR * (referenceWidth / canvas.width);
    } else if (scaledX < -scaledR) {
        p.x = (referenceWidth / canvas.width) + scaledR * (referenceWidth / canvas.width);
    }

    // 3. Oscilação da opacidade para o efeito de "respiração"
    p.alpha = Math.sin(Date.now() * p.vel * 50) * 0.3 + 0.5;
  });
}

// A função drawCountrySelectScreen deve estar em screenrenderers.js

function drawParticulas() {
    const referenceWidth = 400;
    const referenceHeight = 600;

    particulas.forEach(p => {
        // Partículas brancas e translúcidas (para não interferir com o texto)
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`; 
        
        // Escala a posição e o raio
        const drawX = p.x * (canvas.width / referenceWidth);
        const drawY = p.y * (canvas.height / referenceHeight);
        const drawR = p.r * (canvas.width / referenceWidth);

        ctx.beginPath();
        ctx.arc(drawX, drawY, drawR, 0, Math.PI * 2, false);
        ctx.fill();
    });
}

function drawMenuBackground() {
    // Gradiente de azul escuro a roxo suave
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#1F2849"); // Azul mais escuro
    grad.addColorStop(1, "#323B6F"); // Roxo escuro suave
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.clearMemory = function() {
    // Remove referências para que o Garbage Collector do Android atue
    window.gameState.cards = [];
    window.gameState.currentLevelImages = []; 
    // Se usares um objeto global para guardar as imagens carregadas:
    window.loadedImagesCache = {}; 
};

function drawMenuScreen() {
 // 1. Elementos de Fundo
  drawMenuBackground(); 
  updateParticulas();
  drawParticulas();
  drawCoinsCounter(); 

  const layout = window.getMenuLayout();

  // 2. TÍTULO (Logotipo) - Mantido o estilo premium
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 8;
  
  const titleSize = getResponsiveSize(55);
  const titleY = canvas.height * 0.25;

  ctx.font = `900 ${titleSize}px 'Bungee'`;
  const textGrad = ctx.createLinearGradient(0, titleY - 40, 0, titleY + 40);
  textGrad.addColorStop(0, "#FFF");
  textGrad.addColorStop(0.3, "#FFD700"); 
  textGrad.addColorStop(1, "#FF8C00");
  ctx.fillStyle = textGrad;
  
  ctx.fillText("MEMORY", canvas.width / 2, titleY - (titleSize * 0.6));
  ctx.fillText("WORLD", canvas.width / 2, titleY + (titleSize * 0.4));
  ctx.restore();

  // 3. BOTÃO CLÁSSICO (Ocupa o lugar de destaque do antigo "Jogar")
  // Adicionamos a lógica de Nível no texto para gerar competição
  let pulse = 0;
  if (!window.gameState.isClickLocked) {
      pulse = Math.sin(Date.now() / 400) * 3; 
  }

  const nivelTexto = `CLÁSSICO - NÍVEL ${window.gameState.classicLevel || 1}`;

  drawButton(
      layout.play.x - pulse, 
      layout.play.y - pulse, 
      layout.play.w + (pulse*2), 
      layout.play.h + (pulse*2), 
      "CLÁSSICO", // Nome do modo
      'classicMode', 
      true, 
      35, 
      ['#FFD700', '#FF8C00'], // Gradiente Dourado (Destaque Principal)
      25, 
      'Bungee',
      'rgba(0,0,0,0.3)', 1.5 // Borda escura e fina
  );

  // 4. BOTÕES SECUNDÁRIOS
  
  // PODERES (Roxo) - Mantido para economia do jogo
  drawButton(
      layout.abilities.x, layout.abilities.y, layout.abilities.w, layout.abilities.h, 
      "PODERES", 
      'abilities', 
      true, 
      18, 
      ['#AB47BC', '#7B1FA2'], 
      15, 
      'Bungee',
      'rgba(0,0,0,0.3)', 1
  );

  // MODO HISTÓRIA (Azul/Ciano) - No lugar do antigo Ranking
  drawButton(
      layout.ranking.x, layout.ranking.y, layout.ranking.w, layout.ranking.h, 
      "HISTÓRIA", 
      'storyMode', 
      true, 
      18, 
      ['#00E5FF', '#2979FF'], // Cor que remete a jornada/aventura
      15, 
      'Bungee',
      'rgba(0,0,0,0.3)', 1
  );

  // 5. CONFIGURAÇÕES
  drawButton(
      layout.settings.x, layout.settings.y, layout.settings.w, layout.settings.h, 
      "⚙", 
      'settings', 
      true, 
      30, 
      ['#546E7A', '#37474F'], 
      12, 
      'Arial',
      'rgba(255,255,255,0.3)', 1
  );
}

window.getMenuLayout = function() {
    const centerX = canvas.width / 2;
    
    // 1. Botão JOGAR (Gigante e Central)
    const playWidth = getResponsiveSize(280);
    const playHeight = getResponsiveSize(90);
    const playY = canvas.height * 0.55; // Um pouco abaixo do meio

    // 2. Botões Secundários (Lado a Lado abaixo do Jogar)
    const secBtnWidth = getResponsiveSize(135);
    const secBtnHeight = getResponsiveSize(70);
    const secBtnY = playY + playHeight + getResponsiveSize(25);
    const gap = getResponsiveSize(10); // Espaço entre eles

    // 3. Botão de Configurações (Ícone no canto superior direito)
    const settingsSize = getResponsiveSize(50);
    const settingsX = canvas.width - settingsSize - getResponsiveSize(20);
    const settingsY = getResponsiveSize(20);

    return {
        play: { 
            x: centerX - playWidth / 2, 
            y: playY, 
            w: playWidth, 
            h: playHeight 
        },
        abilities: { 
            x: centerX - secBtnWidth - (gap/2), // Fica à esquerda
            y: secBtnY, 
            w: secBtnWidth, 
            h: secBtnHeight 
        },
        ranking: { 
            x: centerX + (gap/2), // Fica à direita
            y: secBtnY, 
            w: secBtnWidth, 
            h: secBtnHeight 
        },
        settings: {
            x: settingsX,
            y: settingsY,
            w: settingsSize,
            h: settingsSize
        }
    };
};

function getCountryButtonDimensions() {
  const countryKeys = Object.keys(window.playersData || {});
  const buttonHeight = getResponsiveSize(80);
  const buttonSpacing = getResponsiveSize(20);
  const startY = (canvas.height - (countryKeys.length * buttonHeight + (countryKeys.length - 1) * buttonSpacing)) / 2;
  const quadWidth = getResponsiveSize(70);
  const rectWidth = getResponsiveSize(250);
  const totalButtonWidth = quadWidth + getResponsiveSize(20) + rectWidth;
  return { countryKeys, buttonHeight, buttonSpacing, startY, quadWidth, rectWidth, totalButtonWidth };
}

// screenrenderers.js

// 1. Layout Ajustado (Função getCountryCardLayout)
// Renomeada corretamente (getCountryCardLayout) e movida para cima.
// 1. Layout Ajustado (Função getCountryCardLayout)
// Renomeada corretamente (getCountryCardLayout) e movida para cima.
window.getCountryCardLayout = function() {
    if (!window.playersData) return [];
    
    // Lista fixa e explícita dos países reais (exclui 'classic' para sempre)
    const countryKeys = ['england', 'espanha', 'brasil']; // adicione novos aqui no futuro
    
    const numCountries = countryKeys.length;

    // --- CONFIGURAÇÃO DE TAMANHO FIXO (ALINHAMENTO) ---
    const cardWidth = canvas.width * 0.8; 
    const cardHeight = window.getResponsiveSize(110); 
    const spacing = window.getResponsiveSize(20);

    // Cálculo para centralizar o bloco inteiro na tela
    const totalHeight = (numCountries * cardHeight) + ((numCountries - 1) * spacing);
    let startY = (canvas.height - totalHeight) / 2.2; 

    // Retorna apenas os cartões dos países reais
    return countryKeys.map((countryKey, index) => {
        return {
            key: countryKey,
            x: (canvas.width - cardWidth) / 2,
            y: startY + (index * (cardHeight + spacing)),
            width: cardWidth,
            height: cardHeight
        };
    });
};

// 2. Função de Desenho de Cartão (Com Animação e Cadeado)
window.drawCountryCard = function(country, layout) {
    if (!window.playersData) return;
    const data = window.playersData[country];
    if (!data) return;

    const { x: cardX, y: cardY, width: cardW, height: cardH } = layout;
    
    // --- 0. AJUSTES DINÂMICOS PARA O TAMANHO DO CARD ---
    // Em telemóveis pequenos, o cardW pode ser muito estreito. 
    // Vamos basear os tamanhos internos na largura do CARD (cardW), não da TELA.
    const internalPadding = cardW * 0.08; // 8% de margem interna
    const flagSize = Math.min(cardH * 0.7, cardW * 0.25); // Bandeira nunca maior que 25% da largura
    const fontSize = Math.min(window.getResponsiveSize(22), cardH * 0.4);

    const countryName = (data.name || country).toUpperCase();
    const countryColor = data.themeColor || '#555555'; 
    const containerId = 'container_' + country;
    const animState = window.gameState?.containerJumpStates?.[containerId] || { jumpProgress: 0 };
    
    // Lógica de Hover e Escala
    let scale = 1.0;
    if (animState.isJumping) {
        scale = 1.0 - (Math.sin(animState.jumpProgress * Math.PI) * 0.05);
    } else if (typeof isHovering === 'function' && isHovering(cardX, cardY, cardW, cardH)) {
        scale = 1.03;
    }

    ctx.save();
    
    // Centraliza a escala no meio do card
    const cx = cardX + cardW / 2;
    const cy = cardY + cardH / 2;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);
    
    // --- 1. FUNDO DO CARD ---
    ctx.beginPath();
    window.roundRect(ctx, cardX, cardY, cardW, cardH, 12, false, false); 
    ctx.clip(); 

    const bgGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    bgGrad.addColorStop(0, "#222"); 
    bgGrad.addColorStop(1, countryColor);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(cardX, cardY, cardW, cardH);

    // Bordas (Mais finas em cards pequenos)
    ctx.lineWidth = cardW < 200 ? 2 : 4;
    ctx.strokeStyle = countryColor;
    ctx.stroke();

    // --- 2. BANDEIRA (Posicionada proporcionalmente) ---
    const flagImage = window.loadedImages ? window.loadedImages[data.flag] : null;
    const flagX = cardX + internalPadding;
    const flagY = cardY + (cardH - flagSize) / 2;

    if (flagImage && flagImage.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(flagX + flagSize/2, flagY + flagSize/2, flagSize/2, 0, Math.PI*2);
        ctx.clip();
        ctx.drawImage(flagImage, flagX, flagY, flagSize, flagSize);
        ctx.restore();
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    // --- 3. TEXTO (Ajustado para o espaço restante) ---
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${fontSize}px 'Bungee'`;
    
    // O texto começa após a bandeira com um pequeno espaço
    const textX = flagX + flagSize + internalPadding;
    const textY = cardY + cardH / 2;

    // Se o texto for muito grande para o card, diminui a fonte na hora
    let currentFontSize = fontSize;
    while (ctx.measureText(countryName).width > (cardX + cardW - textX - internalPadding) && currentFontSize > 10) {
        currentFontSize -= 1;
        ctx.font = `bold ${currentFontSize}px 'Bungee'`;
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillText(countryName, textX + 1, textY + 1);
    ctx.fillStyle = "white";
    ctx.fillText(countryName, textX, textY);
    
    // --- 4. CADEADO (Bloqueio) ---
    const isLocked = window.gameState.unlockedCountries && !window.gameState.unlockedCountries.includes(country);
    if (isLocked) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(cardX, cardY, cardW, cardH);
        
        ctx.textAlign = 'center';
        ctx.font = `${flagSize}px Arial`;
        ctx.fillStyle = 'white';
        ctx.fillText("🔒", cx, cy + flagSize/4);
    }
    
    ctx.restore();
};

// 3. Renderização da Tela (Corrigido o escopo e Adicionado o Botão Voltar)
// Localização: js/screenrenderers.js

function drawCountrySelectScreen() {
    // 1. Fundo e Partículas
    if (window.drawMenuBackground) window.drawMenuBackground();
    else {
        ctx.fillStyle = '#1F2849';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (window.updateParticulas) window.updateParticulas();
    if (window.drawParticulas) window.drawParticulas();
    if (window.drawCoinsCounter) window.drawCoinsCounter();

    if (!window.playersData || !window.getCountryCardLayout) return;

    const layout = window.getCountryCardLayout();
    const centerX = canvas.width / 2;

    // --- LÓGICA DE ANIMAÇÃO DE ENTRADA ---
    if (!window.gameState.containerJumpStates) window.gameState.containerJumpStates = {};
    
    // Inicializa ou atualiza a animação global da tela
    if (!window.gameState.containerJumpStates['countries_screen']) {
        window.gameState.containerJumpStates['countries_screen'] = { slideProgress: 0 };
    }
    
    let screenAnim = window.gameState.containerJumpStates['countries_screen'];
    if (screenAnim.slideProgress < 1) {
        screenAnim.slideProgress += 0.04; // Velocidade da entrada
        if (screenAnim.slideProgress > 1) screenAnim.slideProgress = 1;
    }

    // 2. Título (Slide de cima para baixo)
    ctx.save();
    const titleAlpha = screenAnim.slideProgress;
    const titleSlideY = (1 - screenAnim.slideProgress) * -50; // Começa 50px acima
    ctx.globalAlpha = titleAlpha;
    ctx.translate(0, titleSlideY);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const titleSize = window.getResponsiveSize(36);
    const titleY = window.getResponsiveSize(30);
    ctx.font = `bold ${titleSize}px 'Bungee'`;
    
    const textGrad = ctx.createLinearGradient(0, titleY, 0, titleY + titleSize);
    textGrad.addColorStop(0, "#FFD700");
    textGrad.addColorStop(1, "#FF8C00");
    ctx.fillStyle = textGrad;
    

    ctx.font = `${window.getResponsiveSize(14)}px 'Press Start 2P'`;
    ctx.fillStyle = '#E0E0E0';
    const subtitleY = titleY + titleSize + window.getResponsiveSize(10);
    ctx.fillText("ESCOLHA:", centerX, subtitleY);
    ctx.restore();

    // 3. Renderiza os Cartões de Países (Slide Lateral com Delay)
    layout.forEach((item, index) => {
        const elevatedY = item.cardY - (canvas.height * 0.07);
        
        // --- Cálculo do Slide individual ---
        // O delay faz com que o segundo país só comece a mover quando o primeiro já andou um pouco
        const individualDelay = index * 0.12; 
        const rawProgress = Math.max(0, screenAnim.slideProgress - individualDelay);
        // Aplica Easing (suavização)
        const easeOut = 1 - Math.pow(1 - Math.min(rawProgress / 0.8, 1), 3);
        
        const offsetX = (1 - easeOut) * canvas.width; // Vem da direita para a esquerda

        // Animação de pulo (hover/click)
        const buttonId = `country_${item.key}`;
        const jumpAnim = window.gameState.buttonJumpStates[buttonId] || { jumpProgress: 0 };
        const jumpFactor = jumpAnim.jumpProgress < 0.5 ? jumpAnim.jumpProgress : (1 - jumpAnim.jumpProgress);
        const scale = 1 + (jumpFactor * 0.15);

        ctx.save();
        ctx.translate(offsetX, 0); // Aplica o slide lateral
        
        // Aplica escala no centro do card
        ctx.translate(item.cardX + item.cardW / 2, elevatedY + item.cardH / 2);
        ctx.scale(scale, scale);
        
        // Desenha o card (resetando a translação para o drawCountryCard usar coordenadas originais)
        ctx.translate(-(item.cardX + item.cardW / 2), -(elevatedY + item.cardH / 2));

        window.drawCountryCard(item.key, {
            ...item,
            cardY: elevatedY
        });

        ctx.restore();
    });

    // 4. BOTÃO VOLTAR (Slide de baixo para cima)
    const backBtnAnim = 1 - Math.pow(1 - screenAnim.slideProgress, 2);
    const backOffsetY = (1 - backBtnAnim) * 100;

    const backButtonWidth = window.getResponsiveSize(150);
    const backButtonHeight = window.getResponsiveSize(50);
    const backButtonX = (canvas.width - backButtonWidth) / 2;
    const backButtonY = canvas.height - backButtonHeight - window.getResponsiveSize(60);
    
    ctx.save();
    ctx.globalAlpha = screenAnim.slideProgress;
    ctx.translate(0, backOffsetY);
    window.drawButton(
        backButtonX, backButtonY, backButtonWidth, backButtonHeight,
        "VOLTAR", 'backFromCountrySelect', true, window.getResponsiveSize(18),
        ['#555', '#333'], 10, 'Bungee', 'white', 1
    );
    ctx.restore();
}
// EXPORTAÇÃO GLOBAL (Garante que o 'render' possa chamar a função)
window.drawCountrySelectScreen = drawCountrySelectScreen;

// Localização: js/screenrenderers.js

window.drawDifficultySelectScreen = function() {
    if (window.drawMenuBackground) window.drawMenuBackground();
    if (window.updateParticulas) window.updateParticulas();
    if (window.drawParticulas) window.drawParticulas();

    // Adiciona o contador de moedas (chamada igual às seções anteriores)
    if (window.drawCoinsCounter) window.drawCoinsCounter();

    const centerX = canvas.width / 2;
    
    // --- LÓGICA DE ANIMAÇÃO DE ENTRADA (IGUAL À DOS PAÍSES) ---
    if (!window.gameState.containerJumpStates) window.gameState.containerJumpStates = {};
    
    // Inicializa ou atualiza a animação global da tela
    const screenAnimKey = 'difficulty_screen';
    if (!window.gameState.containerJumpStates[screenAnimKey]) {
        window.gameState.containerJumpStates[screenAnimKey] = { slideProgress: 0 };
    }
    
    let screenAnim = window.gameState.containerJumpStates[screenAnimKey];
    if (screenAnim.slideProgress < 1) {
        screenAnim.slideProgress += 0.04; // Velocidade da entrada (igual países)
        if (screenAnim.slideProgress > 1) screenAnim.slideProgress = 1;
    }

    // --- PADRONIZAÇÃO (IGUAL AOS PAÍSES) ---
    const btnWidth = canvas.width * 0.8; // Mesmo 0.8 usado na tela de países
    const btnHeight = window.getResponsiveSize(90); 
const spacing = window.getResponsiveSize(25);    // Mesmo espaçamento
    
    const difficulties = ['easy', 'medium', 'hard'];
    const numOptions = difficulties.length;

    // Cálculo para centralizar verticalmente o grupo de botões
    const totalHeight = (numOptions * btnHeight) + ((numOptions - 1) * spacing);
    let currentY = (canvas.height - totalHeight) / 2.2; 
    const titleY = currentY - window.getResponsiveSize(60);

    const btnLayouts = {};
    difficulties.forEach((diff) => {
        btnLayouts[diff] = {
            btnX: centerX - btnWidth / 2,
            btnY: currentY,
            btnW: btnWidth,
            btnH: btnHeight
        };
        currentY += btnHeight + spacing;
    });

    // Botão Voltar
    const backBtnWidth = window.getResponsiveSize(150);   
    const backBtnHeight = window.getResponsiveSize(50);   
    const backBtnX = centerX - backBtnWidth / 2;
    const backBtnY = canvas.height - backBtnHeight - window.getResponsiveSize(60); // POSIÇÃO FIXA: 60px do fundo, igual anterior

    window.currentDifficultyLayout = {
        btnLayouts: btnLayouts,
        voltar: { x: backBtnX, y: backBtnY, w: backBtnWidth, h: backBtnHeight }
    };
    
    const layout = window.currentDifficultyLayout;

    // 2. TÍTULO (Slide de cima para baixo, igual países)
    ctx.save();
    const titleAlpha = screenAnim.slideProgress;
    const titleSlideY = (1 - screenAnim.slideProgress) * -50; // Começa 50px acima (igual países)
    ctx.globalAlpha = titleAlpha;
    ctx.translate(0, titleSlideY);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `bold ${getResponsiveSize(28)}px 'Bungee'`; // Tamanho reduzido de 35 para 28
    ctx.fillStyle = '#FFF';
    ctx.fillText("DIFICULDADE", centerX, titleY);

    ctx.restore();

    // 3. RENDERIZA OS BOTÕES DE DIFICULDADES (Slide Lateral com Delay, igual cards de países)
    difficulties.forEach((diff, index) => {
        const isUnlocked = window.gameState.unlockedDifficulties[window.gameState.currentCountry]?.includes(diff) || diff === 'easy';
        const colors = {
            easy: ["#4CAF50", "#2E7D32"],
            medium: ["#FFC107", "#FFA000"],
            hard: ["#F44336", "#D32F2F"]
        }[diff];

        const { btnX, btnY, btnW, btnH } = layout.btnLayouts[diff];
        
        // --- Cálculo do Slide individual (igual cards) ---
        const individualDelay = index * 0.12; 
        const rawProgress = Math.max(0, screenAnim.slideProgress - individualDelay);
        const easeOut = 1 - Math.pow(1 - Math.min(rawProgress / 0.8, 1), 3);
        
        const offsetX = (1 - easeOut) * canvas.width; // Vem da direita para a esquerda (igual países, mas invertido se quiser da esquerda)

        // Animação de pulo (hover/click)
        const buttonId = `difficulty_${diff}`;
        const jumpAnim = window.gameState.buttonJumpStates[buttonId] || { jumpProgress: 0 };
        const jumpFactor = jumpAnim.jumpProgress < 0.5 ? jumpAnim.jumpProgress : (1 - jumpAnim.jumpProgress);
        const scale = 1 + (jumpFactor * 0.15);

        ctx.save();
        ctx.translate(offsetX, 0); // Aplica o slide lateral
        
        // Aplica escala no centro do botão
        ctx.translate(btnX + btnW / 2, btnY + btnH / 2);
        ctx.scale(scale, scale);
        ctx.translate(-(btnX + btnW / 2), -(btnY + btnH / 2));

        // 1. Desenha o botão base
        window.drawButton(btnX, btnY, btnW, btnH, "", `difficulty_${diff}`, isUnlocked, getResponsiveSize(18), colors, 12, 'Bungee');

        // 2. TEXTO CENTRALIZADO
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle'; 
        ctx.fillStyle = 'white';
        
        const label = { easy: "😊 FÁCIL", medium: "😎 MÉDIO", hard: "💀 DIFÍCIL" }[diff];
        ctx.font = `bold ${getResponsiveSize(24)}px 'Bungee'`;
        ctx.fillText(label, btnX + btnW / 2, btnY + btnH / 2);

        // Cadeado se bloqueado
        if (!isUnlocked) {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            window.roundRect(ctx, btnX, btnY, btnW, btnH, 12, true, false);
            ctx.fillStyle = 'white';
            ctx.font = `${getResponsiveSize(30)}px Arial`;
            ctx.fillText("🔒", btnX + btnW / 2, btnY + btnH / 2);
        }

        ctx.restore();
    });

    // Reset do baseline
    ctx.textBaseline = 'alphabetic';

    // 4. BOTÃO VOLTAR (Slide de baixo para cima, igual países)
    const backBtnAnim = 1 - Math.pow(1 - screenAnim.slideProgress, 2);
    const backOffsetY = (1 - backBtnAnim) * 100;

    ctx.save();
    ctx.globalAlpha = screenAnim.slideProgress;
    ctx.translate(0, backOffsetY);
    window.drawButton(
        backBtnX, backBtnY, backBtnWidth, backBtnHeight,
        "VOLTAR", 'backFromDifficulty', true, window.getResponsiveSize(18),
        ['#555', '#333'], 10, 'Bungee', 'white', 1
    );
    ctx.restore();
};

window.drawGameScreen = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 0. CONFIGURAÇÕES INICIAIS
    const isSmall = canvas.height < 600;
    const country = gameState.currentCountry;

    // 1. FUNDO COM GRADIENTE (Mantido sua lógica)
    let bgColor1 = '#2c3e50', bgColor2 = '#1a252f';
    if (country === 'brazil') { bgColor1 = '#006733'; bgColor2 = '#003d1e'; }
    if (country === 'england') { bgColor1 = '#00247D'; bgColor2 = '#00154a'; }
    if (country === 'spain') { bgColor1 = '#AA151B'; bgColor2 = '#6e0d11'; }

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, bgColor1);
    gradient.addColorStop(1, bgColor2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (window.drawParticulas) { window.updateParticulas(); window.drawParticulas(); }

    // Dentro do case SCREENS.GAME:
if (window.gameState.currentCountry === 'classic') {
    // === PONTUAÇÃO CENTRALIZADA NO TOPO ===
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `bold ${window.getResponsiveSize(32)}px 'Bungee'`;
    ctx.fillStyle = '#FFD700'; // Dourado brilhante
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 8;
    ctx.fillText(`PONTUAÇÃO: ${window.gameState.classicScore}`, canvas.width / 2, window.getResponsiveSize(15));
    ctx.shadowBlur = 0;

    // Texto menor opcional de recorde
    ctx.font = `bold ${window.getResponsiveSize(18)}px Arial`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`RECORDE: ${window.gameState.classicBestScore}`, canvas.width / 2, window.getResponsiveSize(55));

    // === PODIO DE RODADAS (LADO DIREITO, ABAIXO) ===
    const podioX = canvas.width - window.getResponsiveSize(160);
    const podioY = window.getResponsiveSize(20);
    const podioW = window.getResponsiveSize(140);
    const podioH = window.getResponsiveSize(70);

    // Fundo do pódio (gradiente ouro)
    const grad = ctx.createLinearGradient(podioX, podioY, podioX, podioY + podioH);
    grad.addColorStop(0, '#FFEB3B');
    grad.addColorStop(1, '#FFC107');
    ctx.fillStyle = grad;
    window.roundRect(ctx, podioX, podioY, podioW, podioH, 15, true, false);

    // Borda dourada
    ctx.strokeStyle = '#FFA000';
    ctx.lineWidth = 4;
    window.roundRect(ctx, podioX, podioY, podioW, podioH, 15, false, true);

    // Texto da rodada
    ctx.fillStyle = '#1B5E20';
    ctx.font = `bold ${window.getResponsiveSize(22)}px 'Bungee'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`RODADA`, podioX + podioW / 2, podioY + podioH / 2 - window.getResponsiveSize(10));
    ctx.font = `bold ${window.getResponsiveSize(28)}px 'Bungee'`;
    ctx.fillText(`${window.gameState.classicRounds}`, podioX + podioW / 2, podioY + podioH / 2 + window.getResponsiveSize(12));
}

    // 2. DESENHO DAS CARTAS
    const backImage = loadedImages[window.playersData[country]?.backImage] || loadedImages[FALLBACK_IMAGE_PATH];

    gameState.cards.forEach(card => {
        let imageToDraw = (card.isFlipped || card.matched) ? loadedImages[card.imagePath] : backImage;
        let drawW = card.width;
        let drawX = card.x;

        // Lógica de animação de virada
        if (card.isFlipping) {
    // Progresso de 0 → 1 durante a virada
    const progress = card.flipProgress;           // 0 = começa de costas, 1 = terminou de virar
    const scale = Math.abs(Math.cos(progress * Math.PI));  // 1 → 0 → 1

    drawW = card.width * scale;
    drawX = card.x + (card.width - drawW) / 2;

    // Mostra a face correta de acordo com a direção e o momento da virada
    if (card.flipDirection === 1) {
        // Virando de costas → frente
        imageToDraw = progress < 0.5 ? backImage : loadedImages[card.imagePath];
    } else {
        // Virando de frente → costas
        imageToDraw = progress < 0.5 ? loadedImages[card.imagePath] : backImage;
    }
}

        // Desenha a imagem base da carta
        if (imageToDraw?.complete) {
            ctx.drawImage(imageToDraw, drawX, card.y, drawW, card.height);
        }

        // --- NOVO: EFEITO DE FLASH VERDE (ACERTO) ---
        if (card.matchFlash > 0) {
            ctx.save();
            ctx.globalAlpha = card.matchFlash;
            ctx.fillStyle = '#2ecc71'; // Verde Esmeralda
            // Usamos drawX e drawW para o verde acompanhar a carta se ela estiver virando
            if (window.roundRect) {
                window.roundRect(ctx, drawX, card.y, drawW, card.height, 10, true, false);
            } else {
                ctx.fillRect(drawX, card.y, drawW, card.height);
            }
            ctx.restore();
            card.matchFlash -= 0.02; // Reduz o brilho gradualmente
        }

        // --- FEEDBACK DE ERRO (SHAKE) ---
        if (card.shakeTime > 0) {
            ctx.save();
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)"; // Vermelho levemente mais forte
            ctx.fillRect(drawX, card.y, drawW, card.height);
            ctx.strokeStyle = '#FF1744';
            ctx.lineWidth = 2;
            ctx.strokeRect(drawX, card.y, drawW, card.height);
            ctx.restore();
        } else {
            // Borda de carta combinada (Verde fixa) ou padrão
            ctx.strokeStyle = card.matched ? '#4CAF50' : 'rgba(255,255,255,0.5)';
            ctx.lineWidth = card.matched ? 2 : 1;
            ctx.strokeRect(drawX, card.y, drawW, card.height);
        }
    });

    // 3. UI: TIMER (Centralizado)
    const currentTime = Math.max(0, Math.floor(gameState.timer));
    const capW = getResponsiveSize(isSmall ? 100 : 130);
    const capH = getResponsiveSize(isSmall ? 35 : 45);
    const capX = (canvas.width - capW) / 2;
    const capY = isSmall ? 10 : 20;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    window.roundRect(ctx, capX, capY, capW, capH, 20, true, false);
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${getResponsiveSize(isSmall ? 18 : 24)}px sans-serif`; 
    ctx.fillStyle = currentTime <= 5 && (Date.now() % 500 < 250) ? '#FF1744' : '#FFF';
    ctx.fillText(`⏱️ ${currentTime}s`, capX + capW/2, capY + capH/2 + 2);

    // 4. UI: BOTÕES DE CONTROLO
    const btnSize = getResponsiveSize(isSmall ? 45 : 55);
    const sideMargin = getResponsiveSize(15);
    const bottomPos = canvas.height - btnSize - sideMargin;

    window.drawButton(sideMargin, bottomPos, btnSize, btnSize, "II", 'toggleMenu', true, 18, ['#555', '#333'], 10);

    if (window.gameState.abilityLevels.peek > 0) {
        const isReady = window.gameState.peekCooldown <= 0;
        window.drawButton(canvas.width - btnSize - sideMargin, bottomPos, btnSize, btnSize, 
            isReady ? "👁️" : "⏳", 'use_peek', isReady, 20, 
            isReady ? ['#00E5FF', '#2979FF'] : ['#444', '#222'], 10);
    }
};

window.drawGameOverScreen = function() {
    // 1. FUNDO ESCURO (Fade In dinâmico)
    // Usa o gameState.gameOverFade que cresce no gameLoop para um efeito suave
    const currentFade = window.gameState.gameOverFade || 0.85;
    ctx.fillStyle = `rgba(0, 0, 0, ${currentFade})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const isVictory = gameState.matchedCards.length === gameState.cards.length;

    if (!isVictory) {
        // --- MOMENTO 1: TEXTO DE IMPACTO (Até os 4 segundos) ---
        // Se ainda não passou o tempo de espera, mostra apenas o aviso centralizado
        if (!window.gameState.showResultBlock) {
            ctx.save();
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle'; // Garante centralização vertical perfeita
            ctx.font = `${getResponsiveSize(50)}px 'Bungee'`;
            
            // Desenha exatamente no centro do ecrã
            ctx.fillText('TEMPO ESGOTADO!', canvas.width / 2, canvas.height / 2);
            ctx.restore();
            return; // Bloqueia o resto da função para não haver "bagunça"
        }

        // --- MOMENTO 2: PAINEL DE DERROTA ESTRUTURADO (Após 4 segundos) ---
        // Definimos o Painel (Card) Central
        const panelWidth = Math.min(canvas.width * 0.9, getResponsiveSize(380));
        const panelHeight = getResponsiveSize(440);
        const panelX = (canvas.width - panelWidth) / 2;
        const panelY = (canvas.height - panelHeight) / 2;

        // Desenho do Corpo do Painel
        ctx.save();
        ctx.fillStyle = 'rgba(25, 25, 35, 0.98)'; // Fundo sólido quase preto
        ctx.strokeStyle = '#FF3B30'; // Borda vermelha de derrota
        ctx.lineWidth = 5;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 20);
        } else {
            ctx.rect(panelX, panelY, panelWidth, panelHeight);
        }
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Alinhamento centralizado para o conteúdo interno
        ctx.textAlign = 'center';

        // 1. Título Interno (Dentro do card)
        ctx.fillStyle = '#FF3B30';
        ctx.font = `${getResponsiveSize(32)}px 'Bungee'`;
        ctx.fillText('TEMPO ESGOTADO!', canvas.width / 2, panelY + getResponsiveSize(60));

        // 2. Subtítulo: Incentivo ao Anúncio para Reviver
        ctx.fillStyle = '#FFAB91';
        ctx.font = `${getResponsiveSize(18)}px Arial`;
        ctx.fillText('Assiste a um vídeo para ganhar +30s', canvas.width / 2, panelY + getResponsiveSize(100));
        ctx.fillText('e continuar a jogar!', canvas.width / 2, panelY + getResponsiveSize(125));

        // 3. Área de Clique do Anúncio (Botão de Reviver)
        const adW = panelWidth * 0.85;
        const adH = getResponsiveSize(140);
        const adX = (canvas.width - adW) / 2;
        const adY = panelY + getResponsiveSize(160);

        ctx.save();
        ctx.fillStyle = '#1a1a2e'; // Fundo do botão de anúncio
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(adX, adY, adW, adH, 15);
        ctx.fill();
        ctx.restore();

        // Texto do Botão de Anúncio
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${getResponsiveSize(20)}px Arial`;
        ctx.fillText('CLIQUE PARA REVIVER 📺', canvas.width / 2, adY + adH / 2 + 7);

        // 4. Botão VOLTAR (Final do painel)
        const btnW = getResponsiveSize(200);
        const btnH = getResponsiveSize(55);
        const btnX = (canvas.width - btnW) / 2;
        const btnY = panelY + panelHeight - btnH - getResponsiveSize(30);

        // ID 'backFromGameOver' deve estar mapeado no teu input.js
        window.drawButton(
            btnX, btnY, btnW, btnH, 
            "VOLTAR", 
            "backFromGameOver", 
            true, 22, ['#444', '#222']
        );

    } else {
        // --- TELA DE VITÓRIA (Caso o jogador ganhe) ---
        // Aqui podes manter a lógica de vitória que já tinhas
        if (window.drawVictoryContent) window.drawVictoryContent();
    }
};

function drawPauseScreen() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = `${getResponsiveSize(60)}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('PAUSADO', canvas.width / 2, canvas.height * 0.3);
  const buttonWidth = getResponsiveSize(250);
  const buttonHeight = getResponsiveSize(60);
  const buttonX = (canvas.width - buttonWidth) / 2;
  const startY = canvas.height * 0.45;
  const buttonSpacing = getResponsiveSize(20);
  drawButton(buttonX, startY, buttonWidth, buttonHeight, 'Retomar', 'resume');
  drawButton(buttonX, startY + buttonHeight + buttonSpacing, buttonWidth, buttonHeight, 'Menu', 'menuFromPause');
  drawButton(buttonX, startY + 2 * (buttonHeight + buttonSpacing), buttonWidth, buttonHeight, 'CONFIG.', 'settingsFromPause');
}

function drawSettingsScreen() {
    drawMenuBackground();
    ctx.fillStyle = 'white';
    ctx.font = `${getResponsiveSize(40)}px Arial`;
    ctx.textAlign = 'center';
    let titleY = canvas.height * 0.2;
    if (canvas.height / canvas.width < 0.65) titleY = canvas.height * 0.15;
    ctx.fillText('CONFIG.', canvas.width / 2, titleY);

    const settingsButtonWidth = getResponsiveSize(250);
    const settingsButtonHeight = getResponsiveSize(60);
    const settingsButtonX = (canvas.width - settingsButtonWidth) / 2;
    let settingsStartY = canvas.height * 0.4;
    if (canvas.height / canvas.width < 0.65) settingsStartY = canvas.height * 0.35;
    const buttonSpacing = getResponsiveSize(20);
    let effectiveSettingsButtonSpacing = buttonSpacing;
    if (canvas.height / canvas.width < 0.65) effectiveSettingsButtonSpacing *= 0.7;

    drawButton(settingsButtonX, settingsStartY, settingsButtonWidth, settingsButtonHeight, `Música: ${gameState.musicEnabled ? 'Ligado' : 'Desligado'}`, 'toggleMusic');
    drawButton(settingsButtonX, settingsStartY + settingsButtonHeight + effectiveSettingsButtonSpacing, settingsButtonWidth, settingsButtonHeight, `Efeitos: ${gameState.sfxEnabled ? 'Ligado' : 'Desligado'}`, 'toggleSfx');

    const backButtonWidth = getResponsiveSize(150);
    const backButtonHeight = getResponsiveSize(50);
    const backButtonX = (canvas.width - backButtonWidth) / 2;
    const backButtonY = settingsStartY + 2 * (settingsButtonHeight + effectiveSettingsButtonSpacing) + getResponsiveSize(20);
    drawButton(backButtonX, backButtonY, backButtonWidth, backButtonHeight, 'Voltar', 'backFromSettings', true, 18);
}

function drawCreditsScreen() {
  drawMenuBackground();
  ctx.fillStyle = 'white';
  ctx.font = `${getResponsiveSize(40)}px Arial`;
  ctx.textAlign = 'center';
  let titleY = canvas.height * 0.2;
  if (canvas.height / canvas.width < 0.65) titleY = canvas.height * 0.15;
  ctx.fillText('Ranking', canvas.width / 2, titleY);
  ctx.font = `${getResponsiveSize(24)}px Arial`;
  let textStartY = canvas.height * 0.3;
  let textLineHeight = getResponsiveSize(30);
  if (canvas.height / canvas.width < 0.65) {
    textStartY = canvas.height * 0.25;
    textLineHeight *= 0.8;
  }
  const rankings = JSON.parse(localStorage.getItem('rankings')) || [];
  if (rankings.length === 0) {
    ctx.fillText('Nenhuma pontuação registrada.', canvas.width / 2, textStartY);
  } else {
    rankings.forEach((entry, index) => {
      const text = `${index + 1}. ${entry.country.charAt(0).toUpperCase() + entry.country.slice(1)} - ${entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1)}: ${entry.score} pts (${entry.moves} mov., ${entry.time}s) - ${entry.date}`;
      ctx.fillText(text, canvas.width / 2, textStartY + index * textLineHeight);
    });
  }
  const backButtonWidth = getResponsiveSize(150);
  const backButtonHeight = getResponsiveSize(50);
  const backButtonX = (canvas.width - backButtonWidth) / 2;
  const backButtonY = canvas.height - backButtonHeight - getResponsiveSize(20);
  drawButton(backButtonX, backButtonY, backButtonWidth, backButtonHeight, 'Voltar', 'backFromCredits', true, 18);
}

function criarParticulasCliqueBotao(x, y, largura, altura, cor = "#0ff") {
  for (let i = 0; i < 15; i++) {
    particulasClique.push({
      x: x + Math.random() * largura,
      y: y + Math.random() * altura,
      r: Math.random() * 4 + 2,
      dx: (Math.random() - 0.5) * 6,
      dy: (Math.random() - 0.5) * 6,
      alpha: 1,
      cor: cor
    });
  }
}

function atualizarParticulasClique() {
  for (let i = particulasClique.length - 1; i >= 0; i--) {
    const p = particulasClique[i];
    p.x += p.dx;
    p.y += p.dy;
    p.alpha -= 0.05;
    if (p.alpha <= 0) particulasClique.splice(i, 1);
  }
}

function desenharParticulasClique() {
  particulasClique.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${hexToRgb(p.cor)},${p.alpha})`;
    ctx.fill();
  });
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r},${g},${b}`;
}

function drawErrorScreen(message) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'red';
  ctx.font = `${getResponsiveSize(30)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function drawLoadingScreen(progress) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = `${getResponsiveSize(40)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const percent = Math.min(100, Math.max(0, Math.floor(progress * 100)));
  ctx.fillText(`Carregando... ${percent}%`, canvas.width / 2, canvas.height * 0.4);

  const barWidth = getResponsiveSize(300);
  const barHeight = getResponsiveSize(30);
  const barX = (canvas.width - barWidth) / 2;
  const barY = canvas.height * 0.5;
  ctx.fillStyle = 'white';
  ctx.fillRect(barX, barY, barWidth, barHeight);
  ctx.fillStyle = '#007bff';
  ctx.fillRect(barX, barY, barWidth * progress, barHeight);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barWidth, barHeight);
}


    drawMenuBackground();
    drawCoinsCounter();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const mainContainerWidth = getResponsiveSize(320);
    const mainContainerHeight = getResponsiveSize(280);
    const mainContainerX = (canvas.width - mainContainerWidth) / 2;
    const mainContainerY = (canvas.height - mainContainerHeight) / 2 - getResponsiveSize(50);
    
    // Fundo do container principal com um gradiente
    const gradient = ctx.createLinearGradient(mainContainerX, mainContainerY, mainContainerX + mainContainerWidth, mainContainerY + mainContainerHeight);
    gradient.addColorStop(0, '#333');
    gradient.addColorStop(1, '#111');
    ctx.fillStyle = gradient;
    roundRect(ctx, mainContainerX, mainContainerY, mainContainerWidth, mainContainerHeight, 20, true, false);
    
    // Contorno do container
    ctx.strokeStyle = '#4caf50'; // Verde-esmeralda para o contorno
    ctx.lineWidth = 4;
    roundRect(ctx, mainContainerX, mainContainerY, mainContainerWidth, mainContainerHeight, 20, false, true);


function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  switch (gameState.screen) {
    case SCREENS.LOADING:
      drawLoadingScreen();
      break;
    case SCREENS.MENU:
      drawMenuScreen();
      break;
    case SCREENS.MODE_SELECT:
      if(window.drawModeSelectScreen) window.drawModeSelectScreen();
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
      window.drawAbilitiesMenuScreen(); 
      break;
    case SCREENS.ABILITY_DETAILS: 
      window.drawAbilityDetailsScreen();
      break;
    case SCREENS.SETTINGS:
      drawSettingsScreen();
      break;
    case SCREENS.CREDITS:
      drawCreditsScreen();
      break;
    case SCREENS.ABILITIES_TUTORIAL:
      drawAbilitiesTutorialScreen();
      break;
  }

  // --- EFEITO DE FADE IN (Transição suave) ---
  if (window.transitionAlpha > 0) {
    ctx.save(); // Salva o estado do contexto
    
    // Desenha um retângulo PRETO ou AZUL MARINHO totalmente opaco por cima de tudo
    // enquanto o alpha for alto, para esconder o campo de fundo.
    ctx.globalAlpha = window.transitionAlpha;
    ctx.fillStyle = '#2c3e50'; // A cor exata da sua tela de carregamento
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.restore(); // Restaura o estado

    // Velocidade: Se diminuir 0.01, a transição fica mais longa e esconde melhor o fundo
    window.transitionAlpha -= 0.015; 
}

  // Mover atualização e desenho de partículas de clique para cá
  atualizarParticulasClique();
  desenharParticulasClique();
}

function drawTitle(text, fontSize, y) {
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'white';
    ctx.fillText(text, canvas.width / 2, y);
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof radius === 'number') radius = { tl: radius, tr: radius, br: radius, bl: radius };
  else {
    const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (let side in defaultRadius) radius[side] = radius[side] || defaultRadius[side];
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}
const PHRASES = {
    2: "VOCÊ É FERA!",
    3: "VOCÊ É DEMAIS!",
    4: "MELHOR!",
    5: "INCRÍVEL!",
    6: "FANTÁSTICO!",
    7: "FENOMENAL!",
    8: "MONSTRUOSO!",
    9: "LENDÁRIO!",
    10: "MITOLÓGICO!"
};

const COMBO_COLORS = ["#00FFCC", "#00E5FF", "#FF00FF", "#FFFF00", "#FF3D00", "#FFD700"];

window.criarTextoCombo = function(x, y, combo) {
    const frases = ["BOA!", "INCRÍVEL!", "ESPETACULAR!", "FENOMENAL!", "MESTRE SUPREMO!"];
    const frase = frases[combo] || "MESTRE SUPREMO!";
    
    // Cálculos de posicionamento
    const cols = window.gameState.currentDifficulty === 'easy' ? 4 : (window.gameState.currentDifficulty === 'medium' ? 5 : 6);
    const firstCard = window.gameState.cards[0];
    const cardHeight = firstCard ? firstCard.height : 110;
    const rows = Math.ceil(window.gameState.cards.length / cols);
    const totalGridHeight = (rows * cardHeight) + ((rows - 1) * window.getResponsiveSize(10));
    const gridTopY = (canvas.height - totalGridHeight) / 2;

    const cores = window.COMBO_COLORS || ["#00FF00", "#FFFF00", "#FF00FF", "#00FFFF", "#FF0000"];
    const corSelecionada = cores[combo % cores.length];

    window.gameState.floatingTexts.push({
        text: frase,
        x: canvas.width / 2,
        y: gridTopY - window.getResponsiveSize(50),
        alpha: 1,
        life: 1.5,
        scale: 1.8, // Impacto inicial um pouco menor para ser elegante
        velocity: -0.8,
        color: corSelecionada,
        fontSize: window.getResponsiveSize(32)
    });
};

window.drawComboTexts = function() {
    window.gameState.floatingTexts.forEach((ft, index) => {
        ctx.save();
        
        // Aplica o Fade Out
        ctx.globalAlpha = ft.alpha;
        
        // Faz o texto subir e encolher suavemente
        ft.y += ft.velocity;
        if (ft.scale > 1.0) ft.scale -= 0.04;

        ctx.translate(ft.x, ft.y);
        ctx.scale(ft.scale, ft.scale);

        // --- BORDAS LEVES E SOMBRA DISCRETA ---
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        
        ctx.font = `bold ${ft.fontSize}px Bungee`;
        ctx.textAlign = "center";
        
        // Borda fina e semi-transparente (como você pediu)
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"; 
        ctx.lineWidth = 2; // Bem fina
        ctx.strokeText(ft.text, 0, 0);
        
        // Cor principal do texto
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, 0, 0);

        ctx.restore();

        // Controle de vida do texto
        ft.life -= 0.016; 
        ft.alpha = Math.max(0, ft.life);
        if (ft.life <= 0) window.gameState.floatingTexts.splice(index, 1);
    });
};

// Adicione isso no FINAL de screenrenderers.js, após window.drawComboTexts = function() { ... };

window.drawGameBottomHUD = function() {
    const padding = window.getResponsiveSize(20);
    const fontSize = window.getResponsiveSize(28);
    const lineHeight = fontSize * 1.4;
    const centerX = canvas.width / 2;
    const hudYBase = canvas.height - padding * 2;

    if (window.gameState.currentCountry === 'classic') {
        // MODO CLÁSSICO: TEMPO > PONTUAÇÃO > RODADA (vertical, centralizado)
        const hudHeight = lineHeight * 3 + padding * 3;
        const hudY = hudYBase - hudHeight;

        // Fundo semi-transparente maior
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        window.roundRect(ctx, 0, hudY, canvas.width, hudHeight, 0, true, false);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 12;

        // 1. TEMPO (maior, colorido)
        const timerFont = window.getResponsiveSize(48);
        ctx.font = `bold ${timerFont}px 'Bungee'`;
        ctx.fillStyle = window.gameState.timer <= 10 ? '#ff4444' : '#00ff88';
        ctx.fillText(`${Math.floor(Math.max(0, window.gameState.timer))}s`, centerX, hudY + lineHeight / 2);

        // 2. PONTUAÇÃO (abaixo, dourado)
        ctx.font = `bold ${fontSize * 1.3}px 'Bungee'`;
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`PONTUAÇÃO: ${window.gameState.classicScore}`, centerX, hudY + lineHeight * 1.5);

        // 3. RODADA (abaixo)
        ctx.font = `bold ${fontSize}px 'Bungee'`;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`RODADA ${window.gameState.classicRounds}`, centerX, hudY + lineHeight * 2.5);

        ctx.shadowBlur = 0;

        // Botões abaixo do HUD
        const btnSize = window.getResponsiveSize(65);
        const sideMargin = padding * 2;
        const bottomPosY = hudYBase - btnSize - padding * 1.5;

        // Botão PAUSA (esquerda)
        window.drawButton(sideMargin, bottomPosY, btnSize, btnSize, "⏸️", 'toggleMenu', true, 24, ['#666', '#444'], 12);

        // Botão PEEK (direita, se disponível)
        if (window.gameState.abilityLevels.peek > 0) {
            const isReady = window.gameState.peekCooldown <= 0;
            window.drawButton(canvas.width - btnSize - sideMargin, bottomPosY, btnSize, btnSize,
                isReady ? "👁️" : "⏳", 'use_peek', isReady, 24,
                isReady ? ['#00E5FF', '#2979FF'] : ['#555', '#333'], 12);
        }

    } else {
        // MODO NORMAL: MOVES + TEMPO (como antes, mas otimizado)
        const hudHeight = lineHeight * 2.5 + padding * 2;
        const hudY = hudYBase - hudHeight;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        window.roundRect(ctx, 0, hudY, canvas.width, hudHeight, 0, true, false);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 8;

        const isVerySmallScreen = canvas.height < 600;
        if (isVerySmallScreen) {
            ctx.font = `bold ${window.getResponsiveSize(26)}px 'Bungee'`;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(`MOVES: ${window.gameState.moves} | TEMPO: ${Math.max(0, Math.floor(window.gameState.timer))}s`, centerX, hudY + lineHeight);
        } else {
            // Linha MOVES + TEMPO pequeno
            ctx.font = `bold ${fontSize}px 'Bungee'`;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(`MOVES: ${window.gameState.moves}     TEMPO: ${window.gameState.time.toFixed(1)}s`, centerX, hudY + lineHeight / 2);

            // Timer grande abaixo
            if (window.gameState.timer > 0) {
                const timerFont = window.getResponsiveSize(44);
                ctx.font = `bold ${timerFont}px 'Bungee'`;
                ctx.fillStyle = window.gameState.timer <= 10 ? '#ff4444' : '#00ff88';
                ctx.fillText(`${Math.floor(window.gameState.timer)}s`, centerX, hudY + lineHeight * 1.6);
            }
        }
        ctx.shadowBlur = 0;

        // Botões do modo normal (pause + peek, igual ao clássico)
        const btnSize = window.getResponsiveSize(65);
        const sideMargin = padding * 2;
        const bottomPosY = hudYBase - btnSize - padding * 1.5;

        window.drawButton(sideMargin, bottomPosY, btnSize, btnSize, "⏸️", 'toggleMenu', true, 24, ['#666', '#444'], 12);

        if (window.gameState.abilityLevels.peek > 0) {
            const isReady = window.gameState.peekCooldown <= 0;
            window.drawButton(canvas.width - btnSize - sideMargin, bottomPosY, btnSize, btnSize,
                isReady ? "👁️" : "⏳", 'use_peek', isReady, 24,
                isReady ? ['#00E5FF', '#2979FF'] : ['#555', '#333'], 12);
        }
    }
};