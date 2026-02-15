console.log('canvasutils.js carregado');

function getResponsiveSize(baseSize, referenceWidth = 400) {
  // === CORREÇÃO: Implementa um limite máximo de zoom ===
  const maxScaleFactor = 1.8; // Permite que o jogo seja no máximo 1.8x maior que o design original (ajustável)

  // Fator de escala inicial baseado na largura do canvas
  let scaleFactor = canvas.width / referenceWidth; 
  
  // Limita o fator de escala para evitar o "zoom" em monitores grandes
  scaleFactor = Math.min(scaleFactor, maxScaleFactor); 
  
  // Mantém a lógica original para telas muito estreitas/horizontais
  if (canvas.height / canvas.width < 0.65) scaleFactor *= 0.9;

  let size = baseSize * scaleFactor;
  return Math.max(size, 20); // Garante um tamanho mínimo
}

// Em js/canvasutils.js
/**
 * Desenha um botão estilizado com sombras, gradientes e animações.
 */
function drawButton(x, y, width, height, text, buttonId, isEnabled = true, fontSize, customColor = null, cornerRadius = 15, customFont = 'Bungee', outlineColor = null, outlineWidth = 0) {
    const anim = gameState.buttonJumpStates[buttonId] || { jumpProgress: 0, isJumping: false, jumpDirection: 1 };
    const isPressing = anim.isJumping;
    const scale = isPressing ? 0.96 : 1.0;
    
    ctx.save();

    // 1. ESCALA E POSICIONAMENTO
    ctx.translate(x + width / 2, y + height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-(x + width / 2), -(y + height / 2));

    // 2. SOMBRA PROJETADA (Fundo)
    if (isEnabled) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = isPressing ? 5 : 15;
        ctx.shadowOffsetY = isPressing ? 2 : 8;
    }

    // 3. GRADIENTE VERTICAL
    let fillStyle;
    const defaultColors = ['#ff8a00', '#e52e71'];
    const colors = (Array.isArray(customColor) && customColor.length === 2) ? customColor : defaultColors;
    
    if (Array.isArray(colors) && colors.length === 2) {
        const grad = ctx.createLinearGradient(x, y, x, y + height);
        grad.addColorStop(0, isEnabled ? colors[0] : '#666');
        grad.addColorStop(1, isEnabled ? colors[1] : '#444');
        fillStyle = grad;
    } else {
        fillStyle = isEnabled ? (customColor || '#007bff') : '#555';
    }

    // 4. DESENHO DO CORPO
    ctx.fillStyle = fillStyle;
    window.roundRect(ctx, x, y, width, height, cornerRadius, true, false);

    // 5. BRILHO SUPERIOR (Efeito Premium)
    ctx.save();
    ctx.clip();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(x, y, width, height / 2);
    ctx.restore();

    // 6. BORDA (OUTLINE) - AQUI ESTAVA O ERRO
    // Resetamos qualquer sombra para a borda ficar nítida
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    if (isEnabled) {
        // COR: Preto translúcido em vez de Branco
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'; 
        
        // ESPESSURA: Limitada a no máximo 1.2 pixels para ser sempre fina
        ctx.lineWidth = Math.min(getResponsiveSize(outlineWidth || 1), 1.2); 
        
        window.roundRect(ctx, x, y, width, height, cornerRadius, false, true);
    }

    // 7. TEXTO
    const finalFontSize = fontSize ? getResponsiveSize(fontSize) : getResponsiveSize(26);
    ctx.font = `bold ${finalFontSize}px ${customFont}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const textX = x + width / 2;
    const textY = y + height / 2;

    // Sombra do texto para contraste
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText(text, textX + 1.5, textY + 1.5);

    // Texto Principal
    ctx.fillStyle = isEnabled ? "#FFFFFF" : "#AAA";
    ctx.fillText(text, textX, textY);

    ctx.restore();
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

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';
    var lines = [];
    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = ctx.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);
    lines.forEach((l, i) => {
        ctx.fillText(l.trim(), x, y + i * lineHeight);
    });
    return lines.length * lineHeight; // Retorna altura total para layout
}

// Função para atualizar a animação de "salto" dos botões
function updateContainerJump() {
  for (const key in gameState.buttonJumpStates) {
    const anim = gameState.buttonJumpStates[key];
    if (anim.isJumping) {
      anim.jumpProgress += anim.jumpDirection * 0.05;
      if (anim.jumpProgress >= 1 || anim.jumpProgress <= 0) {
        anim.jumpDirection *= -1;
      }
      if (anim.jumpProgress <= 0 && anim.jumpDirection === -1) {
        anim.isJumping = false;
        anim.jumpProgress = 0;
      }
    }
  }
}