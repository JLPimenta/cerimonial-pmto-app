# Cerimonial PM

Aplicativo móvel desenvolvido para a gestão de eventos e cerimonial da **Polícia Militar do Estado do Tocantins (PMTO)**. Construído com **React Native** e **Expo**, o projeto visa modernizar e padronizar as práticas de protocolo militar, oferecendo uma ferramenta digital ágil e segura.

## 🏗️ Arquitetura do Projeto

O projeto adota uma arquitetura modular baseada em separação de responsabilidades (Domain-Driven Design / Clean Architecture simplificada), facilitando a manutenção e a escalabilidade.

A estrutura de diretórios em `src/` está organizada da seguinte forma:

- **`/components`**: Componentes visuais reutilizáveis (Botões, Cards, Inputs). Livres de lógica de negócio complexa.
- **`/constants`**: Valores estáticos da aplicação (Cores da identidade visual, tipografia, URLs, mensagens padrão).
- **`/context`**: Gerenciamento de estado global da aplicação utilizando React Context API (ex: Autenticação, Tema).
- **`/domain`**: Regras de negócio, modelos de dados e tipagens (TypeScript interfaces) centrais da aplicação.
- **`/hooks`**: Custom Hooks do React para encapsular lógica e abstrair a comunicação com APIs externas ou recursos nativos.
- **`/navigation`**: Configurações de rotas e pilhas de navegação (utilizando React Navigation).
- **`/screens`**: Telas principais da aplicação. Atuam como orquestradoras, conectando componentes visuais e lógica de negócio.
- **`/storage`**: Módulos de persistência de dados locais (utilizando AsyncStorage) e cache.

## 🚀 Tecnologias e Bibliotecas Principais

- **Framework:** React Native + Expo (SDK 56)
- **Linguagem:** TypeScript
- **Navegação:** React Navigation
- **Armazenamento Local:** AsyncStorage
- **Recursos Nativos:**
  - `expo-file-system`, `expo-print`, `expo-sharing` (Para geração e compartilhamento de roteiros e relatórios do cerimonial em PDF)
  - `@react-native-community/datetimepicker` (Seleção de datas para eventos)

## ⚙️ Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:
- **Node.js** (LTS - versão 18 ou superior)
- **NPM** ou **Yarn**
- **Git**
- Aplicativo **Expo Go** no seu smartphone (Android ou iOS) ou um Emulador/Simulador configurado no computador.

## 🏃 Passo-a-Passo para Execução Local

Siga as instruções abaixo para rodar o projeto no seu ambiente de desenvolvimento:

**1. Clone o repositório:**
```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd cerimonial-pmto-app
```

**2. Instale as dependências:**
```bash
npm install
```

**3. Inicie o servidor de desenvolvimento (Metro Bundler):**
```bash
npx expo start
```
*(Dica: Caso ocorra algum problema de cache com as imagens e ícones, utilize `npx expo start -c` para limpar o cache).*

**4. Execute no Dispositivo ou Emulador:**
- **Celular Físico:** Abra o aplicativo **Expo Go**, escaneie o QR Code que aparecerá no terminal.
- **Emulador Android:** Pressione a tecla `a` no terminal.
- **Simulador iOS:** Pressione a tecla `i` no terminal (necessário macOS com Xcode instalado).

## 📦 Build e Publicação

Para gerar arquivos instaláveis (.apk, .aab ou .ipa), o projeto está configurado para utilizar o **EAS (Expo Application Services)**.

```bash
# Para gerar o build de produção do Android (AAB)
eas build -p android --profile production

# Para gerar um APK de teste local
eas build -p android --profile preview
```

## 📄 Licença

Uso exclusivo para a instituição Polícia Militar do Tocantins. Todos os direitos reservados.
