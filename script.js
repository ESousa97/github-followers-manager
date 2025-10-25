class GitHubFollowersManager {
    constructor() {
        this.username = '';
        this.token = '';
        this.followers = [];
        this.following = [];
        this.notFollowingBack = [];
        this.notFollowing = [];
        
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('checkBtn').addEventListener('click', () => this.checkFollowers());
        
        // Permitir Enter no campo de usuário
        document.getElementById('username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkFollowers();
        });
    }

    async checkFollowers() {
        this.username = document.getElementById('username').value.trim();
        this.token = document.getElementById('token').value.trim();

        if (!this.username) {
            this.showError('Por favor, insira seu usuário do GitHub');
            return;
        }

        this.hideError();
        this.showLoading();
        this.hideResults();

        try {
            // Buscar seguidores e seguindo em paralelo
            const [followers, following] = await Promise.all([
                this.fetchAllUsers(`https://api.github.com/users/${this.username}/followers`),
                this.fetchAllUsers(`https://api.github.com/users/${this.username}/following`)
            ]);

            this.followers = followers;
            this.following = following;

            // Calcular quem não te segue de volta
            this.calculateNotFollowingBack();

            // Mostrar resultados
            this.displayResults();
            
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    async fetchAllUsers(url) {
        let allUsers = [];
        let page = 1;
        const perPage = 100;

        while (true) {
            const response = await fetch(`${url}?per_page=${perPage}&page=${page}`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Usuário não encontrado');
                } else if (response.status === 403) {
                    throw new Error('Limite de requisições atingido. Tente usar um token de acesso.');
                }
                throw new Error(`Erro ao buscar dados: ${response.status}`);
            }

            const users = await response.json();
            
            if (users.length === 0) break;
            
            allUsers = allUsers.concat(users);
            
            if (users.length < perPage) break;
            
            page++;
        }

        return allUsers;
    }

    getHeaders() {
        const headers = {
            'Accept': 'application/vnd.github.v3+json'
        };

        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }

        return headers;
    }

    calculateNotFollowingBack() {
        const followerLogins = new Set(this.followers.map(user => user.login));
        const followingLogins = new Set(this.following.map(user => user.login));
        
        // Quem você segue mas não te segue de volta
        this.notFollowingBack = this.following.filter(user => 
            !followerLogins.has(user.login)
        );
        
        // Quem te segue mas você não segue de volta
        this.notFollowing = this.followers.filter(user =>
            !followingLogins.has(user.login)
        );
    }

    displayResults() {
        document.getElementById('followersCount').textContent = this.followers.length;
        document.getElementById('followingCount').textContent = this.following.length;
        document.getElementById('notFollowingBackCount').textContent = this.notFollowingBack.length;
        document.getElementById('notFollowingCount').textContent = this.notFollowing.length;

        // Lista de quem você segue mas não te segue
        const notFollowingBackContainer = document.getElementById('notFollowingBackList');
        notFollowingBackContainer.innerHTML = '';

        if (this.notFollowingBack.length === 0) {
            notFollowingBackContainer.innerHTML = '<p style="text-align: center; color: #2ecc71; font-size: 1.2rem;"><i class="fas fa-check-circle"></i> Todos que você segue te seguem de volta!</p>';
        } else {
            this.notFollowingBack.forEach(user => {
                const userCard = this.createUserCard(user, 'unfollow');
                notFollowingBackContainer.appendChild(userCard);
            });
        }

        // Lista de quem te segue mas você não segue
        const notFollowingContainer = document.getElementById('notFollowingList');
        notFollowingContainer.innerHTML = '';

        if (this.notFollowing.length === 0) {
            notFollowingContainer.innerHTML = '<p style="text-align: center; color: #2ecc71; font-size: 1.2rem;"><i class="fas fa-check-circle"></i> Você segue todos que te seguem!</p>';
        } else {
            // Adicionar aviso sobre perfis privados
            const warning = document.createElement('div');
            warning.style.cssText = 'background: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 8px; margin-bottom: 15px; color: #856404; font-size: 0.9rem;';
            warning.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <strong>Nota:</strong> Se houver diferença com o GitHub, pode incluir perfis privados/deletados que não é possível seguir.';
            notFollowingContainer.appendChild(warning);
            
            this.notFollowing.forEach(user => {
                const userCard = this.createUserCard(user, 'follow');
                notFollowingContainer.appendChild(userCard);
            });
        }

        this.showResults();
    }

    createUserCard(user, actionType) {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.id = `user-${actionType}-${user.login}`;

        let actionButton = '';
        
        if (actionType === 'unfollow') {
            actionButton = this.token 
                ? `<button class="btn btn-danger" onclick="manager.unfollowUser('${user.login}')">Deixar de seguir</button>` 
                : '<span style="color: #999; font-size: 0.9rem;">Token necessário</span>';
        } else if (actionType === 'follow') {
            actionButton = this.token 
                ? `<button class="btn btn-primary" onclick="manager.followUser('${user.login}')">Seguir de volta</button>` 
                : '<span style="color: #999; font-size: 0.9rem;">Token necessário</span>';
        }

        card.innerHTML = `
            <div class="user-info">
                <img src="${user.avatar_url}" alt="${user.login}" class="user-avatar">
                <div class="user-details">
                    <h3>${user.login}</h3>
                    <a href="${user.html_url}" target="_blank">Ver perfil</a>
                </div>
            </div>
            <div class="user-actions">
                ${actionButton}
            </div>
        `;

        return card;
    }

    async unfollowUser(username) {
        if (!this.token) {
            this.showError('Token de acesso necessário para deixar de seguir usuários');
            return;
        }

        const userCard = document.getElementById(`user-unfollow-${username}`);
        const button = userCard.querySelector('button');
        const actionsDiv = userCard.querySelector('.user-actions');

        button.disabled = true;
        button.textContent = 'Processando...';

        try {
            const response = await fetch(`https://api.github.com/user/following/${username}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Erro ao deixar de seguir: ${response.status}`);
            }

            // Remover da lista
            this.notFollowingBack = this.notFollowingBack.filter(u => u.login !== username);
            this.following = this.following.filter(u => u.login !== username);

            // Atualizar contadores
            document.getElementById('followingCount').textContent = this.following.length;
            document.getElementById('notFollowingBackCount').textContent = this.notFollowingBack.length;

            // Mostrar status de sucesso
            actionsDiv.innerHTML = '<span class="status success"><i class="fas fa-check"></i> Deixou de seguir</span>';

            // Remover o card após 2 segundos
            setTimeout(() => {
                userCard.style.transition = 'all 0.3s';
                userCard.style.opacity = '0';
                userCard.style.transform = 'scale(0.8)';
                setTimeout(() => userCard.remove(), 300);

                // Se não há mais ninguém, mostrar mensagem
                if (this.notFollowingBack.length === 0) {
                    const listContainer = document.getElementById('notFollowingBackList');
                    listContainer.innerHTML = '<p style="text-align: center; color: #2ecc71; font-size: 1.2rem;"><i class="fas fa-check-circle"></i> Todos que você segue te seguem de volta!</p>';
                }
            }, 2000);

        } catch (error) {
            button.disabled = false;
            button.textContent = 'Deixar de seguir';
            actionsDiv.innerHTML += `<span class="status error">Erro: ${error.message}</span>`;
            setTimeout(() => {
                const errorSpan = actionsDiv.querySelector('.status.error');
                if (errorSpan) errorSpan.remove();
            }, 3000);
        }
    }

    async followUser(username) {
        if (!this.token) {
            this.showError('Token de acesso necessário para seguir usuários');
            return;
        }

        const userCard = document.getElementById(`user-follow-${username}`);
        const button = userCard.querySelector('button');
        const actionsDiv = userCard.querySelector('.user-actions');

        button.disabled = true;
        button.textContent = 'Processando...';

        try {
            const response = await fetch(`https://api.github.com/user/following/${username}`, {
                method: 'PUT',
                headers: {
                    ...this.getHeaders(),
                    'Content-Length': '0'
                }
            });

            if (!response.ok) {
                // Detectar perfil privado/deletado
                if (response.status === 404) {
                    throw new Error('Perfil não encontrado ou privado');
                }
                throw new Error(`Erro ao seguir: ${response.status}`);
            }

            // Adicionar às listas
            const user = this.notFollowing.find(u => u.login === username);
            this.notFollowing = this.notFollowing.filter(u => u.login !== username);
            this.following.push(user);

            // Atualizar contadores
            document.getElementById('followingCount').textContent = this.following.length;
            document.getElementById('notFollowingCount').textContent = this.notFollowing.length;

            // Mostrar status de sucesso
            actionsDiv.innerHTML = '<span class="status success"><i class="fas fa-check"></i> Seguindo</span>';

            // Remover o card após 2 segundos
            setTimeout(() => {
                userCard.style.transition = 'all 0.3s';
                userCard.style.opacity = '0';
                userCard.style.transform = 'scale(0.8)';
                setTimeout(() => userCard.remove(), 300);

                // Se não há mais ninguém, mostrar mensagem
                if (this.notFollowing.length === 0) {
                    const listContainer = document.getElementById('notFollowingList');
                    listContainer.innerHTML = '<p style="text-align: center; color: #2ecc71; font-size: 1.2rem;"><i class="fas fa-check-circle"></i> Você segue todos que te seguem!</p>';
                }
            }, 2000);

        } catch (error) {
            button.disabled = false;
            button.textContent = 'Seguir de volta';
            
            // Se for perfil privado/deletado, marcar visualmente
            if (error.message.includes('não encontrado') || error.message.includes('privado')) {
                actionsDiv.innerHTML = '<span class="status error"><i class="fas fa-lock"></i> Perfil privado/deletado</span>';
                userCard.classList.add('private-profile');
                const avatar = userCard.querySelector('.user-avatar');
                if (avatar) avatar.classList.add('grayscale');
            } else {
                actionsDiv.innerHTML += `<span class="status error">Erro: ${error.message}</span>`;
                setTimeout(() => {
                    const errorSpan = actionsDiv.querySelector('.status.error');
                    if (errorSpan) errorSpan.remove();
                    actionsDiv.innerHTML = this.token 
                        ? `<button class="btn btn-primary" onclick="manager.followUser('${username}')">Seguir de volta</button>` 
                        : '<span style="color: #999; font-size: 0.9rem;">Token necessário</span>';
                }, 3000);
            }
        }
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        errorDiv.classList.remove('hidden');
    }

    hideError() {
        document.getElementById('error').classList.add('hidden');
    }

    showResults() {
        document.getElementById('results').classList.remove('hidden');
    }

    hideResults() {
        document.getElementById('results').classList.add('hidden');
    }
}

// Inicializar a aplicação
const manager = new GitHubFollowersManager();
