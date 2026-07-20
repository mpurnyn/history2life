# history2life
Use AI to help you with your homework in a very *excellent* way

A tool for bringing historical figures into the present to talk to students.

# pre-built personas
- Napoleon,
- Socrates,
- Sigmund Freud,
- Benjamin Franklin,
- Cao Xueqin


# Requirements
- OS: Arch Linux
- Python: 3.13>
- Node.js 22+ and npm (only required for local frontend builds)
- Docker
- AWS
- livekit-cli & livekit server
- UV env manager
- Python env is defined in requirements.txt

## Install Livekit CLI & Server
```
curl -sSL https://get.livekit.io/cli | bash
curl -sSL https://get.livekit.io | bash
```
## Install UV
```
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## Install scipts
- install_docker.sh 
    - shell program that install docker on a fresh Arch system (for installing locally)


# Tests
- test_docker.sh
    - spins up the docker file and runs a quick smoke test


# How to run
After installing all the requirements and adding your keys to an .env file,
run `sh ./demo.sh` it should build the container, start and give you a link to the local page you can test it with.

The Docker build compiles the browser client automatically. For local frontend development:

```sh
npm ci
npm test
npm run build
```

`npm run build` writes `app/static/js/conversation.bundle.js`. The conversation page renders a shared low-poly Three.js character and derives mouth movement from the Nova audio being played through the browser Web Audio API.

Architecture and privacy references:

- [Application architecture](docs/ARCHITECTURE.md)
- [U.S. requirements for users under 13](docs/US_UNDER_13_REQUIREMENTS.md)


# Future ideas
- add a knowledge base for each character to fine tune their responses
- replace the shared low-poly character with persona-specific models if user testing supports the added asset cost.
- add users and host demo on website