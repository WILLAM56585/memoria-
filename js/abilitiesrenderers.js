console.log('abilitiesrenderers.js carregado');

// Definição dos dados das habilidades (Centralizado)
window.getAbilitiesData = function() {
    return {
        bonusTime: {
            id: 'bonusTime',
            name: "TEMPO EXTRA",
            icon: "⏳",
            desc: "Ganhe segundos ao acertar um par.",
            color: ["#FFD700", "#FF8C00"], // Gradiente Dourado
            maxLevel: 5,
            baseCost: 15
        },
        peek: {
            id: 'peek',
            name: "VISÃO RAIO-X",
            icon: "👁️",
            desc: "Revele todas as cartas por um tempo.",
            color: ["#00E5FF", "#2979FF"], // Gradiente Azul Neon
            maxLevel: 3,
            baseCost: 50
        }
    };
};

// -----------------------------------------------------------
// TELA 1: MENU DE SELEÇÃO (Os dois botões grandes)
// -----------------------------------------------------------
window.drawAbilitiesMenuScreen = function() {
    // Fundo e Partículas (Padrão do jogo)
    if (window.drawMenuBackground) window.drawMenuBackground();
    if (window.updateParticulas) window.updateParticulas();
    if (window.drawParticulas) window.drawParticulas();
    if (window.drawCoinsCounter) window.drawCoinsCounter();

    // Título e Subtítulo
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${window.getResponsiveSize(36)}px 'Bungee'`;
    ctx.fillStyle = '#FFF';
    ctx.fillText("HABILIDADES", canvas.width / 2, canvas.height * 0.15);

    ctx.font = `${window.getResponsiveSize(18)}px Arial`;
    ctx.fillStyle = '#BBDEFB';
    ctx.fillText("Escolha um poder para melhorar", canvas.width / 2, canvas.height * 0.25);

    // Botões de Poderes (Mantendo a altura 80 que você gostou)
    const btnWidth = window.getResponsiveSize(280);
    const btnHeight = window.getResponsiveSize(80); 
    const spacing = window.getResponsiveSize(35); 
    const startY = canvas.height * 0.40;
    const btnX = (canvas.width - btnWidth) / 2;

    const abilities = window.getAbilitiesData();
    const list = [abilities.bonusTime, abilities.peek];

    list.forEach((ability, index) => {
        const y = startY + index * (btnHeight + spacing);
        const level = window.gameState.abilityLevels[ability.id] || 0;
        
        window.drawButton(
            btnX, y, btnWidth, btnHeight,
            "", `select_${ability.id}`, true, 
            window.getResponsiveSize(20), ability.color, 16, 'Bungee', 'white', 2
        );

        ctx.save();
        const centerY = y + btnHeight / 2;
        ctx.textAlign = 'center';
        ctx.font = `${window.getResponsiveSize(40)}px Arial`;
        ctx.fillStyle = 'white';
        ctx.fillText(ability.icon, btnX + window.getResponsiveSize(45), centerY + window.getResponsiveSize(5));
        ctx.textAlign = 'left';
        ctx.font = `bold ${window.getResponsiveSize(20)}px 'Bungee'`;
        ctx.fillText(ability.name, btnX + window.getResponsiveSize(85), centerY - window.getResponsiveSize(8));
        ctx.font = `bold ${window.getResponsiveSize(14)}px Arial`;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillText(`NÍVEL ${level} / ${ability.maxLevel}`, btnX + window.getResponsiveSize(85), centerY + window.getResponsiveSize(18));
        ctx.restore();
    });

    // --- BOTÃO VOLTAR IDÊNTICO À SEÇÃO DE PAÍSES ---
    const backButtonWidth = window.getResponsiveSize(150); // Igual países
    const backButtonHeight = window.getResponsiveSize(50); // Igual países
    const backButtonX = (canvas.width - backButtonWidth) / 2;
    const backButtonY = canvas.height - backButtonHeight - window.getResponsiveSize(60); // Igual países
    
    window.drawButton(
        backButtonX, backButtonY, backButtonWidth, backButtonHeight,
        "VOLTAR", 
        'backFromAbilities', // ID para o clique
        true, 
        window.getResponsiveSize(18), // Fonte igual países
        ['#555', '#333'], // Cor cinza igual países
        10, // Corner radius igual países
        'Bungee', 
        'white', 
        1 // Borda fina igual países
    );
};

// -----------------------------------------------------------
// TELA 2: DETALHES E EVOLUÇÃO (Uma habilidade por vez)
// -----------------------------------------------------------
window.drawAbilityDetailsScreen = function() {
    // Recupera qual habilidade foi selecionada
    const abilityKey = window.gameState.selectedAbility;
    if (!abilityKey) return; // Segurança

    const data = window.getAbilitiesData()[abilityKey];
    const level = window.gameState.abilityLevels[abilityKey] || 0;
    const cost = (level + 1) * data.baseCost;
    
    // Fundo (Mesmo gradiente para consistência)
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#1a237e");
    grad.addColorStop(1, "#000051");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (window.drawCoinsCounter) window.drawCoinsCounter();

    ctx.textAlign = 'center';

    // Cartão Central de Destaque
    const cardW = canvas.width * 0.85;
    const cardH = canvas.height * 0.5;
    const cardX = (canvas.width - cardW) / 2;
    const cardY = canvas.height * 0.15;

    // Fundo do Cartão
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    window.roundRect(ctx, cardX, cardY, cardW, cardH, 20, true, false);
    ctx.strokeStyle = data.color[0]; // Borda da cor da habilidade
    ctx.lineWidth = 3;
    ctx.stroke();

    // Conteúdo do Cartão
    let curY = cardY + window.getResponsiveSize(60);

    // Ícone Gigante
    ctx.font = `${window.getResponsiveSize(80)}px Arial`;
    ctx.shadowColor = data.color[1];
    ctx.shadowBlur = 20;
    ctx.fillText(data.icon, canvas.width / 2, curY);
    ctx.shadowBlur = 0;

    // Nome
    curY += window.getResponsiveSize(60);
    ctx.fillStyle = data.color[0];
    ctx.font = `bold ${window.getResponsiveSize(28)}px 'Bungee'`;
    ctx.fillText(data.name, canvas.width / 2, curY);

    // Descrição
    curY += window.getResponsiveSize(40);
    ctx.fillStyle = 'white';
    ctx.font = `${window.getResponsiveSize(16)}px Arial`;
    // Quebra de linha simples se necessário (assumindo descrições curtas)
    ctx.fillText(data.desc, canvas.width / 2, curY);

    // Texto de Bônus (Atual vs Próximo)
    curY += window.getResponsiveSize(40);
    let bonusText = "";
    if (abilityKey === 'bonusTime') {
        bonusText = `Atual: +${level}s  ➜  Próximo: +${level+1}s`;
    } else {
        const curDur = 1 + (level * 0.5);
        const nextDur = 1 + ((level+1) * 0.5);
        bonusText = `Atual: ${curDur}s  ➜  Próximo: ${nextDur}s`;
    }
    if (level >= data.maxLevel) bonusText = "Habilidade no Nível Máximo!";
    
    ctx.fillStyle = '#4CAF50';
    ctx.font = `bold ${window.getResponsiveSize(18)}px Arial`;
    ctx.fillText(bonusText, canvas.width / 2, curY);

    // Barra de Progresso Grande
    curY += window.getResponsiveSize(30);
    const barW = cardW * 0.8;
    const barH = window.getResponsiveSize(25);
    const barX = (canvas.width - barW) / 2;
    
    ctx.fillStyle = '#444';
    window.roundRect(ctx, barX, curY, barW, barH, 10, true, false);
    
    const progress = Math.min(level / data.maxLevel, 1);
    if (progress > 0) {
        // Gradiente na barra
        const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        barGrad.addColorStop(0, data.color[0]);
        barGrad.addColorStop(1, data.color[1]);
        ctx.fillStyle = barGrad;
        window.roundRect(ctx, barX, curY, barW * progress, barH, 10, true, false);
    }
    // Texto da barra
    ctx.fillStyle = 'white';
    ctx.font = `bold ${window.getResponsiveSize(14)}px Arial`;
    ctx.fillText(`${level} / ${data.maxLevel}`, canvas.width / 2, curY + barH - 5);


    // Botão de Evoluir (Fora do cartão, embaixo)
    const btnW = window.getResponsiveSize(220);
    const btnH = window.getResponsiveSize(60);
    const btnX = (canvas.width - btnW) / 2;
    const btnY = cardY + cardH + window.getResponsiveSize(30);

    const canBuy = window.gameState.playerCoins >= cost && level < data.maxLevel;
    const isMax = level >= data.maxLevel;
    
    let btnLabel = isMax ? "MÁXIMO" : `EVOLUIR (${cost} 💰)`;
    let btnColors = isMax ? ['#555', '#333'] : (canBuy ? ['#43A047', '#2E7D32'] : ['#D32F2F', '#B71C1C']);

    window.drawButton(
        btnX, btnY, btnW, btnH,
        btnLabel,
        'evolve_action', // ID genérico, a lógica sabe qual é pelo selectedAbility
        canBuy && !isMax,
        window.getResponsiveSize(20),
        btnColors,
        15,
        'Bungee'
    );

    // Mensagem de erro (sem dinheiro)
    if (!canBuy && !isMax) {
        ctx.fillStyle = '#FF5252';
        ctx.font = `${window.getResponsiveSize(14)}px Arial`;
        ctx.fillText("Moedas insuficientes", canvas.width / 2, btnY + btnH + window.getResponsiveSize(20));
    }

    // Botão Voltar (Para o menu de habilidades)
    const backBtnW = window.getResponsiveSize(150);
const backBtnH = window.getResponsiveSize(50);

window.drawButton(
    (canvas.width - backBtnW) / 2,
    canvas.height - backBtnH - window.getResponsiveSize(60), // Ajustado para 60px do fundo
    backBtnW, 
    backBtnH,
    "VOLTAR", 
    'backToAbilitiesMenu', 
    true, 
    window.getResponsiveSize(18),
    ['#555', '#333'], // Cores da seção anterior (Cinza escuro)
    10,               // Corner radius consistente
    'Bungee', 
    'white', 
    1                 // Borda fina
);
};

// Tutorial (Mantido igual, apenas renomeado para garantir)
window.drawAbilitiesTutorialScreen = function() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.font = `${window.getResponsiveSize(40)}px Arial`;
    ctx.fillText('Bem-vindo às Habilidades!', canvas.width / 2, canvas.height * 0.2);

    ctx.font = `${window.getResponsiveSize(25)}px Arial`;
    const tutorialText = [
        "Use moedas para evoluir seus poderes.",
        "Escolha entre Tempo Extra ou Visão Raio-X.",
        "Poderes ajudam nas fases difíceis!"
    ];

    let currentY = canvas.height * 0.4;
    const lineHeight = window.getResponsiveSize(40);
    tutorialText.forEach(line => {
        ctx.fillText(line, canvas.width / 2, currentY);
        currentY += lineHeight;
    });

    const buttonWidth = window.getResponsiveSize(180);
    const buttonHeight = window.getResponsiveSize(60);
    const buttonX = (canvas.width - buttonWidth) / 2;
    const buttonY = canvas.height * 0.8;

    window.drawButton(
        buttonX, buttonY, buttonWidth, buttonHeight, 
        'Continuar', 'tutorialContinue', true, window.getResponsiveSize(22), 
        ['#4CAF50', '#8BC34A'], 15, 'Bungee'
    );
};