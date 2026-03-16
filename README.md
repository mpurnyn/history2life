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


# Future ideas
- add a knowledge base for each character to fine tune their responses
- use something to animate the images or lips in real time as they speak.
- add users and host demo on website