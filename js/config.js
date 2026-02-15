// config.js - Central de Configurações e Validações para Reduzir Bugs
console.log('config.js carregado');

// Em gamelogic.js
window.unlockNextDifficulty = function() {
    if (!gameState.currentCountry || !gameState.currentDifficulty) return;

    const country = gameState.currentCountry;
    const difficulties = ['easy', 'medium', 'hard'];
    const currentIndex = difficulties.indexOf(gameState.currentDifficulty);

    if (currentIndex === -1 || currentIndex >= difficulties.length - 1) {
        console.log("Já está na dificuldade máxima ou inválida");
        return;
    }

    const nextDiff = difficulties[currentIndex + 1];

    // Inicializa se não existir
    if (!gameState.unlockedDifficulties[country]) {
        gameState.unlockedDifficulties[country] = [];
    }

    // Só adiciona se ainda não estiver desbloqueado
    if (!gameState.unlockedDifficulties[country].includes(nextDiff)) {
        gameState.unlockedDifficulties[country].push(nextDiff);
        console.log(`Desbloqueado: ${country} - ${nextDiff}`);
        
        // Salva imediatamente
        window.saveGameState();           // ou saveUnlockedDifficulties se existir separada
    }
};