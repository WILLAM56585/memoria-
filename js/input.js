let debugClickCount = 0;
let lastDebugClickTime = 0;

let mouseX = 0, mouseY = 0;
// NOVO: Declara canvasRect como variável local (que será inicializada depois)
let canvasRect; 

// NOVO: Função Global para atualizar as coordenadas do canvas (chamada pelo script.js)
window.updateCanvasRect = function() {
    if (window.canvas) {
        canvasRect = window.canvas.getBoundingClientRect();
    }
}

// Garante que a posição de clique é atualizada ao redimensionar ou rolar
window.addEventListener('resize', window.updateCanvasRect);
window.addEventListener('scroll', window.updateCanvasRect);


canvas.addEventListener('touchstart', (event) => {
    if(event.cancelable) event.preventDefault(); 

    const touch = event.touches[0];
    
    if (canvasRect) { 
        mouseX = touch.clientX - canvasRect.left;
        mouseY = touch.clientY - canvasRect.top;
    }

    // Dispara um evento de clique real nas mesmas coordenadas
    const mouseEvent = new MouseEvent("click", {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    
    canvas.dispatchEvent(mouseEvent);
}, { passive: false });

canvas.addEventListener('click', (event) => {
  // Opcional: Garante que as coordenadas estão certas no momento exato do clique
  window.updateCanvasRect(); 

  // Se o jogo não quebrou até aqui, canvasRect está definido
  window.gameState.hasUserInteracted = true;
  handleCanvasClick(event);
});

function resetCountryContainerJumps() {
    if (gameState.containerJumpStates) {
        for (const key in gameState.containerJumpStates) {
            // Assume que os containers de país usam o prefixo 'container_'
            if (key.startsWith('container_')) {
                delete gameState.containerJumpStates[key];
            }
        }
    }
}

function isHovering(x, y, width, height) {
  const padding = window.getResponsiveSize(5); 
  
  return mouseX >= x - padding && 
         mouseX <= x + width + padding && 
         mouseY >= y - padding && 
         mouseY <= y + height + padding;
}

function initCountryEntranceAnimation() {
    const countryKeys = Object.keys(window.playersData);
    window.gameState.containerJumpStates = window.gameState.containerJumpStates || {}; 
    
    // Limpa estados de slide anteriores
    for (const key in window.gameState.containerJumpStates) {
         if (key.startsWith('container_')) {
             delete window.gameState.containerJumpStates[key];
         }
    }
    
    // Configura o slide de entrada (da esquerda para a direita)
    countryKeys.forEach(country => {
        window.gameState.containerJumpStates[`container_${country}`] = { 
            slideProgress: 0, // Começa em 0 (fora da tela)
            slideDirection: -1 // -1 significa slide IN (0 -> 1)
        };
    });
}

function handleCanvasClick(event) {
  // === ESTA É A LINHA QUE EVITA O CRASH ===
    // Se o clique estiver travado ou o Raio-X estiver ativo, ignora o clique totalmente
    if (window.gameState.isClickLocked || window.gameState.peekActive) return;
  if (gameState.isClickLocked) {
    console.log("Clique bloqueado, aguarde a animação.");
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  mouseX = clickX;
  mouseY = clickY;

  switch (gameState.screen) {
    case SCREENS.MENU:
        const menuLayout = window.getMenuLayout();

        // 1. CLIQUE NO BOTÃO "CLÁSSICO" (Botão Central)
        // OBS: Aqui mudamos para chamar direto o jogo misto!
        if (isHovering(menuLayout.play.x, menuLayout.play.y, menuLayout.play.w, menuLayout.play.h)) {
            gameState.buttonJumpStates['classicMode'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
            window.playSoundEffect(SOUND_EFFECTS.CLICK);
            
            gameState.isClickLocked = true;
            setTimeout(() => {
                if (!window.gameState.containerJumpStates) window.gameState.containerJumpStates = {};
        window.gameState.containerJumpStates['countries_screen'] = { slideProgress: 0 };
                // CHAMA A NOVA FUNÇÃO QUE CRIAMOS
                if (window.gameLogic.startRandomClassicGame) {
                    window.gameLogic.startRandomClassicGame();
                } else {
                    console.error("Erro: startRandomClassicGame não encontrada!");
                }
                gameState.isClickLocked = false;
            }, 200);
        }
        
        // 2. CLIQUE EM PODERES
        else if (isHovering(menuLayout.abilities.x, menuLayout.abilities.y, menuLayout.abilities.w, menuLayout.abilities.h)) {
            gameState.buttonJumpStates['abilities'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
            window.playSoundEffect(SOUND_EFFECTS.CLICK);
            
            gameState.isClickLocked = true;
            setTimeout(() => {
                window.gameState.screen = SCREENS.ABILITIES; // Use a tela de menu de poderes
                window.gameState.isClickLocked = false;
                render();
            }, 200);
        }

        // 3. CLIQUE EM HISTÓRIA (Antigo Ranking)
        else if (isHovering(menuLayout.ranking.x, menuLayout.ranking.y, menuLayout.ranking.w, menuLayout.ranking.h)) {
            gameState.buttonJumpStates['storyMode'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
            window.playSoundEffect(SOUND_EFFECTS.CLICK);
            
            gameState.isClickLocked = true;
            setTimeout(() => {
                // Lógica futura para modo história
                console.log("Modo História em breve");
                window.gameState.screen = SCREENS.COUNTRY_SELECT; // Temporário
                window.gameState.isClickLocked = false;
                render();
            }, 200);
        }

        // 4. CONFIGURAÇÕES
        else if (isHovering(menuLayout.settings.x, menuLayout.settings.y, menuLayout.settings.w, menuLayout.settings.h)) {
            gameState.buttonJumpStates['settings'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
            window.playSoundEffect(SOUND_EFFECTS.CLICK);
            window.gameState.screen = SCREENS.SETTINGS;
            render();
        }
        break;


   case SCREENS.COUNTRY_SELECT:
    // Posição e dimensões do botão VOLTAR (usado para verificar o clique)
    const backButtonWidth = getResponsiveSize(150);
    const backButtonHeight = getResponsiveSize(50);
    const backButtonX = (canvas.width - backButtonWidth) / 2;
    const backButtonY = canvas.height - backButtonHeight - getResponsiveSize(20);

    // 1. Verifica clique no Botão VOLTAR
    if (isHovering(backButtonX, backButtonY, backButtonWidth, backButtonHeight)) {
        gameState.buttonJumpStates['backFromCountrySelect'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
        gameState.isClickLocked = true;
        setTimeout(() => {
            gameState.screen = SCREENS.MENU;
            window.playSoundEffect(SOUND_EFFECTS.CLICK);
            gameState.isClickLocked = false;
            // Limpa os estados de animação ao sair da tela
            if(window.gameLogic && window.gameLogic.resetJumpStates) window.gameLogic.resetJumpStates();
            render();
        }, 300);
        return; // Sai da função após o clique no botão
    }

    // 2. Verifica clique nos Cartões dos Países
    const countryLayout = window.getCountryCardLayout();

    for (const card of countryLayout) {
        if (isHovering(card.x, card.y, card.width, card.height)) {
            const country = card.key;
            const containerId = 'container_' + country;
            
            // LÓGICA DE DESBLOQUEIO: Verifica se o país está bloqueado
            const isLocked = window.gameState.unlockedCountries && !window.gameState.unlockedCountries.includes(country);

            if (isLocked) {
                // Se estiver bloqueado, apenas emite um som de erro e retorna
                window.playSoundEffect(SOUND_EFFECTS.ERROR);
                
                // Opcional: Animação de erro (pequeno tremor)
                if(!gameState.containerJumpStates[containerId] || !gameState.containerJumpStates[containerId].isJumping) {
                    gameState.containerJumpStates[containerId] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
                }
                return; 
            }
            
            // SE DESBLOQUEADO: Inicia a animação de clique
            gameState.containerJumpStates[containerId] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
            gameState.isClickLocked = true;
            
            // Após a animação, avança para a tela de dificuldade
            setTimeout(() => {
                if (!window.gameState.containerJumpStates) window.gameState.containerJumpStates = {};
                window.playSoundEffect(SOUND_EFFECTS.CLICK);
                window.gameState.currentCountry = country; // Define o país selecionado
                window.gameState.screen = SCREENS.DIFFICULTY_SELECT; // Vai para a seleção de dificuldade
                window.gameState.isClickLocked = false;
                render();
            }, 300);
            return; // Sai da função após encontrar o cartão clicado
        }
    }
    break;

// No arquivo js/input.js (ou onde está handleCanvasClick)
// PROCURE pelo case SCREENS.DIFFICULTY_SELECT e SUBSTITUA pelo seguinte:

case SCREENS.DIFFICULTY_SELECT:
{
    const layout = window.currentDifficultyLayout;
    if (!layout) return;

    // Clique nas dificuldades
    Object.keys(layout.btnLayouts).forEach(diff => {
        const btn = layout.btnLayouts[diff];
        if (isHovering(btn.btnX, btn.btnY, btn.btnW, btn.btnH)) {
            const isUnlocked = window.gameState.unlockedDifficulties[window.gameState.currentCountry]?.includes(diff) || diff === 'easy';
            if (isUnlocked) {
                gameState.buttonJumpStates[`difficulty_${diff}`] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
                gameState.isClickLocked = true;
                setTimeout(() => {
                    window.gameState.currentDifficulty = diff;
                    window.playSoundEffect(SOUND_EFFECTS.CLICK);
                    window.gameLogic.initGame();
                    gameState.isClickLocked = false;
                }, 300);
            } else {
                playSoundEffect(SOUND_EFFECTS.UPGRADE_FAIL);
            }
        }
    });

    // Clique no VOLTAR (AGORA COM ANIMAÇÃO DE CLIQUE)
    const voltar = layout.voltar;
    if (isHovering(voltar.x, voltar.y, voltar.w, voltar.h)) {
        gameState.buttonJumpStates['backFromDifficulty'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 }; // ADICIONADO: Ativa a animação de "jump/pulse" no clique
        gameState.isClickLocked = true;
        setTimeout(() => {
            gameState.screen = SCREENS.COUNTRY_SELECT;
            playSoundEffect(SOUND_EFFECTS.CLICK);
            gameState.isClickLocked = false;
            render();
        }, 300);
    }
}
break;
        {
            // Proteção contra o erro de undefined
            if (!window.currentDifficultyLayout || !window.currentDifficultyLayout.btnLayouts) return;
            
            const layout = window.currentDifficultyLayout;

            // Cliques nas dificuldades
            ['easy', 'medium', 'hard'].forEach(diff => {
                const btn = layout.btnLayouts[diff];
                // Usando btnX, btnY, btnW, btnH para bater com o objeto criado no render
                if (isHovering(btn.btnX, btn.btnY, btn.btnW, btn.btnH)) {
                    const isUnlocked = window.gameState.unlockedDifficulties[window.gameState.currentCountry]?.includes(diff) || diff === 'easy';
                    
                    if (!isUnlocked) {
                        if(window.playSoundEffect) window.playSoundEffect(window.SOUND_EFFECTS.UPGRADE_FAIL);
                        return;
                    }

                    gameState.buttonJumpStates[`difficulty_${diff}`] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
                    gameState.isClickLocked = true;
                    
                    setTimeout(() => {
                        gameState.currentDifficulty = diff;
                        // Chama a função correta do seu gamelogic.js
                        if(window.gameLogic && window.gameLogic.initGame) {
                            window.gameLogic.initGame();
                        }
                        if(window.playSoundEffect) window.playSoundEffect(window.SOUND_EFFECTS.CLICK);
                        gameState.isClickLocked = false;
                        render();
                    }, 300);
                }
            });

            // Botão Voltar
            if (isHovering(layout.voltar.x, layout.voltar.y, layout.voltar.w, layout.voltar.h)) {
                gameState.buttonJumpStates['backFromDifficultySelect'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
                gameState.isClickLocked = true;
                setTimeout(() => {
                    gameState.screen = SCREENS.COUNTRY_SELECT;
                    if(window.playSoundEffect) window.playSoundEffect(window.SOUND_EFFECTS.CLICK);
                    gameState.isClickLocked = false;
                    render();
                }, 300);
            }
        }
        break;
        {
            // Tenta pegar o layout que foi desenhado na tela
            if (!window.currentDifficultyLayout) return;
            const layout = window.currentDifficultyLayout;

            // 1. Cliques nos botões de dificuldade (Fácil, Médio, Difícil)
            ['easy', 'medium', 'hard'].forEach(diff => {
                const btn = layout.btnLayouts[diff];
                // Verifica se o mouse está sobre o botão usando as coordenadas do layout
                if (isHovering(btn.btnX, btn.btnY, btn.btnW, btn.btnH)) {
                    
                    const isUnlocked = window.gameState.unlockedDifficulties[window.gameState.currentCountry]?.includes(diff) || diff === 'easy';
                    
                    if (!isUnlocked) {
                        if (window.playSoundEffect) window.playSoundEffect(window.SOUND_EFFECTS.UPGRADE_FAIL);
                        return;
                    }

                    // Animação de pulo
                    window.gameState.buttonJumpStates[`difficulty_${diff}`] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
                    window.gameState.isClickLocked = true;

                    setTimeout(() => {
                        window.gameState.currentDifficulty = diff;
                        
                        // --- CHAMADA CORRETA DA FUNÇÃO ---
                        if (window.gameLogic && window.gameLogic.initGame) {
                            window.gameLogic.initGame(); 
                        } else {
                            console.error("Erro Crítico: window.gameLogic.initGame não encontrada!");
                        }

                        if (window.playSoundEffect) window.playSoundEffect(window.SOUND_EFFECTS.CLICK);
                        window.gameState.isClickLocked = false;
                        window.render();
                    }, 300);
                }
            });

            // 2. Botão Voltar
            const v = layout.voltar;
            if (isHovering(v.x, v.y, v.w, v.h)) {
                window.gameState.buttonJumpStates['backFromDifficultySelect'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
                window.gameState.isClickLocked = true;
                setTimeout(() => {
                    window.gameState.screen = window.SCREENS.COUNTRY_SELECT;
                    if(window.playSoundEffect) window.playSoundEffect(window.SOUND_EFFECTS.CLICK);
                    window.gameState.isClickLocked = false;
                    window.render();
                }, 300);
            }
        }
        break;
        {
            if (!window.currentDifficultyLayout) return;
            const layout = window.currentDifficultyLayout;

            // Cliques nos botões de dificuldade
            ['easy', 'medium', 'hard'].forEach(diff => {
                const btn = layout.btnLayouts[diff];
                if (isHovering(btn.btnX, btn.btnY, btn.btnW, btn.btnH)) {
                    const isUnlocked = window.gameState.unlockedDifficulties[window.gameState.currentCountry]?.includes(diff) || diff === 'easy';
                    if (!isUnlocked) {
                        playSoundEffect(SOUND_EFFECTS.UPGRADE_FAIL); // Som de erro se bloqueado
                        return;
                    }
                    gameState.buttonJumpStates[`difficulty_${diff}`] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
                    gameState.isClickLocked = true;
                    setTimeout(() => {
                        gameState.currentDifficulty = diff;
                        gameLogic.initGame(); // Avança para o jogo
                        playSoundEffect(SOUND_EFFECTS.CLICK);
                        gameState.isClickLocked = false;
                        render();
                    }, 300);
                }
            });

            // Botão Voltar
            if (isHovering(layout.voltar.x, layout.voltar.y, layout.voltar.w, layout.voltar.h)) {
                gameState.buttonJumpStates['backFromDifficultySelect'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
                gameState.isClickLocked = true;
                setTimeout(() => {
                    gameState.screen = SCREENS.COUNTRY_SELECT; // Volta para países
                    if(window.resetCountryContainerJumps) window.resetCountryContainerJumps();
                    if(window.initCountryEntranceAnimation) window.initCountryEntranceAnimation();
                    playSoundEffect(SOUND_EFFECTS.CLICK);
                    gameState.isClickLocked = false;
                    render();
                }, 300);
            }
        }
        break;

    case SCREENS.GAME: {
        // 1. BOTÃO DE MENU/PAUSA (Canto Inferior Esquerdo)
        const menuButtonWidth = getResponsiveSize(50);
        const menuButtonHeight = getResponsiveSize(50);
        const menuButtonX = getResponsiveSize(20);
        const menuButtonY = canvas.height - menuButtonHeight - getResponsiveSize(20);

        if (isHovering(menuButtonX, menuButtonY, menuButtonWidth, menuButtonHeight)) {
            gameState.buttonJumpStates['toggleMenu'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
            gameState.isClickLocked = true;
            setTimeout(() => {
                gameState.screen = SCREENS.PAUSE;
                playSoundEffect(SOUND_EFFECTS.CLICK);
                gameState.isClickLocked = false;
                render();
            }, 300);
            return; // Sai da função para não processar cliques em cartas abaixo do botão
        }

        // 2. TRAVA DE SEGURANÇA
        // Se o jogo estiver animando cartas ou o Raio-X estiver ativo, ignora o clique
        if (gameState.isClickLocked || gameState.peekActive) {
            console.log("Clique bloqueado: Processando animação.");
            return;
        }

        // 3. BOTÃO DO PODER RAIO-X (Canto Inferior Direito)
        if (window.gameState.abilityLevels.peek > 0) {
            const margin = window.getResponsiveSize(20);
            const btnSize = window.getResponsiveSize(60);
            const btnX = canvas.width - btnSize - margin;
            const btnY = canvas.height - btnSize - margin;

            if (isHovering(btnX, btnY, btnSize, btnSize) && window.gameState.peekCooldown <= 0) {
                if (window.usarPoderRaioX) {
                    window.usarPoderRaioX();
                }
                return; // Sai para não clicar em uma carta que possa estar atrás do botão
            }
        }

        // 4. LÓGICA DE CLIQUE NAS CARTAS
        for (const card of gameState.cards) {
            if (isHovering(card.x, card.y, card.width, card.height) && 
                !card.isFlipped && !card.isMatched && !card.isFlipping) {
                
                card.isFlipping = true;
                card.flipProgress = 0;
                card.flipDirection = 1;
                gameState.flippedCards.push(card);
                gameState.moves++;
                playSoundEffect(SOUND_EFFECTS.FLIP);

                if (gameState.flippedCards.length === 2) {
                    gameState.isClickLocked = true;
                    // Chama a lógica de verificar par após 1 segundo
                    setTimeout(() => {
                        if(window.gameLogic && window.gameLogic.checkMatch) {
                            window.gameLogic.checkMatch();
                        }
                    }, 1000);
                }
                break; // Sai do loop 'for' pois já encontrou a carta clicada
            }
        }
        break; // Fim do case SCREENS.GAME
    }
      {
        const menuButtonWidth = getResponsiveSize(50);
        const menuButtonHeight = getResponsiveSize(50);
        const menuButtonX = getResponsiveSize(20);
        const menuButtonY = canvas.height - menuButtonHeight - getResponsiveSize(20);
        if (isHovering(menuButtonX, menuButtonY, menuButtonWidth, menuButtonHeight)) {
          gameState.buttonJumpStates['toggleMenu'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
          gameState.isClickLocked = true;
          setTimeout(() => {
            gameState.screen = SCREENS.PAUSE;
            playSoundEffect(SOUND_EFFECTS.CLICK);
            gameState.isClickLocked = false;
            render();
          }, 300);
        }

        if (gameState.isClickLocked) {
          console.log("Clique bloqueado, aguarde o processamento das cartas.");
          return;
        }

        for (const card of gameState.cards) {
          if (isHovering(card.x, card.y, card.width, card.height) && !card.isFlipped && !card.isMatched && !card.isFlipping) {
            card.isFlipping = true;
            card.flipProgress = 0;
            card.flipDirection = 1;
            gameState.flippedCards.push(card);
            gameState.moves++;
            playSoundEffect(SOUND_EFFECTS.FLIP);
            if (gameState.flippedCards.length === 2) {
              gameState.isClickLocked = true;
              setTimeout(window.gameLogic.checkMatch, 1000);
            }
            break;
          }
          if (window.gameState.abilityLevels.peek > 0) {
        const margin = window.getResponsiveSize(20);
        const btnSize = window.getResponsiveSize(60);
        const btnX = canvas.width - btnSize - margin;
        const btnY = canvas.height - btnSize - margin;

        if (isHovering(btnX, btnY, btnSize, btnSize) && window.gameState.peekCooldown <= 0) {
    window.usarPoderRaioX();
    return; // O return aqui é vital para não clicar na carta que está "atrás" do botão
}
    }
    break;
        }
      }
      break;

case SCREENS.ABILITIES_TUTORIAL:
    const tutorialContinueButtonWidth = getResponsiveSize(180);
    const tutorialContinueButtonHeight = getResponsiveSize(60);
    const tutorialContinueButtonX = (canvas.width - tutorialContinueButtonWidth) / 2;
    const tutorialContinueButtonY = canvas.height * 0.8;
    
    if (isHovering(tutorialContinueButtonX, tutorialContinueButtonY, tutorialContinueButtonWidth, tutorialContinueButtonHeight)) {
        gameState.buttonJumpStates['tutorialContinue'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
        gameState.isClickLocked = true;
        setTimeout(() => {
            gameState.screen = SCREENS.ABILITIES;
            playSoundEffect(SOUND_EFFECTS.CLICK);
            gameState.isClickLocked = false;
            render();
        }, 300);
    }
    break;

    case SCREENS.GAME_OVER:
      {
        const gameOverButtonWidth = getResponsiveSize(200);
        const gameOverButtonHeight = getResponsiveSize(50);
        const gameOverButtonX = (canvas.width - gameOverButtonWidth) / 2;
        const titleY = canvas.height * 0.3;
        const timeY = titleY + (gameState.matchedCards.length === gameState.cards.length ? getResponsiveSize(60) : getResponsiveSize(120));
        let gameOverButtonY = timeY + getResponsiveSize(80);

        if (gameState.matchedCards.length === gameState.cards.length) {
          if (isHovering(gameOverButtonX, gameOverButtonY, gameOverButtonWidth, gameOverButtonHeight)) {
    gameState.buttonJumpStates['backFromGameOver'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
    gameState.isClickLocked = true;
    setTimeout(() => {
        window.gameLogic.resetGame();
        gameState.screen = SCREENS.MENU;
        playSoundEffect(SOUND_EFFECTS.CLICK);
        gameState.isClickLocked = false;
        render();
    }, 300);

          } else if (isHovering(gameOverButtonX, gameOverButtonY + gameOverButtonHeight + getResponsiveSize(20), gameOverButtonWidth, gameOverButtonHeight)) {
  gameState.buttonJumpStates['continueGameOver'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
  gameState.isClickLocked = true;

  setTimeout(() => {
  // Salve o país ANTES do reset (segurança extra)
  const savedCountry = gameState.currentCountry;

  // Avança dificuldade
  const difficulties = ['easy', 'medium', 'hard'];
  const currentIndex = difficulties.indexOf(gameState.currentDifficulty);

  if (currentIndex < difficulties.length - 1) {
    const nextDifficulty = difficulties[currentIndex + 1];

    // Atualiza dificuldade
    gameState.currentDifficulty = nextDifficulty;

    // Reseta partida (agora não zera país/dificuldade)
    window.gameLogic.resetGame();

    // Restaura país (caso resetGame ainda zere por acidente)
    gameState.currentCountry = savedCountry;

    // Novo timer
    switch (nextDifficulty) {
      case 'easy':   gameState.timer = 45; break;
      case 'medium': gameState.timer = 30; break;
      case 'hard':   gameState.timer = 75; break;
    }

    // Recria cartas
    window.gameLogic.createCards();

    gameState.screen = SCREENS.GAME;
  } else {
    gameState.screen = SCREENS.COUNTRY_SELECT;
  }

  playSoundEffect(SOUND_EFFECTS.CLICK);
  gameState.isClickLocked = false;
  render();
}, 300);
}
        } else {
    if (isHovering(gameOverButtonX, gameOverButtonY, gameOverButtonWidth, gameOverButtonHeight)) {
        gameState.buttonJumpStates['backFromGameOver'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
        gameState.isClickLocked = true;
        setTimeout(() => {
            gameState.screen = SCREENS.MENU;
            playSoundEffect(SOUND_EFFECTS.CLICK);
            gameState.isClickLocked = false;
            render();
        }, 300);
    }

        }
      }
      break;

    case SCREENS.PAUSE:
  const pauseButtonWidthPause = getResponsiveSize(250);
  const pauseButtonHeightPause = getResponsiveSize(60);
  const pauseButtonX = (canvas.width - pauseButtonWidthPause) / 2;
  const pauseStartY = canvas.height * 0.45;
  const pauseButtonSpacing = getResponsiveSize(20);

  if (isHovering(pauseButtonX, pauseStartY, pauseButtonWidthPause, pauseButtonHeightPause)) {
    gameState.buttonJumpStates['resume'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
    gameState.isClickLocked = true;
    setTimeout(() => {
      // REMOVA ESSA LINHA INTEIRA:
      // gameState.timerInterval = setInterval(window.gameLogic.updateTimer, 1000);

      playBackgroundMusic(window.playersData[gameState.currentCountry]?.gameMusic || './assets/audio/musica-menu.ogg');
      gameState.screen = SCREENS.GAME;
      playSoundEffect(SOUND_EFFECTS.CLICK);
      gameState.isClickLocked = false;
      render();
    }, 300);
  } else if (isHovering(pauseButtonX, pauseStartY + pauseButtonHeightPause + pauseButtonSpacing, pauseButtonWidthPause, pauseButtonHeightPause)) {
    gameState.buttonJumpStates['menuFromPause'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
    gameState.isClickLocked = true;
    setTimeout(() => {
      // REMOVIDO: clearInterval(gameState.timerInterval);

      stopBackgroundMusic();
      playBackgroundMusic('./assets/audio/musica-menu.ogg');
      window.gameLogic.resetGame(); // Já está bom (reseta timer, cards, etc.)
      gameState.screen = SCREENS.MENU;
      playSoundEffect(SOUND_EFFECTS.CLICK);
      gameState.isClickLocked = false;
      render();
    }, 300);
  } else if (isHovering(pauseButtonX, pauseStartY + 2 * (pauseButtonHeightPause + pauseButtonSpacing), pauseButtonWidthPause, pauseButtonHeightPause)) {
    gameState.buttonJumpStates['settingsFromPause'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
    gameState.isClickLocked = true;
    setTimeout(() => {
      gameState.screen = SCREENS.SETTINGS;
      playSoundEffect(SOUND_EFFECTS.CLICK);
      gameState.isClickLocked = false;
      render();
    }, 300);
  }
  break;


    case SCREENS.ABILITIES:
    {
        // Medidas dos botões de poderes para clique
        const btnWidth = window.getResponsiveSize(280);
        const btnHeight = window.getResponsiveSize(80);
        const spacing = window.getResponsiveSize(35);
        const startY = canvas.height * 0.40;
        const btnX = (canvas.width - btnWidth) / 2;

        // Clique nos Poderes
        if (isHovering(btnX, startY, btnWidth, btnHeight)) {
            gameState.buttonJumpStates['select_bonusTime'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
            setTimeout(() => { gameState.selectedAbility = 'bonusTime'; gameState.screen = SCREENS.ABILITY_DETAILS; render(); }, 200);
        } else if (isHovering(btnX, startY + btnHeight + spacing, btnWidth, btnHeight)) {
            gameState.buttonJumpStates['select_peek'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
            setTimeout(() => { gameState.selectedAbility = 'peek'; gameState.screen = SCREENS.ABILITY_DETAILS; render(); }, 200);
        }

        // --- CLIQUE NO BOTÃO VOLTAR (IDÊNTICO AOS PAÍSES) ---
        const backBtnW = window.getResponsiveSize(150);
        const backBtnH = window.getResponsiveSize(50);
        const backBtnX = (canvas.width - backBtnW) / 2;
        const backBtnY = canvas.height - backBtnH - window.getResponsiveSize(60);

        if (isHovering(backBtnX, backBtnY, backBtnW, backBtnH)) {
            gameState.buttonJumpStates['backFromAbilities'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
            window.playSoundEffect(SOUND_EFFECTS.CLICK);
            setTimeout(() => {
                gameState.screen = SCREENS.MENU; // Volta para o menu
                render();
            }, 200);
        }
    }
    break;
      {
        // NOVA LÓGICA: Usa getAbilitiesData em vez de getAbilityLayout
        const abilities = window.getAbilitiesData(); 
        const list = [abilities.bonusTime, abilities.peek];

        const btnWidth = getResponsiveSize(280);
        const btnHeight = getResponsiveSize(120);
        const spacing = getResponsiveSize(30);
        const startY = canvas.height * 0.35;
        const btnX = (canvas.width - btnWidth) / 2;

        let clickedAbility = false;

        // 1. Verificar clique nos botões de habilidade
        for (let i = 0; i < list.length; i++) {
            const ability = list[i];
            const y = startY + i * (btnHeight + spacing);

            if (isHovering(btnX, y, btnWidth, btnHeight)) {
                clickedAbility = true;
                // Animação do botão
                gameState.buttonJumpStates[`select_${ability.id}`] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
                gameState.isClickLocked = true;
                
                setTimeout(() => {
                    // DEFINE A HABILIDADE SELECIONADA E MUDA DE TELA
                    gameState.selectedAbility = ability.id;
                    gameState.screen = SCREENS.ABILITY_DETAILS; // Vai para a nova tela
                    
                    playSoundEffect(SOUND_EFFECTS.CLICK);
                    gameState.isClickLocked = false;
                    render();
                }, 300);
                return; // Sai da função
            }
        }

        // 2. Botão Voltar (Menu Principal)
        const backBtnW = getResponsiveSize(150);
        const backBtnH = getResponsiveSize(50);
        const backBtnX = (canvas.width - backBtnW)/2;
        const backBtnY = canvas.height - backBtnH - getResponsiveSize(30);

        if (!clickedAbility && isHovering(backBtnX, backBtnY, backBtnW, backBtnH)) {
            gameState.buttonJumpStates['backFromAbilities'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
            gameState.isClickLocked = true;
            setTimeout(() => {
                gameState.screen = SCREENS.MENU;
                playSoundEffect(SOUND_EFFECTS.CLICK);
                gameState.isClickLocked = false;
                render();
            }, 300);
        }
      }
      break;

    // TELA 2: DETALHES DA HABILIDADE (NOVO CASE)
    case SCREENS.ABILITY_DETAILS:
    {
        const abilityId = gameState.selectedAbility;
        const ability = window.getAbilitiesData()[abilityId];
        const currentLevel = gameState.abilityLevels[abilityId] || 0;
        
        // Configurações do botão de compra (devem bater com o que está no renderizador)
        const buyBtnW = getResponsiveSize(250);
        const buyBtnH = getResponsiveSize(70);
        const buyBtnX = (canvas.width - buyBtnW) / 2;
        const buyBtnY = canvas.height * 0.70;

        // 1. CLIQUE NO BOTÃO "MELHORAR / COMPRAR"
        if (isHovering(buyBtnX, buyBtnY, buyBtnW, buyBtnH)) {
            // Verifica se ainda pode evoluir
            if (currentLevel < ability.maxLevel) {
                const cost = ability.baseCost * (currentLevel + 1);

                // VERIFICA SE O JOGADOR TEM DINHEIRO
                if (gameState.playerCoins >= cost) {
                    // SUCESSO NA COMPRA
                    gameState.playerCoins -= cost;
                    gameState.abilityLevels[abilityId]++;
                    
                    // Feedback visual e sonoro
                    gameState.buttonJumpStates['upgrade_btn'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
                    window.playSoundEffect(SOUND_EFFECTS.COIN_GAIN);
                    
                    console.log(`Upgrade feito! ${ability.name} agora é Nível ${gameState.abilityLevels[abilityId]}`);
                    
                    // Salva o novo estado (moedas e níveis)
                    window.saveGameState();
                    window.render();
                } else {
                    // FALTA DINHEIRO
                    console.log("Moedas insuficientes!");
                    // Aqui poderíamos tocar um som de erro
                }
            }
        }

        // 2. CLIQUE NO BOTÃO "VOLTAR"
        const backBtnW = getResponsiveSize(150);
        const backBtnH = getResponsiveSize(50);
        const backBtnX = (canvas.width - backBtnW) / 2;
        const backBtnY = canvas.height - backBtnH - getResponsiveSize(60);

        if (isHovering(backBtnX, backBtnY, backBtnW, backBtnH)) {
            gameState.buttonJumpStates['backToAbilitiesMenu'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
            setTimeout(() => {
                gameState.screen = SCREENS.ABILITIES;
                window.render();
            }, 200);
        }
    }
    break;
      {
        const abilityKey = gameState.selectedAbility;
        if (!abilityKey) return; // Segurança

        const data = window.getAbilitiesData()[abilityKey];
        
        // Botão Evoluir (Recalculando posição igual ao render)
        const btnW = getResponsiveSize(220);
        const btnH = getResponsiveSize(60);
        const btnX = (canvas.width - btnW) / 2;
        
        const cardH = canvas.height * 0.5;
        const cardY = canvas.height * 0.15;
        const btnY = cardY + cardH + getResponsiveSize(30);

        // 1. Clique no botão EVOLUIR
        if (isHovering(btnX, btnY, btnW, btnH)) {
            const level = gameState.abilityLevels[abilityKey] || 0;
            const cost = (level + 1) * data.baseCost;
            const canBuy = gameState.playerCoins >= cost && level < data.maxLevel;
            const isMax = level >= data.maxLevel;

            if (canBuy && !isMax) {
                gameState.buttonJumpStates['evolve_action'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
                gameState.isClickLocked = true;
                setTimeout(() => {
                    gameState.playerCoins -= cost;
                    gameState.abilityLevels[abilityKey]++;
                    saveGameState();
                    playSoundEffect(SOUND_EFFECTS.UPGRADE_SUCCESS);
                    gameState.isClickLocked = false;
                    render();
                }, 300);
            } else if (!canBuy && !isMax) {
                playSoundEffect(SOUND_EFFECTS.UPGRADE_FAIL);
            }
            return;
        }

        // 2. Botão Voltar (Volta para o MENU DE HABILIDADES)
        const backBtnW = getResponsiveSize(150);
        const backBtnH = getResponsiveSize(50);
        const backBtnX = (canvas.width - backBtnW)/2;
        const backBtnY = canvas.height - backBtnH - getResponsiveSize(20);

        if (isHovering(backBtnX, backBtnY, backBtnW, backBtnH)) {
            gameState.buttonJumpStates['backToAbilitiesMenu'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
            gameState.isClickLocked = true;
            setTimeout(() => {
                gameState.screen = SCREENS.ABILITIES; // Volta para o menu de seleção
                gameState.selectedAbility = null;
                playSoundEffect(SOUND_EFFECTS.CLICK);
                gameState.isClickLocked = false;
                render();
            }, 300);
        }
      }
      break;

    case SCREENS.SETTINGS:
        {
            const settingsButtonWidth = getResponsiveSize(250);
            const settingsButtonHeight = getResponsiveSize(60);
            const settingsButtonX = (canvas.width - settingsButtonWidth) / 2;
            let settingsStartY = canvas.height * 0.4;
            if (canvas.height / canvas.width < 0.65) settingsStartY = canvas.height * 0.35;
            const buttonSpacing = getResponsiveSize(20);
            let effectiveSettingsButtonSpacing = buttonSpacing;
            if (canvas.height / canvas.width < 0.65) effectiveSettingsButtonSpacing *= 0.7;

            const toggleMusicX = settingsButtonX;
            const toggleMusicY = settingsStartY;
            const toggleMusicWidth = settingsButtonWidth;
            const toggleMusicHeight = settingsButtonHeight;

            const toggleSfxX = settingsButtonX;
            const toggleSfxY = settingsStartY + settingsButtonHeight + effectiveSettingsButtonSpacing;
            const toggleSfxWidth = settingsButtonWidth;
            const toggleSfxHeight = settingsButtonHeight;

            const backButtonWidth = getResponsiveSize(150);
            const backButtonHeight = getResponsiveSize(50);
            const backButtonX = (canvas.width - backButtonWidth) / 2;
            const backButtonY = settingsStartY + 2 * (settingsButtonHeight + effectiveSettingsButtonSpacing) + getResponsiveSize(20);

            if (isHovering(toggleMusicX, toggleMusicY, toggleMusicWidth, toggleMusicHeight)) {
                gameState.buttonJumpStates['toggleMusic'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
                gameState.isClickLocked = true;
                setTimeout(() => {
                    gameState.musicEnabled = !gameState.musicEnabled;
                    if (gameState.musicEnabled) {
                        playBackgroundMusic(window.playersData[gameState.currentCountry].gameMusic);
                    } else {
                        if (gameState.backgroundMusic) {
                            gameState.backgroundMusic.pause();
                        }
                    }
                    window.playSoundEffect(SOUND_EFFECTS.CLICK);
                    gameState.isClickLocked = false;
                    render();
                }, 300);
            } else if (isHovering(toggleSfxX, toggleSfxY, toggleSfxWidth, toggleSfxHeight)) {
                gameState.buttonJumpStates['toggleSfx'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
                gameState.isClickLocked = true;
                setTimeout(() => {
                    gameState.sfxEnabled = !gameState.sfxEnabled;
                    window.playSoundEffect(SOUND_EFFECTS.CLICK);
                    gameState.isClickLocked = false;
                    render();
                }, 300);
            } else if (isHovering(backButtonX, backButtonY, backButtonWidth, backButtonHeight)) {
                gameState.buttonJumpStates['backFromSettings'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
                gameState.isClickLocked = true;
                setTimeout(() => {
                    gameState.screen = SCREENS.MENU;
                    window.playSoundEffect(SOUND_EFFECTS.CLICK);
                    gameState.isClickLocked = false;
                    render();
                }, 300);
            }
        }
        break;

    case SCREENS.CREDITS:
      const backButtonWidthCredits = getResponsiveSize(150);
      const backButtonHeightCredits = getResponsiveSize(50);
      const backButtonXCredits = (canvas.width - backButtonWidthCredits) / 2;
      const backButtonYCredits = canvas.height - backButtonHeightCredits - getResponsiveSize(20);
      if (isHovering(backButtonXCredits, backButtonYCredits, backButtonWidthCredits, backButtonHeightCredits)) {
        gameState.buttonJumpStates['backFromCredits'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
        gameState.isClickLocked = true;
        setTimeout(() => {
          gameState.screen = SCREENS.MENU;
          playSoundEffect(SOUND_EFFECTS.CLICK);
          gameState.isClickLocked = false;
          render();
        }, 300);
      }
      break;
  }
}